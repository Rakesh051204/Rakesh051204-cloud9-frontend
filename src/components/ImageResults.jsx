// ImageResults.jsx
// Hero + side-stack image layout for answer results, with a full
// "view all" gallery and a fullscreen lightbox.
// Matches Stoic's monochrome (black/white) design system.
//
// Expected shape per image object (all optional except url):
// {
//   url: "https://...jpg",       // the image itself
//   title: "Retrato de Newton",  // caption shown in lightbox
//   source: "cervantesvirtual",  // site name shown in lightbox
//   sourceUrl: "https://..."     // page the image came from (clickable link-through)
// }
//
// No cap on how many images you pass in. First 3 render as the
// hero/side-stack preview; if there are more, a "View all" tile
// opens a full grid, and any image opens the fullscreen lightbox.

import { useState, useEffect, useCallback } from 'react'

function domainLabel(item) {
  if (item.source) return item.source
  if (item.sourceUrl) {
    try {
      return new URL(item.sourceUrl).hostname.replace(/^www\./, '')
    } catch {
      return null
    }
  }
  return null
}

// Small monochrome initial-letter badge instead of fetching a favicon
// from an external service — that network call is what was causing
// the hang. Zero external dependency, renders instantly.
function SourceBadge({ label }) {
  const letter = label ? label.charAt(0).toUpperCase() : '?'
  return (
    <span className="w-4 h-4 rounded-full bg-neutral-700 text-neutral-200 text-[9px] font-semibold flex items-center justify-center shrink-0">
      {letter}
    </span>
  )
}

// Image with a loading skeleton and a graceful broken-link fallback,
// so a bad URL shows an icon instead of hanging as a blank box.
function SafeImage({ src, alt, className }) {
  const [status, setStatus] = useState('loading') // loading | loaded | error

  return (
    <div className={`relative ${className} bg-neutral-900`}>
      {status !== 'error' && (
        <img
          src={src}
          alt={alt || ''}
          loading="lazy"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={`w-full h-full object-cover transition-opacity duration-150 ${
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {status === 'loading' && (
        <div className="absolute inset-0 animate-pulse bg-neutral-800" />
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-xs">
          image unavailable
        </div>
      )}
    </div>
  )
}

export default function ImageResults({ images }) {
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [showAll, setShowAll] = useState(false)

  if (!images || images.length === 0) return null

  const [hero, ...rest] = images
  const sideImages = rest.slice(0, 2)
  const remaining = images.length - 3 // beyond hero + 2 side, could be negative

  const openLightbox = (idx) => setLightboxIndex(idx)
  const closeLightbox = () => setLightboxIndex(null)

  return (
    <div className="mb-4">
      <div className="flex gap-2" style={{ height: '260px' }}>
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="flex-1 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <SafeImage src={hero.url} alt={hero.title} className="w-full h-full" />
        </button>

        {sideImages.length > 0 && (
          <div className="flex flex-col gap-2 w-1/3">
            {sideImages.map((img, i) => {
              const isLast = i === sideImages.length - 1
              const showOverlay = isLast && remaining > 0
              return (
                <button
                  type="button"
                  key={i}
                  onClick={() =>
                    showOverlay ? setShowAll(true) : openLightbox(i + 1)
                  }
                  className="flex-1 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-600 transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  <SafeImage
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full"
                  />
                  {showOverlay && (
                    <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        View all {images.length}
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {showAll && (
        <AllImagesGrid
          images={images}
          onClose={() => setShowAll(false)}
          onSelect={(idx) => {
            setShowAll(false)
            openLightbox(idx)
          }}
        />
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={closeLightbox}
        />
      )}
    </div>
  )
}

function AllImagesGrid({ images, onClose, onSelect }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 shrink-0 border-b border-neutral-800">
        <span className="text-white text-sm font-medium">
          {images.length} images
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-white text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10"
        >
          ×
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {images.map((img, i) => (
            <button
              type="button"
              key={i}
              onClick={() => onSelect(i)}
              className="aspect-square rounded-lg overflow-hidden border border-neutral-800 hover:border-neutral-600 transition-colors"
            >
              <SafeImage src={img.url} alt={img.title} className="w-full h-full" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Lightbox({ images, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex)
  const current = images[index]
  const total = images.length

  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total])
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + total) % total),
    [total]
  )

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  const label = domainLabel(current)

  // Deliberately a <div onClick> that opens the link via window.open,
  // rather than an <a> nested in the backdrop's click handler — that
  // nesting was why source clicks weren't registering before.
  const openSource = () => {
    if (current.sourceUrl) {
      window.open(current.sourceUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white transition-colors"
        >
          ×
        </button>
        <span className="text-sm text-neutral-300 tabular-nums">
          {index + 1} / {total}
        </span>
        <div className="w-9 h-9" />
      </div>

      <div className="relative flex-1 flex items-center justify-center px-4 md:px-16">
        {total > 1 && (
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 md:left-6 w-10 h-10 rounded-full bg-neutral-800/80 hover:bg-neutral-700 flex items-center justify-center text-white transition-colors z-10"
          >
            ‹
          </button>
        )}

        <img
          src={current.url}
          alt={current.title || ''}
          className="max-h-full max-w-full object-contain rounded-md"
        />

        {total > 1 && (
          <button
            type="button"
            onClick={next}
            className="absolute right-2 md:right-6 w-10 h-10 rounded-full bg-neutral-800/80 hover:bg-neutral-700 flex items-center justify-center text-white transition-colors z-10"
          >
            ›
          </button>
        )}
      </div>

      {(label || current.title) && (
        <div className="px-5 py-4 shrink-0 border-t border-neutral-800">
          {label && (
            <button
              type="button"
              onClick={openSource}
              disabled={!current.sourceUrl}
              className="flex items-center gap-2 mb-1 disabled:cursor-default"
            >
              <SourceBadge label={label} />
              <span className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors">
                {label}
              </span>
            </button>
          )}
          {current.title && (
            <p className="text-sm text-white font-medium leading-snug">
              {current.title}
            </p>
          )}
        </div>
      )}
    </div>
  )
}