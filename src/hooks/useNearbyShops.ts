import { useQuery } from '@tanstack/react-query';
import type { Shop, DistanceGroupedShops, ShopService, ShopHours, ShopPhoto } from '../types';
import { supabase, isRealSupabaseConfigured, mockDatabase } from '../lib/supabase';

export function useNearbyShops(lat: number, lng: number, radiusKm: number = 10) {
  const query = useQuery<Shop[]>({
    queryKey: ['nearby-shops', lat, lng, radiusKm],
    queryFn: async () => {
      if (isRealSupabaseConfigured && supabase) {
        const { data, error } = await supabase.rpc('get_nearby_shops', {
          in_lat: lat,
          in_lng: lng,
          radius_km: radiusKm,
        });

        if (error) {
          console.error('RPC get_nearby_shops error', error);
          throw new Error(error.message);
        }

        // Fetch services and hours for each shop to attach min_price and operating hours
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

        return data.map((shop: any) => {
          const shopServices = services?.filter((s: ShopService) => s.shop_id === shop.id) || [];
          const min_price = shopServices.length > 0 ? Math.min(...shopServices.map((s: ShopService) => s.price)) : 15;
          return {
            ...shop,
            services: shopServices,
            hours: hours?.filter((h: ShopHours) => h.shop_id === shop.id) || [],
            photos: photos?.filter((p: ShopPhoto) => p.shop_id === shop.id) || [],
            min_price
          };
        });
      } else {
        return await mockDatabase.getNearbyShops(lat, lng, radiusKm);
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
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
