export type Section = 'prayer' | 'quran' | 'azkar' | 'tasbih' | 'asma' | 'support';

export interface SurahMeta {
  n: number;
  ar: string;
  en: string;
  ur?: string;
  bn?: string;
  tr?: string;
  fr?: string;
  id?: string;
  de?: string;
  ru?: string;
  es?: string;
  fa?: string;
  hi?: string;
  ms?: string;
  zh?: string;
  a: number;
  t: 'مكية' | 'مدنية' | 'm' | 'med';
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil?: number;
  page?: number;
  ruku?: number;
  hizbQuarter?: number;
  sajda?: boolean;
}

export type AyahData = Ayah;

export interface Reciter {
  id: number;
  name: string;
  server: string;
  moshaf?: string;
  readId?: number;
}

export interface AyahTiming {
  ayah: number;
  start_time: number;
  end_time?: number;
}

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface PrayerApiResponse {
  timings: PrayerTimings;
  date: {
    readable: string;
    hijri: {
      date: string;
      day: string;
      weekday: { ar: string; en: string };
      month: { ar: string; en: string; number: number };
      year: string;
    };
  };
  isOfflineCalculated?: boolean;
}

export interface DhikrItem {
  z: string;
  r: number;
  b: string;
}

export interface TasbihItem {
  text: string;
  n: number;
}

export interface AsmaItem {
  n: number;
  ar: string;
  en: string;
  ur: string;
  bn: string;
  tr: string;
  meaning: Record<string, string>;
}

export interface AppTheme {
  id: string;
  nameAr: string;
  nameEn: string;
  colors: [string, string, string, string];
  vars: Record<string, string>;
}

export interface CountryItem {
  code: string;
  flag: string;
  name: string;
}

export interface RepeatSession {
  mode: 'ayah' | 'surah';
  sn?: number;
  from?: number;
  to?: number;
  s1?: number;
  s2?: number;
  times: number;
  rec: Reciter;
  rep: number;
  stopped: boolean;
}

export interface SearchMatch {
  surah: number;
  numberInSurah: number;
  text: string;
}

export interface MemMistake {
  n: number;
  text: string;
}

export interface MemResult {
  n: number;
  correct: boolean;
}

export interface TafsirState {
  isOpen: boolean;
  surahNumber: number;
  ayahNumber: number;
  ayahArabicText: string;
  tafsirText: string;
  sourceSlug: string;
  editionIdentifier?: string;
  isLoading: boolean;
}

export type DesignStyleId =
  | 'modern'
  | 'top_navbar'
  | 'drawer_menu'
  | 'sidebar_dashboard'
  | 'mushaf_classic';

export interface KhatmahPlan {
  id: string;
  name: string;
  targetDays: number;
  startDate: string; // ISO string
  completedAyahs: number; // cumulative or current Surah/Ayah progress
  currentSurah: number;
  currentAyah: number;
  dailyGoalPages: number;
  lastReadDate: string;
  completedDates: string[]; // ['2026-09-01', ...]
  isFinished: boolean;
}

export interface AyahCardData {
  surahNumber: number;
  surahNameAr: string;
  ayahNumber: number;
  ayahText: string;
  translationText?: string;
  tafsirText?: string;
}

export type QuranFontId =
  | 'amiri_quran'
  | 'scheherazade'
  | 'noto_naskh'
  | 'reem_kufi'
  | 'amiri';

export interface QuranFontConfig {
  id: QuranFontId;
  nameAr: string;
  nameEn: string;
  fontFamily: string;
  descAr: string;
}

export interface DesignStyleConfig {
  id: DesignStyleId;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  badgeAr: string;
  badgeEn: string;
  icon: string;
}

export interface TafsirEdition {
  id: string;
  name: string;
  author: string;
  language: string;
  isTafsir: boolean;
  direction?: 'rtl' | 'ltr';
}

export interface DownloadProgress {
  current: number;
  total: number;
  currentSurahName: string;
  isDownloading: boolean;
  isCompleted: boolean;
  error?: string | null;
}
