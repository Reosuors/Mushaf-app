import React from 'react';
import { Section } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Sparkles, Compass, BookOpen, Clock, HeartHandshake } from 'lucide-react';

interface PortalHeaderHubProps {
  currentSection: Section;
  onSelectSection: (section: Section) => void;
  lang: string;
  onOpenGlobalSearch: () => void;
}

export const PortalHeaderHub: React.FC<PortalHeaderHubProps> = ({
  currentSection,
  onSelectSection,
  lang,
  onOpenGlobalSearch,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';

  const categories: { id: Section; label: string; icon: string }[] = [
    { id: 'quran', label: t.navQuran || 'المصحف والقراءة', icon: '📖' },
    { id: 'prayer', label: t.navPrayer || 'مواقيت الصلاة', icon: '🕌' },
    { id: 'azkar', label: t.navAzkar || 'الأذكار اليومية', icon: '🤲' },
    { id: 'tasbih', label: t.navTasbih || 'المسبحة والاستغفار', icon: '📿' },
    { id: 'asma', label: t.navAsma || 'أسماء الله الحسنى', icon: '☪️' },
    { id: 'support', label: t.navSupport || 'ادعمنا', icon: '💛' },
  ];

  return (
    <div className="w-full bg-gradient-to-b from-[var(--bg2)] to-[var(--bg)] border-b border-[var(--border2)] px-3 sm:px-6 py-2.5 space-y-2 select-none shadow-sm">
      {/* Category Segmented Pill Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const isActive = currentSection === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectSection(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black shadow-md font-extrabold scale-105'
                  : 'bg-[var(--bg3)] hover:bg-[var(--bg4)] text-[var(--text2)] hover:text-[var(--text)] border border-[var(--border2)]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
