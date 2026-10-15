import { useState } from "react";

export default function TakeoverOverlay({ open, onExit }) {
  const [liveViewUrl, setLiveViewUrl] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  const startSession = async () => {
    setLoading(true);
    const res = await fetch("/api/takeover/start", { method: "POST" });
    const data = await res.json();
    setSessionId(data.sessionId);
    setLiveViewUrl(data.liveViewUrl);
    setLoading(false);
  };

  const exit = async () => {
    if (sessionId) {
      await fetch("/api/takeover/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    }
    setLiveViewUrl(null);
    setSessionId(null);
    onExit?.();
  };

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0a0a0a", zIndex: 300, display: "flex", flexDirection: "column" }}>
      {!liveViewUrl ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={startSession} disabled={loading} style={{ padding: "10px 20px", borderRadius: 8, background: "#f4f4f2", border: "none", cursor: "pointer" }}>
            {loading ? "Starting..." : "Take control"}
          </button>
        </div>
      ) : (
        <iframe
          src={liveViewUrl}
          style={{ flex: 1, border: "none" }}
          allow="clipboard-read; clipboard-write"
        />
      )}
      <button
        onClick={exit}
        style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", padding: "9px 18px", borderRadius: 999, background: "#f4f4f2", color: "#0a0a0a", border: "none", fontWeight: 600, cursor: "pointer", zIndex: 310 }}
      >
        Exit takeover
      </button>
    </div>
  );
}
