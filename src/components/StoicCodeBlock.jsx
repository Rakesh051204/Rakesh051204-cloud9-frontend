import { useMemo, useState } from 'react'
import InteractiveWidget from './InteractiveWidget'
import WebPreview from './WebPreview'

/* Stoic Ultra - colored + bold code blocks (no dependencies).
   Also routes ```widget to charts and ```website / full html pages to a live preview. */

const COLORS = {
  keyword: '#569cd6', function: '#dcdcaa', string: '#ce9178', number: '#b5cea8', comment: '#6a9955',
  variable: '#9cdcfe', type: '#4ec9b0', op: '#c586c0', tag: '#569cd6', attr: '#9cdcfe', punct: '#808080', plain: '#e6e6e6',
}
const BOLD = new Set(['keyword', 'function', 'tag', 'type'])

const words = (s) => new Set(s.split(/\s+/).filter(Boolean))
const JS_KW = words('const let var function return if else for while do switch case break continue new class extends import export from default async await try catch finally throw typeof instanceof in of this null undefined true false void delete yield static super')
const PY_KW = words('def class return if elif else for while in not and or is import from as with try except finally raise lambda None True False pass break continue yield global nonlocal async await del assert self')
const PS_KW = words('function param if elseif else foreach for while do switch return break continue try catch finally throw begin process end in until trap exit')
const SH_KW = words('if then else elif fi for while do done case esac function in return exit export local echo cd source set unset')
const SQL_KW = words('select from where insert into values update set delete create table drop alter add join left right inner outer on group by order having limit offset as and or not null is in like distinct union all primary key foreign references index view case when then else end')
const C_KW = words('int long short char float double void bool boolean string var let const static public private protected class struct enum interface extends implements new return if else for while do switch case break continue try catch finally throw throws import package using namespace null true false this super fn func mut pub use impl trait match loop go defer chan map type nil in as async await')
const JSON_KW = words('true false null')
const NONE = new Set()

const STR_Q = String.raw`"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?`
const STR_JS = STR_Q + String.raw`|\x60(?:\\[\s\S]|[^\x60\\])*\x60?`
const STR_PY = String.raw`"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|` + STR_Q
const STR_PS = String.raw`@'[\s\S]*?(?:'@|$)|@"[\s\S]*?(?:"@|$)|"(?:\x60[\s\S]|[^"\x60\n])*"?|'(?:''|[^'\n])*'?`
const STR_SQL = String.raw`'(?:''|[^'])*'?`
const CMT_C = String.raw`\/\/.*|\/\*[\s\S]*?(?:\*\/|$)`
const CMT_HASH = String.raw`#.*`
const CMT_PS = String.raw`<#[\s\S]*?(?:#>|$)|#.*`
const CMT_SQL = String.raw`--.*|\/\*[\s\S]*?(?:\*\/|$)`
const CMT_CSS = String.raw`\/\*[\s\S]*?(?:\*\/|$)`
const NUM = String.raw`-?\b(?:0x[\da-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b`

function make(parts, kw, opts = {}) {
  const re = new RegExp(parts.map(([, s]) => '(' + s + ')').join('|'), 'g')
  return { re, types: parts.map(([t]) => t), kw, ...opts }
}

const LANGS = {
  js: make([['comment', CMT_C], ['string', STR_JS], ['number', NUM], ['word', String.raw`[A-Za-z_$][\w$]*`]], JS_KW, { fn: true, ty: true }),
  py: make([['comment', CMT_HASH], ['string', STR_PY], ['function', String.raw`@[A-Za-z_][\w.]*`], ['number', NUM], ['word', String.raw`[A-Za-z_]\w*`]], PY_KW, { fn: true, ty: true }),
  ps: make([['comment', CMT_PS], ['string', STR_PS], ['variable', String.raw`\$\{[^}\n]*\}|\$[A-Za-z_?^$][\w:]*`], ['type', String.raw`\[[A-Za-z_][\w.]*\]`], ['number', NUM], ['word', String.raw`[A-Za-z_]\w*(?:-[A-Za-z]\w*)*`], ['op', String.raw`-[A-Za-z]+\b`]], PS_KW, { ps: true, ci: true, fn: true }),
  sh: make([['comment', CMT_HASH], ['string', STR_Q], ['variable', String.raw`\$\{[^}\n]*\}|\$[A-Za-z_]\w*|\$[0-9@#?!*]`], ['number', NUM], ['word', String.raw`[A-Za-z_][\w-]*`], ['op', String.raw`--?[A-Za-z][\w-]*`]], SH_KW, {}),
  sql: make([['comment', CMT_SQL], ['string', STR_SQL], ['number', NUM], ['word', String.raw`[A-Za-z_]\w*`]], SQL_KW, { ci: true, fn: true }),
  css: make([['comment', CMT_CSS], ['string', STR_Q], ['keyword', String.raw`@[A-Za-z-]+`], ['number', String.raw`#[0-9a-fA-F]{3,8}\b`], ['type', String.raw`[.#][A-Za-z_][\w-]*`], ['word', String.raw`-{0,2}[A-Za-z_][\w-]*`], ['number', String.raw`-?\d*\.?\d+(?:px|em|rem|vh|vw|ms|deg|fr|s|%)?`]], NONE, { css: true }),
  c: make([['comment', CMT_C], ['string', STR_JS], ['keyword', String.raw`#\s*[a-z]+`], ['number', NUM], ['word', String.raw`[A-Za-z_]\w*`]], C_KW, { fn: true, ty: true }),
  json: make([['string', STR_Q], ['number', NUM], ['word', String.raw`[A-Za-z_]\w*`]], JSON_KW, { json: true }),
}

const ALIAS = {
  js: 'js', javascript: 'js', jsx: 'js', ts: 'js', tsx: 'js', typescript: 'js', mjs: 'js', node: 'js',
  py: 'py', python: 'py',
  ps: 'ps', ps1: 'ps', powershell: 'ps', pwsh: 'ps',
  sh: 'sh', bash: 'sh', shell: 'sh', zsh: 'sh', console: 'sh', terminal: 'sh',
  sql: 'sql', css: 'css', scss: 'css', json: 'json',
  html: 'html', xml: 'html', svg: 'html', htm: 'html', vue: 'html',
  c: 'c', cpp: 'c', 'c++': 'c', java: 'c', cs: 'c', csharp: 'c', go: 'c', rust: 'c', rs: 'c', kotlin: 'c', swift: 'c', php: 'c', dart: 'c',
}
const LABEL = { js: 'JavaScript', javascript: 'JavaScript', jsx: 'JSX', ts: 'TypeScript', tsx: 'TSX', py: 'Python', python: 'Python', ps1: 'PowerShell', powershell: 'PowerShell', pwsh: 'PowerShell', sh: 'Shell', bash: 'Bash', html: 'HTML', css: 'CSS', json: 'JSON', sql: 'SQL', cpp: 'C++', cs: 'C#', csharp: 'C#', go: 'Go', rust: 'Rust', java: 'Java', php: 'PHP', xml: 'XML', svg: 'SVG' }

function classifyWord(text, code, start, end, cfg) {
  const w = cfg.ci ? text.toLowerCase() : text
  if (cfg.kw.has(w)) return 'keyword'
  if (cfg.css) return /^\s*:(?!:)/.test(code.slice(end, end + 40)) ? 'variable' : 'plain'
  if (cfg.ps && text.includes('-')) return 'function'
  if (cfg.fn && code[end] === '(') return 'function'
  if (cfg.ps && code.slice(start - 2, start) === '::') return 'function'
  if (cfg.ty && text.length > 1 && /^[A-Z][A-Za-z0-9_]*$/.test(text)) return 'type'
  return 'plain'
}

function pushTag(out, s) {
  const re = /(<\/?!?)|("[^"]*"?|'[^']*'?)|([A-Za-z_@:][\w:.@-]*)|(\/?>)|(=)|(\s+)|([\s\S])/g
  let m, first = true
  while ((m = re.exec(s))) {
    if (m[1]) out.push([m[1], 'punct'])
    else if (m[2]) out.push([m[2], 'string'])
    else if (m[3]) { out.push([m[3], first ? 'tag' : 'attr']); first = false }
    else if (m[4] || m[5]) out.push([m[0], 'punct'])
    else out.push([m[0], 'plain'])
  }
}

function htmlTokens(code) {
  const out = []
  const re = /<!--[\s\S]*?(?:-->|$)|<\/?[A-Za-z!][^>]*>?/g
  const lower = code.toLowerCase()
  let i = 0, m
  while ((m = re.exec(code))) {
    if (m[0] === '') { re.lastIndex++; continue }
    if (m.index > i) out.push([code.slice(i, m.index), 'plain'])
    const s = m[0]
    if (s.startsWith('<!--')) out.push([s, 'comment'])
    else {
      pushTag(out, s)
      const sm = /^<(script|style)\b/i.exec(s)
      if (sm && !/\/>$/.test(s)) {
        const close = lower.indexOf('</' + sm[1].toLowerCase(), re.lastIndex)
        const end = close === -1 ? code.length : close
        out.push(...tokenize(code.slice(re.lastIndex, end), sm[1].toLowerCase() === 'script' ? 'js' : 'css'))
        re.lastIndex = end
      }
    }
    i = re.lastIndex
  }
  if (i < code.length) out.push([code.slice(i), 'plain'])
  return out
}

export function tokenize(code, lang) {
  const key = ALIAS[lang]
  if (!key) return [[code, 'plain']]
  if (key === 'html') return htmlTokens(code)
  const cfg = LANGS[key]
  const re = cfg.re
  re.lastIndex = 0
  const out = []
  let i = 0, m
  while ((m = re.exec(code))) {
    if (m[0] === '') { re.lastIndex++; continue }
    if (m.index > i) out.push([code.slice(i, m.index), 'plain'])
    let gi = 1
    while (gi < m.length && m[gi] === undefined) gi++
    let type = cfg.types[gi - 1]
    const text = m[0], end = m.index + text.length
    if (type === 'word') type = classifyWord(text, code, m.index, end, cfg)
    else if (type === 'string' && cfg.json && /^\s*:/.test(code.slice(end, end + 20))) type = 'variable'
    out.push([text, type])
    i = end
  }
  if (i < code.length) out.push([code.slice(i), 'plain'])
  return out
}

function Highlighted({ lang, code }) {
  const toks = useMemo(() => tokenize(code, lang), [code, lang])
  const [copied, setCopied] = useState(false)
  const copy = async () => { try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* ignore */ } }
  const label = LABEL[lang] || (lang ? lang.charAt(0).toUpperCase() + lang.slice(1) : 'Code')
  return (
    <div style={{ margin: '12px 0', borderRadius: 12, overflow: 'hidden', background: '#0f0f0e', border: '1px solid #2a2a28' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', background: '#1a1a19', borderBottom: '1px solid #2a2a28', fontSize: 12, color: '#8d8a84' }}>
        <span>{label}</span>
        <button onClick={copy} style={{ border: 0, background: 'transparent', color: copied ? '#7be0a0' : '#8d8a84', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>{copied ? 'Copied' : 'Copy'}</button>
      </div>
      <pre style={{ margin: 0, padding: '14px 16px', overflowX: 'auto', fontSize: 13, lineHeight: 1.6, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', tabSize: 2, background: 'transparent', border: 0 }}>
        <code style={{ fontFamily: 'inherit', background: 'transparent', padding: 0 }}>
          {toks.map(([text, type], i) => (
            <span key={i} style={{ color: COLORS[type] || COLORS.plain, fontWeight: BOLD.has(type) ? 700 : 400, fontStyle: type === 'comment' ? 'italic' : 'normal' }}>{text}</span>
          ))}
        </code>
      </pre>
    </div>
  )
}

const FULL_PAGE = /^\s*(<!doctype html|<html)/i

export default function StoicCodeBlock({ language, code }) {
  const raw = String(code ?? '').replace(/\n$/, '')
  const lang = String(language || '').toLowerCase().trim()
  if (lang === 'widget') return FULL_PAGE.test(raw) ? <WebPreview code={raw} /> : <InteractiveWidget code={raw} />
  if (lang === 'website' || ((lang === 'html' || lang === 'htm') && FULL_PAGE.test(raw))) return <WebPreview code={raw} />
  return <Highlighted lang={lang} code={raw} />
}
