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
  const [listening, setListening] = useState(false)
  const answerRef = useRef(null)

  const recentSearches = [
    "What is quantum computing?",
    "Best habits for productivity",
    "Explain photosynthesis",
    "Latest AI breakthroughs 2026",
    "How does blockchain work?",
  ]

  const models = [
    { id: "groq", label: "⚡ Llama 3.3", color: "#f97316" },
    { id: "deepseek", label: "🐋 DeepSeek", color: "#3b82f6" },
    { id: "gemini", label: "✨ Gemini Flash", color: "#10b981" },
  ]

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

  const handleMic = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.")
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = 'en-US'
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
      handleSearch(transcript)
    }
    recognition.start()
  }

  const quickActions = [
    { label: "🔍 Research", q: "Research about " },
    { label: "🌐 Deep Search", q: "Deep search on " },
    { label: "🖼️ Create Image", q: "Create image of " },
    { label: "</> Code", q: "Write code for " },
    { label: "📊 Analyze", q: "Analyze " },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* SIDEBAR */}
      <div style={{ width: '260px', background: '#111', borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', padding: '16px 12px', gap: '8px', flexShrink: 0 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', marginBottom: '8px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>✦</div>
          <span style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px' }}>STOIC</span>
        </div>

        {/* New Chat */}
        <button onClick={() => { setAnswer(""); setQuery(""); setInput("") }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '10px 14px', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '500', width: '100%', textAlign: 'left' }}>
          <span style={{ fontSize: '18px' }}>+</span> New Chat <span style={{ marginLeft: 'auto', color: '#444', fontSize: '12px' }}>⌘K</span>
        </button>

        {/* Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '8px' }}>
          {[{ icon: '🏠', label: 'Home' }, { icon: '🌐', label: 'Discover' }, { icon: '🔖', label: 'Library' }].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: i === 0 ? '#fff' : '#666', background: i === 0 ? '#1a1a1a' : 'transparent', fontSize: '14px' }}>
              {item.icon} {item.label}
            </div>
          ))}
        </div>

        {/* Recent */}
        <div style={{ marginTop: '16px' }}>
          <p style={{ color: '#444', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px', marginBottom: '6px' }}>Recent</p>
          {recentSearches.map((s, i) => (
            <div key={i} onClick={() => { setInput(s); handleSearch(s) }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', color: '#888', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              💬 {s}
            </div>
          ))}
        </div>

        {/* Bottom upgrade */}
        <div style={{ marginTop: 'auto', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '14px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>💎</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', margin: 0 }}>Upgrade to Stoic Pro</p>
              <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>Unlock more power</p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#666' }}>→</span>
          </div>
        </div>
      </div>

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid #1a1a1a' }}>
          <button style={{ background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '6px 16px', cursor: 'pointer', fontSize: '14px' }}>Sign In</button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 160px' }}>

          {/* Home screen */}
          {!answer && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>✦</div>
              <h1 style={{ fontSize: '3rem', fontWeight: '700', margin: '0 0 8px', letterSpacing: '-1px' }}>Stoic</h1>
              <p style={{ color: '#666', fontSize: '1.1rem', margin: '0 0 40px' }}>Think clearly. <span style={{ color: '#a855f7' }}>Move forward.</span></p>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#666' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
              <p>Searching with {models.find(m => m.id === model)?.label}...</p>
            </div>
          )}

          {error && <p style={{ color: '#f87171', textAlign: 'center' }}>Error: {error}</p>}

          {answer && (
            <div ref={answerRef} style={{ maxWidth: '760px', margin: '2rem auto 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <h2 style={{ color: '#fff', margin: 0, fontSize: '1.4rem' }}>{query}</h2>
                <span style={{ fontSize: '0.75rem', color: '#888', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '2px 8px' }}>
                  {models.find(m => m.id === model)?.label}
                </span>
              </div>

              <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '1.5rem', lineHeight: '1.9', marginBottom: '1.5rem', color: '#ddd', fontSize: '0.95rem' }}>
                {answer}
              </div>

              {sources.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ color: '#555', fontSize: '0.75rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sources</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {sources.map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '0.5rem 0.75rem', color: '#a5b4fc', fontSize: '0.8rem', textDecoration: 'none' }}>[{i+1}] {s.title}</a>
                    ))}
                  </div>
                </div>
              )}

              {related.length > 0 && (
                <div>
                  <h3 style={{ color: '#555', fontSize: '0.75rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Related</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {related.map((q, i) => (
                      <button key={i} onClick={() => { setInput(q); handleSearch(q) }} style={{ background: '#111', border: '1px solid #222', borderRadius: '10px', padding: '0.75rem 1rem', color: '#ccc', fontSize: '0.9rem', textAlign: 'left', cursor: 'pointer' }}>{q}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FIXED BOTTOM SEARCH */}
        <div style={{ position: 'fixed', bottom: 0, left: '260px', right: 0, background: '#0a0a0a', padding: '16px 24px', borderTop: '1px solid #1a1a1a', zIndex: 100 }}>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>

            {/* Search box */}
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '12px 16px', marginBottom: '12px' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch(input)}
                placeholder="Ask anything..."
                autoFocus
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '1rem', marginBottom: '12px' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[{icon:'＋',tip:'Attach'},{icon:'🌐',tip:'Web'},{icon:'💡',tip:'Ideas'},{icon:'···',tip:'More'}].map((btn, i) => (
                    <button key={i} title={btn.tip} style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', padding: '6px 8px', borderRadius: '6px', fontSize: '14px' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = '#555'}>
                      {btn.icon}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={handleMic} style={{ background: 'transparent', border: 'none', color: listening ? '#a855f7' : '#555', cursor: 'pointer', fontSize: '18px', padding: '6px' }}>🎤</button>
                  <button onClick={() => handleSearch(input)} style={{ background: '#fff', border: 'none', color: '#000', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
                </div>
              </div>
            </div>

            {/* Model selector + quick actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {models.map(m => (
                <button key={m.id} onClick={() => setModel(m.id)} style={{ padding: '5px 12px', borderRadius: '20px', border: `1px solid ${model === m.id ? m.color : '#2a2a2a'}`, background: model === m.id ? `${m.color}22` : 'transparent', color: model === m.id ? m.color : '#555', fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {m.label}
                </button>
              ))}
              <div style={{ width: '1px', height: '16px', background: '#2a2a2a', margin: '0 4px' }} />
              {quickActions.map((a, i) => (
                <button key={i} onClick={() => { setInput(a.q); }} style={{ padding: '5px 12px', borderRadius: '20px', border: '1px solid #2a2a2a', background: 'transparent', color: '#555', fontSize: '0.78rem', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#555' }}>
                  {a.label}
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}