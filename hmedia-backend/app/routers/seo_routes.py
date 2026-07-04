# from fastapi import APIRouter, Depends
# from fastapi.responses import HTMLResponse
# from sqlalchemy.orm import Session

# from app.database import get_db
# from app.models import News

# router = APIRouter()

# FRONTEND_URL = "http://channelhmedia.in"
# BACKEND_URL = "http://hmedia-api.channelhmedia.in"

# @router.get("/news/{slug}", response_class=HTMLResponse)
# def news_seo_page(slug: str, db: Session = Depends(get_db)):
#     news = db.query(News).filter(News.slug == slug).first()
#     if not news:
#         return HTMLResponse("Not found", status_code=404)

#     if news.image:
#         if news.image.startswith("http"):
#             image_url = news.image
#         else:
#             image_url = f"{BACKEND_URL}/static/more_news_images/{news.image.split('/')[-1]}"
#     else:
#         image_url = f"{BACKEND_URL}/static/brand/og-default.jpg"

#     description = news.content[:160].replace('"', "'")

#     html = f"""
# <!DOCTYPE html>
# <html lang="en">
# <head>
# <meta charset="UTF-8">

# <title>{news.title}</title>

# <!-- Open Graph -->
# <meta property="og:title" content="{news.title}" />
# <meta property="og:description" content="{description}" />
# <meta property="og:url" content="{FRONTEND_URL}/news/{news.slug}" />
# <meta property="og:type" content="article" />
# <meta property="og:site_name" content="HMedia" />

# <meta property="og:image" content="{image_url}" />
# <meta property="og:image:secure_url" content="{image_url}" />
# <meta property="og:image:type" content="image/jpeg" />
# <meta property="og:image:width" content="1200" />
# <meta property="og:image:height" content="630" />

# <!-- Twitter -->
# <meta name="twitter:card" content="summary_large_image" />
# <meta name="twitter:title" content="{news.title}" />
# <meta name="twitter:description" content="{description}" />
# <meta name="twitter:image" content="{image_url}" />

# </head>
# <body>
# <script>
#     window.location.replace("{FRONTEND_URL}/news/{news.slug}");
# </script>
# </body>
# </html>
# """
#     return HTMLResponse(html)


# from fastapi import APIRouter, Depends
# from fastapi.responses import HTMLResponse
# from sqlalchemy.orm import Session
# from html import escape

# from app.database import get_db
# from app.models import News

# router = APIRouter()

# # ---------------- DOMAIN CONFIG ----------------
# FRONTEND_URL = "http://channelhmedia.in"
# STATIC_BASE_URL = "http://hmedia-api.channelhmedia.in"

# # Default OG image (MUST EXIST & BE PUBLIC)
# DEFAULT_OG_IMAGE = f"{STATIC_BASE_URL}/static/brand/og-default.jpg"


# # --------------------------------------------------
# # NEWS LISTING PAGE SEO  → /news
# # --------------------------------------------------
# @router.get("/news", response_class=HTMLResponse)
# @router.get("/news/", response_class=HTMLResponse)
# def news_listing_seo():
#     html = f"""
# <!DOCTYPE html>
# <html lang="en">
# <head>
#     <meta charset="UTF-8" />

#     <title>Latest News | HMedia</title>

#     <!-- Open Graph -->
#     <meta property="og:title" content="Latest News | HMedia" />
#     <meta property="og:description" content="Read the latest breaking news, trending stories, and updates from HMedia." />
#     <meta property="og:image" content="{DEFAULT_OG_IMAGE}" />
#     <meta property="og:url" content="{FRONTEND_URL}/news/" />
#     <meta property="og:type" content="website" />
#     <meta property="og:site_name" content="HMedia" />

#     <!-- Twitter -->
#     <meta name="twitter:card" content="summary_large_image" />
#     <meta name="twitter:title" content="Latest News | HMedia" />
#     <meta name="twitter:description" content="Read the latest breaking news, trending stories, and updates from HMedia." />
#     <meta name="twitter:image" content="{DEFAULT_OG_IMAGE}" />

# </head>
# <body>
#     <script>
#         window.location.replace("{FRONTEND_URL}/news");
#     </script>
# </body>
# </html>
# """
#     return HTMLResponse(html)


# # --------------------------------------------------
# # SINGLE NEWS PAGE SEO → /news/{slug}
# # --------------------------------------------------
# @router.get("/news/{slug}", response_class=HTMLResponse)
# def news_seo_page(slug: str, db: Session = Depends(get_db)):
#     news = db.query(News).filter(News.slug == slug).first()
#     if not news:
#         return HTMLResponse("Not found", status_code=404)

#     # Escape for HTML safety (Malayalam-safe)
#     title = escape(news.title)
#     description = escape(news.content[:160])

#     # Absolute image URL (CRITICAL)
#     if news.image:
#         if news.image.startswith("http"):
#             image_url = news.image
#         else:
#             image_url = f"{STATIC_BASE_URL}/static/more_news_images/{news.image.split('/')[-1]}"
#     else:
#         image_url = DEFAULT_OG_IMAGE

#     page_url = f"{FRONTEND_URL}/news/{news.slug}"

#     html = f"""
# <!DOCTYPE html>
# <html lang="en">
# <head>
#     <meta charset="UTF-8" />

#     <title>{title}</title>

#     <!-- Open Graph -->
#     <meta property="og:title" content="{title}" />
#     <meta property="og:description" content="{description}" />
#     <meta property="og:image" content="{image_url}" />
#     <meta property="og:url" content="{page_url}" />
#     <meta property="og:type" content="article" />
#     <meta property="og:site_name" content="HMedia" />

#     <!-- Twitter -->
#     <meta name="twitter:card" content="summary_large_image" />
#     <meta name="twitter:title" content="{title}" />
#     <meta name="twitter:description" content="{description}" />
#     <meta name="twitter:image" content="{image_url}" />

# </head>
# <body>
#     <script>
#         window.location.replace("{page_url}");
#     </script>
# </body>
# </html>
# """
#     return HTMLResponse(html)
