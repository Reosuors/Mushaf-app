// Adhan sound manager and Web Audio synthesizer

export type AdhanSoundType = 'takbeer' | 'makkah' | 'madinah' | 'alaqsa' | 'egypt' | 'chime' | 'silent';

export interface AdhanSoundOption {
  id: AdhanSoundType;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  durationApprox: string;
  url?: string;
}

export const ADHAN_SOUND_OPTIONS: AdhanSoundOption[] = [
  {
    id: 'takbeer',
    nameAr: 'تكبيرات الأذان (الله أكبر الله أكبر)',
    nameEn: 'Adhan Takbeerat (Allahu Akbar Allahu Akbar)',
    descriptionAr: 'بداية الأذان بالتكبير مرتين بصوت ندي خاشع',
    descriptionEn: 'The beginning of the call to prayer (Takbeer)',
    durationApprox: '~15s',
    url: 'https://cdn.islamic.network/audio/adhan/takbeer.mp3',
  },
  {
    id: 'makkah',
    nameAr: 'أذان المسجد الحرام (مكة المكرمة)',
    nameEn: 'Makkah Al-Mukarramah Adhan (Full)',
    descriptionAr: 'الأذان المكي الشريف الخاشع كاملاً من الحرم المكي',
    descriptionEn: 'Full beautiful Adhan from the Grand Mosque of Makkah',
    durationApprox: '~3min',
    url: 'https://media.sd.ma/assabile/adhan_3748/001.mp3',
  },
  {
    id: 'madinah',
    nameAr: 'أذان المسجد النبوي الشريف (المدينة)',
    nameEn: 'Madinah Al-Munawwarah Adhan',
    descriptionAr: 'أذان المسجد النبوي الشريف العذب',
    descriptionEn: 'Harmonious Adhan from the Prophet\'s Mosque',
    durationApprox: '~3min',
    url: 'https://media.sd.ma/assabile/adhan_3748/002.mp3',
  },
  {
    id: 'alaqsa',
    nameAr: 'أذان المسجد الأقصى المبارك',
    nameEn: 'Al-Aqsa Mosque Adhan',
    descriptionAr: 'أذان المسجد الأقصى المبارك والقدس الشريف',
    descriptionEn: 'Historic Adhan from Al-Aqsa Mosque in Jerusalem',
    durationApprox: '~3min',
    url: 'https://media.sd.ma/assabile/adhan_3748/003.mp3',
  },
  {
    id: 'egypt',
    nameAr: 'أذان القاهرة - الشيخ عبد الباسط',
    nameEn: 'Egyptian Adhan - Sheikh Abdulbasit',
    descriptionAr: 'الأذان المصري الكلاسيكي العريق',
    descriptionEn: 'Classic Egyptian Adhan by Sheikh Abdulbasit Abdulsamad',
    durationApprox: '~3min',
    url: 'https://media.sd.ma/assabile/adhan_3748/004.mp3',
  },
  {
    id: 'chime',
    nameAr: 'نغمة إسلامية هادئة',
    nameEn: 'Peaceful Islamic Chime',
    descriptionAr: 'نغمة تنبيه لطيفة ومناسبة للأماكن الهادئة',
    descriptionEn: 'A gentle chime suitable for quiet environments',
    durationApprox: '~5s',
  },
  {
    id: 'silent',
    nameAr: 'إشعار صامت (بدون صوت)',
    nameEn: 'Silent Notification',
    descriptionAr: 'إشعار مرئي فقط على الشاشة بدون تشغيل صوت',
    descriptionEn: 'Visual notification only with no audio playback',
    durationApprox: '0s',
  },
];

let globalAudio: HTMLAudioElement | null = null;
let audioCtx: AudioContext | null = null;

// Synthetic Melodic Takbeer / Chime using Web Audio API for guaranteed offline playback
export function playSyntheticTakbeer(volume: number = 0.8): void {
  try {
    const CtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!CtxClass) return;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new CtxClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const ctx = audioCtx;
    const now = ctx.currentTime;

    // Islamic Adhan Takbeer melodic note sequence:
    // "Al-la-hu Akbar" phrase (Bb3 -> D4 -> F4 -> Eb4 -> D4 -> C4 -> D4)
    const notes: { freq: number; start: number; duration: number; type: OscillatorType }[] = [
      // Al-la-hu (First phrase)
      { freq: 233.08, start: 0.0, duration: 0.6, type: 'sine' },  // Bb3
      { freq: 293.66, start: 0.6, duration: 0.8, type: 'sine' },  // D4
      { freq: 349.23, start: 1.4, duration: 1.2, type: 'sine' },  // F4 (Ak-)
      { freq: 311.13, start: 2.6, duration: 0.8, type: 'sine' },  // Eb4 (-bar)
      { freq: 293.66, start: 3.4, duration: 1.5, type: 'sine' },  // D4

      // Silence pause
      // Al-la-hu Akbar (Second phrase)
      { freq: 233.08, start: 5.2, duration: 0.6, type: 'sine' },  // Bb3
      { freq: 293.66, start: 5.8, duration: 0.8, type: 'sine' },  // D4
      { freq: 349.23, start: 6.6, duration: 1.4, type: 'sine' },  // F4
      { freq: 392.00, start: 8.0, duration: 1.0, type: 'sine' },  // G4
      { freq: 349.23, start: 9.0, duration: 0.8, type: 'sine' },  // F4
      { freq: 293.66, start: 9.8, duration: 2.0, type: 'sine' },  // D4
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = n.type;
      osc.frequency.setValueAtTime(n.freq, now + n.start);

      // Warm resonance harmonics
      gain.gain.setValueAtTime(0, now + n.start);
      gain.gain.linearRampToValueAtTime(volume * 0.4, now + n.start + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.start);
      osc.stop(now + n.start + n.duration);
    });
  } catch (e) {
    console.warn('Web Audio synthesis failed:', e);
  }
}

export function playSyntheticChime(volume: number = 0.8): void {
  try {
    const CtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!CtxClass) return;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new CtxClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const ctx = audioCtx;
    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chime chord

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.25);

      gain.gain.setValueAtTime(0, now + idx * 0.25);
      gain.gain.linearRampToValueAtTime(volume * 0.35, now + idx * 0.25 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.25 + 2.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.25);
      osc.stop(now + idx * 0.25 + 2.0);
    });
  } catch (e) {
    console.warn('Synthetic chime error:', e);
  }
}

export function stopAdhanAudio(): void {
  if (globalAudio) {
    globalAudio.pause();
    globalAudio.currentTime = 0;
    globalAudio = null;
  }
  if (audioCtx && audioCtx.state === 'running') {
    try {
      audioCtx.suspend();
    } catch {}
  }
}

export async function playAdhanSound(
  type: AdhanSoundType = 'takbeer',
  volume: number = 1.0,
  onEnd?: () => void
): Promise<void> {
  stopAdhanAudio();

  if (type === 'silent') {
    if (onEnd) onEnd();
    return;
  }

  if (type === 'chime') {
    playSyntheticChime(volume);
    if (onEnd) setTimeout(onEnd, 3000);
    return;
  }

  const option = ADHAN_SOUND_OPTIONS.find((o) => o.id === type) || ADHAN_SOUND_OPTIONS[0];

  if (option.url) {
    try {
      const audio = new Audio(option.url);
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.crossOrigin = 'anonymous';
      globalAudio = audio;

      audio.onended = () => {
        globalAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        // Fallback to synthetic Takbeer if network fails
        console.warn('Adhan stream failed, playing synthetic fallback...');
        playSyntheticTakbeer(volume);
        if (onEnd) setTimeout(onEnd, 12000);
      };

      await audio.play();
    } catch (e) {
      console.warn('Audio play error, falling back to synthetic takbeer:', e);
      playSyntheticTakbeer(volume);
      if (onEnd) setTimeout(onEnd, 12000);
    }
  } else {
    playSyntheticTakbeer(volume);
    if (onEnd) setTimeout(onEnd, 12000);
  }
}
