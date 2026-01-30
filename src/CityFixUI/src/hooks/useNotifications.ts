import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { Notification } from '@/types';
import { useAuth } from '@/store/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/notifications/user/${user.id}`);
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n: Notification) => !n.read).length);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch notifications');
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const markAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      await fetchNotifications();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to mark as read');
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      await Promise.all(unreadIds.map(id => api.put(`/notifications/${id}/read`)));
      await fetchNotifications();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to mark all as read');
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      await fetchNotifications();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete notification');
      console.error('Failed to delete notification:', err);
    }
  };

  const subscribeToNotifications = useCallback(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications();
    return unsubscribe;
  }, [subscribeToNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    getNotifications: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    subscribeToNotifications,
    unsubscribeFromNotifications: () => {},
  };
};

export default useNotifications;
