import { Plus, Search, ArrowUp, ArrowDown } from 'lucide-react';

export default function RightSidebar({ history = [], onNewChat, onSelectChat }) {
  return (
    <div className="w-80 border-l border-[#2a2a2a] bg-[#0f0f0f] h-screen overflow-y-auto p-4 hidden lg:block">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-2xl font-medium"
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search history..."
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl pl-10 py-3 text-sm focus:outline-none"
        />
      </div>

      <div className="space-y-1">
        {history.length > 0 ? (
          history.map((chat, i) => (
            <div
              key={i}
              onClick={() => onSelectChat(chat.id)}
              className="px-4 py-3 hover:bg-[#1f1f1f] rounded-2xl cursor-pointer text-sm text-gray-300 line-clamp-1"
            >
              {chat.title || chat.preview || "New Conversation"}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm px-4">No previous chats yet</p>
        )}
      </div>

      {/* Up / Down Navigation */}
      <div className="absolute bottom-6 right-6 flex gap-2">
        <button className="p-3 bg-[#1a1a1a] hover:bg-[#252525] rounded-2xl">
          <ArrowUp size={18} />
        </button>
        <button className="p-3 bg-[#1a1a1a] hover:bg-[#252525] rounded-2xl">
          <ArrowDown size={18} />
        </button>
      </div>
    </div>
  );
}