import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minimize2, X, ChevronLeft, ChevronRight } from "lucide-react";
import "./StoicComputerPanel.css";

const DARK_BG = "#0d0d0c";
const DARK_HOVER = "#191918";
const DARK_BORDER = "rgba(255,255,255,0.14)";
const LIGHT_TEXT = "#F2F2F0";
const LIGHT_TEXT_SOFT = "rgba(242,242,240,0.6)";
const LIGHT_TEXT_FAINT = "rgba(242,242,240,0.4)";
const CLAY = "#CC785C";
const PERIWINKLE = "#7C83DB";

const FINISH_MESSAGES = [
  "Task completed",
  "All done",
  "Finished - enjoy!",
  "Wrapped up",
  "Agent todo completed",
];

function BrowserScene({ domain, tab, eyebrow, title, subtitle, facts = [], paragraphs = [] }) {
  return (
    <div className="scp-browser">
      <div className="scp-browser-chrome">
        <div className="scp-browser-tab">
          <span />
          {tab || domain}
        </div>
        <div className="scp-browser-bar">
          <div className="scp-browser-url">{domain}</div>
        </div>
      </div>
      <div className="scp-browser-page">
        {eyebrow && <div className="scp-browser-eyebrow">{eyebrow}</div>}
        {title && <div className="scp-browser-title">{title}</div>}
        {subtitle && <div className="scp-browser-sub">{subtitle}</div>}
        {facts.length > 0 && (
          <div className="scp-browser-facts">
            {facts.map((f, i) => (
              <div className="scp-browser-fact" key={i}>
                <div className="scp-browser-fact-k">{f.k}</div>
                <div className="scp-browser-fact-v">{f.v}</div>
              </div>
            ))}
          </div>
        )}
        {paragraphs.map((p, i) => (
          <div className="scp-browser-p" key={i}>{p}</div>
        ))}
      </div>
    </div>
  );
}

export default function ComputerPanel({ open, scenes = [], onClose, completed = false }) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [finishMsg, setFinishMsg] = useState(FINISH_MESSAGES[0]);

  const [pinnedToLive, setPinnedToLive] = useState(true);
  useEffect(() => {
    if (pinnedToLive) setSceneIndex(Math.max(0, scenes.length - 1));
  }, [scenes.length, pinnedToLive]);

  useEffect(() => {
    if (!open) { setFullscreen(false); setPinnedToLive(true); }
  }, [open]);

  useEffect(() => {
    if (completed) {
      setFinishMsg(FINISH_MESSAGES[Math.floor(Math.random() * FINISH_MESSAGES.length)]);
    }
  }, [completed]);

  if (!open || scenes.length === 0) return null;

  const scene = scenes[sceneIndex] || {};
  const isLive = sceneIndex === scenes.length - 1;
  const progressPct = scenes.length > 1 ? (sceneIndex / (scenes.length - 1)) * 100 : 100;

  const goPrev = () => {
    setPinnedToLive(false);
    setSceneIndex((i) => Math.max(0, i - 1));
  };
  const goNext = () => {
    const next = Math.min(scenes.length - 1, sceneIndex + 1);
    setSceneIndex(next);
    if (next === scenes.length - 1) setPinnedToLive(true);
  };

  const doneCount = (scene.progress || []).filter((p) => p.done).length;
  const totalCount = (scene.progress || []).length;

  const viewportContent = scene.browser
    ? <BrowserScene {...scene.browser} />
    : typeof scene.render === "function"
      ? scene.render()
      : null;

  const modal = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        style={{
          width: fullscreen ? "100vw" : 620,
          height: fullscreen ? "100vh" : 560,
          maxHeight: "92vh",
          backgroundColor: DARK_BG,
          border: fullscreen ? "none" : `1px solid ${DARK_BORDER}`,
          borderRadius: fullscreen ? 0 : 16,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          transition: "width 0.3s ease, height 0.3s ease, border-radius 0.3s ease",
        }}
      >
        <div
          className="flex items-start justify-between"
          style={{ padding: "14px 16px", borderBottom: `1px solid ${DARK_BORDER}`, flexShrink: 0 }}
        >
          <div className="flex flex-col gap-[3px] min-w-0">
            <span style={{ fontSize: 14, fontWeight: 600, color: LIGHT_TEXT }}>Stoic's computer</span>
            <span style={{ fontSize: 12, color: LIGHT_TEXT_SOFT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {completed
                ? finishMsg
                : (isLive ? "Stoic is using " : "Viewing step . ")}
              {!completed && (scene.tool || "Browser")}
              {!completed && scene.path && (
                <>
                  {" . "}
                  <span style={{ color: PERIWINKLE }}>{scene.path}</span>
                </>
              )}
            </span>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              title={fullscreen ? "Exit fullscreen" : "Expand to fullscreen"}
              onClick={() => setFullscreen((v) => !v)}
              className="flex h-7 w-7 items-center justify-center rounded-md transition"
              style={{ color: LIGHT_TEXT_FAINT }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = DARK_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button
              title="Close"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md transition"
              style={{ color: LIGHT_TEXT_FAINT }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = DARK_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            margin: 12,
            borderRadius: 10,
            border: `1px solid ${DARK_BORDER}`,
            backgroundColor: "#000",
            overflow: "auto",
            position: "relative",
          }}
        >
          {viewportContent}
        </div>

        <div className="flex items-center gap-2.5" style={{ padding: "0 16px 12px", flexShrink: 0 }}>
          <button
            onClick={goPrev}
            disabled={sceneIndex === 0}
            className="flex h-6 w-6 items-center justify-center rounded transition shrink-0"
            style={{ color: sceneIndex === 0 ? "rgba(242,242,240,0.2)" : LIGHT_TEXT_SOFT }}
            onMouseEnter={(e) => { if (sceneIndex !== 0) e.currentTarget.style.backgroundColor = DARK_HOVER; }}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <ChevronLeft size={16} />
          </button>

          <div style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: DARK_BORDER, position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${progressPct}%`, borderRadius: 2, backgroundColor: PERIWINKLE, transition: "width 0.2s ease" }} />
            <div style={{ position: "absolute", left: `${progressPct}%`, top: "50%", transform: "translate(-50%,-50%)", width: 9, height: 9, borderRadius: "50%", backgroundColor: PERIWINKLE }} />
          </div>

          <button
            onClick={goNext}
            disabled={isLive}
            className="flex h-6 w-6 items-center justify-center rounded transition shrink-0"
            style={{ color: isLive ? "rgba(242,242,240,0.2)" : LIGHT_TEXT_SOFT }}
            onMouseEnter={(e) => { if (!isLive) e.currentTarget.style.backgroundColor = DARK_HOVER; }}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <ChevronRight size={16} />
          </button>

          {completed ? (
            <span className="flex items-center gap-1 shrink-0" style={{ fontSize: 11.5, fontWeight: 600, color: LIGHT_TEXT }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: LIGHT_TEXT }} />
              {finishMsg}
            </span>
          ) : isLive && (scene.live !== false) && (
            <span className="flex items-center gap-1 shrink-0" style={{ fontSize: 11.5, fontWeight: 600, color: CLAY }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: CLAY }} />
              Live
            </span>
          )}
        </div>

        {totalCount > 0 && (
          <div style={{ padding: "12px 16px 16px", borderTop: `1px solid ${DARK_BORDER}`, flexShrink: 0 }}>
            <h4 style={{ fontSize: 11.5, color: LIGHT_TEXT_SOFT, margin: "0 0 8px", fontWeight: 500 }}>
              Task progress . {doneCount}/{totalCount}
            </h4>
            {scene.progress.map((p, i) => (
              <div key={i} className="flex items-center gap-2.5" style={{ fontSize: 13, color: p.done ? LIGHT_TEXT : LIGHT_TEXT_SOFT, padding: "4px 0" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: p.done ? LIGHT_TEXT_FAINT : PERIWINKLE, flexShrink: 0 }} />
                {p.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {fullscreen && (
        <button
          onClick={() => setFullscreen(false)}
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "8px 18px",
            borderRadius: 999,
            backgroundColor: LIGHT_TEXT,
            color: "#0F0F0E",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            zIndex: 210,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          Exit takeover
        </button>
      )}
    </div>
  );

  return createPortal(modal, document.body);
}
