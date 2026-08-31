import { AyahData, DownloadProgress } from '../types';
import { SURAHS } from '../data/surahs';

const DB_NAME = 'mushaf_offline_v2';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

export function getDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('surahs')) {
        db.createObjectStore('surahs', { keyPath: 'n' });
      }
      if (!db.objectStoreNames.contains('tafsirs')) {
        db.createObjectStore('tafsirs', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('prayer_cache')) {
        db.createObjectStore('prayer_cache', { keyPath: 'key' });
      }
    };

    req.onsuccess = () => {
      dbInstance = req.result;
      resolve(dbInstance);
    };

    req.onerror = () => {
      reject(req.error);
    };
  });
}

/**
 * Save Surah Ayahs in IndexedDB
 */
export async function saveSurahOffline(surahNumber: number, ayahs: AyahData[]): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('surahs', 'readwrite');
    const store = tx.objectStore('surahs');
    const item = {
      n: surahNumber,
      ayahs,
      savedAt: Date.now(),
      totalAyahs: ayahs.length,
    };
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get Surah Ayahs from IndexedDB
 */
export async function getSurahOffline(surahNumber: number): Promise<AyahData[] | null> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction('surahs', 'readonly');
      const store = tx.objectStore('surahs');
      const req = store.get(surahNumber);
      req.onsuccess = () => {
        if (req.result && Array.isArray(req.result.ayahs) && req.result.ayahs.length > 0) {
          resolve(req.result.ayahs);
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

/**
 * Delete a downloaded Surah from IndexedDB
 */
export async function deleteSurahOffline(surahNumber: number): Promise<void> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('surahs', 'readwrite');
      const store = tx.objectStore('surahs');
      const req = store.delete(surahNumber);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {}
}

/**
 * Get list of all downloaded Surah numbers
 */
export async function getDownloadedSurahNumbers(): Promise<number[]> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction('surahs', 'readonly');
      const store = tx.objectStore('surahs');
      const req = store.getAllKeys();
      req.onsuccess = () => {
        resolve((req.result as number[]) || []);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/**
 * Check if a specific Surah is downloaded
 */
export async function isSurahDownloaded(surahNumber: number): Promise<boolean> {
  const list = await getDownloadedSurahNumbers();
  return list.includes(surahNumber);
}

/**
 * Fetch and download a Surah from API and save to IndexedDB
 */
export async function downloadSurahFromApi(surahNumber: number): Promise<AyahData[]> {
  const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
  const data = await res.json();
  if (data.code === 200 && data.data?.ayahs) {
    const ayahs: AyahData[] = data.data.ayahs;
    await saveSurahOffline(surahNumber, ayahs);
    return ayahs;
  }
  throw new Error('Failed to download Surah verses');
}

/**
 * Download all 114 Surahs sequentially for complete offline reading
 */
export async function downloadAllSurahs(
  onProgress: (p: DownloadProgress) => void,
  cancelRef?: { cancelled: boolean }
): Promise<void> {
  const total = SURAHS.length;
  for (let i = 0; i < total; i++) {
    if (cancelRef?.cancelled) {
      onProgress({
        current: i,
        total,
        currentSurahName: '',
        isDownloading: false,
        isCompleted: false,
      });
      return;
    }

    const surah = SURAHS[i];
    onProgress({
      current: i + 1,
      total,
      currentSurahName: surah.ar,
      isDownloading: true,
      isCompleted: false,
    });

    try {
      // Check if already in cache
      const cached = await getSurahOffline(surah.n);
      if (!cached) {
        await downloadSurahFromApi(surah.n);
      }
    } catch {
      // Small pause and retry once
      try {
        await new Promise((r) => setTimeout(r, 400));
        await downloadSurahFromApi(surah.n);
      } catch (err: any) {
        console.warn(`Could not cache Surah ${surah.n}:`, err);
      }
    }

    // Gentle delay
    await new Promise((r) => setTimeout(r, 60));
  }

  onProgress({
    current: total,
    total,
    currentSurahName: '',
    isDownloading: false,
    isCompleted: true,
  });
}

/**
 * Save Tafsir item
 */
export async function saveTafsirOffline(
  surahNumber: number,
  ayahNumber: number,
  text: string,
  source: string = 'تفسير الميسر'
): Promise<void> {
  try {
    const db = await getDb();
    const tx = db.transaction('tafsirs', 'readwrite');
    const store = tx.objectStore('tafsirs');
    store.put({
      key: `${surahNumber}:${ayahNumber}`,
      surahNumber,
      ayahNumber,
      text,
      source,
      savedAt: Date.now(),
    });
  } catch {}
}

/**
 * Get Tafsir item from offline storage
 */
export async function getTafsirOffline(
  surahNumber: number,
  ayahNumber: number
): Promise<{ text: string; source: string } | null> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction('tafsirs', 'readonly');
      const store = tx.objectStore('tafsirs');
      const req = store.get(`${surahNumber}:${ayahNumber}`);
      req.onsuccess = () => {
        if (req.result && req.result.text) {
          resolve({ text: req.result.text, source: req.result.source || 'تفسير الميسر' });
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

/**
 * Cache prayer calculation result
 */
export async function saveOfflinePrayer(key: string, data: any): Promise<void> {
  try {
    const db = await getDb();
    const tx = db.transaction('prayer_cache', 'readwrite');
    tx.objectStore('prayer_cache').put({ key, data, timestamp: Date.now() });
  } catch {}
}

export async function getOfflinePrayer(key: string): Promise<any | null> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction('prayer_cache', 'readonly');
      const req = tx.objectStore('prayer_cache').get(key);
      req.onsuccess = () => resolve(req.result?.data || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Clear all downloaded offline storage
 */
export async function clearAllOfflineStorage(): Promise<void> {
  try {
    const db = await getDb();
    const tx = db.transaction(['surahs', 'tafsirs', 'prayer_cache'], 'readwrite');
    tx.objectStore('surahs').clear();
    tx.objectStore('tafsirs').clear();
    tx.objectStore('prayer_cache').clear();
  } catch {}
}
