from dotenv import load_dotenv
load_dotenv()

import secrets
from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from app.routers import auth, stats

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=secrets.token_urlsafe(64))

app.include_router(auth.router, prefix="/api")
app.include_router(stats.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Please authenticate via /api/auth/login"}
