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
}) => {
  return (
    <div className="w-full max-w-md mx-auto overflow-x-hidden px-1 sm:px-2 py-2 flex flex-col gap-3" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* 1. EXERCISE HEADER & UTILITIES */}
      <div 
        style={{
          background: 'linear-gradient(180deg, #161922 0%, #0F1117 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.5)',
          borderRadius: 16,
          padding: '16px 18px'
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {exerciseName}
          </h2>
          <span style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 9999, backgroundColor: 'rgba(255, 255, 255, 0.06)', color: '#A1A1AA', flexShrink: 0, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {category}
          </span>
        </div>

        <p style={{ fontSize: 12, fontWeight: 500, color: '#A1A1AA', margin: '0 0 12px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Target: {targetMuscles}
        </p>

        {/* Scrollable Utility Pills: Dark Slate Pills with Emerald Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 2 }} className="no-scrollbar">
          <button
            type="button"
            onClick={() => onOpenDrawer && onOpenDrawer('warmup')}
            style={{
              height: 32,
              padding: '0 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 10,
              color: '#E4E4E7',
              fontSize: 12,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              flexShrink: 0
            }}
            className="active:scale-95 transition"
          >
            <Calculator color="#10B981" size={13} />
            <span>Warm-Up</span>
          </button>
          <button
            type="button"
            onClick={() => (onSwapExercise ? onSwapExercise() : onOpenDrawer && onOpenDrawer('swap'))}
            style={{
              height: 32,
              padding: '0 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 10,
              color: '#E4E4E7',
              fontSize: 12,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              flexShrink: 0
            }}
            className="active:scale-95 transition"
          >
            <Repeat color="#10B981" size={13} />
            <span>Swap Exercise</span>
          </button>
          <button
            type="button"
            onClick={() => (onAddExercise ? onAddExercise() : onOpenDrawer && onOpenDrawer('search'))}
            style={{
              height: 32,
              padding: '0 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 10,
              color: '#E4E4E7',
              fontSize: 12,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              flexShrink: 0
            }}
            className="active:scale-95 transition"
          >
            <Plus color="#10B981" size={13} />
            <span>Add Exercise</span>
          </button>
        </div>
      </div>

      {/* 2. MOBILE SET MATRIX (ZERO-OVERFLOW CSS GRID) */}
      <div 
        style={{
          background: 'linear-gradient(180deg, #161922 0%, #0F1117 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.5)',
          borderRadius: 16,
          padding: '14px 16px',
          overflow: 'hidden'
        }}
      >
        {/* Table Header: Exactly 5 columns mapped to 100% of the screen */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '28px minmax(0, 1fr) 62px 48px 40px',
            gap: 6,
            paddingBottom: 8,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: 10,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#71717A',
            alignItems: 'center'
          }}
        >
          <span style={{ textAlign: 'center' }}>Set</span>
          <span style={{ paddingLeft: 4 }}>Prev</span>
          <span style={{ textAlign: 'center' }}>Kg</span>
          <span style={{ textAlign: 'center' }}>Reps</span>
          <span style={{ textAlign: 'center' }}>Done</span>
        </div>

        {/* Set Rows */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {sets.map((set, idx) => (
            <div
              key={set.id || idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '28px minmax(0, 1fr) 62px 48px 40px',
                gap: 6,
                alignItems: 'center',
                paddingTop: 8,
                paddingBottom: 8,
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                backgroundColor: set.completed ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                borderRadius: set.completed ? 8 : 0,
                transition: 'background-color 0.2s ease'
              }}
            >
              {/* Col 1: Set Number */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: set.completed ? '#10B981' : '#71717A', fontFamily: 'JetBrains Mono, monospace' }}>
                  {idx + 1}
                </span>
              </div>

              {/* Col 2: Previous Target & RPE Tag */}
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', paddingLeft: 4 }}>
                <span style={{ fontSize: 11, color: '#D4D4D8', fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                  {set.prev || '—'}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenRpe && onOpenRpe(idx)}
                  style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', fontSize: 9.5, fontWeight: 700, color: '#10B981', marginTop: 2 }}
                >
                  @{set.rpe || 8} RPE
                </button>
              </div>

              {/* Col 3: Weight (Kg) Input */}
              <input
                type="number"
                step="0.5"
                inputMode="decimal"
                value={set.weight ?? ''}
                onChange={(e) => onUpdateSet(idx, 'weight', e.target.value)}
                placeholder="0.0"
                style={{
                  width: '100%',
                  maxWidth: 62,
                  height: 36,
                  textAlign: 'center',
                  boxSizing: 'border-box',
                  backgroundColor: '#0F1117',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  outline: 'none',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              />

              {/* Col 4: Reps Input */}
              <input
                type="number"
                inputMode="numeric"
                value={set.reps ?? ''}
                onChange={(e) => onUpdateSet(idx, 'reps', e.target.value)}
                placeholder="0"
                style={{
                  width: '100%',
                  maxWidth: 48,
                  height: 36,
                  textAlign: 'center',
                  boxSizing: 'border-box',
                  backgroundColor: '#0F1117',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  outline: 'none',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              />

              {/* Col 5: Done Checkmark Button */}
              <button
                type="button"
                onClick={() => onToggleComplete(idx)}
                style={{
                  height: 36,
                  width: '100%',
                  maxWidth: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: 8,
                  backgroundColor: set.completed ? '#10B981' : 'rgba(255, 255, 255, 0.05)',
                  color: set.completed ? '#000000' : '#71717A',
                  border: set.completed ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: set.completed ? '0 0 14px rgba(16, 185, 129, 0.45)' : 'none',
                  transition: 'all 0.15s ease'
                }}
                className="active:scale-90"
                aria-label={set.completed ? `Set ${idx + 1} complete, tap to undo` : `Mark set ${idx + 1} done`}
              >
                <Check size={16} strokeWidth={set.completed ? 3 : 2} color={set.completed ? '#000000' : '#71717A'} />
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons: Add Set & Remove Set */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            type="button"
            onClick={onAddSet}
            style={{
              flex: 1,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
              borderRadius: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#D4D4D8',
              fontSize: 12,
              fontWeight: 600
            }}
            className="active:scale-95 transition"
          >
            <Plus size={13} style={{ color: '#10B981' }} /> Add Set
          </button>
          <button
            type="button"
            onClick={onRemoveSet}
            style={{
              height: 34,
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#71717A'
            }}
            className="active:scale-95 hover:text-rose-400 transition"
            title="Remove Last Set"
            aria-label="Remove Last Set"
          >
            <Minus size={13}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveExerciseView;
