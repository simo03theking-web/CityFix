import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Ticket, STATUS_INFO, CATEGORY_INFO } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Fix default marker icon issue with webpack
// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons based on status
const createMarkerIcon = (status: string) => {
  const colors: Record<string, string> = {
    received: '#0ea5e9',
    in_progress: '#f59e0b',
    resolved: '#22c55e',
  };
  
  const color = colors[status] || '#64748b';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

interface TicketMapProps {
  tickets: Ticket[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  onTicketClick?: (ticket: Ticket) => void;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

export function TicketMap({ 
  tickets, 
  center = [40.6824, 14.7681], // Salerno default
  zoom = 14,
  className,
  onTicketClick 
}: TicketMapProps) {
  return (
    <div className={cn('rounded-lg overflow-hidden border border-border relative z-0', className)}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', minHeight: '400px', zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} />
        
        {tickets.map((ticket) => {
          // PROTEZIONE CRASHS: Se manca la location o lat/lng, salta questo ticket
          if (!ticket.location || 
              typeof ticket.location.lat !== 'number' || 
              typeof ticket.location.lng !== 'number') {
            return null;
          }

          return (
            <Marker
              key={ticket.id}
              position={[ticket.location.lat, ticket.location.lng]}
              icon={createMarkerIcon(ticket.status)}
              eventHandlers={{
                click: () => onTicketClick?.(ticket),
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <h3 className="font-semibold text-sm mb-1">{ticket.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {ticket.location.address || 'Indirizzo non disponibile'}
                  </p>
                  <div className="flex gap-2">
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ borderColor: STATUS_INFO[ticket.status].color, color: STATUS_INFO[ticket.status].color }}
                    >
                      {STATUS_INFO[ticket.status].label}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {CATEGORY_INFO[ticket.category]?.label || ticket.category}
                    </Badge>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}