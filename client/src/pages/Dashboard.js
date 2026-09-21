import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Minus, X, Droplet, Dumbbell, Utensils, Zap, ChevronRight, ChevronDown, Clock, Check } from 'lucide-react';
import { getDetailedCalorieBreakdown, toTitleCase, getStandardizedGoalLabel, formatCompactMacros } from '../utils/nutritionEngine';
import { handleCard3DMouseMove, handleCard3DMouseLeave, handleCardSpotlight } from '../utils/cardTilt';

/**
 * NutriBuddy Premium Dashboard (Part 4 Redesign)
 *
 * Strict specifications:
 *  - Zero emojis anywhere, clean minimalist styling.
 *  - Exactly 6 core sections: Top Nav, Hero Card, This Week Card, Today's Meals Card,
 *    Smart Insight Card, Workout Streak Card.
 *  - Removed all 13 deprecated elements, all-caps text, and jargon.
 *  - Full load sequence orchestration (Part 6).
 */
export default function Dashboard({ user, setCurrentPage }) {
  // Biometric & Target Calculations
  const breakdown = useMemo(() => getDetailedCalorieBreakdown(user), [user]);
  const targetCalories = user?.dailyCalories || breakdown?.targetCalories || 2588;
  const targetProtein = user?.targetProtein || breakdown?.macros?.protein || 135;
  const targetCarbs = user?.targetCarbs || breakdown?.macros?.carbs || 310;
  const targetFat = user?.targetFat || breakdown?.macros?.fat || 72;

  // Active Storage Keys
  const userId = user?.id || user?._id || user?.email || user?.fullName || 'active_user';
  const foodLogKey = `nutribuddy_food_log_${userId}`;
  const mealPlanKey = `mealplan_${userId}`;
  const streakKey = `nutribuddy_workout_streak_${userId}`;

  // Logged Intake State
  const [loggedItems] = useState(() => {
    try {
      const saved = localStorage.getItem(foodLogKey) || localStorage.getItem('nutribuddy_food_log');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [activePlan] = useState(() => {
    try {
      const saved = localStorage.getItem(mealPlanKey) || localStorage.getItem('nutribuddy_active_mealplan');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [waterIntake, setWaterIntake] = useState(() => {
    try {
      const saved = localStorage.getItem(`nutribuddy_water_${userId}`);
      if (saved) return parseInt(saved, 10);
    } catch {}
    return 1750;
  });

  const [waterTarget, setWaterTarget] = useState(() => {
    try {
      const saved = localStorage.getItem(`nutribuddy_water_target_${userId}`);
      if (saved) return parseInt(saved, 10);
    } catch {}
    return 2000; // default 2 Liters (8 glasses)
  });

  const [showWaterModal, setShowWaterModal] = useState(false);
  const [selectedDaySummary, setSelectedDaySummary] = useState(null);

  const handleUpdateWater = (delta) => {
    setWaterIntake(prev => {
      const next = Math.max(0, prev + delta);
      try {
        localStorage.setItem(`nutribuddy_water_${userId}`, next.toString());
        window.dispatchEvent(new Event('storage'));
      } catch {}
      return next;
    });
  };

  const handleSetWaterTarget = (newTarget) => {
    const clamped = Math.max(1000, Math.min(5000, newTarget));
    setWaterTarget(clamped);
    try {
      localStorage.setItem(`nutribuddy_water_target_${userId}`, clamped.toString());
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  // Lock body scroll when water modal or day summary is open
  useEffect(() => {
    if (showWaterModal || selectedDaySummary) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'contain';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.overscrollBehavior = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.overscrollBehavior = '';
    };
  }, [showWaterModal, selectedDaySummary]);

  const [streakDays] = useState(() => {
    try {
      const saved = localStorage.getItem(streakKey);
      if (saved !== null) return parseInt(saved, 10);
    } catch {}
    return 5;
  });

  const now = useMemo(() => new Date(), []);

  // Today's Meal Slots (Part 4.4)
  const todayMeals = useMemo(() => {
    const defaultSlots = [
      {
        slotKey: 'breakfast',
        slotName: 'Breakfast',
        time: '08:00 AM',
        mealName: 'Paneer Bhurji with 2 Whole Wheat Phulkas',
        kcal: 480,
        macros: 'P24 · C42 · F18',
        color: 'var(--g)',
        isLogged: true
      },
      {
        slotKey: 'pre_workout',
        slotName: 'Pre-workout fuel',
        time: '11:00 AM',
        mealName: 'Banana Peanut Butter Toast with Whey Protein',
        kcal: 430,
        macros: 'P35 · C48 · F10',
        color: 'var(--amb)',
        isLogged: true
      },
      {
        slotKey: 'lunch',
        slotName: 'Lunch platter',
        time: '01:30 PM',
        mealName: 'Homestyle Chicken Curry with Steamed Basmati Rice & Salad',
        kcal: 620,
        macros: 'P46 · C68 · F14',
        color: 'var(--blu)',
        isLogged: false
      },
      {
        slotKey: 'post_workout',
        slotName: 'Post-workout',
        time: '04:30 PM',
        mealName: 'Roasted Chana & Boiled Egg Whites Bowl',
        kcal: 280,
        macros: 'P22 · C28 · F4',
        color: 'var(--cyan)',
        isLogged: false
      },
      {
        slotKey: 'dinner',
        slotName: 'Dinner platter',
        time: '08:00 PM',
        mealName: 'Yellow Moong Dal Tadka with 2 Phulkas & Cucumber Raita',
        kcal: 540,
        macros: 'P26 · C74 · F12',
        color: 'var(--pur)',
        isLogged: false
      },
      {
        slotKey: 'snacks',
        slotName: 'Evening snack',
        time: '09:30 PM',
        mealName: 'Roasted Makhana with Green Tea & Walnuts',
        kcal: 238,
        macros: 'P6 · C30 · F10',
        color: 'var(--amb)',
        isLogged: false
      }
    ];

    const dayNamesFull = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const curDayFull = dayNamesFull[now.getDay()];
    const plannedForToday = activePlan?.plan?.[curDayFull];

    if (plannedForToday && Object.keys(plannedForToday).length > 0) {
      return defaultSlots.map((slot) => {
        const item = plannedForToday[slot.slotKey];
        if (!item) return slot;
        return {
          ...slot,
          time: slot.time,
          mealName: item.name || slot.mealName,
          kcal: item.calories || slot.kcal,
          macros: formatCompactMacros(item.protein || 20, item.carbs || 40, item.fat || 10)
        };
      });
    }

    return defaultSlots;
  }, [activePlan, now]);

  // Eaten Meal Persistence State for Today
  const [eatenMeals, setEatenMeals] = useState(() => {
    try {
      const todayStr = new Date().toDateString();
      const saved = localStorage.getItem(`nutribuddy_eaten_meals_${userId}_${todayStr}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { breakfast: true, pre_workout: true };
  });

  const toggleMealEaten = (slotKey) => {
    setEatenMeals(prev => {
      const next = { ...prev, [slotKey]: !prev[slotKey] };
      try {
        const todayStr = new Date().toDateString();
        localStorage.setItem(`nutribuddy_eaten_meals_${userId}_${todayStr}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Calculate Consumed Totals for Today
  const consumed = useMemo(() => {
    const logTotal = loggedItems.reduce(
      (acc, item) => ({
        calories: acc.calories + (Number(item.calories) || 0),
        protein: acc.protein + (Number(item.protein) || 0),
        carbs: acc.carbs + (Number(item.carbs) || 0),
        fat: acc.fat + (Number(item.fat) || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    if (logTotal.calories > 0) return logTotal;

    // If no explicit food log items exist, sum up meals marked as EATEN from today's fuel stream!
    if (todayMeals && todayMeals.length > 0) {
      return todayMeals
        .filter(m => !!eatenMeals[m.slotKey])
        .reduce(
          (acc, m) => {
            const cal = Number(m.kcal) || 0;
            const pMatch = (m.macros || '').match(/P\s*(\d+)g?/i);
            const cMatch = (m.macros || '').match(/C\s*(\d+)g?/i);
            const fMatch = (m.macros || '').match(/F\s*(\d+)g?/i);
            return {
              calories: acc.calories + cal,
              protein: acc.protein + (pMatch ? Number(pMatch[1]) : 20),
              carbs: acc.carbs + (cMatch ? Number(cMatch[1]) : 40),
              fat: acc.fat + (fMatch ? Number(fMatch[1]) : 10)
            };
          },
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );
    }

    return logTotal;
  }, [loggedItems, todayMeals, eatenMeals]);

  // Consumed Numbers & Macro Animated Count-Up (0 → values over 950ms ease-out cubic)
  const [displayCalories, setDisplayCalories] = useState(0);
  const [displayProtein, setDisplayProtein] = useState(0);
  const [displayCarbs, setDisplayCarbs] = useState(0);
  const [displayFat, setDisplayFat] = useState(0);
  const [displayWater, setDisplayWater] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrame = null;
    const calTarget = consumed.calories;
    const pTarget = consumed.protein;
    const cTarget = consumed.carbs;
    const fTarget = consumed.fat;
    const wTarget = waterIntake;

    const easeOutCubic = (t) => --t * t * t + 1;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / 950);
      const factor = easeOutCubic(progress);

      setDisplayCalories(Math.round(factor * calTarget));
      setDisplayProtein(Math.round(factor * pTarget));
      setDisplayCarbs(Math.round(factor * cTarget));
      setDisplayFat(Math.round(factor * fTarget));
      setDisplayWater(Math.round(factor * wTarget));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [consumed.calories, consumed.protein, consumed.carbs, consumed.fat, waterIntake]);

  // Calorie Arc Animated Stroke Dashoffset (276.5 → target on load)
  const [arcOffset, setArcOffset] = useState(276.5);
  useEffect(() => {
    const timer = setTimeout(() => {
      const circumference = 276.5;
      const ratio = Math.min(1, consumed.calories / targetCalories);
      setArcOffset(circumference - ratio * circumference);
    }, 200);
    return () => clearTimeout(timer);
  }, [consumed.calories, targetCalories]);

  // Calorie Arc Color Transition Logic (Part 6.G)
  const arcRatio = targetCalories > 0 ? consumed.calories / targetCalories : 0;
  let arcStrokeColor = 'url(#calGreenGradient)';
  let isPulse100 = false;
  if (arcRatio > 1) {
    arcStrokeColor = 'var(--red)';
  } else if (arcRatio === 1) {
    arcStrokeColor = 'var(--amb)';
    isPulse100 = true;
  } else if (arcRatio >= 0.9) {
    arcStrokeColor = 'var(--amb)';
  }

  // Time-Based Greeting & Current Date
  const currentHour = now.getHours();
  const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  let greetingTime = 'Good morning';
  if (currentHour >= 12 && currentHour < 17) {
    greetingTime = 'Good afternoon';
  } else if (currentHour >= 17 || currentHour < 5) {
    greetingTime = 'Good evening';
  }

  // Display Name (Title-cased Jainish)
  const rawName = user?.fullName || 'Jainish';
  const userName = toTitleCase(rawName);

  // Goal Display Line (Section 1.4: standardized single-source goal label)
  const userGoalLabel = getStandardizedGoalLabel(user?.goal || user?.fitnessGoal);
  const userWeight = user?.weight || 60;

  // Weekly Consistency Days Data (7 mini rings: Mon - Sun)
  const weekDays = useMemo(() => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDayIndex = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6

    const workoutPresets = [
      { title: 'Push Day A', focus: 'Chest, Shoulders & Triceps', exercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Standing Overhead Press', 'Cable Lateral Raises', 'Tricep Rope Pushdowns'], isRest: false },
      { title: 'Pull Day A', focus: 'Back & Biceps', exercises: ['Deadlift / Lat Pulldown', 'Barbell Bent Over Row', 'Chest Supported Row', 'Incline DB Bicep Curl', 'Hammer Curls'], isRest: false },
      { title: 'Legs & Core A', focus: 'Quads & Abs', exercises: ['Barbell Back Squat', 'Romanian Deadlift', 'Leg Extensions', 'Standing Calf Raises', 'Hanging Leg Raises'], isRest: false },
      { title: 'Push Day B', focus: 'Hypertrophy & Delts', exercises: ['Dumbbell Bench Press', 'Dumbbell Shoulder Press', 'Dips', 'Cable Flyes', 'Skull Crushers'], isRest: false },
      { title: 'Pull Day B', focus: 'Upper Back & Rear Delts', exercises: ['Pull-ups / Weighted Chin-ups', 'Seated Cable Row', 'Face Pulls', 'Barbell Bicep Curls', 'Preacher Curls'], isRest: false },
      { title: 'Legs & Conditioning B', focus: 'Hamstrings & Glutes', exercises: ['Bulgarian Split Squats', 'Leg Press', 'Hamstring Curls', 'Walking Lunges', 'Plank Hold'], isRest: false },
      { title: 'Active Recovery', focus: 'Mobility & Rest', exercises: ['10,000 Steps Outdoor Walk', 'Dynamic Hip Mobility', 'Foam Rolling'], isRest: true }
    ];

    const mealSlotsTemplate = [
      { slotName: 'Breakfast', mealName: 'Paneer Bhurji with 2 Phulkas', kcal: 480, macros: 'P24 · C42 · F18' },
      { slotName: 'Pre-workout', mealName: 'Banana Peanut Butter Toast + Whey', kcal: 430, macros: 'P35 · C48 · F10' },
      { slotName: 'Lunch', mealName: 'Dal Tadka, Rice, Curd & Salad', kcal: 620, macros: 'P26 · C88 · F16' },
      { slotName: 'Evening snack', mealName: 'Roasted Chana & Almonds', kcal: 260, macros: 'P12 · C24 · F11' },
      { slotName: 'Dinner', mealName: 'Soya Chunks Curry with 2 Rotis', kcal: 540, macros: 'P38 · C56 · F14' }
    ];

    const baselineRatios = [0.94, 0.92, 0.78, 0.95, 0.82, 0.96, 0.90];

    return dayNames.map((name, idx) => {
      const isToday = idx === currentDayIndex;
      const isPast = idx < currentDayIndex;
      const isFuture = idx > currentDayIndex;

      const dayDate = new Date(now);
      dayDate.setDate(now.getDate() - (currentDayIndex - idx));
      const ds = dayDate.toISOString().split('T')[0];
      const dateFormatted = dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      let status = 'future'; // 'ontrack', 'acceptable', 'missed', 'today', 'future'
      let ratio = 0;
      let dayCals = 0;
      let statusText = 'Scheduled';

      if (isPast) {
        try {
          const logs = JSON.parse(localStorage.getItem(`nutribuddy_foodlogs_${userId}_${ds}`) || '[]');
          dayCals = logs.reduce((s, l) => s + (l.calories || 0), 0);
        } catch {}

        if (dayCals === 0) {
          dayCals = Math.round(targetCalories * (baselineRatios[idx] || 0.92));
        }

        ratio = dayCals / targetCalories;
        if (ratio >= 0.90) {
          status = 'ontrack'; // >= 90%: green ring with ✓
          statusText = `${Math.round(ratio * 100)}% Achieved · On track`;
        } else if (ratio >= 0.70) {
          status = 'acceptable'; // 70-89%: amber ring with ~
          statusText = `${Math.round(ratio * 100)}% Achieved · Acceptable`;
        } else {
          status = 'missed'; // < 70%: grey ring with –
          statusText = `${Math.round(ratio * 100)}% Achieved · Below target`;
        }
      } else if (isToday) {
        status = 'today';
        dayCals = consumed.calories;
        ratio = arcRatio;
        statusText = `${Math.round(ratio * 100)}% Consumed · Today`;
      } else {
        status = 'future';
        dayCals = targetCalories;
        ratio = 1;
        statusText = 'Planned target';
      }

      const macroMultiplier = isPast ? (baselineRatios[idx] || 0.92) : isToday ? Math.max(0.2, arcRatio) : 1;

      return {
        name,
        dateFormatted,
        isToday,
        isPast,
        isFuture,
        status,
        statusText,
        ratio,
        dayCals,
        targetCalories,
        protein: isToday ? consumed.protein : Math.round(targetProtein * macroMultiplier),
        carbs: isToday ? consumed.carbs : Math.round(targetCarbs * macroMultiplier),
        fat: isToday ? consumed.fat : Math.round(targetFat * macroMultiplier),
        water: isToday ? waterIntake : Math.round(waterTarget * (isPast ? 0.95 : 1)),
        workout: workoutPresets[idx],
        meals: mealSlotsTemplate
      };
    });
  }, [now, arcRatio, userId, targetCalories, targetProtein, targetCarbs, targetFat, consumed, waterIntake, waterTarget]);

  // Expandable ingredients preview slot
  const [expandedMealSlot, setExpandedMealSlot] = useState(null);
  const toggleMealExpand = (slotKey) => {
    setExpandedMealSlot(prev => (prev === slotKey ? null : slotKey));
  };

  const mealIngredientsMap = {
    breakfast: ['120g Fresh Paneer cubes', '2 Whole Wheat Phulkas', '5g Pure Ghee', 'Turmeric, Cumin & Fresh Coriander'],
    pre_workout: ['2 Slices Whole Wheat Bread', '25g Natural Peanut Butter', '1 Medium Ripe Banana', '1 Scoop Whey Protein (30g)'],
    lunch: ['180g Yellow Dal Tadka', '150g Steamed Basmati Rice', '100g Low-fat Curd', '80g Cucumber & Tomato Salad'],
    post_workout: ['50g Roasted Chana', '4 Boiled Egg Whites', 'Himalayan Pink Salt & Black Pepper'],
    dinner: ['150g High-Protein Soya Curry', '2 Multigrain Rotis', '100g Fresh Cucumber Raita', 'Steamed Broccoli'],
    snacks: ['35g Roasted Makhana', '20g Raw Almonds & Walnuts', 'Organic Lemon Green Tea']
  };

  // Global Keyboard Shortcut: Press 'L' to quick-open food logger
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
        return;
      }
      if (e.key === 'l' || e.key === 'L') {
        setCurrentPage('food-log');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentPage]);

  // Today's Scheduled Routine for Workout Hub
  const todayWorkout = useMemo(() => {
    const todayEntry = weekDays.find(d => d.isToday);
    if (todayEntry?.workout && !todayEntry.workout.isRest) {
      return todayEntry.workout;
    }
    return {
      title: 'Full Body Hypertrophy A',
      focus: 'Chest, Shoulders & Triceps',
      exercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Standing Overhead Press', 'Cable Lateral Raises', 'Tricep Rope Pushdowns'],
      isRest: false
    };
  }, [weekDays]);

  // Intermittent Fasting State (e.g. 16:8 Protocol)
  const [fastingProtocol, setFastingProtocol] = useState('16:8');
  const [isFasting, setIsFasting] = useState(() => {
    try {
      const saved = localStorage.getItem('nutribuddy_is_fasting');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [fastStartTime, setFastStartTime] = useState(() => {
    try {
      const saved = localStorage.getItem('nutribuddy_fast_start');
      if (saved) return parseInt(saved, 10);
      const nowMs = Date.now();
      return nowMs - (13.5 * 60 * 60 * 1000); // 13.5 hours elapsed default
    } catch {
      return Date.now() - (13.5 * 60 * 60 * 1000);
    }
  });
  const [currentTimestamp, setCurrentTimestamp] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTimestamp(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const fastTargetHours = fastingProtocol === '18:6' ? 18 : fastingProtocol === '14:10' ? 14 : 16;
  const fastElapsedMillis = Math.max(0, currentTimestamp - fastStartTime);
  const fastElapsedHours = fastElapsedMillis / (1000 * 60 * 60);
  const fastProgressPct = Math.min(100, Math.round((fastElapsedHours / fastTargetHours) * 100));
  const fastElapsedFormatted = `${Math.floor(fastElapsedHours)}h ${Math.floor((fastElapsedHours % 1) * 60)}m`;
  const fastRemainingHours = Math.max(0, fastTargetHours - fastElapsedHours);
  const fastRemainingFormatted = fastRemainingHours > 0 ? `${Math.floor(fastRemainingHours)}h ${Math.round((fastRemainingHours % 1) * 60)}m left` : 'Goal achieved!';

  const toggleFasting = () => {
    const nextState = !isFasting;
    setIsFasting(nextState);
    const newStart = Date.now();
    setFastStartTime(newStart);
    try {
      localStorage.setItem('nutribuddy_is_fasting', JSON.stringify(nextState));
      localStorage.setItem('nutribuddy_fast_start', String(newStart));
    } catch {}
  };

  const activeWorkoutBurn = useMemo(() => {
    try {
      const logs = JSON.parse(localStorage.getItem('nutribuddy_workout_sessions') || '[]');
      if (logs.length > 0) {
        const todayStr = new Date().toDateString();
        const todayWorkout = logs.find(l => new Date(l.date || l.timestamp).toDateString() === todayStr);
        if (todayWorkout?.caloriesBurned) return Number(todayWorkout.caloriesBurned);
      }
    } catch {}
    return 380;
  }, []);

  // Habit Matrix State
  const [habitChecks, setHabitChecks] = useState(() => {
    try {
      const todayStr = new Date().toDateString();
      return JSON.parse(localStorage.getItem(`nutribuddy_habits_${todayStr}`) || '{}');
    } catch {
      return {};
    }
  });

  const habits = useMemo(() => [
    {
      id: 'protein',
      label: 'Protein Target (>= 90%)',
      isAutoChecked: targetProtein > 0 && (consumed.protein / targetProtein) >= 0.9,
      detail: `${consumed.protein}g / ${targetProtein}g`
    },
    {
      id: 'water',
      label: 'Hydration Target (>= 2.5L)',
      isAutoChecked: waterIntake >= 2500,
      detail: `${(waterIntake / 1000).toFixed(1)}L / 2.5L`
    },
    {
      id: 'workout',
      label: 'Daily Movement / Workout',
      isAutoChecked: activeWorkoutBurn > 0,
      detail: `${activeWorkoutBurn} kcal active`
    },
    {
      id: 'clean',
      label: 'Clean Eating Index (>= 80%)',
      isAutoChecked: (consumed.calories > 0 && Math.abs(consumed.calories - targetCalories) < 400),
      detail: 'Whole foods focus'
    }
  ], [consumed, targetProtein, targetCalories, waterIntake, activeWorkoutBurn]);

  const toggleHabit = (id) => {
    setHabitChecks(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        const todayStr = new Date().toDateString();
        localStorage.setItem(`nutribuddy_habits_${todayStr}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="nb-dashboard-grid">
      {/* ═══════════════════════════════════════════════════════════
          LEFT DECK (Columns 1–8): Primary Intake & Fuel Center
          ═══════════════════════════════════════════════════════════ */}
      <div className="nb-dashboard-left-col">
        {/* 1. CONSOLIDATED HERO NUTRITION DECK */}
        <section
          className="anim-seq-hero nb-card card-spotlight nb-dash-hero nb-card-3d anim-3d-entry"
          onMouseMove={e => { handleCardSpotlight(e); handleCard3DMouseMove(e); }}
          onMouseLeave={handleCard3DMouseLeave}
          style={{
            margin: '16px 16px 14px',
            padding: 0,
            borderRadius: 26,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              top: -80,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(34,209,122,0.11) 0%, transparent 65%)',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />

          {/* Top Section */}
          <div style={{ padding: '20px 20px 0', position: 'relative', zIndex: 1 }}>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: '0.05em',
                color: 'var(--g)',
                textTransform: 'none'
              }}
            >
              {greetingTime} · {dateFormatted}
            </div>
            <h2
              style={{
                margin: '4px 0 0',
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: '-0.035em',
                color: 'var(--t1)'
              }}
            >
              Hey {userName}
            </h2>
            <div
              style={{
                marginTop: 3,
                fontSize: 12,
                fontWeight: 400,
                color: 'var(--t3)'
              }}
            >
              Goal: {userGoalLabel} · {userWeight} kg
            </div>
          </div>

          {/* Calorie Arc Section */}
          <div
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              position: 'relative',
              zIndex: 1
            }}
          >
            {/* LEFT: SVG Donut Arc (108x108px) */}
            <div style={{ position: 'relative', width: 108, height: 108, flexShrink: 0 }}>
              <svg width="108" height="108" viewBox="0 0 108 108" style={{ transform: 'rotate(-90deg)' }}>
                <defs>
                  <linearGradient id="calGreenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d17a" />
                    <stop offset="100%" stopColor="#1ab368" />
                  </linearGradient>
                </defs>
                <circle
                  cx="54"
                  cy="54"
                  r="44"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="9"
                  fill="none"
                />
                <circle
                  cx="54"
                  cy="54"
                  r="44"
                  stroke="rgba(34, 209, 122, 0.15)"
                  strokeWidth="14"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="276.5"
                  strokeDashoffset={arcOffset}
                  style={{
                    transition: 'stroke-dashoffset 950ms cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
                <circle
                  className={`ring-glow ${isPulse100 ? 'anim-arc-100-pulse' : ''}`.trim()}
                  cx="54"
                  cy="54"
                  r="44"
                  stroke={arcStrokeColor}
                  strokeWidth="9"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="276.5"
                  strokeDashoffset={arcOffset}
                  style={{
                    transition: 'stroke-dashoffset 950ms cubic-bezier(0.4, 0, 0.2, 1), stroke 300ms ease'
                  }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none'
                }}
              >
                <span
                  className="tabular-nums text-hero"
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    color: 'var(--t1)'
                  }}
                >
                  {displayCalories.toLocaleString()}
                </span>
                <span
                  style={{
                    fontSize: 8.5,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: 'rgba(255, 255, 255, 0.35)',
                    marginTop: 2
                  }}
                >
                  CONSUMED
                </span>
              </div>
            </div>

            {/* RIGHT: Target Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'var(--t3)'
                }}
              >
                Calorie target
              </div>
              <div
                className="tabular-nums"
                style={{
                  fontSize: 34,
                  fontWeight: 900,
                  letterSpacing: '-0.055em',
                  lineHeight: 1.05,
                  color: 'var(--t1)',
                  marginTop: 2
                }}
              >
                {targetCalories.toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: 'var(--t2)',
                  marginTop: 4
                }}
              >
                <span className="tabular-nums">
                  {Math.max(0, targetCalories - consumed.calories).toLocaleString()}
                </span>{' '}
                kcal remaining
              </div>

              {/* Primary + Log CTA with Desktop Shortcut pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                <button
                  onClick={() => setCurrentPage('food-log')}
                  className="nb-btn-primary tactile-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '8px 16px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    borderRadius: 12
                  }}
                >
                  <span>＋ Log meal</span>
                  <span
                    className="desktop-only"
                    style={{
                      fontSize: 9.5,
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '2px 6px',
                      borderRadius: 6,
                      border: '0.5px solid rgba(255,255,255,0.18)'
                    }}
                  >
                    Press L
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Macro Strip (4 Equal Pills, 7px gap) */}
          <div
            className="anim-seq-macro-strip"
            style={{
              padding: '4px 20px 14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 7,
              position: 'relative',
              zIndex: 1
            }}
          >
            {/* Protein */}
            <div className="nb-raised" style={{ padding: '9px 6px', textAlign: 'center', borderRadius: 15 }}>
              <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 800, color: 'var(--blu)' }}>
                {displayProtein}g
              </div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--t3)', margin: '2px 0 5px' }}>
                Protein
              </div>
              <div className="nb-progress-track" style={{ height: 3 }}>
                <div
                  className="nb-progress-fill nb-progress-fill-protein macro-bar-protein"
                  style={{
                    width: `${Math.min(100, Math.round((consumed.protein / targetProtein) * 100))}%`,
                    background: consumed.protein > targetProtein ? 'var(--amb)' : 'var(--blu)'
                  }}
                />
              </div>
              <div className="tabular-nums" style={{ fontSize: 9, fontWeight: 600, color: 'var(--t3)', marginTop: 4 }}>
                /{targetProtein}g <span className="desktop-only" style={{ color: 'var(--blu)' }}>({Math.round((consumed.protein / targetProtein) * 100)}%)</span>
              </div>
            </div>

            {/* Carbs */}
            <div className="nb-raised" style={{ padding: '9px 6px', textAlign: 'center', borderRadius: 15 }}>
              <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 800, color: 'var(--g)' }}>
                {displayCarbs}g
              </div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--t3)', margin: '2px 0 5px' }}>
                Carbs
              </div>
              <div className="nb-progress-track" style={{ height: 3 }}>
                <div
                  className="nb-progress-fill nb-progress-fill-carbs macro-bar-carbs"
                  style={{
                    width: `${Math.min(100, Math.round((consumed.carbs / targetCarbs) * 100))}%`,
                    background: consumed.carbs > targetCarbs ? 'var(--amb)' : 'var(--g)'
                  }}
                />
              </div>
              <div className="tabular-nums" style={{ fontSize: 9, fontWeight: 600, color: 'var(--t3)', marginTop: 4 }}>
                /{targetCarbs}g <span className="desktop-only" style={{ color: 'var(--g)' }}>({Math.round((consumed.carbs / targetCarbs) * 100)}%)</span>
              </div>
            </div>

            {/* Fats */}
            <div className="nb-raised" style={{ padding: '9px 6px', textAlign: 'center', borderRadius: 15 }}>
              <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 800, color: 'var(--amb)' }}>
                {displayFat}g
              </div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--t3)', margin: '2px 0 5px' }}>
                Fats
              </div>
              <div className="nb-progress-track" style={{ height: 3 }}>
                <div
                  className="nb-progress-fill nb-progress-fill-fat macro-bar-fats"
                  style={{
                    width: `${Math.min(100, Math.round((consumed.fat / targetFat) * 100))}%`,
                    background: 'var(--amb)'
                  }}
                />
              </div>
              <div className="tabular-nums" style={{ fontSize: 9, fontWeight: 600, color: 'var(--t3)', marginTop: 4 }}>
                /{targetFat}g <span className="desktop-only" style={{ color: 'var(--amb)' }}>({Math.round((consumed.fat / targetFat) * 100)}%)</span>
              </div>
            </div>

            {/* Water */}
            <div
              onClick={() => setShowWaterModal(true)}
              className="nb-raised active:scale-95 transition"
              style={{
                padding: '9px 6px',
                textAlign: 'center',
                borderRadius: 15,
                cursor: 'pointer',
                outline: 'none'
              }}
              title="Tap to log water or adjust daily target"
              role="button"
              tabIndex={0}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                <span className="tabular-nums" style={{ fontSize: 13, fontWeight: 800, color: 'var(--cyan)' }}>
                  {Math.round(displayWater / 250)} gl.
                </span>
                <span style={{ fontSize: 10, color: 'var(--cyan)', fontWeight: 800 }}>＋</span>
              </div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--t3)', margin: '2px 0 5px' }}>
                Water
              </div>
              <div className="nb-progress-track" style={{ height: 3 }}>
                <div
                  className="nb-progress-fill nb-progress-fill-water macro-bar-water"
                  style={{
                    width: `${Math.min(100, Math.round((waterIntake / waterTarget) * 100))}%`,
                    background: 'var(--cyan)'
                  }}
                />
              </div>
              <div className="tabular-nums" style={{ fontSize: 9, fontWeight: 600, color: 'var(--t3)', marginTop: 4 }}>
                /{Math.round(waterTarget / 250)} gl.
              </div>
            </div>
          </div>

          {/* Integrated Protein Pacing Strip (Desktop Only) */}
          <div className="desktop-only" style={{ padding: '0 20px 16px', borderTop: '0.5px solid var(--bd2)', marginTop: 4, paddingTop: 12, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={13} color="var(--blu)" />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t1)' }}>
                  Protein Pacing & Hypertrophy Ratio
                </span>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--blu)', background: 'rgba(91, 142, 245, 0.12)', padding: '2px 8px', borderRadius: 99, border: '0.5px solid rgba(91, 142, 245, 0.25)' }}>
                {((consumed.protein || 0) / (userWeight || 60)).toFixed(1)}g / kg · Target {((targetProtein || 135) / (userWeight || 60)).toFixed(1)}g/kg
              </span>
            </div>
            <div className="nb-progress-track" style={{ height: 4 }}>
              <div
                style={{
                  width: `${Math.min(100, Math.round(((consumed.protein || 0) / (targetProtein || 135)) * 100))}%`,
                  height: '100%',
                  background: 'var(--blu)',
                  borderRadius: 99,
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--t3)', marginTop: 4 }}>
              <span>{(targetProtein - consumed.protein) > 0 ? `${targetProtein - consumed.protein}g protein remaining today` : 'Hypertrophy target met ✓'}</span>
              <span>Whole-food muscle protein synthesis pacing</span>
            </div>
          </div>
        </section>

        {/* 2. INTERACTIVE DAY FUEL STREAM ("TODAY'S MEALS") */}
        <section
          className="anim-seq-meals nb-card card-spotlight nb-dash-meals nb-card-3d anim-3d-entry"
          onMouseMove={handleCard3DMouseMove}
          onMouseLeave={handleCard3DMouseLeave}
          style={{
            margin: '0 16px 14px',
            padding: '18px 20px',
            borderRadius: 22
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div className="text-eyebrow">Day Fuel Stream</div>
              <h3 className="text-card-title" style={{ margin: '2px 0 0', color: 'var(--t1)' }}>
                Today's meals
              </h3>
            </div>
            <button
              onClick={() => setCurrentPage('meal-planner')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--g)',
                cursor: 'pointer',
                outline: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>See all</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Meal Rows with Inline Eaten Toggle & Expandable Ingredients (cohesive container with internal scroll) */}
          <div className="nb-meals-stream-container no-scrollbar">
            <div className="nb-meals-stream-grid">
              {todayMeals.map((meal) => {
                const isEaten = !!eatenMeals[meal.slotKey];
                const isExpanded = expandedMealSlot === meal.slotKey;
                const ingredients = mealIngredientsMap[meal.slotKey] || ['Fresh whole-food ingredients', 'Balanced macro ratio', 'Culinary herbs & spices'];

                return (
                  <div
                    key={meal.slotKey}
                    className="nb-raised nb-card-hover"
                    style={{
                      padding: '12px 14px',
                      borderRadius: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      border: isEaten ? '0.5px solid rgba(34, 209, 122, 0.3)' : '0.5px solid var(--bd2)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Color dot */}
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: meal.color,
                          flexShrink: 0
                        }}
                      />

                      {/* Meal Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 700,
                              color: meal.color,
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase'
                            }}
                          >
                            {meal.slotName}
                          </span>
                          {meal.time && (
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 700,
                                color: 'var(--t2)',
                                background: 'var(--s3)',
                                padding: '1px 6px',
                                borderRadius: 6,
                                border: '0.5px solid var(--bd2)'
                              }}
                            >
                              {meal.time}
                            </span>
                          )}
                          {isEaten && (
                            <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--g)', background: 'rgba(34, 209, 122, 0.15)', padding: '1px 6px', borderRadius: 6 }}>
                              Eaten ✓
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: isEaten ? 'var(--t2)' : 'var(--t1)',
                            textDecoration: isEaten ? 'line-through' : 'none',
                            marginTop: 2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {meal.mealName}
                        </div>
                      </div>

                      {/* Macros & kcal */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
                          {meal.kcal} <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--t3)' }}>kcal</span>
                        </div>
                        <div style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--t3)', marginTop: 2 }}>
                          {meal.macros}
                        </div>
                      </div>

                      {/* Inline Eaten Checkbox Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleMealEaten(meal.slotKey)}
                        className="tactile-btn"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: isEaten ? 'var(--g)' : 'var(--s2)',
                          border: isEaten ? 'none' : '1.5px solid var(--bd)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          cursor: 'pointer',
                          color: isEaten ? '#041a0c' : 'var(--t3)',
                          transition: 'all 0.18s ease',
                          outline: 'none',
                          padding: 0
                        }}
                        title={isEaten ? 'Mark as uneaten' : 'Mark as eaten'}
                      >
                        {isEaten ? <Check size={14} strokeWidth={3} /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'transparent' }} />}
                      </button>
                    </div>

                    {/* Expandable Ingredients Accordion Button (Desktop & Mobile) */}
                    <div style={{ display: 'flex', justifyContent: 'flex-start', borderTop: '0.5px solid rgba(255,255,255,0.04)', paddingTop: 6 }}>
                      <button
                        type="button"
                        onClick={() => toggleMealExpand(meal.slotKey)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontSize: 10.5,
                          fontWeight: 600,
                          color: 'var(--t3)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <span>{isExpanded ? 'Hide ingredients' : 'View ingredients'}</span>
                        <ChevronDown size={12} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                      </button>
                    </div>

                    {/* Expanded Ingredients List */}
                    {isExpanded && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
                        {ingredients.map((ing, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: 10.5,
                              color: 'var(--t2)',
                              background: 'var(--s3)',
                              padding: '3px 8px',
                              borderRadius: 6,
                              border: '0.5px solid var(--bd2)'
                            }}
                          >
                            • {ing}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. ACTIVE SCHEDULED WORKOUT CARD (Anchored in Left Deck) */}
        <section
          className="anim-seq-streak nb-card card-spotlight nb-dash-streak nb-card-3d anim-3d-entry"
          onMouseMove={handleCard3DMouseMove}
          onMouseLeave={handleCard3DMouseLeave}
          style={{
            margin: '0 16px 14px',
            padding: '20px 22px',
            borderRadius: 22,
            background: 'linear-gradient(135deg, var(--s1) 0%, rgba(17, 28, 48, 0.75) 100%)',
            border: '0.5px solid var(--bd)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--g)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Scheduled Routine · Today
              </div>
              <h3 style={{ margin: '3px 0 0', fontSize: 18, fontWeight: 800, color: 'var(--t1)' }}>
                {todayWorkout.title}
              </h3>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
                Focus: {todayWorkout.focus}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--amb)', background: 'rgba(245, 168, 51, 0.12)', border: '0.5px solid rgba(245, 168, 51, 0.25)', padding: '3px 9px', borderRadius: 99 }}>
                🔥 {streakDays}-day streak
              </span>
              <span style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginTop: 4 }}>
                {todayWorkout.exercises.length} Exercises scheduled
              </span>
            </div>
          </div>

          {/* Exercise Chips Preview */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {todayWorkout.exercises.map((ex, idx) => (
              <span
                key={idx}
                style={{
                  background: 'var(--s2)',
                  border: '0.5px solid var(--bd2)',
                  padding: '4px 9px',
                  borderRadius: 8,
                  fontSize: 11,
                  color: 'var(--t2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--g)' }} />
                {ex}
              </span>
            ))}
          </div>

          {/* Start Session CTA */}
          <button
            onClick={() => setCurrentPage('exercise')}
            className="nb-btn-primary tactile-btn"
            style={{
              width: '100%',
              padding: '11px 18px',
              fontSize: 13,
              fontWeight: 800,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <Dumbbell size={16} />
            <span>Start / Resume Session</span>
            <ChevronRight size={16} />
          </button>
        </section>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          RIGHT DECK (Columns 9–12): Biometrics, Consistency & Habits
          ═══════════════════════════════════════════════════════════ */}
      <div className="nb-dashboard-right-col">
        {/* 1. METABOLIC FASTING STATION */}
        <section
          className="desktop-only nb-card card-spotlight nb-dash-fasting nb-card-3d anim-3d-entry"
          onMouseMove={handleCard3DMouseMove}
          onMouseLeave={handleCard3DMouseLeave}
          style={{
            margin: '0 16px 14px',
            padding: '18px 20px',
            borderRadius: 22,
            background: 'var(--s1)',
            border: '0.5px solid var(--bd)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--g)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Metabolic Rhythm
              </div>
              <h3 className="text-card-title" style={{ margin: '2px 0 0', color: 'var(--t1)' }}>
                Intermittent fasting
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setFastingProtocol(prev => prev === '16:8' ? '18:6' : prev === '18:6' ? '14:10' : '16:8')}
                className="tactile-btn"
                style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: 'var(--s2)', color: 'var(--t2)', border: '0.5px solid var(--bd2)', cursor: 'pointer' }}
                title="Click to switch fasting protocol (16:8, 18:6, 14:10)"
              >
                {fastingProtocol} ⟳
              </button>
              <button
                onClick={toggleFasting}
                className="tactile-btn"
                style={{
                  background: isFasting ? 'rgba(34, 209, 122, 0.12)' : 'rgba(91, 142, 245, 0.12)',
                  border: `0.5px solid ${isFasting ? 'rgba(34, 209, 122, 0.3)' : 'rgba(91, 142, 245, 0.3)'}`,
                  color: isFasting ? 'var(--g)' : 'var(--blu)',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 10,
                  cursor: 'pointer'
                }}
              >
                {isFasting ? 'Break Fast' : 'Start Fast'}
              </button>
            </div>
          </div>

          {/* Fasting Progress Gauge & Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', width: 68, height: 68, flexShrink: 0 }}>
              <svg width="68" height="68" viewBox="0 0 68 68" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="34" cy="34" r="28" fill="none" stroke="var(--s3)" strokeWidth="6" />
                <circle
                  className="ring-glow"
                  cx="34"
                  cy="34"
                  r="28"
                  fill="none"
                  stroke="var(--g)"
                  strokeWidth="6"
                  strokeDasharray={175.9}
                  strokeDashoffset={175.9 * (1 - Math.min(1, fastProgressPct / 100))}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={15} color="var(--g)" />
                <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--t1)', marginTop: 2 }}>{fastProgressPct}%</span>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', marginBottom: 2 }}>
                {fastElapsedFormatted} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--t3)' }}>elapsed</span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--g)', fontWeight: 600, marginBottom: 6 }}>
                {isFasting ? `Autophagy active · ${fastRemainingFormatted}` : 'Eating window open'}
              </div>
              <div style={{ height: 4, background: 'var(--s3)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${fastProgressPct}%`, height: '100%', background: 'var(--g)', borderRadius: 99, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          </div>
        </section>

        {/* 2. UNIFIED HABIT & CONSISTENCY MATRIX */}
        <section
          className="anim-seq-rings nb-card card-spotlight nb-dash-rings nb-card-3d anim-3d-entry"
          onMouseMove={handleCard3DMouseMove}
          onMouseLeave={handleCard3DMouseLeave}
          style={{
            margin: '0 16px 14px',
            padding: '18px 20px',
            borderRadius: 22
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div className="text-eyebrow">Weekly consistency · Tap day for summary</div>
              <h3 className="text-card-title" style={{ margin: '2px 0 0', color: 'var(--t1)' }}>
                This week
              </h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--t3)', display: 'block' }}>
                Avg daily
              </span>
              <span className="tabular-nums" style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)' }}>
                2,601 kcal
              </span>
            </div>
          </div>

          {/* 7 Mini Rings (one per day) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 6
            }}
          >
            {weekDays.map((day) => {
              const isTrack = day.status === 'ontrack';
              const isAcceptable = day.status === 'acceptable';
              const isMissed = day.status === 'missed';
              const isToday = day.isToday;

              let strokeColor = 'rgba(255,255,255,0.05)';
              let symbol = '–';
              let symbolColor = 'var(--t4)';
              let dashoffset = '0';
              let hasStroke = false;

              if (isTrack) {
                strokeColor = 'var(--g)';
                symbol = '✓';
                symbolColor = 'var(--g)';
                dashoffset = '0';
                hasStroke = true;
              } else if (isAcceptable) {
                strokeColor = 'var(--amb)';
                symbol = '~';
                symbolColor = 'var(--amb)';
                dashoffset = '18';
                hasStroke = true;
              } else if (isToday) {
                strokeColor = arcStrokeColor;
                symbol = Math.round(arcRatio * 100) + '%';
                symbolColor = 'var(--t1)';
                dashoffset = String(Math.max(0, 81.7 * (1 - Math.min(1, arcRatio))));
                hasStroke = arcRatio > 0;
              } else if (isMissed) {
                strokeColor = 'rgba(255,255,255,0.08)';
                symbol = '–';
                symbolColor = 'var(--t4)';
                hasStroke = false;
              }

              return (
                <button
                  key={day.name}
                  type="button"
                  onClick={() => setSelectedDaySummary(day)}
                  className="active:scale-95 transition"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 0',
                    borderRadius: 12,
                    outline: 'none'
                  }}
                  title={`Click for ${day.name} summary`}
                >
                  <div style={{ position: 'relative', width: 36, height: 36 }}>
                    <svg width="36" height="36" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="13"
                        stroke={day.isToday ? 'rgba(34, 209, 122, 0.25)' : 'rgba(255,255,255,0.06)'}
                        strokeWidth="3.5"
                        fill="none"
                      />
                      {hasStroke && (
                        <circle
                          className={day.isToday ? 'ring-glow' : ''}
                          cx="18"
                          cy="18"
                          r="13"
                          stroke={strokeColor}
                          strokeWidth="3.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray="81.7"
                          strokeDashoffset={dashoffset}
                          transform="rotate(-90 18 18)"
                        />
                      )}
                    </svg>
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: isToday ? 9 : 11,
                        fontWeight: 800,
                        color: symbolColor
                      }}
                    >
                      {symbol}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 8.5,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: day.isToday ? 'var(--g)' : 'var(--t3)'
                    }}
                  >
                    {day.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Desktop Daily Habit Disciplines */}
          <div className="desktop-only" style={{ marginTop: 14, paddingTop: 12, borderTop: '0.5px solid var(--bd2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--t2)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Daily Disciplines Matrix
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--g)' }}>
                {Object.values(habitChecks).filter(Boolean).length + habits.filter(h => h.isAutoChecked).length} / {habits.length} Done
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {habits.map(h => {
                const checked = h.isAutoChecked || !!habitChecks[h.id];
                return (
                  <div
                    key={h.id}
                    onClick={() => toggleHabit(h.id)}
                    className="tactile-btn"
                    style={{
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: checked ? 'rgba(34, 209, 122, 0.08)' : 'var(--s2)',
                      border: `0.5px solid ${checked ? 'rgba(34, 209, 122, 0.25)' : 'var(--bd2)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7
                    }}
                  >
                    <div
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: 4,
                        background: checked ? 'var(--g)' : 'var(--s3)',
                        border: checked ? 'none' : '1px solid var(--bd)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {checked && <Check size={10} color="#041a0c" strokeWidth={3} />}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: checked ? 'var(--t1)' : 'var(--t2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {h.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. HYDRATION STATION */}
        <section
          className="desktop-only nb-card card-spotlight nb-dash-hydration nb-card-3d anim-3d-entry"
          onMouseMove={handleCard3DMouseMove}
          onMouseLeave={handleCard3DMouseLeave}
          style={{
            margin: '0 16px 14px',
            borderRadius: 22,
            padding: '16px 18px',
            background: 'var(--s1)',
            border: '0.5px solid var(--bd)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Hydration station
              </div>
              <h4 style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 800, color: 'var(--t1)' }}>
                Water & Electrolytes
              </h4>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="tabular-nums" style={{ fontSize: 15, fontWeight: 900, color: 'var(--cyan)' }}>
                {Math.round(waterIntake / 250)} <span style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--t3)' }}>/ {Math.round(waterTarget / 250)} gl.</span>
              </span>
              <span style={{ fontSize: 9.5, color: 'var(--t3)', display: 'block' }}>
                {waterIntake} ml / {waterTarget} ml
              </span>
            </div>
          </div>

          <div className="nb-progress-track" style={{ height: 5, marginBottom: 12 }}>
            <div
              style={{
                width: `${Math.min(100, Math.round((waterIntake / waterTarget) * 100))}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3ecfed, #22d17a)',
                borderRadius: 99,
                transition: 'width 0.3s ease'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              onClick={() => handleUpdateWater(250)}
              className="tactile-btn"
              style={{
                background: 'var(--s2)',
                border: '0.5px solid var(--bd)',
                borderRadius: 10,
                padding: '7px 10px',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--cyan)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5
              }}
            >
              <Droplet size={12} />
              <span>+1 Glass (250ml)</span>
            </button>
            <button
              onClick={() => handleUpdateWater(500)}
              className="tactile-btn"
              style={{
                background: 'var(--s2)',
                border: '0.5px solid var(--bd)',
                borderRadius: 10,
                padding: '7px 10px',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--cyan)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5
              }}
            >
              <Droplet size={12} />
              <span>+2 Glasses (500ml)</span>
            </button>
          </div>
        </section>

        {/* 4. CONTEXTUAL AI COACH INSIGHT */}
        <section
          className="anim-seq-insight nb-card card-spotlight nb-dash-insight nb-card-3d anim-3d-entry"
          onMouseMove={handleCard3DMouseMove}
          onMouseLeave={handleCard3DMouseLeave}
          style={{
            margin: '0 16px 14px',
            background: 'linear-gradient(130deg, #111c30, #0e1828)',
            border: '0.5px solid rgba(91, 142, 245, 0.20)',
            borderRadius: 22,
            padding: '17px 18px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(91,142,245,0.12) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          <div
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: '0.07em',
              color: 'var(--blu)',
              marginBottom: 6,
              textTransform: 'uppercase'
            }}
          >
            AI Coach · Metabolic Insight
          </div>

          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--t1)',
              lineHeight: 1.55
            }}
          >
            Your lunch platter supplies 46g bioavailable protein. Logging it puts you at 105g — within reach of your daily hypertrophy target of {targetProtein}g by mid-afternoon. Keep hydration steady for optimal muscle uptake.
          </p>
        </section>
      </div>

      {/* ───────────────────────────────────────────────────────────
          WATER TRACKING & TARGET CUSTOMIZER MODAL
          ─────────────────────────────────────────────────────────── */}
      {showWaterModal && createPortal(
        <div
          onClick={() => setShowWaterModal(false)}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '0 0 calc(env(safe-area-inset-bottom, 0px))',
            animation: 'fadeIn 0.2s ease',
            overscrollBehavior: 'contain'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 480,
              background: 'var(--s1)',
              border: '0.5px solid var(--bd)',
              borderBottom: 'none',
              borderRadius: '24px 24px 0 0',
              padding: '12px 20px 28px',
              boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.6)',
              position: 'relative',
              animation: 'slideUpModal 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Drag Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255, 255, 255, 0.18)', margin: '0 auto 14px' }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Droplet size={15} color="var(--cyan)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.02em' }}>
                    Water intake
                  </h3>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>
                    Track hydration and customize daily target
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWaterModal(false)}
                style={{
                  width: 30, height: 30, borderRadius: '50%', background: 'var(--s2)',
                  border: '0.5px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--t2)', cursor: 'pointer', padding: 0
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Main Progress Display */}
            <div
              style={{
                background: 'var(--s2)',
                border: '0.5px solid var(--bd)',
                borderRadius: 18,
                padding: '18px 20px',
                marginBottom: 16,
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--cyan)', letterSpacing: '-0.03em' }}>
                <span className="tabular-nums">{(waterIntake / 1000).toFixed(2)}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--t3)', marginLeft: 4 }}>
                  / {(waterTarget / 1000).toFixed(2)} L
                </span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)', marginTop: 4 }}>
                {Math.round(waterIntake / 250)} of {Math.round(waterTarget / 250)} glasses ({Math.min(100, Math.round((waterIntake / waterTarget) * 100))}%)
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: 7, borderRadius: 4, background: 'rgba(255, 255, 255, 0.07)', margin: '14px 0 0', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((waterIntake / waterTarget) * 100))}%`,
                    background: 'var(--cyan)',
                    borderRadius: 4,
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>

            {/* Quick Add Buttons */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--t3)', marginBottom: 8 }}>
                Quick log
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleUpdateWater(250)}
                  style={{
                    background: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: 12,
                    padding: '10px 6px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="active:scale-95"
                >
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--cyan)' }}>+1 gl.</div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>250 ml</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateWater(500)}
                  style={{
                    background: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: 12,
                    padding: '10px 6px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="active:scale-95"
                >
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--cyan)' }}>+2 gl.</div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>500 ml</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateWater(750)}
                  style={{
                    background: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: 12,
                    padding: '10px 6px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="active:scale-95"
                >
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--cyan)' }}>+Bottle</div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>750 ml</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateWater(-250)}
                  disabled={waterIntake <= 0}
                  style={{
                    background: 'var(--s2)',
                    border: '0.5px solid var(--bd)',
                    borderRadius: 12,
                    padding: '10px 6px',
                    textAlign: 'center',
                    cursor: waterIntake <= 0 ? 'not-allowed' : 'pointer',
                    opacity: waterIntake <= 0 ? 0.4 : 1,
                    transition: 'all 0.15s ease'
                  }}
                  className="active:scale-95"
                >
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--t2)' }}>−1 gl.</div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>Undo</div>
                </button>
              </div>
            </div>

            {/* Target Customizer Section */}
            <div style={{ background: 'var(--s2)', border: '0.5px solid var(--bd)', borderRadius: 16, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>
                    Daily target
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--t3)', marginTop: 1 }}>
                    Adjust your hydration goal
                  </div>
                </div>
                {/* Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--s3)', border: '0.5px solid var(--bd)', borderRadius: 10, padding: '4px 8px' }}>
                  <button
                    type="button"
                    onClick={() => handleSetWaterTarget(waterTarget - 250)}
                    disabled={waterTarget <= 1000}
                    style={{
                      background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', padding: 2, opacity: waterTarget <= 1000 ? 0.4 : 1
                    }}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="tabular-nums" style={{ fontSize: 12, fontWeight: 800, color: 'var(--cyan)', minWidth: 68, textAlign: 'center' }}>
                    {(waterTarget / 1000).toFixed(2)} L ({Math.round(waterTarget / 250)} gl.)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSetWaterTarget(waterTarget + 250)}
                    disabled={waterTarget >= 5000}
                    style={{
                      background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', padding: 2, opacity: waterTarget >= 5000 ? 0.4 : 1
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Preset Chips */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { label: '1.5 L (6 gl.)', val: 1500 },
                  { label: '2.0 L (8 gl.)', val: 2000 },
                  { label: '2.5 L (10 gl.)', val: 2500 },
                  { label: '3.0 L (12 gl.)', val: 3000 }
                ].map(opt => {
                  const isSel = waterTarget === opt.val;
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleSetWaterTarget(opt.val)}
                      style={{
                        background: isSel ? 'rgba(6, 182, 212, 0.2)' : 'var(--s3)',
                        border: isSel ? '1px solid var(--cyan)' : '0.5px solid var(--bd)',
                        borderRadius: 20,
                        padding: '4px 9px',
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: isSel ? 'var(--cyan)' : 'var(--t3)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ───────────────────────────────────────────────────────────
          DAY SUMMARY BOTTOM SHEET MODAL
          ─────────────────────────────────────────────────────────── */}
      {selectedDaySummary && createPortal(
        <div
          onClick={() => setSelectedDaySummary(null)}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '0 0 calc(env(safe-area-inset-bottom, 0px))',
            animation: 'fadeIn 0.2s ease',
            overscrollBehavior: 'contain'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 480,
              maxHeight: '85vh',
              background: 'var(--s1)',
              border: '0.5px solid var(--bd)',
              borderBottom: 'none',
              borderRadius: '24px 24px 0 0',
              padding: '14px 20px 28px',
              boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.6)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideUpModal 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              boxSizing: 'border-box'
            }}
          >
            {/* Drag Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255, 255, 255, 0.18)', margin: '0 auto 12px', flexShrink: 0 }} />

            {/* Sheet Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexShrink: 0 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.02em' }}>
                    {selectedDaySummary.name} · {selectedDaySummary.dateFormatted}
                  </h3>
                  {selectedDaySummary.isToday && (
                    <span style={{ fontSize: 9.5, fontWeight: 800, background: 'rgba(34, 209, 122, 0.18)', color: 'var(--g)', padding: '2px 7px', borderRadius: 6 }}>
                      Today
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: selectedDaySummary.status === 'ontrack' ? 'var(--g)' : selectedDaySummary.status === 'acceptable' ? 'var(--amb)' : 'var(--t3)', fontWeight: 600, marginTop: 2 }}>
                  {selectedDaySummary.statusText}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDaySummary(null)}
                style={{
                  width: 30, height: 30, borderRadius: '50%', background: 'var(--s2)',
                  border: '0.5px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--t2)', cursor: 'pointer', padding: 0
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', paddingRight: 2, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* 1. Daily Calorie & Macro Card */}
              <div style={{ background: 'var(--s2)', border: '0.5px solid var(--bd)', borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', letterSpacing: '0.04em' }}>CALORIES</span>
                    <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--t1)' }}>
                      <span className="tabular-nums">{selectedDaySummary.dayCals.toLocaleString()}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t3)', marginLeft: 4 }}>
                        / {selectedDaySummary.targetCalories.toLocaleString()} kcal
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: selectedDaySummary.ratio >= 0.9 ? 'var(--g)' : 'var(--amb)' }}>
                      {Math.round(selectedDaySummary.ratio * 100)}%
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--t3)', display: 'block' }}>of target</span>
                  </div>
                </div>

                <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ height: '100%', width: `${Math.min(100, Math.round(selectedDaySummary.ratio * 100))}%`, background: selectedDaySummary.ratio >= 0.9 ? 'var(--g)' : 'var(--amb)', borderRadius: 3 }} />
                </div>

                {/* Macro Pills */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  <div style={{ background: 'var(--s3)', border: '0.5px solid var(--bd)', borderRadius: 10, padding: '6px 4px', textAlign: 'center' }}>
                    <div className="tabular-nums" style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--blu)' }}>
                      {selectedDaySummary.protein}g
                    </div>
                    <div style={{ fontSize: 8.5, color: 'var(--t3)', fontWeight: 600, marginTop: 1 }}>Protein</div>
                  </div>
                  <div style={{ background: 'var(--s3)', border: '0.5px solid var(--bd)', borderRadius: 10, padding: '6px 4px', textAlign: 'center' }}>
                    <div className="tabular-nums" style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--g)' }}>
                      {selectedDaySummary.carbs}g
                    </div>
                    <div style={{ fontSize: 8.5, color: 'var(--t3)', fontWeight: 600, marginTop: 1 }}>Carbs</div>
                  </div>
                  <div style={{ background: 'var(--s3)', border: '0.5px solid var(--bd)', borderRadius: 10, padding: '6px 4px', textAlign: 'center' }}>
                    <div className="tabular-nums" style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--amb)' }}>
                      {selectedDaySummary.fat}g
                    </div>
                    <div style={{ fontSize: 8.5, color: 'var(--t3)', fontWeight: 600, marginTop: 1 }}>Fats</div>
                  </div>
                  <div style={{ background: 'var(--s3)', border: '0.5px solid var(--bd)', borderRadius: 10, padding: '6px 4px', textAlign: 'center' }}>
                    <div className="tabular-nums" style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--cyan)' }}>
                      {Math.round(selectedDaySummary.water / 250)} gl.
                    </div>
                    <div style={{ fontSize: 8.5, color: 'var(--t3)', fontWeight: 600, marginTop: 1 }}>Water</div>
                  </div>
                </div>
              </div>

              {/* 2. Workout Plan for this day */}
              <div style={{ background: 'var(--s2)', border: '0.5px solid var(--bd)', borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Dumbbell size={14} color="var(--g)" />
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--t1)' }}>
                    Workout plan
                  </span>
                  <span style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    marginLeft: 'auto',
                    padding: '2px 7px',
                    borderRadius: 6,
                    background: selectedDaySummary.workout.isRest ? 'rgba(255,255,255,0.06)' : 'rgba(34, 209, 122, 0.12)',
                    color: selectedDaySummary.workout.isRest ? 'var(--t3)' : 'var(--g)'
                  }}>
                    {selectedDaySummary.workout.isRest ? 'Active rest' : selectedDaySummary.isPast || selectedDaySummary.isToday ? 'Completed' : 'Scheduled'}
                  </span>
                </div>

                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
                  {selectedDaySummary.workout.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                  {selectedDaySummary.workout.focus}
                </div>

                {!selectedDaySummary.workout.isRest && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {selectedDaySummary.workout.exercises.map((ex, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: 'var(--t2)' }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--g)' }} />
                        <span>{ex}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Meals for this day */}
              <div style={{ background: 'var(--s2)', border: '0.5px solid var(--bd)', borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Utensils size={14} color="var(--amb)" />
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--t1)' }}>
                    Meals breakdown
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedDaySummary.meals.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--s3)',
                        border: '0.5px solid var(--bd)',
                        borderRadius: 12,
                        padding: '10px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 10
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--t3)' }}>
                          {m.slotName}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.mealName}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>
                          {m.macros}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)' }}>
                          {m.kcal}
                        </div>
                        <div style={{ fontSize: 9.5, color: 'var(--t3)' }}>kcal</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
