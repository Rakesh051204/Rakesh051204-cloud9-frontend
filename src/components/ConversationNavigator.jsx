import { useState, useEffect } from 'react';

// ---------------------------------------------------------------------------
// ConversationNavigator — right-rail tick minimap + jump popover
// messages: your real `messages` array — [{ id, role: 'user'|'assistant', content }]
// activeId: id of the message currently in view
// onJump: (id) => void — scroll to that message
// hidden: pass true to hide it (e.g. while SourcesPanel is open)
// ---------------------------------------------------------------------------
export function ConversationNavigator({ messages, activeId, onJump, hidden }) {
  const [hovered, setHovered] = useState(false);

  if (hidden) return null;

  const userTurns = messages.filter((m) => m.role === 'user');

  return (
    <div
      className="hidden md:flex flex-col items-end fixed right-4 top-1/2 -translate-y-1/2 z-20"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div className="mb-2 w-64 max-h-72 overflow-y-auto rounded-lg border border-[#2a2a2a] bg-[#141414]/95 backdrop-blur shadow-lg py-1">
          {userTurns.map((m) => (
            <button
              key={m.id}
              onClick={() => onJump?.(m.id)}
              className={`w-full text-left px-3 py-2 text-[13px] truncate transition-colors ${
                m.id === activeId
                  ? 'bg-[#232323] text-amber-300'
                  : 'text-gray-300 hover:bg-[#1a1a1a]'
              }`}
              title={m.content}
            >
              {m.content || '(attachment)'}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-[3px] pr-0.5">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          const isActive = m.id === activeId;
          return (
            <button
              key={m.id}
              onClick={() => onJump?.(m.id)}
              aria-label={`Jump to ${isUser ? 'your message' : 'response'}`}
              className="p-0.5 group/tick"
            >
              <span
                className={`block rounded-full transition-all ${
                  isActive
                    ? 'bg-amber-400 w-4 h-[3px]'
                    : isUser
                    ? 'bg-gray-500 w-3 h-[3px] group-hover/tick:bg-gray-300'
                    : 'bg-[#333] w-3 h-[3px] group-hover/tick:bg-gray-500'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// useActiveMessageTracking — keeps activeId in sync as the user scrolls
// containerRef: your existing scrollContainerRef from Home.jsx
// messageRefs: a ref object like { current: {} } — one DOM node per message id
// ---------------------------------------------------------------------------
export function useActiveMessageTracking(containerRef, messageRefs, setActiveId) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      let closest = null;
      let closestDist = Infinity;
      Object.entries(messageRefs.current).forEach(([id, el]) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top - 120);
        if (dist < closestDist) {
          closestDist = dist;
          closest = id;
        }
      });
      if (closest) setActiveId(closest);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => container.removeEventListener('scroll', onScroll);
  }, [containerRef, messageRefs, setActiveId]);
}