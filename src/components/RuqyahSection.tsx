import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  Headphones,
  BookOpen,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Timer,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Reciter } from '../types';
import { SURAHS } from '../data/surahs';
import { RUQYAH_RANGES, RUQYAH_DUAS } from '../data/ruqyah';
import { getDisplayAyahText, toArabicDigits, getBasmalaText } from '../utils/quranText';
import { QURAN_FONTS } from '../data/designStyles';
import {
  RUQYAH_LIST,
  subscribeRuqyah,
  getRuqyahState,
  playRuqyah,
  toggleRuqyah,
  next,
  prev,
  setRuqyahRepeat,
  setRuqyahSleep,
  setRuqyahReciter,
} from '../utils/ruqyahPlayer';
import { MihrabBackdrop, AyahRosette, SectionIcon, GoldDivider } from './IslamicOrnaments';

interface Props {
  reciters: Reciter[];
  selectedReciter: Reciter | null;
  onSelectReciter: (r: Reciter) => void;
}

const SLEEP_OPTIONS: { v: number | null; label: string }[] = [
  { v: null, label: 'بدون' },
  { v: 10, label: '١٠ د' },
  { v: 20, label: '٢٠ د' },
  { v: 30, label: '٣٠ د' },
  { v: 60, label: 'ساعة' },
  { v: -1, label: 'بعد ختام الرقية' },
];

export const RuqyahSection: React.FC<Props> = ({ reciters, selectedReciter, onSelectReciter }) => {
  const [mode, setMode] = useState<'read' | 'listen'>(
    () => (localStorage.getItem('ruqyah_mode') as 'read' | 'listen') || 'read'
  );
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [basmala, setBasmala] = useState('');
  const [now, setNow] = useState(Date.now());
  const st = useSyncExternalStore(subscribeRuqyah, getRuqyahState);
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const fontId = localStorage.getItem('quran_font_family') || 'amiri_quran';
  const fontFamily = (QURAN_FONTS.find((f) => f.id === fontId) || QURAN_FONTS[0]).fontFamily;

  useEffect(() => {
    localStorage.setItem('ruqyah_mode', mode);
  }, [mode]);
  useEffect(() => {
    setRuqyahReciter(selectedReciter);
  }, [selectedReciter]);
  useEffect(() => {
    let alive = true;
    getBasmalaText()
      .then((b) => alive && setBasmala(b))
      .catch(() => {});
    Promise.all(
      RUQYAH_LIST.map((it) =>
        getDisplayAyahText(it.surah, it.ayah).then((t) => [`${it.surah}:${it.ayah}`, t] as const)
      )
    )
      .then((pairs) => alive && setTexts(Object.fromEntries(pairs)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!st.sleepEndsAt || st.sleepEndsAt < 0) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [st.sleepEndsAt]);
  useEffect(() => {
    if (mode !== 'listen' || !st.playing) return;
    itemRefs.current[st.index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [st.index, st.playing, mode]);

  const loaded = Object.keys(texts).length > 0;
  const indexOf = useMemo(() => {
    const m: Record<string, number> = {};
    RUQYAH_LIST.forEach((it, i) => (m[`${it.surah}:${it.ayah}`] = i));
    return m;
  }, []);
  const cur = RUQYAH_LIST[st.index];
  const sleepLeft =
    st.sleepEndsAt && st.sleepEndsAt > 0 ? Math.max(0, Math.ceil((st.sleepEndsAt - now) / 1000)) : 0;

  return (
    <div className="ruqyah max-w-3xl mx-auto p-3.5 sm:p-6 pb-36 space-y-4 animate-fade-in" dir="rtl">
      {/* Illuminated Hero */}
      <div className="ruqyah-hero relative rounded-[26px] overflow-hidden p-5 sm:p-6 text-center border border-[var(--gold)]/32 bg-gradient-to-b from-[var(--bg3)]/95 via-[var(--bg2)] to-[var(--bg2)] shadow-lg">
        <div
          className="pointer-events-none absolute inset-[6px] rounded-[20px] border border-[var(--gold)]/16"
          aria-hidden="true"
        />
        <MihrabBackdrop className="opacity-75" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--gold)]/12 border border-[var(--gold)]/35 flex items-center justify-center text-[var(--gold2)] mb-3">
            <SectionIcon id="ruqyah" active className="w-6 h-6" />
          </div>
          <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-[var(--gold2)]">
            الرقية الشرعية
          </h2>
          <p className="text-xs text-[var(--text2)] mt-1">
            آيات من القرآن الكريم وأدعية ثابتة عن النبي ﷺ — {toArabicDigits(RUQYAH_LIST.length)} آية
          </p>

          <div className="mt-4 inline-flex p-1 rounded-2xl bg-[var(--bg)]/75 border border-[var(--border2)]">
            {(
              [
                ['read', 'قراءة', BookOpen],
                ['listen', 'استماع', Headphones],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                data-mode={id}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mode === id
                    ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black shadow-sm'
                    : 'text-[var(--text2)] hover:text-[var(--gold2)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audio Listen Mode Sticky Bar */}
      {mode === 'listen' && (
        <div className="ruqyah-player sticky top-2 z-20 rounded-[24px] p-4 border border-[var(--gold)]/38 bg-[var(--bg2)]/95 backdrop-blur-xl shadow-2xl space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[0.7rem] px-3 py-1 rounded-full bg-[var(--gold)]/12 text-[var(--gold2)] border border-[var(--gold)]/30 inline-flex items-center gap-1.5 font-bold">
              <Headphones className="w-3.5 h-3.5" />
              <span>يُستحب الاستماع بالسماعات</span>
            </span>
            <select
              aria-label="القارئ"
              value={selectedReciter?.id ?? ''}
              onChange={(e) => {
                const r = reciters.find((x) => x.id === Number(e.target.value));
                if (r) onSelectReciter(r);
              }}
              className="max-w-[52%] text-xs bg-[var(--bg3)] border border-[var(--border2)] rounded-xl px-2.5 py-1.5 text-[var(--text)] outline-none focus:border-[var(--gold)]"
            >
              {reciters
                .filter((r) => r.everyayah)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="text-center">
            <div className="text-[0.7rem] text-[var(--text3)]">
              الآية {toArabicDigits(st.index + 1)} من {toArabicDigits(RUQYAH_LIST.length)}
            </div>
            <div className="font-amiri text-base font-bold text-[var(--gold2)]" data-testid="ruqyah-current">
              سورة {SURAHS[cur.surah - 1].ar} · آية {toArabicDigits(cur.ayah)}
            </div>
            <div className="h-1.5 mt-2 rounded-full bg-[var(--bg3)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-[var(--gold2)] to-[var(--gold)] transition-all"
                style={{ width: `${((st.index + 1) / RUQYAH_LIST.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-3" dir="ltr">
            <button
              aria-label="السابقة"
              onClick={() => prev()}
              className="w-10 h-10 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] flex items-center justify-center text-[var(--gold2)] active:scale-95 cursor-pointer"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              aria-label={st.playing ? 'إيقاف مؤقت' : 'تشغيل'}
              data-testid="ruqyah-play"
              onClick={() => toggleRuqyah()}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold2)] text-black flex items-center justify-center shadow-[0_0_24px_rgba(212,175,55,0.4)] active:scale-95 cursor-pointer"
            >
              {st.loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : st.playing ? (
                <Pause className="w-6 h-6 fill-black" />
              ) : (
                <Play className="w-6 h-6 fill-black translate-x-0.5" />
              )}
            </button>
            <button
              aria-label="التالية"
              onClick={() => next(false)}
              className="w-10 h-10 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] flex items-center justify-center text-[var(--gold2)] active:scale-95 cursor-pointer"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setRuqyahRepeat(!st.repeat)}
              aria-pressed={st.repeat}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border cursor-pointer ${
                st.repeat
                  ? 'bg-[var(--gold)]/18 border-[var(--gold)] text-[var(--gold2)]'
                  : 'bg-[var(--bg3)] border-[var(--border2)] text-[var(--text2)]'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>{st.repeat ? 'تكرار الرقية: مفعّل' : 'تكرار الرقية'}</span>
            </button>

            <label className="px-2.5 py-1.5 rounded-xl text-xs bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text2)] flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>مؤقت الإيقاف</span>
              <select
                aria-label="مؤقت الإيقاف"
                value={st.sleepEndsAt === -1 ? '-1' : st.sleepEndsAt ? 'on' : ''}
                onChange={(e) => setRuqyahSleep(e.target.value === '' ? null : Number(e.target.value))}
                className="bg-transparent text-[var(--gold2)] font-bold outline-none"
              >
                {SLEEP_OPTIONS.map((o) => (
                  <option key={String(o.v)} value={o.v === null ? '' : String(o.v)}>
                    {o.label}
                  </option>
                ))}
                {st.sleepEndsAt && st.sleepEndsAt > 0 ? <option value="on">يعمل</option> : null}
              </select>
            </label>

            {sleepLeft > 0 && (
              <span className="text-xs text-[var(--gold2)] tabular-nums font-bold">
                {Math.floor(sleepLeft / 60)}:{String(sleepLeft % 60).padStart(2, '0')}
              </span>
            )}
          </div>
          {st.error && <div className="text-center text-[0.7rem] text-amber-400">{st.error}</div>}
        </div>
      )}

      {!loaded && (
        <div className="flex items-center justify-center gap-2 py-16 text-[var(--text2)] text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--gold)]" />
          <span>جاري تحميل الآيات…</span>
        </div>
      )}

      {/* Quranic Ruqyah Ranges (verbatim Tanzil text) */}
      {loaded &&
        RUQYAH_RANGES.map((r) => {
          const s = SURAHS[r.surah - 1];
          const ayahs: number[] = [];
          for (let a = r.from; a <= r.to; a++) ayahs.push(a);
          return (
            <section
              key={`${r.surah}-${r.from}`}
              className="ruqyah-block rounded-[22px] border border-[var(--border2)] bg-[var(--bg2)] p-4 sm:p-6 shadow-sm"
            >
              <header className="flex items-center justify-between pb-2.5 mb-3 border-b border-[var(--gold)]/14">
                <h3 className="font-amiri text-xl font-bold text-[var(--gold2)]">سورة {s.ar}</h3>
                <span className="text-[0.7rem] text-[var(--gold2)]/85 bg-[var(--gold)]/10 px-2.5 py-0.5 rounded-full border border-[var(--gold)]/25 font-bold">
                  {r.from === r.to
                    ? `الآية ${toArabicDigits(r.from)}`
                    : `الآيات ${toArabicDigits(r.from)}–${toArabicDigits(r.to)}`}
                </span>
              </header>
              {r.from === 1 && r.surah !== 1 && r.surah !== 9 && basmala && (
                <div className="text-center font-quran text-xl text-[var(--gold2)] my-2.5" style={{ fontFamily }}>
                  {basmala}
                </div>
              )}
              <div className="space-y-1.5">
                {ayahs.map((a) => {
                  const i = indexOf[`${r.surah}:${a}`];
                  const active = mode === 'listen' && i === st.index && (st.playing || st.loading);
                  return (
                    <div
                      key={a}
                      ref={(el) => {
                        itemRefs.current[i] = el;
                      }}
                      data-ruqyah-index={i}
                      onClick={() => mode === 'listen' && playRuqyah(i)}
                      className={`rounded-2xl px-3 py-2 transition-all ${
                        mode === 'listen' ? 'cursor-pointer hover:bg-[var(--bg3)]/50' : ''
                      } ${active ? 'bg-[var(--gold)]/15 ring-1 ring-[var(--gold)]/60 ruqyah-active' : ''}`}
                    >
                      <p
                        className="font-quran text-[var(--text)] leading-[2.35] text-justify"
                        style={{ fontFamily, fontSize: mode === 'read' ? '1.45rem' : '1.25rem' }}
                      >
                        {texts[`${r.surah}:${a}`]}
                        <AyahRosette numberLabel={toArabicDigits(a)} active={active} />
                      </p>
                      <div className="text-[0.65rem] text-[var(--text3)] text-left" dir="ltr">
                        {s.ar} {r.surah}:{a}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

      {/* Authentic Sunnah Duas */}
      {loaded && (
        <section className="ruqyah-block rounded-[22px] border border-[var(--gold)]/30 bg-[var(--bg2)] p-5 shadow-sm space-y-3">
          <h3 className="font-amiri text-xl font-bold text-[var(--gold2)]">
            من الرقى الثابتة عن النبي ﷺ
          </h3>
          <GoldDivider className="opacity-50" />
          {RUQYAH_DUAS.map((d) => (
            <div
              key={d.url}
              className="rounded-2xl bg-[var(--bg3)]/65 border border-[var(--border2)] p-4"
            >
              <p className="font-amiri text-[1.18rem] leading-[2.1] text-[var(--text)]">{d.text}</p>
              <div className="mt-2 flex items-center justify-between gap-2 text-[0.7rem]">
                <span className="text-[var(--text3)]">{d.note}</span>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--gold2)] hover:text-[var(--gold3)] font-bold flex items-center gap-1 shrink-0"
                >
                  <span>{d.source}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
          <p className="text-[0.65rem] text-[var(--text3)]">
            نصوص الأحاديث منقولة حرفياً من موقع sunnah.com. الاستماع للآيات فقط بصوت القارئ المختار.
          </p>
        </section>
      )}
    </div>
  );
};

export default RuqyahSection;
