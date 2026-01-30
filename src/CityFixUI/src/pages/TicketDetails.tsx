import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Ticket } from '@/types';

export default function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await api.get(`/tickets/${id}`);
        setTicket(response.data);
      } catch (error) {
        console.error('Failed to fetch ticket:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;
  }

  if (!ticket) {
    return <div className="min-h-screen flex items-center justify-center">Ticket non trovato</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Torna alla Dashboard
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{ticket.title}</h1>
            <div className="flex items-center space-x-4">
              <span
                className={`px-3 py-1 text-sm rounded ${
                  ticket.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : ticket.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {ticket.status}
              </span>
              <span className="text-sm text-gray-600">{ticket.category}</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Descrizione</h3>
            <p className="text-gray-700">{ticket.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Posizione</h3>
            <p className="text-gray-700">{ticket.location.address || `${ticket.location.lat}, ${ticket.location.lon}`}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Dettagli</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Creato: {new Date(ticket.created_at).toLocaleString()}</p>
              <p>Aggiornato: {new Date(ticket.updated_at).toLocaleString()}</p>
            </div>
          </div>

          {ticket.comments && ticket.comments.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Commenti</h3>
              <div className="space-y-3">
                {ticket.comments.map((comment, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded">
                    <p className="text-gray-700">{comment.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}