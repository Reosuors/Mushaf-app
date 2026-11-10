import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Menu, ChevronLeft, BookMarked, Sparkles, ArrowRight, Play, Pause, BookOpenText, Bookmark, BookmarkCheck, Copy, Check, Share2, ChevronRight, Minus, Plus, X, Loader2 } from 'lucide-react';
import { AyahData, DesignStyleId, Section } from '../types';
import { SURAHS } from '../data/surahs';
import { normalizeArabic } from '../utils/quranSearch';
import { getAyahOfDayRef, getDisplayAyahText, toArabicDigits, juzFirstAyah, getPage, getJuz, getSurahAyahs, getBasmalaText, stripBasmala } from '../utils/quranText';
import { loadReadingProgress, toggleBookmark, saveLastReadOnly } from '../utils/readingProgress';
import { hapticFeedback } from '../utils/haptics';

/* The five alternative designs (التصاميم): DesignHome = home + surah list, DesignReader = surah reader.
   The default design ("modern") keeps QuranSection + SurahView. */

interface HomeProps {
  design: DesignStyleId;
  onSelectSurah: (s: number, a?: number) => void;
  onSelectSection: (s: Section) => void;
  onOpenGlobalSearch: () => void;
  onOpenKhatmah?: () => void;
  onOpenMemTest?: () => void;
  onOpenDrawer?: () => void;
}

const TILES: { id: Section | 'juz' | 'search' | 'khatmah'; icon: string; label: string }[] = [
  { id: 'quran', icon: '📖', label: 'السور' },
  { id: 'juz', icon: '🧭', label: 'الأجزاء' },
  { id: 'ruqyah', icon: '🛡️', label: 'الرقية الشرعية' },
  { id: 'azkar', icon: '🤲', label: 'الأذكار' },
  { id: 'prayer', icon: '🕌', label: 'مواقيت الصلاة' },
  { id: 'tasbih', icon: '📿', label: 'التسبيح' },
  { id: 'search', icon: '🔎', label: 'بحث في القرآن' },
  { id: 'asma', icon: '☪️', label: 'أسماء الله' },
];

export const DesignHome: React.FC<HomeProps> = ({ design, onSelectSurah, onSelectSection, onOpenGlobalSearch, onOpenKhatmah, onOpenDrawer }) => {
  const [q, setQ] = useState('');
  const [showJuz, setShowJuz] = useState(false);
  const [daily, setDaily] = useState('');
  const ref = getAyahOfDayRef(new Date());
  const last = loadReadingProgress().lastRead;
  useEffect(() => { getDisplayAyahText(ref.surah, ref.ayah).then(setDaily).catch(() => setDaily('')); }, [ref.surah, ref.ayah]);

  const list = useMemo(() => {
    const t = q.trim();
    if (!t) return SURAHS;
    const n = normalizeArabic(t);
    return SURAHS.filter((s) => normalizeArabic(s.ar).includes(n) || s.en.toLowerCase().includes(t.toLowerCase()) || String(s.n) === t);
  }, [q]);

  const tile = (id: (typeof TILES)[number]['id']) => {
    if (id === 'juz') return setShowJuz((v) => !v);
    if (id === 'search') return onOpenGlobalSearch();
    if (id === 'khatmah') return onOpenKhatmah?.();
    if (id === 'quran') return document.getElementById('dh-surahs')?.scrollIntoView({ behavior: 'smooth' });
    onSelectSection(id as Section);
  };

  const searchBox = (cls: string) => (
    <label className={cls}>
      <Search className="w-4 h-4 opacity-60 shrink-0" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن سورة بالاسم أو الرقم" className="bg-transparent outline-none flex-1 min-w-0" />
    </label>
  );
  const dailyLabel = `${SURAHS[ref.surah - 1].ar} : ${toArabicDigits(ref.ayah)}`;
  const juzGrid = showJuz && (
    <div className="dh-juz">
      {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
        <button key={j} onClick={() => { const f = juzFirstAyah(j); onSelectSurah(f.surah, f.ayah); }}>
          <b>{toArabicDigits(j)}</b><span>{SURAHS[juzFirstAyah(j).surah - 1].ar}</span>
        </button>
      ))}
    </div>
  );

  if (design === 'mushaf_page') {
    return (
      <div className="dh dh-mushaf" dir="rtl">
        <div className="mh-cartouche"><span>المصحف الشريف</span><small>برواية حفص عن عاصم</small></div>
        {last && (
          <button className="mh-continue" onClick={() => onSelectSurah(last.surahNumber, last.ayahNumber)}>
            ❁ تابع القراءة: سورة {last.surahNameAr} — الآية {toArabicDigits(last.ayahNumber)}
          </button>
        )}
        <div className="mh-daily mushaf-page">
          <div className="mushaf-page-head"><span>آية اليوم</span><span>{dailyLabel}</span></div>
          <p className="mushaf-text text-center" style={{ fontSize: 24 }}>{daily} <span className="ayah-marker">﴿{toArabicDigits(ref.ayah)}﴾</span></p>
        </div>
        {searchBox('mh-search')}
        <div className="mh-tabs">
          <button className={!showJuz ? 'on' : ''} onClick={() => setShowJuz(false)}>فهرس السور</button>
          <button className={showJuz ? 'on' : ''} onClick={() => setShowJuz(true)}>فهرس الأجزاء</button>
        </div>
        {juzGrid}
        {!showJuz && (
          <table className="mh-index" id="dh-surahs">
            <thead><tr><th>رقم</th><th>السورة</th><th>آياتها</th><th>نزولها</th><th>الصفحة</th></tr></thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.n} onClick={() => onSelectSurah(s.n)} className="cursor-pointer">
                  <td>{toArabicDigits(s.n)}</td><td className="font-amiri font-bold">{s.ar}</td><td>{toArabicDigits(s.a)}</td><td>{s.t}</td><td>{toArabicDigits(getPage(s.n, 1))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  if (design === 'cards') {
    return (
      <div className="dh dh-cards" dir="rtl">
        <div className="ch-hero">
          <div className="text-xs opacity-80">السلام عليكم 👋</div>
          <div className="font-amiri text-2xl font-bold">ماذا تقرأ اليوم؟</div>
          {last ? (
            <button className="ch-hero-btn" onClick={() => onSelectSurah(last.surahNumber, last.ayahNumber)}>
              <BookMarked className="w-4 h-4" /> تابع سورة {last.surahNameAr} · آية {toArabicDigits(last.ayahNumber)}
            </button>
          ) : (
            <button className="ch-hero-btn" onClick={() => onSelectSurah(1)}><BookMarked className="w-4 h-4" /> ابدأ من الفاتحة</button>
          )}
        </div>
        <div className="ch-chips">
          {TILES.slice(1).map((t) => <button key={t.id} onClick={() => tile(t.id)}><span>{t.icon}</span>{t.label}</button>)}
        </div>
        {juzGrid}
        <div className="ch-daily" onClick={() => onSelectSurah(ref.surah, ref.ayah)}>
          <div className="flex items-center gap-1 text-xs font-bold"><Sparkles className="w-3.5 h-3.5" /> آية اليوم</div>
          <p className="font-quran text-xl leading-[2.1] my-2">{daily}</p>
          <div className="text-xs opacity-80">{dailyLabel}</div>
        </div>
        {searchBox('ch-search')}
        <div className="ch-grid" id="dh-surahs">
          {list.map((s) => (
            <button key={s.n} className="ch-surah" onClick={() => onSelectSurah(s.n)}>
              <span className="ch-num">{toArabicDigits(s.n)}</span>
              <span className="font-amiri text-2xl font-bold leading-tight">{s.ar}</span>
              <span className="text-[0.65rem] opacity-70">{s.en}</span>
              <span className="ch-meta">{s.t} · {toArabicDigits(s.a)} آية</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (design === 'minimal') {
    return (
      <div className="dh dh-minimal" dir="rtl">
        <div className="mn-top">
          <span className="font-amiri text-3xl">القرآن</span>
          <button onClick={onOpenDrawer} aria-label="القائمة" className="mn-menu"><Menu className="w-5 h-5" /></button>
        </div>
        {searchBox('mn-search')}
        {last && <button className="mn-continue" onClick={() => onSelectSurah(last.surahNumber, last.ayahNumber)}>تابع ← {last.surahNameAr} {toArabicDigits(last.ayahNumber)}</button>}
        <p className="mn-daily" onClick={() => onSelectSurah(ref.surah, ref.ayah)}>«{daily}» <small>{dailyLabel}</small></p>
        <ol className="mn-list" id="dh-surahs">
          {list.map((s) => (
            <li key={s.n} onClick={() => onSelectSurah(s.n)}>
              <span className="mn-n">{toArabicDigits(s.n)}</span>
              <span className="mn-name font-amiri">{s.ar}</span>
              <span className="mn-a">{toArabicDigits(s.a)}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (design === 'grid') {
    return (
      <div className="dh dh-grid" dir="rtl">
        <div className="gh-tiles">
          {TILES.map((t) => (
            <button key={t.id} onClick={() => tile(t.id)} className={`gh-tile gh-${t.id}`}>
              <span className="text-2xl">{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>
        {juzGrid}
        <div className="gh-row">
          <div className="gh-wide" onClick={() => onSelectSurah(ref.surah, ref.ayah)}>
            <div className="text-[0.65rem] opacity-70">✨ آية اليوم · {dailyLabel}</div>
            <p className="font-quran text-lg leading-[2] line-clamp-3">{daily}</p>
          </div>
          {last && (
            <div className="gh-small" onClick={() => onSelectSurah(last.surahNumber, last.ayahNumber)}>
              <div className="text-[0.65rem] opacity-70">تابع</div>
              <div className="font-amiri text-lg font-bold">{last.surahNameAr}</div>
              <div className="text-xs">آية {toArabicDigits(last.ayahNumber)}</div>
            </div>
          )}
        </div>
        {searchBox('gh-search')}
        <div className="gh-surahs" id="dh-surahs">
          {list.map((s) => (
            <button key={s.n} onClick={() => onSelectSurah(s.n)} className="gh-sq">
              <b>{toArabicDigits(s.n)}</b><span className="font-amiri">{s.ar}</span><i>{toArabicDigits(s.a)}</i>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // drawer / list design: grouped by juz with sticky headers
  const groups: { juz: number; items: typeof SURAHS }[] = [];
  list.forEach((s) => {
    const j = getJuz(s.n, 1);
    const g = groups[groups.length - 1];
    if (!g || g.juz !== j) groups.push({ juz: j, items: [s] });
    else g.items.push(s);
  });
  return (
    <div className="dh dh-list" dir="rtl">
      <div className="lh-bar">
        <button onClick={onOpenDrawer} className="lh-menu" aria-label="القائمة"><Menu className="w-5 h-5" /> القائمة</button>
        {searchBox('lh-search')}
      </div>
      {last && (
        <div className="lh-row lh-continue" onClick={() => onSelectSurah(last.surahNumber, last.ayahNumber)}>
          <span className="lh-ico">🔖</span>
          <div className="flex-1"><div className="font-bold">تابع القراءة</div><div className="text-xs opacity-70">سورة {last.surahNameAr} · الآية {toArabicDigits(last.ayahNumber)}</div></div>
          <ChevronLeft className="w-4 h-4 opacity-60" />
        </div>
      )}
      <div className="lh-row" onClick={() => onSelectSurah(ref.surah, ref.ayah)}>
        <span className="lh-ico">✨</span>
        <div className="flex-1 min-w-0"><div className="font-bold">آية اليوم · {dailyLabel}</div><div className="font-quran text-base truncate opacity-90">{daily}</div></div>
        <ChevronLeft className="w-4 h-4 opacity-60" />
      </div>
      <div id="dh-surahs">
        {groups.map((g) => (
          <div key={g.juz}>
            <div className="lh-head">الجزء {toArabicDigits(g.juz)}</div>
            {g.items.map((s) => (
              <div key={s.n} className="lh-row" onClick={() => onSelectSurah(s.n)}>
                <span className="lh-num">{toArabicDigits(s.n)}</span>
                <div className="flex-1"><div className="font-amiri text-lg font-bold leading-tight">{s.ar}</div><div className="text-[0.68rem] opacity-60">{s.en} · {s.t} · {toArabicDigits(s.a)} آية</div></div>
                <ChevronLeft className="w-4 h-4 opacity-50" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};


interface ReaderProps {
  design: DesignStyleId;
  surahNumber: number;
  initialAyahNumber?: number;
  fontFamily: string;
  currentPlayingAyah: number | null;
  isPlaying: boolean;
  onBack: () => void;
  onPlaySurah: (s: number) => void;
  onPlayAyah: (s: number, a: number) => void;
  onOpenTafsir: (s: number, a: number, text: string) => void;
  onNavigateSurah?: (s: number) => void;
}

/** Reader layouts for the non-default designs. Same trusted text, same actions — different structure. */
export const DesignReader: React.FC<ReaderProps> = ({
  design, surahNumber, initialAyahNumber, fontFamily, currentPlayingAyah, isPlaying,
  onBack, onPlaySurah, onPlayAyah, onOpenTafsir, onNavigateSurah,
}) => {
  const info = SURAHS[surahNumber - 1];
  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [basmala, setBasmala] = useState('');
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<number | null>(null);
  const [bms, setBms] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [chrome, setChrome] = useState(design !== 'minimal');
  const [size, setSize] = useState<number>(() => parseInt(localStorage.getItem('quran_font_size') || '', 10) || 28);
  const refs = useRef<Record<number, HTMLElement | null>>({});
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true); setSel(null);
    if (!initialAyahNumber) document.querySelector('main')?.scrollTo({ top: 0 });
    Promise.all([getSurahAyahs(surahNumber), getBasmalaText()]).then(([a, b]) => {
      if (!alive) return;
      setAyahs(a); setBasmala(b); setLoading(false);
    }).catch(() => alive && setLoading(false));
    const p = loadReadingProgress();
    setBms(p.bookmarks.filter((b) => b.surahNumber === surahNumber).map((b) => b.ayahNumber));
    return () => { alive = false; };
  }, [surahNumber]);

  useEffect(() => { localStorage.setItem('quran_font_size', String(size)); }, [size]);
  useEffect(() => {
    if (!loading && initialAyahNumber) setTimeout(() => refs.current[initialAyahNumber]?.scrollIntoView({ block: 'center' }), 250);
  }, [loading, initialAyahNumber]);
  useEffect(() => {
    if (currentPlayingAyah) refs.current[currentPlayingAyah]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentPlayingAyah]);
  // remember position
  useEffect(() => {
    if (loading || typeof IntersectionObserver === 'undefined') return;
    let t: number | undefined;
    const vis = new Set<number>();
    const obs = new IntersectionObserver((es) => {
      es.forEach((e) => { const n = Number((e.target as HTMLElement).dataset.ayah); e.isIntersecting ? vis.add(n) : vis.delete(n); });
      window.clearTimeout(t);
      t = window.setTimeout(() => { if (vis.size) saveLastReadOnly(surahNumber, Math.min(...vis), info.ar, info.en); }, 800);
    }, { threshold: 0.5 });
    Object.values(refs.current).forEach((el) => el && obs.observe(el as Element));
    return () => { window.clearTimeout(t); obs.disconnect(); };
  }, [loading, ayahs, surahNumber]);

  const text = (a: AyahData) => stripBasmala(surahNumber, a.numberInSurah, a.text);
  const showBasmala = surahNumber !== 1 && surahNumber !== 9 && !!basmala;
  const pages = useMemo(() => {
    const m: { page: number; juz: number; list: AyahData[] }[] = [];
    ayahs.forEach((a) => {
      const last = m[m.length - 1];
      if (!last || last.page !== a.page) m.push({ page: a.page || 0, juz: a.juz, list: [a] });
      else last.list.push(a);
    });
    return m;
  }, [ayahs]);

  const selAyah = sel ? ayahs[sel - 1] : null;
  const ref = (n: number) => `[${info.ar}: ${toArabicDigits(n)}]`;
  const copy = async (a: AyahData) => {
    const v = `﴿${text(a)}﴾ ${ref(a.numberInSurah)}`;
    try { await navigator.clipboard.writeText(v); } catch { /* ignore */ }
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };
  const share = async (a: AyahData) => {
    const v = `﴿${text(a)}﴾ ${ref(a.numberInSurah)}`;
    if (navigator.share) { try { await navigator.share({ text: v }); } catch { /* cancelled */ } return; }
    copy(a);
  };
  const bm = (a: AyahData) => {
    const on = toggleBookmark(surahNumber, a.numberInSurah, info.ar, info.en, text(a).slice(0, 80));
    setBms((b) => (on ? [...b, a.numberInSurah] : b.filter((x) => x !== a.numberInSurah)));
    hapticFeedback.light();
  };
  const tapAyah = (n: number) => {
    if (design === 'minimal' && !chrome && sel === null) { setChrome(true); return; }
    setSel((s) => (s === n ? null : n));
  };
  const go = (d: number) => {
    const t = surahNumber + d;
    if (t >= 1 && t <= 114 && onNavigateSurah) { hapticFeedback.navigation(); onNavigateSurah(t); }
  };
  const onTouchStart = (e: React.TouchEvent) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (design !== 'minimal' || !touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? -1 : 1); // RTL: swipe right = next
  };

  const marker = (n: number) => <span className="ayah-marker select-none">﴿{toArabicDigits(n)}﴾</span>;
  const activeCls = (n: number) => (currentPlayingAyah === n ? 'is-playing' : '') + (sel === n ? ' is-selected' : '');

  const header = (
    <div className={`dr-header ${design === 'minimal' && !chrome ? 'dr-hidden' : ''}`}>
      <button onClick={onBack} className="dr-btn" aria-label="رجوع"><ArrowRight className="w-5 h-5" /></button>
      <div className="dr-title">
        <div className="font-amiri text-lg font-bold leading-tight">سورة {info.ar}</div>
        <div className="text-[0.65rem] opacity-70">{info.t} · {toArabicDigits(info.a)} آية</div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => setSize((s) => Math.max(18, s - 2))} className="dr-btn" aria-label="تصغير الخط"><Minus className="w-4 h-4" /></button>
        <button onClick={() => setSize((s) => Math.min(48, s + 2))} className="dr-btn" aria-label="تكبير الخط"><Plus className="w-4 h-4" /></button>
        <button onClick={() => onPlaySurah(surahNumber)} className="dr-btn dr-btn-gold" aria-label="استماع للسورة">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  let body: React.ReactNode = null;
  if (design === 'mushaf_page') {
    body = (
      <div className="space-y-5">
        {pages.map((pg, pi) => (
          <div key={pg.page} className="mushaf-page">
            <div className="mushaf-page-head"><span>سورة {info.ar}</span><span>الجزء {toArabicDigits(pg.juz)}</span></div>
            {pi === 0 && (
              <>
                <div className="mushaf-surah-banner">سورة {info.ar}</div>
                {showBasmala && <div className="mushaf-basmala" style={{ fontFamily }}>{basmala}</div>}
              </>
            )}
            <div className="mushaf-text" style={{ fontFamily, fontSize: size }}>
              {pg.list.map((a) => (
                <span key={a.number} data-ayah={a.numberInSurah} ref={(el) => (refs.current[a.numberInSurah] = el)}
                  onClick={() => tapAyah(a.numberInSurah)} className={`mushaf-ayah ${activeCls(a.numberInSurah)}`}>
                  {text(a)} {marker(a.numberInSurah)}{' '}
                </span>
              ))}
            </div>
            <div className="mushaf-page-num">{toArabicDigits(pg.page)}</div>
          </div>
        ))}
      </div>
    );
  } else if (design === 'cards') {
    body = (
      <div className="cards-reader">
        {showBasmala && <div className="card-basmala" style={{ fontFamily }}>{basmala}</div>}
        {ayahs.map((a) => (
          <article key={a.number} data-ayah={a.numberInSurah} ref={(el) => (refs.current[a.numberInSurah] = el)}
            className={`ayah-card ${activeCls(a.numberInSurah)}`}>
            <div className="ayah-card-top">
              <span className="ayah-card-num">{toArabicDigits(a.numberInSurah)}</span>
              <span className="text-[0.65rem] opacity-70">الجزء {toArabicDigits(a.juz)} · صفحة {toArabicDigits(a.page || 0)}</span>
            </div>
            <p className="ayah-card-text" style={{ fontFamily, fontSize: size + 4 }} onClick={() => tapAyah(a.numberInSurah)}>{text(a)}</p>
            <div className="ayah-card-actions">
              <button onClick={() => onPlayAyah(surahNumber, a.numberInSurah)} aria-label="استماع"><Play className="w-4 h-4" /></button>
              <button onClick={() => onOpenTafsir(surahNumber, a.numberInSurah, a.text)} aria-label="تفسير"><BookOpenText className="w-4 h-4" /></button>
              <button onClick={() => bm(a)} aria-label="علامة">{bms.includes(a.numberInSurah) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}</button>
              <button onClick={() => copy(a)} aria-label="نسخ"><Copy className="w-4 h-4" /></button>
              <button onClick={() => share(a)} aria-label="مشاركة"><Share2 className="w-4 h-4" /></button>
            </div>
          </article>
        ))}
      </div>
    );
  } else if (design === 'minimal') {
    body = (
      <div className="minimal-reader" onClick={(e) => { if (e.target === e.currentTarget) setChrome((c) => !c); }}>
        <div className="minimal-title font-amiri">{info.ar}</div>
        {showBasmala && <div className="minimal-basmala" style={{ fontFamily }}>{basmala}</div>}
        <div className="minimal-text" style={{ fontFamily, fontSize: size }}>
          {ayahs.map((a) => (
            <span key={a.number} data-ayah={a.numberInSurah} ref={(el) => (refs.current[a.numberInSurah] = el)}
              onClick={() => tapAyah(a.numberInSurah)} className={`minimal-ayah ${activeCls(a.numberInSurah)}`}>
              {text(a)} {marker(a.numberInSurah)}{' '}
            </span>
          ))}
        </div>
        <div className="minimal-hint">⟷ اسحب يميناً أو يساراً للانتقال بين السور · اضغط لإظهار الأدوات</div>
      </div>
    );
  } else if (design === 'grid') {
    body = (
      <div>
        <div className="grid-chips">
          {ayahs.map((a) => (
            <button key={a.number} onClick={() => refs.current[a.numberInSurah]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className={currentPlayingAyah === a.numberInSurah ? 'on' : ''}>{toArabicDigits(a.numberInSurah)}</button>
          ))}
        </div>
        {showBasmala && <div className="grid-basmala" style={{ fontFamily }}>{basmala}</div>}
        <div className="grid-ayahs">
          {ayahs.map((a) => (
            <div key={a.number} data-ayah={a.numberInSurah} ref={(el) => (refs.current[a.numberInSurah] = el)}
              onClick={() => tapAyah(a.numberInSurah)} className={`grid-ayah ${activeCls(a.numberInSurah)}`}>
              <span className="grid-ayah-num">{toArabicDigits(a.numberInSurah)}</span>
              <p style={{ fontFamily, fontSize: size - 2 }}>{text(a)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    // drawer / list: document-style with a numbered gutter
    body = (
      <div className="list-reader">
        {showBasmala && <div className="list-basmala" style={{ fontFamily }}>{basmala}</div>}
        {ayahs.map((a) => (
          <div key={a.number} data-ayah={a.numberInSurah} ref={(el) => (refs.current[a.numberInSurah] = el)}
            onClick={() => tapAyah(a.numberInSurah)} className={`list-row ${activeCls(a.numberInSurah)}`}>
            <div className="list-gutter">{toArabicDigits(a.numberInSurah)}{bms.includes(a.numberInSurah) && <Bookmark className="w-3 h-3 mt-1" />}</div>
            <p style={{ fontFamily, fontSize: size - 2 }}>{text(a)}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`design-reader dr-${design}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} dir="rtl">
      {header}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 opacity-70"><Loader2 className="w-6 h-6 animate-spin" />جاري التحميل…</div>
      ) : body}
      {!loading && onNavigateSurah && (
        <div className="dr-nav">
          <button disabled={surahNumber >= 114} onClick={() => go(1)}><ChevronRight className="w-4 h-4" />{surahNumber < 114 ? SURAHS[surahNumber].ar : '—'}</button>
          <button disabled={surahNumber <= 1} onClick={() => go(-1)}>{surahNumber > 1 ? SURAHS[surahNumber - 2].ar : '—'}<ChevronLeft className="w-4 h-4" /></button>
        </div>
      )}
      {selAyah && design !== 'cards' && (
        <div className="dr-sheet" role="dialog" aria-label="خيارات الآية">
          <div className="flex items-center justify-between mb-2">
            <span className="font-amiri font-bold">{info.ar} : {toArabicDigits(selAyah.numberInSurah)}</span>
            <button onClick={() => setSel(null)} aria-label="إغلاق"><X className="w-4 h-4" /></button>
          </div>
          <div className="dr-sheet-actions">
            <button onClick={() => { onPlayAyah(surahNumber, selAyah.numberInSurah); setSel(null); }}><Play className="w-4 h-4" />استماع</button>
            <button onClick={() => { onOpenTafsir(surahNumber, selAyah.numberInSurah, selAyah.text); setSel(null); }}><BookOpenText className="w-4 h-4" />تفسير</button>
            <button onClick={() => bm(selAyah)}>{bms.includes(selAyah.numberInSurah) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}علامة</button>
            <button onClick={() => copy(selAyah)}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}نسخ</button>
            <button onClick={() => share(selAyah)}><Share2 className="w-4 h-4" />مشاركة</button>
          </div>
        </div>
      )}
    </div>
  );
};

