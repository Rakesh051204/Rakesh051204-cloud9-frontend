import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const API_BASE = 'http://localhost:3001';
const STORAGE_KEY = 'stoic_recent_searches';
const MAX_RECENT = 10;

export default function Home() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customConnectors, setCustomConnectors] = useState([]);
  const [newConnectorName, setNewConnectorName] = useState("");
  const [newConnectorUrl, setNewConnectorUrl] = useState("");
  const [connectedConnectors, setConnectedConnectors] = useState([]);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [searchEnabled, setSearchEnabled] = useState(true);
  const [recentSearches, setRecentSearches] = useState([]);
  
  const abortControllerRef = useRef(null);
  const answerRef = useRef(null);
  const menuRef = useRef(null);
  const isPro = false;

  // ---------- Load recent searches ----------
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setRecentSearches(parsed);
      } catch (_) {}
    }
  }, []);

  const addRecentSearch = (q) => {
    if (!q) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== q);
      const updated = [q, ...filtered].slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // ---------- AUTH ----------
  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setShowLogin(false);
      fetchConnectorStatus();
    } else {
      alert('Login failed: ' + (data.error || 'Unknown error'));
    }
  };

  const register = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setShowLogin(false);
      fetchConnectorStatus();
    } else {
      alert('Registration failed: ' + (data.error || 'Unknown error'));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setConnectedConnectors([]);
  };

  const fetchConnectorStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/connectors/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const connected = data.filter(c => c.connected).map(c => c.service);
        setConnectedConnectors(connected);
      }
    } catch (e) {
      console.error('Failed to fetch connector status', e);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
            fetchConnectorStatus();
          } else {
            localStorage.removeItem('token');
          }
        })
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  // ---------- SEARCH ----------
  const handleSearch = async (q) => {
    const queryText = q || input;
    if (!queryText.trim()) return;

    addRecentSearch(queryText.trim());
    setInput('');

    if (abortControllerRef.current) abortControllerRef.current.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setQuery(queryText);
    setLoading(true);
    setAnswer("");
    setSources([]);
    setRelatedQuestions([]);

    try {
      const body = {
        query: queryText.trim(),
        model: 'groq',
        searchEnabled: searchEnabled,
      };
      if (user) body.userId = user.id;

      const res = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const data = await res.json();
      setAnswer(data.answer || "No answer generated.");
      setSources(data.sources || []);
      setRelatedQuestions(data.relatedQuestions || []);
    } catch (error) {
      if (error.name === "AbortError") {
        setLoading(false);
        return;
      }
      setAnswer("Sorry, something went wrong.");
    }
    setLoading(false);
    abortControllerRef.current = null;
    setTimeout(() => answerRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
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

  const togglePlusMenu = () => setShowPlusMenu(!showPlusMenu);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------- PLUS MENU ----------
  const plusOptions = [
    { label: "Upload photos & files", icon: <UploadIcon />, action: () => document.getElementById('fileInput')?.click() },
    { label: "Recent files", icon: <RecentIcon />, action: () => console.log("Recent files") },
    { label: "Create Image", icon: <ImageIcon />, action: () => console.log("Create Image") },
    { label: "Thinking", icon: <ThinkingIcon />, action: () => console.log("Thinking") },
    { label: "Deep Search", icon: <DeepSearchIcon />, action: () => { setSearchEnabled(true); handleSearch(); } },
    { label: "Web Search", icon: <WebSearchIcon />, action: () => { setSearchEnabled(!searchEnabled); alert(searchEnabled ? "Web search disabled" : "Web search enabled"); } },
    { label: "Project", icon: <ProjectIcon />, action: () => console.log("Project") },
  ];

  // ---------- CONNECTORS ----------
  const connectorDetails = {
    'Gmail': {
      title: 'Gmail',
      subtitle: 'Productivity',
      description: 'Connect',
      about: 'Give Stoic access to search your emails.',
      features: [
        'Search your emails – Search your inbox, summarize unread emails, and find messages from specific people.',
        'We never train on your data – xAI does not train on your Gmail data.',
        'Your emails stay in Gmail – We don\'t store your emails. Stoic searches Gmail in real-time when you ask questions.',
      ],
      icon: <GmailIconLarge />,
      connectAction: async () => {
        if (!user) { alert('Please login first'); return; }
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/auth/google?userId=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { url } = await res.json();
        window.open(url, '_blank', 'width=500,height=600');
        setTimeout(fetchConnectorStatus, 3000);
      },
    },
    'Google Calendar': {
      title: 'Google Calendar',
      subtitle: 'Scheduling',
      description: 'Connect',
      about: 'Give Stoic access to your calendar.',
      features: [
        'View and manage events – Check your schedule, add events, and get reminders.',
        'We never train on your data – Your calendar data stays private.',
        'Real-time access – Stoic fetches your calendar when you ask.',
      ],
      icon: <CalendarIconLarge />,
      connectAction: async () => {
        if (!user) { alert('Please login first'); return; }
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/auth/google?userId=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { url } = await res.json();
        window.open(url, '_blank', 'width=500,height=600');
        setTimeout(fetchConnectorStatus, 3000);
      },
    },
    'Google Drive': {
      title: 'Google Drive',
      subtitle: 'Storage',
      description: 'Connect',
      about: 'Give Stoic access to your Drive files.',
      features: [
        'Search and summarize files – Find documents, spreadsheets, and presentations.',
        'We never train on your data – Your files remain yours.',
        'On-demand access – We fetch your Drive content only when you ask.',
      ],
      icon: <DriveIconLarge />,
      connectAction: async () => {
        if (!user) { alert('Please login first'); return; }
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/auth/google?userId=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { url } = await res.json();
        window.open(url, '_blank', 'width=500,height=600');
        setTimeout(fetchConnectorStatus, 3000);
      },
    },
  };

  const prebuiltConnectors = [
    { name: 'Gmail', icon: <GmailIcon />, detail: connectorDetails['Gmail'] },
    { name: 'Google Calendar', icon: <CalendarIcon />, detail: connectorDetails['Google Calendar'] },
    { name: 'Google Drive', icon: <DriveIcon />, detail: connectorDetails['Google Drive'] },
  ];

  const allConnectors = [
    ...prebuiltConnectors.map(c => ({
      ...c,
      action: () => setSelectedConnector(c.detail),
    })),
    ...customConnectors.map(c => ({
      name: c.name,
      icon: <CustomConnectorIcon />,
      action: () => window.open(c.url, '_blank'),
    })),
    {
      name: 'Custom',
      icon: <PlusIconSmall />,
      action: () => {
        if (!isPro) {
          alert('Upgrade to Stoic Pro to add custom connectors.');
        } else {
          setShowCustomModal(true);
        }
      },
    },
  ];

  const closeDetailModal = () => setSelectedConnector(null);

  // -------- RENDER ----------
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
          .markdown-body {
            color: #D4D4D8;
            line-height: 1.75;
          }
          .markdown-body a {
            color: #60A5FA;
          }
          .markdown-body code {
            background: #1F1F1F;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
          }
          .markdown-body pre {
            background: #1F1F1F;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
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
            <div style={styles.sectionLabel}>RECENT</div>
            {recentSearches.length > 0 ? (
              recentSearches.map((item, i) => (
                <div key={i} style={styles.recentItem} onClick={() => { setInput(item); handleSearch(item); }}>
                  {item}
                </div>
              ))
            ) : (
              <div style={{ padding: '8px 20px', color: '#444', fontSize: '13px' }}>No recent searches</div>
            )}
          </div>

          <div style={styles.connectorsSection}>
            <div style={styles.sectionLabel}>CONNECTORS</div>
            {allConnectors.map((conn, idx) => (
              <div key={idx} style={styles.connectorItem} onClick={conn.action}>
                <span style={styles.connectorIcon}>{conn.icon}</span>
                <span>{conn.name}</span>
                {conn.name !== 'Custom' && connectedConnectors.includes(conn.name.toLowerCase()) && (
                  <span style={{ marginLeft: 'auto', color: '#10B981', fontSize: '12px' }}>✓</span>
                )}
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
            {user ? (
              <>
                <span style={{ color: '#888', fontSize: '13px' }}>{user.email}</span>
                <button style={styles.signInBtn} onClick={logout}>Sign Out</button>
              </>
            ) : (
              <button style={styles.signInBtn} onClick={() => setShowLogin(true)}>Sign In</button>
            )}
            <button
              onClick={() => setSearchEnabled(!searchEnabled)}
              style={{ background: searchEnabled ? '#14B8A6' : '#444', color: '#fff', border: 'none', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}
            >
              {searchEnabled ? 'Web Search ON' : 'Web Search OFF'}
            </button>
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
                <div className="markdown-body" style={styles.answerText}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {answer}
                  </ReactMarkdown>
                </div>

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

                {relatedQuestions.length > 0 && (
                  <div style={styles.related}>
                    <div style={styles.relatedLabel}>RELATED QUESTIONS</div>
                    {relatedQuestions.map((q, i) => (
                      <div
                        key={i}
                        style={styles.relatedItem}
                        onClick={() => { setInput(q); handleSearch(q); }}
                      >
                        {q}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Persistent Search Bar */}
          <div style={styles.searchBar}>
            <div style={styles.searchContainer}>
              <div style={{ position: 'relative' }} ref={menuRef}>
                <button onClick={togglePlusMenu} style={styles.iconButtonLeft} title="More options">
                  <PlusIcon />
                </button>
                {showPlusMenu && (
                  <div style={styles.plusMenu}>
                    {plusOptions.map((opt, idx) => (
                      <div
                        key={idx}
                        style={styles.plusMenuItem}
                        onClick={() => {
                          opt.action();
                          setShowPlusMenu(false);
                        }}
                      >
                        <span style={styles.plusMenuIcon}>{opt.icon}</span>
                        <span>{opt.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input id="fileInput" type="file" multiple style={{ display: 'none' }} onChange={(e) => console.log(e.target.files)} />

              <input
                className="search-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Ask anything..."
                style={styles.searchInput}
              />

              <div style={styles.searchActions}>
                <button onClick={handleMic} style={{ ...styles.iconButton, color: listening ? '#14B8A6' : '#A1A1AA' }} title="Voice input">
                  <MicIcon />
                </button>
                <button onClick={loading ? handleStop : () => handleSearch()} style={styles.searchButton}>
                  {loading ? <StopIcon /> : <UpArrowIcon />}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div style={styles.modalOverlay} onClick={() => setShowLogin(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>{isLoginMode ? 'Sign In' : 'Create Account'}</h3>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              style={styles.modalInput}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              style={styles.modalInput}
              onKeyDown={(e) => e.key === "Enter" && (isLoginMode ? login(loginEmail, loginPassword) : register(loginEmail, loginPassword))}
            />
            <div style={styles.modalActions}>
              <button style={styles.modalCancel} onClick={() => setShowLogin(false)}>
                Cancel
              </button>
              <button
                style={styles.modalAdd}
                onClick={() => isLoginMode ? login(loginEmail, loginPassword) : register(loginEmail, loginPassword)}
              >
                {isLoginMode ? 'Sign In' : 'Register'}
              </button>
            </div>
            <div style={{ marginTop: '12px', fontSize: '13px', color: '#888', textAlign: 'center' }}>
              {isLoginMode ? (
                <>Don't have an account? <span style={{ color: '#14B8A6', cursor: 'pointer' }} onClick={() => setIsLoginMode(false)}>Register</span></>
              ) : (
                <>Already have an account? <span style={{ color: '#14B8A6', cursor: 'pointer' }} onClick={() => setIsLoginMode(true)}>Sign In</span></>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Connector Detail Modal */}
      {selectedConnector && (
        <div style={styles.modalOverlay} onClick={closeDetailModal}>
          <div style={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.detailHeader}>
              <span style={styles.detailIcon}>{selectedConnector.icon}</span>
              <div>
                <div style={styles.detailTitle}>{selectedConnector.title}</div>
                <div style={styles.detailSubtitle}>{selectedConnector.subtitle}</div>
              </div>
              <button style={styles.detailClose} onClick={closeDetailModal}>✕</button>
            </div>
            <div style={styles.detailDescription}>{selectedConnector.description}</div>
            <button
              style={{
                ...styles.detailConnect,
                background: connectedConnectors.includes(selectedConnector.title.toLowerCase())
                  ? '#10B981'
                  : '#E5E5E5',
                color: connectedConnectors.includes(selectedConnector.title.toLowerCase())
                  ? '#FFFFFF'
                  : '#0A0A0A',
              }}
              onClick={selectedConnector.connectAction}
            >
              {connectedConnectors.includes(selectedConnector.title.toLowerCase())
                ? '✓ Connected'
                : 'Connect'}
            </button>
            <div style={styles.detailAbout}>
              <div style={styles.detailAboutTitle}>About this Connector</div>
              {selectedConnector.features.map((feature, i) => (
                <div key={i} style={styles.detailFeature}>
                  <span style={styles.detailBullet}>•</span> {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Custom Connector Modal */}
      {showCustomModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCustomModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Add Custom Connector</h3>
            <input
              type="text"
              placeholder="Connector name (e.g., My Notes)"
              value={newConnectorName}
              onChange={(e) => setNewConnectorName(e.target.value)}
              style={styles.modalInput}
            />
            <input
              type="text"
              placeholder="URL (e.g., https://notes.example.com)"
              value={newConnectorUrl}
              onChange={(e) => setNewConnectorUrl(e.target.value)}
              style={styles.modalInput}
            />
            <div style={styles.modalActions}>
              <button style={styles.modalCancel} onClick={() => setShowCustomModal(false)}>
                Cancel
              </button>
              <button
                style={styles.modalAdd}
                onClick={() => {
                  if (newConnectorName.trim() && newConnectorUrl.trim()) {
                    setCustomConnectors([
                      ...customConnectors,
                      { name: newConnectorName.trim(), url: newConnectorUrl.trim() },
                    ]);
                    setNewConnectorName('');
                    setNewConnectorUrl('');
                    setShowCustomModal(false);
                  }
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ========== ICON COMPONENTS (must be defined) ==========

const StingrayLogo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="#E5E5E5">
    <path d="M50 15 Q30 40 15 55 Q35 65 50 85 Q65 65 85 55 Q70 40 50 15Z" />
  </svg>
);

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

// ---- Navigation Icons ----
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

// ---- Search Bar Icons ----
const UpArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const StopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" />
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PlusIconSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

// ---- Connector Icons (sidebar) ----
const GmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z" />
    <path d="M4 4l8 6 8-6" />
    <path d="M4 20l6-4.5" />
    <path d="M20 20l-6-4.5" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const DriveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 4h8v16H8z" />
    <path d="M4 8h4v8H4z" />
    <path d="M16 8h4v8h-4z" />
  </svg>
);

const CustomConnectorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H5.78a1.65 1.65 0 0 0-1.51 1 1.65 1.65 0 0 0 .33 1.82l.04.04A10 10 0 0 0 12 18a10 10 0 0 0 6.36-2.96l.04-.04z" />
  </svg>
);

// ---- Connector Icons (detail modal) ----
const GmailIconLarge = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E5E5E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z" />
    <path d="M4 4l8 6 8-6" />
    <path d="M4 20l6-4.5" />
    <path d="M20 20l-6-4.5" />
  </svg>
);

const CalendarIconLarge = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E5E5E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const DriveIconLarge = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E5E5E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 4h8v16H8z" />
    <path d="M4 8h4v8H4z" />
    <path d="M16 8h4v8h-4z" />
  </svg>
);

// ---- Plus Menu Icons (define these to fix the error) ----
const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const RecentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ImageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const ThinkingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="22" />
    <line x1="2" y1="12" x2="4" y2="12" />
    <line x1="20" y1="12" x2="22" y2="12" />
  </svg>
);

const DeepSearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="3" x2="11" y2="5" />
    <line x1="11" y1="17" x2="11" y2="19" />
    <line x1="3" y1="11" x2="5" y2="11" />
    <line x1="17" y1="11" x2="19" y2="11" />
  </svg>
);

const WebSearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const ProjectIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    <path d="M12 11v4" />
    <path d="M10 13h4" />
  </svg>
);

// ========== STYLES ==========
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
  },
  connectorsSection: {
    padding: '0 16px',
    marginTop: '20px',
  },
  sectionLabel: {
    padding: '0 20px',
    color: '#666',
    fontSize: '11px',
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
  connectorItem: {
    padding: '8px 20px',
    color: '#A1A1AA',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  connectorIcon: {
    display: 'flex',
    alignItems: 'center',
    opacity: 0.7,
    color: '#A1A1AA',
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
    top: '16px',
    right: '24px',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
  related: {
    marginTop: '32px',
  },
  relatedLabel: {
    color: '#666',
    fontSize: '13px',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  relatedItem: {
    padding: '12px 16px',
    color: '#A1A1AA',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background 0.2s',
    marginBottom: '4px',
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
    gap: '10px',
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
  iconButtonLeft: {
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
    marginRight: '4px',
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
  plusMenu: {
    position: 'absolute',
    bottom: 'calc(100% + 8px)',
    left: 0,
    background: '#1A1A1A',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '8px 0',
    minWidth: '220px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
    zIndex: 200,
  },
  plusMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    color: '#E5E5E5',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  plusMenuIcon: {
    display: 'flex',
    alignItems: 'center',
    opacity: 0.7,
    color: '#A1A1AA',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  detailModal: {
    background: '#1A1A1A',
    borderRadius: '24px',
    padding: '32px',
    maxWidth: '520px',
    width: '90%',
    border: '1px solid #333',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
    position: 'relative',
  },
  detailIcon: {
    flexShrink: 0,
  },
  detailTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#E5E5E5',
  },
  detailSubtitle: {
    fontSize: '14px',
    color: '#888',
    marginTop: '2px',
  },
  detailClose: {
    position: 'absolute',
    top: '0',
    right: '0',
    background: 'transparent',
    border: 'none',
    color: '#888',
    fontSize: '20px',
    cursor: 'pointer',
  },
  detailDescription: {
    fontSize: '15px',
    color: '#A1A1AA',
    marginBottom: '20px',
  },
  detailConnect: {
    border: 'none',
    padding: '12px 28px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    width: '100%',
    marginBottom: '24px',
  },
  detailAbout: {
    borderTop: '1px solid #333',
    paddingTop: '20px',
  },
  detailAboutTitle: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#E5E5E5',
    marginBottom: '12px',
  },
  detailFeature: {
    fontSize: '14px',
    color: '#A1A1AA',
    marginBottom: '10px',
    display: 'flex',
    gap: '8px',
  },
  detailBullet: {
    color: '#666',
    flexShrink: 0,
  },
  modal: {
    background: '#1A1A1A',
    borderRadius: '20px',
    padding: '32px',
    maxWidth: '440px',
    width: '90%',
    border: '1px solid #333',
  },
  modalTitle: {
    fontSize: '22px',
    fontWeight: '500',
    marginBottom: '20px',
    color: '#E5E5E5',
  },
  modalInput: {
    width: '100%',
    background: '#0A0A0A',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#E5E5E5',
    fontSize: '15px',
    marginBottom: '12px',
    outline: 'none',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '16px',
  },
  modalCancel: {
    background: 'transparent',
    border: '1px solid #444',
    color: '#A1A1AA',
    padding: '10px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  modalAdd: {
    background: '#E5E5E5',
    color: '#0A0A0A',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
  },
};