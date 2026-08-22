import Sidebar from '../components/Sidebar';
import { useState } from 'react';
import { Code2, Send, Sparkles } from 'lucide-react';

const API_BASE = 'http://localhost:3001';

export default function Code() {
  const [activeTab, setActiveTab] = useState('code');
  const [recentSearches] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCode = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/code/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, language })
      });
      const data = await res.json();
      setCode(data.code || '// No code generated');
    } catch (error) {
      alert('Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-primary">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recentSearches={recentSearches}
        onNewChat={() => window.location.href = '/'}
      />
      <div className="flex-1 overflow-y-auto px-8 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-serif font-semibold mb-2">Code Assistant</h1>
          <p className="text-secondary mb-6">Generate code, fix bugs, or explain code</p>

          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to code..."
                className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-primary placeholder-secondary/70 outline-none focus:ring-2 focus:ring-accent/30"
              />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-2.5 text-primary outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
              </select>
              <button
                onClick={generateCode}
                disabled={loading}
                className="px-6 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent/80 transition-colors disabled:opacity-50"
              >
                {loading ? <Sparkles size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>

            {code && (
              <div className="mt-4 bg-background border border-border rounded-lg p-4">
                <pre className="text-sm text-primary/90 whitespace-pre-wrap"><code>{code}</code></pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}