import { useEffect, useState, useRef } from 'react';
import { Ticket } from '@/types';

interface TicketMapProps {
  tickets: Ticket[];
  center?: { lat: number; lon: number };
  zoom?: number;
  onTicketClick?: (ticket: Ticket) => void;
  showFilters?: boolean;
}

export default function TicketMap({
  tickets,
  center = { lat: 41.9028, lon: 12.4964 },
  zoom = 13,
  onTicketClick,
  showFilters = true,
}: TicketMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).L && mapRef.current && !map) {
      const L = (window as any).L;

      const leafletMap = L.map(mapRef.current).setView([center.lat, center.lon], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(leafletMap);

      setMap(leafletMap);
    }
  }, [mapRef.current]);

  useEffect(() => {
    if (map && (window as any).L) {
      const L = (window as any).L;

      markers.forEach((marker) => marker.remove());

      const filteredTickets = tickets.filter((ticket) => {
        if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
        if (categoryFilter !== 'all' && ticket.category !== categoryFilter) return false;
        return true;
      });

      const newMarkers = filteredTickets.map((ticket) => {
        const color = getMarkerColor(ticket.status);
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${color};
              width: 30px;
              height: 30px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 16px;
            ">
              ${getStatusIcon(ticket.status)}
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([ticket.location.lat, ticket.location.lon], { icon })
          .addTo(map)
          .bindPopup(
            `
            <div style="min-width: 200px;">
              <h3 style="font-weight: bold; margin-bottom: 8px;">${ticket.title}</h3>
              <p style="color: #666; margin-bottom: 8px; font-size: 14px;">${ticket.description.substring(0, 100)}...</p>
              <div style="margin-bottom: 8px;">
                <span style="
                  background-color: ${color};
                  color: white;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 12px;
                  display: inline-block;
                ">${getStatusLabel(ticket.status)}</span>
              </div>
              <a href="/tickets/${ticket.id}" style="
                color: #2563eb;
                text-decoration: none;
                font-size: 14px;
              ">Visualizza dettagli →</a>
            </div>
          `
          );

        marker.on('click', () => {
          if (onTicketClick) {
            onTicketClick(ticket);
          }
        });

        return marker;
      });

      setMarkers(newMarkers);

      if (filteredTickets.length > 0) {
        const bounds = L.latLngBounds(
          filteredTickets.map((t) => [t.location.lat, t.location.lon])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [tickets, map, statusFilter, categoryFilter]);

  const getMarkerColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#eab308',
      in_progress: '#3b82f6',
      completed: '#22c55e',
      rejected: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pending: '⏳',
      in_progress: '🔧',
      completed: '✓',
      rejected: '✗',
    };
    return icons[status] || '📍';
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

  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          
          if (map && (window as any).L) {
            const L = (window as any).L;
            map.setView([location.lat, location.lon], 15);

            L.marker([location.lat, location.lon], {
              icon: L.divIcon({
                className: 'user-location-marker',
                html: `
                  <div style="
                    background-color: #2563eb;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.5);
                  "></div>
                `,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              }),
            })
              .addTo(map)
              .bindPopup('La tua posizione');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Impossibile ottenere la tua posizione');
        }
      );
    } else {
      alert('Geolocalizzazione non supportata dal browser');
    }
  };

  const categories = Array.from(new Set(tickets.map((t) => t.category)));

  return (
    <div className="relative">
      {showFilters && (
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tutti gli stati</option>
            <option value="pending">In Attesa</option>
            <option value="in_progress">In Corso</option>
            <option value="completed">Completati</option>
            <option value="rejected">Rifiutati</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tutte le categorie</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button
            onClick={handleGetUserLocation}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            📍 La Mia Posizione
          </button>

          <div className="ml-auto text-sm text-gray-600">
            {tickets.filter((t) => {
              if (statusFilter !== 'all' && t.status !== statusFilter) return false;
              if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
              return true;
            }).length}{' '}
            ticket visualizzati
          </div>
        </div>
      )}

      <div ref={mapRef} className="w-full h-96 rounded-lg shadow-lg border border-gray-300" />

      <div className="mt-4 flex gap-4 flex-wrap text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          <span>In Attesa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span>In Corso</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>Completato</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span>Rifiutato</span>
        </div>
      </div>
    </div>
  );
}
