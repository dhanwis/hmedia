import re
import os
import html
import urllib.parse

from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, File, Request,Query
from sqlalchemy import func
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.auth import admin_auth
from app import database, crud, schemas
from app.database import get_db
from app.models import CinemaNews,CinemaNewsView

router = APIRouter(prefix="/admin/cinema-news", tags=["Cinema News"])
public_router = APIRouter(prefix="/cinema-news", tags=["Cinema News"])

FRONTEND_URL = "https://channelhmedia.in"
BACKEND_URL = "https://hmedia-api.channelhmedia.in"

BOT_KEYWORDS = [
    "facebookexternalhit",
    "twitterbot",
    "whatsapp",
    "slackbot",
    "linkedinbot",
    "telegrambot"
]

# ------------------ ADMIN ROUTES ------------------

@router.post("/", response_model=schemas.CinemaNewsOut)
def add_cinema_news(
    title: str = Form(...),
    slug: str = Form(...),
    content: str = Form(...),
    author: str = Form(...),
    date: str = Form(...),
    trending: bool = Form(...),
    image: UploadFile = File(None),
    tags: list = Form(...),
    
    db: Session = Depends(database.get_db),
    _: str = Depends(admin_auth)
):
    image_path = None
    if image:
        os.makedirs("static/cinema_images", exist_ok=True)
        file_location = f"static/cinema_images/{image.filename}"
        with open(file_location, "wb+") as file_object:
            file_object.write(image.file.read())
        image_path = file_location

    news_obj = schemas.CinemaNewsCreate(
        title=title, slug=slug, content=content, author=author,
        image=image_path, date=date, trending=trending, tags=tags
    )
    return crud.create_cinema_news(db, news_obj)


@router.put("/{news_id}", response_model=schemas.CinemaNewsOut)
def edit_cinema_news(
    news_id: int,
    title: str = Form(...),
    slug: str = Form(...),
    content: str = Form(...),
    author: str = Form(...),
    date: str = Form(...),
    trending: bool = Form(...),
    image: UploadFile = File(None),
    tags: list = Form(...),
    
    db: Session = Depends(database.get_db),
    _: str = Depends(admin_auth)
):
    saved_path = None
    if image:
        os.makedirs("static/cinema_images", exist_ok=True)
        saved_path = f"static/cinema_images/{image.filename}"
        with open(saved_path, "wb") as f:
            f.write(image.file.read())

    news_obj = schemas.CinemaNewsCreate(
        title=title, slug=slug, author=author,
        date=date, image=saved_path, content=content,
        trending=trending, tags=tags
    )

    updated = crud.update_cinema_news(db, news_id, news=news_obj, new_image_path=saved_path)
    if not updated:
        raise HTTPException(status_code=404, detail="Cinema News not found")
    return updated


# newly added api for patch add_to_home
@router.patch("/{news_id}/add_to_home", response_model=schemas.CinemaNewsOut)
def set_add_to_home(
    news_id: int,
    add_to_home: bool = Form(...),   # <-- gets value from form
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):
    news = db.query(CinemaNews).filter(CinemaNews.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    # update only the add_to_home field
    news.add_to_home = add_to_home
    db.commit()
    db.refresh(news)
    return news


# newly added api for patch is_sponsored
@router.patch("/{news_id}/is_sponsored", response_model=schemas.CinemaNewsOut)
def set_is_sponsored(
    news_id: int,
    is_sponsored: bool = Form(...),   # <-- gets value from form
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):
    news = db.query(CinemaNews).filter(CinemaNews.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    # update only the is_sponsored field
    news.is_sponsored = is_sponsored
    db.commit()
    db.refresh(news)
    return news


@router.delete("/{news_id}")
def remove_cinema_news(
    news_id: int,
    db: Session = Depends(database.get_db),
    _: str = Depends(admin_auth)
):
    deleted = crud.delete_cinema_news(db, news_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Cinema News not found")
    return {"detail": "Deleted successfully"}


# ------------------ PUBLIC ROUTES ------------------

# @public_router.get("/", response_model=list[schemas.CinemaNewsOut])
# def read_cinema_news(db: Session = Depends(database.get_db)):
#     return crud.get_all_cinema_news(db)

@public_router.get("/", response_model=list[schemas.CinemaNewsOut])
def read_cinema_news(db: Session = Depends(database.get_db)):
    # Get all cinema news
    news_list = crud.get_all_cinema_news(db)

    # Get all view counts in one query
    view_counts = dict(
        db.query(
            CinemaNewsView.news_id,
            func.count(CinemaNewsView.id)
        )
        .group_by(CinemaNewsView.news_id)
        .all()
    )

    # Attach view_count unconditionally (admin can always see)
    for news_item in news_list:
        news_item.view_count = view_counts.get(news_item.id, 0)

    return news_list


@router.patch("/{news_id}/show_view_count", response_model=schemas.CinemaNewsOut)
def set_cinema_show_view_count(
    news_id: int,
    show_view_count: bool = Form(...),
    db: Session = Depends(database.get_db),
    _: str = Depends(admin_auth)
):
    news = db.query(CinemaNews).filter(CinemaNews.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="Cinema news not found")

    news.show_view_count = show_view_count
    db.commit()
    db.refresh(news)
    return news
    
@public_router.get("/limit", response_model=list[schemas.CinemaNewsOut])
def read_cinemanews_limit(db: Session = Depends(get_db)):
    return crud.get_latest_cinemanews(db)
    

# ========================
# Read_CinemaNews_Paginate
# ========================
@public_router.get("/paginate", response_model=schemas.PaginatedCinemaNews)
def read_news_paginate(
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
):
    return crud.get_all_cinemanews_paginate(db, page)
    



# @public_router.get("/api/{slug}", response_model=schemas.CinemaNewsOut)
# def read_cinema_news_api(
#     slug: str,
#     db: Session = Depends(get_db)
# ):
#     news = db.query(CinemaNews).filter(CinemaNews.slug == slug).first()
#     if not news:
#         raise HTTPException(status_code=404, detail="Item not found")
#     return schemas.CinemaNewsOut.from_orm(news)


@public_router.get("/api/{slug}", response_model=schemas.CinemaNewsOut)
def read_cinema_news_api(
    slug: str,
    request: Request,
    db: Session = Depends(database.get_db)
):
    news = db.query(CinemaNews).filter(CinemaNews.slug == slug).first()
    if not news:
        raise HTTPException(status_code=404, detail="Item not found")

    # Track view using generic function
    visitor_ip = request.client.host
    crud.track_view(db, CinemaNewsView, news.id, visitor_ip)

    # Show view_count only if admin enabled it
    if news.show_view_count:
        news.view_count = db.query(func.count(CinemaNewsView.id)).filter(
            CinemaNewsView.news_id == news.id
        ).scalar()
    else:
        news.view_count = None

    return schemas.CinemaNewsOut.from_orm(news)


# @public_router.api_route("/{slug}", methods=["GET", "HEAD"], response_model=None)
# def read_cinema_news_detail(
#     request: Request,
#     slug: str,
#     db: Session = Depends(get_db)
#     ):
#     news = db.query(CinemaNews).filter(CinemaNews.slug == slug).first()
#     if not news:
#         raise HTTPException(status_code=404)
        
#     user_agent = request.headers.get("user-agent", "").lower()
#     is_bot = any(bot in user_agent for bot in BOT_KEYWORDS)

# #changed today 3/26

#     # NORMAL USERS → React SPA fallback
#     # if not is_bot:
#     #     raise HTTPException(status_code=404)

#         # NORMAL USERS → Redirect to Frontend domain
#     if not is_bot:
#         return RedirectResponse(url=f"{FRONTEND_URL}/cinema-news/{slug}", status_code=302)



#     # HEAD request (WhatsApp/Facebook prefetch)
#     if request.method == "HEAD":
#         return HTMLResponse(status_code=200)

#     # FRONTEND-served image (WhatsApp-safe)
#     # if news.image:
#     #     filename = os.path.basename(news.image)
#     #     image_url = f"{FRONTEND_URL}/media/cinema_images/{filename}"
#     # else:
#     #     image_url = f"{FRONTEND_URL}/media/brand/og-default.jpg"

# # changed today 3/26

# #     image_url = (
# #     news.image if news.image and news.image.startswith("http")
# #     else f"{BACKEND_URL}/{news.image}" if news.image
# #     else f"{BACKEND_URL}/static/brand/og-default.jpg"
# # )

#     if news.image:
#         if news.image.startswith("http"):
#             image_url = news.image
#         else:
#             image_url = f"{BACKEND_URL}/{urllib.parse.quote(news.image)}"
#     else:
#         image_url = f"{BACKEND_URL}/static/brand/og-default.jpg"


#     raw_text = news.content or ""
#     clean_text = re.sub(r"<[^>]+>", "", raw_text)
#     clean_text = re.sub(r"\s+", " ", clean_text).strip()

#     description = clean_text[:200]
#     if len(description) < 40:
#         description += " Read more on HMedia."

#     title = html.escape(news.title)
#     description = html.escape(description)

#     html_content = f"""<!DOCTYPE html>
# <html lang="en">
# <head>
# <meta charset="UTF-8">
# <title>{title}</title>

# <meta name="description" content="{description}" />
# <link rel="canonical" href="{FRONTEND_URL}/cinema-news/{news.slug}" />

# <meta property="og:title" content="{title}" />
# <meta property="og:description" content="{description}" />
# <meta property="og:url" content="{FRONTEND_URL}/cinema-news/{news.slug}" />
# <meta property="og:type" content="article" />
# <meta property="og:site_name" content="HMedia" />

# <meta property="og:image" content="{image_url}" />
# <meta property="og:image:secure_url" content="{image_url}" />
# <meta property="og:image:width" content="1200" />
# <meta property="og:image:height" content="630" />

# <meta name="twitter:card" content="summary_large_image" />
# <meta name="twitter:title" content="{title}" />
# <meta name="twitter:description" content="{description}" />
# <meta name="twitter:image" content="{image_url}" />
# </head>
# <body></body>
# </html>"""

#     return HTMLResponse(html_content)

