import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import "./StoicComputerPanel.css";

const SCENE_DURATION_MS = 3600;

export default function StoicComputerPanel({ open, onClose, scenes = [] }) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const sceneTimer = useRef(null);

  const lastIdx = scenes.length - 1;
  const atLive = idx === lastIdx;

  // Reset to the start each time the panel opens
  useEffect(() => {
    if (open) {
      setIdx(0);
      setPlaying(true);
    }
  }, [open]);

  // While playing/live, keep pinned to the newest scene as more stream in
  useEffect(() => {
    if (playing) setIdx(scenes.length - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenes.length]);

  const gotoScene = (i) => setIdx(Math.max(0, Math.min(lastIdx, i)));
  const stepScene = (dir) => {
    setPlaying(false);
    gotoScene(idx + dir);
  };
  const jumpToLive = () => {
    setPlaying(true);
    gotoScene(lastIdx);
  };
  const onSeek = (val) => {
    setPlaying(false);
    const pct = Number(val);
    setIdx(Math.round((pct / 100) * lastIdx));
  };

  // Auto-advance through scenes at a fixed cadence while playing
  useEffect(() => {
    if (!open || !playing || lastIdx < 0) {
      clearInterval(sceneTimer.current);
      return;
    }
    sceneTimer.current = setInterval(() => {
      setIdx((prev) => {
        if (prev >= lastIdx) {
          clearInterval(sceneTimer.current);
          return prev;
        }
        return prev + 1;
      });
    }, SCENE_DURATION_MS);
    return () => clearInterval(sceneTimer.current);
  }, [open, playing, lastIdx]);

  const scene = scenes[idx];
  const seekPct = lastIdx > 0 ? (idx / lastIdx) * 100 : 100;

  return (
    <div
      className={`h-full flex-shrink-0 bg-[#141414] border-l border-white/[0.08] overflow-hidden transition-[width] duration-300 ease-out ${
        open ? "w-[460px] max-w-[90vw]" : "w-0"
      }`}
    >
      <div className="w-[460px] max-w-[90vw] h-full flex flex-col">
        <div className="flex items-start justify-between px-4 py-3.5 border-b border-white/[0.06] flex-shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold text-white whitespace-nowrap">
                Stoic's computer
              </h2>
              <span
                className="flex items-center gap-1.5 text-[10.5px] text-gray-300 bg-white/[0.06] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                style={{ opacity: atLive ? 1 : 0.45 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white scp-livedot" />
                live
              </span>
            </div>
            <div className="text-[11.5px] text-gray-500 mt-1 font-mono truncate">
              {scene?.sub}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/[0.08] text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 text-[13px]">
          {scene?.tool === "browse" ? (
            <BrowserScene page={scene.browser} active={atLive && playing} />
          ) : (
            scene?.render?.()
          )}
        </div>

        {scenes.length > 0 && (
          <div className="flex-shrink-0 px-4 pt-2.5 pb-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => stepScene(-1)}
                disabled={idx === 0}
                className="p-1.5 rounded-full hover:bg-white/[0.08] text-gray-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={seekPct}
                onChange={(e) => onSeek(e.target.value)}
                className="scp-seek flex-1"
                style={{
                  background: `linear-gradient(to right, #f4f4f2 0%, #f4f4f2 ${seekPct}%, #242424 ${seekPct}%, #242424 100%)`,
                }}
              />
              <button
                onClick={() => stepScene(1)}
                disabled={idx === lastIdx}
                className="p-1.5 rounded-full hover:bg-white/[0.08] text-gray-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight size={16} />
              </button>
              {!atLive ? (
                <button
                  onClick={jumpToLive}
                  className="text-[10.5px] font-semibold text-white bg-white/[0.08] hover:bg-white/[0.14] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors flex-shrink-0"
                >
                  Jump to live
                </button>
              ) : (
                <span className="flex items-center gap-1.5 text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" /> Live
                </span>
              )}
            </div>
            <div className="mt-2 text-[11px] text-gray-500 font-mono truncate">
              {scene?.label} · {idx + 1}/{scenes.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BrowserScene({ page, active }) {
  const scrollerRef = useRef(null);

  useEffect(() => {
    if (!active || !page) return;
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = 0;
    let raf;
    const start = performance.now();
    const duration = 1300;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      el.scrollTop = eased * (el.scrollHeight - el.clientHeight);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    const d = setTimeout(() => (raf = requestAnimationFrame(tick)), 300);
    return () => {
      clearTimeout(d);
      cancelAnimationFrame(raf);
    };
  }, [active, page]);

  if (!page) return null;
  return (
    <div className="scp-browser">
      <div className="scp-browser-chrome">
        <div className="scp-browser-tab">
          <span />
          {page.tab}
        </div>
        <div className="scp-browser-bar">
          <div className="scp-browser-url">🔒 {page.domain}</div>
        </div>
      </div>
      <div ref={scrollerRef} className="scp-browser-page" style={{ overflowY: "hidden" }}>
        <div className="scp-browser-eyebrow">{page.eyebrow}</div>
        <div className="scp-browser-title">{page.title}</div>
        <div className="scp-browser-sub">{page.subtitle}</div>
        {page.facts?.length > 0 && (
          <div className="scp-browser-facts">
            {page.facts.map(([k, v], i) => (
              <div key={i} className="scp-browser-fact">
                <div className="scp-browser-fact-k">{k}</div>
                <div className="scp-browser-fact-v">{v}</div>
              </div>
            ))}
          </div>
        )}
        {page.paragraphs.map((p, i) => (
          <p key={i} className="scp-browser-p">
            {p}
          </p>
        ))}
      </div>
      {active && <div className="scp-exit-takeover">Exit takeover</div>}
    </div>
  );
}