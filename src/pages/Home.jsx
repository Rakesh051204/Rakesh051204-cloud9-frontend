import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const suggestions = [
    'What is quantum computing?',
    'Latest AI breakthroughs 2026',
    'Create avatar as Naruto anime',
    'Generate image of sunset over mountains'
  ]

  return (
    <div className="home-grok">
      <div className="sidebar">
        <div className="logo">☁️ Stoic</div>
        <button className="new-chat" onClick={() => navigate('/')}>+ New Chat</button>
        <div className="nav-items">
          <div className="nav-item" onClick={() => handleSearch('Generate image of')}>🖼️ Image</div>
          <div className="nav-item" onClick={() => handleSearch('Create avatar as')}>🎨 Avatar</div>
          <div className="nav-item" onClick={() => handleSearch('Write code for')}>💻 Code</div>
        </div>
      </div>

      <div className="main-area">
        <div className="hero">
          <div className="hero-icon">☁️</div>
          <h1>What can I help with?</h1>
        </div>

        <div className="suggestions-bar">
          {suggestions.map((s, i) => (
            <button key={i} className="sugg-btn" onClick={() => handleSearch(s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="bottom-search">
          <div className="search-box">
            <button className="attach">+</button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch(input)}
              placeholder="Ask anything..."
            />
            <button className="mic">🎤</button>
            <button className="send" onClick={() => handleSearch(input)}>↑</button>
          </div>
        </div>
      </div>
    </div>
  )
}
