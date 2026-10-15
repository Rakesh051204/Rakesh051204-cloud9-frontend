import { useEffect, useMemo, useState } from 'react'

export const initialImageSearch = { active: false, query: '', sources: [], images: [], currentUrl: '' }

export function imageSearchReducer(s, e) {
  switch (e.type) {
    case 'start':
      return { ...initialImageSearch, active: true, query: e.query }
    case 'source':
      return {
        ...s, active: true,
        sources: s.sources.some((x) => x.domain === e.domain) ? s.sources : [...s.sources, { name: e.name, domain: e.domain }],
        currentUrl: e.url || e.domain,
      }
    case 'results':
      return { ...s, images: e.images || [], active: false }
    case 'end':
      return { ...s, active: false }
    default:
      return s
  }
}

function Logo({ domain, name, size = 14 }) {
  const [bad, setBad] = useState(false)
  if (bad || !domain) return <span className="im-letter" style={{ width: size, height: size, fontSize: size * 0.6 }}>{(name || '?')[0]}</span>
  return <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} width={size} height={size} alt="" onError={() => setBad(true)} style={{ borderRadius: 4, flexShrink: 0 }} />
}

function Tile({ im, onClick, onBad, badge, delay = 0 }) {
  const [ok, setOk] = useState(false)
  return (
    <div className={'im-tile' + (ok ? ' ok' : '')} onClick={onClick} style={{ '--d': delay + 'ms' }}>
      <img
        src={im.thumb}
        alt={im.title}
        ref={(el) => { if (el && !ok && el.complete && el.naturalWidth) setOk(true) }}
        onLoad={() => setOk(true)}
        onError={onBad}
      />
      {badge}
    </div>
  )
}

export default function ImageSearchPanel({ state }) {
  const { active, query, sources, images, currentUrl } = state
  const [src, setSrc] = useState(null)
  const [broken, setBroken] = useState({})
  const [all, setAll] = useState(false)
  const [view, setView] = useState(-1)

  const list = useMemo(
    () => images.filter((i) => !broken[i.url] && (!src || i.source === src)),
    [images, broken, src]
  )
  const counts = useMemo(() => {
    const c = {}
    images.forEach((i) => { c[i.source] = (c[i.source] || 0) + 1 })
    return c
  }, [images])

  useEffect(() => {
    if (view < 0) return
    const k = (e) => {
      if (e.key === 'Escape') setView(-1)
      if (e.key === 'ArrowRight') setView((v) => (v + 1) % list.length)
      if (e.key === 'ArrowLeft') setView((v) => (v - 1 + list.length) % list.length)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [view, list.length])

  const activeIdx = active ? sources.length - 1 : -1
  const cur = view >= 0 ? list[view] : null
  const hero = !all && list.length >= 3
  const shown = all ? list : list.slice(0, hero ? 3 : list.length)
  const bad = (im) => () => setBroken((b) => ({ ...b, [im.url]: 1 }))

  return (
    <div className="im-wrap">
      <style>{CSS}</style>

      {(active || sources.length > 0) && (
        <div className="im-browser">
          <div className="im-top">
            <span className="im-dot" style={{ background: '#ff5f57' }} />
            <span className="im-dot" style={{ background: '#febc2e' }} />
            <span className="im-dot" style={{ background: '#28c840' }} />
            <div className="im-tabs">
              {sources.map((s, i) => (
                <div key={s.domain} className={'im-tab' + (i === activeIdx ? ' on' : '')}>
                  <Logo domain={s.domain} name={s.name} />
                  <span>{s.name}</span>
                  {i !== activeIdx && <span className="im-check">✓</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="im-url">
            <span>🔍</span>
            <span className="im-urltext">{currentUrl || 'searching…'}{active && <i className="im-caret" />}</span>
            {active && <span className="im-bar" />}
          </div>
          <div className="im-pills">
            <span className="im-q">“{query}”</span>
            {sources.map((s) => (
              <button
                key={s.domain}
                className={'im-pill' + (src === s.name ? ' sel' : '')}
                onClick={() => !active && setSrc(src === s.name ? null : s.name)}
              >
                <Logo domain={s.domain} name={s.name} />
                <span>{s.name}</span>
                {counts[s.name] ? <b>{counts[s.name]}</b> : null}
              </button>
            ))}
            {active && <span className="im-scan">scanning<i>.</i><i>.</i><i>.</i></span>}
          </div>
        </div>
      )}

      {active && list.length === 0 && (
        <div className="im-hero">
          <div className="im-tile sk" /><div className="im-tile sk" /><div className="im-tile sk" />
        </div>
      )}

      {list.length > 0 && (
        <>
          <div className={all ? 'im-all' : hero ? 'im-hero' : 'im-row'}>
            {shown.map((im, i) => (
              <Tile
                key={im.url}
                im={im}
                delay={i * 120}
                onClick={() => setView(i)}
                onBad={bad(im)}
                badge={hero && i === 2 && list.length > 3 ? <span className="im-badge">+{list.length - 3}</span> : null}
              />
            ))}
          </div>
          {list.length > 3 && (
            <button className="im-toggle" onClick={() => setAll(!all)}>{all ? 'Show less' : `View all ${list.length}`}</button>
          )}
        </>
      )}

      {cur && (
        <div className="im-lb" onClick={() => setView(-1)}>
          <div className="im-lbtop" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setView(-1)}>✕</button>
            <span>{view + 1} / {list.length}</span>
            <a href={cur.page || cur.url} target="_blank" rel="noreferrer">Source ↗</a>
          </div>
          <button className="im-nav l" onClick={(e) => { e.stopPropagation(); setView((view - 1 + list.length) % list.length) }}>‹</button>
          <img className="im-big" src={cur.url} alt={cur.title} onClick={(e) => e.stopPropagation()} onError={(e) => { e.currentTarget.src = cur.thumb }} />
          <button className="im-nav r" onClick={(e) => { e.stopPropagation(); setView((view + 1) % list.length) }}>›</button>
          <div className="im-cap" onClick={(e) => e.stopPropagation()}>
            <b>{cur.title}</b>
            <small>{cur.source}{cur.by ? ' · ' + cur.by : ''}</small>
          </div>
        </div>
      )}
    </div>
  )
}

const CSS = `
.im-wrap{font-family:inherit;color:#e8e8ea;max-width:760px;margin:8px 0}
.im-browser{background:#0c0c0e;border:1px solid #232327;border-radius:14px;overflow:hidden}
.im-top{display:flex;align-items:center;gap:6px;padding:8px 10px 0;background:#121215}
.im-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.im-tabs{display:flex;gap:4px;margin-left:8px;overflow-x:auto;scrollbar-width:none;flex:1}
.im-tab{display:flex;align-items:center;gap:6px;padding:7px 12px;font-size:12px;border-radius:9px 9px 0 0;color:#8b8b93;white-space:nowrap;animation:im-pop .35s ease both}
.im-tab.on{background:#0c0c0e;color:#fff;box-shadow:inset 0 2px 0 #7c5cff}
.im-check{color:#3ddc97;font-size:11px}
.im-url{position:relative;display:flex;align-items:center;gap:8px;margin:8px 10px;padding:7px 12px;background:#17171b;border-radius:999px;font-size:12px;color:#a9a9b2;overflow:hidden}
.im-urltext{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.im-caret{display:inline-block;width:1px;height:12px;background:#a9a9b2;margin-left:2px;vertical-align:-2px;animation:im-blink 1s steps(1) infinite}
.im-bar{position:absolute;left:0;bottom:0;height:2px;width:40%;background:linear-gradient(90deg,transparent,#7c5cff,#2de2c5);animation:im-slide 1.2s linear infinite}
.im-pills{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:4px 10px 12px}
.im-q{font-size:12px;color:#b9a8ff;padding:5px 6px}
.im-pill{display:flex;align-items:center;gap:6px;padding:5px 10px;font-size:12px;color:#d6d6dc;background:#17171b;border:1px solid #26262c;border-radius:999px;cursor:pointer;animation:im-pop .35s ease both}
.im-pill.sel{border-color:#7c5cff;background:#1d1830}
.im-pill b{font-weight:600;font-size:11px;color:#2de2c5}
.im-scan{font-size:12px;color:#8b8b93}
.im-scan i{animation:im-blink 1.2s infinite;font-style:normal}
.im-scan i:nth-child(2){animation-delay:.2s}.im-scan i:nth-child(3){animation-delay:.4s}
.im-letter{display:inline-flex;align-items:center;justify-content:center;border-radius:6px;background:#2a2a33;color:#cfcfd6;font-weight:600;text-transform:uppercase;flex-shrink:0}

.im-hero{display:grid;grid-template-columns:2fr 1fr;grid-template-rows:1fr 1fr;gap:6px;aspect-ratio:16/9;max-height:360px;width:100%;margin-top:12px;border-radius:14px;overflow:hidden}
.im-hero .im-tile:first-child{grid-row:1/3}
.im-hero .im-tile{border-radius:0;min-height:0;min-width:0}
.im-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));gap:6px;aspect-ratio:3/1;max-height:240px;margin-top:12px;border-radius:14px;overflow:hidden}
.im-all{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;margin-top:12px}
.im-all .im-tile{aspect-ratio:1/1;border-radius:12px}

.im-tile{position:relative;overflow:hidden;cursor:pointer;background:linear-gradient(100deg,#17171b 30%,#25252c 50%,#17171b 70%);background-size:220% 100%;animation:im-shim 1.4s linear infinite}
.im-tile.ok{animation:none;background:#17171b}
.im-tile img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;opacity:0;filter:blur(22px);transform:scale(1.08);transition:opacity .7s ease var(--d,0ms),filter .9s ease var(--d,0ms),transform .9s ease var(--d,0ms)}
.im-tile.ok img{opacity:1;filter:blur(0);transform:scale(1)}
.im-tile.ok:hover img{transform:scale(1.04);transition-delay:0ms}
.im-badge{position:absolute;right:8px;bottom:8px;background:rgba(0,0,0,.65);color:#fff;font-size:12px;font-weight:600;padding:3px 9px;border-radius:999px;z-index:2}
.im-toggle{margin-top:8px;background:none;border:none;color:#8b8b93;font-size:12px;cursor:pointer;padding:0}
.im-toggle:hover{color:#fff}

.im-lb{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;animation:im-pop .2s ease both}
.im-lbtop{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:14px 18px;color:#cfcfd6;font-size:13px}
.im-lbtop button{background:none;border:none;color:#fff;font-size:20px;cursor:pointer}
.im-lbtop a{color:#0c0c0e;background:#e8e8ea;padding:5px 12px;border-radius:999px;font-size:12px;font-weight:600;text-decoration:none}
.im-big{max-width:80vw;max-height:72vh;border-radius:10px;object-fit:contain;background:#fff}
.im-nav{position:absolute;top:50%;transform:translateY(-50%);width:42px;height:42px;border-radius:50%;border:none;background:rgba(255,255,255,.12);color:#fff;font-size:26px;cursor:pointer}
.im-nav:hover{background:rgba(255,255,255,.22)}
.im-nav.l{left:16px}.im-nav.r{right:16px}
.im-cap{position:absolute;bottom:18px;left:0;right:0;text-align:center;display:flex;flex-direction:column;gap:3px;padding:0 20px}
.im-cap b{font-size:13px;color:#fff;font-weight:500}
.im-cap small{font-size:11px;color:#8b8b93}
@keyframes im-pop{from{opacity:0;transform:translateY(6px) scale(.97)}to{opacity:1;transform:none}}
@keyframes im-blink{50%{opacity:0}}
@keyframes im-slide{from{transform:translateX(-100%)}to{transform:translateX(260%)}}
@keyframes im-shim{from{background-position:120% 0}to{background-position:-120% 0}}
`