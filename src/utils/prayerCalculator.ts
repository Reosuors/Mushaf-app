import { PrayerApiResponse, PrayerTimings } from '../types';

// Preset coordinates for cities for 100% offline precision
export const CITY_COORDINATES: Record<string, { lat: number; lng: number; tz: number }> = {
  // Saudi Arabia
  'Mecca': { lat: 21.4225, lng: 39.8262, tz: 3 },
  'Medina': { lat: 24.4672, lng: 39.6111, tz: 3 },
  'Riyadh': { lat: 24.7136, lng: 46.6753, tz: 3 },
  'Jeddah': { lat: 21.5433, lng: 39.1728, tz: 3 },
  'Dammam': { lat: 26.4207, lng: 50.0888, tz: 3 },
  'Taif': { lat: 21.2854, lng: 40.4244, tz: 3 },
  'Tabuk': { lat: 28.3835, lng: 36.5662, tz: 3 },
  'Abha': { lat: 18.2164, lng: 42.5053, tz: 3 },
  'Al Qassim': { lat: 26.3489, lng: 43.9749, tz: 3 },
  'Yanbu': { lat: 24.0895, lng: 38.0618, tz: 3 },

  // UAE
  'Abu Dhabi': { lat: 24.4539, lng: 54.3773, tz: 4 },
  'Dubai': { lat: 25.2048, lng: 55.2708, tz: 4 },
  'Sharjah': { lat: 25.3463, lng: 55.4209, tz: 4 },
  'Ajman': { lat: 25.4052, lng: 55.5136, tz: 4 },

  // Egypt
  'Cairo': { lat: 30.0444, lng: 31.2357, tz: 2 },
  'Alexandria': { lat: 31.2001, lng: 29.9187, tz: 2 },
  'Giza': { lat: 30.0131, lng: 31.2089, tz: 2 },
  'Luxor': { lat: 25.6872, lng: 32.6396, tz: 2 },
  'Aswan': { lat: 24.0889, lng: 32.8998, tz: 2 },
  'Port Said': { lat: 31.2653, lng: 32.3019, tz: 2 },
  'Mansoura': { lat: 31.0409, lng: 31.3785, tz: 2 },

  // Levant & Arab World
  'Amman': { lat: 31.9454, lng: 35.9284, tz: 3 },
  'Jerusalem': { lat: 31.7683, lng: 35.2137, tz: 3 },
  'Gaza': { lat: 31.5017, lng: 34.4668, tz: 3 },
  'Ramallah': { lat: 31.9038, lng: 35.2034, tz: 3 },
  'Beirut': { lat: 33.8938, lng: 35.5018, tz: 3 },
  'Damascus': { lat: 33.5138, lng: 36.2765, tz: 3 },
  'Aleppo': { lat: 36.2021, lng: 37.1343, tz: 3 },
  'Baghdad': { lat: 33.3152, lng: 44.3661, tz: 3 },
  'Basra': { lat: 30.5081, lng: 47.7835, tz: 3 },
  'Mosul': { lat: 36.3400, lng: 43.1300, tz: 3 },
  'Erbil': { lat: 36.1911, lng: 44.0092, tz: 3 },
  'Kuwait City': { lat: 29.3759, lng: 47.9774, tz: 3 },
  'Manama': { lat: 26.2285, lng: 50.5860, tz: 3 },
  'Doha': { lat: 25.2854, lng: 51.5310, tz: 3 },
  'Muscat': { lat: 23.5880, lng: 58.3829, tz: 4 },
  'Sanaa': { lat: 15.3694, lng: 44.1910, tz: 3 },
  'Aden': { lat: 12.7855, lng: 45.0187, tz: 3 },
  'Tripoli': { lat: 32.8872, lng: 13.1913, tz: 2 },
  'Tunis': { lat: 36.8065, lng: 10.1815, tz: 1 },
  'Algiers': { lat: 36.7538, lng: 3.0588, tz: 1 },
  'Casablanca': { lat: 33.5731, lng: -7.5898, tz: 1 },
  'Rabat': { lat: 34.0209, lng: -6.8416, tz: 1 },
  'Marrakech': { lat: 31.6295, lng: -7.9811, tz: 1 },
  'Khartoum': { lat: 15.5007, lng: 32.5599, tz: 2 },
  'Mogadishu': { lat: 2.0469, lng: 45.3182, tz: 3 },
  'Nouakchott': { lat: 18.0735, lng: -15.9582, tz: 0 },

  // Asia & Turkey
  'Istanbul': { lat: 41.0082, lng: 28.9784, tz: 3 },
  'Ankara': { lat: 39.9334, lng: 32.8597, tz: 3 },
  'Izmir': { lat: 38.4237, lng: 27.1428, tz: 3 },
  'Bursa': { lat: 40.1885, lng: 29.0610, tz: 3 },
  'Tehran': { lat: 35.6892, lng: 51.3890, tz: 3.5 },
  'Mashhad': { lat: 36.2972, lng: 59.6067, tz: 3.5 },
  'Karachi': { lat: 24.8607, lng: 67.0011, tz: 5 },
  'Lahore': { lat: 31.5204, lng: 74.3587, tz: 5 },
  'Islamabad': { lat: 33.6844, lng: 73.0479, tz: 5 },
  'Dhaka': { lat: 23.8103, lng: 90.4125, tz: 6 },
  'Chittagong': { lat: 22.3569, lng: 91.7832, tz: 6 },
  'Jakarta': { lat: -6.2088, lng: 106.8456, tz: 7 },
  'Surabaya': { lat: -7.2575, lng: 112.7521, tz: 7 },
  'Bandung': { lat: -6.9175, lng: 107.6191, tz: 7 },
  'Kuala Lumpur': { lat: 3.1390, lng: 101.6869, tz: 8 },
  'Singapore': { lat: 1.3521, lng: 103.8198, tz: 8 },
  'Kabul': { lat: 34.5553, lng: 69.2075, tz: 4.5 },
  'Tashkent': { lat: 41.2995, lng: 69.2401, tz: 5 },
  'Astana': { lat: 51.1694, lng: 71.4491, tz: 5 },
  'Baku': { lat: 40.4093, lng: 49.8671, tz: 4 },
  'New Delhi': { lat: 28.6139, lng: 77.2090, tz: 5.5 },
  'Mumbai': { lat: 19.0760, lng: 72.8777, tz: 5.5 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867, tz: 5.5 },

  // Europe & Americas & Worldwide
  'London': { lat: 51.5074, lng: -0.1278, tz: 0 },
  'Birmingham': { lat: 52.4862, lng: -1.8904, tz: 0 },
  'Manchester': { lat: 53.4808, lng: -2.2426, tz: 0 },
  'Paris': { lat: 48.8566, lng: 2.3522, tz: 1 },
  'Marseille': { lat: 43.2965, lng: 5.3698, tz: 1 },
  'Lyon': { lat: 45.7640, lng: 4.8357, tz: 1 },
  'Berlin': { lat: 52.5200, lng: 13.4050, tz: 1 },
  'Frankfurt': { lat: 50.1109, lng: 8.6821, tz: 1 },
  'Munich': { lat: 48.1351, lng: 11.5820, tz: 1 },
  'Madrid': { lat: 40.4168, lng: -3.7038, tz: 1 },
  'Rome': { lat: 41.9028, lng: 12.4964, tz: 1 },
  'Amsterdam': { lat: 52.3676, lng: 4.9041, tz: 1 },
  'Brussels': { lat: 50.8503, lng: 4.3517, tz: 1 },
  'Stockholm': { lat: 59.3293, lng: 18.0686, tz: 1 },
  'Oslo': { lat: 59.9139, lng: 10.7522, tz: 1 },
  'Moscow': { lat: 55.7558, lng: 37.6173, tz: 3 },
  'Kazan': { lat: 55.8304, lng: 49.0661, tz: 3 },
  'Grozny': { lat: 43.3183, lng: 45.6982, tz: 3 },
  'New York': { lat: 40.7128, lng: -74.0060, tz: -5 },
  'Chicago': { lat: 41.8781, lng: -87.6298, tz: -6 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437, tz: -8 },
  'Houston': { lat: 29.7604, lng: -95.3698, tz: -6 },
  'Detroit': { lat: 42.3314, lng: -83.0458, tz: -5 },
  'Toronto': { lat: 43.6532, lng: -79.3832, tz: -5 },
  'Sydney': { lat: -33.8688, lng: 151.2093, tz: 10 },
  'Melbourne': { lat: -37.8136, lng: 144.9631, tz: 10 },
  'Tokyo': { lat: 35.6762, lng: 139.6503, tz: 9 },
  'Beijing': { lat: 39.9042, lng: 116.4074, tz: 8 },
  'Johannesburg': { lat: -26.2041, lng: 28.0473, tz: 2 },
  'Cape Town': { lat: -33.9249, lng: 18.4241, tz: 2 },
  'Dakar': { lat: 14.7167, lng: -17.4677, tz: 0 },
  'Lagos': { lat: 6.5244, lng: 3.3792, tz: 1 },
};

// Calculation method parameters
interface MethodParams {
  fajrAngle: number;
  ishaAngle?: number;
  ishaMinutes?: number;
  maghribAngle?: number;
  maghribMinutes?: number;
}

const METHODS: Record<number, MethodParams> = {
  1: { fajrAngle: 18.0, ishaAngle: 18.0 }, // Karachi
  2: { fajrAngle: 15.0, ishaAngle: 15.0 }, // ISNA
  3: { fajrAngle: 18.0, ishaAngle: 17.0 }, // MWL
  4: { fajrAngle: 18.5, ishaMinutes: 90 }, // Umm Al-Qura
  5: { fajrAngle: 19.5, ishaAngle: 17.5 }, // Egyptian Survey
  7: { fajrAngle: 17.7, ishaAngle: 14.0, maghribAngle: 4.5 }, // Tehran
  11: { fajrAngle: 20.0, ishaAngle: 18.0 }, // Singapore
  12: { fajrAngle: 12.0, ishaAngle: 12.0 }, // France
  13: { fajrAngle: 18.0, ishaAngle: 17.0 }, // Turkey Diyanet
  14: { fajrAngle: 16.0, ishaAngle: 15.0 }, // Russia
};

// Math helpers
const d2r = (d: number) => (d * Math.PI) / 180.0;
const r2d = (r: number) => (r * 180.0) / Math.PI;

function sinD(d: number) { return Math.sin(d2r(d)); }
function cosD(d: number) { return Math.cos(d2r(d)); }
function tanD(d: number) { return Math.tan(d2r(d)); }
function arccosD(x: number) { return r2d(Math.acos(Math.max(-1, Math.min(1, x)))); }
function fixHour(h: number) { return ((h % 24) + 24) % 24; }

function formatHourMin(decHour: number): string {
  const h = Math.floor(fixHour(decHour));
  const m = Math.floor((decHour - Math.floor(decHour)) * 60 + 0.5);
  const finalH = (h + Math.floor(m / 60)) % 24;
  const finalM = m % 60;
  return `${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`;
}

/**
 * Astronomical equation to calculate offline prayer timings
 */
export function calculateOfflinePrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  tzOffsetHours?: number,
  methodId: number = 4
): PrayerApiResponse {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Julian Date calculation
  let Y = year;
  let M = month;
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + day + B - 1524.5;

  const d = JD - 2451545.0;
  const g = ((357.529 + 0.98560028 * d) % 360 + 360) % 360;
  const q = ((280.459 + 0.98564736 * d) % 360 + 360) % 360;
  const L = ((q + 1.915 * sinD(g) + 0.020 * sinD(2 * g)) % 360 + 360) % 360;
  const e = 23.439 - 0.00000036 * d;
  const RA = (r2d(Math.atan2(cosD(e) * sinD(L), cosD(L))) / 15.0 + 24) % 24;
  const declination = r2d(Math.asin(sinD(e) * sinD(L)));
  const EqT = q / 15.0 - RA;

  const tz = tzOffsetHours !== undefined ? tzOffsetHours : -date.getTimezoneOffset() / 60;
  const noon = 12 + tz - lng / 15.0 - EqT;

  const method = METHODS[methodId] || METHODS[4];

  // Helper for sun angle
  const hourAngle = (angle: number) => {
    const cosHA = (sinD(angle) - sinD(lat) * sinD(declination)) / (cosD(lat) * cosD(declination));
    if (cosHA < -1 || cosHA > 1) return 0;
    return arccosD(cosHA) / 15.0;
  };

  // Sun position angles
  const fajrHA = hourAngle(-method.fajrAngle);
  const sunriseHA = hourAngle(-0.833);
  
  // Asr (Shafi/Standard shadow factor = 1)
  const asrAlt = -r2d(Math.atan(1 + tanD(Math.abs(lat - declination))));
  const asrHA = hourAngle(asrAlt);

  const maghribHA = hourAngle(-0.833);

  const fajrTime = noon - fajrHA;
  const sunriseTime = noon - sunriseHA;
  const dhuhrTime = noon + 4 / 60; // 4 minutes added for zawaal safety
  const asrTime = noon + asrHA;
  const maghribTime = noon + maghribHA;

  let ishaTime: number;
  if (method.ishaMinutes) {
    ishaTime = maghribTime + method.ishaMinutes / 60;
  } else if (method.ishaAngle) {
    ishaTime = noon + hourAngle(-method.ishaAngle);
  } else {
    ishaTime = maghribTime + 1.5;
  }

  const timings: PrayerTimings = {
    Fajr: formatHourMin(fajrTime),
    Sunrise: formatHourMin(sunriseTime),
    Dhuhr: formatHourMin(dhuhrTime),
    Asr: formatHourMin(asrTime),
    Maghrib: formatHourMin(maghribTime),
    Isha: formatHourMin(ishaTime),
  };

  // Approximate Hijri Calculation (Umm Al-Qura / Kuwaiti algorithm approximation)
  const hijriMonthsAr = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];
  const hijriMonthsEn = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', 'Shaban',
    'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'
  ];

  const jdDay = JD - 1948440 + 10632;
  const n = Math.floor((jdDay - 1) / 10631);
  const jDay2 = jdDay - 10631 * n + 354;
  const jYear = Math.floor((10985 - jDay2) / 5316) * Math.floor((50 * jDay2) / 17719) + Math.floor(jDay2 / 5670) * Math.floor((43 * jDay2) / 15238);
  const jDay3 = jDay2 - Math.floor((30 - jYear) / 15) * Math.floor((17719 * jYear) / 50) - Math.floor(jYear / 16) * Math.floor((15238 * jYear) / 43) + 29;
  const hMonth = Math.floor((24 * jDay3) / 709);
  const hDay = jDay3 - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + jYear - 30;

  const validMonth = Math.max(1, Math.min(12, hMonth));
  const monthNameAr = hijriMonthsAr[validMonth - 1] || 'محرم';
  const monthNameEn = hijriMonthsEn[validMonth - 1] || 'Muharram';

  const weekdaysAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const weekdaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = date.getDay();

  return {
    timings,
    date: {
      readable: `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`,
      hijri: {
        date: `${hDay}-${validMonth}-${hYear}`,
        day: String(hDay),
        weekday: { ar: weekdaysAr[dayOfWeek], en: weekdaysEn[dayOfWeek] },
        month: { ar: monthNameAr, en: monthNameEn, number: validMonth },
        year: String(hYear),
      },
    },
    isOfflineCalculated: true,
  };
}
