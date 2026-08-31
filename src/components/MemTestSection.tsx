import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';

interface MemTestSectionProps {
  lang: string;
  onBack: () => void;
}

export const MemTestSection: React.FC<MemTestSectionProps> = ({ lang, onBack }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';

  // Test setup
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [startAyah, setStartAyah] = useState<number>(1);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // Active Test State
  const [currentPromptAyah, setCurrentPromptAyah] = useState<string>('');
  const [expectedNextAyah, setExpectedNextAyah] = useState<string>('');
  const [promptAyahNum, setPromptAyahNum] = useState<number>(1);
  const [expectedAyahNum, setExpectedAyahNum] = useState<number>(2);
  const [userSubmission, setUserSubmission] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [loadingQuestion, setLoadingQuestion] = useState<boolean>(false);

  // Results
  const [evaluated, setEvaluated] = useState<boolean>(false);
  const [similarity, setSimilarity] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [totalTested, setTotalTested] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  const recognitionRef = useRef<any>(null);

  const curSurahInfo = SURAHS.find((s) => s.n === selectedSurah) || SURAHS[0];

  // Helper to normalize Arabic strings
  const normalizeArabic = (text: string) => {
    return text
      .replace(/([^\u0621-\u063A\u0641-\u064A\u0660-\u0669a-zA-Z0-9])/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/[ة]/g, 'ه')
      .replace(/[ى]/g, 'ي')
      .trim();
  };

  // Calculate similarity between user answer and expected ayah
  const computeSimilarity = (a: string, b: string) => {
    const s1 = normalizeArabic(a);
    const s2 = normalizeArabic(b);
    if (!s1 || !s2) return 0;
    if (s1 === s2) return 100;

    let matches = 0;
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    for (const w of words1) {
      if (words2.includes(w)) matches++;
    }
    const ratio = (matches * 2) / (words1.length + words2.length);
    return Math.min(100, Math.round(ratio * 100));
  };

  // Fetch Ayahs for the question
  const loadQuestion = async (surahN: number, promptNum: number) => {
    setLoadingQuestion(true);
    setEvaluated(false);
    setUserSubmission('');
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahN}`);
      const data = await res.json();
      if (data.code === 200) {
        const ayahsList = data.data.ayahs;
        const pAyah = ayahsList.find((a: any) => a.numberInSurah === promptNum);
        const nextAyah = ayahsList.find((a: any) => a.numberInSurah === promptNum + 1);

        if (pAyah && nextAyah) {
          setCurrentPromptAyah(pAyah.text);
          setExpectedNextAyah(nextAyah.text);
          setPromptAyahNum(promptNum);
          setExpectedAyahNum(promptNum + 1);
          setIsTesting(true);
        } else if (pAyah && !nextAyah) {
          // Reached end of surah
          alert(lang === 'ar' ? 'أحسنت! أتممت السورة الكريمة' : 'MashaAllah! You reached the end of the Surah.');
          setIsTesting(false);
        }
      }
    } catch {
      alert(t.errLoad);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleStartTest = () => {
    loadQuestion(selectedSurah, startAyah);
  };

  const handleNextQuestion = () => {
    loadQuestion(selectedSurah, expectedAyahNum);
  };

  // Web Speech recognition setup
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
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(
        lang === 'ar'
          ? 'المتصفح لا يدعم التعرف الصوتي المباشر، يمكنك كتابة الآية في الصندوق أدناه.'
          : 'Speech recognition is not supported in this browser. Please type your answer.'
      );
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleEvaluate = () => {
    if (!userSubmission.trim()) return;
    const sim = computeSimilarity(userSubmission, expectedNextAyah);
    setSimilarity(sim);
    setEvaluated(true);
    setTotalTested((prev) => prev + 1);
    if (sim >= 70) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-3.5 sm:p-6 pb-28 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--gold)] hover:text-[var(--gold2)] active:scale-95 transition-all cursor-pointer bg-[var(--bg3)] border border-[var(--border2)] px-3 py-1.5 rounded-xl"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t.backToQuran || 'رجوع'}</span>
        </button>

        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[var(--gold)]" />
          <h2 className="font-amiri text-lg font-bold text-[var(--gold2)]">
            {t.memTestTitle || 'اختبار الحفظ الذكي'}
          </h2>
        </div>

        <div className="text-xs font-bold text-[var(--gold)] bg-[var(--gold)]/10 px-2.5 py-1 rounded-xl border border-[var(--gold)]/20">
          🔥 {streak} {lang === 'ar' ? 'تتابع' : 'Streak'}
        </div>
      </div>

      {!isTesting ? (
        /* Configuration Card */
        <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="text-center space-y-1">
            <h3 className="font-amiri text-2xl font-bold text-[var(--gold2)]">
              {lang === 'ar' ? 'حدد السورة والآية للبدء' : 'Select Surah & Starting Verse'}
            </h3>
            <p className="text-xs text-[var(--text2)]">
              {lang === 'ar'
                ? 'سنعرض لك آية، وعليك تلاوة أو كتابة الآية التي تليها مباشرة.'
                : "We will display a verse, and you'll recite or write the next one."}
            </p>
          </div>

          <div className="space-y-3 pt-2">
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
                {lang === 'ar' ? 'الآية الأولى في الاختبار' : 'Starting Ayah'}
              </label>
              <input
                type="number"
                min="1"
                max={curSurahInfo.a - 1}
                value={startAyah}
                onChange={(e) => setStartAyah(parseInt(e.target.value) || 1)}
                className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-3 py-2 rounded-xl text-xs sm:text-sm outline-none focus:border-[var(--gold)]"
              />
            </div>
          </div>

          <button
            onClick={handleStartTest}
            className="w-full mt-4 py-3 rounded-2xl bg-[var(--gold)] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-[var(--gold2)] active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>{lang === 'ar' ? 'ابدأ الاختبار الآن' : 'Start Test Now'}</span>
          </button>
        </div>
      ) : (
        /* Active Test Challenge Screen */
        <div className="space-y-4">
          {/* Prompt Ayah Box */}
          <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-3xl p-5 sm:p-6 shadow-lg text-center relative">
            <span className="text-[0.68rem] font-bold text-[var(--gold)] uppercase tracking-wider bg-[var(--gold)]/10 px-2.5 py-1 rounded-full border border-[var(--gold)]/20">
              {curSurahInfo.ar} : {promptAyahNum}
            </span>

            {loadingQuestion ? (
              <div className="py-10 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-[var(--gold)]" />
                <span className="text-xs text-[var(--text3)]">...</span>
              </div>
            ) : (
              <p className="font-quran text-xl sm:text-2xl text-[var(--gold2)] leading-[2.4] dir-rtl my-4">
                {currentPromptAyah}
              </p>
            )}

            <div className="text-xs text-[var(--text2)] font-semibold pt-2 border-t border-[var(--border2)]/50">
              👇 {lang === 'ar' ? 'ما هي الآية التالية؟' : 'What is the next Ayah?'} ({expectedAyahNum})
            </div>
          </div>

          {/* User Input & Mic Control */}
          <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
            <div className="relative">
              <textarea
                value={userSubmission}
                onChange={(e) => setUserSubmission(e.target.value)}
                placeholder={
                  lang === 'ar'
                    ? 'اضغط زر الميكروفون للتلاوة، أو اكتب الآية هنا...'
                    : 'Tap microphone to recite or type verse here...'
                }
                rows={3}
                className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] p-3 rounded-2xl text-sm outline-none focus:border-[var(--gold)] dir-rtl leading-relaxed resize-none"
              />

              {/* Speech Recognition Button */}
              <button
                onClick={toggleListening}
                className={`absolute end-3 bottom-3 p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse border-red-400 shadow-lg'
                    : 'bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/30 hover:bg-[var(--gold)]/20'
                }`}
                title="Voice Input"
              >
                {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Check Button */}
            {!evaluated ? (
              <button
                onClick={handleEvaluate}
                disabled={!userSubmission.trim()}
                className="w-full py-2.5 rounded-xl bg-[var(--gold)] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:bg-[var(--gold2)] active:scale-95 transition-all cursor-pointer disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تحقق من الإجابة' : 'Check Answer'}</span>
              </button>
            ) : null}
          </div>

          {/* Evaluation Result Feedback */}
          {evaluated && (
            <div
              className={`p-5 rounded-3xl border shadow-xl space-y-3 animate-sheet-up ${
                similarity >= 70
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {similarity >= 70 ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-amber-400" />
                  )}
                  <span className="font-bold text-sm sm:text-base">
                    {similarity >= 70
                      ? lang === 'ar'
                        ? 'أحسنت! إجابة صحيحة'
                        : 'Correct Recitation!'
                      : lang === 'ar'
                      ? 'تحتاج لمراجعة الآية'
                      : 'Needs Review'}
                  </span>
                </div>
                <span className="text-xs font-black bg-black/30 px-2.5 py-1 rounded-lg">
                  {similarity}% {lang === 'ar' ? 'تطابق' : 'Match'}
                </span>
              </div>

              {/* Expected Text Display */}
              <div className="bg-black/30 rounded-2xl p-3 text-center">
                <span className="text-[0.65rem] text-[var(--gold)] uppercase font-bold block mb-1">
                  {lang === 'ar' ? 'الآية الصحيحة:' : 'Correct Verse:'}
                </span>
                <p className="font-quran text-lg sm:text-xl text-[var(--gold2)] leading-[2.2] dir-rtl">
                  {expectedNextAyah}
                </p>
              </div>

              {/* Next Step Controls */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleNextQuestion}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--gold)] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer hover:bg-[var(--gold2)]"
                >
                  <span>{lang === 'ar' ? 'الآية التالية ➔' : 'Next Ayah ➔'}</span>
                </button>
                <button
                  onClick={() => setIsTesting(false)}
                  className="px-4 py-2.5 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text2)] text-xs font-bold active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
