import React, { useState } from 'react';
import { TRANSLATIONS } from '../data/translations';
import { SURAHS } from '../data/surahs';
import { Search, X, BookOpen, Play, Loader2 } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  onSelectAyahResult: (surahNumber: number, ayahNumber: number) => void;
}

interface SearchAyahResult {
  number: number;
  text: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
  };
  numberInSurah: number;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectAyahResult,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchAyahResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/ar`);
      const data = await res.json();
      if (data.code === 200) {
        setResults(data.data.matches || []);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="global-search-modal"
      onClick={onClose}
      className="fixed inset-0 z-[800] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--bg2)] border-t sm:border border-[var(--border2)] rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col p-4 sm:p-6 shadow-2xl animate-sheet-up"
      >
        {/* Handle */}
        <div className="w-10 h-1.5 bg-[var(--border2)] rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border2)] mb-4">
          <h3 className="font-amiri text-xl font-bold text-[var(--gold2)] flex items-center gap-2">
            <Search className="w-5 h-5 text-[var(--gold)]" />
            <span>{t.searchAyahs || '🔍 بحث في آيات القرآن الكريم'}</span>
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg3)] text-[var(--text2)] flex items-center justify-center hover:text-[var(--text)] active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--text3)] absolute start-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'اكتب كلمة أو جملة قرآنية...' : 'Type words to search in Quran...'}
              className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] ps-10 pe-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none focus:border-[var(--gold)] min-h-[42px]"
            />
          </div>
          <button
            type="submit"
            className="bg-[var(--gold)] text-black font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1 shadow-md hover:bg-[var(--gold2)] active:scale-95 cursor-pointer"
          >
            {t.searchBtn}
          </button>
        </form>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pe-1">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[var(--text2)]">
              <Loader2 className="w-7 h-7 animate-spin text-[var(--gold)]" />
              <span className="text-xs">{lang === 'ar' ? 'جاري البحث في المصحف...' : 'Searching...'}</span>
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div className="py-12 text-center text-xs text-[var(--text3)]">
              {lang === 'ar' ? 'لم يتم العثور على آيات مطابقة للبحث.' : 'No matching verses found.'}
            </div>
          )}

          {!loading &&
            results.map((item) => {
              const surahInfo = SURAHS.find((s) => s.n === item.surah.number);
              const surahTitle = surahInfo ? (surahInfo[lang as keyof typeof surahInfo] || surahInfo.ar) : item.surah.name;

              return (
                <div
                  key={item.number}
                  onClick={() => {
                    onSelectAyahResult(item.surah.number, item.numberInSurah);
                    onClose();
                  }}
                  className="bg-[var(--bg3)] border border-[var(--border2)] hover:border-[var(--gold)]/50 rounded-2xl p-3.5 sm:p-4 cursor-pointer transition-all active:scale-[0.99] group"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border2)]/50 mb-2">
                    <span className="text-xs font-bold text-[var(--gold2)]">
                      {surahTitle} — {t.ayah} {item.numberInSurah}
                    </span>
                    <span className="text-[0.65rem] bg-[var(--gold)]/10 text-[var(--gold)] px-2 py-0.5 rounded-md font-semibold">
                      {lang === 'ar' ? 'فتح الآية' : 'Open Verse'}
                    </span>
                  </div>

                  <p className="font-quran text-base sm:text-lg text-[var(--text)] leading-[2.2] dir-rtl text-right">
                    {item.text}
                  </p>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
