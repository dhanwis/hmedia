from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import (news, admin,banner,cinema_news,
                         cinema_news, meet_the_person, more_news,
                         flashnews, teaser_and_promo, square_ad,
                         banner_ad, bottom_banner_ad,trending_news,
                         full_screen_ad, pop_up_ad, seo_routes )


# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="News Website Backend")
from fastapi.staticfiles import StaticFiles

app.mount("/static", StaticFiles(directory="static"), name="static")

origins = ["http://localhost:3000","https://channelhmedia.in",
           "http://localhost:5173", "https://www.channelhmedia.in/"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(admin.router)  # admin CRUD

app.include_router(news.router)   # admin news
app.include_router(news.public_router)

app.include_router(banner.router)         # admin CRUD
app.include_router(banner.public_router)  # public view

app.include_router(cinema_news.router)        # admin endpoints
app.include_router(cinema_news.public_router) # public endpoints

app.include_router(meet_the_person.router)
app.include_router(meet_the_person.public_router)

app.include_router(more_news.router)
app.include_router(more_news.public_router)

app.include_router(flashnews.router)
app.include_router(flashnews.public_router)

app.include_router(teaser_and_promo.router)
app.include_router(teaser_and_promo.public_router)

app.include_router(square_ad.router)
app.include_router(square_ad.public_router)

app.include_router(banner_ad.router)
app.include_router(banner_ad.public_router)

app.include_router(trending_news.router)
app.include_router(trending_news.public_router)

app.include_router(bottom_banner_ad.router)
app.include_router(bottom_banner_ad.public_router)


app.include_router(full_screen_ad.router)        
app.include_router(full_screen_ad.public_router) 


app.include_router(pop_up_ad.router)             
app.include_router(pop_up_ad.public_router)      


# app.include_router(seo_routes.router) 
# Include SEO router (this intercepts and delivers pages to search engine bots/crawlers)
app.include_router(seo_routes.router)
