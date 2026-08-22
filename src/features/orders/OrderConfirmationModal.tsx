import React from 'react';
import { CheckCircle2, Eye } from 'lucide-react';
import type { Order } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onTrackOrder: (order: Order) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  order,
  onTrackOrder,
}) => {
  if (!order || !isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="text-center p-2 space-y-4">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
            Order Placed Successfully
          </span>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            Order #{order.order_number}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Shop: <span className="font-bold text-slate-800">{order.shop_name}</span>
          </p>
        </div>

        {/* Order Summary Box */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Customer:</span>
            <span className="font-bold text-slate-800">{order.customer_name}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Items:</span>
            <span className="font-bold text-slate-800">{order.items?.length || 0} Clothes Type</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Fulfillment:</span>
            <span className="font-bold text-slate-800">
              {order.pickup_requested ? 'Doorstep Pickup & Delivery' : 'Shop Drop-off'}
            </span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-sm text-slate-900">
            <span>Total Payable to Shop:</span>
            <span className="text-brand-600">₹{order.total_amount}</span>
          </div>
          <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200 font-medium text-center">
            ⏳ Waiting for shop to accept and confirm pickup slot.
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={() => {
              onClose();
              onTrackOrder(order);
            }}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>TRACK THIS ORDER</span>
          </Button>

          <button
            onClick={onClose}
            className="w-full py-2 text-slate-500 hover:text-slate-800 font-bold text-xs"
          >
            Back to Home
          </button>
        </div>
      </div>
    </Modal>
  );
};
