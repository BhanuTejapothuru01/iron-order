import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import type { Order } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { OrderTrackingModal } from '../orders/OrderTrackingModal';

interface AdminOrdersTabProps {
  orders: Order[];
  isLoading: boolean;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({ orders, isLoading }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredOrders = orders.filter(o => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.order_number.toString().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        (o.shop_name && o.shop_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Platform Orders Audit ({orders.length})</h2>
          <p className="text-xs text-slate-500">Monitor all customer orders, status transitions, and payment statuses.</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search order #, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl bg-white border border-slate-200"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-white border border-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="processing">Processing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading platform orders...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Shop</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Commission (10%)</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-black text-slate-900">#{o.order_number}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{o.customer_name}</div>
                      <div className="text-[10px] text-slate-400">{o.customer_phone}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{o.shop_name}</td>
                    <td className="py-3 px-4 font-black text-slate-900">₹{o.total_amount}</td>
                    <td className="py-3 px-4 font-bold text-brand-600">₹{o.commission_amount}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={o.status === 'completed' ? 'green' : o.status === 'rejected' ? 'red' : 'amber'}
                        size="sm"
                      >
                        {o.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={o.payment_status === 'paid_to_shop' ? 'green' : 'slate'}
                        size="sm"
                      >
                        {o.payment_status === 'paid_to_shop' ? 'PAID TO SHOP' : 'PENDING'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Modal */}
      {selectedOrder && (
        <OrderTrackingModal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
        />
      )}
    </div>
  );
};
