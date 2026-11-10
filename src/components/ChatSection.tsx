import React, { useEffect, useRef, useState } from 'react';
import { Send, Loader2, BookOpen, KeyRound, ShieldAlert } from 'lucide-react';
import { SURAHS } from '../data/surahs';
import { searchQuranLocal, getDisplayAyahText, toArabicDigits, arabicSkeleton } from '../utils/quranText';

interface Citation {
  type: 'quran' | 'hadith' | 'other';
  surah?: number;
  ayah?: number;
  source?: string;
}
interface Msg {
  role: 'user' | 'assistant';
  text: string;
  citations?: Citation[];
  refused?: boolean;
}

const STOP = new Set(['ما', 'ماذا', 'من', 'في', 'عن', 'على', 'الى', 'إلى', 'هل', 'كيف', 'لماذا', 'متى', 'اين', 'أين', 'هو', 'هي', 'التي', 'الذي', 'ان', 'أن', 'إن', 'او', 'أو', 'مع', 'كان', 'شو', 'ليش', 'قديش', 'يعني', 'بدي', 'اعرف', 'قال', 'الله']);

/** Real ayahs from the local Tanzil text that share words with the question (used to ground the answer). */
async function groundAyahs(question: string) {
  const words = arabicSkeleton(question)
    .split(' ')
    .map((w) => w.replace(/[^\u0621-\u064A]/g, ''))
    .filter((w) => w.length >= 3 && !STOP.has(w));
  const score = new Map<string, { surah: number; ayah: number; text: string; n: number }>();
  for (const w of words.slice(0, 6)) {
    const { hits } = await searchQuranLocal(w.replace(/^ال/, ''), 40);
    for (const h of hits) {
      const k = `${h.surah}:${h.ayah}`;
      const cur = score.get(k) || { ...h, n: 0 };
      cur.n += 1;
      score.set(k, cur);
    }
  }
  return [...score.values()].sort((a, b) => b.n - a.n || a.text.length - b.text.length).slice(0, 5).map(({ n, ...g }) => g);
}

const QuranCitation: React.FC<{ c: Citation; onOpen: (s: number, a: number) => void }> = ({ c, onOpen }) => {
  const [text, setText] = useState('');
  useEffect(() => {
    if (c.surah && c.ayah) getDisplayAyahText(c.surah, c.ayah).then(setText).catch(() => setText(''));
  }, [c.surah, c.ayah]);
  if (!c.surah || !c.ayah) return null;
  return (
    <button
      onClick={() => onOpen(c.surah!, c.ayah!)}
      className="w-full text-start bg-[var(--bg3)] border border-[var(--border2)] rounded-xl p-3 cursor-pointer hover:border-[var(--gold)]/60 transition-all"
    >
      <div className="flex items-center gap-1.5 text-[0.7rem] font-bold text-[var(--gold)] mb-1">
        <BookOpen className="w-3.5 h-3.5" />
        <span>
          سورة {SURAHS[c.surah - 1].ar} · الآية {toArabicDigits(c.ayah)}
        </span>
      </div>
      {text && <p className="font-quran text-[1.05rem] leading-[2] text-[var(--text)]">﴿{text}﴾</p>}
    </button>
  );
};

export const ChatSection: React.FC<{ lang: string; onOpenAyah: (s: number, a: number) => void }> = ({ onOpenAyah }) => {
  const [status, setStatus] = useState<'checking' | 'ready' | 'no_key'>('checking');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;
    // The tab.bot demo copy is static (no server, no key): show the "needs key" state without calling.
    if (location.hostname.endsWith('.sites.tab.bot')) {
      setStatus('no_key');
      return;
    }
    fetch('/api/chat', { method: 'GET' })
      .then((r) => (r.ok && (r.headers.get('content-type') || '').includes('json') ? r.json() : null))
      .then((j) => alive && setStatus(j && j.configured ? 'ready' : 'no_key'))
      .catch(() => alive && setStatus('no_key'));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs, busy]);

  const send = async () => {
    const q = input.trim();
    if (!q || busy || status !== 'ready') return;
    const history = msgs.slice(-6).map((m) => ({ role: m.role, text: m.text }));
    setMsgs((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setBusy(true);
    try {
      const ground = await groundAyahs(q).catch(() => []);
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, ground, history }),
      });
      const j = await r.json().catch(() => null);
      if (!j) throw new Error('bad');
      if (j.error === 'no_key') setStatus('no_key');
      setMsgs((m) => [...m, { role: 'assistant', text: j.answer || 'لا أعلم.', citations: j.citations || [], refused: j.onTopic === false }]);
    } catch {
      setMsgs((m) => [...m, { role: 'assistant', text: 'ما قدرت أوصل للخادم، تأكد من الإنترنت وجرّب مرة ثانية.' }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-5 pb-28 flex flex-col gap-3 animate-fade-in" dir="rtl">
      <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl p-4">
        <h2 className="text-lg font-bold text-[var(--gold2)] font-amiri">اسأل 💬</h2>
        <p className="text-[0.78rem] text-[var(--text2)] mt-1 leading-relaxed">
          اسأل عن القرآن والتفسير والحديث والعبادات والسيرة. كل جواب بيذكر مصدره، والآيات بتنعرض من نص المصحف الصحيح.
        </p>
        <p className="text-[0.7rem] text-[var(--text3)] mt-2 flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>الإجابات للمساعدة وليست فتوى، راجع أهل العلم</span>
        </p>
      </div>

      {status === 'checking' && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-[var(--text3)]">
          <Loader2 className="w-4 h-4 animate-spin" /> جاري التحقق…
        </div>
      )}

      {status === 'no_key' && (
        <div className="bg-[var(--bg2)] border border-dashed border-[var(--gold)]/50 rounded-2xl p-5 text-center space-y-2" data-testid="chat-no-key">
          <KeyRound className="w-8 h-8 mx-auto text-[var(--gold)]" />
          <h3 className="text-sm font-bold text-[var(--gold2)]">يحتاج تفعيل المفتاح</h3>
          <p className="text-[0.75rem] text-[var(--text2)] leading-relaxed">
            خدمة "اسأل" بتشتغل لما ينحط مفتاح GEMINI_API_KEY بإعدادات الموقع على Vercel. باقي التطبيق شغال عادي.
          </p>
        </div>
      )}

      {msgs.map((m, i) => (
        <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
          <div
            className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[0.85rem] leading-relaxed whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-[var(--gold)] text-black'
                : m.refused
                ? 'bg-[var(--bg3)] text-[var(--text2)] border border-[var(--border2)]'
                : 'bg-[var(--bg2)] text-[var(--text)] border border-[var(--border2)]'
            }`}
          >
            <div>{m.text}</div>
            {m.citations && m.citations.length > 0 && (
              <div className="mt-2.5 space-y-2">
                {m.citations.filter((c) => c.type === 'quran').map((c, k) => (
                  <QuranCitation key={k} c={c} onOpen={onOpenAyah} />
                ))}
                {m.citations.filter((c) => c.type !== 'quran').map((c, k) => (
                  <div key={'s' + k} className="text-[0.72rem] text-[var(--text3)]">📚 {c.source}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {busy && (
        <div className="flex justify-end">
          <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl px-4 py-2.5 text-[var(--text3)] text-sm flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> عم دوّر بالمصادر…
          </div>
        </div>
      )}
      <div ref={endRef} />

      <form
        className="sticky bottom-2 flex items-center gap-2 bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl p-2 shadow-lg"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== 'ready'}
          maxLength={500}
          placeholder={status === 'ready' ? 'اكتب سؤالك الديني هون…' : 'غير مفعّل بعد'}
          aria-label="سؤالك"
          className="flex-1 bg-transparent px-2 py-2 text-sm text-[var(--text)] focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status !== 'ready' || busy || !input.trim()}
          aria-label="إرسال"
          className="w-10 h-10 rounded-xl bg-[var(--gold)] text-black flex items-center justify-center disabled:opacity-40 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
