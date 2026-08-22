import Layout from '../components/Layout';
import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Trash2, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:3001';

export default function Files() {
  const [activeTab, setActiveTab] = useState('files');
  const [recentSearches, setRecentSearches] = useState([]);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const fileInputRef = useRef(null);

  // Using a simple fixed sessionId for now since there's no auth wired into this page yet
  const sessionId = 'local-dev-session';

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/files?sessionId=${sessionId}`);
      const data = await res.json();
      setFiles(data.files || []);
    } catch (e) {
      console.error('Failed to fetch files:', e);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await uploadFile(file);
    e.target.value = ''; // reset so the same file can be re-selected later
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setError('');
    setStatusMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setStatusMsg(data.message || 'File uploaded successfully');
      await fetchFiles();
    } catch (e) {
      console.error('Upload error:', e);
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (id) => {
    try {
      await fetch(`${API_BASE}/files/${id}?sessionId=${sessionId}`, { method: 'DELETE' });
      await fetchFiles();
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      recentSearches={recentSearches}
      onNewChat={() => window.location.href = '/'}
    >
      <div className="flex justify-center mb-2">
        <span className="text-xs font-semibold text-secondary bg-surface px-3 py-1 rounded-full border border-border">
          File Upload
        </span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-serif font-bold text-primary text-center mb-6">
        Upload files to give context
      </h1>
      <p className="text-secondary text-center mb-8">
        PDF, Word, text files, and images (with OCR) are supported. Uploaded files are used as context when you ask questions.
      </p>

      {/* Upload box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="bg-surface border-2 border-dashed border-border rounded-xl p-10 mb-6 text-center cursor-pointer hover:bg-surface-hover hover:border-accent transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-secondary">
            <Loader2 size={28} className="animate-spin" />
            <span>Uploading and processing...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-secondary">
            <Upload size={28} />
            <span>Click to choose a file, or drag one here</span>
            <span className="text-xs">PDF, DOCX, TXT, or images</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )}
      {statusMsg && !error && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 mb-6 text-accent text-sm">
          ✓ {statusMsg}
        </div>
      )}

      {/* File list */}
      <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
        <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">
          Uploaded files ({files.length})
        </h2>
        {files.length === 0 ? (
          <p className="text-secondary text-sm py-4 text-center">No files uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors"
              >
                <FileText size={18} className="text-secondary shrink-0" />
                <span className="flex-1 text-primary/90 truncate">{f.filename}</span>
                <span className="text-xs text-secondary shrink-0">
                  {new Date(f.created).toLocaleDateString()}
                </span>
                <button
                  onClick={() => deleteFile(f.id)}
                  className="text-secondary hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}