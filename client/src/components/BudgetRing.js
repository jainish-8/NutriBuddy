import React from 'react';
import { AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

/**
 * BudgetRing - Apple Watch-inspired SVG circular progress ring for meal plan grocery spend vs budget limit.
 */
export default function BudgetRing({
  spent = 1450,
  limit = 2000,
  size = 160,
  strokeWidth = 14,
  label = 'Weekly Grocery Budget'
}) {
  const currentSpent = Math.max(0, Number(spent) || 0);
  const currentLimit = Math.max(1, Number(limit) || 2000);
  const percentage = Math.round((currentSpent / currentLimit) * 100);
  const remaining = currentLimit - currentSpent;

  // Status color scheme
  let ringColor = '#10B981'; // Emerald (< 80%)
  let statusText = 'On Track';
  let StatusIcon = CheckCircle2;
  let statusBg = 'rgba(16, 185, 129, 0.12)';
  let statusBorder = 'rgba(16, 185, 129, 0.3)';

  if (percentage >= 100) {
    ringColor = '#EF4444'; // Red (Over limit)
    statusText = 'Over Budget';
    StatusIcon = AlertTriangle;
    statusBg = 'rgba(239, 68, 68, 0.12)';
    statusBorder = 'rgba(239, 68, 68, 0.3)';
  } else if (percentage >= 80) {
    ringColor = '#F59E0B'; // Amber (Approaching)
    statusText = 'Near Limit';
    StatusIcon = TrendingUp;
    statusBg = 'rgba(245, 158, 11, 0.12)';
    statusBorder = 'rgba(245, 158, 11, 0.3)';
  }

  // SVG Geometry
  const viewBoxSize = 160;
  const center = viewBoxSize / 2;
  const radius = center - strokeWidth / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const progressLength = Math.min(circumference, circumference * (Math.min(100, percentage) / 100));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      padding: '16px 20px',
      background: 'var(--bg-surface-raised, rgba(255, 255, 255, 0.03))',
      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
      borderRadius: 'var(--radius-card, 18px)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <span style={{
          fontSize: 10.5,
          fontWeight: 800,
          letterSpacing: '0.04em',
          color: 'var(--text-muted, #94A3B8)'
        }}>
          {label}
        </span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 8px',
          borderRadius: 9999,
          background: statusBg,
          border: `1px solid ${statusBorder}`,
          color: ringColor,
          fontSize: 10.5,
          fontWeight: 800
        }}>
          <StatusIcon size={11} /> {statusText}
        </div>
      </div>

      <div style={{ position: 'relative', width: size, height: size, margin: '4px 0' }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background Ring Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
          />

          {/* Active Progress Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${progressLength} ${circumference - progressLength}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dasharray 0.6s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease',
              filter: `drop-shadow(0 0 6px ${ringColor}44)`
            }}
          />
        </svg>

        {/* Center Numbers */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <span style={{
            fontSize: 9.5,
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: 'var(--text-muted, #94A3B8)'
          }}>
            Estimated spend
          </span>
          <span className="tabular-nums" style={{
            fontSize: 22,
            fontWeight: 900,
            color: 'var(--text-primary, #FFFFFF)',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.1,
            marginTop: 2
          }}>
            ₹{currentSpent.toLocaleString()}
          </span>
          <span className="tabular-nums" style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--text-muted, #94A3B8)',
            marginTop: 2
          }}>
            of ₹{currentLimit.toLocaleString()} limit
          </span>
        </div>
      </div>

      {/* Footer Metrics */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        paddingTop: 8,
        borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
        fontSize: 11.5
      }}>
        <div style={{ color: 'var(--text-muted)' }}>
          Consumed: <strong className="tabular-nums" style={{ color: 'var(--text-primary)' }}>{percentage}%</strong>
        </div>
        <div style={{ color: 'var(--text-muted)' }}>
          {remaining >= 0 ? (
            <>Remaining: <strong className="tabular-nums" style={{ color: ringColor }}>₹{remaining.toLocaleString()}</strong></>
          ) : (
            <>Exceeded by: <strong className="tabular-nums" style={{ color: '#EF4444' }}>₹{Math.abs(remaining).toLocaleString()}</strong></>
          )}
        </div>
      </div>
    </div>
  );
}
