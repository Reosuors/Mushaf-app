import React from 'react';
import { Section } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { BookOpen, Clock, HeartHandshake, Sparkles, Brain, Award } from 'lucide-react';
import { hapticFeedback } from '../utils/haptics';

interface TopNavbarHubProps {
  currentSection: Section;
  onSelectSection: (section: Section) => void;
  lang: string;
  onOpenGlobalSearch: () => void;
  onOpenMemTest: () => void;
}

export const TopNavbarHub: React.FC<TopNavbarHubProps> = ({
  currentSection,
  onSelectSection,
  lang,
  onOpenGlobalSearch,
  onOpenMemTest,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';

  const navTabs: { id: Section; label: string; icon: string }[] = [
    { id: 'quran', label: t.navQuran || 'القرآن الكريم', icon: '📖' },
    { id: 'prayer', label: t.navPrayer || 'مواقيت الصلاة', icon: '🕌' },
    { id: 'azkar', label: t.navAzkar || 'حصن المسلم', icon: '🤲' },
    { id: 'tasbih', label: t.navTasbih || 'المسبحة', icon: '📿' },
    { id: 'asma', label: t.navAsma || 'أسماء الله', icon: '☪️' },
    { id: 'support', label: t.navSupport || 'ادعمنا', icon: '💛' },
  ];

  return (
    <div className="w-full bg-[var(--bg2)]/95 backdrop-blur-md border-b border-[var(--border2)] px-3 sm:px-6 py-2 sticky top-[54px] z-30 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Navigation Tabs in Top Bar */}
        <div className="flex items-center gap-1.5 shrink-0 py-0.5">
          {navTabs.map((tab) => {
            const isActive = currentSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  hapticFeedback.navigation();
                  onSelectSection(tab.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black shadow-md font-extrabold scale-105'
                    : 'bg-[var(--bg3)] hover:bg-[var(--bg4)] text-[var(--text2)] hover:text-[var(--text)] border border-[var(--border2)] hover:border-[var(--gold)]/40'
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Voice Memorization Shortcut */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenMemTest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--gold)]/10 hover:bg-[var(--gold)]/20 border border-[var(--gold)]/30 text-[var(--gold)] text-xs font-bold transition-all cursor-pointer"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تسميع بالصوت' : 'Voice Test'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
