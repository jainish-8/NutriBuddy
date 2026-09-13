import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import fallbackFoods from '../data/indian_diet_db.json';
import { API_BASE } from '../config';
import { 
  Search, Plus, Check, Utensils, X, Star
} from 'lucide-react';
import { scaleIngredients } from '../utils/nutritionEngine';

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
    { id: 'recent', label: 'Recent & favourites' },
    { id: 'protein', label: 'High protein' },
    { id: 'thalis', label: 'Indian thalis' },
    { id: 'legumes', label: 'Dals & pulses' },
    { id: 'grains', label: 'Rotis & grains' },
    { id: 'dairy', label: 'Dairy & curds' },
    { id: 'poultry', label: 'Poultry, fish & eggs' },
    { id: 'snacks', label: 'Healthy snacks' },
  ];

  const mealOptions = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snacks', label: 'Snacks' },
  ];

  const currentQty = parseFloat(quantity) || 1;
  const scaledIngredients = selectedFood?.ingredients 
    ? scaleIngredients(selectedFood.ingredients, currentQty)
    : [];

  const renderScalerBody = (isModal = false) => (
    <>
      {/* Meal Destination Selector */}
      <div className="form-group" style={{ marginBottom: 18 }}>
        <label className="form-label" style={{ fontSize: 11, marginBottom: 6 }}>Target meal slot</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {mealOptions.map(m => (
            <button
              key={m.value}
              onClick={() => setMealType(m.value)}
              style={{
                padding: '8px 4px',
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                border: mealType === m.value ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                background: mealType === m.value ? 'var(--brand-primary-subtle)' : 'var(--bg-surface-raised)',
                color: mealType === m.value ? 'var(--brand-primary-light)' : 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Portion Stepper & Presets */}
      <div style={{ background: 'var(--bg-surface-raised)', padding: '16px', borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-subtle)', marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            Portion multiplier
          </span>
          <span className="tabular-nums" style={{ fontSize: 12, fontWeight: 800, color: 'var(--brand-primary-light)' }}>
            Est. ₹{Math.round((selectedFood.cost || 15) * currentQty)}
          </span>
        </div>

        {/* Central Tactile Stepper Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => handleAdjustQuantity(-0.25)}
            disabled={currentQty <= 0.25}
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: 20,
              fontWeight: 800,
              cursor: currentQty <= 0.25 ? 'default' : 'pointer',
              opacity: currentQty <= 0.25 ? 0.35 : 1,
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
            minWidth: 110,
            padding: '4px 12px',
            borderRadius: 'var(--radius-panel)',
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border-focus)'
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="10"
                value={quantity}
                onChange={(e) => handleDirectQuantityChange(e.target.value)}
                className="tabular-nums"
                style={{
                  width: 56,
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: 900,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--brand-primary-light)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  padding: 0
                }}
              />
              <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--brand-primary-light)' }}>x</span>
            </div>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              {currentQty === 1 ? '1 standard serving' : `${currentQty} servings`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleAdjustQuantity(+0.25)}
            disabled={currentQty >= 10}
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: 20,
              fontWeight: 800,
              cursor: currentQty >= 10 ? 'default' : 'pointer',
              opacity: currentQty >= 10 ? 0.35 : 1,
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {[
            { val: 0.5, label: '0.5x' },
            { val: 1.0, label: '1.0x' },
            { val: 1.5, label: '1.5x' },
            { val: 2.0, label: '2.0x' }
          ].map(p => (
            <button
              key={p.val}
              type="button"
              onClick={() => setQuantity(p.val)}
              style={{
                padding: '6px 4px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                border: currentQty === p.val ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                background: currentQty === p.val ? 'var(--brand-primary-subtle)' : 'var(--bg-surface)',
                color: currentQty === p.val ? 'var(--brand-primary-light)' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Scaled Macro Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 18 }}>
        <div style={{ background: 'var(--bg-surface-raised)', padding: '12px 8px', borderRadius: 'var(--radius-panel)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)' }}>Calories</span>
          <div className="tabular-nums" style={{ fontSize: 17, fontWeight: 800, color: 'var(--brand-primary-light)', marginTop: 2 }}>
            {Math.round(selectedFood.calories * currentQty)}
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface-raised)', padding: '12px 8px', borderRadius: 'var(--radius-panel)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent-protein-text, #818CF8)' }}>Protein</span>
          <div className="tabular-nums" style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent-protein-text, #818CF8)', marginTop: 2 }}>
            {(selectedFood.protein * currentQty).toFixed(1)}g
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface-raised)', padding: '12px 8px', borderRadius: 'var(--radius-panel)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--brand-primary-light, #10B981)' }}>Carbs</span>
          <div className="tabular-nums" style={{ fontSize: 15, fontWeight: 800, color: 'var(--brand-primary-light, #10B981)', marginTop: 2 }}>
            {(selectedFood.carbs * currentQty).toFixed(1)}g
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface-raised)', padding: '12px 8px', borderRadius: 'var(--radius-panel)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent-fat-text, #FB7185)' }}>Fats</span>
          <div className="tabular-nums" style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent-fat-text, #FB7185)', marginTop: 2 }}>
            {(selectedFood.fat * currentQty).toFixed(1)}g
          </div>
        </div>
      </div>

      {/* Scaled Recipe Ingredients Preview */}
      {scaledIngredients.length > 0 && (
        <div style={{ background: 'var(--bg-surface-raised)', padding: 14, borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
            {currentQty === 1 ? 'Ingredients (1 portion)' : `Ingredients (${currentQty}× portion)`}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {scaledIngredients.map((ing, iIdx) => (
              <div key={iIdx} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                • {ing}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Button - displayed in desktop panel */}
      {!isModal && (
        <button
          onClick={logFood}
          disabled={loading}
          className={loading ? "btn btn-primary btn-disabled" : "btn btn-primary"}
          style={{ width: '100%', padding: '13px 20px', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Plus size={16} strokeWidth={2.5} /> {loading ? 'Logging meal...' : `Log ${Math.round(selectedFood.calories * currentQty)} kcal to ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`}
        </button>
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

      {/* Page Header */}
      <div className="food-logger-header-card">
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--brand-primary-light)', marginBottom: 4 }}>
            Daily nutrition log
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 0 }}>
            Food & macro tracker
          </h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Search foods, scale portions, and track macros instantly
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('dashboard')}
          className="btn btn-secondary"
          style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700, borderRadius: 'var(--radius-pill)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <span>←</span> Back to Dashboard
        </button>
      </div>

      {/* Main 2-Column Split Grid */}
      <div className="food-logger-layout">

        {/* LEFT COLUMN: Food Search & List */}
        <div className="food-logger-card">
          {/* Search Bar with live letter matching */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search foods: e.g. Paneer, Oats, Eggs, Dal, Rice, Soya..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 40, fontSize: 13, height: 42 }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontWeight: 800 }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills with Horizontal Scroll & Fade */}
          <div className="category-scroll-wrapper">
            <div className="category-scroll-strip">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: activeCategory === c.id ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                    background: activeCategory === c.id ? 'var(--brand-primary-subtle)' : 'var(--bg-surface-raised)',
                    color: activeCategory === c.id ? 'var(--brand-primary-light)' : 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {c.id === 'recent' && <Star size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />}
                  {c.label}
                </button>
              ))}
            </div>
            <div className="category-scroll-fade" />
          </div>

          {/* Foods Results List */}
          <div className="food-logger-list">
            {foods.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: 13 }}>
                No food items match "{searchTerm}". Try another search term.
              </div>
            ) : (
              foods.map(f => {
                const isSelected = selectedFood?.id === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => { setSelectedFood(f); setQuantity(1); setShowMobileModal(true); }}
                    className="food-list-item"
                    style={{
                      borderColor: isSelected ? 'var(--border-focus)' : 'var(--border-subtle)',
                      background: isSelected ? 'var(--brand-primary-subtle)' : 'var(--bg-surface-raised)'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {f.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span>₹{f.cost || 15}</span>
                        <span>·</span>
                        <span style={{ color: 'var(--accent-protein-text, #818CF8)', fontWeight: 700 }}>P: {f.protein}g</span>
                        <span>·</span>
                        <span style={{ color: 'var(--brand-primary-light, #10B981)', fontWeight: 700 }}>C: {f.carbs}g</span>
                        <span>·</span>
                        <span style={{ color: 'var(--accent-fat-text, #FB7185)', fontWeight: 700 }}>F: {f.fat}g</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                      <span className="tabular-nums" style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--brand-primary-light)', whiteSpace: 'nowrap' }}>
                        {f.calories} kcal
                      </span>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginTop: 1 }}>
                        Scale →
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Desktop Portion Scaler & Dynamic Macro Breakdown */}
        <div className="food-logger-scaler-desktop" style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: '24px 28px',
          position: 'sticky',
          top: 20
        }}>
          {selectedFood ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--brand-primary-light)', marginBottom: 4 }}>
                    Selected food
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 0 }}>
                    {selectedFood.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFavorite(selectedFood)}
                  style={{
                    background: favorites.some(f => f.id === selectedFood.id || f.name === selectedFood.name) ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-surface-raised)',
                    border: `1px solid ${favorites.some(f => f.id === selectedFood.id || f.name === selectedFood.name) ? '#EF4444' : 'var(--border-subtle)'}`,
                    color: favorites.some(f => f.id === selectedFood.id || f.name === selectedFood.name) ? '#EF4444' : 'var(--text-secondary)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                >
                  Save to favourites {favorites.some(f => f.id === selectedFood.id || f.name === selectedFood.name) ? '♥' : '♡'}
                </button>
              </div>
              {renderScalerBody()}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Utensils size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>Select a Food Item</h3>
              <p style={{ fontSize: 12.5, margin: 0 }}>
                Click any food on the left to scale servings and calculate exact macronutrients.
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
              background: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-focus)',
              borderLeft: '1px solid var(--border-subtle)',
              borderRight: '1px solid var(--border-subtle)',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              width: '100%',
              maxWidth: 540,
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(16, 185, 129, 0.12)',
              animation: 'slideUp 0.26s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 44, height: 4.5, borderRadius: 9999, background: 'var(--text-muted)' }} />
            </div>

            {/* Header */}
            <div style={{
              padding: '10px 22px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--brand-primary-light)' }}>
                  Portion & macro calibration
                </div>
                <h2 style={{ fontSize: 19, fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: '2px 0 0' }}>
                  {selectedFood.name}
                </h2>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Standard serving: <span style={{ color: 'var(--brand-primary-light)', fontWeight: 700 }}>{selectedFood.servingSize || selectedFood.serving || '1 portion'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => toggleFavorite(selectedFood)}
                  style={{
                    background: favorites.some(f => f.id === selectedFood.id || f.name === selectedFood.name) ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-surface-raised)',
                    border: `1px solid ${favorites.some(f => f.id === selectedFood.id || f.name === selectedFood.name) ? '#EF4444' : 'var(--border-subtle)'}`,
                    color: favorites.some(f => f.id === selectedFood.id || f.name === selectedFood.name) ? '#EF4444' : 'var(--text-secondary)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '6px 10px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  Save to favourites {favorites.some(f => f.id === selectedFood.id || f.name === selectedFood.name) ? '♥' : '♡'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMobileModal(false)}
                  style={{
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '50%',
                    width: 34,
                    height: 34,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
              {renderScalerBody(true)}
            </div>

            {/* Sticky Bottom Log CTA Bar */}
            <div style={{
              padding: '12px 22px calc(14px + env(safe-area-inset-bottom, 0px))',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
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
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  borderRadius: 14,
                  minHeight: 48
                }}
              >
                <Plus size={18} strokeWidth={2.5} /> {loading ? 'Logging meal...' : `Log ${Math.round(selectedFood.calories * currentQty)} kcal to ${mealType.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
