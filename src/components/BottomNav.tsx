import React from 'react';
import { Section } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { hapticFeedback } from '../utils/haptics';
import { SectionIcon } from './IslamicOrnaments';

interface BottomNavProps {
  currentSection: Section;
  onSelectSection: (section: Section) => void;
  lang: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentSection,
  onSelectSection,
  lang,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';

  const navItems: { id: Section; label: string }[] = [
    { id: 'quran', label: t.navQuran || 'القرآن' },
    { id: 'prayer', label: t.navPrayer || 'الصلاة' },
    { id: 'azkar', label: t.navAzkar || 'الأذكار' },
    { id: 'tasbih', label: t.navTasbih || 'التسبيح' },
    { id: 'asma', label: t.navAsma || 'الأسماء' },
    { id: 'ruqyah', label: isRtl ? 'الرقية' : 'Ruqyah' },
    { id: 'support', label: t.navSupport || 'ادعمنا' },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      role="navigation"
      aria-label="Main Navigation"
      className="bottom-nav shrink-0 bg-[var(--bg2)]/96 backdrop-blur-2xl border-t border-[var(--gold)]/20 flex items-center justify-around z-40 transition-colors px-1 sm:px-4 shadow-[0_-10px_32px_rgba(0,0,0,0.5)] select-none relative"
    >
      {/* Subtle illuminated top filament */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 5%, color-mix(in srgb, var(--gold) 38%, transparent) 50%, transparent 95%)',
        }}
        aria-hidden="true"
      />

      <div className="w-full max-w-2xl mx-auto flex items-center justify-between gap-0.5 sm:gap-1">
        {navItems.map((item) => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              type="button"
              onClick={() => {
                hapticFeedback.navigation();
                onSelectSection(item.id);
              }}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-1 py-1.5 px-0.5 rounded-2xl transition-all duration-200 cursor-pointer touch-manipulation relative group ${
                isActive
                  ? 'text-[var(--gold2)]'
                  : 'text-[var(--text3)] hover:text-[var(--text2)] active:scale-95'
              }`}
            >
              {/* Gilded diamond + glow bar for active tab */}
              {isActive && (
                <span className="absolute -top-[1px] flex items-center justify-center">
                  <span className="w-7 h-[2.5px] rounded-full bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent shadow-[0_0_10px_var(--gold)]" />
                </span>
              )}

              <span
                className={`w-8 h-7 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-[var(--gold)]/14 text-[var(--gold2)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--gold)_32%,transparent)]'
                    : 'group-hover:bg-[var(--bg3)]/70'
                }`}
              >
                <SectionIcon id={item.id} active={isActive} className="w-[18px] h-[18px]" />
              </span>

              <span
                className={`text-[0.63rem] sm:text-[0.7rem] tracking-tight whitespace-nowrap leading-none truncate max-w-full ${
                  isActive ? 'font-extrabold text-[var(--gold2)]' : 'font-semibold'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
