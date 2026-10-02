import React from 'react';

export default function Sidebar({ currentScreen, onSelectScreen }) {
  const icons = [
    { id: 'queue', shape: 'diamond' },
    { id: 'detail', shape: 'hexagon' },
    { id: 'settings', shape: 'circle-dot' },
    { id: 'logs', shape: 'circle' },
    { id: 'more', shape: 'circle' },
  ];

  return (
    <aside style={{
      width: '52px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #eef0f4',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 0',
      gap: '20px',
      flexShrink: 0,
      userSelect: 'none'
    }}>
      {/* Subtle Sidebar Geometric Icons matching assignment screenshot */}
      <button
        onClick={() => onSelectScreen('queue')}
        title="Handoff Queue"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: currentScreen === 'queue' ? '#f1f5f9' : 'transparent',
          color: currentScreen === 'queue' ? '#334155' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          transition: 'all 0.15s ease'
        }}
      >
        {/* Diamond / Square shape as in screenshot */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      </button>

      <button
        onClick={() => onSelectScreen('detail')}
        title="Conversation Detail"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: currentScreen === 'detail' ? '#f1f5f9' : 'transparent',
          color: currentScreen === 'detail' ? '#334155' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          transition: 'all 0.15s ease'
        }}
      >
        {/* Chat / Detail shape */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      <div style={{
        width: '18px',
        height: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#cbd5e1'
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </div>

      <div style={{
        width: '18px',
        height: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#cbd5e1'
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8"></circle>
        </svg>
      </div>

      <div style={{
        width: '18px',
        height: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#cbd5e1'
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8"></circle>
        </svg>
      </div>
    </aside>
  );
}
