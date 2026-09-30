import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

export default function HandoffQueue({ onSelectConversation }) {
  const [handoffs, setHandoffs] = useState([
    {
      id: 'cv_4471',
      caller_said: '"Seene mein dard ho raha hai"',
      reason: 'CLINICAL',
      reasonType: 'clinical',
      time: '11:42',
      status: 'open'
    },
    {
      id: 'cv_4468',
      caller_said: 'Cancel for a different patient',
      reason: 'NOT AUTHORISED',
      reasonType: 'auth',
      time: '11:20',
      status: 'open'
    },
    {
      id: 'cv_4463',
      caller_said: '"Sharma ji ke liye" — 3 matches',
      reason: 'AMBIGUOUS PATIENT',
      reasonType: 'ambiguous',
      time: '10:57',
      status: 'open'
    },
    {
      id: 'cv_4455',
      caller_said: '"Ye dawai lun ya nahi?"',
      reason: 'MEDICAL ADVICE',
      reasonType: 'advice',
      time: '10:18',
      status: 'open'
    }
  ]);

  const [resolvedIds, setResolvedIds] = useState(new Set());

  const handleResolve = (e, id) => {
    e.stopPropagation();
    setResolvedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'clinical':
        return { backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' };
      case 'auth':
        return { backgroundColor: '#ffedd5', color: '#ea580c', border: '1px solid #fed7aa' };
      case 'ambiguous':
        return { backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' };
      case 'advice':
        return { backgroundColor: '#f3e8ff', color: '#9333ea', border: '1px solid #e9d5ff' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb' };
    }
  };

  const activeCount = handoffs.length - resolvedIds.size;

  return (
    <div className="animate-fade" style={{ maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
      {/* Top Header */}
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
            Handoff Queue
          </h1>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            Sunrise Clinic, Dehradun — conversations the agent escalated
          </p>
        </div>

        <div style={{
          backgroundColor: '#eff6ff',
          color: '#1d4ed8',
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '0.04em',
          padding: '4px 10px',
          borderRadius: '999px',
          border: '1px solid #dbeafe',
          textTransform: 'uppercase'
        }}>
          {activeCount} OPEN
        </div>
      </div>

      {/* KPI Counters Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* Card 1 */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '20px 22px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.06em',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            Conversations
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              37
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>today</span>
          </div>
        </div>

        {/* Card 2 */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '20px 22px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.06em',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            Completed by Agent
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              31
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>84%</span>
          </div>
        </div>

        {/* Card 3 */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '20px 22px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.06em',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            Escalated
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              6
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{activeCount} still open</span>
          </div>
        </div>

        {/* Card 4 - Urgent */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '20px 22px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.06em',
            color: '#dc2626',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            Urgent
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-0.03em', color: '#dc2626' }}>
              1
            </span>
            <span style={{ fontSize: '13px', color: '#dc2626' }}>clinical, unresolved</span>
          </div>
        </div>
      </div>

      {/* Open Handoffs Table Card */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-card)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            Open handoffs
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            Click any row to inspect conversation trace
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{
              backgroundColor: '#fafbfc',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.06em',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase'
            }}>
              <th style={{ padding: '12px 24px', width: '160px' }}>Conversation</th>
              <th style={{ padding: '12px 24px' }}>Caller Said</th>
              <th style={{ padding: '12px 24px', width: '180px' }}>Reason</th>
              <th style={{ padding: '12px 24px', width: '90px' }}>Time</th>
              <th style={{ padding: '12px 24px', width: '110px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {handoffs.map((row) => {
              const isResolved = resolvedIds.has(row.id);
              const badgeStyle = getBadgeStyle(row.reasonType);

              return (
                <tr
                  key={row.id}
                  onClick={() => onSelectConversation(row.id)}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'background-color 0.12s ease',
                    opacity: isResolved ? 0.45 : 1,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td style={{
                    padding: '16px 24px',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--apple-blue)'
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {row.id}
                      <ArrowUpRight size={13} opacity={0.6} />
                    </span>
                  </td>

                  <td style={{
                    padding: '16px 24px',
                    fontSize: '13px',
                    color: 'var(--text-primary)'
                  }}>
                    {row.caller_said}
                  </td>

                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '11px',
                      fontWeight: '600',
                      letterSpacing: '0.04em',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      ...badgeStyle
                    }}>
                      {row.reason}
                    </span>
                  </td>

                  <td style={{
                    padding: '16px 24px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)'
                  }}>
                    {row.time}
                  </td>

                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button
                      onClick={(e) => handleResolve(e, row.id)}
                      style={{
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: '500',
                        borderRadius: 'var(--radius-sm)',
                        border: isResolved ? '1px solid #10b981' : '1px solid #0071e3',
                        backgroundColor: isResolved ? '#ecfdf5' : '#0071e3',
                        color: isResolved ? '#059669' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isResolved ? 'none' : '0 1px 2px rgba(0, 113, 227, 0.2)'
                      }}
                    >
                      {isResolved ? 'Resolved' : 'Resolve'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
