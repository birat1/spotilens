from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
import spotipy
from typing import Counter, Dict, List, Literal
from datetime import datetime
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

# Need to rework on this
""" @router.get("/me/stats")
def get_stats(sp: spotipy.Spotify = Depends(get_spotify_client)):
    top_artists = sp.current_user_top_artists(limit=50, time_range="short_term")

    genres = []
    for artist in top_artists['items']:
        genres.extend(artist['genres'])
    top_genres = Counter(genres).most_common(10)

    recently_played = sp.current_user_recently_played(limit=50)
    hour_counter = Counter()

    for item in recently_played['items']:
        played_at = datetime.fromisoformat(item['played_at'].replace('Z', '+00:00'))
        hour_counter[played_at.hour] += 1

    listening_hours: List[Dict[str, int]] = [
        {"hour": h, "play_count": count} for h, count in sorted(hour_counter.items())
    ]

    most_active_hour = hour_counter.most_common(1)[0][0] if hour_counter else None

    return JSONResponse({
        "top_genres": [{"genre": g, "count": c} for g, c in top_genres],
        "listening_hours": listening_hours,
        "most_active_hour": most_active_hour,
    }) """
