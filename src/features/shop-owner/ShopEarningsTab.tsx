import React, { useState, useEffect } from 'react';
import { DollarSign, Percent, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import type { Shop } from '../../types';
import { mockDatabase, isRealSupabaseConfigured, supabase } from '../../lib/supabase';

interface ShopEarningsTabProps {
  shop: Shop;
}

export const ShopEarningsTab: React.FC<ShopEarningsTabProps> = ({ shop }) => {
  const [stats, setStats] = useState<{
    grossSales: number;
    totalCommission: number;
    netEarnings: number;
    settledAmount: number;
    pendingSettlement: number;
    completedOrdersCount: number;
  }>({
    grossSales: 0,
    totalCommission: 0,
    netEarnings: 0,
    settledAmount: 0,
    pendingSettlement: 0,
    completedOrdersCount: 0
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadFinancials() {
      setIsLoading(true);
      try {
        if (isRealSupabaseConfigured && supabase) {
          const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .eq('shop_id', shop.id)
            .eq('status', 'completed');

          const grossSales = (orders || []).reduce((sum, o) => sum + o.total_amount, 0);
          const totalCommission = (orders || []).reduce((sum, o) => sum + o.commission_amount, 0);
          const netEarnings = (orders || []).reduce((sum, o) => sum + o.shop_earnings, 0);

          const { data: settlements } = await supabase
            .from('commission_settlements')
            .select('*')
            .eq('shop_id', shop.id);

          const settledAmount = (settlements || []).filter(s => s.status === 'settled').reduce((sum, s) => sum + s.amount, 0);
          const pendingSettlement = Math.max(0, totalCommission - settledAmount);

          setStats({
            grossSales,
            totalCommission,
            netEarnings,
            settledAmount,
            pendingSettlement,
            completedOrdersCount: (orders || []).length
          });
        } else {
          const res = await mockDatabase.getShopEarningsAndCommission(shop.id);
          setStats(res);
        }
      } catch (err) {
        console.error('Failed to load shop earnings:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadFinancials();
  }, [shop.id]);

  if (isLoading) {
    return <div className="text-center py-12 text-xs text-slate-400">Calculating financial statements...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-extrabold text-slate-900">Earnings & Commission Accounting</h2>
        <p className="text-xs text-slate-500">Track gross customer payments, 10% platform commission, and net shop earnings.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Gross Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">₹{stats.grossSales}</div>
          <div className="text-[11px] text-slate-400">{stats.completedOrdersCount} Completed Orders</div>
        </div>

        {/* Platform Commission */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Platform Commission (10%)</span>
            <Percent className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-brand-600">₹{stats.totalCommission}</div>
          <div className="text-[11px] text-slate-400">Iron Order Service Fee</div>
        </div>

        {/* Net Shop Earnings */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Net Shop Earnings</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">₹{stats.netEarnings}</div>
          <div className="text-[11px] text-slate-400">Gross Sales − Commission</div>
        </div>

        {/* Settlement Status */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Pending Settlement</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700">₹{stats.pendingSettlement}</div>
          <div className="text-[11px] text-slate-400">Settled: ₹{stats.settledAmount}</div>
        </div>
      </div>

      {/* Accounting Note */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>Pay-to-Shop Direct Payment Business Model</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          Customers pay your shop directly in cash or UPI. Iron Order tracks platform commission accounting. Commission settlements are recorded by admin upon periodic invoice review.
        </p>
      </div>
    </div>
  );
};
