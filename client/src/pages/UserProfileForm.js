import React, { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../config';
import { 
  Utensils, BarChart2, Dumbbell, Bot, User, Target, Leaf, 
  Sliders, Sparkles, AlertCircle, ArrowLeft, ArrowRight, Briefcase
} from 'lucide-react';
import { 
  calculateTDEE, 
  calculateTargetCalories, 
  calculateMacros, 
  searchProfessions 
} from '../utils/nutritionEngine';

export default function UserProfileForm({ user, setUser, setCurrentPage }) {
  const [step, setStep] = useState(1);
  const [heightUnit, setHeightUnit] = useState('cm');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    age: user?.age || '',
    gender: user?.gender || 'male',
    profession: user?.profession || '',
    weight: user?.weight || '',
    height: user?.height || '',
    gymDays: user?.gymDays !== undefined ? user.gymDays : 3,
    gymIntensity: user?.gymIntensity || 'moderate',
    goal: user?.goal || 'maintain',
    dietaryPreferences: user?.dietaryPreferences || '',
    allergies: user?.allergies || [],
    cookingSkill: user?.cookingSkill || 'basic',
    budgetRange: user?.budgetRange || 'moderate',
    mealPrepTime: user?.mealPrepTime || 'moderate'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Profession live autocomplete search state
  const [showProfDropdown, setShowProfDropdown] = useState(false);
  const profDropdownRef = useRef(null);

  const profSuggestions = searchProfessions(form.profession);

  // Auto-scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Click outside to close profession autocomplete
  useEffect(() => {
    const handleOutside = (e) => {
      if (profDropdownRef.current && !profDropdownRef.current.contains(e.target)) {
        setShowProfDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Initialize height feet/inches from cm if present
  useEffect(() => {
    if (user?.height) {
      const totalInches = Math.round(parseFloat(user.height) / 2.54);
      const ft = Math.floor(totalInches / 12);
      const inch = totalInches % 12;
      setHeightFt(ft.toString());
      setHeightIn(inch.toString());
    }
  }, [user]);

  // Handle Height Unit toggle and automatic conversion
  const handleFtInChange = (newFt, newIn) => {
    setHeightFt(newFt);
    setHeightIn(newIn);
    const f = parseInt(newFt, 10) || 0;
    const i = parseFloat(newIn) || 0;
    if (f > 0 || i > 0) {
      const calculatedCm = Math.round((f * 30.48) + (i * 2.54));
      setForm(prev => ({ ...prev, height: calculatedCm.toString() }));
      if (errors.height) setErrors(prev => ({ ...prev, height: null }));
    } else {
      setForm(prev => ({ ...prev, height: '' }));
    }
  };

  // Keep form in sync with user prop updates
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        age: user.age || '',
        gender: user.gender || 'male',
        profession: user.profession || '',
        weight: user.weight || '',
        height: user.height || '',
        gymDays: user.gymDays !== undefined ? user.gymDays : 3,
        gymIntensity: user.gymIntensity || 'moderate',
        goal: user.goal || 'maintain',
        dietaryPreferences: user.dietaryPreferences || '',
        allergies: user.allergies || [],
        cookingSkill: user.cookingSkill || 'basic',
        budgetRange: user.budgetRange || 'moderate',
        mealPrepTime: user.mealPrepTime || 'moderate'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'profession') {
      setShowProfDropdown(true);
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const selectProfession = (prof) => {
    setForm(prev => ({ ...prev, profession: prof.name }));
    setShowProfDropdown(false);
    if (errors.profession) {
      setErrors(prev => ({ ...prev, profession: null }));
    }
  };

  const handleCheckboxChange = (fieldName, value, checked) => {
    if (value === 'none') {
      setForm(prev => ({
        ...prev,
        [fieldName]: checked ? ['none'] : []
      }));
      return;
    }
    
    if (checked) {
      setForm(prev => ({ 
        ...prev, 
        [fieldName]: [...(prev[fieldName] || []).filter(item => item !== 'none'), value] 
      }));
    } else {
      setForm(prev => ({ 
        ...prev, 
        [fieldName]: (prev[fieldName] || []).filter(item => item !== value) 
      }));
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!form.fullName.trim()) newErrors.fullName = 'Full Name is required';
      if (!form.age || form.age < 1 || form.age > 120) newErrors.age = 'Valid age (1-120) is required';
      if (!form.profession.trim()) newErrors.profession = 'Profession is required';
    }
    if (currentStep === 2) {
      if (!form.weight || form.weight < 1 || form.weight > 300) newErrors.weight = 'Valid weight in kg is required';
      if (!form.height || form.height < 50 || form.height > 260) newErrors.height = 'Valid height is required';
      if (form.gymDays === undefined || form.gymDays === '' || form.gymDays < 0 || form.gymDays > 7) {
        newErrors.gymDays = 'Gym days (0-7) is required';
      }
    }

    setErrors(newErrors);

    const hasErrors = Object.keys(newErrors).length > 0;
    if (hasErrors) {
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => element.focus(), 300);
      }
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 4) return;
    if (!validateStep(4)) return;

    setLoading(true);

    // 1. Precise TDEE and BMR calculation through the scientific engine
    const tdeeResults = calculateTDEE({
      weight: form.weight,
      height: form.height,
      age: form.age,
      gender: form.gender,
      profession: form.profession,
      gymDays: form.gymDays,
      gymIntensity: form.gymIntensity
    });

    // 2. Goal-calibrated calorie target
    const dailyCalories = calculateTargetCalories({
      tdee: tdeeResults.tdee,
      bmr: tdeeResults.bmr,
      goal: form.goal,
      gender: form.gender
    });

    // 3. Exact macronutrient partitioning (ISSN / NSCA certified)
    const isGymGoer = parseInt(form.gymDays, 10) > 0;
    const macros = calculateMacros({
      dailyCalories,
      weight: form.weight,
      goal: form.goal,
      isGymGoer
    });

    const userData = {
      ...form,
      id: user?.id || Date.now(),
      bmr: tdeeResults.bmr,
      tdee: tdeeResults.tdee,
      dailyCalories: macros.calories,
      targetProtein: macros.protein,
      targetFat: macros.fat,
      targetCarbs: macros.carbs,
      isGymGoer,
      createdAt: user?.createdAt || new Date().toISOString()
    };

    // Auto sync training profile for Workout Console
    const trainingProfile = {
      trainingGoal: form.goal === 'fat_loss' ? 'fat_loss' : (form.goal === 'lean_bulk' || form.goal === 'aggressive_bulk') ? 'hypertrophy' : 'strength',
      trainingExperience: parseInt(form.gymDays, 10) >= 4 ? 'intermediate' : 'beginner',
      equipment: 'full_gym',
      trainingInjuries: [],
      sessionTime: 60,
      gymDays: parseInt(form.gymDays, 10) || 3
    };
    try {
      localStorage.setItem(`nutribuddy_training_profile_${userData.id}`, JSON.stringify(trainingProfile));
    } catch (err) {}

    try {
      const response = await fetch(`${API_BASE}/api/user-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setCurrentPage('dashboard');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setUser(userData);
      setCurrentPage('dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="onboarding-wrapper">

      {/* LEFT PANEL: Branding */}
      <div className="onboarding-left">
        <div className="onboarding-left-logo">
          Nutri<span>Buddy</span>
        </div>
        <p className="onboarding-left-tagline">
          Your personal nutrition & training companion. Intelligent meal plans, precise calorie calculation, and certified workout routines.
        </p>

        <div className="onboarding-left-features">
          <div className="onboarding-feature-pill">
            <div className="onboarding-feature-icon"><Utensils size={18} /></div>
            <span>Portion-scaled meal plans matching your budget</span>
          </div>
          <div className="onboarding-feature-pill">
            <div className="onboarding-feature-icon"><BarChart2 size={18} /></div>
            <span>Calibrated calorie and macro targets</span>
          </div>
          <div className="onboarding-feature-pill">
            <div className="onboarding-feature-icon"><Dumbbell size={18} /></div>
            <span>Personalized progressive workout periodization</span>
          </div>
          <div className="onboarding-feature-pill">
            <div className="onboarding-feature-icon"><Bot size={18} /></div>
            <span>AI smart suggestions & ingredient scaling</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Form */}
      <div className="onboarding-right">
        <div className="onboarding-right-inner">

          <h2 style={{ marginBottom: 6, fontSize: 'clamp(20px, 3vw, 28px)', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
            {user ? 'Update Your Profile' : 'Set Up Your Profile'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 28 }}>
            Step {step} of 4 — {
              step === 1 ? 'Personal & Occupation' : 
              step === 2 ? 'Biometrics & Gym Routine' : 
              step === 3 ? 'Dietary & Allergies' : 
              'Budget & Cooking Preferences'
            }
          </p>

          {/* Step Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  flex: 1
                }}>
                  <div style={{
                    width: '100%',
                    height: 4,
                    borderRadius: 2,
                    background: step >= s ? 'var(--brand-primary, #F59E0B)' : 'var(--bg-surface-raised)',
                    transition: 'background 0.4s ease'
                  }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: step >= s ? 'var(--brand-primary, #F59E0B)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {s === 1 ? 'Details' : s === 2 ? 'Biometrics' : s === 3 ? 'Dietary' : 'Budget'}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* STEP 1: Basic Identity & Profession */}
            {step === 1 && (
              <div style={{ animation: 'fadeInUp 0.35s ease both' }}>
                <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={16} /> Tell us about yourself
                </h3>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={errors.fullName ? "form-control error" : "form-control"}
                  />
                  {errors.fullName && <div style={{ color: 'var(--accent-danger)', fontSize: 13, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={13} /> {errors.fullName}</div>}
                </div>

                <div className="form-row" style={{ marginBottom: 20 }}>
                  <div className="form-group">
                    <label className="form-label">Age *</label>
                    <input
                      type="number"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      placeholder="Age"
                      className={errors.age ? "form-control error" : "form-control"}
                    />
                    {errors.age && <div style={{ color: 'var(--accent-danger)', fontSize: 13, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={13} /> {errors.age}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sex</label>
                    <select name="gender" value={form.gender} onChange={handleChange} className="form-control">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Profession Input with Opaque High-Z Autocomplete Dropdown */}
                <div className="form-group" style={{ position: 'relative', marginBottom: 24 }} ref={profDropdownRef}>
                  <label className="form-label">Profession / Occupation *</label>
                  
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="profession"
                      value={form.profession}
                      onChange={handleChange}
                      onFocus={() => setShowProfDropdown(true)}
                      placeholder="e.g. Student, Software Engineer, Teacher, Nurse, Builder..."
                      autoComplete="off"
                      className={errors.profession ? "form-control error" : "form-control"}
                      style={{ paddingRight: 36 }}
                    />
                    <Briefcase size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  </div>

                  {/* Autocomplete Dropdown (Fixed z-index and solid background) */}
                  {showProfDropdown && profSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 9999,
                      background: 'var(--bg-surface, #141419)',
                      border: '1px solid var(--border-strong, rgba(255,255,255,0.2))',
                      borderRadius: 12,
                      marginTop: 6,
                      boxShadow: '0 20px 48px rgba(0,0,0,0.85)',
                      maxHeight: 220,
                      overflowY: 'auto',
                      padding: 6
                    }}>
                      {profSuggestions.map((p, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => selectProfession(p)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-raised, #1C1C24)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{p.name}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>{p.label}</span>
                          </div>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: p.category === 'heavy_active' ? 'rgba(239, 68, 68, 0.18)' :
                                        p.category === 'moderate_active' ? 'rgba(245, 158, 11, 0.18)' :
                                        p.category === 'light_active' ? 'rgba(129, 140, 248, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                            color: p.category === 'heavy_active' ? '#EF4444' :
                                   p.category === 'moderate_active' ? '#F59E0B' :
                                   p.category === 'light_active' ? '#818CF8' : '#10B981',
                            textTransform: 'uppercase'
                          }}>
                            {p.category.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {errors.profession && <div style={{ color: 'var(--accent-danger)', fontSize: 13, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={13} /> {errors.profession}</div>}
                </div>
              </div>
            )}

            {/* STEP 2: Biometrics & Routine */}
            {step === 2 && (
              <div style={{ animation: 'fadeInUp 0.35s ease both' }}>
                <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Target size={16} /> Biometrics & Activity Routine
                </h3>

                <div className="form-row" style={{ marginBottom: 20 }}>
                  <div className="form-group">
                    <label className="form-label">Weight (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight"
                      value={form.weight}
                      onChange={handleChange}
                      placeholder="e.g. 70"
                      className={errors.weight ? "form-control error" : "form-control"}
                    />
                    {errors.weight && <div style={{ color: 'var(--accent-danger)', fontSize: 13, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={13} /> {errors.weight}</div>}
                  </div>

                  {/* Height with Unit Selector (cm vs ft/in) */}
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="form-label" style={{ margin: 0 }}>Height *</label>
                      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface-raised)', padding: 2, borderRadius: 8 }}>
                        <button
                          type="button"
                          onClick={() => setHeightUnit('cm')}
                          style={{
                            padding: '2px 8px',
                            fontSize: 10,
                            fontWeight: 800,
                            borderRadius: 6,
                            border: 'none',
                            cursor: 'pointer',
                            background: heightUnit === 'cm' ? 'var(--brand-primary, #F59E0B)' : 'transparent',
                            color: heightUnit === 'cm' ? '#000' : 'var(--text-muted)'
                          }}
                        >
                          cm
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeightUnit('ft_in')}
                          style={{
                            padding: '2px 8px',
                            fontSize: 10,
                            fontWeight: 800,
                            borderRadius: 6,
                            border: 'none',
                            cursor: 'pointer',
                            background: heightUnit === 'ft_in' ? 'var(--brand-primary, #F59E0B)' : 'transparent',
                            color: heightUnit === 'ft_in' ? '#000' : 'var(--text-muted)'
                          }}
                        >
                          ft / in
                        </button>
                      </div>
                    </div>

                    {heightUnit === 'cm' ? (
                      <input
                        type="number"
                        step="0.5"
                        name="height"
                        value={form.height}
                        onChange={handleChange}
                        placeholder="Height in cm (e.g. 175)"
                        className={errors.height ? "form-control error" : "form-control"}
                      />
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="number"
                          value={heightFt}
                          onChange={(e) => handleFtInChange(e.target.value, heightIn)}
                          placeholder="Feet (e.g. 5)"
                          className={errors.height ? "form-control error" : "form-control"}
                          style={{ flex: 1 }}
                        />
                        <input
                          type="number"
                          step="0.5"
                          value={heightIn}
                          onChange={(e) => handleFtInChange(heightFt, e.target.value)}
                          placeholder="Inches (e.g. 9)"
                          className={errors.height ? "form-control error" : "form-control"}
                          style={{ flex: 1 }}
                        />
                      </div>
                    )}
                    {form.height && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                        ≈ {form.height} cm
                      </span>
                    )}
                    {errors.height && <div style={{ color: 'var(--accent-danger)', fontSize: 13, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={13} /> {errors.height}</div>}
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: 20 }}>
                  <div className="form-group">
                    <label className="form-label">Weekly Gym Days *</label>
                    <select name="gymDays" value={form.gymDays} onChange={handleChange} className="form-control">
                      {[0, 1, 2, 3, 4, 5, 6, 7].map(d => (
                        <option key={d} value={d}>{d === 0 ? '0 days (Rest / Casual)' : `${d} days per week`}</option>
                      ))}
                    </select>
                    {errors.gymDays && <div style={{ color: 'var(--accent-danger)', fontSize: 13, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={13} /> {errors.gymDays}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Workout Intensity</label>
                    <select name="gymIntensity" value={form.gymIntensity} onChange={handleChange} className="form-control">
                      <option value="light">Light (Casual exercise / walking / yoga)</option>
                      <option value="moderate">Moderate (Regular gym / strength training)</option>
                      <option value="high">High (Heavy bodybuilding / intense lifting)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Fitness Goal</label>
                  <select name="goal" value={form.goal} onChange={handleChange} className="form-control">
                    <option value="fat_loss">Lose Fat & Get Lean</option>
                    <option value="maintain">Maintain Current Weight & Tone</option>
                    <option value="lean_bulk">Build Lean Muscle (Clean Gains)</option>
                    <option value="aggressive_bulk">Gain Weight & Bulk Up</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 3: Dietary & Medical */}
            {step === 3 && (
              <div style={{ animation: 'fadeInUp 0.35s ease both' }}>
                <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Leaf size={16} /> Dietary Blueprint & Allergies
                </h3>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Dietary Lifestyle</label>
                  <select name="dietaryPreferences" value={form.dietaryPreferences} onChange={handleChange} className="form-control">
                    <option value="">No specific preference (All foods)</option>
                    <option value="vegetarian">Vegetarian (No meat/fish)</option>
                    <option value="eggitarian">Eggitarian (Vegetarian + Eggs)</option>
                    <option value="vegan">Vegan (Plant-based only)</option>
                    <option value="gluten-free">Gluten Free</option>
                    <option value="keto">Keto (Low carb, high healthy fat)</option>
                    <option value="low-carb">Low Carb</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: 10, display: 'block' }}>
                    Food Allergies (Excluded from meal plans)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 }}>
                    {['Dairy', 'Nuts', 'Eggs', 'Soy', 'Gluten', 'Fish', 'Peanuts', 'None'].map(allergy => (
                      <label 
                        key={allergy} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          background: form.allergies.includes(allergy.toLowerCase()) ? 'rgba(245,158,11,0.14)' : 'var(--bg-surface-raised)',
                          border: form.allergies.includes(allergy.toLowerCase()) ? '1.5px solid var(--brand-primary, #F59E0B)' : '1px solid var(--border-subtle)',
                          borderRadius: 10,
                          padding: '10px 14px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={form.allergies.includes(allergy.toLowerCase())}
                          onChange={(e) => handleCheckboxChange('allergies', allergy.toLowerCase(), e.target.checked)}
                          style={{ accentColor: 'var(--brand-primary, #F59E0B)', width: 16, height: 16 }}
                        />
                        <span style={{ fontSize: 13, fontWeight: 700, color: form.allergies.includes(allergy.toLowerCase()) ? 'var(--brand-primary, #F59E0B)' : 'var(--text-primary)' }}>
                          {allergy}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Preferences & Budget */}
            {step === 4 && (
              <div style={{ animation: 'fadeInUp 0.35s ease both' }}>
                <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sliders size={16} /> Budget & Meal Prep
                </h3>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Cooking Experience Level</label>
                  <select name="cookingSkill" value={form.cookingSkill} onChange={handleChange} className="form-control">
                    <option value="no-cook">Beginner / Quick Assemble & No-Cook</option>
                    <option value="basic">Basic (Can boil eggs, prepare oats & 1-pot meals)</option>
                    <option value="moderate">Intermediate (Can prepare curries, stir-fries & paneer)</option>
                    <option value="advanced">Advanced (Roast, bake, grill complex meals)</option>
                  </select>
                </div>

                <div className="form-row" style={{ marginBottom: 20 }}>
                  <div className="form-group">
                    <label className="form-label">Monthly Grocery Budget (₹)</label>
                    <select name="budgetRange" value={form.budgetRange} onChange={handleChange} className="form-control">
                      <option value="tight">Tight Budget (₹3,000 - ₹5,000 / month)</option>
                      <option value="moderate">Moderate Budget (₹5,000 - ₹10,000 / month)</option>
                      <option value="flexible">Flexible Budget (₹10,000 - ₹15,000 / month)</option>
                      <option value="premium">Premium Budget (₹15,000+ / month)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Meal Prep Time Limit</label>
                    <select name="mealPrepTime" value={form.mealPrepTime} onChange={handleChange} className="form-control">
                      <option value="under_15_mins">Quick (under 15 mins)</option>
                      <option value="15_to_30_mins">Moderate (15 to 30 mins)</option>
                      <option value="30_to_60_mins">Standard (30 to 60 mins)</option>
                      <option value="above_60_mins">Dedicated (60+ mins)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              {step > 1 && (
                <button
                  key="back-btn"
                  type="button"
                  onClick={handleBack}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
              )}

              {step < 4 ? (
                <button
                  key="next-btn"
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  key="submit-btn"
                  type="submit"
                  disabled={loading}
                  className={loading ? "btn btn-primary btn-disabled" : "btn btn-primary"}
                  style={{ flex: 2, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Sparkles size={16} /> {loading ? 'Calibrating profile...' : 'Save & View Plan'}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
