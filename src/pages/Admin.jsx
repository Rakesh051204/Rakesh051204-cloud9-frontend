import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts'
import './Admin.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function Admin() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [settings, setSettings] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'member' })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/stats`),
        fetch(`${API_BASE}/api/admin/users`),
        fetch(`${API_BASE}/api/admin/settings`)
      ])
      setStats(await statsRes.json())
      setUsers(await usersRes.json())
      setSettings(await settingsRes.json())
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
    setLoading(false)
  }

  const addUser = async () => {
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    })
    if (res.ok) {
      fetchDashboardData()
      setShowAddUser(false)
      setNewUser({ name: '', email: '', role: 'member' })
    }
  }

  const deleteUser = async (id) => {
    if (confirm('Delete this user?')) {
      await fetch(`${API_BASE}/api/admin/users/${id}`, { method: 'DELETE' })
      fetchDashboardData()
    }
  }

  const updateSettings = async () => {
    const res = await fetch(`${API_BASE}/api/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
    if (res.ok) alert('Settings saved!')
  }

  if (loading) return <div className="admin-loading">Loading dashboard...</div>

  const COLORS = ['#4f8eff', '#22d3ee', '#34d399', '#f59e0b']

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo" onClick={() => navigate('/')}>
          ☁️ <span>Cloud9 Admin</span>
        </div>
        <nav className="admin-nav">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            📊 Overview
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            👥 Users
          </button>
          <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
            📈 Analytics
          </button>
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
            ⚙️ Settings
          </button>
        </nav>
        <button className="back-to-app" onClick={() => navigate('/')}>
          ← Back to Search
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="admin-header-actions">
            <span className="plan-badge">{settings?.plan?.toUpperCase()}</span>
          </div>
        </header>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="admin-overview">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🔍</div>
                <div className="stat-info">
                  <h3>{stats.totalSearches}</h3>
                  <p>Total Searches</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{stats.successfulSearches}</h3>
                  <p>Successful</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚠️</div>
                <div className="stat-info">
                  <h3>{stats.failedSearches}</h3>
                  <p>Failed</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚡</div>
                <div className="stat-info">
                  <h3>{stats.avgResponseTime}ms</h3>
                  <p>Avg Response</p>
                </div>
              </div>
            </div>

            <div className="charts-row">
              <div className="chart-card">
                <h3>Searches (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3058" />
                    <XAxis dataKey="date" stroke="#8b9ac0" />
                    <YAxis stroke="#8b9ac0" />
                    <Tooltip contentStyle={{ background: '#0d1b35', border: '1px solid #1e3058' }} />
                    <Line type="monotone" dataKey="searches" stroke="#4f8eff" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>API Usage</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Used', value: stats.apiCallsThisMonth },
                        { name: 'Remaining', value: stats.apiLimit - stats.apiCallsThisMonth }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#4f8eff"
                      dataKey="value"
                      label
                    >
                      <Cell fill="#4f8eff" />
                      <Cell fill="#1e3058" />
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0d1b35', border: '1px solid #1e3058' }} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="usage-text">{Math.round(stats.usagePercentage)}% of monthly limit</p>
              </div>
            </div>

            <div className="recent-searches">
              <h3>Recent Searches</h3>
              <table className="data-table">
                <thead>
                  <tr><th>Query</th><th>User</th><th>Time</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {stats.recentSearches.map(search => (
                    <tr key={search.id}>
                      <td>{search.query}</td>
                      <td>{search.userId}</td>
                      <td>{new Date(search.timestamp).toLocaleString()}</td>
                      <td className={search.success ? 'status-success' : 'status-failed'}>
                        {search.success ? '✅ Success' : '❌ Failed'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="admin-users">
            <div className="users-header">
              <button className="btn-primary" onClick={() => setShowAddUser(true)}>+ Add User</button>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className={`role-badge role-${user.role}`}>{user.role}</span></td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn-delete" onClick={() => deleteUser(user.id)}>Delete</button></td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan="5" className="empty-state">No users yet. Add your first user!</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && settings && (
          <div className="admin-settings">
            <div className="settings-group">
              <label>Company Name</label>
              <input type="text" value={settings.companyName} onChange={e => setSettings({...settings, companyName: e.target.value})} />
            </div>
            <div className="settings-group">
              <label>Primary Color</label>
              <input type="color" value={settings.primaryColor} onChange={e => setSettings({...settings, primaryColor: e.target.value})} />
            </div>
            <div className="settings-group">
              <label>
                <input type="checkbox" checked={settings.allowTeamSharing} onChange={e => setSettings({...settings, allowTeamSharing: e.target.checked})} />
                Allow Team Sharing
              </label>
            </div>
            <button className="btn-primary" onClick={updateSettings}>Save Settings</button>
          </div>
        )}
      </main>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add New User</h3>
            <input type="text" placeholder="Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
            <input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
            <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <div className="modal-actions">
              <button onClick={addUser}>Add</button>
              <button onClick={() => setShowAddUser(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}