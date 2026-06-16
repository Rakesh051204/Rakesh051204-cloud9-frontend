import { useState, useRef } from "react"

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

  const models = [
    { id: "groq", label: "Llama 3.3", color: "#f97316" },
    { id: "deepseek", label: "DeepSeek", color: "#3b82f6" },
    { id: "gemini", label: "Gemini Flash", color: "#10b981" },
  ]

  const recentSearches = [
    "What is quantum computing?",
    "Best habits for productivity",
    "Explain photosynthesis",
    "Startup ideas for 2024",
    "How does AI work?",
  ]

  const quickActions = [
    { label: 'Research', icon: '🔍' },
    { label: 'Deep Search', icon: '👁️' },
    { label: 'Create Image', icon: '🖼️' },
    { label: 'Code', icon: '💻' },
    { label: 'Analyze', icon: '📊' },
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
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.lang = 'en-US'
    r.onstart = () => setListening(true)
    r.onend = () => setListening(false)
    r.onresult = (e) => { const t = e.results[0][0].transcript; setInput(t); handleSearch(t) }
    r.start()
  }

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-[#E5E5E5] font-sans antialiased w-screen overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-[260px] border-r border-zinc-900 bg-[#0A0A0A] flex flex-col justify-between p-3 shrink-0 h-full">
        <div className="space-y-6">

          {/* Logo */}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 text-zinc-300">
                <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
                  <path d="M50,15 C47,15 32,45 10,55 C35,55 45,75 50,90 C55,75 65,55 90,55 C68,45 53,15 50,15 Z"/>
                </svg>
              </div>
              <span className="font-semibold text-lg tracking-wider text-zinc-200 uppercase">Stoic</span>
            </div>
            <button className="text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-zinc-900 text-xs">◀</button>
          </div>

          {/* New Chat */}
          <button className="w-full bg-[#121212] hover:bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition flex items-center justify-between px-3 py-2 rounded-lg text-sm text-zinc-300"
            onClick={() => { setAnswer(""); setQuery(""); setInput("") }}>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">+</span>
              <span>New Chat</span>
            </div>
            <kbd className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-mono">⌘ K</kbd>
          </button>

          {/* Nav */}
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#171717] text-white text-sm font-medium">🏠 Home</a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 text-sm">🧭 Discover</a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 text-sm">📚 Library</a>
          </nav>

          {/* Recent */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider px-3 block mb-2">Recent</span>
            {recentSearches.map((text, idx) => (
              <a key={idx} href="#" onClick={() => { setInput(text); handleSearch(text) }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 text-sm truncate">
                💬 <span className="truncate">{text}</span>
              </a>
            ))}
            <button className="w-full flex items-center justify-between px-3 py-1.5 text-zinc-500 hover:text-zinc-300 text-xs mt-1">
              <span>View all</span><span>▶</span>
            </button>
          </div>

          {/* Connectors */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider">Connectors</span>
              <span className="text-zinc-500 text-xs cursor-pointer hover:text-zinc-300">+</span>
            </div>
            {[{ name: 'GitHub' }, { name: 'Slack' }, { name: 'Notion' }, { name: 'Google Drive' }].map((app, idx) => (
              <a key={idx} href="#" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 text-sm">
                <div className="w-4 h-4 rounded-sm bg-zinc-800 flex items-center justify-center text-[10px] font-bold">{app.name[0]}</div>
                <span>{app.name}</span>
              </a>
            ))}
            <button className="flex items-center gap-2.5 px-3 py-1.5 text-zinc-500 hover:text-zinc-300 text-sm">••• More</button>
          </div>
        </div>

        {/* Upgrade */}
        <div className="border border-zinc-800/80 bg-gradient-to-b from-zinc-900/50 to-zinc-950/50 p-3.5 rounded-xl cursor-pointer hover:border-zinc-700/80 transition">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-medium text-sm">
                <span>👑</span><span>Upgrade to Stoic Pro</span>
              </div>
              <p className="text-xs text-zinc-500">Unlock more power and higher usage limits.</p>
            </div>
            <span className="text-zinc-500 text-xs">▶</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col relative bg-[#070707] h-full overflow-hidden">

        {/* Topbar */}
        <header className="flex items-center justify-end p-4 gap-4 absolute top-0 right-0 left-0 z-20">
          <button className="text-zinc-400 hover:text-zinc-200 p-2 rounded-full hover:bg-zinc-900/50">☀️</button>
          <button className="bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs px-4 py-2 rounded-lg shadow-sm">Sign In</button>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center px-4 pt-16 pb-8">

          {/* HOME SCREEN */}
          {!answer && !loading && (
            <div className="flex flex-col items-center justify-center w-full max-w-[720px] mx-auto mt-8">
              <div className="w-28 h-28 text-zinc-300 mb-2">
                <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full drop-shadow-lg">
                  <path d="M50,15 C47,15 32,45 10,55 C35,55 45,75 50,90 C55,75 65,55 90,55 C68,45 53,15 50,15 Z" fill="url(#silverGrad)"/>
                  <defs>
                    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff"/>
                      <stop offset="50%" stopColor="#a3a3a3"/>
                      <stop offset="100%" stopColor="#404040"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h1 className="text-5xl font-serif font-normal tracking-wide text-white mb-2.5">Stoic</h1>
              <p className="text-sm tracking-wide text-zinc-500 mb-8">Think clearly. <span className="text-amber-200/70">Move forward.</span></p>

              {/* Search box */}
              <div className="w-full bg-[#0F0F0F] border border-zinc-800/80 rounded-2xl p-4 shadow-2xl focus-within:border-zinc-700/80 transition-all mb-5">
                <textarea
                  rows={2}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSearch(input))}
                  placeholder="Ask anything..."
                  autoFocus
                  className="w-full bg-transparent resize-none outline-none text-zinc-200 placeholder-zinc-600 text-[15px] leading-relaxed border-0 focus:ring-0 p-0"
                />
                <div className="flex items-center justify-between mt-3 pt-1">
                  <div className="flex items-center gap-1.5">
                    <button className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded-lg text-sm">+</button>
                    <button className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded-lg text-sm">🌐</button>
                    <button className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded-lg text-sm">💡</button>
                    <button className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded-lg text-sm">•••</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleMic} className={`p-2 hover:bg-zinc-900 rounded-lg text-sm ${listening ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}>🎙️</button>
                    <button onClick={() => handleSearch(input)} className="w-8 h-8 flex items-center justify-center bg-zinc-200 hover:bg-white text-zinc-950 rounded-full text-xs font-bold">➔</button>
                  </div>
                </div>
              </div>

              {/* Model selector */}
              <div className="flex items-center gap-2 mb-4 flex-wrap justify-center">
                {models.map(m => (
                  <button key={m.id} onClick={() => setModel(m.id)}
                    style={{ borderColor: model === m.id ? m.color : '#27272a', color: model === m.id ? m.color : '#71717a', background: model === m.id ? `${m.color}15` : 'transparent' }}
                    className="px-3 py-1 rounded-full border text-xs transition">
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Quick actions */}
              <div className="flex items-center justify-center flex-wrap gap-2 mb-8">
                {quickActions.map((pill, i) => (
                  <button key={i} onClick={() => setInput(pill.label + ' ')}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F0F0F] border border-zinc-900 hover:border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 transition">
                    <span className="text-zinc-500 text-[11px]">{pill.icon}</span>
                    <span>{pill.label}</span>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 text-[11px] text-zinc-600">
                <span>Stoic is powered by advanced AI.</span>
                <span className="text-zinc-800">|</span>
                <span>🔒 Your data is private and secure.</span>
              </div>
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 mt-20">
              <div className="text-3xl mb-4">🔍</div>
              <p>Searching with {models.find(m => m.id === model)?.label}...</p>
            </div>
          )}

          {error && <p className="text-red-400 text-center mt-8">{error}</p>}

          {/* ANSWER */}
          {answer && (
            <div ref={answerRef} className="w-full max-w-[720px] mx-auto pt-6">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-white text-xl font-serif">{query}</h2>
                <span className="text-[11px] text-zinc-500 bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5">
                  {models.find(m => m.id === model)?.label}
                </span>
              </div>

              <div className="bg-[#0F0F0F] border border-zinc-800/80 rounded-2xl p-6 text-zinc-300 leading-relaxed text-[15px] mb-4">
                {answer}
              </div>

              {sources.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] text-zinc-600 uppercase tracking-wider mb-2">Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                        className="bg-[#0F0F0F] border border-zinc-800 rounded-lg px-3 py-1.5 text-indigo-400 text-xs hover:border-zinc-700 transition">
                        [{i+1}] {s.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {related.length > 0 && (
                <div className="mb-8">
                  <p className="text-[11px] text-zinc-600 uppercase tracking-wider mb-2">Related</p>
                  <div className="flex flex-col gap-2">
                    {related.map((q, i) => (
                      <button key={i} onClick={() => { setInput(q); handleSearch(q) }}
                        className="bg-[#0F0F0F] border border-zinc-800 rounded-xl px-4 py-3 text-zinc-300 text-sm text-left hover:border-zinc-700 transition">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FIXED BOTTOM SEARCH - shows after search */}
        {(answer || loading) && (
          <div className="border-t border-zinc-900 bg-[#070707] px-6 py-3">
            <div className="max-w-[720px] mx-auto">
              <div className="w-full bg-[#0F0F0F] border border-zinc-800/80 rounded-2xl p-4 focus-within:border-zinc-700/80 transition-all">
                <textarea
                  rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSearch(input))}
                  placeholder="Ask anything..."
                  className="w-full bg-transparent resize-none outline-none text-zinc-200 placeholder-zinc-600 text-[15px] leading-relaxed border-0 focus:ring-0 p-0"
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5">
                    {models.map(m => (
                      <button key={m.id} onClick={() => setModel(m.id)}
                        style={{ borderColor: model === m.id ? m.color : '#27272a', color: model === m.id ? m.color : '#71717a', background: model === m.id ? `${m.color}15` : 'transparent' }}
                        className="px-2.5 py-0.5 rounded-full border text-[11px] transition">
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleMic} className={`p-2 hover:bg-zinc-900 rounded-lg text-sm ${listening ? 'text-purple-400' : 'text-zinc-500'}`}>🎙️</button>
                    <button onClick={() => handleSearch(input)} className="w-8 h-8 flex items-center justify-center bg-zinc-200 hover:bg-white text-zinc-950 rounded-full text-xs font-bold">➔</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}