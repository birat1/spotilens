import spotipy
from fastapi import HTTPException, Request, Security
from fastapi.params import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from spotipy.oauth2 import SpotifyOAuth

from app.config import get_settings

settings = get_settings()
security = HTTPBearer()

def get_spotify_oauth() -> SpotifyOAuth:
    """Get SpotifyOAuth instance using settings."""
    return SpotifyOAuth(
        client_id=settings.CLIENT_ID,
        client_secret=settings.CLIENT_SECRET,
        redirect_uri=settings.REDIRECT_URI,
        scope=settings.SCOPE,
    )

def get_spotify_client(auth: HTTPAuthorizationCredentials = Security(security)) -> spotipy.Spotify:  # noqa: B008
    """Retrieve a Spotify client for the authenticated user."""
    token = auth.credentials

    if not token:
        raise HTTPException(status_code=401, detail="User not authenticated")

    return spotipy.Spotify(auth=token)
