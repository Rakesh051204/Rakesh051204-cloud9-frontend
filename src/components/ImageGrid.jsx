import { useState, useEffect, useMemo } from 'react';

const MAX_IMAGES = 7;
const LOAD_TIMEOUT_MS = 6000; // if an image hasn't loaded or errored by then, treat it as dead

// Filenames/paths that are almost always logos, icons, or sprites rather
// than real photos — drop these before they ever get a tile.
const JUNK_PATTERNS = /(logo|favicon|icon|sprite|placeholder|avatar-default|brand-mark|og-image|apple-touch)/i;

function getSrc(img) {
  return img.url || img.src;
}

function getProxiedSrc(url) {
  if (!url) return url;
  const bare = url.replace(/^https?:\/\//, '');
  return `https://images.weserv.nl/?url=${encodeURIComponent(bare)}&default=404`;
}

function looksLikeJunk(img) {
  const src = getSrc(img) || '';
  if (JUNK_PATTERNS.test(src)) return true;
  // Some search APIs return width/height in metadata — use it if present.
  if (img.width && img.height) {
    if (img.width < 200 || img.height < 200) return true; // too small to be a real photo
  }
  return false;
}

// images: [{ url, thumbnail, source, title, width?, height? }] — already validated server-side
export default function ImageGrid({ images = [], onImageClick }) {
  const [failed, setFailed] = useState({});

  // Pre-filter obvious junk, then cap to MAX_IMAGES so we never
  // render more than 7 regardless of what the backend sends.
  const candidates = useMemo(
    () => images.filter((img) => !looksLikeJunk(img)).slice(0, MAX_IMAGES),
    [images]
  );

  const visible = candidates.filter((_, i) => !failed[i]);
  if (visible.length === 0) return null; // nothing usable — render nothing, no blob

  const markFailed = (i) => setFailed((prev) => ({ ...prev, [i]: true }));

  // Single image: full width
  if (candidates.length === 1) {
    return (
      <div className="rounded-2xl overflow-hidden mb-3 w-full" style={{ aspectRatio: '16 / 9' }}>
        <ImgTile
          img={candidates[0]}
          onError={() => markFailed(0)}
          onClick={() => onImageClick?.(candidates[0])}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // 2+ images: ChatGPT layout — big left, stacked right (max 2 on the right,
  // remaining count shown as a badge on the last tile)
  const [main, ...rest] = candidates;
  const side = rest.slice(0, 2);
  const extraCount = candidates.length - 3; // images beyond the visible 3 tiles

  return (
    <div
      className="grid gap-1 rounded-2xl overflow-hidden mb-3 w-full"
      style={{ gridTemplateColumns: '2fr 1fr', aspectRatio: '16 / 9' }}
    >
      <ImgTile
        img={main}
        onError={() => markFailed(0)}
        onClick={() => onImageClick?.(main)}
        className="w-full h-full object-cover"
      />
      <div className="grid gap-1" style={{ gridTemplateRows: side.length === 2 ? '1fr 1fr' : '1fr' }}>
        {side.map((img, i) => {
          const isLast = i === side.length - 1;
          return (
            <ImgTile
              key={getSrc(img) || i}
              img={img}
              onError={() => markFailed(i + 1)}
              onClick={() => onImageClick?.(img)}
              className="w-full h-full object-cover"
              badge={isLast && extraCount > 0 ? `+${extraCount}` : null}
            />
          );
        })}
      </div>
    </div>
  );
}

function ImgTile({ img, onError, onClick, className, badge }) {
  const [loaded, setLoaded] = useState(false);
  const src = getProxiedSrc(getSrc(img));

  // If the image never fires onLoad or onError (hung request, slow CDN,
  // silently blocked), bail out after LOAD_TIMEOUT_MS instead of leaving
  // the skeleton spinning forever.
  useEffect(() => {
    if (loaded) return;
    const timer = setTimeout(() => onError(), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  if (!src) return null; // no usable src — skip instead of rendering broken

  return (
    <div className="relative bg-[#1a1a19] w-full h-full cursor-pointer" onClick={onClick}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-[#1a1a19]" />}
      <img
        src={src}
        alt={img.title || ''}
        className={className}
        referrerPolicy="no-referrer"
        // Not lazy: these tiles render above the fold as part of the
        // hero grid, so lazy-loading can deprioritize/stall them
        // depending on layout — load eagerly instead.
        loading="eager"
        onLoad={(e) => {
          // Extra runtime check: if the browser loaded something absurdly
          // small (a real logo can still slip past URL-pattern filtering),
          // treat it as junk instead of showing it.
          const { naturalWidth, naturalHeight } = e.target;
          if (naturalWidth < 120 || naturalHeight < 120) {
            onError();
            return;
          }
          setLoaded(true);
        }}
        onError={onError}
        style={{ display: 'block' }}
      />
      {loaded && badge && (
        <div
          className="absolute inset-0 flex items-center justify-center text-white text-lg font-medium"
          style={{ background: 'rgba(13,13,12,0.55)' }}
        >
          {badge}
        </div>
      )}
    </div>
  );
}