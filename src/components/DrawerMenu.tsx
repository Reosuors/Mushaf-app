import React from 'react';
import { Section, DesignStyleId } from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  X,
  Search,
  BookOpen,
  Clock,
  HeartHandshake,
  Sparkles,
  Palette,
  HardDrive,
  Brain,
  MessageSquare,
  Check,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
} from 'lucide-react';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection: Section;
  onSelectSection: (section: Section) => void;
  lang: string;
  onOpenThemeModal: () => void;
  onOpenOfflineModal: () => void;
  onOpenGlobalSearch: () => void;
  onOpenMemTest: () => void;
  onOpenKhatmahModal?: () => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  currentSection,
  onSelectSection,
  lang,
  onOpenThemeModal,
  onOpenOfflineModal,
  onOpenGlobalSearch,
  onOpenMemTest,
  onOpenKhatmahModal,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';

  const navItems: { id: Section; label: string; icon: string; desc: string }[] = [
    { id: 'quran', label: t.navQuran || 'القرآن الكريم', icon: '📖', desc: 'تلاوة، تفسير، وترجمات' },
    { id: 'prayer', label: t.navPrayer || 'مواقيت الصلاة', icon: '🕌', desc: 'الأذان والقبلة والعد التنازلي' },
    { id: 'azkar', label: t.navAzkar || 'حصن المسلم والأذكار', icon: '🤲', desc: 'أذكار الصباح والمساء والنوم' },
    { id: 'tasbih', label: t.navTasbih || 'المسبحة الإلكترونية', icon: '📿', desc: 'عداد الاستغفار والتسبيح' },
    { id: 'asma', label: t.navAsma || 'أسماء الله الحسنى', icon: '☪️', desc: 'شرح وتدبر الأسماء العظمى' },
    { id: 'support', label: t.navSupport || 'ادعم التطبيق', icon: '💛', desc: 'شاركنا الأجر والخير' },
  ];

  return (
    <div className="fixed inset-0 z-[300] flex animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container (Sliding from Start) */}
      <div
        className={`relative z-10 w-80 max-w-[85vw] bg-[var(--bg2)] border-e border-[var(--border2)] h-full flex flex-col shadow-2xl overflow-hidden transition-transform duration-300 ease-out ${
          isRtl ? 'animate-sheet-up' : 'animate-sheet-up'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-[var(--border2)] flex items-center justify-between bg-[var(--bg)]/70">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🕌</span>
            <div>
              <h3 className="font-amiri text-lg font-bold text-[var(--gold)] leading-none">
                {t.logo || 'المصحف الشريف'}
              </h3>
              <span className="text-[0.62rem] text-[var(--text3)]">
                {isRtl ? 'القائمة الرئيسية الشاملة' : 'Main Drawer Menu'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[var(--bg3)] hover:bg-[var(--bg4)] border border-[var(--border2)] text-[var(--text2)] hover:text-[var(--text)] flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Search Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onClose();
              onOpenGlobalSearch();
            }}
            className="w-full bg-[var(--bg3)] hover:bg-[var(--bg4)] border border-[var(--border2)] hover:border-[var(--gold)] text-[var(--text2)] hover:text-[var(--text)] px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[var(--gold)]" />
              <span>{isRtl ? 'بحث في القرآن والآيات...' : 'Search Quran & Ayahs...'}</span>
            </div>
            <kbd className="text-[0.65rem] bg-[var(--bg)] px-1.5 py-0.5 rounded border border-[var(--border2)] text-[var(--text3)]">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1.5 py-1">
          <div className="text-[0.65rem] font-bold text-[var(--gold)] uppercase px-2 py-1">
            {isRtl ? 'أقسام المصحف' : 'Sections'}
          </div>

          {navItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-start ${
                  isActive
                    ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black shadow-md font-extrabold scale-[1.01]'
                    : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg3)]'
                }`}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="block text-sm truncate">{item.label}</span>
                  <span
                    className={`block text-[0.65rem] truncate mt-0.5 ${
                      isActive ? 'text-black/80 font-medium' : 'text-[var(--text3)]'
                    }`}
                  >
                    {item.desc}
                  </span>
                </div>
                {isActive && <Check className="w-4 h-4 text-black shrink-0" />}
              </button>
            );
          })}

          {/* Khatmah & Memorization Test Shortcuts */}
          <div className="pt-2 space-y-1.5">
            {onOpenKhatmahModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenKhatmahModal();
                }}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-[var(--gold)]/15 to-[var(--gold)]/5 hover:from-[var(--gold)]/25 hover:to-[var(--gold)]/10 border border-[var(--gold)]/30 text-[var(--gold2)] text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <CalendarCheck className="w-4 h-4 text-[var(--gold)]" />
                <span>{isRtl ? 'مخطط ومتابع ختمة القرآن' : 'Khatmah Planner'}</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenMemTest();
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--gold)]/10 hover:bg-[var(--gold)]/20 border border-[var(--gold)]/30 text-[var(--gold)] text-xs font-bold transition-all cursor-pointer"
            >
              <Brain className="w-4 h-4" />
              <span>{isRtl ? 'اختبار الحفظ والتسميع بالمايك' : 'Memorization Voice Test'}</span>
            </button>
          </div>
        </div>

        {/* Drawer Bottom Tools */}
        <div className="p-3 border-t border-[var(--border2)] bg-[var(--bg)]/50 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenThemeModal();
              }}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[var(--bg3)] hover:bg-[var(--bg4)] border border-[var(--border2)] hover:border-[var(--gold)] text-[var(--text2)] text-xs font-bold cursor-pointer transition-all"
            >
              <Palette className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>{isRtl ? 'المظهر والتصميم' : 'Themes'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenOfflineModal();
              }}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[var(--bg3)] hover:bg-[var(--bg4)] border border-[var(--border2)] hover:border-[var(--gold)] text-[var(--text2)] text-xs font-bold cursor-pointer transition-all"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isRtl ? 'الأوفلاين' : 'Offline'}</span>
            </button>
          </div>

          <a
            href="https://discord.gg/VBPmVCBds"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#8ea1ff] text-xs font-bold transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isRtl ? 'انضم لمجتمع ديسكورد' : 'Join Discord Community'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
