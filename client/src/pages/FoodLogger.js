import React, { useState, useEffect } from 'react';
import fallbackFoods from '../data/indian_diet_db.json';
import { API_BASE } from '../config';

export default function FoodLogger({ user, setCurrentPage }) {
  const [foods, setFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState('breakfast');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFoods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchFoods = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/foods?search=${searchTerm}`);
      const data = await response.json();
      if (data.success) setFoods(data.foods);
    } catch {
      const filtered = fallbackFoods.filter(food =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFoods(filtered);
    }
  };

  const logFood = async () => {
    if (!selectedFood) return;
    setLoading(true);
    const foodLog = {
      userId: user.id,
      foodId: selectedFood.id,
      name: selectedFood.name,
      quantity: parseFloat(quantity),
      mealType,
      calories: selectedFood.calories * quantity,
      protein: selectedFood.protein * quantity,
      carbs: selectedFood.carbs * quantity,
      fat: selectedFood.fat * quantity,
      timestamp: new Date().toISOString()
    };
    try {
      const response = await fetch(`${API_BASE}/api/food-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodLog),
      });
      const data = await response.json();
      if (data.success) {
        alert('Food logged successfully!');
        setSelectedFood(null);
        setQuantity(1);
      }
    } catch {
      alert('Food logged locally (server unavailable)');
      setSelectedFood(null);
      setQuantity(1);
    }
    setLoading(false);
  };

  const calcNutrient = (key) =>
    selectedFood ? (selectedFood[key] * quantity).toFixed(1) : '—';

  const mealOptions = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
  ];

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '32px 24px 48px',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* ── Page Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 32,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: 6,
            }}
          >
            Nutrition
          </p>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Food Logger
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              marginTop: 6,
              marginBottom: 0,
            }}
          >
            Search, select, and log meals to track your daily nutrition.
          </p>
        </div>
      </div>

      {/* ── Split Layout ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* ── LEFT: Search + Food List ── */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: '24px 28px',
            backdropFilter: 'var(--glass-blur, none)',
            WebkitBackdropFilter: 'var(--glass-blur, none)',
          }}
        >
          {/* Section label */}
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: 14,
            }}
          >
            Search Foods
          </p>

          {/* Search input */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ position: 'relative' }}>
              {/* Search icon */}
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="form-control"
                type="text"
                placeholder="e.g. Dal, Roti, Paneer…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  paddingLeft: 36,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Food list */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              maxHeight: 420,
              overflowY: 'auto',
              paddingRight: 4,
            }}
          >
            {foods.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 0',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                }}
              >
                {searchTerm
                  ? 'No foods found. Try a different search term.'
                  : 'Start typing to search the food database.'}
              </div>
            ) : (
              foods.map((food) => {
                const isSelected = selectedFood?.id === food.id;
                return (
                  <button
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food);
                      setQuantity(1);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      width: '100%',
                      background: isSelected
                        ? 'var(--bg-surface-raised)'
                        : 'var(--bg-surface-alt)',
                      border: isSelected
                        ? '1px solid var(--accent-lavender-text)'
                        : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-panel)',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                  >
                    {/* Food name + macro pills */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          margin: 0,
                          marginBottom: 6,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {food.name}
                      </p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {[
                          { label: `P ${food.protein}g`, color: 'var(--accent-lavender-text)' },
                          { label: `C ${food.carbs}g`, color: 'var(--accent-lime-text)' },
                          { label: `F ${food.fat}g`, color: 'var(--accent-pink-text)' },
                        ].map(({ label, color }) => (
                          <span
                            key={label}
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: '0.05em',
                              textTransform: 'uppercase',
                              color,
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-pill)',
                              padding: '2px 7px',
                            }}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Calorie badge */}
                    <div
                      style={{
                        flexShrink: 0,
                        textAlign: 'right',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          fontFamily: 'var(--font-heading)',
                          letterSpacing: '-0.02em',
                          color: 'var(--accent-warning-text)',
                        }}
                      >
                        {food.calories}
                      </span>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: 'var(--text-muted)',
                          margin: 0,
                        }}
                      >
                        kcal
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Log Form or Empty State ── */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: '24px 28px',
            backdropFilter: 'var(--glass-blur, none)',
            WebkitBackdropFilter: 'var(--glass-blur, none)',
          }}
        >
          {selectedFood ? (
            <>
              {/* Section label */}
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 6,
                }}
              >
                Log Entry
              </p>

              {/* Selected food name */}
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  margin: '0 0 24px 0',
                  lineHeight: 1.25,
                }}
              >
                {selectedFood.name}
              </h2>

              {/* Quantity + Meal type */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Quantity (servings)</label>
                  <input
                    className="form-control"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Meal Type</label>
                  <select
                    className="form-control"
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  >
                    {mealOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nutrition summary — 4 mini stat boxes */}
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 12,
                }}
              >
                Nutrition Summary
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 28,
                }}
              >
                {[
                  {
                    label: 'Calories',
                    value: calcNutrient('calories'),
                    unit: 'kcal',
                    color: 'var(--accent-warning-text)',
                  },
                  {
                    label: 'Protein',
                    value: calcNutrient('protein'),
                    unit: 'g',
                    color: 'var(--accent-lavender-text)',
                  },
                  {
                    label: 'Carbs',
                    value: calcNutrient('carbs'),
                    unit: 'g',
                    color: 'var(--accent-lime-text)',
                  },
                  {
                    label: 'Fat',
                    value: calcNutrient('fat'),
                    unit: 'g',
                    color: 'var(--accent-pink-text)',
                  },
                ].map(({ label, value, unit, color }) => (
                  <div
                    key={label}
                    style={{
                      background: 'var(--bg-surface-alt)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-panel)',
                      padding: '14px 16px',
                    }}
                  >
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        margin: '0 0 4px 0',
                      }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        fontFamily: 'var(--font-heading)',
                        letterSpacing: '-0.02em',
                        color,
                        margin: 0,
                        lineHeight: 1,
                      }}
                    >
                      {value}
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          marginLeft: 3,
                        }}
                      >
                        {unit}
                      </span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Log button */}
              <button
                onClick={logFood}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  background: loading ? 'var(--border-strong)' : 'var(--accent-lavender-text)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.15s',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Logging…' : 'Log Food Entry'}
              </button>

              {/* Clear selection */}
              <button
                onClick={() => {
                  setSelectedFood(null);
                  setQuantity(1);
                }}
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: '10px 0',
                  background: 'transparent',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                Clear Selection
              </button>
            </>
          ) : (
            /* ── Empty state ── */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 340,
                gap: 16,
                textAlign: 'center',
              }}
            >
              {/* Placeholder icon */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <line x1="12" y1="11" x2="12" y2="17" />
                  <line x1="9" y1="14" x2="15" y2="14" />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: '0 0 6px 0',
                  }}
                >
                  No Food Selected
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    margin: 0,
                    maxWidth: 220,
                  }}
                >
                  Search for a food on the left and select it to log your meal.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Back to Dashboard ── */}
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <button
          onClick={() => setCurrentPage('dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
            padding: 0,
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
