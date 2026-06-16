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

  // ---------- Load recent searches from localStorage ----------
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

    // Save to recent history
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
        model: 'groq', // fixed to groq – remove model selector
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

// ========== ICON COMPONENTS ==========
// (All icon components remain exactly the same as before – they are unchanged)
// To save space, I'll assume you already have them.
// If you need them again, just ask – but they're identical to your previous Home.jsx.