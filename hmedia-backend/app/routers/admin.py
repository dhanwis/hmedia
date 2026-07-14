from fastapi import APIRouter, HTTPException, Form, Response,Query, Depends,status
from app.auth import verify_password, create_access_token, admin_auth
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


# Add 06/07/2026 for image file name check , to avoid overwriting 

@router.get("/check-image-exists")
def check_image_exists(
    filename: str = Query(...),
    category: str = Query(...),
    _: str = Depends(admin_auth)
):
    category_map = {
        "cinema": "static/cinema_images",
        "latest": "static/images",
        "meetperson": "static/meet_person_images",
        "more": "static/more_news_images"
    }
    dir_path = category_map.get(category)
    if not dir_path:
        raise HTTPException(status_code=400, detail="Invalid category")

    # Split name and extension
    base, ext = os.path.splitext(filename)
    
    # Strip brackets, e.g. "new_image(1).png" -> "new_image.png"
    clean_base = base.split("(")[0].strip()
    clean_filename = f"{clean_base}{ext.lower()}"

    # Debug prints requested by frontend developer
    print("Directory:", dir_path)
    print("Directory exists:", os.path.exists(dir_path))
    print("Searching for:", clean_filename)
    if os.path.exists(dir_path):
        print("Files on disk:", os.listdir(dir_path))

    if not os.path.exists(dir_path):
        return {"exists": False, "cleaned_filename": clean_filename}

    # Case-insensitive check on the disk
    exists = False
    for existing_file in os.listdir(dir_path):
        if existing_file.lower() == clean_filename.lower():
            exists = True
            clean_filename = existing_file
            break

    return {
        "exists": exists,
        "cleaned_filename": clean_filename
    }
