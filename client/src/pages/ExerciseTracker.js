import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calculator, Disc, Info, Check, Plus, ArrowLeft, ArrowRight, 
  RotateCcw, Sparkles, Trophy, Flame, Shield, Clock, Dumbbell, 
  ChevronDown, X, Play, RefreshCw, AlertCircle, Award, Activity, Search
} from 'lucide-react';
import { generateProgram, formatRPE } from '../utils/programEngine';

// ===== PRESET EXERCISE DATABASE WITH PRECISE ANATOMY (38 exercises) =====
const PRESET_EXERCISES = [
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
  'Push Day (PPL)':             { color: '#F59E0B', label: 'Push / Pull / Legs' },
  'Pull Day (PPL)':             { color: '#38BDF8', label: 'Push / Pull / Legs' },
  'Legs Day (PPL)':             { color: '#10B981', label: 'Push / Pull / Legs' },
  'Arnold Split (Chest & Back)':   { color: '#C4B5FD', label: 'Arnold Split' },
  'Arnold Split (Shoulders & Arms)':{ color: '#C4B5FD', label: 'Arnold Split' },
  'Arnold Split (Legs & Lower)':   { color: '#C4B5FD', label: 'Arnold Split' },
  'Upper Body A':               { color: '#818CF8', label: 'Upper / Lower' },
  'Upper Body B':               { color: '#818CF8', label: 'Upper / Lower' },
  'Lower Body A':               { color: '#34D399', label: 'Upper / Lower' },
  'Lower Body B':               { color: '#34D399', label: 'Upper / Lower' },
  'Torso Hypertrophy':          { color: '#F472B6', label: 'Hypertrophy Split' },
  'Limbs Hypertrophy':          { color: '#F472B6', label: 'Hypertrophy Split' },
  'Arms & Core Focus':          { color: '#FCD34D', label: 'Accessory & Core' },
  'Powerlifting Squat Day':     { color: '#F87171', label: 'Powerlifting' },
  'Powerlifting Bench Day':     { color: '#F87171', label: 'Powerlifting' },
  'Powerlifting Deadlift Day':  { color: '#F87171', label: 'Powerlifting' },
  'Full Body Split':            { color: '#38BDF8', label: 'Full Body' },
};

const ROUTINE_SPLITS = WORKOUT_SPLITS;

const TIER_COLORS = {
  1: '#F59E0B',
  2: '#818CF8',
  3: '#10B981',
  4: '#F472B6'
};

const PR_PATTERNS = [
  { key: 'squat', label: 'Squat (1RM)' },
  { key: 'bench', label: 'Bench Press (1RM)' },
  { key: 'deadlift', label: 'Deadlift (1RM)' },
  { key: 'press', label: 'Overhead Press (1RM)' }
];

const MOTIVATIONAL_PR_QUOTES = [
  "Unstoppable! Every single kilo is proof of your hard work and discipline.",
  "New strength unlocked! You're operating on a whole new level today.",
  "Monumental lift! Progressive overload is turning you into a powerhouse.",
  "Crushed it! Champions are built one personal record at a time.",
  "Pure power! That weight didn't stand a chance.",
  "Look at that progress! Your consistency is truly paying off."
];

export default function ExerciseTracker({ user, setCurrentPage, onSessionStateChange }) {
  // Navigation & View Modes
  const [isConsoleMode, setIsConsoleMode] = useState(false);
  const [programView, setProgramView] = useState('hub'); // 'hub' | 'program'
  const [activeTab, setActiveTab] = useState('console'); // 'console' | 'heatmap' | 'prs' | 'history'

  // Data persistence
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [generatedProgram, setGeneratedProgram] = useState(null);

  // Active workout console states
  const [workoutName, setWorkoutName] = useState('Push Day');
  const [activeExercises, setActiveExercises] = useState([]);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [activeDrawer, setActiveDrawer] = useState(null); // null | 'anatomy' | 'warmup' | 'plates' | 'cues' | 'swap'
  const [openRpePicker, setOpenRpePicker] = useState(null); // { exIdx, setIdx }

  // Rest Timer States
  const [restRemaining, setRestRemaining] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const timerRef = useRef(null);

  // Active Duration Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const elapsedTimerRef = useRef(null);

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
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [showExerciseSearchModal, setShowExerciseSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState('all');

  const activeUserId = user?.id || 'demo';
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Body scroll lock effect whenever any modal is open
  useEffect(() => {
    if (showIntakeModal || showCancelConfirm || completedSummary || previewTemplate || prCelebration || showExerciseSearchModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showIntakeModal, showCancelConfirm, completedSummary, previewTemplate, prCelebration, showExerciseSearchModal]);

  // Close RPE picker on outside click
  useEffect(() => {
    const handleGlobalClick = () => setOpenRpePicker(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

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
        if (parsed && parsed.isConsoleMode && parsed.activeExercises?.length && (Date.now() - (parsed.timestamp || 0) < 6 * 3600 * 1000)) {
          setWorkoutName(parsed.workoutName || 'Push Day');
          setActiveExercises(parsed.activeExercises);
          setCurrentExIndex(parsed.currentExIndex || 0);
          setElapsedSeconds(parsed.elapsedSeconds || 0);
          setIsConsoleMode(true);
        }
      } catch (e) {}
    }
  }, [activeUserId]);

  // Auto-persist active workout session on any state change
  useEffect(() => {
    if (isConsoleMode && activeExercises.length > 0) {
      const payload = {
        isConsoleMode: true,
        workoutName,
        activeExercises,
        currentExIndex,
        elapsedSeconds,
        timestamp: Date.now()
      };
      localStorage.setItem(`nutribuddy_active_workout_${activeUserId}`, JSON.stringify(payload));
    } else if (!isConsoleMode) {
      localStorage.removeItem(`nutribuddy_active_workout_${activeUserId}`);
    }
  }, [isConsoleMode, workoutName, activeExercises, currentExIndex, elapsedSeconds, activeUserId]);

  // Notify parent of session state changes
  useEffect(() => {
    if (onSessionStateChange) {
      onSessionStateChange(isConsoleMode);
    }
  }, [isConsoleMode, onSessionStateChange]);

  // Elapsed Timer for active console
  useEffect(() => {
    if (isConsoleMode) {
      elapsedTimerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(elapsedTimerRef.current);
      setElapsedSeconds(0);
    }
    return () => clearInterval(elapsedTimerRef.current);
  }, [isConsoleMode]);

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

  const handleSwapExercise = (newExName) => {
    const dbEntry = PRESET_EXERCISES.find(p => p.name === newExName);
    if (!dbEntry || !activeExercises[currentExIndex]) return;
    const currentEx = activeExercises[currentExIndex];
    const updated = [...activeExercises];
    updated[currentExIndex] = {
      ...dbEntry,
      sets: createInitialSets(dbEntry.name)
    };
    setActiveExercises(updated);
    setActiveDrawer(null);
    showNotification('success', `Swapped ${currentEx.name} for ${newExName}!`);
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

  const handleGenerateProgram = () => {
    try {
      const program = generateProgram({
        gender: user?.gender || 'male',
        gymDays: user?.gymDays || 4,
        trainingExperience: intakeForm.trainingExperience || 'beginner',
        trainingGoal: intakeForm.trainingGoal || 'hypertrophy',
        equipment: intakeForm.equipment || 'full_gym',
        injuries: intakeForm.trainingInjuries || [],
        sessionTime: intakeForm.sessionTime || 60,
      }, PRESET_EXERCISES);
      setGeneratedProgram(program);
      localStorage.setItem(`nutribuddy_program_${activeUserId}`, JSON.stringify(program));
      setShowIntakeModal(false);
      setProgramView('program');
      showNotification('success', 'Personalized 4-week mesocycle generated successfully!');
    } catch (e) {
      console.error('Error generating program:', e);
      showNotification('error', 'Could not generate program. Please try again.');
    }
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
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '16px 20px', fontFamily: 'var(--font-body)', position: 'relative' }}>
      
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

              <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={13} /> CERTIFIED EXERCISE DATABASE
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 2px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Search & Add Exercise
              </h2>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
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
                      padding: '4px 10px',
                      borderRadius: 14,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: selectedMuscleFilter === m ? '1.5px solid var(--brand-primary, #F59E0B)' : '1px solid var(--border-subtle)',
                      background: selectedMuscleFilter === m ? 'rgba(245,158,11,0.14)' : 'var(--bg-surface-raised)',
                      color: selectedMuscleFilter === m ? 'var(--brand-primary, #F59E0B)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap'
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
                        borderRadius: 14,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                            {ex.name}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: 'rgba(245,158,11,0.12)', color: 'var(--brand-primary, #F59E0B)' }}>
                            {ex.muscleGroup}
                          </span>
                        </div>
                        {ex.targetAnatomy && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
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
                        style={{
                          padding: '8px 16px',
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: 'pointer',
                          background: isAlreadyInSession ? 'var(--bg-surface)' : 'var(--brand-primary, #F59E0B)',
                          color: isAlreadyInSession ? 'var(--text-muted)' : '#000',
                          border: isAlreadyInSession ? '1px solid var(--border-subtle)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Plus size={14} strokeWidth={3} /> {isAlreadyInSession ? 'Add Again' : 'Add to Session'}
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

              <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
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
                    background: intakeStep >= step ? 'var(--brand-primary, #F59E0B)' : 'var(--bg-surface-raised)',
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
                      { key: 'strength', label: 'Raw Strength', desc: 'CNS adaptation & high 1RM load' },
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
                            background: active ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-surface-raised)',
                            border: `1.5px solid ${active ? 'var(--brand-primary, #F59E0B)' : 'var(--border-subtle)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <h4 style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 800, color: active ? 'var(--brand-primary, #F59E0B)' : 'var(--text-primary)' }}>{opt.label}</h4>
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
                            background: active ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-surface-raised)',
                            border: `1.5px solid ${active ? 'var(--brand-primary, #F59E0B)' : 'var(--border-subtle)'}`,
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <h4 style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 800, color: active ? 'var(--brand-primary, #F59E0B)' : 'var(--text-primary)' }}>{opt.label}</h4>
                          <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>{opt.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border-subtle)', fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Info size={13} color="var(--brand-primary, #F59E0B)" />
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                    {[
                      { key: 'knee', label: 'Knee Issue', desc: 'Swaps deep knee flexion' },
                      { key: 'shoulder', label: 'Shoulder Issue', desc: 'Swaps extreme overhead' },
                      { key: 'lower_back', label: 'Lower Back', desc: 'Reduces axial load' }
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
                            background: active ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-surface-raised)',
                            border: `1.5px solid ${active ? 'var(--brand-primary, #F59E0B)' : 'var(--border-subtle)'}`,
                            color: active ? 'var(--brand-primary, #F59E0B)' : 'var(--text-secondary)',
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
                  onClick={handleGenerateProgram}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', borderRadius: 10, fontWeight: 800, fontSize: 12, background: 'var(--brand-primary, #F59E0B)', color: '#000', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Sparkles size={13} /> Build 4-Week Plan
                </button>
              )}
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Completed Workout Summary Modal (via React Portal) */}
      {completedSummary && createPortal(
        <div className="app-modal-backdrop">
          <div className="app-modal-dialog" style={{ maxWidth: 420, textAlign: 'center' }}>
            <div className="app-modal-body" style={{ padding: '28px 20px' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--brand-primary, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Award size={26} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                SESSION COMPLETED
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 900, margin: '4px 0 14px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                {completedSummary.name}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-surface-raised)', padding: 10, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', display: 'block' }}>DURATION</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>{formatMMSS(completedSummary.duration)}</span>
                </div>
                <div style={{ background: 'var(--bg-surface-raised)', padding: 10, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', display: 'block' }}>SETS</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>{completedSummary.totalSets}</span>
                </div>
                <div style={{ background: 'var(--bg-surface-raised)', padding: 10, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', display: 'block' }}>VOLUME</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)' }}>{Math.round(completedSummary.totalVolume)} kg</span>
                </div>
              </div>

              {completedSummary.newPrs && completedSummary.newPrs.length > 0 && (
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 10, padding: 10, marginBottom: 16, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 11, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)' }}>
                    <Trophy size={12} /> NEW PERSONAL RECORDS!
                  </div>
                  {completedSummary.newPrs.map((pr, i) => (
                    <div key={i} style={{ fontSize: 11, color: 'var(--text-primary)', padding: '2px 0' }}>
                      • <strong>{pr.exercise}</strong>: {pr.weight} kg × {pr.reps} reps
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setCompletedSummary(null)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px 0', borderRadius: 10, fontWeight: 800, fontSize: 12, background: 'var(--brand-primary, #F59E0B)', color: '#000' }}
              >
                Done & Save to Archive
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Real-Time PR Celebration Modal (via React Portal) */}
      {prCelebration && createPortal(
        <div className="app-modal-backdrop" onClick={() => setPrCelebration(null)}>
          <div className="pr-celebration-dialog" onClick={e => e.stopPropagation()} style={{ padding: '36px 28px' }}>
            
            {/* Confetti Particles */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' }}>
              {[
                { tx: '-120px', ty: '-160px', rot: '280deg', col: '#F59E0B', delay: '0ms' },
                { tx: '130px', ty: '-170px', rot: '320deg', col: '#10B981', delay: '50ms' },
                { tx: '-70px', ty: '-200px', rot: '180deg', col: '#818CF8', delay: '100ms' },
                { tx: '80px', ty: '-190px', rot: '220deg', col: '#F472B6', delay: '120ms' },
                { tx: '-150px', ty: '-90px', rot: '140deg', col: '#FCD34D', delay: '80ms' },
                { tx: '160px', ty: '-80px', rot: '260deg', col: '#38BDF8', delay: '40ms' },
                { tx: '0px', ty: '-220px', rot: '360deg', col: '#F59E0B', delay: '150ms' },
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
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.04) 70%)',
              border: '2px solid rgba(245, 158, 11, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              animation: 'trophyFloat 3s ease-in-out infinite',
              boxShadow: '0 0 30px rgba(245, 158, 11, 0.3)'
            }}>
              <Trophy size={40} color="#F59E0B" />
            </div>

            <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Flame size={14} fill="#F59E0B" /> NEW PERSONAL RECORD!
            </span>

            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', margin: '6px 0 2px', fontFamily: 'var(--font-heading)' }}>
              {prCelebration.exercise}
            </h2>

            <div style={{
              fontSize: 32,
              fontWeight: 900,
              color: 'var(--brand-primary, #F59E0B)',
              margin: '12px 0 6px',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em'
            }}>
              {prCelebration.weight} kg <span style={{ fontSize: 20, color: '#ffffff', fontWeight: 700 }}>× {prCelebration.reps} reps</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              {prCelebration.delta && (
                <span style={{ fontSize: 12, fontWeight: 800, background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 12px', borderRadius: 20 }}>
                  +{prCelebration.delta} kg over previous best
                </span>
              )}
              <span style={{ fontSize: 12, fontWeight: 800, background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', padding: '4px 12px', borderRadius: 20 }}>
                Est. 1RM: ~{prCelebration.est1RM} kg
              </span>
            </div>

            {/* Motivational Quote Box */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: 16,
              padding: '14px 18px',
              marginBottom: 22,
              fontStyle: 'italic',
              fontSize: 13,
              color: 'rgba(255, 255, 255, 0.9)',
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
                borderRadius: 14,
                fontWeight: 900,
                fontSize: 14,
                background: 'var(--brand-primary, #F59E0B)',
                color: '#000',
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.35)'
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
        <div className="app-modal-backdrop" onClick={() => setShowCancelConfirm(false)}>
          <div className="app-modal-dialog" style={{ maxWidth: 340, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div className="app-modal-body" style={{ padding: '24px 20px' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>Discard Active Session?</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.4 }}>
                Current set progress and timer will be cancelled.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontWeight: 700, fontSize: 11 }}
                >
                  Keep Lifting
                </button>
                <button
                  onClick={() => {
                    setIsConsoleMode(false);
                    setShowCancelConfirm(false);
                  }}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontWeight: 700, fontSize: 11, background: '#EF4444', color: '#fff' }}
                >
                  Discard
                </button>
              </div>
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
              boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
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
                fontSize: 10, fontWeight: 900,
                color: SPLIT_CATEGORIES[previewTemplate.name]?.color || 'var(--brand-primary, #F59E0B)',
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
                    borderRadius: 12,
                    padding: 14
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{exName}</h4>
                      <span style={{ fontSize: 9, fontWeight: 800, background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 6, color: 'var(--text-secondary)' }}>
                        {dbEntry.muscleGroup || 'Compound'}
                      </span>
                    </div>
                    {dbEntry.targetAnatomy && (
                      <div style={{ fontSize: 10, color: 'var(--brand-primary, #F59E0B)', fontWeight: 700, marginBottom: 2 }}>
                        Target: {dbEntry.targetAnatomy}
                      </div>
                    )}
                    {dbEntry.cues && dbEntry.cues.length > 0 && (
                      <p style={{ margin: '2px 0 0', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 4 }}>
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
                  width: '100%', padding: '12px 0', borderRadius: 12, fontWeight: 900, fontSize: 13,
                  background: 'var(--brand-primary, #F59E0B)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
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
          borderRadius: 24,
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* SINGLE CLEAN STICKY FLOATING TOP BAR */}
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            background: 'rgba(10, 10, 16, 0.88)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap'
          }}>
            {/* Left: Live Session Timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '6px 12px', borderRadius: 20
              }}>
                <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: '#EF4444', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}>
                  {formatMMSS(elapsedSeconds)}
                </span>
              </div>

              {/* Workout Routine Title Badge */}
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                {workoutName}
              </span>
            </div>

            {/* Right: Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={handleFinishWorkout}
                style={{
                  padding: '8px 20px', fontSize: 12, borderRadius: 12,
                  background: 'var(--brand-primary, #F59E0B)', color: '#000', border: 'none',
                  fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: '0 4px 16px rgba(245,158,11,0.3)'
                }}
              >
                <Check size={14} strokeWidth={3} /> Finish Workout
              </button>
              
              <button
                onClick={() => setShowCancelConfirm(true)}
                style={{
                  background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444',
                  padding: '8px 14px', fontSize: 12, borderRadius: 12, cursor: 'pointer', fontWeight: 700
                }}
              >
                Cancel
              </button>
            </div>
          </div>

          {/* ACTIVE REST TIMER BANNER */}
          {restActive && (
            <div style={{
              background: restRemaining <= 10 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.1)',
              borderBottom: `1px solid ${restRemaining <= 10 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.25)'}`,
              padding: '10px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              animation: 'fadeIn 0.2s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Clock size={16} color={restRemaining <= 10 ? '#EF4444' : 'var(--brand-primary, #F59E0B)'} />
                <span style={{ fontSize: 13, fontWeight: 800, color: restRemaining <= 10 ? '#EF4444' : 'var(--brand-primary, #F59E0B)' }}>
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

          {/* TWO-COLUMN CONSOLE WORKSPACE */}
          <div className="workout-console-layout">
            
            {/* LEFT COLUMN: Exercise Navigator */}
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
                        border: isCurrent ? '1.5px solid var(--brand-primary, #F59E0B)' : '1px solid var(--border-subtle)',
                        background: isCurrent ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-surface-raised)',
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
                          background: isAllDone ? '#10B981' : isCurrent ? 'var(--brand-primary, #F59E0B)' : 'var(--text-muted)'
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

            {/* RIGHT COLUMN: Active Exercise Logging Workspace */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {currentActiveEx ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  
                  {/* Exercise Header Card with Precise Anatomy Strip */}
                  <div style={{
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 18,
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                            {currentActiveEx.name}
                          </h2>
                          <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(245,158,11,0.12)', color: 'var(--brand-primary, #F59E0B)', padding: '3px 8px', borderRadius: 6 }}>
                            {currentActiveEx.category || 'Compound'}
                          </span>
                        </div>

                        {/* Exact Muscle Anatomy & Targeting Subtitle */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Activity size={13} color="var(--brand-primary, #F59E0B)" />
                            {currentActiveEx.targetAnatomy || currentActiveEx.muscleGroup}
                          </span>
                          {currentActiveEx.synergists && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              • Synergists: {currentActiveEx.synergists}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Personal Record Badge */}
                      <div style={{
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        borderRadius: 12,
                        padding: '8px 16px',
                        textAlign: 'right'
                      }}>
                        <span style={{ fontSize: 9, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                          <Trophy size={11} /> PERSONAL RECORD
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>
                          {activeExPR ? `${activeExPR.weight} kg × ${activeExPR.reps}` : 'No record logged'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Tools Strip */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {[
                        { key: 'anatomy', label: 'Anatomy Guide', icon: <Activity size={13} /> },
                        { key: 'warmup', label: 'Warm-Up Calc', icon: <Calculator size={13} /> },
                        { key: 'plates', label: 'Plate Loader', icon: <Disc size={13} /> },
                        { key: 'cues', label: 'Form Cues', icon: <Info size={13} /> },
                        { key: 'swap', label: 'Swap Exercise', icon: <RefreshCw size={13} /> }
                      ].map(btn => {
                        const active = activeDrawer === btn.key;
                        return (
                          <button
                            key={btn.key}
                            onClick={() => setActiveDrawer(active ? null : btn.key)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 20,
                              background: active ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-surface)',
                              border: `1px solid ${active ? 'var(--brand-primary, #F59E0B)' : 'var(--border-subtle)'}`,
                              color: active ? 'var(--brand-primary, #F59E0B)' : 'var(--text-secondary)',
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {btn.icon}
                            {btn.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* TOOL ACCORDION DRAWERS */}
                  {activeDrawer === 'anatomy' && (
                    <div className="fadeInUp" style={{ padding: 18, background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 16 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary, #F59E0B)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>
                        Detailed Biomechanical & Muscle Targeting Profile
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 12 }}>
                        <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', fontWeight: 800 }}>PRIMARY MOVER</span>
                          <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{currentActiveEx.targetAnatomy || currentActiveEx.muscleGroup}</span>
                        </div>
                        <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', fontWeight: 800 }}>ASSISTING SYNERGISTS</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{currentActiveEx.synergists || 'Stabilizing Core'}</span>
                        </div>
                        <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', fontWeight: 800 }}>MOVEMENT PLANE</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{currentActiveEx.movementPlane || currentActiveEx.category}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDrawer === 'cues' && (
                    <div className="fadeInUp" style={{ padding: 18, background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 16 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary, #F59E0B)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>
                        Key Coaching & Performance Cues
                      </span>
                      {currentActiveEx.cues && currentActiveEx.cues.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                          {currentActiveEx.cues.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      ) : (
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Focus on controlled eccentric lowering and explosive contraction.</p>
                      )}
                    </div>
                  )}

                  {activeDrawer === 'warmup' && (
                    <div className="fadeInUp" style={{ padding: 18, background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary, #F59E0B)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Warm-Up Ramp Protocol
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          Target Working Weight: <strong>{currentActiveEx.sets[0]?.weight || 60} kg</strong>
                        </span>
                      </div>
                      {(() => {
                        const target = parseFloat(currentActiveEx.sets[0]?.weight) || 60;
                        const w1 = Math.round(target * 0.5);
                        const w2 = Math.round(target * 0.7);
                        const w3 = Math.round(target * 0.85);
                        return (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
                            <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>Bar / Light (50%)</span>
                              <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>{w1} kg × 10</span>
                            </div>
                            <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>Feeder (70%)</span>
                              <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>{w2} kg × 5</span>
                            </div>
                            <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>Primer (85%)</span>
                              <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>{w3} kg × 2</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {activeDrawer === 'plates' && (
                    <div className="fadeInUp" style={{ padding: 18, background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 16 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary, #F59E0B)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>
                        Barbell Plate Stacker (Per Side on 20kg Bar)
                      </span>
                      {(() => {
                        const target = parseFloat(currentActiveEx.sets[0]?.weight) || 60;
                        const plates = calculatePlates(target);
                        return (
                          <div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
                              Load per side for <strong>{target} kg</strong>:
                            </div>
                            {plates.length > 0 ? (
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {plates.map((p, pIdx) => (
                                  <span key={pIdx} style={{
                                    background: p >= 20 ? '#2563EB' : p >= 10 ? '#16A34A' : '#D97706',
                                    color: '#fff', padding: '6px 12px', borderRadius: 8, fontWeight: 900, fontSize: 12
                                  }}>
                                    {p} kg
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Load empty bar (20 kg) or dumbbells.</span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {activeDrawer === 'swap' && (
                    <div className="fadeInUp" style={{ padding: 18, background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 16 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary, #F59E0B)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 10 }}>
                        Substitute / Swap {currentActiveEx.name}
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                        {PRESET_EXERCISES.filter(p => p.name !== currentActiveEx.name && p.category === currentActiveEx.category).slice(0, 6).map(subEx => (
                          <button
                            key={subEx.name}
                            onClick={() => handleSwapExercise(subEx.name)}
                            style={{
                              padding: '10px 14px', borderRadius: 10, background: 'var(--bg-surface)',
                              border: '1px solid var(--border-subtle)', color: 'var(--text-primary)',
                              fontSize: 12, fontWeight: 700, textAlign: 'left', cursor: 'pointer',
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}
                          >
                            <span>{subEx.name}</span>
                            <span style={{ fontSize: 10, color: 'var(--brand-primary, #F59E0B)', display: 'flex', alignItems: 'center', gap: 2 }}>
                              Swap <ArrowRight size={10} />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SET MATRIX TABLE */}
                  <div style={{
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 18,
                    padding: 20,
                    overflowX: 'auto'
                  }}>
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
                      <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>SET</span>
                      <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PREVIOUS</span>
                      <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>WEIGHT (KG)</span>
                      <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>REPS</span>
                      <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>RPE</span>
                      <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>DONE</span>
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
                              background: set.completed ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface)',
                              border: set.completed ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border-subtle)',
                              borderLeft: set.completed ? '4px solid #10B981' : '4px solid transparent',
                              borderRadius: 12,
                              padding: '8px 8px',
                              transition: 'all 0.18s ease'
                            }}
                          >
                            {/* Set Number / Warmup Badge with check indicator */}
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: set.completed ? 'rgba(16, 185, 129, 0.25)' : set.isWarmup ? 'rgba(129, 140, 248, 0.15)' : 'var(--bg-surface-raised)',
                              border: `1.5px solid ${set.completed ? '#10B981' : set.isWarmup ? '#818CF8' : 'var(--border-subtle)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 900, color: set.completed ? '#10B981' : set.isWarmup ? '#818CF8' : 'var(--text-primary)'
                            }}>
                              {set.completed ? <Check size={14} strokeWidth={3.5} /> : set.isWarmup ? `W${set.id}` : set.id}
                            </div>

                            {/* Previous Session Value */}
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                              {prevFormatted}
                            </span>

                            {/* Weight Input */}
                            <div style={{ position: 'relative' }}>
                              <input
                                type="number"
                                step="0.5"
                                placeholder="0.0"
                                value={set.weight}
                                disabled={set.completed}
                                onChange={(e) => handleUpdateSetField(currentExIndex, setIdx, 'weight', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  fontSize: 13,
                                  fontWeight: 800,
                                  textAlign: 'center',
                                  background: set.completed ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-input)',
                                  border: `1px solid ${set.completed ? 'rgba(16, 185, 129, 0.4)' : isPr ? 'var(--brand-primary, #F59E0B)' : 'var(--border-subtle)'}`,
                                  borderRadius: 10,
                                  color: 'var(--text-primary)',
                                  outline: 'none'
                                }}
                              />
                              {(set.isPR || isPr) && (
                                <div className="pr-badge-shine" style={{
                                  position: 'absolute', top: -9, right: -4,
                                  color: '#000', fontSize: 9, fontWeight: 900,
                                  padding: '1px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3,
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)', pointerEvents: 'none', zIndex: 5
                                }}>
                                  <Trophy size={10} /> PR
                                </div>
                              )}
                            </div>

                            {/* Reps Input */}
                            <div>
                              <input
                                type="number"
                                placeholder="0"
                                value={set.reps}
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

                            {/* RPE Selector */}
                            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                              <button
                                disabled={set.completed}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setOpenRpePicker(
                                    openRpePicker?.exIdx === currentExIndex && openRpePicker?.setIdx === setIdx
                                      ? null
                                      : { exIdx: currentExIndex, setIdx }
                                  );
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  background: set.completed ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-input)',
                                  border: `1px solid ${set.completed ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
                                  borderRadius: 10,
                                  color: 'var(--text-primary)',
                                  fontSize: 12,
                                  fontWeight: 800,
                                  cursor: set.completed ? 'default' : 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <span>RPE {set.rpe}</span>
                                <ChevronDown size={12} color="var(--text-muted)" />
                              </button>

                              {/* RPE Floating Popover */}
                              {openRpePicker?.exIdx === currentExIndex && openRpePicker?.setIdx === setIdx && (
                                <div style={{
                                  position: 'absolute', bottom: '115%', left: '50%', transform: 'translateX(-50%)',
                                  background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                                  borderRadius: 14, padding: 8, display: 'flex', gap: 6, zIndex: 200,
                                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                }}>
                                  {['6', '7', '8', '9', '10'].map(val => (
                                    <button
                                      key={val}
                                      onClick={() => {
                                        handleUpdateSetField(currentExIndex, setIdx, 'rpe', val);
                                        setOpenRpePicker(null);
                                      }}
                                      style={{
                                        width: 32, height: 32, borderRadius: 8,
                                        background: set.rpe === val ? 'var(--brand-primary, #F59E0B)' : 'var(--bg-surface-raised)',
                                        color: set.rpe === val ? '#000' : 'var(--text-primary)',
                                        fontWeight: 900, fontSize: 12, border: 'none', cursor: 'pointer'
                                      }}
                                    >
                                      {val}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* CLEAR TACTILE DONE BUTTON WITH INSTANT FEEDBACK */}
                            <button
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

                    {/* Add Set & Remove Set Actions */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleAddSet(false)}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: 12, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <Plus size={14} /> Add Set
                      </button>
                      <button
                        onClick={() => handleAddSet(true)}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: 12, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, color: '#818CF8' }}
                      >
                        + Add Warm-Up Set
                      </button>
                      {currentActiveEx.sets.length > 1 && (
                        <button
                          onClick={() => handleRemoveSet(currentActiveEx.sets.length - 1)}
                          className="btn btn-secondary"
                          style={{ padding: '8px 14px', fontSize: 12, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}
                        >
                          - Remove Last Set
                        </button>
                      )}
                    </div>
                  </div>

                  {/* BOTTOM EXERCISE PAGINATION NAVIGATION */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, gap: 12 }}>
                    {currentExIndex > 0 ? (
                      <button
                        onClick={() => {
                          setCurrentExIndex(prev => prev - 1);
                          setActiveDrawer(null);
                          scrollToTop();
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '10px 18px', fontSize: 12, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <ArrowLeft size={14} /> Previous: {activeExercises[currentExIndex - 1]?.name}
                      </button>
                    ) : <div />}

                    {currentExIndex < activeExercises.length - 1 ? (
                      <button
                        onClick={() => {
                          setCurrentExIndex(prev => prev + 1);
                          setActiveDrawer(null);
                          scrollToTop();
                        }}
                        className="btn btn-primary"
                        style={{ padding: '10px 22px', fontSize: 13, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        Next: {activeExercises[currentExIndex + 1]?.name} <ArrowRight size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={handleFinishWorkout}
                        className="btn btn-primary"
                        style={{ padding: '10px 24px', fontSize: 13, borderRadius: 12, background: '#10B981', color: '#000', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <Check size={14} strokeWidth={3} /> Complete Workout
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
        </div>
      ) : programView === 'program' && generatedProgram ? (
        /* ==================== VIEW A2: 4-WEEK MESOCYCLE PROGRAM VIEW ==================== */
        <div className="fadeInUp">
          
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <button 
                onClick={() => setProgramView('hub')} 
                style={{ background: 'none', border: 'none', color: 'var(--brand-primary, #F59E0B)', fontSize: 12, fontWeight: 800, cursor: 'pointer', padding: 0, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <ArrowLeft size={14} /> Back to Workout Hub
              </button>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                {generatedProgram.splitName}
              </h2>
            </div>

            <button 
              onClick={() => { setShowIntakeModal(true); setIntakeStep(0); }} 
              className="btn btn-secondary" 
              style={{ padding: '8px 16px', fontSize: 12, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RotateCcw size={13} /> Regenerate Plan
            </button>
          </div>

          {/* 4-WEEK PERIODIZATION TIMELINE SELECTOR */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
            {[
              { num: 0, title: 'Week 1: Accumulation', tag: 'RPE 7-8 · Volume Base' },
              { num: 1, title: 'Week 2: Intensification', tag: 'RPE 8-9 · Progressive Load' },
              { num: 2, title: 'Week 3: Overreach', tag: 'RPE 9-10 · Max CNS Stimulus' },
              { num: 3, title: 'Week 4: Deload', tag: 'RPE 6-7 · Supercompensation' }
            ].map(wk => {
              const active = selectedWeek === wk.num;
              return (
                <button
                  key={wk.num}
                  onClick={() => setSelectedWeek(wk.num)}
                  style={{
                    padding: '14px 12px',
                    borderRadius: 14,
                    background: active ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-surface)',
                    border: `1.5px solid ${active ? 'var(--brand-primary, #F59E0B)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 900, color: active ? 'var(--brand-primary, #F59E0B)' : 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                    PHASE {wk.num + 1}
                  </span>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{wk.title}</div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{wk.tag}</span>
                </button>
              );
            })}
          </div>

          {/* DAY SELECTOR STRIP */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
            {(generatedProgram.weeks[selectedWeek]?.days || []).map((day, dIdx) => {
              const active = selectedDay === dIdx;
              return (
                <button
                  key={dIdx}
                  onClick={() => !day.isRest && setSelectedDay(dIdx)}
                  style={{
                    flexShrink: 0,
                    padding: '10px 16px',
                    borderRadius: 12,
                    border: day.isRest ? '1px dashed var(--border-subtle)' : `1.5px solid ${active ? 'var(--brand-primary, #F59E0B)' : 'var(--border-subtle)'}`,
                    background: day.isRest ? 'rgba(255,255,255,0.02)' : active ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-surface)',
                    color: day.isRest ? 'var(--text-muted)' : active ? 'var(--brand-primary, #F59E0B)' : 'var(--text-secondary)',
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: day.isRest ? 'default' : 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <div>{day.dayLabel}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.8 }}>
                    {day.isRest ? 'Rest' : day.sessionType}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ACTIVE DAY WORKOUT CARD */}
          {(() => {
            const currentDayData = generatedProgram.weeks[selectedWeek]?.days?.[selectedDay];
            if (!currentDayData) return null;
            if (currentDayData.isRest) {
              return (
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 20, padding: '48px 24px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)' }}>Rest & Recovery Day</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Rest allows muscle fibers to repair and supercompensate.</p>
                </div>
              );
            }

            return (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {currentDayData.dayLabel} · {currentDayData.sessionType}
                    </span>
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', margin: '2px 0 0' }}>
                      {currentDayData.dayName || currentDayData.sessionType}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleStartGeneratedDay(currentDayData)}
                    className="btn btn-primary"
                    style={{ padding: '10px 24px', borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'var(--brand-primary, #F59E0B)', color: '#000' }}
                  >
                    <Play size={14} fill="currentColor" /> Start This Workout
                  </button>
                </div>

                {/* Exercises list */}
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {(currentDayData.exercises || []).map((ex, exIdx) => {
                    const rpeInfo = formatRPE(ex.rpeTarget);
                    const dbEntry = PRESET_EXERCISES.find(p => p.name === ex.name);
                    return (
                      <div key={exIdx} style={{
                        background: 'var(--bg-surface-raised)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 16,
                        padding: 18
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 6,
                              background: `${TIER_COLORS[ex.tier]}18`, color: TIER_COLORS[ex.tier], border: `1px solid ${TIER_COLORS[ex.tier]}35`
                            }}>
                              T{ex.tier}
                            </span>
                            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{ex.name}</h4>
                          </div>

                          <div style={{ display: 'flex', gap: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 8, background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                              {ex.sets} × {ex.repRange} reps
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                              {rpeInfo.shortLabel}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                              {ex.restSec}s rest
                            </span>
                          </div>
                        </div>

                        {/* Exact Target Anatomy Subtitle */}
                        {dbEntry?.targetAnatomy && (
                          <div style={{ fontSize: 11, color: 'var(--brand-primary, #F59E0B)', fontWeight: 700, margin: '4px 0 2px' }}>
                            Target: {dbEntry.targetAnatomy}
                          </div>
                        )}

                        {ex.progressionRule && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 4 }}>
                            Overload: {ex.progressionRule}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        /* ==================== VIEW A: WORKOUT HUB ==================== */
        <div className="fadeInUp">
          
          {/* TOP HERO BANNER: Active Mesocycle Resume or Generator CTA */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(129, 140, 248, 0.08) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 24,
            padding: '24px 28px',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--brand-primary, #F59E0B)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} /> CERTIFIED PERIODIZATION ENGINE
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0', fontFamily: 'var(--font-heading)' }}>
                {generatedProgram ? generatedProgram.splitName : 'Build Your Personalized 4-Week Mesocycle'}
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                {generatedProgram ? 'Periodized weekly loading, autoregulated RPE thresholds, and volume validation.' : 'NSCA & ACSM certified principles tailored to your exact equipment, goal, and injury history.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {generatedProgram && (
                <button
                  onClick={() => { setProgramView('program'); scrollToTop(); }}
                  className="btn btn-primary"
                  style={{ padding: '11px 22px', borderRadius: 12, fontWeight: 800, fontSize: 13, background: 'var(--brand-primary, #F59E0B)', color: '#000' }}
                >
                  View Active Mesocycle →
                </button>
              )}
              <button
                onClick={() => { setShowIntakeModal(true); setIntakeStep(0); }}
                className="btn btn-secondary"
                style={{ padding: '11px 20px', borderRadius: 12, fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Sparkles size={13} /> {generatedProgram ? 'Regenerate Plan' : 'Generate 4-Week Plan'}
              </button>
            </div>
          </div>

          {/* STREAK & STATS BAR */}
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 20, padding: '16px 24px', marginBottom: 24,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--brand-primary, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Flame size={20} />
                </div>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>WEEKLY STREAK</span>
                  <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)' }}>{streak} Workouts Logged</div>
                </div>
              </div>

              <div style={{ width: 1, height: 28, background: 'var(--border-subtle)' }} />

              <button
                onClick={handleToggleStreakShield}
                style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'left' }}
              >
                <Shield size={18} color={streakShield ? 'var(--brand-primary, #F59E0B)' : 'var(--text-muted)'} />
                <div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: streakShield ? 'var(--brand-primary, #F59E0B)' : 'var(--text-secondary)', display: 'block' }}>Streak Shield</span>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{streakShield ? 'ACTIVE' : 'INACTIVE'}</span>
                </div>
              </button>
            </div>
          </div>

          {/* 4 SUB-TABS NAVIGATION */}
          <div style={{ display: 'flex', gap: 6, background: 'var(--bg-surface-raised)', padding: 6, borderRadius: 14, marginBottom: 24 }}>
            {[
              { key: 'console', label: 'Workout Routines (17 Splits)' },
              { key: 'heatmap', label: 'Volume & Fatigue Map' },
              { key: 'prs', label: 'PR Hall of Fame' },
              { key: 'history', label: 'Training Sessions Archive' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1, padding: '10px 0', fontSize: 13, fontWeight: 800, borderRadius: 10, cursor: 'pointer',
                  background: activeTab === tab.key ? 'var(--bg-surface)' : 'transparent',
                  color: activeTab === tab.key ? 'var(--brand-primary, #F59E0B)' : 'var(--text-muted)',
                  border: activeTab === tab.key ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  boxShadow: activeTab === tab.key ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: WORKOUT ROUTINES (17 Splits) */}
          {activeTab === 'console' && (
            <div className="fadeInUp">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {ROUTINE_SPLITS.map((split, sIdx) => {
                  const cat = SPLIT_CATEGORIES[split.name] || { color: '#818CF8', label: 'SPLIT' };
                  return (
                    <div
                      key={sIdx}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 18,
                        padding: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => setPreviewTemplate(split)}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-primary, #F59E0B)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                    >
                      <div>
                        <span style={{ fontSize: 9, fontWeight: 900, color: cat.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {cat.label}
                        </span>
                        <h4 style={{ margin: '6px 0 4px', fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{split.name}</h4>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{split.description}</p>
                      </div>

                      <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{split.exercises.length} exercises</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSplit(split);
                          }}
                          style={{
                            padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 800,
                            background: 'rgba(245, 158, 11, 0.1)', color: 'var(--brand-primary, #F59E0B)', border: '1px solid rgba(245, 158, 11, 0.25)',
                            cursor: 'pointer'
                          }}
                        >
                          Start Workout →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: VOLUME & FATIGUE MAP */}
          {activeTab === 'heatmap' && (
            <div className="fadeInUp" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 20, padding: 28 }}>
              <h3 style={{ fontSize: 18, margin: '0 0 4px', fontWeight: 900, color: 'var(--text-primary)' }}>Weekly Muscle Group Volume & Fatigue Map</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 24px' }}>Optimal hypertrophy stimulus targets 10–20 hard working sets per muscle group weekly.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {Object.entries(volumePerGroup).map(([group, sets]) => (
                  <div key={group} style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{group}</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: sets >= 10 ? '#10B981' : 'var(--brand-primary, #F59E0B)' }}>{sets} sets</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--bg-input)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (sets / 20) * 100)}%`, height: '100%', background: sets >= 10 ? '#10B981' : 'var(--brand-primary, #F59E0B)', borderRadius: 4, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PR HALL OF FAME */}
          {activeTab === 'prs' && (
            <div className="fadeInUp" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 20, padding: 28 }}>
              <h3 style={{ fontSize: 18, margin: '0 0 4px', fontWeight: 900, color: 'var(--text-primary)' }}>Big 4 PR Hall of Fame</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 24px' }}>All-time personal bests across primary compound movements.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {PR_PATTERNS.map((pattern) => {
                  const pr = prHallOfFame[pattern.key];
                  if (pr) {
                    return (
                      <div key={pattern.key} style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 20 }}>
                        <span style={{ fontSize: 10, color: 'var(--brand-primary, #F59E0B)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 900, letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>
                          <Trophy size={13} /> {pattern.label}
                        </span>
                        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>
                          {pr.weight} kg × {pr.reps}
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Logged {formatPrDate(pr.timestamp)}</span>
                      </div>
                    );
                  }
                  return (
                    <div key={pattern.key} style={{ background: 'var(--bg-surface-raised)', border: '1px dashed var(--border-subtle)', borderRadius: 16, padding: 20, opacity: 0.6 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', fontWeight: 800, letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>{pattern.label}</span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>Locked Movement</div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Complete a session to record PR</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: TRAINING SESSIONS ARCHIVE */}
          {activeTab === 'history' && (
            <div className="fadeInUp" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 20, padding: 28 }}>
              <h3 style={{ fontSize: 18, margin: '0 0 4px', fontWeight: 900, color: 'var(--text-primary)' }}>Training Sessions Archive</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 24px' }}>Complete historical record of completed workout logs.</p>

              {workoutHistory.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Dumbbell size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>No workouts logged yet</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12 }}>Start any session from the templates or your mesocycle to begin building your archive.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {workoutHistory.map((session, idx) => (
                    <div key={session.id || idx} style={{
                      padding: 18, background: 'var(--bg-surface-raised)', borderRadius: 16, border: '1px solid var(--border-subtle)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
                    }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{session.workoutName}</h4>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {new Date(session.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} · {formatMMSS(session.duration || 0)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                          {session.totalSets || (session.exercises?.length * 3) || 12} sets
                        </span>
                        {session.totalVolume > 0 && (
                          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--brand-primary, #F59E0B)', background: 'rgba(245,158,11,0.08)', padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
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