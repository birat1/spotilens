from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, RedirectResponse
import spotipy
from .auth import sp_oauth

router = APIRouter()

@router.get("/me/profile")
def get_profile(request: Request):
    token_info = request.session.get('token_info')
    if not token_info:
        return RedirectResponse(url="/")
    
    if sp_oauth.auth_manager.is_token_expired(token_info):
        new_token_info = sp_oauth.auth_manager.refresh_access_token(token_info['refresh_token'])
        request.session['token_info'] = new_token_info
        token_info = new_token_info

    sp = spotipy.Spotify(auth=token_info['access_token'])
    user_data = sp.current_user()
    if not user_data:
        return JSONResponse({"error": "User not authenticated"})
    
    return JSONResponse(user_data)
