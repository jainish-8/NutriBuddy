import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Trophy, Flame, Shield, Award, Activity, Utensils, 
  ChevronDown, ChevronUp, Scale, Calculator, Bell, Check, Plus, X, 
  LineChart, TrendingDown, TrendingUp, Sparkles, CheckCircle2,
  Lock, Trash2, Droplets, Zap, Calendar, Info, LogOut
} from 'lucide-react';
import { getDetailedCalorieBreakdown, toTitleCase } from '../utils/nutritionEngine';
import WeightTrendChart from '../components/WeightTrendChart';

const PR_PATTERNS = [
  { key: 'squat', label: 'Barbell Squat (1RM)', iconColor: 'var(--color-green, #22D17A)' },
  { key: 'bench', label: 'Bench Press (1RM)', iconColor: 'var(--color-protein, #5B8AF5)' },
  { key: 'deadlift', label: 'Deadlift (1RM)', iconColor: 'var(--color-water, #60D4F7)' },
  { key: 'press', label: 'Overhead Press (1RM)', iconColor: 'var(--color-fat, #F5A623)' }
];

export default function UserProfileDetails({ user, onEdit, onLogout, setCurrentPage }) {
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [streakShield, setStreakShield] = useState(false);
  const [showShieldTooltip, setShowShieldTooltip] = useState(false);

  // Accordion dropdown states
  const [openSections, setOpenSections] = useState({
    biometrics: true,
    weightHistory: true,
    prs: true,
    nutrition: true,
    activity: true,
    badges: true,
    reminders: true
  });

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => setOpenSections({ biometrics: true, weightHistory: true, prs: true, nutrition: true, activity: true, badges: true, reminders: true });
  const collapseAll = () => setOpenSections({ biometrics: false, weightHistory: false, prs: false, nutrition: false, activity: false, badges: false, reminders: false });

  // Bodyweight history state
  const activeUserId = user?.id || user?._id || 'demo';
  const weightStorageKey = `nutribuddy_weight_log_${activeUserId}`;
  const [weightLogs, setWeightLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(weightStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    const baseW = parseFloat(user?.weight) || 72;
    const now = new Date();
    return [
      { date: new Date(now.getTime() - 21 * 86400000).toISOString().split('T')[0], weight: +(baseW + (user?.goal === 'fat_loss' ? 1.8 : -1.2)).toFixed(1) },
      { date: new Date(now.getTime() - 14 * 86400000).toISOString().split('T')[0], weight: +(baseW + (user?.goal === 'fat_loss' ? 1.1 : -0.8)).toFixed(1) },
      { date: new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0], weight: +(baseW + (user?.goal === 'fat_loss' ? 0.4 : -0.3)).toFixed(1) },
      { date: now.toISOString().split('T')[0], weight: baseW }
    ];
  });
  const [newWeightInput, setNewWeightInput] = useState('');

  // Milestone Badge Modal state
  const [selectedBadge, setSelectedBadge] = useState(null);

  // Smart Reminders state
  const reminderStorageKey = `nutribuddy_reminders_${activeUserId}`;
  const [reminders, setReminders] = useState(() => {
    try {
      const saved = localStorage.getItem(reminderStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      workout: true,
      meals: true,
      hydration: true,
      weekly: true
    };
  });
  const [reminderToast, setReminderToast] = useState(null);

  const handleAddWeight = (e) => {
    e.preventDefault();
    const val = parseFloat(newWeightInput);
    if (!val || val < 30 || val > 300) return;
    const today = new Date().toISOString().split('T')[0];
    const updated = [...weightLogs.filter(w => w.date !== today), { date: today, weight: val }]
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    setWeightLogs(updated);
    localStorage.setItem(weightStorageKey, JSON.stringify(updated));
    setNewWeightInput('');
  };

  const handleDeleteWeight = (dateToDelete) => {
    const updated = weightLogs.filter(w => w.date !== dateToDelete);
    setWeightLogs(updated);
    localStorage.setItem(weightStorageKey, JSON.stringify(updated));
  };

  const toggleReminder = (key) => {
    if (!reminders[key] && 'Notification' in window && Notification.permission === 'default') {
      try { Notification.requestPermission(); } catch {}
    }
    const updated = { ...reminders, [key]: !reminders[key] };
    setReminders(updated);
    localStorage.setItem(reminderStorageKey, JSON.stringify(updated));
    setReminderToast(`Updated ${key.charAt(0).toUpperCase() + key.slice(1)} notification preference`);
    setTimeout(() => setReminderToast(null), 2500);
  };

  useEffect(() => {
    if (selectedBadge) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [selectedBadge]);

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
  const cleanProfession = user.profession && user.profession.toLowerCase() === 'st'
    ? 'Student'
    : (user.profession || 'Athlete');

  const getGoalModeBadge = (goal) => {
    const g = (goal || '').toLowerCase();
    if (g.includes('lose') || g.includes('fat')) return 'Fat loss mode';
    if (g.includes('gain') || g.includes('bulk')) return 'Bulk mode';
    if (g.includes('perform') || g.includes('athletic')) return 'Performance mode';
    return 'Maintenance mode';
  };

  const getGoalSubtitle = (goal) => {
    const g = (goal || '').toLowerCase();
    if (g.includes('lose') || g.includes('fat')) return 'Fat loss goal';
    if (g.includes('gain') || g.includes('bulk')) return 'Muscle gain goal';
    if (g.includes('perform') || g.includes('athletic')) return 'Athletic performance goal';
    return 'Weight maintenance goal';
  };

  const PR_EMPTY_STATES = {
    squat: {
      text: 'Your squat record starts here',
      subtext: 'Complete a Legs day to log your first squat'
    },
    bench: {
      text: 'No bench press record yet',
      subtext: 'Complete a Push day to set your first 1RM'
    },
    deadlift: {
      text: 'No deadlift record yet',
      subtext: 'Complete a Pull day to set your first 1RM'
    },
    press: {
      text: 'No OHP record yet',
      subtext: 'Complete a Push day to set your first 1RM'
    }
  };

  const getNetVelocityColor = (delta, goal) => {
    const g = (goal || '').toLowerCase();
    const isLoss = g.includes('lose') || g.includes('fat');
    const isGain = g.includes('gain') || g.includes('bulk');
    if (isLoss) {
      return delta <= 0 ? 'var(--brand-primary-light, #10B981)' : 'var(--accent-danger, #EF4444)';
    }
    if (isGain) {
      return delta >= 0 ? 'var(--brand-primary-light, #10B981)' : 'var(--accent-danger, #EF4444)';
    }
    const abs = Math.abs(delta);
    if (abs <= 1.0) return 'var(--brand-primary-light, #10B981)';
    if (abs <= 2.0) return '#F5A623';
    return 'var(--accent-danger, #EF4444)';
  };

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
  const currentLoggedWeight = weightLogs[weightLogs.length - 1]?.weight || weightNum;

  const bmi = (weightNum / ((heightNum / 100) ** 2)).toFixed(1);
  const bmiCategory = bmi < 18.5 ? { label: 'Underweight', color: 'var(--accent-carbs-text, #38BDF8)' } :
                      bmi < 24.9 ? { label: 'Normal / Healthy', color: 'var(--brand-primary-light, #10B981)' } :
                      bmi < 29.9 ? { label: 'Overweight', color: 'var(--color-fat, #F5A623)' } :
                      { label: 'Obese', color: 'var(--accent-danger, #EF4444)' };

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
  const totalSets = workoutHistory.reduce((acc, h) => acc + (h.exercises || []).reduce((eAcc, ex) => eAcc + (ex.sets || []).length, 0), 0);

  const centuryProgress = totalSets < 10
    ? `${Math.min(totalSets, 10)}/10 sets (first milestone)`
    : totalSets < 25
    ? `${Math.min(totalSets, 25)}/25 sets (second milestone)`
    : totalSets < 50
    ? `${Math.min(totalSets, 50)}/50 sets (third milestone)`
    : totalSets < 100
    ? `${Math.min(totalSets, 100)}/100 sets`
    : 'Completed';

  // Check food & hydration adherence for badges
  const todayStr = new Date().toISOString().split('T')[0];
  let hasFoodLogs = false;
  let hasWater8Glasses = false;
  try {
    const todayFood = localStorage.getItem(`nutribuddy_foodlogs_${activeUserId}_${todayStr}`);
    if (todayFood && JSON.parse(todayFood).length > 0) hasFoodLogs = true;
    const todayWater = parseInt(localStorage.getItem(`water_${user?.id || 'demo'}_${todayStr}`) || '0', 10);
    if (todayWater >= 8) hasWater8Glasses = true;
  } catch {}

  const hasBodyweightPR = Object.values(prHallOfFame).some(pr => pr.weight >= weightNum);

  const badges = [
    {
      id: 'first_step',
      name: 'First Step',
      category: 'Nutrition',
      description: 'Logged your first meal of your nutrition journey.',
      icon: Utensils,
      color: '#10B981',
      isUnlocked: true,
      progress: 'Completed',
      quote: 'The journey of a thousand miles begins with a single meal logged.'
    },
    {
      id: 'consistency_starter',
      name: 'Consistency Starter',
      category: 'Habits',
      description: 'Maintained an active athletic streak of at least 3 days.',
      icon: Flame,
      color: '#F59E0B',
      isUnlocked: currentStreak >= 3,
      progress: `${Math.min(currentStreak, 3)}/3 days`,
      quote: 'Consistency isn’t about perfection; it’s about never letting a zero day pass.'
    },
    {
      id: 'iron_initiate',
      name: 'Iron Initiate',
      category: 'Strength',
      description: 'Completed and recorded your first workout session.',
      icon: Activity,
      color: '#818CF8',
      isUnlocked: totalWorkouts >= 1,
      progress: `${Math.min(totalWorkouts, 1)}/1 session`,
      quote: 'Every master was once a beginner who refused to quit.'
    },
    {
      id: 'century_club',
      name: 'Century Club',
      category: 'Volume',
      description: 'Accumulated 100 lifetime training sets across workouts.',
      icon: Trophy,
      color: '#38BDF8',
      isUnlocked: totalSets >= 100,
      progress: totalSets >= 100 ? 'Completed' : centuryProgress,
      quote: 'Hundred sets of focused effort forge real athletic discipline.'
    },
    {
      id: 'macro_master',
      name: 'Macro Master',
      category: 'Nutrition',
      description: 'Targeted and tracked daily protein requirements.',
      icon: Award,
      color: '#34D399',
      isUnlocked: hasFoodLogs,
      progress: hasFoodLogs ? 'Target met' : 'Log meals',
      quote: 'Protein is the biological foundation of muscular recovery.'
    },
    {
      id: 'heavy_hitter',
      name: 'Heavy Hitter',
      category: 'Strength',
      description: 'Achieved a Big 4 lift weight equal to or above bodyweight.',
      icon: Sparkles,
      color: '#EC4899',
      isUnlocked: hasBodyweightPR,
      progress: hasBodyweightPR ? 'Achieved' : `Target: ${weightNum} kg`,
      quote: 'Moving your own bodyweight under the barbell is a milestone of true strength.'
    },
    {
      id: 'hydration_hero',
      name: 'Hydration Hero',
      category: 'Wellness',
      description: 'Recorded 8 or more glasses of water in a single day.',
      icon: Droplets,
      color: '#06B6D4',
      isUnlocked: hasWater8Glasses,
      progress: hasWater8Glasses ? '8/8 glasses' : 'Check dashboard',
      quote: 'Cellular hydration powers peak muscular contraction and energy.'
    },
    {
      id: 'week_warrior',
      name: 'Week Warrior',
      category: 'Habits',
      description: 'Completed 4+ scheduled training sessions in a week.',
      icon: Zap,
      color: '#F97316',
      isUnlocked: totalWorkouts >= 4,
      progress: `${Math.min(totalWorkouts, 4)}/4 sessions`,
      quote: 'When your weekly routine becomes non-negotiable, results become inevitable.'
    },
    {
      id: 'budget_gourmet',
      name: 'Budget Gourmet',
      category: 'Lifestyle',
      description: 'Optimized meal planning with high-protein grocery economics.',
      icon: Shield,
      color: '#A855F7',
      isUnlocked: true,
      progress: 'Active',
      quote: 'Elite nutrition doesn’t require luxury budgets—only disciplined choices.'
    },
    {
      id: 'iron_dedication',
      name: 'Iron Dedication',
      category: 'Mastery',
      description: 'Maintained a 14-day streak or completed 20+ workouts.',
      icon: Trophy,
      color: '#EAB308',
      isUnlocked: currentStreak >= 14 || totalWorkouts >= 20,
      progress: `${Math.max(currentStreak, totalWorkouts)}/14 milestone`,
      quote: 'Dedication is doing what needs to be done even when the motivation fades.'
    }
  ];

  const macros = [
    { label: 'Calories', value: user.dailyCalories ? `${user.dailyCalories} kcal` : '—', color: 'var(--color-green, #22D17A)' },
    { label: 'Protein',  value: user.targetProtein  ? `${user.targetProtein}g`   : '—', color: 'var(--color-protein, #5B8AF5)' },
    { label: 'Carbs',    value: user.targetCarbs    ? `${user.targetCarbs}g`     : '—', color: 'var(--color-carb, #22D17A)' },
    { label: 'Fats',     value: user.targetFat      ? `${user.targetFat}g`       : '—', color: 'var(--color-fat, #F5A623)' },
  ];

  /* ─── Shared style tokens ─── */
  const card = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-card)',
    padding: '24px 28px',
    boxShadow: 'var(--shadow-card)',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
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
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18, paddingBottom: 40 }}>

      {/* ── HERO PROFILE CARD ── */}
      <div
        className="nb-card"
        style={{
          background: 'linear-gradient(135deg, #141820 0%, #1a1e2a 100%)',
          border: '0.5px solid var(--border-accent)',
          borderRadius: 20,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}
      >
        {/* Top: Avatar + Name + Dynamic Goal text + Edit Profile Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Avatar: 64×64px circle, --color-green background, 24px initials, weight 800 */}
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--color-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#0a1a10',
              fontFamily: 'var(--font-heading)',
              fontSize: 24,
              fontWeight: 800
            }}>
              {initial}
            </div>

            {/* User details */}
            <div style={{ minWidth: 0 }}>
              {/* Badge (dynamic goal text): above name, 10px weight 700, --color-green, letter-spacing 0.08em — no background */}
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--color-green)',
                letterSpacing: '0.08em',
                marginBottom: 2
              }}>
                {getGoalModeBadge(user.goal)}
              </div>
              <h1 style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em'
              }}>
                {toTitleCase(user.fullName || '')}
              </h1>
              <div style={{
                marginTop: 4,
                fontSize: 13,
                color: 'var(--text-secondary)'
              }}>
                {cleanProfession} · {getGoalSubtitle(user.goal)}
              </div>
            </div>
          </div>

          {/* Edit Profile button: secondary style, 36px height */}
          <button
            onClick={onEdit}
            className="nb-btn-secondary"
            style={{
              height: 36,
              padding: '0 16px',
              fontSize: 12,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Edit profile
          </button>
        </div>

        {/* Stats row below name (3 columns): [Calorie target] [Daily protein] [BMI] */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          paddingTop: 16,
          borderTop: '0.5px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{ background: 'var(--color-raised)', padding: '12px 16px', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              {user.dailyCalories ? `${user.dailyCalories} kcal` : '—'}
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginTop: 4 }}>
              Calorie target
            </div>
          </div>

          <div style={{ background: 'var(--color-raised)', padding: '12px 16px', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              {user.targetProtein ? `${user.targetProtein}g` : '—'}
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginTop: 4 }}>
              Daily protein
            </div>
          </div>

          <div style={{ background: 'var(--color-raised)', padding: '12px 16px', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              {bmi}
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginTop: 4 }}>
              BMI
            </div>
          </div>
        </div>
      </div>

      {/* Section Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 6px' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
          Profile sections
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={expandAll}
            style={{ background: 'none', border: 'none', color: 'var(--brand-primary-light)', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', padding: 0 }}
          >
            Expand All
          </button>
          <span style={{ color: 'var(--border-subtle)' }}>·</span>
          <button
            onClick={collapseAll}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', padding: 0 }}
          >
            Collapse All
          </button>
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
            <div className="mobile-2col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '14px 16px' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Biological sex</span>
                <div style={{ fontSize: 17, fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', textTransform: 'capitalize', marginTop: 4 }}>
                  {user.gender || '—'}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '14px 16px' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Age</span>
                <div style={{ fontSize: 17, fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginTop: 4 }}>
                  {user.age ? `${user.age} yrs` : '—'}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '14px 16px' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Height</span>
                <div style={{ fontSize: 17, fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginTop: 4 }}>
                  {user.height ? `${user.height} cm` : '—'}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '14px 16px' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Body weight</span>
                <div style={{ fontSize: 17, fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginTop: 4 }}>
                  {user.weight ? `${user.weight} kg` : '—'}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '14px 16px' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Body mass index</span>
                <div style={{ fontSize: 17, fontWeight: 900, color: bmiCategory.color, marginTop: 4 }}>
                  {bmi} <span style={{ fontSize: 11, fontWeight: 700 }}>({bmiCategory.label})</span>
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '14px 16px' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Basal metabolism</span>
                <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-primary)', marginTop: 4 }}>
                  ~{bmr.toLocaleString()} kcal
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
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-primary-subtle)', color: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Personal Records (PR) Hall of Fame
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                All-time compound strength achievements & estimated 1RMs
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary-light)', background: 'var(--brand-primary-subtle)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-focus)' }}>
              Big 4 movements
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
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-panel)',
                      padding: 16,
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <span style={{ fontSize: 10, color: pattern.iconColor, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 800, letterSpacing: '0.04em', marginBottom: 6 }}>
                        <Award size={12} /> {pattern.label}
                      </span>
                      <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {pr.weight} kg <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)' }}>× {pr.reps}</span>
                      </div>
                      <span className="tabular-nums" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Est. 1RM: <strong>{pr.est1RM} kg</strong> · {new Date(pr.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  );
                }
                const empty = PR_EMPTY_STATES[pattern.key] || {
                  text: 'No record logged yet',
                  subtext: 'Complete a workout session to set your first PR'
                };
                return (
                  <div key={pattern.key} style={{
                    background: 'var(--bg-surface-raised)',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-panel)',
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 120
                  }}>
                    <div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', fontWeight: 800, marginBottom: 6 }}>
                        {pattern.label}
                      </span>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {empty.text}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.3 }}>
                        {empty.subtext}
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentPage && setCurrentPage('exercise')}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        marginTop: 10,
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: 'var(--brand-primary-light, #10B981)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      → Start a workout
                    </button>
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
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-primary-subtle)', color: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Utensils size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Nutrition Target Blueprint & Constraints
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                Macronutrient distribution, dietary style, and allergy controls
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary-light)', background: 'var(--brand-primary-subtle)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-focus)' }}>
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
              <div style={{ background: 'var(--bg-surface-raised)', padding: 14, borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Fitness goal</span>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                  {getGoalLabel(user.goal)}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface-raised)', padding: 14, borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Activity level</span>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                  {getActivityLabel(user.activityLevel)}
                </div>
              </div>
            </div>

            {/* Macro targets (2x2 on mobile, 4-col on desktop) */}
            <div className="profile-stats-grid mobile-2col-grid" style={{ gap: 10, marginBottom: 16 }}>
              {macros.map(({ label, value, color }) => (
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
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>{label}</span>
                  <div className="tabular-nums" style={{
                    fontSize: 18,
                    fontWeight: 800,
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
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Dietary style</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, textTransform: 'capitalize' }}>
                  {user.dietaryPreferences || 'No specific restrictions'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Regional cuisine</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, textTransform: 'capitalize' }}>
                  {user.cuisinePreference === 'rajasthani' ? 'Rajasthani' :
                   user.cuisinePreference === 'bengali' ? 'Bengali' :
                   user.cuisinePreference === 'gujarati' ? 'Gujarati' :
                   user.cuisinePreference === 'north' ? 'North Indian & Punjabi' :
                   user.cuisinePreference === 'south' ? 'South Indian' :
                   user.cuisinePreference === 'west' ? 'Maharashtrian' :
                   user.cuisinePreference === 'east' ? 'East Indian' : 'Universal Pan-Indian'}
                </div>
              </div>
            </div>

            <div className="form-grid-2" style={{ marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Cooking experience</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, textTransform: 'capitalize' }}>
                  {user.cookingSkill === 'no-cook' ? 'Beginner / Quick Prep' : (user.cookingSkill || 'Intermediate')}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Monthly budget</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, textTransform: 'capitalize' }}>
                  {user.budgetRange === 'tight' ? 'Tight (₹3k - ₹5k)' :
                   user.budgetRange === 'moderate' ? 'Moderate (₹5k - ₹10k)' :
                   user.budgetRange === 'flexible' ? 'Flexible (₹10k - ₹15k)' : 'Premium (₹15k+)'}
                </div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Allergy safeguards</span>
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
                        borderRadius: 'var(--radius-sm)',
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
                      color: 'var(--brand-primary-light, #10B981)',
                      background: 'var(--brand-primary-subtle)',
                      border: '1px solid var(--border-focus)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px 10px',
                    }}
                  >
                    No known allergies
                  </span>
                )}
              </div>
            </div>

            {/* Step-by-Step Calorie Calculation Engine Breakdown */}
            {(() => {
              const breakdown = getDetailedCalorieBreakdown(user);
              if (!breakdown) return null;
              return (
                <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Calculator size={15} color="var(--brand-primary-light)" />
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary-light)', letterSpacing: '0.04em' }}>
                      How your calorie target is calculated
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ background: 'var(--bg-surface-raised)', padding: '12px 14px', borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
                        <span>1. Basal Metabolic Rate (BMR)</span>
                        <span className="tabular-nums" style={{ color: 'var(--brand-primary-light)' }}>{breakdown.bmr} kcal/day</span>
                      </div>
                      <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {breakdown.bmrFormula}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface-raised)', padding: '12px 14px', borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
                        <span>2. Maintenance Expenditure (TDEE)</span>
                        <span className="tabular-nums" style={{ color: 'var(--accent-carbs-text, #38BDF8)' }}>{breakdown.tdee} kcal/day</span>
                      </div>
                      <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        BMR ({breakdown.bmr}) × PAL ({Number(breakdown.totalPAL).toFixed(2)} = {Number(breakdown.neatFactor).toFixed(2)} NEAT + {(breakdown.eatDays * 0.05).toFixed(2)} EAT)
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface-raised)', padding: '12px 14px', borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
                        <span>3. Target Goal Intake</span>
                        <span className="tabular-nums" style={{ color: 'var(--brand-primary-light, #10B981)' }}>{breakdown.targetCalories} kcal/day</span>
                      </div>
                      <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        TDEE ({breakdown.tdee}) {breakdown.calorieDelta >= 0 ? '+' : ''}{breakdown.calorieDelta} kcal adjustment for {user.goal || 'maintenance'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        )}
      </div>

      {/* ── SECTION 4: LIFETIME ATHLETIC TRAINING & ACTIVITY (Collapsible Dropdown) ── */}
      <div style={card}>
        <button onClick={() => toggleSection('activity')} style={sectionHeaderBtn(openSections.activity)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-primary-subtle)', color: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Lifetime Athletic Training & History
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                Total training volume, workout logs, and consistency records
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary-light)', background: 'var(--brand-primary-subtle)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-focus)' }}>
              {totalWorkouts} Workouts Logged
            </span>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              {openSections.activity ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </button>

        {openSections.activity && (
          <div className="fadeInUp" style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border-subtle)' }}>
            <div className="mobile-2col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
              <div style={{ background: 'var(--bg-surface-raised)', padding: 14, borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Total sessions</span>
                <div className="tabular-nums" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>{totalWorkouts} logs</div>
              </div>

              <div style={{ background: 'var(--bg-surface-raised)', padding: 14, borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Lifetime volume</span>
                <div className="tabular-nums" style={{ fontSize: 20, fontWeight: 800, color: 'var(--brand-primary-light)', marginTop: 4 }}>{totalVolumeKg.toLocaleString()} kg</div>
              </div>

              <div style={{ background: 'var(--bg-surface-raised)', padding: 14, borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Active streak</span>
                {currentStreak === 0 ? (
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('exercise')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--brand-primary-light)',
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginTop: 4,
                      display: 'block'
                    }}
                  >
                    Start your first workout →
                  </button>
                ) : (
                  <div className="tabular-nums" style={{ fontSize: 20, fontWeight: 800, color: 'var(--brand-primary-light)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Flame size={16} fill="var(--brand-primary-light)" /> {currentStreak} Sessions
                  </div>
                )}
              </div>

              <div style={{ background: 'var(--bg-surface-raised)', padding: 14, borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-subtle)', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Streak shield</span>
                  <button
                    type="button"
                    onClick={() => setShowShieldTooltip(prev => !prev)}
                    title="Streak Shield info"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      color: 'var(--text-muted)'
                    }}
                  >
                    <Info size={12} />
                  </button>
                </div>
                {showShieldTooltip && (
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    right: 0,
                    marginBottom: 6,
                    background: 'var(--bg-surface, #0D1117)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm, 8px)',
                    padding: '8px 12px',
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.4,
                    width: 220,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                    zIndex: 10
                  }}>
                    Streak Shield protects your streak if you miss one day. Earn it by maintaining a 7-day streak.
                  </div>
                )}
                <div style={{ fontSize: 13, fontWeight: 800, color: streakShield ? 'var(--brand-primary-light)' : 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={15} /> {streakShield ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>

            {/* Recent Workouts Log preview */}
            {workoutHistory.length > 0 && (
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  Recent training archive
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {workoutHistory.slice(0, 3).map((session, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        padding: '10px 14px',
                        background: 'var(--bg-surface-raised)',
                        borderRadius: 'var(--radius-panel)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 12
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{session.workoutName}</span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                          {new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <span className="tabular-nums" style={{ fontWeight: 800, color: 'var(--brand-primary-light)' }}>
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

      {/* ── SECTION 5: BODYWEIGHT HISTORY & VELOCITY TREND (Collapsible Dropdown) ── */}
      <div style={card}>
        <button onClick={() => toggleSection('weightHistory')} style={sectionHeaderBtn(openSections.weightHistory)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(56, 189, 248, 0.12)', color: 'var(--accent-carbs-text, #38BDF8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scale size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Bodyweight History & Trend
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                Weigh-in velocity curve, net delta, and progress logging
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-carbs-text, #38BDF8)', background: 'rgba(56, 189, 248, 0.12)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              {weightLogs.length} Entries
            </span>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              {openSections.weightHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </button>

        {openSections.weightHistory && (
          <div className="fadeInUp" style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border-subtle)' }}>
            {/* Stat Summary Cards */}
            {(() => {
              const startW = weightLogs[0]?.weight || weightNum;
              const curW = weightLogs[weightLogs.length - 1]?.weight || weightNum;
              const netDelta = +(curW - startW).toFixed(1);

              return (
                <div className="mobile-2col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                  <div style={{ background: 'var(--bg-surface-raised)', padding: 14, borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Start weight</span>
                    <div className="tabular-nums" style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                      {startW} <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>kg</span>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-surface-raised)', padding: 14, borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Current weight</span>
                    <div className="tabular-nums" style={{ fontSize: 19, fontWeight: 800, color: 'var(--brand-primary-light)', marginTop: 4 }}>
                      {curW} <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>kg</span>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-surface-raised)', padding: 14, borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>Net velocity</span>
                    <div className="tabular-nums" style={{ fontSize: 19, fontWeight: 800, color: getNetVelocityColor(netDelta, user.goal), marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {netDelta < 0 ? <TrendingDown size={16} /> : netDelta > 0 ? <TrendingUp size={16} /> : null}
                      {netDelta > 0 ? `+${netDelta}` : netDelta} kg
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Quick Weigh-In Input Form */}
            <form onSubmit={handleAddWeight} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  value={newWeightInput}
                  onChange={(e) => setNewWeightInput(e.target.value)}
                  placeholder={'e.g. ' + (currentLoggedWeight + 0.1).toFixed(1)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-panel)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-raised)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    outline: 'none'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!newWeightInput}
                style={{
                  padding: '0 18px',
                  borderRadius: 'var(--radius-panel)',
                  background: newWeightInput ? 'var(--brand-primary)' : 'var(--bg-surface-raised)',
                  color: newWeightInput ? '#04100B' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: 13,
                  border: 'none',
                  cursor: newWeightInput ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <Plus size={16} /> Log Today
              </button>
            </form>

            {/* Pure SVG Line Chart */}
            <div style={{ marginBottom: 18 }}>
              <WeightTrendChart logs={weightLogs} targetWeight={user.targetWeight || null} goal={user.goal} />
            </div>

            {/* Recent Weigh-ins Log List */}
            {weightLogs.length > 0 && (
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  Recent weigh-in logs
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[...weightLogs].reverse().slice(0, 5).map((log) => {
                    const chronoIdx = weightLogs.findIndex(w => w.date === log.date);
                    const prevInChronology = chronoIdx > 0 ? weightLogs[chronoIdx - 1] : null;
                    const diff = prevInChronology ? +(log.weight - prevInChronology.weight).toFixed(1) : null;
                    const diffColor = diff === null ? 'var(--text-muted)' :
                      (user.goal === 'lose' || user.goal === 'fat_loss') ? (diff <= 0 ? 'var(--brand-primary-light)' : 'var(--accent-danger, #EF4444)') :
                      (user.goal === 'gain' || user.goal === 'lean_bulk' || user.goal === 'aggressive_bulk') ? (diff >= 0 ? 'var(--brand-primary-light)' : 'var(--accent-danger, #EF4444)') :
                      (Math.abs(diff) <= 0.2 ? 'var(--brand-primary-light)' : '#F5A623');
                    return (
                      <div
                        key={log.date}
                        style={{
                          padding: '8px 12px',
                          background: 'var(--bg-surface-raised)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: 12
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span className="tabular-nums" style={{ fontSize: 11, fontWeight: 700, color: diffColor }}>
                            {diff === null ? '—' : (diff > 0 ? `+${diff} kg` : `${diff} kg`)}
                          </span>
                          <span className="tabular-nums" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                            {log.weight} kg
                          </span>
                          {weightLogs.length > 1 && (
                            <button
                              onClick={() => handleDeleteWeight(log.date)}
                              title="Delete entry"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: 2,
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── SECTION 6: MILESTONE BADGES & HONOURS (Collapsible Dropdown) ── */}
      <div style={card}>
        <button onClick={() => toggleSection('badges')} style={sectionHeaderBtn(openSections.badges)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(234, 179, 8, 0.12)', color: '#EAB308', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Milestone Badges & Honours
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                10 dynamically evaluated achievements based on your actual training & nutrition
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#EAB308', background: 'rgba(234, 179, 8, 0.12)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
              {badges.filter(b => b.isUnlocked).length}/10 Unlocked
            </span>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              {openSections.badges ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </button>

        {openSections.badges && (
          <div className="fadeInUp" style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10
            }}>
              {badges.map((badge) => {
                const IconComponent = badge.icon;
                const isUnlocked = badge.isUnlocked;

                return (
                  <button
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    style={{
                      background: isUnlocked ? 'rgba(34, 209, 122, 0.08)' : '#141820',
                      border: isUnlocked ? '1px solid rgba(34, 209, 122, 0.25)' : '0.5px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: 16,
                      padding: '16px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    className={isUnlocked ? 'badge-unlock-anim' : ''}
                  >
                    {/* Icon: 32px */}
                    <div style={{
                      color: isUnlocked ? 'var(--color-green)' : 'var(--text-muted)',
                      opacity: isUnlocked ? 1 : 0.25,
                      filter: isUnlocked ? 'none' : 'grayscale(100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 2
                    }}>
                      <IconComponent size={32} />
                    </div>

                    <div style={{ fontSize: 10, fontWeight: 700, color: isUnlocked ? 'var(--color-green)' : 'var(--text-muted)', letterSpacing: '0.08em' }}>
                      {badge.category}
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 600, color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: 1.2 }}>
                      {badge.name}
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                      {isUnlocked ? (
                        <span style={{
                          fontSize: 9,
                          fontWeight: 700,
                          background: 'rgba(34, 209, 122, 0.15)',
                          color: '#22d17a',
                          borderRadius: 4,
                          padding: '2px 6px',
                          display: 'inline-block'
                        }}>
                          Achieved
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {badge.progress}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 7: SMART REMINDERS & NOTIFICATION SYNC (Collapsible Dropdown) ── */}
      <div style={card}>
        <button onClick={() => toggleSection('reminders')} style={sectionHeaderBtn(openSections.reminders)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(168, 85, 247, 0.12)', color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Smart Notifications & Routine Sync
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                Push prompts for workouts, meals, hydration, and weekly reviews
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#A855F7', background: 'rgba(168, 85, 247, 0.12)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
              {Object.values(reminders).filter(Boolean).length}/4 Active
            </span>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              {openSections.reminders ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </button>

        {openSections.reminders && (
          <div className="fadeInUp" style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                {
                  key: 'workout',
                  icon: Activity,
                  title: 'Daily Workout Push',
                  desc: 'Daily prompt at 7:00 AM to keep your athletic streak alive'
                },
                {
                  key: 'meals',
                  icon: Utensils,
                  title: 'Meal Logging Check-In',
                  desc: 'Gentle nudge 30 min after standard breakfast, lunch, and dinner'
                },
                {
                  key: 'hydration',
                  icon: Droplets,
                  title: 'Hydration Water Pings',
                  desc: 'Smart reminders when no water logged (every 2 hours, 10 AM–6 PM)'
                },
                {
                  key: 'weekly',
                  icon: LineChart,
                  title: 'Sunday Progress Digest',
                  desc: 'Weekly summary of volume load, calorie adherence, and PR progression'
                }
              ].map((item) => {
                const ItemIcon = item.icon;
                const isEnabled = !!reminders[item.key];
                return (
                  <div
                    key={item.key}
                    style={{
                      padding: '12px 16px',
                      background: 'var(--bg-surface-raised)',
                      borderRadius: 'var(--radius-panel)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: isEnabled ? 'var(--brand-primary-subtle)' : 'var(--bg-surface)',
                        color: isEnabled ? 'var(--brand-primary-light)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ItemIcon size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    {/* iOS-style toggle switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isEnabled}
                      onClick={() => toggleReminder(item.key)}
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        background: isEnabled ? 'var(--brand-primary)' : 'var(--border-subtle)',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        padding: 2,
                        flexShrink: 0,
                        transition: 'background 0.2s ease',
                        outline: 'none'
                      }}
                    >
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        transform: isEnabled ? 'translateX(20px)' : 'translateX(0)',
                        transition: 'transform 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 8: ACCOUNT & SETTINGS ── */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              Account & Settings
            </h3>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
              Session controls and app references
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            padding: '14px 16px',
            background: 'var(--bg-surface-raised)',
            borderRadius: 'var(--radius-panel)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                {toTitleCase(user.fullName || 'User')}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {user.email || 'Active member'}
              </div>
            </div>
            <button
              onClick={onLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#EF4444',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </div>

        {/* Relocated Footer */}
        <footer style={{
          marginTop: 24, paddingTop: 16,
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Nutri<span style={{ color: 'var(--accent-lime-text, #10B981)' }}>Buddy</span>
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· Health Companion</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            Trackers · Budget Planner · Gym Logs
          </div>
        </footer>
      </div>

      {/* ── MILESTONE BADGE DETAIL MODAL (Portal) ── */}
      {selectedBadge && createPortal(
        <div
          onClick={() => setSelectedBadge(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 400,
              width: '100%',
              background: 'var(--bg-surface, #0D1117)',
              border: `1px solid ${selectedBadge.isUnlocked ? selectedBadge.color : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-card, 16px)',
              padding: 24,
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              textAlign: 'center'
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedBadge(null)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>

            {/* Badge large icon */}
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: selectedBadge.isUnlocked ? `${selectedBadge.color}25` : 'var(--bg-surface-raised)',
              color: selectedBadge.isUnlocked ? selectedBadge.color : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: `2px solid ${selectedBadge.isUnlocked ? selectedBadge.color : 'var(--border-subtle)'}`
            }}>
              {React.createElement(selectedBadge.icon, { size: 36 })}
            </div>

            {/* Title & category */}
            <div style={{ fontSize: 11, fontWeight: 800, color: selectedBadge.color, letterSpacing: '0.04em' }}>
              {selectedBadge.category} • Milestone
            </div>
            <h3 style={{ margin: '6px 0 10px', fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {selectedBadge.name}
            </h3>

            {/* Unlock Status Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 20,
              background: selectedBadge.isUnlocked ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              border: `1px solid ${selectedBadge.isUnlocked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              fontSize: 11,
              fontWeight: 800,
              color: selectedBadge.isUnlocked ? 'var(--brand-primary-light)' : '#F59E0B',
              marginBottom: 16
            }}>
              {selectedBadge.isUnlocked ? <CheckCircle2 size={14} /> : <Lock size={14} />}
              {selectedBadge.isUnlocked ? 'Unlocked & Achieved' : `In Progress • ${selectedBadge.progress}`}
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px' }}>
              {selectedBadge.description}
            </p>

            {/* Motivational quote */}
            <div style={{
              background: 'var(--bg-surface-raised)',
              borderLeft: `3px solid ${selectedBadge.color}`,
              padding: '10px 14px',
              borderRadius: '0 8px 8px 0',
              textAlign: 'left',
              fontSize: 11,
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              lineHeight: 1.4,
              marginBottom: 20
            }}>
              "{selectedBadge.quote}"
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: 'var(--radius-panel)',
                background: selectedBadge.isUnlocked ? 'var(--brand-primary)' : 'var(--bg-surface-raised)',
                color: selectedBadge.isUnlocked ? '#04100B' : 'var(--text-primary)',
                border: 'none',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {reminderToast && createPortal(
        <div
          className="fadeInUp"
          style={{
            position: 'fixed',
            bottom: 'calc(80px + env(safe-area-inset-bottom))',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-surface-raised, #161A22)',
            border: '1px solid var(--border-focus, #10B981)',
            color: 'var(--text-primary, #FFFFFF)',
            padding: '10px 18px',
            borderRadius: 24,
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            zIndex: 999999,
            whiteSpace: 'nowrap'
          }}
        >
          <Check size={14} color="var(--brand-primary-light, #10B981)" />
          {reminderToast}
        </div>,
        document.body
      )}

    </div>
  );
}

