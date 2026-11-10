// Vercel serverless function: /api/report — "إبلاغ عن مشكلة" (report a problem), delivered to the developer's Telegram.
// Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_WEBHOOK_SECRET (replies), and Upstash Redis
// (KV_REST_API_URL + KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN) for two-way replies.
import { makeStore, telegram, submit, loadTicket, publicThread, Env } from './_reportCore.js';

const APP_ORIGINS = ['https://localhost', 'capacitor://localhost', 'http://localhost', 'app://mushaf'];
const LIMIT = 6; // reports per 10 minutes per IP
const hits = new Map<string, number[]>();

async function rateLimited(ip: string, store: ReturnType<typeof makeStore>): Promise<boolean> {
  if (store) {
    try {
      return (await store.incr(`mushaf:rl:${ip}`, 600)) > LIMIT;
    } catch {
      /* fall back to memory */
    }
  }
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 600_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > LIMIT;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  const origin = req.headers?.origin;
  if (origin && APP_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();

  const env = process.env as Env;
  const token = (env.TELEGRAM_BOT_TOKEN || '').trim();
  const chatId = (env.TELEGRAM_CHAT_ID || '').trim();
  const store = makeStore(env);
  const configured = !!(token && chatId);
  const q = req.query || {};

  try {
    if (req.method === 'GET') {
      if (q.setup) return res.status(200).json(await setup(req, env, token, chatId, !!store));
      if (q.ticket && q.photo) {
        // Photo in a thread: proxied so the bot token never reaches the app.
        if (!store || !token) return res.status(404).end();
        const t = await loadTicket(store, String(q.ticket));
        const fileId = String(q.photo);
        if (!t || !t.msgs.some((m) => m.photo === fileId)) return res.status(404).end();
        const r = await fetch(await telegram(token).fileUrl(fileId));
        if (!r.ok) return res.status(502).end();
        res.setHeader('Content-Type', r.headers.get('content-type') || 'image/jpeg');
        res.setHeader('Cache-Control', 'private, max-age=86400');
        return res.status(200).send(Buffer.from(await r.arrayBuffer()));
      }
      if (q.tickets) {
        if (!store) return res.status(200).json({ ok: true, configured, replies: false, threads: [] });
        const ids = String(q.tickets).split(',').slice(0, 30);
        const threads = [];
        for (const id of ids) {
          const t = await loadTicket(store, id);
          if (t) threads.push(publicThread(t, '/api/report'));
        }
        return res.status(200).json({ ok: true, configured, replies: true, threads });
      }
      return res.status(200).json({ ok: true, configured, replies: !!store });
    }
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });
    if (!configured) return res.status(503).json({ ok: false, error: 'not_configured' });
    const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
    if (await rateLimited(ip, store)) return res.status(429).json({ ok: false, error: 'rate_limited' });
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const out = await submit({ ...env, TELEGRAM_CHAT_ID: chatId }, body, { store, tg: telegram(token) });
    if (out.body.ok) {
      const t = store ? await loadTicket(store, out.body.ticket as string) : null;
      return res.status(200).json({ ...out.body, thread: t ? publicThread(t, '/api/report') : null });
    }
    return res.status(out.status).json(out.body);
  } catch (e: any) {
    const detail = String(e?.message || e).split(token || '\u0000').join('[token]').slice(0, 300);
    console.error('[api/report] failed', detail);
    return res.status(e?.code === 'image' ? 413 : 500).json({ ok: false, error: e?.code === 'image' ? 'image_too_big' : 'server', detail });
  }
}

/** Setup helper for the developer: finds his chat id and registers the reply webhook. */
async function setup(req: any, env: Env, token: string, chatId: string, hasStore: boolean) {
  const steps: Record<string, any> = {
    TELEGRAM_BOT_TOKEN: token ? 'موجود ✅' : 'ناقص ❌',
    TELEGRAM_CHAT_ID: chatId ? 'موجود ✅' : 'ناقص ❌',
    TELEGRAM_WEBHOOK_SECRET: env.TELEGRAM_WEBHOOK_SECRET ? 'موجود ✅' : 'ناقص ❌ (للردود)',
    storage: hasStore ? 'Upstash Redis موصول ✅' : 'ناقص ❌ (للردود)',
  };
  if (!token) return { ok: false, steps, next: 'أنشئ بوت من @BotFather وحط التوكن بـ TELEGRAM_BOT_TOKEN ثم Redeploy' };
  const tg = telegram(token);
  if (!chatId) {
    // Webhook must be off for getUpdates to work.
    await tg.call('deleteWebhook', { drop_pending_updates: false }).catch(() => {});
    const updates: any[] = await tg.call('getUpdates', { limit: 20 }).catch(() => []);
    const seen = new Map<string, string>();
    for (const u of updates.reverse()) {
      const c = u.message?.chat || u.edited_message?.chat;
      if (c && !seen.has(String(c.id))) seen.set(String(c.id), c.first_name || c.title || '');
    }
    return {
      ok: true,
      steps,
      chats: [...seen].map(([id, first_name]) => ({ id, first_name })),
      next: seen.size ? 'انسخ الرقم (id) تبعك وحطه بـ TELEGRAM_CHAT_ID ثم Redeploy' : 'ابعت أي رسالة للبوت بتيليغرام، وبعدين حدّث هالصفحة',
    };
  }
  if (env.TELEGRAM_WEBHOOK_SECRET && hasStore) {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const url = `https://${host}/api/telegram`;
    await tg.call('setWebhook', { url, secret_token: env.TELEGRAM_WEBHOOK_SECRET, allowed_updates: ['message', 'edited_message'] });
    const info = await tg.call('getWebhookInfo', {});
    return { ok: true, steps, webhook: { url: info.url, pending: info.pending_update_count, last_error: info.last_error_message || null }, next: 'كل شي جاهز ✅ جرّب تبعت بلاغ من التطبيق وردّ عليه بتيليغرام (Reply)' };
  }
  return { ok: true, steps, next: 'البلاغات شغالة باتجاه واحد ✅ للردود: حط TELEGRAM_WEBHOOK_SECRET ووصّل Upstash Redis من Storage ثم Redeploy وافتح هالصفحة مرة ثانية' };
}
