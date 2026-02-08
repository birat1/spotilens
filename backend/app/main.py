from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

load_dotenv()
from app.config import get_settings  # noqa: E402
from app.routers import auth, stats  # noqa: E402

settings = get_settings()

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=settings.SESSION_SECRET, https_only=True, same_site="none")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
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
