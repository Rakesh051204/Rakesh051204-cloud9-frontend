import Layout from '../components/Layout';
import { useState } from 'react';
import { 
  Monitor, Globe, Sparkles, Sliders, Layout as LayoutIcon, Code, 
  Clock, BarChart3, Send, Loader2 
} from 'lucide-react';

const API_BASE = 'http://localhost:3001';

export default function Projects() {
  const [activeTab, setActiveTab] = useState('projects');
  const [recentSearches] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const tools = [
    { 
      id: 'website', 
      label: 'Build Website', 
      icon: Globe, 
      description: 'Generate a complete website – static or full‑stack.',
      mode: 'website',
      scaffold: 'web-static',
    },
    { 
      id: 'slides', 
      label: 'Create Slides', 
      icon: Sliders, 
      description: 'Turn your ideas into a professional presentation.',
      mode: 'slides',
      slideMode: 'html',
    },
    { 
      id: 'desktop', 
      label: 'Develop Desktop App', 
      icon: Monitor, 
      description: 'Build a desktop application (Python/Node.js).',
      mode: 'desktop',
    },
    { 
      id: 'design', 
      label: 'Design Prompt', 
      icon: LayoutIcon,   // <-- now uses the renamed import
      description: 'Generate a detailed visual description for an image.',
      mode: 'design',
    },
    { 
      id: 'ad-analytics', 
      label: 'Analyze Ad Campaigns', 
      icon: BarChart3, 
      description: 'Get AI‑powered optimisation recommendations.',
      mode: 'ad-analytics',
      new: true,
    },
    { 
      id: 'morning-briefing', 
      label: 'Morning Briefing', 
      icon: Clock, 
      description: 'Automate a daily summary from your apps.',
      mode: 'morning-briefing',
      new: true,
    },
  ];

  const handleGenerate = async () => {
    if (!selectedTool) return;
    if (!prompt.trim()) return alert('Please describe what you want to build.');

    setLoading(true);
    setResult(null);

    try {
      const payload = {
        mode: selectedTool.mode,
        input: prompt,
      };
      if (selectedTool.mode === 'website') payload.scaffold = selectedTool.scaffold;
      if (selectedTool.mode === 'slides') payload.slideMode = selectedTool.slideMode;

      const res = await fetch(`${API_BASE}/projects/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
      } else {
        alert('Generation failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the server.');
    }
    setLoading(false);
  };

  const handleToolClick = (tool) => {
    setSelectedTool(tool);
    setResult(null);
    setPrompt('');
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      recentSearches={recentSearches}
      onNewChat={() => window.location.href = '/'}
    >
      <div className="max-w-5xl mx-auto px-2 sm:px-0">
        <div className="flex justify-center mb-2">
          <span className="text-xs font-semibold text-secondary bg-surface px-3 py-1 rounded-full border border-border">
            Build Tools
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary text-center mb-2">
          Turn your ideas into reality
        </h1>
        <p className="text-center text-secondary text-sm mb-6">
          Pick a tool, describe what you need, and let AI build it for you.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool?.id === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className={`p-4 rounded-xl border transition-all text-left ${
                  isSelected
                    ? 'border-accent bg-accent/10 shadow-soft'
                    : 'border-border bg-surface hover:border-accent/30 hover:shadow-soft'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={20} className={isSelected ? 'text-accent' : 'text-secondary'} />
                  <span className="font-semibold text-sm text-primary">{tool.label}</span>
                  {tool.new && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-accent/20 text-accent rounded-full">New</span>
                  )}
                </div>
                <p className="text-xs text-secondary/80">{tool.description}</p>
              </button>
            );
          })}
        </div>

        {selectedTool && (
          <div className="bg-surface border border-border rounded-2xl shadow-card p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-primary mb-1">
              {selectedTool.label}
            </h2>
            <p className="text-sm text-secondary mb-3">
              Describe what you want to {selectedTool.label.toLowerCase()}.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  selectedTool.mode === 'website'
                    ? 'e.g. a modern portfolio for a photographer with a contact form'
                    : selectedTool.mode === 'slides'
                    ? 'e.g. 5 slides about the future of AI in healthcare'
                    : selectedTool.mode === 'desktop'
                    ? 'e.g. a to‑do list app with SQLite storage'
                    : selectedTool.mode === 'design'
                    ? 'e.g. a minimalistic logo for a coffee shop'
                    : 'Describe your idea...'
                }
                rows={2}
                className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-primary placeholder-secondary/70 outline-none focus:ring-2 focus:ring-accent/30 resize-none text-sm sm:text-base"
              />
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {loading ? 'Building...' : 'Generate'}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-6 bg-surface border border-border rounded-2xl shadow-card p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-secondary mb-2">Generated Output</h3>
            <div className="bg-background rounded-lg p-4 max-h-96 overflow-auto whitespace-pre-wrap font-mono text-xs text-primary/90 border border-border">
              {result}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}