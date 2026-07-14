
from fastapi.responses import HTMLResponse, RedirectResponse
import re
import urllib.parse
from fastapi import (
    APIRouter, Depends, HTTPException,
    Form, UploadFile, File, Request,Query
)
from sqlalchemy import func
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
import os

from app.auth import admin_auth
from app import database, crud, schemas
from app.database import get_db
from app.models import News,NewsView
# from app.utils.file_utils import process_quill_content # ethi eppoum live il venda

# -----------------------
# Routers
# -----------------------
router = APIRouter(prefix="/admin/news", tags=["News"])
public_router = APIRouter(prefix="/news", tags=["News"])

# changed today 3/26

# FRONTEND_URL = "http://channelhmedia.in"
# BACKEND_URL = "http://hmedia-api.channelhmedia.in"
FRONTEND_URL = "https://channelhmedia.in"
BACKEND_URL = "https://hmedia-api.channelhmedia.in"


# ⚠️ MUST BE LOWERCASE
BOT_KEYWORDS = [
    "facebookexternalhit",
    "twitterbot",
    "whatsapp",
    "slackbot",
    "linkedinbot",
    "telegrambot"
]

# =========================================================
# ADMIN ROUTES
# =========================================================

@router.post("/", response_model=schemas.NewsOut)
def add_news(
    title: str = Form(...),
    slug: str = Form(...),
    content: str = Form(...),
    author: str = Form(...),
    date: str = Form(...),
    trending: bool = Form(...),
    image: UploadFile = File(None),
    tags: list = Form(...),
    
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):
    image_path = None
    if image:
        os.makedirs("static/images", exist_ok=True)
        image_path = f"static/images/{image.filename}"
        with open(image_path, "wb+") as f:
            f.write(image.file.read())

    news_obj = schemas.NewsCreate(
        title=title,
        slug=slug,
        content=content,
        author=author,
        image=image_path,
        date=date,
        trending=trending,
        tags=tags,
        
    )
    return crud.create_news(db, news_obj)




# @router.post("/", response_model=schemas.NewsOut)
# def add_news(
#     title: str = Form(...),
#     slug: str = Form(...),
#     content: str = Form(...),
#     author: str = Form(...),
#     date: str = Form(...),
#     trending: bool = Form(...),
#     image: UploadFile = File(None),
#     tags: list = Form(...),
    
#     db: Session = Depends(get_db),
#     _: str = Depends(admin_auth)
# ):
#     # --------------------------
#     # 1️⃣ Handle main image (if any)
#     # --------------------------
#     image_path = None
#     if image:
#         os.makedirs("static/images", exist_ok=True)
#         image_path = f"static/images/{image.filename}"
#         with open(image_path, "wb+") as f:
#             f.write(image.file.read())

#     # --------------------------
#     # 2️⃣ Handle Quill content images
#     # --------------------------
#     cleaned_content = process_quill_content(
#         content_html=content,
#         upload_folder="static/images"
#     )

#     news_obj = schemas.NewsCreate(
#         title=title,
#         slug=slug,
#         content=cleaned_content,  # now without Base64 images
#         author=author,
#         image=image_path, 
#         date=date,
#         trending=trending,
#         tags=tags,
#     )
#     return crud.create_news(db, news_obj)



@router.put("/{news_id}", response_model=schemas.NewsOut)
def edit_news(
    news_id: int,
    title: str = Form(...),
    slug: str = Form(...),
    content: str = Form(...),
    author: str = Form(...),
    date: str = Form(...),
    trending:bool = Form(...),
    image: UploadFile = File(None),  # optional
    tags: list = Form(...),
    
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):

    image_path = None
    if image:
        os.makedirs("static/images", exist_ok=True)

        file_location = f"static/images/{image.filename}"
        with open(file_location, "wb+") as file_object:
            file_object.write(image.file.read())
        image_path = file_location

    news_obj = schemas.NewsCreate(
        title=title, slug=slug, content=content, author=author, 
        # added code 
        image=image_path, date=date, trending=trending, tags=tags
    )
    updated = crud.update_news(db, news_id, news_obj)
    if not updated:
        raise HTTPException(status_code=404, detail="News not found")
    return updated


# @router.put("/{news_id}", response_model=schemas.NewsOut)
# def edit_news(
#     news_id: int,
#     title: str = Form(...),
#     slug: str = Form(...),
#     content: str = Form(...),
#     author: str = Form(...),
#     date: str = Form(...),
#     trending:bool = Form(...),
#     image: UploadFile = File(None),
#     tags: list = Form(...),
    
#     db: Session = Depends(get_db),
#     _: str = Depends(admin_auth)
# ):
#     image_path = None
#     if image:
#         os.makedirs("static/images", exist_ok=True)
#         file_location = f"static/images/{image.filename}"
#         with open(file_location, "wb+") as file_object:
#             file_object.write(image.file.read())
#         image_path = file_location

#     # --------------------------
#     # Process Quill content images
#     # --------------------------
#     cleaned_content = process_quill_content(
#         content_html=content,
#         upload_folder="static/images"
#     )

#     news_obj = schemas.NewsCreate(
#         title=title, 
#         slug=slug, 
#         content=cleaned_content,  # store processed content
#         author=author, 
#         image=image_path, 
#         date=date, 
#         trending=trending, 
#         tags=tags
#     )
#     updated = crud.update_news(db, news_id, news_obj)
#     if not updated:
#         raise HTTPException(status_code=404, detail="News not found")
#     return updated


# newly added api for patch add_to_home
@router.patch("/{news_id}/add_to_home", response_model=schemas.NewsOut)
def set_add_to_home(
    news_id: int,
    add_to_home: bool = Form(...),   # <-- gets value from form
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    # update only the add_to_home field
    news.add_to_home = add_to_home
    db.commit()
    db.refresh(news)
    return news


# newly added api for patch is_sponsored
@router.patch("/{news_id}/is_sponsored", response_model=schemas.NewsOut)
def set_is_sponsored(
    news_id: int,
    is_sponsored: bool = Form(...),   # <-- gets value from form
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    # update only the is_sponsored field
    news.is_sponsored = is_sponsored
    db.commit()
    db.refresh(news)
    return news


@router.delete("/{news_id}")
def remove_news(
    news_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):

    deleted = crud.delete_news(db, news_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="News not found")
    return {"detail": "Deleted successfully"}

# =========================================================
# PUBLIC ROUTES
# =========================================================

# @public_router.get("/", response_model=list[schemas.NewsOut])
# def read_news(db: Session = Depends(get_db)):
#     return crud.get_all_news(db)


# @public_router.get("/", response_model=list[schemas.NewsOut])
# def read_news(db: Session = Depends(get_db)):

#     # 1️⃣ Get all news
#     news_list = crud.get_all_news(db)

#     # 2️⃣ Get all view counts in ONE query (performance safe)
#     view_counts = dict(
#         db.query(
#             NewsView.news_id,
#             func.count(NewsView.id)
#         )
#         .group_by(NewsView.news_id)
#         .all()
#     )

#     # 3️⃣ Attach view_count to each news object
#     for news_item in news_list:
#         if news_item.show_view_count:
#             news_item.view_count = view_counts.get(news_item.id, 0)
#         else:
#             news_item.view_count = None

#     return news_list


@public_router.get("/", response_model=list[schemas.NewsOut])
def read_news(db: Session = Depends(get_db)):
    # Get all news
    news_list = crud.get_all_news(db)

    # Get all view counts in one query
    view_counts = dict(
        db.query(
            NewsView.news_id,
            func.count(NewsView.id)
        )
        .group_by(NewsView.news_id)
        .all()
    )

    # Attach view_count unconditionally (admin can always see)
    for news_item in news_list:
        news_item.view_count = view_counts.get(news_item.id, 0)

    return news_list





# newly added api for patch show_view_count
@router.patch("/{news_id}/show_view_count", response_model=schemas.NewsOut)
def set_show_view_count(
    news_id: int,
    show_view_count: bool = Form(...),   # gets value from form
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    # update only the show_view_count field
    news.show_view_count = show_view_count
    db.commit()
    db.refresh(news)
    return news
    
    
# ========================
# Read_News_Limit
# ========================
@public_router.get("/limit", response_model=list[schemas.NewsOut])
def read_news_limit(db: Session = Depends(get_db)):
    return crud.get_latest_news(db)
    
    
# ========================
# Read_News_Paginate
# ========================
@public_router.get("/paginate", response_model=schemas.PaginatedNews)
def read_news_paginate(
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
):
    return crud.get_all_news_paginate(db, page)
    

# ------------------- PUBLIC DETAIL (SEO + OG) -------------------
# ========================
# PUBLIC API
# ========================

# @public_router.get("/api/{slug}", response_model=schemas.NewsOut)
# def read_news_api(slug: str, db: Session = Depends(get_db)):
#     news = db.query(News).filter(News.slug == slug).first()
#     if not news:
#         raise HTTPException(status_code=404, detail="Item not found")
#     return schemas.NewsOut.from_orm(news)


# @public_router.get("/api/{slug}", response_model=schemas.NewsOut)
# def read_news_api(
#     slug: str, 
#     request: Request,  # we need the visitor IP for view count
#     db: Session = Depends(get_db)
# ):
#     # Fetch the article
#     news = db.query(News).filter(News.slug == slug).first()
#     if not news:
#         raise HTTPException(status_code=404, detail="Item not found")

#     # ----------------------------
#     # Track the view count
#     # ----------------------------
#     visitor_ip = request.client.host
#     crud.track_view(db, NewsView, news.id, visitor_ip)

#     # ----------------------------
#     # Return JSON data
#     # ----------------------------
#     return schemas.NewsOut.from_orm(news)


@public_router.get("/api/{slug}", response_model=schemas.NewsOut)
def read_news_api(
    slug: str, 
    request: Request,
    db: Session = Depends(get_db)
):
    # Fetch the news
    news = db.query(News).filter(News.slug == slug).first()
    if not news:
        raise HTTPException(status_code=404, detail="Item not found")

    # Track view: increment only if new visitor
    visitor_ip = request.client.host
    crud.track_view(db, NewsView, news.id, visitor_ip)

    # Show view_count only if admin enabled it
    if news.show_view_count:
        news.view_count = db.query(func.count(NewsView.id)).filter(
            NewsView.news_id == news.id
        ).scalar()
    else:
        news.view_count = None

    return schemas.NewsOut.from_orm(news)



#========================
#PUBLIC SEO + SPA FALLBACK
#========================

# @public_router.get("/{slug}", response_model=None)
# def read_news_detail(
#     request: Request,
#     slug: str,
#     db: Session = Depends(get_db)
# ):
#     news = db.query(News).filter(News.slug == slug).first()
#     if not news:
#         raise HTTPException(status_code=404)
    
# #changed here 3/26
#     # ADD THIS USER-AGENT BOT CHECK:
#     user_agent = request.headers.get("user-agent", "").lower()
#     is_bot = any(bot in user_agent for bot in BOT_KEYWORDS)
#     # NORMAL HUMAN USERS → Redirect to Frontend domain
#     if not is_bot:
#         return RedirectResponse(url=f"{FRONTEND_URL}/news/{slug}", status_code=302)
#     # HEAD request (WhatsApp/Facebook prefetch)
#     if request.method == "HEAD":
#         return HTMLResponse(status_code=200)
    


# #changed here 3/26

#     # image_url = (
#     #     news.image if news.image and news.image.startswith("https://")
#     #     else f"{BACKEND_URL}/{news.image}" if news.image
#     #     else f"{BACKEND_URL}/static/brand/og-default.jpg"
#     # )

#     if news.image:
#         if news.image.startswith("http"):
#             image_url = news.image
#         else:
#             image_url = f"{BACKEND_URL}/{urllib.parse.quote(news.image)}"
#     else:
#         image_url = f"{BACKEND_URL}/static/brand/og-default.jpg"


#     clean_text = re.sub(r"<[^>]+>", "", news.content or "")
#     clean_text = re.sub(r"\s+", " ", clean_text).strip()
#     description = clean_text[:200]

#     html = f"""<!DOCTYPE html>
# <html lang="en">
# <head>
# <meta charset="UTF-8">
# <title>{news.title}</title>

# <meta name="description" content="{description}" />
# <meta property="og:title" content="{news.title}" />
# <meta property="og:description" content="{description}" />
# <meta property="og:url" content="{FRONTEND_URL}/news/{news.slug}" />
# <meta property="og:type" content="article" />
# <meta property="og:site_name" content="HMedia" />

# <meta property="og:image" content="{image_url}" />
# <meta property="og:image:secure_url" content="{image_url}" />
# <meta property="og:image:width" content="1200" />
# <meta property="og:image:height" content="630" />

# <meta name="twitter:card" content="summary_large_image" />
# <meta name="twitter:title" content="{news.title}" />
# <meta name="twitter:description" content="{description}" />
# <meta name="twitter:image" content="{image_url}" />
# </head>
# <body>
# <div id="root"></div>
# <script src="/static/js/main.js"></script>
# </body>
# </html>
# """

#     return HTMLResponse(html)






# @public_router.get("/{slug}", response_model=None)
# def read_news_detail(
#     request: Request,
#     slug: str,
#     db: Session = Depends(get_db)
# ):
#     news = db.query(News).filter(News.slug == slug).first()
#     if not news:
#         raise HTTPException(status_code=404)

#     BACKEND_URL = "https://hmedia-api.channelhmedia.in"
#     FRONTEND_URL = "https://channelhmedia.in"

#     DEFAULT_OG_IMAGE = f"{BACKEND_URL}/static/brand/og-default.jpg"

#     # Final safe image selection
#     if news.image:
#         image_url = (
#             news.image
#             if news.image.startswith("https://")
#             else f"{BACKEND_URL}/{news.image.lstrip('/')}"
#         )
#     else:
#         image_url = DEFAULT_OG_IMAGE

#     # Clean description
#     clean_text = re.sub(r"<[^>]+>", "", news.content or "")
#     clean_text = re.sub(r"\s+", " ", clean_text).strip()
#     description = clean_text[:200]

#     html = f"""<!DOCTYPE html>
# <html lang="en">
# <head>
# <meta charset="UTF-8" />

# <title>{news.title}</title>

# <meta name="description" content="{description}" />

# <meta property="og:type" content="article" />
# <meta property="og:site_name" content="HMedia" />
# <meta property="og:title" content="{news.title}" />
# <meta property="og:description" content="{description}" />
# <meta property="og:url" content="{FRONTEND_URL}/news/{news.slug}" />

# <meta property="og:image" content="{image_url}" />
# <meta property="og:image:secure_url" content="{image_url}" />
# <meta property="og:image:type" content="image/jpeg" />

# <meta name="twitter:card" content="summary_large_image" />
# <meta name="twitter:title" content="{news.title}" />
# <meta name="twitter:description" content="{description}" />
# <meta name="twitter:image" content="{image_url}" />

# </head>
# <body>
# <div id="root"></div>
# <script src="/static/js/main.js" defer></script>
# </body>
# </html>
# """

# return HTMLResponse(content=html, status_code=200)