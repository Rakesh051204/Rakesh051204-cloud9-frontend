import { useState, useRef } from "react";
import { Compass, Zap, BrainCircuit, Sparkles } from "lucide-react";

/**
 * ModeCanvas
 * Home page centerpiece: Explore / Spark / Think / Create.
 * Clicking a mode calls the backend /suggest route, which asks Groq to
 * generate 3 specific, context-aware suggestions live — not a static list.
 * Clicking a suggestion submits it directly (calls onSubmit), since the
 * suggestion is meant to be specific enough to commit to immediately.
 *
 * Usage:
 *   <ModeCanvas onSubmit={(text) => handleAsk(text)} />
 */

const MODES = [
  { id: "explore", label: "Explore", icon: Compass, ramp: "blue" },
  { id: "spark", label: "Spark", icon: Zap, ramp: "amber" },
  { id: "think", label: "Think", icon: BrainCircuit, ramp: "purple" },
  { id: "create", label: "Create", icon: Sparkles, ramp: "teal" },
];

const BACKEND_URL = "http://localhost:3001";

export default function ModeCanvas({ onSubmit }) {
  const [activeMode, setActiveMode] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const requestIdRef = useRef(0);

  async function handleModeClick(mode) {
    if (activeMode === mode.id && status === "ready") return;

    setActiveMode(mode.id);
    setStatus("loading");
    setSuggestions([]);

    const thisRequestId = ++requestIdRef.current;

    try {
      const res = await fetch(`${BACKEND_URL}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: mode.id }),
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();

      // Ignore stale responses if the person clicked another mode meanwhile
      if (thisRequestId !== requestIdRef.current) return;

      setSuggestions(data.suggestions || []);
      setStatus("ready");
    } catch (err) {
      if (thisRequestId !== requestIdRef.current) return;
      console.error("Failed to load suggestions:", err);
      setStatus("error");
    }
  }

  function handleSuggestionClick(suggestion) {
    onSubmit?.(suggestion.title);
  }

  const activeModeData = MODES.find((m) => m.id === activeMode);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-7">
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => handleModeClick(mode)}
              className={`
                flex items-center gap-1.5 rounded-full border px-4 py-2.5
                text-sm font-medium transition-colors duration-150
                ${
                  isActive
                    ? "border-accent bg-accent/10 text-primary"
                    : "border-border bg-surface text-secondary hover:text-primary hover:border-accent/40"
                }
              `}
            >
              <Icon size={16} strokeWidth={1.75} />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex min-h-[180px] w-full flex-col items-center justify-center gap-2">
        {status === "idle" && (
          <p className="text-sm text-secondary/70">Pick a mode to see what's worth doing right now.</p>
        )}

        {status === "loading" && (
          <div className="flex items-center gap-2 text-sm text-secondary/70">
            <span className="flex gap-1">
              <Dot delay={0} />
              <Dot delay={150} />
              <Dot delay={300} />
            </span>
            <span>Stoic is thinking</span>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-2 text-sm text-secondary">
            <p>Couldn't reach Stoic just now.</p>
            <button
              type="button"
              onClick={() => activeModeData && handleModeClick(activeModeData)}
              className="text-accent underline-offset-2 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {status === "ready" && (
          <div className="flex w-full flex-col gap-2">
            {suggestions.map((s, i) => (
              <SuggestionCard
                key={`${activeMode}-${i}`}
                suggestion={s}
                index={i}
                onClick={() => handleSuggestionClick(s)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SuggestionCard({ suggestion, index, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ animationDelay: `${index * 60}ms` }}
      className="
        animate-in fade-in slide-in-from-bottom-1 duration-200
        w-full rounded-xl border border-border bg-surface
        px-4 py-3.5 text-left transition-colors duration-150
        hover:border-accent/50
      "
    >
      <p className="text-sm font-medium text-primary">{suggestion.title}</p>
      <p
        className={`
          overflow-hidden text-xs text-secondary/80 transition-all duration-150
          ${hovered ? "mt-1.5 max-h-10" : "max-h-0"}
        `}
      >
        {suggestion.preview}
      </p>
    </button>
  );
}

function Dot({ delay }) {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full bg-secondary/50"
      style={{
        animation: "pulse-dot 1s infinite",
        animationDelay: `${delay}ms`,
      }}
    />
  );
}