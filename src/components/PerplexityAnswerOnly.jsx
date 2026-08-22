import { useState, useEffect } from "react";
import {
  Copy, ThumbsUp, ThumbsDown, RotateCcw, ArrowUpRight,
  CornerDownRight, Globe, ArrowUp, Plus, Mic, ImageIcon, Share2
} from "lucide-react";

const T = {
  void: "#0B0B0D",
  surface: "#141413",
  surfaceRaised: "#1A1A19",
  border: "rgba(255,255,255,0.08)",
  borderSoft: "rgba(255,255,255,0.05)",
  textPrimary: "#EDECE8",
  textSecondary: "rgba(237,236,232,0.62)",
  textFaint: "rgba(237,236,232,0.38)",
  clay: "#CC785C",
  periwinkle: "#7C83DB",
  periwinkleSoft: "rgba(124,131,219,0.12)",
};

const QUERY = "who is messi";

const SOURCES = [
  { domain: "britannica.com", title: "Lionel Messi — Argentine footballer", fav: "📘" },
  { domain: "fifa.com", title: "2022 World Cup final report — Argentina", fav: "⚽" },
  { domain: "espn.com", title: "Messi career stats and records", fav: "📊" },
  { domain: "goal.com", title: "Messi's Ballon d'Or history, all 8 wins", fav: "🏆" },
  { domain: "intermiamicf.com", title: "Official Inter Miami CF profile", fav: "🌴" },
  { domain: "fcbarcelona.com", title: "Messi at Barcelona, 2004–2021", fav: "🔵" },
];

// Placeholder image tiles — swap `caption` sourcing for a real image API (Tavily images, Bing, etc.)
const IMAGES = [
  { caption: "Lifting the World Cup, Qatar 2022", credit: "Getty Images" },
  { caption: "Barcelona debut era, 2004–2021", credit: "Reuters" },
  { caption: "8th Ballon d'Or ceremony, 2023", credit: "AFP" },
  { caption: "Inter Miami CF, MLS debut 2023", credit: "AP" },
];

const BLOCKS = [
  {
    type: "p",
    text: "Lionel Messi is an Argentine professional footballer, widely regarded as one of the greatest players in the sport's history. He plays as a forward for Inter Miami CF and captains the Argentina national team.",
    cites: [1, 3],
  },
  { type: "images" },
  { type: "h", text: "Career highlights" },
  {
    type: "li",
    items: [
      { text: "Won a record 8 Ballon d'Or awards, more than any other player.", cites: [4] },
      { text: "Spent 17 seasons at FC Barcelona, winning 10 La Liga titles and 4 Champions Leagues.", cites: [6] },
      { text: "Captained Argentina to victory at the 2022 FIFA World Cup in Qatar, finally completing his trophy cabinet.", cites: [2] },
      { text: "Joined Inter Miami CF in 2023, sparking a surge in MLS attendance and global viewership.", cites: [5] },
    ],
  },
  { type: "h", text: "Playing style" },
  {
    type: "p",
    text: "Messi is known for close ball control at low speed, exceptional dribbling in tight spaces, and elite finishing with his left foot. Unlike many top forwards, his game relies on balance and vision rather than physical power.",
    cites: [3],
  },
];

function Cite({ n, onHover }) {
  return (
    <sup
      onMouseEnter={() => onHover(n)}
      onMouseLeave={() => onHover(null)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 15, height: 15, fontSize: 9, fontWeight: 600, borderRadius: 4,
        background: T.periwinkleSoft, color: T.periwinkle, marginLeft: 3, marginRight: 1,
        cursor: "pointer", verticalAlign: "top", lineHeight: "15px", textAlign: "center",
      }}
    >
      {n}
    </sup>
  );
}

function withCites(text, cites, onHover) {
  if (!cites?.length) return text;
  return <>{text}{cites.map((n) => <Cite key={n} n={n} onHover={onHover} />)}</>;
}

function ImageRow({ onOpenImages }) {
  return (
    <div style={{ margin: "4px 0 18px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {IMAGES.map((img, i) => (
          <div
            key={i}
            onClick={onOpenImages}
            style={{
              aspectRatio: "1 / 1",
              borderRadius: 10,
              background: `linear-gradient(135deg, ${T.surfaceRaised}, ${T.surface})`,
              border: `1px solid ${T.borderSoft}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              cursor: "pointer",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <ImageIcon size={18} color={T.textFaint} />
            {i === 3 && (
              <div style={{
                position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: T.textPrimary,
              }}>
                +12
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10.5, color: T.textFaint, marginTop: 6 }}>
        {IMAGES[0].caption} · {IMAGES[0].credit}
      </div>
    </div>
  );
}

function useReveal(total, active, speed) {
  const [n, setN] = useState(active ? 0 : total);
  useEffect(() => {
    if (!active || n >= total) return;
    const id = setTimeout(() => setN((v) => v + 1), speed);
    return () => clearTimeout(id);
  }, [n, active, total, speed]);
  return n;
}

export default function PerplexityAnswerOnly() {
  const [tab, setTab] = useState("answer");
  const [hovered, setHovered] = useState(null);
  const [streaming, setStreaming] = useState(true);
  const [followInput, setFollowInput] = useState("");
  const revealed = useReveal(BLOCKS.length, streaming, 400);

  useEffect(() => { if (revealed >= BLOCKS.length) setStreaming(false); }, [revealed]);

  const FOLLOWUPS = [
    "How many World Cups has Messi won?",
    "How does his Barcelona era compare to PSG and Inter Miami?",
    "What records does he still hold at Barcelona?",
  ];

  return (
    <div style={{
      background: T.void, color: T.textPrimary, minHeight: "100%",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px", borderBottom: `1px solid ${T.borderSoft}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: T.clay }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Stoic</span>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600,
          padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
          background: "transparent", color: T.textSecondary,
        }}>
          <Share2 size={13} /> Share
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "28px 20px 140px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
            <div style={{
              background: T.surfaceRaised, border: `1px solid ${T.border}`, borderRadius: 14,
              padding: "10px 16px", fontSize: 15, fontWeight: 500, maxWidth: "82%",
            }}>
              {QUERY}
            </div>
          </div>

          <div style={{ display: "flex", gap: 22, marginBottom: 18, borderBottom: `1px solid ${T.borderSoft}` }}>
            {[
              { id: "answer", label: "Answer" },
              { id: "images", label: `Images · ${IMAGES.length + 12}` },
              { id: "sources", label: `Sources · ${SOURCES.length}` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: "none", border: "none", padding: "0 0 10px 0",
                  fontSize: 13, fontWeight: 600,
                  color: tab === t.id ? T.textPrimary : T.textFaint,
                  borderBottom: tab === t.id ? `2px solid ${T.clay}` : "2px solid transparent",
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "answer" && (
            <>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 2 }}>
                {SOURCES.map((s, i) => (
                  <div key={i} style={{
                    flex: "0 0 auto", width: 148,
                    background: hovered === i + 1 ? T.periwinkleSoft : T.surface,
                    border: `1px solid ${hovered === i + 1 ? T.periwinkle : T.borderSoft}`,
                    borderRadius: 10, padding: "9px 10px", transition: "all 0.15s ease",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 11 }}>{s.fav}</span>
                      <span style={{ fontSize: 10, color: T.textFaint, fontWeight: 600 }}>{s.domain}</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.textSecondary, lineHeight: 1.35 }}>
                      {s.title.length > 46 ? s.title.slice(0, 46) + "…" : s.title}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 15, lineHeight: 1.7 }}>
                {BLOCKS.slice(0, revealed).map((b, idx) => {
                  if (b.type === "images") return <ImageRow key={idx} onOpenImages={() => setTab("images")} />;
                  if (b.type === "h") {
                    return <h3 key={idx} style={{ fontSize: 15, fontWeight: 700, margin: "18px 0 8px" }}>{b.text}</h3>;
                  }
                  if (b.type === "li") {
                    return (
                      <ul key={idx} style={{ margin: "0 0 14px", paddingLeft: 18 }}>
                        {b.items.map((it, j) => (
                          <li key={j} style={{ marginBottom: 6 }}>{withCites(it.text, it.cites, setHovered)}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={idx} style={{ margin: "0 0 14px" }}>{withCites(b.text, b.cites, setHovered)}</p>;
                })}
                {streaming && (
                  <span style={{
                    display: "inline-block", width: 6, height: 15, background: T.clay,
                    borderRadius: 2, animation: "stoic-blink 1s step-start infinite", verticalAlign: "text-bottom",
                  }} />
                )}
              </div>

              {!streaming && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "10px 0 26px" }}>
                    {[Copy, ThumbsUp, ThumbsDown, RotateCcw].map((Icon, i) => (
                      <button key={i} style={{ background: "none", border: "none", color: T.textFaint, cursor: "pointer", padding: 4 }}>
                        <Icon size={15} />
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 700, color: T.textFaint, marginBottom: 10, letterSpacing: 0.3 }}>
                    FOLLOW-UP
                  </div>
                  {FOLLOWUPS.map((f, i) => (
                    <button key={i} style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                      background: "none", border: "none", borderTop: `1px solid ${T.borderSoft}`,
                      padding: "12px 0", fontSize: 14, color: T.textPrimary, cursor: "pointer",
                    }}>
                      <CornerDownRight size={14} color={T.textFaint} /> {f}
                    </button>
                  ))}
                </>
              )}
            </>
          )}

          {tab === "images" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[...IMAGES, ...IMAGES, ...IMAGES].slice(0, 12).map((img, i) => (
                <div key={i} style={{
                  aspectRatio: "1 / 1", borderRadius: 10,
                  background: `linear-gradient(135deg, ${T.surfaceRaised}, ${T.surface})`,
                  border: `1px solid ${T.borderSoft}`, display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <ImageIcon size={18} color={T.textFaint} />
                </div>
              ))}
            </div>
          )}

          {tab === "sources" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SOURCES.map((s, i) => (
                <a key={i} style={{
                  display: "flex", gap: 12, padding: 14, borderRadius: 12,
                  border: `1px solid ${T.borderSoft}`, background: T.surface,
                  textDecoration: "none", color: T.textPrimary,
                }}>
                  <span style={{ fontSize: 16 }}>{s.fav}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: T.textFaint }}>{s.domain}</div>
                  </div>
                  <ArrowUpRight size={14} color={T.textFaint} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ position: "sticky", bottom: 0, padding: "0 20px 20px", background: `linear-gradient(180deg, transparent, ${T.void} 30%)` }}>
        <div style={{
          maxWidth: 700, margin: "0 auto", background: T.surfaceRaised,
          border: `1px solid ${T.border}`, borderRadius: 16, padding: "10px 12px",
        }}>
          <input
            value={followInput}
            onChange={(e) => setFollowInput(e.target.value)}
            placeholder="Ask a follow-up…"
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: T.textPrimary, fontSize: 14, padding: "4px 6px 10px" }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={pillBtn()}><Plus size={13} /></button>
              <button style={pillBtn()}><Globe size={13} /> Search</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Mic size={16} color={T.textFaint} />
              <button style={{
                width: 30, height: 30, borderRadius: "50%", background: T.clay, border: "none",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}>
                <ArrowUp size={15} color={T.void} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes stoic-blink { 50% { opacity: 0; } }
        ::-webkit-scrollbar { height: 0px; width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}

function pillBtn() {
  return {
    display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600,
    color: T.textSecondary, background: "transparent", border: `1px solid ${T.border}`,
    borderRadius: 20, padding: "5px 10px", cursor: "pointer",
  };
}