const API_BASE = 'http://localhost:3001';

function getUserId() {
  let id = localStorage.getItem('stoic_user_id');
  if (!id) {
    id = 'user_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('stoic_user_id', id);
  }
  return id;
}

export const connectorsApi = {
  async list() {
    const res = await fetch(`${API_BASE}/api/connectors`, {
      headers: { 'x-user-id': getUserId() },
    });
    if (!res.ok) throw new Error(`Failed to list connectors (${res.status})`);
    return res.json();
  },

  connectGithub() {
    const userId = getUserId();
    window.location.href = `${API_BASE}/api/connectors/github/connect?userId=${encodeURIComponent(userId)}`;
  },

  connectNotion() {
    const userId = getUserId();
    window.location.href = `${API_BASE}/api/connectors/notion/connect?userId=${encodeURIComponent(userId)}`;
  },

  connectSlack() {
    const userId = getUserId();
    window.location.href = `${API_BASE}/api/connectors/slack/connect?userId=${encodeURIComponent(userId)}`;
  },

  async disconnect(provider) {
    const res = await fetch(`${API_BASE}/api/connectors/${provider}/disconnect`, {
      method: 'POST',
      headers: { 'x-user-id': getUserId() },
    });
    if (!res.ok) throw new Error(`Failed to disconnect (${res.status})`);
    return res.json();
  },
};