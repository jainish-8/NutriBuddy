import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import fallbackFoods from '../data/indian_diet_db.json';
import { API_BASE } from '../config';
import { 
  Search, Plus, Check, Utensils, X, ShoppingCart
} from 'lucide-react';
import { scaleIngredients, formatCompactMacros } from '../utils/nutritionEngine';

export default function FoodLogger({ user, setCurrentPage }) {
  const [foods, setFoods] = useState(fallbackFoods);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState('breakfast');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  // Lock body scroll when mobile sheet is open
  useEffect(() => {
    if (showMobileModal) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [showMobileModal]);

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`nutribuddy_favorites_${user?.id || 'guest'}`) || '[]');
    } catch {
      return [];
    }
  });

  const toggleFavorite = (food) => {
    if (!food) return;
    const isFav = favorites.some(f => f.id === food.id || f.name === food.name);
    let updated;
    if (isFav) {
      updated = favorites.filter(f => f.id !== food.id && f.name !== food.name);
      showNotification('info', `Removed ${food.name} from favourites`);
    } else {
      updated = [...favorites, food];
      showNotification('success', `Saved ${food.name} to favourites!`);
    }
    setFavorites(updated);
    try {
      localStorage.setItem(`nutribuddy_favorites_${user?.id || 'guest'}`, JSON.stringify(updated));
    } catch (e) {}
  };

  // Dynamic filter with letter-by-letter matching & recent support
  useEffect(() => {
    let list = fallbackFoods;
    if (activeCategory === 'recent') {
      try {
        const today = new Date().toISOString().split('T')[0];
        const key = `nutribuddy_foodlogs_${user?.id || 'guest'}_${today}`;
        const recentLogs = JSON.parse(localStorage.getItem(key) || '[]');
        const loggedNames = new Set(recentLogs.map(l => (l.name || '').toLowerCase()));
        const favKey = `nutribuddy_favorites_${user?.id || 'guest'}`;
        const favs = JSON.parse(localStorage.getItem(favKey) || '[]');
        const favNames = new Set(favs.map(f => (f.name || '').toLowerCase()));
        const recentMatches = fallbackFoods.filter(f => 
          loggedNames.has(f.name.toLowerCase()) || favNames.has(f.name.toLowerCase()) || f.protein >= 18
        );
        list = recentMatches.length > 0 ? recentMatches : fallbackFoods.filter(f => f.protein >= 15);
      } catch (e) {
        list = fallbackFoods.filter(f => f.protein >= 15);
      }
    } else if (activeCategory === 'protein') {
      list = list.filter(f => f.category === 'protein' || f.protein >= 15);
    } else if (activeCategory === 'thalis') {
      list = list.filter(f => 
        f.name.toLowerCase().includes('thali') || 
        (f.tags && f.tags.some(t => t.toLowerCase().includes('thali')))
      );
    } else if (activeCategory !== 'all') {
      list = list.filter(f => f.category === activeCategory);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(f => 
        f.name.toLowerCase().includes(q) ||
        (f.category && f.category.toLowerCase().includes(q)) ||
        (f.dietaryStyle && f.dietaryStyle.some(d => d.toLowerCase().includes(q)))
      );
    }
    setFoods(list);
  }, [searchTerm, activeCategory, user?.id, favorites]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAdjustQuantity = (delta) => {
    setQuantity(prev => {
      const next = Math.max(0.25, parseFloat((prev + delta).toFixed(2)));
      return next;
    });
  };

  const handleDirectQuantityChange = (val) => {
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setQuantity(parsed);
    } else if (val === '') {
      setQuantity('');
    }
  };

  const logFood = async () => {
    if (!selectedFood) return;
    const qty = parseFloat(quantity) || 1;
    setLoading(true);
    const cal = Math.round(selectedFood.calories * qty);
    const p = parseFloat((selectedFood.protein * qty).toFixed(1));
    const c = parseFloat((selectedFood.carbs * qty).toFixed(1));
    const f = parseFloat((selectedFood.fat * qty).toFixed(1));
    const today = new Date().toISOString().split('T')[0];

    const foodLog = {
      id: Date.now().toString(),
      userId: user?.id || 'guest',
      foodId: selectedFood.id,
      name: `${qty !== 1 ? `${qty}x ` : ''}${selectedFood.name}`,
      quantity: qty,
      mealType,
      calories: cal,
      protein: p,
      carbs: c,
      fat: f,
      timestamp: new Date().toISOString()
    };

    // Immediate local persistence
    const key = `nutribuddy_foodlogs_${user?.id || 'guest'}_${today}`;
    const currentLogs = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([...currentLogs, foodLog]));

    try {
      const response = await fetch(`${API_BASE}/api/food-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodLog),
      });
      const data = await response.json();
      if (data.success) {
        showNotification('success', `Logged ${selectedFood.name} (${cal} kcal) to ${mealType.toUpperCase()}!`);
      }
    } catch {
      showNotification('success', `Logged ${selectedFood.name} (${cal} kcal) to daily goals!`);
    }
    setSelectedFood(null);
    setQuantity(1);
    setShowMobileModal(false);
    setLoading(false);
  };

  const categories = [
    { id: 'all', label: 'All foods' },
    { id: 'recent', label: 'Recent & saved' },
    { id: 'protein', label: 'High protein' },
    { id: 'thalis', label: 'Thalis' }
  ];

  const mealOptions = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'pre_workout', label: 'Pre-workout' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'post_workout', label: 'Post-workout' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snacks', label: 'Snack' }
  ];

  const handleAddAllToGrocery = () => {
    if (!selectedFood?.ingredients || selectedFood.ingredients.length === 0) return;
    try {
      const unchecked = scaledIngredients.filter(ing => !checkedIngredients[ing]);
      const itemsToAdd = unchecked.length > 0 ? unchecked : scaledIngredients;
      const storageKey = `mealplan_${user?.id || 'active_user'}`;
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      const core = saved.corePantry || [];
      itemsToAdd.forEach(item => {
        if (!core.some(c => (c.name || c) === item)) {
          core.push({ name: item, count: 1 });
        }
      });
      saved.corePantry = core;
      localStorage.setItem(storageKey, JSON.stringify(saved));
      showNotification('success', 'Added to grocery list');
    } catch {
      showNotification('success', 'Added to grocery list');
    }
  };

  const currentQty = parseFloat(quantity) || 1;
  const scaledIngredients = selectedFood?.ingredients 
    ? scaleIngredients(selectedFood.ingredients, currentQty)
    : [];

  const renderScalerBody = (isModal = false) => (
    <>
      {/* 5.3 Meal Destination Selector (2 rows × 3 columns: all 6 slots accessible) */}
      <div style={{ marginBottom: isModal ? 18 : 12 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>
          Target meal slot
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {mealOptions.map(m => {
            const isActive = mealType === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setMealType(m.value)}
                style={{
                  padding: isModal ? '9px 6px' : '7px 4px',
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 8,
                  cursor: 'pointer',
                  border: isActive ? '1px solid var(--g)' : '0.5px solid var(--bd)',
                  background: isActive ? 'var(--gd)' : 'var(--s2)',
                  color: isActive ? 'var(--g)' : 'var(--t2)',
                  transition: 'all 0.15s ease'
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Portion Stepper & Presets */}
      <div style={{ background: 'var(--s2)', padding: isModal ? '16px' : '12px 14px', borderRadius: 14, border: '0.5px solid var(--bd)', marginBottom: isModal ? 18 : 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--t3)', letterSpacing: '0.04em' }}>
            Portion multiplier
          </span>
          <span className="tabular-nums" style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--t2)' }}>
            Est. ₹{Math.round((selectedFood.cost || 15) * currentQty)}
          </span>
        </div>

        {/* Central Tactile Stepper Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
          <button
            type="button"
            onClick={() => handleAdjustQuantity(-0.25)}
            disabled={currentQty <= 0.25}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'var(--s3)',
              border: '0.5px solid var(--bd)',
              color: currentQty <= 0.25 ? 'var(--t4)' : 'var(--t1)',
              fontSize: 16,
              fontWeight: 700,
              cursor: currentQty <= 0.25 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            −
          </button>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 88,
            padding: '3px 10px',
            borderRadius: 10,
            background: 'var(--s3)',
            border: '0.5px solid var(--bd)'
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="2.5"
                value={quantity}
                onChange={(e) => handleDirectQuantityChange(e.target.value)}
                className="tabular-nums"
                style={{
                  width: 44,
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: 800,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--t1)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  padding: 0
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)' }}>×</span>
            </div>
            <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--t3)', letterSpacing: '0.02em' }}>
              {currentQty === 1 ? '1 serving' : `${currentQty} servings`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleAdjustQuantity(+0.25)}
            disabled={currentQty >= 2.5}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'var(--s3)',
              border: '0.5px solid var(--bd)',
              color: currentQty >= 2.5 ? 'var(--t4)' : 'var(--t1)',
              fontSize: 16,
              fontWeight: 700,
              cursor: currentQty >= 2.5 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            +
          </button>
        </div>

        {/* Quick Presets Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
          {[
            { val: 0.5, label: '0.5×' },
            { val: 1.0, label: '1.0×' },
            { val: 1.5, label: '1.5×' },
            { val: 2.0, label: '2.0×' }
          ].map(p => (
            <button
              key={p.val}
              type="button"
              onClick={() => setQuantity(p.val)}
              style={{
                padding: '5px 3px',
                borderRadius: 7,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                border: currentQty === p.val ? '1px solid var(--g)' : '0.5px solid var(--bd)',
                background: currentQty === p.val ? 'var(--gd)' : 'var(--s3)',
                color: currentQty === p.val ? 'var(--g)' : 'var(--t2)',
                transition: 'all 0.15s ease'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5.1 & 5.2 Dynamic Scaled Macro Matrix: Calories white (--t1), Carbs green (--g) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: isModal ? 18 : 12 }}>
        <div style={{ background: 'var(--s2)', padding: isModal ? '12px 6px' : '8px 4px', borderRadius: 10, textAlign: 'center', border: '0.5px solid var(--bd)' }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)' }}>Calories</span>
          <div className="tabular-nums" style={{ fontSize: isModal ? 16 : 14, fontWeight: 800, color: 'var(--t1)', marginTop: 2 }}>
            {Math.round(selectedFood.calories * currentQty)}
          </div>
          <span style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 500 }}>kcal</span>
        </div>
        <div style={{ background: 'var(--s2)', padding: isModal ? '12px 6px' : '8px 4px', borderRadius: 10, textAlign: 'center', border: '0.5px solid var(--bd)' }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--blu)' }}>Protein</span>
          <div className="tabular-nums" style={{ fontSize: isModal ? 16 : 14, fontWeight: 800, color: 'var(--blu)', marginTop: 2 }}>
            {Math.round(selectedFood.protein * currentQty)}g
          </div>
        </div>
        <div style={{ background: 'var(--s2)', padding: isModal ? '12px 6px' : '8px 4px', borderRadius: 10, textAlign: 'center', border: '0.5px solid var(--bd)' }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--g)' }}>Carbs</span>
          <div className="tabular-nums" style={{ fontSize: isModal ? 16 : 14, fontWeight: 800, color: 'var(--g)', marginTop: 2 }}>
            {Math.round(selectedFood.carbs * currentQty)}g
          </div>
        </div>
        <div style={{ background: 'var(--s2)', padding: isModal ? '12px 6px' : '8px 4px', borderRadius: 10, textAlign: 'center', border: '0.5px solid var(--bd)' }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--amb)' }}>Fats</span>
          <div className="tabular-nums" style={{ fontSize: isModal ? 16 : 14, fontWeight: 800, color: 'var(--amb)', marginTop: 2 }}>
            {Math.round(selectedFood.fat * currentQty)}g
          </div>
        </div>
      </div>

      {/* 5.4 Scaled Recipe Ingredients Preview */}
      {scaledIngredients.length > 0 && (
        <div style={{ background: 'var(--s2)', padding: isModal ? 14 : '10px 12px', borderRadius: 12, border: '0.5px solid var(--bd)', marginBottom: isModal ? 18 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--t3)', letterSpacing: '0.04em' }}>
              {currentQty === 1 ? `Ingredients (${scaledIngredients.length})` : `Ingredients (${currentQty}× portion)`}
            </span>
            <button
              type="button"
              onClick={handleAddAllToGrocery}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--g)',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: 0
              }}
              title="Add all to grocery list"
            >
              <ShoppingCart size={12} />
              <span>Add to list</span>
            </button>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            maxHeight: isModal ? 'none' : '130px',
            overflowY: isModal ? 'visible' : 'auto',
            paddingRight: isModal ? 0 : 2
          }}>
            {scaledIngredients.map((ing, iIdx) => {
              const isChecked = !!checkedIngredients[ing];
              return (
                <div
                  key={iIdx}
                  onClick={() => setCheckedIngredients(prev => ({ ...prev, [ing]: !prev[ing] }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: isModal ? '8px 10px' : '5px 8px',
                    borderRadius: 8,
                    background: isChecked ? 'rgba(34, 209, 122, 0.04)' : 'var(--s3)',
                    border: isChecked ? '0.5px solid var(--g)' : '0.5px solid var(--bd)',
                    cursor: 'pointer'
                  }}
                >
                  <div
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: 4,
                      background: isChecked ? 'var(--g)' : 'transparent',
                      border: isChecked ? 'none' : '1.5px solid var(--bd)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: 10,
                      fontWeight: 800,
                      flexShrink: 0
                    }}
                  >
                    {isChecked && '✓'}
                  </div>
                  <span
                    style={{
                      fontSize: 11.5,
                      color: isChecked ? 'var(--t3)' : 'var(--t2)',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {ing}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 4px', position: 'relative' }}>

      {/* Floating Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 99999,
          background: notification.type === 'error' ? 'var(--accent-danger)' : 'var(--brand-primary)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-panel)',
          fontWeight: 800,
          fontSize: 13,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'fadeInUp 0.3s ease'
        }}>
          <Check size={16} strokeWidth={3} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Page Header (4.1: No Back button) */}
      <div className="food-logger-header-card" style={{ marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--g)', marginBottom: 2 }}>
            Daily nutrition log
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
            Food logger
          </h1>
          <p style={{ fontSize: 12, color: 'var(--t3)', margin: '4px 0 0' }}>
            Search foods, calibrate portions, and log macros instantly
          </p>
        </div>
      </div>

      {/* Main 2-Column Split Grid */}
      <div className="food-logger-layout">

        {/* LEFT COLUMN: Food Search & List */}
        <div className="food-logger-card">
          {/* Search Bar with live letter matching */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search foods: e.g. Paneer, Oats, Eggs, Dal, Rice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                paddingLeft: 38,
                fontSize: 13,
                height: 42,
                borderRadius: 12,
                background: 'var(--s3)',
                border: '0.5px solid var(--bd)',
                color: 'var(--t1)'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
              >
                Clear
              </button>
            )}
          </div>

          {/* 4.2 Category Filter Chips: exactly 4 without truncation, horizontal scroll padding */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              padding: '0 4px 12px',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {categories.map(c => {
              const isActive = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 99,
                    fontSize: 11.5,
                    fontWeight: isActive ? 700 : 600,
                    cursor: 'pointer',
                    border: isActive ? 'none' : '0.5px solid var(--bd)',
                    background: isActive ? 'var(--g)' : 'var(--s2)',
                    color: isActive ? '#041a0c' : 'var(--t2)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Foods Results List */}
          <div className="food-logger-list">
            {foods.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--t3)', fontSize: 13 }}>
                No food items match "{searchTerm}". Try another search term.
              </div>
            ) : (
              foods.map(f => {
                const isSelected = selectedFood?.id === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      setSelectedFood(f);
                      setQuantity(1);
                      setCheckedIngredients({});
                      if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                        setShowMobileModal(true);
                      }
                    }}
                    className="food-list-item"
                    style={{
                      padding: '11px 13px',
                      borderRadius: 14,
                      marginBottom: 8,
                      border: isSelected ? '1px solid var(--g)' : '0.5px solid var(--bd)',
                      background: isSelected ? 'rgba(34, 209, 122, 0.05)' : 'var(--s2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    {/* Left: Food name + macros */}
                    <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
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
                        {f.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3 }}>
                        {formatCompactMacros(f.protein, f.carbs, f.fat)}
                      </div>
                      {/* 4.4: Cost display below macro row in --t3, 10px */}
                      <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>
                        ₹{f.cost || 15}
                      </div>
                    </div>

                    {/* Right: kcal in --t1 white + 4.3: "Add +" button */}
                    <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', whiteSpace: 'nowrap' }}>
                        {f.calories} <span style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--t3)' }}>kcal</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFood(f);
                          setQuantity(1);
                          setCheckedIngredients({});
                          if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                            setShowMobileModal(true);
                          }
                        }}
                        style={{
                          height: 28,
                          borderRadius: 8,
                          background: 'var(--s3)',
                          border: '0.5px solid var(--bd)',
                          color: 'var(--g)',
                          fontSize: 11.5,
                          fontWeight: 700,
                          padding: '0 10px',
                          cursor: 'pointer'
                        }}
                      >
                        Add +
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Desktop Portion Scaler & Dynamic Macro Breakdown */}
        <div className="food-logger-scaler-desktop" style={{
          background: 'var(--s1)',
          border: '0.5px solid var(--bd)',
          borderRadius: 24,
          padding: '24px 26px',
          position: 'sticky',
          top: 20,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)'
        }}>
          {selectedFood ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0 }}>
              {/* Pinned Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14, flexShrink: 0 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--g)', marginBottom: 2 }}>
                    Selected food
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedFood.name}
                  </h2>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                    Standard serving: {selectedFood.servingUnit || selectedFood.servingSize || selectedFood.serving || '1 portion'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFavorite(selectedFood)}
                  style={{
                    background: favorites.some(f => f.id === selectedFood.id || f.name === selectedFood.name) ? 'rgba(239, 68, 68, 0.12)' : 'var(--s2)',
                    border: `0.5px solid ${favorites.some(f => f.id === selectedFood.id || f.name === selectedFood.name) ? 'rgba(239, 68, 68, 0.4)' : 'var(--bd)'}`,
                    color: favorites.some(f => f.id === selectedFood.id || f.name === selectedFood.name) ? '#EF4444' : 'var(--t2)',
                    borderRadius: 20,
                    padding: '5px 12px',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                  className="active:scale-95"
                  title="Toggle favourite"
                >
                  {favorites.some(f => f.id === selectedFood.id || f.name === selectedFood.name) ? '♥ Saved' : '♡ Save'}
                </button>
              </div>

              {/* Scrollable Middle Body */}
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, minHeight: 0 }}>
                {renderScalerBody(false)}
              </div>

              {/* Sticky Bottom Log CTA Bar */}
              <div style={{ paddingTop: 12, borderTop: '0.5px solid var(--bd)', marginTop: 8, flexShrink: 0 }}>
                <button
                  onClick={logFood}
                  disabled={loading}
                  className={loading ? "btn btn-primary btn-disabled" : "btn btn-primary"}
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: 'var(--g)',
                    color: '#041a0c',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(34, 209, 122, 0.25)'
                  }}
                >
                  <Plus size={16} strokeWidth={2.5} /> {loading ? 'Logging meal...' : `Log ${Math.round(selectedFood.calories * currentQty)} kcal to ${mealOptions.find(m => m.value === mealType)?.label || mealType}`}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--t3)' }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 20,
                background: 'var(--s2)',
                border: '0.5px solid var(--bd)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--g)'
              }}>
                <Utensils size={24} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                Select a food item
              </h3>
              <p style={{ fontSize: 12.5, margin: 0, color: 'var(--t3)', lineHeight: 1.5, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
                Click any food on the left to calibrate portion sizes, review exact macronutrients, and log to your day.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* MOBILE PORTION SCALER MODAL / BOTTOM SHEET (PREMIUM PORTAL QUALITY) */}
      {showMobileModal && selectedFood && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setShowMobileModal(false)}
        >
          <div
            style={{
              background: 'var(--s1)',
              borderTop: '1px solid var(--bd2)',
              borderLeft: '1px solid var(--bd)',
              borderRight: '1px solid var(--bd)',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              width: '100%',
              maxWidth: 540,
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -20px 50px rgba(0,0,0,0.8)',
              animation: 'slideUp 0.26s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--bd2)', margin: '12px auto 6px' }} />

            {/* Header */}
            <div style={{
              padding: '10px 20px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '0.5px solid var(--bd)'
            }}>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--g)' }}>
                  Portion & macro calibration
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', margin: '2px 0 0' }}>
                  {selectedFood.name}
                </h2>
                <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
                  Standard serving: <span style={{ color: 'var(--t1)', fontWeight: 600 }}>{selectedFood.servingSize || selectedFood.serving || '1 portion'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowMobileModal(false)}
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

            {/* Scrollable Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
              {renderScalerBody(true)}
            </div>

            {/* Sticky Bottom Log CTA Bar */}
            <div style={{
              padding: '12px 20px calc(14px + env(safe-area-inset-bottom, 0px))',
              borderTop: '0.5px solid var(--bd)',
              background: 'var(--s1)',
              display: 'flex',
              gap: 10
            }}>
              <button
                type="button"
                onClick={logFood}
                disabled={loading}
                className={loading ? "btn btn-primary btn-disabled" : "btn btn-primary"}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  borderRadius: 14,
                  background: 'var(--g)',
                  color: '#041a0c',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Plus size={18} strokeWidth={2.5} /> {loading ? 'Logging meal...' : `Log ${Math.round(selectedFood.calories * currentQty)} kcal to ${mealOptions.find(m => m.value === mealType)?.label || mealType}`}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
