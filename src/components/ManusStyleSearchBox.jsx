import { Globe, Brain, Mic, Send, StopCircle } from 'lucide-react';
import AttachMenu from './AttachMenu';

export default function ManusStyleSearchBox({
  input,
  setInput,
  onSubmit,
  onMicToggle,
  listening,
  loading,
  onStop,
  searchEnabled,
  onToggleSearch,
  onThink,
  inputRef,
  placeholder = "Ask anything...",
  sessionId,
}) {
  return (
    <div className="w-full">
      <div className="bg-[#252525] border border-[#3a3a3a] rounded-2xl shadow-lg w-full">
        <div className="px-4 pt-4 pb-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
            placeholder={placeholder}
            rows={2}
            className="w-full bg-transparent outline-none ring-0 focus:outline-none focus:ring-0 border-0 text-white placeholder:text-[#666] resize-none text-[15px] leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between px-3 pb-3 pt-1 border-t border-[#3a3a3a]/50">
          <div className="flex items-center gap-1">
            <AttachMenu
              sessionId={sessionId}
              onFileUploaded={() => {}}
              searchEnabled={searchEnabled}
              onToggleSearch={onToggleSearch}
            />
            <button
              onClick={onToggleSearch}
              className={`p-1.5 rounded-lg transition-colors ${searchEnabled ? 'text-[#4a9eff]' : 'text-[#555]'}`}
              title={searchEnabled ? 'Web search on' : 'Web search off'}
            >
              <Globe size={18} />
            </button>
            <button
              onClick={onThink}
              className="p-1.5 rounded-lg text-[#666] hover:text-white hover:bg-[#3a3a3a] transition-colors"
              title="Deep research"
            >
              <Brain size={18} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onMicToggle}
              className={`p-1.5 rounded-lg transition-colors ${listening ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-[#666] hover:text-white hover:bg-[#3a3a3a]'}`}
              title={listening ? 'Stop recording' : 'Start voice input'}
            >
              {listening ? <span className="block w-3 h-3 bg-red-500 rounded-sm" /> : <Mic size={18} />}
            </button>
            <button
              onClick={loading ? onStop : onSubmit}
              className="p-2 bg-[#4a9eff] text-white rounded-xl hover:bg-[#3a8aee] transition-colors"
            >
              {loading ? <StopCircle size={18} /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}