import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '@/types';

interface MapProps {
  center: Location;
  markers?: { location: Location; title: string }[];
  zoom?: number;
}

export default function Map({ center, markers = [], zoom = 13 }: MapProps) {
  return (
    <MapContainer
      center={[center.lat, center.lon]}
      zoom={zoom}
      className="h-96 w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker, index) => (
        <Marker key={index} position={[marker.location.lat, marker.location.lon]}>
          <Popup>{marker.title}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}