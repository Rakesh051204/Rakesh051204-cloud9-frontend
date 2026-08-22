// src/utils/favicon.js
// Single source of truth for favicon resolution, used by both
// SourceGallery (source-count row) and InlineCitation (inline pills).
// Previously these two used different fields (s.url vs source.domain),
// so the same source could show a favicon in one place and nothing in
// the other. This resolves domain first, falls back to parsing url.

export function getHostname(source) {
  if (source?.domain) return source.domain.replace(/^www\./, '');
  if (source?.url) {
    try {
      return new URL(source.url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }
  return '';
}

// sz=64 requested regardless of display size — letting CSS scale a
// larger fetched icon DOWN looks sharp; requesting a tiny sz and
// scaling UP is what caused the blur/blank look.
export function getFaviconUrl(source) {
  const hostname = getHostname(source);
  if (!hostname) return null;
  return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
}