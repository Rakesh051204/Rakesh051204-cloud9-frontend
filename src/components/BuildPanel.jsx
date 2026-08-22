import React, { useState, useEffect, useRef } from "react";
import { TerminalSquare, Globe, FileCode2, ChevronRight, Circle, CheckCircle2, Loader2 } from "lucide-react";
import CodeBlock from "./CodeBlock";

const T = {
  void: "#0B0B0D",
  panel: "#141413",
  border: "rgba(255,255,255,0.08)",
  hi: "#E8E6E1",
  lo: "#9B9994",
  peri: "#7C83DB",
};

/*
  DEMO DATA — replace with real events from your backend.
  Have your SSE endpoint (/api/chat/stream) emit lines like:
    data: {"type":"step","label":"Writing routes/chat.js","tool":"editor"}
  and push each one into a `steps` state array here instead of this
  hardcoded list + setInterval timer.
*/
const DEMO_STEPS = [
  { id: 1, label: "Planning task", tool: "planner" },
  { id: 2, label: "Searching web for Groq model pricing", tool: "browser" },
  { id: 3, label: "Writing server/routes/chat.js", tool: "editor" },
  { id: 4, label: "Running npm install groq-sdk", tool: "terminal" },
  { id: 5, label: "Starting dev server on :3001", tool: "terminal" },
  { id: 6, label: "Verifying streaming response", tool: "browser" },
];

export default function BuildPanel({ steps = DEMO_STEPS }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [tab, setTab] = useState("terminal");
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setStepIdx((i) => (i < steps.length - 1 ? i + 1 : i));
    }, 1600);
    return () => clearInterval(timer.current);
  }, [steps.length]);

  const current = steps[stepIdx];

  return (
    <div className="flex h-full">
      <div className="w-[320px] flex flex-col p-4 gap-2 overflow-y-auto" style={{ borderRight: `1px solid ${T.border}` }}>
        <div className="text-xs uppercase tracking-wide mb-1" style={{ color: T.lo }}>Stoic Agent — building</div>
        {steps.map((s, i) => {
          const done = i < stepIdx;
          const live = i === stepIdx;
          return (
            <div key={s.id} className="flex items-start gap-2 px-2 py-2 rounded-lg" style={{ background: live ? "rgba(124,131,219,0.08)" : "transparent" }}>
              {done ? <CheckCircle2 size={16} color="#3ECF8E" style={{ marginTop: 2 }} /> :
               live ? <Loader2 size={16} color={T.peri} className="animate-spin" style={{ marginTop: 2 }} /> :
               <Circle size={16} color={T.border} style={{ marginTop: 2 }} />}
              <div>
                <div className="text-sm" style={{ color: done || live ? T.hi : T.lo }}>{s.label}</div>
                <div className="text-[11px] mt-0.5" style={{ color: T.lo }}>{s.tool}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-1 px-3 py-2" style={{ borderBottom: `1px solid ${T.border}` }}>
          {["terminal", "browser", "editor"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3 py-1.5 rounded-md text-xs capitalize flex items-center gap-1.5"
              style={{ color: tab === t ? T.hi : T.lo, background: tab === t ? "rgba(255,255,255,0.06)" : "transparent" }}
            >
              {t === "browser" ? <Globe size={13} /> : t === "editor" ? <FileCode2 size={13} /> : <TerminalSquare size={13} />}
              {t}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1.5 text-[11px]" style={{ color: T.peri }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.peri }} />
            live
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto" style={{ background: T.void }}>
          {tab === "terminal" && (
            <div className="font-mono text-[13px] leading-6" style={{ color: "#9FD4C9" }}>
              <div style={{ color: T.lo }}>C:\Users\Hp\stoic-ultra-backend&gt; node index.js</div>
              {stepIdx >= 3 && <div>+ groq-sdk@0.9.1 installed</div>}
              {stepIdx >= 4 && <div style={{ color: T.peri }}>Server listening on http://localhost:3001</div>}
              {stepIdx >= 5 && <div>SSE stream /api/chat/stream ... 200 OK</div>}
            </div>
          )}
          {tab === "browser" && (
            <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
              <div className="px-3 py-1.5 text-[11px]" style={{ background: T.panel, color: T.lo }}>groq.com/pricing</div>
              <div className="p-4 text-sm" style={{ color: T.hi }}>Simulated page preview — the agent reads this content live before continuing.</div>
            </div>
          )}
          {tab === "editor" && (
            <CodeBlock
              filename="routes/chat.js"
              language="javascript"
              code={`import { Groq } from "groq-sdk";\n\nconst groq = new Groq();\n\nexport async function chatStream(req, res) {\n  const stream = await groq.chat.completions.create({\n    model: "openai/gpt-oss-120b",\n    messages: req.body.messages,\n    stream: true,\n  });\n  for await (const chunk of stream) {\n    res.write(chunk.choices[0]?.delta?.content || "");\n  }\n  res.end();\n}`}
            />
          )}
        </div>
        <div className="px-4 py-2 text-xs" style={{ borderTop: `1px solid ${T.border}`, color: T.lo }}>
          <ChevronRight size={12} className="inline mr-1" />{current.label}
        </div>
      </div>
    </div>
  );
}