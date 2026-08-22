import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  ArrowUp,
  Square,
  Paperclip,
  X,
  Check,
  Brain,
  Zap,
  Image as ImageIcon,
  FileText,
  FileVideo,
  FileAudio,
  FileArchive,
  Globe,
  Plug,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { SEARCH_MODES } from "../config/searchModes";
import { getDailyPitchRatio } from "../utils/dailySound";
import IncognitoLogo from "./IncognitoLogo";

const API_BASE = "http://localhost:3001";

// ─── Placeholder phrases ─────────────────────────────────────────
const PLACEHOLDER_PHRASES = [
  "Ask anything",
  "Stoic is ready to think this through",
  "What's on your mind?",
  "Let's dig into something",
  "Ask, and I'll go find out",
  "Curious about something? Ask away",
  "What should we figure out today?",
];
const INCOGNITO_PLACEHOLDER = "Ask privately — this won't be saved";

// ─── Dark theme tokens ─────────────────────────────────────────
const DARK_BG = "#0d0d0c";
const DARK_HOVER = "#191918";
const DARK_BORDER = "rgba(255,255,255,0.14)"; // silver outline — was #242422 (invisible against bg)
const LIGHT_TEXT = "#F2F2F0";
const LIGHT_TEXT_SOFT = "rgba(242,242,240,0.6)";
const LIGHT_TEXT_FAINT = "rgba(242,242,240,0.4)";
const WHITE = "#FFFFFF";
const MIC_WHITE = "#FFFFFF";

// ─── File accept — one input covers every type you asked for ─────────
const ACCEPT_ANY_FILE =
  "image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.md,.csv,.json,.zip,.rar,.7z,.xlsx,.xls,.ppt,.pptx";

const TEXTAREA_MIN_HEIGHT = 24;
const TEXTAREA_MAX_HEIGHT = 220;

/* ─── category + icon helpers for attachment cards ─────────────────*/
function categorizeClientSide(file) {
  const name = file.name || "";
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  if (file.type?.startsWith("image/")) return "image";
  if (file.type?.startsWith("video/")) return "video";
  if (file.type?.startsWith("audio/")) return "audio";
  if (ext === ".pdf") return "pdf";
  if ([".doc", ".docx"].includes(ext)) return "docx";
  if ([".zip", ".rar", ".7z"].includes(ext)) return "archive";
  if ([".xlsx", ".xls", ".csv"].includes(ext)) return "spreadsheet";
  return "other";
}

function iconForCategory(category) {
  switch (category) {
    case "video":
      return FileVideo;
    case "audio":
      return FileAudio;
    case "archive":
      return FileArchive;
    case "pdf":
    case "docx":
    case "spreadsheet":
    default:
      return FileText;
  }
}

/* ─── Voice-wave icon ─────────────────────────────────────────── */
function VoiceWaveIcon({ size = 20, color = "#F2F2F0" }) {
  const bars = [6, 11, 15, 11, 6];
  const barWidth = 2.4;
  const gap = 2.6;
  const totalWidth = bars.length * barWidth + (bars.length - 1) * gap;
  const startX = (size - totalWidth) / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      {bars.map((h, i) => {
        const x = startX + i * (barWidth + gap);
        const y = (size - h) / 2;
        return <rect key={i} x={x} y={y} width={barWidth} height={h} rx={barWidth / 2} fill={color} />;
      })}
    </svg>
  );
}

/* ─── Heartbeat mic icon ─────────────────────────────────────────*/
function HeartbeatMicIcon({ size = 22, active = false, color = MIC_WHITE, glowColor = WHITE }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ filter: active ? `drop-shadow(0 0 4px ${glowColor})` : "none", transition: "filter 0.2s ease" }}
    >
      <circle cx="2.5" cy="9.5" r="1" fill={active ? glowColor : color} />
      <line x1="3.5" y1="9.5" x2="7" y2="9.5" stroke={active ? glowColor : color} strokeWidth="1.2" />
      <circle cx="21.5" cy="7.5" r="1" fill={active ? glowColor : color} />
      <line x1="20.5" y1="7.5" x2="17" y2="7.5" stroke={active ? glowColor : color} strokeWidth="1.2" />
      <path
        d="M12 2.5c-2 0-3.5 1.5-3.5 3.5v6c0 2 1.5 3.5 3.5 3.5s3.5-1.5 3.5-3.5V6c0-2-1.5-3.5-3.5-3.5z"
        stroke={active ? glowColor : color}
        strokeWidth="1.3"
      />
      <path
        d="M7 9.5h2l1-2.5 1.5 5 1-4 0.8 1.5H17"
        stroke={active ? glowColor : color}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={active ? { animation: "heartbeatDash 1s ease-in-out infinite" } : undefined}
      />
      <path d="M6.5 13.5a5.5 5.5 0 0 0 11 0" stroke={active ? glowColor : color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="12" y1="19" x2="12" y2="21.5" stroke={active ? glowColor : color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Click-triggered ECG pulse overlay ─────────────────────────────*/
const ECG_BLIP_PATH =
  "M0,14 L40,14 L52,14 L58,4 L64,24 L70,8 L76,14 L92,14 L108,14 L118,14 L124,2 L130,26 L136,10 L142,14 L158,14 L400,14";

function EcgClickPulse({ triggerKey, color = WHITE }) {
  const pathRef = useRef(null);

  useEffect(() => {
    if (!triggerKey) return;
    const path = pathRef.current;
    if (!path) return;
    path.style.transition = "none";
    path.style.opacity = "1";
    path.setAttribute("stroke-dashoffset", "500");
    path.getBoundingClientRect();
    path.style.transition = "stroke-dashoffset 700ms cubic-bezier(.4,0,.2,1), opacity 250ms ease 550ms";
    requestAnimationFrame(() => path.setAttribute("stroke-dashoffset", "0"));
    const fade = setTimeout(() => {
      path.style.opacity = "0";
    }, 700);
    return () => clearTimeout(fade);
  }, [triggerKey]);

  return (
    <svg
      viewBox="0 0 400 28"
      preserveAspectRatio="none"
      style={{ position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)", width: "100%", height: 28, pointerEvents: "none" }}
    >
      <path
        ref={pathRef}
        d={ECG_BLIP_PATH}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="500"
        strokeDashoffset="500"
        style={{ opacity: 0 }}
      />
    </svg>
  );
}

// ─── @ mention menu ─────────────────────────────────────────────────
const MENTION_OPTIONS = [
  {
    id: "image",
    label: "Create an image",
    keywords: ["image", "img", "create"],
    insert: "@create-image ",
    icon: ImageIcon,
    bg: "#3a2a1f",
    fg: "#e8a765",
    hint: "Generates an image from your description.",
    examples: ["A watercolor mountain sunset", "A minimal logo for a coffee brand", "A cyberpunk city street at night"],
  },
  {
    id: "write",
    label: "Write or edit",
    keywords: ["write", "edit"],
    insert: "@write-edit ",
    icon: FileText,
    bg: "#1f2a3a",
    fg: "#6ba3e8",
    hint: "Drafts, rewrites, or polishes text for you.",
    examples: ["Write a follow-up email to a client", "Rewrite this paragraph to sound more formal", "Fix grammar in my cover letter"],
  },
  {
    id: "search",
    label: "Search the web",
    keywords: ["search", "web"],
    insert: "@web-search ",
    icon: Globe,
    bg: "#1f3a28",
    fg: "#5fbb7a",
    hint: "Looks up current info and cites its sources.",
    examples: ["Who is the CEO of Perplexity?", "Latest OpenAI news", "Current NVIDIA stock price"],
  },
];

export default function SearchBox({
  onSend,
  loading,
  onStop,
  onOpenVoice,
  incognito = false,
  model = "openai/gpt-oss-120b",
  onModelChange,
  sessionId,
  onFileUploaded,
  deepResearchEnabled = false,
  onToggleDeepResearch,
  codeAnalysisEnabled = false,
  onToggleCodeAnalysis,
  onAddLocation,
  onConnectApps,
}) {
  const [query, setQuery] = useState("");
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [activeMentionCard, setActiveMentionCard] = useState(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [menuPhase, setMenuPhase] = useState("measuring"); // 'measuring' | 'ready'
  // attachedFiles entries: { localId, id, name, type, size, status: 'uploading'|'done'|'error', previewUrl }
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [mode] = useState(SEARCH_MODES?.[0]?.id ?? "fast");
  const [searchOn, setSearchOn] = useState(true);
  const [computerOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [levels, setLevels] = useState(Array(40).fill(2));
  const [showCancelTip, setShowCancelTip] = useState(false);
  const [voicePop, setVoicePop] = useState(false);
  const [circleHover, setCircleHover] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const inputRef = useRef(null);
  const boxRef = useRef(null);
  const plusButtonRef = useRef(null);
  const attachMenuRef = useRef(null);
  const recognitionRef = useRef(null);
  const preRecordQueryRef = useRef("");
  const manualStopRef = useRef(false);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const rafRef = useRef(null);
  const dailyPitch = useRef(1);
  const voicePopTimeoutRef = useRef(null);
  const circleHoverTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const MENU_WIDTH = 260;
  const GAP = 8;
  const EDGE_PADDING = 8;

  // ─── Effects ─────────────────────────────────────────────────────
  useEffect(() => {
    dailyPitch.current = getDailyPitchRatio();
  }, []);

  useEffect(() => {
    if (query || incognito) return;
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDER_PHRASES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [query, incognito]);

  useEffect(() => {
    if (showAttachMenu) setMenuPhase("measuring");
  }, [showAttachMenu]);

  useLayoutEffect(() => {
    if (!showAttachMenu || menuPhase !== "measuring" || !attachMenuRef.current || !plusButtonRef.current) {
      return;
    }
    const menuEl = attachMenuRef.current;
    const btnRect = plusButtonRef.current.getBoundingClientRect();
    const menuHeight = menuEl.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = btnRect.left;
    if (left + MENU_WIDTH + EDGE_PADDING > vw) left = vw - MENU_WIDTH - EDGE_PADDING;
    if (left < EDGE_PADDING) left = EDGE_PADDING;

    const spaceAbove = btnRect.top - GAP;
    const spaceBelow = vh - btnRect.bottom - GAP;

    let top;
    if (menuHeight <= spaceAbove || spaceAbove >= spaceBelow) {
      top = btnRect.top - GAP - menuHeight;
      top = Math.max(top, EDGE_PADDING);
    } else {
      top = btnRect.bottom + GAP;
      const maxTop = Math.max(vh - EDGE_PADDING - menuHeight, EDGE_PADDING);
      top = Math.min(top, maxTop);
    }

    menuEl.style.left = `${left}px`;
    menuEl.style.top = `${top}px`;
    menuEl.style.maxHeight = `${vh - EDGE_PADDING * 2}px`;
    menuEl.style.visibility = "visible";
    setMenuPhase("ready");
  }, [showAttachMenu, menuPhase]);

  useEffect(() => {
    if (!showAttachMenu) return;
    const remeasure = () => setMenuPhase("measuring");
    window.addEventListener("resize", remeasure);
    window.addEventListener("scroll", remeasure, true);
    return () => {
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("scroll", remeasure, true);
    };
  }, [showAttachMenu]);

  useEffect(() => {
    function handleClick(e) {
      const clickedBox = boxRef.current && boxRef.current.contains(e.target);
      const clickedMenu = attachMenuRef.current && attachMenuRef.current.contains(e.target);
      if (!clickedBox && !clickedMenu) {
        setMentionOpen(false);
        setShowAttachMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(voicePopTimeoutRef.current);
      clearTimeout(circleHoverTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      manualStopRef.current = true;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
    };
  }, []);

  // Revoke any object URLs we created for image previews on unmount
  useEffect(() => {
    return () => {
      attachedFiles.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(Math.max(el.scrollHeight, TEXTAREA_MIN_HEIGHT), TEXTAREA_MAX_HEIGHT);
    el.style.height = `${next}px`;
  }, [query]);

  // ─── @ mention detection ─────────────────────────────────────────
  const filteredMentionOptions = mentionOpen
    ? MENTION_OPTIONS.filter((opt) => {
        if (!mentionFilter) return true;
        const f = mentionFilter.toLowerCase();
        return opt.label.toLowerCase().includes(f) || opt.keywords.some((k) => k.startsWith(f));
      })
    : [];

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    const cursor = e.target.selectionStart ?? value.length;
    const textBeforeCursor = value.slice(0, cursor);
    const match = textBeforeCursor.match(/(?:^|\s)@([a-zA-Z]*)$/);
    if (match) {
      setMentionOpen(true);
      setMentionFilter(match[1]);
    } else {
      setMentionOpen(false);
      setMentionFilter("");
    }
  };

  const selectMention = (option) => {
    const cursor = inputRef.current?.selectionStart ?? query.length;
    const before = query.slice(0, cursor).replace(/@([a-zA-Z]*)$/, "");
    const after = query.slice(cursor);
    const next = `${before}${option.insert}${after}`;
    setQuery(next);
    setMentionOpen(false);
    setMentionFilter("");
    setActiveMentionCard(option);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // ─── FIXED handleSubmit ─────────────────────────────────────────────
  const handleSubmit = (value = query) => {
    const trimmed = value.trim();
    const doneAttachments = attachedFiles.filter((f) => f.status === "done");
    if ((!trimmed && doneAttachments.length === 0) || loading) return;

    // Full metadata (name/type/preview) goes to the UI layer so the sent
    // message bubble can actually show the image — not just its id.
    const attachmentsMeta = doneAttachments.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      previewUrl: f.previewUrl || null,
    }));

    onSend?.(trimmed, {
      mode,
      webSearchOn: searchOn,
      deepResearch: deepResearchEnabled,
      codeAnalysis: codeAnalysisEnabled,
      computer: computerOn,
      model,
      attachments: doneAttachments.map((f) => f.id),
      attachmentsMeta,
    });

    setQuery("");
    // NOTE: we intentionally do NOT revoke previewUrl here anymore.
    // The chat bubble now owns that blob URL for displaying the thumbnail.
    // It only gets revoked on manual removeAttachment() or on unmount.
    setAttachedFiles([]);
    setMentionOpen(false);
    setActiveMentionCard(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !mentionOpen) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setMentionOpen(false);
      setActiveMentionCard(null);
    }
  };

  // ─── File upload — Claude-style: optimistic card first, then fill in ─
  const uploadFile = async (file) => {
    if (!file) return;
    if (!sessionId) {
      alert("Still setting up your session — try attaching again in a second.");
      return;
    }

    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const category = categorizeClientSide(file);
    const previewUrl = category === "image" ? URL.createObjectURL(file) : null;

    // Card appears immediately, before the network request even starts —
    // this is the part that made ChatGPT/Claude feel instant.
    setAttachedFiles((prev) => [
      ...prev,
      { localId, id: null, name: file.name, type: category, size: file.size, status: "uploading", previewUrl },
    ]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", sessionId);

    try {
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setAttachedFiles((prev) =>
          prev.map((f) =>
            f.localId === localId
              ? { ...f, id: data.id, name: data.name || f.name, type: data.type || f.type, status: "done" }
              : f
          )
        );
        onFileUploaded?.(data);
      } else {
        setAttachedFiles((prev) =>
          prev.map((f) => (f.localId === localId ? { ...f, status: "error" } : f))
        );
      }
    } catch (err) {
      setAttachedFiles((prev) =>
        prev.map((f) => (f.localId === localId ? { ...f, status: "error" } : f))
      );
    }
    setShowAttachMenu(false);
  };

  const removeAttachment = (entry) => {
    setAttachedFiles((prev) => prev.filter((f) => f.localId !== entry.localId));
    if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl);
    if (entry.id && sessionId) {
      fetch(`${API_BASE}/upload/${entry.id}?sessionId=${encodeURIComponent(sessionId)}`, {
        method: "DELETE",
      }).catch(() => {});
    }
  };

  const handleFilePicked = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  // ─── Paste support — the actual "Claude style" behavior requested ────
  // Ctrl+V of a screenshot, copied image, or copied file goes straight
  // into an attachment card instead of failing or dumping garbage text.
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items || items.length === 0) return;
    const files = [];
    for (const item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length === 0) return; // plain text paste — let it behave normally
    e.preventDefault();
    files.forEach((file) => uploadFile(file));
  };

  // ─── Audio ─────────────────────────────────────────────────────────
  const playTone = (freq, duration = 120) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq * dailyPitch.current;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    } catch (e) {}
  };

  const startLevelMeter = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(data);
        const bars = Array.from({ length: 40 }, (_, i) => {
          const v = data[i % data.length] || 0;
          const scaled = Math.pow(v / 255, 0.6) * 24;
          return Math.max(2, Math.min(24, scaled));
        });
        setLevels(bars);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      console.error("Mic level meter failed:", e);
      alert("Couldn't access your microphone. Check the browser's mic permission for this site.");
    }
  };

  const stopLevelMeter = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    setLevels(Array(40).fill(2));
  };

  // ─── Dictation ─────────────────────────────────────────────────────
  const toggleDictation = () => {
    setPulseKey((k) => k + 1);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input isn't supported in this browser.");
      return;
    }
    if (isRecording) {
      confirmDictation();
      return;
    }
    preRecordQueryRef.current = query;
    manualStopRef.current = false;
    startLevelMeter();

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      playTone(880);
    };

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setQuery(transcript);
    };

    recognition.onerror = (event) => {
      console.warn("SpeechRecognition error:", event.error);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        manualStopRef.current = true;
        stopLevelMeter();
        setIsRecording(false);
        alert("Microphone access was blocked. Please allow mic permission and try again.");
        return;
      }
    };

    recognition.onend = () => {
      if (!manualStopRef.current && isRecording) {
        try {
          recognition.start();
          return;
        } catch (e) {}
      }
      stopLevelMeter();
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const confirmDictation = () => {
    manualStopRef.current = true;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    stopLevelMeter();
    setIsRecording(false);
    playTone(440);
  };

  const cancelDictation = () => {
    manualStopRef.current = true;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    stopLevelMeter();
    setQuery(preRecordQueryRef.current);
    setIsRecording(false);
    playTone(300);
  };

  useEffect(() => {
    if (!isRecording) return;
    const handleKey = (e) => {
      if (e.key === "Escape") cancelDictation();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isRecording]);

  // ─── Circle button ─────────────────────────────────────────────────
  const handleCircleClick = () => {
    if (loading) {
      onStop?.();
      return;
    }
    if (query.trim()) {
      handleSubmit();
      return;
    }
    playTone(660, 90);
    setVoicePop(true);
    clearTimeout(voicePopTimeoutRef.current);
    voicePopTimeoutRef.current = setTimeout(() => setVoicePop(false), 420);
    onOpenVoice?.();
  };

  const handleCircleHoverEnter = () => {
    if (loading || query.trim()) return;
    setCircleHover(true);
    clearTimeout(circleHoverTimeoutRef.current);
    circleHoverTimeoutRef.current = setTimeout(() => setCircleHover(false), 500);
    playTone(760, 70);
  };

  const isVoiceIconState = !loading && !query.trim();
  const activePlaceholder = incognito ? INCOGNITO_PLACEHOLDER : PLACEHOLDER_PHRASES[placeholderIdx];

  // ─── The 7 attach-menu items ─────────────────────────────────────
  const attachMenuItems = [
    { id: "upload", icon: Paperclip, label: "Upload files", shortcut: "Ctrl+U", onClick: () => fileInputRef.current?.click() },
    { id: "websearch", icon: Globe, label: "Web search", checked: searchOn, onClick: () => setSearchOn((v) => !v) },
    { id: "deepresearch", icon: Brain, label: "Deep research", checked: deepResearchEnabled, onClick: () => onToggleDeepResearch?.() },
    { id: "codeanalysis", icon: Zap, label: "Code / Data analysis", checked: codeAnalysisEnabled, onClick: () => onToggleCodeAnalysis?.() },
    { id: "location", icon: MapPin, label: "Add location", onClick: () => { onAddLocation?.(); setShowAttachMenu(false); } },
    { id: "connect", icon: Plug, label: "Connect apps", chevron: true, onClick: () => { onConnectApps?.(); setShowAttachMenu(false); } },
    { id: "more", icon: FileText, label: "More tools", chevron: true, onClick: () => setShowAttachMenu(false) },
  ];

  // ─── RENDER ─────────────────────────────────────────────────────
  return (
    <div ref={boxRef} className="relative w-full max-w-[720px]">
      <input ref={fileInputRef} type="file" accept={ACCEPT_ANY_FILE} onChange={handleFilePicked} style={{ display: "none" }} />

      {/* @ mention menu */}
      {mentionOpen && filteredMentionOptions.length > 0 && (
        <div className="absolute bottom-full mb-2 w-full rounded-xl border p-1.5 z-20" style={{ backgroundColor: DARK_BG, borderColor: DARK_BORDER }}>
          {filteredMentionOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => selectMention(opt)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = DARK_HOVER)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 26, height: 26, backgroundColor: opt.bg }}>
                  <Icon size={14} style={{ color: opt.fg }} />
                </span>
                <span className="flex flex-col">
                  <span className="text-[14px]" style={{ color: LIGHT_TEXT }}>{opt.label}</span>
                  <span className="text-[12px]" style={{ color: LIGHT_TEXT_FAINT }}>{opt.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Inline explainer card */}
      {activeMentionCard && (
        <div className="mb-2 rounded-xl border p-3" style={{ backgroundColor: DARK_BG, borderColor: DARK_BORDER }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 26, height: 26, backgroundColor: activeMentionCard.bg }}>
                <activeMentionCard.icon size={14} style={{ color: activeMentionCard.fg }} />
              </span>
              <div>
                <p className="text-[14px]" style={{ color: LIGHT_TEXT, margin: 0 }}>{activeMentionCard.label}</p>
                <p className="text-[12px]" style={{ color: LIGHT_TEXT_FAINT, margin: 0 }}>{activeMentionCard.hint}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveMentionCard(null)}
              aria-label="Dismiss"
              className="shrink-0 rounded-full p-1 transition"
              style={{ color: LIGHT_TEXT_FAINT }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = DARK_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <X size={14} />
            </button>
          </div>
          <div className="mt-2 flex flex-col gap-1">
            {activeMentionCard.examples.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setQuery((q) => `${q}${ex}`);
                  setActiveMentionCard(null);
                  requestAnimationFrame(() => inputRef.current?.focus());
                }}
                className="text-left text-[13px] rounded-lg px-2 py-1.5 transition"
                style={{ color: LIGHT_TEXT_SOFT }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = DARK_HOVER)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attach menu — portaled + position-clamped */}
      {showAttachMenu &&
        createPortal(
          <div
            ref={attachMenuRef}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: MENU_WIDTH,
              visibility: menuPhase === "ready" ? "visible" : "hidden",
              backgroundColor: "#000000",
              border: `1px solid ${DARK_BORDER}`,
              borderRadius: 14,
              padding: 6,
              boxShadow: "0 12px 32px rgba(0,0,0,0.55)",
              zIndex: 999,
              overflowY: "auto",
            }}
          >
            {attachMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[14px] transition"
                  style={{ color: LIGHT_TEXT }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = DARK_HOVER)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <span style={{ color: LIGHT_TEXT_SOFT }}>
                    <Icon size={15} />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && <span className="text-[12px]" style={{ color: LIGHT_TEXT_FAINT }}>{item.shortcut}</span>}
                  {item.chevron && <ChevronRight size={14} style={{ color: LIGHT_TEXT_FAINT }} />}
                  {item.checked !== undefined && item.checked && <Check size={15} style={{ color: LIGHT_TEXT }} />}
                </button>
              );
            })}
          </div>,
          document.body
        )}

      {isRecording ? (
        <div className="flex items-center gap-3 rounded-2xl border pl-4 pr-2 py-3 outline-none relative" style={{ backgroundColor: DARK_BG, borderColor: DARK_BORDER }}>
          <div className="flex items-center gap-[3px] flex-1 h-6 overflow-hidden">
            {levels.map((h, i) => (
              <div key={i} style={{ width: 3, height: h, borderRadius: 2, backgroundColor: LIGHT_TEXT_FAINT, transition: "height 60ms linear", flexShrink: 0 }} />
            ))}
          </div>
          <button
            onClick={cancelDictation}
            onMouseEnter={() => setShowCancelTip(true)}
            onMouseLeave={() => setShowCancelTip(false)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition"
            style={{ backgroundColor: DARK_HOVER, color: LIGHT_TEXT }}
            aria-label="Cancel dictation"
          >
            <X size={16} />
          </button>
          <button onClick={confirmDictation} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition" style={{ backgroundColor: WHITE }} aria-label="Confirm dictation">
            <Check size={16} className="text-[#0F0F0E]" />
          </button>
          {showCancelTip && (
            <div className="absolute right-2 -bottom-9 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs shadow-lg z-20" style={{ backgroundColor: DARK_BG, color: LIGHT_TEXT }}>
              <b>Cancel Dictation</b> <span style={{ color: LIGHT_TEXT_FAINT }}>ESC</span>
            </div>
          )}
        </div>
      ) : (
        <div
          className="flex flex-col gap-2 px-3 pt-3 pb-2 outline-none border transition-all duration-300 rounded-2xl"
          style={{
            backgroundColor: DARK_BG,
            borderColor: incognito
              ? "rgba(242,242,240,0.15)"
              : isFocused
              ? "rgba(255,255,255,0.55)"
              : "rgba(255,255,255,0.35)",
            boxShadow: isFocused
              ? "0 0 0 1px rgba(255,255,255,0.16), 0 0 18px rgba(255,255,255,0.12), 0 0 36px rgba(255,255,255,0.06)"
              : "0 0 0 1px rgba(255,255,255,0.10)",
          }}
        >
          {/* Claude-style attachment cards */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-3 px-1 pt-1">
              {attachedFiles.map((f) => {
                const Icon = iconForCategory(f.type);
                return (
                  <div
                    key={f.localId}
                    className="relative rounded-2xl overflow-hidden shrink-0"
                    style={{
                      width: 84,
                      height: 84,
                      backgroundColor: DARK_HOVER,
                      border: `1px solid ${f.status === "error" ? "#7a3a3a" : DARK_BORDER}`,
                    }}
                    title={f.name}
                  >
                    {f.type === "image" && f.previewUrl ? (
                      <img src={f.previewUrl} alt={f.name} className="w-full h-full object-cover" style={{ opacity: f.status === "uploading" ? 0.55 : 1 }} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-1.5">
                        <Icon size={22} style={{ color: LIGHT_TEXT_FAINT }} />
                        <span
                          style={{
                            fontSize: 10,
                            color: LIGHT_TEXT_FAINT,
                            maxWidth: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            textAlign: "center",
                          }}
                        >
                          {f.name}
                        </span>
                      </div>
                    )}

                    {f.status === "uploading" && (
                      <div className="absolute inset-0 shimmer-overlay" />
                    )}

                    {f.status === "error" && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
                        <span style={{ fontSize: 10, color: "#e08787" }}>Failed</span>
                      </div>
                    )}

                    <button
                      onClick={() => removeAttachment(f)}
                      aria-label="Remove attachment"
                      className="absolute top-1 right-1 flex items-center justify-center rounded-full"
                      style={{ width: 18, height: 18, backgroundColor: "rgba(0,0,0,0.65)", color: LIGHT_TEXT }}
                    >
                      <X size={11} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-start gap-2">
            {incognito && (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center mt-[1px]" title="Private mode is on">
                <IncognitoLogo size={16} active bg={DARK_BG} />
              </span>
            )}
            <div className="relative flex-1">
              <EcgClickPulse triggerKey={pulseKey} color={WHITE} />
              {!query && (
                <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden" style={{ height: TEXTAREA_MIN_HEIGHT }}>
                  <span key={incognito ? "incognito" : placeholderIdx} className="placeholder-rotate text-[15px] whitespace-nowrap" style={{ color: LIGHT_TEXT_FAINT }}>
                    {activePlaceholder}
                  </span>
                </div>
              )}
              <textarea
                ref={inputRef}
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder=""
                rows={1}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                name="stoic-search-no-autofill"
                id="stoic-search-no-autofill"
                className="w-full bg-transparent text-[15px] outline-none border-none appearance-none resize-none focus:outline-none focus:ring-0 focus:shadow-none leading-6 relative"
                style={{
                  boxShadow: "none",
                  WebkitBoxShadow: "none",
                  color: LIGHT_TEXT,
                  colorScheme: "dark",
                  forcedColorAdjust: "none",
                  minHeight: TEXTAREA_MIN_HEIGHT,
                  maxHeight: TEXTAREA_MAX_HEIGHT,
                  overflowY: "auto",
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                ref={plusButtonRef}
                onClick={() => setShowAttachMenu((v) => !v)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition"
                style={{
                  color: LIGHT_TEXT_FAINT,
                  backgroundColor: showAttachMenu ? DARK_HOVER : "transparent",
                  transform: showAttachMenu ? "rotate(45deg)" : "rotate(0deg)",
                  transition: "background 120ms ease, transform 120ms ease",
                }}
                onMouseEnter={(e) => { if (!showAttachMenu) e.currentTarget.style.backgroundColor = DARK_HOVER; }}
                onMouseLeave={(e) => { if (!showAttachMenu) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                {showAttachMenu ? <X size={18} /> : <Plus size={18} />}
              </button>            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleDictation}
                className="mic-jiggle-hover flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition"
                style={{ color: MIC_WHITE }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = DARK_HOVER)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                aria-label="Voice dictation"
                title="Click to dictate (speak into mic)"
              >
                <HeartbeatMicIcon size={22} active={isRecording} color={MIC_WHITE} glowColor={WHITE} />
              </button>

              <button
                onClick={handleCircleClick}
                onMouseEnter={handleCircleHoverEnter}
                title={isVoiceIconState ? "Voice Mode" : loading ? "Stop" : "Send"}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${voicePop ? "voice-btn-pop" : ""}`}
                style={{ backgroundColor: LIGHT_TEXT }}
              >
                {loading ? (
                  <Square size={13} className="fill-[#141413] text-[#141413]" />
                ) : query.trim() ? (
                  <ArrowUp size={16} className="text-[#141413]" />
                ) : (
                  <span className={circleHover ? "circle-wave-jiggle" : ""} style={{ display: "inline-flex" }}>
                    <VoiceWaveIcon size={20} color="#141413" />
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .mic-jiggle-hover:hover svg {
          animation: micJiggle 0.4s ease-in-out;
          transform-origin: center;
        }
        @keyframes micJiggle {
          0%   { transform: rotate(0deg); }
          20%  { transform: rotate(-14deg); }
          40%  { transform: rotate(12deg); }
          60%  { transform: rotate(-8deg); }
          80%  { transform: rotate(6deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes heartbeatDash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .circle-wave-jiggle svg {
          animation: micJiggle 0.5s ease-in-out;
          transform-origin: center;
        }
        @keyframes voiceBtnPop {
          0%   { transform: scale(1) rotate(0deg); }
          30%  { transform: scale(1.28) rotate(-10deg); }
          55%  { transform: scale(0.9) rotate(8deg); }
          75%  { transform: scale(1.1) rotate(-4deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .voice-btn-pop {
          animation: voiceBtnPop 0.42s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes placeholderCycle {
          0%   { opacity: 0; transform: translateY(6px); }
          15%  { opacity: 1; transform: translateY(0); }
          85%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-6px); }
        }
        .placeholder-rotate {
          display: inline-block;
          animation: placeholderCycle 3s ease forwards;
        }
        textarea#stoic-search-no-autofill::-webkit-scrollbar {
          width: 6px;
        }
        textarea#stoic-search-no-autofill::-webkit-scrollbar-thumb {
          background: rgba(242,242,240,0.15);
          border-radius: 3px;
        }
        .shimmer-overlay {
          background: linear-gradient(
            110deg,
            rgba(255,255,255,0) 30%,
            rgba(255,255,255,0.12) 50%,
            rgba(255,255,255,0) 70%
          );
          background-size: 200% 100%;
          animation: shimmerSweep 1.3s ease-in-out infinite;
        }
        @keyframes shimmerSweep {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}