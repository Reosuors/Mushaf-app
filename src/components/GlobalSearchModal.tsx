import React, { useState } from 'react';
import { TRANSLATIONS } from '../data/translations';
import { SURAHS } from '../data/surahs';
import { Search, X, BookOpen, Sparkles, Loader2, AlertCircle, ArrowRight, HelpCircle } from 'lucide-react';
import { smartSearchQuran, SearchResultItem, normalizeArabic } from '../utils/quranSearch';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  onSelectAyahResult: (surahNumber: number, ayahNumber: number) => void;
}

const SAMPLE_SEARCHES = [
  'الله لا اله الا هو',
  'قل اعوذ برب الفلق',
  'والعصر ان الانسان',
  'اياك نعبد واياك نستعين',
  'تبارك الذي بيده الملك',
  'الحمد لله رب العالمين',
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectAyahResult,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur';

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFuzzy, setIsFuzzy] = useState(false);

  const performSearch = async (searchTerm: string) => {
    const text = searchTerm.trim();
    if (!text) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const searchData = await smartSearchQuran(text);
      setResults(searchData.results);
      setIsFuzzy(searchData.isFuzzyNearestMatch);
    } catch {
      setResults([]);
      setIsFuzzy(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    performSearch(query);
  };

  const handleQuickChip = (chip: string) => {
    setQuery(chip);
    performSearch(chip);
  };

  return (
    <div
      id="global-search-modal"
      onClick={onClose}
      className="fixed inset-0 z-[800] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--bg2)] border-t sm:border border-[var(--border2)] rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col p-4 sm:p-6 shadow-2xl animate-sheet-up"
      >
        {/* Handle */}
        <div className="w-10 h-1.5 bg-[var(--border2)] rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border2)] mb-3">
          <div>
            <h3 className="font-amiri text-xl font-bold text-[var(--gold2)] flex items-center gap-2">
              <Search className="w-5 h-5 text-[var(--gold)]" />
              <span>{isRtl ? 'البحث الذكي في القرآن الكريم' : 'Smart Quran Search'}</span>
            </h3>
            <p className="text-[0.7rem] text-[var(--text3)] mt-0.5">
              {isRtl
                ? 'ابحث بدون تشكيل، وحتى لو كانت الكتابة بها أخطاء إملائية سنجد أقرب آية'
                : 'Search without diacritics, with smart nearest-verse matching for typos'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg3)] text-[var(--text2)] flex items-center justify-center hover:text-[var(--text)] active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--text3)] absolute start-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isRtl ? 'اكتب أي كلمة أو آية بدون تشكيل...' : 'Type words or verses without diacritics...'}
              className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] ps-10 pe-9 py-2.5 rounded-xl text-xs sm:text-sm outline-none focus:border-[var(--gold)] min-h-[42px]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text3)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRtl ? 'بحث ذكي' : 'Search'}</span>
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        {!hasSearched && (
          <div className="mb-3">
            <span className="text-[0.65rem] text-[var(--text3)] block mb-1.5">
              {isRtl ? 'نماذج بحث سريعة:' : 'Quick search ideas:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_SEARCHES.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickChip(chip)}
                  className="bg-[var(--bg3)] hover:bg-[var(--gold)]/15 border border-[var(--border2)] hover:border-[var(--gold)]/40 text-[var(--text2)] hover:text-[var(--gold2)] text-[0.7rem] px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fuzzy / Nearest match notice */}
        {hasSearched && !loading && isFuzzy && results.length > 0 && (
          <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              {isRtl
                ? '💡 تم العثور على أقرب الآيات تطابقاً مع ما كتبته (البحث التقريبي):'
                : '💡 Nearest matching verses found based on similarity:'}
            </span>
          </div>
        )}

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pe-1 min-h-[160px]">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[var(--text2)]">
              <Loader2 className="w-7 h-7 animate-spin text-[var(--gold)]" />
              <span className="text-xs">{isRtl ? 'جاري البحث الذكي ومطابقة الآيات...' : 'Searching Quran verses...'}</span>
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div className="py-12 text-center text-xs text-[var(--text3)] space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-[var(--text3)] opacity-60" />
              <p>{isRtl ? 'لم نتمكن من العثور على آيات مطابقة للبحث.' : 'No matching verses found.'}</p>
              <p className="text-[0.7rem]">
                {isRtl ? 'جرب البحث بكلمة واحدة أو عبارة رئيسية من الآية.' : 'Try searching with a single key word.'}
              </p>
            </div>
          )}

          {!loading &&
            results.map((item) => {
              const surahInfo = SURAHS.find((s) => s.n === item.surah.number);
              const surahTitle = surahInfo
                ? (surahInfo[lang as keyof typeof surahInfo] || surahInfo.ar)
                : item.surah.name;

              return (
                <div
                  key={`${item.surah.number}-${item.numberInSurah}-${item.number}`}
                  onClick={() => {
                    onSelectAyahResult(item.surah.number, item.numberInSurah);
                    onClose();
                  }}
                  className="bg-[var(--bg3)] border border-[var(--border2)] hover:border-[var(--gold)]/60 rounded-2xl p-3.5 sm:p-4 cursor-pointer transition-all active:scale-[0.99] group shadow-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border2)]/50 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--gold2)] flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[var(--gold)]" />
                        {surahTitle} — {t.ayah} {item.numberInSurah}
                      </span>
                      {item.isNearestMatch && item.similarityScore && (
                        <span className="text-[0.62rem] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                          {isRtl ? `أقرب تطابق ${item.similarityScore}%` : `Closest match ${item.similarityScore}%`}
                        </span>
                      )}
                    </div>
                    <span className="text-[0.68rem] bg-[var(--gold)]/10 text-[var(--gold)] group-hover:bg-[var(--gold)] group-hover:text-black px-2.5 py-0.5 rounded-md font-semibold transition-colors flex items-center gap-1">
                      <span>{isRtl ? 'فتح في المصحف' : 'Open in Quran'}</span>
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
