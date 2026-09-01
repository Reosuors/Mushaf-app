import React from 'react';
import { Section } from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  BookOpen,
  Clock,
  HeartHandshake,
  Sparkles,
  Layers,
  Crown,
  HardDrive,
  Palette,
  Search,
  Check,
} from 'lucide-react';

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

  const navItems: { id: Section; label: string; icon: string; desc: string }[] = [
    { id: 'quran', label: t.navQuran || 'القرآن الكريم', icon: '📖', desc: 'تلاوة، تفسير وترجمات' },
    { id: 'prayer', label: t.navPrayer || 'مواقيت الصلاة', icon: '🕌', desc: 'الأذان والقبلة' },
    { id: 'azkar', label: t.navAzkar || 'حصن المسلم', icon: '🤲', desc: 'أذكار الصباح والمساء' },
    { id: 'tasbih', label: t.navTasbih || 'المسبحة الإلكترونية', icon: '📿', desc: 'عداد الأذكار والاستغفار' },
    { id: 'asma', label: t.navAsma || 'أسماء الله الحسنى', icon: '☪️', desc: 'شرح وتدبر الأسماء' },
    { id: 'support', label: t.navSupport || 'ادعم التطبيق', icon: '💛', desc: 'شاركنا الأجر' },
  ];

  return (
    <aside className="w-64 lg:w-72 bg-[var(--bg2)] border-e border-[var(--border2)] flex flex-col shrink-0 h-full select-none z-30 transition-all shadow-xl">
      {/* Brand Header */}
      <div className="p-4 border-b border-[var(--border2)] flex items-center justify-between">
        <button
          onClick={onLogoClick}
          className="font-amiri text-2xl font-bold text-[var(--gold)] hover:text-[var(--gold2)] flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span>🕌</span>
          <span>{t.logo || 'المصحف الشريف'}</span>
        </button>

        <span className="text-[0.62rem] font-bold text-[var(--gold)] bg-[var(--gold)]/10 px-2 py-0.5 rounded-md border border-[var(--gold)]/30">
          PRO
        </span>
      </div>

      {/* Quick Search Shortcut */}
      <div className="p-3">
        <button
          onClick={onOpenGlobalSearch}
          className="w-full bg-[var(--bg3)] hover:bg-[var(--bg4)] border border-[var(--border2)] hover:border-[var(--gold)] text-[var(--text2)] hover:text-[var(--text)] px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span>{isRtl ? 'بحث في القرآن والسور...' : 'Search Quran...'}</span>
          </div>
          <kbd className="text-[0.6rem] bg-[var(--bg)] px-1.5 py-0.5 rounded border border-[var(--border2)] text-[var(--text3)]">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="text-[0.65rem] font-bold text-[var(--gold)] uppercase px-3 py-1">
          {isRtl ? 'الأقسام الرئيسية' : 'Main Sections'}
        </div>

        {navItems.map((item) => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-start ${
                isActive
                  ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black shadow-md font-extrabold scale-[1.02]'
                  : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg3)]'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="block truncate">{item.label}</span>
                <span
                  className={`block text-[0.62rem] truncate ${
                    isActive ? 'text-black/75' : 'text-[var(--text3)]'
                  }`}
                >
                  {item.desc}
                </span>
              </div>
              {isActive && <Check className="w-4 h-4 text-black shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Bottom Utility Tools */}
      <div className="p-3 border-t border-[var(--border2)] bg-[var(--bg)]/40 space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={onOpenThemeModal}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-[var(--bg3)] hover:bg-[var(--bg4)] border border-[var(--border2)] hover:border-[var(--gold)] text-[var(--text2)] text-xs font-semibold cursor-pointer transition-all"
          >
            <Palette className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span>{isRtl ? 'المظهر' : 'Themes'}</span>
          </button>

          <button
            onClick={onOpenOfflineModal}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-[var(--bg3)] hover:bg-[var(--bg4)] border border-[var(--border2)] hover:border-[var(--gold)] text-[var(--text2)] text-xs font-semibold cursor-pointer transition-all"
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isRtl ? 'الأوفلاين' : 'Offline'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
