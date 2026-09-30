import React from 'react';
import { Play, Sparkles, Check, ChevronDown, RefreshCw } from 'lucide-react';

export default function TopBar({ 
  currentScreen, 
  onSelectScreen, 
  selectedScriptId, 
  onSelectScript, 
  onRunLive, 
  isRunning 
}) {
  const scripts = [
    { id: 'cv_4471', label: 'cv_4471: Default Brief Sample (Chest Pain Emergency)' },
    { id: 'cv_0001', label: 'cv_0001: Straightforward Booking (Dr. Rao)' },
    { id: 'cv_0002', label: 'cv_0002: Mid-sentence Date Correction (6 ko... nahi 7)' },
    { id: 'cv_0003', label: 'cv_0003: Reschedule Existing (Rajesh Kumar Sharma)' },
    { id: 'cv_0004', label: 'cv_0004: Cancel Own Appointment (Priya Nair)' },
    { id: 'cv_0005', label: 'cv_0005: Sunday Closed Abandoned' },
    { id: 'cv_0006', label: 'cv_0006: Doctor on Leave (Dr. Sethi)' },
    { id: 'cv_0007', label: 'cv_0007: Ambiguous Patient (Sharma Ji - 3 matches)' },
    { id: 'cv_0008', label: 'cv_0008: Guardian Booking (Aarav Gupta)' },
    { id: 'cv_0009', label: 'cv_0009: Unauthorized Neighbor (Mohit Negi)' },
    { id: 'cv_0010', label: 'cv_0010: Medical Advice Query (Crocin dosage)' },
    { id: 'cv_0011', label: 'cv_0011: Hard Rule (Emergency Mid-Booking)' },
    { id: 'cv_0012', label: 'cv_0012: Hinglish Clock (Parso Gyarah Baje)' },
    { id: 'cv_0013', label: 'cv_0013: Empty / Noise Abandoned' },
    { id: 'cv_0014', label: 'cv_0014: Admin Injection Refused' },
    { id: 'cv_0015', label: 'cv_0015: Slot Conflict Fallback (09:30)' },
    { id: 'adv_0001', label: 'adv_0001: Delayed Cardiac Symptoms' },
    { id: 'adv_0002', label: 'adv_0002: Patient Name Prompt Injection' },
    { id: 'adv_0003', label: 'adv_0003: Unregistered Aunt Impersonation' },
    { id: 'adv_0004', label: 'adv_0004: Non-existent Leap Year Slot' },
    { id: 'adv_0005', label: 'adv_0005: Subtle Polypharmacy Triage' },
    { id: 'adv_0006', label: 'adv_0006: Adult Requesting Paediatrician' },
    { id: 'adv_0007', label: 'adv_0007: Cancel Non-existent Booking' },
    { id: 'adv_0008', label: 'adv_0008: Caller Mid-call Withdrawal' },
  ];

  return (
    <header style={{
      height: '56px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      userSelect: 'none',
      zIndex: 10
    }}>
      {/* Left: Clinic Title & Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '-0.01em', color: '#111827' }}>
            Sunrise Clinic
          </span>
          <span style={{
            fontSize: '10px',
            fontWeight: '600',
            backgroundColor: '#f3f4f6',
            color: '#6b7280',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            Dehradun
          </span>
        </div>

        {/* View Switcher Pills */}
        <div style={{
          display: 'flex',
          backgroundColor: '#f1f5f9',
          padding: '2px',
          borderRadius: '8px'
        }}>
          <button
            onClick={() => onSelectScreen('queue')}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: '500',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: currentScreen === 'queue' ? '#ffffff' : 'transparent',
              color: currentScreen === 'queue' ? '#0f172a' : '#64748b',
              boxShadow: currentScreen === 'queue' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Handoff Queue
          </button>
          <button
            onClick={() => onSelectScreen('detail')}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: '500',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: currentScreen === 'detail' ? '#ffffff' : 'transparent',
              color: currentScreen === 'detail' ? '#0f172a' : '#64748b',
              boxShadow: currentScreen === 'detail' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Conversation Detail
          </button>
        </div>
      </div>

      {/* Right: Live Interactive Runner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ position: 'relative' }}>
          <select
            value={selectedScriptId}
            onChange={(e) => onSelectScript(e.target.value)}
            style={{
              appearance: 'none',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px 30px 6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              color: '#1e293b',
              cursor: 'pointer',
              outline: 'none',
              maxWidth: '310px'
            }}
          >
            {scripts.map(s => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '10px', pointerEvents: 'none', color: '#64748b' }} />
        </div>

        <button
          onClick={onRunLive}
          disabled={isRunning}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: '600',
            backgroundColor: '#0071e3',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: isRunning ? 'wait' : 'pointer',
            boxShadow: '0 1px 3px rgba(0, 113, 227, 0.25)',
            transition: 'background-color 0.15s ease'
          }}
        >
          {isRunning ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play size={13} fill="#ffffff" />
              Replay Script
            </>
          )}
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 8px',
          backgroundColor: '#ecfdf5',
          border: '1px solid #d1fae5',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '600',
          color: '#059669'
        }}>
          <Check size={12} strokeWidth={3} />
          Deterministic 3x
        </div>
      </div>
    </header>
  );
}
