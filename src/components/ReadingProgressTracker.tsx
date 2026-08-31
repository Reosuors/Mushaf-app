import React, { useState, useEffect } from 'react';
import {
  ReadingProgressData,
  loadReadingProgress,
  saveReadingProgress,
  calculateTotalReadAyahsCount,
  calculateQuranCompletionPercentage,
  TOTAL_QURAN_AYAHS,
  TOTAL_QURAN_SURAHS,
  BookmarkItem,
} from '../utils/readingProgress';
import { TRANSLATIONS } from '../data/translations';
import {
  BookOpen,
  Bookmark,
  Award,
  Flame,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Target,
  Sparkles,
  Play,
  RotateCcw,
  Trash2,
} from 'lucide-react';

interface ReadingProgressTrackerProps {
  lang: string;
  onResumeReading: (surahNumber: number, ayahNumber: number) => void;
}

export const ReadingProgressTracker: React.FC<ReadingProgressTrackerProps> = ({
  lang,
  onResumeReading,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur';

  const [progress, setProgress] = useState<ReadingProgressData>(loadReadingProgress());
  const [activeTab, setActiveTab] = useState<'overview' | 'bookmarks'>('overview');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(progress.dailyGoalAyahs || 20);

  useEffect(() => {
    const handleUpdate = () => {
      setProgress(loadReadingProgress());
    };
    window.addEventListener('mushaf_reading_progress_updated', handleUpdate);
    return () => window.removeEventListener('mushaf_reading_progress_updated', handleUpdate);
  }, []);

  const totalReadAyahs = calculateTotalReadAyahsCount(progress);
  const completionPercentage = calculateQuranCompletionPercentage(progress);
  const completedSurahsCount = progress.completedSurahs.length;

  const handleGoalSave = () => {
    const updated = { ...progress, dailyGoalAyahs: Math.max(1, tempGoal) };
    saveReadingProgress(updated);
    setProgress(updated);
    setIsEditingGoal(false);
  };

  const handleDeleteBookmark = (bmId: string) => {
    const updated = {
      ...progress,
      bookmarks: progress.bookmarks.filter((b) => b.id !== bmId),
    };
    saveReadingProgress(updated);
    setProgress(updated);
  };

  return (
    <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[var(--gold)]/15 border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)] shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--gold2)] font-amiri flex items-center gap-1.5">
              <span>{isRtl ? 'تقدم القراءة والختمة' : 'Reading Progress & Khatma'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] font-sans font-bold">
                {completionPercentage}%
              </span>
            </h3>
            <p className="text-[0.68rem] text-[var(--text3)]">
              {totalReadAyahs.toLocaleString()} / {TOTAL_QURAN_AYAHS.toLocaleString()} {isRtl ? 'آية مقروءة' : 'Ayahs read'}
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-[var(--bg3)] p-1 rounded-2xl border border-[var(--border2)] text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black shadow-sm'
                : 'text-[var(--text2)] hover:text-[var(--gold)]'
            }`}
          >
            {isRtl ? 'التقدم' : 'Progress'}
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'bookmarks'
                ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black shadow-sm'
                : 'text-[var(--text2)] hover:text-[var(--gold)]'
            }`}
          >
            <Bookmark className="w-3 h-3" />
            <span>{isRtl ? 'العلامات' : 'Bookmarks'}</span>
            {progress.bookmarks.length > 0 && (
              <span className="text-[0.62rem] px-1.5 py-0.2 rounded-full bg-black/20 text-current">
                {progress.bookmarks.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4 animate-fade-in">
          {/* Last Read Position Callout with Resume button */}
          {progress.lastRead && (
            <div className="bg-gradient-to-r from-[var(--gold)]/15 via-[var(--bg3)] to-[var(--bg3)] border border-[var(--gold)]/40 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[var(--gold)] text-black flex items-center justify-center shrink-0 shadow-md">
                  <Bookmark className="w-5 h-5 fill-current" />
                </div>
                <div className="min-w-0">
                  <div className="text-[0.65rem] text-[var(--text3)] uppercase font-semibold">
                    {isRtl ? 'آخر موضع قراءة' : 'Last Read Position'}
                  </div>
                  <div className="text-sm sm:text-base font-bold text-[var(--gold2)] truncate font-amiri">
                    {isRtl ? `سورة ${progress.lastRead.surahNameAr}` : `Surah ${progress.lastRead.surahNameEn}`}{' '}
                    · {isRtl ? `الآية ${progress.lastRead.ayahNumber}` : `Ayah ${progress.lastRead.ayahNumber}`}
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  onResumeReading(progress.lastRead!.surahNumber, progress.lastRead!.ayahNumber)
                }
                className="bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <span>{isRtl ? 'متابعة' : 'Resume'}</span>
                {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* Overall Quran Completion Progress Bar */}
          <div className="space-y-1.5 bg-[var(--bg3)] p-3.5 rounded-2xl border border-[var(--border2)]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text2)] font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
                <span>{isRtl ? 'نسبة إنجاز المصحف الشريف:' : 'Overall Quran Completion:'}</span>
              </span>
              <span className="font-bold font-sans text-[var(--gold)]">{completionPercentage}%</span>
            </div>

            <div className="w-full bg-[var(--bg)] h-3 rounded-full overflow-hidden p-0.5 border border-[var(--border2)]">
              <div
                className="bg-gradient-to-r from-[var(--gold)] via-[var(--gold2)] to-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.max(2, completionPercentage)}%` }}
              />
            </div>

            <div className="flex justify-between text-[0.65rem] text-[var(--text3)] pt-1">
              <span>{completedSurahsCount} / {TOTAL_QURAN_SURAHS} {isRtl ? 'سورة مكتملة' : 'Surahs completed'}</span>
              <span>{TOTAL_QURAN_AYAHS - totalReadAyahs} {isRtl ? 'آية متبقية' : 'Ayahs remaining'}</span>
            </div>
          </div>

          {/* Stat Cards: Daily Goal, Streak, Khatmas */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            {/* Daily Reading Goal */}
            <div className="bg-[var(--bg3)] border border-[var(--border2)] rounded-2xl p-3 flex flex-col items-center justify-between">
              <div className="flex items-center gap-1 text-[var(--text3)] text-[0.65rem] font-bold uppercase">
                <Target className="w-3 h-3 text-[var(--gold)]" />
                <span>{isRtl ? 'ورد اليوم' : 'Daily Goal'}</span>
              </div>
              <div className="my-1.5">
                <div className="text-base sm:text-lg font-bold font-sans text-[var(--gold2)]">
                  {progress.todayReadAyahs || 0} / {progress.dailyGoalAyahs || 20}
                </div>
                <div className="text-[0.6rem] text-[var(--text3)]">{isRtl ? 'آية' : 'Ayahs'}</div>
              </div>
              <div className="w-full bg-[var(--bg)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      ((progress.todayReadAyahs || 0) / (progress.dailyGoalAyahs || 20)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Daily Reading Streak */}
            <div className="bg-[var(--bg3)] border border-[var(--border2)] rounded-2xl p-3 flex flex-col items-center justify-between">
              <div className="flex items-center gap-1 text-[var(--text3)] text-[0.65rem] font-bold uppercase">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{isRtl ? 'الاستمرار' : 'Streak'}</span>
              </div>
              <div className="my-1.5">
                <div className="text-base sm:text-lg font-bold font-sans text-amber-400">
                  {progress.streakDays || 1}
                </div>
                <div className="text-[0.6rem] text-[var(--text3)]">{isRtl ? 'أيام متتالية' : 'Days'}</div>
              </div>
              <span className="text-[0.6rem] text-amber-500/90 font-bold">{isRtl ? 'حافظ على وردك' : 'Keep it up!'}</span>
            </div>

            {/* Completed Khatmas */}
            <div className="bg-[var(--bg3)] border border-[var(--border2)] rounded-2xl p-3 flex flex-col items-center justify-between">
              <div className="flex items-center gap-1 text-[var(--text3)] text-[0.65rem] font-bold uppercase">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isRtl ? 'الختمات' : 'Khatmas'}</span>
              </div>
              <div className="my-1.5">
                <div className="text-base sm:text-lg font-bold font-sans text-emerald-400">
                  {progress.khatmaCount || 0}
                </div>
                <div className="text-[0.6rem] text-[var(--text3)]">{isRtl ? 'ختمة تامة' : 'Completed'}</div>
              </div>
              <span className="text-[0.6rem] text-emerald-400/90 font-bold">{isRtl ? 'تقبل الله' : 'MashaAllah'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bookmarks Tab */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-2.5 animate-fade-in max-h-72 overflow-y-auto pe-1">
          {progress.bookmarks.length === 0 ? (
            <div className="text-center py-8 text-[var(--text3)] text-xs space-y-2">
              <Bookmark className="w-8 h-8 mx-auto text-[var(--text3)]/50" />
              <p>
                {isRtl
                  ? 'لم تقم بحفظ أي علامات مرجعية بعد. اضغط على أيقونة الإشارة المرجعية بجانب أي آية لحفظها.'
                  : 'No bookmarks saved yet. Click the bookmark icon next to any verse to save it.'}
              </p>
            </div>
          ) : (
            progress.bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="p-3 rounded-2xl bg-[var(--bg3)] border border-[var(--border2)] hover:border-[var(--gold)]/40 flex items-center justify-between gap-3 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--gold2)] font-amiri">
                      {isRtl ? `سورة ${bm.surahNameAr}` : `Surah ${bm.surahNameEn}`}
                    </span>
                    <span className="text-[0.65rem] px-2 py-0.5 rounded-md bg-[var(--gold)]/10 text-[var(--gold)] font-sans font-bold">
                      {isRtl ? `آية ${bm.ayahNumber}` : `Ayah ${bm.ayahNumber}`}
                    </span>
                  </div>
                  {bm.textSnippet && (
                    <p className="text-[0.75rem] text-[var(--text2)] font-amiri truncate mt-1">
                      {bm.textSnippet}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onResumeReading(bm.surahNumber, bm.ayahNumber)}
                    className="p-2 rounded-xl bg-[var(--gold)]/15 text-[var(--gold)] hover:bg-[var(--gold)] hover:text-black transition-all cursor-pointer"
                    title={isRtl ? 'انتقل إلى الآية' : 'Go to Ayah'}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <button
                    onClick={() => handleDeleteBookmark(bm.id)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                    title={isRtl ? 'حذف العلامة' : 'Delete Bookmark'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
