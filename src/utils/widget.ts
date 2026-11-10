import { registerPlugin } from '@capacitor/core';

export interface WidgetLaunchTarget { surah?: number; ayah?: number; section?: string }

interface WidgetBridgePlugin {
  setWidgetData(options: {
    mode?: 'ayah' | 'prayer';
    ayah?: string;
    surah?: string;
    prayers?: string;
    city?: string;
    country?: string;
    method?: number;
    timings?: string; // JSON {Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha} "HH:mm"
    date?: string; // YYYY-MM-DD the timings belong to
  }): Promise<{ updated: boolean }>;
  getLaunchTarget(): Promise<WidgetLaunchTarget>;
  addListener(event: 'widgetOpen', fn: (t: WidgetLaunchTarget) => void): Promise<{ remove: () => void }>;
}

const WidgetBridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge');
const isNative = () => !!(window as any).Capacitor?.isNativePlatform?.();

export async function syncWidgetData(data: Parameters<WidgetBridgePlugin['setWidgetData']>[0]): Promise<void> {
  if (!isNative()) return; // widgets exist only in the Android app
  try {
    await WidgetBridge.setWidgetData(data);
  } catch (error) {
    console.debug('Widget sync unavailable:', error);
  }
}

/** When the app was opened from a home-screen widget, where should it go? (Android only) */
export async function listenForWidgetLaunch(go: (t: WidgetLaunchTarget) => void): Promise<() => void> {
  if (!isNative()) return () => {};
  try {
    const first = await WidgetBridge.getLaunchTarget();
    if (first && (first.surah || first.section)) go(first);
    const h = await WidgetBridge.addListener('widgetOpen', (t) => go(t));
    return () => h.remove();
  } catch {
    return () => {};
  }
}
