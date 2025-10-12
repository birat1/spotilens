from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/me/profile")
def get_profile(request: Request):
    user_data = request.session.get('user_data')
    if not user_data:
        return JSONResponse({"error": "User not authenticated"})
    return JSONResponse(user_data)
