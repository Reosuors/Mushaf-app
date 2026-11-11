import { registerPlugin } from '@capacitor/core';

/**
 * Donations.
 * - Installed from Google Play  → Google Play Billing only (one-time "support_*" products).
 * - Everywhere else (website, Windows, Mac, APK from GitHub) → the existing Ko-fi / Buy Me a Coffee page.
 * The Play install never shows or opens an external payment link (Google Play payments policy).
 */

export const SUPPORT_PRODUCT_IDS = ['support_1', 'support_3', 'support_5', 'support_10'];

export type DonationMode = 'play' | 'external';
export type DonationStatus = 'success' | 'pending' | 'cancelled' | 'error';

export interface SupportProduct {
  productId: string;
  title?: string;
  price: string; // formatted by Google Play in the donor's own currency
  priceMicros?: number;
  currency?: string;
}

interface PlayBillingPlugin {
  getInstallSource(): Promise<{ installer?: string | null; fromPlay: boolean }>;
  getProducts(options: { productIds: string[] }): Promise<{ products: SupportProduct[]; responseCode?: number }>;
  purchase(options: { productId: string }): Promise<{ status: DonationStatus; productId?: string; responseCode?: number }>;
  finishPending(): Promise<void>;
  addListener(event: 'donationCompleted', fn: (e: { status: DonationStatus; productId?: string }) => void): Promise<{ remove: () => void }>;
}

const PlayBilling = registerPlugin<PlayBillingPlugin>('PlayBilling');

/** Test hook (Playwright): window.__mushafBillingTest can stand in for the native plugin. */
const impl = (): PlayBillingPlugin => ((window as any).__mushafBillingTest as PlayBillingPlugin) || PlayBilling;

const isAndroidApp = (): boolean => {
  if ((window as any).__mushafBillingTest) return true;
  const cap = (window as any).Capacitor;
  return !!cap?.isNativePlatform?.() && cap?.getPlatform?.() === 'android';
};

let modePromise: Promise<DonationMode> | null = null;

export function getDonationMode(): Promise<DonationMode> {
  if (!modePromise) {
    modePromise = (async () => {
      if (!isAndroidApp()) return 'external'; // website, Windows, Mac
      try {
        const src = await impl().getInstallSource();
        return src.fromPlay ? 'play' : 'external'; // sideloaded APK keeps Ko-fi
      } catch {
        return 'play'; // unsure inside the Android app: never risk an external link
      }
    })();
  }
  return modePromise;
}

export async function loadSupportProducts(): Promise<SupportProduct[]> {
  try {
    const res = await impl().getProducts({ productIds: SUPPORT_PRODUCT_IDS });
    const list = (res?.products || []).filter((p) => p && p.productId && p.price);
    const order = (id: string) => SUPPORT_PRODUCT_IDS.indexOf(id);
    return list.sort((a, b) => order(a.productId) - order(b.productId));
  } catch {
    return [];
  }
}

export async function donate(productId: string): Promise<DonationStatus> {
  try {
    const res = await impl().purchase({ productId });
    return res?.status || 'error';
  } catch {
    return 'error';
  }
}

/** Consume payments that finished later (pending) so they are acknowledged in time. */
export async function finishPendingDonations(onDone?: () => void): Promise<() => void> {
  let remove = () => {};
  try {
    const h = await impl().addListener('donationCompleted', (e) => {
      if (e?.status === 'success') onDone?.();
    });
    remove = () => h.remove();
    await impl().finishPending();
  } catch {
    /* billing not available: nothing to finish */
  }
  return remove;
}
