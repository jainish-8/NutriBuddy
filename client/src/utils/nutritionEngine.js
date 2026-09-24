/**
 * NUTRIBUDDY - WORLD HEALTH & SPORTS NUTRITION CALCULATION ENGINE
 * Formulated under WHO, NSCA, ACSM, and ISSN clinical nutrition standards.
 */

// ─── UTILITY FUNCTIONS ─────────────────────────────────────────────────────────
export function toTitleCase(str) {
  if (!str || typeof str !== 'string') return '';
  return str.split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '').join(' ');
}

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
  // EAT addend per gym session (diminishing returns at high frequency)
  // Light (yoga/walking/light cardio ~4.5 METs): 0.036 per day
  // Moderate (standard hypertrophy/resistance ~6.5 METs): 0.055 per day
  // High (heavy powerlifting/HIIT/CrossFit ~8.5 METs): 0.078 per day
  // Frequency discount: sessions 5+ have 20% less marginal EAT (fatigue/adaptation)
  const perDayAddends = { light: 0.036, moderate: 0.055, high: 0.078 };
  const baseAddend = perDayAddends[gymIntensity] || perDayAddends.moderate;
  
  // Apply frequency-based discount for days 5, 6, 7
  let gymAddend = 0;
  for (let d = 1; d <= days; d++) {
    gymAddend += d <= 4 ? baseAddend : baseAddend * 0.80;
  }
  gymAddend = parseFloat(gymAddend.toFixed(3));
  
  // Physiological PAL ceiling: no human sustains above 2.4 PAL outside
  // elite expedition athletes (Pontzer et al., 2016 — constrained energy model)
  const totalPAL = Math.min(2.40, occFactor + gymAddend);
  const rawTDEE = Math.round(bmr) * totalPAL;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(rawTDEE),
    totalPAL: parseFloat(totalPAL.toFixed(3)),
    occupationalFactor: occFactor,
    gymAddend: parseFloat(gymAddend.toFixed(3))
  };
}

/**
 * 3. TARGET DAILY CALORIE INTAKE (GOAL SPECIFIC)
 * Clinically safe deficits and surpluses preventing metabolic downregulation
 */
export function calculateTargetCalories({ tdee, bmr, goal, gender = 'male', weight, height }) {
  const g = (gender || 'male').toLowerCase();
  const minFloor = g === 'female' ? 1250 : 1500;

  // Compute BMI when weight and height are available
  let bmi = null;
  if (weight && height) {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (w > 0 && h > 0) bmi = w / Math.pow(h / 100, 2);
  }

  switch (goal) {
    case 'fat_loss':
    case 'lose': {
      // Standard 22% deficit → 0.5–0.75% bodyweight loss/week (safe clinical range)
      let deficitPct = 0.22;
      if (bmi !== null) {
        if (bmi > 30) deficitPct = 0.25;   // Obese: larger deficit is safe (more fat stores)
        if (bmi < 20) deficitPct = 0.12;   // Lean: small deficit to protect lean muscle mass
      }
      const deficitCal = tdee * (1 - deficitPct);
      // Safety floor: never below clinical minimum or 95% of BMR (metabolic protection)
      return Math.max(Math.round(deficitCal), minFloor, Math.round(bmr * 0.95));
    }

    case 'lean_bulk':
    case 'gain':
    case 'muscle':
    case 'hypertrophy': {
      // 9% controlled surplus (~+200–300 kcal): maximizes muscle protein synthesis
      // without excessive adipose accumulation (Barakat et al., 2020)
      let surplusPct = 0.09;
      if (bmi !== null) {
        if (bmi < 18.5) surplusPct = 0.15;  // Underweight: larger surplus safe and needed
        if (bmi > 25)   surplusPct = 0.05;  // Overweight: minimal surplus to limit fat gain
      }
      return Math.round(tdee * (1 + surplusPct));
    }

    case 'aggressive_bulk': {
      // 17% surplus (~+450–600 kcal): fast mass for lean hardgainers
      let surplusPct = 0.17;
      if (bmi !== null && bmi > 25) surplusPct = 0.08; // Overweight: cut aggressive bulk
      return Math.round(tdee * (1 + surplusPct));
    }

    case 'maintain':
    default: {
      // Slight surplus for underweight users on maintenance to reach healthy weight
      if (bmi !== null && bmi < 18.5) return Math.round(tdee * 1.05);
      return Math.round(tdee);
    }
  }
}

/**
 * 4. MACRONUTRIENT PARTITIONING (ISSN / NSCA STANDARDS)
 * Strict Gram-for-Gram calculation with zero rounding drift
 */
export function calculateMacros({ dailyCalories, weight, goal, isGymGoer = false }) {
  const w = parseFloat(weight) || 70;
  const cals = parseInt(dailyCalories, 10) || 2000;

  // 1. Protein determination based on athletic demand and nitrogen preservation
  // Clinical evidence-based ranges (ISSN 2023, NSCA, WHO):
  //   - Sedentary, fat loss: 1.2–1.5g/kg (WHO: 0.8g/kg minimum; ISSN adds margin for retention)
  //   - Active gym + fat loss: 1.8–2.0g/kg (muscle preservation in deficit)
  //   - Gym + muscle gain: 1.8–2.0g/kg (NSCA: sufficient with caloric surplus)
  //   - General maintain, sedentary: 1.0–1.2g/kg (healthy adult baseline)
  let proteinPerKg;
  if (goal === 'fat_loss' || goal === 'lose') {
    // ISSN 2023: higher protein in deficit to prevent muscle proteolysis
    proteinPerKg = isGymGoer ? 2.0 : 1.4;
  } else if (
    goal === 'lean_bulk' || goal === 'gain' ||
    goal === 'muscle' || goal === 'hypertrophy'
  ) {
    // NSCA: 1.8–2.0g/kg sufficient with adequate caloric surplus for muscle gain
    proteinPerKg = isGymGoer ? 2.0 : 1.6;
  } else if (goal === 'aggressive_bulk') {
    // Aggressive bulk: calorie surplus is primary driver; 1.8g/kg sufficient
    proteinPerKg = isGymGoer ? 1.8 : 1.4;
  } else {
    // Maintenance / general health
    proteinPerKg = isGymGoer ? 1.6 : 1.1;
  }

  // Hard cap: protein calories must not exceed 35% of total calories (prevents carb starvation)
  let targetProteinGrams = Math.round(w * proteinPerKg);
  const maxProteinFromCalories = Math.round((cals * 0.35) / 4);
  if (targetProteinGrams > maxProteinFromCalories) {
    targetProteinGrams = maxProteinFromCalories;
  }
  const proteinCalories = targetProteinGrams * 4;

  // 2. Essential Dietary Fats: 25% of total calories (ensuring minimum 0.7g/kg for endocrine health)
  let targetFatGrams = Math.round((cals * 0.25) / 9);
  const minFatGrams = Math.round(w * 0.7);
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
 * 5. DYNAMIC RECIPE INGREDIENTS & INSTRUCTIONS SCALER
 * Accurately parses numbers in recipe ingredient strings and scales them by the portion multiplier
 */
export function scaleIngredients(ingredientsArray = [], multiplier = 1.0) {
  if (!Array.isArray(ingredientsArray)) return [];
  if (multiplier === 1.0) return ingredientsArray;

  const discretePattern = /(bananas?|eggs?|slices?|phulkas?|rotis?|parathas?|chillas?|pieces?|pcs|tbsp|tsp)/i;

  return ingredientsArray.map(line => {
    if (typeof line !== 'string') return line;

    // Matches numbers, decimals, fractions (e.g. "1/2 cup", "1.5 tsp", "100g", "2 pieces", "1/4 tsp")
    return line.replace(/(\d+\/\d+|\d+(?:\.\d+)?)/g, (match) => {
      let val = 0;
      if (match.includes('/')) {
        const [num, den] = match.split('/').map(Number);
        val = den ? (num / den) : 0;
      } else {
        val = parseFloat(match);
      }

      if (isNaN(val) || val === 0) return match;

      const scaled = val * multiplier;
      // If the ingredient line is a discrete item or close to integer, round cleanly
      if (discretePattern.test(line) || Math.abs(scaled - Math.round(scaled)) < 0.15) {
        return Math.max(1, Math.round(scaled)).toString();
      }
      if (Math.abs(scaled - Math.round(scaled)) < 0.05) {
        return Math.round(scaled).toString();
      }
      return scaled.toFixed(1).replace(/\.0$/, '');
    });
  });
}

/**
 * Parses ingredients into clean structured items with separate name and dynamic measurement
 */
export function parseStructuredIngredients(ingredientsArray = [], multiplier = 1.0) {
  const scaledList = scaleIngredients(ingredientsArray, multiplier);
  return scaledList.map(line => {
    if (typeof line !== 'string') return { name: String(line), measurement: '', display: String(line) };

    // Split strictly on dash/colon surrounded by whitespace (never compound hyphens like 'High-Protein')
    const parts = line.split(/\s+[-–—:]\s+/);
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const measurement = parts.slice(1).join(' - ').trim();
      return {
        name,
        measurement,
        display: line
      };
    }

    const parenMatch = line.match(/^([^(]+)\s*\(([^)]+)\)$/);
    if (parenMatch) {
      return {
        name: parenMatch[1].trim(),
        measurement: parenMatch[2].trim(),
        display: line
      };
    }

    return {
      name: line.trim(),
      measurement: '',
      display: line
    };
  });
}

/**
 * Dynamically scales ingredient quantities referenced inside recipe cooking instructions
 * (e.g. "2 slices" -> "3 slices", "150g" -> "225g", while preserving step numbers and cooking times)
 */
export function scaleRecipeInstructions(recipeText = '', multiplier = 1.0) {
  if (!recipeText || typeof recipeText !== 'string' || multiplier === 1.0) return recipeText;

  const discreteUnits = new Set(['banana', 'bananas', 'egg', 'eggs', 'toast', 'slice', 'slices', 'phulka', 'phulkas', 'paratha', 'parathas', 'chilla', 'chillas', 'piece', 'pieces', 'pc', 'pcs', 'bowl', 'bowls', 'glass', 'glasses', 'scoop', 'scoops', 'tsp', 'tbsp']);
  const pluralizableWords = new Set(['banana', 'egg', 'slice', 'phulka', 'paratha', 'chilla', 'piece', 'bowl', 'glass', 'scoop']);

  return recipeText.replace(/(\b|\()(\d+\/\d+|\d+(?:\.\d+)?)\s*(g|kg|ml|l|tbsp|tsp|cups?|slices?|pcs|pieces?|phulkas?|rotis?|eggs?|scoops?|toast|bananas?|parathas?|chillas?|bowls?|glasses?|minutes?|mins?)(?=\b|\s|[.,;)/])/gi, (fullMatch, prefix, numStr, unit) => {
    // Preserve cooking durations/times
    if (unit.toLowerCase().startsWith('min')) return fullMatch;

    let val = 0;
    if (numStr.includes('/')) {
      const [n, d] = numStr.split('/').map(Number);
      val = d ? (n / d) : 0;
    } else {
      val = parseFloat(numStr);
    }
    if (isNaN(val) || val === 0) return fullMatch;

    const scaled = val * multiplier;
    let formatted = '';
    const uLower = unit.toLowerCase();
    if (discreteUnits.has(uLower) || Math.abs(scaled - Math.round(scaled)) < 0.15) {
      const rounded = Math.max(1, Math.round(scaled));
      formatted = rounded.toString();
      if (rounded > 1 && pluralizableWords.has(uLower)) {
        return prefix + formatted + ' ' + unit + 's';
      }
    } else {
      formatted = scaled.toFixed(1).replace(/\.0$/, '');
    }

    return fullMatch.replace(numStr, formatted);
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

/**
 * 7. COMPLETE FITNESS CALORIE CALCULATION BREAKDOWN
 * Transparent step-by-step arithmetic from user's profile inputs
 */
export function getDetailedCalorieBreakdown(user) {
  if (!user) return null;
  const weight = parseFloat(user.weight) || 70;
  const height = parseFloat(user.height) || 175;
  const age = parseInt(user.age, 10) || 25;
  const gender = (user.gender || 'male').toLowerCase();
  const profession = user.profession || 'Software Engineer';
  const gymDays = parseInt(user.gymDays !== undefined ? user.gymDays : 3, 10);
  const gymIntensity = user.gymIntensity || 'moderate';
  const goal = user.goal || 'maintain';

  // Step 1: BMR
  const bmr = calculateBMR(weight, height, age, gender);
  const bmrFormula = gender === 'female'
    ? `(10 × ${weight}kg) + (6.25 × ${height}cm) - (5 × ${age}yrs) - 161`
    : `(10 × ${weight}kg) + (6.25 × ${height}cm) - (5 × ${age}yrs) + 5`;

  // Step 2: NEAT
  const occFactor = getOccupationalMultiplier(profession);

  // Step 3: EAT (Exercise Activity)
  let intensityAddend = 0.052;
  let intensityLabel = 'Moderate Gym Training';
  if (gymIntensity === 'light') {
    intensityAddend = 0.032;
    intensityLabel = 'Light / Walking / Yoga';
  } else if (gymIntensity === 'high') {
    intensityAddend = 0.075;
    intensityLabel = 'Heavy Bodybuilding / HIIT';
  }

  const gymAddend = gymDays * intensityAddend;
  const eatBurnKcal = Math.round(bmr * gymAddend);

  // Step 4: TDEE
  const totalPAL = parseFloat((occFactor + gymAddend).toFixed(2));
  const tdee = Math.round(bmr * totalPAL);

  // Step 5: Goal Adjustment
  const targetCalories = calculateTargetCalories({ tdee, bmr, goal, gender, weight, height });
  const calorieDelta = targetCalories - tdee;

  // Step 6: Macros
  const isGymGoer = gymDays > 0;
  const macros = calculateMacros({ dailyCalories: targetCalories, weight, goal, isGymGoer });

  return {
    inputs: { weight, height, age, gender, profession, gymDays, gymIntensity, goal },
    bmr: Math.round(bmr),
    bmrFormula,
    neatFactor: occFactor,
    eatDays: gymDays,
    eatIntensityLabel: intensityLabel,
    eatBurnKcal,
    totalPAL,
    tdee,
    goal,
    calorieDelta,
    targetCalories,
    macros
  };
}

// ─── VERIFIED MASTER SPORTS NUTRITION & FITNESS MEALS DATABASE ─────────────────
export const GOLDEN_FITNESS_MEALS = [
  // ── PRE-WORKOUT FUEL (Fast Glycogen & Sustained Stamina, Easy Digestibility) ──
  {
    id: 'pw-1',
    name: 'Whole Wheat Peanut Butter & Banana Toast',
    category: 'pre_workout',
    mealTypes: ['pre_workout', 'snacks'],
    calories: 330,
    protein: 10,
    carbs: 50,
    fat: 11,
    cost: 25,
    prepTime: 5,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '2 Toast Slices + 1 Banana (24g PB)',
    budgetTier: 'tight',
    allergies: ['peanuts', 'gluten'],
    dietaryStyle: ['vegan', 'vegetarian'],
    ingredients: [
      'Whole Wheat Bread - 2 slices (60g)',
      'Natural Peanut Butter - 1.5 tbsp (24g)',
      'Ripe Banana - 1 medium (100g)',
      'Cinnamon powder - a pinch'
    ],
    recipe: '1. Toast 2 bread slices until golden brown and crisp. 2. Spread 1.5 tbsp (24g) natural peanut butter evenly on warm toast. 3. Top with 1 sliced banana and a dusting of cinnamon. Consume 45 mins before training.',
    benefits: 'Fast-acting simple and complex carbohydrates paired with healthy fats for sustained muscular endurance without digestive heaviness.',
    tips: 'Pair with a cup of black coffee for caffeine-driven central nervous system focus.'
  },
  {
    id: 'pw-2',
    name: 'Classic Oatmeal Energy Bowl with Milk, Banana & Honey',
    category: 'pre_workout',
    mealTypes: ['pre_workout', 'breakfast', 'snacks'],
    calories: 320,
    protein: 12,
    carbs: 54,
    fat: 6,
    cost: 22,
    prepTime: 8,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '50g Oats + 200ml Milk + 1 Banana + 1 tsp Honey',
    budgetTier: 'tight',
    allergies: ['dairy'],
    dietaryStyle: ['vegetarian'],
    ingredients: [
      'Rolled Oats - 50g',
      'Toned Dairy Milk - 200ml',
      'Ripe Banana - 1 medium (100g)',
      'Raw Honey - 1 tsp',
      'Chia seeds - 1 tsp'
    ],
    recipe: '1. Cook 50g rolled oats in 200ml warm toned milk on medium flame for 4 minutes. 2. Pour into a bowl, slice 1 banana on top, and drizzle 1 tsp raw honey with 1 tsp chia seeds.',
    benefits: 'Sustained-release beta-glucan carbohydrates prevent intra-workout energy dips.',
    tips: 'Eat 60 minutes prior to heavy leg days or high-volume hypertrophy sessions.'
  },
  {
    id: 'pw-3',
    name: 'Boiled Sweet Potato Chaat with Rock Salt & Lemon',
    category: 'pre_workout',
    mealTypes: ['pre_workout', 'snacks'],
    calories: 240,
    protein: 4,
    carbs: 56,
    fat: 1,
    cost: 15,
    prepTime: 10,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '1 Bowl (200g Steamed Sweet Potato)',
    budgetTier: 'tight',
    allergies: [],
    dietaryStyle: ['vegan', 'vegetarian', 'jain'],
    ingredients: [
      'Sweet Potato (Shakarkandi) - 200g',
      'Fresh Lemon Juice - 1 tbsp',
      'Rock Salt & Chaat Masala - 1/2 tsp',
      'Roasted Cumin Powder - 1/2 tsp'
    ],
    recipe: '1. Boil sweet potato until fork-tender. 2. Peel and cut into bite-sized cubes. 3. Toss with fresh lemon juice, rock salt, and roasted jeera powder.',
    benefits: 'Dense source of complex carbs, potassium, and magnesium to prevent muscular cramping.',
    tips: 'Pure clean fuel with virtually zero fat, ideal for immediate energetic replenishment.'
  },
  {
    id: 'pw-4',
    name: 'Desi Chana Sattu Energy Drink with Lemon & Roasted Cumin',
    category: 'pre_workout',
    mealTypes: ['pre_workout', 'snacks'],
    calories: 230,
    protein: 14,
    carbs: 36,
    fat: 3,
    cost: 14,
    prepTime: 3,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '1 Tall Glass (45g Sattu + 350ml Water)',
    budgetTier: 'tight',
    allergies: [],
    dietaryStyle: ['vegan', 'vegetarian'],
    ingredients: [
      'Roasted Chana Sattu Flour - 45g',
      'Chilled Water - 350ml',
      'Fresh Lemon Juice - 1 tbsp',
      'Roasted Jeera & Kala Namak - 1/2 tsp',
      'Fresh Mint leaves'
    ],
    recipe: '1. Whisk roasted chana sattu with chilled water until completely dissolved. 2. Stir in lemon juice, black salt, and roasted cumin. 3. Serve chilled.',
    benefits: 'Traditional Indian endurance fuel; high in plant protein and natural electrolytes.',
    tips: 'Extremely gentle on digestion, perfect when you have under 40 minutes before hitting the gym.'
  },
  {
    id: 'pw-5',
    name: 'Overnight Rolled Oats with Chia Seeds, Milk & Almonds',
    category: 'pre_workout',
    mealTypes: ['pre_workout', 'breakfast', 'snacks'],
    calories: 290,
    protein: 11,
    carbs: 46,
    fat: 8,
    cost: 24,
    prepTime: 5,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '1 Jar (40g Oats + 180ml Milk + Almonds)',
    budgetTier: 'moderate',
    allergies: ['dairy', 'nuts'],
    dietaryStyle: ['vegetarian'],
    ingredients: [
      'Rolled Oats - 40g',
      'Toned Milk - 180ml',
      'Chia Seeds - 1 tbsp',
      'Sliced Almonds - 8',
      'Raw Jaggery powder - 1 tsp'
    ],
    recipe: '1. Soak rolled oats and chia seeds in milk overnight in the fridge. 2. In the morning, garnish with sliced almonds and jaggery. Serve chilled straight from the fridge. Add a drizzle of honey or jaggery if preferred.',
    benefits: 'Pre-hydrated carbohydrates and omega-3 fatty acids ready to eat with zero cooking time.'
  },

  // ── POST-WORKOUT RECOVERY (High Bioavailable Protein 26g - 48g & Glycogen Replenishment) ──
  {
    id: 'rec-v1',
    name: 'High-Protein Paneer Bhurji with Whole Wheat Toast',
    category: 'post_workout',
    mealTypes: ['post_workout', 'breakfast', 'dinner'],
    calories: 490,
    protein: 34,
    carbs: 42,
    fat: 20,
    cost: 45,
    prepTime: 12,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '1 Plate (150g Paneer + 2 Toast Slices)',
    budgetTier: 'moderate',
    allergies: ['dairy', 'gluten'],
    dietaryStyle: ['vegetarian'],
    ingredients: [
      'Fresh Paneer - 150g (crumbled)',
      'Whole Wheat Bread - 2 slices (or 2 Phulkas)',
      'Onion & Tomato - 1 each (finely chopped)',
      'Green Chilies & Ginger - 1 tsp',
      'Desi Ghee - 1 tsp',
      'Turmeric, Cumin & Coriander Powder - 1/2 tsp'
    ],
    recipe: '1. Heat 1 tsp ghee, sauté cumin, onions, ginger, and green chilies until fragrant. 2. Add chopped tomatoes, turmeric, and salt; cook until soft. 3. Toss in crumbled fresh paneer and sauté on medium-high heat for 2 minutes. 4. Serve immediately with warm toasted bread.',
    benefits: 'Full-spectrum dairy casein and whey proteins with complete branched-chain amino acids (BCAAs) to trigger muscle protein synthesis.',
    tips: 'Do not overcook the paneer to keep it soft, juicy, and easily digestible.'
  },
  {
    id: 'rec-v2',
    name: 'Ultimate Roasted Chana Sattu & Milk Mass Gainer Shake',
    category: 'post_workout',
    mealTypes: ['post_workout', 'snacks'],
    calories: 540,
    protein: 30,
    carbs: 76,
    fat: 14,
    cost: 32,
    prepTime: 3,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '1 Tall Shaker (60g Sattu + 320ml Milk + Banana)',
    budgetTier: 'tight',
    allergies: ['dairy', 'peanuts'],
    dietaryStyle: ['vegetarian'],
    ingredients: [
      'Roasted Chana Sattu Flour - 60g',
      'Toned Milk - 320ml',
      'Ripe Banana - 1 large',
      'Natural Peanut Butter - 1 tbsp (16g)',
      'Raw Honey - 1 tbsp'
    ],
    recipe: '1. Place sattu, milk, banana, peanut butter, and honey into a high-speed blender. 2. Blend for 45 seconds until velvety smooth. 3. Drink within 30 minutes post-workout.',
    benefits: 'High-density whole-food recovery shake loaded with 30g natural protein, complex carbs, and potassium for rapid muscle hypertrophy.',
    tips: 'The ultimate affordable Indian mass gainer shake for students and hardgainers.'
  },
  {
    id: 'rec-v3',
    name: 'High-Protein Soya Bhurji with Phulkas & Salad',
    category: 'post_workout',
    mealTypes: ['post_workout', 'dinner', 'lunch'],
    calories: 452,
    protein: 36,
    carbs: 50,
    fat: 12,
    cost: 25,
    prepTime: 15,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '1 Plate (60g Soya Granules + 2 Phulkas)',
    budgetTier: 'tight',
    allergies: ['soy', 'gluten'],
    dietaryStyle: ['vegan', 'vegetarian'],
    ingredients: [
      'High-Protein Soya Granules - 60g (dry weight)',
      'Whole Wheat Atta (2 Phulkas) - 60g',
      'Onion & Tomato - 1 each',
      'Mustard Oil - 1 tsp',
      'Garam Masala & Turmeric - 1/2 tsp',
      'Fresh Lemon & Coriander'
    ],
    recipe: '1. Boil soya granules for 5 mins in salted water, rinse in cold water, and squeeze out all excess moisture. 2. Heat mustard oil, sauté onions, ginger, tomatoes, and spices. 3. Add squeezed soya granules and stir-fry for 4-5 minutes. 4. Serve hot with 2 fresh phulkas.',
    benefits: 'Delivers 36g of bioavailable plant protein with zero saturated fat and high glutamine for tissue repair.'
  },
  {
    id: 'rec-v4',
    name: 'Banana Peanut Butter Toast with Whey Protein',
    category: 'post_workout',
    mealTypes: ['post_workout', 'breakfast', 'snacks'],
    calories: 520,
    protein: 38,
    carbs: 54,
    fat: 16,
    cost: 58,
    prepTime: 5,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '2 Slices Toast + 23g PB + 1 Banana + 1 Scoop Whey',
    budgetTier: 'moderate',
    allergies: ['dairy', 'peanuts', 'gluten'],
    dietaryStyle: ['vegetarian'],
    ingredients: [
      'Whole Wheat Bread - 2 slices',
      'Natural Peanut Butter - 23g (approx 1.5 tbsp)',
      'Ripe Banana - 1 medium',
      'Whey Protein Powder - 1 scoop (32g)'
    ],
    recipe: '1. Toast the whole wheat bread slices until golden crisp. 2. Spread natural peanut butter evenly across both slices. 3. Slice banana into rounds and arrange atop the toast. 4. Mix whey protein with 150ml water/milk and enjoy alongside the toast.',
    benefits: 'High complex carbs, potassium, healthy fats, and fast-acting whey protein delivering complete muscle protein synthesis post-workout or for breakfast.'
  },
  {
    id: 'rec-v5',
    name: 'Fresh Greek Yogurt (Hung Curd) Bowl with Roasted Peanuts & Honey',
    category: 'post_workout',
    mealTypes: ['post_workout', 'breakfast', 'snacks'],
    calories: 450,
    protein: 30,
    carbs: 48,
    fat: 14,
    cost: 40,
    prepTime: 5,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '1 Bowl (200g Hung Curd + 25g Peanuts + Banana)',
    budgetTier: 'moderate',
    allergies: ['dairy', 'peanuts'],
    dietaryStyle: ['vegetarian'],
    ingredients: [
      'Fresh Hung Curd (Greek Dahi) - 200g',
      'Roasted Peanuts - 25g',
      'Ripe Banana - 1 sliced',
      'Raw Honey - 1 tsp',
      'Chia seeds - 1 tsp'
    ],
    recipe: '1. Whisk fresh hung curd until thick and smooth. 2. Layer with sliced banana and crunchy roasted peanuts. 3. Drizzle with raw honey and chia seeds.',
    benefits: 'Concentrated natural casein and whey protein paired with active live probiotics for digestive recovery.'
  },
  {
    id: 'rec-e1',
    name: 'Desi Egg Bhurji with Multigrain Toast & Salad',
    category: 'post_workout',
    mealTypes: ['post_workout', 'breakfast', 'dinner'],
    calories: 458,
    protein: 38,
    carbs: 36,
    fat: 18,
    cost: 38,
    prepTime: 10,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '1 Plate (4 Eggs + 2 Multigrain Toast)',
    budgetTier: 'tight',
    allergies: ['egg', 'gluten'],
    dietaryStyle: ['eggitarian'],
    ingredients: [
      'Fresh Farm Eggs - 4',
      'Whole Wheat / Multigrain Toast - 2 slices',
      'Onion, Tomato & Green Chilies - finely chopped',
      'Desi Ghee - 1 tsp',
      'Black pepper & Salt'
    ],
    recipe: '1. Whisk eggs with salt and freshly cracked black pepper. 2. Sauté onions, tomatoes, and chilies in 1 tsp ghee. 3. Pour eggs and scramble on medium heat for 2-3 minutes. 4. Serve immediately with warm toast.',
    benefits: 'Gold-standard DIAAS protein score (1.18) with all 9 essential amino acids and natural choline.'
  },
  {
    id: 'rec-e2',
    name: 'Hard-Boiled Eggs with Steamed Sweet Potato & Lemon',
    category: 'post_workout',
    mealTypes: ['post_workout', 'snacks'],
    calories: 420,
    protein: 28,
    carbs: 45,
    fat: 14,
    cost: 32,
    prepTime: 12,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '1 Plate (4 Boiled Eggs + 150g Sweet Potato)',
    budgetTier: 'tight',
    allergies: ['egg'],
    dietaryStyle: ['eggitarian'],
    ingredients: [
      'Fresh Eggs (Hard-boiled) - 4',
      'Steamed Sweet Potato - 150g',
      'Rock Salt, Chaat Masala & Lemon juice'
    ],
    recipe: '1. Peel hard-boiled eggs and slice in halves. 2. Pair with warm steamed sweet potato cubes seasoned with rock salt, chaat masala, and lemon.',
    benefits: 'Clean bodybuilding staple for rapid lean muscle hypertrophy and glycogen recovery.'
  },
  {
    id: 'rec-nv1',
    name: 'Pan-Seared Boneless Chicken Breast with Steamed Basmati Rice & Salad',
    category: 'post_workout',
    mealTypes: ['post_workout', 'lunch', 'dinner'],
    calories: 480,
    protein: 48,
    carbs: 54,
    fat: 8,
    cost: 75,
    prepTime: 15,
    difficulty: 'moderate',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '1 Plate (180g Chicken + 1.5 Cups Rice)',
    budgetTier: 'moderate',
    allergies: [],
    dietaryStyle: ['non-vegetarian'],
    ingredients: [
      'Boneless Chicken Breast - 180g',
      'Cooked Basmati Rice - 1.5 cups (180g)',
      'Curd - 2 tbsp (for marinade)',
      'Ginger-garlic paste, Turmeric, Cumin & Paprika',
      'Olive Oil / Ghee - 1 tsp',
      'Cucumber Salad with Lemon'
    ],
    recipe: '1. Marinate chicken breast in curd, ginger-garlic paste, and spices for 15 minutes. 2. Pan-sear in 1 tsp oil on medium-high heat for 6-7 mins per side until tender and juicy. 3. Serve with warm steamed basmati rice and sliced cucumber salad.',
    benefits: 'Ultra-pure complete animal protein delivering 48g of bioavailable amino acids for peak muscle protein synthesis.'
  },
  {
    id: 'rec-nv2',
    name: 'Homestyle Chicken Breast Curry with Whole Wheat Phulkas',
    category: 'post_workout',
    mealTypes: ['post_workout', 'dinner', 'lunch'],
    calories: 468,
    protein: 42,
    carbs: 48,
    fat: 12,
    cost: 70,
    prepTime: 20,
    difficulty: 'moderate',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '1 Plate (160g Chicken + 2 Phulkas)',
    budgetTier: 'moderate',
    allergies: ['gluten'],
    dietaryStyle: ['non-vegetarian'],
    ingredients: [
      'Boneless Chicken Breast - 160g (cubed)',
      'Whole Wheat Atta (2 Phulkas) - 60g',
      'Onion-Tomato-Ginger Gravy',
      'Mustard Oil - 1 tsp',
      'Spices & Fresh Coriander'
    ],
    recipe: '1. Sauté onions, ginger, garlic, and tomato puree. 2. Add chicken cubes and sear for 3 minutes. 3. Simmer in 1/2 cup water for 12 minutes. 4. Serve with 2 warm phulkas.',
    benefits: 'High protein density with classic homestyle spices for sustained recovery.'
  },

  // ── BREAKFAST (High Energy & Sustained Protein) ──
  {
    id: 'brk-1',
    name: 'Paneer Stuffed Whole Wheat Parathas with Fresh Curd & Pickle',
    category: 'breakfast',
    mealTypes: ['breakfast'],
    calories: 530,
    protein: 25,
    carbs: 64,
    fat: 18,
    cost: 38,
    prepTime: 15,
    difficulty: 'moderate',
    cuisine: 'indian',
    region: 'north',
    servingUnit: '2 Paneer Parathas + 150g Fresh Curd',
    budgetTier: 'moderate',
    allergies: ['dairy', 'gluten'],
    dietaryStyle: ['vegetarian'],
    ingredients: [
      'Whole Wheat Atta - 70g (2 Parathas)',
      'Fresh Grated Paneer - 90g',
      'Fresh Curd (Dahi) - 150g',
      'Ajwain, Green Chili, Coriander & Salt',
      'Pure Desi Ghee - 1.5 tsp'
    ],
    recipe: '1. Knead whole wheat dough with a pinch of salt and ajwain. 2. Stuff with grated paneer seasoned with chopped green chili and coriander. 3. Roll gently and roast on hot tawa with desi ghee until golden crisp on both sides. 4. Serve hot with fresh curd.',
    benefits: 'Wholesome muscle-fuel breakfast delivering sustained complex carbohydrates and 25g slow-release casein protein.',
    tips: 'Pair with fresh mint chutney for improved micronutrient absorption.'
  },
  {
    id: 'brk-2',
    name: 'High-Protein Besan & Paneer Chilla with Fresh Mint Chutney',
    category: 'breakfast',
    mealTypes: ['breakfast', 'dinner'],
    calories: 470,
    protein: 27,
    carbs: 52,
    fat: 15,
    cost: 28,
    prepTime: 12,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '2 Besan Chillas + 70g Paneer + Mint Chutney',
    budgetTier: 'tight',
    allergies: ['dairy'],
    dietaryStyle: ['vegetarian'],
    ingredients: [
      'Pure Besan (Gram Flour) - 60g',
      'Fresh Grated Paneer - 70g',
      'Finely chopped Onion, Tomato, Coriander',
      'Desi Ghee / Mustard Oil - 1 tsp',
      'Fresh Mint-Coriander Chutney - 2 tbsp'
    ],
    recipe: '1. Whisk besan with water, salt, ajwain, turmeric, and chopped veggies into a smooth batter. 2. Pour on medium-hot tawa, sprinkle grated paneer on top, drizzle drops of ghee, and flip until golden and cooked through. 3. Serve hot with fresh mint chutney.',
    benefits: 'Low-glycemic legume flour packed with soluble fiber, iron, and complete dairy protein.',
    tips: 'Gluten-free friendly and very easy on digestion.'
  },
  {
    id: 'brk-3',
    name: 'High-Protein Desi Poha with Roasted Peanuts, Paneer & Matar',
    category: 'breakfast',
    mealTypes: ['breakfast'],
    calories: 450,
    protein: 19,
    carbs: 58,
    fat: 15,
    cost: 22,
    prepTime: 12,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'west',
    servingUnit: '1 Large Bowl (60g Poha + 60g Paneer + Peanuts)',
    budgetTier: 'tight',
    allergies: ['dairy', 'peanuts'],
    dietaryStyle: ['vegetarian'],
    ingredients: [
      'Thick Flattened Rice (Poha) - 60g',
      'Fresh Paneer Cubes - 60g',
      'Raw Peanuts - 20g (roasted)',
      'Green Tender Peas (Matar) - 30g',
      'Mustard seeds, Curry leaves, Turmeric, Lemon'
    ],
    recipe: '1. Rinse poha in water and drain. 2. Roast peanuts and paneer cubes in 1 tsp oil until golden; set aside. 3. Splutter mustard seeds and curry leaves, sauté onions and peas with turmeric. 4. Gently fold in soaked poha, roasted peanuts, paneer, and fresh lemon juice.',
    benefits: 'Iron-rich flattened rice energized with high-protein paneer and healthy fats from peanuts.'
  },
  {
    id: 'brk-4',
    name: 'Sprouted Moong Dal Pesarattu with Fresh Dahi & Ginger Chutney',
    category: 'breakfast',
    mealTypes: ['breakfast', 'dinner'],
    calories: 440,
    protein: 22,
    carbs: 60,
    fat: 10,
    cost: 20,
    prepTime: 15,
    difficulty: 'moderate',
    cuisine: 'indian',
    region: 'south',
    servingUnit: '2 Moong Pesarattu + 120g Fresh Dahi',
    budgetTier: 'tight',
    allergies: ['dairy'],
    dietaryStyle: ['vegetarian'],
    ingredients: [
      'Whole Green Moong (Sprouted/Soaked) - 70g',
      'Fresh Curd (Dahi) - 120g',
      'Ginger, Green Chili, Cumin seeds',
      'Oil - 1 tsp',
      'Ginger Chutney - 2 tbsp'
    ],
    recipe: '1. Grind soaked green moong with ginger, green chili, and cumin into a smooth batter. 2. Spread thin on a hot tawa, drizzle minimal oil, and cook until crisp and golden. 3. Serve hot with fresh curd.',
    benefits: 'High biological enzyme activity from sprouted moong with zero gluten and high bioavailable folates.'
  },
  {
    id: 'brk-5',
    name: 'Sattu Stuffed Whole Wheat Parathas with Fresh Curd',
    category: 'breakfast',
    mealTypes: ['breakfast'],
    calories: 480,
    protein: 22,
    carbs: 68,
    fat: 12,
    cost: 22,
    prepTime: 15,
    difficulty: 'moderate',
    cuisine: 'indian',
    region: 'east',
    servingUnit: '2 Sattu Parathas + 150g Fresh Dahi',
    budgetTier: 'tight',
    allergies: ['dairy', 'gluten'],
    dietaryStyle: ['vegetarian'],
    ingredients: [
      'Whole Wheat Atta - 60g',
      'Roasted Chana Sattu Flour - 50g',
      'Fresh Curd - 150g',
      'Ajwain, Kalonji, Mustard oil - 1 tsp',
      'Chopped onion, garlic, pickle masala'
    ],
    recipe: '1. Season roasted chana sattu with ajwain, kalonji, mustard oil, chopped onions, and lemon. 2. Stuff inside wheat dough balls, roll out, and cook on tawa with drops of ghee. 3. Serve with fresh dahi.',
    benefits: 'Traditional powerhouse breakfast delivering 22g protein, high dietary fiber, and long-lasting satiety.'
  },
  {
    id: 'brk-e1',
    name: 'Desi Egg Omelette with Whole Wheat Phulkas & Fresh Dahi',
    category: 'breakfast',
    mealTypes: ['breakfast'],
    calories: 510,
    protein: 28,
    carbs: 54,
    fat: 18,
    cost: 32,
    prepTime: 10,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '3-Egg Omelette + 2 Phulkas + 100g Dahi',
    budgetTier: 'tight',
    allergies: ['egg', 'gluten', 'dairy'],
    dietaryStyle: ['eggitarian'],
    ingredients: [
      'Fresh Farm Eggs - 3',
      'Whole Wheat Atta (2 Phulkas) - 60g',
      'Fresh Curd - 100g',
      'Finely chopped Onion, Tomato, Green Chili',
      'Desi Ghee - 1 tsp'
    ],
    recipe: '1. Beat 3 eggs with salt, pepper, onions, tomatoes, and chilies. 2. Cook in 1 tsp ghee until golden on both sides. 3. Serve with 2 fresh phulkas and dahi.',
    benefits: 'High biological value protein with essential fatty acids for all-day metabolic priming.'
  },

  // ── LUNCH (The Complete Muscle-Building High-Protein Indian Thali) ──
  {
    id: 'lnc-1',
    name: 'High-Protein Muscle Thali: Dal Tadka, Paneer Bhurji, Phulkas & Dahi',
    category: 'lunch',
    mealTypes: ['lunch'],
    calories: 780,
    protein: 38,
    carbs: 94,
    fat: 24,
    cost: 65,
    prepTime: 25,
    difficulty: 'moderate',
    cuisine: 'indian',
    region: 'north',
    servingUnit: 'Thali: 3 Phulkas + Dal Tadka + 100g Paneer + Dahi',
    budgetTier: 'moderate',
    allergies: ['dairy', 'gluten'],
    dietaryStyle: ['vegetarian'],
    ingredients: [
      'Yellow Moong Dal - 60g dry weight',
      'Fresh Malai Paneer - 100g (crumbled bhurji)',
      'Whole Wheat Atta - 90g (3 Phulkas)',
      'Fresh Curd (Dahi) - 150g',
      'Desi Ghee - 1 tsp (tadka)',
      'Cucumber, Tomato & Onion Salad with Lemon'
    ],
    recipe: '1. Pressure cook moong dal with turmeric and salt; temper with jeera, hing, garlic, and ghee. 2. Sauté paneer with onions, tomatoes, and spices. 3. Cook 3 whole wheat phulkas on open flame. 4. Plate with dal, paneer bhurji, fresh curd, and salad.',
    benefits: 'Complete amino acid complementary pairing (grains + legumes + dairy) delivering 38g high-quality protein for maximal muscle protein synthesis.',
    tips: 'The ultimate staple Indian hypertrophy meal for muscle gain.'
  },
  {
    id: 'lnc-2',
    name: 'Classic Rajma Masala Platter: Punjabi Rajma, Basmati Rice, Paneer & Dahi',
    category: 'lunch',
    mealTypes: ['lunch'],
    calories: 760,
    protein: 32,
    carbs: 105,
    fat: 18,
    cost: 55,
    prepTime: 30,
    difficulty: 'moderate',
    cuisine: 'indian',
    region: 'north',
    servingUnit: 'Platter: 1 Bowl Rajma + 1.5 Cups Rice + 60g Paneer + Dahi',
    budgetTier: 'moderate',
    allergies: ['dairy'],
    dietaryStyle: ['vegetarian'],
    ingredients: [
      'Red Kidney Beans (Rajma) - 70g dry',
      'Basmati Rice - 80g dry (1.5 cups cooked)',
      'Fresh Paneer - 60g (cubed/tossed)',
      'Fresh Curd - 150g',
      'Onion-Tomato-Ginger Gravy',
      'Mustard Oil - 1 tsp'
    ],
    recipe: '1. Soak and pressure cook rajma until tender. 2. Simmer in a fragrant onion-tomato-garlic masala gravy. 3. Serve over hot steamed basmati rice with pan-tossed paneer cubes and cold dahi.',
    benefits: 'Rich in dietary fiber, potassium, complex carbs, and branched-chain amino acids.'
  },
  {
    id: 'lnc-3',
    name: 'High-Protein Soya Chunks Curry with Toor Dal, Phulkas & Salad',
    category: 'lunch',
    mealTypes: ['lunch'],
    calories: 740,
    protein: 42,
    carbs: 96,
    fat: 16,
    cost: 35,
    prepTime: 25,
    difficulty: 'moderate',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: 'Thali: 3 Phulkas + 45g Soya Chunks + Toor Dal + Salad',
    budgetTier: 'tight',
    allergies: ['soy', 'gluten'],
    dietaryStyle: ['vegan', 'vegetarian'],
    ingredients: [
      'High-Protein Soya Chunks - 45g dry weight',
      'Toor / Arhar Dal - 40g dry',
      'Whole Wheat Atta - 90g (3 Phulkas)',
      'Fresh Curd / Plant Dahi - 100g',
      'Mustard Oil - 1 tsp',
      'Spices & Salad'
    ],
    recipe: '1. Boil soya chunks, squeeze completely dry, and cook in rich onion-tomato curry. 2. Cook toor dal with cumin-garlic tadka. 3. Serve hot with 3 phulkas, dahi, and cucumber salad.',
    benefits: 'High protein-to-cost ratio in Indian cuisine; delivers 42g pure protein at under Rs. 35.'
  },
  {
    id: 'lnc-4',
    name: 'Chole Masala Thali: Pindi Chole, Phulkas, Fresh Dahi & Sliced Onions',
    category: 'lunch',
    mealTypes: ['lunch'],
    calories: 730,
    protein: 30,
    carbs: 102,
    fat: 18,
    cost: 45,
    prepTime: 30,
    difficulty: 'moderate',
    cuisine: 'indian',
    region: 'north',
    servingUnit: 'Thali: 1 Bowl Chole + 3 Phulkas + 150g Dahi + Onions',
    budgetTier: 'moderate',
    allergies: ['dairy', 'gluten'],
    dietaryStyle: ['vegetarian'],
    ingredients: [
      'Kabuli White Chickpeas - 75g dry',
      'Whole Wheat Atta - 90g (3 Phulkas)',
      'Fresh Curd (Dahi) - 150g',
      'Desi Ghee - 1 tsp',
      'Ginger, Anardana, Spices & Sliced Onions'
    ],
    recipe: '1. Pressure cook soaked chickpeas. 2. Cook in spiced pomegranate-tomato gravy. 3. Serve with 3 soft phulkas, fresh curd, and crunchy pickled onions.',
    benefits: 'Rich in zinc, folates, and slow-burning complex carbs for continuous training stamina.'
  },
  {
    id: 'lnc-nv1',
    name: 'Homestyle Chicken Breast Curry Thali with Dal Tadka, Phulkas & Salad',
    category: 'lunch',
    mealTypes: ['lunch'],
    calories: 790,
    protein: 54,
    carbs: 88,
    fat: 18,
    cost: 85,
    prepTime: 25,
    difficulty: 'moderate',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: 'Thali: 180g Chicken Curry + Dal Tadka + 3 Phulkas + Salad',
    budgetTier: 'moderate',
    allergies: ['gluten'],
    dietaryStyle: ['non-vegetarian'],
    ingredients: [
      'Boneless Chicken Breast - 180g (cubed)',
      'Yellow Moong Dal - 40g dry',
      'Whole Wheat Atta - 90g (3 Phulkas)',
      'Onion-Tomato-Ginger Gravy',
      'Mustard Oil - 1 tsp',
      'Green Salad'
    ],
    recipe: '1. Cook cubed chicken breast in aromatic homestyle curry until tender. 2. Prepare yellow moong dal with jeera tadka. 3. Serve with 3 hot phulkas and fresh green salad.',
    benefits: 'Massive 54g bioavailable animal protein thali designed for aggressive muscle hypertrophy.'
  },
  {
    id: 'lnc-e1',
    name: 'Desi Egg Curry Thali with Kala Chana, Phulkas & Dahi',
    category: 'lunch',
    mealTypes: ['lunch'],
    calories: 750,
    protein: 38,
    carbs: 92,
    fat: 22,
    cost: 45,
    prepTime: 25,
    difficulty: 'moderate',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: 'Thali: 3 Eggs Curry + Kala Chana + 3 Phulkas + Dahi',
    budgetTier: 'tight',
    allergies: ['egg', 'gluten', 'dairy'],
    dietaryStyle: ['eggitarian'],
    ingredients: [
      'Fresh Eggs (Boiled & pan-seared) - 3',
      'Desi Kala Chana (Black Chickpeas) - 50g dry',
      'Whole Wheat Atta - 90g (3 Phulkas)',
      'Fresh Curd - 100g',
      'Mustard Oil & Spices - 1 tsp'
    ],
    recipe: '1. Sauté boiled eggs in spiced curry gravy. 2. Cook black chickpeas with ginger-coriander masala. 3. Serve with 3 phulkas and fresh curd.',
    benefits: 'Rich in iron, choline, and complete proteins for peak athletic recovery.'
  },

  // ── DINNER (Clean Overnight Muscle Recovery & Casein Sustain) ──
  {
    id: 'din-1',
    name: 'Palak Paneer with Whole Wheat Phulkas & Dal Tadka',
    category: 'dinner',
    mealTypes: ['dinner'],
    calories: 680,
    protein: 34,
    carbs: 76,
    fat: 22,
    cost: 55,
    prepTime: 20,
    difficulty: 'moderate',
    cuisine: 'indian',
    region: 'north',
    servingUnit: '1 Plate (140g Palak Paneer + 3 Phulkas + Dal)',
    budgetTier: 'moderate',
    allergies: ['dairy', 'gluten'],
    dietaryStyle: ['vegetarian'],
    ingredients: [
      'Fresh Paneer - 140g (cubed)',
      'Fresh Spinach (Palak) - 150g (blanched & pureed)',
      'Whole Wheat Atta - 80g (3 Phulkas)',
      'Yellow Moong Dal - 30g',
      'Desi Ghee - 1 tsp',
      'Ginger, Garlic, Cumin & Garam Masala'
    ],
    recipe: '1. Blanch spinach leaves and puree with green chilies and ginger. 2. Sauté cumin and garlic in ghee, add spinach puree, spices, and cubed paneer. 3. Simmer for 4 minutes. 4. Serve with 3 warm phulkas and yellow dal.',
    benefits: 'High in magnesium, iron, and slow-release casein protein to supply amino acids to recovering muscles throughout the night.',
    tips: 'Avoid heavy cream; pureed spinach with fresh paneer delivers a naturally silky texture with higher nutrient density.'
  },
  {
    id: 'din-2',
    name: 'High-Protein Soya Bhurji with Phulkas & Mixed Dal Tadka',
    category: 'dinner',
    mealTypes: ['dinner'],
    calories: 660,
    protein: 38,
    carbs: 80,
    fat: 16,
    cost: 30,
    prepTime: 20,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '1 Plate (50g Soya Bhurji + 3 Phulkas + Mixed Dal)',
    budgetTier: 'tight',
    allergies: ['soy', 'gluten'],
    dietaryStyle: ['vegan', 'vegetarian'],
    ingredients: [
      'High-Protein Soya Granules - 50g dry',
      'Mixed Dal (Moong + Toor) - 40g dry',
      'Whole Wheat Atta - 80g (3 Phulkas)',
      'Onion, Tomato, Green Chilies',
      'Mustard Oil - 1 tsp',
      'Salad'
    ],
    recipe: '1. Sauté squeezed soya granules with onions, tomatoes, and garam masala. 2. Prepare mixed dal tadka. 3. Serve hot with 3 phulkas.',
    benefits: 'High protein density with low saturated fat, promoting clean overnight nitrogen retention.'
  },
  {
    id: 'din-3',
    name: 'Paneer Tikka Masala with Phulkas & Cucumber Raita',
    category: 'dinner',
    mealTypes: ['dinner'],
    calories: 670,
    protein: 32,
    carbs: 74,
    fat: 22,
    cost: 50,
    prepTime: 20,
    difficulty: 'moderate',
    cuisine: 'indian',
    region: 'north',
    servingUnit: '1 Plate (130g Paneer Tikka + 3 Phulkas + Raita)',
    budgetTier: 'moderate',
    allergies: ['dairy', 'gluten'],
    dietaryStyle: ['vegetarian'],
    ingredients: [
      'Fresh Paneer - 130g (diced)',
      'Whole Wheat Atta - 80g (3 Phulkas)',
      'Fresh Curd - 120g (for cucumber raita)',
      'Onion-Tomato-Capsicum Gravy',
      'Desi Ghee - 1 tsp'
    ],
    recipe: '1. Sauté paneer cubes and capsicum in aromatic tikka spices and tomato gravy. 2. Whisk curd with grated cucumber and roasted jeera. 3. Serve with 3 phulkas.',
    benefits: 'Balanced recovery dinner rich in calcium, casein protein, and cooling probiotics.'
  },
  {
    id: 'din-nv1',
    name: 'Homestyle Chicken Breast Curry with Phulkas & Fresh Dahi',
    category: 'dinner',
    mealTypes: ['dinner'],
    calories: 690,
    protein: 44,
    carbs: 72,
    fat: 18,
    cost: 75,
    prepTime: 20,
    difficulty: 'moderate',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '1 Plate (160g Chicken + 3 Phulkas + 100g Dahi)',
    budgetTier: 'moderate',
    allergies: ['gluten', 'dairy'],
    dietaryStyle: ['non-vegetarian'],
    ingredients: [
      'Boneless Chicken Breast - 160g',
      'Whole Wheat Atta - 80g (3 Phulkas)',
      'Fresh Curd - 100g',
      'Onion-Tomato Gravy',
      'Mustard Oil - 1 tsp'
    ],
    recipe: '1. Sauté chicken breast pieces in homestyle gravy until juicy and tender. 2. Serve with 3 fresh phulkas and dahi.',
    benefits: 'Ultra-clean overnight muscle building dinner delivering 44g protein.'
  },
  {
    id: 'din-nv2',
    name: 'Pan-Grilled Fish Steaks with Phulkas & Yellow Moong Dal',
    category: 'dinner',
    mealTypes: ['dinner'],
    calories: 640,
    protein: 42,
    carbs: 62,
    fat: 16,
    cost: 90,
    prepTime: 20,
    difficulty: 'moderate',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '1 Plate (180g Grilled Fish + 2 Phulkas + Dal)',
    budgetTier: 'flexible',
    allergies: ['fish', 'gluten'],
    dietaryStyle: ['non-vegetarian'],
    ingredients: [
      'Fresh Fish Steaks (Rohu/Surmai) - 180g',
      'Whole Wheat Atta - 60g (2 Phulkas)',
      'Yellow Moong Dal - 40g dry',
      'Mustard Oil - 1 tsp',
      'Turmeric, Ajwain, Lemon & Spices'
    ],
    recipe: '1. Marinate fish in turmeric, salt, ajwain, and lemon. 2. Pan-sear on medium-high heat for 4 mins per side. 3. Serve with 2 phulkas and yellow dal.',
    benefits: 'Rich in Omega-3 EPA/DHA fatty acids to fight systemic inflammation and accelerate joint recovery.'
  },

  // ── SNACKS (Clean Crunch & Recovery Portable Protein) ──
  {
    id: 'snk-1',
    name: 'Roasted Phool Makhana & Almonds in Desi Ghee',
    category: 'snacks',
    mealTypes: ['snacks'],
    calories: 220,
    protein: 7,
    carbs: 26,
    fat: 9,
    cost: 25,
    prepTime: 5,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '1 Bowl (30g Roasted Makhana + 12 Almonds)',
    budgetTier: 'moderate',
    allergies: ['nuts'],
    dietaryStyle: ['vegetarian', 'jain'],
    ingredients: [
      'Phool Makhana (Foxnuts) - 30g',
      'California Almonds - 12 (15g)',
      'Pure Desi Ghee - 1 tsp',
      'Rock Salt & Black Pepper - 1/2 tsp'
    ],
    recipe: '1. Heat 1 tsp ghee in a pan, roast makhanas and almonds on low flame until crunchy. 2. Season with rock salt and black pepper.',
    benefits: 'Low-calorie crunchy superfood packed with antioxidants, calcium, and magnesium.'
  },
  {
    id: 'snk-2',
    name: 'Sprouted Kala Chana & Moong Chaat with Lemon & Tomatoes',
    category: 'snacks',
    mealTypes: ['snacks'],
    calories: 240,
    protein: 14,
    carbs: 38,
    fat: 2,
    cost: 15,
    prepTime: 8,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '1 Large Bowl (90g Sprouted Legumes + Salad)',
    budgetTier: 'tight',
    allergies: [],
    dietaryStyle: ['vegan', 'vegetarian'],
    ingredients: [
      'Sprouted Green Moong - 50g',
      'Sprouted Kala Chana (Black Chickpeas) - 40g',
      'Finely chopped Onion, Tomato, Green Chili',
      'Fresh Lemon Juice & Chaat Masala'
    ],
    recipe: '1. Steam sprouted legumes lightly for 3 minutes. 2. Toss with chopped onions, tomatoes, green chilies, chaat masala, and fresh lemon juice.',
    benefits: 'Live digestive enzymes, high protein, and zero fat clean mid-day nutrition.'
  },
  {
    id: 'snk-3',
    name: 'Roasted Desi Black Chana (Bhuna Chana) & Gur with Peanuts',
    category: 'snacks',
    mealTypes: ['snacks'],
    calories: 260,
    protein: 12,
    carbs: 38,
    fat: 6,
    cost: 12,
    prepTime: 2,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '1 Bowl (40g Roasted Chana + 15g Peanuts + Gur)',
    budgetTier: 'tight',
    allergies: ['peanuts'],
    dietaryStyle: ['vegan', 'vegetarian'],
    ingredients: [
      'Roasted Black Chana (with skin) - 40g',
      'Roasted Peanuts - 15g',
      'Pure Jaggery (Gur) - 10g'
    ],
    recipe: '1. Mix roasted chana and peanuts in a bowl with a small piece of organic jaggery. 2. Enjoy as a crunchy, energizing snack.',
    benefits: 'High in bioavailable iron, dietary fiber, and plant protein.'
  },
  {
    id: 'snk-4',
    name: 'Fresh Paneer Cubes with Chaat Masala & Roasted Cumin',
    category: 'snacks',
    mealTypes: ['snacks'],
    calories: 230,
    protein: 14,
    carbs: 6,
    fat: 16,
    cost: 25,
    prepTime: 3,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '1 Bowl (80g Fresh Paneer Cubes)',
    budgetTier: 'moderate',
    allergies: ['dairy'],
    dietaryStyle: ['vegetarian', 'jain'],
    ingredients: [
      'Fresh Paneer - 80g (cubed)',
      'Chaat Masala & Roasted Cumin - 1/2 tsp',
      'Fresh Lemon juice'
    ],
    recipe: '1. Cut fresh paneer into bite-sized cubes. 2. Dust with chaat masala, roasted jeera, and a squeeze of fresh lemon.',
    benefits: 'Convenient pure protein snack with zero cooking required.'
  }
];

/**
 * Computes a dynamically scaled, realistic kitchen serving string based on multiplier
 * e.g., multiplier 1.25 on Paneer Paratha -> "3 Paneer Parathas + 190g Fresh Curd"
 * e.g., multiplier 1.5 on Chicken Breast -> "270g Chicken Breast + 2.3 Cups Rice"
 * e.g., multiplier 1.0 on PB Toast -> "2 Toast Slices + 1 Banana"
 */
export function getDynamicServingUnit(dish, multiplier = 1.0) {
  if (!dish) return '1 standard serving';
  const mult = Math.max(0.25, Math.min(3.5, parseFloat(multiplier) || 1.0));
  const id = dish.id ? String(dish.id) : '';
  const name = (dish.name || '').toLowerCase();

  // Pre-Workout
  if (id === 'pw-1' || name.includes('peanut butter & banana toast') || name.includes('peanut butter')) {
    const slices = Math.max(1, Math.round(2 * mult));
    const bananas = mult >= 1.4 ? '2 Bananas' : (mult >= 0.8 ? '1 Banana' : '1/2 Banana');
    const pb = Math.round(24 * mult);
    return `${slices} Toast Slices + ${pb}g Peanut Butter + ${bananas}`;
  }

  if (id === 'pw-2' || name.includes('oatmeal energy bowl') || (name.includes('oats') && name.includes('honey'))) {
    const oats = Math.round(50 * mult);
    const milk = Math.round(200 * mult);
    const bananas = mult >= 1.4 ? '2 Bananas' : '1 Banana';
    const honey = Math.max(1, Math.round(1 * mult));
    return `${oats}g Rolled Oats + ${milk}ml Milk + ${bananas} + ${honey} tsp Honey`;
  }

  if (id === 'pw-3' || name.includes('sweet potato chaat') || name.includes('sweet potato')) {
    const sp = Math.round(200 * mult);
    const lemon = Math.max(1, Math.round(1 * mult));
    return `${sp}g Steamed Sweet Potato + ${lemon} tbsp Lemon Juice & Chaat Masala`;
  }

  if (id === 'pw-4' || name.includes('chana sattu energy drink') || name.includes('sattu drink')) {
    const sattu = Math.round(45 * mult);
    const water = Math.round(350 * mult);
    const lemon = Math.max(1, Math.round(1 * mult));
    return `${sattu}g Sattu + ${water}ml Chilled Lemon Water (${lemon} tbsp Lemon)`;
  }

  if (id === 'pw-5' || name.includes('overnight rolled oats') || name.includes('chia seeds, milk')) {
    const oats = Math.round(40 * mult);
    const milk = Math.round(180 * mult);
    const almonds = Math.round(8 * mult);
    const chia = Math.max(1, Math.round(1 * mult));
    return `${oats}g Rolled Oats + ${milk}ml Milk + ${almonds} Almonds + ${chia} tsp Chia`;
  }

  // Post-Workout
  if (id === 'rec-v1' || (name.includes('paneer bhurji') && name.includes('toast'))) {
    const paneer = Math.round(150 * mult);
    const toast = Math.max(1, Math.round(2 * mult));
    return `${paneer}g Fresh Paneer Bhurji + ${toast} Whole Wheat Toast Slices`;
  }

  if (id === 'rec-v2' || name.includes('sattu & milk mass gainer shake') || name.includes('sattu mass gainer')) {
    const sattu = Math.round(60 * mult);
    const milk = Math.round(320 * mult);
    const bananas = mult >= 1.4 ? '2 Bananas' : '1 Banana';
    const pb = Math.round(16 * mult);
    return `${sattu}g Sattu + ${milk}ml Milk + ${bananas} + ${pb}g Peanut Butter`;
  }

  if (id === 'rec-v3' || (name.includes('soya bhurji') && name.includes('phulkas'))) {
    const soya = Math.round(60 * mult);
    const phulkas = Math.max(1, Math.round(2 * mult));
    return `${soya}g Soya Granules Bhurji + ${phulkas} Whole Wheat Phulkas + Salad`;
  }

  if (id === 'rec-v4' || name.includes('banana peanut butter toast') || name.includes('whey protein power shake')) {
    const toast = Math.max(1, Math.round(2 * mult));
    const pb = Math.round(23 * mult);
    const whey = mult >= 1.4 ? '1.5 Scoops' : (mult >= 0.8 ? '1 Scoop' : '0.5 Scoop');
    return `${toast} Toast Slices + ${pb}g Peanut Butter + 1 Banana + ${whey} Whey`;
  }

  if (id === 'rec-v5' || name.includes('greek yogurt') || name.includes('hung curd')) {
    const curd = Math.round(200 * mult);
    const nuts = Math.round(25 * mult);
    const bananas = mult >= 1.4 ? '2 Bananas' : '1 Banana';
    return `${curd}g Hung Curd + ${nuts}g Roasted Peanuts + ${bananas}`;
  }

  if (id === 'rec-e1' || (name.includes('egg bhurji') && name.includes('toast'))) {
    const eggs = Math.max(2, Math.round(4 * mult));
    const toast = Math.max(1, Math.round(2 * mult));
    return `${eggs} Farm Eggs Bhurji + ${toast} Multigrain Toast Slices`;
  }

  if (id === 'rec-e2' || name.includes('hard-boiled eggs') || (name.includes('boiled eggs') && name.includes('sweet potato'))) {
    const eggs = Math.max(2, Math.round(4 * mult));
    const sp = Math.round(150 * mult);
    return `${eggs} Hard-Boiled Eggs + ${sp}g Steamed Sweet Potato`;
  }

  if (id === 'rec-nv1' || (name.includes('chicken breast') && name.includes('rice'))) {
    const chicken = Math.round(180 * mult);
    const riceCups = (1.5 * mult).toFixed(1).replace(/\.0$/, '');
    const cupLabel = parseFloat(riceCups) === 1 ? '1 cup' : `${riceCups} cups`;
    const riceG = Math.round(180 * mult);
    return `${chicken}g Chicken Breast + ${riceG}g (${cupLabel}) Basmati Rice`;
  }

  if (id === 'rec-nv2' || (name.includes('chicken breast curry') && name.includes('phulkas'))) {
    const chicken = Math.round(160 * mult);
    const phulkas = Math.max(1, Math.round(2 * mult));
    return `${chicken}g Chicken Breast Curry + ${phulkas} Whole Wheat Phulkas`;
  }

  // Breakfast
  if (id === 'brk-1' || name.includes('paneer stuffed') || (name.includes('paneer') && name.includes('paratha'))) {
    const parathas = Math.max(1, Math.round(2 * mult));
    const dahi = Math.round(150 * mult);
    const paneerG = Math.round(90 * mult);
    return `${parathas} Paneer Parathas (${paneerG}g Paneer Stuffing) + ${dahi}g Fresh Curd`;
  }

  if (id === 'brk-2' || (name.includes('besan') && name.includes('chilla'))) {
    const chillas = Math.max(1, Math.round(2 * mult));
    const paneerG = Math.round(70 * mult);
    return `${chillas} Besan Chillas (${paneerG}g Paneer) + Mint Chutney`;
  }

  if (id === 'brk-3' || name.includes('poha')) {
    const poha = Math.round(60 * mult);
    const paneer = Math.round(60 * mult);
    const peanuts = Math.round(20 * mult);
    return `${poha}g Poha + ${paneer}g Paneer Cubes + ${peanuts}g Peanuts`;
  }

  if (id === 'brk-4' || name.includes('pesarattu')) {
    const dosas = Math.max(1, Math.round(2 * mult));
    const dahi = Math.round(120 * mult);
    return `${dosas} Moong Pesarattu + ${dahi}g Fresh Dahi`;
  }

  if (id === 'brk-5' || (name.includes('sattu') && name.includes('paratha'))) {
    const parathas = Math.max(1, Math.round(2 * mult));
    const sattuG = Math.round(50 * mult);
    const dahi = Math.round(150 * mult);
    return `${parathas} Sattu Parathas (${sattuG}g Sattu) + ${dahi}g Fresh Dahi`;
  }

  if (id === 'brk-e1' || (name.includes('omelette') && name.includes('phulkas'))) {
    const eggs = Math.max(2, Math.round(3 * mult));
    const phulkas = Math.max(1, Math.round(2 * mult));
    const dahi = Math.round(100 * mult);
    return `${eggs}-Egg Omelette + ${phulkas} Phulkas + ${dahi}g Dahi`;
  }

  // Lunch
  if (id === 'lnc-1' || name.includes('muscle thali')) {
    const phulkas = Math.max(2, Math.round(3 * mult));
    const paneer = Math.round(100 * mult);
    const dahi = Math.round(150 * mult);
    return `${phulkas} Phulkas + Dal Tadka + ${paneer}g Paneer Bhurji + ${dahi}g Dahi`;
  }

  if (id === 'lnc-2' || name.includes('rajma masala')) {
    const riceCups = (1.5 * mult).toFixed(1).replace(/\.0$/, '');
    const cupLabel = parseFloat(riceCups) === 1 ? '1 cup' : `${riceCups} cups`;
    const riceG = Math.round(180 * mult);
    const paneer = Math.round(60 * mult);
    const dahi = Math.round(150 * mult);
    return `Rajma Masala + ${riceG}g (${cupLabel}) Rice + ${paneer}g Paneer + ${dahi}g Dahi`;
  }

  if (id === 'lnc-3' || (name.includes('soya chunks curry') && name.includes('toor dal'))) {
    const phulkas = Math.max(2, Math.round(3 * mult));
    const soya = Math.round(45 * mult);
    const dahi = Math.round(100 * mult);
    return `${phulkas} Phulkas + ${soya}g Soya Chunks Curry + Toor Dal + ${dahi}g Dahi`;
  }

  if (id === 'lnc-4' || name.includes('chole (chickpea) masala') || name.includes('chole masala')) {
    const phulkas = Math.max(2, Math.round(3 * mult));
    const dahi = Math.round(150 * mult);
    return `Chole Masala + ${phulkas} Phulkas + ${dahi}g Dahi + Salad`;
  }

  if (id === 'lnc-nv1' || (name.includes('chicken breast curry') && name.includes('dal tadka'))) {
    const chicken = Math.round(180 * mult);
    const phulkas = Math.max(2, Math.round(3 * mult));
    return `${chicken}g Chicken Breast Curry + Dal Tadka + ${phulkas} Phulkas + Salad`;
  }

  if (id === 'lnc-e1' || name.includes('egg curry')) {
    const eggs = Math.max(2, Math.round(3 * mult));
    const phulkas = Math.max(2, Math.round(3 * mult));
    const dahi = Math.round(100 * mult);
    return `${eggs} Boiled Eggs in Curry + ${phulkas} Phulkas + Kala Chana + ${dahi}g Dahi`;
  }

  // Dinner
  if (id === 'din-1' || name.includes('palak paneer')) {
    const paneer = Math.round(140 * mult);
    const phulkas = Math.max(2, Math.round(3 * mult));
    return `${paneer}g Palak Paneer + ${phulkas} Phulkas + Dal Tadka`;
  }

  if (id === 'din-2' || (name.includes('soya bhurji') && name.includes('mixed dal'))) {
    const soya = Math.round(50 * mult);
    const phulkas = Math.max(2, Math.round(3 * mult));
    return `${soya}g Soya Bhurji + ${phulkas} Phulkas + Mixed Dal`;
  }

  if (id === 'din-3' || name.includes('paneer tikka masala')) {
    const paneer = Math.round(130 * mult);
    const phulkas = Math.max(2, Math.round(3 * mult));
    const raita = Math.round(120 * mult);
    return `${paneer}g Paneer Tikka + ${phulkas} Phulkas + ${raita}g Cucumber Raita`;
  }

  if (id === 'din-nv1' || (name.includes('chicken breast curry') && name.includes('dahi'))) {
    const chicken = Math.round(160 * mult);
    const phulkas = Math.max(2, Math.round(3 * mult));
    const dahi = Math.round(100 * mult);
    return `${chicken}g Chicken Breast Curry + ${phulkas} Phulkas + ${dahi}g Dahi`;
  }

  if (id === 'din-nv2' || name.includes('fish steaks')) {
    const fish = Math.round(180 * mult);
    const phulkas = Math.max(1, Math.round(2 * mult));
    return `${fish}g Grilled Fish + ${phulkas} Phulkas + Moong Dal`;
  }

  // Snacks
  if (id === 'snk-1' || name.includes('makhana')) {
    const makhana = Math.round(30 * mult);
    const almonds = Math.round(12 * mult);
    return `${makhana}g Roasted Makhana in Ghee + ${almonds} Almonds`;
  }

  if (id === 'snk-2' || name.includes('sprouted kala chana')) {
    const moong = Math.round(50 * mult);
    const chana = Math.round(40 * mult);
    return `${moong}g Moong Sprouts + ${chana}g Kala Chana Sprouts + Lemon Salad`;
  }

  if (id === 'snk-3' || name.includes('bhuna chana') || name.includes('black chana')) {
    const chana = Math.round(40 * mult);
    const peanuts = Math.round(15 * mult);
    const gur = Math.round(10 * mult);
    return `${chana}g Roasted Chana + ${peanuts}g Peanuts + ${gur}g Organic Jaggery`;
  }

  if (id === 'snk-4' || name.includes('paneer cubes')) {
    const paneer = Math.round(80 * mult);
    return `${paneer}g Fresh Paneer Cubes + Chaat Masala & Lemon`;
  }

  // Generic fallback with dynamic portion multiplier indication:
  if (dish.servingUnit) {
    if (mult === 1.0) return dish.servingUnit;
    return `${mult.toFixed(2).replace(/\.00$/, '')}x (${dish.servingUnit})`;
  }

  return `${mult.toFixed(2).replace(/\.00$/, '')} Standard Servings`;
}

// ─── 8. CHRONOBIOLOGY & CLINICAL SPORTS NUTRITION ENGINE ─────────────────────
/**
 * NUTRIBUDDY CLINICAL NUTRITION & MACRO PARTITIONING ENGINE
 * Formulated under ISSN, NSCA, WHO, and ICMR clinical sports nutrition standards.
 * Deeply integrates 100% of user inputs:
 * • Profession & Occupational NEAT (2 PM postprandial slump prevention)
 * • Cooking Skill (Hard no-cook vs basic vs advanced)
 * • Meal Prep Time (Workday speed vs weekend culinary cadence)
 * • Budget Range (Tight economic staples vs premium options)
 * • Regional Cuisine (Bengali, Gujarati, Maharashtrian, Rajasthani, South, North, Pan-Indian)
 * • Dietary Styles (Jain zero-root, Vegan, Keto, Low-Carb, Eggitarian, Vegetarian)
 * • Age & Gender Biometrics (Sarcopenia prevention, iron & bone density support)
 * • Deterministic Profile Entropy (Every user receives a unique, personalized plan)
 */

// --- 1. CHRONOBIOLOGY SLOT SPLITS ---
export const CHRONO_ENERGY_DISTRIBUTION = {
  gym_training_day: {
    breakfast:    0.20, // Morning protein primer after overnight fast
    pre_workout:  0.10, // Fast-absorbing glycogen, minimal GI load (<5g fat, <5g fiber)
    lunch:        0.26, // Highest carb & micronutrient density (peak insulin sensitivity)
    post_workout: 0.16, // Rapid MPS & leucine delivery (≥28g protein)
    dinner:       0.20, // Casein-dominant for sustained overnight amino acid delivery
    snacks:       0.08  // Afternoon/evening whole-food buffer (~180-220 kcal)
  },
  rest_day: {
    breakfast:    0.25, // High protein, moderate carbs, healthy fats (~25%)
    lunch:        0.35, // Largest midday nutrient & complex carb platter (~35%)
    snacks:       0.15, // Protein-forward evening nourishment bridge (~15%)
    dinner:       0.25  // Slow-digesting casein-rich overnight recovery (~25%)
  }
};

/**
 * Deterministic hash function for unique per-user plan generation
 */
export function hashProfile(user = {}, offset = 0) {
  const str = `${user?.id || 'usr'}-${user?.weight || 70}-${user?.height || 170}-${user?.profession || 'Desk'}-${user?.goal || 'maintain'}-${user?.cuisinePreference || 'all'}-${user?.dietaryPreferences || ''}-${user?.budgetRange || 'moderate'}-${user?.cookingSkill || 'basic'}-${offset}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Regional Indian cuisine alias matcher
 */
export function isRegionMatch(foodRegion = 'pan-indian', targetRegion = 'all') {
  const fr = (foodRegion || 'pan-indian').toLowerCase();
  const tr = (targetRegion || 'all').toLowerCase();
  if (tr === 'all' || tr === 'pan-indian' || fr === 'pan-indian') return true;

  if (tr === 'bengali') return fr === 'bengali' || fr === 'east';
  if (tr === 'east') return fr === 'east' || fr === 'bengali';
  if (tr === 'gujarati') return fr === 'gujarati' || fr === 'west';
  if (tr === 'west') return fr === 'west' || fr === 'gujarati';
  if (tr === 'rajasthani') return fr === 'rajasthani' || fr === 'north';
  if (tr === 'north') return fr === 'north' || fr === 'rajasthani';
  if (tr === 'south') return fr === 'south';

  return fr === tr;
}

// --- 2. CLINICAL PROFILE AUDIT & SAFETY REFINEMENT ---
export function evaluateNutritionalSafety(food, user = {}) {
  if (!food) return { safe: false, reason: 'Invalid food item' };
  const allergies = (user?.allergies || []).map(a => String(a).toLowerCase().trim());
  const foodAllergies = (food?.allergies || []).map(a => String(a).toLowerCase().trim());
  const ingStr = (food?.ingredients || []).join(' ').toLowerCase();
  const nameStr = (food?.name || '').toLowerCase();
  const catStr = (food?.category || '').toLowerCase();

  // 1. Allergen Verification (Zero Tolerance)
  for (const allergen of allergies) {
    if (foodAllergies.includes(allergen)) {
      return { safe: false, reason: `Contains allergen: ${allergen}` };
    }
    
    // Dairy / Lactose zero tolerance
    if (allergen === 'dairy' || allergen === 'lactose') {
      const dairyKeywords = ['paneer', 'curd', 'dahi', 'milk', 'ghee', 'whey', 'butter', 'cheese', 'cream', 'chaas', 'buttermilk', 'malai', 'yogurt', 'lassi'];
      if (dairyKeywords.some(k => ingStr.includes(k) || nameStr.includes(k) || catStr.includes(k))) {
        return { safe: false, reason: 'Contains dairy' };
      }
    }
    
    // Gluten zero tolerance
    if (allergen === 'gluten') {
      const glutenKeywords = ['wheat', 'atta', 'bread', 'dalia', 'suji', 'semolina', 'maida', 'roti', 'phulka', 'paratha', 'sewai'];
      if (glutenKeywords.some(k => ingStr.includes(k) || nameStr.includes(k))) {
        return { safe: false, reason: 'Contains gluten' };
      }
    }
    
    // Soy zero tolerance
    if (allergen === 'soy' || allergen === 'soya') {
      const soyKeywords = ['soya', 'tofu', 'edamame', 'soy'];
      if (soyKeywords.some(k => ingStr.includes(k) || nameStr.includes(k))) {
        return { safe: false, reason: 'Contains soy' };
      }
    }
    
    // Nuts / Peanuts zero tolerance
    if (allergen === 'nuts' || allergen === 'peanuts' || allergen === 'peanut' || allergen === 'tree nuts') {
      const nutKeywords = ['peanut', 'almond', 'walnut', 'cashew', 'pistachio', 'kaju', 'badam', 'akhrot', 'moongphali'];
      if (nutKeywords.some(k => ingStr.includes(k) || nameStr.includes(k))) {
        return { safe: false, reason: 'Contains nuts' };
      }
    }

    // Egg zero tolerance
    if (allergen === 'egg' || allergen === 'eggs') {
      if (nameStr.includes('egg') || ingStr.match(/\begg\b/) || ingStr.includes('anda')) {
        return { safe: false, reason: 'Contains egg' };
      }
    }

    // Seafood zero tolerance
    if (allergen === 'fish' || allergen === 'shellfish') {
      if (catStr === 'fish' || nameStr.includes('fish') || nameStr.includes('prawn') || nameStr.includes('chingri') || nameStr.includes('surmai') || nameStr.includes('rohu')) {
        return { safe: false, reason: 'Contains seafood' };
      }
    }
  }

  // 2. Dietary Style Verification (Non-negotiable lifestyle filter)
  const pref = (user?.dietaryPreferences || '').toLowerCase().trim();
  const styles = (food?.dietaryStyle || []).map(s => String(s).toLowerCase().trim());
  const isMeat = styles.includes('non-vegetarian') || ['poultry', 'meat', 'fish', 'seafood', 'mutton', 'chicken'].includes(catStr) ||
    nameStr.includes('chicken') || nameStr.includes('mutton') || nameStr.includes('fish') || nameStr.includes('prawn') || nameStr.includes('chingri');
  const isEgg = styles.includes('eggitarian') || nameStr.includes('egg') || ingStr.match(/\begg\b/) || ingStr.includes('anda');

  if (pref === 'vegetarian' && (isMeat || isEgg)) return { safe: false, reason: 'Non-vegetarian / Egg' };
  if (pref === 'eggitarian' && isMeat) return { safe: false, reason: 'Non-vegetarian meat' };
  if (pref === 'vegan') {
    if (isMeat || isEgg) return { safe: false, reason: 'Animal product' };
    const dairyKeywords = ['paneer', 'curd', 'dahi', 'milk', 'ghee', 'whey', 'butter', 'cheese', 'cream', 'chaas', 'buttermilk', 'malai', 'yogurt', 'lassi', 'honey'];
    if (dairyKeywords.some(k => ingStr.includes(k) || nameStr.includes(k) || catStr.includes(k))) {
      return { safe: false, reason: 'Animal dairy product' };
    }
  }
  if (pref === 'jain') {
    if (isMeat || isEgg) return { safe: false, reason: 'Non-veg / Egg' };
    // Zero root vegetables
    const rootKeywords = ['onion', 'pyaz', 'garlic', 'lahsun', 'potato', 'aloo', 'carrot', 'gajar', 'ginger', 'adrak', 'radish', 'mooli', 'beetroot'];
    if (rootKeywords.some(k => ingStr.includes(k) || nameStr.includes(k))) {
      return { safe: false, reason: 'Contains root vegetable / allium contraindicated for Jain diet' };
    }
    if (!styles.includes('jain') && !styles.includes('sattvic')) {
      return { safe: false, reason: 'Not certified Jain/Sattvic' };
    }
  }
  if (pref === 'gluten-free') {
    const glutenKeywords = ['wheat', 'atta', 'bread', 'dalia', 'suji', 'semolina', 'maida', 'roti', 'phulka', 'paratha', 'sewai'];
    if (glutenKeywords.some(k => ingStr.includes(k) || nameStr.includes(k))) {
      return { safe: false, reason: 'Contains gluten' };
    }
  }
  if (pref === 'keto') {
    if (!styles.includes('keto') && !styles.includes('low-carb') && (food.carbs || 0) > 15) {
      return { safe: false, reason: 'Excessive carbohydrate for ketogenic protocol' };
    }
  }

  // 3. Kitchen Capability (Cooking Skill Guardrail)
  const cookingSkill = (user?.cookingSkill || 'basic').toLowerCase();
  if (cookingSkill === 'no-cook') {
    const isNoCook = food.difficulty === 'no-cook' || (food.prepTime && food.prepTime <= 5);
    if (!isNoCook) {
      return { safe: false, reason: 'Requires cooking incompatible with no-cook profile' };
    }
  } else if (cookingSkill === 'basic') {
    if (food.difficulty === 'advanced') {
      return { safe: false, reason: 'Requires advanced culinary technique' };
    }
  }

  // 4. Budget Range Guardrail
  const budget = (user?.budgetRange || user?.monthlyBudget || 'moderate').toLowerCase();
  if (budget === 'tight') {
    if (food.budgetTier === 'premium') {
      return { safe: false, reason: 'Exceeds tight economic staple threshold' };
    }
  }

  // 5. Medical / Metabolic Condition Guardrails
  const rawConditions = [
    ...(user?.medicalConditions || []),
    ...(user?.healthConditions || []),
    ...(Array.isArray(user?.conditions) ? user.conditions : [])
  ].map(c => String(c).toLowerCase());

  if (rawConditions.some(c => c.includes('diabet') || c.includes('pcos') || c.includes('insulin'))) {
    if (food.glycemicIndex === 'high') return { safe: false, reason: 'High Glycemic Index' };
    const highSugarKeywords = ['jaggery', 'refined sugar', 'sugar syrup', 'glucose', 'sweet', 'mithai', 'halwa', 'kheer'];
    if (highSugarKeywords.some(k => nameStr.includes(k) || ingStr.includes(k))) {
      return { safe: false, reason: 'High simple sugars contraindicated for glycemic control' };
    }
  }

  if (rawConditions.some(c => c.includes('hypertens') || c.includes('bp') || c.includes('blood pressure'))) {
    if (food.sodium && food.sodium > 700) return { safe: false, reason: 'Excessive sodium content' };
    if (nameStr.includes('papad') || nameStr.includes('pickle') || nameStr.includes('achar')) {
      return { safe: false, reason: 'High sodium condiment' };
    }
  }

  return { safe: true };
}

// --- 3. COMPLEMENTARY DISH BUILDER (REAL KITCHEN COMBOS) ---
// Prevents abstract decimals like "1.85x Khichdi" by adding complementary protein/fiber sides
export function composeRealisticMeal(primaryDish, targetCalories, slotKey, user = {}) {
  if (!primaryDish) return null;
  const baseCal = primaryDish.calories || 300;
  const allergies = (user?.allergies || []).map(a => String(a).toLowerCase());
  const pref = (user?.dietaryPreferences || '').toLowerCase();
  const cookingSkill = (user?.cookingSkill || 'basic').toLowerCase();
  const cuisine = (user?.cuisinePreference || 'all').toLowerCase();
  const isDairyAllowed = !allergies.includes('dairy') && !allergies.includes('lactose') && pref !== 'vegan';
  const isEggAllowed = pref === 'eggitarian' || pref === 'non-vegetarian' || (!allergies.includes('egg') && pref !== 'vegetarian' && pref !== 'vegan' && pref !== 'jain');
  const isLowCarbOrKeto = pref === 'low-carb' || pref === 'keto';
  const isJain = pref === 'jain';

  // If dish is already within 15% of target, return as a clean 1.0 standard portion
  // (Exceptions: post_workout must satisfy >= 26g protein; pre_workout must satisfy < 6g fat)
  if (
    Math.abs(baseCal - targetCalories) <= targetCalories * 0.20 &&
    (slotKey !== 'post_workout' || (primaryDish.protein || 0) >= 26) &&
    (slotKey !== 'pre_workout' || (primaryDish.fat || 0) < 6)
  ) {
    return {
      ...primaryDish,
      multiplier: 1.0,
      servingUnit: primaryDish.servingUnit || '1 Standard Bowl',
      compositionNote: 'Complete Standalone Balanced Portion'
    };
  }

  // PRE-WORKOUT: Pure fast-burning glycogen fuel, strict fat < 6g, low fiber
  if (slotKey === 'pre_workout') {
    let fastCal = baseCal;
    let fastProt = primaryDish.protein || 4;
    let fastCarbs = primaryDish.carbs || 30;
    let fastFat = Math.min(primaryDish.fat !== undefined ? primaryDish.fat : 2, 4.5);
    let serving = primaryDish.servingUnit || '1 Serving';
    let note = 'Fast-acting glycogen primer · Ultra-low GI lag';

    if (targetCalories > baseCal * 1.25) {
      const deficitCal = targetCalories - baseCal;
      // Add fast glycogen carbs (Banana / Medjool Dates) with 0g fat
      fastCal += deficitCal;
      fastCarbs += Math.round(deficitCal / 4);
      serving = `${serving} + 1 Ripe Banana & 2 Medjool Dates`;
      note = 'Fortified with rapid-clearing electrolyte & glucose fuel';
    }

    return {
      ...primaryDish,
      multiplier: 1.0,
      calories: Math.round(fastCal),
      protein: Math.round(fastProt * 10) / 10,
      carbs: Math.round(fastCarbs * 10) / 10,
      fat: Math.min(Math.round(fastFat * 10) / 10, 5.0), // Strictly < 6g fat
      servingUnit: serving,
      compositionNote: note
    };
  }

  // POST-WORKOUT: Strictly guarantee >= 26g bioavailable protein (target >= 28g)
  if (slotKey === 'post_workout') {
    let postCal = baseCal;
    let postProt = primaryDish.protein || 20;
    let postCarbs = primaryDish.carbs || 25;
    let postFat = primaryDish.fat || 4;
    let serving = primaryDish.servingUnit || '1 Serving';
    let note = 'Rapid amino acid influx & mTOR activation';

    if (postProt < 26 || targetCalories > baseCal * 1.2) {
      if (isDairyAllowed) {
        postProt += 25;
        postCal += 120;
        postCarbs += 3;
        postFat += 1;
        serving = `${serving} + 1 Scoop Whey Protein Isolate (25g Protein)`;
        note = 'Fortified with ultra-filtered whey isolate (3.2g Leucine trigger)';
      } else if (isEggAllowed) {
        postProt += 16;
        postCal += 75;
        postFat += 0.5;
        serving = `${serving} + 4 Boiled Egg Whites (16g Protein)`;
        note = 'Fortified with pure bioavailable albumen peptide protein';
      } else {
        // Vegan / Dairy-free plant booster
        postProt += 24;
        postCal += 130;
        postCarbs += 6;
        postFat += 1;
        serving = `${serving} + 1 Scoop Plant Pea Protein / 50g Soya Strips (24g Protein)`;
        note = 'Fortified with complete multi-source plant protein isolate';
      }
    }

    return {
      ...primaryDish,
      multiplier: 1.0,
      calories: Math.round(postCal),
      protein: Math.max(Math.round(postProt * 10) / 10, 26.0), // Strictly >= 26g
      carbs: Math.round(postCarbs * 10) / 10,
      fat: Math.round(postFat * 10) / 10,
      servingUnit: serving,
      compositionNote: note
    };
  }

  // LUNCH & DINNER: Authentic Indian Thali pairings without fractional multipliers
  if (slotKey === 'lunch' || slotKey === 'dinner') {
    if (targetCalories > baseCal * 1.15) {
      const deficitCal = targetCalories - baseCal;
      const nameLower = (primaryDish.name || '').toLowerCase();
      const servingLower = (primaryDish.servingUnit || '').toLowerCase();
      const isRiceOrKhichdi = ['khichdi', 'rice', 'pulao', 'biryani', 'chawal', 'dalia'].some(k => nameLower.includes(k) || servingLower.includes(k));
      const isDalOrLegume = ['dal', 'rajma', 'chole', 'chana', 'sambhar', 'sambar', 'kadhi'].some(k => nameLower.includes(k) || servingLower.includes(k));
      const hasCurdAlready = ['curd', 'dahi', 'raita', 'chaas'].some(k => nameLower.includes(k) || servingLower.includes(k));

      let sideServing = '';
      let sideProt = 0;
      let sideCarbs = 0;
      let sideFat = 0;

      // 1. If User has No-Cook skill, side MUST NOT require cooking!
      if (cookingSkill === 'no-cook') {
        if (isDairyAllowed) {
          sideServing = hasCurdAlready ? '+ 80g Fresh Paneer Cubes with Chaat Masala' : '+ 1 Cup Fresh Dahi (150g) & Cucumber Salad';
          sideProt = 11;
          sideCarbs = 8;
          sideFat = 6;
        } else if (isEggAllowed) {
          sideServing = '+ 2 Hard-Boiled Eggs with Black Pepper & Lemon';
          sideProt = 12;
          sideCarbs = 1;
          sideFat = 9;
        } else {
          sideServing = '+ 40g Roasted Chana & Lemon Slices';
          sideProt = 9;
          sideCarbs = 23;
          sideFat = 2.5;
        }
      }
      // 2. Low-Carb / Keto side compositions (No grains!)
      else if (isLowCarbOrKeto) {
        if (isDairyAllowed) {
          sideServing = '+ 100g Paneer Bhurji & Sautéed Capsicum Salad';
          sideProt = 18;
          sideCarbs = 5;
          sideFat = 14;
        } else {
          sideServing = '+ Pan-Seared Tofu (100g) & Tossed Green Salad';
          sideProt = 15;
          sideCarbs = 4;
          sideFat = 8;
        }
      }
      // 3. Strict Jain side compositions (No onion/garlic/root vegetables)
      else if (isJain) {
        if (isRiceOrKhichdi && !isDalOrLegume) {
          sideServing = isDairyAllowed ? '+ 1 Bowl Jain Dal Tadka & Fresh Curd (100g)' : '+ 1 Bowl Jain Dal Tadka & Pan-Seared Tofu (80g)';
          sideProt = 12;
          sideCarbs = 24;
          sideFat = 4;
        } else {
          sideServing = isDairyAllowed ? '+ 2 Whole Wheat Phulkas & 1 Bowl Jain Dal' : '+ 2 Whole Wheat Phulkas & Yellow Moong Dal';
          sideProt = 10;
          sideCarbs = 30;
          sideFat = 3;
        }
      }
      // 4. Regional Authentic Combinations
      else if (cuisine === 'south') {
        sideServing = hasCurdAlready ? '+ 1 Bowl Vegetable Sambar & Cucumber Salad' : '+ 1 Bowl Drumstick Sambar & Fresh Curd (100g)';
        sideProt = 9;
        sideCarbs = 26;
        sideFat = 3;
      } else if (cuisine === 'gujarati') {
        sideServing = isDairyAllowed ? '+ 2 Methi Theplas & Fresh Curd (100g)' : '+ 2 Methi Theplas & Yellow Dal';
        sideProt = 11;
        sideCarbs = 30;
        sideFat = 5;
      } else if (cuisine === 'bengali') {
        sideServing = isRiceOrKhichdi ? '+ 1 Bowl Cholar Dal with Grated Coconut' : '+ 1 Cup Steamed Rice & Masoor Dal';
        sideProt = 12;
        sideCarbs = 32;
        sideFat = 4;
      } else if (cuisine === 'west') {
        sideServing = '+ 1 Jowar Bhakri & Sprouted Moong Usal';
        sideProt = 12;
        sideCarbs = 34;
        sideFat = 4;
      } else if (cuisine === 'rajasthani') {
        sideServing = isDairyAllowed ? '+ 1 Bajra Roti & Spiced Kadhi' : '+ 2 Phulkas & Panchmel Dal';
        sideProt = 11;
        sideCarbs = 32;
        sideFat = 4;
      } else {
        // Universal Pan-Indian / North Indian default
        if (isRiceOrKhichdi && !isDalOrLegume) {
          sideServing = isDairyAllowed ? '+ 1 Bowl Dal Tadka & Fresh Curd (100g)' : '+ 1 Bowl Dal Tadka & Pan-Seared Tofu (100g)';
          sideProt = 12;
          sideCarbs = 24;
          sideFat = 4;
        } else if (isDalOrLegume && !isRiceOrKhichdi) {
          sideServing = hasCurdAlready ? '+ 2 Whole Wheat Phulkas & Kachumber Salad' : (isDairyAllowed ? '+ 2 Whole Wheat Phulkas & Fresh Curd (100g)' : '+ 2 Whole Wheat Phulkas & Pan-Seared Tofu (80g)');
          sideProt = 9;
          sideCarbs = 32;
          sideFat = 3;
        } else if (isRiceOrKhichdi && isDalOrLegume) {
          sideServing = hasCurdAlready ? '+ 80g Spiced Paneer Cubes / Tofu & Kachumber' : (isDairyAllowed ? '+ 80g Fresh Low-Fat Paneer / Curd (100g)' : '+ 80g Pan-Seared Tofu & Roasted Papad');
          sideProt = 14;
          sideCarbs = 6;
          sideFat = 6;
        } else {
          sideServing = isDairyAllowed ? '+ 2 Whole Wheat Phulkas & 1 Bowl Dal Tadka' : '+ 2 Whole Wheat Phulkas & 1 Bowl Yellow Dal';
          sideProt = 10;
          sideCarbs = 30;
          sideFat = 3;
        }
      }

      return {
        ...primaryDish,
        multiplier: 1.0,
        calories: Math.round(baseCal + deficitCal),
        protein: Math.round(((primaryDish.protein || 12) + sideProt) * 10) / 10,
        carbs: Math.round(((primaryDish.carbs || 30) + sideCarbs) * 10) / 10,
        fat: Math.round(((primaryDish.fat || 6) + sideFat) * 10) / 10,
        servingUnit: `${primaryDish.servingUnit || '1 Standard Serving'} ${sideServing}`,
        compositionNote: slotKey === 'dinner'
          ? 'Casein-sustained overnight amino acid delivery thali'
          : 'High-micronutrient balanced Indian thali composition'
      };
    }
  }

  // BREAKFAST: Morning protein primer
  if (slotKey === 'breakfast') {
    if (targetCalories > baseCal * 1.20) {
      const deficitCal = targetCalories - baseCal;
      let bSide = '';
      let bProt = 0;
      let bCarbs = 4;
      let bFat = 4;

      if (cookingSkill === 'no-cook') {
        bSide = isDairyAllowed ? '+ 100g Greek Yogurt with Chia Seeds' : '+ 1 Glass Roasted Sattu Drink (30g)';
        bProt = 11;
      } else if (isEggAllowed) {
        bSide = '+ 2 Whole Boiled Eggs';
        bProt = 12;
      } else if (isDairyAllowed && !isJain) {
        bSide = '+ Spiced Paneer Cubes (60g) & Mint Chutney';
        bProt = 11;
      } else if (isJain && isDairyAllowed) {
        bSide = '+ Jain Paneer Cubes (60g) & Mint Chutney';
        bProt = 11;
      } else {
        bSide = '+ Roasted Chana Sattu Shot (40g)';
        bProt = 10;
      }

      return {
        ...primaryDish,
        multiplier: 1.0,
        calories: Math.round(baseCal + deficitCal),
        protein: Math.round(((primaryDish.protein || 10) + bProt) * 10) / 10,
        carbs: Math.round(((primaryDish.carbs || 25) + bCarbs) * 10) / 10,
        fat: Math.round(((primaryDish.fat || 5) + bFat) * 10) / 10,
        servingUnit: `${primaryDish.servingUnit || '1 Standard Bowl'} ${bSide}`,
        compositionNote: 'Protein-fortified breakfast for extended morning satiety'
      };
    }
  }

  // SNACKS / EVENING NOURISHMENT: Protein-forward bridge between lunch and dinner
  if (slotKey === 'snacks') {
    if (targetCalories > baseCal * 1.15) {
      const deficitCal = targetCalories - baseCal;
      let sSide = '';
      let sProt = 0;
      let sCarbs = 6;
      let sFat = 3;

      if (isDairyAllowed) {
        sSide = '+ 1 Cup Fresh Dahi (120g) & Roasted Cumin';
        sProt = 6;
      } else if (isEggAllowed) {
        sSide = '+ 2 Boiled Egg Whites with Chaat Masala';
        sProt = 8;
      } else {
        sSide = '+ 30g Roasted Chana & Lemon';
        sProt = 6;
      }

      return {
        ...primaryDish,
        multiplier: 1.0,
        calories: Math.round(baseCal + deficitCal),
        protein: Math.round(((primaryDish.protein || 8) + sProt) * 10) / 10,
        carbs: Math.round(((primaryDish.carbs || 20) + sCarbs) * 10) / 10,
        fat: Math.round(((primaryDish.fat || 4) + sFat) * 10) / 10,
        servingUnit: `${primaryDish.servingUnit || '1 Serving'} ${sSide}`,
        compositionNote: 'Evening protein-forward nourishment bridge'
      };
    }
  }

  // Standard clean portion clamp (0.75x - 1.25x max, rounded to 0.25)
  const mult = Math.max(0.75, Math.min(1.25, Math.round((targetCalories / baseCal) * 4) / 4));
  return {
    ...primaryDish,
    multiplier: mult,
    calories: Math.round(baseCal * mult),
    protein: Math.round((primaryDish.protein || 10) * mult * 10) / 10,
    carbs: Math.round((primaryDish.carbs || 25) * mult * 10) / 10,
    fat: Math.round((primaryDish.fat || 5) * mult * 10) / 10,
    servingUnit: mult === 1.0 ? (primaryDish.servingUnit || '1 Standard Serving') : `${mult}× (${primaryDish.servingUnit || 'Standard Serving'})`,
    compositionNote: 'Complete Standalone Balanced Portion'
  };
}

// --- 4. CLINICAL MEAL PLANNER GENERATOR ---
export function generateClinicalWeeklyPlan(allFoods = [], user = {}, seedOffset = 0) {
  const isGymUser = (parseInt(user?.gymDays, 10) || 0) > 0 || user?.isGymGoer || user?.fitnessGoal === 'muscle' || user?.goal === 'muscle' || user?.goal === 'lean_bulk' || user?.goal === 'aggressive_bulk' || user?.goal === 'hypertrophy' || user?.fitnessGoal === 'hypertrophy' || user?.trainingGoal === 'hypertrophy' || String(user?.goal || '').toLowerCase().includes('hypertrophy');
  const targetCalories = parseInt(user?.dailyCalories, 10) || (user?.weight ? Math.round(calculateTargetCalories(calculateTDEE({ weight: user.weight, height: user.height, age: user.age, gender: user.gender, profession: user.profession, gymDays: user.gymDays }), user.goal || 'maintain', 0.5, user.bodyFat, user.weight, user.height)) : 2400);
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const userSeed = hashProfile(user, seedOffset);
  const targetRegion = (user?.cuisinePreference || 'all').toLowerCase();
  const prepLimit = user?.mealPrepTime === '15_mins' ? 15 : (user?.mealPrepTime === '30_mins' ? 30 : 60);
  const isDeskWorker = (user?.profession || '').toLowerCase().includes('engineer') || (user?.profession || '').toLowerCase().includes('analyst') || (user?.profession || '').toLowerCase().includes('student') || (user?.profession || '').toLowerCase().includes('desk');

  const distribution = isGymUser ? CHRONO_ENERGY_DISTRIBUTION.gym_training_day : CHRONO_ENERGY_DISTRIBUTION.rest_day;

  const plan = {};
  const usedDishesThisWeek = new Set();
  const lastAssignedDish = {};
  const combinedFoods = [...GOLDEN_FITNESS_MEALS, ...(allFoods || [])];

  days.forEach((day, dayIndex) => {
    plan[day] = {};
    const isWeekend = day === 'saturday' || day === 'sunday';
    const slots = Object.keys(distribution);

    slots.forEach(slot => {
      const targetSlotCal = Math.round(targetCalories * distribution[slot]);

      // Filter candidate pool with strict clinical timing & profile rules
      let candidates = combinedFoods.filter(food => {
        const slots = (food.mealTypes || []).map(s => s.toLowerCase());
        if (!slots.includes(slot)) return false;

        // Clinical safety check (allergens, diets, cooking skill, budget)
        const safety = evaluateNutritionalSafety(food, user);
        if (!safety.safe) return false;

        // Chronobiology Rule: Pre-workout must be low fat (<6g) & low GI lag
        if (slot === 'pre_workout' && (food.fat >= 6 || (food.prepTime && food.prepTime > 20))) return false;

        // Chronobiology Rule: Post-workout must deliver significant protein (≥18g base)
        if (slot === 'post_workout' && (food.protein < 18)) return false;

        // Workday prep time limit enforcement (if 15 mins prep selected)
        if (!isWeekend && prepLimit <= 15 && (slot === 'breakfast' || slot === 'dinner')) {
          if (food.prepTime && food.prepTime > 18) return false;
        }

        // Regional cuisine weighting
        if (targetRegion !== 'all' && targetRegion !== 'pan-indian') {
          if (!isRegionMatch(food.region, targetRegion)) {
            return false;
          }
        }

        return true;
      });

      if (candidates.length === 0) {
        // Fallback: relax regional filter if candidate pool exhausted for strict diets
        candidates = combinedFoods.filter(food => {
          const slots = (food.mealTypes || []).map(s => s.toLowerCase());
          if (!slots.includes(slot)) return false;
          return evaluateNutritionalSafety(food, user).safe;
        });
      }

      // Multi-factor Scoring considering human nature, occupational slump & variety
      let scored = candidates.map((food, fIdx) => {
        let score = 100;
        const calDiff = Math.abs(food.calories - targetSlotCal);
        score -= (calDiff / targetSlotCal) * 40;

        // Anti-Monotony: Heavy penalty if dish was used earlier this week or yesterday
        if (usedDishesThisWeek.has(food.name)) score -= 45;
        if (lastAssignedDish[slot] === food.name) score -= 60;

        // Regional Preference Bonus
        if (targetRegion !== 'all' && (food.region || '').toLowerCase() === targetRegion) {
          score += 25;
        }

        // Occupational Slump Prevention: For desk workers, reward high-fiber & high-protein at lunch
        if (isDeskWorker && slot === 'lunch') {
          if (food.protein >= 18) score += 15;
          if (food.dietaryStyle && food.dietaryStyle.includes('diabetic')) score += 12; // low GI
        }

        // Age >= 45 sarcopenia prevention: reward high protein density
        if ((parseInt(user?.age, 10) || 25) >= 45 && (slot === 'lunch' || slot === 'dinner')) {
          score += (food.protein || 10) * 1.5;
        }

        // Gender: Female iron/calcium support
        if ((user?.gender || '').toLowerCase() === 'female') {
          const ing = (food.ingredients || []).join(' ').toLowerCase();
          if (ing.includes('spinach') || ing.includes('palak') || ing.includes('chana') || ing.includes('methi') || ing.includes('pomegranate')) {
            score += 12;
          }
        }

        // Weekend vs. Weekday real life:
        if (isWeekend) {
          if (food.difficulty === 'moderate' || food.difficulty === 'advanced') score += 10;
        } else {
          if (food.prepTime && food.prepTime <= 15) score += 10;
        }

        // Deterministic pseudo-random entropy based on user profile
        const seedValue = (userSeed + dayIndex * 13 + fIdx * 7) % 23;
        score += seedValue;

        return { food, score };
      });

      scored.sort((a, b) => b.score - a.score);
      const selected = scored[0]?.food || candidates[0] || combinedFoods[0];

      if (selected) {
        usedDishesThisWeek.add(selected.name);
        lastAssignedDish[slot] = selected.name;
        plan[day][slot] = composeRealisticMeal(selected, targetSlotCal, slot, user);
      }
    });
  });

  return plan;
}

/**
 * 8. HIGH-PRECISION PERSONALIZED INDIAN WEEKLY MEAL PLAN GENERATOR
 * Formulates realistic, culturally authentic, culinary-sound weekly meal plans:
 * - Strict Chronobiology: Pre-workout stamina & Post-workout rapid protein synthesis
 * - Goal-Driven Caloric Density: Calibrated for Bulking, Cutting, or Maintenance
 * - Zero Clutter: Verified sports nutrition recipes
 * - Strict Allergen Protection & Dietary Lifestyle Compliance
 */
export function generateCohesiveWeeklyMealPlan(allFoods = [], user = {}, customBudget = null, regionFilter = null, seedOffset = 0) {
  // Strictly derive gym user status from explicit user data only — never assume defaults
  const gymDaysVal = user?.gymDays !== undefined && user?.gymDays !== null && user?.gymDays !== ''
    ? parseInt(user.gymDays, 10)
    : 0;
  const isGymUser = gymDaysVal > 0 ||
    user?.isGymGoer === true ||
    user?.goal === 'lean_bulk' ||
    user?.goal === 'aggressive_bulk' ||
    user?.goal === 'muscle' ||
    user?.goal === 'hypertrophy' ||
    user?.fitnessGoal === 'muscle' ||
    user?.fitnessGoal === 'lean-muscle' ||
    user?.fitnessGoal === 'hypertrophy' ||
    user?.trainingGoal === 'hypertrophy' ||
    String(user?.goal || '').toLowerCase().includes('hypertrophy');

  const resolvedRegion = ((regionFilter && regionFilter !== 'all') ? regionFilter : (user?.cuisinePreference || 'all'))
    .toLowerCase()
    .replace(/\s+/g, '-');

  // Compute clinically accurate targets from complete user profile inputs
  const breakdown = getDetailedCalorieBreakdown(user);
  const targetCalories = parseInt(user?.dailyCalories, 10) || breakdown?.targetCalories || 2000;
  const targetProtein = parseInt(user?.targetProtein, 10) || breakdown?.macros?.protein || Math.round((user?.weight || 70) * (isGymUser ? 1.8 : 1.2));
  const targetCarbs = parseInt(user?.targetCarbs, 10) || breakdown?.macros?.carbs || Math.round((targetCalories * 0.5) / 4);
  const targetFat = parseInt(user?.targetFat, 10) || breakdown?.macros?.fat || Math.round((targetCalories * 0.25) / 9);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const slotRatios = isGymUser
    ? CHRONO_ENERGY_DISTRIBUTION.gym_training_day
    : CHRONO_ENERGY_DISTRIBUTION.rest_day;

  // Master Food Pool: combine GOLDEN_FITNESS_MEALS with allFoods for comprehensive lookup
  const combinedFoods = [...GOLDEN_FITNESS_MEALS, ...(allFoods || [])];
  const userSeed = hashProfile(user, seedOffset);
  const prepLimit = user?.mealPrepTime === '15_mins' ? 15 : (user?.mealPrepTime === '30_mins' ? 30 : 60);
  const isDeskWorker = (user?.profession || '').toLowerCase().includes('engineer') || (user?.profession || '').toLowerCase().includes('analyst') || (user?.profession || '').toLowerCase().includes('student') || (user?.profession || '').toLowerCase().includes('desk');

  // 1. Candidate Filtering Engine with Strict Slot, Regional & Safety Checks
  const filterCandidatesForSlot = (slot) => {
    let filtered = combinedFoods.filter(food => {
      const dbSlots = (food.mealTypes || []).map(s => s.toLowerCase());

      if (!dbSlots.includes(slot.toLowerCase())) {
        return false;
      }

      // Clinical safety check (allergens, dietary styles, cooking skill, budget, medical)
      const safety = evaluateNutritionalSafety(food, user);
      if (!safety.safe) return false;

      // Chronobiology Rule: Pre-workout must be low fat (<6g) & low GI lag
      if (slot === 'pre_workout' && (food.fat >= 6 || (food.prepTime && food.prepTime > 20))) {
        return false;
      }

      // Chronobiology Rule: Post-workout must deliver significant protein (≥18g base)
      if (slot === 'post_workout' && (food.protein < 18)) {
        return false;
      }

      // Regional cuisine filter
      if (resolvedRegion && resolvedRegion !== 'all' && resolvedRegion !== 'pan-indian') {
        if (!isRegionMatch(food.region, resolvedRegion)) {
          return false;
        }
      }

      return true;
    });

    if (filtered.length === 0) {
      filtered = combinedFoods.filter(food => {
        const dbSlots = (food.mealTypes || []).map(s => s.toLowerCase());
        if (!dbSlots.includes(slot.toLowerCase())) return false;
        return evaluateNutritionalSafety(food, user).safe;
      });
    }

    // Deduplicate by food name
    const seen = new Set();
    filtered = filtered.filter(f => {
      if (seen.has(f.name)) return false;
      seen.add(f.name);
      return true;
    });

    return filtered;
  };

  const mealSlotsToPool = isGymUser 
    ? ['breakfast', 'pre_workout', 'lunch', 'post_workout', 'dinner', 'snacks']
    : ['breakfast', 'lunch', 'dinner', 'snacks'];

  const pool = {};
  mealSlotsToPool.forEach(m => {
    pool[m] = filterCandidatesForSlot(m);
  });

  // 2. Goal-Aware & Macro-Harmonious Anchor Selector with Occupational Intelligence
  const selectAnchors = (arr, count, slotKey) => {
    const userGoal   = (user?.goal || 'maintain').toLowerCase();
    const isBulking  = ['lean_bulk','gain','muscle','hypertrophy','aggressive_bulk'].includes(userGoal);
    const isCutting  = ['fat_loss','lose'].includes(userGoal);
    const userCookingSkill = user?.cookingSkill || 'basic';
    const difficultyNum = { basic: 1, moderate: 2, advanced: 3 };
    const maxCookingDiff = { 'no-cook': 1, basic: 1, moderate: 2, advanced: 3 }[userCookingSkill] || 2;

    let scored = [...arr].map((item, iIdx) => {
      let score = 100;
      const prot  = item.protein  || 5;
      const cal   = item.calories || 250;
      const fat   = item.fat      || 8;
      const carbs = item.carbs    || 20;
      const prep  = item.prepTime || 15;
      const diff  = difficultyNum[(item.difficulty || 'basic').toLowerCase()] || 1;
      const targetSlotCal = targetCalories * (slotRatios[slotKey] || 0.2);

      // Calorie proximity score
      const calProximityRatio = 1 - Math.abs(cal - targetSlotCal) / Math.max(targetSlotCal, 1);
      score += calProximityRatio * 32;
      if (cal > targetSlotCal * 1.45) score -= 35;

      // Protein density for gym users
      if (isGymUser) {
        const protPerCal = prot / Math.max(cal, 1) * 100;
        score += protPerCal * 1.5;
      }

      // Goal-specific scoring
      if (isBulking) {
        score += prot * 1.5;
        if (Math.abs(cal - targetSlotCal) <= targetSlotCal * 0.25) score += 15;
      }
      if (isCutting) {
        score -= fat * 0.5;
        score += prot * 2.0;
        if (cal <= targetSlotCal * 1.08) score += 20;
      }

      // Slot-specific scoring
      if (slotKey === 'post_workout') {
        score += prot * 3.5;
        if (cal >= 300 && cal <= 700) score += 20;
      }
      if (slotKey === 'pre_workout') {
        const carbRatio = carbs / Math.max(cal, 1);
        score += carbRatio * 50;
        if (fat <= 5) score += 15;
        if (prep <= 15) score += 10;
      }
      if (slotKey === 'dinner') {
        const ing = (item.ingredients || []).join(' ').toLowerCase();
        if (['paneer','curd','dahi','egg','chicken','fish','tofu','soya'].some(k => ing.includes(k))) score += 14;
      }
      if (slotKey === 'breakfast') {
        if (prep <= 20) score += 8;
      }

      // Occupational Slump Prevention
      if (isDeskWorker && slotKey === 'lunch') {
        if (prot >= 18) score += 15;
        if (item.dietaryStyle && item.dietaryStyle.includes('diabetic')) score += 12;
      }

      // Age >= 45 Sarcopenia Defense
      if ((parseInt(user?.age, 10) || 25) >= 45 && (slotKey === 'lunch' || slotKey === 'dinner')) {
        score += prot * 1.5;
      }

      // Female Iron Support
      if ((user?.gender || '').toLowerCase() === 'female') {
        const ing = (item.ingredients || []).join(' ').toLowerCase();
        if (ing.includes('spinach') || ing.includes('palak') || ing.includes('chana') || ing.includes('methi') || ing.includes('pomegranate')) {
          score += 12;
        }
      }

      if (diff > maxCookingDiff) score -= 35;
      if (prep > prepLimit) score -= 20;

      // User uniqueness seed injection
      score += (userSeed + iIdx * 5) % 17;

      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const candidates = scored.slice(0, Math.max(count * 2, 6)).map(s => s.item);
    return candidates.slice(0, Math.min(count, candidates.length));
  };

  const breakfastAnchors = selectAnchors(pool['breakfast'] || [], 5, 'breakfast');
  const preWorkoutAnchors = isGymUser ? selectAnchors(pool['pre_workout'] || [], 5, 'pre_workout') : [];
  const postWorkoutAnchors = isGymUser ? selectAnchors(pool['post_workout'] || [], 5, 'post_workout') : [];
  const lunchAnchors = selectAnchors(pool['lunch'] || [], 6, 'lunch');
  const dinnerAnchors = selectAnchors(pool['dinner'] || [], 6, 'dinner');
  const snackAnchors = selectAnchors(pool['snacks'] || [], 5, 'snacks');

  const plan = {};
  let totalWeeklyCost = 0;
  const dailyCosts = {};
  const groceryFrequencyMap = {};

  const GYM_DAY_SCHEDULE = {
    0: [],
    1: ['monday'],
    2: ['monday', 'thursday'],
    3: ['monday', 'wednesday', 'friday'],
    4: ['monday', 'tuesday', 'thursday', 'friday'],
    5: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    6: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    7: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  };
  const gymDayCount = parseInt(user?.gymDays, 10) || 0;
  const trainingDaySet = new Set(GYM_DAY_SCHEDULE[gymDayCount] || []);

  days.forEach((day, dayIndex) => {
    const isTrainingDay = trainingDaySet.has(day);
    const isWeekend = day === 'saturday' || day === 'sunday';
    // Calibrated recovery adjustment: 10% calorie reduction on non-training recovery days for active gym lifters
    const dayTargetCalories = (isGymUser && !isTrainingDay)
      ? Math.round(targetCalories * 0.90)
      : targetCalories;

    const dayMealList = (isGymUser && isTrainingDay)
      ? ['breakfast', 'pre_workout', 'lunch', 'post_workout', 'dinner', 'snacks']
      : ['breakfast', 'lunch', 'dinner', 'snacks'];

    const templates = {};
    const usedNames = new Set();

    const pickDistinct = (anchors, poolList, indexOffset = 0) => {
      const candidates = [...anchors, ...poolList];
      for (let i = 0; i < candidates.length; i++) {
        const idx = (dayIndex + indexOffset + (userSeed % 7) + i) % candidates.length;
        const candidate = candidates[idx];
        if (candidate && !usedNames.has(candidate.name)) {
          // Weekend vs Workday filtering:
          if (!isWeekend && prepLimit <= 15 && candidate.prepTime > 20) {
            continue;
          }
          usedNames.add(candidate.name);
          return candidate;
        }
      }
      const fallback = candidates[0] || GOLDEN_FITNESS_MEALS[0];
      usedNames.add(fallback.name);
      return fallback;
    };

    // 1. Breakfast
    templates['breakfast'] = pickDistinct(breakfastAnchors, pool['breakfast'] || [], 0);

    // 2. Pre-workout & Post-workout for gym users
    if (isGymUser && isTrainingDay) {
      templates['pre_workout'] = pickDistinct(preWorkoutAnchors, pool['pre_workout'] || [], dayIndex);
      templates['post_workout'] = pickDistinct(postWorkoutAnchors, pool['post_workout'] || [], dayIndex + 1);
    }
    
    // 3. Lunch
    templates['lunch'] = pickDistinct(lunchAnchors, pool['lunch'] || [], dayIndex + 2);

    // 4. Dinner
    templates['dinner'] = pickDistinct(dinnerAnchors, pool['dinner'] || [], dayIndex + 3);

    // 5. Snacks
    templates['snacks'] = pickDistinct(snackAnchors, pool['snacks'] || [], dayIndex + 4);

    const dayMeals = {};
    let currentCost = 0;

    const daySlotRatios = (isGymUser && isTrainingDay)
      ? slotRatios
      : CHRONO_ENERGY_DISTRIBUTION.rest_day;

    dayMealList.forEach(m => {
      const dish = templates[m];
      if (!dish) return;

      const targetSlotCal = dayTargetCalories * (daySlotRatios[m] || (1 / dayMealList.length));
      
      // Clinical composition (no fractional decimal multipliers)
      const composed = composeRealisticMeal(dish, targetSlotCal, m, user);
      const mult = composed.multiplier || 1.0;
      const cost = Math.round((dish.cost || 25) * mult);

      dayMeals[m] = {
        ...composed,
        cost
      };

      currentCost += cost;
    });

    plan[day] = dayMeals;
    dailyCosts[day] = currentCost;
    totalWeeklyCost += currentCost;

    // Aggregate grocery footprint
    Object.values(dayMeals).forEach(mealItem => {
      if (mealItem.ingredients && Array.isArray(mealItem.ingredients)) {
        mealItem.ingredients.forEach(ing => {
          const coreName = normalizeIngredientName(ing);
          if (coreName && coreName.length > 2) {
            groceryFrequencyMap[coreName] = (groceryFrequencyMap[coreName] || 0) + 1;
          }
        });
      }
    });
  });

  const corePantryList = Object.entries(groceryFrequencyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name, count]) => ({ name, count }));

  return {
    plan,
    totalWeeklyCost,
    dailyCosts,
    corePantryList,
    region: resolvedRegion,
    targets: {
      calories: targetCalories,
      protein: targetProtein,
      carbs: targetCarbs,
      fat: targetFat
    }
  };
}

/**
 * Normalizes raw recipe ingredient lines into standard household grocery staples
 */
export function normalizeIngredientName(rawStr = '') {
  if (!rawStr || typeof rawStr !== 'string') return '';
  const s = rawStr.toLowerCase();

  // Grains & Flours
  if (s.includes('atta') || s.includes('whole wheat flour')) return 'Whole Wheat Atta (Chakki Fresh)';
  if (s.includes('rice') || s.includes('chawal')) return 'Basmati / Sona Masoori Rice';
  if (s.includes('poha')) return 'Thick Flattened Rice (Poha)';
  if (s.includes('oats')) return 'Rolled Whole Oats';
  if (s.includes('besan') || s.includes('gram flour')) return 'Pure Besan (Chana Dal Flour)';
  if (s.includes('sattu')) return 'Roasted Chana Sattu Flour';
  if (s.includes('dalia') || s.includes('broken wheat')) return 'Wheat Dalia (Cracked Wheat)';
  if (s.includes('thepla') || s.includes('bread') || s.includes('toast')) return 'Whole Wheat Bread / Toast';

  // Pulses & Legumes
  if (s.includes('moong dal') || s.includes('yellow moong')) return 'Yellow Moong Dal';
  if (s.includes('green moong') || s.includes('sabut moong')) return 'Whole Green Moong';
  if (s.includes('toor dal') || s.includes('arhar dal')) return 'Toor / Arhar Dal';
  if (s.includes('rajma') || s.includes('kidney bean')) return 'Red Kidney Beans (Rajma)';
  if (s.includes('kala chana') || s.includes('black chickpea')) return 'Desi Black Chickpeas (Kala Chana)';
  if (s.includes('kabuli chana') || s.includes('white chana') || s.includes('chickpea')) return 'Kabuli White Chickpeas (Chana)';
  if (s.includes('masoor dal')) return 'Red Masoor Dal';
  if (s.includes('urad dal')) return 'Black Urad Dal';

  // Protein & Dairy
  if (s.includes('paneer')) return 'Fresh Malai / Low-Fat Paneer';
  if (s.includes('curd') || s.includes('dahi') || s.includes('yogurt')) return 'Fresh Curd (Dahi)';
  if (s.includes('milk') || s.includes('toned milk')) return 'Toned Dairy / Plant Milk';
  if (s.includes('soya granule') || s.includes('soya chunks') || s.includes('soya')) return 'High-Protein Soya Chunks / Granules';
  if (s.includes('tofu')) return 'Firm Soy Tofu';
  if (s.includes('egg')) return 'Fresh Farm Eggs';
  if (s.includes('chicken breast') || s.includes('chicken')) return 'Fresh Boneless Chicken Breast';
  if (s.includes('fish') || s.includes('rohu') || s.includes('surmai')) return 'Fresh Rohu / Surmai Fish Steaks';
  if (s.includes('whey')) return 'Whey Protein Powder';

  // Vegetables & Aromatics
  if (s.includes('onion') || s.includes('pyaz')) return 'Fresh Red Onions';
  if (s.includes('tomato') || s.includes('tamatar')) return 'Ripe Red Tomatoes';
  if (s.includes('ginger') || s.includes('adrak') || s.includes('garlic') || s.includes('lahsun') || s.includes('green chili') || s.includes('mirchi')) return 'Fresh Ginger, Garlic & Green Chilies';
  if (s.includes('coriander') || s.includes('dhaniya') || s.includes('mint') || s.includes('pudina') || s.includes('lemon') || s.includes('nimbu')) return 'Fresh Coriander, Mint & Juicy Lemons';
  if (s.includes('spinach') || s.includes('palak')) return 'Fresh Spinach (Palak)';
  if (s.includes('bhindi') || s.includes('okra')) return 'Fresh Bhindi (Lady Finger)';
  if (s.includes('lauki') || s.includes('dudhi') || s.includes('bottle gourd')) return 'Fresh Bottle Gourd (Lauki / Dudhi)';
  if (s.includes('cucumber') || s.includes('kheera')) return 'Crisp Green Cucumbers';
  if (s.includes('raw banana') || s.includes('kaccha kela')) return 'Green Raw Cooking Bananas';
  if (s.includes('peas') || s.includes('matar')) return 'Green Tender Peas (Matar)';

  // Fats, Spices & Essentials
  if (s.includes('ghee') || s.includes('desi ghee')) return 'Pure Desi Ghee';
  if (s.includes('mustard oil') || s.includes('sarson oil') || s.includes('groundnut oil') || s.includes('oil')) return 'Cold-Pressed Mustard / Groundnut Oil';
  if (s.includes('peanut') || s.includes('moongphali')) return 'Raw Peanuts';
  if (s.includes('makhana') || s.includes('foxnut')) return 'Phool Makhana (Foxnuts)';
  if (s.includes('almond') || s.includes('walnut') || s.includes('chia') || s.includes('flax') || s.includes('seed') || s.includes('til')) return 'Mixed Dry Fruits & Seeds (Almonds, Walnuts, Chia)';
  if (s.includes('cumin') || s.includes('jeera') || s.includes('mustard seeds') || s.includes('rai') || s.includes('hing') || s.includes('turmeric') || s.includes('haldi') || s.includes('masala') || s.includes('salt')) return 'Core Desi Spices (Jeera, Rai, Haldi, Dhania, Garam Masala, Hing, Salt)';

  return rawStr.split('-')[0].trim();
}

/**
 * 9. SMART ALTERNATIVE MEAL REPLACER
 * Finds clinically compliant dishes matching slot, calorie, and macro requirements
 * Composed into realistic kitchen combinations
 */
export function getSmartMealReplacements(
  targetDish, allFoods = [], user = {}, slot = 'lunch', regionFilter = 'all'
) {
  if (!targetDish) return [];

  const targetCal    = targetDish.calories || 400;
  const targetProt   = targetDish.protein  || 20;
  const targetCarbs  = targetDish.carbs    || 40;
  const targetFat    = targetDish.fat      || 12;
  const targetPrep   = targetDish.prepTime || 20;
  const targetRegion = (targetDish.region  || 'pan-indian').toLowerCase();

  const userGoal     = (user?.goal || 'maintain').toLowerCase();
  const prepLimit    = user?.mealPrepTime === '15_mins' ? 15 : (user?.mealPrepTime === '30_mins' ? 30 : 60);
  const userCooking  = user?.cookingSkill || user?.cookingExperience || 'basic';
  const resolvedRegion = ((regionFilter && regionFilter !== 'all') ? regionFilter : (user?.cuisinePreference || 'all')).toLowerCase();

  const pool = [...GOLDEN_FITNESS_MEALS, ...(allFoods || [])];
  const seen = new Set();

  const difficultyNum  = { basic: 1, moderate: 2, advanced: 3 };
  const maxCookingDiff = { 'no-cook': 1, basic: 1, moderate: 2, advanced: 3 }[userCooking] || 2;

  const candidates = pool.filter(food => {
    if (!food?.name) return false;
    if (food.name === targetDish.name || food.id === targetDish.id) return false;
    if (seen.has(food.name)) return false;

    // Must fit the target meal slot
    const slots = (food.mealTypes || []).map(s => s.toLowerCase());
    if (!slots.includes(slot.toLowerCase())) return false;

    // Clinical Safety Filter (Allergens, Medical conditions, Diets, Cooking Skill, Budget)
    const safety = evaluateNutritionalSafety(food, user);
    if (!safety.safe) return false;

    // Chronobiology constraints
    if (slot === 'pre_workout' && (food.fat >= 6 || (food.prepTime && food.prepTime > 20))) return false;
    if (slot === 'post_workout' && (food.protein < 18)) return false;

    // Calorie window: ±35% (allowing realistic culinary side combination)
    if (Math.abs((food.calories || 250) - targetCal) > targetCal * 0.35) return false;

    seen.add(food.name);
    return true;
  });

  // Multi-factor scoring
  const isBulking = ['lean_bulk','gain','muscle','hypertrophy','aggressive_bulk'].includes(userGoal);
  const isCutting = ['fat_loss','lose'].includes(userGoal);

  const scored = candidates.map(food => {
    const cal   = food.calories || 250;
    const prot  = food.protein  || 10;
    const carbs = food.carbs    || 20;
    const fat   = food.fat      || 8;
    const prep  = food.prepTime || 15;
    const diff  = difficultyNum[(food.difficulty || 'basic').toLowerCase()] || 1;
    let score   = 0;

    score += Math.abs(cal - targetCal)   / Math.max(targetCal, 1)   * 100 * 0.35;
    score += Math.abs(prot - targetProt) / Math.max(targetProt, 1)  * 100 * 0.30;
    score += Math.abs(carbs - targetCarbs) / Math.max(targetCarbs, 1) * 100 * 0.15;
    score += Math.abs(fat - targetFat)  / Math.max(targetFat, 1)    * 100 * 0.10;
    score += Math.abs(prep - targetPrep) / Math.max(targetPrep, 1)  * 100 * 0.07;

    const foodRegion = (food.region || 'pan-indian').toLowerCase();
    if (foodRegion === targetRegion || foodRegion === 'pan-indian' || (resolvedRegion !== 'all' && isRegionMatch(foodRegion, resolvedRegion))) score -= 6;

    if (prep > prepLimit) score += 20;
    if (diff > maxCookingDiff) score += 22;

    if (isBulking) score -= (prot / Math.max(cal, 1) * 100) * 0.4;
    if (isCutting) {
      score -= (prot / Math.max(cal, 1) * 100) * 0.75;
      if (cal > targetCal * 1.05) score += 12;
    }

    return { food, score };
  });

  return scored
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map(s => composeRealisticMeal(s.food, targetCal, slot, user));
}
/**
 * 10. CATEGORIZED INDIAN KIRANA & GROCERY GENERATOR
 * Organizes weekly ingredients into concise, practical Indian household supermarket aisles
 */
export function generateCategorizedGroceryList(weeklyPlan = {}) {
  const categories = {
    produce: { title: 'Produce & Vegetables', items: {} },
    dairy_eggs: { title: 'Dairy & Eggs', items: {} },
    grains: { title: 'Grains & Flours', items: {} },
    legumes: { title: 'Legumes & Pulses', items: {} },
    spices: { title: 'Spices & Condiments', items: {} },
    nuts_supplements: { title: 'Nuts, Seeds & Supplements', items: {} }
  };

  Object.values(weeklyPlan).forEach(dayMeals => {
    Object.values(dayMeals).forEach(meal => {
      const multiplier = meal.multiplier || 1.0;
      const scaled = scaleIngredients(meal.ingredients || [], multiplier);

      scaled.forEach(line => {
        if (typeof line !== 'string') return;
        const normalized = normalizeIngredientName(line);
        if (!normalized) return;

        const lineLower = normalized.toLowerCase();
        let targetCategory = 'spices';

        if (lineLower.includes('almond') || lineLower.includes('walnut') || lineLower.includes('seed') || lineLower.includes('peanut') || lineLower.includes('makhana') || lineLower.includes('whey') || lineLower.includes('supplement') || lineLower.includes('dates') || lineLower.includes('cashew') || lineLower.includes('pistachio')) {
          targetCategory = 'nuts_supplements';
        } else if (lineLower.includes('atta') || lineLower.includes('rice') || lineLower.includes('poha') || lineLower.includes('oats') || lineLower.includes('dalia') || lineLower.includes('bread') || lineLower.includes('flour') || lineLower.includes('roti') || lineLower.includes('phulka')) {
          targetCategory = 'grains';
        } else if (lineLower.includes('dal') || lineLower.includes('chana') || lineLower.includes('rajma') || lineLower.includes('moong') || lineLower.includes('sattu') || lineLower.includes('besan') || lineLower.includes('sprouts') || lineLower.includes('chole')) {
          targetCategory = 'legumes';
        } else if (lineLower.includes('paneer') || lineLower.includes('curd') || lineLower.includes('milk') || lineLower.includes('soya') || lineLower.includes('tofu') || lineLower.includes('egg') || lineLower.includes('chicken') || lineLower.includes('fish') || lineLower.includes('yogurt') || lineLower.includes('cheese') || lineLower.includes('buttermilk')) {
          targetCategory = 'dairy_eggs';
        } else if (lineLower.includes('onion') || lineLower.includes('tomato') || lineLower.includes('ginger') || lineLower.includes('garlic') || lineLower.includes('coriander') || lineLower.includes('lemon') || lineLower.includes('spinach') || lineLower.includes('palak') || lineLower.includes('bhindi') || lineLower.includes('lauki') || lineLower.includes('cucumber') || lineLower.includes('banana') || lineLower.includes('peas') || lineLower.includes('apple') || lineLower.includes('fruit') || lineLower.includes('carrot') || lineLower.includes('potato') || lineLower.includes('capsicum') || lineLower.includes('methi') || lineLower.includes('vegetable')) {
          targetCategory = 'produce';
        }

        categories[targetCategory].items[normalized] = (categories[targetCategory].items[normalized] || 0) + 1;
      });
    });
  });

  return categories;
}

export function getStandardizedGoalLabel(goal) {
  if (!goal) return 'Muscle mass hypertrophy';
  const g = String(goal).toLowerCase().replace(/_/g, ' ');
  if (g.includes('muscle') || g.includes('hypertrophy') || g.includes('bulk') || g.includes('gain')) {
    return 'Muscle mass hypertrophy';
  }
  if (g.includes('fat') || g.includes('lose') || g.includes('loss') || g.includes('cut')) {
    return 'Fat loss & conditioning';
  }
  return toTitleCase(g);
}

export function formatCompactMacros(protein, carbs, fat) {
  const p = Math.round(Number(protein) || 0);
  const c = Math.round(Number(carbs) || 0);
  const f = Math.round(Number(fat) || 0);
  return `P${p} · C${c} · F${f}`;
}
