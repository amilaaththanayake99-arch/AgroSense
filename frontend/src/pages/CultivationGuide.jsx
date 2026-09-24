import React, { useState } from 'react';
import { MapPin, Navigation, BookOpen, Search, ChevronDown, CheckCircle2, Clock, Leaf, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getCultivationGuide } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import './CultivationGuide.css';

const crops = ['Rice', 'Tea', 'Coconut', 'Rubber', 'Cinnamon', 'Pepper', 'Chili', 'Tomato', 'Brinjal', 'Banana', 'Mango', 'Potato', 'Onion', 'Ginger', 'Turmeric'];

const CultivationGuide = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ crop: 'Rice', lat: null, lon: null, locationName: '' });
  const [loading, setLoading] = useState(false);
  const [guide, setGuide] = useState(null);
  const [expandedStep, setExpandedStep] = useState(0);
  const [error, setError] = useState('');

  const getLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({ ...prev, lat: pos.coords.latitude, lon: pos.coords.longitude, locationName: 'GPS Location' }));
        setLoading(false);
      },
      () => { setError('Could not get location'); setLoading(false); }
    );
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.lat || !formData.lon) { setError('Please detect your GPS location first.'); return; }
    setLoading(true);
    setError('');
    setGuide(null);

    try {
      const data = await getCultivationGuide({
        crop_name: formData.crop,
        lat: formData.lat,
        lon: formData.lon
      });

      // Backend returns { location, guide: { crop_name, total_duration, steps, ... } }
      const guideData = data.guide ?? data;
      setGuide(guideData);
      setExpandedStep(0);
    } catch (err) {
      setError(err.message || 'Failed to generate guide. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const steps = guide?.steps ?? [];

  return (
    <div className="page-wrapper">
      <div className="page-header text-center">
        <h1>{t('smartGuideTitle', 'Smart Cultivation Guide')}</h1>
        <p>{t('smartGuideSub', 'Get a detailed, AI-generated step-by-step farming plan tailored for your location.')}</p>
      </div>

      <div className="guide-layout">
        {/* Form */}
        <div className="guide-form-panel glass-panel">
          <form onSubmit={handleGenerate} className="guide-form">
            <div className="form-group">
              <label><BookOpen size={16}/> {t('selectCrop', 'Select Crop')}</label>
              <select value={formData.crop} onChange={(e) => setFormData({...formData, crop: e.target.value})}>
                {crops.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label><MapPin size={16}/> {t('yourLocation', 'Your Location')}</label>
              <div className="location-input-group">
                <input type="text" value={formData.locationName} placeholder={t('clickGpsToDetect', 'Click GPS to detect')} readOnly />
                <button type="button" className="btn-icon" onClick={getLocation}><Navigation size={20}/></button>
              </div>
              {formData.lat && <span className="coords-badge">{formData.lat.toFixed(4)}, {formData.lon.toFixed(4)}</span>}
            </div>

            {error && <div className="error-msg"><AlertTriangle size={16}/> {error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('generatingGuide', 'Generating...') : <><Search size={20}/> {t('generateGuideBtn', 'Generate Cultivation Guide')}</>}
            </button>
          </form>
        </div>

        {/* Guide content */}
        <div className="guide-content-panel">
          {loading ? (
            <div className="glass-panel centered-panel">
              <LoadingSpinner message="Gemini AI is generating your cultivation plan..." />
            </div>
          ) : guide ? (
            <div className="timeline-container fade-in">
              <div className="guide-meta-row">
                <h2 className="timeline-title">
                  <Leaf size={22}/> {guide.crop_name ?? formData.crop} Cultivation Guide
                </h2>
                {guide.total_duration && (
                  <span className="duration-badge"><Clock size={14}/> {guide.total_duration}</span>
                )}
              </div>

              {/* Best varieties */}
              {guide.best_varieties?.length > 0 && (
                <div className="varieties-row glass-panel">
                  <h4>Recommended Varieties</h4>
                  <div className="variety-tags">
                    {guide.best_varieties.map((v, i) => <span key={i} className="variety-tag">{v}</span>)}
                  </div>
                </div>
              )}

              {/* Timeline steps */}
              <div className="timeline">
                {steps.map((step, idx) => (
                  <div key={idx} className={`timeline-item ${expandedStep === idx ? 'expanded' : ''}`}>
                    <div className="timeline-marker">
                      <div className={`marker-dot ${expandedStep >= idx ? 'active-marker' : ''}`}>
                        {step.icon ?? <CheckCircle2 size={20}/>}
                      </div>
                      {idx < steps.length - 1 && <div className="timeline-line"/>}
                    </div>
                    <div
                      className="timeline-content glass-panel"
                      onClick={() => setExpandedStep(expandedStep === idx ? -1 : idx)}
                    >
                      <div className="timeline-header">
                        <div>
                          <h3>{idx + 1}. {step.stage ?? step.title}</h3>
                          {step.duration && <span className="step-duration"><Clock size={12}/> {step.duration}</span>}
                        </div>
                        <ChevronDown size={20} className={`chevron ${expandedStep === idx ? 'rotate' : ''}`} />
                      </div>
                      {expandedStep === idx && (
                        <div className="timeline-body fade-in">
                          {Array.isArray(step.tasks) ? (
                            <ul className="task-list">
                              {step.tasks.map((task, ti) => <li key={ti}>{task}</li>)}
                            </ul>
                          ) : (
                            <p>{step.content}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Weather alerts */}
              {guide.weather_alerts?.length > 0 && (
                <div className="weather-alerts glass-panel">
                  <h4><AlertTriangle size={16}/> Weather Alerts for Your Region</h4>
                  <ul>{guide.weather_alerts.map((a, i) => <li key={i}>{a}</li>)}</ul>
                </div>
              )}

              {/* Expected yield */}
              {guide.expected_yield_per_acre && (
                <div className="yield-badge glass-panel">
                  Expected Yield: <strong>{guide.expected_yield_per_acre}</strong>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel centered-panel placeholder-panel">
              <BookOpen size={48} className="placeholder-icon" />
              <p>Detect your GPS location, select a crop, and click <strong>Generate Guide</strong>.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CultivationGuide;
