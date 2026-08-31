// Qibla calculation and geolocation utilities

export const KAABA_COORDINATES = {
  lat: 21.422487,
  lng: 39.826206,
};

/**
 * Calculates the forward azimuth / bearing from user's coordinates to the Kaaba in Mecca
 * Formula:
 * θ = atan2( sin(Δlong) * cos(lat2), cos(lat1)*sin(lat2) − sin(lat1)*cos(lat2)*cos(Δlong) )
 */
export function calculateQiblaDirection(userLat: number, userLng: number): number {
  const phi1 = (userLat * Math.PI) / 180;
  const phi2 = (KAABA_COORDINATES.lat * Math.PI) / 180;
  const deltaLambda = ((KAABA_COORDINATES.lng - userLng) * Math.PI) / 180;

  const y = Math.sin(deltaLambda);
  const x =
    Math.cos(phi1) * Math.tan(phi2) -
    Math.sin(phi1) * Math.cos(deltaLambda);

  let qiblaRad = Math.atan2(y, x);
  let qiblaDeg = (qiblaRad * 180) / Math.PI;

  return (qiblaDeg + 360) % 360;
}

/**
 * Calculates the great-circle distance in kilometers from user's location to the Kaaba
 * using the Haversine formula.
 */
export function calculateDistanceToKaaba(userLat: number, userLng: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((KAABA_COORDINATES.lat - userLat) * Math.PI) / 180;
  const dLon = ((KAABA_COORDINATES.lng - userLng) * Math.PI) / 180;
  const lat1 = (userLat * Math.PI) / 180;
  const lat2 = (KAABA_COORDINATES.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Returns cardinal compass direction name in Arabic and English
 */
export function getCompassHeadingLabel(deg: number, lang: string = 'ar'): string {
  const normalized = (deg + 360) % 360;
  const directions = [
    { ar: 'شمال', en: 'North', short: 'N', min: 337.5, max: 22.5 },
    { ar: 'شمال شرق', en: 'North East', short: 'NE', min: 22.5, max: 67.5 },
    { ar: 'شرق', en: 'East', short: 'E', min: 67.5, max: 112.5 },
    { ar: 'جنوب شرق', en: 'South East', short: 'SE', min: 112.5, max: 157.5 },
    { ar: 'جنوب', en: 'South', short: 'S', min: 157.5, max: 202.5 },
    { ar: 'جنوب غرب', en: 'South West', short: 'SW', min: 202.5, max: 247.5 },
    { ar: 'غرب', en: 'West', short: 'W', min: 247.5, max: 292.5 },
    { ar: 'شمال غرب', en: 'North West', short: 'NW', min: 292.5, max: 337.5 },
  ];

  for (const d of directions) {
    if (d.min > d.max) {
      if (normalized >= d.min || normalized < d.max) {
        return lang === 'ar' ? d.ar : d.en;
      }
    } else {
      if (normalized >= d.min && normalized < d.max) {
        return lang === 'ar' ? d.ar : d.en;
      }
    }
  }

  return lang === 'ar' ? 'شمال' : 'North';
}
