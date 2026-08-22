import { useEffect, useRef, useState, useCallback } from 'react';
import StoicSettingsModal from "./StoicSettingsModal";
import { useLocation } from 'react-router-dom';
import {
  SquarePen, Bot, Puzzle, Clock, Library, FolderGit2, User, Search,
  PanelLeft, Download, ChevronsUpDown, Settings, CircleHelp, LogOut,
  Star, MoreHorizontal, Layers, FileText, Code2,
} from 'lucide-react';
import StoicLogo from './StoicLogo';
import SearchPanel from './SearchPanel';
import ConversationMenu from './ConversationMenu';
import { getSessionIcon } from '../utils/sessionIcons';
import { conversationsApi, projectsApi } from '../api/conversations';

export default function Sidebar({
  activeTab,
  setActiveTab,
  sessions = [],
  currentSessionId,
  onNewChat,
  onSessionClick,
  sidebarOpen,
  setSidebarOpen,
}) {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pulsingId, setPulsingId] = useState(null);
  const menuRef = useRef(null);
  const pulseTimerRef = useRef(null);

  // ---- Sidebar history (Supabase-backed) ----
  const [conversations, setConversations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [loadError, setLoadError] = useState(null);

  const refreshConversations = useCallback(async () => {
    try {
      const { conversations } = await conversationsApi.list();
      setConversations(conversations);
      setLoadError(null);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setLoadError(err.message);
    }
  }, []);

  const refreshProjects = useCallback(async () => {
    try {
      const { projects } = await projectsApi.list();
      setProjects(projects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  }, []);

  useEffect(() => {
    refreshConversations();
    refreshProjects();
  }, [refreshConversations, refreshProjects]);

  const historyItems = conversations.length > 0 || loadError ? conversations : sessions;

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  useEffect(() => () => clearTimeout(pulseTimerRef.current), []);

  const navItems = [
    { id: 'agent', label: 'Agent', icon: Bot },
    { id: 'plugins', label: 'Plugins', icon: Puzzle },
    { id: 'artefacts', label: 'Artefacts', icon: Layers },
    { id: 'scheduled', label: 'Scheduled', icon: Clock },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
  ];

  // Per-icon click animation: each nav id gets its own little performance
  // instead of a generic shake. Falls back to a plain icon otherwise.
  const renderNavIcon = (item, pulsing) => {
    const Icon = item.icon;
    switch (item.id) {
      case 'agent':
        // Head-nod bounce + two actual "eyes closing" squash-blinks
        return (
          <Icon
            size={16}
            className={`flex-shrink-0 ${pulsing ? 'agent-dance' : 'wiggle-icon'}`}
          />
        );
      case 'plugins':
        // Two pieces visibly separate with a gap, hold, then snap together
        return (
          <span className="relative inline-flex w-4 h-4 flex-shrink-0">
            <Icon
              size={16}
              className={`absolute inset-0 ${pulsing ? 'puzzle-piece-a' : 'wiggle-icon'}`}
            />
            {pulsing && <Icon size={16} className="absolute inset-0 puzzle-piece-b" />}
          </span>
        );
      case 'artefacts':
        // Flips through different logos (doc, code) then lands back on Layers
        return (
          <span className="relative inline-flex w-4 h-4 flex-shrink-0 [perspective:80px]">
            {pulsing ? (
              <>
                <Layers size={16} className="absolute inset-0 artefacts-reel-a" />
                <FileText size={16} className="absolute inset-0 artefacts-reel-b" />
                <Code2 size={16} className="absolute inset-0 artefacts-reel-c" />
                <Layers size={16} className="absolute inset-0 artefacts-reel-d" />
              </>
            ) : (
              <Icon size={16} className="wiggle-icon" />
            )}
          </span>
        );
      case 'library':
        // Three copies fan out like a hand of cards, then collapse back
        return (
          <span className="relative inline-flex w-4 h-4 flex-shrink-0">
            {pulsing ? (
              <>
                <Icon size={16} className="absolute inset-0 library-fan-1" />
                <Icon size={16} className="absolute inset-0 library-fan-2" />
                <Icon size={16} className="absolute inset-0 library-fan-3" />
              </>
            ) : (
              <Icon size={16} className="wiggle-icon" />
            )}
          </span>
        );
      case 'projects':
        // Splits along a flashed "cut line" into two halves, then rejoins
        return (
          <span className="relative inline-flex w-4 h-4 flex-shrink-0">
            <Icon
              size={16}
              className={`absolute inset-0 ${pulsing ? 'project-cut-top' : 'wiggle-icon'}`}
            />
            {pulsing && (
              <>
                <Icon size={16} className="absolute inset-0 project-cut-bottom" />
                <span className="project-cut-flash" />
              </>
            )}
          </span>
        );
      default:
        return <Icon size={16} className="flex-shrink-0 wiggle-icon" />;
    }
  };

  const collapsed = !sidebarOpen;

  const fireBuildPulse = (id, handler) => {
    setPulsingId(id);
    clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = setTimeout(() => setPulsingId(null), 900);
    handler();
  };

  const rowClass = (isActive) =>
    `relative flex items-center gap-2.5 rounded-md text-[13.5px] transition-colors wiggle-trigger ${
      collapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-[6px]'
    } ${
      isActive ? 'bg-white/[0.06] text-white' : 'text-gray-300 hover:bg-white/[0.05] hover:text-white'
    }`;

  const labelClass = `whitespace-nowrap transition-all duration-200 ease-in-out overflow-hidden ${
    collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
  }`;

  const handleOpenSearch = () => {
    if (collapsed) setSidebarOpen(true);
    setSearchOpen(true);
  };

  const handleDownload = () => {
    const session = sessions.find((s) => s.id === currentSessionId);
    if (!session || !session.messages?.length) {
      alert('No chat open to download yet — start a conversation first.');
      return;
    }
    const lines = session.messages.map((m) => `${m.role === 'user' ? 'You' : 'Stoic'}: ${m.content}`);
    const text = `${session.title || 'Untitled chat'}\n${'='.repeat(40)}\n\n${lines.join('\n\n')}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(session.title || 'stoic-chat').slice(0, 40).replace(/[^\w\- ]/g, '')}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    localStorage.removeItem('stoic_sessions');
    localStorage.removeItem('stoic_recent_searches');
    localStorage.removeItem('stoic_user_name');
    setMenuOpen(false);
    window.location.reload();
  };

  const handleShare = (id) => conversationsApi.share(id);

  const handleRename = (id) => {
    const target = historyItems.find((s) => s.id === id);
    setRenamingId(id);
    setRenameValue(target?.title || '');
  };

  const commitRename = async (id) => {
    const title = renameValue.trim();
    setRenamingId(null);
    if (!title) return;
    try {
      await conversationsApi.rename(id, title);
      refreshConversations();
    } catch (err) {
      console.error('Rename failed:', err);
    }
  };

  const handleOpenNewTab = (id) => {
    window.open(`${window.location.origin}${window.location.pathname}?session=${id}`, '_blank');
  };

  const handleTogglePin = async (id, next) => {
    try { await conversationsApi.pin(id, next); refreshConversations(); }
    catch (err) { console.error('Pin toggle failed:', err); }
  };

  const handleToggleFavorite = async (id, next) => {
    try { await conversationsApi.favorite(id, next); refreshConversations(); }
    catch (err) { console.error('Favorite toggle failed:', err); }
  };

  const handleArchive = async (id, next) => {
    try { await conversationsApi.archive(id, next); refreshConversations(); }
    catch (err) { console.error('Archive failed:', err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this chat? This can\u2019t be undone.')) return;
    try {
      await conversationsApi.remove(id);
      refreshConversations();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleMoveToProject = async (id, projectId) => {
    try { await conversationsApi.moveToProject(id, projectId); refreshConversations(); }
    catch (err) { console.error('Move to project failed:', err); }
  };

  const handleCreateProject = async () => {
    const name = window.prompt('New project name:');
    if (!name || !name.trim()) return;
    try {
      await projectsApi.create(name.trim());
      refreshProjects();
    } catch (err) {
      console.error('Create project failed:', err);
    }
  };

  const pinned = historyItems.filter((s) => s.is_pinned && !s.is_archived);
  const unpinned = historyItems.filter((s) => !s.is_pinned && !s.is_archived);

  const renderSessionRow = (session) => {
    const isActive = session.id === currentSessionId;
    const { Icon, color } = getSessionIcon(session);
    const isRenaming = renamingId === session.id;

    return (
      <div key={session.id} className="relative group/row">
        <button
          onClick={() => {
            if (isRenaming) return;
            if (onSessionClick) onSessionClick(session.id);
            if (window.innerWidth < 768) setSidebarOpen(false);
          }}
          className={`w-full flex items-center gap-2 text-left px-2.5 py-[6px] rounded-md truncate text-[13.5px] transition-colors wiggle-trigger ${
            isActive ? 'bg-white/[0.06] text-white' : 'text-gray-300 hover:bg-white/[0.05] hover:text-white'
          }`}
          title={session.title || 'Untitled'}
        >
          <Icon size={15} style={{ color }} className="flex-shrink-0 wiggle-icon" />
          {isRenaming ? (
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onBlur={() => commitRename(session.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename(session.id);
                if (e.key === 'Escape') setRenamingId(null);
              }}
              className="flex-1 bg-transparent border-b border-white/40 outline-none text-white min-w-0"
            />
          ) : (
            <span className="flex-1 truncate">{session.title || 'Untitled'}</span>
          )}
          {session.is_favorite && !isRenaming && (
            <Star size={12} className="flex-shrink-0 text-gray-300" fill="currentColor" />
          )}
        </button>

        {!isRenaming && (
          <button
            onClick={(e) => { e.stopPropagation(); setOpenMenuFor(session.id); }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/[0.08] text-gray-400 hover:text-white opacity-0 group-hover/row:opacity-100 transition-opacity wiggle-trigger"
            title="More options"
          >
            <MoreHorizontal size={14} className="wiggle-icon" />
          </button>
        )}

        {openMenuFor === session.id && (
          <ConversationMenu
            session={session}
            projects={projects}
            onClose={() => setOpenMenuFor(null)}
            onShare={handleShare}
            onRename={handleRename}
            onOpenNewTab={handleOpenNewTab}
            onTogglePin={handleTogglePin}
            onToggleFavorite={handleToggleFavorite}
            onMoveToProject={handleMoveToProject}
            onCreateProject={handleCreateProject}
            onArchive={handleArchive}
            onDelete={handleDelete}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <aside
        className={`group fixed left-0 top-0 h-full bg-black flex flex-col text-white select-none z-40 transition-[width] duration-300 ease-in-out ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {collapsed ? (
          <div className="flex-shrink-0 pt-4 pb-3 flex flex-col items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-md hover:bg-white/[0.08] text-gray-300 hover:text-white transition-colors wiggle-trigger"
              title="Open sidebar"
            >
              <PanelLeft size={20} className="wiggle-icon" />
            </button>
          </div>
        ) : (
          <div className="flex-shrink-0 pt-4 pb-3 px-3 flex items-center justify-between">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); fireBuildPulse('logo', onNewChat); }}
            >
              <StoicLogo size={34} />
              <span className="text-[19px] font-semibold tracking-tight text-white">Stoic</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleOpenSearch}
                className={`p-1.5 rounded-md transition-colors wiggle-trigger ${
                  searchOpen ? 'bg-white/[0.08] text-white' : 'text-gray-400 hover:bg-white/[0.06] hover:text-white'
                }`}
                title="Search chats"
              >
                <Search size={16} className="wiggle-icon" />
              </button>
              <button
                className="p-1.5 rounded-md hover:bg-white/[0.06] transition-colors text-gray-400 hover:text-white wiggle-trigger"
                onClick={() => { setSidebarOpen(false); setSearchOpen(false); }}
                title="Collapse sidebar"
              >
                <PanelLeft size={16} className="wiggle-icon" />
              </button>
            </div>
          </div>
        )}

        <div className={`flex-shrink-0 border-t border-[#232323] transition-all duration-300 ${collapsed ? 'mx-2' : 'mx-3'}`} />

        <div className="flex-1 min-h-0 overflow-y-auto px-2 pt-2">
          <button
            onClick={() => fireBuildPulse('new', onNewChat)}
            className={`${rowClass(false)} w-full text-left mb-1`}
            title="New chat"
          >
            {pulsingId === 'new' && <span className="build-ring" />}
            <SquarePen
              size={16}
              className={`flex-shrink-0 ${pulsingId === 'new' ? 'pen-write' : 'wiggle-icon'}`}
            />
            <span className={labelClass}>New chat</span>
          </button>

          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => fireBuildPulse(item.id, () => setActiveTab(item.id))}
                  className={`${rowClass(isActive)} w-full text-left`}
                  title={item.label}
                >
                  {pulsingId === item.id && <span className="build-ring" />}
                  {renderNavIcon(item, pulsingId === item.id)}
                  <span className={labelClass}>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className={`border-t border-[#232323] my-3 transition-all duration-300 ${collapsed ? 'mx-1' : 'mx-0.5'}`} />

          {!collapsed && pinned.length > 0 && (
            <>
              <h4 className="mb-1 px-2.5 text-[12px] text-gray-500 font-medium">Pinned</h4>
              <div className="space-y-0.5 pb-2">
                {pinned.map(renderSessionRow)}
              </div>
            </>
          )}

          {!collapsed && (
            <h4 className="mb-1 px-2.5 text-[12px] text-gray-500 font-medium">Chats</h4>
          )}
          {!collapsed && (
            <div className="space-y-0.5 pb-2">
              {loadError ? (
                <p className="text-[12px] text-red-400/80 px-2.5 py-1">
                  Couldn't load chats ({loadError})
                </p>
              ) : unpinned.length === 0 ? (
                <p className="text-[13px] text-gray-600 px-2.5 py-1">No chats yet</p>
              ) : (
                unpinned.map(renderSessionRow)
              )}
            </div>
          )}
        </div>

        <div className={`relative flex-shrink-0 py-3 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-2.5'}`}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={`flex items-center min-w-0 rounded-md p-1 -m-1 hover:bg-white/[0.05] transition-colors ${collapsed ? '' : 'gap-2.5'}`}
          >
            <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white flex-shrink-0">
              <User size={14} />
            </div>
            <div className={`min-w-0 text-left ${labelClass}`}>
              <div className="text-[13px] text-white truncate leading-tight">Rakesh P</div>
              <div className="text-[11.5px] text-gray-500 leading-tight">Free plan</div>
            </div>
          </button>
          {!collapsed && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                onClick={handleDownload}
                className="p-1.5 rounded-md hover:bg-white/[0.06] transition-colors text-gray-400 hover:text-white wiggle-trigger"
                title="Download this chat"
              >
                <Download size={15} className="wiggle-icon" />
              </button>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1.5 rounded-md hover:bg-white/[0.06] transition-colors text-gray-400 hover:text-white wiggle-trigger"
                title="Account menu"
              >
                <ChevronsUpDown size={14} className="wiggle-icon" />
              </button>
            </div>
          )}

          {menuOpen && (
            <div
              ref={menuRef}
              className={`absolute bottom-[calc(100%+4px)] ${collapsed ? 'left-2' : 'left-2.5 right-2.5'} bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl py-1 z-50`}
            >
              <button
                onClick={() => { setMenuOpen(false); setSettingsOpen(true); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-200 hover:bg-white/[0.06] hover:text-white transition-colors wiggle-trigger"
              >
                <Settings size={14} className="wiggle-icon" /> Settings
              </button>
              <button
                onClick={() => { setMenuOpen(false); alert('Help & FAQ — coming soon!'); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-200 hover:bg-white/[0.06] hover:text-white transition-colors wiggle-trigger"
              >
                <CircleHelp size={14} className="wiggle-icon" /> Help & FAQ
              </button>
              <div className="border-t border-[#2a2a2a] my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-400 hover:bg-white/[0.06] hover:text-red-300 transition-colors wiggle-trigger"
              >
                <LogOut size={14} className="wiggle-icon" /> Log out
              </button>
            </div>
          )}
        </div>

        <div
          className="absolute top-0 right-0 h-full w-px bg-[#232323] group-hover:bg-[#3a3a3a] transition-colors duration-150 pointer-events-none"
        />

        <SearchPanel
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          sessions={historyItems}
          onSelectSession={onSessionClick}
          onNewChat={onNewChat}
        />

        <style>{`
          .build-ring {
            position: absolute;
            inset: 0;
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.45);
            opacity: 0.9;
            animation: buildRing 0.6s ease-out forwards;
            pointer-events: none;
          }
          @keyframes buildRing {
            0%   { opacity: 0.9; transform: scale(1); }
            100% { opacity: 0;   transform: scale(1.08); }
          }

          /* Icon wiggle-on-hover, Meta-style */
          @keyframes iconWiggle {
            0%   { transform: rotate(0deg) scale(1); }
            15%  { transform: rotate(-13deg) scale(1.08); }
            30%  { transform: rotate(11deg) scale(1.1); }
            45%  { transform: rotate(-8deg) scale(1.06); }
            60%  { transform: rotate(6deg) scale(1.04); }
            75%  { transform: rotate(-3deg) scale(1.02); }
            100% { transform: rotate(0deg) scale(1); }
          }
          .wiggle-icon {
            display: inline-flex;
            transform-origin: 50% 50%;
            will-change: transform;
          }
          .wiggle-trigger:hover .wiggle-icon,
          .wiggle-trigger:focus-visible .wiggle-icon {
            animation: iconWiggle 0.45s ease-in-out;
          }
          @media (prefers-reduced-motion: reduce) {
            .wiggle-trigger:hover .wiggle-icon,
            .wiggle-trigger:focus-visible .wiggle-icon {
              animation: none;
            }
          }

          /* New chat — pen "writes" a quick stroke on click */
          @keyframes penWrite {
            0%   { transform: rotate(0deg) translate(0,0); }
            25%  { transform: rotate(-14deg) translate(-1px,1px); }
            50%  { transform: rotate(10deg) translate(1px,-1px); }
            75%  { transform: rotate(-6deg) translate(-0.5px,0.5px); }
            100% { transform: rotate(0deg) translate(0,0); }
          }
          .pen-write {
            display: inline-flex;
            transform-origin: 15% 85%;
            animation: penWrite 0.5s ease-in-out;
          }

          /* Agent — head-nod bounce with two real blink squashes (not a shake) */
          @keyframes agentDance {
            0%   { transform: translateY(0) rotate(0deg) scaleY(1); }
            10%  { transform: translateY(-3px) rotate(-6deg) scaleY(1); }
            18%  { transform: translateY(-1px) rotate(-6deg) scaleY(0.15); }
            24%  { transform: translateY(-1px) rotate(-6deg) scaleY(1); }
            42%  { transform: translateY(-4px) rotate(8deg) scaleY(1); }
            58%  { transform: translateY(0) rotate(-4deg) scaleY(1); }
            68%  { transform: translateY(0) rotate(-4deg) scaleY(0.15); }
            74%  { transform: translateY(0) rotate(-4deg) scaleY(1); }
            100% { transform: translateY(0) rotate(0deg) scaleY(1); }
          }
          .agent-dance {
            display: inline-flex;
            transform-origin: 50% 55%;
            animation: agentDance 0.8s cubic-bezier(.34,1.56,.64,1);
          }

          /* Plugins — two pieces pull apart with a visible gap, hold, snap back */
          @keyframes puzzleSplitA {
            0%   { transform: translate(0,0) rotate(0deg); opacity: 1; }
            32%  { transform: translate(-5px,-4px) rotate(-22deg); opacity: 1; }
            62%  { transform: translate(-5px,-4px) rotate(-22deg); opacity: 1; }
            82%  { transform: translate(1px,1px) rotate(4deg); opacity: 1; }
            100% { transform: translate(0,0) rotate(0deg); opacity: 1; }
          }
          @keyframes puzzleSplitB {
            0%   { transform: translate(0,0) rotate(0deg); opacity: 0; }
            6%   { opacity: 1; }
            32%  { transform: translate(5px,4px) rotate(22deg); opacity: 1; }
            62%  { transform: translate(5px,4px) rotate(22deg); opacity: 1; }
            82%  { transform: translate(-1px,-1px) rotate(-4deg); opacity: 1; }
            94%  { opacity: 1; }
            100% { transform: translate(0,0) rotate(0deg); opacity: 0; }
          }
          .puzzle-piece-a { animation: puzzleSplitA 0.75s cubic-bezier(.34,1.56,.64,1); }
          .puzzle-piece-b { animation: puzzleSplitB 0.75s cubic-bezier(.34,1.56,.64,1); }

          /* Artefacts — flips through different logos (layers → doc → code → layers) */
          @keyframes reelA {
            0%   { opacity: 1; transform: rotateY(0deg) scale(1); }
            18%  { opacity: 1; transform: rotateY(0deg) scale(1); }
            26%  { opacity: 0; transform: rotateY(90deg) scale(0.7); }
            100% { opacity: 0; transform: rotateY(90deg) scale(0.7); }
          }
          @keyframes reelB {
            0%   { opacity: 0; transform: rotateY(-90deg) scale(0.7); }
            18%  { opacity: 0; transform: rotateY(-90deg) scale(0.7); }
            26%  { opacity: 1; transform: rotateY(0deg) scale(1); }
            44%  { opacity: 1; transform: rotateY(0deg) scale(1); }
            52%  { opacity: 0; transform: rotateY(90deg) scale(0.7); }
            100% { opacity: 0; transform: rotateY(90deg) scale(0.7); }
          }
          @keyframes reelC {
            0%   { opacity: 0; transform: rotateY(-90deg) scale(0.7); }
            44%  { opacity: 0; transform: rotateY(-90deg) scale(0.7); }
            52%  { opacity: 1; transform: rotateY(0deg) scale(1); }
            70%  { opacity: 1; transform: rotateY(0deg) scale(1); }
            78%  { opacity: 0; transform: rotateY(90deg) scale(0.7); }
            100% { opacity: 0; transform: rotateY(90deg) scale(0.7); }
          }
          @keyframes reelD {
            0%   { opacity: 0; transform: rotateY(-90deg) scale(0.7); }
            70%  { opacity: 0; transform: rotateY(-90deg) scale(0.7); }
            78%  { opacity: 1; transform: rotateY(0deg) scale(1); }
            100% { opacity: 1; transform: rotateY(0deg) scale(1); }
          }
          .artefacts-reel-a { animation: reelA 0.9s ease-in-out; }
          .artefacts-reel-b { animation: reelB 0.9s ease-in-out; }
          .artefacts-reel-c { animation: reelC 0.9s ease-in-out; }
          .artefacts-reel-d { animation: reelD 0.9s ease-in-out; }

          /* Library — three copies fan out like cards, then collapse back */
          @keyframes libraryFan1 {
            0%, 100% { transform: translate(0,0) rotate(0deg); }
            45%       { transform: translate(-4.5px,1px) rotate(-18deg); }
          }
          @keyframes libraryFan2 {
            0%, 100% { transform: translate(0,0) rotate(0deg) translateY(0); }
            45%       { transform: translate(0,-1.5px) rotate(0deg); }
          }
          @keyframes libraryFan3 {
            0%, 100% { transform: translate(0,0) rotate(0deg); }
            45%       { transform: translate(4.5px,1px) rotate(18deg); }
          }
          .library-fan-1 { animation: libraryFan1 0.65s ease-in-out; }
          .library-fan-2 { animation: libraryFan2 0.65s ease-in-out; z-index: 1; }
          .library-fan-3 { animation: libraryFan3 0.65s ease-in-out; }

          /* Projects — cut line flashes, two halves separate on a diagonal, rejoin */
          @keyframes projectCutTop {
            0%   { clip-path: inset(0 0 50% 0); transform: translate(0,0) rotate(0deg); }
            38%  { clip-path: inset(0 0 50% 0); transform: translate(-4px,-5px) rotate(-9deg); }
            66%  { clip-path: inset(0 0 50% 0); transform: translate(-4px,-5px) rotate(-9deg); }
            100% { clip-path: inset(0 0 50% 0); transform: translate(0,0) rotate(0deg); }
          }
          @keyframes projectCutBottom {
            0%   { clip-path: inset(50% 0 0 0); transform: translate(0,0) rotate(0deg); }
            38%  { clip-path: inset(50% 0 0 0); transform: translate(4px,5px) rotate(9deg); }
            66%  { clip-path: inset(50% 0 0 0); transform: translate(4px,5px) rotate(9deg); }
            100% { clip-path: inset(50% 0 0 0); transform: translate(0,0) rotate(0deg); }
          }
          @keyframes cutFlash {
            0%   { transform: scaleX(0); opacity: 0; }
            12%  { transform: scaleX(1); opacity: 1; }
            28%  { transform: scaleX(1); opacity: 0; }
            100% { transform: scaleX(0); opacity: 0; }
          }
          .project-cut-top { animation: projectCutTop 0.65s ease-in-out; }
          .project-cut-bottom { animation: projectCutBottom 0.65s ease-in-out; }
          .project-cut-flash {
            position: absolute;
            left: 0;
            right: 0;
            top: 50%;
            height: 1px;
            background: rgba(255,255,255,0.9);
            animation: cutFlash 0.65s ease-out;
            pointer-events: none;
          }
        `}</style>
      </aside>

      {settingsOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center">
          <StoicSettingsModal onClose={() => setSettingsOpen(false)} />
        </div>
      )}
    </>
  );
}