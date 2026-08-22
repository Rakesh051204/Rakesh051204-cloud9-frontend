import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Paperclip, Clock, Grid2x2, Plus, AudioLines, ChevronDown } from 'lucide-react';

// Stoic design tokens
const COLORS = {
  bg: '#000000',
  panel: '#0D0D0D',
  border: '#232323',
  text: '#F2F2F0',
  textMuted: '#8A8A87',
  clay: '#CC785C',
};

// ─── Heartbeat mic icon ──────────────────────────────────────────────
// Mic capsule with an ECG/pulse line through the middle and electrode-lead
// dots trailing off each side, matching the reference design. `active`
// drives the pulse-glow animation while recording.
function HeartbeatMicIcon({ size = 18, active = false, color = '#F2F2F0' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        filter: active ? `drop-shadow(0 0 4px ${COLORS.clay})` : 'none',
        transition: 'filter 0.2s ease',
      }}
    >
      {/* left lead */}
      <circle cx="2.5" cy="9.5" r="1" fill={active ? COLORS.clay : color} />
      <line x1="3.5" y1="9.5" x2="7" y2="9.5" stroke={active ? COLORS.clay : color} strokeWidth="1.2" />
      {/* right lead */}
      <circle cx="21.5" cy="7.5" r="1" fill={active ? COLORS.clay : color} />
      <line x1="20.5" y1="7.5" x2="17" y2="7.5" stroke={active ? COLORS.clay : color} strokeWidth="1.2" />

      {/* mic capsule body */}
      <path
        d="M12 2.5c-2 0-3.5 1.5-3.5 3.5v6c0 2 1.5 3.5 3.5 3.5s3.5-1.5 3.5-3.5V6c0-2-1.5-3.5-3.5-3.5z"
        stroke={active ? COLORS.clay : color}
        strokeWidth="1.3"
      />

      {/* ECG pulse line through the capsule */}
      <path
        d="M7 9.5h2l1-2.5 1.5 5 1-4 0.8 1.5H17"
        stroke={active ? COLORS.clay : color}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={active ? { animation: 'heartbeatDash 1s ease-in-out infinite' } : undefined}
      />

      {/* mic stand arc + stem */}
      <path
        d="M6.5 13.5a5.5 5.5 0 0 0 11 0"
        stroke={active ? COLORS.clay : color}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line x1="12" y1="19" x2="12" y2="21.5" stroke={active ? COLORS.clay : color} strokeWidth="1.3" strokeLinecap="round" />

      <style>{`
        @keyframes heartbeatDash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </svg>
  );
}

// ─── Compact live heartbeat waveform ─────────────────────────────────
// Renders the rolling `levels` array as an ECG-style trace instead of
// flat bars — a smooth polyline with a glowing pulse dot riding the front.
function HeartbeatWave({ levels, color = COLORS.clay }) {
  const width = 160;
  const height = 28;
  const step = width / (levels.length - 1);

  const points = levels
    .map((v, i) => {
      const x = i * step;
      const y = height / 2 - (v - 14); // center around mid-height
      return `${x},${y}`;
    })
    .join(' ');

  const lastX = (levels.length - 1) * step;
  const lastY = height / 2 - (levels[levels.length - 1] - 14);

  return (
    <svg width={width} height={height} style={{ flexShrink: 0 }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <circle cx={lastX} cy={lastY} r="3" fill={color}>
        <animate attributeName="r" values="2;4;2" dur="0.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.5;1" dur="0.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// ─── Click-triggered ECG pulse overlay ───────────────────────────────
// Fires the instant a mic/heart icon is tapped: a single pulse blip races
// left-to-right across the input track and fades, giving immediate feedback
// while the real mic permission / audio graph is still spinning up.
const ECG_BLIP_PATH =
  'M0,14 L40,14 L52,14 L58,4 L64,24 L70,8 L76,14 L92,14 L108,14 L118,14 L124,2 L130,26 L136,10 L142,14 L158,14 L400,14';

function EcgClickPulse({ triggerKey, color = COLORS.clay }) {
  const pathRef = useRef(null);

  useEffect(() => {
    if (triggerKey === 0) return;
    const path = pathRef.current;
    if (!path) return;

    path.style.transition = 'none';
    path.style.opacity = '1';
    path.setAttribute('stroke-dashoffset', '500');
    path.getBoundingClientRect(); // force reflow before re-animating

    path.style.transition =
      'stroke-dashoffset 700ms cubic-bezier(.4,0,.2,1), opacity 250ms ease 550ms';
    requestAnimationFrame(() => path.setAttribute('stroke-dashoffset', '0'));

    const fade = setTimeout(() => {
      path.style.opacity = '0';
    }, 700);
    return () => clearTimeout(fade);
  }, [triggerKey]);

  return (
    <svg
      viewBox="0 0 400 28"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        left: 14,
        right: 14,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 'calc(100% - 28px)',
        height: 28,
        pointerEvents: 'none',
      }}
    >
      <path
        ref={pathRef}
        d={ECG_BLIP_PATH}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="500"
        strokeDashoffset="500"
        style={{ opacity: 0 }}
      />
    </svg>
  );
}

export default function ComposerBar({ onSend }) {
  const [value, setValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [model, setModel] = useState('Fast');
  const [recording, setRecording] = useState(false);
  const [levels, setLevels] = useState(Array(24).fill(14));
  const [pulseKey, setPulseKey] = useState(0);
  const menuRef = useRef(null);

  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);

      setRecording(true);

      const tick = () => {
        analyser.getByteFrequencyData(data);
        const bars = Array.from({ length: 24 }, (_, i) => {
          const v = data[i % data.length] || 0;
          return Math.max(4, Math.min(26, (v / 255) * 26));
        });
        setLevels(bars);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      console.error('Mic access denied:', e);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    setLevels(Array(24).fill(14));
    setRecording(false);
  }, []);

  useEffect(() => () => stopRecording(), [stopRecording]);

  const toggleRecording = () => {
    // Instant ECG blip feedback, fires immediately on tap regardless of
    // how long mic permission / audio graph setup takes.
    setPulseKey((k) => k + 1);
    if (recording) stopRecording();
    else startRecording();
  };

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSend?.(value);
    setValue('');
  };

  return (
    <div style={{ width: '100%', maxWidth: 720, margin: '0 auto', position: 'relative', fontFamily: 'inherit' }}>
      {/* Main composer bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: COLORS.panel,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 28,
          padding: '8px 10px 8px 14px',
          position: 'relative',
        }}
      >
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Attach or add"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            color: COLORS.textMuted,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <X size={16} />
        </button>

        {recording ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartbeatWave levels={levels} color={COLORS.clay} />
          </div>
        ) : (
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <EcgClickPulse triggerKey={pulseKey} color={COLORS.clay} />
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="What's on your mind?"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: COLORS.text,
                fontSize: 15,
                position: 'relative',
              }}
            />
          </div>
        )}

        {/* Model picker */}
        {!recording && (
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'transparent',
              border: 'none',
              color: COLORS.text,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 6px',
              flexShrink: 0,
            }}
          >
            {model}
            <ChevronDown size={14} color={COLORS.textMuted} />
          </button>
        )}

        <button
          onClick={toggleRecording}
          aria-label={recording ? 'Stop recording' : 'Voice input'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: 'none',
            background: recording ? 'rgba(204,120,92,0.12)' : 'transparent',
            color: COLORS.text,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <HeartbeatMicIcon size={18} active={recording} color={COLORS.text} />
        </button>

        <button
          onClick={handleSubmit}
          aria-label="Send"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: 'none',
            background: COLORS.text,
            color: COLORS.bg,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <AudioLines size={16} />
        </button>
      </div>

      {/* Attachment dropdown menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 8,
            background: '#141414',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: 6,
            minWidth: 200,
            zIndex: 20,
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          }}
        >
          <MenuItem icon={<Paperclip size={16} />} label="Upload a file" />
          <MenuItem icon={<Clock size={16} />} label="Recent" trailing />
          <MenuItem icon={<Grid2x2 size={16} />} label="Skills" trailing />
          <MenuItem
            icon={<Plus size={16} />}
            label="Add connector"
            bold
            accent={COLORS.clay}
          />
        </div>
      )}

      {/* Connect account banner */}
      {showBanner && (
        <div
          style={{
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: COLORS.panel,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            padding: '14px 18px',
          }}
        >
          <div>
            <p style={{ margin: 0, color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
              Connect your X account
            </p>
            <p style={{ margin: '2px 0 0', color: COLORS.textMuted, fontSize: 13 }}>
              Unlock early features and personalized content.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            <button
              onClick={() => setShowBanner(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: COLORS.clay,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
            <button
              style={{
                background: COLORS.text,
                color: COLORS.bg,
                border: 'none',
                borderRadius: 20,
                padding: '8px 18px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Connect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, trailing, bold, accent }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        background: hover ? '#1F1F1F' : 'transparent',
        border: 'none',
        borderRadius: 9,
        padding: '9px 10px',
        color: accent || COLORS.text,
        fontSize: 14,
        fontWeight: bold ? 600 : 400,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ display: 'flex', color: accent || COLORS.textMuted }}>{icon}</span>
        {label}
      </span>
      {trailing && <span style={{ color: COLORS.textMuted, fontSize: 14 }}>›</span>}
    </button>
  );
}