import { useState } from 'react';
import { Check } from 'lucide-react';

// ---- Logo components ----
const geminiLogo = () => <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">G</div>;
const llamaLogo = () => <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">L</div>;
const mistralLogo = () => <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white text-[10px] font-bold">M</div>;
const deepseekLogo = () => <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-white text-[10px] font-bold">D</div>;
const qwenLogo = () => <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-[10px] font-bold">Q</div>;
const phiLogo = () => <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-white text-[10px] font-bold">P</div>;
const customLogo = () => <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold">S</div>;

const freeModels = [
  { id: 'gemini', label: 'Gemini 2.5 Flash', logo: geminiLogo, description: 'Google – fast, good quality' },
  { id: 'llama', label: 'Llama 3.3', logo: llamaLogo, description: 'Meta – open-source, run your own' },
  { id: 'mistral', label: 'Mistral Small', logo: mistralLogo, description: 'Mistral – fast & lightweight' },
  { id: 'deepseek', label: 'DeepSeek V3', logo: deepseekLogo, description: 'Strong coding & reasoning' },
  { id: 'qwen', label: 'Qwen 3', logo: qwenLogo, description: 'Chat, coding, multilingual' },
  { id: 'phi', label: 'Phi-4', logo: phiLogo, description: 'Microsoft – small, works on low-cost hardware' },
  { id: 'stoic-finetuned', label: 'Stoic Finetuned', logo: customLogo, description: 'Your custom fine-tuned model' },
];

export default function ModelPicker({ selectedModel, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const current = freeModels.find(m => m.id === selectedModel) || freeModels[0];

  return (
    <div className="relative z-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors text-xs text-gray-300"
      >
        {current.logo()} <span>{current.label}</span>
        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-xl z-50 w-64 max-h-72 overflow-y-auto p-1">
          {freeModels.map((model) => (
            <button
              key={model.id}
              onClick={() => { onSelect(model.id); setIsOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#2a2a2a] transition-colors ${
                selectedModel === model.id ? 'bg-[#2a2a2a]' : ''
              }`}
            >
              {model.logo()}
              <div className="flex-1 text-left">
                <div className="text-xs text-white flex items-center gap-1.5">
                  {model.label}
                  {model.id !== 'stoic-finetuned' && <span className="text-[9px] text-green-400">Free</span>}
                </div>
                <div className="text-[9px] text-gray-500 truncate">{model.description}</div>
              </div>
              {selectedModel === model.id && <Check size={14} className="text-blue-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}