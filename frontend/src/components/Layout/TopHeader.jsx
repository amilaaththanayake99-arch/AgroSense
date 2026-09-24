import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Settings, LogIn, LogOut, User, ChevronDown, Home, Sprout, Stethoscope, UserPlus, Globe, ShieldCheck } from 'lucide-react';
import { LoginModal, RegisterModal } from '../Auth/AuthModals';
import { useLanguage } from '../../context/LanguageContext';
import './TopHeader.css';

const TopHeader = ({ user, onLogin, onRegister, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  useEffect(() => {
    if (location.pathname === '/register' || location.search.includes('action=register')) {
      if (user.isLoggedIn) {
        onLogout();
      }
      setShowRegisterModal(true);
      setShowLoginModal(false);
    } else if (location.pathname === '/login' || location.search.includes('action=login')) {
      setShowLoginModal(true);
      setShowRegisterModal(false);
    } else if (location.pathname === '/logout' || location.search.includes('logout')) {
      if (user.isLoggedIn) {
        onLogout();
      }
      setShowRegisterModal(false);
      setShowLoginModal(false);
      navigate('/', { replace: true });
    }
  }, [location.pathname, location.search]);

  const navItems = [
    { path: '/', icon: Home, label: t('home', 'Home') },
    { path: '/crop-analysis', icon: Sprout, label: t('cropRecommendation', 'Crop Recommendation') },
    { path: '/disease-detection', icon: Stethoscope, label: t('diseaseDetection', 'Disease Detection') }
  ];

  if (user && user.role === 'admin') {
    navItems.push({ path: '/admin', icon: ShieldCheck, label: t('adminDashboard', 'Admin Dashboard') });
  }


  return (
    <>
      <header className="top-header-minimal">
        <div className="header-top-row">
          <div className="header-spacer"></div>
          
          <div className="header-brand" onClick={() => navigate('/')}>
            <div className="logo-badge">
              <Sprout size={24} className="sprout-icon" />
            </div>
            <div className="brand-titles">
              <h2 className="brand-title">Agri<span>Sense</span></h2>
            </div>
          </div>
          
          <div className="header-right">
            {/* Language Selector */}
            <div className="language-selector-container">
              <button 
                className="language-btn" 
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                title={t('selectLanguage', 'Select Language')}
              >
                <Globe size={15} className="text-primary-dark" />
                <span style={{ fontWeight: 600 }}>{language}</span>
                <ChevronDown size={14} />
              </button>
              
              {showLangDropdown && (
                <div className="language-dropdown-menu glass-panel fade-in">
                  {availableLanguages.map(lang => (
                    <button 
                      key={lang} 
                      className={`dropdown-item ${language === lang ? 'active-lang' : ''}`}
                      onClick={() => {
                        setLanguage(lang);
                        setShowLangDropdown(false);
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile Avatar & Login Button */}
            <div className="profile-menu-container">
            {user.isLoggedIn && (
              <div 
                className="user-profile-circle" 
                onClick={() => setShowDropdown(!showDropdown)}
                title="Profile Menu"
              >
                <img 
                  src={user?.avatar || "/assets/profile_face.jpg"} 
                  alt="User Avatar" 
                  className="avatar-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
            )}

            <div className="auth-buttons-group">
              {user.isLoggedIn ? (
                <button 
                  className="login-chip-btn logged-in"
                  onClick={() => navigate(user.role === 'admin' ? '/admin' : '/profile')}
                >
                  <span className="user-name">{user.name.split(' ')[0]}</span>
                  <span className={`user-role-badge ${user.role === 'admin' ? 'admin-badge-highlight' : ''}`}>
                    {user.role === 'admin' ? 'Admin' : t('farmerRole', 'Farmer')}
                  </span>
                  <ChevronDown size={14} />
                </button>
              ) : (
                <>
                  <button className="auth-action-btn login" onClick={() => setShowLoginModal(true)}>
                    <LogIn size={15} />
                    <span>{t('login', 'Login')}</span>
                  </button>
                  <button className="auth-action-btn register" onClick={() => setShowRegisterModal(true)}>
                    <UserPlus size={15} />
                    <span>{t('createAccount', 'Create Account')}</span>
                  </button>
                </>
              )}
            </div>

            {showDropdown && (
              <div className="header-dropdown-menu glass-panel fade-in">
                <div className="dropdown-user-info" onClick={() => { navigate(user.role === 'admin' ? '/admin' : '/profile'); setShowDropdown(false); }}>
                  <img src={user?.avatar || "/assets/profile_face.jpg"} alt="Profile" className="dropdown-avatar" />
                  <div>
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                    <span className="role-mini-pill">{user.role === 'admin' ? 'System Administrator' : 'Farmer'}</span>
                  </div>
                </div>
                {user.role === 'admin' && (
                  <>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" style={{ color: '#2e7d32', fontWeight: 600 }} onClick={() => { navigate('/admin'); setShowDropdown(false); }}>
                      <ShieldCheck size={16} /> {t('adminDashboard', 'Admin Dashboard')}
                    </button>
                  </>
                )}
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={() => { navigate('/profile'); setShowDropdown(false); }}>
                  <User size={16} /> {t('profile', 'My Profile')}
                </button>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item text-danger" 
                  onClick={() => {
                    onLogout();
                    setShowDropdown(false);
                    navigate('/');
                  }}
                >
                  <LogOut size={16} /> {t('logout', 'Logout')}
                </button>
              </div>
            )}
          </div>
          </div>
        </div>

        {user.isLoggedIn && (
          <div className="header-bottom-row">
            <nav className="header-nav">
              {navItems.map((item) => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={20} className="nav-icon" />
                  <span className="nav-title">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          onLogin={(userObj) => {
            onLogin(userObj);
            setShowLoginModal(false);
            if (userObj && userObj.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/');
            }
          }} 
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}

      {showRegisterModal && (
        <RegisterModal 
          onClose={() => setShowRegisterModal(false)} 
          onRegister={(data) => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }} 
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </>
  );
};

export default TopHeader;
