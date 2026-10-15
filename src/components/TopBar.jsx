import { useState } from 'react';
import { Users, Share2, ChevronDown } from 'lucide-react';

export default function TopBar({ title = 'New chat', onShare }) {
  const [incognito, setIncognito] = useState(false);

  return (
    <div className="flex items-center justify-between px-6 py-3">
      {/* Chat title — becomes the first message once a chat starts, like Claude */}
      <button className="flex items-center gap-1 text-[14px] font-medium text-white hover:bg-[#161616] rounded-md px-2 py-1 -ml-2 transition-colors">
        <span className="truncate max-w-[280px]">{title}</span>
        <ChevronDown size={14} className="text-gray-500" />
      </button>

      <div className="flex items-center gap-3">
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

        <button
          onClick={onShare}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#161616] rounded-full transition-colors"
          title="Share"
        >
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
}