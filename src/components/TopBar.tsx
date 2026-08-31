import React, { useState, useEffect, useRef } from 'react';
import { TRANSLATIONS } from '../data/translations';
import { Palette, Globe, ChevronDown, Check, Search, HardDrive, Wifi, WifiOff } from 'lucide-react';

interface TopBarProps {
  lang: string;
  onSelectLang: (code: string) => void;
  onOpenThemeModal: () => void;
  onOpenOfflineModal?: () => void;
  onLogoClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  lang,
  onSelectLang,
  onOpenThemeModal,
  onOpenOfflineModal,
  onLogoClick,
}) => {
  const [hijriDate, setHijriDate] = useState<string>('—');
  const [langOpen, setLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const langRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur';

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

  const filteredLangs = languageList.filter((l) =>
    l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <header className="h-[54px] bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border2)] flex items-center justify-between px-3 sm:px-5 shrink-0 relative z-50 transition-colors">
      {/* App Logo */}
      <div className="flex items-center gap-2">
        <button
          id="app-logo-btn"
          onClick={onLogoClick}
          className="font-amiri text-2xl font-bold text-[var(--gold)] hover:text-[var(--gold2)] transition-colors cursor-pointer tracking-wide flex items-center gap-1.5"
        >
          <span>{t.logo || 'مصحف'}</span>
        </button>

        {/* Connectivity status indicator */}
        <div
          title={isOnline ? (isRtl ? 'متصل بالإنترنت' : 'Online') : (isRtl ? 'وضع عدم الاتصال (Offline)' : 'Offline mode')}
          className={`flex items-center gap-1 text-[0.65rem] px-2 py-0.5 rounded-full border transition-all ${
            isOnline
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
              : 'bg-amber-500/15 border-amber-500/40 text-amber-500 animate-pulse'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="hidden sm:inline font-sans font-semibold">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Right widgets */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Hijri date badge */}
        <div
          id="hijri-date-badge"
          className="text-[0.7rem] text-[var(--text2)] px-2.5 py-1 bg-[var(--gold)]/5 border border-[var(--border2)] rounded-lg whitespace-nowrap font-medium hidden xs:flex items-center"
        >
          {hijriDate}
        </div>

        {/* Offline Manager button */}
        {onOpenOfflineModal && (
          <button
            id="offline-manager-btn"
            onClick={onOpenOfflineModal}
            className="w-9 h-9 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] flex items-center justify-center text-[var(--text2)] hover:text-[var(--gold)] hover:border-[var(--gold)] hover:bg-[var(--gold)]/10 transition-all cursor-pointer shadow-sm active:scale-95"
            title={isRtl ? 'تحميل السور والأوفلاين' : 'Offline Manager'}
            aria-label="Offline Manager"
          >
            <HardDrive className="w-4 h-4" />
          </button>
        )}

        {/* Theme button */}
        <button
          id="theme-toggle-btn"
          onClick={onOpenThemeModal}
          className="w-9 h-9 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] flex items-center justify-center text-[var(--text2)] hover:text-[var(--gold)] hover:border-[var(--gold)] hover:bg-[var(--gold)]/10 transition-all cursor-pointer shadow-sm active:scale-95"
          title="الثيمات / Themes"
          aria-label="Change Theme"
        >
          <Palette className="w-4 h-4" />
        </button>

        {/* Language dropdown */}
        <div className="relative" ref={langRef}>
          <button
            id="lang-selector-btn"
            onClick={() => setLangOpen(!langOpen)}
            className={`flex items-center gap-1.5 bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text2)] px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 min-h-[34px] hover:border-[var(--gold)] hover:text-[var(--text)] ${
              langOpen ? 'border-[var(--gold)] text-[var(--gold)] bg-[var(--gold)]/10' : ''
            }`}
            aria-label="Select Language"
          >
            <span className="text-sm leading-none">{t.flag}</span>
            <span className="text-[0.76rem] font-bold">{t.name}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                langOpen ? 'rotate-180 opacity-90' : 'opacity-60'
              }`}
            />
          </button>

          {langOpen && (
            <div className="absolute top-[calc(100%+8px)] start-0 sm:start-auto sm:end-0 bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl w-56 max-h-80 shadow-2xl z-[200] overflow-hidden flex flex-col animate-drop-in">
              {/* Search box inside language menu */}
              <div className="p-2 border-b border-[var(--border2)] bg-[var(--bg2)] sticky top-0 z-10 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[var(--text3)]" />
                <input
                  type="text"
                  placeholder="Search / بحث..."
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] text-xs rounded-lg px-2 py-1 outline-none focus:border-[var(--gold)]"
                />
              </div>

              {/* Language item list */}
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
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--gold)]/15 text-[var(--gold)] font-bold'
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
