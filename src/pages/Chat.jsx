import { useState, useRef, useEffect } from 'react'
import './Chat.css'

const API_BASE = 'https://cloud9-api-1.onrender.com';

const SUGGESTIONS = [
  'What is quantum computing?',
  'Generate image of sunset over mountains',
  'Create avatar as Naruto anime',
  'Latest AI breakthroughs 2026',
]

const PLUS_MENU = [
  { icon: '📄', label: 'Add files or photos', shortcut: 'Ctrl+U', action: 'file' },
  { icon: '📸', label: 'Take a screenshot', shortcut: null, action: 'screenshot' },
  { icon: '📁', label: 'Add to project', shortcut: null, action: 'project' },
  { divider: true },
  { icon: '🧠', label: 'Skills', shortcut: null, action: 'skills' },
  { icon: '🔌', label: 'Add connectors', shortcut: null, action: 'connectors' },
  { icon: '🧩', label: 'Add plugins...', shortcut: null, action: 'plugins' },
  { divider: true },
  { icon: '🔍', label: 'Web search', shortcut: null, action: 'search' },
  { icon: '🎨', label: 'Generate image', shortcut: null, action: 'image' },
  { icon: '🎭', label: 'AI Avatar', shortcut: null, action: 'avatar' },
  { icon: '💻', label: 'Code mode', shortcut: null, action: 'code' },
  { icon: '📚', label: 'Research mode', shortcut: null, action: 'research' },
]

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const plusMenuRef = useRef(null)

  // Autoscroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close plus menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target)) {
        setShowPlusMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
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
    switch(action) {
      case 'file':
        fileInputRef.current?.click()
        break
      case 'search':
        setInput('Search: ')
        break
      case 'image':
        setInput('Generate image: ')
        break
      case 'avatar':
        setInput('Create avatar: ')
        break
      case 'code':
        setInput('Write code for: ')
        break
      case 'research':
        setInput('Research topic: ')
        break
      case 'project':
        setInput('Project: ')
        break
      case 'skills':
        setInput('Skill: ')
        break
      case 'connectors':
        setInput('Connector: ')
        break
      case 'plugins':
        setInput('Plugin: ')
        break
      case 'screenshot':
        setInput('Screenshot of: ')
        break
      default:
        break
    }
  }

  // Detect what type of request the user is making
  const detectIntent = (text) => {
    const lower = text.toLowerCase()
    if (lower.includes('generate image') || lower.includes('create image') || lower.includes('draw ') || lower.includes('paint ')) return 'image'
    if (lower.includes('create avatar') || lower.includes('make avatar') || lower.includes('avatar as')) return 'avatar'
    if (lower.includes('write code') || lower.includes('code for')) return 'code'
    if (lower.includes('research')) return 'research'
    if (lower.includes('search:')) return 'websearch'
    return 'search'
  }

  const handleSend = async (text) => {
    const query = text || input.trim()
    if (!query) return

    setMessages(prev => [...prev, { role: 'user', content: query, type: 'text' }])
    setInput('')
    setLoading(true)

    const intent = detectIntent(query)

    try {
      let endpoint = `${API_BASE}/ask`
      let body = { query: query }
      let response

      // Route to the appropriate backend endpoint based on intent
      if (intent === 'image') {
        endpoint = `${API_BASE}/generate-image`
        const prompt = query.replace(/generate image of?|create image of?|draw |paint /gi, '').trim()
        body = { prompt }
      } else if (intent === 'avatar') {
        endpoint = `${API_BASE}/create-avatar`
        const style = query.replace(/create avatar as|make avatar as/gi, '').trim() || 'anime'
        body = { style }
      } else if (intent === 'code') {
        // For code-related queries, we'll use the same /ask endpoint but add a system hint
        const codePrompt = `Write code for: ${query}`
        body = { query: codePrompt }
      } else {
        // Default: /ask endpoint for general chat
        body = { query }
      }

      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      if (intent === 'image') {
        setMessages(prev => [...prev, { role: 'assistant', type: 'image', content: data.imageUrl, prompt: body.prompt }])
      } else if (intent === 'avatar') {
        setMessages(prev => [...prev, { role: 'assistant', type: 'image', content: data.imageUrl, prompt: `Avatar: ${body.style}` }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', type: 'text', content: data.answer }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', type: 'error', content: err.message }])
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setMessages(prev => [...prev, { role: 'user', type: 'image', content: ev.target.result, prompt: file.name }])
    }
    reader.readAsDataURL(file)
  }

  const handleDownload = (url) => {
    const link = document.createElement('a')
    link.href = url
    link.download = 'cloud9-image.png'
    link.target = '_blank'
    link.click()
  }

  // A simple render function for markdown-like text (supports line breaks and basic bold)
  const renderContent = (text) => {
    if (!text) return null
    // Escape HTML and convert line breaks to <br/>
    const escaped = text.replace(/[&<>]/g, (m) => {
      if (m === '&') return '&amp;'
      if (m === '<') return '&lt;'
      if (m === '>') return '&gt;'
      return m
    })
    // Convert **bold** to <strong>
    const withBold = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert line breaks
    const withBreaks = withBold.replace(/\n/g, '<br/>')
    return <div dangerouslySetInnerHTML={{ __html: withBreaks }} />
  }

  return (
    <div className="chat-app">
      <div className="chat-body">
        {messages.length === 0 ? (
          <div className="welcome">
            <div className="welcome-logo">☁️</div>
            <h1>Cloud9 AI</h1>
            <p>Search, generate images, create avatars, and more</p>
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="suggestion-pill" onClick={() => handleSend(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? '👤' : '☁️'}
                </div>
                <div className="message-content">
                  {msg.type === 'image' ? (
                    <div className="image-message">
                      {msg.prompt && <div className="image-prompt">{msg.prompt}</div>}
                      <img src={msg.content} alt={msg.prompt} className="chat-image" />
                      {msg.role === 'assistant' && (
                        <button className="download-btn" onClick={() => handleDownload(msg.content)}>
                          ⬇ Download
                        </button>
                      )}
                    </div>
                  ) : msg.type === 'error' ? (
                    <div className="error-msg">⚠️ {msg.content}</div>
                  ) : (
                    <div className="text-msg">
                      {renderContent(msg.content)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <div className="message-avatar">☁️</div>
                <div className="message-content">
                  <div className="typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="input-area">
        <div className="input-box">
          <div className="plus-wrapper" ref={plusMenuRef}>
            <button className="plus-btn" onClick={() => setShowPlusMenu(!showPlusMenu)}>
              +
            </button>
            {showPlusMenu && (
              <div className="plus-menu">
                {PLUS_MENU.map((item, idx) => {
                  if (item.divider) return <div key={`divider-${idx}`} className="menu-divider" />
                  return (
                    <button key={item.action} className="plus-menu-item" onClick={() => handlePlusAction(item.action)}>
                      <span className="menu-icon">{item.icon}</span>
                      <span className="menu-label">{item.label}</span>
                      {item.shortcut && <span className="menu-shortcut">{item.shortcut}</span>}
                    </button>
                  )
                })}
                <div className="menu-divider" />
                <button className="plus-menu-item upgrade-item" onClick={() => alert('Upgrade coming soon!')}>
                  <span className="menu-icon">⭐</span>
                  <span className="menu-label">Upgrade</span>
                </button>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Search or ask anything..."
            className="chat-input"
          />

          <button
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleMic}
            title="Voice input"
          >
            🎤
          </button>

          <button
            className="send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            title="Send"
          >
            ⬆
          </button>
        </div>
      </div>
    </div>
  )
}