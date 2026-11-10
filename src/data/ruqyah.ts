// الرقية الشرعية — the verses are referenced by (surah, ayah) ONLY; their text is read at runtime
// from the bundled Tanzil quran-uthmani file (never typed by hand).
export interface RuqyahRange { surah: number; from: number; to: number }

export const RUQYAH_RANGES: RuqyahRange[] = [
  { surah: 1, from: 1, to: 7 },
  { surah: 2, from: 1, to: 5 },
  { surah: 2, from: 102, to: 102 },
  { surah: 2, from: 163, to: 164 },
  { surah: 2, from: 255, to: 255 },
  { surah: 2, from: 285, to: 286 },
  { surah: 3, from: 18, to: 19 },
  { surah: 7, from: 117, to: 122 },
  { surah: 10, from: 81, to: 82 },
  { surah: 20, from: 69, to: 69 },
  { surah: 23, from: 115, to: 118 },
  { surah: 37, from: 1, to: 10 },
  { surah: 46, from: 29, to: 32 },
  { surah: 55, from: 33, to: 36 },
  { surah: 59, from: 21, to: 24 },
  { surah: 72, from: 1, to: 9 },
  { surah: 112, from: 1, to: 4 },
  { surah: 113, from: 1, to: 5 },
  { surah: 114, from: 1, to: 6 },
];

export function ruqyahAyahList(): { surah: number; ayah: number }[] {
  const out: { surah: number; ayah: number }[] = [];
  for (const r of RUQYAH_RANGES) for (let a = r.from; a <= r.to; a++) out.push({ surah: r.surah, ayah: a });
  return out;
}

/** Prophetic ruqyah supplications — each copied verbatim (programmatically) from the sunnah.com page named in `url`,
 * fetched Nov 10, 2026. Do not edit the text. */
export interface RuqyahDua { text: string; source: string; url: string; note: string }
export const RUQYAH_DUAS: RuqyahDua[] = [
  { text: "بِاسْمِ اللَّهِ أَرْقِيكَ مِنْ كُلِّ شَىْءٍ يُؤْذِيكَ مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ اللَّهُ يَشْفِيكَ بِاسْمِ اللَّهِ أَرْقِيكَ", source: "صحيح مسلم ٢١٨٦", url: "https://sunnah.com/muslim:2186", note: "رقية جبريل عليه السلام للنبي ﷺ" },
  { text: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَاسَ، اشْفِهِ وَأَنْتَ الشَّافِي، لاَ شِفَاءَ إِلاَّ شِفَاؤُكَ، شِفَاءً لاَ يُغَادِرُ سَقَمًا", source: "صحيح البخاري ٥٧٤٣", url: "https://sunnah.com/bukhari:5743", note: "كان النبي ﷺ يعوّذ بعض أهله، يمسح بيده اليمنى ويقولها" },
  { text: "ضَعْ يَدَكَ عَلَى الَّذِي تَأَلَّمَ مِنْ جَسَدِكَ وَقُلْ بِاسْمِ اللَّهِ . ثَلاَثًا . وَقُلْ سَبْعَ مَرَّاتٍ أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ", source: "صحيح مسلم ٢٢٠٢", url: "https://sunnah.com/muslim:2202", note: "قالها النبي ﷺ لمن شكا وجعاً في جسده" },
  { text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لاَمَّةٍ", source: "صحيح البخاري ٣٣٧١", url: "https://sunnah.com/bukhari:3371", note: "كان النبي ﷺ يعوّذ بها الحسن والحسين" },
  { text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", source: "صحيح مسلم ٢٧٠٨", url: "https://sunnah.com/muslim:2708a", note: "من قالها حين ينزل منزلاً لم يضره شيء حتى يرتحل منه" },
];
