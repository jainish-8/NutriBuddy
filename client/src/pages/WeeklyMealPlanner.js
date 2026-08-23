import React, { useState, useEffect } from 'react';
import fallbackFoods from '../data/indian_diet_db.json';
import { API_BASE } from '../config';
import { scaleIngredients } from '../utils/nutritionEngine';
import { Plus, Check, Sparkles, Clock } from 'lucide-react';

export default function WeeklyMealPlanner({ user, setCurrentPage }) {
  const [weeklyPlan, setWeeklyPlan] = useState({});
  const [selectedDay, setSelectedDay] = useState(getCurrentDay());
  const [planGenerated, setPlanGenerated] = useState(false);
  const [weeklyBudget, setWeeklyBudget] = useState(0);
  const [budgetBreakdown, setBudgetBreakdown] = useState({});
  const [loading, setLoading] = useState(false);
  const [allFoods, setAllFoods] = useState(fallbackFoods);

  // Budget mapping from profile range to weekly ₹ amount
  const profileBudgetMap = { tight: 1000, moderate: 2100, flexible: 3500, premium: 5250 };
  const profileDefaultBudget = profileBudgetMap[user?.budgetRange] || 2100;

  // Real-time budget adjustment
  const [customBudget, setCustomBudget] = useState(null);
  const [sliderBudget, setSliderBudget] = useState(profileDefaultBudget);
  const [showBudgetEditor, setShowBudgetEditor] = useState(false);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const prof = (user?.profession || '').toLowerCase();
  const isGymProfessional = prof.includes('trainer') || prof.includes('coach') || prof.includes('athlete') || prof.includes('sports');
  const isGymUser = user?.isGymGoer || (user?.gymDays !== undefined && parseInt(user.gymDays, 10) > 0);

  // Dynamic meal structure based on user's daily schedule & gym days
  const getMealsList = () => {
    if (
      prof.includes('nurse') || prof.includes('doctor') || prof.includes('dentist') || prof.includes('surgeon') ||
      prof.includes('cashier') || prof.includes('sales') || prof.includes('retail') ||
      prof.includes('driver') || prof.includes('delivery') || prof.includes('police') ||
      prof.includes('teacher') || prof.includes('barber')
    ) {
      return ['breakfast', 'lunch', 'dinner'];
    }
    if (isGymProfessional || (isGymUser && parseInt(user?.gymDays, 10) >= 5)) {
      return ['breakfast', 'pre_workout', 'post_workout', 'lunch', 'dinner', 'snacks'];
    }
    if (isGymUser) {
      return ['breakfast', 'post_workout', 'lunch', 'dinner', 'snacks'];
    }
    return ['breakfast', 'lunch', 'dinner', 'snacks'];
  };

  const meals = getMealsList();

  const mealLabels = {
    breakfast: 'Breakfast',
    pre_workout: 'Pre-Workout Fuel',
    post_workout: 'Post-Workout Recovery',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snacks: 'Snacks / Tea'
  };

  const getMealColor = (meal) => {
    const colors = {
      breakfast: '#818CF8',
      pre_workout: '#10B981',
      post_workout: '#F59E0B',
      lunch: '#6366F1',
      dinner: '#EF4444',
      snacks: '#F472B6'
    };
    return colors[meal] || 'var(--text-muted)';
  };

  function getCurrentDay() {
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayNames[today.getDay()];
  }

  const getBudgetLimits = () => {
    if (customBudget) {
      return {
        weekly: customBudget,
        daily: Math.round(customBudget / 7),
        meal: Math.round(customBudget / (meals.length * 7))
      };
    }
    
    const budgetMap = {
      'tight': { weekly: 1000, daily: 143 },
      'moderate': { weekly: 2100, daily: 300 },
      'flexible': { weekly: 3500, daily: 500 },
      'premium': { weekly: 5250, daily: 750 }
    };
    
    const limits = budgetMap[user?.budgetRange] || budgetMap['moderate'];
    return {
      ...limits,
      meal: Math.round(limits.daily / meals.length)
    };
  };

  // Fetch foods from server or fallback
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/foods`);
        const data = await response.json();
        if (data.success && data.foods && data.foods.length > 0) {
          setAllFoods(data.foods);
        }
      } catch (error) {}
    };
    fetchFoods();
  }, []);

  // Load saved plan from localStorage
  useEffect(() => {
    if (user?.id) {
      const savedPlan = localStorage.getItem(`mealplan_${user.id}`);
      if (savedPlan) {
        try {
          const planData = JSON.parse(savedPlan);
          const planDay = Object.keys(planData.plan || {})[0];
          const planMeals = planDay ? Object.keys(planData.plan[planDay] || {}) : [];
          
          if (planMeals.length === meals.length) {
            setWeeklyPlan(planData.plan);
            setWeeklyBudget(planData.budget);
            setBudgetBreakdown(planData.breakdown);
            setCustomBudget(planData.customBudget);
            setPlanGenerated(true);
          }
        } catch (error) {}
      }
    }
  }, [user?.id, meals.length]);

  const updateBudget = (newBudget) => {
    const parsed = parseInt(newBudget, 10) || profileDefaultBudget;
    setCustomBudget(parsed);
    setShowBudgetEditor(false);
    if (planGenerated) {
      setTimeout(() => {
        generateWeeklyPlan();
      }, 300);
    }
  };

  const budgetLimits = getBudgetLimits();
  const budgetStatus = weeklyBudget <= budgetLimits.weekly ? 'within' : 'over';

  // 10,000-Iteration High Precision Permutation Solver
  const generateWeeklyPlan = () => {
    setLoading(true);
    const newPlan = {};
    let totalWeeklyCost = 0;
    const dailyCosts = {};
    const limits = getBudgetLimits();

    const targetCalories = user?.dailyCalories || 2000;
    const targetProtein = user?.targetProtein || Math.round((user?.weight || 70) * (isGymUser ? 2.0 : 1.2));
    const targetCarbs = user?.targetCarbs || Math.round((targetCalories * 0.5) / 4);
    const targetFat = user?.targetFat || Math.round((targetCalories * 0.25) / 9);
    const dailyBudget = limits.daily;

    // 1. Pre-filter candidate list per meal slot
    const candidates = {};
    meals.forEach(mealType => {
      let filtered = allFoods.filter(food => {
        if (!food.mealTypes || !food.mealTypes.includes(mealType)) return false;

        // Allergen filtering
        if (food.allergies && user?.allergies && user.allergies.length > 0) {
          const hasAllergen = food.allergies.some(a => user.allergies.includes(a.toLowerCase()));
          if (hasAllergen) return false;
        }

        // Dietary style check
        if (food.dietaryStyle && user?.dietaryPreferences) {
          const pref = user.dietaryPreferences.toLowerCase();
          if (pref === 'vegetarian' && food.dietaryStyle.includes('non-vegetarian')) return false;
          if (pref === 'eggitarian' && food.dietaryStyle.includes('non-vegetarian') && !food.category?.includes('poultry') && !food.name?.toLowerCase().includes('egg')) return false;
          if (pref === 'vegan' && !food.dietaryStyle.includes('vegan')) return false;
          if (pref === 'gluten-free' && !food.dietaryStyle.includes('gluten-free') && food.allergies?.includes('gluten')) return false;
          if (pref === 'keto' && !food.dietaryStyle.includes('keto')) return false;
          if (pref === 'low-carb' && !food.dietaryStyle.includes('low-carb')) return false;
        }

        return true;
      });

      // Cooking skill filter
      if (filtered.length > 0 && user?.cookingSkill) {
        const difficultyValue = { 'no-cook': 0, 'basic': 1, 'moderate': 2, 'advanced': 3 };
        const userSkillVal = difficultyValue[user.cookingSkill] ?? 1;

        const matchingSkill = filtered.filter(food => {
          const mealSkillVal = difficultyValue[food.difficulty] ?? 1;
          return mealSkillVal <= userSkillVal;
        });

        if (matchingSkill.length > 0) filtered = matchingSkill;
      }

      if (filtered.length === 0) {
        filtered = [{
          id: 999,
          name: (mealType === 'breakfast' || mealType === 'snacks' || mealType === 'pre_workout') 
            ? "Rolled Oats Bowl (1 cup / 60g)" 
            : "Moong Dal & Brown Rice Bowl (1 bowl)",
          cost: 15,
          calories: 220,
          protein: 8,
          carbs: 42,
          fat: 3,
          prepTime: 12,
          difficulty: "basic",
          cuisine: "indian",
          allergies: [],
          ingredients: ["Rolled oats - 1 cup (60g)", "Toned milk - 200ml", "Chia seeds - 1 tsp", "Almonds - 5 pieces"],
          recipe: "1. Combine oats and milk in a pan. 2. Simmer for 4 minutes. 3. Top with nuts and seeds.",
          benefits: "Rich in beta-glucan soluble fiber and sustained complex energy.",
          tips: "Can be prepped overnight in the fridge."
        }];
      }

      candidates[mealType] = filtered;
    });

    // 2. High-precision daily permutation search
    days.forEach((day) => {
      let bestCombination = null;
      let bestScore = Infinity;

      for (let i = 0; i < 10000; i++) {
        const trialMeals = {};
        let trialCost = 0;
        let trialCal = 0;
        let trialProtein = 0;
        let trialCarbs = 0;
        let trialFat = 0;

        meals.forEach(mealType => {
          const list = candidates[mealType];
          const selected = list[Math.floor(Math.random() * list.length)];
          
          let multipliers = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
          if (targetCalories > 2800) {
            multipliers = [1.0, 1.25, 1.5, 1.75, 2.0, 2.5];
          }
          
          const mult = multipliers[Math.floor(Math.random() * multipliers.length)];
          
          trialMeals[mealType] = {
            ...selected,
            multiplier: mult,
            cost: Math.round((selected.cost || 15) * mult),
            calories: Math.round((selected.calories || 200) * mult),
            protein: Math.round((selected.protein || 5) * mult * 10) / 10,
            carbs: Math.round((selected.carbs || 30) * mult * 10) / 10,
            fat: Math.round((selected.fat || 5) * mult * 10) / 10
          };
          
          trialCost += trialMeals[mealType].cost;
          trialCal += trialMeals[mealType].calories;
          trialProtein += trialMeals[mealType].protein;
          trialCarbs += trialMeals[mealType].carbs;
          trialFat += trialMeals[mealType].fat;
        });

        // Compute macro deviation penalties
        const calDiff = Math.abs(trialCal - targetCalories) / targetCalories;
        const proteinDiff = Math.abs(trialProtein - targetProtein) / targetProtein;
        const carbsDiff = Math.abs(trialCarbs - targetCarbs) / targetCarbs;
        const fatDiff = Math.abs(trialFat - targetFat) / targetFat;

        const uniqueMeals = new Set(Object.values(trialMeals).map(m => m.name));
        const varietyPenalty = ((meals.length - uniqueMeals.size) / meals.length) * 1.5;

        const budgetExcess = Math.max(0, trialCost - dailyBudget);
        const budgetPenalty = budgetExcess > 0 ? (budgetExcess / dailyBudget) * 3.0 : 0;

        const score = (calDiff * 20) + (proteinDiff * 18) + (carbsDiff * 12) + (fatDiff * 8) + varietyPenalty + budgetPenalty;

        if (score < bestScore) {
          bestScore = score;
          bestCombination = {
            meals: trialMeals,
            cost: trialCost
          };
        }
      }

      newPlan[day] = bestCombination.meals;
      dailyCosts[day] = bestCombination.cost;
      totalWeeklyCost += bestCombination.cost;
    });

    setWeeklyPlan(newPlan);
    setWeeklyBudget(totalWeeklyCost);
    setBudgetBreakdown(dailyCosts);
    setPlanGenerated(true);

    if (user?.id) {
      localStorage.setItem(`mealplan_${user.id}`, JSON.stringify({
        plan: newPlan,
        budget: totalWeeklyCost,
        breakdown: dailyCosts,
        customBudget: customBudget
      }));
    }
    setLoading(false);
  };

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

    let totalWeeklyCost = 0;
    const dailyCosts = {};
    days.forEach(d => {
      const dMeals = updatedPlan[d] || {};
      const dCost = Object.values(dMeals).reduce((sum, m) => sum + (m.cost || 0), 0);
      dailyCosts[d] = dCost;
      totalWeeklyCost += dCost;
    });

    setWeeklyPlan(updatedPlan);
    setWeeklyBudget(totalWeeklyCost);
    setBudgetBreakdown(dailyCosts);

    if (user?.id) {
      localStorage.setItem(`mealplan_${user.id}`, JSON.stringify({
        plan: updatedPlan,
        budget: totalWeeklyCost,
        breakdown: dailyCosts,
        customBudget: customBudget
      }));
    }
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

  const formatScaledName = (food) => {
    if (!food) return '';
    const mult = food.multiplier || 1;
    if (mult === 1) return food.name;

    const portionRegex = /\(([\d.]+)\s*([a-zA-Z-/]+)\)/;
    const match = food.name.match(portionRegex);

    if (match) {
      const quantity = parseFloat(match[1]);
      const unit = match[2];
      const scaledQuantity = Math.round(quantity * mult * 100) / 100;
      return food.name.replace(portionRegex, `(${scaledQuantity} ${unit})`);
    }

    const weightRegex = /\((\d+)g\)/;
    const weightMatch = food.name.match(weightRegex);
    if (weightMatch) {
      const grams = parseInt(weightMatch[1], 10);
      return food.name.replace(weightRegex, `(${Math.round(grams * mult)}g)`);
    }

    return `${mult}x ${food.name}`;
  };

  const [expandedMeal, setExpandedMeal] = useState(null);
  const [loggedMeals, setLoggedMeals] = useState({});

  const toggleMeal = (mealKey) => {
    setExpandedMeal(prev => prev === mealKey ? null : mealKey);
  };

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
    } catch (_) {}

    try {
      await fetch(`${API_BASE}/api/food-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodLog)
      });
    } catch (_) {}

    setLoggedMeals(prev => ({ ...prev, [mealKey]: 'done' }));
    setTimeout(() => setLoggedMeals(prev => ({ ...prev, [mealKey]: null })), 3000);
  };

  return (
    <div style={{ maxWidth: 1100, margin: 'auto', padding: '0 4px' }}>

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-raised) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-card)',
        padding: '24px 28px',
        marginBottom: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand-primary, #F59E0B)', marginBottom: 4 }}>
            PERSONALIZED NUTRITION
          </div>
          <h2 style={{ margin: '0 0 4px 0', fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 900 }}>
            Weekly Meal Planner
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>
            {isGymUser ? 'Active Training Split · 5-6 Calibrated Meals' : 'Balanced Lifestyle · 4 Healthy Meals'}
            {' · '}
            <span style={{ color: 'var(--brand-primary, #F59E0B)', fontWeight: 700 }}>
              Daily Target: {user?.dailyCalories || 2000} kcal
            </span>
          </p>
        </div>

        {/* Budget Status Pill & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {planGenerated && (
            <div style={{
              background: budgetStatus === 'within' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${budgetStatus === 'within' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: 10,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 800,
              color: budgetStatus === 'within' ? '#10B981' : '#EF4444'
            }}>
              {budgetStatus === 'within'
                ? `₹${weeklyBudget} / ₹${budgetLimits.weekly} wk · ₹${budgetLimits.weekly - weeklyBudget} saved`
                : `₹${weeklyBudget} / ₹${budgetLimits.weekly} wk · ₹${weeklyBudget - budgetLimits.weekly} over`}
            </div>
          )}

          <button
            onClick={() => { setSliderBudget(customBudget || budgetLimits.weekly); setShowBudgetEditor(!showBudgetEditor); }}
            className={showBudgetEditor ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700 }}
          >
            ₹ {showBudgetEditor ? 'Close Budget' : 'Adjust Budget'}
          </button>

          <button
            onClick={generateWeeklyPlan}
            disabled={loading}
            className={loading ? 'btn btn-primary btn-disabled' : 'btn btn-primary'}
            style={{ padding: '10px 20px', fontSize: 13, fontWeight: 800 }}
          >
            <Sparkles size={15} /> {loading ? 'Calibrating…' : planGenerated ? 'Regenerate Plan' : 'Generate Meal Plan'}
          </button>
        </div>
      </div>

      {/* Budget Slider & Direct Number Input Panel */}
      {showBudgetEditor && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: '22px 26px',
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16 }}>Set Weekly Grocery Budget (₹)</h4>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Slide or type your target amount directly</p>
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {Object.entries(profileBudgetMap).map(([range, amount]) => (
                <button
                  key={range}
                  onClick={() => setSliderBudget(amount)}
                  style={{
                    padding: '5px 12px',
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 16,
                    cursor: 'pointer',
                    border: sliderBudget === amount ? '1.5px solid var(--brand-primary, #F59E0B)' : '1px solid var(--border-subtle)',
                    background: sliderBudget === amount ? 'rgba(245,158,11,0.12)' : 'var(--bg-surface-raised)',
                    color: sliderBudget === amount ? 'var(--brand-primary, #F59E0B)' : 'var(--text-muted)',
                    textTransform: 'capitalize'
                  }}
                >
                  {range} (₹{amount})
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <input
              type="range"
              min={500}
              max={10000}
              step={100}
              value={sliderBudget}
              onChange={(e) => setSliderBudget(parseInt(e.target.value, 10))}
              style={{ flex: 1, minWidth: 200, accentColor: 'var(--brand-primary, #F59E0B)', cursor: 'pointer' }}
            />

            {/* Direct Number Input Box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)' }}>₹</span>
              <input
                type="number"
                min="500"
                max="25000"
                step="100"
                value={sliderBudget}
                onChange={(e) => setSliderBudget(parseInt(e.target.value, 10) || 500)}
                className="form-control"
                style={{ width: 100, fontSize: 16, fontWeight: 900, textAlign: 'center', padding: '6px 8px' }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>/week</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => updateBudget(sliderBudget)}
              className="btn btn-primary"
              style={{ padding: '8px 20px', fontSize: 12, fontWeight: 800 }}
            >
              Save ₹{sliderBudget}/wk & Regenerate
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--bg-surface)', borderRadius: 'var(--radius-card)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--brand-primary, #F59E0B)', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <h3 style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 900 }}>
            Calibrating Nutrition & Portion Allocations
          </h3>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 13 }}>
            Optimizing meals to match your daily calorie goal and weekly budget.
          </p>
        </div>
      )}

      {/* Plan Generated View */}
      {planGenerated && !loading && (() => {
        const totals = getSelectedDayTotals();
        const targetCal  = user?.dailyCalories || 2000;
        const targetProt = user?.targetProtein  || Math.round((user?.weight || 70) * (isGymUser ? 2.0 : 1.2));
        const targetCarb = user?.targetCarbs    || Math.round((targetCal * 0.5) / 4);
        const targetFat  = user?.targetFat      || Math.round((targetCal * 0.25) / 9);

        return (
          <div>
            {/* Day Selector Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 20 }}>
              {days.map((day) => {
                const isSelected = selectedDay === day;
                const dayBudget = budgetBreakdown[day] || 0;
                const overBudget = dayBudget > budgetLimits.daily;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      padding: '12px 6px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      border: isSelected ? '2px solid var(--brand-primary, #F59E0B)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(245,158,11,0.12)' : 'var(--bg-surface)',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 900, fontFamily: 'var(--font-heading)', color: isSelected ? 'var(--brand-primary, #F59E0B)' : 'var(--text-primary)', marginBottom: 2 }}>
                      {day.slice(0, 3).toUpperCase()}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: overBudget ? '#EF4444' : '#10B981' }}>
                      ₹{dayBudget}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Daily Totals Bar */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 14,
              padding: '16px 20px',
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 14
            }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {selectedDay.toUpperCase()} NUTRITION TOTALS
                </span>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  {totals.calories} / {targetCal} kcal
                  <span style={{ fontSize: 12, fontWeight: 700, color: Math.abs(totals.calories - targetCal) < 50 ? '#10B981' : '#F59E0B', marginLeft: 8 }}>
                    ({totals.calories >= targetCal ? `+${totals.calories - targetCal}` : totals.calories - targetCal} kcal)
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ background: 'var(--bg-surface-raised)', padding: '8px 14px', borderRadius: 10, textAlign: 'center' }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#818CF8' }}>PROTEIN</span>
                  <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>{totals.protein}g / {targetProt}g</div>
                </div>
                <div style={{ background: 'var(--bg-surface-raised)', padding: '8px 14px', borderRadius: 10, textAlign: 'center' }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#10B981' }}>CARBS</span>
                  <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>{totals.carbs}g / {targetCarb}g</div>
                </div>
                <div style={{ background: 'var(--bg-surface-raised)', padding: '8px 14px', borderRadius: 10, textAlign: 'center' }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#F472B6' }}>FATS</span>
                  <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>{totals.fat}g / {targetFat}g</div>
                </div>
              </div>
            </div>

            {/* De-Cluttered, Highly Readable Meal Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {meals.map(meal => {
                const mealData = weeklyPlan[selectedDay]?.[meal];
                if (!mealData) return null;
                const isOpen = expandedMeal === `${selectedDay}-${meal}`;
                const mealColor = getMealColor(meal);
                const scaledIngs = mealData.ingredients ? scaleIngredients(mealData.ingredients, mealData.multiplier || 1.0) : [];

                return (
                  <div
                    key={meal}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderLeft: `4px solid ${mealColor}`,
                      borderRadius: 'var(--radius-card)',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Card Main Body */}
                    <div style={{ padding: '18px 22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 260 }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: mealColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                            {mealLabels[meal]}
                          </div>
                          <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', marginBottom: 6, lineHeight: 1.3 }}>
                            {formatScaledName(mealData)}
                          </div>
                          <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-muted)', alignItems: 'center' }}>
                            <span><Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{mealData.prepTime || 15} min prep</span>
                            <span>·</span>
                            <span>₹{mealData.cost || 15}</span>
                          </div>
                        </div>

                        {/* Interactive Portion Stepper & Clear Macro Badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          {/* Portion Stepper Buttons */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-surface-raised)', padding: '5px 8px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                            <button
                              onClick={() => handleAdjustPortion(selectedDay, meal, -0.25)}
                              style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Decrease portion"
                            >
                              -
                            </button>
                            <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)', minWidth: 40, textAlign: 'center' }}>
                              {mealData.multiplier || 1}x
                            </span>
                            <button
                              onClick={() => handleAdjustPortion(selectedDay, meal, +0.25)}
                              style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Increase portion"
                            >
                              +
                            </button>
                          </div>

                          {/* Macro Pills */}
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)' }}>
                              {mealData.calories} kcal
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 8, marginTop: 3 }}>
                              <span style={{ color: '#818CF8', fontWeight: 700 }}>P: {mealData.protein}g</span>
                              <span style={{ color: '#10B981', fontWeight: 700 }}>C: {mealData.carbs}g</span>
                              <span style={{ color: '#F472B6', fontWeight: 700 }}>F: {mealData.fat}g</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Row */}
                      <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
                        {/* Log Button */}
                        {(() => {
                          const mealKey = `${selectedDay}-${meal}`;
                          const logState = loggedMeals[mealKey];
                          if (logState === 'done') return (
                            <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10B981', borderRadius: 8, padding: '5px 14px', fontSize: 11, fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Check size={13} strokeWidth={3} /> Logged to Goals
                            </div>
                          );
                          return (
                            <button
                              onClick={() => logMeal(meal, mealData)}
                              disabled={logState === 'loading'}
                              style={{
                                background: 'rgba(16,185,129,0.1)',
                                border: '1px solid rgba(16,185,129,0.4)',
                                borderRadius: 8,
                                padding: '6px 14px',
                                fontSize: 11,
                                fontWeight: 800,
                                color: '#10B981',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <Plus size={13} strokeWidth={3} /> {logState === 'loading' ? 'Logging…' : 'Log This Meal'}
                            </button>
                          );
                        })()}

                        {/* Ingredients Toggle */}
                        <button
                          onClick={() => toggleMeal(`${selectedDay}-${meal}`)}
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: isOpen ? mealColor : 'var(--text-muted)',
                            background: 'transparent',
                            border: `1px solid ${isOpen ? mealColor : 'var(--border-subtle)'}`,
                            borderRadius: 8,
                            padding: '6px 14px',
                            cursor: 'pointer'
                          }}
                        >
                          {isOpen ? '▲ Hide Recipe & Prep' : '▼ View Recipe & Prep'}
                        </button>
                      </div>
                    </div>

                    {/* Collapsible De-Cluttered Recipe & Ingredients */}
                    {isOpen && (
                      <div style={{ borderTop: `1px solid var(--border-subtle)`, background: 'var(--bg-surface-raised)', padding: '18px 22px' }}>
                        {/* Dynamic Scaled Ingredients */}
                        <div style={{ marginBottom: 16 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: mealColor, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>
                            CALCULATED INGREDIENTS ({mealData.multiplier || 1}x PORTION)
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 8 }}>
                            {scaledIngs.map((ing, iIdx) => (
                              <div key={iIdx} style={{ background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--text-secondary)' }}>
                                • {ing}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Step-by-Step Numbered Instructions */}
                        {mealData.recipe && (
                          <div>
                            <span style={{ fontSize: 11, fontWeight: 800, color: mealColor, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>
                              PREPARATION INSTRUCTIONS
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {mealData.recipe
                                .split(/(?:\d+\.\s*|[.!]\s+)/)
                                .map(s => s.trim())
                                .filter(s => s.length > 5)
                                .map((stepText, sIdx) => (
                                  <div key={sIdx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <div style={{
                                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                      background: `${mealColor}20`,
                                      color: mealColor,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: 11, fontWeight: 800
                                    }}>
                                      {sIdx + 1}
                                    </div>
                                    <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                      {stepText.endsWith('.') ? stepText : `${stepText}.`}
                                    </p>
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

    </div>
  );
}
