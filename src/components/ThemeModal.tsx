import React, { useState, useEffect } from 'react';
import { THEMES } from '../data/themes';
import { DESIGN_STYLES, QURAN_FONTS } from '../data/designStyles';
import { DesignStyleId, QuranFontId } from '../types';
import { getUIStrings } from '../utils/uiTranslations';
import { hapticFeedback, HapticIntensity, isHapticSupported } from '../utils/haptics';
import {
  Check,
  X,
  Palette,
  Layout,
  Sparkles,
  BookOpen,
  Layers,
  Maximize,
  Crown,
  Eye,
  LayoutGrid,
  Columns,
  Menu,
  LayoutTemplate,
  Grid,
  Type,
  Smartphone,
  Zap,
  Volume2,
} from 'lucide-react';

interface ThemeModalProps {
  isOpen: boolean;
  currentThemeId: string;
  currentDesignStyle: DesignStyleId;
  currentQuranFont?: QuranFontId;
  onSelectTheme: (themeId: string) => void;
  onSelectDesignStyle: (designId: DesignStyleId) => void;
  onSelectQuranFont?: (fontId: QuranFontId) => void;
  onClose: () => void;
  lang: string;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  currentThemeId,
  currentDesignStyle,
  currentQuranFont = 'amiri_quran',
  onSelectTheme,
  onSelectDesignStyle,
  onSelectQuranFont,
  onClose,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'themes' | 'designs' | 'fonts' | 'haptics'>('designs');
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => hapticFeedback.isEnabled());
  const [hapticIntensity, setHapticIntensity] = useState<HapticIntensity>(() => hapticFeedback.getIntensity());
  const hasVibrateSupport = isHapticSupported();

  const ui = getUIStrings(lang);
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';

  useEffect(() => {
    const handleSync = () => {
      setHapticsEnabled(hapticFeedback.isEnabled());
      setHapticIntensity(hapticFeedback.getIntensity());
    };
    window.addEventListener('haptics_settings_changed', handleSync);
    return () => window.removeEventListener('haptics_settings_changed', handleSync);
  }, []);

  if (!isOpen) return null;

  const handleToggleHaptics = (enabled: boolean) => {
    setHapticsEnabled(enabled);
    hapticFeedback.setEnabled(enabled);
    if (enabled) {
      hapticFeedback.success();
    }
  };

  const handleChangeIntensity = (intensity: HapticIntensity) => {
    setHapticIntensity(intensity);
    hapticFeedback.setIntensity(intensity);
    hapticFeedback.medium();
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Menu':
        return <Menu className="w-4 h-4 text-[var(--gold)]" />;
      case 'LayoutTemplate':
        return <LayoutTemplate className="w-4 h-4 text-[var(--gold)]" />;
      case 'Grid':
        return <Grid className="w-4 h-4 text-[var(--gold)]" />;
      case 'LayoutGrid':
        return <LayoutGrid className="w-4 h-4 text-[var(--gold)]" />;
      case 'Columns':
        return <Columns className="w-4 h-4 text-[var(--gold)]" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 text-[var(--gold)]" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-[var(--gold)]" />;
      case 'Maximize':
        return <Maximize className="w-4 h-4 text-[var(--gold)]" />;
      case 'Crown':
        return <Crown className="w-4 h-4 text-[var(--gold)]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[var(--gold)]" />;
    }
  };

  return (
    <div
      id="theme-selection-modal"
      onClick={onClose}
      className="fixed inset-0 z-[900] bg-black/80 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--bg2)] border-t sm:border border-[var(--border2)] rounded-t-3xl sm:rounded-3xl w-full max-w-xl max-h-[88vh] overflow-y-auto p-4 sm:p-6 shadow-2xl animate-sheet-up flex flex-col"
      >
        {/* Modal Handle */}
        <div className="w-12 h-1.5 bg-[var(--border2)] rounded-full mx-auto mb-3" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border2)] mb-3">
          <div>
            <h3 className="font-amiri text-lg sm:text-xl font-bold text-[var(--gold2)] flex items-center gap-2">
              <span>🎨</span>
              <span>
                {lang === 'ar' ? 'المظهر والتصميم والخطوط' : 'Appearance, Design & Fonts'}
              </span>
            </h3>
            <p className="text-xs text-[var(--text2)] mt-0.5">
              {lang === 'ar'
                ? 'تخصيص ألوان الواجهة، نمط التصميم، وخط الآيات القرآنية الأصيل'
                : 'Customize color palette, layout structure and authentic Quran font'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg3)] text-[var(--text2)] flex items-center justify-center hover:text-[var(--text)] active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs: Colors vs Designs vs Quran Fonts vs Haptics */}
        <div className="grid grid-cols-4 gap-1 bg-[var(--bg3)] p-1 rounded-xl border border-[var(--border2)] mb-4">
          <button
            onClick={() => {
              hapticFeedback.selection();
              setActiveTab('designs');
            }}
            className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'designs'
                ? 'bg-[var(--gold)] text-black shadow-md font-extrabold'
                : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)]/50'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span className="truncate">{lang === 'ar' ? 'التصميم' : 'Layout'}</span>
          </button>

          <button
            onClick={() => {
              hapticFeedback.selection();
              setActiveTab('fonts');
            }}
            className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'fonts'
                ? 'bg-[var(--gold)] text-black shadow-md font-extrabold'
                : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)]/50'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span className="truncate">{lang === 'ar' ? 'الخطوط' : 'Fonts'}</span>
          </button>

          <button
            onClick={() => {
              hapticFeedback.selection();
              setActiveTab('themes');
            }}
            className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'themes'
                ? 'bg-[var(--gold)] text-black shadow-md font-extrabold'
                : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)]/50'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="truncate">{lang === 'ar' ? 'الألوان' : 'Colors'}</span>
          </button>

          <button
            onClick={() => {
              hapticFeedback.selection();
              setActiveTab('haptics');
            }}
            className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'haptics'
                ? 'bg-[var(--gold)] text-black shadow-md font-extrabold'
                : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)]/50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="truncate">{lang === 'ar' ? 'الاهتزاز' : 'Haptics'}</span>
          </button>
        </div>

        {/* TAB 1: SITE LAYOUT & DESIGN STYLES */}
        {activeTab === 'designs' && (
          <div className="flex flex-col gap-2.5 pb-2 animate-fade-in">
            {DESIGN_STYLES.map((design) => {
              const isSelected = design.id === currentDesignStyle;
              const name = lang === 'ar' ? design.nameAr : design.nameEn;
              const desc = lang === 'ar' ? design.descAr : design.descEn;
              const badge = lang === 'ar' ? design.badgeAr : design.badgeEn;

              return (
                <div
                  key={design.id}
                  onClick={() => onSelectDesignStyle(design.id)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col gap-1.5 ${
                    isSelected
                      ? 'border-[var(--gold)] bg-[var(--gold)]/10 shadow-lg ring-1 ring-[var(--gold)]'
                      : 'border-[var(--border2)] bg-[var(--bg3)]/50 hover:border-[var(--gold)]/40 hover:bg-[var(--bg3)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[var(--bg2)] border border-[var(--border2)] flex items-center justify-center shrink-0">
                        {renderIcon(design.icon)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--gold2)] font-amiri flex items-center gap-1.5">
                          {name}
                        </h4>
                        <span className="text-[0.62rem] px-2 py-0.5 rounded-full bg-[var(--bg2)] text-[var(--gold)] border border-[var(--border2)] font-mono">
                          {badge}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[var(--gold)] text-black scale-100'
                          : 'border border-[var(--border2)] bg-[var(--bg2)] text-transparent scale-90'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text2)] leading-relaxed">
                    {desc}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: AUTHENTIC QURAN CALLIGRAPHY FONTS */}
        {activeTab === 'fonts' && (
          <div className="flex flex-col gap-3 pb-2 animate-fade-in">
            <div className="p-3 bg-[var(--bg3)] rounded-2xl border border-[var(--border2)] text-xs text-[var(--text2)]">
              <span className="font-bold text-[var(--gold)]">ℹ️ {isRtl ? 'خط المصحف الشريف المعتمد:' : 'Authentic Quran Calligraphy:'} </span>
              {isRtl
                ? 'يتم تطبيق خط الرسم القرآني المتراكب على جميع السور والآيات بدقة وتشكيل عثماني أصيل.'
                : 'Applies authentic Uthmanic calligraphy font across all Quranic verses and surahs.'}
            </div>

            {QURAN_FONTS.map((font) => {
              const isSelected = font.id === currentQuranFont;
              return (
                <div
                  key={font.id}
                  onClick={() => onSelectQuranFont && onSelectQuranFont(font.id)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col gap-2 ${
                    isSelected
                      ? 'border-[var(--gold)] bg-[var(--gold)]/10 shadow-lg ring-1 ring-[var(--gold)]'
                      : 'border-[var(--border2)] bg-[var(--bg3)]/50 hover:border-[var(--gold)]/40 hover:bg-[var(--bg3)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--gold2)]">
                        {isRtl ? font.nameAr : font.nameEn}
                      </h4>
                      <p className="text-[0.68rem] text-[var(--text3)] mt-0.5">
                        {font.descAr}
                      </p>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                        isSelected
                          ? 'bg-[var(--gold)] text-black scale-100'
                          : 'border border-[var(--border2)] bg-[var(--bg2)] text-transparent scale-90'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>

                  {/* Quranic Ayah Calligraphy Live Preview */}
                  <div
                    className="p-3 bg-[var(--bg2)] rounded-xl border border-[var(--border2)] text-right dir-rtl leading-[2.3] text-[var(--gold3)] text-base select-none"
                    style={{ fontFamily: font.fontFamily }}
                  >
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ۝ ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: COLOR THEMES */}
        {activeTab === 'themes' && (
          <div className="grid grid-cols-2 gap-3 pb-2 animate-fade-in">
            {THEMES.map((theme) => {
              const isActive = theme.id === currentThemeId;
              const [c1, c2, c3, c4] = theme.colors;
              const name = lang === 'ar' ? theme.nameAr : theme.nameEn;
              const isLight =
                theme.id === 'light-pearl' || theme.id === 'sepia-mushaf';

              return (
                <button
                  key={theme.id}
                  onClick={() => onSelectTheme(theme.id)}
                  className={`group rounded-2xl overflow-hidden border-2 text-start transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-95 shadow-md flex flex-col ${
                    isActive
                      ? 'border-[var(--gold)] shadow-[0_0_15px_rgba(201,168,76,0.35)] ring-1 ring-[var(--gold)]'
                      : 'border-[var(--border2)] hover:border-[var(--gold)]/50'
                  }`}
                >
                  {/* Palette visual preview */}
                  <div className="h-16 w-full relative overflow-hidden flex">
                    <div className="flex-1 h-full" style={{ backgroundColor: c1 }} />
                    <div className="flex-1 h-full" style={{ backgroundColor: c4 }} />

                    {/* Center emblem preview */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="px-2.5 py-0.5 rounded-lg border font-amiri text-[0.7rem] font-bold shadow"
                        style={{
                          backgroundColor: c4,
                          borderColor: `${c2}60`,
                          color: c2,
                        }}
                      >
                        ﷽
                      </div>
                    </div>
                  </div>

                  {/* Theme info card footer */}
                  <div
                    className="p-2.5 flex items-center justify-between w-full"
                    style={{ backgroundColor: c4 }}
                  >
                    <span
                      className="text-[0.75rem] font-bold truncate"
                      style={{ color: c3 }}
                    >
                      {name}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[0.6rem] font-black transition-all ${
                        isActive
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-75'
                      }`}
                      style={{
                        backgroundColor: c2,
                        color: isLight ? '#ffffff' : '#000000',
                      }}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 4: HAPTIC FEEDBACK & PHYSICAL VIBRATION */}
        {activeTab === 'haptics' && (
          <div className="space-y-4 pb-2 animate-fade-in">
            {/* Master Toggle Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--bg3)] to-[var(--bg2)] border border-[var(--border2)] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/15 border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)] shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--gold2)] flex items-center gap-2">
                    <span>{isRtl ? 'الاهتزاز والتفاعل اللمسي' : 'Haptic Touch Feedback'}</span>
                    <span className={`text-[0.62rem] px-2 py-0.5 rounded-full font-sans font-bold ${
                      hasVibrateSupport ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
                    }`}>
                      {hasVibrateSupport
                        ? (isRtl ? 'مدعوم على جهازك ✓' : 'Supported on device ✓')
                        : (isRtl ? 'قد يتطلب جهاز جوال' : 'Mobile device recommended')}
                    </span>
                  </h4>
                  <p className="text-xs text-[var(--text3)] mt-0.5">
                    {isRtl
                      ? 'تأكيد لمسي حقيقي عبر اهتزاز الجهاز عند التسبيح، تصفح القرآن، وحفظ الآيات'
                      : 'Physical vibration feedback when counting Tasbih, navigating Quran and bookmarking'}
                  </p>
                </div>
              </div>

              {/* Switch Toggle */}
              <button
                onClick={() => handleToggleHaptics(!hapticsEnabled)}
                className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer p-0.5 shrink-0 ${
                  hapticsEnabled ? 'bg-[var(--gold)]' : 'bg-[var(--border2)]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white transition-transform transform shadow-md ${
                    hapticsEnabled
                      ? (isRtl ? '-translate-x-5' : 'translate-x-5')
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Intensity Selector */}
            {hapticsEnabled && (
              <div className="p-4 rounded-2xl bg-[var(--bg3)]/50 border border-[var(--border2)] space-y-2.5">
                <label className="block text-xs font-bold text-[var(--text2)]">
                  {isRtl ? 'قوة الاهتزاز (Vibration Intensity):' : 'Vibration Intensity:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['soft', 'medium', 'strong'] as HapticIntensity[]).map((level) => {
                    const isCurrent = hapticIntensity === level;
                    const labels = {
                      soft: isRtl ? 'خفيف 🍃' : 'Soft 🍃',
                      medium: isRtl ? 'متوسط ⚡' : 'Medium ⚡',
                      strong: isRtl ? 'قوي 💥' : 'Strong 💥',
                    };
                    return (
                      <button
                        key={level}
                        onClick={() => handleChangeIntensity(level)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          isCurrent
                            ? 'bg-[var(--gold)] text-black border-[var(--gold)] shadow-md'
                            : 'bg-[var(--bg2)] text-[var(--text2)] border-[var(--border2)] hover:border-[var(--gold)]/40'
                        }`}
                      >
                        {labels[level]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Interactive Feedback Test Lab */}
            {hapticsEnabled && (
              <div className="p-4 rounded-2xl bg-[var(--bg3)]/30 border border-[var(--border2)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--gold2)] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[var(--gold)]" />
                    <span>{isRtl ? 'اختبار وتجربة النبضات الحية' : 'Test Vibration Profiles'}</span>
                  </span>
                  <span className="text-[0.65rem] text-[var(--text3)]">
                    {isRtl ? 'اضغط لتشعر بالاهتزاز' : 'Tap to feel feedback'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => hapticFeedback.tasbih()}
                    className="p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--border2)] hover:border-[var(--gold)] text-xs font-bold text-[var(--text)] flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-xs"
                  >
                    <span className="text-base">📿</span>
                    <span>{isRtl ? 'نقرة التسبيح' : 'Tasbih Tap'}</span>
                    <span className="text-[0.62rem] text-[var(--text3)] font-sans">24ms</span>
                  </button>

                  <button
                    onClick={() => hapticFeedback.tasbihCycle()}
                    className="p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--border2)] hover:border-[var(--gold)] text-xs font-bold text-[var(--text)] flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-xs"
                  >
                    <span className="text-base">✨</span>
                    <span>{isRtl ? 'اكتمال الدورة' : 'Milestone Cycle'}</span>
                    <span className="text-[0.62rem] text-[var(--text3)] font-sans">Rhythmic</span>
                  </button>

                  <button
                    onClick={() => hapticFeedback.navigation()}
                    className="p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--border2)] hover:border-[var(--gold)] text-xs font-bold text-[var(--text)] flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-xs"
                  >
                    <span className="text-base">📖</span>
                    <span>{isRtl ? 'تقليب وتصفح' : 'Navigation'}</span>
                    <span className="text-[0.62rem] text-[var(--text3)] font-sans">18ms</span>
                  </button>

                  <button
                    onClick={() => hapticFeedback.success()}
                    className="p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--border2)] hover:border-[var(--gold)] text-xs font-bold text-[var(--text)] flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-xs"
                  >
                    <span className="text-base">🔖</span>
                    <span>{isRtl ? 'حفظ علامة' : 'Bookmark / Read'}</span>
                    <span className="text-[0.62rem] text-[var(--text3)] font-sans">Success</span>
                  </button>

                  <button
                    onClick={() => hapticFeedback.warning()}
                    className="p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--border2)] hover:border-[var(--gold)] text-xs font-bold text-[var(--text)] flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-xs"
                  >
                    <span className="text-base">🔄</span>
                    <span>{isRtl ? 'تصفير العداد' : 'Reset / Warning'}</span>
                    <span className="text-[0.62rem] text-[var(--text3)] font-sans">Warning</span>
                  </button>

                  <button
                    onClick={() => hapticFeedback.heavy()}
                    className="p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--border2)] hover:border-[var(--gold)] text-xs font-bold text-[var(--text)] flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-xs"
                  >
                    <span className="text-base">💥</span>
                    <span>{isRtl ? 'نبضة عميقة' : 'Heavy Pulse'}</span>
                    <span className="text-[0.62rem] text-[var(--text3)] font-sans">55ms</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

