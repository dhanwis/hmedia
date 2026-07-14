import os
import re
import html
import json
import urllib.parse
from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import News, CinemaNews, MeetThePerson, MoreNews

router = APIRouter()

# ---------------- CONFIGURATION ----------------
FRONTEND_URL = "https://channelhmedia.in"
STATIC_BASE_URL = "https://hmedia-api.channelhmedia.in"
DEFAULT_OG_IMAGE = f"{STATIC_BASE_URL}/static/brand/og-default.jpg"

# Paths
PRODUCTION_INDEX_HTML_PATH = "/home/hedone/public_html/channelhmedia.in/index.html"
DEV_INDEX_HTML_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "../../../hmedia-frontend/h-media/index.html"
    )
)

def strip_html_tags(text: str) -> str:
    """Helper to strip HTML tags and decode HTML entities."""
    if not text:
        return ""
    decoded = html.unescape(text)
    clean = re.compile('<.*?>')
    cleaned_text = re.sub(clean, '', decoded)
    cleaned_text = cleaned_text.replace('\xa0', ' ')
    return re.sub(r'\s+', ' ', cleaned_text).strip()

def get_article_by_category(db: Session, category: str, slug: str):
    """Helper to fetch article from the correct table based on route category."""
    category = category.lower().replace("-", "").replace("_", "")
    if category == "cinemanews":
        return db.query(CinemaNews).filter(CinemaNews.slug == slug).first()
    elif category == "meettheperson":
        return db.query(MeetThePerson).filter(MeetThePerson.slug == slug).first()
    elif category == "more":
        return db.query(MoreNews).filter(MoreNews.slug == slug).first()
    else:
        # Default category
        return db.query(News).filter(News.slug == slug).first()

@router.get("/{category}/{slug}", response_class=HTMLResponse)
def serve_seo_article(request: Request, category: str, slug: str, db: Session = Depends(get_db)):
    # 1. Fetch the news item
    article = get_article_by_category(db, category, slug)
    if not article:
        return HTMLResponse("Article not found", status_code=404)

    # 2. Extract values and sanitize
    clean_title = strip_html_tags(article.title).replace('"', "'")
    clean_description = strip_html_tags(article.content[:200]).replace('"', "'") + "..."
    clean_author = strip_html_tags(article.author).replace('"', "'") if article.author else "CHANNEL HMEDIA"
    
    # 3. Clean up JSON tags
    tags_list = []
    if article.tags:
        raw_tags = article.tags
        if isinstance(raw_tags, list) and len(raw_tags) == 1 and isinstance(raw_tags[0], str) and raw_tags[0].strip().startswith('['):
            try:
                raw_tags = json.loads(raw_tags[0])
            except Exception:
                raw_tags = raw_tags[0]

        if isinstance(raw_tags, list):
            tags_list = raw_tags
        elif isinstance(raw_tags, str):
            cleaned_tags_str = raw_tags.strip()
            if cleaned_tags_str.startswith('['):
                try:
                    tags_list = json.loads(cleaned_tags_str)
                except Exception:
                    tags_list = [raw_tags]
            else:
                tags_list = [t.strip() for t in cleaned_tags_str.split(',') if t.strip()]

    tags_list = [str(t) for t in tags_list if t]
    tags_str = ", ".join(tags_list)
    
    default_keywords = "malayalam cinema magazine, cinema portal, actors,actress, movies"
    final_keywords = f"{tags_str}, {default_keywords}" if tags_str else default_keywords

    # 4. Determine Image URL dynamically
    if article.image:
        if article.image.startswith("http"):
            image_url = article.image
        else:
            clean_path = article.image.lstrip('/')
            parts = clean_path.split('/')
            encoded_parts = [urllib.parse.quote(p) for p in parts]
            image_url = f"{STATIC_BASE_URL}/{'/'.join(encoded_parts)}"
    else:
        image_url = DEFAULT_OG_IMAGE

    article_url = f"{FRONTEND_URL}/{category}/{slug}"

    # 5. Determine which template to load (Local vs Production)
    if request.base_url.hostname and "localhost" in request.base_url.hostname:
        template_path = DEV_INDEX_HTML_PATH
    else:
        template_path = PRODUCTION_INDEX_HTML_PATH
    
    if not os.path.exists(template_path):
        return HTMLResponse(
            "Application templates are building. Please try again shortly.",
            status_code=503
        )

    with open(template_path, "r", encoding="utf-8") as f:
        html_content = f.read()

    # 6. Replace Default Tags
    old_title_block = """CHANNEL HMEDIA | Every Sector Has a Story. We Tell Them All |
      Cinema/Business/Life And More"""
    html_content = html_content.replace(old_title_block, clean_title)
    html_content = html_content.replace('<meta property="og:title" content="CHANNEL HMEDIA" />', f'<meta property="og:title" content="{clean_title}" />')

    old_desc = "Get the latest scoop on the film industry with HMEDIA. Your source for cinema news, celebrity interviews, official teasers, and promotional videos."
    html_content = html_content.replace(old_desc, clean_description)

    old_image = "https://channelhmedia.in/images/logo/hmedia-white.png"
    html_content = html_content.replace(old_image, image_url)

    old_url = "https://channelhmedia.in/"
    html_content = html_content.replace(old_url, article_url)

    old_keywords = "malayalam cinema magazine, cinema portal, actors,actress, movies"
    html_content = html_content.replace(old_keywords, final_keywords.replace('"', "'"))

    old_author = '<meta name="author" content="CHANNEL HMEDIA" />'
    html_content = html_content.replace(old_author, f'<meta name="author" content="{clean_author}" />')

    return HTMLResponse(content=html_content, status_code=200)
