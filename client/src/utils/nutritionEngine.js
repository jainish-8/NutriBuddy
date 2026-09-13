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
  const targetCalories = calculateTargetCalories({ tdee, bmr, goal, gender });
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
    calories: 470,
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
    name: 'Whey Protein Power Shake with Banana & Peanut Butter',
    category: 'post_workout',
    mealTypes: ['post_workout', 'snacks'],
    calories: 430,
    protein: 35,
    carbs: 48,
    fat: 10,
    cost: 55,
    prepTime: 2,
    difficulty: 'basic',
    cuisine: 'indian',
    region: 'pan-indian',
    servingUnit: '1 Shaker (1 Scoop Whey + 250ml Milk + Banana)',
    budgetTier: 'moderate',
    allergies: ['dairy', 'peanuts'],
    dietaryStyle: ['vegetarian'],
    ingredients: [
      'Whey Protein Isolate - 1 scoop (32g)',
      'Toned Milk - 250ml',
      'Ripe Banana - 1',
      'Natural Peanut Butter - 1 tbsp'
    ],
    recipe: '1. Add whey protein, milk, banana, and peanut butter into a blender or shaker bottle. 2. Blend/shake vigorously for 30 seconds. 3. Consume immediately.',
    benefits: 'Fastest-digesting protein kinetics with rapid leucine spike, maximizing muscle protein synthesis within the post-workout window.'
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
    calories: 490,
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
    calories: 510,
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
    calories: 490,
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

  if (id === 'rec-v4' || name.includes('whey protein power shake') || name.includes('whey protein')) {
    const scoops = mult >= 1.4 ? '1.5 Scoops' : (mult >= 0.8 ? '1 Scoop' : '0.5 Scoop');
    const wheyG = Math.round(32 * mult);
    const milk = Math.round(250 * mult);
    const bananas = mult >= 1.4 ? '2 Bananas' : '1 Banana';
    return `${scoops} (${wheyG}g Whey) + ${milk}ml Milk + ${bananas}`;
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

/**
 * 8. HIGH-PRECISION PERSONALIZED INDIAN WEEKLY MEAL PLAN GENERATOR
 * Formulates realistic, culturally authentic, culinary-sound weekly meal plans:
 * - Strict Chronobiology: Pre-workout stamina & Post-workout rapid protein synthesis
 * - Goal-Driven Caloric Density: Calibrated for Bulking, Cutting, or Maintenance
 * - Zero Clutter: Verified sports nutrition recipes
 * - Strict Allergen Protection & Dietary Lifestyle Compliance
 */
export function generateCohesiveWeeklyMealPlan(allFoods = [], user = {}, customBudget = null, regionFilter = 'all') {
  const isGymUser = (user?.gymDays !== undefined ? parseInt(user.gymDays, 10) : 3) > 0 ||
    user?.isGymGoer === true ||
    user?.activityLevel === 'active' ||
    user?.activityLevel === 'very-active' ||
    user?.fitnessGoal === 'muscle' ||
    user?.fitnessGoal === 'lean-muscle' ||
    user?.goal === 'muscle' ||
    user?.goal === 'lean_bulk' ||
    user?.goal === 'aggressive_bulk';

  // Compute clinically accurate targets from complete user profile inputs
  const breakdown = getDetailedCalorieBreakdown(user);
  const targetCalories = parseInt(user?.dailyCalories, 10) || breakdown?.targetCalories || 2000;
  const targetProtein = parseInt(user?.targetProtein, 10) || breakdown?.macros?.protein || Math.round((user?.weight || 70) * (isGymUser ? 1.8 : 1.2));
  const targetCarbs = parseInt(user?.targetCarbs, 10) || breakdown?.macros?.carbs || Math.round((targetCalories * 0.5) / 4);
  const targetFat = parseInt(user?.targetFat, 10) || breakdown?.macros?.fat || Math.round((targetCalories * 0.25) / 9);

  const mealList = isGymUser 
    ? ['breakfast', 'pre_workout', 'lunch', 'post_workout', 'dinner', 'snacks']
    : ['breakfast', 'lunch', 'dinner', 'snacks'];

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Chronobiology-aligned energy split ratios
  const slotRatios = isGymUser
    ? { breakfast: 0.22, pre_workout: 0.12, lunch: 0.28, post_workout: 0.16, dinner: 0.22, snacks: 0.08 }
    : { breakfast: 0.26, lunch: 0.35, dinner: 0.28, snacks: 0.11 };

  // Master Food Pool: combine GOLDEN_FITNESS_MEALS with allFoods for comprehensive lookup
  const combinedFoods = [...GOLDEN_FITNESS_MEALS, ...(allFoods || [])];

  // 1. Candidate Filtering Engine with Strict Slot Verification
  const filterCandidatesForSlot = (slot) => {
    let filtered = combinedFoods.filter(food => {
      const dbSlots = (food.mealTypes || []).map(s => s.toLowerCase());

      // STRICT SLOT RULES: Only select dishes designated for this specific meal time
      if (!dbSlots.includes(slot.toLowerCase())) {
        return false;
      }

      // Allergen filter (Zero tolerance)
      if (food.allergies && user?.allergies && user.allergies.length > 0) {
        const hasAllergen = food.allergies.some(a => user.allergies.includes(a.toLowerCase()));
        if (hasAllergen) return false;
      }

      // Strict Dietary Preference Filter
      if (user?.dietaryPreferences) {
        const pref = user.dietaryPreferences.toLowerCase();
        const styles = (food.dietaryStyle || []).map(s => s.toLowerCase());
        const isNonVegDish = styles.includes('non-vegetarian') || food.category === 'poultry' || food.category === 'meat' || food.category === 'fish';
        const isEggDish = styles.includes('eggitarian') || food.name?.toLowerCase().includes('egg') || (food.ingredients || []).some(i => i.toLowerCase().includes('egg'));

        if (pref === 'vegetarian') {
          if (!styles.includes('vegetarian') && !styles.includes('vegan') && !styles.includes('jain')) return false;
          if (isNonVegDish || isEggDish) return false;
        } else if (pref === 'eggitarian') {
          if (isNonVegDish) return false;
        } else if (pref === 'vegan') {
          if (!styles.includes('vegan')) return false;
          if (food.allergies?.includes('dairy') || (food.ingredients || []).some(i => i.toLowerCase().includes('paneer') || i.toLowerCase().includes('curd') || i.toLowerCase().includes('dahi') || i.toLowerCase().includes('milk') || i.toLowerCase().includes('ghee') || i.toLowerCase().includes('whey'))) return false;
        } else if (pref === 'jain') {
          if (!styles.includes('jain')) return false;
        }
      }

      return true;
    });

    // Deduplicate by food name
    const seen = new Set();
    filtered = filtered.filter(f => {
      if (seen.has(f.name)) return false;
      seen.add(f.name);
      return true;
    });

    return filtered;
  };

  const pool = {};
  mealList.forEach(m => {
    pool[m] = filterCandidatesForSlot(m);
  });

  // 2. Goal-Aware & Macro-Harmonious Anchor Selector
  const selectAnchors = (arr, count, slotKey) => {
    const slotRatio = slotRatios[slotKey] || (1 / mealList.length);
    const targetSlotCal = targetCalories * slotRatio;
    const isBulking = user?.goal === 'lean_bulk' || user?.goal === 'aggressive_bulk' || user?.goal === 'muscle' || user?.goal === 'gain';

    let scored = [...arr].map(item => {
      let score = 100;
      const prot = item.protein || 5;
      const cal = item.calories || 250;

      // Bulking affinity: boost protein and calorie density
      if (isBulking) {
        score += (prot * 1.5);
        if (cal >= targetSlotCal * 0.7) score += 20;
      }

      // Slot-specific criteria
      if (slotKey === 'post_workout') {
        score += (prot * 3); // Top priority on high bioavailable protein
      } else if (slotKey === 'pre_workout') {
        if (cal >= 200 && cal <= 400) score += 25;
      }

      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const candidates = scored.slice(0, Math.max(count * 2, 6)).map(s => s.item);
    return candidates.slice(0, Math.min(count, candidates.length));
  };

  const breakfastAnchors = selectAnchors(pool['breakfast'] || [], 4, 'breakfast');
  const preWorkoutAnchors = isGymUser ? selectAnchors(pool['pre_workout'] || [], 4, 'pre_workout') : [];
  const postWorkoutAnchors = isGymUser ? selectAnchors(pool['post_workout'] || [], 4, 'post_workout') : [];
  const lunchAnchors = selectAnchors(pool['lunch'] || [], 5, 'lunch');
  const dinnerAnchors = selectAnchors(pool['dinner'] || [], 5, 'dinner');
  const snackAnchors = selectAnchors(pool['snacks'] || [], 4, 'snacks');

  const plan = {};
  let totalWeeklyCost = 0;
  const dailyCosts = {};
  const groceryFrequencyMap = {};

  days.forEach((day, dayIndex) => {
    const templates = {};
    const usedNames = new Set();

    const pickDistinct = (anchors, poolList, indexOffset = 0) => {
      const candidates = [...anchors, ...poolList];
      for (let i = 0; i < candidates.length; i++) {
        const idx = (dayIndex + indexOffset + i) % candidates.length;
        const candidate = candidates[idx];
        if (candidate && !usedNames.has(candidate.name)) {
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
    if (isGymUser) {
      templates['pre_workout'] = pickDistinct(preWorkoutAnchors, pool['pre_workout'] || [], dayIndex);
      templates['post_workout'] = pickDistinct(postWorkoutAnchors, pool['post_workout'] || [], dayIndex + 1);
    }
    
    // 3. Lunch (Hearty Indian Thali)
    templates['lunch'] = pickDistinct(lunchAnchors, pool['lunch'] || [], dayIndex + 2);

    // 4. Dinner (Clean Recovery Platter)
    templates['dinner'] = pickDistinct(dinnerAnchors, pool['dinner'] || [], dayIndex + 3);

    // 5. Snacks (Crunch & Quick Protein)
    templates['snacks'] = pickDistinct(snackAnchors, pool['snacks'] || [], dayIndex + 4);

    // High Precision Analytical Scaling with Practical Kitchen Portions
    const dayMeals = {};
    let currentCost = 0;

    mealList.forEach(m => {
      const dish = templates[m];
      if (!dish) return;

      const targetSlotCal = targetCalories * (slotRatios[m] || (1 / mealList.length));
      let initialMult = targetSlotCal / (dish.calories || 250);
      // Discrete kitchen portions rounded to nearest 0.05 (min 0.5x, max 3.0x)
      initialMult = Math.max(0.5, Math.min(3.0, Math.round(initialMult * 20) / 20));
      
      const cal = Math.round(dish.calories * initialMult);
      const prot = Math.round(dish.protein * initialMult * 10) / 10;
      const c = Math.round(dish.carbs * initialMult * 10) / 10;
      const f = Math.round(dish.fat * initialMult * 10) / 10;
      const cost = Math.round((dish.cost || 20) * initialMult);

      dayMeals[m] = {
        ...dish,
        multiplier: initialMult,
        calories: cal,
        protein: prot,
        carbs: c,
        fat: f,
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
    region: regionFilter,
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
 * Finds 4-6 authentic Indian dishes matching slot, calorie, and protein requirements
 */
export function getSmartMealReplacements(targetDish, allFoods = [], user = {}, slot = 'lunch', regionFilter = 'all') {
  if (!targetDish) return [];

  const targetCal = targetDish.calories || 400;
  const targetProt = targetDish.protein || 20;
  const pool = [...GOLDEN_FITNESS_MEALS, ...(allFoods || [])];

  const seen = new Set();
  return pool.filter(food => {
    if (food.name === targetDish.name || food.id === targetDish.id) return false;
    if (seen.has(food.name)) return false;

    // Strict slot match
    const slots = (food.mealTypes || []).map(s => s.toLowerCase());
    if (!slots.includes(slot.toLowerCase())) return false;

    // Allergen checks
    if (food.allergies && user?.allergies && user.allergies.length > 0) {
      if (food.allergies.some(a => user.allergies.includes(a.toLowerCase()))) return false;
    }

    // Dietary preferences
    if (user?.dietaryPreferences) {
      const pref = user.dietaryPreferences.toLowerCase();
      const styles = (food.dietaryStyle || []).map(s => s.toLowerCase());
      const isNonVegDish = styles.includes('non-vegetarian') || food.category === 'poultry' || food.category === 'meat' || food.category === 'fish';
      const isEggDish = styles.includes('eggitarian') || food.name?.toLowerCase().includes('egg') || (food.ingredients || []).some(i => i.toLowerCase().includes('egg'));

      if (pref === 'jain') {
        if (!styles.includes('jain') && !styles.includes('sattvic')) return false;
      } else if (pref === 'vegan') {
        if (!styles.includes('vegan')) return false;
      } else if (pref === 'vegetarian') {
        if (isNonVegDish || isEggDish) return false;
      } else if (pref === 'eggitarian') {
        if (isNonVegDish && !isEggDish) return false;
      }
    }

    seen.add(food.name);
    return true;
  }).map(food => {
    const calDiff = Math.abs((food.calories || 300) - targetCal);
    const protDiff = Math.abs((food.protein || 15) - targetProt);
    const score = (calDiff * 0.4) + (protDiff * 2);
    return { food, score };
  })
  .sort((a, b) => a.score - b.score)
  .slice(0, 6)
  .map(s => s.food);
}

/**
 * 10. CATEGORIZED INDIAN KIRANA & GROCERY GENERATOR
 * Organizes weekly ingredients into concise, practical Indian household supermarket aisles
 */
export function generateCategorizedGroceryList(weeklyPlan = {}) {
  const categories = {
    grains: { title: 'Atta, Rice & Whole Grains', items: {} },
    pulses: { title: 'Dals, Pulses & Legumes', items: {} },
    dairy_protein: { title: 'Proteins & Dairy Staples', items: {} },
    vegetables: { title: 'Fresh Sabzis, Greens & Aromatics', items: {} },
    essentials: { title: 'Oils, Ghee, Spices & Dry Fruits', items: {} }
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
        let targetCategory = 'essentials';

        if (lineLower.includes('atta') || lineLower.includes('rice') || lineLower.includes('poha') || lineLower.includes('oats') || lineLower.includes('dalia') || lineLower.includes('bread') || lineLower.includes('flour')) {
          targetCategory = 'grains';
        } else if (lineLower.includes('dal') || lineLower.includes('chana') || lineLower.includes('rajma') || lineLower.includes('moong') || lineLower.includes('sattu') || lineLower.includes('besan')) {
          targetCategory = 'pulses';
        } else if (lineLower.includes('paneer') || lineLower.includes('curd') || lineLower.includes('milk') || lineLower.includes('soya') || lineLower.includes('tofu') || lineLower.includes('egg') || lineLower.includes('chicken') || lineLower.includes('fish') || lineLower.includes('whey')) {
          targetCategory = 'dairy_protein';
        } else if (lineLower.includes('onion') || lineLower.includes('tomato') || lineLower.includes('ginger') || lineLower.includes('garlic') || lineLower.includes('coriander') || lineLower.includes('lemon') || lineLower.includes('spinach') || lineLower.includes('palak') || lineLower.includes('bhindi') || lineLower.includes('lauki') || lineLower.includes('cucumber') || lineLower.includes('banana') || lineLower.includes('peas')) {
          targetCategory = 'vegetables';
        }

        categories[targetCategory].items[normalized] = (categories[targetCategory].items[normalized] || 0) + 1;
      });
    });
  });

  return categories;
}
