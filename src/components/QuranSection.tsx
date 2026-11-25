import React, { useState, useEffect } from 'react';
import { SURAHS } from '../data/surahs';
import { TRANSLATIONS } from '../data/translations';
import { ReadingProgressTracker } from './ReadingProgressTracker';
import { loadReadingProgress } from '../utils/readingProgress';
import { normalizeArabic } from '../utils/quranSearch';
import {
  getAyahOfDayRef,
  getDisplayAyahText,
  toArabicDigits,
  juzFirstAyah,
  hizbFirstAyah,
  pageFirstAyah,
} from '../utils/quranText';
import { getUIStrings } from '../utils/uiTranslations';
import { hapticFeedback } from '../utils/haptics';
import {
  MihrabBackdrop,
  RubElHizbBadge,
  GoldDivider,
} from './IslamicOrnaments';
import {
  Search,
  Brain,
  Hash,
  Play,
  BookOpen,
  HardDrive,
  CheckCircle2,
  Award,
  CalendarCheck,
  Sparkles,
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
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';

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

  // Daily Ayah Inspiration (exact Tanzil verbatim verse)
  const today = new Date();
  const daily = getAyahOfDayRef(today);
  const featuredSurah = SURAHS[daily.surah - 1];
  const [dailyText, setDailyText] = useState('');
  useEffect(() => {
    getDisplayAyahText(daily.surah, daily.ayah)
      .then(setDailyText)
      .catch(() => setDailyText(''));
  }, [daily.surah, daily.ayah]);

  const filteredSurahs = SURAHS.filter((s) => {
    if (filterMode === 'offline' && !downloadedSurahs.includes(s.n)) {
      return false;
    }
    const qRaw = searchQuery.toLowerCase().trim();
    if (!qRaw) return true;

    const qNorm = normalizeArabic(qRaw);
    const arNorm = normalizeArabic(s.ar);
    const localizedVal = s[lang as keyof typeof s]
      ? String(s[lang as keyof typeof s]).toLowerCase()
      : '';
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
    <div className="p-3.5 sm:p-6 max-w-5xl mx-auto pb-24 space-y-5 animate-fade-in">
      {/* Illuminated Daily Ayah Manuscript Hero */}
      {!searchQuery && filterMode === 'all' && (
        <section className="relative rounded-[26px] overflow-hidden border border-[var(--gold)]/32 bg-gradient-to-b from-[var(--bg3)]/90 via-[var(--bg2)] to-[var(--bg2)] p-5 sm:p-7 shadow-[0_18px_48px_-22px_rgba(0,0,0,0.85)]">
          {/* Fine inner manuscript hairline border */}
          <div
            className="pointer-events-none absolute inset-[7px] rounded-[20px] border border-[var(--gold)]/16"
            aria-hidden="true"
          />
          <MihrabBackdrop className="opacity-80" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg)]/65 border border-[var(--gold)]/30 text-[0.7rem] font-bold text-[var(--gold2)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>{t.ayahOfDay || 'آية اليوم'}</span>
              <span className="text-[var(--gold)]/50">·</span>
              <span className="font-amiri text-xs">
                {isRtl
                  ? `سورة ${featuredSurah.ar} (${toArabicDigits(daily.ayah)})`
                  : `Surah ${featuredSurah.en} (${daily.ayah})`}
              </span>
            </div>

            <p className="font-quran text-[1.45rem] sm:text-[1.85rem] text-[var(--text)] leading-[2.2] max-w-2xl dir-rtl text-glow px-1">
              {dailyText ? (
                <>
                  <span className="text-[var(--gold)]/80 select-none">﴿ </span>
                  {dailyText}
                  <span className="text-[var(--gold)]/80 select-none"> ﴾</span>
                </>
              ) : (
                <span className="text-sm font-sans text-[var(--text3)]">
                  {isRtl ? 'جاري تحميل الآية…' : 'Loading verse…'}
                </span>
              )}
            </p>

            <GoldDivider className="w-40 opacity-75" />

            <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
              <button
                onClick={() => {
                  hapticFeedback.navigation();
                  onSelectSurah(featuredSurah.n, daily.ayah);
                }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black text-xs font-extrabold shadow-[0_6px_22px_rgba(212,175,55,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isRtl ? 'اقرأ السورة واستمع' : 'Read & Listen'}</span>
              </button>

              {onOpenKhatmahModal && (
                <button
                  onClick={() => {
                    hapticFeedback.tap();
                    onOpenKhatmahModal();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--bg)]/70 border border-[var(--gold)]/30 text-[var(--gold2)] hover:border-[var(--gold)] text-xs font-bold active:scale-95 transition-all cursor-pointer"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-[var(--gold)]" />
                  <span>{isRtl ? 'مخطط الختمة' : 'Khatmah Plan'}</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Continue Reading & Bookmarks Ribbon */}
      {!searchQuery && filterMode === 'all' && (
        <ReadingProgressTracker
          lang={lang}
          onResumeReading={(surahNumber, ayahNumber) => onSelectSurah(surahNumber, ayahNumber)}
          onSelectBookmark={(surahNumber, ayahNumber) => onSelectSurah(surahNumber, ayahNumber)}
          onResumeLastRead={(surahNumber, ayahNumber) => onSelectSurah(surahNumber, ayahNumber)}
        />
      )}

      {/* Search & Quick Study Tools Row */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Surah Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--gold)]/70 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchSurahPh || (isRtl ? 'ابحث باسم السورة أو رقمها...' : 'Search surah by name or number...')}
              className="w-full bg-[var(--bg2)] border border-[var(--border2)] text-[var(--text)] placeholder:text-[var(--text3)] ps-10 pe-9 py-2.5 rounded-2xl text-xs sm:text-sm outline-none focus:border-[var(--gold)] transition-colors min-h-[46px]"
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

          {/* Quick Study Tools */}
          <div className="grid grid-cols-3 sm:flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenGlobalSearch}
              className="bg-[var(--bg2)] border border-[var(--border2)] text-[var(--text2)] hover:text-[var(--gold2)] hover:border-[var(--gold)]/60 px-3 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 min-h-[46px]"
              title={t.globalAyahSearch || 'Search Ayahs'}
            >
              <Hash className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" />
              <span className="truncate">{isRtl ? 'بحث آية' : 'Search Ayah'}</span>
            </button>

            <button
              onClick={onOpenMemorizationTest}
              className="bg-[var(--gold)]/10 border border-[var(--gold)]/35 text-[var(--gold2)] hover:bg-[var(--gold)]/18 px-3 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 min-h-[46px]"
              title={t.memTitle || 'Memorization Test'}
            >
              <Brain className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" />
              <span className="truncate">{t.memTitle || (isRtl ? 'الحفظ' : 'Memorize')}</span>
            </button>

            {onOpenOfflineManager && (
              <button
                onClick={onOpenOfflineManager}
                className="bg-[var(--bg2)] border border-[var(--border2)] hover:border-[var(--gold)]/60 text-[var(--text2)] hover:text-[var(--gold2)] px-3 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 min-h-[46px]"
                title={ui.offlineManagerTitle}
              >
                <HardDrive className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" />
                <span className="font-mono text-[0.72rem]">{downloadedSurahs.length}/114</span>
              </button>
            )}
          </div>
        </div>

        {/* Index Controls: Surahs vs Juz + Offline Filter + Page Jump */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {!searchQuery && filterMode === 'all' && (
              <div
                className="flex items-center bg-[var(--bg2)] border border-[var(--border2)] p-1 rounded-xl gap-0.5"
                role="tablist"
              >
                {(['surahs', 'juz'] as const).map((m) => (
                  <button
                    key={m}
                    role="tab"
                    aria-selected={listMode === m}
                    onClick={() => {
                      hapticFeedback.selection();
                      setListMode(m);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      listMode === m
                        ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black shadow-xs'
                        : 'text-[var(--text2)] hover:text-[var(--text)]'
                    }`}
                  >
                    {m === 'surahs'
                      ? isRtl ? 'السور' : 'Surahs'
                      : isRtl ? 'الأجزاء والأحزاب' : 'Juz & Hizb'}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                hapticFeedback.selection();
                setFilterMode(filterMode === 'all' ? 'offline' : 'all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'offline'
                  ? 'bg-[var(--gold)]/15 border-[var(--gold)] text-[var(--gold2)]'
                  : 'bg-[var(--bg2)] border-[var(--border2)] text-[var(--text3)] hover:text-[var(--text2)]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{ui.offlineSaved} ({downloadedSurahs.length})</span>
            </button>
          </div>

          {!searchQuery && filterMode === 'all' && (
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
                placeholder={isRtl ? 'صفحة ١–٦٠٤' : 'Page 1–604'}
                aria-label="رقم الصفحة"
                className="w-24 sm:w-28 bg-[var(--bg2)] border border-[var(--border2)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:border-[var(--gold)]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-[var(--bg2)] border border-[var(--gold)]/35 hover:border-[var(--gold)] text-xs font-bold text-[var(--gold2)] cursor-pointer transition-colors"
              >
                {isRtl ? 'انتقال' : 'Go'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Juz & Hizb View */}
      {!searchQuery && filterMode === 'all' && listMode === 'juz' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => {
            const start = juzFirstAyah(j);
            const sm = SURAHS[start.surah - 1];
            return (
              <div
                key={j}
                className="bg-[var(--bg2)] border border-[var(--border2)] hover:border-[var(--gold)]/45 rounded-2xl p-3.5 space-y-2.5 transition-all"
              >
                <button
                  onClick={() => {
                    hapticFeedback.navigation();
                    onSelectSurah(start.surah, start.ayah);
                  }}
                  className="w-full flex items-center justify-between cursor-pointer group"
                >
                  <span className="flex items-center gap-3">
                    <RubElHizbBadge label={toArabicDigits(j)} size="sm" />
                    <span className="font-amiri text-base font-bold text-[var(--gold2)] group-hover:text-[var(--gold3)]">
                      {isRtl ? `الجزء ${toArabicDigits(j)}` : `Juz ${j}`}
                    </span>
                  </span>
                  <span className="text-[0.7rem] text-[var(--text2)]">
                    {sm.ar} {toArabicDigits(start.ayah)}
                  </span>
                </button>
                <div className="flex gap-1.5">
                  {[j * 2 - 1, j * 2].map((h) => {
                    const hs = hizbFirstAyah(h);
                    return (
                      <button
                        key={h}
                        onClick={() => onSelectSurah(hs.surah, hs.ayah)}
                        className="flex-1 text-[0.68rem] py-1.5 px-2 rounded-xl bg-[var(--bg3)]/80 border border-[var(--border)] text-[var(--text2)] hover:text-[var(--gold2)] hover:border-[var(--gold)]/35 transition-all cursor-pointer truncate"
                      >
                        {isRtl
                          ? `الحزب ${toArabicDigits(h)} · ${SURAHS[hs.surah - 1].ar}`
                          : `Hizb ${h} · ${SURAHS[hs.surah - 1].en}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Illuminated Surah Index Grid */}
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
              className={`surah-card border rounded-[18px] p-3.5 flex items-center justify-between gap-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group active:scale-[0.985] relative overflow-hidden ${
                isCompleted
                  ? 'border-[var(--gold)]/45'
                  : 'border-[var(--border2)] hover:border-[var(--gold)]/55'
              }`}
            >
              {/* Start: Octagonal Rub-el-Hizb Medallion + Title & Meta */}
              <div className="flex items-center gap-3 min-w-0">
                <RubElHizbBadge label={toArabicDigits(surah.n)} active={isCompleted} size="md" />

                <div className="min-w-0">
                  <div className="font-amiri text-[1.08rem] font-bold text-[var(--text)] group-hover:text-[var(--gold2)] truncate transition-colors flex items-center gap-1.5 leading-snug">
                    <span className="truncate">{localizedName}</span>
                    {isCompleted && (
                      <Award
                        className="w-3.5 h-3.5 text-[var(--gold)] shrink-0"
                        aria-label={ui.offlineCompletedBadge}
                      />
                    )}
                    {isSavedOffline && (
                      <CheckCircle2
                        className="w-3.5 h-3.5 text-[var(--green2)] shrink-0"
                        aria-label={ui.offlineSavedBadge}
                      />
                    )}
                  </div>
                  <div className="text-[0.68rem] text-[var(--text3)] flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        isMeccan ? 'bg-[var(--gold)]/80' : 'bg-[var(--green2)]/85'
                      }`}
                    />
                    <span className="text-[var(--text2)]/85">
                      {isMeccan ? t.makki || 'مكية' : t.madani || 'مدنية'}
                    </span>
                    <span className="opacity-45">·</span>
                    <span>
                      {isRtl ? toArabicDigits(surah.a) : surah.a} {t.ayah || 'آية'}
                    </span>
                  </div>
                </div>
              </div>

              {/* End: Calligraphic Arabic Surah Title + Repeat/Play Trigger */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="font-quran text-xl text-[var(--gold2)] group-hover:text-[var(--gold3)] transition-colors dir-rtl select-none leading-none">
                  {surah.ar}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenRepeatModal(surah.n);
                  }}
                  className="w-8 h-8 rounded-xl bg-[var(--bg3)]/90 border border-[var(--border2)] text-[var(--text3)] hover:text-[var(--gold2)] hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/10 flex items-center justify-center transition-all cursor-pointer"
                  title={t.repeatTitle || 'تكرار وتشغيل'}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSurahs.length === 0 && listMode === 'surahs' && (
        <div className="py-16 text-center text-xs text-[var(--text3)] bg-[var(--bg2)] rounded-3xl border border-[var(--border2)]">
          {filterMode === 'offline' ? ui.offlineNoSurahsYet : t.noResults || 'لا توجد نتائج'}
        </div>
      )}
    </div>
  );
};
