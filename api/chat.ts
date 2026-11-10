// Vercel serverless function: POST /api/chat  — religious Q&A ("اسأل").
// Needs the environment variable GEMINI_API_KEY (Vercel → Settings → Environment Variables).
import { GoogleGenAI } from '@google/genai';
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

export default async function handler(req: any, res: any) {
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
  const key = process.env.GEMINI_API_KEY;
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
    const ai = new GoogleGenAI({ apiKey: key });
    generate = async (system, user) => {
      const r = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: user,
        config: { systemInstruction: system, maxOutputTokens: 700, temperature: 0.2, responseMimeType: 'application/json' },
      });
      return r.text || '';
    };
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const out = await answerQuestion(body, generate);
    res.status(out.error === 'no_key' ? 503 : 200).json(out);
  } catch (e: any) {
    res.status(500).json({ ok: false, error: 'server', answer: 'صار خطأ بالخادم، جرّب مرة ثانية.' });
  }
}
