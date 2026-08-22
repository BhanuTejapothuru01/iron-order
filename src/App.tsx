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
import { searchLocations } from './lib/geocodingService';

export function App() {
  const { location, isLocating, isGpsActive, requestBrowserLocation, setManualLocation } = useGeolocation();
  const { shops, isLoading, refetch } = useNearbyShops(location.latitude, location.longitude, 20);
  const { user, role, logout } = useAuth();

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistanceBand, setSelectedDistanceBand] = useState<DistanceBand | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'partner' | 'osm'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'ironing' | 'steam_press' | 'dhobi_ghat' | 'dry_clean' | 'laundry'>('all');
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

  // City & Area Selector State
  const [activeCity, setActiveCity] = useState<string>('Bengaluru');
  const [citySearchInput, setCitySearchInput] = useState<string>('');
  const [citySearchResults, setCitySearchResults] = useState<Array<{ name: string; displayName: string; lat: number; lng: number }>>([]);
  const [isSearchingCity, setIsSearchingCity] = useState<boolean>(false);

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
                { id: 'all', label: 'All Distances' },
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

            {/* Shop Source Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
                <Store className="w-3.5 h-3.5" /> Source:
              </span>
              {[
                { id: 'all', label: 'All Shops' },
                { id: 'partner', label: 'Verified Partners' },
                { id: 'osm', label: 'OSM Real Shops' },
              ].map((srcTab) => (
                <button
                  key={srcTab.id}
                  onClick={() => setSourceFilter(srcTab.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    sourceFilter === srcTab.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {srcTab.label}
                </button>
              ))}
            </div>

            {/* Shop Type / Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
                <Shirt className="w-3.5 h-3.5" /> Service:
              </span>
              {[
                { id: 'all', label: 'All Types' },
                { id: 'steam_press', label: '♨️ Steam Press' },
                { id: 'ironing', label: '👔 Ironing' },
                { id: 'dhobi_ghat', label: '🏛️ Dhobi Ghat' },
                { id: 'dry_clean', label: '✨ Dry Clean' },
                { id: 'laundry', label: '🧺 Laundry' },
              ].map((typeTab) => (
                <button
                  key={typeTab.id}
                  onClick={() => setTypeFilter(typeTab.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    typeFilter === typeTab.id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {typeTab.label}
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
