from fastapi import APIRouter, HTTPException
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

geolocator = Nominatim(user_agent="CityFixApp/1.0")

@router.get("/geocode")
async def geocode_address(address: str):
    try:
        location = geolocator.geocode(address, timeout=10)
        if location:
            return {
                "address": location.address,
                "latitude": location.latitude,
                "longitude": location.longitude
            }
        else:
            raise HTTPException(status_code=404, detail="Address not found")
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        logger.error(f"Geocoding error: {str(e)}")
        raise HTTPException(status_code=503, detail="Geocoding service unavailable")

@router.get("/reverse-geocode")
async def reverse_geocode(lat: float, lng: float):
    try:
        location = geolocator.reverse(f"{lat}, {lng}", timeout=10)
        if location:
            return {
                "address": location.address,
                "latitude": location.latitude,
                "longitude": location.longitude
            }
        else:
            raise HTTPException(status_code=404, detail="Location not found")
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        logger.error(f"Reverse geocoding error: {str(e)}")
        raise HTTPException(status_code=503, detail="Geocoding service unavailable")
