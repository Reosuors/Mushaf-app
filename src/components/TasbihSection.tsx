import React, { useState, useEffect } from 'react';
import { TASBIH_LIST } from '../data/tasbih';
import { TRANSLATIONS } from '../data/translations';
import { RotateCcw, Minus, Plus, Sparkles, Award } from 'lucide-react';

interface TasbihSectionProps {
  lang: string;
}

export const TasbihSection: React.FC<TasbihSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;

  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [count, setCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('current_tasbih_count') || '0', 10);
  });
  const [target, setTarget] = useState<number>(33);
  const [totalLifetime, setTotalLifetime] = useState<number>(() => {
    return parseInt(localStorage.getItem('tasbih_lifetime') || '0', 10);
  });

  const selectedItem = TASBIH_LIST[selectedIdx] || TASBIH_LIST[0];

  const handleIncrement = () => {
    setCount((prev) => {
      const next = prev + 1;
      localStorage.setItem('current_tasbih_count', String(next));
      return next;
    });

    setTotalLifetime((prev) => {
      const next = prev + 1;
      localStorage.setItem('tasbih_lifetime', String(next));
      return next;
    });

    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const handleDecrement = () => {
    setCount((prev) => {
      const next = Math.max(0, prev - 1);
      localStorage.setItem('current_tasbih_count', String(next));
      return next;
    });
  };

  const handleReset = () => {
    setCount(0);
    localStorage.setItem('current_tasbih_count', '0');
  };

  // Keyboard shortcut: Spacebar to tap tasbih
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        handleIncrement();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const progress = target > 0 ? (count % target) / target : 0;
  const circ = 2 * Math.PI * 105; // radius = 105
  const strokeOffset = circ * (1 - progress);
  const cyclesCompleted = target > 0 ? Math.floor(count / target) : 0;

  return (
    <div className="max-w-xl mx-auto p-3.5 sm:p-6 pb-28 space-y-4 animate-fade-in flex flex-col items-center">
      {/* Preset Phrase Selector Scroll */}
      <div className="w-full overflow-x-auto pb-2 flex gap-2 no-scrollbar">
        {TASBIH_LIST.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedIdx(idx);
              setTarget(item.n || 33);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
              idx === selectedIdx
                ? 'bg-[var(--gold)] text-black border-[var(--gold)] shadow-md'
                : 'bg-[var(--bg2)] text-[var(--text2)] border-[var(--border2)] hover:border-[var(--gold)]/40'
            }`}
          >
            {item.text}
          </button>
        ))}
      </div>

      {/* Target Goal Selector */}
      <div className="flex items-center gap-2 bg-[var(--bg2)] border border-[var(--border2)] p-1 rounded-2xl shadow-sm">
        {[33, 100, 1000].map((num) => (
          <button
            key={num}
            onClick={() => setTarget(num)}
            className={`px-3.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              target === num
                ? 'bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--gold)]/30'
                : 'text-[var(--text3)] hover:text-[var(--text)]'
            }`}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Active Phrase Card */}
      <div className="w-full bg-[var(--bg2)] border border-[var(--border2)] rounded-3xl p-4 text-center shadow-lg">
        <p className="font-quran text-2xl sm:text-3xl text-[var(--gold2)] leading-relaxed dir-rtl">
          {selectedItem.text}
        </p>
      </div>

      {/* Interactive Big Circular Counter */}
      <div className="relative my-4 flex items-center justify-center">
        {/* Animated Ring */}
        <div className="w-64 h-64 sm:w-72 sm:h-72">
          <svg className="-rotate-90 w-full h-full" viewBox="0 0 240 240">
            <circle
              fill="none"
              stroke="var(--border2)"
              cx="120"
              cy="120"
              r="105"
              strokeWidth="10"
            />
            <circle
              fill="none"
              stroke="var(--gold)"
              cx="120"
              cy="120"
              r="105"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={strokeOffset}
              className="transition-[stroke-dashoffset] duration-150 ease-out"
            />
          </svg>
        </div>

        {/* Central Clickable Trigger */}
        <button
          id="tasbih-tap-button"
          onClick={handleIncrement}
          className="absolute inset-4 sm:inset-5 rounded-full bg-gradient-to-br from-[var(--bg2)] to-[var(--bg3)] border border-[var(--gold)]/30 shadow-2xl flex flex-col items-center justify-center p-4 active:scale-95 transition-all cursor-pointer group hover:border-[var(--gold)]"
        >
          <span className="text-5xl sm:text-6xl font-black text-[var(--gold2)] font-sans tracking-tight select-none">
            {count}
          </span>
          <span className="text-xs text-[var(--text3)] font-semibold mt-1 select-none">
            {lang === 'ar' ? 'الهدف:' : 'Target:'} {target}
          </span>
          {cyclesCompleted > 0 && (
            <span className="text-[0.65rem] text-[var(--gold)] font-bold mt-1 bg-[var(--gold)]/10 px-2 py-0.5 rounded-full">
              ✨ {cyclesCompleted} {lang === 'ar' ? 'دورة مكتملة' : 'cycles'}
            </span>
          )}
        </button>
      </div>

      {/* Auxiliary Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleDecrement}
          className="w-12 h-12 rounded-2xl bg-[var(--bg2)] border border-[var(--border2)] text-[var(--text2)] hover:text-[var(--gold)] flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-sm"
          title="Minus 1"
        >
          <Minus className="w-5 h-5" />
        </button>

        <button
          onClick={handleReset}
          className="px-5 py-3 rounded-2xl bg-[var(--bg2)] border border-[var(--border2)] text-[var(--text2)] hover:text-red-400 flex items-center gap-2 text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-sm"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{lang === 'ar' ? 'تصفير' : 'Reset'}</span>
        </button>
      </div>

      {/* Lifetime Stats Footer */}
      <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text3)] bg-[var(--bg2)] border border-[var(--border2)] px-4 py-2 rounded-xl">
        <Award className="w-4 h-4 text-[var(--gold)]" />
        <span>
          {lang === 'ar' ? 'إجمالي تسبيحاتك المسجلة:' : 'Total Lifetime Dhikr:'}{' '}
          <strong className="text-[var(--gold2)]">{totalLifetime}</strong>
        </span>
      </div>
    </div>
  );
};
