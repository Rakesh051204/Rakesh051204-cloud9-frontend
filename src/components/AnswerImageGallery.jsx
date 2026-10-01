import { useState } from 'react';

// void-and-clay tokens
const C = {
  surface: '#161615',
  border: 'rgba(255,255,255,0.08)',
  textSecondary: 'rgba(237,237,234,0.6)',
};

/**
 * ChatGPT-style entity image gallery: 1 big hero (left) + 2 stacked (right).
 *
 * Matches the shape MessageBubble's normalizeImages() produces:
 *   images: [{ src, alt, sourceUrl, sourceTitle, favicon }]
 */
export default function AnswerImageGallery({ images = [], onImageClick }) {
  if (!images || images.length === 0) return null;

  const [hero, side1, side2] = images;
  const sideImages = [side1, side2].filter(Boolean);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 6,
        width: '100%',
        maxWidth: 560,
        aspectRatio: '2 / 1.05',
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 18,
      }}
    >
      <GalleryImage
        img={hero}
        index={0}
        onImageClick={onImageClick}
        style={{ gridRow: '1 / 3', gridColumn: '1 / 2' }}
      />
      {sideImages.map((img, i) => (
        <GalleryImage
          key={img.src || i}
          img={img}
          index={i + 1}
          onImageClick={onImageClick}
          style={{ gridRow: `${i + 1} / ${i + 2}`, gridColumn: '2 / 3' }}
        />
      ))}
      {sideImages.length === 1 && (
        <div
          style={{
            gridRow: '2 / 3',
            gridColumn: '2 / 3',
            background: C.surface,
          }}
        />
      )}
    </div>
  );
}

function GalleryImage({ img, index, onImageClick, style }) {
  const [status, setStatus] = useState('loading'); // loading | loaded | error

  if (!img || !img.src) {
    return <div style={{ ...style, background: C.surface }} />;
  }

  return (
    <div
      onClick={() => onImageClick?.(index)}
      style={{
        ...style,
        position: 'relative',
        background: C.surface,
        cursor: onImageClick ? 'pointer' : 'default',
      }}
    >
      {status !== 'loaded' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: C.surface,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {status === 'error' && (
            <span style={{ fontSize: 11, color: C.textSecondary }}>
              {img.sourceTitle || 'image unavailable'}
            </span>
          )}
        </div>
      )}
      <img
        src={img.src}
        alt={img.alt || ''}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: status === 'loaded' ? 'block' : 'none',
        }}
      />
    </div>
  );
}