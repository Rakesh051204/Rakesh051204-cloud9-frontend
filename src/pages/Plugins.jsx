import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ConnectorsPage from '../components/ConnectorsPage';

export default function Plugins() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('plugins');

  const handleNewChat = () => navigate('/');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onNewChat={handleNewChat}>
      <ConnectorsPage />
    </Layout>
  );
}