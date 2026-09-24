# ==============================================================================
# LOCATION SERVICE (Nominatim OpenStreetMap Reverse Geocoder)
# Converts GPS coordinates (Latitude & Longitude) into District and Province names.
# ==============================================================================

import httpx

async def reverse_geocode(lat: float, lon: float) -> dict:
    """
    Takes GPS coordinates (lat, lon) and queries OpenStreetMap Nominatim API.
    Returns:
        - location_name: Full display address
        - district: Administrative district (e.g. Nuwara Eliya, Anuradhapura, Kandy)
        - province: Province name (e.g. Central Province, North Central)
    """
    # OpenStreetMap Nominatim endpoint with JSON formatting
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json"
    
    # Custom User-Agent header required by OpenStreetMap usage policy
    headers = {'User-Agent': 'AgriSenseApp/1.0 (contact@agrisense.lk)'}
    
    try:
        # Asynchronous HTTP GET request with 4-second timeout to avoid blocking
        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                address = data.get("address", {})
                return {
                    "location_name": data.get("display_name", "Unknown"),
                    # Extract district or fallback to county
                    "district": address.get("state_district") or address.get("county", "Unknown"),
                    # Extract province or state
                    "province": address.get("state", "Unknown")
                }
    except Exception as e:
        # Print fallback warning if network/geocoding fails without crashing server
        print(f"Geocoding warning: {e}")
        
    # Return safe fallback defaults if geocoding fails or is offline
    return {"location_name": "Unknown", "district": "Unknown", "province": "Unknown"}
