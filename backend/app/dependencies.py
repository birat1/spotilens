import spotipy
from fastapi import HTTPException, Request
from fastapi.params import Depends
from spotipy.oauth2 import SpotifyOAuth

from app.config import get_settings

settings = get_settings()

def get_spotify_oauth() -> SpotifyOAuth:
    """Get SpotifyOAuth instance using settings."""
    return SpotifyOAuth(
        client_id=settings.CLIENT_ID,
        client_secret=settings.CLIENT_SECRET,
        redirect_uri=settings.REDIRECT_URI,
        scope=settings.SCOPE,
    )

def get_spotify_client(request: Request, sp_oauth: SpotifyOAuth = Depends(get_spotify_oauth)) -> spotipy.Spotify:  # noqa: B008
    """Retrieve a Spotify client for the authenticated user."""
    token_info = request.session.get("token_info")
    if not token_info:
        raise HTTPException(status_code=401, detail="User not authenticated")

    if sp_oauth.is_token_expired(token_info):
        try:
            new_token_info = sp_oauth.refresh_access_token(token_info["refresh_token"])
            request.session["token_info"] = new_token_info
            token_info = new_token_info
        except Exception as e:
            request.session.clear()
            raise HTTPException(status_code=401, detail="Session expired. Please log in again.") from e

    return spotipy.Spotify(auth=token_info["access_token"])
