import React, { useState } from 'react';
import { ShoppingBag, Check, X, Phone, MapPin, Truck } from 'lucide-react';
import type { Order, OrderStatus, PaymentStatus } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface ShopOrdersTabProps {
  orders: Order[];
  isLoading: boolean;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onUpdatePayment: (orderId: string, paymentStatus: PaymentStatus) => Promise<void>;
}

export const ShopOrdersTab: React.FC<ShopOrdersTabProps> = ({
  orders,
  isLoading,
  onUpdateStatus,
  onUpdatePayment,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'new' | 'active' | 'completed' | 'cancelled'>('new');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredOrders = orders.filter(o => {
    if (activeSubTab === 'new') return o.status === 'pending';
    if (activeSubTab === 'active') return ['accepted', 'processing', 'ready', 'out_for_delivery'].includes(o.status);
    if (activeSubTab === 'completed') return o.status === 'completed';
    return o.status === 'rejected' || o.status === 'cancelled';
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await onUpdateStatus(orderId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentChange = async (orderId: string, paymentStatus: PaymentStatus) => {
    setUpdatingId(orderId);
    try {
      await onUpdatePayment(orderId, paymentStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('new')}
          className={`pb-3 text-xs font-extrabold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'new' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>New Orders</span>
          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px]">
            {orders.filter(o => o.status === 'pending').length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('active')}
          className={`pb-3 text-xs font-extrabold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'active' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Active In Progress</span>
          <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full text-[10px]">
            {orders.filter(o => ['accepted', 'processing', 'ready', 'out_for_delivery'].includes(o.status)).length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('completed')}
          className={`pb-3 text-xs font-extrabold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'completed' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Completed ({orders.filter(o => o.status === 'completed').length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cancelled')}
          className={`pb-3 text-xs font-extrabold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'cancelled' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Cancelled / Rejected ({orders.filter(o => o.status === 'cancelled' || o.status === 'rejected').length})</span>
        </button>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading shop orders...</div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-all"
            >
              {/* Header Info */}
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">ORDER #{order.order_number}</span>
                    <Badge variant={order.status === 'completed' ? 'green' : 'amber'} size="sm">
                      {order.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant={order.payment_status === 'paid_to_shop' ? 'green' : 'slate'} size="sm">
                      {order.payment_status === 'paid_to_shop' ? 'PAID TO SHOP' : 'PAYMENT PENDING'}
                    </Badge>
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                    <span>Customer: {order.customer_name}</span>
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="text-brand-600 hover:underline flex items-center gap-0.5 text-[11px]"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{order.customer_phone}</span>
                    </a>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="text-right">
                  <div className="text-base font-black text-slate-900">₹{order.total_amount}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">
                    Net Earnings: <span className="text-emerald-700 font-bold">₹{order.shop_earnings}</span>
                    <span className="text-slate-400"> (10% Comm ₹{order.commission_amount})</span>
                  </div>
                </div>
              </div>

              {/* Delivery / Pickup Address */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-brand-600" />
                    {order.pickup_requested ? 'Doorstep Pickup & Delivery Requested' : 'Self Drop-off at Shop'}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Slot: {order.scheduled_date || 'Today'} ({order.scheduled_time || 'Anytime'})
                  </span>
                </div>
                {order.delivery_address && (
                  <div className="text-slate-600 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span>{order.delivery_address}</span>
                  </div>
                )}
                {order.notes && (
                  <div className="text-amber-800 bg-amber-50/80 p-2 rounded-lg text-[11px] font-medium border border-amber-200/50 mt-1">
                    Note: "{order.notes}"
                  </div>
                )}
              </div>

              {/* Clothes Item Breakdown */}
              <div className="divide-y divide-slate-100 border-t border-b border-slate-100 py-2 space-y-1">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">
                      {item.service_name_snapshot} <span className="font-extrabold text-brand-600">× {item.quantity}</span>
                    </span>
                    <span className="font-bold text-slate-900">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                {order.status === 'pending' && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      isLoading={updatingId === order.id}
                      onClick={() => handleStatusChange(order.id, 'accepted')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex-1 sm:flex-none"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      ACCEPT ORDER
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      isLoading={updatingId === order.id}
                      onClick={() => handleStatusChange(order.id, 'rejected')}
                      className="border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs flex-1 sm:flex-none"
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      REJECT
                    </Button>
                  </div>
                )}

                {order.status === 'accepted' && (
                  <Button
                    size="sm"
                    isLoading={updatingId === order.id}
                    onClick={() => handleStatusChange(order.id, 'processing')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                  >
                    Start Steam Ironing (Processing)
                  </Button>
                )}

                {order.status === 'processing' && (
                  <Button
                    size="sm"
                    isLoading={updatingId === order.id}
                    onClick={() => handleStatusChange(order.id, 'ready')}
                    className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
                  >
                    Mark Ready for Pickup/Delivery
                  </Button>
                )}

                {(order.status === 'ready' || order.status === 'out_for_delivery') && (
                  <Button
                    size="sm"
                    isLoading={updatingId === order.id}
                    onClick={() => handleStatusChange(order.id, 'completed')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    Mark Completed & Delivered
                  </Button>
                )}

                {/* Payment Mark Action */}
                {order.payment_status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    isLoading={updatingId === order.id}
                    onClick={() => handlePaymentChange(order.id, 'paid_to_shop')}
                    className="border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-bold text-xs ml-auto"
                  >
                    Mark Paid to Shop (Cash/UPI)
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No {activeSubTab} orders</h3>
          <p className="text-xs text-slate-500">Orders placed by local customers will show up here immediately.</p>
        </div>
      )}
    </div>
  );
};
