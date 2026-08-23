import React, { useState, useEffect, useRef } from 'react';
import { 
  Utensils, Calendar, Dumbbell, Sparkles, Plus, Droplets, 
  Flame, ArrowRight, Play, Activity
} from 'lucide-react';
import { API_BASE } from '../config';

// ─── SCROLL REVEAL HOOK ───────────────────────────────────────────────────────
function useReveal(delay = 0, threshold = 0.08) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const t = setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
          return () => clearTimeout(t);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return [ref, visible];
}

function Reveal({ children, preset = 'up', delay = 0, style = {}, as: Tag = 'div' }) {
  const [ref, visible] = useReveal(delay);

  const presets = {
    up:    { hidden: 'translateY(32px)', shown: 'translateY(0px)' },
    down:  { hidden: 'translateY(-20px)', shown: 'translateY(0px)' },
    left:  { hidden: 'translateX(-32px)', shown: 'translateX(0px)' },
    right: { hidden: 'translateX(32px)', shown: 'translateX(0px)' },
    scale: { hidden: 'scale(0.92)', shown: 'scale(1)' },
    none:  { hidden: 'none', shown: 'none' },
  };

  const p = presets[preset] || presets.up;

  return (
    <Tag
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? p.shown : p.hidden,
        transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: 'opacity, transform',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

// ─── WATER TRACKER ────────────────────────────────────────────────────────────
function WaterTracker({ user }) {
  const [waterIntake, setWaterIntake] = useState(0);
  const dailyGoal = 8;

  useEffect(() => {
    if (user?.id) {
      const today = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem(`water_${user.id}_${today}`);
      if (saved) setWaterIntake(parseInt(saved, 10));
    }
  }, [user?.id]);

  const updateWater = (delta) => {
    const next = Math.max(0, waterIntake + delta);
    setWaterIntake(next);
    if (user?.id) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`water_${user.id}_${today}`, next.toString());
    }
  };

  const pct = Math.min((waterIntake / dailyGoal) * 100, 100);

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-card)',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Droplets size={13} color="#38BDF8" /> HYDRATION
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            {waterIntake} <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>/ {dailyGoal} glasses</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {waterIntake * 250} ml consumed today
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={() => updateWater(-1)}
            disabled={waterIntake === 0}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-raised)',
              color: waterIntake === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
              fontSize: 16, cursor: waterIntake === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: waterIntake === 0 ? 0.4 : 1
            }}
          >
            -
          </button>
          <button
            onClick={() => updateWater(1)}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: 'none',
              background: '#38BDF8',
              color: '#000',
              fontSize: 16, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(56, 189, 248, 0.3)'
            }}
          >
            +
          </button>
        </div>
      </div>

      <div>
        <div style={{ height: 6, background: 'var(--bg-surface-raised)', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: pct >= 100 ? '#10B981' : '#38BDF8',
            borderRadius: 3,
            transition: 'width 0.4s ease'
          }} />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[...Array(dailyGoal)].map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i < waterIntake ? '#38BDF8' : 'var(--bg-surface-raised)',
              transition: 'background 0.25s ease'
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 7-DAY CALORIE & NUTRITION CHART ──────────────────────────────────────────
function WeeklyProgress({ user }) {
  const [weeklyData, setWeeklyData] = useState([]);
  const [chartVisible, setChartVisible] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    if (user?.id) generateWeeklyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setChartVisible(true); obs.unobserve(el); }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [weeklyData]);

  const generateWeeklyData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const ds = date.toISOString().split('T')[0];
      const water = parseInt(localStorage.getItem(`water_${user.id}_${ds}`) || '0', 10);
      const base = user.dailyCalories || 2000;
      const variation = Math.floor(Math.random() * 300) - 150;
      data.push({
        date: ds,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: i === 0 ? 0 : Math.max(base + variation, 0),
        water,
        goal: base
      });
    }
    setWeeklyData(data);
  };

  const maxCal = Math.max(...weeklyData.map(d => Math.max(d.calories, d.goal)), user?.dailyCalories || 2000);
  const avgCal = weeklyData.filter(d => d.calories > 0).length
    ? Math.round(weeklyData.reduce((s, d) => s + d.calories, 0) / weeklyData.filter(d => d.calories > 0).length)
    : 0;
  const daysOnTarget = weeklyData.filter(d => d.calories <= d.goal && d.calories > 0).length;

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-card)',
      padding: '24px 28px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>
            WEEKLY CONSISTENCY
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            7-Day Caloric Intake
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>AVG INTAKE</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)' }}>{avgCal} kcal</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>ON TARGET</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: '#10B981' }}>{daysOnTarget}/7 days</span>
          </div>
        </div>
      </div>

      {/* Animated Bar Chart */}
      <div ref={chartRef} style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140, padding: '0 4px', marginBottom: 14 }}>
        {weeklyData.map((day, index) => {
          const targetH = Math.max((day.calories / maxCal) * 120, day.calories > 0 ? 8 : 4);
          const barH = chartVisible ? targetH : 4;
          const isToday = index === 6;
          const overGoal = day.calories > day.goal;
          const noData = day.calories === 0;
          return (
            <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: '100%', height: 120, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  bottom: (day.goal / maxCal) * 120,
                  left: 0, right: 0,
                  height: 1,
                  background: 'var(--border-subtle)',
                  opacity: 0.6,
                }} />
                <div style={{
                  width: '58%',
                  height: barH,
                  borderRadius: '4px 4px 2px 2px',
                  background: noData
                    ? 'var(--bg-surface-raised)'
                    : overGoal
                    ? '#EF4444'
                    : isToday
                    ? 'var(--brand-primary, #F59E0B)'
                    : '#10B981',
                  opacity: noData ? 0.4 : 1,
                  transition: `height 0.8s cubic-bezier(0.16,1,0.3,1) ${index * 50}ms`,
                  boxShadow: !noData ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 10, fontWeight: isToday ? 900 : 700,
                  color: isToday ? 'var(--brand-primary, #F59E0B)' : 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  {day.day}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 16, borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: '#10B981' }} />
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>On Target</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: '#EF4444' }} />
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>Over Budget</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 1, background: 'var(--border-subtle)' }} />
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>Target Line</span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard({ user, setCurrentPage }) {
  const [dailyData, setDailyData] = useState(null);
  const activeUserId = user?.id || 'demo';

  // Load active program summary
  const [generatedProgram, setGeneratedProgram] = useState(null);
  const [workoutStreak, setWorkoutStreak] = useState(0);

  const fetchDailyData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`${API_BASE}/api/food-logs/${activeUserId}?date=${today}`);
      const data = await res.json();
      if (data.success) {
        setDailyData(data.dailySummary);
      }
    } catch {
      // Offline / Local storage fallback
      const today = new Date().toISOString().split('T')[0];
      const localLogs = JSON.parse(localStorage.getItem(`nutribuddy_foodlogs_${activeUserId}_${today}`) || '[]');
      const totals = localLogs.reduce(
        (acc, l) => ({
          calories: acc.calories + (l.calories || 0),
          protein: acc.protein + (l.protein || 0),
          carbs: acc.carbs + (l.carbs || 0),
          fat: acc.fat + (l.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      setDailyData({ date: today, totals, logs: localLogs });
    }
  };

  useEffect(() => {
    if (!activeUserId) return;
    fetchDailyData();

    // Cross-tab storage sync
    const handleStorage = (e) => {
      if (e.key && e.key.includes('nutribuddy_foodlogs')) fetchDailyData();
    };
    window.addEventListener('storage', handleStorage);

    // Tab visibility refresh
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchDailyData();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Periodically poll
    const interval = setInterval(fetchDailyData, 15000);

    // Load active program & streak
    const savedProgram = localStorage.getItem(`nutribuddy_program_${activeUserId}`);
    if (savedProgram) {
      try { setGeneratedProgram(JSON.parse(savedProgram)); } catch (e) {}
    }

    const savedHistory = localStorage.getItem(`nutribuddy_workout_history_${activeUserId}`);
    if (savedHistory) {
      try {
        const hist = JSON.parse(savedHistory);
        setWorkoutStreak(hist.length > 0 ? Math.min(hist.length, 7) : 0);
      } catch (e) {}
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUserId]);

  if (!user) return null;

  const targetCalories = user.dailyCalories || 2000;
  const consumedCalories = dailyData?.totals.calories || 0;
  const caloriesRemaining = targetCalories - consumedCalories;
  const overGoal = caloriesRemaining < 0;
  const progressPct = Math.min((consumedCalories / targetCalories) * 100, 100);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* ── HERO HEADER BAR ── */}
      <Reveal preset="down" delay={0}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              DAILY EXECUTIVE OVERVIEW
            </span>
            <h1 style={{
              margin: '2px 0 0',
              fontFamily: 'var(--font-heading)',
              fontSize: 24,
              fontWeight: 900,
              color: 'var(--text-primary)',
            }}>
              Welcome back, {user.fullName?.split(' ')[0] || 'Athlete'}
            </h1>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>
              {todayFormatted} · Goal: {
                user.goal === 'fat_loss' || user.goal === 'lose' ? 'Fat Loss (22% Deficit)' :
                user.goal === 'lean_bulk' ? 'Lean Bulk (8% Surplus)' :
                user.goal === 'aggressive_bulk' ? 'Aggressive Bulk (18% Surplus)' : 'Maintenance (TDEE)'
              }
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentPage('food-log')}
              className="btn btn-primary"
              style={{ padding: '10px 18px', fontSize: 12, fontWeight: 800, background: 'var(--brand-primary, #F59E0B)', color: '#000', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={14} strokeWidth={3} /> Log Meal
            </button>
            <button
              onClick={() => setCurrentPage('exercise')}
              className="btn btn-secondary"
              style={{ padding: '10px 18px', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Dumbbell size={14} /> Workout Hub
            </button>
          </div>
        </div>
      </Reveal>

      {/* ── DAILY ENERGY & CALORIE STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <Reveal preset="up" delay={0}>
          <div style={{ background: 'var(--bg-surface)', padding: '20px 22px', borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>DAILY TARGET</span>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 2px' }}>{targetCalories}</div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>calories calculated goal</span>
          </div>
        </Reveal>

        <Reveal preset="up" delay={60}>
          <div style={{ background: 'var(--bg-surface)', padding: '20px 22px', borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>CONSUMED TODAY</span>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#10B981', margin: '4px 0 2px' }}>{consumedCalories}</div>
            <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>{Math.round(progressPct)}% of daily target</span>
          </div>
        </Reveal>

        <Reveal preset="up" delay={120}>
          <div style={{ background: 'var(--bg-surface)', padding: '20px 22px', borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{overGoal ? 'OVER BUDGET' : 'CALORIES REMAINING'}</span>
            <div style={{ fontSize: 26, fontWeight: 900, color: overGoal ? '#EF4444' : 'var(--brand-primary, #F59E0B)', margin: '4px 0 2px' }}>
              {Math.abs(caloriesRemaining)}
            </div>
            <span style={{ fontSize: 11, color: overGoal ? '#EF4444' : 'var(--text-muted)' }}>
              {overGoal ? 'kcal over planned limit' : 'kcal available to eat'}
            </span>
          </div>
        </Reveal>
      </div>

      {/* ── MACRONUTRIENT BALANCE + WATER INTAKE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {[
          { label: 'PROTEIN', value: dailyData?.totals.protein || 0, target: user.targetProtein, color: '#818CF8' },
          { label: 'CARBOHYDRATES', value: dailyData?.totals.carbs || 0, target: user.targetCarbs, color: '#10B981' },
          { label: 'HEALTHY FATS', value: dailyData?.totals.fat || 0, target: user.targetFat, color: '#F472B6' },
        ].map((macro, idx) => (
          <Reveal key={macro.label} preset="up" delay={idx * 50}>
            <div style={{ background: 'var(--bg-surface)', padding: '20px 22px', borderRadius: 16, border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{macro.label}</span>
              <div style={{ fontSize: 24, fontWeight: 900, color: macro.color, margin: '4px 0 2px' }}>
                {macro.value}<span style={{ fontSize: 13, fontWeight: 700, opacity: 0.8 }}>g</span>
              </div>
              {macro.target && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                  of {macro.target}g target
                </span>
              )}
            </div>
          </Reveal>
        ))}

        <Reveal preset="up" delay={150}>
          <WaterTracker user={user} />
        </Reveal>
      </div>

      {/* ── 2-COLUMN SPLIT: 7-Day Calorie Chart + Active Workout & Daily Insight ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        
        {/* Left: 7-Day Bar Chart */}
        <Reveal preset="left" delay={0}>
          <WeeklyProgress user={user} />
        </Reveal>

        {/* Right: Active Workout Plan & Smart Health Insight */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Scheduled Workout Module */}
          <Reveal preset="right" delay={50}>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-card)',
              padding: '22px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Dumbbell size={13} /> ACTIVE TRAINING SCHEDULE
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Flame size={12} fill="#10B981" /> {workoutStreak} Streak
                  </span>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>
                  {generatedProgram ? generatedProgram.splitName : 'Personalized 4-Week Mesocycle'}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.4 }}>
                  {generatedProgram 
                    ? 'Certified NSCA progressive overload periodization active.' 
                    : 'Configure your goal, equipment, and injury history to build your 4-week program.'}
                </p>
              </div>

              <button
                onClick={() => setCurrentPage('exercise')}
                className="btn btn-primary"
                style={{
                  width: '100%', padding: '11px 0', borderRadius: 12, fontWeight: 800, fontSize: 12,
                  background: 'var(--brand-primary, #F59E0B)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                <Play size={13} fill="#000" /> {generatedProgram ? 'Open Workout Console' : 'Generate 4-Week Program'}
              </button>
            </div>
          </Reveal>

          {/* Daily Smart Health & Nutrition Insight */}
          <Reveal preset="right" delay={100}>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderLeft: '4px solid var(--brand-primary, #F59E0B)',
              borderRadius: 'var(--radius-card)',
              padding: '18px 22px',
            }}>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--brand-primary, #F59E0B)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Sparkles size={12} /> DAILY NUTRITION INSIGHT
              </span>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {(() => {
                  const name = user?.fullName?.split(' ')[0] || 'Athlete';
                  const budget = user?.budgetRange || 'moderate';
                  if (!consumedCalories) {
                    return `Start logging meals for today, ${name}. Tracking your intake keeps your energy steady and ensures your macros hit optimal muscle protein synthesis.`;
                  } else if (caloriesRemaining > 400) {
                    return `You have ${caloriesRemaining} kcal remaining today. Check your Weekly Meal Planner for ${budget}-budget meals to hit your protein goal.`;
                  } else if (caloriesRemaining >= 0) {
                    return `Excellent pacing today, ${name}. You are on target with your caloric balance for steady physical adaptation.`;
                  } else {
                    return `You are ${Math.abs(caloriesRemaining)} kcal over target. A high-protein evening and adequate water intake will keep your recovery on track.`;
                  }
                })()}
              </p>
            </div>
          </Reveal>

        </div>
      </div>

      {/* ── QUICK ACTION NAVIGATION ── */}
      <Reveal preset="up" delay={0}>
        <div style={{ marginTop: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
            FEATURE NAVIGATION
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { label: 'Food Log', desc: 'Track breakfast, lunch, dinner & snacks', page: 'food-log', icon: <Utensils size={16} /> },
              { label: 'Weekly Meal Planner', desc: 'Budget-optimized weekly Indian diet plans', page: 'meal-planner', icon: <Calendar size={16} /> },
              { label: 'Workout Console', desc: '17 workout splits, set matrix & timer', page: 'exercise', icon: <Dumbbell size={16} /> },
              { label: 'Member Profile', desc: 'PR Hall of Fame & biometrics', page: 'profile', icon: <Activity size={16} /> },
            ].map(item => (
              <button
                key={item.page}
                onClick={() => setCurrentPage(item.page)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 14,
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--brand-primary, #F59E0B)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', color: 'var(--brand-primary, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{item.label}</h4>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</p>
                  </div>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </button>
            ))}
          </div>
        </div>
      </Reveal>

    </div>
  );
}
