import spotipy
from fastapi import APIRouter, Request
from fastapi.params import Depends
from fastapi.responses import JSONResponse, RedirectResponse
from spotipy.oauth2 import SpotifyOAuth

from app.config import get_settings
from app.dependencies import get_spotify_oauth

settings = get_settings()

router = APIRouter()

@router.get("/auth/login")
def login(sp_oauth: SpotifyOAuth = Depends(get_spotify_oauth)) -> RedirectResponse:  # noqa: B008
    """Login endpoint to initiate Spotify OAuth2 flow."""
    auth_url = sp_oauth.get_authorize_url()
    return RedirectResponse(auth_url)

@router.get("/auth/callback")
def callback(request: Request, sp_oauth: SpotifyOAuth = Depends(get_spotify_oauth)) -> RedirectResponse:  # noqa: B008
    """Handle Spotify OAuth2 callback."""
    code = request.query_params.get("code")
    if not code:
        return JSONResponse({"error": "Authorization code not found"})

    token_info = sp_oauth.get_access_token(code)
    request.session["token_info"] = token_info

    return RedirectResponse(url="/")

@router.get("/auth/logout")
def logout(request: Request) -> RedirectResponse:
    """Logout endpoint to clear session."""
    request.session.clear()

    return RedirectResponse(url="/")
