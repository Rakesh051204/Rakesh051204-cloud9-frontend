// GeminiCodeBlock.jsx
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';

const LANG_ALIASES = {
  js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
  py: 'python', sh: 'bash', shell: 'bash', yml: 'yaml',
  '': 'text',
};

export default function GeminiCodeBlock({ language = 'text', code }) {
  const [copied, setCopied] = useState(false);
  const lang = LANG_ALIASES[language.toLowerCase()] || language.toLowerCase();

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/[0.08] bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-3.5 py-2 bg-white/[0.04] border-b border-white/[0.08]">
        <span className="text-[12px] font-mono text-gray-400">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {code === undefined ? (
        // streaming: fence opened but not closed yet
        <div className="px-3.5 py-3 text-[13px] font-mono text-gray-500 animate-pulse">
          Writing code…
        </div>
      ) : (
        <SyntaxHighlighter
          language={lang}
          style={oneDark}
          showLineNumbers={code.split('\n').length > 5}
          customStyle={{
            margin: 0,
            padding: '14px',
            background: 'transparent',
            fontSize: '13px',
            lineHeight: '1.6',
          }}
          codeTagProps={{ style: { fontFamily: 'Menlo, Consolas, monospace' } }}
        >
          {code}
        </SyntaxHighlighter>
      )}
    </div>
  );
}