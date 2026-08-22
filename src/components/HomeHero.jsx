import { useState } from 'react';
import { 
  Search, Plus, Columns2, Monitor, Mic, Paperclip, Send, 
  GitCompare, AlignLeft, Link, GitBranch, Layers, Globe, Lightbulb
} from 'lucide-react';
import AttachMenu from './AttachMenu';

export default function HomeHero({ onSearch, onOpenProject }) {
  const [input, setInput] = useState('');

  const suggestionCards = [
    'Analyze your ad campaigns and get optimization recommendations',
    'Build a website or landing page with professional copy and design that converts.',
    'Automate a morning briefing of what matters most across your apps'
  ];

  const actionChips = [
    { label: 'Create slides', mode: 'slides' },
    { label: 'Build website', mode: 'website' },
    { label: 'Develop desktop apps', mode: 'desktop' },
    { label: 'Design', mode: 'design' },
    { label: 'More', mode: null },
  ];

  const handleSubmit = () => {
    if (input.trim()) onSearch(input);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full">
        {/* Badge + Credits */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-semibold text-secondary bg-surface px-3 py-1 rounded-full border border-border">
            STOIC 1.6 Lite
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-secondary bg-surface px-3 py-1 rounded-full border border-border flex items-center gap-1">
              <span>✦</span> 563
            </span>
            <span className="text-xs text-secondary">
              Free plan <span className="text-accent cursor-pointer hover:underline">Upgrade</span>
            </span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-primary text-center mb-2">
          What can I do for you?
        </h1>
        <p className="text-center text-secondary text-lg mb-8">
          Assign a task or ask anything
        </p>

        {/* Search Bar - Manus style */}
        <div className="bg-surface border border-border rounded-2xl shadow-card mb-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Assign a task or ask anything"
            rows={2}
            className="w-full bg-transparent px-5 pt-4 pb-2 outline-none text-primary placeholder-secondary resize-none"
          />
          <div className="flex items-center justify-between px-4 pb-3">
            <div className="flex items-center gap-2 text-secondary">
              <AttachMenu />
              <button className="p-1.5 rounded-full hover:bg-surface-hover"><Columns2 size={18} /></button>
              <button className="p-1.5 rounded-full hover:bg-surface-hover"><Monitor size={18} /></button>
            </div>
            <div className="flex items-center gap-2 text-secondary">
              <button className="p-1.5 rounded-full hover:bg-surface-hover"><Paperclip size={18} /></button>
              <button className="p-1.5 rounded-full hover:bg-surface-hover"><Mic size={18} /></button>
              <button
                onClick={handleSubmit}
                className="p-1.5 rounded-full bg-surface-hover text-primary hover:bg-accent hover:text-white transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Suggested cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {suggestionCards.map((text, i) => (
            <div
              key={i}
              onClick={() => onSearch(text)}
              className="bg-surface border border-border rounded-xl p-4 shadow-card hover:shadow-soft transition-shadow cursor-pointer"
            >
              <p className="text-sm text-primary leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* Action chips */}
        <div className="border-t border-border pt-6 flex flex-wrap justify-center gap-2">
          {actionChips.map(({ label, mode }) => (
            <button
              key={label}
              onClick={() => mode ? onOpenProject(mode) : onSearch(label)}
              className="flex items-center gap-1.5 px-4 py-2 bg-surface border border-border rounded-full text-sm text-secondary hover:bg-accent/10 hover:text-primary transition-colors"
            >
              <Plus size={14} className="text-accent" /> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}