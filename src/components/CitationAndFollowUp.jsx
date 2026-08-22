// CitationPill.jsx
// Inline domain-name pill shown next to a cited claim, matching
// Perplexity's "darioamodei" style badge. Pass the source object
// for the citation number this pill represents.
import React from 'react';

function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export function CitationPill({ source }) {
  if (!source?.url) return null;
  const domain = getDomain(source.url);
  const shortName = domain.split('.')[0];

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      className="citation-pill"
      title={source.title || domain}
    >
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
        alt=""
        className="citation-pill-favicon"
      />
      <span>{shortName}</span>

      <style>{`
        .citation-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 1px 8px 1px 4px;
          margin-left: 4px;
          background: rgba(255,255,255,0.06);
          border-radius: 999px;
          font-size: 11.5px;
          color: #A8A6A0;
          text-decoration: none;
          vertical-align: middle;
        }
        .citation-pill:hover {
          background: rgba(255,255,255,0.10);
          color: #E8E6E1;
        }
        .citation-pill-favicon {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }
      `}</style>
    </a>
  );
}

// FollowUpList.jsx
// Quiet list-row follow-ups (like Perplexity's ↳ rows) instead of
// solid full-width buttons.
export function FollowUpList({ followUps = [], onSelect }) {
  if (!followUps || followUps.length === 0) return null;

  return (
    <div className="followup-list">
      <div className="followup-heading">Follow-ups</div>
      {followUps.map((q, i) => (
        <button key={i} className="followup-row" onClick={() => onSelect?.(q)}>
          <span className="followup-arrow">↳</span>
          <span>{q}</span>
        </button>
      ))}

      <style>{`
        .followup-list {
          margin-top: 22px;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 14px;
        }
        .followup-heading {
          font-size: 13px;
          font-weight: 600;
          color: #78766F;
          margin-bottom: 8px;
        }
        .followup-row {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 4px;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          color: #C9C7C1;
          font-size: 14px;
          text-align: left;
          cursor: pointer;
        }
        .followup-row:last-child { border-bottom: none; }
        .followup-row:hover {
          color: #E8E6E1;
        }
        .followup-row:hover .followup-arrow {
          color: #7C83DB;
        }
        .followup-arrow {
          color: #56544E;
          font-size: 15px;
        }
      `}</style>
    </div>
  );
}