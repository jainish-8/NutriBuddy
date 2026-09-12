import React, { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../config';
import { 
  Utensils, UtensilsCrossed, BarChart2, Dumbbell, User, Target, Leaf, 
  Sliders, Sparkles, AlertCircle, ArrowLeft, ArrowRight, Briefcase, ChevronDown
} from 'lucide-react';
import MobileSelectSheet from '../components/MobileSelectSheet';
import { 
  calculateTDEE, 
  calculateTargetCalories, 
  calculateMacros, 
  searchProfessions 
} from '../utils/nutritionEngine';

// Standardized options for mobile bottom-sheet picker
const GENDER_OPTIONS = [
  { value: 'male', label: 'Male', subtitle: 'Biological male metabolic rate' },
  { value: 'female', label: 'Female', subtitle: 'Biological female metabolic rate' }
];

const GYM_DAYS_OPTIONS = [
  { value: '0', label: '0 days (Rest / Casual)', subtitle: 'No structured gym lifting' },
  { value: '1', label: '1 day per week', subtitle: 'Light single weekend workout' },
  { value: '2', label: '2 days per week', subtitle: 'Bi-weekly stimulus' },
  { value: '3', label: '3 days per week', subtitle: 'Classic full-body routine' },
  { value: '4', label: '4 days per week', subtitle: 'Upper / Lower split' },
  { value: '5', label: '5 days per week', subtitle: 'Push / Pull / Legs + Upper / Lower' },
  { value: '6', label: '6 days per week', subtitle: 'Dedicated PPL hypertrophy cadence' },
  { value: '7', label: '7 days per week', subtitle: 'High frequency athletic protocol' }
];

const GYM_INTENSITY_OPTIONS = [
  { value: 'light', label: 'Light (Casual / Walking / Yoga)', subtitle: 'Low strain, mobility & light cardio' },
  { value: 'moderate', label: 'Moderate (Regular Gym / Strength)', subtitle: 'Standard compound lifting & progressive sets' },
  { value: 'high', label: 'High (Intense Bodybuilding / Heavy)', subtitle: 'RPE 8–10 heavy sets, high volume' }
];

const GOAL_OPTIONS = [
  { value: 'fat_loss', label: 'Lose Fat & Get Lean', subtitle: 'Moderate caloric deficit, preserve muscle tissue' },
  { value: 'maintain', label: 'Maintain Current Weight & Tone', subtitle: 'Isocaloric energy balance, body recomposition' },
  { value: 'lean_bulk', label: 'Build Lean Muscle (Clean Gains)', subtitle: 'Calibrated 200–300 kcal surplus' },
  { value: 'aggressive_bulk', label: 'Gain Weight & Bulk Up', subtitle: 'Substantial surplus for fast mass gain' }
];

const DIETARY_OPTIONS = [
  { value: '', label: 'No specific preference (All foods)', subtitle: 'All Indian foods, dairy, eggs, and meats' },
  { value: 'vegetarian', label: 'Vegetarian (No meat/fish)', subtitle: 'Plant foods, grains, pulses, dairy & paneer' },
  { value: 'eggitarian', label: 'Eggitarian (Vegetarian + Eggs)', subtitle: 'Vegetarian foundation plus whole & egg whites' },
  { value: 'vegan', label: 'Vegan (Plant-based only)', subtitle: '100% plant-derived foods, no dairy or animal products' },
  { value: 'gluten-free', label: 'Gluten Free', subtitle: 'Wheat, maida, and barley eliminated' },
  { value: 'keto', label: 'Keto (Low carb, healthy fat)', subtitle: 'High fat, moderate protein, very low carbohydrate' },
  { value: 'low-carb', label: 'Low Carb', subtitle: 'Reduced rotis/rice, elevated dal & protein' }
];

const CUISINE_OPTIONS = [
  { value: 'all', label: 'Universal Pan-Indian', subtitle: 'Balanced mix of dishes from all Indian regions' },
  { value: 'gujarati', label: 'Gujarati', subtitle: 'Thali, Thepla, Kathol, Dhokla, Khichdi' },
  { value: 'north', label: 'North Indian & Punjabi', subtitle: 'Rajma, Dal Makhani, Phulkas, Chhole, Paneer' },
  { value: 'south', label: 'South Indian', subtitle: 'Idli, Dosa, Sambar, Pesarattu, Curd Rice' },
  { value: 'west', label: 'Maharashtrian', subtitle: 'Poha, Pithla Bhakri, Sprouted Usal, Poli' },
  { value: 'east', label: 'East Indian', subtitle: 'Cholar Dal, Khichuri, Ghugni, Fish Curry' }
];

const COOKING_OPTIONS = [
  { value: 'no-cook', label: 'Beginner / Quick Assemble & No-Cook', subtitle: 'No cooking required; fruits, curd, nuts, sprouts' },
  { value: 'basic', label: 'Basic (Boil eggs, prepare oats & 1-pot meals)', subtitle: 'Simple boiling, basic rice & dal' },
  { value: 'moderate', label: 'Intermediate (Curries, stir-fries & paneer)', subtitle: 'Standard home-cooked Indian meals' },
  { value: 'advanced', label: 'Advanced (Roast, bake, grill complex meals)', subtitle: 'Complex Indian & global fitness cooking' }
];

const BUDGET_OPTIONS = [
  { value: 'tight', label: 'Tight Budget (₹3,000 - ₹5,000 / month)', subtitle: 'Budget-focused seasonal Indian staples' },
  { value: 'moderate', label: 'Moderate Budget (₹5,000 - ₹10,000 / month)', subtitle: 'Balanced whole-food Indian diet' },
  { value: 'flexible', label: 'Flexible Budget (₹10,000 - ₹15,000 / month)', subtitle: 'Premium dairy, whey, nuts & paneer' },
  { value: 'premium', label: 'Premium Budget (₹15,000+ / month)', subtitle: 'Unrestricted premium organic & high-protein foods' }
];

const PREP_TIME_OPTIONS = [
  { value: 'under_15_mins', label: 'Quick (under 15 mins)', subtitle: 'Rapid prep & 1-pot quick meals' },
  { value: '15_to_30_mins', label: 'Moderate (15 to 30 mins)', subtitle: 'Standard everyday Indian cooking' },
  { value: '30_to_60_mins', label: 'Standard (30 to 60 mins)', subtitle: 'Full multi-course meal preparation' },
  { value: 'above_60_mins', label: 'Dedicated (60+ mins)', subtitle: 'Slow-simmered & detailed batch-cooking' }
];

const getOptionLabel = (options, val, fallback = 'Select option') => {
  const match = options.find(o => String(o.value) === String(val));
  return match ? match.label : fallback;
};

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
    cuisinePreference: user?.cuisinePreference || 'all',
    allergies: user?.allergies || [],
    cookingSkill: user?.cookingSkill || 'basic',
    budgetRange: user?.budgetRange || 'moderate',
    mealPrepTime: user?.mealPrepTime || 'moderate'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null); // 'gender' | 'gymDays' | 'gymIntensity' | etc.

  // Profession live autocomplete search state
  const [showProfDropdown, setShowProfDropdown] = useState(false);
  const profDropdownRef = useRef(null);

  const profSuggestions = searchProfessions(form.profession);

  // Auto-scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Click or touch outside to close profession autocomplete
  useEffect(() => {
    const handleOutside = (e) => {
      if (profDropdownRef.current && !profDropdownRef.current.contains(e.target)) {
        setShowProfDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
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
        cuisinePreference: user.cuisinePreference || 'all',
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
    setShowProfDropdown(false);
    if (step === 1 && form.profession?.trim().toLowerCase() === 'st') {
      setForm(prev => ({ ...prev, profession: 'Student' }));
    }
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setShowProfDropdown(false);
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 4) return;
    if (!validateStep(4)) return;

    setLoading(true);

    const resolvedProfession = form.profession?.trim().toLowerCase() === 'st'
      ? 'Student'
      : (form.profession?.trim() || 'Student');

    // 1. Precise TDEE and BMR calculation through the scientific engine
    const tdeeResults = calculateTDEE({
      weight: form.weight,
      height: form.height,
      age: form.age,
      gender: form.gender,
      profession: resolvedProfession,
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
      profession: resolvedProfession,
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
            <div className="onboarding-feature-icon"><UtensilsCrossed size={18} /></div>
            <span>Smart meal suggestions & ingredient scaling</span>
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
                    background: step >= s ? 'var(--brand-primary)' : 'var(--bg-surface-raised)',
                    transition: 'background 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }} />
                  <span style={{ fontSize: 10, fontWeight: 800, color: step >= s ? 'var(--brand-primary-light)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {s === 1 ? 'Details' : s === 2 ? 'Biometrics' : s === 3 ? 'Dietary' : 'Budget'}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* STEP 1: Basic Identity & Profession */}
            {step === 1 && (
              <div style={{
                animation: 'fadeInUp 0.3s ease both',
                position: 'relative',
                zIndex: showProfDropdown ? 200 : 1,
                paddingBottom: showProfDropdown ? 120 : 10,
                transition: 'padding-bottom 0.25s ease'
              }}>
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
                    <button
                      type="button"
                      onClick={() => setActiveSheet('gender')}
                      className="form-select-trigger"
                    >
                      <span>{getOptionLabel(GENDER_OPTIONS, form.gender)}</span>
                      <ChevronDown size={16} color="var(--text-muted)" />
                    </button>
                  </div>
                </div>

                {/* Profession Input with Opaque High-Z Autocomplete Dropdown */}
                <div
                  className="form-group"
                  style={{
                    position: 'relative',
                    marginBottom: 24,
                    zIndex: showProfDropdown ? 300 : 1
                  }}
                  ref={profDropdownRef}
                >
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

                  {/* Autocomplete Dropdown */}
                  {showProfDropdown && profSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 10000,
                      background: '#12141A',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      borderRadius: 'var(--radius-panel, 12px)',
                      marginTop: 6,
                      boxShadow: '0 20px 48px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.08)',
                      maxHeight: 240,
                      overflowY: 'auto',
                      padding: 6
                    }}>
                      {profSuggestions.map((p, pIdx) => (
                        <div
                          key={pIdx}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectProfession(p);
                          }}
                          onClick={() => selectProfession(p)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-sm, 8px)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>{p.label}</span>
                          </div>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34D399',
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
              <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
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
                            background: heightUnit === 'cm' ? 'var(--brand-primary)' : 'transparent',
                            color: heightUnit === 'cm' ? '#ffffff' : 'var(--text-muted)'
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
                            background: heightUnit === 'ft_in' ? 'var(--brand-primary)' : 'transparent',
                            color: heightUnit === 'ft_in' ? '#ffffff' : 'var(--text-muted)'
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
                    <button
                      type="button"
                      onClick={() => setActiveSheet('gymDays')}
                      className={errors.gymDays ? "form-select-trigger error" : "form-select-trigger"}
                    >
                      <span>{getOptionLabel(GYM_DAYS_OPTIONS, form.gymDays)}</span>
                      <ChevronDown size={16} color="var(--text-muted)" />
                    </button>
                    {errors.gymDays && <div style={{ color: 'var(--accent-danger)', fontSize: 13, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={13} /> {errors.gymDays}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Workout Intensity</label>
                    <button
                      type="button"
                      onClick={() => setActiveSheet('gymIntensity')}
                      className="form-select-trigger"
                    >
                      <span>{getOptionLabel(GYM_INTENSITY_OPTIONS, form.gymIntensity)}</span>
                      <ChevronDown size={16} color="var(--text-muted)" />
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Fitness Goal</label>
                  <button
                    type="button"
                    onClick={() => setActiveSheet('goal')}
                    className="form-select-trigger"
                  >
                    <span>{getOptionLabel(GOAL_OPTIONS, form.goal)}</span>
                    <ChevronDown size={16} color="var(--text-muted)" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Dietary & Medical */}
            {step === 3 && (
              <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
                <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Leaf size={16} /> Dietary Blueprint & Allergies
                </h3>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Dietary Lifestyle</label>
                  <button
                    type="button"
                    onClick={() => setActiveSheet('dietaryPreferences')}
                    className="form-select-trigger"
                  >
                    <span>{getOptionLabel(DIETARY_OPTIONS, form.dietaryPreferences, 'No specific preference (All foods)')}</span>
                    <ChevronDown size={16} color="var(--text-muted)" />
                  </button>
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Regional Indian Cuisine Preference</label>
                  <button
                    type="button"
                    onClick={() => setActiveSheet('cuisinePreference')}
                    className="form-select-trigger"
                  >
                    <span>{getOptionLabel(CUISINE_OPTIONS, form.cuisinePreference, 'Universal Pan-Indian')}</span>
                    <ChevronDown size={16} color="var(--text-muted)" />
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: 10, display: 'block' }}>
                    Food Allergies (Excluded from meal plans)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 }}>
                    {['Dairy', 'Nuts', 'Eggs', 'Soy', 'Gluten', 'Fish', 'Peanuts', 'None'].map(allergy => (
                      <label 
                        key={allergy}
                        className="allergy-checkbox-tile"
                        style={{
                          background: form.allergies.includes(allergy.toLowerCase()) ? 'var(--brand-primary-subtle)' : 'var(--bg-surface-raised)',
                          border: form.allergies.includes(allergy.toLowerCase()) ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={form.allergies.includes(allergy.toLowerCase())}
                          onChange={(e) => handleCheckboxChange('allergies', allergy.toLowerCase(), e.target.checked)}
                          style={{ accentColor: 'var(--brand-primary)', width: 16, height: 16 }}
                        />
                        <span style={{ fontSize: 13, fontWeight: 700, color: form.allergies.includes(allergy.toLowerCase()) ? 'var(--brand-primary-light)' : 'var(--text-primary)' }}>
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
              <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
                <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sliders size={16} /> Budget & Meal Prep
                </h3>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Cooking Experience Level</label>
                  <button
                    type="button"
                    onClick={() => setActiveSheet('cookingSkill')}
                    className="form-select-trigger"
                  >
                    <span>{getOptionLabel(COOKING_OPTIONS, form.cookingSkill)}</span>
                    <ChevronDown size={16} color="var(--text-muted)" />
                  </button>
                </div>

                <div className="form-row" style={{ marginBottom: 20 }}>
                  <div className="form-group">
                    <label className="form-label">Monthly Grocery Budget (₹)</label>
                    <button
                      type="button"
                      onClick={() => setActiveSheet('budgetRange')}
                      className="form-select-trigger"
                    >
                      <span>{getOptionLabel(BUDGET_OPTIONS, form.budgetRange)}</span>
                      <ChevronDown size={16} color="var(--text-muted)" />
                    </button>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Meal Prep Time Limit</label>
                    <button
                      type="button"
                      onClick={() => setActiveSheet('mealPrepTime')}
                      className="form-select-trigger"
                    >
                      <span>{getOptionLabel(PREP_TIME_OPTIONS, form.mealPrepTime)}</span>
                      <ChevronDown size={16} color="var(--text-muted)" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons (Sticky Bottom on Mobile) */}
            <div className="onboarding-sticky-actions">
              {step > 1 && (
                <button
                  key="back-btn"
                  type="button"
                  onClick={handleBack}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 48 }}
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
                  style={{ flex: 2, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 48 }}
                >
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  key="submit-btn"
                  type="submit"
                  disabled={loading}
                  className={loading ? "btn btn-primary btn-disabled" : "btn btn-primary"}
                  style={{ flex: 2, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 48 }}
                >
                  <Sparkles size={16} /> {loading ? 'Calibrating profile...' : 'Save & View Plan'}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>

      {/* Reusable Mobile Bottom Sheet Dropdown Picker */}
      <MobileSelectSheet
        isOpen={Boolean(activeSheet)}
        onClose={() => setActiveSheet(null)}
        title={
          activeSheet === 'gender' ? 'Biological Sex' :
          activeSheet === 'gymDays' ? 'Weekly Gym Days' :
          activeSheet === 'gymIntensity' ? 'Workout Intensity' :
          activeSheet === 'goal' ? 'Your Fitness Goal' :
          activeSheet === 'dietaryPreferences' ? 'Dietary Lifestyle' :
          activeSheet === 'cuisinePreference' ? 'Regional Indian Cuisine' :
          activeSheet === 'cookingSkill' ? 'Cooking Experience' :
          activeSheet === 'budgetRange' ? 'Monthly Grocery Budget' :
          activeSheet === 'mealPrepTime' ? 'Meal Prep Time Limit' : ''
        }
        subtitle={
          activeSheet === 'gender' ? 'Used for accurate BMR & hormonal metabolic calculation' :
          activeSheet === 'gymDays' ? 'Select your target weekly lifting frequency' :
          activeSheet === 'gymIntensity' ? 'Helps calibrate training volume and fatigue recovery' :
          activeSheet === 'goal' ? 'Caloric target and macro split will adjust accordingly' :
          activeSheet === 'dietaryPreferences' ? 'Filters recipe engine and suggested ingredients' :
          activeSheet === 'cuisinePreference' ? 'Prioritizes regional flavors & staple ingredients' :
          activeSheet === 'cookingSkill' ? 'Recipes will match your kitchen preparation experience' :
          activeSheet === 'budgetRange' ? 'Meal suggestions balance cost vs macro density' :
          activeSheet === 'mealPrepTime' ? 'Determines prep complexity in your weekly plan' : ''
        }
        options={
          activeSheet === 'gender' ? GENDER_OPTIONS :
          activeSheet === 'gymDays' ? GYM_DAYS_OPTIONS :
          activeSheet === 'gymIntensity' ? GYM_INTENSITY_OPTIONS :
          activeSheet === 'goal' ? GOAL_OPTIONS :
          activeSheet === 'dietaryPreferences' ? DIETARY_OPTIONS :
          activeSheet === 'cuisinePreference' ? CUISINE_OPTIONS :
          activeSheet === 'cookingSkill' ? COOKING_OPTIONS :
          activeSheet === 'budgetRange' ? BUDGET_OPTIONS :
          activeSheet === 'mealPrepTime' ? PREP_TIME_OPTIONS : []
        }
        value={form[activeSheet] !== undefined ? String(form[activeSheet]) : ''}
        onChange={(val) => {
          setForm(prev => ({
            ...prev,
            [activeSheet]: activeSheet === 'gymDays' ? Number(val) : val
          }));
          if (errors[activeSheet]) {
            setErrors(prev => ({ ...prev, [activeSheet]: null }));
          }
        }}
      />
    </div>
  );
}
