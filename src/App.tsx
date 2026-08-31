import React, { useState, useEffect, useRef } from 'react';
import { Section, Reciter, RepeatSession, TafsirState } from './types';
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
import { DiscordFab } from './components/DiscordFab';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { OfflineManagerModal } from './components/OfflineManagerModal';
import { AdhanActiveBanner } from './components/AdhanActiveBanner';
import { getDownloadedSurahNumbers } from './utils/offlineStorage';

// Section Views
import { PrayerSection } from './components/PrayerSection';
import { QuranSection } from './components/QuranSection';
import { SurahView } from './components/SurahView';
import { MemTestSection } from './components/MemTestSection';
import { AzkarSection } from './components/AzkarSection';
import { TasbihSection } from './components/TasbihSection';
import { AsmaSection } from './components/AsmaSection';
import { SupportSection } from './components/SupportSection';

const DEFAULT_RECITERS: Reciter[] = [
  { id: 1, name: 'مشاري راشد العفاسي (Mishary Al-Afasy)', server: 'https://server8.mp3quran.net/afs/', moshaf: 'حفص عن عاصم' },
  { id: 2, name: 'عبدالباسط عبدالصمد - مرتل (Abdulbasit)', server: 'https://server7.mp3quran.net/basit/', moshaf: 'حفص عن عاصم' },
  { id: 3, name: 'سعد الغامدي (Saad Al-Ghamdi)', server: 'https://server7.mp3quran.net/s_gmd/', moshaf: 'حفص عن عاصم' },
  { id: 4, name: 'عبدالرحمن السديس (Abdul Rahman Al-Sudais)', server: 'https://server11.mp3quran.net/sds/', moshaf: 'حفص عن عاصم' },
  { id: 5, name: 'محمود خليل الحصري (Al-Husary)', server: 'https://server13.mp3quran.net/husr/', moshaf: 'حفص عن عاصم' },
  { id: 6, name: 'محمد صديق المنشاوي (Al-Minshawi)', server: 'https://server10.mp3quran.net/minsh/', moshaf: 'حفص عن عاصم' },
  { id: 7, name: 'أحمد بن علي العجمي (Ahmed Al-Ajmy)', server: 'https://server10.mp3quran.net/ajm/', moshaf: 'حفص عن عاصم' },
  { id: 8, name: 'ماهر المعيقلي (Maher Al-Muaiqly)', server: 'https://server12.mp3quran.net/maher/', moshaf: 'حفص عن عاصم' },
  { id: 9, name: 'سعود الشريم (Saud Al-Shuraim)', server: 'https://server7.mp3quran.net/shur/', moshaf: 'حفص عن عاصم' },
  { id: 10, name: 'ياسر الدوسري (Yasser Al-Dosari)', server: 'https://server11.mp3quran.net/yasser/', moshaf: 'حفص عن عاصم' },
];

export const App: React.FC = () => {
  // 1. Language & Theme State
  const [lang, setLang] = useState<string>(() => localStorage.getItem('mushaf_lang') || 'ar');
  const [currentTheme, setCurrentTheme] = useState<string>(() => localStorage.getItem('mushaf_theme') || 'dark-gold');

  // 2. Navigation State
  const [currentSection, setCurrentSection] = useState<Section>('quran');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null);
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number | undefined>(undefined);
  const [isMemTestOpen, setIsMemTestOpen] = useState(false);

  // 3. Location State
  const [city, setCity] = useState<string>(() => localStorage.getItem('mushaf_city') || 'Mecca');
  const [country, setCountry] = useState<string>(() => localStorage.getItem('mushaf_country') || 'Saudi Arabia');

  // 4. Reciters & Audio State
  const [reciters, setReciters] = useState<Reciter[]>(DEFAULT_RECITERS);
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(DEFAULT_RECITERS[0]);
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

  // Sync Theme & RTL
  useEffect(() => {
    const themeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];
    if (themeObj && themeObj.vars) {
      const root = document.documentElement;
      Object.entries(themeObj.vars).forEach(([key, val]) => {
        root.style.setProperty(key, val);
      });
    }
    document.body.className = `theme-${currentTheme}`;
    localStorage.setItem('mushaf_theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('mushaf_lang', lang);
    const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Fetch Full Reciters list from API (with fallback)
  useEffect(() => {
    async function loadReciters() {
      try {
        const res = await fetch('https://mp3quran.net/api/v3/reciters?language=ar');
        const data = await res.json();
        if (data.reciters && Array.isArray(data.reciters)) {
          const formatted: Reciter[] = data.reciters
            .filter((r: any) => r.moshaf && r.moshaf.length > 0)
            .map((r: any) => {
              const rawServer = r.moshaf[0].server || '';
              return {
                id: r.id,
                name: r.name,
                server: rawServer.endsWith('/') ? rawServer : `${rawServer}/`,
                moshaf: r.moshaf[0].name,
              };
            });
          if (formatted.length > 0) {
            setReciters(formatted);
            const found = formatted.find((r) => r.id === 1 || r.name.includes('العفاسي'));
            if (found) setSelectedReciter(found);
          }
        }
      } catch {
        // Fallback already assigned in initial state
      }
    }
    loadReciters();
  }, []);

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
    curSurahAudioPlaying.current = surahNumber;
    curAyahAudioPlaying.current = ayahNumber;
    setCurrentPlayingAyah(ayahNumber);

    const candidates = getAyahAudioCandidates(surahNumber, ayahNumber);
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
      const candidates = getAyahAudioCandidates(surahN, ayahN);
      playAudioWithCandidates(candidates);

      // Fetch Arabic text for the banner
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surahN}:${ayahN}`);
      const d = await res.json();
      if (d.code === 200) {
        setActiveRepeatAyahText(d.data.text);
      }
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
  const handleOpenTafsir = async (
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
      sourceSlug: 'تفسير الميسر',
      isLoading: true,
    });

    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.muyassar`);
      const data = await res.json();
      if (data.code === 200) {
        setTafsirState((prev) => ({
          ...prev,
          tafsirText: data.data.text,
          isLoading: false,
        }));
      }
    } catch {
      setTafsirState((prev) => ({
        ...prev,
        tafsirText: 'تعذر تحميل التفسير في الوقت الحالي، يرجى المحاولة لاحقاً.',
        isLoading: false,
      }));
    }
  };

  const activeSurahInfo = selectedSurahNumber
    ? SURAHS.find((s) => s.n === selectedSurahNumber)
    : null;

  return (
    <div className="h-[100dvh] max-h-screen w-full bg-[var(--bg)] text-[var(--text)] flex flex-col font-sans transition-colors relative selection:bg-[var(--gold)] selection:text-black overflow-hidden">
      {/* Top App Bar */}
      <TopBar
        lang={lang}
        currentSection={currentSection}
        onSelectSection={(sec) => {
          setSelectedSurahNumber(null);
          setIsMemTestOpen(false);
          setCurrentSection(sec);
        }}
        onSelectLang={(code) => setLang(code)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
        onLogoClick={() => {
          setSelectedSurahNumber(null);
          setIsMemTestOpen(false);
          setCurrentSection('quran');
        }}
      />

      {/* Live Adhan Screen Banner */}
      <AdhanActiveBanner lang={lang} />

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 relative pb-6">
        {/* If Memorization Test is active */}
        {isMemTestOpen ? (
          <MemTestSection
            lang={lang}
            onBack={() => setIsMemTestOpen(false)}
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
          />
        ) : (
          /* Bottom Navigation Sections */
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

            {currentSection === 'quran' && (
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
                onOpenRepeatModal={(sn) => {
                  if (sn) setSelectedSurahNumber(sn);
                  setIsRepeatModalOpen(true);
                }}
              />
            )}

            {currentSection === 'azkar' && <AzkarSection lang={lang} />}

            {currentSection === 'tasbih' && <TasbihSection lang={lang} />}

            {currentSection === 'asma' && <AsmaSection lang={lang} />}

            {currentSection === 'support' && <SupportSection lang={lang} />}
          </>
        )}
      </main>

      {/* Discord Floating Action Button */}
      <DiscordFab label="Discord" audioVisible={audioVisible} />

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

      {/* Bottom App Navigation */}
      <BottomNav
        currentSection={currentSection}
        onSelectSection={(sec) => {
          setSelectedSurahNumber(null);
          setIsMemTestOpen(false);
          setCurrentSection(sec);
        }}
        lang={lang}
      />

      {/* Theme Picker Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        currentThemeId={currentTheme}
        onSelectTheme={(themeId) => {
          setCurrentTheme(themeId);
          setIsThemeModalOpen(false);
        }}
        onClose={() => setIsThemeModalOpen(false)}
        lang={lang}
      />

      {/* Tafsir Sheet Modal */}
      <TafsirModal
        isOpen={tafsirState.isOpen}
        surahName={
          activeSurahInfo
            ? activeSurahInfo[lang as keyof typeof activeSurahInfo] || activeSurahInfo.ar
            : ''
        }
        ayahNumber={tafsirState.ayahNumber}
        ayahArabicText={tafsirState.ayahArabicText}
        tafsirText={tafsirState.tafsirText}
        sourceSlug={tafsirState.sourceSlug}
        isLoading={tafsirState.isLoading}
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
