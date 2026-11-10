// Quran text loader — Tanzil Quran Text (Uthmani, Version 1.1), (C) 2007-2026 Tanzil Project, CC BY 3.0.
// The text file in /public/quran/quran-uthmani.txt is a verbatim copy downloaded from https://tanzil.net
// (it carries Tanzil's copyright block). Nothing in this app changes the letters of any ayah.
import { AyahData } from '../types';
import { SURAHS } from '../data/surahs';
import { JUZ_STARTS, HIZB_QUARTER_STARTS, PAGE_STARTS, SAJDAS } from '../data/quranMeta';

export const QURAN_TEXT_URL = '/quran/quran-uthmani.txt';
export const QURAN_EDITION = 'quran-uthmani (Tanzil)';

let quranCache: string[][] | null = null; // quranCache[surah-1][ayah-1]
let loading: Promise<string[][]> | null = null;

/** Remove invisible characters (BOM, word joiner, zero-width) and trailing whitespace only. */
export function cleanAyahText(text: string): string {
  return (text || '').replace(/[\uFEFF\u2060\u200B]/g, '').replace(/[\s\r\n]+$/g, '').replace(/^\s+/, '');
}

function parse(raw: string): string[][] {
  const out: string[][] = SURAHS.map(() => []);
  for (const line of raw.split('\n')) {
    const first = line.indexOf('|');
    if (first < 1) continue;
    const second = line.indexOf('|', first + 1);
    if (second < 0) continue;
    const s = parseInt(line.slice(0, first), 10);
    const a = parseInt(line.slice(first + 1, second), 10);
    if (!s || !a || s > 114) continue;
    out[s - 1][a - 1] = cleanAyahText(line.slice(second + 1));
  }
  return out;
}

export const QURAN_TEXT_GZ_URL = '/quran/quran-uthmani.txt.gz';

async function gunzipToText(buf: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buf);
  // Some hosts already undo the gzip on the way (Content-Encoding); then it is plain text.
  if (!(bytes[0] === 0x1f && bytes[1] === 0x8b)) return new TextDecoder('utf-8').decode(bytes);
  const DS = (globalThis as any).DecompressionStream;
  if (!DS) throw new Error('no DecompressionStream');
  const stream = new Blob([bytes]).stream().pipeThrough(new DS('gzip'));
  return await new Response(stream).text();
}

/** Mirror of the same verbatim file (used when this host does not carry the file itself). */
export const QURAN_TEXT_MIRROR_GZ_URL = 'https://mushaf-ahmad-data.sites.tab.bot/cors/quran/quran-uthmani.txt.gz';

function looksComplete(text: string): boolean {
  return text.startsWith('1|1|') && text.includes('114|6|');
}

/** Compressed copy first (smaller download), then the plain verbatim file, then the mirror. */
async function fetchQuranRaw(): Promise<string> {
  const local: [string, boolean][] = [
    [QURAN_TEXT_GZ_URL, true],
    [QURAN_TEXT_URL, false],
  ];
  const mirror: [string, boolean] = [QURAN_TEXT_MIRROR_GZ_URL, true];
  // The tab.bot copy of the app keeps the big file on its mirror host; elsewhere (Vercel, the APK) it is local.
  const onTabHost = typeof location !== 'undefined' && location.hostname.endsWith('.sites.tab.bot');
  const candidates = onTabHost ? [mirror, ...local] : [...local, mirror];
  let lastError: unknown = null;
  for (const [url, gz] of candidates) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const text = gz ? await gunzipToText(await r.arrayBuffer()) : await r.text();
      if (looksComplete(text)) return text;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error('quran text not available');
}

export function loadQuran(): Promise<string[][]> {
  if (quranCache) return Promise.resolve(quranCache);
  if (!loading) {
    loading = fetchQuranRaw()
      .then((raw) => {
        const parsed = parse(raw);
        const total = parsed.reduce((n, s) => n + s.length, 0);
        if (total !== 6236) throw new Error('quran text incomplete: ' + total);
        quranCache = parsed;
        return parsed;
      })
      .catch((e) => {
        loading = null;
        throw e;
      });
  }
  return loading;
}

export function isQuranLoaded(): boolean {
  return !!quranCache;
}

function divisionIndex(starts: [number, number][], s: number, a: number): number {
  // number of starts <= (s,a)
  let lo = 0, hi = starts.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const [ms, ma] = starts[mid];
    if (ms < s || (ms === s && ma <= a)) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function getJuz(s: number, a: number) { return divisionIndex(JUZ_STARTS, s, a); }
export function getHizbQuarter(s: number, a: number) { return divisionIndex(HIZB_QUARTER_STARTS, s, a); }
export function getPage(s: number, a: number) { return divisionIndex(PAGE_STARTS, s, a); }
export function isSajda(s: number, a: number) { return SAJDAS.some(([ss, aa]) => ss === s && aa === a); }

export function getGlobalAyahNumber(s: number, a: number): number {
  let n = 0;
  for (let i = 0; i < s - 1; i++) n += SURAHS[i].a;
  return n + a;
}

/** Diacritic-insensitive skeleton used for comparison/search only (never for display). */
export function arabicSkeleton(text: string): string {
  return (text || '')
    .replace(/[\uFEFF\u2060\u200B\u0640]/g, '')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF]/g, '')
    .replace(/[ٱأإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ی/g, 'ي')
    .replace(/ۀ/g, 'ه')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ء/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const BASMALA_SKELETON = 'بسم الله الرحمن الرحيم';

/**
 * In the Uthmani text, ayah 1 of every surah except 1 (where it IS ayah 1) and 9 (no basmala)
 * starts with the basmala. We show the basmala once as a header, so it is removed from the
 * displayed ayah 1 here — by word count, after checking the first four words really are the basmala.
 * Nothing else in the ayah is touched.
 */
export function stripBasmala(surah: number, ayah: number, text: string): string {
  if (surah === 1 || surah === 9 || ayah !== 1) return text;
  const words = text.split(' ');
  if (words.length > 4 && arabicSkeleton(words.slice(0, 4).join(' ')) === BASMALA_SKELETON) {
    return words.slice(4).join(' ');
  }
  return text;
}

export const BASMALA_TEXT_KEY = { surah: 1, ayah: 1 };

export async function getBasmalaText(): Promise<string> {
  const q = await loadQuran();
  return q[0][0];
}

export async function getSurahAyahs(surah: number): Promise<AyahData[]> {
  const q = await loadQuran();
  const list = q[surah - 1] || [];
  const base = getGlobalAyahNumber(surah, 1) - 1;
  return list.map((text, i) => ({
    number: base + i + 1,
    numberInSurah: i + 1,
    text,
    juz: getJuz(surah, i + 1),
    page: getPage(surah, i + 1),
    hizbQuarter: getHizbQuarter(surah, i + 1),
    sajda: isSajda(surah, i + 1),
  }));
}

export async function getAyahText(surah: number, ayah: number): Promise<string> {
  const q = await loadQuran();
  return q[surah - 1]?.[ayah - 1] || '';
}

/** Ayah text for display: basmala removed from ayah 1 of surahs 2–114 (except 9). */
export async function getDisplayAyahText(surah: number, ayah: number): Promise<string> {
  return stripBasmala(surah, ayah, await getAyahText(surah, ayah));
}

/** Ayah of the day: deterministic by local date, spread over the whole Quran. */
export function getAyahOfDayRef(date = new Date()): { surah: number; ayah: number } {
  const dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  // a step co-prime with 6236 walks every ayah before repeating
  const global = ((dayNumber * 2731) % 6236 + 6236) % 6236 + 1;
  let n = global;
  for (const s of SURAHS) {
    if (n <= s.a) return { surah: s.n, ayah: n };
    n -= s.a;
  }
  return { surah: 1, ayah: 1 };
}

export function surahAyahFromGlobal(global: number): { surah: number; ayah: number } {
  let n = global;
  for (const s of SURAHS) {
    if (n <= s.a) return { surah: s.n, ayah: n };
    n -= s.a;
  }
  return { surah: 114, ayah: 6 };
}

export interface LocalSearchHit {
  surah: number;
  ayah: number;
  text: string;
}

let skeletonIndex: string[][] | null = null;

/** Search key: skeleton without any alef, so "السماوات" matches the Uthmani "ٱلسَّمَـٰوَٰتِ". */
export function searchKey(text: string): string {
  return arabicSkeleton(text).replace(/ا/g, '');
}

/** Diacritic-insensitive search over the Quran text only. */
export async function searchQuranLocal(query: string, limit = 200): Promise<{ hits: LocalSearchHit[]; total: number }> {
  const q = await loadQuran();
  const needle = searchKey(query);
  if (needle.length < 2) return { hits: [], total: 0 };
  if (!skeletonIndex) skeletonIndex = q.map((s, si) => s.map((t, ai) => searchKey(stripBasmala(si + 1, ai + 1, t))));
  const hits: LocalSearchHit[] = [];
  let total = 0;
  for (let si = 0; si < q.length; si++) {
    for (let ai = 0; ai < q[si].length; ai++) {
      if (skeletonIndex[si][ai].includes(needle)) {
        total++;
        if (hits.length < limit) hits.push({ surah: si + 1, ayah: ai + 1, text: stripBasmala(si + 1, ai + 1, q[si][ai]) });
      }
    }
  }
  return { hits, total };
}

/** Arabic-Indic digits for ayah markers. */
export function toArabicDigits(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
}

export function juzFirstAyah(juz: number): { surah: number; ayah: number } {
  const [s, a] = JUZ_STARTS[juz - 1];
  return { surah: s, ayah: a };
}

export function hizbFirstAyah(hizb: number): { surah: number; ayah: number } {
  const [s, a] = HIZB_QUARTER_STARTS[(hizb - 1) * 4];
  return { surah: s, ayah: a };
}

export function pageFirstAyah(page: number): { surah: number; ayah: number } {
  const [s, a] = PAGE_STARTS[page - 1];
  return { surah: s, ayah: a };
}
