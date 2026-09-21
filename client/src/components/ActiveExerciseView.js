import React, { useState } from 'react';
import { Check, Plus, Minus, Calculator, Repeat } from 'lucide-react';
import './ActiveExerciseView.css';

export const ActiveExerciseView = ({
  exerciseName = "Barbell Back Squat",
  category = "Compound",
  targetMuscles = "Full Body",
  sets = [],
  onUpdateSet,
  onToggleComplete,
  onAddSet,
  onRemoveSet,
  onOpenDrawer,
  onOpenRpe,
  onSwapExercise,
  onAddExercise,
  showRpe = true,
}) => {
  const [flashingIdx, setFlashingIdx] = useState(null);

  const handleCheck = (idx) => {
    if (!sets[idx]?.completed) {
      setFlashingIdx(idx);
      setTimeout(() => setFlashingIdx(null), 400);
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(15);
        }
      } catch {}
    }
    onToggleComplete(idx);
  };
  return (
    <div className="w-full max-w-md mx-auto overflow-x-hidden px-1 sm:px-2 py-2 flex flex-col gap-3" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
      {/* 1. EXERCISE HEADER & UTILITIES */}
      <div 
        className="nb-card"
        style={{
          borderRadius: 20,
          padding: '16px 18px',
          background: 'var(--s1)',
          border: '0.5px solid var(--bd)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}>
            {exerciseName}
          </h2>
          <span style={{
            background: 'var(--gd)',
            border: '0.5px solid var(--gb)',
            color: 'var(--g)',
            borderRadius: 8,
            padding: '3px 10px',
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "'Inter', sans-serif",
            flexShrink: 0
          }}>
            {category}
          </span>
        </div>

        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--cyan)', margin: '0 0 12px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Inter', sans-serif" }}>
          Target: {targetMuscles}
        </p>

        {/* Scrollable Utility Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 2 }} className="no-scrollbar">
          <button
            type="button"
            onClick={() => onOpenDrawer && onOpenDrawer('warmup')}
            className="active:scale-95 transition"
            style={{
              height: 32,
              padding: '0 12px',
              fontSize: 11.5,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              flexShrink: 0,
              background: 'var(--s2)',
              border: '0.5px solid var(--bd)',
              color: 'var(--t1)',
              borderRadius: 10,
              fontFamily: "'Inter', sans-serif"
            }}
          >
            <Calculator color="var(--g)" size={13} />
            <span>Warm-up</span>
          </button>
          <button
            type="button"
            onClick={() => (onSwapExercise ? onSwapExercise() : onOpenDrawer && onOpenDrawer('swap'))}
            className="active:scale-95 transition"
            style={{
              height: 32,
              padding: '0 12px',
              fontSize: 11.5,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              flexShrink: 0,
              background: 'var(--s2)',
              border: '0.5px solid var(--bd)',
              color: 'var(--t1)',
              borderRadius: 10,
              fontFamily: "'Inter', sans-serif"
            }}
          >
            <Repeat color="var(--g)" size={13} />
            <span>Swap exercise</span>
          </button>
          <button
            type="button"
            onClick={() => (onAddExercise ? onAddExercise() : onOpenDrawer && onOpenDrawer('search'))}
            className="active:scale-95 transition"
            style={{
              height: 32,
              padding: '0 12px',
              fontSize: 11.5,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              flexShrink: 0,
              background: 'var(--s2)',
              border: '0.5px solid var(--bd)',
              color: 'var(--t1)',
              borderRadius: 10,
              fontFamily: "'Inter', sans-serif"
            }}
          >
            <Plus color="var(--g)" size={13} />
            <span>Add exercise</span>
          </button>
        </div>
      </div>

      {/* 2. MOBILE SET MATRIX (ZERO-OVERFLOW CSS GRID) */}
      <div 
        className="nb-card"
        style={{
          borderRadius: 20,
          padding: '16px 18px',
          overflow: 'hidden',
          background: 'var(--s1)',
          border: '0.5px solid var(--bd)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
        }}
      >
        {/* Table Header: Exactly 5 columns mapped to 100% of the screen */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '28px minmax(0, 1fr) 62px 52px 36px',
            gap: 6,
            paddingBottom: 8,
            borderBottom: '0.5px solid var(--bd)',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--t3)',
            alignItems: 'center',
            fontFamily: "'Inter', sans-serif"
          }}
        >
          <span style={{ textAlign: 'center' }}>Set</span>
          <span style={{ paddingLeft: 4 }}>Prev</span>
          <span style={{ textAlign: 'center' }}>KG</span>
          <span style={{ textAlign: 'center' }}>Reps</span>
          <span style={{ textAlign: 'center' }}>Done</span>
        </div>

        {/* Set Rows */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {sets.map((set, idx) => (
            <div
              key={set.id || idx}
              className={set.completed ? 'set-row-completed' : ''}
              style={{
                display: 'grid',
                gridTemplateColumns: '28px minmax(0, 1fr) 62px 52px 36px',
                gap: 6,
                alignItems: 'center',
                paddingTop: 8,
                paddingBottom: 8,
                borderBottom: '0.5px solid var(--bd2)',
                backgroundColor: flashingIdx === idx ? 'rgba(34, 209, 122, 0.08)' : set.completed ? 'rgba(34, 209, 122, 0.04)' : 'transparent',
                borderRadius: 8,
                transition: 'background-color 0.4s ease'
              }}
            >
              {/* Col 1: Set Number */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: set.completed ? 'var(--g)' : 'var(--t3)', fontFamily: "'JetBrains Mono', monospace" }}>
                  {idx + 1}
                </span>
              </div>

              {/* Col 2: Previous Target & RPE Tag */}
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', paddingLeft: 4 }}>
                <span style={{ fontSize: 11.5, color: 'var(--t3)', fontFamily: "'JetBrains Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                  {set.prev || '—'}
                </span>
                {showRpe && (
                  <button
                    type="button"
                    onClick={() => onOpenRpe && onOpenRpe(idx)}
                    style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: 'var(--g)', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    @{set.rpe || 8} RPE
                  </button>
                )}
              </div>

              {/* Col 3: Weight (Kg) Input */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input
                  type="number"
                  step="0.5"
                  inputMode="decimal"
                  value={set.weight ?? ''}
                  onChange={(e) => onUpdateSet(idx, 'weight', e.target.value)}
                  placeholder="0.0"
                  style={{
                    width: '100%',
                    minWidth: 48,
                    maxWidth: 62,
                    height: 34,
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    backgroundColor: set.completed ? 'rgba(34, 209, 122, 0.06)' : 'var(--s2)',
                    border: '0.5px solid var(--bd)',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--t1)',
                    outline: 'none',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}
                />
              </div>

              {/* Col 4: Reps Input */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input
                  type="number"
                  inputMode="numeric"
                  value={set.reps ?? ''}
                  onChange={(e) => onUpdateSet(idx, 'reps', e.target.value)}
                  placeholder="0"
                  style={{
                    width: '100%',
                    minWidth: 48,
                    maxWidth: 52,
                    height: 34,
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    backgroundColor: set.completed ? 'rgba(34, 209, 122, 0.06)' : 'var(--s2)',
                    border: '0.5px solid var(--bd)',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--t1)',
                    outline: 'none',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}
                />
              </div>

              {/* Col 5: Done Checkmark Button */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleCheck(idx)}
                  style={{
                    height: 30,
                    width: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    borderRadius: 8,
                    backgroundColor: set.completed ? 'var(--g)' : 'var(--gd)',
                    color: set.completed ? '#041a0c' : 'var(--g)',
                    border: set.completed ? '1px solid var(--g)' : '1px solid var(--gb)',
                    boxShadow: set.completed ? '0 0 14px rgba(34, 209, 122, 0.4)' : 'none',
                    transition: 'all 0.15s ease',
                    padding: 0
                  }}
                  className={`active:scale-90 ${set.completed ? 'checkmark-scale' : ''}`}
                  aria-label={set.completed ? `Set ${idx + 1} complete, tap to undo` : `Mark set ${idx + 1} done`}
                >
                  <Check size={16} strokeWidth={set.completed ? 3.5 : 2.5} color={set.completed ? '#041a0c' : 'var(--g)'} className={set.completed ? 'anim-scale-in' : ''} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons: Add Set & Remove Set */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '0.5px solid var(--bd)' }}>
          <button
            type="button"
            onClick={onAddSet}
            style={{
              flex: 1,
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
              borderRadius: 10,
              backgroundColor: 'var(--s2)',
              border: '0.5px dashed var(--bd)',
              color: 'var(--t1)',
              fontSize: 12.5,
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif"
            }}
            className="active:scale-95 transition"
          >
            <Plus size={14} style={{ color: 'var(--g)' }} /> Add set
          </button>
          <button
            type="button"
            onClick={onRemoveSet}
            style={{
              height: 38,
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: 10,
              backgroundColor: 'rgba(245, 91, 91, 0.08)',
              border: '0.5px dashed rgba(245, 91, 91, 0.25)',
              color: 'var(--red)'
            }}
            className="active:scale-95 transition"
            title="Remove Last Set"
            aria-label="Remove Last Set"
          >
            <Minus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveExerciseView;
