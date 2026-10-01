// streamDebug.js
// Two things in here:
//
// 1. normalizeStreamEvent(type, data) — call this INSIDE your existing
//    SSE handler, wherever you currently do `switch(event.type)` or
//    `if (type === 'thinking') ...`. It maps every alias your backend
//    might be using for each event kind onto one canonical kind, so a
//    naming mismatch (image_results vs images vs imageResults) can't
//    silently drop data anymore.
//
// 2. <StreamDebugOverlay /> — a small fixed panel you drop into your
//    app root. It shows every raw SSE event as it arrives, live, right
//    on screen. No DevTools, no Network tab — just watch the panel
//    while you send a query and you'll see exactly what your backend
//    is actually sending and under what name.
//
// ------------------------------------------------------------------
// USAGE
// ------------------------------------------------------------------
// In your SSE handler file:
//
//   import { normalizeStreamEvent, logStreamEvent } from './streamDebug'
//
//   eventSource.onmessage = (e) => {
//     const raw = JSON.parse(e.data)
//     logStreamEvent(raw.type ?? raw.event, raw)      // <-- add this line
//     const { kind, payload } = normalizeStreamEvent(raw.type ?? raw.event, raw)
//
//     if (kind === 'images') {
//       setMessage(m => ({ ...m, images: payload }))   // guaranteed to fire now
//     } else if (kind === 'thinking') {
//       ...
//     }
//   }
//
// In your app root (e.g. App.jsx), render once:
//
//   import { StreamDebugOverlay } from './streamDebug'
//   ...
//   <StreamDebugOverlay />
//
// Remove both once you've confirmed the real event/key name and hardcoded
// the fix — this is a diagnostic + safety net, not meant to live forever.
// ------------------------------------------------------------------

import { useEffect, useState } from 'react'

// ---- alias tables: every name we've seen backends use for each kind ----
const KIND_ALIASES = {
  images: ['images', 'image_results', 'imageResults', 'image_urls', 'imageUrls', 'photos'],
  sources: ['sources', 'source_results', 'sourceResults', 'citations', 'results'],
  thinking: ['thinking', 'step', 'steps', 'status', 'progress'],
  token: ['token', 'delta', 'chunk', 'text'],
  done: ['done', 'end', 'complete', 'finish'],
}

function aliasToKind(rawType) {
  if (!rawType) return null
  const t = String(rawType).toLowerCase()
  for (const [kind, aliases] of Object.entries(KIND_ALIASES)) {
    if (aliases.includes(t)) return kind
  }
  return null
}

// Images can also show up nested under different payload keys
// (data.images vs data.results vs data itself being the array).
function extractImagesPayload(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.images)) return data.images
  if (Array.isArray(data?.image_results)) return data.image_results
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.data)) return data.data
  return []
}

export function normalizeStreamEvent(rawType, data) {
  const kind = aliasToKind(rawType)
  if (kind === 'images') {
    return { kind, payload: extractImagesPayload(data) }
  }
  return { kind: kind || `unknown:${rawType}`, payload: data }
}

// ---- shared in-memory log the overlay reads from ----
let listeners = []
let history = []

export function logStreamEvent(rawType, data) {
  const entry = { rawType, data, time: new Date().toLocaleTimeString() }
  history = [...history.slice(-49), entry] // keep last 50
  listeners.forEach((fn) => fn(history))
}

export function StreamDebugOverlay() {
  const [events, setEvents] = useState(history)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    listeners.push(setEvents)
    return () => { listeners = listeners.filter((fn) => fn !== setEvents) }
  }, [])

  return (
    <div style={{
      position: 'fixed', bottom: 12, right: 12, width: 360, maxHeight: open ? 320 : 36,
      background: '#111', border: '1px solid #333', borderRadius: 10,
      fontFamily: 'monospace', fontSize: 11, color: '#ddd', zIndex: 9999,
      overflow: 'hidden', transition: 'max-height 0.2s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          padding: '8px 10px', background: '#1a1a1a', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333',
        }}
      >
        <span>stream events ({events.length})</span>
        <span>{open ? '▾' : '▸'}</span>
      </div>
      {open && (
        <div style={{ overflowY: 'auto', maxHeight: 280, padding: '6px 10px' }}>
          {events.length === 0 && <div style={{ color: '#666' }}>waiting for a query…</div>}
          {events.map((e, i) => {
            const kind = aliasToKind(e.rawType)
            const isImageish = e.rawType && /image|photo/i.test(String(e.rawType))
            return (
              <div key={i} style={{ marginBottom: 6, paddingBottom: 6, borderBottom: '1px solid #222' }}>
                <div style={{ color: kind ? '#7C83DB' : isImageish ? '#CC785C' : '#888' }}>
                  [{e.time}] type: <b>{String(e.rawType)}</b>{kind ? '' : '  ← no alias matched'}
                </div>
                <div style={{ color: '#666', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {JSON.stringify(e.data).slice(0, 200)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}