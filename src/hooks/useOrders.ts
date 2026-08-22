import { useState, useCallback, useEffect } from 'react';
import type { Order, OrderStatus, PaymentStatus, PaymentMethod } from '../types';
import { supabase, isRealSupabaseConfigured, mockDatabase } from '../lib/supabase';

export function useOrders(userId?: string, role: string = 'customer', shopId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isRealSupabaseConfigured && supabase) {
        let query = supabase.from('orders').select('*, items:order_items(*)');
        if (role === 'customer' && userId) {
          query = query.eq('customer_id', userId);
        } else if (role === 'owner' && shopId) {
          query = query.eq('shop_id', shopId);
        }
        const { data, error: err } = await query.order('created_at', { ascending: false });
        if (err) throw err;
        setOrders(data || []);
      } else {
        let res: Order[] = [];
        if (role === 'admin') {
          res = await mockDatabase.getAllOrdersAdmin();
        } else if (role === 'owner' && shopId) {
          res = await mockDatabase.getShopOrders(shopId);
        } else if (userId) {
          res = await mockDatabase.getCustomerOrders(userId);
        } else {
          res = await mockDatabase.getAllOrdersAdmin();
        }
        setOrders(res);
      }
    } catch (e: any) {
      console.error('Failed to fetch orders:', e);
      setError(e.message || 'Error fetching orders');
    } finally {
      setIsLoading(false);
    }
  }, [userId, role, shopId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const placeOrder = async (payload: {
    customer_id: string;
    shop_id: string;
    customer_name: string;
    customer_phone: string;
    delivery_address?: string;
    pickup_requested: boolean;
    delivery_requested: boolean;
    scheduled_date?: string;
    scheduled_time?: string;
    notes?: string;
    payment_method: PaymentMethod;
    items: Array<{ service_id: string; service_name: string; unit_price: number; quantity: number }>;
  }): Promise<Order> => {
    if (isRealSupabaseConfigured && supabase) {
      const subtotal = payload.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
      const delivery_fee = payload.pickup_requested || payload.delivery_requested ? 20 : 0;
      const total_amount = subtotal + delivery_fee;
      const commission_rate = 10.0;
      const commission_amount = (total_amount * commission_rate) / 100;
      const shop_earnings = total_amount - commission_amount;

      const { data: newOrder, error: orderErr } = await supabase
        .from('orders')
        .insert({
          customer_id: payload.customer_id,
          shop_id: payload.shop_id,
          customer_name: payload.customer_name,
          customer_phone: payload.customer_phone,
          delivery_address: payload.delivery_address,
          pickup_requested: payload.pickup_requested,
          delivery_requested: payload.delivery_requested,
          scheduled_date: payload.scheduled_date,
          scheduled_time: payload.scheduled_time,
          notes: payload.notes,
          payment_method: payload.payment_method,
          subtotal,
          delivery_fee,
          total_amount,
          commission_rate,
          commission_amount,
          shop_earnings,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // Insert Order Items
      const orderItems = payload.items.map(item => ({
        order_id: newOrder.id,
        service_id: item.service_id,
        service_name_snapshot: item.service_name,
        unit_price: item.unit_price,
        quantity: item.quantity,
        subtotal: item.unit_price * item.quantity
      }));

      await supabase.from('order_items').insert(orderItems);

      await fetchOrders();
      return newOrder;
    } else {
      const newOrder = await mockDatabase.createOrder(payload);
      await fetchOrders();
      return newOrder;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (isRealSupabaseConfigured && supabase) {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (status === 'completed') {
        updates.payment_status = 'paid_to_shop';
        updates.paid_at = new Date().toISOString();
      }
      await supabase.from('orders').update(updates).eq('id', orderId);
    } else {
      await mockDatabase.updateOrderStatus(orderId, status);
    }
    await fetchOrders();
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    if (isRealSupabaseConfigured && supabase) {
      const updates: any = { payment_status: paymentStatus, updated_at: new Date().toISOString() };
      if (paymentStatus === 'paid_to_shop') {
        updates.paid_at = new Date().toISOString();
      }
      await supabase.from('orders').update(updates).eq('id', orderId);
    } else {
      await mockDatabase.updateOrderPaymentStatus(orderId, paymentStatus);
    }
    await fetchOrders();
  };

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
    placeOrder,
    updateOrderStatus,
    updatePaymentStatus
  };
}
