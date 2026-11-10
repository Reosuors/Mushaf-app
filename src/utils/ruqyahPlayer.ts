import { Reciter } from '../types';
import { getAyahAudioCandidates } from './quranAudio';
import { ruqyahAyahList } from '../data/ruqyah';
import { SURAHS } from '../data/surahs';

/** One persistent <audio> element that walks the whole ruqyah verse by verse (everyayah per-ayah files,
 * the user's chosen reciter). Lives at module level so playback survives navigation inside the app. */
export interface RuqyahPlayerState {
  index: number; // position in the playlist
  playing: boolean;
  loading: boolean;
  repeat: boolean;
  sleepEndsAt: number | null; // ms epoch, or -1 = stop at end of ruqyah
  error: string | null;
  reciter: Reciter | null;
}

export const RUQYAH_LIST = ruqyahAyahList();
let state: RuqyahPlayerState = { index: 0, playing: false, loading: false, repeat: false, sleepEndsAt: null, error: null, reciter: null };
const listeners = new Set<() => void>();
let audio: HTMLAudioElement | null = null;
let preload: HTMLAudioElement | null = null;
let candidateIdx = 0;
let endedAll = false;
let sleepTimer: ReturnType<typeof setTimeout> | null = null;

function set(p: Partial<RuqyahPlayerState>) {
  state = { ...state, ...p };
  listeners.forEach((l) => l());
}
export function subscribeRuqyah(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }
export function getRuqyahState() { return state; }

function ensureAudio(): HTMLAudioElement {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = 'auto';
  audio.addEventListener('ended', () => next(true));
  audio.addEventListener('playing', () => set({ playing: true, loading: false, error: null }));
  audio.addEventListener('waiting', () => set({ loading: true }));
  audio.addEventListener('pause', () => { if (!audio?.ended) set({ playing: false }); });
  audio.addEventListener('error', () => {
    // try the next candidate URL for this ayah, else skip it
    const item = RUQYAH_LIST[state.index];
    const c = getAyahAudioCandidates(item.surah, item.ayah, state.reciter);
    if (candidateIdx + 1 < c.length) { candidateIdx++; load(state.index, true); return; }
    if (!navigator.onLine) { set({ playing: false, loading: false, error: 'لا يوجد اتصال بالإنترنت — الاستماع يحتاج نت' }); return; }
    set({ error: 'تعذّر تشغيل آية، تم تخطيها' });
    next(true);
  });
  return audio;
}

function mediaSession(i: number) {
  const ms = (navigator as any).mediaSession;
  if (!ms || typeof (window as any).MediaMetadata === 'undefined') return;
  const it = RUQYAH_LIST[i];
  ms.metadata = new (window as any).MediaMetadata({
    title: `الرقية الشرعية — ${SURAHS[it.surah - 1].ar} ${it.ayah}`,
    artist: state.reciter?.name || '',
    album: 'مصحف',
    artwork: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
  });
  try {
    ms.setActionHandler('play', () => play());
    ms.setActionHandler('pause', () => pause());
    ms.setActionHandler('nexttrack', () => next(false));
    ms.setActionHandler('previoustrack', () => prev());
  } catch { /* unsupported action */ }
}

function load(i: number, autoplay: boolean) {
  endedAll = false;
  const a = ensureAudio();
  const it = RUQYAH_LIST[i];
  const c = getAyahAudioCandidates(it.surah, it.ayah, state.reciter);
  a.src = c[Math.min(candidateIdx, c.length - 1)];
  set({ index: i, loading: autoplay });
  mediaSession(i);
  if (autoplay) {
    a.play().catch(() => set({ playing: false, loading: false }));
    // warm the next verse so the gap between ayahs is short
    const n = RUQYAH_LIST[i + 1];
    if (n) { preload = preload || new Audio(); preload.preload = 'auto'; preload.src = getAyahAudioCandidates(n.surah, n.ayah, state.reciter)[0]; }
  }
}

export function setRuqyahReciter(r: Reciter | null) {
  const changed = state.reciter?.id !== r?.id;
  set({ reciter: r });
  if (changed && state.playing) { candidateIdx = 0; load(state.index, true); }
}

export function playRuqyah(index?: number) {
  window.dispatchEvent(new CustomEvent('ruqyah_play'));
  candidateIdx = 0;
  if (typeof index === 'number') { load(index, true); return; }
  const a = ensureAudio();
  if (!a.src || endedAll) { endedAll = false; load(state.index, true); return; }
  a.play().catch(() => set({ playing: false }));
}
export function play() { playRuqyah(); }
export function pause() { audio?.pause(); set({ playing: false, loading: false }); }
export function toggleRuqyah() { state.playing ? pause() : playRuqyah(); }
export function stopRuqyah() {
  if (audio) { audio.pause(); audio.currentTime = 0; }
  set({ playing: false, loading: false });
}
export function next(auto = false) {
  candidateIdx = 0;
  if (state.index + 1 < RUQYAH_LIST.length) { load(state.index + 1, true); return; }
  // end of the ruqyah
  if (state.repeat && state.sleepEndsAt !== -1) { load(0, true); return; }
  if (state.sleepEndsAt === -1) clearSleep();
  set({ playing: false, loading: false, index: auto ? 0 : state.index });
  endedAll = true;
}
export function prev() {
  candidateIdx = 0;
  load(Math.max(0, state.index - 1), true);
}
export function setRuqyahRepeat(v: boolean) { set({ repeat: v }); }

function clearSleep() { if (sleepTimer) clearTimeout(sleepTimer); sleepTimer = null; set({ sleepEndsAt: null }); }
/** minutes > 0: stop after N minutes; -1: stop at end of ruqyah; 0/null: off */
export function setRuqyahSleep(minutes: number | null) {
  if (sleepTimer) clearTimeout(sleepTimer);
  sleepTimer = null;
  if (!minutes) { set({ sleepEndsAt: null }); return; }
  if (minutes === -1) { set({ sleepEndsAt: -1 }); return; }
  const ends = Date.now() + minutes * 60_000;
  sleepTimer = setTimeout(() => { pause(); set({ sleepEndsAt: null }); }, minutes * 60_000);
  set({ sleepEndsAt: ends });
}
