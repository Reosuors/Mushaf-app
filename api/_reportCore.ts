// Shared logic for "إبلاغ عن مشكلة" (problem reports), used by api/report.ts and api/telegram.ts, tested in test/app.test.mjs.
// Reports go to the developer's Telegram through a bot. Replies he sends with Telegram's "Reply" come back to the
// user's app through a small Redis store (Upstash REST). No accounts: a ticket is a random id kept in the user's device.

export const SECTIONS = ['القرآن', 'القارئ', 'الرقية', 'الأذكار', 'مواقيت الصلاة', 'ادعمنا', 'الويدجت', 'أخرى'];
export const TICKET_TTL = 60 * 60 * 24 * 30; // 30 days
export const MAX_TEXT = 2000;
export const MAX_IMAGE_B64 = 1_450_000; // ~1 MB JPEG as base64

export interface Msg {
  from: 'user' | 'dev';
  text: string;
  photo?: string | null; // Telegram file_id
  at: number;
}
export interface Ticket {
  id: string;
  section: string;
  platform: string;
  version: string;
  createdAt: number;
  root: number; // Telegram message_id of the first report message
  msgs: Msg[];
}

export interface Store {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSec: number): Promise<void>;
  incr(key: string, ttlSec: number): Promise<number>;
}

export interface Env {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
  KV_REST_API_URL?: string;
  KV_REST_API_TOKEN?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
}

type Fetch = typeof fetch;

/** Upstash Redis over its REST API (works with Vercel's Upstash integration env names or Upstash's own). */
export function makeStore(env: Env, f: Fetch = fetch): Store | null {
  const url = (env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL || '').replace(/\/$/, '');
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN || '';
  if (!url || !token) return null;
  const cmd = async (args: (string | number)[]) => {
    const r = await f(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
    const j: any = await r.json().catch(() => null);
    if (!r.ok || !j || j.error) throw new Error('store: ' + (j?.error || r.status));
    return j.result;
  };
  return {
    get: async (k) => (await cmd(['GET', k])) ?? null,
    set: async (k, v, ttl) => {
      await cmd(['SET', k, v, 'EX', ttl]);
    },
    incr: async (k, ttl) => {
      const n = Number(await cmd(['INCR', k]));
      if (n === 1) await cmd(['EXPIRE', k, ttl]);
      return n;
    },
  };
}

/** In-memory store for tests and local runs. */
export function memoryStore(): Store & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    get: async (k) => data.get(k) ?? null,
    set: async (k, v) => {
      data.set(k, v);
    },
    incr: async (k) => {
      const n = Number(data.get(k) || 0) + 1;
      data.set(k, String(n));
      return n;
    },
  };
}

export function telegram(token: string, f: Fetch = fetch) {
  const base = `https://api.telegram.org/bot${token}`;
  const call = async (method: string, body: any) => {
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
    const r = await f(`${base}/${method}`, isForm ? { method: 'POST', body } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j: any = await r.json().catch(() => null);
    if (!j || !j.ok) {
      const e: any = new Error(`telegram ${method}: ${j?.description || r.status}`);
      e.status = j?.error_code || r.status;
      throw e;
    }
    return j.result;
  };
  return {
    call,
    async send(chatId: string, text: string, imageB64: string | null, replyTo?: number) {
      const reply = replyTo ? { reply_parameters: { message_id: replyTo, allow_sending_without_reply: true } } : {};
      if (imageB64) {
        const fd = new FormData();
        fd.append('chat_id', chatId);
        fd.append('caption', text.slice(0, 1024));
        if (replyTo) fd.append('reply_parameters', JSON.stringify(reply.reply_parameters));
        const bytes = Uint8Array.from(atob(imageB64), (c) => c.charCodeAt(0));
        fd.append('photo', new Blob([bytes], { type: 'image/jpeg' }), 'report.jpg');
        const m = await call('sendPhoto', fd);
        const sizes = m.photo || [];
        const photo = sizes.length ? sizes[sizes.length - 1].file_id : null;
        // Telegram captions stop at 1024 characters: send the rest as its own message.
        if (text.length > 1024) await call('sendMessage', { chat_id: chatId, text: text.slice(1024), reply_parameters: { message_id: m.message_id } });
        return { message_id: m.message_id as number, photo };
      }
      const m = await call('sendMessage', { chat_id: chatId, text: text.slice(0, 4096), ...reply });
      return { message_id: m.message_id as number, photo: null };
    },
    fileUrl: async (fileId: string) => {
      const file = await call('getFile', { file_id: fileId });
      return `https://api.telegram.org/file/bot${token}/${file.file_path}`;
    },
  };
}

export function newTicketId(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

export function cleanImage(img: unknown): string | null {
  if (typeof img !== 'string' || !img) return null;
  const b64 = img.replace(/^data:image\/[a-z+]+;base64,/i, '').replace(/\s/g, '');
  if (b64.length > MAX_IMAGE_B64 || !/^[A-Za-z0-9+/=]+$/.test(b64)) throw Object.assign(new Error('image_too_big'), { code: 'image' });
  return b64;
}

export function formatReport(t: { section: string; platform: string; version: string; ticket: string }, text: string, followUp: boolean, now = new Date()): string {
  const time = now.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const head = followUp ? '💬 متابعة على بلاغ' : '🆕 بلاغ جديد';
  return `${head}\n📍 القسم: ${t.section}\n📱 المنصة: ${t.platform} · الإصدار ${t.version}\n🕒 ${time}\n🎫 ${t.ticket.slice(0, 8)}\n\n${text}\n\n↩️ ردّ على هالرسالة (Reply) ليوصل ردك للمستخدم`;
}

export const ticketKey = (id: string) => `mushaf:t:${id}`;
export const msgKey = (mid: number) => `mushaf:m:${mid}`;

export async function loadTicket(store: Store, id: string): Promise<Ticket | null> {
  if (!/^[0-9a-f]{32}$/.test(id)) return null;
  const raw = await store.get(ticketKey(id));
  if (!raw) return null;
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : (raw as any);
  } catch {
    return null;
  }
}

export async function saveTicket(store: Store, t: Ticket) {
  await store.set(ticketKey(t.id), JSON.stringify(t), TICKET_TTL);
}

export interface SubmitInput {
  ticket?: string;
  section?: string;
  message?: string;
  image?: string;
  platform?: string;
  version?: string;
}

/** A new report (no ticket) or a follow-up in an existing ticket's thread. */
export async function submit(env: Env, input: SubmitInput, deps: { store: Store | null; tg: ReturnType<typeof telegram> }) {
  const text = String(input.message || '').trim().slice(0, MAX_TEXT);
  const image = cleanImage(input.image);
  if (!text && !image) return { status: 400, body: { ok: false, error: 'empty' } };
  const platform = ['web', 'android', 'desktop'].includes(String(input.platform)) ? String(input.platform) : 'web';
  const version = String(input.version || '').slice(0, 20) || '?';
  const chatId = String(env.TELEGRAM_CHAT_ID);
  const { store, tg } = deps;

  if (input.ticket) {
    if (!store) return { status: 400, body: { ok: false, error: 'replies_off' } };
    const t = await loadTicket(store, String(input.ticket));
    if (!t) return { status: 404, body: { ok: false, error: 'no_ticket' } };
    const sent = await tg.send(chatId, formatReport({ ...t, ticket: t.id }, text, true), image, t.root);
    t.msgs.push({ from: 'user', text, photo: sent.photo, at: Date.now() });
    await saveTicket(store, t);
    await store.set(msgKey(sent.message_id), t.id, TICKET_TTL);
    return { status: 200, body: { ok: true, ticket: t.id, replies: true, msgs: t.msgs } };
  }

  const section = SECTIONS.includes(String(input.section)) ? String(input.section) : 'أخرى';
  const id = newTicketId();
  const sent = await tg.send(chatId, formatReport({ section, platform, version, ticket: id }, text, false), image);
  const t: Ticket = { id, section, platform, version, createdAt: Date.now(), root: sent.message_id, msgs: [{ from: 'user', text, photo: sent.photo, at: Date.now() }] };
  if (store) {
    await saveTicket(store, t);
    await store.set(msgKey(sent.message_id), id, TICKET_TTL);
  }
  return { status: 200, body: { ok: true, ticket: id, replies: !!store, msgs: t.msgs } };
}

/** Telegram webhook update: a developer reply (Telegram "Reply") is attached to the ticket it answers. */
export async function onTelegramUpdate(env: Env, update: any, deps: { store: Store | null; tg: ReturnType<typeof telegram> }) {
  const m = update?.message || update?.edited_message;
  if (!m || String(m.chat?.id) !== String(env.TELEGRAM_CHAT_ID)) return { handled: false, why: 'not_owner' };
  if (!deps.store) return { handled: false, why: 'no_store' };
  const replyTo = m.reply_to_message?.message_id;
  const text = String(m.text || m.caption || '').slice(0, MAX_TEXT);
  if (!replyTo) {
    if (text.startsWith('/')) return { handled: false, why: 'command' };
    await deps.tg.call('sendMessage', { chat_id: m.chat.id, text: 'ℹ️ حتى يوصل ردك للمستخدم: اضغط مطوّل على رسالة البلاغ ← Reply، واكتب ردك.' }).catch(() => {});
    return { handled: false, why: 'not_a_reply' };
  }
  const id = await deps.store.get(msgKey(replyTo));
  const t = id ? await loadTicket(deps.store, String(id)) : null;
  if (!t) {
    await deps.tg.call('sendMessage', { chat_id: m.chat.id, text: '⚠️ ما لقيت هالبلاغ (يمكن انتهت مدته، 30 يوم).', reply_parameters: { message_id: m.message_id } }).catch(() => {});
    return { handled: false, why: 'unknown_ticket' };
  }
  const sizes = m.photo || [];
  const photo = sizes.length ? sizes[sizes.length - 1].file_id : null;
  if (!text && !photo) return { handled: false, why: 'empty' };
  t.msgs.push({ from: 'dev', text, photo, at: Date.now() });
  await saveTicket(deps.store, t);
  await deps.store.set(msgKey(m.message_id), t.id, TICKET_TTL);
  await deps.tg.call('setMessageReaction', { chat_id: m.chat.id, message_id: m.message_id, reaction: [{ type: 'emoji', emoji: '👍' }] }).catch(() => {});
  return { handled: true, ticket: t.id };
}

/** What the app shows for a ticket: messages with photo links proxied through our server (never the bot token). */
export function publicThread(t: Ticket, base: string) {
  return {
    id: t.id,
    section: t.section,
    createdAt: t.createdAt,
    msgs: t.msgs.map((m) => ({ from: m.from, text: m.text, at: m.at, photo: m.photo ? `${base}?ticket=${t.id}&photo=${encodeURIComponent(m.photo)}` : null })),
  };
}
