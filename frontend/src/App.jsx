import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HandoffQueue from './components/HandoffQueue';
import ConversationDetail from './components/ConversationDetail';
import { API_BASE_URL } from './config';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('queue'); // 'queue' or 'detail'
  const [selectedConversationId, setSelectedConversationId] = useState('cv_4471');
  const [conversationDetail, setConversationDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [kpis, setKpis] = useState(null);

  // Load KPIs on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/kpis`)
      .then(res => res.json())
      .then(data => setKpis(data))
      .catch(err => console.error('Failed to load KPIs:', err));
  }, []);

  const handleSelectConversation = async (conversationId) => {
    setSelectedConversationId(conversationId);
    setIsLoadingDetail(true);
    setCurrentScreen('detail');

    try {
      const res = await fetch(`${API_BASE_URL}/api/handoffs/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setConversationDetail(data);
      } else {
        console.error('Failed to load conversation detail:', res.statusText);
      }
    } catch (err) {
      console.error('Error fetching conversation detail:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#fcfdfd' }}>
      {/* Shared Minimalist Sidebar */}
      <Sidebar 
        currentScreen={currentScreen} 
        onSelectScreen={(screen) => {
          if (screen === 'detail') {
            handleSelectConversation(selectedConversationId);
          } else {
            setCurrentScreen(screen);
          }
        }} 
      />

      {/* Main Screen Content */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px 48px',
        backgroundColor: '#fcfdfd'
      }}>
        {currentScreen === 'queue' ? (
          <HandoffQueue 
            kpis={kpis} 
            onSelectConversation={handleSelectConversation} 
          />
        ) : (
          <ConversationDetail 
            conversationId={selectedConversationId}
            detail={conversationDetail}
            loading={isLoadingDetail}
            onBack={() => setCurrentScreen('queue')} 
          />
        )}
      </main>
    </div>
  );
}
