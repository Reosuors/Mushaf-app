import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, BookOpen, X, Volume2, VolumeX, Gauge, Loader2 } from 'lucide-react';
import { Reciter } from '../types';

interface AudioPlayerBarProps {
  visible: boolean;
  surahName: string;
  reciter: Reciter | null;
  isPlaying: boolean;
  isLoading?: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onSkipAyah: (direction: number) => void;
  onOpenTafsir: () => void;
  onClose: () => void;
  playbackRate?: number;
  onChangePlaybackRate?: (rate: number) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  visible,
  surahName,
  reciter,
  isPlaying,
  isLoading = false,
  currentTime,
  duration,
  onTogglePlay,
  onSeek,
  onSkipAyah,
  onOpenTafsir,
  onClose,
  playbackRate = 1,
  onChangePlaybackRate,
}) => {
  const [isMuted, setIsMuted] = useState(false);

  if (!visible) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const speedOptions = [1, 1.25, 1.5];
  const nextSpeed = () => {
    if (!onChangePlaybackRate) return;
    const currentIndex = speedOptions.indexOf(playbackRate);
    const nextIdx = (currentIndex + 1) % speedOptions.length;
    onChangePlaybackRate(speedOptions[nextIdx]);
  };

  return (
    <div
      id="persistent-audio-player"
      className="fixed bottom-[calc(var(--nav-h)+env(safe-area-inset-bottom,0px)+8px)] lg:bottom-4 inset-x-2.5 sm:inset-x-6 z-50 max-w-3xl mx-auto rounded-2xl bg-[var(--bg2)]/95 backdrop-blur-2xl border border-[var(--gold)]/35 shadow-[0_14px_40px_rgba(0,0,0,0.65)] overflow-hidden animate-slide-up"
    >
      {/* Interactive top golden progress rail */}
      <div
        className="w-full h-1 bg-[var(--bg3)] cursor-pointer relative group"
        onClick={(e) => {
          if (!duration) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          onSeek(ratio * duration);
        }}
      >
        <div
          className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] shadow-[0_0_8px_var(--gold)] transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-3">
        {/* Start: Surah & Reciter */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-[var(--gold)]/12 border border-[var(--gold)]/30 flex items-center justify-center shrink-0">
            {isPlaying && !isLoading ? (
              <div className="flex items-end gap-0.5 h-3.5">
                <span className="w-[3px] bg-[var(--gold)] rounded-full animate-bounce [animation-delay:-0.3s] h-2.5" />
                <span className="w-[3px] bg-[var(--gold2)] rounded-full animate-bounce [animation-delay:-0.15s] h-3.5" />
                <span className="w-[3px] bg-[var(--gold)] rounded-full animate-bounce h-2" />
              </div>
            ) : isLoading ? (
              <Loader2 className="w-4 h-4 text-[var(--gold)] animate-spin" />
            ) : (
              <Volume2 className="w-4 h-4 text-[var(--gold)]" />
            )}
          </div>

          <div className="min-w-0">
            <div className="font-amiri text-sm sm:text-base font-bold text-[var(--gold2)] truncate leading-tight">
              {surahName || 'تلاوة القرآن الكريم'}
            </div>
            <div className="text-[0.66rem] text-[var(--text2)] truncate flex items-center gap-1.5">
              <span className="truncate">{reciter ? reciter.name.split('(')[0].trim() : 'مشاري العفاسي'}</span>
              <span className="text-[var(--text3)] tabular-nums shrink-0" dir="ltr">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-1 shrink-0" dir="ltr">
          <button
            onClick={() => onSkipAyah(-1)}
            className="w-8 h-8 flex items-center justify-center text-[var(--text2)] hover:text-[var(--gold2)] hover:bg-[var(--bg3)] active:scale-90 transition-all rounded-full cursor-pointer"
            title="الآية السابقة"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            disabled={isLoading}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold2)] text-black flex items-center justify-center shadow-[0_0_18px_rgba(212,175,55,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-black stroke-black" />
            ) : (
              <Play className="w-4 h-4 fill-black stroke-black ms-0.5" />
            )}
          </button>

          <button
            onClick={() => onSkipAyah(1)}
            className="w-8 h-8 flex items-center justify-center text-[var(--text2)] hover:text-[var(--gold2)] hover:bg-[var(--bg3)] active:scale-90 transition-all rounded-full cursor-pointer"
            title="الآية التالية"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* End: Speed, Tafsir, Close */}
        <div className="flex items-center gap-1 shrink-0">
          {onChangePlaybackRate && (
            <button
              onClick={nextSpeed}
              className="hidden sm:inline-flex items-center gap-0.5 px-2 h-8 rounded-lg bg-[var(--bg3)] border border-[var(--border2)] text-[0.68rem] font-bold text-[var(--gold2)] hover:border-[var(--gold)]/50 cursor-pointer"
              title="سرعة التلاوة"
            >
              <Gauge className="w-3 h-3" />
              <span>{playbackRate}×</span>
            </button>
          )}

          <button
            onClick={onOpenTafsir}
            className="hidden xs:flex w-8 h-8 rounded-lg bg-[var(--bg3)] border border-[var(--border2)] items-center justify-center text-[var(--text2)] hover:text-[var(--gold2)] cursor-pointer"
            title="تفسير الآية"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsMuted((m) => !m)}
            className="hidden md:flex w-8 h-8 rounded-lg bg-[var(--bg3)] border border-[var(--border2)] items-center justify-center text-[var(--text2)] hover:text-[var(--gold2)] cursor-pointer"
            title={isMuted ? 'إلغاء الكتم' : 'كتم'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[var(--bg3)] border border-[var(--border2)] flex items-center justify-center text-[var(--text3)] hover:text-red-400 cursor-pointer"
            title="إغلاق المشغل"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
