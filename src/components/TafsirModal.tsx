import React from 'react';
import { Play, X, BookOpen, Loader2 } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

interface TafsirModalProps {
  isOpen: boolean;
  surahName: string;
  ayahNumber: number;
  ayahArabicText: string;
  tafsirText: string;
  sourceSlug: string;
  isLoading: boolean;
  lang: string;
  onPlayAyah: () => void;
  onClose: () => void;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({
  isOpen,
  surahName,
  ayahNumber,
  ayahArabicText,
  tafsirText,
  sourceSlug,
  isLoading,
  lang,
  onPlayAyah,
  onClose,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;

  return (
    <div
      id="tafsir-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-[850] bg-black/80 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--bg2)] border-t sm:border border-[var(--border2)] rounded-t-3xl sm:rounded-3xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-4 sm:p-6 shadow-2xl animate-sheet-up flex flex-col"
      >
        {/* Handle */}
        <div className="w-10 h-1.5 bg-[var(--border2)] rounded-full mx-auto mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border2)]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--gold)]" />
            <span className="text-xs font-bold text-[var(--gold2)]">
              {surahName} — {t.ayah} {ayahNumber}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[var(--bg3)] text-[var(--text2)] flex items-center justify-center hover:text-[var(--text)] active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ayah Arabic Calligraphy */}
        <div className="my-4 p-4 rounded-2xl bg-[var(--bg3)]/50 border border-[var(--border2)] text-center">
          <div className="font-quran text-2xl sm:text-3xl leading-[2.4] text-[var(--gold2)] dir-rtl">
            {ayahArabicText}
          </div>
        </div>

        {/* Audio Listen action */}
        <div className="flex justify-center mb-4">
          <button
            onClick={onPlayAyah}
            className="inline-flex items-center gap-2 bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 hover:bg-[var(--gold)]/20 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{t.playSurah}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--gold)]/25 to-transparent mb-3" />

        {/* Tafsir Source Badge */}
        {sourceSlug && (
          <div className="text-[0.68rem] text-center font-bold tracking-wider text-[var(--gold)] uppercase mb-2">
            {sourceSlug.replace(/-/g, ' ')}
          </div>
        )}

        {/* Tafsir Body Content */}
        <div className="text-[0.92rem] sm:text-base leading-relaxed text-[var(--text)] p-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-[var(--text2)]">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--gold)]" />
              <span className="text-xs">{t.tafsirLoading || 'جاري تحميل التفسير...'}</span>
            </div>
          ) : tafsirText ? (
            <p className="whitespace-pre-line text-justify leading-loose">{tafsirText}</p>
          ) : (
            <div className="text-center text-xs text-[var(--text3)] py-6">
              {t.tafsirUnavailable || 'التفسير غير متوفر حالياً'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
