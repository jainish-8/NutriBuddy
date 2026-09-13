import React from 'react';

/**
 * MacroDonutChart - Elegant, responsive SVG donut chart for Macronutrient Distribution.
 * Visualizes the ratio of Protein (Indigo), Carbs (Emerald), and Fats (Rose).
 */
export default function MacroDonutChart({
  calories = 2000,
  protein = 150,
  carbs = 200,
  fat = 65,
  size = 170,
  strokeWidth = 14,
  showLegend = true,
  centerLabel = 'Daily target'
}) {
  // Caloric calculations (Protein 4 kcal/g, Carbs 4 kcal/g, Fat 9 kcal/g)
  const pCal = Math.max(0, Number(protein) || 0) * 4;
  const cCal = Math.max(0, Number(carbs) || 0) * 4;
  const fCal = Math.max(0, Number(fat) || 0) * 9;
  const totalMacroCal = pCal + cCal + fCal || 1;

  const pRatio = pCal / totalMacroCal;
  const cRatio = cCal / totalMacroCal;
  const fRatio = fCal / totalMacroCal;

  const pPct = Math.round(pRatio * 100);
  const cPct = Math.round(cRatio * 100);
  const fPct = Math.max(0, 100 - (pPct + cPct));

  // SVG Geometry
  const viewBoxSize = 160;
  const center = viewBoxSize / 2;
  const radius = center - strokeWidth / 2 - 4;
  const circumference = 2 * Math.PI * radius;

  // Arc lengths & offsets (Starts at -90deg, 12 o'clock)
  const pLength = circumference * pRatio;
  const cLength = circumference * cRatio;
  const fLength = circumference * fRatio;

  // Gap between segments for sleek modern aesthetic
  const gap = 3;
  const adjPLength = Math.max(0, pLength - gap);
  const adjCLength = Math.max(0, cLength - gap);
  const adjFLength = Math.max(0, fLength - gap);

  const pOffset = 0;
  const cOffset = -pLength;
  const fOffset = -(pLength + cLength);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />

          {/* Protein Arc (Blue) */}
          {pLength > 0 && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="var(--color-protein, #5B8AF5)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${adjPLength} ${circumference - adjPLength}`}
              strokeDashoffset={pOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          )}

          {/* Carbs Arc (Green) */}
          {cLength > 0 && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="var(--color-carb, #22D17A)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${adjCLength} ${circumference - adjCLength}`}
              strokeDashoffset={cOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          )}

          {/* Fat Arc (Amber - Never Red) */}
          {fLength > 0 && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="var(--color-fat, #F5A623)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${adjFLength} ${circumference - adjFLength}`}
              strokeDashoffset={fOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          )}
        </svg>

        {/* Center Label (Calories) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          textAlign: 'center'
        }}>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: 'var(--text-secondary, rgba(255, 255, 255, 0.55))'
          }}>
            {centerLabel}
          </span>
          <span className="tabular-nums" style={{
            fontSize: 24,
            fontWeight: 800,
            color: 'var(--text-primary, rgba(255, 255, 255, 0.92))',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginTop: 2
          }}>
            {Math.round(calories).toLocaleString()}
          </span>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--color-green, #22D17A)',
            letterSpacing: '0.02em'
          }}>
            kcal
          </span>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 12,
          width: '100%',
          maxWidth: 320
        }}>
          {/* Protein */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-protein, #5B8AF5)' }} />
            <span style={{ fontWeight: 500, color: 'var(--text-secondary, rgba(255, 255, 255, 0.55))' }}>Protein:</span>
            <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--color-protein, #5B8AF5)' }}>
              {Math.round(protein)}g ({pPct}%)
            </span>
          </div>

          {/* Carbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-carb, #22D17A)' }} />
            <span style={{ fontWeight: 500, color: 'var(--text-secondary, rgba(255, 255, 255, 0.55))' }}>Carbs:</span>
            <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--color-carb, #22D17A)' }}>
              {Math.round(carbs)}g ({cPct}%)
            </span>
          </div>

          {/* Fat */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-fat, #F5A623)' }} />
            <span style={{ fontWeight: 500, color: 'var(--text-secondary, rgba(255, 255, 255, 0.55))' }}>Fat:</span>
            <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--color-fat, #F5A623)' }}>
              {Math.round(fat)}g ({fPct}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
