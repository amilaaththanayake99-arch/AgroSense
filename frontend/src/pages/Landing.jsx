// ==============================================================================
// LOGGED-IN FARMER HOME DASHBOARD (Landing.jsx)
// Provides instant access to:
//  1. Crop Suitability Analysis (/crop-analysis)
//  2. AI Vision Disease Detection (/disease-detection)
//  3. Live 7-Day Agricultural Weather Forecast Widget
// ==============================================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  Stethoscope, 
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './Landing.css';
import WeatherForecastWidget from '../components/WeatherForecastWidget';

const Landing = () => {
  // Navigation hook for seamless client-side page routing
  const navigate = useNavigate();
  // Translation hook for multi-language label rendering
  const { t } = useLanguage();

  return (
    <div className="home-single-frame-container fade-in">
      
      {/* Top Welcome Title & Friendly Subtitle */}
      <div className="welcome-header-compact">
        <h1 className="main-welcome-title">
          {t('welcomeTo', 'Welcome to')} <span className="highlight-text">AgriSense AI</span> {t('smartFarming', 'Smart Farming')}
        </h1>
        <p className="welcome-subtitle">
          {t('welcomeSub', 'Smart farming made simple — crop recommendations, plant disease detection, and expert agricultural advice.')}
        </p>
      </div>

      {/* Main Single-Screen Grid (Photo + 3 Services side-by-side: No Scrolling Needed) */}
      <div className="home-main-split-grid">
        
        {/* Left Side: High-Resolution HD Farm Photo Panel with fallback image error handling */}
        <div className="hero-photo-panel glass-panel">
          <div className="hero-photo-inner">
            <img 
              src="/assets/farmer_hero.jpg" 
              alt="Smart Sustainable Agriculture" 
              className="hero-hd-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/hero_farm.jpg';
              }}
            />
          </div>
        </div>

        {/* Right Side: 3 Interactive Service Action Cards */}
        <div className="services-vertical-stack">
          
          {/* Service Card 1: Dual-Factor Crop Suitability Recommendation */}
          <div className="service-card-compact" onClick={() => navigate('/crop-analysis')}>
            <div className="service-icon-box bg-green">
              <Sprout size={24} />
            </div>
            <div className="service-content">
              <div className="service-header-line">
                <h3>{t('cropRecommendation', 'Crop Recommendation')}</h3>
                <span className="service-tag">{t('soilClimateTag', 'Soil & Climate')}</span>
              </div>
              <p>{t('cropRecCardDesc', 'Find the most profitable and suitable crops for your land location.')}</p>
            </div>
            <div className="service-arrow-wrap">
              <ArrowRight size={20} className="service-arrow" />
            </div>
          </div>

          {/* Service Card 2: AI Vision Leaf Disease Detection */}
          <div className="service-card-compact" onClick={() => navigate('/disease-detection')}>
            <div className="service-icon-box bg-amber">
              <Stethoscope size={24} />
            </div>
            <div className="service-content">
              <div className="service-header-line">
                <h3>{t('diseaseDetection', 'Disease Detection')}</h3>
                <span className="service-tag">{t('aiVisionTag', 'AI Vision')}</span>
              </div>
              <p>{t('diseaseDetCardDesc', 'Upload a diseased leaf photo for instant identification and treatment.')}</p>
            </div>
            <div className="service-arrow-wrap">
              <ArrowRight size={20} className="service-arrow" />
            </div>
          </div>

          {/* Service Card 3: Embedded Real-Time 7-Day Weather Forecast Widget */}
          <div className="service-card-compact" style={{ cursor: 'default', display: 'block' }}>
            <WeatherForecastWidget />
          </div>

        </div>

      </div>

    </div>
  );
};

export default Landing;
