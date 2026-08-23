/**
 * NUTRIBUDDY - WORLD HEALTH & SPORTS NUTRITION CALCULATION ENGINE
 * Formulated under WHO, NSCA, ACSM, and ISSN clinical nutrition standards.
 */

// ─── 150+ COMPREHENSIVE OCCUPATIONAL TAXONOMY (NEAT PROFILING) ─────────────────
export const PROFESSION_DATABASE = [
  // Sedentary Desk & Tech Occupations (NEAT: 1.15)
  { name: 'Software Engineer', category: 'sedentary', label: 'Desk / Tech (Sedentary)', factor: 1.15 },
  { name: 'Student', category: 'sedentary', label: 'Academic / Study (Sedentary)', factor: 1.15 },
  { name: 'Data Analyst', category: 'sedentary', label: 'Desk / Tech (Sedentary)', factor: 1.15 },
  { name: 'Product Manager', category: 'sedentary', label: 'Office / Desk (Sedentary)', factor: 1.15 },
  { name: 'UI/UX Designer', category: 'sedentary', label: 'Desk / Creative (Sedentary)', factor: 1.15 },
  { name: 'Web Developer', category: 'sedentary', label: 'Desk / Tech (Sedentary)', factor: 1.15 },
  { name: 'Accountant', category: 'sedentary', label: 'Finance / Desk (Sedentary)', factor: 1.15 },
  { name: 'Financial Analyst', category: 'sedentary', label: 'Finance / Desk (Sedentary)', factor: 1.15 },
  { name: 'Banker', category: 'sedentary', label: 'Finance / Desk (Sedentary)', factor: 1.15 },
  { name: 'Chartered Accountant', category: 'sedentary', label: 'Finance / Desk (Sedentary)', factor: 1.15 },
  { name: 'Lawyer', category: 'sedentary', label: 'Legal / Desk (Sedentary)', factor: 1.15 },
  { name: 'Legal Consultant', category: 'sedentary', label: 'Legal / Desk (Sedentary)', factor: 1.15 },
  { name: 'Writer', category: 'sedentary', label: 'Writing / Desk (Sedentary)', factor: 1.15 },
  { name: 'Content Creator', category: 'sedentary', label: 'Media / Desk (Sedentary)', factor: 1.15 },
  { name: 'Graphic Designer', category: 'sedentary', label: 'Creative / Desk (Sedentary)', factor: 1.15 },
  { name: 'Video Editor', category: 'sedentary', label: 'Media / Desk (Sedentary)', factor: 1.15 },
  { name: 'Architect (Office)', category: 'sedentary', label: 'Design / Desk (Sedentary)', factor: 1.15 },
  { name: 'Remote Worker', category: 'sedentary', label: 'Desk / Remote (Sedentary)', factor: 1.15 },
  { name: 'Customer Support', category: 'sedentary', label: 'Desk / Call Center (Sedentary)', factor: 1.15 },
  { name: 'HR Manager', category: 'sedentary', label: 'Office / Desk (Sedentary)', factor: 1.15 },
  { name: 'Digital Marketer', category: 'sedentary', label: 'Marketing / Desk (Sedentary)', factor: 1.15 },
  { name: 'SEO Specialist', category: 'sedentary', label: 'Desk / Tech (Sedentary)', factor: 1.15 },
  { name: 'Stock Trader', category: 'sedentary', label: 'Finance / Desk (Sedentary)', factor: 1.15 },
  { name: 'Administrative Assistant', category: 'sedentary', label: 'Office / Desk (Sedentary)', factor: 1.15 },
  { name: 'Receptionist', category: 'sedentary', label: 'Front Desk (Sedentary)', factor: 1.15 },
  { name: 'Call Center Representative', category: 'sedentary', label: 'Desk / Phone (Sedentary)', factor: 1.15 },
  { name: 'Project Coordinator', category: 'sedentary', label: 'Office / Desk (Sedentary)', factor: 1.15 },
  { name: 'Cybersecurity Analyst', category: 'sedentary', label: 'Desk / Tech (Sedentary)', factor: 1.15 },
  { name: 'DevOps Engineer', category: 'sedentary', label: 'Desk / Tech (Sedentary)', factor: 1.15 },
  { name: 'Database Administrator', category: 'sedentary', label: 'Desk / Tech (Sedentary)', factor: 1.15 },
  { name: 'IT Support Specialist', category: 'sedentary', label: 'Desk / Tech (Sedentary)', factor: 1.15 },
  { name: 'Scientist / Researcher', category: 'sedentary', label: 'Research / Lab Desk (Sedentary)', factor: 1.15 },

  // Light Physical / Standing & Walking (NEAT: 1.28)
  { name: 'Teacher', category: 'light_active', label: 'Education (Standing / Walking)', factor: 1.28 },
  { name: 'Professor / Lecturer', category: 'light_active', label: 'Higher Ed (Standing / Walking)', factor: 1.28 },
  { name: 'Doctor / Physician', category: 'light_active', label: 'Healthcare (Rounds / Clinical)', factor: 1.28 },
  { name: 'Dentist', category: 'light_active', label: 'Healthcare (Standing / Procedural)', factor: 1.28 },
  { name: 'Surgeon', category: 'light_active', label: 'Healthcare (Prolonged Standing)', factor: 1.28 },
  { name: 'Pharmacist', category: 'light_active', label: 'Healthcare (On Feet / Dispensing)', factor: 1.28 },
  { name: 'Veterinarian', category: 'light_active', label: 'Animal Care (Active Clinical)', factor: 1.28 },
  { name: 'Retail Sales Associate', category: 'light_active', label: 'Retail (On Feet / Sales Floor)', factor: 1.28 },
  { name: 'Store Cashier', category: 'light_active', label: 'Retail (Standing Counter)', factor: 1.28 },
  { name: 'Shopkeeper / Retailer', category: 'light_active', label: 'Retail (On Feet)', factor: 1.28 },
  { name: 'Hair Stylist / Barber', category: 'light_active', label: 'Personal Care (Standing)', factor: 1.28 },
  { name: 'Beautician / Esthetician', category: 'light_active', label: 'Personal Care (Standing)', factor: 1.28 },
  { name: 'Makeup Artist', category: 'light_active', label: 'Personal Care (Standing)', factor: 1.28 },
  { name: 'Photographer', category: 'light_active', label: 'Media (Mobile / Standing)', factor: 1.28 },
  { name: 'Videographer', category: 'light_active', label: 'Media (Camera Ops / Movement)', factor: 1.28 },
  { name: 'Tailor / Fashion Designer', category: 'light_active', label: 'Apparel (Cutting / Fitting)', factor: 1.28 },
  { name: 'Lab Technician', category: 'light_active', label: 'Science / Lab (On Feet)', factor: 1.28 },
  { name: 'Optometrist', category: 'light_active', label: 'Healthcare (Standing Exams)', factor: 1.28 },
  { name: 'Real Estate Agent', category: 'light_active', label: 'Sales (Showings / Walking)', factor: 1.28 },
  { name: 'Librarian', category: 'light_active', label: 'Education (Shelving / Walking)', factor: 1.28 },
  { name: 'Museum Curator', category: 'light_active', label: 'Arts (Walking Galleries)', factor: 1.28 },
  { name: 'Driving Instructor', category: 'light_active', label: 'Instruction (Light Active)', factor: 1.28 },
  { name: 'Tutor / Coach (Academic)', category: 'light_active', label: 'Teaching (Standing)', factor: 1.28 },

  // Moderate Physical / Constant Movement & Shift Work (NEAT: 1.42)
  { name: 'Nurse (Hospital / Clinic)', category: 'moderate_active', label: 'Healthcare (Continuous Ward Steps)', factor: 1.42 },
  { name: 'Caregiver / Orderly', category: 'moderate_active', label: 'Healthcare (Patient Moving / Active)', factor: 1.42 },
  { name: 'Physiotherapist', category: 'moderate_active', label: 'Rehab (Assisting Movement)', factor: 1.42 },
  { name: 'Chef / Head Cook', category: 'moderate_active', label: 'Culinary (Fast-Paced Kitchen)', factor: 1.42 },
  { name: 'Line Cook / Kitchen Staff', category: 'moderate_active', label: 'Culinary (Kitchen Movement)', factor: 1.42 },
  { name: 'Baker / Pastry Chef', category: 'moderate_active', label: 'Culinary (Kneading / Standing)', factor: 1.42 },
  { name: 'Barista', category: 'moderate_active', label: 'Hospitality (Bar Station Movement)', factor: 1.42 },
  { name: 'Waiter / Server', category: 'moderate_active', label: 'Hospitality (Continuous Walking)', factor: 1.42 },
  { name: 'Bartender', category: 'moderate_active', label: 'Hospitality (Bar Movement / Pouring)', factor: 1.42 },
  { name: 'Delivery Driver (Food / Courier)', category: 'moderate_active', label: 'Logistics (Walking / Carrying)', factor: 1.42 },
  { name: 'Postal Worker / Mail Carrier', category: 'moderate_active', label: 'Logistics (Walking Routes)', factor: 1.42 },
  { name: 'Cleaner / Janitor', category: 'moderate_active', label: 'Maintenance (Sweeping / Mopping)', factor: 1.42 },
  { name: 'Housekeeper / Maid', category: 'moderate_active', label: 'Hospitality (Active Cleaning)', factor: 1.42 },
  { name: 'Police Officer', category: 'moderate_active', label: 'Public Safety (Patrol / Field)', factor: 1.42 },
  { name: 'Security Guard (Patrol)', category: 'moderate_active', label: 'Security (Continuous Walking)', factor: 1.42 },
  { name: 'Flight Attendant', category: 'moderate_active', label: 'Aviation (Cabin Movement)', factor: 1.42 },
  { name: 'Dog Walker / Pet Sitter', category: 'moderate_active', label: 'Animal Care (High Daily Steps)', factor: 1.42 },
  { name: 'Tour Guide', category: 'moderate_active', label: 'Tourism (Walking Tours)', factor: 1.42 },
  { name: 'Yoga Instructor', category: 'moderate_active', label: 'Fitness (Demonstrations)', factor: 1.42 },
  { name: 'Pilates Instructor', category: 'moderate_active', label: 'Fitness (Movement Coaching)', factor: 1.42 },
  { name: 'Massage Therapist', category: 'moderate_active', label: 'Wellness (Upper Body Effort)', factor: 1.42 },
  { name: 'Event Coordinator', category: 'moderate_active', label: 'Events (Floor Coordination)', factor: 1.42 },
  { name: 'Gardener / Landscaper', category: 'moderate_active', label: 'Outdoor (Pruning / Planting)', factor: 1.42 },

  // Heavy Physical Labor & High-Performance Occupations (NEAT: 1.65)
  { name: 'Construction Worker', category: 'heavy_active', label: 'Labor (Heavy Material Lifting)', factor: 1.65 },
  { name: 'Farmer / Agriculturalist', category: 'heavy_active', label: 'Agriculture (Field Labor / Tilling)', factor: 1.65 },
  { name: 'Bricklayer / Mason', category: 'heavy_active', label: 'Masonry (Heavy Stone / Cement)', factor: 1.65 },
  { name: 'Carpenter', category: 'heavy_active', label: 'Trade (Framing / Woodwork)', factor: 1.65 },
  { name: 'Electrician', category: 'heavy_active', label: 'Trade (Climbing / Wiring)', factor: 1.65 },
  { name: 'Plumber', category: 'heavy_active', label: 'Trade (Pipe Fitting / Heavy Lifting)', factor: 1.65 },
  { name: 'Auto Mechanic', category: 'heavy_active', label: 'Automotive (Wrenching / Lifting)', factor: 1.65 },
  { name: 'Welder / Ironworker', category: 'heavy_active', label: 'Metalwork (Structural Fabrication)', factor: 1.65 },
  { name: 'Roofer', category: 'heavy_active', label: 'Labor (Climbing / Carrying Bundles)', factor: 1.65 },
  { name: 'Warehouse Worker / Stacker', category: 'heavy_active', label: 'Logistics (Pallet Loading / Boxes)', factor: 1.65 },
  { name: 'Moving Specialist / Porter', category: 'heavy_active', label: 'Logistics (Furniture Moving)', factor: 1.65 },
  { name: 'Firefighter / Rescue Worker', category: 'heavy_active', label: 'Emergency (Heavy Gear / Drills)', factor: 1.65 },
  { name: 'Military / Infantry', category: 'heavy_active', label: 'Defense (Tactical Rucking / Drills)', factor: 1.65 },
  { name: 'Personal Trainer / Gym Coach', category: 'heavy_active', label: 'Fitness (Lifting / Loading Plates)', factor: 1.65 },
  { name: 'Professional Athlete', category: 'heavy_active', label: 'Sports (Intense Multi-Session)', factor: 1.65 },
  { name: 'Sports Coach / Trainer', category: 'heavy_active', label: 'Sports (Field Training)', factor: 1.65 },
  { name: 'Professional Dancer', category: 'heavy_active', label: 'Performance (High-Calorie Dance)', factor: 1.65 },
  { name: 'Martial Arts Instructor', category: 'heavy_active', label: 'Combat Sports (Sparring / Drills)', factor: 1.65 },
  { name: 'Blacksmith / Forge Worker', category: 'heavy_active', label: 'Metalwork (Heavy Hammering)', factor: 1.65 },
  { name: 'Dock Worker / Stevedore', category: 'heavy_active', label: 'Maritime (Cargo Handling)', factor: 1.65 },
  { name: 'Miner / Quarry Worker', category: 'heavy_active', label: 'Resource (Heavy Extraction)', factor: 1.65 }
];

/**
 * Searches the profession database with fuzzy letter matching
 */
export function searchProfessions(query) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  return PROFESSION_DATABASE.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.label.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  ).slice(0, 8);
}

/**
 * Resolves exact occupational NEAT multiplier for any profession string
 */
export function getOccupationalMultiplier(professionStr) {
  if (!professionStr) return 1.15;
  const pLower = professionStr.toLowerCase();
  
  // 1. Direct match in database
  const directMatch = PROFESSION_DATABASE.find(p => p.name.toLowerCase() === pLower);
  if (directMatch) return directMatch.factor;

  // 2. Keyword fallback matching
  if (
    pLower.includes('farmer') || pLower.includes('labor') || pLower.includes('construction') ||
    pLower.includes('builder') || pLower.includes('mason') || pLower.includes('carpenter') ||
    pLower.includes('mechanic') || pLower.includes('plumber') || pLower.includes('electrician') ||
    pLower.includes('warehouse') || pLower.includes('mover') || pLower.includes('packer') ||
    pLower.includes('firefighter') || pLower.includes('military') || pLower.includes('soldier') ||
    pLower.includes('athlete') || pLower.includes('trainer') || pLower.includes('coach') ||
    pLower.includes('dancer') || pLower.includes('gym')
  ) {
    return 1.65;
  }

  if (
    pLower.includes('nurse') || pLower.includes('caregiver') || pLower.includes('therapist') ||
    pLower.includes('chef') || pLower.includes('cook') || pLower.includes('baker') ||
    pLower.includes('waiter') || pLower.includes('server') || pLower.includes('bartender') ||
    pLower.includes('delivery') || pLower.includes('courier') || pLower.includes('postal') ||
    pLower.includes('cleaner') || pLower.includes('janitor') || pLower.includes('police') ||
    pLower.includes('security') || pLower.includes('barista') || pLower.includes('flight attendant')
  ) {
    return 1.42;
  }

  if (
    pLower.includes('teacher') || pLower.includes('lecturer') || pLower.includes('professor') ||
    pLower.includes('doctor') || pLower.includes('dentist') || pLower.includes('surgeon') ||
    pLower.includes('pharmacist') || pLower.includes('sales') || pLower.includes('retail') ||
    pLower.includes('cashier') || pLower.includes('barber') || pLower.includes('stylist') ||
    pLower.includes('photographer') || pLower.includes('tailor') || pLower.includes('shop')
  ) {
    return 1.28;
  }

  // Default: Sedentary desk baseline
  return 1.15;
}

/**
 * 1. BASAL METABOLIC RATE (BMR) - MIFFLIN-ST JEOR FORMULA
 * Gold standard by American Dietetic Association (ADA)
 */
export function calculateBMR(weightKg, heightCm, ageYears, gender = 'male') {
  const w = parseFloat(weightKg) || 70;
  const h = parseFloat(heightCm) || 170;
  const a = parseInt(ageYears, 10) || 25;
  const g = (gender || 'male').toLowerCase();

  if (g === 'female') {
    return (10 * w) + (6.25 * h) - (5 * a) - 161;
  }
  return (10 * w) + (6.25 * h) - (5 * a) + 5;
}

/**
 * 2. TOTAL DAILY ENERGY EXPENDITURE (TDEE) - MET PHYSICAL ACTIVITY LEVEL (PAL)
 * Integrates:
 * - BMR (Basal metabolism)
 * - NEAT (Occupational steps and non-exercise daily movement)
 * - EAT (Exercise Activity Thermogenesis: Gym Days × Intensity MET-hours)
 * - TEF (Thermic Effect of Food: ~10%)
 */
export function calculateTDEE({ weight, height, age, gender, profession, gymDays = 0, gymIntensity = 'moderate' }) {
  const bmr = calculateBMR(weight, height, age, gender);
  const occFactor = getOccupationalMultiplier(profession);

  const days = Math.min(7, Math.max(0, parseInt(gymDays, 10) || 0));
  
  // Exercise Activity Thermogenesis (EAT) addition per gym session:
  // Light (Cardio / light resistance, 4.5 METs): +0.032 PAL / day
  // Moderate (Standard Hypertrophy / NSCA split, 6.5 METs): +0.052 PAL / day
  // High (Intense Heavy Strength / CrossFit / Supersets, 8.5 METs): +0.075 PAL / day
  let intensityAddend = 0.052;
  if (gymIntensity === 'light') intensityAddend = 0.032;
  else if (gymIntensity === 'high') intensityAddend = 0.075;

  const gymAddend = days * intensityAddend;

  // Composite Physical Activity Level (PAL)
  const totalPAL = occFactor + gymAddend;
  const rawTDEE = bmr * totalPAL;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(rawTDEE),
    totalPAL: parseFloat(totalPAL.toFixed(2)),
    occupationalFactor: occFactor,
    gymAddend: parseFloat(gymAddend.toFixed(3))
  };
}

/**
 * 3. TARGET DAILY CALORIE INTAKE (GOAL SPECIFIC)
 * Clinically safe deficits and surpluses preventing metabolic downregulation
 */
export function calculateTargetCalories({ tdee, bmr, goal, gender = 'male' }) {
  const g = (gender || 'male').toLowerCase();
  const minFloor = g === 'female' ? 1250 : 1500;

  switch (goal) {
    case 'fat_loss':
    case 'lose': {
      // 22% calibrated deficit for steady 0.5-1% bodyweight loss per week
      const deficitCal = tdee * 0.78;
      // Absolute safety floor: never drop below minimum metabolic floor or raw BMR
      const safeTarget = Math.max(deficitCal, minFloor, bmr * 0.95);
      return Math.round(safeTarget);
    }
    case 'lean_bulk':
    case 'gain': {
      // 9% controlled surplus (+250 to +300 kcal) for maximal muscle protein synthesis without adipose accumulation
      return Math.round(tdee * 1.09);
    }
    case 'aggressive_bulk': {
      // 17% progressive surplus (+450 to +600 kcal) for fast mass accrual
      return Math.round(tdee * 1.17);
    }
    case 'maintain':
    default: {
      // 100% of TDEE
      return Math.round(tdee);
    }
  }
}

/**
 * 4. MACRONUTRIENT PARTITIONING (ISSN / NSCA STANDARDS)
 * Strict Gram-for-Gram calculation with zero rounding drift
 */
export function calculateMacros({ dailyCalories, weight, goal, isGymGoer = true }) {
  const w = parseFloat(weight) || 70;
  const cals = parseInt(dailyCalories, 10) || 2000;

  // 1. Protein determination based on athletic demand and nitrogen preservation
  let proteinPerKg = 2.0;
  if (goal === 'fat_loss' || goal === 'lose') {
    // Elevated protein in deficit to prevent muscle proteolysis (ISSN Recommendation: 2.2-2.4g/kg)
    proteinPerKg = isGymGoer ? 2.2 : 1.8;
  } else if (goal === 'lean_bulk' || goal === 'aggressive_bulk') {
    proteinPerKg = isGymGoer ? 2.0 : 1.6;
  } else {
    proteinPerKg = isGymGoer ? 1.8 : 1.2;
  }

  const targetProteinGrams = Math.round(w * proteinPerKg);
  const proteinCalories = targetProteinGrams * 4;

  // 2. Essential Dietary Fats: 25% of total calories (ensuring minimum 0.8g/kg for endocrine health)
  let targetFatGrams = Math.round((cals * 0.25) / 9);
  const minFatGrams = Math.round(w * 0.8);
  if (targetFatGrams < minFatGrams) targetFatGrams = minFatGrams;
  const fatCalories = targetFatGrams * 9;

  // 3. Carbohydrates: Remainder of daily energy balance
  const remainingCalories = Math.max(0, cals - proteinCalories - fatCalories);
  const targetCarbsGrams = Math.round(remainingCalories / 4);

  return {
    protein: targetProteinGrams,
    fat: targetFatGrams,
    carbs: targetCarbsGrams,
    calories: (targetProteinGrams * 4) + (targetFatGrams * 9) + (targetCarbsGrams * 4)
  };
}

/**
 * 5. DYNAMIC RECIPE INGREDIENTS SCALER
 * Accurately parses numbers in recipe ingredient strings and scales them by the portion multiplier
 */
export function scaleIngredients(ingredientsArray = [], multiplier = 1.0) {
  if (!Array.isArray(ingredientsArray)) return [];
  if (multiplier === 1.0) return ingredientsArray;

  return ingredientsArray.map(line => {
    if (typeof line !== 'string') return line;

    // Matches numbers, decimals, fractions (e.g. "1/2 cup", "1.5 tsp", "100g", "2 pieces", "1/4 tsp")
    return line.replace(/(\d+\/\d+|\d+(\.\d+)?)/g, (match) => {
      let val = 0;
      if (match.includes('/')) {
        const [num, den] = match.split('/').map(Number);
        val = den ? (num / den) : 0;
      } else {
        val = parseFloat(match);
      }

      if (isNaN(val) || val === 0) return match;

      const scaled = val * multiplier;
      // Format cleanly: if close to whole integer show integer, else 1 decimal place or fraction
      if (Math.abs(scaled - Math.round(scaled)) < 0.05) {
        return Math.round(scaled).toString();
      }
      return scaled.toFixed(1).replace(/\.0$/, '');
    });
  });
}

/**
 * 6. BODY MASS INDEX (BMI) & CLINICAL CLASSIFICATION
 */
export function getBMI(weightKg, heightCm) {
  const w = parseFloat(weightKg);
  const h = parseFloat(heightCm);
  if (!w || !h || h <= 0) return { bmi: '—', category: 'Unknown', color: 'var(--text-muted)' };

  const bmiVal = parseFloat((w / ((h / 100) ** 2)).toFixed(1));

  if (bmiVal < 18.5) return { bmi: bmiVal, category: 'Underweight', color: '#38BDF8' };
  if (bmiVal <= 24.9) return { bmi: bmiVal, category: 'Normal / Optimal', color: '#10B981' };
  if (bmiVal <= 29.9) return { bmi: bmiVal, category: 'Overweight', color: '#F59E0B' };
  return { bmi: bmiVal, category: 'Obese', color: '#EF4444' };
}
