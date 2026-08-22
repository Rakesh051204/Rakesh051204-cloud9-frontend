import React, { useState, useRef, useEffect } from 'react';
import IncognitoLogo from './IncognitoLogo';

// Monochrome, Grok-style: black surfaces, white/gray only, no color accents.
// The incognito toggle lives here now, inline with Share / Discover / More —
// one row, one place, no floating duplicate button elsewhere.

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2l1.5 5.5L19 9l-4 3 1 6-4-3-4 3 1-6-4-3 5.5-1.5L12 2z" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6h12z" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

function NewspaperCoffeeIcon() {
  return (
    <svg
      className="newspaper-coffee-svg"
      width="26"
      height="26"
      viewBox="0 0 48 48"
      fill="none"
    >
      {/* steam - three curling trails, animated independently */}
      <path
        className="steam steam-1"
        d="M17 15c-2 1.8-2 2.9 0 4.7s2 2.9 0 4.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        className="steam steam-2"
        d="M21.5 13c-2 1.8-2 2.9 0 4.7s2 2.9 0 4.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        className="steam steam-3"
        d="M26 15c-2 1.8-2 2.9 0 4.7s2 2.9 0 4.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* newspaper - folded page behind, flips/scrolls on trigger */}
      <g className="newspaper-page">
        <path
          d="M6 10h24a2 2 0 012 2v20a2 2 0 01-2 2H10a4 4 0 01-4-4V10z"
          fill="currentColor"
          opacity="0.14"
        />
        <path
          d="M6 10h24a2 2 0 012 2v20a2 2 0 01-2 2H10a4 4 0 01-4-4V10z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <rect x="10" y="14" width="7" height="7" rx="0.6" fill="currentColor" />
        <line x1="20" y1="15.5" x2="29" y2="15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="20" y1="19" x2="29" y2="19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="10" y1="25" x2="29" y2="25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="10" y1="28.5" x2="24" y2="28.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* coffee cup + saucer, sits in front, lower-right */}
      <g>
        <ellipse cx="30" cy="41" rx="9" ry="1.8" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M23.5 30h11a1 1 0 011 1v6.5a4.5 4.5 0 01-4.5 4.5h-3a4.5 4.5 0 01-4.5-4.5V31a1 1 0 011-1z"
          fill="currentColor"
          opacity="0.14"
        />
        <path
          d="M23.5 30h11a1 1 0 011 1v6.5a4.5 4.5 0 01-4.5 4.5h-3a4.5 4.5 0 01-4.5-4.5V31a1 1 0 011-1z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M35.5 32.5h1.8a2.3 2.3 0 010 4.6h-1.8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

function ShareIconIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="18" cy="5" r="2.4" />
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="19" r="2.4" />
      <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
    </svg>
  );
}

const ShareIcon = ShareIconIcon;

function ChatDropdown({ onPin, onMove, onDelete, onClose, projects = [] }) {
  const [showProjects, setShowProjects] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div ref={ref} className="chat-dropdown">
      <button className="dropdown-item" onClick={() => { onPin(); onClose(); }}>
        <PinIcon /> <span>Pin</span>
      </button>

      <div
        className="dropdown-item dropdown-item--nested"
        onMouseEnter={() => setShowProjects(true)}
        onMouseLeave={() => setShowProjects(false)}
      >
        <FolderIcon /> <span>Move to Project</span>
        <span className="spacer" />
        <ChevronRight />

        {showProjects && (
          <div className="dropdown-submenu">
            {projects.length === 0 && (
              <div className="submenu-empty">No projects yet</div>
            )}
            {projects.map((p) => (
              <button
                key={p.id}
                className="submenu-item"
                onClick={() => { onMove(p.id); onClose(); }}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <button className="dropdown-item dropdown-item--danger" onClick={() => { onDelete(); onClose(); }}>
        <TrashIcon /> <span>Delete Chat</span>
      </button>

      <style>{`
        .chat-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          min-width: 190px;
          background: #111111;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 6px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          z-index: 40;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 10px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #E5E5E5;
          font-size: 13.5px;
          text-align: left;
          cursor: pointer;
          position: relative;
        }
        .dropdown-item:hover { background: rgba(255,255,255,0.06); }
        .dropdown-item--danger { color: #E5776B; }
        .dropdown-item--danger:hover { background: rgba(229,119,107,0.10); }
        .spacer { flex: 1; }
        .dropdown-submenu {
          position: absolute;
          top: -6px;
          right: calc(100% + 6px);
          min-width: 160px;
          background: #111111;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 6px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }
        .submenu-item {
          display: block;
          width: 100%;
          padding: 8px 10px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #E5E5E5;
          font-size: 13.5px;
          text-align: left;
          cursor: pointer;
        }
        .submenu-item:hover { background: rgba(255,255,255,0.06); }
        .submenu-empty {
          padding: 8px 10px;
          font-size: 12.5px;
          color: #6B6B6B;
        }
      `}</style>
    </div>
  );
}

export default function ChatTopBar({
  incognito = false,
  onToggleIncognito,
  planLabel = 'Free plan',
  onShare,
  onPin,
  onMoveToProject,
  onDelete,
  onUpgrade,
  onOpenDiscover,
  projects = [],
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolling, setScrolling] = useState(false);

  function handleDiscoverClick() {
    // trigger the paper-unroll animation, then navigate to Discover
    setScrolling(true);
    setTimeout(() => setScrolling(false), 650);
    onOpenDiscover?.();
  }

  return (
    <div className="chat-top-bar">
      <div className="top-bar-left" />

      <div className="top-bar-center">
        <div className="plan-pill">
          <span className="plan-label">{planLabel}</span>
          <span className="pill-dot">·</span>
          <button className="upgrade-link" onClick={onUpgrade}>
            Upgrade
          </button>
        </div>
      </div>

      <div className="top-bar-right">
        <button className="text-btn" onClick={onShare} aria-label="Share" title="Share">
          <ShareIcon />
        </button>

        <button
          className={`icon-btn discover-btn ${scrolling ? 'discover-btn--scrolling' : ''}`}
          onClick={handleDiscoverClick}
          title="Discover — live news, weather & markets"
          aria-label="Discover"
        >
          <NewspaperCoffeeIcon />
        </button>

        <div className="menu-wrap">
          <button className="icon-btn" onClick={() => setMenuOpen((v) => !v)}>
            <MoreIcon />
          </button>
          {menuOpen && (
            <ChatDropdown
              onPin={onPin}
              onMove={onMoveToProject}
              onDelete={onDelete}
              onClose={() => setMenuOpen(false)}
              projects={projects}
            />
          )}
        </div>

        <button
          className={`icon-btn incognito-toggle ${incognito ? 'incognito-toggle--active' : ''}`}
          onClick={onToggleIncognito}
          aria-label="Private mode"
          title="Private mode — this chat won't be saved or used to train models"
        >
          <IncognitoLogo size={30} active={incognito} bg="#000000" />
        </button>
      </div>

      {incognito && (
        <div className="incognito-banner">
          <IncognitoLogo size={16} active bg="#0A0A0A" />
          <span>This chat won't appear in your history and won't be used to train models.</span>
        </div>
      )}

      <style>{`
        .chat-top-bar {
          position: relative;
          flex-shrink: 0;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 10px 24px 10px 16px;
          background: #000000;
          z-index: 10;
        }
        .top-bar-left { justify-self: start; }
        .top-bar-center { justify-self: center; }
        .top-bar-right {
          justify-self: end;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .plan-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: #111111;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 999px;
          font-size: 13px;
        }
        .plan-label { color: #9A9A9A; }
        .pill-dot { color: #555555; }
        .upgrade-link {
          background: none;
          border: none;
          padding: 0;
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 600;
          text-decoration: underline;
          text-decoration-color: rgba(255,255,255,0.4);
          cursor: pointer;
        }
        .upgrade-link:hover { color: #CCCCCC; }
        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #A0A0A0;
          cursor: pointer;
        }
        .icon-btn:hover { background: rgba(255,255,255,0.06); color: #FFFFFF; }

        /* Incognito owl gets a slightly larger hit area so the bigger
           mark (size=30) has breathing room and reads at the same visual
           weight as the Share button next to it. */
        .incognito-toggle {
          width: 40px;
          height: 40px;
        }
        .incognito-toggle--active {
          background: #1a1a1a;
          color: #FFFFFF;
        }
        .text-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          padding: 0;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 8px;
          color: #E5E5E5;
          cursor: pointer;
        }
        .text-btn:hover { background: rgba(255,255,255,0.06); }
        .menu-wrap { position: relative; }

        /* --- Discover / newspaper+coffee icon: steam, glow, page-flip --- */
        .discover-btn {
          position: relative;
          margin: 0 4px;
          transition: transform 0.2s ease;
        }
        .newspaper-coffee-svg {
          color: #B8B8B8;
          transition: color 0.25s ease, filter 0.25s ease;
          overflow: visible;
          animation: idleGlowPulse 3.2s ease-in-out infinite;
        }
        .discover-btn:hover .newspaper-coffee-svg {
          color: #E8A33D;
          filter: drop-shadow(0 0 2px rgba(232, 163, 61, 0.9))
                  drop-shadow(0 0 5px rgba(232, 163, 61, 0.5));
          animation-play-state: paused;
        }
        .discover-btn:active .newspaper-coffee-svg {
          transform: scale(0.94);
        }

        @keyframes idleGlowPulse {
          0%, 100% {
            color: #B8B8B8;
            filter: drop-shadow(0 0 0px rgba(232, 163, 61, 0));
          }
          50% {
            color: #D99B4E;
            filter: drop-shadow(0 0 1.5px rgba(232, 163, 61, 0.4));
          }
        }

        .steam {
          opacity: 0;
          transform-origin: bottom center;
          animation: steamRise 2.1s ease-in-out infinite;
        }
        .steam-1 { animation-delay: 0s; }
        .steam-2 { animation-delay: 0.45s; }
        .steam-3 { animation-delay: 0.9s; }
        @keyframes steamRise {
          0%   { opacity: 0; transform: translateY(3px) scaleY(0.85) scaleX(1); }
          20%  { opacity: 1; }
          65%  { opacity: 0.6; transform: translateY(-4px) scaleY(1.1) scaleX(1.05); }
          100% { opacity: 0; transform: translateY(-8px) scaleY(1.3) scaleX(1.15); }
        }

        .newspaper-page {
          transform-origin: 8px 24px;
          transition: transform 0.2s ease;
        }
        @keyframes pageFlip {
          0%   { transform: rotateY(0deg) skewY(0deg) scale(1); }
          30%  { transform: rotateY(-30deg) skewY(-5deg) scale(1.05); }
          60%  { transform: rotateY(16deg) skewY(3deg) scale(1.03); }
          85%  { transform: rotateY(-6deg) skewY(-1deg) scale(1.01); }
          100% { transform: rotateY(0deg) skewY(0deg) scale(1); }
        }
        .discover-btn--scrolling .newspaper-page {
          animation: pageFlip 0.7s ease;
        }
        .discover-btn--scrolling .newspaper-coffee-svg {
          color: #E8A33D;
          animation-play-state: paused;
          filter: drop-shadow(0 0 3px rgba(232, 163, 61, 1))
                  drop-shadow(0 0 7px rgba(232, 163, 61, 0.6));
        }

        .incognito-banner {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 16px;
          background: #0A0A0A;
          color: #B5B5B5;
          font-size: 12.5px;
        }
      `}</style>
    </div>
  );
}