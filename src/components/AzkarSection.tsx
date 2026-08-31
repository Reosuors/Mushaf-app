import React, { useState } from 'react';
import { AZKAR } from '../data/azkar';
import { TRANSLATIONS } from '../data/translations';
import { Check, RotateCcw, Sparkles } from 'lucide-react';

interface AzkarSectionProps {
  lang: string;
}

export const AzkarSection: React.FC<AzkarSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const [activeTab, setActiveTab] = useState<'sabah' | 'masa' | 'nawm'>('sabah');
  const [userCounters, setUserCounters] = useState<Record<number, number>>({});

  const list = AZKAR[activeTab] || [];

  const handleIncrement = (idx: number, maxCount: number) => {
    const current = userCounters[idx] || 0;
    if (current < maxCount) {
      const next = current + 1;
      setUserCounters((prev) => ({ ...prev, [idx]: next }));
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
      // Record user activity
      const prevTotal = parseInt(localStorage.getItem('azkar_read') || '0', 10);
      localStorage.setItem('azkar_read', String(prevTotal + 1));
    }
  };

  const handleResetSection = () => {
    setUserCounters({});
  };

  // Calculate completion percentage
  const totalRequired = list.reduce((acc, curr) => acc + curr.r, 0);
  const totalCompleted = list.reduce((acc, curr, idx) => acc + Math.min(curr.r, userCounters[idx] || 0), 0);
  const pct = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto p-3.5 sm:p-6 pb-28 space-y-4 animate-fade-in">
      {/* Category Tabs */}
      <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl p-1.5 flex gap-1.5 shadow-sm">
        <button
          onClick={() => {
            setActiveTab('sabah');
            setUserCounters({});
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'sabah'
              ? 'bg-[var(--gold)] text-black shadow-md'
              : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg3)]'
          }`}
        >
          <span>🌅</span>
          <span>{t.azkarSabah}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('masa');
            setUserCounters({});
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'masa'
              ? 'bg-[var(--gold)] text-black shadow-md'
              : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg3)]'
          }`}
        >
          <span>🌇</span>
          <span>{t.azkarMasa}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('nawm');
            setUserCounters({});
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'nawm'
              ? 'bg-[var(--gold)] text-black shadow-md'
              : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg3)]'
          }`}
        >
          <span>🌙</span>
          <span>{t.azkarNawm}</span>
        </button>
      </div>

      {/* Progress & Reset Status Bar */}
      <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-sm">
        <div className="flex-1 me-4">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="text-[var(--gold2)] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>{lang === 'ar' ? 'إنجاز أذكار هذه الجلسة' : 'Progress'}</span>
            </span>
            <span className="text-[var(--gold)]">{pct}%</span>
          </div>
          <div className="w-full h-2 bg-[var(--bg3)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleResetSection}
          className="p-2 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text2)] hover:text-[var(--gold)] active:scale-95 transition-all cursor-pointer shrink-0"
          title="Reset Counters"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Zikr Items List */}
      <div className="space-y-3">
        {list.map((item, idx) => {
          const count = userCounters[idx] || 0;
          const isDone = count >= item.r;

          return (
            <div
              key={idx}
              onClick={() => handleIncrement(idx, item.r)}
              className={`border rounded-3xl p-4 sm:p-5 transition-all duration-200 cursor-pointer select-none active:scale-[0.99] ${
                isDone
                  ? 'bg-emerald-500/5 border-emerald-500/30'
                  : 'bg-[var(--bg2)] border-[var(--border2)] hover:border-[var(--gold)]/40 shadow-sm'
              }`}
            >
              {/* Header Badge & Virtue */}
              <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border2)]/50 mb-3">
                <span className="text-[0.65rem] font-bold text-[var(--text3)]">
                  #{idx + 1}
                </span>
                {item.b && (
                  <span className="text-[0.68rem] text-[var(--gold)] font-medium italic bg-[var(--gold)]/5 px-2 py-0.5 rounded-full border border-[var(--gold)]/15">
                    {item.b}
                  </span>
                )}
              </div>

              {/* Zikr Arabic Calligraphy Text */}
              <p className="font-quran text-lg sm:text-xl text-[var(--text)] leading-[2.3] dir-rtl text-justify mb-4 whitespace-pre-line">
                {item.z}
              </p>

              {/* Bottom Counter Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border2)]/50">
                <div className="text-[0.68rem] text-[var(--text3)]">
                  {lang === 'ar' ? 'المطلوب:' : 'Target:'} {item.r}{' '}
                  {lang === 'ar' ? 'مرات' : 'times'}
                </div>

                <div
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-xs transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30'
                  }`}
                >
                  {isDone ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{lang === 'ar' ? 'تمت القراءة' : 'Completed'}</span>
                    </>
                  ) : (
                    <span>
                      {count} / {item.r}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
