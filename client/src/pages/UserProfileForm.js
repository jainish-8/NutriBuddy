import React, { useState, useEffect } from 'react';

export default function UserProfileForm({ user, setUser, setCurrentPage }) {
  const [step, setStep] = useState(1);
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

  // Auto-scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

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
    // Clear error for that field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
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

  // Validate fields for a given step
  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!form.fullName.trim()) newErrors.fullName = 'Full Name is required';
      if (!form.age || form.age < 1 || form.age > 120) newErrors.age = 'Valid age (1-120) is required';
      if (!form.profession.trim()) newErrors.profession = 'Profession is required';
    }
    if (currentStep === 2) {
      if (!form.weight || form.weight < 1 || form.weight > 300) newErrors.weight = 'Valid weight (kg) is required';
      if (!form.height || form.height < 1 || form.height > 250) newErrors.height = 'Valid height (cm) is required';
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
    if (step < 4) {
      return; 
    }
    if (!validateStep(4)) return;

    setLoading(true);
    
    // 1. Calculate BMR using Mifflin-St Jeor Equation
    const weight = parseFloat(form.weight) || 70;
    const height = parseFloat(form.height) || 170;
    const age = parseInt(form.age) || 25;
    
    const bmr = form.gender === 'male' 
      ? (10 * weight) + (6.25 * height) - (5 * age) + 5
      : (10 * weight) + (6.25 * height) - (5 * age) - 161;

    // 2. Occupational Multiplier (Implicit NEAT tracking determined by profession)
    const prof = (form.profession || '').toLowerCase();
    let occupationalMultiplier = 1.00;
    
    // Level 4: Heavy Physical / Manual Labor (1.50 multiplier)
    if (
      prof.includes('farmer') || prof.includes('farming') || prof.includes('agriculture') || prof.includes('cultivator') || prof.includes('grower') ||
      prof.includes('labor') || prof.includes('construction') || prof.includes('builder') || prof.includes('brick') || prof.includes('mason') ||
      prof.includes('carpenter') || prof.includes('roofer') || prof.includes('welder') || prof.includes('blacksmith') || prof.includes('ironworker') ||
      prof.includes('plumber') || prof.includes('electrician') || prof.includes('mechanic') || prof.includes('hvac') || prof.includes('handyman') ||
      prof.includes('warehouse') || prof.includes('dock') || prof.includes('packer') || prof.includes('mover') || prof.includes('heavy') ||
      prof.includes('miner') || prof.includes('logging') || prof.includes('lumberjack') || prof.includes('quarry') ||
      prof.includes('soldier') || prof.includes('military') || prof.includes('infantry') || prof.includes('firefighter') || prof.includes('rescuer') ||
      prof.includes('dancer') || prof.includes('choreographer') || prof.includes('gym coach') || prof.includes('fitness coach') ||
      prof.includes('trainer') || prof.includes('athlete') || prof.includes('sports') || prof.includes('player')
    ) {
      occupationalMultiplier = 1.50;
    } 
    // Level 3: Moderate Physical / Constant Moving & Standing (1.30 multiplier)
    else if (
      prof.includes('nurse') || prof.includes('caregiver') || prof.includes('orderly') || prof.includes('therapist') ||
      prof.includes('delivery') || prof.includes('courier') || prof.includes('mail') || prof.includes('postal') ||
      prof.includes('cleaner') || prof.includes('janitor') || prof.includes('housekeeper') || prof.includes('maid') || prof.includes('custodian') ||
      prof.includes('police') || prof.includes('sheriff') || prof.includes('security') || prof.includes('patrol') ||
      prof.includes('waiter') || prof.includes('waitress') || prof.includes('server') || prof.includes('bartender') ||
      prof.includes('dog walker') || prof.includes('tour guide') || prof.includes('flight attendant')
    ) {
      occupationalMultiplier = 1.30;
    } 
    // Level 2: Light Physical / Standing & Walking (1.15 multiplier)
    else if (
      prof.includes('teacher') || prof.includes('lecturer') || prof.includes('instructor') || prof.includes('tutor') ||
      prof.includes('chef') || prof.includes('cook') || prof.includes('baker') || prof.includes('kitchen') || prof.includes('barista') ||
      prof.includes('sales') || prof.includes('retail') || prof.includes('cashier') || prof.includes('shop') || prof.includes('store') ||
      prof.includes('doctor') || prof.includes('dentist') || prof.includes('surgeon') || prof.includes('pharmacist') || prof.includes('veterinarian') ||
      prof.includes('barber') || prof.includes('hair') || prof.includes('beautician') || prof.includes('makeup') ||
      prof.includes('photographer') || prof.includes('camera') || prof.includes('tailor') || prof.includes('dressmaker')
    ) {
      occupationalMultiplier = 1.15;
    } 
    // Level 1: Sedentary / Sitting (1.00 multiplier)
    else {
      // Default fallback is 1.00 (Students, Coder, Desk job, etc.)
      occupationalMultiplier = 1.00;
    }

    // 3. Gym Multiplier
    const gymDays = parseInt(form.gymDays) || 0;
    let intensityModifier = 0.06;
    if (form.gymIntensity === 'light') intensityModifier = 0.04;
    else if (form.gymIntensity === 'high') intensityModifier = 0.08;
    const gymMultiplier = 1.2 + (gymDays * intensityModifier);

    // 4. Daily Calorie Target (TDEE = BMR * Occupational * Gym)
    const tdee = bmr * occupationalMultiplier * gymMultiplier;

    let targetCalories = tdee;
    let proteinPerKg = 2.0;

    if (form.goal === 'fat_loss') {
      targetCalories = tdee * 0.78; // Rigid 22% Deficit
      proteinPerKg = 2.2;
    } else if (form.goal === 'maintain') {
      targetCalories = tdee * 1.00;
      proteinPerKg = 2.0;
    } else if (form.goal === 'lean_bulk') {
      targetCalories = tdee * 1.08; // Rigid 8% Surplus
      proteinPerKg = 2.0;
    } else if (form.goal === 'aggressive_bulk') {
      targetCalories = tdee * 1.18; // Rigid 18% Surplus
      proteinPerKg = 2.0;
    }

    // 5. Rounding Leak Protection Loop (Strict Macro Match)
    const dailyCalories = Math.round(targetCalories);
    const targetProtein = Math.round(weight * proteinPerKg);
    const targetFat = Math.round((dailyCalories * 0.25) / 9);

    // Deduct Protein and Fat calorie contributions, remainder goes to Carbohydrates
    const remainingCalories = dailyCalories - (targetProtein * 4) - (targetFat * 9);
    const targetCarbs = Math.round(remainingCalories / 4);

    const isGymGoer = gymDays > 0;

    const userData = {
      ...form,
      id: user?.id || Date.now(),
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      dailyCalories,
      targetProtein,
      targetFat,
      targetCarbs,
      isGymGoer,
      createdAt: user?.createdAt || new Date().toISOString()
    };

    try {
      const response = await fetch('http://localhost:5000/api/user-profile', {
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
      // Fallback to local state processing
      setUser(userData);
      setCurrentPage('dashboard');
      console.log('Using local storage fallback', error);
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
          Your AI-powered nutrition companion. Smart meal planning, calorie tracking & health goals — all in one place.
        </p>

        <div className="onboarding-left-features">
          <div className="onboarding-feature-pill">
            <div className="onboarding-feature-icon">🍽️</div>
            <span>Personalized meal plans within your budget</span>
          </div>
          <div className="onboarding-feature-pill">
            <div className="onboarding-feature-icon">📊</div>
            <span>Real-time calorie & macro tracking</span>
          </div>
          <div className="onboarding-feature-pill">
            <div className="onboarding-feature-icon">🏋️</div>
            <span>Exercise logging & fitness goals</span>
          </div>
          <div className="onboarding-feature-pill">
            <div className="onboarding-feature-icon">🤖</div>
            <span>AI health assistant & smart suggestions</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Form */}
      <div className="onboarding-right">
        <div className="onboarding-right-inner">

          <h2 style={{ marginBottom: 6, fontSize: 'clamp(20px, 3vw, 28px)', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
            {user ? 'Update Your Profile' : 'Create Your Profile'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 28 }}>
            Step {step} of 4 — {
              step === 1 ? 'Basic Identity' : 
              step === 2 ? 'Biometrics & Routine' : 
              step === 3 ? 'Dietary & Medical' : 
              'Preferences & Budget'
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
                    background: step >= s ? 'var(--accent-lavender-text)' : 'var(--bg-surface-raised)',
                    transition: 'background 0.4s ease'
                  }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: step >= s ? 'var(--accent-lavender-text)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {s === 1 ? 'Basics' : s === 2 ? 'Biometrics' : s === 3 ? 'Dietary' : 'Preferences'}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* STEP 1: Basic Identity */}
            {step === 1 && (
              <div style={{ animation: 'fadeInUp 0.35s ease both' }}>
                <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>👤 Tell us about yourself</h3>

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
                  {errors.fullName && <div style={{ color: 'var(--accent-danger)', fontSize: 13, marginTop: 4 }}>⚠️ {errors.fullName}</div>}
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
                    {errors.age && <div style={{ color: 'var(--accent-danger)', fontSize: 13, marginTop: 4 }}>⚠️ {errors.age}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange} className="form-control">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Profession / Occupation *</label>
                  <input
                    type="text"
                    name="profession"
                    value={form.profession}
                    onChange={handleChange}
                    placeholder="e.g. Student, Software Engineer, Teacher, Nurse, Builder"
                    className={errors.profession ? "form-control error" : "form-control"}
                  />
                  {errors.profession && <div style={{ color: 'var(--accent-danger)', fontSize: 13, marginTop: 4 }}>⚠️ {errors.profession}</div>}
                </div>
              </div>
            )}

            {/* STEP 2: Biometrics & Routine */}
            {step === 2 && (
              <div style={{ animation: 'fadeInUp 0.35s ease both' }}>
                <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>🎯 Biometrics & Activity Routine</h3>

                <div className="form-row" style={{ marginBottom: 20 }}>
                  <div className="form-group">
                    <label className="form-label">Weight (kg) *</label>
                    <input
                      type="number"
                      name="weight"
                      value={form.weight}
                      onChange={handleChange}
                      placeholder="Weight in kg"
                      className={errors.weight ? "form-control error" : "form-control"}
                    />
                    {errors.weight && <div style={{ color: 'var(--accent-danger)', fontSize: 13, marginTop: 4 }}>⚠️ {errors.weight}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Height (cm) *</label>
                    <input
                      type="number"
                      name="height"
                      value={form.height}
                      onChange={handleChange}
                      placeholder="Height in cm"
                      className={errors.height ? "form-control error" : "form-control"}
                    />
                    {errors.height && <div style={{ color: 'var(--accent-danger)', fontSize: 13, marginTop: 4 }}>⚠️ {errors.height}</div>}
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: 20 }}>
                  <div className="form-group">
                    <label className="form-label">Gym Days / Week *</label>
                    <select name="gymDays" value={form.gymDays} onChange={handleChange} className="form-control">
                      {[0, 1, 2, 3, 4, 5, 6, 7].map(d => (
                        <option key={d} value={d}>{d} days</option>
                      ))}
                    </select>
                    {errors.gymDays && <div style={{ color: 'var(--accent-danger)', fontSize: 13, marginTop: 4 }}>⚠️ {errors.gymDays}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gym Intensity</label>
                    <select name="gymIntensity" value={form.gymIntensity} onChange={handleChange} className="form-control">
                      <option value="light">Light (cardio / light weights)</option>
                      <option value="moderate">Moderate (regular strength training)</option>
                      <option value="high">High (heavy bodybuilding / high intensity)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Goal</label>
                  <select name="goal" value={form.goal} onChange={handleChange} className="form-control">
                    <option value="fat_loss">Fat Loss (22% Deficit)</option>
                    <option value="maintain">Maintenance (TDEE)</option>
                    <option value="lean_bulk">Lean Bulk (8% Surplus)</option>
                    <option value="aggressive_bulk">Aggressive Bulk (18% Surplus)</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 3: Dietary & Medical */}
            {step === 3 && (
              <div style={{ animation: 'fadeInUp 0.35s ease both' }}>
                <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>🥗 Dietary & Allergies</h3>

                <div className="form-group">
                  <label className="form-label">Dietary Preferences</label>
                  <select name="dietaryPreferences" value={form.dietaryPreferences} onChange={handleChange} className="form-control">
                    <option value="">No specific preference (Veg + Non-Veg)</option>
                    <option value="vegetarian">Vegetarian (No meat/fish)</option>
                    <option value="vegan">Vegan (Plant-based only)</option>
                    <option value="keto">Keto Diet (High fat, low carb)</option>
                    <option value="low-carb">Low Carb (Reduced carb intake)</option>
                    <option value="gluten-free">Gluten Free</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                    Food Allergies (select if applicable)
                  </label>
                  <div className="checkbox-grid">
                    {['Dairy', 'Nuts', 'Eggs', 'Soy', 'Gluten', 'Fish', 'Peanuts', 'None'].map(allergy => (
                      <label key={allergy} className="checkbox-pill">
                        <input
                          type="checkbox"
                          checked={form.allergies.includes(allergy.toLowerCase())}
                          onChange={(e) => handleCheckboxChange('allergies', allergy.toLowerCase(), e.target.checked)}
                        />
                        <span>{allergy}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Preferences & Budget */}
            {step === 4 && (
              <div style={{ animation: 'fadeInUp 0.35s ease both' }}>
                <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>🛠️ Preferences & Budget</h3>

                <div className="form-group">
                  <label className="form-label">Cooking Experience Level</label>
                  <select name="cookingSkill" value={form.cookingSkill} onChange={handleChange} className="form-control">
                    <option value="no-cook">Beginner / No Cooking Needed</option>
                    <option value="basic">Basic (Can boil, make 1-pot meals)</option>
                    <option value="moderate">Intermediate (Can prepare curries/stir-fries)</option>
                    <option value="advanced">Advanced (Roast, bake, grill complex dishes)</option>
                  </select>
                </div>

                <div className="form-row" style={{ marginBottom: 20 }}>
                  <div className="form-group">
                    <label className="form-label">Target Monthly Food Budget</label>
                    <select name="budgetRange" value={form.budgetRange} onChange={handleChange} className="form-control">
                      <option value="tight">Tight (₹3,000 - ₹5,000)</option>
                      <option value="moderate">Moderate (₹5,000 - ₹10,000)</option>
                      <option value="flexible">Flexible (₹10,000 - ₹15,000)</option>
                      <option value="premium">Premium (₹15,000+)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Meal Prep Time Limit</label>
                    <select name="mealPrepTime" value={form.mealPrepTime} onChange={handleChange} className="form-control">
                      <option value="under_15_mins">Quick (under 15 mins)</option>
                      <option value="15_to_30_mins">Moderate (15 to 30 mins)</option>
                      <option value="30_to_60_mins">Detailed (30 to 60 mins)</option>
                      <option value="above_60_mins">Gourmet (60+ mins)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Control Action Buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              {step > 1 && (
                <button
                  key="back-btn"
                  type="button"
                  onClick={handleBack}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '14px 20px' }}
                >
                  ← Back
                </button>
              )}

              {step < 4 ? (
                <button
                  key="next-btn"
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '14px 20px' }}
                >
                  Continue →
                </button>
              ) : (
                <button
                  key="submit-btn"
                  type="submit"
                  disabled={loading}
                  className={loading ? "btn btn-primary btn-disabled" : "btn btn-primary"}
                  style={{ flex: 2, padding: '14px 20px' }}
                >
                  {loading ? 'Setting up your profile...' : '🚀 Start Your Journey'}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
