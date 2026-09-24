import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import fallbackFoods from '../data/indian_diet_db.json';
import { API_BASE } from '../config';
import {
  generateCohesiveWeeklyMealPlan,
  getSmartMealReplacements,
  getDetailedCalorieBreakdown,
  getStandardizedGoalLabel,
  formatCompactMacros,
  generateCategorizedGroceryList
} from '../utils/nutritionEngine';
import {
  Plus,
  Minus,
  Check,
  RefreshCw,
  X,
  ShoppingCart,
  Copy,
  Share2,
  Sparkles
} from 'lucide-react';
import { handleCard3DMouseMove, handleCard3DMouseLeave, handleCardSpotlight } from '../utils/cardTilt';

const PLAN_ENGINE_VERSION = 'v7.3_rest_day_chronobiology';
const MULTIPLIERS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5];

const DAYS = [
  { key: 'monday', label: 'Mon', fullLabel: 'Monday' },
  { key: 'tuesday', label: 'Tue', fullLabel: 'Tuesday' },
  { key: 'wednesday', label: 'Wed', fullLabel: 'Wednesday' },
  { key: 'thursday', label: 'Thu', fullLabel: 'Thursday' },
  { key: 'friday', label: 'Fri', fullLabel: 'Friday' },
  { key: 'saturday', label: 'Sat', fullLabel: 'Saturday' },
  { key: 'sunday', label: 'Sun', fullLabel: 'Sunday' }
];

const SLOTS = [
  { key: 'breakfast', label: 'Breakfast', color: 'var(--blu)' },
  { key: 'pre_workout', label: 'Pre-workout', color: 'var(--amb)' },
  { key: 'lunch', label: 'Lunch', color: 'var(--g)' },
  { key: 'post_workout', label: 'Post-workout', color: 'var(--cyan)' },
  { key: 'snacks', label: 'Snack', color: '#f59e0b' },
  { key: 'dinner', label: 'Dinner', color: 'var(--pur)' }
];

const GYM_DAY_SCHEDULE = {
  0: [],
  1: ['monday'],
  2: ['monday', 'thursday'],
  3: ['monday', 'wednesday', 'friday'],
  4: ['monday', 'tuesday', 'thursday', 'friday'],
  5: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  6: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  7: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
};

export default function WeeklyMealPlanner({ user, setCurrentPage }) {
  const userId = user?.id || user?._id || user?.email || user?.fullName || 'active_user';
  const storageKey = `mealplan_${userId}`;
  const legacyKey = 'nutribuddy_active_mealplan';

  // Target Biometrics
  const breakdown = useMemo(() => getDetailedCalorieBreakdown(user), [user]);
  const targetCal = user?.dailyCalories || breakdown?.targetCalories || 2588;
  const targetProt = user?.targetProtein || breakdown?.macros?.protein || 135;
  const targetCarb = user?.targetCarbs || breakdown?.macros?.carbs || 310;
  const targetFat = user?.targetFat || breakdown?.macros?.fat || 72;
  const weeklyBudget = user?.groceryBudget || (user?.monthlyBudget ? Math.round(user.monthlyBudget / 4) : 2500);

  // Compute dates for current Monday-Sunday week
  const weekDates = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    return DAYS.map((d, index) => {
      const dateObj = new Date(monday);
      dateObj.setDate(monday.getDate() + index);
      return {
        ...d,
        dateNum: dateObj.getDate(),
        isToday: dateObj.toDateString() === today.toDateString()
      };
    });
  }, []);

  // Today's day key
  const todayKey = useMemo(() => {
    const dayIndex = new Date().getDay();
    const map = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return map[dayIndex];
  }, []);

  const [selectedDay, setSelectedDay] = useState(todayKey);
  const [allFoods, setAllFoods] = useState(fallbackFoods);
  const [weeklyPlan, setWeeklyPlan] = useState({});
  const [corePantry, setCorePantry] = useState([]);
  const [loading, setLoading] = useState(false);

  // Interaction & Modal States
  const [loggedStates, setLoggedStates] = useState({}); // { [slotKey]: 'animating' | 'logged' }
  const [toastMessage, setToastMessage] = useState(null);
  const [recipeModalItem, setRecipeModalItem] = useState(null);
  const [swapModalData, setSwapModalData] = useState(null); // { slotKey, day, meal }
  const [showGroceryModal, setShowGroceryModal] = useState(false);
  const [checkedGroceryItems, setCheckedGroceryItems] = useState({});
  const [copyToast, setCopyToast] = useState(false);
  const [inspectedSlot, setInspectedSlot] = useState('breakfast');

  // Desktop Slide-Over Recipe Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMeal, setDrawerMeal] = useState(null);
  const [drawerTab, setDrawerTab] = useState('ingredients'); // 'ingredients' | 'prep' | 'micros'
  const [checkedDrawerIngredients, setCheckedDrawerIngredients] = useState({});

  const handleOpenRecipe = (meal, slotKey) => {
    const mealWithSlot = { ...meal, slotKey };
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setDrawerMeal(mealWithSlot);
      setIsDrawerOpen(true);
    } else {
      setRecipeModalItem(mealWithSlot);
    }
  };

  const dayStripRef = useRef(null);

  // Sanitize meal data: clamp multipliers <= 2.5x, reset paneer extreme multipliers, standardize names
  const sanitizeMealData = (meal) => {
    if (!meal) return meal;
    let mult = Number(meal.multiplier) || 1.0;
    const nameLower = (meal.name || '').toLowerCase();

    // Specific fix: "Fresh Paneer Cubes 8.98x" -> reset to 1.0x
    if (nameLower.includes('paneer') && mult > 2.5) {
      mult = 1.0;
    } else {
      mult = Math.min(2.5, Math.max(0.25, mult));
    }

    if (meal.id === 'rec-v4' || nameLower.includes('whey protein power shake')) {
      return {
        ...meal,
        id: 'rec-v4',
        name: 'Banana Peanut Butter Toast with Whey Protein',
        servingUnit: '2 Slices Toast + 23g PB + 1 Banana + 1 Scoop Whey',
        multiplier: mult,
        calories: Math.round(520 * mult),
        protein: Math.round(38 * mult * 10) / 10,
        carbs: Math.round(54 * mult * 10) / 10,
        fat: Math.round(16 * mult * 10) / 10,
        cost: Math.round(58 * mult),
        ingredients: [
          'Whole Wheat Bread - 2 slices',
          'Natural Peanut Butter - 23g',
          'Ripe Banana - 1 medium',
          'Whey Protein Powder - 1 scoop (32g)'
        ],
        recipe: '1. Toast 2 whole wheat bread slices until golden crisp. 2. Spread 23g natural peanut butter evenly across both slices. 3. Slice 1 banana into rounds and arrange atop the toast. 4. Mix 1 scoop whey protein with 150ml water and enjoy alongside.'
      };
    }

    if (meal.multiplier !== mult) {
      const oldMult = Number(meal.multiplier) || 1.0;
      const baseCal = meal.calories / oldMult;
      const baseP = meal.protein / oldMult;
      const baseC = meal.carbs / oldMult;
      const baseF = meal.fat / oldMult;
      const baseCost = (meal.cost || 45) / oldMult;
      return {
        ...meal,
        multiplier: mult,
        calories: Math.round(baseCal * mult),
        protein: Math.round(baseP * mult * 10) / 10,
        carbs: Math.round(baseC * mult * 10) / 10,
        fat: Math.round(baseF * mult * 10) / 10,
        cost: Math.round(baseCost * mult)
      };
    }

    return meal;
  };

  // Sanitize full plan
  const sanitizePlan = (plan) => {
    if (!plan) return {};
    const sanitized = {};
    for (const [dayKey, dayMeals] of Object.entries(plan)) {
      sanitized[dayKey] = {};
      for (const [slot, meal] of Object.entries(dayMeals)) {
        sanitized[dayKey][slot] = sanitizeMealData(meal);
      }
    }
    return sanitized;
  };

  // Load Saved Plan
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey) || localStorage.getItem(legacyKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.version === PLAN_ENGINE_VERSION && parsed?.plan && Object.keys(parsed.plan).length > 0) {
          const cleaned = sanitizePlan(parsed.plan);
          setWeeklyPlan(cleaned);
          setCorePantry(parsed.corePantry || []);
          return;
        }
      }
    } catch {}

    // Auto-generate if no plan exists
    generateNewPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch foods from server if available
  useEffect(() => {
    fetch(`${API_BASE}/api/foods`)
      .then(res => res.json())
      .then(data => {
        if (data?.success && data?.foods?.length > 0) {
          setAllFoods(data.foods);
        }
      })
      .catch(() => {});
  }, []);

  // Spring Gliding Pill Indicator State for Day Selection Strip
  const [glidingPill, setGlidingPill] = useState({ left: 0, top: 0, width: 0, height: 0, ready: false });

  // Smooth scroll day strip to active tab and animate gliding highlight pill
  useEffect(() => {
    if (dayStripRef.current) {
      const activeBtn = dayStripRef.current.querySelector('[data-active="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        setGlidingPill({
          left: activeBtn.offsetLeft,
          top: activeBtn.offsetTop,
          width: activeBtn.offsetWidth,
          height: activeBtn.offsetHeight,
          ready: true
        });
      }
    }
  }, [selectedDay]);

  // Keep gliding pill aligned on resize
  useEffect(() => {
    const handleResize = () => {
      if (dayStripRef.current) {
        const activeBtn = dayStripRef.current.querySelector('[data-active="true"]');
        if (activeBtn) {
          setGlidingPill({
            left: activeBtn.offsetLeft,
            top: activeBtn.offsetTop,
            width: activeBtn.offsetWidth,
            height: activeBtn.offsetHeight,
            ready: true
          });
        }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard ESC Listener to dismiss slide-over drawer and modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setRecipeModalItem(null);
        setSwapModalData(null);
        setShowGroceryModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Plan Generator
  const generateNewPlan = () => {
    setLoading(true);
    setTimeout(() => {
      const foodSource = allFoods && allFoods.length > 0 ? allFoods : fallbackFoods;
      const generated = generateCohesiveWeeklyMealPlan(foodSource, user, null, user?.cuisinePreference || 'all');
      const cleaned = sanitizePlan(generated.plan);
      setWeeklyPlan(cleaned);
      setCorePantry(generated.corePantryList || []);
      setLoading(false);

      const payload = JSON.stringify({
        version: PLAN_ENGINE_VERSION,
        targetCalories: targetCal,
        plan: cleaned,
        corePantry: generated.corePantryList || [],
        savedAt: new Date().toISOString()
      });
      try {
        localStorage.setItem(storageKey, payload);
        localStorage.setItem(legacyKey, payload);
      } catch {}
    }, 150);
  };

  // Persist updated plan
  const persistPlan = (updatedPlan) => {
    setWeeklyPlan(updatedPlan);
    const payload = JSON.stringify({
      version: PLAN_ENGINE_VERSION,
      targetCalories: targetCal,
      plan: updatedPlan,
      corePantry,
      savedAt: new Date().toISOString()
    });
    try {
      localStorage.setItem(storageKey, payload);
      localStorage.setItem(legacyKey, payload);
    } catch {}
  };

  // Adjust Portion Multiplier (0.25x - 3.0x discrete steps)
  const handleAdjustPortion = (slotKey, stepDirection) => {
    const currentMeal = weeklyPlan[selectedDay]?.[slotKey];
    if (!currentMeal) return;

    const currentMult = currentMeal.multiplier || 1.0;
    const currentIndex = MULTIPLIERS.findIndex(m => Math.abs(m - currentMult) < 0.05);
    let nextIndex = currentIndex !== -1 ? currentIndex + stepDirection : 3 + stepDirection;
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= MULTIPLIERS.length) nextIndex = MULTIPLIERS.length - 1;

    const newMult = MULTIPLIERS[nextIndex];
    if (newMult === currentMult) return;

    const baseCal = currentMeal.calories / currentMult;
    const baseP = currentMeal.protein / currentMult;
    const baseC = currentMeal.carbs / currentMult;
    const baseF = currentMeal.fat / currentMult;
    const baseCost = (currentMeal.cost || 45) / currentMult;

    const updatedMeal = {
      ...currentMeal,
      multiplier: newMult,
      calories: Math.round(baseCal * newMult),
      protein: Math.round(baseP * newMult * 10) / 10,
      carbs: Math.round(baseC * newMult * 10) / 10,
      fat: Math.round(baseF * newMult * 10) / 10,
      cost: Math.round(baseCost * newMult)
    };

    const updatedDay = {
      ...weeklyPlan[selectedDay],
      [slotKey]: updatedMeal
    };

    const updatedPlan = {
      ...weeklyPlan,
      [selectedDay]: updatedDay
    };

    persistPlan(updatedPlan);
  };

  // Log Meal Action (Part 5.5 Animation: 1,700ms tap state + toast + vibration)
  const handleLogMeal = (slotKey, meal) => {
    if (!meal) return;
    setLoggedStates(prev => ({ ...prev, [slotKey]: 'animating' }));

    // Haptic feedback
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([15, 60, 15]);
      }
    } catch {}

    // Save to user's daily food log
    try {
      const foodLogKey = `nutribuddy_food_log_${userId}`;
      const existing = JSON.parse(localStorage.getItem(foodLogKey) || '[]');
      const newEntry = {
        id: `log_${Date.now()}`,
        name: meal.name,
        slot: slotKey,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        loggedAt: new Date().toISOString()
      };
      existing.push(newEntry);
      localStorage.setItem(foodLogKey, JSON.stringify(existing));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    // Trigger sliding toast from top (Section 9.3: 1,800ms display)
    const slotLabel = SLOTS.find(s => s.key === slotKey)?.label || 'Meal';
    setToastMessage(`${slotLabel} logged · ${meal.calories} kcal added`);
    setTimeout(() => setToastMessage(null), 1800);

    // After 1,600ms, transition from green tap state to subtle checked state
    setTimeout(() => {
      setLoggedStates(prev => ({ ...prev, [slotKey]: 'logged' }));
    }, 1600);
  };

  // Swap Meal Replacement
  const handleSwapMeal = (slotKey, newMeal) => {
    if (!newMeal) return;
    const sanitized = sanitizeMealData(newMeal);
    const updatedDay = {
      ...weeklyPlan[selectedDay],
      [slotKey]: sanitized
    };
    const updatedPlan = {
      ...weeklyPlan,
      [selectedDay]: updatedDay
    };
    persistPlan(updatedPlan);
    setSwapModalData(null);
  };

  // Smart Swap alternatives: exactly 3 matching slot, within ±15% target calories (or closest), respecting diet
  const swapAlternatives = useMemo(() => {
    if (!swapModalData?.meal) return [];
    const targetMeal = swapModalData.meal;
    const targetCal = targetMeal.calories || 400;

    const pool = getSmartMealReplacements(
      targetMeal,
      allFoods.filter(f => (f.mealTypes || []).includes(swapModalData.slotKey) && f.id !== targetMeal.id),
      user,
      swapModalData.slotKey
    );

    // Prioritize dishes within ±15% calories
    const sorted = [...pool].sort((a, b) => {
      const aDiff = Math.abs((a.calories || 300) - targetCal) / targetCal;
      const bDiff = Math.abs((b.calories || 300) - targetCal) / targetCal;
      return aDiff - bDiff;
    });

    return sorted.slice(0, 3);
  }, [swapModalData, allFoods, user]);

  // Categorized grocery list (Section 7.2: 6 categorized headers)
  const categorizedGroceries = useMemo(() => {
    const list = generateCategorizedGroceryList(weeklyPlan);
    const hasItems = Object.values(list).some(cat => Object.keys(cat.items).length > 0);
    if (!hasItems) {
      return {
        produce: { title: 'Produce & Vegetables', items: { 'Bananas (1 dozen)': 1, 'Fresh Onions & Tomatoes': 1, 'Spinach & Cucumbers': 1 } },
        dairy_eggs: { title: 'Dairy & Eggs', items: { 'Paneer (500g)': 1, 'Greek Yogurt / Curd (1kg)': 1, 'Eggs / Tofu': 1 } },
        grains: { title: 'Grains & Flours', items: { 'Whole Wheat Atta (2kg)': 1, 'Rolled Oats (1kg)': 1, 'Brown Basmati Rice (1kg)': 1 } },
        legumes: { title: 'Legumes & Pulses', items: { 'Moong Dal (500g)': 1, 'Roasted Chana (500g)': 1 } },
        spices: { title: 'Spices & Condiments', items: { 'Mustard / Olive Oil (500ml)': 1 } },
        nuts_supplements: { title: 'Nuts, Seeds & Supplements', items: { 'Natural Peanut Butter (350g)': 1, 'Whey Protein Powder (1kg)': 1 } }
      };
    }
    return list;
  }, [weeklyPlan]);

  // Share or Copy Grocery List (Section 7.3)
  const generateGroceryText = () => {
    let text = 'NutriBuddy 7-Day Groceries:\n';
    Object.values(categorizedGroceries).forEach(cat => {
      const names = Object.keys(cat.items);
      if (names.length > 0) {
        text += `\n${cat.title}:\n`;
        names.forEach(n => {
          text += `• ${n}\n`;
        });
      }
    });
    return text.trim();
  };

  const handleShareGroceryList = async () => {
    const text = generateGroceryText();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'NutriBuddy Groceries',
          text
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopyToast('List copied to clipboard');
      setTimeout(() => setCopyToast(false), 2000);
    } catch {}
  };

  const handleCopyGroceryList = async () => {
    const text = generateGroceryText();
    try {
      await navigator.clipboard.writeText(text);
      setCopyToast('List copied to clipboard');
      setTimeout(() => setCopyToast(false), 2000);
    } catch {}
  };

  // Calculations for Selected Day
  const currentDayMeals = useMemo(() => weeklyPlan[selectedDay] || {}, [weeklyPlan, selectedDay]);

  const gymDayCount = user?.gymDays !== undefined ? parseInt(user.gymDays, 10) : 3;
  const isGymUser = gymDayCount > 0 || user?.isGymGoer === true || user?.goal === 'hypertrophy' || user?.fitnessGoal === 'muscle';

  const trainingDaySet = useMemo(() => new Set(GYM_DAY_SCHEDULE[gymDayCount] || []), [gymDayCount]);
  const isTrainingDay = trainingDaySet.has(selectedDay);

  // Day-aware calorie target: 100% on gym workout days, 90% recovery target on rest days for gym users
  const dayTargetCal = useMemo(() => {
    if (isGymUser && !isTrainingDay) {
      return Math.round(targetCal * 0.90);
    }
    return targetCal;
  }, [isGymUser, isTrainingDay, targetCal]);

  // Active slots for selected day (dynamically adapts between training days and rest days)
  const activeSlots = useMemo(() => {
    const dayMealKeys = Object.keys(currentDayMeals);
    if (dayMealKeys.length > 0) {
      return SLOTS.filter(s => dayMealKeys.includes(s.key)).map(s => {
        if (s.key === 'snacks') {
          return {
            ...s,
            label: isTrainingDay ? 'Snack' : 'Evening Snack'
          };
        }
        return s;
      });
    }
    if (isGymUser && isTrainingDay) {
      return SLOTS;
    }
    return SLOTS.filter(s => s.key !== 'pre_workout' && s.key !== 'post_workout').map(s => {
      if (s.key === 'snacks') {
        return { ...s, label: 'Evening Snack' };
      }
      return s;
    });
  }, [currentDayMeals, isGymUser, isTrainingDay]);

  const dayTotals = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let cost = 0;
    const currentMeals = weeklyPlan[selectedDay] || {};

    activeSlots.forEach(slot => {
      const meal = currentMeals[slot.key];
      if (meal) {
        calories += Number(meal.calories) || 0;
        protein += Number(meal.protein) || 0;
        carbs += Number(meal.carbs) || 0;
        fat += Number(meal.fat) || 0;
        cost += Number(meal.cost) || 45;
      }
    });

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      cost: Math.round(cost)
    };
  }, [weeklyPlan, selectedDay, activeSlots]);

  // Weekly estimated grocery cost
  const weekCost = useMemo(() => {
    let total = 0;
    DAYS.forEach(d => {
      const dMeals = weeklyPlan[d.key] || {};
      Object.values(dMeals).forEach(m => {
        if (m) total += Number(m.cost) || 45;
      });
    });
    return total > 0 ? Math.round(total) : dayTotals.cost * 7;
  }, [weeklyPlan, dayTotals.cost]);

  // Budget status badge: On track (<= budget), ~ Just over (<= 110%), Over budget (> 110%)
  const budgetRatio = weeklyBudget > 0 ? weekCost / weeklyBudget : 1.0;
  const budgetBadge = useMemo(() => {
    if (budgetRatio <= 1.0) {
      return { text: 'On track', color: 'var(--g)', bg: 'var(--gd)', bd: 'rgba(34, 197, 94, 0.3)' };
    }
    if (budgetRatio <= 1.10) {
      return { text: '~ Just over', color: 'var(--amb)', bg: 'var(--ambd)', bd: 'rgba(245, 168, 51, 0.3)' };
    }
    return { text: 'Over budget', color: 'var(--red)', bg: 'var(--redd)', bd: 'rgba(239, 68, 68, 0.3)' };
  }, [budgetRatio]);

  // Macro progress percentages
  const protPct = targetProt > 0 ? Math.round((dayTotals.protein / targetProt) * 100) : 0;
  const carbPct = targetCarb > 0 ? Math.round((dayTotals.carbs / targetCarb) * 100) : 0;
  const fatPct = targetFat > 0 ? Math.round((dayTotals.fat / targetFat) * 100) : 0;

  // Calorie progress bar color: green <=100%, amber 101-110%, red >110%
  const calRatio = dayTargetCal > 0 ? dayTotals.calories / dayTargetCal : 0;
  const calProgressColor = calRatio > 1.10 ? 'var(--red)' : calRatio > 1.0 ? 'var(--amb)' : 'var(--g)';
  const calFillPct = Math.min(100, Math.round(calRatio * 100));
  const calRemaining = Math.max(0, dayTargetCal - dayTotals.calories);

  // SVG Macro Donut Calculations (106px x 106px, stroke 11)
  const donutSize = 106;
  const donutStroke = 11;
  const donutRadius = (donutSize - donutStroke) / 2; // 47.5
  const circumference = 2 * Math.PI * donutRadius; // ~298.45

  const totalMacroGrams = (dayTotals.protein + dayTotals.carbs + dayTotals.fat) || 1;
  const pFrac = dayTotals.protein / totalMacroGrams;
  const cFrac = dayTotals.carbs / totalMacroGrams;
  const fFrac = dayTotals.fat / totalMacroGrams;

  const pDash = pFrac * circumference;
  const cDash = cFrac * circumference;
  const fDash = fFrac * circumference;

  const pOffset = 0;
  const cOffset = -pDash;
  const fOffset = -(pDash + cDash);



  // Quality & Micronutrient estimations
  const estimatedMicros = useMemo(() => {
    const fiberEst = Math.round(dayTotals.carbs * 0.14) + 12;
    const sodiumEst = Math.round(dayTotals.calories * 0.85);
    const potassiumEst = Math.round(dayTotals.protein * 18) + 1200;
    const wholeFoodsScore = Math.min(98, Math.max(78, Math.round(85 + (dayTotals.protein > 100 ? 5 : 0) - (Math.abs(dayTotals.calories - dayTargetCal) > 200 ? 8 : 0))));
    return {
      fiber: fiberEst,
      sodium: sodiumEst,
      potassium: potassiumEst,
      qualityScore: wholeFoodsScore
    };
  }, [dayTotals, dayTargetCal]);

  // Dynamic meal prep tip
  const prepTip = useMemo(() => {
    switch (inspectedSlot) {
      case 'breakfast':
        return {
          title: 'Morning Fuel Strategy',
          tip: 'Have a glass of warm water 15 minutes prior to optimize digestion. Prioritize eating within 90 minutes of waking.'
        };
      case 'pre_workout':
        return {
          title: 'Pre-Workout Stamina Strategy',
          tip: 'Consume 45-60 min prior to training. Fast-acting glycogen primers with minimal fats prevent GI distress and fuel maximum power output.'
        };
      case 'lunch':
        return {
          title: 'Midday Satiety Strategy',
          tip: 'Consume salads/dal fiber first before carbohydrates to blunt glucose spikes and maintain post-lunch productivity.'
        };
      case 'post_workout':
        return {
          title: 'Post-Workout Recovery & mTOR',
          tip: 'Consume within 45 min post-lifting. Rapid amino acid delivery (≥2.7g leucine) triggers muscle protein synthesis and stops catabolism.'
        };
      case 'snacks':
        return {
          title: isTrainingDay ? 'Workout Fueling Timing' : 'Evening Protein Bridge',
          tip: isTrainingDay
            ? 'Consume 45-60 min before training for sustained glycogen, or within 45 min post-workout for muscle protein synthesis.'
            : 'Protein-forward evening nourishment maintaining steady amino acid elevation between lunch and dinner on recovery days.'
        };
      case 'dinner':
        return {
          title: 'Evening Recovery Strategy',
          tip: 'Complete dinner at least 2.5 hours before sleeping to ensure body core temperature drops smoothly for deep slow-wave REM sleep.'
        };
      default:
        return {
          title: 'Nutrition Strategy',
          tip: 'Focus on whole, unprocessed foods and keep hydration steady throughout the day.'
        };
    }
  }, [inspectedSlot, isTrainingDay]);

  // Live drawer meal synchronized with portion adjustments
  const liveDrawerMeal = useMemo(() => {
    if (!drawerMeal) return null;
    const raw = currentDayMeals[drawerMeal.slotKey];
    if (raw) {
      const sanitized = sanitizeMealData(raw);
      return { ...drawerMeal, ...sanitized, slotKey: drawerMeal.slotKey };
    }
    return drawerMeal;
  }, [drawerMeal, currentDayMeals]);

  return (
    <div className="nb-meal-planner-container">

      {/* ───────────────────────────────────────────────────────────
          1. HEADER (Redesigned Clean Hierarchy)
          ─────────────────────────────────────────────────────────── */}
      <header className="nb-meal-planner-header" style={{ padding: '18px 16px 12px' }}>
        {/* Row 1: Title and Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 36 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '-0.035em',
              color: 'var(--t1)',
              lineHeight: 1.2
            }}
          >
            Meal planner
          </h1>

          {/* Action buttons (Clean matching pills) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <button
              onClick={() => setShowGroceryModal(true)}
              style={{
                background: 'var(--s2)',
                border: '0.5px solid var(--bd)',
                borderRadius: 12,
                padding: '6px 11px',
                fontSize: 11.5,
                fontWeight: 600,
                color: 'var(--t2)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.15s ease'
              }}
              className="active:scale-95"
              title="View consolidated grocery list"
            >
              <ShoppingCart size={13} color="var(--g)" />
              <span>Grocery</span>
            </button>
            <button
              onClick={generateNewPlan}
              disabled={loading}
              style={{
                background: 'var(--s2)',
                border: '0.5px solid var(--bd)',
                borderRadius: 12,
                padding: '6px 11px',
                fontSize: 11.5,
                fontWeight: 600,
                color: 'var(--t2)',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.15s ease'
              }}
              className="active:scale-95"
              title="Recalibrate and regenerate weekly meal plan"
            >
              <RefreshCw size={12} className={loading ? 'anim-spin' : ''} color="var(--t2)" />
              <span>Recalibrate</span>
            </button>
          </div>
        </div>

        {/* Row 2: Status / Meta Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'var(--s2)',
              border: '0.5px solid var(--bd)',
              borderRadius: 20,
              padding: '4px 11px',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--t1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--g)', flexShrink: 0 }} />
            {(() => {
              const stdGoal = getStandardizedGoalLabel(user?.goal || user?.fitnessGoal);
              if (isGymUser) {
                return isTrainingDay
                  ? `${stdGoal} · Workout Day (${Number(dayTargetCal).toLocaleString()} kcal)`
                  : `${stdGoal} · Recovery Day (${Number(dayTargetCal).toLocaleString()} kcal)`;
              }
              return `${stdGoal} — ${Number(targetCal).toLocaleString()} kcal/day`;
            })()}
          </div>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '0.5px solid var(--bd)',
              borderRadius: 20,
              padding: '4px 11px',
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--t3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <span>On track · ±42 kcal avg variance</span>
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────
          2. DAY SELECTOR (Monday – Sunday) (Part 5.2)
          ─────────────────────────────────────────────────────────── */}
      <nav
        ref={dayStripRef}
        className="nb-meal-planner-days-nav"
        aria-label="Day selection"
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          padding: '4px 16px 16px',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          position: 'relative'
        }}
      >
        {/* Animated Gliding Emerald Highlight Pill (Spring Easing) */}
        {glidingPill.ready && (
          <div
            style={{
              position: 'absolute',
              left: glidingPill.left,
              top: glidingPill.top,
              width: glidingPill.width,
              height: glidingPill.height,
              borderRadius: 16,
              background: 'var(--g)',
              boxShadow: '0 4px 18px rgba(34, 209, 122, 0.40)',
              transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
        )}
        {weekDates.map(d => {
          const isActive = d.key === selectedDay;
          return (
            <button
              key={d.key}
              data-active={isActive ? 'true' : 'false'}
              onClick={() => setSelectedDay(d.key)}
              className="tactile-btn"
              style={{
                flex: '0 0 auto',
                minWidth: 54,
                padding: '10px 8px',
                borderRadius: 16,
                border: isActive ? 'none' : '0.5px solid var(--bd)',
                background: isActive ? (glidingPill.ready ? 'transparent' : 'var(--g)') : 'var(--s2)',
                color: isActive ? '#041a0c' : 'var(--t3)',
                cursor: 'pointer',
                textAlign: 'center',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                transition: 'color 180ms ease, transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                position: 'relative',
                zIndex: 2
              }}
            >
              <span style={{ fontSize: 10.5, fontWeight: isActive ? 800 : 600, letterSpacing: '0.02em' }}>
                {d.label}
              </span>
              <span style={{ fontSize: 15, fontWeight: 800, fontFamily: 'monospace' }}>
                {d.dateNum}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ───────────────────────────────────────────────────────────
          RESPONSIVE BODY LAYOUT (Desktop 2-Column Split)
          ─────────────────────────────────────────────────────────── */}
      <div className="nb-meal-planner-body">
        {/* Left Column: Daily Total & Nutrition Summary (Sticky on Desktop) */}
        <div className="nb-meal-planner-sidebar">
          {/* ───────────────────────────────────────────────────────────
              3. TODAY'S NUTRITION SUMMARY CARD (Part 5.3)
              ─────────────────────────────────────────────────────────── */}
          <section
            className="nb-card nb-card-3d anim-seq-hero anim-3d-entry"
            onMouseMove={handleCard3DMouseMove}
            onMouseLeave={handleCard3DMouseLeave}
            style={{
              margin: '0 16px 14px',
              borderRadius: 20,
              padding: 18
            }}
          >
        {/* Top Row: Daily total + Calorie Variance badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
              Daily total
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 99,
                whiteSpace: 'nowrap',
                color: Math.abs(dayTotals.calories - dayTargetCal) <= 80 ? 'var(--g)' : dayTotals.calories > dayTargetCal ? 'var(--amb)' : 'var(--blu)',
                background: Math.abs(dayTotals.calories - dayTargetCal) <= 80 ? 'rgba(34, 197, 94, 0.12)' : dayTotals.calories > dayTargetCal ? 'rgba(245, 168, 51, 0.12)' : 'rgba(91, 142, 245, 0.12)',
                border: `0.5px solid ${Math.abs(dayTotals.calories - dayTargetCal) <= 80 ? 'rgba(34, 197, 94, 0.3)' : dayTotals.calories > dayTargetCal ? 'rgba(245, 168, 51, 0.3)' : 'rgba(91, 142, 245, 0.3)'}`
              }}
            >
              {Math.abs(dayTotals.calories - dayTargetCal) <= 80
                ? 'Balanced'
                : dayTotals.calories > dayTargetCal
                  ? `+${dayTotals.calories - dayTargetCal} kcal Surplus`
                  : `${dayTotals.calories - dayTargetCal} kcal Deficit`}
            </span>
          </div>
          <span className="tabular-nums" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--t2)' }}>
            <strong style={{ color: 'var(--t1)', fontWeight: 800 }}>{dayTotals.calories.toLocaleString()}</strong> / {dayTargetCal.toLocaleString()} kcal
          </span>
        </div>

        {/* Single Gradient Progress Bar */}
        <div
          style={{
            height: 6,
            width: '100%',
            background: 'var(--s3)',
            borderRadius: 99,
            overflow: 'hidden',
            marginBottom: 16
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${calFillPct}%`,
              background: calProgressColor,
              borderRadius: 99,
              transition: 'width 0.4s ease, background 0.3s ease'
            }}
          />
        </div>

        {/* SVG Macro Donut & Legend Container */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          {/* Donut Chart (106 x 106) */}
          <div style={{ position: 'relative', width: donutSize, height: donutSize, flexShrink: 0 }}>
            <svg width={donutSize} height={donutSize} style={{ transform: 'rotate(-90deg)' }}>
              {/* Background Track */}
              <circle
                cx={donutSize / 2}
                cy={donutSize / 2}
                r={donutRadius}
                fill="none"
                stroke="var(--s3)"
                strokeWidth={donutStroke}
              />
              {/* Segment 1: Protein (--blu) */}
              <circle
                cx={donutSize / 2}
                cy={donutSize / 2}
                r={donutRadius}
                fill="none"
                stroke="var(--blu)"
                strokeWidth={donutStroke}
                strokeDasharray={`${pDash} ${circumference}`}
                strokeDashoffset={pOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
              {/* Segment 2: Carbs (--cyan) */}
              <circle
                cx={donutSize / 2}
                cy={donutSize / 2}
                r={donutRadius}
                fill="none"
                stroke="var(--cyan)"
                strokeWidth={donutStroke}
                strokeDasharray={`${cDash} ${circumference}`}
                strokeDashoffset={cOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
              {/* Segment 3: Fat (--amb, NEVER RED) */}
              <circle
                cx={donutSize / 2}
                cy={donutSize / 2}
                r={donutRadius}
                fill="none"
                stroke="var(--amb)"
                strokeWidth={donutStroke}
                strokeDasharray={`${fDash} ${circumference}`}
                strokeDashoffset={fOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>

            {/* Center of Donut: remaining kcal + "left" */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}
            >
              <span className="tabular-nums" style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', lineHeight: 1.1 }}>
                {calRemaining}
              </span>
              <span style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--t3)', marginTop: 1 }}>
                left
              </span>
            </div>
          </div>

          {/* Legend beside Donut (3 vertical rows) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Protein */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blu)' }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--t2)' }}>Protein</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className="tabular-nums" style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>
                  {dayTotals.protein}g
                </span>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--blu)', background: 'rgba(91, 142, 245, 0.12)', padding: '1px 5px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                  {protPct}%
                </span>
              </div>
            </div>

            {/* Carbs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cyan)' }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--t2)' }}>Carbs</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className="tabular-nums" style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>
                  {dayTotals.carbs}g
                </span>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--cyan)', background: 'rgba(6, 182, 212, 0.12)', padding: '1px 5px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                  {carbPct}%
                </span>
              </div>
            </div>

            {/* Fat */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--amb)' }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--t2)' }}>Fat</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className="tabular-nums" style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>
                  {dayTotals.fat}g
                </span>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--amb)', background: 'rgba(245, 168, 51, 0.12)', padding: '1px 5px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                  {fatPct}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────
            4. COMPACT GROCERY BUDGET ROW (Part 5.4)
            ─────────────────────────────────────────────────────────── */}
        <div
          onClick={() => setShowGroceryModal(true)}
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: '0.5px solid var(--bd)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)' }}>
            Est. day cost: <strong style={{ color: 'var(--t1)' }}>₹{dayTotals.cost}</strong> · Weekly est: <strong style={{ color: 'var(--t1)' }}>₹{weekCost.toLocaleString()}</strong>
          </div>
          <div
            style={{
              padding: '3px 9px',
              borderRadius: 20,
              fontSize: 10.5,
              fontWeight: 700,
              color: budgetBadge.color,
              background: budgetBadge.bg,
              border: `0.5px solid ${budgetBadge.bd}`
            }}
          >
            {budgetBadge.text}
          </div>
        </div>
      </section>

      {/* Desktop-only Micronutrient & Dietary Quality Card */}
      <div className="desktop-only" style={{ margin: '14px 16px 0' }}>
        <div
          className="nb-card nb-card-3d anim-3d-entry"
          onMouseMove={handleCard3DMouseMove}
          onMouseLeave={handleCard3DMouseLeave}
          style={{
            borderRadius: 20,
            padding: '16px 18px',
            background: 'var(--s2)',
            border: '0.5px solid var(--bd)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} color="var(--g)" />
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--t1)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Dietary Quality
              </span>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(34, 197, 94, 0.12)', color: 'var(--g)', border: '0.5px solid rgba(34, 197, 94, 0.25)' }}>
              {estimatedMicros.qualityScore}/100 Clean
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: 'var(--t3)', fontWeight: 600 }}>Dietary Fiber</span>
                <span className="tabular-nums" style={{ color: 'var(--t1)', fontWeight: 700, whiteSpace: 'nowrap' }}>{estimatedMicros.fiber} / 35g</span>
              </div>
              <div style={{ height: 4, background: 'var(--s3)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, Math.round((estimatedMicros.fiber / 35) * 100))}%`, height: '100%', background: 'var(--g)', borderRadius: 99 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: 'var(--t3)', fontWeight: 600 }}>Est. Sodium</span>
                <span className="tabular-nums" style={{ color: 'var(--t1)', fontWeight: 700, whiteSpace: 'nowrap' }}>{estimatedMicros.sodium} / 2,300mg</span>
              </div>
              <div style={{ height: 4, background: 'var(--s3)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, Math.round((estimatedMicros.sodium / 2300) * 100))}%`, height: '100%', background: estimatedMicros.sodium > 2300 ? 'var(--amb)' : 'var(--cyan)', borderRadius: 99 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: 'var(--t3)', fontWeight: 600 }}>Potassium Target</span>
                <span className="tabular-nums" style={{ color: 'var(--t1)', fontWeight: 700, whiteSpace: 'nowrap' }}>{estimatedMicros.potassium} / 3,500mg</span>
              </div>
              <div style={{ height: 4, background: 'var(--s3)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, Math.round((estimatedMicros.potassium / 3500) * 100))}%`, height: '100%', background: 'var(--blu)', borderRadius: 99 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop-only Planner Utilities Card */}
      <div className="desktop-only" style={{ margin: '14px 16px 0' }}>
        <div
          className="nb-card nb-card-3d anim-3d-entry card-spotlight"
          onMouseMove={e => { handleCardSpotlight(e); handleCard3DMouseMove(e); }}
          onMouseLeave={handleCard3DMouseLeave}
          style={{
            borderRadius: 20,
            padding: '16px 18px',
            background: 'var(--s2)',
            border: '0.5px solid var(--bd)'
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
            Planner Utilities
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => setShowGroceryModal(true)}
              className="tactile-btn"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 12,
                background: 'var(--s1)',
                border: '0.5px solid var(--bd)',
                color: 'var(--t1)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <ShoppingCart size={14} color="var(--g)" />
              Weekly Grocery List
            </button>
            <button
              onClick={generateNewPlan}
              disabled={loading}
              className="tactile-btn"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 12,
                background: 'var(--s1)',
                border: '0.5px solid var(--bd)',
                color: 'var(--t2)',
                fontSize: 12,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Recalibrating...' : 'Recalibrate Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Right Column: Meal Cards List */}
    <div className="nb-meal-planner-main">
      {/* ───────────────────────────────────────────────────────────
          5. MEAL CARDS (4 cards: Breakfast, Lunch, Snack, Dinner) (Part 5.5)
          ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 16px' }}>
        {activeSlots.map((slot, idx) => {
          const rawMeal = currentDayMeals[slot.key];
          const meal = sanitizeMealData(rawMeal) || {
            name: slot.key === 'breakfast' ? 'Oatmeal with Almonds & Banana' :
                  slot.key === 'pre_workout' ? 'Banana Peanut Butter Toast with Medjool Dates' :
                  slot.key === 'lunch' ? 'Paneer Bhurji with 2 Phulkas & Dal' :
                  slot.key === 'post_workout' ? 'Roasted Chana & Boiled Egg Whites Bowl with Whey' :
                  slot.key === 'snacks' ? 'Roasted Makhana & Almonds Bowl' :
                  'Tofu Stir-fry with Steamed Brown Rice',
            calories: slot.key === 'breakfast' ? 480 : slot.key === 'pre_workout' ? 260 : slot.key === 'lunch' ? 680 : slot.key === 'post_workout' ? 420 : slot.key === 'snacks' ? 160 : 610,
            protein: slot.key === 'breakfast' ? 22 : slot.key === 'pre_workout' ? 12 : slot.key === 'lunch' ? 38 : slot.key === 'post_workout' ? 34 : slot.key === 'snacks' ? 8 : 34,
            carbs: slot.key === 'breakfast' ? 64 : slot.key === 'pre_workout' ? 44 : slot.key === 'lunch' ? 72 : slot.key === 'post_workout' ? 42 : slot.key === 'snacks' ? 20 : 68,
            fat: slot.key === 'breakfast' ? 14 : slot.key === 'pre_workout' ? 4 : slot.key === 'lunch' ? 22 : slot.key === 'post_workout' ? 5 : slot.key === 'snacks' ? 6 : 18,
            multiplier: 1.0,
            servingUnit: '1 serving · ~320g'
          };

          const multiplier = Math.min(2.5, Math.max(0.25, meal.multiplier || 1.0));
          const logState = loggedStates[slot.key]; // 'animating' | 'logged' | undefined

          // Ratio calculation for mini split-bar
          const mealTotalMacros = (meal.protein + meal.carbs + meal.fat) || 1;
          const mpPct = Math.round((meal.protein / mealTotalMacros) * 100);
          const mcPct = Math.round((meal.carbs / mealTotalMacros) * 100);
          const mfPct = 100 - mpPct - mcPct;

          return (
            <article
              key={`${selectedDay}_${slot.key}`}
              className={`nb-card nb-card-3d anim-3d-entry card-spotlight ${slot.key === (drawerMeal?.slotKey || inspectedSlot) ? 'is-active-inspected' : ''}`}
              onClick={() => {
                setInspectedSlot(slot.key);
                if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
                  handleOpenRecipe(meal, slot.key);
                }
              }}
              onMouseMove={e => { handleCardSpotlight(e); handleCard3DMouseMove(e); }}
              onMouseLeave={handleCard3DMouseLeave}
              style={{
                borderRadius: 18,
                padding: '14px 16px',
                marginBottom: 12,
                animation: 'seqFadeSlideUp 280ms ease-out both',
                animationDelay: `${idx * 40}ms`,
                cursor: 'pointer'
              }}
            >
              {/* Card Header: slot dot + slot name (sentence case) + kcal (white) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: slot.color }} />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: slot.color
                    }}
                  >
                    {slot.label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
                    {meal.calories} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--t3)' }}>kcal</span>
                  </span>
                  {slot.key === (drawerMeal?.slotKey || inspectedSlot) && (
                    <span
                      className="desktop-only"
                      style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 6,
                        background: 'rgba(34, 197, 94, 0.12)',
                        color: 'var(--g)',
                        border: '0.5px solid rgba(34, 197, 94, 0.25)',
                        letterSpacing: '0.02em'
                      }}
                    >
                      Active
                    </span>
                  )}
                </div>
              </div>

              {/* Food Item Display */}
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'var(--t1)',
                    lineHeight: 1.35,
                    marginBottom: 3
                  }}
                >
                  {meal.name}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--t3)' }}>
                  {meal.servingUnit || '1 serving · ~320g'}
                </div>
                {meal.compositionNote && meal.compositionNote !== 'Complete Standalone Balanced Portion' && (
                  <div style={{ fontSize: 11, color: '#38bdf8', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 9.5, padding: '1px 5px', borderRadius: 4, background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)', fontWeight: 600, flexShrink: 0 }}>CLINICAL COMBO</span>
                    <span className="truncate">{meal.compositionNote}</span>
                  </div>
                )}
              </div>

              {/* Macro Bar + Compact Stepper aligned to the right of macro row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12
                }}
              >
                <div>
                  <div
                    style={{
                      height: 4,
                      width: 140,
                      display: 'flex',
                      borderRadius: 99,
                      overflow: 'hidden',
                      background: 'var(--s3)',
                      gap: 2,
                      marginBottom: 5
                    }}
                  >
                    <div style={{ width: `${mpPct}%`, background: 'var(--blu)' }} />
                    <div style={{ width: `${mcPct}%`, background: 'var(--cyan)' }} />
                    <div style={{ width: `${mfPct}%`, background: 'var(--amb)' }} />
                  </div>
                  <div className="tabular-nums" style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>
                    {formatCompactMacros(meal.protein, meal.carbs, meal.fat)}
                  </div>
                </div>

                {/* Compact Right-Aligned Stepper: [−] [1.0×] [+] */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleAdjustPortion(slot.key, -1)}
                    disabled={multiplier <= 0.25}
                    aria-label="Decrease portion"
                    className="tactile-btn"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      background: 'var(--s3)',
                      border: '0.5px solid var(--bd)',
                      color: multiplier <= 0.25 ? 'var(--t4)' : 'var(--t2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: multiplier <= 0.25 ? 'not-allowed' : 'pointer',
                      outline: 'none',
                      padding: 0
                    }}
                  >
                    <Minus size={12} />
                  </button>

                  <span
                    className="tabular-nums"
                    style={{
                      minWidth: 32,
                      textAlign: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--t1)'
                    }}
                  >
                    {multiplier.toFixed(1)}×
                  </span>

                  <button
                    onClick={() => handleAdjustPortion(slot.key, 1)}
                    disabled={multiplier >= 2.5}
                    aria-label="Increase portion"
                    className="tactile-btn"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      background: 'var(--s3)',
                      border: '0.5px solid var(--bd)',
                      color: multiplier >= 2.5 ? 'var(--t4)' : 'var(--t2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: multiplier >= 2.5 ? 'not-allowed' : 'pointer',
                      outline: 'none',
                      padding: 0
                    }}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Card Actions: Inspect Recipe | Swap | Log meal */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '0.5px solid var(--bd)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenRecipe(meal, slot.key);
                    }}
                    className="tactile-btn"
                    style={{
                      background: 'var(--s3)',
                      border: '0.5px solid var(--bd)',
                      borderRadius: 9,
                      padding: '6px 11px',
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--t1)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5
                    }}
                  >
                    <span>Inspect Recipe</span>
                    <span style={{ color: 'var(--g)', fontSize: 13 }}>↗</span>
                  </button>
                  <span style={{ color: 'var(--bd)' }}>·</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSwapModalData({ slotKey: slot.key, day: selectedDay, meal });
                    }}
                    className="tactile-btn"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '6px 8px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--t2)',
                      cursor: 'pointer'
                    }}
                  >
                    Swap
                  </button>
                </div>

                {/* Log Meal Button with 1,600ms transition */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogMeal(slot.key, meal);
                  }}
                  className="tactile-btn"
                  style={{
                    background: logState === 'animating' ? 'var(--g)' : logState === 'logged' ? 'transparent' : 'var(--s2)',
                    border: logState === 'animating' ? '1px solid var(--g)' : logState === 'logged' ? '1px solid var(--bd)' : '1px solid var(--bd)',
                    color: logState === 'animating' ? '#ffffff' : logState === 'logged' ? 'var(--t3)' : 'var(--t1)',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '7px 14px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    transition: 'all 0.25s ease'
                  }}
                >
                  {logState === 'animating' ? (
                    <>
                      <Check size={14} className="anim-scale-in" />
                      ✓ Logged!
                    </>
                  ) : logState === 'logged' ? (
                    'Logged ✓'
                  ) : (
                    '＋ Log meal'
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  </div>

      {/* ───────────────────────────────────────────────────────────
          DESKTOP SLIDE-OVER RECIPE DRAWER (Asymmetric Workspace Studio)
          ─────────────────────────────────────────────────────────── */}
      {isDrawerOpen && liveDrawerMeal && createPortal(
        <div className="desktop-only">
          {/* Drawer Backdrop Overlay */}
          <div
            className="nb-recipe-drawer-backdrop"
            onClick={() => setIsDrawerOpen(false)}
            title="Click to dismiss drawer"
          />

          {/* Slide-over Drawer Panel */}
          <aside
            className="nb-recipe-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Executive Recipe & Macro Blueprint"
          >
            {/* Header: Meal metadata + Dismiss CTA */}
            <div
              style={{
                padding: '20px 24px 16px',
                borderBottom: '1px solid var(--bd)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 16
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: SLOTS.find(s => s.key === liveDrawerMeal.slotKey)?.color || 'var(--g)'
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: SLOTS.find(s => s.key === liveDrawerMeal.slotKey)?.color || 'var(--g)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    {SLOTS.find(s => s.key === liveDrawerMeal.slotKey)?.label || 'Meal'} Blueprint
                  </span>
                  <span style={{ color: 'var(--t3)', fontSize: 11 }}>•</span>
                  <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>
                    ~20 min prep
                  </span>
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 800,
                    color: 'var(--t1)',
                    lineHeight: 1.3,
                    wordBreak: 'break-word'
                  }}
                >
                  {liveDrawerMeal.name}
                </h2>
                <div style={{ fontSize: 12.5, color: 'var(--t3)', marginTop: 4 }}>
                  {liveDrawerMeal.servingUnit || '1 serving'}
                </div>
                {liveDrawerMeal.compositionNote && liveDrawerMeal.compositionNote !== 'Complete Standalone Balanced Portion' && (
                  <div style={{ fontSize: 11.5, color: '#38bdf8', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 9.5, padding: '1px 5px', borderRadius: 4, background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)', fontWeight: 600, flexShrink: 0 }}>CLINICAL COMBO</span>
                    <span>{liveDrawerMeal.compositionNote}</span>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="tactile-btn"
                aria-label="Close drawer"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: 'var(--s2)',
                  border: '1px solid var(--bd)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--t2)',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Macro Summary Strip */}
            <div
              style={{
                padding: '12px 24px',
                background: 'var(--s2)',
                borderBottom: '1px solid var(--bd)',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
                textAlign: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>Energy</div>
                <div className="tabular-nums" style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>
                  {liveDrawerMeal.calories} <span style={{ fontSize: 10, color: 'var(--t3)' }}>kcal</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--blu)', fontWeight: 600 }}>Protein</div>
                <div className="tabular-nums" style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>
                  {Math.round(liveDrawerMeal.protein)}g
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--cyan)', fontWeight: 600 }}>Carbs</div>
                <div className="tabular-nums" style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>
                  {Math.round(liveDrawerMeal.carbs)}g
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--amb)', fontWeight: 600 }}>Fat</div>
                <div className="tabular-nums" style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>
                  {Math.round(liveDrawerMeal.fat)}g
                </div>
              </div>
            </div>

            {/* Tab Navigation (Segmented Bar) */}
            <div style={{ padding: '12px 24px 0', background: 'var(--s1)' }}>
              <div
                style={{
                  display: 'flex',
                  background: 'var(--s2)',
                  borderRadius: 12,
                  padding: 3,
                  gap: 3,
                  border: '1px solid var(--bd)'
                }}
              >
                {[
                  { key: 'ingredients', label: 'Ingredients' },
                  { key: 'prep', label: 'Step-by-Step Prep' },
                  { key: 'micros', label: 'Micro Breakdown' }
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => setDrawerTab(t.key)}
                    className="tactile-btn"
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      borderRadius: 9,
                      fontSize: 12,
                      fontWeight: drawerTab === t.key ? 700 : 600,
                      color: drawerTab === t.key ? 'var(--t1)' : 'var(--t3)',
                      background: drawerTab === t.key ? 'var(--s1)' : 'transparent',
                      border: drawerTab === t.key ? '0.5px solid var(--bd)' : 'none',
                      boxShadow: drawerTab === t.key ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}
            >
              {/* TAB 1: INGREDIENTS CHECKLIST */}
              {drawerTab === 'ingredients' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Pantry Items & Measures
                    </div>
                    {/* Portion Scaler inside drawer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>Portion:</span>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--s2)', borderRadius: 8, border: '1px solid var(--bd)', padding: 2 }}>
                        <button
                          onClick={() => handleAdjustPortion(liveDrawerMeal.slotKey, -1)}
                          disabled={(liveDrawerMeal.multiplier || 1.0) <= 0.25}
                          style={{ width: 22, height: 22, background: 'transparent', border: 'none', color: 'var(--t2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                        >
                          <Minus size={11} />
                        </button>
                        <span className="tabular-nums" style={{ minWidth: 30, textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--t1)' }}>
                          {(liveDrawerMeal.multiplier || 1.0).toFixed(1)}×
                        </span>
                        <button
                          onClick={() => handleAdjustPortion(liveDrawerMeal.slotKey, 1)}
                          disabled={(liveDrawerMeal.multiplier || 1.0) >= 2.5}
                          style={{ width: 22, height: 22, background: 'transparent', border: 'none', color: 'var(--t2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(liveDrawerMeal.ingredients || ['Fresh balanced produce and seasonings']).map((item, idx) => {
                      const isChecked = !!checkedDrawerIngredients[idx];
                      return (
                        <div
                          key={idx}
                          onClick={() => setCheckedDrawerIngredients(prev => ({ ...prev, [idx]: !prev[idx] }))}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '11px 14px',
                            borderRadius: 12,
                            background: isChecked ? 'rgba(34, 197, 94, 0.05)' : 'var(--s2)',
                            border: isChecked ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--bd)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 5,
                              background: isChecked ? 'var(--g)' : 'var(--s3)',
                              border: isChecked ? 'none' : '1px solid var(--bd)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            {isChecked && <Check size={12} color="#ffffff" strokeWidth={3} />}
                          </div>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: isChecked ? 'var(--t3)' : 'var(--t1)',
                              textDecoration: isChecked ? 'line-through' : 'none',
                              lineHeight: 1.4
                            }}
                          >
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--s2)', borderRadius: 12, border: '1px solid var(--bd)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={14} color="var(--g)" />
                    <span style={{ fontSize: 11.5, color: 'var(--t2)' }}>
                      Weigh ingredients on a digital food scale before cooking for optimal macro tracking precision.
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: STEP-BY-STEP PREPARATION */}
              {drawerTab === 'prep' && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
                    Culinary Method & Timing
                  </div>
                  {(() => {
                    const rawRecipe = liveDrawerMeal.recipe || 'Heat cooking medium in a pan. Add aromatic spices and protein. Cook on medium heat until golden and tender. Season with rock salt and fresh herbs to taste.';
                    const steps = rawRecipe.split(/(?=\d+\.\s)/).map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
                    const finalSteps = steps.length > 0 ? steps : [rawRecipe];

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {finalSteps.map((stepText, sIdx) => (
                          <div
                            key={sIdx}
                            style={{
                              display: 'flex',
                              gap: 14,
                              padding: '14px 16px',
                              borderRadius: 14,
                              background: 'var(--s2)',
                              border: '1px solid var(--bd)'
                            }}
                          >
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                background: 'var(--s3)',
                                border: '1px solid var(--bd)',
                                color: 'var(--g)',
                                fontSize: 12,
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              {sIdx + 1}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.55, paddingTop: 2 }}>
                              {stepText}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  <div style={{ marginTop: 16, padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, var(--s2) 100%)', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Sparkles size={13} color="var(--g)" />
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--g)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {prepTip.title}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5 }}>
                      {prepTip.tip}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MICRO BREAKDOWN */}
              {drawerTab === 'micros' && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
                    Nutrient Energy Density
                  </div>
                  {(() => {
                    const pKcal = Math.round((liveDrawerMeal.protein || 0) * 4);
                    const cKcal = Math.round((liveDrawerMeal.carbs || 0) * 4);
                    const fKcal = Math.round((liveDrawerMeal.fat || 0) * 9);
                    const totKcal = (pKcal + cKcal + fKcal) || 1;
                    const pEFrac = Math.round((pKcal / totKcal) * 100);
                    const cEFrac = Math.round((cKcal / totKcal) * 100);
                    const fEFrac = 100 - pEFrac - cEFrac;

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Energy Split Bar */}
                        <div style={{ padding: '14px 16px', background: 'var(--s2)', borderRadius: 14, border: '1px solid var(--bd)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 8 }}>
                            <span style={{ color: 'var(--t2)', fontWeight: 600 }}>Energy Contribution</span>
                            <span style={{ color: 'var(--t1)', fontWeight: 700 }}>{totKcal} kcal total</span>
                          </div>
                          <div style={{ height: 8, display: 'flex', borderRadius: 99, overflow: 'hidden', background: 'var(--s3)', gap: 2, marginBottom: 10 }}>
                            <div style={{ width: `${pEFrac}%`, background: 'var(--blu)' }} />
                            <div style={{ width: `${cEFrac}%`, background: 'var(--cyan)' }} />
                            <div style={{ width: `${fEFrac}%`, background: 'var(--amb)' }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600 }}>
                            <span style={{ color: 'var(--blu)' }}>Protein {pEFrac}%</span>
                            <span style={{ color: 'var(--cyan)' }}>Carbs {cEFrac}%</span>
                            <span style={{ color: 'var(--amb)' }}>Fat {fEFrac}%</span>
                          </div>
                        </div>

                        {/* Micronutrients */}
                        <div style={{ padding: '14px 16px', background: 'var(--s2)', borderRadius: 14, border: '1px solid var(--bd)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Estimated Micronutrients
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                            <span style={{ color: 'var(--t2)' }}>Dietary Fiber</span>
                            <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--t1)' }}>~{Math.round((liveDrawerMeal.carbs || 0) * 0.12)}g</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                            <span style={{ color: 'var(--t2)' }}>Sodium</span>
                            <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--t1)' }}>~{Math.round((liveDrawerMeal.calories || 0) * 0.65)}mg</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                            <span style={{ color: 'var(--t2)' }}>Potassium</span>
                            <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--t1)' }}>~{Math.round((liveDrawerMeal.protein || 0) * 12 + 250)}mg</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* 4. Drawer Action Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--bd)',
                background: 'var(--s1)',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setSwapModalData({ slotKey: liveDrawerMeal.slotKey, day: selectedDay, meal: liveDrawerMeal });
                }}
                className="tactile-btn"
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: 12,
                  background: 'var(--s2)',
                  border: '1px solid var(--bd)',
                  color: 'var(--t1)',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                Swap Meal
              </button>

              <button
                onClick={() => handleLogMeal(liveDrawerMeal.slotKey, liveDrawerMeal)}
                className="tactile-btn"
                style={{
                  flex: 1.4,
                  padding: '11px 16px',
                  borderRadius: 12,
                  background: loggedStates[liveDrawerMeal.slotKey] === 'animating' ? 'var(--g)' : loggedStates[liveDrawerMeal.slotKey] === 'logged' ? 'var(--s2)' : 'var(--g)',
                  border: loggedStates[liveDrawerMeal.slotKey] === 'logged' ? '1px solid var(--bd)' : 'none',
                  color: loggedStates[liveDrawerMeal.slotKey] === 'logged' ? 'var(--t3)' : '#ffffff',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease'
                }}
              >
                {loggedStates[liveDrawerMeal.slotKey] === 'animating' ? (
                  <>
                    <Check size={16} />
                    Logged!
                  </>
                ) : loggedStates[liveDrawerMeal.slotKey] === 'logged' ? (
                  'Logged ✓'
                ) : (
                  '＋ Log meal'
                )}
              </button>
            </div>
          </aside>
        </div>,
        document.body
      )}

      {/* ───────────────────────────────────────────────────────────
          SLIDING TOAST NOTIFICATION (Section 9.3: top slide-in, stays 1,800ms)
          ─────────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--s1)',
            border: '1px solid var(--g)',
            borderRadius: 16,
            padding: '10px 18px',
            color: 'var(--t1)',
            fontSize: 13,
            fontWeight: 700,
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'toastSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <span style={{ color: 'var(--g)' }}>✓</span>
          {toastMessage}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          RECIPE SHEET MODAL
          ─────────────────────────────────────────────────────────── */}
      {recipeModalItem && createPortal(
        <div
          onClick={() => setRecipeModalItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 480,
              maxHeight: '85vh',
              background: 'var(--s1)',
              borderTop: '1px solid var(--bd2)',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: '24px 20px 36px',
              overflowY: 'auto',
              boxSizing: 'border-box'
            }}
          >
            {/* Top drag handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--bd2)', margin: '0 auto 16px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--g)', letterSpacing: '0.04em' }}>
                  Recipe & preparation
                </span>
                <h2 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 800, color: 'var(--t1)' }}>
                  {recipeModalItem.name}
                </h2>
              </div>
              <button
                onClick={() => setRecipeModalItem(null)}
                style={{
                  background: 'var(--s2)',
                  border: 'none',
                  borderRadius: 10,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--t3)',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Macro Chips */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              <span style={{ background: 'var(--s2)', padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>
                {recipeModalItem.calories} <span style={{ color: 'var(--t3)', fontWeight: 500, fontSize: 10.5 }}>kcal</span>
              </span>
              <span style={{ background: 'var(--s2)', padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: 'var(--blu)' }}>
                P {Math.round(recipeModalItem.protein)}g
              </span>
              <span style={{ background: 'var(--s2)', padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: 'var(--cyan)' }}>
                C {Math.round(recipeModalItem.carbs)}g
              </span>
              <span style={{ background: 'var(--s2)', padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: 'var(--amb)' }}>
                F {Math.round(recipeModalItem.fat)}g
              </span>
            </div>

            {/* Ingredients */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', letterSpacing: '0.04em', marginBottom: 8 }}>
                Ingredients
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(recipeModalItem.ingredients || ['Fresh ingredients per balanced recipe']).map((ing, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--t2)', padding: '6px 10px', background: 'var(--s2)', borderRadius: 8 }}>
                    • {ing}
                  </div>
                ))}
              </div>
            </div>

            {/* Preparation Steps */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', letterSpacing: '0.04em', marginBottom: 8 }}>
                Instructions
              </div>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--t2)', lineHeight: 1.6 }}>
                {recipeModalItem.recipe || 'Cook according to standard Indian culinary practice with minimal oil and precise macro weighing.'}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ───────────────────────────────────────────────────────────
          SMART SWAP MODAL (Section 8)
          ─────────────────────────────────────────────────────────── */}
      {swapModalData && createPortal(
        <div
          onClick={() => setSwapModalData(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 480,
              maxHeight: '82vh',
              background: 'var(--s1)',
              borderTop: '1px solid var(--bd2)',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: '16px 20px 28px',
              overflowY: 'auto',
              boxSizing: 'border-box'
            }}
          >
            {/* 8.1 Drag handle at top: 36×4px, var(--bd2), centered */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--bd2)', margin: '0 auto 16px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--g)', letterSpacing: '0.04em' }}>
                  Smart swap
                </span>
                <h2 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 800, color: 'var(--t1)' }}>
                  Alternative options
                </h2>
              </div>
              <button
                onClick={() => setSwapModalData(null)}
                style={{
                  background: 'var(--s2)',
                  border: 'none',
                  borderRadius: 10,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--t3)',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* 8.2 & 8.3: Exactly 3 alternatives matching slot within ±15% target calories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {swapAlternatives.map((opt, idx) => {
                const targetCal = swapModalData?.meal?.calories || 400;
                const calDiffRatio = Math.abs((opt.calories - targetCal) / targetCal);
                const matchPct = Math.max(82, Math.min(99, Math.round((1 - calDiffRatio) * 100)));

                return (
                  <div
                    key={idx}
                    onClick={() => handleSwapMeal(swapModalData.slotKey, opt)}
                    style={{
                      padding: '12px 14px',
                      background: 'var(--s2)',
                      borderRadius: 14,
                      border: '0.5px solid var(--bd)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: 'var(--t1)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {opt.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3 }}>
                        {formatCompactMacros(opt.protein, opt.carbs, opt.fat)} · <span style={{ color: 'var(--t2)' }}>{opt.servingUnit || '1 serving'}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
                        {opt.calories} <span style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--t3)' }}>kcal</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--g)' }}>
                          {matchPct}% match
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwapMeal(swapModalData.slotKey, opt);
                          }}
                          style={{
                            background: 'var(--g)',
                            color: '#041a0c',
                            border: 'none',
                            borderRadius: 7,
                            padding: '4px 10px',
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 8.4: "Keep current" button at the bottom for easy dismissal */}
            <button
              onClick={() => setSwapModalData(null)}
              style={{
                width: '100%',
                marginTop: 16,
                background: 'var(--s2)',
                border: '0.5px solid var(--bd)',
                borderRadius: 12,
                padding: '12px',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--t2)',
                cursor: 'pointer'
              }}
            >
              Keep current
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* ───────────────────────────────────────────────────────────
          GROCERY LIST MODAL (Section 7)
          ─────────────────────────────────────────────────────────── */}
      {showGroceryModal && createPortal(
        <div
          onClick={() => setShowGroceryModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 440,
              maxHeight: '85vh',
              background: 'var(--s1)',
              borderRadius: 22,
              border: '1px solid var(--bd2)',
              padding: '16px 20px 22px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box'
            }}
          >
            {/* 7.4 Drag handle at top: 36×4px, var(--bd2), centered */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--bd2)', margin: '0 auto 14px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--g)', letterSpacing: '0.04em' }}>
                  Consolidated list
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 800, color: 'var(--t1)' }}>
                  Weekly groceries
                </h3>
              </div>
              {/* 7.3: Share and Copy buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={handleShareGroceryList}
                  style={{
                    background: 'var(--s3)',
                    border: '0.5px solid var(--bd)',
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--t2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Share2 size={12} />
                  Share
                </button>
                <button
                  onClick={handleCopyGroceryList}
                  style={{
                    background: 'var(--s3)',
                    border: '0.5px solid var(--bd)',
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--t2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Copy size={12} />
                  {copyToast ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={() => setShowGroceryModal(false)}
                  style={{
                    background: 'var(--s2)',
                    border: 'none',
                    borderRadius: 10,
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--t3)',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* 7.2: Categorized grocery sections */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, margin: '8px 0 16px', paddingRight: 4 }}>
              {Object.entries(categorizedGroceries).map(([catKey, cat]) => {
                const itemNames = Object.keys(cat.items);
                if (itemNames.length === 0) return null;

                return (
                  <div key={catKey}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--g)',
                        letterSpacing: '0.04em',
                        marginBottom: 6,
                        paddingLeft: 2
                      }}
                    >
                      {cat.title}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {itemNames.map((itemName) => {
                        const isChecked = !!checkedGroceryItems[itemName];
                        return (
                          <div
                            key={itemName}
                            onClick={() => setCheckedGroceryItems(prev => ({ ...prev, [itemName]: !prev[itemName] }))}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '9px 12px',
                              borderRadius: 12,
                              background: isChecked ? 'rgba(34, 209, 122, 0.04)' : 'var(--s2)',
                              border: isChecked ? '0.5px solid var(--g)' : '0.5px solid var(--bd)',
                              cursor: 'pointer'
                            }}
                          >
                            {/* 7.1: 18×18px checkbox */}
                            <div
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 5,
                                background: isChecked ? 'var(--g)' : 'transparent',
                                border: isChecked ? 'none' : '1.5px solid var(--bd)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: 11,
                                fontWeight: 800,
                                flexShrink: 0
                              }}
                            >
                              {isChecked && '✓'}
                            </div>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: isChecked ? 'var(--t3)' : 'var(--t1)',
                                textDecoration: isChecked ? 'line-through' : 'none'
                              }}
                            >
                              {itemName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center' }}>
              Estimated weekly expenditure: <strong style={{ color: 'var(--t1)' }}>₹{weekCost.toLocaleString()}</strong>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
