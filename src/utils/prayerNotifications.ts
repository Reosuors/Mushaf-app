import { PrayerTimings } from '../types';
import { AdhanSoundType, playAdhanSound } from './adhanAudio';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface AdhanSettings {
  enabled: boolean;
  soundType: AdhanSoundType;
  volume: number; // 0 to 1
  prayers: {
    Fajr: boolean;
    Sunrise: boolean;
    Dhuhr: boolean;
    Asr: boolean;
    Maghrib: boolean;
    Isha: boolean;
  };
}

export const DEFAULT_ADHAN_SETTINGS: AdhanSettings = {
  enabled: true,
  soundType: 'takbeer',
  volume: 0.9,
  prayers: {
    Fajr: true,
    Sunrise: false,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  },
};

const STORAGE_KEY = 'mushaf_adhan_settings';
const LAST_NOTIFIED_KEY = 'mushaf_last_notified_prayer';

export function loadAdhanSettings(): AdhanSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_ADHAN_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to load adhan settings:', e);
  }
  return DEFAULT_ADHAN_SETTINGS;
}

export function saveAdhanSettings(settings: AdhanSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('adhan_settings_updated', { detail: settings }));
  } catch (e) {
    console.warn('Failed to save adhan settings:', e);
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  return await Notification.requestPermission();
}

export function getNotificationPermissionStatus(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

export interface AdhanEventDetail {
  prayerKey: string;
  prayerNameAr: string;
  prayerNameEn: string;
  cityName: string;
  timeStr: string;
  soundType: AdhanSoundType;
}

const PRAYER_NAMES_AR: Record<string, string> = {
  Fajr: 'صلاة الفجر',
  Sunrise: 'شروق الشمس',
  Dhuhr: 'صلاة الظهر',
  Asr: 'صلاة العصر',
  Maghrib: 'صلاة المغرب',
  Isha: 'صلاة العشاء',
};

const PRAYER_NAMES_EN: Record<string, string> = {
  Fajr: 'Fajr Prayer',
  Sunrise: 'Sunrise',
  Dhuhr: 'Dhuhr Prayer',
  Asr: 'Asr Prayer',
  Maghrib: 'Maghrib Prayer',
  Isha: 'Isha Prayer',
};

/**
 * Checks if the current local time matches any prayer time and triggers adhan + notification
 */
export function checkPrayerTimesForAdhan(
  timings: PrayerTimings | undefined,
  cityName: string = 'Mecca',
  lang: string = 'ar'
): void {
  if (!timings) return;
  const settings = loadAdhanSettings();
  if (!settings.enabled) return;

  const now = new Date();
  const curHour = String(now.getHours()).padStart(2, '0');
  const curMin = String(now.getMinutes()).padStart(2, '0');
  const curTimeStr = `${curHour}:${curMin}`;

  const todayDateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

  const prayerKeys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

  for (const pKey of prayerKeys) {
    // Check if this prayer is enabled
    if (!settings.prayers[pKey]) continue;

    const prayerTime = timings[pKey];
    if (!prayerTime) continue;

    // Normalizing "HH:mm" (some APIs return "HH:mm (EST)")
    const cleanPrayerTime = prayerTime.trim().slice(0, 5);

    if (cleanPrayerTime === curTimeStr) {
      // Check if already notified for this prayer today
      const lastNotified = localStorage.getItem(LAST_NOTIFIED_KEY);
      const notifyToken = `${todayDateKey}_${pKey}_${cleanPrayerTime}`;

      if (lastNotified === notifyToken) {
        continue; // Already triggered
      }

      // Mark as notified
      localStorage.setItem(LAST_NOTIFIED_KEY, notifyToken);

      const nameAr = PRAYER_NAMES_AR[pKey] || pKey;
      const nameEn = PRAYER_NAMES_EN[pKey] || pKey;
      const isArabic = lang === 'ar' || lang === 'ur' || lang === 'fa';

      const title = isArabic
        ? `🕌 حان الآن موعد ${nameAr}`
        : `🕌 Time for ${nameEn}`;

      const body = isArabic
        ? `حان وقت ${nameAr} في ${cityName} (${cleanPrayerTime}). حي على الصلاة، حي على الفلاح.`
        : `It is now time for ${nameEn} in ${cityName} (${cleanPrayerTime}).`;

      // 1. Send a native Android notification in APK, or a browser notification on web.
      if (Capacitor.isNativePlatform()) {
        void LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Date.now() / 1000),
              title,
              body,
              schedule: { at: new Date(Date.now() + 1000) },
              extra: { prayerKey: pKey },
            },
          ],
        }).catch((e) => console.warn('Native notification send failed:', e));
      } else if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: '/icon.png',
            tag: `adhan-${pKey}`,
            silent: settings.soundType !== 'silent',
          });
        } catch (e) {
          console.warn('Notification send failed:', e);
        }
      }

      // 2. Play the selected Adhan sound (Takbeer, Full Makkah, Madinah, etc.)
      playAdhanSound(settings.soundType, settings.volume);

      // 3. Emit Adhan trigger event for active UI banner with duaa
      const detail: AdhanEventDetail = {
        prayerKey: pKey,
        prayerNameAr: nameAr,
        prayerNameEn: nameEn,
        cityName,
        timeStr: cleanPrayerTime,
        soundType: settings.soundType,
      };

      window.dispatchEvent(new CustomEvent('adhan_triggered', { detail }));
    }
  }
}
