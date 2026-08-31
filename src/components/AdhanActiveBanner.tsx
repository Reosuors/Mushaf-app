import React, { useState, useEffect } from 'react';
import { AdhanEventDetail } from '../utils/prayerNotifications';
import { stopAdhanAudio } from '../utils/adhanAudio';
import { Bell, VolumeX, X, Check, Heart, Sparkles } from 'lucide-react';

export const AdhanActiveBanner: React.FC<{ lang: string }> = ({ lang }) => {
  const [activeDetail, setActiveDetail] = useState<AdhanEventDetail | null>(null);
  const [showDuaa, setShowDuaa] = useState(false);
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';

  useEffect(() => {
    const handleAdhanTriggered = (e: Event) => {
      const customEvent = e as CustomEvent<AdhanEventDetail>;
      if (customEvent.detail) {
        setActiveDetail(customEvent.detail);
        setShowDuaa(false);
      }
    };

    window.addEventListener('adhan_triggered', handleAdhanTriggered);
    return () => window.removeEventListener('adhan_triggered', handleAdhanTriggered);
  }, []);

  if (!activeDetail) return null;

  const handleDismiss = () => {
    stopAdhanAudio();
    setActiveDetail(null);
  };

  return (
    <div className="fixed top-3 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-96 z-[990] animate-drop-in">
      <div className="bg-[var(--bg2)]/98 backdrop-blur-xl border-2 border-[var(--gold)] rounded-3xl p-4 shadow-[0_10px_35px_rgba(201,168,76,0.35)] space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold2)] text-black flex items-center justify-center shadow-md animate-pulse">
              <span className="text-xl">🕌</span>
            </div>
            <div>
              <span className="text-[0.65rem] font-bold text-[var(--gold2)] uppercase tracking-wider block">
                {isRtl ? 'حان الآن موعد الأذان' : 'Call to Prayer'}
              </span>
              <h4 className="font-amiri text-base sm:text-lg font-bold text-[var(--text)] leading-none">
                {isRtl ? activeDetail.prayerNameAr : activeDetail.prayerNameEn}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDismiss}
              className="p-2 rounded-xl bg-[var(--bg3)] hover:bg-[var(--bg4)] text-[var(--text2)] hover:text-white transition-all cursor-pointer"
              title={isRtl ? 'إيقاف الصوت وإغلاق' : 'Stop & Close'}
            >
              <VolumeX className="w-4 h-4 text-red-400" />
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 rounded-xl bg-[var(--bg3)] hover:bg-[var(--bg4)] text-[var(--text2)] hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Location & Time info */}
        <div className="bg-[var(--bg3)] rounded-2xl p-2.5 flex items-center justify-between text-xs text-[var(--text2)]">
          <span>📍 {activeDetail.cityName}</span>
          <span className="font-mono font-bold text-[var(--gold2)] text-sm">{activeDetail.timeStr}</span>
        </div>

        {/* Duaa toggle / Duaa text */}
        {!showDuaa ? (
          <button
            onClick={() => setShowDuaa(true)}
            className="w-full py-2 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/30 hover:bg-[var(--gold)]/20 text-[var(--gold)] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRtl ? 'عرض دعاء ما بعد الأذان' : 'Show Duaa After Adhan'}</span>
          </button>
        ) : (
          <div className="bg-gradient-to-br from-[var(--bg3)] to-[var(--bg2)] border border-[var(--gold)]/30 rounded-2xl p-3 text-center space-y-1.5 animate-fade-in">
            <span className="text-[0.65rem] text-[var(--gold2)] font-bold block">
              {isRtl ? 'دعاء ما بعد الأذان المستحب:' : 'Supplication after Adhan:'}
            </span>
            <p className="font-amiri text-xs sm:text-sm text-[var(--text)] leading-relaxed dir-rtl">
              «اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّداً الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَاماً مَحْمُوداً الَّذِي وَعَدْتَهُ»
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
