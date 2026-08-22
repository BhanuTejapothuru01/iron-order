import { useQuery } from '@tanstack/react-query';
import type { Shop, DistanceGroupedShops, ShopService, ShopHours, ShopPhoto } from '../types';
import { supabase, isRealSupabaseConfigured, mockDatabase } from '../lib/supabase';
import { fetchRealLaundryShopsFromOSM } from '../lib/osmServices';

export function useNearbyShops(lat: number, lng: number, radiusKm: number = 15) {
  const query = useQuery<Shop[]>({
    queryKey: ['nearby-shops', lat, lng, radiusKm],
    queryFn: async () => {
      let baseShops: Shop[] = [];

      if (isRealSupabaseConfigured && supabase) {
        const { data, error } = await supabase.rpc('get_nearby_shops', {
          in_lat: lat,
          in_lng: lng,
          radius_km: radiusKm,
        });

        if (error) {
          console.error('RPC get_nearby_shops error', error);
          baseShops = await mockDatabase.getNearbyShops(lat, lng, radiusKm);
        } else {
          const shopIds = data.map((s: any) => s.id);
          const { data: services } = await supabase
            .from('shop_services')
            .select('*')
            .in('shop_id', shopIds);

          const { data: hours } = await supabase
            .from('shop_hours')
            .select('*')
            .in('shop_id', shopIds);

          const { data: photos } = await supabase
            .from('shop_photos')
            .select('*')
            .in('shop_id', shopIds);

          baseShops = data.map((shop: any) => {
            const shopServices = services?.filter((s: ShopService) => s.shop_id === shop.id) || [];
            const min_price = shopServices.length > 0 ? Math.min(...shopServices.map((s: ShopService) => s.price)) : 15;
            return {
              ...shop,
              source: shop.source || 'partner',
              services: shopServices,
              hours: hours?.filter((h: ShopHours) => h.shop_id === shop.id) || [],
              photos: photos?.filter((p: ShopPhoto) => p.shop_id === shop.id) || [],
              min_price
            };
          });
        }
      } else {
        baseShops = await mockDatabase.getNearbyShops(lat, lng, radiusKm);
      }

      // Fetch live real laundry shops from OpenStreetMap
      const osmShops = await fetchRealLaundryShopsFromOSM(lat, lng, radiusKm);

      // Combine base database/mock shops and OSM shops, deduplicating very close locations (< 0.05 km)
      const combined = [...baseShops];

      for (const osmShop of osmShops) {
        const isDuplicate = combined.some(bShop => {
          const latDiff = Math.abs(bShop.latitude - osmShop.latitude);
          const lngDiff = Math.abs(bShop.longitude - osmShop.longitude);
          return latDiff < 0.0005 && lngDiff < 0.0005;
        });

        if (!isDuplicate) {
          combined.push(osmShop);
        }
      }

      // Sort by distance
      return combined.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const shops = query.data || [];

  // Group shops into distance bands
  const groupedShops: DistanceGroupedShops = {
    walking: shops.filter((s: Shop) => (s.distance_km || 0) < 1.0),
    nearby: shops.filter((s: Shop) => (s.distance_km || 0) >= 1.0 && (s.distance_km || 0) <= 5.0),
    extended: shops.filter((s: Shop) => (s.distance_km || 0) > 5.0),
  };

  return {
    ...query,
    shops,
    groupedShops,
  };
}
