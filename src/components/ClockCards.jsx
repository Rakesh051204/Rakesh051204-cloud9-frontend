import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CITY = {
  'new york': { tz: 'America/New_York', wiki: 'New_York_City', pos: [40.7128, -74.006] },
  chicago: { tz: 'America/Chicago', wiki: 'Chicago', pos: [41.8781, -87.6298] },
  denver: { tz: 'America/Denver', wiki: 'Denver', pos: [39.7392, -104.9903] },
  'los angeles': { tz: 'America/Los_Angeles', wiki: 'Los_Angeles', pos: [34.0522, -118.2437] },
  toronto: { tz: 'America/Toronto', wiki: 'Toronto', pos: [43.6532, -79.3832] },
  london: { tz: 'Europe/London', wiki: 'London', pos: [51.5072, -0.1276] },
  paris: { tz: 'Europe/Paris', wiki: 'Paris', pos: [48.8566, 2.3522] },
  helsinki: { tz: 'Europe/Helsinki', wiki: 'Helsinki', pos: [60.1699, 24.9384] },
  dubai: { tz: 'Asia/Dubai', wiki: 'Dubai', pos: [25.2048, 55.2708] },
  chennai: { tz: 'Asia/Kolkata', wiki: 'Chennai', pos: [13.0827, 80.2707] },
  mumbai: { tz: 'Asia/Kolkata', wiki: 'Mumbai', pos: [19.076, 72.8777] },
  delhi: { tz: 'Asia/Kolkata', wiki: 'Delhi', pos: [28.6139, 77.209] },
  tokyo: { tz: 'Asia/Tokyo', wiki: 'Tokyo', pos: [35.6762, 139.6503] },
  singapore: { tz: 'Asia/Singapore', wiki: 'Singapore', pos: [1.3521, 103.8198] },
  sydney: { tz: 'Australia/Sydney', wiki: 'Sydney', pos: [-33.8688, 151.2093] },
};

// Live cameras to show inside the app. Add lines like:
// 'new york': 'https://www.youtube.com/embed/live_stream?channel=UCxxxxxxxxxxxxxxxxxxxxxx',
const CAMS = {};

const photoCache = {};
function getPhoto(wiki) {
  if (!photoCache[wiki]) {
    photoCache[wiki] = fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + wiki)
      .then(r => r.json())
      .then(j => (j.thumbnail && j.thumbnail.source) || '')
      .catch(() => '');
  }
  return photoCache[wiki];
}

const GRADS = [
  'linear-gradient(135deg,#1e3a8a,#38bdf8)', 'linear-gradient(135deg,#7c2d12,#fb923c)',
  'linear-gradient(135deg,#14532d,#4ade80)', 'linear-gradient(135deg,#581c87,#c084fc)',
];

function badge(h) {
  if (h < 4) return ['Night', '#818cf8', '#1e1b4b'];
  if (h < 7) return ['Early morning', '#4ade80', '#052e16'];
  if (h < 12) return ['Morning', '#4ade80', '#052e16'];
  if (h < 17) return ['Afternoon', '#fbbf24', '#451a03'];
  if (h < 21) return ['Evening', '#fb923c', '#431407'];
  return ['Night', '#818cf8', '#1e1b4b'];
}

function read(tz) {
  const d = new Date();
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true,
  }).format(d);
  const h = Number(new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hour12: false }).format(d)) % 24;
  let zone = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'long' })
    .formatToParts(d).find(x => x.type === 'timeZoneName')?.value || tz;
  if (/^(Eastern|Central|Mountain|Pacific|Alaska|Hawaii)/.test(zone)) zone = zone.replace(/ (Daylight|Standard)/, '');
  return { time, h, zone };
}

const dot = (on) => L.divIcon({
  className: '',
  html: '<div style="width:' + (on ? 18 : 12) + 'px;height:' + (on ? 18 : 12) + 'px;border-radius:50%;background:' +
    (on ? '#22c55e' : '#3b82f6') + ';border:2px solid #fff;box-shadow:0 0 10px ' + (on ? '#22c55e' : '#3b82f6') + '"></div>',
  iconSize: [18, 18], iconAnchor: [9, 9],
});

function Fly({ pos }) {
  const map = useMap();
  useEffect(() => { map.flyTo(pos, 5, { duration: 1.2 }); }, [pos, map]);
  return null;
}

function Row({ it, i, active, onPick }) {
  const [photo, setPhoto] = useState('');
  useEffect(() => {
    let on = true;
    getPhoto(it.wiki).then(u => { if (on) setPhoto(u); });
    return () => { on = false; };
  }, [it.wiki]);
  const r = read(it.tz);
  const [label, fg, bg] = badge(r.h);
  return (
    <div onClick={() => onPick(it.key)} style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: 12, cursor: 'pointer',
      borderTop: i ? '1px solid #1f1f1f' : 'none', background: active ? '#16202a' : 'transparent',
    }}>
      <div style={{
        width: 76, height: 76, borderRadius: 14, flexShrink: 0,
        background: photo ? 'url(' + photo + ') center/cover' : GRADS[i % GRADS.length],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,.85)', fontSize: 30, fontWeight: 700,
      }}>{!photo && it.name.slice(0, 1)}</div>
      <div>
        <div style={{ color: '#fff', fontSize: 16 }}>
          <b>{it.name}</b> <span style={{ fontSize: 13, opacity: .6 }}>{r.zone}</span>
        </div>
        <div style={{ color: '#fff', fontSize: 28, fontWeight: 600, fontVariantNumeric: 'tabular-nums', margin: '2px 0 6px' }}>
          {r.time.replace(/ (AM|PM)$/, '')} <span style={{ fontSize: 16 }}>{r.time.slice(-2)}</span>
        </div>
        <span style={{ background: bg, color: fg, fontSize: 12, padding: '3px 10px', borderRadius: 999 }}>{label}</span>
      </div>
    </div>
  );
}

export default function ClockCards({ clocks = [] }) {
  const [, tick] = useState(0);
  const [sel, setSel] = useState('');
  useEffect(() => {
    if (!clocks.length) return;
    const i = setInterval(() => tick(x => x + 1), 1000);
    return () => clearInterval(i);
  }, [clocks.length]);

  const items = (clocks || []).map(c => {
    const name = c.city || c.name || '';
    const key = name.toLowerCase();
    const info = CITY[key] || {};
    return {
      name, key,
      tz: c.tz || c.timezone || info.tz,
      wiki: c.wiki || info.wiki || name.replace(/ /g, '_'),
      pos: c.lat != null ? [c.lat, c.lng] : info.pos,
    };
  }).filter(x => x.tz);

  if (!items.length) return null;
  const active = items.find(x => x.key === sel) || items[0];
  const withPos = items.filter(x => x.pos);
  const cam = CAMS[active.key];
  const camSearch = 'https://www.youtube.com/results?search_query=' +
    encodeURIComponent(active.name + ' live cam') + '&sp=EgJAAQ%3D%3D';

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '12px 0', maxWidth: 940 }}>
      <div style={{
        flex: '0 1 380px', minWidth: 300, maxHeight: 440, overflowY: 'auto',
        border: '1px solid #2a2a2a', borderRadius: 16, background: '#0b0b0b',
      }}>
        {items.map((it, i) => (
          <Row key={it.key + i} it={it} i={i} active={it.key === active.key} onPick={setSel} />
        ))}
      </div>

      <div style={{ flex: '1 1 320px', minWidth: 280 }}>
        <style>{'.dark-tiles{filter:invert(1) hue-rotate(180deg) brightness(.9) contrast(.9);}'}</style>
        {active.pos && (
          <MapContainer center={active.pos} zoom={4} style={{ height: 300, borderRadius: 16, background: '#0b0b0b' }}>
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" className="dark-tiles"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Fly pos={active.pos} />
            {withPos.map(it => (
              <Marker key={it.key} position={it.pos} icon={dot(it.key === active.key)}
                eventHandlers={{ click: () => setSel(it.key) }}>
                <Popup>{it.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        <div style={{ marginTop: 10, border: '1px solid #2a2a2a', borderRadius: 16, background: '#0b0b0b', overflow: 'hidden' }}>
          <div style={{ color: '#fff', padding: '10px 14px', fontSize: 14 }}>
            <span style={{ color: '#ef4444' }}>● LIVE</span> {active.name} camera
          </div>
          {cam ? (
            <iframe title={active.name} src={cam} allow="autoplay; encrypted-media" allowFullScreen
              style={{ width: '100%', height: 240, border: 0, display: 'block' }} />
          ) : (
            <div style={{ padding: '0 14px 14px' }}>
              <a href={camSearch} target="_blank" rel="noreferrer" style={{
                display: 'inline-block', background: '#dc2626', color: '#fff',
                padding: '8px 14px', borderRadius: 10, textDecoration: 'none', fontSize: 14,
              }}>Watch {active.name} live cam</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}