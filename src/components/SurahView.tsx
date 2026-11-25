import React, { useState, useEffect, useRef } from 'react';
import { SURAHS } from '../data/surahs';
import { Reciter, AyahData, QuranFontId, AyahCardData } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { QURAN_FONTS } from '../data/designStyles';
import { normalizeArabic } from '../utils/quranSearch';
import { getSurahAyahs, getBasmalaText, stripBasmala, toArabicDigits } from '../utils/quranText';
import { saveSurahOffline, downloadSurahFromApi } from '../utils/offlineStorage';
import {
  updateLastReadPosition,
  toggleBookmark,
  loadReadingProgress,
  toggleSurahCompletion,
  saveLastReadOnly,
} from '../utils/readingProgress';
import { hapticFeedback } from '../utils/haptics';
import {
  SurahIlluminatedBanner,
  BismillahBanner,
  AyahRosette,
  RubElHizbBadge,
  GoldDivider,
} from './IslamicOrnaments';
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
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle2,
  Bookmark,
  Award,
  ScrollText,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  Copy,
  Share2,
  Check,
  SlidersHorizontal,
} from 'lucide-react';

interface SurahViewProps {
  surahNumber: number;
  initialAyahNumber?: number;
  lang: string;
  reciters: Reciter[];
  selectedReciter: Reciter | null;
  currentPlayingAyah: number | null;
  isPlaying: boolean;
  currentQuranFont?: QuranFontId;
  onBack: () => void;
  onSelectReciter: (reciter: Reciter) => void;
  onPlaySurah: (surahNumber: number) => void;
  onPlayAyah: (surahNumber: number, ayahNumber: number) => void;
  onOpenRepeatModal: (surahNumber: number) => void;
  onOpenTafsir: (surahNumber: number, ayahNumber: number, text: string) => void;
  onOpenAyahCard?: (ayahData: AyahCardData) => void;
  onNavigateSurah?: (surahNumber: number) => void;
}

export const SurahView: React.FC<SurahViewProps> = ({
  surahNumber,
  initialAyahNumber,
  lang,
  reciters,
  selectedReciter,
  currentPlayingAyah,
  isPlaying,
  currentQuranFont = 'amiri_quran',
  onBack,
  onSelectReciter,
  onPlaySurah,
  onPlayAyah,
  onOpenRepeatModal,
  onOpenTafsir,
  onOpenAyahCard,
  onNavigateSurah,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';

  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [downloadingNow, setDownloadingNow] = useState<boolean>(false);
  const [basmala, setBasmala] = useState<string>('');

  // Reading progress & bookmarks
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<number[]>([]);
  const [isSurahCompleted, setIsSurahCompleted] = useState<boolean>(false);
  const [lastReadAyahNumber, setLastReadAyahNumber] = useState<number | null>(null);

  // Display customization & Serene Focus Mode (collapsible chrome)
  const [fontSize, setFontSize] = useState<number>(() =>
    parseInt(localStorage.getItem('quran_font_size') || '28', 10)
  );
  const [selectedFont, setSelectedFont] = useState<QuranFontId>(
    () => (localStorage.getItem('quran_font_family') as QuranFontId) || currentQuranFont || 'amiri_quran'
  );
  const [viewMode, setViewMode] = useState<'verse' | 'continuous'>(() =>
    (localStorage.getItem('mushaf_reader_view') as 'verse' | 'continuous') || 'verse'
  );
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [jumpAyah, setJumpAyah] = useState('');

  const activeFontConfig = QURAN_FONTS.find((f) => f.id === selectedFont) || QURAN_FONTS[0];
  const quranFontFamily = activeFontConfig.fontFamily;

  const surahInfo = SURAHS.find((s) => s.n === surahNumber) || SURAHS[0];
  const isMeccan = surahInfo.t === 'm' || surahInfo.t === 'مكية';
  const ayahRefs = useRef<Record<number, HTMLElement | null>>({});
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('mushaf_reader_view', viewMode);
  }, [viewMode]);

  const ayahReference = (n: number) => `[${surahInfo.ar}: ${toArabicDigits(n)}]`;
  const ayahShareText = (n: number, text: string) => `﴿${text}﴾ ${ayahReference(n)}`;

  const handleCopyAyah = async (n: number, text: string) => {
    hapticFeedback.light();
    const value = ayahShareText(n, text);
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {}
      ta.remove();
    }
    setCopiedAyah(n);
    setTimeout(() => setCopiedAyah((c) => (c === n ? null : c)), 1800);
  };

  const handleShareAyah = async (n: number, text: string) => {
    const value = ayahShareText(n, text);
    if (navigator.share) {
      try {
        await navigator.share({ text: value });
        return;
      } catch {
        return;
      }
    }
    handleCopyAyah(n, text);
  };

  // Auto-save reading spot while scrolling
  useEffect(() => {
    if (loading || ayahs.length === 0 || typeof IntersectionObserver === 'undefined') return;
    let timer: number | undefined;
    const visible = new Map<number, number>();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const n = Number((e.target as HTMLElement).dataset.ayah);
          if (e.isIntersecting) visible.set(n, e.boundingClientRect.top);
          else visible.delete(n);
        }
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          if (visible.size === 0) return;
          const top = Math.min(...visible.keys());
          saveLastReadOnly(surahNumber, top, surahInfo.ar, surahInfo.en);
          setLastReadAyahNumber(top);
        }, 800);
      },
      { threshold: 0.6 }
    );
    Object.values(ayahRefs.current).forEach((el) => el && obs.observe(el as Element));
    return () => {
      window.clearTimeout(timer);
      obs.disconnect();
    };
  }, [loading, ayahs, surahNumber, viewMode]);

  const refreshProgress = () => {
    const p = loadReadingProgress();
    setBookmarkedAyahs(p.bookmarks.filter((b) => b.surahNumber === surahNumber).map((b) => b.ayahNumber));
    setIsSurahCompleted(p.completedSurahs.includes(surahNumber));
    if (p.lastRead?.surahNumber === surahNumber) {
      setLastReadAyahNumber(p.lastRead.ayahNumber);
    }
  };

  useEffect(() => {
    refreshProgress();
    if (!initialAyahNumber) {
      document.querySelector('main')?.scrollTo({ top: 0 });
    }
  }, [surahNumber, initialAyahNumber]);

  const handleToggleBookmark = (ayahNum: number, text?: string) => {
    hapticFeedback.medium();
    toggleBookmark(surahNumber, ayahNum, surahInfo.ar, surahInfo.en, text);
    updateLastReadPosition(surahNumber, ayahNum, surahInfo.ar, surahInfo.en);
    refreshProgress();
  };

  const handleToggleSurahCompletion = () => {
    hapticFeedback.success();
    const isNowComplete = toggleSurahCompletion(surahNumber, surahInfo.a);
    setIsSurahCompleted(isNowComplete);
    refreshProgress();
  };

  const handleFontSize = (delta: number) => {
    hapticFeedback.selection();
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
      try {
        const loadedAyahs = await getSurahAyahs(surahNumber);
        if (isCancelled) return;
        setAyahs(loadedAyahs);
        setBasmala(await getBasmalaText());
        setIsDownloaded(true);
        if (initialAyahNumber) {
          setTimeout(() => {
            ayahRefs.current[initialAyahNumber]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      } catch {
        if (!isCancelled) {
          setErrorMsg(
            navigator.onLine
              ? isRtl
                ? 'تعذّر تحميل نص القرآن. حاول مرة ثانية.'
                : 'Could not load the Quran text. Please try again.'
              : isRtl
              ? 'أنت غير متصل بالإنترنت. افتح التطبيق مرة واحدة مع الإنترنت ليعمل بعدها بدون نت.'
              : 'You are offline. Open the app once online so it works offline afterwards.'
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

  // Auto-scroll to actively reciting ayah
  useEffect(() => {
    if (currentPlayingAyah && ayahRefs.current[currentPlayingAyah]) {
      ayahRefs.current[currentPlayingAyah]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentPlayingAyah]);

  const handleJump = () => {
    const targetAyah = parseInt(jumpAyah, 10);
    if (!isNaN(targetAyah) && targetAyah >= 1 && targetAyah <= (surahInfo?.a || 1)) {
      hapticFeedback.navigation();
      ayahRefs.current[targetAyah]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setJumpAyah('');
    }
  };

  const filteredAyahs = ayahs.filter((a) => {
    if (!filterQuery) return true;
    const qNorm = normalizeArabic(filterQuery);
    const aNorm = normalizeArabic(stripBasmala(surahNumber, a.numberInSurah, a.text));
    return (
      aNorm.includes(qNorm) ||
      a.text.includes(filterQuery) ||
      a.numberInSurah.toString() === filterQuery.trim()
    );
  });

  const displaySurahTitle = isRtl
    ? `سورة ${surahInfo.ar}`
    : String(surahInfo[lang as keyof typeof surahInfo] || surahInfo.en);

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 pb-32 space-y-4 animate-fade-in">
      {/* Sticky Minimalist Reader Bar */}
      <div className="bg-[var(--bg2)]/92 backdrop-blur-xl border border-[var(--gold)]/22 rounded-2xl px-2.5 py-2 sm:px-4 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-lg sticky top-2 z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              hapticFeedback.navigation();
              onBack();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--gold2)] hover:text-[var(--gold3)] active:scale-95 transition-all cursor-pointer bg-[var(--bg3)] border border-[var(--border2)] hover:border-[var(--gold)]/50 px-3 py-1.5 rounded-xl"
          >
            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{t.backToSurahs || (isRtl ? 'الفهرس' : 'Index')}</span>
          </button>

          <div className="hidden xs:flex flex-col leading-tight">
            <span className="font-amiri text-base font-bold text-[var(--gold2)]">
              {surahInfo[lang as keyof typeof surahInfo] || surahInfo.ar}
            </span>
            {lastReadAyahNumber && (
              <span className="text-[0.62rem] text-[var(--text3)]">
                {isRtl ? `الموضع: آية ${toArabicDigits(lastReadAyahNumber)}` : `At ayah ${lastReadAyahNumber}`}
              </span>
            )}
          </div>
        </div>

        {/* Mode Switcher + Serene Focus Toggle */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-[var(--bg3)] border border-[var(--border2)] p-0.5 rounded-xl">
            <button
              onClick={() => {
                hapticFeedback.toggle();
                setViewMode('verse');
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.72rem] font-bold transition-all cursor-pointer ${
                viewMode === 'verse'
                  ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black shadow-xs'
                  : 'text-[var(--text2)] hover:text-[var(--text)]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{isRtl ? 'آيات' : 'Verses'}</span>
            </button>
            <button
              onClick={() => {
                hapticFeedback.toggle();
                setViewMode('continuous');
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.72rem] font-bold transition-all cursor-pointer ${
                viewMode === 'continuous'
                  ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black shadow-xs'
                  : 'text-[var(--text2)] hover:text-[var(--text)]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isRtl ? 'مصحف' : 'Mushaf'}</span>
            </button>
          </div>

          <button
            onClick={() => {
              hapticFeedback.tap();
              setFocusMode((f) => {
                const next = !f;
                setShowControls(!next);
                return next;
              });
            }}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              focusMode
                ? 'bg-[var(--gold)] text-black border-[var(--gold)]'
                : 'bg-[var(--bg3)] border-[var(--border2)] text-[var(--gold)] hover:border-[var(--gold)]/60'
            }`}
            title={isRtl ? (focusMode ? 'إظهار الأدوات' : 'وضع القراءة الصافية') : (focusMode ? 'Show controls' : 'Serene Reading Mode')}
          >
            {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {!focusMode && (
            <button
              onClick={() => setShowControls((s) => !s)}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                showControls
                  ? 'bg-[var(--gold)]/15 border-[var(--gold)]/50 text-[var(--gold2)]'
                  : 'bg-[var(--bg3)] border-[var(--border2)] text-[var(--text2)]'
              }`}
              title={isRtl ? 'خيارات التلاوة والخط' : 'Audio & Font Settings'}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}

          {!isDownloaded && (
            <button
              onClick={() => {
                hapticFeedback.tap();
                handleDownloadSurah();
              }}
              disabled={downloadingNow}
              className="w-9 h-9 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] text-[var(--gold)] flex items-center justify-center cursor-pointer"
              title={isRtl ? 'حفظ بدون إنترنت' : 'Save offline'}
            >
              <Download className={`w-4 h-4 ${downloadingNow ? 'animate-bounce' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Classical Medina Illuminated Surah Header Cartouche */}
      <SurahIlluminatedBanner
        title={displaySurahTitle}
        subtitle={!isRtl ? `${surahInfo.ar} · Surah ${surahInfo.n}` : `ترتيب السورة ${toArabicDigits(surahInfo.n)}`}
        rightMeta={isMeccan ? t.makki || 'مكية' : t.madani || 'مدنية'}
        leftMeta={`${isRtl ? toArabicDigits(surahInfo.a) : surahInfo.a} ${t.ayah || 'آية'}`}
        badge={
          isDownloaded ? (
            <CheckCircle2 className="w-4 h-4 text-[var(--green2)] inline-block" />
          ) : undefined
        }
      />

      {/* Collapsible Reciter, Audio & Typography Controls Tray */}
      {showControls && !focusMode && (
        <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-[22px] p-4 sm:p-5 space-y-4 shadow-md animate-fade-in">
          {/* Reciter & Primary Audio Buttons */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="flex-1 min-w-0">
              <label className="block text-[0.66rem] font-bold text-[var(--gold)] mb-1">
                {t.labelReciter || 'القارئ'}
              </label>
              <select
                value={selectedReciter?.id || (reciters[0]?.id ?? 0)}
                onChange={(e) => {
                  const rec = reciters.find((r) => r.id === parseInt(e.target.value, 10));
                  if (rec) onSelectReciter(rec);
                }}
                className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-3 py-2.5 rounded-xl text-xs outline-none focus:border-[var(--gold)] cursor-pointer"
              >
                {reciters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:pt-4">
              <button
                onClick={() => onPlaySurah(surahNumber)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-[0_6px_18px_rgba(212,175,55,0.28)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
                <span>{isPlaying ? t.pause || 'إيقاف' : t.playSurah || 'تشغيل السورة'}</span>
              </button>

              <button
                onClick={() => onPlayAyah(surahNumber, 1)}
                className="flex items-center justify-center gap-1.5 bg-[var(--bg3)] border border-[var(--gold)]/40 text-[var(--gold2)] hover:border-[var(--gold)] font-bold px-3.5 py-2.5 rounded-xl text-xs active:scale-95 transition-all cursor-pointer"
                title={isRtl ? 'تشغيل آية بآية مع التظليل' : 'Play verse by verse'}
              >
                <Volume2 className="w-4 h-4 text-[var(--gold)]" />
                <span>{isRtl ? 'آية بآية' : 'Ayah by Ayah'}</span>
              </button>

              <button
                onClick={() => onOpenRepeatModal(surahNumber)}
                className="flex items-center justify-center gap-1.5 bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text2)] hover:text-[var(--gold2)] hover:border-[var(--gold)]/50 px-3.5 py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
              >
                <Repeat className="w-3.5 h-3.5 text-[var(--gold)]" />
                <span>{t.repeatTitle || 'تكرار'}</span>
              </button>
            </div>
          </div>

          <GoldDivider className="opacity-50" />

          {/* Font Family, Size Scaler & Jump to Ayah */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[var(--text3)] flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-[var(--gold)]" />
              </span>
              <select
                value={selectedFont}
                onChange={(e) => {
                  const nextFont = e.target.value as QuranFontId;
                  setSelectedFont(nextFont);
                  localStorage.setItem('quran_font_family', nextFont);
                }}
                className="bg-[var(--bg3)] border border-[var(--border2)] text-[var(--gold2)] text-xs rounded-xl px-2.5 py-1.5 outline-none focus:border-[var(--gold)] cursor-pointer max-w-[200px]"
              >
                {QURAN_FONTS.map((f) => (
                  <option key={f.id} value={f.id} className="bg-[var(--bg2)] text-[var(--text)]">
                    {isRtl ? f.nameAr : f.nameEn}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-0.5 bg-[var(--bg3)] border border-[var(--border2)] rounded-xl p-0.5">
                <button
                  onClick={() => handleFontSize(-2)}
                  className="w-7 h-7 rounded-lg hover:bg-[var(--bg4)] text-[var(--text2)] font-bold active:scale-95 cursor-pointer"
                  title="تصغير الخط"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-[var(--gold2)] tabular-nums">{fontSize}</span>
                <button
                  onClick={() => handleFontSize(2)}
                  className="w-7 h-7 rounded-lg hover:bg-[var(--bg4)] text-[var(--text2)] font-bold active:scale-95 cursor-pointer"
                  title="تكبير الخط"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                max={surahInfo.a}
                placeholder={isRtl ? 'آية رقم...' : 'Ayah #'}
                value={jumpAyah}
                onChange={(e) => setJumpAyah(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJump()}
                className="w-24 bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-2.5 py-1.5 rounded-xl text-xs outline-none focus:border-[var(--gold)] text-center"
              />
              <button
                onClick={handleJump}
                className="bg-[var(--gold)]/12 text-[var(--gold2)] border border-[var(--gold)]/35 hover:bg-[var(--gold)]/20 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                {isRtl ? 'انتقال' : 'Go'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Intra-Surah Search in Verse Mode */}
      {viewMode === 'verse' && !focusMode && (
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--text3)] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder={isRtl ? 'ابحث داخل آيات هذه السورة بدون تشكيل...' : 'Filter verses in this surah...'}
            className="w-full bg-[var(--bg2)] border border-[var(--border2)] text-[var(--text)] placeholder:text-[var(--text3)] ps-10 pe-9 py-2.5 rounded-2xl text-xs outline-none focus:border-[var(--gold)]"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text3)] hover:text-[var(--text)] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Ornamental Bismillah (Surahs 2–114 except At-Tawbah 9) */}
      {surahNumber !== 9 && surahNumber !== 1 && basmala && !loading && !errorMsg && (
        <BismillahBanner text={basmala} fontFamily={quranFontFamily} />
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[var(--text2)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
          <p className="text-xs">{t.loadingSurah || 'جاري التحميل...'}</p>
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-center text-xs space-y-2">
          <div>{errorMsg}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-xs font-bold cursor-pointer"
          >
            {t.retry || 'إعادة المحاولة'}
          </button>
        </div>
      )}

      {/* Continuous Illuminated Mushaf Manuscript Flow */}
      {!loading && !errorMsg && viewMode === 'continuous' && (
        <div className="manuscript-sheet rounded-[24px] p-5 sm:p-9 relative">
          <span className="pointer-events-none absolute top-2.5 right-3.5 text-[var(--gold)]/60 text-sm select-none">۞</span>
          <span className="pointer-events-none absolute top-2.5 left-3.5 text-[var(--gold)]/60 text-sm select-none">۞</span>

          <div
            className="font-quran text-justify dir-rtl select-text pt-2"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: 2.55,
              fontFamily: quranFontFamily,
              textAlignLast: 'center',
            }}
          >
            {ayahs.map((ayah) => {
              const isCurrent = currentPlayingAyah === ayah.numberInSurah;
              const displayText = stripBasmala(surahNumber, ayah.numberInSurah, ayah.text);
              return (
                <span
                  key={ayah.number}
                  ref={(el) => {
                    ayahRefs.current[ayah.numberInSurah] = el;
                  }}
                  data-ayah={ayah.numberInSurah}
                  onClick={() => onPlayAyah(surahNumber, ayah.numberInSurah)}
                  className={`cursor-pointer transition-all duration-200 rounded-lg px-1 inline ${
                    isCurrent
                      ? 'bg-[var(--gold)]/22 text-[var(--gold3)] shadow-[0_0_16px_rgba(212,175,55,0.2)]'
                      : 'hover:text-[var(--gold2)] text-[var(--text)]'
                  }`}
                  style={{ fontFamily: quranFontFamily }}
                >
                  {displayText}
                  <AyahRosette numberLabel={toArabicDigits(ayah.numberInSurah)} active={isCurrent} />{' '}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Verse-by-Verse Illuminated Manuscript Cards */}
      {!loading && !errorMsg && viewMode === 'verse' && (
        <div className="space-y-3">
          {filteredAyahs.map((ayah) => {
            const isAyahActive = currentPlayingAyah === ayah.numberInSurah;
            const isBookmarked = bookmarkedAyahs.includes(ayah.numberInSurah);
            const displayText = stripBasmala(surahNumber, ayah.numberInSurah, ayah.text);

            return (
              <article
                key={ayah.number}
                ref={(el) => {
                  ayahRefs.current[ayah.numberInSurah] = el;
                }}
                data-ayah={ayah.numberInSurah}
                className={`verse-card border rounded-[22px] p-4 sm:p-6 transition-all duration-200 ${
                  isAyahActive
                    ? 'bg-[var(--gold)]/10 border-[var(--gold)] shadow-[0_0_24px_-6px_rgba(212,175,55,0.35)] ring-1 ring-[var(--gold)]/40'
                    : 'bg-[var(--bg2)] border-[var(--border2)] hover:border-[var(--gold)]/35'
                }`}
              >
                {/* Top Metadata & Action Strip */}
                <div className="flex items-center justify-between gap-2 pb-3 mb-3.5 border-b border-[var(--gold)]/12">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <RubElHizbBadge
                      label={toArabicDigits(ayah.numberInSurah)}
                      active={isAyahActive || isBookmarked}
                      size="sm"
                    />
                    <span className="text-[0.68rem] text-[var(--text3)] whitespace-nowrap">
                      {isRtl
                        ? `الجزء ${toArabicDigits(ayah.juz)} · ص ${toArabicDigits(ayah.page || 0)}${ayah.sajda ? ' · ۩ سجدة' : ''}`
                        : `Juz ${ayah.juz} · P.${ayah.page || 0}${ayah.sajda ? ' · Sajdah' : ''}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onPlayAyah(surahNumber, ayah.numberInSurah)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isAyahActive && isPlaying
                          ? 'bg-[var(--gold)] text-black shadow-sm'
                          : 'bg-[var(--bg3)] text-[var(--gold)] hover:bg-[var(--gold)]/15'
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
                      className="w-8 h-8 rounded-xl bg-[var(--bg3)] text-[var(--text2)] hover:text-[var(--gold2)] hover:bg-[var(--gold)]/12 flex items-center justify-center transition-all cursor-pointer"
                      title={t.tafsir || 'التفسير'}
                    >
                      <ScrollText className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleBookmark(ayah.numberInSurah, displayText)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isBookmarked
                          ? 'bg-[var(--gold)] text-black shadow-sm'
                          : 'bg-[var(--bg3)] text-[var(--text3)] hover:text-[var(--gold2)]'
                      }`}
                      title={isRtl ? 'حفظ علامة مرجعية' : 'Bookmark'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>

                    {onOpenAyahCard && (
                      <button
                        onClick={() =>
                          onOpenAyahCard({
                            surahNumber,
                            surahNameAr: surahInfo.ar,
                            ayahNumber: ayah.numberInSurah,
                            ayahText: displayText,
                          })
                        }
                        className="w-8 h-8 rounded-xl bg-[var(--bg3)] text-[var(--text3)] hover:text-[var(--gold2)] flex items-center justify-center transition-all cursor-pointer"
                        title={isRtl ? 'بطاقة آية للمشاركة' : 'Ayah Card'}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleCopyAyah(ayah.numberInSurah, displayText)}
                      className="w-8 h-8 rounded-xl bg-[var(--bg3)] text-[var(--text3)] hover:text-[var(--gold2)] flex items-center justify-center transition-all cursor-pointer"
                      title={isRtl ? 'نسخ الآية' : 'Copy Ayah'}
                    >
                      {copiedAyah === ayah.numberInSurah ? (
                        <Check className="w-3.5 h-3.5 text-[var(--green2)]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleShareAyah(ayah.numberInSurah, displayText)}
                      className="hidden sm:flex w-8 h-8 rounded-xl bg-[var(--bg3)] text-[var(--text3)] hover:text-[var(--gold2)] items-center justify-center transition-all cursor-pointer"
                      title={isRtl ? 'مشاركة' : 'Share'}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Verbatim Tanzil Uthmani Quran Text */}
                <p
                  onClick={() => onPlayAyah(surahNumber, ayah.numberInSurah)}
                  className="font-quran text-[var(--text)] dir-rtl text-right select-text cursor-pointer"
                  style={{ fontSize: `${fontSize}px`, lineHeight: 2.4, fontFamily: quranFontFamily }}
                >
                  {displayText}
                  <AyahRosette numberLabel={toArabicDigits(ayah.numberInSurah)} active={isAyahActive} />
                </p>
              </article>
            );
          })}
        </div>
      )}

      {/* Surah Footer: Completion Toggle & Prev / Next Surah */}
      {!loading && !errorMsg && (
        <div className="pt-4 space-y-3">
          <div className="flex justify-center">
            <button
              onClick={handleToggleSurahCompletion}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer active:scale-95 ${
                isSurahCompleted
                  ? 'bg-[var(--green)]/18 border-[var(--green2)]/50 text-[var(--green2)]'
                  : 'bg-[var(--bg2)] border-[var(--gold)]/35 text-[var(--gold2)] hover:bg-[var(--gold)]/12'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>
                {isSurahCompleted
                  ? isRtl ? 'تمت قراءة هذه السورة ✓' : 'Surah Marked Complete ✓'
                  : isRtl ? 'تحديد السورة كمقروءة' : 'Mark Surah as Read'}
              </span>
            </button>
          </div>

          {onNavigateSurah && (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                disabled={surahNumber <= 1}
                onClick={() => onNavigateSurah(surahNumber - 1)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[var(--bg2)] border border-[var(--border2)] hover:border-[var(--gold)]/50 text-xs font-bold text-[var(--gold2)] disabled:opacity-35 cursor-pointer transition-all"
              >
                {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                <span className="truncate">
                  {surahNumber > 1
                    ? isRtl
                      ? `سورة ${SURAHS[surahNumber - 2].ar}`
                      : SURAHS[surahNumber - 2].en
                    : isRtl
                    ? 'بداية المصحف'
                    : 'Start'}
                </span>
              </button>

              <button
                disabled={surahNumber >= 114}
                onClick={() => onNavigateSurah(surahNumber + 1)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[var(--bg2)] border border-[var(--border2)] hover:border-[var(--gold)]/50 text-xs font-bold text-[var(--gold2)] disabled:opacity-35 cursor-pointer transition-all"
              >
                <span className="truncate">
                  {surahNumber < 114
                    ? isRtl
                      ? `سورة ${SURAHS[surahNumber].ar}`
                      : SURAHS[surahNumber].en
                    : isRtl
                    ? 'ختام المصحف'
                    : 'End'}
                </span>
                {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
