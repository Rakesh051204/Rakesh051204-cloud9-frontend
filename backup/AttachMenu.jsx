import { useState, useRef } from 'react';
import { Paperclip, Camera, Brain, Plug, Puzzle, Globe, X, Plus } from 'lucide-react';

const API_BASE = 'http://localhost:3001';

export default function AttachMenu({ 
  sessionId, 
  onFileUploaded, 
  searchEnabled, 
  onToggleSearch 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);
    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        onFileUploaded(data);
        setIsOpen(false);
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (err) {
      alert('Failed to upload file.');
    }
    setIsUploading(false);
    e.target.value = '';
  };

  const menuItems = [
    { 
      id: 'files', 
      label: 'Add files or photos', 
      icon: Paperclip, 
      shortcut: 'Ctrl+U',
      action: () => fileInputRef.current?.click()
    },
    { 
      id: 'screenshot', 
      label: 'Take a screenshot', 
      icon: Camera, 
      shortcut: null,
      action: () => alert('Screenshot feature coming soon!')
    },
    { 
      id: 'skills', 
      label: 'Skills', 
      icon: Brain, 
      shortcut: null,
      action: () => alert('Skills feature coming soon!')
    },
    { 
      id: 'connector', 
      label: 'Add connector', 
      icon: Plug, 
      shortcut: null,
      action: () => alert('Connectors feature coming soon!')
    },
    { 
      id: 'plugins', 
      label: 'Add plugins...', 
      icon: Puzzle, 
      shortcut: null,
      action: () => alert('Plugins feature coming soon!')
    },
    { 
      id: 'websearch', 
      label: 'Web search', 
      icon: Globe, 
      shortcut: null,
      action: () => {
        onToggleSearch();
        setIsOpen(false);
      }
    },
  ];

  return (
    <div className="relative inline-block">
      {/* Plus button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg hover:bg-[#2a2a2a] transition-colors text-[#666] hover:text-white"
        title="Add attachment"
      >
        {isOpen ? <X size={16} /> : <Plus size={16} />}
      </button>

      {/* Dropdown menu - opens DOWNWARD */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-[#252525] border border-[#3a3a3a] rounded-xl shadow-soft z-50 overflow-hidden">
          <div className="py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-[#2a2a2a] transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className="text-[#666] group-hover:text-white" />
                    <span className="text-sm text-[#ccc] group-hover:text-white">{item.label}</span>
                  </div>
                  {item.shortcut && (
                    <span className="text-xs text-[#555] group-hover:text-[#666]">{item.shortcut}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}