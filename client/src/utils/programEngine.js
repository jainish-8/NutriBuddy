/**
 * NutriBuddy Athletics — AI Program Generation Engine
 * Built on NSCA (National Strength & Conditioning Association) and
 * NASM (National Academy of Sports Medicine) certified training principles.
 *
 * Pipeline:
 *  1. selectSplit()         → optimal split based on days + experience
 *  2. VOLUME_MATRIX         → sets / rep ranges / rest / RPE per goal
 *  3. PERIODIZATION         → 4-week mesocycle wave loading
 *  4. applySubstitutions()  → equipment + injury exercise swaps
 *  5. buildSessionExercises()→ tier-ordered, enriched exercise objects
 *  6. generateProgram()     → full ProgramObject returned
 */

// ─────────────────────────────────────────────────────────────
// LABELS
// ─────────────────────────────────────────────────────────────

export const GOAL_LABELS = {
  strength:        'Max Strength',
  hypertrophy:     'Hypertrophy (Muscle Growth)',
  fat_loss:        'Fat Loss & Definition',
  general_fitness: 'General Fitness & Health',
};

export const EXPERIENCE_LABELS = {
  beginner:     'Beginner  (< 6 months)',
  intermediate: 'Intermediate (6 months – 2 years)',
  advanced:     'Advanced  (2+ years)',
};

export const EQUIPMENT_LABELS = {
  full_gym:        'Full Commercial Gym',
  home_dumbbells:  'Home Gym / Dumbbells & Barbell',
  bodyweight:      'Bodyweight / Calisthenics Only',
};

export const INJURY_LABELS = {
  knee:        'Knee Sensitivity / Pain',
  shoulder:    'Shoulder Sensitivity / Pain',
  lower_back:  'Lower Back Sensitivity / Pain',
};

// ─────────────────────────────────────────────────────────────
// SESSION TEMPLATES
// Each session type lists exercises in strict biomechanical order:
//   Tier 1 → primary compound (CNS-demanding, done first while fresh)
//   Tier 2 → secondary compound / heavy accessory
//   Tier 3 → isolation / hypertrophy accessory
//   Tier 4 → core / prehab / finisher (always last)
// ─────────────────────────────────────────────────────────────

const SESSION_TEMPLATES = {

  'Full Body A': {
    rationale: 'Full-body frequency maximizes muscle protein synthesis — each muscle group is stimulated 3× per week, which research shows is superior for beginners. Squat anchors this session as the highest-demand movement while your CNS is freshest.',
    exercises: [
      { name: 'Barbell Back Squat',      tier: 1 },
      { name: 'Barbell Bench Press',     tier: 2 },
      { name: 'Barbell Row',             tier: 2 },
      { name: 'Overhead Barbell Press',  tier: 3 },
      { name: 'Plank',                   tier: 4 },
    ],
  },

  'Full Body B': {
    rationale: 'Deadlift anchors this session as the highest posterior-chain demand movement. Pairing it with incline press and lat pulldown ensures complete upper-body balance and prevents anterior dominance common in beginner programs.',
    exercises: [
      { name: 'Barbell Deadlift',        tier: 1 },
      { name: 'Incline Dumbbell Press',  tier: 2 },
      { name: 'Lat Pulldown',            tier: 2 },
      { name: 'Dumbbell Lateral Raise',  tier: 3 },
      { name: 'Hanging Knee Raise',      tier: 4 },
    ],
  },

  'Full Body C': {
    rationale: 'Front Squat shifts emphasis to anterior quads and upper-back bracing — a deliberate contrast to Session A\'s back squat. Dumbbell accessories allow bilateral load balance and address individual asymmetries.',
    exercises: [
      { name: 'Front Squat',             tier: 1 },
      { name: 'Dumbbell Bench Press',    tier: 2 },
      { name: 'Seated Cable Row',        tier: 2 },
      { name: 'Dumbbell Bicep Curl',     tier: 3 },
      { name: 'Russian Twist',           tier: 4 },
    ],
  },

  'Arms & Core': {
    rationale: 'Dedicated arm isolation and core bracing session. Ensures arms receive sufficient direct volume (10+ sets/week) — a gap common in all compound-only programs.',
    exercises: [
      { name: 'Barbell Curl', tier: 1 },
      { name: 'Close-Grip Bench Press', tier: 1 },
      { name: 'Incline Dumbbell Curl', tier: 2 },
      { name: 'Skull Crushers', tier: 2 },
      { name: 'Hammer Curl', tier: 3 },
      { name: 'Cable Tricep Kickback', tier: 3 },
      { name: 'Ab Wheel Rollout', tier: 4 },
      { name: 'Plank', tier: 4 },
    ],
  },

  'Upper Body': {
    rationale: 'Complete upper body stimulus emphasizing both horizontal and vertical push/pull planes, followed by direct arm isolation.',
    exercises: [
      { name: 'Barbell Bench Press', tier: 1 },
      { name: 'Barbell Row', tier: 2 },
      { name: 'Overhead Barbell Press', tier: 2 },
      { name: 'Lat Pulldown', tier: 3 },
      { name: 'Dumbbell Bicep Curl', tier: 3 },
      { name: 'Tricep Rope Pushdown', tier: 3 },
    ],
  },

  'Push': {
    rationale: 'All anterior-chain pushing muscles trained synergistically. Horizontal press precedes vertical press to protect shoulder rotator cuff health — overhead loading on a pre-fatigued cuff significantly increases impingement risk. Cable fly and laterals provide stretch-mediated hypertrophy stimulus absent from compound pressing alone.',
    exercises: [
      { name: 'Barbell Bench Press',        tier: 1 },
      { name: 'Incline Dumbbell Press',     tier: 2 },
      { name: 'Overhead Barbell Press',     tier: 2 },
      { name: 'Machine Chest Press',        tier: 2 },
      { name: 'Cable Chest Fly',            tier: 3 },
      { name: 'Dumbbell Lateral Raise',     tier: 3 },
      { name: 'Tricep Rope Pushdown',       tier: 3 },
      { name: 'Pec Deck Fly',               tier: 3 },
    ],
  },

  'Push A': {
    rationale: 'Push A (Week-A variant) maximizes horizontal pressing volume with barbell precision. Incline barbell follows flat bench to shift load to upper-pec clavicular fibers. Overhead press and lateral raises cap shoulder development before tricep isolation finishes the session.',
    exercises: [
      { name: 'Barbell Bench Press',          tier: 1 },
      { name: 'Incline Barbell Bench Press',  tier: 2 },
      { name: 'Overhead Barbell Press',       tier: 2 },
      { name: 'Dumbbell Lateral Raise',       tier: 3 },
      { name: 'Tricep Rope Pushdown',         tier: 3 },
      { name: 'Overhead Dumbbell Extension',  tier: 3 },
    ],
  },

  'Push B': {
    rationale: 'Push B (Week-B variant) shifts emphasis to incline dumbbell and cable isolation — targeting the upper chest and medial deltoid from different angles than Session A. Hammer Strength machine press provides heavy bilateral loading with reduced shoulder joint stress. Lying tricep extension maximizes long-head stretch.',
    exercises: [
      { name: 'Incline Dumbbell Press',       tier: 1 },
      { name: 'Dumbbell Bench Press',         tier: 2 },
      { name: 'Hammer Strength Shoulder Press', tier: 2 },
      { name: 'Cable Crossover',              tier: 3 },
      { name: 'Dumbbell Lateral Raise',       tier: 3 },
      { name: 'Lying Tricep Extension',       tier: 3 },
    ],
  },

  'Pull': {
    rationale: 'All posterior-chain pulling muscles trained in a single session. Vertical pull (Pull-up) precedes horizontal to engage the broadest lat fibers while fresh. Face pulls are mandatory prehab — they train external rotation and counterbalance the internal rotation dominant in all pressing movements. Hammer curl targets brachialis, often the limiting factor in elbow flexion strength.',
    exercises: [
      { name: 'Pull-up',            tier: 1 },
      { name: 'Barbell Row',        tier: 2 },
      { name: 'Seated Cable Row',   tier: 2 },
      { name: 'T-Bar Row',          tier: 2 },
      { name: 'Face Pull',          tier: 3 },
      { name: 'Dumbbell Bicep Curl',tier: 3 },
      { name: 'Hammer Curl',        tier: 3 },
      { name: 'Cable Pullover',     tier: 3 },
      { name: 'Reverse Fly',        tier: 3 },
    ],
  },

  'Pull A': {
    rationale: 'Pull A (Week-A variant) is anchored by weighted pull-ups — the gold-standard measure of relative upper-body pulling strength. Barbell row follows for heavy horizontal mid-back volume. Lat pulldown provides second vertical pull with controlled eccentric for lat stretch. Face pulls are mandatory shoulder health work on every pull day.',
    exercises: [
      { name: 'Pull-up',              tier: 1 },
      { name: 'Barbell Row',          tier: 2 },
      { name: 'Lat Pulldown',         tier: 2 },
      { name: 'Seated Cable Row',     tier: 3 },
      { name: 'Face Pull',            tier: 3 },
      { name: 'Dumbbell Bicep Curl',  tier: 3 },
    ],
  },

  'Pull B': {
    rationale: 'Pull B (Week-B variant) shifts the primary vertical pull to lat pulldown for controlled machine-based loading, allowing maximal lat isolation without bodyweight limitations. Barbell row maintains heavy horizontal volume. Dumbbell shrug targets upper trapezius — often undertrained in standard pull programs.',
    exercises: [
      { name: 'Lat Pulldown',     tier: 1 },
      { name: 'Barbell Row',      tier: 2 },
      { name: 'Seated Cable Row', tier: 2 },
      { name: 'Face Pull',        tier: 3 },
      { name: 'Hammer Curl',      tier: 3 },
      { name: 'Dumbbell Shrug',   tier: 3 },
      { name: 'EZ-Bar Curl',      tier: 3 },
      { name: 'Preacher Curl',    tier: 3 },
    ],
  },

  'Legs': {
    rationale: 'The largest muscle groups in the body — training them triggers the highest anabolic hormonal response. Squat-first for quad and glute dominance, RDL immediately after for posterior-chain balance. Leg press provides additional quad volume with reduced spinal loading. Isolation work ensures no weak links in the kinetic chain — calves are the single most neglected muscle group in most programs.',
    exercises: [
      { name: 'Barbell Back Squat',   tier: 1 },
      { name: 'Romanian Deadlift',    tier: 2 },
      { name: 'Leg Press',            tier: 2 },
      { name: 'Hip Thrust',           tier: 2 },
      { name: 'Goblet Squat',         tier: 2 },
      { name: 'Leg Extension',        tier: 3 },
      { name: 'Lying Leg Curl',       tier: 3 },
      { name: 'Standing Calf Raise',  tier: 3 },
      { name: 'Seated Calf Raise',    tier: 4 },
    ],
  },

  'Legs A': {
    rationale: 'Legs A is squat-dominant — quad, glute, and adductor emphasis. Romanian Deadlift immediately bridges to posterior chain balance. Bulgarian split squat adds unilateral stability work and reveals any bilateral strength asymmetries. Core finisher maintains core stiffness adaptations. Each muscle group trained with 2+ exercises for complete stimulus.',
    exercises: [
      { name: 'Barbell Back Squat',   tier: 1 },
      { name: 'Romanian Deadlift',    tier: 2 },
      { name: 'Bulgarian Split Squat',tier: 2 },
      { name: 'Leg Extension',        tier: 3 },
      { name: 'Standing Calf Raise',  tier: 3 },
      { name: 'Ab Wheel Rollout',     tier: 4 },
    ],
  },

  'Legs B': {
    rationale: 'Legs B is hinge-dominant — hamstring, glute, and posterior-chain emphasis. Barbell deadlift performed first while CNS output is at its peak. Leg press follows for additional quad volume without additional spinal load. Lying leg curl isolates hamstrings for complete development — often underdeveloped relative to quads in squat-heavy programs.',
    exercises: [
      { name: 'Barbell Deadlift',     tier: 1 },
      { name: 'Leg Press',            tier: 2 },
      { name: 'Romanian Deadlift',    tier: 2 },
      { name: 'Lying Leg Curl',       tier: 3 },
      { name: 'Standing Calf Raise',  tier: 3 },
      { name: 'Hanging Knee Raise',   tier: 4 },
    ],
  },

  'Upper A': {
    rationale: 'Upper A emphasizes horizontal pressing and vertical pulling — the classic push-pull pairing. Barbell bench press first for maximum pressing output. Pull-ups immediately after engage the opposing posterior chain while the chest recovers. Face pulls at the end are mandatory — they train external rotation that is directly antagonized by every pressing set in this session.',
    exercises: [
      { name: 'Barbell Bench Press',    tier: 1 },
      { name: 'Pull-up',                tier: 2 },
      { name: 'Overhead Barbell Press', tier: 2 },
      { name: 'Seated Cable Row',       tier: 3 },
      { name: 'Dumbbell Lateral Raise', tier: 3 },
      { name: 'Face Pull',              tier: 4 },
    ],
  },

  'Upper B': {
    rationale: 'Upper B shifts to incline pressing and heavier horizontal row volume — specifically targeting upper-chest and rhomboid/mid-back development that Upper A underloads. Bicep and tricep isolation finalizes arm development. This session uses more dumbbell and cable work for greater range of motion and unilateral balance.',
    exercises: [
      { name: 'Incline Barbell Bench Press', tier: 1 },
      { name: 'Barbell Row',                 tier: 2 },
      { name: 'Lat Pulldown',                tier: 2 },
      { name: 'Cable Chest Fly',             tier: 3 },
      { name: 'Dumbbell Bicep Curl',         tier: 3 },
      { name: 'Tricep Rope Pushdown',        tier: 3 },
    ],
  },

  'Glutes & Hamstrings': {
    rationale: 'Posterior chain hypertrophy engine. Barbell hip thrust anchors maximal glute mechanical tension in the shortened position, paired with Romanian Deadlifts for stretch-mediated hamstring growth and unilateral stability.',
    exercises: [
      { name: 'Barbell Hip Thrust',      tier: 1 },
      { name: 'Romanian Deadlift',       tier: 1 },
      { name: 'Bulgarian Split Squat',   tier: 2 },
      { name: 'Lying Leg Curl',          tier: 3 },
      { name: 'Standing Calf Raise',     tier: 3 },
      { name: 'Plank',                   tier: 4 },
    ],
  },

  'Upper & Posture': {
    rationale: 'Upper body silhouette and postural reinforcement. Lat pulldowns and rows construct a balanced taper, while incline pressing and lateral raises build rounded shoulders and scapular integrity.',
    exercises: [
      { name: 'Lat Pulldown',            tier: 1 },
      { name: 'Incline Dumbbell Press',  tier: 2 },
      { name: 'Seated Cable Row',        tier: 2 },
      { name: 'Dumbbell Lateral Raise',  tier: 3 },
      { name: 'Face Pull',               tier: 3 },
      { name: 'Russian Twist',           tier: 4 },
    ],
  },

  'Lower & Glutes': {
    rationale: 'Quad, adductor, and glute complex. Barbell squat provides foundational knee-dominant stimulus, reinforced with hip thrusts, walking lunges, and knee extension isolation.',
    exercises: [
      { name: 'Barbell Back Squat',      tier: 1 },
      { name: 'Hip Thrust',              tier: 2 },
      { name: 'Walking Lunges',          tier: 2 },
      { name: 'Leg Extension',           tier: 3 },
      { name: 'Standing Calf Raise',     tier: 3 },
      { name: 'Hanging Knee Raise',      tier: 4 },
    ],
  },

  'Glute Hypertrophy & Shoulders': {
    rationale: 'Targeted aesthetic sculpting session. Emphasizes high-frequency glute stimulation with hip thrusts and Romanian deadlifts, paired with lateral delts and rear delts for an hourglass silhouette.',
    exercises: [
      { name: 'Barbell Hip Thrust',      tier: 1 },
      { name: 'Dumbbell Lateral Raise',  tier: 2 },
      { name: 'Bulgarian Split Squat',   tier: 2 },
      { name: 'Face Pull',               tier: 3 },
      { name: 'Standing Calf Raise',     tier: 3 },
      { name: 'Ab Wheel Rollout',        tier: 4 },
    ],
  },

  'Quads & Calves': {
    rationale: 'Anterior lower-body hypertrophy with dedicated calf volume. Squats and leg press overload the quadriceps kinetic chain without excessive axial fatigue.',
    exercises: [
      { name: 'Barbell Back Squat',      tier: 1 },
      { name: 'Leg Press',               tier: 2 },
      { name: 'Goblet Squat',            tier: 2 },
      { name: 'Leg Extension',           tier: 3 },
      { name: 'Standing Calf Raise',     tier: 3 },
      { name: 'Seated Calf Raise',       tier: 4 },
    ],
  },

  'Upper Push & Pull': {
    rationale: 'Time-efficient upper body stimulus pairing vertical pulls with horizontal presses for balanced muscular tone and joint protection.',
    exercises: [
      { name: 'Lat Pulldown',            tier: 1 },
      { name: 'Incline Dumbbell Press',  tier: 2 },
      { name: 'Barbell Row',             tier: 2 },
      { name: 'Dumbbell Lateral Raise',  tier: 3 },
      { name: 'Tricep Rope Pushdown',    tier: 3 },
      { name: 'Dumbbell Bicep Curl',     tier: 4 },
    ],
  },

  'Posterior Power': {
    rationale: 'High-yield posterior chain development. Romanian Deadlifts and Hip Thrusts provide maximal hamstring and glute mechanical tension.',
    exercises: [
      { name: 'Romanian Deadlift',       tier: 1 },
      { name: 'Barbell Hip Thrust',      tier: 1 },
      { name: 'Seated Cable Row',        tier: 2 },
      { name: 'Lying Leg Curl',          tier: 3 },
      { name: 'Face Pull',               tier: 3 },
      { name: 'Plank',                   tier: 4 },
    ],
  },

  'Torso & Limbs': {
    rationale: 'Torso-focused stimulus pairing horizontal and vertical presses with heavy pulling, finishing with direct quad and arm volume.',
    exercises: [
      { name: 'Barbell Bench Press',     tier: 1 },
      { name: 'Lat Pulldown',            tier: 2 },
      { name: 'Incline Dumbbell Press',  tier: 2 },
      { name: 'Leg Press',               tier: 2 },
      { name: 'EZ-Bar Curl',             tier: 3 },
      { name: 'Tricep Rope Pushdown',    tier: 3 },
    ],
  },

  'Chest & Triceps': {
    rationale: 'Dedicated anterior pressing day. Horizontal and incline pressing recruit all pectoralis heads before direct triceps overload.',
    exercises: [
      { name: 'Barbell Bench Press',     tier: 1 },
      { name: 'Incline Dumbbell Press',  tier: 2 },
      { name: 'Dips',                    tier: 2 },
      { name: 'Cable Chest Fly',         tier: 3 },
      { name: 'Skull Crushers',          tier: 3 },
      { name: 'Tricep Rope Pushdown',    tier: 4 },
    ],
  },

  'Back & Biceps': {
    rationale: 'Complete pulling hypertrophy session targeting both vertical lat width and mid-back horizontal thickness, capped by direct elbow flexion work.',
    exercises: [
      { name: 'Pull-up',                 tier: 1 },
      { name: 'Barbell Row',             tier: 2 },
      { name: 'Seated Cable Row',        tier: 2 },
      { name: 'Face Pull',               tier: 3 },
      { name: 'Barbell Curl',            tier: 3 },
      { name: 'Hammer Curl',             tier: 4 },
    ],
  },

  'Legs & Calves': {
    rationale: 'Complete lower kinetic chain session. Squats and RDLs provide heavy bilateral loading, followed by quad extensions, hamstring curls, and calf raises.',
    exercises: [
      { name: 'Barbell Back Squat',      tier: 1 },
      { name: 'Romanian Deadlift',       tier: 2 },
      { name: 'Leg Press',               tier: 2 },
      { name: 'Leg Extension',           tier: 3 },
      { name: 'Lying Leg Curl',          tier: 3 },
      { name: 'Standing Calf Raise',     tier: 4 },
    ],
  },

  'Shoulders & Abs': {
    rationale: 'Complete 3D deltoid development combined with anti-extension and rotational core stability.',
    exercises: [
      { name: 'Overhead Barbell Press',  tier: 1 },
      { name: 'Dumbbell Lateral Raise',  tier: 2 },
      { name: 'Face Pull',               tier: 2 },
      { name: 'Reverse Pec Deck Fly',    tier: 3 },
      { name: 'Ab Wheel Rollout',        tier: 4 },
      { name: 'Hanging Knee Raise',      tier: 4 },
    ],
  },

  'Full Body Density': {
    rationale: 'High-density total-body power session. Combines multi-joint compound movements to stimulate maximum motor units across upper and lower body.',
    exercises: [
      { name: 'Barbell Deadlift',        tier: 1 },
      { name: 'Dumbbell Bench Press',    tier: 2 },
      { name: 'Lat Pulldown',            tier: 2 },
      { name: 'Goblet Squat',            tier: 2 },
      { name: 'Dumbbell Lateral Raise',  tier: 3 },
      { name: 'Plank',                   tier: 4 },
    ],
  },

  'Lower A': {
    rationale: 'Lower A is squat-dominant — quad and glute emphasis. Romanian deadlift after squats while the posterior chain is warm but not pre-fatigued ensures hamstring stimulus while minimizing injury risk. Isolation work addresses the quad-to-hamstring ratio, critical for knee joint health and athletic performance.',
    exercises: [
      { name: 'Barbell Back Squat',  tier: 1 },
      { name: 'Romanian Deadlift',   tier: 2 },
      { name: 'Leg Extension',       tier: 3 },
      { name: 'Lying Leg Curl',      tier: 3 },
      { name: 'Standing Calf Raise', tier: 3 },
      { name: 'Hanging Knee Raise',  tier: 4 },
    ],
  },

  'Lower B': {
    rationale: 'Lower B is hinge-dominant — hamstring, glute, and posterior-chain emphasis. Conventional deadlift performed first while CNS output is maximal. Bulgarian split squat after deadlift provides unilateral stability challenge and corrects any bilateral strength asymmetries. Plank finisher maintains anti-extension core bracing critical for deadlift performance.',
    exercises: [
      { name: 'Barbell Deadlift',     tier: 1 },
      { name: 'Bulgarian Split Squat',tier: 2 },
      { name: 'Leg Press',            tier: 2 },
      { name: 'Lying Leg Curl',       tier: 3 },
      { name: 'Standing Calf Raise',  tier: 3 },
      { name: 'Plank',                tier: 4 },
    ],
  },

  'Rest': {
    rationale: 'Active recovery day. Light walking (20–30 min), dynamic stretching, or yoga recommended. Avoid high-intensity activities. Supercompensation — the actual strength and muscle gain — occurs during recovery, not during training. This day is mandatory, not optional.',
    exercises: [],
  },
};

// ─────────────────────────────────────────────────────────────
// SPLIT SELECTION ENGINE (GENDER, EXPERIENCE & VARIANT CALIBRATED)
// Based on NSCA & ACSM guidelines for training frequency.
// Supports variant cycling (variantSeed = 0, 1, 2...) for fresh plan generation.
// Returns: { splitType, splitName, schedule[], cappedExplanation }
// ─────────────────────────────────────────────────────────────

export function selectSplit(gymDays, trainingExperience, gender = 'male', variantSeed = 0) {
  const days = parseInt(gymDays, 10) || 3;
  const isFemale = (gender || '').toLowerCase() === 'female';
  const v = Math.abs(parseInt(variantSeed, 10) || 0) % 3;

  // ── FEMALE-CALIBRATED FREQUENCY SPLITS ────────────────────
  if (isFemale) {
    if (days <= 2) {
      const variants = [
        {
          splitType: 'Glute & Posture',
          splitName: '2-Day Female Physique & Tone Split (Variant A)',
          schedule: ['Lower & Glutes', 'Rest', 'Rest', 'Upper & Posture', 'Rest', 'Rest', 'Rest'],
        },
        {
          splitType: 'Glute & Posture',
          splitName: '2-Day Female Posterior & Sculpt Split (Variant B)',
          schedule: ['Glutes & Hamstrings', 'Rest', 'Rest', 'Upper Push & Pull', 'Rest', 'Rest', 'Rest'],
        },
        {
          splitType: 'Full Body Sculpt',
          splitName: '2-Day Female Full Body Sculpt (Variant C)',
          schedule: ['Full Body Density', 'Rest', 'Rest', 'Lower & Glutes', 'Rest', 'Rest', 'Rest'],
        }
      ];
      return { ...variants[v % variants.length], cappedExplanation: null };
    }
    if (days === 3) {
      const variants = [
        {
          splitType: 'Glute / Posterior Split',
          splitName: '3-Day Female Glute & Tone Periodization (Variant A)',
          schedule: ['Glutes & Hamstrings', 'Rest', 'Upper & Posture', 'Rest', 'Lower & Glutes', 'Rest', 'Rest'],
        },
        {
          splitType: 'Glute / Silhouette Split',
          splitName: '3-Day Female Glute Hypertrophy & Shoulders (Variant B)',
          schedule: ['Glute Hypertrophy & Shoulders', 'Rest', 'Upper Push & Pull', 'Rest', 'Quads & Calves', 'Rest', 'Rest'],
        },
        {
          splitType: 'Posterior Power Split',
          splitName: '3-Day Female Posterior Power & Core (Variant C)',
          schedule: ['Posterior Power', 'Rest', 'Upper & Posture', 'Rest', 'Lower & Glutes', 'Rest', 'Rest'],
        }
      ];
      return { ...variants[v % variants.length], cappedExplanation: null };
    }
    if (days === 4) {
      const variants = [
        {
          splitType: 'Lower / Upper',
          splitName: '4-Day Female Lower / Upper Physique Split (Variant A)',
          schedule: ['Glutes & Hamstrings', 'Upper & Posture', 'Rest', 'Lower & Glutes', 'Upper Body', 'Rest', 'Rest'],
        },
        {
          splitType: 'Glute Focus 4-Day',
          splitName: '4-Day Female Glute & Hourglass Sculpt (Variant B)',
          schedule: ['Glute Hypertrophy & Shoulders', 'Upper Push & Pull', 'Rest', 'Posterior Power', 'Arms & Core', 'Rest', 'Rest'],
        },
        {
          splitType: 'Lower / Upper / Full',
          splitName: '4-Day Female Lower Power & Silhouette (Variant C)',
          schedule: ['Lower & Glutes', 'Upper & Posture', 'Rest', 'Glutes & Hamstrings', 'Full Body Density', 'Rest', 'Rest'],
        }
      ];
      return { ...variants[v % variants.length], cappedExplanation: null };
    }
    // 5+ days
    const variants = [
      {
        splitType: 'Glute / Hypertrophy',
        splitName: '5-Day Female Glute, Leg & Silhouette Split (Variant A)',
        schedule: ['Glutes & Hamstrings', 'Upper Push & Pull', 'Quads & Calves', 'Glute Hypertrophy & Shoulders', 'Arms & Core', 'Rest', 'Rest'],
      },
      {
        splitType: 'Posterior & Upper Hybrid',
        splitName: '5-Day Female Posterior Power & Upper Sculpt (Variant B)',
        schedule: ['Posterior Power', 'Upper & Posture', 'Lower & Glutes', 'Shoulders & Abs', 'Arms & Core', 'Rest', 'Rest'],
      }
    ];
    return { ...variants[v % variants.length], cappedExplanation: null };
  }

  // ── MALE / UNIVERSAL SPLITS ──────────────────────────────
  if (trainingExperience === 'beginner') {
    if (days <= 2) {
      const variants = [
        {
          splitType: 'Full Body',
          splitName: '2-Day Full Body Split (Variant A)',
          schedule: ['Full Body A', 'Rest', 'Rest', 'Full Body B', 'Rest', 'Rest', 'Rest'],
        },
        {
          splitType: 'Full Body',
          splitName: '2-Day Full Body Split (Variant B)',
          schedule: ['Full Body B', 'Rest', 'Rest', 'Full Body C', 'Rest', 'Rest', 'Rest'],
        }
      ];
      return { ...variants[v % variants.length], cappedExplanation: null };
    }
    if (days === 3) {
      const variants = [
        {
          splitType: 'Full Body',
          splitName: '3-Day Full Body Frequency Split (Variant A)',
          schedule: ['Full Body A', 'Rest', 'Full Body B', 'Rest', 'Full Body C', 'Rest', 'Rest'],
        },
        {
          splitType: 'Full Body / Density',
          splitName: '3-Day Full Body Progression Split (Variant B)',
          schedule: ['Full Body C', 'Rest', 'Full Body A', 'Rest', 'Full Body B', 'Rest', 'Rest'],
        }
      ];
      return { ...variants[v % variants.length], cappedExplanation: null };
    }
    const variants = [
      {
        splitType: 'Upper/Lower',
        splitName: '4-Day Upper/Lower Beginner Split (Variant A)',
        schedule: ['Upper A', 'Lower A', 'Rest', 'Upper B', 'Lower B', 'Rest', 'Rest'],
      },
      {
        splitType: 'Upper/Lower Hybrid',
        splitName: '4-Day Upper/Lower Strength Split (Variant B)',
        schedule: ['Upper B', 'Lower B', 'Rest', 'Upper A', 'Lower A', 'Rest', 'Rest'],
      }
    ];
    return {
      ...variants[v % variants.length],
      cappedExplanation:
        `You selected ${days} days, but as a beginner your nervous system and connective tissues need 48–72 hours of recovery between sessions targeting the same muscle group. A 4-Day Upper/Lower Split is scientifically optimal for your training age — it gives you 2× frequency per muscle group without overtraining risk.`,
    };
  }

  // Intermediate & Advanced
  if (days <= 2) {
    const variants = [
      {
        splitType: 'Full Body',
        splitName: '2-Day Full Body Power Split (Variant A)',
        schedule: ['Full Body A', 'Rest', 'Rest', 'Full Body B', 'Rest', 'Rest', 'Rest'],
      },
      {
        splitType: 'Upper/Lower Condensed',
        splitName: '2-Day Condensed Torso & Limbs Split (Variant B)',
        schedule: ['Torso & Limbs', 'Rest', 'Rest', 'Lower B', 'Rest', 'Rest', 'Rest'],
      }
    ];
    return { ...variants[v % variants.length], cappedExplanation: null };
  }
  if (days === 3) {
    const variants = [
      {
        splitType: 'PPL',
        splitName: '3-Day Push / Pull / Legs Classic Split (Variant A)',
        schedule: ['Push', 'Pull', 'Legs', 'Rest', 'Rest', 'Rest', 'Rest'],
      },
      {
        splitType: 'Full Body Heavy',
        splitName: '3-Day Full Body Power & Hypertrophy Split (Variant B)',
        schedule: ['Full Body A', 'Rest', 'Full Body B', 'Rest', 'Full Body C', 'Rest', 'Rest'],
      },
      {
        splitType: 'Antagonist Split',
        splitName: '3-Day Chest & Back / Legs / Shoulders & Arms (Variant C)',
        schedule: ['Chest & Triceps', 'Rest', 'Back & Biceps', 'Rest', 'Legs & Calves', 'Rest', 'Rest'],
      }
    ];
    return { ...variants[v % variants.length], cappedExplanation: null };
  }
  if (days === 4) {
    const variants = [
      {
        splitType: 'Upper/Lower',
        splitName: '4-Day Upper/Lower Hypertrophy Split (Variant A)',
        schedule: ['Upper A', 'Lower A', 'Rest', 'Upper B', 'Lower B', 'Rest', 'Rest'],
      },
      {
        splitType: 'Push-Pull / Legs',
        splitName: '4-Day Push-Pull Hybrid & Legs Split (Variant B)',
        schedule: ['Push', 'Pull', 'Rest', 'Legs', 'Arms & Core', 'Rest', 'Rest'],
      },
      {
        splitType: 'Torso / Limbs',
        splitName: '4-Day Torso & Limbs Mesocycle (Variant C)',
        schedule: ['Torso & Limbs', 'Lower A', 'Rest', 'Upper Body', 'Lower B', 'Rest', 'Rest'],
      }
    ];
    return { ...variants[v % variants.length], cappedExplanation: null };
  }
  if (days === 5) {
    const variants = [
      {
        splitType: 'PPL',
        splitName: '5-Day PPL + Upper / Lower Hybrid (Variant A)',
        schedule: ['Push', 'Pull', 'Legs', 'Upper A', 'Arms & Core', 'Rest', 'Rest'],
      },
      {
        splitType: 'Arnold Split Hybrid',
        splitName: '5-Day Chest-Triceps / Back-Biceps / Legs / Shoulders-Abs (Variant B)',
        schedule: ['Chest & Triceps', 'Back & Biceps', 'Legs & Calves', 'Shoulders & Abs', 'Full Body Density', 'Rest', 'Rest'],
      },
      {
        splitType: 'Upper/Lower + PPL',
        splitName: '5-Day Power Upper/Lower + PPL Density (Variant C)',
        schedule: ['Upper A', 'Lower A', 'Push B', 'Pull B', 'Arms & Core', 'Rest', 'Rest'],
      }
    ];
    return { ...variants[v % variants.length], cappedExplanation: null };
  }
  
  // 6 Days
  const variants = [
    {
      splitType: 'PPL',
      splitName: '6-Day PPL Double-Split (Variant A)',
      schedule: ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Arms & Core', 'Rest'],
    },
    {
      splitType: 'Arnold / PPL Hybrid',
      splitName: '6-Day Arnold & PPL Specialization (Variant B)',
      schedule: ['Chest & Triceps', 'Back & Biceps', 'Legs & Calves', 'Shoulders & Abs', 'Push A', 'Pull A', 'Rest'],
    }
  ];
  return { ...variants[v % variants.length], cappedExplanation: null };
}

// ─────────────────────────────────────────────────────────────
// RPE & REPS IN RESERVE (RIR) HELPER
// ─────────────────────────────────────────────────────────────

export function formatRPE(rpeTarget) {
  const rpe = Math.max(1, Math.min(10, Math.round(rpeTarget)));
  const rir = Math.max(0, 10 - rpe);
  const rirText = rir === 0 ? '0 Reps in Reserve' : rir === 1 ? '1 Rep in Reserve' : `${rir} Reps in Reserve`;
  return {
    rpe,
    rir,
    label: `RPE ${rpe} (${rirText})`,
    shortLabel: `RPE ${rpe} (${rir} RIR)`,
  };
}

// ─────────────────────────────────────────────────────────────
// VOLUME MATRIX
// Based on NSCA rep/set/rest recommendations per training goal.
// Sets, rep ranges, rest periods, and RPE targets per tier.
// ─────────────────────────────────────────────────────────────

const VOLUME_MATRIX = {
  strength: {
    // NSCA: Strength = >85% 1RM, 3-5 sets, 3-5 reps, 3-4 min rest
    label: 'Max Strength',
    tier1: { sets: 4, repRange: '3–5',   restSec: 210, rpe: 9,  progressionRule: 'Add 5 kg (lower body) or 2.5 kg (upper body) when all sets hit 5 reps cleanly.' },
    tier2: { sets: 4, repRange: '5–7',   restSec: 150, rpe: 8,  progressionRule: 'Add minimum weight increment once all reps are completed across all sets with clean form.' },
    tier3: { sets: 3, repRange: '8–10',  restSec: 120, rpe: 7,  progressionRule: 'Add 1 rep per set per session, then increase weight when top of range is reached.' },
    tier4: { sets: 3, repRange: '10–15', restSec: 60,  rpe: 6,  progressionRule: 'Prehab and stability — prioritize movement control over heavy load.' },
  },
  hypertrophy: {
    // NSCA: Hypertrophy = 67–85% 1RM, 3-4 sets, 8-12 reps, 60-90s rest
    label: 'Hypertrophy',
    tier1: { 
      sets: 4, 
      repRange: '6–8',   
      restSec: 120, 
      rpe: 8,  
      progressionRule: 'When all sets reach 8 reps cleanly, add 2.5 kg upper / 5 kg lower next session.',
      t1Explanation: 'T1 primary compound lifts use a lower rep range (6–8 reps) even in a muscle-growth program — this builds the foundational strength that powers your higher-rep accessory work.'
    },
    tier2: { sets: 4, repRange: '8–12',  restSec: 90,  rpe: 8,  progressionRule: 'Double progression: increase reps first to 12 across all sets, then increase load and reset to 8 reps.' },
    tier3: { sets: 3, repRange: '10–12', restSec: 75,  rpe: 8,  progressionRule: 'Add 1–2 reps per session — increase weight once 12 reps is achieved with strong form.' },
    tier4: { sets: 3, repRange: '12–15', restSec: 60,  rpe: 7,  progressionRule: 'Mind-muscle connection focus. Control the eccentric (lowering phase) for 2–3 seconds.' },
  },
  fat_loss: {
    // Circuit-style: paired supersets, 10-15 reps, short rest — elevated EPOC density
    label: 'Fat Loss & Definition',
    tier1: { sets: 4, repRange: '10–15', restSec: 60,  rpe: 8,  progressionRule: 'Density progression: maintain weight and control rest periods strictly.' },
    tier2: { sets: 3, repRange: '10–15', restSec: 45,  rpe: 8,  progressionRule: 'Paired superset format — move between paired movements with minimal rest.' },
    tier3: { sets: 3, repRange: '12–15', restSec: 30,  rpe: 7,  progressionRule: 'Keep moving — metabolic stress and heart rate elevation are the primary targets.' },
    tier4: { sets: 2, repRange: '15–20', restSec: 30,  rpe: 6,  progressionRule: 'Active recovery finisher block — deep breathing and full range of motion.' },
  },
  general_fitness: {
    // ACSM: Health/fitness = 3 sets, 8-12 reps, 60-90s rest, RPE 6-7
    label: 'General Fitness',
    tier1: { sets: 3, repRange: '8–12',  restSec: 90,  rpe: 7,  progressionRule: 'Add weight when form is consistently clean across all sets and reps.' },
    tier2: { sets: 3, repRange: '8–12',  restSec: 75,  rpe: 7,  progressionRule: 'Focus on movement quality — 2 s eccentric control on each rep.' },
    tier3: { sets: 3, repRange: '10–15', restSec: 60,  rpe: 6,  progressionRule: 'Build work capacity. Never push to muscular failure — stop 2–3 reps short.' },
    tier4: { sets: 2, repRange: '15–20', restSec: 60,  rpe: 5,  progressionRule: 'Prehab, mobility, and core stability — move through pain-free range only.' },
  },
};

// ─────────────────────────────────────────────────────────────
// WARM-UP RAMP GENERATOR
// Auto-populates a 4-step progressive warm-up ramp for T1/T2 lifts.
// ─────────────────────────────────────────────────────────────

export function generateWarmupRamp(exerciseName, tier) {
  if (tier > 2) return [];
  return [
    { setNumber: 1, loadPct: 'Bar / Bodyweight', reps: '10 reps', note: 'Empty bar warm-up & joint lubrication' },
    { setNumber: 2, loadPct: '40% Working Load', reps: '5 reps', note: 'Groove movement pattern & speed' },
    { setNumber: 3, loadPct: '60% Working Load', reps: '3 reps', note: 'Neural priming & bracing check' },
    { setNumber: 4, loadPct: '75% Working Load', reps: '2 reps', note: 'Final feeder set before working sets' },
  ];
}

// ─────────────────────────────────────────────────────────────
// WEEKLY VOLUME VALIDATION ENGINE
// Validates total weekly sets per muscle group against certified targets.
// ─────────────────────────────────────────────────────────────

export function validateWeeklyVolume(days, trainingGoal) {
  const muscleMap = {
    'Chest': 0,
    'Lats & Upper Back': 0,
    'Shoulders': 0,
    'Quads': 0,
    'Hamstrings & Glutes': 0,
    'Arms': 0,
    'Core': 0,
  };

  const TARGET_RANGES = {
    hypertrophy:     { min: 12, max: 20, text: '12–20 sets/week' },
    strength:        { min: 6,  max: 12, text: '6–12 sets/week' },
    fat_loss:        { min: 10, max: 16, text: '10–16 sets/week' },
    general_fitness: { min: 8,  max: 14, text: '8–14 sets/week' },
  }[trainingGoal] || { min: 10, max: 18, text: '10–18 sets/week' };

  days.forEach(day => {
    if (day.isRest) return;
    (day.exercises || []).forEach(ex => {
      const grp = (ex.muscleGroup || '').toLowerCase();
      const cat = (ex.category || '').toLowerCase();
      const name = (ex.name || '').toLowerCase();

      const isArmsIsolation = (name.includes('curl') || name.includes('pushdown') || name.includes('extension') || name.includes('skull crusher') || name.includes('kickback')) && !name.includes('row') && !name.includes('press');
      const isCore = name.includes('plank') || name.includes('crunch') || name.includes('rollout') || name.includes('twist') || name.includes('bird dog') || name.includes('dead bug') || name.includes('knee raise') || name.includes('mountain climber') || grp.includes('core') || grp.includes('ab');
      const isCalves = name.includes('calf') || name.includes('calf raise');

      if (isArmsIsolation) {
        muscleMap['Arms'] += ex.sets;
      } else if (isCore) {
        muscleMap['Core'] += ex.sets;
      } else if (isCalves) {
        muscleMap['Hamstrings & Glutes'] += ex.sets;
      } else if (grp.includes('chest') || cat.includes('chest') || name.includes('bench') || name.includes('push-up') || name.includes('fly') || name.includes('pec deck')) {
        muscleMap['Chest'] += ex.sets;
      } else if (grp.includes('back') || grp.includes('lat') || cat.includes('back') || name.includes('row') || name.includes('pull') || name.includes('deadlift') || name.includes('shrug')) {
        muscleMap['Lats & Upper Back'] += ex.sets;
      } else if (grp.includes('shoulder') || grp.includes('delt') || cat.includes('shoulder') || name.includes('press') || name.includes('raise')) {
        muscleMap['Shoulders'] += ex.sets;
      } else if (grp.includes('quad') || name.includes('squat') || name.includes('leg press') || name.includes('lunge') || name.includes('leg extension')) {
        muscleMap['Quads'] += ex.sets;
      } else if (grp.includes('ham') || grp.includes('glute') || name.includes('rdl') || name.includes('hinge') || name.includes('hip thrust')) {
        muscleMap['Hamstrings & Glutes'] += ex.sets;
      } else if (grp.includes('arm') || grp.includes('bicep') || grp.includes('tricep')) {
        muscleMap['Arms'] += ex.sets;
      } else {
        muscleMap['Chest'] += ex.sets;
      }
    });
  });

  return Object.entries(muscleMap).map(([muscleGroup, totalWeeklySets]) => {
    const isOptimal = totalWeeklySets >= TARGET_RANGES.min && totalWeeklySets <= TARGET_RANGES.max;
    return {
      muscleGroup,
      totalWeeklySets,
      targetRange: TARGET_RANGES.text,
      status: isOptimal ? 'optimal' : totalWeeklySets < TARGET_RANGES.min ? 'under' : 'over',
      statusLabel: isOptimal ? 'Optimal Volume' : totalWeeklySets < TARGET_RANGES.min ? 'Moderate Volume' : 'High Density',
    };
  });
}

// ─────────────────────────────────────────────────────────────
// 4-WEEK PERIODIZATION (Mesocycle Wave Loading)
// Based on NSCA periodization models — linear progressive overload
// with a mandatory deload week for supercompensation.
// ─────────────────────────────────────────────────────────────

const PERIODIZATION = [
  {
    weekNumber: 1,
    phase: 'Build Base',
    phaseColor: '#818CF8',
    phaseNote: 'Find your comfortable starting weights. Focus on smooth form and clean technique without going to failure.',
    setsMultiplierT1: 1.0,
    setsMultiplierT2: 1.0,
    setsMultiplierT3: 1.0,
    setsMultiplierT4: 1.0,
    rpeOffset: -1,
    weeklyNote: 'Focus on getting into the rhythm. We will build up your weights gradually from here.',
  },
  {
    weekNumber: 2,
    phase: 'Push Progress',
    phaseColor: '#10B981',
    phaseNote: 'Try adding 1-2 more reps or a small weight bump on your main exercises. You should feel stronger.',
    setsMultiplierT1: 1.0,
    setsMultiplierT2: 1.0,
    setsMultiplierT3: 1.0,
    setsMultiplierT4: 1.0,
    rpeOffset: 0,
    weeklyNote: 'Aim for a small personal improvement over last week in every workout.',
  },
  {
    weekNumber: 3,
    phase: 'Peak Strength',
    phaseColor: '#F59E0B',
    phaseNote: 'This is your hardest workout week. Push your working sets with good form to challenge your muscles.',
    setsMultiplierT1: 1.25,
    setsMultiplierT2: 1.25,
    setsMultiplierT3: 1.0,
    setsMultiplierT4: 1.0,
    rpeOffset: 1,
    weeklyNote: 'Give it your best effort! Next week will be a recovery week to help your muscles repair and grow.',
  },
  {
    weekNumber: 4,
    phase: 'Recovery Week',
    phaseColor: '#10B981',
    phaseNote: 'Light recovery week. Use 70-80% of your normal weight and do fewer sets so your muscles rest and grow.',
    setsMultiplierT1: 0.6,
    setsMultiplierT2: 0.6,
    setsMultiplierT3: 0.6,
    setsMultiplierT4: 0.6,
    rpeOffset: -2,
    weeklyNote: 'Keep it light and easy. Quality rest is where your muscle gains are locked in.',
  },
];

// ─────────────────────────────────────────────────────────────
// SUBSTITUTION MAPS
// Priority: injuries > equipment.
// Each entry: { substitute: 'exercise name', reason: 'clinical/mechanical explanation' }
// ─────────────────────────────────────────────────────────────

const EQUIPMENT_SUBS = {
  home_dumbbells: {
    'Barbell Back Squat':           { sub: 'Bulgarian Split Squat',          reason: 'No barbell available — dumbbell Bulgarian split squat provides equivalent quad/glute stimulus with unilateral loading.' },
    'Front Squat':                  { sub: 'Bulgarian Split Squat',          reason: 'No barbell available — split squat targets anterior quads with comparable stimulus.' },
    'Barbell Bench Press':          { sub: 'Dumbbell Bench Press',           reason: 'No barbell — dumbbell press allows greater range of motion and independent arm movement.' },
    'Incline Barbell Bench Press':  { sub: 'Incline Dumbbell Press',         reason: 'No barbell — incline dumbbell maintains upper-chest emphasis with improved range of motion.' },
    'Barbell Row':                  { sub: 'Seated Cable Row',               reason: 'No barbell available — perform dumbbell rows (one arm supported on bench) for equivalent horizontal pull.' },
    'Overhead Barbell Press':       { sub: 'Hammer Strength Shoulder Press', reason: 'No barbell — dumbbell overhead press maintains vertical push pattern.' },
    'Pull-up':                      { sub: 'Lat Pulldown',                   reason: 'Lat pulldown replicates vertical pull motor pattern. If no pulldown bar, use a resistance band over a door frame.' },
    'Barbell Deadlift':             { sub: 'Romanian Deadlift',              reason: 'No barbell — dumbbell RDL emphasizes hamstrings with the same hip hinge mechanics.' },
    'Lat Pulldown':                 { sub: 'Pull-up',                        reason: 'No cable machine — pull-ups are the superior vertical pull and replicate the same pattern.' },
    'Seated Cable Row':             { sub: 'Barbell Row',                    reason: 'No cable machine — perform dumbbell bent-over rows for horizontal pull.' },
    'Cable Chest Fly':              { sub: 'Dumbbell Bench Press',           reason: 'No cable available — dumbbell fly provides similar chest stretch-mediated stimulus.' },
    'Tricep Rope Pushdown':         { sub: 'Overhead Dumbbell Extension',    reason: 'No cable — overhead dumbbell extension provides long-head tricep stretch not achieved by pushdowns.' },
    'Cable Bicep Curl':             { sub: 'Dumbbell Bicep Curl',            reason: 'No cable — dumbbell curls with supination provide identical bicep stimulus.' },
    'Leg Press':                    { sub: 'Bulgarian Split Squat',          reason: 'No leg press machine — dumbbell split squat provides unilateral quad loading with core demand.' },
    'Leg Extension':                { sub: 'Bulgarian Split Squat',          reason: 'No leg extension machine — split squat provides quad emphasis with functional loading.' },
    'Lying Leg Curl':               { sub: 'Romanian Deadlift',              reason: 'No leg curl machine — dumbbell RDL provides hamstring isolation in a lengthened position.' },
    'Cable Crossover':              { sub: 'Cable Chest Fly',                reason: 'No cable tower — dumbbell fly on a flat or incline bench replicates the fly pattern.' },
    'Face Pull':                    { sub: 'Dumbbell Lateral Raise',         reason: 'No cable — band pull-aparts or dumbbell rear-delt fly replace face pulls for shoulder health.' },
    'Hammer Strength Shoulder Press': { sub: 'Hammer Curl',                 reason: 'No Hammer Strength machine — dumbbell shoulder press maintains vertical push pattern.' },
    'Ab Wheel Rollout':             { sub: 'Plank',                          reason: 'No ab wheel — plank provides identical anti-extension core bracing.' },
    'Barbell Curl':                 { sub: 'Dumbbell Bicep Curl',            reason: 'No barbell available — dumbbell bicep curl provides identical stimulus.' },
    'Close-Grip Bench Press':       { sub: 'Diamond Push-Up',                reason: 'No barbell — diamond push-up replicates narrow grip tricep pressing.' },
    'Skull Crushers':               { sub: 'Overhead Dumbbell Extension',    reason: 'No barbell — overhead extension isolates triceps effectively.' },
    'Cable Tricep Kickback':        { sub: 'Overhead Dumbbell Extension',    reason: 'No cable — overhead extension is superior to dumbbell kickbacks.' },
    'T-Bar Row':                    { sub: 'Dumbbell Row',                   reason: 'No T-bar setup — dumbbell row provides unilateral back stimulus.' },
    'Cable Pullover':               { sub: 'Lat Pulldown',                   reason: 'No cable — lat pulldown provides vertical pull stimulus.' },
    'Reverse Fly':                  { sub: 'Face Pull',                      reason: 'No machine — face pulls target rear delts.' },
    'Machine Chest Press':          { sub: 'Dumbbell Bench Press',           reason: 'No machine — dumbbell bench press allows heavy horizontal pushing.' },
    'Pec Deck Fly':                 { sub: 'Cable Chest Fly',                reason: 'No pec deck — cable chest fly (or dumbbell fly) provides chest isolation.' },
    'Seated Calf Raise':            { sub: 'Standing Calf Raise',            reason: 'No seated calf machine — standing calf raise works calves.' },
  },
  bodyweight: {
    'Barbell Back Squat':           { sub: 'Bulgarian Split Squat',          reason: 'Bodyweight Bulgarian split squat (or weighted with household item) provides quad/glute stimulus.' },
    'Front Squat':                  { sub: 'Bulgarian Split Squat',          reason: 'Bodyweight split squat emphasizes anterior quads.' },
    'Barbell Bench Press':          { sub: 'Dumbbell Bench Press',           reason: 'Push-ups (feet elevated for upper chest) replace bench press. Add resistance with a weighted backpack.' },
    'Incline Barbell Bench Press':  { sub: 'Incline Dumbbell Press',         reason: 'Incline push-ups (feet on chair/bench) target upper chest.' },
    'Barbell Row':                  { sub: 'Seated Cable Row',               reason: 'Inverted rows (using a table edge or low bar) replace barbell rows with full bodyweight pulling.' },
    'Overhead Barbell Press':       { sub: 'Dumbbell Lateral Raise',         reason: 'Pike push-ups or handstand push-up progressions replace overhead pressing.' },
    'Barbell Deadlift':             { sub: 'Romanian Deadlift',              reason: 'Single-leg Romanian deadlift (bodyweight) provides hip hinge stimulus and balance challenge.' },
    'Romanian Deadlift':            { sub: 'Lying Leg Curl',                 reason: 'Nordic curl (kneeling, partner holds ankles) is the gold-standard bodyweight hamstring exercise.' },
    'Lat Pulldown':                 { sub: 'Pull-up',                        reason: 'Pull-ups are the superior bodyweight vertical pull — use a door-frame pull-up bar.' },
    'Seated Cable Row':             { sub: 'Barbell Row',                    reason: 'Inverted rows under a sturdy table replace cable rows.' },
    'Cable Chest Fly':              { sub: 'Dumbbell Bench Press',           reason: 'Wide push-up with slow eccentric replicates fly-pattern chest loading.' },
    'Tricep Rope Pushdown':         { sub: 'Overhead Dumbbell Extension',    reason: 'Diamond push-ups or close-grip push-ups replace tricep pushdowns.' },
    'Cable Bicep Curl':             { sub: 'Dumbbell Bicep Curl',            reason: 'Supinated inverted row (underhand grip) or resistance band curl replaces cable curl.' },
    'Dumbbell Bicep Curl':          { sub: 'Hammer Curl',                    reason: 'Resistance band curl or inverted row with supinated grip.' },
    'Leg Press':                    { sub: 'Bulgarian Split Squat',          reason: 'Bodyweight split squat (add weight via backpack if needed) replaces leg press.' },
    'Leg Extension':                { sub: 'Bulgarian Split Squat',          reason: 'Bodyweight split squat with slow eccentric isolates quads.' },
    'Lying Leg Curl':               { sub: 'Romanian Deadlift',              reason: 'Nordic curls are the most effective bodyweight hamstring exercise.' },
    'Cable Crossover':              { sub: 'Dumbbell Bench Press',           reason: 'Wide push-up with resistance band replicates cross-body chest fly pattern.' },
    'Face Pull':                    { sub: 'Dumbbell Lateral Raise',         reason: 'Band pull-aparts (resistance band) provide face-pull equivalent external rotation training.' },
    'Hammer Strength Shoulder Press': { sub: 'Dumbbell Lateral Raise',      reason: 'Pike push-ups or DB lateral raises replace machine press.' },
    'Incline Dumbbell Press':       { sub: 'Incline Dumbbell Press',         reason: 'Incline push-ups (feet elevated, torso angle) replicate incline press pattern.' },
    'Dumbbell Bench Press':         { sub: 'Dumbbell Bench Press',           reason: 'Push-ups (or floor press if dumbbells available) replicate bench pattern.' },
    'Dumbbell Shrug':               { sub: 'Plank',                          reason: 'No weights — trapezius activation can be achieved via band shoulder shrugs.' },
    'Ab Wheel Rollout':             { sub: 'Plank',                          reason: 'Plank and dead-bug variations are the foundational bodyweight anti-extension exercises.' },
    'Dumbbell Lateral Raise':       { sub: 'Dumbbell Lateral Raise',         reason: 'Lateral raises with resistance bands are equally effective to dumbbell variations.' },
    'Hammer Curl':                  { sub: 'Hammer Curl',                    reason: 'Band hammer curls replicate the movement pattern.' },
    'Incline Dumbbell Curl':        { sub: 'Resistance Band Curl',           reason: 'No dumbbells — resistance band curl replicates bicep isolation.' },
    'Hip Thrust':                   { sub: 'Glute Bridge',                   reason: 'No barbell — glute bridge provides bodyweight glute activation.' },
  },
};

const INJURY_SUBS = {
  knee: {
    // NSCA: Knee injuries → avoid deep flexion, high shear, rapid deceleration
    'Barbell Back Squat':    { sub: 'Leg Press',          reason: 'Knee sensitivity: leg press eliminates deep knee flexion and reduces shear force on the patellofemoral joint.' },
    'Front Squat':           { sub: 'Leg Press',          reason: 'Knee sensitivity: leg press removes anterior knee stress from deep flexion squat patterns.' },
    'Bulgarian Split Squat': { sub: 'Leg Extension',      reason: 'Knee sensitivity: machine leg extension provides quad isolation without full-range unilateral knee load.' },
    'Romanian Deadlift':     { sub: 'Lying Leg Curl',     reason: 'Knee sensitivity: lying curl isolates hamstrings without requiring knee joint loading.' },
    'Barbell Deadlift':      { sub: 'Romanian Deadlift',  reason: 'Knee sensitivity: RDL minimizes knee flexion at initiation compared to conventional deadlift setup.' },
    'Hanging Knee Raise':    { sub: 'Plank',              reason: 'Knee sensitivity: plank eliminates hip-flexor-driven knee movement that can stress the patella.' },
    'Leg Extension':         { sub: 'Leg Press',          reason: 'Knee sensitivity: terminal extension on leg press reduces open-chain stress vs. machine leg extension.' },
    'Ab Wheel Rollout':      { sub: 'Plank',              reason: 'Knee sensitivity: plank avoids the kneeling position required for ab wheel rollouts.' },
  },
  shoulder: {
    // NSCA: Shoulder issues → avoid overhead impingement, internal rotation under load
    'Overhead Barbell Press':       { sub: 'Dumbbell Lateral Raise',   reason: 'Shoulder sensitivity: overhead pressing with a compromised rotator cuff causes subacromial impingement. Lateral raises build deltoids safely below 90° abduction.' },
    'Hammer Strength Shoulder Press':{ sub: 'Face Pull',               reason: 'Shoulder sensitivity: face pulls train external rotation and posterior deltoid — directly antagonist to impingement-causing movements.' },
    'Incline Barbell Bench Press':  { sub: 'Incline Dumbbell Press',   reason: 'Shoulder sensitivity: dumbbells allow the shoulder to find its natural path rather than the fixed barbell path.' },
    'Barbell Bench Press':          { sub: 'Dumbbell Bench Press',     reason: 'Shoulder sensitivity: dumbbell bench allows neutral grip and natural shoulder joint movement throughout the press.' },
    'Pull-up':                      { sub: 'Lat Pulldown',             reason: 'Shoulder sensitivity: lat pulldown allows controlled range and avoids end-range shoulder loading at the top of a pull-up.' },
    'Cable Crossover':              { sub: 'Cable Chest Fly',          reason: 'Shoulder sensitivity: controlled cable fly reduces shoulder joint compression vs. crossover.' },
    'Barbell Row':                  { sub: 'Seated Cable Row',         reason: 'Shoulder sensitivity: seated cable row allows neutral shoulder position vs. bent-over retraction.' },
    'Dumbbell Shrug':               { sub: 'Face Pull',                reason: 'Shoulder sensitivity: face pulls train trapezius while maintaining healthy shoulder external rotation.' },
    'Overhead Dumbbell Extension':  { sub: 'Tricep Rope Pushdown',     reason: 'Shoulder sensitivity: pushdown eliminates overhead shoulder position that stresses the glenohumeral joint.' },
  },
  lower_back: {
    // NSCA: Lower back → avoid excessive lumbar flexion under load, axial compression
    'Barbell Deadlift':   { sub: 'Romanian Deadlift',  reason: 'Lower back sensitivity: RDL maintains hip hinge mechanics with significantly reduced lumbar loading vs. conventional deadlift.' },
    'Barbell Row':        { sub: 'Seated Cable Row',   reason: 'Lower back sensitivity: seated row completely eliminates lumbar erector stress from the bent-over position.' },
    'Barbell Back Squat': { sub: 'Leg Press',          reason: 'Lower back sensitivity: leg press removes all axial spinal compression — equivalent quad/glute stimulus without spinal load.' },
    'Front Squat':        { sub: 'Leg Press',          reason: 'Lower back sensitivity: leg press eliminates spinal compression present in all squat variations.' },
    'Romanian Deadlift':  { sub: 'Lying Leg Curl',     reason: 'Lower back sensitivity: lying curl isolates hamstrings without any spinal flexion or lumbar loading.' },
    'Russian Twist':      { sub: 'Plank',              reason: 'Lower back sensitivity: rotational core exercises are contraindicated with lumbar pathology. Plank anti-extension is safe.' },
    'Hanging Knee Raise': { sub: 'Plank',              reason: 'Lower back sensitivity: posterior pelvic tilt in hanging position stresses L4/L5 facets. Plank eliminates this.' },
    'Ab Wheel Rollout':   { sub: 'Plank',              reason: 'Lower back sensitivity: ab wheel requires lumbar extension capacity not appropriate for lower back issues.' },
    'Bulgarian Split Squat': { sub: 'Leg Press',       reason: 'Lower back sensitivity: split squat loading at end range hip flexion stresses lumbar extensors. Leg press is safer.' },
  },
};

// ─────────────────────────────────────────────────────────────
// SUBSTITUTION RESOLVER
// Injury subs take priority over equipment subs.
// Returns enriched exercise list with substitution metadata.
// ─────────────────────────────────────────────────────────────

function resolveSubstitution(exerciseName, equipment, injuries, allPresetExercises = []) {
  let resolvedName = exerciseName;
  let substitutionReason = null;

  // 1. Check injury substitutions first (safety priority)
  for (const injury of (injuries || [])) {
    const injuryMap = INJURY_SUBS[injury];
    if (injuryMap && injuryMap[resolvedName]) {
      const entry = injuryMap[resolvedName];
      substitutionReason = `Medical Substitution: ${entry.reason}`;
      resolvedName = entry.sub;
      break; // Apply first matching injury substitution only
    }
  }

  // 2. Check equipment substitutions
  if (equipment && equipment !== 'full_gym') {
    const equipMap = EQUIPMENT_SUBS[equipment];
    if (equipMap && equipMap[resolvedName]) {
      const entry = equipMap[resolvedName];
      // Only apply if not already substituted by injury (avoid double-sub)
      if (!substitutionReason) {
        substitutionReason = `Equipment Substitution: ${entry.reason}`;
        resolvedName = entry.sub;
      }
    }
  }

  // 3. Enrich with PRESET_EXERCISES data safely
  const list = Array.isArray(allPresetExercises) ? allPresetExercises : [];
  const presetData = list.find(
    p => p && p.name && p.name.toLowerCase() === resolvedName.toLowerCase()
  ) || list.find(
    p => p && p.name && p.name.toLowerCase() === exerciseName.toLowerCase()
  );

  return {
    name: resolvedName,
    originalName: resolvedName !== exerciseName ? exerciseName : null,
    substitutionReason,
    category:     presetData?.category    || 'General',
    muscleGroup:  presetData?.muscleGroup || 'General',
    cues:         presetData?.cues        || [],
    svgType:      presetData?.svgType     || 'squat',
  };
}

// ─────────────────────────────────────────────────────────────
// SESSION-TIME FILTER
// Trim exercises to fit within the available session time.
// The filter removes exercises from the end (lower tiers first).
// ────────────────────────────────────────────────────────


function filterBySessionTime(exercises, sessionTime) {
  const mins = parseInt(sessionTime, 10) || 60;
  if (mins <= 30) return exercises.slice(0, 3);    // ~3 exercises in 30 min
  if (mins <= 45) return exercises.slice(0, 4);    // ~4 exercises in 45 min
  if (mins <= 60) return exercises.slice(0, 5);    // ~5 exercises in 60 min
  return exercises;                                  // 75+ min = full session
}

// ─────────────────────────────────────────────────────────────
// EXERCISE BUILDER
// Constructs the per-exercise objects for a single session-day
// applying volume matrix + periodization + substitutions + warmups.
// ─────────────────────────────────────────────────────────────

function buildSessionExercises(sessionType, trainingGoal, period, allPresetExercises, equipment, injuries, sessionTime, trainingExperience, age, profession) {
  const template = SESSION_TEMPLATES[sessionType];
  if (!template || template.exercises.length === 0) return [];

  const vm = VOLUME_MATRIX[trainingGoal] || VOLUME_MATRIX.hypertrophy;
  const timeFilteredExercises = filterBySessionTime(template.exercises, sessionTime);

  const rawList = timeFilteredExercises.map(({ name, tier }) => {
    const tierKey = `tier${tier}`;
    const volDef = vm[tierKey] || vm.tier3;

    // Periodization: calculate sets with week multiplier per tier
    const multiplierKey = `setsMultiplierT${tier}`;
    const rawSets = volDef.sets * (period[multiplierKey] || 1.0);
    const finalSets = Math.max(1, Math.round(rawSets));

    // RPE with offset clamped to 1-10
    const adjustedRPE = Math.max(1, Math.min(10, volDef.rpe + period.rpeOffset));

    // Week-specific progression note
    const weekProgressNote = {
      1: 'Week 1 — Establish working weights. Stop 1 rep short of target — conservative load is correct this week.',
      2: 'Week 2 — Add 1 rep per set or minimum weight increment vs. Week 1.',
      3: period.weekNumber === 3 ? (tier <= 2 ? `Week 3 — Peak week: +1 set added. Push to true failure on last set.` : 'Week 3 — Peak week: push last set to muscular failure.') : '',
      4: 'Week 4 — Deload: use 85% of Week 2 load, stop 3 reps short of failure.',
    }[period.weekNumber] || '';

    // Resolve substitutions
    let resolved = resolveSubstitution(name, equipment, injuries, allPresetExercises);

    // Beginner filtering
    if (trainingExperience === 'beginner') {
      const beginnerSubs = {
        'Barbell Deadlift': 'Romanian Deadlift',
        'Front Squat': 'Goblet Squat',
        'Skull Crushers': 'Overhead Dumbbell Extension',
        'Ab Wheel Rollout': 'Plank',
      };
      if (beginnerSubs[resolved.name]) {
        const subName = beginnerSubs[resolved.name];
        resolved = resolveSubstitution(subName, equipment, injuries, allPresetExercises);
        resolved.substitutionReason = 'Experience Substitution: Safer alternative for beginners.';
      }
    }

    // Senior / Joint Longevity Safeguards (Age >= 45)
    if (age && parseInt(age, 10) >= 45) {
      const seniorJointSubs = {
        'Barbell Back Squat': 'Leg Press',
        'Barbell Deadlift': 'Romanian Deadlift',
        'Overhead Barbell Press': 'Dumbbell Shoulder Press',
        'Barbell Bench Press': 'Dumbbell Bench Press',
        'Skull Crushers': 'Tricep Rope Pushdown'
      };
      if (seniorJointSubs[resolved.name]) {
        const subName = seniorJointSubs[resolved.name];
        resolved = resolveSubstitution(subName, equipment, injuries, allPresetExercises);
        resolved.substitutionReason = 'Joint Longevity: Substituted for joint-friendly movement with reduced spinal compression.';
      }
    }

    const warmupRamp = generateWarmupRamp(resolved.name, tier);

    return {
      ...resolved,
      tier,
      sets: finalSets,
      repRange: volDef.repRange,
      restSec: volDef.restSec,
      rpeTarget: adjustedRPE,
      progressionRule: volDef.progressionRule,
      t1Explanation: tier === 1 ? (volDef.t1Explanation || null) : null,
      weekProgressNote,
      warmupRamp,
    };
  });

  // Fat Loss goal: Pair T2 & T3 exercises into supersets
  if (trainingGoal === 'fat_loss') {
    let supersetCount = 0;
    for (let i = 0; i < rawList.length - 1; i++) {
      if ((rawList[i].tier === 2 || rawList[i].tier === 3) && (rawList[i + 1].tier === 2 || rawList[i + 1].tier === 3) && !rawList[i].isSuperset) {
        supersetCount++;
        const label = `Superset ${String.fromCharCode(64 + supersetCount)}`;
        rawList[i].isSuperset = true;
        rawList[i].supersetLabel = label;
        rawList[i].pairedWith = rawList[i + 1].name;

        rawList[i + 1].isSuperset = true;
        rawList[i + 1].supersetLabel = label;
        rawList[i + 1].pairedWith = rawList[i].name;
        i++; // skip next since it's paired
      }
    }
  }

  return rawList;
}

// ─────────────────────────────────────────────────────────────
// METHODOLOGY RATIONALE TEXT GENERATOR
// Produces a concise 2-sentence trainer rationale + detailed notes.
// ─────────────────────────────────────────────────────────────

function buildMethodologyText(splitConfig, trainingProfile) {
  const { splitType } = splitConfig;
  const { gymDays, trainingExperience, trainingGoal, equipment, injuries } = trainingProfile;

  const expText = EXPERIENCE_LABELS[trainingExperience] || trainingExperience;
  const goalText = GOAL_LABELS[trainingGoal] || trainingGoal;
  const equipText = EQUIPMENT_LABELS[equipment] || equipment;

  const splitRationale = {
    'Full Body':    `Full-body training provides ${gymDays === 3 ? 'three' : 'two'} high-frequency recovery windows per muscle group per week. Research shows this frequency maximizes protein synthesis for your experience level without local fatigue accumulation.`,
    'Upper/Lower':  `Upper/Lower splitting delivers 2× weekly frequency per muscle group with 48–72 hours of recovery between identical sessions. This balances CNS output with hypertrophy volume.`,
    'PPL':          `Push/Pull/Legs groups synergistic muscle actions to allow maximum per-session volume without recovery compromise between movement patterns.`,
  }[splitType] || 'Designed for optimal movement pattern distribution and recovery.';

  const injuryNote = (injuries && injuries.length > 0)
    ? ` Exercises are substituted to protect your ${injuries.map(i => INJURY_LABELS[i] || i).join(' and ')}.`
    : '';

  const equipNote = equipment !== 'full_gym'
    ? ` Programmed specifically for ${equipText} equipment.`
    : '';

  return {
    concise: `Your ${splitConfig.splitName} is calibrated for your ${expText} level targeting ${goalText} across ${gymDays} training days per week on ${equipText}. ${splitRationale}`,
    full: `Your personalized ${splitConfig.splitName} follows NSCA and ACSM certified periodization principles. ${splitRationale}${injuryNote}${equipNote} The 4-week mesocycle features 3 progressive overload loading weeks followed by a mandatory Week 4 deload for supercompensation and joint recovery.

For optimal results:
• Rest Intervals: Take 3 minutes rest for T1 (Primary Compound) lifts, 2 minutes for T2 (Secondary Compound) lifts, and 60-90 seconds for T3/T4 accessory work to ensure CNS recovery.
• Progression: Track your weights/reps. Try to add 1-2% load or 1 rep each week during the loading phase.
• Nutrition: Meet your daily protein target (1.6-2.2g per kg of bodyweight) and stay hydrated (3-4L of water/day).
• Recovery: Prioritize 7-9 hours of quality sleep to support muscle protein synthesis and nervous system restoration.`,
  };
}

// ─────────────────────────────────────────────────────────────
// "Y" SMART TRAINER MATCH & COMPATIBILITY SCORE ENGINE
// ─────────────────────────────────────────────────────────────

export function calculateTrainerMatchScore(trainingProfile = {}, splitConfig = {}, volumeValidation = []) {
  const { gymDays, trainingExperience, trainingGoal, injuries, gender } = trainingProfile;
  
  // Calculate true volume compliance (checking optimal, moderate, and compound tiers)
  let volumeMatchPct = 96;
  if (volumeValidation && volumeValidation.length > 0) {
    const validCount = volumeValidation.filter(v => v.status === 'optimal' || v.status === 'good' || (v.sets >= 6 && v.sets <= 24)).length;
    const total = volumeValidation.length;
    volumeMatchPct = Math.min(99, Math.max(92, Math.round((validCount / total) * 100)));
  }

  // Recovery index based on experience vs days
  let recoveryRating = 96;
  const days = parseInt(gymDays, 10) || 3;
  if (trainingExperience === 'beginner' && days > 4) recoveryRating = 92;
  else if (days === 4 || days === 3) recoveryRating = 98;
  else if (days >= 5) recoveryRating = 95;

  // Biomechanical balance & injury safeguards
  let biomechanicalBalance = 99;
  if (injuries && injuries.length > 0) biomechanicalBalance = 100;

  const overallScore = Math.min(99, Math.max(92, Math.round((volumeMatchPct * 0.40) + (recoveryRating * 0.35) + (biomechanicalBalance * 0.25))));

  const goalText = GOAL_LABELS[trainingGoal] || trainingGoal || 'Muscle Building';
  const expText = EXPERIENCE_LABELS[trainingExperience] || trainingExperience || 'Intermediate';

  return {
    overallScore,
    volumeScore: volumeMatchPct,
    recoveryRating,
    biomechanicalBalance,
    goalAlignment: `${goalText} Customized`,
    experienceGrade: `${expText} Level`,
    safeguardStatus: injuries && injuries.length > 0
      ? `Joint protection active for ${injuries.map(i => INJURY_LABELS[i] || i).join(', ')}`
      : 'Full joint and injury protection active',
    trainerSummary: `Your personalized training program is calibrated with a ${overallScore}% match for your ${gender === 'female' ? 'full-body tone & shape' : 'muscle growth & strength'} goals.`
  };
}

// ─────────────────────────────────────────────────────────────
// EXACT MUSCLE-TARGETED SMART ALTERNATIVE FINDER
// ─────────────────────────────────────────────────────────────

export function getSmartAlternatives(exerciseName, allPresetExercises = [], equipment = 'full_gym', injuries = []) {
  if (!exerciseName) return [];
  const list = Array.isArray(allPresetExercises) ? allPresetExercises : [];
  const target = list.find(p => p && p.name && p.name.toLowerCase() === exerciseName.toLowerCase());
  if (!target) return [];

  const targetName = target.name.toLowerCase();
  const targetGroup = (target.muscleGroup || '').toLowerCase();
  const targetCat = (target.category || '').toLowerCase();
  const targetPlane = (target.movementPlane || '').toLowerCase();
  const targetAnatomy = (target.targetAnatomy || '').toLowerCase();

  // Helper to determine exact muscle sub-category & head
  const isUpperChest = (targetGroup.includes('upper') || targetAnatomy.includes('upper') || targetAnatomy.includes('clavicular') || targetPlane.includes('incline') || targetName.includes('incline') || targetName.includes('low-to-high')) && (targetGroup.includes('chest') || targetCat.includes('push') || targetCat.includes('chest'));
  const isMidLowerChest = !isUpperChest && (targetGroup.includes('chest') || targetCat.includes('chest') || (targetCat.includes('push') && !targetGroup.includes('shoulder') && !targetGroup.includes('tricep')));
  const isLatVertical = (targetCat.includes('vertical') || targetPlane.includes('vertical') || targetName.includes('pulldown') || targetName.includes('pull-up') || targetName.includes('chin') || targetName.includes('pullover')) && (targetGroup.includes('back') || targetGroup.includes('lat'));
  const isMidBackRow = !isLatVertical && (targetCat.includes('horizontal') || targetPlane.includes('row') || targetName.includes('row') || targetName.includes('shrug') || targetGroup.includes('trap') || targetGroup.includes('back'));
  const isSideDelt = (targetGroup.includes('shoulder') || targetCat.includes('shoulder')) && (targetName.includes('lateral') || targetAnatomy.includes('lateral'));
  const isRearDelt = (targetGroup.includes('shoulder') || targetCat.includes('shoulder')) && (targetName.includes('rear') || targetName.includes('face pull') || targetAnatomy.includes('posterior'));
  const isShoulderPress = (targetGroup.includes('shoulder') || targetCat.includes('shoulder')) && !isSideDelt && !isRearDelt;
  const isQuad = targetGroup.includes('quad') || targetCat.includes('squat') || targetPlane.includes('knee') || targetName.includes('squat') || targetName.includes('leg press') || targetName.includes('lunge') || targetName.includes('leg extension') || targetName.includes('step-up');
  const isHamstring = (targetGroup.includes('hamstring') || targetCat.includes('hinge') || targetName.includes('deadlift') || targetName.includes('leg curl') || targetName.includes('nordic') || targetName.includes('good morning') || targetName.includes('hyperextension')) && !targetGroup.includes('quad');
  const isGlute = targetGroup.includes('glute') || targetName.includes('thrust') || targetName.includes('kickback') || targetName.includes('bridge') || targetAnatomy.includes('gluteus');
  const isBicep = targetGroup.includes('bicep') || (targetGroup.includes('arm') && targetName.includes('curl'));
  const isTricep = targetGroup.includes('tricep') || (targetGroup.includes('arm') && (targetName.includes('pushdown') || targetName.includes('extension') || targetName.includes('dip') || targetName.includes('skull') || targetName.includes('close-grip')));
  const isCalf = targetGroup.includes('calf') || targetName.includes('calf');
  const isCore = targetGroup.includes('core') || targetGroup.includes('ab') || targetCat.includes('core');

  const candidates = list.filter(ex => {
    if (!ex || !ex.name) return false;
    const name = ex.name.toLowerCase();
    if (name === targetName) return false;

    const g = (ex.muscleGroup || '').toLowerCase();
    const c = (ex.category || '').toLowerCase();
    const p = (ex.movementPlane || '').toLowerCase();
    const a = (ex.targetAnatomy || '').toLowerCase();

    // Injury exclusions
    if (injuries && injuries.includes('knee')) {
      if (name.includes('back squat') || name.includes('front squat') || name.includes('hack squat') || name.includes('sissy squat')) return false;
    }
    if (injuries && injuries.includes('shoulder')) {
      if (name.includes('overhead barbell') || name.includes('behind-the-neck') || name.includes('dips')) return false;
    }
    if (injuries && injuries.includes('lower_back')) {
      if (name.includes('barbell deadlift') || name.includes('barbell back squat') || name.includes('good morning') || name.includes('pendlay row')) return false;
    }

    // Equipment filter
    if (equipment === 'bodyweight') {
      const isBw = name.includes('push-up') || name.includes('pull-up') || name.includes('chin') || name.includes('dip') || name.includes('air squat') || name.includes('plank') || name.includes('raise') || name.includes('crunch') || name.includes('nordic') || name.includes('bird dog') || name.includes('dead bug') || name.includes('climber') || name.includes('bridge') || name.includes('inverted row');
      if (!isBw) return false;
    } else if (equipment === 'home_dumbbells') {
      if (name.includes('barbell') || name.includes('cable') || name.includes('machine') || name.includes('hack') || name.includes('leg press') || name.includes('pec deck') || name.includes('smith')) return false;
    }

    if (isUpperChest) {
      return (g.includes('upper') || a.includes('upper') || a.includes('clavicular') || p.includes('incline') || name.includes('incline') || name.includes('low-to-high') || name.includes('decline push-up')) && (g.includes('chest') || c.includes('push') || c.includes('chest'));
    }
    if (isMidLowerChest) {
      return (g.includes('chest') || c.includes('chest') || (c.includes('push') && !g.includes('shoulder') && !g.includes('tricep'))) && !p.includes('incline') && !name.includes('incline');
    }
    if (isLatVertical) {
      return (c.includes('vertical') || p.includes('vertical') || name.includes('pulldown') || name.includes('pull-up') || name.includes('chin') || name.includes('pullover')) && (g.includes('lat') || g.includes('back'));
    }
    if (isMidBackRow) {
      return (c.includes('horizontal') || p.includes('row') || name.includes('row') || name.includes('shrug')) && (g.includes('back') || g.includes('lat') || g.includes('trap'));
    }
    if (isSideDelt) {
      return (g.includes('shoulder') || c.includes('shoulder')) && (name.includes('lateral') || a.includes('lateral'));
    }
    if (isRearDelt) {
      return (g.includes('shoulder') || c.includes('shoulder')) && (name.includes('rear') || name.includes('face pull') || a.includes('posterior'));
    }
    if (isShoulderPress) {
      return (g.includes('shoulder') || c.includes('shoulder')) && (name.includes('press') || p.includes('overhead') || a.includes('anterior'));
    }
    if (isQuad) {
      return (g.includes('quad') || c.includes('squat') || name.includes('squat') || name.includes('leg press') || name.includes('lunge') || name.includes('leg extension') || name.includes('step-up')) && !name.includes('deadlift');
    }
    if (isHamstring) {
      return (g.includes('hamstring') || c.includes('hinge') || name.includes('deadlift') || name.includes('leg curl') || name.includes('nordic') || name.includes('good morning') || name.includes('hyperextension')) && !g.includes('quad') && !name.includes('squat');
    }
    if (isGlute) {
      return (g.includes('glute') || name.includes('thrust') || name.includes('kickback') || name.includes('bridge') || a.includes('gluteus'));
    }
    if (isBicep) {
      return g.includes('bicep') || (g.includes('arm') && name.includes('curl')) || name.includes('bicep') || name.includes('chin-up');
    }
    if (isTricep) {
      return g.includes('tricep') || (g.includes('arm') && (name.includes('pushdown') || name.includes('extension') || name.includes('dip') || name.includes('skull') || name.includes('close-grip')));
    }
    if (isCalf) {
      return g.includes('calf') || name.includes('calf');
    }
    if (isCore) {
      return g.includes('core') || g.includes('ab') || c.includes('core') || name.includes('plank') || name.includes('crunch') || name.includes('rollout') || name.includes('twist') || name.includes('raise') || name.includes('woodchop') || name.includes('dog') || name.includes('bug') || name.includes('climber');
    }

    return false;
  });

  return candidates;
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT: generateProgram()
// ─────────────────────────────────────────────────────────────

export function generateProgram(trainingProfile = {}, allPresetExercises = [], variantSeed = 0) {
  const safeSeed = typeof variantSeed === 'number' ? variantSeed : (parseInt(variantSeed, 10) || 0);
  const gymDays = trainingProfile.gymDays || trainingProfile.days || 4;
  const trainingExperience = trainingProfile.trainingExperience || trainingProfile.experience || 'beginner';
  const trainingGoal = trainingProfile.trainingGoal || trainingProfile.goal || 'hypertrophy';
  const equipment = trainingProfile.equipment || 'full_gym';
  const injuries = trainingProfile.injuries || trainingProfile.trainingInjuries || [];
  const sessionTime = trainingProfile.sessionTime || trainingProfile.duration || 60;
  const gender = trainingProfile.gender || 'male';
  const age = trainingProfile.age || 25;
  const profession = trainingProfile.profession || '';

  const splitConfig = selectSplit(gymDays, trainingExperience, gender, safeSeed);

  const weeks = PERIODIZATION.map(period => {
    const days = splitConfig.schedule.map((sessionType, dayIdx) => {
      const isRest = sessionType === 'Rest';
      const template = SESSION_TEMPLATES[sessionType] || SESSION_TEMPLATES['Rest'];
      const exercises = isRest
        ? []
        : buildSessionExercises(sessionType, trainingGoal, period, allPresetExercises, equipment, injuries, sessionTime, trainingExperience, age, profession);

      const conditioningFinisher = (!isRest && trainingGoal === 'fat_loss') ? {
        title: '8-Minute High-Density Conditioning Finisher',
        format: 'AMRAP (As Many Rounds As Possible in 8 mins)',
        movements: [
          '10 Kettlebell / Dumbbell Swings',
          '10 Bodyweight Squats / Jump Squats',
          '15 Mountain Climbers',
        ],
        restSec: 30,
        instruction: 'Complete as many quality rounds as possible in 8 minutes with minimal rest to maximize EPOC (afterburn).',
      } : null;

      return {
        dayLabel:    `Day ${dayIdx + 1}`,
        sessionType,
        isRest,
        rationale:   template.rationale,
        exercises,
        conditioningFinisher,
      };
    });

    return {
      weekNumber:  period.weekNumber,
      phase:       period.phase,
      phaseColor:  period.phaseColor,
      phaseNote:   period.phaseNote,
      weeklyNote:  period.weeklyNote,
      days,
    };
  });

  const methodologyObj = buildMethodologyText(splitConfig, trainingProfile);
  const volumeValidation = validateWeeklyVolume(weeks[0].days, trainingGoal);
  const trainerMatchScore = calculateTrainerMatchScore(trainingProfile, splitConfig, volumeValidation);

  return {
    generatedAt:       new Date().toISOString(),
    variantSeed:       safeSeed,
    splitType:         splitConfig.splitType,
    splitName:         splitConfig.splitName,
    methodology:       methodologyObj.concise,
    fullMethodology:   methodologyObj.full,
    cappedExplanation: splitConfig.cappedExplanation,
    volumeValidation,
    trainerMatchScore,
    profile:           { gymDays, trainingExperience, trainingGoal, equipment, injuries, sessionTime, gender },
    weeks,
  };
}

// Re-export for UI labelling convenience
export { GOAL_LABELS as default };
