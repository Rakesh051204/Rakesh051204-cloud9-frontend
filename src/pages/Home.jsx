import { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import MessageBubble from '../components/MessageBubble';
import SearchBox from '../components/SearchBox';
import ThinkingPanel from '../components/ThinkingPanel';
import ChatTopBar from '../components/ChatTopBar';
import Disclaimer from '../components/Disclaimer';
import VoiceOverlay from '../components/VoiceOverlay';
import SourcesPanel from '../components/SourcesPanel';
import { ConversationNavigator, useActiveMessageTracking } from '../components/ConversationNavigator';
import { ChevronDown, Image, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import getDailyQuote from '../utils/getDailyQuote';

const API_BASE = 'http://localhost:3001';

function makeSessionId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const QUICK_ACTIONS = [
  { icon: Image, label: 'Create an image', prompt: 'Generate an image based on this description: ' },
  { icon: Pencil, label: 'Write or edit', prompt: 'Help me write or edit: ' },
];

function QuickActionPills({ onSelect }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 w-full">
      {QUICK_ACTIONS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            onClick={() => onSelect(item.prompt)}
            className="flex items-center gap-2 rounded-full px-4 py-2 border transition-colors"
            style={{ borderColor: '#2a2a2a', backgroundColor: 'transparent', color: '#c9c9c6' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a1a1a'; e.currentTarget.style.color = '#F2F2F0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#c9c9c6'; }}
          >
            <Icon size={15} />
            <span className="text-[14px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('agent');
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedModel, setSelectedModel] = useState('openai/gpt-oss-120b');
  const [incognito, setIncognito] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userName, setUserName] = useState('there');
  const abortControllerRef = useRef(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(() => makeSessionId());

  const [deepResearchEnabled, setDeepResearchEnabled] = useState(false);
  const [codeAnalysisEnabled, setCodeAnalysisEnabled] = useState(false);

  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState('sources');
  const [panelSources, setPanelSources] = useState([]);
  const [panelImages, setPanelImages] = useState([]);
  const [focusedItem, setFocusedItem] = useState(null);

  // ─── Conversation navigator: right-rail tick minimap + jump-to-message ──
  const messageRefs = useRef({});
  const [activeMsgId, setActiveMsgId] = useState(null);
  useActiveMessageTracking(scrollContainerRef, messageRefs, setActiveMsgId);
  const handleJumpToMessage = (id) => {
    setActiveMsgId(id);
    messageRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openSourcesPanel = (sources, images) => {
    setPanelSources(sources || []); setPanelImages(images || []); setPanelTab('sources'); setFocusedItem(null); setPanelOpen(true);
  };
  const openImagesPanel = (sources, images) => {
    setPanelSources(sources || []); setPanelImages(images || []); setPanelTab('images'); setFocusedItem(null); setPanelOpen(true);
  };
  const openSourceDetail = (source, sources, images) => {
    setPanelSources(sources || []); setPanelImages(images || []); setFocusedItem({ type: 'source', data: source }); setPanelOpen(true);
  };
  const openEntityDetail = (name, sources, images) => {
    setPanelSources(sources || []); setPanelImages(images || []); setFocusedItem({ type: 'entity', data: { name } }); setPanelOpen(true);
  };
  const closePanel = () => setPanelOpen(false);
  const handlePanelBack = () => setFocusedItem(null);
  const handlePanelTabChange = (t) => { setPanelTab(t); setFocusedItem(null); };
  const handleAskMore = (name) => { setPanelOpen(false); sendMessage(`Tell me more about ${name}`); };

  const autoStickRef = useRef(true);
  const lastMessageAddedAtRef = useRef(0);

  useEffect(() => {
    const storedSessions = localStorage.getItem('stoic_sessions');
    if (storedSessions) try { setSessions(JSON.parse(storedSessions)); } catch(e) {}
  }, []);

  useEffect(() => {
    const name = localStorage.getItem('stoic_user_name') || 'Rakesh';
    setUserName(name);
    const stored = localStorage.getItem('stoic_recent_searches');
    if (stored) try { setRecentSearches(JSON.parse(stored)); } catch(e) {}
  }, []);

  useEffect(() => {
    if (recentSearches.length > 0 && !incognito) {
      localStorage.setItem('stoic_recent_searches', JSON.stringify(recentSearches));
    }
  }, [recentSearches, incognito]);

  useEffect(() => {
    if (messages.length === 0 || incognito || !currentSessionId) return;
    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = firstUserMsg?.content?.slice(0,60) || 'Untitled';
    setSessions(prev => {
      const idx = prev.findIndex(s => s.id === currentSessionId);
      const updated = { id: currentSessionId, title, updatedAt: Date.now(), messages };
      let next = idx >= 0 ? [...prev] : [updated, ...prev];
      if (idx >= 0) next[idx] = updated;
      localStorage.setItem('stoic_sessions', JSON.stringify(next));
      return next;
    });
  }, [messages, incognito, currentSessionId]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const userMsgEls = container.querySelectorAll('[data-role="user"]');
    const lastUserMsgEl = userMsgEls[userMsgEls.length - 1];
    if (lastUserMsgEl) lastUserMsgEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    lastMessageAddedAtRef.current = Date.now();
    autoStickRef.current = true;
  }, [messages.length]);

  useEffect(() => {
    if (!autoStickRef.current) return;
    if (Date.now() - lastMessageAddedAtRef.current < 400) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      const nearBottom = distanceFromBottom < 80;
      autoStickRef.current = nearBottom;
      setShowScrollButton(distanceFromBottom > 150);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages]);

  const scrollToBottom = () => { autoStickRef.current = true; messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const time = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    return `${time}, ${userName}. What can I help you with?`;
  };

  // ─── Shared streaming logic (used by sendMessage + regenerateMessage) ──
  const runStream = async (text, sessionIdToUse, assistantId, options = {}) => {
    const { model, webSearchOn, mode, attachments } = options;
    const effectiveModel = model || selectedModel;
    const effectiveSearch = webSearchOn !== undefined ? webSearchOn : true;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const patchAssistant = (patchFn) => {
      setMessages(prev => prev.map(msg => msg.id === assistantId ? patchFn(msg) : msg));
    };

    try {
      const response = await fetch(`${API_BASE}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text || '',
          sessionId: sessionIdToUse,
          model: effectiveModel,
          webSearchOn: effectiveSearch,
          mode: mode || 'balanced',
          incognito,
          attachments: attachments || [],
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        let boundary;
        while ((boundary = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          const line = rawEvent.split('\n').find(l => l.startsWith('data: '));
          if (!line) continue;
          let payload;
          try { payload = JSON.parse(line.slice(6)); } catch (e) { continue; }

          switch (payload.event) {
            case 'thinking':
              patchAssistant(msg => ({ ...msg, steps: [...(msg.steps || []), { text: payload.text }] }));
              break;
            case 'sources':
              patchAssistant(msg => ({ ...msg, sources: payload.sources || [] }));
              break;
            case 'images':
              patchAssistant(msg => ({ ...msg, images: payload.images || [] }));
              break;
            case 'jobs':
              patchAssistant(msg => ({ ...msg, jobs: payload.jobs || [] }));
              break;
            case 'token':
              patchAssistant(msg => ({ ...msg, content: (msg.content || '') + (payload.text || '') }));
              break;
            case 'followups':
              patchAssistant(msg => ({ ...msg, followUps: payload.followUps || [] }));
              break;
            case 'error':
              patchAssistant(msg => ({ ...msg, content: payload.message || 'Error occurred', streaming: false }));
              break;
            case 'done':
              patchAssistant(msg => ({ ...msg, streaming: false }));
              break;
            default:
              break;
          }
        }
      }
      patchAssistant(msg => ({ ...msg, streaming: false }));
    } catch (error) {
      if (error.name === 'AbortError') {
        patchAssistant(msg => ({ ...msg, streaming: false }));
      } else {
        patchAssistant(msg => ({ ...msg, content: `⚠️ Error: ${error.message}`, streaming: false }));
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  // ─── sendMessage: adds a NEW user turn + assistant response ────────────
  const sendMessage = async (text, options = {}) => {
    const { webSearchOn, model, mode, attachments, attachmentsMeta = [] } = options;

    if ((!text || !text.trim()) && attachmentsMeta.length === 0) return;
    if (loading) return;

    const sessionIdToUse = currentSessionId || makeSessionId();
    if (!currentSessionId) setCurrentSessionId(sessionIdToUse);

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text || '',
      attachments: attachmentsMeta,
    };
    const assistantId = Date.now() + 1;
    const assistantMsg = {
      id: assistantId,
      role: 'assistant',
      content: '',
      steps: [],
      sources: [],
      images: [],
      jobs: [],
      followUps: [],
      file: null,
      streaming: true,
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setLoading(true);

    await runStream(text, sessionIdToUse, assistantId, { webSearchOn, model, mode, attachments });
    setLoading(false);
  };

  // ─── regenerateMessage: re-runs the assistant response for a turn ──────
  // Accepts either a user message id (Retry on a user bubble) or an
  // assistant message id (Regenerate on an answer card) and resolves to
  // the correct preceding user turn.
  const regenerateMessage = async (messageId) => {
    const idx = messages.findIndex(m => m.id === messageId);
    if (idx === -1) return;

    let userIdx = idx;
    if (messages[idx].role === 'assistant') userIdx = idx - 1;
    if (userIdx < 0 || messages[userIdx].role !== 'user') return;

    const text = messages[userIdx].content;
    if (!text || !text.trim()) return;
    if (loading) return;

    const sessionIdToUse = currentSessionId || makeSessionId();
    if (!currentSessionId) setCurrentSessionId(sessionIdToUse);

    // Keep everything up to and including the user message, drop the old answer
    setMessages(prev => prev.slice(0, userIdx + 1));

    const assistantId = Date.now() + 1;
    const assistantMsg = {
      id: assistantId,
      role: 'assistant',
      content: '',
      steps: [],
      sources: [],
      images: [],
      jobs: [],
      followUps: [],
      file: null,
      streaming: true,
    };
    setMessages(prev => [...prev, assistantMsg]);
    setLoading(true);

    await runStream(text, sessionIdToUse, assistantId, {});
    setLoading(false);
  };

  // ─── handleEditMessage: replaces a user turn and everything after it ───
  const handleEditMessage = (userMessageId, newText) => {
    const idx = messages.findIndex(m => m.id === userMessageId);
    if (idx === -1) return;
    setMessages(prev => prev.slice(0, idx));
    sendMessage(newText);
  };

  const handleMessageFeedback = (messageId, type) => {
    // type is 'up' | 'down' | null
    console.log('Feedback:', messageId, type);
    // Hook this up to POST /api/feedback if/when you want to persist it
  };

  // Routes MessageBubble's onSendQuery: normal sends go to sendMessage,
  // edits go to handleEditMessage instead.
  const handleSendQuery = (text, options = {}) => {
    if (options.edit && options.messageId) {
      handleEditMessage(options.messageId, text);
      return;
    }
    sendMessage(text, options);
  };

  const handleStop = () => abortControllerRef.current?.abort();
  const handleToggleIncognito = () => setIncognito(v => !v);
  const handleOpenVoice = () => setVoiceOpen(true);
  const newChat = () => { setMessages([]); setCurrentSessionId(makeSessionId()); setPanelOpen(false); };
  const handleSessionClick = (id) => {
    const session = sessions.find(s => s.id === id);
    if (session) { setCurrentSessionId(id); setMessages(session.messages || []); }
  };
  const handleTaskClick = (taskText) => sendMessage(taskText);
  const handleOpenDiscover = (tabId) => navigate(`/discover?tab=${tabId || 'top'}`);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Stoic Chat', text: 'Check out this conversation on Stoic', url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied!');
      }
    } catch(e) { console.error(e); }
  };
  const handleUpgrade = () => alert('Upgrade coming soon!');
  const handlePin = () => alert('Pin chat — coming soon!');
  const handleMoveToProject = () => alert('Move to project — coming soon!');
  const handleDeleteChat = () => alert('Delete chat — coming soon!');

  const handleFileUploaded = (data) => {
    console.log('File uploaded:', data);
  };
  const handleAddLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation is not supported in this browser.'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { console.log('Location:', pos.coords.latitude, pos.coords.longitude); },
      (err) => alert('Could not get location: ' + err.message)
    );
  };
  const handleConnectApps = () => navigate('/plugins');

  if (messages.length === 0) {
    return (
      <>
        <Layout activeTab={activeTab} setActiveTab={setActiveTab} recentSearches={recentSearches} onNewChat={newChat} onTaskClick={handleTaskClick} incognito={incognito} sessions={sessions} currentSessionId={currentSessionId} onSessionClick={handleSessionClick}>
          <div className="h-full flex flex-col bg-black overflow-hidden relative">
            <ChatTopBar incognito={incognito} onToggleIncognito={handleToggleIncognito} onOpenDiscover={handleOpenDiscover} onShare={handleShare} onUpgrade={handleUpgrade} onPin={handlePin} onMoveToProject={handleMoveToProject} onDelete={handleDeleteChat} />
            <div className="flex-1 overflow-y-auto px-4">
              <div className="min-h-full flex flex-col items-center justify-center py-8">
                <div className="max-w-3xl w-full text-center">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {getDailyQuote()}
                  </h1>
                  <p className="text-sm mb-6" style={{ color: 'rgba(242,242,240,0.5)' }}>
                    {getGreeting()}
                  </p>
                  <SearchBox
                    onSend={sendMessage} loading={loading} onStop={handleStop} onOpenVoice={handleOpenVoice}
                    model={selectedModel} onModelChange={setSelectedModel} incognito={incognito} sessionId={currentSessionId}
                    onFileUploaded={handleFileUploaded} deepResearchEnabled={deepResearchEnabled}
                    onToggleDeepResearch={() => setDeepResearchEnabled(v => !v)} codeAnalysisEnabled={codeAnalysisEnabled}
                    onToggleCodeAnalysis={() => setCodeAnalysisEnabled(v => !v)} onAddLocation={handleAddLocation}
                    onConnectApps={handleConnectApps}
                  />
                  <div className="mt-4"><QuickActionPills onSelect={sendMessage} /></div>
                  <Disclaimer />
                </div>
              </div>
            </div>
          </div>
        </Layout>
        {voiceOpen && <VoiceOverlay onClose={() => setVoiceOpen(false)} onSend={sendMessage} />}
      </>
    );
  }

  return (
    <>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} recentSearches={recentSearches} onNewChat={newChat} onTaskClick={handleTaskClick} incognito={incognito} sessions={sessions} currentSessionId={currentSessionId} onSessionClick={handleSessionClick}>
        <div className="h-full w-full flex overflow-hidden relative">
          <div className="flex-1 min-w-0 h-full flex flex-col bg-black overflow-hidden relative">
            <ChatTopBar incognito={incognito} onToggleIncognito={handleToggleIncognito} onOpenDiscover={handleOpenDiscover} onShare={handleShare} onUpgrade={handleUpgrade} onPin={handlePin} onMoveToProject={handleMoveToProject} onDelete={handleDeleteChat} />
            <div className="flex-1 relative overflow-hidden">
              <div ref={scrollContainerRef} className="h-full overflow-y-auto px-4 py-6 scroll-smooth">
                <div className="max-w-3xl mx-auto w-full space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={msg.id || idx}
                      data-role={msg.role}
                      ref={(el) => { messageRefs.current[msg.id || idx] = el; }}
                    >
                      {msg.role === 'assistant' && (msg.streaming || (msg.steps && msg.steps.length > 0)) && (
                        <ThinkingPanel steps={msg.steps} streaming={msg.streaming} />
                      )}
                      <MessageBubble
                        message={msg} isUser={msg.role === 'user'} isStreaming={msg.streaming}
                        onSendQuery={handleSendQuery}
                        onRegenerate={regenerateMessage}
                        onFeedback={(type) => handleMessageFeedback(msg.id, type)}
                        onOpenSources={openSourcesPanel} onOpenImages={openImagesPanel}
                        onOpenSourceDetail={openSourceDetail} onOpenEntity={openEntityDetail}
                      />
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {showScrollButton && (
                <button onClick={scrollToBottom} className="absolute bottom-4 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#242424] transition-colors shadow-lg" aria-label="Scroll to bottom">
                  <ChevronDown size={18} />
                </button>
              )}

              <ConversationNavigator
                messages={messages}
                activeId={activeMsgId}
                onJump={handleJumpToMessage}
                hidden={panelOpen}
              />
            </div>
            <div className="flex-shrink-0 bg-black p-4">
              <div className="max-w-3xl mx-auto">
                <SearchBox
                  onSend={sendMessage} loading={loading} onStop={handleStop} onOpenVoice={handleOpenVoice}
                  model={selectedModel} onModelChange={setSelectedModel} incognito={incognito} sessionId={currentSessionId}
                  onFileUploaded={handleFileUploaded} deepResearchEnabled={deepResearchEnabled}
                  onToggleDeepResearch={() => setDeepResearchEnabled(v => !v)} codeAnalysisEnabled={codeAnalysisEnabled}
                  onToggleCodeAnalysis={() => setCodeAnalysisEnabled(v => !v)} onAddLocation={handleAddLocation}
                  onConnectApps={handleConnectApps}
                />
              </div>
            </div>
          </div>

          <SourcesPanel
            open={panelOpen} onClose={closePanel} sources={panelSources} images={panelImages} focusedItem={focusedItem}
            onBack={handlePanelBack} onSelectSource={(s) => setFocusedItem({ type: 'source', data: s })}
            tab={panelTab} onTabChange={handlePanelTabChange} onImageClick={() => {}} onAskMore={handleAskMore}
          />
        </div>
      </Layout>
      {voiceOpen && <VoiceOverlay onClose={() => setVoiceOpen(false)} onSend={sendMessage} />}
    </>
  );
}