import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronDown, Check, X, GitBranch, Zap, Layers, Database, BookOpen } from 'lucide-react';
import { FaGithub, FaSlack, FaGoogleDrive, FaNotion } from 'react-icons/fa';
import { SiVercel, SiSupabase, SiRender } from 'react-icons/si';

// -------- Helper: get icon for connector --------
const getConnectorIcon = (id) => {
  const map = {
    github: <FaGithub className="w-5 h-5" />,
    slack: <FaSlack className="w-5 h-5" />,
    notion: <FaNotion className="w-5 h-5" />,
    googledrive: <FaGoogleDrive className="w-5 h-5" />,
    vercel: <SiVercel className="w-5 h-5" />,
    supabase: <SiSupabase className="w-5 h-5" />,
    render: <SiRender className="w-5 h-5" />,
  };
  return map[id] || <div className="w-5 h-5 rounded-full bg-gray-600" />;
};

// -------- Connector data (real stack) --------
const connectorsData = [
  { id: 'groq', name: 'Groq', category: 'Core stack', connected: true, color: 'bg-blue-500' },
  { id: 'tavily', name: 'Tavily', category: 'Core stack', connected: true, color: 'bg-purple-500' },
  { id: 'searxng', name: 'SearXNG', category: 'Core stack', connected: true, color: 'bg-green-500' },
  { id: 'supabase', name: 'Supabase', category: 'Core stack', connected: true, color: 'bg-teal-500' },
  { id: 'voyageai', name: 'Voyage AI', category: 'Core stack', connected: true, color: 'bg-amber-500' },
  { id: 'notion', name: 'Notion', category: 'Productivity', connected: false },
  { id: 'googledrive', name: 'Google Drive', category: 'Productivity', connected: false },
  { id: 'slack', name: 'Slack', category: 'Productivity', connected: false },
  { id: 'github', name: 'GitHub', category: 'Dev', connected: false },
  { id: 'vercel', name: 'Vercel', category: 'Dev', connected: false },
  { id: 'render', name: 'Render', category: 'Dev', connected: false },
];

// -------- Skills data --------
const skillsData = [
  { id: 'citation-formatter', name: 'Citation Formatter', description: 'Format citations in APA/MLA', enabled: true },
  { id: 'code-reviewer', name: 'Code Reviewer', description: 'Review code for best practices', enabled: false },
  { id: 'resume-tailor', name: 'Resume Tailor', description: 'Tailor resume for job descriptions', enabled: true },
  { id: 'email-drafter', name: 'Email Drafter', description: 'Draft professional emails', enabled: false },
  { id: 'meeting-summarizer', name: 'Meeting Summarizer', description: 'Summarize meeting notes', enabled: true },
];

// -------- Workflows data --------
const workflowsData = [
  { id: 'daily-job-search', name: 'Daily Job Search', pinned: true, description: 'Scrape and rank new jobs' },
  { id: 'interview-prep', name: 'Interview Prep', pinned: false, description: 'Generate mock questions' },
  { id: 'resume-optimizer', name: 'Resume Optimizer', pinned: true, description: 'ATS-friendly rewrite' },
];

// -------- Memories data --------
const memoriesData = [
  { id: 1, content: 'Prefers TypeScript over JavaScript', type: 'preference' },
  { id: 2, content: 'Worked at Acme Corp as senior engineer', type: 'experience' },
];

// -------- Main component --------
export default function StoicCustomise() {
  const [activeTab, setActiveTab] = useState('connectors');
  const [filter, setFilter] = useState('all'); // all | connected | available
  const [search, setSearch] = useState('');

  // State for connectors (loaded from localStorage)
  const [connectors, setConnectors] = useState(() => {
    const saved = localStorage.getItem('stoic_connectors');
    if (saved) {
      const parsed = JSON.parse(saved);
      // merge with initial data to keep new connectors
      return connectorsData.map(c => ({ ...c, connected: parsed.find(p => p.id === c.id)?.connected ?? c.connected }));
    }
    return connectorsData;
  });

  // Persist connector state
  useEffect(() => {
    localStorage.setItem('stoic_connectors', JSON.stringify(connectors));
  }, [connectors]);

  const toggleConnector = (id) => {
    setConnectors(prev => prev.map(c => c.id === id ? { ...c, connected: !c.connected } : c));
  };

  // State for skills (localStorage)
  const [skills, setSkills] = useState(() => {
    const saved = localStorage.getItem('stoic_skills');
    if (saved) return JSON.parse(saved);
    return skillsData;
  });

  useEffect(() => {
    localStorage.setItem('stoic_skills', JSON.stringify(skills));
  }, [skills]);

  const toggleSkill = (id) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  // Filter connectors
  const filteredConnectors = connectors.filter(c => {
    if (filter === 'connected' && !c.connected) return false;
    if (filter === 'available' && c.connected) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group connectors by category
  const grouped = filteredConnectors.reduce((acc, c) => {
    acc[c.category] = acc[c.category] || [];
    acc[c.category].push(c);
    return acc;
  }, {});

  // -------- Render tabs --------
  const renderContent = () => {
    switch (activeTab) {
      case 'connectors':
        return (
          <div>
            {/* Filter pills */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {['all', 'connected', 'available'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-sm rounded-full ${filter === f ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            {/* Connector cards grouped by category */}
            {Object.keys(grouped).map(category => (
              <div key={category} className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">{category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {grouped[category].map(conn => (
                    <div key={conn.id} className="bg-white/5 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          {getConnectorIcon(conn.id)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{conn.name}</div>
                          <div className="text-xs text-gray-400">{conn.connected ? 'Connected' : 'Available'}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleConnector(conn.id)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${conn.connected ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                      >
                        {conn.connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case 'skills':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skills.map(skill => (
              <div key={skill.id} className="bg-white/5 rounded-xl p-4 flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{skill.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{skill.description}</div>
                </div>
                <button
                  onClick={() => toggleSkill(skill.id)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${skill.enabled ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-300'}`}
                >
                  {skill.enabled ? 'On' : 'Off'}
                </button>
              </div>
            ))}
          </div>
        );
      case 'workflows':
        return (
          <div>
            <div className="flex gap-2 mb-4">
              <button className="px-3 py-1 text-sm rounded-full bg-white/20 text-white">Browse</button>
              <button className="px-3 py-1 text-sm rounded-full bg-white/5 text-gray-400 hover:bg-white/10">Pinned</button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {workflowsData.map(wf => (
                <div key={wf.id} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">{wf.name}</div>
                    <div className="text-xs text-gray-400">{wf.description}</div>
                  </div>
                  <div className="flex gap-2">
                    {wf.pinned && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Pinned</span>}
                    <button className="text-gray-400 hover:text-white text-xs">Run</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'memory':
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-400">Stored Memories</h3>
              <button className="text-xs text-blue-400 hover:text-blue-300">+ Add Memory</button>
            </div>
            <div className="space-y-2">
              {memoriesData.map(m => (
                <div key={m.id} className="bg-white/5 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm text-white">{m.content}</span>
                  <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">{m.type}</span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // -------- Render --------
  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Customise Stoic</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/10 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20">
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/10 mb-6">
        {['connectors', 'skills', 'workflows', 'memory'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium transition-colors ${activeTab === tab ? 'text-white border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}