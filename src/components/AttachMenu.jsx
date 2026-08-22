import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Paperclip,
  Camera,
  Image,
  FolderPlus,
  Library,
  Brain,
  Plug,
  Puzzle,
  Globe,
  MapPin,
  Mic,
  X,
  Plus,
  Check,
} from 'lucide-react';

const API_BASE = 'http://localhost:3001';

// Stoic design tokens
const C = {
  bg: '#0B0B0D',
  hover: '#17171A',
  border: '#232326',
  text: '#F2F2F0',
  muted: '#8A8A8E',
  clay: '#CC785C',
  periwinkle: '#7C83DB',
};

export default function AttachMenu({
  sessionId,
  onFileUploaded,
  searchEnabled,
  onToggleSearch,
  deepResearchEnabled,
  onToggleDeepResearch,
  codeAnalysisEnabled,
  onToggleCodeAnalysis,
  onAddToProject,
  onAttachFromLibrary,
  onAddLocation,
  onVoice,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [phase, setPhase] = useState('measuring');

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const MENU_WIDTH = 272;
  const GAP = 8;
  const EDGE_PADDING = 8;

  useEffect(() => {
    if (isOpen) setPhase('measuring');
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen || phase !== 'measuring' || !menuRef.current || !buttonRef.current) {
      return;
    }

    const menuEl = menuRef.current;
    const btnRect = buttonRef.current.getBoundingClientRect();
    const menuHeight = menuEl.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = btnRect.left;
    if (left + MENU_WIDTH + EDGE_PADDING > vw) {
      left = vw - MENU_WIDTH - EDGE_PADDING;
    }
    if (left < EDGE_PADDING) left = EDGE_PADDING;

    const spaceBelow = vh - btnRect.bottom - GAP;
    const spaceAbove = btnRect.top - GAP;

    let top;
    if (menuHeight <= spaceBelow || spaceBelow >= spaceAbove) {
      top = btnRect.bottom + GAP;
      const maxTop = Math.max(vh - EDGE_PADDING - menuHeight, EDGE_PADDING);
      top = Math.min(top, maxTop);
      top = Math.max(top, EDGE_PADDING);
    } else {
      top = btnRect.top - GAP - menuHeight;
      top = Math.max(top, EDGE_PADDING);
    }

    menuEl.style.left = `${left}px`;
    menuEl.style.top = `${top}px`;
    menuEl.style.visibility = 'visible';

    setPhase('ready');
  }, [isOpen, phase]);

  useEffect(() => {
    if (!isOpen) return;
    const remeasure = () => setPhase('measuring');
    window.addEventListener('resize', remeasure);
    window.addEventListener('scroll', remeasure, true);
    return () => {
      window.removeEventListener('resize', remeasure);
      window.removeEventListener('scroll', remeasure, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (
        menuRef.current?.contains(e.target) ||
        buttonRef.current?.contains(e.target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const uploadFile = async (file) => {
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
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const menuGroups = [
    {
      id: 'uploads',
      items: [
        {
          id: 'files',
          label: 'Upload files',
          icon: Paperclip,
          shortcut: 'Ctrl+U',
          action: () => fileInputRef.current?.click(),
        },
        {
          id: 'image',
          label: 'Add image',
          icon: Image,
          shortcut: null,
          action: () => imageInputRef.current?.click(),
        },
        {
          id: 'screenshot',
          label: 'Take photo',
          icon: Camera,
          shortcut: null,
          action: () => alert('Camera capture coming soon!'),
        },
      ],
    },
    {
      id: 'organize',
      items: [
        {
          id: 'add-to-project',
          label: 'Add to project',
          icon: FolderPlus,
          shortcut: null,
          action: () => {
            if (onAddToProject) onAddToProject();
            else alert('Add to project feature coming soon!');
            setIsOpen(false);
          },
        },
        {
          id: 'library',
          label: 'Attach from Library',
          icon: Library,
          shortcut: null,
          action: () => {
            if (onAttachFromLibrary) onAttachFromLibrary();
            else alert('Attach from Library coming soon!');
            setIsOpen(false);
          },
        },
      ],
    },
    {
      id: 'toggles',
      items: [
        {
          id: 'websearch',
          label: 'Web search',
          icon: Globe,
          checked: searchEnabled,
          action: () => onToggleSearch?.(),
        },
        {
          id: 'deepresearch',
          label: 'Deep research',
          icon: Brain,
          checked: deepResearchEnabled,
          action: () => onToggleDeepResearch?.(),
        },
        {
          id: 'codeanalysis',
          label: 'Code / Data analysis',
          icon: Puzzle,
          checked: codeAnalysisEnabled,
          action: () => onToggleCodeAnalysis?.(),
        },
      ],
    },
    {
      id: 'context',
      items: [
        {
          id: 'location',
          label: 'Add location',
          icon: MapPin,
          shortcut: null,
          action: () => {
            if (onAddLocation) onAddLocation();
            else alert('Location feature coming soon!');
            setIsOpen(false);
          },
        },
        {
          id: 'voice',
          label: 'Voice',
          icon: Mic,
          shortcut: null,
          action: () => {
            if (onVoice) onVoice();
            else alert('Voice input coming soon!');
            setIsOpen(false);
          },
        },
      ],
    },
    {
      id: 'nav',
      items: [
        {
          id: 'connector',
          label: 'Connect apps',
          icon: Plug,
          hasSubmenu: true,
          action: () => alert('Connect apps: GitHub, Notion, Slack, Google Drive — coming soon!'),
        },
        {
          id: 'more-tools',
          label: 'More tools',
          icon: Puzzle,
          hasSubmenu: true,
          action: () => alert('More tools coming soon!'),
        },
      ],
    },
  ];

  return (
    <div style={{ display: 'inline-block' }}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((v) => !v)}
        title="Add attachment or tool"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 30,
          height: 30,
          borderRadius: '50%',
          border: `1px solid ${C.border}`,
          background: isOpen ? C.hover : 'transparent',
          color: C.text,
          cursor: 'pointer',
          transition: 'background 120ms ease, transform 120ms ease',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
      >
        {isOpen ? <X size={16} /> : <Plus size={16} />}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: MENU_WIDTH,
              visibility: phase === 'ready' ? 'visible' : 'hidden',
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              boxShadow: '0 12px 32px rgba(0,0,0,0.55)',
              zIndex: 999,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '6px', maxHeight: '70vh', overflowY: 'auto' }}>
              {menuGroups.map((group, gi) => (
                <div key={group.id}>
                  {gi > 0 && (
                    <div style={{ height: 1, background: C.border, margin: '6px 4px' }} />
                  )}
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: 'none',
                          background: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background 100ms ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = C.hover)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Icon size={17} strokeWidth={1.75} color={C.muted} />
                          <span style={{ fontSize: 14, color: C.text }}>{item.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {item.shortcut && (
                            <span style={{ fontSize: 12, color: C.muted }}>{item.shortcut}</span>
                          )}
                          {item.checked && <Check size={16} strokeWidth={2} color={C.periwinkle} />}
                          {item.hasSubmenu && (
                            <span style={{ fontSize: 14, color: C.muted }}>{'\u203A'}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        disabled={isUploading}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
        disabled={isUploading}
      />
    </div>
  );
}