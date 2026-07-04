from fastapi import APIRouter, Depends, HTTPException, Form,Query
from sqlalchemy.orm import Session
from typing import List
from app.auth import admin_auth
from app.database import get_db
from app import schemas, crud

router = APIRouter(prefix="/admin/teaser-and-promo",tags=["Teaser & Promo"])
public_router = APIRouter(prefix="/teaser-and-promo",tags=["Teaser & Promo"])

@router.post("/", response_model=schemas.TeaserAndPromoOut)
def create_item(
    video_title: str = Form(...),
    video_url: str = Form(...),
    active_inactive: bool = Form(...),
    published_date: str = Form(...),
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):
    
    data = schemas.TeaserAndPromoCreate(
        video_title=video_title, video_url=video_url, active_inactive=active_inactive, 
        published_date=published_date)
    
    return crud.create_teaser_and_promo(db, data)


@public_router.get("/", response_model=List[schemas.TeaserAndPromoOut])
def get_items(db: Session = Depends(get_db)):
    return crud.get_all_teaser_and_promo(db)
    
@public_router.get("/limit", response_model=List[schemas.TeaserAndPromoOut])
def get_latest_items(db: Session = Depends(get_db)):
    return crud.get_latest_teaser_and_promo(db)
    
    
# ========================
# Read_Teaser_and_Promo_Paginate
# ========================
@public_router.get("/paginate", response_model=schemas.PaginatedTeaserAndPromo)
def read_teaser_and_promo_paginate(
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
):
    return crud.get_teaser_and_promo_paginate(db, page)

@public_router.get("/{item_id}", response_model=schemas.TeaserAndPromoOut)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = crud.get_teaser_and_promo_by_id(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.put("/{item_id}", response_model=schemas.TeaserAndPromoOut)
def update_item(
    item_id: int,
    video_title: str = Form(...),
    video_url: str = Form(...),
    active_inactive: bool = Form(...),
    published_date: str = Form(...),
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):
    data = schemas.TeaserAndPromoUpdate(
        video_title=video_title, video_url=video_url, 
        active_inactive=active_inactive, published_date=published_date
    )

    item = crud.update_teaser_and_promo(db, item_id, data)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db), _: str = Depends(admin_auth)):
    item = crud.delete_teaser_and_promo(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Deleted successfully"}
