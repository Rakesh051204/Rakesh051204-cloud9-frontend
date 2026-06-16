import { useState, useRef } from "react";

const API_BASE = 'https://cloud9-api-2.onrender.com';

export default function Home() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!input.trim()) return;
    setQuery(input);
    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input.trim() }),
      });
      const data = await res.json();
      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (e) {
      setAnswer("Sorry, something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0A0A0A', color: '#E5E5E5', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' }}>

      {/* Sidebar */}
      <div style={{ width: '260px', background: '#0A0A0A', borderRight: '1px solid #1F1F1F', padding: '20px 0', display: 'flex', flexDirection: 'column' }}>

        {/* Logo */}
        <div style={{ padding: '0 24px 24px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #1F1F1F' }}>
          <svg width="32" height="32" viewBox="0 0 100 100" fill="#E5E5E5">
            <path d="M50 15 Q30 40 15 55 Q35 65 50 85 Q65 65 85 55 Q70 40 50 15Z" />
          </svg>
          <span style={{ fontSize: '22px', fontWeight: '600' }}>STOIC</span>
        </div>

        {/* Navigation - Dark Icons */}
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavItem label="Home" active />
          <NavItem label="Discover" />
          <NavItem label="Library" />
          <NavItem label="Imagine" />
        </div>

        {/* Recent */}
        <div style={{ padding: '0 16px', marginTop: '20px' }}>
          <div style={{ padding: '0 20px', color: '#666', fontSize: '12px', marginBottom: '8px' }}>RECENT</div>
          {["What is quantum computing?", "Best habits for productivity", "Explain photosynthesis"].map((item, i) => (
            <div 
              key={i}
              onClick={() => { setInput(item); handleSearch(); }}
              style={{ padding: '8px 20px', color: '#A1A1AA', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Upgrade */}
        <div style={{ marginTop: 'auto', padding: '20px 16px' }}>
          <div style={{ background: '#1F1F1F', borderRadius: '12px', padding: '16px', border: '1px solid #333' }}>
            Upgrade to Stoic Pro
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>

        <div style={{ position: 'absolute', top: '20px', right: '30px' }}>
          <button style={{ background: '#fff', color: '#000', padding: '8px 20px', borderRadius: '9999px' }}>Sign In</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 40px 180px' }}>
          {!answer && !loading && (
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
              <div style={{ marginBottom: '30px' }}>
                <svg width="130" height="130" viewBox="0 0 100 100" fill="#E5E5E5">
                  <path d="M50 15 Q30 40 15 55 Q35 65 50 85 Q65 65 85 55 Q70 40 50 15Z" />
                </svg>
              </div>
              <h1 style={{ fontSize: '52px', fontWeight: '400' }}>Stoic</h1>
              <p style={{ color: '#888', fontSize: '19px' }}>Think clearly. Move forward.</p>
            </div>
          )}

          {answer && (
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>{query}</h2>
              <div style={{ lineHeight: '1.75', fontSize: '17px' }}>{answer}</div>

              {sources.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                  <div style={{ color: '#666', fontSize: '13px', marginBottom: '12px' }}>SOURCES</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {sources.map((s, i) => (
                      <a key={i} href={s.url} target="_blank" style={{ background: '#1F1F1F', padding: '10px 16px', borderRadius: '12px', fontSize: '14px', color: '#60A5FA' }}>
                        [{i+1}] {s.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Persistent Search Bar */}
        <div style={{ position: 'fixed', bottom: 0, left: '260px', right: 0, background: '#0A0A0A', borderTop: '1px solid #1F1F1F', padding: '16px 24px' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ background: '#18181B', border: '1px solid #3F3F46', borderRadius: '20px', padding: '8px' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Ask anything..."
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', padding: '16px 24px', fontSize: '17px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 12px 8px' }}>
                <button onClick={handleSearch} style={{ background: '#E5E5E5', color: '#0A0A0A', width: '44px', height: '44px', borderRadius: '12px', fontSize: '20px' }}>→</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ label, active = false }) {
  return (
    <div style={{
      padding: '10px 20px',
      background: active ? '#1F1F1F' : 'transparent',
      borderRadius: '12px',
      color: active ? '#E5E5E5' : '#A1A1AA',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      fontSize: '15px'
    }}>
      <span style={{ opacity: 0.6, fontSize: '18px' }}>•</span>
      <span>{label}</span>
    </div>
  );
}