import React from 'react';
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
  return (
    <div className="w-full max-w-md mx-auto overflow-x-hidden px-1 sm:px-2 py-2 flex flex-col gap-3" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* 1. EXERCISE HEADER & UTILITIES */}
      <div 
        className="nb-card"
        style={{
          borderRadius: 20,
          padding: '16px 18px'
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {exerciseName}
          </h2>
          <span className="nb-tag nb-tag-neutral" style={{ flexShrink: 0 }}>
            {category}
          </span>
        </div>

        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', margin: '0 0 12px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Target: {targetMuscles}
        </p>

        {/* Scrollable Utility Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 2 }} className="no-scrollbar">
          <button
            type="button"
            onClick={() => onOpenDrawer && onOpenDrawer('warmup')}
            className="nb-btn-secondary active:scale-95 transition"
            style={{
              height: 32,
              padding: '0 12px',
              fontSize: 12,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <Calculator color="var(--color-green)" size={13} />
            <span>Warm-up</span>
          </button>
          <button
            type="button"
            onClick={() => (onSwapExercise ? onSwapExercise() : onOpenDrawer && onOpenDrawer('swap'))}
            className="nb-btn-secondary active:scale-95 transition"
            style={{
              height: 32,
              padding: '0 12px',
              fontSize: 12,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <Repeat color="var(--color-green)" size={13} />
            <span>Swap exercise</span>
          </button>
          <button
            type="button"
            onClick={() => (onAddExercise ? onAddExercise() : onOpenDrawer && onOpenDrawer('search'))}
            className="nb-btn-secondary active:scale-95 transition"
            style={{
              height: 32,
              padding: '0 12px',
              fontSize: 12,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <Plus color="var(--color-green)" size={13} />
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
          overflow: 'hidden'
        }}
      >
        {/* Table Header: Exactly 5 columns mapped to 100% of the screen */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '28px minmax(0, 1fr) 62px 52px 36px',
            gap: 6,
            paddingBottom: 8,
            borderBottom: '0.5px solid var(--border-default)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            alignItems: 'center'
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
                borderBottom: '0.5px solid var(--border-subtle)',
                backgroundColor: set.completed ? 'rgba(34, 209, 122, 0.06)' : 'transparent',
                borderRadius: set.completed ? 8 : 0,
                transition: 'background-color 0.2s ease'
              }}
            >
              {/* Col 1: Set Number */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: set.completed ? 'var(--color-green)' : 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
                  {idx + 1}
                </span>
              </div>

              {/* Col 2: Previous Target & RPE Tag */}
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', paddingLeft: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-mono, monospace)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                  {set.prev || '—'}
                </span>
                {showRpe && (
                  <button
                    type="button"
                    onClick={() => onOpenRpe && onOpenRpe(idx)}
                    style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: 'var(--color-green)', marginTop: 2 }}
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
                    height: 36,
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border-default)',
                    borderRadius: 0,
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontFamily: 'var(--font-mono, monospace)'
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
                    height: 36,
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border-default)',
                    borderRadius: 0,
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontFamily: 'var(--font-mono, monospace)'
                  }}
                />
              </div>

              {/* Col 5: Done Checkmark Button */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => onToggleComplete(idx)}
                  style={{
                    height: 28,
                    width: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    borderRadius: 8,
                    backgroundColor: set.completed ? 'var(--color-green)' : 'transparent',
                    color: set.completed ? '#ffffff' : 'var(--text-muted)',
                    border: set.completed ? 'none' : '1.5px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.15s ease'
                  }}
                  className={`active:scale-90 ${set.completed ? 'checkmark-scale' : ''}`}
                  aria-label={set.completed ? `Set ${idx + 1} complete, tap to undo` : `Mark set ${idx + 1} done`}
                >
                  {set.completed && <Check size={16} strokeWidth={3} color="#ffffff" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons: Add Set & Remove Set */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '0.5px solid var(--border-default)' }}>
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
              backgroundColor: 'transparent',
              border: '1px dashed rgba(255, 255, 255, 0.12)',
              color: 'var(--text-muted)',
              fontSize: 13,
              fontWeight: 600
            }}
            className="active:scale-95 transition hover:text-white"
          >
            <Plus size={14} style={{ color: 'var(--color-green)' }} /> Add set
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
              backgroundColor: 'transparent',
              border: '1px dashed rgba(255, 255, 255, 0.12)',
              color: 'var(--text-muted)'
            }}
            className="active:scale-95 hover:text-rose-400 transition"
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
