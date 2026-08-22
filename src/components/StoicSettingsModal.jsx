import React, { useState } from "react";
import {
  X, Settings, User, Palette, Cpu, Brain, KeyRound, ShieldCheck,
  Search, ChevronRight, Trash2, Eye, EyeOff,
} from "lucide-react";

/* ---------------------------------- nav ---------------------------------- */

const GROUPS = [
  {
    label: "Workspace",
    items: [
      { id: "general", label: "General", icon: Settings },
      { id: "account", label: "Account", icon: User },
      { id: "appearance", label: "Appearance", icon: Palette },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { id: "model", label: "Model & Search", icon: Cpu },
      { id: "memory", label: "Memory", icon: Brain },
    ],
  },
  {
    label: "Data",
    items: [
      { id: "api", label: "API Keys & Billing", icon: KeyRound },
      { id: "privacy", label: "Privacy & Data", icon: ShieldCheck },
    ],
  },
];

const ALL_ITEMS = GROUPS.flatMap((g) => g.items);

/* -------------------------------- helpers -------------------------------- */

function Row({ label, sub, children }) {
  return (
    <div className="flex items-start justify-between gap-8 py-4 border-b border-white/10 last:border-0">
      <div className="max-w-[58%]">
        <div className="text-[15px] text-white">{label}</div>
        {sub && <div className="text-sm text-white/40 mt-1 leading-relaxed">{sub}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <h3 className="text-xs uppercase tracking-[0.14em] text-white/40 mb-5">{children}</h3>;
}

function Pill({ options, value, onChange }) {
  return (
    <div className="flex border border-white/15 rounded-full overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-4 py-1.5 text-sm transition-colors ${
            value === opt ? "bg-white text-black" : "text-white/60 hover:text-white"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${
        checked ? "bg-white justify-end" : "bg-white/15 justify-start"
      }`}
    >
      <div className={`w-4 h-4 rounded-full ${checked ? "bg-black" : "bg-white/80"}`} />
    </button>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="bg-transparent border border-white/15 rounded-lg px-3 py-1.5 text-sm text-right w-52 focus:outline-none focus:border-white/40 placeholder-white/25"
    />
  );
}

function SelectRow({ value, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors">
      {value}
      <ChevronRight size={14} className="rotate-90 opacity-60" />
    </button>
  );
}

/* -------------------------------- panels ---------------------------------- */

function GeneralPanel() {
  const [motion, setMotion] = useState("System");
  const [density, setDensity] = useState("Comfortable");
  return (
    <div className="space-y-10">
      <section>
        <SectionLabel>Interface</SectionLabel>
        <Row label="Chat font"><SelectRow value="Stoic Serif" /></Row>
        <Row label="Language"><SelectRow value="English" /></Row>
        <Row label="Response length"><SelectRow value="Balanced" /></Row>
        <Row label="Density">
          <Pill options={["Comfortable", "Compact"]} value={density} onChange={setDensity} />
        </Row>
        <Row label="Motion" sub="Reduce animation in streaming responses and UI transitions.">
          <Pill options={["System", "Reduced"]} value={motion} onChange={setMotion} />
        </Row>
      </section>
      <section>
        <SectionLabel>Startup</SectionLabel>
        <Row label="Default landing" sub="What Stoic opens to when you launch a new session."><SelectRow value="Search" /></Row>
      </section>
    </div>
  );
}

function AccountPanel() {
  return (
    <div className="space-y-10">
      <section>
        <SectionLabel>Profile</SectionLabel>
        <Row label="Avatar">
          <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center text-xs font-medium">RP</div>
        </Row>
        <Row label="Full name"><TextInput defaultValue="Rakesh Palani" /></Row>
        <Row label="What should Stoic call you?"><TextInput defaultValue="Rakesh" /></Row>
        <Row label="Email"><span className="text-sm text-white/50">rakeshpalani2004@gmail.com</span></Row>
      </section>
      <section>
        <SectionLabel>Instructions for Stoic</SectionLabel>
        <p className="text-sm text-white/40 mb-3">Carried into every new session automatically.</p>
        <textarea
          placeholder="e.g. keep answers brief, prefer code over prose, no fluff"
          rows={4}
          className="w-full bg-transparent border border-white/15 rounded-xl px-4 py-3 text-sm placeholder-white/30 focus:outline-none focus:border-white/40 resize-none"
        />
      </section>
    </div>
  );
}

function AppearancePanel() {
  const [theme] = useState("Monochrome");
  return (
    <div className="space-y-10">
      <section>
        <SectionLabel>Theme</SectionLabel>
        <Row label="Palette" sub="Stoic ships black & white only — no accent colors, by design.">
          <div className="flex items-center gap-2 text-sm text-white/50">
            <div className="w-4 h-4 rounded-full bg-white border border-white/30" />
            <div className="w-4 h-4 rounded-full bg-black border border-white/30" />
            {theme}
          </div>
        </Row>
        <Row label="Code block style"><SelectRow value="Minimal" /></Row>
        <Row label="Corner radius"><SelectRow value="Sharp" /></Row>
      </section>
      <section>
        <SectionLabel>Layout</SectionLabel>
        <Row label="Sidebar" sub="Collapse conversation history by default."><Toggle checked={false} onChange={() => {}} /></Row>
        <Row label="Source cards" sub="Show favicon + domain on search result cards."><Toggle checked={true} onChange={() => {}} /></Row>
      </section>
    </div>
  );
}

function ModelSearchPanel() {
  const [model, setModel] = useState("llama-3.3-70b");
  const [searchBackend, setSearchBackend] = useState("Tavily");
  const models = ["llama-3.3-70b", "kimi-k2", "llama-3.1-8b-instant"];
  return (
    <div className="space-y-10">
      <section>
        <SectionLabel>Model</SectionLabel>
        <Row label="Inference provider"><span className="text-sm text-white/50">Groq</span></Row>
        <Row label="Default model" sub="Used for answer generation unless overridden per-query.">
          <div className="flex flex-col gap-1.5 items-end">
            {models.map((m) => (
              <button
                key={m}
                onClick={() => setModel(m)}
                className={`text-sm px-2.5 py-1 rounded-md ${model === m ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Temperature" sub="Higher values produce more varied answers."><SelectRow value="0.7" /></Row>
      </section>
      <section>
        <SectionLabel>Search</SectionLabel>
        <Row label="Web search backend">
          <Pill options={["Tavily", "SearXNG"]} value={searchBackend} onChange={setSearchBackend} />
        </Row>
        <Row label="Results per query"><SelectRow value="8" /></Row>
        <Row label="Safe search" sub="Filter explicit results from web search."><Toggle checked={true} onChange={() => {}} /></Row>
      </section>
    </div>
  );
}

function MemoryPanel() {
  const [enabled, setEnabled] = useState(true);
  const memories = [
    "Prefers concise, direct answers with code blocks",
    "Working on Stoic (AI answer engine) and CodeZaro (code review SaaS)",
    "Targeting FAANG-level Data Scientist roles",
  ];
  return (
    <div className="space-y-10">
      <section>
        <SectionLabel>Cross-session memory</SectionLabel>
        <Row label="Remember context across sessions" sub="Stored in Supabase, embedded with Voyage AI for retrieval.">
          <Toggle checked={enabled} onChange={setEnabled} />
        </Row>
        <Row label="Retention window"><SelectRow value="90 days" /></Row>
      </section>
      <section>
        <SectionLabel>What Stoic remembers</SectionLabel>
        <div className="space-y-2">
          {memories.map((m, i) => (
            <div key={i} className="flex items-start justify-between gap-4 border border-white/10 rounded-lg px-4 py-3">
              <span className="text-sm text-white/70 leading-relaxed">{m}</span>
              <button className="text-white/30 hover:text-white shrink-0 mt-0.5">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <button className="mt-4 text-sm text-white/50 hover:text-white transition-colors underline underline-offset-4">
          Clear all memories
        </button>
      </section>
    </div>
  );
}

function ApiKeyRow({ label, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <Row label={label}>
      <div className="flex items-center gap-2">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="bg-transparent border border-white/15 rounded-lg px-3 py-1.5 text-sm w-56 text-right focus:outline-none focus:border-white/40 placeholder-white/25 font-mono"
        />
        <button onClick={() => setShow(!show)} className="text-white/40 hover:text-white">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </Row>
  );
}

function ApiBillingPanel() {
  return (
    <div className="space-y-10">
      <section>
        <SectionLabel>API keys</SectionLabel>
        <ApiKeyRow label="Groq" placeholder="gsk_••••••••••••" />
        <ApiKeyRow label="Tavily" placeholder="tvly_••••••••••••" />
        <ApiKeyRow label="Voyage AI" placeholder="pa-••••••••••••" />
        <ApiKeyRow label="Supabase service role" placeholder="eyJhbGciOi••••••" />
      </section>
      <section>
        <SectionLabel>Plan</SectionLabel>
        <Row label="Current plan"><span className="text-sm text-white/50">Self-hosted · free tier</span></Row>
        <Row label="Monthly requests"><span className="text-sm text-white/50">—</span></Row>
      </section>
    </div>
  );
}

function PrivacyPanel() {
  return (
    <div className="space-y-10">
      <section>
        <SectionLabel>Data</SectionLabel>
        <Row label="Incognito sessions" sub="Don't save this conversation to history or memory."><Toggle checked={false} onChange={() => {}} /></Row>
        <Row label="Export my data" sub="Download all conversations and stored memory as JSON.">
          <button className="text-sm text-white/70 hover:text-white border border-white/15 rounded-lg px-3 py-1.5 transition-colors">Export</button>
        </Row>
      </section>
      <section>
        <SectionLabel>Danger zone</SectionLabel>
        <Row label="Delete account" sub="Permanently removes your account, chats, and memory.">
          <button className="text-sm text-white border border-white/30 rounded-lg px-3 py-1.5 hover:bg-white hover:text-black transition-colors">
            Delete
          </button>
        </Row>
      </section>
    </div>
  );
}

/* --------------------------------- map ------------------------------------ */

const PANELS = {
  general: { title: "General", render: GeneralPanel },
  account: { title: "Account", render: AccountPanel },
  appearance: { title: "Appearance", render: AppearancePanel },
  model: { title: "Model & Search", render: ModelSearchPanel },
  memory: { title: "Memory", render: MemoryPanel },
  api: { title: "API Keys & Billing", render: ApiBillingPanel },
  privacy: { title: "Privacy & Data", render: PrivacyPanel },
};

/* --------------------------------- modal ----------------------------------- */

export default function StoicSettingsModal() {
  const [active, setActive] = useState("general");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(true);

  const filteredIds = query
    ? ALL_ITEMS.filter((i) => i.label.toLowerCase().includes(query.toLowerCase())).map((i) => i.id)
    : null;

  const ActivePanel = PANELS[active];

  if (!open) {
    return (
      <div className="min-h-[600px] bg-black flex items-center justify-center">
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-2.5 rounded-full border border-white/20 text-white text-sm hover:bg-white hover:text-black transition-colors"
        >
          Open settings
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[680px] bg-black flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl h-[640px] bg-black border border-white/15 rounded-2xl flex overflow-hidden shadow-2xl">
        {/* Sidebar */}
        <div className="w-64 border-r border-white/10 flex flex-col shrink-0">
          <div className="p-4">
            <div className="flex items-center gap-2 border border-white/15 rounded-lg px-3 py-2">
              <Search size={14} className="text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search settings"
                className="bg-transparent text-sm text-white placeholder-white/30 focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-6">
            {GROUPS.map((group) => {
              const visible = group.items.filter((i) => !filteredIds || filteredIds.includes(i.id));
              if (filteredIds && visible.length === 0) return null;
              return (
                <div key={group.label}>
                  <div className="text-xs uppercase tracking-[0.14em] text-white/30 px-3 mb-1.5">
                    {group.label}
                  </div>
                  <nav className="space-y-0.5">
                    {visible.map((item) => {
                      const Icon = item.icon;
                      const isActive = active === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActive(item.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive ? "bg-white text-black font-medium" : "text-white/70 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <Icon size={15} />
                          {item.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-white/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-xs font-medium">RP</div>
            <div className="leading-tight">
              <div className="text-sm text-white">Rakesh Palani</div>
              <div className="text-xs text-white/40">Free tier</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-8 pt-6 pb-4">
            <h2 className="text-lg text-white font-medium">{ActivePanel.title}</h2>
            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            <ActivePanel.render />
          </div>
        </div>
      </div>
    </div>
  );
}