// ImageStrip.jsx
// ChatGPT-style layout: one large hero image + a grid of up to 6 more
// thumbnails beside it (2 columns x 3 rows), with a total-count badge
// on the last visible thumbnail when there are more results than fit.
// Clicking any image opens the full lightbox gallery, which scrolls
// through every image the backend returned — not just the visible ones.
// Expects `images` in the shape your backend already returns from
// deepSearch(): [{ url, description }]
import React, { useState } from 'react';

const MAX_GRID_THUMBS = 6; // hero + up to 6 = 7 visible, matches ChatGPT's layout

// Some image URLs from search engines fail to load (hotlink protection,
// dead links, CORS, etc). Without this, a failed <img> falls back to the
// browser's default broken-image rendering, which draws the alt text
// directly over the image area — that's what was causing the "half image
// with overlapping text" look. This shows a clean placeholder instead
// and skips the broken image everywhere it's used (hero, grid, lightbox,
// filmstrip) instead of just failing silently in one spot.
function SafeImg({ src, alt, className, onClick, title }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`${className} image-fallback`}
        onClick={onClick}
        title={title}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ''}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
      onClick={onClick}
      title={title}
    />
  );
}

export default function ImageStrip({ images = [] }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!images || images.length === 0) return null;

  // Backend (searchPipeline.js) sends { src, alt }. Normalize here so this
  // component works no matter which shape comes through.
  const normalized = images.map((img) => ({
    url: img.url || img.src,
    description: img.description || img.alt || '',
  }));

  const [hero, ...rest] = normalized;
  const gridImages = rest.slice(0, MAX_GRID_THUMBS);
  const totalCount = normalized.length;
  const remaining = totalCount - (1 + gridImages.length);

  // 2 columns is the ChatGPT look for <=4 side thumbs; once we have 5-6
  // we still keep 2 columns but it grows to 3 rows instead of getting
  // cramped into more columns.
  const gridCols = gridImages.length > 2 ? 2 : 1;

  return (
    <div className="image-hero-wrap">
      <div className="image-hero-row">
        <button
          className="image-hero-main"
          onClick={() => setLightboxIndex(0)}
          title={hero.description || ''}
        >
          <SafeImg
            src={hero.url}
            alt={hero.description || 'result 1'}
            className="image-hero-main-img"
          />
          {totalCount > 1 && (
            <div className="image-hero-count-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span>{totalCount}</span>
            </div>
          )}
        </button>

        {gridImages.length > 0 && (
          <div
            className="image-hero-side"
            style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
          >
            {gridImages.map((img, i) => {
              const isLastVisible = i === gridImages.length - 1;
              const showOverlay = isLastVisible && remaining > 0;
              return (
                <button
                  key={i}
                  className="image-hero-side-item"
                  onClick={() => setLightboxIndex(i + 1)}
                  title={img.description || ''}
                >
                  <SafeImg
                    src={img.url}
                    alt={img.description || `result ${i + 2}`}
                    className="image-hero-side-img"
                  />
                  {showOverlay && (
                    <div className="image-hero-overlay">+{remaining}</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <ImageLightboxInline
          images={normalized}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <style>{`
        .image-hero-wrap {
          margin: 4px 0 18px 0;
        }
        .image-hero-row {
          display: flex;
          gap: 10px;
          height: 260px;
        }
        .image-hero-main {
          flex: 1.4;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          background: #17171A;
          padding: 0;
          cursor: pointer;
          position: relative;
        }
        .image-hero-main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .image-hero-count-badge {
          position: absolute;
          right: 10px;
          bottom: 10px;
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          color: #F2F2F0;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 9999px;
        }
        .image-hero-side {
          display: grid;
          gap: 10px;
          width: 42%;
          height: 100%;
        }
        .image-hero-side-item {
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          background: #17171A;
          padding: 0;
          cursor: pointer;
          position: relative;
          width: 100%;
          height: 100%;
        }
        .image-hero-side-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .image-hero-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #E8E6E1;
          font-size: 15px;
          font-weight: 500;
        }
        /* Broken-image placeholder — replaces the browser's default
           alt-text-over-broken-icon rendering everywhere SafeImg is used. */
        .image-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #6b6b70;
          background: #141416;
          font-size: 11px;
          text-align: center;
          padding: 8px;
        }
        @media (max-width: 640px) {
          .image-hero-row {
            height: 200px;
          }
          .image-hero-side {
            width: 33%;
          }
        }
      `}</style>
    </div>
  );
}

// Lightweight inline lightbox so this file works standalone even if you
// don't wire up ImageLightbox.jsx separately. If you already have
// ImageLightbox.jsx doing this, you can swap this out for that import
// instead — same props: images, startIndex, onClose.
function ImageLightboxInline({ images, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const current = images[index];

  const next = (e) => {
    e.stopPropagation();
    setIndex((i) => (i + 1) % images.length);
  };
  const prev = (e) => {
    e.stopPropagation();
    setIndex((i) => (i - 1 + images.length) % images.length);
  };

  return (
    <div className="image-lightbox-backdrop" onClick={onClose}>
      <div className="image-lightbox-topbar">
        <span>{index + 1} / {images.length}</span>
      </div>
      <button className="image-lightbox-close" onClick={onClose}>×</button>
      {images.length > 1 && (
        <button className="image-lightbox-arrow image-lightbox-arrow--left" onClick={prev}>‹</button>
      )}
      <div className="image-lightbox-body" onClick={(e) => e.stopPropagation()}>
        <SafeImg
          src={current.url}
          alt={current.description || 'Image'}
          className="image-lightbox-main-img"
        />
        <div className="image-lightbox-caption">
          {current.description && <div>{current.description}</div>}
        </div>
      </div>
      {images.length > 1 && (
        <button className="image-lightbox-arrow image-lightbox-arrow--right" onClick={next}>›</button>
      )}
      {/* Filmstrip of every image (not just the ones visible in the grid) */}
      {images.length > 1 && (
        <div className="image-lightbox-strip" onClick={(e) => e.stopPropagation()}>
          {images.map((img, i) => (
            <button
              key={i}
              className={`image-lightbox-strip-item ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
            >
              <SafeImg src={img.url} alt="" className="image-lightbox-strip-img" />
            </button>
          ))}
        </div>
      )}
      <style>{`
        .image-lightbox-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.92);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .image-lightbox-topbar {
          position: absolute;
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(242,242,240,0.6);
          font-size: 13px;
        }
        .image-lightbox-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: transparent;
          border: none;
          color: #E8E6E1;
          font-size: 26px;
          cursor: pointer;
        }
        .image-lightbox-close:hover { background: rgba(255,255,255,0.1); }
        .image-lightbox-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: transparent;
          border: none;
          color: #E8E6E1;
          font-size: 30px;
          cursor: pointer;
        }
        .image-lightbox-arrow:hover { background: rgba(255,255,255,0.1); }
        .image-lightbox-arrow--left { left: 16px; }
        .image-lightbox-arrow--right { right: 16px; }
        .image-lightbox-body {
          max-width: 800px;
          max-height: 74vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .image-lightbox-main-img {
          max-width: 100%;
          max-height: 64vh;
          object-fit: contain;
          border-radius: 10px;
        }
        .image-lightbox-body .image-fallback {
          width: 400px;
          height: 300px;
          max-width: 80vw;
          border-radius: 10px;
          font-size: 14px;
        }
        .image-lightbox-caption {
          color: #9A9890;
          font-size: 13px;
          text-align: center;
        }
        .image-lightbox-strip {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          max-width: 90vw;
          overflow-x: auto;
          padding: 4px;
        }
        .image-lightbox-strip-item {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid transparent;
          padding: 0;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.15s, border-color 0.15s;
        }
        .image-lightbox-strip-item.active {
          opacity: 1;
          border-color: #7C83DB;
        }
        .image-lightbox-strip-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .image-lightbox-strip-item .image-fallback {
          font-size: 0;
        }
        .image-lightbox-strip-item .image-fallback svg {
          width: 14px;
          height: 14px;
        }
      `}</style>
    </div>
  );
}