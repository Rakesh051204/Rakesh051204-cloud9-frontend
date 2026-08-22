import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
export default function ImageLightbox({ images = [], index, onClose, onNavigate }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate(Math.max(0, index - 1));
      if (e.key === 'ArrowRight') onNavigate(Math.min(images.length - 1, index + 1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [index, images.length, onClose, onNavigate]);
  if (index == null || !images[index]) return null;
  const img = images[index];
  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-white/[0.1] text-white transition-colors"
        >
          <X size={22} />
        </button>
        <span className="text-[14px] text-gray-300">
          {index + 1} / {images.length}
        </span>
        <div className="w-9" />
      </div>
      <div className="flex-1 flex items-center justify-center px-16 relative min-h-0">
        {index > 0 && (
          <button
            onClick={() => onNavigate(index - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <img
          src={img.src}
          alt={img.alt || ''}
          className="max-h-full max-w-full object-contain rounded-lg"
        />
        {index < images.length - 1 && (
          <button
            onClick={() => onNavigate(index + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white transition-colors"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>
      {(img.alt || img.sourceTitle || img.sourceUrl) && (
        <div className="px-6 py-4 flex-shrink-0">
          {img.sourceUrl ? (
            <a
              href={img.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[13px] text-gray-400 hover:text-white transition-colors w-fit"
            >
              {img.favicon && <img src={img.favicon} alt="" className="w-4 h-4 rounded-sm" />}
              <span className="truncate max-w-md">{img.sourceTitle || img.alt}</span>
            </a>
          ) : (
            <p className="text-[13px] text-gray-400">{img.alt}</p>
          )}
        </div>
      )}
    </div>
  );
}
