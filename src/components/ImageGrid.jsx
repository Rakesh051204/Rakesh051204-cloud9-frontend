import { useState, useEffect, useMemo, useRef } from 'react'

const MAX_IMAGES = 12
const LOAD_TIMEOUT_MS = 9000
const JUNK = /(logo|favicon|icon|sprite|placeholder|avatar-default|brand-mark|og-image|apple-touch)/i

const fullUrl = (img) => img.url || img.src
const thumbUrl = (img) => img.thumb || img.thumbnail || img.url || img.src
const proxied = (u) => 'https://images.weserv.nl/?url=' + encodeURIComponent(String(u).replace(/^https?:\/\//, '')) + '&default=404'

function isJunk(img) {
  const s = fullUrl(img) || ''
  if (JUNK.test(s)) return true
  if (img.width && img.height && (img.width < 200 || img.height < 200)) return true
  return false
}

function Tile({ img, delay, onFail, onClick, onLoaded }) {
  const [stage, setStage] = useState('direct')
  const [ok, setOk] = useState(false)
  const base = thumbUrl(img)
  const src = stage === 'direct' ? base : proxied(base)

  useEffect(() => {
    if (ok) return
    const t = setTimeout(() => {
      if (stage === 'direct') setStage('proxy')
      else onFail()
    }, LOAD_TIMEOUT_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, ok])

  const handleError = () => {
    if (stage === 'direct') setStage('proxy')
    else onFail()
  }
  const handleLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target
    if (naturalWidth < 120 || naturalHeight < 120) { onFail(); return }
    setOk(true)
    onLoaded && onLoaded()
  }

  const cap = img.title || img.alt || img.description || ''
  const from = img.source || ''

  return (
    <div className="sg-item" onClick={() => onClick && onClick(img)}>
      <div className={'sg-img' + (ok ? ' ok' : '')} style={{ '--d': delay + 'ms' }}>
        <img
          key={stage}
          src={src}
          alt={cap}
          referrerPolicy="no-referrer"
          loading="eager"
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
      {(cap || from) && <div className="sg-cap">{cap}{from ? ' Source: ' + from : ''}</div>}
    </div>
  )
}

export default function ImageGrid({ images = [], onImageClick }) {
  const ref = useRef(null)
  const [failed, setFailed] = useState({})
  const [edge, setEdge] = useState({ l: false, r: false })

  const list = useMemo(
    () => (images || []).filter((im) => im && thumbUrl(im) && !isJunk(im)).slice(0, MAX_IMAGES),
    [images]
  )
  const shown = list.map((im, i) => ({ im, i })).filter((x) => !failed[x.i])

  const measure = () => {
    const el = ref.current
    if (!el) return
    setEdge({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 })
  }
  useEffect(() => { measure() }, [shown.length])

  if (shown.length === 0) return null

  const go = (d) => {
    const el = ref.current
    if (el) el.scrollBy({ left: d * Math.max(240, el.clientWidth * 0.7), behavior: 'smooth' })
  }

  return (
    <div className="sg-wrap">
      <div className="sg-row" ref={ref} onScroll={measure}>
        {shown.map(({ im, i }, n) => (
          <Tile
            key={i + '-' + thumbUrl(im)}
            img={im}
            delay={Math.min(n, 5) * 100}
            onLoaded={measure}
            onClick={onImageClick}
            onFail={() => setFailed((p) => ({ ...p, [i]: true }))}
          />
        ))}
      </div>
      {edge.l && <button className="sg-arrow l" onClick={() => go(-1)}>&#8249;</button>}
      {edge.r && <button className="sg-arrow r" onClick={() => go(1)}>&#8250;</button>}
    </div>
  )
}

if (typeof document !== 'undefined' && !document.getElementById('sg-css')) {
  const st = document.createElement('style')
  st.id = 'sg-css'
  st.textContent = `
.sg-wrap{position:relative;margin:4px 0 16px}
.sg-row{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x proximity;scrollbar-width:none;align-items:flex-start;padding-bottom:2px}
.sg-row::-webkit-scrollbar{display:none}
.sg-item{flex:0 0 auto;display:flex;flex-direction:column;gap:6px;cursor:pointer;scroll-snap-align:start}
.sg-img{position:relative;flex:0 0 auto;height:170px;min-width:170px;border-radius:14px;overflow:hidden;background:linear-gradient(100deg,#1a1a19 30%,#2a2a28 50%,#1a1a19 70%);background-size:220% 100%;animation:sgShim 1.4s linear infinite}
.sg-img.ok{min-width:0;animation:none;background:#161615}
.sg-img img{display:block;height:100%;width:auto;max-width:none;opacity:0;filter:blur(20px);transform:scale(1.06);transition:opacity .7s ease var(--d,0ms),filter .9s ease var(--d,0ms),transform .9s ease var(--d,0ms)}
.sg-img.ok img{opacity:1;filter:blur(0);transform:scale(1)}
.sg-cap{width:0;min-width:100%;font-size:11px;font-style:italic;line-height:1.35;color:#8A8A86;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sg-arrow{position:absolute;top:68px;width:34px;height:34px;border-radius:50%;border:none;background:rgba(20,20,20,.92);color:#fff;font-size:22px;line-height:1;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.5);z-index:3}
.sg-arrow:hover{background:#2a2a28}
.sg-arrow.l{left:6px}.sg-arrow.r{right:6px}
@keyframes sgShim{from{background-position:120% 0}to{background-position:-120% 0}}
`
  document.head.appendChild(st)
}