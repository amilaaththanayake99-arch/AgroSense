from fastapi import APIRouter, HTTPException
from models.schemas import MarketPredictionRequest
from services.gemini_service import predict_market

router = APIRouter(prefix="/api/market", tags=["Market"])

# Fallback historical data for major Sri Lankan crops
DEFAULT_HISTORICAL = {
    "Tomato": [
        {"date": "2026-03-01", "price": 180.0, "market": "Dambulla Economic Center"},
        {"date": "2026-04-01", "price": 240.0, "market": "Dambulla Economic Center"},
        {"date": "2026-05-01", "price": 210.0, "market": "Manning Market Colombo"},
        {"date": "2026-06-01", "price": 250.0, "market": "Dambulla Economic Center"},
        {"date": "2026-07-01", "price": 280.0, "market": "Dambulla Economic Center"},
        {"date": "2026-08-01", "price": 240.0, "market": "Manning Market Colombo"}
    ],
    "Rice (Paddy)": [
        {"date": "2026-03-01", "price": 110.0, "market": "Anuradhapura"},
        {"date": "2026-04-01", "price": 115.0, "market": "Polonnaruwa"},
        {"date": "2026-05-01", "price": 120.0, "market": "Dambulla Economic Center"},
        {"date": "2026-06-01", "price": 125.0, "market": "Manning Market Colombo"},
        {"date": "2026-07-01", "price": 122.0, "market": "Dambulla Economic Center"},
        {"date": "2026-08-01", "price": 130.0, "market": "Manning Market Colombo"}
    ],
    "Chili": [
        {"date": "2026-03-01", "price": 500.0, "market": "Dambulla Economic Center"},
        {"date": "2026-04-01", "price": 650.0, "market": "Manning Market Colombo"},
        {"date": "2026-05-01", "price": 580.0, "market": "Dambulla Economic Center"},
        {"date": "2026-06-01", "price": 720.0, "market": "Dambulla Economic Center"},
        {"date": "2026-07-01", "price": 800.0, "market": "Manning Market Colombo"},
        {"date": "2026-08-01", "price": 650.0, "market": "Dambulla Economic Center"}
    ]
}

@router.post("/predict")
async def get_prediction(request: MarketPredictionRequest):
    try:
        historical_data = DEFAULT_HISTORICAL.get(request.crop_name, DEFAULT_HISTORICAL["Tomato"])
        prediction = await predict_market(request.crop_name, historical_data)
        return {"prediction": prediction, "historical_data": historical_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
