import {
  MessageSquare,
  Search,
  Code2,
  Mic,
  EyeOff,
  Sparkles,
  FileText,
} from "lucide-react";

// Palette (matches Stoic design tokens)
const CLAY = "#CC785C";
const PERIWINKLE = "#7C83DB";
const NEUTRAL = "#9CA3AF"; // gray-400 fallback

/**
 * getSessionIcon(session)
 * Returns { Icon, color } for rendering next to a sidebar conversation row.
 * Looks at common shape fields first (type / mode / category), then falls
 * back to lightweight keyword matching on the title, then a neutral default.
 */
export function getSessionIcon(session = {}) {
  if (session.incognito) {
    return { Icon: EyeOff, color: PERIWINKLE };
  }

  const key = (
    session.type ||
    session.mode ||
    session.category ||
    ""
  ).toString().toLowerCase();

  const title = (session.title || "").toLowerCase();

  const matches = (kw) => key.includes(kw) || title.includes(kw);

  if (matches("code") || matches("debug") || matches("dev")) {
    return { Icon: Code2, color: PERIWINKLE };
  }

  if (matches("search") || matches("research") || matches("discover")) {
    return { Icon: Search, color: CLAY };
  }

  if (matches("voice") || matches("audio") || matches("call")) {
    return { Icon: Mic, color: CLAY };
  }

  if (matches("doc") || matches("report") || matches("write")) {
    return { Icon: FileText, color: NEUTRAL };
  }

  if (session.is_favorite) {
    return { Icon: Sparkles, color: CLAY };
  }

  // Default: plain chat conversation
  return { Icon: MessageSquare, color: NEUTRAL };
}