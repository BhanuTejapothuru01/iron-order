import { createClient } from '@supabase/supabase-js';
import type { 
  Shop, 
  Profile, 
  Review, 
  Order, 
  OrderItem, 
  OrderStatus, 
  PaymentStatus, 
  PaymentMethod,
  ShopService,
  CommissionSettlement,
  Notification
} from '../types';

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

let MOCK_COMMISSION_RATE = 10.0; // 10% default platform commission

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
    min_order_amount: 50,
    service_area_km: 5.0,
    avg_rating: 4.8,
    review_count: 24,
    source: 'partner',
    shop_type: 'steam_press',
    photos: [
      { id: 'p1', shop_id: '11111111-1111-1111-1111-111111111111', storage_path: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=800', sort_order: 0 },
      { id: 'p2', shop_id: '11111111-1111-1111-1111-111111111111', storage_path: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&q=80&w=800', sort_order: 1 }
    ],
    services: [
      { id: 's1', shop_id: '11111111-1111-1111-1111-111111111111', service_name: 'Shirt / T-Shirt Press', price: 15, description: 'Crisp steam press fold or hanger', is_active: true },
      { id: 's2', shop_id: '11111111-1111-1111-1111-111111111111', service_name: 'Trousers / Jeans Press', price: 20, description: 'Double crease steam iron', is_active: true },
      { id: 's3', shop_id: '11111111-1111-1111-1111-111111111111', service_name: 'Suit (2-Piece) Steam', price: 80, description: 'Gentle coat and pant steam finish', is_active: true },
      { id: 's4', shop_id: '11111111-1111-1111-1111-111111111111', service_name: 'Silk Saree Press', price: 60, description: 'Protective temperature steam ironing', is_active: true }
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
    source: 'partner',
    shop_type: 'steam_press',
    photos: [
      { id: 'p3', shop_id: '22222222-2222-2222-2222-222222222222', storage_path: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&q=80&w=800', sort_order: 0 }
    ],
    services: [
      { id: 's5', shop_id: '22222222-2222-2222-2222-222222222222', service_name: 'Shirt Pressing', price: 18, is_active: true },
      { id: 's6', shop_id: '22222222-2222-2222-2222-222222222222', service_name: 'Pants Pressing', price: 22, is_active: true },
      { id: 's7', shop_id: '22222222-2222-2222-2222-222222222222', service_name: 'Heavy Designer Saree', price: 75, is_active: true }
    ],
    hours: []
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
    source: 'partner',
    shop_type: 'ironing',
    photos: [],
    services: [
      { id: 's8', shop_id: '33333333-3333-3333-3333-333333333333', service_name: 'Basic Shirt Press', price: 12, is_active: true },
      { id: 's9', shop_id: '33333333-3333-3333-3333-333333333333', service_name: 'Basic Trouser Press', price: 15, is_active: true }
    ],
    hours: []
  }
];

let MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    order_number: 1001,
    customer_id: 'usr-customer-1',
    shop_id: '11111111-1111-1111-1111-111111111111',
    customer_name: 'Priya Sharma',
    customer_phone: '+91 98765 00001',
    delivery_address: 'Flat 402, Sunshine Apartments, MG Road, Bengaluru',
    shop_name: 'Express Steam Press & Dry Care',
    shop_address: '45 MG Road, Near Metro Station, Bangalore',
    shop_phone: '+91 98765 43210',
    status: 'completed',
    subtotal: 115,
    delivery_fee: 20,
    total_amount: 135,
    payment_method: 'upi',
    payment_status: 'paid_to_shop',
    paid_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    commission_rate: 10.0,
    commission_amount: 13.5,
    shop_earnings: 121.5,
    pickup_requested: true,
    delivery_requested: true,
    scheduled_date: '2026-08-21',
    scheduled_time: '10:00 AM - 12:00 PM',
    notes: 'Please double crease the trousers.',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    items: [
      { id: 'oi-1', order_id: 'ord-1001', service_id: 's1', service_name_snapshot: 'Shirt / T-Shirt Press', unit_price: 15, quantity: 5, subtotal: 75 },
      { id: 'oi-2', order_id: 'ord-1001', service_id: 's2', service_name_snapshot: 'Trousers / Jeans Press', unit_price: 20, quantity: 2, subtotal: 40 }
    ]
  },
  {
    id: 'ord-1002',
    order_number: 1002,
    customer_id: 'usr-customer-1',
    shop_id: '11111111-1111-1111-1111-111111111111',
    customer_name: 'Priya Sharma',
    customer_phone: '+91 98765 00001',
    delivery_address: 'Flat 402, Sunshine Apartments, MG Road, Bengaluru',
    shop_name: 'Express Steam Press & Dry Care',
    shop_address: '45 MG Road, Near Metro Station, Bangalore',
    shop_phone: '+91 98765 43210',
    status: 'processing',
    subtotal: 140,
    delivery_fee: 0,
    total_amount: 140,
    payment_method: 'cash',
    payment_status: 'pending',
    commission_rate: 10.0,
    commission_amount: 14.0,
    shop_earnings: 126.0,
    pickup_requested: false,
    delivery_requested: false,
    scheduled_date: '2026-08-22',
    scheduled_time: '04:00 PM - 06:00 PM',
    notes: 'Fragile silk saree steam iron.',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    items: [
      { id: 'oi-3', order_id: 'ord-1002', service_id: 's3', service_name_snapshot: 'Suit (2-Piece) Steam', unit_price: 80, quantity: 1, subtotal: 80 },
      { id: 'oi-4', order_id: 'ord-1002', service_id: 's4', service_name_snapshot: 'Silk Saree Press', unit_price: 60, quantity: 1, subtotal: 60 }
    ]
  },
  {
    id: 'ord-1003',
    order_number: 1003,
    customer_id: 'usr-customer-1',
    shop_id: '22222222-2222-2222-2222-222222222222',
    customer_name: 'Priya Sharma',
    customer_phone: '+91 98765 00001',
    delivery_address: 'Brigade Towers, Floor 3, Bengaluru',
    shop_name: 'Royal Linen Pressing Hub',
    shop_address: '12 Brigade Road, Ground Floor, Bangalore',
    shop_phone: '+91 98123 45678',
    status: 'pending',
    subtotal: 115,
    delivery_fee: 25,
    total_amount: 140,
    payment_method: 'pay_to_shop',
    payment_status: 'pending',
    commission_rate: 10.0,
    commission_amount: 14.0,
    shop_earnings: 126.0,
    pickup_requested: true,
    delivery_requested: true,
    scheduled_date: '2026-08-23',
    scheduled_time: '11:00 AM - 01:00 PM',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    items: [
      { id: 'oi-5', order_id: 'ord-1003', service_id: 's5', service_name_snapshot: 'Shirt Pressing', unit_price: 18, quantity: 5, subtotal: 90 },
      { id: 'oi-6', order_id: 'ord-1003', service_id: 's6', service_name_snapshot: 'Pants Pressing', unit_price: 22, quantity: 1, subtotal: 22 }
    ]
  }
];

let MOCK_SETTLEMENTS: CommissionSettlement[] = [
  {
    id: 'stl-1',
    shop_id: '11111111-1111-1111-1111-111111111111',
    shop_name: 'Express Steam Press & Dry Care',
    order_id: 'ord-1001',
    amount: 13.5,
    status: 'settled',
    settled_at: new Date(Date.now() - 43200000).toISOString(),
    settlement_reference: 'SETTLE-2026-001',
    settled_by: 'usr-admin-1',
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

let MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'usr-customer-1',
    title: 'Order Completed! 🎉',
    message: 'Your order #1001 with Express Steam Press has been completed. Please rate your experience!',
    type: 'order_update',
    order_id: 'ord-1001',
    is_read: false,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'notif-2',
    user_id: 'usr-owner-1',
    title: 'New Order Received! 👔',
    message: 'New Order #1003 received from Priya Sharma for ₹140.',
    type: 'order_update',
    order_id: 'ord-1003',
    is_read: false,
    created_at: new Date(Date.now() - 1800000).toISOString()
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
    const approved = MOCK_SHOPS.filter(s => s.status === 'approved');
    const withDistance = approved.map(shop => {
      const distance_km = calculateHaversineDistance(lat, lng, shop.latitude, shop.longitude);
      const min_price = shop.services && shop.services.length > 0
        ? Math.min(...shop.services.filter(s => s.is_active !== false).map(srv => srv.price))
        : 15;
      return { ...shop, distance_km, min_price };
    });

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
      min_order_amount: newShop.min_order_amount || 0,
      service_area_km: newShop.service_area_km || 5.0,
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

  updateShopProfile: async (id: string, updates: Partial<Shop>): Promise<Shop | null> => {
    const shop = MOCK_SHOPS.find(s => s.id === id);
    if (shop) {
      Object.assign(shop, updates, { updated_at: new Date().toISOString() });
      return { ...shop };
    }
    return null;
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

  // SHOP SERVICES MANAGEMENT
  addShopService: async (shopId: string, serviceName: string, price: number, description?: string): Promise<ShopService> => {
    const shop = MOCK_SHOPS.find(s => s.id === shopId);
    const newService: ShopService = {
      id: `srv-${Date.now()}`,
      shop_id: shopId,
      service_name: serviceName,
      price,
      description: description || null,
      is_active: true
    };
    if (shop) {
      if (!shop.services) shop.services = [];
      shop.services.push(newService);
    }
    return newService;
  },

  updateShopService: async (serviceId: string, updates: Partial<ShopService>): Promise<ShopService | null> => {
    for (const shop of MOCK_SHOPS) {
      if (shop.services) {
        const srv = shop.services.find(s => s.id === serviceId);
        if (srv) {
          Object.assign(srv, updates);
          return { ...srv };
        }
      }
    }
    return null;
  },

  deleteShopService: async (serviceId: string): Promise<boolean> => {
    for (const shop of MOCK_SHOPS) {
      if (shop.services) {
        const idx = shop.services.findIndex(s => s.id === serviceId);
        if (idx !== -1) {
          shop.services.splice(idx, 1);
          return true;
        }
      }
    }
    return false;
  },

  // TRANSACTIONAL ORDER MANAGEMENT
  createOrder: async (orderPayload: {
    customer_id: string;
    shop_id: string;
    customer_name: string;
    customer_phone: string;
    delivery_address?: string;
    pickup_requested: boolean;
    delivery_requested: boolean;
    scheduled_date?: string;
    scheduled_time?: string;
    notes?: string;
    payment_method: PaymentMethod;
    items: Array<{ service_id: string; service_name: string; unit_price: number; quantity: number }>;
  }): Promise<Order> => {
    const shop = MOCK_SHOPS.find(s => s.id === orderPayload.shop_id);
    const shopName = shop ? shop.name : 'Ironing Shop';
    const shopAddress = shop ? shop.address || '' : '';
    const shopPhone = shop ? shop.phone || '' : '';

    const items: OrderItem[] = orderPayload.items.map((item, idx) => ({
      id: `oi-${Date.now()}-${idx}`,
      service_id: item.service_id,
      service_name_snapshot: item.service_name,
      unit_price: item.unit_price,
      quantity: item.quantity,
      subtotal: item.unit_price * item.quantity
    }));

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const delivery_fee = orderPayload.pickup_requested || orderPayload.delivery_requested ? 20 : 0;
    const total_amount = subtotal + delivery_fee;

    const commission_rate = MOCK_COMMISSION_RATE;
    const commission_amount = Math.round((total_amount * commission_rate) / 100 * 100) / 100;
    const shop_earnings = Math.round((total_amount - commission_amount) * 100) / 100;

    const newOrderNumber = 1000 + MOCK_ORDERS.length + 1;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: newOrderNumber,
      customer_id: orderPayload.customer_id,
      shop_id: orderPayload.shop_id,
      customer_name: orderPayload.customer_name,
      customer_phone: orderPayload.customer_phone,
      delivery_address: orderPayload.delivery_address || null,
      shop_name: shopName,
      shop_address: shopAddress,
      shop_phone: shopPhone,
      status: 'pending',
      subtotal,
      delivery_fee,
      total_amount,
      payment_method: orderPayload.payment_method,
      payment_status: 'pending',
      commission_rate,
      commission_amount,
      shop_earnings,
      pickup_requested: orderPayload.pickup_requested,
      delivery_requested: orderPayload.delivery_requested,
      scheduled_date: orderPayload.scheduled_date || null,
      scheduled_time: orderPayload.scheduled_time || null,
      notes: orderPayload.notes || null,
      created_at: new Date().toISOString(),
      items
    };

    MOCK_ORDERS.unshift(newOrder);

    // Notify Shop Owner
    if (shop) {
      MOCK_NOTIFICATIONS.unshift({
        id: `notif-${Date.now()}`,
        user_id: shop.owner_id,
        title: 'New Order Received! 👔',
        message: `Order #${newOrderNumber} received from ${newOrder.customer_name} for ₹${total_amount}.`,
        type: 'order_update',
        order_id: newOrder.id,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    return newOrder;
  },

  getOrderById: async (orderId: string): Promise<Order | null> => {
    const order = MOCK_ORDERS.find(o => o.id === orderId);
    return order ? { ...order } : null;
  },

  getCustomerOrders: async (customerId: string): Promise<Order[]> => {
    return MOCK_ORDERS.filter(o => o.customer_id === customerId);
  },

  getShopOrders: async (shopId: string): Promise<Order[]> => {
    return MOCK_ORDERS.filter(o => o.shop_id === shopId);
  },

  getAllOrdersAdmin: async (): Promise<Order[]> => {
    return [...MOCK_ORDERS];
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<Order | null> => {
    const order = MOCK_ORDERS.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updated_at = new Date().toISOString();

      // If completed and payment is pending, default mark as paid_to_shop if payment_method is cash/upi/pay_to_shop
      if (status === 'completed' && order.payment_status === 'pending') {
        order.payment_status = 'paid_to_shop';
        order.paid_at = new Date().toISOString();
      }

      // Add Notification to Customer
      MOCK_NOTIFICATIONS.unshift({
        id: `notif-${Date.now()}`,
        user_id: order.customer_id,
        title: `Order Status: ${status.toUpperCase()}`,
        message: `Your Order #${order.order_number} status is now ${status.replace('_', ' ')}.`,
        type: 'order_update',
        order_id: order.id,
        is_read: false,
        created_at: new Date().toISOString()
      });

      return { ...order };
    }
    return null;
  },

  updateOrderPaymentStatus: async (orderId: string, payment_status: PaymentStatus): Promise<Order | null> => {
    const order = MOCK_ORDERS.find(o => o.id === orderId);
    if (order) {
      order.payment_status = payment_status;
      if (payment_status === 'paid_to_shop') {
        order.paid_at = new Date().toISOString();
      }
      order.updated_at = new Date().toISOString();
      return { ...order };
    }
    return null;
  },

  // FINANCIAL & COMMISSION CALCULATIONS
  getShopEarningsAndCommission: async (shopId: string) => {
    const shopOrders = MOCK_ORDERS.filter(o => o.shop_id === shopId && o.status === 'completed');
    const grossSales = shopOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const totalCommission = shopOrders.reduce((sum, o) => sum + o.commission_amount, 0);
    const netEarnings = shopOrders.reduce((sum, o) => sum + o.shop_earnings, 0);

    const settlements = MOCK_SETTLEMENTS.filter(s => s.shop_id === shopId);
    const settledAmount = settlements.filter(s => s.status === 'settled').reduce((sum, s) => sum + s.amount, 0);
    const pendingSettlement = Math.max(0, totalCommission - settledAmount);

    return {
      grossSales,
      totalCommission,
      netEarnings,
      settledAmount,
      pendingSettlement,
      completedOrdersCount: shopOrders.length
    };
  },

  getAdminMetricsAndCommissions: async () => {
    const allCompletedOrders = MOCK_ORDERS.filter(o => o.status === 'completed');
    const totalGmv = allCompletedOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const totalPlatformCommission = allCompletedOrders.reduce((sum, o) => sum + o.commission_amount, 0);
    
    const settledCommission = MOCK_SETTLEMENTS
      .filter(s => s.status === 'settled')
      .reduce((sum, s) => sum + s.amount, 0);
    
    const pendingCommission = Math.max(0, totalPlatformCommission - settledCommission);

    return {
      totalCustomers: MOCK_PROFILES.filter(p => p.role === 'customer').length,
      totalShops: MOCK_SHOPS.length,
      totalOrders: MOCK_ORDERS.length,
      completedOrders: allCompletedOrders.length,
      totalGmv,
      totalPlatformCommission,
      settledCommission,
      pendingCommission,
      defaultCommissionRate: MOCK_COMMISSION_RATE,
      settlements: [...MOCK_SETTLEMENTS]
    };
  },

  settleShopCommission: async (shopId: string, amount: number, reference: string, adminId: string): Promise<CommissionSettlement> => {
    const shop = MOCK_SHOPS.find(s => s.id === shopId);
    const settlement: CommissionSettlement = {
      id: `stl-${Date.now()}`,
      shop_id: shopId,
      shop_name: shop ? shop.name : 'Partner Shop',
      amount,
      status: 'settled',
      settled_at: new Date().toISOString(),
      settlement_reference: reference || `SETTLE-${Date.now()}`,
      settled_by: adminId,
      created_at: new Date().toISOString()
    };

    MOCK_SETTLEMENTS.unshift(settlement);
    return settlement;
  },

  updateDefaultCommissionRate: async (rate: number): Promise<number> => {
    MOCK_COMMISSION_RATE = rate;
    return MOCK_COMMISSION_RATE;
  },

  // NOTIFICATIONS API
  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    return MOCK_NOTIFICATIONS.filter(n => n.user_id === userId);
  },

  markNotificationAsRead: async (notifId: string): Promise<boolean> => {
    const notif = MOCK_NOTIFICATIONS.find(n => n.id === notifId);
    if (notif) {
      notif.is_read = true;
      return true;
    }
    return false;
  },

  // REVIEWS & PROFILES
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
