import React from 'react';
import { Section } from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  X,
  Search,
  Palette,
  HardDrive,
  Brain,
  MessageSquare,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MihrabBackdrop, MushafLogoEmblem, SectionIcon, GoldDivider } from './IslamicOrnaments';
import { hapticFeedback } from '../utils/haptics';

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
  onOpenReport?: () => void;
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
  onOpenReport,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';
  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  const navItems: { id: Section; label: string; desc: string }[] = [
    { id: 'quran', label: t.navQuran || 'القرآن الكريم', desc: isRtl ? 'تلاوة، تفسير، وعلامات' : 'Recitation, tafsir & bookmarks' },
    { id: 'prayer', label: t.navPrayer || 'مواقيت الصلاة', desc: isRtl ? 'الأذان والقبلة والعد التنازلي' : 'Prayer times, Adhan & Qibla' },
    { id: 'ruqyah', label: isRtl ? 'الرقية الشرعية' : 'Ruqyah Shariah', desc: isRtl ? 'آيات وأدعية — قراءة واستماع' : 'Quranic verses & Sunnah duas' },
    { id: 'azkar', label: t.navAzkar || 'حصن المسلم والأذكار', desc: isRtl ? 'أذكار الصباح والمساء والنوم' : 'Morning, evening & sleep adhkar' },
    { id: 'tasbih', label: t.navTasbih || 'المسبحة الإلكترونية', desc: isRtl ? 'عداد التسبيح والاستغفار' : 'Digital tasbih counter' },
    { id: 'asma', label: t.navAsma || 'أسماء الله الحسنى', desc: isRtl ? 'التدبر والمعاني والنطق' : '99 Names & reflections' },
    { id: 'support', label: t.navSupport || 'ادعم التطبيق', desc: isRtl ? 'صدقة جارية لاستمرار التطبيق' : 'Support ad-free development' },
    { id: 'about', label: isRtl ? 'عن التطبيق والمصادر' : 'About & Sources', desc: isRtl ? 'مصدر نص القرآن والتلاوات' : 'Tanzil text & audio credits' },
  ];

  return (
    <div className="fixed inset-0 z-[300] flex animate-fade-in">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="relative z-10 w-[310px] max-w-[86vw] bg-[var(--bg2)] border-e border-[var(--gold)]/25 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Illuminated Mihrab Drawer Header */}
        <div className="relative px-5 pt-5 pb-4 border-b border-[var(--gold)]/20 bg-gradient-to-b from-[var(--bg3)] to-[var(--bg2)] overflow-hidden">
          <MihrabBackdrop className="opacity-70" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MushafLogoEmblem className="w-9 h-9" />
              <div>
                <h2 className="font-amiri text-2xl font-bold text-[var(--gold2)] leading-none">
                  {t.logo || 'مصحف'}
                </h2>
                <p className="text-[0.66rem] text-[var(--text2)] mt-1">
                  {isRtl ? 'القرآن الكريم · بالرسم العثماني' : 'Noble Quran · Uthmani Script'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close Menu"
              className="w-8 h-8 rounded-xl bg-[var(--bg)]/70 border border-[var(--border2)] text-[var(--text2)] hover:text-[var(--gold2)] flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Quick Study Tools Grid */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenGlobalSearch();
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg3)]/80 border border-[var(--border2)] hover:border-[var(--gold)]/50 text-[var(--text)] text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              <Search className="w-4 h-4 text-[var(--gold)] shrink-0" />
              <span className="truncate">{isRtl ? 'بحث في الآيات' : 'Search Quran'}</span>
            </button>

            {onOpenKhatmahModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenKhatmahModal();
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg3)]/80 border border-[var(--border2)] hover:border-[var(--gold)]/50 text-[var(--text)] text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                <CalendarCheck className="w-4 h-4 text-[var(--gold)] shrink-0" />
                <span className="truncate">{isRtl ? 'مخطط الختمة' : 'Khatmah'}</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenMemTest();
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg3)]/80 border border-[var(--border2)] hover:border-[var(--gold)]/50 text-[var(--text)] text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              <Brain className="w-4 h-4 text-[var(--gold)] shrink-0" />
              <span className="truncate">{isRtl ? 'اختبار الحفظ' : 'Memorize'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenThemeModal();
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--gold)]/12 border border-[var(--gold)]/35 hover:bg-[var(--gold)]/20 text-[var(--gold2)] text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              <Palette className="w-4 h-4 text-[var(--gold)] shrink-0" />
              <span className="truncate">{isRtl ? 'المظهر والخط' : 'Appearance'}</span>
            </button>
          </div>

          <GoldDivider className="opacity-60" />

          {/* Main Sections List */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    hapticFeedback.navigation();
                    onSelectSection(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl transition-all cursor-pointer text-start ${
                    isActive
                      ? 'bg-[var(--gold)]/14 border border-[var(--gold)]/40 text-[var(--gold2)] shadow-sm'
                      : 'border border-transparent text-[var(--text)] hover:bg-[var(--bg3)]/70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isActive
                          ? 'bg-[var(--gold)] text-black border-[var(--gold)]'
                          : 'bg-[var(--bg3)] border-[var(--border2)] text-[var(--gold)]'
                      }`}
                    >
                      <SectionIcon id={item.id} active={isActive} className="w-[18px] h-[18px]" />
                    </span>
                    <div className="min-w-0">
                      <div className={`text-xs sm:text-sm font-bold truncate ${isActive ? 'text-[var(--gold2)]' : 'text-[var(--text)]'}`}>
                        {item.label}
                      </div>
                      <div className="text-[0.65rem] text-[var(--text3)] truncate mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  <ArrowIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--gold)]' : 'text-[var(--text3)] opacity-50'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Drawer Footer Utilities */}
        <div className="p-3 border-t border-[var(--border2)] bg-[var(--bg)]/60 space-y-2">
          <button
            onClick={() => {
              onClose();
              onOpenOfflineModal();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--border2)] hover:border-[var(--gold)]/50 text-xs font-bold text-[var(--text2)] hover:text-[var(--gold2)] transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[var(--gold)]" />
              <span>{isRtl ? 'إدارة التحميل بدون إنترنت' : 'Offline Downloads'}</span>
            </span>
            <ArrowIcon className="w-3.5 h-3.5 opacity-60" />
          </button>

          {onOpenReport && (
            <button
              onClick={() => {
                onClose();
                onOpenReport();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--border2)] hover:border-[var(--gold)]/50 text-xs font-bold text-[var(--text2)] hover:text-[var(--gold2)] transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[var(--gold)]" />
                <span>{isRtl ? 'إبلاغ عن مشكلة / بلاغاتي' : 'Report a Problem'}</span>
              </span>
              <ArrowIcon className="w-3.5 h-3.5 opacity-60" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
