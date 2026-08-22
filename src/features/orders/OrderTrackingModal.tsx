import React, { useState } from 'react';
import { X, Check, MapPin, Phone, Star } from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onPayShop?: (orderId: string) => Promise<void>;
  onOpenReview?: (order: Order) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  order,
  onPayShop,
  onOpenReview,
}) => {
  const [isPaying, setIsPaying] = useState<boolean>(false);

  if (!order || !isOpen) return null;

  const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'accepted', label: 'Accepted by Shop' },
    { key: 'processing', label: 'In Steam Ironing' },
    { key: 'ready', label: 'Ready for Collection' },
    { key: 'completed', label: 'Completed & Delivered' },
  ];

  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'pending': return 0;
      case 'accepted': return 1;
      case 'processing': return 2;
      case 'ready': return 3;
      case 'out_for_delivery': return 3;
      case 'completed': return 4;
      case 'rejected': return -1;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  const handlePayClick = async () => {
    if (!onPayShop) return;
    setIsPaying(true);
    try {
      await onPayShop(order.id);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="-m-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
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
            <h3 className="font-black text-lg text-white mt-0.5">{order.shop_name}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Visual Progress Stepper */}
          {order.status === 'rejected' || order.status === 'cancelled' ? (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-center space-y-1">
              <div className="text-xs font-extrabold text-rose-800 uppercase tracking-wider">
                Order {order.status === 'rejected' ? 'Rejected' : 'Cancelled'}
              </div>
              <p className="text-xs text-rose-700">
                This order was {order.status}. If you have any questions, please call the shop directly.
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Live Order Progress Tracker
              </div>
              <div className="relative flex items-center justify-between px-2">
                {/* Connecting Line */}
                <div className="absolute left-6 right-6 top-4 h-1 bg-slate-200 z-0">
                  <div
                    className="h-full bg-brand-600 transition-all duration-500"
                    style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                  />
                </div>

                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isDone
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 ring-4 ring-brand-100'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] mt-2 font-bold max-w-[64px] leading-tight ${
                          isCurrent ? 'text-brand-700 font-extrabold' : isDone ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Itemized Order Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-700">Order Items</span>
              <span className="text-slate-500">{order.items?.length || 0} Types</span>
            </div>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item) => (
                <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800">
                    {item.service_name_snapshot} <span className="font-extrabold text-brand-600">× {item.quantity}</span>
                  </span>
                  <span className="font-bold text-slate-900">₹{item.subtotal}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-2 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery Fee</span>
                <span>₹{order.delivery_fee}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-1">
                <span>Total Amount</span>
                <span className="text-brand-600">₹{order.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Payment & Action Controls */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Payment Status:</span>
                <Badge
                  variant={order.payment_status === 'paid_to_shop' ? 'green' : 'amber'}
                  size="sm"
                >
                  {order.payment_status === 'paid_to_shop' ? 'PAID TO SHOP' : 'PAYMENT PENDING'}
                </Badge>
              </div>

              {order.payment_status === 'pending' && onPayShop && (
                <Button
                  size="sm"
                  isLoading={isPaying}
                  onClick={handlePayClick}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Mark Paid to Shop (Cash/UPI)
                </Button>
              )}
            </div>

            {order.status === 'completed' && onOpenReview && (
              <Button
                variant="outline"
                className="w-full text-xs font-bold py-2 border-brand-300 text-brand-700 hover:bg-brand-50 flex items-center justify-center gap-1.5"
                onClick={() => {
                  onClose();
                  onOpenReview(order);
                }}
              >
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Rate & Review Shop</span>
              </Button>
            )}
          </div>

          {/* Shop Contact Info */}
          <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span className="truncate">{order.shop_address || 'Shop Location'}</span>
            </div>
            {order.shop_phone && (
              <a
                href={`tel:${order.shop_phone}`}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center gap-1 flex-shrink-0 hover:bg-slate-800"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
