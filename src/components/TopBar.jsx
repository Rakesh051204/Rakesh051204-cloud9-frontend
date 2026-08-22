import { useState } from 'react';
import { Users, Share2 } from 'lucide-react';

export default function TopBar({ onShare }) {
  const [incognito, setIncognito] = useState(false);

  return (
    <div className="flex items-center justify-end gap-3 px-6 py-3">
      {/* Incognito toggle */}
      <button
        onClick={() => setIncognito(!incognito)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
          incognito
            ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
            : 'text-gray-400 hover:text-white hover:bg-[#161616]'
        }`}
      >
        <Users size={14} />
        <span>{incognito ? 'Incognito' : 'Public'}</span>
      </button>

      {/* Share button */}
      <button
        onClick={onShare}
        className="p-2 text-gray-400 hover:text-white hover:bg-[#161616] rounded-full transition-colors"
        title="Share"
      >
        <Share2 size={18} />
      </button>
    </div>
  );
}