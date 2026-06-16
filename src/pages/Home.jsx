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
      setAnswer(data.answer || "No answer generated.");
      setSources(data.sources || []);
    } catch (e) {
      setAnswer("Sorry, something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0A0A0A', color: '#E5E5E5', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' }}>

      {/* Sidebar - Clean & Professional */}
      <div style={{ width: '260px', background: '#0A0A0A', borderRight: '1px solid #1F1F1F', padding: '20px 0', display: 'flex', flexDirection: 'column' }}>
        
        {/* Logo */}
        <div style={{ padding: '0 24px 20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #1F1F1F' }}>
          <svg width="32" height="32" viewBox="0 0 100 100" fill="#E5E5E5">
            <path d="M50 15 Q30 40 15 55 Q35 65 50 85 Q65 65 85 55 Q70 40 50 15Z" />
          </svg>
          <span style={{ fontSize: '22px', fontWeight: '600', letterSpacing: '-0.5px' }}>STOIC</span>
        </div>

        {/* Navigation - Text Only */}
        <div style={{ padding: '30px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ padding: '10px 20px', background: '#1F1F1F', borderRadius: '12px', fontWeight: '500' }}>Home</div>
          <div style={{ padding: '10px 20px', color: '#A1A1AA', borderRadius: '12px', cursor: 'pointer' }}>Discover</div>
          <div style={{ padding: '10px 20px', color: '#A1A1AA', borderRadius: '12px', cursor: 'pointer' }}>Library</div>
          <div style={{ padding: '10px 20px', color: '#A1A1AA', borderRadius: '12px', cursor: 'pointer' }}>Imagine</div>
        </div>

        {/* Recent */}
        <div style={{ padding: '0 16px' }}>
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
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>Upgrade to Stoic Pro</div>
            <div style={{ fontSize: '12px', color: '#888' }}>Unlock more power and higher limits.</div>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>

        {/* Top Bar */}
        <div style={{ position: 'absolute', top: '20px', right: '30px', zIndex: 10 }}>
          <button style={{ background: '#fff', color: '#000', padding: '8px 20px', borderRadius: '9999px', fontSize: '14px' }}>Sign In</button>
        </div>

        {/* Hero / Search */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          {!answer && !loading && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '30px' }}>
                <svg width="130" height="130" viewBox="0 0 100 100" fill="#E5E5E5">
                  <path d="M50 15 Q30 40 15 55 Q35 65 50 85 Q65 65 85 55 Q70 40 50 15Z" />
                </svg>
              </div>
              <h1 style={{ fontSize: '52px', fontWeight: '400', letterSpacing: '-1px' }}>Stoic</h1>
              <p style={{ color: '#888', fontSize: '19px' }}>Think clearly. Move forward.</p>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'absolute', bottom: '80px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '680px', padding: '0 20px' }}>
          <div style={{ background: '#18181B', border: '1px solid #3F3F46', borderRadius: '20px', padding: '8px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Ask anything..."
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', padding: '16px 24px', fontSize: '17px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 12px 12px' }}>
              <button onClick={handleSearch} style={{ background: '#E5E5E5', color: '#0A0A0A', width: '44px', height: '44px', borderRadius: '12px', fontSize: '20px' }}>→</button>
            </div>
          </div>
        </div>

        {/* Answer Area */}
        {(answer || loading) && (
          <div style={{ position: 'absolute', inset: 0, background: '#0A0A0A', padding: '100px 40px', overflow: 'auto' }}>
            {loading && <div style={{ textAlign: 'center', fontSize: '18px' }}>Searching...</div>}
            {answer && (
              <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>{query}</h2>
                <div style={{ lineHeight: '1.8', fontSize: '17px' }}>{answer}</div>

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
        )}
      </div>
    </div>
  );
}