# ==============================================================================
# AGRISENSE PLANT PATHOLOGY & DISEASE DETECTION ROUTER
# Upload leaf/plant image, identify pathology using Gemini Vision AI, and fetch DOA remedies
# ==============================================================================

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from models.schemas import DiseaseDetectionResponse
from services.gemini_service import detect_disease
from database import get_db_pool
import aiomysql
import base64

router = APIRouter(prefix="/api/disease", tags=["Disease"])

@router.post("/detect", response_model=DiseaseDetectionResponse)
async def detect(
    file: UploadFile = File(...),              # Uploaded leaf/plant image file
    context: str = Form(default=""),           # Optional agricultural context
    crop_name: str = Form(default=""),         # Specific host crop name (e.g. Tomato, Paddy)
    district: str = Form(default=""),          # Optional district (e.g. Jaffna, Kandy, Anuradhapura)
    user_email: str = Form(default="Guest Farmer"),
    user_name: str = Form(default="Guest Farmer"),
    language: str = Form(default="English"),   # Requested response language (English, සිංහල, தமிழ்)
    pool: aiomysql.Pool = Depends(get_db_pool)
):
    """
    Receives an image of a diseased crop leaf/plant, executes AI vision pathology diagnosis,
    and returns Department of Agriculture (DOA) chemical remedies, organic bio-treatments, and prevention tips.
    """
    try:
        # STEP 1: Read raw binary image contents and encode to base64 for Gemini Vision API
        contents = await file.read()
        base64_image = base64.b64encode(contents).decode('utf-8')
        
        # Save a copy locally for inspection/auditing if needed
        try:
            import os
            os.makedirs("uploads", exist_ok=True)
            with open(os.path.join("uploads", "latest_scan.jpg"), "wb") as f_out:
                f_out.write(contents)
        except Exception:
            pass

        # STEP 2: Invoke Gemini 1.5 Vision model with Sri Lanka DOA plant pathology guidelines
        plant_context = crop_name.strip() if crop_name.strip() else context.strip()
        result = await detect_disease(base64_image, plant_context, language)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        # STEP 3: Asynchronously log the disease detection into the database for the Admin Dashboard Top 5 leaderboard
        if pool:
            try:
                disease_name = result.get("disease_name", "Unknown Disease")
                crop_name = result.get("affected_crop", "General Plant")
                confidence = float(result.get("confidence", 0.95))
                severity = result.get("severity", "Moderate")
                symptoms = result.get("symptoms", "")[:500] if result.get("symptoms") else ""
                treatment = str(result.get("chemical_treatment", ""))[:500]
                clean_district = district.strip() if district else ""
                
                async with pool.acquire() as conn:
                    async with conn.cursor(aiomysql.DictCursor) as cur:
                        if not clean_district and user_email and user_email != "Guest Farmer":
                            try:
                                await cur.execute("SELECT district FROM crops WHERE user_email = %s AND district IS NOT NULL AND district != '' ORDER BY id DESC LIMIT 1", (user_email,))
                                user_crop = await cur.fetchone()
                                if user_crop and user_crop.get("district"):
                                    clean_district = user_crop["district"].strip()
                            except Exception:
                                pass

                        await cur.execute("""
                            INSERT INTO diseases (user_email, user_name, crop_name, district, disease_name, confidence, severity, symptoms, treatment)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (user_email, user_name, crop_name, clean_district or None, disease_name, confidence, severity, symptoms, treatment))
                        await conn.commit()
            except Exception as log_err:
                print(f"[Admin Logger Notice] Could not log disease detection: {log_err}")

        # STEP 4: Return validated response model to frontend
        return DiseaseDetectionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

