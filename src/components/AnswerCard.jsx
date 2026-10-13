import ReportCard from './ReportCard';
import ClockCards from './ClockCards';
import VideoCards from './VideoCards';
import { useState, useEffect, createElement } from 'react';
import ImageLightbox from './ImageLightbox';
import ImageGrid from './ImageGrid';
import SourceGallery from './SourceGallery';
import InlineCitation from './InlineCitation';
import AnswerActions from './AnswerActions';
import GeminiCodeBlock from './GeminiCodeBlock';
import InteractiveWidget from './InteractiveWidget';
import WebPreview from './WebPreview';
import ArtifactCard from './ArtifactCard';

import { CornerDownRight } from 'lucide-react';
import JobLinksCard from './JobLinksCard';
import ThinkingPanel from './ThinkingPanel';
import { saveArtifact } from '../utils/artifactsStore';

const CITE_OR_BOLD =
  /(\*\*(.+?)\*\*)|\[\[cite:([^\]]+)\]\]|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\[([a-z0-9-]+(?:\.[a-z0-9-]+)+)\]|(https?:\/\/[^\s\]\)]+)/gi;

const FENCE_RE = /^```(\S*)\n([\s\S]*?)```\s*$/;

function isLikelyEntityName(text) {
  const trimmed = text.trim();
  if (!trimmed || /\d/.test(trimmed)) return false;
  const words = trimmed.split(/\s+/);
  if (words.length < 1 || words.length > 4) return false;
  return words.every((w) => /^[A-Za-z][A-Za-z'.-]*$/.test(w) && /[A-Z]/.test(w));
}

function normalizeDomain(d = '') {
  if (!d) return '';
  let input = d.trim();
  if (!/^https?:\/\//i.test(input)) input = `https://${input}`;
  try {
    return new URL(input).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return d.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').trim();
  }
}

function buildSourceMap(sources) {
  const map = {};
  sources.forEach((s, i) => {
    const domain = normalizeDomain(s.domain || s.url || '');
    const idKey = s.id ? String(s.id) : null;
    if (idKey && !(idKey in map)) map[idKey] = s;
    if (domain && !(domain in map)) map[domain] = s;
    map[`${domain}::${i}`] = s;
  });
  return map;
}

function resolveSource(sourceMap, sources, rawKey) {
  const key = normalizeDomain(rawKey);
  if (sourceMap[key]) return sourceMap[key];
  if (sourceMap[rawKey]) return sourceMap[rawKey];
  return sources.find((s) => {
    const d = normalizeDomain(s.domain || s.url || '');
    return d && (d.includes(key) || key.includes(d));
  });
}

function splitIntoBlocks(content) {
  const lines = content.split('\n');
  const blocks = [];
  let current = [];
  let inFence = false;

  const flush = () => {
    const joined = current.join('\n').trim();
    if (joined.length > 0) blocks.push(joined);
    current = [];
  };

  for (const line of lines) {
    const isFenceMarker = /^```/.test(line.trim());

    if (isFenceMarker && !inFence) {
      flush();
      inFence = true;
      current.push(line);
      continue;
    }

    if (isFenceMarker && inFence) {
      current.push(line);
      inFence = false;
      flush();
      continue;
    }

    if (inFence) {
      current.push(line);
      continue;
    }

    if (line.trim() === '') {
      flush();
    } else {
      current.push(line);
    }
  }
  flush();
  return blocks;
}

function renderInline(text, sources, onOpenSource, onOpenEntity) {
  const sourceMap = buildSourceMap(sources);
  const rawNodes = [];
  let lastIndex = 0;
  let match;
  CITE_OR_BOLD.lastIndex = 0;

  while ((match = CITE_OR_BOLD.exec(text)) !== null) {
    if (match.index > lastIndex) {
      rawNodes.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }

    if (match[1]) {
      rawNodes.push({ type: 'bold', value: match[2] });
    } else if (match[3] || match[6]) {
      const rawKey = match[3] || match[6];
      const src = resolveSource(sourceMap, sources, rawKey);
      if (src) {
        rawNodes.push({ type: 'citation', source: src });
      } else {
        const domain = normalizeDomain(rawKey);
        rawNodes.push({
          type: 'citation',
          source: { domain, url: `https://${domain}`, title: domain },
        });
      }
    } else if (match[5]) {
      rawNodes.push({ type: 'link', href: match[5], label: match[4] });
    } else if (match[7]) {
      rawNodes.push({ type: 'rawlink', href: match[7] });
    }

    lastIndex = CITE_OR_BOLD.lastIndex;
  }
  if (lastIndex < text.length) {
    rawNodes.push({ type: 'text', value: text.slice(lastIndex) });
  }

  const merged = [];
  for (const node of rawNodes) {
    const prev = merged[merged.length - 1];
    const isWhitespaceOnly = node.type === 'text' && /^\s*$/.test(node.value);

    if (node.type === 'citation' && prev?.type === 'citation') {
      prev.extra.push(node.source);
      continue;
    }
    if (isWhitespaceOnly && prev?.type === 'citation') {
      continue;
    }

    if (node.type === 'citation') {
      merged.push({ ...node, extra: [] });
    } else {
      merged.push(node);
    }
  }

  return merged.map((node, key) => {
    if (node.type === 'text') return <span key={key}>{node.value}</span>;

    if (node.type === 'bold') {
      if (onOpenEntity && isLikelyEntityName(node.value)) {
        return (
          <button
            key={key}
            type="button"
            onClick={() => onOpenEntity(node.value)}
            className="inline font-semibold text-white underline decoration-white/30 underline-offset-2 hover:decoration-[#7C83DB] hover:text-[#c9cbf5] transition-colors cursor-pointer bg-transparent p-0 align-baseline"
          >
            {node.value}
          </button>
        );
      }
      return (
        <strong key={key} className="font-semibold text-white">
          {node.value}
        </strong>
      );
    }

    if (node.type === 'citation') {
      return (
        <InlineCitation
          key={key}
          source={node.source}
          extraCount={node.extra.length}
          onOpen={onOpenSource}
        />
      );
    }

    if (node.type === 'link') {
      const domain = normalizeDomain(node.href);
      const favicon = domain
        ? createElement('img', {
            src: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
            alt: '',
            className: 'w-3.5 h-3.5 rounded-sm shrink-0',
            onError: (e) => { e.currentTarget.style.display = 'none'; },
          })
        : null;
      return createElement(
        'a',
        {
          key,
          href: node.href,
          target: '_blank',
          rel: 'noopener noreferrer',
          className:
            'inline-flex items-center gap-1.5 align-middle text-[#F2F2F0] hover:text-[#7C83DB] underline decoration-white/30 hover:decoration-[#7C83DB] underline-offset-2 transition-colors',
        },
        favicon,
        node.label
      );
    }

    if (node.type === 'rawlink') {
      const displayText = '';
      const domain = normalizeDomain(node.href);
      const favicon = domain
        ? createElement('img', {
            src: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
            alt: '',
            className: 'w-3.5 h-3.5 rounded-sm shrink-0',
            onError: (e) => { e.currentTarget.style.display = 'none'; },
          })
        : null;
      return createElement(
        'a',
        {
          key,
          href: node.href,
          target: '_blank',
          rel: 'noopener noreferrer',
          className:
            'inline-flex items-center align-middle mx-1 no-underline hover:opacity-75 transition-opacity [&>img]:w-[18px] [&>img]:h-[18px]', title: node.href, 'aria-label': domain || 'link',
        },
        favicon,
        displayText
      );
    }

    return null;
  });
}

function renderTable(lines, sources, key, onOpenSource, onOpenEntity) {
  const splitRow = (line) =>
    line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

  const headerCells = splitRow(lines[0]);
  const dataRows = lines.slice(2).map(splitRow);

  return (
    <div key={key} className="overflow-x-auto my-3 rounded-xl border border-white/[0.08]">
      <table className="w-full text-[13.5px] border-collapse">
        <thead>
          <tr className="bg-white/[0.04]">
            {headerCells.map((cell, i) => (
              <th
                key={i}
                className="text-left font-semibold text-white px-3.5 py-2.5 border-b border-white/[0.08]"
              >
                {renderInline(cell, sources, onOpenSource, onOpenEntity)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 1 ? 'bg-white/[0.02]' : ''}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-3.5 py-2.5 text-gray-200 border-b border-white/[0.05] last:border-b-0"
                >
                  {renderInline(cell, sources, onOpenSource, onOpenEntity)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ArtifactBlock({ id, language, code, onOpen }) {
  const title = `${(language || 'text').toUpperCase()} snippet`;

  useEffect(() => {
    saveArtifact({ id, language: language || 'text', code, title });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, code]);

  return (
    <ArtifactCard
      language={language}
      code={code}
      title={title}
      onOpen={() => onOpen?.({ id, language: language || 'text', code, title })}
    />
  );
}

function PoemOrnament() {
  const line = { flex: '0 0 44px', height: 1, background: 'rgba(184,169,138,0.35)' };
  const ico = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '14px 0 6px', whiteSpace: 'normal', color: '#B8A98A' }}>
      <span style={line} />
      <svg width="16" height="16" viewBox="0 0 24 24" {...ico} style={{ transform: 'scaleX(-1)' }}><path d="M5 19C5 10 11 4 20 4c0 9-6 15-15 15z" /><path d="M5 19L14 10" /></svg>
      <svg width="18" height="18" viewBox="0 0 24 24" {...ico}><path d="M2 5.5C5 4.2 8.5 4.5 12 6.5c3.5-2 7-2.3 10-1V19c-3-1.3-6.5-1-10 1-3.5-2-7-2.3-10-1z" /><path d="M12 6.5V20" /></svg>
      <svg width="16" height="16" viewBox="0 0 24 24" {...ico}><path d="M5 19C5 10 11 4 20 4c0 9-6 15-15 15z" /><path d="M5 19L14 10" /></svg>
      <span style={line} />
    </span>
  );
}

function renderBlock(
  block,
  sources,
  key,
  onOpenSource,
  onOpenEntity,
  isStreamingLast = false,
  messageId,
  onOpenArtifact
) {
  const trimmed = block.trim();

  const fenceMatch = trimmed.match(FENCE_RE);
  if (fenceMatch) {
    const lang = (fenceMatch[1] || 'text').toLowerCase();
    const code = fenceMatch[2].replace(/\n$/, '');
    const artifactId = `${messageId || 'msg'}-${key}`;
    return (
      (lang === 'widget' ? <InteractiveWidget key={key} code={code} /> : lang === 'website' ? <WebPreview key={key} code={code} /> : <GeminiCodeBlock key={key} language={lang} code={code} />)
    );
  }

  const openFence = trimmed.match(/^```(\S*)/);
  if (openFence && isStreamingLast) {
    const codeLines = trimmed.split('\n').slice(1);
    const partialCode = codeLines.join('\n');
    return (
      <GeminiCodeBlock
        key={key}
        language={openFence[1] || 'text'}
        code={partialCode}
        isStreaming={true}
      />
    );
  }
  const h3 = trimmed.match(/^###\s+(.*)/);
  if (h3) {
    return (
      <h3 key={key} className="text-[16px] font-semibold text-white mt-5 mb-1.5">
        {renderInline(h3[1], sources, onOpenSource, onOpenEntity)}
      </h3>
    );
  }

  const h2 = trimmed.match(/^##\s+(.*)/);
  if (h2) {
    return (
      <h2 key={key} className="text-[18px] font-semibold text-white mt-6 mb-2">
        {renderInline(h2[1], sources, onOpenSource, onOpenEntity)}
      </h2>
    );
  }

  const lines = block.split('\n').filter((l) => l.trim().length > 0);

  const isTable =
    lines.length >= 3 &&
    lines[0].trim().startsWith('|') &&
    /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/.test(lines[1].trim()) &&
    lines.slice(2).every((l) => l.trim().startsWith('|'));
  if (isTable) {
    return renderTable(lines, sources, key, onOpenSource, onOpenEntity);
  }

  const isList = lines.length > 0 && lines.every((l) => /^\s*[-*]\s+/.test(l));
  if (isList) {
    return (
      <ul key={key} className="list-disc pl-5 space-y-1.5">
        {lines.map((line, i) => (
          <li key={i}>{renderInline(line.replace(/^\s*[-*]\s+/, ''), sources, onOpenSource, onOpenEntity)}</li>
        ))}
      </ul>
    );
  }

  const _pl = block.split('\n');
    const _isPoem = _pl.length >= 2 && _pl.every((l) => l.trim().length <= 70);
    return <p key={key} style={_isPoem ? { whiteSpace: 'pre-line', textAlign: 'center', fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', fontSize: '1.06em', lineHeight: 2, color: '#E8E1CF', marginBottom: '0.4em' } : undefined}>{renderInline(block, sources, onOpenSource, onOpenEntity)}{_isPoem ? <PoemOrnament /> : null}</p>;
}

function FollowUps({ items = [], onClick }) {
  if (!items.length) return null;

  const handleClick = (q) => {
    if (typeof onClick !== 'function') return;
    onClick(q);
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/[0.06]">
      <h4 className="text-[13px] font-medium text-gray-400 mb-2">Follow-ups</h4>
      <div className="divide-y divide-white/[0.05]">
        {items.map((q, i) => (
          <button
            key={i}
            onClick={() => handleClick(q)}
            className="w-full flex items-start gap-2.5 text-left py-2.5 group
                       text-[14px] text-gray-300 hover:text-white transition-colors"
          >
            <CornerDownRight
              size={15}
              className="mt-0.5 shrink-0 text-gray-600 group-hover:text-white transition-colors"
            />
            <span>{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AnswerCard({
  content = '',
  sources = [],
  jobs = [],
  images = [],
  videos = [],
  clocks = [],
  report = null,
  followUps = [],
  streaming = false,
  steps = [],
  messageId,
  onFollowUpClick,
  onRegenerate,
  onShare,
  onFeedback,
  onOpenSources,
  onOpenImages,
  onOpenSourceDetail,
  onOpenEntity,
  onOpenArtifact,
}) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const blocks = splitIntoBlocks(content);

  const openSourcesList = () => onOpenSources?.(sources, images);
  const openImagesList = () => onOpenImages?.(sources, images);
  const openSourceDetail = (source) => onOpenSourceDetail?.(source, sources, images);
  const openEntity = (name) => onOpenEntity?.(name, sources, images);

  const openImageFullscreen = (img) => {
    const key = img.url || img.src;
    const idx = images.findIndex((i) => (i.url || i.src) === key);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  const hasImages = images && images.length > 0;

  return (
    <div className="max-w-3xl">
      <ThinkingPanel steps={steps} streaming={streaming} />

      <ClockCards clocks={clocks} />
      {report && <ReportCard report={report} />}
      <VideoCards videos={videos} />
      {hasImages && <ImageGrid images={images} onImageClick={openImageFullscreen} />}

      {jobs.length > 0 && <JobLinksCard jobs={jobs} />}

      <SourceGallery
        sources={sources}
        onOpenList={openSourcesList}
      />

      <div className="text-[15px] leading-relaxed text-gray-100 space-y-3">
        {blocks.map((block, i) => {
          const isLast = i === blocks.length - 1;
          const isSettled = !streaming || !isLast;
          return (
            <div
              key={i}
              className={`transition-all duration-300 ease-out ${
                isSettled ? 'opacity-100 translate-y-0' : 'opacity-90'
              }`}
            >
              {renderBlock(
                block,
                sources,
                i,
                openSourceDetail,
                openEntity,
                streaming && isLast,
                messageId,
                onOpenArtifact
              )}
              {streaming && isLast && !/^```/.test(block.trim()) && (
                <span className="inline-block w-1.5 h-4 ml-0.5 bg-white/70 align-middle animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {!streaming && (
        <>
          <AnswerActions
            answerText={content}
            sourceCount={sources.length}
            onRegenerate={onRegenerate}
            onShare={onShare}
            onFeedback={onFeedback}
            onOpenSources={openSourcesList}
          />
          <FollowUps items={followUps} onClick={onFollowUpClick} />
        </>
      )}

      <ImageLightbox
        images={images}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
