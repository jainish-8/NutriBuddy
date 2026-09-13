import React, { useState } from 'react';
import { TrendingUp, Trophy } from 'lucide-react';

/**
 * StrengthTrendChart - Pure SVG line chart with area gradient fill for Strength & PR progression.
 */
export default function StrengthTrendChart({
  history = [],
  exerciseName = 'Barbell Bench Press',
  currentPr = 85,
  unit = 'kg'
}) {
  const [activePoint, setActivePoint] = useState(null);

  // Fallback illustrative progression if user has few logs
  let chartData = history;
  if (!chartData || chartData.length < 2) {
    const base = Math.max(20, Math.round(currentPr * 0.85));
    const step1 = Math.round(currentPr * 0.90);
    const step2 = Math.round(currentPr * 0.95);
    const now = new Date();
    const d1 = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    const d2 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const d3 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    chartData = [
      { date: d1.toISOString().split('T')[0], weight: base, reps: 5, label: 'Base' },
      { date: d2.toISOString().split('T')[0], weight: step1, reps: 5, label: 'Overload 1' },
      { date: d3.toISOString().split('T')[0], weight: step2, reps: 5, label: 'Overload 2' },
      { date: now.toISOString().split('T')[0], weight: currentPr, reps: 5, label: 'Current PR' }
    ];
  }

  const weights = chartData.map(d => d.weight);
  const minWeight = Math.floor(Math.min(...weights) * 0.92);
  const maxWeight = Math.ceil(Math.max(...weights) * 1.06);
  const range = maxWeight - minWeight || 1;

  // SVG Coordinates
  const width = 360;
  const height = 160;
  const paddingX = 32;
  const paddingTop = 20;
  const paddingBottom = 30;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingTop - paddingBottom;

  const points = chartData.map((d, index) => {
    const x = paddingX + (index / (chartData.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((d.weight - minWeight) / range) * innerHeight;
    return { ...d, x, y };
  });

  // SVG Path strings
  const pathD = points.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(paddingTop + innerHeight).toFixed(1)} L ${points[0].x.toFixed(1)} ${(paddingTop + innerHeight).toFixed(1)} Z`;

  const totalGain = weights[weights.length - 1] - weights[0];

  return (
    <div className="nb-card" style={{
      background: 'var(--color-card, #141820)',
      border: '0.5px solid var(--border-default, rgba(255, 255, 255, 0.07))',
      borderRadius: 20,
      padding: '18px 20px',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Trophy size={14} color="var(--color-green, #22D17A)" />
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--color-green, #22D17A)'
            }}>
              Strength overload trend
            </span>
          </div>
          <h4 style={{
            margin: '2px 0 0',
            fontSize: 16,
            fontWeight: 800,
            color: 'var(--text-primary, #FFFFFF)',
            fontFamily: 'var(--font-heading)'
          }}>
            {exerciseName}
          </h4>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div className="tabular-nums" style={{
            fontSize: 18,
            fontWeight: 900,
            color: 'var(--text-primary, #FFFFFF)'
          }}>
            {currentPr} {unit}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            fontSize: 11,
            fontWeight: 700,
            color: totalGain >= 0 ? 'var(--color-green, #22D17A)' : '#EF4444',
            justifyContent: 'flex-end'
          }}>
            <TrendingUp size={11} />
            <span className="tabular-nums">+{totalGain} {unit}</span>
          </div>
        </div>
      </div>

      {/* SVG Line Graph */}
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id={`strengthGrad-${exerciseName.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22D17A" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#22D17A" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid guidelines */}
          {[0, 0.5, 1].map(frac => {
            const y = paddingTop + innerHeight * frac;
            const wVal = Math.round(maxWeight - frac * range);
            return (
              <g key={frac}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  fill="var(--text-muted, #94A3B8)"
                  fontSize="9.5"
                  fontWeight="700"
                  textAnchor="end"
                  className="tabular-nums"
                >
                  {wVal}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path
            d={areaD}
            fill={`url(#strengthGrad-${exerciseName.replace(/\s+/g, '')})`}
          />

          {/* Trend Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--color-green, #22D17A)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(34, 209, 122, 0.3))' }}
          />

          {/* Data Points */}
          {points.map((pt, pIdx) => {
            const isHovered = activePoint === pIdx;
            return (
              <g key={pIdx} style={{ cursor: 'pointer' }} onClick={() => setActivePoint(pIdx)}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#FFFFFF' : 'var(--color-green, #22D17A)'}
                  stroke="var(--color-card, #141820)"
                  strokeWidth={2}
                  style={{ transition: 'all 0.15s ease' }}
                />
                {/* Date Label on X-axis */}
                <text
                  x={pt.x}
                  y={height - 8}
                  fill="var(--text-secondary, rgba(255, 255, 255, 0.55))"
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {pt.date ? pt.date.slice(5) : `S${pIdx + 1}`}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip if point selected */}
        {activePoint !== null && points[activePoint] && (
          <div style={{
            position: 'absolute',
            top: Math.max(4, points[activePoint].y * (160 / height) - 40),
            left: Math.min(width - 90, Math.max(10, points[activePoint].x * (width / 360) - 40)),
            background: 'rgba(20, 24, 32, 0.95)',
            border: '1px solid rgba(34, 209, 122, 0.3)',
            borderRadius: 8,
            padding: '4px 8px',
            fontSize: 11,
            color: '#FFFFFF',
            pointerEvents: 'none',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap',
            zIndex: 10
          }}>
            <span className="tabular-nums" style={{ fontWeight: 800, color: 'var(--color-green, #22D17A)' }}>
              {points[activePoint].weight} {unit}
            </span>
            {points[activePoint].reps && <span> × {points[activePoint].reps} reps</span>}
          </div>
        )}
      </div>
    </div>
  );
}
