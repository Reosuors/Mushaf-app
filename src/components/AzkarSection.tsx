import React, { useState } from 'react';
import { AZKAR } from '../data/azkar';
import { TRANSLATIONS } from '../data/translations';
import { toArabicDigits } from '../utils/quranText';
import { Check, RotateCcw, Sparkles, Shield, Sun, Moon, Sunset } from 'lucide-react';
import { hapticFeedback } from '../utils/haptics';

interface AzkarSectionProps {
  onOpenRuqyah?: () => void;
  lang: string;
}

export const AzkarSection: React.FC<AzkarSectionProps> = ({ lang, onOpenRuqyah }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';
  const [activeTab, setActiveTab] = useState<'sabah' | 'masa' | 'nawm' | 'ruqyah'>('sabah');
  const [userCounters, setUserCounters] = useState<Record<number, number>>({});

  const list = AZKAR[activeTab] || [];

  const handleIncrement = (idx: number, maxCount: number) => {
    const current = userCounters[idx] || 0;
    if (current < maxCount) {
      const next = current + 1;
      setUserCounters((prev) => ({ ...prev, [idx]: next }));
      if (next === maxCount) hapticFeedback.success();
      else hapticFeedback.tap();
      const prevTotal = parseInt(localStorage.getItem('azkar_read') || '0', 10);
      localStorage.setItem('azkar_read', String(prevTotal + 1));
    }
  };

  const handleResetSection = () => {
    hapticFeedback.warning();
    setUserCounters({});
  };

  const totalRequired = list.reduce((acc, curr) => acc + curr.r, 0);
  const totalCompleted = list.reduce((acc, curr, idx) => acc + Math.min(curr.r, userCounters[idx] || 0), 0);
  const pct = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto p-3.5 sm:p-6 pb-28 space-y-4 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Category Switcher */}
      <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl p-1.5 grid grid-cols-2 sm:grid-cols-4 gap-1.5 shadow-sm">
        {(
          [
            ['sabah', t.azkarSabah, Sun],
            ['masa', t.azkarMasa, Sunset],
            ['nawm', t.azkarNawm, Moon],
            ['ruqyah', isRtl ? 'الرقية الشرعية' : 'Ruqyah', Shield],
          ] as const
        ).map(([id, label, Icon]) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => {
                hapticFeedback.selection();
                if (id === 'ruqyah' && onOpenRuqyah) {
                  onOpenRuqyah();
                  return;
                }
                setActiveTab(id);
                setUserCounters({});
              }}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black shadow-md'
                  : 'text-[var(--text2)] hover:text-[var(--gold2)] hover:bg-[var(--bg3)]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Session Progress Ribbon */}
      <div className="bg-[var(--bg2)] border border-[var(--gold)]/22 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-[var(--gold2)] flex items-center gap-1.5 font-amiri text-sm">
              <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>{isRtl ? 'إنجاز أذكار هذه الجلسة' : 'Session Progress'}</span>
            </span>
            <span className="text-[var(--gold2)] tabular-nums">{pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--bg3)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-[var(--gold2)] to-[var(--gold)] transition-all duration-300 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleResetSection}
          className="w-9 h-9 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text2)] hover:text-[var(--gold2)] hover:border-[var(--gold)]/50 flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0"
          title={isRtl ? 'إعادة التصفير' : 'Reset'}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Tactile Manuscript Dhikr Cards */}
      <div className="space-y-3">
        {list.map((item, idx) => {
          const count = userCounters[idx] || 0;
          const remaining = Math.max(0, item.r - count);
          const done = count >= item.r;
          const ratio = item.r > 0 ? Math.min(100, (count / item.r) * 100) : 100;

          return (
            <div
              key={`${activeTab}-${idx}`}
              onClick={() => handleIncrement(idx, item.r)}
              className={`relative overflow-hidden rounded-[22px] border p-5 transition-all duration-200 select-none ${
                done
                  ? 'bg-[var(--green)]/8 border-[var(--green2)]/40 opacity-80'
                  : 'bg-[var(--bg2)] border-[var(--border2)] hover:border-[var(--gold)]/45 cursor-pointer active:scale-[0.99]'
              }`}
            >
              <p className="font-quran text-xl sm:text-[1.45rem] text-[var(--text)] leading-[2.25] dir-rtl text-right">
                {item.z}
              </p>

              {item.b && (
                <p className="text-xs text-[var(--text2)] mt-3 pt-2.5 border-t border-[var(--gold)]/12 leading-relaxed">
                  {item.b}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="text-[0.7rem] text-[var(--text3)]">
                  {done
                    ? isRtl ? 'تم بفضل الله' : 'Completed'
                    : isRtl ? 'اضغط في أي مكان للعدّ' : 'Tap card to count'}
                </span>

                <div
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border tabular-nums ${
                    done
                      ? 'bg-[var(--green)]/20 border-[var(--green2)]/50 text-[var(--green2)]'
                      : 'bg-[var(--gold)]/12 border-[var(--gold)]/40 text-[var(--gold2)]'
                  }`}
                >
                  {done ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'مكتمل' : 'Done'}</span>
                    </>
                  ) : (
                    <span>
                      {isRtl
                        ? `${toArabicDigits(remaining)} / ${toArabicDigits(item.r)}`
                        : `${remaining} / ${item.r}`}
                    </span>
                  )}
                </div>
              </div>

              {/* Subtle bottom progress filament */}
              <div className="absolute bottom-0 inset-x-0 h-[3px] bg-[var(--bg3)]">
                <div
                  className={`h-full transition-all duration-200 ${
                    done ? 'bg-[var(--green2)]' : 'bg-gradient-to-l from-[var(--gold2)] to-[var(--gold)]'
                  }`}
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
