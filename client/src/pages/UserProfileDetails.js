import React from 'react';

export default function UserProfileDetails({ user, onEdit, onLogout }) {
  if (!user) return null;

  const getGoalLabel = (goal) => {
    switch (goal) {
      case 'lose':
      case 'fat_loss':
        return 'Weight Loss / Fat Loss';
      case 'gain':
      case 'lean_bulk':
        return 'Weight Gain / Lean Muscle Building';
      case 'aggressive_bulk':
        return 'Weight Gain / Aggressive Muscle Building';
      default:
        return 'Maintain Weight & Balance';
    }
  };

  const getActivityLabel = (level) => {
    switch (level) {
      case 'sedentary': return 'Sedentary (desk job, little/no exercise)';
      case 'light': return 'Lightly Active (light exercise 1-3 days/week)';
      case 'moderate': return 'Moderately Active (exercise 3-5 days/week)';
      case 'active': return 'Active Gym Goer (exercise 6-7 days/week)';
      case 'veryActive': return 'Athlete / Heavy Exercise (twice a day)';
      default: return 'Moderate Activity';
    }
  };

  const initial = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';
  const profileTypeLabel = user.isGymGoer ? 'Gym / Active Profile' : 'Healthy Maintenance Profile';

  const macros = [
    { label: 'Calories', value: user.dailyCalories ? `${user.dailyCalories} kcal` : '—' },
    { label: 'Protein',  value: user.targetProtein  ? `${user.targetProtein}g`   : '—' },
    { label: 'Carbs',    value: user.targetCarbs    ? `${user.targetCarbs}g`     : '—' },
    { label: 'Fats',     value: user.targetFat      ? `${user.targetFat}g`       : '—' },
  ];

  /* ─── Shared style tokens ─── */
  const card = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-card)',
    padding: '24px 28px',
    backdropFilter: 'var(--glass-blur, none)',
    WebkitBackdropFilter: 'var(--glass-blur, none)',
  };

  const sectionLabel = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: 4,
  };

  const fieldValue = {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── HERO BANNER ── */}
      <div style={{
        ...card,
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
      }}>
        {/* Left accent strip */}
        <div style={{
          width: 6,
          alignSelf: 'stretch',
          background: 'linear-gradient(180deg, var(--accent-lavender-text), var(--accent-pink-text))',
          flexShrink: 0,
          borderRadius: 'var(--radius-card) 0 0 var(--radius-card)',
        }} />

        {/* Avatar circle */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-lavender-text), var(--accent-pink-text))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#fff',
          fontFamily: 'var(--font-heading)',
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          border: '3px solid var(--border-subtle)',
        }}>
          {initial}
        </div>

        {/* Name + profile type */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={sectionLabel}>Member Profile</div>
          <h1 style={{
            margin: 0,
            fontFamily: 'var(--font-heading)',
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            textTransform: 'capitalize',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {user.fullName}
          </h1>
          <div style={{
            marginTop: 4,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--accent-lavender-text)',
          }}>
            {profileTypeLabel}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, padding: '20px 24px 20px 0', flexShrink: 0 }}>
          <button
            onClick={onEdit}
            style={{
              background: 'var(--accent-lavender-text)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '9px 22px',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              letterSpacing: '0.01em',
            }}
          >
            Edit Profile
          </button>
          <button
            onClick={onLogout}
            style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-pill)',
              padding: '9px 22px',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              letterSpacing: '0.01em',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ── SECTION 1: Physical Stats ── */}
      <div style={card}>
        <div style={{ ...sectionLabel, marginBottom: 20 }}>Physical Stats</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
        }}>
          {[
            { label: 'Gender', value: user.gender, capitalize: true },
            { label: 'Age',    value: user.age ? `${user.age} yrs` : '—' },
            { label: 'Height', value: user.height ? `${user.height} cm` : '—' },
            { label: 'Weight', value: user.weight ? `${user.weight} kg` : '—' },
          ].map(({ label, value, capitalize }) => (
            <div
              key={label}
              style={{
                background: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-panel)',
                padding: '14px 16px',
              }}
            >
              <div style={sectionLabel}>{label}</div>
              <div style={{
                fontSize: 22,
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                textTransform: capitalize ? 'capitalize' : 'none',
                marginTop: 4,
              }}>
                {value || '—'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 2: Goals & Targets ── */}
      <div style={card}>
        <div style={{ ...sectionLabel, marginBottom: 20 }}>Goals & Targets</div>

        {/* Fitness goal + Activity level text rows */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div>
            <div style={sectionLabel}>Fitness Goal</div>
            <div style={{ ...fieldValue, marginTop: 4, fontSize: 14 }}>
              {getGoalLabel(user.goal)}
            </div>
          </div>
          <div>
            <div style={sectionLabel}>Activity Level</div>
            <div style={{ ...fieldValue, marginTop: 4, fontSize: 14 }}>
              {getActivityLabel(user.activityLevel)}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', marginBottom: 20 }} />

        {/* Macro targets — 4 equal mini cards */}
        <div style={{ ...sectionLabel, marginBottom: 14 }}>Target Daily Intake</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {macros.map(({ label, value }) => (
            <div
              key={label}
              style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-panel)',
                padding: '14px 16px',
                textAlign: 'center',
              }}
            >
              <div style={sectionLabel}>{label}</div>
              <div style={{
                fontSize: 20,
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                marginTop: 6,
              }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 3: Diet & Constraints ── */}
      <div style={card}>
        <div style={{ ...sectionLabel, marginBottom: 20 }}>Diet & Constraints</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div>
            <div style={sectionLabel}>Dietary Style</div>
            <div style={{ ...fieldValue, marginTop: 4, textTransform: 'capitalize' }}>
              {user.dietaryPreferences || 'No specific preference'}
            </div>
          </div>
          <div>
            <div style={sectionLabel}>Cooking Level</div>
            <div style={{ ...fieldValue, marginTop: 4, textTransform: 'capitalize' }}>
              {user.cookingSkill === 'no-cook' ? 'Beginner / No Cooking' : (user.cookingSkill || '—')}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', marginBottom: 20 }} />

        <div style={sectionLabel}>Allergy Warnings</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          {user.allergies && user.allergies.length > 0 ? (
            user.allergies.map((allergy) => (
              <span
                key={allergy}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  color: 'var(--accent-danger)',
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--accent-danger)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '5px 14px',
                  letterSpacing: '0.03em',
                }}
              >
                {allergy}
              </span>
            ))
          ) : (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--accent-lime-text)',
                background: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-pill)',
                padding: '5px 14px',
                letterSpacing: '0.03em',
              }}
            >
              No Known Allergies
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
