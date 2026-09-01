import React, { useState, useEffect, useRef } from 'react';
import { requestMicrophonePermission } from '../utils/permissions';
import { SURAHS } from '../data/surahs';
import { TRANSLATIONS } from '../data/translations';
import {
  Brain,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Send,
  Loader2,
  Play,
  Square,
  HelpCircle,
  Eye,
  EyeOff,
  FastForward,
  Award,
  AlertTriangle,
  BookOpen,
  VolumeX,
} from 'lucide-react';
import {
  evaluateRecitationWithAutoCorrection,
  RecitationEvaluationResult,
  removeTashkeelAndQuranMarks,
} from '../utils/arabicRecitationCorrection';

interface MemTestSectionProps {
  lang: string;
  onBack: () => void;
}

interface AyahData {
  number: number;
  numberInSurah: number;
  text: string;
}

export const MemTestSection: React.FC<MemTestSectionProps> = ({ lang, onBack }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';

  // Setup State
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [startAyah, setStartAyah] = useState<number>(1);
  const [testMode, setTestMode] = useState<'continuous' | 'nextAyah'>('continuous');
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [autoListen, setAutoListen] = useState<boolean>(true);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // Loaded Surah Ayahs Cache
  const [surahAyahs, setSurahAyahs] = useState<AyahData[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState<boolean>(false);

  // Active Ayah Index
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const [userSubmission, setUserSubmission] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);

  // Detailed Evaluation & Auto-Correction Result
  const [evaluationResult, setEvaluationResult] = useState<RecitationEvaluationResult | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [completedAyahs, setCompletedAyahs] = useState<number[]>([]);

  // Audio Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const recognitionRef = useRef<any>(null);
  const autoAdvanceTimerRef = useRef<any>(null);

  const curSurahInfo = SURAHS.find((s) => s.n === selectedSurah) || SURAHS[0];

  // Fetch full Surah Ayahs from API
  const fetchSurahAyahs = async (surahNumber: number) => {
    setLoadingAyahs(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      const data = await res.json();
      if (data.code === 200 && data.data?.ayahs) {
        setSurahAyahs(data.data.ayahs);
        return data.data.ayahs;
      }
    } catch (e) {
      console.warn('Surah load error:', e);
    } finally {
      setLoadingAyahs(false);
    }
    return [];
  };

  // Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ar-SA';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserSubmission(transcript);
        setIsListening(false);
        // Automatically evaluate with forgiving Quranic normalization and auto-correction
        evaluateSubmission(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, [currentAyahIndex, surahAyahs, testMode]);

  const startListening = async () => {
    if (!recognitionRef.current) {
      alert(
        isRtl
          ? 'المتصفح لا يدعم التسجيل الصوتي المباشر، يرجى كتابة الآية في الصندوق.'
          : 'Speech recognition is not supported in this browser. Please type the verse.'
      );
      return;
    }

    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      alert(
        isRtl
          ? 'نحتاج إلى إذن الميكروفون لتسجيل تلاوتك. فعّل الإذن من إعدادات التطبيق ثم حاول مرة أخرى.'
          : 'Microphone permission is required to record your recitation. Enable it in app settings and try again.'
      );
      return;
    }

    try {
      setUserSubmission('');
      setEvaluationResult(null);
      setIsListening(true);
      recognitionRef.current.start();
    } catch (e) {
      console.warn('Speech start error:', e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Play audio for current Ayah
  const playAyahAudio = (ayahNumInSurah: number) => {
    if (isPlayingAudio && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    const sPad = String(selectedSurah).padStart(3, '0');
    const aPad = String(ayahNumInSurah).padStart(3, '0');
    const url = `https://everyayah.com/data/Alafasy_128kbps/${sPad}${aPad}.mp3`;

    const audio = new Audio(url);
    audioPlayerRef.current = audio;
    setIsPlayingAudio(true);

    audio.onended = () => setIsPlayingAudio(false);
    audio.onerror = () => setIsPlayingAudio(false);
    audio.play().catch(() => setIsPlayingAudio(false));
  };

  // Start the test session
  const handleStartTest = async () => {
    let ayahs = surahAyahs;
    if (ayahs.length === 0 || ayahs[0].numberInSurah !== 1) {
      ayahs = await fetchSurahAyahs(selectedSurah);
    }

    const targetIdx = Math.max(0, Math.min(ayahs.length - 1, startAyah - 1));
    setCurrentAyahIndex(targetIdx);
    setEvaluationResult(null);
    setShowHint(false);
    setUserSubmission('');
    setCompletedAyahs([]);
    setStreak(0);
    setCorrectCount(0);
    setIsTesting(true);

    if (autoListen) {
      setTimeout(() => {
        startListening();
      }, 500);
    }
  };

  // Evaluate the user's recitation with intelligent normalization & auto-correction
  const evaluateSubmission = (textToEvaluate?: string) => {
    const text = textToEvaluate !== undefined ? textToEvaluate : userSubmission;
    if (!text.trim() || !surahAyahs[currentAyahIndex]) return;

    const currentAyah = surahAyahs[currentAyahIndex];
    const targetAyahObj =
      testMode === 'continuous'
        ? currentAyah
        : surahAyahs[currentAyahIndex + 1] || currentAyah;

    const result = evaluateRecitationWithAutoCorrection(
      text,
      targetAyahObj.text,
      selectedSurah,
      targetAyahObj.numberInSurah
    );

    setEvaluationResult(result);

    if (result.isMatch) {
      setStreak((prev) => prev + 1);
      setCorrectCount((prev) => prev + 1);
      setCompletedAyahs((prev) =>
        prev.includes(currentAyah.numberInSurah) ? prev : [...prev, currentAyah.numberInSurah]
      );

      // If Auto Advance is enabled and similarity is good, advance seamlessly
      if (autoAdvance) {
        if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = setTimeout(() => {
          advanceToNextAyah();
        }, 1800);
      }
    } else {
      setStreak(0);
    }
  };

  // Advance smoothly to the next verse
  const advanceToNextAyah = () => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);

    const nextIndex = currentAyahIndex + 1;
    if (nextIndex < surahAyahs.length) {
      setCurrentAyahIndex(nextIndex);
      setEvaluationResult(null);
      setShowHint(false);
      setUserSubmission('');

      if (autoListen) {
        setTimeout(() => {
          startListening();
        }, 600);
      }
    } else {
      // Completed full surah!
      alert(
        isRtl
          ? `🎉 ما شاء الله تبارك الله! أتممت تسميع سورة ${curSurahInfo.ar} بنجاح!`
          : `🎉 MashaAllah! You successfully completed reciting Surah ${curSurahInfo.en}!`
      );
      setIsTesting(false);
    }
  };

  const currentAyahObj = surahAyahs[currentAyahIndex] || {
    numberInSurah: startAyah,
    text: '',
  };

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-6 pb-28 space-y-4 animate-fade-in">
      {/* Header Bar */}
      <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--gold)] hover:text-[var(--gold2)] active:scale-95 transition-all cursor-pointer bg-[var(--bg3)] border border-[var(--border2)] px-3 py-1.5 rounded-xl"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t.backToQuran || 'رجوع'}</span>
        </button>

        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[var(--gold)]" />
          <h2 className="font-amiri text-base sm:text-lg font-bold text-[var(--gold2)]">
            {isRtl ? 'اختبار وتسميع الحفظ مع التصحيح التلقائي' : 'Memorization & Auto-Correction'}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-[var(--gold)] bg-[var(--gold)]/10 px-2.5 py-1 rounded-xl border border-[var(--gold)]/20">
            🔥 {streak} {isRtl ? 'متتابع' : 'Streak'}
          </span>
        </div>
      </div>

      {!isTesting ? (
        /* Configuration Setup Card */
        <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="text-center space-y-1">
            <h3 className="font-amiri text-xl sm:text-2xl font-bold text-[var(--gold2)]">
              {isRtl ? 'تسميع ذكي مع تصويب الأخطاء فورياً' : 'Smart Recitation & Instant Auto-Correction'}
            </h3>
            <p className="text-xs text-[var(--text2)] max-w-md mx-auto leading-relaxed">
              {isRtl
                ? 'اقرأ الآية بصوتك، وسيتعرف النظام على تلاوتك بدون الحاجة للحركات، ويصحح لك أي خطأ أو كلمة منسية تلقائياً!'
                : 'Recite freely. The engine compares your speech ignoring diacritics and automatically highlights and corrects any recitation errors!'}
            </p>
          </div>

          {/* Surah & Starting Verse */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[0.68rem] font-bold text-[var(--gold)] uppercase mb-1">
                {t.labelSurah}
              </label>
              <select
                value={selectedSurah}
                onChange={(e) => {
                  const sn = parseInt(e.target.value, 10);
                  setSelectedSurah(sn);
                  setStartAyah(1);
                  fetchSurahAyahs(sn);
                }}
                className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-3 py-2.5 rounded-xl text-xs sm:text-sm outline-none focus:border-[var(--gold)] cursor-pointer"
              >
                {SURAHS.map((s) => (
                  <option key={s.n} value={s.n}>
                    {s.n}. {s[lang as keyof typeof s] || s.ar} ({s.a} {t.ayah})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[0.68rem] font-bold text-[var(--gold)] uppercase mb-1">
                {isRtl ? 'البدء من الآية رقم' : 'Start from Ayah #'}
              </label>
              <input
                type="number"
                min="1"
                max={curSurahInfo.a}
                value={startAyah}
                onChange={(e) =>
                  setStartAyah(Math.max(1, Math.min(curSurahInfo.a, parseInt(e.target.value) || 1)))
                }
                className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-3 py-2 rounded-xl text-xs sm:text-sm outline-none focus:border-[var(--gold)]"
              />
            </div>
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="block text-[0.68rem] font-bold text-[var(--gold)] uppercase">
              {isRtl ? 'نوع الاختبار' : 'Test Mode'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTestMode('continuous')}
                className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                  testMode === 'continuous'
                    ? 'bg-[var(--gold)]/10 border-[var(--gold)] text-[var(--text)] ring-1 ring-[var(--gold)]'
                    : 'bg-[var(--bg3)] border-[var(--border2)] text-[var(--text2)]'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>📖</span>
                  <span>{isRtl ? 'تسميع واسترسال متواصل' : 'Continuous Recitation'}</span>
                </div>
                <div className="text-[0.65rem] text-[var(--text2)] mt-0.5">
                  {isRtl ? 'تسميع الآية رقم 1 ثم الانتقال لـ 2 وهكذا' : 'Recite verse 1, then advance to 2, etc.'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTestMode('nextAyah')}
                className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                  testMode === 'nextAyah'
                    ? 'bg-[var(--gold)]/10 border-[var(--gold)] text-[var(--text)] ring-1 ring-[var(--gold)]'
                    : 'bg-[var(--bg3)] border-[var(--border2)] text-[var(--text2)]'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>{isRtl ? 'تحدي استحضار الآية التالية' : 'Next Ayah Recall'}</span>
                </div>
                <div className="text-[0.65rem] text-[var(--text2)] mt-0.5">
                  {isRtl ? 'نعرض لك آية وتتلو ما بعدها مباشرة' : 'Displays verse N, you recite N+1'}
                </div>
              </button>
            </div>
          </div>

          {/* Smart Automation Options */}
          <div className="bg-[var(--bg3)] border border-[var(--border2)] rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[var(--text)] block">
                  {isRtl ? '⚡ استرسال تلقائي للآية التالية' : 'Auto-Advance to Next Verse'}
                </span>
                <span className="text-[0.65rem] text-[var(--text2)]">
                  {isRtl
                    ? 'عند صحة التلاوة، ينتقل فوراً للآية التالية بعد عرض التصحيح'
                    : 'Advances directly when the verse is recited correctly'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAutoAdvance(!autoAdvance)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                  autoAdvance ? 'bg-emerald-500 justify-end' : 'bg-[var(--bg4)] justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border2)]">
              <div>
                <span className="text-xs font-bold text-[var(--text)] block">
                  {isRtl ? '🎙️ استماع صوتي مستمر' : 'Continuous Voice Listening'}
                </span>
                <span className="text-[0.65rem] text-[var(--text2)]">
                  {isRtl ? 'تشغيل الميكروفون تلقائياً لكل آية جديدة' : 'Auto-opens mic for each new verse'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAutoListen(!autoListen)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                  autoListen ? 'bg-[var(--gold)] justify-end' : 'bg-[var(--bg4)] justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow" />
              </button>
            </div>
          </div>

          {/* Start Test Button */}
          <button
            onClick={handleStartTest}
            disabled={loadingAyahs}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {loadingAyahs ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-black" />
                <span>{isRtl ? 'ابدأ التسميع والتصحيح الآن 🚀' : 'Start Reciting Now 🚀'}</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Active Recitation Screen */
        <div className="space-y-4">
          {/* Progress Tracker Bar */}
          <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl p-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-[var(--gold)] font-amiri text-base">
                سورة {curSurahInfo.ar}
              </span>
              <span className="text-[var(--text3)]">•</span>
              <span className="text-[var(--text2)] font-mono">
                الآية {currentAyahObj.numberInSurah} / {curSurahInfo.a}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                ✓ {completedAyahs.length}
              </span>
              <button
                onClick={() => setIsTesting(false)}
                className="px-2.5 py-1 rounded-xl bg-[var(--bg3)] hover:bg-[var(--bg4)] text-[var(--text2)] text-xs font-bold transition-all cursor-pointer"
              >
                {isRtl ? 'إنهاء' : 'End'}
              </button>
            </div>
          </div>

          {/* Main Verse Challenge Box */}
          <div
            className={`bg-[var(--bg2)] border rounded-3xl p-5 sm:p-6 shadow-xl text-center relative transition-all duration-300 ${
              evaluationResult
                ? evaluationResult.isMatch
                  ? 'border-emerald-500/60 bg-gradient-to-b from-[var(--bg2)] to-emerald-950/20 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                  : 'border-amber-500/60 bg-gradient-to-b from-[var(--bg2)] to-amber-950/20'
                : 'border-[var(--border2)]'
            }`}
          >
            {/* Verse Number Badge & Actions */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-[0.7rem] font-bold text-[var(--gold)] uppercase bg-[var(--gold)]/10 px-3 py-1 rounded-full border border-[var(--gold)]/30">
                {isRtl
                  ? `الآية رقم [ ${currentAyahObj.numberInSurah} ]`
                  : `Ayah [ ${currentAyahObj.numberInSurah} ]`}
              </span>

              {/* Audio Listen Button */}
              <button
                onClick={() => playAyahAudio(currentAyahObj.numberInSurah)}
                className={`p-1.5 rounded-full border text-xs transition-all cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-[var(--gold)] text-black border-[var(--gold)] animate-pulse'
                    : 'bg-[var(--bg3)] text-[var(--text2)] border-[var(--border2)] hover:text-[var(--gold)]'
                }`}
                title={isRtl ? 'الاستماع لصوت القارئ' : 'Listen to Reciter'}
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>

              {/* Hint Toggle */}
              <button
                onClick={() => setShowHint(!showHint)}
                className="p-1.5 rounded-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text2)] hover:text-[var(--gold)] text-xs cursor-pointer"
                title={isRtl ? 'تلميح / إظهار الآية' : 'Show Hint'}
              >
                {showHint ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Display prompt for Next Ayah mode */}
            {testMode === 'nextAyah' && currentAyahIndex > 0 && (
              <div className="mb-4 pb-3 border-b border-[var(--border2)]/50">
                <span className="text-[0.65rem] text-[var(--text3)] uppercase block mb-1">
                  {isRtl ? 'الآية السابقة:' : 'Previous Ayah:'}
                </span>
                <p className="font-quran text-base text-[var(--text2)] dir-rtl">
                  {surahAyahs[currentAyahIndex - 1]?.text}
                </p>
              </div>
            )}

            {/* Revealed Ayah when evaluated or hint requested */}
            {evaluationResult || showHint ? (
              <div className="py-2 animate-fade-in space-y-3">
                <p className="font-quran text-xl sm:text-2xl text-[var(--gold2)] leading-[2.4] dir-rtl">
                  {currentAyahObj.text}
                </p>

                {/* Evaluation Status Banner */}
                {evaluationResult && (
                  <div
                    className={`flex items-center justify-center gap-2 py-1.5 px-4 rounded-full w-fit mx-auto border text-xs font-bold ${
                      evaluationResult.isMatch
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 animate-drop-in'
                        : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                    }`}
                  >
                    {evaluationResult.isMatch ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span>
                      {evaluationResult.isMatch
                        ? isRtl
                          ? `ما شاء الله! تلاوة صحيحة ومتقنة (${evaluationResult.similarityScore}% تطابق)`
                          : `Great! Correct Recitation (${evaluationResult.similarityScore}% Match)`
                        : isRtl
                        ? `تلاوتك تحتاج لتصويب (${evaluationResult.similarityScore}% تطابق)`
                        : `Recitation Needs Correction (${evaluationResult.similarityScore}% Match)`}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 space-y-2">
                <p className="text-xs sm:text-sm text-[var(--text2)] font-semibold">
                  {isRtl
                    ? `تفضل بتلاوة الآية رقم (${currentAyahObj.numberInSurah}) بصوتك العذب 🎙️`
                    : `Please recite verse (${currentAyahObj.numberInSurah}) now 🎙️`}
                </p>
                <div className="text-[0.68rem] text-[var(--text3)]">
                  {isRtl
                    ? 'اضغط زر الميكروفون بالأسفل وابدأ القراءة مباشرة'
                    : 'Press microphone below and recite'}
                </div>
              </div>
            )}
          </div>

          {/* User Voice Input Box */}
          <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
            <div className="relative">
              <textarea
                value={userSubmission}
                onChange={(e) => setUserSubmission(e.target.value)}
                placeholder={
                  isListening
                    ? isRtl
                      ? '🎙️ جاري الاستماع لتلاوتك الكريمة... تفضل بالقراءة'
                      : '🎙️ Listening to your recitation... please speak'
                    : isRtl
                    ? 'اضغط الميكروفون للتلاوة بالصوت، أو اكتب الآية هنا...'
                    : 'Press mic to recite or type verse here...'
                }
                rows={2}
                className={`w-full bg-[var(--bg3)] border text-[var(--text)] p-3.5 rounded-2xl text-sm outline-none transition-all dir-rtl leading-relaxed resize-none ${
                  isListening
                    ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] bg-red-950/10'
                    : 'border-[var(--border2)] focus:border-[var(--gold)]'
                }`}
              />

              {/* Large Mic Button */}
              <button
                onClick={toggleListening}
                className={`absolute end-3 bottom-3 p-3 rounded-2xl border transition-all cursor-pointer active:scale-95 shadow-md ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse border-red-400 shadow-red-500/30'
                    : 'bg-[var(--gold)] text-black border-[var(--gold)] hover:bg-[var(--gold2)]'
                }`}
                title={isListening ? 'Stop Listening' : 'Start Listening'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-2">
              {/* Check button if typed manually */}
              {!evaluationResult && userSubmission.trim() && !isListening && (
                <button
                  onClick={() => evaluateSubmission()}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--gold)] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:bg-[var(--gold2)] active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isRtl ? 'تحقق وتصحيح الآية' : 'Check & Auto-Correct'}</span>
                </button>
              )}

              {/* Retake Voice Button */}
              {evaluationResult && (
                <button
                  onClick={startListening}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--gold)]/15 border border-[var(--gold)]/40 text-[var(--gold)] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:bg-[var(--gold)]/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>{isRtl ? 'إعادة التسميع بالصوت' : 'Re-recite Voice'}</span>
                </button>
              )}

              {/* Next verse manual button */}
              <button
                onClick={advanceToNextAyah}
                className="flex-1 py-2.5 rounded-xl bg-[var(--bg3)] hover:bg-[var(--gold)] hover:text-black border border-[var(--border2)] hover:border-[var(--gold)] text-[var(--text)] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <FastForward className="w-4 h-4" />
                <span>{isRtl ? 'الآية التالية ➔' : 'Next Ayah ➔'}</span>
              </button>
            </div>

            {/* AUTOMATIC CORRECTION & WORD-BY-WORD DIFF ENGINE */}
            {evaluationResult && (
              <div className="mt-4 pt-3 border-t border-[var(--border2)] space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--gold2)]">
                    <Sparkles className="w-4 h-4 text-[var(--gold)]" />
                    <span>
                      {isRtl ? 'التصحيح التلقائي وتدقيق الكلمات:' : 'Automatic Word-by-Word Correction:'}
                    </span>
                  </div>
                  <span className="text-[0.68rem] text-[var(--text3)]">
                    {evaluationResult.matchedWordsCount} / {evaluationResult.totalWordsCount}{' '}
                    {isRtl ? 'كلمات صحيحة' : 'words correct'}
                  </span>
                </div>

                {/* Word Badges Comparison Stream */}
                <div className="p-3 bg-[var(--bg3)]/60 rounded-2xl border border-[var(--border2)] flex flex-wrap gap-1.5 items-center justify-center dir-rtl">
                  {evaluationResult.diffs.map((d, i) => {
                    if (d.status === 'match') {
                      return (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-quran text-base font-bold shadow-xs"
                          title="صحيح"
                        >
                          {d.expectedWord}
                        </span>
                      );
                    }
                    if (d.status === 'mismatch') {
                      return (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 font-quran text-base font-bold flex flex-col items-center gap-0.5 shadow-xs"
                        >
                          <span className="text-emerald-400 font-bold">{d.expectedWord}</span>
                          <span className="text-[0.62rem] text-red-400 line-through font-sans">
                            {d.spokenWord}
                          </span>
                        </span>
                      );
                    }
                    if (d.status === 'missing') {
                      return (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-dashed border-amber-500/50 text-amber-300 font-quran text-base font-bold shadow-xs"
                          title="كلمة منسية"
                        >
                          {d.expectedWord}
                          <span className="text-[0.55rem] block font-sans text-amber-400 font-normal">
                            (منسية)
                          </span>
                        </span>
                      );
                    }
                    return (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-gray-500/20 text-gray-400 text-xs line-through"
                        title="كلمة زائدة"
                      >
                        {d.spokenWord}
                      </span>
                    );
                  })}
                </div>

                {/* Practical Correction Tips List */}
                {evaluationResult.correctionTips.length > 0 && (
                  <div className="bg-[var(--bg4)]/50 border border-[var(--border2)] rounded-xl p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--gold)] block text-[0.72rem]">
                        {isRtl ? '🔍 مواضع التصويب في تلاوتك:' : '🔍 Correction Details:'}
                      </span>
                      <button
                        onClick={() => playAyahAudio(currentAyahObj.numberInSurah)}
                        className="px-2.5 py-1 rounded-lg bg-[var(--gold)]/15 border border-[var(--gold)]/30 text-[var(--gold)] hover:bg-[var(--gold)]/25 text-[0.68rem] font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'استمع للصواب بصوت الشيخ' : 'Listen to Reciter'}</span>
                      </button>
                    </div>
                    <ul className="space-y-1 text-[var(--text2)] text-[0.72rem]">
                      {evaluationResult.correctionTips.map((tip, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="text-[var(--gold)]">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
