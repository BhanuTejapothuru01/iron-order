import { useState, useCallback, useEffect } from 'react';
import type { Notification } from '../types';
import { supabase, isRealSupabaseConfigured, mockDatabase } from '../lib/supabase';

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      if (isRealSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        setNotifications(data || []);
      } else {
        const res = await mockDatabase.getUserNotifications(userId);
        setNotifications(res);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notifId: string) => {
    if (isRealSupabaseConfigured && supabase) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
    } else {
      await mockDatabase.markNotificationAsRead(notifId);
    }
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    refetch: fetchNotifications,
    markAsRead
  };
}
