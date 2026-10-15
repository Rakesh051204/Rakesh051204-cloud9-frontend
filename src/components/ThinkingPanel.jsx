import { useState, useRef, useEffect, memo } from 'react'
import { ChevronRight, Check } from 'lucide-react'

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
      if (groupRef.current) groupRef.current.setAttribute('transform', `rotate(${angleRef.current} 50 50)`)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); lastTsRef.current = null }
  }, [])
  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: 'visible' }}>
        <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="7" />
        <g ref={groupRef}>
          <circle cx="50" cy="12" r="9" fill="#ffffff" style={{ filter: 'drop-shadow(0 0 4px #fff) drop-shadow(0 0 8px #fff)' }} />
        </g>
      </svg>
    </div>
  )
})

function MorphingStatusLine({ text }) {
  const [displayText, setDisplayText] = useState(text)
  const [fading, setFading] = useState(false)
  const prevTextRef = useRef(text)
  useEffect(() => {
    if (text === prevTextRef.current) return
    prevTextRef.current = text
    setFading(true)
    const t = setTimeout(() => { setDisplayText(text); setFading(false) }, 220)
    return () => clearTimeout(t)
  }, [text])
  return (
    <span style={{ fontSize: 13.5, color: '#EDEDEC', fontStyle: 'italic', lineHeight: 1.5, display: 'inline-block', opacity: fading ? 0 : 1, transform: fading ? 'translateY(-4px)' : 'translateY(0)', transition: 'opacity 220ms ease, transform 220ms ease' }}>
      {displayText}
    </span>
  )
}

function useTyped(text) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    if (!text) return
    const id = setInterval(() => {
      setN((v) => { if (v >= text.length) { clearInterval(id); return v } return v + 3 })
    }, 16)
    return () => clearInterval(id)
  }, [text])
  return text ? text.slice(0, n) : ''
}

// Reveals sources one at a time while live, so tabs/cards appear like a real browsing session.
function useReveal(total, live) {
  const [n, setN] = useState(live ? 0 : total)
  useEffect(() => {
    if (!live) { setN(total); return }
    if (n >= total) return
    const gap = Math.max(260, Math.min(520, 2800 / Math.max(total, 1)))
    const t = setTimeout(() => setN((v) => Math.min(v + 1, total)), gap)
    return () => clearTimeout(t)
  }, [total, live, n])
  return live ? Math.min(n, total) : total
}

function normSource(s) {
  const url = s.url || s.link || ''
  let domain = s.domain || ''
  if (!domain && url) { try { domain = new URL(url).hostname.replace(/^www\./, '') } catch (e) { domain = '' } }
  const favicon = s.favicon || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : '')
  return { url, domain, favicon, title: s.title || domain, snippet: s.snippet || '' }
}

function collectSources(steps, extra) {
  const seen = new Map()
  const add = (s) => {
    const n = normSource(s)
    const key = n.domain || n.url
    if (!key) return
    if (!seen.has(key)) seen.set(key, n)
    else if (!seen.get(key).snippet && n.snippet) seen.set(key, n)
  }
  for (const step of steps) for (const s of step.sources || []) add(s)
  for (const s of extra || []) add(s)
  return Array.from(seen.values())
}

const prettyStep = (t) => { const s = (t || '').replace(/^Searching:\s*/i, 'Searching '); return s.length > 40 ? s.slice(0, 40).trim() + '…' : s }
const isSourceSummary = (t) => /^Found \d+ sources:/i.test(t || '')
const KEYFRAMES = `
@keyframes thinkingPillIn { from { opacity: 0; transform: translateY(3px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes thinkingTabIn { from { opacity: 0; transform: translateY(5px) scale(0.94); } to { opacity: 1; transform: none; } }
@keyframes thinkingBar { from { transform: translateX(-100%); } to { transform: translateX(260%); } }
@keyframes thinkingCaret { 50% { opacity: 0; } }
@keyframes thinkingDots { 50% { opacity: 0.2; } }
`

function Favicon({ src, size = 14 }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return <div style={{ width: size, height: size, borderRadius: 3, flexShrink: 0, background: '#7C83DB', opacity: 0.6 }} />
  return <img src={src} alt="" referrerPolicy="no-referrer" onError={() => setFailed(true)} style={{ width: size, height: size, borderRadius: 3, flexShrink: 0 }} />
}

function FaviconPill({ source }) {
  const style = { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px 3px 5px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: '#B8B8B4', whiteSpace: 'nowrap', textDecoration: 'none', animation: 'thinkingPillIn 260ms ease' }
  const inner = (<><Favicon src={source.favicon} />{source.domain}</>)
  return source.url ? <a href={source.url} target="_blank" rel="noreferrer" style={style}>{inner}</a> : <div style={style}>{inner}</div>
}

const MAX_PILLS = 12
function PillRow({ sources, indent = 0 }) {
  const [all, setAll] = useState(false)
  if (!sources.length) return null
  const shown = all ? sources : sources.slice(0, MAX_PILLS)
  const hidden = sources.length - shown.length
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, paddingLeft: indent }}>
      {shown.map((s, i) => <FaviconPill key={s.domain || s.url || i} source={s} />)}
      {hidden > 0 && (
        <button onClick={() => setAll(true)} style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: '#B8B8B4', cursor: 'pointer' }}>+{hidden} more</button>
      )}
    </div>
  )
}

// Source card: favicon + title + domain + the relevant snippet
function SourceCard({ source }) {
  return (
    <a href={source.url || undefined} target="_blank" rel="noreferrer" style={{ display: 'block', textDecoration: 'none', padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', animation: 'thinkingPillIn 260ms ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Favicon src={source.favicon} />
        <span style={{ fontSize: 12.5, color: '#EDEDEC', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{source.title}</span>
        <span style={{ fontSize: 11.5, color: '#8A8A86', flexShrink: 0 }}>{source.domain}</span>
      </div>
      {source.snippet && (
        <div style={{ fontSize: 12, color: '#9a9a96', marginTop: 4, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{source.snippet}</div>
      )}
    </a>
  )
}

function CardList({ sources, max = 4 }) {
  if (!sources.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
      {sources.slice(0, max).map((s, i) => <SourceCard key={s.domain || s.url || i} source={normSource(s)} />)}
    </div>
  )
}

function Note({ text, typed }) {
  const shown = useTyped(typed ? text : '')
  const body = typed ? shown : text
  if (!body) return null
  return <div style={{ fontSize: 13, color: '#9a9a96', lineHeight: 1.55, marginTop: 6, fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{body}</div>
}

// ---------- browser-style search strip ----------
function queriesFromSteps(steps) {
  const out = []
  for (const s of steps) {
    const t = s.text || ''
    if (!/^Searching/i.test(t)) continue
    const q = t.replace(/^Searching:?\s*/i, '').replace(/^the web for\s*/i, '').replace(/^["']|["']$/g, '').trim()
    if (q && !out.includes(q)) out.push(q)
  }
  return out.slice(-4)
}

function BrowserStrip({ sources, shownCount, live, queries }) {
  const revealed = sources.slice(0, shownCount)
  const current = revealed[revealed.length - 1]
  const rawUrl = current ? String(current.url || current.domain).replace(/^https?:\/\/(www\.)?/, '') : ''
  const urlText = useTyped(rawUrl.length > 72 ? rawUrl.slice(0, 72) + '…' : rawUrl)
  const tabs = revealed.slice(-4)
  const hidden = revealed.length - tabs.length
  const activeKey = live && current ? (current.domain || current.url) : null

  if (!sources.length && !queries.length && !live) return null

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, padding: 0 }}>
        
        <div style={{ display: 'flex', gap: 4, marginLeft: 0, overflow: 'hidden', flex: 1, minWidth: 0 }}>
          {tabs.map((s) => {
            const key = s.domain || s.url
            const on = key === activeKey
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 11px', fontSize: 12, borderRadius: '9px 9px 0 0', whiteSpace: 'nowrap', background: on ? '#0d0d0c' : 'transparent', color: on ? '#fff' : '#8A8A86', boxShadow: on ? 'inset 0 2px 0 #7C83DB' : 'none', animation: 'thinkingTabIn 300ms ease both', maxWidth: 150, minWidth: 0 }}>
                <Favicon src={s.favicon} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.domain}</span>
                {!on && <span style={{ color: '#3ddc97', fontSize: 11 }}>✓</span>}
              </div>
            )
          })}
          {hidden > 0 && <div style={{ padding: '7px 8px', fontSize: 11.5, color: '#8A8A86', whiteSpace: 'nowrap' }}>+{hidden}</div>}
          {revealed.length === 0 && live && <div style={{ padding: '7px 11px', fontSize: 12, color: '#8A8A86' }}>New tab</div>}
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0 8px', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 999, fontSize: 12, color: '#a9a9b2', overflow: 'hidden' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {urlText || (live ? 'searching…' : '')}
          {live && <i style={{ display: 'inline-block', width: 1, height: 12, background: '#a9a9b2', marginLeft: 2, verticalAlign: -2, animation: 'thinkingCaret 1s steps(1) infinite' }} />}
        </span>
        {live && <span style={{ position: 'absolute', left: 0, bottom: 0, height: 2, width: '40%', background: 'linear-gradient(90deg, transparent, #7C83DB, rgba(124,131,219,0.4))', animation: 'thinkingBar 1.2s linear infinite' }} />}
      </div>

      {(queries.length > 0 || live) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, padding: '0 0 4px' }}>
          {queries.map((q) => (
            <span key={q} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, background: 'rgba(124,131,219,0.12)', border: '1px solid rgba(124,131,219,0.25)', fontSize: 12, color: '#B9BDF0', animation: 'thinkingPillIn 260ms ease', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
              {q}
            </span>
          ))}
          {live && <span style={{ fontSize: 12, color: '#8A8A86' }}>scanning<i style={{ fontStyle: 'normal', animation: 'thinkingDots 1.2s infinite' }}>.</i><i style={{ fontStyle: 'normal', animation: 'thinkingDots 1.2s infinite .2s' }}>.</i><i style={{ fontStyle: 'normal', animation: 'thinkingDots 1.2s infinite .4s' }}>.</i></span>}
        </div>
      )}
    </div>
  )
}

export default function ThinkingPanel({ steps, streaming, sources }) {
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
      const interval = setInterval(() => setElapsed(Math.max(1, Math.round((Date.now() - startRef.current) / 1000))), 1000)
      return () => clearInterval(interval)
    } else if (startRef.current !== null && finalElapsedRef.current === null) {
      finalElapsedRef.current = Math.max(1, Math.round((Date.now() - startRef.current) / 1000))
      setElapsed(finalElapsedRef.current)
      startRef.current = null
    }
  }, [streaming])

  const allSources = collectSources(steps, sources)
  const shownCount = useReveal(allSources.length, streaming)

  if (!streaming && steps.length === 0 && !(sources && sources.length)) return null

  const visible = steps.filter((s) => !isSourceSummary(s.text))
  const currentText = visible.length ? prettyStep(visible[visible.length - 1].text) : null
  const lastNote = [...steps].reverse().find((s) => s.detail)
  const queries = queriesFromSteps(steps)

  if (!streaming) {
    return (
      <div style={{ marginBottom: 10, userSelect: 'none' }}>
        <style>{KEYFRAMES}</style>
        {steps.length > 0 && (
          <button onClick={() => setExpanded((v) => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#8A8A86', fontSize: 13, cursor: 'pointer', padding: 0 }}>
            <span>{expanded ? 'Hide thinking' : 'Show thinking'}</span>
            <ChevronRight size={13} style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 160ms ease' }} />
          </button>
        )}
        {expanded ? (
          <div style={{ marginTop: 8, paddingLeft: 4, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <BrowserStrip sources={allSources} shownCount={allSources.length} live={false} queries={queries} />
              <CardList sources={allSources.filter((s) => s.snippet)} max={6} />
            </div>
            {visible.map((s, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={12} color="#7C83DB" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#B8B8B4', lineHeight: 1.5 }}>{prettyStep(s.text)}</span>
                </div>
                {s.detail && <div style={{ paddingLeft: 20 }}><Note text={s.detail} /></div>}
                {s.sources && s.sources.length > 0 && <div style={{ paddingLeft: 20 }}><PillRow sources={collectSources([s], [])} /></div>}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Check size={12} color="#7C83DB" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#8A8A86' }}>Finished</span>
            </div>
          </div>
        ) : (
          <PillRow sources={allSources} />
        )}
      </div>
    )
  }

  const liveCards = allSources.slice(0, shownCount).filter((s) => s.snippet)

  return (
    <div style={{ marginBottom: 10, userSelect: 'none' }}>
      <style>{KEYFRAMES}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
        <OrbitLoader size={20} />
        <MorphingStatusLine text={currentText || (elapsed > 0 ? `Thinking for ${elapsed}s` : 'Thinking...')} />
      </div>
      <div style={{ paddingLeft: 28 }}>
        {lastNote && <Note text={lastNote.detail} typed />}
        {(allSources.length > 0 || queries.length > 0) && (
          <BrowserStrip sources={allSources} shownCount={shownCount} live={true} queries={queries} />
        )}
        <CardList sources={liveCards} max={4} />
      </div>
    </div>
  )
}