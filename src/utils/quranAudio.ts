import { Reciter } from '../types';
import { getGlobalAyahNumber as globalNumber } from './quranText';

/**
 * Curated reciters: each one has a full-surah recording (mp3quran.net) AND a verse-by-verse
 * recording (everyayah.com) of the SAME reciter, so single-ayah audio always follows the chosen reciter.
 */
export const RECITERS: Reciter[] = [
  { id: 123, name: 'مشاري راشد العفاسي', server: 'https://cdn.mp3quran.net/audio/mishary-alafasy/r1/', everyayah: 'Alafasy_128kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 51, name: 'عبدالباسط عبدالصمد (مرتل)', server: 'https://cdn.mp3quran.net/audio/abdulbasit-abdulsamad/r3/', everyayah: 'Abdul_Basit_Murattal_192kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 118, name: 'محمود خليل الحصري', server: 'https://server13.mp3quran.net/husr/', everyayah: 'Husary_128kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 112, name: 'محمد صديق المنشاوي', server: 'https://server10.mp3quran.net/minsh/', everyayah: 'Minshawy_Murattal_128kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 102, name: 'ماهر المعيقلي', server: 'https://cdn.mp3quran.net/audio/maher-muaiqly/r1/', everyayah: 'MaherAlMuaiqly128kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 54, name: 'عبدالرحمن السديس', server: 'https://cdn.mp3quran.net/audio/abdulrahman-sudais/r1/', everyayah: 'Abdurrahmaan_As-Sudais_192kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 31, name: 'سعود الشريم', server: 'https://cdn.mp3quran.net/audio/saud-shuraim/r1/', everyayah: 'Saood_ash-Shuraym_128kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 30, name: 'سعد الغامدي', server: 'https://cdn.mp3quran.net/audio/saad-ghamdi/r1/', everyayah: 'Ghamadi_40kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 92, name: 'ياسر الدوسري', server: 'https://cdn.mp3quran.net/audio/yasser-dosari/r1/', everyayah: 'Yasser_Ad-Dussary_128kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 5, name: 'أحمد بن علي العجمي', server: 'https://cdn.mp3quran.net/audio/ahmad-ajmi/r1/', everyayah: 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 4, name: 'أبو بكر الشاطري', server: 'https://cdn.mp3quran.net/audio/abubakr-shatri/r1/', everyayah: 'Abu_Bakr_Ash-Shaatree_128kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 74, name: 'علي بن عبدالرحمن الحذيفي', server: 'https://cdn.mp3quran.net/audio/ali-hudhaifi/r1/', everyayah: 'Hudhaify_128kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 109, name: 'محمد أيوب', server: 'https://cdn.mp3quran.net/audio/muhammad-ayyub/r1/', everyayah: 'Muhammad_Ayyoub_128kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 86, name: 'ناصر القطامي', server: 'https://cdn.mp3quran.net/audio/nasser-qatami/r1/', everyayah: 'Nasser_Alqatami_128kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 111, name: 'محمد جبريل', server: 'https://cdn.mp3quran.net/audio/muhammad-jibreel/r1/', everyayah: 'Muhammad_Jibreel_128kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 60, name: 'عبدالله بصفر', server: 'https://cdn.mp3quran.net/audio/abdullah-basfar/r1/', everyayah: 'Abdullah_Basfar_192kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 89, name: 'هاني الرفاعي', server: 'https://cdn.mp3quran.net/audio/hani-rifai/r1/', everyayah: 'Hani_Rifai_192kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 81, name: 'فارس عباد', server: 'https://cdn.mp3quran.net/audio/fares-abbad/r1/', everyayah: 'Fares_Abbad_64kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 106, name: 'محمد محمود الطبلاوي', server: 'https://cdn.mp3quran.net/audio/muhammad-tablawi/r1/', everyayah: 'Mohammad_al_Tablaway_128kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 43, name: 'صلاح البدير', server: 'https://cdn.mp3quran.net/audio/salah-budair/r1/', everyayah: 'Salah_Al_Budair_128kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 62, name: 'عبدالله عواد الجهني', server: 'https://cdn.mp3quran.net/audio/abdullah-juhani/r1/', everyayah: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 59, name: 'عبدالله المطرود', server: 'https://cdn.mp3quran.net/audio/abdullah-matrood/r1/', everyayah: 'Abdullah_Matroud_128kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 76, name: 'علي جابر', server: 'https://cdn.mp3quran.net/audio/ali-jaber/r1/', everyayah: 'Ali_Jaber_64kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 121, name: 'محمود علي البنا', server: 'https://cdn.mp3quran.net/audio/mahmoud-banna/r1/', everyayah: 'mahmoud_ali_al_banna_32kbps', moshaf: 'حفص عن عاصم - مرتل' },
  { id: 1, name: 'إبراهيم الأخضر', server: 'https://cdn.mp3quran.net/audio/ibrahim-akhdar/r1/', everyayah: 'Ibrahim_Akhdar_32kbps', moshaf: 'حفص عن عاصم - مرتل' },
];

export const DEFAULT_RECITER = RECITERS[0];
const RECITER_KEY = 'mushaf_reciter_id';

export function loadSavedReciter(): Reciter {
  const id = parseInt(localStorage.getItem(RECITER_KEY) || '', 10);
  return RECITERS.find((r) => r.id === id) || DEFAULT_RECITER;
}

export function saveReciter(r: Reciter) {
  localStorage.setItem(RECITER_KEY, String(r.id));
}

export function getGlobalAyahNumber(surahN: number, ayahN: number): number {
  return globalNumber(surahN, ayahN);
}

/** Ordered candidate URLs for a full surah by the chosen reciter. */
export function getSurahAudioCandidates(surahNumber: number, reciter: Reciter | null): string[] {
  const pad = String(surahNumber).padStart(3, '0');
  const rec = reciter || DEFAULT_RECITER;
  const list: string[] = [];
  if (rec.server) list.push(`${rec.server.replace(/\/+$/, '')}/${pad}.mp3`);
  if (rec.everyayah && rec.id === DEFAULT_RECITER.id) {
    list.push(`https://server8.mp3quran.net/afs/${pad}.mp3`);
  }
  return Array.from(new Set(list));
}

/** Ordered candidate URLs for a single ayah by the chosen reciter (same voice). */
export function getAyahAudioCandidates(surahNumber: number, ayahNumber: number, reciter?: Reciter | null): string[] {
  const rec = reciter && reciter.everyayah ? reciter : DEFAULT_RECITER;
  const s = String(surahNumber).padStart(3, '0');
  const a = String(ayahNumber).padStart(3, '0');
  const list = [`https://everyayah.com/data/${rec.everyayah}/${s}${a}.mp3`];
  if (rec.id === DEFAULT_RECITER.id) {
    list.push(`https://cdn.islamic.network/quran/audio/128/ar.alafasy/${getGlobalAyahNumber(surahNumber, ayahNumber)}.mp3`);
  }
  return list;
}
