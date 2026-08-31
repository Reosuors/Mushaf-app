import React, { useState, useEffect } from 'react';
import {
  AdhanSettings,
  loadAdhanSettings,
  saveAdhanSettings,
  requestNotificationPermission,
  getNotificationPermissionStatus,
} from '../utils/prayerNotifications';
import {
  ADHAN_SOUND_OPTIONS,
  AdhanSoundType,
  playAdhanSound,
  stopAdhanAudio,
} from '../utils/adhanAudio';
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
  const [settings, setSettings] = useState<AdhanSettings>(loadAdhanSettings);
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermissionStatus);
  const [playingPreview, setPlayingPreview] = useState<AdhanSoundType | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(loadAdhanSettings());
      setPermission(getNotificationPermissionStatus());
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
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      try {
        new Notification(isRtl ? '🕌 تم تفعيل تنبيهات الصلاة بنجاح' : '🕌 Prayer Notifications Activated', {
          body: isRtl
            ? 'ستتلقى إشعاراً وصوت الأذان عند حلول موعد كل صلاة.'
            : 'You will receive notifications and Adhan at every prayer time.',
          icon: '/icon.png',
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

  const handleSendTestNotification = () => {
    if (permission === 'granted') {
      new Notification(isRtl ? '🕌 تجربة إشعار الأذان' : '🕌 Test Prayer Notification', {
        body: isRtl
          ? 'الله أكبر، الله أكبر... حان الآن موعد الصلاة'
          : 'Allahu Akbar, Allahu Akbar... It is time for prayer',
        icon: '/icon.png',
      });
    }
    playAdhanSound(settings.soundType, settings.volume);
  };

  const prayersList: { key: keyof AdhanSettings['prayers']; ar: string; en: string; icon: string }[] = [
    { key: 'Fajr', ar: 'صلاة الفجر', en: 'Fajr', icon: '🌄' },
    { key: 'Sunrise', ar: 'شروق الشمس', en: 'Sunrise', icon: '🌅' },
    { key: 'Dhuhr', ar: 'صلاة الظهر', en: 'Dhuhr', icon: '🌞' },
    { key: 'Asr', ar: 'صلاة العصر', en: 'Asr', icon: '🌤' },
    { key: 'Maghrib', ar: 'صلاة المغرب', en: 'Maghrib', icon: '🌇' },
    { key: 'Isha', ar: 'صلاة العشاء', en: 'Isha', icon: '🌙' },
  ];

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
                {isRtl ? 'إعدادات الأذان والتنبيهات' : 'Adhan & Prayer Notifications'}
              </h3>
              <p className="text-xs text-[var(--text2)]">
                {isRtl ? 'صوت التكبير والأذان عند حلول وقت الصلاة' : 'Play Adhan audio at prayer time'}
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
                {isRtl ? 'تفعيل تنبيهات وقت الصلاة' : 'Enable Prayer Alerts'}
              </span>
              <span className="text-[0.68rem] text-[var(--text2)]">
                {settings.enabled
                  ? isRtl
                    ? 'التنبيهات مفعلة عند دخول الوقت'
                    : 'Alerts active at prayer time'
                  : isRtl
                  ? 'التنبيهات معطلة حالياً'
                  : 'Alerts currently disabled'}
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
                {isRtl
                  ? 'يتطلب إرسال الإشعارات إذناً من المتصفح.'
                  : 'Notifications require browser permission.'}
              </div>
            </div>
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-extrabold text-[0.7rem] hover:brightness-110 active:scale-95 shrink-0 cursor-pointer shadow"
            >
              {isRtl ? 'منح الإذن' : 'Allow'}
            </button>
          </div>
        )}

        {permission === 'granted' && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-3 py-2 flex items-center gap-2 text-emerald-300 text-[0.72rem]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{isRtl ? 'إشعارات المتصفح مفعلة ومصرحة ✓' : 'Browser notifications granted ✓'}</span>
          </div>
        )}

        {/* Adhan Sound Choice */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[var(--gold)] uppercase tracking-wide">
              {isRtl ? 'نغمة وصوت الأذان المطلوب' : 'Selected Adhan Sound'}
            </label>
            <span className="text-[0.68rem] text-[var(--text3)]">
              {isRtl ? 'اختر التكبير أو الأذان الكامل' : 'Takbeer or Full Adhan'}
            </span>
          </div>

          <div className="space-y-2">
            {ADHAN_SOUND_OPTIONS.map((opt) => {
              const isSelected = settings.soundType === opt.id;
              const isPlayingThis = playingPreview === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectSound(opt.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-[var(--gold)]/10 border-[var(--gold)] text-[var(--text)] shadow-sm'
                      : 'bg-[var(--bg3)] border-[var(--border2)] hover:border-[var(--gold)]/40 text-[var(--text2)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[var(--gold)] bg-[var(--gold)]' : 'border-[var(--text3)]'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[var(--text)] truncate">
                        {isRtl ? opt.nameAr : opt.nameEn}
                      </div>
                      <div className="text-[0.65rem] text-[var(--text2)] truncate">
                        {isRtl ? opt.descriptionAr : opt.descriptionEn}
                      </div>
                    </div>
                  </div>

                  {opt.id !== 'silent' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewSound(opt.id);
                      }}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                        isPlayingThis
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-[var(--bg2)] border border-[var(--border2)] text-[var(--gold)] hover:bg-[var(--gold)]/15'
                      }`}
                      title={isRtl ? 'تجربة الاستماع' : 'Preview'}
                    >
                      {isPlayingThis ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span className="text-[0.65rem]">{opt.durationApprox}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Volume Slider */}
        <div className="bg-[var(--bg3)] border border-[var(--border2)] rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text)]">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-[var(--gold)]" />
              <span>{isRtl ? 'مستوى صوت الأذان' : 'Adhan Volume'}</span>
            </span>
            <span className="text-[var(--gold2)] font-mono">{Math.round(settings.volume * 100)}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full accent-[var(--gold)] h-1.5 bg-[var(--bg4)] rounded-lg cursor-pointer"
          />
        </div>

        {/* Individual Prayers Toggles */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--gold)] uppercase tracking-wide">
            {isRtl ? 'الصلوات المشمولة بالتنبيه' : 'Prayers to Alert'}
          </label>

          <div className="grid grid-cols-2 gap-2">
            {prayersList.map((p) => {
              const active = settings.prayers[p.key];
              return (
                <button
                  key={p.key}
                  onClick={() => handleTogglePrayer(p.key)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    active
                      ? 'bg-[var(--gold)]/10 border-[var(--gold)]/60 text-[var(--text)]'
                      : 'bg-[var(--bg3)] border-[var(--border2)] text-[var(--text3)] opacity-60'
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <span>{p.icon}</span>
                    <span>{isRtl ? p.ar : p.en}</span>
                  </span>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center text-[0.6rem] ${
                      active ? 'bg-[var(--gold)] border-[var(--gold)] text-black' : 'border-[var(--border2)]'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Test Trigger Button */}
        <button
          onClick={handleSendTestNotification}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-black" />
          <span>{isRtl ? 'تجربة إشعار وصوت الأذان الآن' : 'Test Prayer Alert & Adhan Now'}</span>
        </button>
      </div>
    </div>
  );
};
