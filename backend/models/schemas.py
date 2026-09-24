from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# ==============================================================================
# CROP SUITABILITY REQUEST SCHEMA
# Data payload sent by the frontend when a farmer requests crop analysis
# ==============================================================================
class CropSuitabilityRequest(BaseModel):
    lat: float                             # Geographic Latitude coordinate of the farmland
    lon: float                             # Geographic Longitude coordinate of the farmland
    land_size: float                       # Total cultivation land area in Acres
    planting_month: int                    # Target planting month (1=January .. 12=December)
    preferred_crop: Optional[str] = None   # Specific crop the farmer wishes to cultivate (e.g., "Tomato")
    district: Optional[str] = None         # Administrative district name (e.g., "Kandy", "Nuwara Eliya")
    ds_division: Optional[str] = None      # Divisional Secretariat division name (e.g., "Yatinuwara", "Thalawa")
    province: Optional[str] = None         # Administrative province name (e.g., "Central Province")
    language: Optional[str] = "English"    # Desired response language: "English", "Sinhala", or "Tamil"
    user_email: Optional[str] = "Guest Farmer" # Identity of logged in farmer for analytics logging
    user_name: Optional[str] = "Guest Farmer"  # Display name of farmer


# ==============================================================================
# DISEASE DETECTION RESPONSE SCHEMA
# Structured pathology report returned after Gemini Vision analyzes an uploaded leaf image
# ==============================================================================
class DiseaseDetectionResponse(BaseModel):
    disease_name: Optional[str] = "Plant Analysis"      # Name of the diagnosed pathology (e.g., "Early Blight")
    affected_crop: Optional[str] = "Unknown"            # Host crop identified (e.g., "Tomato")
    confidence: Optional[float] = 0.0                   # AI diagnostic confidence score (0.0 to 1.0)
    severity: Optional[str] = "Unknown"                 # Disease stage/severity: "Low", "Moderate", "High", "Critical"
    symptoms: Optional[str] = ""                        # Clinical symptoms observed on the foliage
    causes: Optional[str] = ""                          # Fungal, bacterial, or viral pathogen cause
    chemical_treatment: Optional[Dict[str, Any]] = {}   # Recommended chemical fungicides/pesticides with dosage
    organic_treatment: Optional[Dict[str, Any]] = {}    # Eco-friendly organic remedies (neem oil, bio-control)
    prevention: Optional[List[str]] = []                # Agronomic prevention practices (crop rotation, spacing)
    notes: Optional[str] = ""                           # Additional Department of Agriculture (DOA) remarks
    is_valid_leaf: Optional[bool] = True                # Flag verifying whether the image is actually a plant leaf
    unprocessable_reason: Optional[str] = None          # Explanation if image is blurry or non-agricultural


# ==============================================================================
# CHATBOT REQUEST SCHEMA
# Message payload sent to the agri-only AI conversational assistant
# ==============================================================================
class ChatRequest(BaseModel):
    message: str                        # The agricultural query text submitted by the farmer
    session_id: Optional[str] = None    # Unique session UUID used to maintain multi-turn chat history
    language: Optional[str] = "English" # Response language: "English", "Sinhala", or "Tamil"
    mode: Optional[str] = "crop"        # Conversation focus: "crop", "disease", or "general"


# ==============================================================================
# CHATBOT RESPONSE SCHEMA
# Natural language answer returned by the AI chatbot with session tracking
# ==============================================================================
class ChatResponse(BaseModel):
    response: str    # Generated agricultural response text
    session_id: str  # Retained session UUID for subsequent conversation turns


# ==============================================================================
# CULTIVATION GUIDE REQUEST SCHEMA
# Request to fetch stage-by-stage farming timetable for a specific crop
# ==============================================================================
class CultivationGuideRequest(BaseModel):
    crop_name: str  # Name of crop (e.g. "Carrot", "Paddy", "Chilli")
    lat: float      # Farmland Latitude
    lon: float      # Farmland Longitude


# ==============================================================================
# MARKET PREDICTION REQUEST SCHEMA
# Request to retrieve wholesale price predictions for a target crop
# ==============================================================================
class MarketPredictionRequest(BaseModel):
    crop_name: str  # Target crop name for price forecasting (Dambulla/Manning markets)
