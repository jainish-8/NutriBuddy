import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, X, Utensils, BookOpen, ChevronRight, 
  Check, Sparkles, Dumbbell, Clock
} from 'lucide-react';
import indianDietDb from '../data/indian_diet_db.json';
import { GOLDEN_FITNESS_MEALS } from '../utils/nutritionEngine';
import { PRESET_EXERCISES } from '../pages/ExerciseTracker';

/**
 * GlobalSearchModal - Unified search modal searching across Indian foods,
 * resistance exercises, and sports nutrition recipes simultaneously.
 */
export default function GlobalSearchModal({
  isOpen,
  onClose,
  onNavigate,
  user
}) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'foods' | 'exercises' | 'recipes'
  const [loggedToast, setLoggedToast] = useState(null);
  const inputRef = useRef(null);

  // Body scroll lock and focus management
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const trendingSearches = [
    'Paneer Bhurji',
    'Barbell Back Squat',
    'Chicken Breast',
    'Moong Dal',
    'Bench Press',
    'Phool Makhana'
  ];

  // Search Results Filtering
  const cleanQ = query.trim().toLowerCase();

  const matchedFoods = useMemo(() => {
    if (!cleanQ) return [];
    return indianDietDb.filter(f => 
      (f.name && f.name.toLowerCase().includes(cleanQ)) ||
      (f.category && f.category.toLowerCase().includes(cleanQ))
    ).slice(0, 10);
  }, [cleanQ]);

  const matchedExercises = useMemo(() => {
    if (!cleanQ) return [];
    return (PRESET_EXERCISES || []).filter(ex => 
      (ex.name && ex.name.toLowerCase().includes(cleanQ)) ||
      (ex.muscleGroup && ex.muscleGroup.toLowerCase().includes(cleanQ)) ||
      (ex.category && ex.category.toLowerCase().includes(cleanQ))
    ).slice(0, 10);
  }, [cleanQ]);

  const matchedRecipes = useMemo(() => {
    if (!cleanQ) return [];
    return (GOLDEN_FITNESS_MEALS || []).filter(r => 
      (r.name && r.name.toLowerCase().includes(cleanQ)) ||
      (r.category && r.category.toLowerCase().includes(cleanQ)) ||
      (r.recipe && r.recipe.toLowerCase().includes(cleanQ))
    ).slice(0, 10);
  }, [cleanQ]);

  const totalResults = matchedFoods.length + matchedExercises.length + matchedRecipes.length;

  // Direct quick-log food action
  const handleQuickLog = (food, e) => {
    e.stopPropagation();
    try {
      const activeUserId = user?.id || user?._id || 'guest';
      const today = new Date().toISOString().split('T')[0];
      const key = `nutribuddy_foodlogs_${activeUserId}_${today}`;
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      const newEntry = {
        id: Date.now().toString(),
        name: food.name,
        calories: food.calories || 0,
        protein: food.protein || 0,
        carbs: food.carbs || 0,
        fat: food.fat || 0,
        mealType: 'lunch',
        servingUnit: food.servingUnit || '1 serving',
        portionCount: 1,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify([...current, newEntry]));
      window.dispatchEvent(new Event('storage'));
      setLoggedToast(`Logged "${food.name}" to today!`);
      setTimeout(() => setLoggedToast(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 'env(safe-area-inset-top, 16px) 16px env(safe-area-inset-bottom, 16px)',
        overflowY: 'auto'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 620,
          background: 'var(--bg-surface, #0D1117)',
          border: '1px solid var(--border-subtle, #30363D)',
          borderRadius: 'var(--radius-card, 16px)',
          marginTop: 'min(40px, 5vh)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
          overflow: 'hidden'
        }}
      >
        {/* Header Search Input Bar */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-subtle, #30363D)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--bg-surface-raised, #161A22)'
        }}>
          <Search size={18} style={{ color: 'var(--brand-primary-light, #10B981)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search foods, exercises, or recipes..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: 'var(--text-primary, #FFFFFF)',
              fontFamily: 'inherit'
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted, #8B949E)',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-surface, #0D1117)',
              border: '1px solid var(--border-subtle, #30363D)',
              borderRadius: 6,
              color: 'var(--text-muted, #8B949E)',
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 8px',
              cursor: 'pointer'
            }}
          >
            ESC
          </button>
        </div>

        {/* Filter Tabs Bar */}
        {cleanQ && totalResults > 0 && (
          <div style={{
            display: 'flex',
            gap: 6,
            padding: '8px 16px',
            background: 'var(--bg-surface, #0D1117)',
            borderBottom: '1px solid var(--border-subtle, #30363D)',
            overflowX: 'auto'
          }}>
            {[
              { key: 'all', label: `All (${totalResults})` },
              { key: 'foods', label: `Foods (${matchedFoods.length})` },
              { key: 'exercises', label: `Exercises (${matchedExercises.length})` },
              { key: 'recipes', label: `Recipes (${matchedRecipes.length})` }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: activeTab === tab.key ? '1px solid var(--brand-primary-light, #10B981)' : '1px solid var(--border-subtle, #30363D)',
                  background: activeTab === tab.key ? 'var(--brand-primary-subtle, rgba(16, 185, 129, 0.12))' : 'transparent',
                  color: activeTab === tab.key ? 'var(--brand-primary-light, #10B981)' : 'var(--text-muted, #8B949E)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Search Results / Trending Suggestions Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
          {/* Quick Trending Suggestions when query is empty */}
          {!cleanQ && (
            <div>
              <div style={{
                fontSize: 10,
                fontWeight: 800,
                color: 'var(--text-muted, #8B949E)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <Sparkles size={12} color="var(--brand-primary-light, #10B981)" />
                TRENDING SEARCHES
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {trendingSearches.map((item) => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    style={{
                      padding: '6px 12px',
                      background: 'var(--bg-surface-raised, #161A22)',
                      border: '1px solid var(--border-subtle, #30363D)',
                      borderRadius: 20,
                      color: 'var(--text-primary, #FFFFFF)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Search size={11} color="var(--text-muted, #8B949E)" />
                    {item}
                  </button>
                ))}
              </div>

              <div style={{
                padding: '16px',
                background: 'var(--bg-surface-raised, #161A22)',
                borderRadius: 'var(--radius-panel, 14px)',
                border: '1px solid var(--border-subtle, #30363D)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                textAlign: 'center'
              }}>
                <div>
                  <Utensils size={18} color="var(--accent-protein-text, #818CF8)" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Indian Foods</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Macros & portions</div>
                </div>
                <div>
                  <Dumbbell size={18} color="var(--brand-primary-light, #10B981)" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>38 Exercises</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Anatomy & cues</div>
                </div>
                <div>
                  <BookOpen size={18} color="var(--accent-carbs-text, #38BDF8)" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Sports Recipes</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Prep time & steps</div>
                </div>
              </div>
            </div>
          )}

          {/* If query has no matches */}
          {cleanQ && totalResults === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
              <Search size={28} style={{ opacity: 0.4, margin: '0 auto 10px' }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                No matches found for "{query}"
              </div>
              <p style={{ fontSize: 12, margin: '6px 0 0' }}>
                Try searching for ingredients (e.g. paneer, chicken), exercises (e.g. squat, press), or recipe names.
              </p>
            </div>
          )}

          {/* Results Lists */}
          {cleanQ && totalResults > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* SECTION: FOODS */}
              {(activeTab === 'all' || activeTab === 'foods') && matchedFoods.length > 0 && (
                <div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent-protein-text, #818CF8)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>
                    INDIAN FOODS ({matchedFoods.length})
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {matchedFoods.map(food => (
                      <div
                        key={food.id || food.name}
                        onClick={() => {
                          onNavigate('food-log');
                          onClose();
                        }}
                        style={{
                          padding: '10px 14px',
                          background: 'var(--bg-surface-raised, #161A22)',
                          borderRadius: 'var(--radius-panel, 12px)',
                          border: '1px solid var(--border-subtle, #30363D)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {food.name}
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 3, fontSize: 11 }}>
                            <span className="tabular-nums" style={{ color: 'var(--color-green, #22D17A)', fontWeight: 700 }}>
                              {food.calories} kcal
                            </span>
                            <span className="tabular-nums" style={{ color: 'var(--color-protein, #5B8AF5)', fontWeight: 700 }}>
                              {food.protein}g P
                            </span>
                            <span className="tabular-nums" style={{ color: 'var(--color-carb, #22D17A)' }}>
                              {food.carbs}g C
                            </span>
                            <span className="tabular-nums" style={{ color: 'var(--color-fat, #F5A623)' }}>
                              {food.fat}g F
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleQuickLog(food, e)}
                          title="Quick log food"
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm, 8px)',
                            background: 'var(--brand-primary-subtle, rgba(16, 185, 129, 0.12))',
                            border: '1px solid var(--border-focus, #10B981)',
                            color: 'var(--brand-primary-light, #10B981)',
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            flexShrink: 0
                          }}
                        >
                          <Utensils size={12} /> Log
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: EXERCISES */}
              {(activeTab === 'all' || activeTab === 'exercises') && matchedExercises.length > 0 && (
                <div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--brand-primary-light, #10B981)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>
                    EXERCISES & ANATOMY ({matchedExercises.length})
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {matchedExercises.map(ex => (
                      <div
                        key={ex.name}
                        onClick={() => {
                          onNavigate('exercise');
                          onClose();
                        }}
                        style={{
                          padding: '10px 14px',
                          background: 'var(--bg-surface-raised, #161A22)',
                          borderRadius: 'var(--radius-panel, 12px)',
                          border: '1px solid var(--border-subtle, #30363D)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Dumbbell size={14} color="var(--brand-primary-light, #10B981)" />
                            {ex.name}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            {ex.muscleGroup} • {ex.category}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--brand-primary-light, #10B981)', fontSize: 11, fontWeight: 700 }}>
                          Workout Console <ChevronRight size={14} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: RECIPES */}
              {(activeTab === 'all' || activeTab === 'recipes') && matchedRecipes.length > 0 && (
                <div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent-carbs-text, #38BDF8)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>
                    RECIPES & MEAL PLANS ({matchedRecipes.length})
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {matchedRecipes.map(recipe => (
                      <div
                        key={recipe.id || recipe.name}
                        onClick={() => {
                          onNavigate('meal-planner');
                          onClose();
                        }}
                        style={{
                          padding: '10px 14px',
                          background: 'var(--bg-surface-raised, #161A22)',
                          borderRadius: 'var(--radius-panel, 12px)',
                          border: '1px solid var(--border-subtle, #30363D)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {recipe.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2, fontSize: 11, color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Clock size={11} /> {recipe.prepTime || 15}m
                            </span>
                            <span className="tabular-nums" style={{ color: 'var(--brand-primary-light)' }}>
                              {recipe.calories} kcal
                            </span>
                            <span className="tabular-nums" style={{ color: 'var(--accent-protein-text, #818CF8)' }}>
                              {recipe.protein}g protein
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-carbs-text, #38BDF8)', fontSize: 11, fontWeight: 700 }}>
                          View Recipe <ChevronRight size={14} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Quick Tip */}
        <div style={{
          padding: '8px 16px',
          background: 'var(--bg-surface-raised, #161A22)',
          borderTop: '1px solid var(--border-subtle, #30363D)',
          fontSize: 10,
          color: 'var(--text-muted, #8B949E)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Tip: Press <strong>Ctrl+K</strong> or <strong>Cmd+K</strong> anytime to open search</span>
          <span>NutriBuddy Universal Engine</span>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {loggedToast && (
        <div
          className="fadeInUp"
          style={{
            position: 'fixed',
            bottom: 'calc(40px + env(safe-area-inset-bottom))',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-surface-raised, #161A22)',
            border: '1px solid var(--border-focus, #10B981)',
            color: 'var(--text-primary, #FFFFFF)',
            padding: '10px 18px',
            borderRadius: 24,
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            zIndex: 1000000,
            whiteSpace: 'nowrap'
          }}
        >
          <Check size={14} color="var(--brand-primary-light, #10B981)" />
          {loggedToast}
        </div>
      )}
    </div>,
    document.body
  );
}
