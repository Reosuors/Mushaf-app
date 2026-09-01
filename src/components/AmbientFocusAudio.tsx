import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Wind, 
  Waves, 
  Sparkles, 
  Sliders, 
  X,
  Play,
  Pause,
  Timer
} from 'lucide-react';

interface AmbientFocusAudioProps {
  lang: string;
}

type SoundType = 'rain' | 'breeze' | 'waves' | 'birds';

interface SoundOption {
  id: SoundType;
  nameAr: string;
  nameEn: string;
  icon: any;
  color: string;
}

const SOUND_OPTIONS: SoundOption[] = [
  { id: 'rain', nameAr: 'صوت المطر الهادئ', nameEn: 'Gentle Rain', icon: CloudRain, color: '#38bdf8' },
  { id: 'breeze', nameAr: 'نسيم الفجر والسكينة', nameEn: 'Dawn Breeze', icon: Wind, color: '#34d399' },
  { id: 'waves', nameAr: 'أمواج البحر الهادئة', nameEn: 'Gentle Waves', icon: Waves, color: '#818cf8' },
  { id: 'birds', nameAr: 'سكينة الطيور والصباح', nameEn: 'Morning Sanctuary', icon: Sparkles, color: '#fbbf24' },
];

export const AmbientFocusAudio: React.FC<AmbientFocusAudioProps> = ({ lang }) => {
  const isRtl = lang === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSound, setActiveSound] = useState<SoundType>('rain');
  const [volume, setVolume] = useState(0.5);
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioNode | null>(null);
  const timerTimeoutRef = useRef<any>(null);

  // Initialize Web Audio Noise Generator
  const startSynth = (type: SoundType) => {
    stopSynth();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Pink / Brown / White noise synthesis depending on nature sound
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'rain') {
          // Pink noise for rain
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        } else if (type === 'waves' || type === 'breeze') {
          // Brown noise
          b0 = (b0 + (0.02 * white)) / 1.02;
          output[i] = b0 * 3.5;
        } else {
          // Soft ambient chirp
          output[i] = white * 0.05 * Math.sin(i / 100);
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter for realism
      const filter = ctx.createBiquadFilter();
      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
      } else if (type === 'breeze') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, ctx.currentTime);
      } else if (type === 'waves') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(280, ctx.currentTime);
      } else {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, ctx.currentTime);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);
      gainNodeRef.current = gain;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(0);
      noiseSourceRef.current = whiteNoise;
      setIsPlaying(true);
    } catch (e) {
      console.error('Ambient audio error', e);
    }
  };

  const stopSynth = () => {
    if (noiseSourceRef.current) {
      try {
        (noiseSourceRef.current as any).stop?.();
        noiseSourceRef.current.disconnect?.();
      } catch (e) {}
      noiseSourceRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume * 0.25, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSynth();
      if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
    };
  }, []);

  const handleToggle = () => {
    if (isPlaying) {
      stopSynth();
    } else {
      startSynth(activeSound);
    }
  };

  const handleSelectSound = (sound: SoundType) => {
    setActiveSound(sound);
    if (isPlaying) {
      startSynth(sound);
    }
  };

  const handleSetTimer = (minutes: number | null) => {
    setTimerMinutes(minutes);
    if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
    if (minutes) {
      timerTimeoutRef.current = setTimeout(() => {
        stopSynth();
        setTimerMinutes(null);
      }, minutes * 60 * 1000);
    }
  };

  return (
    <>
      {/* Floating Mini Ambient Trigger Button */}
      <div className="fixed bottom-24 sm:bottom-20 right-4 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl shadow-xl backdrop-blur-md border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            isPlaying
              ? 'bg-[var(--gold)] text-black border-[var(--gold2)] shadow-[var(--gold)]/20 animate-pulse'
              : 'bg-[var(--bg2)]/90 border-[var(--border2)] text-[var(--gold2)] hover:border-[var(--gold)]'
          }`}
          title={isRtl ? 'أصوات السكينة والتركيز' : 'Ambient Nature Sounds'}
        >
          {isPlaying ? <Volume2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-[var(--gold)]" />}
          <span className="text-xs font-bold hidden sm:inline">
            {isPlaying ? (isRtl ? 'السكينة تعمل' : 'Ambient Playing') : (isRtl ? 'أصوات السكينة' : 'Focus Audio')}
          </span>
        </button>
      </div>

      {/* Ambient Sound Control Drawer / Modal */}
      {isOpen && (
        <div 
          className="fixed bottom-36 sm:bottom-32 right-4 sm:right-6 z-50 w-80 bg-[var(--bg)]/95 backdrop-blur-xl border border-[var(--border2)] rounded-3xl p-5 shadow-2xl space-y-4 animate-fadeIn text-[var(--text)]"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border2)] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--gold)]/15 border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[var(--gold2)]">
                  {isRtl ? 'أصوات السكينة والتدبر' : 'Quran Focus Soundscapes'}
                </h4>
                <p className="text-[0.65rem] text-[var(--text2)]">
                  {isRtl ? 'أصوات طبيعية هادئة للتركيز أثناء القراءة' : 'Peaceful ambient sounds for deep reading'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--bg2)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sound Choices */}
          <div className="grid grid-cols-2 gap-2">
            {SOUND_OPTIONS.map((opt) => {
              const IconComp = opt.icon;
              const isSelected = activeSound === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectSound(opt.id)}
                  className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--gold)]/15 border-[var(--gold)] text-[var(--gold2)] shadow-sm'
                      : 'bg-[var(--bg2)] border-[var(--border2)] text-[var(--text2)] hover:border-[var(--gold)]/40'
                  }`}
                >
                  <IconComp className="w-4 h-4" style={{ color: opt.color }} />
                  <span className="text-[0.7rem] font-bold">{isRtl ? opt.nameAr : opt.nameEn}</span>
                </button>
              );
            })}
          </div>

          {/* Volume Slider & Play/Pause */}
          <div className="space-y-2 pt-2 border-t border-[var(--border2)]/50">
            <div className="flex items-center justify-between text-xs text-[var(--text2)]">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isRtl ? 'مستوى الصوت:' : 'Volume:'}</span>
              </span>
              <span className="font-bold text-[var(--gold)]">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-[var(--gold)] cursor-pointer"
            />
          </div>

          {/* Auto-off Sleep Timer */}
          <div className="flex items-center justify-between gap-1 pt-2 border-t border-[var(--border2)]/50 text-[0.68rem]">
            <span className="text-[var(--text3)] flex items-center gap-1">
              <Timer className="w-3 h-3" />
              <span>{isRtl ? 'مؤقت إيقاف:' : 'Timer:'}</span>
            </span>
            <div className="flex items-center gap-1">
              {[15, 30, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => handleSetTimer(timerMinutes === m ? null : m)}
                  className={`px-2 py-0.5 rounded-lg border text-[0.65rem] font-bold transition-all cursor-pointer ${
                    timerMinutes === m
                      ? 'bg-[var(--gold)] text-black border-[var(--gold)]'
                      : 'bg-[var(--bg2)] text-[var(--text2)] border-[var(--border2)] hover:border-[var(--gold)]/40'
                  }`}
                >
                  {m}د
                </button>
              ))}
            </div>
          </div>

          {/* Main Play / Pause Button */}
          <button
            onClick={handleToggle}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              isPlaying
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black hover:brightness-110'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>{isRtl ? 'إيقاف أصوات السكينة' : 'Pause Ambient Sound'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black" />
                <span>{isRtl ? 'تشغيل أصوات السكينة' : 'Play Ambient Sound'}</span>
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
};
