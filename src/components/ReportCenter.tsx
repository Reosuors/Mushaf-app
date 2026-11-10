import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Send, ImagePlus, Loader2, ChevronRight, MessageCircleWarning, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  REPORT_SECTIONS, reportStatus, refreshThreads, sendReport, compressImage, loadSaved, markSeen, devCount, photoUrl, unreadCount, Thread,
} from '../utils/report';

type View = 'list' | 'new' | 'thread';

/** Floating "report a problem" button (bottom corner) with a "وصلك رد" badge when the developer replied. */
export const ReportFab: React.FC<{ audioVisible?: boolean; onOpen: () => void }> = ({ audioVisible, onOpen }) => {
  const [unread, setUnread] = useState(unreadCount());
  useEffect(() => {
    const update = () => setUnread(unreadCount());
    window.addEventListener('mushaf-reports-changed', update);
    // On app open: check once for new replies (only when this device has sent reports).
    if (loadSaved().length) refreshThreads().then(update);
    return () => window.removeEventListener('mushaf-reports-changed', update);
  }, []);
  return (
    <div
      id="report-fab-container"
      style={{ bottom: audioVisible ? 'calc(var(--nav-h) + 4.75rem + 10px)' : 'calc(var(--nav-h) + 14px)' }}
      className="fixed left-3.5 z-30 flex items-center select-none transition-all duration-300 ease-out"
    >
      <button
        type="button"
        onClick={onOpen}
        data-testid="report-fab"
        title="إبلاغ عن مشكلة"
        aria-label="إبلاغ عن مشكلة"
        className="relative flex items-center gap-1.5 bg-[var(--bg2)] border border-[var(--gold)]/50 text-[var(--gold2)] rounded-2xl p-2.5 shadow-lg active:scale-95 cursor-pointer"
      >
        <MessageCircleWarning className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[0.6rem] font-bold rounded-full px-1.5 py-0.5 whitespace-nowrap animate-pulse">
            وصلك رد
          </span>
        )}
      </button>
    </div>
  );
};

export const ReportCenter: React.FC<{ open: boolean; onClose: () => void; initialSection: string }> = ({ open, onClose, initialSection }) => {
  const [status, setStatus] = useState<{ configured: boolean; replies: boolean } | null | 'checking'>('checking');
  const [view, setView] = useState<View>('new');
  const [threads, setThreads] = useState(loadSaved());
  const [current, setCurrent] = useState<string | null>(null);
  const [section, setSection] = useState(initialSection);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const refresh = useCallback(async () => {
    const list = await refreshThreads();
    setThreads(list);
  }, []);

  useEffect(() => {
    if (!open) return;
    setSection(initialSection);
    setNote(null);
    setStatus('checking');
    reportStatus().then(setStatus);
    const saved = loadSaved();
    setThreads(saved);
    const withReply = saved.find((s) => devCount(s.thread) > s.seenDev);
    if (withReply) {
      setCurrent(withReply.id);
      setView('thread');
    } else setView(saved.length ? 'list' : 'new');
    refresh();
    // While open, look for replies every 30 seconds.
    const timer = setInterval(refresh, 30_000);
    return () => clearInterval(timer);
  }, [open, initialSection, refresh]);

  const thread: Thread | undefined = threads.find((s) => s.id === current)?.thread;
  useEffect(() => {
    if (view === 'thread' && current) markSeen(current);
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [view, current, thread?.msgs.length]);

  if (!open) return null;

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      setImage(await compressImage(f));
    } catch {
      setNote({ ok: false, text: 'ما قدرنا نجهّز الصورة، جرّب صورة ثانية.' });
    }
  };

  const submit = async () => {
    if (busy || (!message.trim() && !image)) return;
    setBusy(true);
    setNote(null);
    try {
      const out = await sendReport({ ticket: view === 'thread' ? current || undefined : undefined, section, message: message.trim(), image });
      setMessage('');
      setImage(null);
      setThreads(loadSaved());
      setCurrent(out.ticket);
      setView('thread');
      setNote({ ok: true, text: view === 'thread' ? 'انبعتت ✅' : 'وصل البلاغ ✅ شكراً إلك، رح نشوفه بأقرب وقت' });
    } catch (e: any) {
      const code = e?.code;
      setNote({
        ok: false,
        text:
          code === 'not_configured' ? 'الإبلاغ غير مفعّل بعد'
          : code === 'rate_limited' ? 'بلاغات كثيرة بوقت قصير، جرّب بعد شوي'
          : code === 'image_too_big' ? 'الصورة كبيرة، جرّب وحدة أصغر'
          : 'ما وصل البلاغ، تأكد من الإنترنت وجرّب مرة ثانية',
      });
    } finally {
      setBusy(false);
    }
  };

  const notConfigured = status !== 'checking' && (!status || !status.configured);
  const savedCurrent = threads.find((s) => s.id === current);

  const composer = (
    <div className="space-y-2">
      {image && (
        <div className="relative inline-block">
          <img src={image} alt="" className="h-20 rounded-xl border border-[var(--border2)]" />
          <button type="button" onClick={() => setImage(null)} className="absolute -top-2 -left-2 bg-black/70 text-white rounded-full p-0.5 cursor-pointer" aria-label="إزالة الصورة">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2 bg-[var(--bg3)] border border-[var(--border2)] rounded-2xl p-1.5">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={notConfigured} className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-[var(--text2)] hover:text-[var(--gold)] disabled:opacity-40 cursor-pointer" aria-label="إرفاق صورة">
          <ImagePlus className="w-5 h-5" />
        </button>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
          rows={view === 'thread' ? 1 : 4}
          disabled={notConfigured}
          placeholder={notConfigured ? 'الإبلاغ غير مفعّل بعد' : view === 'thread' ? 'اكتب رسالة…' : 'اكتب شو المشكلة اللي صارت معك…'}
          className="flex-1 bg-transparent px-1 py-2 text-sm text-[var(--text)] resize-none focus:outline-none disabled:opacity-50"
          data-testid="report-message"
        />
        <button type="button" onClick={submit} disabled={notConfigured || busy || (!message.trim() && !image)} className="w-10 h-10 shrink-0 rounded-xl bg-[var(--gold)] text-black flex items-center justify-center disabled:opacity-40 cursor-pointer" aria-label="إرسال" data-testid="report-send">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 -scale-x-100" />}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pick} />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[320] flex items-end sm:items-center justify-center animate-fade-in" dir="rtl">
      <div onClick={onClose} className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full sm:max-w-md max-h-[92vh] bg-[var(--bg2)] border border-[var(--border2)] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-sheet-up" data-testid="report-center">
        <div className="flex items-center gap-2 p-4 border-b border-[var(--border2)]">
          {view !== 'list' && threads.length > 0 && (
            <button type="button" onClick={() => { setView('list'); setNote(null); }} className="p-1 text-[var(--text2)] cursor-pointer" aria-label="رجوع">
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          <h2 className="flex-1 text-base font-bold text-[var(--gold2)] font-amiri">
            {view === 'list' ? 'بلاغاتي' : view === 'thread' ? `بلاغ: ${savedCurrent?.section || ''}` : 'إبلاغ عن مشكلة'}
          </h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-xl text-[var(--text2)] hover:bg-[var(--bg3)] cursor-pointer" aria-label="إغلاق">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {status === 'checking' && view === 'new' && (
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--text3)]"><Loader2 className="w-3.5 h-3.5 animate-spin" /> جاري التحقق…</div>
          )}
          {notConfigured && (
            <div className="flex items-center gap-2 text-xs bg-[var(--bg3)] border border-dashed border-[var(--gold)]/50 rounded-xl p-3 text-[var(--text2)]" data-testid="report-not-configured">
              <AlertTriangle className="w-4 h-4 text-[var(--gold)] shrink-0" /> الإبلاغ غير مفعّل بعد
            </div>
          )}

          {view === 'list' && (
            <>
              <button type="button" onClick={() => { setView('new'); setNote(null); }} className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-[var(--gold)] text-black text-sm font-bold cursor-pointer">
                <Plus className="w-4 h-4" /> بلاغ جديد
              </button>
              {threads.map((s) => {
                const unread = devCount(s.thread) - s.seenDev;
                const last = s.thread?.msgs[s.thread.msgs.length - 1];
                return (
                  <button key={s.id} type="button" onClick={() => { setCurrent(s.id); setView('thread'); setNote(null); }} className="w-full text-right bg-[var(--bg3)] border border-[var(--border2)] rounded-2xl p-3 cursor-pointer">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[var(--text)]">{s.section}</span>
                      {unread > 0 ? <span className="text-[0.65rem] bg-red-500 text-white rounded-full px-2 py-0.5">وصلك رد</span> : <span className="text-[0.65rem] text-[var(--text3)]">{new Date(s.createdAt).toLocaleDateString('ar')}</span>}
                    </div>
                    {last && <p className="text-xs text-[var(--text2)] mt-1 truncate">{last.from === 'dev' ? 'المطوّر: ' : ''}{last.text || '📷 صورة'}</p>}
                  </button>
                );
              })}
            </>
          )}

          {view === 'new' && (
            <>
              <p className="text-xs text-[var(--text2)] leading-relaxed">صار معك شي غلط أو عندك اقتراح؟ اكتبلنا، بيوصل مباشرة للمطوّر وبيرد عليك هون. ما في داعي لتسجيل دخول.</p>
              <label className="block text-xs font-bold text-[var(--text)]">
                القسم
                <select value={section} onChange={(e) => setSection(e.target.value)} className="mt-1 w-full bg-[var(--bg3)] border border-[var(--border2)] rounded-xl p-2.5 text-sm text-[var(--text)] focus:outline-none" data-testid="report-section">
                  {REPORT_SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </>
          )}

          {view === 'thread' && thread && (
            <div className="space-y-2">
              {thread.msgs.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${m.from === 'user' ? 'bg-[var(--gold)] text-black rounded-br-sm' : 'bg-[var(--bg3)] text-[var(--text)] border border-[var(--border2)] rounded-bl-sm'}`}>
                    {m.from === 'dev' && <span className="block text-[0.65rem] font-bold text-[var(--gold)] mb-0.5">المطوّر</span>}
                    {m.photo && <img src={photoUrl(m.photo) || ''} alt="" className="rounded-xl mb-1 max-h-60" loading="lazy" />}
                    {m.text}
                    <span className="block text-[0.6rem] opacity-60 mt-0.5">{new Date(m.at).toLocaleString('ar', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              ))}
              {status && status !== 'checking' && !status.replies && (
                <p className="text-[0.7rem] text-center text-[var(--text3)]">الردود داخل التطبيق غير مفعّلة بعد، بس بلاغك وصل ✅</p>
              )}
              <div ref={endRef} />
            </div>
          )}
          {view === 'thread' && !thread && <p className="text-xs text-center text-[var(--text3)]">جاري التحميل…</p>}

          {note && (
            <div className={`flex items-center gap-2 text-xs rounded-xl p-2.5 ${note.ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`} data-testid="report-note">
              {note.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />} {note.text}
            </div>
          )}
        </div>

        {view !== 'list' && <div className="p-3 border-t border-[var(--border2)]">{composer}</div>}
      </div>
    </div>
  );
};
