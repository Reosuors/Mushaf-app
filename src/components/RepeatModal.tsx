import React, { useState, useEffect } from 'react';
import { SURAHS } from '../data/surahs';
import { Reciter, RepeatSession } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Repeat, Play, Pause, Square, X, Layers, Hash } from 'lucide-react';

interface RepeatModalProps {
  isOpen: boolean;
  currentSurahNumber: number | null;
  reciters: Reciter[];
  selectedReciter: Reciter | null;
  activeSession: RepeatSession | null;
  isPaused: boolean;
  activeAyahText: string;
  onStartSession: (session: RepeatSession) => void;
  onTogglePause: () => void;
  onStopSession: () => void;
  onClose: () => void;
  lang: string;
}

export const RepeatModal: React.FC<RepeatModalProps> = ({
  isOpen,
  currentSurahNumber,
  reciters,
  selectedReciter,
  activeSession,
  isPaused,
  activeAyahText,
  onStartSession,
  onTogglePause,
  onStopSession,
  onClose,
  lang,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;

  const [mode, setMode] = useState<'ayah' | 'surah'>('ayah');
  const [selectedSurah, setSelectedSurah] = useState<number>(currentSurahNumber || 1);
  const [ayahFrom, setAyahFrom] = useState<number>(1);
  const [ayahTo, setAyahTo] = useState<number>(7);
  const [ayahTimes, setAyahTimes] = useState<number>(3);
  const [selectedReciterId, setSelectedReciterId] = useState<number>(selectedReciter?.id || 0);

  const [surahFrom, setSurahFrom] = useState<number>(currentSurahNumber || 1);
  const [surahTo, setSurahTo] = useState<number>(currentSurahNumber || 1);
  const [surahTimes, setSurahTimes] = useState<number>(3);

  useEffect(() => {
    if (currentSurahNumber) {
      setSelectedSurah(currentSurahNumber);
      setSurahFrom(currentSurahNumber);
      setSurahTo(currentSurahNumber);
      const s = SURAHS.find((x) => x.n === currentSurahNumber);
      if (s) {
        setAyahTo(s.a);
      }
    }
  }, [currentSurahNumber]);

  useEffect(() => {
    if (selectedReciter) {
      setSelectedReciterId(selectedReciter.id);
    } else if (reciters.length > 0) {
      setSelectedReciterId(reciters[0].id);
    }
  }, [selectedReciter, reciters]);

  const handleSurahChange = (sn: number) => {
    setSelectedSurah(sn);
    const s = SURAHS.find((x) => x.n === sn);
    if (s) {
      setAyahFrom(1);
      setAyahTo(s.a);
    }
  };

  const handleStart = () => {
    const rec = reciters.find((r) => r.id === selectedReciterId) || reciters[0];
    if (!rec) {
      alert(t.noReciter || 'Please choose a reciter');
      return;
    }

    if (mode === 'ayah') {
      const s = SURAHS.find((x) => x.n === selectedSurah);
      const maxA = s ? s.a : 7;
      const f = Math.max(1, Math.min(ayahFrom, maxA));
      const to = Math.max(f, Math.min(ayahTo, maxA));
      onStartSession({
        mode: 'ayah',
        sn: selectedSurah,
        from: f,
        to: to,
        times: Math.max(1, ayahTimes),
        rec,
        rep: 0,
        stopped: false,
      });
    } else {
      const s1 = Math.min(surahFrom, surahTo);
      const s2 = Math.max(surahFrom, surahTo);
      onStartSession({
        mode: 'surah',
        s1,
        s2,
        times: Math.max(1, surahTimes),
        rec,
        rep: 0,
        stopped: false,
      });
    }
  };

  // If repeat progress is active, display the full-screen active repetition overlay
  if (activeSession && !activeSession.stopped) {
    const curSurahInfo = SURAHS.find((s) => s.n === (activeSession.sn || activeSession.s1));
    const label = (curSurahInfo ? (curSurahInfo[lang as keyof typeof curSurahInfo] || curSurahInfo.ar) : '');
    const circ = 395.8;
    const progressPct = activeSession.times > 0 ? (activeSession.rep / activeSession.times) * 100 : 0;
    const strokeOffset = circ * (1 - Math.min(100, progressPct) / 100);

    return (
      <div
        id="active-repeat-hud"
        className="fixed inset-0 z-[900] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
      >
        <div className="text-xs text-[var(--gold)] uppercase tracking-wider font-semibold mb-1">
          {activeSession.rec.name}
        </div>
        <h2 className="font-amiri text-3xl font-bold text-[var(--gold2)] mb-4 text-center">
          {t.surahWord} {label}
        </h2>

        {/* Circular Progress Gauge */}
        <div className="relative w-40 h-40 shrink-0 my-2">
          <svg className="-rotate-90 w-full h-full" viewBox="0 0 150 150">
            <circle
              fill="none"
              stroke="var(--border2)"
              cx="75"
              cy="75"
              r="63"
              strokeWidth="9"
            />
            <circle
              fill="none"
              stroke="var(--gold)"
              cx="75"
              cy="75"
              r="63"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={strokeOffset}
              className="transition-[stroke-dashoffset] duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-[var(--gold2)] leading-none">
              {activeSession.rep}
            </span>
            <span className="text-xs text-[var(--text3)] mt-1">/ {activeSession.times}</span>
          </div>
        </div>

        {/* Status text */}
        <div className="text-sm font-semibold text-[var(--text2)] mt-2 mb-1 text-center">
          {activeSession.mode === 'ayah'
            ? `${t.repeatAyah} · ${t.labelFrom} ${activeSession.from} ${t.labelTo} ${activeSession.to}`
            : `${t.repeatSurah} · ${activeSession.s1} → ${activeSession.s2}`}
        </div>

        {/* Live Ayah Text Banner */}
        {activeAyahText && (
          <div className="w-full max-w-lg bg-[var(--gold)]/5 border border-[var(--gold)]/20 rounded-2xl p-4 sm:p-5 my-4 text-center">
            <p className="font-quran text-xl sm:text-2xl leading-[2.4] text-[var(--text)] dir-rtl">
              {activeAyahText}
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={onTogglePause}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30 hover:bg-[var(--gold)]/25 active:scale-95 transition-all cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            <span>{isPaused ? t.resumeRepeat : t.pauseRepeat}</span>
          </button>
          <button
            onClick={onStopSession}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>{t.stopRepeat}</span>
          </button>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div
      id="repeat-setup-modal"
      onClick={onClose}
      className="fixed inset-0 z-[800] bg-black/80 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--bg2)] border-t sm:border border-[var(--border2)] rounded-t-3xl sm:rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl animate-sheet-up flex flex-col"
      >
        <div className="w-10 h-1.5 bg-[var(--border2)] rounded-full mx-auto mb-3" />

        <div className="flex items-center justify-between pb-3 border-b border-[var(--border2)] mb-4">
          <h3 className="font-amiri text-xl font-bold text-[var(--gold2)] flex items-center gap-2">
            <Repeat className="w-5 h-5 text-[var(--gold)]" />
            {t.repeatTitle || '🔁 تكرار التلاوة'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg3)] text-[var(--text2)] flex items-center justify-center hover:text-[var(--text)] active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setMode('ayah')}
            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
              mode === 'ayah'
                ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold2)] shadow-sm'
                : 'border-[var(--border2)] bg-[var(--bg3)] text-[var(--text2)] hover:border-[var(--gold)]/40'
            }`}
          >
            <Hash className="w-5 h-5" />
            <div className="text-xs font-bold">{t.repeatAyah}</div>
            <div className="text-[0.65rem] text-[var(--text3)]">{t.repeatAyahDesc}</div>
          </button>

          <button
            onClick={() => setMode('surah')}
            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
              mode === 'surah'
                ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold2)] shadow-sm'
                : 'border-[var(--border2)] bg-[var(--bg3)] text-[var(--text2)] hover:border-[var(--gold)]/40'
            }`}
          >
            <Layers className="w-5 h-5" />
            <div className="text-xs font-bold">{t.repeatSurah}</div>
            <div className="text-[0.65rem] text-[var(--text3)]">{t.repeatSurahDesc}</div>
          </button>
        </div>

        {/* Mode Panel */}
        {mode === 'ayah' ? (
          <div className="space-y-3.5">
            <div>
              <label className="block text-[0.68rem] font-bold text-[var(--gold)] uppercase mb-1">
                {t.labelSurah}
              </label>
              <select
                value={selectedSurah}
                onChange={(e) => handleSurahChange(parseInt(e.target.value))}
                className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-3 py-2.5 rounded-xl text-xs outline-none focus:border-[var(--gold)] cursor-pointer"
              >
                {SURAHS.map((s) => (
                  <option key={s.n} value={s.n}>
                    {s.n}. {s[lang as keyof typeof s] || s.ar} ({s.a} {t.ayah})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[0.68rem] font-bold text-[var(--gold)] uppercase mb-1">
                  {t.labelFrom}
                </label>
                <input
                  type="number"
                  min="1"
                  max={ayahTo}
                  value={ayahFrom}
                  onChange={(e) => setAyahFrom(parseInt(e.target.value) || 1)}
                  className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-2 py-2 rounded-xl text-xs text-center outline-none focus:border-[var(--gold)]"
                />
              </div>

              <div>
                <label className="block text-[0.68rem] font-bold text-[var(--gold)] uppercase mb-1">
                  {t.labelTo}
                </label>
                <input
                  type="number"
                  min={ayahFrom}
                  value={ayahTo}
                  onChange={(e) => setAyahTo(parseInt(e.target.value) || 1)}
                  className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-2 py-2 rounded-xl text-xs text-center outline-none focus:border-[var(--gold)]"
                />
              </div>

              <div>
                <label className="block text-[0.68rem] font-bold text-[var(--gold)] uppercase mb-1">
                  {t.labelTimes}
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={ayahTimes}
                  onChange={(e) => setAyahTimes(parseInt(e.target.value) || 1)}
                  className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-2 py-2 rounded-xl text-xs text-center outline-none focus:border-[var(--gold)]"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[0.68rem] font-bold text-[var(--gold)] uppercase mb-1">
                  {t.labelS1}
                </label>
                <select
                  value={surahFrom}
                  onChange={(e) => setSurahFrom(parseInt(e.target.value))}
                  className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-2 py-2.5 rounded-xl text-xs outline-none focus:border-[var(--gold)] cursor-pointer"
                >
                  {SURAHS.map((s) => (
                    <option key={s.n} value={s.n}>
                      {s.n}. {s[lang as keyof typeof s] || s.ar}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[0.68rem] font-bold text-[var(--gold)] uppercase mb-1">
                  {t.labelS2}
                </label>
                <select
                  value={surahTo}
                  onChange={(e) => setSurahTo(parseInt(e.target.value))}
                  className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-2 py-2.5 rounded-xl text-xs outline-none focus:border-[var(--gold)] cursor-pointer"
                >
                  {SURAHS.map((s) => (
                    <option key={s.n} value={s.n}>
                      {s.n}. {s[lang as keyof typeof s] || s.ar}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[0.68rem] font-bold text-[var(--gold)] uppercase mb-1">
                {t.labelTimes}
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={surahTimes}
                onChange={(e) => setSurahTimes(parseInt(e.target.value) || 1)}
                className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-3 py-2 rounded-xl text-xs text-center outline-none focus:border-[var(--gold)]"
              />
            </div>
          </div>
        )}

        {/* Reciter Selector */}
        <div className="mt-3.5">
          <label className="block text-[0.68rem] font-bold text-[var(--gold)] uppercase mb-1">
            {t.labelReciter}
          </label>
          <select
            value={selectedReciterId}
            onChange={(e) => setSelectedReciterId(parseInt(e.target.value))}
            className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-3 py-2.5 rounded-xl text-xs outline-none focus:border-[var(--gold)] cursor-pointer"
          >
            {reciters.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="w-full mt-5 py-3 rounded-xl bg-[var(--gold)] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-[var(--gold2)] active:scale-95 transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>{t.startRepeat}</span>
        </button>
      </div>
    </div>
  );
};
