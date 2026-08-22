import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { getFaviconUrl } from '../utils/favicon';

function FaviconChip({ source }) {
  const [imgError, setImgError] = useState(false);
  const faviconUrl = getFaviconUrl(source);
  const showImg = faviconUrl && !imgError;
  return (
    <span className="w-5 h-5 rounded-full bg-[#1f1f1f] border border-[#141414] flex items-center justify-center overflow-hidden">
      {showImg && (
        <img
          src={faviconUrl}
          width="14" height="14"
          alt=""
          className="w-3.5 h-3.5"
          onError={() => setImgError(true)}
        />
      )}
    </span>
  );
}

// Images are rendered upstream by <ImageStrip /> inside AnswerCard.jsx
// (the hero + stacked-side layout). This component now only owns the
// "N sources" chip row — no image grid here, to avoid double-rendering
// the same images in two different layouts.
export default function SourceGallery({ sources = [], onOpenList }) {
  if (sources.length === 0) return null;
  return (
    <div className="mb-4">
      <div className="rounded-xl border border-white/[0.07] bg-[#141414] overflow-hidden">
     <button
  onClick={() => { console.log('PILL CLICKED', typeof onOpenList, onOpenList); onOpenList?.(); }}
          className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/[0.03] transition-colors"
        >
          <div className="flex -space-x-1.5">
            {sources.slice(0, 4).map((s, i) => (
              <FaviconChip key={i} source={s} />
            ))}
          </div>
          <span className="text-[13px] text-gray-300">
            {sources.length} source{sources.length !== 1 ? 's' : ''}
          </span>
          <span className="ml-auto text-gray-500">
            <ChevronRight size={14} />
          </span>
        </button>
      </div>
    </div>
  );
}