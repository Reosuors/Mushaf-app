import React from 'react';
import { Play, Pause, SkipBack, SkipForward, BookOpen, X } from 'lucide-react';
import { Reciter } from '../types';

interface AudioPlayerBarProps {
  visible: boolean;
  surahName: string;
  reciter: Reciter | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onSkipAyah: (direction: number) => void;
  onOpenTafsir: () => void;
  onClose: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  visible,
  surahName,
  reciter,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onSeek,
  onSkipAyah,
  onOpenTafsir,
  onClose
}) => {
  if (!visible) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      id="persistent-audio-player"
      className="fixed bottom-[var(--nav-h)] left-0 right-0 z-40 bg-[var(--bg2)]/98 backdrop-blur-xl border-t border-[var(--border2)] h-16 flex items-center px-3 sm:px-5 gap-3 sm:gap-4 shadow-2xl transition-transform duration-300"
    >
      {/* Surah & Reciter Info */}
      <div className="flex-1 min-w-0">
        <div className="text-xs sm:text-sm font-bold text-[var(--gold2)] truncate">
          {surahName || '—'}
        </div>
        <div className="text-[0.68rem] text-[var(--text3)] truncate">
          {reciter ? reciter.name : '—'}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => onSkipAyah(-1)}
          className="p-1.5 text-[var(--text2)] hover:text-[var(--gold)] active:scale-90 transition-all rounded-full cursor-pointer"
          title="Previous Ayah"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={onTogglePlay}
          className="w-10 h-10 rounded-full bg-[var(--gold)] text-black flex items-center justify-center shadow-lg hover:bg-[var(--gold2)] active:scale-95 transition-all cursor-pointer"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ms-0.5" />}
        </button>

        <button
          onClick={() => onSkipAyah(1)}
          className="p-1.5 text-[var(--text2)] hover:text-[var(--gold)] active:scale-90 transition-all rounded-full cursor-pointer"
          title="Next Ayah"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenTafsir}
          className="p-1.5 text-[var(--gold2)] hover:text-[var(--gold)] active:scale-90 transition-all rounded-full cursor-pointer"
          title="Tafsir / التفسير"
        >
          <BookOpen className="w-4 h-4" />
        </button>
      </div>

      {/* Progress & Duration Bar */}
      <div className="hidden sm:flex flex-col gap-1 w-48 sm:w-64">
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="w-full h-1 bg-[var(--border2)] rounded-lg outline-none cursor-pointer"
        />
        <div className="flex justify-between text-[0.62rem] text-[var(--text3)]">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="p-1.5 text-[var(--text3)] hover:text-[var(--text)] active:scale-90 transition-all rounded-full cursor-pointer"
        title="Close Player"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
