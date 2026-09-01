import { TafsirEdition } from '../types';

export const TAFSIR_EDITIONS: TafsirEdition[] = [
  // Arabic Tafasir
  {
    id: 'ar.muyassar',
    name: 'التفسير الميسر',
    author: 'مجمع الملك فهد لطباعة المصحف الشريف',
    language: 'ar',
    isTafsir: true,
    direction: 'rtl',
  },
  {
    id: 'ar.jalalayn',
    name: 'تفسير الجلالين',
    author: 'جلال الدين المحلي وجلال الدين السيوطي',
    language: 'ar',
    isTafsir: true,
    direction: 'rtl',
  },
  {
    id: 'ar.qurtubi',
    name: 'الجامع لأحكام القرآن (القرطبي)',
    author: 'الإمام القرطبي',
    language: 'ar',
    isTafsir: true,
    direction: 'rtl',
  },
  {
    id: 'ar.waseet',
    name: 'التفسير الوسيط',
    author: 'د. محمد سيد طنطاوي',
    language: 'ar',
    isTafsir: true,
    direction: 'rtl',
  },
  {
    id: 'ar.baghawi',
    name: 'معالم التنزيل (البغوي)',
    author: 'الإمام الحسين بن مسعود البغوي',
    language: 'ar',
    isTafsir: true,
    direction: 'rtl',
  },

  // English
  {
    id: 'en.sahih',
    name: 'Saheeh International',
    author: 'Saheeh International Quran Translation',
    language: 'en',
    isTafsir: false,
    direction: 'ltr',
  },
  {
    id: 'en.asad',
    name: 'The Message of The Quran',
    author: 'Muhammad Asad with commentary',
    language: 'en',
    isTafsir: true,
    direction: 'ltr',
  },
  {
    id: 'en.hilali',
    name: 'Noble Quran Translation & Tafsir',
    author: 'Dr. Muhammad Taqi-ud-Din Al-Hilali & Dr. Muhammad Muhsin Khan',
    language: 'en',
    isTafsir: true,
    direction: 'ltr',
  },
  {
    id: 'en.pickthall',
    name: 'Meaning of the Glorious Quran',
    author: 'Mohammed Marmaduke William Pickthall',
    language: 'en',
    isTafsir: false,
    direction: 'ltr',
  },

  // French (Français)
  {
    id: 'fr.hamidullah',
    name: 'Le Saint Coran et la Traduction',
    author: 'Dr. Muhammad Hamidullah',
    language: 'fr',
    isTafsir: false,
    direction: 'ltr',
  },

  // Turkish (Türkçe)
  {
    id: 'tr.diyanet',
    name: 'Kur\'an-ı Kerim Meali',
    author: 'T.C. Diyanet İşleri Başkanlığı',
    language: 'tr',
    isTafsir: false,
    direction: 'ltr',
  },
  {
    id: 'tr.yazir',
    name: 'Hak Dini Kur\'an Dili (Tefsirli Meal)',
    author: 'Elmalılı Muhammed Hamdi Yazır',
    language: 'tr',
    isTafsir: true,
    direction: 'ltr',
  },

  // Urdu (اردو)
  {
    id: 'ur.jalandhry',
    name: 'ترجمہ قرآن مجید',
    author: 'مولانا فتح محمد جالندھری',
    language: 'ur',
    isTafsir: false,
    direction: 'rtl',
  },
  {
    id: 'ur.maududi',
    name: 'تفہيم القرآن (تفسیر و ترجمہ)',
    author: 'مولانا سید ابو الاعلی مودودی',
    language: 'ur',
    isTafsir: true,
    direction: 'rtl',
  },
  {
    id: 'ur.kanzuliman',
    name: 'كنز الإيمان في ترجمة القرآن',
    author: 'الإمام أحمد رضا خان القادري',
    language: 'ur',
    isTafsir: false,
    direction: 'rtl',
  },

  // Indonesian (Bahasa Indonesia)
  {
    id: 'id.indonesian',
    name: 'Al-Qur\'an dan Terjemahannya',
    author: 'Kementerian Agama Republik Indonesia (Kemenag)',
    language: 'id',
    isTafsir: false,
    direction: 'ltr',
  },
  {
    id: 'id.jalalayn',
    name: 'Tafsir Jalalain Bahasa Indonesia',
    author: 'Jalaluddin al-Mahalli & Jalaluddin as-Suyuthi (Indo)',
    language: 'id',
    isTafsir: true,
    direction: 'ltr',
  },

  // Persian / Farsi (فارسی)
  {
    id: 'fa.ansarian',
    name: 'ترجمه و شرح قرآن کریم',
    author: 'استاد حسین انصاریان',
    language: 'fa',
    isTafsir: false,
    direction: 'rtl',
  },
  {
    id: 'fa.makarem',
    name: 'تفسیر نمونه و روان',
    author: 'آیت الله ناصر مکارم شیرازی',
    language: 'fa',
    isTafsir: true,
    direction: 'rtl',
  },

  // German (Deutsch)
  {
    id: 'de.bubenheim',
    name: 'Übersetzung des Edlen Qur\'an',
    author: 'Frank Bubenheim und Dr. Nadeem Elyas',
    language: 'de',
    isTafsir: false,
    direction: 'ltr',
  },

  // Spanish (Español)
  {
    id: 'es.cortes',
    name: 'El Sagrado Corán (Traducción)',
    author: 'Julio Cortés',
    language: 'es',
    isTafsir: false,
    direction: 'ltr',
  },

  // Russian (Русский)
  {
    id: 'ru.kuliev',
    name: 'Перевод смыслов Священного Корана',
    author: 'Эльмир Кулиев',
    language: 'ru',
    isTafsir: false,
    direction: 'ltr',
  },

  // Bengali (বাংলা)
  {
    id: 'bn.bengali',
    name: 'পবিত্র কোরআনুল করীম বাংলা অনুবাদ',
    author: 'মুহিউদ্দীন খান',
    language: 'bn',
    isTafsir: false,
    direction: 'ltr',
  },

  // Chinese (中文)
  {
    id: 'zh.jian',
    name: '古兰经汉译',
    author: '马坚 (Ma Jian)',
    language: 'zh',
    isTafsir: false,
    direction: 'ltr',
  },

  // Hindi (हिन्दी)
  {
    id: 'hi.hindi',
    name: 'क़ुरआन मजीद का हिंदी अनुवाद',
    author: 'मुहम्मद फ़ारूक़ ख़ान और अहमद',
    language: 'hi',
    isTafsir: false,
    direction: 'ltr',
  },
];

export function getDefaultEditionForLang(lang: string): string {
  const matching = TAFSIR_EDITIONS.find((e) => e.language === lang);
  if (matching) return matching.id;
  return 'ar.muyassar';
}

export function getEditionDetails(editionId: string): TafsirEdition {
  return (
    TAFSIR_EDITIONS.find((e) => e.id === editionId) || TAFSIR_EDITIONS[0]
  );
}

// In-memory cache for fast fetching without duplicate network requests
const tafsirCache = new Map<string, string>();

export async function fetchAyahTafsirOrTranslation(
  surahNumber: number,
  ayahNumber: number,
  editionId: string = 'ar.muyassar'
): Promise<{ text: string; edition: TafsirEdition }> {
  const cacheKey = `${surahNumber}:${ayahNumber}:${editionId}`;
  const edition = getEditionDetails(editionId);

  if (tafsirCache.has(cacheKey)) {
    return { text: tafsirCache.get(cacheKey)!, edition };
  }

  try {
    const res = await fetch(
      `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/${editionId}`
    );
    const data = await res.json();

    if (data.code === 200 && data.data && data.data.text) {
      tafsirCache.set(cacheKey, data.data.text);
      return { text: data.data.text, edition };
    }
  } catch (err) {
    console.warn('Primary Tafsir fetch failed, trying fallback:', err);
  }

  // Fallback to ar.muyassar or en.sahih
  try {
    const fallbackId = editionId.startsWith('ar.') ? 'ar.muyassar' : 'en.sahih';
    const res2 = await fetch(
      `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/${fallbackId}`
    );
    const data2 = await res2.json();
    if (data2.code === 200 && data2.data && data2.data.text) {
      const fbEdition = getEditionDetails(fallbackId);
      return { text: data2.data.text, edition: fbEdition };
    }
  } catch {}

  throw new Error('Failed to load tafsir');
}
