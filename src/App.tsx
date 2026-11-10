import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Section, Reciter, RepeatSession, TafsirState, DesignStyleId, QuranFontId, AyahCardData } from './types';
import { SURAHS } from './data/surahs';
import { THEMES } from './data/themes';
import { TRANSLATIONS } from './data/translations';
import { 
  getGlobalAyahNumber, 
  getSurahAudioCandidates, 
  getAyahAudioCandidates 
} from './utils/quranAudio';

// Components
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { ThemeModal } from './components/ThemeModal';
import { TafsirModal } from './components/TafsirModal';
import { RepeatModal } from './components/RepeatModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { OfflineManagerModal } from './components/OfflineManagerModal';
import { AdhanActiveBanner } from './components/AdhanActiveBanner';
import { SidebarDashboardNav } from './components/SidebarDashboardNav';
import { DrawerMenu } from './components/DrawerMenu';
import { ReportFab, ReportCenter } from './components/ReportCenter';
import { sectionLabelFor } from './utils/report';
import { TopNavbarHub } from './components/TopNavbarHub';
import { KhatmahModal } from './components/KhatmahModal';
import { AyahCardModal } from './components/AyahCardModal';
import { AmbientFocusAudio } from './components/AmbientFocusAudio';
import { getDownloadedSurahNumbers } from './utils/offlineStorage';

// Section Views
const PrayerSection = React.lazy(() => import('./components/PrayerSection').then((m) => ({ default: m.PrayerSection })));
import { QuranSection } from './components/QuranSection';
import { SurahView } from './components/SurahView';
const MemTestSection = React.lazy(() => import('./components/MemTestSection').then((m) => ({ default: m.MemTestSection })));
const AzkarSection = React.lazy(() => import('./components/AzkarSection').then((m) => ({ default: m.AzkarSection })));
const TasbihSection = React.lazy(() => import('./components/TasbihSection').then((m) => ({ default: m.TasbihSection })));
const AsmaSection = React.lazy(() => import('./components/AsmaSection').then((m) => ({ default: m.AsmaSection })));
const AboutSection = React.lazy(() => import('./components/AboutSection').then((m) => ({ default: m.AboutSection })));
const SupportSection = React.lazy(() => import('./components/SupportSection').then((m) => ({ default: m.SupportSection })));
import { RECITERS, loadSavedReciter, saveReciter } from './utils/quranAudio';
import { getDisplayAyahText } from './utils/quranText';
import { DesignHome, DesignReader } from './components/Designs';
import { DESIGN_IDS, QURAN_FONTS } from './data/designStyles';
import { stopRuqyah } from './utils/ruqyahPlayer';
import { listenForWidgetLaunch } from './utils/widget';
const RuqyahSection = React.lazy(() => import('./components/RuqyahSection').then((m) => ({ default: m.RuqyahSection })));

const LEGACY_DESIGN: Record<string, DesignStyleId> = { mushaf_classic: 'mushaf_page', drawer_menu: 'drawer', sidebar_dashboard: 'grid', top_navbar: 'modern', portal_hub: 'modern' };
function initialDesign(): DesignStyleId {
  const saved = localStorage.getItem('mushaf_design_style') || 'modern';
  if ((DESIGN_IDS as string[]).includes(saved)) return saved as DesignStyleId;
  return LEGACY_DESIGN[saved] || 'modern';
}



export const App: React.FC = () => {
  // 1. Language & Theme State
  const [lang, setLang] = useState<string>(() => localStorage.getItem('mushaf_lang') || 'ar');
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    const saved = localStorage.getItem('mushaf_theme') || 'dark-gold';
    return THEMES.some((t) => t.id === saved) ? saved : 'dark-gold';
  });
  const [currentDesignStyle, setCurrentDesignStyle] = useState<DesignStyleId>(initialDesign);
  const [currentQuranFont, setCurrentQuranFont] = useState<QuranFontId>(
    () => (localStorage.getItem('quran_font_family') as QuranFontId) || 'amiri_quran'
  );
  const [isDrawerMenuOpen, setIsDrawerMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // 2. Navigation State
  const [currentSection, setCurrentSection] = useState<Section>('quran');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null);
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number | undefined>(undefined);
  const [isMemTestOpen, setIsMemTestOpen] = useState(false);

  // 3. Location State
  const [city, setCity] = useState<string>(() => localStorage.getItem('mushaf_city') || 'Mecca');
  const [country, setCountry] = useState<string>(() => localStorage.getItem('mushaf_country') || 'Saudi Arabia');

  // 4. Reciters & Audio State
  const [reciters] = useState<Reciter[]>(RECITERS);
  const [selectedReciter, setSelectedReciterState] = useState<Reciter | null>(() => loadSavedReciter());
  const setSelectedReciter = (r: Reciter) => {
    saveReciter(r);
    setSelectedReciterState(r);
  };
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioVisible, setAudioVisible] = useState(false);
  const [currentPlayingAyah, setCurrentPlayingAyah] = useState<number | null>(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // 5. Repetition Session Engine
  const [repeatSession, setRepeatSession] = useState<RepeatSession | null>(null);
  const [repeatPaused, setRepeatPaused] = useState(false);
  const [activeRepeatAyahText, setActiveRepeatAyahText] = useState('');

  // 6. Modals & Offline
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isKhatmahModalOpen, setIsKhatmahModalOpen] = useState(false);
  const [ayahCardData, setAyahCardData] = useState<AyahCardData | null>(null);
  const [downloadedSurahs, setDownloadedSurahs] = useState<number[]>([]);
  const [tafsirState, setTafsirState] = useState<TafsirState>({
    isOpen: false,
    surahNumber: 1,
    ayahNumber: 1,
    ayahArabicText: '',
    tafsirText: '',
    sourceSlug: 'تفسير الميسر',
    isLoading: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const curSurahAudioPlaying = useRef<number | null>(null);
  const curAyahAudioPlaying = useRef<number | null>(null);
  const candidatesQueueRef = useRef<string[]>([]);
  const candidateIndexRef = useRef<number>(0);
  const callbacksRef = useRef<{
    onEnded?: () => void;
    tryNextCandidate?: () => void;
  }>({});

  // Sync Downloaded Surahs
  useEffect(() => {
    getDownloadedSurahNumbers().then((nums) => setDownloadedSurahs(nums)).catch(() => {});
  }, []);

  // Sync Theme & RTL & Design Style
  useEffect(() => {
    const themeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];
    if (themeObj && themeObj.vars) {
      const root = document.documentElement;
      Object.entries(themeObj.vars).forEach(([key, val]) => {
        root.style.setProperty(key, val);
      });
    }
    document.body.className = `theme-${currentTheme}${themeObj?.light ? ' theme-light' : ' theme-dark'}`;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeObj?.vars['--bg'] || '#080808');
    localStorage.setItem('mushaf_theme', currentTheme);
  }, [currentTheme]);

  // Android home-screen widgets open the app at their ayah / at prayer times
  useEffect(() => {
    let off: () => void = () => {};
    listenForWidgetLaunch((t) => {
      if (t.surah) {
        setCurrentSection('quran');
        setSelectedSurahNumber(t.surah);
        setSelectedAyahNumber(t.ayah);
      } else if (t.section === 'prayer') {
        setSelectedSurahNumber(null);
        setCurrentSection('prayer');
      }
    }).then((f) => (off = f));
    return () => off();
  }, []);

  // Ruqyah playlist and the main player never talk over each other
  useEffect(() => {
    const onRuqyah = () => {
      if (audioRef.current && !audioRef.current.paused) audioRef.current.pause();
      setIsPlaying(false);
    };
    window.addEventListener('ruqyah_play', onRuqyah);
    return () => window.removeEventListener('ruqyah_play', onRuqyah);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-design-style', currentDesignStyle);
    localStorage.setItem('mushaf_design_style', currentDesignStyle);
  }, [currentDesignStyle]);

  useEffect(() => {
    localStorage.setItem('mushaf_lang', lang);
    const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Set up persistent audio callbacks
  const tryNextAudioCandidate = () => {
    if (!audioRef.current) return;
    const queue = candidatesQueueRef.current;
    const nextIdx = candidateIndexRef.current + 1;
    if (nextIdx < queue.length) {
      candidateIndexRef.current = nextIdx;
      const nextUrl = queue[nextIdx];
      audioRef.current.src = nextUrl;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsAudioLoading(false);
        })
        .catch(() => {
          tryNextAudioCandidate();
        });
    } else {
      setIsAudioLoading(false);
      setIsPlaying(false);
    }
  };

  const handleAudioEnded = () => {
    // If in repetition session
    if (repeatSession && !repeatSession.stopped) {
      handleRepeatNextStep();
      return;
    }

    // If regular verse-by-verse playback in surah view
    if (selectedSurahNumber && currentPlayingAyah) {
      const curSurahInfo = SURAHS.find((s) => s.n === selectedSurahNumber);
      if (curSurahInfo && currentPlayingAyah < curSurahInfo.a) {
        playAyahAudio(selectedSurahNumber, currentPlayingAyah + 1);
      } else {
        setIsPlaying(false);
        setCurrentPlayingAyah(null);
      }
    } else {
      setIsPlaying(false);
    }
  };

  // Keep callback refs updated with latest state closures
  useEffect(() => {
    callbacksRef.current = {
      onEnded: handleAudioEnded,
      tryNextCandidate: tryNextAudioCandidate,
    };
  });

  // Initialize single persistent Audio element (never wiped during re-renders)
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const onTimeUpdate = () => setAudioCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setAudioDuration(audio.duration);
      setIsAudioLoading(false);
    };
    const onWaiting = () => setIsAudioLoading(true);
    const onCanPlay = () => setIsAudioLoading(false);
    const onPlaying = () => {
      setIsPlaying(true);
      setIsAudioLoading(false);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      callbacksRef.current.onEnded?.();
    };
    const onError = () => {
      callbacksRef.current.tryNextCandidate?.();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // Update playback rate when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Master audio starter with automatic candidate failover
  const playAudioWithCandidates = (candidates: string[]) => {
    if (!audioRef.current || candidates.length === 0) return;
    candidatesQueueRef.current = candidates;
    candidateIndexRef.current = 0;
    setIsAudioLoading(true);

    const primaryUrl = candidates[0];
    audioRef.current.src = primaryUrl;
    audioRef.current.playbackRate = playbackRate;
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsAudioLoading(false);
      })
      .catch(() => {
        tryNextAudioCandidate();
      });
  };

  // Play full surah audio via reciter candidates with failover
  const playSurahAudio = (surahNumber: number) => {
    if (!audioRef.current) return;
    stopRuqyah();

    if (curSurahAudioPlaying.current === surahNumber && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    curSurahAudioPlaying.current = surahNumber;
    curAyahAudioPlaying.current = null;
    setCurrentPlayingAyah(null);

    const candidates = getSurahAudioCandidates(surahNumber, selectedReciter);
    playAudioWithCandidates(candidates);
    setAudioVisible(true);
  };

  // Play single ayah audio using high-availability candidate CDNs
  const playAyahAudio = async (surahNumber: number, ayahNumber: number) => {
    if (!audioRef.current) return;
    stopRuqyah();
    curSurahAudioPlaying.current = surahNumber;
    curAyahAudioPlaying.current = ayahNumber;
    setCurrentPlayingAyah(ayahNumber);

    const candidates = getAyahAudioCandidates(surahNumber, ayahNumber, selectedReciter);
    playAudioWithCandidates(candidates);
    setAudioVisible(true);
  };

  // Toggle Audio Play/Pause
  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        tryNextAudioCandidate();
      });
    }
  };

  const handleAudioSeek = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
  };

  const handleSkipAyah = (direction: number) => {
    if (selectedSurahNumber && currentPlayingAyah) {
      const curSurahInfo = SURAHS.find((s) => s.n === selectedSurahNumber);
      const maxA = curSurahInfo ? curSurahInfo.a : 7;
      const target = Math.max(1, Math.min(maxA, currentPlayingAyah + direction));
      playAyahAudio(selectedSurahNumber, target);
    }
  };

  // Repetition Session Engine execution
  const handleStartRepeat = (session: RepeatSession) => {
    setRepeatSession(session);
    setRepeatPaused(false);
    setIsRepeatModalOpen(true);

    if (session.mode === 'ayah' && session.sn && session.from) {
      playRepeatAyahStep(session.sn, session.from, 0, session);
    } else if (session.mode === 'surah' && session.s1) {
      playRepeatSurahStep(session.s1, 0, session);
    }
  };

  const playRepeatAyahStep = async (
    surahN: number,
    ayahN: number,
    currentRep: number,
    session: RepeatSession
  ) => {
    if (!audioRef.current || session.stopped) return;
    try {
      const candidates = getAyahAudioCandidates(surahN, ayahN, session.rec);
      playAudioWithCandidates(candidates);

      // Arabic text for the banner (local Tanzil text)
      setActiveRepeatAyahText(await getDisplayAyahText(surahN, ayahN));
    } catch {}
  };

  const playRepeatSurahStep = (
    surahN: number,
    currentRep: number,
    session: RepeatSession
  ) => {
    if (!audioRef.current || session.stopped) return;
    const candidates = getSurahAudioCandidates(surahN, session.rec);
    playAudioWithCandidates(candidates);
  };

  const handleRepeatNextStep = () => {
    if (!repeatSession || repeatSession.stopped) return;

    if (repeatSession.mode === 'ayah') {
      const { sn, from = 1, to = 1, times, rep } = repeatSession;
      const curAyah = (repeatSession as any).curAyah || from;

      if (curAyah < to) {
        // Move to next ayah in the interval
        const nextAyah = curAyah + 1;
        setRepeatSession((prev) => (prev ? { ...prev, curAyah: nextAyah } as any : null));
        if (sn) playRepeatAyahStep(sn, nextAyah, rep, repeatSession);
      } else {
        // Reached end of interval, increment repetition cycle
        const nextRep = rep + 1;
        if (nextRep < times) {
          setRepeatSession((prev) =>
            prev ? { ...prev, rep: nextRep, curAyah: from } as any : null
          );
          if (sn) playRepeatAyahStep(sn, from, nextRep, repeatSession);
        } else {
          // Completed full repeat session!
          setRepeatSession((prev) => (prev ? { ...prev, stopped: true, rep: times } : null));
          alert(lang === 'ar' ? '🎉 تم إكمال جلسة التكرار بنجاح!' : 'Repetition session completed!');
        }
      }
    } else {
      const { s1 = 1, s2 = 1, times, rep } = repeatSession;
      const curS = (repeatSession as any).curS || s1;

      if (curS < s2) {
        const nextS = curS + 1;
        setRepeatSession((prev) => (prev ? { ...prev, curS: nextS } as any : null));
        playRepeatSurahStep(nextS, rep, repeatSession);
      } else {
        const nextRep = rep + 1;
        if (nextRep < times) {
          setRepeatSession((prev) =>
            prev ? { ...prev, rep: nextRep, curS: s1 } as any : null
          );
          playRepeatSurahStep(s1, nextRep, repeatSession);
        } else {
          setRepeatSession((prev) => (prev ? { ...prev, stopped: true, rep: times } : null));
          alert(lang === 'ar' ? '🎉 تم إكمال تكرار السور بنجاح!' : 'Repetition session completed!');
        }
      }
    }
  };

  const handleToggleRepeatPause = () => {
    if (!audioRef.current) return;
    if (repeatPaused) {
      audioRef.current.play().catch(() => {});
      setRepeatPaused(false);
    } else {
      audioRef.current.pause();
      setRepeatPaused(true);
    }
  };

  const handleStopRepeat = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setRepeatSession(null);
    setIsRepeatModalOpen(false);
    setActiveRepeatAyahText('');
  };

  // Open Tafsir Modal
  const handleOpenTafsir = (
    surahNumber: number,
    ayahNumber: number,
    arabicText: string
  ) => {
    setTafsirState({
      isOpen: true,
      surahNumber,
      ayahNumber,
      ayahArabicText: arabicText,
      tafsirText: '',
      sourceSlug: '',
      isLoading: false,
    });
  };

  const activeSurahInfo = selectedSurahNumber
    ? SURAHS.find((s) => s.n === selectedSurahNumber)
    : null;

  return (
    <div className="app-shell h-[100dvh] max-h-screen w-full bg-[var(--bg)] text-[var(--text)] flex flex-col font-sans transition-colors relative selection:bg-[var(--gold)] selection:text-black overflow-hidden">
      {/* Top App Bar (the Minimal design hides all chrome) */}
      {currentDesignStyle !== 'minimal' && (
      <TopBar
        lang={lang}
        currentSection={currentSection}
        currentDesignStyle={currentDesignStyle}
        onSelectSection={(sec) => {
          setSelectedSurahNumber(null);
          setIsMemTestOpen(false);
          setCurrentSection(sec);
        }}
        onSelectLang={(code) => setLang(code)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
        onOpenDrawerMenu={() => setIsDrawerMenuOpen(true)}
        onLogoClick={() => {
          setSelectedSurahNumber(null);
          setIsMemTestOpen(false);
          setCurrentSection('quran');
        }}
      />
      )}

      {/* Live Adhan Screen Banner */}

      <AdhanActiveBanner lang={lang} />

      {/* Top tabs navigation for the Mushaf Page design */}
      {currentDesignStyle === 'mushaf_page' && selectedSurahNumber === null && (
        <TopNavbarHub
          currentSection={currentSection}
          onSelectSection={(sec) => {
            setSelectedSurahNumber(null);
            setIsMemTestOpen(false);
            setCurrentSection(sec);
          }}
          lang={lang}
          onOpenGlobalSearch={() => setIsSearchModalOpen(true)}
        />
      )}

      {/* Main Body Workspace Container */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Persistent Side Navigation Bar for Sidebar Dashboard Layout */}
        {currentDesignStyle === 'grid' && (
          <div className="hidden md:flex shrink-0 h-full">
            <SidebarDashboardNav
              currentSection={currentSection}
              onSelectSection={(sec) => {
                setSelectedSurahNumber(null);
                setIsMemTestOpen(false);
                setCurrentSection(sec);
              }}
              lang={lang}
              onOpenThemeModal={() => setIsThemeModalOpen(true)}
              onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
              onOpenGlobalSearch={() => setIsSearchModalOpen(true)}
              onLogoClick={() => {
                setSelectedSurahNumber(null);
                setIsMemTestOpen(false);
                setCurrentSection('quran');
              }}
            />
          </div>
        )}

        {/* Main Content Area - Scrollable */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 relative pb-6">
          <Suspense fallback={<div className="flex items-center justify-center py-24 text-[var(--gold)] text-sm">جاري التحميل…</div>}>
          {/* If Memorization Test is active */}
          {isMemTestOpen ? (
            <MemTestSection
              lang={lang}
              onBack={() => setIsMemTestOpen(false)}
            />
          ) : selectedSurahNumber !== null && currentDesignStyle !== 'modern' ? (
            <DesignReader
              design={currentDesignStyle}
              surahNumber={selectedSurahNumber}
              initialAyahNumber={selectedAyahNumber}
              fontFamily={(QURAN_FONTS.find((f) => f.id === currentQuranFont) || QURAN_FONTS[0]).fontFamily}
              currentPlayingAyah={currentPlayingAyah}
              isPlaying={isPlaying}
              onBack={() => {
                setSelectedSurahNumber(null);
                setSelectedAyahNumber(undefined);
              }}
              onPlaySurah={(sn) => playSurahAudio(sn)}
              onPlayAyah={(sn, an) => playAyahAudio(sn, an)}
              onOpenTafsir={(sn, an, text) => handleOpenTafsir(sn, an, text)}
              onNavigateSurah={(sn) => {
                setSelectedSurahNumber(sn);
                setSelectedAyahNumber(undefined);
                document.querySelector('main')?.scrollTo({ top: 0 });
              }}
            />
          ) : selectedSurahNumber !== null ? (
            /* Surah Reader View */
            <SurahView
              surahNumber={selectedSurahNumber}
              initialAyahNumber={selectedAyahNumber}
              lang={lang}
              reciters={reciters}
              selectedReciter={selectedReciter}
              currentPlayingAyah={currentPlayingAyah}
              isPlaying={isPlaying}
              currentQuranFont={currentQuranFont}
              onBack={() => {
                setSelectedSurahNumber(null);
                setSelectedAyahNumber(undefined);
              }}
              onSelectReciter={(r) => setSelectedReciter(r)}
              onPlaySurah={(sn) => playSurahAudio(sn)}
              onPlayAyah={(sn, an) => playAyahAudio(sn, an)}
              onOpenRepeatModal={(sn) => {
                setSelectedSurahNumber(sn);
                setIsRepeatModalOpen(true);
              }}
              onOpenTafsir={(sn, an, text) => handleOpenTafsir(sn, an, text)}
              onOpenAyahCard={(cardData) => setAyahCardData(cardData)}
              onNavigateSurah={(sn) => {
                setSelectedSurahNumber(sn);
                setSelectedAyahNumber(undefined);
                document.querySelector('main')?.scrollTo({ top: 0 });
              }}
            />
          ) : (
            /* Main Sections */
            <>
              {currentSection === 'prayer' && (
                <PrayerSection
                  lang={lang}
                  city={city}
                  country={country}
                  onUpdateLocation={(c, co) => {
                    setCity(c);
                    setCountry(co);
                    localStorage.setItem('mushaf_city', c);
                    localStorage.setItem('mushaf_country', co);
                  }}
                />
              )}

              {currentSection === 'quran' && currentDesignStyle !== 'modern' && (
                <DesignHome
                  design={currentDesignStyle}
                  onSelectSurah={(sn, an) => {
                    setSelectedSurahNumber(sn);
                    setSelectedAyahNumber(an);
                  }}
                  onSelectSection={(sec) => setCurrentSection(sec)}
                  onOpenGlobalSearch={() => setIsSearchModalOpen(true)}
                  onOpenKhatmah={() => setIsKhatmahModalOpen(true)}
                  onOpenDrawer={() => setIsDrawerMenuOpen(true)}
                />
              )}
              {currentSection === 'ruqyah' && (
                <RuqyahSection
                  reciters={reciters}
                  selectedReciter={selectedReciter}
                  onSelectReciter={(r) => setSelectedReciter(r)}
                />
              )}
              {currentSection === 'quran' && currentDesignStyle === 'modern' && (
                <QuranSection
                  lang={lang}
                  downloadedSurahs={downloadedSurahs}
                  onSelectSurah={(sn, an) => {
                    setSelectedSurahNumber(sn);
                    setSelectedAyahNumber(an);
                  }}
                  onOpenGlobalSearch={() => setIsSearchModalOpen(true)}
                  onOpenMemorizationTest={() => setIsMemTestOpen(true)}
                  onOpenOfflineManager={() => setIsOfflineModalOpen(true)}
                  onOpenKhatmahModal={() => setIsKhatmahModalOpen(true)}
                  onOpenRepeatModal={(sn) => {
                    if (sn) setSelectedSurahNumber(sn);
                    setIsRepeatModalOpen(true);
                  }}
                />
              )}

              {currentSection === 'azkar' && <AzkarSection lang={lang} onOpenRuqyah={() => setCurrentSection('ruqyah')} />}

              {currentSection === 'tasbih' && <TasbihSection lang={lang} />}

              {currentSection === 'asma' && <AsmaSection lang={lang} />}

              {currentSection === 'support' && <SupportSection lang={lang} />}

              {currentSection === 'about' && <AboutSection lang={lang} />}

            </>
          )}
                  </Suspense>
        </main>
      </div>


      {/* Report-a-problem floating button (with a badge when the developer replied) */}
      <ReportFab audioVisible={audioVisible} onOpen={() => setIsReportOpen(true)} />

      {/* Persistent Floating Audio Player Bar */}
      <AudioPlayerBar
        visible={audioVisible}
        surahName={
          activeSurahInfo
            ? activeSurahInfo[lang as keyof typeof activeSurahInfo] || activeSurahInfo.ar
            : 'تلاوة القرآن الكريم'
        }
        reciter={selectedReciter}
        isPlaying={isPlaying}
        isLoading={isAudioLoading}
        currentTime={audioCurrentTime}
        duration={audioDuration}
        onTogglePlay={toggleAudioPlay}
        onSeek={handleAudioSeek}
        onSkipAyah={handleSkipAyah}
        playbackRate={playbackRate}
        onChangePlaybackRate={setPlaybackRate}
        onOpenTafsir={() => {
          if (selectedSurahNumber && currentPlayingAyah) {
            handleOpenTafsir(selectedSurahNumber, currentPlayingAyah, '');
          }
        }}
        onClose={() => {
          if (audioRef.current) audioRef.current.pause();
          setAudioVisible(false);
          setIsPlaying(false);
        }}
      />

      {/* Bottom App Navigation (completely hidden if Top Navbar, Drawer Menu, or Portal Hub layout is selected) */}
      <div
        className={
          currentDesignStyle === 'mushaf_page' ||
          currentDesignStyle === 'drawer' ||
          currentDesignStyle === 'minimal'
            ? 'hidden'
            : currentDesignStyle === 'grid'
            ? 'md:hidden'
            : currentDesignStyle === 'cards'
            ? 'cards-tabbar'
            : ''
        }
      >
        <BottomNav
          currentSection={currentSection}
          onSelectSection={(sec) => {
            setSelectedSurahNumber(null);
            setIsMemTestOpen(false);
            setCurrentSection(sec);
          }}
          lang={lang}
        />
      </div>

      {/* Slide-out Drawer Hamburger Menu */}
      <DrawerMenu
        isOpen={isDrawerMenuOpen}
        onClose={() => setIsDrawerMenuOpen(false)}
        currentSection={currentSection}
        onSelectSection={(sec) => {
          setSelectedSurahNumber(null);
          setIsMemTestOpen(false);
          setCurrentSection(sec);
          setIsDrawerMenuOpen(false);
        }}
        lang={lang}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
        onOpenGlobalSearch={() => setIsSearchModalOpen(true)}
        onOpenKhatmahModal={() => setIsKhatmahModalOpen(true)}
        onOpenMemTest={() => {
          setIsMemTestOpen(true);
          setIsDrawerMenuOpen(false);
        }}
        onOpenReport={() => {
          setIsDrawerMenuOpen(false);
          setIsReportOpen(true);
        }}
      />

      {/* إبلاغ عن مشكلة / بلاغاتي */}
      <ReportCenter open={isReportOpen} onClose={() => setIsReportOpen(false)} initialSection={sectionLabelFor(currentSection, audioVisible)} />

      {/* Theme & Design Picker Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        currentThemeId={currentTheme}
        currentDesignStyle={currentDesignStyle}
        currentQuranFont={currentQuranFont}
        onSelectTheme={(themeId) => {
          setCurrentTheme(themeId);
        }}
        onSelectDesignStyle={(designId) => {
          setCurrentDesignStyle(designId);
        }}
        onSelectQuranFont={(fontId) => {
          setCurrentQuranFont(fontId);
          localStorage.setItem('quran_font_family', fontId);
        }}
        onClose={() => setIsThemeModalOpen(false)}
        lang={lang}
      />

      {/* Quran Khatmah Goal Planner Modal */}
      <KhatmahModal
        isOpen={isKhatmahModalOpen}
        onClose={() => setIsKhatmahModalOpen(false)}
        lang={lang}
      />

      {/* Visual Ayah Card Studio & Export Modal */}
      <AyahCardModal
        isOpen={!!ayahCardData}
        onClose={() => setAyahCardData(null)}
        ayahData={ayahCardData}
        lang={lang}
      />

      {/* Ambient Nature Focus Soundscapes (Rain, Birds, Waves, Breeze) */}
      <AmbientFocusAudio lang={lang} />

      {/* Multilingual Tafsir & Translation Modal */}
      <TafsirModal
        isOpen={tafsirState.isOpen}
        surahNumber={tafsirState.surahNumber}
        ayahNumber={tafsirState.ayahNumber}
        surahName={
          activeSurahInfo
            ? (activeSurahInfo as any)[lang] || activeSurahInfo.ar
            : ''
        }
        ayahArabicText={tafsirState.ayahArabicText}
        initialTafsirText={tafsirState.tafsirText}
        initialSourceSlug={tafsirState.sourceSlug}
        lang={lang}
        onPlayAyah={() => {
          if (tafsirState.surahNumber && tafsirState.ayahNumber) {
            playAyahAudio(tafsirState.surahNumber, tafsirState.ayahNumber);
          }
        }}
        onClose={() => setTafsirState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Repeat Recitation Modal */}
      <RepeatModal
        isOpen={isRepeatModalOpen}
        currentSurahNumber={selectedSurahNumber || 1}
        reciters={reciters}
        selectedReciter={selectedReciter}
        activeSession={repeatSession}
        isPaused={repeatPaused}
        activeAyahText={activeRepeatAyahText}
        onStartSession={handleStartRepeat}
        onTogglePause={handleToggleRepeatPause}
        onStopSession={handleStopRepeat}
        onClose={() => setIsRepeatModalOpen(false)}
        lang={lang}
      />

      {/* Global Quran Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        lang={lang}
        onSelectAyahResult={(surahNum, ayahNum) => {
          setSelectedSurahNumber(surahNum);
          setCurrentPlayingAyah(ayahNum);
          playAyahAudio(surahNum, ayahNum);
        }}
      />

      {/* Offline Storage & Downloads Manager Modal */}
      <OfflineManagerModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        lang={lang}
        isOnline={navigator.onLine}
        onDownloadedChange={(list) => setDownloadedSurahs(list)}
      />
    </div>
  );
};
export default App;
