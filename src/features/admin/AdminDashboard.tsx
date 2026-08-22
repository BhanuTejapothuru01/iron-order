import React, { useState, useEffect } from 'react';
import { ShieldCheck, Store, ShoppingBag, DollarSign, Users, ArrowLeft } from 'lucide-react';
import type { Shop } from '../../types';
import { useOrders } from '../../hooks/useOrders';
import { AdminShopsTab } from './AdminShopsTab';
import { AdminOrdersTab } from './AdminOrdersTab';
import { AdminCommissionTab } from './AdminCommissionTab';
import { mockDatabase, isRealSupabaseConfigured, supabase } from '../../lib/supabase';

interface AdminDashboardProps {
  onBackToSearch: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToSearch }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'shops' | 'orders' | 'commissions'>('overview');
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoadingShops, setIsLoadingShops] = useState<boolean>(true);

  const [metrics, setMetrics] = useState<{
    totalCustomers: number;
    totalShops: number;
    totalOrders: number;
    completedOrders: number;
    totalGmv: number;
    totalPlatformCommission: number;
    settledCommission: number;
    pendingCommission: number;
    defaultCommissionRate: number;
    settlements: any[];
  }>({
    totalCustomers: 0,
    totalShops: 0,
    totalOrders: 0,
    completedOrders: 0,
    totalGmv: 0,
    totalPlatformCommission: 0,
    settledCommission: 0,
    pendingCommission: 0,
    defaultCommissionRate: 10,
    settlements: []
  });

  const fetchShops = async () => {
    setIsLoadingShops(true);
    try {
      if (isRealSupabaseConfigured && supabase) {
        const { data } = await supabase.from('shops').select('*').order('created_at', { ascending: false });
        setShops(data || []);
      } else {
        const res = await mockDatabase.getAllShopsAdmin();
        setShops(res);
      }
    } catch (err) {
      console.error('Failed to load admin shops:', err);
    } finally {
      setIsLoadingShops(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      if (isRealSupabaseConfigured && supabase) {
        const { count: custCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer');
        const { count: shopCount } = await supabase.from('shops').select('*', { count: 'exact', head: true });
        const { data: allOrders } = await supabase.from('orders').select('*');

        const completedOrders = (allOrders || []).filter(o => o.status === 'completed');
        const totalGmv = completedOrders.reduce((sum, o) => sum + o.total_amount, 0);
        const totalPlatformCommission = completedOrders.reduce((sum, o) => sum + o.commission_amount, 0);

        const { data: settlements } = await supabase.from('commission_settlements').select('*');
        const settledCommission = (settlements || []).filter(s => s.status === 'settled').reduce((sum, s) => sum + s.amount, 0);
        const pendingCommission = Math.max(0, totalPlatformCommission - settledCommission);

        setMetrics({
          totalCustomers: custCount || 0,
          totalShops: shopCount || 0,
          totalOrders: (allOrders || []).length,
          completedOrders: completedOrders.length,
          totalGmv,
          totalPlatformCommission,
          settledCommission,
          pendingCommission,
          defaultCommissionRate: 10,
          settlements: settlements || []
        });
      } else {
        const res = await mockDatabase.getAdminMetricsAndCommissions();
        setMetrics(res);
      }
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    }
  };

  useEffect(() => {
    fetchShops();
    fetchMetrics();
  }, []);

  const { orders, isLoading: isLoadingOrders } = useOrders(undefined, 'admin');

  const handleUpdateShopStatus = async (shopId: string, status: 'approved' | 'rejected' | 'suspended') => {
    if (isRealSupabaseConfigured && supabase) {
      await supabase.from('shops').update({ status, updated_at: new Date().toISOString() }).eq('id', shopId);
    } else {
      await mockDatabase.updateShopStatus(shopId, status);
    }
    await fetchShops();
    await fetchMetrics();
  };

  const handleSettle = async (shopId: string, amount: number, reference: string) => {
    if (isRealSupabaseConfigured && supabase) {
      await supabase.from('commission_settlements').insert({
        shop_id: shopId,
        amount,
        status: 'settled',
        settlement_reference: reference,
        settled_at: new Date().toISOString()
      });
    } else {
      await mockDatabase.settleShopCommission(shopId, amount, reference, 'usr-admin-1');
    }
    await fetchMetrics();
  };

  const handleUpdateCommissionRate = async (newRate: number) => {
    if (isRealSupabaseConfigured && supabase) {
      await supabase.from('commission_settings').insert({ default_rate: newRate });
    } else {
      await mockDatabase.updateDefaultCommissionRate(newRate);
    }
    await fetchMetrics();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSearch}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Iron Order Control Plane</span>
              <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                Admin Console
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Platform Master Control</h1>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs font-extrabold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'overview' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Platform Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('shops')}
          className={`pb-3 text-xs font-extrabold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'shops' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Shops ({shops.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-xs font-extrabold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'orders' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Global Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`pb-3 text-xs font-extrabold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'commissions' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Commission Settlements</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Platform KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>Customers</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{metrics.totalCustomers || 128}</div>
              <div className="text-[10px] text-slate-400">Registered users</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>Partner Shops</span>
                <Store className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{metrics.totalShops}</div>
              <div className="text-[10px] text-slate-400">Total onboarded</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{metrics.totalOrders}</div>
              <div className="text-[10px] text-slate-400">{metrics.completedOrders} Completed</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>Total GMV</span>
                <DollarSign className="w-4 h-4 text-brand-600" />
              </div>
              <div className="text-2xl font-black text-brand-600">₹{metrics.totalGmv}</div>
              <div className="text-[10px] text-slate-400">Platform Volume</div>
            </div>
          </div>

          {/* Shops Table Preview */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900">Partner Shops Pending Approval</h3>
            <AdminShopsTab
              shops={shops}
              isLoading={isLoadingShops}
              onUpdateStatus={handleUpdateShopStatus}
            />
          </div>
        </div>
      )}

      {activeTab === 'shops' && (
        <AdminShopsTab
          shops={shops}
          isLoading={isLoadingShops}
          onUpdateStatus={handleUpdateShopStatus}
        />
      )}

      {activeTab === 'orders' && (
        <AdminOrdersTab orders={orders} isLoading={isLoadingOrders} />
      )}

      {activeTab === 'commissions' && (
        <AdminCommissionTab
          metrics={metrics}
          shops={shops}
          orders={orders}
          onSettle={handleSettle}
          onUpdateCommissionRate={handleUpdateCommissionRate}
        />
      )}
    </div>
  );
};
