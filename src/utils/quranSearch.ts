import { AyahData } from '../types';
import { SURAHS } from '../data/surahs';
import { getSurahOffline, getDownloadedSurahNumbers } from './offlineStorage';

export interface SearchResultItem {
  number: number;
  text: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
  };
  numberInSurah: number;
  isNearestMatch?: boolean;
  similarityScore?: number; // 0 to 100
  matchedSnippet?: string;
}

/**
 * Remove all Arabic diacritics (tashkeel), harakat, Quranic pause marks,
 * and harmonize hamzas, alefs, and letter variants for search.
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    // Remove Quranic annotation signs and harakat (Fatha, Damma, Kasra, Sukun, Tanween, Shadda, Maddah, Dagger Alif, etc.)
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
    // Remove Tatweel / Kashida
    .replace(/\u0640/g, '')
    // Normalize Alefs
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Ta Marbuta
    .replace(/ة/g, 'ه')
    // Normalize Alif Maqsura & Ya
    .replace(/ى/g, 'ي')
    // Normalize Waw with Hamza
    .replace(/ؤ/g, 'و')
    // Normalize Ya with Hamza
    .replace(/ئ/g, 'ي')
    // Remove standalone Hamza & Quranic stops
    .replace(/[ء۝۞۩ۜۘۙۚۛۜ]/g, '')
    // Replace punctuation with space
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟?،!«»"'\\]/g, ' ')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  if (m === 0) return n;
  if (n === 0) return m;

  // Optimize for memory with single row
  let row = Array.from({ length: n + 1 }, (_, i) => i);

  for (let i = 1; i <= m; i++) {
    let nextRow = [i];
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      nextRow[j] = Math.min(
        row[j] + 1, // deletion
        nextRow[j - 1] + 1, // insertion
        row[j - 1] + cost // substitution
      );
    }
    row = nextRow;
  }

  return row[n];
}

/**
 * Calculate similarity between a search query and a Quranic verse
 * Returns a score between 0.0 and 1.0 (1.0 = exact match)
 */
export function calculateAyahSimilarity(query: string, verseText: string): number {
  const qNorm = normalizeArabic(query);
  const vNorm = normalizeArabic(verseText);

  if (!qNorm || !vNorm) return 0;

  // 1. Direct full substring match
  if (vNorm.includes(qNorm)) {
    return 1.0;
  }

  const qWords = qNorm.split(' ').filter(Boolean);
  const vWords = vNorm.split(' ').filter(Boolean);

  if (qWords.length === 0 || vWords.length === 0) return 0;

  // 2. Exact word count match
  let matchedWordCount = 0;
  for (const qw of qWords) {
    if (vWords.some((vw) => vw === qw || vw.includes(qw) || qw.includes(vw))) {
      matchedWordCount++;
    }
  }

  const wordRatio = matchedWordCount / qWords.length;
  if (wordRatio === 1) {
    return 0.95; // All words present in any order or sub-match
  }

  // 3. Sliding window fuzzy match
  // Look for the best matching slice of verse words of roughly query length
  const windowSize = Math.max(1, qWords.length);
  let maxWindowScore = 0;

  for (let i = 0; i <= vWords.length - windowSize; i++) {
    const windowWords = vWords.slice(i, i + windowSize);
    const windowStr = windowWords.join(' ');
    const dist = levenshteinDistance(qNorm, windowStr);
    const maxLen = Math.max(qNorm.length, windowStr.length);
    const similarity = maxLen > 0 ? (maxLen - dist) / maxLen : 0;

    if (similarity > maxWindowScore) {
      maxWindowScore = similarity;
    }
  }

  // Also check single word fuzzy match if 1-2 words
  let tokenFuzzyScore = 0;
  let totalTokenSim = 0;
  for (const qw of qWords) {
    let bestWordSim = 0;
    for (const vw of vWords) {
      const dist = levenshteinDistance(qw, vw);
      const maxLen = Math.max(qw.length, vw.length);
      const sim = maxLen > 0 ? (maxLen - dist) / maxLen : 0;
      if (sim > bestWordSim) bestWordSim = sim;
    }
    totalTokenSim += bestWordSim;
  }
  tokenFuzzyScore = totalTokenSim / qWords.length;

  return Math.max(wordRatio * 0.9, maxWindowScore, tokenFuzzyScore);
}

// Famous core verses and surahs for fast fallback and fuzzy lookups
const CORE_VERSES_CACHE: {
  surahNumber: number;
  ayahNumber: number;
  text: string;
}[] = [
  // Al-Fatiha
  { surahNumber: 1, ayahNumber: 1, text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' },
  { surahNumber: 1, ayahNumber: 2, text: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ' },
  { surahNumber: 1, ayahNumber: 3, text: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' },
  { surahNumber: 1, ayahNumber: 4, text: 'مَٰلِكِ يَوْمِ ٱلدِّينِ' },
  { surahNumber: 1, ayahNumber: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
  { surahNumber: 1, ayahNumber: 6, text: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ' },
  { surahNumber: 1, ayahNumber: 7, text: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ' },
  // Ayat Al-Kursi
  { surahNumber: 2, ayahNumber: 255, text: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ' },
  // Amanar-Rasul (Al-Baqarah 285-286)
  { surahNumber: 2, ayahNumber: 285, text: 'ءَامَنَ ٱلرَّسُولُ بِمَآ أُنزِلَ إِلَيْهِ مِن رَّبِّهِۦ وَٱلْمُؤْمِنُونَ ۚ كُلٌّ ءَامَنَ بِٱللَّهِ وَمَلَٰٓئِكَتِهِۦ وَكُتُبِهِۦ وَرُسُلِهِۦ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِۦ ۚ وَقَالُوا۟ سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ ٱلْمَصِيرُ' },
  { surahNumber: 2, ayahNumber: 286, text: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا ٱكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَآ إِن نَّسِينَآ أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَآ إِصْرًا كَمَا حَمَلْتَهُۥ عَلَى ٱلَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِۦ ۖ وَٱعْفُ عَنَّا وَٱغْفِرْ لَنَا وَٱرْحَمْنَآ ۚ أَنتَ مَوْلَىٰنَا فَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَٰفِرِينَ' },
  // Yasin 1-5
  { surahNumber: 36, ayahNumber: 1, text: 'يسٓ' },
  { surahNumber: 36, ayahNumber: 2, text: 'وَٱلْقُرْءَانِ ٱلْحَكِيمِ' },
  { surahNumber: 36, ayahNumber: 3, text: 'إِنَّكَ لَمِنَ ٱلْمُرْسَلِينَ' },
  { surahNumber: 36, ayahNumber: 4, text: 'عَلَىٰ صِرَٰطٍ مُّسْتَقِيمٍ' },
  { surahNumber: 36, ayahNumber: 5, text: 'تَنزِيلَ ٱلْعَزِيزِ ٱلرَّحِيمِ' },
  // Al-Kahf 1-4
  { surahNumber: 18, ayahNumber: 1, text: 'ٱلْحَمْدُ لِلَّهِ ٱلَّذِىٓ أَنزَلَ عَلَىٰ عَبْدِهِ ٱلْكِتَٰبَ وَلَمْ يَجْعَل لَّهُۥ عِوَجَاۜ' },
  { surahNumber: 18, ayahNumber: 2, text: 'قَيِّمًا لِّيُنذِرَ بَأْسًا شَدِيدًا مِّن لَّدُنْهُ وَيُبَشِّرَ ٱلْمُؤْمِنِينَ ٱلَّذِينَ يَعْمَلُونَ ٱلصَّٰلِحَٰتِ أَنَّ لَهُمْ أَجْرًا حَسَنًا' },
  // Al-Ikhlas
  { surahNumber: 112, ayahNumber: 1, text: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ' },
  { surahNumber: 112, ayahNumber: 2, text: 'ٱللَّهُ ٱلصَّمَدُ' },
  { surahNumber: 112, ayahNumber: 3, text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ' },
  { surahNumber: 112, ayahNumber: 4, text: 'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ' },
  // Al-Falaq
  { surahNumber: 113, ayahNumber: 1, text: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ' },
  { surahNumber: 113, ayahNumber: 2, text: 'مِن شَرِّ مَا خَلَقَ' },
  { surahNumber: 113, ayahNumber: 3, text: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ' },
  { surahNumber: 113, ayahNumber: 4, text: 'وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ' },
  { surahNumber: 113, ayahNumber: 5, text: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ' },
  // An-Nas
  { surahNumber: 114, ayahNumber: 1, text: 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ' },
  { surahNumber: 114, ayahNumber: 2, text: 'مَلِكِ ٱلنَّاسِ' },
  { surahNumber: 114, ayahNumber: 3, text: 'إِلَٰهِ ٱلنَّاسِ' },
  { surahNumber: 114, ayahNumber: 4, text: 'مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ' },
  { surahNumber: 114, ayahNumber: 5, text: 'ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ' },
  { surahNumber: 114, ayahNumber: 6, text: 'مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ' },
  // Al-Asr
  { surahNumber: 103, ayahNumber: 1, text: 'وَٱلْعَصْرِ' },
  { surahNumber: 103, ayahNumber: 2, text: 'إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ' },
  { surahNumber: 103, ayahNumber: 3, text: 'إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ' },
  // Al-Kawthar
  { surahNumber: 108, ayahNumber: 1, text: 'إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ' },
  { surahNumber: 108, ayahNumber: 2, text: 'فَصَلِّ لِرَبِّكَ وَٱنْحَرْ' },
  { surahNumber: 108, ayahNumber: 3, text: 'إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ' },
  // Al-Mulk 1-2
  { surahNumber: 67, ayahNumber: 1, text: 'تَبَٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ' },
  { surahNumber: 67, ayahNumber: 2, text: 'ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَوٰةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ ٱلْعَزِيزُ ٱلْغَفُورُ' },
  // An-Nur 35 (Ayat An-Nur)
  { surahNumber: 24, ayahNumber: 35, text: 'ٱللَّهُ نُورُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ ۚ مَثَلُ نُورِهِۦ كَمِشْكَوٰةٍ فِيهَا مِصْبَاحٌ ۖ ٱلْمِصْبَاحُ فِى زُجَاجَةٍ ۖ ٱلزُّجَاجَةُ كَأَنَّهَا كَوْكَبٌ دُرِّىٌّ يُوقَدُ مِن شَجَرَةٍ مُّبَٰرَكَةٍ زَيْتُونَةٍ لَّا شَرْقِيَّةٍ وَلَا غَرْبِيَّةٍ يَكَادُ زَيْتُهَا يُضِىٓءُ وَلَوْ لَمْ تَمْسَسْهُ نَارٌ ۚ نُّورٌ عَلَىٰ نُورٍ ۗ يَهْدِى ٱللَّهُ لِنُورِهِۦ مَن يَشَآءُ ۚ وَيَضْرِبُ ٱللَّهُ ٱلْأَمْثَٰلَ لِلنَّاسِ ۗ وَٱللَّهُ بِكُلِّ شَىْءٍ عَلِيمٌ' }
];

/**
 * Intelligent Smart Quran Search:
 * 1. Normalized exact search across AlQuran API
 * 2. Search offline downloaded surahs in IndexedDB
 * 3. Nearest-match fuzzy fallback: if typos or spelling mistakes exist,
 *    calculate similarity and return the closest verses.
 */
export async function smartSearchQuran(query: string): Promise<{
  results: SearchResultItem[];
  isFuzzyNearestMatch: boolean;
  searchedTerm: string;
}> {
  const rawQuery = query.trim();
  const normQuery = normalizeArabic(rawQuery);

  if (!normQuery) {
    return { results: [], isFuzzyNearestMatch: false, searchedTerm: rawQuery };
  }

  const foundResults: SearchResultItem[] = [];
  const seenKeys = new Set<string>();

  // 1. Try API search with raw query and normalized query
  try {
    const urls = [
      `https://api.alquran.cloud/v1/search/${encodeURIComponent(rawQuery)}/all/ar`,
    ];
    if (normQuery !== rawQuery) {
      urls.push(`https://api.alquran.cloud/v1/search/${encodeURIComponent(normQuery)}/all/ar`);
    }

    for (const url of urls) {
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.code === 200 && Array.isArray(data.data?.matches)) {
          for (const match of data.data.matches) {
            const key = `${match.surah.number}:${match.numberInSurah}`;
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              foundResults.push({
                number: match.number,
                text: match.text,
                surah: {
                  number: match.surah.number,
                  name: match.surah.name,
                  englishName: match.surah.englishName,
                },
                numberInSurah: match.numberInSurah,
                isNearestMatch: false,
                similarityScore: 100,
              });
            }
          }
        }
      } catch {}
      if (foundResults.length > 0) break;
    }
  } catch {}

  // 2. Search locally in offline IndexedDB cached surahs
  try {
    const downloadedSurahNums = await getDownloadedSurahNumbers();
    for (const sNum of downloadedSurahNums) {
      const cachedAyahs = await getSurahOffline(sNum);
      if (cachedAyahs && cachedAyahs.length > 0) {
        const sInfo = SURAHS.find((s) => s.n === sNum);
        for (const ayah of cachedAyahs) {
          const key = `${sNum}:${ayah.numberInSurah}`;
          if (seenKeys.has(key)) continue;

          const ayahNorm = normalizeArabic(ayah.text);
          if (ayahNorm.includes(normQuery)) {
            seenKeys.add(key);
            foundResults.push({
              number: ayah.number,
              text: ayah.text,
              surah: {
                number: sNum,
                name: sInfo?.ar || `سورة ${sNum}`,
                englishName: sInfo?.en || `Surah ${sNum}`,
              },
              numberInSurah: ayah.numberInSurah,
              isNearestMatch: false,
              similarityScore: 100,
            });
          }
        }
      }
    }
  } catch {}

  // If exact or normalized matches were found, return them
  if (foundResults.length > 0) {
    return {
      results: foundResults.slice(0, 50),
      isFuzzyNearestMatch: false,
      searchedTerm: rawQuery,
    };
  }

  // 3. FUZZY / NEAREST MATCH SEARCH (when there are typos or slight spelling differences)
  // e.g. "قل اعود برب الناس" -> finds "قل اعوذ برب الناس" (Al-Falaq / An-Nas)
  // e.g. "والعصر ان لانسان لفي خسر" -> finds Al-Asr
  // e.g. "الله لا اله الا هو الحي القيوم" -> finds Ayat Al-Kursi
  const candidateVerses: {
    surahNumber: number;
    ayahNumber: number;
    text: string;
    surahName: string;
    surahEnName: string;
  }[] = [];

  // Add core famous verses
  for (const cv of CORE_VERSES_CACHE) {
    const sInfo = SURAHS.find((s) => s.n === cv.surahNumber);
    candidateVerses.push({
      surahNumber: cv.surahNumber,
      ayahNumber: cv.ayahNumber,
      text: cv.text,
      surahName: sInfo?.ar || `سورة ${cv.surahNumber}`,
      surahEnName: sInfo?.en || `Surah ${cv.surahNumber}`,
    });
  }

  // Add all cached local verses to candidates
  try {
    const downloadedSurahNums = await getDownloadedSurahNumbers();
    for (const sNum of downloadedSurahNums) {
      const cachedAyahs = await getSurahOffline(sNum);
      if (cachedAyahs) {
        const sInfo = SURAHS.find((s) => s.n === sNum);
        for (const ayah of cachedAyahs) {
          candidateVerses.push({
            surahNumber: sNum,
            ayahNumber: ayah.numberInSurah,
            text: ayah.text,
            surahName: sInfo?.ar || `سورة ${sNum}`,
            surahEnName: sInfo?.en || `Surah ${sNum}`,
          });
        }
      }
    }
  } catch {}

  // If query specifies a surah name (e.g. "البقرة 255" or "يس 5" or "الكهف"), try to parse and fetch
  const surahNameMatch = SURAHS.find((s) => {
    const sNorm = normalizeArabic(s.ar);
    return normQuery.includes(sNorm);
  });

  if (surahNameMatch) {
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNameMatch.n}`);
      const data = await res.json();
      if (data.code === 200 && data.data?.ayahs) {
        for (const a of data.data.ayahs) {
          candidateVerses.push({
            surahNumber: surahNameMatch.n,
            ayahNumber: a.numberInSurah,
            text: a.text,
            surahName: surahNameMatch.ar,
            surahEnName: surahNameMatch.en,
          });
        }
      }
    } catch {}
  }

  // Also try token queries against API to pull candidate verses with similar words
  const words = normQuery.split(' ').filter((w) => w.length >= 3);
  if (words.length > 0) {
    const longestWord = [...words].sort((a, b) => b.length - a.length)[0];
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(longestWord)}/all/ar`);
      const data = await res.json();
      if (data.code === 200 && Array.isArray(data.data?.matches)) {
        for (const m of data.data.matches.slice(0, 20)) {
          candidateVerses.push({
            surahNumber: m.surah.number,
            ayahNumber: m.numberInSurah,
            text: m.text,
            surahName: m.surah.name,
            surahEnName: m.surah.englishName,
          });
        }
      }
    } catch {}
  }

  // Score all candidate verses
  const scoredCandidates: {
    item: SearchResultItem;
    score: number;
  }[] = [];

  const processedKeys = new Set<string>();

  for (const cv of candidateVerses) {
    const key = `${cv.surahNumber}:${cv.ayahNumber}`;
    if (processedKeys.has(key)) continue;
    processedKeys.add(key);

    const score = calculateAyahSimilarity(normQuery, cv.text);
    if (score >= 0.35) { // Minimum relevance threshold
      scoredCandidates.push({
        item: {
          number: cv.surahNumber * 1000 + cv.ayahNumber,
          text: cv.text,
          surah: {
            number: cv.surahNumber,
            name: cv.surahName,
            englishName: cv.surahEnName,
          },
          numberInSurah: cv.ayahNumber,
          isNearestMatch: true,
          similarityScore: Math.min(99, Math.round(score * 100)),
        },
        score,
      });
    }
  }

  // Sort by highest similarity score
  scoredCandidates.sort((a, b) => b.score - a.score);

  const nearestResults = scoredCandidates.slice(0, 15).map((sc) => sc.item);

  return {
    results: nearestResults,
    isFuzzyNearestMatch: nearestResults.length > 0,
    searchedTerm: rawQuery,
  };
}
