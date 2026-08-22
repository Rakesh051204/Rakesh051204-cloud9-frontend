import { useState } from 'react';
import { Search, Mic, Paperclip, Send } from 'lucide-react';

export default function SearchBar({ onSearch, placeholder = "Ask anything..." }) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim()) {
      onSearch(input);
      setInput('');
    }
  };

  return (
    <div className="flex items-center bg-surface border border-border rounded-xl shadow-card focus-within:ring-2 focus-within:ring-accent/30 transition-all px-3 py-1.5">
      <button className="p-1.5 text-secondary hover:text-primary transition-colors">
        <Paperclip size={18} />
      </button>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-2 py-2 outline-none text-primary placeholder-secondary/70"
      />
      <button className="p-1.5 text-secondary hover:text-primary transition-colors">
        <Mic size={18} />
      </button>
      <button 
        onClick={handleSubmit}
        className="p-1.5 rounded-lg bg-accent text-surface hover:bg-accent/80 transition-colors"
      >
        <Send size={18} />
      </button>
    </div>
  );
}