import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import './Home.css'

const suggestions = [
  'Latest AI breakthroughs 2026',
  'Best programming languages to learn',
  'How does quantum computing work',
  'Top startups in India 2026',
]

export default function Home() {
  const navigate = useNavigate()

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="home">
      <div className="home-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="home-content">
        <div className="logo">
          <div className="logo-icon">☁️</div>
          <h1 className="logo-text">Cloud9</h1>
        </div>
        <p className="tagline">Search the web. Get answers. Instantly.</p>
        <div className="search-wrap">
          <SearchBar onSearch={handleSearch} size="large" />
        </div>
        <div style={{display:'flex',gap:'1rem',justifyContent:'center',marginTop:'2rem',flexWrap:'wrap'}}>
          <button onClick={() => navigate('/image')} style={{padding:'0.75rem 1.5rem',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:'12px',color:'white',cursor:'pointer',fontSize:'0.95rem',fontWeight:'bold'}}>
            Image Generation
          </button>
          <button onClick={() => navigate('/avatar')} style={{padding:'0.75rem 1.5rem',background:'linear-gradient(135deg,#f59e0b,#f97316)',border:'none',borderRadius:'12px',color:'white',cursor:'pointer',fontSize:'0.95rem',fontWeight:'bold'}}>
            AI Avatar
          </button>
          <button onClick={() => handleSearch('Write me a Python code')} style={{padding:'0.75rem 1.5rem',background:'linear-gradient(135deg,#0ea5e9,#06b6d4)',border:'none',borderRadius:'12px',color:'white',cursor:'pointer',fontSize:'0.95rem',fontWeight:'bold'}}>
            Code Studio
          </button>
          <button onClick={() => handleSearch('Research latest AI trends 2026')} style={{padding:'0.75rem 1.5rem',background:'linear-gradient(135deg,#f59e0b,#ef4444)',border:'none',borderRadius:'12px',color:'white',cursor:'pointer',fontSize:'0.95rem',fontWeight:'bold'}}>
            Research
          </button>
          <button onClick={() => handleSearch('Discover knowledge about universe')} style={{padding:'0.75rem 1.5rem',background:'linear-gradient(135deg,#10b981,#059669)',border:'none',borderRadius:'12px',color:'white',cursor:'pointer',fontSize:'0.95rem',fontWeight:'bold'}}>
            Knowledge
          </button>
        </div>
        <div className="suggestions">
          <span className="suggestions-label">Try asking:</span>
          <div className="suggestion-pills">
            {suggestions.map((s) => (
              <button key={s} className="pill" onClick={() => handleSearch(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <footer className="home-footer">
        <span>Cloud9 · AI-powered search</span>
        <span className="footer-dot">·</span>
        <span>Built by Rakesh Palani</span>
      </footer>
    </div>
  )
}