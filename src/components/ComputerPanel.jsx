import { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink, FileText, Terminal, Image as ImageIcon, Monitor } from 'lucide-react';

export default function ComputerPanel({ scenes, onClose, isOpen }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const iframeRef = useRef(null);

  if (!isOpen) return null;

  const currentScene = scenes?.[currentIndex] || null;
  const total = scenes?.length || 0;

  const handlePrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setCurrentIndex((i) => Math.min(total - 1, i + 1));

  const renderViewport = () => {
    if (!currentScene) {
      return (
        <div className="w-full h-full flex items-center justify-center text-white/40">
          <div className="text-center">
            <Monitor size={48} className="mx-auto mb-4 opacity-20" />
            <p>No activity yet</p>
            <p className="text-sm text-white/20">Click the monitor button while the agent works</p>
          </div>
        </div>
      );
    }

    switch (currentScene.tool) {
      case 'browser':
        return (
          <div className="relative w-full h-full bg-black/90">
            {/* URL bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center gap-2 px-3 py-1.5 bg-black/80 z-10">
              <span className="text-xs text-white/50 truncate flex-1 font-mono">
                {currentScene.url || 'Loading...'}
              </span>
              {currentScene.url && (
                <a
                  href={currentScene.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/30 hover:text-white/80"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
            {/* Viewport */}
            <div className="w-full h-full pt-7">
              {currentScene.viewport ? (
                <img
                  src={currentScene.viewport}
                  alt="Screenshot"
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  ref={iframeRef}
                  src={currentScene.url || 'about:blank'}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                  loading="lazy"
                />
              )}
            </div>
            {/* Click overlay – opens the URL in new tab */}
            {currentScene.url && (
              <div
                className="absolute inset-0 cursor-pointer"
                onClick={() => window.open(currentScene.url, '_blank')}
              />
            )}
          </div>
        );

      case 'editor':
        return (
          <div className="w-full h-full bg-black/95 p-4 font-mono text-sm text-green-400 overflow-auto">
            <div className="flex items-center gap-2 mb-3 text-white/50 border-b border-white/10 pb-2">
              <FileText size={16} />
              <span>{currentScene.title || 'Editing...'}</span>
              {currentScene.progress !== undefined && (
                <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded">
                  {Math.round(currentScene.progress * 100)}%
                </span>
              )}
            </div>
            <pre className="whitespace-pre-wrap text-white/80 leading-relaxed">
              {currentScene.content || '// Writing content...'}
            </pre>
          </div>
        );

      case 'image':
        return (
          <div className="w-full h-full bg-black/90 flex items-center justify-center p-4">
            {currentScene.viewport ? (
              <img src={currentScene.viewport} alt="Generated" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-white/40 text-center">
                <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                <p>No image yet</p>
              </div>
            )}
          </div>
        );

      case 'terminal':
        return (
          <div className="w-full h-full bg-black/95 p-4 font-mono text-sm text-amber-400 overflow-auto">
            <div className="flex items-center gap-2 text-white/50 border-b border-white/10 pb-2 mb-2">
              <Terminal size={16} />
              <span>{currentScene.title || 'Terminal'}</span>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed">
              {currentScene.content || '$ '}
            </pre>
          </div>
        );

      default:
        return <div className="text-white/40 p-8">Unknown step</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      {/* Vintage CRT monitor bezel */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0A0A0A] rounded-xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Scanline overlay (CRT effect) */}
        <div className="absolute inset-0 pointer-events-none z-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCwwIEwxMDAsMCBMMTAwLDIgTDAsMiBaIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMDUpIi8+PC9zdmc+')] bg-repeat-y bg-[length:100%_4px] opacity-30" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40 z-10 relative">
          <div className="flex items-center gap-2 text-white/60">
            <Monitor size={18} />
            <span className="text-sm font-medium">Computer</span>
            <span className="text-xs text-white/30 ml-2">
              {total > 0 ? `${currentIndex + 1}/${total}` : 'Idle'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0 || total === 0}
              className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === total - 1 || total === 0}
              className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
            <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div className="flex-1 min-h-[400px] max-h-[70vh] overflow-hidden relative bg-black/90">
          {renderViewport()}
        </div>

        {/* Progress bar (if current scene has progress) */}
        {currentScene?.progress !== undefined && (
          <div className="w-full h-1 bg-white/5">
            <div
              className="h-full bg-white/20 transition-all duration-500"
              style={{ width: `${currentScene.progress * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}