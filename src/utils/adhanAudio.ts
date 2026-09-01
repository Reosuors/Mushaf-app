// Adhan sound manager, Web Audio synthesizer, and Local Audio Storage

export type AdhanSoundType =
  | 'takbeer'
  | 'adhan_full'
  | 'custom'
  | 'silent';

export interface AdhanSoundOption {
  id: AdhanSoundType;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  durationApprox: string;
  fileName?: string;
  badge?: string;
  urls?: string[];
}

export const ADHAN_SOUND_OPTIONS: AdhanSoundOption[] = [
  {
    id: 'takbeer',
    nameAr: 'صوت التكبيرتين (الله أكبر الله أكبر)',
    nameEn: 'Takbeerat (f3ob7631d625_[cut_4sec].mp3)',
    descriptionAr: 'صوت التكبيرتين المختصر (4 ثوانٍ) عند دخول وقت الصلاة',
    descriptionEn: 'Short 4-second Takbeerat alert for prayer time',
    durationApprox: '4s',
    fileName: 'f3ob7631d625_[cut_4sec].mp3',
    badge: '4s MP3',
    urls: [
      '/f3ob7631d625_[cut_4sec].mp3',
      'f3ob7631d625_[cut_4sec].mp3',
      'https://islamcan.com/audio/adhan/azan1.mp3',
    ],
  },
  {
    id: 'adhan_full',
    nameAr: 'الأذان الكامل (النداء كاملاً)',
    nameEn: 'Full Adhan (f3ob7631d625.mp3)',
    descriptionAr: 'الأذان كاملاً بصوت ندي خاشع لجميع فقرات الأذان',
    descriptionEn: 'Full melodic Adhan call to prayer (~2.5 min)',
    durationApprox: '~2.5m',
    fileName: 'f3ob7631d625.mp3',
    badge: 'Full MP3',
    urls: [
      '/f3ob7631d625.mp3',
      'f3ob7631d625.mp3',
      'https://islamcan.com/audio/adhan/azan1.mp3',
    ],
  },
  {
    id: 'custom',
    nameAr: 'ملف صوتي مخصص من جهازك',
    nameEn: 'Custom Audio File (Upload MP3)',
    descriptionAr: 'تشغيل ملف صوتي مخصص قمت باختياره أو رفعه',
    descriptionEn: 'Play a custom local MP3 file of your choice',
    durationApprox: 'Custom',
    badge: 'Upload',
  },
  {
    id: 'silent',
    nameAr: 'إشعار صامت (بدون صوت)',
    nameEn: 'Silent Notification',
    descriptionAr: 'إشعار مرئي فقط على الشاشة بدون تشغيل صوت',
    descriptionEn: 'Visual notification only with no audio playback',
    durationApprox: '0s',
    badge: 'Mute',
  },
];

let globalAudio: HTMLAudioElement | null = null;
let audioCtx: AudioContext | null = null;

// IndexedDB Helper for Storing Custom User Audio Files
const DB_NAME = 'mushaf_adhan_db';
const DB_VERSION = 1;
const STORE_NAME = 'custom_audio';

function openAudioDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e: any) => resolve(e.target.result);
    request.onerror = (e: any) => reject(e.target.error);
  });
}

export async function saveCustomAdhanAudio(file: File): Promise<string> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put({ data: base64, name: file.name, size: file.size, type: file.type }, 'custom_adhan');
        tx.oncomplete = () => {
          localStorage.setItem('mushaf_custom_adhan_name', file.name);
          resolve(file.name);
        };
        tx.onerror = (e: any) => reject(e.target.error);
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  } catch (err) {
    console.error('Failed to save custom adhan audio:', err);
    throw err;
  }
}

export async function getCustomAdhanAudio(): Promise<{ data: string; name: string } | null> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('custom_adhan');
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          resolve(req.result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function removeCustomAdhanAudio(): Promise<void> {
  try {
    const db = await openAudioDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete('custom_adhan');
    localStorage.removeItem('mushaf_custom_adhan_name');
  } catch (e) {
    console.warn('Failed to remove custom audio:', e);
  }
}

// Synthetic Melodic Takbeer using Web Audio API for offline fallback
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
    // "Al-la-hu Akbar" phrase (Bb3 -> D4 -> F4 -> Eb4 -> D4)
    const notes: { freq: number; start: number; duration: number; type: OscillatorType }[] = [
      { freq: 233.08, start: 0.0, duration: 0.6, type: 'sine' }, // Bb3
      { freq: 293.66, start: 0.6, duration: 0.8, type: 'sine' }, // D4
      { freq: 349.23, start: 1.4, duration: 1.2, type: 'sine' }, // F4 (Ak-)
      { freq: 311.13, start: 2.6, duration: 0.8, type: 'sine' }, // Eb4 (-bar)
      { freq: 293.66, start: 3.4, duration: 1.5, type: 'sine' }, // D4

      { freq: 233.08, start: 5.0, duration: 0.6, type: 'sine' }, // Bb3
      { freq: 293.66, start: 5.6, duration: 0.8, type: 'sine' }, // D4
      { freq: 349.23, start: 6.4, duration: 1.4, type: 'sine' }, // F4
      { freq: 392.0, start: 7.8, duration: 1.0, type: 'sine' }, // G4
      { freq: 349.23, start: 8.8, duration: 0.8, type: 'sine' }, // F4
      { freq: 293.66, start: 9.6, duration: 2.0, type: 'sine' }, // D4
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = n.type;
      osc.frequency.setValueAtTime(n.freq, now + n.start);

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

/**
 * Plays the chosen Adhan audio with robust sequential URL failover.
 */
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

  // Handle Custom Audio File from IndexedDB
  if (type === 'custom') {
    const customAudio = await getCustomAdhanAudio();
    if (customAudio && customAudio.data) {
      try {
        const audio = new Audio(customAudio.data);
        audio.volume = Math.max(0, Math.min(1, volume));
        globalAudio = audio;
        audio.onended = () => {
          globalAudio = null;
          if (onEnd) onEnd();
        };
        audio.onerror = () => {
          playSyntheticTakbeer(volume);
          if (onEnd) setTimeout(onEnd, 6000);
        };
        await audio.play();
        return;
      } catch (err) {
        console.warn('Failed playing custom audio, falling back:', err);
      }
    }
  }

  const option = ADHAN_SOUND_OPTIONS.find((o) => o.id === type) || ADHAN_SOUND_OPTIONS[0];
  const urlsToTry = option.urls && option.urls.length > 0 ? [...option.urls] : [];

  if (urlsToTry.length === 0) {
    playSyntheticTakbeer(volume);
    if (onEnd) setTimeout(onEnd, 8000);
    return;
  }

  let currentIndex = 0;

  const tryPlayNextUrl = async () => {
    if (currentIndex >= urlsToTry.length) {
      // All candidate URLs exhausted -> play synthetic takbeer
      playSyntheticTakbeer(volume);
      if (onEnd) setTimeout(onEnd, 8000);
      return;
    }

    const currentUrl = urlsToTry[currentIndex];
    currentIndex++;

    try {
      const audio = new Audio(currentUrl);
      audio.volume = Math.max(0, Math.min(1, volume));
      if (currentUrl.startsWith('http')) {
        audio.crossOrigin = 'anonymous';
      }
      globalAudio = audio;

      audio.onended = () => {
        globalAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        tryPlayNextUrl();
      };

      await audio.play();
    } catch {
      tryPlayNextUrl();
    }
  };

  await tryPlayNextUrl();
}
