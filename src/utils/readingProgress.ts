// Quran reading progress & Khatma tracker utilities

export interface BookmarkItem {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahNameAr: string;
  surahNameEn: string;
  textSnippet?: string;
  timestamp: number;
}

export interface LastReadPosition {
  surahNumber: number;
  ayahNumber: number;
  surahNameAr: string;
  surahNameEn: string;
  timestamp: number;
}

export interface ReadingProgressData {
  lastRead: LastReadPosition | null;
  completedSurahs: number[]; // surah numbers that are completely read
  readAyahsBySurah: Record<number, number[]>; // map of surahNumber -> array of read ayah numbers
  bookmarks: BookmarkItem[];
  dailyGoalAyahs: number;
  todayReadAyahs: number;
  lastActiveDate: string; // YYYY-MM-DD
  streakDays: number;
  khatmaCount: number;
  khatmaStartDate: string;
}

const STORAGE_KEY = 'mushaf_reading_progress_v2';
export const TOTAL_QURAN_AYAHS = 6236;
export const TOTAL_QURAN_SURAHS = 114;

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getInitialProgress(): ReadingProgressData {
  const today = getTodayString();
  return {
    lastRead: {
      surahNumber: 1,
      ayahNumber: 1,
      surahNameAr: 'الفاتحة',
      surahNameEn: 'Al-Fatiha',
      timestamp: Date.now(),
    },
    completedSurahs: [],
    readAyahsBySurah: {},
    bookmarks: [],
    dailyGoalAyahs: 20,
    todayReadAyahs: 0,
    lastActiveDate: today,
    streakDays: 1,
    khatmaCount: 0,
    khatmaStartDate: today,
  };
}

export function loadReadingProgress(): ReadingProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const init = getInitialProgress();
      saveReadingProgress(init);
      return init;
    }
    const data: ReadingProgressData = JSON.parse(raw);
    const today = getTodayString();

    // Check if new day for daily goal & streak tracking
    if (data.lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      if (data.lastActiveDate === yesterdayStr) {
        // Consecutive day
        data.streakDays = (data.streakDays || 0) + 1;
      } else {
        // Streak reset
        data.streakDays = 1;
      }
      data.todayReadAyahs = 0;
      data.lastActiveDate = today;
      saveReadingProgress(data);
    }

    return data;
  } catch (e) {
    console.error('Error loading reading progress:', e);
    return getInitialProgress();
  }
}

export function saveReadingProgress(data: ReadingProgressData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('mushaf_reading_progress_updated', { detail: data }));
  } catch (e) {
    console.error('Error saving reading progress:', e);
  }
}

export function updateLastReadPosition(
  surahNumber: number,
  ayahNumber: number,
  surahNameAr: string,
  surahNameEn: string
): ReadingProgressData {
  const current = loadReadingProgress();
  const today = getTodayString();

  current.lastRead = {
    surahNumber,
    ayahNumber,
    surahNameAr,
    surahNameEn,
    timestamp: Date.now(),
  };

  // Add ayah to read list if not already marked
  if (!current.readAyahsBySurah[surahNumber]) {
    current.readAyahsBySurah[surahNumber] = [];
  }
  if (!current.readAyahsBySurah[surahNumber].includes(ayahNumber)) {
    current.readAyahsBySurah[surahNumber].push(ayahNumber);
    current.todayReadAyahs = (current.todayReadAyahs || 0) + 1;
  }

  current.lastActiveDate = today;
  saveReadingProgress(current);
  return current;
}

export function toggleSurahCompletion(surahNumber: number, totalAyahs: number): boolean {
  const current = loadReadingProgress();
  const isCompleted = current.completedSurahs.includes(surahNumber);

  if (isCompleted) {
    current.completedSurahs = current.completedSurahs.filter((n) => n !== surahNumber);
  } else {
    current.completedSurahs.push(surahNumber);
    // Mark all ayahs of this surah as read
    const allAyahs = Array.from({ length: totalAyahs }, (_, i) => i + 1);
    current.readAyahsBySurah[surahNumber] = allAyahs;

    // Check if entire Quran is completed!
    if (current.completedSurahs.length === TOTAL_QURAN_SURAHS) {
      current.khatmaCount = (current.khatmaCount || 0) + 1;
    }
  }

  saveReadingProgress(current);
  return !isCompleted;
}

export function toggleBookmark(
  surahNumber: number,
  ayahNumber: number,
  surahNameAr: string,
  surahNameEn: string,
  textSnippet?: string
): boolean {
  const current = loadReadingProgress();
  const existingIdx = current.bookmarks.findIndex(
    (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
  );

  let isBookmarkedNow = false;
  if (existingIdx >= 0) {
    current.bookmarks.splice(existingIdx, 1);
    isBookmarkedNow = false;
  } else {
    current.bookmarks.unshift({
      id: `bm_${surahNumber}_${ayahNumber}_${Date.now()}`,
      surahNumber,
      ayahNumber,
      surahNameAr,
      surahNameEn,
      textSnippet,
      timestamp: Date.now(),
    });
    isBookmarkedNow = true;
  }

  saveReadingProgress(current);
  return isBookmarkedNow;
}

export function isAyahBookmarked(surahNumber: number, ayahNumber: number): boolean {
  const current = loadReadingProgress();
  return current.bookmarks.some(
    (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
  );
}

export function calculateTotalReadAyahsCount(progress: ReadingProgressData): number {
  let count = 0;
  for (const surahNum in progress.readAyahsBySurah) {
    count += progress.readAyahsBySurah[surahNum]?.length || 0;
  }
  return Math.min(TOTAL_QURAN_AYAHS, count);
}

export function calculateQuranCompletionPercentage(progress: ReadingProgressData): number {
  const readCount = calculateTotalReadAyahsCount(progress);
  const pct = (readCount / TOTAL_QURAN_AYAHS) * 100;
  return Math.min(100, Math.round(pct * 10) / 10);
}
