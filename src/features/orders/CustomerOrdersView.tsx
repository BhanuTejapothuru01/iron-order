import React, { useState } from 'react';
import { ShoppingBag, Eye, MapPin, ArrowLeft } from 'lucide-react';
import type { Order } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface CustomerOrdersViewProps {
  orders: Order[];
  isLoading: boolean;
  onTrackOrder: (order: Order) => void;
  onBackToSearch: () => void;
}

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({
  orders,
  isLoading,
  onTrackOrder,
  onBackToSearch,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'active') {
      return ['pending', 'accepted', 'processing', 'ready', 'out_for_delivery'].includes(o.status);
    }
    if (activeTab === 'completed') {
      return o.status === 'completed';
    }
    return o.status === 'cancelled' || o.status === 'rejected';
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSearch}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">My Orders</h1>
            <p className="text-xs text-slate-500 font-medium">Track your active & past ironing requests</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 text-xs font-extrabold transition-colors relative ${
            activeTab === 'active' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Orders ({orders.filter(o => ['pending', 'accepted', 'processing', 'ready', 'out_for_delivery'].includes(o.status)).length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 text-xs font-extrabold transition-colors relative ${
            activeTab === 'completed' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Completed ({orders.filter(o => o.status === 'completed').length})
        </button>

        <button
          onClick={() => setActiveTab('cancelled')}
          className={`pb-3 text-xs font-extrabold transition-colors relative ${
            activeTab === 'cancelled' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Cancelled / Rejected ({orders.filter(o => o.status === 'cancelled' || o.status === 'rejected').length})
        </button>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading your orders...</div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-brand-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Order #{order.order_number}</span>
                    <Badge
                      variant={
                        order.status === 'completed' ? 'green' : order.status === 'rejected' || order.status === 'cancelled' ? 'red' : 'amber'
                      }
                      size="sm"
                    >
                      {order.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">{order.shop_name}</h3>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-brand-600">₹{order.total_amount}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">
                    {order.payment_status === 'paid_to_shop' ? 'Paid to Shop' : 'Payment Pending'}
                  </div>
                </div>
              </div>

              {/* Items Summary */}
              <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-semibold">{order.items?.length || 0} Items: </span>
                  <span className="text-slate-600">
                    {order.items?.map(i => `${i.service_name_snapshot} (${i.quantity})`).join(', ')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[200px] sm:max-w-xs">{order.delivery_address || 'Pickup & Delivery'}</span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onTrackOrder(order)}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                  className="font-bold text-xs"
                >
                  Track Order Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No {activeTab} orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you place an ironing order with a nearby shop, it will appear here in real time.
          </p>
          <Button onClick={onBackToSearch} size="sm" className="bg-brand-600 hover:bg-brand-700 text-white font-bold">
            Explore Nearby Ironing Shops
          </Button>
        </div>
      )}
    </div>
  );
};
