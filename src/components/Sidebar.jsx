import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  SquarePen, Bot, Puzzle, Clock, Library, FolderGit2, User, Search,
  PanelLeft, Download, ChevronsUpDown, CircleHelp, LogOut,
  Star, MoreHorizontal, Layers, FileText, Code2, ChevronDown, SlidersHorizontal,
} from 'lucide-react';
import StoicLogo from './StoicLogo';
import SearchPanel from './SearchPanel';
import ConversationMenu from './ConversationMenu';
import { getSessionIcon } from '../utils/sessionIcons';
import { conversationsApi, projectsApi } from '../api/conversations';

const LIVE_POLL_INTERVAL_MS = 4000;

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [tasksCollapsed, setTasksCollapsed] = useState(false);
  const menuRef = useRef(null);
  const storedUser = JSON.parse(localStorage.getItem('stoic_user') || 'null');
  const isLoggedIn = !!localStorage.getItem('stoic_token');

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

    const interval = setInterval(() => {
      if (renamingId) return;
      refreshConversations();
    }, LIVE_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [refreshConversations, refreshProjects, renamingId]);

  const historyItems = conversations.length > 0 || loadError ? conversations : sessions;

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        onNewChat();
      } else if (!e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (!sidebarOpen) setSidebarOpen(true);
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNewChat, sidebarOpen, setSidebarOpen]);

  const navItems = [
    { id: 'agent', label: 'Agent', icon: Bot },
    { id: 'plugins', label: 'Plugins', icon: Puzzle },
    { id: 'artefacts', label: 'Artefacts', icon: Layers },
    { id: 'scheduled', label: 'Scheduled', icon: Clock },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
  ];

  const renderNavIcon = (item) => {
    const Icon = item.icon;
    switch (item.id) {
      case 'agent':
        return <Icon size={16} className="flex-shrink-0 icon-agent" />;
      case 'plugins':
        return (
          <span className="relative inline-flex w-4 h-4 flex-shrink-0">
            <Icon size={16} className="absolute inset-0 icon-plugins-a" />
            <Icon size={16} className="absolute inset-0 icon-plugins-b" />
          </span>
        );
      case 'artefacts':
        return (
          <span className="relative inline-flex w-4 h-4 flex-shrink-0 [perspective:80px]">
            <Layers size={16} className="absolute inset-0 icon-artefacts-a" />
            <FileText size={16} className="absolute inset-0 icon-artefacts-b" />
            <Code2 size={16} className="absolute inset-0 icon-artefacts-c" />
            <Layers size={16} className="absolute inset-0 icon-artefacts-d" />
          </span>
        );
      case 'scheduled':
        return <Icon size={16} className="flex-shrink-0 icon-scheduled" />;
      case 'library':
        return (
          <span className="relative inline-flex w-4 h-4 flex-shrink-0">
            <Icon size={16} className="absolute inset-0 icon-library-1" />
            <Icon size={16} className="absolute inset-0 icon-library-2" />
            <Icon size={16} className="absolute inset-0 icon-library-3" />
          </span>
        );
      case 'projects':
        return (
          <span className="relative inline-flex w-4 h-4 flex-shrink-0">
            <Icon size={16} className="absolute inset-0 icon-projects-top" />
            <Icon size={16} className="absolute inset-0 icon-projects-bottom" />
            <span className="icon-projects-flash" />
          </span>
        );
      default:
        return <Icon size={16} className="flex-shrink-0" />;
    }
  };

  const collapsed = !sidebarOpen;

  const rowClass = (isActive, extra = '') =>
    `relative flex items-center gap-2.5 rounded-md text-[13.5px] transition-colors ${extra} ${
      collapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-[6px]'
    } ${
      isActive ? 'bg-white/[0.06] text-white' : 'text-gray-300 hover:bg-white/[0.05] hover:text-white'
    }`;

  const labelClass = `whitespace-nowrap overflow-hidden ${
    collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
  }`;

  const handleOpenSearch = () => {
    if (collapsed) setSidebarOpen(true);
    setSearchOpen(true);
  };

  const handleDownload = () => {
    const session = sessions.find((s) => s.id === currentSessionId);
    if (!session || !session.messages?.length) {
      alert('No chat open to download yet - start a conversation first.');
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
    localStorage.removeItem('stoic_token');
    localStorage.removeItem('stoic_user');
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

  const visibleItems = historyItems.filter((s) => !s.is_archived);
  const orderedItems = [
    ...visibleItems.filter((s) => s.is_pinned),
    ...visibleItems.filter((s) => !s.is_pinned),
  ];

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
          className={`w-full flex items-center gap-2 text-left px-2.5 py-[6px] rounded-md truncate text-[13.5px] transition-colors ${
            isActive ? 'bg-white/[0.06] text-white' : 'text-gray-300 hover:bg-white/[0.05] hover:text-white'
          }`}
          title={session.title || 'Untitled'}
        >
          <Icon size={15} style={{ color }} className="flex-shrink-0" />
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
          {session.is_pinned && !isRenaming && (
            <Star size={11} className="flex-shrink-0 text-gray-500" />
          )}
          {session.is_favorite && !isRenaming && (
            <Star size={12} className="flex-shrink-0 text-gray-300" fill="currentColor" />
          )}
        </button>

        {!isRenaming && (
          <button
            onClick={(e) => { e.stopPropagation(); setOpenMenuFor(session.id); }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/[0.08] text-gray-400 hover:text-white opacity-0 group-hover/row:opacity-100 transition-opacity"
            title="More options"
          >
            <MoreHorizontal size={14} />
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
        className={`group fixed left-0 top-0 h-full bg-black flex flex-col text-white select-none z-40 overflow-hidden ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div
          className={`flex-shrink-0 pt-4 pb-3 flex items-center ${
            collapsed ? 'justify-center px-0' : 'justify-between px-3'
          }`}
        >
          <div
            className={`flex items-center gap-2.5 cursor-pointer overflow-hidden ${
              collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            }`}
            onClick={(e) => { e.stopPropagation(); onNewChat(); }}
          >
            <StoicLogo size={34} className="flex-shrink-0" />
            <span className="text-[19px] font-semibold tracking-tight text-white whitespace-nowrap">Stoic</span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleOpenSearch}
              className={`p-1.5 rounded-md overflow-hidden ${
                collapsed ? 'w-0 opacity-0 p-0' : 'w-auto opacity-100'
              } ${searchOpen ? 'bg-white/[0.08] text-white' : 'text-gray-400 hover:bg-white/[0.06] hover:text-white'}`}
              title="Search chats"
              tabIndex={collapsed ? -1 : 0}
            >
              <Search size={16} className="flex-shrink-0" />
            </button>
            <button
              className="p-1.5 rounded-md hover:bg-white/[0.08] text-gray-300 hover:text-white transition-colors flex-shrink-0"
              onClick={() => {
                if (collapsed) { setSidebarOpen(true); }
                else { setSidebarOpen(false); setSearchOpen(false); }
              }}
              title={collapsed ? 'Open sidebar' : 'Collapse sidebar'}
            >
              <PanelLeft size={collapsed ? 20 : 16} />
            </button>
          </div>
        </div>

        <div className={`flex-shrink-0 border-t border-[#232323] ${collapsed ? 'mx-2' : 'mx-3'}`} />

        <div className="flex-1 min-h-0 overflow-y-auto px-2 pt-2">
          <button
            onClick={onNewChat}
            className={`${rowClass(false, 'row-newchat')} w-full text-left mb-1`}
            title="New chat"
          >
            <SquarePen size={16} className="flex-shrink-0 icon-newchat" />
            <span className={labelClass}>New chat</span>
          </button>

          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`${rowClass(isActive, `row-${item.id}`)} w-full text-left`}
                  title={item.label}
                >
                  {renderNavIcon(item)}
                  <span className={labelClass}>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className={`border-t border-[#232323] my-3 ${collapsed ? 'mx-1' : 'mx-0.5'}`} />

          {!collapsed && (
            <div className="flex items-center justify-between px-2.5 mb-1">
              <button
                onClick={() => setTasksCollapsed((v) => !v)}
                className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-300 font-medium transition-colors"
              >
                Tasks
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${tasksCollapsed ? '-rotate-90' : ''}`}
                />
              </button>
              <button
                className="p-1 rounded hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-colors"
                title="Filter / sort tasks"
              >
                <SlidersHorizontal size={13} />
              </button>
            </div>
          )}

          {!collapsed && !tasksCollapsed && (
            <div className="space-y-0.5 pb-2">
              {loadError ? (
                <p className="text-[12px] text-red-400/80 px-2.5 py-1">
                  Couldn't load chats ({loadError})
                </p>
              ) : orderedItems.length === 0 ? (
                <p className="text-[13px] text-gray-600 px-2.5 py-1">No chats yet</p>
              ) : (
                orderedItems.map(renderSessionRow)
              )}
            </div>
          )}
        </div>

        <div className={`relative flex-shrink-0 py-3 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-2.5'}`}>
          <button
            onClick={() => { if (isLoggedIn) { setMenuOpen((v) => !v); } else { setActiveTab('login'); } }}
            className={`flex items-center min-w-0 rounded-md p-1 -m-1 hover:bg-white/[0.05] transition-colors ${collapsed ? '' : 'gap-2.5'}`}
          >
            <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white flex-shrink-0">
              <User size={14} />
            </div>
            <div className={`min-w-0 text-left ${labelClass}`}>
              <div className="text-[13px] text-white truncate leading-tight">{isLoggedIn ? (storedUser?.name || storedUser?.email || 'Account') : 'Sign in'}</div>
              <div className="text-[11.5px] text-gray-500 leading-tight">{isLoggedIn ? 'Free plan' : 'Not signed in'}</div>
            </div>
          </button>

          <div
            className={`flex items-center gap-0.5 flex-shrink-0 overflow-hidden ${
              collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            }`}
          >
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-md hover:bg-white/[0.06] transition-colors text-gray-400 hover:text-white"
              title="Download this chat"
              tabIndex={collapsed ? -1 : 0}
            >
              <Download size={15} />
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-md hover:bg-white/[0.06] transition-colors text-gray-400 hover:text-white"
              title="Account menu"
              tabIndex={collapsed ? -1 : 0}
            >
              <ChevronsUpDown size={14} />
            </button>
          </div>

          {menuOpen && (
            <div
              ref={menuRef}
              className={`absolute bottom-[calc(100%+4px)] ${collapsed ? 'left-2' : 'left-2.5 right-2.5'} bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl py-1 z-50`}
            >
              <button
                onClick={() => { setMenuOpen(false); alert('Help & FAQ - coming soon!'); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-200 hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <CircleHelp size={14} /> Help & FAQ
              </button>
              <div className="border-t border-[#2a2a2a] my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-400 hover:bg-white/[0.06] hover:text-red-300 transition-colors"
              >
                <LogOut size={14} /> Log out
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
          .row-newchat:hover .icon-newchat {
            animation: penWrite 0.5s ease-in-out;
            transform-origin: 15% 85%;
          }
          @keyframes penWrite {
            0%   { transform: rotate(0deg) translate(0,0); }
            25%  { transform: rotate(-14deg) translate(-1px,1px); }
            50%  { transform: rotate(10deg) translate(1px,-1px); }
            75%  { transform: rotate(-6deg) translate(-0.5px,0.5px); }
            100% { transform: rotate(0deg) translate(0,0); }
          }

          .row-search:hover .icon-search {
            animation: searchPeek 0.5s ease-in-out;
          }
          @keyframes searchPeek {
            0%, 100% { transform: rotate(0deg) scale(1); }
            30%      { transform: rotate(-12deg) scale(1.1); }
            60%      { transform: rotate(8deg) scale(1.05); }
          }

          .row-agent:hover .icon-agent {
            animation: agentBlink 0.7s ease-in-out;
            transform-origin: 50% 50%;
          }
          @keyframes agentBlink {
            0%, 100% { transform: scaleY(1); }
            35%      { transform: scaleY(1); }
            50%      { transform: scaleY(0.12); }
            65%      { transform: scaleY(1); }
          }

          .icon-plugins-a, .icon-plugins-b {
            transform: translate(0,0) rotate(0deg);
          }
          .row-plugins:hover .icon-plugins-a {
            animation: pluginsAttachA 0.55s cubic-bezier(.34,1.56,.64,1);
          }
          .row-plugins:hover .icon-plugins-b {
            animation: pluginsAttachB 0.55s cubic-bezier(.34,1.56,.64,1);
          }
          @keyframes pluginsAttachA {
            0%   { transform: translate(-6px,-5px) rotate(-25deg); }
            65%  { transform: translate(1px,1px) rotate(4deg); }
            100% { transform: translate(0,0) rotate(0deg); }
          }
          @keyframes pluginsAttachB {
            0%   { transform: translate(6px,5px) rotate(25deg); }
            65%  { transform: translate(-1px,-1px) rotate(-4deg); }
            100% { transform: translate(0,0) rotate(0deg); }
          }

          .row-scheduled:hover .icon-scheduled {
            animation: scheduleSpin 0.6s ease-in-out;
          }
          @keyframes scheduleSpin {
            0%   { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .icon-library-1, .icon-library-2, .icon-library-3 {
            transform: translate(0,0) rotate(0deg);
          }
          .row-library:hover .icon-library-1 { animation: libraryFan1 0.6s ease-in-out; }
          .row-library:hover .icon-library-2 { animation: libraryFan2 0.6s ease-in-out; z-index: 1; }
          .row-library:hover .icon-library-3 { animation: libraryFan3 0.6s ease-in-out; }
          @keyframes libraryFan1 {
            0%, 100% { transform: translate(0,0) rotate(0deg); }
            45%       { transform: translate(-4.5px,1px) rotate(-18deg); }
          }
          @keyframes libraryFan2 {
            0%, 100% { transform: translate(0,0); }
            45%       { transform: translate(0,-1.5px); }
          }
          @keyframes libraryFan3 {
            0%, 100% { transform: translate(0,0) rotate(0deg); }
            45%       { transform: translate(4.5px,1px) rotate(18deg); }
          }

          .icon-projects-top { clip-path: inset(0 0 50% 0); transform: translate(0,0) rotate(0deg); }
          .icon-projects-bottom { clip-path: inset(50% 0 0 0); transform: translate(0,0) rotate(0deg); }
          .icon-projects-flash {
            position: absolute; left: 0; right: 0; top: 50%; height: 1px;
            background: rgba(255,255,255,0.9); opacity: 0; pointer-events: none;
          }
          .row-projects:hover .icon-projects-top { animation: projectCutTop 0.6s ease-in-out; }
          .row-projects:hover .icon-projects-bottom { animation: projectCutBottom 0.6s ease-in-out; }
          .row-projects:hover .icon-projects-flash { animation: cutFlash 0.6s ease-out; }
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

          .icon-artefacts-a, .icon-artefacts-b, .icon-artefacts-c, .icon-artefacts-d {
            opacity: 0;
          }
          .icon-artefacts-a { opacity: 1; }
          .row-artefacts:hover .icon-artefacts-a { animation: reelA 0.9s ease-in-out; }
          .row-artefacts:hover .icon-artefacts-b { animation: reelB 0.9s ease-in-out; }
          .row-artefacts:hover .icon-artefacts-c { animation: reelC 0.9s ease-in-out; }
          .row-artefacts:hover .icon-artefacts-d { animation: reelD 0.9s ease-in-out; }
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
        `}</style>
      </aside>
    </>
  );
}




