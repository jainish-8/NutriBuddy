import React, { useState, useEffect } from 'react';
import './App.css';

import UserProfileForm from './pages/UserProfileForm';
import Dashboard from './pages/Dashboard';
import FoodLogger from './pages/FoodLogger';
import WeeklyMealPlanner from './pages/WeeklyMealPlanner';
import ExerciseTracker from './pages/ExerciseTracker';
import FoodSearch from './pages/FoodSearch';
import UserProfileDetails from './pages/UserProfileDetails';
import AIChatbot from './components/AIChatbot';

// ===== ORBITAL ANIMATED BACKGROUND =====
function OrbitalBackground({ isIntro }) {
  return (
    <div className={`orbital-bg${isIntro ? ' intro-active' : ''}`}>
      {/* Ambient color glow blobs */}
      <div className="orb-glow orb-glow-1" />
      <div className="orb-glow orb-glow-2" />
      <div className="orb-glow orb-glow-3" />

      {/* Spinning ring system */}
      <div className="orbital-bg-inner">
        <div className="orb-ring orb-ring-1" />
        <div className="orb-ring orb-ring-2" />
        <div className="orb-ring orb-ring-3" />
        <div className="orb-ring orb-ring-4" />

        {/* Floating particles */}
        <div className="orb-particles">
          <div className="orb-particle" />
          <div className="orb-particle" />
          <div className="orb-particle" />
          <div className="orb-particle" />
          <div className="orb-particle" />
        </div>
      </div>
    </div>
  );
}

// ===== LANDING SPLASH OVERLAY =====
function LandingSplash({ onComplete, onExitStart }) {
  const [percent, setPercent] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let start = 0;
    const end = 100;
    const duration = 3500; // 4.5s loading speed (extended by 3.1s for premium look)
    const stepTime = Math.floor(duration / end);

    const timer = setInterval(() => {
      start += 1;
      setPercent(start);
      if (start >= end) {
        clearInterval(timer);
        setExiting(true);
        if (onExitStart) onExitStart();
        setTimeout(onComplete, 1100); // match transition duration
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [onComplete, onExitStart]);

  const logoText = "NutriBuddy";

  return (
    <div className={`landing-splash ${exiting ? 'splash-exit' : ''}`}>
      <div className="splash-grid-overlay" />
      <div className="splash-scanner" />
      <div className="landing-splash-ring-container">
        <div className="landing-splash-ring" />
        <div className="landing-splash-ring" />
        <div className="landing-splash-ring" />
      </div>
      <div className="splash-content-box">
        <h1 className="landing-splash-logo-animated">
          {logoText.split('').map((char, index) => (
            <span 
              key={index} 
              style={{ 
                animationDelay: `${index * 60}ms`,
                color: index >= 5 ? 'var(--accent-lime-text)' : 'var(--text-primary)'
              }}
              className="splash-char"
            >
              {char}
            </span>
          ))}
        </h1>
        <div className="landing-splash-sub-animated">
          Your AI Nutrition Companion
        </div>
        <div className="splash-progress-container">
          <div className="splash-progress-bar-track">
            <div className="splash-progress-bar-fill" style={{ width: `${percent}%` }} />
          </div>
          <div className="splash-percentage-counter">
            {percent.toString().padStart(3, '0')}%
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN APP COMPONENT =====
function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('nutribuddy_theme') || 'dark');
  const [showSplash, setShowSplash] = useState(true);
  const [introActive, setIntroActive] = useState(false);
  const [revealMain, setRevealMain] = useState(false);

  // Toggle theme and activity-level class on DOM elements
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
      document.body.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
      document.body.classList.remove('light-mode');
    }

    const isGym = user && (
      user.activityLevel === 'active' || 
      user.activityLevel === 'very-active' || 
      user.fitnessGoal === 'muscle' || 
      user.fitnessGoal === 'lean-muscle'
    );

    if (isGym) {
      document.documentElement.classList.add('gym-theme');
      document.documentElement.classList.remove('sedentary-theme');
      document.body.classList.add('gym-theme');
      document.body.classList.remove('sedentary-theme');
    } else {
      document.documentElement.classList.add('sedentary-theme');
      document.documentElement.classList.remove('gym-theme');
      document.body.classList.add('sedentary-theme');
      document.body.classList.remove('gym-theme');
    }

    localStorage.setItem('nutribuddy_theme', theme);
  }, [theme, user]);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('nutribuddy_user');
    if (savedUser && savedUser !== 'null') {
      try {
        const userData = JSON.parse(savedUser);
        if (userData && (userData.fullName || userData.id)) {
          setUser(userData);
          setCurrentPage('dashboard');
          // Trigger intro animation for returning user
          setIntroActive(true);
          setTimeout(() => setIntroActive(false), 2000);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
  }, []);

  // Save user to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('nutribuddy_user', JSON.stringify(user));
    }
  }, [user]);

  // Scroll parallax effect for orbital background
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const bgInner = document.querySelector('.orbital-bg-inner');
      if (bgInner) {
        bgInner.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.08}px))`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    setShowSplash(true);
    setRevealMain(false);
    setUser(null);
    setCurrentPage('profile');
    localStorage.removeItem('nutribuddy_user');
  };

  const handleUserSet = (userData) => {
    setUser(userData);
    setIsEditingProfile(false);
    setRevealMain(false);
    setShowSplash(true);
  };

  // Onboarding page — full screen, no header
  const isOnboarding = currentPage === 'profile' && (!user || isEditingProfile);

  return (
    <>
      {/* Global Orbital Animated Background */}
      <OrbitalBackground isIntro={introActive} />

      {/* Landing Splash Overlay */}
      {showSplash && (
        <LandingSplash 
          onExitStart={() => setRevealMain(true)}
          onComplete={() => {
            setShowSplash(false);
            if (user) {
              setCurrentPage('dashboard');
            } else {
              setCurrentPage('profile');
            }
          }} 
        />
      )}

      <div 
        className="app-container" 
        style={{ 
          paddingTop: isOnboarding ? 0 : undefined,
          opacity: revealMain || !showSplash ? 1 : 0,
          transform: revealMain || !showSplash ? 'scale(1)' : 'scale(0.96)',
          transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'opacity, transform'
        }}
      >
        {/* Sticky Top Navigation Navbar — hidden during onboarding */}
        {!isOnboarding && (
          <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 24px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 'var(--radius-card)',
            marginBottom: 35,
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)'
          }}>
            {/* Left Side: Brand Logo */}
            <div 
              onClick={() => { if (user) setCurrentPage('dashboard'); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: user ? 'pointer' : 'default' }}
            >
              <h1 style={{ fontSize: 20, margin: 0, fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
                Nutri<span style={{ color: 'var(--accent-lime-text)' }}>Buddy</span>
              </h1>
            </div>

            {/* Center: Main Navigation Links */}
            {user && (
              <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {[
                  { key: 'dashboard', label: 'Dashboard' },
                  { key: 'food-log', label: 'Food Log' },
                  { key: 'meal-planner', label: 'Meal Planner' },
                  { key: 'exercise', label: 'Exercise' },
                  { key: 'food-search', label: 'Food Search' }
                ].map(nav => (
                  <button
                    key={nav.key}
                    onClick={() => setCurrentPage(nav.key)}
                    style={{
                      padding: '7px 14px',
                      fontSize: 13,
                      borderRadius: 'var(--radius-panel)',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontWeight: currentPage === nav.key ? 700 : 500,
                      color: currentPage === nav.key ? 'var(--text-primary)' : 'var(--text-muted)',
                      background: currentPage === nav.key ? 'var(--bg-surface-raised)' : 'transparent',
                      transition: 'all 0.18s ease',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {nav.label}
                  </button>
                ))}
              </div>
            )}

            {/* Right Side: Theme, Avatar & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="btn btn-secondary"
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', padding: 0, fontSize: 13,
                  color: 'var(--text-primary)',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'all 0.2s ease',
                  fontWeight: 700,
                  letterSpacing: '-0.01em'
                }}
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'light' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                )}
              </button>

              {user && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={() => {
                      setCurrentPage('profile');
                      setIsEditingProfile(false);
                    }}
                    style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent-lavender), var(--accent-pink))',
                      color: '#ffffff',
                      border: currentPage === 'profile' ? '2.5px solid var(--text-primary)' : '1.5px solid var(--border-strong)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', padding: 0,
                      fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transition: 'all 0.2s ease',
                      transform: currentPage === 'profile' ? 'scale(1.05)' : 'none'
                    }}
                    title="My Profile Settings"
                  >
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: 12, borderRadius: 'var(--radius-panel)', height: 34 }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </header>
        )}

        {/* Page Content */}
        <main style={{ minHeight: isOnboarding ? '100vh' : '60vh' }}>
          {isOnboarding ? (
            <UserProfileForm 
              user={user} 
              setUser={handleUserSet} 
              setCurrentPage={setCurrentPage} 
            />
          ) : (
            <div key={currentPage} className="fadeInUp" style={{ animationDuration: '0.6s' }}>
              {currentPage === 'profile' && user && !isEditingProfile && (
                <UserProfileDetails 
                  user={user} 
                  onEdit={() => setIsEditingProfile(true)} 
                  onLogout={handleLogout} 
                />
              )}
              {currentPage === 'dashboard' && <Dashboard user={user} setCurrentPage={setCurrentPage} />}
              {currentPage === 'food-log' && <FoodLogger user={user} setCurrentPage={setCurrentPage} />}
              {currentPage === 'meal-planner' && <WeeklyMealPlanner user={user} setCurrentPage={setCurrentPage} />}
              {currentPage === 'exercise' && <ExerciseTracker user={user} setCurrentPage={setCurrentPage} />}
              {currentPage === 'food-search' && <FoodSearch user={user} setCurrentPage={setCurrentPage} />}
            </div>
          )}
        </main>

        {/* Footer */}
        {!isOnboarding && (
          <footer style={{
            marginTop: 80, paddingBottom: 32, paddingTop: 24,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 8, textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Nutri<span style={{ color: 'var(--accent-lime-text)' }}>Buddy</span>
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· Personal Health Companion</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
              Nutrition Tracking · Budget Meal Planning · Exercise Logging
            </div>
          </footer>
        )}

      </div>

      {/* Floating AI Health Assistant - Rendered outside transformed container to ensure true fixed positioning */}
      {user && <AIChatbot user={user} setCurrentPage={setCurrentPage} />}
    </>
  );
}

export default App;