import React, { useState } from 'react';
import { ASMA } from '../data/asma';
import { AsmaItem } from '../types';
import { toArabicDigits } from '../utils/quranText';
import { Search, Volume2, X } from 'lucide-react';
import { MihrabBackdrop, GoldDivider } from './IslamicOrnaments';

interface AsmaSectionProps {
  lang: string;
}

export const AsmaSection: React.FC<AsmaSectionProps> = ({ lang }) => {
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';
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
    <div className="max-w-5xl mx-auto p-3.5 sm:p-6 pb-28 space-y-4 animate-fade-in">
      {/* Header + Search */}
      <div className="relative rounded-[22px] overflow-hidden border border-[var(--gold)]/28 bg-[var(--bg2)] p-5 text-center shadow-md">
        <MihrabBackdrop className="opacity-65" />
        <div className="relative z-10 space-y-3">
          <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-[var(--gold2)]">
            {isRtl ? 'أسماء الله الحسنى' : '99 Names of Allah'}
          </h2>
          <p className="text-xs text-[var(--text2)]">
            {isRtl
              ? 'وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا — اضغط على أي اسم للتدبر والاستماع'
              : 'Tap any Name to reflect on its meaning and listen to its pronunciation'}
          </p>
          <div className="relative max-w-md mx-auto pt-1">
            <Search className="w-4 h-4 text-[var(--gold)]/70 absolute start-3.5 top-1/2 -translate-y-1/2 mt-0.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? 'ابحث في الأسماء الحسنى...' : 'Search 99 Names...'}
              className="w-full bg-[var(--bg)]/80 border border-[var(--border2)] text-[var(--text)] placeholder:text-[var(--text3)] ps-10 pe-8 py-2.5 rounded-2xl text-xs sm:text-sm outline-none focus:border-[var(--gold)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 mt-0.5 text-xs text-[var(--text3)] hover:text-[var(--text)] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Illuminated Medallion Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filteredNames.map((item) => (
          <div
            key={item.n}
            onClick={() => setSelectedName(item)}
            className="bg-[var(--bg2)] border border-[var(--border2)] hover:border-[var(--gold)]/55 rounded-[22px] p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group active:scale-[0.97] relative overflow-hidden"
          >
            <span className="absolute top-3 start-3 text-[0.62rem] font-amiri font-bold text-[var(--gold)]/65">
              {isRtl ? toArabicDigits(item.n) : `#${item.n}`}
            </span>

            <div className="font-quran text-2xl sm:text-3xl text-[var(--gold2)] group-hover:text-[var(--gold3)] group-hover:scale-105 transition-all my-2.5 dir-rtl">
              {item.ar}
            </div>

            <div className="text-xs font-bold text-[var(--text)] truncate max-w-full">
              {item.en}
            </div>
            <div className="text-[0.68rem] text-[var(--text3)] mt-0.5 truncate max-w-full">
              {item.tr || item.meaning?.en}
            </div>
          </div>
        ))}
      </div>

      {/* Reflection Sheet Modal */}
      {selectedName && (
        <div
          onClick={() => setSelectedName(null)}
          className="fixed inset-0 z-[800] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--bg2)] border-t sm:border border-[var(--gold)]/35 rounded-t-[28px] sm:rounded-[28px] w-full max-w-md p-6 shadow-2xl animate-sheet-up flex flex-col items-center text-center relative overflow-hidden"
          >
            <MihrabBackdrop className="opacity-65" />
            <div className="relative z-10 w-full flex flex-col items-center">
              <div className="w-10 h-1 bg-[var(--gold)]/30 rounded-full mb-4 sm:hidden" />

              <button
                onClick={() => setSelectedName(null)}
                className="absolute top-0 end-0 w-8 h-8 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text2)] flex items-center justify-center hover:text-[var(--gold2)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="text-[0.7rem] font-bold text-[var(--gold)] px-3 py-0.5 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/25">
                {isRtl ? `الاسم ${toArabicDigits(selectedName.n)} من ٩٩` : `Name ${selectedName.n} of 99`}
              </span>

              <h2 className="font-quran text-4xl sm:text-5xl text-[var(--gold2)] dir-rtl my-4 text-glow">
                {selectedName.ar}
              </h2>

              <h3 className="text-base font-bold text-[var(--text)]">{selectedName.en}</h3>
              <p className="text-xs text-[var(--gold)] font-medium mt-1">{selectedName.tr}</p>

              <GoldDivider className="w-36 my-4 opacity-70" />

              <div className="w-full bg-[var(--bg3)]/75 border border-[var(--border2)] rounded-2xl p-4 text-xs sm:text-sm text-[var(--text)] text-justify leading-relaxed mb-5">
                {getMeaning(selectedName)}
              </div>

              <button
                onClick={() => handleSpeakName(selectedName.ar)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isRtl ? 'استمع إلى النطق الصوتي' : 'Listen to Pronunciation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
