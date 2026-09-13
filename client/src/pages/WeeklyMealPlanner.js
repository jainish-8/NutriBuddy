import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import fallbackFoods from '../data/indian_diet_db.json';
import { API_BASE } from '../config';
import {
  generateCohesiveWeeklyMealPlan,
  getSmartMealReplacements,
  generateCategorizedGroceryList,
  getDetailedCalorieBreakdown,
  getDynamicServingUnit,
  parseStructuredIngredients,
  scaleRecipeInstructions
} from '../utils/nutritionEngine';
import MacroDonutChart from '../components/MacroDonutChart';
import BudgetRing from '../components/BudgetRing';
import {
  Plus,
  Minus,
  Check,
  RefreshCw,
  Search,
  X,
  ShoppingCart,
  BookOpen,
  Calendar,
  CheckCircle,
  Copy,
  Sparkles,
  Flame,
  Share2
} from 'lucide-react';

const PLAN_ENGINE_VERSION = 'v6.1_dynamic_servings';

export default function WeeklyMealPlanner({ user, setCurrentPage }) {
  const getStorageKey = (u) => {
    return u?.id || u?._id || u?.email || u?.fullName || 'active_user';
  };

  const isGymUser = user?.isGymGoer === true ||
    (user?.gymDays !== undefined && parseInt(user.gymDays, 10) > 0) ||
    user?.activityLevel === 'active' ||
    user?.activityLevel === 'very-active' ||
    user?.fitnessGoal === 'muscle' ||
    user?.fitnessGoal === 'lean-muscle' ||
    user?.goal === 'muscle' ||
    user?.goal === 'lean_bulk' ||
    user?.goal === 'aggressive_bulk';

  const breakdown = getDetailedCalorieBreakdown(user);
  const targetCal = user?.dailyCalories || breakdown?.targetCalories || 2000;
  const targetProt = user?.targetProtein || breakdown?.macros?.protein || Math.round((user?.weight || 70) * (isGymUser ? 1.8 : 1.2));
  const targetCarb = user?.targetCarbs || breakdown?.macros?.carbs || Math.round((targetCal * 0.5) / 4);
  const targetFat = user?.targetFat || breakdown?.macros?.fat || Math.round((targetCal * 0.25) / 9);

  const loadSavedPlanData = () => {
    const key = getStorageKey(user);
    try {
      const saved = localStorage.getItem(`mealplan_${key}`) || localStorage.getItem('nutribuddy_active_mealplan');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.plan &&
          parsed.version === PLAN_ENGINE_VERSION &&
          Object.keys(parsed.plan).length > 0
        ) {
          const monMeals = parsed.plan['monday'] || {};
          const monCal = Object.values(monMeals).reduce((sum, m) => sum + (m.calories || 0), 0);
          // Only regenerate if target calories significantly changed (>150 kcal delta)
          if (Math.abs(monCal - targetCal) <= 150) {
            return parsed;
          }
        }
      }
    } catch (err) { }
    return null;
  };

  const initialPlanData = loadSavedPlanData();

  const [weeklyPlan, setWeeklyPlan] = useState(initialPlanData?.plan || {});
  const [selectedDay, setSelectedDay] = useState(getCurrentDay());
  const [planGenerated, setPlanGenerated] = useState(!!(initialPlanData && initialPlanData.plan && Object.keys(initialPlanData.plan).length > 0));
  const [corePantry, setCorePantry] = useState(initialPlanData?.corePantry || []);
  const [loading, setLoading] = useState(false);
  const [allFoods, setAllFoods] = useState(fallbackFoods);
  const [swapTarget, setSwapTarget] = useState(null);
  const [swapSearch, setSwapSearch] = useState('');
  const [showGroceryModal, setShowGroceryModal] = useState(false);
  const [recipeModalItem, setRecipeModalItem] = useState(null);
  const [checkedGroceryItems, setCheckedGroceryItems] = useState({});
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [copyToast, setCopyToast] = useState(false);
  const [recipeToGroceryToast, setRecipeToGroceryToast] = useState(false);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Dynamic meal structure based on user's daily schedule & gym days
  const getMealsList = () => {
    if (isGymUser) {
      return ['breakfast', 'pre_workout', 'lunch', 'post_workout', 'dinner', 'snacks'];
    }
    return ['breakfast', 'lunch', 'dinner', 'snacks'];
  };

  const meals = getMealsList();

  const mealLabels = {
    breakfast: 'Breakfast',
    pre_workout: 'Pre-workout fuel',
    post_workout: 'Post-workout recovery',
    lunch: 'Lunch platter',
    dinner: 'Dinner platter',
    snacks: 'Evening snack'
  };

  const getMealBadgeClass = (meal) => {
    switch (meal) {
      case 'breakfast': return 'badge-slot-breakfast';
      case 'pre_workout': return 'badge-slot-preworkout';
      case 'lunch': return 'badge-slot-lunch';
      case 'post_workout': return 'badge-slot-postworkout';
      case 'dinner': return 'badge-slot-dinner';
      case 'snacks': return 'badge-slot-snack';
      default: return 'badge-slot-breakfast';
    }
  };

  function getCurrentDay() {
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayNames[today.getDay()];
  }

  // Fetch foods from server or fallback
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/foods`);
        const data = await response.json();
        if (data.success && data.foods && data.foods.length > 0) {
          setAllFoods(data.foods);
        }
      } catch (error) { }
    };
    fetchFoods();
  }, []);

  // Save helper ensuring redundant keys for zero-loss navigation
  const savePlanToStorage = (plan, corePantryList) => {
    const key = getStorageKey(user);
    const payload = JSON.stringify({
      version: PLAN_ENGINE_VERSION,
      targetCalories: targetCal,
      plan,
      corePantry: corePantryList,
      userId: key,
      savedAt: new Date().toISOString()
    });
    try {
      localStorage.setItem(`mealplan_${key}`, payload);
      localStorage.setItem('nutribuddy_active_mealplan', payload);
    } catch (e) { }
  };

  // Generate cohesive weekly meal plan with persistence
  const generateWeeklyPlan = (overrideFoods = null) => {
    setLoading(true);
    setTimeout(() => {
      const foodSource = overrideFoods || (allFoods && allFoods.length > 0 ? allFoods : fallbackFoods);
      const activeCuisine = user?.cuisinePreference || 'all';
      const generated = generateCohesiveWeeklyMealPlan(foodSource, user, null, activeCuisine);

      setWeeklyPlan(generated.plan);
      setCorePantry(generated.corePantryList || []);
      setPlanGenerated(true);

      savePlanToStorage(
        generated.plan,
        generated.corePantryList || []
      );
      setLoading(false);
    }, 180);
  };

  // Auto-generate plan on first load or if outdated plan detected
  useEffect(() => {
    const monMeals = weeklyPlan?.['monday'] || {};
    const monCal = Object.values(monMeals).reduce((sum, m) => sum + (m.calories || 0), 0);

    if (
      !planGenerated ||
      !weeklyPlan ||
      Object.keys(weeklyPlan).length === 0 ||
      Math.abs(monCal - targetCal) > 150
    ) {
      generateWeeklyPlan(allFoods);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, targetCal]);

  // Interactive Live Portion Adjuster
  const handleAdjustPortion = (day, mealKey, delta) => {
    const currentMeal = weeklyPlan[day]?.[mealKey];
    if (!currentMeal) return;

    const currentMult = currentMeal.multiplier || 1.0;
    const newMult = Math.max(0.25, parseFloat((currentMult + delta).toFixed(2)));

    const baseCost = currentMeal.cost / currentMult;
    const baseCal = currentMeal.calories / currentMult;
    const baseP = currentMeal.protein / currentMult;
    const baseC = currentMeal.carbs / currentMult;
    const baseF = currentMeal.fat / currentMult;

    const updatedMeal = {
      ...currentMeal,
      multiplier: newMult,
      cost: Math.round(baseCost * newMult),
      calories: Math.round(baseCal * newMult),
      protein: Math.round(baseP * newMult * 10) / 10,
      carbs: Math.round(baseC * newMult * 10) / 10,
      fat: Math.round(baseF * newMult * 10) / 10,
    };

    const updatedDayMeals = {
      ...weeklyPlan[day],
      [mealKey]: updatedMeal
    };

    const updatedPlan = {
      ...weeklyPlan,
      [day]: updatedDayMeals
    };

    setWeeklyPlan(updatedPlan);
    savePlanToStorage(updatedPlan, corePantry);
  };

  const getSelectedDayTotals = () => {
    const dayMeals = weeklyPlan[selectedDay] || {};
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    meals.forEach(meal => {
      const food = dayMeals[meal];
      if (food) {
        calories += Number(food.calories) || 0;
        protein += Number(food.protein) || 0;
        carbs += Number(food.carbs) || 0;
        fat += Number(food.fat) || 0;
      }
    });

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat)
    };
  };

  const handleSwapDish = (newDish) => {
    if (!swapTarget || !newDish) return;
    const { day, mealType, currentMeal } = swapTarget;

    const targetCaloriesForSlot = currentMeal.calories || (newDish.calories || 250);
    const baseDishCal = newDish.calories || 250;
    const requiredMult = Math.max(0.5, Math.min(3.0, parseFloat((targetCaloriesForSlot / baseDishCal).toFixed(2))));

    const updatedMeal = {
      ...newDish,
      multiplier: requiredMult,
      cost: Math.round((newDish.cost || 15) * requiredMult),
      calories: Math.round(baseDishCal * requiredMult),
      protein: Math.round((newDish.protein || 5) * requiredMult * 10) / 10,
      carbs: Math.round((newDish.carbs || 30) * requiredMult * 10) / 10,
      fat: Math.round((newDish.fat || 5) * requiredMult * 10) / 10,
    };

    const updatedDayMeals = {
      ...weeklyPlan[day],
      [mealType]: updatedMeal
    };

    const updatedPlan = {
      ...weeklyPlan,
      [day]: updatedDayMeals
    };

    setWeeklyPlan(updatedPlan);
    setSwapTarget(null);
    setSwapSearch('');

    savePlanToStorage(updatedPlan, corePantry);
  };

  const [loggedMeals, setLoggedMeals] = useState({});

  const logMeal = async (meal, mealData) => {
    const mealKey = `${selectedDay}-${meal}`;
    if (loggedMeals[mealKey] === 'loading') return;

    setLoggedMeals(prev => ({ ...prev, [mealKey]: 'loading' }));

    const today = new Date();
    const foodLog = {
      userId: user?.id || 'guest',
      foodId: mealData.id || `plan-${meal}-${today.getTime()}`,
      name: `${mealData.multiplier && mealData.multiplier !== 1 ? `${mealData.multiplier}x ` : ''}${mealData.name}`,
      quantity: mealData.multiplier || 1,
      mealType: meal === 'pre_workout' || meal === 'post_workout' ? 'snacks' : meal,
      calories: Math.round(mealData.calories || 0),
      protein: Math.round(mealData.protein || 0),
      carbs: Math.round(mealData.carbs || 0),
      fat: Math.round(mealData.fat || 0),
      timestamp: today.toISOString(),
      source: 'meal-planner'
    };

    try {
      const dateKey = `nutribuddy_foodlogs_${user?.id || 'guest'}_${today.toISOString().split('T')[0]}`;
      const existing = JSON.parse(localStorage.getItem(dateKey) || '[]');
      existing.push({ ...foodLog, id: today.getTime() });
      localStorage.setItem(dateKey, JSON.stringify(existing));
    } catch (_) { }

    try {
      await fetch(`${API_BASE}/api/food-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodLog)
      });
    } catch (_) { }

    setLoggedMeals(prev => ({ ...prev, [mealKey]: 'done' }));
    setTimeout(() => setLoggedMeals(prev => ({ ...prev, [mealKey]: null })), 1500);
  };

  const toggleGroceryCheck = (itemKey) => {
    setCheckedGroceryItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  const toggleIngredientCheck = (idx) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const copyGroceryListText = () => {
    const categorized = generateCategorizedGroceryList(weeklyPlan);
    let text = `NUTRIBUDDY 7-DAY CONSOLIDATED INDIAN GROCERY LIST\n\n`;

    Object.values(categorized).forEach(cat => {
      const itemsList = Object.entries(cat.items);
      if (itemsList.length > 0) {
        text += `[${cat.title}]\n`;
        itemsList.forEach(([item, count]) => {
          text += `• ${item} (${count}x)\n`;
        });
        text += '\n';
      }
    });

    navigator.clipboard.writeText(text);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2500);
  };

  const shareGroceryList = async () => {
    const categorized = generateCategorizedGroceryList(weeklyPlan);
    let text = `NutriBuddy 7-Day Indian Grocery List\n\n`;

    Object.values(categorized).forEach(cat => {
      const itemsList = Object.entries(cat.items);
      if (itemsList.length > 0) {
        text += `[${cat.title}]\n`;
        itemsList.forEach(([item, count]) => {
          text += `• ${item} (${count}x)\n`;
        });
        text += '\n';
      }
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NutriBuddy 7-Day Grocery List',
          text: text
        });
      } catch (err) {
        copyGroceryListText();
      }
    } else {
      copyGroceryListText();
    }
  };

  const addAllToGroceryList = (item) => {
    if (!item) return;
    setRecipeToGroceryToast(true);
    setTimeout(() => setRecipeToGroceryToast(false), 3000);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 8px 48px' }}>

      {/* ── HERO COMMAND HEADER ── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-card)',
        padding: '24px 30px',
        marginBottom: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 18,
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative glow */}
        <div style={{
          position: 'absolute', top: -50, right: -50, width: 180, height: 180,
          background: 'radial-gradient(circle, var(--brand-primary-glow) 0%, transparent 70%)',
          pointerEvents: 'none', opacity: 0.6
        }} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', gap: 5 }}>
              MEAL PLANNER
            </span>
          </div>

          <h2 style={{ margin: '0 0 10px 0', fontFamily: 'var(--font-heading)', fontSize: 23, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Your Weekly Meal Plan
          </h2>

          {/* Crisp Meta Metric Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 'var(--radius-panel)',
              background: 'var(--brand-primary-subtle)',
              border: '1px solid var(--border-focus)',
              fontSize: 11.5,
              fontWeight: 800,
              color: 'var(--brand-primary-light)'
            }}>
              <Flame size={12} color="var(--brand-primary-light)" />
              <span className="tabular-nums">Goal: {targetCal} kcal / day</span>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 'var(--radius-panel)',
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-subtle)',
              fontSize: 11.5,
              fontWeight: 700,
              color: 'var(--text-secondary)',
              textTransform: 'capitalize'
            }}>
              <Sparkles size={12} color="var(--brand-primary-light)" />
              <span>{user?.dietaryPreferences ? `${user.dietaryPreferences} Plan` : 'Balanced Plan'}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowGroceryModal(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', fontSize: 13, fontWeight: 700 }}
          >
            <ShoppingCart size={15} /> Grocery List
          </button>

          <button
            onClick={() => generateWeeklyPlan()}
            disabled={loading}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', fontSize: 13, fontWeight: 800 }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            {loading ? 'Optimizing...' : 'Recalibrate Plan'}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          textAlign: 'center', padding: '50px 20px',
          background: 'var(--bg-surface)', borderRadius: 'var(--radius-card)',
          border: '1px solid var(--border-subtle)', marginBottom: 20
        }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--brand-primary)', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
          <h3 style={{ margin: '0 0 6px 0', fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 800 }}>
            Calibrating Real-World Indian Meals
          </h3>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 13 }}>
            Balancing macros, authentic Thali combinations, and practical household prep.
          </p>
        </div>
      )}

      {/* Main Content Area */}
      {planGenerated && !loading && (() => {
        const totals = getSelectedDayTotals();
        const calPercent = Math.round((totals.calories / targetCal) * 100);
        const protPercent = Math.round((totals.protein / targetProt) * 100);
        const carbPercent = Math.round((totals.carbs / targetCarb) * 100);
        const fatPercent = Math.round((totals.fat / targetFat) * 100);

        const getPercentColor = (pct) => {
          if (pct >= 120) return '#EF4444';
          if (pct > 100) return '#F5A623';
          if (pct >= 80) return '#10B981';
          return 'var(--text-muted)';
        };

        const getBarColor = (pct, baseColor) => {
          if (pct > 100) return '#F5A623';
          return baseColor;
        };

        return (
          <div>
            {/* ── 7-DAY SCHEDULE STRIP ── */}
            <div className="meal-planner-days-strip">
              {days.map((day) => {
                const isSelected = selectedDay === day;
                const dayMeals = weeklyPlan[day] || {};
                const dayCal = Object.values(dayMeals).reduce((sum, m) => sum + (Number(m.calories) || 0), 0);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className="meal-planner-day-btn"
                    style={{
                      padding: '12px 6px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      border: isSelected ? '1.5px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface)',
                      textAlign: 'center',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isSelected ? '0 4px 16px rgba(16, 185, 129, 0.15)' : 'none',
                      transform: isSelected ? 'translateY(-1px)' : 'none'
                    }}
                  >
                    <div style={{
                      fontSize: 12.5,
                      fontWeight: 900,
                      fontFamily: 'var(--font-heading)',
                      color: isSelected ? 'var(--brand-primary-light)' : 'var(--text-primary)',
                      letterSpacing: '0.04em'
                    }}>
                      {day.slice(0, 3)}
                    </div>
                    <div className="tabular-nums" style={{ fontSize: 11, fontWeight: 700, color: isSelected ? 'var(--brand-primary-light)' : 'var(--text-muted)', marginTop: 3 }}>
                      {dayCal > 0 ? `${dayCal} kcal` : `${targetCal} kcal`}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ── DAILY MACRO COMMAND CENTER ── */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-card)',
              padding: '20px 24px',
              marginBottom: 20,
              boxShadow: 'var(--shadow-card)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 20,
              alignItems: 'center'
            }}>
              {/* Energy Target Progress Bar */}
              <div style={{ minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Calendar size={14} color="var(--brand-primary-light)" />
                  <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
                    {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} Nutrition
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                  <span className="tabular-nums" style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                    {totals.calories}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                    / {targetCal} kcal
                  </span>
                </div>

                {/* Progress Track */}
                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-surface-raised)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, calPercent))}%`,
                    background: calPercent > 100 ? '#F5A623' : 'linear-gradient(90deg, #10B981, #38BDF8)',
                    borderRadius: 3,
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>

              {/* Protein Target Box */}
              <div style={{ background: 'var(--bg-surface-raised)', padding: '12px 16px', borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--accent-protein-text, #818CF8)' }}>Planned protein</span>
                  <span className="tabular-nums" style={{ fontSize: 11, fontWeight: 700, color: getPercentColor(protPercent) }}>{protPercent}%</span>
                </div>
                <div className="tabular-nums" style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>
                  {totals.protein}g <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>/ {targetProt}g</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--border-subtle)', marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, protPercent))}%`, background: getBarColor(protPercent, '#818CF8'), borderRadius: 2 }} />
                </div>
              </div>

              {/* Carbs Target Box */}
              <div style={{ background: 'var(--bg-surface-raised)', padding: '12px 16px', borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--brand-primary-light, #10B981)' }}>Planned carbs</span>
                  <span className="tabular-nums" style={{ fontSize: 11, fontWeight: 700, color: getPercentColor(carbPercent) }}>{carbPercent}%</span>
                </div>
                <div className="tabular-nums" style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>
                  {totals.carbs}g <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>/ {targetCarb}g</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--border-subtle)', marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, carbPercent))}%`, background: getBarColor(carbPercent, '#10B981'), borderRadius: 2 }} />
                </div>
              </div>

              {/* Fats Target Box */}
              <div style={{ background: 'var(--bg-surface-raised)', padding: '12px 16px', borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--color-fat, #f5a623)' }}>Planned fats</span>
                  <span className="tabular-nums" style={{ fontSize: 11, fontWeight: 700, color: getPercentColor(fatPercent) }}>{fatPercent}%</span>
                </div>
                <div className="tabular-nums" style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>
                  {totals.fat}g <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>/ {targetFat}g</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--border-subtle)', marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, fatPercent))}%`, background: getBarColor(fatPercent, 'var(--color-fat, #f5a623)'), borderRadius: 2 }} />
                </div>
              </div>
            </div>

            {/* ── VISUAL ANALYTICS: MACRO DONUT & GROCERY BUDGET RING ── */}
            {(() => {
              const weeklySpend = Math.round(
                Object.values(weeklyPlan).flatMap(d => Object.values(d || {})).reduce((sum, m) => sum + (Number(m.cost) || 35) * (Number(m.multiplier) || 1), 0)
              );
              const budgetLimits = {
                tight: 1200,
                moderate: 2000,
                flexible: 3200,
                premium: 5000
              };
              const weeklyBudgetLimit = budgetLimits[user?.budgetRange] || 2000;

              return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 16,
                  marginBottom: 20
                }}>
                  {/* Planned Day Macro Distribution Donut */}
                  <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-card)',
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>
                        {selectedDay.toUpperCase()} MACRO BALANCE
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary-light)' }}>
                        {totals.calories} kcal
                      </span>
                    </div>
                    <MacroDonutChart
                      calories={totals.calories}
                      protein={totals.protein}
                      carbs={totals.carbs}
                      fat={totals.fat}
                      size={155}
                      showLegend={true}
                      centerLabel="PLANNED"
                    />
                  </div>

                  {/* Weekly Grocery Budget Ring */}
                  <BudgetRing
                    spent={weeklySpend}
                    limit={weeklyBudgetLimit}
                    label="7-Day Grocery Spend Target"
                  />
                </div>
              );
            })()}

            {/* ── ELEVATED 2-TIER MEAL PLATTER CARDS ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {meals.map((meal) => {
                const mealData = weeklyPlan[selectedDay]?.[meal];
                if (!mealData) return null;

                const mealKey = `${selectedDay}-${meal}`;
                const logStatus = loggedMeals[mealKey];

                return (
                  <div
                    key={meal}
                    className="nb-card"
                    style={{
                      padding: '20px 22px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0,
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    {/* Row 1: [Meal slot badge] ............... [X kcal] */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`nb-tag ${getMealBadgeClass(meal)}`}>
                        {mealLabels[meal] || meal}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                        {Math.round(mealData.calories)} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>kcal</span>
                      </span>
                    </div>

                    {/* Row 2: Meal name (16px weight 600, --text-primary, line-height 1.3) */}
                    <h3 style={{ margin: '12px 0 2px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {mealData.name}
                    </h3>

                    {/* Row 3: Serving description (12px, --text-secondary) */}
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                      {getDynamicServingUnit(mealData, mealData.multiplier || 1)}
                    </div>

                    {/* Row 4: [P Xg] [C Xg] [F Xg] in colored text, then [portion multiplier Xx] right-aligned */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em' }}>
                        <span style={{ color: 'var(--color-protein)' }}>P {Math.round(mealData.protein)}g</span>
                        <span style={{ color: 'var(--color-carbs)' }}>C {Math.round(mealData.carbs)}g</span>
                        <span style={{ color: 'var(--color-fat)' }}>F {Math.round(mealData.fat)}g</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: 'var(--color-raised)',
                        borderRadius: 8,
                        border: '0.5px solid var(--border-default)',
                        padding: '3px 6px'
                      }}>
                        <button
                          type="button"
                          onClick={() => handleAdjustPortion(selectedDay, meal, -0.25)}
                          disabled={(mealData.multiplier || 1) <= 0.25}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: (mealData.multiplier || 1) <= 0.25 ? 'var(--text-muted)' : 'var(--text-secondary)',
                            cursor: (mealData.multiplier || 1) <= 0.25 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: 2
                          }}
                          title="Decrease portion"
                        >
                          <Minus size={11} />
                        </button>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', minWidth: 32, textAlign: 'center' }}>
                          {mealData.multiplier || 1}×
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdjustPortion(selectedDay, meal, 0.25)}
                          disabled={(mealData.multiplier || 1) >= 3.0}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: (mealData.multiplier || 1) >= 3.0 ? 'var(--text-muted)' : 'var(--text-secondary)',
                            cursor: (mealData.multiplier || 1) >= 3.0 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: 2
                          }}
                          title="Increase portion"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Divider: 0.5px rgba(255,255,255,0.06) */}
                    <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.06)', margin: '0 0 14px' }} />

                    {/* Row 5: [Recipe] [Swap] [+ Log meal] buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => { setCheckedIngredients({}); setRecipeModalItem(mealData); }}
                        className="nb-btn-secondary"
                        style={{ flex: 1, height: 44, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                      >
                        <BookOpen size={13} /> Recipe
                      </button>

                      <button
                        onClick={() => setSwapTarget({ day: selectedDay, mealType: meal, currentMeal: mealData })}
                        className="nb-btn-secondary"
                        style={{ flex: 1, height: 44, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                      >
                        <RefreshCw size={13} /> Swap
                      </button>

                      <button
                        onClick={() => logMeal(meal, mealData)}
                        disabled={logStatus === 'loading' || logStatus === 'done'}
                        className={logStatus === 'done' ? 'nb-btn-secondary' : 'nb-btn-primary'}
                        style={{
                          flex: 2,
                          height: 44,
                          fontSize: 13,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          background: logStatus === 'done' ? 'var(--color-green)' : undefined,
                          color: logStatus === 'done' ? '#0a1a10' : undefined,
                          borderColor: logStatus === 'done' ? 'var(--color-green)' : undefined,
                          transition: 'all 0.25s ease'
                        }}
                      >
                        {logStatus === 'done' ? (
                          <><CheckCircle size={14} /> ✓ Logged</>
                        ) : (
                          <><Plus size={14} /> + Log meal</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── CATEGORIZED GROCERY CHECKLIST MODAL ── */}
      {showGroceryModal && createPortal(
        <div
          onClick={() => setShowGroceryModal(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(10px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--color-card)',
              border: '0.5px solid var(--border-default)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: 680,
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-overlay)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '0.5px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-green)', letterSpacing: '0.08em' }}>
                  Weekly grocery list
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Smart grocery essentials
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={copyGroceryListText}
                  className="nb-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, height: 36 }}
                >
                  {copyToast ? <><Check size={13} color="var(--color-green)" /> Copied!</> : <><Copy size={13} /> Copy list</>}
                </button>
                <button
                  onClick={shareGroceryList}
                  className="nb-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, height: 36 }}
                >
                  <Share2 size={13} /> Share
                </button>
                <button
                  onClick={() => setShowGroceryModal(false)}
                  style={{ background: 'var(--color-raised)', border: '0.5px solid var(--border-default)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Aisles Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Weekly Staples with individual checkbox rows */}
              {corePantry && corePantry.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 8, marginBottom: 8 }}>
                    Weekly staples
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {corePantry.slice(0, 8).map((p, pIdx) => {
                      const itemKey = `staple-${p.name}`;
                      const isChecked = !!checkedGroceryItems[itemKey];
                      return (
                        <div
                          key={pIdx}
                          onClick={() => toggleGroceryCheck(itemKey)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 14px',
                            borderRadius: 12,
                            background: isChecked ? 'rgba(34, 209, 122, 0.04)' : 'var(--color-raised)',
                            border: `0.5px solid ${isChecked ? 'var(--border-accent)' : 'var(--border-default)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{
                            width: 20,
                            height: 20,
                            borderRadius: 6,
                            border: isChecked ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                            background: isChecked ? 'var(--color-green)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0a1a10',
                            flexShrink: 0
                          }}>
                            {isChecked && <Check size={13} strokeWidth={3} />}
                          </div>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                            <span style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                              textDecoration: isChecked ? 'line-through' : 'none',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {p.name}
                            </span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                              ({p.count}×)
                            </span>
                          </div>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 600,
                            background: 'var(--color-card)',
                            color: 'var(--text-secondary)',
                            borderRadius: 6,
                            padding: '2px 8px',
                            flexShrink: 0
                          }}>
                            {p.count} {p.count === 1 ? 'meal' : 'meals'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(() => {
                const categorized = generateCategorizedGroceryList(weeklyPlan);
                return Object.entries(categorized).map(([catKey, catData]) => {
                  const itemsList = Object.entries(catData.items);
                  if (itemsList.length === 0) return null;

                  return (
                    <div key={catKey}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 16, marginBottom: 8 }}>
                        {catData.title}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {itemsList.map(([name, count]) => {
                          const itemKey = `${catKey}-${name}`;
                          const isChecked = !!checkedGroceryItems[itemKey];

                          return (
                            <div
                              key={name}
                              onClick={() => toggleGroceryCheck(itemKey)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '10px 14px',
                                borderRadius: 12,
                                background: isChecked ? 'rgba(34, 209, 122, 0.04)' : 'var(--color-raised)',
                                border: `0.5px solid ${isChecked ? 'var(--border-accent)' : 'var(--border-default)'}`,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <div style={{
                                width: 20,
                                height: 20,
                                borderRadius: 6,
                                border: isChecked ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                                background: isChecked ? 'var(--color-green)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#0a1a10',
                                flexShrink: 0
                              }}>
                                {isChecked && <Check size={13} strokeWidth={3} />}
                              </div>
                              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                                <span style={{
                                  fontSize: 14,
                                  fontWeight: 500,
                                  color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                                  textDecoration: isChecked ? 'line-through' : 'none',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {name}
                                </span>
                                <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                                  ({count}×)
                                </span>
                              </div>
                              <span style={{
                                fontSize: 11,
                                fontWeight: 600,
                                background: 'var(--color-card)',
                                color: 'var(--text-secondary)',
                                borderRadius: 6,
                                padding: '2px 8px',
                                flexShrink: 0
                              }}>
                                {count} {count === 1 ? 'meal' : 'meals'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── RECIPE & COOKING GUIDE MODAL ── */}
      {recipeModalItem && createPortal(
        <div
          onClick={() => setRecipeModalItem(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(10px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-modal)',
              width: '100%',
              maxWidth: 640,
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-overlay)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ padding: '22px 26px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--brand-primary-light)', letterSpacing: '0.06em' }}>
                  Recipe & preparation guide
                </span>
                <h3 style={{ margin: '2px 0 3px', fontSize: 19, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  {recipeModalItem.name}
                </h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Portion: <span style={{ color: 'var(--brand-primary-light)', fontWeight: 700 }}>{getDynamicServingUnit(recipeModalItem, recipeModalItem.multiplier || 1)}</span>
                </div>
              </div>
              <button
                onClick={() => setRecipeModalItem(null)}
                style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Recipe Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Macro Ribbon */}
              <div style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-card)', padding: '12px 18px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)' }}>Calories</div>
                  <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 900, color: 'var(--brand-primary-light)' }}>{recipeModalItem.calories} kcal</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)' }}>Protein</div>
                  <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent-protein-text, #818CF8)' }}>{recipeModalItem.protein}g</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)' }}>Carbs</div>
                  <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 900, color: 'var(--brand-primary-light, #10B981)' }}>{recipeModalItem.carbs}g</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)' }}>Fat</div>
                  <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-fat, #f5a623)' }}>{recipeModalItem.fat}g</div>
                </div>
              </div>

              {/* Measured Ingredients Grid */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 900, color: 'var(--brand-primary-light)', letterSpacing: '0.04em' }}>
                      Ingredients — {(recipeModalItem.multiplier || 1).toFixed(2).replace(/\.00$/, '')}× portion
                    </h4>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                      Tap to check off
                    </div>
                  </div>
                  <button
                    onClick={() => addAllToGroceryList(recipeModalItem)}
                    className="btn btn-secondary"
                    style={{
                      padding: '6px 12px',
                      fontSize: 11.5,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <ShoppingCart size={13} /> {recipeToGroceryToast ? 'Added to grocery list!' : 'Add all to grocery list'}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                  {parseStructuredIngredients(recipeModalItem.ingredients || [], recipeModalItem.multiplier || 1).map((ing, iIdx) => {
                    const isChecked = !!checkedIngredients[iIdx];
                    return (
                      <div
                        key={iIdx}
                        onClick={() => toggleIngredientCheck(iIdx)}
                        style={{
                          background: isChecked ? 'var(--brand-primary-subtle)' : 'var(--bg-surface-raised)',
                          padding: '11px 16px',
                          borderRadius: 12,
                          border: `1px solid ${isChecked ? 'var(--border-focus)' : 'var(--border-subtle)'}`,
                          fontSize: 13.5,
                          color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                          <div style={{
                            width: 17, height: 17, borderRadius: 5,
                            border: `1.5px solid ${isChecked ? 'var(--brand-primary)' : 'var(--text-muted)'}`,
                            background: isChecked ? 'var(--brand-primary)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 10, flexShrink: 0
                          }}>
                            {isChecked && <Check size={11} strokeWidth={3} />}
                          </div>
                          <span style={{
                            textDecoration: isChecked ? 'line-through' : 'none',
                            fontWeight: 600,
                            color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                            lineHeight: 1.4,
                            wordBreak: 'break-word'
                          }}>
                            {ing.name}
                          </span>
                        </div>
                        {ing.measurement && (
                          <span style={{
                            fontSize: 11.5,
                            fontWeight: 800,
                            color: isChecked ? 'var(--text-muted)' : 'var(--brand-primary-light)',
                            background: isChecked ? 'transparent' : 'var(--brand-primary-subtle)',
                            padding: '4px 10px',
                            borderRadius: 8,
                            border: isChecked ? 'none' : '1px solid var(--border-focus)',
                            flexShrink: 0,
                            whiteSpace: 'nowrap',
                            textDecoration: isChecked ? 'line-through' : 'none'
                          }}>
                            {ing.measurement}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Numbered Steps with Clean Method Cards */}
              {recipeModalItem.recipe && (
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: 12.5, fontWeight: 900, color: 'var(--brand-primary-light)', letterSpacing: '0.06em' }}>
                    Step-by-step preparation method
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {scaleRecipeInstructions(recipeModalItem.recipe, recipeModalItem.multiplier || 1)
                      .split(/(?:\d+\.\s*|[.!相對]\s+)/)
                      .map(s => s.trim())
                      .filter(s => s.length > 5)
                      .map(s => s.replace(/Eat cold\.?/gi, 'Serve chilled straight from the fridge. Add a drizzle of honey or jaggery if preferred.'))
                      .map((stepText, sIdx) => (
                        <div key={sIdx} style={{
                          display: 'flex', gap: 14, alignItems: 'flex-start',
                          background: 'var(--bg-surface-raised)',
                          padding: '12px 16px',
                          borderRadius: 12,
                          border: '1px solid var(--border-subtle)'
                        }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                            background: 'var(--brand-primary-subtle)',
                            color: 'var(--brand-primary-light)',
                            border: '1px solid var(--border-focus)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 900, marginTop: 1
                          }}>
                            {sIdx + 1}
                          </div>
                          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                            {stepText.endsWith('.') ? stepText : `${stepText}.`}
                          </p>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* Benefits & Tips */}
              {(recipeModalItem.benefits || recipeModalItem.tips) && (
                <div style={{ background: 'var(--brand-primary-subtle)', border: '1px solid var(--border-focus)', borderRadius: 'var(--radius-card)', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recipeModalItem.benefits && (
                    <div style={{ fontSize: 12.5, color: 'var(--text-primary)' }}>
                      <strong style={{ color: 'var(--brand-primary-light)' }}>Health Benefits: </strong>
                      {recipeModalItem.benefits}
                    </div>
                  )}
                  {recipeModalItem.tips && (
                    <div style={{ fontSize: 12.5, color: 'var(--text-primary)' }}>
                      <strong style={{ color: 'var(--brand-primary-light)' }}>Nutritionist Pro-Tip: </strong>
                      {recipeModalItem.tips}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── SMART SWAP MODAL ── */}
      {swapTarget && createPortal(
        <div
          onClick={() => { setSwapTarget(null); setSwapSearch(''); }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(10px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-modal)',
              width: '100%',
              maxWidth: 600,
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-overlay)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--brand-primary-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  SWAP {swapTarget.mealType.toUpperCase()} ({swapTarget.day.toUpperCase()})
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  Choose Alternative Dish
                </h3>
              </div>
              <button
                onClick={() => { setSwapTarget(null); setSwapSearch(''); }}
                style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Live Search Bar */}
            <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-raised)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  placeholder="Search dishes or ingredients..."
                  value={swapSearch}
                  onChange={e => setSwapSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 14px 9px 36px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Alternative Dishes List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(() => {
                let candidates = [];
                if (swapSearch.trim()) {
                  const q = swapSearch.toLowerCase();
                  candidates = (allFoods || fallbackFoods).filter(f => {
                    return (f.name || '').toLowerCase().includes(q) || (f.category || '').toLowerCase().includes(q) || (f.ingredients || []).some(i => i.toLowerCase().includes(q));
                  });
                } else {
                  candidates = getSmartMealReplacements(
                    swapTarget.currentMeal,
                    allFoods || fallbackFoods,
                    user,
                    swapTarget.mealType,
                    'all'
                  );
                }

                if (candidates.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
                      No alternative dishes found matching "${swapSearch}".
                    </div>
                  );
                }

                return candidates.map((dish, dIdx) => (
                  <div
                    key={dIdx}
                    onClick={() => handleSwapDish(dish)}
                    style={{
                      background: 'var(--bg-surface-raised)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-panel)',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 14
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--border-focus)';
                      e.currentTarget.style.background = 'var(--brand-primary-subtle)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.background = 'var(--bg-surface-raised)';
                    }}
                  >
                    <div>
                      <h4 style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                        {dish.name}
                      </h4>
                      <div className="tabular-nums" style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', gap: 10 }}>
                        <span style={{ color: 'var(--brand-primary-light)', fontWeight: 700 }}>{dish.calories} kcal</span>
                        <span style={{ color: 'var(--accent-protein-text, #818CF8)' }}>P: {dish.protein}g</span>
                        <span style={{ color: 'var(--brand-primary-light, #10B981)' }}>C: {dish.carbs}g</span>
                        <span style={{ color: 'var(--color-fat, #f5a623)' }}>F: {dish.fat}g</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{
                        padding: '6px 14px',
                        fontSize: 11.5,
                        fontWeight: 800,
                        flexShrink: 0
                      }}
                    >
                      Select
                    </button>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
