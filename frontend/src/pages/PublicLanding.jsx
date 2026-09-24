// ==============================================================================
// PUBLIC LANDING PAGE COMPONENT (PublicLanding.jsx)
// Displayed to guest visitors before login or registration.
// Features a hero banner, animated badge, and trilingual welcome copy.
// ==============================================================================

import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './PublicLanding.css';

const PublicLanding = ({ onOpenRegister }) => {
  // Access current active language from context ('English', 'සිංහල', 'தமிழ்')
  const { language } = useLanguage();

  // Trilingual dictionary for greeting titles and descriptions
  const content = {
    English: {
      badge: 'Smart Farming Future',
      title: 'Welcome to',
      subtitle: 'Your all-in-one smart agricultural companion. Get AI-powered crop recommendations, instant plant disease detection, and expert farming advice right at your fingertips.'
    },
    'සිංහල': {
      badge: 'නවීන කෘෂිකාර්මික අනාගතය',
      title: 'සාදරයෙන් පිළිගනිමු',
      subtitle: 'ඔබේ ස්මාර්ට් කෘෂිකාර්මික සහායකයා. කෘෂිකර්ම දෙපාර්තමේන්තු නිර්දේශිත බෝග උපදෙස්, ක්ෂණික රෝග හඳුනාගැනීම සහ දීපව්‍යාප්ත වෙළඳපල මිල තොරතුරු එකම තැනකින් ලබාගන්න.'
    },
    'தமிழ்': {
      badge: 'நவீன விவசாய எதிர்காலம்',
      title: 'நல்வரவு',
      subtitle: 'உங்கள் ஸ்மார்ட் விவசாய உதவியாளர். AI பயிர் பரிந்துரைகள், தாவர நோய் கண்டறிதல் மற்றும் நாடளாவிய சந்தை விலைகளை ஒரே இடத்தில் பெறுங்கள்.'
    }
  };

  // Select active language text (fallback to English)
  const current = content[language] || content['English'];

  return (
    <div className="public-landing-container fade-in">
      {/* Dark gradient overlay on top of agricultural hero background image */}
      <div className="public-landing-overlay">
        <div className="public-landing-content">
          {/* Animated decorative feature badge */}
          <div className="welcome-badge">
            <Sparkles size={18} />
            <span>{current.badge}</span>
          </div>
          
          {/* Main Hero Header */}
          <h1 className="public-title">
            {current.title} <span className="highlight">AgriSense</span>
          </h1>
          
          {/* Localized Platform Subtitle */}
          <p className="public-subtitle">
            {current.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicLanding;
