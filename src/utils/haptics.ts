/**
 * Haptic Feedback Service for physical interaction confirmation using navigator.vibrate()
 * Supports customizable feedback profiles, intensity scaling, and persistent user preferences.
 */

export type HapticType =
  | 'tap'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'tasbih'
  | 'tasbih-cycle'
  | 'navigation'
  | 'success'
  | 'warning'
  | 'selection'
  | 'toggle';

export type HapticIntensity = 'soft' | 'medium' | 'strong';

const HAPTIC_STORAGE_KEY = 'quran_haptics_enabled';
const HAPTIC_INTENSITY_KEY = 'quran_haptics_intensity';

// Base vibration patterns in milliseconds
const PATTERNS: Record<HapticType, number | number[]> = {
  tap: 14,
  light: 12,
  medium: 28,
  heavy: 55,
  tasbih: 24,
  'tasbih-cycle': [35, 45, 35, 45, 65],
  navigation: 18,
  success: [25, 35, 45],
  warning: [35, 40, 35],
  selection: 10,
  toggle: 20,
};

// Intensity multipliers
const INTENSITY_FACTORS: Record<HapticIntensity, number> = {
  soft: 0.65,
  medium: 1.0,
  strong: 1.45,
};

/**
 * Check if the current browser and platform support vibration
 */
export function isHapticSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'vibrate' in navigator &&
    typeof navigator.vibrate === 'function'
  );
}

/**
 * Get whether haptic feedback is globally enabled by the user
 */
export function getHapticsEnabled(): boolean {
  if (typeof localStorage === 'undefined') return true;
  const stored = localStorage.getItem(HAPTIC_STORAGE_KEY);
  return stored !== null ? stored === 'true' : true;
}

/**
 * Set haptic feedback enabled state
 */
export function setHapticsEnabled(enabled: boolean): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(HAPTIC_STORAGE_KEY, String(enabled));
    window.dispatchEvent(new CustomEvent('haptics_settings_changed', { detail: { enabled } }));
  }
}

/**
 * Get current haptic intensity setting
 */
export function getHapticIntensity(): HapticIntensity {
  if (typeof localStorage === 'undefined') return 'medium';
  const stored = localStorage.getItem(HAPTIC_INTENSITY_KEY) as HapticIntensity;
  if (stored === 'soft' || stored === 'medium' || stored === 'strong') {
    return stored;
  }
  return 'medium';
}

/**
 * Set haptic intensity setting
 */
export function setHapticIntensity(intensity: HapticIntensity): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(HAPTIC_INTENSITY_KEY, intensity);
    window.dispatchEvent(new CustomEvent('haptics_settings_changed', { detail: { intensity } }));
  }
}

/**
 * Scale a vibration duration or pattern by the chosen intensity
 */
function scalePattern(pattern: number | number[], intensity: HapticIntensity): number | number[] {
  const factor = INTENSITY_FACTORS[intensity] || 1.0;
  if (typeof pattern === 'number') {
    return Math.max(5, Math.round(pattern * factor));
  }
  return pattern.map((val, idx) => {
    // Only scale vibration pulses (even indices: 0, 2, 4...), keep pause durations relatively stable
    if (idx % 2 === 0) {
      return Math.max(5, Math.round(val * factor));
    }
    return val;
  });
}

/**
 * Trigger physical haptic feedback
 */
export function triggerHaptic(typeOrPattern: HapticType | number | number[] = 'tap'): boolean {
  if (!isHapticSupported() || !getHapticsEnabled()) {
    return false;
  }

  try {
    const intensity = getHapticIntensity();
    let rawPattern: number | number[];

    if (typeof typeOrPattern === 'string') {
      rawPattern = PATTERNS[typeOrPattern] || PATTERNS.tap;
    } else {
      rawPattern = typeOrPattern;
    }

    const finalPattern = scalePattern(rawPattern, intensity);
    return navigator.vibrate(finalPattern);
  } catch (err) {
    // Graceful silent fallback if vibration fails or is restricted by browser policy
    return false;
  }
}

/**
 * Comprehensive Haptic Feedback Helper Object
 */
export const hapticFeedback = {
  // Common action triggers
  tap: () => triggerHaptic('tap'),
  light: () => triggerHaptic('light'),
  medium: () => triggerHaptic('medium'),
  heavy: () => triggerHaptic('heavy'),
  tasbih: () => triggerHaptic('tasbih'),
  tasbihCycle: () => triggerHaptic('tasbih-cycle'),
  navigation: () => triggerHaptic('navigation'),
  success: () => triggerHaptic('success'),
  warning: () => triggerHaptic('warning'),
  selection: () => triggerHaptic('selection'),
  toggle: () => triggerHaptic('toggle'),
  custom: (pattern: number | number[]) => triggerHaptic(pattern),

  // Configuration and status
  isSupported: isHapticSupported,
  isEnabled: getHapticsEnabled,
  setEnabled: setHapticsEnabled,
  getIntensity: getHapticIntensity,
  setIntensity: setHapticIntensity,
};
