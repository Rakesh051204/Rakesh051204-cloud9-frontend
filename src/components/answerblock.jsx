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
function GridTile({ img, delay = 0, overlay, onClick }) {
  const [ok, setOk] = useState(false)
  const [bad, setBad] = useState(false)
  const src = img.src || img.thumb || img.url
  return (
    <div className={'irg-tile' + (ok ? ' ok' : '')} style={{ '--d': delay + 'ms' }} onClick={onClick}>
      {src && !bad && (
        <img
          src={src}
          alt={img.label || img.alt || ''}
          ref={(el) => { if (el && !ok && el.complete && el.naturalWidth) setOk(true) }}
          onLoad={() => setOk(true)}
          onError={() => setBad(true)}
        />
      )}
      {img.label && !overlay && ok && <span className="irg-label">{img.label}</span>}
      {overlay}
    </div>
  )
}

function CarouselTile({ img, delay = 0, onClick, onLoaded }) {
  const [ok, setOk] = useState(false)
  const [bad, setBad] = useState(false)
  const src = img.src || img.thumb || img.url
  if (!src || bad) return null
  const cap = img.label || img.title || img.alt || ''
  const from = img.source || img.domain || ''
  const done = () => { setOk(true); onLoaded && onLoaded() }
  return (
    <div className="gc-item" onClick={onClick}>
      <div className={'gc-img' + (ok ? ' ok' : '')} style={{ '--d': delay + 'ms' }}>
        <img
          src={src}
          alt={cap}
          ref={(el) => { if (el && !ok && el.complete && el.naturalWidth) done() }}
          onLoad={done}
          onError={() => setBad(true)}
        />
      </div>
      {(cap || from) && <div className="gc-cap">{cap}{from ? ' Source: ' + from : ''}</div>}
    </div>
  )
}

export function ImageResultsGrid({ images = [], visible, loading = false, onImageClick }) {
  const ref = useRef(null)
  const [edge, setEdge] = useState({ l: false, r: false })
  const list = (images || []).filter((im) => im && (im.src || im.thumb || im.url))

  const measure = () => {
    const el = ref.current
    if (!el) return
    setEdge({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 })
  }
  useEffect(() => { measure() }, [list.length])

  if (!visible) return null
  if (list.length === 0 && !loading) return null

  const go = (d) => {
    const el = ref.current
    if (el) el.scrollBy({ left: d * Math.max(240, el.clientWidth * 0.7), behavior: 'smooth' })
  }

  return (
    <div className="gc-wrap">
      <div className="gc-row" ref={ref} onScroll={measure}>
        {list.length === 0
          ? [0, 1, 2].map((i) => <div key={i} className="gc-img gc-sk" />)
          : list.map((im, i) => (
              <CarouselTile
                key={i + (im.src || im.thumb || im.url)}
                img={im}
                delay={Math.min(i, 5) * 100}
                onLoaded={measure}
                onClick={() => onImageClick && onImageClick(i)}
              />
            ))}
      </div>
      {edge.l && <button className="gc-arrow l" onClick={() => go(-1)}>‹</button>}
      {edge.r && <button className="gc-arrow r" onClick={() => go(1)}>›</button>}
    </div>
  )
}

if (typeof document !== 'undefined' && !document.getElementById('gc-css')) {
  const st = document.createElement('style')
  st.id = 'gc-css'
  st.textContent = `
.gc-wrap{position:relative;margin:2px 0 16px;animation:answerBlockIn 350ms ease both}
.gc-row{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x proximity;scrollbar-width:none;align-items:flex-start;padding-bottom:2px}
.gc-row::-webkit-scrollbar{display:none}
.gc-item{flex:0 0 auto;display:flex;flex-direction:column;gap:6px;cursor:pointer;scroll-snap-align:start}
.gc-img{position:relative;flex:0 0 auto;height:170px;min-width:170px;border-radius:14px;overflow:hidden;background:linear-gradient(100deg,#1a1a19 30%,#2a2a28 50%,#1a1a19 70%);background-size:220% 100%;animation:gcShim 1.4s linear infinite}
.gc-img.ok{min-width:0;animation:none;background:#161615}
.gc-sk{width:200px}
.gc-img img{display:block;height:100%;width:auto;max-width:none;opacity:0;filter:blur(20px);transform:scale(1.06);transition:opacity .7s ease var(--d,0ms),filter .9s ease var(--d,0ms),transform .9s ease var(--d,0ms)}
.gc-img.ok img{opacity:1;filter:blur(0);transform:scale(1)}
.gc-cap{width:0;min-width:100%;font-size:11px;font-style:italic;line-height:1.35;color:#8A8A86;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.gc-arrow{position:absolute;top:68px;width:34px;height:34px;border-radius:50%;border:none;background:rgba(20,20,20,.92);color:#fff;font-size:22px;line-height:1;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.5);z-index:3}
.gc-arrow:hover{background:#2a2a28}
.gc-arrow.l{left:6px}.gc-arrow.r{right:6px}
@keyframes gcShim{from{background-position:120% 0}to{background-position:-120% 0}}
`
  document.head.appendChild(st)
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