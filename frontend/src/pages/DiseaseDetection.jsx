// ==============================================================================
// PLANT PATHOLOGY & DISEASE DETECTION VIEW (DiseaseDetection.jsx)
// Features:
//  1. Image upload via Drag-and-Drop or Native File Picker.
//  2. Real-time preview and client-side validation.
//  3. Multipart HTTP transmission to FastAPI endpoint (/api/disease/detect).
//  4. Gemini Vision plant pathology diagnosis with confidence and severity scores.
//  5. Department of Agriculture (DOA) Sri Lanka certified chemical & organic remedies.
//  6. Embedded Agri-AI Chatbot Assistant configured in 'disease' mode.
// ==============================================================================

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  Image as ImageIcon, 
  RefreshCw, 
  X,
  CheckCircle2,
  Sprout,
  MapPin
} from 'lucide-react';
import { detectDisease } from '../services/api';
import ChatWidget from '../components/common/ChatWidget';
import { useLanguage } from '../context/LanguageContext';
import './DiseaseDetection.css';

// 25 Districts of Sri Lanka with strict trilingual translations
const SRI_LANKA_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", 
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", 
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", 
  "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", 
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

const DISTRICT_TRANSLATIONS = {
  'Ampara': { 'English': 'Ampara', 'සිංහල': 'අම්පාර', 'தமிழ்': 'அம்பாறை' },
  'Anuradhapura': { 'English': 'Anuradhapura', 'සිංහල': 'අනුරාධපුරය', 'தமிழ்': 'அநுராதபுரம்' },
  'Badulla': { 'English': 'Badulla', 'සිංහල': 'බදුල්ල', 'தமிழ்': 'பதுளை' },
  'Batticaloa': { 'English': 'Batticaloa', 'සිංහල': 'මඩකලපුව', 'தமிழ்': 'மட்டக்களப்பு' },
  'Colombo': { 'English': 'Colombo', 'සිංහල': 'කොළඹ', 'தமிழ்': 'கொழும்பு' },
  'Galle': { 'English': 'Galle', 'සිංහල': 'ගාල්ල', 'தமிழ்': 'காலி' },
  'Gampaha': { 'English': 'Gampaha', 'සිංහල': 'ගම්පහ', 'தமிழ்': 'கம்பஹா' },
  'Hambantota': { 'English': 'Hambantota', 'සිංහල': 'හම්බන්තොට', 'தமிழ்': 'அம்பாந்தோட்டை' },
  'Jaffna': { 'English': 'Jaffna', 'සිංහල': 'යාපනය', 'தமிழ்': 'யாழ்ப்பாணம்' },
  'Kalutara': { 'English': 'Kalutara', 'සිංහල': 'කළුතර', 'தமிழ்': 'களுத்துறை' },
  'Kandy': { 'English': 'Kandy', 'සිංහල': 'මහනුවර', 'தமிழ்': 'கண்டி' },
  'Kegalle': { 'English': 'Kegalle', 'සිංහල': 'කෑගල්ල', 'தமிழ்': 'கேகாலை' },
  'Kilinochchi': { 'English': 'Kilinochchi', 'සිංහල': 'කිලිනොච්චිය', 'தமிழ்': 'கிளிநொச்சி' },
  'Kurunegala': { 'English': 'Kurunegala', 'සිංහල': 'කුරුණෑගල', 'தமிழ்': 'குருநாகல்' },
  'Mannar': { 'English': 'Mannar', 'සිංහල': 'මන්නාරම', 'தமிழ்': 'மன்னார்' },
  'Matale': { 'English': 'Matale', 'සිංහල': 'මාතලේ', 'தமிழ்': 'மாத்தளை' },
  'Matara': { 'English': 'Matara', 'සිංහල': 'මාතර', 'தமிழ்': 'மாத்தறை' },
  'Monaragala': { 'English': 'Monaragala', 'සිංහල': 'මොණරාගල', 'தமிழ்': 'மொணராகலை' },
  'Mullaitivu': { 'English': 'Mullaitivu', 'සිංහල': 'මුලතිව්', 'தமிழ்': 'முல்லைத்தீவு' },
  'Nuwara Eliya': { 'English': 'Nuwara Eliya', 'සිංහල': 'නුවරඑළිය', 'தமிழ்': 'நுவரெலியா' },
  'Polonnaruwa': { 'English': 'Polonnaruwa', 'සිංහල': 'පොළොන්නරුව', 'தமிழ்': 'பொலன்னறுவை' },
  'Puttalam': { 'English': 'Puttalam', 'සිංහල': 'පුත්තලම', 'தமிழ்': 'புத்தளம்' },
  'Ratnapura': { 'English': 'Ratnapura', 'සිංහල': 'රත්නපුර', 'தமிழ்': 'இரத்தினபுரி' },
  'Trincomalee': { 'English': 'Trincomalee', 'සිංහල': 'ත්‍රිකුණාමලය', 'தமிழ்': 'திருகோணமலை' },
  'Vavuniya': { 'English': 'Vavuniya', 'සිංහල': 'වවුනියාව', 'தமிழ்': 'வவுனியா' }
};

/**
 * Strips cross-language script artifacts (e.g. leftover Tamil/Sinhala glyphs or empty parens)
 * to ensure pure English display when the UI is in English mode.
 */
const cleanDisplayByLanguage = (text, lang) => {
  if (!text || typeof text !== 'string') return text;
  if (!lang || lang === 'English') {
    let cleaned = text.replace(/[\u0D80-\u0DFF\u0B80-\u0BFF\u200B-\u200D]/g, '');
    cleaned = cleaned
      .replace(/\(\s*[/,-]?\s*\)/g, '')
      .replace(/\[\s*[/,-]?\s*\]/g, '')
      .replace(/\s*\/\s*\)/g, ')')
      .replace(/\(\s*\/\s*/g, '(')
      .replace(/\s*[/,-]\s*$/g, '')
      .replace(/^\s*[/,-]\s*/, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return cleaned;
  }
  return text;
};

const DiseaseDetection = ({ user }) => {
  // Multilingual translation and locale context
  const { language, t } = useLanguage();
  
  // Hidden native file input reference for programmatic triggering
  const fileInputRef = useRef(null);
  
  // Component local states
  const [file, setFile] = useState(null);               // Selected raw binary File object
  const [previewUrl, setPreviewUrl] = useState(null);   // Object URL for local browser preview
  const [cropName, setCropName] = useState('');         // Optional host crop name (e.g. Tomato, Paddy)
  const [district, setDistrict] = useState(() => {
    try {
      const saved = localStorage.getItem('agrisense_last_district');
      if (saved) return saved;
    } catch (e) {}
    return 'Jaffna';
  });
  const [loading, setLoading] = useState(false);        // Loading state during AI inference
  const [isDragOver, setIsDragOver] = useState(false);  // Visual highlight for drag-and-drop zone
  const [diagnosisMessage, setDiagnosisMessage] = useState(null); // Received pathology diagnostic report

  const handleDistrictChange = (newDist) => {
    setDistrict(newDist);
    try {
      localStorage.setItem('agrisense_last_district', newDist);
    } catch (e) {}
  };

  // Handles image selection and creates client-side preview URL
  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setDiagnosisMessage(null);
    }
  };

  // Triggered when file selected via operating system file dialog
  const handleFileInputChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      handleFileSelect(selected);
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  // Resets uploaded photo to allow farmer to upload a different sample
  const handleRemovePhoto = () => {
    setFile(null);
    setPreviewUrl(null);
    setDiagnosisMessage(null);
  };

  /**
   * Dispatches the uploaded leaf image and metadata to the FastAPI backend.
   * On success, updates state with the full diagnosis report and DOA treatments.
   */
  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const userEmail = user?.email || 'Guest Farmer';
      const userName = user?.name || 'Guest Farmer';
      const cleanCropName = cropName.trim();
      
      // Call backend API service
      const data = await detectDisease(file, cleanCropName, userEmail, userName, language, district);

      // Populate diagnosis state
      setDiagnosisMessage({
        isValid: data.is_valid_leaf !== false,
        unprocessableReason: data.unprocessable_reason || null,
        disease: data.disease_name || 'Diagnosed Plant Disease',
        crop: data.affected_crop || cleanCropName || 'Plant Sample',
        confidence: Math.round((data.confidence || 0.95) * 100),
        severity: data.severity || 'Moderate',
        symptoms: data.symptoms || '',
        causes: data.causes || '',
        chemicalTreatment: data.chemical_treatment || null,
        organicTreatment: data.organic_treatment || null,
        prevention: data.prevention || []
      });
    } catch (err) {
      console.error("Disease detection error:", err);
      // Handle network or processing errors gracefully
      setDiagnosisMessage({
        isValid: false,
        unprocessableReason: err.message || 'Unable to communicate with the AI model or process image. Please try again with a clearer leaf photo.',
        disease: 'Detection Failed',
        confidence: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="disease-upload-only-container fade-in">
      <div className="page-header">
        <h1>{t('diseaseTitle', 'Plant Disease Detection')}</h1>
      </div>

      <div className="page-content-grid">
        <div className="disease-upload-card glass-panel">
        
        {/* If NO photo is uploaded yet: Instruction guide with 2 steps, plant input box, and dropzone */}
        {!previewUrl ? (
          <div className="upload-prompt-container">
            <p className="upload-guide-line-sub">
              {t('followStepsNotice', 'Follow the simple steps below:')}
            </p>

            {/* 2 Step Process - Stacked in 2 lines */}
            <div className="disease-steps-list">
              <div className="disease-step-row">
                <div className="disease-step-num">1</div>
                <div className="disease-step-body">
                  <span className="disease-step-title">{t('step1Title', 'Take a Clear Leaf Photo')}:</span>
                  <span className="disease-step-desc">{t('step1Desc', 'Focus closely on a single affected leaf with good natural lighting.')}</span>
                </div>
              </div>
              <div className="disease-step-row">
                <div className="disease-step-num">2</div>
                <div className="disease-step-body">
                  <span className="disease-step-title">{t('step2Title', 'Upload Leaf Image')}:</span>
                  <span className="disease-step-desc">{t('step2Desc', 'Click the button below or drag & drop the photo into the box.')}</span>
                </div>
              </div>
            </div>

            {/* Input boxes for user to select District and enter affected plant/crop name */}
            <div className="disease-inputs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem', width: '100%', maxWidth: '820px' }}>
              {/* District Selector */}
              <div className="plant-input-card">
                <label htmlFor="disease-district-select" className="plant-input-label">
                  <MapPin size={18} className="plant-input-icon text-primary-dark" />
                  <span>
                    {language === 'සිංහල' ? 'ඔබගේ දිස්ත්‍රික්කය:' : language === 'தமிழ்' ? 'உங்கள் மாவட்டம்:' : 'Your District:'}
                  </span>
                </label>
                <div className="plant-input-wrapper">
                  <select
                    id="disease-district-select"
                    className="plant-name-input-field"
                    style={{ background: '#fff', cursor: 'pointer' }}
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                  >
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {DISTRICT_TRANSLATIONS[d] ? (DISTRICT_TRANSLATIONS[d][language] || d) : d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Plant / Crop Name Input */}
              <div className="plant-input-card">
                <label htmlFor="plant-name-input" className="plant-input-label">
                  <Sprout size={18} className="plant-input-icon" />
                  <span>{t('plantNameLabel', 'Affected Plant / Crop Name:')}</span>
                </label>
                <div className="plant-input-wrapper">
                  <input
                    id="plant-name-input"
                    type="text"
                    className="plant-name-input-field"
                    placeholder={t('plantNamePlaceholder', 'e.g. Paddy, Grapes, Turmeric, Strawberry, Mango, Banana, Onion, Corn, Carrot...')}
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div 
              className={`upload-zone-clean ${isDragOver ? 'drag-active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <div className="dropzone-icon-circle">
                <UploadCloud size={38} className="text-primary-dark" />
              </div>
              
              <div className="dropzone-text">
                <h3>{t('uploadLeafImage', 'Upload Plant Leaf Image')}</h3>
                <span className="leaf-only-badge">{t('leafOnlyNotice', 'Upload Plant Leaf Photos Only')}</span>
              </div>

              <label className="btn-primary browse-btn" onClick={(e) => e.stopPropagation()}>
                <ImageIcon size={18} />
                <span>{t('chooseImgDevice', 'Choose Leaf Image from Device')}</span>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  onChange={handleFileInputChange} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          </div>
        ) : (
          /* When a photo IS uploaded: Show clean user uploaded photo, editable plant input, scan button, and detailed DOA medicine results */
          <div className="uploaded-view-layout fade-in">
            <div className="user-uploaded-frame">
              <img 
                src={previewUrl} 
                alt="User Uploaded Plant Leaf" 
                className="user-leaf-img" 
              />
              <button 
                type="button" 
                className="remove-upload-btn" 
                onClick={handleRemovePhoto}
                title="Remove this photo"
              >
                <X size={16} /> {t('removePhoto', 'Remove Photo')}
              </button>
            </div>

            {/* Editable district and plant name before scanning */}
            <div className="disease-inputs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.85rem', width: '100%', maxWidth: '600px' }}>
              {/* District Selector */}
              <div className="uploaded-plant-card" style={{ maxWidth: '100%' }}>
                <label htmlFor="uploaded-district-select" className="plant-input-label">
                  <MapPin size={18} className="plant-input-icon text-primary-dark" />
                  <span>
                    {language === 'සිංහල' ? 'ඔබගේ දිස්ත්‍රික්කය:' : language === 'தமிழ்' ? 'உங்கள் மாவட்டம்:' : 'Your District:'}
                  </span>
                </label>
                <div className="plant-input-wrapper">
                  <select
                    id="uploaded-district-select"
                    className="plant-name-input-field"
                    style={{ background: '#fff', cursor: 'pointer' }}
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                  >
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {DISTRICT_TRANSLATIONS[d] ? (DISTRICT_TRANSLATIONS[d][language] || d) : d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Crop Name */}
              <div className="uploaded-plant-card" style={{ maxWidth: '100%' }}>
                <label htmlFor="uploaded-plant-input" className="plant-input-label">
                  <Sprout size={18} className="plant-input-icon" />
                  <span>{t('plantNameLabel', 'Affected Plant / Crop Name:')}</span>
                </label>
                <div className="plant-input-wrapper">
                  <input
                    id="uploaded-plant-input"
                    type="text"
                    className="plant-name-input-field"
                    placeholder={t('plantNamePlaceholder', 'e.g. Paddy, Grapes, Turmeric, Strawberry, Mango...')}
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="user-upload-actions-bar">
              <button 
                type="button" 
                className="btn-primary scan-action-btn"
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading ? (
                  <><RefreshCw size={19} className="spin-icon" /> {t('analyzingImage', 'Analyzing Leaf with Gemini Vision...')}</>
                ) : (
                  <><Sparkles size={19} /> {t('detectDisease', 'Detect Disease')}</>
                )}
              </button>

              <label className="btn-secondary change-img-btn">
                <span>{t('uploadAnotherPhoto', 'Upload Another Leaf Photo')}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileInputChange} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>

            {/* If Image was not a leaf or could not be processed */}
            {diagnosisMessage && diagnosisMessage.isValid === false && (
              <div className="diagnosis-error-box fade-in">
                <div className="diagnosis-error-header">
                  <X size={24} className="text-danger" />
                  <div>
                    <h4>{t('detectionFailedTitle', 'Could Not Process Image')}</h4>
                    <p className="error-reason-text">
                      {diagnosisMessage.unprocessableReason || t('detectionFailedDesc', 'Gemini AI was unable to detect a plant leaf in this photo. Please ensure you upload a clear close-up photo of an actual plant leaf.')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* If Valid Diagnosis: Show Disease, Confidence, Symptoms, and DOA Medicines */}
            {diagnosisMessage && diagnosisMessage.isValid !== false && !loading && (
              <div className="diagnosis-results-card fade-in">
                {/* Header Pill */}
                <div className="diagnosis-main-header">
                  <div className="disease-title-area">
                    <CheckCircle2 size={24} className="text-success" />
                    <div>
                      <span className="diag-crop-tag">{cleanDisplayByLanguage(diagnosisMessage.crop, language) || 'Plant Leaf'}</span>
                      <h3 className="diag-disease-name">{cleanDisplayByLanguage(diagnosisMessage.disease, language)}</h3>
                    </div>
                  </div>
                  <div className="diag-meta-badges">
                    <span className="diag-badge confidence-badge">
                      {diagnosisMessage.confidence}% {t('confidence', 'Confidence')}
                    </span>
                    {diagnosisMessage.severity && (
                      <span className={`diag-badge severity-badge ${diagnosisMessage.severity.toLowerCase()}`}>
                        {cleanDisplayByLanguage(diagnosisMessage.severity, language)} {t('severity', 'Severity')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Symptoms Description */}
                {diagnosisMessage.symptoms && (
                  <div className="diag-section-box">
                    <h5 className="diag-section-heading">{t('symptoms', 'Observed Symptoms')}:</h5>
                    <p className="diag-section-desc">{cleanDisplayByLanguage(diagnosisMessage.symptoms, language)}</p>
                  </div>
                )}

                {/* Causes */}
                {diagnosisMessage.causes && (
                  <div className="diag-section-box">
                    <h5 className="diag-section-heading">{t('causes', 'Underlying Causes')}:</h5>
                    <p className="diag-section-desc">{cleanDisplayByLanguage(diagnosisMessage.causes, language)}</p>
                  </div>
                )}

                {/* Chemical Treatments / DOA Medicines */}
                {diagnosisMessage.chemicalTreatment && (
                  <div className="diag-medicine-box chemical">
                    <h5 className="diag-medicine-heading">{t('chemicalTreatment', 'DOA Approved Chemical Remedies & Medicines')}:</h5>
                    {Array.isArray(diagnosisMessage.chemicalTreatment.products) && diagnosisMessage.chemicalTreatment.products.length > 0 && (
                      <div className="diag-products-list">
                        {diagnosisMessage.chemicalTreatment.products.map((p, i) => (
                          <span key={i} className="diag-product-pill">{cleanDisplayByLanguage(p, language)}</span>
                        ))}
                      </div>
                    )}
                    {diagnosisMessage.chemicalTreatment.dosage && (
                      <p className="diag-dosage-line">
                        <strong>{t('dosageAndUsage', 'Dosage & Application')}:</strong> {cleanDisplayByLanguage(diagnosisMessage.chemicalTreatment.dosage, language)}
                      </p>
                    )}
                    {diagnosisMessage.chemicalTreatment.instructions && (
                      <p className="diag-instructions-line">{cleanDisplayByLanguage(diagnosisMessage.chemicalTreatment.instructions, language)}</p>
                    )}
                  </div>
                )}

                {/* Organic Remedies */}
                {diagnosisMessage.organicTreatment && (
                  <div className="diag-medicine-box organic">
                    <h5 className="diag-medicine-heading">{t('organicTreatment', 'Organic & Bio-Control Remedies')}:</h5>
                    {Array.isArray(diagnosisMessage.organicTreatment.methods) && diagnosisMessage.organicTreatment.methods.length > 0 && (
                      <div className="diag-products-list">
                        {diagnosisMessage.organicTreatment.methods.map((m, i) => (
                          <span key={i} className="diag-organic-pill">{cleanDisplayByLanguage(m, language)}</span>
                        ))}
                      </div>
                    )}
                    {diagnosisMessage.organicTreatment.instructions && (
                      <p className="diag-instructions-line">{cleanDisplayByLanguage(diagnosisMessage.organicTreatment.instructions, language)}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        </div>
        
        {/* Chat Widget Side Panel */}
        <div className="chat-panel-wrapper">
          <ChatWidget mode="disease" />
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
