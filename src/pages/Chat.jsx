import { useState, useRef, useEffect } from 'react';
import { 
  Paperclip, Camera, Folder, Brain, Plug, Puzzle, Search, Palette,
  UserCircle2, Code2, BookOpen, Sparkles, Cloud, User, Download,
  Mic, ArrowUp, AlertTriangle, Plus,
} from 'lucide-react';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const plusMenuRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = async (text) => {
    const query = text || input.trim();
    if (!query || loading) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setInput('');
    setLoading(true);

    const assistantId = Date.now();

    // Add placeholder assistant message
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      thinkingSummary: '',
      sources: [],
      followUps: []
    }]);

    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: query,
          webSearchOn: true 
        }),
      });

      const data = await response.json();

      setMessages(prev => prev.map(msg => 
        msg.id === assistantId ? {
          ...msg,
          content: data.content || 'No response received.',
          thinkingSummary: data.thinkingSummary || '',
          sources: data.sources || [],
          followUps: data.followUps || []
        } : msg
      ));

    } catch (err) {
      console.error(err);
      setMessages(prev => prev.map(msg =>
        msg.id === assistantId ? {
          ...msg,
          content: '⚠️ Failed to connect to server. Make sure backend is running.'
        } : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = (text) => {
    handleSend(text);
  };

  return (
    <div className="chat-app">
      <div className="chat-body">
        {messages.length === 0 ? (
          <div className="welcome">
            <div className="welcome-logo"><Cloud size={40} /></div>
            <h1>Stoic AI</h1>
            <p>Ask anything. Get thoughtful answers with thinking steps.</p>
          </div>
        ) : (
          <div className="messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? <User size={20} /> : <Cloud size={20} />}
                </div>
                <div className="message-content">
                  {msg.role === 'assistant' && msg.thinkingSummary && (
                    <div className="thinking-box" style={{ marginBottom: '12px', padding: '10px', background: '#1a1a1a', borderRadius: '8px' }}>
                      <strong>Thinking:</strong> {msg.thinkingSummary}
                    </div>
                  )}

                  <div className="text-msg">
                    {msg.content}
                  </div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="sources" style={{ marginTop: '12px' }}>
                      <strong>Sources:</strong>
                      {msg.sources.map((s, i) => (
                        <div key={i} style={{ fontSize: '0.85em', marginTop: '4px' }}>
                          • <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="follow-ups" style={{ marginTop: '16px' }}>
                      <strong>Follow up:</strong>
                      {msg.followUps.map((q, i) => (
                        <button 
                          key={i}
                          onClick={() => handleFollowUp(q)}
                          style={{ display: 'block', margin: '6px 0', color: '#7C83DB', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                        >
                          → {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <div className="message-avatar"><Cloud size={20} /></div>
                <div className="typing">Thinking...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="input-area">
        <div className="input-box">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask anything..."
            className="chat-input"
          />
          <button className="send-btn" onClick={() => handleSend()} disabled={!input.trim() || loading}>
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}