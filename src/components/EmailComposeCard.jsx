import { useState, useRef, useEffect } from 'react'
import { Paperclip, Link2, Smile, Image as ImageIcon, Trash2, ChevronDown, Type, X } from 'lucide-react'

const C = { bg: '#161615', field: '#0f0f0e', line: '#2f2f2c', text: '#e8e6e1', mute: '#8a8882', blue: '#a8c7fa', blueText: '#062e6f' }
const box = { background: C.field, border: '1px solid ' + C.line, borderRadius: 10, color: C.text }
const iconBtn = { background: 'transparent', border: 0, color: C.mute, cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center' }
const EMOJIS = ['😀', '😊', '😂', '😍', '👍', '🙏', '🎉', '🔥', '💼', '📎', '✅', '⭐', '🤝', '📧', '🚀', '💡']

function GmailLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z" />
      <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z" />
      <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17" />
      <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z" />
      <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0C43.076,8,45,9.924,45,12.298z" />
    </svg>
  )
}

export default function EmailComposeCard({ to = '', subject = '', body = '', onSend }) {
  const [recips, setRecips] = useState(to ? [to] : [])
  const [draftTo, setDraftTo] = useState('')
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [subj, setSubj] = useState(subject)
  const [state, setState] = useState('draft')
  const [fmt, setFmt] = useState(false)
  const [emoji, setEmoji] = useState(false)
  const [menu, setMenu] = useState(false)
  const [files, setFiles] = useState([])
  const bodyRef = useRef(null)
  const fileRef = useRef(null)
  const imgRef = useRef(null)
  const sel = useRef(null)

  useEffect(() => { if (bodyRef.current) bodyRef.current.textContent = body }, [])

  const saveSel = () => {
    const s = window.getSelection()
    if (s && s.rangeCount && bodyRef.current && bodyRef.current.contains(s.anchorNode)) sel.current = s.getRangeAt(0)
  }
  const restoreSel = () => {
    if (!bodyRef.current) return
    bodyRef.current.focus()
    const s = window.getSelection()
    if (sel.current) { s.removeAllRanges(); s.addRange(sel.current) }
  }
  const exec = (cmd, val) => { restoreSel(); document.execCommand(cmd, false, val) }
  const keep = (e) => { e.preventDefault(); saveSel() }

  const addRecip = () => {
    const v = draftTo.trim()
    if (v) { setRecips((r) => [...r, v]); setDraftTo('') }
  }
  const getText = () => (bodyRef.current ? bodyRef.current.innerText : '')
  const gmailUrl = () =>
    'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(recips.join(',')) +
    (cc ? '&cc=' + encodeURIComponent(cc) : '') + (bcc ? '&bcc=' + encodeURIComponent(bcc) : '') +
    '&su=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(getText())

  const send = () => {
    setMenu(false)
    if (onSend) onSend({ to: recips, cc, bcc, subject: subj, body: getText(), files })
    else window.open(gmailUrl(), '_blank')
    setState('sent')
  }
  const openGmail = () => window.open(gmailUrl(), '_blank')
  const copyAll = () => { navigator.clipboard.writeText(subj + '\n\n' + getText()); setMenu(false) }
  const addLink = () => {
    const url = window.prompt('Link URL')
    if (url) exec('createLink', url)
  }
  const onImage = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => exec('insertImage', r.result)
    r.readAsDataURL(f)
    e.target.value = ''
  }
  const onFiles = (e) => {
    const picked = Array.from(e.target.files || []).map((f) => f.name)
    setFiles((p) => [...p, ...picked])
    e.target.value = ''
  }

  if (state === 'discarded') return <div style={{ color: C.mute, fontSize: 14, margin: '8px 0' }}>Draft discarded.</div>

  return (
    <div style={{ background: C.bg, border: '1px solid ' + C.line, borderRadius: 16, padding: 16, margin: '12px 0', maxWidth: 640, width: '100%', boxSizing: 'border-box', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: C.text, fontSize: 15, fontWeight: 500 }}>
        <GmailLogo size={22} /> Gmail
      </div>

      <div style={{ ...box, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ color: C.mute, fontSize: 14 }}>To</span>
        {recips.map((r, i) => (
          <span key={i} style={{ background: '#262624', borderRadius: 14, padding: '3px 10px', fontSize: 14 }}>
            {r} <span style={{ cursor: 'pointer', marginLeft: 6, color: C.mute }} onClick={() => setRecips(recips.filter((_, k) => k !== i))}>×</span>
          </span>
        ))}
        <input value={draftTo} onChange={(e) => setDraftTo(e.target.value)} onBlur={addRecip}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addRecip() } }}
          style={{ flex: 1, minWidth: 80, background: 'transparent', border: 0, outline: 0, color: C.text, fontSize: 14 }} />
        <span style={{ color: C.mute, fontSize: 13, marginLeft: 'auto' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => setShowCc(!showCc)}>Cc</span>{' '}
          <span style={{ cursor: 'pointer' }} onClick={() => setShowBcc(!showBcc)}>Bcc</span>
        </span>
      </div>

      {showCc && <input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="Cc" style={{ ...box, width: '100%', boxSizing: 'border-box', padding: 12, marginTop: 10, fontSize: 14, outline: 0 }} />}
      {showBcc && <input value={bcc} onChange={(e) => setBcc(e.target.value)} placeholder="Bcc" style={{ ...box, width: '100%', boxSizing: 'border-box', padding: 12, marginTop: 10, fontSize: 14, outline: 0 }} />}

      <input value={subj} onChange={(e) => setSubj(e.target.value)} placeholder="Subject"
        style={{ ...box, width: '100%', boxSizing: 'border-box', padding: 12, marginTop: 10, fontSize: 14, outline: 0 }} />

      <div ref={bodyRef} contentEditable suppressContentEditableWarning onKeyUp={saveSel} onMouseUp={saveSel}
        style={{ ...box, width: '100%', boxSizing: 'border-box', padding: 12, marginTop: 10, fontSize: 14, lineHeight: 1.5, height: 200, outline: 0, overflowY: 'auto', overflowX: 'hidden', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }} />

      {files.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          {files.map((n, i) => (
            <span key={i} style={{ ...box, padding: '4px 10px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Paperclip size={12} /> {n}
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => setFiles(files.filter((_, k) => k !== i))} />
            </span>
          ))}
        </div>
      )}

      {fmt && (
        <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
          <button onMouseDown={keep} onClick={() => exec('bold')} style={{ ...iconBtn, fontWeight: 700, width: 30, justifyContent: 'center' }}>B</button>
          <button onMouseDown={keep} onClick={() => exec('italic')} style={{ ...iconBtn, fontStyle: 'italic', width: 30, justifyContent: 'center' }}>I</button>
          <button onMouseDown={keep} onClick={() => exec('underline')} style={{ ...iconBtn, textDecoration: 'underline', width: 30, justifyContent: 'center' }}>U</button>
          <button onMouseDown={keep} onClick={() => exec('insertUnorderedList')} style={{ ...iconBtn, width: 30, justifyContent: 'center' }}>•</button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 12, position: 'relative', flexWrap: 'wrap' }}>
        {state === 'sent' ? (
          <span style={{ color: C.mute, fontSize: 14, padding: '8px 4px' }}>Opened in Gmail</span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', background: C.blue, borderRadius: 20, marginRight: 8 }}>
            <button onClick={send} style={{ background: 'transparent', color: C.blueText, border: 0, padding: '8px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Send</button>
            <span style={{ width: 1, height: 18, background: 'rgba(6,46,111,0.35)' }} />
            <button onClick={() => setMenu(!menu)} style={{ background: 'transparent', color: C.blueText, border: 0, padding: '8px 10px', cursor: 'pointer', display: 'flex' }}><ChevronDown size={16} /></button>
          </div>
        )}
        {menu && (
          <div style={{ position: 'absolute', bottom: 46, left: 0, background: '#1f1f1d', border: '1px solid ' + C.line, borderRadius: 10, padding: 4, zIndex: 20, minWidth: 150 }}>
            <div onClick={send} style={{ padding: '8px 12px', fontSize: 14, color: C.text, cursor: 'pointer' }}>Send now</div>
            <div onClick={copyAll} style={{ padding: '8px 12px', fontSize: 14, color: C.text, cursor: 'pointer' }}>Copy email</div>
          </div>
        )}
        <button title="Formatting" onMouseDown={keep} onClick={() => setFmt(!fmt)} style={iconBtn}><Type size={18} /></button>
        <button title="Attach files" onClick={() => fileRef.current && fileRef.current.click()} style={iconBtn}><Paperclip size={18} /></button>
        <button title="Insert link" onMouseDown={keep} onClick={addLink} style={iconBtn}><Link2 size={18} /></button>
        <button title="Emoji" onMouseDown={keep} onClick={() => setEmoji(!emoji)} style={iconBtn}><Smile size={18} /></button>
        <button title="Insert image" onMouseDown={keep} onClick={() => imgRef.current && imgRef.current.click()} style={iconBtn}><ImageIcon size={18} /></button>
        <span onClick={openGmail} style={{ color: C.blue, fontSize: 14, cursor: 'pointer', marginLeft: 8 }}>Open in Gmail</span>
        <button title="Discard" onClick={() => setState('discarded')} style={{ ...iconBtn, marginLeft: 'auto' }}><Trash2 size={18} /></button>

        {emoji && (
          <div style={{ position: 'absolute', bottom: 46, left: 150, background: '#1f1f1d', border: '1px solid ' + C.line, borderRadius: 10, padding: 8, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4, zIndex: 20 }}>
            {EMOJIS.map((em) => (
              <span key={em} onMouseDown={keep} onClick={() => { exec('insertText', em); setEmoji(false) }} style={{ cursor: 'pointer', fontSize: 20, textAlign: 'center' }}>{em}</span>
            ))}
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" multiple onChange={onFiles} style={{ display: 'none' }} />
      <input ref={imgRef} type="file" accept="image/*" onChange={onImage} style={{ display: 'none' }} />
    </div>
  )
}