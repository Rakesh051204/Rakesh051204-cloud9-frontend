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
    <div className="relative h-screen w-full bg-black overflow-hidden">
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
        className={`h-full flex flex-col bg-black transition-all duration-200 ease-in-out ${
          sidebarOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        {children}
      </main>
    </div>
  );
}