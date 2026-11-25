import React from 'react';
import { Section } from '../types';

/**
 * Handcrafted Islamic architectural & manuscript SVG ornament primitives.
 * Feather-light inline vectors — crisp at every DPI, theme-aware via CSS vars.
 */

/** Authentic 8-pointed Rub el Hizb octagonal medallion for Surah & Ayah numbers */
export const RubElHizbBadge: React.FC<{
  label: string;
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ label, active = false, size = 'md', className = '' }) => {
  const dims =
    size === 'sm'
      ? 'w-8 h-8 text-[0.68rem]'
      : size === 'lg'
      ? 'w-12 h-12 text-sm'
      : 'w-10 h-10 text-xs';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${dims} ${className}`}
    >
      <svg
        viewBox="0 0 44 44"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        <g
          fill={active ? 'color-mix(in srgb, var(--gold) 22%, transparent)' : 'color-mix(in srgb, var(--gold) 7%, var(--bg3))'}
          stroke={active ? 'var(--gold)' : 'color-mix(in srgb, var(--gold) 45%, var(--border2))'}
          strokeWidth="1.25"
        >
          <rect x="8.5" y="8.5" width="27" height="27" rx="2.5" />
          <rect
            x="8.5"
            y="8.5"
            width="27"
            height="27"
            rx="2.5"
            transform="rotate(45 22 22)"
          />
        </g>
        <circle
          cx="22"
          cy="22"
          r="11.5"
          fill={active ? 'color-mix(in srgb, var(--gold) 14%, var(--bg2))' : 'var(--bg2)'}
          stroke={active ? 'var(--gold2)' : 'color-mix(in srgb, var(--gold) 26%, transparent)'}
          strokeWidth="0.9"
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center font-amiri font-bold leading-none ${
          active ? 'text-[var(--gold2)]' : 'text-[var(--gold)]'
        }`}
      >
        {label}
      </span>
    </div>
  );
};

/** Illuminated manuscript inline Ayah verse-end rosette */
export const AyahRosette: React.FC<{
  numberLabel: string;
  active?: boolean;
}> = ({ numberLabel, active = false }) => (
  <span
    className={`inline-flex items-center justify-center align-middle mx-1.5 select-none relative ${
      active ? 'scale-110' : ''
    } transition-transform`}
    style={{ width: '1.48em', height: '1.48em' }}
    aria-label={`آية ${numberLabel}`}
  >
    <svg
      viewBox="0 0 36 36"
      className="w-full h-full"
      aria-hidden="true"
    >
      <g
        fill={active ? 'color-mix(in srgb, var(--gold) 28%, transparent)' : 'color-mix(in srgb, var(--gold) 9%, transparent)'}
        stroke={active ? 'var(--gold2)' : 'var(--gold)'}
        strokeWidth="1.3"
      >
        <polygon points="18,2.5 22.8,7.2 29.5,7.2 29.5,13.9 34.2,18 29.5,22.1 29.5,28.8 22.8,28.8 18,33.5 13.2,28.8 6.5,28.8 6.5,22.1 1.8,18 6.5,13.9 6.5,7.2 13.2,7.2" />
      </g>
      <circle
        cx="18"
        cy="18"
        r="10.2"
        fill="none"
        stroke="color-mix(in srgb, var(--gold) 45%, transparent)"
        strokeWidth="0.8"
      />
    </svg>
    <span
      className="absolute inset-0 flex items-center justify-center font-amiri font-bold leading-none"
      style={{
        fontSize: numberLabel.length > 2 ? '0.46em' : '0.56em',
        color: active ? 'var(--gold3)' : 'var(--gold2)',
      }}
    >
      {numberLabel}
    </span>
  </span>
);

/** Classical Medina/Mamluk illuminated Surah header cartouche (Unwan) */
export const SurahIlluminatedBanner: React.FC<{
  title: string;
  subtitle?: string;
  leftMeta?: string;
  rightMeta?: string;
  badge?: React.ReactNode;
}> = ({ title, subtitle, leftMeta, rightMeta, badge }) => (
  <div className="relative rounded-[22px] overflow-hidden border border-[var(--gold)]/35 bg-gradient-to-b from-[var(--bg3)]/95 via-[var(--bg2)] to-[var(--bg2)] px-4 py-5 sm:px-8 sm:py-6 text-center shadow-[0_14px_40px_-18px_rgba(0,0,0,0.75)]">
    {/* Inner double hairline manuscript border */}
    <div
      className="pointer-events-none absolute inset-[6px] rounded-[16px] border border-[var(--gold)]/20"
      aria-hidden="true"
    />
    {/* Subtle radial gold illumination */}
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          'radial-gradient(60% 80% at 50% 0%, color-mix(in srgb, var(--gold) 14%, transparent), transparent 72%)',
      }}
      aria-hidden="true"
    />
    {/* Corner ornamental diamonds */}
    <svg
      className="pointer-events-none absolute top-2.5 right-2.5 w-4 h-4 text-[var(--gold)]/55"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M1 1h6M1 1v6M5 5l3-3 3 3-3 3z" stroke="currentColor" strokeWidth="1" />
    </svg>
    <svg
      className="pointer-events-none absolute top-2.5 left-2.5 w-4 h-4 text-[var(--gold)]/55 -scale-x-100"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M1 1h6M1 1v6M5 5l3-3 3 3-3 3z" stroke="currentColor" strokeWidth="1" />
    </svg>
    <svg
      className="pointer-events-none absolute bottom-2.5 right-2.5 w-4 h-4 text-[var(--gold)]/55 -scale-y-100"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M1 1h6M1 1v6M5 5l3-3 3 3-3 3z" stroke="currentColor" strokeWidth="1" />
    </svg>
    <svg
      className="pointer-events-none absolute bottom-2.5 left-2.5 w-4 h-4 text-[var(--gold)]/55 scale-[-1]"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M1 1h6M1 1v6M5 5l3-3 3 3-3 3z" stroke="currentColor" strokeWidth="1" />
    </svg>

    <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-4">
      <div className="hidden sm:flex flex-col items-center justify-center min-w-[76px] px-2.5 py-1.5 rounded-xl bg-[var(--bg)]/55 border border-[var(--gold)]/20">
        <span className="text-[0.68rem] font-bold text-[var(--gold2)] whitespace-nowrap">
          {rightMeta}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="inline-flex items-center justify-center gap-2">
          <span className="hidden xs:inline-block w-6 h-[1px] bg-gradient-to-l from-[var(--gold)]/70 to-transparent" />
          <h1 className="font-amiri text-2xl sm:text-3xl font-bold text-[var(--gold2)] tracking-wide leading-tight flex items-center justify-center gap-2">
            <span>{title}</span>
            {badge}
          </h1>
          <span className="hidden xs:inline-block w-6 h-[1px] bg-gradient-to-r from-[var(--gold)]/70 to-transparent" />
        </div>
        {subtitle && (
          <p className="text-[0.72rem] text-[var(--text2)] mt-1">{subtitle}</p>
        )}
        <div className="sm:hidden flex items-center justify-center gap-2 mt-2">
          {rightMeta && (
            <span className="text-[0.66rem] font-semibold text-[var(--gold2)] px-2.5 py-0.5 rounded-full bg-[var(--bg)]/60 border border-[var(--gold)]/20">
              {rightMeta}
            </span>
          )}
          {leftMeta && (
            <span className="text-[0.66rem] font-semibold text-[var(--text2)] px-2.5 py-0.5 rounded-full bg-[var(--bg)]/60 border border-[var(--border2)]">
              {leftMeta}
            </span>
          )}
        </div>
      </div>

      <div className="hidden sm:flex flex-col items-center justify-center min-w-[76px] px-2.5 py-1.5 rounded-xl bg-[var(--bg)]/55 border border-[var(--gold)]/20">
        <span className="text-[0.68rem] font-bold text-[var(--text2)] whitespace-nowrap">
          {leftMeta}
        </span>
      </div>
    </div>
  </div>
);

/** Subtle hairline gold divider with central octagonal diamond */
export const GoldDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
    <span className="flex-1 h-[1px] bg-gradient-to-l from-[var(--gold)]/35 via-[var(--gold)]/12 to-transparent" />
    <svg className="w-3.5 h-3.5 text-[var(--gold)]/65 shrink-0" viewBox="0 0 16 16" fill="none">
      <rect x="4.5" y="4.5" width="7" height="7" transform="rotate(45 8 8)" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" />
    </svg>
    <span className="flex-1 h-[1px] bg-gradient-to-r from-[var(--gold)]/35 via-[var(--gold)]/12 to-transparent" />
  </div>
);

/** Ornamental Bismillah framing */
export const BismillahBanner: React.FC<{
  text: string;
  fontFamily: string;
}> = ({ text, fontFamily }) => (
  <div className="my-5 sm:my-7 text-center px-3">
    <div className="inline-flex flex-col items-center gap-2 max-w-full">
      <div
        className="font-quran text-2xl sm:text-[2rem] text-[var(--gold2)] dir-rtl select-none leading-[1.9] text-glow"
        style={{ fontFamily }}
      >
        {text}
      </div>
      <GoldDivider className="w-44 sm:w-56 opacity-80" />
    </div>
  </div>
);

/** Subtle pointed Mihrab architectural arch backdrop for Hero sanctuary cards */
export const MihrabBackdrop: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 400 220"
    preserveAspectRatio="xMidYMin slice"
    className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="mihrabGlow" cx="50%" cy="15%" r="70%">
        <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.14" />
        <stop offset="65%" stopColor="var(--gold)" stopOpacity="0.03" />
        <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="400" height="220" fill="url(#mihrabGlow)" />
    {/* Pointed Islamic Mihrab arch outline */}
    <path
      d="M52 220 V110 C52 55 128 24 200 10 C272 24 348 55 348 110 V220"
      fill="none"
      stroke="var(--gold)"
      strokeOpacity="0.16"
      strokeWidth="1.2"
    />
    <path
      d="M64 220 V114 C64 64 134 35 200 22 C266 35 336 64 336 114 V220"
      fill="none"
      stroke="var(--gold)"
      strokeOpacity="0.08"
      strokeWidth="1"
      strokeDasharray="3 4"
    />
    {/* Crown finial diamond */}
    <path
      d="M200 4 L204 10 L200 16 L196 10 Z"
      fill="var(--gold)"
      fillOpacity="0.32"
    />
  </svg>
);

/** Bespoke geometric emblem for the Mushaf logo */
export const MushafLogoEmblem: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
    <rect
      x="7"
      y="7"
      width="22"
      height="22"
      rx="2.5"
      stroke="var(--gold)"
      strokeWidth="1.5"
      fill="color-mix(in srgb, var(--gold) 12%, transparent)"
    />
    <rect
      x="7"
      y="7"
      width="22"
      height="22"
      rx="2.5"
      transform="rotate(45 18 18)"
      stroke="var(--gold2)"
      strokeWidth="1.35"
      fill="color-mix(in srgb, var(--gold) 8%, transparent)"
    />
    <path
      d="M12.5 14.5 C15 13.5 17 14 18 15.4 C19 14 21 13.5 23.5 14.5 V22.2 C21 21.3 19 21.8 18 23 C17 21.8 15 21.3 12.5 22.2 Z"
      stroke="var(--gold3)"
      strokeWidth="1.3"
      strokeLinejoin="round"
      fill="color-mix(in srgb, var(--gold) 18%, transparent)"
    />
    <line x1="18" y1="15.4" x2="18" y2="23" stroke="var(--gold3)" strokeWidth="1.1" />
  </svg>
);

/** Bespoke architectural line icons replacing emojis across all navigation surfaces */
export const SectionIcon: React.FC<{
  id: Section;
  className?: string;
  active?: boolean;
}> = ({ id, className = 'w-5 h-5', active = false }) => {
  const sw = active ? 2 : 1.7;
  switch (id) {
    case 'quran':
      // Open Mushaf on wooden Rehal stand
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M3.5 6.5C6.5 5.2 9.8 5.6 12 7.5C14.2 5.6 17.5 5.2 20.5 6.5V17.5C17.5 16.3 14.2 16.7 12 18.5C9.8 16.7 6.5 16.3 3.5 17.5V6.5Z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
            fill={active ? 'currentColor' : 'none'}
            fillOpacity={active ? 0.14 : 0}
          />
          <path d="M12 7.5V18.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
          <path d="M8 21L12 18.5L16 21" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'prayer':
      // Mosque dome & crescent minaret
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 3.5V5.5M6.5 13C6.5 9.6 9 7.2 12 5.5C15 7.2 17.5 9.6 17.5 13H6.5Z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
            fill={active ? 'currentColor' : 'none'}
            fillOpacity={active ? 0.14 : 0}
          />
          <path d="M4.5 20.5V13H19.5V20.5M3 20.5H21" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 20.5V17C10 15.8 10.9 15 12 15C13.1 15 14 15.8 14 17V20.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case 'azkar':
      // Crescent & glowing morning/evening star
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
            fill={active ? 'currentColor' : 'none'}
            fillOpacity={active ? 0.14 : 0}
          />
          <path
            d="M16.5 4.5L17.4 6.6L19.5 7.5L17.4 8.4L16.5 10.5L15.6 8.4L13.5 7.5L15.6 6.6L16.5 4.5Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'tasbih':
      // Prayer beads loop (Misbaha)
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="5.5" r="2" stroke="currentColor" strokeWidth={sw} />
          <circle cx="17.2" cy="8.2" r="1.8" stroke="currentColor" strokeWidth={sw} />
          <circle cx="17.8" cy="14" r="1.8" stroke="currentColor" strokeWidth={sw} />
          <circle cx="12" cy="17.5" r="2" stroke="currentColor" strokeWidth={sw} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.25 : 0} />
          <circle cx="6.2" cy="14" r="1.8" stroke="currentColor" strokeWidth={sw} />
          <circle cx="6.8" cy="8.2" r="1.8" stroke="currentColor" strokeWidth={sw} />
          <path d="M12 19.5V22M10.4 21.8L12 20.5L13.6 21.8" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'asma':
      // Octagonal Rub el Hizb calligraphic star
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect
            x="5.5"
            y="5.5"
            width="13"
            height="13"
            rx="1.5"
            stroke="currentColor"
            strokeWidth={sw}
            fill={active ? 'currentColor' : 'none'}
            fillOpacity={active ? 0.12 : 0}
          />
          <rect
            x="5.5"
            y="5.5"
            width="13"
            height="13"
            rx="1.5"
            transform="rotate(45 12 12)"
            stroke="currentColor"
            strokeWidth={sw}
          />
          <circle cx="12" cy="12" r="2.2" fill="currentColor" />
        </svg>
      );
    case 'ruqyah':
      // Shield with inner geometric diamond
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 3L19 6V11.8C19 16.4 16 19.8 12 21.2C8 19.8 5 16.4 5 11.8V6L12 3Z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
            fill={active ? 'currentColor' : 'none'}
            fillOpacity={active ? 0.14 : 0}
          />
          <path
            d="M12 8.2L14.8 11.5L12 14.8L9.2 11.5L12 8.2Z"
            stroke="currentColor"
            strokeWidth={1.5}
          />
        </svg>
      );
    case 'support':
      // Warm heart with subtle sparkle
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 20.2C12 20.2 4.5 15.4 4.5 9.6C4.5 6.8 6.7 4.8 9.2 4.8C10.7 4.8 11.6 5.6 12 6.5C12.4 5.6 13.3 4.8 14.8 4.8C17.3 4.8 19.5 6.8 19.5 9.6C19.5 15.4 12 20.2 12 20.2Z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
            fill={active ? 'currentColor' : 'none'}
            fillOpacity={active ? 0.2 : 0}
          />
        </svg>
      );
    case 'about':
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth={sw} />
          <path d="M12 11V16M12 8H12.01" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
  }
};
