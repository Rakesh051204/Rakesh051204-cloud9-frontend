import Layout from '../components/Layout';
import { useState } from 'react';
import { Send, Sparkles, Code2, MessageSquareText, Wrench, ClipboardCheck } from 'lucide-react';

const API_BASE = 'http://localhost:3001';

const MODES = [
  { id: 'generate', label: 'Generate', icon: Code2, endpoint: '/code/generate', placeholder: 'Describe what you want to code...' },
  { id: 'explain', label: 'Explain', icon: MessageSquareText, endpoint: '/code/explain', placeholder: 'Paste the code you want explained...' },
  { id: 'fix', label: 'Fix', icon: Wrench, endpoint: '/code/fix', placeholder: 'Paste the broken code (and error message if you have one)...' },
  { id: 'review', label: 'Review', icon: ClipboardCheck, endpoint: '/code/review', placeholder: 'Paste the code you want reviewed...' },
];

export default function Code() {
  const [activeTab, setActiveTab] = useState('code');
  const [recentSearches, setRecentSearches] = useState([]);
  const [mode, setMode] = useState('generate');
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const currentMode = MODES.find(m => m.id === mode);

  const runAction = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setOutput('');
    try {
      const body = mode === 'generate'
        ? { prompt, language }
        : { code: prompt, language };

      const res = await fetch(`${API_BASE}${currentMode.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${res.status}`);
      }

      const data = await res.json();
      // Each endpoint returns a different field name
      const result = data.code || data.explanation || data.result || data.review || '// No output';
      setOutput(result);
    } catch (error) {
      console.error('Code action error:', error);
      setOutput(`⚠️ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      recentSearches={recentSearches}
      onNewChat={() => window.location.href = '/'}
    >
      {/* Badge */}
      <div className="flex justify-center mb-2">
        <span className="text-xs font-semibold text-secondary bg-surface px-3 py-1 rounded-full border border-border">
          Code Assistant
        </span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-serif font-bold text-primary text-center mb-6">
        Generate code, fix bugs, or explain code
      </h1>

      {/* Mode tabs */}
      <div className="flex justify-center gap-2 mb-6">
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); setOutput(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-accent text-white'
                  : 'bg-surface border border-border text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <Icon size={16} />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Input area */}
      <div className="bg-surface border border-border rounded-xl p-3 shadow-card mb-6">
        <div className="flex flex-col gap-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={currentMode.placeholder}
            rows={mode === 'generate' ? 2 : 8}
            className="flex-1 bg-transparent px-3 py-2 outline-none text-primary placeholder-secondary/70 resize-none font-mono text-sm"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-primary outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="swift">Swift</option>
              <option value="kotlin">Kotlin</option>
              <option value="sql">SQL</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="bash">Bash</option>
            </select>
            <button
              onClick={runAction}
              disabled={loading}
              className="flex-1 px-6 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? <Sparkles size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? `${currentMode.label}ing...` : currentMode.label}
            </button>
          </div>
        </div>
      </div>

      {/* Output */}
      {output && (
        <div className="bg-surface border border-border rounded-xl p-4 shadow-card max-h-[600px] overflow-y-auto">
          <pre className="text-sm text-primary/90 whitespace-pre-wrap overflow-x-auto font-mono">
            <code>{output}</code>
          </pre>
        </div>
      )}
    </Layout>
  );
}