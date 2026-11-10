// Vercel serverless function: /api/telegram — Telegram webhook. The developer's replies (Telegram "Reply" on a report)
// are saved to that report's ticket so they show up in the user's app. Registered by GET /api/report?setup=1.
import { makeStore, telegram, onTelegramUpdate, Env } from './_reportCore.js';

export default async function handler(req: any, res: any) {
  const env = process.env as Env;
  const secret = env.TELEGRAM_WEBHOOK_SECRET || '';
  if (req.method !== 'POST') return res.status(405).end();
  if (!secret || req.headers['x-telegram-bot-api-secret-token'] !== secret) return res.status(401).end();
  try {
    const update = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const out = await onTelegramUpdate(env, update, { store: makeStore(env), tg: telegram((env.TELEGRAM_BOT_TOKEN || '').trim()) });
    return res.status(200).json({ ok: true, ...out });
  } catch (e: any) {
    console.error('[api/telegram] failed', String(e?.message || e).slice(0, 200));
    return res.status(200).json({ ok: false }); // 200 so Telegram does not retry forever
  }
}
