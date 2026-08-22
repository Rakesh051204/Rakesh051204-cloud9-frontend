import { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({
  children,
  activeTab,
  setActiveTab,
  sessions = [],
  currentSessionId,
  onNewChat,
  onSessionClick,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="relative flex h-screen w-full bg-black overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={onNewChat}
        onSessionClick={onSessionClick}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <main
        className={`flex-1 h-full flex flex-col bg-black transition-[margin] duration-200 ${
          sidebarOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        {children}
      </main>
    </div>
  );
}