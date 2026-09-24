# ==============================================================================
# WEATHER & CLIMATE SERVICE (Open-Meteo API Integration)
# Retrieves real-time meteorological metrics and forecasts for crop suitability
# ==============================================================================

import httpx

async def get_current_weather(lat: float, lon: float) -> dict:
    """
    Fetches real-time weather conditions (temperature, windspeed, weather code)
    from Open-Meteo API using farmland GPS coordinates.
    """
    # Open-Meteo current weather endpoint
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true"
    try:
        # Non-blocking async HTTP GET with 4s timeout
        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                # Return dictionary containing temperature, windspeed, winddirection, weathercode
                return response.json().get("current_weather", {})
    except Exception as e:
        print(f"Weather warning: {e}")
    # Return empty dict if API is unavailable so fallback defaults can be applied
    return {}

async def get_climate_data(lat: float, lon: float) -> dict:
    """
    Retrieves daily multi-day climate trends (max/min temperatures, total precipitation)
    used for in-depth agronomic growth cycle calculations.
    """
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto"
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                # Returns daily rainfall and temperature time series
                return response.json().get("daily", {})
    except Exception as e:
        print(f"Climate warning: {e}")
    return {}
