import React, { useState, useEffect } from 'react';
import {
  Play,
  X,
  BookOpen,
  Loader2,
  Copy,
  Check,
  Globe,
  Plus,
  Minus,
  Layers,
} from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import {
  TAFSIR_EDITIONS,
  getDefaultEditionForLang,
  fetchAyahTafsirOrTranslation,
  getEditionDetails,
} from '../utils/tafsirTranslations';

interface TafsirModalProps {
  isOpen: boolean;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  ayahArabicText: string;
  initialTafsirText?: string;
  initialSourceSlug?: string;
  lang: string;
  onPlayAyah: () => void;
  onClose: () => void;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({
  isOpen,
  surahNumber,
  ayahNumber,
  surahName,
  ayahArabicText,
  initialTafsirText,
  initialSourceSlug,
  lang,
  onPlayAyah,
  onClose,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';

  const [selectedEditionId, setSelectedEditionId] = useState<string>(() =>
    getDefaultEditionForLang(lang)
  );
  const [content, setContent] = useState<string>(initialTafsirText || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(15);

  // When modal opens or ayah / lang changes, reset edition and load content
  useEffect(() => {
    if (isOpen) {
      const def = getDefaultEditionForLang(lang);
      setSelectedEditionId(def);
      loadContent(def);
    }
  }, [isOpen, surahNumber, ayahNumber, lang]);

  const loadContent = async (editionId: string) => {
    setIsLoading(true);
    try {
      const res = await fetchAyahTafsirOrTranslation(
        surahNumber,
        ayahNumber,
        editionId
      );
      setContent(res.text);
    } catch {
      setContent(
        lang === 'ar'
          ? 'تعذر تحميل التفسير أو الترجمة حالياً، يرجى التحقق من الاتصال بالإنترنت.'
          : 'Unable to load Tafsir or translation. Please check your internet connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedEditionId(newId);
    loadContent(newId);
  };

  const handleCopy = () => {
    if (!content) return;
    const shareText = `${surahName} — [${ayahNumber}]\n\n${ayahArabicText}\n\n${currentEdition.name}:\n${content}`;
    navigator.clipboard.writeText(shareText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  if (!isOpen) return null;

  const currentEdition = getEditionDetails(selectedEditionId);
  const textDirection = currentEdition.direction || 'rtl';

  return (
    <div
      id="tafsir-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-[850] bg-black/80 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--bg2)] border-t sm:border border-[var(--border2)] rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[88vh] overflow-y-auto p-4 sm:p-6 shadow-2xl animate-sheet-up flex flex-col"
      >
        {/* Modal Handle */}
        <div className="w-12 h-1.5 bg-[var(--border2)] rounded-full mx-auto mb-3" />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border2)] gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[var(--gold)]/10 border border-[var(--gold)]/30 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-[var(--gold)]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-[var(--gold2)] truncate font-amiri">
                {surahName} — {t.ayah} {ayahNumber}
              </h3>
              <p className="text-[0.68rem] text-[var(--text2)] truncate">
                {currentEdition.name} ({currentEdition.author})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Font Size Adjusters */}
            <div className="flex items-center bg-[var(--bg3)] rounded-lg p-0.5 border border-[var(--border2)]">
              <button
                onClick={() => setFontSize((s) => Math.max(12, s - 1))}
                title="Decrease font size"
                className="w-6 h-6 flex items-center justify-center text-[var(--text2)] hover:text-[var(--text)] active:scale-95"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-[0.65rem] px-1 text-[var(--text3)] font-mono">
                {fontSize}
              </span>
              <button
                onClick={() => setFontSize((s) => Math.min(26, s + 1))}
                title="Increase font size"
                className="w-6 h-6 flex items-center justify-center text-[var(--text2)] hover:text-[var(--text)] active:scale-95"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              title={lang === 'ar' ? 'نسخ الآية والتفسير' : 'Copy Ayah & Tafsir'}
              className="w-7 h-7 rounded-lg bg-[var(--bg3)] text-[var(--text2)] border border-[var(--border2)] flex items-center justify-center hover:text-[var(--gold)] active:scale-95 transition-all cursor-pointer"
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-[var(--green)]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-[var(--bg3)] text-[var(--text2)] border border-[var(--border2)] flex items-center justify-center hover:text-[var(--text)] active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edition Selector Bar */}
        <div className="mt-3 p-2 bg-[var(--bg3)]/60 rounded-xl border border-[var(--border2)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[var(--gold2)] font-semibold shrink-0">
            <Globe className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span>{lang === 'ar' ? 'المصدر والتفسير / الترجمة:' : 'Tafsir & Translation Edition:'}</span>
          </div>

          <select
            value={selectedEditionId}
            onChange={handleEditionChange}
            className="bg-[var(--bg2)] text-[var(--text)] border border-[var(--gold)]/30 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-[var(--gold)] cursor-pointer font-sans"
          >
            <optgroup label="📖 تفاسير باللغة العربية (Arabic Tafsir)">
              {TAFSIR_EDITIONS.filter((e) => e.language === 'ar').map((ed) => (
                <option key={ed.id} value={ed.id}>
                  {ed.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="🌍 Translations & Tafsir in Other Languages">
              {TAFSIR_EDITIONS.filter((e) => e.language !== 'ar').map((ed) => (
                <option key={ed.id} value={ed.id}>
                  [{ed.language.toUpperCase()}] {ed.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Ayah Arabic Calligraphy */}
        <div className="my-3 p-4 rounded-2xl bg-[var(--bg3)]/40 border border-[var(--gold)]/20 text-center relative overflow-hidden shadow-inner">
          <div className="font-quran text-2xl sm:text-3xl leading-[2.4] text-[var(--gold2)] dir-rtl select-text">
            {ayahArabicText}
          </div>
        </div>

        {/* Audio Listen & Quick Action Toolbar */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <button
            onClick={onPlayAyah}
            className="inline-flex items-center gap-2 bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 hover:bg-[var(--gold)]/20 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{t.playSurah || (lang === 'ar' ? 'استماع للآية' : 'Play Ayah')}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent mb-3" />

        {/* Tafsir / Translation Body Content */}
        <div className="flex-1 min-h-[140px] text-[var(--text)] p-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2.5 text-[var(--text2)]">
              <Loader2 className="w-7 h-7 animate-spin text-[var(--gold)]" />
              <span className="text-xs font-semibold">
                {lang === 'ar'
                  ? 'جاري جلب التفسير والترجمة...'
                  : 'Loading Tafsir and commentary...'}
              </span>
            </div>
          ) : content ? (
            <div
              style={{
                fontSize: `${fontSize}px`,
                direction: textDirection,
                textAlign: textDirection === 'rtl' ? 'justify' : 'left',
              }}
              className="leading-loose font-sans whitespace-pre-line select-text"
            >
              <p className="text-[var(--text)]">{content}</p>
            </div>
          ) : (
            <div className="text-center text-xs text-[var(--text3)] py-8">
              {t.tafsirUnavailable ||
                (lang === 'ar'
                  ? 'التفسير غير متوفر حالياً'
                  : 'Tafsir currently unavailable')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
