export interface GeocodingResult {
  place_id: number;
  osm_id: number;
  lat: number;
  lng: number;
  displayName: string;
  name: string;
  type: string;
  city?: string;
  state?: string;
  country?: string;
}

/**
 * Searches for any city, neighborhood, street, or landmark worldwide using OpenStreetMap Nominatim
 */
export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'IronApp/1.0 (contact@ironapp.local)',
        'Accept-Language': 'en',
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.map((item: any) => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      const name = item.name || item.address?.city || item.address?.town || item.address?.suburb || item.display_name.split(',')[0];
      const city = item.address?.city || item.address?.town || item.address?.county || item.address?.state_district;

      return {
        place_id: item.place_id,
        osm_id: item.osm_id,
        lat,
        lng,
        displayName: item.display_name,
        name,
        type: item.type,
        city,
        state: item.address?.state,
        country: item.address?.country,
      };
    });
  } catch (err) {
    console.warn('Geocoding search failed:', err);
    return [];
  }
}
