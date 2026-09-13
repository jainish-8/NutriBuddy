import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calculator, Disc, Info, Check, Plus, ArrowLeft, ArrowRight, ChevronLeft,
  Sparkles, Trophy, Flame, Shield, Clock, Dumbbell, Layers, Timer,
  ChevronDown, X, Play, RefreshCw, AlertCircle, Award, Activity, Search,
  Target, Trash2, Sliders, MoreVertical,
  SlidersHorizontal, RotateCw, Repeat, Droplets, Footprints
} from 'lucide-react';
import { generateProgram, getSmartAlternatives } from '../utils/programEngine';
import StrengthTrendChart from '../components/StrengthTrendChart';
import { ActiveExerciseView } from '../components/ActiveExerciseView';

export { ActiveExerciseView };

// Helper to shorten target muscle descriptions to concise text (e.g., Target: Quads • Glutes • Core)
export const formatConciseTarget = (ex) => {
  if (!ex) return 'Full Body';
  const text = `${ex.muscleGroup || ''} ${ex.targetAnatomy || ''} ${ex.category || ''}`.toLowerCase();
  const parts = [];

  if (text.includes('quad')) parts.push('Quads');
  if (text.includes('glute')) parts.push('Glutes');
  if (text.includes('hamstring')) parts.push('Hamstrings');
  if (text.includes('chest') || text.includes('pectoral')) parts.push('Chest');
  if (text.includes('lat') || text.includes('back')) {
    if (!parts.includes('Back')) parts.push('Back');
  }
  if (text.includes('deltoid') || text.includes('shoulder')) parts.push('Shoulders');
  if (text.includes('tricep')) parts.push('Triceps');
  if (text.includes('bicep')) parts.push('Biceps');
  if (text.includes('core') || text.includes('abs') || text.includes('abdominal') || text.includes('erector')) parts.push('Core');
  if (text.includes('calf') || text.includes('calves')) parts.push('Calves');

  const unique = [...new Set(parts)];
  if (unique.length > 0) {
    return unique.slice(0, 3).join(' • ');
  }

  const base = ex.muscleGroup || ex.targetAnatomy || 'Full Body';
  return base
    .replace(/\(.*?\)/g, '')
    .replace(/&/g, '•')
    .replace(/\//g, '•')
    .replace(/\s+/g, ' ')
    .trim();
};

export const WEEKS_METADATA = [
  { num: 0, label: 'Week 1', phase: 'Base Calibration', shortPhase: 'Base', rpe: '7.0', tag: 'Base Load', purpose: 'Base Calibration & Load Setting' },
  { num: 1, label: 'Week 2', phase: 'Progressive Overload', shortPhase: 'Overload', rpe: '8.0', tag: 'Overload', purpose: 'Progressive Overload & Volume Push' },
  { num: 2, label: 'Week 3', phase: 'Peak Hypertrophy', shortPhase: 'Peak', rpe: '9.0', tag: 'Peak Effort', purpose: 'Peak Hypertrophy & Maximum Effort' },
  { num: 3, label: 'Week 4', phase: 'Active Deload', shortPhase: 'Deload', rpe: '6.0', tag: 'Deload', purpose: 'Active Deload & Tissue Recovery' }
];

export const WEEK_PHASE_CONCISE = [
  'Target Intensity: RPE 7.0 • Base Load',
  'Target Intensity: RPE 8.0 • Overload',
  'Target Intensity: RPE 9.0 • Peak Effort',
  'Target Intensity: RPE 6.0 • Deload'
];



export const formatConciseAnatomyTarget = (text, ex) => {
  if (!text) return 'Full Body';

  // Direct pattern mappings for user-specified examples
  if (/transverse abdominis.*rectus abdominis|deep core bracing|abs & core & rectus abdominis/i.test(text)) {
    return 'Core Bracing • Abs';
  }
  if (/anterior deltoids.*medial deltoids|front shoulders.*medial deltoids/i.test(text)) {
    return 'Shoulders • Triceps';
  }
  if (/front thighs.*glutes|quadriceps.*gluteus maximus/i.test(text)) {
    return 'Quads • Glutes';
  }
  if (/latissimus dorsi.*rhomboids|lats.*back.*rhomboids|mid.*upper back.*traps/i.test(text)) {
    return 'Lats • Upper Back';
  }

  // Systematic cleaning & stripping parenthetical medical terms
  let cleaned = text
    .replace(/Pectoralis Major/gi, 'Chest')
    .replace(/Quadriceps/gi, 'Quads')
    .replace(/Gluteus Maximus/gi, 'Glutes')
    .replace(/Gluteus Medius/gi, 'Glutes')
    .replace(/Latissimus Dorsi/gi, 'Lats')
    .replace(/Trapezius/gi, 'Upper Back')
    .replace(/Rhomboids/gi, 'Upper Back')
    .replace(/Anterior Deltoids/gi, 'Shoulders')
    .replace(/Lateral Deltoids/gi, 'Shoulders')
    .replace(/Posterior Deltoids/gi, 'Rear Delts')
    .replace(/Infraspinatus/gi, 'Rotator Cuff')
    .replace(/Triceps Brachii/gi, 'Triceps')
    .replace(/Biceps Brachii/gi, 'Biceps')
    .replace(/Rectus Abdominis/gi, 'Abs')
    .replace(/Transverse Abdominis/gi, 'Core')
    .replace(/Gastrocnemius|Soleus/gi, 'Calves')
    .replace(/Biceps Femoris/gi, 'Hamstrings')
    .replace(/Posterior Chain/gi, 'Glutes • Hamstrings')
    .replace(/\(.*?\)/g, '')
    .replace(/&/g, '•')
    .replace(/\//g, '•')
    .replace(/,/g, '•')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = cleaned
    .split(/[•·]/)
    .map(t => t.trim())
    .filter(Boolean)
    .map(t => {
      if (/quad/i.test(t)) return 'Quads';
      if (/glute/i.test(t)) return 'Glutes';
      if (/hamstring/i.test(t)) return 'Hamstrings';
      if (/chest/i.test(t)) return 'Chest';
      if (/lat/i.test(t)) return 'Lats';
      if (/back/i.test(t) || /trap/i.test(t) || /rhomboid/i.test(t)) return 'Upper Back';
      if (/shoulder/i.test(t) || /delt/i.test(t)) return 'Shoulders';
      if (/tricep/i.test(t)) return 'Triceps';
      if (/bicep/i.test(t)) return 'Biceps';
      if (/core/i.test(t)) return 'Core';
      if (/abs/i.test(t)) return 'Abs';
      if (/calf|calves/i.test(t)) return 'Calves';
      return t;
    })
    .filter(t => !/rotator cuff/i.test(t));

  const unique = [...new Set(tokens)];
  if (unique.length > 0) {
    return unique.slice(0, 3).join(' • ');
  }
  return cleaned || 'Full Body';
};

export const formatVolumeRepBadge = (ex) => {
  if (!ex) return '3 Sets × 8–12 Reps';
  const isIsometric = /plank|hold|wall sit/i.test(ex.name);
  const sets = ex.sets || 3;
  if (isIsometric) {
    return `${sets} Sets × 45–60s Hold`;
  }
  return `${sets} Sets × ${ex.repRange || '8–12'} Reps`;
};

export const formatRestIntervalBadge = (restSec) => {
  const s = parseInt(restSec, 10);
  if (!s || isNaN(s)) return '1:30 Rest';
  const mins = Math.floor(s / 60);
  const remainder = s % 60;
  if (mins > 0 && remainder > 0) {
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder} Rest`;
  }
  if (mins > 0 && remainder === 0) {
    return `${mins}:00 Rest`;
  }
  return `${s}s Rest`;
};

// ===== PRESET EXERCISE DATABASE WITH PRECISE ANATOMY (38 exercises) =====
export const PRESET_EXERCISES = [
  {
    name: 'Barbell Back Squat',
    category: 'Squat',
    muscleGroup: 'Quads & Glutes',
    targetAnatomy: 'Quadriceps (Rectus Femoris, Vastus Lateralis/Medialis) & Gluteus Maximus',
    synergists: 'Adductor Magnus, Soleus, Hamstrings, Erector Spinae',
    movementPlane: 'Bilateral Knee-Dominant Compound Squat',
    cues: [
      'Sit down and back between your heels, keeping knees tracking over toes.',
      'Maintain an upright chest and braced neutral spine.',
      'Drive upwards through mid-foot, engaging quads and glutes.'
    ]
  },
  {
    name: 'Barbell Bench Press',
    category: 'Horizontal Push',
    muscleGroup: 'Chest (Mid / Sternal)',
    targetAnatomy: 'Pectoralis Major (Sternal & Mid-Costal Head · Mid Chest)',
    synergists: 'Anterior Deltoids, Triceps Brachii (Lateral & Medial Heads)',
    movementPlane: 'Bilateral Horizontal Chest Press',
    cues: [
      'Retract scapulae (pinch shoulder blades together) and arch upper back slightly.',
      'Drive heels flat into the ground for leg drive.',
      'Lower bar to lower-chest and press up with flared elbows.'
    ]
  },
  {
    name: 'Incline Dumbbell Press',
    category: 'Horizontal Push',
    muscleGroup: 'Chest (Upper / Clavicular)',
    targetAnatomy: 'Pectoralis Major (Clavicular Head · Upper Chest)',
    synergists: 'Anterior Deltoids, Triceps Brachii',
    movementPlane: '30° Incline Dumbbell Press',
    cues: [
      'Set incline bench to 30 degrees.',
      'Retract shoulder blades and press dumbbells over upper chest.',
      'Lower under control until weights align with chest.'
    ]
  },
  {
    name: 'Incline Barbell Bench Press',
    category: 'Horizontal Push',
    muscleGroup: 'Chest (Upper / Clavicular)',
    targetAnatomy: 'Pectoralis Major (Clavicular Head · Upper Chest)',
    synergists: 'Anterior Deltoids, Triceps Brachii',
    movementPlane: '30°–45° Incline Barbell Press',
    cues: [
      'Set incline bench to 30-45 degrees.',
      'Keep wrists stacked under the bar.',
      'Lower bar to upper chest, then drive straight up.'
    ]
  },
  {
    name: 'Dumbbell Bench Press',
    category: 'Horizontal Push',
    muscleGroup: 'Chest (Mid / Sternal)',
    targetAnatomy: 'Pectoralis Major (Sternal Fibers · Mid Chest)',
    synergists: 'Anterior Deltoids, Triceps Brachii',
    movementPlane: 'Converging Flat Dumbbell Press',
    cues: [
      'Lie flat, press dumbbells directly above chest.',
      'Lower weights to sides of chest with elbows at 45 degrees.',
      'Press back up, bringing dumbbells close without clashing.'
    ]
  },
  {
    name: 'Machine Chest Press',
    category: 'Horizontal Push',
    muscleGroup: 'Chest (Mid / Sternal)',
    targetAnatomy: 'Pectoralis Major (Sternal Head · Mid Chest)',
    synergists: 'Anterior Deltoids, Triceps Brachii',
    movementPlane: 'Fixed-Plane Horizontal Chest Press',
    cues: [
      'Adjust seat height so handles align with mid-chest.',
      'Press handles forward smoothly, locking out without hyperextending.',
      'Control the eccentric return to full stretch.'
    ]
  },
  {
    name: 'Cable Chest Fly',
    category: 'Horizontal Push',
    muscleGroup: 'Chest (Inner / Sternal)',
    targetAnatomy: 'Pectoralis Major (Sternal & Costal Heads · Peak Squeeze)',
    synergists: 'Anterior Deltoids, Coracobrachialis',
    movementPlane: 'Horizontal Cable Adduction Fly',
    cues: [
      'Keep a slight bend in elbows and a forward lean.',
      'Bring hands together in a wide arc, squeezing chest at center.',
      'Control the stretch back to starting position.'
    ]
  },
  {
    name: 'Cable Crossover',
    category: 'Horizontal Push',
    muscleGroup: 'Chest (Lower / Costal)',
    targetAnatomy: 'Pectoralis Major (Costal Head · Lower Chest)',
    synergists: 'Anterior Deltoids, Pectoralis Minor',
    movementPlane: 'High-to-Low Cable Adduction',
    cues: [
      'Set pulleys high. Step forward to create tension.',
      'Bring hands together in front of waist, crossing over slightly.',
      'Control the stretch back up with slightly bent elbows.'
    ]
  },
  {
    name: 'Pec Deck Fly',
    category: 'Horizontal Push',
    muscleGroup: 'Chest (Sternal Isolation)',
    targetAnatomy: 'Pectoralis Major (Sternal Fibers · Peak Contraction)',
    synergists: 'Anterior Deltoids',
    movementPlane: 'Transverse Adduction Isolation',
    cues: [
      'Keep elbows at chest height and squeeze pads together.',
      'Pause for 1 second at peak contraction.',
      'Open arms back until chest is fully stretched.'
    ]
  },
  {
    name: 'Barbell Deadlift',
    category: 'Hinge',
    muscleGroup: 'Posterior Chain',
    targetAnatomy: 'Posterior Chain (Erector Spinae, Gluteus Maximus, Hamstrings)',
    synergists: 'Trapezius, Latissimus Dorsi, Forearm Flexors, Core',
    movementPlane: 'Floor Hip Hinge & Kinetic Extension',
    cues: [
      'Set feet hip-width apart with bar over mid-foot.',
      'Pull slack out of the bar, brace lats, and push floor away.',
      'Lock out hips at top by squeezing glutes; do not hyperextend.'
    ]
  },
  {
    name: 'Romanian Deadlift',
    category: 'Hinge',
    muscleGroup: 'Hamstrings & Glutes',
    targetAnatomy: 'Hamstrings (Biceps Femoris & Semitendinosus) & Gluteus Maximus',
    synergists: 'Erector Spinae, Adductor Magnus, Forearm Grip',
    movementPlane: 'Standing Hip Hinge (Eccentric Stretch)',
    cues: [
      'Hinge at hips, pushing glutes backward with soft knees.',
      'Lower bar close to legs until hamstrings stretch fully.',
      'Drive hips forward to stand, keeping back flat.'
    ]
  },
  {
    name: 'Hip Thrust',
    category: 'Hinge',
    muscleGroup: 'Glutes',
    targetAnatomy: 'Gluteus Maximus (Upper & Lower Fibers)',
    synergists: 'Hamstrings, Quadriceps, Adductor Magnus',
    movementPlane: 'Horizontal Hip Extension',
    cues: [
      'Position upper back across bench with barbell over hips.',
      'Drive through heels and squeeze glutes at top lockout.',
      'Keep chin tucked and ribs down throughout movement.'
    ]
  },
  {
    name: 'Bulgarian Split Squat',
    category: 'Squat',
    muscleGroup: 'Quads & Glutes',
    targetAnatomy: 'Quadriceps (Vastus Medialis/Lateralis) & Gluteus Medius',
    synergists: 'Hamstrings, Calves, Core Stabilizers',
    movementPlane: 'Unilateral Knee-Dominant Squat',
    cues: [
      'Elevate back foot on bench. Keep front foot forward.',
      'Lower hips until back knee is just above the floor.',
      'Drive through front heel to return upward.'
    ]
  },
  {
    name: 'Leg Press',
    category: 'Squat',
    muscleGroup: 'Quadriceps',
    targetAnatomy: 'Quadriceps (Vastus Lateralis, Medialis & Intermedius)',
    synergists: 'Gluteus Maximus, Adductor Magnus',
    movementPlane: '45° Closed Kinetic Sled Press',
    cues: [
      'Place feet shoulder-width apart on the sled.',
      'Lower platform until knees bend at 90 degrees.',
      'Press through heels; avoid locking knees at top.'
    ]
  },
  {
    name: 'Leg Extension',
    category: 'Squat',
    muscleGroup: 'Quadriceps (Isolation)',
    targetAnatomy: 'Quadriceps (Rectus Femoris · Front Thigh Isolation)',
    synergists: 'Vastus Medialis & Lateralis',
    movementPlane: 'Open Kinetic Knee Extension',
    cues: [
      'Sit back in the pad, aligns knees with the pivot point.',
      'Extend legs upwards completely and squeeze the quadriceps.',
      'Return to the starting position under slow control.'
    ]
  },
  {
    name: 'Lying Leg Curl',
    category: 'Hinge',
    muscleGroup: 'Hamstrings (Isolation)',
    targetAnatomy: 'Hamstrings (Biceps Femoris Short & Long Heads)',
    synergists: 'Gastrocnemius, Gracilis',
    movementPlane: 'Isolated Knee Flexion',
    cues: [
      'Lie face down, positioning roller pad just below calf muscles.',
      'Pull heels towards glutes smoothly.',
      'Extend legs back down slowly to full stretch.'
    ]
  },
  {
    name: 'Standing Calf Raise',
    category: 'Legs',
    muscleGroup: 'Calves (Gastrocnemius)',
    targetAnatomy: 'Gastrocnemius (Lateral & Medial Heads · Upper Calf)',
    synergists: 'Soleus, Plantaris, Tibialis Posterior',
    movementPlane: 'Ankle Plantarflexion (Extended Knee)',
    cues: [
      'Lower heels below step level to get a full calf stretch.',
      'Drive upwards through the balls of your feet.',
      'Hold peak contraction for 1 second before lowering.'
    ]
  },
  {
    name: 'Seated Calf Raise',
    category: 'Legs',
    muscleGroup: 'Calves (Soleus)',
    targetAnatomy: 'Soleus (Deep Calf Muscle · Lower Calf Width)',
    synergists: 'Gastrocnemius, Achilles Tendon',
    movementPlane: 'Ankle Plantarflexion (Flexed Knee)',
    cues: [
      'Place balls of feet on platform and pad over lower thighs.',
      'Drop heels for a deep stretch on the soleus.',
      'Raise heels as high as possible and squeeze.'
    ]
  },
  {
    name: 'Goblet Squat',
    category: 'Squat',
    muscleGroup: 'Quadriceps & Core',
    targetAnatomy: 'Quadriceps (Vastus Lateralis & Medialis) & Core',
    synergists: 'Gluteus Maximus, Anterior Deltoids',
    movementPlane: 'Anterior-Loaded Bilateral Squat',
    cues: [
      'Hold kettlebell or dumbbell close to chest.',
      'Squat deep between knees with vertical torso.',
      'Push through mid-foot to return upright.'
    ]
  },
  {
    name: 'Overhead Barbell Press',
    category: 'Vertical Push',
    muscleGroup: 'Shoulders (Front / Anterior)',
    targetAnatomy: 'Anterior Deltoids (Front Delts) & Medial Deltoids',
    synergists: 'Triceps Brachii, Upper Trapezius, Core Stabilizers',
    movementPlane: 'Standing Vertical Overhead Press',
    cues: [
      'Squeeze glutes and brace core to stabilize lumbar spine.',
      'Keep elbows slightly in front of bar in rack position.',
      'Press straight overhead, moving head through the window at lockout.'
    ]
  },
  {
    name: 'Hammer Strength Shoulder Press',
    category: 'Vertical Push',
    muscleGroup: 'Shoulders (Anterior & Lateral)',
    targetAnatomy: 'Anterior Deltoids & Clavicular Head',
    synergists: 'Triceps Brachii, Lateral Deltoids',
    movementPlane: 'Guided Overhead Shoulder Press',
    cues: [
      'Sit tall with lower back pressed firmly into pad.',
      'Press handles upwards until arms are extended.',
      'Lower smoothly to ear-level and repeat.'
    ]
  },
  {
    name: 'Dumbbell Lateral Raise',
    category: 'Vertical Push',
    muscleGroup: 'Shoulders (Side / Lateral)',
    targetAnatomy: 'Lateral Deltoids (Side Delts · Shoulder Width & V-Taper)',
    synergists: 'Supraspinatus, Upper Trapezius, Serratus Anterior',
    movementPlane: 'Coronal Plane Shoulder Abduction',
    cues: [
      'Slightly lean forward and raise dumbbells to the sides.',
      'Lead with elbows, keeping hands lower than elbows.',
      'Control the descent to avoid swinging.'
    ]
  },
  {
    name: 'Face Pull',
    category: 'Horizontal Pull',
    muscleGroup: 'Rear Delts & Upper Back',
    targetAnatomy: 'Posterior Deltoids (Rear Delts) & Infraspinatus (Rotator Cuff)',
    synergists: 'Rhomboids, Middle & Lower Trapezius, Teres Minor',
    movementPlane: 'Horizontal Cable Pull with External Rotation',
    cues: [
      'Pull rope towards face, pulling hands apart at the end.',
      'Lead with elbows, squeezing rear delts and upper back.',
      'Hold contraction for 1 second before returning.'
    ]
  },
  {
    name: 'Pull-up',
    category: 'Vertical Pull',
    muscleGroup: 'Back (Lats / Width)',
    targetAnatomy: 'Latissimus Dorsi (Outer Lats · Back Width)',
    synergists: 'Biceps Brachii, Brachialis, Teres Major, Rhomboids',
    movementPlane: 'Vertical Bodyweight Pull',
    cues: [
      'Depress shoulder blades before pulling with arms.',
      'Drive elbows down towards hips to engage latissimus dorsi.',
      'Lower under control to a full dead hang.'
    ]
  },
  {
    name: 'Lat Pulldown',
    category: 'Vertical Pull',
    muscleGroup: 'Back (Lats / Width)',
    targetAnatomy: 'Latissimus Dorsi (Upper & Lower Lats · V-Taper)',
    synergists: 'Biceps Brachii, Teres Major, Posterior Deltoid',
    movementPlane: 'Vertical Cable Pull',
    cues: [
      'Pull bar down to upper chest, pulling through elbows.',
      'Keep chest up and lean back very slightly.',
      'Return bar slowly to a full vertical stretch.'
    ]
  },
  {
    name: 'Barbell Row',
    category: 'Horizontal Pull',
    muscleGroup: 'Back (Thickness & Traps)',
    targetAnatomy: 'Latissimus Dorsi, Rhomboids & Mid Trapezius (Back Thickness)',
    synergists: 'Biceps Brachii, Posterior Deltoids, Spinal Erectors',
    movementPlane: 'Bent-Over Horizontal Pull',
    cues: [
      'Hinge at hips to a 45-degree angle with neutral spine.',
      'Pull bar towards lower ribcage/navel.',
      'Squeeze shoulder blades tightly at peak contraction.'
    ]
  },
  {
    name: 'Seated Cable Row',
    category: 'Horizontal Pull',
    muscleGroup: 'Back (Mid Back)',
    targetAnatomy: 'Middle Trapezius, Rhomboids & Latissimus Dorsi',
    synergists: 'Biceps Brachii, Posterior Deltoids, Forearm Flexors',
    movementPlane: 'Horizontal Cable Row',
    cues: [
      'Sit tall, pull handle towards lower abdomen.',
      'Squeeze shoulder blades and pull elbows back.',
      'Avoid swinging torso backward or forward.'
    ]
  },
  {
    name: 'T-Bar Row',
    category: 'Horizontal Pull',
    muscleGroup: 'Back (Upper & Mid)',
    targetAnatomy: 'Mid-Upper Back (Rhomboids, Teres Major, Mid Traps)',
    synergists: 'Latissimus Dorsi, Biceps, Erector Spinae',
    movementPlane: 'Semi-Incline Heavy Row',
    cues: [
      'Hinge at hips with braced lower back.',
      'Pull handles towards upper abs, driving elbows back.',
      'Lower under control without rounding spine.'
    ]
  },
  {
    name: 'Cable Pullover',
    category: 'Vertical Pull',
    muscleGroup: 'Back (Lats Isolation)',
    targetAnatomy: 'Latissimus Dorsi (Strict Isolation · Outer Lats Stretch)',
    synergists: 'Teres Major, Triceps Long Head, Pectoralis Minor',
    movementPlane: 'Sagittal Plane Shoulder Extension',
    cues: [
      'Hinge slightly forward with straight arms on straight bar attachment.',
      'Pull bar down to thighs in an arc, engaging lats.',
      'Control bar back up above eye level.'
    ]
  },
  {
    name: 'Dumbbell Bicep Curl',
    category: 'Arms',
    muscleGroup: 'Biceps (Long & Short Heads)',
    targetAnatomy: 'Biceps Brachii (Short & Long Heads · Bicep Peak)',
    synergists: 'Brachialis, Brachioradialis',
    movementPlane: 'Isolated Supinated Elbow Flexion',
    cues: [
      'Pin elbows strictly to your sides without swinging.',
      'Supinate wrists (turn palms upward) as you curl.',
      'Lower weight slowly to a full stretch.'
    ]
  },
  {
    name: 'Barbell Curl',
    category: 'Arms',
    muscleGroup: 'Biceps (Overall Mass)',
    targetAnatomy: 'Biceps Brachii (Overall Bicep Mass)',
    synergists: 'Brachialis, Forearm Flexors',
    movementPlane: 'Bilateral Supinated Elbow Flexion',
    cues: [
      'Grip bar shoulder-width with underhand grip.',
      'Keep torso upright and curl bar to upper chest.',
      'Lower with full control to full arm extension.'
    ]
  },
  {
    name: 'Hammer Curl',
    category: 'Arms',
    muscleGroup: 'Brachialis & Forearms',
    targetAnatomy: 'Brachialis (Bicep Thickness/Underlayer) & Brachioradialis',
    synergists: 'Biceps Brachii Long Head',
    movementPlane: 'Neutral Grip Elbow Flexion',
    cues: [
      'Hold dumbbells with palms facing each other (neutral grip).',
      'Keep elbows pinned to torso, curl dumbbells up.',
      'Squeeze brachialis and slowly lower weights.'
    ]
  },
  {
    name: 'Tricep Rope Pushdown',
    category: 'Arms',
    muscleGroup: 'Triceps (Lateral & Medial)',
    targetAnatomy: 'Triceps Brachii (Lateral & Medial Heads · Horseshoe Shape)',
    synergists: 'Anconeus',
    movementPlane: 'Isolated Cable Elbow Extension',
    cues: [
      'Pin elbows to sides and lean torso slightly forward.',
      'Push down and spread rope ends apart at full extension.',
      'Control the eccentric return up to 90 degrees.'
    ]
  },
  {
    name: 'Overhead Dumbbell Extension',
    category: 'Arms',
    muscleGroup: 'Triceps (Long Head)',
    targetAnatomy: 'Triceps Brachii (Long Head · Back of Arm Mass)',
    synergists: 'Triceps Lateral Head, Anconeus',
    movementPlane: 'Overhead Elbow Extension (Full Stretch)',
    cues: [
      'Hold dumbbell overhead with both hands in a diamond grip.',
      'Lower weight behind head by bending at the elbows.',
      'Extend arms back up, keeping elbows tucked in.'
    ]
  },
  {
    name: 'Close-Grip Bench Press',
    category: 'Horizontal Push',
    muscleGroup: 'Triceps & Chest',
    targetAnatomy: 'Triceps Brachii (Medial & Lateral Heads)',
    synergists: 'Pectoralis Major (Clavicular Head), Anterior Deltoid',
    movementPlane: 'Close-Grip Horizontal Press',
    cues: [
      'Grip bar shoulder-width (hands approx. 30cm apart).',
      'Tuck elbows close to ribs on descent.',
      'Press up powerfully, squeezing triceps at lockout.'
    ]
  },
  {
    name: 'Skull Crushers',
    category: 'Arms',
    muscleGroup: 'Triceps (Long Head)',
    targetAnatomy: 'Triceps Brachii (Long & Medial Heads)',
    synergists: 'Anconeus',
    movementPlane: 'Lying Tricep Elbow Extension',
    cues: [
      'Lie flat holding EZ bar over forehead.',
      'Bend elbows to lower bar towards crown of head.',
      'Extend elbows back to starting position without moving upper arms.'
    ]
  },
  {
    name: 'Hanging Knee Raise',
    category: 'Core',
    muscleGroup: 'Abs (Lower / Rectus)',
    targetAnatomy: 'Rectus Abdominis (Lower Abdominal Fibers)',
    synergists: 'Iliopsoas (Hip Flexors), Obliques, Forearm Grip',
    movementPlane: 'Hanging Posterior Pelvic Tilt',
    cues: [
      'Hang from bar with active shoulders.',
      'Pull knees up to chest, curling pelvis upward.',
      'Avoid swinging; slowly lower legs down.'
    ]
  },
  {
    name: 'Plank',
    category: 'Core',
    muscleGroup: 'Core (Transverse & Stabilizers)',
    targetAnatomy: 'Transverse Abdominis & Rectus Abdominis (Deep Core Bracing)',
    synergists: 'Gluteus Maximus, Quadriceps, Deltoids, Serratus Anterior',
    movementPlane: 'Isometric Anti-Extension Hold',
    cues: [
      'Rest on forearms and toes with elbows under shoulders.',
      'Squeeze glutes and abs to keep body in a rigid straight line.',
      'Breathe steadily; do not allow lower back to sag.'
    ]
  },
  {
    name: 'Incline Machine Chest Press',
    category: 'Horizontal Push',
    muscleGroup: 'Chest (Upper / Clavicular)',
    targetAnatomy: 'Pectoralis Major (Clavicular Head · Upper Chest)',
    synergists: 'Anterior Deltoids, Triceps Brachii',
    movementPlane: 'Fixed Incline Guided Press',
    cues: [
      'Set seat so upper handles align with upper chest.',
      'Drive upwards smoothly and lock out without jarring.',
      'Control the eccentric lowering phase to a deep chest stretch.'
    ]
  },
  {
    name: 'Decline Barbell Bench Press',
    category: 'Horizontal Push',
    muscleGroup: 'Chest (Lower / Costal)',
    targetAnatomy: 'Pectoralis Major (Costal Head · Lower Chest)',
    synergists: 'Triceps Brachii, Anterior Deltoids',
    movementPlane: 'Decline Barbell Press',
    cues: [
      'Hook legs securely into decline bench supports.',
      'Lower bar to lower chest / upper abdomen line.',
      'Press up explosively while keeping shoulder blades pinned.'
    ]
  },
  {
    name: 'Decline Dumbbell Press',
    category: 'Horizontal Push',
    muscleGroup: 'Chest (Lower / Costal)',
    targetAnatomy: 'Pectoralis Major (Costal Head · Lower Chest)',
    synergists: 'Triceps Brachii, Anterior Deltoids',
    movementPlane: 'Decline Converging Dumbbell Press',
    cues: [
      'Lie back on decline bench with dumbbells at ribs.',
      'Press upward in a slight converging arc over lower chest.',
      'Control the descent to full stretch.'
    ]
  },
  {
    name: 'Dumbbell Fly',
    category: 'Horizontal Push',
    muscleGroup: 'Chest (Mid / Sternal)',
    targetAnatomy: 'Pectoralis Major (Sternal & Costal Fibers · Stretch Tension)',
    synergists: 'Anterior Deltoids, Coracobrachialis',
    movementPlane: 'Horizontal Dumbbell Fly',
    cues: [
      'Maintain a slight 15° bend in elbows throughout.',
      'Lower dumbbells wide until feeling a deep pectoral stretch.',
      'Bring weights together smoothly, squeezing chest at top.'
    ]
  },
  {
    name: 'Low-to-High Cable Fly',
    category: 'Horizontal Push',
    muscleGroup: 'Chest (Upper / Clavicular)',
    targetAnatomy: 'Pectoralis Major (Clavicular Head · Upper Chest Squeeze)',
    synergists: 'Anterior Deltoids, Serratus Anterior',
    movementPlane: 'Low-to-High Converging Fly',
    cues: [
      'Set pulleys low. Stand staggered for core balance.',
      'Bring handles upward and inward across chest to chin level.',
      'Squeeze upper chest firmly at peak contraction.'
    ]
  },
  {
    name: 'Standard Push-Up',
    category: 'Horizontal Push',
    muscleGroup: 'Chest & Core',
    targetAnatomy: 'Pectoralis Major (Overall Mass) & Core Stabilizers',
    synergists: 'Triceps Brachii, Anterior Deltoids, Serratus Anterior',
    movementPlane: 'Bodyweight Prone Horizontal Push',
    cues: [
      'Place hands slightly wider than shoulder-width with fingers spread.',
      'Brace core and glutes into a rigid plank position.',
      'Lower chest to 2 inches from floor with elbows at 45 degrees.'
    ]
  },
  {
    name: 'Incline Push-Up',
    category: 'Horizontal Push',
    muscleGroup: 'Chest (Lower / Costal)',
    targetAnatomy: 'Pectoralis Major (Lower Fibers · Reduced Resistance)',
    synergists: 'Triceps Brachii, Anterior Deltoids',
    movementPlane: 'Hands-Elevated Bodyweight Push',
    cues: [
      'Place hands on sturdy bench or bar elevated 18-24 inches.',
      'Keep body rigid in a straight line.',
      'Lower lower-chest to bench edge and push up.'
    ]
  },
  {
    name: 'Decline Push-Up',
    category: 'Horizontal Push',
    muscleGroup: 'Chest (Upper / Clavicular)',
    targetAnatomy: 'Pectoralis Major (Clavicular Fibers) & Anterior Deltoids',
    synergists: 'Triceps Brachii, Serratus Anterior',
    movementPlane: 'Feet-Elevated Bodyweight Push',
    cues: [
      'Place feet on bench or plyo box with hands flat on ground.',
      'Maintain strong pelvic tilt to avoid lower back arching.',
      'Lower upper chest smoothly towards floor and press up.'
    ]
  },
  {
    name: 'Chest Dips',
    category: 'Horizontal Push',
    muscleGroup: 'Chest (Lower) & Triceps',
    targetAnatomy: 'Pectoralis Major (Costal Head) & Triceps Brachii',
    synergists: 'Anterior Deltoids, Rhomboids',
    movementPlane: 'Forward-Leaning Parallel Bar Dip',
    cues: [
      'Lean torso 30 degrees forward with flared elbows.',
      'Lower body until shoulders are below elbows.',
      'Drive upwards through palms, squeezing lower chest.'
    ]
  },
  {
    name: 'Chin-Up',
    category: 'Vertical Pull',
    muscleGroup: 'Back (Lats & Biceps)',
    targetAnatomy: 'Latissimus Dorsi & Biceps Brachii (Short Head)',
    synergists: 'Brachialis, Teres Major, Lower Trapezius',
    movementPlane: 'Supinated Vertical Pull',
    cues: [
      'Grip bar with underhand palms-facing-you grip shoulder-width.',
      'Drive elbows down and back to pull chest up to bar.',
      'Lower with strict control to full dead-hang stretch.'
    ]
  },
  {
    name: 'Close-Grip Lat Pulldown',
    category: 'Vertical Pull',
    muscleGroup: 'Back (Lower Lats)',
    targetAnatomy: 'Latissimus Dorsi (Lower Insertion & Thoracolumbar Fibers)',
    synergists: 'Biceps Brachii, Brachialis, Rhomboids',
    movementPlane: 'V-Bar Close-Grip Vertical Pull',
    cues: [
      'Attach V-bar handle. Sit upright with slight 10° backward lean.',
      'Pull handle to upper chest, driving elbows down to ribs.',
      'Extend arms fully at top to feel full lat stretch.'
    ]
  },
  {
    name: 'Reverse-Grip Lat Pulldown',
    category: 'Vertical Pull',
    muscleGroup: 'Back (Lats & Biceps)',
    targetAnatomy: 'Latissimus Dorsi & Biceps Brachii',
    synergists: 'Teres Major, Mid Trapezius',
    movementPlane: 'Supinated Lat Pulldown',
    cues: [
      'Grip straight bar with underhand shoulder-width grip.',
      'Pull bar down smoothly to upper sternum.',
      'Control eccentric ascent without letting shoulders shrug up.'
    ]
  },
  {
    name: 'Pendlay Row',
    category: 'Horizontal Pull',
    muscleGroup: 'Back (Upper & Mid)',
    targetAnatomy: 'Mid Trapezius, Rhomboids & Latissimus Dorsi',
    synergists: 'Rear Deltoids, Erector Spinae, Biceps',
    movementPlane: 'Dead-Stop Barbell Row from Floor',
    cues: [
      'Torso strictly parallel to floor on every single rep.',
      'Explosively pull bar from floor to lower chest.',
      'Return bar to complete dead stop on floor between reps.'
    ]
  },
  {
    name: 'Inverted Row',
    category: 'Horizontal Pull',
    muscleGroup: 'Back (Mid Back)',
    targetAnatomy: 'Middle Trapezius, Rhomboids & Posterior Deltoids',
    synergists: 'Biceps Brachii, Core Stabilizers',
    movementPlane: 'Bodyweight Horizontal Pull',
    cues: [
      'Hang underneath bar or suspension trainer with heels on ground.',
      'Keep body in a rigid straight plank line.',
      'Pull chest up to touch the bar, squeezing shoulder blades.'
    ]
  },
  {
    name: 'Straight-Arm Cable Pullover',
    category: 'Vertical Pull',
    muscleGroup: 'Back (Lats Isolation)',
    targetAnatomy: 'Latissimus Dorsi (Outer Flare & Width Isolation)',
    synergists: 'Teres Major, Triceps Long Head',
    movementPlane: 'Shoulder Extension in Sagittal Plane',
    cues: [
      'Grip straight or wide bar with straight arms and slight hip hinge.',
      'Sweep bar down in an arc until touching upper thighs.',
      'Squeeze lats hard at bottom; slowly raise bar back up.'
    ]
  },
  {
    name: 'Dumbbell Pullover',
    category: 'Vertical Pull',
    muscleGroup: 'Lats & Serratus Anterior',
    targetAnatomy: 'Latissimus Dorsi, Serratus Anterior & Clavicular Pectoralis',
    synergists: 'Triceps Long Head, Teres Major',
    movementPlane: 'Transverse-Bench Overhead Arc',
    cues: [
      'Lie perpendicular across bench with upper back supported.',
      'Hold single dumbbell overhead with palms flat against underside of plate.',
      'Lower weight behind head in an arc until feeling lat stretch.'
    ]
  },
  {
    name: 'Trap Bar Deadlift',
    category: 'Hinge',
    muscleGroup: 'Posterior Chain & Quads',
    targetAnatomy: 'Quadriceps, Gluteus Maximus & Erector Spinae',
    synergists: 'Trapezius, Latissimus Dorsi, Soleus',
    movementPlane: 'Neutral-Grip Bilateral Floor Pull',
    cues: [
      'Stand in center of trap bar with neutral palms facing inward.',
      'Hinge hips back, grip handles, and push through heels.',
      'Stand tall and squeeze glutes at lockout.'
    ]
  },
  {
    name: 'Rack Pull',
    category: 'Hinge',
    muscleGroup: 'Upper Back & Traps',
    targetAnatomy: 'Trapezius (Upper & Mid), Erector Spinae & Lats',
    synergists: 'Gluteus Maximus, Forearm Grip',
    movementPlane: 'Partial-Range Concentric Pull from Knee Height',
    cues: [
      'Set bar on safety pins just below knee caps.',
      'Brace spine firmly, pull shoulder blades back, and drive hips forward.',
      'Lock out at top without over-arching lumbar.'
    ]
  },
  {
    name: 'Barbell Shrug',
    category: 'Horizontal Pull',
    muscleGroup: 'Traps (Upper)',
    targetAnatomy: 'Trapezius (Upper Clavicular Fibers)',
    synergists: 'Levator Scapulae, Forearm Flexors',
    movementPlane: 'Scapular Elevation',
    cues: [
      'Hold barbell shoulder-width with an overhand grip.',
      'Shrug shoulders straight up towards ears without rolling.',
      'Hold peak squeeze for 1 second, then lower under control.'
    ]
  },
  {
    name: 'Hack Squat',
    category: 'Squat',
    muscleGroup: 'Quads (Isolation)',
    targetAnatomy: 'Quadriceps (Vastus Lateralis, Medialis, Rectus Femoris)',
    synergists: 'Gluteus Maximus, Adductor Magnus',
    movementPlane: 'Guided 45° Incline Quad Squat',
    cues: [
      'Position back flat against pad with feet shoulder-width on platform.',
      'Release safeties and lower down until knees reach 90 degrees.',
      'Drive upwards through heels and mid-foot, emphasizing quads.'
    ]
  },
  {
    name: 'Walking Lunges',
    category: 'Squat',
    muscleGroup: 'Quads & Glutes',
    targetAnatomy: 'Quadriceps, Gluteus Maximus & Hamstrings',
    synergists: 'Adductor Magnus, Calves, Core Stabilizers',
    movementPlane: 'Unilateral Forward Step Locomotion',
    cues: [
      'Take a controlled step forward, lowering trailing knee to 1 inch from floor.',
      'Keep front knee tracking over toes and torso upright.',
      'Drive off front heel to step directly into next forward lunge.'
    ]
  },
  {
    name: 'Reverse Lunges',
    category: 'Squat',
    muscleGroup: 'Quads & Glutes (Knee-Friendly)',
    targetAnatomy: 'Gluteus Maximus & Quadriceps (Reduced Shear Force)',
    synergists: 'Hamstrings, Core Stabilizers',
    movementPlane: 'Unilateral Backward Step Lunge',
    cues: [
      'Step backwards with one leg, lowering hips until front thigh is parallel.',
      'Keep weight focused on front heel.',
      'Push through front foot to return to standing.'
    ]
  },
  {
    name: 'Barbell Step-Ups',
    category: 'Squat',
    muscleGroup: 'Quads & Glutes',
    targetAnatomy: 'Quadriceps & Gluteus Maximus (Unilateral Power)',
    synergists: 'Hamstrings, Calves, Core',
    movementPlane: 'Unilateral Vertical Step Elevation',
    cues: [
      'Place entire foot firmly on 16-20 inch box or bench.',
      'Drive through front heel to step up without pushing off back toe.',
      'Lower trailing foot down with 2-second eccentric control.'
    ]
  },
  {
    name: 'Sissy Squat',
    category: 'Squat',
    muscleGroup: 'Quads (Rectus Femoris)',
    targetAnatomy: 'Quadriceps (Rectus Femoris in Lengthened Position)',
    synergists: 'Core Stabilizers, Calves',
    movementPlane: 'Extreme Knee Flexion Quad Isolation',
    cues: [
      'Lean torso back in line with thighs while bending knees forward.',
      'Lower until feeling maximum stretch in front of thighs.',
      'Push back up by contracting quadriceps.'
    ]
  },
  {
    name: 'Bodyweight Air Squat',
    category: 'Squat',
    muscleGroup: 'Quads & Glutes',
    targetAnatomy: 'Quadriceps, Gluteus Maximus & Hip Mobility',
    synergists: 'Adductors, Hamstrings, Core',
    movementPlane: 'Bilateral Bodyweight Squat',
    cues: [
      'Stand feet shoulder-width, toes angled 15 degrees out.',
      'Squat down until hips dip below knee crease.',
      'Drive upwards through heels to full standing lockout.'
    ]
  },
  {
    name: 'Dumbbell Romanian Deadlift',
    category: 'Hinge',
    muscleGroup: 'Hamstrings & Glutes',
    targetAnatomy: 'Hamstrings (Biceps Femoris) & Gluteus Maximus',
    synergists: 'Erector Spinae, Forearm Grip',
    movementPlane: 'Standing Dumbbell Hip Hinge',
    cues: [
      'Hold dumbbells in front of thighs with soft knees.',
      'Push hips straight backward until weights pass knee height.',
      'Drive hips forward to return to standing, squeezing glutes.'
    ]
  },
  {
    name: 'Stiff-Legged Deadlift',
    category: 'Hinge',
    muscleGroup: 'Hamstrings (Deep Stretch)',
    targetAnatomy: 'Hamstrings (Proximal Tendon & Muscle Belly)',
    synergists: 'Erector Spinae, Gluteus Maximus',
    movementPlane: 'Nearly-Straight Leg Hip Hinge',
    cues: [
      'Keep knees nearly locked with minimal knee bend throughout.',
      'Hinge at hips, lowering bar along shins until maximum stretch.',
      'Contract hamstrings to stand tall.'
    ]
  },
  {
    name: 'Dumbbell Hip Thrust',
    category: 'Hinge',
    muscleGroup: 'Glutes (Maximus)',
    targetAnatomy: 'Gluteus Maximus (Peak Contraction & Shortened Position)',
    synergists: 'Hamstrings, Adductors',
    movementPlane: 'Horizontal Hip Extension from Bench',
    cues: [
      'Rest upper back on bench, place heavy dumbbell across hips.',
      'Drive through heels to bridge hips up until thighs align with torso.',
      'Hold 1 second squeeze at top, chin tucked forward.'
    ]
  },
  {
    name: 'Single-Leg Hip Thrust',
    category: 'Hinge',
    muscleGroup: 'Glutes & Stability',
    targetAnatomy: 'Gluteus Maximus & Gluteus Medius (Unilateral Balance)',
    synergists: 'Hamstrings, Core Stabilizers',
    movementPlane: 'Unilateral Horizontal Hip Extension',
    cues: [
      'Lift one leg off ground with knee bent at 90 degrees.',
      'Drive working heel into floor to lift hips fully.',
      'Squeeze glute at top; avoid hip tilting.'
    ]
  },
  {
    name: 'Cable Glute Kickback',
    category: 'Hinge',
    muscleGroup: 'Glutes (Isolation)',
    targetAnatomy: 'Gluteus Maximus (Upper Fibers & Shelf)',
    synergists: 'Hamstrings, Core',
    movementPlane: 'Hip Extension in Sagittal Plane',
    cues: [
      'Attach ankle cuff to low cable pulley.',
      'Kick leg backward and slightly upward in a smooth arc.',
      'Squeeze glute hard for 1 second at top; return under control.'
    ]
  },
  {
    name: 'Hyperextension / Back Extension',
    category: 'Hinge',
    muscleGroup: 'Hamstrings & Lower Back',
    targetAnatomy: 'Hamstrings, Gluteus Maximus & Erector Spinae',
    synergists: 'Latissimus Dorsi',
    movementPlane: '45° Bench Hip Extension',
    cues: [
      'Set pad just below hip crease for hamstring/glute focus.',
      'Hinge forward at hips with flat back, then raise torso in line with legs.',
      'Squeeze glutes at top without hyperextending lumbar.'
    ]
  },
  {
    name: 'Seated Leg Curl',
    category: 'Hinge',
    muscleGroup: 'Hamstrings (Lengthened)',
    targetAnatomy: 'Hamstrings (Semitendinosus, Semimembranosus, Biceps Femoris)',
    synergists: 'Gastrocnemius, Gracilis',
    movementPlane: 'Seated Open-Chain Knee Flexion',
    cues: [
      'Adjust back pad so knees align with machine pivot axis.',
      'Curl heels under smoothly as far as possible.',
      'Control the return to full knee extension for 2-3 seconds.'
    ]
  },
  {
    name: 'Nordic Hamstring Curl',
    category: 'Hinge',
    muscleGroup: 'Hamstrings (Eccentric Power)',
    targetAnatomy: 'Hamstrings (Biceps Femoris Eccentric Overload)',
    synergists: 'Gastrocnemius, Glutes, Core',
    movementPlane: 'Bodyweight Kneeling Knee Extension Control',
    cues: [
      'Kneel with ankles anchored under sturdy pad or partner.',
      'Lower torso forward as slowly as possible using hamstrings.',
      'Catch yourself with hands and push back up.'
    ]
  },
  {
    name: 'Good Mornings',
    category: 'Hinge',
    muscleGroup: 'Hamstrings & Spinal Erectors',
    targetAnatomy: 'Hamstrings, Erector Spinae & Gluteus Maximus',
    synergists: 'Adductor Magnus, Core',
    movementPlane: 'Standing Barbell Hip Hinge',
    cues: [
      'Hold barbell securely across upper traps.',
      'Hinge hips backward with flat back until torso is 15° above parallel.',
      'Drive hips forward to stand up tall.'
    ]
  },
  {
    name: 'Seated Dumbbell Shoulder Press',
    category: 'Shoulders',
    muscleGroup: 'Shoulders (Anterior & Medial)',
    targetAnatomy: 'Anterior Deltoids & Lateral Deltoids',
    synergists: 'Triceps Brachii, Upper Trapezius',
    movementPlane: 'Seated Overhead Dumbbell Press',
    cues: [
      'Sit on upright bench with dumbbells at shoulder height.',
      'Press dumbbells overhead in a slight inward arc.',
      'Lower under control until upper arms are parallel to floor.'
    ]
  },
  {
    name: 'Arnold Press',
    category: 'Shoulders',
    muscleGroup: 'Shoulders (3D Rotational)',
    targetAnatomy: 'Anterior Deltoid, Lateral Deltoid & Rotator Cuff',
    synergists: 'Triceps Brachii, Serratus Anterior',
    movementPlane: 'Rotational Overhead Press',
    cues: [
      'Start with dumbbells in front of chest, palms facing your face.',
      'Rotate wrists outward as you press overhead, finishing with palms forward.',
      'Reverse motion smoothly on descent.'
    ]
  },
  {
    name: 'Cable Lateral Raise',
    category: 'Shoulders',
    muscleGroup: 'Shoulders (Side Delts · Constant Tension)',
    targetAnatomy: 'Lateral Deltoids (Continuous Resistance Curve)',
    synergists: 'Supraspinatus, Trapezius',
    movementPlane: 'Coronal Plane Abduction',
    cues: [
      'Set low pulley. Stand side-on holding handle with outer hand.',
      'Raise arm out to the side until parallel to floor.',
      'Pause 1 second, then control weight down without resting.'
    ]
  },
  {
    name: 'Behind-the-Back Cable Lateral Raise',
    category: 'Shoulders',
    muscleGroup: 'Shoulders (Side Delts)',
    targetAnatomy: 'Lateral Deltoid (Maximum Stretch at Initiation)',
    synergists: 'Supraspinatus',
    movementPlane: 'Behind-Torso Cable Abduction',
    cues: [
      'Set low cable behind back, grip handle with working hand.',
      'Raise arm out and slightly forward in the scapular plane.',
      'Lower under control behind torso to full medial delt stretch.'
    ]
  },
  {
    name: 'Reverse Pec Deck Fly',
    category: 'Shoulders',
    muscleGroup: 'Shoulders (Rear Delts)',
    targetAnatomy: 'Posterior Deltoids, Rhomboids & Infraspinatus',
    synergists: 'Middle Trapezius, Teres Minor',
    movementPlane: 'Transverse Horizontal Abduction',
    cues: [
      'Sit facing machine pad with chest supported.',
      'Pull handles back in a wide arc leading with elbows.',
      'Squeeze rear deltoids hard at full retraction.'
    ]
  },
  {
    name: 'Bent-Over Dumbbell Rear Delt Fly',
    category: 'Shoulders',
    muscleGroup: 'Shoulders (Rear Delts)',
    targetAnatomy: 'Posterior Deltoids & Rhomboids',
    synergists: 'Infraspinatus, Mid Traps',
    movementPlane: 'Prone Horizontal Abduction',
    cues: [
      'Hinge at hips until torso is nearly parallel to floor.',
      'Raise dumbbells out to sides with slight elbow bend.',
      'Focus on rear delt contraction; avoid excessive trap shrugging.'
    ]
  },
  {
    name: 'Incline Dumbbell Curl',
    category: 'Arms',
    muscleGroup: 'Biceps (Long Head Stretch)',
    targetAnatomy: 'Biceps Brachii (Long Head · Bicep Peak Stretch)',
    synergists: 'Brachialis, Anterior Deltoid',
    movementPlane: 'Incline Supinated Elbow Flexion',
    cues: [
      'Set bench to 45-60 degrees. Let arms hang straight down behind torso.',
      'Curl dumbbells up while keeping upper arms pinned in place.',
      'Lower slowly to feel a deep stretch in the long head.'
    ]
  },
  {
    name: 'Preacher Curl',
    category: 'Arms',
    muscleGroup: 'Biceps (Short Head)',
    targetAnatomy: 'Biceps Brachii (Short Head · Inner Mass)',
    synergists: 'Brachialis, Brachioradialis',
    movementPlane: 'Preacher Bench Isolated Elbow Flexion',
    cues: [
      'Rest upper arms flat against preacher pad, armpits over top edge.',
      'Curl EZ bar or dumbbells up towards face.',
      'Lower under control to 95% extension; avoid hyper-extending elbows.'
    ]
  },
  {
    name: 'Concentration Curl',
    category: 'Arms',
    muscleGroup: 'Biceps (Peak Squeeze)',
    targetAnatomy: 'Biceps Brachii (Peak Contraction & Shortened Position)',
    synergists: 'Brachialis',
    movementPlane: 'Seated Braced Unilateral Curl',
    cues: [
      'Sit on bench, brace tricep against inner thigh.',
      'Curl dumbbell towards face with complete isolation.',
      'Squeeze bicep peak for 1 second at top.'
    ]
  },
  {
    name: 'Cable Bicep Curl',
    category: 'Arms',
    muscleGroup: 'Biceps (Constant Tension)',
    targetAnatomy: 'Biceps Brachii (Short & Long Heads)',
    synergists: 'Brachialis, Forearms',
    movementPlane: 'Low-Pulley Supinated Curl',
    cues: [
      'Attach straight or EZ bar to low pulley.',
      'Curl bar to upper chest, pinning elbows to sides.',
      'Lower with continuous resistance through full range.'
    ]
  },
  {
    name: 'Straight-Bar Cable Pushdown',
    category: 'Arms',
    muscleGroup: 'Triceps (Lateral & Medial)',
    targetAnatomy: 'Triceps Brachii (Lateral Head & Medial Head Overload)',
    synergists: 'Anconeus',
    movementPlane: 'Pronated Cable Elbow Extension',
    cues: [
      'Grip straight bar with overhand grip, elbows at sides.',
      'Push bar down to full extension, locking out triceps.',
      'Control return to 90 degrees without letting elbows drift forward.'
    ]
  },
  {
    name: 'Single-Arm Cable Tricep Extension',
    category: 'Arms',
    muscleGroup: 'Triceps (Isolation)',
    targetAnatomy: 'Triceps Brachii (Lateral & Long Heads)',
    synergists: 'Anconeus',
    movementPlane: 'Unilateral Cable Elbow Extension',
    cues: [
      'Hold bare cable ball or single D-handle at shoulder height.',
      'Extend arm straight down, squeezing tricep at lockout.',
      'Control the return without body momentum.'
    ]
  },
  {
    name: 'Dips (Triceps Focus)',
    category: 'Arms',
    muscleGroup: 'Triceps (Overall Mass)',
    targetAnatomy: 'Triceps Brachii (All 3 Heads)',
    synergists: 'Anterior Deltoids, Clavicular Pectoralis',
    movementPlane: 'Upright Parallel Bar Dip',
    cues: [
      'Keep torso upright and elbows tucked close to body.',
      'Lower until elbows are at 90 degrees.',
      'Press upward powerfully, squeezing triceps at top.'
    ]
  },
  {
    name: 'Standing Barbell Calf Raise',
    category: 'Calves',
    muscleGroup: 'Calves (Gastrocnemius)',
    targetAnatomy: 'Gastrocnemius (Lateral & Medial Heads · Diamond Shape)',
    synergists: 'Soleus, Plantaris',
    movementPlane: 'Plantarflexion under Axial Barbell Load',
    cues: [
      'Place balls of feet on calf block with barbell across traps.',
      'Lower heels as low as possible for deep calf stretch.',
      'Drive onto balls of feet and pause 1 second at peak contraction.'
    ]
  },
  {
    name: 'Standing Dumbbell Calf Raise',
    category: 'Calves',
    muscleGroup: 'Calves (Gastrocnemius)',
    targetAnatomy: 'Gastrocnemius & Soleus',
    synergists: 'Plantaris, Forearm Grip',
    movementPlane: 'Dumbbell-Loaded Plantarflexion',
    cues: [
      'Hold dumbbells at sides with balls of feet on elevated edge.',
      'Sink heels down for full 2-second stretch.',
      'Explode upward onto big toes and hold peak squeeze.'
    ]
  },
  {
    name: 'Leg Press Calf Press',
    category: 'Calves',
    muscleGroup: 'Calves (Gastrocnemius)',
    targetAnatomy: 'Gastrocnemius (Heavy Machine Overload)',
    synergists: 'Soleus',
    movementPlane: 'Incline Machine Plantarflexion',
    cues: [
      'Place balls of feet on lower edge of leg press carriage with knees soft.',
      'Let carriage sink back for deep calf stretch.',
      'Press sled forward using calf extension only; never lock knees.'
    ]
  },
  {
    name: 'Hanging Leg Raise',
    category: 'Core',
    muscleGroup: 'Abs (Lower Rectus)',
    targetAnatomy: 'Rectus Abdominis (Lower & Mid Fibers)',
    synergists: 'Iliopsoas, Obliques, Forearm Grip',
    movementPlane: 'Straight-Leg Hanging Pelvic Tilt',
    cues: [
      'Hang from bar with straight legs.',
      'Raise straight legs until parallel to floor or higher.',
      'Control descent slowly without swinging.'
    ]
  },
  {
    name: 'Cable Crunch',
    category: 'Core',
    muscleGroup: 'Abs (Upper & Mid)',
    targetAnatomy: 'Rectus Abdominis (Upper Fibers & Thickness)',
    synergists: 'Obliques',
    movementPlane: 'Kneeling Loaded Spinal Flexion',
    cues: [
      'Kneel holding rope attachment next to ears.',
      'Crunch down, curling elbows toward knees by flexing spine.',
      'Do not sit back on heels; keep hips high and stationary.'
    ]
  },
  {
    name: 'Side Plank',
    category: 'Core',
    muscleGroup: 'Core (Obliques)',
    targetAnatomy: 'Internal & External Obliques, Quadratus Lumborum',
    synergists: 'Gluteus Medius, Deltoids',
    movementPlane: 'Isometric Lateral Anti-Lateral Flexion',
    cues: [
      'Lie on side, propping upper body on elbow directly below shoulder.',
      'Lift hips until body forms a straight line from ankles to shoulders.',
      'Hold position, engaging lower obliques and glutes.'
    ]
  },
  {
    name: 'Cable Woodchoppers',
    category: 'Core',
    muscleGroup: 'Core (Rotational Power)',
    targetAnatomy: 'Internal & External Obliques & Transverse Abdominis',
    synergists: 'Deltoids, Glutes',
    movementPlane: 'High-to-Low or Low-to-High Diagonal Rotation',
    cues: [
      'Grip cable handle with both hands, arms extended.',
      'Rotate torso across body, pivoting on rear foot.',
      'Control the return against cable resistance.'
    ]
  },
  {
    name: 'Bird Dog',
    category: 'Core',
    muscleGroup: 'Core (Posterior Prehab)',
    targetAnatomy: 'Erector Spinae, Multifidus & Gluteus Maximus',
    synergists: 'Shoulder Stabilizers, Hamstrings',
    movementPlane: 'Quadruped Cross-Body Extension',
    cues: [
      'Start on hands and knees with neutral spine.',
      'Extend right arm forward and left leg backward simultaneously.',
      'Hold 2 seconds, maintaining level hips without arching lower back.'
    ]
  },
  {
    name: 'Dead Bug',
    category: 'Core',
    muscleGroup: 'Core (Deep Transverse)',
    targetAnatomy: 'Transverse Abdominis & Pelvic Floor Stabilizers',
    synergists: 'Rectus Abdominis, Hip Flexors',
    movementPlane: 'Supine Anti-Extension Cross-Body Pattern',
    cues: [
      'Lie on back with knees at 90 degrees and arms pointing to ceiling.',
      'Flatten lower back firmly against floor.',
      'Lower opposite arm and leg slowly toward floor without letting lower back lift.'
    ]
  },
  {
    name: 'Mountain Climbers',
    category: 'Core',
    muscleGroup: 'Core & Conditioning',
    targetAnatomy: 'Rectus Abdominis, Hip Flexors & Cardiovascular Density',
    synergists: 'Anterior Deltoids, Quadriceps, Calves',
    movementPlane: 'Dynamic Alternating Prone Knee Drives',
    cues: [
      'Start in high push-up plank position.',
      'Drive one knee toward chest, then quickly switch legs.',
      'Maintain flat hips and tight core bracing throughout.'
    ]
  }
];

// ===== WORKOUT TEMPLATE OPTIONS (17 Splits) =====
const WORKOUT_SPLITS = [
  {
    name: 'Push Day (PPL)',
    description: 'Barbell Bench Press, Incline DB Press, Shoulder Press, Lateral Raise, Tricep Pushdown',
    exercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Hammer Strength Shoulder Press', 'Dumbbell Lateral Raise', 'Tricep Rope Pushdown']
  },
  {
    name: 'Pull Day (PPL)',
    description: 'Barbell Deadlift, Pull-up, Barbell Row, Seated Cable Row, Face Pull, Hammer Curl',
    exercises: ['Barbell Deadlift', 'Pull-up', 'Barbell Row', 'Seated Cable Row', 'Face Pull', 'Hammer Curl']
  },
  {
    name: 'Legs Day (PPL)',
    description: 'Barbell Back Squat, Romanian Deadlift, Leg Press, Lying Leg Curl, Standing Calf Raise',
    exercises: ['Barbell Back Squat', 'Romanian Deadlift', 'Leg Press', 'Lying Leg Curl', 'Standing Calf Raise']
  },
  {
    name: 'Arnold Split (Chest & Back)',
    description: 'Barbell Bench Press, Pull-up, Incline DB Press, Barbell Row, Cable Crossover',
    exercises: ['Barbell Bench Press', 'Pull-up', 'Incline Dumbbell Press', 'Barbell Row', 'Cable Crossover']
  },
  {
    name: 'Arnold Split (Shoulders & Arms)',
    description: 'Overhead Barbell Press, Dumbbell Lateral Raise, DB Bicep Curl, Tricep Pushdown, Hammer Curl',
    exercises: ['Overhead Barbell Press', 'Dumbbell Lateral Raise', 'Dumbbell Bicep Curl', 'Tricep Rope Pushdown', 'Hammer Curl']
  },
  {
    name: 'Arnold Split (Legs & Lower)',
    description: 'Barbell Back Squat, Romanian Deadlift, Bulgarian Split Squat, Leg Curl, Standing Calf Raise',
    exercises: ['Barbell Back Squat', 'Romanian Deadlift', 'Bulgarian Split Squat', 'Lying Leg Curl', 'Standing Calf Raise']
  },
  {
    name: 'Upper Body A',
    description: 'Barbell Bench Press, Barbell Row, Overhead Barbell Press, Lat Pulldown, DB Bicep Curl',
    exercises: ['Barbell Bench Press', 'Barbell Row', 'Overhead Barbell Press', 'Lat Pulldown', 'Dumbbell Bicep Curl']
  },
  {
    name: 'Upper Body B',
    description: 'Incline DB Press, Seated Cable Row, DB Bench Press, Face Pull, Hammer Curl, Overhead Tricep Extension',
    exercises: ['Incline Dumbbell Press', 'Seated Cable Row', 'Dumbbell Bench Press', 'Face Pull', 'Hammer Curl', 'Overhead Dumbbell Extension']
  },
  {
    name: 'Lower Body A',
    description: 'Barbell Back Squat, Romanian Deadlift, Leg Press, Lying Leg Curl, Standing Calf Raise',
    exercises: ['Barbell Back Squat', 'Romanian Deadlift', 'Leg Press', 'Lying Leg Curl', 'Standing Calf Raise']
  },
  {
    name: 'Lower Body B',
    description: 'Barbell Deadlift, Bulgarian Split Squat, Leg Extension, Lying Leg Curl, Hanging Knee Raise',
    exercises: ['Barbell Deadlift', 'Bulgarian Split Squat', 'Leg Extension', 'Lying Leg Curl', 'Hanging Knee Raise']
  },
  {
    name: 'Torso Hypertrophy',
    description: 'Barbell Bench Press, Incline DB Press, Barbell Row, Lat Pulldown, Cable Fly, Face Pull',
    exercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Barbell Row', 'Lat Pulldown', 'Cable Chest Fly', 'Face Pull']
  },
  {
    name: 'Limbs Hypertrophy',
    description: 'Barbell Back Squat, Romanian Deadlift, DB Bicep Curl, Tricep Pushdown, Lateral Raise, Calf Raise',
    exercises: ['Barbell Back Squat', 'Romanian Deadlift', 'Dumbbell Bicep Curl', 'Tricep Rope Pushdown', 'Dumbbell Lateral Raise', 'Standing Calf Raise']
  },
  {
    name: 'Arms & Core Focus',
    description: 'Barbell Curl, Close-Grip Bench Press, Hammer Curl, Skull Crushers, Hanging Knee Raise, Plank',
    exercises: ['Barbell Curl', 'Close-Grip Bench Press', 'Hammer Curl', 'Skull Crushers', 'Hanging Knee Raise', 'Plank']
  },
  {
    name: 'Powerlifting Squat Day',
    description: 'Barbell Back Squat, Leg Press, Romanian Deadlift, Hanging Knee Raise',
    exercises: ['Barbell Back Squat', 'Leg Press', 'Romanian Deadlift', 'Hanging Knee Raise']
  },
  {
    name: 'Powerlifting Bench Day',
    description: 'Barbell Bench Press, Incline Barbell Press, Close-Grip Bench Press, Barbell Row',
    exercises: ['Barbell Bench Press', 'Incline Barbell Bench Press', 'Close-Grip Bench Press', 'Barbell Row']
  },
  {
    name: 'Powerlifting Deadlift Day',
    description: 'Barbell Deadlift, Barbell Back Squat, Barbell Row, Face Pull',
    exercises: ['Barbell Deadlift', 'Barbell Back Squat', 'Barbell Row', 'Face Pull']
  },
  {
    name: 'Full Body Split',
    description: 'Barbell Back Squat, Barbell Bench Press, Barbell Row, Overhead Barbell Press, DB Bicep Curl',
    exercises: ['Barbell Back Squat', 'Barbell Bench Press', 'Barbell Row', 'Overhead Barbell Press', 'Dumbbell Bicep Curl']
  }
];

// ===== SPLIT CATEGORY METADATA =====
const SPLIT_CATEGORIES = {
  'Push Day (PPL)':             { color: 'var(--brand-primary-light)', label: 'Push / Pull / Legs' },
  'Pull Day (PPL)':             { color: '#38BDF8', label: 'Push / Pull / Legs' },
  'Legs Day (PPL)':             { color: '#10B981', label: 'Push / Pull / Legs' },
  'Arnold Split (Chest & Back)':   { color: '#818CF8', label: 'Arnold Split' },
  'Arnold Split (Shoulders & Arms)':{ color: '#818CF8', label: 'Arnold Split' },
  'Arnold Split (Legs & Lower)':   { color: '#10B981', label: 'Arnold Split' },
  'Upper Body A':               { color: '#818CF8', label: 'Upper / Lower' },
  'Upper Body B':               { color: '#818CF8', label: 'Upper / Lower' },
  'Lower Body A':               { color: '#10B981', label: 'Upper / Lower' },
  'Lower Body B':               { color: '#10B981', label: 'Upper / Lower' },
  'Torso Hypertrophy':          { color: '#FB923C', label: 'Hypertrophy Split' },
  'Limbs Hypertrophy':          { color: '#FB923C', label: 'Hypertrophy Split' },
  'Arms & Core Focus':          { color: 'var(--brand-primary-light)', label: 'Accessory & Core' },
  'Powerlifting Squat Day':     { color: '#F87171', label: 'Powerlifting' },
  'Powerlifting Bench Day':     { color: '#F87171', label: 'Powerlifting' },
  'Powerlifting Deadlift Day':  { color: '#F87171', label: 'Powerlifting' },
  'Full Body Split':            { color: '#38BDF8', label: 'Full Body' },
};

const ROUTINE_SPLITS = WORKOUT_SPLITS;

const PR_PATTERNS = [
  { key: 'squat', label: 'Squat (1RM)' },
  { key: 'bench', label: 'Bench Press (1RM)' },
  { key: 'deadlift', label: 'Deadlift (1RM)' },
  { key: 'press', label: 'Overhead Press (1RM)' }
];

const MOTIVATIONAL_PR_QUOTES = [
  "Unstoppable! Every single kilo is proof of your hard work and discipline.",
  "New strength unlocked! You're operating on a whole new level today.",
  "Crushed it! Champions are built one personal record at a time.",
  "Pure power! That weight didn't stand a chance.",
  "Look at that progress! Your consistency is truly paying off."
];

function formatCleanAnatomy(text) {
  if (!text) return 'Full Body';
  return text
    .replace(/Pectoralis Major \(Clavicular Head · Upper Chest\)/gi, 'Upper Chest')
    .replace(/Pectoralis Major \(Sternal & Mid-Costal Head · Mid Chest\)/gi, 'Mid Chest')
    .replace(/Pectoralis Major \(Sternal Fibers · Mid Chest\)/gi, 'Mid Chest')
    .replace(/Pectoralis Major/gi, 'Chest')
    .replace(/Quadriceps \(Rectus Femoris, Vastus Lateralis\/Medialis\) & Gluteus Maximus/gi, 'Front Thighs (Quads) & Glutes')
    .replace(/Quadriceps \(Rectus Femoris, Vastus Lateralis\/Medialis\)/gi, 'Front Thighs (Quads)')
    .replace(/Quadriceps/gi, 'Quads')
    .replace(/Latissimus Dorsi/gi, 'Lats (Back)')
    .replace(/Trapezius/gi, 'Upper Back & Traps')
    .replace(/Posterior Chain \(Erector Spinae, Gluteus Maximus, Hamstrings\)/gi, 'Lower Back, Glutes & Hamstrings')
    .replace(/Posterior Chain/gi, 'Glutes & Hamstrings')
    .replace(/Biceps Femoris/gi, 'Hamstrings')
    .replace(/Gluteus Maximus/gi, 'Glutes')
    .replace(/Anterior Deltoids/gi, 'Front Shoulders')
    .replace(/Lateral Deltoids/gi, 'Side Shoulders')
    .replace(/Posterior Deltoids/gi, 'Rear Shoulders')
    .replace(/Triceps Brachii/gi, 'Triceps')
    .replace(/Biceps Brachii/gi, 'Biceps')
    .replace(/Transverse Abdominis/gi, 'Abs & Core')
    .replace(/Gastrocnemius/gi, 'Calves')
    .replace(/Soleus/gi, 'Calves')
    .replace(/[·•]/g, '·')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatCleanSplitName(name) {
  if (!name) return 'Muscle Building Plan';
  let cleaned = name.replace(/\(Variant\s+[A-Z]\)/gi, '').trim();
  if (cleaned.includes('Chest-Triceps') || cleaned.includes('Back-Biceps') || cleaned.includes('Shoulders-Abs')) {
    return '5-Day Body-Part Split';
  }
  if (cleaned.includes('Push / Pull / Legs') || cleaned.includes('PPL')) {
    return 'Push / Pull / Legs Routine';
  }
  if (cleaned.includes('Upper / Lower') || cleaned.includes('Upper Body')) {
    return 'Upper / Lower Split';
  }
  if (cleaned.includes('Full Body')) {
    return 'Full Body Routine';
  }
  return cleaned;
}

export default function ExerciseTracker({ user, setCurrentPage, onSessionStateChange }) {
  // Navigation & View Modes
  const [isConsoleMode, setIsConsoleMode] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [programView, setProgramView] = useState('hub'); // 'hub' | 'program'
  const [activeTab, setActiveTab] = useState('console'); // 'console' | 'heatmap' | 'prs' | 'history'

  // Responsive Viewport Breakpoint Detection (Stop rendering desktop tables on mobile)
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  // Data persistence
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [generatedProgram, setGeneratedProgram] = useState(null);
  const [selectedPrLift, setSelectedPrLift] = useState('bench');

  // Active workout console states
  const [workoutName, setWorkoutName] = useState('Push Day');
  const [activeExercises, setActiveExercises] = useState([]);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [activeDrawer, setActiveDrawer] = useState(null); // null | 'anatomy' | 'warmup' | 'plates' | 'cues' | 'swap'
  const [openRpePicker, setOpenRpePicker] = useState(null); // { exIdx, setIdx }
  const [showConsoleOverflow, setShowConsoleOverflow] = useState(false);

  // Rest Timer States
  const [restRemaining, setRestRemaining] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const timerRef = useRef(null);

  // Active Duration Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const elapsedTimerRef = useRef(null);
  const carouselTrackRef = useRef(null);

  // Streak & Shield
  const [streak, setStreak] = useState(0);
  const [streakShield, setStreakShield] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modals & Drawers
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [intakeStep, setIntakeStep] = useState(0); // 0 | 1 | 2
  const [intakeForm, setIntakeForm] = useState({
    trainingGoal: user?.trainingGoal || 'hypertrophy',
    trainingExperience: user?.trainingExperience || 'beginner',
    equipment: user?.equipment || 'full_gym',
    trainingInjuries: user?.trainingInjuries || [],
    sessionTime: user?.sessionTime || 60,
  });

  // Completed Session Summary Celebration Modal
  const [completedSummary, setCompletedSummary] = useState(null); // { name, duration, totalVolume, totalSets, prList }
  const [prCelebration, setPrCelebration] = useState(null); // { exercise, weight, reps, delta, est1RM, quote }

  // Program Mesocycle Viewer States
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState(0);
  const [weekDropdownOpen, setWeekDropdownOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [showExerciseSearchModal, setShowExerciseSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState('all');

  // Smart Trainer & Exercise Switcher States
  const [smartAltTarget, setSmartAltTarget] = useState(null); // { ex, weekIdx, dayIdx, exIdx, isConsole }
  const [smartAltSearch, setSmartAltSearch] = useState('');
  const [variantSeed, setVariantSeed] = useState(0);

  const activeUserId = user?.id || 'demo';
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Body scroll lock effect whenever any modal is open
  useEffect(() => {
    if (showIntakeModal || showCancelConfirm || completedSummary || previewTemplate || prCelebration || showExerciseSearchModal || smartAltTarget) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showIntakeModal, showCancelConfirm, completedSummary, previewTemplate, prCelebration, showExerciseSearchModal, smartAltTarget]);

  // Close RPE picker on outside click
  useEffect(() => {
    const handleGlobalClick = () => setOpenRpePicker(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Update viewport mode dynamically on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll active exercise chip into view in mobile carousel
  useEffect(() => {
    if (carouselTrackRef.current && carouselTrackRef.current.children[currentExIndex]) {
      carouselTrackRef.current.children[currentExIndex].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [currentExIndex]);

  // Load training profile, generated program, active session, and history on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem(`nutribuddy_training_profile_${activeUserId}`);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setIntakeForm(prev => ({ ...prev, ...parsed }));
      } catch (e) {}
    }

    const savedProgram = localStorage.getItem(`nutribuddy_program_${activeUserId}`);
    if (savedProgram) {
      try {
        const prog = JSON.parse(savedProgram);
        setGeneratedProgram(prog);
      } catch (e) {}
    }

    const savedHistory = localStorage.getItem(`nutribuddy_workout_history_${activeUserId}`);
    if (savedHistory) {
      try {
        const hist = JSON.parse(savedHistory);
        if (Array.isArray(hist)) setWorkoutHistory(hist);
      } catch (e) {}
    }

    const savedShield = localStorage.getItem(`nutribuddy_shield_${activeUserId}`);
    if (savedShield !== null) setStreakShield(savedShield === 'true');

    // Calculate streak from history
    if (savedHistory) {
      try {
        const hist = JSON.parse(savedHistory);
        setStreak(hist.length > 0 ? Math.min(hist.length, 7) : 0);
      } catch (e) {}
    }

    // Auto-restore active workout if refreshed mid-session within the last 6 hours
    const savedActive = localStorage.getItem(`nutribuddy_active_workout_${activeUserId}`);
    if (savedActive) {
      try {
        const parsed = JSON.parse(savedActive);
        if (parsed && (parsed.isSessionActive || parsed.isConsoleMode) && parsed.activeExercises?.length && (Date.now() - (parsed.timestamp || 0) < 6 * 3600 * 1000)) {
          setWorkoutName(parsed.workoutName || 'Push Day');
          setActiveExercises(parsed.activeExercises);
          setCurrentExIndex(parsed.currentExIndex || 0);
          setElapsedSeconds(parsed.elapsedSeconds || 0);
          setIsSessionActive(true);
          setIsConsoleMode(parsed.isConsoleMode !== undefined ? parsed.isConsoleMode : true);
        }
      } catch (e) {}
    }
  }, [activeUserId]);

  // Auto-persist active workout session on any state change
  useEffect(() => {
    if (isSessionActive && activeExercises.length > 0) {
      const payload = {
        isSessionActive: true,
        isConsoleMode,
        workoutName,
        activeExercises,
        currentExIndex,
        elapsedSeconds,
        timestamp: Date.now()
      };
      localStorage.setItem(`nutribuddy_active_workout_${activeUserId}`, JSON.stringify(payload));
    } else if (!isSessionActive) {
      localStorage.removeItem(`nutribuddy_active_workout_${activeUserId}`);
    }
  }, [isSessionActive, isConsoleMode, workoutName, activeExercises, currentExIndex, elapsedSeconds, activeUserId]);

  // Notify parent of session state changes with full telemetry
  useEffect(() => {
    if (onSessionStateChange) {
      if (isSessionActive) {
        onSessionStateChange({
          isSessionActive: true,
          isInsideConsole: isConsoleMode,
          workoutName,
          elapsedSeconds,
          restActive,
          restRemaining,
          currentExerciseName: activeExercises[currentExIndex]?.name || '',
          completedSets: activeExercises.reduce((acc, ex) => acc + (ex.sets || []).filter(s => s.completed).length, 0),
          totalSets: activeExercises.reduce((acc, ex) => acc + (ex.sets || []).length, 0),
          onResume: () => {
            setIsConsoleMode(true);
            setProgramView('hub');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
      } else {
        onSessionStateChange(null);
      }
    }
  }, [isSessionActive, isConsoleMode, workoutName, elapsedSeconds, restActive, restRemaining, activeExercises, currentExIndex, onSessionStateChange]);

  // Elapsed Timer for active workout (continues running even if minimized)
  useEffect(() => {
    if (isSessionActive) {
      elapsedTimerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(elapsedTimerRef.current);
      setElapsedSeconds(0);
    }
    return () => clearInterval(elapsedTimerRef.current);
  }, [isSessionActive]);

  // Rest Countdown Timer
  useEffect(() => {
    if (restActive && restRemaining > 0) {
      timerRef.current = setInterval(() => {
        setRestRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setRestActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [restActive, restRemaining]);

  const showNotification = (type, msg) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const formatMMSS = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper to safely format previous sets
  const formatPreviousSet = (exerciseName, setIdx) => {
    for (const session of workoutHistory) {
      const ex = (session.exercises || []).find(e => e.name === exerciseName);
      if (ex && ex.sets && ex.sets[setIdx]) {
        const s = ex.sets[setIdx];
        if (s.weight && s.reps) {
          return `${s.weight} kg × ${s.reps}`;
        }
      }
    }
    return '—';
  };

  // Helper to retrieve last session log
  const retrieveLastLogForExercise = (exerciseName, setIndex) => {
    for (const session of workoutHistory) {
      const ex = (session.exercises || []).find(e => e.name === exerciseName);
      if (ex && ex.sets && ex.sets[setIndex]) {
        return ex.sets[setIndex];
      }
    }
    return null;
  };

  const createInitialSets = (exName) => {
    const sets = [];
    for (let i = 0; i < 4; i++) {
      const lastLog = retrieveLastLogForExercise(exName, i);
      sets.push({
        id: i + 1,
        weight: lastLog?.weight || '',
        reps: lastLog?.reps || '',
        rpe: lastLog?.rpe || '8',
        completed: false,
        isWarmup: false,
        notes: ''
      });
    }
    return sets;
  };

  const handleSelectSplit = (split) => {
    setWorkoutName(split.name);
    const exercises = split.exercises.map(name => {
      const dbEntry = PRESET_EXERCISES.find(p => p.name === name);
      return {
        ...(dbEntry || { name, category: 'General', muscleGroup: 'General', targetAnatomy: 'General Musculature', synergists: 'Supporting Muscles', movementPlane: 'Compound', cues: [] }),
        sets: createInitialSets(name)
      };
    });
    setActiveExercises(exercises);
    setCurrentExIndex(0);
    setActiveDrawer(null);
    setIsSessionActive(true);
    setIsConsoleMode(true);
    scrollToTop();
  };

  const handleStartGeneratedDay = (day) => {
    if (!day || !day.exercises || day.exercises.length === 0) return;
    setWorkoutName(day.dayName || day.sessionType);
    const exercises = day.exercises.map(ex => {
      const dbEntry = PRESET_EXERCISES.find(p => p.name === ex.name);
      const numSets = ex.sets || 3;
      const sets = [];
      for (let i = 0; i < numSets; i++) {
        const lastLog = retrieveLastLogForExercise(ex.name, i);
        sets.push({
          id: i + 1,
          weight: lastLog?.weight || '',
          reps: lastLog?.reps || '',
          rpe: (ex.rpeTarget || 8).toString(),
          completed: false,
          isWarmup: false,
          notes: ''
        });
      }
      return {
        ...(dbEntry || { name: ex.name, category: ex.category || 'General', muscleGroup: ex.muscleGroup || 'General', targetAnatomy: 'Target Musculature', synergists: 'Synergists', movementPlane: 'Compound', cues: [] }),
        ...ex,
        sets
      };
    });
    setActiveExercises(exercises);
    setCurrentExIndex(0);
    setActiveDrawer(null);
    setIsSessionActive(true);
    setIsConsoleMode(true);
    scrollToTop();
  };

  const handleUpdateSetField = (exIdx, setIdx, field, value) => {
    setActiveExercises(prev => {
      const updated = [...prev];
      if (updated[exIdx] && updated[exIdx].sets && updated[exIdx].sets[setIdx]) {
        updated[exIdx].sets[setIdx] = {
          ...updated[exIdx].sets[setIdx],
          [field]: value
        };
      }
      return updated;
    });
  };

  const getExerciseAllTimeBest = (exerciseName) => {
    const historyLogs = workoutHistory.flatMap(h => h.exercises || []).filter(e => e.name === exerciseName);
    let maxWeight = 0;
    let bestReps = 0;
    for (const e of historyLogs) {
      for (const s of (e.sets || [])) {
        const w = parseFloat(s.weight) || 0;
        const r = parseInt(s.reps, 10) || 0;
        if (w > maxWeight) {
          maxWeight = w;
          bestReps = r;
        }
      }
    }
    return { weight: maxWeight, reps: bestReps };
  };

  const handleCheckoffSet = (exIdx, setIdx) => {
    setActiveExercises(prev => {
      const updated = [...prev];
      if (updated[exIdx] && updated[exIdx].sets && updated[exIdx].sets[setIdx]) {
        const curr = updated[exIdx].sets[setIdx];
        const nextCompleted = !curr.completed;
        const currentEx = updated[exIdx];
        const w = parseFloat(curr.weight) || 0;
        const r = parseInt(curr.reps, 10) || 0;

        let isNewPR = false;
        if (nextCompleted && w > 0) {
          const prevBest = getExerciseAllTimeBest(currentEx.name);
          if (w > prevBest.weight) {
            isNewPR = true;
            const delta = prevBest.weight > 0 ? (w - prevBest.weight).toFixed(1) : null;
            const est1RM = Math.round(w * (1 + (r || 1) / 30));
            const quote = MOTIVATIONAL_PR_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_PR_QUOTES.length)];
            setPrCelebration({
              exercise: currentEx.name,
              weight: w,
              reps: r,
              delta,
              est1RM,
              quote
            });
          }
        }

        updated[exIdx].sets[setIdx] = {
          ...curr,
          completed: nextCompleted,
          isPR: isNewPR || curr.isPR
        };

        if (nextCompleted) {
          const targetRest = currentEx.restSec || 90;
          setRestRemaining(targetRest);
          setRestActive(true);
        }
      }
      return updated;
    });
  };

  const handleAddSet = (isWarmup = false) => {
    if (!activeExercises[currentExIndex]) return;
    const currentEx = activeExercises[currentExIndex];
    const nextId = currentEx.sets.length + 1;
    const newSet = {
      id: nextId,
      weight: '',
      reps: '',
      rpe: isWarmup ? '6' : '8',
      completed: false,
      isWarmup: isWarmup,
      notes: ''
    };
    const updated = [...activeExercises];
    updated[currentExIndex].sets = [...currentEx.sets, newSet];
    setActiveExercises(updated);
  };

  const handleRemoveSet = (setIdx) => {
    if (!activeExercises[currentExIndex]) return;
    const currentEx = activeExercises[currentExIndex];
    if (currentEx.sets.length <= 1) return;
    const updatedSets = currentEx.sets.filter((_, idx) => idx !== setIdx);
    const updated = [...activeExercises];
    updated[currentExIndex].sets = updatedSets;
    setActiveExercises(updated);
  };


  const handleFinishWorkout = () => {
    const completedSets = activeExercises.flatMap(ex => ex.sets || []).filter(s => s.completed);
    if (completedSets.length === 0) {
      if (!window.confirm('No completed sets logged in this session yet. Finish anyway?')) {
        return;
      }
    }

    let totalVolume = 0;
    let totalSetsCount = 0;
    const newPrsDetected = [];

    activeExercises.forEach(ex => {
      (ex.sets || []).forEach(s => {
        if (s.completed && s.weight && s.reps) {
          const w = parseFloat(s.weight) || 0;
          const r = parseInt(s.reps) || 0;
          totalVolume += (w * r);
          totalSetsCount += 1;
          if (checkIfWeightIsPR(ex.name, w)) {
            newPrsDetected.push({ exercise: ex.name, weight: w, reps: r });
          }
        }
      });
    });

    const sessionRecord = {
      id: Date.now().toString(),
      workoutName,
      duration: elapsedSeconds,
      timestamp: Date.now(),
      totalVolume,
      totalSets: totalSetsCount,
      exercises: activeExercises
    };

    const nextHistory = [sessionRecord, ...workoutHistory];
    setWorkoutHistory(nextHistory);
    localStorage.setItem(`nutribuddy_workout_history_${activeUserId}`, JSON.stringify(nextHistory));
    localStorage.removeItem(`nutribuddy_active_workout_${activeUserId}`);
    setStreak(prev => Math.min(prev + 1, 7));

    // Show celebration summary
    setCompletedSummary({
      name: workoutName,
      duration: elapsedSeconds,
      totalVolume,
      totalSets: totalSetsCount,
      newPrs: newPrsDetected
    });

    setIsSessionActive(false);
    setIsConsoleMode(false);
    showNotification('success', `Workout completed! ${totalSetsCount} sets logged (${Math.round(totalVolume)} kg total volume).`);
  };

  const handleToggleStreakShield = () => {
    const next = !streakShield;
    setStreakShield(next);
    localStorage.setItem(`nutribuddy_shield_${activeUserId}`, next.toString());
  };

  const toggleIntakeInjury = (injury) => {
    setIntakeForm(prev => {
      const list = prev.trainingInjuries || [];
      const exists = list.includes(injury);
      return {
        ...prev,
        trainingInjuries: exists ? list.filter(i => i !== injury) : [...list, injury]
      };
    });
  };

  const handleGenerateProgram = (seed = 0) => {
    const safeSeed = typeof seed === 'number' ? seed : (parseInt(seed, 10) || 0);
    try {
      const program = generateProgram({
        gender: user?.gender || 'male',
        age: user?.age || 25,
        profession: user?.profession || '',
        gymDays: user?.gymDays || 4,
        trainingExperience: intakeForm.trainingExperience || user?.trainingExperience || 'beginner',
        trainingGoal: intakeForm.trainingGoal || user?.trainingGoal || 'hypertrophy',
        equipment: intakeForm.equipment || user?.equipment || 'full_gym',
        injuries: intakeForm.trainingInjuries || user?.trainingInjuries || [],
        sessionTime: intakeForm.sessionTime || user?.sessionTime || 60,
      }, PRESET_EXERCISES, safeSeed);

      setGeneratedProgram(program);
      localStorage.setItem(`nutribuddy_program_${activeUserId}`, JSON.stringify(program));
      setShowIntakeModal(false);
      setProgramView('program');
      showNotification('success', `Personalized 4-week training mesocycle generated successfully (${program.trainerMatchScore?.overallScore || 98}% match)!`);
    } catch (e) {
      console.error('Error generating program:', e);
      showNotification('error', 'Could not generate program. Please try again.');
    }
  };

  const handleRegenerateProgram = () => {
    const nextSeed = (variantSeed || 0) + 1;
    setVariantSeed(nextSeed);
    handleGenerateProgram(nextSeed);
  };

  const handleSwitchExercise = (newEx, overrideTarget = null) => {
    const targetCtx = overrideTarget || smartAltTarget;
    if (!newEx) return;

    // Handle Active Workout Console Switch
    if (isConsoleMode || targetCtx?.isConsole) {
      const dbEntry = PRESET_EXERCISES.find(p => p.name === newEx.name) || newEx;
      setActiveExercises(prev => {
        const updated = [...prev];
        const curr = updated[currentExIndex];
        if (curr) {
          const oldName = curr.name;
          const numSets = (curr.sets && curr.sets.length > 0) ? curr.sets.length : 3;
          const newSets = [];
          for (let i = 0; i < numSets; i++) {
            const lastLog = retrieveLastLogForExercise(dbEntry.name, i);
            const prevSet = curr.sets && curr.sets[i];
            newSets.push({
              id: i + 1,
              weight: prevSet?.weight || lastLog?.weight || '',
              reps: prevSet?.reps || lastLog?.reps || '',
              rpe: prevSet?.rpe || '8',
              completed: prevSet?.completed || false,
              isWarmup: prevSet?.isWarmup || false,
              notes: prevSet?.notes || ''
            });
          }

          updated[currentExIndex] = {
            ...dbEntry,
            category: dbEntry.category || curr.category,
            muscleGroup: dbEntry.muscleGroup || curr.muscleGroup,
            targetAnatomy: dbEntry.targetAnatomy || curr.targetAnatomy,
            synergists: dbEntry.synergists || curr.synergists,
            movementPlane: dbEntry.movementPlane || curr.movementPlane,
            cues: dbEntry.cues || curr.cues || [],
            sets: newSets
          };
          showNotification('success', `Swapped ${oldName} → ${dbEntry.name}!`);
        }
        return updated;
      });
      setActiveDrawer(null);
      setSmartAltTarget(null);
      setSmartAltSearch('');
      return;
    }

    // Handle 4-Week Mesocycle Program Switch
    if (generatedProgram && targetCtx?.ex) {
      const oldName = targetCtx.ex.name;
      const dbEntry = PRESET_EXERCISES.find(p => p.name === newEx.name) || newEx;

      const updatedWeeks = generatedProgram.weeks.map((wk, wI) => {
        const updatedDays = (wk.days || []).map((dy, dI) => {
          const updatedExs = (dy.exercises || []).map((e, eI) => {
            // Swap if name matches or exact slot matches
            const isMatch = e.name === oldName || (wI === targetCtx.weekIdx && dI === targetCtx.dayIdx && eI === targetCtx.exIdx);
            if (isMatch) {
              return {
                ...e,
                ...dbEntry,
                name: dbEntry.name,
                category: dbEntry.category || e.category,
                muscleGroup: dbEntry.muscleGroup || e.muscleGroup,
                targetAnatomy: dbEntry.targetAnatomy || e.targetAnatomy,
                cues: dbEntry.cues || e.cues || [],
                tier: e.tier || 2,
                sets: e.sets || 3,
                repRange: e.repRange || '8-12',
                rpeTarget: e.rpeTarget || 8,
                restSec: e.restSec || 90
              };
            }
            return e;
          });
          return { ...dy, exercises: updatedExs };
        });
        return { ...wk, days: updatedDays };
      });

      const updatedProgram = {
        ...generatedProgram,
        weeks: updatedWeeks
      };

      setGeneratedProgram(updatedProgram);
      localStorage.setItem(`nutribuddy_program_${activeUserId}`, JSON.stringify(updatedProgram));
      showNotification('success', `Swapped ${oldName} → ${dbEntry.name} across your training schedule!`);
    }

    setSmartAltTarget(null);
    setSmartAltSearch('');
  };

  const checkIfWeightIsPR = (exName, weight) => {
    const num = parseFloat(weight);
    if (!num) return false;
    const historyLogs = workoutHistory.flatMap(h => h.exercises || []).filter(e => e.name === exName);
    const maxLogged = historyLogs.reduce((max, e) => {
      const exMax = Math.max(...(e.sets || []).map(s => parseFloat(s.weight) || 0), 0);
      return Math.max(max, exMax);
    }, 0);
    return num > maxLogged;
  };

  const currentActiveEx = activeExercises[currentExIndex];

  const activeExPR = (() => {
    if (!currentActiveEx) return null;
    const historyLogs = workoutHistory.flatMap(h => h.exercises || []).filter(e => e.name === currentActiveEx.name);
    let bestSet = null;
    let maxWeight = 0;
    for (const e of historyLogs) {
      for (const s of (e.sets || [])) {
        const w = parseFloat(s.weight) || 0;
        const r = parseInt(s.reps) || 0;
        if (w > maxWeight) {
          maxWeight = w;
          bestSet = { weight: w, reps: r };
        }
      }
    }
    return bestSet;
  })();

  const formatPrDate = (ts) => {
    if (!ts) return 'Recently';
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const prHallOfFame = (() => {
    const prs = {};
    for (const pattern of PR_PATTERNS) {
      const matching = workoutHistory.flatMap(h => h.exercises || []).filter(e => {
        const name = (e.name || '').toLowerCase();
        if (pattern.key === 'squat') return name.includes('squat');
        if (pattern.key === 'bench') return name.includes('bench');
        if (pattern.key === 'deadlift') return name.includes('deadlift');
        if (pattern.key === 'press') return name.includes('overhead') || name.includes('press');
        return false;
      });
      let maxPr = null;
      for (const ex of matching) {
        for (const s of ex.sets || []) {
          const w = parseFloat(s.weight) || 0;
          const r = parseInt(s.reps) || 0;
          if (w > 0 && r > 0) {
            if (!maxPr || w > maxPr.weight) {
              maxPr = { weight: w, reps: r, timestamp: ex.timestamp || Date.now() };
            }
          }
        }
      }
      if (maxPr) prs[pattern.key] = maxPr;
    }
    return prs;
  })();

  const volumePerGroup = (() => {
    const counts = {
      'Chest': 0,
      'Back': 0,
      'Quads': 0,
      'Hamstrings': 0,
      'Shoulders': 0,
      'Arms': 0,
      'Core': 0
    };
    for (const session of workoutHistory.slice(-7)) {
      for (const ex of session.exercises || []) {
        const entry = PRESET_EXERCISES.find(p => p.name === ex.name);
        const group = entry?.muscleGroup?.includes('Chest') ? 'Chest'
          : entry?.muscleGroup?.includes('Back') || entry?.muscleGroup?.includes('Lats') ? 'Back'
          : entry?.muscleGroup?.includes('Quad') ? 'Quads'
          : entry?.muscleGroup?.includes('Hamstring') || entry?.muscleGroup?.includes('Posterior') ? 'Hamstrings'
          : entry?.muscleGroup?.includes('Shoulder') ? 'Shoulders'
          : entry?.muscleGroup?.includes('Bicep') || entry?.muscleGroup?.includes('Tricep') || entry?.muscleGroup?.includes('Arm') ? 'Arms'
          : entry?.muscleGroup?.includes('Core') || entry?.muscleGroup?.includes('Abs') ? 'Core'
          : 'Back';
        const numSets = (ex.sets || []).filter(s => s.completed).length;
        if (counts[group] !== undefined) counts[group] += numSets;
        else counts['Back'] += numSets;
      }
    }
    return counts;
  })();

  const calculatePlates = (targetWeight) => {
    const bar = 20; // 20kg Olympic bar
    const target = parseFloat(targetWeight) || 0;
    if (target <= bar) return [];
    let rem = (target - bar) / 2;
    const available = [20, 10, 5, 2.5, 1.25];
    const plates = [];
    for (const p of available) {
      while (rem >= p) {
        plates.push(p);
        rem -= p;
      }
    }
    return plates;
  };

  return (
    <div className="exercise-tracker-page-container" style={{ maxWidth: 1200, margin: '0 auto', fontFamily: 'var(--font-body)', position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Toast Notification Banner */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 99999,
          padding: '14px 22px',
          borderRadius: 14,
          background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
          backdropFilter: 'blur(16px)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 13,
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'fadeIn 0.2s ease'
        }}>
          {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Exercise Search & Selection Modal (Zero-Scroll Portal) */}
      {showExerciseSearchModal && createPortal(
        <div className="app-modal-backdrop" onClick={() => setShowExerciseSearchModal(false)}>
          <div className="app-modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 740 }}>
            
            {/* Modal Header */}
            <div className="app-modal-header">
              <button 
                onClick={() => setShowExerciseSearchModal(false)}
                style={{
                  position: 'absolute', top: 16, right: 16, background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)', borderRadius: '50%', width: 30, height: 30,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                <X size={14} />
              </button>

              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--brand-primary-light)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={13} /> CERTIFIED EXERCISE DATABASE
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 2px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Search & Add Exercise
              </h2>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: 0 }}>
                Filter 80+ certified movements by muscle group and anatomical target
              </p>

              {/* Search Bar Input */}
              <div style={{ position: 'relative', marginTop: 14 }}>
                <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Type to filter: e.g. Bench, Squat, Glute, Curl, RDL, Lat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: 38, fontSize: 13, height: 40 }}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontWeight: 800 }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Muscle Group Quick Filter Chips */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '10px 0 2px' }}>
                {['all', 'Chest', 'Back', 'Quads', 'Glutes', 'Hamstrings', 'Shoulders', 'Arms', 'Core', 'Calves'].map(m => (
                  <button
                    key={m}
                    onClick={() => setSelectedMuscleFilter(m)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: selectedMuscleFilter === m ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                      background: selectedMuscleFilter === m ? 'var(--brand-primary-subtle)' : 'var(--bg-surface-raised)',
                      color: selectedMuscleFilter === m ? 'var(--brand-primary-light)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {m === 'all' ? 'All Muscles' : m}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Results List */}
            <div className="app-modal-body" style={{ maxHeight: '55vh', overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(() => {
                const results = PRESET_EXERCISES.filter(ex => {
                  if (selectedMuscleFilter !== 'all') {
                    const matchCategory = (ex.muscleGroup || '').toLowerCase().includes(selectedMuscleFilter.toLowerCase()) ||
                                          (ex.category || '').toLowerCase().includes(selectedMuscleFilter.toLowerCase()) ||
                                          (ex.targetAnatomy || '').toLowerCase().includes(selectedMuscleFilter.toLowerCase());
                    if (!matchCategory) return false;
                  }
                  if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase().trim();
                    const matchQ = (ex.name || '').toLowerCase().includes(q) ||
                                   (ex.muscleGroup || '').toLowerCase().includes(q) ||
                                   (ex.category || '').toLowerCase().includes(q) ||
                                   (ex.targetAnatomy || '').toLowerCase().includes(q);
                    if (!matchQ) return false;
                  }
                  return true;
                });

                if (results.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: 13 }}>
                      No exercises found matching your search. Try another query.
                    </div>
                  );
                }

                return results.map((ex, exIdx) => {
                  const isAlreadyInSession = activeExercises.some(a => a.name === ex.name);

                  return (
                    <div
                      key={exIdx}
                      style={{
                        padding: '14px 16px',
                        background: 'var(--bg-surface-raised)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-panel)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                            {ex.name}
                          </span>
                          <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: 'var(--brand-primary-subtle)', color: 'var(--brand-primary-light)' }}>
                            {ex.muscleGroup}
                          </span>
                        </div>
                        {ex.targetAnatomy && (
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                            Target: {ex.targetAnatomy}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setActiveExercises(prev => [...prev, {
                            ...ex,
                            sets: createInitialSets(ex.name)
                          }]);
                          setShowExerciseSearchModal(false);
                          showNotification('success', `Added ${ex.name} to active session!`);
                        }}
                        className={isAlreadyInSession ? "btn btn-secondary" : "btn btn-primary"}
                        style={{
                          padding: '7px 14px',
                          fontSize: 12,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Plus size={14} strokeWidth={2.5} /> {isAlreadyInSession ? 'Add Again' : 'Add to Session'}
                      </button>
                    </div>
                  );
                });
              })()}
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* SMART ALTERNATIVES SWITCHER MODAL (via React Portal) */}
      {smartAltTarget && createPortal(
        <div className="app-modal-backdrop" onClick={() => { setSmartAltTarget(null); setSmartAltSearch(''); }}>
          <div className="app-modal-dialog" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="app-modal-header">
              <button 
                onClick={() => { setSmartAltTarget(null); setSmartAltSearch(''); }}
                style={{
                  position: 'absolute', top: 16, right: 16, background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)', borderRadius: '50%', width: 30, height: 30,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                <X size={14} />
              </button>

              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--brand-primary-light)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={13} /> SMART EXERCISE ALTERNATIVE ENGINE
              </span>
              <h2 style={{ fontSize: 19, fontWeight: 800, margin: '4px 0 2px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Target-Matched Replacements for {smartAltTarget.ex?.name}
              </h2>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: 0 }}>
                {smartAltTarget.ex?.targetAnatomy 
                  ? `Biomechanical matches targeting: ${smartAltTarget.ex.targetAnatomy}`
                  : `Select a certified biomechanical replacement for ${smartAltTarget.ex?.name}`}
              </p>

              {/* Search Bar inside Modal */}
              <div style={{ position: 'relative', marginTop: 12 }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter alternatives by name, equipment, or muscle..."
                  value={smartAltSearch}
                  onChange={e => setSmartAltSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: 12,
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Modal Body: Matching Exercise Cards */}
            <div className="app-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: 16 }}>
              {(() => {
                const baseAlts = getSmartAlternatives(
                  smartAltTarget.ex?.name,
                  PRESET_EXERCISES,
                  user?.equipment || 'full_gym',
                  user?.trainingInjuries || []
                );

                const q = smartAltSearch.trim().toLowerCase();
                const filtered = baseAlts.filter(ex => {
                  if (!q) return true;
                  return (
                    ex.name.toLowerCase().includes(q) ||
                    (ex.muscleGroup || '').toLowerCase().includes(q) ||
                    (ex.category || '').toLowerCase().includes(q) ||
                    (ex.targetAnatomy || '').toLowerCase().includes(q)
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>No exact matches found for "{smartAltSearch}".</p>
                      <p style={{ margin: '4px 0 0', fontSize: 11 }}>Try clearing the search or browse all exercises in the library.</p>
                    </div>
                  );
                }

                return filtered.map((altEx, aIdx) => (
                  <div
                    key={aIdx}
                    style={{
                      background: 'var(--bg-surface-raised)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-panel)',
                      padding: 14,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                          {altEx.name}
                        </span>
                        <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: 'var(--brand-primary-subtle)', color: 'var(--brand-primary-light)' }}>
                          {altEx.muscleGroup}
                        </span>
                        {altEx.movementPlane && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>
                            • {altEx.movementPlane}
                          </span>
                        )}
                      </div>
                      {altEx.targetAnatomy && (
                        <div style={{ fontSize: 11.5, color: 'var(--brand-primary-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Target size={12} /> Target: {formatCleanAnatomy(altEx.targetAnatomy)}
                        </div>
                      )}
                      {altEx.cues && altEx.cues.length > 0 && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Info size={11} /> Cue: {altEx.cues[0]}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSwitchExercise(altEx)}
                      className="btn btn-primary"
                      style={{
                        padding: '8px 16px',
                        fontSize: 12,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        flexShrink: 0,
                        cursor: 'pointer'
                      }}
                    >
                      <Check size={13} strokeWidth={2.5} /> Switch Exercise
                    </button>
                  </div>
                ));
              })()}
            </div>

            {/* Modal Footer */}
            <div className="app-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Target muscle activation and total mesocycle volume are preserved.
              </span>
              <button
                type="button"
                onClick={() => { setSmartAltTarget(null); setSmartAltSearch(''); }}
                className="btn btn-secondary"
                style={{ padding: '7px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Program Intake Wizard Modal (Zero-Scroll Pinned Viewport via React Portal) */}
      {showIntakeModal && createPortal(
        <div className="app-modal-backdrop" onClick={() => setShowIntakeModal(false)}>
          <div className="app-modal-dialog" onClick={e => e.stopPropagation()}>
            
            {/* Pinned Modal Header */}
            <div className="app-modal-header">
              <button 
                onClick={() => setShowIntakeModal(false)}
                style={{
                  position: 'absolute', top: 16, right: 16, background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)', borderRadius: '50%', width: 30, height: 30,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                <X size={14} />
              </button>

              <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--brand-primary-light)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={13} /> PERSONALIZED PROGRAM BUILDER
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 2px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                {intakeStep === 0 && 'Select Primary Goal'}
                {intakeStep === 1 && 'Equipment Available'}
                {intakeStep === 2 && 'Injuries & Session Duration'}
              </h2>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                Step {intakeStep + 1} of 3 — Certified NSCA & ACSM Periodization Principles
              </p>

              {/* Step Indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
                {[0, 1, 2].map(step => (
                  <div key={step} style={{
                    height: 3,
                    borderRadius: 2,
                    background: intakeStep >= step ? 'var(--brand-primary-light)' : 'var(--bg-surface-raised)',
                    transition: 'background 0.3s ease'
                  }} />
                ))}
              </div>
            </div>

            {/* Scrollable Modal Body */}
            <div className="app-modal-body">
              {/* Step 0: Goal & Experience */}
              {intakeStep === 0 && (
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                    PRIMARY TRAINING GOAL
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                    {[
                      { key: 'hypertrophy', label: 'Hypertrophy', desc: 'Maximum muscle mass & aesthetic fullness' },
                      { key: 'strength', label: 'Strength & Power', desc: 'CNS adaptation and high 1RM load' },
                      { key: 'fat_loss', label: 'Athletic Conditioning', desc: 'Fat loss & metabolic density' },
                      { key: 'endurance', label: 'Muscular Stamina', desc: 'High-rep capacity & durability' }
                    ].map(opt => {
                      const active = intakeForm.trainingGoal === opt.key;
                      return (
                        <div
                          key={opt.key}
                          onClick={() => setIntakeForm(prev => ({ ...prev, trainingGoal: opt.key }))}
                          style={{
                            padding: 12,
                            borderRadius: 12,
                            background: active ? 'var(--brand-primary-subtle)' : 'var(--bg-surface-raised)',
                            border: `1.5px solid ${active ? 'var(--brand-primary-light)' : 'var(--border-subtle)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <h4 style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 800, color: active ? 'var(--brand-primary-light)' : 'var(--text-primary)' }}>{opt.label}</h4>
                          <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3 }}>{opt.desc}</p>
                        </div>
                      );
                    })}
                  </div>

                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                    TRAINING EXPERIENCE
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {[
                      { key: 'beginner', label: 'Beginner', desc: '< 6 months' },
                      { key: 'intermediate', label: 'Intermediate', desc: '6 mo – 2 yrs' },
                      { key: 'advanced', label: 'Advanced', desc: '2+ years' }
                    ].map(opt => {
                      const active = intakeForm.trainingExperience === opt.key;
                      return (
                        <div
                          key={opt.key}
                          onClick={() => setIntakeForm(prev => ({ ...prev, trainingExperience: opt.key }))}
                          style={{
                            padding: '10px 6px',
                            borderRadius: 10,
                            background: active ? 'rgba(129, 140, 248, 0.1)' : 'var(--bg-surface-raised)',
                            border: `1.5px solid ${active ? '#818CF8' : 'var(--border-subtle)'}`,
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <h5 style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 800, color: active ? '#818CF8' : 'var(--text-primary)' }}>{opt.label}</h5>
                          <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{opt.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 1: Equipment */}
              {intakeStep === 1 && (
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                    FACILITY & EQUIPMENT ACCESS
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                    {[
                      { key: 'full_gym', label: 'Full Gym', desc: 'Barbells, cables & machines' },
                      { key: 'home_dumbbells', label: 'Home Gym', desc: 'Dumbbells & bench' },
                      { key: 'bodyweight', label: 'Bodyweight', desc: 'Calisthenics & bands' }
                    ].map(opt => {
                      const active = intakeForm.equipment === opt.key;
                      return (
                        <div
                          key={opt.key}
                          onClick={() => setIntakeForm(prev => ({ ...prev, equipment: opt.key }))}
                          style={{
                            padding: 12,
                            borderRadius: 12,
                            background: active ? 'var(--brand-primary-subtle)' : 'var(--bg-surface-raised)',
                            border: `1.5px solid ${active ? 'var(--brand-primary-light)' : 'var(--border-subtle)'}`,
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <h4 style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 800, color: active ? 'var(--brand-primary-light)' : 'var(--text-primary)' }}>{opt.label}</h4>
                          <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>{opt.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border-subtle)', fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Info size={13} color="var(--brand-primary-light)" />
                    <span>Exercises automatically map to available gear without volume loss.</span>
                  </div>
                </div>
              )}

              {/* Step 2: Injuries & Duration */}
              {intakeStep === 2 && (
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    JOINT SENSITIVITIES & INJURIES
                  </span>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '0 0 8px' }}>
                    Select active joint restrictions to substitute high-shear movements.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginBottom: 14 }}>
                    {[
                      { key: 'knee', label: 'Knee Issue', desc: 'Swaps deep knee flexion' },
                      { key: 'shoulder', label: 'Shoulder Issue', desc: 'Swaps extreme overhead' },
                      { key: 'lower_back', label: 'Lower Back', desc: 'Reduces axial load' },
                      { key: 'wrist', label: 'Wrist issue', desc: 'Modifies grip-intensive movements' },
                      { key: 'hip', label: 'Hip issue', desc: 'Avoids deep hip flexion loads' }
                    ].map(opt => {
                      const active = (intakeForm.trainingInjuries || []).includes(opt.key);
                      return (
                        <div
                          key={opt.key}
                          onClick={() => toggleIntakeInjury(opt.key)}
                          style={{
                            padding: 10,
                            borderRadius: 10,
                            background: active ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-surface-raised)',
                            border: `1.5px solid ${active ? '#EF4444' : 'var(--border-subtle)'}`,
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <h5 style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 800, color: active ? '#EF4444' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                            {opt.label} {active && <Check size={11} />}
                          </h5>
                          <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{opt.desc}</span>
                        </div>
                      );
                    })}
                  </div>

                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    TIME AVAILABLE PER WORKOUT
                  </span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[30, 45, 60, 75, 90].map(mins => {
                      const active = intakeForm.sessionTime === mins;
                      return (
                        <button
                          key={mins}
                          onClick={() => setIntakeForm(prev => ({ ...prev, sessionTime: mins }))}
                          style={{
                            flex: 1,
                            padding: '8px 4px',
                            borderRadius: 8,
                            background: active ? 'var(--brand-primary-subtle)' : 'var(--bg-surface-raised)',
                            border: `1.5px solid ${active ? 'var(--brand-primary-light)' : 'var(--border-subtle)'}`,
                            color: active ? 'var(--brand-primary-light)' : 'var(--text-secondary)',
                            fontWeight: 800,
                            fontSize: 11,
                            cursor: 'pointer'
                          }}
                        >
                          {mins}m
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Pinned Modal Footer */}
            <div className="app-modal-footer">
              {intakeStep > 0 ? (
                <button
                  onClick={() => setIntakeStep(prev => prev - 1)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', borderRadius: 10, fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <ArrowLeft size={13} /> Back
                </button>
              ) : <div />}

              {intakeStep < 2 ? (
                <button
                  onClick={() => setIntakeStep(prev => prev + 1)}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', borderRadius: 10, fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  Continue <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  onClick={() => handleGenerateProgram(0)}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Sparkles size={13} /> Build 4-week plan
                </button>
              )}
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Completed Workout Summary Modal (via React Portal) */}
      {completedSummary && createPortal(
        <div
          onClick={() => setCompletedSummary(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 440,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-modal)',
              padding: '28px 24px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-overlay)'
            }}
          >
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--brand-primary-subtle)', color: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Award size={26} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--brand-primary-light)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              SESSION COMPLETED
            </span>
            <h2 style={{ fontSize: 19, fontWeight: 800, margin: '4px 0 16px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {completedSummary.name}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
              <div style={{ background: 'var(--bg-surface-raised)', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 9.5, color: 'var(--text-muted)', display: 'block' }}>DURATION</span>
                <span className="tabular-nums" style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{formatMMSS(completedSummary.duration)}</span>
              </div>
              <div style={{ background: 'var(--bg-surface-raised)', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 9.5, color: 'var(--text-muted)', display: 'block' }}>SETS</span>
                <span className="tabular-nums" style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{completedSummary.totalSets}</span>
              </div>
              <div style={{ background: 'var(--bg-surface-raised)', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 9.5, color: 'var(--text-muted)', display: 'block' }}>VOLUME</span>
                <span className="tabular-nums" style={{ fontSize: 14, fontWeight: 800, color: 'var(--brand-primary-light)' }}>{Math.round(completedSummary.totalVolume)} kg</span>
              </div>
            </div>

            {completedSummary.newPrs && completedSummary.newPrs.length > 0 && (
              <div style={{ background: 'var(--brand-primary-subtle)', border: '1px solid var(--border-focus)', borderRadius: 'var(--radius-panel)', padding: 12, marginBottom: 16, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 11, fontWeight: 800, color: 'var(--brand-primary-light)' }}>
                  <Trophy size={13} /> NEW PERSONAL RECORDS!
                </div>
                {completedSummary.newPrs.map((pr, i) => (
                  <div key={i} className="tabular-nums" style={{ fontSize: 11.5, color: 'var(--text-primary)', padding: '2px 0' }}>
                    • <strong>{pr.exercise}</strong>: {pr.weight} kg × {pr.reps} reps
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setCompletedSummary(null)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '11px 0', fontSize: 13, fontWeight: 800 }}
            >
              Done & Save to Archive
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Real-Time PR Celebration Modal (via React Portal) */}
      {prCelebration && createPortal(
        <div
          onClick={() => setPrCelebration(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div className="pr-celebration-dialog" onClick={e => e.stopPropagation()} style={{ padding: '36px 28px' }}>
            
            {/* Confetti Particles */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' }}>
              {[
                { tx: '-120px', ty: '-160px', rot: '280deg', col: '#10B981', delay: '0ms' },
                { tx: '130px', ty: '-170px', rot: '320deg', col: '#059669', delay: '50ms' },
                { tx: '-70px', ty: '-200px', rot: '180deg', col: '#818CF8', delay: '100ms' },
                { tx: '80px', ty: '-190px', rot: '220deg', col: '#38BDF8', delay: '120ms' },
                { tx: '-150px', ty: '-90px', rot: '140deg', col: '#34D399', delay: '80ms' },
                { tx: '160px', ty: '-80px', rot: '260deg', col: '#38BDF8', delay: '40ms' },
                { tx: '0px', ty: '-220px', rot: '360deg', col: '#10B981', delay: '150ms' },
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 8,
                    height: 8,
                    borderRadius: i % 2 === 0 ? '50%' : 2,
                    background: c.col,
                    '--tx': c.tx,
                    '--ty': c.ty,
                    '--rot': c.rot,
                    animation: `confettiBurst 1.8s cubic-bezier(0.16, 1, 0.3, 1) ${c.delay} infinite`,
                  }}
                />
              ))}
            </div>

            {/* Glowing Floating Trophy */}
            <div style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.04) 70%)',
              border: '2px solid rgba(16, 185, 129, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              animation: 'trophyFloat 3s ease-in-out infinite',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)'
            }}>
              <Trophy size={40} color="#10B981" />
            </div>

            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary-light)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Flame size={14} fill="var(--brand-primary-light)" /> NEW PERSONAL RECORD!
            </span>

            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', margin: '6px 0 2px', fontFamily: 'var(--font-heading)' }}>
              {prCelebration.exercise}
            </h2>

            <div className="tabular-nums" style={{
              fontSize: 32,
              fontWeight: 800,
              color: 'var(--brand-primary-light)',
              margin: '12px 0 6px',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em'
            }}>
              {prCelebration.weight} kg <span style={{ fontSize: 20, color: '#ffffff', fontWeight: 700 }}>× {prCelebration.reps} reps</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              {prCelebration.delta && (
                <span className="tabular-nums" style={{ fontSize: 12, fontWeight: 800, background: 'var(--brand-primary-subtle)', color: 'var(--brand-primary-light)', border: '1px solid var(--border-focus)', padding: '4px 12px', borderRadius: 20 }}>
                  +{prCelebration.delta} kg over previous best
                </span>
              )}
              <span className="tabular-nums" style={{ fontSize: 12, fontWeight: 800, background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', padding: '4px 12px', borderRadius: 20 }}>
                Est. 1RM: ~{prCelebration.est1RM} kg
              </span>
            </div>

            {/* Motivational Quote Box */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-panel)',
              padding: '14px 18px',
              marginBottom: 22,
              fontStyle: 'italic',
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}>
              "{prCelebration.quote}"
            </div>

            <button
              onClick={() => setPrCelebration(null)}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '13px 0',
                fontSize: 14,
                fontWeight: 800
              }}
            >
              Keep Crushing It →
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Discard Workout Confirmation Modal (via React Portal) */}
      {showCancelConfirm && createPortal(
        <div
          onClick={() => setShowCancelConfirm(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            animation: 'fadeIn 0.15s ease'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 380,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-modal)',
              padding: '26px 22px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-overlay)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Trash2 size={22} />
            </div>

            <div>
              <h3 style={{ fontSize: 17, fontWeight: 900, margin: '0 0 6px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Discard Active Workout?
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                Current set progress and elapsed timer will be cancelled and permanently discarded.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '10px 0', fontSize: 12.5, fontWeight: 700, borderRadius: 10 }}
              >
                Keep Lifting
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSessionActive(false);
                  setIsConsoleMode(false);
                  setShowCancelConfirm(false);
                  localStorage.removeItem(`nutribuddy_active_workout_${activeUserId}`);
                  if (onSessionStateChange) {
                    onSessionStateChange(null);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  fontSize: 12.5,
                  fontWeight: 800,
                  borderRadius: 10,
                  background: '#EF4444',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)'
                }}
              >
                Discard
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Slide-Over Template Preview Drawer (via React Portal) */}
      {previewTemplate && createPortal(
        <div 
          onClick={() => setPreviewTemplate(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 999999,
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 480, height: '100%',
              background: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border-subtle)',
              display: 'flex', flexDirection: 'column',
              boxShadow: 'var(--shadow-overlay)',
              position: 'relative'
            }}
          >
            {/* Drawer Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', position: 'relative' }}>
              <button 
                onClick={() => setPreviewTemplate(null)}
                style={{
                  position: 'absolute', top: 20, right: 20, background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)', borderRadius: '50%', width: 30, height: 30,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                <X size={15} />
              </button>

              <span style={{
                fontSize: 10, fontWeight: 800,
                color: 'var(--brand-primary-light)',
                textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4
              }}>
                {SPLIT_CATEGORIES[previewTemplate.name]?.label || 'ROUTINE SPLIT'}
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                {previewTemplate.name}
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.4 }}>
                {previewTemplate.description}
              </p>
            </div>

            {/* Drawer Body (Exercises) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Included Exercises ({previewTemplate.exercises.length})
              </span>

              {previewTemplate.exercises.map((exName, idx) => {
                const dbEntry = PRESET_EXERCISES.find(p => p.name === exName) || {};
                return (
                  <div key={idx} style={{
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-panel)',
                    padding: 14
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{exName}</h4>
                      <span style={{ fontSize: 9.5, fontWeight: 800, background: 'var(--brand-primary-subtle)', color: 'var(--brand-primary-light)', padding: '2px 8px', borderRadius: 6 }}>
                        {dbEntry.muscleGroup || 'Compound'}
                      </span>
                    </div>
                    {dbEntry.targetAnatomy && (
                      <div style={{ fontSize: 11, color: 'var(--brand-primary-light)', fontWeight: 600, marginBottom: 2 }}>
                        Target: {dbEntry.targetAnatomy}
                      </div>
                    )}
                    {dbEntry.cues && dbEntry.cues.length > 0 && (
                      <p style={{ margin: '2px 0 0', fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Info size={11} /> {dbEntry.cues[0]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Drawer Bottom CTA */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface-raised)' }}>
              <button
                onClick={() => {
                  handleSelectSplit(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="btn btn-primary"
                style={{
                  width: '100%', padding: '12px 0', fontSize: 13, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                <Play size={15} fill="currentColor" /> Start Workout Session
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
          DYNAMIC MAIN VIEW ROUTING
          - isConsoleMode: Active Workout Console (View B)
          - programView === 'program': 4-Week Mesocycle Program (View A2)
          - default: Workout Hub (View A)
          ========================================================================= */}

      {isConsoleMode ? (
        /* ==================== VIEW B: ACTIVE WORKOUT CONSOLE ==================== */
        <div className="fadeInUp" style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-overlay)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          {/* SINGLE CLEAN STICKY FLOATING TOP BAR (Tier 1: Global Session Controls) */}
          <div className="workout-console-header" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            {/* Desktop Top Bar */}
            <div className="workout-console-header-desktop">
              {/* Left: Digital Stopwatch + Workout Routine Title */}
              <div className="workout-console-header-top">
                <div className="console-stopwatch-pill">
                  <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand-primary-light)', display: 'inline-block' }} />
                  <Clock size={14} color="var(--brand-primary-light)" />
                  <span className="tabular-nums console-stopwatch-time">
                    {formatMMSS(elapsedSeconds)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {workoutName}
                  </span>
                  <span className="tabular-nums" style={{ fontSize: 10.5, fontWeight: 800, background: 'var(--bg-surface-raised)', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                    {activeExercises.reduce((acc, ex) => acc + (ex.sets || []).filter(s => s.completed).length, 0)} / {activeExercises.reduce((acc, ex) => acc + (ex.sets || []).length, 0)} Sets
                  </span>
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="workout-console-header-actions desktop-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '6px 8px',
                    textDecoration: 'underline',
                    opacity: 0.75
                  }}
                >
                  Discard Session
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsConsoleMode(false);
                    scrollToTop();
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '8px 14px', fontSize: 12, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800 }}
                  title="Browse other tabs while your workout stays active in the background"
                >
                  <ArrowLeft size={13} /> Minimize
                </button>

                <button
                  onClick={handleFinishWorkout}
                  className="btn btn-primary"
                  style={{ padding: '8px 18px', fontSize: 12, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 900, background: 'var(--brand-primary-light)', color: '#000' }}
                >
                  <Check size={14} strokeWidth={2.5} /> Finish Workout
                </button>
              </div>
            </div>

            {/* Mobile Sticky Top Bar (Tier 1: Global Session Controls) */}
            <div
              className="workout-console-header-mobile h-12 px-4 flex items-center justify-between"
              style={{
                height: 48,
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                boxSizing: 'border-box',
                position: 'relative'
              }}
            >
              {/* Left: Minimize Button */}
              <button
                type="button"
                onClick={() => {
                  setIsConsoleMode(false);
                  scrollToTop();
                }}
                className="console-mobile-minimize-btn h-8 px-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
                style={{
                  height: 32,
                  padding: '0 10px',
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#d4d4d8',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                aria-label="Minimize workout console"
                title="Minimize"
              >
                <ChevronDown size={14} />
                <span>Minimize</span>
              </button>

              {/* Center: Live Timer & Pacer */}
              <div
                className="text-xs font-mono font-semibold text-zinc-300 flex items-center gap-1.5 min-w-0"
                style={{
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: '#d4d4d8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  minWidth: 0,
                  justifyContent: 'center'
                }}
              >
                <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block', flexShrink: 0 }} />
                <span className="tabular-nums" style={{ color: '#10B981', fontWeight: 800 }}>
                  {formatMMSS(elapsedSeconds)}
                </span>
                <span style={{ fontSize: 10, color: '#71717a' }}>|</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>
                  {workoutName}
                </span>
              </div>

              {/* Right: Pinned Finish Button + Overflow Menu */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={handleFinishWorkout}
                  className="h-8 px-3.5 bg-[#10B981] text-black font-bold text-xs rounded-lg active:scale-95 flex items-center gap-1 cursor-pointer"
                  style={{
                    height: 32,
                    padding: '0 14px',
                    backgroundColor: '#10B981',
                    border: 'none',
                    borderRadius: 8,
                    color: '#000000',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(16, 185, 129, 0.35)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Check size={13} strokeWidth={3} color="#000000" />
                  <span>Finish</span>
                </button>

                {/* Overflow Trigger for Discard Session */}
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowConsoleOverflow(prev => !prev)}
                    className="h-8 w-8 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 flex items-center justify-center active:scale-95 cursor-pointer"
                    style={{
                      width: 32,
                      height: 32,
                      padding: 0,
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: 8,
                      color: '#a1a1aa',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    aria-label="Workout session options"
                  >
                    <MoreVertical size={14} />
                  </button>

                  {showConsoleOverflow && (
                    <>
                      <div
                        style={{ position: 'fixed', inset: 0, zIndex: 190 }}
                        onClick={() => setShowConsoleOverflow(false)}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 6px)',
                          right: 0,
                          backgroundColor: '#12141A',
                          border: '1px solid #27272A',
                          borderRadius: 12,
                          padding: 6,
                          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                          zIndex: 200,
                          minWidth: 150
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setShowConsoleOverflow(false);
                            setShowCancelConfirm(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-zinc-800/80 cursor-pointer"
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 12px',
                            borderRadius: 8,
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#EF4444',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <Trash2 size={13} color="#EF4444" />
                          <span>Discard Workout</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile-Only Interactive Exercise Switcher Track (Directly Underneath Top Bar) */}
            <div
              ref={carouselTrackRef}
              className="console-mobile-chips-track flex md:hidden overflow-x-auto no-scrollbar gap-1.5 py-2 px-3 bg-[#09090C] border-b border-zinc-800/80 mb-3"
              style={{
                display: 'flex',
                overflowX: 'auto',
                gap: 6,
                padding: '8px 12px',
                backgroundColor: '#09090C',
                borderBottom: '1px solid rgba(39, 39, 42, 0.8)',
                marginBottom: 12,
                boxSizing: 'border-box',
                width: '100%',
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth'
              }}
            >
              {activeExercises.map((ex, idx) => {
                const doneCount = (ex.sets || []).filter(s => s.completed).length;
                const totCount = (ex.sets || []).length;
                const isCurrent = idx === currentExIndex;
                const isAllDone = totCount > 0 && doneCount === totCount;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCurrentExIndex(idx);
                      setActiveDrawer(null);
                    }}
                    className={`h-8 text-xs px-3 rounded-xl shrink-0 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 border ${
                      isCurrent
                        ? 'bg-zinc-800 border-[#10B981] text-white font-bold'
                        : isAllDone
                        ? 'bg-zinc-900 border-emerald-500/40 text-emerald-400 font-medium'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 font-medium'
                    }`}
                    style={{
                      height: 32,
                      fontSize: 12,
                      padding: '0 12px',
                      borderRadius: 12,
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      ...(isCurrent ? {
                        backgroundColor: '#27272a',
                        borderColor: '#10B981',
                        color: '#ffffff',
                        fontWeight: 700,
                        boxShadow: '0 0 10px rgba(16, 185, 129, 0.25)'
                      } : isAllDone ? {
                        backgroundColor: '#18181b',
                        borderColor: 'rgba(16, 185, 129, 0.4)',
                        color: '#34d399',
                        fontWeight: 500
                      } : {
                        backgroundColor: 'rgba(24, 24, 27, 0.6)',
                        borderColor: '#27272a',
                        color: '#a1a1aa',
                        fontWeight: 500
                      })
                    }}
                  >
                    <span>{ex.name}</span>
                    <span style={{
                      fontSize: 10.5,
                      fontWeight: isCurrent ? 800 : 700,
                      padding: '1px 5px',
                      borderRadius: 5,
                      background: isAllDone
                        ? 'rgba(16, 185, 129, 0.2)'
                        : isCurrent
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(255, 255, 255, 0.06)',
                      color: isAllDone
                        ? '#34d399'
                        : isCurrent
                        ? '#34d399'
                        : '#a1a1aa'
                    }}>
                      {isAllDone ? `${doneCount}/${totCount} ✓` : `${doneCount}/${totCount}`}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setShowExerciseSearchModal(true)}
                className="h-8 text-xs px-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800 text-zinc-400 shrink-0 flex items-center gap-1 cursor-pointer hover:text-white transition-all active:scale-95"
                style={{
                  height: 32,
                  fontSize: 12,
                  padding: '0 10px',
                  borderRadius: 12,
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: 'rgba(24, 24, 27, 0.4)',
                  border: '1px dashed #3f3f46',
                  color: '#a1a1aa',
                  cursor: 'pointer'
                }}
              >
                <Plus size={12} color="#10B981" />
                <span>Add</span>
              </button>
            </div>
          </div>



          {/* ACTIVE REST TIMER BANNER (DESKTOP) */}
          {restActive && (
            <div className="desktop-rest-banner" style={{
              background: restRemaining <= 10 ? 'rgba(239, 68, 68, 0.12)' : 'var(--brand-primary-subtle)',
              borderBottom: `1px solid ${restRemaining <= 10 ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-focus)'}`,
              padding: '10px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              animation: 'fadeIn 0.2s ease',
              flexWrap: 'wrap',
              gap: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={15} color={restRemaining <= 10 ? '#EF4444' : 'var(--brand-primary-light)'} />
                <span style={{ fontSize: 12.5, fontWeight: 800, color: restRemaining <= 10 ? '#EF4444' : 'var(--brand-primary-light)' }}>
                  Resting: {restRemaining}s remaining
                </span>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setRestRemaining(prev => prev + 30)}
                  style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', padding: '4px 10px', borderRadius: 8, fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700 }}
                >
                  +30s
                </button>
                <button
                  onClick={() => setRestRemaining(prev => Math.max(0, prev - 15))}
                  style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', padding: '4px 10px', borderRadius: 8, fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700 }}
                >
                  -15s
                </button>
                <button
                  onClick={() => setRestActive(false)}
                  style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', padding: '4px 12px', borderRadius: 8, fontSize: 11, color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 800 }}
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* TOOL BOTTOM SHEET MODAL (PORTAL) - Accessible by both Desktop and Mobile */}
          {/* TOOL BOTTOM SHEET MODAL (PORTAL) */}
                  {activeDrawer && createPortal(
                    <div className="app-modal-backdrop" onClick={() => setActiveDrawer(null)} style={{ zIndex: 1150 }}>
                      <div
                        className="native-bottom-sheet fadeInUp"
                        onClick={e => e.stopPropagation()}
                        style={{
                          position: 'fixed',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'var(--bg-surface)',
                          borderTop: '1px solid var(--border-subtle)',
                          borderTopLeftRadius: 20,
                          borderTopRightRadius: 20,
                          padding: '20px 20px calc(24px + env(safe-area-inset-bottom, 16px))',
                          boxShadow: '0 -10px 40px rgba(0,0,0,0.6)',
                          maxHeight: '82vh',
                          overflowY: 'auto',
                          maxWidth: 540,
                          margin: '0 auto'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-subtle)' }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {activeDrawer === 'warmup' && <><Flame size={15} color="#10B981" /> <span>Warm-Up Ramp Protocol</span></>}
                            {activeDrawer === 'plates' && <><Disc size={15} color="#10B981" /> <span>Barbell Plate Calculator</span></>}
                            {activeDrawer === 'cues' && <><Sparkles size={15} color="#10B981" /> <span>Form & Execution Cues</span></>}
                            {activeDrawer === 'swap' && <><Repeat size={15} color="#10B981" /> <span>Smart Exercise Alternatives</span></>}
                            {activeDrawer === 'anatomy' && <><Activity size={15} color="#10B981" /> <span>Muscle & Anatomy Profile</span></>}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveDrawer(null)}
                            style={{ background: 'var(--bg-surface-raised)', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
                          >
                            <X size={15} />
                          </button>
                        </div>

                        {activeDrawer === 'anatomy' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ background: 'var(--bg-surface-raised)', padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', fontWeight: 800 }}>PRIMARY MOVER</span>
                              <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{currentActiveEx.targetAnatomy || currentActiveEx.muscleGroup}</span>
                            </div>
                            <div style={{ background: 'var(--bg-surface-raised)', padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', fontWeight: 800 }}>ASSISTING SYNERGISTS</span>
                              <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{currentActiveEx.synergists || 'Stabilizing Core'}</span>
                            </div>
                            <div style={{ background: 'var(--bg-surface-raised)', padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', fontWeight: 800 }}>MOVEMENT PLANE</span>
                              <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{currentActiveEx.movementPlane || currentActiveEx.category}</span>
                            </div>
                          </div>
                        )}

                        {activeDrawer === 'cues' && (
                          <div>
                            {currentActiveEx.cues && currentActiveEx.cues.length > 0 ? (
                              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                                {currentActiveEx.cues.map((c, i) => <li key={i}>{c}</li>)}
                              </ul>
                            ) : (
                              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Focus on controlled eccentric lowering and explosive contraction.</p>
                            )}
                          </div>
                        )}

                        {activeDrawer === 'warmup' && (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary-light)', textTransform: 'uppercase' }}>
                                Target Working Load
                              </span>
                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                Working Weight: <strong>{currentActiveEx.sets[0]?.weight || 60} kg</strong>
                              </span>
                            </div>
                            {(() => {
                              const target = parseFloat(currentActiveEx.sets[0]?.weight) || 60;
                              const w1 = Math.round(target * 0.5);
                              const w2 = Math.round(target * 0.7);
                              const w3 = Math.round(target * 0.85);
                              return (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
                                  <div style={{ background: 'var(--bg-surface-raised)', padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                                    <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>Bar / Light (50%)</span>
                                    <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>{w1} kg × 10</span>
                                  </div>
                                  <div style={{ background: 'var(--bg-surface-raised)', padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                                    <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>Feeder (70%)</span>
                                    <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>{w2} kg × 5</span>
                                  </div>
                                  <div style={{ background: 'var(--bg-surface-raised)', padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                                    <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>Primer (85%)</span>
                                    <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>{w3} kg × 2</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {activeDrawer === 'plates' && (
                          <div>
                            {(() => {
                              const target = parseFloat(currentActiveEx.sets[0]?.weight) || 60;
                              const plates = calculatePlates(target);
                              return (
                                <div>
                                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                                    Load per side for <strong>{target} kg</strong> (on standard 20 kg Olympic barbell):
                                  </div>
                                  {plates.length > 0 ? (
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                      {plates.map((p, pIdx) => (
                                        <span key={pIdx} style={{
                                          background: p >= 20 ? '#2563EB' : p >= 10 ? '#16A34A' : '#D97706',
                                          color: '#fff', padding: '8px 14px', borderRadius: 8, fontWeight: 900, fontSize: 13
                                        }}>
                                          {p} kg
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Load empty bar (20 kg) or use dumbbells.</span>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {activeDrawer === 'swap' && (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                Pick a replacement movement:
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDrawer(null);
                                  setSmartAltTarget({ ex: currentActiveEx, isConsole: true });
                                }}
                                style={{
                                  padding: '4px 10px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)',
                                  border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981',
                                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                  display: 'inline-flex', alignItems: 'center', gap: 4
                                }}
                              >
                                <span>Full Exercise Library</span>
                                <ArrowRight size={11} />
                              </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 8 }}>
                              {(() => {
                                const alts = getSmartAlternatives(currentActiveEx.name, PRESET_EXERCISES);
                                const list = alts.length > 0 ? alts : PRESET_EXERCISES.filter(p => p.name !== currentActiveEx.name && p.category === currentActiveEx.category).slice(0, 6);
                                return list.slice(0, 6).map(subEx => (
                                  <button
                                    key={subEx.name}
                                    type="button"
                                    onClick={() => {
                                      handleSwitchExercise(subEx, { isConsole: true, ex: currentActiveEx });
                                      setActiveDrawer(null);
                                    }}
                                    style={{
                                      padding: '10px 14px', borderRadius: 10, background: 'var(--bg-surface-raised)',
                                      border: '1px solid var(--border-subtle)', color: 'var(--text-primary)',
                                      fontSize: 12, fontWeight: 700, textAlign: 'left', cursor: 'pointer',
                                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}
                                  >
                                    <div>
                                      <span style={{ display: 'block', fontWeight: 800 }}>{subEx.name}</span>
                                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{subEx.muscleGroup || subEx.category}</span>
                                    </div>
                                    <span style={{ fontSize: 10, color: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                      Swap <ArrowRight size={10} />
                                    </span>
                                  </button>
                                ));
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>,
                    document.body
                  )}

          {/* DESKTOP CONSOLE WORKSPACE (2-COLUMN OBSIDIAN EMERALD GRID) */}
          {!isMobileViewport && (
            <div className="hidden md:grid workout-console-layout" style={{ display: 'grid', gridTemplateColumns: '290px 1fr', minHeight: 640, background: 'var(--bg-surface)' }}>
              <div className="workout-console-left">
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                EXERCISES IN WORKOUT ({activeExercises.length})
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto' }}>
                {activeExercises.map((ex, idx) => {
                  const doneCount = (ex.sets || []).filter(s => s.completed).length;
                  const totCount = (ex.sets || []).length;
                  const isCurrent = idx === currentExIndex;
                  const isAllDone = totCount > 0 && doneCount === totCount;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentExIndex(idx);
                        setActiveDrawer(null);
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 12,
                        border: isCurrent ? '1.5px solid var(--brand-primary-light)' : '1px solid var(--border-subtle)',
                        background: isCurrent ? 'var(--brand-primary-subtle)' : 'var(--bg-surface-raised)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 10
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                          background: isAllDone ? '#10B981' : isCurrent ? 'var(--brand-primary-light)' : 'var(--text-muted)'
                        }} />
                        <span style={{
                          fontSize: 13,
                          fontWeight: isCurrent ? 800 : 600,
                          color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {ex.name}
                        </span>
                      </div>

                      <span style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: isAllDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.06)',
                        color: isAllDone ? '#10B981' : 'var(--text-muted)',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        {isAllDone && <Check size={11} strokeWidth={3} />}
                        {doneCount}/{totCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Add Exercise Search Trigger */}
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setShowExerciseSearchModal(true)}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 12px',
                    fontSize: 12,
                    fontWeight: 800,
                    borderRadius: 10,
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <Search size={14} /> + Search & Add Exercise
                </button>
              </div>
            </div>

              {/* RIGHT COLUMN: Desktop Active Exercise Workspace */}
              <div className="workout-console-right" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
                {currentActiveEx ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Exercise Header Card with Precise Anatomy Strip */}
                      <div className="console-ex-summary-card">
                        {/* Top Row: Title & Category on Left, PR Badge fixed on Right */}
                        <div className="console-ex-header-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', minWidth: 0 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em' }}>
                              {currentActiveEx.name}
                            </h2>
                            <span style={{ fontSize: 10.5, fontWeight: 800, background: 'var(--brand-primary-subtle)', color: 'var(--brand-primary-light)', padding: '3px 10px', borderRadius: 8, border: '1px solid var(--border-focus)' }}>
                              {currentActiveEx.category || 'Compound'}
                            </span>
                          </div>
    
                          {/* Personal Record Badge (Permanently Anchored on Right) */}
                          <div style={{
                            background: 'var(--brand-primary-subtle)',
                            border: '1px solid var(--border-focus)',
                            borderRadius: 12,
                            padding: '7px 16px',
                            textAlign: 'right',
                            flexShrink: 0
                          }}>
                            <span style={{ fontSize: 9.5, fontWeight: 900, color: 'var(--brand-primary-light)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                              <Trophy size={11} /> PERSONAL RECORD
                            </span>
                            <span className="tabular-nums" style={{ fontSize: 13.5, fontWeight: 900, color: 'var(--text-primary)', display: 'block', marginTop: 1 }}>
                              {activeExPR ? `${activeExPR.weight} kg × ${activeExPR.reps}` : 'No record logged'}
                            </span>
                          </div>
                        </div>
    
                        {/* Subtitle Row: Exact Muscle Anatomy & Targeting Strip */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: 'var(--brand-primary-light)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Activity size={13} />
                            Target: {currentActiveEx.targetAnatomy || currentActiveEx.muscleGroup}
                          </span>
                          {currentActiveEx.synergists && (
                            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                              • Synergists: {currentActiveEx.synergists}
                            </span>
                          )}
                        </div>
    
                        {/* Quick Tools Strip (Horizontal Scroll, Zero Wrap) */}
                        <div className="console-utility-track flex-nowrap overflow-x-auto" style={{
                          display: 'flex',
                          flexWrap: 'nowrap',
                          overflowX: 'auto',
                          gap: 8,
                          paddingBottom: 4,
                          WebkitOverflowScrolling: 'touch',
                          scrollbarWidth: 'none',
                          width: '100%',
                          maxWidth: '100%',
                          minWidth: 0,
                          boxSizing: 'border-box'
                        }}>
                          {[
                            { key: 'warmup', label: 'Warm-Up', icon: <Calculator size={13} /> },
                            { key: 'plates', label: 'Plates', icon: <Disc size={13} /> },
                            { key: 'cues', label: 'Form Cues', icon: <Info size={13} /> },
                            { key: 'swap', label: 'Swap', icon: <RefreshCw size={13} /> }
                          ].map(btn => {
                            const active = activeDrawer === btn.key;
                            return (
                              <button
                                key={btn.key}
                                type="button"
                                onClick={() => setActiveDrawer(active ? null : btn.key)}
                                className={`console-utility-pill ${active ? 'active' : ''}`}
                                style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                              >
                                {btn.icon}
                                <span>{btn.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* SET MATRIX TABLE */}
                      <div className="set-matrix-table-container" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                        <div className="hidden md:block desktop-set-matrix-view">
                            {/* Column Headers */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '50px 120px 130px 100px 100px 70px',
                              gap: 12,
                              paddingBottom: 10,
                              borderBottom: '1px solid var(--border-subtle)',
                              marginBottom: 12,
                              alignItems: 'center'
                            }}>
                              <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)' }}>Set</span>
                              <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)' }}>Previous</span>
                              <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)' }}>Weight (kg)</span>
                              <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)' }}>Reps</span>
                              <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)' }}>Effort (1-10)</span>
                              <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textAlign: 'center' }}>Done</span>
                            </div>
    
                            {/* Sets Rows */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {currentActiveEx.sets.map((set, setIdx) => {
                                const prevFormatted = formatPreviousSet(currentActiveEx.name, setIdx);
                                const isPr = checkIfWeightIsPR(currentActiveEx.name, set.weight);
    
                                return (
                                  <div
                                    key={set.id}
                                    style={{
                                      display: 'grid',
                                      gridTemplateColumns: '50px 120px 130px 100px 100px 70px',
                                      gap: 12,
                                      alignItems: 'center',
                                      padding: '10px 12px',
                                      borderRadius: 12,
                                      background: set.completed ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-surface)',
                                      border: `1px solid ${set.completed ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-subtle)'}`,
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    {/* Set Number */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <span style={{
                                        width: 26, height: 26, borderRadius: 6,
                                        background: set.isWarmup ? 'rgba(129, 140, 248, 0.15)' : 'var(--bg-surface-raised)',
                                        color: set.isWarmup ? '#818CF8' : 'var(--text-secondary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 11, fontWeight: 900
                                      }}>
                                        {set.isWarmup ? 'W' : set.id}
                                      </span>
                                    </div>
    
                                    {/* Previous Best */}
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                                      {prevFormatted || '—'}
                                    </div>
    
                                    {/* Weight Input */}
                                    <div style={{ position: 'relative' }}>
                                      <input
                                        type="number"
                                        placeholder="0"
                                        value={set.weight || ''}
                                        disabled={set.completed}
                                        onChange={(e) => handleUpdateSetField(currentExIndex, setIdx, 'weight', e.target.value)}
                                        style={{
                                          width: '100%',
                                          padding: '8px 10px',
                                          fontSize: 13,
                                          fontWeight: 800,
                                          textAlign: 'center',
                                          background: set.completed ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-input)',
                                          border: `1px solid ${set.completed ? 'rgba(16, 185, 129, 0.4)' : isPr ? 'var(--brand-primary-light)' : 'var(--border-subtle)'}`,
                                          borderRadius: 10,
                                          color: 'var(--text-primary)',
                                          outline: 'none'
                                        }}
                                      />
                                    </div>
    
                                    {/* Reps Input */}
                                    <div>
                                      <input
                                        type="number"
                                        placeholder="0"
                                        value={set.reps || ''}
                                        disabled={set.completed}
                                        onChange={(e) => handleUpdateSetField(currentExIndex, setIdx, 'reps', e.target.value)}
                                        style={{
                                          width: '100%',
                                          padding: '8px 10px',
                                          fontSize: 13,
                                          fontWeight: 800,
                                          textAlign: 'center',
                                          background: set.completed ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-input)',
                                          border: `1px solid ${set.completed ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
                                          borderRadius: 10,
                                          color: 'var(--text-primary)',
                                          outline: 'none'
                                        }}
                                      />
                                    </div>
    
                                    {/* Effort Selector */}
                                    <div>
                                      <button
                                        type="button"
                                        disabled={set.completed}
                                        onClick={() => setOpenRpePicker({ exIdx: currentExIndex, setIdx })}
                                        style={{
                                          width: '100%',
                                          padding: '8px 10px',
                                          background: set.completed ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-input)',
                                          border: `1px solid ${set.completed ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
                                          borderRadius: 10,
                                          color: 'var(--text-primary)',
                                          fontSize: 11,
                                          fontWeight: 800,
                                          cursor: set.completed ? 'default' : 'pointer',
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center'
                                        }}
                                      >
                                        <span>{set.rpe}/10</span>
                                        <ChevronDown size={12} color="var(--text-muted)" />
                                      </button>
                                    </div>
    
                                    {/* CLEAR TACTILE DONE BUTTON WITH INSTANT FEEDBACK */}
                                    <button
                                      type="button"
                                      onClick={() => handleCheckoffSet(currentExIndex, setIdx)}
                                      style={{
                                        width: 44, height: 44, borderRadius: 12,
                                        background: set.completed ? '#10B981' : 'rgba(16, 185, 129, 0.08)',
                                        border: `2px solid ${set.completed ? '#10B981' : 'rgba(16, 185, 129, 0.35)'}`,
                                        color: set.completed ? '#ffffff' : '#10B981',
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                        boxShadow: set.completed ? '0 0 18px rgba(16, 185, 129, 0.45)' : 'none',
                                        transform: set.completed ? 'scale(1.05)' : 'scale(1)'
                                      }}
                                      title={set.completed ? 'Completed! Click to undo' : 'Click to log set as done'}
                                    >
                                      <Check size={22} strokeWidth={set.completed ? 3.5 : 2.5} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        {/* Add & Remove Set Actions: One expanded Add Set button + One compact Remove Set icon button */}
                        <div className="console-set-action-bar">
                          <button
                            type="button"
                            onClick={() => handleAddSet(false)}
                            className="btn btn-secondary console-add-set-expanded-btn"
                          >
                            <Plus size={15} /> Add Set
                          </button>
                          {currentActiveEx.sets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSet(currentActiveEx.sets.length - 1)}
                              className="btn btn-secondary console-remove-set-icon-btn"
                              title="Remove Last Set"
                              aria-label="Remove Last Set"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* DESKTOP BOTTOM EXERCISE PAGINATION NAVIGATION */}
                      <div className="desktop-bottom-nav" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 16,
                        paddingTop: 16,
                        borderTop: '1px solid var(--border-subtle)',
                        gap: 12,
                        flexWrap: 'wrap'
                      }}>
                        {currentExIndex > 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentExIndex(prev => prev - 1);
                              setActiveDrawer(null);
                              scrollToTop();
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '10px 18px', fontSize: 12.5, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}
                          >
                            <ArrowLeft size={15} /> Previous Exercise
                          </button>
                        ) : <div />}
    
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>
                          Exercise {currentExIndex + 1} of {activeExercises.length}
                        </div>
    
                        {currentExIndex < activeExercises.length - 1 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentExIndex(prev => prev + 1);
                              setActiveDrawer(null);
                              scrollToTop();
                            }}
                            className="btn btn-primary"
                            style={{
                              padding: '10px 22px', fontSize: 12.5, borderRadius: 12,
                              background: 'var(--brand-primary-light)', color: '#000',
                              fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8
                            }}
                          >
                            Next Exercise <ArrowRight size={15} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleFinishWorkout}
                            className="btn btn-primary"
                            style={{
                              padding: '10px 24px', fontSize: 13, borderRadius: 12,
                              background: '#10B981', color: '#000000', fontWeight: 700,
                              display: 'flex', alignItems: 'center', gap: 6,
                              boxShadow: '0 4px 16px rgba(16,185,129,0.35)'
                            }}
                          >
                            <Check size={15} strokeWidth={3} color="#000000" /> Complete Workout
                          </button>
                        )}
                      </div>
                  </div>
                ) : (
                  <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                    No exercises loaded in this workout session.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MOBILE CONSOLE WORKSPACE (FULL-WIDTH ZERO-OVERFLOW DEDICATED CONTAINER) */}
          <div className="block md:hidden w-full max-w-full" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
            <div style={{ padding: '10px 8px 110px 8px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
              {currentActiveEx ? (
                <ActiveExerciseView
                  exerciseName={currentActiveEx.name}
                  category={currentActiveEx.category || 'Compound'}
                  targetMuscles={formatConciseTarget(currentActiveEx)}
                  sets={currentActiveEx.sets.map((set, sIdx) => {
                    const prevFormatted = formatPreviousSet(currentActiveEx.name, sIdx);
                    const prevCompact = prevFormatted && prevFormatted !== '—' ? prevFormatted.replace(' kg × ', '×') : '—';
                    return {
                      id: set.id,
                      prev: prevCompact,
                      weight: set.weight,
                      reps: set.reps,
                      rpe: set.rpe || 8,
                      completed: !!set.completed,
                      isWarmup: set.isWarmup
                    };
                  })}
                  onUpdateSet={(idx, field, value) => handleUpdateSetField(currentExIndex, idx, field, value)}
                  onToggleComplete={(idx) => handleCheckoffSet(currentExIndex, idx)}
                  onAddSet={() => handleAddSet(false)}
                  onRemoveSet={() => handleRemoveSet(currentActiveEx.sets.length - 1)}
                  onOpenDrawer={(drawerKey) => setActiveDrawer(activeDrawer === drawerKey ? null : drawerKey)}
                  onOpenRpe={(setIdx) => setOpenRpePicker({ exIdx: currentExIndex, setIdx })}
                  onSwapExercise={() => setActiveDrawer(activeDrawer === 'swap' ? null : 'swap')}
                  onAddExercise={() => setShowExerciseSearchModal(true)}
                  showRpe={((generatedProgram?.profile?.trainingExperience || user?.trainingExperience || intakeForm?.trainingExperience || 'beginner').toLowerCase() !== 'beginner')}
                />
              ) : (
                <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No exercises loaded in this workout session.
                </div>
              )}
            </div>
          </div>

          {/* MOBILE STICKY BOTTOM ACTION BAR (Tier 4: Pacing & Directional Navigation) */}
          <div
            className="console-sticky-bottom-bar sticky bottom-0 bg-[#09090C]/95 backdrop-blur-md p-3 border-t border-zinc-800"
            style={{
              background: 'rgba(9, 9, 12, 0.95)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderTop: '1px solid #27272A',
              padding: 12
            }}
          >
            {/* Rest countdown strip if resting */}
            {restActive && (
              <div className="console-sticky-rest-strip" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={13} color={restRemaining <= 10 ? '#EF4444' : '#10B981'} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: restRemaining <= 10 ? '#EF4444' : '#10B981', letterSpacing: '0.02em' }}>
                    Rest: {formatMMSS(restRemaining)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => setRestRemaining(prev => prev + 30)}
                    className="console-rest-btn"
                  >
                    +30s
                  </button>
                  <button
                    type="button"
                    onClick={() => setRestActive(false)}
                    className="console-rest-btn"
                    style={{ fontWeight: 800, color: '#E4E4E7' }}
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}

            {/* Main navigation controls: Exactly 1 Prev and 1 Forward button */}
            <div className="console-sticky-actions-row">
              <button
                type="button"
                onClick={() => {
                  if (currentExIndex > 0) {
                    setCurrentExIndex(prev => prev - 1);
                    setActiveDrawer(null);
                    scrollToTop();
                  }
                }}
                disabled={currentExIndex === 0}
                className="console-sticky-nav-btn prev h-11 w-11 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  opacity: currentExIndex === 0 ? 0.35 : 1,
                  cursor: currentExIndex === 0 ? 'not-allowed' : 'pointer',
                  background: '#18181b',
                  border: '1px solid #27272A',
                  color: '#d4d4d8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
                aria-label="Previous Exercise"
              >
                <ArrowLeft size={16} />
              </button>

              {currentExIndex < activeExercises.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentExIndex(prev => prev + 1);
                    setActiveDrawer(null);
                    scrollToTop();
                  }}
                  className="console-sticky-nav-btn next h-11 flex-1 bg-[#10B981] hover:bg-[#059669] text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  style={{
                    height: 44,
                    borderRadius: 12,
                    background: '#10B981',
                    color: '#000000',
                    fontSize: 12,
                    fontWeight: 700,
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    flex: 1,
                    minWidth: 0,
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Next: {activeExercises[currentExIndex + 1]?.name}
                  </span>
                  <ArrowRight size={16} color="#000000" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishWorkout}
                  className="console-sticky-nav-btn finish h-11 flex-1 bg-[#10B981] hover:bg-[#059669] text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  style={{
                    height: 44,
                    borderRadius: 12,
                    background: '#10B981',
                    color: '#000000',
                    fontSize: 12,
                    fontWeight: 700,
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    flex: 1,
                    minWidth: 0,
                    cursor: 'pointer'
                  }}
                >
                  <Check size={17} strokeWidth={3} color="#000000" />
                  <span>Finish Workout</span>
                </button>
              )}
            </div>
          </div>

          {/* RPE EFFORT SELECTOR BOTTOM SHEET MODAL */}
          {openRpePicker && createPortal(
            <div className="app-modal-backdrop" onClick={() => setOpenRpePicker(null)} style={{ zIndex: 1200 }}>
              <div
                className="native-bottom-sheet fadeInUp"
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'var(--bg-surface)',
                  borderTop: '1px solid var(--border-subtle)',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  padding: '20px 20px calc(24px + env(safe-area-inset-bottom, 16px))',
                  boxShadow: '0 -10px 40px rgba(0,0,0,0.6)',
                  maxWidth: 480,
                  margin: '0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: -4 }}>
                  <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-subtle)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>
                      Rate of Perceived Exertion (RPE)
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      Set {activeExercises[openRpePicker.exIdx]?.sets?.[openRpePicker.setIdx]?.id || openRpePicker.setIdx + 1} • How close were you to muscular failure?
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenRpePicker(null)}
                    style={{ background: 'var(--bg-surface-raised)', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  >
                    <X size={15} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxHeight: '60vh', overflowY: 'auto' }}>
                  {[
                    { rpe: '10', title: '10 — Max Effort', desc: '0 Reps in Reserve (Failure)', color: '#EF4444' },
                    { rpe: '9.5', title: '9.5 — Near Failure', desc: 'Maybe 0–1 Rep in Reserve', color: '#F97316' },
                    { rpe: '9', title: '9 — Very Heavy', desc: '1 Rep in Reserve (1 RIR)', color: '#F59E0B' },
                    { rpe: '8.5', title: '8.5 — Heavy Load', desc: '1–2 Reps in Reserve', color: '#EAB308' },
                    { rpe: '8', title: '8 — Standard Working', desc: '2 Reps in Reserve (Optimal)', color: '#10B981' },
                    { rpe: '7.5', title: '7.5 — Moderate Working', desc: '2–3 Reps in Reserve', color: '#10B981' },
                    { rpe: '7', title: '7 — Speed / Technique', desc: '3 Reps in Reserve (Smooth)', color: '#06B6D4' },
                    { rpe: '6', title: '6 — Light Working', desc: '4+ Reps in Reserve', color: '#6366F1' },
                    { rpe: '5', title: '5 — Warm-up Set', desc: 'Submaximal / Prep', color: '#8B5CF6' },
                    { rpe: '4', title: '1–4 — Light / Bar', desc: 'Mobility & Feeder Set', color: '#9CA3AF' }
                  ].map(item => {
                    const isSelected = String(activeExercises[openRpePicker.exIdx]?.sets?.[openRpePicker.setIdx]?.rpe) === item.rpe;
                    return (
                      <button
                        key={item.rpe}
                        type="button"
                        onClick={() => {
                          handleUpdateSetField(openRpePicker.exIdx, openRpePicker.setIdx, 'rpe', item.rpe);
                          setOpenRpePicker(null);
                        }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 12,
                          background: isSelected ? 'var(--brand-primary-subtle)' : 'var(--bg-surface-raised)',
                          border: isSelected ? '1.5px solid var(--brand-primary-light)' : '1px solid var(--border-subtle)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 12.5, fontWeight: 800, color: isSelected ? 'var(--brand-primary-light)' : 'var(--text-primary)' }}>
                            {item.title}
                          </span>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.2 }}>
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      ) : programView === 'program' && generatedProgram ? (
        /* ==================== VIEW A2: 4-WEEK MESOCYCLE PROGRAM VIEW ==================== */
        <div className="fadeInUp w-full max-w-4xl mx-auto pb-28 px-3 sm:px-4">
          
          {/* 1. Precision Header Bar (Strict h-12 / 48px, Sticky, Vector Icons) */}
          <div 
            className="h-12 px-4 flex items-center justify-between border-b border-zinc-800/60 sticky top-0 z-30 mb-3 -mx-3 sm:-mx-4"
            style={{
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(9, 9, 12, 0.95)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              position: 'sticky',
              top: 0,
              zIndex: 30,
              marginBottom: 12
            }}
          >
            {/* Left: Back button as a minimal pill */}
            <button 
              type="button"
              onClick={() => { setProgramView('hub'); scrollToTop(); }} 
              style={{
                height: 32,
                padding: '0 10px',
                borderRadius: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#D4D4D8',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer'
              }}
              className="active:scale-95 transition"
            >
              <ChevronLeft size={16} /> Back
            </button>

            {/* Center: Routine Title in bold uppercase athletic typography */}
            <h2 style={{
              fontSize: 13,
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textAlign: 'center',
              margin: 0,
              flex: 1,
              padding: '0 8px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {formatCleanSplitName(generatedProgram.splitName)}
            </h2>

            {/* Right: Utility group (32x32px buttons) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <button 
                type="button"
                onClick={() => { setShowIntakeModal(true); setIntakeStep(0); }} 
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#A1A1AA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                className="active:scale-95 transition"
                title="Settings & Preferences"
                aria-label="Preferences"
              >
                <SlidersHorizontal size={14} />
              </button>
              <button 
                type="button"
                onClick={handleRegenerateProgram} 
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#A1A1AA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                className="active:scale-95 transition"
                title="Regenerate Plan"
                aria-label="Regenerate Plan"
              >
                <RotateCw size={14} />
              </button>
            </div>
          </div>

          {/* 2. Phase & Intensity Meta Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 4, marginBottom: 12, position: 'relative' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                type="button"
                onClick={() => setWeekDropdownOpen(prev => !prev)}
                style={{
                  height: 32,
                  padding: '0 12px',
                  borderRadius: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#E4E4E7',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
                className="active:scale-95 transition"
              >
                <span>{`Phase ${selectedWeek + 1}: ${WEEKS_METADATA[selectedWeek]?.phase || 'Base Calibration'}`}</span>
                <ChevronDown size={13} style={{ color: '#10B981', transform: weekDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
              </button>

              {weekDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setWeekDropdownOpen(false)} 
                  />
                  <div 
                    className="absolute left-0 top-full mt-1.5 z-30 w-64 rounded-xl shadow-2xl p-1.5 space-y-1"
                    style={{
                      backgroundColor: '#12141A',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 16px 36px rgba(0, 0, 0, 0.7)'
                    }}
                  >
                    {WEEKS_METADATA.map(wk => {
                      const isWkActive = selectedWeek === wk.num;
                      return (
                        <button
                          key={wk.num}
                          type="button"
                          onClick={() => {
                            setSelectedWeek(wk.num);
                            setWeekDropdownOpen(false);
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 12px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            backgroundColor: isWkActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                            border: isWkActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                            color: isWkActive ? '#10B981' : '#D4D4D8'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, backgroundColor: isWkActive ? '#10B981' : '#52525B' }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Phase {wk.num + 1}: {wk.phase}</span>
                          </div>
                          {isWkActive && <Check size={14} style={{ color: '#10B981', flexShrink: 0 }} />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Right: Phase target badge with glowing emerald indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#A1A1AA', flexShrink: 0 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981', flexShrink: 0 }} />
              <span style={{ fontWeight: 700, color: '#FFFFFF' }}>RPE {WEEKS_METADATA[selectedWeek]?.rpe || '7.0'}</span>
              <span style={{ color: '#52525B' }}>•</span>
              <span style={{ color: '#A1A1AA' }}>{WEEKS_METADATA[selectedWeek]?.tag || 'Base Load'}</span>
            </div>
          </div>

          {/* 3. Segmented Day Selector Track */}
          <div 
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 14,
              overflowX: 'auto',
              paddingBottom: 6,
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch'
            }}
            className="no-scrollbar"
          >
            {(generatedProgram.weeks[selectedWeek]?.days || []).map((day, dIdx) => {
              const isDayActive = selectedDay === dIdx;
              
              if (isDayActive && !day.isRest) {
                return (
                  <button
                    key={dIdx}
                    type="button"
                    onClick={() => setSelectedDay(dIdx)}
                    style={{
                      minWidth: 98,
                      padding: '8px 14px',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(16, 185, 129, 0.05) 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.65)',
                      boxShadow: '0 0 16px rgba(16, 185, 129, 0.2)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      scrollSnapAlign: 'start',
                      flexShrink: 0
                    }}
                    className="active:scale-95 transition select-none"
                  >
                    <span style={{ fontSize: 9, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em', color: '#10B981', display: 'block', lineHeight: 1.2 }}>
                      DAY {dIdx + 1}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF', display: 'block', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {day.dayName || day.sessionType || 'Workout'}
                    </span>
                  </button>
                );
              }

              if (isDayActive && day.isRest) {
                return (
                  <button
                    key={dIdx}
                    type="button"
                    onClick={() => setSelectedDay(dIdx)}
                    style={{
                      minWidth: 90,
                      padding: '8px 12px',
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      scrollSnapAlign: 'start',
                      flexShrink: 0
                    }}
                    className="active:scale-95 transition select-none"
                  >
                    <span style={{ fontSize: 9, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em', color: '#D4D4D8', display: 'block', lineHeight: 1.2 }}>
                      DAY {dIdx + 1}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF', display: 'block', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Rest Day
                    </span>
                  </button>
                );
              }

              if (day.isRest) {
                return (
                  <button
                    key={dIdx}
                    type="button"
                    onClick={() => setSelectedDay(dIdx)}
                    style={{
                      minWidth: 90,
                      padding: '8px 12px',
                      borderRadius: 12,
                      backgroundColor: 'transparent',
                      border: '1px dashed rgba(255, 255, 255, 0.09)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      scrollSnapAlign: 'start',
                      flexShrink: 0,
                      opacity: 0.65
                    }}
                    className="hover:opacity-90 active:scale-95 transition select-none"
                  >
                    <span style={{ fontSize: 9, color: '#71717A', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em', display: 'block', lineHeight: 1.2 }}>
                      DAY {dIdx + 1}
                    </span>
                    <span style={{ fontSize: 12, color: '#71717A', display: 'block', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Rest Day
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={dIdx}
                  type="button"
                  onClick={() => setSelectedDay(dIdx)}
                  style={{
                    minWidth: 98,
                    padding: '8px 14px',
                    borderRadius: 12,
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    scrollSnapAlign: 'start',
                    flexShrink: 0
                  }}
                  className="hover:border-zinc-700 active:scale-95 transition select-none"
                >
                  <span style={{ fontSize: 9, color: '#71717A', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em', display: 'block', lineHeight: 1.2 }}>
                    DAY {dIdx + 1}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#D4D4D8', display: 'block', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {day.dayName || day.sessionType || 'Workout'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 4 & 5. Active Day Details / Calm Rest State */}
          {(() => {
            const currentDayData = generatedProgram.weeks[selectedWeek]?.days?.[selectedDay];
            if (!currentDayData) return null;

            // Rest & Active Recovery Card (Zero emojis, pure vector semantics)
            if (currentDayData.isRest) {
              return (
                <div 
                  style={{
                    background: 'linear-gradient(180deg, #161922 0%, #0F1117 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 16,
                    padding: '20px 22px',
                    boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.6)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10B981' }}>
                        Active Recovery Protocol
                      </div>
                      <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.015em', color: '#FFFFFF', margin: '3px 0 0 0' }}>
                        Rest & Muscular Adaptation
                      </h3>
                      <p style={{ fontSize: 12, color: '#A1A1AA', margin: '2px 0 0 0' }}>
                        Muscles rebuild and adapt during rest. Prioritize passive repair and light movement today.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ marginTop: 18 }}>
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: 12,
                      padding: 14
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#E4E4E7', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Droplets size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                        <span>Hydration & Protein</span>
                      </div>
                      <p style={{ fontSize: 11.5, color: '#A1A1AA', margin: 0, lineHeight: 1.5 }}>
                        Drink 2.5–3.5L of water and maintain 1.6–2.2g/kg protein intake to fuel muscle tissue remodeling.
                      </p>
                    </div>

                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: 12,
                      padding: 14
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#E4E4E7', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Activity size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                        <span>Mobility & Recovery</span>
                      </div>
                      <p style={{ fontSize: 11.5, color: '#A1A1AA', margin: 0, lineHeight: 1.5 }}>
                        10–15 mins of gentle hip, thoracic spine, and shoulder flows or foam rolling to reduce muscular tightness.
                      </p>
                    </div>

                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: 12,
                      padding: 14
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#E4E4E7', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Footprints size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                        <span>Target Step Goal</span>
                      </div>
                      <p style={{ fontSize: 11.5, color: '#A1A1AA', margin: 0, lineHeight: 1.5 }}>
                        Aim for 7,000–10,000 light daily steps to promote systemic bloodflow without CNS fatigue.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            // Workout Day View
            const dayExercises = currentDayData.exercises || [];
            const totalSets = dayExercises.reduce((acc, e) => acc + (parseInt(e.sets) || 3), 0);
            const estMinutes = Math.max(25, Math.round(totalSets * 3));

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* 4. Session Briefing Card */}
                <div 
                  style={{
                    background: 'linear-gradient(180deg, #161922 0%, #0F1117 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.6)',
                    borderRadius: 16,
                    padding: '18px 20px',
                    marginBottom: 4
                  }}
                >
                  {/* Top Row: Meta Badge + Live Session Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10B981' }}>
                      DAY {String(selectedDay + 1).padStart(2, '0')} • TARGET PROTOCOL
                    </div>
                    {isSessionActive && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#10B981' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                        Active Session
                      </span>
                    )}
                  </div>

                  {/* Routine Session Title */}
                  <h3 style={{
                    fontSize: 18,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: '#FFFFFF',
                    margin: '4px 0 10px 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {currentDayData.dayName || currentDayData.sessionType || 'Workout Session'}
                  </h3>

                  {/* Telemetry row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      borderRadius: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#D4D4D8'
                    }}>
                      <Dumbbell size={12} style={{ color: '#A1A1AA', flexShrink: 0 }} />
                      <span>{dayExercises.length} Exercises</span>
                    </span>

                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      borderRadius: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#D4D4D8'
                    }}>
                      <Layers size={12} style={{ color: '#A1A1AA', flexShrink: 0 }} />
                      <span>{totalSets} Working Sets</span>
                    </span>

                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      borderRadius: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#D4D4D8'
                    }}>
                      <Timer size={12} style={{ color: '#A1A1AA', flexShrink: 0 }} />
                      <span>~{estMinutes} Minutes</span>
                    </span>
                  </div>

                  {/* Start Workout button strictly below telemetry with generous margin - ZERO OVERLAP */}
                  {!isSessionActive && (
                    <button
                      type="button"
                      onClick={() => handleStartGeneratedDay(currentDayData)}
                      style={{
                        marginTop: 14,
                        width: '100%',
                        height: 44,
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: '#000000',
                        fontWeight: 800,
                        fontSize: 13,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'all 0.15s ease'
                      }}
                      className="active:scale-[0.98]"
                    >
                      <Play size={14} fill="#000000" /> Start Workout
                    </button>
                  )}
                </div>

                {/* 5. Exercise Cards Section */}
                <div>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#71717A',
                    marginBottom: 10,
                    paddingLeft: 4
                  }}>
                    Movements ({dayExercises.length})
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {dayExercises.map((ex, exIdx) => {
                      const dbEntry = PRESET_EXERCISES.find(p => p.name === ex.name);
                      const rawAnatomy = dbEntry?.targetAnatomy || ex.targetAnatomy || ex.muscleGroup;
                      const anatomy = formatConciseAnatomyTarget(rawAnatomy, ex);
                      const isIsometric = /plank|hold|wall sit/i.test(ex.name);
                      const sets = ex.sets || 3;

                      return (
                        <div 
                          key={exIdx} 
                          style={{
                            background: 'linear-gradient(180deg, rgba(22, 25, 34, 0.9) 0%, rgba(15, 17, 23, 0.95) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.07)',
                            borderRadius: 16,
                            padding: '16px 18px',
                            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.35)',
                            transition: 'border-color 0.2s ease'
                          }}
                        >
                          {/* Top Row: Index + Title + Swap Action */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                              <span style={{
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: 12,
                                fontWeight: 700,
                                color: '#71717A',
                                width: 22,
                                flexShrink: 0
                              }}>
                                {String(exIdx + 1).padStart(2, '0')}
                              </span>
                              <h3 style={{
                                margin: 0,
                                fontSize: 15,
                                fontWeight: 700,
                                color: '#FFFFFF',
                                letterSpacing: '-0.015em',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {ex.name}
                              </h3>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => setSmartAltTarget({ ex, weekIdx: selectedWeek, dayIdx: selectedDay, exIdx, isConsole: false })}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 10,
                                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                color: '#A1A1AA',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                flexShrink: 0
                              }}
                              className="active:scale-95 transition"
                              title="Swap Exercise"
                              aria-label="Swap Exercise"
                            >
                              <Repeat size={13} style={{ color: '#10B981' }} />
                            </button>
                          </div>

                          {/* Subtitle Row: Muscle targets indented past 22px + 12px = 34px */}
                          {anatomy && (
                            <div style={{
                              marginLeft: 34,
                              marginBottom: 12,
                              fontSize: 11.5,
                              fontWeight: 500,
                              color: '#A1A1AA',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {anatomy}
                            </div>
                          )}

                          {/* Bottom Metrics Row indented at 34px */}
                          <div style={{
                            marginLeft: 34,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            flexWrap: 'wrap'
                          }}>
                            <span style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: 8,
                              padding: '5px 10px',
                              fontSize: 12,
                              color: '#D4D4D8',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}>
                              {isIsometric ? (
                                <>
                                  <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{sets}</span> Sets × <span style={{ color: '#FFFFFF', fontWeight: 700 }}>45–60s</span> Hold
                                </>
                              ) : (
                                <>
                                  <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{sets}</span> Sets × <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{ex.repRange || '8–12'}</span> Reps
                                </>
                              )}
                            </span>
                            <span style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: 8,
                              padding: '5px 10px',
                              fontSize: 12,
                              color: '#A1A1AA',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6
                            }}>
                              <Timer size={12} style={{ color: '#10B981', flexShrink: 0 }} />
                              <span>{formatRestIntervalBadge(ex.restSec)}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        /* ==================== VIEW A: WORKOUT HUB ==================== */
        <div className="fadeInUp">
          {/* UNIFIED STREAK & SHIELD CARD */}
          <div 
            style={{
              background: 'linear-gradient(180deg, #161922 0%, #0F1117 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.5)',
              borderRadius: 16,
              padding: '16px 20px',
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div 
                style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0.04) 70%)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  boxShadow: '0 0 14px rgba(16, 185, 129, 0.2)',
                  color: '#10B981', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0 
                }}
              >
                <Flame size={20} color="#10B981" />
              </div>
              <div>
                <span 
                  style={{ fontSize: 10, fontWeight: 800, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}
                >
                  TRAINING STREAK
                </span>
                <div 
                  style={{ fontSize: 16.5, fontWeight: 800, color: '#FFFFFF', marginTop: 2, letterSpacing: '-0.01em' }}
                >
                  {streak} {streak === 1 ? 'Workout' : 'Workouts'} This Week
                </div>
              </div>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={handleToggleStreakShield}
                style={{
                  background: streakShield ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: streakShield ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: streakShield ? '0 0 12px rgba(16, 185, 129, 0.2)' : 'none',
                  padding: '6px 14px',
                  borderRadius: 9999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  color: streakShield ? '#34D399' : '#D4D4D8',
                  fontSize: 12,
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
                className="active:scale-95 transition"
                title="Toggle Streak Shield"
              >
                <Shield size={13} color={streakShield ? '#10B981' : '#A1A1AA'} />
                <span>Streak Shield {streakShield ? 'Active' : 'Off'}</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  alert("Streak Shield protects your streak if you miss one day. Earn it by maintaining a 7-day streak.");
                }}
                title="Streak Shield protects your streak if you miss one day. Earn it by maintaining a 7-day streak."
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: '50%'
                }}
              >
                <Info size={14} />
              </button>
            </div>
          </div>

          {/* 4 SUB-TABS NAVIGATION (Pill Container) */}
          <div 
            style={{
              display: 'flex',
              gap: 4,
              background: '#12141A',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              padding: 4,
              borderRadius: 14,
              marginBottom: 20
            }}
          >
            {[
              { key: 'console', label: 'Routines' },
              { key: 'heatmap', label: 'Volume' },
              { key: 'prs', label: 'Records' },
              { key: 'history', label: 'History' }
            ].map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    flex: 1,
                    padding: '9px 10px',
                    fontSize: 12,
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: isActive ? 'linear-gradient(180deg, #222632 0%, #171922 100%)' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#71717A',
                    fontWeight: isActive ? 700 : 500,
                    border: isActive ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
                    boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.4)' : 'none',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                  className="active:scale-95 transition"
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: WORKOUT ROUTINES */}
          {activeTab === 'console' && (
            <div className="fadeInUp">
              {/* ACTIVE PROGRAM CARD (No Button Stacking, Max 2 Buttons) */}
              {generatedProgram ? (
                <div
                  style={{
                    background: 'linear-gradient(180deg, #161922 0%, #0F1117 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.5)',
                    borderRadius: 16,
                    padding: '20px 22px',
                    marginBottom: 24
                  }}
                >
                  {/* Top Meta Row */}
                  <div 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}
                  >
                    <span 
                      style={{ fontSize: 11, fontWeight: 800, color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}
                    >
                      <Sparkles size={13} color="#10B981" /> ACTIVE PROGRAM
                    </span>
                    <span 
                      style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#D4D4D8', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, border: '1px solid rgba(255, 255, 255, 0.08)' }}
                    >
                      Week {selectedWeek + 1} of {generatedProgram.weeks?.length || 4} • Day {selectedDay + 1}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 
                    style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', margin: '4px 0 2px', fontFamily: 'var(--font-heading)', letterSpacing: '-0.015em' }}
                  >
                    {formatCleanSplitName(generatedProgram.splitName)}
                  </h3>

                  {/* Subtitle */}
                  <p 
                    style={{ fontSize: 12, color: '#A1A1AA', margin: '4px 0 16px', lineHeight: 1.45 }}
                  >
                    Personalized 4-week progressive overload routine calibrated for strength and recovery.
                  </p>

                  {/* Action Buttons (Max 2, No Third Button) */}
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <button
                      type="button"
                      onClick={() => { setProgramView('program'); scrollToTop(); }}
                      style={{
                        height: 42,
                        padding: '0 18px',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: '#000000',
                        fontSize: 12.5,
                        fontWeight: 800,
                        borderRadius: 12,
                        border: 'none',
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                      }}
                      className="active:scale-[0.98] transition"
                    >
                      View Week {selectedWeek + 1} Plan →
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowIntakeModal(true); setIntakeStep(0); }}
                      style={{
                        height: 42,
                        padding: '0 16px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#D4D4D8',
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                      className="active:scale-95 transition"
                      title="Update preferences"
                    >
                      <Sliders size={13} />
                      <span>Preferences</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => { setShowIntakeModal(true); setIntakeStep(0); }}
                  style={{
                    background: 'linear-gradient(180deg, #161922 0%, #0F1117 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.5)',
                    borderRadius: 16,
                    padding: '20px 22px',
                    marginBottom: 24,
                    cursor: 'pointer'
                  }}
                  className="active:scale-[0.99] transition"
                >
                  <span 
                    style={{ fontSize: 11, fontWeight: 800, color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 6, letterSpacing: '0.06em' }}
                  >
                    <Sparkles size={13} color="#10B981" /> 4-Week periodized program
                  </span>
                  <h3 
                    style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', margin: '4px 0', fontFamily: 'var(--font-heading)', letterSpacing: '-0.015em' }}
                  >
                    Build 4-week plan
                  </h3>
                  <p 
                    style={{ fontSize: 12, color: '#A1A1AA', margin: '4px 0 16px', lineHeight: 1.45 }}
                  >
                    Personalize your training split, gym days, equipment, and injury protections to build a science-backed progressive overload routine.
                  </p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowIntakeModal(true); setIntakeStep(0); }}
                    style={{
                      height: 42,
                      padding: '0 18px',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: '#000000',
                      fontSize: 12.5,
                      fontWeight: 800,
                      borderRadius: 12,
                      border: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                    }}
                    className="active:scale-[0.98] transition"
                  >
                    <Sparkles size={14} color="#000000" /> Build 4-week plan
                  </button>
                </div>
              )}

              {/* SECTION HEADER: EXPLORE ROUTINES */}
              <div 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 2px' }}
              >
                <h4 
                  style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#A1A1AA', margin: 0 }}
                >
                  EXPLORE ROUTINES
                </h4>
                <span 
                  style={{ fontSize: 11, fontWeight: 600, color: '#71717A' }}
                >
                  ({ROUTINE_SPLITS.length} Splits)
                </span>
              </div>

              {/* VERTICAL LIST OF COMPACT ROUTINE CARDS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 80 }}>
                {ROUTINE_SPLITS.map((split, sIdx) => {
                  const cat = SPLIT_CATEGORIES[split.name] || { color: '#10B981', label: 'Split' };
                  return (
                    <div
                      key={sIdx}
                      onClick={() => setPreviewTemplate(split)}
                      style={{
                        background: 'linear-gradient(180deg, #161922 0%, #0F1117 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        borderRadius: 14,
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
                      }}
                      className="active:scale-[0.99] hover:border-zinc-700 transition"
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span 
                            style={{ 
                              fontSize: 9.5, 
                              fontWeight: 800, 
                              color: '#10B981',
                              textTransform: 'uppercase', 
                              letterSpacing: '0.06em' 
                            }}
                          >
                            {cat.label}
                          </span>
                        </div>
                        <h4 
                          style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {split.name}
                        </h4>
                        <p 
                          style={{ margin: '3px 0 0', fontSize: 11.5, color: '#71717A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {split.description}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <span 
                          style={{ fontSize: 11, fontWeight: 600, color: '#A1A1AA', padding: '4px 10px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.08)', whiteSpace: 'nowrap' }}
                        >
                          {split.exercises.length} exercises
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSplit(split);
                          }}
                          style={{
                            height: 32,
                            padding: '0 12px',
                            background: 'rgba(16, 185, 129, 0.08)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: 8,
                            color: '#34D399',
                            fontSize: 11.5,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                          className="active:scale-95 transition"
                        >
                          <span>Start</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: VOLUME & FATIGUE MAP (HIGH-PRECISION HORIZONTAL BAR CHART) */}
          {activeTab === 'heatmap' && (
            <div className="fadeInUp" style={{ background: 'linear-gradient(180deg, #161922 0%, #0F1117 100%)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: '22px clamp(16px, 3vw, 24px)', boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 18, margin: '0 0 4px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-heading)', letterSpacing: '-0.015em' }}>
                    Weekly Muscle Group Volume & Fatigue Map
                  </h3>
                  <p style={{ fontSize: 12, color: '#A1A1AA', margin: 0 }}>
                    Evidence-based hypertrophy guidelines recommend 10–20 hard sets per muscle group weekly.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10, fontSize: 11, fontWeight: 700, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#71717A' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: '#3F3F46' }} /> &lt;6 Low
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#F59E0B' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: '#F59E0B' }} /> 6–9 Maint.
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#10B981' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: '#10B981' }} /> 10–20 Optimal
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#818CF8' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: '#818CF8' }} /> &gt;20 High
                  </span>
                </div>
              </div>

              {/* Horizontal Volume Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(volumePerGroup).map(([group, sets]) => {
                  let statusColor = '#94A3B8';
                  let statusBadge = 'Below Baseline';
                  let statusBg = 'rgba(148, 163, 184, 0.1)';
                  let statusBorder = 'rgba(148, 163, 184, 0.2)';

                  if (sets >= 20) {
                    statusColor = '#818CF8';
                    statusBadge = 'Maximum Recoverable';
                    statusBg = 'rgba(129, 140, 248, 0.12)';
                    statusBorder = 'rgba(129, 140, 248, 0.3)';
                  } else if (sets >= 10) {
                    statusColor = '#10B981';
                    statusBadge = 'Optimal Hypertrophy';
                    statusBg = 'rgba(16, 185, 129, 0.12)';
                    statusBorder = 'rgba(16, 185, 129, 0.3)';
                  } else if (sets >= 6) {
                    statusColor = '#F59E0B';
                    statusBadge = 'Maintenance';
                    statusBg = 'rgba(245, 158, 11, 0.12)';
                    statusBorder = 'rgba(245, 158, 11, 0.3)';
                  }

                  const pct = Math.min(100, (sets / 20) * 100);

                  return (
                    <div
                      key={group}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: 14,
                        padding: '12px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF' }}>
                          {group}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 9999,
                            background: statusBg,
                            border: `1px solid ${statusBorder}`,
                            color: statusColor
                          }}>
                            {statusBadge}
                          </span>
                          <span className="tabular-nums" style={{ fontSize: 13, fontWeight: 900, color: statusColor }}>
                            {sets} <span style={{ fontSize: 11, color: '#71717A' }}>/ 16 sets</span>
                          </span>
                        </div>
                      </div>

                      {/* Progress Track with Zone Markers */}
                      <div style={{ position: 'relative', height: 8, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 4, overflow: 'hidden' }}>
                        {/* Optimal zone highlight (50% to 100% = 10 to 20 sets) */}
                        <div style={{
                          position: 'absolute',
                          left: '50%',
                          width: '50%',
                          height: '100%',
                          background: 'rgba(16, 185, 129, 0.08)',
                          borderLeft: '1px dashed rgba(16, 185, 129, 0.3)'
                        }} />

                        {/* Progress fill */}
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: statusColor,
                          borderRadius: 4,
                          transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PR HALL OF FAME & STRENGTH TREND */}
          {activeTab === 'prs' && (
            <div className="fadeInUp" style={{ background: 'linear-gradient(180deg, #161922 0%, #0F1117 100%)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: '22px clamp(16px, 3vw, 24px)', boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, margin: '0 0 4px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-heading)', letterSpacing: '-0.015em' }}>Big 4 PR Hall of Fame</h3>
                <p style={{ fontSize: 12, color: '#A1A1AA', margin: 0 }}>Tap any movement below to inspect its overload strength trend.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {PR_PATTERNS.map((pattern) => {
                  const pr = prHallOfFame[pattern.key];
                  const isSelected = selectedPrLift === pattern.key;
                  if (pr) {
                    return (
                      <div
                        key={pattern.key}
                        onClick={() => setSelectedPrLift(pattern.key)}
                        style={{
                          background: isSelected ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(16, 185, 129, 0.04) 100%)' : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? '1px solid rgba(16, 185, 129, 0.65)' : '1px solid rgba(255, 255, 255, 0.07)',
                          boxShadow: isSelected ? '0 0 16px rgba(16, 185, 129, 0.2)' : 'none',
                          borderRadius: 16,
                          padding: '16px 18px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        className="active:scale-95 transition"
                      >
                        <span style={{ fontSize: 10, color: '#10B981', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>
                          <Trophy size={13} color="#10B981" /> {pattern.label}
                        </span>
                        <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', marginBottom: 4, fontFamily: 'var(--font-heading)' }}>
                          {pr.weight} kg × {pr.reps}
                        </div>
                        <span style={{ fontSize: 11, color: '#71717A' }}>Logged {formatPrDate(pr.timestamp)}</span>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={pattern.key}
                      onClick={() => setSelectedPrLift(pattern.key)}
                      style={{
                        background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        border: isSelected ? '1px solid rgba(16, 185, 129, 0.5)' : '1px dashed rgba(255, 255, 255, 0.1)',
                        borderRadius: 16,
                        padding: '16px 18px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      className="active:scale-95 transition"
                    >
                      <span style={{ fontSize: 10, color: '#71717A', display: 'block', fontWeight: 800, letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>{pattern.label}</span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#A1A1AA', marginBottom: 4 }}>Baseline Movement</div>
                      <span style={{ fontSize: 11, color: '#71717A' }}>Tap to view progression curve</span>
                    </div>
                  );
                })}
              </div>

              {/* Interactive SVG Strength Trend Line Chart */}
              <div style={{ marginTop: 22 }}>
                <StrengthTrendChart
                  exerciseName={PR_PATTERNS.find(p => p.key === selectedPrLift)?.label || 'Barbell Bench Press'}
                  currentPr={prHallOfFame[selectedPrLift]?.weight || (selectedPrLift === 'bench' ? 85 : selectedPrLift === 'squat' ? 120 : selectedPrLift === 'deadlift' ? 140 : 55)}
                  unit="kg"
                  history={workoutHistory
                    .filter(w => (w.exercises || []).some(e => e.name.toLowerCase().includes(selectedPrLift)))
                    .map(w => {
                      const ex = (w.exercises || []).find(e => e.name.toLowerCase().includes(selectedPrLift));
                      const maxW = Math.max(...(ex?.sets || []).map(s => Number(s.weight) || 0), 0);
                      return {
                        date: new Date(w.timestamp).toISOString().split('T')[0],
                        weight: maxW,
                        reps: 5
                      };
                    })
                    .filter(h => h.weight > 0)
                  }
                />
              </div>
            </div>
          )}

          {/* TAB 4: TRAINING SESSIONS ARCHIVE */}
          {activeTab === 'history' && (
            <div className="fadeInUp" style={{ background: 'linear-gradient(180deg, #161922 0%, #0F1117 100%)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: 24, boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.5)' }}>
              <h3 style={{ fontSize: 18, margin: '0 0 4px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-heading)', letterSpacing: '-0.015em' }}>Training Sessions Archive</h3>
              <p style={{ fontSize: 12, color: '#A1A1AA', margin: '0 0 20px' }}>Complete historical record of completed workout logs.</p>

              {workoutHistory.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#71717A' }}>
                  <Dumbbell size={32} style={{ margin: '0 auto 12px', opacity: 0.5, color: '#71717A' }} />
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#D4D4D8' }}>No workouts logged yet</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#71717A' }}>Start any session from the templates or your mesocycle to begin building your archive.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {workoutHistory.map((session, idx) => (
                    <div key={session.id || idx} style={{
                      padding: '16px 18px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
                    }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>{session.workoutName}</h4>
                        <span style={{ fontSize: 11, color: '#71717A' }}>
                          {new Date(session.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} · {formatMMSS(session.duration || 0)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#D4D4D8', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          {session.totalSets || (session.exercises?.length * 3) || 12} sets
                        </span>
                        {session.totalVolume > 0 && (
                          <span style={{ fontSize: 12, fontWeight: 800, color: '#10B981', background: 'rgba(16, 185, 129, 0.12)', padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                            {Math.round(session.totalVolume)} kg
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}