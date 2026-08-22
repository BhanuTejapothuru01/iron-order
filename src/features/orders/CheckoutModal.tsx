import React, { useState } from 'react';
import { X, ShoppingBag, MapPin, Calendar, CreditCard, ChevronRight, Truck } from 'lucide-react';
import type { Shop, CartItem, PaymentMethod } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop | null;
  items: CartItem[];
  subtotal: number;
  onOrderPlaced: (orderData: {
    customer_name: string;
    customer_phone: string;
    delivery_address: string;
    pickup_requested: boolean;
    delivery_requested: boolean;
    scheduled_date: string;
    scheduled_time: string;
    notes: string;
    payment_method: PaymentMethod;
  }) => Promise<void>;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  shop,
  items,
  subtotal,
  onOrderPlaced,
}) => {
  const [fulfillmentType, setFulfillmentType] = useState<'pickup_delivery' | 'dropoff'>('pickup_delivery');
  const [customerName, setCustomerName] = useState<string>('Priya Sharma');
  const [customerPhone, setCustomerPhone] = useState<string>('+91 98765 00001');
  const [addressLine, setAddressLine] = useState<string>('Flat 402, Sunshine Apartments, MG Road, Bengaluru');
  const [scheduledDate, setScheduledDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState<string>('10:00 AM - 12:00 PM');
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod] = useState<PaymentMethod>('pay_to_shop');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!shop || !isOpen) return null;

  const deliveryFee = fulfillmentType === 'pickup_delivery' ? 20 : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      await onOrderPlaced({
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: fulfillmentType === 'pickup_delivery' ? addressLine : 'Drop off at shop',
        pickup_requested: fulfillmentType === 'pickup_delivery',
        delivery_requested: fulfillmentType === 'pickup_delivery',
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        notes,
        payment_method: paymentMethod,
      });
    } catch (err) {
      console.error('Error placing order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="-m-6 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-400/30 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Checkout Order</h3>
              <p className="text-xs text-slate-400">Shop: {shop.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1 text-slate-800">
          {/* Order Item Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Items Selected ({items.length})
            </div>
            <div className="divide-y divide-slate-200/60 max-h-36 overflow-y-auto">
              {items.map((item) => (
                <div key={item.service.id} className="py-2 flex items-center justify-between text-xs">
                  <div className="font-semibold text-slate-900">
                    {item.service.service_name} <span className="text-brand-600 font-bold">× {item.quantity}</span>
                  </div>
                  <div className="font-bold text-slate-900">
                    ₹{item.service.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fulfillment Options */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Fulfillment Option
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setFulfillmentType('pickup_delivery')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  fulfillmentType === 'pickup_delivery'
                    ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <Truck className="w-4 h-4 text-brand-600 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Doorstep Pickup & Delivery</div>
                  <div className="text-[11px] text-slate-500">+₹20 convenience fee</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('dropoff')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  fulfillmentType === 'dropoff'
                    ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-4 h-4 text-slate-600 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Drop Clothes at Shop</div>
                  <div className="text-[11px] text-slate-500">Free self-drop & collect</div>
                </div>
              </button>
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>

            {fulfillmentType === 'pickup_delivery' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup & Delivery Address</label>
                <textarea
                  rows={2}
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="House/Flat No, Apartment Name, Street..."
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
            )}
          </div>

          {/* Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
              </select>
            </div>
          </div>

          {/* Payment Method Option */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Payment Method
            </label>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Pay Shop Directly (Cash / UPI on Delivery or Pickup)</span>
              </div>
              <span className="text-[10px] uppercase bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded">
                Verified
              </span>
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ironing Instructions (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Extra starch for shirts, don't iron collar buttons..."
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>

          {/* Cost Breakdown */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Items Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Doorstep Pickup & Delivery</span>
              <span>{deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE'}</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between font-extrabold text-sm text-white">
              <span>Total Payable to Shop</span>
              <span className="text-brand-400 text-base">₹{grandTotal}</span>
            </div>
          </div>

          {/* Submit Action */}
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
          >
            <span>PLACE ORDER NOW</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Modal>
  );
};
