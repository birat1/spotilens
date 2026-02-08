from fastapi import APIRouter, HTTPException, Request
from fastapi.params import Depends
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel
from spotipy.oauth2 import SpotifyOAuth

from app.config import get_settings
from app.dependencies import get_spotify_oauth

settings = get_settings()
router = APIRouter()

class RefreshRequest(BaseModel):
    refresh_token: str

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

    frontend_url = f"https://spotilens.netlify.app?access_token={token_info['access_token']}&refresh_token={token_info['refresh_token']}"

    return RedirectResponse(url=frontend_url)

@router.post("/auth/refresh")
def refresh(payload: RefreshRequest, sp_oauth: SpotifyOAuth = Depends(get_spotify_oauth)) -> JSONResponse:  # noqa: B008
    """Endpoint to refresh Spotify access token."""
    try:
        new_token_info = sp_oauth.refresh_access_token(payload.refresh_token)
        return {
            "access_token": new_token_info["access_token"],
            "refresh_token": new_token_info.get("refresh_token", payload.refresh_token),
        }
    except Exception as e:
        return HTTPException(status_code=401, detail="Failed to refresh token. Please log in again.")

@router.get("/auth/logout")
def logout(request: Request) -> RedirectResponse:
    """Logout endpoint to clear session."""
    request.session.clear()

    return RedirectResponse(url="https://spotilens.netlify.app")
