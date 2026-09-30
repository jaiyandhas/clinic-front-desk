import React from 'react';
import { ArrowLeft, CheckCircle2, ShieldAlert, Cpu, Clock, Terminal } from 'lucide-react';

export default function ConversationDetail({ conversationData, onBack }) {
  const data = conversationData || {
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

  return (
    <div className="animate-fade" style={{ maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: 'var(--apple-blue)',
          fontSize: '13px',
          fontWeight: '500',
          cursor: 'pointer',
          marginBottom: '16px',
          padding: '4px 0'
        }}
      >
        <ArrowLeft size={16} />
        Back to Handoff Queue
      </button>

      {/* Detail Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '28px'
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '600',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            marginBottom: '4px'
          }}>
            Conversation {data.id}
          </h1>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            {data.clinic} — {data.timestamp}
          </p>
        </div>

        <div style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '0.04em',
          padding: '5px 12px',
          borderRadius: '4px',
          border: '1px solid #fecaca',
          textTransform: 'uppercase'
        }}>
          {data.statusBadge}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left Column: Transcript and Tool Calls */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            Transcript and tool calls
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {data.items.map((item, idx) => {
              if (item.type === 'tool') {
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #e2e8f0',
                      padding: '12px 16px',
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: '12px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start'
                    }}
                  >
                    <span style={{
                      color: 'var(--apple-blue)',
                      fontWeight: '700',
                      fontSize: '10px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      backgroundColor: '#eff6ff',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid #dbeafe',
                      marginTop: '1px'
                    }}>
                      {item.label}
                    </span>
                    <div style={{ flex: 1, wordBreak: 'break-all' }}>
                      <div style={{ color: '#0f172a', fontWeight: '500' }}>
                        {item.call}
                      </div>
                      {item.output && (
                        <div style={{ color: '#059669', marginTop: '4px', fontWeight: '500' }}>
                          {item.output}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              const isCaller = item.type === 'caller';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    letterSpacing: '0.06em',
                    color: isCaller ? '#64748b' : '#0284c7',
                    textTransform: 'uppercase'
                  }}>
                    {item.label}
                  </span>
                  <div style={{
                    fontSize: '13.5px',
                    lineHeight: '1.5',
                    color: 'var(--text-primary)',
                    backgroundColor: isCaller ? '#ffffff' : '#f0f9ff',
                    padding: isCaller ? '0' : '10px 14px',
                    borderRadius: isCaller ? '0' : '8px',
                    border: isCaller ? 'none' : '1px solid #e0f2fe'
                  }}>
                    {item.text}
                  </div>
                </div>
              );
            })}

            {/* Bottom Alert Banner */}
            {data.notice && (
              <div style={{
                marginTop: '12px',
                padding: '12px 16px',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                border: '1px solid #fee2e2',
                color: '#b91c1c',
                fontSize: '12.5px',
                fontWeight: '500'
              }}>
                {data.notice}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Outcome Panel */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            Outcome
          </div>

          <div style={{ padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontFamily: 'ui-monospace, monospace', fontSize: '12px' }}>
                    terminal_state
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {data.outcome.terminal_state}
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontFamily: 'ui-monospace, monospace', fontSize: '12px' }}>
                    escalation_reason
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: '600', color: '#dc2626' }}>
                    {data.outcome.escalation_reason || 'null'}
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontFamily: 'ui-monospace, monospace', fontSize: '12px' }}>
                    patient_id
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontWeight: '500' }}>
                    {data.outcome.patient_id || 'null'}
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontFamily: 'ui-monospace, monospace', fontSize: '12px' }}>
                    appointment_id
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontFamily: 'ui-monospace, monospace', color: 'var(--text-tertiary)' }}>
                    {data.outcome.appointment_id || 'null'}
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontFamily: 'ui-monospace, monospace', fontSize: '12px' }}>
                    tool_calls
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: '600' }}>
                    {data.outcome.tool_calls}
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontFamily: 'ui-monospace, monospace', fontSize: '12px' }}>
                    turns
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: '600' }}>
                    {data.outcome.turns}
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontFamily: 'ui-monospace, monospace', fontSize: '12px' }}>
                    tokens
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: '500' }}>
                    {data.outcome.tokens}
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontFamily: 'ui-monospace, monospace', fontSize: '12px' }}>
                    latency
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: '500' }}>
                    {data.outcome.latency}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Bottom Determinism Box */}
            <div style={{
              margin: '18px 20px 20px',
              padding: '14px 16px',
              backgroundColor: '#fafbfc',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  letterSpacing: '0.06em',
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  marginBottom: '2px'
                }}>
                  Determinism
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {data.determinism.text}
                </div>
              </div>

              <div style={{
                backgroundColor: '#dcfce7',
                color: '#15803d',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.04em',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid #bbf7d0',
                textTransform: 'uppercase'
              }}>
                {data.determinism.badge}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
