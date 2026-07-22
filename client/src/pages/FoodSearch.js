import React, { useState, useEffect } from 'react';
import fallbackFoods from '../data/indian_diet_db.json';

export default function FoodSearch({ user, setCurrentPage }) {
  const [foods, setFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedRecipeFood, setSelectedRecipeFood] = useState(null);

  const categories = [
    { value: 'all', label: 'All Foods' },
    { value: 'grains', label: 'Grains' },
    { value: 'protein', label: 'Protein' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'beverages', label: 'Beverages' }
  ];

  useEffect(() => {
    fetchFoods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory]);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/foods?search=${searchTerm}&category=${selectedCategory}`);
      const data = await response.json();
      if (data.success) {
        setFoods(data.foods);
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
      // Fallback to local food database
      let filtered = fallbackFoods;

      if (searchTerm) {
        filtered = filtered.filter(food =>
          food.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (selectedCategory !== 'all') {
        filtered = filtered.filter(food => food.category === selectedCategory);
      }

      setFoods(filtered);
    }
    setLoading(false);
  };

  function getCategoryColor(category) {
    const colors = {
      grains: 'var(--accent-lime)',
      protein: 'var(--accent-danger)',
      fruits: 'var(--accent-pink)',
      vegetables: 'var(--accent-lime)',
      dairy: 'var(--accent-lavender)',
      snacks: 'var(--accent-lavender-dark)',
      beverages: 'var(--accent-warning)'
    };
    return colors[category] || 'var(--text-muted)';
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 64px' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 28 }}>
        <p style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          margin: '0 0 6px 0'
        }}>
          Nutrition Database
        </p>
        <h1 style={{
          fontSize: 28,
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          margin: '0 0 6px 0'
        }}>
          Food Search
        </h1>
        {!loading && (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            {foods.length} item{foods.length !== 1 ? 's' : ''} found
            {selectedCategory !== 'all' && (
              <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>
                in {categories.find(c => c.value === selectedCategory)?.label}
              </span>
            )}
          </p>
        )}
      </div>

      {/* ── Sticky Search Controls Panel ── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-card)',
        padding: '24px 28px',
        backdropFilter: 'var(--glass-blur, none)',
        WebkitBackdropFilter: 'var(--glass-blur, none)',
        marginBottom: 28,
        position: 'sticky',
        top: 16,
        zIndex: 10
      }}>
        {/* Text Search */}
        <div style={{ marginBottom: 16 }}>
          <label className="form-label" style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            display: 'block',
            marginBottom: 8
          }}>
            Search Foods
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by food name (e.g. Dalia, Makhana, Paneer)..."
            className="form-control"
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        {/* Category Filter Pills */}
        <div>
          <label className="form-label" style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            display: 'block',
            marginBottom: 10
          }}>
            Category
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                style={{
                  padding: '5px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 'var(--radius-pill)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: selectedCategory === category.value
                    ? 'var(--accent-lavender-text)'
                    : 'transparent',
                  color: selectedCategory === category.value
                    ? '#fff'
                    : 'var(--text-secondary)',
                  border: selectedCategory === category.value
                    ? '1px solid var(--accent-lavender-text)'
                    : '1px solid var(--border-strong)'
                }}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
          <div style={{
            width: 36,
            height: 36,
            border: '3px solid var(--border-subtle)',
            borderTop: '3px solid var(--accent-lavender-text)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── Food Grid ── */}
      {!loading && foods.length === 0 && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: '48px 28px',
          textAlign: 'center',
          backdropFilter: 'var(--glass-blur, none)',
          WebkitBackdropFilter: 'var(--glass-blur, none)'
        }}>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            No foods found. Try a different search term or category.
          </p>
        </div>
      )}

      {!loading && foods.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24
        }}>
          {foods.map(food => (
            <div
              key={food.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-card)',
                backdropFilter: 'var(--glass-blur, none)',
                WebkitBackdropFilter: 'var(--glass-blur, none)',
                borderLeft: `3px solid ${getCategoryColor(food.category)}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px 20px 20px 18px',
                transition: 'border-color 0.15s ease'
              }}
            >
              <div>
                {/* Card Header: name + category badge + cost */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ flex: 1, marginRight: 12 }}>
                    <h4 style={{
                      margin: '0 0 6px 0',
                      fontSize: 15,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-heading)',
                      lineHeight: 1.3
                    }}>
                      {food.name}
                    </h4>
                    <span style={{
                      background: 'var(--bg-surface-raised)',
                      color: getCategoryColor(food.category),
                      border: `1px solid ${getCategoryColor(food.category)}`,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em'
                    }}>
                      {food.category}
                    </span>
                  </div>
                </div>

                {/* 4-col Nutrition Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 6,
                  marginBottom: 12
                }}>
                  {[
                    { label: 'Calories', value: food.calories, color: 'var(--accent-pink-text)' },
                    { label: 'Protein', value: `${food.protein}g`, color: 'var(--accent-lavender-text)' },
                    { label: 'Carbs', value: `${food.carbs}g`, color: 'var(--text-primary)' },
                    { label: 'Fat', value: `${food.fat}g`, color: 'var(--accent-warning-text)' }
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{
                      textAlign: 'center',
                      padding: '6px 4px',
                      background: 'var(--bg-surface-alt)',
                      borderRadius: 8,
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color,
                        fontFamily: 'var(--font-heading)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2
                      }}>
                        {value}
                      </div>
                      <div style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginTop: 2
                      }}>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Benefits Preview */}
                {food.benefits && (
                  <p style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    lineHeight: 1.4,
                    margin: '0 0 10px 0'
                  }}>
                    {food.benefits.length > 80 ? food.benefits.substring(0, 80) + '…' : food.benefits}
                  </p>
                )}

                {/* Allergen Pills */}
                {food.allergies && food.allergies.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                    {food.allergies.map(allergy => (
                      <span key={allergy} style={{
                        background: 'var(--bg-surface-raised)',
                        color: 'var(--accent-danger)',
                        border: '1px solid var(--accent-danger)',
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: 8.5,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em'
                      }}>
                        {allergy}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* View Recipe Button */}
              {food.recipe && (
                <button
                  onClick={() => setSelectedRecipeFood(food)}
                  style={{
                    marginTop: 12,
                    width: '100%',
                    padding: '7px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: 'transparent',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--text-secondary)',
                    borderRadius: 'var(--radius-pill)',
                    transition: 'border-color 0.15s ease, color 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent-lavender-text)';
                    e.currentTarget.style.color = 'var(--accent-lavender-text)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-strong)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  View Recipe
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Recipe Modal ── */}
      {selectedRecipeFood && (
        <div
          onClick={() => setSelectedRecipeFood(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
            backdropFilter: 'blur(6px)'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-panel)',
              padding: '28px 28px 24px',
              maxWidth: 560,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: 22,
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)'
                }}>
                  {selectedRecipeFood.name}
                </h3>
                <span style={{
                  background: 'var(--bg-surface-alt)',
                  color: getCategoryColor(selectedRecipeFood.category),
                  border: `1px solid ${getCategoryColor(selectedRecipeFood.category)}`,
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  display: 'inline-block'
                }}>
                  {selectedRecipeFood.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedRecipeFood(null)}
                style={{
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: 18,
                  lineHeight: 1,
                  flexShrink: 0
                }}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* 4 Macro Stat Boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Calories', value: selectedRecipeFood.calories, color: 'var(--accent-pink-text)' },
                { label: 'Protein', value: `${selectedRecipeFood.protein}g`, color: 'var(--accent-lavender-text)' },
                { label: 'Carbs', value: `${selectedRecipeFood.carbs}g`, color: 'var(--text-primary)' },
                { label: 'Fat', value: `${selectedRecipeFood.fat}g`, color: 'var(--accent-warning-text)' }
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  textAlign: 'center',
                  padding: '10px 6px',
                  background: 'var(--bg-surface-alt)',
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color,
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '-0.02em'
                  }}>
                    {value}
                  </div>
                  <div style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginTop: 3
                  }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Metadata Row */}
            <div style={{
              display: 'flex',
              gap: 20,
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: '1px solid var(--border-subtle)',
              flexWrap: 'wrap'
            }}>
              <span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.06em' }}>Prep Time</span>
                {'  '}
                <strong style={{ color: 'var(--text-primary)' }}>{selectedRecipeFood.prepTime} mins</strong>
              </span>
              <span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.06em' }}>Difficulty</span>
                {'  '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {selectedRecipeFood.difficulty === 'no-cook'
                    ? 'No Cooking'
                    : selectedRecipeFood.difficulty === 'basic'
                    ? 'Simple'
                    : selectedRecipeFood.difficulty === 'moderate'
                    ? 'Moderate'
                    : 'Advanced'}
                </strong>
              </span>
            </div>

            {/* Recipe Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Ingredients */}
              <div>
                <h4 style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  margin: '0 0 8px 0'
                }}>
                  Ingredients
                </h4>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {selectedRecipeFood.ingredients?.map((ingredient, idx) => (
                    <li key={idx} style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      marginBottom: 4,
                      lineHeight: 1.5
                    }}>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h4 style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  margin: '0 0 8px 0'
                }}>
                  Instructions
                </h4>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  margin: 0,
                  lineHeight: 1.6
                }}>
                  {selectedRecipeFood.recipe}
                </p>
              </div>

              {/* Benefits Callout */}
              {selectedRecipeFood.benefits && (
                <div style={{
                  background: 'var(--bg-surface-alt)',
                  padding: '12px 16px',
                  borderRadius: 8,
                  borderLeft: '3px solid var(--accent-lime-text)'
                }}>
                  <strong style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--accent-lime-text)',
                    display: 'block',
                    marginBottom: 5
                  }}>
                    Health Benefits
                  </strong>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 12.5, margin: 0, lineHeight: 1.5 }}>
                    {selectedRecipeFood.benefits}
                  </p>
                </div>
              )}

              {/* Tips Callout */}
              {selectedRecipeFood.tips && (
                <div style={{
                  background: 'var(--bg-surface-alt)',
                  padding: '12px 16px',
                  borderRadius: 8,
                  borderLeft: '3px solid var(--accent-lavender-text)'
                }}>
                  <strong style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--accent-lavender-text)',
                    display: 'block',
                    marginBottom: 5
                  }}>
                    Nutrition Tip
                  </strong>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 12.5, margin: 0, lineHeight: 1.5 }}>
                    {selectedRecipeFood.tips}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedRecipeFood(null)}
                style={{
                  padding: '8px 22px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: 'transparent',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-pill)'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Back to Dashboard ── */}
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <button
          onClick={() => setCurrentPage('dashboard')}
          style={{
            padding: '9px 24px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            background: 'transparent',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-pill)'
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
