from fastapi import APIRouter, HTTPException, Form, Response
from app.auth import verify_password, create_access_token
import os

router = APIRouter(prefix="/admin", tags=["admin"])

# Load admin credentials from .env
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")

# @router.post("/login")
# def admin_login(
#     response: Response,
#     username: str = Form(...),
#     password: str = Form(...)
# ):
#     if username != ADMIN_USERNAME or not verify_password(password):
#         raise HTTPException(status_code=401, detail="Invalid credentials")

#     token = create_access_token()

#     response.set_cookie(
#         key="admin_token",
#         value=token,
#         httponly=True,
#         secure=False,          # set False only for local http
#         samesite="Lax",    # prevents CSRF
#         max_age=60 * 60 * 2   # 2 hours
#     )

#     return {"message": "Login successful"}

@router.post("/login")
def admin_login(
    username: str = Form(...),
    password: str = Form(...)
):
    if username != ADMIN_USERNAME or not verify_password(password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token()

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# @router.post("/logout")
# def admin_logout(response: Response):
#     response.delete_cookie("admin_token")
#     return {"message": "Logged out"}

@router.post("/logout")
def admin_logout():
    return {"message": "Logged out"}
