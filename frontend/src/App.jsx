import React, { useState, useEffect } from 'react';
import './pages/extras.css';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import TopHeader from './components/Layout/TopHeader';
import Landing from './pages/Landing';
import CropAnalysis from './pages/CropAnalysis';
import DiseaseDetection from './pages/DiseaseDetection';
import CultivationGuide from './pages/CultivationGuide';
import MarketPredictions from './pages/MarketPredictions';
import Profile from './pages/Profile';
import PublicLanding from './pages/PublicLanding';
import AdminDashboard from './pages/AdminDashboard';

/**
 * ScrollToTop Component:
 * Automatically resets window scroll position to the top (0, 0)
 * whenever the route pathname changes, ensuring users never start a page scrolled down.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

/**
 * Main Application Component (App.jsx)
 * ------------------------------------
 * Controls global authentication state, routing, and role-based access.
 * Features:
 *  1. Persistent User Session: Reads and saves user state to browser localStorage ('agrisense_user').
 *  2. Role-Based Navigation: Differentiates standard 'farmer' users and 'admin' users.
 *  3. Conditional View: Renders PublicLanding for unauthenticated guests, and full dashboard for logged-in users.
 *  4. Language Provider: Wraps entire component tree with multi-language context (English/Sinhala/Tamil).
 */
function App() {
  // Global User State initialized from localStorage (or fallback to Guest Farmer default)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('agrisense_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: 'Guest Farmer',
      phone: '',
      email: '',
      role: 'farmer',
      isLoggedIn: false
    };
  });

  // Login handler: Updates memory state and commits credentials/role to localStorage
  const handleLogin = (userObj) => {
    const updated = {
      isLoggedIn: true,
      email: userObj.email,
      name: userObj.name,
      phone: userObj.phone || '',
      role: userObj.role || 'farmer'
    };
    setUser(updated);
    try {
      localStorage.setItem('agrisense_user', JSON.stringify(updated));
    } catch (e) {}
  };

  // Register handler: Creates new session on successful farmer registration
  const handleRegister = (userData) => {
    const updated = {
      isLoggedIn: true,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role || 'farmer'
    };
    setUser(updated);
    try {
      localStorage.setItem('agrisense_user', JSON.stringify(updated));
    } catch (e) {}
  };

  // Profile update handler: Syncs profile edits (e.g. phone, name) into state & localStorage
  const handleUpdateUser = (updatedFields) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedFields };
      try {
        localStorage.setItem('agrisense_user', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Logout handler: Resets state to default guest and purges localStorage token
  const handleLogout = () => {
    const defaultUser = {
      isLoggedIn: false,
      name: 'Guest Farmer',
      email: '',
      phone: '',
      role: 'farmer'
    };
    setUser(defaultUser);
    try {
      localStorage.removeItem('agrisense_user');
    } catch (e) {}
  };

  return (
    // Multilingual Context Provider (Sinhala / Tamil / English)
    <LanguageProvider>
      <Router>
        <ScrollToTop />
        <div className="app-container">
          {/* Main Content Wrapper with Navigation Header */}
          <div className="content-wrapper">
            <TopHeader user={user} onLogin={handleLogin} onRegister={handleRegister} onLogout={handleLogout} />
            
            <main className="main-content" style={!user.isLoggedIn ? { padding: 0, maxWidth: '100%' } : {}}>
              {!user.isLoggedIn ? (
                // Public Routes: Display Landing Page with registration/login modal triggers
                <Routes>
                  <Route path="/" element={<PublicLanding onOpenRegister={() => document.querySelector('.auth-action-btn.register')?.click()} />} />
                  <Route path="/login" element={<PublicLanding onOpenRegister={() => {}} />} />
                  <Route path="/register" element={<PublicLanding onOpenRegister={() => {}} />} />
                  <Route path="/logout" element={<Navigate to="/" replace />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              ) : (
                // Protected Authenticated Routes: Accessible once logged in
                <Routes>
                  {/* Farmer Home Dashboard */}
                  <Route path="/" element={<Landing user={user} />} />

                  {/* Admin Protected Dashboard (Accessible by admins with real-time logs & analytics) */}
                  <Route path="/admin" element={<AdminDashboard user={user} />} />

                  {/* Dual-Factor Crop Suitability & Market Glut Evaluation */}
                  <Route path="/crop-analysis" element={<CropAnalysis user={user} />} />
                  <Route path="/crop-recommendation" element={<CropAnalysis user={user} />} />

                  {/* AI Plant Pathology & DOA Treatment Recommendations */}
                  <Route path="/disease-detection" element={<DiseaseDetection user={user} />} />

                  {/* Step-by-Step Sri Lankan Crop Cultivation Guide */}
                  <Route path="/cultivation-guide" element={<CultivationGuide />} />

                  {/* National Wholesale Market Price Forecasting (Dambulla/Manning) */}
                  <Route path="/market-predictions" element={<MarketPredictions />} />

                  {/* Farmer Profile Settings */}
                  <Route path="/profile" element={<Profile user={user} onUpdateUser={handleUpdateUser} />} />

                  {/* Auth helper routes when logged in */}
                  <Route path="/login" element={<Landing user={user} />} />
                  <Route path="/register" element={<Landing user={user} />} />
                  <Route path="/logout" element={<Navigate to="/" replace />} />

                  {/* 404 Fallback for Unmatched Routes */}
                  <Route path="*" element={
                    <div style={{ textAlign: 'center', marginTop: '100px', background: '#ffffff', padding: '3rem', borderRadius: '16px', border: '1.5px solid var(--border-color)' }}>
                      <h2>404 - Page Not Found</h2>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>The requested agricultural page could not be located.</p>
                    </div>
                  } />
                </Routes>
              )}
            </main>
          </div>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
