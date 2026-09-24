/**
 * AgroSense Frontend API Service Layer (api.js)
 * ----------------------------------------------
 * Handles all asynchronous HTTP communications between the React client and the FastAPI backend.
 * Features:
 *  - Authentication (Registration, Login)
 *  - Dual-Factor Crop Suitability Analysis
 *  - Vision-Based Plant Disease Diagnosis (Multipart Form-Data)
 *  - Multi-turn Conversational AI Assistant (Agri-specific)
 *  - Department of Agriculture Cultivation Guides & Market Predictions
 *  - Administrative Surveillance (Disease logs, crop queries, user directory)
 */

// Backend endpoint origin
const BASE_URL = 'http://localhost:8000';

/**
 * Register a new farmer or admin account
 * @param {Object} data - { name, email, password, phone, role }
 */
export const registerUser = async (data) => {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Registration failed');
  }
  return response.json();
};

/**
 * Authenticate user credentials and return role & user session
 * @param {Object} data - { email, password }
 */
export const loginUser = async (data) => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Login failed');
  }
  return response.json();
};

/**
 * Evaluate Crop Suitability using Dual-Factor Logic:
 * Factor 1: Weather/Soil/Climate conditions in the specified district
 * Factor 2: Harvest-time market price & glut risk (over-supply warning)
 * @param {Object} data - { crop, location: { lat, lon, district }, soil_type, season, language }
 */
export const analyzeCrop = async (data) => {
  const response = await fetch(`${BASE_URL}/api/crops/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Analysis failed');
  }
  return response.json();
};

/**
 * Upload an infected crop photo for AI vision pathology diagnosis.
 * Uses FormData (multipart/form-data) to transmit binary image data to Gemini Vision.
 * Automatically receives DOA Sri Lanka treatments, top affected crops, and severity ratings.
 * @param {File} imageFile - The leaf/plant image selected by the farmer
 * @param {string} cropName - Crop name (optional context)
 * @param {string} userEmail - Email of logged in farmer
 * @param {string} userName - Name of logged in farmer
 * @param {string} language - 'English', 'Sinhala', or 'Tamil'
 */
export const detectDisease = async (imageFile, cropName = '', userEmail = 'Guest Farmer', userName = 'Guest Farmer', language = 'English', district = '') => {
  const formData = new FormData();
  formData.append('file', imageFile);  // Backend FastAPI expects 'file' UploadFile parameter
  formData.append('context', cropName);
  formData.append('crop_name', cropName);
  formData.append('district', district);
  formData.append('user_email', userEmail);
  formData.append('user_name', userName);
  formData.append('language', language);

  const response = await fetch(`${BASE_URL}/api/disease/detect`, {
    method: 'POST',
    body: formData, // Browser automatically attaches correct Content-Type multipart/form-data boundary
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Detection failed');
  }
  return response.json();
};

/**
 * Interactive Agriculture Chatbot Assistant.
 * Strictly restricted to Sri Lankan agriculture queries; rejects non-agricultural inquiries.
 * @param {string} message - Question typed by user
 * @param {string} sessionId - Unique session UUID for ongoing chat context
 * @param {string} language - Target response language ('English', 'Sinhala', 'Tamil')
 * @param {string} mode - 'crop' or 'general'
 */
export const sendChatMessage = async (message, sessionId, language = 'English', mode = 'crop') => {
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId, language, mode }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Chat request failed');
  }
  return response.json();
};

/**
 * Fetch stage-by-stage cultivation schedule (land prep, planting, fertilizer, harvest)
 * @param {Object} data - { crop, district, language }
 */
export const getCultivationGuide = async (data) => {
  const response = await fetch(`${BASE_URL}/api/cultivation/guide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Guide generation failed');
  }
  return response.json();
};

/**
 * Retrieve wholesale price trends and future price projections
 * @param {Object} data - { crop, district, language }
 */
export const getMarketPrediction = async (data) => {
  const response = await fetch(`${BASE_URL}/api/market/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Market prediction failed');
  }
  return response.json();
};

// ================= ADMIN SURVEILLANCE & DASHBOARD APIS =================

/**
 * Fetch high-level statistics: total registered farmers, active diagnoses, crop recommendation count
 */
export const getAdminOverview = async () => {
  const response = await fetch(`${BASE_URL}/api/admin/overview`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to fetch admin overview');
  }
  return response.json();
};

/**
 * Retrieve all registered accounts with contact information and creation timestamps
 */
export const getAdminUsers = async () => {
  const response = await fetch(`${BASE_URL}/api/admin/users`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to fetch users list');
  }
  return response.json();
};

/**
 * Fetch historical disease logs including disease name, severity, confidence, and timestamp
 */
export const getAdminDiseaseLogs = async () => {
  const response = await fetch(`${BASE_URL}/api/admin/disease-logs`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to fetch disease logs');
  }
  return response.json();
};

/**
 * Fetch crop suitability query history by district, season, and recommendation status
 */
export const getAdminCropAnalytics = async () => {
  const response = await fetch(`${BASE_URL}/api/admin/crop-analytics`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to fetch crop analytics');
  }
  return response.json();
};

/**
 * Delete a user account by ID (Admin only)
 * @param {string|number} userId - The user identifier
 */
export const deleteAdminUser = async (userId) => {
  const response = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to delete user');
  }
  return response.json();
};

