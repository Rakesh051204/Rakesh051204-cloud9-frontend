import { useState, useRef } from "react"
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
  const [model, setModel] = useState("groq")
  const answerRef = useRef(null)

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
      body: JSON.stringify({ query: searchQuery.trim(), model })
    })
      .then(res => res.json())
      .then(data => {
        setAnswer(data.answer || 'No answer')
        setSources(data.sources || [])
        setRelated(data.relatedQuestions || [])
        setLoading(false)
        setTimeout(() => answerRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
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

  const models = [
    { id: "groq", label: "⚡ Llama 3.3", color: "#f97316" },
    { id: "deepseek", label: "🐋 DeepSeek", color: "#3b82f6" },
    { id: "gemini", label: "✨ Gemini Flash", color: "#10b981" },
  ]

  return (
    <div className="home-grok" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="sidebar">
        <div className="logo">Stoic</div>
        <button className="new-chat" onClick={() => { setAnswer(""); setQuery(""); setInput("") }}>+ New Search</button>
        <div className="nav-items">
          <div className="nav-item" onClick={() => handleSearch("Generate image of")}>Image</div>
          <div className="nav-item" onClick={() => handleSearch("Create avatar as")}>Avatar</div>
          <div className="nav-item" onClick={() => handleSearch("Write code for")}>Code</div>
        </div>
      </div>

      <div className="main-area" style={{ flex: 1, overflowY: 'auto', paddingBottom: '140px', paddingLeft: '1rem', paddingRight: '1rem' }}>

        {!answer && !loading && (
          <div style={{ textAlign: 'center', marginTop: '15vh' }}>
            <h1 style={{ fontSize: '3rem', margin: '0 0 0.5rem', background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Stoic</h1>
            <p style={{ color: '#888', fontSize: '1.1rem' }}>Think clearly. Search deeply.</p>
            <div className="suggestions-bar" style={{ marginTop: '2rem' }}>
              {suggestions.map((s, i) => (
                <button key={i} className="sugg-btn" onClick={() => handleSearch(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {loading && <div style={{ color: '#888', padding: '2rem 0', textAlign: 'center' }}>🔍 Searching with {model === 'groq' ? '⚡ Groq' : '🔵 DeepSeek'}...</div>}
        {error && <p style={{ color: '#f87171', textAlign: 'center' }}>Error: {error}</p>}

        {answer && (
          <div ref={answerRef} style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <h2 style={{ color: '#fff', margin: 0 }}>{query}</h2>
              <span style={{ fontSize: '0.75rem', color: '#888', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '2px 8px' }}>
                {model === 'groq' ? '⚡ Groq' : '🔵 DeepSeek'}
              </span>
            </div>

            <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '1.5rem', lineHeight: '1.8', marginBottom: '1.5rem', whiteSpace: 'pre-wrap', color: '#fff' }}>
              {answer}
            </div>

            {sources.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sources</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {sources.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '0.5rem 0.75rem', color: '#a5b4fc', fontSize: '0.85rem', textDecoration: 'none' }}>[{i+1}] {s.title}</a>
                  ))}
                </div>
              </div>
            )}

            {related.length > 0 && (
              <div>
                <h3 style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Related</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {related.map((q, i) => (
                    <button key={i} onClick={() => { setInput(q); handleSearch(q) }} style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', textAlign: 'left', cursor: 'pointer' }}>{q}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed search box at bottom with model selector */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0a0a0a', padding: '0.75rem 1rem', borderTop: '1px solid #222', zIndex: 100 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* Model selector */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {models.map(m => (
              <button key={m.id} onClick={() => setModel(m.id)} style={{ padding: '4px 12px', borderRadius: '20px', border: `1px solid ${model === m.id ? m.color : '#333'}`, background: model === m.id ? `${m.color}22` : 'transparent', color: model === m.id ? m.color : '#666', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch(input)}
              placeholder="Ask anything..."
              autoFocus
              style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', fontSize: '1rem', outline: 'none' }}
            />
            <button onClick={() => handleSearch(input)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>Go</button>
          </div>
        </div>
      </div>
    </div>
  )
}