import { useState, useRef } from "react"

const API_BASE = 'https://cloud9-api-2.onrender.com'

const c = {
  app: { display:'flex', height:'100vh', background:'#0a0a0a', color:'#e5e5e5', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', overflow:'hidden', width:'100vw' },
  sidebar: { width:'260px', borderRight:'1px solid #1a1a1a', background:'#0a0a0a', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'12px', flexShrink:0, height:'100%', overflowY:'auto' },
  logoRow: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 4px', marginBottom:'12px' },
  logoLeft: { display:'flex', alignItems:'center', gap:'8px' },
  logoText: { fontWeight:'600', fontSize:'18px', letterSpacing:'2px', color:'#e5e5e5', textTransform:'uppercase' },
  newChatBtn: { width:'100%', background:'#121212', border:'1px solid #2a2a2a', borderRadius:'10px', padding:'9px 12px', color:'#d4d4d4', cursor:'pointer', fontSize:'13px', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' },
  navItem: (active) => ({ display:'flex', alignItems:'center', gap:'12px', padding:'9px 12px', borderRadius:'8px', cursor:'pointer', color: active?'#fff':'#666', background: active?'#1a1a1a':'transparent', fontSize:'14px', marginBottom:'2px', textDecoration:'none' }),
  sectionLabel: { color:'#444', fontSize:'11px', letterSpacing:'0.08em', padding:'0 12px', marginBottom:'6px', textTransform:'uppercase', display:'block', marginTop:'16px' },
  recentItem: { display:'flex', alignItems:'center', gap:'8px', padding:'7px 12px', borderRadius:'8px', cursor:'pointer', color:'#666', fontSize:'13px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textDecoration:'none' },
  upgradeBox: { border:'1px solid #2a2a2a', background:'linear-gradient(to bottom, #161616, #111)', borderRadius:'12px', padding:'14px', cursor:'pointer', marginTop:'12px' },
  main: { flex:1, display:'flex', flexDirection:'column', background:'#070707', height:'100%', overflow:'hidden', position:'relative' },
  topbar: { display:'flex', alignItems:'center', justifyContent:'flex-end', padding:'14px 24px', gap:'12px', position:'absolute', top:0, right:0, left:0, zIndex:20 },
  signInBtn: { background:'#f4f4f5', border:'none', borderRadius:'8px', color:'#09090b', fontWeight:'500', fontSize:'12px', padding:'7px 18px', cursor:'pointer' },
  content: { flex:1, overflowY:'auto', display:'flex', flexDirection:'column', alignItems:'center', padding:'0 24px 160px', paddingTop:'64px' },
  heroSection: { display:'flex', flexDirection:'column', alignItems:'center', width:'100%', maxWidth:'720px', marginTop:'32px' },
  heroTitle: { fontSize:'52px', fontWeight:'400', margin:'0 0 10px', letterSpacing:'-1px', fontFamily:'Georgia,serif', color:'#fff' },
  heroSub: { fontSize:'14px', color:'#52525b', margin:'0 0 32px', letterSpacing:'0.02em' },
  searchCard: { width:'100%', background:'#0f0f0f', border:'1px solid #27272a', borderRadius:'20px', padding:'16px 20px', marginBottom:'20px', boxShadow:'0 25px 50px rgba(0,0,0,0.5)' },
  searchTextarea: { width:'100%', background:'transparent', border:'none', outline:'none', color:'#e5e5e5', fontSize:'15px', lineHeight:'1.6', resize:'none', fontFamily:'inherit', marginBottom:'12px' },
  searchBottom: { display:'flex', alignItems:'center', justifyContent:'space-between' },
  toolBtn: { background:'none', border:'none', color:'#52525b', cursor:'pointer', padding:'8px', borderRadius:'8px', fontSize:'14px' },
  sendBtn: { width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', background:'#f4f4f5', border:'none', color:'#09090b', borderRadius:'50%', cursor:'pointer', fontSize:'14px', fontWeight:'bold' },
  modelPill: (active, color) => ({ padding:'4px 12px', borderRadius:'20px', border:`1px solid ${active?color:'#27272a'}`, background: active?`${color}20`:'transparent', color: active?color:'#52525b', fontSize:'12px', cursor:'pointer', marginRight:'6px', marginBottom:'6px' }),
  quickBtn: { display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'24px', border:'1px solid #1a1a1a', background:'#0f0f0f', color:'#71717a', fontSize:'12px', cursor:'pointer', marginRight:'8px', marginBottom:'8px' },
  footer: { display:'flex', alignItems:'center', gap:'12px', color:'#3f3f46', fontSize:'11px', marginTop:'8px' },
  answerSection: { width:'100%', maxWidth:'720px', paddingTop:'24px' },
  answerCard: { background:'#0f0f0f', border:'1px solid #1a1a1a', borderRadius:'20px', padding:'24px', lineHeight:'1.8', color:'#d4d4d4', fontSize:'15px', marginBottom:'16px' },
  sourceLabel: { color:'#3f3f46', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px', display:'block' },
  sourceChip: { background:'#0f0f0f', border:'1px solid #1a1a1a', borderRadius:'8px', padding:'6px 12px', color:'#818cf8', fontSize:'12px', textDecoration:'none', marginRight:'6px', marginBottom:'6px', display:'inline-block' },
  relatedBtn: { width:'100%', background:'#0f0f0f', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'12px 16px', color:'#d4d4d4', fontSize:'14px', textAlign:'left', cursor:'pointer', marginBottom:'6px', display:'block' },
  bottomBar: { borderTop:'1px solid #1a1a1a', background:'#070707', padding:'12px 24px' },
}

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
    { id:"groq", label:"Llama 3.3", color:"#f97316" },
    { id:"deepseek", label:"DeepSeek", color:"#3b82f6" },
    { id:"gemini", label:"Gemini Flash", color:"#10b981" },
  ]

  const recentSearches = ["What is quantum computing?","Best habits for productivity","Explain photosynthesis","Startup ideas for 2024","How does AI work?"]
  const quickActions = [{ label:'Research', icon:'🔍' },{ label:'Deep Search', icon:'👁️' },{ label:'Create Image', icon:'🖼️' },{ label:'Code', icon:'💻' },{ label:'Analyze', icon:'📊' }]

  const handleSearch = (q) => {
    const sq = q || input
    if (!sq.trim()) return
    setQuery(sq); setLoading(true); setError(""); setAnswer(""); setSources([]); setRelated([])
    fetch(`${API_BASE}/ask`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ query: sq.trim(), model }) })
      .then(r => r.json())
      .then(data => {
        setAnswer(data.answer || 'No answer')
        setSources(data.sources || [])
        setRelated(data.relatedQuestions || [])
        setLoading(false)
        setTimeout(() => answerRef.current?.scrollIntoView({ behavior:'smooth' }), 100)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }

  const handleMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const r = new SR(); r.lang='en-US'
    r.onstart = () => setListening(true)
    r.onend = () => setListening(false)
    r.onresult = (e) => { const t = e.results[0][0].transcript; setInput(t); handleSearch(t) }
    r.start()
  }

  const StingrayLogo = ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M50,15 C47,15 32,45 10,55 C35,55 45,75 50,90 C55,75 65,55 90,55 C68,45 53,15 50,15 Z" fill="url(#sg)"/>
      <path d="M50,90 L50,105" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
      <defs>
        <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="50%" stopColor="#a3a3a3"/>
          <stop offset="100%" stopColor="#404040"/>
        </linearGradient>
      </defs>
    </svg>
  )

  return (
    <div style={c.app}>

      {/* SIDEBAR */}
      <aside style={c.sidebar}>
        <div>
          {/* Logo */}
          <div style={c.logoRow}>
            <div style={c.logoLeft}>
              <StingrayLogo size={24}/>
              <span style={c.logoText}>Stoic</span>
            </div>
            <button style={{background:'none',border:'none',color:'#555',cursor:'pointer',fontSize:'12px'}}>◀</button>
          </div>

          {/* New Chat */}
          <button style={c.newChatBtn} onClick={() => { setAnswer(""); setQuery(""); setInput("") }}>
            <span style={{display:'flex',alignItems:'center',gap:'8px'}}><span style={{color:'#888'}}>+</span> New Chat</span>
            <span style={{fontSize:'10px',color:'#444',background:'#1a1a1a',border:'1px solid #2a2a2a',padding:'2px 6px',borderRadius:'4px'}}>⌘K</span>
          </button>

          {/* Nav */}
          <a href="#" style={c.navItem(true)}>🏠 Home</a>
          <a href="#" style={c.navItem(false)}>🧭 Discover</a>
          <a href="#" style={c.navItem(false)}>📚 Library</a>

          {/* Recent */}
          <span style={c.sectionLabel}>Recent</span>
          {recentSearches.map((text, i) => (
            <a key={i} href="#" style={c.recentItem} onClick={(e) => { e.preventDefault(); setInput(text); handleSearch(text) }}
              onMouseEnter={e => e.currentTarget.style.background='#1a1a1a'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              💬 <span style={{overflow:'hidden',textOverflow:'ellipsis'}}>{text}</span>
            </a>
          ))}
          <a href="#" style={{...c.recentItem, color:'#444', marginTop:'4px'}}>View all →</a>

          {/* Connectors */}
          <span style={c.sectionLabel}>Connectors <span style={{float:'right',cursor:'pointer',color:'#555'}}>+</span></span>
          {['GitHub','Slack','Notion','Google Drive'].map((name, i) => (
            <a key={i} href="#" style={c.recentItem}
              onMouseEnter={e => e.currentTarget.style.background='#1a1a1a'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <span style={{width:'16px',height:'16px',background:'#1a1a1a',borderRadius:'4px',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:'bold',flexShrink:0}}>{name[0]}</span>
              {name}
            </a>
          ))}
          <a href="#" style={{...c.recentItem, color:'#444'}}>••• More</a>
        </div>

        {/* Upgrade */}
        <div style={c.upgradeBox}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:'6px',color:'#fbbf24',fontSize:'13px',fontWeight:'600',marginBottom:'4px'}}>
                <span>👑</span> Upgrade to Stoic Pro
              </div>
              <p style={{fontSize:'11px',color:'#52525b',margin:0}}>Unlock more power and higher usage limits.</p>
            </div>
            <span style={{color:'#444',fontSize:'11px'}}>▶</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={c.main}>

        {/* Topbar */}
        <div style={c.topbar}>
          <span style={{fontSize:'18px',color:'#444',cursor:'pointer'}}>☀️</span>
          <button style={c.signInBtn}>Sign In</button>
        </div>

        {/* Content */}
        <div style={c.content}>

          {/* HOME */}
          {!answer && !loading && (
            <div style={c.heroSection}>
              <StingrayLogo size={112}/>
              <h1 style={c.heroTitle}>Stoic</h1>
              <p style={c.heroSub}>Think clearly. <span style={{color:'#d4b896'}}>Move forward.</span></p>

              {/* Search box */}
              <div style={c.searchCard}>
                <textarea
                  rows={2}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); handleSearch(input) }}}
                  placeholder="Ask anything..."
                  autoFocus
                  style={c.searchTextarea}
                />
                <div style={c.searchBottom}>
                  <div style={{display:'flex',gap:'4px'}}>
                    {['+','🌐','💡','•••'].map((icon,i) => <button key={i} style={c.toolBtn}>{icon}</button>)}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <button onClick={handleMic} style={{...c.toolBtn, color: listening?'#a855f7':'#52525b'}}>🎙️</button>
                    <button onClick={() => handleSearch(input)} style={c.sendBtn}>➔</button>
                  </div>
                </div>
              </div>

              {/* Model selector */}
              <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',marginBottom:'16px'}}>
                {models.map(m => <button key={m.id} onClick={() => setModel(m.id)} style={c.modelPill(model===m.id, m.color)}>{m.label}</button>)}
              </div>

              {/* Quick actions */}
              <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',marginBottom:'32px'}}>
                {quickActions.map((a,i) => <button key={i} style={c.quickBtn} onClick={() => setInput(a.label+' ')}>{a.icon} {a.label}</button>)}
              </div>

              {/* Footer */}
              <div style={c.footer}>
                <span>Stoic is powered by advanced AI.</span>
                <span style={{color:'#27272a'}}>|</span>
                <span>🔒 Your data is private and secure.</span>
              </div>
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',paddingTop:'80px',color:'#52525b'}}>
              <div style={{fontSize:'32px',marginBottom:'16px'}}>🔍</div>
              <p>Searching with {models.find(m=>m.id===model)?.label}...</p>
            </div>
          )}

          {error && <p style={{color:'#f87171',textAlign:'center'}}>{error}</p>}

          {/* ANSWER */}
          {answer && (
            <div ref={answerRef} style={c.answerSection}>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
                <h2 style={{color:'#fff',margin:0,fontSize:'20px',fontFamily:'Georgia,serif'}}>{query}</h2>
                <span style={{fontSize:'11px',color:'#52525b',background:'#111',border:'1px solid #1a1a1a',borderRadius:'6px',padding:'2px 8px'}}>{models.find(m=>m.id===model)?.label}</span>
              </div>
              <div style={c.answerCard}>{answer}</div>
              {sources.length > 0 && (
                <div style={{marginBottom:'16px'}}>
                  <span style={c.sourceLabel}>Sources</span>
                  <div>{sources.map((s,i) => <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={c.sourceChip}>[{i+1}] {s.title}</a>)}</div>
                </div>
              )}
              {related.length > 0 && (
                <div style={{marginBottom:'32px'}}>
                  <span style={c.sourceLabel}>Related</span>
                  {related.map((q,i) => <button key={i} style={c.relatedBtn} onClick={() => { setInput(q); handleSearch(q) }}>{q}</button>)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM SEARCH */}
        {(answer || loading) && (
          <div style={c.bottomBar}>
            <div style={{maxWidth:'720px',margin:'0 auto'}}>
              <div style={c.searchCard}>
                <textarea rows={1} value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); handleSearch(input) }}}
                  placeholder="Ask anything..." style={c.searchTextarea}/>
                <div style={c.searchBottom}>
                  <div style={{display:'flex',gap:'4px'}}>
                    {models.map(m => <button key={m.id} onClick={() => setModel(m.id)} style={c.modelPill(model===m.id, m.color)}>{m.label}</button>)}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <button onClick={handleMic} style={{...c.toolBtn, color: listening?'#a855f7':'#52525b'}}>🎙️</button>
                    <button onClick={() => handleSearch(input)} style={c.sendBtn}>➔</button>
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