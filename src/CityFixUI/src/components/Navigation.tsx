import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';

export default function Navigation() {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const getNavigationItems = () => {
    if (!user) return [];

    const citizenItems = [
      { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
      { icon: '📋', label: 'I Miei Ticket', path: '/tickets' },
      { icon: '➕', label: 'Nuova Segnalazione', path: '/tickets/new' },
      { icon: '🔔', label: 'Notifiche', path: '/notifications' },
      { icon: '👤', label: 'Profilo', path: '/profile' },
    ];

    const operatorItems = [
      { icon: '📊', label: 'Dashboard Operatore', path: '/operator/dashboard' },
      { icon: '📋', label: 'Tutti i Ticket', path: '/tickets' },
      { icon: '🔔', label: 'Notifiche', path: '/notifications' },
      { icon: '👤', label: 'Profilo', path: '/profile' },
    ];

    const adminItems = [
      { icon: '📈', label: 'Statistiche', path: '/admin/stats' },
      { icon: '🏛️', label: 'Gestione Municipalità', path: '/municipality/management' },
      { icon: '📋', label: 'Tutti i Ticket', path: '/tickets' },
      { icon: '🔔', label: 'Notifiche', path: '/notifications' },
      { icon: '👤', label: 'Profilo', path: '/profile' },
    ];

    if (user.role === 'operator') return operatorItems;
    if (user.role === 'admin') return adminItems;
    return citizenItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <nav
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <span className="text-xl">🏛️</span>
              <span className="font-bold text-gray-900">CityFix</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-600"
            title={collapsed ? 'Espandi menu' : 'Riduci menu'}
          >
            <svg
              className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={collapsed ? item.label : ''}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {user && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {user.email.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="ml-3 overflow-hidden">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user.email}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
