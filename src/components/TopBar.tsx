import React, { useState, useEffect, useRef } from 'react';
import { Section, DesignStyleId } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Palette, ChevronDown, Check, Search, HardDrive, Menu } from 'lucide-react';
import { MushafLogoEmblem, SectionIcon } from './IslamicOrnaments';
import { hapticFeedback } from '../utils/haptics';

interface TopBarProps {
  lang: string;
  currentSection?: Section;
  currentDesignStyle?: DesignStyleId;
  onSelectSection?: (section: Section) => void;
  onSelectLang: (code: string) => void;
  onOpenThemeModal: () => void;
  onOpenOfflineModal?: () => void;
  onOpenDrawerMenu?: () => void;
  onLogoClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  lang,
  currentSection,
  currentDesignStyle,
  onSelectSection,
  onSelectLang,
  onOpenThemeModal,
  onOpenOfflineModal,
  onOpenDrawerMenu,
  onLogoClick,
}) => {
  const [hijriDate, setHijriDate] = useState<string>('');
  const [langOpen, setLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const langRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    async function fetchHijri() {
      try {
        if (navigator.onLine) {
          const today = new Date();
          const dd = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
          const res = await fetch(`https://api.aladhan.com/v1/gToH?date=${dd}`);
          const data = await res.json();
          const h = data.data?.hijri;
          if (h) {
            setHijriDate(`${h.day} ${h.month.ar} ${h.year}`);
            localStorage.setItem('cached_hijri', `${h.day} ${h.month.ar} ${h.year}`);
            return;
          }
        }
      } catch {}
      const cached = localStorage.getItem('cached_hijri');
      setHijriDate(cached || '١٤٤٧ هـ');
    }
    fetchHijri();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languageList = Object.entries(TRANSLATIONS).map(([code, d]) => ({
    code,
    name: d.name || code,
    flag: d.flag || '🌐',
  }));

  const filteredLangs = languageList.filter(
    (l) =>
      l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <header className="h-[58px] bg-[var(--bg)]/88 backdrop-blur-xl border-b border-[var(--gold)]/18 flex items-center justify-between px-3 sm:px-5 shrink-0 relative z-50 transition-colors">
      {/* Subtle top-edge golden filament */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--gold) 32%, transparent) 50%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Start: Menu Trigger + Calligraphic Mushaf Brand Lockup */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        {onOpenDrawerMenu && (
          <button
            id="topbar-drawer-menu-btn"
            onClick={() => {
              hapticFeedback.tap();
              onOpenDrawerMenu();
            }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 ${
              currentDesignStyle === 'drawer' || currentDesignStyle === 'minimal'
                ? 'bg-gradient-to-br from-[var(--gold)] to-[var(--gold2)] text-black shadow-md'
                : 'bg-[var(--bg2)] border border-[var(--border2)] text-[var(--text2)] hover:border-[var(--gold)]/60 hover:text-[var(--gold2)]'
            }`}
            title={isRtl ? 'القائمة الرئيسية' : 'Main Menu'}
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-[18px] h-[18px] stroke-[2.2]" />
          </button>
        )}

        <button
          id="app-logo-btn"
          onClick={onLogoClick}
          className="group flex items-center gap-2 cursor-pointer py-1 shrink-0"
        >
          <MushafLogoEmblem className="w-7 h-7 transition-transform duration-300 group-hover:rotate-12" />
          <div className="flex flex-col items-start leading-none">
            <span className="font-amiri text-[1.4rem] font-bold text-[var(--gold2)] group-hover:text-[var(--gold3)] transition-colors tracking-wide">
              {t.logo || 'مصحف'}
            </span>
          </div>
        </button>

        {!isOnline && (
          <div
            title={isRtl ? 'وضع عدم الاتصال' : 'Offline mode'}
            className="flex items-center gap-1 text-[0.64rem] px-2 py-0.5 rounded-full bg-amber-500/12 border border-amber-500/30 text-amber-400 font-semibold shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="hidden xs:inline">{isRtl ? 'أوفلاين' : 'Offline'}</span>
          </div>
        )}
      </div>

      {/* Center: Architectural Desktop Navigation Pill */}
      {onSelectSection && (
        <nav
          aria-label="Desktop Navigation"
          className="hidden lg:flex items-center gap-0.5 bg-[var(--bg2)]/90 px-1.5 py-1 rounded-full border border-[var(--border2)] shadow-inner"
        >
          {navItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  hapticFeedback.navigation();
                  onSelectSection(item.id);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black shadow-[0_2px_12px_rgba(212,175,55,0.35)]'
                    : 'text-[var(--text2)] hover:text-[var(--gold2)] hover:bg-[var(--bg3)]/70'
                }`}
              >
                <SectionIcon id={item.id} active={isActive} className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* End: Hijri Date + Utility Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {hijriDate && (
          <div
            id="hijri-date-badge"
            className="hidden sm:flex items-center text-[0.7rem] font-amiri font-bold text-[var(--gold2)]/90 px-2.5 py-1 bg-[var(--bg2)] border border-[var(--gold)]/20 rounded-full whitespace-nowrap"
          >
            {hijriDate}
          </div>
        )}

        {onOpenOfflineModal && (
          <button
            id="offline-manager-btn"
            onClick={onOpenOfflineModal}
            className="w-9 h-9 rounded-xl bg-[var(--bg2)] border border-[var(--border2)] flex items-center justify-center text-[var(--text2)] hover:text-[var(--gold2)] hover:border-[var(--gold)]/55 transition-all cursor-pointer active:scale-95"
            title={isRtl ? 'التحميل والأوفلاين' : 'Offline Manager'}
            aria-label="Offline Manager"
          >
            <HardDrive className="w-4 h-4" />
          </button>
        )}

        <button
          id="theme-toggle-btn"
          onClick={onOpenThemeModal}
          className="w-9 h-9 rounded-xl bg-[var(--bg2)] border border-[var(--border2)] flex items-center justify-center text-[var(--gold)] hover:text-[var(--gold2)] hover:border-[var(--gold)]/60 hover:bg-[var(--gold)]/10 transition-all cursor-pointer active:scale-95"
          title={isRtl ? 'المظهر والتصميم والخطوط' : 'Themes & Layouts'}
          aria-label="Change Theme"
        >
          <Palette className="w-4 h-4" />
        </button>

        {/* Language selector */}
        <div className="relative" ref={langRef}>
          <button
            id="lang-selector-btn"
            onClick={() => setLangOpen(!langOpen)}
            className={`flex items-center gap-1 bg-[var(--bg2)] border text-[var(--text2)] px-2.5 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 hover:border-[var(--gold)]/60 hover:text-[var(--text)] ${
              langOpen
                ? 'border-[var(--gold)] text-[var(--gold2)] bg-[var(--gold)]/10'
                : 'border-[var(--border2)]'
            }`}
            aria-label="Select Language"
          >
            <span className="text-sm leading-none">{t.flag}</span>
            <span className="hidden xs:inline text-[0.72rem] font-bold">{t.name}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                langOpen ? 'rotate-180 opacity-90' : 'opacity-60'
              }`}
            />
          </button>

          {langOpen && (
            <div className="absolute top-[calc(100%+8px)] end-0 bg-[var(--bg2)] border border-[var(--gold)]/30 rounded-2xl w-56 max-h-80 shadow-2xl z-[200] overflow-hidden flex flex-col animate-drop-in">
              <div className="p-2 border-b border-[var(--border2)] bg-[var(--bg2)] sticky top-0 z-10 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[var(--text3)]" />
                <input
                  type="text"
                  placeholder={isRtl ? 'بحث عن لغة...' : 'Search language...'}
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] text-xs rounded-lg px-2 py-1.5 outline-none focus:border-[var(--gold)]"
                />
              </div>

              <div className="overflow-y-auto flex-1 p-1 space-y-0.5">
                {filteredLangs.map((item) => {
                  const isSelected = item.code === lang;
                  return (
                    <button
                      key={item.code}
                      onClick={() => {
                        onSelectLang(item.code);
                        setLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--gold)]/15 text-[var(--gold2)] font-bold'
                          : 'text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text)]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{item.flag}</span>
                        <span>{item.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[var(--gold)]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
