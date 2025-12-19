import secrets

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.routers import auth, stats

load_dotenv()


app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=secrets.token_urlsafe(64))
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(stats.router, prefix="/api")

@app.get("/")
def read_root() -> dict:
    """Root endpoint prompting for authentication."""
    return {"message": "Please authenticate via /api/auth/login"}
