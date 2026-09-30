import React from 'react';
import { 
  Inbox, 
  MessageSquareText, 
  ShieldAlert, 
  Activity, 
  Settings, 
  Sparkles,
  Stethoscope
} from 'lucide-react';

export default function Sidebar({ currentScreen, onSelectScreen }) {
  const navItems = [
    { id: 'queue', label: 'Handoff Queue', icon: Inbox, badge: '4' },
    { id: 'detail', label: 'Conversation Detail', icon: MessageSquareText },
  ];

  return (
    <aside style={{
      width: '64px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '16px 0',
      gap: '24px',
      flexShrink: 0,
      userSelect: 'none'
    }}>
      {/* Clinic Logo Mark */}
      <div 
        title="Sunrise Clinic Front Desk"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0071e3 0%, #00c6ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 2px 6px rgba(0, 113, 227, 0.25)',
          cursor: 'pointer'
        }}
      >
        <Stethoscope size={20} strokeWidth={2.2} />
      </div>

      {/* Nav Icons */}
      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        alignItems: 'center'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              title={item.label}
              style={{
                position: 'relative',
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? '#e8f2fc' : 'transparent',
                color: isActive ? 'var(--apple-blue)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              {item.badge && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  border: '1.5px solid #ffffff'
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div style={{
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px'
      }}>
        <div 
          title="Deterministic Safety Guardrail Active"
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)'
          }}
        />
      </div>
    </aside>
  );
}
