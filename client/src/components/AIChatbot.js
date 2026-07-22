import React, { useState, useEffect, useRef } from 'react';

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
        content: `Hi ${user?.fullName?.split(' ')[0] || 'there'}! 👋 I'm your AI Nutrition Assistant. I can help you with:

• 🍽️ Personalized meal recommendations
• 💰 Budget-friendly food suggestions  
• 🎯 Nutrition advice based on your goals
• 📊 Meal planning and calorie tracking
• 🏃 Fitness and health tips

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
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const userProfile = {
      name: user?.fullName?.split(' ')[0] || 'User',
      age: user?.age || 'N/A',
      goal: user?.goal || 'maintain',
      dailyCalories: user?.dailyCalories || 2000,
      profession: user?.profession || 'N/A',
      budget: user?.budgetRange || 'moderate',
      dietaryPrefs: user?.dietaryPreferences || 'none',
      allergies: user?.allergies || [],
      cuisines: user?.cuisinePreferences || [],
      fitnessGoals: user?.fitnessGoals || []
    };

    // Smart response generation based on user input
    const message = userMessage.toLowerCase();
    
    if (message.includes('meal') || message.includes('food') || message.includes('eat')) {
      if (message.includes('breakfast')) {
        return generateMealSuggestion('breakfast', userProfile);
      } else if (message.includes('lunch')) {
        return generateMealSuggestion('lunch', userProfile);
      } else if (message.includes('dinner')) {
        return generateMealSuggestion('dinner', userProfile);
      } else {
        return generateGeneralMealAdvice(userProfile);
      }
    }
    
    if (message.includes('budget') || message.includes('cheap') || message.includes('affordable')) {
      return generateBudgetAdvice(userProfile);
    }
    
    if (message.includes('weight') || message.includes('lose') || message.includes('gain')) {
      return generateWeightAdvice(userProfile);
    }
    
    if (message.includes('calorie') || message.includes('nutrition')) {
      return generateNutritionAdvice(userProfile);
    }
    
    if (message.includes('exercise') || message.includes('workout') || message.includes('fitness')) {
      return generateFitnessAdvice(userProfile);
    }

    if (message.includes('plan') || message.includes('schedule')) {
      return generateMealPlanAdvice(userProfile);
    }
    
    // Default helpful response
    return generateDefaultResponse(userProfile);
  };

  const generateGeneralMealAdvice = (profile) => {
    return `🍽️ **Meal & Nutrition Advice for ${profile.name}:**

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

    return `🍽️ **${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Suggestion for ${profile.name}:**

**Recommended:** ${randomSuggestion}
**Target Calories:** ~${calorieTarget} cal
**Budget:** ${profile.budget} range

${profile.goal === 'lose' 
  ? '💡 Focus on high protein and fiber to stay full longer!' 
  : profile.goal === 'gain' 
  ? '💡 Add healthy fats like nuts or ghee for extra calories!' 
  : '💡 Maintain balanced portions of protein, carbs, and vegetables!'
}

Would you like more specific recipes or nutrition details?`;
  };

  const generateBudgetAdvice = (profile) => {
    const budgetTips = {
      tight: [
        'Buy seasonal vegetables - they\'re cheaper and fresher',
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

    return `💰 **Budget-Smart Nutrition Tips for ${profile.name}:**

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

    return `🎯 **${advice.title} for ${profile.name}:**

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
    return `📊 **Personalized Nutrition Guide for ${profile.name}:**

**Your Daily Targets:**
- 🔥 Calories: ${profile.dailyCalories}
- 🥩 Protein: ${Math.round(profile.dailyCalories * 0.15 / 4)}g (15% of calories)
- 🍞 Carbs: ${Math.round(profile.dailyCalories * 0.55 / 4)}g (55% of calories)  
- 🧈 Fats: ${Math.round(profile.dailyCalories * 0.30 / 9)}g (30% of calories)

**Smart Choices:**
- **Proteins:** Eggs, dal, paneer, chicken, fish
- **Carbs:** Rice, roti, oats, fruits
- **Fats:** Ghee, nuts, olive oil
- **Vitamins:** Green vegetables, fruits

**For your ${profile.goal} goal:**
${profile.goal === 'lose' 
  ? '• Prioritize protein and fiber\n• Control portion sizes\n• Avoid liquid calories' 
  : profile.goal === 'gain'
  ? '• Add calorie-dense foods\n• Don\'t skip meals\n• Include healthy fats'
  : '• Maintain balanced portions\n• Eat mindfully\n• Stay hydrated'
}

Want to track these nutrients in your meals?`;
  };

  const generateFitnessAdvice = (profile) => {
    return `💪 **Fitness Recommendations for ${profile.name}:**

**Based on your goals:** ${profile.fitnessGoals.join(', ') || 'General fitness'}

**Weekly Plan:**
- 🏃 Cardio: 3-4 days (walking, running, cycling)
- 💪 Strength: 2-3 days (bodyweight or weights)
- 🧘 Flexibility: Daily (stretching, yoga)

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
    return `📅 **Smart Meal Planning for ${profile.name}:**

**Weekly Prep Strategy:**
1. **Sunday:** Plan meals & grocery shopping
2. **Prep:** Wash vegetables, cook grains in bulk
3. **Storage:** Use containers for portion control

**Sample Day (${profile.dailyCalories} cal):**

**🌅 Breakfast (${Math.round(profile.dailyCalories * 0.25)} cal):**
- Option 1: Oats + banana + nuts
- Option 2: Paratha + curd + pickle

**☀️ Lunch (${Math.round(profile.dailyCalories * 0.35)} cal):**
- Dal + rice + vegetable + salad

**🌙 Dinner (${Math.round(profile.dailyCalories * 0.30)} cal):**
- Roti + sabzi + dal + curd

**🍪 Snacks (${Math.round(profile.dailyCalories * 0.10)} cal):**
- Fruits, nuts, or chai with biscuits

**Budget: ${profile.budget}** | **Diet: ${profile.dietaryPrefs}**

Ready to create your personalized weekly meal plan?`;
  };

  const generateDefaultResponse = (profile) => {
    const responses = [
      `Hi ${profile.name}! I can help with nutrition, meal planning, and health tips. What specific area interests you?`,
      `Great question! As your nutrition assistant, I can provide advice on meals, calories, budget-friendly options, and fitness. What would you like to explore?`,
      `I'm here to help with your nutrition journey! Whether it's meal suggestions, calorie counting, or healthy recipes - just ask!`,
      `Let me help you with that! I specialize in personalized nutrition advice based on your goals and preferences. What's on your mind?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + 
           `\n\n**Quick Options:**\n• Ask about meals for any time of day\n• Get budget-friendly food suggestions\n• Learn about nutrition for your ${profile.goal} goal\n• Request personalized meal plans`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(inputMessage);
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try asking again!',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What should I eat for breakfast?",
    "Suggest budget-friendly meals",
    "Help me lose weight",
    "Plan my weekly meals",
    "What's good for post-workout?"
  ];

  if (!isOpen) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-lavender), var(--accent-lavender-dark))',
            border: 'none',
            color: 'white',
            fontSize: '28px',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            animation: 'pulse 2.2s infinite'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1) translateY(-2px)';
            e.target.style.boxShadow = '0 12px 36px rgba(0, 0, 0, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1) translateY(0)';
            e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.25)';
          }}
        >
          💬
        </button>
        <style jsx>{`
          @keyframes pulse {
            0% {
              transform: scale(1);
              box-shadow: 0 8px 32px rgba(200,180,255,0.25);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 8px 32px rgba(200,180,255,0.45);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 8px 32px rgba(200,180,255,0.25);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      width: '380px',
      height: '560px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-card)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: 'fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent-lavender), var(--accent-lavender-dark))',
        color: '#ffffff',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#ffffff', fontWeight: 800 }}>🤖 AI Health Assistant</h3>
          <p style={{ margin: '3px 0 0 0', fontSize: '11px', opacity: 0.9, color: 'rgba(255,255,255,0.85)' }}>
            Personalized Nutrition for {user?.fullName?.split(' ')[0] || 'You'}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'rgba(255,255,255,0.18)',
            border: 'none',
            color: '#ffffff',
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.18)'}
        >
          ✕
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
              display: 'flex',
              marginBottom: '14px',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '82%',
              padding: '10px 14px',
              borderRadius: message.type === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
              background: message.type === 'user' 
                ? 'linear-gradient(135deg, var(--accent-lavender), var(--accent-lavender-dark))' 
                : 'var(--bg-surface)',
              color: message.type === 'user' ? '#ffffff' : 'var(--text-primary)',
              border: message.type === 'user' ? 'none' : '1px solid var(--border-subtle)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              fontSize: '13.5px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap'
            }}>
              {message.content}
              <div style={{
                fontSize: '10px',
                opacity: 0.7,
                marginTop: '6px',
                textAlign: 'right',
                color: message.type === 'user' ? '#ffffff' : 'var(--text-muted)'
              }}>
                {message.timestamp}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '14px' }}>
            <div style={{
              padding: '12px 16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px 14px 14px 2px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-lavender)', animation: 'bounce 1.4s ease-in-out infinite both' }}></div>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-lavender)', animation: 'bounce 1.4s ease-in-out 0.16s infinite both' }}></div>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-lavender)', animation: 'bounce 1.4s ease-in-out 0.32s infinite both' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 8px 0', fontWeight: 'bold' }}>Quick suggestions:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {quickQuestions.slice(0, 3).map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                style={{
                  fontSize: '11px',
                  padding: '5px 10px',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  color: 'var(--accent-lavender)',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--bg-surface-alt)';
                  e.target.style.borderColor = 'var(--accent-lavender)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--bg-surface-raised)';
                  e.target.style.borderColor = 'var(--border-subtle)';
                }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me about nutrition..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '10px 14px',
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '18px',
            resize: 'none',
            minHeight: '38px',
            maxHeight: '75px',
            fontSize: '13px',
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s ease'
          }}
          rows="1"
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-lavender)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: inputMessage.trim() && !isLoading 
              ? 'linear-gradient(135deg, var(--accent-lavender), var(--accent-lavender-dark))' 
              : 'var(--bg-surface-raised)',
            border: 'none',
            color: inputMessage.trim() && !isLoading ? '#ffffff' : 'var(--text-muted)',
            cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          ➤
        </button>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default AIChatbot;