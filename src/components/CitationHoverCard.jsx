import { useState, useRef } from 'react';
import { ExternalLink } from 'lucide-react';

const OPEN_DELAY = 120;
const CLOSE_DELAY = 150;

export default function CitationHoverCard({ source, index, children }) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState('top');
  const openTimer = useRef(null);
  const closeTimer = useRef(null);
  const wrapperRef = useRef(null);

  if (!source) return children;

  const handleEnter = () => {
    clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => {
      const rect = wrapperRef.current ? wrapperRef.current.getBoundingClientRect() : null;
      if (rect && rect.top < 160) setPlacement('bottom');
      else setPlacement('top');
      setOpen(true);
    }, OPEN_DELAY);
  };

  const handleLeave = () => {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  };

  return (
    <span
      ref={wrapperRef}
      className="relative inline-block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <a
        href={source.url}
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center justify-center align-super w-[15px] h-[15px] mx-0.5 rounded-full text-[10px] font-medium bg-white/[0.08] text-gray-300 hover:bg-[#7C83DB] hover:text-white transition-colors no-underline`}
      >
        {index != null ? index : children}
      </a>

      {open && (
        <div
          className={`absolute z-50 left-1/2 -translate-x-1/2 w-72 ${placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} bg-[#131314] border border-white/[0.08] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.5)] p-3`}
          onMouseEnter={() => clearTimeout(closeTimer.current)}
          onMouseLeave={handleLeave}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <img
              src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=32`}
              alt=""
              className="w-4 h-4 rounded-sm shrink-0"
            />
            <span className="text-[12px] text-gray-500 truncate">{source.domain}</span>
          </div>

          <p className="text-[13px] font-medium text-white leading-snug line-clamp-2 mb-1">
            {source.title}
          </p>

          {source.snippet && (
            <p className="text-[12px] text-gray-400 leading-relaxed line-clamp-3 mb-2">
              {source.snippet}
            </p>
          )}

          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-1 text-[12px] font-medium text-[#7C83DB] hover:text-[#9AA0EE] transition-colors`}
          >
            Visit source
            <ExternalLink size={11} strokeWidth={2.5} />
          </a>

          <div
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-[#131314] border-white/[0.08] rotate-45 ${placement === 'top' ? 'top-full -mt-1 border-r border-b' : 'bottom-full -mb-1 border-l border-t'}`}
          />
        </div>
      )}
    </span>
  );
}