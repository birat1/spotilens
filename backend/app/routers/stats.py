from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse, RedirectResponse
import spotipy
from ..dependencies import get_spotify_client

router = APIRouter()

@router.get("/me/profile")
def get_profile(sp: spotipy.Spotify = Depends(get_spotify_client)):
    user_data = sp.current_user()
    if not user_data:
        return JSONResponse({"error": "Could not fetch user profile"})

    return JSONResponse(user_data)

@router.get("/me/top/tracks")
def get_top_tracks(sp: spotipy.Spotify = Depends(get_spotify_client), limit: int = 10, time_range: str = "short_term"):
    top_tracks = sp.current_user_top_tracks(limit=limit, time_range=time_range)
    if not top_tracks:
        return JSONResponse({"error": "Could not fetch top tracks"})

    return JSONResponse(top_tracks)
