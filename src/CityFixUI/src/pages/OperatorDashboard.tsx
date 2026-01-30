import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import api from '@/services/api';
import { Ticket } from '@/types';

export default function OperatorDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [report, setReport] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tickets/list', {
        params: { tenant_id: user?.tenant_id }
      });
      setTickets(response.data);
      applyFilter(response.data, filter);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  useEffect(() => {
    applyFilter(tickets, filter);
  }, [filter]);

  const applyFilter = (ticketList: Ticket[], filterType: string) => {
    if (filterType === 'all') {
      setFilteredTickets(ticketList);
    } else if (filterType === 'assigned') {
      setFilteredTickets(ticketList.filter(t => t.assigned_to === user?.id));
    } else {
      setFilteredTickets(ticketList.filter(t => t.status === filterType));
    }
  };

  const handleTakeTicket = async (ticketId: string) => {
    try {
      await api.put(`/tickets/${ticketId}/assign`, {
        assigned_to: user?.id,
        status: 'in_progress'
      });
      await fetchTickets();
    } catch (error) {
      console.error('Failed to take ticket:', error);
    }
  };

  const handleCompleteTicket = async (ticketId: string) => {
    try {
      await api.put(`/tickets/${ticketId}/status`, {
        status: 'completed'
      });
      await fetchTickets();
    } catch (error) {
      console.error('Failed to complete ticket:', error);
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedTicket || !report.trim()) return;

    try {
      await api.post(`/tickets/${selectedTicket}/comments`, {
        user_id: user?.id,
        message: `[RAPPORTO INTERVENTO] ${report}`,
      });
      setReport('');
      setShowReportModal(false);
      setSelectedTicket(null);
      await fetchTickets();
    } catch (error) {
      console.error('Failed to submit report:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Operatore</h1>
          <p className="text-gray-600 mt-2">Gestisci i ticket assegnati alla tua municipalità</p>
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
            Tutti ({tickets.length})
          </button>
          <button
            onClick={() => setFilter('assigned')}
            className={`px-4 py-2 rounded-md ${
              filter === 'assigned'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Assegnati a me ({tickets.filter(t => t.assigned_to === user?.id).length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            In Attesa ({tickets.filter(t => t.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 rounded-md ${
              filter === 'in_progress'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            In Corso ({tickets.filter(t => t.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-md ${
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Completati ({tickets.filter(t => t.status === 'completed').length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Caricamento ticket...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">Nessun ticket trovato</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {ticket.title}
                    </Link>
                    <p className="text-gray-600 mt-2">{ticket.description}</p>
                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Categoria: {ticket.category}</span>
                      <span>•</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString('it-IT')}</span>
                      {ticket.location.address && (
                        <>
                          <span>•</span>
                          <span>{ticket.location.address}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                    {getStatusLabel(ticket.status)}
                  </span>
                </div>

                <div className="flex gap-2">
                  {ticket.status === 'pending' && !ticket.assigned_to && (
                    <button
                      onClick={() => handleTakeTicket(ticket.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Prendi in Carico
                    </button>
                  )}
                  
                  {ticket.assigned_to === user?.id && ticket.status === 'in_progress' && (
                    <>
                      <button
                        onClick={() => handleCompleteTicket(ticket.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Marca come Completato
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket.id);
                          setShowReportModal(true);
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        Aggiungi Rapporto
                      </button>
                    </>
                  )}
                  
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Visualizza Dettagli
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Rapporto di Intervento</h2>
            <textarea
              value={report}
              onChange={(e) => setReport(e.target.value)}
              placeholder="Descrivi l'intervento effettuato..."
              className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedTicket(null);
                  setReport('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Annulla
              </button>
              <button
                onClick={handleSubmitReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Invia Rapporto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
