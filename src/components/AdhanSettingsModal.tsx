import React, { useState, useEffect, useRef } from 'react';
import {
  AdhanSettings,
  loadAdhanSettings,
  saveAdhanSettings,
  getNotificationPermissionStatus,
} from '../utils/prayerNotifications';
import { requestNotificationPermission as requestNativeOrWebNotificationPermission } from '../utils/permissions';
import {
  ADHAN_SOUND_OPTIONS,
  AdhanSoundType,
  playAdhanSound,
  stopAdhanAudio,
  saveCustomAdhanAudio,
  getCustomAdhanAudio,
  removeCustomAdhanAudio,
} from '../utils/adhanAudio';
import { getUIStrings } from '../utils/uiTranslations';
import { TRANSLATIONS } from '../data/translations';
import {
  Bell,
  BellRing,
  BellOff,
  Volume2,
  Play,
  Square,
  Check,
  X,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Upload,
  Music,
  Trash2,
  FileAudio,
} from 'lucide-react';

interface AdhanSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

export const AdhanSettingsModal: React.FC<AdhanSettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';
  const ui = getUIStrings(lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;

  const [settings, setSettings] = useState<AdhanSettings>(loadAdhanSettings);
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermissionStatus);
  const [playingPreview, setPlayingPreview] = useState<AdhanSoundType | null>(null);
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(loadAdhanSettings());
      setPermission(getNotificationPermissionStatus());
      getCustomAdhanAudio().then((res) => {
        if (res) {
          setCustomFileName(res.name);
        } else {
          setCustomFileName(null);
        }
      });
    } else {
      stopAdhanAudio();
      setPlayingPreview(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleMaster = (enabled: boolean) => {
    const next = { ...settings, enabled };
    setSettings(next);
    saveAdhanSettings(next);
  };

  const handleSelectSound = (soundType: AdhanSoundType) => {
    const next = { ...settings, soundType };
    setSettings(next);
    saveAdhanSettings(next);
  };

  const handleTogglePrayer = (pKey: keyof AdhanSettings['prayers']) => {
    const next = {
      ...settings,
      prayers: {
        ...settings.prayers,
        [pKey]: !settings.prayers[pKey],
      },
    };
    setSettings(next);
    saveAdhanSettings(next);
  };

  const handleVolumeChange = (vol: number) => {
    const next = { ...settings, volume: vol };
    setSettings(next);
    saveAdhanSettings(next);
  };

  const handleRequestPermission = async () => {
    const granted = await requestNativeOrWebNotificationPermission();
    const res: NotificationPermission = granted ? 'granted' : 'denied';
    setPermission(res);
    if (res === 'granted') {
      try {
        new Notification(ui.adhanTestNotificationTitle, {
          body: ui.adhanTestNotificationBody,
          icon: '/app-favicon.ico',
        });
      } catch {}
    }
  };

  const handlePreviewSound = (soundType: AdhanSoundType) => {
    if (playingPreview === soundType) {
      stopAdhanAudio();
      setPlayingPreview(null);
    } else {
      setPlayingPreview(soundType);
      playAdhanSound(soundType, settings.volume, () => {
        setPlayingPreview(null);
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const name = await saveCustomAdhanAudio(file);
      setCustomFileName(name);
      handleSelectSound('custom');
    } catch (err) {
      console.error('Error uploading audio:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveCustomAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await removeCustomAdhanAudio();
    setCustomFileName(null);
    if (settings.soundType === 'custom') {
      handleSelectSound('takbeer');
    }
  };

  const handleSendTestNotification = () => {
    if (permission === 'granted') {
      try {
        new Notification(ui.adhanTestNotificationTitle, {
          body: ui.adhanTestNotificationBody,
          icon: '/app-favicon.ico',
        });
      } catch {}
    }
    playAdhanSound(settings.soundType, settings.volume);
  };

  const prayersList: { key: keyof AdhanSettings['prayers']; label: string; icon: string }[] = [
    { key: 'Fajr', label: t.fajr || 'Fajr', icon: '🌄' },
    { key: 'Sunrise', label: t.sunrise || 'Sunrise', icon: '🌅' },
    { key: 'Dhuhr', label: t.dhuhr || 'Dhuhr', icon: '🌞' },
    { key: 'Asr', label: t.asr || 'Asr', icon: '🌤' },
    { key: 'Maghrib', label: t.maghrib || 'Maghrib', icon: '🌇' },
    { key: 'Isha', label: t.isha || 'Isha', icon: '🌙' },
  ];

  const getOptionName = (id: AdhanSoundType) => {
    switch (id) {
      case 'takbeer':
        return ui.adhanTakbeerName;
      case 'adhan_full':
        return ui.adhanFullName;
      case 'custom':
        return ui.adhanCustomName;
      case 'silent':
        return ui.adhanSilentName;
      default:
        return id;
    }
  };

  const getOptionDesc = (id: AdhanSoundType) => {
    switch (id) {
      case 'takbeer':
        return ui.adhanTakbeerDesc;
      case 'adhan_full':
        return ui.adhanFullDesc;
      case 'custom':
        return ui.adhanCustomDesc;
      case 'silent':
        return ui.adhanSilentDesc;
      default:
        return '';
    }
  };

  return (
    <div
      id="adhan-settings-modal"
      onClick={onClose}
      className="fixed inset-0 z-[950] bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--bg2)] border-t sm:border border-[var(--border2)] rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl animate-sheet-up flex flex-col space-y-4"
      >
        {/* Top Handle */}
        <div className="w-10 h-1 bg-[var(--border2)] rounded-full mx-auto" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border2)]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[var(--gold)]/15 border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)]">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-amiri text-lg sm:text-xl font-bold text-[var(--gold2)]">
                {ui.adhanSettingsTitle}
              </h3>
              <p className="text-xs text-[var(--text2)]">
                {ui.adhanSettingsSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg3)] text-[var(--text2)] flex items-center justify-center hover:text-[var(--text)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Master Toggle */}
        <div className="bg-[var(--bg3)] border border-[var(--border2)] rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {settings.enabled ? (
              <Bell className="w-5 h-5 text-emerald-400" />
            ) : (
              <BellOff className="w-5 h-5 text-[var(--text3)]" />
            )}
            <div>
              <span className="text-xs sm:text-sm font-bold text-[var(--text)] block">
                {ui.adhanEnableAlerts}
              </span>
              <span className="text-[0.68rem] text-[var(--text2)]">
                {settings.enabled ? ui.adhanAlertsActive : ui.adhanAlertsDisabled}
              </span>
            </div>
          </div>

          <button
            onClick={() => handleToggleMaster(!settings.enabled)}
            className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
              settings.enabled ? 'bg-emerald-500 justify-end' : 'bg-[var(--bg4)] justify-start'
            }`}
          >
            <span className="w-4.5 h-4.5 rounded-full bg-white shadow-md block" />
          </button>
        </div>

        {/* Browser Permission Prompt Banner */}
        {permission !== 'granted' && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-[0.72rem] text-amber-200">
                {ui.adhanPermissionRequired}
              </div>
            </div>
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-extrabold text-[0.7rem] hover:brightness-110 active:scale-95 shrink-0 cursor-pointer shadow"
            >
              {ui.adhanAllowPermission}
            </button>
          </div>
        )}

        {permission === 'granted' && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-3 py-2 flex items-center gap-2 text-emerald-300 text-[0.72rem]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{ui.adhanPermissionGranted}</span>
          </div>
        )}

        {/* 4 Strict Adhan Sound Choices */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[var(--gold)] uppercase tracking-wide">
              {ui.adhanSoundChoice}
            </label>
            <span className="text-[0.68rem] text-[var(--text3)]">
              {ui.adhanSoundChoiceSub}
            </span>
          </div>

          <div className="space-y-2">
            {ADHAN_SOUND_OPTIONS.map((opt) => {
              const isSelected = settings.soundType === opt.id;
              const isPlayingThis = playingPreview === opt.id;
              const name = getOptionName(opt.id);
              const desc = getOptionDesc(opt.id);

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectSound(opt.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-[var(--gold)]/10 border-[var(--gold)] shadow-[0_0_15px_rgba(201,168,76,0.15)]'
                      : 'bg-[var(--bg3)]/70 border-[var(--border2)] hover:border-[var(--text3)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-[var(--gold)] bg-[var(--gold)] text-black'
                          : 'border-[var(--text3)] bg-transparent'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[var(--text)] truncate">
                          {name}
                        </span>
                        {opt.badge && (
                          <span className="text-[0.6rem] px-1.5 py-0.5 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--gold)]/30 shrink-0">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[0.68rem] text-[var(--text2)] line-clamp-1">
                        {desc}
                      </p>

                      {opt.id === 'custom' && customFileName && (
                        <div className="mt-1 flex items-center gap-1.5 text-[0.68rem] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 max-w-fit">
                          <FileAudio className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[180px]">{customFileName}</span>
                          <button
                            onClick={handleRemoveCustomAudio}
                            className="text-red-400 hover:text-red-300 ml-1 p-0.5 cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {opt.id === 'custom' && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="p-2 rounded-xl bg-[var(--bg4)] hover:bg-[var(--gold)]/20 text-[var(--gold2)] hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span className="text-[0.65rem] font-bold">{ui.adhanUploadBtn}</span>
                        </button>
                      </>
                    )}

                    {opt.id !== 'silent' && (
                      <button
                        onClick={() => handlePreviewSound(opt.id)}
                        className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                          isPlayingThis
                            ? 'bg-amber-500 text-black shadow-md scale-105'
                            : 'bg-[var(--bg4)] text-[var(--text2)] hover:text-white hover:bg-[var(--gold)]/20'
                        }`}
                      >
                        {isPlayingThis ? (
                          <Square className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Volume Slider */}
        <div className="bg-[var(--bg3)] border border-[var(--border2)] rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text2)] font-semibold flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-[var(--gold)]" />
              <span>{ui.adhanVolume}</span>
            </span>
            <span className="font-mono font-bold text-[var(--gold2)]">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={settings.volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[var(--bg4)] rounded-lg appearance-none cursor-pointer accent-[var(--gold)]"
          />
        </div>

        {/* Individual Prayer Toggles */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--gold)] uppercase tracking-wide block">
            {ui.adhanPrayersToAlert}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {prayersList.map((p) => {
              const isChecked = settings.prayers[p.key];
              return (
                <button
                  key={p.key}
                  onClick={() => handleTogglePrayer(p.key)}
                  className={`p-2.5 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between ${
                    isChecked
                      ? 'bg-[var(--gold)]/10 border-[var(--gold)] text-[var(--text)]'
                      : 'bg-[var(--bg3)] border-[var(--border2)] text-[var(--text3)] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{p.icon}</span>
                    <span className="text-xs font-bold truncate">
                      {p.label}
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      isChecked
                        ? 'border-[var(--gold)] bg-[var(--gold)] text-black'
                        : 'border-[var(--text3)]'
                    }`}
                  >
                    {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Test Alert Button */}
        <div className="pt-2">
          <button
            onClick={handleSendTestNotification}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-98 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{ui.adhanTestBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
