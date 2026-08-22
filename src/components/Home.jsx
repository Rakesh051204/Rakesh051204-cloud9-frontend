import { useState, useRef, useEffect } from 'react';
import getDailyQuote from '../utils/getDailyQuote';
import Layout from '../components/Layout';
import MessageBubble from '../components/MessageBubble';
import SearchBox from '../components/SearchBox';
import ThinkingPanel from '../components/ThinkingPanel';
import SourcesPanel from '../components/SourcesPanel';
import ChatTopBar from '../components/ChatTopBar';
import Disclaimer from '../components/Disclaimer';
import VoiceOverlay from '../components/VoiceOverlay';
import { ChevronDown, Image, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3001';

// ─── Manus-style quick action pills ────────────────────────────────
const QUICK_ACTIONS = [
  {
    icon: Image,
    label: 'Create an image',
    prompt: 'Generate an image based on this description: ',
  },
  {
    icon: Pencil,
    label: 'Write or edit',
    prompt: 'Help me write or edit: ',
  },
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
            style={{
              borderColor: '#2a2a2a',
              backgroundColor: 'transparent',
              color: '#c9c9c6',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1a1a1a';
              e.currentTarget.style.color = '#F2F2F0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#c9c9c6';
            }}
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
  const dailyQuote = getDailyQuote();
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
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // ─── SOURCES PANEL STATE ─────────────────────────────────────────
  // Which message the panel is currently showing, whether it's open,
  // which tab, and (if drilled into a single source/entity) which one.
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [panelTab, setPanelTab] = useState('steps');
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [focusedItem, setFocusedItem] = useState(null);

  const activeMessage = messages.find((m) => m.id === activeMessageId) || null;

  const openSourcesPanel = (msgId, tab = 'steps') => {
    setActiveMessageId(msgId);
    setPanelTab(tab);
    setFocusedItem(null);
    setSourcesOpen(true);
  };
  const closeSourcesPanel = () => {
    setSourcesOpen(false);
    setFocusedItem(null);
  };

  // ─── STICKY AUTO-SCROLL STATE ───────────────────────────────────────
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
    if (messages.length === 0 || incognito) return;
    const id = currentSessionId || `session-${Date.now()}`;
    if (!currentSessionId) setCurrentSessionId(id);
    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = firstUserMsg?.content?.slice(0,60) || 'Untitled';
    setSessions(prev => {
      const idx = prev.findIndex(s => s.id === id);
      const updated = { id, title, updatedAt: Date.now(), messages };
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
    if (lastUserMsgEl) {
      lastUserMsgEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
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

  const scrollToBottom = () => {
    autoStickRef.current = true;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const time = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    return `${time}, ${userName}. What can I help you with?`;
  };

  const sendMessage = async (text, options = {}) => {
    if (!text || loading) return;
    const { webSearchOn, model, mode } = options;
    const effectiveModel = model || selectedModel;
    const effectiveSearch = webSearchOn !== undefined ? webSearchOn : true;

    const sessionIdToUse = currentSessionId || `session-${Date.now()}`;
    if (!currentSessionId) setCurrentSessionId(sessionIdToUse);
    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: text };
    const assistantId = Date.now() + 1;
    const assistantMsg = {
      id: assistantId,
      role: 'assistant',
      content: '',
      steps: [],
      sources: [],
      images: [],
      followUps: [],
      file: null,
      streaming: true,
    };
    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const patchAssistant = (patchFn) => {
      setMessages(prev => prev.map(msg =>
        msg.id === assistantId ? patchFn(msg) : msg
      ));
    };

    try {
      console.log('🔵 Sending request to:', `${API_BASE}/api/chat/stream`);
      const response = await fetch(`${API_BASE}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
          message: text,
          sessionId: sessionIdToUse,
          model: effectiveModel,
          webSearchOn: effectiveSearch,
          mode: mode || 'balanced',
          incognito,
        }),
        signal: controller.signal,
      });

      console.log('🟢 Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('🔴 Stream ended');
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        console.log('📦 Received chunk:', chunk);
        buffer += chunk;

        let boundary;
        while ((boundary = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          const line = rawEvent.split('\n').find(l => l.startsWith('data: '));
          if (!line) continue;
          let payload;
          try {
            payload = JSON.parse(line.slice(6));
          } catch (e) {
            console.warn('⚠️ Parse error:', line.slice(6));
            continue;
          }

          console.log('📨 Event:', payload.event, payload);

          switch (payload.event) {
            case 'thinking':
              patchAssistant(msg => ({
                ...msg,
                steps: [...(msg.steps || []), { text: payload.text }],
              }));
              break;
            case 'sources':
              // Attach to msg.sources (full list, drives the Sources tab)
              // AND to the most recent "search" step that doesn't have
              // sources yet (drives the inline pills + Steps tab pills).
              patchAssistant(msg => {
                const sources = payload.sources || [];
                const steps = [...(msg.steps || [])];
                for (let i = steps.length - 1; i >= 0; i--) {
                  if (/search/i.test(steps[i].text || '') && !steps[i].sources) {
                    steps[i] = { ...steps[i], sources };
                    break;
                  }
                }
                return { ...msg, sources, steps };
              });
              break;
            case 'images':
              patchAssistant(msg => ({ ...msg, images: payload.images || [] }));
              break;
            case 'token':
              patchAssistant(msg => ({
                ...msg,
                content: (msg.content || '') + (payload.text || ''),
              }));
              break;
            case 'followups':
              patchAssistant(msg => ({ ...msg, followUps: payload.followUps || [] }));
              break;
            case 'error':
              patchAssistant(msg => ({
                ...msg,
                content: payload.message || 'Error occurred',
                streaming: false,
              }));
              break;
            case 'done':
              patchAssistant(msg => ({ ...msg, streaming: false }));
              break;
            default:
              console.warn('Unknown event:', payload.event);
          }
        }
      }
      patchAssistant(msg => ({ ...msg, streaming: false }));
    } catch (error) {
      console.error('❌ Fetch error:', error);
      patchAssistant(msg => ({
        ...msg,
        content: `⚠️ Error: ${error.message}`,
        streaming: false,
      }));
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => abortControllerRef.current?.abort();
  const handleToggleIncognito = () => setIncognito(v => !v);
  const handleOpenVoice = () => setVoiceOpen(true);
  const newChat = () => { setMessages([]); setCurrentSessionId(null); closeSourcesPanel(); };
  const handleSessionClick = (id) => {
    const session = sessions.find(s => s.id === id);
    if (session) { setCurrentSessionId(id); setMessages(session.messages || []); closeSourcesPanel(); }
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

  // ─── SourcesPanel callbacks ───────────────────────────────────────
  // These are the ones AnswerCard's "N sources" pill, image grid, and
  // inline citation/entity links actually call. Each needs to know
  // WHICH message it belongs to, so every callback below is built
  // per-message inside the .map() (see openSourcesFor / openSourceDetailFor
  // / openEntityFor factories).
  const handleSelectSource = (source) => setFocusedItem({ type: 'source', data: source });
  const handlePanelBack = () => setFocusedItem(null);
  const handleImageClick = (img) => { if (img?.src) window.open(img.src, '_blank'); };
  const handleAskMore = (name) => {
    closeSourcesPanel();
    sendMessage(`Tell me more about ${name}`);
  };

  // Factories so each message's pill/entity-link opens the panel
  // scoped to THAT message, not whichever message last streamed.
  const openSourcesFor = (msgId) => () => openSourcesPanel(msgId, 'sources');
  const openImagesFor = (msgId) => () => openSourcesPanel(msgId, 'images');
  const openStepsFor = (msgId) => () => openSourcesPanel(msgId, 'steps');
  const openSourceDetailFor = (msgId) => (source) => {
    setActiveMessageId(msgId);
    setPanelTab('sources');
    setFocusedItem({ type: 'source', data: source });
    setSourcesOpen(true);
  };
  const openEntityFor = (msgId) => (name) => {
    setActiveMessageId(msgId);
    setPanelTab('sources');
    setFocusedItem({ type: 'entity', data: { name } });
    setSourcesOpen(true);
  };

  if (messages.length === 0) {
    return (
      <>
        <Layout activeTab={activeTab} setActiveTab={setActiveTab} recentSearches={recentSearches} onNewChat={newChat} onTaskClick={handleTaskClick} incognito={incognito} sessions={sessions} currentSessionId={currentSessionId} onSessionClick={handleSessionClick}>
          <div className="h-full flex flex-col bg-black overflow-hidden relative">
            <ChatTopBar
              incognito={incognito}
              onToggleIncognito={handleToggleIncognito}
              onOpenDiscover={handleOpenDiscover}
              onShare={handleShare}
              onUpgrade={handleUpgrade}
              onPin={handlePin}
              onMoveToProject={handleMoveToProject}
              onDelete={handleDeleteChat}
            />
            <div className="flex-1 overflow-y-auto px-4">
              <div className="min-h-full flex flex-col items-center justify-center py-8">
                <div className="max-w-3xl w-full text-center">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{getGreeting()}</h1>
<p className="italic text-gray-400 text-base mb-6" style={{ fontFamily: 'Georgia, serif' }}>
  {dailyQuote}
</p>
                  <SearchBox onSend={sendMessage} loading={loading} onStop={handleStop} onOpenVoice={handleOpenVoice} model={selectedModel} onModelChange={setSelectedModel} incognito={incognito} />
                  <div className="mt-4">
                    <QuickActionPills onSelect={sendMessage} />
                  </div>
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
        <div className="h-full flex flex-col bg-black overflow-hidden relative">
          <ChatTopBar
            incognito={incognito}
            onToggleIncognito={handleToggleIncognito}
            onOpenDiscover={handleOpenDiscover}
            onShare={handleShare}
            onUpgrade={handleUpgrade}
            onPin={handlePin}
            onMoveToProject={handleMoveToProject}
            onDelete={handleDeleteChat}
          />
          {/* ─── Row: chat column + sources side panel ─────────────
              SourcesPanel is a flex sibling (not an overlay) so its
              width transition pushes the chat column over, matching
              the reference video. */}
          <div className="flex-1 relative overflow-hidden flex flex-row min-h-0">
            <div className="flex-1 flex flex-col min-w-0 relative">
              <div ref={scrollContainerRef} className="h-full overflow-y-auto px-4 py-6 scroll-smooth">
                <div className="max-w-3xl mx-auto w-full space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={msg.id || idx} data-role={msg.role}>
                      {msg.role === 'assistant' && (msg.streaming || (msg.steps && msg.steps.length > 0)) && (
                        <ThinkingPanel
                          steps={msg.steps}
                          streaming={msg.streaming}
                          onSeeAllSources={openStepsFor(msg.id)}
                        />
                      )}
                      <MessageBubble
                        message={msg}
                        isUser={msg.role === 'user'}
                        isStreaming={msg.streaming}
                        onSendQuery={sendMessage}
                        onOpenSources={openSourcesFor(msg.id)}
                        onOpenImages={openImagesFor(msg.id)}
                        onOpenSourceDetail={openSourceDetailFor(msg.id)}
                        onOpenEntity={openEntityFor(msg.id)}
                      />
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {showScrollButton && (
                <button
                  onClick={scrollToBottom}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#242424] transition-colors shadow-lg"
                  aria-label="Scroll to bottom"
                >
                  <ChevronDown size={18} />
                </button>
              )}
            </div>

            <SourcesPanel
              open={sourcesOpen}
              onClose={closeSourcesPanel}
              sources={activeMessage?.sources || []}
              images={activeMessage?.images || []}
              steps={activeMessage?.steps || []}
              streaming={activeMessage?.streaming || false}
              focusedItem={focusedItem}
              onBack={handlePanelBack}
              onSelectSource={handleSelectSource}
              tab={panelTab}
              onTabChange={setPanelTab}
              onImageClick={handleImageClick}
              onAskMore={handleAskMore}
            />
          </div>
          <div className="flex-shrink-0 bg-black p-4">
            <div className="max-w-3xl mx-auto">
              <SearchBox onSend={sendMessage} loading={loading} onStop={handleStop} onOpenVoice={handleOpenVoice} model={selectedModel} onModelChange={setSelectedModel} incognito={incognito} />
            </div>
          </div>
        </div>
      </Layout>
      {voiceOpen && <VoiceOverlay onClose={() => setVoiceOpen(false)} onSend={sendMessage} />}
    </>
  );
}