import { SURAHS } from '../data/surahs';
import { Reciter } from '../types';

export function getGlobalAyahNumber(surahN: number, ayahN: number): number {
  let globalIndex = 0;
  for (let i = 0; i < surahN - 1; i++) {
    globalIndex += SURAHS[i].a;
  }
  return globalIndex + ayahN;
}

/**
 * Returns an ordered array of candidate audio URLs for a full surah.
 */
export function getSurahAudioCandidates(surahNumber: number, reciter: Reciter | null): string[] {
  const pad = String(surahNumber).padStart(3, '0');
  const candidates: string[] = [];

  if (reciter && reciter.server) {
    const cleanServer = reciter.server.replace(/\/+$/, '');
    candidates.push(`${cleanServer}/${pad}.mp3`);
  }

  // Fast, reliable mirror servers
  candidates.push(`https://server8.mp3quran.net/afs/${pad}.mp3`); // Mishari Alafasy
  candidates.push(`https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${surahNumber}.mp3`);
  candidates.push(`https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`);
  candidates.push(`https://server7.mp3quran.net/basit/${pad}.mp3`);

  return Array.from(new Set(candidates));
}

/**
 * Returns an ordered array of candidate audio URLs for a single ayah.
 */
export function getAyahAudioCandidates(surahNumber: number, ayahNumber: number): string[] {
  const globalN = getGlobalAyahNumber(surahNumber, ayahNumber);
  const surahPad = String(surahNumber).padStart(3, '0');
  const ayahPad = String(ayahNumber).padStart(3, '0');

  return [
    `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalN}.mp3`,
    `https://everyayah.com/data/Alafasy_128kbps/${surahPad}${ayahPad}.mp3`,
    `https://verses.quran.com/Alafasy/mp3/${surahPad}${ayahPad}.mp3`,
    `https://cdn.jsdelivr.net/gh/islamic-network/cdn@master/quran/audio/128/ar.alafasy/${globalN}.mp3`,
  ];
}
