import { useState, useEffect } from 'react';
import type { UserLocation } from '../types';
import { DEFAULT_LOCATION, geocodeSearch } from '../lib/mapbox';

export function useGeolocation() {
  const [location, setLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const requestBrowserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          addressName: 'Current Location',
          isCustom: false,
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setError('Location permission denied or unavailable. Using default location.');
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
  };

  useEffect(() => {
    requestBrowserLocation();
  }, []);

  return {
    location,
    isLocating,
    error,
    requestBrowserLocation,
    setManualLocation,
    searchAddress: geocodeSearch,
  };
}
