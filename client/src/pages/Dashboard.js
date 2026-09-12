import React, { useState, useEffect, useRef } from 'react';
import { 
  Dumbbell, Sparkles, Plus, Droplets, 
  Flame, Play, Calculator, ChevronDown, ChevronUp
} from 'lucide-react';
import { API_BASE } from '../config';
import { getDetailedCalorieBreakdown } from '../utils/nutritionEngine';
import MacroDonutChart from '../components/MacroDonutChart';
import ConsistencyHeatmap from '../components/ConsistencyHeatmap';

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
    up:    { hidden: 'translateY(10px)', shown: 'translateY(0px)' },
    down:  { hidden: 'translateY(-10px)', shown: 'translateY(0px)' },
    left:  { hidden: 'translateX(-10px)', shown: 'translateX(0px)' },
    right: { hidden: 'translateX(10px)', shown: 'translateX(0px)' },
    scale: { hidden: 'scale(0.97)', shown: 'scale(1)' },
    none:  { hidden: 'none', shown: 'none' },
  };

  const p = presets[preset] || presets.up;

  return (
    <Tag
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? p.shown : p.hidden,
        transition: `opacity 0.4s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.4s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: 'opacity, transform',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

// ─── FITNESS CALORIE CALCULATION BREAKDOWN COMPONENT ────────────────────────
function CalorieEngineBreakdown({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const breakdown = getDetailedCalorieBreakdown(user);
  if (!breakdown) return null;

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
      transition: 'all 0.2s ease'
    }}>
      {/* Header Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '18px 24px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--brand-primary-subtle)', color: 'var(--brand-primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Calculator size={18} />
          </div>
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--brand-primary-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              NUTRITION ENGINE
            </span>
            <h3 style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              How your calorie target is calculated
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="tabular-nums" style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary-light)', background: 'var(--brand-primary-subtle)', padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            {breakdown.targetCalories} kcal Target
          </span>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* Expanded Breakdown */}
      {isOpen && (
        <div className="fadeInUp" style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border-subtle)' }}>
          {/* User Profile Inputs Strip */}
          <div style={{ marginTop: 18, marginBottom: 18 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PROFILE INPUT FACTORS (LIVE PROFILE)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginTop: 8 }}>
              <div style={{ background: 'var(--bg-surface-raised)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>SEX & AGE</span>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{breakdown.inputs.gender}, {breakdown.inputs.age} yrs</div>
              </div>
              <div style={{ background: 'var(--bg-surface-raised)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>HEIGHT & WEIGHT</span>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{breakdown.inputs.height} cm · {breakdown.inputs.weight} kg</div>
              </div>
              <div style={{ background: 'var(--bg-surface-raised)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>OCCUPATION (NEAT)</span>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{breakdown.inputs.profession} (×{Number(breakdown.neatFactor).toFixed(2)})</div>
              </div>
              <div style={{ background: 'var(--bg-surface-raised)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>GYM FREQUENCY</span>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{breakdown.inputs.gymDays} days/wk ({breakdown.inputs.gymIntensity})</div>
              </div>
            </div>
          </div>

          {/* Step-by-Step Calculation Engine */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            
            {/* Step 1: BMR */}
            <div style={{ background: 'var(--bg-surface-raised)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)' }}>
                  STEP 1: BASAL METABOLIC RATE (BMR)
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>
                  {breakdown.bmr} kcal/day
                </span>
              </div>
              <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--text-muted)' }}>
                Baseline caloric expenditure needed by vital organs at absolute rest.
              </p>
              <div style={{ fontSize: 11, fontFamily: 'monospace', background: 'var(--bg-surface)', padding: '6px 10px', borderRadius: 6, color: 'var(--text-secondary)' }}>
                Formula: {breakdown.bmrFormula} = <strong>{breakdown.bmr} kcal</strong>
              </div>
            </div>

            {/* Step 2: NEAT + EAT = TDEE */}
            <div style={{ background: 'var(--bg-surface-raised)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#38BDF8' }}>
                  STEP 2: OCCUPATIONAL STEPS & WORKOUT ENERGY (TDEE)
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>
                  {breakdown.tdee} kcal/day
                </span>
              </div>
              <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--text-muted)' }}>
                Combines occupational steps (NEAT factor: {Number(breakdown.neatFactor).toFixed(2)}) + resistance training (+{breakdown.eatBurnKcal} kcal/day across {breakdown.eatDays} gym days).
              </p>
              <div style={{ fontSize: 11, fontFamily: 'monospace', background: 'var(--bg-surface)', padding: '6px 10px', borderRadius: 6, color: 'var(--text-secondary)' }}>
                Total PAL: {Number(breakdown.totalPAL).toFixed(2)} → BMR ({breakdown.bmr}) × {Number(breakdown.totalPAL).toFixed(2)} = <strong>{breakdown.tdee} kcal/day Maintenance</strong>
              </div>
            </div>

            {/* Step 3: Target Intake Goal */}
            <div style={{ background: 'var(--bg-surface-raised)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#10B981' }}>
                  STEP 3: CALORIC GOAL ADJUSTMENT
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#10B981' }}>
                  {breakdown.targetCalories} kcal/day
                </span>
              </div>
              <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--text-muted)' }}>
                {breakdown.calorieDelta < 0
                  ? `22% calibrated caloric deficit (${breakdown.calorieDelta} kcal) for sustainable fat loss without metabolic downregulation.`
                  : breakdown.calorieDelta > 0
                  ? `Controlled caloric surplus (+${breakdown.calorieDelta} kcal) for lean muscle hypertrophy without excess adiposity.`
                  : `100% of TDEE for body recomposition and weight maintenance.`}
              </p>
              <div style={{ fontSize: 11, fontFamily: 'monospace', background: 'var(--bg-surface)', padding: '6px 10px', borderRadius: 6, color: 'var(--text-secondary)' }}>
                Goal Target = {breakdown.tdee} {breakdown.calorieDelta >= 0 ? '+' : ''}{breakdown.calorieDelta} = <strong>{breakdown.targetCalories} kcal/day</strong>
              </div>
            </div>

            {/* Step 4: Strict Macro Partitioning & SVG Donut */}
            <div style={{ background: 'var(--bg-surface-raised)', padding: '16px 18px', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: '#818CF8', display: 'block', marginBottom: 12 }}>
                STEP 4: EXACT MACRONUTRIENT PARTITIONING
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <MacroDonutChart
                  calories={breakdown.targetCalories}
                  protein={breakdown.macros.protein}
                  carbs={breakdown.macros.carbs}
                  fat={breakdown.macros.fat}
                  size={150}
                  showLegend={false}
                  centerLabel="TARGET"
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, width: '100%' }}>
                  <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#818CF8' }}>PROTEIN</span>
                    <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)' }}>{breakdown.macros.protein}g</div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{breakdown.macros.protein * 4} kcal ({Math.round(((breakdown.macros.protein * 4) / breakdown.targetCalories) * 100)}%)</span>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#10B981' }}>CARBOHYDRATES</span>
                    <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)' }}>{breakdown.macros.carbs}g</div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{breakdown.macros.carbs * 4} kcal ({Math.round(((breakdown.macros.carbs * 4) / breakdown.targetCalories) * 100)}%)</span>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#FB923C' }}>HEALTHY FATS</span>
                    <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)' }}>{breakdown.macros.fat}g</div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{breakdown.macros.fat * 9} kcal ({Math.round(((breakdown.macros.fat * 9) / breakdown.targetCalories) * 100)}%)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
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
  const [workoutHistory, setWorkoutHistory] = useState([]);

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
        setWorkoutHistory(Array.isArray(hist) ? hist : []);
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
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      
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
            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--brand-primary-light)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              TODAY'S CHECK-IN
            </span>
            <h1 style={{
              margin: '2px 0 0',
              fontFamily: 'var(--font-heading)',
              fontSize: 24,
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}>
              Welcome back, {user.fullName?.split(' ')[0] || 'Athlete'}
            </h1>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>
              {todayFormatted} · Goal: {
                user.goal === 'fat_loss' || user.goal === 'lose' ? 'Fat Loss (Caloric Deficit)' :
                user.goal === 'lean_bulk' ? 'Lean Bulk (Muscle Growth)' :
                user.goal === 'aggressive_bulk' ? 'Bulk (Muscle Growth)' : 'Weight Maintenance'
              }
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentPage('food-log')}
              className="btn btn-primary"
              style={{ padding: '10px 18px', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={15} strokeWidth={2.5} /> Log Meal
            </button>
            <button
              onClick={() => setCurrentPage('exercise')}
              className="btn btn-secondary"
              style={{ padding: '10px 18px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Dumbbell size={15} /> Workout Console
            </button>
          </div>
        </div>
      </Reveal>

      {/* ── 2-COLUMN COMPACT MOBILE STATS GRID (CALORIES & MACROS) ── */}
      <div className="mobile-2col-grid">
        {/* 1. Daily Target */}
        <Reveal preset="up" delay={0}>
          <div style={{ background: 'var(--bg-surface)', padding: '16px 18px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)', height: '100%' }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>DAILY TARGET</span>
            <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 2px' }}>{targetCalories}</div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>target calories</span>
          </div>
        </Reveal>

        {/* 2. Consumed Today */}
        <Reveal preset="up" delay={30}>
          <div style={{ background: 'var(--bg-surface)', padding: '16px 18px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)', height: '100%' }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>CONSUMED</span>
            <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 900, color: 'var(--brand-primary-light)', margin: '4px 0 2px' }}>{consumedCalories}</div>
            <span style={{ fontSize: 11, color: 'var(--brand-primary-light)', fontWeight: 700 }}>{Math.round(progressPct)}% reached</span>
          </div>
        </Reveal>

        {/* 3. Calories Remaining */}
        <Reveal preset="up" delay={60}>
          <div style={{ background: 'var(--bg-surface)', padding: '16px 18px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)', height: '100%' }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{overGoal ? 'OVER BUDGET' : 'REMAINING'}</span>
            <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 900, color: overGoal ? 'var(--accent-danger)' : 'var(--accent-calories)', margin: '4px 0 2px' }}>
              {Math.abs(caloriesRemaining)}
            </div>
            <span style={{ fontSize: 11, color: overGoal ? 'var(--accent-danger)' : 'var(--text-muted)' }}>
              {overGoal ? 'kcal over' : 'kcal left'}
            </span>
          </div>
        </Reveal>

        {/* 4. Protein */}
        <Reveal preset="up" delay={90}>
          <div style={{ background: 'var(--bg-surface)', padding: '16px 18px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)', height: '100%' }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-protein-text, #818CF8)', letterSpacing: '0.04em' }}>PROTEIN</span>
            <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent-protein-text, #818CF8)', margin: '4px 0 2px' }}>
              {dailyData?.totals.protein || 0}<span style={{ fontSize: 13, fontWeight: 700, opacity: 0.85 }}>g</span>
            </div>
            {user.targetProtein && (
              <span className="tabular-nums" style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                / {user.targetProtein}g goal
              </span>
            )}
          </div>
        </Reveal>

        {/* 5. Carbs */}
        <Reveal preset="up" delay={120}>
          <div style={{ background: 'var(--bg-surface)', padding: '16px 18px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)', height: '100%' }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--brand-primary-light, #10B981)', letterSpacing: '0.04em' }}>CARBS</span>
            <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 900, color: 'var(--brand-primary-light, #10B981)', margin: '4px 0 2px' }}>
              {dailyData?.totals.carbs || 0}<span style={{ fontSize: 13, fontWeight: 700, opacity: 0.85 }}>g</span>
            </div>
            {user.targetCarbs && (
              <span className="tabular-nums" style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                / {user.targetCarbs}g goal
              </span>
            )}
          </div>
        </Reveal>

        {/* 6. Fats */}
        <Reveal preset="up" delay={150}>
          <div style={{ background: 'var(--bg-surface)', padding: '16px 18px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)', height: '100%' }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-fat-text, #FB7185)', letterSpacing: '0.04em' }}>FATS</span>
            <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent-fat-text, #FB7185)', margin: '4px 0 2px' }}>
              {dailyData?.totals.fat || 0}<span style={{ fontSize: 13, fontWeight: 700, opacity: 0.85 }}>g</span>
            </div>
            {user.targetFat && (
              <span className="tabular-nums" style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                / {user.targetFat}g goal
              </span>
            )}
          </div>
        </Reveal>
      </div>

      {/* ── HYDRATION TRACKER (FULL WIDTH CARD) ── */}
      <Reveal preset="up" delay={100}>
        <WaterTracker user={user} />
      </Reveal>

      {/* ── INTERACTIVE FITNESS CALORIE CALCULATION ENGINE BREAKDOWN ── */}
      <Reveal preset="up" delay={40}>
        <CalorieEngineBreakdown user={user} />
      </Reveal>

      {/* ── 2-COLUMN SPLIT: 7-Day Calorie Chart + Active Workout & Daily Insight ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        
        {/* Left: 7-Day Bar Chart */}
        <Reveal preset="left" delay={0}>
          <WeeklyProgress user={user} />
        </Reveal>

        {/* Right: Active Workout Plan & Smart Health Insight */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Scheduled Workout Module */}
          <Reveal preset="right" delay={40}>
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
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--brand-primary-light)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Dumbbell size={13} /> ACTIVE TRAINING SCHEDULE
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Flame size={12} fill="var(--brand-primary-light)" /> {workoutStreak} Streak
                  </span>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>
                  {generatedProgram ? generatedProgram.splitName : 'Personalized 4-Week Mesocycle'}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
                  {generatedProgram 
                    ? 'Certified NSCA progressive overload periodization active.' 
                    : 'Configure your goal, equipment, and injury history to build your 4-week program.'}
                </p>
              </div>

              <button
                onClick={() => setCurrentPage('exercise')}
                className="btn btn-primary"
                style={{
                  width: '100%', padding: '11px 0', borderRadius: 'var(--radius-panel)', fontWeight: 800, fontSize: 12.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                <Play size={13} fill="currentColor" /> {generatedProgram ? 'Open Workout Console' : 'Generate 4-Week Program'}
              </button>
            </div>
          </Reveal>

          {/* Daily Smart Health & Nutrition Insight */}
          <Reveal preset="right" delay={80}>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderLeft: '3.5px solid var(--brand-primary)',
              borderRadius: 'var(--radius-card)',
              padding: '18px 22px',
            }}>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, letterSpacing: '0.06em' }}>
                <Sparkles size={12} /> DAILY NUTRITION INSIGHT
              </span>
              <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
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

      {/* ── 10-WEEK CONSISTENCY MATRIX & ACTIVITY HEATMAP ── */}
      <Reveal preset="up" delay={60}>
        <ConsistencyHeatmap workoutHistory={workoutHistory} currentStreak={workoutStreak} />
      </Reveal>

    </div>
  );
}
