import React, { useMemo, useState } from "react";
import {
  Plus,
  Bot,
  Puzzle,
  Clock,
  Library,
  FolderKanban,
  MessageSquare,
  Image as ImageIcon,
  GraduationCap,
  Code2,
  Search,
  FileText,
  Mic,
  AudioLines,
  EyeOff,
  Eye,
  PanelLeft,
  Quote,
} from "lucide-react";
import "./StoicHomePage.css";

// ---- Daily rotating Stoic quotes -------------------------------------
// Deterministic pick by day-of-year so every user sees the same quote
// on a given day, and it changes automatically at midnight.
const QUOTES = [
  { text: "You have power over your mind, not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
  { text: "It's not what happens to you, but how you react to it that matters.", author: "Epictetus" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "He who is brave is free.", author: "Seneca" },
  { text: "First say to yourself what you would be, and then do what you have to do.", author: "Epictetus" },
  { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
  { text: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca" },
  { text: "No man is free who is not master of himself.", author: "Epictetus" },
  { text: "You could leave life right now. Let that determine what you do and say and think.", author: "Marcus Aurelius" },
  { text: "Luck is what happens when preparation meets opportunity.", author: "Seneca" },
  { text: "Man is disturbed not by things, but by the views he takes of them.", author: "Epictetus" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
  { text: "Every new beginning comes from some other beginning's end.", author: "Seneca" },
  { text: "Wealth consists in not having great possessions, but in having few wants.", author: "Epictetus" },
];

function useDailyQuote() {
  return useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const dayOfYear = Math.floor(diff / 86400000);
    const idx = dayOfYear % QUOTES.length;
    const dateLabel = now.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    return { ...QUOTES[idx], dateLabel };
  }, []);
}

// ---- Sidebar data ------------------------------------------------------
const NAV_ITEMS = [
  { icon: Bot, label: "Agent" },
  { icon: Puzzle, label: "Plugins" },
  { icon: Clock, label: "Scheduled" },
  { icon: Library, label: "Library" },
  { icon: FolderKanban, label: "Projects" },
];

const TASKS = [
  { label: "who is an tamilnadu cm", date: "2 Jul" },
  { label: "what is intersting news in tamilandu l...", date: "2 Jul" },
  { label: "who is an ceo of google", date: "2 Jul" },
];

const MODES = [
  { icon: MessageSquare, label: "Chat" },
  { icon: ImageIcon, label: "Image creation" },
  { icon: GraduationCap, label: "Study mode" },
  { icon: Code2, label: "Coding mode" },
  { icon: Search, label: "Search mode" },
  { icon: FileText, label: "Notes mode" },
];

const SPEEDS = ["Fast", "Balanced", "Quality"];

export default function StoicHomePage({ userName = "Rakesh" }) {
  const quote = useDailyQuote();
  const [incognito, setIncognito] = useState(false);
  const [speed, setSpeed] = useState("Fast");
  const [speedOpen, setSpeedOpen] = useState(false);
  const [activeMode, setActiveMode] = useState("Chat");
  const [query, setQuery] = useState("");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className={`stoic-shell ${incognito ? "is-incognito" : ""}`}>
      {/* ---------------- Sidebar ---------------- */}
      <aside className="stoic-sidebar">
        <div className="stoic-sidebar-top">
          <div className="stoic-brand">
            <span className="stoic-brand-mark" aria-hidden="true" />
            <span className="stoic-brand-name">Stoic</span>
          </div>
          <button className="stoic-icon-btn" aria-label="Search">
            <Search size={16} />
          </button>
          <button className="stoic-icon-btn" aria-label="Collapse sidebar">
            <PanelLeft size={16} />
          </button>
        </div>

        <button className="stoic-new-task">
          <Plus size={16} />
          New task
        </button>

        <nav className="stoic-nav">
          {NAV_ITEMS.map(({ icon: Icon, label }) => (
            <button key={label} className="stoic-nav-item">
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <button className="stoic-new-project">
          <Plus size={14} />
          New project
        </button>

        <div className="stoic-tasks">
          <p className="stoic-tasks-label">Tasks</p>
          {TASKS.map((t) => (
            <button key={t.label} className="stoic-task-item">
              <span className="stoic-task-text">{t.label}</span>
              <span className="stoic-task-date">{t.date}</span>
            </button>
          ))}
        </div>

        <div className="stoic-sidebar-footer">
          <div className="stoic-avatar">RP</div>
          <div className="stoic-user-meta">
            <span className="stoic-user-name">{userName} P</span>
            <span className="stoic-user-plan">Free plan</span>
          </div>
          <a className="stoic-upgrade" href="#upgrade">Upgrade</a>
        </div>
      </aside>

      {/* ---------------- Main ---------------- */}
      <main className="stoic-main">
        <div className="stoic-topbar">
          <button
            className={`stoic-incognito-pill ${incognito ? "active" : ""}`}
            onClick={() => setIncognito((v) => !v)}
          >
            {incognito ? <EyeOff size={14} /> : <Eye size={14} />}
            Incognito
          </button>
        </div>

        <div className="stoic-center">
          <h1 className="stoic-greeting">
            <span className="stoic-greeting-mark" aria-hidden="true" />
            {greeting}, {userName}
          </h1>

          {/* Live daily quote */}
          <div className="stoic-quote-card">
            <Quote size={16} className="stoic-quote-icon" aria-hidden="true" />
            <p className="stoic-quote-text">{quote.text}</p>
            <div className="stoic-quote-meta">
              <span className="stoic-quote-author">— {quote.author}</span>
              <span className="stoic-quote-date">{quote.dateLabel}</span>
            </div>
          </div>

          <div className="stoic-modes">
            {MODES.map(({ icon: Icon, label }) => (
              <button
                key={label}
                className={`stoic-mode-pill ${activeMode === label ? "active" : ""}`}
                onClick={() => setActiveMode(label)}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <div className="stoic-input-bar">
            <button className="stoic-icon-btn" aria-label="Add attachment">
              <Plus size={16} />
            </button>
            <input
              className="stoic-input"
              placeholder="Ask anything"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="stoic-speed-wrap">
              <button
                className="stoic-speed-btn"
                onClick={() => setSpeedOpen((v) => !v)}
              >
                {speed}
              </button>
              {speedOpen && (
                <div className="stoic-speed-menu">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      className="stoic-speed-option"
                      onClick={() => {
                        setSpeed(s);
                        setSpeedOpen(false);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="stoic-icon-btn" aria-label="Voice dictation">
              <Mic size={16} />
            </button>
            <button className="stoic-send-btn" aria-label="Send">
              <AudioLines size={16} />
            </button>
          </div>

          <p className="stoic-disclaimer">
            Stoic is AI and can make mistakes. Please double-check important information.
          </p>
        </div>
      </main>
    </div>
  );
}