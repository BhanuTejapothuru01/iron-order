import React from 'react';
import { MapPin, Phone, MessageSquare, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
import type { Shop } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { RatingStars } from '../ui/RatingStars';
import { computeOpenStatus } from '../../lib/hours';

interface ShopCardProps {
  shop: Shop;
  onSelect: (shop: Shop) => void;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop, onSelect }) => {
  const openStatus = computeOpenStatus(shop.hours);
  const minPrice = shop.min_price || (shop.services && shop.services.length > 0 ? Math.min(...shop.services.map(s => s.price)) : 15);
  const mainPhoto = shop.photos && shop.photos.length > 0
    ? shop.photos[0].storage_path
    : 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=800';

  return (
    <Card hoverable onClick={() => onSelect(shop)} className="group overflow-hidden flex flex-col sm:flex-row h-full sm:h-48 border-slate-200/80">
      {/* Shop Image / Thumbnail */}
      <div className="relative sm:w-48 h-40 sm:h-full bg-slate-100 flex-shrink-0 overflow-hidden">
        <img
          src={mainPhoto}
          alt={shop.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Open / Closed Status Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <Badge variant={openStatus.badgeColor === 'green' ? 'green' : 'red'} size="sm">
            <span className={`w-1.5 h-1.5 rounded-full ${openStatus.badgeColor === 'green' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            {openStatus.statusText}
          </Badge>
        </div>
        {/* Distance Badge */}
        {shop.distance_km !== undefined && (
          <div className="absolute bottom-2.5 left-2.5 z-10 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
            <MapPin className="w-3 h-3 text-brand-400" />
            {shop.distance_km < 1 ? `${Math.round(shop.distance_km * 1000)} m` : `${shop.distance_km} km`}
          </div>
        )}
      </div>

      {/* Content details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
              {shop.name}
            </h3>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md text-amber-700 font-semibold text-xs flex-shrink-0">
              <RatingStars rating={shop.avg_rating} size="sm" />
              <span>{shop.avg_rating}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 line-clamp-1 mb-2">
            {shop.address}
          </p>

          {/* Capabilities Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {shop.pickup_available && (
              <Badge variant="blue" size="sm" icon={<Truck className="w-3 h-3" />}>
                Pickup
              </Badge>
            )}
            {shop.delivery_available && (
              <Badge variant="brand" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                Delivery
              </Badge>
            )}
            <span className="text-xs text-slate-400">• {shop.review_count} reviews</span>
          </div>
        </div>

        {/* Pricing & CTA footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Pressing From</span>
            <span className="text-base font-extrabold text-slate-900">₹{minPrice} <span className="text-xs font-normal text-slate-500">/ item</span></span>
          </div>

          <div className="flex items-center gap-2">
            {shop.phone && (
              <a
                href={`tel:${shop.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Call Shop"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            {shop.whatsapp && (
              <a
                href={`https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                title="WhatsApp Shop"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            )}
            <button className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 ml-1 group-hover:translate-x-0.5 transition-transform">
              Details <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};
