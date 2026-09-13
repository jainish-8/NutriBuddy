const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Auto-heal EADDRINUSE by terminating any orphaned processes on port 5000
try {
  const { spawnSync } = require('child_process');
  const currentPid = process.pid;
  if (process.platform === 'win32') {
    const script = `
      $conn = Get-NetTCPConnection -LocalPort ${PORT} -ErrorAction SilentlyContinue;
      if ($conn) {
        $pids = $conn.OwningProcess | Select-Object -Unique;
        foreach ($p in $pids) {
          if ($p -and $p -ne ${currentPid}) {
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue;
          }
        }
      }
    `;
    spawnSync('powershell', ['-Command', script], { stdio: 'ignore' });
  } else {
    spawnSync('sh', ['-c', `lsof -t -i:${PORT} | xargs kill -9 2>/dev/null`], { stdio: 'ignore' });
  }
} catch (error) {
  // Ignore and continue startup if clearing fails
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// LOAD EXPANDED INDIAN FOODS DATABASE (80 items)
const foods = require('./data/indian_diet_db.json');

// In-memory data
let users = [];
let mealLogs = [];

// API ROUTES
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'NutriBuddy Server OK!', foodsCount: foods.length });
});

app.get('/api/foods', (req, res) => {
  const { search, category } = req.query;
  let filteredFoods = foods;

  if (search) {
    filteredFoods = filteredFoods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  }

  if (category && category !== 'all') {
    filteredFoods = filteredFoods.filter(f => f.category.toLowerCase() === category.toLowerCase());
  }

  res.json({ success: true, foods: filteredFoods });
});

function toTitleCase(str) {
  if (!str || typeof str !== 'string') return '';
  return str.split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '').join(' ');
}

app.post('/api/user-profile', (req, res) => {
  console.log('👤 USER PROFILE RECEIVED:', req.body);
  const user = req.body;
  if (user && user.fullName) {
    user.fullName = toTitleCase(user.fullName);
  }
  users.push(user);
  res.json({ success: true, user });
});

app.post('/api/log-meal', (req, res) => {
  console.log('✅ MEAL LOG RECEIVED:', req.body);
  const log = {
    id: Date.now(),
    userId: req.body.userId || 'demo',
    food: req.body.food,
    quantity: req.body.quantity,
    timestamp: new Date().toISOString()
  };
  mealLogs.push(log);
  res.json({ success: true, message: '✅ Meal logged to server!', logId: log.id });
});

app.post('/api/food-logs', (req, res) => {
  console.log('✅ FOOD LOG RECEIVED:', req.body);
  const log = {
    id: Date.now(),
    userId: req.body.userId,
    foodId: req.body.foodId,
    name: req.body.name,
    quantity: req.body.quantity,
    mealType: req.body.mealType,
    calories: req.body.calories,
    protein: req.body.protein,
    carbs: req.body.carbs,
    fat: req.body.fat,
    timestamp: req.body.timestamp || new Date().toISOString()
  };
  mealLogs.push(log);
  res.json({ success: true, message: '✅ Food logged to server!', logId: log.id });
});

app.get('/api/daily-logs/:userId', (req, res) => {
  const userId = req.params.userId;
  
  // Filter for logs belonging to today (local time / current date string)
  const todayStr = new Date().toISOString().split('T')[0];
  const userLogs = mealLogs.filter(log => {
    const isSameUser = String(log.userId) === String(userId);
    if (!isSameUser) return false;
    
    const logDate = log.timestamp ? log.timestamp.split('T')[0] : '';
    return logDate === todayStr;
  });

  const totals = userLogs.reduce((sum, log) => {
    sum.calories += Number(log.calories) || 0;
    sum.protein += Number(log.protein) || 0;
    sum.carbs += Number(log.carbs) || 0;
    sum.fat += Number(log.fat) || 0;
    return sum;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Round totals to 1 decimal place
  totals.calories = Math.round(totals.calories);
  totals.protein = Math.round(totals.protein * 10) / 10;
  totals.carbs = Math.round(totals.carbs * 10) / 10;
  totals.fat = Math.round(totals.fat * 10) / 10;

  res.json({ success: true, logs: userLogs, totals });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 NutriBuddy Server: http://localhost:${PORT}`);
  console.log(`✅ Health: http://localhost:${PORT}/api/health`);
  console.log(`📊 Foods: ${foods.length} items loaded`);
});
