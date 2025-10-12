from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
import spotipy
from typing import Literal
from ..dependencies import get_spotify_client

router = APIRouter()

@router.get("/me/profile")
def get_profile(sp: spotipy.Spotify = Depends(get_spotify_client)):
    user_data = sp.current_user()
    if not user_data:
        return JSONResponse({"error": "Could not fetch user profile"})

    return JSONResponse(user_data)

@router.get("/me/top/tracks")
def get_top_tracks(sp: spotipy.Spotify = Depends(get_spotify_client), limit: int = 10, time_range: Literal["short_term", "medium_term", "long_term"] = "short_term"):
    top_tracks = sp.current_user_top_tracks(limit=limit, time_range=time_range)
    if not top_tracks:
        return JSONResponse({"error": "Could not fetch top tracks"})

    return JSONResponse(top_tracks)

@router.get("/me/top/artists")
def get_top_artists(sp: spotipy.Spotify = Depends(get_spotify_client), limit: int = 10, time_range: Literal["short_term", "medium_term", "long_term"] = "short_term"):
    top_artists = sp.current_user_top_artists(limit=limit, time_range=time_range)
    if not top_artists:
        return JSONResponse({"error": "Could not fetch top artists"})

    return JSONResponse(top_artists)

@router.get("/me/recently-played")
def get_recently_played(sp: spotipy.Spotify = Depends(get_spotify_client), limit: int = 10):
    recently_played = sp.current_user_recently_played(limit=limit)
    if not recently_played:
        return JSONResponse({"error": "Could not fetch recently played tracks"})

    return JSONResponse(recently_played)

@router.get("/me/player")
def get_current_playback(sp: spotipy.Spotify = Depends(get_spotify_client)):
    current_playback = sp.current_playback()
    if not current_playback:
        return JSONResponse({"error": "Could not fetch current playback"})

    return JSONResponse(current_playback)

@router.get("/me/player/currently-playing")
def get_current_track(sp: spotipy.Spotify = Depends(get_spotify_client)):
    currently_playing = sp.currently_playing()
    if not currently_playing:
        return JSONResponse({"error": "Could not fetch currently playing track"})

    return JSONResponse(currently_playing)
