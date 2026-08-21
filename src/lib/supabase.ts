import { createClient } from '@supabase/supabase-js';
import type { Shop, Profile, Review } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isRealSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase'));

export const supabase = isRealSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial Mock Dataset for local testing when Supabase is not connected
const MOCK_PROFILES: Profile[] = [
  { id: 'usr-customer-1', role: 'customer', full_name: 'Priya Sharma', phone: '+91 98765 00001' },
  { id: 'usr-owner-1', role: 'owner', full_name: 'Rajesh Kumar', phone: '+91 98765 00002' },
  { id: 'usr-owner-2', role: 'owner', full_name: 'Elena Rostova', phone: '+91 98765 00003' },
  { id: 'usr-admin-1', role: 'admin', full_name: 'System Admin', phone: '+91 98765 00004' },
];

let MOCK_SHOPS: Shop[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    owner_id: 'usr-owner-1',
    name: 'Express Steam Press & Dry Care',
    description: 'Premium crisp steam ironing for shirts, suits, and formal wear. Quick 2-hour turnarounds available!',
    latitude: 12.9738,
    longitude: 77.5975,
    address: '45 MG Road, Near Metro Station, Bangalore',
    phone: '+91 98765 43210',
    whatsapp: '+919876543210',
    status: 'approved',
    pickup_available: true,
    delivery_available: true,
    avg_rating: 4.8,
    review_count: 24,
    photos: [
      { id: 'p1', shop_id: '11111111-1111-1111-1111-111111111111', storage_path: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=800', sort_order: 0 },
      { id: 'p2', shop_id: '11111111-1111-1111-1111-111111111111', storage_path: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&q=80&w=800', sort_order: 1 }
    ],
    services: [
      { id: 's1', shop_id: '11111111-1111-1111-1111-111111111111', service_name: 'Shirt / T-Shirt Press', price: 15 },
      { id: 's2', shop_id: '11111111-1111-1111-1111-111111111111', service_name: 'Trousers / Jeans Press', price: 20 },
      { id: 's3', shop_id: '11111111-1111-1111-1111-111111111111', service_name: 'Suit (2-Piece) Steam', price: 80 },
      { id: 's4', shop_id: '11111111-1111-1111-1111-111111111111', service_name: 'Silk Saree Press', price: 60 }
    ],
    hours: [
      { day_of_week: 0, open_time: null, close_time: null, is_closed: true },
      { day_of_week: 1, open_time: '08:00', close_time: '20:00', is_closed: false },
      { day_of_week: 2, open_time: '08:00', close_time: '20:00', is_closed: false },
      { day_of_week: 3, open_time: '08:00', close_time: '20:00', is_closed: false },
      { day_of_week: 4, open_time: '08:00', close_time: '20:00', is_closed: false },
      { day_of_week: 5, open_time: '08:00', close_time: '20:00', is_closed: false },
      { day_of_week: 6, open_time: '08:00', close_time: '20:00', is_closed: false },
    ]
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    owner_id: 'usr-owner-2',
    name: 'Royal Linen Pressing Hub',
    description: 'Specialized in delicate ethnic sarees, silk dresses, and formal suits with protective steam finish.',
    latitude: 12.9680,
    longitude: 77.5910,
    address: '12 Brigade Road, Ground Floor, Bangalore',
    phone: '+91 98123 45678',
    whatsapp: '+919812345678',
    status: 'approved',
    pickup_available: false,
    delivery_available: true,
    avg_rating: 4.6,
    review_count: 18,
    photos: [
      { id: 'p3', shop_id: '22222222-2222-2222-2222-222222222222', storage_path: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&q=80&w=800', sort_order: 0 }
    ],
    services: [
      { id: 's5', shop_id: '22222222-2222-2222-2222-222222222222', service_name: 'Shirt Pressing', price: 18 },
      { id: 's6', shop_id: '22222222-2222-2222-2222-222222222222', service_name: 'Pants Pressing', price: 22 },
      { id: 's7', shop_id: '22222222-2222-2222-2222-222222222222', service_name: 'Heavy Designer Saree', price: 75 }
    ],
    hours: [
      { day_of_week: 0, open_time: '09:00', close_time: '18:00', is_closed: false },
      { day_of_week: 1, open_time: '09:00', close_time: '21:00', is_closed: false },
      { day_of_week: 2, open_time: '09:00', close_time: '21:00', is_closed: false },
      { day_of_week: 3, open_time: '09:00', close_time: '21:00', is_closed: false },
      { day_of_week: 4, open_time: '09:00', close_time: '21:00', is_closed: false },
      { day_of_week: 5, open_time: '09:00', close_time: '21:00', is_closed: false },
      { day_of_week: 6, open_time: '09:00', close_time: '21:00', is_closed: false },
    ]
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    owner_id: 'usr-owner-1',
    name: 'Indiranagar Fresh Pressers',
    description: 'Reliable neighborhood ironing shop for daily clothes, bedsheets, and curtain pressing.',
    latitude: 12.9784,
    longitude: 77.6408,
    address: '789 100 Feet Road, Indiranagar, Bangalore',
    phone: '+91 97654 32109',
    whatsapp: '+919765432109',
    status: 'approved',
    pickup_available: true,
    delivery_available: false,
    avg_rating: 4.4,
    review_count: 32,
    photos: [
      { id: 'p4', shop_id: '33333333-3333-3333-3333-333333333333', storage_path: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=800', sort_order: 0 }
    ],
    services: [
      { id: 's8', shop_id: '33333333-3333-3333-3333-333333333333', service_name: 'Basic Shirt Press', price: 12 },
      { id: 's9', shop_id: '33333333-3333-3333-3333-333333333333', service_name: 'Basic Trouser Press', price: 15 }
    ],
    hours: [
      { day_of_week: 0, open_time: null, close_time: null, is_closed: true },
      { day_of_week: 1, open_time: '08:30', close_time: '20:00', is_closed: false },
      { day_of_week: 2, open_time: '08:30', close_time: '20:00', is_closed: false },
      { day_of_week: 3, open_time: '08:30', close_time: '20:00', is_closed: false },
      { day_of_week: 4, open_time: '08:30', close_time: '20:00', is_closed: false },
      { day_of_week: 5, open_time: '08:30', close_time: '20:00', is_closed: false },
      { day_of_week: 6, open_time: '08:30', close_time: '20:00', is_closed: false },
    ]
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    owner_id: 'usr-owner-2',
    name: 'Koramangala Crisp Express',
    description: 'Eco-friendly steam pressing with zero chemical odor. Same-day service available!',
    latitude: 12.9352,
    longitude: 77.6245,
    address: '88 5th Block, Koramangala, Bangalore',
    phone: '+91 96543 21098',
    whatsapp: '+919654321098',
    status: 'approved',
    pickup_available: true,
    delivery_available: true,
    avg_rating: 4.9,
    review_count: 15,
    photos: [],
    services: [
      { id: 's10', shop_id: '44444444-4444-4444-4444-444444444444', service_name: 'Eco-Steam Shirt', price: 20 },
      { id: 's11', shop_id: '44444444-4444-4444-4444-444444444444', service_name: 'Eco-Steam Trouser', price: 25 }
    ],
    hours: [
      { day_of_week: 0, open_time: '10:00', close_time: '17:00', is_closed: false },
      { day_of_week: 1, open_time: '09:00', close_time: '21:00', is_closed: false },
      { day_of_week: 2, open_time: '09:00', close_time: '21:00', is_closed: false },
      { day_of_week: 3, open_time: '09:00', close_time: '21:00', is_closed: false },
      { day_of_week: 4, open_time: '09:00', close_time: '21:00', is_closed: false },
      { day_of_week: 5, open_time: '09:00', close_time: '21:00', is_closed: false },
      { day_of_week: 6, open_time: '09:00', close_time: '21:00', is_closed: false },
    ]
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    owner_id: 'usr-owner-1',
    name: 'Whitefield Tech Park Ironing Works',
    description: 'Corporate clothes care specialist. Heavy duty steam pressing for corporate uniforms and suits.',
    latitude: 12.9698,
    longitude: 77.7499,
    address: '102 ITPL Main Road, Whitefield, Bangalore',
    phone: '+91 95432 10987',
    whatsapp: '+919543210987',
    status: 'approved',
    pickup_available: false,
    delivery_available: false,
    avg_rating: 4.2,
    review_count: 9,
    photos: [],
    services: [
      { id: 's12', shop_id: '55555555-5555-5555-5555-555555555555', service_name: 'Corporate Shirt', price: 15 }
    ],
    hours: []
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    owner_id: 'usr-owner-2',
    name: 'Metro Care Steam Pressing (Pending)',
    description: 'Newly submitted shop awaiting admin validation.',
    latitude: 12.9750,
    longitude: 77.6000,
    address: '15 Commercial Street, Bangalore',
    phone: '+91 94321 09876',
    whatsapp: '+919432109876',
    status: 'pending',
    pickup_available: true,
    delivery_available: true,
    avg_rating: 0,
    review_count: 0,
    photos: [],
    services: [
      { id: 's13', shop_id: '66666666-6666-6666-6666-666666666666', service_name: 'Quick Press', price: 15 }
    ],
    hours: []
  }
];

let MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    shop_id: '11111111-1111-1111-1111-111111111111',
    customer_id: 'usr-customer-1',
    rating: 5,
    comment: 'Extremely fast and crisp pressing! My formal shirts look brand new.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    customer_name: 'Priya Sharma'
  },
  {
    id: 'r2',
    shop_id: '11111111-1111-1111-1111-111111111111',
    customer_id: 'usr-customer-2',
    rating: 4,
    comment: 'Great service and friendly staff. Pickup arrived right on time.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    customer_name: 'David Miller'
  },
  {
    id: 'r3',
    shop_id: '22222222-2222-2222-2222-222222222222',
    customer_id: 'usr-customer-1',
    rating: 5,
    comment: 'They handled my silk saree with immense care. No shine or burns at all.',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    customer_name: 'Priya Sharma'
  }
];

// Haversine formula to compute accurate distance in kilometers
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

// Local API Mock Adapter Engine
export const mockDatabase = {
  getNearbyShops: async (lat: number, lng: number, radiusKm = 10): Promise<Shop[]> => {
    // Filter approved shops and calculate distance
    const approved = MOCK_SHOPS.filter(s => s.status === 'approved');
    const withDistance = approved.map(shop => {
      const distance_km = calculateHaversineDistance(lat, lng, shop.latitude, shop.longitude);
      const min_price = shop.services && shop.services.length > 0
        ? Math.min(...shop.services.map(srv => srv.price))
        : 15;
      return { ...shop, distance_km, min_price };
    });

    // Filter within radius (or return sorted all if radius is large)
    return withDistance
      .filter(s => s.distance_km! <= radiusKm)
      .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
  },

  getShopById: async (id: string): Promise<Shop | null> => {
    const shop = MOCK_SHOPS.find(s => s.id === id);
    if (!shop) return null;
    return { ...shop };
  },

  getAllShopsAdmin: async (): Promise<Shop[]> => {
    return [...MOCK_SHOPS];
  },

  getOwnerShops: async (ownerId: string): Promise<Shop[]> => {
    return MOCK_SHOPS.filter(s => s.owner_id === ownerId);
  },

  createShop: async (newShop: Partial<Shop>): Promise<Shop> => {
    const created: Shop = {
      id: `shop-${Date.now()}`,
      owner_id: newShop.owner_id || 'usr-owner-1',
      name: newShop.name || 'New Ironing Shop',
      description: newShop.description || '',
      latitude: newShop.latitude || 12.9716,
      longitude: newShop.longitude || 77.5946,
      address: newShop.address || '',
      phone: newShop.phone || '',
      whatsapp: newShop.whatsapp || '',
      status: 'pending',
      pickup_available: newShop.pickup_available || false,
      delivery_available: newShop.delivery_available || false,
      avg_rating: 0,
      review_count: 0,
      photos: newShop.photos || [],
      services: newShop.services || [],
      hours: newShop.hours || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MOCK_SHOPS.push(created);
    return created;
  },

  updateShopStatus: async (id: string, status: 'approved' | 'rejected' | 'suspended'): Promise<Shop | null> => {
    const shop = MOCK_SHOPS.find(s => s.id === id);
    if (shop) {
      shop.status = status;
      shop.updated_at = new Date().toISOString();
      return { ...shop };
    }
    return null;
  },

  getShopReviews: async (shopId: string): Promise<Review[]> => {
    return MOCK_REVIEWS.filter(r => r.shop_id === shopId);
  },

  addReview: async (review: Omit<Review, 'id' | 'created_at'>): Promise<Review> => {
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString(),
      customer_name: review.customer_name || 'Customer'
    };
    MOCK_REVIEWS.unshift(newRev);

    // Recalculate average rating & review count for shop
    const shopReviews = MOCK_REVIEWS.filter(r => r.shop_id === review.shop_id);
    const shop = MOCK_SHOPS.find(s => s.id === review.shop_id);
    if (shop) {
      const avg = shopReviews.reduce((sum, r) => sum + r.rating, 0) / shopReviews.length;
      shop.avg_rating = Math.round(avg * 10) / 10;
      shop.review_count = shopReviews.length;
    }

    return newRev;
  },

  getProfiles: async (): Promise<Profile[]> => {
    return [...MOCK_PROFILES];
  }
};
