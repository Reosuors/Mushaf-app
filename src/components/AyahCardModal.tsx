import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  Palette, 
  Type,
  BookOpen
} from 'lucide-react';
import { AyahCardData, QuranFontId } from '../types';
import { QURAN_FONTS } from '../data/designStyles';

interface AyahCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AyahCardData | null;
  lang: string;
}

interface CardThemeOption {
  id: string;
  nameAr: string;
  bgGradient: string;
  textColor: string;
  goldColor: string;
  borderColor: string;
  canvasBg: string[]; // For canvas gradient
}

const CARD_THEMES: CardThemeOption[] = [
  {
    id: 'royal-gold',
    nameAr: 'الليل والذهب الملكي',
    bgGradient: 'from-zinc-950 via-stone-900 to-black',
    textColor: '#f5eedb',
    goldColor: '#d4af37',
    borderColor: '#382f1b',
    canvasBg: ['#0d0d0d', '#17140e', '#050505'],
  },
  {
    id: 'kaaba-black',
    nameAr: 'كسوة الكعبة المشرفة',
    bgGradient: 'from-black via-zinc-950 to-neutral-950',
    textColor: '#ffffff',
    goldColor: '#f5c542',
    borderColor: '#3a3219',
    canvasBg: ['#000000', '#0a0a0a', '#000000'],
  },
  {
    id: 'emerald-oasis',
    nameAr: 'الزمرد الأخضر والروضة',
    bgGradient: 'from-emerald-950 via-teal-950 to-zinc-950',
    textColor: '#ecfdf5',
    goldColor: '#34d399',
    borderColor: '#064e3b',
    canvasBg: ['#021c10', '#062d1c', '#02120a'],
  },
  {
    id: 'andalus-navy',
    nameAr: 'كحلي الأندلس والياقوت',
    bgGradient: 'from-slate-950 via-sky-950 to-neutral-950',
    textColor: '#f0f9ff',
    goldColor: '#38bdf8',
    borderColor: '#0c4a6e',
    canvasBg: ['#041326', '#092140', '#020b17'],
  },
  {
    id: 'vintage-sepia',
    nameAr: 'ورق المصحف العتيق',
    bgGradient: 'from-amber-100 via-amber-50 to-stone-200',
    textColor: '#291e0b',
    goldColor: '#854d0e',
    borderColor: '#d1c094',
    canvasBg: ['#f7eedb', '#ede2c4', '#f5ebd3'],
  },
  {
    id: 'rose-ruby',
    nameAr: 'عقيق الصحراء والورد',
    bgGradient: 'from-rose-950 via-neutral-950 to-zinc-950',
    textColor: '#fff1f2',
    goldColor: '#fb7185',
    borderColor: '#881337',
    canvasBg: ['#1a040b', '#260812', '#0f0206'],
  },
];

export const AyahCardModal: React.FC<AyahCardModalProps> = ({
  isOpen,
  onClose,
  data,
  lang,
}) => {
  const isRtl = lang === 'ar';
  const [selectedThemeId, setSelectedThemeId] = useState<string>('royal-gold');
  const [selectedFontId, setSelectedFontId] = useState<QuranFontId>('amiri_quran');
  const [includeTranslation, setIncludeTranslation] = useState<boolean>(true);
  const [includeBadge, setIncludeBadge] = useState<boolean>(true);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data) return null;

  const currentTheme = CARD_THEMES.find((t) => t.id === selectedThemeId) || CARD_THEMES[0];
  const currentFont = QURAN_FONTS.find((f) => f.id === selectedFontId) || QURAN_FONTS[0];

  const handleCopyText = () => {
    const fullText = `﴿ ${data.ayahText} ﴾ [سورة ${data.surahNameAr}: ${data.ayahNumber}]${
      includeTranslation && data.translationText ? `\n"${data.translationText}"` : ''
    }\n— تم الإنشاء عبر تطبيق روح المصحف`;
    navigator.clipboard.writeText(fullText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadImage = async () => {
    setIsExporting(true);
    try {
      // High-resolution Canvas rendering
      const width = 1080;
      const height = 1080;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Draw background gradient
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, currentTheme.canvasBg[0]);
        grad.addColorStop(0.5, currentTheme.canvasBg[1]);
        grad.addColorStop(1, currentTheme.canvasBg[2]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Draw ornamental borders
        ctx.strokeStyle = currentTheme.goldColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(40, 40, width - 80, height - 80);

        ctx.strokeStyle = currentTheme.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(55, 55, width - 110, height - 110);

        // Corner decorative accents
        const cornerSize = 25;
        const corners = [
          [40, 40],
          [width - 40, 40],
          [40, height - 40],
          [width - 40, height - 40],
        ];
        ctx.fillStyle = currentTheme.goldColor;
        corners.forEach(([cx, cy]) => {
          ctx.beginPath();
          ctx.arc(cx, cy, 6, 0, Math.PI * 2);
          ctx.fill();
        });

        // Top App Header
        ctx.fillStyle = currentTheme.goldColor;
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('﷽', width / 2, 120);

        // Surah Badge
        if (includeBadge) {
          ctx.fillStyle = currentTheme.goldColor;
          ctx.font = 'bold 28px sans-serif';
          ctx.fillText(`سورة ${data.surahNameAr} • آية ${data.ayahNumber}`, width / 2, 190);
        }

        // Quran Ayah Text
        ctx.fillStyle = currentTheme.textColor;
        ctx.font = `bold 44px 'Amiri Quran', 'Amiri', serif`;
        ctx.direction = 'rtl';
        ctx.textAlign = 'center';

        // Word wrap helper for canvas
        const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
          const words = text.split(' ');
          let line = '';
          let currentY = y;

          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
              ctx.fillText(line, x, currentY);
              line = words[n] + ' ';
              currentY += lineHeight;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, x, currentY);
          return currentY + lineHeight;
        };

        const ayahWithBrackets = `﴿ ${data.ayahText} ﴾`;
        const nextY = wrapText(ayahWithBrackets, width / 2, 320, width - 180, 80);

        // Translation Text if included
        if (includeTranslation && data.translationText) {
          ctx.fillStyle = currentTheme.goldColor;
          ctx.font = `italic 26px sans-serif`;
          ctx.direction = 'ltr';
          ctx.textAlign = 'center';
          wrapText(`"${data.translationText}"`, width / 2, Math.max(nextY + 30, 680), width - 220, 45);
        }

        // Bottom Footer Watermark
        ctx.fillStyle = currentTheme.goldColor;
        ctx.font = '22px sans-serif';
        ctx.direction = 'rtl';
        ctx.textAlign = 'center';
        ctx.fillText('تطبيق روح المصحف الشريف', width / 2, height - 75);

        // Export as PNG Download
        const link = document.createElement('a');
        link.download = `Ayah-${data.surahNumber}-${data.ayahNumber}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (e) {
      console.error('Image export failed', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    const shareText = `﴿ ${data.ayahText} ﴾\n[سورة ${data.surahNameAr}: ${data.ayahNumber}]\n${
      includeTranslation && data.translationText ? `\n"${data.translationText}"\n` : ''
    }\nتطبيق روح المصحف الشريف`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `سورة ${data.surahNameAr} - آية ${data.ayahNumber}`,
          text: shareText,
        });
      } catch (e) {
        // User dismissed
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[var(--bg)] border border-[var(--border2)] rounded-3xl shadow-2xl overflow-hidden text-[var(--text)]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border2)] bg-[var(--bg2)]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--gold)]/15 border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--gold2)]">
                {isRtl ? 'تصميم ومشاركة بطاقة الآية' : 'Ayah Card Studio & Share'}
              </h2>
              <p className="text-xs text-[var(--text2)]">
                {isRtl ? `سورة ${data.surahNameAr} • آية ${data.ayahNumber}` : `Surah ${data.surahNameAr} • Ayah ${data.ayahNumber}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg3)] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Visual Card Preview */}
          <div className="flex justify-center">
            <div
              ref={cardRef}
              className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-gradient-to-b ${currentTheme.bgGradient} border-2 shadow-2xl relative overflow-hidden text-center transition-all duration-300`}
              style={{ borderColor: currentTheme.goldColor }}
            >
              {/* Inner Decorative Double Border */}
              <div 
                className="absolute inset-3 rounded-2xl border pointer-events-none"
                style={{ borderColor: `${currentTheme.goldColor}40` }}
              />

              {/* Bismillah */}
              <div className="text-xl sm:text-2xl mb-4 select-none font-quran" style={{ color: currentTheme.goldColor }}>
                ﷽
              </div>

              {/* Badge */}
              {includeBadge && (
                <div 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-5 border select-none"
                  style={{ 
                    backgroundColor: `${currentTheme.goldColor}15`,
                    borderColor: `${currentTheme.goldColor}40`,
                    color: currentTheme.goldColor
                  }}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>سورة {data.surahNameAr} • آية {data.ayahNumber}</span>
                </div>
              )}

              {/* Ayah Quran Text */}
              <div 
                className="font-quran leading-loose text-lg sm:text-2xl dir-rtl select-text mb-6"
                style={{ 
                  fontFamily: currentFont.fontFamily,
                  color: currentTheme.textColor
                }}
              >
                ﴿ {data.ayahText} ﴾
              </div>

              {/* Translation Text */}
              {includeTranslation && data.translationText && (
                <div 
                  className="text-xs sm:text-sm italic leading-relaxed pt-4 border-t dir-ltr select-text opacity-90"
                  style={{ 
                    borderColor: `${currentTheme.goldColor}30`,
                    color: currentTheme.goldColor
                  }}
                >
                  "{data.translationText}"
                </div>
              )}

              {/* Watermark Footer */}
              <div 
                className="mt-6 text-[0.68rem] tracking-wider font-sans select-none"
                style={{ color: `${currentTheme.goldColor}80` }}
              >
                روح المصحف الشريف
              </div>
            </div>
          </div>

          {/* Customization Controls */}
          <div className="space-y-4 bg-[var(--bg2)]/50 border border-[var(--border2)] rounded-2xl p-4 sm:p-5">
            {/* Background Style Picker */}
            <div>
              <label className="text-xs font-bold text-[var(--gold2)] flex items-center gap-1.5 mb-2.5">
                <Palette className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تخصيص نمط البطاقة والخلفية:' : 'Card Theme & Gradient:'}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CARD_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedThemeId(theme.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-right flex items-center justify-between cursor-pointer ${
                      selectedThemeId === theme.id
                        ? 'border-[var(--gold)] bg-[var(--gold)]/15 text-[var(--gold2)] shadow-sm'
                        : 'border-[var(--border2)] bg-[var(--bg)] text-[var(--text2)] hover:border-[var(--gold)]/40'
                    }`}
                  >
                    <span>{theme.nameAr}</span>
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.goldColor }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family Picker */}
            <div>
              <label className="text-xs font-bold text-[var(--gold2)] flex items-center gap-1.5 mb-2.5">
                <Type className="w-3.5 h-3.5" />
                <span>{isRtl ? 'الخط القرآني:' : 'Quranic Font:'}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {QURAN_FONTS.slice(0, 3).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFontId(f.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedFontId === f.id
                        ? 'border-[var(--gold)] bg-[var(--gold)]/15 text-[var(--gold2)]'
                        : 'border-[var(--border2)] bg-[var(--bg)] text-[var(--text2)] hover:border-[var(--gold)]/40'
                    }`}
                  >
                    {isRtl ? f.nameAr : f.nameEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[var(--border2)]/50 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-[var(--text)]">
                <input
                  type="checkbox"
                  checked={includeTranslation}
                  onChange={(e) => setIncludeTranslation(e.target.checked)}
                  className="rounded border-[var(--border2)] text-[var(--gold)] focus:ring-[var(--gold)] cursor-pointer"
                />
                <span>{isRtl ? 'إدراج الترجمة الإنجليزية' : 'Include English translation'}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[var(--text)]">
                <input
                  type="checkbox"
                  checked={includeBadge}
                  onChange={(e) => setIncludeBadge(e.target.checked)}
                  className="rounded border-[var(--border2)] text-[var(--gold)] focus:ring-[var(--gold)] cursor-pointer"
                />
                <span>{isRtl ? 'إدراج اسم السورة ورقم الآية' : 'Include Surah badge'}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-[var(--border2)] bg-[var(--bg2)]/80">
          <button
            onClick={handleCopyText}
            className="px-4 py-2.5 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] hover:border-[var(--gold)] text-xs font-bold text-[var(--text)] flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedText ? (isRtl ? 'تم نسخ النص!' : 'Copied!') : (isRtl ? 'نسخ النص' : 'Copy Text')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-4 py-2.5 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] hover:border-[var(--gold)] text-xs font-bold text-[var(--gold2)] flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>{isRtl ? 'مشاركة' : 'Share'}</span>
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold text-xs flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? (isRtl ? 'جارِ التوليد...' : 'Exporting...') : (isRtl ? 'تحميل كصورة عالية الدقة (PNG)' : 'Download Image')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
