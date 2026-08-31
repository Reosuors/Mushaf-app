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
      className="h-[var(--nav-h)] bg-[var(--bg)]/95 backdrop-blur-md border-t border-[var(--border2)] flex items-center justify-around shrink-0 relative z-50 transition-colors px-1"
    >
      {navItems.map((item) => {
        const isActive = currentSection === item.id;
        return (
          <button
            key={item.id}
            id={`nav-item-${item.id}`}
            onClick={() => onSelectSection(item.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-0.5 cursor-pointer transition-all ${
              isActive ? 'text-[var(--gold)] font-bold' : 'text-[var(--text3)] hover:text-[var(--text2)]'
            } ${item.isSupport && isActive ? 'animate-heartbeat' : ''}`}
          >
            <span
              className={`text-xl sm:text-2xl transition-transform duration-200 ${
                isActive ? 'scale-115 -translate-y-0.5' : 'scale-95'
              } ${item.isSupport ? 'drop-shadow-[0_0_8px_rgba(201,168,76,0.5)]' : ''}`}
            >
              {item.icon}
            </span>
            <span className="text-[0.64rem] sm:text-[0.7rem] font-bold tracking-tight whitespace-nowrap leading-none">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
