import React from 'react';
import { Section } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { HardDrive, Palette, Search } from 'lucide-react';
import { MushafLogoEmblem, SectionIcon, GoldDivider } from './IslamicOrnaments';
import { hapticFeedback } from '../utils/haptics';

interface SidebarDashboardNavProps {
  currentSection: Section;
  onSelectSection: (section: Section) => void;
  lang: string;
  onOpenThemeModal: () => void;
  onOpenOfflineModal: () => void;
  onOpenGlobalSearch: () => void;
  onLogoClick: () => void;
}

export const SidebarDashboardNav: React.FC<SidebarDashboardNavProps> = ({
  currentSection,
  onSelectSection,
  lang,
  onOpenThemeModal,
  onOpenOfflineModal,
  onOpenGlobalSearch,
  onLogoClick,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';

  const navItems: { id: Section; label: string; desc: string }[] = [
    { id: 'quran', label: t.navQuran || 'القرآن الكريم', desc: isRtl ? 'تلاوة، تفسير وترجمات' : 'Read & listen' },
    { id: 'prayer', label: t.navPrayer || 'مواقيت الصلاة', desc: isRtl ? 'الأذان والقبلة' : 'Prayer & Qibla' },
    { id: 'ruqyah', label: isRtl ? 'الرقية الشرعية' : 'Ruqyah', desc: isRtl ? 'آيات وأدعية' : 'Verses & duas' },
    { id: 'azkar', label: t.navAzkar || 'حصن المسلم', desc: isRtl ? 'أذكار الصباح والمساء' : 'Daily adhkar' },
    { id: 'tasbih', label: t.navTasbih || 'المسبحة الإلكترونية', desc: isRtl ? 'عداد الاستغفار' : 'Tasbih counter' },
    { id: 'asma', label: t.navAsma || 'أسماء الله الحسنى', desc: isRtl ? 'التدبر والمعاني' : '99 Names' },
    { id: 'support', label: t.navSupport || 'ادعم التطبيق', desc: isRtl ? 'شاركنا الأجر' : 'Support Mushaf' },
  ];

  return (
    <aside className="w-64 lg:w-72 bg-[var(--bg2)] border-e border-[var(--gold)]/20 flex flex-col shrink-0 h-full select-none z-30 transition-all shadow-xl">
      <div className="p-4 border-b border-[var(--border2)] flex items-center justify-between">
        <button onClick={onLogoClick} className="flex items-center gap-2.5 cursor-pointer group">
          <MushafLogoEmblem className="w-8 h-8 transition-transform group-hover:rotate-12" />
          <div className="text-start">
            <div className="font-amiri text-xl font-bold text-[var(--gold2)] leading-none">
              {t.logo || 'مصحف'}
            </div>
            <div className="text-[0.62rem] text-[var(--text3)] mt-0.5">
              {isRtl ? 'القرآن الكريم' : 'Noble Quran'}
            </div>
          </div>
        </button>

        <button
          onClick={onOpenGlobalSearch}
          className="w-8 h-8 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] flex items-center justify-center text-[var(--gold)] hover:border-[var(--gold)]/60 cursor-pointer"
          title={isRtl ? 'بحث في الآيات' : 'Search'}
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                hapticFeedback.navigation();
                onSelectSection(item.id);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all cursor-pointer text-start ${
                isActive
                  ? 'bg-[var(--gold)]/14 border border-[var(--gold)]/40 text-[var(--gold2)]'
                  : 'border border-transparent text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text)]'
              }`}
            >
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-[var(--gold)] text-black'
                    : 'bg-[var(--bg3)] text-[var(--gold)]'
                }`}
              >
                <SectionIcon id={item.id} active={isActive} className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">{item.label}</div>
                <div className="text-[0.62rem] text-[var(--text3)] truncate">{item.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      <GoldDivider className="px-4 opacity-50" />

      <div className="p-3 grid grid-cols-2 gap-2">
        <button
          onClick={onOpenThemeModal}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] hover:border-[var(--gold)]/50 text-xs font-bold text-[var(--gold2)] cursor-pointer"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>{isRtl ? 'المظهر' : 'Theme'}</span>
        </button>
        <button
          onClick={onOpenOfflineModal}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] hover:border-[var(--gold)]/50 text-xs font-bold text-[var(--text2)] cursor-pointer"
        >
          <HardDrive className="w-3.5 h-3.5 text-[var(--gold)]" />
          <span>{isRtl ? 'أوفلاين' : 'Offline'}</span>
        </button>
      </div>
    </aside>
  );
};
