// "إبلاغ عن مشكلة": client side. Reports go to /api/report on the Vercel site (the packaged apps call it remotely).
// Tickets are anonymous: their random ids live only in this device's localStorage.

export const VERCEL_ORIGIN = 'https://mishafapp32.vercel.app';
const IS_NATIVE = !!(window as any).Capacitor?.isNativePlatform?.();
const IS_DESKTOP = location.protocol === 'app:' || location.protocol === 'file:' || /Electron/i.test(navigator.userAgent);
export const IS_PACKAGED_APP = IS_NATIVE || IS_DESKTOP;
export const API_BASE = IS_PACKAGED_APP ? VERCEL_ORIGIN : '';
export const REPORT_API = API_BASE + '/api/report';
export const PLATFORM: 'web' | 'android' | 'desktop' = IS_NATIVE ? 'android' : IS_DESKTOP ? 'desktop' : 'web';
export const APP_VERSION: string = (import.meta as any).env?.VITE_APP_VERSION || '1.1.0';

export const REPORT_SECTIONS = ['القرآن', 'القارئ', 'الرقية', 'الأذكار', 'مواقيت الصلاة', 'ادعمنا', 'الويدجت', 'أخرى'];

export function sectionLabelFor(section: string, audioVisible = false): string {
  if (section === 'quran') return audioVisible ? 'القارئ' : 'القرآن';
  return ({ ruqyah: 'الرقية', azkar: 'الأذكار', prayer: 'مواقيت الصلاة', support: 'ادعمنا' } as Record<string, string>)[section] || 'أخرى';
}

export interface ThreadMsg {
  from: 'user' | 'dev';
  text: string;
  at: number;
  photo: string | null;
}
export interface Thread {
  id: string;
  section: string;
  createdAt: number;
  msgs: ThreadMsg[];
}
interface Saved {
  id: string;
  section: string;
  createdAt: number;
  seenDev: number; // how many developer replies the user has already seen
  thread?: Thread;
}

const KEY = 'mushaf_reports_v1';
export function loadSaved(): Saved[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function save(list: Saved[]) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 30)));
  window.dispatchEvent(new Event('mushaf-reports-changed'));
}
export function devCount(t?: Thread) {
  return t ? t.msgs.filter((m) => m.from === 'dev').length : 0;
}
export function unreadCount(): number {
  return loadSaved().reduce((n, s) => n + Math.max(0, devCount(s.thread) - s.seenDev), 0);
}
export function markSeen(id: string) {
  save(loadSaved().map((s) => (s.id === id ? { ...s, seenDev: devCount(s.thread) } : s)));
}
export function photoUrl(p: string | null) {
  return p ? API_BASE + p : null;
}

export async function reportStatus(): Promise<{ configured: boolean; replies: boolean } | null> {
  try {
    const r = await fetch(REPORT_API + '?t=' + Date.now(), { cache: 'no-store' });
    const j = await r.json();
    return j && j.ok ? { configured: !!j.configured, replies: !!j.replies } : null;
  } catch {
    return null;
  }
}

/** Refresh every saved ticket's thread from the server; returns the saved list. */
export async function refreshThreads(): Promise<Saved[]> {
  const list = loadSaved();
  if (!list.length) return list;
  try {
    const r = await fetch(`${REPORT_API}?tickets=${list.map((s) => s.id).join(',')}&t=${Date.now()}`, { cache: 'no-store' });
    const j = await r.json();
    if (!j?.ok || !Array.isArray(j.threads)) return list;
    const byId = new Map<string, Thread>(j.threads.map((t: Thread) => [t.id, t]));
    const next = list.map((s) => (byId.has(s.id) ? { ...s, thread: byId.get(s.id) } : s));
    save(next);
    return next;
  } catch {
    return list;
  }
}

export async function sendReport(opts: { ticket?: string; section: string; message: string; image?: string | null }) {
  const r = await fetch(REPORT_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ ...opts, image: opts.image || undefined, platform: PLATFORM, version: APP_VERSION }),
  });
  const j = await r.json().catch(() => null);
  if (!j || !j.ok) throw Object.assign(new Error(j?.error || 'failed'), { code: j?.error || 'failed' });
  const list = loadSaved();
  const thread: Thread | undefined = j.thread || undefined;
  const existing = list.find((s) => s.id === j.ticket);
  if (existing) save(list.map((s) => (s.id === j.ticket ? { ...s, thread: thread || s.thread } : s)));
  else save([{ id: j.ticket, section: opts.section, createdAt: Date.now(), seenDev: 0, thread }, ...list]);
  return { ticket: j.ticket as string, replies: !!j.replies };
}

/** Shrink a picked image to a JPEG of at most ~1 MB (longest side 1600px, lower quality if needed). */
export async function compressImage(file: File, maxBytes = 1_000_000): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, bad) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = bad;
      i.src = url;
    });
    let scale = Math.min(1, 1600 / Math.max(img.width, img.height));
    for (let attempt = 0; attempt < 8; attempt++) {
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * scale));
      c.height = Math.max(1, Math.round(img.height * scale));
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      for (const q of [0.82, 0.7, 0.58, 0.45]) {
        const data = c.toDataURL('image/jpeg', q);
        if ((data.length - 23) * 0.75 <= maxBytes) return data;
      }
      scale *= 0.75;
    }
    throw new Error('image_too_big');
  } finally {
    URL.revokeObjectURL(url);
  }
}
