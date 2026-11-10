import { DesignStyleConfig, QuranFontConfig } from '../types';

export const DESIGN_STYLES: DesignStyleConfig[] = [
  { id: 'modern', nameAr: 'الأساسي (المحسّن)', nameEn: 'Classic Gold (default)', descAr: 'تصميمك الأصلي بألوانه الذهبية، بعد تحسين المسافات والخطوط والبطاقات. شريط تنقل سفلي.', descEn: 'Your original dark-gold app, polished.', badgeAr: 'الافتراضي', badgeEn: 'Default', icon: 'Sparkles' },
  { id: 'mushaf_page', nameAr: 'صفحة المصحف', nameEn: 'Mushaf Page', descAr: 'مثل المصحف الورقي: صفحات بإطار مزخرف، الآيات متصلة مع علامات ﴿ ﴾، رقم الصفحة والجزء، وفهرس سور كجدول. التنقل بشريط علوي.', descEn: 'Framed mushaf pages, inline ayahs, page numbers, index table, top tabs.', badgeAr: 'تراثي', badgeEn: 'Heritage', icon: 'BookOpen' },
  { id: 'cards', nameAr: 'الكروت الحديثة', nameEn: 'Modern Cards', descAr: 'كل آية بكرت لحالها بخط كبير وأزرار واضحة، وشاشة رئيسية بكروت كبيرة، وشريط تبويب عائم تحت.', descEn: 'One ayah per big card, card home, floating tab bar.', badgeAr: 'عصري', badgeEn: 'Modern', icon: 'LayoutTemplate' },
  { id: 'minimal', nameAr: 'القارئ البسيط', nameEn: 'Minimal Reader', descAr: 'شاشة كاملة للنص فقط بدون أزرار، اضغط لإظهار الأدوات واسحب يمين/يسار للتنقل بين السور. قائمة سور نصية بسيطة.', descEn: 'Full-screen text, hidden chrome, swipe between surahs.', badgeAr: 'تركيز', badgeEn: 'Focus', icon: 'Sparkles' },
  { id: 'grid', nameAr: 'لوحة المربعات', nameEn: 'Grid Dashboard', descAr: 'شاشة رئيسية بمربعات: السور، الأجزاء، الرقية، الأذكار، الصلاة… والسور كمربعات مرقمة، والقارئ مع شريط أرقام الآيات.', descEn: 'Tile dashboard home, square surah grid, ayah-number strip.', badgeAr: 'لوحة', badgeEn: 'Dashboard', icon: 'LayoutGrid' },
  { id: 'drawer', nameAr: 'القائمة الجانبية', nameEn: 'Side Drawer List', descAr: 'قائمة مرتبة حسب الأجزاء مع قائمة جانبية ☰ بدل الشريط السفلي، والقارئ على شكل أسطر مرقمة.', descEn: 'List grouped by juz, side drawer nav, numbered-line reader.', badgeAr: 'قائمة ☰', badgeEn: 'Drawer', icon: 'Menu' },
];

export const DESIGN_IDS = DESIGN_STYLES.map((d) => d.id);

export const QURAN_FONTS: QuranFontConfig[] = [
  {
    id: 'amiri_quran',
    nameAr: 'خط المصحف الأميري (Amiri Quran)',
    nameEn: 'Amiri Quran Calligraphy',
    fontFamily: "'Amiri Quran', 'Amiri', serif",
    descAr: 'خط المصحف الكلاسيكي المعتمد بضبط المصاحف والتشكيل القرآني المتراكب الأصيل.',
  },
  {
    id: 'scheherazade',
    nameAr: 'خط الرسم العثماني (Scheherazade New)',
    nameEn: 'Scheherazade Uthmanic Naskh',
    fontFamily: "'Scheherazade New', 'Amiri Quran', serif",
    descAr: 'خط نسخ قرآني دقيق وواضح جداً للرسم العثماني وعلامات الوقف والآيات.',
  },
  {
    id: 'noto_naskh',
    nameAr: 'خط النسخ الواضح (Noto Naskh Arabic)',
    nameEn: 'Noto Naskh Modern',
    fontFamily: "'Noto Naskh Arabic', 'Amiri Quran', serif",
    descAr: 'خط نسخ واضح عالي المقروئية على جميع الشاشات والهواتف بدقة فائقة.',
  },
  {
    id: 'reem_kufi',
    nameAr: 'الخط الكوفي المصحفي (Reem Kufi)',
    nameEn: 'Reem Kufi Calligraphy',
    fontFamily: "'Reem Kufi', 'Amiri', serif",
    descAr: 'خط مستوحى من الخطوط المصحفية القديمة والعناوين الإسلامية التاريخية.',
  },
  {
    id: 'amiri',
    nameAr: 'خط المطبعة الأميرية (Amiri Naskh)',
    nameEn: 'Amiri Classic Naskh',
    fontFamily: "'Amiri', serif",
    descAr: 'خط مطبعة بولاق التراثي الشهير برسمه المتناسق الأنيق.',
  },
];
