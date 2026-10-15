import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

const COLORS = {
  bg: '#0d0d0c',
  panel: '#151513',
  border: 'rgba(255,255,255,0.08)',
  text: '#f2f1ee',
  subtext: 'rgba(242,241,238,0.55)',
  clay: '#CC785C',
  periwinkle: '#7C83DB',
};

export default function BrowserTakeover({
  wsUrl,
  agentName = 'Stoic',
  open,
  onRequestClose,
}) {
  const [stage, setStage] = useState('idle'); // 'idle' | 'confirm' | 'live'
  const [frameSrc, setFrameSrc] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [addressValue, setAddressValue] = useState('');
  const wsRef = useRef(null);
  const imgRef = useRef(null);
  const addressFocused = useRef(false);

  useEffect(() => {
    if (open) setStage('confirm');
  }, [open]);

  const connect = useCallback(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.type === 'frame') {
        setFrameSrc(`data:image/jpeg;base64,${msg.data}`);
      } else if (msg.type === 'nav') {
        setCurrentUrl(msg.url);
        if (!addressFocused.current) setAddressValue(msg.url);
      }
    };

    ws.onerror = (err) => {
      console.error('WS error:', err);
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return ws;
  }, [wsUrl]);

  const enterTakeover = () => {
    const ws = connect();
    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ type: 'enter-takeover' }));
    });
    setStage('live');
  };

  const exitTakeover = () => {
    wsRef.current?.send(JSON.stringify({ type: 'exit-takeover' }));
    wsRef.current?.close();
    setStage('idle');
    onRequestClose?.();
  };

  const send = (msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  // --- manual address bar / search ---------------------------------

  const submitAddress = () => {
    send({ type: 'goto', value: addressValue });
  };

  const handleAddressKeyDown = (e) => {
    e.stopPropagation(); // don't let this leak into the live-frame key forwarding
    if (e.key === 'Enter') {
      submitAddress();
      e.currentTarget.blur();
    }
  };

  // --- input forwarding into the live frame -------------------------

  const toImageCoords = (e) => {
    const rect = imgRef.current.getBoundingClientRect();
    const scaleX = imgRef.current.naturalWidth / rect.width;
    const scaleY = imgRef.current.naturalHeight / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e) => {
    const { x, y } = toImageCoords(e);
    send({ type: 'mouse', eventType: 'mousePressed', x, y, button: 'left' });
  };
  const handleMouseUp = (e) => {
    const { x, y } = toImageCoords(e);
    send({ type: 'mouse', eventType: 'mouseReleased', x, y, button: 'left' });
  };
  const handleMouseMove = (e) => {
    const { x, y } = toImageCoords(e);
    send({ type: 'mouse', eventType: 'mouseMoved', x, y });
  };
  const handleWheel = (e) => {
    const { x, y } = toImageCoords(e);
    send({ type: 'mouse', eventType: 'mouseWheel', x, y, deltaX: e.deltaX, deltaY: e.deltaY });
  };
  const handleKeyDown = (e) => {
    send({ type: 'key', eventType: 'keyDown', key: e.key, code: e.code, text: e.key.length === 1 ? e.key : '' });
  };
  const handleKeyUp = (e) => {
    send({ type: 'key', eventType: 'keyUp', key: e.key, code: e.code });
  };

  if (stage === 'idle') return null;

  // --- confirm dialog ------------------------------------------------

  if (stage === 'confirm') {
    return createPortal(
      <div style={styles.confirmScrim}>
        <div style={styles.confirmCard}>
          <div style={styles.confirmHeader}>
            <strong>Use application on {agentName}'s computer</strong>
          </div>
          <p style={styles.confirmBody}>
            You're about to use {agentName}'s computer. When finished, please inform{' '}
            {agentName} of your changes to help it work effectively.
          </p>
          <div style={styles.confirmActions}>
            <button
              style={styles.btnGhost}
              onClick={() => {
                setStage('idle');
                onRequestClose?.();
              }}
            >
              Cancel
            </button>
            <button style={styles.btnPrimary} onClick={enterTakeover}>
              Use application
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // --- fullscreen live takeover ---------------------------------------

  return createPortal(
    <div
      style={styles.fullscreenRoot}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <div style={styles.addressBar}>
        <span style={styles.cometDot} />
        <input
          style={styles.addressInput}
          value={addressValue}
          placeholder="Search Google or type a URL"
          onFocus={() => { addressFocused.current = true; }}
          onBlur={() => { addressFocused.current = false; setAddressValue(currentUrl); }}
          onChange={(e) => setAddressValue(e.target.value)}
          onKeyDown={handleAddressKeyDown}
        />
        <button style={styles.goBtn} onClick={submitAddress}>Go</button>
      </div>

      {frameSrc ? (
        <img
          ref={imgRef}
          src={frameSrc}
          alt="Live browser view"
          style={styles.liveFrame}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
          draggable={false}
        />
      ) : (
        <div style={styles.loadingSpinner} />
      )}

      <button style={styles.exitPill} onClick={exitTakeover}>
        Exit takeover
      </button>
    </div>,
    document.body
  );
}

// ---- styles -------------------------------------------------------------

const styles = {
  confirmScrim: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
  },
  confirmCard: {
    width: 460, maxWidth: '90vw', background: COLORS.panel,
    border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20,
    color: COLORS.text, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  confirmHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 15 },
  confirmBody: { fontSize: 13.5, lineHeight: 1.5, color: COLORS.subtext, margin: '0 0 18px' },
  confirmActions: { display: 'flex', justifyContent: 'flex-end', gap: 10 },
  btnGhost: {
    padding: '8px 14px', borderRadius: 8, border: `1px solid ${COLORS.border}`,
    background: 'transparent', color: COLORS.text, cursor: 'pointer', fontSize: 13.5,
  },
  btnPrimary: {
    padding: '8px 14px', borderRadius: 8, border: 'none',
    background: COLORS.text, color: COLORS.bg, cursor: 'pointer', fontSize: 13.5, fontWeight: 600,
  },
  fullscreenRoot: {
    position: 'fixed', inset: 0, background: '#000', zIndex: 10001,
    display: 'flex', flexDirection: 'column', outline: 'none',
  },
  addressBar: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
    background: COLORS.panel, borderBottom: `1px solid ${COLORS.border}`,
  },
  cometDot: { width: 8, height: 8, borderRadius: '50%', background: COLORS.periwinkle, flexShrink: 0 },
  addressInput: {
    flex: 1, background: 'rgba(255,255,255,0.06)', border: `1px solid ${COLORS.border}`,
    borderRadius: 8, padding: '7px 12px', color: COLORS.text, fontSize: 13,
    fontFamily: 'ui-monospace, SFMono-Regular, monospace', outline: 'none',
  },
  goBtn: {
    padding: '7px 16px', borderRadius: 8, border: 'none',
    background: COLORS.periwinkle, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
  },
  liveFrame: { flex: 1, width: '100%', height: '100%', objectFit: 'contain', cursor: 'default' },
  loadingSpinner: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  exitPill: {
    position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
    padding: '10px 20px', borderRadius: 999, border: 'none',
    background: COLORS.text, color: COLORS.bg, fontWeight: 600, fontSize: 13.5,
    cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 10002,
  },
};
