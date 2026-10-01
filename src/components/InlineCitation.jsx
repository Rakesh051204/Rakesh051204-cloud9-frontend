import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

// ChatGPT-style inline citation: a small pill showing the SOURCE NAME
// (favicon + site name, e.g. "Business Insider"), not a numeric index.
// If `extraCount` is passed (other sources backing the same claim),
// it renders as "Business Insider +1" — matching the reference video.
export default function InlineCitation({ source, extraCount = 0, onOpen }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);
  const timerRef = useRef(null);

  if (!source) return null;

  const domain = (() => {
    try {
      return new URL(source.url).hostname.replace('www.', '');
    } catch (_) {
      return source.domain || '';
    }
  })();

  // Prefer a human-readable site name over the raw domain when we have
  // one (e.g. "Business Insider" instead of "businessinsider.com").
  const displayName = source.siteName || source.name || domain;

  const handleEnter = () => {
    clearTimeout(timerRef.current);
    const rect = ref.current.getBoundingClientRect();
    setPos({
      top: rect.top + window.scrollY - 8,
      left: rect.left + window.scrollX,
    });
    timerRef.current = setTimeout(() => setShow(true), 180);
  };

  const handleLeave = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShow(false), 150);
  };

  return (
    <span
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={() => onOpen?.(source)}
      className="inline-flex items-center gap-1 align-middle mx-1 px-2 py-0.5
                 rounded-full bg-white/[0.06] hover:bg-white/[0.12] cursor-pointer
                 text-[11.5px] font-medium text-gray-300 hover:text-white transition-colors
                 whitespace-nowrap"
    >
      {source.favicon && (
        <img src={source.favicon} alt="" className="w-3.5 h-3.5 rounded-sm shrink-0" />
      )}
      <span className="truncate max-w-[140px]">{displayName}</span>
      {extraCount > 0 && (
        <span className="text-gray-500">+{extraCount}</span>
      )}

      {show &&
        createPortal(
          <div
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            style={{ top: pos.top, left: pos.left, transform: 'translateY(-100%)' }}
            className="fixed z-[9999] w-72 bg-[#1a1a1a] border border-white/[0.08]
                       rounded-xl shadow-2xl p-3 pointer-events-auto"
          >
            <div className="flex items-center gap-2 mb-1.5">
              {source.favicon && (
                <img src={source.favicon} alt="" className="w-4 h-4 rounded-sm" />
              )}
              <span className="text-[12px] text-gray-400 truncate">{domain}</span>
            </div>
            <div className="text-[13.5px] font-medium text-white leading-snug line-clamp-2">
              {source.title}
            </div>
            {source.snippet && (
              <div className="text-[12px] text-gray-400 mt-1.5 leading-relaxed line-clamp-3">
                {source.snippet}
              </div>
            )}
          </div>,
          document.body
        )}
    </span>
  );
}