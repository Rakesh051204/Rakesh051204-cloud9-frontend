import { useEffect } from 'react';

const btn = { background: 'transparent', color: '#d8d8d4', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '4px 10px', fontSize: 12, cursor: 'pointer', textDecoration: 'none' };

export default function AttachmentPreview({ file, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!file) return null;
  const type = file.type || '';
  const kind = type.startsWith('video') ? 'video' : type.startsWith('image') ? 'image' : 'file';
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '92vw', maxHeight: '88vh', background: '#0d0d0c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, color: '#d8d8d4', fontSize: 13 }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
          <span style={{ display: 'flex', gap: 8 }}>
            {file.url && <a href={file.url} download={file.name} style={btn}>Download</a>}
            <button onClick={onClose} style={btn}>Close</button>
          </span>
        </div>
        {kind === 'image' && <img src={file.url} alt={file.name} style={{ maxWidth: '100%', maxHeight: '76vh', objectFit: 'contain', borderRadius: 8 }} />}
        {kind === 'video' && <video src={file.url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '76vh', borderRadius: 8 }} />}
        {kind === 'file' && <div style={{ padding: '32px 24px', color: '#9a9a94', fontSize: 14 }}>No preview for this file type. Use Download.</div>}
      </div>
    </div>
  );
}