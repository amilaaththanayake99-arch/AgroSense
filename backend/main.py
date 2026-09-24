# ==============================================================================
# AGRISENSE SMART AGRICULTURAL PLATFORM - BACKEND ENTRYPOINT
# FastAPI application instance, CORS security configuration, and router mappings
# ==============================================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import init_db_pool, close_db_pool
from routers import (
    crop_router, 
    disease_router, 
    chat_router, 
    cultivation_router, 
    market_router, 
    auth_router, 
    admin_router
)

# 1. Initialize FastAPI Application
app = FastAPI(
    title="AgriSense Backend",
    description="Backend API for AgriSense Smart Farming Decision Support System",
    version="1.0.0"
)

# 2. Configure Cross-Origin Resource Sharing (CORS) Middleware
# Allows the React frontend running on localhost:5173 to safely communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL, 
        "http://localhost:5173", 
        "http://127.0.0.1:5173", 
        "http://localhost:5174", 
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Permits GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],
)

# 3. Application Lifecycle Handlers
@app.on_event("startup")
async def startup_event():
    """Initializes the MySQL asynchronous database connection pool upon server boot."""
    await init_db_pool()

@app.on_event("shutdown")
async def shutdown_event():
    """Safely closes the connection pool on shutdown to prevent resource leaks."""
    await close_db_pool()

# 4. Register Modular Application Routers
app.include_router(auth_router.router)         # User login, registration, and role authentication
app.include_router(admin_router.router)        # Admin dashboard analytics and top 5 diseases leaderboard
app.include_router(crop_router.router)         # Dual-factor crop suitability analysis & recommendation
app.include_router(disease_router.router)      # Plant pathology image diagnostics & DOA treatments
app.include_router(chat_router.router)         # AI agricultural extension chatbot
app.include_router(cultivation_router.router)  # DOA standard step-by-step cultivation roadmaps
app.include_router(market_router.router)       # Wholesale market price forecasting (Dambulla/Manning)

# 5. Health Check Endpoint
@app.get("/api/health", tags=["Health"])
async def health_check():
    """Simple ping endpoint to verify that the backend service is alive and healthy."""
    return {"status": "ok"}

# 6. Local Development Execution Entrypoint
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
