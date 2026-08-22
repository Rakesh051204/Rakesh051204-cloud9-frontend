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