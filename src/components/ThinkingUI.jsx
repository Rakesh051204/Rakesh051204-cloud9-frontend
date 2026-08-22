import { useState } from 'react';
import './ThinkingUI.css';

export const STEPS = ['Searching the web', 'Reading sources', 'Writing answer'];

export function StepChecklist({ active }) {
  return (
    <div className="thinking-checklist">
      {STEPS.map((label, i) => (
        <div key={label} className="thinking-checklist-row">
          <div className="thinking-checklist-icon">
            {i < active && <span className="thinking-check">✓</span>}
            {i === active && <span className="thinking-ring" />}
            {i > active && <span className="thinking-dot-empty" />}
          </div>
          <span className={`thinking-checklist-label ${i === active ? 'active' : i < active ? 'done' : ''}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ThinkingPanel({ thinking }) {
  const [open, setOpen] = useState(false);
  if (!thinking) return null;
  return (
    <div className="thinking-panel">
      <button className="thinking-toggle" onClick={() => setOpen(o => !o)}>
        {open ? 'Hide thinking' : 'Show thinking'}
      </button>
      {open && <div className="thinking-content">{thinking}</div>}
    </div>
  );
}

export function SourceCard({ source }) {
  let domain = '';
  try { domain = new URL(source.url).hostname.replace('www.', ''); } catch { domain = ''; }
  return (
    <a href={source.url} target="_blank" rel="noreferrer" className="source-card">
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
        onError={(e) => { e.target.style.visibility = 'hidden'; }}
        alt=""
        className="source-card-icon"
      />
      <span className="source-card-title">{source.title}</span>
    </a>
  );
}