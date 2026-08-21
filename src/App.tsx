import { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  Filter,
  Navigation,
  Sparkles,
  Map as MapIcon,
  List as ListIcon,
  Shirt,
  Truck,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  User,
  LogOut,
  Plus,
  Store
} from 'lucide-react';
import type { Shop, DistanceBand } from './types';
import { useGeolocation } from './hooks/useGeolocation';
import { useNearbyShops } from './hooks/useNearbyShops';
import { useAuth } from './features/auth/AuthContext';
import { MapView } from './components/map/MapView';
import { ShopCard } from './components/shop/ShopCard';
import { ShopDetailModal } from './components/shop/ShopDetailModal';
import { AuthModal } from './features/auth/AuthModal';
import { ShopRegistrationModal } from './components/shop/ShopRegistrationModal';
import { Button } from './components/ui/Button';

export function App() {
  const { location, isLocating, requestBrowserLocation, setManualLocation } = useGeolocation();
  const { shops, isLoading, refetch } = useNearbyShops(location.latitude, location.longitude, 20);
  const { user, role, logout } = useAuth();

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistanceBand, setSelectedDistanceBand] = useState<DistanceBand | 'all'>('all');
  const [pickupOnly, setPickupOnly] = useState<boolean>(false);
  const [deliveryOnly, setDeliveryOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price'>('distance');
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');

  // Address search box dropdown state
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState<boolean>(false);

  // Modal States
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState<boolean>(false);

  // Quick Location Presets (Major Local Areas)
  const PRESET_LOCATIONS = [
    { name: 'MG Road, Bangalore', lat: 12.9738, lng: 77.5975 },
    { name: 'Indiranagar, Bangalore', lat: 12.9784, lng: 77.6408 },
    { name: 'Koramangala, Bangalore', lat: 12.9352, lng: 77.6245 },
    { name: 'Whitefield, Bangalore', lat: 12.9698, lng: 77.7499 },
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
  }, [shops, searchQuery, selectedDistanceBand, pickupOnly, deliveryOnly, sortBy]);

  const handleSelectShop = (shop: Shop) => {
    setSelectedShop(shop);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Shirt className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-brand-950 to-brand-700 bg-clip-text text-transparent">
                  Iron
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded-md border border-brand-200">
                  Steam Press
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Crisp Steam Ironing & Laundromat Locator
              </p>
            </div>
          </div>

          {/* Location Selector Bar */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                onClick={requestBrowserLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-800 font-bold text-xs shadow-sm hover:bg-slate-50 transition-colors"
                title="Use current GPS location"
              >
                <Navigation className={`w-3.5 h-3.5 text-brand-600 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locating...' : 'GPS'}</span>
              </button>

              <div className="flex-1 flex items-center gap-1 text-xs text-slate-600 truncate px-1">
                <MapPin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                <span className="truncate font-semibold">{location.addressName || 'Bangalore Center'}</span>
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
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-40 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Select Quick Location
                </div>
                <div className="space-y-1">
                  {PRESET_LOCATIONS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setManualLocation(preset.lat, preset.lng, preset.name);
                        setIsAddressDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-center justify-between"
                    >
                      <span>{preset.name}</span>
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs & Auth Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={requestBrowserLocation}
              className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              title="Locate me"
            >
              <Navigation className="w-4 h-4 text-brand-600" />
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {role === 'owner' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setIsRegistrationModalOpen(true)}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Register Shop
                  </Button>
                )}

                <div className="hidden sm:flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
                    {role === 'owner' ? <Store className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <span className="font-bold text-slate-800 max-w-[100px] truncate">{user.full_name || 'User'}</span>
                  <span className="text-[10px] bg-brand-100 text-brand-800 font-bold px-1.5 py-0.5 rounded-md uppercase">
                    {role}
                  </span>
                </div>

                <button
                  onClick={() => logout()}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => setIsAuthModalOpen(true)}>
                Partner Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* Search & Filter Header Control Panel */}
        <section className="glass-panel p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search ironing shops by name, location, or service (e.g. Saree Press)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* View Mode Switchers */}
            <div className="flex items-center gap-2 self-end lg:self-auto">
              <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center gap-1">
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Split View</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ListIcon className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Chips Bar */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Distance Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Distance:
              </span>
              {[
                { id: 'all', label: 'All Shops' },
                { id: 'walking', label: 'Walking (<1 km)' },
                { id: 'nearby', label: 'Nearby (1-5 km)' },
                { id: 'extended', label: 'Extended (>5 km)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedDistanceBand(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    selectedDistanceBand === tab.id
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Capability Toggles & Sort */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setPickupOnly(!pickupOnly)}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
                  pickupOnly
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-500'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Pickup</span>
              </button>

              <button
                onClick={() => setDeliveryOnly(!deliveryOnly)}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
                  deliveryOnly
                    ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-500'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Delivery</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl font-semibold bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="distance">Sort by Distance</option>
                <option value="rating">Sort by Highest Rating</option>
                <option value="price">Sort by Lowest Price</option>
              </select>
            </div>
          </div>
        </section>

        {/* Content Layout Grid (Map & Shop List) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
          {/* Map Column */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <div className={`${viewMode === 'map' ? 'lg:col-span-12' : 'lg:col-span-6 xl:col-span-7'} h-[450px] lg:h-[650px] sticky top-20`}>
              <MapView
                userLocation={location}
                shops={filteredShops}
                selectedShopId={selectedShop?.id}
                onSelectShop={handleSelectShop}
              />
            </div>
          )}

          {/* Shop List Cards Column */}
          {(viewMode === 'split' || viewMode === 'list') && (
            <div className={`${viewMode === 'list' ? 'lg:col-span-12' : 'lg:col-span-6 xl:col-span-5'} space-y-4`}>
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <span>Ironing Shops Nearby</span>
                  <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">
                    {filteredShops.length}
                  </span>
                </h2>

                <button
                  onClick={() => refetch()}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>

              {/* Loading State Skeleton */}
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-44 rounded-2xl bg-slate-200 animate-pulse" />
                  ))}
                </div>
              ) : filteredShops.length > 0 ? (
                <div className="space-y-4">
                  {filteredShops.map((shop: Shop) => (
                    <ShopCard
                      key={shop.id}
                      shop={shop}
                      onSelect={handleSelectShop}
                    />
                  ))}
                </div>
              ) : (
                /* Empty Results Placeholder */
                <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">No Ironing Shops Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    No shops match your current search query or active filter settings. Try clearing distance or delivery filters.
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDistanceBand('all');
                      setPickupOnly(false);
                      setDeliveryOnly(false);
                    }}
                  >
                    Reset All Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Shop Detail Modal Dialog */}
      <ShopDetailModal
        shop={selectedShop}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onReviewAdded={() => refetch()}
      />

      {/* Partner Login & Sign Up Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="login"
        initialRole="owner"
      />

      {/* Shop Owner Registration Modal */}
      <ShopRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onShopCreated={() => refetch()}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Iron Steam Press Locator. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-600 font-semibold">
            <span>Fast Steam Ironing</span>
            <span>•</span>
            <span>Doorstep Pickup</span>
            <span>•</span>
            <span>Local Vendors</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
