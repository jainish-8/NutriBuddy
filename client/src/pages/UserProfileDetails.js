import React, { useState, useEffect } from 'react';
import { 
  Trophy, Flame, Shield, Award, Activity, Utensils, 
  ChevronDown, ChevronUp, Scale
} from 'lucide-react';

const PR_PATTERNS = [
  { key: 'squat', label: 'Barbell Squat (1RM)', iconColor: '#F59E0B' },
  { key: 'bench', label: 'Bench Press (1RM)', iconColor: '#818CF8' },
  { key: 'deadlift', label: 'Deadlift (1RM)', iconColor: '#10B981' },
  { key: 'press', label: 'Overhead Press (1RM)', iconColor: '#F472B6' }
];

export default function UserProfileDetails({ user, onEdit, onLogout }) {
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [streakShield, setStreakShield] = useState(false);

  // Accordion dropdown states
  const [openSections, setOpenSections] = useState({
    biometrics: true,
    prs: true,
    nutrition: true,
    activity: true
  });

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => setOpenSections({ biometrics: true, prs: true, nutrition: true, activity: true });
  const collapseAll = () => setOpenSections({ biometrics: false, prs: false, nutrition: false, activity: false });

  useEffect(() => {
    if (user?.id) {
      const savedHistory = localStorage.getItem(`nutribuddy_workout_history_${user.id}`);
      if (savedHistory) {
        try {
          const hist = JSON.parse(savedHistory);
          if (Array.isArray(hist)) setWorkoutHistory(hist);
        } catch (e) {}
      }

      const savedShield = localStorage.getItem(`nutribuddy_shield_${user.id}`);
      if (savedShield !== null) setStreakShield(savedShield === 'true');
    }
  }, [user?.id]);

  if (!user) return null;

  const getGoalLabel = (goal) => {
    switch (goal) {
      case 'lose':
      case 'fat_loss':
        return 'Fat Loss (Caloric Deficit)';
      case 'gain':
      case 'lean_bulk':
        return 'Lean Muscle Building (Controlled Surplus)';
      case 'aggressive_bulk':
        return 'Aggressive Mass Gain (Hypertrophy Surplus)';
      default:
        return 'Weight Maintenance & Athletic Tone';
    }
  };

  const getActivityLabel = (level) => {
    switch (level) {
      case 'sedentary': return 'Sedentary (Desk work, light daily steps)';
      case 'light': return 'Lightly Active (1-3 workout days/week)';
      case 'moderate': return 'Moderately Active (3-5 workout days/week)';
      case 'active': return 'Active Athlete (6-7 workout days/week)';
      case 'veryActive': return 'High-Performance / Two-a-Days';
      default: return 'Moderate Activity (3-5 days/week)';
    }
  };

  const initial = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';
  const profileTypeLabel = user.isGymGoer ? 'Athletic Member' : 'Lifestyle Member';

  // Calculate PRs from history
  const prHallOfFame = (() => {
    const prs = {};
    for (const pattern of PR_PATTERNS) {
      const matching = workoutHistory.flatMap(h => h.exercises || []).filter(e => {
        const name = (e.name || '').toLowerCase();
        if (pattern.key === 'squat') return name.includes('squat');
        if (pattern.key === 'bench') return name.includes('bench');
        if (pattern.key === 'deadlift') return name.includes('deadlift');
        if (pattern.key === 'press') return name.includes('overhead') || name.includes('press');
        return false;
      });
      let maxPr = null;
      for (const ex of matching) {
        for (const s of ex.sets || []) {
          const w = parseFloat(s.weight) || 0;
          const r = parseInt(s.reps, 10) || 0;
          if (w > 0 && r > 0) {
            if (!maxPr || w > maxPr.weight) {
              const est1RM = Math.round(w * (1 + r / 30));
              maxPr = { weight: w, reps: r, est1RM, timestamp: ex.timestamp || Date.now() };
            }
          }
        }
      }
      if (maxPr) prs[pattern.key] = maxPr;
    }
    return prs;
  })();

  // Biometrics Calculations
  const weightNum = parseFloat(user.weight) || 70;
  const heightNum = parseFloat(user.height) || 175;
  const ageNum = parseInt(user.age, 10) || 24;
  const genderStr = (user.gender || 'male').toLowerCase();

  const bmi = (weightNum / ((heightNum / 100) ** 2)).toFixed(1);
  const bmiCategory = bmi < 18.5 ? { label: 'Underweight', color: '#38BDF8' } :
                      bmi < 24.9 ? { label: 'Normal / Healthy', color: '#10B981' } :
                      bmi < 29.9 ? { label: 'Overweight', color: '#F59E0B' } :
                      { label: 'Obese', color: '#EF4444' };

  // Estimated BMR (Mifflin-St Jeor)
  const bmr = Math.round(
    genderStr === 'female'
      ? (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) - 161
      : (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) + 5
  );

  // Lifetime Stats
  const totalWorkouts = workoutHistory.length;
  const totalVolumeKg = Math.round(workoutHistory.reduce((sum, h) => sum + (h.totalVolume || 0), 0));
  const currentStreak = Math.min(totalWorkouts, 7);

  const macros = [
    { label: 'Calories', value: user.dailyCalories ? `${user.dailyCalories} kcal` : '—', color: 'var(--brand-primary, #F59E0B)' },
    { label: 'Protein',  value: user.targetProtein  ? `${user.targetProtein}g`   : '—', color: '#818CF8' },
    { label: 'Carbs',    value: user.targetCarbs    ? `${user.targetCarbs}g`     : '—', color: '#10B981' },
    { label: 'Fats',     value: user.targetFat      ? `${user.targetFat}g`       : '—', color: '#F472B6' },
  ];

  /* ─── Shared style tokens ─── */
  const card = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-card)',
    padding: '24px 28px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.2s ease'
  };

  const sectionHeaderBtn = (isOpen) => ({
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    textAlign: 'left',
    color: 'inherit'
  });

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18, paddingBottom: 40 }}>

      {/* ── HERO PROFILE BANNER ── */}
      <div style={{ ...card, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {/* Avatar circle */}
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--brand-primary, #F59E0B), #ea580c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: '#fff',
            fontFamily: 'var(--font-heading)',
            fontSize: 28,
            fontWeight: 900,
            border: '2.5px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 24px rgba(245,158,11,0.28)'
          }}>
            {initial}
          </div>

          {/* Name + profile type */}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand-primary, #F59E0B)' }}>
              {profileTypeLabel}
            </div>
            <h1 style={{
              margin: '2px 0 0',
              fontFamily: 'var(--font-heading)',
              fontSize: 24,
              fontWeight: 900,
              color: 'var(--text-primary)',
              textTransform: 'capitalize',
            }}>
              {user.fullName}
            </h1>
            <div style={{
              marginTop: 4,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}>
              {user.profession || 'Athlete'} · Joined NutriBuddy
            </div>
          </div>
        </div>

        {/* Action buttons & Expand/Collapse Toggles */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, background: 'var(--bg-surface-raised)', padding: 4, borderRadius: 10, marginRight: 6 }}>
            <button
              onClick={expandAll}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
              title="Expand all sections"
            >
              Expand All
            </button>
            <span style={{ color: 'var(--border-subtle)', alignSelf: 'center' }}>|</span>
            <button
              onClick={collapseAll}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
              title="Collapse all sections"
            >
              Collapse All
            </button>
          </div>

          <button
            onClick={onEdit}
            className="btn btn-primary"
            style={{
              padding: '10px 20px',
              fontSize: 12,
              fontWeight: 800,
              background: 'var(--brand-primary, #F59E0B)',
              color: '#000'
            }}
          >
            Edit Profile
          </button>
          <button
            onClick={onLogout}
            className="btn btn-secondary"
            style={{
              padding: '10px 18px',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ── TOP KEY METRICS SUMMARY STRIP (Always Visible) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
        <div style={{ background: 'var(--bg-surface)', padding: '16px 20px', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TARGET CALORIES</span>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)', marginTop: 2 }}>
            {user.dailyCalories ? `${user.dailyCalories} kcal` : '—'}
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface)', padding: '16px 20px', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>DAILY PROTEIN</span>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#818CF8', marginTop: 2 }}>
            {user.targetProtein ? `${user.targetProtein}g` : '—'}
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface)', padding: '16px 20px', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>BMI STATUS</span>
          <div style={{ fontSize: 18, fontWeight: 900, color: bmiCategory.color, marginTop: 2 }}>
            {bmi} · {bmiCategory.label}
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface)', padding: '16px 20px', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>WORKOUT STREAK</span>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#10B981', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Flame size={18} fill="#10B981" /> {currentStreak} Sessions
          </div>
        </div>
      </div>

      {/* ── SECTION 1: BIOMETRICS & BODY COMPOSITION (Collapsible Dropdown) ── */}
      <div style={card}>
        <button onClick={() => toggleSection('biometrics')} style={sectionHeaderBtn(openSections.biometrics)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(56, 189, 248, 0.12)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scale size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Biometrics & Body Composition
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                Physical dimensions, BMI rating, and basal metabolic rate
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', background: 'var(--bg-surface-raised)', padding: '4px 10px', borderRadius: 8 }}>
              {weightNum} kg · {heightNum} cm
            </span>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              {openSections.biometrics ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </button>

        {openSections.biometrics && (
          <div className="fadeInUp" style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border-subtle)' }}>
            <div className="profile-stats-grid" style={{ marginBottom: 14 }}>
              {[
                { label: 'Gender', value: user.gender, capitalize: true },
                { label: 'Age', value: user.age ? `${user.age} years` : '—' },
                { label: 'Height', value: user.height ? `${user.height} cm` : '—' },
                { label: 'Body Weight', value: user.weight ? `${user.weight} kg` : '—' },
              ].map(({ label, value, capitalize }) => (
                <div
                  key={label}
                  style={{
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    padding: '14px 16px',
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</span>
                  <div style={{
                    fontSize: 18,
                    fontWeight: 900,
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--text-primary)',
                    textTransform: capitalize ? 'capitalize' : 'none',
                    marginTop: 4,
                  }}>
                    {value || '—'}
                  </div>
                </div>
              ))}
            </div>

            {/* Metabolic Estimates */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div style={{ background: 'var(--bg-surface-raised)', padding: 14, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>BODY MASS INDEX (BMI)</span>
                <div style={{ fontSize: 18, fontWeight: 900, color: bmiCategory.color, marginTop: 4 }}>
                  {bmi} <span style={{ fontSize: 12, fontWeight: 700 }}>({bmiCategory.label})</span>
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface-raised)', padding: 14, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ESTIMATED BASAL METABOLISM (BMR)</span>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', marginTop: 4 }}>
                  ~{bmr.toLocaleString()} kcal/day
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 2: PERSONAL RECORDS (PR) HALL OF FAME (Collapsible Dropdown) ── */}
      <div style={card}>
        <button onClick={() => toggleSection('prs')} style={sectionHeaderBtn(openSections.prs)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', color: 'var(--brand-primary, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Personal Records (PR) Hall of Fame
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                All-time compound strength achievements & estimated 1RMs
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary, #F59E0B)', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 10px', borderRadius: 8 }}>
              Big 4 Movements
            </span>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              {openSections.prs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </button>

        {openSections.prs && (
          <div className="fadeInUp" style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
              {PR_PATTERNS.map((pattern) => {
                const pr = prHallOfFame[pattern.key];
                if (pr) {
                  return (
                    <div key={pattern.key} style={{
                      background: 'var(--bg-surface-raised)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: 14,
                      padding: 16,
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <span style={{ fontSize: 10, color: pattern.iconColor, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
                        <Award size={12} /> {pattern.label}
                      </span>
                      <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {pr.weight} kg <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)' }}>× {pr.reps}</span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Est. 1RM: <strong>{pr.est1RM} kg</strong> · {new Date(pr.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  );
                }
                return (
                  <div key={pattern.key} style={{
                    background: 'var(--bg-surface-raised)',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 14,
                    padding: 16,
                    opacity: 0.65
                  }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                      {pattern.label}
                    </span>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 2 }}>
                      No Record Logged Yet
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Log this exercise in Workout Console</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 3: NUTRITION TARGETS & DIETARY BLUEPRINT (Collapsible Dropdown) ── */}
      <div style={card}>
        <button onClick={() => toggleSection('nutrition')} style={sectionHeaderBtn(openSections.nutrition)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Utensils size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Nutrition Target Blueprint & Constraints
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                Macronutrient distribution, dietary style, and allergy controls
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: 8 }}>
              {user.dailyCalories || 2000} kcal Blueprint
            </span>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              {openSections.nutrition ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </button>

        {openSections.nutrition && (
          <div className="fadeInUp" style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border-subtle)' }}>
            
            {/* Goal & Activity Level */}
            <div className="form-grid-2" style={{ marginBottom: 16 }}>
              <div style={{ background: 'var(--bg-surface-raised)', padding: 14, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>FITNESS GOAL</span>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                  {getGoalLabel(user.goal)}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface-raised)', padding: 14, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ACTIVITY LEVEL</span>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                  {getActivityLabel(user.activityLevel)}
                </div>
              </div>
            </div>

            {/* Macro targets 4-column */}
            <div className="profile-stats-grid" style={{ gap: 10, marginBottom: 16 }}>
              {macros.map(({ label, value, color }) => (
                <div
                  key={label}
                  style={{
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</span>
                  <div style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: color,
                    marginTop: 4,
                  }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Diet & Allergies Row */}
            <div className="form-grid-2" style={{ marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>DIETARY STYLE</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, textTransform: 'capitalize' }}>
                  {user.dietaryPreferences || 'No specific restrictions'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>COOKING EXPERIENCE</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, textTransform: 'capitalize' }}>
                  {user.cookingSkill === 'no-cook' ? 'Beginner / Quick Prep' : (user.cookingSkill || 'Intermediate')}
                </div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ALLERGY SAFEGUARDS</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                {user.allergies && user.allergies.length > 0 ? (
                  user.allergies.map((allergy) => (
                    <span
                      key={allergy}
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: 'capitalize',
                        color: 'var(--accent-danger, #EF4444)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 8,
                        padding: '4px 10px',
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
                      color: '#10B981',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: 8,
                      padding: '4px 10px',
                    }}
                  >
                    No Known Allergies
                  </span>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ── SECTION 4: LIFETIME ATHLETIC TRAINING & ACTIVITY (Collapsible Dropdown) ── */}
      <div style={card}>
        <button onClick={() => toggleSection('activity')} style={sectionHeaderBtn(openSections.activity)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(129, 140, 248, 0.12)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Lifetime Athletic Training & History
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                Total training volume, workout logs, and consistency records
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#818CF8', background: 'rgba(129, 140, 248, 0.1)', padding: '4px 10px', borderRadius: 8 }}>
              {totalWorkouts} Workouts Logged
            </span>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              {openSections.activity ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </button>

        {openSections.activity && (
          <div className="fadeInUp" style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 16 }}>
              <div style={{ background: 'var(--bg-surface-raised)', padding: 14, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TOTAL SESSIONS</span>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginTop: 4 }}>{totalWorkouts} logs</div>
              </div>

              <div style={{ background: 'var(--bg-surface-raised)', padding: 14, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>LIFETIME VOLUME</span>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)', marginTop: 4 }}>{totalVolumeKg.toLocaleString()} kg</div>
              </div>

              <div style={{ background: 'var(--bg-surface-raised)', padding: 14, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ACTIVE STREAK</span>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#10B981', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Flame size={16} fill="#10B981" /> {currentStreak} Sessions
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-raised)', padding: 14, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>STREAK SHIELD</span>
                <div style={{ fontSize: 13, fontWeight: 900, color: streakShield ? 'var(--brand-primary, #F59E0B)' : 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={15} /> {streakShield ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>
            </div>

            {/* Recent Workouts Log preview */}
            {workoutHistory.length > 0 && (
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  RECENT TRAINING ARCHIVE
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {workoutHistory.slice(0, 3).map((session, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        padding: '10px 14px',
                        background: 'var(--bg-surface-raised)',
                        borderRadius: 10,
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 12
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{session.workoutName}</span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                          {new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <span style={{ fontWeight: 800, color: 'var(--brand-primary, #F59E0B)' }}>
                        {session.totalSets || 12} sets · {Math.round(session.totalVolume || 0)} kg
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
