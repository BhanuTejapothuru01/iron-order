import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Shop, UserLocation } from '../../types';

interface MapViewProps {
  userLocation: UserLocation;
  shops: Shop[];
  selectedShopId?: string | null;
  onSelectShop: (shop: Shop) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  userLocation,
  shops,
  selectedShopId,
  onSelectShop,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.latitude, userLocation.longitude],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      leafletMapRef.current = map;
    } else {
      leafletMapRef.current.setView([userLocation.latitude, userLocation.longitude]);
    }

    const map = leafletMapRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Create custom Icon for User Location
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `<div class="w-6 h-6 bg-brand-500 rounded-full border-4 border-white shadow-lg animate-pulse flex items-center justify-center">
              <div class="w-2 h-2 bg-white rounded-full"></div>
             </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const userMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
      .addTo(map)
      .bindPopup('<b>Your Location</b>');

    markersRef.current.push(userMarker);

    // Create markers for each shop
    shops.forEach(shop => {
      const isSelected = shop.id === selectedShopId;

      const shopIcon = L.divIcon({
        className: 'custom-shop-marker',
        html: `<div class="px-2.5 py-1 ${isSelected ? 'bg-brand-600 scale-110 shadow-glow' : 'bg-slate-900'} text-white rounded-full text-xs font-bold shadow-lg border-2 border-white flex items-center gap-1 cursor-pointer hover:scale-110 transition-transform">
                <span>🧺</span>
                <span>₹${shop.min_price || 15}</span>
               </div>`,
        iconSize: [60, 26],
        iconAnchor: [30, 13]
      });

      const marker = L.marker([shop.latitude, shop.longitude], { icon: shopIcon })
        .addTo(map)
        .on('click', () => {
          onSelectShop(shop);
        });

      markersRef.current.push(marker);
    });

  }, [userLocation, shops, selectedShopId, onSelectShop]);

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px] z-0" />

      {/* Map legend overlay */}
      <div className="absolute bottom-3 left-3 z-10 glass-panel px-3 py-2 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-brand-500 border-2 border-white inline-block"></span>
          <span>You</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-900 border-2 border-white inline-block"></span>
          <span>Ironing Shop</span>
        </div>
      </div>
    </div>
  );
};
