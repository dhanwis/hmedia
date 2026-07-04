from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app import database, crud, schemas
from app.auth import admin_auth
import os
from typing import Optional

router = APIRouter(prefix="/admin/banner", tags=["banner"])

# -----------------------
# Add Banner
# -----------------------
@router.post("/", response_model=schemas.BannerOut)
def add_banner(
    title: str = Form(...),
    image: UploadFile = File(None),
    status: str = Form(...),
    # added code
    link: Optional[str] = Form(None),
    db: Session = Depends(database.get_db),
    _: str = Depends(admin_auth)
):

    image_path = None
    if image:
        os.makedirs("static/banners", exist_ok=True)
        file_location = f"static/banners/{image.filename}"
        with open(file_location, "wb+") as file_object:
            file_object.write(image.file.read())
        image_path = file_location

    # add link=link in bracket
    banner_obj = schemas.BannerCreate(title=title, image=image_path, status=status,link=link)
    return crud.create_banner(db, banner_obj)


@router.put("/{banner_id}", response_model=schemas.BannerOut)
def edit_banner(
    banner_id: int,
    title: str = Form(...),
    image: UploadFile | None = File(None),
    status: str = Form(...),
    # added code
    link: Optional[str] = Form(None),
    db: Session = Depends(database.get_db),
    _: str = Depends(admin_auth)
):

    saved_filename = None

    # Save new image if uploaded
    if image is not None:
        os.makedirs("static/banners", exist_ok=True)
        saved_filename = f"static/banners/{image.filename}"

        with open(saved_filename, "wb") as f:
            f.write(image.file.read())

    updated = crud.update_banner(
        db,
        banner_id,
        title=title,
        status=status,
        # added code
        link=link,
        new_image_path=saved_filename  # send file path, not UploadFile
    )

    if not updated:
        raise HTTPException(status_code=404, detail="Banner not found")

    return updated

# -----------------------
# Delete Banner
# -----------------------
@router.delete("/{banner_id}")
def remove_banner(
    banner_id: int,
    db: Session = Depends(database.get_db),
    _: str = Depends(admin_auth)
):

    deleted = crud.delete_banner(db, banner_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Banner not found")
    return {"detail": "Deleted successfully"}


# -----------------------
# Get Banners (Public)
# -----------------------
from fastapi import APIRouter

public_router = APIRouter(prefix="/banner", tags=["banner"])

@public_router.get("/", response_model=list[schemas.BannerOut])
def read_banners(db: Session = Depends(database.get_db)):
    return crud.get_all_banners(db)
    
@public_router.get("/homepage", response_model=list[schemas.BannerOut])
def read_latestactive_banners(db: Session = Depends(database.get_db)):
    return crud.get_all_latestactive_banners(db)
