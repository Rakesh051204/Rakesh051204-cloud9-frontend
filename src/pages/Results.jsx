import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import './Results.css'

const API_BASE = 'https://Stoic-api-2.onrender.com'

export default function Results() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''

  const [answer, setAnswer] = useState('')
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
    // Optional: you can re-enable supabase later, but for now use localStorage
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
    setError('')
    setChatMessages([])
    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setAnswer(data.answer)
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
      const res = await fetch(`${API_BASE}/ask`, {
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

  return (
    <div className="results-page">
      <div className="sidebar">
        <button className="home-btn" onClick={() => navigate('/')}>
          ☁️ Stoic
        </button>
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
          <span className="top-search-icon">🔍</span>
          <input
            className="top-search-input"
            defaultValue={query}
            onKeyDown={e => e.key === 'Enter' && handleNewSearch(e.target.value)}
            placeholder="Ask anything..."
          />
        </div>

        <div className="query-header">
          <h1 className="query-title">{query}</h1>
        </div>

        <div className="answer-card">
          <div className="answer-label">
            <div className="ai-dot" />
            Stoic Answer
          </div>

          {loading && (
            <div className="loading-state">
              <div className="loading-bars"><span /><span /><span /><span /></div>
              <p>Thinking...</p>
            </div>
          )}

          {error && <div className="error-state">⚠️ {error}</div>}

          {answer && !loading && (
            <div className="answer-body">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
          )}
        </div>

        {answer && !loading && (
          <div className="chat-section">
            <div className="chat-label">Follow-up</div>
            {chatMessages.length > 0 && (
              <div className="chat-messages">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`chat-msg${msg.role === 'user' ? ' chat-msg--user' : ''}`}>
                    <div className="chat-msg-avatar">{msg.role === 'user' ? '🧑' : '☁️'}</div>
                    <div className="chat-msg-content"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-msg">
                    <div className="chat-msg-avatar">☁️</div>
                    <div className="chat-msg-content"><div className="typing-dots"><span /><span /><span /></div></div>
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
              <button className="chat-send" onClick={handleChatSend} disabled={chatLoading || !chatInput.trim()}>↑</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
