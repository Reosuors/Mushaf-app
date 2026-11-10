import React, { useState, useEffect } from 'react';
import { SURAHS } from '../data/surahs';
import { TRANSLATIONS } from '../data/translations';
import { ReadingProgressTracker } from './ReadingProgressTracker';
import { loadReadingProgress } from '../utils/readingProgress';
import { normalizeArabic } from '../utils/quranSearch';
import { getAyahOfDayRef, getDisplayAyahText, toArabicDigits, juzFirstAyah, hizbFirstAyah, pageFirstAyah } from '../utils/quranText';
import { getUIStrings } from '../utils/uiTranslations';
import { hapticFeedback } from '../utils/haptics';
import { 
  Search, 
  Brain, 
  Hash, 
  Play, 
  Sparkles, 
  BookOpen, 
  HardDrive, 
  CheckCircle2, 
  Zap, 
  Award,
  CalendarCheck
} from 'lucide-react';

interface QuranSectionProps {
  lang: string;
  downloadedSurahs?: number[];
  onSelectSurah: (surahNumber: number, ayahNumber?: number) => void;
  onOpenGlobalSearch: () => void;
  onOpenMemorizationTest: () => void;
  onOpenRepeatModal: (surahNumber?: number) => void;
  onOpenOfflineManager?: () => void;
  onOpenKhatmahModal?: () => void;
}

export const QuranSection: React.FC<QuranSectionProps> = ({
  lang,
  downloadedSurahs = [],
  onSelectSurah,
  onOpenGlobalSearch,
  onOpenMemorizationTest,
  onOpenRepeatModal,
  onOpenOfflineManager,
  onOpenKhatmahModal,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const ui = getUIStrings(lang);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'offline'>('all');
  const [listMode, setListMode] = useState<'surahs' | 'juz'>('surahs');
  const [pageInput, setPageInput] = useState('');
  const [completedSurahs, setCompletedSurahs] = useState<number[]>([]);

  useEffect(() => {
    const updateStats = () => {
      const p = loadReadingProgress();
      setCompletedSurahs(p.completedSurahs || []);
    };
    updateStats();
    window.addEventListener('mushaf_reading_progress_updated', updateStats);
    return () => window.removeEventListener('mushaf_reading_progress_updated', updateStats);
  }, []);

  // Daily Ayah Inspiration
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const daily = getAyahOfDayRef(today);
  const featuredSurah = SURAHS[daily.surah - 1];
  const [dailyText, setDailyText] = useState('');
  useEffect(() => {
    getDisplayAyahText(daily.surah, daily.ayah).then(setDailyText).catch(() => setDailyText(''));
  }, [daily.surah, daily.ayah]);

  const filteredSurahs = SURAHS.filter((s) => {
    if (filterMode === 'offline' && !downloadedSurahs.includes(s.n)) {
      return false;
    }
    const qRaw = searchQuery.toLowerCase().trim();
    if (!qRaw) return true;

    const qNorm = normalizeArabic(qRaw);
    const arNorm = normalizeArabic(s.ar);
    const localizedVal = s[lang as keyof typeof s] ? String(s[lang as keyof typeof s]).toLowerCase() : '';
    const enVal = (s.en || '').toLowerCase();

    const nameMatch =
      s.ar.includes(qRaw) ||
      arNorm.includes(qNorm) ||
      arNorm.includes(qRaw) ||
      localizedVal.includes(qRaw) ||
      enVal.includes(qRaw);

    const numberMatch = s.n.toString() === qRaw || s.n.toString() === qNorm;
    return nameMatch || numberMatch;
  });

  return (
    <div className="p-3.5 sm:p-6 max-w-4xl mx-auto space-y-4 animate-fade-in">
      {/* Search & Tool Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text3)] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchSurahPh || 'Search surah...'}
            className="w-full bg-[var(--bg2)] border border-[var(--border2)] text-[var(--text)] ps-10 pe-4 py-2.5 rounded-2xl text-xs sm:text-sm outline-none focus:border-[var(--gold)] transition-colors shadow-sm min-h-[44px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text3)] hover:text-[var(--text)] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Quick Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenGlobalSearch}
            className="flex-1 sm:flex-initial bg-[var(--bg2)] border border-[var(--border2)] text-[var(--text2)] hover:text-[var(--gold)] hover:border-[var(--gold)] px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 min-h-[44px]"
            title={t.globalAyahSearch || 'Search Ayahs'}
          >
            <Hash className="w-4 h-4 text-[var(--gold)]" />
            <span className="whitespace-nowrap">{t.searchAyah || 'Search Ayah'}</span>
          </button>

          <button
            onClick={onOpenMemorizationTest}
            className="flex-1 sm:flex-initial bg-[var(--gold)]/10 border border-[var(--gold)]/30 text-[var(--gold)] hover:bg-[var(--gold)]/20 px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 min-h-[44px]"
            title={t.memTitle || 'Test Memorization'}
          >
            <Brain className="w-4 h-4" />
            <span className="whitespace-nowrap">{t.memTitle || 'Memorize'}</span>
          </button>

          {onOpenOfflineManager && (
            <button
              onClick={onOpenOfflineManager}
              className="bg-[var(--bg2)] border border-[var(--border2)] hover:border-[var(--gold)] text-[var(--gold2)] px-3 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 min-h-[44px]"
              title={ui.offlineManagerTitle}
            >
              <Zap className="w-4 h-4 text-[var(--gold)]" />
              <span className="hidden md:inline font-mono">{downloadedSurahs.length}/114</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs (All vs Saved Offline) */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border2)]/50 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-[var(--gold)] text-black shadow-xs whitespace-nowrap'
                : 'text-[var(--text3)] hover:text-[var(--text)] bg-[var(--bg2)] border border-[var(--border2)]'
            }`}
          >
            {ui.offlineAllSurahs}
          </button>

          <button
            onClick={() => setFilterMode('offline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              filterMode === 'offline'
                ? 'bg-[var(--gold)] text-black shadow-xs'
                : 'text-[var(--text3)] hover:text-[var(--text)] bg-[var(--bg2)] border border-[var(--border2)]'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>{ui.offlineSaved} ({downloadedSurahs.length})</span>
          </button>
        </div>

        {onOpenOfflineManager && (
          <button
            onClick={onOpenOfflineManager}
            className="text-[0.72rem] text-[var(--gold)] hover:underline hidden sm:flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>{ui.offlineDownloadAll}</span>
          </button>
        )}
      </div>

      {/* Reading Progress Tracker & Bookmarks */}
      {!searchQuery && filterMode === 'all' && (
        <ReadingProgressTracker
          lang={lang}
          onResumeReading={(surahNumber, ayahNumber) => onSelectSurah(surahNumber, ayahNumber)}
          onSelectBookmark={(surahNumber, ayahNumber) => onSelectSurah(surahNumber, ayahNumber)}
          onResumeLastRead={(surahNumber, ayahNumber) => onSelectSurah(surahNumber, ayahNumber)}
        />
      )}

      {/* Khatmah Planner Quick Card */}
      {!searchQuery && filterMode === 'all' && onOpenKhatmahModal && (
        <div 
          onClick={onOpenKhatmahModal}
          className="bg-gradient-to-r from-[var(--gold)]/15 via-[var(--bg2)] to-[var(--gold)]/10 border border-[var(--gold)]/40 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-md hover:border-[var(--gold)] transition-all cursor-pointer group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[var(--gold)] text-black flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-[var(--gold2)] flex items-center gap-1.5">
                <span>{lang === 'ar' ? 'مخطط ومتابع ختمة القرآن' : 'Quran Khatmah Planner'}</span>
                <span className="text-[0.62rem] bg-[var(--gold)]/20 text-[var(--gold2)] px-2 py-0.5 rounded-full font-sans font-bold">
                  {lang === 'ar' ? 'جديد ✨' : 'NEW'}
                </span>
              </h4>
              <p className="text-xs text-[var(--text2)] mt-0.5">
                {lang === 'ar'
                  ? 'حدد مدة ختمتك (٣٠، ٦٠ يوماً)، تابع وِردك اليومي بالأجزاء، واقرأ دعاء الختم'
                  : 'Track your daily reading target, streaks, and complete Quran completion goal'}
              </p>
            </div>
          </div>

          <button className="px-3.5 py-1.5 rounded-xl bg-[var(--gold)] text-black text-xs font-bold shrink-0 shadow-sm group-hover:brightness-110 transition-all pointer-events-none">
            {lang === 'ar' ? 'فتح المخطط 📖' : 'Open Planner'}
          </button>
        </div>
      )}

      {/* Daily Ayah Inspiration Banner */}
      {!searchQuery && filterMode === 'all' && (
        <div className="bg-gradient-to-br from-[var(--bg2)] via-[var(--bg3)] to-[var(--bg2)] border border-[var(--gold)]/30 rounded-3xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[var(--gold)] text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>{t.ayahOfDay || 'Ayah of the Day'}</span>
            </div>
            <span className="text-[0.68rem] bg-[var(--gold)]/10 text-[var(--gold2)] px-2 py-0.5 rounded-md font-semibold font-amiri">
              {featuredSurah[lang as keyof typeof featuredSurah] || featuredSurah.ar}
            </span>
          </div>

          <p className="font-quran text-lg sm:text-xl text-[var(--text)] leading-[2.2] text-center my-3 text-glow" dir="rtl">
            {dailyText ? (
              <>
                {dailyText} <span className="text-[var(--gold)]">﴿{toArabicDigits(daily.ayah)}﴾</span>
              </>
            ) : (
              <span className="text-sm text-[var(--text3)]">{lang === 'ar' ? 'جاري تحميل الآية…' : 'Loading…'}</span>
            )}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-[var(--border2)]/50">
            <span className="text-[0.72rem] text-[var(--text3)]">
              {lang === 'ar' ? `سورة ${featuredSurah.ar} · الآية ${toArabicDigits(daily.ayah)}` : `Surah ${featuredSurah.en} · Ayah ${daily.ayah}`}
            </span>
            <button
              onClick={() => onSelectSurah(featuredSurah.n, daily.ayah)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--gold)] hover:text-[var(--gold2)] transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.playSurah || 'Read & Listen'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Surahs / Juz switch + jump to page */}
      {!searchQuery && filterMode === 'all' && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center bg-[var(--bg2)] border border-[var(--border2)] p-1 rounded-xl gap-1" role="tablist">
            {(['surahs', 'juz'] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={listMode === m}
                onClick={() => setListMode(m)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  listMode === m ? 'bg-[var(--gold)] text-black' : 'text-[var(--text2)]'
                }`}
              >
                {m === 'surahs' ? 'السور' : 'الأجزاء والأحزاب'}
              </button>
            ))}
          </div>
          <form
            className="flex items-center gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              const p = parseInt(pageInput, 10);
              if (p >= 1 && p <= 604) {
                const r = pageFirstAyah(p);
                hapticFeedback.navigation();
                onSelectSurah(r.surah, r.ayah);
                setPageInput('');
              }
            }}
          >
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={604}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              placeholder="صفحة ١–٦٠٤"
              aria-label="رقم الصفحة"
              className="w-28 bg-[var(--bg2)] border border-[var(--border2)] rounded-xl px-3 py-1.5 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--gold)]"
            />
            <button type="submit" className="px-3 py-1.5 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] text-xs font-bold text-[var(--gold)] cursor-pointer">
              انتقال
            </button>
          </form>
        </div>
      )}

      {!searchQuery && filterMode === 'all' && listMode === 'juz' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => {
            const start = juzFirstAyah(j);
            const sm = SURAHS[start.surah - 1];
            return (
              <div key={j} className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl p-3 space-y-2">
                <button
                  onClick={() => {
                    hapticFeedback.navigation();
                    onSelectSurah(start.surah, start.ayah);
                  }}
                  className="w-full flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] flex items-center justify-center text-sm font-bold text-[var(--gold2)]">
                      {toArabicDigits(j)}
                    </span>
                    <span className="text-sm font-bold text-[var(--text)]">الجزء {toArabicDigits(j)}</span>
                  </span>
                  <span className="text-[0.7rem] text-[var(--text3)]">
                    يبدأ من {sm.ar} {toArabicDigits(start.ayah)}
                  </span>
                </button>
                <div className="flex gap-1.5">
                  {[j * 2 - 1, j * 2].map((h) => {
                    const hs = hizbFirstAyah(h);
                    return (
                      <button
                        key={h}
                        onClick={() => onSelectSurah(hs.surah, hs.ayah)}
                        className="flex-1 text-[0.68rem] py-1 rounded-lg bg-[var(--bg3)] text-[var(--text2)] hover:text-[var(--gold)] cursor-pointer"
                      >
                        الحزب {toArabicDigits(h)} · {SURAHS[hs.surah - 1].ar} {toArabicDigits(hs.ayah)}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Surah List Grid */}
      <div data-surah-list className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {(listMode === 'juz' && !searchQuery && filterMode === 'all' ? [] : filteredSurahs).map((surah) => {
          const localizedName = surah[lang as keyof typeof surah] || surah.ar;
          const isMeccan = surah.t === 'm' || surah.t === 'مكية';
          const isSavedOffline = downloadedSurahs.includes(surah.n);
          const isCompleted = completedSurahs.includes(surah.n);

          return (
            <div
              key={surah.n}
              onClick={() => {
                hapticFeedback.navigation();
                onSelectSurah(surah.n);
              }}
              className={`surah-card bg-[var(--bg2)] border rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group active:scale-[0.98] relative overflow-hidden ${
                isCompleted ? 'border-[var(--gold)]/40 bg-[var(--gold)]/[0.03]' : 'border-[var(--border2)] hover:border-[var(--gold)]/60'
              }`}
            >
              {/* Surah Number & Names */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Number Badge */}
                <div className={`surah-num w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                  isCompleted 
                    ? 'bg-[var(--gold)]/20 border-[var(--gold)] text-[var(--gold)]' 
                    : 'bg-[var(--bg3)] border-[var(--border2)] group-hover:border-[var(--gold)]/40 group-hover:bg-[var(--gold)]/10 text-[var(--gold2)]'
                }`}>
                  <span className="font-sans text-xs font-bold">
                    {toArabicDigits(surah.n)}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="font-amiri text-base font-bold text-[var(--text)] group-hover:text-[var(--gold2)] truncate transition-colors flex items-center gap-1.5">
                    <span>{localizedName}</span>
                    {isCompleted && (
                      <span className="text-[var(--gold)] shrink-0" title={ui.offlineCompletedBadge}>
                        <Award className="w-3.5 h-3.5 fill-[var(--gold)]/20" />
                      </span>
                    )}
                    {isSavedOffline && (
                      <span className="text-emerald-500 shrink-0" title={ui.offlineSavedBadge}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="text-[0.68rem] text-[var(--text3)] flex items-center gap-1.5 mt-0.5">
                    <span>
                      {surah.a} {t.ayah || 'Ayah'}
                    </span>
                    <span>·</span>
                    <span
                      className={
                        isMeccan
                          ? 'text-amber-500/90 font-medium'
                          : 'text-emerald-500/90 font-medium'
                      }
                    >
                      {isMeccan ? (t.makki || 'Meccan') : (t.madani || 'Medinan')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Surah Arabic Calligraphy & Play Trigger */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenRepeatModal(surah.n);
                  }}
                  className="w-8 h-8 rounded-lg bg-[var(--bg3)] text-[var(--text3)] hover:text-[var(--gold)] hover:bg-[var(--gold)]/10 flex items-center justify-center transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                  title={t.repeatTitle || 'Repeat'}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
                <div className="font-quran text-lg text-[var(--gold)] group-hover:scale-105 transition-transform dir-rtl select-none">
                  {surah.ar}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSurahs.length === 0 && listMode === 'surahs' && (
        <div className="py-16 text-center text-xs text-[var(--text3)] bg-[var(--bg2)] rounded-3xl border border-[var(--border2)]">
          {filterMode === 'offline' 
            ? ui.offlineNoSurahsYet
            : (t.noResults || 'No results found')}
        </div>
      )}
    </div>
  );
};
