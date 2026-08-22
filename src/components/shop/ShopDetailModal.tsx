import React, { useState, useEffect } from 'react';
import { MapPin, Phone, MessageSquare, Truck, ShieldCheck, Clock, Star, Send, X, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import type { Shop, Review } from '../../types';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { RatingStars } from '../ui/RatingStars';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { computeOpenStatus, formatHourString, DAY_NAMES } from '../../lib/hours';
import { mockDatabase, isRealSupabaseConfigured, supabase } from '../../lib/supabase';
import { getGoogleMapsUrl, getAppleMapsUrl } from '../../lib/mapbox';

interface ShopDetailModalProps {
  shop: Shop | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewAdded?: () => void;
}

export const ShopDetailModal: React.FC<ShopDetailModalProps> = ({
  shop,
  isOpen,
  onClose,
  onReviewAdded,
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'hours' | 'reviews'>('services');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);

  // New Review Form state
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!shop || !isOpen) return;

    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        if (isRealSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('shop_id', shop.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            setReviews(data as Review[]);
          }
        } else {
          const mockRevs = await mockDatabase.getShopReviews(shop.id);
          setReviews(mockRevs);
        }
      } catch (err) {
        console.error('Failed to load shop reviews', err);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [shop, isOpen]);

  if (!shop) return null;

  const openStatus = computeOpenStatus(shop.hours);
  const mainPhoto = shop.photos && shop.photos.length > 0
    ? shop.photos[0].storage_path
    : 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=800';

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !customerName.trim()) return;

    setIsSubmittingReview(true);
    setReviewSuccessMsg(null);

    try {
      if (isRealSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('reviews').insert([
          {
            shop_id: shop.id,
            customer_id: 'usr-customer-1',
            rating: newRating,
            comment: newComment.trim(),
            customer_name: customerName.trim(),
          }
        ]).select().single();

        if (!error && data) {
          setReviews(prev => [data as Review, ...prev]);
        }
      } else {
        const added = await mockDatabase.addReview({
          shop_id: shop.id,
          customer_id: 'usr-customer-1',
          rating: newRating,
          comment: newComment.trim(),
          customer_name: customerName.trim(),
        });
        setReviews(prev => [added, ...prev]);
      }

      setNewComment('');
      setNewRating(5);
      setReviewSuccessMsg('Thank you! Your review has been published.');
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      console.error('Error adding review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="-m-6 flex flex-col max-h-[85vh]">
        {/* Header Hero Image */}
        <div className="relative h-48 sm:h-64 w-full bg-slate-900 overflow-hidden flex-shrink-0">
          <img
            src={mainPhoto}
            alt={shop.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

          {/* Close Button overlay */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-md text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Badges & Shop Info */}
          <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant={openStatus.badgeColor === 'green' ? 'green' : 'red'} size="sm">
                <span className={`w-1.5 h-1.5 rounded-full ${openStatus.badgeColor === 'green' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                {openStatus.statusText}
              </Badge>

              {shop.is_osm ? (
                <Badge variant="slate" size="sm">
                  OSM Real Shop
                </Badge>
              ) : (
                <Badge variant="blue" size="sm">
                  Verified Partner
                </Badge>
              )}

              {shop.distance_km !== undefined && (
                <div className="bg-slate-900/80 backdrop-blur-md text-slate-200 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-400" />
                  {shop.distance_km < 1 ? `${Math.round(shop.distance_km * 1000)} meters away` : `${shop.distance_km} km away`}
                </div>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1">
              {shop.name}
            </h2>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <RatingStars rating={shop.avg_rating} size="sm" />
                <span>{shop.avg_rating}</span>
                <span className="text-slate-400 font-normal">({shop.review_count} reviews)</span>
              </div>
              {shop.address && (
                <span className="hidden sm:inline-block">• {shop.address}</span>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Shop Address & Description */}
          <div>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              {shop.description || 'Professional steam pressing & ironing services with care.'}
            </p>
            {shop.address && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <span className="line-clamp-1">{shop.address}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={getGoogleMapsUrl(shop.latitude, shop.longitude, `${shop.name}, ${shop.address}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={getAppleMapsUrl(shop.latitude, shop.longitude, `${shop.name}, ${shop.address}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>Apple Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Quick Contact & Fulfillment Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {shop.phone ? (
              <a
                href={`tel:${shop.phone}`}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
              >
                <Phone className="w-4 h-4" />
                <span>Call Shop</span>
              </a>
            ) : (
              <Button disabled variant="secondary" size="sm">No Phone</Button>
            )}

            {shop.whatsapp ? (
              <a
                href={`https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            ) : (
              <Button disabled variant="secondary" size="sm">No WhatsApp</Button>
            )}

            <div className="col-span-2 sm:col-span-1 flex items-center justify-around bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Truck className={`w-4 h-4 ${shop.pickup_available ? 'text-blue-600' : 'text-slate-300'}`} />
                <span>{shop.pickup_available ? 'Pickup' : 'No Pickup'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <ShieldCheck className={`w-4 h-4 ${shop.delivery_available ? 'text-brand-600' : 'text-slate-300'}`} />
                <span>{shop.delivery_available ? 'Delivery' : 'No Delivery'}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-200 flex gap-6">
            <button
              onClick={() => setActiveTab('services')}
              className={`pb-3 text-xs font-bold transition-colors relative flex items-center gap-1.5 ${
                activeTab === 'services'
                  ? 'text-brand-600 border-b-2 border-brand-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Services & Prices</span>
            </button>

            <button
              onClick={() => setActiveTab('hours')}
              className={`pb-3 text-xs font-bold transition-colors relative flex items-center gap-1.5 ${
                activeTab === 'hours'
                  ? 'text-brand-600 border-b-2 border-brand-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Working Hours</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-xs font-bold transition-colors relative flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'text-brand-600 border-b-2 border-brand-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Reviews ({reviews.length})</span>
            </button>
          </div>

          {/* Tab Content: Services & Rates */}
          {activeTab === 'services' && (
            <div className="space-y-3">
              {shop.services && shop.services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {shop.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                          👔
                        </div>
                        <span className="text-xs font-semibold text-slate-800">{service.service_name}</span>
                      </div>
                      <span className="text-sm font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                        ₹{service.price}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No standard rate list specified for this shop. Contact owner directly.
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Hours */}
          {activeTab === 'hours' && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
              {DAY_NAMES.map((dayName, idx) => {
                const dayHours = shop.hours?.find((h) => h.day_of_week === idx);
                const isToday = new Date().getDay() === idx;

                return (
                  <div
                    key={dayName}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium ${
                      isToday ? 'bg-brand-50 text-brand-900 border border-brand-200 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {dayName}
                      {isToday && <span className="text-[10px] bg-brand-600 text-white px-1.5 py-0.5 rounded-md">Today</span>}
                    </span>
                    <span>
                      {dayHours
                        ? formatHourString(dayHours.open_time, dayHours.close_time, dayHours.is_closed)
                        : 'Contact Shop'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab Content: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Add Review Form */}
              <form onSubmit={handleAddReview} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Leave a Review</h4>

                {reviewSuccessMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    {reviewSuccessMsg}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-600">Your Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1 hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  placeholder="Your Name (e.g. Priya Sharma)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />

                <textarea
                  rows={2}
                  placeholder="Write your experience (e.g., Fast turnaround, great steam press quality...)"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />

                <div className="flex justify-end">
                  <Button type="submit" size="sm" isLoading={isSubmittingReview} leftIcon={<Send className="w-3.5 h-3.5" />}>
                    Submit Review
                  </Button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                {loadingReviews ? (
                  <div className="text-center py-6 text-xs text-slate-400">Loading reviews...</div>
                ) : reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-3.5 rounded-xl bg-white border border-slate-100 shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{rev.customer_name || 'Customer'}</span>
                        <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                          <RatingStars rating={rev.rating} size="sm" />
                          <span>{rev.rating}.0</span>
                        </div>
                      </div>
                      {rev.comment && <p className="text-xs text-slate-600">{rev.comment}</p>}
                      <div className="text-[10px] text-slate-400">
                        {new Date(rev.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No reviews yet. Be the first to leave a review!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
