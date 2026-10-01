import { useState } from 'react';
import StoicSettingsModal from "./components/StoicSettingsModal";
import Layout from './components/Layout';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Agent from './pages/Agent';
import Plugins from './pages/Plugins';
import Scheduled from './pages/Scheduled';
import Library from './pages/Library';
import Projects from './pages/Projects';

export default function App() {
  const [activeTab, setActiveTab] = useState('new-task');
  const [chatKey, setChatKey] = useState(0);

  const handleNewChat = () => {
    setChatKey(prev => prev + 1);
    setActiveTab('new-task'); // ensures New/logo click always returns to Home
  };

  const renderContent = () => {
    console.log('ACTIVE TAB IS:', activeTab);
    switch (activeTab) {
      case 'discover':
        return <Discover />;
      case 'agent':
        return <Agent />;
      case 'plugins':
        return <Plugins />;
      case 'scheduled':
        return <Scheduled />;
      case 'library':
        return <Library />;
      case 'projects':
        return <Projects />;
      default:
        return <Home key={chatKey} onNewChat={handleNewChat} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onNewChat={handleNewChat}>
      {renderContent()}
    </Layout>
  );
}
PS C:\Users\Hp\cloud9-frontend> Get-Content C:\Users\Hp\cloud9-frontend\src\components\Sidebar.jsx | Select-Object -Skip 490 -First 60
                orderedItems.map(renderSessionRow)
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
                onClick={() => { setMenuOpen(false); alert('Help & FAQ â€” coming soon!'); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-200 hover:bg-white/[0.06] hover:text-white transition-colors wiggle-trigger"
              >
                <CircleHelp size={14} className="wiggle-icon" /> Help & FAQ
              </button>
              <div className="border-t border-[#2a2a2a] my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-400 hover:bg-white/[0.06] hover:text-red-300 transition-colors wiggle-trigger"
              >