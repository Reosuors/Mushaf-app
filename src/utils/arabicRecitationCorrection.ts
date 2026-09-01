// Comprehensive Arabic Quranic Speech Normalization and Automatic Error Correction Engine

export interface WordDiff {
  expectedWord: string;
  spokenWord?: string;
  status: 'match' | 'mismatch' | 'missing' | 'extra';
  expectedNormalized: string;
  spokenNormalized?: string;
}

export interface RecitationEvaluationResult {
  isMatch: boolean;
  similarityScore: number;
  expectedTextClean: string;
  userTextClean: string;
  expectedAyahOriginal: string;
  diffs: WordDiff[];
  correctedRecitation: string;
  correctionTips: string[];
  matchedWordsCount: number;
  totalWordsCount: number;
}

/**
 * Remove all Quranic marks, diacritics, stop signs, and ornamentation
 */
export function removeTashkeelAndQuranMarks(text: string): string {
  if (!text) return '';
  return text
    // Remove Quranic Stop Marks, Sajda, Rub el Hizb, Ayah signs
    .replace(/[\u0610-\u061A\u06D6-\u06ED\u06E9\u06DE\u06DF\u06E0\u06E1\u06E2\u06E3\u06E4\u06E5\u06E6\u06E7\u06E8\u06EA\u06EB\u06EC\u06ED\u06EE\u06EF\uFD3E\uFD3F۝\u06DD]/g, '')
    // Remove Standard Harakat & Tanween & Sukoon & Shaddah & Dagger Alif
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Remove Tatweel (Kashida)
    .replace(/\u0640/g, '')
    // Remove numbers and parenthesis
    .replace(/[\d\(\)\[\]\{\}\.,;:!?؟،]/g, '')
    .trim();
}

/**
 * Deep normalization for speech recognition comparison
 */
export function normalizeQuranicForSpeech(text: string): string {
  if (!text) return '';

  let cleaned = removeTashkeelAndQuranMarks(text);

  // Common Quranic orthography to phonetic standard Arabic mappings:
  cleaned = cleaned
    // Normalize Uthmani spelling of words like الصلوة -> الصلاة, الزكوة -> الزكاة, الحيوة -> الحياة
    .replace(/صلو[ةه]/g, 'صلاه')
    .replace(/زكو[ةه]/g, 'زكاه')
    .replace(/حيو[ةه]/g, 'حياه')
    .replace(/مشكو[ةه]/g, 'مشكاه')
    .replace(/نجو[ةه]/g, 'نجاه')
    .replace(/غدو[ةه]/g, 'غداه')
    // Normalize dagger alif differences (الرحمن vs الرحمان, إله vs إلاه, السموات vs السماوات, إلخ)
    .replace(/الرحمٰن|الرحمان/g, 'الرحمن')
    .replace(/السمٰوٰت|السماوات|السموت/g, 'السماوات')
    .replace(/مٰلك|مالك/g, 'مالك')
    .replace(/هٰذ/g, 'هذ')
    .replace(/ذٰلك/g, 'ذلك')
    .replace(/إلٰه|الاه/g, 'اله')
    .replace(/إلٰهي/g, 'الهي')
    .replace(/إلٰهكم/g, 'الهكم')
    .replace(/إلٰهنا/g, 'الهنا')
    .replace(/إسحٰق/g, 'اسحاق')
    .replace(/إسمٰعيل/g, 'اسماعيل')
    .replace(/إبرٰهيم/g, 'ابراهيم')
    .replace(/هٰرون/g, 'هارون')
    .replace(/سلٰم/g, 'سلام')
    .replace(/كتٰب/g, 'كتاب')
    .replace(/أصـحٰب|اصحٰب/g, 'اصحاب');

  // Character-level standardizations
  cleaned = cleaned
    // All Alif forms -> ا (Alef)
    .replace(/[أإآٱٲٳإآ]/g, 'ا')
    // All Yaa and Alif Maqsura forms -> ي
    .replace(/[ىيئؽؾؿىيـ]/g, 'ي')
    // Taa Marbuta and Haa -> ه
    .replace(/[ة]/g, 'ه')
    // Waw with hamza -> و
    .replace(/[ؤ]/g, 'و')
    // Lone hamza -> remove
    .replace(/[ء]/g, '')
    // Replace non-Arabic chars with spaces
    .replace(/[^\u0621-\u063A\u0641-\u064A\s]/g, ' ')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

/**
 * Strips common Arabic prefixes (و, ف, ب, ك, ل, ال) for stem comparison
 */
export function getWordStem(w: string): string {
  if (!w || w.length <= 2) return w;
  let stem = w;
  if (stem.startsWith('ال') && stem.length > 3) {
    stem = stem.slice(2);
  }
  if ((stem.startsWith('و') || stem.startsWith('ف') || stem.startsWith('ب') || stem.startsWith('ك') || stem.startsWith('ل')) && stem.length > 2) {
    stem = stem.slice(1);
  }
  if (stem.startsWith('ال') && stem.length > 3) {
    stem = stem.slice(2);
  }
  return stem;
}

/**
 * Calculate Levenshtein similarity between two normalized words
 */
function wordSimilarity(w1: string, w2: string): number {
  if (!w1 || !w2) return 0.0;
  if (w1 === w2) return 1.0;

  // Stems match directly
  const stem1 = getWordStem(w1);
  const stem2 = getWordStem(w2);
  if (stem1 === stem2 && stem1.length >= 2) return 0.95;

  // Substring or prefix variants (e.g. "وبالحق" vs "بالحق")
  if (w1.includes(w2) || w2.includes(w1)) {
    const minLen = Math.min(w1.length, w2.length);
    const maxLen = Math.max(w1.length, w2.length);
    if (minLen / maxLen >= 0.6) return 0.88;
  }

  // Dialect / phonetic consonant swaps (ث/س, ذ/ز, ظ/ض, ق/غ)
  const p1 = w1.replace(/[ث]/g, 'س').replace(/[ذ]/g, 'ز').replace(/[ظ]/g, 'ض').replace(/[غ]/g, 'ق');
  const p2 = w2.replace(/[ث]/g, 'س').replace(/[ذ]/g, 'ز').replace(/[ظ]/g, 'ض').replace(/[غ]/g, 'ق');
  if (p1 === p2) return 0.92;

  // Levenshtein distance
  const matrix: number[][] = [];
  for (let i = 0; i <= w1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= w2.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= w1.length; i++) {
    for (let j = 1; j <= w2.length; j++) {
      if (w1[i - 1] === w2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const dist = matrix[w1.length][w2.length];
  const maxLen = Math.max(w1.length, w2.length);
  return 1 - dist / maxLen;
}

/**
 * Strip Bismillah prefix if present at the start of verse 1 (except Al-Fatiha)
 */
export function stripBismillahPrefix(ayahText: string, surahNumber: number, ayahNumber: number): string {
  if (!ayahText) return '';
  if (surahNumber !== 1 && ayahNumber === 1) {
    const bismillahPrefix = /^بِسْمِ\s+اللَّهِ\s+الرَّحْمَٰنِ\s+الرَّحِيمِ\s*/i;
    const bismillahPlain = /^بسم\s+الله\s+الرحمن\s+الرحيم\s*/i;
    if (bismillahPrefix.test(ayahText)) {
      return ayahText.replace(bismillahPrefix, '').trim();
    }
    if (bismillahPlain.test(ayahText)) {
      return ayahText.replace(bismillahPlain, '').trim();
    }
  }
  return ayahText;
}

/**
 * Detailed word-by-word evaluation and automatic recitation correction
 */
export function evaluateRecitationWithAutoCorrection(
  userSpeech: string,
  expectedAyahText: string,
  surahNumber: number = 1,
  ayahNumber: number = 1
): RecitationEvaluationResult {
  // Strip potential Bismillah prefix from Ayah 1 of surahs other than Fatiha
  const cleanExpectedOriginal = stripBismillahPrefix(expectedAyahText, surahNumber, ayahNumber);

  const normExpected = normalizeQuranicForSpeech(cleanExpectedOriginal);
  const normUser = normalizeQuranicForSpeech(userSpeech);

  const expectedWordsOrig = cleanExpectedOriginal.split(/\s+/).filter(Boolean);
  const expectedWordsNorm = normExpected.split(/\s+/).filter(Boolean);
  const userWordsNorm = normUser.split(/\s+/).filter(Boolean);
  const userWordsOrig = userSpeech.split(/\s+/).filter(Boolean);

  const diffs: WordDiff[] = [];
  const correctionTips: string[] = [];
  let matchedCount = 0;

  let uIdx = 0;
  for (let eIdx = 0; eIdx < expectedWordsNorm.length; eIdx++) {
    const eNorm = expectedWordsNorm[eIdx];
    const eOrig = expectedWordsOrig[eIdx] || eNorm;

    if (uIdx < userWordsNorm.length) {
      const uNorm = userWordsNorm[uIdx];
      const uOrig = userWordsOrig[uIdx] || uNorm;
      const sim = wordSimilarity(eNorm, uNorm);

      if (sim >= 0.72) {
        // Match!
        diffs.push({
          expectedWord: eOrig,
          spokenWord: uOrig,
          status: 'match',
          expectedNormalized: eNorm,
          spokenNormalized: uNorm,
        });
        matchedCount++;
        uIdx++;
      } else {
        // Lookahead 1 step to see if user just skipped a word or substituted
        const nextUSim = uIdx + 1 < userWordsNorm.length ? wordSimilarity(eNorm, userWordsNorm[uIdx + 1]) : 0;
        const nextESim = eIdx + 1 < expectedWordsNorm.length ? wordSimilarity(expectedWordsNorm[eIdx + 1], uNorm) : 0;

        if (nextUSim > 0.72) {
          // Extra user word inserted before this
          diffs.push({
            expectedWord: eOrig,
            spokenWord: uOrig,
            status: 'mismatch',
            expectedNormalized: eNorm,
            spokenNormalized: uNorm,
          });
          correctionTips.push(`نطقت "${uOrig}" بدلاً من "${removeTashkeelAndQuranMarks(eOrig)}"`);
          uIdx += 2;
        } else if (nextESim > 0.72) {
          // User skipped this expected word
          diffs.push({
            expectedWord: eOrig,
            status: 'missing',
            expectedNormalized: eNorm,
          });
          correctionTips.push(`تم تجاوز كلمة: "${removeTashkeelAndQuranMarks(eOrig)}"`);
        } else {
          // Direct mismatch / substitution
          diffs.push({
            expectedWord: eOrig,
            spokenWord: uOrig,
            status: 'mismatch',
            expectedNormalized: eNorm,
            spokenNormalized: uNorm,
          });
          correctionTips.push(`نطقت "${uOrig}" والصواب هو: "${removeTashkeelAndQuranMarks(eOrig)}"`);
          uIdx++;
        }
      }
    } else {
      // Remaining expected words were missing
      diffs.push({
        expectedWord: eOrig,
        status: 'missing',
        expectedNormalized: eNorm,
      });
      correctionTips.push(`متبقي في نهاية الآية: "${removeTashkeelAndQuranMarks(eOrig)}"`);
    }
  }

  // Any remaining spoken words are extra
  while (uIdx < userWordsNorm.length) {
    diffs.push({
      expectedWord: '',
      spokenWord: userWordsOrig[uIdx] || userWordsNorm[uIdx],
      status: 'extra',
      expectedNormalized: '',
      spokenNormalized: userWordsNorm[uIdx],
    });
    correctionTips.push(`كلمة إضافية ليست من الآية: "${userWordsOrig[uIdx]}"`);
    uIdx++;
  }

  const totalExpected = Math.max(1, expectedWordsNorm.length);
  let similarityScore = Math.min(
    100,
    Math.max(0, Math.round((matchedCount / totalExpected) * 100))
  );

  // Global string comparison shortcuts (e.g. speech API joined words without spaces or with minor punctuation)
  const normExpectedCompact = normExpected.replace(/\s+/g, '');
  const normUserCompact = normUser.replace(/\s+/g, '');

  if (normExpectedCompact === normUserCompact && normExpectedCompact.length > 0) {
    similarityScore = 100;
  } else if (normExpectedCompact.includes(normUserCompact) || normUserCompact.includes(normExpectedCompact)) {
    const compactRatio = Math.min(normExpectedCompact.length, normUserCompact.length) / Math.max(normExpectedCompact.length, normUserCompact.length);
    if (compactRatio >= 0.75) {
      similarityScore = Math.max(similarityScore, Math.round(compactRatio * 100));
    }
  }

  // Success criteria: 55%+ similarity score or full phrase matching without harakat
  const isMatch = similarityScore >= 55;

  return {
    isMatch,
    similarityScore,
    expectedTextClean: normExpected,
    userTextClean: normUser,
    expectedAyahOriginal: cleanExpectedOriginal,
    diffs,
    correctedRecitation: cleanExpectedOriginal,
    correctionTips,
    matchedWordsCount: matchedCount,
    totalWordsCount: totalExpected,
  };
}
