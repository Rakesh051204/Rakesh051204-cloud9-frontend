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
      body: JSON.stringify({ query: searchQuery.trim() })
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

  return (
    <div className="home-grok">
      <div className="sidebar">
        <div className="logo">Stoic</div>
        <button className="new-chat" onClick={() => { setAnswer(""); setQuery(""); setInput("") }}>+ New Search</button>
        <div className="nav-items">
          <div className="nav-item" onClick={() => handleSearch("Generate image of")}>Image</div>
          <div className="nav-item" onClick={() => handleSearch("Create avatar as")}>Avatar</div>
          <div className="nav-item" onClick={() => handleSearch("Write code for")}>Code</div>
        </div>
      </div>

      <div className="main-area">

        {/* Search box always at top */}
        <div style={{position:'sticky', top:0, background:'#0a0a0a', paddingTop:'1.5rem', paddingBottom:'1rem', zIndex:10}}>
          {!answer && !loading && (
            <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
              <h1 style={{fontSize:'2.5rem', margin:'0 0 0.5rem'}}>Stoic</h1>
              <p style={{color:'#888', margin:0}}>Think clearly. Search deeply.</p>
            </div>
          )}
          <div className="search-box">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch(input)}
              placeholder="Ask anything..."
              autoFocus
              style={{flex:1, padding:'0.75rem 1rem', borderRadius:'8px', border:'1px solid #333', background:'#111', color:'#fff', fontSize:'1rem'}}
            />
            <button className="send" onClick={() => handleSearch(input)}>Go</button>
          </div>
        </div>

        {/* Suggestions - only on home */}
        {!answer && !loading && (
          <div className="suggestions-bar">
            {suggestions.map((s, i) => (
              <button key={i} className="sugg-btn" onClick={() => handleSearch(s)}>{s}</button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && <div style={{color:'#888', padding:'2rem 0'}}>🔍 Searching the web...</div>}

        {/* Error */}
        {error && <p style={{color:'#f87171'}}>Error: {error}</p>}

        {/* Answer below search box */}
        {answer && (
          <div ref={answerRef} style={{marginTop:'1rem'}}>
            <h2 style={{color:'#fff', marginBottom:'1rem'}}>{query}</h2>

            <div style={{background:'#111', border:'1px solid #222', borderRadius:'12px', padding:'1.5rem', lineHeight:'1.8', marginBottom:'1.5rem', whiteSpace:'pre-wrap', color:'#fff'}}>
              {answer}
            </div>

            {sources.length > 0 && (
              <div style={{marginBottom:'1.5rem'}}>
                <h3 style={{color:'#888', fontSize:'0.85rem', marginBottom:'0.75rem', textTransform:'uppercase', letterSpacing:'0.1em'}}>Sources</h3>
                <div style={{display:'flex', flexWrap:'wrap', gap:'0.5rem'}}>
                  {sources.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{background:'#1a1a1a', border:'1px solid #333', borderRadius:'8px', padding:'0.5rem 0.75rem', color:'#a5b4fc', fontSize:'0.85rem', textDecoration:'none'}}>[{i+1}] {s.title}</a>
                  ))}
                </div>
              </div>
            )}

            {related.length > 0 && (
              <div>
                <h3 style={{color:'#888', fontSize:'0.85rem', marginBottom:'0.75rem', textTransform:'uppercase', letterSpacing:'0.1em'}}>Related</h3>
                <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                  {related.map((q, i) => (
                    <button key={i} onClick={() => { setInput(q); handleSearch(q) }} style={{background:'#1a1a1a', border:'1px solid #333', borderRadius:'8px', padding:'0.75rem 1rem', color:'#fff', fontSize:'0.9rem', textAlign:'left', cursor:'pointer'}}>{q}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}