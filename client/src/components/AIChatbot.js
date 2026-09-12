import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, MessageSquare, Sparkles } from 'lucide-react';

const AIChatbot = ({ user, setCurrentPage }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Welcome message when chatbot opens
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        type: 'ai',
        content: `Hi ${user?.fullName?.split(' ')[0] || 'there'}! I'm your AI Nutrition Assistant. I can help you with:

• Personalized meal recommendations
• Budget-friendly food suggestions  
• Nutrition advice based on your goals
• Meal planning and calorie tracking
• Fitness and health tips

What would you like to know about nutrition today?`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateAIResponse = async (userMessage) => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));
    
    const userProfile = {
      name: user?.fullName?.split(' ')[0] || 'User',
      goal: user?.goal || 'maintain',
      budget: user?.budgetRange || 'moderate',
      dailyCalories: user?.dailyCalories || 2000,
      dietaryPrefs: user?.dietaryPreferences || 'None',
      age: user?.age || 25,
      profession: user?.profession || 'Professional',
      fitnessGoals: user?.fitnessGoals || []
    };

    const message = userMessage.toLowerCase();

    if (message.includes('meal') || message.includes('food') || message.includes('eat') || message.includes('recipe')) {
      if (message.includes('breakfast')) {
        return generateMealSuggestion('breakfast', userProfile);
      } else if (message.includes('lunch')) {
        return generateMealSuggestion('lunch', userProfile);
      } else if (message.includes('dinner')) {
        return generateMealSuggestion('dinner', userProfile);
      } else {
        return generateGeneralMealAdvice(userProfile);
      }
    } else if (message.includes('budget') || message.includes('cost') || message.includes('cheap') || message.includes('price')) {
      return generateBudgetAdvice(userProfile);
    } else if (message.includes('calorie') || message.includes('protein') || message.includes('macro') || message.includes('nutrition')) {
      return generateNutritionAdvice(userProfile);
    } else if (message.includes('weight') || message.includes('lose') || message.includes('gain') || message.includes('fat')) {
      return generateWeightAdvice(userProfile);
    } else if (message.includes('workout') || message.includes('exercise') || message.includes('gym') || message.includes('fitness')) {
      return generateFitnessAdvice(userProfile);
    } else if (message.includes('plan') || message.includes('weekly') || message.includes('schedule')) {
      return generateMealPlanAdvice(userProfile);
    } else {
      return generateDefaultResponse(userProfile);
    }
  };

  const generateGeneralMealAdvice = (profile) => {
    return `**Meal & Nutrition Advice for ${profile.name}:**

To achieve your goal of **${profile.goal} weight** on a **${profile.budget} budget**, try these guidelines:

1. **Prioritize portion control** and eat balanced meals consisting of a lean protein source, complex carbohydrates, and seasonal vegetables.
2. **Follow a consistent meal schedule** (Breakfast, Lunch, Dinner, and Snacks) to avoid energy crashes.
3. **Use our Weekly Meal Planner** to automatically optimize your meals for ₹${profile.budget === 'tight' ? '1000' : profile.budget === 'moderate' ? '2100' : '3500'}/week.

Would you like suggestions for a specific meal, like **breakfast**, **lunch**, or **dinner**?`;
  };

  const generateMealSuggestion = (mealType, profile) => {
    const budgetMeals = {
      tight: {
        breakfast: ['Oats with banana', 'Poha', 'Upma', 'Paratha with curd'],
        lunch: ['Dal-rice', 'Rajma-chawal', 'Mixed vegetable curry', 'Chole'],
        dinner: ['Khichdi', 'Dal-roti', 'Vegetable curry with rice']
      },
      moderate: {
        breakfast: ['Paneer paratha', 'Egg curry with roti', 'Idli-sambhar'],
        lunch: ['Chicken curry-rice', 'Paneer butter masala', 'Fish curry'],
        dinner: ['Mutton curry', 'Chicken biryani', 'Paneer tikka with roti']
      },
      flexible: {
        breakfast: ['Protein smoothie', 'Avocado toast', 'Quinoa bowl'],
        lunch: ['Salmon with vegetables', 'Chicken salad', 'Paneer tikka'],
        dinner: ['Grilled fish', 'Lean meat with quinoa', 'Mixed nuts and fruits']
      }
    };

    const calorieTarget = Math.round(profile.dailyCalories * (mealType === 'breakfast' ? 0.25 : mealType === 'lunch' ? 0.35 : 0.3));
    const suggestions = budgetMeals[profile.budget]?.[mealType] || budgetMeals.moderate[mealType];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

    return `**${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Suggestion for ${profile.name}:**

**Recommended:** ${randomSuggestion}
**Target Calories:** ~${calorieTarget} cal
**Budget:** ${profile.budget} range

${profile.goal === 'lose' 
  ? 'Tip: Focus on high protein and fiber to stay full longer.' 
  : profile.goal === 'gain' 
  ? 'Tip: Add healthy fats like nuts or ghee for extra calories.' 
  : 'Tip: Maintain balanced portions of protein, carbs, and vegetables.'
}

Would you like more specific recipes or nutrition details?`;
  };

  const generateBudgetAdvice = (profile) => {
    const budgetTips = {
      tight: [
        'Buy seasonal vegetables - they are cheaper and fresher',
        'Cook dal-rice combinations for complete protein',
        'Use eggs as affordable protein source',
        'Buy grains in bulk to save money'
      ],
      moderate: [
        'Include paneer 2-3 times a week for protein',
        'Buy chicken in bulk and freeze portions',
        'Mix expensive vegetables with cheaper ones',
        'Prepare meals at home instead of ordering'
      ],
      flexible: [
        'Invest in superfoods like quinoa, nuts, and fish',
        'Buy organic when possible for better nutrition',
        'Try meal delivery services for convenience',
        'Include variety of proteins and exotic vegetables'
      ]
    };

    const tips = budgetTips[profile.budget] || budgetTips.moderate;
    const randomTips = tips.slice(0, 3);

    return `**Budget-Smart Nutrition Tips for ${profile.name}:**

**Your Budget Range:** ${profile.budget.charAt(0).toUpperCase() + profile.budget.slice(1)}

${randomTips.map((tip, index) => `${index + 1}. ${tip}`).join('\n')}

**Monthly Estimate:** 
- Tight: ₹3,000-5,000
- Moderate: ₹5,000-10,000  
- Flexible: ₹10,000+

Want specific meal plans within your budget?`;
  };

  const generateWeightAdvice = (profile) => {
    const goalAdvice = {
      lose: {
        title: 'Weight Loss Strategy',
        tips: [
          'Create a 300-500 calorie deficit daily',
          'Focus on high protein foods (eggs, dal, paneer)',
          'Include fiber-rich vegetables in every meal',
          'Drink water before meals to feel fuller'
        ],
        calories: `Aim for ${profile.dailyCalories - 300}-${profile.dailyCalories - 500} calories daily`
      },
      gain: {
        title: 'Weight Gain Strategy', 
        tips: [
          'Add healthy fats like nuts, ghee, and avocado',
          'Eat protein with every meal and snack',
          'Include calorie-dense foods like dates and dried fruits',
          'Have small frequent meals throughout the day'
        ],
        calories: `Aim for ${profile.dailyCalories + 300}-${profile.dailyCalories + 500} calories daily`
      },
      maintain: {
        title: 'Weight Maintenance Strategy',
        tips: [
          'Balance your macros: 50% carbs, 25% protein, 25% fats',
          'Listen to your hunger cues',
          'Stay consistent with meal timing',
          'Include variety in your diet'
        ],
        calories: `Maintain around ${profile.dailyCalories} calories daily`
      }
    };

    const advice = goalAdvice[profile.goal] || goalAdvice.maintain;

    return `**${advice.title} for ${profile.name}:**

**Your Goal:** ${profile.goal.charAt(0).toUpperCase() + profile.goal.slice(1)} weight
**${advice.calories}**

**Key Tips:**
${advice.tips.map((tip, index) => `${index + 1}. ${tip}`).join('\n')}

**Based on your profile:**
- Age: ${profile.age} | Profession: ${profile.profession}
- Budget: ${profile.budget} | Diet: ${profile.dietaryPrefs}

Need specific meal plans to achieve your goal?`;
  };

  const generateNutritionAdvice = (profile) => {
    return `**Personalized Nutrition Guide for ${profile.name}:**

**Your Daily Targets:**
- Calories: ${profile.dailyCalories}
- Protein: ${Math.round(profile.dailyCalories * 0.15 / 4)}g (15% of calories)
- Carbs: ${Math.round(profile.dailyCalories * 0.55 / 4)}g (55% of calories)  
- Fats: ${Math.round(profile.dailyCalories * 0.30 / 9)}g (30% of calories)

**Smart Choices:**
- **Proteins:** Eggs, dal, paneer, chicken, fish
- **Carbs:** Rice, roti, oats, fruits
- **Fats:** Ghee, nuts, olive oil
- **Vitamins:** Green vegetables, fruits

**For your ${profile.goal} goal:**
${profile.goal === 'lose' 
  ? '• Prioritize protein and fiber\n• Control portion sizes\n• Avoid liquid calories' 
  : profile.goal === 'gain'
  ? '• Add calorie-dense foods\n• Do not skip meals\n• Include healthy fats'
  : '• Maintain balanced portions\n• Eat mindfully\n• Stay hydrated'
}

Want to track these nutrients in your meals?`;
  };

  const generateFitnessAdvice = (profile) => {
    return `**Fitness Recommendations for ${profile.name}:**

**Based on your goals:** ${profile.fitnessGoals.join(', ') || 'General fitness'}

**Weekly Plan:**
- Cardio: 3-4 days (walking, running, cycling)
- Strength: 2-3 days (bodyweight or weights)
- Flexibility: Daily (stretching, yoga)

**Nutrition + Exercise:**
- **Pre-workout:** Banana or dates (30 mins before)
- **Post-workout:** Protein + carbs within 2 hours
- **Hydration:** Extra 500ml water per hour of exercise

**For your profession (${profile.profession}):**
${profile.profession.toLowerCase().includes('software') || profile.profession.toLowerCase().includes('office')
  ? '• Take walking breaks every hour\n• Focus on posture exercises\n• Do desk stretches'
  : '• Adapt workout timing to your schedule\n• Focus on recovery nutrition\n• Listen to your body'
}

Want specific workout plans or pre/post workout meal ideas?`;
  };

  const generateMealPlanAdvice = (profile) => {
    return `**Smart Meal Planning for ${profile.name}:**

**Weekly Prep Strategy:**
1. **Sunday:** Plan meals & grocery shopping
2. **Prep:** Wash vegetables, cook grains in bulk
3. **Storage:** Use containers for portion control

**Sample Day (${profile.dailyCalories} cal):**

**Breakfast (${Math.round(profile.dailyCalories * 0.25)} cal):**
- Option 1: Oats + banana + nuts
- Option 2: Paratha + curd + pickle

**Lunch (${Math.round(profile.dailyCalories * 0.35)} cal):**
- Dal + rice + vegetable + salad

**Dinner (${Math.round(profile.dailyCalories * 0.30)} cal):**
- Roti + sabzi + dal + curd

**Snacks (${Math.round(profile.dailyCalories * 0.10)} cal):**
- Fruits, nuts, or tea with biscuits

**Budget: ${profile.budget}** | **Diet: ${profile.dietaryPrefs}**

Ready to create your personalized weekly meal plan?`;
  };

  const generateDefaultResponse = (profile) => {
    const responses = [
      `Hi ${profile.name}! I can help with nutrition, meal planning, and health tips. What specific area interests you?`,
      `Great question! As your nutrition assistant, I can provide advice on meals, calories, budget-friendly options, and fitness. What would you like to explore?`,
      `I am here to help with your nutrition journey! Whether it is meal suggestions, calorie counting, or healthy recipes - just ask!`,
      `Let me help you with that! I specialize in personalized nutrition advice based on your goals and preferences. What is on your mind?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponseContent = await generateAIResponse(userMsg.content);
      const aiMsg = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponseContent,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I apologize, but I am having trouble responding right now. Please try asking again!',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    'What should I eat for breakfast?',
    'How to lose weight on budget?',
    'Healthy snacks under 200 calories',
    'Calculate my daily protein needs'
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  if (!isOpen) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 36px rgba(16, 185, 129, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.35)';
          }}
        >
          <MessageSquare size={24} />
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '380px',
      height: '560px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-overlay)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: 'fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-surface-raised)',
        color: 'var(--text-primary)',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand-primary-subtle)', color: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontWeight: 800 }}>AI Health Assistant</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
              Personalized Nutrition for {user?.fullName?.split(' ')[0] || 'You'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s ease'
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={chatContainerRef}
        style={{
          flex: 1,
          padding: '18px',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-surface-alt)'
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.type === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: message.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: message.type === 'user' 
                  ? 'var(--brand-primary)' 
                  : 'var(--bg-surface-raised)',
                color: message.type === 'user' ? '#ffffff' : 'var(--text-primary)',
                fontSize: '13px',
                lineHeight: '1.5',
                whiteSpace: 'pre-line',
                border: message.type === 'user' ? 'none' : '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              {message.content}
            </div>
            <span
              style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                marginTop: '4px',
                padding: '0 4px'
              }}
            >
              {message.timestamp}
            </span>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--bg-surface-raised)', borderRadius: '16px 16px 16px 4px', width: 'fit-content' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-primary)', animation: 'bounce 1s infinite' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-primary)', animation: 'bounce 1s infinite 0.2s' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-primary)', animation: 'bounce 1s infinite 0.4s' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div style={{
          padding: '12px 18px',
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
            Suggested Prompts:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(q)}
                style={{
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '5px 12px',
                  fontSize: '11.5px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about nutrition, diet, calories..."
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            outline: 'none'
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: inputMessage.trim() && !isLoading 
              ? 'var(--brand-primary)' 
              : 'var(--bg-surface-raised)',
            border: 'none',
            color: inputMessage.trim() && !isLoading ? '#ffffff' : 'var(--text-muted)',
            cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};

export default AIChatbot;