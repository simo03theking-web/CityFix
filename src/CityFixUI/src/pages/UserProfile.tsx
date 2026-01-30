import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import api from '@/services/api';

export default function UserProfile() {
  const { user, logout } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      if (user?.role === 'citizen') {
        try {
          const response = await api.get(`/tickets/list`, {
            params: { user_id: user.id }
          });
          const tickets = response.data;
          setStats({
            total: tickets.length,
            pending: tickets.filter((t: any) => t.status === 'pending').length,
            in_progress: tickets.filter((t: any) => t.status === 'in_progress').length,
            completed: tickets.filter((t: any) => t.status === 'completed').length,
          });
        } catch (err) {
          console.error('Failed to fetch stats:', err);
        }
      }
    };
    fetchStats();
  }, [user]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Le nuove password non corrispondono');
      return;
    }

    if (newPassword.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setSuccess('Password cambiata con successo');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Errore nel cambio password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      citizen: 'Cittadino',
      operator: 'Operatore',
      admin: 'Amministratore',
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profilo Utente</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Informazioni Account</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 text-gray-900">{user?.email}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ruolo</label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {getRoleLabel(user?.role || '')}
                  </span>
                </div>
              </div>

              {user?.tenant_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Municipalità</label>
                  <div className="mt-1 text-gray-900">{user.tenant_id}</div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Data Registrazione</label>
                <div className="mt-1 text-gray-900">
                  {new Date(user?.created_at || '').toLocaleDateString('it-IT')}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Cambia Password</h2>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                  {success}
                </div>
              )}

              <div>
                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                  Password Attuale
                </label>
                <input
                  id="oldPassword"
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  Nuova Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Conferma Nuova Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Salvataggio...' : 'Cambia Password'}
              </button>
            </form>
          </div>
        </div>

        {user?.role === 'citizen' && stats && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Le Mie Statistiche</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600 mt-1">Totali</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-800">{stats.pending}</div>
                <div className="text-sm text-gray-600 mt-1">In Attesa</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-800">{stats.in_progress}</div>
                <div className="text-sm text-gray-600 mt-1">In Corso</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-800">{stats.completed}</div>
                <div className="text-sm text-gray-600 mt-1">Completati</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
