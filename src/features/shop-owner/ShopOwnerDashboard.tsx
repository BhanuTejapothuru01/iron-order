import React, { useState, useEffect } from 'react';
import { Store, ShoppingBag, DollarSign, Settings, ArrowLeft, Plus } from 'lucide-react';
import type { Shop } from '../../types';
import { useOrders } from '../../hooks/useOrders';
import { ShopOrdersTab } from './ShopOrdersTab';
import { ShopServicesTab } from './ShopServicesTab';
import { ShopProfileTab } from './ShopProfileTab';
import { ShopEarningsTab } from './ShopEarningsTab';
import { mockDatabase, isRealSupabaseConfigured, supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';

interface ShopOwnerDashboardProps {
  ownerId: string;
  onBackToSearch: () => void;
}

export const ShopOwnerDashboard: React.FC<ShopOwnerDashboardProps> = ({ ownerId, onBackToSearch }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'services' | 'profile' | 'earnings'>('overview');
  const [myShops, setMyShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isLoadingShops, setIsLoadingShops] = useState<boolean>(true);

  const fetchShops = async () => {
    setIsLoadingShops(true);
    try {
      if (isRealSupabaseConfigured && supabase) {
        const { data } = await supabase.from('shops').select('*, services:shop_services(*)').eq('owner_id', ownerId);
        setMyShops(data || []);
        if (data && data.length > 0) setSelectedShop(data[0]);
      } else {
        const res = await mockDatabase.getOwnerShops(ownerId);
        setMyShops(res);
        if (res.length > 0) setSelectedShop(res[0]);
      }
    } catch (err) {
      console.error('Failed to load owner shops:', err);
    } finally {
      setIsLoadingShops(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [ownerId]);

  const { orders, isLoading: isLoadingOrders, updateOrderStatus, updatePaymentStatus } = useOrders(
    undefined,
    'owner',
    selectedShop?.id
  );

  if (isLoadingShops) {
    return <div className="text-center py-16 text-xs text-slate-400">Loading your shop dashboard...</div>;
  }

  if (myShops.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          <Store className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">No Ironing Shop Registered Yet</h2>
        <p className="text-xs text-slate-500">Register your ironing or steam press shop to start receiving local customer orders.</p>
        <Button onClick={onBackToSearch} className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs">
          Go to Registration
        </Button>
      </div>
    );
  }

  const activeShop = selectedShop || myShops[0];

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const processingCount = orders.filter(o => ['accepted', 'processing', 'ready'].includes(o.status)).length;
  const completedCount = orders.filter(o => o.status === 'completed').length;
  const todayRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSearch}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Partner Shop Dashboard</span>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                Active Partner
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{activeShop.name}</h1>
          </div>
        </div>

        {/* Shop Selector Dropdown if multiple */}
        {myShops.length > 1 && (
          <select
            value={activeShop.id}
            onChange={(e) => {
              const s = myShops.find(sh => sh.id === e.target.value);
              if (s) setSelectedShop(s);
            }}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-white border border-slate-200"
          >
            {myShops.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs font-extrabold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'overview' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-xs font-extrabold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'orders' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders ({orders.length})</span>
          {pendingCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 text-xs font-extrabold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'services' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Services & Rates</span>
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`pb-3 text-xs font-extrabold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'earnings' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Earnings & Commission</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-xs font-extrabold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'profile' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Shop Settings</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-bold text-amber-600">Pending Orders</div>
              <div className="text-2xl font-black text-slate-900">{pendingCount}</div>
              <div className="text-[10px] text-slate-400">Needs your acceptance</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-bold text-blue-600">In Ironing</div>
              <div className="text-2xl font-black text-slate-900">{processingCount}</div>
              <div className="text-[10px] text-slate-400">Active steam press workflow</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-bold text-emerald-600">Completed</div>
              <div className="text-2xl font-black text-slate-900">{completedCount}</div>
              <div className="text-[10px] text-slate-400">Delivered orders</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-bold text-brand-600">Total Revenue</div>
              <div className="text-2xl font-black text-brand-600">₹{todayRevenue}</div>
              <div className="text-[10px] text-slate-400">Gross completed sales</div>
            </div>
          </div>

          {/* Recent Orders Preview */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">Recent Customer Orders</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-brand-600 hover:underline"
              >
                View All Orders →
              </button>
            </div>

            <ShopOrdersTab
              orders={orders.slice(0, 3)}
              isLoading={isLoadingOrders}
              onUpdateStatus={updateOrderStatus}
              onUpdatePayment={updatePaymentStatus}
            />
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <ShopOrdersTab
          orders={orders}
          isLoading={isLoadingOrders}
          onUpdateStatus={updateOrderStatus}
          onUpdatePayment={updatePaymentStatus}
        />
      )}

      {activeTab === 'services' && (
        <ShopServicesTab shop={activeShop} onRefresh={fetchShops} />
      )}

      {activeTab === 'earnings' && (
        <ShopEarningsTab shop={activeShop} />
      )}

      {activeTab === 'profile' && (
        <ShopProfileTab shop={activeShop} onRefresh={fetchShops} />
      )}
    </div>
  );
};
