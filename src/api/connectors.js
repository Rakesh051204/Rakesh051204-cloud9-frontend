const API_BASE = 'http://localhost:3001';

// Single-user local app: persist a stable anonymous user id in
// localStorage so the backend's x-user-id / userId checks have
// something consistent to key connector rows on.
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

  // Full page navigation (not fetch) because GitHub's OAuth authorize
  // page has to load in the top-level window. userId travels via the
  // query string since this request can't carry the x-user-id header.
  connectGithub() {
    const userId = getUserId();
    window.location.href = `${API_BASE}/api/connectors/github/connect?userId=${encodeURIComponent(userId)}`;
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