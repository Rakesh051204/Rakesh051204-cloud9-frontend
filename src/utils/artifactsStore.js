const STORAGE_KEY = 'stoic_artifacts';

export function getArtifacts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// Creates or updates an artifact by id. Called every render while a
// message is streaming/settling, so it's cheap and idempotent -- only
// writes to localStorage when the code actually changed.
export function saveArtifact(artifact) {
  const list = getArtifacts();
  const idx = list.findIndex((a) => a.id === artifact.id);
  const now = Date.now();

  if (idx >= 0) {
    const existing = list[idx];
    if (existing.code === artifact.code && existing.title === artifact.title) {
      return list; // no-op, nothing changed
    }
    list[idx] = { ...existing, ...artifact, updatedAt: now };
  } else {
    list.unshift({ ...artifact, createdAt: now, updatedAt: now });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list;
}

export function deleteArtifact(id) {
  const list = getArtifacts().filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list;
}