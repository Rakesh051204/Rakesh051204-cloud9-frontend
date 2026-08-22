import Sidebar from './Sidebar';
import { useState } from 'react';
import { Menu } from 'lucide-react';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#0a0a0a] overflow-hidden relative flex">

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-[#111111] border-r border-[#222] z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
        />
      </div>

      {/* Main Content - Fixed & Centered */}
      <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ marginLeft: sidebarOpen ? '288px' : '0px' }}>
        
        {/* Top Bar */}
        <div className="h-14 border-b border-[#222] bg-[#0a0a0a] flex items-center px-6 z-40">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[#1f1f1f] rounded-lg"
          >
            <Menu size={22} />
          </button>
          <span className="ml-4 text-lg font-semibold">CodeZaro</span>
        </div>

        {/* Main Area */}
        <div className="flex-1 p-6 overflow-auto flex items-start justify-center">
          <div className="w-full max-w-4xl">
            {children}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
    </div>
  );
}