import React, { useState, useEffect, useRef } from 'react';
import { calculateQiblaDirection, calculateDistanceToKaaba, getCompassHeadingLabel, KAABA_COORDINATES } from '../utils/qibla';
import { CITY_COORDINATES } from '../utils/prayerCalculator';
import { TRANSLATIONS } from '../data/translations';
import {
  Compass,
  Navigation,
  MapPin,
  Sparkles,
  RotateCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Minimize2,
  LocateFixed,
  ShieldCheck,
} from 'lucide-react';

interface QiblaCompassProps {
  lang: string;
  city: string;
  country?: string;
  userCoordinates?: { lat: number; lng: number } | null;
  onRefreshGps?: () => void;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({
  lang,
  city,
  country,
  userCoordinates,
  onRefreshGps,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar' || lang === 'ur';

  // Effective Coordinates
  const effectiveCoords = userCoordinates ||
    CITY_COORDINATES[city] ||
    CITY_COORDINATES['Mecca'] || { lat: 21.4225, lng: 39.8262 };

  // Calculated values
  const qiblaAngle = calculateQiblaDirection(effectiveCoords.lat, effectiveCoords.lng);
  const distanceKm = calculateDistanceToKaaba(effectiveCoords.lat, effectiveCoords.lng);

  // Device orientation state
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [isSensorSupported, setIsSensorSupported] = useState<boolean | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [manualHeading, setManualHeading] = useState<number | null>(null);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const lastVibrateTime = useRef<number>(0);

  // Current active heading (sensor or manual slider)
  const currentHeading = manualHeading !== null && isManualMode ? manualHeading : deviceHeading;

  // The angle to rotate the compass dial so that 0 (North) faces real device North:
  // When device turns by `currentHeading`, the compass dial must rotate by `-currentHeading`.
  // The Kaaba indicator sits at `qiblaAngle` on the compass dial.
  // Relative offset: (qiblaAngle - currentHeading + 360) % 360
  const relativeQiblaAngle = (qiblaAngle - currentHeading + 360) % 360;
  
  // Check if phone is aligned with Qibla (within ±3.5 degrees)
  const diffFromQibla = Math.min(
    Math.abs(relativeQiblaAngle),
    Math.abs(360 - relativeQiblaAngle)
  );
  const isAligned = diffFromQibla <= 3.5;

  // Trigger tactile vibration on alignment
  useEffect(() => {
    if (isAligned) {
      const now = Date.now();
      if (now - lastVibrateTime.current > 1500) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate([40, 60, 40]);
          } catch {}
        }
        lastVibrateTime.current = now;
      }
    }
  }, [isAligned]);

  // Request iOS Sensor Permissions
  const requestOrientationPermission = async () => {
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as any)?.requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          initOrientationListener();
        } else {
          setPermissionGranted(false);
        }
      } catch (err) {
        console.warn('Sensor permission error:', err);
        setPermissionGranted(false);
      }
    } else {
      initOrientationListener();
    }
  };

  // Orientation listener
  const initOrientationListener = () => {
    let sensorFired = false;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      sensorFired = true;
      setIsSensorSupported(true);

      let heading: number | null = null;

      // iOS WebKit heading (True North 0-360)
      if ('webkitCompassHeading' in e && typeof (e as any).webkitCompassHeading === 'number') {
        heading = (e as any).webkitCompassHeading;
      } else if (e.alpha !== null && typeof e.alpha === 'number') {
        // Android / Standard fallback:
        // if absolute is true, alpha is relative to North (0-360 clockwise)
        // Invert for rotation
        if ((e as any).absolute) {
          heading = (360 - e.alpha) % 360;
        } else {
          heading = (360 - e.alpha) % 360;
        }
      }

      if (heading !== null && !isNaN(heading)) {
        setDeviceHeading(Math.round(heading));
      }
    };

    if (window.DeviceOrientationEvent) {
      // Try absolute orientation first (Chrome Android)
      window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
    } else {
      setIsSensorSupported(false);
    }

    // Timeout check if sensors are not available (e.g. desktop browsers)
    setTimeout(() => {
      if (!sensorFired) {
        setIsSensorSupported(false);
      }
    }, 1500);

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation as any);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  };

  useEffect(() => {
    const cleanup = initOrientationListener();
    return () => cleanup && cleanup();
  }, []);

  return (
    <div
      className={`bg-gradient-to-br from-[var(--bg2)] via-[var(--bg3)] to-[var(--bg2)] border transition-all duration-300 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden ${
        isAligned
          ? 'border-emerald-500/80 ring-2 ring-emerald-500/40 shadow-emerald-500/20'
          : 'border-[var(--border2)]'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors ${
              isAligned
                ? 'bg-emerald-500 text-black shadow-md'
                : 'bg-[var(--gold)]/15 border border-[var(--gold)]/30 text-[var(--gold)]'
            }`}
          >
            <Compass className={`w-5 h-5 ${isAligned ? 'animate-spin-slow' : ''}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--gold2)] flex items-center gap-1.5 font-amiri text-base">
              <span>{t.qiblaCompass || 'بوصلة القبلة'}</span>
              {isAligned && (
                <span className="text-xs text-emerald-400 font-sans font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isRtl ? 'باتجاه الكعبة!' : 'Facing Kaaba!'}
                </span>
              )}
            </h3>
            <p className="text-[0.68rem] text-[var(--text3)] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[var(--gold)]" />
              <span>
                {city} {country ? `· ${country}` : ''}
              </span>
              <span>· {distanceKm.toLocaleString()} {isRtl ? 'كم إلى مكة' : 'km to Mecca'}</span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsManualMode(!isManualMode)}
            className={`p-2 rounded-xl text-xs border transition-all cursor-pointer ${
              isManualMode
                ? 'bg-[var(--gold)] text-black border-[var(--gold)] font-bold'
                : 'bg-[var(--bg3)] text-[var(--text2)] border-[var(--border2)] hover:text-[var(--gold)]'
            }`}
            title={isRtl ? 'التحكم اليدوي / محاكاة' : 'Manual / Simulation Mode'}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {onRefreshGps && (
            <button
              onClick={onRefreshGps}
              className="p-2 rounded-xl bg-[var(--bg3)] text-[var(--text2)] border border-[var(--border2)] hover:text-[var(--gold)] hover:border-[var(--gold)] text-xs transition-all cursor-pointer"
              title={isRtl ? 'تحديث الإحداثيات عبر GPS' : 'Update Coordinates via GPS'}
            >
              <LocateFixed className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-[var(--bg3)] text-[var(--text2)] border border-[var(--border2)] hover:text-[var(--gold)] text-xs transition-all cursor-pointer"
            title={isExpanded ? (isRtl ? 'تصغير' : 'Minimize') : (isRtl ? 'تكبير' : 'Expand')}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* iOS Sensor Permission Banner if needed */}
      {typeof window !== 'undefined' &&
        typeof (DeviceOrientationEvent as any)?.requestPermission === 'function' &&
        permissionGranted === null && (
          <div className="mb-4 p-3 rounded-2xl bg-[var(--gold)]/10 border border-[var(--gold)]/30 flex items-center justify-between gap-3 text-xs">
            <span className="text-[var(--text)] text-[0.75rem]">
              {isRtl
                ? 'يرجى تفعيل مستشعر الاتجاه والبوصلة على هاتفك:'
                : 'Enable device compass & orientation sensor:'}
            </span>
            <button
              onClick={requestOrientationPermission}
              className="px-3 py-1.5 bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black font-extrabold rounded-xl text-xs shadow-sm active:scale-95 cursor-pointer"
            >
              {isRtl ? 'تفعيل البوصلة' : 'Enable Sensor'}
            </button>
          </div>
        )}

      {/* Main Visual Animated Compass Stage */}
      <div className="flex flex-col items-center justify-center my-2 select-none relative">
        {/* Glow halo when aligned */}
        <div
          className={`absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full transition-all duration-500 pointer-events-none ${
            isAligned
              ? 'bg-emerald-500/20 blur-2xl scale-105'
              : 'bg-[var(--gold)]/5 blur-xl'
          }`}
        />

        {/* Outer Bezel & Degree Ring */}
        <div
          className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 transition-all duration-300 flex items-center justify-center shadow-2xl ${
            isAligned
              ? 'border-emerald-500 bg-emerald-950/20 shadow-emerald-500/30'
              : 'border-[var(--gold)]/40 bg-[var(--bg)]/80'
          }`}
        >
          {/* Top Pointer Triangle (Device Heading) */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
            <div
              className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] ${
                isAligned ? 'border-t-emerald-400' : 'border-t-[var(--gold)]'
              }`}
            />
          </div>

          {/* Rotating Compass Dial (Rotates opposite to device heading) */}
          <div
            className="w-full h-full rounded-full relative flex items-center justify-center transition-transform duration-150 ease-out"
            style={{
              transform: `rotate(${-currentHeading}deg)`,
            }}
          >
            {/* Degree Ticks */}
            {Array.from({ length: 24 }).map((_, i) => {
              const deg = i * 15;
              const isMajor = deg % 90 === 0;
              const isSemiMajor = deg % 30 === 0;
              return (
                <div
                  key={deg}
                  className="absolute w-full h-full top-0 left-0 flex justify-center"
                  style={{ transform: `rotate(${deg}deg)` }}
                >
                  <div
                    className={`transition-colors ${
                      isMajor
                        ? 'w-1 h-3.5 bg-[var(--gold)] mt-1.5'
                        : isSemiMajor
                        ? 'w-0.5 h-2.5 bg-[var(--gold)]/50 mt-1.5'
                        : 'w-0.5 h-1.5 bg-[var(--text3)]/40 mt-2'
                    }`}
                  />
                </div>
              );
            })}

            {/* Cardinal Letters (N, E, S, W) */}
            <div className="absolute top-6 font-bold text-xs sm:text-sm text-red-400 font-sans">
              N
            </div>
            <div className="absolute bottom-6 font-bold text-xs sm:text-sm text-[var(--text2)] font-sans">
              S
            </div>
            <div className="absolute right-6 font-bold text-xs sm:text-sm text-[var(--text2)] font-sans">
              E
            </div>
            <div className="absolute left-6 font-bold text-xs sm:text-sm text-[var(--text2)] font-sans">
              W
            </div>

            {/* Kaaba Direction Marker on the dial */}
            <div
              className="absolute w-full h-full top-0 left-0 flex flex-col items-center justify-start pointer-events-none"
              style={{ transform: `rotate(${qiblaAngle}deg)` }}
            >
              {/* Kaaba Target Line & Badge */}
              <div className="flex flex-col items-center mt-3 animate-pulse">
                <div
                  className={`px-2 py-1 rounded-xl text-[0.65rem] font-extrabold flex items-center gap-1 shadow-lg border ${
                    isAligned
                      ? 'bg-emerald-500 text-black border-emerald-300 ring-2 ring-emerald-300'
                      : 'bg-[var(--gold)] text-black border-[var(--gold2)]'
                  }`}
                >
                  <span>🕋</span>
                  <span>{isRtl ? 'القبلة' : 'Qibla'}</span>
                </div>
                <div
                  className={`w-0.5 h-10 ${
                    isAligned ? 'bg-emerald-400' : 'bg-[var(--gold)]'
                  }`}
                />
              </div>
            </div>

            {/* Inner Decorative Islamic Dial */}
            <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border border-[var(--gold)]/20 bg-[var(--bg2)]/60 flex items-center justify-center relative">
              {/* Subtle 8-point geometric star overlay */}
              <div className="absolute inset-2 border border-[var(--gold)]/15 rotate-45 pointer-events-none" />
              <div className="absolute inset-2 border border-[var(--gold)]/15 pointer-events-none" />

              {/* Center Hub */}
              <div className="text-center z-10">
                <div className="text-xl sm:text-2xl font-bold font-sans text-[var(--gold2)] tracking-tight">
                  {Math.round(currentHeading)}°
                </div>
                <div className="text-[0.65rem] font-bold text-[var(--text3)] uppercase">
                  {getCompassHeadingLabel(currentHeading, lang)}
                </div>
              </div>
            </div>
          </div>

          {/* Central Target Reticle Indicator */}
          <div
            className={`absolute w-12 h-12 rounded-full border-2 border-dashed pointer-events-none transition-all duration-300 flex items-center justify-center ${
              isAligned
                ? 'border-emerald-400 scale-110 bg-emerald-500/10'
                : 'border-[var(--gold)]/30'
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full transition-colors ${
                isAligned ? 'bg-emerald-400 animate-ping' : 'bg-[var(--gold)]'
              }`}
            />
          </div>
        </div>

        {/* Live Alignment Distance & Bearing Text */}
        <div className="mt-4 text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="text-[var(--text3)]">{isRtl ? 'اتجاه القبلة:' : 'Qibla Bearing:'}</span>
            <span className="font-bold text-[var(--gold)] font-sans">
              {Math.round(qiblaAngle)}° ({getCompassHeadingLabel(qiblaAngle, lang)})
            </span>
            <span className="text-[var(--text3)]">·</span>
            <span className="text-[var(--text3)]">{isRtl ? 'الانحراف:' : 'Deviation:'}</span>
            <span
              className={`font-bold font-sans ${
                isAligned ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {Math.round(diffFromQibla)}°
            </span>
          </div>

          <p className="text-[0.68rem] text-[var(--text3)]">
            {isAligned ? (
              <span className="text-emerald-400 font-bold">
                ✓ {isRtl ? 'أنت الآن في الاتجاه الصحيح تماماً نحو الكعبة المشرفة' : 'You are now facing directly towards the Holy Kaaba'}
              </span>
            ) : (
              <span>
                {isRtl
                  ? relativeQiblaAngle > 180
                    ? `استدر لليسار بمقدار ${Math.round(360 - relativeQiblaAngle)}°`
                    : `استدر لليمين بمقدار ${Math.round(relativeQiblaAngle)}°`
                  : relativeQiblaAngle > 180
                  ? `Turn left by ${Math.round(360 - relativeQiblaAngle)}°`
                  : `Turn right by ${Math.round(relativeQiblaAngle)}°`}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Manual Heading Slider (For testing or desktop environments without magnetometer) */}
      {isManualMode && (
        <div className="mt-4 p-3.5 rounded-2xl bg-[var(--bg3)] border border-[var(--border2)] space-y-2 animate-fade-in text-xs">
          <div className="flex items-center justify-between text-[var(--text2)]">
            <span className="font-semibold flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>{isRtl ? 'محاكاة تدوير الجهاز يدوياً:' : 'Manual Device Heading Slider:'}</span>
            </span>
            <span className="font-bold font-mono text-[var(--gold)]">
              {manualHeading !== null ? manualHeading : deviceHeading}°
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="359"
            value={manualHeading !== null ? manualHeading : deviceHeading}
            onChange={(e) => setManualHeading(parseInt(e.target.value, 10))}
            className="w-full accent-[var(--gold)] cursor-pointer"
          />
          <div className="flex justify-between text-[0.65rem] text-[var(--text3)]">
            <span>0° (N)</span>
            <span>90° (E)</span>
            <span>180° (S)</span>
            <span>270° (W)</span>
            <span>360°</span>
          </div>
        </div>
      )}

      {/* Expanded Educational / Technical Information */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-[var(--border2)] grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs animate-fade-in">
          <div className="p-2.5 rounded-xl bg-[var(--bg3)] border border-[var(--border2)]">
            <div className="text-[0.65rem] text-[var(--text3)]">{isRtl ? 'إحداثياتك' : 'Your Coordinates'}</div>
            <div className="font-mono font-bold text-[var(--text)] text-[0.72rem] mt-0.5">
              {effectiveCoords.lat.toFixed(4)}°, {effectiveCoords.lng.toFixed(4)}°
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--bg3)] border border-[var(--border2)]">
            <div className="text-[0.65rem] text-[var(--text3)]">{isRtl ? 'إحداثيات الكعبة' : 'Kaaba Coordinates'}</div>
            <div className="font-mono font-bold text-[var(--text)] text-[0.72rem] mt-0.5">
              {KAABA_COORDINATES.lat.toFixed(4)}°, {KAABA_COORDINATES.lng.toFixed(4)}°
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--bg3)] border border-[var(--border2)] col-span-2 sm:col-span-1">
            <div className="text-[0.65rem] text-[var(--text3)]">{isRtl ? 'حالة الحساس' : 'Sensor Status'}</div>
            <div className="font-bold text-[var(--gold)] text-[0.72rem] mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isManualMode
                  ? isRtl ? 'محاكاة يدوية' : 'Manual'
                  : isSensorSupported
                  ? isRtl ? 'حساس مغناطيسي نشط' : 'Magnetometer Active'
                  : isRtl ? 'غير متاح (محاكاة)' : 'Desktop/Simulated'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
