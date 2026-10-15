import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from 'react'

/* Stoic Ultra - interactive widgets (no dependencies).
   Usage: <InteractiveWidget code={jsonString} />  or  <InteractiveWidget spec={obj} />
   Types: regression | function | kmeans | gradient | chart | bloch | roc | heatmap | ats */

const C = {
  card: '#141413', panel: '#1a1a19', border: '#2a2a28', text: '#ece9e3', dim: '#8d8a84',
  ai: '#7C83DB', pt: '#6ea4ff', good: '#7be0a0', bad: '#e57f7f', grid: '#262624',
}
const PALETTE = ['#6ea4ff', '#7be0a0', '#f0b86e', '#e57f7f', '#b48bff', '#5fd0d0']

/* ---------- shared UI ---------- */
function Shell({ title, left, right }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, margin: '12px 0', overflow: 'hidden', color: C.text, fontFamily: 'inherit' }}>
      {title && <div style={{ padding: '10px 16px', fontSize: 13, color: C.dim, borderBottom: `1px solid ${C.border}` }}>{title}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>{left}</div>
        <div style={{ flex: '1 1 300px', padding: 8, background: C.panel, borderLeft: `1px solid ${C.border}` }}>{right}</div>
      </div>
    </div>
  )
}
function Tabs({ value, options, onChange }) {
  return (
    <div style={{ display: 'flex', background: '#222221', borderRadius: 999, padding: 3, gap: 2 }}>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} style={{
          flex: 1, border: 0, cursor: 'pointer', borderRadius: 999, padding: '6px 8px', fontSize: 12,
          background: value === o ? '#f2f0eb' : 'transparent', color: value === o ? '#111' : C.dim, fontWeight: value === o ? 600 : 400,
        }}>{o}</button>
      ))}
    </div>
  )
}
function Btn({ children, onClick, primary }) {
  return (
    <button onClick={onClick} style={{
      border: `1px solid ${primary ? C.ai : C.border}`, background: primary ? C.ai : 'transparent', color: primary ? '#fff' : C.text,
      borderRadius: 999, padding: '8px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600,
    }}>{children}</button>
  )
}
function Slider({ label, value, min, max, step, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.dim }}>
      <span style={{ width: 34, color: C.text, fontStyle: 'italic' }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} style={{ flex: 1, accentColor: C.ai }} />
      <span style={{ width: 44, textAlign: 'right', color: C.text }}>{Number(value).toFixed(2)}</span>
    </label>
  )
}
const fmt = (n) => (Math.abs(n) >= 1000 || (Math.abs(n) < 0.01 && n !== 0) ? n.toExponential(1) : (+n.toFixed(2)).toString())

/* ---------- safe expression compiler ---------- */
const FN = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sqrt', 'abs', 'log', 'exp', 'floor', 'ceil', 'min', 'max', 'pow']
const ALLOWED = new Set(['x', 'a', 'b', 'c', 'pi', 'e', 'ln', ...FN])
function compile(expr) {
  try {
    const s = String(expr).replace(/\^/g, '**').replace(/π/g, 'pi').replace(/\bln\b/g, 'log')
    const ids = s.match(/[a-zA-Z_]+/g) || []
    if (ids.some((i) => !ALLOWED.has(i)) || /[^0-9a-zA-Z_+\-*/().,\s]/.test(s)) return null
    const f = new Function('x', 'a', 'b', 'c', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sqrt', 'abs', 'log', 'exp', 'floor', 'ceil', 'min', 'max', 'pow', 'pi', 'e', `return (${s})`)
    const M = Math
    return (x, a = 1, b = 1, c = 0) => f(x, a, b, c, M.sin, M.cos, M.tan, M.asin, M.acos, M.atan, M.sqrt, M.abs, M.log, M.exp, M.floor, M.ceil, M.min, M.max, M.pow, M.PI, M.E)
  } catch { return null }
}

/* ---------- generic SVG plot frame ---------- */
const W = 320, H = 270, PAD = 30
function useScale(xmin, xmax, ymin, ymax) {
  return useMemo(() => ({
    sx: (v) => PAD + ((v - xmin) / (xmax - xmin)) * (W - PAD * 1.5),
    sy: (v) => H - PAD - ((v - ymin) / (ymax - ymin)) * (H - PAD * 1.6),
    ix: (px) => xmin + ((px - PAD) / (W - PAD * 1.5)) * (xmax - xmin),
    iy: (py) => ymin + ((H - PAD - py) / (H - PAD * 1.6)) * (ymax - ymin),
  }), [xmin, xmax, ymin, ymax])
}
function Frame({ xmin, xmax, ymin, ymax, sc, children, svgRef, handlers, hint }) {
  const ticks = (a, b) => { const n = 5; return Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n) }
  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', touchAction: 'none', display: 'block' }} {...handlers}>
      {ticks(xmin, xmax).map((t, i) => <g key={'x' + i}><line x1={sc.sx(t)} x2={sc.sx(t)} y1={sc.sy(ymin)} y2={sc.sy(ymax)} stroke={C.grid} /><text x={sc.sx(t)} y={H - 10} fill={C.dim} fontSize="9" textAnchor="middle">{fmt(t)}</text></g>)}
      {ticks(ymin, ymax).map((t, i) => <g key={'y' + i}><line x1={sc.sx(xmin)} x2={sc.sx(xmax)} y1={sc.sy(t)} y2={sc.sy(t)} stroke={C.grid} /><text x={PAD - 6} y={sc.sy(t) + 3} fill={C.dim} fontSize="9" textAnchor="end">{fmt(t)}</text></g>)}
      <line x1={sc.sx(xmin)} x2={sc.sx(xmax)} y1={sc.sy(ymin)} y2={sc.sy(ymin)} stroke="#555" />
      <line x1={sc.sx(xmin)} x2={sc.sx(xmin)} y1={sc.sy(ymin)} y2={sc.sy(ymax)} stroke="#555" />
      {children}
      {hint && <text x={W - 8} y={12} fill={C.dim} fontSize="9" textAnchor="end">{hint}</text>}
    </svg>
  )
}
function pointerXY(e, svg) {
  const r = svg.getBoundingClientRect()
  return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H]
}

/* ---------- 1. regression (draggable points) ---------- */
function fit(pts) {
  const n = pts.length
  const mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n
  let sxx = 0, sxy = 0
  pts.forEach(([x, y]) => { sxx += (x - mx) ** 2; sxy += (x - mx) * (y - my) })
  const b1 = sxx ? sxy / sxx : 0, b0 = my - b1 * mx
  let ssr = 0, sst = 0
  pts.forEach(([x, y]) => { ssr += (y - (b0 + b1 * x)) ** 2; sst += (y - my) ** 2 })
  return { b0, b1, r2: sst ? 1 - ssr / sst : 1 }
}
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
function genData(n = 11) {
  const slope = (Math.random() < 0.5 ? -1 : 1) * (0.3 + Math.random() * 0.6), icpt = slope > 0 ? 1 + Math.random() * 2 : 7 + Math.random() * 2
  return Array.from({ length: n }, (_, i) => { const x = 0.8 + (i * 8.6) / (n - 1) + (Math.random() - 0.5) * 0.6; return [x, clamp(icpt + slope * x + (Math.random() - 0.5) * 3.2, 0.3, 9.7)] })
}
function Regression({ spec }) {
  const [pts, setPts] = useState(() => (spec.points?.length > 1 ? spec.points.map((p) => [...p]) : genData()))
  const [focus, setFocus] = useState('Data')
  const [drag, setDrag] = useState(-1)
  const svgRef = useRef(null)
  const sc = useScale(0, 10, 0, 10)
  const { b0, b1, r2 } = useMemo(() => fit(pts), [pts])
  const move = (e) => {
    if (drag < 0) return
    const [px, py] = pointerXY(e, svgRef.current)
    setPts((p) => p.map((q, i) => (i === drag ? [clamp(sc.ix(px), 0, 10), clamp(sc.iy(py), 0, 10)] : q)))
  }
  const lineOp = focus === 'Line' ? 1 : focus === 'Data' ? 0.5 : 0.8
  return (
    <Shell title={spec.title}
      left={<>
        <div style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: 22 }}><i>ŷ</i> = {fmt(b0)} {b1 < 0 ? '−' : '+'} {fmt(Math.abs(b1))}<i>x</i></div>
        <div style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: 12, color: C.dim, lineHeight: 1.5 }}>R² = {r2.toFixed(2)} · b₀ = intercept · b₁ = slope · least squares minimizes squared vertical residual gaps.</div>
        <Tabs value={focus} options={['Data', 'Line', 'Predictions', 'Residuals']} onChange={setFocus} />
        <Btn onClick={() => setPts(genData())}>Generate new data</Btn>
      </>}
      right={
        <Frame xmin={0} xmax={10} ymin={0} ymax={10} sc={sc} svgRef={svgRef} hint="Drag a point to refit the line."
          handlers={{ onPointerMove: move, onPointerUp: () => setDrag(-1), onPointerLeave: () => setDrag(-1) }}>
          <line x1={sc.sx(0)} y1={sc.sy(b0)} x2={sc.sx(10)} y2={sc.sy(b0 + b1 * 10)} stroke={C.good} strokeWidth={focus === 'Line' ? 2.5 : 1.5} opacity={lineOp} />
          {focus === 'Residuals' && pts.map(([x, y], i) => <line key={i} x1={sc.sx(x)} x2={sc.sx(x)} y1={sc.sy(y)} y2={sc.sy(b0 + b1 * x)} stroke={C.bad} strokeDasharray="3 2" />)}
          {focus === 'Predictions' && pts.map(([x], i) => <circle key={i} cx={sc.sx(x)} cy={sc.sy(b0 + b1 * x)} r="4" fill="none" stroke={C.good} strokeWidth="1.5" />)}
          {pts.map(([x, y], i) => <circle key={i} cx={sc.sx(x)} cy={sc.sy(y)} r={drag === i ? 7 : 5} fill={C.pt} style={{ cursor: 'grab' }} onPointerDown={(e) => { e.currentTarget.ownerSVGElement.setPointerCapture(e.pointerId); setDrag(i) }} />)}
        </Frame>} />
  )
}

/* ---------- 2. math function plot with sliders ---------- */
function FunctionPlot({ spec }) {
  const f = useMemo(() => compile(spec.expr || 'x'), [spec.expr])
  const params = spec.params || []
  const [vals, setVals] = useState(() => Object.fromEntries(params.map((p) => [p.name, p.value ?? 1])))
  const xmin = spec.xmin ?? -10, xmax = spec.xmax ?? 10
  const data = useMemo(() => {
    if (!f) return []
    return Array.from({ length: 401 }, (_, i) => { const x = xmin + ((xmax - xmin) * i) / 400; let y; try { y = f(x, vals.a, vals.b, vals.c) } catch { y = NaN } return [x, y] })
  }, [f, vals, xmin, xmax])
  const ys = data.map((d) => d[1]).filter((y) => Number.isFinite(y)).sort((p, q) => p - q)
  let ymin = spec.ymin ?? (ys.length ? ys[Math.floor(ys.length * 0.02)] : -1), ymax = spec.ymax ?? (ys.length ? ys[Math.floor(ys.length * 0.98)] : 1)
  if (ymin === ymax) { ymin -= 1; ymax += 1 }
  const sc = useScale(xmin, xmax, ymin, ymax)
  let d = '', pen = false
  data.forEach(([x, y]) => { if (!Number.isFinite(y) || y < ymin - (ymax - ymin) || y > ymax + (ymax - ymin)) { pen = false; return } d += `${pen ? 'L' : 'M'}${sc.sx(x).toFixed(1)},${sc.sy(y).toFixed(1)} `; pen = true })
  return (
    <Shell title={spec.title}
      left={<>
        <div style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: 20 }}><i>y</i> = {spec.expr}</div>
        {!f && <div style={{ color: C.bad, fontSize: 12 }}>Could not parse this expression.</div>}
        {params.map((p) => <Slider key={p.name} label={p.name} value={vals[p.name]} min={p.min ?? -5} max={p.max ?? 5} step={p.step ?? 0.1} onChange={(v) => setVals((s) => ({ ...s, [p.name]: v }))} />)}
      </>}
      right={<Frame xmin={xmin} xmax={xmax} ymin={ymin} ymax={ymax} sc={sc}><path d={d} fill="none" stroke={C.ai} strokeWidth="2.2" /></Frame>} />
  )
}

/* ---------- 3. k-means ---------- */
function blobs(k, n = 36) {
  const centers = Array.from({ length: k }, () => [1.5 + Math.random() * 7, 1.5 + Math.random() * 7])
  return Array.from({ length: n }, (_, i) => { const c = centers[i % k]; return [clamp(c[0] + (Math.random() - 0.5) * 2.6, 0, 10), clamp(c[1] + (Math.random() - 0.5) * 2.6, 0, 10)] })
}
function KMeans({ spec }) {
  const [k, setK] = useState(spec.k || 3)
  const [pts, setPts] = useState(() => blobs(spec.k || 3))
  const init = (p, kk) => p.slice().sort(() => Math.random() - 0.5).slice(0, kk).map((q) => [...q])
  const [cents, setCents] = useState(() => init(pts, k))
  const [iter, setIter] = useState(0)
  const [run, setRun] = useState(false)
  const assign = useMemo(() => pts.map(([x, y]) => { let b = 0, bd = Infinity; cents.forEach(([cx, cy], i) => { const d = (x - cx) ** 2 + (y - cy) ** 2; if (d < bd) { bd = d; b = i } }); return b }), [pts, cents])
  const inertia = pts.reduce((s, [x, y], i) => s + (x - cents[assign[i]][0]) ** 2 + (y - cents[assign[i]][1]) ** 2, 0)
  const step = useCallback(() => {
    setCents((cs) => cs.map((c, ci) => { const m = pts.filter((_, i) => assign[i] === ci); return m.length ? [m.reduce((s, p) => s + p[0], 0) / m.length, m.reduce((s, p) => s + p[1], 0) / m.length] : c }))
    setIter((n) => n + 1)
  }, [pts, assign])
  useEffect(() => { if (!run) return; const t = setInterval(step, 700); return () => clearInterval(t) }, [run, step])
  const reset = (kk = k) => { const p = blobs(kk); setPts(p); setCents(init(p, kk)); setIter(0); setRun(false) }
  const sc = useScale(0, 10, 0, 10)
  return (
    <Shell title={spec.title || 'K-means clustering'}
      left={<>
        <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.5 }}>Each point joins its nearest centroid, then centroids move to the mean of their points. Repeat until stable.</div>
        <div style={{ fontSize: 13 }}>Iteration <b>{iter}</b> · inertia <b>{inertia.toFixed(1)}</b></div>
        <Slider label="k" value={k} min={2} max={6} step={1} onChange={(v) => { setK(v); reset(v) }} />
        <div style={{ display: 'flex', gap: 8 }}><Btn primary onClick={step}>Step</Btn><Btn onClick={() => setRun((r) => !r)}>{run ? 'Pause' : 'Auto-run'}</Btn><Btn onClick={() => reset()}>New data</Btn></div>
      </>}
      right={<Frame xmin={0} xmax={10} ymin={0} ymax={10} sc={sc}>
        {pts.map(([x, y], i) => <circle key={i} cx={sc.sx(x)} cy={sc.sy(y)} r="4" fill={PALETTE[assign[i] % 6]} opacity="0.85" />)}
        {cents.map(([x, y], i) => <g key={i}><circle cx={sc.sx(x)} cy={sc.sy(y)} r="8" fill="none" stroke={PALETTE[i % 6]} strokeWidth="2.5" /><circle cx={sc.sx(x)} cy={sc.sy(y)} r="2.5" fill="#fff" /></g>)}
      </Frame>} />
  )
}

/* ---------- 4. gradient descent ---------- */
function Gradient({ spec }) {
  const f = useMemo(() => compile(spec.expr || 'x^2/4 + sin(x)'), [spec.expr])
  const xmin = spec.xmin ?? -6, xmax = spec.xmax ?? 6
  const [x, setX] = useState(spec.start ?? 4.5)
  const [lr, setLr] = useState(spec.lr ?? 0.3)
  const [trail, setTrail] = useState([spec.start ?? 4.5])
  const [run, setRun] = useState(false)
  const grad = (v) => (f(v + 1e-4) - f(v - 1e-4)) / 2e-4
  const step = useCallback(() => setX((v) => { const nv = clamp(v - lr * grad(v), xmin, xmax); setTrail((t) => [...t.slice(-40), nv]); return nv }), [lr, f, xmin, xmax]) // eslint-disable-line
  useEffect(() => { if (!run) return; const t = setInterval(step, 400); return () => clearInterval(t) }, [run, step])
  const ff = f || (() => 0)
  const data = Array.from({ length: 241 }, (_, i) => { const xx = xmin + ((xmax - xmin) * i) / 240; return [xx, ff(xx)] })
  const ys = data.map((d) => d[1]); const ymin = Math.min(...ys) - 0.5, ymax = Math.max(...ys) + 0.5
  const sc = useScale(xmin, xmax, ymin, ymax)
  if (!f) return <Shell title={spec.title} left={<div style={{ color: C.bad }}>Bad expression.</div>} right={null} />
  const path = data.map(([a, b], i) => `${i ? 'L' : 'M'}${sc.sx(a).toFixed(1)},${sc.sy(b).toFixed(1)}`).join(' ')
  const reset = () => { setX(spec.start ?? 4.5); setTrail([spec.start ?? 4.5]); setRun(false) }
  return (
    <Shell title={spec.title || 'Gradient descent'}
      left={<>
        <div style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: 17 }}>x ← x − η · f′(x)</div>
        <div style={{ fontSize: 13 }}>x = <b>{x.toFixed(3)}</b> · f(x) = <b>{f(x).toFixed(3)}</b> · slope = <b>{grad(x).toFixed(3)}</b></div>
        <Slider label="η" value={lr} min={0.01} max={1.5} step={0.01} onChange={setLr} />
        <div style={{ fontSize: 12, color: C.dim }}>Too large a learning rate overshoots and bounces; too small crawls.</div>
        <div style={{ display: 'flex', gap: 8 }}><Btn primary onClick={step}>Step</Btn><Btn onClick={() => setRun((r) => !r)}>{run ? 'Pause' : 'Auto-run'}</Btn><Btn onClick={reset}>Reset</Btn></div>
      </>}
      right={<Frame xmin={xmin} xmax={xmax} ymin={ymin} ymax={ymax} sc={sc}>
        <path d={path} fill="none" stroke={C.ai} strokeWidth="2" />
        {trail.map((t, i) => <circle key={i} cx={sc.sx(t)} cy={sc.sy(f(t))} r="2.5" fill={C.good} opacity={0.2 + (0.6 * i) / trail.length} />)}
        <circle cx={sc.sx(x)} cy={sc.sy(f(x))} r="6" fill={C.bad} />
      </Frame>} />
  )
}

/* ---------- 5. bar / line chart ---------- */
function Chart({ spec }) {
  const labels = spec.labels || [], series = spec.series || []
  const all = series.flatMap((s) => s.values)
  const ymax = Math.max(...all, 1) * 1.1, ymin = Math.min(0, ...all)
  const sc = useScale(0, labels.length, ymin, ymax)
  const bw = (W - PAD * 1.5) / Math.max(labels.length, 1)
  const [hover, setHover] = useState(null)
  return (
    <Shell title={spec.title}
      left={<>
        {series.map((s, i) => <div key={i} style={{ fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: PALETTE[i % 6] }} />{s.name}</div>)}
        <div style={{ fontSize: 13, color: C.dim, minHeight: 20 }}>{hover ? `${hover.l}: ${fmt(hover.v)}` : 'Hover a point or bar'}</div>
      </>}
      right={
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
          {[0, 1, 2, 3, 4].map((i) => { const v = ymin + ((ymax - ymin) * i) / 4; return <g key={i}><line x1={PAD} x2={W - 8} y1={sc.sy(v)} y2={sc.sy(v)} stroke={C.grid} /><text x={PAD - 5} y={sc.sy(v) + 3} fill={C.dim} fontSize="9" textAnchor="end">{fmt(v)}</text></g> })}
          {labels.map((l, i) => <text key={i} x={PAD + bw * (i + 0.5)} y={H - 10} fill={C.dim} fontSize="9" textAnchor="middle">{l}</text>)}
          {series.map((s, si) => spec.kind === 'line'
            ? <g key={si}><path d={s.values.map((v, i) => `${i ? 'L' : 'M'}${PAD + bw * (i + 0.5)},${sc.sy(v)}`).join(' ')} fill="none" stroke={PALETTE[si % 6]} strokeWidth="2.2" />
              {s.values.map((v, i) => <circle key={i} cx={PAD + bw * (i + 0.5)} cy={sc.sy(v)} r="4" fill={PALETTE[si % 6]} onMouseEnter={() => setHover({ l: labels[i], v })} onMouseLeave={() => setHover(null)} />)}</g>
            : s.values.map((v, i) => { const w = (bw * 0.7) / series.length; return <rect key={`${si}-${i}`} x={PAD + bw * i + bw * 0.15 + w * si} y={Math.min(sc.sy(v), sc.sy(0))} width={w} height={Math.abs(sc.sy(v) - sc.sy(0))} rx="3" fill={PALETTE[si % 6]} onMouseEnter={() => setHover({ l: labels[i], v })} onMouseLeave={() => setHover(null)} /> }))}
        </svg>} />
  )
}

/* ---------- 6. Bloch sphere (qubit) ---------- */
const TAU = Math.PI * 2
const GATES = {
  H: ([x, y, z]) => [z, -y, x],
  X: ([x, y, z]) => [x, -y, -z],
  Y: ([x, y, z]) => [-x, y, -z],
  Z: ([x, y, z]) => [-x, -y, z],
  S: ([x, y, z]) => [-y, x, z],
  T: ([x, y, z]) => [(x - y) * Math.SQRT1_2, (x + y) * Math.SQRT1_2, z],
}
function Bloch({ spec }) {
  const t0 = spec.theta ?? Math.PI / 3, p0 = spec.phi ?? 0.8
  const [v, setV] = useState([Math.sin(t0) * Math.cos(p0), Math.sin(t0) * Math.sin(p0), Math.cos(t0)])
  const [view, setView] = useState({ az: -0.7, el: 0.35 })
  const drag = useRef(null)
  const theta = Math.acos(clamp(v[2], -1, 1))
  let phi = Math.atan2(v[1], v[0]); if (phi < 0) phi += TAU
  const setAngles = (t, p) => setV([Math.sin(t) * Math.cos(p), Math.sin(t) * Math.sin(p), Math.cos(t)])
  const R = 100, cx = 160, cy = 138
  const proj = ([x, y, z]) => {
    const ca = Math.cos(view.az), sa = Math.sin(view.az), ce = Math.cos(view.el), se = Math.sin(view.el)
    const x1 = x * ca - y * sa, y1 = x * sa + y * ca
    return [cx + R * x1, cy - R * (z * ce + y1 * se)]
  }
  const ring = (fn) => Array.from({ length: 73 }, (_, i) => { const a = (TAU * i) / 72; const [px, py] = proj(fn(a)); return `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}` }).join(' ')
  const axes = [[[0, 0, 1], '|0\u27E9'], [[0, 0, -1], '|1\u27E9'], [[1, 0, 0], '|+\u27E9'], [[-1, 0, 0], '|\u2212\u27E9'], [[0, 1, 0], '|+i\u27E9'], [[0, -1, 0], '|\u2212i\u27E9']]
  const o = proj([0, 0, 0]), tip = proj(v), shadow = proj([v[0], v[1], 0])
  const p0prob = (1 + v[2]) / 2, p1prob = 1 - p0prob
  const alpha = Math.cos(theta / 2), beta = Math.sin(theta / 2)
  const down = (e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = [e.clientX, e.clientY] }
  const mv = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current[0], dy = e.clientY - drag.current[1]
    drag.current = [e.clientX, e.clientY]
    setView((s) => ({ az: s.az + dx * 0.012, el: clamp(s.el + dy * 0.012, -1.3, 1.3) }))
  }
  const bar = (label, pr, color) => (
    <div style={{ fontSize: 12, color: C.dim }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{label}</span><span style={{ color: C.text }}>{(pr * 100).toFixed(1)}%</span></div>
      <div style={{ height: 6, borderRadius: 3, background: '#262624', marginTop: 3 }}><div style={{ width: `${pr * 100}%`, height: 6, borderRadius: 3, background: color }} /></div>
    </div>
  )
  return (
    <Shell title={spec.title || 'Qubit on the Bloch sphere. Drag the sphere to rotate, use gates or sliders to move the state:'}
      left={<>
        <div style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: 16 }}>|\u03C8\u27E9 = cos(\u03B8/2)|0\u27E9 + e<sup>i\u03C6</sup> sin(\u03B8/2)|1\u27E9</div>
        <div style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: 12, color: C.dim }}>\u03B1 = {alpha.toFixed(3)} · |\u03B2| = {beta.toFixed(3)} · \u03B8 = {(theta / Math.PI).toFixed(2)}\u03C0 · \u03C6 = {(phi / Math.PI).toFixed(2)}\u03C0</div>
        <Slider label={'\u03B8'} value={theta} min={0} max={Math.PI} step={0.01} onChange={(t) => setAngles(t, phi)} />
        <Slider label={'\u03C6'} value={phi} min={0} max={TAU} step={0.01} onChange={(p) => setAngles(theta, p)} />
        {bar('P(measure |0\u27E9)', p0prob, C.pt)}
        {bar('P(measure |1\u27E9)', p1prob, C.bad)}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Object.keys(GATES).map((g) => <Btn key={g} onClick={() => setV((s) => GATES[g](s))}>{g}</Btn>)}
          <Btn onClick={() => setV([0, 0, 1])}>Reset</Btn>
        </div>
      </>}
      right={
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block', touchAction: 'none', cursor: 'grab' }} onPointerDown={down} onPointerMove={mv} onPointerUp={() => { drag.current = null }} onPointerLeave={() => { drag.current = null }}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="#3a3a37" />
          <path d={ring((a) => [Math.cos(a), Math.sin(a), 0])} fill="none" stroke="#4a4a46" />
          <path d={ring((a) => [Math.cos(a), 0, Math.sin(a)])} fill="none" stroke="#33332f" />
          <path d={ring((a) => [0, Math.cos(a), Math.sin(a)])} fill="none" stroke="#33332f" />
          {axes.map(([pt, label], i) => { const [ax, ay] = proj(pt); const [lx, ly] = proj(pt.map((n) => n * 1.22)); return <g key={i}><line x1={o[0]} y1={o[1]} x2={ax} y2={ay} stroke="#55554f" strokeWidth="1" /><text x={lx} y={ly + 3} fill={C.dim} fontSize="10" textAnchor="middle">{label}</text></g> })}
          <line x1={o[0]} y1={o[1]} x2={shadow[0]} y2={shadow[1]} stroke={C.dim} strokeDasharray="3 3" />
          <line x1={shadow[0]} y1={shadow[1]} x2={tip[0]} y2={tip[1]} stroke={C.dim} strokeDasharray="3 3" />
          <line x1={o[0]} y1={o[1]} x2={tip[0]} y2={tip[1]} stroke={C.good} strokeWidth="3" strokeLinecap="round" />
          <circle cx={tip[0]} cy={tip[1]} r="6" fill={C.good} />
          <text x={W - 8} y={12} fill={C.dim} fontSize="9" textAnchor="end">Drag to rotate the view.</text>
        </svg>} />
  )
}

/* ---------- 7. ROC curve / AUC ---------- */
function erf(x) {
  const s = Math.sign(x); const a = Math.abs(x); const t = 1 / (1 + 0.3275911 * a)
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a)
  return s * y
}
const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2))
function Roc({ spec }) {
  const [d, setD] = useState(spec.d ?? 1.5)
  const [th, setTh] = useState(spec.threshold ?? 0.75)
  const tpr = (x) => 1 - Phi(x - d), fpr = (x) => 1 - Phi(x)
  const auc = Phi(d / Math.SQRT2)
  const sc = useScale(0, 1, 0, 1)
  const path = Array.from({ length: 161 }, (_, i) => { const x = -4 + ((8 + d) * i) / 160; return `${i ? 'L' : 'M'}${sc.sx(fpr(x)).toFixed(1)},${sc.sy(tpr(x)).toFixed(1)}` }).join(' ')
  const T = tpr(th), F = fpr(th), acc = 0.5 * (T + 1 - F)
  return (
    <Shell title={spec.title || 'ROC curve and AUC. Move the sliders to see how the classifier changes:'}
      left={<>
        <div style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: 20 }}>AUC = {auc.toFixed(3)}</div>
        <div style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: 12, color: C.dim, lineHeight: 1.5 }}>TPR = {T.toFixed(2)} · FPR = {F.toFixed(2)} · accuracy = {acc.toFixed(2)}. Higher separation d{'\u2032'} pushes the curve toward the top-left corner.</div>
        <Slider label={'d\u2032'} value={d} min={0} max={4} step={0.05} onChange={setD} />
        <Slider label="t" value={th} min={-2} max={d + 3} step={0.05} onChange={setTh} />
        <Btn onClick={() => { setD(1.5); setTh(0.75) }}>Reset</Btn>
      </>}
      right={<Frame xmin={0} xmax={1} ymin={0} ymax={1} sc={sc} hint="Dashed line = random guessing.">
        <line x1={sc.sx(0)} y1={sc.sy(0)} x2={sc.sx(1)} y2={sc.sy(1)} stroke="#555" strokeDasharray="4 4" />
        <path d={path} fill="none" stroke={C.ai} strokeWidth="2.4" />
        <circle cx={sc.sx(F)} cy={sc.sy(T)} r="6" fill={C.bad} />
      </Frame>} />
  )
}

/* ---------- 8. Heatmap (correlation matrix) ---------- */
function rng(seed) {
  let a = seed >>> 0
  return () => { a = (a + 0x6d2b79f5) >>> 0; let x = a; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296 }
}
function makeCorr(labels, seed) {
  const r = rng(seed), n = 160
  const gauss = () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r())
  const load = labels.map(() => [(r() * 2 - 1) * 1.2, (r() * 2 - 1) * 1.2, 0.35 + r() * 0.5])
  const cols = labels.map(() => [])
  for (let i = 0; i < n; i++) { const f1 = gauss(), f2 = gauss(); labels.forEach((_, j) => cols[j].push(load[j][0] * f1 + load[j][1] * f2 + load[j][2] * gauss())) }
  const mean = cols.map((c) => c.reduce((a, b) => a + b, 0) / n)
  const sd = cols.map((c, j) => Math.sqrt(c.reduce((a, b) => a + (b - mean[j]) ** 2, 0) / n))
  return labels.map((_, a) => labels.map((__, b) => {
    if (a === b) return 1
    let s = 0
    for (let i = 0; i < n; i++) s += (cols[a][i] - mean[a]) * (cols[b][i] - mean[b])
    return clamp(s / n / (sd[a] * sd[b]), -1, 1)
  }))
}
const NEG = [59, 111, 212], MID = [42, 42, 45], POS = [224, 87, 63]
function heat(v) {
  const end = v < 0 ? NEG : POS, t = Math.min(1, Math.abs(v))
  return `rgb(${[0, 1, 2].map((i) => Math.round(MID[i] + (end[i] - MID[i]) * t)).join(',')})`
}
function Heatmap({ spec }) {
  const labels = spec.labels && spec.labels.length > 1 ? spec.labels.slice(0, 9).map(String) : ['Age', 'Salary', 'Experience', 'Score', 'Hours']
  const n = labels.length
  const given = Array.isArray(spec.matrix) && spec.matrix.length === n && spec.matrix.every((r) => Array.isArray(r) && r.length === n)
  const [seed, setSeed] = useState(spec.seed ?? 7)
  const [focus, setFocus] = useState('All')
  const [sel, setSel] = useState(null)
  const [hov, setHov] = useState(null)
  const [showVals, setShowVals] = useState(true)
  const M = useMemo(() => (given ? spec.matrix.map((r) => r.map(Number)) : makeCorr(labels, seed)), [given, seed]) // eslint-disable-line
  const x0 = 64, y0 = 32
  const cs = Math.min((W - x0 - 8) / n, (H - y0 - 6) / n)
  let best = null
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (!best || Math.abs(M[a][b]) > Math.abs(best.v)) best = { a, b, v: M[a][b] }
  const short = (s) => (s.length > 9 ? s.slice(0, 8) + '\u2026' : s)
  const dim = (a, b, v) => {
    if (sel !== null && a !== sel && b !== sel) return 0.18
    if (a === b) return 1
    if (focus === 'Positive' && v < 0) return 0.15
    if (focus === 'Negative' && v >= 0) return 0.15
    return 1
  }
  const hv = hov ? M[hov.a][hov.b] : null
  return (
    <Shell title={spec.title || (given ? 'Heatmap. Hover a cell to read it, click a cell to focus its row:' : 'Correlation heatmap (illustrative data). Hover a cell, click to focus a variable:')}
      left={<>
        <div style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: 18 }}><i>r</i> = cov(<i>X</i>, <i>Y</i>) / (<i>\u03C3</i><sub>X</sub> <i>\u03C3</i><sub>Y</sub>)</div>
        <div style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: 12, color: C.dim, lineHeight: 1.5, minHeight: 36 }}>
          {hov ? `${labels[hov.a]} \u00D7 ${labels[hov.b]}: r = ${hv.toFixed(2)}` : best ? `Strongest pair: ${labels[best.a]} and ${labels[best.b]} (r = ${best.v.toFixed(2)}). Red = positive, blue = negative.` : ''}
        </div>
        <Tabs value={focus} options={['All', 'Positive', 'Negative']} onChange={setFocus} />
        <div>
          <div style={{ height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${heat(-1)}, ${heat(0)}, ${heat(1)})` }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.dim, marginTop: 3 }}><span>-1</span><span>0</span><span>+1</span></div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!given && <Btn onClick={() => { setSeed((Math.random() * 65535) | 0); setSel(null) }}>Generate new data</Btn>}
          <Btn onClick={() => setShowVals((v) => !v)}>{showVals ? 'Hide values' : 'Show values'}</Btn>
          {sel !== null && <Btn onClick={() => setSel(null)}>Clear focus</Btn>}
        </div>
      </>}
      right={
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
          {labels.map((l, i) => (
            <g key={'l' + i}>
              <text x={x0 - 6} y={y0 + cs * i + cs / 2 + 3} fill={sel === i ? C.text : C.dim} fontSize="9" textAnchor="end">{short(l)}</text>
              <text x={x0 + cs * i + cs / 2} y={y0 - 7} fill={sel === i ? C.text : C.dim} fontSize="9" textAnchor="start" transform={`rotate(-35 ${x0 + cs * i + cs / 2} ${y0 - 7})`}>{short(l)}</text>
            </g>
          ))}
          {M.map((row, a) => row.map((v, b) => (
            <g key={a + '-' + b} onMouseEnter={() => setHov({ a, b })} onMouseLeave={() => setHov(null)} onClick={() => setSel((s) => (s === a ? null : a))} style={{ cursor: 'pointer' }}>
              <rect className="sw-cell" x={x0 + cs * b + 1} y={y0 + cs * a + 1} width={cs - 2} height={cs - 2} rx="3" fill={heat(v)} opacity={dim(a, b, v)} style={{ animationDelay: `${0.35 + (a + b) * 0.07}s` }} />
              {showVals && <text x={x0 + cs * b + cs / 2} y={y0 + cs * a + cs / 2 + 3} fill="#fff" fontSize={Math.max(7, Math.min(11, cs / 4.2))} textAnchor="middle" opacity={dim(a, b, v)} style={{ pointerEvents: 'none' }}>{v.toFixed(2)}</text>}
            </g>
          )))}
        </svg>} />
  )
}

/* ---------- 9. ATS resume score card ---------- */
const sigOf = (score, cats) => {
  let h = 5381
  const s = `${score}|${cats.map((c) => c[1]).join(',')}`
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h.toString(36)
}
const rate = (n) => (n >= 90 ? 'Excellent' : n >= 80 ? 'Strong' : n >= 70 ? 'Good' : n >= 60 ? 'Fair' : 'Needs work')
const scoreColor = (p) => (p >= 85 ? C.good : p >= 70 ? C.pt : p >= 55 ? '#f0b86e' : C.bad)
const SEV = { high: ['High', '#e57f7f'], medium: ['Medium', '#f0b86e'], low: ['Low', '#6ea4ff'] }
const LEVELS = {
  'Fresher (0-1 yr)': 'Lead with projects and certifications, keep it to one page, and put a number on every project (users, accuracy, latency, records). Link your GitHub.',
  'Internship / graduate': 'Put internship impact first, tie every project to a measurable result, and mirror the exact keywords from the job description.',
  'Junior (1-2 yrs)': 'Lead with experience and ownership, show scale and results, and trim older or side projects to make room.',
}
const CIRC = 2 * Math.PI * 44
function Chip({ children, color }) {
  return <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 999, fontSize: 12, border: `1px solid ${color}55`, background: `${color}1a`, color }}>{children}</span>
}
function Pill({ children, active, onClick }) {
  return <button onClick={onClick} style={{ border: `1px solid ${active ? C.ai : C.border}`, background: active ? `${C.ai}33` : 'transparent', color: active ? C.text : C.dim, borderRadius: 999, padding: '5px 11px', fontSize: 12, cursor: 'pointer' }}>{children}</button>
}
function AtsCard({ spec }) {
  const cats = Array.isArray(spec.cats) ? spec.cats.filter((c) => Array.isArray(c)) : []
  const score = clamp(Math.round(Number(spec.score) || cats.reduce((s, c) => s + (Number(c[1]) || 0), 0)), 0, 100)
  const verified = !spec.sig || spec.sig === sigOf(score, cats)
  const issues = Array.isArray(spec.issues) ? spec.issues : []
  const roles = Array.isArray(spec.roles) ? spec.roles : []
  const kw = spec.kw || {}
  const strong = [
    ...cats.filter((c) => c[2] && c[1] / c[2] >= 0.85).map((c) => `${c[0]} is strong (${c[1]}/${c[2]})`),
    ...(Array.isArray(spec.str) ? spec.str : []),
  ]
  const [tab, setTab] = useState('To improve')
  const [role, setRole] = useState(0)
  const [level, setLevel] = useState(Object.keys(LEVELS)[0])
  const [on, setOn] = useState(false)
  const [n, setN] = useState(0)
  useEffect(() => {
    const t0id = setTimeout(() => setOn(true), 60)
    let raf, start
    const tick = (ts) => { start = start || ts; const p = Math.min(1, (ts - start) / 1300); setN(Math.round(score * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => { clearTimeout(t0id); cancelAnimationFrame(raf) }
  }, [score])
  const stars = Math.round(score / 20)
  const r = roles[role]
  const list = { display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, margin: '12px 0', overflow: 'hidden', color: C.text }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, padding: 16, alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 112, height: 112, flex: '0 0 112px' }}>
          <svg viewBox="0 0 112 112" width="112" height="112" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="56" cy="56" r="44" fill="none" stroke="#262624" strokeWidth="9" />
            <circle cx="56" cy="56" r="44" fill="none" stroke={scoreColor(score)} strokeWidth="9" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={on ? CIRC * (1 - score / 100) : CIRC} style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(.2,.8,.2,1)' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            <div><div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1 }}>{n}</div><div style={{ fontSize: 11, color: C.dim }}>/ 100</div></div>
          </div>
        </div>
        <div style={{ flex: '1 1 220px' }}>
          <div style={{ fontSize: 12, color: C.dim }}>Estimated ATS compatibility</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: scoreColor(score) }}>{rate(score)}</span>
            <span style={{ color: '#f0b86e', letterSpacing: 2 }}>{'\u2605'.repeat(stars)}{'\u2606'.repeat(5 - stars)}</span>
          </div>
          <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>{spec.grade ? `Grade ${spec.grade}` : ''}{spec.grade && spec.words ? ' \u00B7 ' : ''}{spec.words ? `${spec.words} words` : ''}</div>
          {!verified && <div style={{ fontSize: 12, color: '#f0b86e', marginTop: 6 }}>These numbers changed after scoring. Ask again for a verified score.</div>}
        </div>
      </div>
      <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {cats.map(([name, sc, mx], i) => {
          const p = mx ? (sc / mx) * 100 : 0
          return (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}><span>{name}</span><span style={{ color: C.dim }}>{sc}/{mx}</span></div>
              <div style={{ height: 6, borderRadius: 3, background: '#262624', marginTop: 4 }}>
                <div style={{ height: 6, borderRadius: 3, width: on ? `${p}%` : '0%', background: scoreColor(p), transition: `width 1s ${0.12 * i}s ease` }} />
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ padding: '4px 16px 14px' }}>
        <Tabs value={tab} options={['Strengths', 'To improve', 'Keywords', 'Role fit']} onChange={setTab} />
        <div style={{ marginTop: 12 }}>
          {tab === 'Strengths' && (
            <div style={list}>
              {strong.length === 0 && <div style={{ color: C.dim }}>No standout strengths yet. Work through the fixes first.</div>}
              {strong.map((s, i) => <div key={i} style={{ display: 'flex', gap: 8 }}><span style={{ color: C.good }}>{'\u2713'}</span><span>{s}</span></div>)}
            </div>
          )}
          {tab === 'To improve' && (
            <div style={list}>
              {issues.length === 0 && <div style={{ color: C.dim }}>No major issues found.</div>}
              {issues.map((it, i) => {
                const [label, color] = SEV[it[0]] || SEV.low
                return (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ flex: '0 0 auto', marginTop: 1 }}><Chip color={color}>{label}</Chip></span>
                    <span><span>{it[1]}</span>{it[2] ? <span style={{ display: 'block', color: C.dim, fontSize: 12, marginTop: 2 }}>Fix: {it[2]}</span> : null}</span>
                  </div>
                )
              })}
            </div>
          )}
          {tab === 'Keywords' && (
            <div style={list}>
              <div style={{ fontSize: 12, color: C.dim }}>{kw.src === 'jd' ? 'Compared with the job description you pasted.' : 'Compared with your target role. Paste a job description with your resume to get an exact match (up to 15 extra points).'}</div>
              <div style={{ fontSize: 12, color: C.dim }}>Found in your resume</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{(kw.m || []).length ? kw.m.map((k, i) => <Chip key={i} color={C.good}>{k}</Chip>) : <span style={{ color: C.dim }}>None detected</span>}</div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>Missing</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{(kw.x || []).length ? kw.x.map((k, i) => <Chip key={i} color="#f0b86e">{k}</Chip>) : <span style={{ color: C.dim }}>Nothing important missing</span>}</div>
            </div>
          )}
          {tab === 'Role fit' && (
            <div style={list}>
              <div style={{ fontSize: 12, color: C.dim }}>Which role are you applying for?</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{roles.map((x, i) => <Pill key={i} active={role === i} onClick={() => setRole(i)}>{x[0]}</Pill>)}</div>
              {r && (<>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginTop: 4 }}><span>Keyword match for this role</span><span style={{ color: C.dim }}>{r[1]}/100</span></div>
                <div style={{ height: 6, borderRadius: 3, background: '#262624' }}><div style={{ height: 6, borderRadius: 3, width: `${r[1]}%`, background: scoreColor(r[1]), transition: 'width .5s ease' }} /></div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{(r[2] || []).map((k, i) => <Chip key={'h' + i} color={C.good}>{k}</Chip>)}{(r[3] || []).map((k, i) => <Chip key={'m' + i} color="#f0b86e">{k}</Chip>)}</div>
                <div style={{ fontSize: 12, color: C.dim }}>Green = on your resume. Amber = commonly asked for in this role and missing. Only add what you can genuinely do.</div>
              </>)}
              <div style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>What experience level are you targeting?</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{Object.keys(LEVELS).map((l) => <Pill key={l} active={level === l} onClick={() => setLevel(l)}>{l}</Pill>)}</div>
              <div style={{ fontSize: 13, lineHeight: 1.5 }}>{LEVELS[level]}</div>
            </div>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#66655f', marginTop: 14, lineHeight: 1.5 }}>Scores come from automated checks of formatting, sections, keywords and impact. They estimate ATS compatibility and do not guarantee results in any employer's system.</div>
      </div>
    </div>
  )
}

/* ---------- animation + router ---------- */
const seen = new Set()
const ANALYZE_MS = 2600
const STEPS = ['Analyzing your request', 'Computing the numbers', 'Drawing the chart']

let nth = ''
for (let i = 1; i <= 80; i++) nth += `.sw-anim svg circle:nth-of-type(${i}){animation-delay:${(0.45 + i * 0.045).toFixed(3)}s}`
const ANIM_CSS = `
@keyframes swCard{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:none}}
@keyframes swFade{from{opacity:0}to{opacity:1}}
@keyframes swPop{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}
@keyframes swDraw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes swGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes swCell{from{opacity:0;transform:scale(.2)}to{transform:scale(1)}}
.sw-anim{animation:swCard .5s ease both}
.sw-anim svg line,.sw-anim svg text{animation:swFade .7s .25s both}
.sw-anim svg path.sw-draw{stroke-dasharray:1;stroke-dashoffset:0;animation:swDraw 1.6s .4s cubic-bezier(.4,0,.2,1) both}
.sw-anim svg circle{transform-box:fill-box;transform-origin:center;animation:swPop .45s .5s cubic-bezier(.3,1.5,.5,1) both}
.sw-anim svg rect:not(.sw-cell){transform-box:fill-box;transform-origin:bottom;animation:swGrow .8s .35s cubic-bezier(.2,.8,.2,1) both}
.sw-anim svg rect.sw-cell{transform-box:fill-box;transform-origin:center;animation:swCell .45s both}
${nth}`
const LOAD_CSS = `
.sw-sk{background:linear-gradient(90deg,#1c1c1b 25%,#2a2a28 50%,#1c1c1b 75%);background-size:200% 100%;animation:swShimmer 1.3s linear infinite;border-radius:8px}
@keyframes swShimmer{from{background-position:200% 0}to{background-position:-200% 0}}
.sw-dot{width:9px;height:9px;border-radius:50%;background:#7C83DB;display:inline-block;animation:swPulse 1s ease-in-out infinite}
@keyframes swPulse{0%,100%{opacity:.35;transform:scale(.8)}50%{opacity:1;transform:scale(1.15)}}
.sw-dots::after{content:'';animation:swDots 1.2s steps(1) infinite}
@keyframes swDots{0%{content:''}25%{content:'.'}50%{content:'..'}75%{content:'...'}}`

function Analyzing({ step }) {
  const label = STEPS[Math.min(step, STEPS.length - 1)]
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, margin: '12px 0', minHeight: 260, color: C.text, padding: 18, display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box' }}>
      <style>{LOAD_CSS}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
        <span className="sw-dot" />
        <span>{label}<span className="sw-dots" /></span>
      </div>
      <div style={{ display: 'flex', gap: 16, flex: 1, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
          <div className="sw-sk" style={{ height: 20, width: '75%' }} />
          <div className="sw-sk" style={{ height: 12, width: '95%' }} />
          <div className="sw-sk" style={{ height: 12, width: '60%' }} />
          <div className="sw-sk" style={{ height: 30, width: '100%', borderRadius: 999 }} />
        </div>
        <div className="sw-sk" style={{ flex: '1.3 1 240px', minHeight: 180, borderRadius: 12 }} />
      </div>
    </div>
  )
}

function Animated({ children }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.querySelectorAll('svg path').forEach((p) => {
      if (p.getAttribute('fill') === 'none' && !p.getAttribute('stroke-dasharray')) { p.setAttribute('pathLength', '1'); p.classList.add('sw-draw') }
    })
  }, [])
  return <div ref={ref} className="sw-anim"><style>{ANIM_CSS}</style>{children}</div>
}

function pick(s, key) {
  switch (s.type) {
    case 'regression': return <Regression key={key} spec={s} />
    case 'function': return <FunctionPlot key={key} spec={s} />
    case 'kmeans': return <KMeans key={key} spec={s} />
    case 'gradient': return <Gradient key={key} spec={s} />
    case 'chart': return <Chart key={key} spec={s} />
    case 'bloch': return <Bloch key={key} spec={s} />
    case 'roc': return <Roc key={key} spec={s} />
    case 'heatmap': return <Heatmap key={key} spec={s} />
    case 'ats': return <AtsCard key={key} spec={s} />
    default: return null
  }
}

export default function InteractiveWidget({ spec, code }) {
  const s = useMemo(() => { if (spec) return spec; try { return JSON.parse(code) } catch { return null } }, [spec, code])
  const id = s && s.type ? JSON.stringify(s) : null
  const [done, setDone] = useState(() => (id ? seen.has(id) : false))
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (done) return undefined
    const a = setInterval(() => setStep((n) => n + 1), 900)
    const b = setTimeout(() => setDone(true), ANALYZE_MS)
    return () => { clearInterval(a); clearTimeout(b) }
  }, []) // eslint-disable-line
  useEffect(() => { if (done && id) seen.add(id) }, [done, id])
  if (!id || !done) return <Analyzing step={step} />
  return <Animated key={id}>{pick(s, id)}</Animated>
}
