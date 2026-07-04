from fastapi import APIRouter, Form, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os

from app.database import get_db
from app import schemas, crud
from app.auth import admin_auth

router = APIRouter(prefix="/admin/full-screen-ads", tags=["Full Screen Advertisement"])
public_router = APIRouter(prefix="/full-screen-ads", tags=["Full Screen Advertisement"])


# ------------------ ADMIN CREATE ------------------
@router.post("/", response_model=schemas.FullScreenAdOut)
def create_full_screen_ad(
    title: str = Form(...),
    image: UploadFile = File(...),
    page_type: str = Form(...),
    link: str = Form(None),
    status: bool = Form(...),
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):
    image_path = None

    if image:
        os.makedirs("static/full_screen_ads", exist_ok=True)
        file_location = f"static/full_screen_ads/{image.filename}"
        with open(file_location, "wb+") as f:
            f.write(image.file.read())
        image_path = file_location

    data = schemas.FullScreenAdCreate(
        title=title,
        image=image_path,
        page_type=page_type,
        link=link,
        status=status
    )

    return crud.create_full_screen_ad(db, data)


# ------------------ ADMIN UPDATE ------------------
@router.put("/{ad_id}", response_model=schemas.FullScreenAdOut)
def update_full_screen_ad(
    ad_id: int,
    title: str = Form(...),
    image: UploadFile | None = File(None),
    page_type: str = Form(...),
    link: str = Form(None),
    status: bool = Form(...),
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):
    image_path = None
    if image:
        os.makedirs("static/full_screen_ads", exist_ok=True)
        image_path = f"static/full_screen_ads/{image.filename}"
        with open(image_path, "wb") as f:
            f.write(image.file.read())

    data = schemas.FullScreenAdUpdate(
        title=title,
        page_type=page_type,
        link=link,
        status=status,
        image=image_path
    )

    ad = crud.update_full_screen_ad(db, ad_id, data, image_path)

    if not ad:
        raise HTTPException(status_code=404, detail="Full Screen Ad not found")

    return ad


# ------------------ ADMIN DELETE ------------------
@router.delete("/{ad_id}")
def delete_full_screen_ad(ad_id: int, db: Session = Depends(get_db), _: str = Depends(admin_auth)):
    ad = crud.delete_full_screen_ad(db, ad_id)
    if not ad:
        raise HTTPException(status_code=404, detail="Full Screen Ad not found")
    return {"message": "Deleted successfully"}


# ------------------ PUBLIC GET ------------------
@public_router.get("/", response_model=List[schemas.FullScreenAdOut])
def get_full_screen_ads(db: Session = Depends(get_db)):
    return crud.get_all_full_screen_ads(db)
