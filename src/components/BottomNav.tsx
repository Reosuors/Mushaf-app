import React from 'react';
import { Section } from '../types';
import { TRANSLATIONS } from '../data/translations';

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

  const navItems: { id: Section; label: string; icon: string; isSupport?: boolean }[] = [
    { id: 'prayer', label: t.navPrayer || 'الصلاة', icon: '🕌' },
    { id: 'quran', label: t.navQuran || 'القرآن', icon: '📖' },
    { id: 'azkar', label: t.navAzkar || 'الأذكار', icon: '🤲' },
    { id: 'tasbih', label: t.navTasbih || 'التسبيح', icon: '📿' },
    { id: 'asma', label: t.navAsma || 'الأسماء', icon: '☪️' },
    { id: 'support', label: t.navSupport || 'ادعمنا', icon: '💛', isSupport: true },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      role="navigation"
      aria-label="Main Navigation"
      className="bottom-nav shrink-0 bg-[var(--bg2)]/98 backdrop-blur-xl border-t border-[var(--border2)] flex items-center justify-around z-40 transition-colors px-1 sm:px-4 shadow-[0_-4px_25px_rgba(0,0,0,0.35)] select-none"
    >
      <div className="w-full max-w-lg mx-auto flex items-center justify-between gap-1">
        {navItems.map((item) => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-2xl transition-all duration-200 cursor-pointer touch-manipulation relative group ${
                isActive
                  ? 'text-[var(--gold)] bg-[var(--gold)]/12 font-bold shadow-sm'
                  : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg3)] active:scale-95'
              }`}
            >
              {/* Active top indicator pill */}
              {isActive && (
                <span className="absolute -top-1 w-6 h-1 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] shadow-[0_0_10px_var(--gold)]" />
              )}
              <span
                className={`text-lg sm:text-xl transition-transform duration-200 ${
                  isActive ? 'scale-115 -translate-y-0.5' : 'group-hover:scale-105'
                } ${item.isSupport && isActive ? 'animate-heartbeat' : ''}`}
              >
                {item.icon}
              </span>
              <span className="text-[0.66rem] sm:text-xs font-bold tracking-tight whitespace-nowrap leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
