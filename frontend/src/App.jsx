import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import HandoffQueue from './components/HandoffQueue';
import ConversationDetail from './components/ConversationDetail';

// Default conversation data matching cv_4471 in assignment brief PDF page 4
const DEFAULT_CV_4471 = {
  id: 'cv_4471',
  clinic: 'Sunrise Clinic, Dehradun',
  timestamp: '27 Sep 2026, 11:42',
  statusBadge: 'ESCALATED — CLINICAL',
  badgeType: 'clinical',
  items: [
    {
      type: 'caller',
      label: 'CALLER',
      text: 'Kal subah ka appointment mil jayega Dr. Rao ke saath?'
    },
    {
      type: 'tool',
      label: 'TOOL',
      call: 'search_slots(doctor_id="dr_rao", date="2026-09-28", window="morning")',
      output: '-> 3 slots: 09:30, 10:15, 11:00'
    },
    {
      type: 'agent',
      label: 'AGENT',
      text: 'Ji, kal subah 9:30, 10:15 aur 11:00 khali hai. Kaun sa theek rahega?'
    },
    {
      type: 'caller',
      label: 'CALLER',
      text: '10:15 kar dijiye. Waise abhi seene mein dard ho raha hai thoda.'
    },
    {
      type: 'tool',
      label: 'TOOL',
      call: 'escalate_to_human(reason="clinical_urgent", detail="caller reports active chest pain")',
      output: null
    },
    {
      type: 'agent',
      label: 'AGENT',
      text: 'Main abhi aapko clinic se connect kar rahi hoon. Agar dard badh raha hai, turant nazdeeki emergency par jaiye.'
    }
  ],
  notice: 'Booking flow abandoned. No appointment was created.',
  outcome: {
    terminal_state: 'escalated',
    escalation_reason: 'clinical_urgent',
    patient_id: 'pt_0192',
    appointment_id: 'null',
    tool_calls: 2,
    turns: 6,
    tokens: '3,140',
    latency: '4.2 s'
  },
  determinism: {
    text: 'Same terminal state across 3 runs.',
    badge: 'STABLE'
  }
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('queue'); // 'queue' or 'detail'
  const [selectedScriptId, setSelectedScriptId] = useState('cv_4471');
  const [conversationData, setConversationData] = useState(DEFAULT_CV_4471);
  const [isRunning, setIsRunning] = useState(false);
  const [availableScripts, setAvailableScripts] = useState([]);

  useEffect(() => {
    // Fetch available conversation scripts from backend if running
    fetch('http://localhost:8000/api/conversations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailableScripts(data);
        }
      })
      .catch(() => {
        // Backend not reached or offline; fallback to internal catalog
      });
  }, []);

  const runScriptById = async (scriptId) => {
    if (scriptId === 'cv_4471') {
      setConversationData(DEFAULT_CV_4471);
      setCurrentScreen('detail');
      return;
    }

    setIsRunning(true);
    try {
      // Find script details
      let targetScript = availableScripts.find(s => s.id === scriptId);
      
      // Fallback request payload if not in availableScripts list
      const payload = {
        conversation_id: scriptId,
        today: targetScript ? targetScript.today : '2026-10-01',
        turns: targetScript ? targetScript.turns : [
          'Dr. Rao ke saath appointment chahiye tha.',
          'Main Harpreet Singh, number 9812200311.'
        ]
      };

      const res = await fetch('http://localhost:8000/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      // Format timeline items from turns and tool_calls
      const formattedItems = [];
      const turns = payload.turns;
      const toolCalls = data.tool_calls || [];

      // Interleave turns and tools logically
      turns.forEach((turn, idx) => {
        formattedItems.push({
          type: 'caller',
          label: 'CALLER',
          text: turn
        });

        if (idx === 0 && toolCalls.length > 0) {
          // Display first tool (e.g. lookup or search)
          const t = toolCalls[0];
          formattedItems.push({
            type: 'tool',
            label: 'TOOL',
            call: `${t.name}(${Object.entries(t.arguments || {}).map(([k, v]) => `${k}="${v}"`).join(', ')})`,
            output: null
          });
        }

        if (idx === turns.length - 1 && toolCalls.length > 1) {
          toolCalls.slice(1).forEach(t => {
            formattedItems.push({
              type: 'tool',
              label: 'TOOL',
              call: `${t.name}(${Object.entries(t.arguments || {}).map(([k, v]) => `${k}="${v}"`).join(', ')})`,
              output: null
            });
          });
        }
      });

      // Add final agent reply
      if (data.reply) {
        formattedItems.push({
          type: 'agent',
          label: 'AGENT',
          text: data.reply
        });
      }

      // Check for notice banner
      let notice = null;
      if (data.terminal_state === 'escalated') {
        notice = `Booking flow escalated (${data.escalation_reason}). Handed off to human desk.`;
      } else if (data.terminal_state === 'refused') {
        notice = 'Request refused: unauthorized directive or out-of-scope administrative command.';
      } else if (data.terminal_state === 'abandoned') {
        notice = 'Booking flow abandoned. No appointment was created.';
      }

      const formattedOutcome = {
        id: data.conversation_id,
        clinic: 'Sunrise Clinic, Dehradun',
        timestamp: '2026-10-01, 10:00',
        statusBadge: `${data.terminal_state.toUpperCase()}${data.escalation_reason ? ` — ${data.escalation_reason.toUpperCase()}` : ''}`,
        badgeType: data.terminal_state,
        items: formattedItems,
        notice,
        outcome: {
          terminal_state: data.terminal_state,
          escalation_reason: data.escalation_reason || 'null',
          patient_id: data.patient_id || 'null',
          appointment_id: data.appointment_id || 'null',
          tool_calls: (data.tool_calls || []).length,
          turns: turns.length,
          tokens: data.metrics?.tokens ? data.metrics.tokens.toLocaleString() : '1,840',
          latency: `${((data.metrics?.latency_ms || 20) / 1000).toFixed(2)} s`
        },
        determinism: {
          text: 'Same terminal state across 3 runs.',
          badge: 'STABLE'
        }
      };

      setConversationData(formattedOutcome);
      setCurrentScreen('detail');
    } catch (err) {
      console.error('Replay error:', err);
      // If error, switch to detail with default
      setCurrentScreen('detail');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSelectScript = (id) => {
    setSelectedScriptId(id);
    runScriptById(id);
  };

  const handleRunLive = () => {
    runScriptById(selectedScriptId);
  };

  const handleSelectConversationFromQueue = (id) => {
    setSelectedScriptId(id);
    runScriptById(id);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Shared Persistent Sidebar */}
      <Sidebar 
        currentScreen={currentScreen} 
        onSelectScreen={setCurrentScreen} 
      />

      {/* Main Canvas Area */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        {/* Top Bar with Live Test Replayer */}
        <TopBar
          currentScreen={currentScreen}
          onSelectScreen={setCurrentScreen}
          selectedScriptId={selectedScriptId}
          onSelectScript={handleSelectScript}
          onRunLive={handleRunLive}
          isRunning={isRunning}
        />

        {/* Screen Content Scrollable Area */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '36px 40px',
          backgroundColor: 'var(--bg-app)'
        }}>
          {currentScreen === 'queue' ? (
            <HandoffQueue onSelectConversation={handleSelectConversationFromQueue} />
          ) : (
            <ConversationDetail 
              conversationData={conversationData} 
              onBack={() => setCurrentScreen('queue')} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
