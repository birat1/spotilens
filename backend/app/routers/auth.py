import spotipy
from fastapi import APIRouter, Request
from fastapi.params import Depends
from fastapi.responses import JSONResponse, RedirectResponse
from spotipy.oauth2 import SpotifyOAuth
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db import get_db
from app.dependencies import get_spotify_oauth
from app.models import User

settings = get_settings()

router = APIRouter()


@router.get("/auth/login")
def login(sp_oauth: SpotifyOAuth = Depends(get_spotify_oauth)) -> RedirectResponse:  # noqa: B008
    """Login endpoint to initiate Spotify OAuth2 flow."""
    auth_url = sp_oauth.get_authorize_url()
    return RedirectResponse(auth_url)


@router.get("/auth/callback")
async def callback(request: Request, sp_oauth: SpotifyOAuth = Depends(get_spotify_oauth), db: AsyncSession = Depends(get_db)) -> RedirectResponse:  # noqa: B008
    """Handle Spotify OAuth2 callback and store user in DB."""
    code = request.query_params.get("code")
    if not code:
        return JSONResponse({"error": "Authorization code not found"}, status_code=400)

    token_info = sp_oauth.get_access_token(code)
    request.session["token_info"] = token_info

    # Fetch user profile
    sp = spotipy.Spotify(auth=token_info["access_token"])
    user_data = sp.current_user()

    if user_data and "id" in user_data:
        user_id = user_data["id"]
        request.session["user_id"] = user_id

        # Store user into DB
        user = User(id=user_id)
        await db.merge(user)
        await db.commit()

    return RedirectResponse(url="/")


@router.get("/auth/logout")
def logout(request: Request) -> RedirectResponse:
    """Logout endpoint to clear session."""
    request.session.clear()

    return RedirectResponse(url="/")
