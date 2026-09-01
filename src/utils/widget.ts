import { registerPlugin } from '@capacitor/core';

interface WidgetBridgePlugin {
  setWidgetData(options: {
    mode?: 'ayah' | 'prayer';
    ayah?: string;
    surah?: string;
    prayers?: string;
    city?: string;
  }): Promise<{ updated: boolean }>;
}

const WidgetBridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge');

export async function syncWidgetData(data: Parameters<WidgetBridgePlugin['setWidgetData']>[0]): Promise<void> {
  try {
    await WidgetBridge.setWidgetData(data);
  } catch (error) {
    // The bridge is unavailable on the web build; the app remains fully usable there.
    console.debug('Widget sync unavailable:', error);
  }
}
