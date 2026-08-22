import React, { useState } from 'react';
import { CheckCircle2, Save, Plus } from 'lucide-react';
import type { CommissionSettlement, Shop, Order } from '../../types';
import { Button } from '../../components/ui/Button';

interface AdminCommissionTabProps {
  metrics: {
    totalGmv: number;
    totalPlatformCommission: number;
    settledCommission: number;
    pendingCommission: number;
    defaultCommissionRate: number;
    settlements: CommissionSettlement[];
  };
  shops: Shop[];
  orders: Order[];
  onSettle: (shopId: string, amount: number, reference: string) => Promise<void>;
  onUpdateCommissionRate: (newRate: number) => Promise<void>;
}

export const AdminCommissionTab: React.FC<AdminCommissionTabProps> = ({
  metrics,
  shops,
  orders,
  onSettle,
  onUpdateCommissionRate,
}) => {
  const [rateInput, setRateInput] = useState<number>(metrics.defaultCommissionRate);
  const [isUpdatingRate, setIsUpdatingRate] = useState<boolean>(false);

  // Settlement Form State
  const [selectedShopId, setSelectedShopId] = useState<string>(shops.length > 0 ? shops[0].id : '');
  const [settleAmount, setSettleAmount] = useState<number>(100);
  const [reference, setReference] = useState<string>(`SETTLE-${Date.now().toString().slice(-6)}`);
  const [isSubmittingSettle, setIsSubmittingSettle] = useState<boolean>(false);

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingRate(true);
    try {
      await onUpdateCommissionRate(rateInput);
      alert('Default platform commission rate updated successfully!');
    } finally {
      setIsUpdatingRate(false);
    }
  };

  const handleSettleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId || settleAmount <= 0) return;

    setIsSubmittingSettle(true);
    try {
      await onSettle(selectedShopId, settleAmount, reference);
      setReference(`SETTLE-${Date.now().toString().slice(-6)}`);
      alert('Commission settlement recorded successfully!');
    } finally {
      setIsSubmittingSettle(false);
    }
  };

  // Group commission data per shop
  const shopCommissionLedger = shops.map(shop => {
    const shopCompletedOrders = orders.filter(o => o.shop_id === shop.id && o.status === 'completed');
    const grossSales = shopCompletedOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const commissionAccrued = shopCompletedOrders.reduce((sum, o) => sum + o.commission_amount, 0);
    
    const shopSettlements = metrics.settlements.filter(s => s.shop_id === shop.id && s.status === 'settled');
    const settledAmount = shopSettlements.reduce((sum, s) => sum + s.amount, 0);
    const pendingSettlement = Math.max(0, commissionAccrued - settledAmount);

    return {
      shop,
      grossSales,
      commissionAccrued,
      settledAmount,
      pendingSettlement,
      ordersCount: shopCompletedOrders.length
    };
  });

  return (
    <div className="space-y-6">
      {/* Commission Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-bold text-slate-500">Total Platform GMV</div>
          <div className="text-2xl font-black text-slate-900">₹{metrics.totalGmv}</div>
          <div className="text-[10px] text-slate-400">Gross Merchandise Value</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-bold text-brand-600">Platform Commission ({metrics.defaultCommissionRate}%)</div>
          <div className="text-2xl font-black text-brand-600">₹{metrics.totalPlatformCommission}</div>
          <div className="text-[10px] text-slate-400">Total Accrued Revenue</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-bold text-emerald-600">Settled Commission</div>
          <div className="text-2xl font-black text-emerald-700">₹{metrics.settledCommission}</div>
          <div className="text-[10px] text-slate-400">Collected Payouts</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-bold text-amber-600">Pending Settlement</div>
          <div className="text-2xl font-black text-amber-700">₹{metrics.pendingCommission}</div>
          <div className="text-[10px] text-slate-400">Unsettled Commissions</div>
        </div>
      </div>

      {/* Global Commission Config */}
      <form onSubmit={handleUpdateRate} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-end justify-between gap-4">
        <div className="flex-1 space-y-1">
          <h3 className="text-sm font-extrabold text-slate-900">Default Platform Commission Rate</h3>
          <p className="text-xs text-slate-500">Configure default percentage for future completed orders. Historical orders preserve their rate at creation time.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="number"
              step="0.5"
              min="0"
              max="50"
              value={rateInput}
              onChange={(e) => setRateInput(Number(e.target.value))}
              className="w-24 text-xs font-bold p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
          </div>

          <Button type="submit" isLoading={isUpdatingRate} size="sm" leftIcon={<Save className="w-4 h-4" />} className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs">
            Save Rate
          </Button>
        </div>
      </form>

      {/* Record Settlement Section */}
      <form onSubmit={handleSettleSubmit} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Record Commission Settlement (Bookkeeping Action)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Partner Shop</label>
            <select
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-medium"
            >
              {shops.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Amount Settled (₹)</label>
            <input
              type="number"
              min={1}
              value={settleAmount}
              onChange={(e) => setSettleAmount(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Settlement Ref #</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-medium"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={isSubmittingSettle}
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
          >
            Mark Commission as Settled
          </Button>
        </div>
      </form>

      {/* Per Shop Commission Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 font-extrabold text-xs text-slate-900">
          Partner Shop Commission Accounting Ledger
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Shop Name</th>
                <th className="py-3 px-4">Completed Orders</th>
                <th className="py-3 px-4">Gross Sales</th>
                <th className="py-3 px-4">Commission Accrued</th>
                <th className="py-3 px-4">Settled Amount</th>
                <th className="py-3 px-4">Pending Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {shopCommissionLedger.map((row) => (
                <tr key={row.shop.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-extrabold text-slate-900">{row.shop.name}</td>
                  <td className="py-3 px-4 font-bold text-slate-700">{row.ordersCount}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">₹{row.grossSales}</td>
                  <td className="py-3 px-4 font-black text-brand-600">₹{row.commissionAccrued}</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">₹{row.settledAmount}</td>
                  <td className="py-3 px-4 font-black text-amber-700">₹{row.pendingSettlement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
