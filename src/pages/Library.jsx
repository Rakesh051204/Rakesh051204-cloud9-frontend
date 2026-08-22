import Layout from '../components/Layout';
import { useState, useEffect } from 'react';
import { Search, Trash2, FileText, BookOpen, FolderOpen, Calendar, Clock, X, Eye } from 'lucide-react';

const API_BASE = 'http://localhost:3001';

export default function Library() {
  const [activeTab, setActiveTab] = useState('library');
  const [recentSearches, setRecentSearches] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const sessionId = localStorage.getItem('stoic_session_id') || 'anonymous';

  // ----- FETCH ITEMS -----
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/library?sessionId=${sessionId}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch library items:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ----- DELETE ITEM -----
  const handleDeleteItem = async (id) => {
    if (!confirm('Delete this item from library?')) return;
    try {
      await fetch(`${API_BASE}/library/${id}?sessionId=${sessionId}`, {
        method: 'DELETE',
      });
      await fetchItems();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete item.');
    }
  };

  // ----- FILTER ITEMS -----
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getIcon = (type) => {
    switch(type) {
      case 'note': return <BookOpen size={18} className="text-secondary" />;
      case 'project': return <FolderOpen size={18} className="text-secondary" />;
      case 'file': return <FileText size={18} className="text-secondary" />;
      default: return <FileText size={18} className="text-secondary" />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      recentSearches={recentSearches}
      onNewChat={() => window.location.href = '/'}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 px-2 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">Library</h1>
          <p className="text-secondary text-sm mt-1">Your saved conversations, projects, and files.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search library..."
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-primary placeholder-secondary/60 outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>

      {/* Item List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex gap-2">
            <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-surface border border-border rounded-xl px-4">
          <FileText size={48} className="mx-auto text-secondary/30 mb-4" />
          <p className="text-secondary">
            {searchQuery ? 'No items match your search.' : 'Your library is empty.'}
          </p>
          {!searchQuery && (
            <p className="text-sm text-secondary/60 mt-2">
              Save conversations, projects, and files here.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-2 sm:px-0">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-surface border border-border rounded-xl p-4 sm:p-5 shadow-card hover:shadow-soft transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-primary truncate">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-secondary mt-0.5 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-secondary/60">
                      <Clock size={12} />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      {item.type && (
                        <span className="px-2 py-0.5 bg-background border border-border rounded-full">
                          {item.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="p-1.5 rounded-lg hover:bg-surface-hover text-secondary hover:text-primary transition-colors"
                    title="View details"
                  >
                    <Eye size={17} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-secondary hover:text-red-500 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full border border-border shadow-soft p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-semibold text-primary">{selectedItem.title}</h3>
                <p className="text-xs text-secondary/60 mt-1">
                  {new Date(selectedItem.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-secondary hover:text-primary">
                <X size={24} />
              </button>
            </div>
            {selectedItem.description && (
              <div className="bg-background border border-border rounded-lg p-4 mb-4">
                <p className="text-sm text-secondary leading-relaxed">{selectedItem.description}</p>
              </div>
            )}
            {selectedItem.content && (
              <div className="bg-background border border-border rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
                <pre className="text-sm text-secondary/80 whitespace-pre-wrap font-mono">{selectedItem.content}</pre>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              {selectedItem.type && (
                <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">{selectedItem.type}</span>
              )}
              <span className="text-xs px-2 py-1 bg-background border border-border rounded-full text-secondary/60">
                ID: {selectedItem.id}
              </span>
            </div>
            <button
              onClick={() => {
                handleDeleteItem(selectedItem.id);
                setSelectedItem(null);
              }}
              className="mt-4 w-full py-2 bg-red-500/10 text-red-500 rounded-lg font-medium hover:bg-red-500/20 transition-colors"
            >
              Delete Item
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}