import { useState } from 'react';
import { X, Copy, Download, Check } from 'lucide-react';
import GeminiCodeBlock from './GeminiCodeBlock';

const EXT_MAP = {
  javascript: 'js',
  jsx: 'jsx',
  typescript: 'ts',
  tsx: 'tsx',
  python: 'py',
  bash: 'sh',
  json: 'json',
  html: 'html',
  css: 'css',
  yaml: 'yml',
  text: 'txt',
};

export default function ArtifactPanel({ open, onClose, artifact }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!artifact?.code) return;
    navigator.clipboard.writeText(artifact.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!artifact?.code) return;
    const ext = EXT_MAP[artifact.language] || 'txt';
    const blob = new Blob([artifact.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(artifact.title || 'artifact').replace(/[^\w\-]/g, '_')}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`h-full flex-shrink-0 bg-[#141414] border-l border-white/[0.08] overflow-hidden transition-[width] duration-300 ease-out ${
        open ? 'w-[480px] max-w-[90vw]' : 'w-0'
      }`}
    >
      <div className="w-[480px] max-w-[90vw] h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06] flex-shrink-0">
          <h2 className="text-[15px] font-semibold text-white truncate pr-2">
            {artifact?.title || 'Artifact'}
          </h2>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-white/[0.08] text-gray-400 hover:text-white transition-colors"
              title="Copy"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-md hover:bg-white/[0.08] text-gray-400 hover:text-white transition-colors"
              title="Download"
            >
              <Download size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-white/[0.08] text-gray-400 hover:text-white transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {artifact ? (
            <GeminiCodeBlock language={artifact.language} code={artifact.code} />
          ) : (
            <div className="text-[13px] text-gray-500 text-center py-10">
              No artifact selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}