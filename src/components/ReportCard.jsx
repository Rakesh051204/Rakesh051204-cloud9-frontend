import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const FILES = [['Word', 'docx'], ['PDF', 'pdf'], ['Excel', 'xlsx']];
const FONT = 'Segoe UI, Arial, sans-serif';

function FileLogo({ type, size = 22 }) {
  const s = Math.round(size * 1.3);
  if (type === 'docx') return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <rect x="10" y="3" width="19" height="26" rx="3" fill="#fff" />
      <rect x="15" y="9" width="10" height="2.4" rx="1.2" fill="#41a5ee" />
      <rect x="15" y="14" width="10" height="2.4" rx="1.2" fill="#2b7cd3" />
      <rect x="15" y="19" width="10" height="2.4" rx="1.2" fill="#185abd" />
      <rect x="2" y="8" width="17" height="17" rx="3" fill="#185abd" />
      <text x="10.5" y="21" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff" fontFamily={FONT}>W</text>
    </svg>
  );
  if (type === 'pdf') return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <path d="M7 2h14l7 7v19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#e5252a" />
      <path d="M21 2l7 7h-5a2 2 0 0 1-2-2z" fill="#f59a9d" />
      <text x="16" y="23" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#fff" fontFamily={FONT}>PDF</text>
    </svg>
  );
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <rect x="10" y="3" width="19" height="26" rx="3" fill="#fff" />
      <rect x="15" y="8" width="10" height="3" fill="#33c481" />
      <rect x="15" y="13" width="10" height="3" fill="#21a366" />
      <rect x="15" y="18" width="10" height="3" fill="#107c41" />
      <rect x="2" y="8" width="17" height="17" rx="3" fill="#107c41" />
      <text x="10.5" y="21" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff" fontFamily={FONT}>X</text>
    </svg>
  );
}

function Icon({ color, letter, size = 26 }) {
  return (
    <div style={{ width: size, height: Math.round(size * 1.18), borderRadius: 6, background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: Math.round(size * 0.5), flexShrink: 0 }}>{letter}</div>
  );
}

function FileButtons({ files, size = 20 }) {
  return (
    <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
      {FILES.map(([name, key]) => (
        <a key={key} href={files[key]} title={'Download ' + name} style={{ textDecoration: 'none', display: 'flex' }}>
          <FileLogo type={key} size={size} />
        </a>
      ))}
    </div>
  );
}

const btn = { background: 'transparent', border: 0, color: '#9ca3af', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center' };
const ico = { width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
const th = { textAlign: 'left', padding: '9px 10px', fontSize: 12, color: '#9ca3af', fontWeight: 600, position: 'sticky', top: 0, background: '#141414', borderBottom: '1px solid #2a2a2a' };
const td = { padding: '10px', fontSize: 13, color: '#e5e7eb', borderBottom: '1px solid #232323', verticalAlign: 'top' };

function Doc({ report }) {
  return (
    <div>
      <div style={{ color: '#e5e7eb', fontSize: 13, fontWeight: 600 }}>
        Search checked: {report.checkedAt} | Rows in this report: {report.rows.length}
      </div>
      <div style={{ borderLeft: '3px solid #404040', padding: '4px 12px', margin: '12px 0', color: '#9ca3af', fontSize: 12.5 }}>{report.note}</div>
      <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '18px 0 8px' }}>Summary</div>
      <div style={{ color: '#d1d5db', fontSize: 14, lineHeight: 1.6 }}>{report.summary}</div>
      <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '22px 0 10px' }}>Job applications</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <thead>
            <tr>{['#', 'Company', 'Role', 'Location', 'Source', 'Posted', 'Match', 'Apply'].map((h) => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {report.rows.map((x) => (
              <tr key={x.url}>
                <td style={td}>{x.n}</td>
                <td style={td}>{x.company}</td>
                <td style={td}>{x.title}</td>
                <td style={td}>{x.location}</td>
                <td style={td}>{x.source}</td>
                <td style={td}>{x.posted}</td>
                <td style={td}>{x.match != null ? x.match + '%' : ''}</td>
                <td style={td}>
                  <a href={x.url} target="_blank" rel="noreferrer" style={{ color: '#4da3ff', textDecoration: 'none', whiteSpace: 'nowrap' }}>Apply ↗</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const panelWidth = () => Math.min(440, Math.round(window.innerWidth * 0.36));

export default function ReportCard({ report }) {
  const [open, setOpen] = useState(false);
  const [full, setFull] = useState(false);
  const [side, setSide] = useState(true);
  const [w, setW] = useState(panelWidth);

  useEffect(() => {
    const onResize = () => setW(panelWidth());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (full) setFull(false); else setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, full]);

  useEffect(() => {
    const r = document.getElementById('root');
    if (!r) return;
    const push = open && !full && window.innerWidth >= 1000;
    r.style.transition = 'margin-right .2s';
    r.style.marginRight = push ? w + 'px' : '0px';
    return () => { r.style.marginRight = '0px'; };
  }, [open, full, w]);

  if (!report || !report.rows || !report.rows.length) return null;
  const f = report.files || {};
  const base = (report.title || 'report').replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '');
  const close = () => { setOpen(false); setFull(false); };

  const panelStyle = full
    ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw' }
    : { position: 'fixed', top: 0, right: 0, bottom: 0, width: window.innerWidth >= 1000 ? w : 'min(440px,100vw)', borderLeft: '1px solid #2f2f2f', boxShadow: '-8px 0 30px rgba(0,0,0,.4)' };

  return (
    <>
      <div onClick={() => setOpen(true)} style={{ cursor: 'pointer', border: '1px solid #2f2f2f', borderRadius: 16, background: '#171717', margin: '12px 0', maxWidth: 760, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid #2a2a2a' }}>
          <Icon color="#3b82f6" letter="≡" size={24} />
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, flex: 1 }}>{report.title}</div>
          <FileButtons files={f} />
        </div>
        <div style={{ padding: '14px 16px', maxHeight: 190, overflow: 'hidden', position: 'relative' }}>
          <div style={{ color: '#e5e7eb', fontSize: 12.5, fontWeight: 600 }}>
            Search checked: {report.checkedAt} | Rows in this report: {report.rows.length}
          </div>
          <div style={{ borderLeft: '3px solid #404040', padding: '2px 12px', margin: '10px 0', color: '#9ca3af', fontSize: 12 }}>{report.note}</div>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '12px 0 4px' }}>Summary</div>
          <div style={{ color: '#d1d5db', fontSize: 13 }}>{report.summary}</div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 50, background: 'linear-gradient(transparent,#171717)' }} />
        </div>
      </div>

      {open && createPortal(
        <div style={{ ...panelStyle, background: '#141414', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: '1px solid #2a2a2a' }}>
            <Icon color="#3b82f6" letter="≡" size={20} />
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{report.title}</div>
            <FileButtons files={f} size={18} />
            {full && (
              <button style={btn} onClick={() => setSide(!side)} title={side ? 'Hide files' : 'Show files'}>
                <svg viewBox="0 0 24 24" style={ico}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M15 4v16" /></svg>
              </button>
            )}
            <button style={btn} onClick={() => setFull(!full)} title={full ? 'Exit full screen' : 'Full screen'}>
              <svg viewBox="0 0 24 24" style={ico}>
                {full ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
              </svg>
            </button>
            <button style={btn} onClick={close} title="Close">
              <svg viewBox="0 0 24 24" style={ico}><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: full ? '24px 5vw' : 16 }}>
              <div style={{ maxWidth: full ? 1000 : 'none', margin: '0 auto' }}>
                <Doc report={report} />
              </div>
            </div>
            {full && side && (
              <div style={{ width: 240, borderLeft: '1px solid #2a2a2a', padding: 14, overflowY: 'auto' }}>
                <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Files in this task</div>
                {FILES.map(([name, key]) => (
                  <a key={key} href={f[key]} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 8, textDecoration: 'none', color: '#e5e7eb', fontSize: 13 }}>
                    <FileLogo type={key} size={18} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{base + '.' + key}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}