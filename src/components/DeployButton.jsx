import { useState } from 'react'

const API_BASE = ''
const C = { line: '#2f2f2c', text: '#e8e6e1', mute: '#8a8882', ai: '#7C83DB', ai2: '#aeb3f0' }

export default function DeployButton({ code = '' }) {
  const [state, setState] = useState('idle')
  const [info, setInfo] = useState(null)
  const [err, setErr] = useState('')

  if (!/<\/html>/i.test(code)) return null
  const title = ((code.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || 'my-site').trim()

  const deploy = async () => {
    setState('busy')
    setErr('')
    try {
      const r = await fetch(API_BASE + '/api/deploy/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: code, name: title }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || 'HTTP ' + r.status)
      setInfo(j)
      setState('done')
    } catch (e) {
      setErr(e.message)
      setState('error')
    }
  }

  const btn = { background: C.ai, color: '#0d0d0c', border: 0, borderRadius: 20, padding: '8px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }
  return (
    <div style={{ margin: '8px 0 12px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: 14, color: C.text }}>
      {state !== 'done' && (
        <button onClick={deploy} disabled={state === 'busy'} style={{ ...btn, opacity: state === 'busy' ? 0.6 : 1 }}>
          {state === 'busy' ? 'Deploying...' : 'Deploy live'}
        </button>
      )}
      {state === 'done' && info && (
        <div>
          <div>
            Live at{' '}
            <a href={info.url} target="_blank" rel="noreferrer" style={{ color: C.ai2 }}>{info.url}</a>
          </div>
          <div style={{ color: C.mute, fontSize: 12, marginTop: 4 }}>
            The first deploy takes 1 to 2 minutes to appear. Code:{' '}
            <a href={info.repoUrl} target="_blank" rel="noreferrer" style={{ color: C.ai2 }}>GitHub repo</a>
            {info.note ? ' | ' + info.note : ''}
          </div>
        </div>
      )}
      {state === 'error' && <span style={{ color: '#ff6b6b' }}>{err}</span>}
    </div>
  )
}