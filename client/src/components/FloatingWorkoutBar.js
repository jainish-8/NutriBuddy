import React, { useState, useEffect } from 'react';

/**
 * Persistent Workout Resume Pill (Part 3)
 *
 * When a workout is in progress, shows a floating pill above the dock:
 *  - Position: fixed, bottom 96px, centered
 *  - Width: calc(100% - 36px), max-width 354px
 *  - background --s2, border 0.5px solid rgba(34,209,122,0.25)
 *  - border-radius 18px, padding 10px 14px
 *  - box-shadow 0 4px 24px rgba(0,0,0,0.45)
 *  - display flex, align-items center, gap 10px
 *  - Pulsing green dot (8px circle)
 *  - Info column: workout name (13px bold), set progress (11px muted, e.g. "Set 8 of 19")
 *  - Live timer: tabular-nums, color --amb (amber), 13px bold, ticking every second
 *  - "Resume" button: --g background, dark text, 11.5px, 800 weight, 11px border-radius
 */
export default function FloatingWorkoutBar({ workoutSession, onNavigateToExercise }) {
  const [, setTick] = useState(0);

  // Tick every second to keep stopwatch moving smoothly
  useEffect(() => {
    if (!workoutSession || !workoutSession.isSessionActive) return;
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutSession]);

  if (!workoutSession || !workoutSession.isSessionActive) {
    return null;
  }

  const handleResume = () => {
    if (typeof workoutSession.onResume === 'function') {
      workoutSession.onResume();
    }
    if (typeof onNavigateToExercise === 'function') {
      onNavigateToExercise();
    }
  };

  const formatTime = (totalSeconds = 0) => {
    const s = Math.max(0, Math.floor(totalSeconds));
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const isRest = Boolean(workoutSession.restActive);
  const completedSets = workoutSession.completedSets || 0;
  const totalSets = workoutSession.totalSets || 0;
  const setInfo = isRest
    ? `Rest · ${formatTime(workoutSession.restRemaining || 0)}`
    : `Set ${completedSets} of ${totalSets}`;

  return (
    <div
      className="nb-floating-workout-bar"
      onClick={handleResume}
      role="button"
      tabIndex={0}
      title="Tap to resume active workout"
    >
      {/* Pulsing Green Dot (8px circle, animation: scale 1→0.75→1, opacity 1→0.5→1, 2s loop) */}
      <div
        className="anim-workout-live-dot"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--g)',
          flexShrink: 0,
          boxShadow: '0 0 8px rgba(34, 209, 122, 0.6)'
        }}
      />

      {/* Info Column: workout name (13px bold), set progress (11px muted) */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--t1)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: 1.2
        }}>
          {workoutSession.workoutName || 'Active Workout'}
        </div>
        <div style={{
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--t3)',
          marginTop: 2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: 1.2
        }}>
          {setInfo}
        </div>
      </div>

      {/* Live Timer: tabular-nums, color --amb (amber), 13px bold, ticking every second */}
      <div
        className="tabular-nums"
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--amb)',
          flexShrink: 0
        }}
      >
        {isRest
          ? formatTime(workoutSession.restRemaining || 0)
          : formatTime(workoutSession.elapsedSeconds || 0)
        }
      </div>

      {/* "Resume" Button: --g background, dark text, 11.5px, 800 weight, 11px border-radius */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleResume();
        }}
        style={{
          background: 'var(--g)',
          color: '#041a0c',
          fontSize: 11.5,
          fontWeight: 800,
          borderRadius: 11,
          padding: '6px 12px',
          border: 'none',
          cursor: 'pointer',
          flexShrink: 0,
          outline: 'none',
          transition: 'transform 0.15s ease, background 0.15s ease'
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        Resume
      </button>
    </div>
  );
}
