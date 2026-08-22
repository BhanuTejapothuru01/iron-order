import { useState, useEffect } from 'react';
import type { UserLocation } from '../types';
import { DEFAULT_LOCATION, reverseGeocode, geocodeSearch } from '../lib/mapbox';

export function useGeolocation() {
  const [location, setLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const requestBrowserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Reverse geocode to get real neighborhood & city name
        let resolvedName = 'Near You (GPS)';
        try {
          const rawAddr = await reverseGeocode(lat, lng);
          if (rawAddr) {
            const parts = rawAddr.split(',');
            resolvedName = parts.length > 2 ? `${parts[0].trim()}, ${parts[1].trim()}` : rawAddr;
          }
        } catch {
          resolvedName = `GPS (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
        }

        setLocation({
          latitude: lat,
          longitude: lng,
          addressName: resolvedName,
          isCustom: false,
        });
        setIsGpsActive(true);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setError('Location permission denied or unavailable. Using default location.');
        setIsGpsActive(false);
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const setManualLocation = (lat: number, lng: number, addressName: string) => {
    setLocation({
      latitude: lat,
      longitude: lng,
      addressName,
      isCustom: true,
    });
    setIsGpsActive(false);
  };

  useEffect(() => {
    requestBrowserLocation();
  }, []);

  return {
    location,
    isLocating,
    isGpsActive,
    error,
    requestBrowserLocation,
    setManualLocation,
    searchAddress: geocodeSearch,
  };
}
