import { Compass, DollarSign, Heart, BookOpen, FileText } from 'lucide-react';

const modes = [
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'academic', label: 'Academic', icon: BookOpen },
  { id: 'patents', label: 'Patents', icon: FileText },
];

export default function ModeTabs({ activeMode, onModeChange }) {
  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-[#2a2a2a] bg-black sticky top-0 z-10 overflow-x-auto">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = activeMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
              isActive
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <Icon size={16} />
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}