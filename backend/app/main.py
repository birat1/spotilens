from dotenv import load_dotenv
load_dotenv()

import secrets
from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from app.routers import auth, stats

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=secrets.token_urlsafe(64))

app.include_router(auth.router, prefix="/auth")
app.include_router(stats.router)
