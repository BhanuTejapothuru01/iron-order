import React, { useState } from 'react';
import { Save } from 'lucide-react';
import type { Shop } from '../../types';
import { Button } from '../../components/ui/Button';
import { mockDatabase, isRealSupabaseConfigured, supabase } from '../../lib/supabase';

interface ShopProfileTabProps {
  shop: Shop;
  onRefresh: () => void;
}

export const ShopProfileTab: React.FC<ShopProfileTabProps> = ({ shop, onRefresh }) => {
  const [name, setName] = useState<string>(shop.name);
  const [description, setDescription] = useState<string>(shop.description || '');
  const [address, setAddress] = useState<string>(shop.address || '');
  const [phone, setPhone] = useState<string>(shop.phone || '');
  const [whatsapp, setWhatsapp] = useState<string>(shop.whatsapp || '');
  const [pickupAvailable, setPickupAvailable] = useState<boolean>(shop.pickup_available);
  const [deliveryAvailable, setDeliveryAvailable] = useState<boolean>(shop.delivery_available);
  const [minOrder, setMinOrder] = useState<number>(shop.min_order_amount || 0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    try {
      if (isRealSupabaseConfigured && supabase) {
        await supabase
          .from('shops')
          .update({
            name,
            description,
            address,
            phone,
            whatsapp,
            pickup_available: pickupAvailable,
            delivery_available: deliveryAvailable,
            min_order_amount: minOrder,
            updated_at: new Date().toISOString()
          })
          .eq('id', shop.id);
      } else {
        await mockDatabase.updateShopProfile(shop.id, {
          name,
          description,
          address,
          phone,
          whatsapp,
          pickup_available: pickupAvailable,
          delivery_available: deliveryAvailable,
          min_order_amount: minOrder
        });
      }
      onRefresh();
      setSuccessMsg('Shop profile details updated successfully!');
    } catch (err) {
      console.error('Error updating shop profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveProfile} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Shop Profile & Capabilities</h2>
          <p className="text-xs text-slate-500">Update shop location details, phone numbers, and fulfillment options.</p>
        </div>
        <Button
          type="submit"
          isLoading={isSaving}
          leftIcon={<Save className="w-4 h-4" />}
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
        >
          Save Changes
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Shop Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
          <input
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">WhatsApp Number</label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Minimum Order Amount (₹)</label>
          <input
            type="number"
            value={minOrder}
            onChange={(e) => setMinOrder(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block font-bold text-slate-700 mb-1">Address</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block font-bold text-slate-700 mb-1">Description / Tagline</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          />
        </div>
      </div>

      {/* Fulfillment Checkboxes */}
      <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={pickupAvailable}
            onChange={(e) => setPickupAvailable(e.target.checked)}
            className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
          />
          <span>Doorstep Pickup Service Available</span>
        </label>

        <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={deliveryAvailable}
            onChange={(e) => setDeliveryAvailable(e.target.checked)}
            className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
          />
          <span>Doorstep Delivery Service Available</span>
        </label>
      </div>
    </form>
  );
};
