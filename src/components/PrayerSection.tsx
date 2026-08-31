import React, { useState, useEffect } from 'react';
import { PrayerApiResponse, PrayerTimings } from '../types';
import { WORLD_COUNTRIES, COUNTRY_CITIES, CALC_METHODS } from '../data/countries';
import { TRANSLATIONS } from '../data/translations';
import { calculateOfflinePrayerTimes, CITY_COORDINATES } from '../utils/prayerCalculator';
import { saveOfflinePrayer, getOfflinePrayer } from '../utils/offlineStorage';
import { QiblaCompass } from './QiblaCompass';
import { AdhanSettingsModal } from './AdhanSettingsModal';
import { checkPrayerTimesForAdhan, loadAdhanSettings } from '../utils/prayerNotifications';
import { Search, MapPin, Compass, ChevronDown, Clock, Loader2, Zap, Wifi, BellRing, Bell } from 'lucide-react';
import { requestLocationPermission } from '../utils/permissions';

interface PrayerSectionProps {
  lang: string;
  city: string;
  country: string;
  onUpdateLocation: (city: string, country: string) => void;
}

const PRAYER_ICONS: Record<string, string> = {
  Fajr: '🌄',
  Sunrise: '🌅',
  Dhuhr: '🌞',
  Asr: '🌤',
  Maghrib: '🌇',
  Isha: '🌙',
};

export const PrayerSection: React.FC<PrayerSectionProps> = ({
  lang,
  city,
  country,
  onUpdateLocation,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur';

  const [activeTab, setActiveTab] = useState<'timings' | 'qibla'>('timings');
  const [inputCity, setInputCity] = useState(city || 'Mecca');
  const [inputCountry, setInputCountry] = useState(country || 'Saudi Arabia');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [cityList, setCityList] = useState<string[]>([]);
  const [method, setMethod] = useState<number>(4); // default Umm Al-Qura
  const [prayerData, setPrayerData] = useState<PrayerApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [nextPrayerKey, setNextPrayerKey] = useState<string>('Fajr');
  const [isOfflineComputed, setIsOfflineComputed] = useState(false);
  const [isAdhanModalOpen, setIsAdhanModalOpen] = useState(false);
  const [adhanEnabled, setAdhanEnabled] = useState(() => loadAdhanSettings().enabled);

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

    // Try live fetch
    try {
      if (navigator.onLine) {
        const today = new Date();
        const dd = today.getDate();
        const mm = today.getMonth() + 1;
        const yyyy = today.getFullYear();
        let url = `https://api.aladhan.com/v1/timingsByCity/${dd}-${mm}-${yyyy}?city=${encodeURIComponent(
          cityName
        )}&method=${mId}`;
        if (countryName) {
          url += `&country=${encodeURIComponent(countryName)}`;
        }
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
    } catch {
      // Ignore network error and seamlessly fallback to offline engine
    }

    // Check offline cached data or compute astronomically
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

    // Precise offline mathematical calculation
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

      // Offline GPS calculation
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

  // Live countdown calculation
  useEffect(() => {
    if (!prayerData?.timings) return;
    const calculateNextPrayer = () => {
      const timings = prayerData.timings;
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();

      let nextK = 'Fajr';
      let nextMin = Infinity;
      let nextTimeStr = timings.Fajr;

      for (const k of prayerKeys) {
        const timeVal = timings[k as keyof PrayerTimings];
        if (!timeVal) continue;
        const [h, m] = timeVal.split(':').map(Number);
        const total = h * 60 + m;
        if (total > nowMin && total < nextMin) {
          nextMin = total;
          nextK = k;
          nextTimeStr = timeVal;
        }
      }

      if (!nextK || nextMin === Infinity) {
        nextK = 'Fajr';
        nextTimeStr = timings.Fajr;
      }

      setNextPrayerKey(nextK);

      const [h, m] = nextTimeStr.split(':').map(Number);
      let diff = h * 60 + m - nowMin;
      if (diff < 0) diff += 1440;
      const hr = Math.floor(diff / 60);
      const mn = diff % 60;
      setCountdown(hr > 0 ? `${hr}h ${mn}m` : `${mn}m`);
    };

    calculateNextPrayer();
    checkPrayerTimesForAdhan(prayerData?.timings, inputCity, lang);
    const interval = setInterval(() => {
      calculateNextPrayer();
      checkPrayerTimesForAdhan(prayerData?.timings, inputCity, lang);
    }, 20000);
    return () => clearInterval(interval);
  }, [prayerData, inputCity, lang]);

  return (
    <div className="p-3.5 sm:p-6 max-w-xl mx-auto space-y-4 animate-fade-in">
      {/* Sub-navigation Switcher between Prayer Times and Qibla Compass */}
      <div className="flex items-center bg-[var(--bg2)] p-1.5 rounded-2xl border border-[var(--border2)] shadow-sm">
        <button
          onClick={() => setActiveTab('timings')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'timings'
              ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black shadow-md'
              : 'text-[var(--text2)] hover:text-[var(--gold)]'
          }`}
        >
          <span className="text-base">🕌</span>
          <span>{t.prayerTimes || (isRtl ? 'مواقيت الصلاة' : 'Prayer Times')}</span>
        </button>

        <button
          onClick={() => setActiveTab('qibla')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'qibla'
              ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black shadow-md'
              : 'text-[var(--text2)] hover:text-[var(--gold)]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>{t.qiblaCompass || (isRtl ? 'بوصلة القبلة' : 'Qibla Compass')}</span>
        </button>
      </div>

      {/* Render Qibla Compass directly when Qibla tab is active */}
      {activeTab === 'qibla' && (
        <QiblaCompass
          lang={lang}
          city={inputCity}
          country={inputCountry}
          userCoordinates={userCoords}
          onRefreshGps={handleGpsSearch}
        />
      )}

      {/* Search & Location Card */}
      <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-3xl p-4 sm:p-5 shadow-lg space-y-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🕌</span>
            <span className="text-xs font-bold text-[var(--gold)] uppercase tracking-wider">
              {t.prayerPageTitle}
            </span>
          </div>

          {isOfflineComputed ? (
            <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-semibold flex items-center gap-1 border border-amber-500/20">
              <Zap className="w-3 h-3" />
              {isRtl ? 'حساب فلكي دقيق (Offline)' : 'Astronomical (Offline)'}
            </span>
          ) : (
            <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold flex items-center gap-1 border border-emerald-500/20">
              <Wifi className="w-3 h-3" />
              {isRtl ? 'مباشر (Online)' : 'Live (Online)'}
            </span>
          )}
        </div>

        {/* City & Country inputs */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[0.65rem] font-bold text-[var(--text2)] uppercase mb-1">
              {t.cityPlaceholder.replace('...', '')}
            </label>
            <input
              type="text"
              value={inputCity}
              onChange={(e) => setInputCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPrayerTimes(inputCity, inputCountry)}
              placeholder={t.cityPlaceholder}
              className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-3 py-2 rounded-xl text-xs sm:text-sm outline-none focus:border-[var(--gold)] transition-colors min-h-[40px]"
            />
          </div>

          <div>
            <label className="block text-[0.65rem] font-bold text-[var(--text2)] uppercase mb-1">
              {t.countryLabel.replace(' (اختياري)', '').replace(' (optional)', '')}
            </label>
            <input
              type="text"
              value={inputCountry}
              onChange={(e) => setInputCountry(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPrayerTimes(inputCity, inputCountry)}
              placeholder={t.countryLabel}
              className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-3 py-2 rounded-xl text-xs sm:text-sm outline-none focus:border-[var(--gold)] transition-colors min-h-[40px]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchPrayerTimes(inputCity, inputCountry)}
            className="flex-1 bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer min-h-[40px]"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            <span>{t.searchBtn}</span>
          </button>

          <button
            onClick={() => setIsAdhanModalOpen(true)}
            className="px-3.5 h-10 rounded-xl bg-[var(--bg3)] border border-[var(--gold)]/40 hover:border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)]/10 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0 font-bold text-xs shadow-sm"
            title={isRtl ? 'إعدادات الأذان والتنبيهات الصوتية' : 'Adhan & Prayer Notification Settings'}
          >
            <BellRing className="w-4 h-4 animate-bounce" />
            <span className="hidden sm:inline">{isRtl ? 'صوت الأذان' : 'Adhan Audio'}</span>
          </button>

          <button
            onClick={handleGpsSearch}
            disabled={gpsLoading}
            className="w-10 h-10 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text2)] hover:text-[var(--gold)] hover:border-[var(--gold)] hover:bg-[var(--gold)]/10 flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0"
            title={t.useGps}
          >
            {gpsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[var(--gold)]" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Country & City quick browser dropdowns */}
        <div className="pt-2 border-t border-[var(--border)] grid grid-cols-2 gap-2">
          <div className="relative">
            <select
              value={selectedCountryCode}
              onChange={(e) => handleCountrySelect(e.target.value)}
              className="w-full appearance-none bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-3 py-2 rounded-xl text-xs outline-none focus:border-[var(--gold)] cursor-pointer pe-7"
            >
              <option value="">🌍 {lang === 'ar' ? 'اختر الدولة' : 'Select Country'}</option>
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
              className="w-full appearance-none bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-3 py-2 rounded-xl text-xs outline-none focus:border-[var(--gold)] cursor-pointer pe-7 disabled:opacity-50"
            >
              <option value="">🏙️ {lang === 'ar' ? 'اختر المدينة' : 'Select City'}</option>
              {cityList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text3)] absolute end-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-[var(--text2)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
          <p className="text-xs">{t.loadingSurah || 'جاري التحميل...'}</p>
        </div>
      )}

      {/* Error display */}
      {errorMsg && !loading && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-center text-xs">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Results View */}
      {prayerData && !loading && (
        <div className="space-y-3.5">
          {/* Location Title & Hijri Date */}
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-bold text-[var(--gold2)] flex items-center justify-center gap-1.5 font-amiri">
              <MapPin className="w-4 h-4 text-[var(--gold)]" />
              <span>{inputCity}</span>
              {inputCountry && <span className="text-[var(--text3)] text-xs font-sans">· {inputCountry}</span>}
            </h3>
            <p className="text-xs text-[var(--text2)] mt-0.5">
              {prayerData.date?.readable} · {prayerData.date?.hijri?.day}{' '}
              {prayerData.date?.hijri?.month?.ar} {prayerData.date?.hijri?.year}
            </p>
          </div>

          {/* Next Prayer Highlight Banner */}
          <div className="bg-gradient-to-r from-[var(--gold)]/15 via-[var(--bg3)] to-transparent border border-[var(--gold)]/30 rounded-3xl p-4 sm:p-5 flex items-center gap-3.5 shadow-md">
            <span className="text-3xl sm:text-4xl shrink-0">{PRAYER_ICONS[nextPrayerKey] || '🕌'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[0.68rem] text-[var(--text2)] uppercase font-semibold tracking-wider">
                {t.nextPrayer}
              </div>
              <div className="text-lg font-bold text-[var(--gold2)] truncate font-amiri">
                {prayerNames[nextPrayerKey] || nextPrayerKey}
              </div>
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{countdown}</span>
              </div>
            </div>
            <div className="bg-[var(--gold)]/15 border border-[var(--gold)]/40 rounded-2xl px-3.5 py-2 font-bold text-base sm:text-xl text-[var(--gold)] shadow-inner">
              {prayerData.timings[nextPrayerKey as keyof PrayerTimings]}
            </div>
          </div>

          {/* Prayer Times Grid */}
          <div className="grid gap-2">
            {prayerKeys.map((k) => {
              const isCurrent = k === nextPrayerKey;
              const timeVal = prayerData.timings[k as keyof PrayerTimings];
              return (
                <div
                  key={k}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-[var(--gold)]/12 border-[var(--gold)]/60 shadow-md ring-1 ring-[var(--gold)]/30'
                      : 'bg-[var(--bg2)] border-[var(--border2)] hover:border-[var(--gold)]/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                        isCurrent
                          ? 'bg-[var(--gold)]/20 border border-[var(--gold)]/40'
                          : 'bg-[var(--bg3)] border border-[var(--border2)]'
                      }`}
                    >
                      {PRAYER_ICONS[k] || '🕌'}
                    </div>
                    <div>
                      <div
                        className={`text-sm font-bold ${
                          isCurrent ? 'text-[var(--gold2)] font-amiri text-base' : 'text-[var(--text)]'
                        }`}
                      >
                        {prayerNames[k] || k}
                      </div>
                      {isCurrent && (
                        <span className="text-[0.62rem] bg-[var(--gold)] text-black font-extrabold px-1.5 py-0.5 rounded-md">
                          {t.nextPrayer}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`text-base font-bold font-sans ${
                      isCurrent ? 'text-[var(--gold)]' : 'text-[var(--text2)]'
                    }`}
                  >
                    {timeVal}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calculation Method Selector */}
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
              className="w-full sm:w-auto bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] px-2.5 py-1.5 rounded-xl outline-none focus:border-[var(--gold)] cursor-pointer text-xs"
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

      {/* Adhan Settings Modal */}
      <AdhanSettingsModal
        isOpen={isAdhanModalOpen}
        onClose={() => setIsAdhanModalOpen(false)}
        lang={lang}
      />
    </div>
  );
};
