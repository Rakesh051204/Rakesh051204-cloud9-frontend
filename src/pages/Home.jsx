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
    "Best programming languages for 2026",
    "Explain how Grok AI works",
  ];

  return (
    <div className="grok-app">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">☁️ Cloud9</div>
        <button className="new-btn" onClick={() => navigate('/')}>+ New Chat</button>
        
        <div className="sidebar-links">
          <div className="link" onClick={() => navigate('/image')}>🖼️ Image Generation</div>
          <div className="link" onClick={() => navigate('/avatar')}>🧑‍🎨 AI Avatar</div>
          <div className="link" onClick={() => handleSearch("Write a Python script")}>💻 Code Studio</div>
        </div>
      </div>

      {/* Main Area */}
      <div className="main">
        <div className="center-content">
          <div className="big-logo">☁️</div>
          <h1 className="title">How can I help you today?</h1>
          
          <div className="suggestions">
            {suggestions.map((text, i) => (
              <button key={i} className="sugg-btn" onClick={() => handleSearch(text)}>
                {text}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Search Bar */}
        <div className="bottom-bar">
          <div className="search-box">
            <button className="icon-btn">＋</button>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(input)}
              placeholder="Ask anything..." 
              className="input"
            />
            <button className="icon-btn">🎤</button>
            <button 
              className="send-btn"
              onClick={() => handleSearch(input)}
              disabled={!input.trim()}
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}