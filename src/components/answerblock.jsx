import { useState, useRef, useEffect, memo } from 'react'
import { Check } from 'lucide-react'

// ============================================================
// SourcesTabs — the "Steps / Sources / Images" strip that
// appears once ThinkingPanel's live steps have something to
// show. Purely presentational: parent owns which tab is active.
// ============================================================
export function SourcesTabs({ active, onChange, sourceCount = 0, imageCount = 0, visible }) {
  if (!visible) return null
  const tabs = [
    { key: 'steps', label: 'Steps' },
    { key: 'sources', label: `Sources${sourceCount ? `  ${sourceCount}` : ''}` },
    { key: 'images', label: `Images${imageCount ? `  ${imageCount}` : ''}` },
  ]
  return (
    <div style={{
      display: 'flex', gap: 6, margin: '2px 0 14px 0',
      animation: 'answerBlockIn 300ms ease both',
    }}>
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            fontSize: 12.5, padding: '6px 12px', borderRadius: 999,
            border: `1px solid ${active === t.key ? '#CC785C' : 'rgba(255,255,255,0.12)'}`,
            background: active === t.key ? 'rgba(204,120,92,0.16)' : 'transparent',
            color: active === t.key ? '#EDEDEC' : '#8A8A86',
            cursor: 'pointer',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ============================================================
// ImageResultsGrid — asymmetric mosaic (one tall tile + two
// stacked), last tile gets a "+N" overlay when there are more
// images than fit. Pass real thumbnail URLs in `images`; falls
// back to a subtle gradient swatch if a thumb is missing.
// ============================================================
export function ImageResultsGrid({ images = [], visible }) {
  if (!visible || images.length === 0) return null
  const shown = images.slice(0, 3)
  const remaining = images.length - shown.length

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: 6,
      height: 200,
      borderRadius: 14,
      overflow: 'hidden',
      marginBottom: 16,
      animation: 'answerBlockIn 350ms ease both',
    }}>
      {shown.map((img, i) => {
        const isLast = i === shown.length - 1 && remaining > 0
        const gridArea = i === 0
          ? { gridRow: '1 / 3', gridColumn: '1' }
          : { gridRow: i === 1 ? '1' : '2', gridColumn: '2' }
        return (
          <div key={i} style={{
            position: 'relative',
            ...gridArea,
            background: img.src ? `url(${img.src}) center/cover no-repeat` : 'linear-gradient(135deg,#2a2a28,#161615)',
          }}>
            {img.label && !isLast && (
              <span style={{
                position: 'absolute', bottom: 8, left: 10, fontSize: 11, color: 'rgba(255,255,255,0.85)',
                textShadow: '0 1px 3px rgba(0,0,0,0.6)',
              }}>{img.label}</span>
            )}
            {isLast && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600, color: '#EDEDEC',
              }}>
                +{remaining}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================================
// StreamingAnswer — types markdown-ish HTML in, token by token.
// Feed it the *final* html once your SSE stream completes a
// block (heading/paragraph/list-item), and it animates the
// reveal locally — matches the "typing" feel without needing
// per-character events from the backend.
// ============================================================
export function StreamingAnswer({ blocks = [], onDone }) {
  const containerRef = useRef(null)
  const doneRef = useRef(false)

  useEffect(() => {
    doneRef.current = false
    let cancelled = false
    const el = containerRef.current
    if (!el) return
    el.innerHTML = ''

    async function run() {
      for (const block of blocks) {
        if (cancelled) return
        const node = document.createElement(
          block.type === 'h4' ? 'h4' : block.type === 'li' ? 'li' : 'p'
        )
        if (block.type === 'li') {
          let ul = el.lastElementChild
          if (!ul || ul.tagName !== 'UL') {
            ul = document.createElement('ul')
            ul.style.margin = '6px 0'
            ul.style.paddingLeft = '20px'
            el.appendChild(ul)
          }
          ul.appendChild(node)
        } else {
          node.style.margin = block.type === 'h4' ? '16px 0 6px 0' : '0 0 8px 0'
          el.appendChild(node)
        }

        const tokens = block.html.split(/(<[^>]+>)/g).filter(Boolean)
        let buf = ''
        for (const tok of tokens) {
          if (cancelled) return
          buf += tok
          node.innerHTML = buf
          if (!tok.startsWith('<')) await wait(10 + Math.random() * 16)
        }
      }
      if (!cancelled) {
        doneRef.current = true
        onDone && onDone()
      }
    }
    run()
    return () => { cancelled = true }
  }, [blocks])

  return (
    <div
      ref={containerRef}
      style={{ fontSize: 15, lineHeight: 1.65, color: '#EDEDEC' }}
    />
  )
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)) }

// shared keyframe, injected once by whichever of these renders first
if (typeof document !== 'undefined' && !document.getElementById('answer-block-keyframes')) {
  const style = document.createElement('style')
  style.id = 'answer-block-keyframes'
  style.textContent = `@keyframes answerBlockIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }`
  document.head.appendChild(style)
}