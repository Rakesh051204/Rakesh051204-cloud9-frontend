import { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';

const T = {
  panel: '#1E1F22',
  hi: '#E8E8EA',
  lo: '#8A8D93',
  border: 'rgba(255,255,255,0.06)',
};

// Muted, low-chroma palette — Gemini's code blocks read quieter than a
// typical editor theme. Only keywords/types and numbers get a color pop
// (soft magenta); everything else stays near-white or gray.
const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case',
  'break', 'import', 'from', 'export', 'default', 'async', 'await', 'new', 'class', 'extends', 'try',
  'catch', 'finally', 'throw', 'of', 'in', 'typeof', 'this', 'def', 'print', 'elif', 'pass', 'lambda',
  'with', 'as', 'yield', 'None', 'True', 'False', 'self', 'type',
]);

function highlight(line) {
  const tokens = [];
  let i = 0;
  const push = (text, color, italic = false) => tokens.push({ text, color, italic });

  while (i < line.length) {
    const r = line.slice(i);
    let m;

    if ((m = r.match(/^\/\/.*/)) || (m = r.match(/^#.*/))) {
      push(m[0], '#6B6E74', true); i += m[0].length; continue;
    }
    if ((m = r.match(/^(["'`])(?:\\.|(?!\1).)*\1/))) {
      push(m[0], '#8FBF8A'); i += m[0].length; continue;
    }
    if ((m = r.match(/^\b\d+(\.\d+)?\b/))) {
      push(m[0], '#E39FCB'); i += m[0].length; continue;
    }
    if ((m = r.match(/^[A-Za-z_$][A-Za-z0-9_$]*/))) {
      if (KEYWORDS.has(m[0])) push(m[0], '#D394C4');
      else push(m[0], T.hi);
      i += m[0].length; continue;
    }
    if ((m = r.match(/^[{}()[\];:,.]/))) {
      push(m[0], T.lo); i += m[0].length; continue;
    }
    if ((m = r.match(/^[+\-*/%=<>!&|^~?]+/))) {
      push(m[0], '#C9AEE0'); i += m[0].length; continue;
    }
    push(r[0], T.hi); i += 1;
  }
  return tokens;
}

export default function GeminiCodeBlock({ code, language = 'python' }) {
  const [copied, setCopied] = useState(false);
  const safeCode = typeof code === 'string' ? code : '';
  const lines = safeCode.split('\n');

  const doCopy = async () => {
    await navigator.clipboard.writeText(safeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const doDownload = () => {
    const ext = { python: 'py', javascript: 'js', typescript: 'ts', bash: 'sh' }[language] || 'txt';
    const blob = new Blob([safeCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snippet.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (typeof code !== 'string') {
    return (
      <div
        className="rounded-2xl my-4 px-5 py-4 text-[13.5px] font-mono animate-pulse"
        style={{ background: T.panel, color: T.lo }}
      >
        Writing code…
      </div>
    );
  }

  return (
    <div className="rounded-2xl my-4 overflow-hidden" style={{ background: T.panel }}>
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <span className="text-[13.5px] font-medium" style={{ color: T.hi }}>
          {language.charAt(0).toUpperCase() + language.slice(1)}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={doDownload}
            aria-label="Download"
            className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
            style={{ color: T.lo }}
            onMouseEnter={(e) => (e.currentTarget.style.background = T.border)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Download size={15} />
          </button>
          <button
            onClick={doCopy}
            aria-label="Copy"
            className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
            style={{ color: T.lo }}
            onMouseEnter={(e) => (e.currentTarget.style.background = T.border)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {copied ? <Check size={15} color="#8FBF8A" /> : <Copy size={15} />}
          </button>
        </div>
      </div>

      <pre
        className="m-0 px-5 pb-5 pt-1 overflow-x-auto font-mono"
        style={{ fontSize: '14px', lineHeight: '1.75' }}
      >
        {lines.map((ln, idx) => (
          <div key={idx}>
            <code>
              {ln.length === 0
                ? '\u00A0'
                : highlight(ln).map((tk, j) => (
                    <span key={j} style={{ color: tk.color, fontStyle: tk.italic ? 'italic' : 'normal' }}>
                      {tk.text}
                    </span>
                  ))}
            </code>
          </div>
        ))}
      </pre>
    </div>
  );
}