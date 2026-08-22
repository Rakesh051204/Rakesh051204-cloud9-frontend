import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  CornerDownRight,
  CheckCircle2,
  Loader2,
  Circle,
} from "lucide-react";

export function ThinkingTrace({ steps = [], title = "Working", collapsedByDefault = false }) {
  const [open, setOpen] = useState(!collapsedByDefault);
  const allDone = steps.length > 0 && steps.every((s) => s.status === "done");

  return (
    <div className="thinking-trace">
      <button className="thinking-trace__header" onClick={() => setOpen((o) => !o)}>
        <span className="thinking-trace__title">
          {allDone ? title : steps.find((s) => s.status === "active")?.label || title}
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <ul className="thinking-trace__list">
          {steps.map((s) => (
            <li key={s.id} className={`thinking-trace__step is-${s.status}`}>
              <span className="thinking-trace__icon">
                {s.status === "done" && <CheckCircle2 size={14} strokeWidth={2} />}
                {s.status === "active" && (
                  <Loader2 size={14} strokeWidth={2} className="spin" />
                )}
                {s.status === "pending" && <Circle size={12} strokeWidth={2} />}
              </span>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      )}

      <style>{`
        .thinking-trace {
          border: 1px solid var(--border-subtle, #232326);
          border-radius: 10px;
          background: #131314;
          margin-bottom: 14px;
          overflow: hidden;
        }
        .thinking-trace__header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: none;
          border: none;
          color: var(--text-muted, #9A9A9C);
          font-size: 13px;
          font-weight: 500;
          padding: 10px 12px;
          cursor: pointer;
        }
        .thinking-trace__header:hover {
          color: var(--text-primary, #EDEDED);
        }
        .thinking-trace__list {
          list-style: none;
          margin: 0;
          padding: 0 12px 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          border-top: 1px solid var(--border-subtle, #232326);
          padding-top: 8px;
        }
        .thinking-trace__step {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted, #9A9A9C);
        }
        .thinking-trace__step.is-done {
          color: var(--text-primary, #EDEDED);
        }
        .thinking-trace__step.is-active {
          color: var(--periwinkle, #7C83DB);
        }
        .thinking-trace__icon {
          display: flex;
          align-items: center;
          color: var(--clay, #CC785C);
        }
        .thinking-trace__step.is-done .thinking-trace__icon {
          color: #4ade80;
        }
        .thinking-trace__step.is-active .thinking-trace__icon {
          color: var(--periwinkle, #7C83DB);
        }
        .spin {
          animation: trace-spin 0.9s linear infinite;
        }
        @keyframes trace-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function SourcesPill({ sources = [], initialVisible = 4 }) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  if (sources.length === 0) return null;

  const visible = showAll ? sources : sources.slice(0, initialVisible);
  const remaining = sources.length - visible.length;

  return (
    <div className="sources-pill">
      <button className="sources-pill__trigger" onClick={() => setOpen((o) => !o)}>
        <BookOpen size={14} strokeWidth={2} />
        <span>Sources</span>
        <span className="sources-pill__count">{sources.length}</span>
      </button>

      {open && (
        <div className="sources-pill__panel">
          <ul className="sources-pill__list">
            {visible.map((s, i) => (
              <li key={i} className="sources-pill__item">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=32`}
                  alt=""
                  className="sources-pill__favicon"
                />
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                </a>
                <span className="sources-pill__domain">{s.domain}</span>
              </li>
            ))}
          </ul>

          {!showAll && remaining > 0 && (
            <button className="sources-pill__more" onClick={() => setShowAll(true)}>
              <ChevronDown size={13} />
              Show {remaining} more
            </button>
          )}
        </div>
      )}

      <style>{`
        .sources-pill { display: inline-block; }
        .sources-pill__trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #17171a;
          border: 1px solid var(--border-subtle, #232326);
          color: var(--text-muted, #9A9A9C);
          font-size: 13px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 999px;
          cursor: pointer;
        }
        .sources-pill__trigger:hover {
          border-color: var(--periwinkle, #7C83DB);
          color: var(--text-primary, #EDEDED);
        }
        .sources-pill__count {
          background: var(--periwinkle, #7C83DB);
          color: #0B0B0D;
          font-size: 11px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 999px;
        }
        .sources-pill__panel {
          margin-top: 8px;
          border: 1px solid var(--border-subtle, #232326);
          border-radius: 10px;
          background: #131314;
          padding: 10px;
          max-width: 420px;
        }
        .sources-pill__list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 260px;
          overflow-y: auto;
        }
        .sources-pill__item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }
        .sources-pill__item a {
          color: var(--text-primary, #EDEDED);
          text-decoration: none;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sources-pill__item a:hover {
          color: var(--periwinkle, #7C83DB);
        }
        .sources-pill__domain {
          color: var(--text-muted, #9A9A9C);
          font-size: 11px;
          flex-shrink: 0;
        }
        .sources-pill__favicon {
          width: 14px;
          height: 14px;
          border-radius: 3px;
          flex-shrink: 0;
        }
        .sources-pill__more {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: var(--periwinkle, #7C83DB);
          font-size: 12px;
          font-weight: 500;
          margin-top: 8px;
          padding: 4px 0 0;
          cursor: pointer;
        }
        .sources-pill__more:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

export function FollowUpQuestions({ questions = [], onSelect }) {
  if (questions.length === 0) return null;

  return (
    <div className="followups">
      <h4 className="followups__title">Follow-ups</h4>
      <ul className="followups__list">
        {questions.map((q, i) => (
          <li key={i}>
            <button className="followups__item" onClick={() => onSelect?.(q)}>
              <CornerDownRight size={14} strokeWidth={2} className="followups__icon" />
              <span>{q}</span>
            </button>
          </li>
        ))}
      </ul>

      <style>{`
        .followups {
          margin-top: 24px;
        }
        .followups__title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary, #EDEDED);
          margin: 0 0 10px;
        }
        .followups__list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .followups__item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          border-top: 1px solid var(--border-subtle, #232326);
          color: var(--text-primary, #EDEDED);
          font-size: 14px;
          text-align: left;
          padding: 12px 4px;
          cursor: pointer;
        }
        .followups__item:hover {
          color: var(--periwinkle, #7C83DB);
        }
        .followups__item:hover .followups__icon {
          color: var(--periwinkle, #7C83DB);
        }
        .followups__icon {
          color: var(--text-muted, #9A9A9C);
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
