import React, { useState, useEffect } from 'react';
import './App.css';

import UserProfileForm from './pages/UserProfileForm';
import Dashboard from './pages/Dashboard';
import FoodLogger from './pages/FoodLogger';
import WeeklyMealPlanner from './pages/WeeklyMealPlanner';
import ExerciseTracker from './pages/ExerciseTracker';
import UserProfileDetails from './pages/UserProfileDetails';
// import AIChatbot from './components/AIChatbot';

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
    const duration = 2800; // 4.5s loading speed (extended by 3.1s for premium look)
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
  const [workoutSession, setWorkoutSession] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    localStorage.getItem('nutribuddy_sidebar_collapsed') === 'true'
  );

  const toggleSidebar = () => {
    const nextVal = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextVal);
    localStorage.setItem('nutribuddy_sidebar_collapsed', nextVal.toString());
  };

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

  // Load user and current page from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('nutribuddy_user');
    if (savedUser && savedUser !== 'null') {
      try {
        const userData = JSON.parse(savedUser);
        if (userData && (userData.fullName || userData.id)) {
          setUser(userData);
          const savedPage = localStorage.getItem('nutribuddy_current_page') || 'dashboard';
          setCurrentPage(savedPage);
          // Trigger intro animation for returning user
          setIntroActive(true);
          setTimeout(() => setIntroActive(false), 2000);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
  }, []);

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    if (currentPage && currentPage !== 'profile') {
      localStorage.setItem('nutribuddy_current_page', currentPage);
    }
  }, [currentPage]);

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
    localStorage.removeItem('nutribuddy_current_page');
  };

  const handleUserSet = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('nutribuddy_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('nutribuddy_user');
    }
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
            const saved = localStorage.getItem('nutribuddy_user');
            if (saved && saved !== 'null') {
              setCurrentPage('dashboard');
            } else {
              setCurrentPage('profile');
            }
          }} 
        />
      )}

      {isOnboarding ? (
        /* ONBOARDING VIEW */
        <div 
          className="app-container" 
          style={{ 
            paddingTop: 0,
            opacity: revealMain || !showSplash ? 1 : 0,
            transform: revealMain || !showSplash ? 'scale(1)' : 'scale(0.96)',
            transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'opacity, transform'
          }}
        >
          <main style={{ minHeight: '100vh' }}>
            <UserProfileForm 
              user={user} 
              setUser={handleUserSet} 
              setCurrentPage={setCurrentPage} 
            />
          </main>
        </div>
      ) : (
        /* STANDARD APP SIDEBAR LAYOUT */
        <div className="main-layout-wrapper">
          {/* MOBILE HEADER BAR */}
          <header className="mobile-header-bar">
            <h1 style={{ fontSize: 20, margin: 0, fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
              Nutri<span style={{ color: 'var(--accent-lime-text)' }}>Buddy</span>
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', padding: 0, fontSize: 13,
                  color: 'var(--text-primary)',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'light' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                )}
              </button>
              <button
                onClick={() => {
                  setCurrentPage('profile');
                  setIsEditingProfile(false);
                }}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-lavender), var(--accent-pink))',
                  color: '#ffffff',
                  border: currentPage === 'profile' ? '2.5px solid var(--text-primary)' : '1.5px solid var(--border-strong)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', padding: 0,
                  fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                title="My Profile"
              >
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </button>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: 'none'
                }}
                title="Logout"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </header>

          {/* LEFT SIDEBAR */}
          <aside className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
            {/* Sidebar header (Logo & Toggle button) */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between', 
              marginBottom: 36,
              paddingLeft: isSidebarCollapsed ? 0 : 8,
              minHeight: 36,
              position: 'relative'
            }}>
              {!isSidebarCollapsed ? (
                <>
                  <h1 style={{ fontSize: 20, margin: 0, fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)', cursor: 'pointer' }} onClick={toggleSidebar}>
                    Nutri<span style={{ color: 'var(--accent-lime-text)' }}>Buddy</span>
                  </h1>
                  <button 
                    onClick={toggleSidebar}
                    className="sidebar-collapse-btn"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 6,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      outline: 'none',
                      marginLeft: 8,
                      width: 32,
                      height: 32,
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="21" y1="3" x2="21" y2="21" />
                      <polyline points="15 6 9 12 15 18" />
                    </svg>
                    <span className="sidebar-tooltip">Collapse sidebar</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={toggleSidebar}
                  className="sidebar-logo-toggle-wrapper"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    outline: 'none',
                    width: 36,
                    height: 36,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span className="collapsed-logo-text">NB</span>
                  <span className="collapsed-logo-arrow">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="3" x2="3" y2="21" />
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </span>
                  <span className="sidebar-tooltip">Open sidebar</span>
                </button>
              )}
            </div>

            {/* Sidebar navigation links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              {[
                { key: 'dashboard', label: 'Dashboard', icon: (color) => (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
                    <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
                  </svg>
                )},
                { key: 'food-log', label: 'Food Log', icon: (color) => (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                )},
                { key: 'meal-planner', label: 'Meal Planner', icon: (color) => (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                )},
                { key: 'exercise', label: 'Workout Console', icon: (color) => (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="6" y1="12" x2="18" y2="12" /><line x1="6" y1="7" x2="6" y2="17" /><line x1="18" y1="7" x2="18" y2="17" />
                    <rect x="2" y="9" width="4" height="6" /><rect x="18" y="9" width="4" height="6" />
                  </svg>
                )}
              ].map(nav => {
                const isActive = currentPage === nav.key;
                const activeColor = isActive ? 'var(--text-primary)' : 'var(--text-muted)';
                return (
                  <button
                    key={nav.key}
                    onClick={() => setCurrentPage(nav.key)}
                    className="sidebar-nav-item"
                    style={{
                      padding: '10px 14px',
                      fontSize: 13,
                      borderRadius: 'var(--radius-panel)',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontWeight: isActive ? 700 : 500,
                      color: activeColor,
                      background: isActive ? 'var(--bg-surface-raised)' : 'transparent',
                      transition: 'all 0.18s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                      boxSizing: 'border-box'
                    }}
                  >
                    {nav.icon(activeColor)}
                    {!isSidebarCollapsed ? (
                      <span>{nav.label}</span>
                    ) : (
                      <span className="sidebar-tooltip">{nav.label}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sidebar Footer area */}
            <div style={{ 
              borderTop: '1px solid var(--border-subtle)', 
              paddingTop: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              {/* Theme toggle & Profile circle */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                flexDirection: isSidebarCollapsed ? 'column' : 'row',
                gap: 10
              }}>
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="sidebar-nav-item"
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', padding: 0, fontSize: 13,
                    color: 'var(--text-primary)',
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                >
                  {theme === 'light' ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                  )}
                  {isSidebarCollapsed && (
                    <span className="sidebar-tooltip">Theme: {theme === 'light' ? 'Dark' : 'Light'}</span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setCurrentPage('profile');
                    setIsEditingProfile(false);
                  }}
                  className="sidebar-nav-item"
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-lavender), var(--accent-pink))',
                    color: '#ffffff',
                    border: currentPage === 'profile' ? '2.5px solid var(--text-primary)' : '1.5px solid var(--border-strong)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', padding: 0,
                    fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transition: 'all 0.2s ease',
                    transform: currentPage === 'profile' ? 'scale(1.05)' : 'none',
                    outline: 'none'
                  }}
                >
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  {isSidebarCollapsed && (
                    <span className="sidebar-tooltip">Profile Details</span>
                  )}
                </button>
              </div>

              {/* Logged user info / logout button */}
              {!isSidebarCollapsed ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.fullName}
                    </p>
                    <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.profession || 'Member'}
                    </p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: 10, height: 26, borderRadius: 6, flexShrink: 0 }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="sidebar-nav-item"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 6,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    outline: 'none',
                    margin: '0 auto'
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  {isSidebarCollapsed && (
                    <span className="sidebar-tooltip">Logout</span>
                  )}
                </button>
              )}
            </div>
          </aside>

          {/* MAIN PAGE LAYOUT */}
          <div className="main-content-area">
            {/* Page Content */}
            <main style={{ flex: 1 }}>
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
              </div>
              <div style={{ display: currentPage === 'exercise' ? 'block' : 'none' }}>
                <ExerciseTracker 
                  user={user} 
                  setCurrentPage={setCurrentPage} 
                  onSessionStateChange={setWorkoutSession}
                />
              </div>
            </main>

            {/* Footer */}
            <footer style={{
              marginTop: 64, paddingBottom: 16, paddingTop: 16,
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  Nutri<span style={{ color: 'var(--accent-lime-text)' }}>Buddy</span>
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· Health Companion</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                Trackers · Budget Planner · Gym Logs
              </div>
            </footer>
          </div>

          {/* MOBILE BOTTOM NAVIGATION */}
          <nav className="mobile-bottom-nav">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: (color) => (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
                  <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
                </svg>
              )},
              { key: 'food-log', label: 'Food Log', icon: (color) => (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              )},
              { key: 'meal-planner', label: 'Planner', icon: (color) => (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              )},
              { key: 'exercise', label: 'Workout', icon: (color) => (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="12" x2="18" y2="12" /><line x1="6" y1="7" x2="6" y2="17" /><line x1="18" y1="7" x2="18" y2="17" />
                  <rect x="2" y="9" width="4" height="6" /><rect x="18" y="9" width="4" height="6" />
                </svg>
              )}
            ].map(nav => {
              const isActive = currentPage === nav.key;
              const activeColor = isActive ? 'var(--accent-lavender-text)' : 'var(--text-muted)';
              return (
                <button
                  key={nav.key}
                  onClick={() => setCurrentPage(nav.key)}
                  className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
                >
                  {nav.icon(activeColor)}
                  <span>{nav.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Floating AI Health Assistant - Rendered outside transformed container to ensure true fixed positioning */}
      {/* {user && <AIChatbot user={user} setCurrentPage={setCurrentPage} />} */}

      {/* Floating Active Workout Banner (Vercel-like Premium Style) */}
      {user && workoutSession && workoutSession.isConsoleMode && currentPage !== 'exercise' && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          right: 24,
          maxWidth: 500,
          margin: '0 auto',
          background: 'var(--bg-surface)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-strong)',
          borderRadius: 16,
          padding: '12px 20px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both'
        }}>
          {/* Left section: Live Indicator, Title, Timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            {/* Pulsing neon lime/warning dot */}
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: workoutSession.restActive ? 'var(--accent-warning-text)' : 'var(--accent-lime-text)',
              boxShadow: workoutSession.restActive ? '0 0 8px var(--accent-warning-text)' : '0 0 8px var(--accent-lime-text)',
              flexShrink: 0
            }} />
            <div style={{ minWidth: 0 }}>
              <span style={{ 
                display: 'block', 
                fontSize: 10, 
                fontWeight: 700, 
                color: 'var(--text-muted)', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em' 
              }}>
                Active Workout {workoutSession.restActive ? '· Rest Phase' : ''}
              </span>
              <span style={{ 
                fontSize: 13, 
                fontWeight: 800, 
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block'
              }}>
                {workoutSession.workoutName} · {workoutSession.currentExerciseName || 'Ready'}
              </span>
            </div>
          </div>

          {/* Right section: Timers + Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ 
                display: 'block', 
                fontSize: 10, 
                fontWeight: 700, 
                color: 'var(--text-muted)', 
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {workoutSession.restActive ? 'Rest Left' : 'Time'}
              </span>
              <span style={{ 
                fontSize: 14, 
                fontWeight: 800, 
                fontFamily: 'var(--font-heading)',
                color: workoutSession.restActive ? 'var(--accent-warning-text)' : 'var(--text-primary)'
              }}>
                {workoutSession.restActive 
                  ? `${Math.floor(workoutSession.restRemaining / 60).toString().padStart(2, '0')}:${(workoutSession.restRemaining % 60).toString().padStart(2, '0')}`
                  : `${Math.floor(workoutSession.elapsedSeconds / 60).toString().padStart(2, '0')}:${(workoutSession.elapsedSeconds % 60).toString().padStart(2, '0')}`
                }
              </span>
            </div>

            <button
              onClick={() => setCurrentPage('exercise')}
              style={{
                background: 'var(--accent-lavender-text)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '8px 18px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'opacity 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
            >
              Resume
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;