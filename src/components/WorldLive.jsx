import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const CITIES = [
  { name: 'New York', tz: 'America/New_York', pos: [40.71, -74.0], cam: '' },
  { name: 'London', tz: 'Europe/London', pos: [51.5, -0.12], cam: '' },
  { name: 'Helsinki', tz: 'Europe/Helsinki', pos: [60.17, 24.94], cam: '' },
  { name: 'Tokyo', tz: 'Asia/Tokyo', pos: [35.68, 139.69], cam: '' },
  { name: 'Chennai', tz: 'Asia/Kolkata', pos: [13.08, 80.27], cam: '' },
  { name: 'Los Angeles', tz: 'America/Los_Angeles', pos: [34.05, -118.24], cam: '' },
];

const timeIn = (tz) =>
  new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(new Date());

export default function WorldLive() {
  const [, tick] = useState(0);
  const [cam, setCam] = useState(null);
  useEffect(() => { const i = setInterval(() => tick(x => x + 1), 1000); return () => clearInterval(i); }, []);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 8, marginBottom: 10 }}>
        {CITIES.map(c => (
          <div key={c.name} style={{ padding: 10, borderRadius: 12, background: '#111', color: '#fff' }}>
            <div style={{ fontSize: 13, opacity: .7 }}>{c.name}</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{timeIn(c.tz)}</div>
          </div>
        ))}
      </div>

      <MapContainer center={[25, 20]} zoom={2} style={{ height: 380, borderRadius: 12 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {CITIES.map(c => (
          <Marker key={c.name} position={c.pos}>
            <Popup>
              <b>{c.name}</b><br />{timeIn(c.tz)}<br />
              {c.cam && <button onClick={() => setCam(c)}>Live camera</button>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {cam && (
        <iframe title={cam.name} src={cam.cam} allow="autoplay; encrypted-media" allowFullScreen
          style={{ width: '100%', height: 320, border: 0, borderRadius: 12, marginTop: 10 }} />
      )}
    </div>
  );
}