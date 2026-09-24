// ==============================================================================
// FARMER PROFILE & CREDENTIALS VIEW (Profile.jsx)
// Features:
//  1. Full Sri Lankan 25 Districts Dropdown with localized Agro-Ecological Zones.
//  2. Dynamic Agro-Climatic Zone & Province calculation on district change.
//  3. Profile Picture Customization:
//      - Direct upload from gallery / device with automatic canvas downscaling.
//      - Instant synchronization across application (TopHeader, Dropdown, Profile Card).
//      - Persistence in localStorage ('agrisense_user').
//  4. 100% Pure Multilingual Localization (English, Sinhala, Tamil) - No mixed languages.
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Sprout, 
  Award, 
  Calendar, 
  Camera, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  Wheat, 
  Trees, 
  ImageIcon, 
  X, 
  RefreshCw, 
  Sparkles 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './Profile.css';

// 25 Districts of Sri Lanka with localized translations and Agro-Ecological Zones
export const SRI_LANKA_DISTRICTS_DATA = [
  { 
    name: 'Ampara', 
    province: 'Eastern Province',
    zone: { English: 'Dry Zone', 'සිංහල': 'වියළි කලාපය', 'தமிழ்': 'உலர் வலயம்' },
    label: { English: 'Ampara', 'සිංහල': 'අම්පාර', 'தமிழ்': 'அம்பாறை' }
  },
  { 
    name: 'Anuradhapura', 
    province: 'North Central Province',
    zone: { English: 'Dry Zone', 'සිංහල': 'වියළි කලාපය', 'தமிழ்': 'உலர் வலயம்' },
    label: { English: 'Anuradhapura', 'සිංහල': 'අනුරාධපුරය', 'தமிழ்': 'அநுராதபுரம்' }
  },
  { 
    name: 'Badulla', 
    province: 'Uva Province',
    zone: { English: 'Upcountry Intermediate Zone', 'සිංහල': 'උඩරට අන්තර් කලාපය', 'தமிழ்': 'மலைநாட்டு இடைநிலை வலயம்' },
    label: { English: 'Badulla', 'සිංහල': 'බදුල්ල', 'தமிழ்': 'பதுளை' }
  },
  { 
    name: 'Batticaloa', 
    province: 'Eastern Province',
    zone: { English: 'Dry Zone', 'සිංහල': 'වියළි කලාපය', 'தமிழ்': 'உலர் வலயம்' },
    label: { English: 'Batticaloa', 'සිංහල': 'මඩකලපුව', 'தமிழ்': 'மட்டக்களப்பு' }
  },
  { 
    name: 'Colombo', 
    province: 'Western Province',
    zone: { English: 'Low Country Wet Zone', 'සිංහල': 'පහතරට තෙත් කලාපය', 'தமிழ்': 'தாழ்நாட்டு ஈர வலயம்' },
    label: { English: 'Colombo', 'සිංහල': 'කොළඹ', 'தமிழ்': 'கொழும்பு' }
  },
  { 
    name: 'Galle', 
    province: 'Southern Province',
    zone: { English: 'Low Country Wet Zone', 'සිංහල': 'පහතරට තෙත් කලාපය', 'தமிழ்': 'தாழ்நாட்டு ஈர வலயம்' },
    label: { English: 'Galle', 'සිංහල': 'ගාල්ල', 'தமிழ்': 'காலி' }
  },
  { 
    name: 'Gampaha', 
    province: 'Western Province',
    zone: { English: 'Low Country Wet Zone', 'සිංහල': 'පහතරට තෙත් කලාපය', 'தமிழ்': 'தாழ்நாட்டு ஈர வலயம்' },
    label: { English: 'Gampaha', 'සිංහල': 'ගම්පහ', 'தமிழ்': 'கம்பஹா' }
  },
  { 
    name: 'Hambantota', 
    province: 'Southern Province',
    zone: { English: 'Dry Zone', 'සිංහල': 'වියළි කලාපය', 'தமிழ்': 'உலர் வலயம்' },
    label: { English: 'Hambantota', 'සිංහල': 'හම්බන්තොට', 'தமிழ்': 'அம்பாந்தோட்டை' }
  },
  { 
    name: 'Jaffna', 
    province: 'Northern Province',
    zone: { English: 'Dry Zone (Northern)', 'සිංහල': 'උතුරු වියළි කලාපය', 'தமிழ்': 'வடக்கு உலர் வலயம்' },
    label: { English: 'Jaffna', 'සිංහල': 'යාපනය', 'தமிழ்': 'யாழ்ப்பாணம்' }
  },
  { 
    name: 'Kalutara', 
    province: 'Western Province',
    zone: { English: 'Low Country Wet Zone', 'සිංහල': 'පහතරට තෙත් කලාපය', 'தமிழ்': 'தாழ்நாட்டு ஈர வலயம்' },
    label: { English: 'Kalutara', 'සිංහල': 'කළුතර', 'தமிழ்': 'களுத்துறை' }
  },
  { 
    name: 'Kandy', 
    province: 'Central Province',
    zone: { English: 'Upcountry Wet Zone', 'සිංහල': 'උඩරට තෙත් කලාපය', 'தமிழ்': 'மலைநாட்டு ஈர வலயம்' },
    label: { English: 'Kandy', 'සිංහල': 'මහනුවර', 'தமிழ்': 'கண்டி' }
  },
  { 
    name: 'Kegalle', 
    province: 'Sabaragamuwa Province',
    zone: { English: 'Mid Country Wet Zone', 'සිංහල': 'මැදරට තෙත් කලාපය', 'தமிழ்': 'மத்திய ஈர வலயம்' },
    label: { English: 'Kegalle', 'සිංහල': 'කෑගල්ල', 'தமிழ்': 'கேகாலை' }
  },
  { 
    name: 'Kilinochchi', 
    province: 'Northern Province',
    zone: { English: 'Dry Zone (Northern)', 'සිංහල': 'උතුරු වියළි කලාපය', 'தமிழ்': 'வடக்கு உலர் வலயம்' },
    label: { English: 'Kilinochchi', 'සිංහල': 'කිලිනොච්චිය', 'தமிழ்': 'கிளிநொச்சி' }
  },
  { 
    name: 'Kurunegala', 
    province: 'North Western Province',
    zone: { English: 'Intermediate Zone', 'සිංහල': 'අන්තර් කලාපය', 'தமிழ்': 'இடைநிலை வலயம்' },
    label: { English: 'Kurunegala', 'සිංහල': 'කුරුණෑගල', 'தமிழ்': 'குருநாகல்' }
  },
  { 
    name: 'Mannar', 
    province: 'Northern Province',
    zone: { English: 'Dry Zone (Coastal)', 'සිංහල': 'වෙරළබඩ වියළි කලාපය', 'தமிழ்': 'கடற்கரை உலர் வலயம்' },
    label: { English: 'Mannar', 'සිංහල': 'මන්නාරම', 'தமிழ்': 'மன்னார்' }
  },
  { 
    name: 'Matale', 
    province: 'Central Province',
    zone: { English: 'Spices & Mid Country Zone', 'සිංහල': 'කුළුබඩු සහ මැදරට කලාපය', 'தமிழ்': 'வாசனைப்பயிர்கள் & மத்திய வலயம்' },
    label: { English: 'Matale', 'සිංහල': 'මාතලේ', 'தமிழ்': 'மாத்தளை' }
  },
  { 
    name: 'Matara', 
    province: 'Southern Province',
    zone: { English: 'Low Country Wet Zone', 'සිංහල': 'පහතරට තෙත් කලාපය', 'தமிழ்': 'தாழ்நாட்டு ஈர வலயம்' },
    label: { English: 'Matara', 'සිංහල': 'මාතර', 'தமிழ்': 'மாத்தறை' }
  },
  { 
    name: 'Monaragala', 
    province: 'Uva Province',
    zone: { English: 'Intermediate & Dry Zone', 'සිංහල': 'අන්තර් සහ වියළි කලාපය', 'தமிழ்': 'இடைநிலை & உலர் வலயம்' },
    label: { English: 'Monaragala', 'සිංහල': 'මොණරාගල', 'தமிழ்': 'மொணராகலை' }
  },
  { 
    name: 'Mullaitivu', 
    province: 'Northern Province',
    zone: { English: 'Dry Zone', 'සිංහල': 'වියළි කලාපය', 'தமிழ்': 'உலர் வலயம்' },
    label: { English: 'Mullaitivu', 'සිංහල': 'මුලතිව්', 'தமிழ்': 'முல்லைத்தீவு' }
  },
  { 
    name: 'Nuwara Eliya', 
    province: 'Central Province',
    zone: { English: 'Upcountry Wet Zone', 'සිංහල': 'උඩරට තෙත් කලාපය', 'தமிழ்': 'மலைநாட்டு ஈர வலயம்' },
    label: { English: 'Nuwara Eliya', 'සිංහල': 'නුවරඑළිය', 'தமிழ்': 'நுவரெலியா' }
  },
  { 
    name: 'Polonnaruwa', 
    province: 'North Central Province',
    zone: { English: 'Dry Zone', 'සිංහල': 'වියළි කලාපය', 'தமிழ்': 'உலர் வலயம்' },
    label: { English: 'Polonnaruwa', 'සිංහල': 'පොළොන්නරුව', 'தமிழ்': 'பொலன்னறுவை' }
  },
  { 
    name: 'Puttalam', 
    province: 'North Western Province',
    zone: { English: 'Dry & Intermediate Zone', 'සිංහල': 'වියළි සහ අන්තර් කලාපය', 'தமிழ்': 'உலர் & இடைநிலை வலயம்' },
    label: { English: 'Puttalam', 'සිංහල': 'පුත්තලම', 'தமிழ்': 'புத்தளம்' }
  },
  { 
    name: 'Ratnapura', 
    province: 'Sabaragamuwa Province',
    zone: { English: 'Low & Mid Country Wet Zone', 'සිංහල': 'පහත සහ මැදරට තෙත් කලාපය', 'தமிழ்': 'தாழ் & மத்திய ஈர வலயம்' },
    label: { English: 'Ratnapura', 'සිංහල': 'රත්නපුර', 'தமிழ்': 'இரத்தினபுரி' }
  },
  { 
    name: 'Trincomalee', 
    province: 'Eastern Province',
    zone: { English: 'Dry Zone', 'සිංහල': 'වියළි කලාපය', 'தமிழ்': 'உலர் வலயம்' },
    label: { English: 'Trincomalee', 'සිංහල': 'ත්‍රිකුණාමලය', 'தமிழ்': 'திருகோணமலை' }
  },
  { 
    name: 'Vavuniya', 
    province: 'Northern Province',
    zone: { English: 'Dry Zone', 'සිංහල': 'වියළි කලාපය', 'தமிழ்': 'உலர் வலயம்' },
    label: { English: 'Vavuniya', 'සිංහල': 'වවුනියාව', 'தமிழ்': 'வவுனியா' }
  }
];

const Profile = ({ user, onUpdateUser }) => {
  const { language, t } = useLanguage();
  const fileInputRef = useRef(null);

  // Modal visibility for changing profile picture
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Form State initialized with logged-in user or defaults
  const [formData, setFormData] = useState({
    name: user?.name || 'Amila Bandara',
    email: user?.email || 'amila.bandara@agrisense.lk',
    phone: user?.phone || '+94 77 458 9210',
    district: user?.district || 'Kurunegala',
    province: user?.province || 'North Western Province',
    farmSize: user?.farmSize || '3.5',
    primaryCrops: user?.primaryCrops || 'Rice (Paddy), Coconut, Tomato',
    experienceYears: user?.experienceYears || '12',
    avatar: user?.avatar || '/assets/profile_face.jpg'
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sync state if user prop changes externally
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        district: user.district || prev.district,
        province: user.province || prev.province,
        farmSize: user.farmSize || prev.farmSize,
        primaryCrops: user.primaryCrops || prev.primaryCrops,
        experienceYears: user.experienceYears || prev.experienceYears,
        avatar: user.avatar || prev.avatar
      }));
    }
  }, [user]);

  // Find ecological info of currently selected district
  const currentDistrictObj = SRI_LANKA_DISTRICTS_DATA.find(
    d => d.name.toLowerCase() === (formData.district || '').toLowerCase()
  ) || SRI_LANKA_DISTRICTS_DATA.find(d => d.name === 'Kurunegala');

  const localizedDistrictName = currentDistrictObj.label[language] || currentDistrictObj.label['English'];
  const localizedZoneName = currentDistrictObj.zone[language] || currentDistrictObj.zone['English'];

  // Form submit handler to commit changes to parent state and localStorage
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser(formData);
    }
    setIsSaved(true);
    setIsEditing(false);
    setTimeout(() => setIsSaved(false), 3000);
  };

  /**
   * Handles user photo upload from gallery / device:
   * Compresses via HTML5 Canvas (300x300 max) and saves as base64.
   */
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(language === 'සිංහල' ? 'කරුණාකර වලංගු ඡායාරූපයක් තෝරන්න.' : language === 'தமிழ்' ? 'சரியான படக் கோப்பைத் தேர்ந்தெடுக்கவும்.' : 'Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setFormData(prev => ({ ...prev, avatar: dataUrl }));
        if (onUpdateUser) {
          onUpdateUser({ avatar: dataUrl });
        }
        setShowPhotoModal(false);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Reset to default photo
  const handleResetPhoto = () => {
    const defaultUrl = '/assets/profile_face.jpg';
    setFormData(prev => ({ ...prev, avatar: defaultUrl }));
    if (onUpdateUser) {
      onUpdateUser({ avatar: defaultUrl });
    }
    setShowPhotoModal(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="profile-page-container fade-in">
      {/* Hidden file input for gallery / device photo selection */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={handleImageUpload} 
        style={{ display: 'none' }} 
      />

      <div className="profile-header">
        <h1>{t('farmerProfile', 'Farmer Profile')}</h1>
        <p>{t('farmerProfileSub', 'Manage your agricultural credentials, contact information, and farm parameters.')}</p>
      </div>

      {isSaved && (
        <div className="save-toast glass-panel fade-in">
          <CheckCircle2 size={18} className="text-success" />
          <span>{t('profileUpdatedSuccess', 'Profile information updated successfully!')}</span>
        </div>
      )}

      {/* Main Grid Layout: Left Circle Face + Right Fields */}
      <div className="profile-layout-grid">
        
        {/* Left Card: Circle Face + Greeting */}
        <div className="profile-face-card glass-panel">
          <div className="avatar-circle-wrapper">
            <div 
              className="large-profile-circle" 
              onClick={() => setShowPhotoModal(true)}
              title={t('changePhotoTitle', 'Change Profile Picture')}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src={formData.avatar || user?.avatar || "/assets/profile_face.jpg"} 
                alt="Profile Face" 
                className="profile-face-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';
                }}
              />
              <button 
                type="button" 
                className="change-photo-badge" 
                title={t('changePhotoTitle', 'Change Profile Picture')}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPhotoModal(true);
                }}
              >
                <Camera size={16} />
              </button>
            </div>
          </div>

          {/* User Greeting Section */}
          <div className="greeting-section">
            <h2 className="greeting-title">{t('hi', 'Hi')} {formData.name.split(' ')[0]}</h2>
            <span className="badge badge-success">
              <ShieldCheck size={14} /> {t('regFarmerBadge', 'Registered Sri Lankan Farmer')}
            </span>
          </div>

          {/* Dynamic Quick Farmer Stats with pure localized zone name */}
          <div className="quick-farmer-stats">
            <div className="f-stat-item">
              <Wheat size={18} className="f-stat-icon text-primary" />
              <div>
                <span className="f-stat-val">{formData.farmSize} {t('acres', 'Acres')}</span>
                <span className="f-stat-lbl">{t('cultivatedLand', 'Cultivated Land')}</span>
              </div>
            </div>
            <div className="f-stat-item">
              <MapPin size={18} className="f-stat-icon text-secondary" />
              <div>
                <span className="f-stat-val">{localizedDistrictName}</span>
                <span className="f-stat-lbl">{localizedZoneName}</span>
              </div>
            </div>
            <div className="f-stat-item">
              <Award size={18} className="f-stat-icon text-info" />
              <div>
                <span className="f-stat-val">{formData.experienceYears} {t('years', 'Years')}</span>
                <span className="f-stat-lbl">{t('farmingExp', 'Farming Experience')}</span>
              </div>
            </div>
          </div>

          {/* Primary Cultivated Crops Tags */}
          <div className="primary-crops-preview">
            <h4>{t('primaryCrops', 'Primary Crops')}</h4>
            <div className="crop-pills">
              {formData.primaryCrops.split(',').map((crop, idx) => (
                <span key={idx} className="crop-pill">
                  <Sprout size={13} /> {crop.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Form: Email, Phone number, Name, Farm Data */}
        <div className="profile-details-card glass-panel">
          <div className="card-top-bar">
            <h3>{t('farmerAccountDetails', 'Farmer Account Details')}</h3>
            <button 
              type="button" 
              className={`edit-toggle-btn ${isEditing ? 'active' : ''}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? t('cancelEdit', 'Cancel Edit') : t('editDetails', 'Edit Details')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            {/* Full Name Field */}
            <div className="form-field-box">
              <label className="field-label">
                <User size={16} /> {t('fullName', 'Full Name')}
              </label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                disabled={!isEditing}
                required
                className="profile-input"
                placeholder={t('fullName', 'Enter full name')}
              />
            </div>

            {/* Email Address Field */}
            <div className="form-field-box">
              <label className="field-label">
                <Mail size={16} /> {t('emailAddress', 'Email Address')}
              </label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={!isEditing}
                required
                className="profile-input"
                placeholder="farmer@domain.lk"
              />
            </div>

            {/* Phone Number Field */}
            <div className="form-field-box">
              <label className="field-label">
                <Phone size={16} /> {t('phoneNumber', 'Phone Number')}
              </label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                disabled={!isEditing}
                required
                className="profile-input"
                placeholder="+94 7X XXX XXXX"
              />
            </div>

            <div className="form-fields-row">
              {/* All 25 Agricultural Districts Dropdown (Strict Localized Display) */}
              <div className="form-field-box">
                <label className="field-label">
                  <MapPin size={16} /> {t('agriDistrict', 'Agricultural District (25 Districts)')}
                </label>
                <select 
                  value={formData.district}
                  onChange={(e) => {
                    const selectedDistrict = e.target.value;
                    const match = SRI_LANKA_DISTRICTS_DATA.find(d => d.name === selectedDistrict);
                    setFormData({
                      ...formData,
                      district: selectedDistrict,
                      province: match ? match.province : formData.province
                    });
                  }}
                  disabled={!isEditing}
                  className="profile-input"
                >
                  {SRI_LANKA_DISTRICTS_DATA.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.label[language] || d.label['English']} ({d.zone[language] || d.zone['English']})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cultivated Land Size */}
              <div className="form-field-box">
                <label className="field-label">
                  <Wheat size={16} /> {t('landSizeAcres', 'Land Size (Acres)')}
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={formData.farmSize}
                  onChange={(e) => setFormData({...formData, farmSize: e.target.value})}
                  disabled={!isEditing}
                  className="profile-input"
                />
              </div>
            </div>

            {/* Primary Cultivated Crops Field */}
            <div className="form-field-box">
              <label className="field-label">
                <Sprout size={16} /> {t('primaryCultivatedCrops', 'Primary Cultivated Crops')}
              </label>
              <input 
                type="text" 
                value={formData.primaryCrops}
                onChange={(e) => setFormData({...formData, primaryCrops: e.target.value})}
                disabled={!isEditing}
                className="profile-input"
                placeholder={t('primaryCropsPlaceholder', 'e.g. Rice (Paddy), Coconut, Tomato')}
              />
            </div>

            {isEditing && (
              <div className="form-actions-bar fade-in">
                <button type="submit" className="btn-primary save-btn">
                  <Save size={18} /> {t('saveChanges', 'Save Profile Changes')}
                </button>
              </div>
            )}
          </form>
        </div>

      </div>

      {/* Profile Picture Change Modal - Only "Choose from Gallery" (No presets box) */}
      {showPhotoModal && (
        <div className="photo-modal-overlay fade-in" onClick={() => setShowPhotoModal(false)}>
          <div className="photo-modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="photo-modal-header">
              <div className="photo-modal-title-box">
                <Sparkles size={20} className="text-primary" />
                <h3>{t('changePhotoTitle', 'Change Profile Picture')}</h3>
              </div>
              <button 
                type="button" 
                className="photo-modal-close" 
                onClick={() => setShowPhotoModal(false)}
                title={t('close', 'Close')}
              >
                <X size={20} />
              </button>
            </div>

            <div className="photo-modal-body">
              {/* Active Avatar Preview */}
              <div className="modal-preview-wrapper">
                <img 
                  src={formData.avatar || "/assets/profile_face.jpg"} 
                  alt="Avatar Preview" 
                  className="modal-preview-avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/profile_face.jpg';
                  }}
                />
                <span className="modal-preview-caption">{t('currentPhoto', 'Current Photo')}</span>
              </div>

              {/* Single "Choose from Gallery" Action Button */}
              <div className="photo-upload-action-box">
                <button 
                  type="button" 
                  className="btn-primary upload-device-btn"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <ImageIcon size={20} /> {t('chooseFromGallery', 'Choose from Gallery')}
                </button>
                <p className="upload-note">{t('photoOptimizeNote', 'Supports PNG, JPG, or WEBP. Image is automatically optimized.')}</p>
              </div>

              {/* Reset to Default Button */}
              <div className="photo-modal-footer">
                <button 
                  type="button" 
                  className="reset-photo-btn"
                  onClick={handleResetPhoto}
                >
                  <RefreshCw size={14} /> {t('resetToDefaultPhoto', 'Reset to Default Photo')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
