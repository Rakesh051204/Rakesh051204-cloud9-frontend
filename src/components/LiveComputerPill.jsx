import { useEffect, useState } from "react";

const LIGHT_TEXT = "#F2F2F0";
const LIGHT_TEXT_SOFT = "rgba(242,242,240,0.65)";
const LIGHT_TEXT_FAINT = "rgba(242,242,240,0.45)";

const SEARCH_COLOR = "#4FD1C5";
const WRITE_COLOR = "#CC785C";
const READ_COLOR = "#F5A623";

function VintageMonitorIcon({ size = 22, active = false, color = "#4FD1C5" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2.5" y="3" width="19" height="14" rx="2.2" fill="#3a3733" stroke="#55514a" strokeWidth="0.6" />
      <rect
        x="4.3" y="4.7" width="15.4" height="10.6" rx="1"
        fill={active ? "#0d1f13" : "#15130f"}
        stroke={active ? color : "#3a3733"}
        strokeWidth="0.7"
        style={{ transition: "all 0.4s ease" }}
      />
      {active && (
        <rect x="4.3" y="4.7" width="15.4" height="10.6" rx="1" fill={color} opacity="0.12" />
      )}
      <path d="M5.5 5.8 L9 5.8 L5.5 10.5 Z" fill="#ffffff" opacity="0.05" />
      <circle cx="18.5" cy="15.8" r="0.55" fill={active ? color : "#55514a"} />
      <path d="M10 17.5 L14 17.5 L15 20.5 L9 20.5 Z" fill="#3a3733" />
      <rect x="7.5" y="20.3" width="9" height="1.4" rx="0.7" fill="#3a3733" />
    </svg>
  );
}

export default function LiveComputerPill({ step, completed = false, elapsedSeconds = null, open, onClick }) {
  if (!step && !completed) return null;

  const lower = step?.toLowerCase() || '';
  let state = 'processing';
  let stateLabel = 'Processing';
  let stateColor = '#4FD1C5';
  let stateIcon = '🔄';

  if (lower.includes('search') || lower.includes('look') || lower.includes('find') || lower.includes('web')) {
    state = 'searching';
    stateLabel = 'Searching the web';
    stateColor = SEARCH_COLOR;
    stateIcon = '🔍';
  } else if (lower.includes('writ') || lower.includes('draft') || lower.includes('compos') || lower.includes('summar') || lower.includes('edit')) {
    state = 'writing';
    stateLabel = 'Writing the answer';
    stateColor = WRITE_COLOR;
    stateIcon = '✍️';
  } else if (lower.includes('read') || lower.includes('browse') || lower.includes('open') || lower.includes('visit') || lower.includes('source')) {
    state = 'reading';
    stateLabel = 'Reading sources';
    stateColor = READ_COLOR;
    stateIcon = '📖';
  }

  return (
    <div className="max-w-3xl mx-auto mb-2">
      <style>{`
        @keyframes livePillIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        @keyframes livePillDot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .4; transform: scale(.7); } }
        @keyframes pillPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(79,209,197,0.15); border-color: rgba(79,209,197,0.2); }
          50% { box-shadow: 0 0 24px rgba(79,209,197,0.4); border-color: rgba(79,209,197,0.6); }
        }
        .pill-pulse {
          animation: pillPulse 1.4s ease-in-out infinite;
        }
      `}</style>
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border transition-colors text-left ${!completed ? 'pill-pulse' : ''}`}
        style={{
          animation: "livePillIn 200ms ease both",
          borderColor: !completed ? 'rgba(79,209,197,0.2)' : 'rgba(255,255,255,0.08)',
          boxShadow: !completed ? '0 0 8px rgba(79,209,197,0.15)' : 'none',
        }}
      >
        <span className="flex items-center justify-center flex-shrink-0">
          <VintageMonitorIcon size={22} active={!completed} color={stateColor} />
        </span>

        {!completed ? (
          <>
            <span
              className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: stateColor, animation: "livePillDot 1.3s ease-in-out infinite" }}
            />
            <span className="text-[13px] truncate flex-1" style={{ color: LIGHT_TEXT_SOFT }}>
              <span style={{ color: LIGHT_TEXT }}>Stoic's computer</span> — {stateLabel}
              {step && ` (${step})`}
            </span>
            <span className="text-xs font-mono" style={{ color: stateColor }}>{stateIcon}</span>
          </>
        ) : (
          <span className="text-[13px] truncate flex-1" style={{ color: LIGHT_TEXT_SOFT }}>
            <span style={{ color: LIGHT_TEXT }}>Stoic's computer</span> — Completed
            {elapsedSeconds != null && (
              <span style={{ color: LIGHT_TEXT_FAINT }}> in {elapsedSeconds.toFixed(1)}s</span>
            )}
          </span>
        )}

        <span className="text-[11px] font-medium flex-shrink-0" style={{ color: LIGHT_TEXT_FAINT }}>
          {open ? "Hide" : "View"}
        </span>
      </button>
    </div>
  );
}