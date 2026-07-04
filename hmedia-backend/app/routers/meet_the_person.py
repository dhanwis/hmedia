import re
from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, File, Request,Query
from sqlalchemy import func
from fastapi.responses import HTMLResponse
from app.auth import admin_auth
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas, crud
from app.models import MeetThePerson,MeetThePersonView
import urllib.parse
from fastapi.responses import HTMLResponse, RedirectResponse



router = APIRouter(prefix="/admin/meet-person", tags=["Meet The Person"])
public_router = APIRouter(prefix="/meet-person", tags=["Meet The Person"])

FRONTEND_URL = "https://channelhmedia.in"
BACKEND_URL = "https://hmedia-api.channelhmedia.in"

# MUST be lowercase
BOT_KEYWORDS = [
    "facebookexternalhit",
    "twitterbot",
    "whatsapp",
    "slackbot",
    "linkedinbot",
    "telegrambot"
]

# ------------------- CREATE -------------------
@router.post("/", response_model=schemas.MeetThePersonOut)
def create_item(
    title: str = Form(...),
    slug: str = Form(...),
    content: str = Form(...),
    author: str = Form(...),
    date:str = Form(...),
    trending:bool = Form(...),
    image: UploadFile = File(None),
    tags: list = Form(...),
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):

    image_path = None
    if image:
        import os
        os.makedirs("static/meet_person_images", exist_ok=True)
        file_location = f"static/meet_person_images/{image.filename}"
        with open(file_location, "wb+") as f:
            f.write(image.file.read())
        image_path = file_location

    data = schemas.MeetThePersonCreate(
        title=title, slug=slug, content=content, author=author, 
        date=date, image=image_path, trending=trending, tags=tags
    )
    return crud.create_meet_person(db, data)


# ------------------- UPDATE -------------------
@router.put("/{item_id}", response_model=schemas.MeetThePersonOut)
def update_item(
    item_id: int,
    title: str = Form(...),
    slug: str = Form(...),
    content: str = Form(...),
    author: str = Form(...),
    date:str = Form(...),
    trending:bool = Form(...),
    image: UploadFile = File(None),
    tags: list = Form(...),
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):

    image_path = None
    if image:
        import os
        os.makedirs("static/meet_person_images", exist_ok=True)
        file_location = f"static/meet_person_images/{image.filename}"
        with open(file_location, "wb+") as f:
            f.write(image.file.read())
        image_path = file_location

    data = schemas.MeetThePersonCreate(
        title=title, slug=slug, content=content,
        author=author, date=date, image=image_path,
        trending=trending, tags=tags
    )

    updated = crud.update_meet_person(db, item_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated


# ------------------- PATCH add_to_home ONLY -------------------
@router.patch("/{item_id}/add_to_home", response_model=schemas.MeetThePersonOut)
def set_add_to_home(
    item_id: int,
    add_to_home: bool = Form(...),
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):
    person = (
        db.query(MeetThePerson)
        .filter(MeetThePerson.id == item_id)
        .first()
    )

    if not person:
        raise HTTPException(status_code=404, detail="Item not found")

    # update ONLY add_to_home
    person.add_to_home = add_to_home
    db.commit()
    db.refresh(person)

    return person


# newly added api for patch is_sponsored
@router.patch("/{item_id}/is_sponsored", response_model=schemas.MeetThePersonOut)
def set_is_sponsored(
    item_id: int,
    is_sponsored: bool = Form(...),   # <-- gets value from form
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):
    person = db.query(MeetThePerson).filter(MeetThePerson.id == item_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="News not found")

    # update only the is_sponsored field
    person.is_sponsored = is_sponsored
    db.commit()
    db.refresh(person)
    return person



# ------------------- DELETE -------------------
@router.delete("/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):

    deleted = crud.delete_meet_person(db, item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"detail": "Deleted successfully"}


# ------------------- PUBLIC GET -------------------
# @public_router.get("/", response_model=list[schemas.MeetThePersonOut])
# def get_all(db: Session = Depends(get_db)):
#     return crud.get_all_meet_person(db)

@public_router.get("/", response_model=list[schemas.MeetThePersonOut])
def get_all(db: Session = Depends(get_db)):
    persons = crud.get_all_meet_person(db)

    # Attach view_count unconditionally (admin can always see)
    view_counts = dict(
        db.query(
            MeetThePersonView.news_id,  # Assuming you have MeetThePersonView like NewsView
            func.count(MeetThePersonView.id)
        )
        .group_by(MeetThePersonView.news_id)
        .all()
    )

    for person in persons:
        person.view_count = view_counts.get(person.id, 0)

    return persons


@router.patch("/{person_id}/show_view_count", response_model=schemas.MeetThePersonOut)
def set_show_view_count_meet_person(
    person_id: int,
    show_view_count: bool = Form(...),
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)  # only admin can toggle
):
    person = db.query(MeetThePerson).filter(MeetThePerson.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    person.show_view_count = show_view_count
    db.commit()
    db.refresh(person)
    return person
    
@public_router.get("/limit", response_model=list[schemas.MeetThePersonOut])
def read_meet_person_limit(db: Session = Depends(get_db)):
    return crud.get_latest_meet_person(db)
    
# ========================
# Read_Meettheperson_Paginate
# ========================
@public_router.get("/paginate", response_model=schemas.PaginatedMeetThePerson)
def read_news_paginate(
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
):
    return crud.get_all_meet_person_paginate(db, page)

# ------------------- PUBLIC DETAIL (SEO + OG) -------------------
# @public_router.get("/api/{slug}", response_model=schemas.MeetThePersonOut)
# def read_meet_person_api(
#     slug: str,
#     db: Session = Depends(get_db)
# ):
#     person = db.query(MeetThePerson).filter(MeetThePerson.slug == slug).first()
#     if not person:
#         raise HTTPException(status_code=404, detail="Item not found")

#     return schemas.MeetThePersonOut.from_orm(person)

@public_router.get("/api/{slug}", response_model=schemas.MeetThePersonOut)
def read_meet_person_api(
    slug: str,
    request: Request,
    db: Session = Depends(get_db)
):
    person = db.query(MeetThePerson).filter(MeetThePerson.slug == slug).first()
    if not person:
        raise HTTPException(status_code=404, detail="Item not found")

    # Track view using the common track_view function
    visitor_ip = request.client.host
    crud.track_view(db, MeetThePersonView, person.id, visitor_ip)

    # Show view_count only if admin enabled it
    if person.show_view_count:
        person.view_count = db.query(func.count(MeetThePersonView.id)).filter(
            MeetThePersonView.news_id == person.id
        ).scalar()
    else:
        person.view_count = None

    return schemas.MeetThePersonOut.from_orm(person)


@public_router.get("/{slug}", response_model=None)
def read_meet_person_detail(
    request: Request,
    slug: str,
    db: Session = Depends(get_db)
):
    person = db.query(MeetThePerson).filter(MeetThePerson.slug == slug).first()
    if not person:
        raise HTTPException(status_code=404)

    user_agent = request.headers.get("user-agent", "").lower()
    is_bot = any(bot in user_agent for bot in BOT_KEYWORDS)

# change today 3/26

    # NORMAL USERS → React SPA


    # if not is_bot:
    #     raise HTTPException(status_code=404)


        # NORMAL USERS → Redirect to Frontend domain
    if not is_bot:
        return RedirectResponse(url=f"{FRONTEND_URL}/meet-person/{slug}", status_code=302)


    


#changed today 3/26

    # BOT → OG HTML
    # image_url = (
    #     person.image if person.image and person.image.startswith("http")
    #     else f"{BACKEND_URL}/{person.image}"
    #     if person.image
    #     else f"{BACKEND_URL}/static/brand/og-default.jpg"
    # )

    if person.image:
        if person.image.startswith("http"):
            image_url = person.image
        else:
            image_url = f"{BACKEND_URL}/{urllib.parse.quote(person.image)}"
    else:
        image_url = f"{BACKEND_URL}/static/brand/og-default.jpg"


    clean_text = re.sub(r"<[^>]+>", "", person.content or "")
    clean_text = re.sub(r"\s+", " ", clean_text).strip()
    description = clean_text[:200] + (" Read more on HMedia." if len(clean_text) < 40 else "")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{person.title}</title>

<meta name="description" content="{description}" />
<meta property="og:title" content="{person.title}" />
<meta property="og:description" content="{description}" />
<meta property="og:url" content="{FRONTEND_URL}/meet-person/{person.slug}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="HMedia" />
<meta property="og:image" content="{image_url}" />
<meta property="og:image:secure_url" content="{image_url}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
</head>
<body></body>
</html>
"""

    return HTMLResponse(html)



# @public_router.get("/{slug}", response_model=schemas.MeetThePersonOut)
# def get_one(slug: str, db: Session = Depends(get_db)):
#     item = crud.get_meet_person_by_id(db, slug)
#     if not item:
#         raise HTTPException(status_code=404, detail="Item not found")
#     return item
