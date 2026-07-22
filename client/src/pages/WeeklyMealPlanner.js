import React, { useState, useEffect } from 'react';
import fallbackFoods from '../data/indian_diet_db.json';

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

  // Real-time budget adjustment — seeded from user profile on first load
  const [customBudget, setCustomBudget] = useState(null);
  const [sliderBudget, setSliderBudget] = useState(profileDefaultBudget);
  const [showBudgetEditor, setShowBudgetEditor] = useState(false);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Determine if the user is a gym goer or active user
  const prof = (user?.profession || '').toLowerCase();
  const isGymProfessional = prof.includes('trainer') || prof.includes('coach') || prof.includes('athlete') || prof.includes('sports') || prof.includes('player');
  const isGymUser = user?.isGymGoer || (user?.gymDays !== undefined && parseInt(user.gymDays) > 0);

  // Determine dynamic meal list based on both profession constraints and gym activity
  const getMealsList = () => {
    // 1. Shift-based / strict schedule professions where eating multiple times is restricted (Strict 3 meals)
    if (
      prof.includes('nurse') || prof.includes('doctor') || prof.includes('dentist') || prof.includes('surgeon') ||
      prof.includes('cashier') || prof.includes('sales') || prof.includes('retail') || prof.includes('shop') ||
      prof.includes('driver') || prof.includes('delivery') || prof.includes('courier') ||
      prof.includes('police') || prof.includes('security') || prof.includes('patrol') || prof.includes('firefighter') ||
      prof.includes('teacher') || prof.includes('lecturer') || prof.includes('barber') || prof.includes('stylist')
    ) {
      return ['breakfast', 'lunch', 'dinner'];
    }
    // 2. Gym professionals or highly training-focused users with 5+ gym days per week (6 meals)
    if (isGymProfessional || (isGymUser && parseInt(user?.gymDays) >= 5)) {
      return ['breakfast', 'pre_workout', 'post_workout', 'lunch', 'dinner', 'snacks'];
    }
    // 3. Regular active users/gym-goers who have standard schedules (5 meals: Breakfast, Lunch, Dinner, Snack, Post-Workout)
    if (isGymUser) {
      return ['breakfast', 'post_workout', 'lunch', 'dinner', 'snacks'];
    }
    // 4. Default standard schedule (4 meals)
    return ['breakfast', 'lunch', 'dinner', 'snacks'];
  };

  const meals = getMealsList();

  // User-friendly meal labels
  const mealLabels = {
    breakfast: 'Breakfast',
    pre_workout: 'Pre-Workout',
    post_workout: 'Post-Workout',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snacks: 'Snack / Tea'
  };

  // Color mappings for meal categories
  const getMealColor = (meal) => {
    const colors = {
      breakfast: 'var(--accent-lavender)',
      pre_workout: 'var(--accent-lime)',
      post_workout: 'var(--accent-pink)',
      lunch: 'var(--accent-lavender-dark)',
      dinner: 'var(--accent-danger)',
      snacks: 'var(--accent-warning)'
    };
    return colors[meal] || 'var(--text-muted)';
  };

  // Get current day dynamically
  function getCurrentDay() {
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayNames[today.getDay()];
  }

  // Enhanced budget mapping with dynamic scaling
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

  // Fetch the latest foods list from server on load (with client-side JSON fallback)
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await fetch('/api/foods');
        const data = await response.json();
        if (data.success && data.foods && data.foods.length > 0) {
          setAllFoods(data.foods);
        }
      } catch (error) {
        console.warn('WeeklyMealPlanner: API fetch failed, falling back to local database.', error);
      }
    };
    fetchFoods();
  }, []);

  // Real-time local storage persistence
  useEffect(() => {
    if (user?.id) {
      const savedPlan = localStorage.getItem(`mealplan_${user.id}`);
      if (savedPlan) {
        try {
          const planData = JSON.parse(savedPlan);
          // Only load if the meal schedule structure matches (e.g. standard 4 vs gym 6 meals)
          const planDay = Object.keys(planData.plan || {})[0];
          const planMeals = planDay ? Object.keys(planData.plan[planDay] || {}) : [];
          
          if (planMeals.length === meals.length) {
            setWeeklyPlan(planData.plan);
            setWeeklyBudget(planData.budget);
            setBudgetBreakdown(planData.breakdown);
            setCustomBudget(planData.customBudget);
            setPlanGenerated(true);
          }
        } catch (error) {
          console.error('Error loading saved plan:', error);
        }
      }
    }
  }, [user?.id, meals.length]);

  const updateBudget = (newBudget) => {
    setCustomBudget(parseInt(newBudget));
    setShowBudgetEditor(false);
    if (planGenerated) {
      setTimeout(() => {
        generateWeeklyPlan();
      }, 500);
    }
  };

  const budgetLimits = getBudgetLimits();
  const budgetStatus = weeklyBudget <= budgetLimits.weekly ? 'within' : 'over';

  // Dynamic filter and generator logic based on user profile constraints
  const generateWeeklyPlan = () => {
    setLoading(true);
    const newPlan = {};
    let totalWeeklyCost = 0;
    const dailyCosts = {};
    const limits = getBudgetLimits();

    const targetCalories = user?.dailyCalories || 2000;
    const targetProtein = user?.targetProtein || Math.round((user?.weight || 70) * (isGymUser ? 1.8 : 0.9));
    const targetCarbs = user?.targetCarbs || Math.round((targetCalories * 0.5) / 4);
    const targetFat = user?.targetFat || Math.round((targetCalories * 0.25) / 9);
    const dailyBudget = limits.daily;

    // 1. Pre-filter candidate list for each meal type
    const candidates = {};
    meals.forEach(mealType => {
      let filtered = allFoods.filter(food => {
        if (!food.mealTypes || !food.mealTypes.includes(mealType)) return false;

        // Allergen filter
        if (food.allergies && user?.allergies && user.allergies.length > 0) {
          const hasAllergen = food.allergies.some(a => user.allergies.includes(a.toLowerCase()));
          if (hasAllergen) return false;
        }

        // Dietary preferences check
        if (food.dietaryStyle && user?.dietaryPreferences) {
          const pref = user.dietaryPreferences.toLowerCase();
          if (pref === 'vegetarian') {
            if (food.dietaryStyle.includes('non-vegetarian')) return false;
          } else if (pref === 'vegan') {
            if (!food.dietaryStyle.includes('vegan')) return false;
          } else if (pref === 'gluten-free') {
            if (!food.dietaryStyle.includes('gluten-free') && food.allergies && food.allergies.includes('gluten')) return false;
          } else if (pref === 'diabetic') {
            if (!food.dietaryStyle.includes('diabetic')) return false;
          } else if (pref === 'low-carb') {
            if (!food.dietaryStyle.includes('low-carb')) return false;
          } else if (pref === 'keto') {
            if (!food.dietaryStyle.includes('keto')) return false;
          }
        }

        return true;
      });

      // Filter by cooking skill
      if (filtered.length > 0 && user?.cookingSkill) {
        const difficultyValue = { 'no-cook': 0, 'basic': 1, 'moderate': 2, 'advanced': 3 };
        const userSkillVal = difficultyValue[user.cookingSkill] ?? 1;

        const matchingSkill = filtered.filter(food => {
          const mealSkillVal = difficultyValue[food.difficulty] ?? 1;
          return mealSkillVal <= userSkillVal;
        });

        if (matchingSkill.length > 0) {
          filtered = matchingSkill;
        }
      }

      // Safe fallbacks if empty
      if (filtered.length === 0) {
        filtered = allFoods.filter(food => {
          if (!food.mealTypes || !food.mealTypes.includes(mealType)) return false;
          if (user?.dietaryPreferences?.toLowerCase() === 'vegetarian' && food.dietaryStyle && food.dietaryStyle.includes('non-vegetarian')) return false;
          if (user?.dietaryPreferences?.toLowerCase() === 'vegan' && food.dietaryStyle && !food.dietaryStyle.includes('vegan')) return false;
          if (food.allergies && user?.allergies && user.allergies.length > 0) {
            const hasAllergen = food.allergies.some(a => user.allergies.includes(a.toLowerCase()));
            if (hasAllergen) return false;
          }
          return true;
        });
      }

      // Absolute baseline fallback
      if (filtered.length === 0) {
        filtered = [{
          id: 999,
          name: (mealType === 'breakfast' || mealType === 'snacks' || mealType === 'pre_workout') 
            ? "Brown Rice Poha (1 cup)" 
            : "Moong Dal Khichdi (1 bowl)",
          cost: 12,
          calories: 210,
          protein: 6,
          carbs: 45,
          fat: 2,
          prepTime: 12,
          difficulty: "basic",
          cuisine: "indian",
          allergies: [],
          ingredients: ["Rice or Flattened Rice", "Yellow Moong Dal", "Turmeric", "Salt"],
          recipe: "1. Cook item in boiling water with salt and turmeric. 2. Serve warm.",
          benefits: "Light digestion, anti-inflammatory, gluten-free, and allergen-free baseline.",
          tips: "Extremely safe comfort food."
        }];
      }

      candidates[mealType] = filtered;
    });

    // 2. Perform daily optimization search
    days.forEach((day) => {
      let bestCombination = null;
      let bestScore = Infinity;

      // Run 8000 random combination trials to find the best match for the user's goals
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
          
          // Determine allowed multipliers based on meal type to hit calorie/protein/carb goals
          let multipliers = [1.0];
          const isHighCal = targetCalories > 3000;
          if (mealType === 'lunch' || mealType === 'dinner') {
            multipliers = isHighCal 
              ? [0.75, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0] 
              : [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5];
          } else if (mealType === 'breakfast' || mealType === 'pre_workout' || mealType === 'post_workout') {
            multipliers = isHighCal 
              ? [1.0, 1.5, 2.0, 2.5, 3.0, 3.5] 
              : [0.5, 1.0, 1.5, 2.0, 2.5];
          } else { // snacks
            multipliers = isHighCal 
              ? [0.75, 1.0, 1.25, 1.5, 2.0] 
              : [0.5, 0.75, 1.0, 1.25, 1.5];
          }
          
          const mult = multipliers[Math.floor(Math.random() * multipliers.length)];
          
          // Scale ingredients / name dynamically
          trialMeals[mealType] = {
            ...selected,
            multiplier: mult,
            cost: Math.round(selected.cost * mult),
            calories: Math.round(selected.calories * mult),
            protein: Math.round(selected.protein * mult * 10) / 10,
            carbs: Math.round(selected.carbs * mult * 10) / 10,
            fat: Math.round(selected.fat * mult * 10) / 10
          };
          
          trialCost += trialMeals[mealType].cost;
          trialCal += trialMeals[mealType].calories;
          trialProtein += trialMeals[mealType].protein;
          trialCarbs += trialMeals[mealType].carbs;
          trialFat += trialMeals[mealType].fat;
        });

        // Compute macro gaps (deviation from target)
        const calDiff = Math.abs(trialCal - targetCalories) / targetCalories;
        const proteinDiff = Math.abs(trialProtein - targetProtein) / targetProtein;
        const carbsDiff = Math.abs(trialCarbs - targetCarbs) / targetCarbs;
        const fatDiff = Math.abs(trialFat - targetFat) / targetFat;

        // Terminate duplicate foods to improve diet diversity
        const uniqueMeals = new Set(Object.values(trialMeals).map(m => m.name));
        const varietyPenalty = ((meals.length - uniqueMeals.size) / meals.length) * 1.0;

        // Terminate over-budget configurations (smaller penalty so nutritional targets are absolute priority)
        const budgetExcess = Math.max(0, trialCost - dailyBudget);
        const budgetPenalty = budgetExcess > 0 ? (budgetExcess / dailyBudget) * 2.0 : 0;

        // Compute composite deviation score (lower is closer to ideal diet)
        // Protein (15x), Calories (15x), and Carbs (15x) are prioritized equally to hit all daily goals.
        const score = (calDiff * 15) + (proteinDiff * 15) + (carbsDiff * 15) + (fatDiff * 8) + varietyPenalty + budgetPenalty;

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
    if (!food.multiplier || food.multiplier === 1) return food.name;

    const mult = food.multiplier;
    const name = food.name;

    const portionRegex = /\(([\d.]+)\s*([a-zA-Z-/]+)\)/;
    const match = name.match(portionRegex);

    if (match) {
      const quantity = parseFloat(match[1]);
      const unit = match[2];
      const scaledQuantity = Math.round(quantity * mult * 100) / 100;
      
      let displayUnit = unit;
      if (scaledQuantity > 1) {
        if (unit === 'bowl') displayUnit = 'bowls';
        else if (unit === 'piece') displayUnit = 'pieces';
        else if (unit === 'cup') displayUnit = 'cups';
        else if (unit === 'glass') displayUnit = 'glasses';
        else if (unit === 'plate') displayUnit = 'plates';
        else if (unit === 'slice') displayUnit = 'slices';
      }
      return name.replace(portionRegex, `(${scaledQuantity} ${displayUnit})`);
    }

    const weightRegex = /\((\d+)g\)/;
    const weightMatch = name.match(weightRegex);
    if (weightMatch) {
      const grams = parseInt(weightMatch[1]);
      const scaledGrams = Math.round(grams * mult);
      return name.replace(weightRegex, `(${scaledGrams}g)`);
    }

    return `${mult}x ${name}`;
  };

  // eslint-disable-next-line no-unused-vars
  const formatOverviewName = (food) => {
    if (!food) return '';
    const mult = food.multiplier || 1;
    const nameOnly = food.name.split(' (')[0];
    
    const portionRegex = /\(([\d.]+)\s*([a-zA-Z-/]+)\)/;
    const match = food.name.match(portionRegex);
    if (match) {
      const scaledQty = Math.round(parseFloat(match[1]) * mult * 100) / 100;
      let unit = match[2];
      if (scaledQty > 1) {
        if (unit === 'bowl') unit = 'bowls';
        else if (unit === 'piece') unit = 'pieces';
        else if (unit === 'cup') unit = 'cups';
        else if (unit === 'glass') unit = 'glasses';
        else if (unit === 'plate') unit = 'plates';
        else if (unit === 'slice') unit = 'slices';
      }
      return `${scaledQty} ${unit} - ${nameOnly}`;
    }
    
    const weightRegex = /\((\d+)g\)/;
    const weightMatch = food.name.match(weightRegex);
    if (weightMatch) {
      const scaledGrams = Math.round(parseInt(weightMatch[1]) * mult);
      return `${scaledGrams}g - ${nameOnly}`;
    }

    return nameOnly;
  };

  // Track which meal cards have their recipe/prep section expanded
  const [expandedMeal, setExpandedMeal] = useState(null);
  // Track logged meals for today with toast state { mealKey: 'success' | null }
  const [loggedMeals, setLoggedMeals] = useState({});

  const toggleMeal = (mealKey) => {
    setExpandedMeal(prev => prev === mealKey ? null : mealKey);
  };

  // Log a planned meal into the daily food log (same structure as FoodLogger)
  const logMeal = async (meal, mealData) => {
    const mealKey = `${selectedDay}-${meal}`;
    if (loggedMeals[mealKey] === 'loading') return;

    setLoggedMeals(prev => ({ ...prev, [mealKey]: 'loading' }));

    const today = new Date();
    const foodLog = {
      userId: user.id,
      foodId: mealData.id || `plan-${meal}-${today.getTime()}`,
      name: mealData.name,
      quantity: mealData.multiplier || 1,
      mealType: meal,
      calories: Math.round(mealData.calories || 0),
      protein: Math.round(mealData.protein || 0),
      carbs: Math.round(mealData.carbs || 0),
      fat: Math.round(mealData.fat || 0),
      timestamp: today.toISOString(),
      source: 'meal-planner'
    };

    // Also save to localStorage so Dashboard can pick it up even without server
    try {
      const dateKey = `foodlogs_${user.id}_${today.toISOString().split('T')[0]}`;
      const existing = JSON.parse(localStorage.getItem(dateKey) || '[]');
      existing.push({ ...foodLog, id: today.getTime() });
      localStorage.setItem(dateKey, JSON.stringify(existing));
    } catch (_) {}

    try {
      await fetch('/api/food-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodLog)
      });
    } catch (_) { /* falls back to localStorage silently */ }

    setLoggedMeals(prev => ({ ...prev, [mealKey]: 'done' }));
    // Reset badge after 3 seconds
    setTimeout(() => setLoggedMeals(prev => ({ ...prev, [mealKey]: null })), 3000);
  };

  return (
    <div style={{ maxWidth: 1100, margin: 'auto', padding: '0 4px' }}>

      {/* ── PAGE HERO HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-raised) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-card)',
        padding: '28px 32px',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div>
          <h2 style={{ margin: '0 0 6px 0', fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800 }}>
            Weekly Meal Planner
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14 }}>
            {isGymUser ? 'Active Profile — 6 optimised meals/day' : 'Healthy Lifestyle — 4 balanced meals/day'}
            {' · '}
            <span style={{ color: 'var(--accent-lavender-text)', fontWeight: 700 }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </p>
        </div>

        {/* Budget Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {planGenerated && (
            <div style={{
              background: budgetStatus === 'within' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${budgetStatus === 'within' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
              borderRadius: 12,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 700,
              color: budgetStatus === 'within' ? 'var(--accent-lime-text)' : 'var(--accent-danger-text)'
            }}>
              {budgetStatus === 'within'
                ? `Within Budget — ₹${weeklyBudget} / ₹${budgetLimits.weekly} · ₹${budgetLimits.weekly - weeklyBudget} saved`
                : `Over Budget — ₹${weeklyBudget} / ₹${budgetLimits.weekly} · ₹${weeklyBudget - budgetLimits.weekly} over`}
            </div>
          )}

          {/* Budget Editor Toggle */}
          <button
            onClick={() => { setSliderBudget(customBudget || budgetLimits.weekly); setShowBudgetEditor(!showBudgetEditor); }}
            className={showBudgetEditor ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            ₹ {showBudgetEditor ? 'Close Budget Editor' : 'Adjust Budget'}
          </button>

          <button
            onClick={generateWeeklyPlan}
            disabled={loading}
            className={loading ? 'btn btn-primary btn-disabled' : 'btn btn-primary'}
            style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700 }}
          >
            {loading ? 'Generating…' : planGenerated ? 'Regenerate Plan' : 'Generate Meal Plan'}
          </button>
        </div>
      </div>

      {/* ── BUDGET SLIDER PANEL ── */}
      {showBudgetEditor && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--accent-lavender)',
          borderRadius: 'var(--radius-card)',
          padding: '24px 28px',
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16 }}>Adjust Weekly Food Budget</h4>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Quick preset pills from user profile */}
              {Object.entries(profileBudgetMap).map(([range, amount]) => (
                <button
                  key={range}
                  onClick={() => setSliderBudget(amount)}
                  style={{
                    padding: '4px 12px',
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 20,
                    cursor: 'pointer',
                    border: sliderBudget === amount ? '2px solid var(--accent-lavender-text)' : '1px solid var(--border-subtle)',
                    background: sliderBudget === amount ? 'rgba(200,182,255,0.12)' : 'var(--bg-surface-alt)',
                    color: sliderBudget === amount ? 'var(--accent-lavender-text)' : 'var(--text-muted)',
                    textTransform: 'capitalize'
                  }}
                >
                  {range} (₹{amount})
                </button>
              ))}
            </div>
          </div>

          {/* Slider + Number Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <input
                type="range"
                min={500}
                max={8000}
                step={100}
                value={sliderBudget}
                onChange={(e) => setSliderBudget(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--accent-lavender)',
                  height: 4,
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                <span>₹500</span><span>₹2,000</span><span>₹4,000</span><span>₹6,000</span><span>₹8,000</span>
              </div>
            </div>

            {/* Manual number input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-lavender-text)' }}>₹</span>
              <input
                type="number"
                min={500}
                max={8000}
                step={100}
                value={sliderBudget}
                onChange={(e) => setSliderBudget(Math.max(500, Math.min(8000, parseInt(e.target.value) || 500)))}
                className="form-control"
                style={{ width: 110, fontSize: 20, fontWeight: 800, textAlign: 'center', padding: '6px 10px', fontFamily: 'var(--font-heading)' }}
              />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/week<br/>
                <span style={{ fontSize: 11 }}>≈ ₹{Math.round(sliderBudget / 7)}/day</span>
              </span>
            </div>
          </div>

          {/* From profile note */}
          <p style={{ margin: '0 0 16px 0', fontSize: 12, color: 'var(--text-muted)' }}>
            Your profile budget (<strong style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{user?.budgetRange}</strong>) suggests <strong style={{ color: 'var(--accent-lavender-text)' }}>₹{profileDefaultBudget}/week</strong>.
            Drag the slider or type to override.
          </p>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => { updateBudget(sliderBudget); }}
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: 13, fontWeight: 700 }}
            >
              Apply ₹{sliderBudget}/week & Regenerate
            </button>
            <button
              onClick={() => { setSliderBudget(profileDefaultBudget); updateBudget(profileDefaultBudget); }}
              className="btn btn-secondary"
              style={{ padding: '10px 16px', fontSize: 13 }}
            >
              Reset to Profile Default
            </button>
          </div>
        </div>
      )}

      {/* ── LOADING STATE ── */}
      {loading && (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--bg-surface)', borderRadius: 'var(--radius-card)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent-lavender-text)', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <h3 style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-heading)' }}>Crafting your perfect meal plan</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>Optimising macros and budget for all 7 days</p>
        </div>
      )}

      {/* ── PLAN VIEW ── */}
      {planGenerated && !loading && (() => {
        const totals = getSelectedDayTotals();
        const targetCal  = user.dailyCalories || 2000;
        const targetProt = user.targetProtein  || Math.round((user.weight || 70) * (isGymUser ? 1.8 : 0.9));
        const targetCarb = user.targetCarbs    || Math.round((targetCal * 0.5) / 4);
        const targetFat  = user.targetFat      || Math.round((targetCal * 0.25) / 9);
        const pct = (v, t) => Math.min(Math.round((v / t) * 100), 100);

        return (
          <>
            {/* ── WEEK STRIP ── */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-card)',
              padding: '16px 20px',
              marginBottom: 20,
              display: 'flex',
              gap: 8,
              overflowX: 'auto'
            }}>
              {days.map(day => {
                const isToday    = day === getCurrentDay();
                const isSelected = day === selectedDay;
                const dayBudget  = budgetBreakdown[day] || 0;
                const overBudget = dayBudget > budgetLimits.daily;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      flex: '1 0 80px',
                      minWidth: 72,
                      padding: '10px 8px',
                      borderRadius: 12,
                      border: isSelected
                        ? '2px solid var(--accent-lavender-text)'
                        : isToday
                          ? '2px solid var(--accent-lime-dark)'
                          : '1px solid var(--border-subtle)',
                      background: isSelected
                        ? 'rgba(138, 126, 245, 0.08)'
                        : isToday
                          ? 'rgba(16, 185, 129, 0.05)'
                          : 'var(--bg-surface-alt)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: isSelected ? 'translateY(-2px)' : 'none',
                      boxShadow: isSelected ? '0 6px 20px rgba(0,0,0,0.12)' : 'none',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: isToday ? 'var(--accent-lime-text)' : 'var(--text-muted)', marginBottom: 3 }}>
                      {isToday ? 'TODAY' : day.substring(0, 3)}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-heading)', color: isSelected ? 'var(--accent-lavender-text)' : 'var(--text-primary)', marginBottom: 5 }}>
                      {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: overBudget ? 'var(--accent-danger-text)' : 'var(--accent-lime-text)' }}>
                      ₹{dayBudget}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ── DAY DETAIL AREA ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

              {/* LEFT — Meal Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {meals.map(meal => {
                  const mealData = weeklyPlan[selectedDay]?.[meal];
                  if (!mealData) return null;
                  const isOpen = expandedMeal === `${selectedDay}-${meal}`;
                  const mealColor = getMealColor(meal);

                  return (
                    <div
                      key={meal}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderLeft: `4px solid ${mealColor}`,
                        borderRadius: 'var(--radius-card)',
                        overflow: 'hidden',
                        transition: 'box-shadow 0.2s ease'
                      }}
                    >
                      {/* Card Header — always visible */}
                      <div style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: mealColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                              {mealLabels[meal]}
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', marginBottom: 6, lineHeight: 1.3 }}>
                              {formatScaledName(mealData)}
                            </div>
                            <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span>{mealData.prepTime} min prep</span>
                              <span>{mealData.difficulty === 'no-cook' ? 'No-Cook' : mealData.difficulty === 'basic' ? 'Beginner' : mealData.difficulty === 'moderate' ? 'Intermediate' : 'Advanced'}</span>
                              {mealData.multiplier && mealData.multiplier !== 1 && (
                                <span style={{ color: 'var(--accent-lavender-text)', fontWeight: 700 }}>{mealData.multiplier}x portion</span>
                              )}
                            </div>
                          </div>

                          {/* Macro Chips */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end', minWidth: 110 }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <span style={{ fontSize: 11, background: 'rgba(212,249,65,0.10)', color: 'var(--accent-lime-text)', padding: '3px 9px', borderRadius: 20, fontWeight: 700 }}>
                                {mealData.calories} kcal
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 5 }}>
                              <span style={{ fontSize: 10, background: 'rgba(200,182,255,0.10)', color: 'var(--accent-lavender-text)', padding: '2px 7px', borderRadius: 20, fontWeight: 600 }}>
                                P: {mealData.protein}g
                              </span>
                              <span style={{ fontSize: 10, background: 'rgba(255,198,255,0.10)', color: 'var(--accent-pink-text)', padding: '2px 7px', borderRadius: 20, fontWeight: 600 }}>
                                C: {mealData.carbs}g
                              </span>
                              <span style={{ fontSize: 10, background: 'rgba(251,191,36,0.10)', color: 'var(--accent-warning-text)', padding: '2px 7px', borderRadius: 20, fontWeight: 600 }}>
                                F: {mealData.fat}g
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Row: Log + Prep Toggle */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                          {/* LOG THIS MEAL Button */}
                          {(() => {
                            const mealKey = `${selectedDay}-${meal}`;
                            const logState = loggedMeals[mealKey];
                            if (logState === 'done') return (
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: 'rgba(16,185,129,0.12)',
                                border: '1.5px solid var(--accent-lime-text)',
                                borderRadius: 8, padding: '5px 14px',
                                fontSize: 12, fontWeight: 700, color: 'var(--accent-lime-text)'
                              }}>
                                Logged to Daily Goals
                              </div>
                            );
                            return (
                              <button
                                onClick={() => logMeal(meal, mealData)}
                                disabled={logState === 'loading'}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 6,
                                  background: logState === 'loading' ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.10)',
                                  border: '1.5px solid rgba(16,185,129,0.4)',
                                  borderRadius: 8, padding: '5px 14px',
                                  fontSize: 12, fontWeight: 700,
                                  color: 'var(--accent-lime-text)',
                                  cursor: logState === 'loading' ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {logState === 'loading' ? 'Logging…' : 'Log This Meal'}
                              </button>
                            );
                          })()}

                          {/* PREP TOGGLE Button */}
                          <button
                            onClick={() => toggleMeal(`${selectedDay}-${meal}`)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              fontSize: 12, fontWeight: 700,
                              color: isOpen ? mealColor : 'var(--text-muted)',
                              background: 'transparent',
                              border: `1px solid ${isOpen ? mealColor : 'var(--border-subtle)'}`,
                              borderRadius: 8, padding: '5px 12px',
                              cursor: 'pointer', transition: 'all 0.2s ease'
                            }}
                          >
                            {isOpen ? '▲ Hide' : '▼ View'} Ingredients & Prep
                          </button>
                        </div>
                      </div>

                      {/* Collapsible Recipe Section */}
                      {isOpen && (
                        <div style={{ borderTop: `2px solid ${mealColor}22`, background: 'var(--bg-surface-alt)', animation: 'fadeIn 0.22s ease' }}>

                          {/* ── INGREDIENTS ── */}
                          <div style={{ padding: '18px 20px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: mealColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Ingredients</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                              {mealData.ingredients?.map((ing, i) => (
                                <div key={i} style={{
                                  display: 'flex', alignItems: 'center', gap: 6,
                                  background: 'var(--bg-surface)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: 8,
                                  padding: '6px 12px'
                                }}>
                                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: mealColor, flexShrink: 0, display: 'inline-block' }} />
                                  <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 500 }}>
                                    {ing}{mealData.multiplier && mealData.multiplier !== 1 ? <span style={{ color: 'var(--accent-lavender)', fontWeight: 700 }}> ×{mealData.multiplier}</span> : ''}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* ── PREPARATION STEPS ── */}
                          <div style={{ padding: '16px 20px', borderBottom: (mealData.benefits || mealData.tips) ? '1px solid var(--border-subtle)' : 'none' }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: mealColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Preparation</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                              {mealData.recipe
                                ? mealData.recipe.split(/[.!]/).map(s => s.trim()).filter(s => s.length > 8).map((step, i) => (
                                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <div style={{
                                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                                      background: `${mealColor}18`,
                                      border: `1.5px solid ${mealColor}55`,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: 11, fontWeight: 800, color: mealColor
                                    }}>{i + 1}</div>
                                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, paddingTop: 3 }}>{step}.</p>
                                  </div>
                                ))
                                : <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>No preparation steps listed.</p>
                              }
                            </div>
                          </div>

                          {/* ── BENEFITS + TIPS ── */}
                          {(mealData.benefits || mealData.tips) && (
                            <div style={{ display: 'grid', gridTemplateColumns: mealData.benefits && mealData.tips ? '1fr 1fr' : '1fr', gap: 0 }}>
                              {mealData.benefits && (
                                <div style={{ padding: '14px 20px', background: 'rgba(16,185,129,0.05)', borderRight: mealData.tips ? '1px solid var(--border-subtle)' : 'none' }}>
                                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent-lime)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Health Benefits</div>
                                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{mealData.benefits}</div>
                                </div>
                              )}
                              {mealData.tips && (
                                <div style={{ padding: '14px 20px', background: 'rgba(99,102,241,0.05)' }}>
                                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent-lavender)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Nutrition Tip</div>
                                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{mealData.tips}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* RIGHT — Sticky Nutrition + Budget Sidebar */}
              <div style={{ position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Day Nutrition Summary */}
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-card)',
                  padding: '20px 18px'
                }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: 14, fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-lavender-text)' }}>
                    {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}'s Nutrition
                  </h4>

                  {[
                    { label: 'Calories', val: totals.calories, target: targetCal, unit: 'kcal', color: 'var(--accent-lavender)' },
                    { label: 'Protein',  val: totals.protein,  target: targetProt, unit: 'g',   color: 'var(--accent-pink)' },
                    { label: 'Carbs',    val: totals.carbs,    target: targetCarb, unit: 'g',   color: 'var(--accent-warning)' },
                    { label: 'Fat',      val: totals.fat,      target: targetFat,  unit: 'g',   color: 'var(--accent-lime)' }
                  ].map(({ label, val, target, unit, color }) => {
                    const p = pct(val, target);
                    return (
                      <div key={label} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
                          <span style={{ fontWeight: 800, color: p >= 95 ? 'var(--accent-lime-text)' : 'var(--text-primary)' }}>
                            {val}{unit} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ {target}{unit}</span>
                          </span>
                        </div>
                        <div style={{ height: 7, background: 'var(--bg-surface-raised)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${p}%`,
                            background: color,
                            borderRadius: 4,
                            transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)'
                          }} />
                        </div>
                        <div style={{ fontSize: 10, color: p >= 95 ? 'var(--accent-lime-text)' : 'var(--text-muted)', marginTop: 2, textAlign: 'right', fontWeight: 600 }}>
                          {p}%
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Budget Breakdown */}
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-card)',
                  padding: '18px 18px'
                }}>
                  <h4 style={{ margin: '0 0 14px 0', fontSize: 14, fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-lime-text)' }}>
                    Budget
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Today's spend</span>
                    <span style={{ fontWeight: 800, color: (budgetBreakdown[selectedDay] || 0) > budgetLimits.daily ? 'var(--accent-danger-text)' : 'var(--accent-lime-text)' }}>
                      ₹{budgetBreakdown[selectedDay] || 0}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Daily limit</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{budgetLimits.daily}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-surface-raised)', borderRadius: 3, marginBottom: 14 }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(((budgetBreakdown[selectedDay] || 0) / budgetLimits.daily) * 100, 100)}%`,
                      background: (budgetBreakdown[selectedDay] || 0) > budgetLimits.daily ? 'var(--accent-danger)' : 'var(--accent-lime)',
                      borderRadius: 3,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Weekly total</span>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₹{weeklyBudget} / ₹{budgetLimits.weekly}</span>
                  </div>
                </div>

                {/* Quick Regen */}
                <button
                  onClick={generateWeeklyPlan}
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: 12, fontSize: 13, fontWeight: 700 }}
                >
                  Regenerate Full Week
                </button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── EMPTY STATE ── */}
      {!planGenerated && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '70px 20px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-panel)', background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 22, height: 22, borderRadius: '50%', border: '3px solid var(--border-strong)', borderTopColor: 'var(--accent-lavender-text)' }} /></div>
          <h3 style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-heading)', fontSize: 22 }}>Your weekly plan awaits</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 28px 0', maxWidth: 380, marginLeft: 'auto', marginRight: 'auto', fontSize: 14 }}>
            We'll build a complete 7-day meal schedule tailored to your macros, budget of <strong>₹{budgetLimits.weekly}/week</strong>, and food preferences.
          </p>
          <button
            onClick={generateWeeklyPlan}
            className="btn btn-primary"
            style={{ padding: '14px 32px', fontSize: 15, fontWeight: 700 }}
          >
            Generate My Meal Plan
          </button>
        </div>
      )}
    </div>
  );
}

