import { Code2, ChevronRight } from 'lucide-react';

export default function ArtifactCard({ language, code, title, onOpen }) {
  const lines = code ? code.split('\n').length : 0;

  return (
    <button
      onClick={onOpen}
      className="w-full flex items-center gap-3 my-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-colors text-left"
    >
      <div className="w-9 h-9 rounded-lg bg-[#7C83DB]/15 flex items-center justify-center flex-shrink-0">
        <Code2 size={17} className="text-[#7C83DB]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-medium text-white truncate">{title}</div>
        <div className="text-[12px] text-gray-500">
          {(language || 'text').toUpperCase()} · {lines} line{lines === 1 ? '' : 's'}
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-500 flex-shrink-0" />
    </button>
  );
}