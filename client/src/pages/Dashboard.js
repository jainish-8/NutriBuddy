import React, { useState, useEffect, useRef } from 'react';

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

// ─── ANIMATED WRAPPER ─────────────────────────────────────────────────────────
function Reveal({ children, preset = 'up', delay = 0, style = {}, as: Tag = 'div' }) {
  const [ref, visible] = useReveal(delay);

  const presets = {
    up:    { hidden: 'translateY(44px)', shown: 'translateY(0px)' },
    down:  { hidden: 'translateY(-28px)', shown: 'translateY(0px)' },
    left:  { hidden: 'translateX(-44px)', shown: 'translateX(0px)' },
    right: { hidden: 'translateX(44px)', shown: 'translateX(0px)' },
    scale: { hidden: 'scale(0.88)', shown: 'scale(1)' },
    none:  { hidden: 'none', shown: 'none' },
  };

  const p = presets[preset] || presets.up;

  return (
    <Tag
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? p.shown : p.hidden,
        transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
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
      if (saved) setWaterIntake(parseInt(saved));
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
      padding: '24px 28px',
      backdropFilter: 'var(--glass-blur, none)',
      WebkitBackdropFilter: 'var(--glass-blur, none)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
            Hydration
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
            {waterIntake}<span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>/ {dailyGoal} glasses</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
            {waterIntake * 250} ml consumed today
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => updateWater(-1)}
            disabled={waterIntake === 0}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-surface-raised)',
              color: waterIntake === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
              fontSize: 18, fontWeight: 300, cursor: waterIntake === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
              opacity: waterIntake === 0 ? 0.4 : 1
            }}
          >−</button>
          <button
            onClick={() => updateWater(1)}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              border: 'none',
              background: 'var(--accent-lavender-text)',
              color: '#fff',
              fontSize: 18, fontWeight: 300, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(139,92,246,0.3)'
            }}
          >+</button>
        </div>
      </div>
      <div style={{ height: 6, background: 'var(--bg-surface-raised)', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: pct >= 100 ? 'var(--accent-lime-text)' : 'var(--accent-lavender-text)',
          borderRadius: 3,
          transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1)'
        }} />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[...Array(dailyGoal)].map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i < waterIntake ? 'var(--accent-lavender-text)' : 'var(--bg-surface-raised)',
            transition: 'background 0.25s ease'
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── WEEKLY PROGRESS ──────────────────────────────────────────────────────────
function WeeklyProgress({ user }) {
  const [weeklyData, setWeeklyData] = useState([]);
  const [chartVisible, setChartVisible] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    if (user?.id) generateWeeklyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Animate bars when chart enters viewport
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
      const exercises = JSON.parse(localStorage.getItem(`exercises_${user.id}_${ds}`) || '[]');
      const water = parseInt(localStorage.getItem(`water_${user.id}_${ds}`) || '0');
      const caloriesBurned = exercises.reduce((s, ex) => s + (ex.caloriesBurned || 0), 0);
      const base = user.dailyCalories || 2000;
      const variation = Math.floor(Math.random() * 400) - 200;
      data.push({
        date: ds,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: i === 0 ? 0 : Math.max(base + variation, 0),
        caloriesBurned,
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
  const totalBurned = weeklyData.reduce((s, d) => s + d.caloriesBurned, 0);
  const hydrationDays = weeklyData.filter(d => d.water >= 8).length;

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-card)',
      padding: '28px',
      backdropFilter: 'var(--glass-blur, none)',
      WebkitBackdropFilter: 'var(--glass-blur, none)',
    }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
          Weekly Overview
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
          7-Day Calorie Tracker
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Avg Daily', value: avgCal, unit: 'kcal', color: 'var(--accent-lavender-text)' },
          { label: 'Days On Target', value: `${daysOnTarget}/7`, unit: 'days', color: 'var(--accent-lime-text)' },
          { label: 'Total Burned', value: totalBurned, unit: 'kcal', color: 'var(--accent-pink-text)' },
          { label: 'Hydration Days', value: `${hydrationDays}/7`, unit: 'days', color: 'var(--accent-lavender-text)' },
        ].map(stat => (
          <div key={stat.label} style={{
            padding: '14px 16px',
            background: 'var(--bg-surface-raised)',
            borderRadius: 'var(--radius-panel)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 6 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-heading)', color: stat.color, letterSpacing: '-0.02em' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{stat.unit}</div>
          </div>
        ))}
      </div>

      {/* Animated Bar Chart */}
      <div ref={chartRef} style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160, padding: '0 4px', marginBottom: 16 }}>
        {weeklyData.map((day, index) => {
          const targetH = Math.max((day.calories / maxCal) * 140, day.calories > 0 ? 8 : 4);
          const barH = chartVisible ? targetH : 4;
          const isToday = index === 6;
          const overGoal = day.calories > day.goal;
          const noData = day.calories === 0;
          return (
            <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: '100%', height: 140, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  bottom: (day.goal / maxCal) * 140,
                  left: 0, right: 0,
                  height: 1,
                  background: 'var(--border-strong)',
                  opacity: 0.5,
                }} />
                <div style={{
                  width: '62%',
                  height: barH,
                  borderRadius: '4px 4px 2px 2px',
                  background: noData
                    ? 'var(--bg-surface-raised)'
                    : overGoal
                    ? 'var(--accent-danger)'
                    : isToday
                    ? 'var(--accent-lavender-text)'
                    : 'var(--accent-lime-text)',
                  opacity: noData ? 0.4 : 1,
                  transition: `height 0.9s cubic-bezier(0.16,1,0.3,1) ${index * 60}ms`,
                  boxShadow: !noData ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 11, fontWeight: isToday ? 800 : 600,
                  color: isToday ? 'var(--accent-lavender-text)' : 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  {day.day}
                </div>
                {isToday && (
                  <div style={{ fontSize: 9, color: 'var(--accent-lavender-text)', fontWeight: 700, letterSpacing: '0.06em' }}>
                    TODAY
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {[
          { color: 'var(--accent-lime-text)', label: 'On Target' },
          { color: 'var(--accent-danger)', label: 'Over Goal' },
          { color: 'var(--border-strong)', label: 'Daily Target Line' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color, opacity: 0.85 }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, unit, accent, trend }) {
  return (
    <div style={{
      padding: '20px 22px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-panel)',
      backdropFilter: 'var(--glass-blur, none)',
      WebkitBackdropFilter: 'var(--glass-blur, none)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 3, height: '100%',
        background: accent, borderRadius: '3px 0 0 3px'
      }} />
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-heading)', color: accent, letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5, fontWeight: 500 }}>
        {unit}
      </div>
      {trend && (
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
          {trend}
        </div>
      )}
    </div>
  );
}

// ─── MACRO CARD ───────────────────────────────────────────────────────────────
function MacroCard({ label, value, target, accent }) {
  return (
    <div style={{
      padding: '18px 20px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-panel)',
      textAlign: 'center',
      backdropFilter: 'var(--glass-blur, none)',
      WebkitBackdropFilter: 'var(--glass-blur, none)',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-heading)', color: accent, letterSpacing: '-0.03em' }}>
        {value}<span style={{ fontSize: 14, fontWeight: 600, opacity: 0.7, marginLeft: 2 }}>g</span>
      </div>
      {target !== undefined && target !== null && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontWeight: 600 }}>
          of {target}g target
        </div>
      )}
    </div>
  );
}

// ─── ACTION CARD ──────────────────────────────────────────────────────────────
function ActionCard({ label, description, onClick, accent }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '20px 22px',
        background: hovered ? 'var(--bg-surface-alt)' : 'var(--bg-surface)',
        border: `1px solid ${hovered ? accent : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-panel)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? '0 12px 28px rgba(0,0,0,0.14)' : 'none',
        backdropFilter: 'var(--glass-blur, none)',
        WebkitBackdropFilter: 'var(--glass-blur, none)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 3, height: '100%',
        background: accent, borderRadius: '3px 0 0 3px',
        opacity: hovered ? 1 : 0.4,
        transition: 'opacity 0.2s ease'
      }} />
      <div style={{
        fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4,
        fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em'
      }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
        {description}
      </div>
    </button>
  );
}

// ─── SECTION LABEL ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: 'var(--text-muted)',
      marginBottom: 12, paddingLeft: 2,
    }}>
      {children}
    </div>
  );
}

// ─── ANIMATED PROGRESS BAR ────────────────────────────────────────────────────
function AnimatedProgressBar({ pct, overGoal }) {
  const [width, setWidth] = useState(0);
  const [ref, visible] = useReveal(0, 0.1);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setWidth(Math.min(pct, 100)), 120);
      return () => clearTimeout(t);
    }
  }, [visible, pct]);

  return (
    <div ref={ref} style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-card)', padding: '20px 24px',
      backdropFilter: 'var(--glass-blur, none)',
      WebkitBackdropFilter: 'var(--glass-blur, none)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
          Daily Progress
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: overGoal ? 'var(--accent-danger)' : 'var(--text-secondary)' }}>
          {Math.round(pct)}% {overGoal ? '· Over Limit' : 'Complete'}
        </div>
      </div>
      <div style={{ height: 8, background: 'var(--bg-surface-raised)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${width}%`,
          background: overGoal
            ? 'var(--accent-danger)'
            : 'linear-gradient(90deg, var(--accent-lime-text), var(--accent-lavender-text))',
          borderRadius: 4,
          transition: 'width 1.1s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard({ user, setCurrentPage }) {
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchDailyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchDailyData = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/daily-logs/${user?.id}`);
      const data = await res.json();
      if (data.success) setDailyData(data);
    } catch {
      setDailyData({ totals: { calories: 0, protein: 0, carbs: 0, fat: 0 }, logs: [] });
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div style={{
        textAlign: 'center', padding: 60,
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-card)',
        border: '1px solid var(--border-subtle)', maxWidth: 400, margin: 'auto'
      }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 8, fontFamily: 'var(--font-heading)' }}>Session Expired</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Please create your profile to continue.</p>
        <button
          onClick={() => setCurrentPage('profile')}
          className="btn btn-primary"
          style={{ padding: '10px 20px', fontSize: 13, fontWeight: 700 }}
        >
          Create Profile
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        textAlign: 'center', padding: 60,
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-card)',
        border: '1px solid var(--border-subtle)', maxWidth: 400, margin: 'auto'
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--accent-lavender-text)',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 20px'
        }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading your dashboard…</p>
      </div>
    );
  }

  const caloriesRemaining = (user.dailyCalories || 2000) - (dailyData?.totals.calories || 0);
  const progressPct = Math.min(((dailyData?.totals.calories || 0) / (user.dailyCalories || 2000)) * 100, 100);
  const overGoal = caloriesRemaining < 0;
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const greeting = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── PAGE HEADER ── */}
      <Reveal preset="down" delay={0}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
              Overview
            </div>
            <h1 style={{
              fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800,
              fontFamily: 'var(--font-heading)', color: 'var(--text-primary)',
              letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1
            }}>
              Good {greeting},{' '}
              <span style={{ color: 'var(--accent-lavender-text)' }}>
                {user.fullName?.split(' ')[0] || 'there'}
              </span>
            </h1>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 5, fontWeight: 500 }}>
              {today}
            </div>
          </div>

          <button
            onClick={() => setCurrentPage('food-log')}
            style={{
              padding: '11px 22px',
              background: 'var(--accent-lavender-text)',
              color: '#fff', border: 'none',
              borderRadius: 'var(--radius-panel)',
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.01em',
              fontFamily: 'var(--font-body)',
              boxShadow: '0 4px 14px rgba(139,92,246,0.3)',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            + Log Meal
          </button>
        </div>
      </Reveal>

      {/* ── CALORIE STATS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Daily Target', value: user.dailyCalories || 2000, unit: 'calories · goal', accent: 'var(--accent-lavender-text)', delay: 0 },
          { label: 'Consumed Today', value: dailyData?.totals.calories || 0, unit: 'calories logged', accent: 'var(--accent-lime-text)', trend: `${Math.round(progressPct)}% of daily goal`, delay: 80 },
          { label: overGoal ? 'Over Budget' : 'Remaining', value: Math.abs(caloriesRemaining), unit: overGoal ? 'calories over limit' : 'calories left today', accent: overGoal ? 'var(--accent-danger)' : 'var(--accent-warning-text)', delay: 160 },
        ].map(card => (
          <Reveal key={card.label} preset="up" delay={card.delay}>
            <StatCard label={card.label} value={card.value} unit={card.unit} accent={card.accent} trend={card.trend} />
          </Reveal>
        ))}
      </div>

      {/* ── ANIMATED PROGRESS BAR ── */}
      <AnimatedProgressBar pct={progressPct} overGoal={overGoal} />

      {/* ── MACROS + WATER ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.4fr', gap: 16 }}>
        {[
          { label: 'Protein', value: dailyData?.totals.protein || 0, target: user.targetProtein, accent: 'var(--accent-lavender-text)', delay: 0 },
          { label: 'Carbohydrates', value: dailyData?.totals.carbs || 0, target: user.targetCarbs, accent: 'var(--accent-lime-text)', delay: 70 },
          { label: 'Fat', value: dailyData?.totals.fat || 0, target: user.targetFat, accent: 'var(--accent-pink-text)', delay: 140 },
        ].map(m => (
          <Reveal key={m.label} preset="up" delay={m.delay}>
            <MacroCard label={m.label} value={m.value} target={m.target} accent={m.accent} />
          </Reveal>
        ))}
        <Reveal preset="up" delay={210}>
          <WaterTracker user={user} />
        </Reveal>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <Reveal preset="up" delay={0}>
        <div>
          <SectionLabel>Quick Actions</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { label: 'Log Meals', description: 'Record your food intake', page: 'food-log', accent: 'var(--accent-lavender-text)', delay: 0 },
              { label: 'Meal Planner', description: 'Plan budget-friendly weekly meals', page: 'meal-planner', accent: 'var(--accent-lime-text)', delay: 60 },
              { label: 'Exercise Log', description: 'Track workouts and calories burned', page: 'exercise', accent: 'var(--accent-pink-text)', delay: 120 },
              { label: 'Food Search', description: 'Browse nutritional database', page: 'food-search', accent: 'var(--accent-warning-text)', delay: 180 },
            ].map(card => (
              <Reveal key={card.label} preset="scale" delay={card.delay}>
                <ActionCard
                  label={card.label}
                  description={card.description}
                  onClick={() => setCurrentPage(card.page)}
                  accent={card.accent}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── PROFILE SUMMARY + WEEKLY CHART ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
        <Reveal preset="left" delay={0}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: '24px',
            backdropFilter: 'var(--glass-blur, none)',
            WebkitBackdropFilter: 'var(--glass-blur, none)',
          }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
                Profile
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                {user.fullName}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, textTransform: 'capitalize' }}>
                {user.activityLevel?.replace('-', ' ')} · {
                  user.goal === 'fat_loss' || user.goal === 'lose' ? 'Fat Loss' :
                  user.goal === 'lean_bulk' ? 'Lean Bulk' :
                  user.goal === 'aggressive_bulk' ? 'Aggressive Bulk' :
                  user.goal === 'gain' ? 'Muscle Gain' : 'Maintenance'
                }
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { key: 'Diet', value: user.dietaryPreferences ? user.dietaryPreferences.charAt(0).toUpperCase() + user.dietaryPreferences.slice(1) : 'No restriction' },
                { key: 'Cooking Skill', value: user.cookingSkill || '—' },
                { key: 'Budget', value: user.budgetRange ? user.budgetRange.charAt(0).toUpperCase() + user.budgetRange.slice(1) : '—' },
                { key: 'Age', value: user.age ? `${user.age} yrs` : '—' },
                { key: 'Weight', value: user.weight ? `${user.weight} kg` : '—' },
                { key: 'Height', value: user.height ? `${user.height} cm` : '—' },
                ...(user.allergies?.length > 0 ? [{ key: 'Allergies', value: user.allergies.join(', ') }] : []),
              ].map((row, i, arr) => (
                <div
                  key={row.key}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{row.key}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, textAlign: 'right', maxWidth: '55%', textTransform: 'capitalize' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal preset="right" delay={80}>
          <WeeklyProgress user={user} />
        </Reveal>
      </div>

      {/* ── INSIGHT BANNER ── */}
      <Reveal preset="up" delay={0}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderLeft: '3px solid var(--accent-lavender-text)',
          borderRadius: 'var(--radius-card)',
          padding: '20px 24px',
          backdropFilter: 'var(--glass-blur, none)',
          WebkitBackdropFilter: 'var(--glass-blur, none)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16,
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-lavender-text)', marginBottom: 5 }}>
              Daily Insight
            </div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              {(() => {
                const name = user?.fullName?.split(' ')[0] || 'there';
                const budget = user?.budgetRange || 'moderate';
                if (!dailyData?.totals.calories) {
                  return `Start logging your meals today, ${name}. Even partial data helps us give you better recommendations.`;
                } else if (caloriesRemaining > 500) {
                  return `You have ${caloriesRemaining} kcal remaining. Check the Meal Planner for ${budget}-budget meal suggestions.`;
                } else if (caloriesRemaining >= 0 && caloriesRemaining <= 100) {
                  return `Near your goal for today. Great consistency — keep it up, ${name}.`;
                } else {
                  return `You are ${Math.abs(caloriesRemaining)} kcal over today's target. A lighter dinner or short walk can help balance it out.`;
                }
              })()}
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('meal-planner')}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid var(--accent-lavender-text)',
              color: 'var(--accent-lavender-text)',
              borderRadius: 'var(--radius-panel)',
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.01em',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            Open Meal Planner
          </button>
        </div>
      </Reveal>

    </div>
  );
}
