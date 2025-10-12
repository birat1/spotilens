from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse, JSONResponse
import spotipy
from spotipy.oauth2 import SpotifyOAuth

from app.config import get_settings
settings = get_settings()

sp_oauth = spotipy.Spotify(auth_manager=SpotifyOAuth(
    client_id=settings.CLIENT_ID,
    client_secret=settings.CLIENT_SECRET,
    redirect_uri=settings.REDIRECT_URI,
    scope=settings.SCOPE,
))

router = APIRouter()
@router.get("/auth/login")
def login():
    auth_url = sp_oauth.auth_manager.get_authorize_url()
    return RedirectResponse(auth_url)

@router.get("/auth/callback")
def callback(request: Request):
    code = request.query_params.get('code')
    if not code:
        return JSONResponse({"error": "Authorization code not found"})

    token_info = sp_oauth.auth_manager.get_access_token(code)
    request.session['token_info'] = token_info

    # print(token_info)
    # return JSONResponse(user_data)

    return RedirectResponse(url="/api/me/profile")

@router.get("/auth/logout")
def logout(request: Request):
    request.session.clear()

    return RedirectResponse(url="/")
