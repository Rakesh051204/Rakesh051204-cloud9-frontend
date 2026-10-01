import { Globe, Brain, Mic, Send, StopCircle, Monitor } from 'lucide-react';
import AttachMenu from './AttachMenu';
import LiveComputerPill from './LiveComputerPill';
import StoicComputerPanel from './StoicComputerPanel';

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
  desktopConnected = false,
  onToggleDesktop,
  // NEW — drive the live strip + panel. `liveStep` is a short string like
  // "Searching the web" (reuse ThinkingUI's STEPS or your SSE step name);
  // pass null/undefined when nothing is running to hide the pill entirely.
  liveStep,
  computerOpen,
  onToggleComputer,
  computerScenes,
}) {
  return (
    <div className="w-full relative">
      {/* pill + panel anchor — panel floats up from here, right above the box */}
      <LiveComputerPill step={liveStep} open={computerOpen} onClick={onToggleComputer} />
      {liveStep && (
        <StoicComputerPanel open={computerOpen} onClose={onToggleComputer} scenes={computerScenes} />
      )}

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
              className={`p-1.5 rounded-lg transition-colors ${searchEnabled ? 'text-white' : 'text-[#555]'}`}
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

            <button
              onClick={onToggleDesktop}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] transition-colors ${
                desktopConnected
                  ? 'text-white bg-white/10 hover:bg-white/15'
                  : 'text-[#888] hover:text-white hover:bg-[#3a3a3a]'
              }`}
              title={desktopConnected ? 'Stoic Desktop connected' : 'Connect Stoic Desktop'}
            >
              <Monitor size={15} />
              <span>Stoic Desktop</span>
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
              className="p-2 bg-white text-black rounded-xl hover:bg-gray-200 transition-colors"
            >
              {loading ? <StopCircle size={18} /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}