import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search, Plus, Check, Globe, Mail, Calendar, FileText,
  MessageSquare, HardDrive, Sparkles, Loader2,
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { SiNotion } from 'react-icons/si';
import { connectorsApi } from '../api/connectors';

function SlackLogo({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 122.8 122.8">
      <path d="M25.8,77.6c0,7.1-5.8,12.9-12.9,12.9C5.8,90.5,0,84.7,0,77.6c0-7.1,5.8-12.9,12.9-12.9h12.9V77.6z" fill="#E01E5A"/>
      <path d="M32.3,77.6c0-7.1,5.8-12.9,12.9-12.9c7.1,0,12.9,5.8,12.9,12.9v32.3c0,7.1-5.8,12.9-12.9,12.9c-7.1,0-12.9-5.8-12.9-12.9V77.6z" fill="#E01E5A"/>
      <path d="M45.2,25.8c-7.1,0-12.9-5.8-12.9-12.9C32.3,5.8,38.1,0,45.2,0c7.1,0,12.9,5.8,12.9,12.9v12.9H45.2z" fill="#36C5F0"/>
      <path d="M45.2,32.3c7.1,0,12.9,5.8,12.9,12.9c0,7.1-5.8,12.9-12.9,12.9H12.9C5.8,58.1,0,52.3,0,45.2c0-7.1,5.8-12.9,12.9-12.9H45.2z" fill="#36C5F0"/>
      <path d="M97,45.2c0-7.1,5.8-12.9,12.9-12.9c7.1,0,12.9,5.8,12.9,12.9c0,7.1-5.8,12.9-12.9,12.9H97V45.2z" fill="#2EB67D"/>
      <path d="M90.5,45.2c0,7.1-5.8,12.9-12.9,12.9c-7.1,0-12.9-5.8-12.9-12.9V12.9C64.7,5.8,70.5,0,77.6,0c7.1,0,12.9,5.8,12.9,12.9V45.2z" fill="#2EB67D"/>
      <path d="M77.6,97c7.1,0,12.9,5.8,12.9,12.9c0,7.1-5.8,12.9-12.9,12.9c-7.1,0-12.9-5.8-12.9-12.9V97H77.6z" fill="#ECB22E"/>
      <path d="M77.6,90.5c-7.1,0-12.9-5.8-12.9-12.9c0-7.1,5.8-12.9,12.9-12.9h32.3c7.1,0,12.9,5.8,12.9,12.9c0,7.1-5.8,12.9-12.9,12.9H77.6z" fill="#ECB22E"/>
    </svg>
  );
}

// â”€â”€â”€ Connector catalog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// `live: true` means the backend actually supports this provider
// (currently only github). Everything else renders as "Soon" until a
// matching route + PROVIDERS entry exists server-side.
const CONNECTOR_CATALOG = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Manage repositories, track code changes, and collaborate on projects',
    icon: FaGithub,
    color: '#F2F2F0',
    live: true,
  },
  {
    id: 'browser',
    name: 'My Browser',
    description: 'Access the web on your own browser',
    icon: Globe,
    color: '#7C83DB',
    live: false,
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Draft replies, search your inbox, and summarize threads instantly',
    icon: Mail,
    color: '#CC785C',
    live: false,
  },
  {
    id: 'drive',
    name: 'Google Drive',
    description: 'Search your files and pull context into answers automatically',
    icon: HardDrive,
    color: '#7C83DB',
    live: false,
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    description: 'Understand your schedule, manage events, and set reminders',
    icon: Calendar,
    color: '#CC785C',
    live: false,
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Search workspace content, update notes, and keep docs in sync',
    icon: SiNotion,
    color: '#F2F2F0',
    live: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Search channels, summarize threads, and draft messages',
    icon: SlackLogo,
    color: '#4A154B',
    live: true,
  },
  {
    id: 'messages',
    name: 'Messenger',
    description: 'Bring Stoic into your DMs and group chats',
    icon: MessageSquare,
    color: '#CC785C',
    live: true,
  },
];

function ConnectorCard({ connector, connected, busy, providerUsername, onConnect, onDisconnect }) {
  const Icon = connector.icon;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#232323] bg-[#111111] p-4 hover:border-[#2e2e2e] transition-colors">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${connector.color}1A`, color: connector.color }}
      >
        <Icon size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-[13.5px] text-white font-medium truncate">{connector.name}</p>
          {!connector.live && (
            <span className="text-[10px] px-1.5 py-[1px] rounded-full bg-white/[0.06] text-gray-500 flex-shrink-0">
              Soon
            </span>
          )}
        </div>
        <p className="text-[12.5px] text-gray-500 leading-snug mt-0.5 line-clamp-2">
          {connected && providerUsername ? `Connected as ${providerUsername}` : connector.description}
        </p>
      </div>

      <button
        onClick={() => (connected ? onDisconnect(connector.id) : onConnect(connector.id))}
        disabled={!connector.live || busy}
        title={!connector.live ? 'Coming soon' : connected ? 'Disconnect' : `Sign in with ${connector.name}`}
        className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
          !connector.live
            ? 'bg-white/[0.03] text-gray-700 cursor-not-allowed'
            : connected
            ? 'bg-[#7C83DB]/15 text-[#7C83DB] hover:bg-[#7C83DB]/25'
            : 'bg-white/[0.06] text-gray-400 hover:bg-white/[0.1] hover:text-white'
        }`}
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : connected ? <Check size={15} /> : <Plus size={15} />}
      </button>
    </div>
  );
}

export default function ConnectorsPage() {
  const [query, setQuery] = useState('');
  const [statusById, setStatusById] = useState({}); // { [id]: { connected, providerUsername } }
  const [busyId, setBusyId] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [banner, setBanner] = useState(null); // post-redirect confirmation/error

  const refresh = useCallback(async () => {
    try {
      const { connectors } = await connectorsApi.list();
      const map = {};
      for (const c of connectors) {
        map[c.provider] = { connected: c.connected, providerUsername: c.providerUsername };
      }
      setStatusById(map);
      setLoadError(null);
    } catch (err) {
      console.error('Failed to load connectors:', err);
      setLoadError(err.message);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Pick up ?connected=github / ?error=github from the OAuth redirect
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');
    if (connected) setBanner({ type: 'success', text: `${connected} connected.` });
    if (error) setBanner({ type: 'error', text: `Couldn't connect ${error}. Try again.` });
    if (connected || error) {
      params.delete('connected');
      params.delete('error');
      const clean = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
      window.history.replaceState({}, '', clean);
    }
  }, [refresh]);

  const handleConnect = (id) => {
    setBusyId(id);
    if (id === 'github') {
      connectorsApi.connectGithub();
      return;
    }
    if (id === 'notion') {
      connectorsApi.connectNotion();
      return;
    }
    if (id === 'slack') {
      connectorsApi.connectSlack();
      return;
    }
    setBusyId(null);
  };

  const handleDisconnect = async (id) => {
    setBusyId(id);
    try {
      await connectorsApi.disconnect(id);
      await refresh();
    } catch (err) {
      console.error('Disconnect failed:', err);
      setBanner({ type: 'error', text: `Couldn't disconnect ${id}.` });
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CONNECTOR_CATALOG;
    return CONNECTOR_CATALOG.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }, [query]);

  const connectedCount = Object.values(statusById).filter((s) => s.connected).length;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold tracking-tight">Plugins</h1>
          {connectedCount > 0 && (
            <span className="text-[12.5px] text-gray-500">{connectedCount} connected</span>
          )}
        </div>

        {banner && (
          <div
            className={`mb-5 rounded-lg border px-3.5 py-2.5 text-[13px] flex items-center justify-between ${
              banner.type === 'success'
                ? 'border-[#7C83DB]/30 bg-[#7C83DB]/10 text-[#c7cbf5]'
                : 'border-red-500/30 bg-red-500/10 text-red-300'
            }`}
          >
            <span>{banner.text}</span>
            <button onClick={() => setBanner(null)} className="text-inherit opacity-60 hover:opacity-100">
              âœ•
            </button>
          </div>
        )}

        {loadError && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-300">
            Couldn't load connector status ({loadError})
          </div>
        )}

        <div className="relative mb-8">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search connectors, skills, data sources"
            className="w-full bg-[#111111] border border-[#232323] rounded-lg pl-10 pr-4 py-2.5 text-[13.5px] text-white placeholder-gray-500 outline-none focus:border-[#7C83DB]/60 transition-colors"
          />
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[14.5px] font-medium text-white">Connectors</h2>
            <p className="text-[12.5px] text-gray-500 mt-0.5">
              Connect apps and APIs so Stoic can pull in your context.
            </p>
          </div>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[12.5px] text-[#7C83DB] hover:text-[#9198e0] transition-colors"
            >
              Clear search
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Sparkles size={22} className="text-gray-600 mb-3" />
            <p className="text-[13.5px] text-gray-400">No connectors match "{query}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((connector) => {
              const status = statusById[connector.id] || {};
              return (
                <ConnectorCard
                  key={connector.id}
                  connector={connector}
                  connected={!!status.connected}
                  providerUsername={status.providerUsername}
                  busy={busyId === connector.id}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}