import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';

export async function requestLocationPermission(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const result = await Geolocation.requestPermissions();
      return result.location === 'granted' || result.coarseLocation === 'granted';
    }

    if (navigator.permissions?.query) {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      if (status.state === 'denied') return false;
    }
    return true;
  } catch (error) {
    console.warn('Location permission request failed:', error);
    return false;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    }

    if (!('Notification' in window)) return false;
    return (await Notification.requestPermission()) === 'granted';
  } catch (error) {
    console.warn('Notification permission request failed:', error);
    return false;
  }
}

/** Requests Android RECORD_AUDIO permission through the WebView media API. */
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    if (!navigator.mediaDevices?.getUserMedia) return false;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (error) {
    console.warn('Microphone permission request failed:', error);
    return false;
  }
}
