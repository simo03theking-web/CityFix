import { useEffect, useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import api from '@/services/api';
import { Ticket } from '@/types';

interface Operator {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function MunicipalityManagement() {
  const { user } = useAuth();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddOperator, setShowAddOperator] = useState(false);
  const [newOperatorEmail, setNewOperatorEmail] = useState('');
  const [newOperatorPassword, setNewOperatorPassword] = useState('');
  const [error, setError] = useState('');
  const [assignTicketId, setAssignTicketId] = useState<string | null>(null);
  const [selectedOperator, setSelectedOperator] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [operatorsRes, ticketsRes] = await Promise.all([
        api.get('/auth/users', {
          params: { tenant_id: user?.tenant_id, role: 'operator' }
        }),
        api.get('/tickets/list', {
          params: { tenant_id: user?.tenant_id }
        })
      ]);
      setOperators(operatorsRes.data);
      setTickets(ticketsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/auth/register', {
        email: newOperatorEmail,
        password: newOperatorPassword,
        role: 'operator',
        tenant_id: user?.tenant_id,
      });
      setNewOperatorEmail('');
      setNewOperatorPassword('');
      setShowAddOperator(false);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Errore durante la creazione dell\'operatore');
    }
  };

  const handleAssignTicket = async () => {
    if (!assignTicketId || !selectedOperator) return;

    try {
      await api.put(`/tickets/${assignTicketId}/assign`, {
        assigned_to: selectedOperator,
        status: 'in_progress'
      });
      setAssignTicketId(null);
      setSelectedOperator('');
      await fetchData();
    } catch (error) {
      console.error('Failed to assign ticket:', error);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'In Attesa',
      in_progress: 'In Corso',
      completed: 'Completato',
      rejected: 'Rifiutato',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestione Municipalità</h1>
          <p className="text-gray-600 mt-2">Gestisci operatori e ticket della tua municipalità</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Operatori</h2>
              <button
                onClick={() => setShowAddOperator(!showAddOperator)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                + Aggiungi Operatore
              </button>
            </div>

            {showAddOperator && (
              <form onSubmit={handleAddOperator} className="mb-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-3">Nuovo Operatore</h3>
                {error && (
                  <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={newOperatorEmail}
                      onChange={(e) => setNewOperatorEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newOperatorPassword}
                      onChange={(e) => setNewOperatorPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Crea
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddOperator(false);
                        setError('');
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {operators.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  Nessun operatore trovato
                </p>
              ) : (
                operators.map((operator) => (
                  <div
                    key={operator.id}
                    className="p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{operator.email}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Registrato il {new Date(operator.created_at).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        Operatore
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ticket della Municipalità</h2>
            
            <div className="mb-4 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-yellow-50 rounded-md">
                <div className="text-2xl font-bold text-yellow-800">
                  {tickets.filter(t => t.status === 'pending').length}
                </div>
                <div className="text-xs text-gray-600">In Attesa</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-md">
                <div className="text-2xl font-bold text-blue-800">
                  {tickets.filter(t => t.status === 'in_progress').length}
                </div>
                <div className="text-xs text-gray-600">In Corso</div>
              </div>
              <div className="p-3 bg-green-50 rounded-md">
                <div className="text-2xl font-bold text-green-800">
                  {tickets.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-xs text-gray-600">Completati</div>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tickets.filter(t => t.status !== 'completed').map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 border border-gray-200 rounded-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{ticket.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{ticket.category}</p>
                  
                  {!ticket.assigned_to && ticket.status === 'pending' && (
                    <button
                      onClick={() => setAssignTicketId(ticket.id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Assegna Operatore
                    </button>
                  )}
                  
                  {ticket.assigned_to && (
                    <p className="text-sm text-gray-500">
                      Assegnato a: {operators.find(op => op.id === ticket.assigned_to)?.email || 'N/A'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {assignTicketId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Assegna Ticket</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleziona Operatore
              </label>
              <select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleziona un operatore</option>
                {operators.map((operator) => (
                  <option key={operator.id} value={operator.id}>
                    {operator.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setAssignTicketId(null);
                  setSelectedOperator('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Annulla
              </button>
              <button
                onClick={handleAssignTicket}
                disabled={!selectedOperator}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Assegna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
