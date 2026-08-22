import { useState, useRef, useEffect, useMemo } from "react";
import { X, Mic, Square, Settings, ChevronDown, Check, Play } from "lucide-react";
import { getDailyAccent } from "../utils/dailyAccent";
import { getDailyPitchRatio } from "../utils/dailySound";

const API_BASE = "http://localhost:3001";

// ─── Languages ────────────────────────────────────────────────────────
const LANGUAGES = [
  { label: "English", code: "en-US" },
  { label: "Spanish", code: "es-ES" },
  { label: "French", code: "fr-FR" },
  { label: "German", code: "de-DE" },
  { label: "Hindi", code: "hi-IN" },
  { label: "Japanese", code: "ja-JP" },
  { label: "Tamil", code: "ta-IN" },
  { label: "Telugu", code: "te-IN" },
  { label: "Chinese", code: "zh-CN" },
  { label: "Korean", code: "ko-KR" },
  { label: "Arabic", code: "ar-SA" },
  { label: "Portuguese", code: "pt-BR" },
  { label: "Russian", code: "ru-RU" },
  { label: "Italian", code: "it-IT" },
];

// ─── Voice Tones ──────────────────────────────────────────────────────
// These now map to REAL Groq Orpheus voices (canopylabs/orpheus-v1-english)
// via the backend /api/voice/speak endpoint — not browser pitch-shifting.
// playai-tts is dead (Groq deprecated it Dec 2025); this uses its
// replacement. Groq doesn't publish official "husky/deep" style labels
// per voice, so hit the preview (▶) button in this drawer to actually
// hear each one before picking — don't just go by the name.
const TONES = [
  { id: "diana", label: "Diana", color: "#E08FA6", voice: "diana" },
  { id: "autumn", label: "Autumn", color: "#D9B45C", voice: "autumn" },
  { id: "hannah", label: "Hannah", color: "#9B7ED9", voice: "hannah" },
  { id: "austin", label: "Austin", color: "#5CA9D6", voice: "austin" },
  { id: "daniel", label: "Daniel", color: "#7C83DB", voice: "daniel" },
  { id: "troy", label: "Troy", color: "#5FBFA0", voice: "troy" },
];

// ─── SONAR BURST ──────────────────────────────────────────────────────
function SonarBurst({ color, onDone }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const angle = (i / 28) * Math.PI * 2 + Math.random() * 0.3;
        const distance = 70 + Math.random() * 50;
        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          delay: Math.random() * 0.15,
          size: 1.5 + Math.random() * 2,
        };
      }),
    []
  );

  return (
    <div
      className="sonar-burst"
      onAnimationEnd={(e) => {
        if (e.animationName === "sonarRingFade3") onDone?.();
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`sonar-ring sonar-ring-${i}`}
          style={{ borderColor: color }}
        />
      ))}
      <svg width="220" height="220" viewBox="0 0 220 220" className="sonar-particles">
        <g transform="translate(110,110)">
          {particles.map((p, i) => (
            <circle
              key={i}
              cx="0"
              cy="0"
              r={p.size}
              fill={color}
              style={{
                animation: `sonarFly 0.9s ease-out ${p.delay}s forwards`,
                "--tx": `${p.x}px`,
                "--ty": `${p.y}px`,
              }}
            />
          ))}
        </g>
      </svg>
      <style>{`
        .sonar-burst {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 5;
        }
        .sonar-ring {
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 9999px;
          border: 2px solid;
          opacity: 0.8;
        }
        .sonar-ring-0 { animation: sonarRingFade1 0.9s ease-out forwards; }
        .sonar-ring-1 { animation: sonarRingFade2 0.9s ease-out 0.1s forwards; }
        .sonar-ring-2 { animation: sonarRingFade3 0.9s ease-out 0.2s forwards; }
        @keyframes sonarRingFade1 {
          from { transform: scale(0.6); opacity: 0.8; }
          to { transform: scale(2.6); opacity: 0; }
        }
        @keyframes sonarRingFade2 {
          from { transform: scale(0.6); opacity: 0.7; }
          to { transform: scale(3); opacity: 0; }
        }
        @keyframes sonarRingFade3 {
          from { transform: scale(0.6); opacity: 0.6; }
          to { transform: scale(3.4); opacity: 0; }
        }
        .sonar-particles {
          position: absolute;
        }
        @keyframes sonarFly {
          from { transform: translate(0, 0); opacity: 1; }
          to { transform: translate(var(--tx), var(--ty)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── PARTICLE SPHERE ORB ────────────────────────────────────────────────
function hexToRgbTriplet(hex) {
  if (!hex) return "124,131,219";
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const int = parseInt(full, 16);
  return `${(int >> 16) & 255},${(int >> 8) & 255},${int & 255}`;
}

function ParticleOrb({ orbState, accent, toneColor }) {
  const canvasRef = useRef(null);
  const liveRef = useRef({ orbState, accent, toneColor });

  useEffect(() => {
    liveRef.current = { orbState, accent, toneColor };
  }, [orbState, accent, toneColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const SIZE = 180;
    canvas.width = SIZE * DPR;
    canvas.height = SIZE * DPR;
    ctx.scale(DPR, DPR);

    const N = 520;
    const points = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      points.push({
        x: Math.cos(theta) * r,
        y,
        z: Math.sin(theta) * r,
        seed: Math.random() * Math.PI * 2,
      });
    }

    let rotY = 0;
    const rotX = 0.15;
    let t = 0;
    let energy = 0.16;
    let raf;

    const project = (p, radius) => {
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      let x = p.x * cosY - p.z * sinY;
      let z = p.x * sinY + p.z * cosY;
      let y = p.y * cosX - z * sinX;
      z = p.y * sinX + z * cosX;
      const scale = 1 / (2 - z);
      return { x: x * radius * scale, y: y * radius * scale, z };
    };

    const draw = () => {
      const { orbState: state, accent: a, toneColor: tc } = liveRef.current;

      const colorMap = {
        idle: "120,120,120",
        listening: hexToRgbTriplet(a || "#7C83DB"),
        thinking: hexToRgbTriplet("#CC785C"),
        speaking: hexToRgbTriplet(tc || "#7C83DB"),
      };
      const rgb = colorMap[state] || colorMap.idle;

      const energyTarget = { idle: 0.16, listening: 0.62, thinking: 0.42, speaking: 0.5 }[state] ?? 0.16;
      const speed = { idle: 1.1, listening: 2.6, thinking: 2.0, speaking: 2.2 }[state] ?? 1.1;

      t += 0.016;
      energy += (energyTarget - energy) * 0.06;
      rotY += 0.0032 + (state !== "idle" ? 0.0026 : 0);

      ctx.clearRect(0, 0, SIZE, SIZE);
      const cx = SIZE / 2, cy = SIZE / 2, baseR = 64;

      const projected = points
        .map((p) => {
          const jitter = Math.sin(t * speed + p.seed) * energy;
          const rad = baseR * (1 + jitter * 0.14);
          return project(p, rad);
        })
        .sort((a2, b2) => a2.z - b2.z);

      for (const p of projected) {
        const depth = (p.z + 1) / 2;
        const alpha = state === "idle" ? 0.1 + depth * 0.35 : 0.15 + depth * 0.65 + energy * 0.25;
        const size = 0.7 + depth * 1.5 + energy * 1.3;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${rgb}, ${Math.min(alpha, 0.95)})`;
        ctx.arc(cx + p.x, cy + p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const glowColor = {
    idle: "120,120,120",
    listening: hexToRgbTriplet(accent || "#7C83DB"),
    thinking: hexToRgbTriplet("#CC785C"),
    speaking: hexToRgbTriplet(toneColor || "#7C83DB"),
  }[orbState] || "120,120,120";

  return (
    <div className={`orb-wrap orb-${orbState}`}>
      <div
        className="orb-glow"
        style={{ background: `rgba(${glowColor}, 1)` }}
      />
      <canvas ref={canvasRef} style={{ width: 180, height: 180, position: "relative" }} />
      <style>{`
        .orb-wrap {
          position: relative;
          width: 180px;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .orb-glow {
          position: absolute;
          width: 90px;
          height: 90px;
          border-radius: 9999px;
          filter: blur(30px);
          opacity: 0.22;
          transition: opacity 0.4s ease, background 0.4s ease;
        }
        .orb-listening .orb-glow,
        .orb-speaking .orb-glow { opacity: 0.4; }
        .orb-thinking .orb-glow {
          animation: orbPulse 1.1s ease-in-out infinite;
        }
        @keyframes orbPulse {
          0%, 100% { opacity: 0.28; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}

// ─── SOURCES PILL ─────────────────────────────────────────────────────
function SourcesPill({ sources }) {
  if (!sources || sources.length === 0) return null;
  const shown = sources.slice(0, 5);

  return (
    <div className="sources-pill">
      <div className="sources-pill-favicons">
        {shown.map((s, i) => (
          <img
            key={i}
            src={s.favicon || `https://www.google.com/s2/favicons?domain=${s.domain}&sz=64`}
            alt={s.domain || ""}
            className="sources-pill-favicon"
            style={{ zIndex: shown.length - i }}
          />
        ))}
      </div>
      <span className="sources-pill-count">{sources.length} sources</span>
      <style>{`
        .sources-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 9999px;
          padding: 6px 14px 6px 8px;
        }
        .sources-pill-favicons {
          display: flex;
        }
        .sources-pill-favicon {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          border: 1.5px solid #141413;
          margin-left: -6px;
          background: #1a1a1a;
          object-fit: cover;
        }
        .sources-pill-favicon:first-child {
          margin-left: 0;
        }
        .sources-pill-count {
          font-size: 13px;
          color: rgba(242,242,240,0.7);
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

// ─── SSE STREAM CONSUMER ──────────────────────────────────────────────
async function consumeSSE(response, onEvent) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop();

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data:")) continue;
      const jsonStr = line.slice(5).trim();
      if (!jsonStr) continue;
      try {
        const data = JSON.parse(jsonStr);
        onEvent(data);
      } catch (e) {
        console.warn("Failed to parse SSE chunk:", jsonStr);
      }
    }
  }
}

export default function VoiceOverlay({ onClose, onSend }) {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [spokenCaption, setSpokenCaption] = useState("");
  const [sources, setSources] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState(TONES[0]); // default: Diana
  const [burst, setBurst] = useState(null);
  const [accent, setAccent] = useState("#7C83DB");
  const [previewingId, setPreviewingId] = useState(null);
  const [ttsError, setTtsError] = useState(null);
  const recognitionRef = useRef(null);
  const abortControllerRef = useRef(null);
  const dailyPitch = useRef(1);
  const transcriptRef = useRef("");
  const audioRef = useRef(null);
  const captionTimerRef = useRef(null);

  useEffect(() => {
    setAccent(getDailyAccent());
    dailyPitch.current = getDailyPitchRatio();
  }, []);

  const currentLangCode = LANGUAGES.find((l) => l.label === language)?.code || "en-US";

  const selectTone = (t) => {
    setTone(t);
    setBurst({ color: t.color, id: Date.now() });
    playTone(500 + TONES.indexOf(t) * 30, 90);
  };

  const playTone = (freq, duration = 100) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq * dailyPitch.current;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    } catch (e) {}
  };

  // ─── Real TTS via backend (Groq Orpheus) ──────────────────────────
  // Fetches actual synthesized audio and plays it with a normal <audio>
  // element. Caption is revealed on a timer proportional to audio
  // duration (Orpheus doesn't give per-word boundaries like the browser
  // API did, so this is an approximation — still far better than no
  // sync at all).
  const speak = async (text) => {
    if (!text || !text.trim()) return;
    stopSpeaking();
    setTtsError(null);
    setSpokenCaption("");
    setIsThinking(false);
    setIsSpeaking(true);

    try {
      const res = await fetch(`${API_BASE}/api/voice/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: tone.voice, speed: 1.0 }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `TTS request failed (${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        playTone(520, 100);
        const words = text.split(/\s+/);
        const totalMs = Math.max(audio.duration * 1000, 500);
        const perWordMs = totalMs / words.length;
        let i = 0;
        captionTimerRef.current = setInterval(() => {
          i += 1;
          setSpokenCaption(words.slice(0, i).join(" "));
          if (i >= words.length) clearInterval(captionTimerRef.current);
        }, perWordMs);
      };

      audio.onended = () => {
        clearInterval(captionTimerRef.current);
        setSpokenCaption(text);
        setIsSpeaking(false);
        playTone(340, 80);
        URL.revokeObjectURL(url);
      };

      audio.onerror = () => {
        clearInterval(captionTimerRef.current);
        setIsSpeaking(false);
        setTtsError("Playback failed.");
      };

      await audio.play();
    } catch (error) {
      console.error("[VoiceOverlay] TTS error:", error);
      setIsSpeaking(false);
      setTtsError(error.message || "Couldn't reach the voice engine.");
    }
  };

  const stopSpeaking = () => {
    clearInterval(captionTimerRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsSpeaking(false);
  };

  // Preview button in Settings — lets you actually hear a voice before
  // committing to it, since Groq doesn't publish tonal descriptions.
  const previewVoice = async (t) => {
    if (previewingId) return;
    setPreviewingId(t.id);
    try {
      const res = await fetch(`${API_BASE}/api/voice/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Hi, I'm ${t.label}. This is what I sound like.`,
          voice: t.voice,
          speed: 1.0,
        }),
      });
      if (!res.ok) throw new Error("Preview failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        setPreviewingId(null);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (e) {
      console.error("[VoiceOverlay] preview error:", e);
      setPreviewingId(null);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input isn't supported in this browser.");
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    setTranscript("");
    transcriptRef.current = "";
    setResponse("");
    setSpokenCaption("");
    setSources([]);
    setTtsError(null);
    playTone(880);

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = currentLangCode;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      const value = final || interim;
      setTranscript(value);
      transcriptRef.current = value;
    };

    recognition.onerror = (event) => {
      console.warn("Voice recognition error:", event.error);
      if (event.error === "not-allowed") {
        alert("Microphone access blocked. Please allow mic permission.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcriptRef.current.trim()) {
        handleSendVoice(transcriptRef.current);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    playTone(440);
  };

  const handleSendVoice = async (text) => {
    if (!text.trim()) return;
    stopSpeaking();
    setIsThinking(true);
    setSources([]);
    setResponse("");
    playTone(660, 80);

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const res = await fetch(`${API_BASE}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId: "voice",
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error("Failed to reach backend");

      let fullText = "";

      await consumeSSE(res, (data) => {
        if (data.event === "sources" && data.sources) {
          setSources(data.sources);
        }
        if (data.event === "token" && data.text) {
          fullText += data.text;
          setResponse(fullText);
        }
        if (data.event === "done") {
          const cleanText = fullText
            .replace(/\[\[cite:[^\]]+\]\]/g, "")
            .replace(/\[\[img:[^\]]+\]\]/g, "")
            .replace(/\*\*/g, "")
            .replace(/#{1,6}\s/g, "")
            .trim();
          setResponse(cleanText);
          setTimeout(() => speak(cleanText), 150);
        }
      });

      if (onSend) onSend(text, { mode: "balanced" });
    } catch (error) {
      setIsThinking(false);
      if (error.name !== "AbortError") {
        console.error(error);
        setResponse("⚠️ Something went wrong. Please try again.");
      }
    }
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
      abortControllerRef.current?.abort();
      recognitionRef.current?.stop();
    };
  }, []);

  const orbState = isListening ? "listening" : isThinking ? "thinking" : isSpeaking ? "speaking" : "idle";

  const captionText = isListening
    ? transcript
    : isSpeaking
    ? spokenCaption
    : response;

  const showIdlePrompt = orbState === "idle" && !captionText;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-6 right-6 text-white/50 hover:text-white transition p-2"
        aria-label="Settings"
      >
        <Settings size={24} />
      </button>

      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <SourcesPill sources={sources} />
      </div>

      {showSettings && (
        <div className="absolute top-16 right-6 w-72 max-h-[70vh] overflow-y-auto rounded-2xl border border-[#232320] bg-[#141413] p-4 shadow-2xl z-10">
          <div className="mb-4">
            <label className="text-xs text-white/50 uppercase tracking-wider">Conversation Language</label>
            <div className="relative mt-1">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#1a1a1a] text-white rounded-lg px-3 py-2 border border-[#2a2a2a] appearance-none focus:outline-none focus:border-[#7C83DB]"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.label} value={lang.label}>{lang.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-white/40 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider">Voice</label>
            <p className="text-[11px] text-white/35 mt-1 mb-1.5">Tap ▶ to hear each voice before picking.</p>
            <div className="mt-1 flex flex-col gap-0.5">
              {TONES.map((t) => {
                const active = tone.id === t.id;
                const isPreviewing = previewingId === t.id;
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition"
                    style={{
                      backgroundColor: active ? "rgba(255,255,255,0.06)" : "transparent",
                      color: active ? "#F2F2F0" : "rgba(242,242,240,0.6)",
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: t.color }}
                    />
                    <button
                      onClick={() => selectTone(t)}
                      className="flex-1 text-left"
                    >
                      {t.label}
                    </button>
                    <button
                      onClick={() => previewVoice(t)}
                      disabled={!!previewingId}
                      className="text-white/40 hover:text-white transition disabled:opacity-30"
                      aria-label={`Preview ${t.label}`}
                    >
                      <Play size={13} className={isPreviewing ? "animate-pulse" : ""} />
                    </button>
                    {active && <Check size={14} style={{ color: t.color }} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-2xl">
        <div className="w-full text-center min-h-[60px] flex items-center justify-center px-4 mb-6">
          {captionText && (
            <p className="text-white/70 text-base leading-relaxed max-h-[160px] overflow-y-auto">
              {captionText}
            </p>
          )}
          {ttsError && (
            <p className="text-red-400/80 text-sm mt-2">{ttsError}</p>
          )}
        </div>

        <div className="relative flex items-center justify-center">
          <ParticleOrb orbState={orbState} accent={accent} toneColor={tone.color} />
          {burst && (
            <SonarBurst
              key={burst.id}
              color={burst.color}
              onDone={() => setBurst(null)}
            />
          )}
        </div>

        {showIdlePrompt && (
          <p className="text-[#7C83DB] text-sm mt-6">Say something...</p>
        )}
        {!showIdlePrompt && orbState !== "idle" && (
          <p className="text-white/40 text-sm mt-6">
            {isListening ? "Listening..." : isThinking ? "Thinking..." : "Speaking..."}
          </p>
        )}
      </div>

      <div className="flex items-center gap-6 mb-4">
        <button
          onClick={onClose}
          className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          aria-label="Close voice mode"
        >
          <X size={22} className="text-white" />
        </button>
        <button
          onClick={startListening}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isListening ? "bg-red-500/80 hover:bg-red-600" : "bg-white/10 hover:bg-white/20"
          }`}
          aria-label={isListening ? "Stop listening" : "Start listening"}
        >
          {isListening ? <Square size={20} className="text-white" /> : <Mic size={22} className="text-white" />}
        </button>
      </div>
    </div>
  );
}