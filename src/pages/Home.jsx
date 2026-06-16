import { useState, useRef } from "react";

const API_BASE = 'https://cloud9-api-2.onrender.com';

export default function Home() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const answerRef = useRef(null);

  const handleSearch = async () => {
    const q = input.trim();
    if (!q) return;
    setQuery(q);
    setLoading(true);
    setAnswer("");
    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setAnswer(data.answer || "No answer generated.");
      setSources(data.sources || []);
    } catch (e) {
      setAnswer("Sorry, something went wrong.");
    }
    setLoading(false);
    setTimeout(() => answerRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input not supported.");
      return;
    }
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      handleSearch(transcript);
    };
    recognition.start();
  };

  return (
    <>
      <style>
        {`
          .search-input::placeholder {
            color: #666 !important;
          }
          .search-input {
            color: #E5E5E5 !important;
            caret-color: #E5E5E5;
          }
        `}
      </style>
      <div style={styles.app}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.logoRow}>
            <StingrayLogo size={32} />
            <span style={styles.logoText}>STOIC</span>
          </div>

          <nav style={styles.nav}>
            <NavItem label="Home" icon={<HomeIcon />} active />
            <NavItem label="Discover" icon={<DiscoverIcon />} />
            <NavItem label="Library" icon={<LibraryIcon />} />
            <NavItem label="Imagine" icon={<ImagineIcon />} />
          </nav>

          <div style={styles.recent}>
            <div style={styles.recentLabel}>RECENT</div>
            {["What is quantum computing?", "Best habits for productivity", "Explain photosynthesis"].map((item, i) => (
              <div key={i} style={styles.recentItem} onClick={() => { setInput(item); handleSearch(); }}>
                {item}
              </div>
            ))}
          </div>

          <div style={styles.upgradeBox}>
            <div style={styles.upgradeTitle}>Upgrade to Stoic Pro</div>
            <div style={styles.upgradeDesc}>Unlock more power and higher limits.</div>
          </div>
        </aside>

        {/* Main Area */}
        <main style={styles.main}>
          <div style={styles.topBar}>
            <button style={styles.signInBtn}>Sign In</button>
          </div>

          <div style={styles.content} ref={answerRef}>
            {!answer && !loading && (
              <div style={styles.hero}>
                <StingrayLogo size={130} />
                <h1 style={styles.heroTitle}>Stoic</h1>
                <p style={styles.heroSub}>Think clearly. Move forward.</p>
              </div>
            )}

            {loading && <div style={styles.loading}>Searching...</div>}

            {answer && (
              <div style={styles.answerWrapper}>
                <h2 style={styles.answerQuery}>{query}</h2>
                <div style={styles.answerText}>{answer}</div>

                {sources.length > 0 && (
                  <div style={styles.sources}>
                    <div style={styles.sourcesLabel}>SOURCES</div>
                    <div style={styles.sourcesList}>
                      {sources.map((s, i) => (
                        <a key={i} href={s.url} target="_blank" style={styles.sourceChip}>
                          [{i+1}] {s.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Persistent Bottom Search Bar */}
          <div style={styles.searchBar}>
            <div style={styles.searchContainer}>
              <input
                className="search-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Ask anything..."
                style={styles.searchInput}
              />
              <div style={styles.searchActions}>
                {/* Plus Icon - file upload */}
                <button
                  onClick={() => document.getElementById('fileInput')?.click()}
                  style={styles.iconButton}
                  title="Upload files"
                >
                  <PlusIcon />
                </button>
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => console.log(e.target.files)}
                />
                {/* Mic Icon */}
                <button
                  onClick={handleMic}
                  style={{
                    ...styles.iconButton,
                    color: listening ? '#14B8A6' : '#A1A1AA',
                  }}
                  title="Voice input"
                >
                  <MicIcon />
                </button>
                {/* Up Arrow / Stop button */}
                <button
                  onClick={handleSearch}
                  style={styles.searchButton}
                  disabled={loading}
                >
                  {loading ? <StopIcon /> : <UpArrowIcon />}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

// ----- Stingray Logo -----
const StingrayLogo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="#E5E5E5">
    <path d="M50 15 Q30 40 15 55 Q35 65 50 85 Q65 65 85 55 Q70 40 50 15Z" />
  </svg>
);

// ----- Navigation Item -----
const NavItem = ({ label, icon, active = false }) => (
  <div style={{
    ...styles.navItem,
    background: active ? '#1F1F1F' : 'transparent',
    color: active ? '#E5E5E5' : '#A1A1AA',
  }}>
    <span style={styles.navIcon}>{icon}</span>
    <span>{label}</span>
  </div>
);

// ----- SVG Icons (Dark, Professional) -----
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12l9-9 9 9" />
    <path d="M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" />
  </svg>
);

const DiscoverIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const LibraryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h16M4 12h16M4 18h16" />
    <path d="M12 6v12" />
  </svg>
);

const ImagineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Up Arrow Icon (pointing up)
const UpArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

// Stop Icon (square)
const StopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" />
  </svg>
);

// Plus Icon
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Mic Icon
const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

// ----- Inline Styles -----
const styles = {
  app: {
    display: 'flex',
    height: '100vh',
    background: '#0A0A0A',
    color: '#E5E5E5',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    overflow: 'hidden',
  },
  sidebar: {
    width: '260px',
    background: '#0A0A0A',
    borderRight: '1px solid #1F1F1F',
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    height: '100%',
    overflowY: 'auto',
  },
  logoRow: {
    padding: '0 24px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid #1F1F1F',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '600',
    letterSpacing: '-0.5px',
  },
  nav: {
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    padding: '10px 20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'background 0.2s',
  },
  navIcon: {
    display: 'flex',
    alignItems: 'center',
    opacity: 0.7,
    color: '#A1A1AA',
  },
  recent: {
    padding: '0 16px',
    marginTop: '20px',
    flex: 1,
  },
  recentLabel: {
    padding: '0 20px',
    color: '#666',
    fontSize: '12px',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  recentItem: {
    padding: '8px 20px',
    color: '#A1A1AA',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background 0.2s',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  upgradeBox: {
    margin: 'auto 16px 20px',
    background: '#1F1F1F',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #333',
  },
  upgradeTitle: {
    fontWeight: '500',
    marginBottom: '4px',
  },
  upgradeDesc: {
    fontSize: '12px',
    color: '#888',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    top: '20px',
    right: '30px',
    zIndex: 10,
  },
  signInBtn: {
    background: '#fff',
    color: '#000',
    padding: '8px 20px',
    borderRadius: '9999px',
    border: 'none',
    fontWeight: '500',
    cursor: 'pointer',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '40px 40px 180px',
  },
  hero: {
    textAlign: 'center',
    marginTop: '100px',
  },
  heroTitle: {
    fontSize: '52px',
    fontWeight: '400',
    letterSpacing: '-1px',
    margin: '20px 0 10px',
  },
  heroSub: {
    color: '#888',
    fontSize: '19px',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '18px',
    color: '#A1A1AA',
  },
  answerWrapper: {
    maxWidth: '720px',
    margin: '0 auto',
  },
  answerQuery: {
    fontSize: '28px',
    marginBottom: '20px',
    fontWeight: '400',
  },
  answerText: {
    lineHeight: '1.75',
    fontSize: '17px',
    color: '#D4D4D8',
  },
  sources: {
    marginTop: '40px',
  },
  sourcesLabel: {
    color: '#666',
    fontSize: '13px',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  sourcesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  sourceChip: {
    background: '#1F1F1F',
    padding: '10px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#60A5FA',
    textDecoration: 'none',
    border: '1px solid #2A2A2A',
    transition: 'border 0.2s',
  },
  searchBar: {
    position: 'fixed',
    bottom: 0,
    left: '260px',
    right: 0,
    background: '#0A0A0A',
    borderTop: '1px solid #1F1F1F',
    padding: '16px 24px',
    zIndex: 100,
  },
  searchContainer: {
    maxWidth: '680px',
    margin: '0 auto',
    background: '#18181B',
    border: '1px solid #3F3F46',
    borderRadius: '20px',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    padding: '16px 0',
    fontSize: '17px',
    fontFamily: 'inherit',
  },
  searchActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  iconButton: {
    background: 'transparent',
    border: 'none',
    color: '#A1A1AA',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s, background 0.2s',
  },
  searchButton: {
    background: '#E5E5E5',
    color: '#0A0A0A',
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '20px',
  },
};