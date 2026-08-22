import { useState } from 'react';
import { Check, Bot, Code, BookOpen } from 'lucide-react';

const agents = [
  { id: 'default', label: 'Assistant', icon: Bot, description: 'General helper' },
  { id: 'coder', label: 'Coder', icon: Code, description: 'Programming expert' },
  { id: 'researcher', label: 'Researcher', icon: BookOpen, description: 'Deep research' },
];

export default function AgentPicker({ selectedAgent, onSelect }) {
  const [open, setOpen] = useState(false);
  const current = agents.find(a => a.id === selectedAgent) || agents[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors text-xs text-gray-300"
      >
        <current.icon size={14} />
        <span>{current.label}</span>
        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-xl z-50 w-48 overflow-hidden">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => { onSelect(agent.id); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-[#2a2a2a] transition-colors ${
                selectedAgent === agent.id ? 'bg-[#2a2a2a]' : ''
              }`}
            >
              <agent.icon size={16} className="text-gray-400" />
              <div className="flex-1 text-left">
                <div className="text-xs text-white">{agent.label}</div>
                <div className="text-[9px] text-gray-500">{agent.description}</div>
              </div>
              {selectedAgent === agent.id && <Check size={14} className="text-blue-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}