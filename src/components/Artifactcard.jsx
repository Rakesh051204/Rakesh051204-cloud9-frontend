import { useState } from 'react'

export default function ArtifactCard({ artifact }) {
  const [tab, setTab] = useState('preview')
  const [full, setFull] = useState(false)
  const [copied, setCopied] = useState(false)
  if (!artifact) return null
  const { title, html } = artifact

  const copy = async () => {
    try { await navigator.clipboard.writeText(html); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch (e) {}
  }
  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
    a.download = (title || 'site').toLowerCase().replace(/\s+/g, '-') + '.html'
    a.click()
  }
  const openTab = () => window.open(URL.createObjectURL(new Blob([html], { type: 'text/html' })), '_blank')

  return (
    <div className={'ac-wrap' + (full ? ' full' : '')}>
      <style>{CSS}</style>
      <div className="ac-bar">
        <b>{title}</b>
        <div className="ac-tabs">
          <button className={tab === 'preview' ? 'on' : ''} onClick={() => setTab('preview')}>Preview</button>
          <button className={tab === 'code' ? 'on' : ''} onClick={() => setTab('code')}>Code</button>
        </div>
        <div className="ac-act">
          <button onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
          <button onClick={download}>Download</button>
          <button onClick={openTab}>Open ↗</button>
          <button onClick={() => setFull(!full)}>{full ? 'Close' : 'Expand'}</button>
        </div>
      </div>
      {tab === 'preview' ? (
        <iframe title={title} srcDoc={html} sandbox="allow-scripts" className="ac-frame" />
      ) : (
        <pre className="ac-code">{html}</pre>
      )}
    </div>
  )
}

const CSS = `
.ac-wrap{background:#0c0c0e;border:1px solid #232327;border-radius:14px;overflow:hidden;max-width:760px;margin:10px 0;color:#e8e8ea}
.ac-wrap.full{position:fixed;inset:16px;z-index:9999;max-width:none;margin:0;display:flex;flex-direction:column}
.ac-bar{display:flex;align-items:center;gap:10px;padding:8px 12px;background:#121215;font-size:12px;flex-wrap:wrap}
.ac-tabs{display:flex;gap:4px;margin-left:6px}
.ac-bar button{background:#17171b;border:1px solid #26262c;color:#d6d6dc;border-radius:999px;padding:4px 11px;font-size:12px;cursor:pointer}
.ac-bar button.on{border-color:#7c5cff;background:#1d1830}
.ac-act{margin-left:auto;display:flex;gap:6px}
.ac-frame{width:100%;height:420px;border:none;background:#fff;display:block}
.ac-wrap.full .ac-frame,.ac-wrap.full .ac-code{flex:1;height:auto}
.ac-code{margin:0;padding:12px;height:420px;overflow:auto;font-size:11.5px;line-height:1.5;color:#b4b4bd;white-space:pre-wrap}
`