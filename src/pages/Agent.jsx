import Layout from '../components/Layout';
import { useState, useEffect } from 'react';
import { Plus, Trash2, MessageCircle, Bot, Settings, Sparkles, X } from 'lucide-react';

const API_BASE = 'http://localhost:3001';

export default function Agent() {
  const [activeTab, setActiveTab] = useState('agent');
  const [recentSearches, setRecentSearches] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    instructions: '',
    tools: '',
    deployment: '',
  });

  const sessionId = localStorage.getItem('stoic_session_id') || 'anonymous';

  // ----- FETCH AGENTS -----
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/agents?sessionId=${sessionId}`);
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // ----- CREATE / UPDATE AGENT -----
  const handleSaveAgent = async () => {
    if (!formData.name.trim()) {
      alert('Agent name is required.');
      return;
    }

    const method = editingAgent ? 'PUT' : 'POST';
    const url = editingAgent
      ? `${API_BASE}/agents/${editingAgent.id}`
      : `${API_BASE}/agents`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          instructions: formData.instructions.trim(),
          tools: formData.tools.split(',').map(t => t.trim()).filter(Boolean),
          deployment: formData.deployment.trim(),
          sessionId: sessionId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchAgents();
        setShowModal(false);
        setEditingAgent(null);
        setFormData({ name: '', instructions: '', tools: '', deployment: '' });
      } else {
        alert(`Error: ${data.error || 'Something went wrong'}`);
      }
    } catch (error) {
      console.error('Save agent error:', error);
      alert('Failed to save agent.');
    }
  };

  // ----- DELETE AGENT -----
  const handleDeleteAgent = async (id) => {
    if (!confirm('Delete this agent?')) return;
    try {
      await fetch(`${API_BASE}/agents/${id}?sessionId=${sessionId}`, {
        method: 'DELETE',
      });
      await fetchAgents();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete agent.');
    }
  };

  // ----- CHAT WITH AGENT -----
  const handleChatWithAgent = (agent) => {
    localStorage.setItem('stoic_selected_agent', JSON.stringify({ id: agent.id, name: agent.name }));
    window.location.href = '/';
  };

  // ----- OPEN MODAL -----
  const openCreateModal = () => {
    setEditingAgent(null);
    setFormData({ name: '', instructions: '', tools: '', deployment: '' });
    setShowModal(true);
  };

  const openEditModal = (agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name || '',
      instructions: agent.instructions || '',
      tools: (agent.tools || []).join(', '),
      deployment: agent.deployment || '',
    });
    setShowModal(true);
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      recentSearches={recentSearches}
      onNewChat={() => window.location.href = '/'}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 px-2 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">Agents</h1>
          <p className="text-secondary text-sm mt-1">Create specialised AI assistants for any task.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/80 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Plus size={18} />
          New Agent
        </button>
      </div>

      {/* Agent List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex gap-2">
            <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-surface border border-border rounded-xl px-4">
          <Bot size={48} className="mx-auto text-secondary/30 mb-4" />
          <p className="text-secondary">No agents yet.</p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/80 transition-colors"
          >
            Create your first agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-2 sm:px-0">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-surface border border-border rounded-xl p-4 sm:p-5 shadow-card hover:shadow-soft transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Bot size={20} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-primary">{agent.name}</h3>
                    <p className="text-xs text-secondary">
                      Created {new Date(agent.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleChatWithAgent(agent)}
                    className="p-1.5 rounded-lg hover:bg-surface-hover text-secondary hover:text-primary transition-colors"
                    title="Chat with this agent"
                  >
                    <MessageCircle size={17} />
                  </button>
                  <button
                    onClick={() => openEditModal(agent)}
                    className="p-1.5 rounded-lg hover:bg-surface-hover text-secondary hover:text-primary transition-colors"
                    title="Edit agent"
                  >
                    <Settings size={17} />
                  </button>
                  <button
                    onClick={() => handleDeleteAgent(agent.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-secondary hover:text-red-500 transition-colors"
                    title="Delete agent"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
              {agent.instructions && (
                <div className="mt-3 text-sm text-secondary/80 line-clamp-2 bg-background p-2 rounded-lg border border-border/50">
                  {agent.instructions}
                </div>
              )}
              {agent.tools && agent.tools.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {agent.tools.map((tool, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full">
                      {tool}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full border border-border shadow-soft p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl sm:text-2xl font-serif font-semibold text-primary">
                {editingAgent ? 'Edit Agent' : 'Create Agent'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-secondary hover:text-primary">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Agent Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Coding Expert, Financial Advisor"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-primary placeholder-secondary/70 outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Instructions (Personality & Role)</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="You are a senior developer who gives concise, practical coding advice..."
                  rows={4}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-primary placeholder-secondary/70 outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Tools (comma separated)</label>
                <input
                  type="text"
                  value={formData.tools}
                  onChange={(e) => setFormData({ ...formData, tools: e.target.value })}
                  placeholder="web search, file upload, code generation"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-primary placeholder-secondary/70 outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Deployment (optional)</label>
                <input
                  type="text"
                  value={formData.deployment}
                  onChange={(e) => setFormData({ ...formData, deployment: e.target.value })}
                  placeholder="Slack, Telegram, Web app"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-primary placeholder-secondary/70 outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-secondary hover:text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAgent}
                className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/80 transition-colors"
              >
                {editingAgent ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}