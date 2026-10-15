import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const BASE = { A: '#5fd38d', T: '#ff6b6b', G: '#f5c542', C: '#5aa9ff' }
const C = { bg: '#161615', field: '#0f0f0e', line: '#2f2f2c', text: '#e8e6e1', mute: '#8a8882', ai: '#7C83DB', ai2: '#aeb3f0' }
const fmtSize = (bp) => (!bp ? '-' : bp >= 1e9 ? (bp / 1e9).toFixed(2) + ' Gb' : (bp / 1e6).toFixed(1) + ' Mb')

function Helix() {
  const [t, setT] = useState(0)
  useEffect(() => { const id = setInterval(() => setT((x) => x + 0.12), 50); return () => clearInterval(id) }, [])
  const bases = ['A', 'T', 'G', 'C']
  return (
    <svg width="100%" height="90" viewBox="0 0 440 90">
      {Array.from({ length: 22 }, (_, i) => {
        const x = 10 + i * 19.5
        const s = Math.sin(t + i * 0.55)
        const y1 = 45 + s * 30
        const y2 = 45 - s * 30
        return (
          <g key={i}>
            <line x1={x} y1={y1} x2={x} y2={y2} stroke={BASE[bases[i % 4]]} strokeWidth="2" opacity="0.8" />
            <circle cx={x} cy={y1} r="4" fill={C.ai} />
            <circle cx={x} cy={y2} r="4" fill={C.ai2} />
          </g>
        )
      })}
    </svg>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{ background: C.field, border: '1px solid ' + C.line, borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ color: C.mute, fontSize: 12 }}>{label}</div>
      <div style={{ color: C.text, fontSize: 18, fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  )
}

function Organism({ it }) {
  const seq = it.seq || ''
  const rows = []
  for (let i = 0; i < seq.length; i += 60) rows.push(seq.slice(i, i + 60))
  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid ' + C.line }}>
      <div style={{ color: C.text, fontSize: 16, fontWeight: 600 }}>
        {it.common ? it.common.replace(/^./, (c) => c.toUpperCase()) + ' ' : ''}<span style={{ fontStyle: 'italic', fontWeight: 400, color: C.mute }}>{it.name || it.query}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginTop: 10 }}>
        <Stat label="Genome size" value={fmtSize(it.sizeBp)} />
        <Stat label="Chromosomes" value={it.chromosomes != null ? it.chromosomes : '-'} />
        <Stat label="GC content" value={it.gc != null ? Number(it.gc).toFixed(1) + '%' : '-'} />
        <Stat label="Genes" value={it.genes ? Number(it.genes).toLocaleString() : '-'} />
      </div>
      {rows.length > 0 && (
        <div style={{ marginTop: 12, background: C.field, border: '1px solid ' + C.line, borderRadius: 10, padding: 12, fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 13, lineHeight: 1.7, wordBreak: 'break-all' }}>
          {rows.map((r, i) => (
            <div key={i}>
              {r.split('').map((ch, k) => <span key={k} style={{ color: BASE[ch] || C.mute }}>{ch}</span>)}
            </div>
          ))}
        </div>
      )}
      <div style={{ color: C.mute, fontSize: 12, marginTop: 8 }}>
        {it.seqTitle ? 'Sequence: ' + it.seqTitle + ' (first 240 bases). ' : ''}
        {it.accession && (
          <a href={'https://www.ncbi.nlm.nih.gov/datasets/genome/' + it.accession + '/'} target="_blank" rel="noreferrer" style={{ color: C.ai2 }}>Full genome on NCBI ({it.accession})</a>
        )}
      </div>
    </div>
  )
}

export default function DnaCard({ items = [] }) {
  if (!items.length) return null
  const chart = items.filter((i) => i.sizeBp).map((i) => ({ name: (i.common || i.name || i.query), mb: Math.round(i.sizeBp / 1e6) }))
  return (
    <div style={{ background: C.bg, border: '1px solid ' + C.line, borderRadius: 16, padding: 16, margin: '12px 0', maxWidth: 680, width: '100%', boxSizing: 'border-box' }}>
      <div style={{ color: C.text, fontSize: 15, fontWeight: 600 }}>DNA from NCBI</div>
      <Helix />
      {items.length > 1 && chart.length > 1 && (
        <div style={{ height: 180, marginTop: 4 }}>
          <div style={{ color: C.mute, fontSize: 12, marginBottom: 4 }}>Genome size (megabases)</div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: C.mute, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.mute, fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
              <Tooltip contentStyle={{ background: '#1f1f1d', border: '1px solid ' + C.line, color: C.text }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="mb" fill={C.ai} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {items.map((it, i) => <Organism key={i} it={it} />)}
    </div>
  )
}