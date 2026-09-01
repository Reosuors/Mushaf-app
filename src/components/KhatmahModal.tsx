import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  X, 
  ChevronRight, 
  Play, 
  RotateCcw, 
  Award,
  Heart,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { KhatmahPlan } from '../types';
import { SURAHS } from '../data/surahs';

interface KhatmahModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSurah: (surahNumber: number, ayahNumber?: number) => void;
  lang: string;
}

const KHATMAH_STORAGE_KEY = 'mushaf_khatmah_plan_v1';

const DUA_KHATM_QURAN = `اللَّهُمَّ ارْحَمْنِي بِالقُرْآنِ وَاجْعَلْهُ لِي إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً.
اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ وَارْزُقْنِي تِلاَوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ العَالَمِينَ.
اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي، وَاجْعَلِ الحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ وَاجْعَلِ المَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ.
اللَّهُمَّ اجْعَلْ خَيْرَ عُمْرِي آخِرَهُ وَخَيْرَ عَمَلِي خَوَاتِمَهُ وَخَيْرَ أَيَّامِي يَوْمَ أَلْقَاكَ فِيهِ.
اللَّهُمَّ إِنِّي أَسْأَلُكَ عِيشَةً هَنِيَّةً وَمِيتَةً سَوِيَّةً وَمَرَدّاً غَيْرَ مُخْزٍ وَلاَ فَاضِحٍ.
اللَّهُمَّ لاَ تَدَعْ لَنَا ذَنْباً إِلاَّ غَفَرْتَهُ وَلاَ هَمّاً إِلاَّ فَرَّجْتَهُ وَلاَ دَيْناً إِلاَّ قَضَيْتَهُ وَلاَ حَاجَةً مِنْ حَوَائِجِ الدُّنْيَا وَالآخِرَةِ إِلاَّ قَضَيْتَهَا يَا أَرْحَمَ الرَّاحِمِينَ.`;

export const KhatmahModal: React.FC<KhatmahModalProps> = ({
  isOpen,
  onClose,
  onNavigateToSurah,
  lang,
}) => {
  const isRtl = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'plan' | 'dua'>('plan');
  const [plan, setPlan] = useState<KhatmahPlan | null>(null);
  const [customDays, setCustomDays] = useState<number>(30);
  const [copiedDua, setCopiedDua] = useState(false);

  // Load active plan from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KHATMAH_STORAGE_KEY);
      if (saved) {
        setPlan(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load khatmah plan', e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const savePlan = (newPlan: KhatmahPlan) => {
    setPlan(newPlan);
    localStorage.setItem(KHATMAH_STORAGE_KEY, JSON.stringify(newPlan));
  };

  const createPlan = (days: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const totalPages = 604;
    const dailyPages = Math.max(1, Math.ceil(totalPages / days));
    const newPlan: KhatmahPlan = {
      id: Date.now().toString(),
      name: isRtl ? `ختمة ${days} يوماً` : `${days}-Day Khatmah`,
      targetDays: days,
      startDate: todayStr,
      completedAyahs: 0,
      currentSurah: 1,
      currentAyah: 1,
      dailyGoalPages: dailyPages,
      lastReadDate: todayStr,
      completedDates: [],
      isFinished: false,
    };
    savePlan(newPlan);
  };

  const resetPlan = () => {
    if (window.confirm(isRtl ? 'هل تريد حقاً إعادة ضبط خطة الختمة الحالية والبدء من جديد؟' : 'Reset current Khatmah plan?')) {
      localStorage.removeItem(KHATMAH_STORAGE_KEY);
      setPlan(null);
    }
  };

  // Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const isTodayCompleted = plan?.completedDates.includes(todayStr) || false;

  const handleToggleToday = () => {
    if (!plan) return;
    let nextDates = [...plan.completedDates];
    if (isTodayCompleted) {
      nextDates = nextDates.filter((d) => d !== todayStr);
    } else {
      nextDates.push(todayStr);
    }

    // Advance roughly 1 Juz per day or target proportion
    const totalSurahs = 114;
    const progressFraction = Math.min(1, nextDates.length / plan.targetDays);
    const nextSurah = Math.min(114, Math.max(1, Math.ceil(progressFraction * totalSurahs)));

    const updated: KhatmahPlan = {
      ...plan,
      completedDates: nextDates,
      lastReadDate: todayStr,
      currentSurah: nextSurah,
      isFinished: nextDates.length >= plan.targetDays,
    };
    savePlan(updated);
  };

  // Calculate Streak
  const calculateStreak = () => {
    if (!plan || plan.completedDates.length === 0) return 0;
    const sorted = [...plan.completedDates].sort().reverse();
    let streak = 0;
    let checkDate = new Date();

    for (let i = 0; i < 60; i++) {
      const str = checkDate.toISOString().split('T')[0];
      if (sorted.includes(str)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // Today hasn't been marked yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();
  const completedDaysCount = plan ? plan.completedDates.length : 0;
  const progressPercent = plan ? Math.min(100, Math.round((completedDaysCount / plan.targetDays) * 100)) : 0;
  const currentSurahMeta = plan ? SURAHS.find((s) => s.n === plan.currentSurah) || SURAHS[0] : SURAHS[0];

  const handleCopyDua = () => {
    navigator.clipboard.writeText(DUA_KHATM_QURAN);
    setCopiedDua(true);
    setTimeout(() => setCopiedDua(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[var(--bg)] border border-[var(--border2)] rounded-3xl shadow-2xl overflow-hidden text-[var(--text)]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border2)] bg-[var(--bg2)]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--gold)]/15 border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--gold2)] flex items-center gap-2">
                <span>{isRtl ? 'مخطط ختمة القرآن الكريم' : 'Quran Khatmah Planner'}</span>
                {plan && (
                  <span className="px-2 py-0.5 rounded-full text-[0.65rem] bg-[var(--green)]/20 text-[var(--green2)] border border-[var(--green2)]/30">
                    {progressPercent}%
                  </span>
                )}
              </h2>
              <p className="text-xs text-[var(--text2)]">
                {isRtl ? 'نظّم قراءتك اليومية واختم القرآن في المدة التي تختارها' : 'Track daily Quran reading goals & dua al-khatm'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg3)] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--border2)] bg-[var(--bg2)]/30 px-6">
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'plan'
                ? 'border-[var(--gold)] text-[var(--gold)]'
                : 'border-transparent text-[var(--text2)] hover:text-[var(--text)]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{isRtl ? 'الختمة الحالية والجدول' : 'Current Plan & Schedule'}</span>
          </button>
          <button
            onClick={() => setActiveTab('dua')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'dua'
                ? 'border-[var(--gold)] text-[var(--gold)]'
                : 'border-transparent text-[var(--text2)] hover:text-[var(--text)]'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>{isRtl ? 'دعاء ختم القرآن الكريم' : 'Dua Khatm Al-Quran'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {activeTab === 'plan' ? (
            !plan ? (
              /* No Active Plan - Create Plan Wizard */
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[var(--gold)]/20 to-amber-500/10 border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)] shadow-lg">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-lg font-bold text-[var(--text)]">
                    {isRtl ? 'ابدأ خطة ختمة قرآن جديدة' : 'Start a New Quran Khatmah'}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text2)] leading-relaxed">
                    {isRtl
                      ? 'اختر المدة التي تناسبك لختم القرآن الكريم وسيقوم التطبيق بتحديد وردك اليومي ومتابعة تقدمك.'
                      : 'Choose your preferred duration to complete the Holy Quran and track your daily portions.'}
                  </p>
                </div>

                {/* Preset Options */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
                  {[
                    { days: 15, titleAr: '15 يوماً', subAr: 'حزبان يومياً', subEn: '2 Hizb/day' },
                    { days: 30, titleAr: '30 يوماً (شهر)', subAr: 'جزء يومياً', subEn: '1 Juz/day', recommended: true },
                    { days: 45, titleAr: '45 يوماً', subAr: 'نصف جزء يومياً', subEn: '14 Pages/day' },
                    { days: 60, titleAr: '60 يوماً (شهران)', subAr: 'حزب يومياً', subEn: '1 Hizb/day' },
                  ].map((preset) => (
                    <button
                      key={preset.days}
                      onClick={() => createPlan(preset.days)}
                      className={`relative p-3.5 rounded-2xl border text-center transition-all hover:scale-105 active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        preset.recommended
                          ? 'bg-[var(--gold)]/15 border-[var(--gold)] shadow-md shadow-[var(--gold)]/10'
                          : 'bg-[var(--bg2)] border-[var(--border2)] hover:border-[var(--gold)]/50'
                      }`}
                    >
                      {preset.recommended && (
                        <span className="absolute -top-2.5 px-2 py-0.5 rounded-full text-[0.6rem] font-bold bg-[var(--gold)] text-black">
                          {isRtl ? 'الموصى به' : 'Popular'}
                        </span>
                      )}
                      <span className="font-bold text-sm text-[var(--gold2)]">
                        {isRtl ? preset.titleAr : `${preset.days} Days`}
                      </span>
                      <span className="text-[0.68rem] text-[var(--text2)]">
                        {isRtl ? preset.subAr : preset.subEn}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Days Input */}
                <div className="pt-2 max-w-sm mx-auto flex items-center justify-center gap-2">
                  <span className="text-xs text-[var(--text2)]">{isRtl ? 'أو حدد عدد الأيام:' : 'Or custom days:'}</span>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={customDays}
                    onChange={(e) => setCustomDays(Math.max(1, parseInt(e.target.value) || 30))}
                    className="w-16 px-2 py-1 text-center bg-[var(--bg2)] border border-[var(--border2)] rounded-lg text-sm font-bold text-[var(--gold)] focus:border-[var(--gold)] outline-none"
                  />
                  <button
                    onClick={() => createPlan(customDays)}
                    className="px-4 py-1.5 rounded-lg bg-[var(--gold)] text-black text-xs font-bold hover:bg-[var(--gold2)] transition-all cursor-pointer"
                  >
                    {isRtl ? 'بدء الختمة' : 'Start'}
                  </button>
                </div>
              </div>
            ) : (
              /* Active Khatmah Dashboard */
              <div className="space-y-6">
                {/* Stats & Progress Hero Card */}
                <div className="bg-gradient-to-br from-[var(--bg2)] to-[var(--bg3)] border border-[var(--border2)] rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--gold)]/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
                    {/* Left/Right Text Info */}
                    <div className="space-y-2 text-center sm:text-right">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/30 text-[var(--gold2)] text-xs font-bold">
                        <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{isRtl ? `حماسة الالتزام: ${streak} أيام متتالية` : `${streak} Days Streak`}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-[var(--text2)]">
                        {isRtl
                          ? `أتممت ${completedDaysCount} من ${plan.targetDays} يوماً (الورد اليومي: حوالي ${plan.dailyGoalPages} صفحة)`
                          : `Completed ${completedDaysCount} of ${plan.targetDays} days (~${plan.dailyGoalPages} pages/day)`}
                      </p>
                    </div>

                    {/* Circular Progress Gauge */}
                    <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-[var(--bg4)] stroke-current"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-[var(--gold)] stroke-current transition-all duration-1000 ease-out"
                          strokeDasharray={`${progressPercent}, 100`}
                          strokeLinecap="round"
                          strokeWidth="3.2"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-extrabold text-[var(--gold2)]">{progressPercent}%</span>
                        <span className="text-[0.62rem] text-[var(--text2)]">{isRtl ? 'الإنجاز' : 'Done'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Line */}
                  <div className="w-full bg-[var(--bg4)] rounded-full h-2 mt-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[var(--gold)] to-amber-400 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Today's Reading & Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Current Position & Quick Jump */}
                  <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl p-4 flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-xs text-[var(--text2)] font-semibold block mb-1">
                        {isRtl ? '📍 الموضع الحالي للقراءة:' : '📍 Current Position:'}
                      </span>
                      <h4 className="text-base font-bold text-[var(--gold2)]">
                        سورة {currentSurahMeta.ar} ({currentSurahMeta.en})
                      </h4>
                      <p className="text-xs text-[var(--text3)] mt-0.5">
                        {isRtl ? `سورة رقم ${currentSurahMeta.n} • آياتها: ${currentSurahMeta.a}` : `Surah #${currentSurahMeta.n} • ${currentSurahMeta.a} Ayahs`}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToSurah(plan.currentSurah, plan.currentAyah);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow-md"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      <span>{isRtl ? 'متابعة قراءة الورد الآن' : 'Continue Reading Portion'}</span>
                    </button>
                  </div>

                  {/* Daily Completion Checkbox */}
                  <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl p-4 flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-xs text-[var(--text2)] font-semibold block mb-1">
                        {isRtl ? '✨ ورد اليوم:' : '✨ Today\'s Portion:'}
                      </span>
                      <h4 className="text-base font-bold text-[var(--text)]">
                        {isTodayCompleted
                          ? (isRtl ? '🎉 تم إنجاز ورد اليوم بحمد الله!' : '🎉 Today\'s portion completed!')
                          : (isRtl ? 'لم تسجل قراءة اليوم بعد' : 'Not marked as completed today')}
                      </h4>
                      <p className="text-xs text-[var(--text3)] mt-0.5">
                        {isRtl ? 'انقر على الزر لتسجيل قراءتك وتحديث سلسلة الالتزام' : 'Toggle to update your streak and progress'}
                      </p>
                    </div>

                    <button
                      onClick={handleToggleToday}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isTodayCompleted
                          ? 'bg-[var(--green)]/20 border border-[var(--green2)]/40 text-[var(--green2)] hover:bg-[var(--green)]/30'
                          : 'bg-[var(--bg3)] border border-[var(--border2)] text-[var(--gold2)] hover:border-[var(--gold)]'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${isTodayCompleted ? 'text-[var(--green2)] fill-[var(--green2)]' : ''}`} />
                      <span>
                        {isTodayCompleted
                          ? (isRtl ? 'تمت القراءة اليوم (إلغاء التحديد)' : 'Completed (Click to undo)')
                          : (isRtl ? 'تسجيل إتمام قراءة اليوم' : 'Mark Today as Completed')}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Reset or Change Plan */}
                <div className="flex items-center justify-between pt-2 text-xs text-[var(--text3)] border-t border-[var(--border2)]/50">
                  <span>{isRtl ? `تاريخ البدء: ${plan.startDate}` : `Started: ${plan.startDate}`}</span>
                  <button
                    onClick={resetPlan}
                    className="flex items-center gap-1 text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'إعادة ضبط الخطة' : 'Reset Plan'}</span>
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Dua Khatm Al-Quran */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[var(--gold)]/10 border border-[var(--gold)]/30 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-[var(--gold2)] font-bold text-sm">
                  <Award className="w-5 h-5 text-[var(--gold)]" />
                  <span>{isRtl ? 'دعاء ختم القرآن الكريم المستحب' : 'Supplication for Completing the Quran'}</span>
                </div>
                <button
                  onClick={handleCopyDua}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg2)] border border-[var(--border2)] hover:border-[var(--gold)] text-xs text-[var(--text)] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  {copiedDua ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDua ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ الدعاء' : 'Copy')}</span>
                </button>
              </div>

              <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl p-5 sm:p-6 text-justify leading-loose font-quran text-base sm:text-lg text-[var(--text)] select-text shadow-inner">
                {DUA_KHATM_QURAN.split('\n').map((para, i) => (
                  <p key={i} className="mb-4 last:mb-0">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
