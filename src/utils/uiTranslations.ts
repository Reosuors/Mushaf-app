// Comprehensive UI translations helper for all supported languages
// Ensures no language ever falls back to only English/Arabic ternaries

export interface LocalizedUIStrings {
  // Adhan Settings
  adhanSettingsTitle: string;
  adhanSettingsSubtitle: string;
  adhanEnableAlerts: string;
  adhanAlertsActive: string;
  adhanAlertsDisabled: string;
  adhanPermissionRequired: string;
  adhanAllowPermission: string;
  adhanPermissionGranted: string;
  adhanSoundChoice: string;
  adhanSoundChoiceSub: string;
  adhanTakbeerName: string;
  adhanTakbeerDesc: string;
  adhanFullName: string;
  adhanFullDesc: string;
  adhanCustomName: string;
  adhanCustomDesc: string;
  adhanSilentName: string;
  adhanSilentDesc: string;
  adhanUploadBtn: string;
  adhanCurrentFile: string;
  adhanVolume: string;
  adhanPrayersToAlert: string;
  adhanTestBtn: string;
  adhanBannerTitle: string;
  adhanDuaaTitle: string;
  adhanDuaaShow: string;
  adhanStopClose: string;
  adhanTestNotificationTitle: string;
  adhanTestNotificationBody: string;

  // Qibla Compass
  qiblaTitle: string;
  qiblaFacingKaaba: string;
  qiblaKmToMecca: string;
  qiblaEnableSensor: string;
  qiblaBearing: string;
  qiblaDeviation: string;
  qiblaCorrectDirection: string;
  qiblaCoordinates: string;
  qiblaKaabaCoords: string;
  qiblaSensorStatus: string;
  qiblaManualSim: string;
  qiblaSensorActive: string;
  qiblaSimulated: string;
  qiblaManualSlider: string;

  // Reading Progress & Khatma
  quranCompletion: string;
  surahsCompleted: string;
  ayahsRemaining: string;
  dailyGoal: string;
  ayahsUnit: string;
  streak: string;
  daysUnit: string;
  keepItUp: string;
  khatmas: string;
  completedKhatma: string;
  mashaAllah: string;
  lastReadPos: string;
  resume: string;
  bookmarks: string;
  goToAyah: string;
  deleteBookmark: string;

  // Offline Manager & Quran
  offlineManagerTitle: string;
  offlineAllSurahs: string;
  offlineSaved: string;
  offlineDownloadAll: string;
  offlineDownloading: string;
  offlineCompletedBadge: string;
  offlineSavedBadge: string;
  offlineNoSurahsYet: string;
  offlineTabAll: string;
  offlineTabSaved: string;

  // Smart Search
  smartSearchTitle: string;
  smartSearchPh: string;
  smartSearchBtn: string;
  smartSearchIdeas: string;
  smartSearching: string;
  smartSearchNoResults: string;
  smartSearchTip: string;
  smartSearchClosestMatch: string;
  smartSearchOpenQuran: string;

  // TopBar & Network
  statusOnline: string;
  statusOffline: string;
  tooltipOfflineManager: string;
  tooltipSearch: string;
  tooltipThemes: string;
  tooltipLanguages: string;
}

const UI_TRANSLATIONS: Record<string, Partial<LocalizedUIStrings>> = {
  ar: {
    adhanSettingsTitle: 'إعدادات الأذان والتنبيهات',
    adhanSettingsSubtitle: 'صوت التكبير والأذان عند حلول وقت الصلاة',
    adhanEnableAlerts: 'تفعيل تنبيهات وقت الصلاة',
    adhanAlertsActive: 'التنبيهات مفعلة عند دخول الوقت',
    adhanAlertsDisabled: 'التنبيهات معطلة حالياً',
    adhanPermissionRequired: 'يتطلب إرسال الإشعارات إذناً من المتصفح.',
    adhanAllowPermission: 'منح الإذن',
    adhanPermissionGranted: 'إشعارات المتصفح مفعلة ومصرحة ✓',
    adhanSoundChoice: 'نغمة وصوت الأذان المطلوب',
    adhanSoundChoiceSub: 'اختر التكبير أو الأذان الكامل أو ملف مخصص',
    adhanTakbeerName: 'صوت التكبيرتين (الله أكبر الله أكبر)',
    adhanTakbeerDesc: 'صوت التكبيرتين المختصر (4 ثوانٍ) عند دخول وقت الصلاة',
    adhanFullName: 'الأذان الكامل (النداء كاملاً)',
    adhanFullDesc: 'الأذان كاملاً بصوت ندي خاشع لجميع فقرات الأذان',
    adhanCustomName: 'ملف صوتي مخصص من جهازك',
    adhanCustomDesc: 'تشغيل ملف صوتي مخصص قمت باختياره أو رفعه',
    adhanSilentName: 'إشعار صامت (بدون صوت)',
    adhanSilentDesc: 'إشعار مرئي فقط على الشاشة بدون تشغيل صوت',
    adhanUploadBtn: 'رفع ملف',
    adhanCurrentFile: 'الملف الحالي:',
    adhanVolume: 'مستوى صوت الأذان',
    adhanPrayersToAlert: 'الصلوات المشمولة بالتنبيه',
    adhanTestBtn: 'تجربة إشعار وصوت الأذان الآن',
    adhanBannerTitle: 'حان الآن موعد الأذان',
    adhanDuaaTitle: 'دعاء ما بعد الأذان المستحب:',
    adhanDuaaShow: 'عرض دعاء ما بعد الأذان',
    adhanStopClose: 'إيقاف الصوت وإغلاق',
    adhanTestNotificationTitle: '🕌 تجربة إشعار الأذان',
    adhanTestNotificationBody: 'الله أكبر، الله أكبر... حان الآن موعد الصلاة',

    qiblaTitle: 'اتجاه القبلة',
    qiblaFacingKaaba: 'باتجاه الكعبة!',
    qiblaKmToMecca: 'كم إلى مكة',
    qiblaEnableSensor: 'تفعيل البوصلة',
    qiblaBearing: 'اتجاه القبلة:',
    qiblaDeviation: 'الانحراف:',
    qiblaCorrectDirection: 'أنت الآن في الاتجاه الصحيح تماماً نحو الكعبة المشرفة',
    qiblaCoordinates: 'إحداثياتك',
    qiblaKaabaCoords: 'إحداثيات الكعبة',
    qiblaSensorStatus: 'حالة الحساس',
    qiblaManualSim: 'محاكاة يدوية',
    qiblaSensorActive: 'حساس مغناطيسي نشط',
    qiblaSimulated: 'غير متاح (محاكاة)',
    qiblaManualSlider: 'محاكاة تدوير الجهاز يدوياً:',

    quranCompletion: 'نسبة إنجاز المصحف الشريف:',
    surahsCompleted: 'سورة مكتملة',
    ayahsRemaining: 'آية متبقية',
    dailyGoal: 'ورد اليوم',
    ayahsUnit: 'آية',
    streak: 'الاستمرار',
    daysUnit: 'أيام متتالية',
    keepItUp: 'حافظ على وردك',
    khatmas: 'الختمات',
    completedKhatma: 'ختمة تامة',
    mashaAllah: 'تقبل الله',
    lastReadPos: 'آخر موضع قراءة',
    resume: 'متابعة',
    bookmarks: 'العلامات المرجعية',
    goToAyah: 'انتقل إلى الآية',
    deleteBookmark: 'حذف العلامة',

    offlineManagerTitle: 'إدارة التنزيلات ووضع عدم الاتصال',
    offlineAllSurahs: 'جميع السور (114)',
    offlineSaved: 'المحفوظة بدون إنترنت',
    offlineDownloadAll: 'تحميل الكل ⚡',
    offlineDownloading: 'جاري التحميل...',
    offlineCompletedBadge: 'تمت قراءتها في الختمة',
    offlineSavedBadge: 'محفوظة أوفلاين',
    offlineNoSurahsYet: 'لا توجد سور محفوظة بدون إنترنت بعد. يمكنك تحميل السور بسهولة.',
    offlineTabAll: 'جميع السور (114)',
    offlineTabSaved: 'المحفوظة بدون إنترنت',

    smartSearchTitle: 'البحث الذكي في القرآن الكريم',
    smartSearchPh: 'اكتب أي كلمة أو آية بدون تشكيل...',
    smartSearchBtn: 'بحث ذكي',
    smartSearchIdeas: 'نماذج بحث سريعة:',
    smartSearching: 'جاري البحث الذكي ومطابقة الآيات...',
    smartSearchNoResults: 'لم نتمكن من العثور على آيات مطابقة للبحث.',
    smartSearchTip: 'جرب البحث بكلمة واحدة أو عبارة رئيسية من الآية.',
    smartSearchClosestMatch: 'أقرب تطابق',
    smartSearchOpenQuran: 'فتح في المصحف',

    statusOnline: 'متصل بالإنترنت',
    statusOffline: 'وضع عدم الاتصال (Offline)',
    tooltipOfflineManager: 'تحميل السور والأوفلاين',
    tooltipSearch: 'البحث الذكي',
    tooltipThemes: 'المظهر والألوان',
    tooltipLanguages: 'اللغة',
  },

  en: {
    adhanSettingsTitle: 'Adhan & Prayer Notifications',
    adhanSettingsSubtitle: 'Play Adhan audio at prayer time',
    adhanEnableAlerts: 'Enable Prayer Alerts',
    adhanAlertsActive: 'Alerts active at prayer time',
    adhanAlertsDisabled: 'Alerts currently disabled',
    adhanPermissionRequired: 'Notifications require browser permission.',
    adhanAllowPermission: 'Allow',
    adhanPermissionGranted: 'Browser notifications granted ✓',
    adhanSoundChoice: 'Selected Adhan Sound',
    adhanSoundChoiceSub: 'Choose Takbeer, Full Adhan, or Custom file',
    adhanTakbeerName: 'Takbeerat (Allahu Akbar Allahu Akbar)',
    adhanTakbeerDesc: 'Short 4-second Takbeerat alert for prayer time',
    adhanFullName: 'Full Adhan (Call to Prayer)',
    adhanFullDesc: 'Full melodic Adhan call to prayer (~2.5 min)',
    adhanCustomName: 'Custom Audio File (From Device)',
    adhanCustomDesc: 'Play a custom local MP3 file of your choice',
    adhanSilentName: 'Silent Notification (No Sound)',
    adhanSilentDesc: 'Visual notification only with no audio playback',
    adhanUploadBtn: 'Upload',
    adhanCurrentFile: 'Current file:',
    adhanVolume: 'Adhan Volume',
    adhanPrayersToAlert: 'Prayers to Alert',
    adhanTestBtn: 'Test Prayer Alert & Adhan Now',
    adhanBannerTitle: 'Call to Prayer',
    adhanDuaaTitle: 'Supplication after Adhan:',
    adhanDuaaShow: 'Show Duaa After Adhan',
    adhanStopClose: 'Stop & Close',
    adhanTestNotificationTitle: '🕌 Test Prayer Notification',
    adhanTestNotificationBody: 'Allahu Akbar, Allahu Akbar... It is time for prayer',

    qiblaTitle: 'Qibla Direction',
    qiblaFacingKaaba: 'Facing Kaaba!',
    qiblaKmToMecca: 'km to Mecca',
    qiblaEnableSensor: 'Enable Sensor',
    qiblaBearing: 'Qibla Bearing:',
    qiblaDeviation: 'Deviation:',
    qiblaCorrectDirection: 'You are now facing directly towards the Holy Kaaba',
    qiblaCoordinates: 'Your Coordinates',
    qiblaKaabaCoords: 'Kaaba Coordinates',
    qiblaSensorStatus: 'Sensor Status',
    qiblaManualSim: 'Manual',
    qiblaSensorActive: 'Magnetometer Active',
    qiblaSimulated: 'Desktop/Simulated',
    qiblaManualSlider: 'Manual Device Heading Slider:',

    quranCompletion: 'Overall Quran Completion:',
    surahsCompleted: 'Surahs completed',
    ayahsRemaining: 'Ayahs remaining',
    dailyGoal: 'Daily Goal',
    ayahsUnit: 'Ayahs',
    streak: 'Streak',
    daysUnit: 'Days',
    keepItUp: 'Keep it up!',
    khatmas: 'Khatmas',
    completedKhatma: 'Completed',
    mashaAllah: 'MashaAllah',
    lastReadPos: 'Last Read Position',
    resume: 'Resume',
    bookmarks: 'Bookmarks',
    goToAyah: 'Go to Ayah',
    deleteBookmark: 'Delete Bookmark',

    offlineManagerTitle: 'Offline Downloads Manager',
    offlineAllSurahs: 'All Surahs (114)',
    offlineSaved: 'Saved Offline',
    offlineDownloadAll: 'Download All ⚡',
    offlineDownloading: 'Downloading...',
    offlineCompletedBadge: 'Completed in Khatma',
    offlineSavedBadge: 'Saved offline',
    offlineNoSurahsYet: 'No offline surahs yet. You can download all surahs with one tap.',
    offlineTabAll: 'All Surahs (114)',
    offlineTabSaved: 'Saved Offline',

    smartSearchTitle: 'Smart Quran Search',
    smartSearchPh: 'Type words or verses without diacritics...',
    smartSearchBtn: 'Search',
    smartSearchIdeas: 'Quick search ideas:',
    smartSearching: 'Searching Quran verses...',
    smartSearchNoResults: 'No matching verses found.',
    smartSearchTip: 'Try searching with a single key word.',
    smartSearchClosestMatch: 'Closest match',
    smartSearchOpenQuran: 'Open in Quran',

    statusOnline: 'Online',
    statusOffline: 'Offline mode',
    tooltipOfflineManager: 'Offline Manager',
    tooltipSearch: 'Smart Search',
    tooltipThemes: 'Theme & Colors',
    tooltipLanguages: 'Language',
  },

  fr: {
    adhanSettingsTitle: 'Paramètres de l\'Adhan et Notifications',
    adhanSettingsSubtitle: 'Écoutez l\'Adhan à l\'heure de la prière',
    adhanEnableAlerts: 'Activer les alertes de prière',
    adhanAlertsActive: 'Alertes actives à l\'heure de la prière',
    adhanAlertsDisabled: 'Alertes actuellement désactivées',
    adhanPermissionRequired: 'Les notifications nécessitent l\'autorisation du navigateur.',
    adhanAllowPermission: 'Autoriser',
    adhanPermissionGranted: 'Notifications autorisées ✓',
    adhanSoundChoice: 'Son de l\'Adhan sélectionné',
    adhanSoundChoiceSub: 'Choisissez Takbîr, Adhan complet ou fichier personnalisé',
    adhanTakbeerName: 'Takbîr (Allahu Akbar Allahu Akbar)',
    adhanTakbeerDesc: 'Alerte courte de 4 secondes pour l\'heure de la prière',
    adhanFullName: 'Adhan Complet (Appel à la prière)',
    adhanFullDesc: 'Appel complet et mélodieux à la prière (~2.5 min)',
    adhanCustomName: 'Fichier Audio Personnalisé (Appareil)',
    adhanCustomDesc: 'Jouez un fichier MP3 local de votre choix',
    adhanSilentName: 'Notification Silencieuse (Sans son)',
    adhanSilentDesc: 'Notification visuelle sans aucun son',
    adhanUploadBtn: 'Téléverser',
    adhanCurrentFile: 'Fichier actuel :',
    adhanVolume: 'Volume de l\'Adhan',
    adhanPrayersToAlert: 'Prières concernées',
    adhanTestBtn: 'Tester l\'alerte et l\'Adhan maintenant',
    adhanBannerTitle: 'C\'est l\'heure de la prière',
    adhanDuaaTitle: 'Invocation après l\'Adhan :',
    adhanDuaaShow: 'Afficher l\'invocation après l\'Adhan',
    adhanStopClose: 'Arrêter et fermer',
    adhanTestNotificationTitle: '🕌 Test de notification de prière',
    adhanTestNotificationBody: 'Allahu Akbar, Allahu Akbar... C\'est l\'heure de la prière',

    qiblaTitle: 'Direction de la Qibla',
    qiblaFacingKaaba: 'Face à la Kaaba !',
    qiblaKmToMecca: 'km jusqu\'à La Mecque',
    qiblaEnableSensor: 'Activer la boussole',
    qiblaBearing: 'Direction Qibla :',
    qiblaDeviation: 'Déviation :',
    qiblaCorrectDirection: 'Vous faites maintenant directement face à la Sainte Kaaba',
    qiblaCoordinates: 'Vos coordonnées',
    qiblaKaabaCoords: 'Coordonnées de la Kaaba',
    qiblaSensorStatus: 'État du capteur',
    qiblaManualSim: 'Manuel',
    qiblaSensorActive: 'Capteur magnétique actif',
    qiblaSimulated: 'Simulé',
    qiblaManualSlider: 'Curseur manuel d\'orientation :',

    quranCompletion: 'Progression globale du Coran :',
    surahsCompleted: 'sourates terminées',
    ayahsRemaining: 'versets restants',
    dailyGoal: 'Objectif quotidien',
    ayahsUnit: 'versets',
    streak: 'Régularité',
    daysUnit: 'jours',
    keepItUp: 'Continuez ainsi !',
    khatmas: 'Khatmas',
    completedKhatma: 'Terminé',
    mashaAllah: 'MashaAllah',
    lastReadPos: 'Dernière lecture',
    resume: 'Reprendre',
    bookmarks: 'Signets',
    goToAyah: 'Aller au verset',
    deleteBookmark: 'Supprimer',

    offlineManagerTitle: 'Gestionnaire Hors-Ligne',
    offlineAllSurahs: 'Toutes les sourates (114)',
    offlineSaved: 'Enregistrées hors-ligne',
    offlineDownloadAll: 'Tout télécharger ⚡',
    offlineDownloading: 'Téléchargement...',
    offlineCompletedBadge: 'Lu dans la Khatma',
    offlineSavedBadge: 'Hors-ligne',
    offlineNoSurahsYet: 'Aucune sourate enregistrée. Téléchargez-les en un clic.',
    offlineTabAll: 'Toutes les sourates (114)',
    offlineTabSaved: 'Enregistrées hors-ligne',

    smartSearchTitle: 'Recherche Intelligente dans le Coran',
    smartSearchPh: 'Tapez des mots ou versets sans accents...',
    smartSearchBtn: 'Rechercher',
    smartSearchIdeas: 'Idées de recherche :',
    smartSearching: 'Recherche des versets...',
    smartSearchNoResults: 'Aucun verset correspondant.',
    smartSearchTip: 'Essayez avec un mot-clé unique.',
    smartSearchClosestMatch: 'Meilleure correspondance',
    smartSearchOpenQuran: 'Ouvrir dans le Coran',

    statusOnline: 'En ligne',
    statusOffline: 'Mode hors-ligne',
    tooltipOfflineManager: 'Gestionnaire hors-ligne',
    tooltipSearch: 'Recherche intelligente',
    tooltipThemes: 'Thèmes & Couleurs',
    tooltipLanguages: 'Langue',
  },

  tr: {
    adhanSettingsTitle: 'Ezan ve Bildirim Ayarları',
    adhanSettingsSubtitle: 'Namaz vaktinde ezan sesini çal',
    adhanEnableAlerts: 'Namaz Vakti Bildirimlerini Aç',
    adhanAlertsActive: 'Vakit girdiğinde bildirimler açık',
    adhanAlertsDisabled: 'Bildirimler şu an kapalı',
    adhanPermissionRequired: 'Bildirimler için tarayıcı izni gerekiyor.',
    adhanAllowPermission: 'İzin Ver',
    adhanPermissionGranted: 'Bildirim izni verildi ✓',
    adhanSoundChoice: 'Seçilen Ezan Sesi',
    adhanSoundChoiceSub: 'Tekbir, Tam Ezan veya Özel dosya seçin',
    adhanTakbeerName: 'Tekbir (Allahu Ekber Allahu Ekber)',
    adhanTakbeerDesc: 'Namaz vakti için 4 saniyelik kısa tekbir uyarısı',
    adhanFullName: 'Tam Ezan (Namaz Çağrısı)',
    adhanFullDesc: 'Tüm ezan sözleriyle tam makamlı ezan (~2.5 dk)',
    adhanCustomName: 'Özel Ses Dosyası (Cihazdan Yükle)',
    adhanCustomDesc: 'Cihazınızdan seçtiğiniz özel bir MP3 dosyasını çalın',
    adhanSilentName: 'Sessiz Bildirim (Ses Yok)',
    adhanSilentDesc: 'Ses çalmadan yalnızca ekranda bildirim göster',
    adhanUploadBtn: 'Dosya Yükle',
    adhanCurrentFile: 'Mevcut dosya:',
    adhanVolume: 'Ezan Ses Seviyesi',
    adhanPrayersToAlert: 'Bildirim Verilecek Vakitler',
    adhanTestBtn: 'Ezanı ve Bildirimi Şimdi Test Et',
    adhanBannerTitle: 'Namaz Vakti Girdi',
    adhanDuaaTitle: 'Ezan Sonrası Dua:',
    adhanDuaaShow: 'Ezan Duasını Göster',
    adhanStopClose: 'Sesi Durdur ve Kapat',
    adhanTestNotificationTitle: '🕌 Namaz Bildirimi Testi',
    adhanTestNotificationBody: 'Allahu Ekber, Allahu Ekber... Namaz vakti girdi',

    qiblaTitle: 'Kıble Yönü',
    qiblaFacingKaaba: 'Kâbe Yönündesiniz!',
    qiblaKmToMecca: 'km Mekke\'ye',
    qiblaEnableSensor: 'Pusulayı Etkinleştir',
    qiblaBearing: 'Kıble Açısı:',
    qiblaDeviation: 'Sapma:',
    qiblaCorrectDirection: 'Şu an tam olarak Kâbe-i Muazzama yönündesiniz',
    qiblaCoordinates: 'Konumunuz',
    qiblaKaabaCoords: 'Kâbe Konumu',
    qiblaSensorStatus: 'Sensör Durumu',
    qiblaManualSim: 'Manuel',
    qiblaSensorActive: 'Manyetik Sensör Aktif',
    qiblaSimulated: 'Simülasyon',
    qiblaManualSlider: 'Manuel Yön Kaydırıcısı:',

    quranCompletion: 'Kuran-ı Kerim Hatim İlerlemesi:',
    surahsCompleted: 'sure tamamlandı',
    ayahsRemaining: 'ayet kaldı',
    dailyGoal: 'Günlük Vird',
    ayahsUnit: 'Ayet',
    streak: 'Süreklilik',
    daysUnit: 'Gün',
    keepItUp: 'Aynen devam edin!',
    khatmas: 'Hatimler',
    completedKhatma: 'Tamamlandı',
    mashaAllah: 'Maşallah',
    lastReadPos: 'Son Okunan Yer',
    resume: 'Devam Et',
    bookmarks: 'Yer İmleri',
    goToAyah: 'Ayete Git',
    deleteBookmark: 'Sil',

    offlineManagerTitle: 'Çevrimdışı İndirme Yöneticisi',
    offlineAllSurahs: 'Tüm Sureler (114)',
    offlineSaved: 'Çevrimdışı Kaydedilenler',
    offlineDownloadAll: 'Tümünü İndir ⚡',
    offlineDownloading: 'İndiriliyor...',
    offlineCompletedBadge: 'Hatimde Okundu',
    offlineSavedBadge: 'Çevrimdışı',
    offlineNoSurahsYet: 'Henüz indirilmiş sure yok. Tek dokunuşla tümünü indirebilirsiniz.',
    offlineTabAll: 'Tüm Sureler (114)',
    offlineTabSaved: 'Çevrimdışı Kaydedilenler',

    smartSearchTitle: 'Akıllı Kuran Arama',
    smartSearchPh: 'Harekeli veya harekesiz arayın...',
    smartSearchBtn: 'Ara',
    smartSearchIdeas: 'Örnek aramalar:',
    smartSearching: 'Ayetler aranıyor...',
    smartSearchNoResults: 'Eşleşen ayet bulunamadı.',
    smartSearchTip: 'Tek bir anahtar kelimeyle aramayı deneyin.',
    smartSearchClosestMatch: 'En yakın eşleşme',
    smartSearchOpenQuran: 'Kuran\'da Aç',

    statusOnline: 'Çevrimiçi',
    statusOffline: 'Çevrimdışı mod',
    tooltipOfflineManager: 'İndirme Yöneticisi',
    tooltipSearch: 'Akıllı Arama',
    tooltipThemes: 'Tema & Renkler',
    tooltipLanguages: 'Dil',
  },

  ur: {
    adhanSettingsTitle: 'اذان اور اوقات نماز کی ترتیبات',
    adhanSettingsSubtitle: 'نماز کے وقت تکبیر اور اذان کی آواز',
    adhanEnableAlerts: 'اوقات نماز کے نوٹیفیکیشن فعال کریں',
    adhanAlertsActive: 'وقت داخل ہونے پر الرٹ فعال ہیں',
    adhanAlertsDisabled: 'الرٹس فی الحال غیر فعال ہیں',
    adhanPermissionRequired: 'نوٹیفیکیشن کے لیے براؤزر کی اجازت درکار ہے۔',
    adhanAllowPermission: 'اجازت دیں',
    adhanPermissionGranted: 'براؤزر نوٹیفیکیشن کی اجازت مل گئی ✓',
    adhanSoundChoice: 'اذان کی منتخب آواز',
    adhanSoundChoiceSub: 'تکبیرات، مکمل اذان یا اپنی فائل منتخب کریں',
    adhanTakbeerName: 'صوت التکبیرتین (اللہ اکبر اللہ اکبر)',
    adhanTakbeerDesc: 'نماز کے وقت کے لیے 4 سیکنڈ کی مختصر تکبیرات الرٹ',
    adhanFullName: 'مکمل اذان (پوری اذان)',
    adhanFullDesc: 'تمام کلمات کے ساتھ مکمل اور خوبصورت اذان (~2.5 منٹ)',
    adhanCustomName: 'ڈیوائس سے اپنی پسند کی آڈیو فائل',
    adhanCustomDesc: 'اپنی پسند کی کوئی بھی MP3 فائل چلائیں',
    adhanSilentName: 'خاموش نوٹیفیکیشن (بغیر آواز)',
    adhanSilentDesc: 'بغیر آواز کے صرف اسکرین پر نوٹیفیکیشن',
    adhanUploadBtn: 'فائل اپلوڈ کریں',
    adhanCurrentFile: 'موجودہ فائل:',
    adhanVolume: 'اذان کی آواز کا درجہ',
    adhanPrayersToAlert: 'شامل نمازیں',
    adhanTestBtn: 'اذان اور الرٹ کی ابھی جانچ کریں',
    adhanBannerTitle: 'نماز کا وقت ہو گیا ہے',
    adhanDuaaTitle: 'اذان کے بعد کی مسنون دعا:',
    adhanDuaaShow: 'اذان کے بعد کی دعا دیکھیں',
    adhanStopClose: 'آواز بند کریں اور بند کریں',
    adhanTestNotificationTitle: '🕌 اذان نوٹیفیکیشن ٹیسٹ',
    adhanTestNotificationBody: 'اللہ اکبر، اللہ اکبر... نماز کا وقت ہو گیا ہے',

    qiblaTitle: 'قبلہ رخ',
    qiblaFacingKaaba: 'قبلہ کی سمت!',
    qiblaKmToMecca: 'کلومیٹر مکہ تک',
    qiblaEnableSensor: 'قطب نما فعال کریں',
    qiblaBearing: 'قبلہ کا زاویہ:',
    qiblaDeviation: 'انحراف:',
    qiblaCorrectDirection: 'آپ بالکل کعبہ شریف کے سامنے ہیں',
    qiblaCoordinates: 'آپ کا مقام',
    qiblaKaabaCoords: 'کعبہ کا مقام',
    qiblaSensorStatus: 'سینسر کی حالت',
    qiblaManualSim: 'دستی',
    qiblaSensorActive: 'مقناطیسی سینسر فعال',
    qiblaSimulated: 'نقلی',
    qiblaManualSlider: 'دستی سمت سلائیڈر:',

    quranCompletion: 'مکمل قرآن مجید کی پیشرفت:',
    surahsCompleted: 'سورتیں مکمل',
    ayahsRemaining: 'آیات باقی',
    dailyGoal: 'روزانہ کا ورد',
    ayahsUnit: 'آیات',
    streak: 'تسلسل',
    daysUnit: 'دن',
    keepItUp: 'جاری رکھیں!',
    khatmas: 'ختمات',
    completedKhatma: 'مکمل',
    mashaAllah: 'ما شاء اللہ',
    lastReadPos: 'آخری پڑھی گئی جگہ',
    resume: 'جاری رکھیں',
    bookmarks: 'نشانات',
    goToAyah: 'آیت پر جائیں',
    deleteBookmark: 'حذف کریں',

    offlineManagerTitle: 'آف لائن ڈاؤنلوڈ مینیجر',
    offlineAllSurahs: 'تمام سورتیں (114)',
    offlineSaved: 'آف لائن محفوظ',
    offlineDownloadAll: 'سب ڈاؤنلوڈ کریں ⚡',
    offlineDownloading: 'ڈاؤنلوڈ ہو رہا ہے...',
    offlineCompletedBadge: 'ختم قرآن میں شامل',
    offlineSavedBadge: 'آف لائن محفوظ',
    offlineNoSurahsYet: 'ابھی تک کوئی سورت آف لائن محفوظ نہیں ہے۔',
    offlineTabAll: 'تمام سورتیں (114)',
    offlineTabSaved: 'آف لائن محفوظ',

    smartSearchTitle: 'قرآن مجید میں اسمارٹ تلاش',
    smartSearchPh: 'بغیر اعراب کے کوئی بھی لفظ یا آیت لکھیں...',
    smartSearchBtn: 'تلاش',
    smartSearchIdeas: 'نمونہ تلاش:',
    smartSearching: 'آیات تلاش ہو رہی ہیں...',
    smartSearchNoResults: 'کوئی آیت نہیں ملی۔',
    smartSearchTip: 'ایک اہم لفظ کے ساتھ تلاش کریں۔',
    smartSearchClosestMatch: 'قریب ترین مطابقت',
    smartSearchOpenQuran: 'قرآن میں کھولیں',

    statusOnline: 'آن لائن',
    statusOffline: 'آف لائن موڈ',
    tooltipOfflineManager: 'آف لائن مینیجر',
    tooltipSearch: 'اسمارٹ تلاش',
    tooltipThemes: 'تھیمز اور رنگ',
    tooltipLanguages: 'زبان',
  },

  id: {
    adhanSettingsTitle: 'Pengaturan Adzan & Notifikasi',
    adhanSettingsSubtitle: 'Putar suara adzan saat waktu shalat tiba',
    adhanEnableAlerts: 'Aktifkan Pengingat Shalat',
    adhanAlertsActive: 'Pengingat aktif saat waktu shalat',
    adhanAlertsDisabled: 'Pengingat saat ini dinonaktifkan',
    adhanPermissionRequired: 'Notifikasi membutuhkan izin peramban.',
    adhanAllowPermission: 'Izinkan',
    adhanPermissionGranted: 'Izin notifikasi diberikan ✓',
    adhanSoundChoice: 'Pilihan Suara Adzan',
    adhanSoundChoiceSub: 'Pilih Takbir, Adzan Lengkap, atau File Kustom',
    adhanTakbeerName: 'Takbir (Allahu Akbar Allahu Akbar)',
    adhanTakbeerDesc: 'Peringatan takbir singkat 4 detik untuk waktu shalat',
    adhanFullName: 'Adzan Lengkap (Panggilan Shalat)',
    adhanFullDesc: 'Panggilan adzan merdu dan lengkap (~2.5 menit)',
    adhanCustomName: 'File Audio Kustom (Dari Perangkat)',
    adhanCustomDesc: 'Putar file MP3 lokal pilihan Anda',
    adhanSilentName: 'Notifikasi Senyap (Tanpa Suara)',
    adhanSilentDesc: 'Hanya notifikasi visual di layar tanpa suara',
    adhanUploadBtn: 'Unggah',
    adhanCurrentFile: 'File saat ini:',
    adhanVolume: 'Volume Adzan',
    adhanPrayersToAlert: 'Shalat yang Diingatkan',
    adhanTestBtn: 'Uji Peringatan & Adzan Sekarang',
    adhanBannerTitle: 'Waktu Shalat Tiba',
    adhanDuaaTitle: 'Doa Setelah Adzan:',
    adhanDuaaShow: 'Tampilkan Doa Setelah Adzan',
    adhanStopClose: 'Hentikan & Tutup',
    adhanTestNotificationTitle: '🕌 Uji Notifikasi Shalat',
    adhanTestNotificationBody: 'Allahu Akbar, Allahu Akbar... Waktu shalat telah tiba',

    qiblaTitle: 'Arah Kiblat',
    qiblaFacingKaaba: 'Menghadap Ka\'bah!',
    qiblaKmToMecca: 'km ke Mekkah',
    qiblaEnableSensor: 'Aktifkan Kompas',
    qiblaBearing: 'Arah Kiblat:',
    qiblaDeviation: 'Penyimpangan:',
    qiblaCorrectDirection: 'Anda sekarang menghadap tepat ke Ka\'bah yang Mulia',
    qiblaCoordinates: 'Koordinat Anda',
    qiblaKaabaCoords: 'Koordinat Ka\'bah',
    qiblaSensorStatus: 'Status Sensor',
    qiblaManualSim: 'Manual',
    qiblaSensorActive: 'Sensor Magnetik Aktif',
    qiblaSimulated: 'Simulasi',
    qiblaManualSlider: 'Slider Arah Manual:',

    quranCompletion: 'Penyelesaian Al-Qur\'an:',
    surahsCompleted: 'surah selesai',
    ayahsRemaining: 'ayat tersisa',
    dailyGoal: 'Target Harian',
    ayahsUnit: 'Ayat',
    streak: 'Konsistensi',
    daysUnit: 'Hari',
    keepItUp: 'Pertahankan!',
    khatmas: 'Khatam',
    completedKhatma: 'Selesai',
    mashaAllah: 'MashaAllah',
    lastReadPos: 'Posisi Bacaan Terakhir',
    resume: 'Lanjutkan',
    bookmarks: 'Penanda',
    goToAyah: 'Ke Ayat',
    deleteBookmark: 'Hapus',

    offlineManagerTitle: 'Manajer Unduhan Offline',
    offlineAllSurahs: 'Semua Surah (114)',
    offlineSaved: 'Disimpan Offline',
    offlineDownloadAll: 'Unduh Semua ⚡',
    offlineDownloading: 'Mengunduh...',
    offlineCompletedBadge: 'Dibaca di Khatam',
    offlineSavedBadge: 'Tersimpan Offline',
    offlineNoSurahsYet: 'Belum ada surah tersimpan offline. Unduh dengan sekali ketuk.',
    offlineTabAll: 'Semua Surah (114)',
    offlineTabSaved: 'Disimpan Offline',

    smartSearchTitle: 'Pencarian Cerdas Al-Qur\'an',
    smartSearchPh: 'Ketik kata atau ayat...',
    smartSearchBtn: 'Cari',
    smartSearchIdeas: 'Contoh pencarian:',
    smartSearching: 'Mencari ayat...',
    smartSearchNoResults: 'Tidak ada ayat yang cocok.',
    smartSearchTip: 'Coba cari dengan satu kata kunci.',
    smartSearchClosestMatch: 'Kecocokan terdekat',
    smartSearchOpenQuran: 'Buka di Al-Qur\'an',

    statusOnline: 'Online',
    statusOffline: 'Mode offline',
    tooltipOfflineManager: 'Manajer Offline',
    tooltipSearch: 'Pencarian Cerdas',
    tooltipThemes: 'Tema & Warna',
    tooltipLanguages: 'Bahasa',
  },
};

export function getUIStrings(lang: string): LocalizedUIStrings {
  const base = UI_TRANSLATIONS.en as LocalizedUIStrings;
  const target = (UI_TRANSLATIONS[lang] || {}) as Partial<LocalizedUIStrings>;
  return { ...base, ...target };
}
