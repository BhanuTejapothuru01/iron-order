export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

export const isMapboxTokenValid = Boolean(
  MAPBOX_TOKEN && 
  MAPBOX_TOKEN.length > 10 && 
  !MAPBOX_TOKEN.includes('your-mapbox')
);

// Standard default coordinates (Central Bangalore test location)
export const DEFAULT_LOCATION = {
  latitude: 12.9716,
  longitude: 77.5946,
  addressName: 'MG Road Metro Station, Bangalore'
};

// Geocoding helper using Mapbox API or OpenStreetMap Nominatim fallback
export async function geocodeSearch(query: string): Promise<Array<{ label: string; lat: number; lng: number }>> {
  if (!query || query.length < 2) return [];

  if (isMapboxTokenValid) {
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5`);
      const data = await res.json();
      if (data.features) {
        return data.features.map((f: any) => ({
          label: f.place_name,
          lat: f.center[1],
          lng: f.center[0]
        }));
      }
    } catch (e) {
      console.warn('Mapbox geocoding error, falling back to OSM Nominatim', e);
    }
  }

  // OpenStreetMap Nominatim Fallback API
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
    const data = await res.json();
    return data.map((item: any) => ({
      label: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    }));
  } catch (e) {
    console.error('Geocoding fallback failed', e);
    return [];
  }
}

// Reverse Geocoding helper (coordinates to address)
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await res.json();
    if (data && data.display_name) {
      return data.display_name;
    }
  } catch (e) {
    console.warn('Reverse geocoding error:', e);
  }
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

// Google Maps URL generator for external navigation
export function getGoogleMapsUrl(lat: number, lng: number, label?: string): string {
  if (label) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

// Apple Maps URL generator for external navigation
export function getAppleMapsUrl(lat: number, lng: number, label?: string): string {
  const queryStr = label ? encodeURIComponent(label) : 'Shop Location';
  return `https://maps.apple.com/?q=${queryStr}&ll=${lat},${lng}`;
}

