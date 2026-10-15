import { useState, useRef, useEffect } from 'react'

export default function GameCard(props) {
  const g = props.game || props
  const url = g.url || ''
  const name = g.name || 'Game'
  const headline = g.headline || ''
  const [full, setFull] = useState(false)
  const [run, setRun] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    if (!full) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setFull(false) }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [full])

  if (!url) return null

  const btn = {
    background: '#ffffff14', color: '#f2f2f0', border: '1px solid #ffffff26',
    borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
  }

  const frame = (key) => (
    <iframe
      key={key}
      ref={ref}
      src={url}
      title={name}
      sandbox="allow-scripts allow-pointer-lock"
      allow="fullscreen; autoplay"
      tabIndex={0}
      onLoad={() => { try { ref.current && ref.current.focus() } catch (e) {} }}
      style={{ width: '100%', height: '100%', border: 0, display: 'block', background: '#15151a' }}
    />
  )

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px' }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#f2f2f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        {headline ? <div style={{ fontSize: 12, color: '#f2f2f0aa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{headline}</div> : null}
      </div>
      <button style={btn} onClick={() => setRun((n) => n + 1)}>Restart</button>
      <button style={btn} onClick={() => setFull(!full)}>{full ? 'Close' : 'Full screen'}</button>
      <a href={url} target="_blank" rel="noreferrer" style={{ ...btn, textDecoration: 'none' }}>New tab</a>
    </div>
  )

  if (full) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0d0d0cf2', display: 'flex', flexDirection: 'column' }}>
        <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto' }}>{header}</div>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px 16px' }}>
          <div style={{ width: 'min(100%, calc((100vh - 90px) * 1.6))', aspectRatio: '8 / 5', borderRadius: 12, overflow: 'hidden' }}>
            {frame('f' + run)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 640, margin: '10px 0', background: '#161615', border: '1px solid #ffffff1a', borderRadius: 14, overflow: 'hidden' }}>
      {header}
      <div style={{ width: '100%', aspectRatio: '8 / 5' }}>{frame('i' + run)}</div>
    </div>
  )
}