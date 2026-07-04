from fastapi import APIRouter, Depends, HTTPException, Form
from app.auth import admin_auth
from sqlalchemy.orm import Session
from app import database, crud, schemas
from typing import Optional

router = APIRouter(prefix="/admin/flash-news", tags=["Flash News"])
public_router = APIRouter(prefix="/flash-news", tags=["Flash News"])

# ---------------- Admin Routes ----------------

# Create Flash News
@router.post("/", response_model=schemas.FlashNewsOut)
def create_flash_news(
    title: str = Form(...),
    status: str = Form(...),
    link: Optional[str] = Form(None),
    db: Session = Depends(database.get_db),
    _: str = Depends(admin_auth)
):
    flash_obj = schemas.FlashNewsCreate(title=title, status=status,link=link)
    return crud.create_flash_news(db, flash_obj)


# Update Flash News
@router.put("/{flash_id}", response_model=schemas.FlashNewsOut)
def update_flash_news(
    flash_id: int,
    title: str = Form(...),
    status: str = Form(...),
    link: Optional[str] = Form(None),
    db: Session = Depends(database.get_db),
    _: str = Depends(admin_auth)
):
    
    flash_obj = schemas.FlashNewsCreate(title=title, status=status, link=link)
    updated = crud.update_flash_news(db, flash_id, flash_obj)
    if not updated:
        raise HTTPException(status_code=404, detail="Flash News not found")
    return updated

# Delete Flash News
@router.delete("/{flash_id}")
def delete_flash_news(
    flash_id: int,
    db: Session = Depends(database.get_db),
    _: str = Depends(admin_auth)
):

    deleted = crud.delete_flash_news(db, flash_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Flash News not found")
    return {"detail": "Deleted successfully"}


# ---------------- Public Routes ----------------

@public_router.get("/", response_model=list[schemas.FlashNewsOut])
def get_all_flash_news(db: Session = Depends(database.get_db)):
    return crud.get_all_flash_news(db)

@public_router.get("/{flash_id}", response_model=schemas.FlashNewsOut)
def get_one_flash_news(flash_id: int, db: Session = Depends(database.get_db)):
    item = crud.get_flash_news_by_id(db, flash_id)
    if not item:
        raise HTTPException(status_code=404, detail="Flash News not found")
    return item
