import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Stats } from '@/types';

interface MunicipalityStats {
  municipality_id: string;
  municipality_name: string;
  total_tickets: number;
  pending_tickets: number;
  in_progress_tickets: number;
  completed_tickets: number;
  avg_resolution_time: number;
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [municipalityStats, setMunicipalityStats] = useState<MunicipalityStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const [globalStatsRes, municipalitiesRes] = await Promise.all([
        api.get('/admin/stats', { params }),
        api.get('/admin/municipalities/stats', { params })
      ]);

      setStats(globalStatsRes.data);
      setMunicipalityStats(municipalitiesRes.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Municipalità',
      'Ticket Totali',
      'In Attesa',
      'In Corso',
      'Completati',
      'Tempo Medio Risoluzione (ore)'
    ];

    const rows = municipalityStats.map(m => [
      m.municipality_name,
      m.total_tickets,
      m.pending_tickets,
      m.in_progress_tickets,
      m.completed_tickets,
      m.avg_resolution_time.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cityfix-stats-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Caricamento statistiche...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Statistiche Amministratore</h1>
            <p className="text-gray-600 mt-2">Dashboard comparativa delle municipalità</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            📊 Esporta CSV
          </button>
        </div>

        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3 text-gray-900">Filtri per Data</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Inizio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fine
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {stats && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-gray-900">{stats.total_tickets}</div>
              <div className="text-sm text-gray-600 mt-1">Ticket Totali</div>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-yellow-800">{stats.pending_tickets}</div>
              <div className="text-sm text-gray-600 mt-1">In Attesa</div>
            </div>
            <div className="bg-blue-50 rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-blue-800">{stats.in_progress_tickets}</div>
              <div className="text-sm text-gray-600 mt-1">In Corso</div>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-green-800">{stats.completed_tickets}</div>
              <div className="text-sm text-gray-600 mt-1">Completati</div>
            </div>
          </div>
        )}

        {stats && (
          <div className="mb-6 grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Ticket per Categoria</h2>
              <div className="space-y-2">
                {Object.entries(stats.tickets_by_category).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">{category}</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Ticket per Municipalità</h2>
              <div className="space-y-2">
                {Object.entries(stats.tickets_by_municipality).map(([municipality, count]) => (
                  <div key={municipality} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">{municipality}</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Performance per Municipalità</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Municipalità
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Totali
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    In Attesa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    In Corso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completati
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tempo Medio (ore)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasso Completamento
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {municipalityStats.map((municipality) => {
                  const completionRate = municipality.total_tickets > 0
                    ? ((municipality.completed_tickets / municipality.total_tickets) * 100).toFixed(1)
                    : '0';

                  return (
                    <tr key={municipality.municipality_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {municipality.municipality_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {municipality.total_tickets}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          {municipality.pending_tickets}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {municipality.in_progress_tickets}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {municipality.completed_tickets}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {municipality.avg_resolution_time.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{completionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
