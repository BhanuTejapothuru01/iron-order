import { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  Filter,
  Navigation,
  Map as MapIcon,
  List as ListIcon,
  Shirt,
  SlidersHorizontal,
  ChevronDown,
  LogOut,
  Plus,
  ShoppingBag,
  Bell,
  Grid,
  Store,
  ShieldCheck
} from 'lucide-react';
import type { Shop, DistanceBand, Order } from './types';
import { useGeolocation } from './hooks/useGeolocation';
import { useNearbyShops } from './hooks/useNearbyShops';
import { useAuth } from './features/auth/AuthContext';
import { useCart } from './hooks/useCart';
import { useOrders } from './hooks/useOrders';
import { useNotifications } from './hooks/useNotifications';

import { MapView } from './components/map/MapView';
import { ShopCard } from './components/shop/ShopCard';
import { ShopDetailModal } from './components/shop/ShopDetailModal';
import { AuthModal } from './features/auth/AuthModal';
import { ShopRegistrationModal } from './components/shop/ShopRegistrationModal';
import { CheckoutModal } from './features/orders/CheckoutModal';
import { OrderConfirmationModal } from './features/orders/OrderConfirmationModal';
import { OrderTrackingModal } from './features/orders/OrderTrackingModal';
import { CustomerOrdersView } from './features/orders/CustomerOrdersView';
import { ShopOwnerDashboard } from './features/shop-owner/ShopOwnerDashboard';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { AdminLoginModal } from './features/admin/AdminLoginModal';
import { ReviewModal } from './features/orders/ReviewModal';
import { PortalSelectorModal } from './components/portal/PortalSelectorModal';

import { Button } from './components/ui/Button';
import { searchLocations } from './lib/geocodingService';

export function App() {
  const { location, isLocating, isGpsActive, requestBrowserLocation, setManualLocation } = useGeolocation();
  const { shops, isLoading, refetch } = useNearbyShops(location.latitude, location.longitude, 20);
  const { user, login, logout, switchRole } = useAuth();

  // Marketplace Hooks
  const cart = useCart();
  const { orders: customerOrders, isLoading: isLoadingOrders, placeOrder, updatePaymentStatus: updateOrderPaymentStatus } = useOrders(
    user?.id || 'usr-customer-1',
    'customer'
  );
  const { notifications, unreadCount, markAsRead } = useNotifications(user?.id || 'usr-customer-1');

  // Dedicated Portal & View State
  const [portalMode, setPortalMode] = useState<'customer' | 'shop' | 'admin'>('customer');
  const [activeView, setActiveView] = useState<'search' | 'my_orders' | 'shop_dashboard' | 'admin_dashboard'>('search');
  const [isPortalSelectorOpen, setIsPortalSelectorOpen] = useState<boolean>(false);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistanceBand] = useState<DistanceBand | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'partner' | 'osm'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'ironing' | 'steam_press' | 'dhobi_ghat' | 'dry_clean' | 'laundry'>('all');
  const [pickupOnly] = useState<boolean>(false);
  const [deliveryOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price'>('distance');
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');

  // Address search box dropdown state
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState<boolean>(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState<boolean>(false);

  // Modal States
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState<boolean>(false);

  // Order Flow Modals State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState<boolean>(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState<boolean>(false);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);

  // City & Area Selector State
  const [activeCity, setActiveCity] = useState<string>('Bengaluru');
  const [citySearchInput, setCitySearchInput] = useState<string>('');
  const [citySearchResults, setCitySearchResults] = useState<Array<{ name: string; displayName: string; lat: number; lng: number }>>([]);
  const [isSearchingCity, setIsSearchingCity] = useState<boolean>(false);

  // Admin Auth Gate State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);

  // Switch Portal Handler
  const handleSelectPortal = (targetPortal: 'customer' | 'shop' | 'admin') => {
    if (targetPortal === 'admin' && !isAdminAuthenticated && user?.email !== 'tejapothuru94413@gmail.com') {
      setIsAdminLoginOpen(true);
      return;
    }

    setPortalMode(targetPortal);
    if (targetPortal === 'customer') {
      switchRole('customer');
      setActiveView('search');
    } else if (targetPortal === 'shop') {
      switchRole('owner');
      setActiveView('shop_dashboard');
    } else if (targetPortal === 'admin') {
      switchRole('admin');
      setActiveView('admin_dashboard');
    }
  };

  const handleAdminLoginSuccess = async () => {
    setIsAdminAuthenticated(true);
    setIsAdminLoginOpen(false);
    await login('tejapothuru94413@gmail.com', 'Teja@602142');
    setPortalMode('admin');
    switchRole('admin');
    setActiveView('admin_dashboard');
  };

  // Quick Location Presets Grouped by Major Cities & Areas
  const PRESET_CITIES = [
    {
      city: 'Bengaluru',
      icon: '🏛️',
      areas: [
        { name: 'MG Road', fullName: 'MG Road, Bangalore', lat: 12.9738, lng: 77.5975 },
        { name: 'Indiranagar', fullName: 'Indiranagar, Bangalore', lat: 12.9784, lng: 77.6408 },
        { name: 'Koramangala', fullName: 'Koramangala, Bangalore', lat: 12.9352, lng: 77.6245 },
        { name: 'Whitefield', fullName: 'Whitefield, Bangalore', lat: 12.9698, lng: 77.7499 },
        { name: 'HSR Layout', fullName: 'HSR Layout, Bangalore', lat: 12.9121, lng: 77.6445 },
        { name: 'Jayanagar', fullName: 'Jayanagar, Bangalore', lat: 12.9298, lng: 77.5826 },
        { name: 'Malleshwaram', fullName: 'Malleshwaram, Bangalore', lat: 12.9984, lng: 77.5704 },
      ],
    },
    {
      city: 'Mumbai',
      icon: '🌊',
      areas: [
        { name: 'Dadar Dhobi Ghat', fullName: 'Dadar Dhobi Ghat, Mumbai', lat: 19.0178, lng: 72.8478 },
        { name: 'Bandra West', fullName: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
        { name: 'Andheri West', fullName: 'Andheri West, Mumbai', lat: 19.1363, lng: 72.8277 },
        { name: 'Lower Parel', fullName: 'Lower Parel, Mumbai', lat: 18.9950, lng: 72.8300 },
        { name: 'Juhu', fullName: 'Juhu, Mumbai', lat: 19.1075, lng: 72.8263 },
        { name: 'Powai', fullName: 'Powai, Mumbai', lat: 19.1176, lng: 72.9060 },
      ],
    },
    {
      city: 'Delhi NCR',
      icon: '🕌',
      areas: [
        { name: 'Connaught Place', fullName: 'Connaught Place, New Delhi', lat: 28.6315, lng: 77.2167 },
        { name: 'Gurgaon Sec 29', fullName: 'Gurgaon Sec 29, NCR', lat: 28.4682, lng: 77.0637 },
        { name: 'Noida Sec 18', fullName: 'Noida Sec 18, NCR', lat: 28.5708, lng: 77.3261 },
        { name: 'South Extension', fullName: 'South Extension, New Delhi', lat: 28.5684, lng: 77.2205 },
        { name: 'Dwarka', fullName: 'Dwarka, New Delhi', lat: 28.5921, lng: 77.0460 },
      ],
    },
    {
      city: 'Hyderabad',
      icon: '🏰',
      areas: [
        { name: 'Banjara Hills', fullName: 'Banjara Hills, Hyderabad', lat: 17.4156, lng: 78.4347 },
        { name: 'HITECH City', fullName: 'HITECH City, Hyderabad', lat: 17.4435, lng: 78.3772 },
        { name: 'Gachibowli', fullName: 'Gachibowli, Hyderabad', lat: 17.4401, lng: 78.3489 },
        { name: 'Jubilee Hills', fullName: 'Jubilee Hills, Hyderabad', lat: 17.4319, lng: 78.4071 },
      ],
    },
    {
      city: 'Chennai',
      icon: '🛕',
      areas: [
        { name: 'T. Nagar', fullName: 'T. Nagar, Chennai', lat: 13.0418, lng: 80.2341 },
        { name: 'Adyar', fullName: 'Adyar, Chennai', lat: 13.0012, lng: 80.2565 },
        { name: 'Anna Nagar', fullName: 'Anna Nagar, Chennai', lat: 13.0850, lng: 80.2101 },
        { name: 'Nungambakkam', fullName: 'Nungambakkam, Chennai', lat: 13.0624, lng: 80.2405 },
      ],
    },
    {
      city: 'Pune',
      icon: '⛰️',
      areas: [
        { name: 'Koregaon Park', fullName: 'Koregaon Park, Pune', lat: 18.5362, lng: 73.8940 },
        { name: 'Kothrud', fullName: 'Kothrud, Pune', lat: 18.5074, lng: 73.8077 },
        { name: 'Viman Nagar', fullName: 'Viman Nagar, Pune', lat: 18.5679, lng: 73.9143 },
        { name: 'Baner', fullName: 'Baner, Pune', lat: 18.5590, lng: 73.7868 },
      ],
    },
    {
      city: 'Kolkata',
      icon: '🌉',
      areas: [
        { name: 'Park Street', fullName: 'Park Street, Kolkata', lat: 22.5539, lng: 88.3524 },
        { name: 'Salt Lake', fullName: 'Salt Lake, Kolkata', lat: 22.5867, lng: 88.4171 },
        { name: 'New Town', fullName: 'New Town, Kolkata', lat: 22.5833, lng: 88.4667 },
      ],
    },
    {
      city: 'Ahmedabad',
      icon: '🪁',
      areas: [
        { name: 'CG Road', fullName: 'CG Road, Ahmedabad', lat: 23.0258, lng: 72.5583 },
        { name: 'Bodakdev', fullName: 'Bodakdev, Ahmedabad', lat: 23.0384, lng: 72.5119 },
      ],
    },
    {
      city: 'Jaipur',
      icon: '👑',
      areas: [
        { name: 'C-Scheme', fullName: 'C-Scheme, Jaipur', lat: 26.9116, lng: 75.8005 },
        { name: 'Malviya Nagar', fullName: 'Malviya Nagar, Jaipur', lat: 26.8549, lng: 75.8243 },
      ],
    },
  ];

  // Filter & Sort Logic
  const filteredShops = useMemo(() => {
    return shops.filter((shop: Shop) => {
      // Text Search matching
      const matchesSearch =
        searchQuery.trim() === '' ||
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.services?.some((s) => s.service_name.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Distance band filter
      const distance = shop.distance_km || 0;
      if (selectedDistanceBand === 'walking' && distance >= 1.0) return false;
      if (selectedDistanceBand === 'nearby' && (distance < 1.0 || distance > 5.0)) return false;
      if (selectedDistanceBand === 'extended' && distance <= 5.0) return false;

      // Source filter
      if (sourceFilter === 'partner' && shop.is_osm) return false;
      if (sourceFilter === 'osm' && !shop.is_osm) return false;

      // Shop category filter
      if (typeFilter !== 'all') {
        const sType = shop.shop_type || 'ironing';
        if (typeFilter === 'steam_press' && sType !== 'steam_press') return false;
        if (typeFilter === 'ironing' && sType !== 'ironing' && sType !== 'steam_press') return false;
        if (typeFilter === 'dhobi_ghat' && sType !== 'dhobi_ghat') return false;
        if (typeFilter === 'dry_clean' && sType !== 'dry_clean') return false;
        if (typeFilter === 'laundry' && sType !== 'laundry') return false;
      }

      // Capability filters
      if (pickupOnly && !shop.pickup_available) return false;
      if (deliveryOnly && !shop.delivery_available) return false;

      return true;
    }).sort((a: Shop, b: Shop) => {
      if (sortBy === 'distance') return (a.distance_km || 0) - (b.distance_km || 0);
      if (sortBy === 'rating') return b.avg_rating - a.avg_rating;
      if (sortBy === 'price') return (a.min_price || 0) - (b.min_price || 0);
      return 0;
    });
  }, [shops, searchQuery, selectedDistanceBand, sourceFilter, typeFilter, pickupOnly, deliveryOnly, sortBy]);

  const handleSelectShop = (shop: Shop) => {
    setSelectedShop(shop);
    setIsDetailModalOpen(true);
  };

  const handlePlaceOrderSubmit = async (orderData: {
    customer_name: string;
    customer_phone: string;
    delivery_address: string;
    pickup_requested: boolean;
    delivery_requested: boolean;
    scheduled_date: string;
    scheduled_time: string;
    notes: string;
    payment_method: any;
  }) => {
    if (!cart.activeShop || cart.items.length === 0) return;

    const created = await placeOrder({
      customer_id: user?.id || 'usr-customer-1',
      shop_id: cart.activeShop.id,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      delivery_address: orderData.delivery_address,
      pickup_requested: orderData.pickup_requested,
      delivery_requested: orderData.delivery_requested,
      scheduled_date: orderData.scheduled_date,
      scheduled_time: orderData.scheduled_time,
      notes: orderData.notes,
      payment_method: orderData.payment_method,
      items: cart.items.map(item => ({
        service_id: item.service.id,
        service_name: item.service.service_name,
        unit_price: item.service.price,
        quantity: item.quantity
      }))
    });

    cart.clearCart();
    setIsCheckoutOpen(false);
    setPlacedOrder(created);
    setIsConfirmationOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navbar Header tailored for Active Portal Mode */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo & Portal Identity */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => handleSelectPortal('customer')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Shirt className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-brand-950 to-brand-700 bg-clip-text text-transparent">
                  Iron Order
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md border ${
                  portalMode === 'customer'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : portalMode === 'shop'
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-purple-50 text-purple-800 border-purple-200'
                }`}>
                  {portalMode === 'customer' ? 'Customer Portal' : portalMode === 'shop' ? 'Shop Partner Portal' : 'Admin Console'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {portalMode === 'customer'
                  ? 'Local Steam Ironing & Laundromat Marketplace'
                  : portalMode === 'shop'
                  ? 'Partner Shop Order Fulfillment Hub'
                  : 'Platform Master Control & Settlement Plane'}
              </p>
            </div>
          </div>

          {/* Navigation Links based on Portal Mode */}
          {portalMode === 'customer' && (
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setActiveView('search')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeView === 'search' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🔍 Find Shops
              </button>
              <button
                onClick={() => setActiveView('my_orders')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  activeView === 'my_orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>📦 My Orders</span>
                {customerOrders.length > 0 && (
                  <span className="bg-brand-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {customerOrders.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {portalMode === 'shop' && (
            <div className="hidden lg:flex items-center gap-2 text-xs font-extrabold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
              <Store className="w-4 h-4 text-blue-600" />
              <span>Partner Shop Owner Portal Active</span>
            </div>
          )}

          {portalMode === 'admin' && (
            <div className="hidden lg:flex items-center gap-2 text-xs font-extrabold text-purple-800 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Platform Administration Console Active</span>
            </div>
          )}

          {/* Location Selector Bar (Only in Customer Portal Search View) */}
          {portalMode === 'customer' && activeView === 'search' && (
            <div className="relative flex-1 max-w-md hidden md:block">
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                  onClick={requestBrowserLocation}
                  disabled={isLocating}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                    isGpsActive
                      ? 'bg-emerald-500 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/50'
                      : 'bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                  title="Auto-search shops near your current GPS location"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isGpsActive ? 'text-white' : 'text-brand-600'} ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Locating...' : isGpsActive ? 'Near Me' : 'GPS'}</span>
                </button>

                <div className="flex-1 flex items-center gap-1.5 text-xs text-slate-700 truncate px-1 font-semibold">
                  <MapPin className={`w-3.5 h-3.5 ${isGpsActive ? 'text-emerald-500 animate-pulse' : 'text-brand-500'} flex-shrink-0`} />
                  <span className="truncate">{location.addressName || 'Bangalore Center'}</span>
                  {isGpsActive && (
                    <span className="text-[9px] uppercase font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md flex-shrink-0">
                      GPS
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setIsAddressDropdownOpen(!isAddressDropdownOpen)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Location Dropdown Menu */}
              {isAddressDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-40 space-y-3 max-h-[80vh] overflow-y-auto w-full md:w-[420px]">
                  {/* Step 1: Select City */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                      <span>1. Select City</span>
                      <span className="text-brand-600 font-extrabold">{activeCity}</span>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                      {PRESET_CITIES.map((cGroup) => (
                        <button
                          key={cGroup.city}
                          onClick={() => setActiveCity(cGroup.city)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                            activeCity === cGroup.city
                              ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25 scale-105'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span>{cGroup.icon}</span>
                          <span>{cGroup.city}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Select Area in Active City */}
                  <div className="border-t border-slate-100 pt-2.5 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                      2. Select Area in {activeCity}
                    </div>

                    {/* Areas Grid for Selected City */}
                    {(() => {
                      const currentCityData = PRESET_CITIES.find(c => c.city === activeCity) || PRESET_CITIES[0];
                      return (
                        <div className="grid grid-cols-2 gap-1.5">
                          {currentCityData.areas.map((area) => (
                            <button
                              key={area.name}
                              onClick={() => {
                                setManualLocation(area.lat, area.lng, `${activeCity} - ${area.name}`);
                                setIsAddressDropdownOpen(false);
                              }}
                              className="text-left p-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-brand-50 text-slate-800 hover:text-brand-700 border border-slate-200/80 transition-all flex items-center justify-between group"
                            >
                              <span className="truncate">{area.name}</span>
                              <MapPin className="w-3 h-3 text-slate-400 group-hover:text-brand-500 flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Custom City or Address Search Box */}
                  <div className="border-t border-slate-100 pt-2.5 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                      Or Search Any Custom Address
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={`Type locality in ${activeCity} or anywhere...`}
                        value={citySearchInput}
                        onChange={async (e) => {
                          const val = e.target.value;
                          setCitySearchInput(val);
                          if (val.trim().length >= 2) {
                            setIsSearchingCity(true);
                            const res = await searchLocations(`${val} ${activeCity}`);
                            setCitySearchResults(res);
                            setIsSearchingCity(false);
                          } else {
                            setCitySearchResults([]);
                          }
                        }}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                      />
                      {isSearchingCity && (
                        <div className="absolute right-2.5 top-2.5 text-xs text-brand-600 font-bold animate-pulse">
                          Searching...
                        </div>
                      )}
                    </div>

                    {/* Live Custom Search Results */}
                    {citySearchResults.length > 0 && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-1 max-h-36 overflow-y-auto space-y-1 shadow-inner">
                        {citySearchResults.map((res, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setManualLocation(res.lat, res.lng, res.displayName.split(',')[0]);
                              setIsAddressDropdownOpen(false);
                              setCitySearchInput('');
                              setCitySearchResults([]);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-start gap-1.5"
                          >
                            <MapPin className="w-3.5 h-3.5 text-brand-500 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{res.displayName}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right Action Controls: Portal Switcher, Cart, Notifications, Auth */}
          <div className="flex items-center gap-2">
            {/* PORTAL SWITCHER GATEWAY BUTTON */}
            <button
              onClick={() => setIsPortalSelectorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md shadow-slate-900/10 transition-all hover:scale-105"
              title="Switch portal experience (Customer, Shop Owner, Admin)"
            >
              <Grid className="w-4 h-4 text-brand-400" />
              <span className="hidden sm:inline">Switch Portal</span>
            </button>

            {/* Cart Button (Customer Portal) */}
            {portalMode === 'customer' && cart.itemCount > 0 && (
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-md shadow-brand-500/25 transition-all hover:scale-105"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>₹{cart.subtotal}</span>
                <span className="bg-white text-brand-700 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {cart.itemCount}
                </span>
              </button>
            )}

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotifDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 space-y-2 max-h-80 overflow-y-auto">
                  <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 pb-2">
                    <span>Notifications</span>
                    <span className="text-[10px] text-brand-600 font-extrabold">{notifications.length} Total</span>
                  </div>
                  {notifications.length > 0 ? (
                    <div className="space-y-1.5">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            n.is_read ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-brand-50/50 border-brand-200 text-slate-900 font-semibold'
                          }`}
                        >
                          <div className="font-bold flex items-center justify-between">
                            <span>{n.title}</span>
                            <span className="text-[9px] text-slate-400 font-normal">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-400">No notifications yet.</div>
                  )}
                </div>
              )}
            </div>

            {/* Auth / Register Partner CTA */}
            {portalMode === 'customer' && (
              <button
                onClick={() => setIsRegistrationModalOpen(true)}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 font-bold text-xs hover:bg-brand-100 transition-colors border border-brand-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Shop</span>
              </button>
            )}

            {user ? (
              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                size="sm"
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main App Body Views Rendered According to Active Portal Mode */}
      {portalMode === 'shop' && (
        <ShopOwnerDashboard
          ownerId={user?.id || 'usr-owner-1'}
          onBackToSearch={() => handleSelectPortal('customer')}
        />
      )}

      {portalMode === 'admin' && (
        <AdminDashboard onBackToSearch={() => handleSelectPortal('customer')} />
      )}

      {portalMode === 'customer' && activeView === 'my_orders' && (
        <CustomerOrdersView
          orders={customerOrders}
          isLoading={isLoadingOrders}
          onTrackOrder={(o) => { setTrackingOrder(o); setIsTrackingOpen(true); }}
          onBackToSearch={() => setActiveView('search')}
        />
      )}

      {portalMode === 'customer' && activeView === 'search' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search shop name, locality, or service (e.g. Steam Press, Saree, Suit)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium shadow-sm"
            />
          </div>

          {/* Filter Bar Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 no-scrollbar">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {[
                { id: 'all', label: 'All Shops', icon: '🏪' },
                { id: 'steam_press', label: 'Steam Press', icon: '♨️' },
                { id: 'ironing', label: 'Ironing', icon: '👔' },
                { id: 'dhobi_ghat', label: 'Dhobi Ghat', icon: '🏛️' },
                { id: 'dry_clean', label: 'Dry Clean', icon: '✨' },
                { id: 'laundry', label: 'Laundromat', icon: '🧺' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setTypeFilter(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                    typeFilter === cat.id
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25 scale-105'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* View Mode & Sort Controls */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('split')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    viewMode === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Split</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <ListIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Map</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="distance">Nearest Distance</option>
                  <option value="rating">Top Rated</option>
                  <option value="price">Lowest Price</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Layout Display (Split / Map / List) */}
          {isLoading ? (
            <div className="text-center py-24 text-slate-400 text-sm">
              Finding real local ironing shops & dhobi ghats near you...
            </div>
          ) : filteredShops.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Shop Cards Column */}
              {(viewMode === 'split' || viewMode === 'list') && (
                <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-4`}>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Found {filteredShops.length} Local Ironing Shops
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredShops.map((shop) => (
                      <ShopCard
                        key={shop.id}
                        shop={shop}
                        onSelect={handleSelectShop}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Right Map View Column */}
              {(viewMode === 'split' || viewMode === 'map') && (
                <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} sticky top-24 h-[600px] rounded-3xl overflow-hidden shadow-md border border-slate-200`}>
                  <MapView
                    userLocation={location}
                    shops={filteredShops}
                    selectedShopId={selectedShop?.id}
                    onSelectShop={handleSelectShop}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Ironing Shops Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching another locality or resetting your filters.
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setSourceFilter('all');
                }}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold"
              >
                Reset Search Filters
              </Button>
            </div>
          )}
        </main>
      )}

      {/* Portal Gateway Selector Modal */}
      <PortalSelectorModal
        isOpen={isPortalSelectorOpen}
        onClose={() => setIsPortalSelectorOpen(false)}
        currentPortal={portalMode}
        onSelectPortal={handleSelectPortal}
      />

      {/* Modals Integration */}
      <ShopDetailModal
        shop={selectedShop}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onAddToCart={(shop, service) => cart.addItem(shop, service)}
        onUpdateQty={(serviceId, qty) => cart.updateQuantity(serviceId, qty)}
        getQty={(serviceId) => cart.getItemQuantity(serviceId)}
        cartSubtotal={cart.subtotal}
        cartItemCount={cart.itemCount}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        shop={cart.activeShop}
        items={cart.items}
        subtotal={cart.subtotal}
        onOrderPlaced={handlePlaceOrderSubmit}
      />

      <OrderConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        order={placedOrder}
        onTrackOrder={(order) => { setTrackingOrder(order); setIsTrackingOpen(true); }}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        order={trackingOrder}
        onPayShop={async (orderId) => {
          await updateOrderPaymentStatus(orderId, 'paid_to_shop');
          if (trackingOrder) {
            setTrackingOrder({ ...trackingOrder, payment_status: 'paid_to_shop' });
          }
        }}
        onOpenReview={(order) => { setReviewOrder(order); setIsReviewOpen(true); }}
      />

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        order={reviewOrder}
        onReviewSubmitted={() => refetch()}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <ShopRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onShopCreated={() => refetch()}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}

export default App;
