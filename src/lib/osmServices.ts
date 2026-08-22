import type { Shop, ShopService } from '../types';
import { calculateHaversineDistance } from './supabase';

const SAMPLE_LAUNDRY_PHOTOS = [
  'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&q=80&w=800',
];

function generateDefaultServices(shopId: string, minPrice: number, shopType: string): ShopService[] {
  if (shopType === 'dhobi_ghat') {
    return [
      { id: `${shopId}-s1`, shop_id: shopId, service_name: 'Traditional Shirt Ironing', price: minPrice },
      { id: `${shopId}-s2`, shop_id: shopId, service_name: 'Pant / Trouser Ironing', price: minPrice + 3 },
      { id: `${shopId}-s3`, shop_id: shopId, service_name: 'Bedsheet / Linen Ironing', price: minPrice + 15 },
      { id: `${shopId}-s4`, shop_id: shopId, service_name: 'Bulk Wash & Iron (Per Kg)', price: minPrice + 25 },
    ];
  }

  if (shopType === 'steam_press' || shopType === 'ironing') {
    return [
      { id: `${shopId}-s1`, shop_id: shopId, service_name: 'Shirt / T-Shirt Crisp Steam Press', price: minPrice },
      { id: `${shopId}-s2`, shop_id: shopId, service_name: 'Trouser / Jeans Steam Press', price: minPrice + 5 },
      { id: `${shopId}-s3`, shop_id: shopId, service_name: 'Formal Suit (2-Piece) Steam', price: minPrice + 75 },
      { id: `${shopId}-s4`, shop_id: shopId, service_name: 'Silk / Designer Saree Steam', price: minPrice + 45 },
    ];
  }

  return [
    { id: `${shopId}-s1`, shop_id: shopId, service_name: 'Shirt / T-Shirt Press', price: minPrice },
    { id: `${shopId}-s2`, shop_id: shopId, service_name: 'Trouser / Jeans Press', price: minPrice + 5 },
    { id: `${shopId}-s3`, shop_id: shopId, service_name: 'Wash & Fold / Kg', price: minPrice + 25 },
    { id: `${shopId}-s4`, shop_id: shopId, service_name: 'Suit (2-Piece) Dry Clean', price: minPrice + 125 },
    { id: `${shopId}-s5`, shop_id: shopId, service_name: 'Silk Saree Delicate Steam', price: minPrice + 55 },
  ];
}

/**
 * Fetches real laundry, steam press, ironing shops, and dhobi ghats from OpenStreetMap via Nominatim
 */
export async function fetchRealLaundryShopsFromOSM(
  userLat: number,
  userLng: number,
  radiusKm = 15
): Promise<Shop[]> {
  try {
    // Define bounding box around user location (~0.15 deg is approx 15km)
    const bboxDelta = radiusKm * 0.01;
    const minLng = (userLng - bboxDelta).toFixed(4);
    const maxLng = (userLng + bboxDelta).toFixed(4);
    const minLat = (userLat - bboxDelta).toFixed(4);
    const maxLat = (userLat + bboxDelta).toFixed(4);

    // Specific search queries including ironing, steam press, dhobi, and laundry
    const queries = ['ironing', 'steam press', 'dhobi', 'dhobi ghat', 'laundry', 'dry cleaning'];
    const fetchPromises = queries.map(q => {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=30&viewbox=${minLng},${maxLat},${maxLng},${minLat}&bounded=0`;
      return fetch(url, {
        headers: {
          'User-Agent': 'IronApp/1.0 (contact@ironapp.local)',
          'Accept-Language': 'en',
        },
      })
        .then(res => (res.ok ? res.json() : []))
        .catch(() => []);
    });

    const resultsArray = await Promise.all(fetchPromises);
    const rawElements = resultsArray.flat();

    // Deduplicate elements by osm_id or place_id
    const seenIds = new Set<string>();
    const osmShops: Shop[] = [];

    for (let index = 0; index < rawElements.length; index++) {
      const item = rawElements[index];
      const uniqueId = `osm-${item.place_id || item.osm_id || index}`;

      if (seenIds.has(uniqueId)) continue;
      seenIds.add(uniqueId);

      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);

      if (isNaN(lat) || isNaN(lon)) continue;

      const distance_km = calculateHaversineDistance(userLat, userLng, lat, lon);
      if (distance_km > radiusKm * 1.5) continue; // skip shops far outside target radius

      // Extract best available name
      let rawName = (item.name || item.address?.shop || item.address?.amenity || '').toLowerCase();
      let name = item.name || item.address?.shop || item.address?.amenity;
      
      let shop_type: 'ironing' | 'steam_press' | 'laundry' | 'dry_clean' | 'dhobi_ghat' = 'ironing';
      if (rawName.includes('dhobi')) {
        shop_type = 'dhobi_ghat';
        if (!name) name = 'Traditional Dhobi Ghat';
      } else if (rawName.includes('dry') || rawName.includes('clean')) {
        shop_type = 'dry_clean';
        if (!name) name = 'Dry Cleaning & Steam Care';
      } else if (rawName.includes('steam') || rawName.includes('press')) {
        shop_type = 'steam_press';
        if (!name) name = 'Express Steam Pressing';
      } else if (rawName.includes('laundry')) {
        shop_type = 'laundry';
        if (!name) name = 'Neighborhood Iron & Wash';
      } else {
        const road = item.address?.road || item.address?.suburb || 'Local Area';
        name = `Steam Ironing & Press (${road})`;
      }

      // Generate realistic price and stats based on hash of ID
      const numericHash = uniqueId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const min_price = shop_type === 'dhobi_ghat' ? 10 : 12 + (numericHash % 8); // ₹10 to ₹19
      const avg_rating = Math.round((4.0 + ((numericHash % 10) / 10)) * 10) / 10; // 4.0 to 4.9
      const review_count = 12 + (numericHash % 48);

      const photoUrl = SAMPLE_LAUNDRY_PHOTOS[numericHash % SAMPLE_LAUNDRY_PHOTOS.length];

      const shop: Shop = {
        id: uniqueId,
        owner_id: `osm-owner-${numericHash}`,
        name,
        description: `Discovered via OpenStreetMap. Professional local ${shop_type.replace('_', ' ')} and fabric care in ${item.address?.suburb || item.address?.city || 'your neighborhood'}.`,
        latitude: lat,
        longitude: lon,
        address: item.display_name,
        phone: item.address?.phone || `+91 98${(10000 + (numericHash * 137) % 89999)}`,
        whatsapp: `+9198${(10000 + (numericHash * 137) % 89999)}`,
        status: 'approved',
        pickup_available: numericHash % 2 === 0,
        delivery_available: numericHash % 3 !== 0,
        avg_rating,
        review_count,
        distance_km,
        min_price,
        is_osm: true,
        source: 'osm',
        shop_type,
        photos: [{ id: `photo-${uniqueId}`, shop_id: uniqueId, storage_path: photoUrl, sort_order: 0 }],
        services: generateDefaultServices(uniqueId, min_price, shop_type),
        hours: [
          { day_of_week: 0, open_time: '09:00', close_time: '19:00', is_closed: false },
          { day_of_week: 1, open_time: '08:00', close_time: '20:30', is_closed: false },
          { day_of_week: 2, open_time: '08:00', close_time: '20:30', is_closed: false },
          { day_of_week: 3, open_time: '08:00', close_time: '20:30', is_closed: false },
          { day_of_week: 4, open_time: '08:00', close_time: '20:30', is_closed: false },
          { day_of_week: 5, open_time: '08:00', close_time: '20:30', is_closed: false },
          { day_of_week: 6, open_time: '08:00', close_time: '20:30', is_closed: false },
        ],
      };

      osmShops.push(shop);
    }

    return osmShops;
  } catch (err) {
    console.warn('Failed to fetch real laundry & ironing shops from OSM:', err);
    return [];
  }
}
