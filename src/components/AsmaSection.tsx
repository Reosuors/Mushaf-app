import React, { useState } from 'react';
import { ASMA } from '../data/asma';
import { AsmaItem } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Search, Volume2, X } from 'lucide-react';

interface AsmaSectionProps {
  lang: string;
}

export const AsmaSection: React.FC<AsmaSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedName, setSelectedName] = useState<AsmaItem | null>(null);

  const filteredNames = ASMA.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.ar.includes(q) ||
      (item.en && item.en.toLowerCase().includes(q)) ||
      (item.tr && item.tr.toLowerCase().includes(q)) ||
      item.n.toString() === q
    );
  });

  const handleSpeakName = (name: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(name);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getMeaning = (item: AsmaItem) => {
    if (lang === 'ar') return item.meaning?.ar || '';
    if (lang === 'ur') return item.meaning?.ur || item.meaning?.en || '';
    if (lang === 'bn') return item.meaning?.bn || item.meaning?.en || '';
    return item.meaning?.en || item.meaning?.ar || '';
  };

  return (
    <div className="max-w-4xl mx-auto p-3.5 sm:p-6 pb-28 space-y-4 animate-fade-in">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[var(--text3)] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === 'ar' ? 'ابحث في أسماء الله الحسنى...' : 'Search 99 Names of Allah...'}
          className="w-full bg-[var(--bg2)] border border-[var(--border2)] text-[var(--text)] ps-10 pe-4 py-2.5 rounded-2xl text-xs sm:text-sm outline-none focus:border-[var(--gold)] transition-colors shadow-sm min-h-[44px]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text3)] hover:text-[var(--text)]"
          >
            ✕
          </button>
        )}
      </div>

      {/* Grid of 99 Names */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filteredNames.map((item) => (
          <div
            key={item.n}
            onClick={() => setSelectedName(item)}
            className="bg-[var(--bg2)] border border-[var(--border2)] hover:border-[var(--gold)]/50 rounded-3xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md group active:scale-95 relative"
          >
            {/* Number badge */}
            <span className="absolute top-3 start-3 text-[0.62rem] font-bold text-[var(--text3)] group-hover:text-[var(--gold)] font-sans">
              #{item.n}
            </span>

            {/* Arabic Name Calligraphy */}
            <div className="font-quran text-2xl sm:text-3xl text-[var(--gold2)] group-hover:scale-110 transition-transform my-2 dir-rtl">
              {item.ar}
            </div>

            {/* Transliteration */}
            <div className="text-xs font-bold text-[var(--text)] truncate max-w-full">
              {item.en}
            </div>

            {/* Translation meaning */}
            <div className="text-[0.68rem] text-[var(--text3)] mt-0.5 truncate max-w-full">
              {item.tr || item.meaning?.en}
            </div>
          </div>
        ))}
      </div>

      {/* Details Sheet Modal */}
      {selectedName && (
        <div
          onClick={() => setSelectedName(null)}
          className="fixed inset-0 z-[800] bg-black/80 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--bg2)] border-t sm:border border-[var(--border2)] rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 shadow-2xl animate-sheet-up flex flex-col items-center text-center relative"
          >
            {/* Handle */}
            <div className="w-10 h-1.5 bg-[var(--border2)] rounded-full mb-4" />

            {/* Close Button */}
            <button
              onClick={() => setSelectedName(null)}
              className="absolute top-4 end-4 w-8 h-8 rounded-full bg-[var(--bg3)] text-[var(--text2)] flex items-center justify-center hover:text-[var(--text)] active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Number */}
            <span className="text-xs font-bold text-[var(--gold)] uppercase tracking-widest mb-1 font-sans">
              Name #{selectedName.n} of 99
            </span>

            {/* Arabic Big Calligraphy */}
            <h2 className="font-quran text-4xl sm:text-5xl text-[var(--gold2)] dir-rtl my-3">
              {selectedName.ar}
            </h2>

            {/* Transliteration */}
            <h3 className="text-base font-bold text-[var(--text)]">
              {selectedName.en}
            </h3>

            {/* Meaning */}
            <p className="text-xs text-[var(--gold)] font-medium mt-1 mb-4">
              {selectedName.tr}
            </p>

            {/* Explanation box */}
            <div className="w-full bg-[var(--bg3)] border border-[var(--border2)] rounded-2xl p-4 text-xs sm:text-sm text-[var(--text)] text-justify leading-relaxed mb-5">
              {getMeaning(selectedName)}
            </div>

            {/* Pronunciation Audio Button */}
            <button
              onClick={() => handleSpeakName(selectedName.ar)}
              className="w-full py-3 rounded-2xl bg-[var(--gold)] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-[var(--gold2)] active:scale-95 transition-all cursor-pointer"
            >
              <Volume2 className="w-4 h-4 fill-black" />
              <span>{lang === 'ar' ? 'استمع إلى النطق الصوتي' : 'Listen to Pronunciation'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
