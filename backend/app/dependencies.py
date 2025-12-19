import spotipy
from fastapi import HTTPException, Request

from .routers.auth import sp_oauth


def get_spotify_client(request: Request) -> spotipy.Spotify:
    """Retrieve a Spotify client for the authenticated user."""
    token_info = request.session.get("token_info")
    if not token_info:
        raise HTTPException(status_code=401, detail="User not authenticated")

    if sp_oauth.auth_manager.is_token_expired(token_info):
        try:
            new_token_info = sp_oauth.auth_manager.refresh_access_token(token_info["refresh_token"])
            request.session["token_info"] = new_token_info
            token_info = new_token_info
        except Exception as e:
            request.session.clear()
            raise HTTPException(status_code=401, detail="Session expired. Please log in again.") from e

    return spotipy.Spotify(auth=token_info["access_token"])
