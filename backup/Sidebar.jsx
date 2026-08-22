import { 
  Plus, 
  Bot, 
  Puzzle, 
  Clock, 
  Library, 
  FolderPlus, 
  User,
  CheckSquare,
  Square
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({
  activeTab,
  setActiveTab,
  onNewChat,
  sessions = [],
  currentSessionId = null,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onFetchSessions,
  onClose,
}) {
  const location = useLocation();

  const navItems = [
    { id: 'agent', label: 'Agent', icon: Bot, path: '/agent' },
    { id: 'plugins', label: 'Plugins', icon: Puzzle, path: '/plugins' },
    { id: 'scheduled', label: 'Scheduled', icon: Clock, path: '/scheduled' },
    { id: 'library', label: 'Library', icon: Library, path: '/library' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] text-[#ccc]">
      {/* Logo */}
      <div className="p-4 border-b border-[#222]">
        <span className="text-xl font-bold text-white tracking-tight">stoic</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Main navigation - New task as button */}
        <div className="space-y-0.5">
          <button
            onClick={() => {
              onNewChat();
              if (onClose) onClose();
            }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left ${
              location.pathname === '/' && !currentSessionId
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#999] hover:bg-[#1a1a1a] hover:text-white'
            }`}
          >
            <Plus size={18} />
            <span>New task</span>
          </button>

          {navItems.map((item) => {
            const isActive = location.pathname === item.path || activeTab === item.id;
            const Icon = item.icon;
            return (
              <div key={item.id}>
                <Link
                  to={item.path}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onClose) onClose();
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-[#1a1a1a] text-white'
                      : 'text-[#999] hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Projects */}
        <div className="pt-2 border-t border-[#222]">
          <div className="flex items-center justify-between px-3">
            <span className="text-xs font-medium text-[#555] uppercase tracking-wider">
              Projects
            </span>
            <button className="text-[#555] hover:text-white transition-colors">
              <FolderPlus size={14} />
            </button>
          </div>
          <div className="mt-1 px-3 py-1 text-sm text-[#666]">New project</div>
        </div>

        {/* Tasks – now reflects real sessions */}
        <div className="pt-2 border-t border-[#222]">
          <div className="px-3 text-xs font-medium text-[#555] uppercase tracking-wider">
            Tasks
          </div>
          <div className="mt-1 space-y-0.5">
            {sessions.length === 0 ? (
              <div className="px-3 py-1 text-sm text-[#666]">No tasks yet</div>
            ) : (
              sessions.map((task) => {
                const isActive = task.id === currentSessionId;
                return (
                  <div
                    key={task.id}
                    onClick={() => {
                      onSelectSession(task.id);
                      if (onClose) onClose();
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors group ${
                      isActive
                        ? 'bg-[#1a1a1a] text-white'
                        : 'hover:bg-[#1a1a1a] text-[#ccc]'
                    }`}
                  >
                    <span className="text-[#555] group-hover:text-white transition-colors">
                      {isActive ? (
                        <CheckSquare size={16} className="text-[#666]" />
                      ) : (
                        <Square size={16} />
                      )}
                    </span>
                    <span className={`text-sm truncate ${isActive ? 'text-white' : 'text-[#ccc]'}`}>
                      {task.title || 'Untitled'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* User */}
      <div className="p-4 border-t border-[#222]">
        <div className="flex items-center gap-2 text-sm text-[#666]">
          <User size={14} />
          <span className="truncate">Rakesh P</span>
        </div>
      </div>
    </div>
  );
}