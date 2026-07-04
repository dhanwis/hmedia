from fastapi import APIRouter,Form,UploadFile,File,Depends,HTTPException
from sqlalchemy.orm import Session
from app.auth import admin_auth
from typing import List
import os

from app.database import get_db
from app import schemas,crud




router = APIRouter(prefix="/admin/bottom-banner-ads",tags=["Bottom Banner Advertisement"])

public_router = APIRouter(prefix="/bottom-banner-ads",tags=[" Bottom Banner Advertisement"])

@router.post("/",response_model=schemas.BottomBannerOut)
def create_bottom_ad(
    title: str = Form(...),
    image: UploadFile = File(...),
    page_type: str = Form(...),
    order: int = Form(...),
    link: str = Form(None),
    status: bool = Form(...),
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
 ):
    image_path = None
    
    if image:
        os.makedirs("static/bottom_banner_ads", exist_ok=True)
        file_location = f"static/bottom_banner_ads/{image.filename}"

        with open(file_location, "wb+") as f:
            f.write(image.file.read())

        image_path = file_location  # ✅ string
        
    data = schemas.BottomBannerCreate(
        title=title,image=image_path,
        page_type=page_type,order=order,
        link=link,status=status
    )
    return crud.create_bottom_banner_ad(db, data)

@public_router.get("/", response_model=List[schemas.BottomBannerOut])
def get_bottom_ads(db: Session = Depends(get_db)):
    return crud.get_all_bottom_banner_ads(db)



'''''  

    title: str
    page_type: str
    order: int
    status: bool = True
    image: str
    link: Optional[str] = None

'''

@router.put("/{ad_id}", response_model=schemas.BottomBannerOut)
def update_bottom_ad(
    ad_id: int,
    title: str = Form(...),
    image: UploadFile | None = File(None),  # optional
    page_type: str = Form(...),
    order: int = Form(...),
    link: str = Form(None),
    status: bool = Form(...),
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):
    image_path = None

    # Save new image if uploaded
    if image:
        os.makedirs("static/bottom_banner_ads", exist_ok=True)
        image_path = f"static/bottom_banner_ads/{image.filename}"
        with open(image_path, "wb") as f:
            f.write(image.file.read())

    # Prepare update data
    data = schemas.BottomBannerUpdate(
        title=title,
        page_type=page_type,
        order=order,
        link=link,
        status=status,
        image=image_path  # optional, will be used in CRUD
    )

    # Call CRUD update
    ad = crud.update_bottom_banner_ad(db, ad_id, data, image_path)

    if not ad:
        raise HTTPException(status_code=404, detail="Bottom Banner Ad not found")

    return ad

    
    
@router.delete("/{ad_id}")
def delete_bottom_ad(ad_id: int, db: Session = Depends(get_db),  _: str = Depends(admin_auth)):
    ad = crud.delete_bottom_banner_ad(db, ad_id)
    if not ad:
        raise HTTPException(status_code=404, detail="Banner Ad not found")
    return {"message": "Deleted successfully"}  




