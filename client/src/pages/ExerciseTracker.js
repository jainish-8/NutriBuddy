import React, { useState, useEffect } from 'react';

export default function ExerciseTracker({ user, setCurrentPage }) {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('moderate');

  const exerciseDatabase = [
    { name: 'Walking', caloriesPerMin: { light: 3, moderate: 4, high: 5 } },
    { name: 'Running', caloriesPerMin: { light: 8, moderate: 10, high: 12 } },
    { name: 'Cycling', caloriesPerMin: { light: 6, moderate: 8, high: 10 } },
    { name: 'Swimming', caloriesPerMin: { light: 8, moderate: 10, high: 14 } },
    { name: 'Weight Training', caloriesPerMin: { light: 4, moderate: 6, high: 8 } },
    { name: 'Yoga', caloriesPerMin: { light: 2, moderate: 3, high: 4 } },
    { name: 'Dancing', caloriesPerMin: { light: 3, moderate: 5, high: 7 } },
  ];

  useEffect(() => {
    if (user?.id) {
      const today = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem(`exercises_${user.id}_${today}`);
      if (saved) setExercises(JSON.parse(saved));
    }
  }, [user?.id]);

  const addExercise = () => {
    if (!selectedExercise || !duration) {
      alert('Please select exercise and duration');
      return;
    }
    const exercise = exerciseDatabase.find((ex) => ex.name === selectedExercise);
    const caloriesBurned = Math.round(
      (exercise.caloriesPerMin[intensity] || exercise.caloriesPerMin.moderate) * parseInt(duration)
    );
    const newExercise = {
      id: Date.now(),
      name: selectedExercise,
      duration: parseInt(duration),
      intensity,
      caloriesBurned,
      timestamp: new Date().toISOString(),
    };
    const updated = [...exercises, newExercise];
    setExercises(updated);
    if (user?.id) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`exercises_${user.id}_${today}`, JSON.stringify(updated));
    }
    setDuration('');
  };

  const removeExercise = (id) => {
    const updated = exercises.filter((ex) => ex.id !== id);
    setExercises(updated);
    if (user?.id) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`exercises_${user.id}_${today}`, JSON.stringify(updated));
    }
  };

  const totalCaloriesBurned = exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
  const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);

  const estimatedBurn =
    selectedExercise && duration
      ? (() => {
          const ex = exerciseDatabase.find((e) => e.name === selectedExercise);
          return ex
            ? Math.round(
                (ex.caloriesPerMin[intensity] || ex.caloriesPerMin.moderate) * parseInt(duration || 0)
              )
            : null;
        })()
      : null;

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const intensityLabel = (level) => {
    if (level === 'light') return 'Light';
    if (level === 'high') return 'High';
    return 'Moderate';
  };

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '32px 24px',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 32,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              margin: '0 0 6px 0',
            }}
          >
            Fitness
          </p>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: '0 0 6px 0',
            }}
          >
            Exercise Log
          </h1>
          <p
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              margin: 0,
            }}
          >
            {todayLabel}
          </p>
        </div>

        <button
          onClick={addExercise}
          style={{
            background: 'var(--accent-lavender-text)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            padding: '10px 22px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.02em',
            alignSelf: 'center',
          }}
        >
          Log Workout
        </button>
      </div>

      {/* Two-column layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 28,
          alignItems: 'start',
        }}
      >
        {/* LEFT — Log Form Panel */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: '24px 28px',
            backdropFilter: 'var(--glass-blur, none)',
            WebkitBackdropFilter: 'var(--glass-blur, none)',
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              margin: '0 0 20px 0',
            }}
          >
            New Workout
          </p>

          {/* Exercise Type */}
          <div style={{ marginBottom: 16 }}>
            <label
              className="form-label"
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 6,
              }}
            >
              Exercise Type
            </label>
            <select
              className="form-control"
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 13,
                color: 'var(--text-primary)',
                background: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              <option value="">Select an exercise</option>
              {exerciseDatabase.map((ex) => (
                <option key={ex.name} value={ex.name}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>

          {/* Duration + Intensity row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label
                className="form-label"
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 6,
                }}
              >
                Duration (min)
              </label>
              <input
                className="form-control"
                type="number"
                min="1"
                placeholder="e.g. 30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                className="form-label"
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 6,
                }}
              >
                Intensity
              </label>
              <select
                className="form-control"
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Estimated burn preview */}
          {estimatedBurn !== null && (
            <div
              style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}
              >
                Estimated Burn
              </span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '-0.02em',
                  color: 'var(--accent-pink-text)',
                }}
              >
                {estimatedBurn}{' '}
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>kcal</span>
              </span>
            </div>
          )}

          {/* Log Workout button */}
          <button
            onClick={addExercise}
            style={{
              width: '100%',
              background: 'var(--accent-lavender-text)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '11px 0',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.02em',
            }}
          >
            Log Workout
          </button>
        </div>

        {/* RIGHT — Summary + Workouts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Summary stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Calories Burned */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-card)',
                padding: '20px 22px',
                backdropFilter: 'var(--glass-blur, none)',
                WebkitBackdropFilter: 'var(--glass-blur, none)',
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  margin: '0 0 8px 0',
                }}
              >
                Calories Burned
              </p>
              <p
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '-0.02em',
                  color: 'var(--accent-pink-text)',
                  margin: 0,
                }}
              >
                {totalCaloriesBurned}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  margin: '4px 0 0 0',
                }}
              >
                kcal today
              </p>
            </div>

            {/* Minutes Active */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-card)',
                padding: '20px 22px',
                backdropFilter: 'var(--glass-blur, none)',
                WebkitBackdropFilter: 'var(--glass-blur, none)',
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  margin: '0 0 8px 0',
                }}
              >
                Minutes Active
              </p>
              <p
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '-0.02em',
                  color: 'var(--accent-lavender-text)',
                  margin: 0,
                }}
              >
                {totalDuration}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  margin: '4px 0 0 0',
                }}
              >
                min today
              </p>
            </div>
          </div>

          {/* Logged Workouts List */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-card)',
              padding: '24px 28px',
              backdropFilter: 'var(--glass-blur, none)',
              WebkitBackdropFilter: 'var(--glass-blur, none)',
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                margin: '0 0 20px 0',
              }}
            >
              Today's Workouts
            </p>

            {exercises.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '36px 0',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                }}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: 'block', margin: '0 auto 12px' }}
                >
                  <path d="M6.5 6.5h11M6.5 12h11M6.5 17.5h11" />
                  <circle cx="3.5" cy="6.5" r="1" />
                  <circle cx="3.5" cy="12" r="1" />
                  <circle cx="3.5" cy="17.5" r="1" />
                </svg>
                No workouts logged today
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {exercises.map((ex) => (
                  <div
                    key={ex.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: 'var(--bg-surface-alt)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      gap: 12,
                    }}
                  >
                    {/* Exercise info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          margin: '0 0 4px 0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {ex.name}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          margin: 0,
                        }}
                      >
                        {ex.duration} min
                      </p>
                    </div>

                    {/* Intensity badge */}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-pill)',
                        padding: '3px 9px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {intensityLabel(ex.intensity)}
                    </span>

                    {/* Calories */}
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--accent-pink-text)',
                        whiteSpace: 'nowrap',
                        minWidth: 60,
                        textAlign: 'right',
                      }}
                    >
                      {ex.caloriesBurned}{' '}
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>kcal</span>
                    </span>

                    {/* Delete button */}
                    <button
                      onClick={() => removeExercise(ex.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--accent-danger)',
                        borderRadius: 6,
                        color: 'var(--accent-danger)',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 10px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
