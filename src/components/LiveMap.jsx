import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon (Leaflet + bundlers issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function LiveMap({ mapData }) {
  if (!mapData) return null;

  const { type, center, places = [], label } = mapData;

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        margin: '12px 0',
        height: 320,
      }}
    >
      <MapContainer
        center={[center.lat, center.lon]}
        zoom={type === 'nearby' ? 14 : 15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {type === 'single' && (
          <Marker position={[center.lat, center.lon]}>
            <Popup>{label}</Popup>
          </Marker>
        )}

        {type === 'nearby' && (
          <>
            <Circle
              center={[center.lat, center.lon]}
              radius={2000}
              pathOptions={{ color: '#7C83DB', fillOpacity: 0.05 }}
            />
            {places.map((p, i) => (
              <Marker key={i} position={[p.lat, p.lon]}>
                <Popup>
                  <strong>{p.name}</strong>
                  {p.address && <div>{p.address}</div>}
                </Popup>
              </Marker>
            ))}
          </>
        )}
      </MapContainer>
    </div>
  );
}