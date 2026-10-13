import { useState, useEffect, useRef, useMemo } from 'react'

/* Stoic Ultra - live website preview for ```website blocks. No dependencies. */
const C = { card: '#141413', bar: '#1a1a19', border: '#2a2a28', text: '#ece9e3', dim: '#8d8a84', ai: '#7C83DB', code: '#0f0f0e' }
const MONO = "'JetBrains Mono','Fira Code',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace"
const COL = { comment: '#7d7a72', string: '#a5c98b', tag: '#e8956f', attr: '#9aa3f0', num: '#e5c07b', kw: '#c792ea', prop: '#82aaff' }

function Btn({ children, onClick, active }) {
  return (
    <button onClick={onClick} style={{
      border: 0, cursor: 'pointer', borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 600,
      background: active ? '#f2f0eb' : 'transparent', color: active ? '#111' : C.dim,
    }}>{children}</button>
  )
}

/* ---------- Claude-style syntax colors (HTML + CSS + JS) ---------- */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const TOKEN = new RegExp([
  '(<!--[\\s\\S]*?(?:-->|$))',
  '(\\/\\*[\\s\\S]*?(?:\\*\\/|$))',
  '((?:^|[\\s;{}(,])\\/\\/[^\\n]*)',
  '("(?:[^"\\\\\\n]|\\\\.)*"?|\'(?:[^\'\\\\\\n]|\\\\.)*\'?|`(?:[^`\\\\]|\\\\.)*`?)',
  '(<\\/?[a-zA-Z][\\w:-]*|\\/?>)',
  '(#[0-9a-fA-F]{3,8}\\b)',
  '(\\b\\d+(?:\\.\\d+)?(?:px|rem|em|vh|vw|vmin|ms|s|deg|%)?)',
  '(\\b(?:const|let|var|function|return|if|else|for|while|new|class|document|window|this|true|false|null|import|from|export|default|async|await|of|in|typeof)\\b)',
  '([a-zA-Z-]+(?=\\s*:(?!\\/\\/)))',
  '(\\b[a-zA-Z-]+(?==))',
].join('|'), 'g')

function highlight(src) {
  let out = ''
  let last = 0
  src.replace(TOKEN, (m, cm, cc, cl, str, tag, hex, num, kw, prop, attr, idx) => {
    out += esc(src.slice(last, idx))
    last = idx + m.length
    let color = null
    let text = m
    let lead = ''
    if (cm || cc) color = COL.comment
    else if (cl) { color = COL.comment; if (!/^\//.test(cl)) { lead = cl[0]; text = cl.slice(1) } }
    else if (str) color = COL.string
    else if (tag) color = COL.tag
    else if (hex || num) color = COL.num
    else if (kw) color = COL.kw
    else if (prop) color = COL.prop
    else if (attr) color = COL.attr
    out += esc(lead) + '<span style="color:' + color + (color === COL.comment ? ';font-style:italic' : '') + '">' + esc(text) + '</span>'
    return m
  })
  return out + esc(src.slice(last))
}

/* ---------- preview helpers ---------- */
// make a half-written page safe to render while it streams
function partialSafe(src) {
  let s = String(src || '')
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '')
  s = s.replace(/<script[\s\S]*$/i, '')
  s = s.replace(/<[^>]*$/, '')
  const opens = (s.match(/<style[\s>]/gi) || []).length
  const closes = (s.match(/<\/style>/gi) || []).length
  if (opens > closes) s += '</style>'
  return s
}

// pages that hide sections until a bottom script runs would stay blank if the page is cut off
const FALLBACK = '<style>.reveal,[data-reveal],[class*="reveal"],.fade-in,.fade-up,.animate-in,.aos-init{opacity:1!important;transform:none!important;visibility:visible!important}</style>'
function withFallbackBase(src, finished) {
  if (finished) return src
  return /<\/head>/i.test(src) ? src.replace(/<\/head>/i, FALLBACK + '</head>') : src + FALLBACK
}

/* ---------- photo helper: <img data-photo="description"> becomes a real generated photo ---------- */
const PHOTO_SUFFIX = ', photorealistic, professional photography, natural light, ultra detailed, 8k'
const PHOTO_CSS = '<style>img[data-photo]{background:linear-gradient(135deg,#d8c6aa,#8d6e52)}</style>'
function photoSeed(s) { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 99991; return h }
function resolvePhotos(src) {
  return String(src || '').replace(/<img\b([^>]*?)\sdata-photo=("([^"]*)"|'([^']*)')([^>]*)>/gi, (m, pre, q, d1, d2, post) => {
    const d = (d1 || d2 || '').trim()
    if (!d) return m
    const strip = (s) => String(s || '').replace(/\ssrc=("[^"]*"|'[^']*')/i, '')
    const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(d + PHOTO_SUFFIX) + '?width=1280&height=800&nologo=true&model=flux&seed=' + photoSeed(d)
    return '<img' + strip(pre) + ' data-photo=' + q + ' src="' + url + '" alt="' + d.replace(/"/g, '') + '" referrerpolicy="no-referrer"' + strip(post) + '>'
  })
}
function addPhotoCssOld(src) {
  if (!/data-photo/.test(src)) return src
  return /<\/head>/i.test(src) ? src.replace(/<\/head>/i, PHOTO_CSS + '</head>') : src + PHOTO_CSS
}
const NAV_FIX = '<script>document.addEventListener("click",function(e){var a=e.target&&e.target.closest?e.target.closest("a"):null;if(!a)return;var h=a.getAttribute("href")||"";if(h.charAt(0)!=="#")return;e.preventDefault();var id=decodeURIComponent(h.slice(1));var el=id?document.getElementById(id):document.body;if(el&&el.scrollIntoView)el.scrollIntoView({behavior:"smooth",block:"start"})},true)<\/script>'
function addNavFix(src) { return src + NAV_FIX }
function withFallbackOld(src, finished) { return addNavFix(addPhotoCss(withFallbackBase(src, finished))) }
const PHOTO_CSS2 = '<style>img[data-photo]{color:transparent;font-size:0;background:linear-gradient(110deg,#d8c6aa 30%,#eadfca 50%,#d8c6aa 70%);background-size:200% 100%;animation:phsh 1.4s linear infinite}img[data-photo].ok{animation:none;background:none}img[data-photo].bad{animation:none}@keyframes phsh{to{background-position:-200% 0}}</style>'
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const PHOTO_LOADER = '<script>(function(){var L=[].slice.call(document.querySelectorAll("img[data-src]"));var n=0;function next(){if(n>=L.length)return;var im=L[n++],tries=0,base=im.getAttribute("data-src");function fail(){if(tries<3){setTimeout(go,2500)}else{im.className+=" bad";next()}}function go(){tries++;var t=setTimeout(fail,45000);im.onload=function(){clearTimeout(t);im.className+=" ok";next()};im.onerror=function(){clearTimeout(t);fail()};im.src=base+(tries>1?"&r="+tries:"")}go()}next()})()<\/script>'
function addPhotoCss(src, load) {
  if (!/data-photo/.test(src)) return src
  let s = src.replace(/(<img\b[^>]*?)\ssrc="(https:\/\/image\.pollinations\.ai\/[^"]*)"/gi, (m, pre, u) => pre + ' src="' + BLANK + '" data-src="' + u + '"')
  s = /<\/head>/i.test(s) ? s.replace(/<\/head>/i, PHOTO_CSS2 + '</head>') : s + PHOTO_CSS2
  return load ? s + PHOTO_LOADER : s
}
function withFallback(src, finished, load) { return addNavFix(addPhotoCss(withFallbackBase(src, finished), load)) }
export default function WebPreview({ code, streaming }) {
  const html = resolvePhotos(String(code || '').replace(/\n$/, ''))
  const hasEnd = /<\/html>\s*$/i.test(html.trim()) || /<\/body>/i.test(html)
  const [tab, setTab] = useState('Preview')
  const [full, setFull] = useState(false)
  const [copied, setCopied] = useState(false)
  const [key, setKey] = useState(0)
  const [idle, setIdle] = useState(false)
  const [doc, setDoc] = useState('')
  const [codeHtml, setCodeHtml] = useState('')
  const last = useRef(0)
  const codeRef = useRef(null)

  // no new text for 3s = finished (even if the page was cut off)
  useEffect(() => {
    setIdle(false)
    if (!html) return undefined
    const t = setTimeout(() => setIdle(true), 3000)
    return () => clearTimeout(t)
  }, [html])

  const complete = streaming === true ? hasEnd : (streaming === false || hasEnd || idle)

  // live preview: update every ~0.7s while streaming, full page at the end
  useEffect(() => {
    if (!html) return undefined
    if (complete) { setDoc(withFallback(html, hasEnd, true)); return undefined }
    const wait = Math.max(0, 700 - (Date.now() - last.current))
    const t = setTimeout(() => { last.current = Date.now(); setDoc(withFallback(partialSafe(html), false)) }, wait)
    return () => clearTimeout(t)
  }, [html, complete, hasEnd])

  // colored code view (throttled while streaming)
  useEffect(() => {
    if (tab !== 'Code') return undefined
    const t = setTimeout(() => setCodeHtml(highlight(html)), complete ? 0 : 250)
    return () => clearTimeout(t)
  }, [html, tab, complete])

  useEffect(() => {
    if (!complete && tab === 'Code' && codeRef.current) codeRef.current.scrollTop = codeRef.current.scrollHeight
  }, [codeHtml, complete, tab])

  const shown = complete || /<body[\s>]/i.test(doc) ? doc : ''
  const lines = useMemo(() => (html ? html.split('\n').length : 0), [html])

  const copy = async () => { try { await navigator.clipboard.writeText(html); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* ignore */ } }
  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
    a.download = 'website.html'; a.click(); URL.revokeObjectURL(a.href)
  }
  const openTab = () => { const u = URL.createObjectURL(new Blob([withFallback(html, hasEnd, true)], { type: 'text/html' })); window.open(u, '_blank'); setTimeout(() => URL.revokeObjectURL(u), 60000) }

  const box = full
    ? { position: 'fixed', inset: 0, zIndex: 9999, margin: 0, borderRadius: 0 }
    : { margin: '12px 0', borderRadius: 16 }

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, overflow: 'hidden', color: C.text, display: 'flex', flexDirection: 'column', ...box }}>
      <style>{'@keyframes stoicbar{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}'}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px', background: C.bar, borderBottom: `1px solid ${C.border}` }}>
        <Btn active={tab === 'Preview'} onClick={() => setTab('Preview')}>Preview</Btn>
        <Btn active={tab === 'Code'} onClick={() => setTab('Code')}>Code</Btn>
        <span style={{ flex: 1 }} />
        {!complete && <span style={{ fontSize: 12, color: C.ai }}>Building...</span>}
        <Btn onClick={() => setKey((k) => k + 1)}>Reload</Btn>
        <Btn onClick={copy}>{copied ? 'Copied' : 'Copy'}</Btn>
        <Btn onClick={download}>Download</Btn>
        <Btn onClick={openTab}>Open</Btn>
        <Btn onClick={() => setFull((f) => !f)}>{full ? 'Close' : 'Expand'}</Btn>
      </div>
      {!complete && (
        <div style={{ height: 2, background: C.border, overflow: 'hidden' }}>
          <div style={{ height: 2, width: '40%', background: C.ai, animation: 'stoicbar 1.2s linear infinite' }} />
        </div>
      )}
      {complete && html && !/<\/html>/i.test(html) && (
        <div style={{ padding: '6px 12px', fontSize: 12, color: '#e5c07b', background: '#1f1c14', borderBottom: `1px solid ${C.border}` }}>
          The page was cut off at {html.length} characters. Try again in a minute, or ask for a shorter version.
        </div>
      )}
      {tab === 'Preview' ? (
        shown
          ? <iframe key={key} title="website preview" srcDoc={shown} sandbox="allow-scripts allow-forms allow-modals allow-popups" style={{ width: '100%', height: full ? '100%' : 460, flex: full ? 1 : undefined, border: 0, background: '#fff', display: 'block' }} />
          : <div style={{ height: 220, display: 'grid', placeItems: 'center', color: C.dim, fontSize: 13 }}>Building your website...</div>
      ) : (
        <div style={{ background: C.code, display: 'flex', flexDirection: 'column', flex: full ? 1 : undefined, minHeight: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 14px', fontSize: 11, color: C.dim, fontFamily: MONO, borderBottom: `1px solid ${C.border}` }}>
            <span>html</span><span>{lines} lines</span>
          </div>
          <pre ref={codeRef} style={{ margin: 0, padding: '12px 14px', maxHeight: full ? undefined : 460, flex: full ? 1 : undefined, overflow: 'auto', fontSize: 12.5, lineHeight: 1.65, fontFamily: MONO, color: '#d8d5cf', whiteSpace: 'pre-wrap', wordBreak: 'break-word', tabSize: 2 }}>
            <code dangerouslySetInnerHTML={{ __html: codeHtml || esc(html) }} />
          </pre>
        </div>
      )}
    </div>
  )
}