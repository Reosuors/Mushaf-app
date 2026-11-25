import React, { useState, useEffect } from 'react';
import { PrayerApiResponse, PrayerTimings } from '../types';
import { WORLD_COUNTRIES, COUNTRY_CITIES, CALC_METHODS } from '../data/countries';
import { TRANSLATIONS } from '../data/translations';
import { calculateOfflinePrayerTimes, CITY_COORDINATES } from '../utils/prayerCalculator';
import { saveOfflinePrayer, getOfflinePrayer } from '../utils/offlineStorage';
import { QiblaCompass } from './QiblaCompass';
import { AdhanSettingsModal } from './AdhanSettingsModal';
import { checkPrayerTimesForAdhan, loadAdhanSettings } from '../utils/prayerNotifications';
import { requestLocationPermission } from '../utils/permissions';
import { syncWidgetData } from '../utils/widget';
import { MihrabBackdrop, SectionIcon, GoldDivider } from './IslamicOrnaments';
import {
  Search,
  MapPin,
  Compass,
  ChevronDown,
  Clock,
  Loader2,
  Zap,
  Wifi,
  BellRing,
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

interface PrayerSectionProps {
  lang: string;
  city: string;
  country: string;
  onUpdateLocation: (city: string, country: string) => void;
}

const PrayerTimeIcon: React.FC<{ prayerKey: string; className?: string }> = ({
  prayerKey,
  className = 'w-4 h-4',
}) => {
  switch (prayerKey) {
    case 'Fajr':
      return <Sparkles className={className} />;
    case 'Sunrise':
      return <Sunrise className={className} />;
    case 'Dhuhr':
      return <Sun className={className} />;
    case 'Asr':
      return <CloudSun className={className} />;
    case 'Maghrib':
      return <Sunset className={className} />;
    case 'Isha':
    default:
      return <Moon className={className} />;
  }
};

export const PrayerSection: React.FC<PrayerSectionProps> = ({
  lang,
  city,
  country,
  onUpdateLocation,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';

  const [activeTab, setActiveTab] = useState<'timings' | 'qibla'>('timings');
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [inputCity, setInputCity] = useState(city || 'Mecca');
  const [inputCountry, setInputCountry] = useState(country || 'Saudi Arabia');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [cityList, setCityList] = useState<string[]>([]);
  const [method, setMethod] = useState<number>(4);
  const [prayerData, setPrayerData] = useState<PrayerApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [countdownProgress, setCountdownProgress] = useState<number>(0.35);
  const [nextPrayerKey, setNextPrayerKey] = useState<string>('Fajr');
  const [isOfflineComputed, setIsOfflineComputed] = useState(false);
  const [isAdhanModalOpen, setIsAdhanModalOpen] = useState(false);
  const [adhanEnabled] = useState(() => loadAdhanSettings().enabled);

  const prayerKeys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  const prayerNames: Record<string, string> = {
    Fajr: t.fajr,
    Sunrise: t.sunrise,
    Dhuhr: t.dhuhr,
    Asr: t.asr,
    Maghrib: t.maghrib,
    Isha: t.isha,
  };

  const getFallbackOfflineCalculation = (cityName: string, methodId: number): PrayerApiResponse => {
    const coords = CITY_COORDINATES[cityName] || CITY_COORDINATES['Mecca'];
    return calculateOfflinePrayerTimes(new Date(), coords.lat, coords.lng, coords.tz, methodId);
  };

  const fetchPrayerTimes = async (cityName: string, countryName?: string, methodId?: number) => {
    if (!cityName) return;
    setLoading(true);
    setErrorMsg(null);

    const mId = methodId || method;
    const cacheKey = `prayer_${cityName}_${countryName || ''}_${mId}`;

    try {
      if (navigator.onLine) {
        const today = new Date();
        const dd = today.getDate();
        const mm = today.getMonth() + 1;
        const yyyy = today.getFullYear();
        let url = `https://api.aladhan.com/v1/timingsByCity/${dd}-${mm}-${yyyy}?city=${encodeURIComponent(
          cityName
        )}&method=${mId}`;
        if (countryName) url += `&country=${encodeURIComponent(countryName)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.code === 200 && data.data?.timings) {
          setPrayerData(data.data);
          setIsOfflineComputed(false);
          onUpdateLocation(cityName, countryName || '');
          saveOfflinePrayer(cacheKey, data.data);
          setLoading(false);
          return;
        }
      }
    } catch {}

    try {
      const cached = await getOfflinePrayer(cacheKey);
      if (cached) {
        setPrayerData(cached);
        setIsOfflineComputed(true);
        onUpdateLocation(cityName, countryName || '');
        setLoading(false);
        return;
      }
    } catch {}

    const offlineCalculated = getFallbackOfflineCalculation(cityName, mId);
    setPrayerData(offlineCalculated);
    setIsOfflineComputed(true);
    onUpdateLocation(cityName, countryName || '');
    setLoading(false);
  };

  useEffect(() => {
    fetchPrayerTimes(city || 'Mecca', country || 'Saudi Arabia', method);
  }, []);

  const handleGpsSearch = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setErrorMsg(
        isRtl
          ? 'نحتاج إلى إذن الموقع لتحديد مدينتك تلقائياً. فعّل الإذن من إعدادات التطبيق ثم حاول مرة أخرى.'
          : 'Location permission is required to detect your city. Enable it in app settings and try again.'
      );
      return;
    }

    setGpsLoading(true);
    setErrorMsg(null);
    try {
      const pos: GeolocationPosition = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 })
      );
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setUserCoords({ lat, lng });

      let detectedCity = 'GPS Location';
      let detectedCountry = '';

      if (navigator.onLine) {
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const geoData = await geoRes.json();
          detectedCity =
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.village ||
            geoData.address?.county ||
            'GPS Location';
          detectedCountry = geoData.address?.country || '';
        } catch {}
      }

      setInputCity(detectedCity);
      setInputCountry(detectedCountry);

      if (navigator.onLine) {
        const today = new Date();
        const url = `https://api.aladhan.com/v1/timings/${Math.floor(
          today.getTime() / 1000
        )}?latitude=${lat}&longitude=${lng}&method=${method}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.code === 200) {
          setPrayerData(data.data);
          setIsOfflineComputed(false);
          onUpdateLocation(detectedCity, detectedCountry);
          setGpsLoading(false);
          return;
        }
      }

      const calculated = calculateOfflinePrayerTimes(new Date(), lat, lng, undefined, method);
      setPrayerData(calculated);
      setIsOfflineComputed(true);
      onUpdateLocation(detectedCity, detectedCountry);
    } catch {
      setErrorMsg(t.gpsError);
    } finally {
      setGpsLoading(false);
    }
  };

  const handleCountrySelect = (code: string) => {
    setSelectedCountryCode(code);
    const cObj = WORLD_COUNTRIES.find((c) => c.code === code);
    if (cObj) {
      setInputCountry(cObj.name);
      const cities = COUNTRY_CITIES[code] || [];
      setCityList(cities);
      if (cities.length > 0) {
        setInputCity(cities[0]);
        fetchPrayerTimes(cities[0], cObj.name);
      }
    }
  };

  // Sync Android home-screen widget
  useEffect(() => {
    if (!prayerData?.timings) return;
    const timings = prayerData.timings;
    const prayerSummary = [
      `الفجر ${timings.Fajr}`,
      `الظهر ${timings.Dhuhr}`,
      `العصر ${timings.Asr}`,
      `المغرب ${timings.Maghrib}`,
      `العشاء ${timings.Isha}`,
    ].join('  •  ');
    const d = new Date();
    void syncWidgetData({
      mode: 'ayah',
      prayers: prayerSummary,
      city: inputCity || city || 'الموقع الحالي',
      country: inputCountry || country || '',
      method,
      timings: JSON.stringify({
        Fajr: timings.Fajr,
        Sunrise: timings.Sunrise,
        Dhuhr: timings.Dhuhr,
        Asr: timings.Asr,
        Maghrib: timings.Maghrib,
        Isha: timings.Isha,
      }),
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    });
  }, [prayerData, inputCity, city, inputCountry, country, method]);

  // Live countdown & ring progress calculation
  useEffect(() => {
    if (!prayerData?.timings) return;
    const calculateNextPrayer = () => {
      const timings = prayerData.timings;
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();

      const parsed = prayerKeys
        .map((k) => {
          const val = timings[k as keyof PrayerTimings];
          if (!val) return null;
          const [h, m] = val.split(':').map(Number);
          return { key: k, total: h * 60 + m, timeStr: val };
        })
        .filter(Boolean) as { key: string; total: number; timeStr: string }[];

      let nextIdx = parsed.findIndex((p) => p.total > nowMin);
      if (nextIdx === -1) nextIdx = 0;

      const nextObj = parsed[nextIdx];
      const prevObj = parsed[(nextIdx - 1 + parsed.length) % parsed.length];

      setNextPrayerKey(nextObj.key);

      let diff = nextObj.total - nowMin;
      if (diff < 0) diff += 1440;

      let span = nextObj.total - prevObj.total;
      if (span <= 0) span += 1440;

      const elapsed = Math.max(0, Math.min(span, span - diff));
      setCountdownProgress(span > 0 ? elapsed / span : 0.4);

      const hr = Math.floor(diff / 60);
      const mn = diff % 60;
      setCountdown(
        isRtl
          ? hr > 0
            ? `بعد ${hr} س و ${mn} د`
            : `بعد ${mn} دقيقة`
          : hr > 0
          ? `in ${hr}h ${mn}m`
          : `in ${mn}m`
      );
    };

    calculateNextPrayer();
    checkPrayerTimesForAdhan(prayerData?.timings, inputCity, lang);
    const interval = setInterval(() => {
      calculateNextPrayer();
      checkPrayerTimesForAdhan(prayerData?.timings, inputCity, lang);
    }, 20000);
    return () => clearInterval(interval);
  }, [prayerData, inputCity, lang, isRtl]);

  const ringRadius = 56;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc * (1 - Math.max(0.06, Math.min(0.98, countdownProgress)));

  return (
    <div className="p-3.5 sm:p-6 max-w-2xl mx-auto pb-28 space-y-4 animate-fade-in">
      {/* Mode Switcher: Prayer Times vs Qibla Compass */}
      <div className="flex items-center bg-[var(--bg2)] p-1 rounded-2xl border border-[var(--border2)] shadow-sm">
        <button
          onClick={() => setActiveTab('timings')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'timings'
              ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black shadow-md'
              : 'text-[var(--text2)] hover:text-[var(--gold2)]'
          }`}
        >
          <SectionIcon id="prayer" active={activeTab === 'timings'} className="w-4 h-4" />
          <span>{t.prayerTimes || (isRtl ? 'مواقيت الصلاة' : 'Prayer Times')}</span>
        </button>

        <button
          onClick={() => setActiveTab('qibla')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'qibla'
              ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black shadow-md'
              : 'text-[var(--text2)] hover:text-[var(--gold2)]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>{t.qiblaCompass || (isRtl ? 'بوصلة القبلة' : 'Qibla Compass')}</span>
        </button>
      </div>

      {/* Qibla Compass View */}
      {activeTab === 'qibla' && (
        <QiblaCompass
          lang={lang}
          city={inputCity}
          country={inputCountry}
          userCoordinates={userCoords}
          onRefreshGps={handleGpsSearch}
        />
      )}

      {/* Prayer Timings View */}
      {activeTab === 'timings' && (
        <>
          {/* Mihrab Architectural Live Countdown Ring Hero */}
          {prayerData && !loading && (
            <section className="relative rounded-[26px] overflow-hidden border border-[var(--gold)]/35 bg-gradient-to-b from-[var(--bg3)]/95 via-[var(--bg2)] to-[var(--bg2)] p-5 sm:p-6 shadow-[0_18px_46px_-22px_rgba(0,0,0,0.85)]">
              <div
                className="pointer-events-none absolute inset-[7px] rounded-[20px] border border-[var(--gold)]/16"
                aria-hidden="true"
              />
              <MihrabBackdrop className="opacity-85" />

              <div className="relative z-10 space-y-4">
                {/* Top City & Quick Action Controls */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[var(--gold)] shrink-0" />
                      <h2 className="font-amiri text-xl font-bold text-[var(--gold2)] leading-none">
                        {inputCity}
                      </h2>
                      {inputCountry && (
                        <span className="text-[0.7rem] text-[var(--text3)]">· {inputCountry}</span>
                      )}
                    </div>
                    <p className="text-[0.7rem] text-[var(--text2)] mt-1">
                      {prayerData.date?.hijri?.day} {prayerData.date?.hijri?.month?.ar}{' '}
                      {prayerData.date?.hijri?.year} · {prayerData.date?.readable}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setIsAdhanModalOpen(true)}
                      className={`h-9 px-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                        adhanEnabled
                          ? 'bg-[var(--gold)]/15 border-[var(--gold)]/50 text-[var(--gold2)]'
                          : 'bg-[var(--bg)]/70 border-[var(--border2)] text-[var(--text2)] hover:border-[var(--gold)]/50 hover:text-[var(--gold2)]'
                      }`}
                      title={isRtl ? 'إعدادات الأذان والتنبيهات' : 'Adhan Settings'}
                    >
                      <BellRing className="w-3.5 h-3.5 text-[var(--gold)]" />
                      <span className="hidden xs:inline">{isRtl ? 'الأذان' : 'Adhan'}</span>
                    </button>

                    <button
                      onClick={handleGpsSearch}
                      disabled={gpsLoading}
                      className="w-9 h-9 rounded-xl bg-[var(--bg)]/70 border border-[var(--border2)] text-[var(--gold)] hover:border-[var(--gold)]/60 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                      title={t.useGps}
                    >
                      {gpsLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => setShowLocationForm((s) => !s)}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                        showLocationForm
                          ? 'bg-[var(--gold)] text-black border-[var(--gold)]'
                          : 'bg-[var(--bg)]/70 border-[var(--border2)] text-[var(--text2)] hover:border-[var(--gold)]/60 hover:text-[var(--gold2)]'
                      }`}
                      title={isRtl ? 'تغيير المدينة' : 'Change City'}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Live Circular Countdown Ring + Next Prayer Display */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 py-1">
                  <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 132 132">
                      <circle
                        cx="66"
                        cy="66"
                        r={ringRadius}
                        fill="color-mix(in srgb, var(--bg) 65%, transparent)"
                        stroke="color-mix(in srgb, var(--gold) 18%, var(--border2))"
                        strokeWidth="6"
                      />
                      <circle
                        cx="66"
                        cy="66"
                        r={ringRadius}
                        fill="none"
                        stroke="var(--gold)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={ringCirc}
                        strokeDashoffset={ringOffset}
                        className="transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                      <span className="text-[0.62rem] font-bold text-[var(--text3)] uppercase tracking-wider">
                        {t.nextPrayer || 'الصلاة القادمة'}
                      </span>
                      <span className="font-amiri text-xl font-bold text-[var(--gold2)] leading-tight mt-0.5">
                        {prayerNames[nextPrayerKey] || nextPrayerKey}
                      </span>
                      <span className="text-lg font-extrabold text-[var(--text)] tabular-nums leading-tight mt-0.5" dir="ltr">
                        {prayerData.timings[nextPrayerKey as keyof PrayerTimings]}
                      </span>
                    </div>
                  </div>

                  <div className="text-center sm:text-start space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--green)]/15 border border-[var(--green2)]/35 text-[var(--green2)] text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{countdown}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-[0.68rem] text-[var(--text3)]">
                      {isOfflineComputed ? (
                        <span className="inline-flex items-center gap-1 text-amber-400">
                          <Zap className="w-3 h-3" />
                          {isRtl ? 'حساب فلكي محلي' : 'Astronomical Offline'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[var(--green2)]">
                          <Wifi className="w-3 h-3" />
                          {isRtl ? 'مواقيت مباشرة' : 'Live Synced'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Collapsible Location & City Picker Card */}
          {(showLocationForm || !prayerData) && (
            <div className="bg-[var(--bg2)] border border-[var(--gold)]/28 rounded-[22px] p-4 sm:p-5 shadow-lg space-y-3 animate-fade-in">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[0.65rem] font-bold text-[var(--text2)] mb-1">
                    {t.cityPlaceholder.replace('...', '')}
                  </label>
                  <input
                    type="text"
                    value={inputCity}
                    onChange={(e) => setInputCity(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchPrayerTimes(inputCity, inputCountry)}
                    placeholder={t.cityPlaceholder}
                    className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-3 py-2 rounded-xl text-xs sm:text-sm outline-none focus:border-[var(--gold)] min-h-[42px]"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-[var(--text2)] mb-1">
                    {t.countryLabel.replace(' (اختياري)', '').replace(' (optional)', '')}
                  </label>
                  <input
                    type="text"
                    value={inputCountry}
                    onChange={(e) => setInputCountry(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchPrayerTimes(inputCity, inputCountry)}
                    placeholder={t.countryLabel}
                    className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-3 py-2 rounded-xl text-xs sm:text-sm outline-none focus:border-[var(--gold)] min-h-[42px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => handleCountrySelect(e.target.value)}
                    className="w-full appearance-none bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-3 py-2 rounded-xl text-xs outline-none focus:border-[var(--gold)] cursor-pointer pe-7"
                  >
                    <option value="">{isRtl ? 'اختر الدولة' : 'Select Country'}</option>
                    {WORLD_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text3)] absolute end-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={inputCity}
                    disabled={cityList.length === 0}
                    onChange={(e) => {
                      setInputCity(e.target.value);
                      fetchPrayerTimes(e.target.value, inputCountry);
                    }}
                    className="w-full appearance-none bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-3 py-2 rounded-xl text-xs outline-none focus:border-[var(--gold)] cursor-pointer pe-7 disabled:opacity-45"
                  >
                    <option value="">{isRtl ? 'اختر المدينة' : 'Select City'}</option>
                    {cityList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text3)] absolute end-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                onClick={() => {
                  fetchPrayerTimes(inputCity, inputCountry);
                  setShowLocationForm(false);
                }}
                className="w-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span>{t.searchBtn}</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-[var(--text2)]">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
              <p className="text-xs">{t.loadingSurah || 'جاري التحميل...'}</p>
            </div>
          )}

          {errorMsg && !loading && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-center text-xs">
              {errorMsg}
            </div>
          )}

          {/* Six Prayer Schedule Cards */}
          {prayerData && !loading && (
            <div className="space-y-3">
              <div className="grid gap-2">
                {prayerKeys.map((k) => {
                  const isCurrent = k === nextPrayerKey;
                  const timeVal = prayerData.timings[k as keyof PrayerTimings];
                  return (
                    <div
                      key={k}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-[18px] border transition-all ${
                        isCurrent
                          ? 'bg-[var(--gold)]/12 border-[var(--gold)]/65 shadow-[0_6px_22px_-10px_rgba(212,175,55,0.4)]'
                          : 'bg-[var(--bg2)] border-[var(--border2)] hover:border-[var(--gold)]/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                            isCurrent
                              ? 'bg-gradient-to-br from-[var(--gold)] to-[var(--gold2)] text-black border-[var(--gold)]'
                              : 'bg-[var(--bg3)] border-[var(--border2)] text-[var(--gold)]'
                          }`}
                        >
                          <PrayerTimeIcon prayerKey={k} className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-amiri text-base font-bold ${
                                isCurrent ? 'text-[var(--gold2)]' : 'text-[var(--text)]'
                              }`}
                            >
                              {prayerNames[k] || k}
                            </span>
                            {isCurrent && (
                              <span className="text-[0.62rem] bg-[var(--gold)] text-black font-extrabold px-2 py-0.5 rounded-full">
                                {t.nextPrayer || 'القادمة'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`text-base sm:text-lg font-extrabold tabular-nums ${
                          isCurrent ? 'text-[var(--gold2)]' : 'text-[var(--text2)]'
                        }`}
                        dir="ltr"
                      >
                        {timeVal}
                      </div>
                    </div>
                  );
                })}
              </div>

              <GoldDivider className="opacity-50" />

              {/* Calculation Method */}
              <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <span className="text-[var(--text2)] font-semibold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[var(--gold)]" />
                  <span>{t.method}:</span>
                </span>
                <select
                  value={method}
                  onChange={(e) => {
                    const newMethod = parseInt(e.target.value, 10);
                    setMethod(newMethod);
                    fetchPrayerTimes(inputCity, inputCountry, newMethod);
                  }}
                  className="w-full sm:w-auto bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-3 py-1.5 rounded-xl outline-none focus:border-[var(--gold)] cursor-pointer text-xs"
                >
                  {CALC_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </>
      )}

      <AdhanSettingsModal
        isOpen={isAdhanModalOpen}
        onClose={() => setIsAdhanModalOpen(false)}
        lang={lang}
      />
    </div>
  );
};
