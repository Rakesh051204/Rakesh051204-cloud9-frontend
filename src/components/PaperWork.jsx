import { useEffect, useMemo, useState } from 'react';
import katex from 'katex';

const CSS = '@keyframes pwIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}';
const SUP = { '0': '\u2070', '1': '\u00b9', '2': '\u00b2', '3': '\u00b3', '4': '\u2074', '5': '\u2075', '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079', '-': '\u207b' };
const seen = new Set();

function clean(s) {
  return String(s || '').trim().replace(/^\\\[|\\\]$/g, '').replace(/^\\\(|\\\)$/g, '').replace(/^\$+|\$+$/g, '').trim();
}

function isMath(s) {
  if (/[\\=^_{}<>]/.test(s)) return true;
  const words = s.match(/[A-Za-z]{3,}/g) || [];
  return words.length < 2;
}

function plain(s) {
  return clean(s).replace(/\^\{?(-?\d+)\}?/g, (m, d) => d.split('').map((c) => SUP[c] || c).join(''));
}

function cap(s) {
  const t = String(s || '').trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

function parse(code) {
  const out = [];
  let n = 0;
  for (const raw of String(code).split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (/^Q:/i.test(line)) { out.push({ kind: 'q', text: line.replace(/^Q:\s*/i, '') }); continue; }
    if (/^ANS:/i.test(line)) { out.push({ kind: 'ans', eq: line.replace(/^ANS:\s*/i, '') }); continue; }
    const i = line.indexOf(' | ');
    const eq = i === -1 ? line : line.slice(0, i).trim();
    const note = i === -1 ? '' : line.slice(i + 3).trim();
    if (note) n += 1;
    out.push({ kind: 'step', eq, note, n: note ? n : 0 });
  }
  return out;
}

function Eq({ s }) {
  const v = clean(s);
  if (!isMath(v)) return <span>{v}</span>;
  let html = '';
  try { html = katex.renderToString(v, { throwOnError: false, displayMode: false }); } catch (e) { html = ''; }
  return html ? <span style={{ fontSize: '1.2em' }} dangerouslySetInnerHTML={{ __html: html }} /> : <span>{v}</span>;
}

export default function PaperWork({ code = '', live = false }) {
  const rows = useMemo(() => parse(code), [code]);
  const [shown, setShown] = useState(live || seen.has(code) ? 9999 : 0);

  useEffect(() => {
    if (live) return undefined;
    if (shown >= rows.length) { seen.add(code); return undefined; }
    const id = setTimeout(() => setShown((n) => n + 1), 380);
    return () => clearTimeout(id);
  }, [live, shown, rows.length, code]);

  const center = { textAlign: 'center', margin: '10px 0' };

  return (
    <div style={{ margin: '14px 0', color: '#ececec', maxWidth: 680, fontSize: 16, lineHeight: 1.6 }}>
      <style>{CSS}</style>
      {rows.slice(0, shown).map((r, i) => {
        const anim = live ? undefined : 'pwIn .3s ease both';
        if (r.kind === 'q') {
          const m = isMath(clean(r.text));
          return (
            <div key={i} style={{ animation: anim }}>
              <div>{m ? 'Solve:' : 'Problem:'}</div>
              <div style={m ? center : { margin: '6px 0', fontWeight: 600 }}>{m ? <Eq s={r.text} /> : plain(r.text)}</div>
            </div>
          );
        }
        if (r.kind === 'ans') {
          return (
            <div key={i} style={{ marginTop: 16, animation: anim }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                <span style={{ width: 18, height: 18, borderRadius: 4, background: '#3fb950', color: '#0d0d0c', fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{'\u2713'}</span>
                Answer
              </div>
              <div style={center}>
                <span style={{ display: 'inline-block', border: '1.5px solid #ececec', borderRadius: 4, padding: '6px 18px' }}><Eq s={r.eq} /></span>
              </div>
            </div>
          );
        }
        return (
          <div key={i} style={{ animation: anim }}>
            {r.note ? <div style={{ fontWeight: 700, marginTop: 14, fontSize: 17 }}>{'Step ' + r.n + ': ' + cap(r.note)}</div> : null}
            <div style={center}><Eq s={r.eq} /></div>
          </div>
        );
      })}
    </div>
  );
}