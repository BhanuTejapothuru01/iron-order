import React, { useState } from 'react';
import { Check, X, ShieldAlert, Phone, MapPin } from 'lucide-react';
import type { Shop } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface AdminShopsTabProps {
  shops: Shop[];
  isLoading: boolean;
  onUpdateStatus: (shopId: string, status: 'approved' | 'rejected' | 'suspended') => Promise<void>;
}

export const AdminShopsTab: React.FC<AdminShopsTabProps> = ({ shops, isLoading, onUpdateStatus }) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleAction = async (shopId: string, status: 'approved' | 'rejected' | 'suspended') => {
    setUpdatingId(shopId);
    try {
      await onUpdateStatus(shopId, status);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Partner Shops ({shops.length})</h2>
          <p className="text-xs text-slate-500">Approve new shop listings, review phone details, or suspend shops.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading shops...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
          {shops.map((shop) => (
            <div key={shop.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-slate-900">{shop.name}</h4>
                  <Badge
                    variant={
                      shop.status === 'approved' ? 'green' : shop.status === 'pending' ? 'amber' : 'red'
                    }
                    size="sm"
                  >
                    {shop.status.toUpperCase()}
                  </Badge>
                  {shop.shop_type && (
                    <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {shop.shop_type.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-600 flex items-center gap-3 flex-wrap">
                  {shop.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {shop.address}
                    </span>
                  )}
                  {shop.phone && (
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {shop.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {shop.status !== 'approved' && (
                  <Button
                    size="sm"
                    isLoading={updatingId === shop.id}
                    onClick={() => handleAction(shop.id, 'approved')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    APPROVE
                  </Button>
                )}

                {shop.status !== 'rejected' && (
                  <Button
                    size="sm"
                    variant="outline"
                    isLoading={updatingId === shop.id}
                    onClick={() => handleAction(shop.id, 'rejected')}
                    className="border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    REJECT
                  </Button>
                )}

                {shop.status === 'approved' && (
                  <Button
                    size="sm"
                    variant="outline"
                    isLoading={updatingId === shop.id}
                    onClick={() => handleAction(shop.id, 'suspended')}
                    className="border-amber-300 text-amber-800 hover:bg-amber-50 font-bold text-xs"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                    SUSPEND
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
