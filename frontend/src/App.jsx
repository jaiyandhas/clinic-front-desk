import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import HandoffQueue from './components/HandoffQueue';
import ConversationDetail from './components/ConversationDetail';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('queue'); // 'queue' or 'detail'

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#fcfdfd' }}>
      {/* Shared Minimalist Sidebar */}
      <Sidebar 
        currentScreen={currentScreen} 
        onSelectScreen={setCurrentScreen} 
      />

      {/* Main Screen Content */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px 48px',
        backgroundColor: '#fcfdfd'
      }}>
        {currentScreen === 'queue' ? (
          <HandoffQueue onSelectConversation={() => setCurrentScreen('detail')} />
        ) : (
          <ConversationDetail onBack={() => setCurrentScreen('queue')} />
        )}
      </main>
    </div>
  );
}
