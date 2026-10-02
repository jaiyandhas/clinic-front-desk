import React from 'react';

export default function ConversationDetail({ onBack }) {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onBack}
              title="Back to queue"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              letterSpacing: '-0.01em'
            }}>
              Conversation cv_4471
            </h1>
          </div>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '4px',
            marginLeft: '26px'
          }}>
            Sunrise Clinic, Dehradun — 27 Sep 2026, 11:42
          </p>
        </div>

        <div style={{
          backgroundColor: '#fef2f2',
          color: '#ef4444',
          fontSize: '11px',
          fontWeight: '600',
          padding: '3px 8px',
          borderRadius: '4px',
          border: '1px solid #fecaca',
          letterSpacing: '0.04em'
        }}>
          ESCALATED — CLINICAL
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.7fr 1fr',
        gap: '20px',
        alignItems: 'start'
      }}>
        {/* Left Column: Transcript and tool calls */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid #f3f4f6',
            fontSize: '13px',
            fontWeight: '600',
            color: '#111827'
          }}>
            Transcript and tool calls
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Utterance 1 */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#9ca3af', letterSpacing: '0.05em', marginBottom: '2px' }}>
                CALLER
              </div>
              <div style={{ fontSize: '13px', color: '#1f2937' }}>
                Kal subah ka appointment mil jayega Dr. Rao ke saath?
              </div>
            </div>

            {/* Tool 1 */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              padding: '10px 14px',
              fontFamily: 'ui-monospace, monospace',
              fontSize: '11.5px',
              color: '#0f172a'
            }}>
              <span style={{ color: '#2563eb', fontWeight: '600', marginRight: '8px' }}>TOOL</span>
              <span>search_slots(doctor_id="dr_rao", date="2026-09-28", window="morning")</span>
              <div style={{ color: '#059669', marginTop: '3px' }}>
                -&gt; 3 slots: 09:30, 10:15, 11:00
              </div>
            </div>

            {/* Utterance 2 */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#9ca3af', letterSpacing: '0.05em', marginBottom: '2px' }}>
                AGENT
              </div>
              <div style={{ fontSize: '13px', color: '#1f2937' }}>
                Ji, kal subah 9:30, 10:15 aur 11:00 khali hai. Kaun sa theek rahega?
              </div>
            </div>

            {/* Utterance 3 */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#9ca3af', letterSpacing: '0.05em', marginBottom: '2px' }}>
                CALLER
              </div>
              <div style={{ fontSize: '13px', color: '#1f2937' }}>
                10:15 kar dijiye. Waise abhi seene mein dard ho raha hai thoda.
              </div>
            </div>

            {/* Tool 2 */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              padding: '10px 14px',
              fontFamily: 'ui-monospace, monospace',
              fontSize: '11.5px',
              color: '#0f172a'
            }}>
              <span style={{ color: '#2563eb', fontWeight: '600', marginRight: '8px' }}>TOOL</span>
              <span>escalate_to_human(reason="clinical_urgent", detail="caller reports active chest pain")</span>
            </div>

            {/* Utterance 4 */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#9ca3af', letterSpacing: '0.05em', marginBottom: '2px' }}>
                AGENT
              </div>
              <div style={{ fontSize: '13px', color: '#1f2937' }}>
                Main abhi aapko clinic se connect kar rahi hoon. Agar dard badh raha hai, turant nazdeeki emergency par jaiye.
              </div>
            </div>

            {/* Red Alert Callout */}
            <div style={{
              marginTop: '8px',
              padding: '10px 14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: '4px',
              color: '#b91c1c',
              fontSize: '12px'
            }}>
              Booking flow abandoned. No appointment was created.
            </div>
          </div>
        </div>

        {/* Right Column: Outcome */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid #f3f4f6',
            fontSize: '13px',
            fontWeight: '600',
            color: '#111827'
          }}>
            Outcome
          </div>

          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 18px', color: '#6b7280', fontFamily: 'ui-monospace, monospace' }}>terminal_state</td>
                  <td style={{ padding: '10px 18px', textAlign: 'right', fontWeight: '600', color: '#111827' }}>escalated</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 18px', color: '#6b7280', fontFamily: 'ui-monospace, monospace' }}>escalation_reason</td>
                  <td style={{ padding: '10px 18px', textAlign: 'right', fontWeight: '600', color: '#ef4444' }}>clinical_urgent</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 18px', color: '#6b7280', fontFamily: 'ui-monospace, monospace' }}>patient_id</td>
                  <td style={{ padding: '10px 18px', textAlign: 'right', fontFamily: 'ui-monospace, monospace', color: '#111827' }}>pt_0192</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 18px', color: '#6b7280', fontFamily: 'ui-monospace, monospace' }}>appointment_id</td>
                  <td style={{ padding: '10px 18px', textAlign: 'right', fontFamily: 'ui-monospace, monospace', color: '#9ca3af' }}>null</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 18px', color: '#6b7280', fontFamily: 'ui-monospace, monospace' }}>tool_calls</td>
                  <td style={{ padding: '10px 18px', textAlign: 'right', color: '#111827' }}>2</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 18px', color: '#6b7280', fontFamily: 'ui-monospace, monospace' }}>turns</td>
                  <td style={{ padding: '10px 18px', textAlign: 'right', color: '#111827' }}>6</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 18px', color: '#6b7280', fontFamily: 'ui-monospace, monospace' }}>tokens</td>
                  <td style={{ padding: '10px 18px', textAlign: 'right', color: '#111827' }}>3,140</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 18px', color: '#6b7280', fontFamily: 'ui-monospace, monospace' }}>latency</td>
                  <td style={{ padding: '10px 18px', textAlign: 'right', color: '#111827' }}>4.2 s</td>
                </tr>
              </tbody>
            </table>

            {/* Determinism */}
            <div style={{
              margin: '16px 18px 18px',
              padding: '12px 14px',
              backgroundColor: '#f9fafb',
              borderRadius: '4px',
              border: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '9px', fontWeight: '700', color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  DETERMINISM
                </div>
                <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>
                  Same terminal state across 3 runs.
                </div>
              </div>
              <div style={{
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                fontSize: '10px',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: '3px',
                border: '1px solid #bbf7d0',
                letterSpacing: '0.04em'
              }}>
                STABLE
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
