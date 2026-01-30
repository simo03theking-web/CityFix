import { useEffect, useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { Notification } from '@/types';

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'info' | 'warning' | 'success' | 'error'>('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/notifications/user/${user?.id}`);
      setNotifications(response.data);
      applyFilter(response.data, filter);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    applyFilter(notifications, filter);
  }, [filter]);

  const applyFilter = (notificationList: Notification[], filterType: string) => {
    if (filterType === 'all') {
      setFilteredNotifications(notificationList);
    } else if (filterType === 'unread') {
      setFilteredNotifications(notificationList.filter(n => !n.read));
    } else {
      setFilteredNotifications(notificationList.filter(n => n.type === filterType));
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      await Promise.all(unreadIds.map(id => api.put(`/notifications/${id}/read`)));
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      info: '📘',
      warning: '⚠️',
      success: '✅',
      error: '❌',
    };
    return icons[type] || '📢';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      info: 'bg-blue-50 border-blue-200',
      warning: 'bg-yellow-50 border-yellow-200',
      success: 'bg-green-50 border-green-200',
      error: 'bg-red-50 border-red-200',
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Centro Notifiche</h1>
            <p className="text-gray-600 mt-2">
              {unreadCount > 0 ? `${unreadCount} notifiche non lette` : 'Nessuna notifica non letta'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Segna Tutte come Lette
            </button>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Tutte ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-md ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Non Lette ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('info')}
            className={`px-4 py-2 rounded-md ${
              filter === 'info'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Info
          </button>
          <button
            onClick={() => setFilter('success')}
            className={`px-4 py-2 rounded-md ${
              filter === 'success'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Successo
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`px-4 py-2 rounded-md ${
              filter === 'warning'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Avvisi
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`px-4 py-2 rounded-md ${
              filter === 'error'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Errori
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Caricamento notifiche...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">Nessuna notifica trovata</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 ${getTypeColor(notification.type)} ${
                  notification.read ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                      <span className="text-xs font-medium uppercase text-gray-600">
                        {notification.type}
                      </span>
                      {!notification.read && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                          Nuovo
                        </span>
                      )}
                    </div>
                    <p className="text-gray-900 mb-2">{notification.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{new Date(notification.created_at).toLocaleString('it-IT')}</span>
                      {notification.ticket_id && (
                        <Link
                          to={`/tickets/${notification.ticket_id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Visualizza Ticket →
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        title="Segna come letto"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      title="Elimina"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
