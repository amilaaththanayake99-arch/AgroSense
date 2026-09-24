# ==============================================================================
# AGRISENSE CROP SUITABILITY ROUTER
# Endpoint for dual-factor (Agro-Climatic + Harvest-Time Market Price) crop evaluation
# ==============================================================================

from fastapi import APIRouter, HTTPException, Depends
from models.schemas import CropSuitabilityRequest
from services.weather_service import get_current_weather
from services.location_service import reverse_geocode
from services.gemini_service import analyze_crop_suitability
from database import get_db_pool
import aiomysql

router = APIRouter(prefix="/api/crops", tags=["Crops"])

@router.post("/analyze")
async def analyze_crop(request: CropSuitabilityRequest, pool: aiomysql.Pool = Depends(get_db_pool)):
    """
    Analyzes crop suitability using a Dual-Factor Mandate:
      1. Agro-climatic & weather suitability for the district/coordinates.
      2. Harvest-time wholesale market price viability (Dambulla/Manning) to prevent cultivating into a loss-making market glut.
    """
    try:
        # STEP 1: Determine geographic details (District and Province) via reverse geocoding
        location_data = await reverse_geocode(request.lat, request.lon)
        if request.district:
            location_data["district"] = request.district
            location_data["location_name"] = f"{request.ds_division + ', ' if request.ds_division else ''}{request.district}, Sri Lanka"
        if request.ds_division:
            location_data["ds_division"] = request.ds_division
        if request.province:
            location_data["province"] = request.province

        # STEP 2: Fetch real-time weather metrics (temperature, humidity, windspeed) for the coordinates
        weather_data = await get_current_weather(request.lat, request.lon)
        
        # STEP 3: Execute the dual-factor AI agronomic and market evaluation
        analysis = await analyze_crop_suitability(
            location_data=location_data,
            weather_data=weather_data,
            crop_name=request.preferred_crop,
            land_size=request.land_size,
            month=request.planting_month,
            language=request.language or "English"
        )
        
        # STEP 4: Asynchronously log the crop query for the Admin Dashboard analytics
        if pool and request.preferred_crop:
            try:
                crop_name = request.preferred_crop
                district = request.district or location_data.get("district", "Unknown")
                is_rec = bool(analysis.get("is_recommended", True))
                score = int(analysis.get("suitability_score", 80))
                
                async with pool.acquire() as conn:
                    async with conn.cursor() as cur:
                        await cur.execute("""
                            INSERT INTO crops (user_email, user_name, crop_name, district, land_size, planting_month, is_recommended, suitability_score)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            request.user_email or "Guest Farmer", 
                            request.user_name or "Guest Farmer", 
                            crop_name, 
                            district, 
                            request.land_size, 
                            request.planting_month, 
                            is_rec, 
                            score
                        ))
                        await conn.commit()
            except Exception as log_err:
                print(f"[Admin Logger Notice] Could not log crop analysis: {log_err}")

        # STEP 5: Return comprehensive response containing location, live weather, and dual-factor analysis
        return {
            "location": location_data,
            "weather": weather_data,
            "analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

