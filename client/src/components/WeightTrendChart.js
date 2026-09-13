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

  // Helper for smooth bezier curve
  const getSmoothBezierPath = (pts) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      d += ` C ${cpX1.toFixed(1)} ${cpY1.toFixed(1)}, ${cpX2.toFixed(1)} ${cpY2.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }
    return d;
  };

  const pathD = getSmoothBezierPath(points);
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
      background: 'transparent',
      padding: '14px 4px',
      position: 'relative'
    }}>
      {/* Header Stat row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            Weight trend velocity
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
            <span className="tabular-nums" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              {active ? active.weight : currentWeight}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>kg</span>
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
          background: isGoalAligned ? 'rgba(34, 209, 122, 0.12)' : 'rgba(245, 166, 35, 0.12)',
          border: `0.5px solid ${isGoalAligned ? 'rgba(34, 209, 122, 0.3)' : 'rgba(245, 166, 35, 0.3)'}`,
          fontSize: 11,
          fontWeight: 700,
          color: isGoalAligned ? 'var(--color-green)' : 'var(--color-warning)'
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
              <stop offset="0%" stopColor="var(--color-green)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--color-green)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines: horizontal only, 0.5px rgba(255,255,255,0.05) */}
          <line x1={padX} y1={padTop} x2={width - padX} y2={padTop} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <line x1={padX} y1={padTop + innerH / 2} x2={width - padX} y2={padTop + innerH / 2} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <line x1={padX} y1={padTop + innerH} x2={width - padX} y2={padTop + innerH} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

          {/* Target Reference Line */}
          {targetY !== null && (
            <g>
              <line
                x1={padX}
                y1={targetY}
                x2={width - padX}
                y2={targetY}
                stroke="var(--color-warning)"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.7"
              />
              <text
                x={width - padX}
                y={targetY - 4}
                textAnchor="end"
                fontSize="10"
                fontWeight="600"
                fill="var(--color-warning)"
              >
                Target {targetWeight} kg
              </text>
            </g>
          )}

          {/* Fill Area */}
          <path d={areaD} fill="url(#weightGrad)" />

          {/* Main Trend Line: 2px --color-green stroke, smooth bezier */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--color-green)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="weight-line-anim"
          />

          {/* Interactive Data Points: 6px circle, --color-green fill, 2px white stroke. Latest point: 8px circle, pulsing */}
          {points.map((pt, idx) => {
            const isLatest = idx === points.length - 1;
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
                  r={isLatest ? 4 : 3}
                  fill="var(--color-green)"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className={isLatest ? 'pulsing-dot' : ''}
                  style={{
                    transformOrigin: `${pt.x}px ${pt.y}px`,
                    transition: 'all 0.15s ease'
                  }}
                />
                {/* Hit target for touch (min 44x44) */}
                <circle cx={pt.x} cy={pt.y} r={22} fill="transparent" />
              </g>
            );
          })}

          {/* Y Axis min/max labels */}
          <text x={padX - 6} y={padTop + 3} textAnchor="end" fontSize="10" fontWeight="500" fill="var(--text-muted)">
            {maxY}
          </text>
          <text x={padX - 6} y={padTop + innerH} textAnchor="end" fontSize="10" fontWeight="500" fill="var(--text-muted)">
            {minY}
          </text>

          {/* X Axis dates (first and last) */}
          <text x={padX} y={height - 6} textAnchor="start" fontSize="10" fontWeight="500" fill="var(--text-muted)">
            {new Date(displayData[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </text>
          <text x={width - padX} y={height - 6} textAnchor="end" fontSize="10" fontWeight="500" fill="var(--text-muted)">
            {new Date(displayData[displayData.length - 1].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </text>
        </svg>
      </div>
    </div>
  );
}
