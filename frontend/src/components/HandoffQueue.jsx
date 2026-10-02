import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function HandoffQueue({ kpis, onSelectConversation }) {
  const [handoffs, setHandoffs] = useState([]);
  const [resolvedIds, setResolvedIds] = useState(new Set());

  // Fetch live handoffs from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/handoffs`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(h => {
            let reasonColor = { bg: '#fef2f2', text: '#ef4444', border: '#fecaca' };
            if (h.reason === 'NOT AUTHORISED') {
              reasonColor = { bg: '#fff7ed', text: '#f97316', border: '#ffedd5' };
            } else if (h.reason === 'AMBIGUOUS PATIENT') {
              reasonColor = { bg: '#fefce8', text: '#ca8a04', border: '#fef08a' };
            } else if (h.reason === 'MEDICAL ADVICE') {
              reasonColor = { bg: '#faf5ff', text: '#a855f7', border: '#f3e8ff' };
            }
            return {
              ...h,
              reasonColor
            };
          });
          setHandoffs(formatted);
        }
      })
      .catch(err => console.error('Failed to fetch handoffs:', err));
  }, []);

  const handleResolve = async (e, id) => {
    e.stopPropagation();
    try {
      await fetch(`${API_BASE_URL}/api/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handoff_id: id, resolution_notes: 'Resolved by receptionist' })
      });
      setResolvedIds(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    } catch (err) {
      console.error('Resolve failed:', err);
    }
  };

  const openCount = kpis ? kpis.escalated_open - (resolvedIds.size > 0 ? resolvedIds.size : 0) : handoffs.length - resolvedIds.size;

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
          <h1 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '4px',
            letterSpacing: '-0.01em'
          }}>
            Handoff Queue
          </h1>
          <p style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Sunrise Clinic, Dehradun — conversations the agent escalated
          </p>
        </div>

        <div style={{
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          fontSize: '11px',
          fontWeight: '600',
          padding: '3px 8px',
          borderRadius: '4px',
          letterSpacing: '0.04em'
        }}>
          {openCount} OPEN
        </div>
      </div>

      {/* Counters Across Top */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '14px',
        marginBottom: '28px'
      }}>
        {/* Box 1 */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '16px 18px',
          borderRadius: '6px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: '600',
            letterSpacing: '0.05em',
            color: '#9ca3af',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            Conversations
          </div>
          <div style={{ fontSize: '28px', fontWeight: '600', color: '#111827', lineHeight: '1.1' }}>
            37
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
            today
          </div>
        </div>

        {/* Box 2 */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '16px 18px',
          borderRadius: '6px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: '600',
            letterSpacing: '0.05em',
            color: '#9ca3af',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            Completed by Agent
          </div>
          <div style={{ fontSize: '28px', fontWeight: '600', color: '#111827', lineHeight: '1.1' }}>
            31
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
            84%
          </div>
        </div>

        {/* Box 3 */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '16px 18px',
          borderRadius: '6px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: '600',
            letterSpacing: '0.05em',
            color: '#9ca3af',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            Escalated
          </div>
          <div style={{ fontSize: '28px', fontWeight: '600', color: '#111827', lineHeight: '1.1' }}>
            6
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
            {openCount} still open
          </div>
        </div>

        {/* Box 4 */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '16px 18px',
          borderRadius: '6px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: '600',
            letterSpacing: '0.05em',
            color: '#9ca3af',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            Urgent
          </div>
          <div style={{ fontSize: '28px', fontWeight: '600', color: '#111827', lineHeight: '1.1' }}>
            1
          </div>
          <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '6px' }}>
            clinical, unresolved
          </div>
        </div>
      </div>

      {/* Open Handoffs Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f3f4f6',
          fontSize: '13px',
          fontWeight: '600',
          color: '#111827'
        }}>
          Open handoffs
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{
              borderBottom: '1px solid #e5e7eb',
              fontSize: '10px',
              fontWeight: '600',
              letterSpacing: '0.06em',
              color: '#9ca3af',
              textTransform: 'uppercase'
            }}>
              <th style={{ padding: '10px 20px', width: '150px' }}>Conversation</th>
              <th style={{ padding: '10px 20px' }}>Caller Said</th>
              <th style={{ padding: '10px 20px', width: '170px' }}>Reason</th>
              <th style={{ padding: '10px 20px', width: '80px' }}>Time</th>
              <th style={{ padding: '10px 20px', width: '90px' }}></th>
            </tr>
          </thead>
          <tbody>
            {handoffs.map((row) => {
              const isResolved = resolvedIds.has(row.id);

              return (
                <tr
                  key={row.id}
                  onClick={() => onSelectConversation(row.id)}
                  style={{
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                    color: '#1f2937',
                    opacity: isResolved ? 0.4 : 1,
                    transition: 'background-color 0.1s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{
                    padding: '14px 20px',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '12px',
                    color: '#2563eb'
                  }}>
                    {row.id}
                  </td>

                  <td style={{ padding: '14px 20px' }}>
                    {row.caller_said}
                  </td>

                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '10px',
                      fontWeight: '600',
                      letterSpacing: '0.04em',
                      padding: '2px 7px',
                      borderRadius: '3px',
                      backgroundColor: row.reasonColor.bg,
                      color: row.reasonColor.text,
                      border: `1px solid ${row.reasonColor.border}`
                    }}>
                      {row.reason}
                    </span>
                  </td>

                  <td style={{ padding: '14px 20px', color: '#6b7280' }}>
                    {row.time}
                  </td>

                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button
                      onClick={(e) => handleResolve(e, row.id)}
                      style={{
                        padding: '4px 12px',
                        fontSize: '11px',
                        fontWeight: '500',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: isResolved ? '#e5e7eb' : '#2563eb',
                        color: isResolved ? '#6b7280' : '#ffffff',
                        cursor: 'pointer'
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
