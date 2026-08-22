import { useState, useEffect, useRef, memo } from 'react';
import { ChevronDown, ChevronUp, Globe } from 'lucide-react';

// NOTE: pair this with the updated SourcesPanel.jsx, which now has a
// "Steps" tab. Pass the SAME `steps` (with `.sources` per step) and
// `streaming` props to both components so the inline pills here and
// the side-panel Steps tab stay in sync — same shape as the Meta AI
// reference: inline "Searching for X" + pills while streaming, side
// panel Steps/Sources tabs mirroring the same data.

// ============================================================
// Ring loader — a single thin ring with one glowing dot orbiting
// around it, matching the "nebula ring" reference animation.
// Driven by requestAnimationFrame + a DOM ref instead of a CSS
// keyframe animation, and wrapped in React.memo. This matters
// because ThinkingPanel re-renders every second (elapsed-seconds
// timer) — a CSS animation on a child that gets remounted each
// render restarts from 0deg every time and never visibly spins.
// rAF + memo keeps this component mounted once and rotates it
// independently of the parent's render cycle.
// ============================================================
const OrbitLoader = memo(function OrbitLoader({ size = 28 }) {
  const groupRef = useRef(null);
  const rafRef = useRef(null);
  const angleRef = useRef(0);
  const lastTsRef = useRef(null);

  useEffect(() => {
    const DEGREES_PER_SEC = 360 / 2.2; // full loop every 2.2s

    function tick(ts) {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      angleRef.current = (angleRef.current + DEGREES_PER_SEC * dt) % 360;
      if (groupRef.current) {
        groupRef.current.setAttribute(
          'transform',
          `rotate(${angleRef.current} 50 50)`
        );
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, []);

  return (
    <div className="orbit-loader" style={{ width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: 'visible' }}>
        <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="7" />
        <g ref={groupRef}>
          <circle
            cx="50"
            cy="12"
            r="9"
            fill="#ffffff"
            style={{ filter: 'drop-shadow(0 0 4px #fff) drop-shadow(0 0 8px #fff)' }}
          />
        </g>
      </svg>
    </div>
  );
});

// Which icon to show for the current step — search gets a globe,
// everything else just uses the orbit loader alone.
function stepIcon(text = '') {
  if (/search/i.test(text)) return <Globe size={13} className="text-gray-500" />;
  return null;
}

function getDomain(source) {
  try {
    return new URL(source.url).hostname.replace('www.', '');
  } catch (_) {
    return source.domain || '';
  }
}

// Compact inline pill — same visual language as SourcesPanel's
// SourcePill, but small enough to sit inline under a step line.
function InlineSourcePill({ source }) {
  const domain = getDomain(source);
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[10.5px] text-gray-400 max-w-[140px]">
      {source.favicon && (
        <img src={source.favicon} alt="" className="w-3 h-3 rounded-sm flex-shrink-0" />
      )}
      <span className="truncate">{domain}</span>
    </span>
  );
}

function StepSourcePills({ sources = [], max = 4, onSeeAll }) {
  if (!sources.length) return null;
  const shown = sources.slice(0, max);
  const extra = sources.length - shown.length;
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-1.5 pl-[34px]">
      {shown.map((s, i) => (
        <InlineSourcePill key={s.url || i} source={s} />
      ))}
      {extra > 0 && (
        <button
          onClick={onSeeAll}
          className="text-[10.5px] text-gray-500 hover:text-gray-300 px-1.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] transition-colors"
        >
          +{extra} more
        </button>
      )}
    </div>
  );
}

// ============================================================
// Groq-style thinking indicator.
// While streaming: orbit loader + current step text (falls back
// to "Thinking..."), elapsed seconds ticking up, with any sources
// found for the current step shown as pills underneath.
// Once done: collapses to "Thought for Xs" — click to expand
// the raw reasoning steps, each with its own source pills.
// ============================================================
export default function ThinkingPanel({ steps, streaming, onSeeAllSources }) {
  steps = steps || [];
  streaming = streaming || false;
  const [expanded, setExpanded] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(null);
  const finalElapsedRef = useRef(null);
  useEffect(() => {
    if (streaming) {
      if (startRef.current === null) startRef.current = Date.now();
      const interval = setInterval(() => {
        setElapsed(Math.max(1, Math.round((Date.now() - startRef.current) / 1000)));
      }, 1000);
      return () => clearInterval(interval);
    } else if (startRef.current !== null && finalElapsedRef.current === null) {
      finalElapsedRef.current = Math.max(1, Math.round((Date.now() - startRef.current) / 1000));
      setElapsed(finalElapsedRef.current);
    }
  }, [streaming]);
  if (!streaming && steps.length === 0) return null;
  const displaySeconds = finalElapsedRef.current || elapsed || 1;

  if (streaming) {
    const currentStep = steps.length > 0 ? steps[steps.length - 1] : null;
    const currentStepText = currentStep ? currentStep.text : null;
    const icon = stepIcon(currentStepText);
    return (
      <div className="mb-2 select-none">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <OrbitLoader size={28} />
          {icon}
          <span className="italic">
            {currentStepText || (elapsed > 0 ? `Thinking for ${elapsed}s` : 'Thinking...')}
          </span>
        </div>
        {currentStep && (
          <StepSourcePills sources={currentStep.sources} onSeeAll={onSeeAllSources} />
        )}
      </div>
    );
  }

  return (
    <div className="mb-2 select-none">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-300 text-sm italic transition-colors"
      >
        <span>Thought for {displaySeconds}s</span>
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {expanded && steps.length > 0 && (
        <div className="mt-1.5 pl-3 border-l border-white/10 space-y-2">
          {steps.map((step, idx) => {
            const icon = stepIcon(step.text);
            return (
              <div key={idx}>
                <div className="text-[13px] text-gray-500 leading-relaxed flex items-center gap-1.5">
                  {icon}
                  <span>{step.text}</span>
                </div>
                {step.sources && step.sources.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-1 pl-[19px]">
                    {step.sources.slice(0, 4).map((s, i) => (
                      <InlineSourcePill key={s.url || i} source={s} />
                    ))}
                    {step.sources.length > 4 && (
                      <button
                        onClick={onSeeAllSources}
                        className="text-[10.5px] text-gray-500 hover:text-gray-300 px-1.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] transition-colors"
                      >
                        +{step.sources.length - 4} more
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}