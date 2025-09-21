const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// ===== MIDDLEWARE =====
app.use(cors({
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ===== IN-MEMORY STORAGE =====
let users = [];
let foods = [
  // Complete Indian Foods Database - 30+ items
  { id: 1, name: "Rice (1 cup)", calories: 205, protein: 4, carbs: 45, fat: 0.5, category: "grains", price: 15 },
  { id: 2, name: "Roti (1 piece)", calories: 71, protein: 3, carbs: 15, fat: 0.4, category: "grains", price: 5 },
  { id: 3, name: "Dal (1 cup)", calories: 230, protein: 18, carbs: 40, fat: 0.8, category: "protein", price: 25 },
  { id: 4, name: "Chicken Breast (100g)", calories: 165, protein: 31, carbs: 0, fat: 3.6, category: "protein", price: 80 },
  { id: 5, name: "Paneer (100g)", calories: 265, protein: 18, carbs: 1.2, fat: 20, category: "protein", price: 60 },
  { id: 6, name: "Egg (1 large)", calories: 70, protein: 6, carbs: 1, fat: 5, category: "protein", price: 8 },
  { id: 7, name: "Milk (1 glass)", calories: 150, protein: 8, carbs: 12, fat: 8, category: "dairy", price: 12 },
  { id: 8, name: "Banana (1 medium)", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, category: "fruits", price: 10 },
  { id: 9, name: "Apple (1 medium)", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, category: "fruits", price: 20 },
  { id: 10, name: "Spinach (1 cup)", calories: 7, protein: 1, carbs: 1, fat: 0.1, category: "vegetables", price: 15 },
  { id: 11, name: "Potato (1 medium)", calories: 161, protein: 4.3, carbs: 37, fat: 0.2, category: "vegetables", price: 8 },
  { id: 12, name: "Tomato (1 medium)", calories: 22, protein: 1.1, carbs: 4.8, fat: 0.2, category: "vegetables", price: 12 },
  { id: 13, name: "Onion (1 medium)", calories: 44, protein: 1.2, carbs: 10, fat: 0.1, category: "vegetables", price: 10 },
  { id: 14, name: "Oats (1 cup)", calories: 154, protein: 5, carbs: 28, fat: 3, category: "grains", price: 30 },
  { id: 15, name: "Almonds (10 pieces)", calories: 69, protein: 2.5, carbs: 2.5, fat: 6, category: "nuts", price: 25 },
  { id: 16, name: "Chapati (1 piece)", calories: 104, protein: 4, carbs: 18, fat: 2.4, category: "grains", price: 6 },
  { id: 17, name: "Curd (1 cup)", calories: 154, protein: 14, carbs: 17, fat: 4, category: "dairy", price: 20 },
  { id: 18, name: "Fish (100g)", calories: 206, protein: 22, carbs: 0, fat: 12, category: "protein", price: 120 },
  { id: 19, name: "Mango (1 medium)", calories: 202, protein: 2.8, carbs: 50, fat: 1.3, category: "fruits", price: 30 },
  { id: 20, name: "Orange (1 medium)", calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2, category: "fruits", price: 15 },
  { id: 21, name: "Carrot (1 medium)", calories: 25, protein: 0.5, carbs: 6, fat: 0.1, category: "vegetables", price: 8 },
  { id: 22, name: "Cucumber (1 cup)", calories: 16, protein: 0.7, carbs: 4, fat: 0.1, category: "vegetables", price: 12 },
  { id: 23, name: "Broccoli (1 cup)", calories: 25, protein: 3, carbs: 5, fat: 0.3, category: "vegetables", price: 25 },
  { id: 24, name: "Sweet Potato (1 medium)", calories: 112, protein: 2, carbs: 26, fat: 0.1, category: "vegetables", price: 15 },
  { id: 25, name: "Lemon (1 medium)", calories: 17, protein: 0.6, carbs: 5.4, fat: 0.2, category: "fruits", price: 5 },
  { id: 26, name: "Cashews (10 pieces)", calories: 157, protein: 5.2, carbs: 8.6, fat: 12.4, category: "nuts", price: 40 },
  { id: 27, name: "Walnuts (5 halves)", calories: 131, protein: 3.1, carbs: 2.6, fat: 13.1, category: "nuts", price: 35 },
  { id: 28, name: "Green Peas (1 cup)", calories: 134, protein: 8.6, carbs: 25, fat: 0.4, category: "vegetables", price: 20 },
  { id: 29, name: "Cabbage (1 cup)", calories: 22, protein: 1.1, carbs: 5.2, fat: 0.1, category: "vegetables", price: 10 },
  { id: 30, name: "Peanuts (10 pieces)", calories: 94, protein: 4.3, carbs: 2.7, fat: 8.2, category: "nuts", price: 15 },
  { id: 31, name: "Yogurt (1 cup)", calories: 149, protein: 8.5, carbs: 11.4, fat: 8, category: "dairy", price: 25 },
  { id: 32, name: "Cheese (100g)", calories: 402, protein: 25, carbs: 1.3, fat: 33, category: "dairy", price: 150 },
  { id: 33, name: "Mutton (100g)", calories: 294, protein: 25, carbs: 0, fat: 21, category: "protein", price: 200 },
  { id: 34, name: "Prawns (100g)", calories: 99, protein: 18, carbs: 0.9, fat: 1.7, category: "protein", price: 180 },
  { id: 35, name: "Coconut (1 cup)", calories: 283, protein: 3, carbs: 12, fat: 27, category: "nuts", price: 30 }
];

let mealLogs = [];
let exerciseLogs = [];
let waterLogs = [];

// ===== API ROUTES =====

// Health Check - Enhanced
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'NutriBuddy Backend Server Running Successfully!', 
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3000,
    version: '2.0.0',
    status: 'healthy',
    database: {
      foods: foods.length,
      users: users.length,
      mealLogs: mealLogs.length,
      exerciseLogs: exerciseLogs.length,
      waterLogs: waterLogs.length
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to NutriBuddy API',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      foods: '/api/foods',
      userProfile: '/api/user-profile',
      logMeal: '/api/log-meal',
      dailyLogs: '/api/daily-logs/:userId'
    }
  });
});

// Create User Profile - Enhanced
app.post('/api/user-profile', (req, res) => {
  try {
    const userData = req.body;
    console.log('Received user data:', userData);
    
    // Validate required fields
    if (!userData.fullName || !userData.age || !userData.weight || !userData.height) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: fullName, age, weight, height'
      });
    }

    // Add/update user ID and timestamp
    userData.id = userData.id || Date.now();
    userData.createdAt = userData.createdAt || new Date().toISOString();
    userData.updatedAt = new Date().toISOString();
    
    // Calculate additional metrics
    const bmi = (userData.weight / ((userData.height / 100) ** 2)).toFixed(1);
    userData.bmi = parseFloat(bmi);
    
    // Add BMI category
    if (userData.bmi < 18.5) userData.bmiCategory = 'Underweight';
    else if (userData.bmi < 25) userData.bmiCategory = 'Normal';
    else if (userData.bmi < 30) userData.bmiCategory = 'Overweight';
    else userData.bmiCategory = 'Obese';

    // Remove existing user with same ID and add new one
    users = users.filter(u => u.id !== userData.id);
    users.push(userData);
    
    console.log('User profile created successfully:', userData.fullName);
    
    res.json({
      success: true,
      message: 'User profile created successfully',
      user: userData
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get Foods Database - Enhanced with filtering
app.get('/api/foods', (req, res) => {
  try {
    const { category, search, limit, offset } = req.query;
    let filteredFoods = [...foods];

    // Filter by category
    if (category && category !== 'all') {
      filteredFoods = filteredFoods.filter(food => 
        food.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Search functionality
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredFoods = filteredFoods.filter(food =>
        food.name.toLowerCase().includes(searchTerm) ||
        food.category.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by name
    filteredFoods.sort((a, b) => a.name.localeCompare(b.name));

    // Pagination
    const startIndex = parseInt(offset) || 0;
    const pageSize = parseInt(limit) || filteredFoods.length;
    const paginatedFoods = filteredFoods.slice(startIndex, startIndex + pageSize);

    res.json({
      success: true,
      foods: paginatedFoods,
      total: filteredFoods.length,
      filtered: paginatedFoods.length,
      categories: [...new Set(foods.map(f => f.category))],
      pagination: {
        offset: startIndex,
        limit: pageSize,
        hasMore: startIndex + pageSize < filteredFoods.length
      }
    });
  } catch (error) {
    console.error('Error fetching foods:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch foods',
      details: error.message
    });
  }
});

// Get Food by ID
app.get('/api/foods/:foodId', (req, res) => {
  try {
    const { foodId } = req.params;
    const food = foods.find(f => f.id === parseInt(foodId));
    
    if (!food) {
      return res.status(404).json({
        success: false,
        error: 'Food not found'
      });
    }

    res.json({
      success: true,
      food: food
    });
  } catch (error) {
    console.error('Error fetching food:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch food'
    });
  }
});

// Log Meal - Enhanced
app.post('/api/log-meal', (req, res) => {
  try {
    const { userId, foodId, quantity, mealType } = req.body;
    console.log('Logging meal:', { userId, foodId, quantity, mealType });

    if (!userId || !foodId || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, foodId, quantity'
      });
    }

    // Find food item
    const food = foods.find(f => f.id === parseInt(foodId));
    if (!food) {
      return res.status(404).json({
        success: false,
        error: 'Food not found'
      });
    }

    // Create meal log entry
    const mealLog = {
      id: Date.now() + Math.random(), // Ensure unique ID
      userId: parseInt(userId),
      foodId: parseInt(foodId),
      foodName: food.name,
      quantity: parseFloat(quantity),
      mealType: mealType || 'breakfast',
      calories: Math.round(food.calories * quantity * 10) / 10,
      protein: Math.round(food.protein * quantity * 10) / 10,
      carbs: Math.round(food.carbs * quantity * 10) / 10,
      fat: Math.round(food.fat * quantity * 10) / 10,
      cost: food.price ? Math.round(food.price * quantity * 10) / 10 : 0,
      loggedAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    };

    mealLogs.push(mealLog);
    console.log('Meal logged successfully:', mealLog.foodName);

    res.json({
      success: true,
      message: 'Meal logged successfully',
      mealLog: mealLog
    });
  } catch (error) {
    console.error('Error logging meal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log meal',
      details: error.message
    });
  }
});

// Get Daily Logs - Enhanced
app.get('/api/daily-logs/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    console.log(`Fetching daily logs for user ${userId} on ${targetDate}`);

    // Get logs for the specified date
    const userLogs = mealLogs.filter(log => {
      const logDate = new Date(log.loggedAt).toISOString().split('T')[0];
      return log.userId == userId && logDate === targetDate;
    });

    // Group by meal type
    const groupedLogs = {
      breakfast: userLogs.filter(log => log.mealType === 'breakfast'),
      lunch: userLogs.filter(log => log.mealType === 'lunch'),
      dinner: userLogs.filter(log => log.mealType === 'dinner'),
      snacks: userLogs.filter(log => log.mealType === 'snacks')
    };

    // Calculate totals
    const totals = userLogs.reduce((acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fat: acc.fat + (log.fat || 0),
      cost: acc.cost + (log.cost || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, cost: 0 });

    // Round totals
    Object.keys(totals).forEach(key => {
      totals[key] = Math.round(totals[key] * 10) / 10;
    });

    console.log(`Found ${userLogs.length} logs with totals:`, totals);

    res.json({
      success: true,
      logs: userLogs,
      groupedLogs: groupedLogs,
      totals: totals,
      date: targetDate,
      summary: {
        totalLogs: userLogs.length,
        mealsLogged: Object.keys(groupedLogs).filter(meal => groupedLogs[meal].length > 0)
      }
    });
  } catch (error) {
    console.error('Error fetching daily logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily logs',
      details: error.message
    });
  }
});

// Get User Profile
app.get('/api/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = users.find(u => u.id == userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user stats
    const userMealLogs = mealLogs.filter(log => log.userId == userId);
    const totalDaysLogged = new Set(userMealLogs.map(log => 
      new Date(log.loggedAt).toISOString().split('T')[0]
    )).size;

    const userStats = {
      totalMealsLogged: userMealLogs.length,
      daysActive: totalDaysLogged,
      joinDate: user.createdAt,
      lastActivity: userMealLogs.length > 0 ? 
        Math.max(...userMealLogs.map(log => new Date(log.loggedAt).getTime())) : null
    };

    res.json({
      success: true,
      user: { ...user, stats: userStats }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

// Delete Meal Log
app.delete('/api/meal-log/:logId', (req, res) => {
  try {
    const { logId } = req.params;
    const logIndex = mealLogs.findIndex(log => log.id == logId);
    
    if (logIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Meal log not found'
      });
    }

    const deletedLog = mealLogs.splice(logIndex, 1)[0];

    res.json({
      success: true,
      message: 'Meal log deleted successfully',
      deletedLog: deletedLog
    });
  } catch (error) {
    console.error('Error deleting meal log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete meal log'
    });
  }
});

// Get Weekly Logs
app.get('/api/weekly-logs/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);

    const weeklyLogs = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      const dayLogs = mealLogs.filter(log => {
        const logDate = new Date(log.loggedAt).toISOString().split('T')[0];
        return log.userId == userId && logDate === dateString;
      });

      const dayTotals = dayLogs.reduce((acc, log) => ({
        calories: acc.calories + (log.calories || 0),
        protein: acc.protein + (log.protein || 0),
        carbs: acc.carbs + (log.carbs || 0),
        fat: acc.fat + (log.fat || 0),
        cost: acc.cost + (log.cost || 0)
      }), { calories: 0, protein: 0, carbs: 0, fat: 0, cost: 0 });

      weeklyLogs.push({
        date: dateString,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        logs: dayLogs,
        totals: dayTotals
      });
    }

    res.json({
      success: true,
      weeklyLogs: weeklyLogs,
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Error fetching weekly logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weekly logs'
    });
  }
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      'GET /': 'API information',
      'GET /api/health': 'Health check',
      'POST /api/user-profile': 'Create user profile', 
      'GET /api/foods': 'Get foods database',
      'GET /api/foods/:foodId': 'Get specific food',
      'POST /api/log-meal': 'Log meal',
      'GET /api/daily-logs/:userId': 'Get daily logs',
      'GET /api/weekly-logs/:userId': 'Get weekly logs',
      'GET /api/user/:userId': 'Get user profile',
      'DELETE /api/meal-log/:logId': 'Delete meal log'
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log('\n🚀 ===== NUTRIBUDDY BACKEND SERVER =====');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ API Documentation: http://localhost:${PORT}/`);
  console.log('📊 DATABASE STATUS:');
  console.log(`   • Foods: ${foods.length} items`);
  console.log(`   • Users: ${users.length} registered`);
  console.log(`   • Meal logs: ${mealLogs.length} entries`);
  console.log('🎯 Ready for React app connections!');
  console.log('=====================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
