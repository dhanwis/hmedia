from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from app import crud, schemas
from app.models import Trendingnews
from app.database import get_db
import urllib.parse
from fastapi.responses import HTMLResponse, RedirectResponse
import re
from fastapi.responses import HTMLResponse, RedirectResponse

router = APIRouter(prefix="/admin/trending-news", tags=["Trending News"])
public_router = APIRouter(prefix="/trending-news", tags=["Trending News"])

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

# ------------------- Admin DELETE -------------------
@router.delete("/{trending_id}")
def remove_trending_news(
    trending_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(lambda: "admin_auth placeholder")  # replace with your admin_auth
):
    deleted = crud.delete_trending_news(db, trending_id)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Trending news not found"
        )
    return {"detail": "Deleted successfully"}


# ------------------- Public GET All -------------------
@public_router.get("/", response_model=list[schemas.TrendingNewsOut])
def read_trending_news(db: Session = Depends(get_db)):
    return crud.get_all_trending_news(db)
    
@public_router.get("/limit", response_model=list[schemas.TrendingNewsOut])
def read_latest_trending_news(db: Session = Depends(get_db)):
    return crud.get_latest_trending_news(db)


@public_router.get("/api/{slug}", response_model=schemas.TrendingNewsOut)
def read_trending_news_api(slug: str, db: Session = Depends(get_db)):
    news = db.query(Trendingnews).filter(Trendingnews.slug == slug).first()
    if not news:
        raise HTTPException(status_code=404, detail="Item not found")
    return schemas.TrendingNewsOut.from_orm(news)

# ------------------- Public GET By Slug (OG HTML for social) -------------------
@public_router.get("/{slug}", response_model=None)
def get_trending_news_detail(
    request: Request,
    slug: str,
    db: Session = Depends(get_db)
):
    news = db.query(Trendingnews).filter(Trendingnews.slug == slug).first()
    if not news:
        raise HTTPException(status_code=404)

    user_agent = request.headers.get("user-agent", "").lower()
    is_bot = any(bot in user_agent for bot in BOT_KEYWORDS)

    #changed today 3/26

    # NORMAL USERS → React SPA fallback
    # if not is_bot:
    #     raise HTTPException(status_code=404)


    # NORMAL USERS → Redirect to Frontend domain
    if not is_bot:
        return RedirectResponse(url=f"{FRONTEND_URL}/trending-news/{slug}", status_code=302)
    

    # HEAD request (WhatsApp/Facebook prefetch)
    if request.method == "HEAD":
        return HTMLResponse(status_code=200)

    
    #changed today 3/26


    # BOT → OG HTML
    # image_url = (
    #     news.image if news.image and news.image.startswith("http")
    #     else f"{BACKEND_URL}/{news.image}" if news.image
    #     else f"{BACKEND_URL}/static/brand/og-default.jpg"
    # )

    if news.image:
        if news.image.startswith("http"):
            image_url = news.image
        else:
            image_url = f"{BACKEND_URL}/{urllib.parse.quote(news.image)}"
    else:
        image_url = f"{BACKEND_URL}/static/brand/og-default.jpg"

    
   


    raw_text = getattr(news, "content", "") or ""
    clean_text = re.sub(r"<[^>]+>", "", raw_text)
    clean_text = re.sub(r"\s+", " ", clean_text).strip()

    description = clean_text[:200]
    if len(description) < 40:
        description += " Read more on HMedia."

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{news.title}</title>

<meta name="description" content="{description}" />
<meta property="og:title" content="{news.title}" />
<meta property="og:description" content="{description}" />
<meta property="og:url" content="{FRONTEND_URL}/trending-news/{news.slug}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="HMedia" />

<meta property="og:image" content="{image_url}" />
<meta property="og:image:secure_url" content="{image_url}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />





<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{news.title}" />
<meta name="twitter:description" content="{description}" />
<meta name="twitter:image" content="{image_url}" />
</head>
<body></body>
</html>"""

    return HTMLResponse(html)



