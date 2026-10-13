const mem = new Map();
const DB = "stoic-file-stash", ST = "files";

function openDb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(ST);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function idbPut(k, v) {
  try {
    const db = await openDb();
    await new Promise((res, rej) => {
      const tx = db.transaction(ST, "readwrite");
      tx.objectStore(ST).put(v, k);
      tx.oncomplete = res; tx.onerror = () => rej(tx.error);
    });
  } catch {}
}
async function idbGet(k) {
  try {
    const db = await openDb();
    return await new Promise((res, rej) => {
      const q = db.transaction(ST).objectStore(ST).get(k);
      q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error);
    });
  } catch { return undefined; }
}

export function stash(file) {
  if (!file || !file.name) return;
  const k1 = file.name + "|" + file.size;
  mem.set(k1, file); mem.set(file.name, file);
  idbPut(k1, file); idbPut(file.name, file);
}
export async function findStashed(name, size) {
  const keys = [size ? name + "|" + size : null, name].filter(Boolean);
  for (const k of keys) {
    if (mem.has(k)) return mem.get(k);
    const v = await idbGet(k);
    if (v) return v;
  }
  return null;
}

function grab(list) { Array.from(list || []).forEach(stash); }

if (typeof window !== "undefined" && !window.__stoicStashHooked) {
  window.__stoicStashHooked = true;
  const hook = (el) => {
    if (el.type === "file" && !el.__stashHooked) {
      el.__stashHooked = true;
      el.addEventListener("change", () => grab(el.files));
    }
  };
  const origClick = HTMLInputElement.prototype.click;
  HTMLInputElement.prototype.click = function (...a) { hook(this); return origClick.apply(this, a); };
  if (HTMLInputElement.prototype.showPicker) {
    const origShow = HTMLInputElement.prototype.showPicker;
    HTMLInputElement.prototype.showPicker = function (...a) { hook(this); return origShow.apply(this, a); };
  }
  document.addEventListener("change", (e) => { if (e.target && e.target.type === "file") grab(e.target.files); }, true);
  document.addEventListener("drop", (e) => grab(e.dataTransfer && e.dataTransfer.files), true);
  document.addEventListener("paste", (e) => grab(e.clipboardData && e.clipboardData.files), true);
}