from config import get_settings
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse, JSONResponse
import spotipy
from spotipy.oauth2 import SpotifyOAuth

app = FastAPI()

settings = get_settings()

sp_oauth = spotipy.Spotify(auth_manager=SpotifyOAuth(
    client_id=settings.CLIENT_ID,
    client_secret=settings.CLIENT_SECRET,
    redirect_uri=settings.REDIRECT_URI,
    scope="user-library-read"
))

@app.get("/login")
def login():
    auth_url = sp_oauth.auth_manager.get_authorize_url()
    return RedirectResponse(auth_url)

@app.get("/callback")
def callback(request: Request):
    code = request.query_params.get('code')
    token_info = sp_oauth.auth_manager.get_access_token(code)
    sp = spotipy.Spotify(auth=token_info['access_token'])
    user_data = sp.current_user()
    return JSONResponse(user_data)
