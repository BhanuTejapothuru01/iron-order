import React, { useState } from 'react';
import { Store, MapPin, Phone, MessageSquare, Truck, ShieldCheck, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { mockDatabase, isRealSupabaseConfigured, supabase } from '../../lib/supabase';
import { useAuth } from '../../features/auth/AuthContext';

interface ShopRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShopCreated?: () => void;
}

export const ShopRegistrationModal: React.FC<ShopRegistrationModalProps> = ({
  isOpen,
  onClose,
  onShopCreated,
}) => {
  const { user } = useAuth();

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');

  const [latitude] = useState<number>(12.9716);
  const [longitude] = useState<number>(77.5946);

  const [pickupAvailable, setPickupAvailable] = useState<boolean>(true);
  const [deliveryAvailable, setDeliveryAvailable] = useState<boolean>(true);

  // Dynamic Services List State
  const [services, setServices] = useState<{ service_name: string; price: number }[]>([
    { service_name: 'Shirt / T-Shirt Steam Press', price: 15 },
    { service_name: 'Trouser / Jeans Press', price: 20 },
    { service_name: 'Suit (2-Piece) Steam Care', price: 80 },
    { service_name: 'Silk Saree Press', price: 60 },
  ]);

  const [newServiceName, setNewServiceName] = useState<string>('');
  const [newServicePrice, setNewServicePrice] = useState<string>('25');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    const priceNum = parseFloat(newServicePrice) || 0;
    setServices(prev => [...prev, { service_name: newServiceName.trim(), price: priceNum }]);
    setNewServiceName('');
    setNewServicePrice('25');
  };

  const handleRemoveService = (index: number) => {
    setServices(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    setSuccessMsg(null);

    try {
      const newShopData = {
        owner_id: user?.id || 'usr-owner-1',
        name: name.trim(),
        description: description.trim() || 'Professional steam pressing and clothes care.',
        latitude,
        longitude,
        address: address.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        pickup_available: pickupAvailable,
        delivery_available: deliveryAvailable,
        status: 'approved' as const,
        services: services.map((s, i) => ({
          id: `srv-${Date.now()}-${i}`,
          shop_id: '',
          service_name: s.service_name,
          price: s.price,
        })),
        hours: [
          { day_of_week: 0, open_time: '09:00', close_time: '18:00', is_closed: false },
          { day_of_week: 1, open_time: '08:00', close_time: '20:00', is_closed: false },
          { day_of_week: 2, open_time: '08:00', close_time: '20:00', is_closed: false },
          { day_of_week: 3, open_time: '08:00', close_time: '20:00', is_closed: false },
          { day_of_week: 4, open_time: '08:00', close_time: '20:00', is_closed: false },
          { day_of_week: 5, open_time: '08:00', close_time: '20:00', is_closed: false },
          { day_of_week: 6, open_time: '08:00', close_time: '20:00', is_closed: false },
        ],
      };

      if (isRealSupabaseConfigured && supabase) {
        await supabase.from('shops').insert([newShopData]);
      } else {
        await mockDatabase.createShop(newShopData);
      }

      setSuccessMsg('Your shop has been registered and listed successfully!');
      if (onShopCreated) onShopCreated();

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to register shop:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-slate-900">Register Your Ironing Shop</h3>
            <p className="text-xs text-slate-500">List your shop to start receiving steam press orders from local customers</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Shop Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Shop Name *"
              placeholder="e.g. Royal Steam Press & Care"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Contact Phone *"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Address *"
              placeholder="e.g. 12 Brigade Road, Bangalore"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              leftIcon={<MapPin className="w-4 h-4" />}
            />

            <Input
              label="WhatsApp Number"
              placeholder="+91 98765 43210"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              leftIcon={<MessageSquare className="w-4 h-4" />}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Shop Description</label>
            <textarea
              rows={2}
              placeholder="Tell customers about your steam press turnaround times, special care for silk sarees, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Fulfillment Options */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-around">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={pickupAvailable}
                onChange={(e) => setPickupAvailable(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              />
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Doorstep Pickup Offered</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={deliveryAvailable}
                onChange={(e) => setDeliveryAvailable(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              />
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Home Delivery Offered</span>
            </label>
          </div>

          {/* Services & Rate Card Builder */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Service Items & Rate Card (Pricing in ₹)
            </label>

            <div className="flex gap-2">
              <Input
                placeholder="Service Name (e.g. Silk Saree Press)"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="₹ Price"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                className="w-24"
              />
              <Button type="button" size="sm" onClick={handleAddService} leftIcon={<Plus className="w-4 h-4" />}>
                Add
              </Button>
            </div>

            <div className="space-y-1.5 pt-1">
              {services.map((srv, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs">
                  <span className="font-semibold text-slate-800">{srv.service_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">₹{srv.price}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Complete Registration & Publish
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
