import React from 'react';
import { Section } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Search } from 'lucide-react';
import { hapticFeedback } from '../utils/haptics';
import { SectionIcon } from './IslamicOrnaments';

interface TopNavbarHubProps {
  currentSection: Section;
  onSelectSection: (section: Section) => void;
  lang: string;
  onOpenGlobalSearch: () => void;
  onOpenMemTest?: () => void;
}

export const TopNavbarHub: React.FC<TopNavbarHubProps> = ({
  currentSection,
  onSelectSection,
  lang,
  onOpenGlobalSearch,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';

  const navTabs: { id: Section; label: string }[] = [
    { id: 'quran', label: t.navQuran || 'القرآن' },
    { id: 'prayer', label: t.navPrayer || 'الصلاة' },
    { id: 'ruqyah', label: isRtl ? 'الرقية' : 'Ruqyah' },
    { id: 'azkar', label: t.navAzkar || 'الأذكار' },
    { id: 'tasbih', label: t.navTasbih || 'التسبيح' },
    { id: 'asma', label: t.navAsma || 'الأسماء' },
    { id: 'support', label: t.navSupport || 'ادعمنا' },
  ];

  return (
    <div className="w-full bg-[var(--bg2)]/95 backdrop-blur-xl border-b border-[var(--gold)]/20 px-3 sm:px-6 py-2 sticky top-0 z-30 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 shrink-0 py-0.5">
          {navTabs.map((tab) => {
            const isActive = currentSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  hapticFeedback.navigation();
                  onSelectSection(tab.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black shadow-sm'
                    : 'text-[var(--text2)] hover:text-[var(--gold2)] hover:bg-[var(--bg3)]'
                }`}
              >
                <SectionIcon id={tab.id} active={isActive} className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onOpenGlobalSearch}
          className="px-3 py-1.5 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] hover:border-[var(--gold)]/50 text-xs font-bold text-[var(--gold2)] flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isRtl ? 'بحث' : 'Search'}</span>
        </button>
      </div>
    </div>
  );
};
