import { useEffect, useState } from 'react';
import {
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageCircleQuestion,
  Globe,
} from 'lucide-react';

function SafeImg({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className={`${className} bg-white/[0.04]`} />;
  }
  return (
    <img
      src={src}
      alt={alt || ''}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

function getDomain(source) {
  try {
    return new URL(source.url).hostname.replace('www.', '');
  } catch (_) {
    return source.domain || '';
  }
}

function SourcePill({ source }) {
  const domain = getDomain(source);
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[11.5px] text-gray-300 max-w-full">
      {source.favicon && (
        <SafeImg src={source.favicon} alt="" className="w-3.5 h-3.5 rounded-sm flex-shrink-0" />
      )}
      <span className="truncate">{domain}</span>
    </span>
  );
}

function SourceCard({ source, onClick }) {
  return (
    <button
      onClick={() => onClick(source)}
      className="w-full text-left p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] transition-colors"
    >
      <div className="mb-1.5">
        <SourcePill source={source} />
      </div>
      <div className="text-[14px] font-medium text-white leading-snug line-clamp-2 mb-1">
        {source.title}
      </div>
      {source.snippet && (
        <div className="text-[12.5px] text-gray-400 leading-relaxed line-clamp-2">
          {source.snippet}
        </div>
      )}
    </button>
  );
}

function SourceDetail({ source, images, onBack }) {
  const domain = getDomain(source);
  const relatedImages = images ? images.slice(0, 3) : [];
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-white mb-3 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to sources</span>
      </button>
      {relatedImages.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 mb-4 rounded-xl overflow-hidden">
          {relatedImages.map((img, i) => (
            <SafeImg key={i} src={img.src} alt={img.alt || ''} className="w-full h-24 object-cover" />
          ))}
        </div>
      )}
      <div className="mb-2">
        <SourcePill source={source} />
      </div>
      <h3 className="text-[17px] font-semibold text-white mb-1 mt-2 leading-snug">
        {source.title}
      </h3>
      <span className="text-[12px] text-gray-500">{domain}</span>
      <p className="text-[14px] text-gray-300 leading-relaxed whitespace-pre-line mt-3">
        {source.content || source.snippet}
      </p>
      <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-[13px] text-[#7C83DB] hover:underline">
        Read full source -&gt;
      </a>
    </div>
  );
}

// Entity view: try to match the clicked name against sources/images
// already loaded for this answer. If nothing matches, offer a fallback
// that re-asks the model directly — same spirit as ChatGPT's canvas.
function EntityDetail({ name, sources, images, onBack, onAskMore }) {
  const lower = name.toLowerCase();
  const matchedSource = sources.find(
    (s) =>
      s.title?.toLowerCase().includes(lower) ||
      s.snippet?.toLowerCase().includes(lower) ||
      s.content?.toLowerCase().includes(lower)
  );
  const matchedImages = images.filter((img) =>
    (img.alt || img.sourceTitle || '').toLowerCase().includes(lower)
  );
  const displayImages = (matchedImages.length ? matchedImages : images).slice(0, 3);

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-white mb-3 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back</span>
      </button>

      {displayImages.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 mb-4 rounded-xl overflow-hidden">
          {displayImages.map((img, i) => (
            <SafeImg key={i} src={img.src} alt={img.alt || ''} className="w-full h-24 object-cover" />
          ))}
        </div>
      )}

      <h3 className="text-[17px] font-semibold text-white mb-2 mt-1 leading-snug">
        {name}
      </h3>

      {matchedSource ? (
        <>
          <div className="mb-2">
            <SourcePill source={matchedSource} />
          </div>
          <p className="text-[14px] text-gray-300 leading-relaxed whitespace-pre-line mt-2">
            {matchedSource.content || matchedSource.snippet}
          </p>
          <a href={matchedSource.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-[13px] text-[#7C83DB] hover:underline">
            Read full source -&gt;
          </a>
        </>
      ) : (
        <p className="text-[13.5px] text-gray-400 leading-relaxed">
          No details on {name} in this answer's sources yet.
        </p>
      )}

      <button
        onClick={() => onAskMore?.(name)}
        className="w-full flex items-center justify-center gap-2 mt-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-[13.5px] text-white transition-colors"
      >
        <MessageCircleQuestion size={15} />
        Tell me more about {name}
      </button>
    </div>
  );
}

function ImageCarousel({ images = [], onImageClick }) {
  const [index, setIndex] = useState(0);

  if (!images.length) {
    return (
      <div className="text-[13px] text-gray-500 text-center py-10">
        No images found for this answer.
      </div>
    );
  }

  const current = images[index];
  const goPrev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const goNext = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div>
      <div className="relative rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] mb-3">
        <button onClick={() => onImageClick(current)} className="block w-full">
          <SafeImg src={current.src} alt={current.alt || ''} className="w-full h-64 object-cover" />
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {(current.sourceTitle || current.alt) && (
        <div className="text-[12.5px] text-gray-400 mb-4 truncate">
          {current.sourceTitle || current.alt}
        </div>
      )}

      <div className="grid grid-cols-4 gap-1.5">
        {images.map((img, i) => (
          <button
            key={img.src || i}
            onClick={() => setIndex(i)}
            className={`rounded-lg overflow-hidden border transition-colors ${
              i === index ? 'border-[#7C83DB]' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <SafeImg src={img.src} alt="" className="w-full h-14 object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 text-[13.5px] font-medium border-b-2 transition-colors whitespace-nowrap ${
        active
          ? 'border-[#7C83DB] text-white'
          : 'border-transparent text-gray-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

export default function SourcesPanel({
  open,
  onClose,
  sources = [],
  images = [],
  focusedItem,
  onBack,
  onSelectSource,
  tab = 'sources',
  onTabChange,
  onImageClick,
  onAskMore,
}) {
  const isSourceDetail = focusedItem && focusedItem.type === 'source';
  const isEntityDetail = focusedItem && focusedItem.type === 'entity';
  const showDetail = isSourceDetail || isEntityDetail;

  // Steps tab was removed -- panel only ever shows Sources/Images now,
  // so if something upstream still passes tab="steps", fall back to sources.
  const effectiveTab = tab === 'steps' ? 'sources' : tab;

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const headerLabel = isEntityDetail ? 'About' : isSourceDetail ? 'Source' : 'Details';

  return (
    <div
      className={`h-full flex-shrink-0 bg-[#141414] border-l border-white/[0.08] overflow-hidden transition-[width] duration-300 ease-out ${
        open ? 'w-[420px] max-w-[90vw]' : 'w-0'
      }`}
    >
      <div className="w-[420px] max-w-[90vw] h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06] flex-shrink-0">
          <h2 className="text-[15px] font-semibold text-white">{headerLabel}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/[0.08] text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {!showDetail && (
          <div className="flex items-center px-2 border-b border-white/[0.06] flex-shrink-0 overflow-x-auto">
            <TabButton active={effectiveTab === 'sources'} onClick={() => onTabChange('sources')}>
              Sources ({sources.length})
            </TabButton>
            <TabButton active={effectiveTab === 'images'} onClick={() => onTabChange('images')}>
              Images ({images.length})
            </TabButton>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {isSourceDetail ? (
            <SourceDetail source={focusedItem.data} images={images} onBack={onBack} />
          ) : isEntityDetail ? (
            <EntityDetail
              name={focusedItem.data.name}
              sources={sources}
              images={images}
              onBack={onBack}
              onAskMore={onAskMore}
            />
          ) : effectiveTab === 'images' ? (
            <ImageCarousel images={images} onImageClick={onImageClick} />
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {sources.map((s, i) => (
                <SourceCard key={s.url || i} source={s} onClick={onSelectSource} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}