from fastapi import APIRouter, HTTPException
from models.schemas import CultivationGuideRequest
from services.weather_service import get_climate_data
from services.location_service import reverse_geocode
from services.gemini_service import generate_cultivation_guide

router = APIRouter(prefix="/api/cultivation", tags=["Cultivation"])


@router.post("/guide")
async def get_guide(request: CultivationGuideRequest):
    try:
        location_data = await reverse_geocode(request.lat, request.lon)
        climate_data = await get_climate_data(request.lat, request.lon)
        
        guide = await generate_cultivation_guide(
            crop=request.crop_name,
            location=location_data,
            weather=climate_data
        )
        
        return {
            "location": location_data,
            "guide": guide
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
