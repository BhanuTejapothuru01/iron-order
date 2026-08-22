export type UserRole = 'customer' | 'owner' | 'admin';

export type ShopStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type OrderStatus = 
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'processing'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 
  | 'pending'
  | 'paid_to_shop'
  | 'failed'
  | 'refunded';

export type PaymentMethod = 
  | 'cash'
  | 'upi'
  | 'pay_to_shop'
  | 'other';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  email?: string | null;
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
  description?: string | null;
  category?: string | null;
  is_active?: boolean;
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
  order_id?: string | null;
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
  min_order_amount?: number;
  service_area_km?: number;
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
  is_osm?: boolean;
  source?: 'partner' | 'osm';
  shop_type?: 'ironing' | 'steam_press' | 'laundry' | 'dry_clean' | 'dhobi_ghat';
}

export interface Address {
  id: string;
  customer_id: string;
  address_line: string;
  landmark?: string | null;
  city: string;
  pincode?: string | null;
  phone: string;
  is_default?: boolean;
  created_at?: string;
}

export interface OrderItem {
  id: string;
  order_id?: string;
  service_id?: string;
  service_name_snapshot: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface CartItem {
  service: ShopService;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: number | string;
  customer_id: string;
  shop_id: string;
  address_id?: string | null;
  customer_name: string;
  customer_phone: string;
  delivery_address?: string | null;
  shop_name?: string;
  shop_address?: string;
  shop_phone?: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  paid_at?: string | null;
  commission_rate: number; // e.g. 10.0
  commission_amount: number;
  shop_earnings: number;
  pickup_requested: boolean;
  delivery_requested: boolean;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface CommissionSetting {
  id: string;
  default_rate: number;
  updated_at: string;
  updated_by?: string | null;
}

export interface CommissionSettlement {
  id: string;
  shop_id: string;
  shop_name?: string;
  order_id?: string | null;
  amount: number;
  status: 'pending' | 'settled';
  settled_at?: string | null;
  settlement_reference?: string | null;
  settled_by?: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'order_update' | 'payment' | 'system';
  order_id?: string | null;
  is_read: boolean;
  created_at: string;
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
