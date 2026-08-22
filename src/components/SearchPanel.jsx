import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, SquarePen, MessageSquare } from 'lucide-react';

function groupSessions(sessions) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const groups = { Today: [], Yesterday: [], 'Last 7 days': [], Older: [] };

  sessions.forEach((s) => {
    const ts = s.updatedAt || s.createdAt || s.timestamp;
    const d = ts ? new Date(ts) : null;
    if (!d || isNaN(d)) {
      groups.Older.push(s);
    } else if (d >= startOfToday) {
      groups.Today.push(s);
    } else if (d >= startOfYesterday) {
      groups.Yesterday.push(s);
    } else if (d >= sevenDaysAgo) {
      groups['Last 7 days'].push(s);
    } else {
      groups.Older.push(s);
    }
  });

  return Object.entries(groups).filter(([, items]) => items.length > 0);
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d)) return '';
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function snippetFor(session) {
  const msgs = session.messages || [];
  const last = msgs[msgs.length - 1];
  if (!last) return 'No messages yet';
  const text = (last.content || '').replace(/\s+/g, ' ').trim();
  return text.length > 70 ? text.slice(0, 70) + '...' : text;
}

export default function SearchPanel({ open, onClose, sessions = [], onSelectSession, onNewChat }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      const onKey = (e) => e.key === 'Escape' && onClose?.();
      window.addEventListener('keydown', onKey);
      return () => {
        clearTimeout(t);
        window.removeEventListener('keydown', onKey);
      };
    }
  }, [open, onClose]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? sessions.filter(
          (s) =>
            (s.title || 'Untitled').toLowerCase().includes(q) ||
            snippetFor(s).toLowerCase().includes(q)
        )
      : sessions;
    return groupSessions(filtered);
  }, [sessions, query]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/60 flex justify-center items-start pt-[10vh]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[640px] max-w-[90vw] max-h-[70vh] bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#232323]">
          <Search size={18} className="text-gray-500 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats..."
            className="flex-1 bg-transparent outline-none text-[15px] text-white placeholder-gray-500"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <button
          onClick={() => {
            onClose?.();
            onNewChat?.();
          }}
          className="flex items-center gap-2.5 px-4 py-3 text-[14px] text-white hover:bg-white/[0.05] transition-colors text-left border-b border-[#232323]"
        >
          <SquarePen size={16} className="text-[#7C83DB]" />
          New task
        </button>

        <div className="overflow-y-auto py-1">
          {grouped.length === 0 && (
            <p className="px-4 py-6 text-[13px] text-gray-500">
              {query ? `No chats matching "${query}"` : 'No chats yet'}
            </p>
          )}
          {grouped.map(([label, items]) => (
            <div key={label}>
              <h4 className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wide text-gray-500">
                {label}
              </h4>
              {items.map((session) => (
                <button
                  key={session.id}
                  onClick={() => {
                    onClose?.();
                    onSelectSession?.(session.id);
                  }}
                  className="w-full flex items-start gap-2.5 px-4 py-2 hover:bg-white/[0.05] transition-colors text-left"
                >
                  <MessageSquare size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] text-white truncate">{session.title || 'Untitled'}</div>
                    <div className="text-[12.5px] text-gray-500 truncate">{snippetFor(session)}</div>
                  </div>
                  <span className="text-[11px] text-gray-500 flex-shrink-0 pt-0.5">
                    {formatTime(session.updatedAt || session.createdAt || session.timestamp)}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}