import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import type { Order } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { mockDatabase, isRealSupabaseConfigured, supabase } from '../../lib/supabase';

import { sanitizeInput } from '../../lib/security';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onReviewSubmitted?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  order,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!order || !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const cleanComment = sanitizeInput(comment);
    setIsSubmitting(true);
    try {
      if (isRealSupabaseConfigured && supabase) {
        await supabase.from('reviews').insert({
          shop_id: order.shop_id,
          customer_id: order.customer_id,
          order_id: order.id,
          rating,
          comment: cleanComment,
          customer_name: sanitizeInput(order.customer_name)
        });
      } else {
        await mockDatabase.addReview({
          shop_id: order.shop_id,
          customer_id: order.customer_id,
          order_id: order.id,
          rating,
          comment: cleanComment,
          customer_name: sanitizeInput(order.customer_name)
        });
      }
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="-m-6 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="font-bold text-base">Rate Your Ironing Experience</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-slate-800">
          <div className="text-center space-y-1">
            <h4 className="font-extrabold text-sm text-slate-900">{order.shop_name}</h4>
            <p className="text-xs text-slate-500">Order #{order.order_number}</p>
          </div>

          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className="p-1 hover:scale-110 transition-transform focus:outline-none"
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Feedback</label>
            <textarea
              rows={3}
              required
              placeholder="How was the steam press quality, turnaround time, and delivery?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>SUBMIT REVIEW</span>
          </Button>
        </form>
      </div>
    </Modal>
  );
};
