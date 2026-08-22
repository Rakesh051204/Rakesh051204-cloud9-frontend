import { useEffect, useState } from 'react'
import { X, ExternalLink, Loader2 } from 'lucide-react'

function detectPanelType(url) {
  try {
    const u = new URL(url)
    const host = u.hostname.replace('www.', '')

    if (host === 'youtube.com' || host === 'youtu.be') {
      const videoId = host === 'youtu.be'
        ? u.pathname.slice(1)
        : u.searchParams.get('v')
      return { type: 'video', embedUrl: `https://www.youtube.com/embed/${videoId}` }
    }
    if (host === 'vimeo.com') {
      const videoId = u.pathname.split('/').filter(Boolean)[0]
      return { type: 'video', embedUrl: `https://player.vimeo.com/video/${videoId}` }
    }
    const embeddableHosts = ['wikipedia.org', 'docs.google.com', 'codesandbox.io', 'github.io']
    if (embeddableHosts.some(h => host.endsWith(h))) {
      return { type: 'iframe', embedUrl: url }
    }
    return { type: 'blocked', embedUrl: url }
  } catch {
    return { type: 'blocked', embedUrl: url }
  }
}

export default function SidePanel({ isOpen, onClose, title, url }) {
  const [loading, setLoading] = useState(true)
  const [panelInfo, setPanelInfo] = useState(null)

  useEffect(() => {
    if (url) {
      setLoading(true)
      setPanelInfo(detectPanelType(url))
    }
  }, [url])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: 'min(480px, 100vw)',
        background: '#0A0A0A',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 220ms ease'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <span
          style={{
            color: '#EDEDED',
            fontSize: '14px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {title || 'Preview'}
        </span>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              color: '#7C83DB'
            }}
          >
            <ExternalLink size={16} />
          </a>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              color: '#9A9A9A',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5FB8D6'
            }}
          >
            <Loader2 size={22} className="animate-spin" />
          </div>
        )}

        {panelInfo && panelInfo.type === 'video' && (
          <iframe
            src={panelInfo.embedUrl}
            title={title}
            onLoad={() => setLoading(false)}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}

        {panelInfo && panelInfo.type === 'iframe' && (
          <iframe
            src={panelInfo.embedUrl}
            title={title}
            onLoad={() => setLoading(false)}
            style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
          />
        )}

        {panelInfo && panelInfo.type === 'blocked' && (
          <div
            style={{
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'center'
            }}
          >
            <p style={{ color: '#9A9A9A', fontSize: '14px' }}>
              This site does not allow in-app preview.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#5FB8D6',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none'
              }}
            >
              Open in new tab
            </a>
          </div>
        )}
      </div>
    </div>
  )
}