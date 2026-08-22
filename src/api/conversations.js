const API_BASE = 'http://localhost:3001'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    let message = `Request failed: ${res.status}`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      // ignore parse errors, use default message
    }
    throw new Error(message)
  }
  return res.json()
}

export const conversationsApi = {
  list: () => request('/api/conversations'),

  share: (id) => request(`/api/conversations/${id}/share`, { method: 'POST' }),

  rename: (id, title) =>
    request(`/api/conversations/${id}/rename`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    }),

  pin: (id, next) =>
    request(`/api/conversations/${id}/pin`, {
      method: 'PATCH',
      body: JSON.stringify({ pinned: next }),
    }),

  favorite: (id, next) =>
    request(`/api/conversations/${id}/favorite`, {
      method: 'PATCH',
      body: JSON.stringify({ favorite: next }),
    }),

  archive: (id, next) =>
    request(`/api/conversations/${id}/archive`, {
      method: 'PATCH',
      body: JSON.stringify({ archived: next }),
    }),

  remove: (id) => request(`/api/conversations/${id}`, { method: 'DELETE' }),

  moveToProject: (id, projectId) =>
    request(`/api/conversations/${id}/move-to-project`, {
      method: 'PATCH',
      body: JSON.stringify({ projectId }),
    }),
}

export const projectsApi = {
  list: () => request('/api/projects'),

  create: (name) =>
    request('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
}