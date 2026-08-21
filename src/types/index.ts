export type UserRole = 'customer' | 'owner' | 'admin';

export type ShopStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  created_at?: string;
}

export interface ShopPhoto {
  id: string;
  shop_id: string;
  storage_path: string;
  sort_order: number;
}

export interface ShopService {
  id: string;
  shop_id: string;
  service_name: string;
  price: number;
}

export interface ShopHours {
  id?: string;
  shop_id?: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  open_time: string | null; // e.g. "08:00"
  close_time: string | null; // e.g. "20:00"
  is_closed: boolean;
}

export interface Review {
  id: string;
  shop_id: string;
  customer_id: string;
  rating: number; // 1 to 5
  comment: string | null;
  created_at: string;
  customer_name?: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  status: ShopStatus;
  pickup_available: boolean;
  delivery_available: boolean;
  avg_rating: number;
  review_count: number;
  created_at?: string;
  updated_at?: string;
  
  // Computed / Joined properties
  distance_km?: number;
  min_price?: number;
  photos?: ShopPhoto[];
  services?: ShopService[];
  hours?: ShopHours[];
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  addressName?: string;
  isCustom?: boolean;
}

export type DistanceBand = 'walking' | 'nearby' | 'extended';

export interface DistanceGroupedShops {
  walking: Shop[];  // < 1 km
  nearby: Shop[];   // 1 - 5 km
  extended: Shop[]; // 5+ km
}
