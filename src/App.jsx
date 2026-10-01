import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Layout from './components/Layout';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Agent from './pages/Agent';
import Plugins from './pages/Plugins';
import Scheduled from './pages/Scheduled';
import Library from './pages/Library';
import Projects from './pages/Projects';
import InlineLogin from './components/InlineLogin';

export default function App() {
  const [activeTab, setActiveTab] = useState('checking');
  const [chatKey, setChatKey] = useState(0);
  const [session, setSession] = useState(null);
  const [openSession, setOpenSession] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setActiveTab(session ? 'new-task' : 'login');
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setActiveTab(session ? 'new-task' : 'login');
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSessionOpen = (id) => {
    setOpenSession({ id, n: Date.now() });
    setActiveTab('new-task');
  };

  const handleNewChat = () => {
    setOpenSession(null);
    setChatKey(prev => prev + 1);
    setActiveTab('new-task');
  };

  const handleLoginSuccess = () => {
    setActiveTab('new-task');
  };

  const renderContent = () => {
    if (activeTab === 'checking') return null;
    switch (activeTab) {
      case 'login':
        return <InlineLogin onSuccess={handleLoginSuccess} />;
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
        return <Home key={chatKey} onNewChat={handleNewChat} openSession={openSession} onSessionChange={setActiveSessionId} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onNewChat={handleNewChat} onSessionClick={handleSessionOpen} currentSessionId={activeSessionId}>
      {renderContent()}
    </Layout>
  );
}
