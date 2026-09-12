import React, { useState } from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

/**
 * WeightTrendChart - Pure SVG responsive line chart for bodyweight progression.
 * Includes gradient area fill, interactive data points, and target reference line.
 */
export default function WeightTrendChart({
  logs = [],
  targetWeight = null,
  goal = 'lose'
}) {
  const [activePoint, setActivePoint] = useState(null);

  if (!logs || logs.length === 0) {
    return (
      <div style={{
        padding: '28px 16px',
        textAlign: 'center',
        background: 'var(--bg-surface-raised, #161A22)',
        borderRadius: 'var(--radius-panel, 14px)',
        border: '1px dashed var(--border-subtle, #30363D)',
        color: 'var(--text-muted, #8B949E)',
        fontSize: 12
      }}>
        No weight entries recorded yet. Log your first weigh-in below to start tracking your trend.
      </div>
    );
  }

  // Sort logs chronologically
  const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));

  // If only 1 entry, show friendly single-point display
  if (sorted.length === 1) {
    const pt = sorted[0];
    return (
      <div style={{
        padding: '24px 18px',
        background: 'var(--bg-surface-raised, #161A22)',
        borderRadius: 'var(--radius-panel, 14px)',
        border: '1px solid var(--border-subtle, #30363D)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted, #8B949E)', textTransform: 'uppercase', fontWeight: 700 }}>
          First Weigh-in Recorded
        </div>
        <div className="tabular-nums" style={{ fontSize: 28, fontWeight: 900, color: 'var(--brand-primary-light, #10B981)', margin: '6px 0' }}>
          {pt.weight} <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>kg</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #C9D1D9)' }}>
          {new Date(pt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '8px 0 0' }}>
          Add your next weigh-in to generate your multi-week velocity curve.
        </p>
      </div>
    );
  }

  // Slice to last 14 entries for clean mobile visualization
  const displayData = sorted.slice(-14);
  const weights = displayData.map(d => d.weight);
  if (targetWeight) weights.push(targetWeight);

  const rawMin = Math.min(...weights);
  const rawMax = Math.max(...weights);
  const paddingY = Math.max(1, (rawMax - rawMin) * 0.18);
  const minY = +(rawMin - paddingY).toFixed(1);
  const maxY = +(rawMax + paddingY).toFixed(1);
  const rangeY = maxY - minY || 1;

  // Chart dimensions
  const width = 360;
  const height = 140;
  const padX = 28;
  const padTop = 22;
  const padBottom = 26;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;

  const points = displayData.map((d, idx) => {
    const x = padX + (idx / (displayData.length - 1)) * innerW;
    const y = padTop + innerH - ((d.weight - minY) / rangeY) * innerH;
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(padTop + innerH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`;

  // Target line Y
  let targetY = null;
  if (targetWeight && targetWeight >= minY && targetWeight <= maxY) {
    targetY = padTop + innerH - ((targetWeight - minY) / rangeY) * innerH;
  }

  // Delta calculation
  const startWeight = displayData[0].weight;
  const currentWeight = displayData[displayData.length - 1].weight;
  const delta = +(currentWeight - startWeight).toFixed(1);
  const isLoss = delta < 0;
  const isGoalAligned = (goal === 'lose' || goal === 'fat_loss') ? isLoss : (goal === 'gain' || goal === 'lean_bulk') ? delta > 0 : Math.abs(delta) <= 1;

  const active = activePoint !== null ? points[activePoint] : points[points.length - 1];

  return (
    <div style={{
      background: 'var(--bg-surface-raised, #161A22)',
      borderRadius: 'var(--radius-panel, 14px)',
      border: '1px solid var(--border-subtle, #30363D)',
      padding: '14px 16px',
      position: 'relative'
    }}>
      {/* Header Stat row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            WEIGHT TREND VELOCITY
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
            <span className="tabular-nums" style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>
              {active ? active.weight : currentWeight}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>kg</span>
            {active && (
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 4 }}>
                • {new Date(active.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Delta badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 10px',
          borderRadius: 20,
          background: isGoalAligned ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${isGoalAligned ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          fontSize: 11,
          fontWeight: 800,
          color: isGoalAligned ? 'var(--brand-primary-light, #10B981)' : '#EF4444'
        }}>
          {delta < 0 ? <TrendingDown size={13} /> : delta > 0 ? <TrendingUp size={13} /> : <Minus size={13} />}
          <span className="tabular-nums">{delta > 0 ? `+${delta}` : delta} kg</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{ width: '100%', position: 'relative' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand-primary-light, #10B981)" stopOpacity="0.28" />
              <stop offset="85%" stopColor="var(--brand-primary-light, #10B981)" stopOpacity="0.02" />
              <stop offset="100%" stopColor="var(--brand-primary-light, #10B981)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="weightLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent-protein-text, #818CF8)" />
              <stop offset="100%" stopColor="var(--brand-primary-light, #10B981)" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padX} y1={padTop} x2={width - padX} y2={padTop} stroke="var(--border-subtle, #30363D)" strokeDasharray="3 3" opacity="0.5" />
          <line x1={padX} y1={padTop + innerH / 2} x2={width - padX} y2={padTop + innerH / 2} stroke="var(--border-subtle, #30363D)" strokeDasharray="3 3" opacity="0.4" />
          <line x1={padX} y1={padTop + innerH} x2={width - padX} y2={padTop + innerH} stroke="var(--border-subtle, #30363D)" strokeDasharray="3 3" opacity="0.5" />

          {/* Target Reference Line */}
          {targetY !== null && (
            <g>
              <line
                x1={padX}
                y1={targetY}
                x2={width - padX}
                y2={targetY}
                stroke="#F59E0B"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.8"
              />
              <text
                x={width - padX}
                y={targetY - 4}
                textAnchor="end"
                fontSize="9"
                fontWeight="700"
                fill="#F59E0B"
              >
                Target {targetWeight} kg
              </text>
            </g>
          )}

          {/* Fill Area */}
          <path d={areaD} fill="url(#weightGrad)" />

          {/* Main Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#weightLineGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points */}
          {points.map((pt, idx) => {
            const isSelected = activePoint === idx || (activePoint === null && idx === points.length - 1);
            return (
              <g
                key={idx}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setActivePoint(idx)}
                onClick={() => setActivePoint(idx)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 6 : 3.5}
                  fill={isSelected ? '#FFFFFF' : 'var(--brand-primary-light, #10B981)'}
                  stroke={isSelected ? 'var(--brand-primary-light, #10B981)' : 'var(--bg-surface-raised, #161A22)'}
                  strokeWidth={isSelected ? 3 : 2}
                  style={{ transition: 'all 0.15s ease' }}
                />
                {/* Hit target for touch */}
                <circle cx={pt.x} cy={pt.y} r={14} fill="transparent" />
              </g>
            );
          })}

          {/* Y Axis min/max labels */}
          <text x={padX - 4} y={padTop + 4} textAnchor="end" fontSize="9" fontWeight="600" fill="var(--text-muted)">
            {maxY}
          </text>
          <text x={padX - 4} y={padTop + innerH} textAnchor="end" fontSize="9" fontWeight="600" fill="var(--text-muted)">
            {minY}
          </text>

          {/* X Axis dates (first and last) */}
          <text x={padX} y={height - 6} textAnchor="start" fontSize="9" fontWeight="600" fill="var(--text-muted)">
            {new Date(displayData[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </text>
          <text x={width - padX} y={height - 6} textAnchor="end" fontSize="9" fontWeight="600" fill="var(--text-muted)">
            {new Date(displayData[displayData.length - 1].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </text>
        </svg>
      </div>
    </div>
  );
}
