import { useState, createElement } from 'react';
import ImageLightbox from './ImageLightbox';
import ImageStrip from './ImageStrip';
import SourceGallery from './SourceGallery';
import InlineCitation from './InlineCitation';
import AnswerActions from './AnswerActions';
import GeminiCodeBlock from './GeminiCodeBlock';
import { CornerDownRight } from 'lucide-react';
import JobLinksCard from './JobLinksCard';

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

function buildSourceMap(sources) {
  const map = {};
  sources.forEach((s, i) => {
    const key = s.id ?? s.domain;
    if (!(key in map)) map[key] = s;
    map[`${s.domain}::${i}`] = s;
    if (s.domain && !(s.domain in map)) map[s.domain] = s;
  });
  return map;
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
  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  CITE_OR_BOLD.lastIndex = 0;

  while ((match = CITE_OR_BOLD.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }

    if (match[1]) {
      const boldText = match[2];
      if (onOpenEntity && isLikelyEntityName(boldText)) {
        nodes.push(
          <button
            key={key++}
            type="button"
            onClick={() => onOpenEntity(boldText)}
            className="inline font-semibold text-white underline decoration-white/30 underline-offset-2 hover:decoration-[#7C83DB] hover:text-[#c9cbf5] transition-colors cursor-pointer bg-transparent p-0 align-baseline"
          >
            {boldText}
          </button>
        );
      } else {
        nodes.push(
          <strong key={key++} className="font-semibold text-white">
            {boldText}
          </strong>
        );
      }
    } else if (match[3]) {
      const citeKey = match[3];
      const src = sourceMap[citeKey];
      const idx = sources.findIndex((s) => (s.id ?? s.domain) === citeKey) + 1;
      if (src) {
        nodes.push(<InlineCitation key={key++} source={src} index={idx || null} onOpen={onOpenSource} />);
      } else {
        nodes.push(<span key={key++}>{match[0]}</span>);
      }
    } else if (match[5]) {
      nodes.push(
        createElement(
          'a',
          {
            key: key++,
            href: match[5],
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'text-[#F2F2F0] underline decoration-white/30 underline-offset-2 hover:decoration-white/70 transition-colors',
          },
          match[4]
        )
      );
    } else if (match[6]) {
      const citeKey = match[6];
      const src = sourceMap[citeKey];
      const idx = sources.findIndex((s) => (s.id ?? s.domain) === citeKey) + 1;
      if (src) {
        nodes.push(<InlineCitation key={key++} source={src} index={idx || null} onOpen={onOpenSource} />);
      } else {
        nodes.push(<span key={key++}>{match[0]}</span>);
      }
    } else if (match[7]) {
      const rawUrl = match[7];
      const displayText = rawUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      nodes.push(
        createElement(
          'a',
          {
            key: key++,
            href: rawUrl,
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'text-[#7C83DB] underline decoration-[#7C83DB]/40 underline-offset-2 hover:decoration-[#7C83DB] transition-colors break-all',
          },
          displayText
        )
      );
    }

    lastIndex = CITE_OR_BOLD.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }
  return nodes;
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

function renderBlock(block, sources, key, onOpenSource, onOpenEntity, isStreamingLast = false) {
  const trimmed = block.trim();

  const fenceMatch = trimmed.match(FENCE_RE);
  if (fenceMatch) {
    const lang = (fenceMatch[1] || 'text').toLowerCase();
    const code = fenceMatch[2].replace(/\n$/, '');
    return <GeminiCodeBlock key={key} language={lang} code={code} />;
  }

  const openFence = trimmed.match(/^```(\S*)/);
  if (openFence && isStreamingLast) {
    return <GeminiCodeBlock key={key} language={openFence[1] || 'text'} code={undefined} />;
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

  return <p key={key}>{renderInline(block, sources, onOpenSource, onOpenEntity)}</p>;
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
  followUps = [],
  streaming = false,
  onFollowUpClick,
  onRegenerate,
  onShare,
  onFeedback,
  onOpenSources,
  onOpenImages,
  onOpenSourceDetail,
  onOpenEntity,
}) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const blocks = splitIntoBlocks(content);

  const openSourcesList = () => onOpenSources?.(sources, images);
  const openImagesList = () => onOpenImages?.(sources, images);
  const openSourceDetail = (source) => onOpenSourceDetail?.(source, sources, images);
  const openEntity = (name) => onOpenEntity?.(name, sources, images);

  const openImageFullscreen = (img) => {
    const idx = images.findIndex((i) => i.src === img.src);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  const hasImages = images && images.length > 0;

  return (
    <div className="max-w-3xl">
      {hasImages && <ImageStrip images={images} />}

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
              {renderBlock(block, sources, i, openSourceDetail, openEntity, streaming && isLast)}
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