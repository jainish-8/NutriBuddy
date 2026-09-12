import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';

/**
 * FloatingWorkoutBar - Elevated Obsidian Emerald Floating Workout Widget
 * Displays live workout telemetry with guaranteed responsive centering across all mobile viewports.
 */
export default function FloatingWorkoutBar({ workoutSession, onNavigateToExercise }) {
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

  return (
    <div className="floating-workout-wrapper">
      <div
        className={`floating-workout-capsule ${isRest ? 'is-rest' : 'is-active'}`}
        onClick={handleResume}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleResume();
          }
        }}
        role="button"
        tabIndex={0}
        title="Tap anywhere to resume active workout"
      >
        {/* Left: Pulsing Radar Beacon */}
        <div className="floating-workout-badge">
          <span className={`floating-workout-ping ${isRest ? 'rest' : 'active'}`} />
          <span className={`floating-workout-dot ${isRest ? 'rest' : 'active'}`} />
        </div>

        {/* Center: Workout Name & Live Progress / Rest Telemetry */}
        <div className="floating-workout-info">
          <div className="floating-workout-title">
            {workoutSession.workoutName || 'Active Workout'}
          </div>
          <div className="floating-workout-subtitle">
            {isRest ? (
              <span className="floating-workout-rest-text">
                Rest interval · {formatTime(workoutSession.restRemaining || 0)} left
              </span>
            ) : (
              <span>
                {workoutSession.currentExerciseName ? `${workoutSession.currentExerciseName} · ` : ''}
                <span className="tabular-nums">
                  {workoutSession.completedSets || 0}/{workoutSession.totalSets || 0} sets
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Stopwatch Timer + Tactile Resume Button */}
        <div className="floating-workout-actions">
          {/* Digital Monospace Stopwatch */}
          <div className={`floating-workout-timer ${isRest ? 'timer-rest' : 'timer-active'}`}>
            <Clock size={11} strokeWidth={2.5} />
            <span className="tabular-nums">
              {isRest
                ? formatTime(workoutSession.restRemaining || 0)
                : formatTime(workoutSession.elapsedSeconds || 0)
              }
            </span>
          </div>

          {/* Tactile Resume CTA Pill */}
          <div className="floating-workout-resume-btn">
            <span className="resume-btn-label">Resume</span>
            <ArrowRight size={13} strokeWidth={2.5} className="resume-btn-icon" />
          </div>
        </div>
      </div>
    </div>
  );
}
