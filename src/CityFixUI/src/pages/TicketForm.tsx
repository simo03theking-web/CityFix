import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import api from '@/services/api';

export default function TicketForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'roads',
    lat: 0,
    lon: 0,
    address: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tickets/create', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: {
          lat: formData.lat,
          lon: formData.lon,
          address: formData.address
        },
        tenant_id: user?.tenant_id || 'default',
        images: []
      }, {
        params: { user_id: user?.id }
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Nuova Segnalazione</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Titolo
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Descrizione
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="roads">Strade</option>
                <option value="lighting">Illuminazione</option>
                <option value="waste">Rifiuti</option>
                <option value="greenery">Verde Pubblico</option>
                <option value="other">Altro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Indirizzo
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Via, numero civico, città"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Invia Segnalazione
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}