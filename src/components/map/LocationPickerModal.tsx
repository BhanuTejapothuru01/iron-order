import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Search, Navigation, CheckCircle2, ExternalLink } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { geocodeSearch, reverseGeocode, getGoogleMapsUrl, getAppleMapsUrl } from '../../lib/mapbox';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onSelectLocation: (location: { lat: number; lng: number; address: string }) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  initialLat = 12.9716,
  initialLng = 77.5946,
  initialAddress = '',
  onSelectLocation,
}) => {
  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);
  const [address, setAddress] = useState<string>(initialAddress);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Array<{ label: string; lat: number; lng: number }>>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLat(initialLat);
      setLng(initialLng);
      setAddress(initialAddress);
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen, initialLat, initialLng, initialAddress]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Destroy existing map instance if container changed
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Custom Pin Icon
      const pinIcon = L.divIcon({
        className: 'custom-picker-marker',
        html: `<div class="w-8 h-8 bg-brand-600 border-2 border-white rounded-full shadow-xl flex items-center justify-center text-white font-bold animate-bounce">
                📍
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map);

      // Handle marker drag
      marker.on('dragend', async () => {
        const position = marker.getLatLng();
        setLat(position.lat);
        setLng(position.lng);
        const resolvedAddr = await reverseGeocode(position.lat, position.lng);
        setAddress(resolvedAddr);
      });

      // Handle map click
      map.on('click', async (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        setLat(e.latlng.lat);
        setLng(e.latlng.lng);
        const resolvedAddr = await reverseGeocode(e.latlng.lat, e.latlng.lng);
        setAddress(resolvedAddr);
      });

      mapRef.current = map;
      markerRef.current = marker;
    } else {
      mapRef.current.setView([lat, lng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
    }

    // Fix map rendering timing issues inside modals
    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 200);

  }, [isOpen, lat, lng]);

  // Cleanup map instance on unmount or close
  useEffect(() => {
    if (!isOpen && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    }
  }, [isOpen]);

  // Search Address Autocomplete
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await geocodeSearch(searchQuery.trim());
      setSearchResults(results);
    } catch (err) {
      console.error('Search location error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = async (res: { label: string; lat: number; lng: number }) => {
    setLat(res.lat);
    setLng(res.lng);
    setAddress(res.label);
    setSearchResults([]);
    setSearchQuery('');
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([res.lat, res.lng], 16);
      markerRef.current.setLatLng([res.lat, res.lng]);
    }
  };

  // Browser Geolocation
  const handleDetectGPS = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        setLat(newLat);
        setLng(newLng);
        setIsLocating(false);
        const resolvedAddr = await reverseGeocode(newLat, newLng);
        setAddress(resolvedAddr);
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([newLat, newLng], 16);
          markerRef.current.setLatLng([newLat, newLng]);
        }
      },
      (err) => {
        console.warn('Geolocation failed:', err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleConfirm = () => {
    onSelectLocation({
      lat,
      lng,
      address: address.trim() || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-slate-900">Pin Shop Location</h3>
              <p className="text-xs text-slate-500">Search address, use GPS, or click/drag the map pin</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={getGoogleMapsUrl(lat, lng, address)}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
              title="Preview in Google Maps"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={getAppleMapsUrl(lat, lng, address)}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
              title="Preview in Apple Maps"
            >
              <span>Apple Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Address Search Bar */}
        <div className="relative">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search area, landmark or street address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="flex-1"
            />
            <Button type="submit" size="sm" isLoading={isSearching}>
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDetectGPS}
              isLoading={isLocating}
              leftIcon={<Navigation className="w-4 h-4 text-brand-600" />}
              title="Use current location"
            >
              GPS
            </Button>
          </form>

          {/* Search Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left p-2.5 hover:bg-brand-50 text-xs font-medium text-slate-700 flex items-start gap-2 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-brand-500 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{res.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Display */}
        <div className="relative w-full h-[280px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
          <div className="absolute top-2 left-2 z-10 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-lg pointer-events-none">
            Drag marker or tap map to update coordinates
          </div>
        </div>

        {/* Selected Address Display */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected Address & Coordinates</div>
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
            <span className="line-clamp-1">{address || 'No address set'}</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
            Confirm Location
          </Button>
        </div>
      </div>
    </Modal>
  );
};
