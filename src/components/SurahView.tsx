import React, { useState, useEffect, useRef } from 'react';
import { SURAHS } from '../data/surahs';
import { Reciter, AyahData } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  getSurahOffline, 
  saveSurahOffline, 
  isSurahDownloaded,
  downloadSurahFromApi 
} from '../utils/offlineStorage';
import {
  updateLastReadPosition,
  toggleBookmark,
  loadReadingProgress,
  toggleSurahCompletion,
} from '../utils/readingProgress';
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Repeat,
  BookOpen,
  Volume2,
  Search,
  Type,
  List,
  Columns,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  CheckCircle2,
  WifiOff,
  Zap,
  Bookmark,
  CheckSquare,
  Award,
} from 'lucide-react';

interface SurahViewProps {
  surahNumber: number;
  initialAyahNumber?: number;
  lang: string;
  reciters: Reciter[];
  selectedReciter: Reciter | null;
  currentPlayingAyah: number | null;
  isPlaying: boolean;
  onBack: () => void;
  onSelectReciter: (reciter: Reciter) => void;
  onPlaySurah: (surahNumber: number) => void;
  onPlayAyah: (surahNumber: number, ayahNumber: number) => void;
  onOpenRepeatModal: (surahNumber: number) => void;
  onOpenTafsir: (surahNumber: number, ayahNumber: number, text: string) => void;
}

export const SurahView: React.FC<SurahViewProps> = ({
  surahNumber,
  initialAyahNumber,
  lang,
  reciters,
  selectedReciter,
  currentPlayingAyah,
  isPlaying,
  onBack,
  onSelectReciter,
  onPlaySurah,
  onPlayAyah,
  onOpenRepeatModal,
  onOpenTafsir,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';

  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [downloadingNow, setDownloadingNow] = useState<boolean>(false);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);

  // Reading progress and bookmarks state
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<number[]>([]);
  const [isSurahCompleted, setIsSurahCompleted] = useState<boolean>(false);
  const [lastReadAyahNumber, setLastReadAyahNumber] = useState<number | null>(null);

  // Display customization
  const [fontSize, setFontSize] = useState<number>(() => {
    return parseInt(localStorage.getItem('quran_font_size') || '26', 10);
  });
  const [viewMode, setViewMode] = useState<'verse' | 'continuous'>('verse');
  const [filterQuery, setFilterQuery] = useState('');
  const [jumpAyah, setJumpAyah] = useState('');

  const surahInfo恒 = SURAHS.find((s) => s.n === surahNumber) || SURAHS[0];
  const surahInfo = surahInfo恒;
  const ayahRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Sync Reading progress and bookmarks
  const refreshProgress = () => {
    const p = loadReadingProgress();
    const bms = p.bookmarks
      .filter((b) => b.surahNumber === surahNumber)
      .map((b) => b.ayahNumber);
    setBookmarkedAyahs(bms);
    setIsSurahCompleted(p.completedSurahs.includes(surahNumber));
    if (p.lastRead?.surahNumber === surahNumber) {
      setLastReadAyahNumber(p.lastRead.ayahNumber);
    }
  };

  useEffect(() => {
    refreshProgress();
  }, [surahNumber]);

  const handleToggleBookmark = (ayahNum: number, text?: string) => {
    toggleBookmark(surahNumber, ayahNum, surahInfo.ar, surahInfo.en, text);
    updateLastReadPosition(surahNumber, ayahNum, surahInfo.ar, surahInfo.en);
    refreshProgress();
  };

  const handleMarkAyahRead = (ayahNum: number) => {
    updateLastReadPosition(surahNumber, ayahNum, surahInfo.ar, surahInfo.en);
    refreshProgress();
  };

  const handleToggleSurahCompletion = () => {
    const isNowComplete = toggleSurahCompletion(surahNumber, surahInfo.a);
    setIsSurahCompleted(isNowComplete);
    refreshProgress();
  };

  const handleFontSize = (delta: number) => {
    setFontSize((prev) => {
      const next = Math.max(18, Math.min(46, prev + delta));
      localStorage.setItem('quran_font_size', String(next));
      return next;
    });
  };

  useEffect(() => {
    let isCancelled = false;
    async function loadSurah() {
      setLoading(true);
      setErrorMsg(null);

      // Check if already in IndexedDB
      try {
        const cached = await getSurahOffline(surahNumber);
        if (cached && cached.length > 0 && !isCancelled) {
          setAyahs(cached);
          setIsDownloaded(true);
          setIsFromCache(true);
          setLoading(false);
          // Auto scroll to initial ayah if given
          if (initialAyahNumber) {
            setTimeout(() => {
              ayahRefs.current[initialAyahNumber]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }
          return;
        }
      } catch (e) {
        console.warn('Could not read IndexedDB cache:', e);
      }

      // If not in cache, fetch from API and cache automatically
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
        const data = await res.json();
        if (data.code === 200 && !isCancelled) {
          const loadedAyahs: AyahData[] = data.data.ayahs || [];
          setAyahs(loadedAyahs);
          setIsFromCache(false);
          // Cache in IndexedDB in background
          saveSurahOffline(surahNumber, loadedAyahs).then(() => {
            if (!isCancelled) setIsDownloaded(true);
          }).catch(() => {});

          // Auto scroll to initial ayah if given
          if (initialAyahNumber) {
            setTimeout(() => {
              ayahRefs.current[initialAyahNumber]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }
        } else {
          throw new Error(data.status || 'Failed to load verses');
        }
      } catch (err: any) {
        if (!isCancelled) {
          // If offline and not in cache
          setErrorMsg(
            navigator.onLine 
              ? (err?.message || t.errLoad) 
              : (isRtl ? 'أنت غير متصل بالإنترنت ولم يتم تحميل هذه السورة مسبقاً. يمكنك فتح السور المحفوظة.' : 'You are offline and this surah is not cached yet.')
          );
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadSurah();
    return () => {
      isCancelled = true;
    };
  }, [surahNumber, initialAyahNumber]);

  const handleDownloadSurah = async () => {
    if (downloadingNow || isDownloaded) return;
    try {
      setDownloadingNow(true);
      if (ayahs.length > 0) {
        await saveSurahOffline(surahNumber, ayahs);
        setIsDownloaded(true);
      } else {
        const downloaded = await downloadSurahFromApi(surahNumber);
        setAyahs(downloaded);
        setIsDownloaded(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingNow(false);
    }
  };

  // Auto-scroll to active ayah
  useEffect(() => {
    if (currentPlayingAyah && ayahRefs.current[currentPlayingAyah]) {
      ayahRefs.current[currentPlayingAyah]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentPlayingAyah]);

  const handleJump = () => {
    const target地理 = parseInt(jumpAyah, 10);
    if (!isNaN(target地理) && target地理 >= 1 && target地理 <= (surahInfo?.a || 1)) {
      ayahRefs.current[target地理]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      setJumpAyah('');
    }
  };

  const filteredAyahs = ayahs.filter((a) => {
    if (!filterQuery) return true;
    return (
      a.text.includes(filterQuery) ||
      a.numberInSurah.toString() === filterQuery
    );
  });

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 pb-28 space-y-4 animate-fade-in">
      {/* Top Navigation Bar */}
      <div className="bg-[var(--bg2)]/95 border border-[var(--border2)] rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-sm sticky top-2 z-20 backdrop-blur-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--gold)] hover:text-[var(--gold2)] active:scale-95 transition-all cursor-pointer bg-[var(--bg3)] border border-[var(--border2)] px-3 py-1.5 rounded-xl shadow-xs"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t.backToSurahs || 'السور'}</span>
        </button>

        {/* Surah Title & Offline status */}
        <div className="text-center flex flex-col items-center">
          <h2 className="font-amiri text-lg sm:text-xl font-bold text-[var(--gold2)] leading-none flex items-center gap-1.5">
            {surahInfo[lang as keyof typeof surahInfo] || surahInfo.ar}
            {isDownloaded && (
              <span className="text-emerald-500" title={isRtl ? 'محفوظة بدون إنترنت' : 'Saved offline'}>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[0.65rem] text-[var(--text3)]">
              {surahInfo.n} · {surahInfo.a} {t.ayah} ·{' '}
              {surahInfo.t === 'm' || surahInfo.t === 'مكية' ? (t.makki || 'مكية') : (t.madani || 'مدنية')}
            </span>
            {isFromCache && (
              <span className="text-[0.6rem] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
                ⚡ {isRtl ? 'محلي' : 'Offline'}
              </span>
            )}
          </div>
        </div>

        {/* View mode toggle & Quick download */}
        <div className="flex items-center gap-1.5">
          {!isDownloaded && (
            <button
              onClick={handleDownloadSurah}
              disabled={downloadingNow}
              className="p-1.5 rounded-xl bg-[var(--bg3)] hover:bg-[var(--gold)]/20 border border-[var(--border2)] text-[var(--gold)] text-xs cursor-pointer transition-all active:scale-95"
              title={isRtl ? 'تحميل السورة للعمل بدون إنترنت' : 'Download surah offline'}
            >
              <Download className={`w-4 h-4 ${downloadingNow ? 'animate-bounce' : ''}`} />
            </button>
          )}

          <div className="flex items-center gap-1 bg-[var(--bg3)] border border-[var(--border2)] p-1 rounded-xl">
            <button
              onClick={() => setViewMode('verse')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'verse'
                  ? 'bg-[var(--gold)] text-black font-bold'
                  : 'text-[var(--text2)] hover:text-[var(--text)]'
              }`}
              title={t.verseByVerse || 'آية بآية'}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('continuous')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'continuous'
                  ? 'bg-[var(--gold)] text-black font-bold'
                  : 'text-[var(--text2)] hover:text-[var(--text)]'
              }`}
              title={t.continuous || 'متواصل'}
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Surah Header Card */}
      <div className="bg-gradient-to-br from-[var(--bg2)] via-[var(--bg3)] to-[var(--bg2)] border border-[var(--border2)] rounded-3xl p-5 sm:p-6 text-center shadow-lg relative overflow-hidden">
        {/* Reciter Selector */}
        <div className="max-w-md mx-auto mb-4">
          <label className="block text-[0.68rem] font-bold text-[var(--gold)] uppercase mb-1">
            {t.labelReciter || 'القارئ'}
          </label>
          <select
            value={selectedReciter?.id || (reciters[0]?.id ?? 0)}
            onChange={(e) => {
              const rec = reciters.find((r) => r.id === parseInt(e.target.value));
              if (rec) onSelectReciter(rec);
            }}
            className="w-full bg-[var(--bg2)] border border-[var(--border2)] text-[var(--text)] px-3 py-2 rounded-xl text-xs outline-none focus:border-[var(--gold)] cursor-pointer"
          >
            {reciters.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Play & Repeat Controls */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={() => onPlaySurah(surahNumber)}
            className="flex items-center gap-2 bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black font-extrabold px-6 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
            <span>{isPlaying ? (t.pause || 'إيقاف') : (t.playSurah || 'تشغيل السورة')}</span>
          </button>

          <button
            onClick={() => onOpenRepeatModal(surahNumber)}
            className="flex items-center gap-2 bg-[var(--bg2)] border border-[var(--border2)] text-[var(--text)] hover:text-[var(--gold)] hover:border-[var(--gold)] px-4 py-2.5 rounded-2xl text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Repeat className="w-4 h-4 text-[var(--gold)]" />
            <span>{t.repeatTitle || 'تكرار'}</span>
          </button>
        </div>

        {/* Font size controller & Quick jump */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border2)]/50 text-xs">
          {/* Font scaler */}
          <div className="flex items-center gap-2">
            <span className="text-[var(--text3)] flex items-center gap-1">
              <Type className="w-3.5 h-3.5" />
              <span>{isRtl ? 'حجم الخط:' : 'Font size:'}</span>
            </span>
            <div className="flex items-center gap-1 bg-[var(--bg2)] border border-[var(--border2)] rounded-lg p-0.5">
              <button
                onClick={() => handleFontSize(-2)}
                className="w-7 h-7 rounded hover:bg-[var(--bg3)] text-[var(--text2)] font-bold active:scale-95 cursor-pointer"
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-[var(--gold)]">{fontSize}</span>
              <button
                onClick={() => handleFontSize(2)}
                className="w-7 h-7 rounded hover:bg-[var(--bg3)] text-[var(--text2)] font-bold active:scale-95 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Jump to Ayah */}
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="1"
              max={surahInfo.a}
              placeholder={isRtl ? 'رقم الآية...' : 'Ayah #...'}
              value={jumpAyah}
              onChange={(e) => setJumpAyah(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJump()}
              className="w-24 bg-[var(--bg2)] border border-[var(--border2)] text-[var(--text)] px-2 py-1 rounded-lg text-xs outline-none focus:border-[var(--gold)] text-center"
            />
            <button
              onClick={handleJump}
              className="bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 hover:bg-[var(--gold)]/20 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              {isRtl ? 'انتقال' : 'Go'}
            </button>
          </div>
        </div>
      </div>

      {/* Bismillah Header (except for Surah At-Tawbah 9) */}
      {surahNumber !== 9 && surahNumber !== 1 && (
        <div className="my-6 text-center">
          <div className="font-quran text-2xl sm:text-3xl text-[var(--gold2)] dir-rtl select-none tracking-wide text-glow">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[var(--text2)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
          <p className="text-xs">{t.loadingSurah || 'جاري التحميل...'}</p>
        </div>
      )}

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-center text-xs space-y-2">
          <div>⚠️ {errorMsg}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-bold cursor-pointer"
          >
            {t.retry || 'إعادة المحاولة'}
          </button>
        </div>
      )}

      {/* Continuous Mushaf Flow Mode */}
      {!loading && !errorMsg && viewMode === 'continuous' && (
        <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-3xl p-6 sm:p-8 shadow-xl leading-loose">
          <div
            className="font-quran text-justify dir-rtl select-text"
            style={{ fontSize: `${fontSize}px`, lineHeight: 2.5 }}
          >
            {ayahs.map((ayah) => {
              const isCurrent = currentPlayingAyah === ayah.numberInSurah;
              let displayText = ayah.text;
              if (surahNumber !== 1 && ayah.numberInSurah === 1) {
                displayText = displayText.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', '').trim();
              }
              return (
                <span
                  key={ayah.number}
                  ref={(el) => (ayahRefs.current[ayah.numberInSurah] = el)}
                  onClick={() => onPlayAyah(surahNumber, ayah.numberInSurah)}
                  className={`cursor-pointer transition-all duration-200 rounded-md px-1 inline ${
                    isCurrent
                      ? 'bg-[var(--gold)]/25 text-[var(--gold2)] shadow-sm font-bold'
                      : 'hover:text-[var(--gold)] text-[var(--text)]'
                  }`}
                >
                  {displayText}{' '}
                  <span className="font-sans text-[0.7em] text-[var(--gold)] font-bold inline-block mx-1 select-none">
                    ﴿{ayah.numberInSurah}﴾
                  </span>{' '}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Verse-by-verse Mode */}
      {!loading && !errorMsg && viewMode === 'verse' && (
        <div className="space-y-3">
          {filteredAyahs.map((ayah) => {
            const isAyahActive = currentPlayingAyah === ayah.numberInSurah;
            let displayText = ayah.text;
            if (surahNumber !== 1 && ayah.numberInSurah === 1) {
              displayText = displayText.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', '').trim();
            }

            return (
              <div
                key={ayah.number}
                ref={(el) => (ayahRefs.current[ayah.numberInSurah] = el)}
                className={`border rounded-2xl p-4 sm:p-5 transition-all duration-200 ${
                  isAyahActive
                    ? 'bg-[var(--gold)]/10 border-[var(--gold)] shadow-md ring-1 ring-[var(--gold)]/40'
                    : 'bg-[var(--bg2)] border-[var(--border2)] hover:border-[var(--gold)]/30'
                }`}
              >
                {/* Ayah Actions Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border2)]/50 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[var(--bg3)] border border-[var(--border2)] flex items-center justify-center font-sans text-xs font-bold text-[var(--gold2)]">
                      {ayah.numberInSurah}
                    </span>
                    <span className="text-[0.68rem] text-[var(--text3)]">
                      {surahInfo.ar} : {ayah.numberInSurah}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => handleToggleBookmark(ayah.numberInSurah, displayText)}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        bookmarkedAyahs.includes(ayah.numberInSurah)
                          ? 'bg-[var(--gold)] text-black shadow-sm'
                          : 'bg-[var(--bg3)] text-[var(--text3)] hover:text-[var(--gold)] hover:bg-[var(--gold)]/10'
                      }`}
                      title={
                        bookmarkedAyahs.includes(ayah.numberInSurah)
                          ? (isRtl ? 'إزالة العلامة المرجعية' : 'Remove Bookmark')
                          : (isRtl ? 'حفظ علامة مرجعية وموضع القراءة' : 'Bookmark & Save Reading Position')
                      }
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${
                          bookmarkedAyahs.includes(ayah.numberInSurah) ? 'fill-current' : ''
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => onPlayAyah(surahNumber, ayah.numberInSurah)}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        isAyahActive && isPlaying
                          ? 'bg-[var(--gold)] text-black'
                          : 'bg-[var(--bg3)] text-[var(--gold)] hover:bg-[var(--gold)]/10'
                      }`}
                      title={t.playAyah || 'استماع للآية'}
                    >
                      {isAyahActive && isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                    </button>

                    <button
                      onClick={() => onOpenTafsir(surahNumber, ayah.numberInSurah, displayText)}
                      className="p-1.5 rounded-lg bg-[var(--bg3)] text-[var(--gold2)] hover:bg-[var(--gold)]/10 transition-all cursor-pointer"
                      title={t.tafsirTitle || 'التفسير'}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Ayah Text with Dynamic Font Size */}
                <div
                  onClick={() => handleMarkAyahRead(ayah.numberInSurah)}
                  className="font-quran text-right dir-rtl leading-[2.4] text-[var(--text)] select-text cursor-pointer"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {displayText}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Surah Completion Banner at Bottom */}
      {!loading && !errorMsg && ayahs.length > 0 && (
        <div className="mt-8 p-5 rounded-3xl bg-gradient-to-br from-[var(--bg2)] via-[var(--bg3)] to-[var(--bg2)] border border-[var(--gold)]/30 text-center space-y-3 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-[var(--gold)]/15 border border-[var(--gold)]/30 mx-auto flex items-center justify-center text-[var(--gold)]">
            <Award className="w-6 h-6" />
          </div>

          <div>
            <h4 className="text-base font-bold text-[var(--gold2)] font-amiri">
              {isRtl
                ? `ختام سورة ${surahInfo.ar}`
                : `End of Surah ${surahInfo.en}`}
            </h4>
            <p className="text-xs text-[var(--text2)] mt-0.5">
              {isRtl
                ? `صدق الله العظيم · ${surahInfo.a} آية`
                : `Completed ${surahInfo.a} verses`}
            </p>
          </div>

          <button
            onClick={handleToggleSurahCompletion}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer inline-flex items-center gap-2 ${
              isSurahCompleted
                ? 'bg-emerald-500 text-black border border-emerald-400'
                : 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black hover:brightness-110'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSurahCompleted
                ? (isRtl ? 'تم تحديد السورة كمكتملة في الختمة ✓' : 'Marked as Completed in Khatma ✓')
                : (isRtl ? 'تحديد السورة كمقروءة / مكتملة' : 'Mark Surah as Read & Completed')}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
