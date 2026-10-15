import { useState, useRef, useEffect } from 'react'

const API = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:3001'

const P = {
  attach: 'M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z',
  link: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z',
  emoji: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z',
  image: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
  trash: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  min: 'M6 19h12v2H6z',
  exp: 'M21 11V3h-8l3.29 3.29-10 10L3 13v8h8l-3.29-3.29 10-10z',
  close: 'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
}

function Ic({ d, size = 20, fill = '#444746' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} style={{ display: 'block' }}><path d={d} /></svg>
}

const FONT = "'Google Sans', Roboto, 'Segoe UI', Arial, sans-serif"
const ROW = { display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', minHeight: 40, borderBottom: '1px solid #ededed' }
const INPUT = { flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#202124', fontFamily: FONT, padding: '10px 0', minWidth: 0 }
const LBL = { fontSize: 14, color: '#5f6368', flexShrink: 0 }
const IBTN = { background: 'none', border: 'none', padding: 6, borderRadius: 6, cursor: 'pointer', display: 'flex' }

if (typeof document !== 'undefined' && !document.getElementById('em-css')) {
  const st = document.createElement('style')
  st.id = 'em-css'
  st.textContent = '@keyframes emIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} .em-ib:hover{background:#e8eaed!important}'
  document.head.appendChild(st)
}

export default function EmailComposer({ email }) {
  const [to, setTo] = useState((email && email.to) || '')
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [showCc, setShowCc] = useState(false)
  const [subject, setSubject] = useState((email && email.subject) || '')
  const [body, setBody] = useState((email && email.body) || '')
  const [state, setState] = useState('draft')
  const [err, setErr] = useState('')
  const [mini, setMini] = useState(false)
  const [big, setBig] = useState(false)
  const ta = useRef(null)

  useEffect(() => {
    const el = ta.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.max(el.scrollHeight, big ? 380 : 200) + 'px'
  }, [body, big, mini, state])

  const gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(to) + '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body)

  const send = async () => {
    setErr('')
    setState('sending')
    try {
      const r = await fetch(API + '/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, cc, bcc, subject, body }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || !j.ok) throw new Error(j.error || 'Could not send')
      setState('sent')
    } catch (e) {
      setErr(e.message || 'Could not send')
      setState('error')
    }
  }

  if (state === 'closed') {
    return (
      <div style={{ margin: '10px 0', fontSize: 13, color: '#8A8A86' }}>
        Draft discarded. <button onClick={() => setState('draft')} style={{ background: 'none', border: 'none', color: '#7C83DB', cursor: 'pointer', fontSize: 13 }}>Undo</button>
      </div>
    )
  }

  if (state === 'sent') {
    return (
      <div style={{ margin: '10px 0', maxWidth: 640, background: '#fff', color: '#202124', borderRadius: 12, padding: '14px 16px', fontFamily: FONT, boxShadow: '0 2px 10px rgba(0,0,0,.25)', animation: 'emIn 300ms ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
          <span style={{ color: '#1e8e3e' }}>&#10003;</span> Message sent
        </div>
        <div style={{ fontSize: 13, color: '#5f6368', marginTop: 4 }}>To {to} &middot; {subject || '(no subject)'}</div>
      </div>
    )
  }

  const busy = state === 'sending'

  return (
    <div style={{ margin: '10px 0', maxWidth: 640, background: '#fff', color: '#202124', borderRadius: 12, overflow: 'hidden', fontFamily: FONT, boxShadow: '0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12), 0 5px 5px -3px rgba(0,0,0,.2)', animation: 'emIn 300ms ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: '#f2f6fc', padding: '8px 8px 8px 16px', fontSize: 14, fontWeight: 500 }}>
        <span style={{ flex: 1 }}>New Message</span>
        <button className="em-ib" style={IBTN} onClick={() => setMini(!mini)} title="Minimize"><Ic d={P.min} size={16} /></button>
        <button className="em-ib" style={IBTN} onClick={() => setBig(!big)} title="Expand"><Ic d={P.exp} size={16} /></button>
        <button className="em-ib" style={IBTN} onClick={() => setState('closed')} title="Close"><Ic d={P.close} size={16} /></button>
      </div>

      {!mini && (
        <>
          <div style={ROW}>
            <span style={LBL}>To</span>
            <input style={INPUT} value={to} onChange={(e) => setTo(e.target.value)} placeholder="recipient@example.com" />
            {!showCc && <button onClick={() => setShowCc(true)} style={{ background: 'none', border: 'none', color: '#5f6368', fontSize: 13, cursor: 'pointer' }}>Cc Bcc</button>}
          </div>
          {showCc && (
            <>
              <div style={ROW}><span style={LBL}>Cc</span><input style={INPUT} value={cc} onChange={(e) => setCc(e.target.value)} /></div>
              <div style={ROW}><span style={LBL}>Bcc</span><input style={INPUT} value={bcc} onChange={(e) => setBcc(e.target.value)} /></div>
            </>
          )}
          <div style={ROW}>
            <input style={INPUT} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
          </div>
          <div style={{ padding: '10px 16px 0' }}>
            <textarea
              ref={ta}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: 14, lineHeight: 1.55, color: '#202124', fontFamily: FONT, background: 'transparent', overflow: 'hidden', display: 'block' }}
            />
          </div>

          {state === 'error' && <div style={{ padding: '4px 16px', fontSize: 13, color: '#d93025' }}>{err}</div>}

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 12px 12px 16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', borderRadius: 18, overflow: 'hidden', marginRight: 8, opacity: busy ? 0.7 : 1 }}>
              <button onClick={send} disabled={busy} style={{ background: '#0b57d0', color: '#fff', border: 'none', padding: '9px 20px', fontSize: 14, fontWeight: 500, cursor: busy ? 'default' : 'pointer', fontFamily: FONT }}>{busy ? 'Sending...' : 'Send'}</button>
              <span style={{ width: 1, background: 'rgba(255,255,255,.35)' }} />
              <span style={{ background: '#0b57d0', color: '#fff', padding: '9px 10px', fontSize: 12, display: 'flex', alignItems: 'center' }}>&#9662;</span>
            </div>
            <button className="em-ib" style={{ ...IBTN, fontSize: 15, color: '#444746', padding: '6px 9px', fontWeight: 500 }} title="Formatting">Aa</button>
            <button className="em-ib" style={IBTN} title="Attach"><Ic d={P.attach} /></button>
            <button className="em-ib" style={IBTN} title="Link"><Ic d={P.link} /></button>
            <button className="em-ib" style={IBTN} title="Emoji"><Ic d={P.emoji} /></button>
            <button className="em-ib" style={IBTN} title="Photo"><Ic d={P.image} /></button>
            <a href={gmailUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: '#0b57d0', textDecoration: 'none', marginLeft: 8 }}>Open in Gmail</a>
            <span style={{ flex: 1 }} />
            <button className="em-ib" style={IBTN} onClick={() => setState('closed')} title="Discard"><Ic d={P.trash} /></button>
          </div>
        </>
      )}
    </div>
  )
}