import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import './Results.css'

const API_BASE = 'https://cloud9-api-2.onrender.com'

export default function Results() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''

  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (query) performSearch()
    loadHistory()
  }, [query])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const loadHistory = () => {
    const stored = localStorage.getItem('stoic_history')
    if (stored) setHistory(JSON.parse(stored))
  }

  const saveToHistory = (q, ans) => {
    const newEntry = { id: Date.now(), query: q, answer: ans, created_at: new Date().toISOString() }
    const updated = [newEntry, ...history.slice(0, 7)]
    setHistory(updated)
    localStorage.setItem('stoic_history', JSON.stringify(updated))
  }

  const performSearch = async () => {
    setLoading(true)
    setAnswer('')
    setSources([])
    setError('')
    setChatMessages([])
    try {
      const res = await fetch(`${API_BASE}/ask-with-web`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setAnswer(data.answer)
      setSources(data.sources || [])
      saveToHistory(query, data.answer)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setChatLoading(true)
    try {
      const res = await fetch(`${API_BASE}/ask-with-web`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `Context: ${answer}\n\nFollow-up: ${userMsg}` })
      })
      const data = await res.json()
      setChatMessages(prev => [...prev, { role: 'ai', text: data.answer }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong.' }])
    } finally {
      setChatLoading(false)
    }
  }

  const handleNewSearch = (q) => {
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  // Convert plain text with [1] citations into JSX with clickable badges
  const formatAnswerWithCitations = (text) => {
    const regex = /\[(\d+)\]/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = regex.exec(text)) !== null) {
      // Add text before the citation
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }
      const citationNum = parseInt(match[1])
      // Check if source exists (index from 1)
      const source = sources.find((_, idx) => idx + 1 === citationNum)
      if (source) {
        parts.push(
          <sup key={match.index} className="citation-badge">
            <a href={source.url} target="_blank" rel="noreferrer" title={source.title}>
              [{citationNum}]
            </a>
          </sup>
        )
      } else {
        parts.push(`[${citationNum}]`)
      }
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }
    // Convert string parts to proper React nodes
    return parts.map((part, idx) => {
      if (typeof part === 'string') {
        // Split string by newlines and wrap paragraphs if needed
        return <span key={idx}>{part}</span>
      }
      return part
    })
  }

  return (
    <div className="results-page">
      <div className="sidebar">
        <div className="logo" onClick={() => navigate('/')}>Stoic</div>
        <button className="new-chat" onClick={() => navigate('/')}>+ New Chat</button>
        <div className="history-list">
          <p className="history-label">Recent</p>
          {history.map(item => (
            <div key={item.id} className="history-item" onClick={() => handleNewSearch(item.query)}>
              {item.query}
            </div>
          ))}
        </div>
      </div>

      <div className="results-main">
        <div className="top-search">
          <input
            className="top-search-input"
            defaultValue={query}
            onKeyDown={e => e.key === 'Enter' && handleNewSearch(e.target.value)}
            placeholder="Ask anything..."
          />
          <button className="top-search-btn" onClick={() => handleNewSearch(document.querySelector('.top-search-input').value)}>
            Go
          </button>
        </div>

        <div className="query-header">
          <h1 className="query-title">{query}</h1>
        </div>

        {sources.length > 0 && (
          <div className="sources-card">
            <div className="sources-label">Sources</div>
            <div className="sources-list">
              {sources.map((s, idx) => (
                <a key={idx} href={s.url} target="_blank" rel="noreferrer" className="source-item">
                  <span className="source-num">{idx + 1}</span>
                  <span className="source-title">{s.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="answer-card">
          <div className="answer-label">Answer</div>

          {loading && (
            <div className="loading-state">
              <div className="loading-dots"><span></span><span></span><span></span></div>
              <p>Searching the web...</p>
            </div>
          )}

          {error && <div className="error-state">{error}</div>}

          {answer && !loading && (
            <div className="answer-body">
              {answer.split('\n').map((paragraph, idx) => {
                if (paragraph.trim() === '') return null
                return (
                  <p key={idx}>
                    {formatAnswerWithCitations(paragraph)}
                  </p>
                )
              })}
            </div>
          )}
        </div>

        {answer && !loading && (
          <div className="chat-section">
            <div className="chat-label">Follow-up</div>
            {chatMessages.length > 0 && (
              <div className="chat-messages">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`chat-msg ${msg.role === 'user' ? 'chat-msg--user' : ''}`}>
                    <div className="chat-msg-avatar">{msg.role === 'user' ? 'You' : 'AI'}</div>
                    <div className="chat-msg-content">
                      {msg.text.split('\n').map((p, j) => p.trim() && <p key={j}>{formatAnswerWithCitations(p)}</p>)}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-msg">
                    <div className="chat-msg-avatar">AI</div>
                    <div className="chat-msg-content"><div className="typing-dots"><span></span><span></span><span></span></div></div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
            <div className="chat-input-row">
              <input
                className="chat-input"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChatSend()}
                placeholder="Ask a follow-up..."
              />
              <button className="chat-send" onClick={handleChatSend} disabled={chatLoading || !chatInput.trim()}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
