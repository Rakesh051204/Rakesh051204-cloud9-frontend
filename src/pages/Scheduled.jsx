import Layout from '../components/Layout';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Calendar, Bell, Repeat, X, Edit2, Play } from 'lucide-react';

const API_BASE = 'http://localhost:3001';

export default function Scheduled() {
  const [activeTab, setActiveTab] = useState('scheduled');
  const [recentSearches, setRecentSearches] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cron: '0 9 * * *',
    type: 'email',
    config: '',
  });

  const sessionId = localStorage.getItem('stoic_session_id') || 'anonymous';

  // ----- FETCH TASKS -----
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/scheduled?sessionId=${sessionId}`);
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ----- CREATE / UPDATE TASK -----
  const handleSaveTask = async () => {
    if (!formData.title.trim()) {
      alert('Task title is required.');
      return;
    }

    const method = editingTask ? 'PUT' : 'POST';
    const url = editingTask
      ? `${API_BASE}/scheduled/${editingTask.id}`
      : `${API_BASE}/scheduled`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          cron: formData.cron,
          type: formData.type,
          config: formData.config ? JSON.parse(formData.config) : {},
          sessionId: sessionId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchTasks();
        setShowModal(false);
        setEditingTask(null);
        setFormData({ title: '', description: '', cron: '0 9 * * *', type: 'email', config: '' });
      } else {
        alert(`Error: ${data.error || 'Something went wrong'}`);
      }
    } catch (error) {
      console.error('Save task error:', error);
      alert('Failed to save task.');
    }
  };

  // ----- DELETE TASK -----
  const handleDeleteTask = async (id) => {
    if (!confirm('Delete this scheduled task?')) return;
    try {
      await fetch(`${API_BASE}/scheduled/${id}?sessionId=${sessionId}`, {
        method: 'DELETE',
      });
      await fetchTasks();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete task.');
    }
  };

  // ----- OPEN MODAL -----
  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({ title: '', description: '', cron: '0 9 * * *', type: 'email', config: '' });
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      cron: task.cron || '0 9 * * *',
      type: task.type || 'email',
      config: task.config ? JSON.stringify(task.config) : '',
    });
    setShowModal(true);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'email': return <Mail size={18} className="text-secondary" />;
      case 'alert': return <Bell size={18} className="text-secondary" />;
      default: return <Clock size={18} className="text-secondary" />;
    }
  };

  const getCronLabel = (cron) => {
    const parts = cron.split(' ');
    if (parts[1] === '9' && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') return 'Daily at 9:00 AM';
    if (parts[0] === '0' && parts[1] === '0' && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') return 'Midnight daily';
    if (parts[0] === '0' && parts[1] === '0' && parts[2] === '*' && parts[3] === '*' && parts[4] === '1') return 'Weekly (Monday)';
    if (parts[0] === '0' && parts[1] === '0' && parts[2] === '1' && parts[3] === '*' && parts[4] === '*') return 'Monthly (1st)';
    return cron;
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
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">Scheduled Tasks</h1>
          <p className="text-secondary text-sm mt-1">Set up automated workflows that run on their own schedule.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/80 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Plus size={18} />
          Create Task
        </button>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex gap-2">
            <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-surface border border-border rounded-xl px-4">
          <Clock size={48} className="mx-auto text-secondary/30 mb-4" />
          <p className="text-secondary">No scheduled tasks yet.</p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/80 transition-colors"
          >
            Create your first scheduled task
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4 px-2 sm:px-0">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-surface border border-border rounded-xl p-4 sm:p-5 shadow-card hover:shadow-soft transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getIcon(task.type)}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-primary">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-secondary mt-0.5">{task.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-xs px-2 py-0.5 bg-background border border-border rounded-full text-secondary flex items-center gap-1">
                        <Clock size={12} />
                        {getCronLabel(task.cron)}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full">
                        {task.type}
                      </span>
                      <span className="text-xs text-secondary/50">
                        Created {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-auto sm:ml-0">
                  <button
                    onClick={() => alert('⏳ Running task... (simulated)')}
                    className="p-1.5 rounded-lg hover:bg-surface-hover text-secondary hover:text-primary transition-colors"
                    title="Run now"
                  >
                    <Play size={17} />
                  </button>
                  <button
                    onClick={() => openEditModal(task)}
                    className="p-1.5 rounded-lg hover:bg-surface-hover text-secondary hover:text-primary transition-colors"
                    title="Edit task"
                  >
                    <Edit2 size={17} />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-secondary hover:text-red-500 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
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
                {editingTask ? 'Edit Task' : 'Create Scheduled Task'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-secondary hover:text-primary">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Task Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Daily email summary"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-primary placeholder-secondary/70 outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this task does..."
                  rows={2}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-primary placeholder-secondary/70 outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Cron Schedule</label>
                <input
                  type="text"
                  value={formData.cron}
                  onChange={(e) => setFormData({ ...formData, cron: e.target.value })}
                  placeholder="0 9 * * * (daily at 9 AM)"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-primary placeholder-secondary/70 outline-none focus:ring-2 focus:ring-accent/30"
                />
                <p className="text-xs text-secondary/60 mt-1">
                  Examples: <code className="bg-background px-1 py-0.5 rounded">0 9 * * *</code> daily 9am,{' '}
                  <code className="bg-background px-1 py-0.5 rounded">0 0 * * 1</code> every Monday midnight
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Task Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-primary outline-none focus:ring-2 focus:ring-accent/30"
                >
                  <option value="email">Email</option>
                  <option value="alert">Alert / Notification</option>
                  <option value="report">Report</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Configuration (JSON)</label>
                <input
                  type="text"
                  value={formData.config}
                  onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                  placeholder='{"recipient": "user@example.com"}'
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
                onClick={handleSaveTask}
                className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/80 transition-colors"
              >
                {editingTask ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}