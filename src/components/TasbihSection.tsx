import React, { useState, useEffect } from 'react';
import { TASBIH_LIST } from '../data/tasbih';
import { TRANSLATIONS } from '../data/translations';
import { toArabicDigits } from '../utils/quranText';
import { RotateCcw, Minus, Award, Smartphone } from 'lucide-react';
import { hapticFeedback } from '../utils/haptics';
import { MihrabBackdrop } from './IslamicOrnaments';

interface TasbihSectionProps {
  lang: string;
}

export const TasbihSection: React.FC<TasbihSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';

  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [count, setCount] = useState<number>(() =>
    parseInt(localStorage.getItem('current_tasbih_count') || '0', 10)
  );
  const [target, setTarget] = useState<number>(33);
  const [totalLifetime, setTotalLifetime] = useState<number>(() =>
    parseInt(localStorage.getItem('tasbih_lifetime') || '0', 10)
  );
  const [hapticsOn, setHapticsOn] = useState<boolean>(() => hapticFeedback.isEnabled());
  const [pulseKey, setPulseKey] = useState<number>(0);

  const selectedItem = TASBIH_LIST[selectedIdx] || TASBIH_LIST[0];

  const handleIncrement = () => {
    let nextCount = 0;
    setCount((prev) => {
      nextCount = prev + 1;
      localStorage.setItem('current_tasbih_count', String(nextCount));
      return nextCount;
    });

    setTotalLifetime((prev) => {
      const next = prev + 1;
      localStorage.setItem('tasbih_lifetime', String(next));
      return next;
    });

    setPulseKey((k) => k + 1);

    if (target > 0 && nextCount > 0 && nextCount % target === 0) {
      hapticFeedback.tasbihCycle();
    } else {
      hapticFeedback.tasbih();
    }
  };

  const handleDecrement = () => {
    hapticFeedback.light();
    setCount((prev) => {
      const next = Math.max(0, prev - 1);
      localStorage.setItem('current_tasbih_count', String(next));
      return next;
    });
  };

  const handleReset = () => {
    hapticFeedback.warning();
    setCount(0);
    localStorage.setItem('current_tasbih_count', '0');
  };

  const handleToggleHaptics = () => {
    const nextState = !hapticsOn;
    setHapticsOn(nextState);
    hapticFeedback.setEnabled(nextState);
    if (nextState) hapticFeedback.success();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        handleIncrement();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [target]);

  const progress = target > 0 ? (count % target) / target : 0;
  const displayProgress = count > 0 && count % target === 0 ? 1 : progress;
  const circ = 2 * Math.PI * 102;
  const strokeOffset = circ * (1 - displayProgress);
  const cyclesCompleted = target > 0 ? Math.floor(count / target) : 0;

  return (
    <div className="max-w-xl mx-auto p-3.5 sm:p-6 pb-28 space-y-5 animate-fade-in flex flex-col items-center">
      {/* Preset Dhikr Pills */}
      <div className="w-full overflow-x-auto pb-1 flex gap-2 no-scrollbar">
        {TASBIH_LIST.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              hapticFeedback.selection();
              setSelectedIdx(idx);
              setTarget(item.n || 33);
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
              idx === selectedIdx
                ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black border-[var(--gold)] shadow-md'
                : 'bg-[var(--bg2)] text-[var(--text2)] border-[var(--border2)] hover:border-[var(--gold)]/45'
            }`}
          >
            {item.text}
          </button>
        ))}
      </div>

      {/* Target & Haptics Controls */}
      <div className="w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-[var(--bg2)] border border-[var(--border2)] p-1 rounded-xl">
          {[33, 99, 100, 1000].map((num) => (
            <button
              key={num}
              onClick={() => {
                hapticFeedback.selection();
                setTarget(num);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer tabular-nums ${
                target === num
                  ? 'bg-[var(--gold)]/18 text-[var(--gold2)] border border-[var(--gold)]/35'
                  : 'text-[var(--text3)] hover:text-[var(--text)]'
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        <button
          onClick={handleToggleHaptics}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            hapticsOn
              ? 'bg-[var(--gold)]/14 border-[var(--gold)]/45 text-[var(--gold2)]'
              : 'bg-[var(--bg2)] border-[var(--border2)] text-[var(--text3)]'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-[var(--gold)]" />
          <span className="text-[0.68rem]">
            {isRtl ? (hapticsOn ? 'الاهتزاز مفعل' : 'بدون اهتزاز') : hapticsOn ? 'Haptics ON' : 'Haptics OFF'}
          </span>
        </button>
      </div>

      {/* Illuminated Sanctuary Counter Card */}
      <div className="w-full relative rounded-[28px] overflow-hidden border border-[var(--gold)]/30 bg-gradient-to-b from-[var(--bg3)]/90 via-[var(--bg2)] to-[var(--bg2)] p-6 sm:p-8 flex flex-col items-center text-center shadow-[0_20px_50px_-24px_rgba(0,0,0,0.85)]">
        <MihrabBackdrop className="opacity-75" />

        <div className="relative z-10 w-full flex flex-col items-center">
          <p className="font-quran text-2xl sm:text-3xl text-[var(--gold2)] leading-relaxed dir-rtl mb-6 text-glow">
            {selectedItem.text}
          </p>

          {/* Tactile Illuminated Pearl Ring Button */}
          <div className="relative w-60 h-60 flex items-center justify-center my-1">
            {pulseKey > 0 && (
              <span
                key={pulseKey}
                className="pointer-events-none absolute inset-4 rounded-full border-2 border-[var(--gold)]/60 animate-pearl-pulse"
              />
            )}

            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 240 240">
              {/* Outer ornamental dashed ring */}
              <circle
                cx="120"
                cy="120"
                r="114"
                fill="none"
                stroke="color-mix(in srgb, var(--gold) 18%, transparent)"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
              <circle
                cx="120"
                cy="120"
                r="102"
                fill="none"
                stroke="color-mix(in srgb, var(--border2) 85%, transparent)"
                strokeWidth="7"
              />
              <circle
                cx="120"
                cy="120"
                r="102"
                fill="none"
                stroke="var(--gold)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-200"
              />
            </svg>

            <button
              type="button"
              onClick={handleIncrement}
              aria-label={t.tapToCount || 'اضغط للتسبيح'}
              className="w-44 h-44 rounded-full bg-gradient-to-b from-[var(--bg3)] to-[var(--bg)] border border-[var(--gold)]/45 shadow-[inset_0_2px_18px_rgba(212,175,55,0.16),0_12px_30px_rgba(0,0,0,0.65)] hover:border-[var(--gold)] active:scale-[0.94] transition-all cursor-pointer flex flex-col items-center justify-center select-none"
            >
              <span className="font-sans text-5xl sm:text-6xl font-extrabold text-[var(--gold2)] tabular-nums leading-none tracking-tight" dir="ltr">
                {count}
              </span>
              <span className="text-[0.72rem] text-[var(--text2)] mt-2 font-semibold tabular-nums">
                {isRtl ? `الهدف ${target}` : `Goal ${target}`}
              </span>
            </button>
          </div>

          {/* Cycles & Controls Row */}
          <div className="w-full flex items-center justify-between gap-3 mt-6 pt-4 border-t border-[var(--gold)]/15">
            <button
              onClick={handleDecrement}
              className="w-10 h-10 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text2)] hover:text-[var(--gold2)] flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              title={isRtl ? 'إنقاص ١' : 'Decrement'}
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 text-xs">
              <span className="px-3 py-1 rounded-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--gold2)] font-bold">
                {isRtl ? `الدورات: ${cyclesCompleted}` : `Cycles: ${cyclesCompleted}`}
              </span>
              <span className="px-3 py-1 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/30 text-[var(--text2)] font-bold inline-flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[var(--gold)]" />
                <span>{totalLifetime.toLocaleString()}</span>
              </span>
            </div>

            <button
              onClick={handleReset}
              className="w-10 h-10 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text2)] hover:text-red-400 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              title={isRtl ? 'تصفير العداد' : 'Reset Counter'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
