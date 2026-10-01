import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

const COLORS = {
  bg: "#0d0d0c",
  panel: "#151513",
  panelAlt: "#1a1a17",
  border: "rgba(255,255,255,0.08)",
  text: "#f2f1ee",
  subtext: "rgba(242,241,238,0.55)",
  clay: "#CC785C",
  periwinkle: "#7C83DB",
  green: "#3ddc84",
};

const Ctx = createContext(null);

// ---------------------------------------------------------------
// Provider — one WebSocket, one shared browser session
// ---------------------------------------------------------------
export function StoicComputerProvider({ wsUrl, children }) {
  const [frameSrc, setFrameSrc] = useState(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [steps, setSteps] = useState([]);
  const [taskStatus, setTaskStatus] = useState("idle");
  const [mode, setMode] = useState("agent");
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelLayout, setPanelLayout] = useState("floating"); // 'floating' | 'side'
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      switch (msg.type) {
        case "frame": setFrameSrc(`data:image/jpeg;base64,${msg.data}`); break;
        case "nav": setCurrentUrl(msg.url); break;
        case "steps": setSteps(msg.steps); break;
        case "task-status":
          setTaskStatus(msg.status);
          if (msg.status === "running") setPanelOpen((open) => open); // don't force-open, pill alone is enough
          break;
        case "mode": setMode(msg.mode); break;
      }
    };
    ws.onclose = () => { wsRef.current = null; };

    return () => ws.close();
  }, [wsUrl]);

  const send = useCallback((msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify(msg));
  }, []);

  const value = {
    frameSrc, currentUrl, steps, taskStatus, mode, send,
    panelOpen, setPanelOpen, panelLayout, setPanelLayout,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function useComputer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Wrap your app in <StoicComputerProvider>");
  return ctx;
}

// ---------------------------------------------------------------
// Icons
// ---------------------------------------------------------------
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
    <path d="M3 8.5L6.2 11.5L13 4.5" stroke={COLORS.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Spinner = ({ size = 12, color = COLORS.periwinkle }) => (
  <span style={{
    width: size, height: size, borderRadius: "50%",
    border: `2px solid rgba(255,255,255,0.15)`, borderTopColor: color,
    display: "inline-block", animation: "stoic-spin 0.8s linear infinite",
  }} />
);
const DockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke={COLORS.text} strokeWidth="1.2" />
    <rect x="9.5" y="2.5" width="5" height="11" fill={COLORS.text} opacity="0.6" />
  </svg>
);
const FloatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke={COLORS.text} strokeWidth="1.2" />
  </svg>
);
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M3 3L13 13M13 3L3 13" stroke={COLORS.text} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const HandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M5 8V3.5a1 1 0 0 1 2 0V7M7 7V2.7a1 1 0 0 1 2 0V7M9 7V3.5a1 1 0 0 1 2 0V8M11 8V5.5a1 1 0 0 1 2 0V10c0 2.5-1.8 4.5-4.5 4.5S4 12.5 4 10V9l-1.4-1.6a1 1 0 0 1 1.3-1.5L5 7"
      stroke={COLORS.bg} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function StepIcon({ status }) {
  if (status === "done") return <CheckIcon />;
  if (status === "active") return <Spinner size={12} />;
  return <span style={{
    width: 8, height: 8, borderRadius: "50%",
    border: `1.5px solid ${COLORS.subtext}`, display: "inline-block",
  }} />;
}

// ---------------------------------------------------------------
// Inline pill (drop this into each chat message)
// ---------------------------------------------------------------
export function StoicComputerPill({ agentName = "Stoic" }) {
  const { steps, taskStatus, frameSrc, setPanelOpen } = useComputer();
  if (taskStatus === "idle" && steps.length === 0) return null;

  const activeStep = steps.find((s) => s.status === "active");
  const doneCount = steps.filter((s) => s.status === "done").length;
  const summary = taskStatus === "completed"
    ? `Completed · ${doneCount}/${steps.length} steps`
    : activeStep?.label || "Working…";

  return (
    <button style={styles.pill} onClick={() => setPanelOpen(true)}>
      <span style={styles.pillThumb}>
        {frameSrc ? <img src={frameSrc} alt="" style={styles.pillThumbImg} /> : <DockIcon />}
      </span>
      <span style={styles.pillCol}>
        <span style={styles.pillTitle}>
          {agentName}'s computer
          {taskStatus === "running" && <span style={styles.liveDot} />}
        </span>
        <span style={styles.pillSubtitle}>
          {taskStatus === "completed" && <CheckIcon />} {summary}
        </span>
      </span>
      <span style={styles.pillView}>View</span>
    </button>
  );
}

// ---------------------------------------------------------------
// Browser view (screencast + optional manual control)
// ---------------------------------------------------------------
function BrowserView() {
  const { frameSrc, currentUrl, mode, send } = useComputer();
  const imgRef = useRef(null);
  const [addressValue, setAddressValue] = useState(currentUrl);
  const addressFocused = useRef(false);

  useEffect(() => {
    if (!addressFocused.current) setAddressValue(currentUrl);
  }, [currentUrl]);

  const toImageCoords = (e) => {
    const rect = imgRef.current.getBoundingClientRect();
    const scaleX = imgRef.current.naturalWidth / rect.width;
    const scaleY = imgRef.current.naturalHeight / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const submitAddress = () => send({ type: "goto", value: addressValue });
  const onMouseDown = (e) => { const {x,y} = toImageCoords(e); send({ type:"mouse", eventType:"mousePressed", x, y, button:"left" }); };
  const onMouseUp   = (e) => { const {x,y} = toImageCoords(e); send({ type:"mouse", eventType:"mouseReleased", x, y, button:"left" }); };
  const onMouseMove = (e) => { const {x,y} = toImageCoords(e); send({ type:"mouse", eventType:"mouseMoved", x, y }); };
  const onWheel     = (e) => { const {x,y} = toImageCoords(e); send({ type:"mouse", eventType:"mouseWheel", x, y, deltaX:e.deltaX, deltaY:e.deltaY }); };
  const onKeyDown = (e) => send({ type:"key", eventType:"keyDown", key:e.key, code:e.code, text: e.key.length===1 ? e.key : "" });
  const onKeyUp   = (e) => send({ type:"key", eventType:"keyUp", key:e.key, code:e.code });

  return (
    <div style={styles.viewport} tabIndex={0} onKeyDown={mode==="takeover"?onKeyDown:undefined} onKeyUp={mode==="takeover"?onKeyUp:undefined}>
      {mode === "takeover" && (
        <div style={styles.addressBar}>
          <span style={styles.cometDot} />
          <input
            style={styles.addressInput}
            value={addressValue}
            placeholder="Search Google or type a URL"
            onFocus={() => { addressFocused.current = true; }}
            onBlur={() => { addressFocused.current = false; setAddressValue(currentUrl); }}
            onChange={(e) => setAddressValue(e.target.value)}
            onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") { submitAddress(); e.currentTarget.blur(); } }}
          />
          <button style={styles.goBtn} onClick={submitAddress}>Go</button>
        </div>
      )}
      {frameSrc ? (
        <img
          ref={imgRef} src={frameSrc} alt="Live browser view" style={styles.frameImg}
          onMouseDown={mode==="takeover"?onMouseDown:undefined}
          onMouseUp={mode==="takeover"?onMouseUp:undefined}
          onMouseMove={mode==="takeover"?onMouseMove:undefined}
          onWheel={mode==="takeover"?onWheel:undefined}
          draggable={false}
        />
      ) : (
        <div style={styles.spinnerWrap}><Spinner size={22} /></div>
      )}
      {mode === "agent" ? (
        <button style={styles.takeControlBtn} onClick={() => send({ type: "enter-takeover" })} title="Take control">
          <HandIcon />
        </button>
      ) : (
        <button style={styles.exitPill} onClick={() => send({ type: "exit-takeover" })}>Exit takeover</button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Editor view (for "writing answer.md" style steps)
// ---------------------------------------------------------------
function EditorView({ step }) {
  return (
    <div style={styles.editorWrap}>
      <div style={styles.editorTabs}>
        <span style={styles.dot} /><span style={styles.dot} /><span style={styles.dot} />
        <span style={styles.editorFilename}>{step.filename} {step.status === "done" ? "— Modified" : "— Writing…"}</span>
      </div>
      <div style={styles.editorBody}>{step.content}</div>
    </div>
  );
}

// ---------------------------------------------------------------
// Panel — floating modal or docked side panel, Manus style
// ---------------------------------------------------------------
export function StoicComputerPanel({ agentName = "Stoic" }) {
  const { panelOpen, setPanelOpen, panelLayout, setPanelLayout, steps, taskStatus, currentUrl, mode } = useComputer();
  if (!panelOpen) return null;

  const isSide = panelLayout === "side";
  const activeStep = steps.find((s) => s.status === "active") || steps[steps.length - 1];
  const doneCount = steps.filter((s) => s.status === "done").length;

  const body = (
    <div style={isSide ? styles.sideRoot : styles.floatRoot}>
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>
            {agentName}'s computer
            {taskStatus === "running" && <span style={styles.liveDot} />}
          </div>
          <div style={styles.headerSub}>
            {mode === "takeover" ? "You are in control" : `${agentName} is using ${activeStep?.tool === "editor" ? "Editor" : "Browser"}`}
            {currentUrl && activeStep?.tool !== "editor" && <> · <span style={styles.url}>{currentUrl}</span></>}
          </div>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.iconBtn} title={isSide ? "Float" : "Dock to side"} onClick={() => setPanelLayout(isSide ? "floating" : "side")}>
            {isSide ? <FloatIcon /> : <DockIcon />}
          </button>
          <button style={styles.iconBtn} onClick={() => setPanelOpen(false)}><CloseIcon /></button>
        </div>
      </div>

      {activeStep?.tool === "editor" ? <EditorView step={activeStep} /> : <BrowserView />}

      {steps.length > 0 && (
        <div style={styles.progress}>
          <div style={styles.progressHeader}>
            <span>Task progress</span>
            <span style={styles.progressCount}>{doneCount}/{steps.length}</span>
          </div>
          <div style={styles.progressList}>
            {steps.map((s) => (
              <div key={s.id} style={styles.progressRow}>
                <StepIcon status={s.status} />
                <div style={styles.progressText}>
                  <div style={styles.progressLabel}>{s.label}</div>
                  {s.detail && <div style={styles.progressDetail}>{s.detail}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (isSide) return body; // mount this inside a flex row next to your chat column

  return createPortal(
    <div style={styles.scrim} onClick={() => setPanelOpen(false)}>
      <div onClick={(e) => e.stopPropagation()}>{body}</div>
    </div>,
    document.body
  );
}

// ---------------------------------------------------------------
// Styles
// ---------------------------------------------------------------
const styles = {
  pill: {
    display: "flex", alignItems: "center", gap: 10, width: "100%", maxWidth: 420,
    padding: "8px 12px", borderRadius: 10, border: `1px solid ${COLORS.border}`,
    background: COLORS.panel, cursor: "pointer", textAlign: "left",
  },
  pillThumb: { width: 32, height: 32, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: COLORS.panelAlt, display: "flex", alignItems: "center", justifyContent: "center" },
  pillThumbImg: { width: "100%", height: "100%", objectFit: "cover" },
  pillCol: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 },
  pillTitle: { fontSize: 12.5, fontWeight: 600, color: COLORS.text, display: "flex", alignItems: "center", gap: 6 },
  pillSubtitle: { fontSize: 11.5, color: COLORS.subtext, display: "flex", alignItems: "center", gap: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  pillView: { fontSize: 11.5, color: COLORS.periwinkle, fontWeight: 600, flexShrink: 0 },
  liveDot: { width: 6, height: 6, borderRadius: "50%", background: COLORS.green, display: "inline-block" },

  scrim: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 },
  floatRoot: { width: 720, maxWidth: "92vw", height: 560, maxHeight: "86vh", background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 14, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 70px rgba(0,0,0,0.55)" },
  sideRoot: { width: 420, height: "100%", background: COLORS.panel, borderLeft: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 },

  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "14px 16px", borderBottom: `1px solid ${COLORS.border}` },
  headerTitle: { fontSize: 14, fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "center", gap: 7 },
  headerSub: { fontSize: 11.5, color: COLORS.subtext, marginTop: 3 },
  url: { fontFamily: "ui-monospace, monospace", color: COLORS.periwinkle },
  headerActions: { display: "flex", gap: 6 },
  iconBtn: { width: 26, height: 26, borderRadius: 6, border: `1px solid ${COLORS.border}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },

  viewport: { position: "relative", flex: 1, background: "#000", display: "flex", flexDirection: "column", outline: "none", minHeight: 0 },
  addressBar: { display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: COLORS.panelAlt, borderBottom: `1px solid ${COLORS.border}` },
  cometDot: { width: 7, height: 7, borderRadius: "50%", background: COLORS.periwinkle, flexShrink: 0 },
  addressInput: { flex: 1, background: "rgba(255,255,255,0.06)", border: `1px solid ${COLORS.border}`, borderRadius: 7, padding: "6px 10px", color: COLORS.text, fontSize: 12.5, fontFamily: "ui-monospace, monospace", outline: "none" },
  goBtn: { padding: "6px 14px", borderRadius: 7, border: "none", background: COLORS.periwinkle, color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer" },
  frameImg: { flex: 1, width: "100%", height: "100%", objectFit: "contain", cursor: "default" },
  spinnerWrap: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" },
  takeControlBtn: { position: "absolute", right: 14, bottom: 14, width: 36, height: 36, borderRadius: "50%", border: "none", background: COLORS.text, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 6px 18px rgba(0,0,0,0.4)" },
  exitPill: { position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", padding: "9px 18px", borderRadius: 999, border: "none", background: COLORS.text, color: COLORS.bg, fontWeight: 600, fontSize: 12.5, cursor: "pointer", boxShadow: "0 6px 18px rgba(0,0,0,0.4)" },

  editorWrap: { flex: 1, display: "flex", flexDirection: "column", minHeight: 0 },
  editorTabs: { display: "flex", alignItems: "center", gap: 6, padding: "9px 12px", background: COLORS.panelAlt, borderBottom: `1px solid ${COLORS.border}` },
  dot: { width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.15)" },
  editorFilename: { marginLeft: 6, fontSize: 12, color: COLORS.subtext, fontFamily: "ui-monospace, monospace" },
  editorBody: { flex: 1, overflowY: "auto", padding: "14px 16px", fontSize: 12.5, lineHeight: 1.6, color: COLORS.text, whiteSpace: "pre-wrap", fontFamily: "ui-monospace, monospace" },

  progress: { borderTop: `1px solid ${COLORS.border}`, padding: "10px 16px 14px", maxHeight: 160, overflowY: "auto", flexShrink: 0 },
  progressHeader: { display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: COLORS.text, marginBottom: 8 },
  progressCount: { color: COLORS.subtext, fontWeight: 500 },
  progressList: { display: "flex", flexDirection: "column", gap: 8 },
  progressRow: { display: "flex", alignItems: "flex-start", gap: 8 },
  progressText: { flex: 1, minWidth: 0 },
  progressLabel: { fontSize: 12.5, color: COLORS.text },
  progressDetail: { fontSize: 11, color: COLORS.subtext, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
};

// keyframes for the spinner (inject once)
if (typeof document !== "undefined" && !document.getElementById("stoic-computer-kf")) {
  const style = document.createElement("style");
  style.id = "stoic-computer-kf";
  style.textContent = "@keyframes stoic-spin { to { transform: rotate(360deg); } }";
  document.head.appendChild(style);
}
