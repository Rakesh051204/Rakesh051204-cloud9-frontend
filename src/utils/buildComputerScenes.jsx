function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; }
}

function searchScene(step, sources) {
  const top = sources.slice(0, 3);
  return {
    tool: 'search',
    sub: "Stoic is using Search",
    path: 'stoic.search — live web results',
    label: step.text,
    render: () => (
      <>
        {top.length > 0 ? top.map((s, i) => (
          <div className="result-line" key={s.url || i}>
            <div className="result-domain">{getDomain(s.url)}</div>
            <div className="result-title">{s.title}</div>
            <div className="result-desc">{s.snippet}</div>
          </div>
        )) : (
          <div className="result-line"><div className="result-desc">Searching…</div></div>
        )}
      </>
    ),
  };
}

function browseScene(step, source) {
  if (!source) {
    return {
      tool: 'browse', sub: 'Stoic is reading a source', path: step.text, label: step.text,
      render: () => <div className="term-line">{step.text}</div>,
    };
  }
  const domain = getDomain(source.url);
  return {
    tool: 'browse',
    sub: 'Stoic is reading a source',
    path: domain || source.url || step.text,
    label: step.text,
    browser: {
      domain: domain || source.url,
      tab: source.title || domain,
      eyebrow: (domain || '').toUpperCase(),
      title: source.title || '',
      subtitle: source.snippet || '',
      facts: [],
      paragraphs: [source.content || source.snippet || ''].filter(Boolean),
    },
  };
}

function writeScene(step, content) {
  return {
    tool: 'write', sub: 'Stoic is writing the findings', path: 'answer.md — Modified', label: step.text,
    render: () => <div className="editor-text">{content || step.text}</div>,
  };
}

function checkScene(step, sources) {
  return {
    tool: 'code', sub: 'Stoic is cross-checking', path: 'PS C:\\stoic>', label: step.text,
    render: () => (
      <>
        <div className="term-line"><span className="prompt">PS C:\stoic&gt;</span> {step.text}</div>
        {sources.slice(0, 3).map((s, i) => (
          <div className="term-line" key={s.url || i}>
            <span className="ok">✓</span> {getDomain(s.url)} .......... match
          </div>
        ))}
        <div className="term-line"><span className="prompt">PS C:\stoic&gt;</span> <span className="term-cursor" /></div>
      </>
    ),
  };
}

function imageScene(step, images) {
  const top = images.slice(0, 4);
  return {
    tool: 'image',
    sub: 'Stoic is using Images',
    path: 'stoic.images — visual results',
    label: step.text,
    render: () => (
      <div className="scp-image-grid">
        {top.length > 0 ? top.map((img, i) => (
          <div className="scp-image-cell" key={img.url || i}>
            <img src={img.url} alt={img.alt || img.title || ''} loading="lazy" />
          </div>
        )) : (
          <div className="result-line"><div className="result-desc">Searching images…</div></div>
        )}
      </div>
    ),
  };
}

export default function buildComputerScenes(steps = [], sources = [], content = '', images = []) {
  let sourceCursor = 0;
  return steps
    .map((step) => {
      const text = (step.text || '').toLowerCase();
      if (/image|photo|picture|visual/i.test(text) && images.length) return imageScene(step, images);
      if (/search|look ?up|find/i.test(text)) return searchScene(step, sources);
      if (/read|browse|open|visit|source/i.test(text)) {
        const src = sources[sourceCursor % Math.max(sources.length, 1)];
        sourceCursor += 1;
        return browseScene(step, src);
      }
      if (/writ|draft|compos|summar/i.test(text)) return writeScene(step, content);
      if (/check|verify|cross-check|confirm|validate/i.test(text)) return checkScene(step, sources);
      return null;
    })
    .filter(Boolean);
}