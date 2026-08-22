import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const T = {
  panel: '#1E1F22',
  hi: '#E8E8EA',
  lo: '#8A8D93',
  border: 'rgba(255,255,255,0.06)',
};

const LANG_ALIASES = {
  js: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'tsx',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  '': 'text',
};

// Bolder keywords/class-names to match a "heavier" code style
const customTheme = {
  ...oneDark,
  keyword: { ...oneDark.keyword, fontWeight: 700 },
  'class-name': { ...oneDark['class-name'], fontWeight: 700 },
  builtin: { ...oneDark.builtin, fontWeight: 600 },
  function: { ...oneDark.function, fontWeight: 600 },
};

export default function GeminiCodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);
  const lang = LANG_ALIASES[(language || '').toLowerCase()] || (language || 'text').toLowerCase();

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!code) {
    return (
      <div style={{ background: T.panel, borderRadius: 8, padding: '1rem', border: `1px solid ${T.border}` }}>
        <div style={{ color: T.lo, fontFamily: 'monospace' }}>Writing code…</div>
      </div>
    );
  }

  return (
    <div style={{ background: T.panel, borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.border}` }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 1rem',
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <span style={{ color: T.lo, fontSize: '0.8rem', textTransform: 'uppercase' }}>
          {language || 'Code'}
        </span>
        <button
          onClick={handleCopy}
          style={{ background: 'none', border: 'none', color: T.lo, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>

      <SyntaxHighlighter
        language={lang}
        style={customTheme}
        showLineNumbers={code.split('\n').length > 5}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '13.5px',
          lineHeight: '1.65',
          fontWeight: 500,
          overflowX: 'auto',
        }}
        codeTagProps={{
          style: {
            fontFamily: '"JetBrains Mono", "Fira Code", Menlo, Consolas, monospace',
            fontWeight: 500,
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}