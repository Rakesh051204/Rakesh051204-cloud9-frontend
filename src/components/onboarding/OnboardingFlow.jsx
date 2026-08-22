import { useState } from "react";
import { Compass, Zap, Brain, Sparkles, Hammer } from "lucide-react";

const icons = { Compass, Zap, Brain, Sparkles, Hammer };

const modes = [
  {
    key: "explore",
    label: "Explore",
    icon: "Compass",
    placeholder: "Search the web or your knowledge base...",
    cards: [
      "Analyze your ad campaigns and get optimization recommendations",
      "Compare the top 3 CRMs for a 10-person startup",
      "Summarize recent news on AI regulation",
    ],
  },
  {
    key: "spark",
    label: "Spark",
    icon: "Zap",
    placeholder: "Brainstorm an idea...",
    cards: [
      "Generate startup ideas in the fitness space",
      "Give me 5 angles for a blog post on remote work",
      "Help me name my new SaaS product",
    ],
  },
  {
    key: "think",
    label: "Think",
    icon: "Brain",
    placeholder: "Ask something that needs deep reasoning...",
    cards: [
      "Walk me through the tradeoffs of microservices vs monolith",
      "Help me think through a hard career decision",
      "Explain this concept step by step",
    ],
  },
  {
    key: "create",
    label: "Create",
    icon: "Sparkles",
    placeholder: "What do you want to create?",
    cards: [
      "Write a landing page headline for my app",
      "Draft a cold outreach email",
      "Generate a product description",
    ],
  },
  {
    key: "build",
    label: "Build",
    icon: "Hammer",
    placeholder: "Describe what you want to build...",
    cards: [
      "Build a website or landing page with professional copy and design that converts.",
      "Generate a REST API in Node.js",
      "Review my code for bugs and improvements",
    ],
  },
];

export default function OnboardingFlow({ onModeChange, onPromptSelect }) {
  const [active, setActive] = useState("explore");
  const activeMode = modes.find((m) => m.key === active);

  const handleSelectMode = (key) => {
    setActive(key);
    if (onModeChange) onModeChange(key);
  };

  const handleCardClick = (text) => {
    if (onPromptSelect) onPromptSelect(text);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Pills */}
      <div className="flex gap-3 flex-wrap justify-center">
        {modes.map((mode) => {
          const Icon = icons[mode.icon];
          const isActive = mode.key === active;
          return (
            <button
              key={mode.key}
              onClick={() => handleSelectMode(mode.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-colors ${
                isActive
                  ? "border-accent bg-accent/10 text-primary"
                  : "border-border text-secondary hover:text-primary"
              }`}
            >
              <Icon size={16} />
              {mode.label}
            </button>
          );
        })}
      </div>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
        {activeMode.cards.map((text, i) => (
          <button
            key={i}
            onClick={() => handleCardClick(text)}
            className="text-left p-4 rounded-xl border border-border bg-surface text-secondary text-sm hover:text-primary hover:border-accent transition-colors"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}