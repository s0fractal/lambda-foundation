import React from 'react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const views = [
    { id: 'garden', name: 'λ-GARDEN', icon: '🌱' },
    { id: 'memory', name: 'λ_MEMORY', icon: '🧠' },
    { id: 'phototropic', name: 'λ_MIRROR', icon: '🎥' },
  ];
  
  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.9)',
      padding: 10,
      borderRadius: 10,
      border: '1px solid #32cd32',
      display: 'flex',
      gap: 10
    }}>
      {views.map(view => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          style={{
            background: currentView === view.id ? '#32cd32' : 'transparent',
            color: currentView === view.id ? '#0a0a0a' : '#90ee90',
            border: '1px solid #32cd32',
            padding: '8px 16px',
            borderRadius: 5,
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontSize: 14,
            fontFamily: 'JetBrains Mono, monospace',
            display: 'flex',
            alignItems: 'center',
            gap: 5
          }}
          onMouseEnter={e => {
            if (currentView !== view.id) {
              e.currentTarget.style.background = 'rgba(50, 205, 50, 0.2)';
            }
          }}
          onMouseLeave={e => {
            if (currentView !== view.id) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <span>{view.icon}</span>
          <span>{view.name}</span>
        </button>
      ))}
    </div>
  );
}