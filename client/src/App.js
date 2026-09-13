import React, { useState, useEffect } from 'react';
import './App.css';

import UserProfileForm from './pages/UserProfileForm';
import Dashboard from './pages/Dashboard';
import FoodLogger from './pages/FoodLogger';
import WeeklyMealPlanner from './pages/WeeklyMealPlanner';
import ExerciseTracker from './pages/ExerciseTracker';
import UserProfileDetails from './pages/UserProfileDetails';
import GlobalSearchModal from './components/GlobalSearchModal';
import FloatingWorkoutBar from './components/FloatingWorkoutBar';
import { Search } from 'lucide-react';
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
  const onCompleteRef = React.useRef(onComplete);
  const onExitStartRef = React.useRef(onExitStart);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onExitStartRef.current = onExitStart;
  });

  useEffect(() => {
    let start = 0;
    const end = 100;
    const duration = 750; // Snappy 0.75s loading speed
    const stepTime = Math.max(6, Math.floor(duration / end));

    const timer = setInterval(() => {
      start += 2;
      setPercent(Math.min(100, start));
      if (start >= end) {
        clearInterval(timer);
        setExiting(true);
        if (onExitStartRef.current) onExitStartRef.current();
        setTimeout(() => {
          if (onCompleteRef.current) onCompleteRef.current();
        }, 350);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

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
                animationDelay: `${index * 50}ms`,
                color: index >= 5 ? 'var(--brand-primary)' : 'var(--text-primary)'
              }}
              className="splash-char"
            >
              {char}
            </span>
          ))}
        </h1>
        <div className="landing-splash-sub-animated">
          Your Smart Nutrition Companion
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
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('nutribuddy_user');
      if (savedUser && savedUser !== 'null') {
        const userData = JSON.parse(savedUser);
        if (userData && (userData.fullName || userData.id)) {
          return userData;
        }
      }
    } catch (e) { }
    return null;
  });

  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const savedUser = localStorage.getItem('nutribuddy_user');
      const savedPage = localStorage.getItem('nutribuddy_current_page');
      if (savedUser && savedUser !== 'null') {
        return savedPage || 'dashboard';
      }
    } catch (e) { }
    return 'profile';
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('nutribuddy_theme') || 'dark');
  const [showSplash, setShowSplash] = useState(true);
  const [introActive, setIntroActive] = useState(false);
  const [revealMain, setRevealMain] = useState(false);
  const [workoutSession, setWorkoutSession] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    localStorage.getItem('nutribuddy_sidebar_collapsed') === 'true'
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K keyboard shortcut listener for search modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Safety fallback: Ensure splash screen never stays longer than 1.6 seconds under any condition
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setRevealMain(true);
      setShowSplash(false);
    }, 1600);
    return () => clearTimeout(safetyTimer);
  }, []);

  const toggleSidebar = () => {
    const nextVal = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextVal);
    localStorage.setItem('nutribuddy_sidebar_collapsed', nextVal.toString());
  };

  const handleNavigate = (pageKey) => {
    if (pageKey === 'exercise' && workoutSession && typeof workoutSession.onResume === 'function') {
      workoutSession.onResume();
    }
    setCurrentPage(pageKey);
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
      user.isGymGoer === true ||
      (user.gymDays !== undefined && parseInt(user.gymDays, 10) > 0) ||
      user.activityLevel === 'active' || 
      user.activityLevel === 'very-active' || 
      user.fitnessGoal === 'muscle' || 
      user.fitnessGoal === 'lean-muscle' ||
      user.goal === 'muscle' ||
      user.goal === 'lean_bulk' ||
      user.goal === 'aggressive_bulk'
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
    setRevealMain(true);
    setShowSplash(false);
  };

  const handleSplashExitStart = React.useCallback(() => {
    setRevealMain(true);
  }, []);

  const handleSplashComplete = React.useCallback(() => {
    setShowSplash(false);
    setRevealMain(true);
    setIntroActive(true);
    setTimeout(() => setIntroActive(false), 2000);
  }, []);

  // Onboarding page — full screen, no header
  const isOnboarding = currentPage === 'profile' && (!user || isEditingProfile);

  return (
    <>
      {/* Global Orbital Animated Background */}
      <OrbitalBackground isIntro={introActive} />

      {/* Landing Splash Overlay */}
      {showSplash && (
        <LandingSplash 
          onExitStart={handleSplashExitStart}
          onComplete={handleSplashComplete} 
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
          {/* MOBILE / TOP HEADER BAR */}
          <header className="mobile-header-bar">
            <h1 style={{ fontSize: 20, margin: 0, fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#ffffff', fontWeight: 700 }}>Nutri</span>
              <span style={{ color: 'var(--color-green)', fontWeight: 700 }}>Buddy</span>
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => setIsSearchOpen(true)}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', padding: 0,
                  color: 'var(--text-muted)',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  transition: 'background 0.2s ease'
                }}
                onMouseDown={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseUp={(e) => e.currentTarget.style.background = 'transparent'}
                title="Search foods, exercises, recipes (Ctrl+K)"
              >
                <Search size={20} />
              </button>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', padding: 0,
                  color: 'var(--text-muted)',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  transition: 'background 0.2s ease'
                }}
                onMouseDown={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseUp={(e) => e.currentTarget.style.background = 'transparent'}
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'light' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                )}
              </button>
              <button
                onClick={() => {
                  setCurrentPage('profile');
                  setIsEditingProfile(false);
                }}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--color-green)',
                  color: '#0a1a10',
                  border: '2px solid rgba(34, 209, 122, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', padding: 0,
                  fontSize: 16, fontWeight: 700,
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                title="My Profile"
              >
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
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
              marginBottom: 28,
              paddingLeft: isSidebarCollapsed ? 0 : 4,
              minHeight: 36,
              position: 'relative'
            }}>
              {!isSidebarCollapsed ? (
                <>
                  <div>
                    <h1 style={{ fontSize: 20, margin: 0, fontWeight: 900, letterSpacing: '-0.03em', fontFamily: 'var(--font-heading)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={toggleSidebar}>
                      Nutri<span style={{ color: 'var(--brand-primary-light)' }}>Buddy</span><span style={{ color: 'var(--brand-primary-light)', animation: 'greenPulse 1.4s infinite alternate' }}>_</span>
                    </h1>
                    <div style={{ fontSize: 9.5, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2 }}>
                      Core // v2.4
                    </div>
                  </div>
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
                    <span className="sidebar-tooltip">Collapse</span>
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
                  <span className="sidebar-tooltip">Open</span>
                </button>
              )}
            </div>

            {/* Quick Global Search Trigger in Sidebar */}
            <div style={{ marginBottom: 12, paddingLeft: isSidebarCollapsed ? 0 : 2, paddingRight: isSidebarCollapsed ? 0 : 2 }}>
              <button
                onClick={() => setIsSearchOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                  width: '100%',
                  padding: isSidebarCollapsed ? '10px 0' : '9px 12px',
                  borderRadius: 10,
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                title="Search foods, exercises, recipes (Ctrl+K)"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Search size={14} style={{ color: 'var(--brand-primary-light)' }} />
                  {!isSidebarCollapsed && <span>Search...</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    color: 'var(--text-muted)'
                  }}>
                    Ctrl K
                  </span>
                )}
              </button>
            </div>

            {/* Sidebar navigation links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              {[
                { key: 'dashboard', label: 'Dashboard', tag: 'Home', icon: (color) => (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
                    <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
                  </svg>
                )},
                { key: 'food-log', label: 'Food Log', tag: 'Food', icon: (color) => (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                )},
                { key: 'meal-planner', label: 'Meal Planner', tag: 'Meals', icon: (color) => (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                )},
                { key: 'exercise', label: 'Workout Console', tag: 'Workouts', icon: (color) => (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="6" y1="12" x2="18" y2="12" /><line x1="6" y1="7" x2="6" y2="17" /><line x1="18" y1="7" x2="18" y2="17" />
                    <rect x="2" y="9" width="4" height="6" /><rect x="18" y="9" width="4" height="6" />
                  </svg>
                )}
              ].map(nav => {
                const isActive = currentPage === nav.key;
                const activeColor = isActive ? 'var(--brand-primary-light)' : 'var(--text-muted)';
                return (
                  <button
                    key={nav.key}
                    onClick={() => handleNavigate(nav.key)}
                    className="sidebar-nav-item"
                    style={{
                      padding: '11px 14px',
                      fontSize: 13,
                      borderRadius: 10,
                      border: isActive ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid transparent',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontWeight: isActive ? 800 : 500,
                      color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                      background: isActive ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                      transition: 'all 0.18s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                      boxSizing: 'border-box',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: '15%',
                        bottom: '15%',
                        width: 3,
                        borderRadius: '0 4px 4px 0',
                        background: 'var(--brand-primary-light)',
                        boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)'
                      }} />
                    )}
                    {nav.icon(activeColor)}
                    {!isSidebarCollapsed ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span>{nav.label}</span>
                        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: isActive ? 'var(--brand-primary-light)' : 'var(--text-muted)', opacity: isActive ? 1 : 0.6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {nav.tag}
                        </span>
                      </div>
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
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--color-green, #22d17a)',
                    color: '#0a1a10',
                    border: currentPage === 'profile' ? '2px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', padding: 0,
                    fontSize: 14, fontWeight: 700,
                    boxShadow: '0 2px 10px rgba(34, 209, 122, 0.25)', transition: 'all 0.2s ease',
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
          <div className={`main-content-area ${workoutSession && workoutSession.isSessionActive && currentPage !== 'exercise' ? 'has-floating-workout' : ''}`}>
            {/* Page Content */}
            <main style={{ flex: 1, minHeight: 'calc(100vh - 200px)' }}>
              <div key={currentPage} className="fadeInUp" style={{ animationDuration: '0.6s' }}>
                {currentPage === 'profile' && user && !isEditingProfile && (
                  <UserProfileDetails 
                    user={user} 
                    onEdit={() => setIsEditingProfile(true)} 
                    onLogout={handleLogout} 
                    setCurrentPage={setCurrentPage}
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
          </div>

          {/* MOBILE BOTTOM NAVIGATION */}
          {!(workoutSession && workoutSession.isSessionActive && workoutSession.isInsideConsole && currentPage === 'exercise') && (
            <nav className="mobile-bottom-nav">
              {[
                { key: 'dashboard', label: 'Home', icon: (color) => (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
                    <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
                  </svg>
                )},
                { key: 'food-log', label: 'Food', icon: (color) => (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                )},
                { key: 'meal-planner', label: 'Meals', icon: (color) => (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                )},
                { key: 'exercise', label: 'Workouts', icon: (color) => (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="6" y1="12" x2="18" y2="12" /><line x1="6" y1="7" x2="6" y2="17" /><line x1="18" y1="7" x2="18" y2="17" />
                    <rect x="2" y="9" width="4" height="6" /><rect x="18" y="9" width="4" height="6" />
                  </svg>
                )}
              ].map(nav => {
                const isActive = currentPage === nav.key;
                const activeColor = isActive ? 'var(--color-green)' : 'var(--text-muted)';
                return (
                  <button
                    key={nav.key}
                    onClick={() => handleNavigate(nav.key)}
                    className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
                  >
                    {nav.icon(activeColor)}
                    <span>{nav.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      )}

      {/* Floating Active Workout Capsule (Elevated Obsidian Emerald Pill) */}
      {user && workoutSession && workoutSession.isSessionActive && (currentPage !== 'exercise' || !workoutSession.isInsideConsole) && (
        <FloatingWorkoutBar
          workoutSession={workoutSession}
          onNavigateToExercise={() => setCurrentPage('exercise')}
        />
      )}

      {/* GLOBAL UNIVERSAL SEARCH MODAL */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(page) => {
          setCurrentPage(page);
          setIsEditingProfile(false);
        }}
        user={user}
      />
    </>
  );
}

export default App;