import os
import re
import html
import json
import urllib.parse
from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import News, CinemaNews, MeetThePerson, MoreNews

router = APIRouter()

# ---------------- CONFIGURATION ----------------
FRONTEND_URL = "https://channelhmedia.in"
STATIC_BASE_URL = "https://hmedia-api.channelhmedia.in"
DEFAULT_OG_IMAGE = f"{STATIC_BASE_URL}/static/brand/og-default.jpg"

# Path to the compiled Vite production index.html template (on cPanel)
INDEX_HTML_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "../../../hmedia-frontend/h-media/dist/index.html"
    )
)
# Fallback local/dev path in case it is served directly from source
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
    
    # Decode HTML entities (loop up to 5 times in case of double-escaping)
    decoded = text
    for _ in range(5):
        last_text = decoded
        decoded = html.unescape(decoded)
        if decoded == last_text:
            break
            
    # Strip HTML tags
    clean = re.compile('<.*?>')
    cleaned_text = re.sub(clean, '', decoded)
    # Replace non-breaking spaces and common HTML space entities
    cleaned_text = cleaned_text.replace('\xa0', ' ')
    cleaned_text = cleaned_text.replace('&nbsp;', ' ')
    # Clean up excess whitespace
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

@router.get("/news/{slug}", response_class=HTMLResponse)
@router.get("/cinema-news/{slug}", response_class=HTMLResponse)
@router.get("/cinemanews/{slug}", response_class=HTMLResponse)
@router.get("/meet-the-person/{slug}", response_class=HTMLResponse)
@router.get("/meettheperson/{slug}", response_class=HTMLResponse)
@router.get("/more/{slug}", response_class=HTMLResponse)
def serve_seo_article(request: Request, slug: str, db: Session = Depends(get_db)):
    try:
        # Automatically detect the category from the URL path (e.g., "news" or "cinema-news")
        path_parts = request.url.path.strip("/").split("/")
        category = path_parts[0] if path_parts else "news"

        # 0. Check if a human browser is accessing the API subdomain directly
        host = request.headers.get("host", "")
        user_agent = request.headers.get("user-agent", "").lower()
        
        # Check if request was forwarded by Apache proxy
        is_proxied = request.query_params.get("proxied") == "true"
        
        # List of bot/crawler keywords
        is_bot = any(bot in user_agent for bot in ["facebookexternalhit", "twitterbot", "whatsapp", "slackbot", "linkedinbot", "telegrambot", "googlebot", "bingbot"])

        # If it is a human user visiting the API subdomain directly (not proxied):
        if "hmedia-api" in host and not is_proxied and not is_bot:
            return RedirectResponse(url=f"{FRONTEND_URL}/{category}/{slug}", status_code=302)

        # 1. Fetch the news item
        article = get_article_by_category(db, category, slug)
        if not article:
            return HTMLResponse("Article not found", status_code=404)

        # 2. Extract values and sanitize safely (protecting against Null/None values in database)
        title_text = article.title if article.title else ""
        content_text = article.content if article.content else ""
        author_text = article.author if article.author else "CHANNEL HMEDIA"

        clean_title = strip_html_tags(title_text).replace('"', "'")
        # Strip tags first from a larger block of text, then slice to 200 characters to prevent cut-off tags
        clean_description = strip_html_tags(content_text[:5000])[:200].replace('"', "'") + "..."
        clean_author = strip_html_tags(author_text).replace('"', "'")
        
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

        # 4. Determine Image URL dynamically preserving the database folder path
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

        # 5. Load the template index.html from your production server
        template_path = "/home/hedone/public_html/channelhmedia.in/index.html"
        
        if not os.path.exists(template_path):
            return HTMLResponse(
                "Application templates are building. Please try again shortly.",
                status_code=503
            )

        with open(template_path, "r", encoding="utf-8") as f:
            html_content = f.read()

        # 6. Replace Default Tags with Dynamic News Details using robust regex
        
        # Replace <title>...</title>
        title_pattern = r'<title\b[^>]*>(.*?)</title>'
        if re.search(title_pattern, html_content, flags=re.IGNORECASE | re.DOTALL):
            html_content = re.sub(
                title_pattern, 
                lambda m: f"<title>{clean_title}</title>", 
                html_content, 
                flags=re.IGNORECASE | re.DOTALL
            )
        else:
            html_content = re.sub(
                r'(<head\b[^>]*>)', 
                lambda m: f"{m.group(1)}\n    <title>{clean_title}</title>", 
                html_content, 
                flags=re.IGNORECASE
            )

        # Helper function for robust replacement/injection of meta tags
        def replace_meta_content(html_str: str, attr_name: str, attr_val: str, new_content: str) -> str:
            pattern = rf'<meta\b[^>]*\b{attr_name}=["\']{re.escape(attr_val)}["\'][^>]*>'
            
            def replacer(match):
                meta_tag = match.group(0)
                content_pattern = r'(\bcontent=["\'])(.*?)(["\'])'
                if re.search(content_pattern, meta_tag, re.IGNORECASE):
                    return re.sub(
                        content_pattern, 
                        lambda m: f"{m.group(1)}{new_content}{m.group(3)}", 
                        meta_tag, 
                        flags=re.IGNORECASE
                    )
                else:
                    if meta_tag.endswith('/>'):
                        return meta_tag[:-2].strip() + f' content="{new_content}" />'
                    elif meta_tag.endswith('>'):
                        return meta_tag[:-1].strip() + f' content="{new_content}">'
                    return meta_tag

            if not re.search(pattern, html_str, re.IGNORECASE | re.DOTALL):
                new_tag = f'<meta {attr_name}="{attr_val}" content="{new_content}" />'
                return re.sub(
                    r'(<head\b[^>]*>)', 
                    lambda m: f"{m.group(1)}\n    {new_tag}", 
                    html_str, 
                    flags=re.IGNORECASE
                )
                
            return re.sub(pattern, replacer, html_str, flags=re.IGNORECASE | re.DOTALL)

        # Perform the replacements/injections
        html_content = replace_meta_content(html_content, "name", "description", clean_description)
        html_content = replace_meta_content(html_content, "property", "og:title", clean_title)
        html_content = replace_meta_content(html_content, "property", "og:description", clean_description)
        html_content = replace_meta_content(html_content, "property", "og:image", image_url)
        html_content = replace_meta_content(html_content, "property", "og:url", article_url)
        html_content = replace_meta_content(html_content, "name", "keywords", final_keywords)
        html_content = replace_meta_content(html_content, "name", "author", clean_author)
        
        # Also inject Twitter card meta tags for richer social previews
        html_content = replace_meta_content(html_content, "name", "twitter:card", "summary_large_image")
        html_content = replace_meta_content(html_content, "name", "twitter:title", clean_title)
        html_content = replace_meta_content(html_content, "name", "twitter:description", clean_description)
        html_content = replace_meta_content(html_content, "name", "twitter:image", image_url)

        # Helper function to replace/inject canonical tag
        def replace_or_inject_canonical(html_str: str, canonical_url: str) -> str:
            pattern = r'<link\b[^>]*\brel=["\']canonical["\'][^>]*>'
            if re.search(pattern, html_str, re.IGNORECASE):
                def replacer(match):
                    tag = match.group(0)
                    href_pattern = r'(\bhref=["\'])(.*?)(["\'])'
                    if re.search(href_pattern, tag, re.IGNORECASE):
                        return re.sub(href_pattern, lambda m: f'{m.group(1)}{canonical_url}{m.group(3)}', tag, flags=re.IGNORECASE)
                    return tag.rstrip(' />') + f' href="{canonical_url}" />'
                return re.sub(pattern, replacer, html_str, flags=re.IGNORECASE | re.DOTALL)
            else:
                new_tag = f'<link rel="canonical" href="{canonical_url}" />'
                return re.sub(r'(<head\b[^>]*>)', lambda m: f'{m.group(1)}\n    {new_tag}', html_str, flags=re.IGNORECASE)

        html_content = replace_or_inject_canonical(html_content, article_url)

        return HTMLResponse(content=html_content, status_code=200)

    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        return HTMLResponse(
            f"<h3>Backend Error (500) Traceback:</h3><pre>{error_msg}</pre>", 
            status_code=500
        )

# --- Fallback Redirects for SPA assets when accessed on the API subdomain ---
@router.get("/assets/{path_name:path}")
def redirect_assets(path_name: str):
    return RedirectResponse(url=f"{FRONTEND_URL}/assets/{path_name}")

@router.get("/favicon.ico")
def redirect_favicon():
    return RedirectResponse(url=f"{FRONTEND_URL}/favicon.ico")

@router.get("/images/{path_name:path}")
def redirect_images(path_name: str):
    return RedirectResponse(url=f"{FRONTEND_URL}/images/{path_name}")


