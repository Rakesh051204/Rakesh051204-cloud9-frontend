import { useState, useRef, useEffect } from 'react'
import ThinkingPanel from './components/ThinkingPanel'
import {
  Paperclip, Camera, Folder, Mic, ArrowUp, AlertTriangle, Plus,
} from 'lucide-react'

// Parses inline [[cite:domain.com]] markers out of streamed text and
// turns them into clickable numbered chips, matched against this
// message's sources by domain (backend cites by domain, not index).
function renderWithCitations(content, sources = [], onCiteClick) {
  if (!content) return null
  const parts = content.split(/(\[\[cite:[a-zA-Z0-9.\-]+\]\])/g)
  return parts.map((part, i) => {
    const match = part.match(/^\[\[cite:([a-zA-Z0-9.\-]+)\]\]$/)
    if (!match) return <span key={i}>{part}</span>
    const domain = match[1]
    const idx = sources.findIndex(s => s.domain === domain)
    if (idx === -1) return null // unknown domain — drop silently rather than leak raw markup
    return (
      <button
        key={i}
        onClick={() => onCiteClick?.(sources[idx])}
        title={domain}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 16, height: 16, borderRadius: 5, fontSize: 10, fontWeight: 700,
          background: '#7C83DB26', color: '#7C83DB', border: 'none',
          marginLeft: 3, marginRight: 1, cursor: 'pointer', verticalAlign: 'super',
          lineHeight: 1, transform: 'translateY(-1px)',
        }}
      >
        {idx + 1}
      </button>
    )
  })
}

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const [steps, setSteps] = useState([]) // live "thinking" events for the in-flight turn
  const [activeSourcesFor, setActiveSourcesFor] = useState(null) // message index whose sources panel is open
  const [lightboxImg, setLightboxImg] = useState(null)

  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const plusMenuRef = useRef(null)
  const sessionIdRef = useRef('default')

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, steps])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target)) {
        setShowPlusMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.onresult = (event) => {
        setInput(event.results[0][0].transcript)
        setIsListening(false)
      }
      recognitionRef.current.onend = () => setIsListening(false)
    }
  }, [])

  const toggleMic = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handlePlusAction = (action) => {
    setShowPlusMenu(false)
    // TODO: restore your file/photo/folder handlers here
  }

  const handleSend = async (text) => {
    const query = text || input.trim()
    if (!query) return

    setMessages(prev => [...prev, { role: 'user', content: query, type: 'text' }])
    setInput('')
    setLoading(true)
    setSteps([])

    setMessages(prev => [...prev, {
      role: 'assistant', type: 'text', content: '',
      sources: [], images: [], followUps: [], jobs: [], map: null,
    }])

    try {
      const response = await fetch('http://localhost:3001/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // IMPORTANT: backend reads req.body.message, not req.body.query
        body: JSON.stringify({
          message: query,
          sessionId: sessionIdRef.current,
        }),
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error(errBody.error || `Server error (${response.status})`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''

      const patchLastMessage = (patch) => {
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { ...next[next.length - 1], ...patch }
          return next
        })
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue

          let payload
          try {
            payload = JSON.parse(raw)
          } catch {
            continue // ignore malformed lines rather than crashing the stream
          }

          switch (payload.event) {
            case 'thinking':
              setSteps(prev => [...prev, { text: payload.text }])
              break
            case 'sources':
              console.log('🔵 [DEBUG] sources event received:', payload.sources?.length || 0, payload.sources)
              patchLastMessage({ sources: payload.sources || [] })
              break
            case 'images':
              console.log('🟢 [DEBUG] images event received:', payload.images?.length || 0, payload.images)
              patchLastMessage({ images: payload.images || [] })
              break
            case 'jobs':
              patchLastMessage({ jobs: payload.jobs || [] })
              break
            case 'map':
              patchLastMessage({ map: payload })
              break
            case 'token':
              fullContent += payload.text || ''
              patchLastMessage({ content: fullContent })
              break
            case 'followups':
              patchLastMessage({ followUps: payload.followUps || [] })
              break
            case 'error':
              patchLastMessage({ type: 'error', content: payload.message })
              break
            case 'done':
              break
            default:
              break
          }
        }
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = {
          role: 'assistant',
          type: 'error',
          content: 'Failed to connect to local server. Make sure backend is running on port 3001.',
        }
        return next
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-app">
      <div className="chat-messages">
        {messages.map((msg, i) => {
          const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1
          if (isLastAssistant) {
            console.log('🟣 [DEBUG] rendering last assistant msg — sources:', msg.sources?.length, 'images:', msg.images?.length, msg)
          }
          return (
            <div key={i} className={`message message-${msg.role}`}>
              {msg.role === 'assistant' && isLastAssistant && (
                <ThinkingPanel steps={steps} streaming={loading} />
              )}

              {msg.type === 'error' ? (
                <div className="message-error">
                  <AlertTriangle size={14} /> {msg.content}
                </div>
              ) : msg.role === 'assistant' ? (
                <>
                  {msg.images?.length > 0 && (
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
                      margin: '10px 0', maxWidth: 560, borderRadius: 14, overflow: 'hidden',
                    }}>
                      {msg.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.src}
                          alt={img.alt || ''}
                          loading="lazy"
                          onClick={() => setLightboxImg(img.src)}
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                          style={{
                            width: '100%', aspectRatio: '1 / 1', objectFit: 'cover',
                            background: '#1e1c19', cursor: 'zoom-in',
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <div className="message-content">
                    {renderWithCitations(msg.content, msg.sources, () => setActiveSourcesFor(i))}
                  </div>
                  {msg.sources?.length > 0 && (
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: 8, margin: '10px 0',
                    }}>
                      {msg.sources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'block', padding: '10px 12px', borderRadius: 10,
                            border: '1px solid #2a2825', background: '#171614', textDecoration: 'none',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span style={{
                              width: 15, height: 15, borderRadius: 4, background: '#7C83DB26', color: '#7C83DB',
                              fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              {idx + 1}
                            </span>
                            <span style={{ fontSize: 11.5, color: '#8A8A86' }}>{s.domain}</span>
                          </div>
                          <span style={{
                            fontSize: 13, color: '#EDEDEC', fontWeight: 600, display: '-webkit-box',
                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}>
                            {s.title || s.domain}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="message-content">{msg.content}</div>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-bar">
        <button onClick={() => setShowPlusMenu(v => !v)} className="chat-plus-btn">
          <Plus size={18} />
        </button>
        {showPlusMenu && (
          <div ref={plusMenuRef} className="chat-plus-menu">
            <button onClick={() => handlePlusAction('file')}><Paperclip size={14} /> Attach file</button>
            <button onClick={() => handlePlusAction('photo')}><Camera size={14} /> Photo</button>
            <button onClick={() => handlePlusAction('folder')}><Folder size={14} /> Folder</button>
          </div>
        )}

        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything"
          rows={1}
        />

        <button onClick={toggleMic} className={`chat-mic-btn ${isListening ? 'listening' : ''}`}>
          <Mic size={18} />
        </button>
        <button onClick={() => handleSend()} disabled={loading || !input.trim()} className="chat-send-btn">
          <ArrowUp size={18} />
        </button>
      </div>

      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out',
          }}
        >
          <img src={lightboxImg} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8 }} />
        </div>
      )}
    </div>
  )
}