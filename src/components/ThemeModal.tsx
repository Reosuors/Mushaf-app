import React from 'react';
import { THEMES } from '../data/themes';
import { Check, X } from 'lucide-react';

interface ThemeModalProps {
  isOpen: boolean;
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
  onClose: () => void;
  lang: string;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  currentThemeId,
  onSelectTheme,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="theme-selection-modal"
      onClick={onClose}
      className="fixed inset-0 z-[900] bg-black/80 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--bg2)] border-t sm:border border-[var(--border2)] rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6 shadow-2xl animate-sheet-up flex flex-col"
      >
        {/* Modal Handle */}
        <div className="w-10 h-1.5 bg-[var(--border2)] rounded-full mx-auto mb-4" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border2)] mb-4">
          <div>
            <h3 className="font-amiri text-xl font-bold text-[var(--gold2)] flex items-center gap-2">
              🎨 {lang === 'ar' ? 'الثيمات ومظهر التطبيق' : 'App Themes'}
            </h3>
            <p className="text-xs text-[var(--text2)] mt-0.5">
              {lang === 'ar' ? 'اختر النمط اللوني المفضل لديك' : 'Choose your preferred visual aesthetic'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg3)] text-[var(--text2)] flex items-center justify-center hover:text-[var(--text)] active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-2 gap-3.5 pb-4">
          {THEMES.map((theme) => {
            const isActive = theme.id === currentThemeId;
            const [c1, c2, c3, c4] = theme.colors;
            const name = lang === 'ar' ? theme.nameAr : theme.nameEn;
            const isLight = theme.id === 'light';

            return (
              <button
                key={theme.id}
                onClick={() => onSelectTheme(theme.id)}
                className={`group rounded-2xl overflow-hidden border-2 text-start transition-all cursor-pointer transform hover:-translate-y-1 active:scale-95 shadow-md flex flex-col ${
                  isActive
                    ? 'border-[var(--gold)] shadow-[0_0_15px_rgba(201,168,76,0.3)]'
                    : 'border-[var(--border2)] hover:border-[var(--gold)]/50'
                }`}
              >
                {/* Palette visual preview */}
                <div className="h-20 w-full relative overflow-hidden flex">
                  <div className="flex-1 h-full" style={{ backgroundColor: c1 }} />
                  <div className="flex-1 h-full" style={{ backgroundColor: c4 }} />

                  {/* Center emblem preview */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="px-2.5 py-1 rounded-lg border font-amiri text-xs font-bold shadow"
                      style={{
                        backgroundColor: c4,
                        borderColor: `${c2}50`,
                        color: c2,
                      }}
                    >
                      مصحف
                    </div>
                  </div>

                  {/* Tiny simulated navigation icons */}
                  <div
                    className="absolute bottom-0 inset-x-0 h-5 flex items-center justify-around px-1 text-[0.6rem] border-t"
                    style={{ backgroundColor: c4, borderColor: `${c2}20` }}
                  >
                    <span>🕌</span>
                    <span>📖</span>
                    <span>🤲</span>
                    <span>📿</span>
                  </div>
                </div>

                {/* Theme info card footer */}
                <div
                  className="p-3 flex items-center justify-between w-full"
                  style={{ backgroundColor: c4 }}
                >
                  <span className="text-xs font-bold truncate" style={{ color: c3 }}>
                    {name}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.65rem] font-black transition-all ${
                      isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                    }`}
                    style={{
                      backgroundColor: c2,
                      color: isLight ? '#ffffff' : '#000000',
                    }}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
