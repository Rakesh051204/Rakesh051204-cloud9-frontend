import { useState, useRef, useEffect, memo } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

// ============================================================
// Ring loader — UNCHANGED from your original.
// ============================================================
const OrbitLoader = memo(function OrbitLoader({ size = 22 }) {
  const groupRef = useRef(null)
  const rafRef = useRef(null)
  const angleRef = useRef(0)
  const lastTsRef = useRef(null)

  useEffect(() => {
    const DEGREES_PER_SEC = 360 / 2.2

    function tick(ts) {
      if (lastTsRef.current === null) lastTsRef.current = ts
      const dt = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts
      angleRef.current = (angleRef.current + DEGREES_PER_SEC * dt) % 360
      if (groupRef.current) {
        groupRef.current.setAttribute('transform', `rotate(${angleRef.current} 50 50)`)
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTsRef.current = null
    }
  }, [])

  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: 'visible' }}>
        <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="7" />
        <g ref={groupRef}>
          <circle
            cx="50" cy="12" r="9" fill="#ffffff"
            style={{ filter: 'drop-shadow(0 0 4px #fff) drop-shadow(0 0 8px #fff)' }}
          />
        </g>
      </svg>
    </div>
  )
})

// ============================================================
// MorphingStatusLine — UNCHANGED.
// ============================================================
function MorphingStatusLine({ text }) {
  const [displayText, setDisplayText] = useState(text)
  const [fading, setFading] = useState(false)
  const prevTextRef = useRef(text)

  useEffect(() => {
    if (text === prevTextRef.current) return
    prevTextRef.current = text
    setFading(true)
    const t = setTimeout(() => {
      setDisplayText(text)
      setFading(false)
    }, 220)
    return () => clearTimeout(t)
  }, [text])

  return (
    <span
      style={{
        fontSize: 13.5,
        color: '#EDEDEC',
        fontStyle: 'italic',
        lineHeight: 1.5,
        display: 'inline-block',
        opacity: fading ? 0 : 1,
        transform: fading ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'opacity 220ms ease, transform 220ms ease',
      }}
    >
      {displayText}
    </span>
  )
}

// ============================================================
// FaviconPill — one small rounded chip: favicon + domain name.
// Fades/pops in when it first appears (GPT-style "reading X" chip).
// ============================================================
function FaviconPill({ source }) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px 3px 5px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontSize: 12,
        color: '#B8B8B4',
        whiteSpace: 'nowrap',
        animation: 'thinkingPillIn 260ms ease',
      }}
    >
      {source.favicon && !imgFailed ? (
        <img
          src={source.favicon}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0 }}
        />
      ) : (
        <div
          style={{
            width: 14, height: 14, borderRadius: 3, flexShrink: 0,
            background: '#7C83DB', opacity: 0.6,
          }}
        />
      )}
      {source.domain}
    </div>
  )
}

// Dedup + accumulate sources across every step seen so far, in order first-seen
function accumulateSources(steps) {
  const seen = new Map()
  for (const step of steps) {
    for (const src of step.sources || []) {
      const key = src.domain || src.url
      if (key && !seen.has(key)) seen.set(key, src)
    }
  }
  return Array.from(seen.values())
}

// ============================================================
// ThinkingPanel
// ============================================================
export default function ThinkingPanel({ steps, streaming }) {
  steps = steps || []
  streaming = !!streaming
  const [expanded, setExpanded] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(null)
  const finalElapsedRef = useRef(null)

  useEffect(() => {
    if (streaming) {
      if (startRef.current === null) startRef.current = Date.now()
      finalElapsedRef.current = null
      const interval = setInterval(() => {
        setElapsed(Math.max(1, Math.round((Date.now() - startRef.current) / 1000)))
      }, 1000)
      return () => clearInterval(interval)
    } else if (startRef.current !== null && finalElapsedRef.current === null) {
      finalElapsedRef.current = Math.max(1, Math.round((Date.now() - startRef.current) / 1000))
      setElapsed(finalElapsedRef.current)
      startRef.current = null
    }
  }, [streaming])

  if (!streaming && steps.length === 0) return null

  const displaySeconds = finalElapsedRef.current || elapsed || 1
  const currentText = steps.length > 0 ? steps[steps.length - 1].text : null
  const allSources = accumulateSources(steps)

  // ---- collapsed "Thought for Xs" state, after streaming finishes ----
  if (!streaming) {
    return (
      <div style={{ marginBottom: 10, userSelect: 'none' }}>
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
            color: '#8A8A86', fontSize: 13, fontStyle: 'italic', cursor: 'pointer', padding: 0,
          }}
        >
          <span>Thought for {displaySeconds}s</span>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        {expanded && (
          <div style={{ marginTop: 8, paddingLeft: 4, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 13, color: '#8A8A86', lineHeight: 1.5 }}>{s.text}</span>
                {s.sources && s.sources.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {s.sources.map((src, j) => (
                      <FaviconPill key={src.domain || j} source={src} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ---- live state: nebula ring + morphing status line + growing favicon row ----
  return (
    <div style={{ marginBottom: 10, userSelect: 'none' }}>
      <style>{`
        @keyframes thinkingPillIn {
          from { opacity: 0; transform: translateY(3px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
        <OrbitLoader size={20} />
        <MorphingStatusLine
          text={currentText || (elapsed > 0 ? `Thinking for ${elapsed}s` : 'Thinking…')}
        />
      </div>
      {allSources.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, paddingLeft: 28 }}>
          {allSources.map((src, i) => (
            <FaviconPill key={src.domain || i} source={src} />
          ))}
        </div>
      )}
    </div>
  )
}