from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, File, Request,Query
from sqlalchemy import func
from fastapi.responses import HTMLResponse
from app.auth import admin_auth
from sqlalchemy.orm import Session
from app import crud, schemas
from app.models import MoreNews,MoreNewsView
from app.database import get_db
import os
import re
import urllib.parse
from fastapi.responses import HTMLResponse, RedirectResponse



# Public routes
public_router = APIRouter(prefix="/more-news", tags=["More News"])
router = APIRouter(prefix="/admin/more-news", tags=["More News"])

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

# Add More News
@router.post("/", response_model=schemas.MoreNewsOut)
def add_more_news(
    title: str = Form(...),
    slug: str = Form(...),
    content: str = Form(...),
    author: str = Form(...),
    date: str = Form(...),
    trending:bool = Form(...),
    image: UploadFile = File(None),
    tags: list = Form(...),
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):

    image_path = None
    if image:
        os.makedirs("static/more_news_images", exist_ok=True)
        file_location = f"static/more_news_images/{image.filename}"
        with open(file_location, "wb+") as file_object:
            file_object.write(image.file.read())
        image_path = file_location

    obj = schemas.MoreNewsCreate(
        title=title, slug=slug, content=content, author=author, 
        image=image_path, date=date, trending=trending, tags=tags
    )
    return crud.create_more_news(db, obj)

# Update More News
@router.put("/{item_id}", response_model=schemas.MoreNewsOut)
def update_more_news(
    item_id: int,
    title: str = Form(...),
    slug: str = Form(...),
    content: str = Form(...),
    author: str = Form(...),
    date: str = Form(...),
    trending:bool = Form(...),
    image: UploadFile = File(None),
    tags: list = Form(...),
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):

    image_path = None

    # Save NEW image only if provided
    if image:
        os.makedirs("static/more_news_images", exist_ok=True)
        file_location = f"static/more_news_images/{image.filename}"
        with open(file_location, "wb+") as f:
            f.write(image.file.read())
        image_path = file_location

    news_obj = schemas.MoreNewsCreate(
        title=title, slug=slug, content=content,
        author=author, date=date, image=image_path,  # Can be None (means no change)
        trending=trending, tags=tags
    )

    updated = crud.update_more_news(db, item_id, news_obj)
    if not updated:
        raise HTTPException(status_code=404, detail="More News not found")
    return updated

# ------------------- PATCH add_to_home ONLY -------------------
@router.patch("/{item_id}/add_to_home", response_model=schemas.MoreNewsOut)
def set_add_to_home(
    item_id: int,
    add_to_home: bool = Form(...),   # gets value from form (checkbox)
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):
    news = db.query(MoreNews).filter(MoreNews.id == item_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="More News not found")

    # update ONLY the add_to_home field
    news.add_to_home = add_to_home
    db.commit()
    db.refresh(news)

    return news


# newly added api for patch is_sponsored
@router.patch("/{item_id}/is_sponsored", response_model=schemas.MoreNewsOut)
def set_is_sponsored(
    item_id: int,
    is_sponsored: bool = Form(...),   # <-- gets value from form
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):
    news = db.query(MoreNews).filter(MoreNews.id == item_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    # update only the is_sponsored field
    news.is_sponsored = is_sponsored
    db.commit()
    db.refresh(news)
    return news



# Delete More News
@router.delete("/{item_id}")
def delete_more_news(
    item_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)
):

    deleted = crud.delete_more_news(db, item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="More News not found")
    return {"detail": "Deleted successfully"}

# @public_router.get("/", response_model=list[schemas.MoreNewsOut])
# def get_all(db: Session = Depends(get_db)):
#     return crud.get_all_more_news(db)

@public_router.get("/", response_model=list[schemas.MoreNewsOut])
def get_all(db: Session = Depends(get_db)):
    news_list = crud.get_all_more_news(db)

    # Attach view_count unconditionally (admin can always see)
    view_counts = dict(
        db.query(
            MoreNewsView.news_id,  # Assuming you have MoreNewsView model
            func.count(MoreNewsView.id)
        )
        .group_by(MoreNewsView.news_id)
        .all()
    )

    for news_item in news_list:
        news_item.view_count = view_counts.get(news_item.id, 0)

    return news_list

@router.patch("/{news_id}/show_view_count", response_model=schemas.MoreNewsOut)
def set_show_view_count_more_news(
    news_id: int,
    show_view_count: bool = Form(...),
    db: Session = Depends(get_db),
    _: str = Depends(admin_auth)  # only admin can toggle
):
    news = db.query(MoreNews).filter(MoreNews.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="More News not found")

    news.show_view_count = show_view_count
    db.commit()
    db.refresh(news)
    return news
    
@public_router.get("/limit", response_model=list[schemas.MoreNewsOut])
def get_morenews_limit(db: Session = Depends(get_db)):
    return crud.get_latest_more_news(db)
    
# ========================
# Read_MoreNews_Paginate
# ========================
@public_router.get("/paginate", response_model=schemas.PaginatedMoreNews)
def read_news_paginate(
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
):
    return crud.get_more_news_paginate(db, page)

# @public_router.get("/api/{slug}", response_model=schemas.MoreNewsOut)
# def get_more_news_api(slug: str, db: Session = Depends(get_db)):
#     """
#     JSON API for React fetch calls
#     URL: /api/more-news/{slug}
#     """
#     news = db.query(MoreNews).filter(MoreNews.slug == slug).first()
#     if not news:
#         raise HTTPException(status_code=404, detail="More News not found")

#     return schemas.MoreNewsOut.from_orm(news)


@public_router.get("/api/{slug}", response_model=schemas.MoreNewsOut)
def get_more_news_api(slug: str, request: Request, db: Session = Depends(get_db)):
   
    news = db.query(MoreNews).filter(MoreNews.slug == slug).first()
    if not news:
        raise HTTPException(status_code=404, detail="More News not found")

    # Track view using common track_view function
    visitor_ip = request.client.host
    crud.track_view(db, MoreNewsView, news.id, visitor_ip)

    # Show view_count only if admin enabled it
    if news.show_view_count:
        news.view_count = db.query(func.count(MoreNewsView.id)).filter(
            MoreNewsView.news_id == news.id
        ).scalar()
    else:
        news.view_count = None

    return schemas.MoreNewsOut.from_orm(news)

# @public_router.get("/{slug}", response_model=None)
# def get_more_news_seo(request: Request, slug: str, db: Session = Depends(get_db)):
#     """
#     SEO route:
#     - Bots → OG HTML
#     - Users → let React handle (404 here on purpose)
#     """
# 
#     news = db.query(MoreNews).filter(MoreNews.slug == slug).first()
#     if not news:
#         raise HTTPException(status_code=404)
# 
#     user_agent = request.headers.get("user-agent", "").lower()
#     is_bot = any(bot in user_agent for bot in BOT_KEYWORDS)
# 
# # changed today 3/26
# 
#     # 🧑 NORMAL USERS → DO NOTHING (React SPA will load)     
#     # if not is_bot:
#     #     raise HTTPException(status_code=404)
# 
#     # NORMAL USERS → Redirect to Frontend domain
#     if not is_bot:
#         return RedirectResponse(url=f"{FRONTEND_URL}/more-news/{slug}", status_code=302)
# 
# 
# # changed today 3/26
#     # -----------------------------
#     # BOT → OG META HTML
#     # -----------------------------
#     # if news.image:
#     #     image_url = news.image if news.image.startswith("http") else f"{BACKEND_URL}/{news.image}"
#     # else:
#     #     image_url = f"{BACKEND_URL}/static/brand/og-default.jpg"
# 
#     if news.image:
#         if news.image.startswith("http"):
#             image_url = news.image
#         else:
#             image_url = f"{BACKEND_URL}/{urllib.parse.quote(news.image)}"
#     else:
#         image_url = f"{BACKEND_URL}/static/brand/og-default.jpg"
# 
# 
#     raw_text = news.content or ""
#     clean_text = re.sub(r"<[^>]+>", "", raw_text)
#     clean_text = re.sub(r"\s+", " ", clean_text).strip()
#     description = clean_text[:200]
#     if len(description) < 40:
#         description += " Read more on HMedia."
# 
#     html = f"""<!DOCTYPE html>
# <html lang="en">
# <head>
# <meta charset="UTF-8">
# <title>{news.title}</title>
# 
# <meta name="description" content="{description}" />
# 
# <meta property="og:title" content="{news.title}" />
# <meta property="og:description" content="{description}" />
# <meta property="og:url" content="{FRONTEND_URL}/more-news/{news.slug}" />
# <meta property="og:type" content="article" />
# <meta property="og:site_name" content="HMedia" />
# 
# <meta property="og:image" content="{image_url}" />
# <meta property="og:image:secure_url" content="{image_url}" />
# <meta property="og:image:width" content="1200" />
# <meta property="og:image:height" content="630" />
# 
# <meta name="twitter:card" content="summary_large_image" />
# <meta name="twitter:title" content="{news.title}" />
# <meta name="twitter:description" content="{description}" />
# <meta name="twitter:image" content="{image_url}" />
# </head>
# <body></body>
# </html>
# """
# 
#     return HTMLResponse(
#         html,
#         headers={
#             "Cache-Control": "no-store, no-cache, must-revalidate",
#             "Pragma": "no-cache",
#             "Expires": "0"
#         }
#     )


# @public_router.get("/{slug}", response_model=None)
# def get_more_news_detail(request: Request, slug: str, db: Session = Depends(get_db)):
#     news = db.query(MoreNews).filter(MoreNews.slug == slug).first()
#     if not news:
#         raise HTTPException(status_code=404, detail="More News not found")

#     user_agent = request.headers.get("user-agent", "").lower()
#     is_bot = any(bot in user_agent for bot in BOT_KEYWORDS)

#     # Image URL fix
#     if news.image:
#         if news.image.startswith("http"):
#             image_url = news.image
#         else:
#             image_url = f"{BACKEND_URL}/{news.image}"
#     else:
#         image_url = f"{BACKEND_URL}/static/brand/og-default.jpg"

#     # Clean content for description
#     raw_text = news.content or ""
#     clean_text = re.sub(r"<[^>]+>", "", raw_text)
#     clean_text = re.sub(r"\s+", " ", clean_text).strip()
#     description = clean_text[:200]
#     if len(description) < 40:
#         description += " Read more on HMedia."

#     # BOT → OG HTML
#     if is_bot:
#         html = f"""<!DOCTYPE html>
# <html lang="en">
# <head>
# <meta charset="UTF-8">
# <title>{news.title}</title>

# <meta name="description" content="{description}" />
# <meta property="og:title" content="{news.title}" />
# <meta property="og:description" content="{description}" />
# <meta property="og:url" content="{FRONTEND_URL}/more-news/{news.slug}" />
# <meta property="og:type" content="article" />
# <meta property="og:site_name" content="HMedia" />

# <meta property="og:image" content="{image_url}" />
# <meta property="og:image:secure_url" content="{image_url}" />
# <meta property="og:image:type" content="image/jpeg" />
# <meta property="og:image:width" content="1200" />
# <meta property="og:image:height" content="630" />

# <meta name="twitter:card" content="summary_large_image" />
# <meta name="twitter:title" content="{news.title}" />
# <meta name="twitter:description" content="{description}" />
# <meta name="twitter:image" content="{image_url}" />
# </head>
# <body>
# <script>
# window.location.replace("{FRONTEND_URL}/more-news/{news.slug}");
# </script>
# </body>
# </html>"""
#         return HTMLResponse(html)

#     # NORMAL USER → JSON
#     return schemas.MoreNewsOut.from_orm(news)



