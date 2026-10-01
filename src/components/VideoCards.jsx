import { useState, useEffect } from 'react';
import { Play, X, ExternalLink } from 'lucide-react';

export default function VideoCards({ videos }) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e) => { if (e.key === 'Escape') setActive(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  if (!videos || videos.length === 0) return null;

  return (
    <div className="my-3">
      <div className="text-sm font-medium text-gray-200 mb-2">Watch the videos</div>
      <div className="flex flex-col gap-2">
        {videos.map((v, i) => (
          <button
            key={v.url || i}
            type="button"
            onClick={() => (v.embed ? setActive(v) : window.open(v.url, '_blank', 'noopener'))}
            className="flex items-center gap-3 p-2 rounded-xl bg-[#141413] border border-[#2a2a2a] hover:border-[#7C83DB] text-left transition-colors"
          >
            <div className="relative w-28 h-16 shrink-0 rounded-lg overflow-hidden bg-[#1f1f1d]">
              {v.thumbnail && <img src={v.thumbnail} alt="" className="w-full h-full object-cover" />}
              <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play size={18} className="text-white" />
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-sm text-gray-100 line-clamp-2">{v.title}</div>
              <div className="text-xs text-gray-500 mt-0.5 truncate">{v.source}{v.length ? ' - ' + v.length : ''}</div>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div onClick={() => setActive(null)} className="fixed inset-0 z-[1000] bg-black/85 flex items-center justify-center p-6">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl bg-[#0d0d0c] border border-[#2a2a2a] rounded-2xl p-3">
            <div className="flex items-center justify-between gap-3 mb-2 text-sm text-gray-300">
              <span className="truncate">{active.title}</span>
              <span className="flex items-center gap-2 shrink-0">
                <a href={active.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><ExternalLink size={16} /></a>
                <button type="button" onClick={() => setActive(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
              </span>
            </div>
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
              <iframe
                src={active.embed}
                title={active.title}
                className="w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}