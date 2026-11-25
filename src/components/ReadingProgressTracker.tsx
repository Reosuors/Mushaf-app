import React, { useState, useEffect } from 'react';
import {
  ReadingProgressData,
  loadReadingProgress,
  saveReadingProgress,
  calculateTotalReadAyahsCount,
  calculateQuranCompletionPercentage,
  TOTAL_QURAN_AYAHS,
  TOTAL_QURAN_SURAHS,
} from '../utils/readingProgress';
import { TRANSLATIONS } from '../data/translations';
import { getUIStrings } from '../utils/uiTranslations';
import { toArabicDigits } from '../utils/quranText';
import {
  BookOpen,
  Bookmark,
  Flame,
  ArrowRight,
  ArrowLeft,
  Play,
  Trash2,
} from 'lucide-react';

interface ReadingProgressTrackerProps {
  lang: string;
  onResumeReading?: (surahNumber: number, ayahNumber: number) => void;
  onResumeLastRead?: (surahNumber: number, ayahNumber: number) => void;
  onSelectBookmark?: (surahNumber: number, ayahNumber: number) => void;
}

export const ReadingProgressTracker: React.FC<ReadingProgressTrackerProps> = ({
  lang,
  onResumeReading,
  onResumeLastRead,
  onSelectBookmark,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';
  const ui = getUIStrings(lang);

  const [progress, setProgress] = useState<ReadingProgressData>(loadReadingProgress());
  const [activeTab, setActiveTab] = useState<'overview' | 'bookmarks'>('overview');

  const handleNavigate = (surahNumber: number, ayahNumber: number) => {
    if (typeof onResumeReading === 'function') {
      onResumeReading(surahNumber, ayahNumber);
    } else if (typeof onResumeLastRead === 'function') {
      onResumeLastRead(surahNumber, ayahNumber);
    } else if (typeof onSelectBookmark === 'function') {
      onSelectBookmark(surahNumber, ayahNumber);
    }
  };

  useEffect(() => {
    const handleUpdate = () => setProgress(loadReadingProgress());
    window.addEventListener('mushaf_reading_progress_updated', handleUpdate);
    return () => window.removeEventListener('mushaf_reading_progress_updated', handleUpdate);
  }, []);

  const totalReadAyahs = calculateTotalReadAyahsCount(progress);
  const completionPercentage = calculateQuranCompletionPercentage(progress);
  const completedSurahsCount = progress.completedSurahs.length;
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const handleDeleteBookmark = (bmId: string) => {
    const updated = {
      ...progress,
      bookmarks: progress.bookmarks.filter((b) => b.id !== bmId),
    };
    saveReadingProgress(updated);
    setProgress(updated);
  };

  return (
    <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-[22px] p-4 sm:p-5 shadow-md space-y-3.5 relative overflow-hidden">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[var(--gold)]/12 border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)] shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-amiri text-base sm:text-lg font-bold text-[var(--gold2)] leading-none">
                {isRtl ? 'متابعة التلاوة والختمة' : `${t.navQuran || 'Quran'} · ${ui.khatmas}`}
              </h3>
              <span className="text-[0.68rem] px-2 py-0.5 rounded-full bg-[var(--gold)]/15 border border-[var(--gold)]/30 text-[var(--gold2)] font-bold tabular-nums">
                {completionPercentage}%
              </span>
            </div>
            <p className="text-[0.68rem] text-[var(--text3)] mt-1 tabular-nums">
              {completedSurahsCount}/{TOTAL_QURAN_SURAHS} {isRtl ? 'سورة' : 'surahs'} · {totalReadAyahs.toLocaleString()} / {TOTAL_QURAN_AYAHS.toLocaleString()} {ui.ayahsUnit}
              {progress.streakDays > 0 && (
                <span className="inline-flex items-center gap-0.5 text-amber-400 ms-2 font-bold">
                  <Flame className="w-3 h-3 fill-amber-400" />
                  {progress.streakDays}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Overview / Bookmarks Pill Switch */}
        <div className="flex items-center bg-[var(--bg3)] p-1 rounded-xl border border-[var(--border2)] text-[0.7rem]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[var(--gold)] text-black shadow-xs'
                : 'text-[var(--text2)] hover:text-[var(--text)]'
            }`}
          >
            {isRtl ? 'المتابعة' : 'Resume'}
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'bookmarks'
                ? 'bg-[var(--gold)] text-black shadow-xs'
                : 'text-[var(--text2)] hover:text-[var(--text)]'
            }`}
          >
            <Bookmark className="w-3 h-3" />
            <span>
              {isRtl ? 'العلامات' : 'Bookmarks'} ({progress.bookmarks.length})
            </span>
          </button>
        </div>
      </div>

      {/* Hairline Gilded Progress Bar */}
      <div className="w-full h-1.5 bg-[var(--bg3)] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-l from-[var(--gold2)] to-[var(--gold)] rounded-full transition-all duration-500"
          style={{ width: `${Math.max(2, completionPercentage)}%` }}
        />
      </div>

      {activeTab === 'overview' ? (
        progress.lastRead ? (
          <div
            onClick={() => handleNavigate(progress.lastRead!.surahNumber, progress.lastRead!.ayahNumber)}
            className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--bg3)]/70 border border-[var(--gold)]/25 hover:border-[var(--gold)]/60 transition-all cursor-pointer group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold2)] text-black flex items-center justify-center shrink-0 shadow-sm">
                <Play className="w-4 h-4 fill-black" />
              </div>
              <div className="min-w-0">
                <div className="text-[0.65rem] text-[var(--gold)] font-bold">
                  {isRtl ? 'آخر موضع للقراءة' : 'Continue Reading'}
                </div>
                <div className="font-amiri text-base font-bold text-[var(--text)] truncate">
                  {isRtl
                    ? `سورة ${progress.lastRead.surahNameAr} · الآية ${toArabicDigits(progress.lastRead.ayahNumber)}`
                    : `Surah ${progress.lastRead.surahNameEn} · Ayah ${progress.lastRead.ayahNumber}`}
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--gold)]/15 border border-[var(--gold)]/35 text-[var(--gold2)] text-xs font-bold shrink-0 group-hover:bg-[var(--gold)] group-hover:text-black transition-all">
              <span>{isRtl ? 'أكمل' : 'Resume'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </span>
          </div>
        ) : (
          <div
            onClick={() => handleNavigate(1, 1)}
            className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--bg3)]/55 border border-[var(--border2)] hover:border-[var(--gold)]/45 transition-all cursor-pointer group"
          >
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--text)]">
                {isRtl ? 'ابدأ تلاوتك من سورة الفاتحة' : 'Begin reading from Surah Al-Fatihah'}
              </div>
              <div className="text-[0.68rem] text-[var(--text3)] mt-0.5">
                {isRtl ? 'يُحفظ موضع قراءتك تلقائياً مع التمرير' : 'Your reading position saves automatically'}
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--gold)] text-black text-xs font-extrabold shrink-0">
              <span>{isRtl ? 'ابدأ الآن' : 'Start'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </span>
          </div>
        )
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto pe-1">
          {progress.bookmarks.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--text3)] bg-[var(--bg3)]/40 rounded-2xl border border-[var(--border2)]">
              {isRtl
                ? 'لا توجد علامات مرجعية محفوظة بعد — اضغط على أيقونة العلامة بجانب أي آية لحفظها.'
                : 'No bookmarks saved yet — tap the bookmark icon on any ayah to save it.'}
            </div>
          ) : (
            progress.bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[var(--bg3)]/70 border border-[var(--border2)] hover:border-[var(--gold)]/45 transition-all"
              >
                <button
                  onClick={() => handleNavigate(bm.surahNumber, bm.ayahNumber)}
                  className="flex-1 min-w-0 text-start cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-amiri text-sm font-bold text-[var(--gold2)]">
                      {isRtl
                        ? `سورة ${bm.surahNameAr} · آية ${toArabicDigits(bm.ayahNumber)}`
                        : `${bm.surahNameEn} · Ayah ${bm.ayahNumber}`}
                    </span>
                  </div>
                  {bm.ayahSnippet && (
                    <p className="font-quran text-xs text-[var(--text2)] truncate mt-0.5 dir-rtl">
                      {bm.ayahSnippet}
                    </p>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteBookmark(bm.id)}
                  className="w-7 h-7 rounded-lg bg-[var(--bg2)] border border-[var(--border2)] text-[var(--text3)] hover:text-red-400 flex items-center justify-center shrink-0 cursor-pointer"
                  title={isRtl ? 'حذف العلامة' : 'Delete bookmark'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
