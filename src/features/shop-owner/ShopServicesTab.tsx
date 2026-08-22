import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import type { Shop, ShopService } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { mockDatabase, isRealSupabaseConfigured, supabase } from '../../lib/supabase';

interface ShopServicesTabProps {
  shop: Shop;
  onRefresh: () => void;
}

export const ShopServicesTab: React.FC<ShopServicesTabProps> = ({ shop, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<ShopService | null>(null);

  const [serviceName, setServiceName] = useState<string>('');
  const [price, setPrice] = useState<number>(15);
  const [category, setCategory] = useState<string>('ironing');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingService(null);
    setServiceName('');
    setPrice(15);
    setCategory('ironing');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: ShopService) => {
    setEditingService(service);
    setServiceName(service.service_name);
    setPrice(service.price);
    setCategory(service.category || 'ironing');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) return;

    setIsSaving(true);
    try {
      if (editingService) {
        // Update existing service
        if (isRealSupabaseConfigured && supabase) {
          await supabase
            .from('shop_services')
            .update({
              service_name: serviceName.trim(),
              price,
              category
            })
            .eq('id', editingService.id);
        } else {
          await mockDatabase.updateShopService(editingService.id, {
            service_name: serviceName.trim(),
            price,
            category
          });
        }
      } else {
        // Create new service
        if (isRealSupabaseConfigured && supabase) {
          await supabase.from('shop_services').insert({
            shop_id: shop.id,
            service_name: serviceName.trim(),
            price,
            category,
            is_active: true
          });
          await mockDatabase.addShopService(
            shop.id,
            serviceName.trim(),
            price,
            category
          );
        }
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Error saving shop service:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service rate?')) return;
    setDeletingId(serviceId);
    try {
      if (isRealSupabaseConfigured && supabase) {
        await supabase.from('shop_services').delete().eq('id', serviceId);
      } else {
        await mockDatabase.deleteShopService(serviceId);
      }
      onRefresh();
    } catch (err) {
      console.error('Error deleting service:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Service Catalog & Rate List</h2>
          <p className="text-xs text-slate-500">Configure item pricing for steam ironing, starching, and dry cleaning.</p>
        </div>
        <Button
          onClick={handleOpenAdd}
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
        >
          Add New Rate
        </Button>
      </div>

      {/* Services Grid */}
      {shop.services && shop.services.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shop.services.map((service) => (
            <div
              key={service.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between hover:border-brand-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-base">
                  👔
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{service.service_name}</h4>
                  <div className="text-sm font-black text-brand-600">₹{service.price}</div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(service)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  title="Edit Service"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  disabled={deletingId === service.id}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 text-xs text-slate-400">
          No services added yet. Click "Add New Rate" to populate your rate list.
        </div>
      )}

      {/* Add / Edit Service Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900">
              {editingService ? 'Edit Service Rate' : 'Add New Service Rate'}
            </h3>
            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Service / Clothes Name</label>
              <input
                type="text"
                required
                placeholder="e.g., Men Shirt (Steam Press), Saree Pressing..."
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Price per Piece (₹)</label>
              <input
                type="number"
                required
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="ironing">Normal Ironing</option>
                <option value="steam_press">Steam Press</option>
                <option value="starch">Starching & Press</option>
                <option value="dry_clean">Dry Cleaning</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSaving} className="bg-brand-600 hover:bg-brand-700 text-white font-bold">
                Save Rate
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
