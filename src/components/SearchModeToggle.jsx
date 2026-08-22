import { Zap, Scale, Sparkles } from 'lucide-react';

const COLORS = {
  surface: '#0F0F0E', border: '#232320', text: '#F2F2F0', textMuted: '#9A9A96',
  textDim: '#5A5A57', periwinkle: '#7C83DB',
};

const MODES = [
  { key: 'speed', label: 'Speed', icon: Zap },
  { key: 'balanced', label: 'Balanced', icon: Scale },
  { key: 'quality', label: 'Quality', icon: Sparkles },
];

export default function SearchModeToggle({ mode, onModeChange }) {
  return (
    <div style={{
      display: 'flex', gap: 2, background: COLORS.surface,
      border: `0.5px solid ${COLORS.border}`, borderRadius: 20,
      padding: 3, width: 'fit-content', marginBottom: 8, marginLeft: 4,
    }}>
      {MODES.map(({ key, label, icon: Icon }) => {
        const active = mode === key;
        return (
          <button
            key={key}
            onClick={() => onModeChange(key)}
            aria-label={`Search mode: ${label}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 16, border: 'none',
              cursor: 'pointer', fontSize: 12.5, fontWeight: 500,
              transition: 'all 0.15s ease',
              background: active ? 'rgba(124,131,219,0.14)' : 'transparent',
              color: active ? COLORS.periwinkle : COLORS.textMuted,
            }}
          >
            <Icon size={13} />
            {label}
          </button>
        );
      })}
    </div>
  );
}