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

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

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
      className="fixed bottom-[var(--nav-h)] left-0 right-0 z-50 bg-[var(--bg2)]/95 backdrop-blur-2xl border-t border-[var(--gold)]/30 h-18 sm:h-20 flex flex-col justify-center px-3 sm:px-6 shadow-[0_-8px_30px_rgba(0,0,0,0.45)] transition-all duration-300 animate-slide-up"
    >
      {/* Top micro progress line for continuous feedback */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--border2)] cursor-pointer overflow-hidden group"
        onClick={(e) => {
          if (!duration) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = clickX / rect.width;
          onSeek(ratio * duration);
        }}
      >
        <div
          className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] group-hover:h-[4px] transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full max-w-7xl mx-auto">
        {/* Left/Start: Surah & Reciter Info + Audio Equalizer Animation */}
        <div className="flex items-center gap-2.5 min-w-0 max-w-[35%] sm:max-w-[30%]">
          {/* Animated sound wave bars when playing */}
          <div className="w-8 h-8 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center shrink-0">
            {isPlaying && !isLoading ? (
              <div className="flex items-end gap-0.5 h-4">
                <span className="w-1 bg-[var(--gold)] rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                <span className="w-1 bg-[var(--gold2)] rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
                <span className="w-1 bg-[var(--gold)] rounded-full animate-bounce h-2.5" />
              </div>
            ) : isLoading ? (
              <Loader2 className="w-4 h-4 text-[var(--gold)] animate-spin" />
            ) : (
              <Volume2 className="w-4 h-4 text-[var(--gold)] opacity-70" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-bold text-[var(--gold2)] truncate tracking-wide font-amiri">
              {surahName || 'تلاوة القرآن الكريم'}
            </div>
            <div className="text-[0.65rem] sm:text-[0.7rem] text-[var(--text3)] truncate flex items-center gap-1">
              <span>{reciter ? reciter.name.split('(')[0].trim() : 'مشاري العفاسي'}</span>
              <span className="text-[0.55rem] bg-[var(--bg3)] text-[var(--gold)] px-1 rounded border border-[var(--border2)] hidden xs:inline">
                HQ
              </span>
            </div>
          </div>
        </div>

        {/* Center: Playback Controls & Skip Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Previous Ayah */}
          <button
            onClick={() => onSkipAyah(-1)}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[var(--text2)] hover:text-[var(--gold)] hover:bg-[var(--bg3)] active:scale-90 transition-all rounded-full cursor-pointer"
            title="الآية السابقة / Previous Ayah"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Master Play/Pause with Glowing Ring */}
          <button
            onClick={onTogglePlay}
            disabled={isLoading}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[var(--gold)] to-[var(--gold2)] text-black flex items-center justify-center shadow-[0_0_20px_rgba(201,168,76,0.35)] hover:shadow-[0_0_25px_rgba(201,168,76,0.55)] active:scale-95 transition-all cursor-pointer relative"
            title={isPlaying ? "إيقاف مؤقت / Pause" : "تشغيل / Play"}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-black" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 fill-black stroke-black" />
            ) : (
              <Play className="w-5 h-5 fill-black stroke-black ms-0.5" />
            )}
          </button>

          {/* Next Ayah */}
          <button
            onClick={() => onSkipAyah(1)}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[var(--text2)] hover:text-[var(--gold)] hover:bg-[var(--bg3)] active:scale-90 transition-all rounded-full cursor-pointer"
            title="الآية التالية / Next Ayah"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Center-Right: Progress slider on medium+ screens */}
        <div className="hidden md:flex flex-col gap-1 w-48 lg:w-72">
          <div className="flex items-center gap-2">
            <span className="text-[0.65rem] font-mono text-[var(--text3)] w-8 text-end">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-[var(--bg3)] accent-[var(--gold)] rounded-lg outline-none cursor-pointer"
            />
            <span className="text-[0.65rem] font-mono text-[var(--text3)] w-8">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right/End Controls: Speed, Tafsir, Close */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Playback speed toggle */}
          {onChangePlaybackRate && (
            <button
              onClick={nextSpeed}
              className="px-2 py-1 bg-[var(--bg3)] hover:bg-[var(--gold)]/15 border border-[var(--border2)] text-[var(--text2)] hover:text-[var(--gold)] rounded-lg text-[0.68rem] font-mono font-bold transition-all cursor-pointer"
              title="سرعة التلاوة / Playback Speed"
            >
              {playbackRate}x
            </button>
          )}

          {/* Tafsir Modal Trigger */}
          <button
            onClick={onOpenTafsir}
            className="p-2 text-[var(--gold2)] hover:text-[var(--gold)] hover:bg-[var(--gold)]/10 active:scale-90 transition-all rounded-xl cursor-pointer"
            title="التفسير الميسر / Tafsir"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Close Player */}
          <button
            onClick={onClose}
            className="p-2 text-[var(--text3)] hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all rounded-xl cursor-pointer"
            title="إغلاق المشغل / Close Audio Player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
