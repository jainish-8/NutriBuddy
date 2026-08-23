import React, { useState, useEffect } from 'react';
import fallbackFoods from '../data/indian_diet_db.json';
import { API_BASE } from '../config';
import { 
  Search, Plus, Check, Utensils
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

  // Dynamic filter with letter-by-letter matching
  useEffect(() => {
    let list = fallbackFoods;
    if (activeCategory !== 'all') {
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
  }, [searchTerm, activeCategory]);

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
    setLoading(false);
  };

  const categories = [
    { id: 'all', label: 'All Foods' },
    { id: 'protein', label: 'High Protein' },
    { id: 'grains', label: 'Grains & Millets' },
    { id: 'dairy', label: 'Dairy & Curds' },
    { id: 'poultry', label: 'Poultry & Eggs' },
    { id: 'snacks', label: 'Healthy Snacks' },
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

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 4px', position: 'relative' }}>

      {/* Floating Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 99999,
          background: notification.type === 'error' ? '#EF4444' : '#10B981',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 12,
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
            DAILY NUTRITION LOG
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 0 }}>
            Food & Calorie Logger
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Instant search with real-time portion scaling and automatic macro calculations.
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('dashboard')}
          className="btn btn-secondary"
          style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700 }}
        >
          Back to Dashboard
        </button>
      </div>

      {/* Main 2-Column Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(320px, 1fr)', gap: 20, alignItems: 'start' }}>

        {/* LEFT COLUMN: Food Search & List */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: '22px 24px',
        }}>
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

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 12 }}>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: activeCategory === c.id ? '1.5px solid var(--brand-primary, #F59E0B)' : '1px solid var(--border-subtle)',
                  background: activeCategory === c.id ? 'rgba(245,158,11,0.12)' : 'var(--bg-surface-raised)',
                  color: activeCategory === c.id ? 'var(--brand-primary, #F59E0B)' : 'var(--text-muted)',
                  whiteSpace: 'nowrap'
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Foods Results List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 480, overflowY: 'auto', paddingRight: 4 }}>
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
                    onClick={() => { setSelectedFood(f); setQuantity(1); }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: isSelected ? '1.5px solid var(--brand-primary, #F59E0B)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(245,158,11,0.08)' : 'var(--bg-surface-raised)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                        {f.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 8 }}>
                        <span>₹{f.cost || 15}</span>
                        <span>·</span>
                        <span style={{ color: '#818CF8', fontWeight: 700 }}>P: {f.protein}g</span>
                        <span>·</span>
                        <span style={{ color: '#10B981', fontWeight: 700 }}>C: {f.carbs}g</span>
                        <span>·</span>
                        <span style={{ color: '#F472B6', fontWeight: 700 }}>F: {f.fat}g</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)' }}>
                        {f.calories} kcal
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Portion Scaler & Dynamic Macro Breakdown */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: '24px 28px',
          position: 'sticky',
          top: 20
        }}>
          {selectedFood ? (
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brand-primary, #F59E0B)', marginBottom: 4 }}>
                SELECTED FOOD
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: '0 0 16px' }}>
                {selectedFood.name}
              </h2>

              {/* Meal Destination Selector */}
              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label" style={{ fontSize: 11, marginBottom: 6 }}>Target Meal Slot</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  {mealOptions.map(m => (
                    <button
                      key={m.value}
                      onClick={() => setMealType(m.value)}
                      style={{
                        padding: '8px 4px',
                        fontSize: 11,
                        fontWeight: 800,
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: mealType === m.value ? '1.5px solid var(--brand-primary, #F59E0B)' : '1px solid var(--border-subtle)',
                        background: mealType === m.value ? 'rgba(245,158,11,0.12)' : 'var(--bg-surface-raised)',
                        color: mealType === m.value ? 'var(--brand-primary, #F59E0B)' : 'var(--text-muted)'
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Portion Stepper & Direct Typing Input */}
              <div style={{ background: 'var(--bg-surface-raised)', padding: '16px', borderRadius: 14, border: '1px solid var(--border-subtle)', marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    PORTION MULTIPLIER
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-primary, #F59E0B)' }}>
                    Est. ₹{Math.round((selectedFood.cost || 15) * currentQty)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleAdjustQuantity(-0.5)}
                      style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 800, fontSize: 12 }}
                    >
                      -0.5
                    </button>
                    <button
                      onClick={() => handleAdjustQuantity(-0.25)}
                      style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 800, fontSize: 12 }}
                    >
                      -0.25
                    </button>
                    <button
                      onClick={() => handleAdjustQuantity(+0.25)}
                      style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 800, fontSize: 12 }}
                    >
                      +0.25
                    </button>
                    <button
                      onClick={() => handleAdjustQuantity(+0.5)}
                      style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 800, fontSize: 12 }}
                    >
                      +0.5
                    </button>
                  </div>

                  {/* Direct Numeric Input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      type="number"
                      step="0.25"
                      min="0.25"
                      max="10"
                      value={quantity}
                      onChange={(e) => handleDirectQuantityChange(e.target.value)}
                      style={{
                        width: 64,
                        textAlign: 'center',
                        fontSize: 16,
                        fontWeight: 900,
                        padding: '6px 4px',
                        borderRadius: 8,
                        background: 'var(--bg-surface)',
                        border: '1.5px solid var(--border-subtle)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>x</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Scaled Macro Matrix */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 18 }}>
                <div style={{ background: 'var(--bg-surface-raised)', padding: '12px 8px', borderRadius: 12, textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CALORIES</span>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)', marginTop: 2 }}>
                    {Math.round(selectedFood.calories * currentQty)}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-surface-raised)', padding: '12px 8px', borderRadius: 12, textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#818CF8', textTransform: 'uppercase' }}>PROTEIN</span>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#818CF8', marginTop: 2 }}>
                    {(selectedFood.protein * currentQty).toFixed(1)}g
                  </div>
                </div>
                <div style={{ background: 'var(--bg-surface-raised)', padding: '12px 8px', borderRadius: 12, textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#10B981', textTransform: 'uppercase' }}>CARBS</span>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#10B981', marginTop: 2 }}>
                    {(selectedFood.carbs * currentQty).toFixed(1)}g
                  </div>
                </div>
                <div style={{ background: 'var(--bg-surface-raised)', padding: '12px 8px', borderRadius: 12, textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#F472B6', textTransform: 'uppercase' }}>FATS</span>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#F472B6', marginTop: 2 }}>
                    {(selectedFood.fat * currentQty).toFixed(1)}g
                  </div>
                </div>
              </div>

              {/* Scaled Recipe Ingredients Preview */}
              {scaledIngredients.length > 0 && (
                <div style={{ background: 'var(--bg-surface-raised)', padding: 14, borderRadius: 12, border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                    CALCULATED INGREDIENTS ({currentQty}x PORTION)
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {scaledIngredients.map((ing, iIdx) => (
                      <div key={iIdx} style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                        • {ing}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Log Button */}
              <button
                onClick={logFood}
                disabled={loading}
                className={loading ? "btn btn-primary btn-disabled" : "btn btn-primary"}
                style={{ width: '100%', padding: '14px 20px', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--brand-primary, #F59E0B)', color: '#000' }}
              >
                <Plus size={16} strokeWidth={3} /> {loading ? 'Logging meal...' : `Log ${Math.round(selectedFood.calories * currentQty)} kcal to ${mealType.toUpperCase()}`}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Utensils size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>Select a Food Item</h3>
              <p style={{ fontSize: 12, margin: 0 }}>
                Click any food on the left to scale servings and calculate exact macronutrients.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
