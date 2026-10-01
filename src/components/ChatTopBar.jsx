import React, { useState, useRef, useEffect } from 'react';
import IncognitoLogo from './IncognitoLogo';

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

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 9l6 6 6-6" />
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
  title = '',
  incognito = false,
  onToggleIncognito,
  planLabel = 'Free plan',
  onShare,
  onPin,
  onMoveToProject,
  onDelete,
  onUpgrade,
  projects = [],
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="chat-top-bar">
      <div className="top-bar-left">
        {title && (
          <button className="title-btn" title={title}>
            <span className="title-text">{title}</span>
            <ChevronDown />
          </button>
        )}
      </div>

      <div className="top-bar-center">
        <div className="plan-pill">
          <span className="plan-label">{planLabel}</span>
          <span className="pill-dot">Â·</span>
          <button className="upgrade-link" onClick={onUpgrade}>
            Upgrade
          </button>
        </div>
      </div>

      <div className="top-bar-right">
        <button className="text-btn" onClick={onShare} aria-label="Share" title="Share">
          <ShareIcon />
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
          title="Private mode â€” this chat won't be saved or used to train models"
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
        .top-bar-left { justify-self: start; min-width: 0; }
        .title-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          max-width: 320px;
          padding: 6px 8px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #F2F2F0;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        .title-btn:hover { background: rgba(255,255,255,0.06); }
        .title-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .title-btn svg { color: #8A8A85; flex-shrink: 0; }
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