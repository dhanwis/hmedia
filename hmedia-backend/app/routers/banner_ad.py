from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.auth import admin_auth
from typing import List
import os

from app.database import get_db
from app import schemas, crud

router = APIRouter(prefix="/admin/banner-ads", tags=["Banner Advertisement"])
public_router = APIRouter(prefix="/banner-ads",tags=["Banner Advertisement"])

@router.post("/", response_model=schemas.BannerAdOut)
def create_ad(
    title: str = Form(...),
    image: UploadFile = File(None),
    page_type: str = Form(...),
    order: int = Form(...),
    link: str = Form(...),
    status: bool = Form(...),
    show_contact: bool = Form(...),
    created_at: str = Form(...),
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):
    image_path = None

    if image:
        os.makedirs("static/banner_ads", exist_ok=True)
        file_location = f"static/banner_ads/{image.filename}"

        with open(file_location, "wb+") as f:
            f.write(image.file.read())

        image_path = file_location  # ✅ string
    
    data = schemas.BannerAdCreate(
        title=title, image=image_path, page_type=page_type, order=order, link=link, status=status,
        show_contact=show_contact,created_at=created_at )
    
    return crud.create_banner_ad(db, data)

@public_router.get("/", response_model=List[schemas.BannerAdOut])
def get_ads(db: Session = Depends(get_db)):
    return crud.get_all_banner_ads(db)

@router.put("/{ad_id}", response_model=schemas.BannerAdOut)
def update_ad(
    ad_id: int,
    title: str = Form(...),
    image: UploadFile | None = File(None),  # ✅ optional
    page_type: str = Form(...),
    order: int = Form(...),
    link: str = Form(...),
    status: bool = Form(...),
    show_contact: bool = Form(...),
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):

    image_path = None

    # Save image ONLY if uploaded
    if image:
        os.makedirs("static/banner_ads", exist_ok=True)
        image_path = f"static/banner_ads/{image.filename}"

        with open(image_path, "wb") as f:
            f.write(image.file.read())

    data = schemas.BannerAdUpdate(
        title=title,
        page_type=page_type,
        order=order,
        link=link,
        status=status,
        show_contact=show_contact
    )

    ad = crud.update_banner_ad(db, ad_id, data, image_path)

    if not ad:
        raise HTTPException(status_code=404, detail="Item not found")

    return ad


@router.delete("/{ad_id}")
def delete_ad(ad_id: int, db: Session = Depends(get_db),  _: str = Depends(admin_auth)):
    ad = crud.delete_banner_ad(db, ad_id)
    if not ad:
        raise HTTPException(status_code=404, detail="Banner Ad not found")
    return {"message": "Deleted successfully"}