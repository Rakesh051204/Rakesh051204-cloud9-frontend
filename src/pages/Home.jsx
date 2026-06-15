import { useState } from "react"
import "./Home.css"

const API_BASE = 'https://cloud9-api-2.onrender.com'

export default function Home() {
  const [input, setInput] = useState("")
  const [query, setQuery] = useState("")
  const [answer, setAnswer] = useState("")
  const [sources, setSources] = useState([])
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = (q) => {
    const searchQuery = q || input
    if (!searchQuery.trim()) return
    setQuery(searchQuery)
    setLoading(true)
    setError("")
    setAnswer("")
    setSources([])
    setRelated([])
    fetch(`${API_BASE}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: searchQuery.trim() })
    })
      .then(res => res.json())
      .then(data => {
        setAnswer(data.answer || 'No answer')
        setSources(data.sources || [])
        setRelated(data.relatedQuestions || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  const suggestions = [
    "What is quantum computing?",
    "Latest AI breakthroughs 2026",
    "How does blockchain work?",
    "What is machine learning?"
  ]

  return (
    <div className="home-grok">
      <div className="sidebar">
        <div className="logo">Cloud9</div>
        <button className="new-chat" onClick={() => { setAnswer(""); setQuery(""); setInput("") }}>+ New Search</button>
        <div className="nav-items">
          <div className="nav-item" onClick={() => handleSearch("Generate image of")}>Image</div>
          <div className="nav-item" onClick={() => handleSearch("Create avatar as")}>Avatar</div>
          <div className="nav-item" onClick={() => handleSearch("Write code for")}>Code</div>
        </div>
      </div>

      <div className="main-area">
        {!answer && !loading && (
          <>
            <div className="hero">
              <div className="hero-badge">Powered by AI + Live Web Search</div>
              <h1>Think clearly.<br/>Search deeply.</h1>
              <p>Get instant answers with real sources and AI reasoning.</p>
            </div>
          </>
        )}

        <div className="search-container">
          <div className="search-box">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch(input)}
              placeholder="Ask anything..."
              autoFocus
            />
            <button className="send" onClick={() => handleSearch(input)}>Go</button>
          </div>
        </div>

        {!answer && !loading && (
          <div className="suggestions-bar">
            {suggestions.map((s, i) => (
              <button key={i} className="sugg-btn" onClick={() => handleSearch(s)}>{s}</button>
            ))}
          </div>
        )}

        {loading && (
          <div style={{ color: '#888', padding: '2rem 0' }}>🔍 Searching the web...</div>
        )}

        {error && <p style={{ color: '#f87171' }}>Error: {error}</p>}

        {answer && (
          <div style={{ marginTop: '1.5rem' }}>
            <h2 style={{ color: '#fff', marginBottom: '1rem' }}>{query}</h2>

            <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '1.5rem', lineHeight: '1.8', marginBottom: '1.5rem', whiteSpace: 'pre-wrap', color: '#fff' }}>
              {answer}
            </div>

            {sources.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sources</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {sources.map((s, i) => (
                    <a key={i} href={s.url}