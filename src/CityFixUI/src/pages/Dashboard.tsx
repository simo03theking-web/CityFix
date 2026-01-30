import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import api from '@/services/api';
import { Ticket } from '@/types';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/tickets/list', {
          params: { user_id: user?.id }
        });
        setTickets(response.data);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold">CityFix Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">I Miei Ticket</h2>
          <Link
            to="/tickets/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Nuova Segnalazione
          </Link>
        </div>

        {loading ? (
          <div>Caricamento...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">Nessuna segnalazione trovata</p>
            <Link
              to="/tickets/new"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800"
            >
              Crea la tua prima segnalazione
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-lg mb-2">{ticket.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {ticket.description}
                </p>
                <div className="flex justify-between items-center">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      ticket.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : ticket.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {ticket.status}
                  </span>
                  <span className="text-xs text-gray-500">{ticket.category}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}