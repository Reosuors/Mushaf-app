// Vercel serverless function: POST /api/chat  — religious Q&A ("اسأل").
// Needs the environment variable GEMINI_API_KEY (Vercel → Settings → Environment Variables).
import { answerQuestion, Generate } from './_chatCore.js';

const hits = new Map<string, number[]>();
const LIMIT = 8; // requests per minute per IP

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > LIMIT;
}

// The Android (Capacitor) and desktop (Electron) apps call this endpoint from their own origins.
const APP_ORIGINS = ['https://localhost', 'capacitor://localhost', 'http://localhost', 'app://mushaf'];

// gemini-2.5-flash is deprecated and closed to new keys (new "AQ." keys get 401 ACCESS_TOKEN_TYPE_UNSUPPORTED on it).
const DEFAULT_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-2.5-flash-lite'];
function modelsToTry(): string[] {
  const own = (process.env.GEMINI_MODEL || '').trim();
  return own ? [own, ...DEFAULT_MODELS.filter((m) => m !== own)] : DEFAULT_MODELS;
}

const HOSTS = [
  (m: string) => `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, // Google AI Studio key
  (m: string) => `https://aiplatform.googleapis.com/v1/publishers/google/models/${m}:generateContent`, // Vertex AI express-mode key
];

async function callGemini(key: string, model: string, system: string, user: string): Promise<string> {
  let last: any = null;
  for (const host of HOSTS) {
    try {
      return await callHost(host(model), key, model, system, user);
    } catch (e: any) {
      if (!last) last = e; // keep the AI Studio answer as the one reported
      if (![401, 403].includes(Number(e?.status))) throw e;
    }
  }
  throw last;
}

async function callHost(url: string, key: string, model: string, system: string, user: string): Promise<string> {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: 2048, temperature: 0.2, responseMimeType: 'application/json' },
    }),
  });
  const text = await r.text();
  if (!r.ok) {
    const err: any = new Error(`${model}: ${text.slice(0, 400)}`);
    err.status = r.status;
    throw err;
  }
  const j = JSON.parse(text);
  const parts = j?.candidates?.[0]?.content?.parts || [];
  return parts.filter((p: any) => !p.thought && typeof p.text === 'string').map((p: any) => p.text).join('');
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
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  const key = (process.env.GEMINI_API_KEY || '').trim().replace(/^['"]|['"]$/g, '') || undefined;
  if (req.method === 'GET') {
    res.status(200).json({ ok: true, configured: !!key });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method' });
    return;
  }
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) {
    res.status(429).json({ ok: false, error: 'rate_limited', answer: 'أسئلة كثيرة بوقت قصير، جرّب بعد دقيقة.' });
    return;
  }
  let generate: Generate | null = null;
  if (key) {
    generate = async (system, user) => {
      let lastErr: any = null;
      for (const model of modelsToTry()) {
        try {
          return await callGemini(key, model, system, user);
        } catch (e: any) {
          lastErr = e;
          // Try the next model only when this one is unavailable to this key; other errors stop here.
          if (![400, 401, 403, 404].includes(Number(e?.status))) throw e;
        }
      }
      throw lastErr || new Error('no model available');
    };
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const out = await answerQuestion(body, generate);
    res.status(out.error === 'no_key' ? 503 : 200).json(out);
  } catch (e: any) {
    const raw = String(e?.message || e || 'unknown');
    const detail = (key ? raw.split(key).join('[key]') : raw).replace(/AIza[0-9A-Za-z_\-]{20,}|AQ\.[0-9A-Za-z_\-.]{20,}/g, '[key]').slice(0, 600);
    const status = e?.status || e?.code || e?.error?.code || null;
    // Shape of the configured key only (never its content), to spot a truncated or mis-pasted value.
    const rawKey = process.env.GEMINI_API_KEY || '';
    const keyShape = { length: key ? key.length : 0, prefix: key ? key.slice(0, 3) : '', trimmed: rawKey !== key, cleanChars: !!key && /^[A-Za-z0-9._\-]+$/.test(key) };
    console.error('[api/chat] generate failed', status, detail, keyShape);
    res.status(500).json({ ok: false, error: 'server', status, detail, keyShape, answer: 'صار خطأ بالخادم، جرّب مرة ثانية.' });
  }
}
