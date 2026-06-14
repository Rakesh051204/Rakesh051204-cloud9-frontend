import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const suggestions = [
    "What is quantum computing?",
    "Latest AI breakthroughs 2026",
    "Best programming languages to learn",
    "Explain how Grok works",
  ];

  return (
    <div className="grok-layout">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">☁️ Cloud9</div>
          <button className="new-chat" onClick={() => navigate('/')}>
            + New Search
          </button>
        </div>

        <div className="sidebar-section">
          <div className="section-title">Modes</div>
          <div className="nav-item" onClick={() => navigate('/image')}>🖼️ Image Generation</div>
          <div className="nav-item" onClick={() => navigate('/avatar')}>🧑‍🎨 AI Avatar</div>
          <div className="nav-item" onClick={() => handleSearch('Write Python code for')}>💻 Code Studio</div>
        </div>

        <div className="sidebar-bottom">
          <div className="user-info">👤 Rakesh Palani</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="hero">
          <div className="hero-logo">☁️</div>
          <h1 className="hero-title">What can I help you with today?</h1>
        </div>

        {/* Bottom Search Bar (Grok Style) */}
        <div className="bottom-search">
          <div className="search-container">
            <button className="attach-btn">＋</button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(input)}
              placeholder="Ask anything..."
              className="search-input"
            />

            <button className="mic-btn">🎤</button>
            <button 
              className="send-btn"
              onClick={() => handleSearch(input)}
              disabled={!input.trim()}
            >
              ↑
            </button>
          </div>
          <p className="hint">Cloud9 can make mistakes. Verify important information.</p>
        </div>

        {/* Suggestions */}
        <div className="suggestions">
          {suggestions.map((s, i) => (
            <button key={i} className="suggestion" onClick={() => handleSearch(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}