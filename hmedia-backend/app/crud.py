from sqlalchemy.orm import Session
from . import models, schemas
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.utils.file_utils import delete_static_image
import traceback

def create_news(db: Session, news: schemas.NewsCreate):
    try:
        # 1️⃣ Create main News record
        db_news = models.News(
            title=news.title,
            slug=news.slug,
            content=news.content,
            author=news.author,
            image=news.image,
            date=news.date,
            trending=news.trending,
            tags=news.tags
        )

        db.add(db_news)
        db.flush()  # ⬅️ IMPORTANT: keeps transaction open, gets PK if needed

        # 2️⃣ If trending = True → insert into trending_news
        if news.trending:
            db_trending = models.Trendingnews(
                title=news.title,
                slug=news.slug,
                content=news.content,
                author=news.author,
                image=news.image,
                date=news.date,
                tags=news.tags,
                source_type="news",
                source_id=db_news.id
            )
            db.add(db_trending)

        # 3️⃣ Commit both together
        db.commit()
        db.refresh(db_news)
        return db_news

    except IntegrityError:
        db.rollback()
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slug already exists. Please use a unique slug."
        )
    
    except Exception:
        db.rollback()
        traceback.print_exc()  # 🔥 LOGS ALL OTHER ERRORS
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while updating news"
        )


def update_news(db: Session, news_id: int, news: schemas.NewsCreate):
    db_news = db.query(models.News).filter(models.News.id == news_id).first()

    if not db_news:
        return None

    old_image = db_news.image

    # 1️⃣ Update main News fields
    db_news.title = news.title
    db_news.slug = news.slug
    db_news.content = news.content
    db_news.author = news.author
    db_news.date = news.date
    db_news.trending = news.trending
    db_news.tags = news.tags

    # Update image ONLY if new one is provided
    if news.image is not None:
        db_news.image = news.image

    try:
        # 2️⃣ Handle Trending News sync
        trending_row = (
            db.query(models.Trendingnews)
            .filter(
                models.Trendingnews.source_type == "news",
                models.Trendingnews.source_id == db_news.id
            )
            .first()
        )

        if news.trending:
            if trending_row:
                # 🔁 Update existing trending row
                trending_row.title = news.title
                trending_row.slug = news.slug
                trending_row.content = news.content
                trending_row.author = news.author
                trending_row.image = db_news.image
                trending_row.date = news.date
                trending_row.tags = news.tags
            else:
                # ➕ Insert new trending row
                db.add(
                    models.Trendingnews(
                        title=news.title,
                        slug=news.slug,
                        content=news.content,
                        author=news.author,
                        image=db_news.image,
                        date=news.date,
                        tags=news.tags,
                        source_type="news",
                        source_id=db_news.id
                    )
                )
        else:
            # ❌ Remove from trending_news if exists
            if trending_row:
                db.delete(trending_row)

        # 3️⃣ Commit everything together
        db.commit()
        db.refresh(db_news)

        # 4️⃣ Delete old image ONLY after successful commit
        if news.image and old_image and old_image != news.image:
            delete_static_image(old_image)

        return db_news

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slug already exists. Please use a unique slug."
        )
    
    
def get_all_news(db: Session):
    return db.query(models.News).all()
    

# def get_latest_news(db: Session, limit: int = 5):
#     return (
#         db.query(models.News)
#         .order_by(models.News.created_at.desc())
#         .limit(limit)
#         .all()
#     )

import html,re

def get_word_snippet(html_content, word_limit=9):
    if not html_content:
        return ""
    # Remove HTML tags (removes the heavy <img> data strings)
    clean_text = re.sub('<[^<]+?>', '', html_content)
    # Convert HTML entities like &nbsp; to real spaces
    clean_text = html.unescape(clean_text)
    words = clean_text.split()
    if len(words) <= word_limit:
        return " ".join(words)
    return " ".join(words[:word_limit]) + "..."

# added code
def get_latest_news(db: Session, limit: int = 5):
    items = (
        db.query(models.News)
        .order_by(
            models.News.add_to_home.desc(),  # pinned first
            models.News.created_at.desc()    # then latest
        )
        .limit(limit)
        .all()
    )
    for item in items:
        item.content = get_word_snippet(item.content)
    return items
    

    
def get_all_news_paginate(db: Session, page: int = 1, limit: int = 12):
    skip = (page - 1) * limit

    total = db.query(models.News).count()

    items = (
        db.query(models.News)
        .order_by(models.News.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    # truncate content to avoid heavy response
    for item in items:
        item.content = get_word_snippet(item.content)

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "items": items
    }


def get_news_by_slug(db: Session, slug: int):
    return db.query(models.News).filter(models.News.slug == slug).first()


def delete_news(db: Session, news_id: int):
    db_item = db.query(models.News).filter(models.News.id == news_id).first()

    if not db_item:
        return None

    try:
        
        # 🔹 Delete from news_views (FIX)
        db.query(models.NewsView).filter(
            models.NewsView.news_id == news_id
        ).delete(synchronize_session=False)
        
        # 🔹 Delete from trending table if exists
        db.query(models.Trendingnews).filter(
            models.Trendingnews.source_type == "news",
            models.Trendingnews.source_id == news_id
        ).delete(synchronize_session=False)

        # 🔹 Delete image
        if db_item.image:
            delete_static_image(db_item.image)

        # 🔹 Delete main record
        db.delete(db_item)
        db.commit()
        return True

    except Exception as e:
        db.rollback()
        print("ERROR:", e)
        raise

# ---------------------------------- Banner ------------------------------------------

def create_banner(db: Session, banner: schemas.BannerCreate):
    db_banner = models.Banner(
        title=banner.title,
        image=banner.image,
        status=banner.status,
        # added code
        link = banner.link
           
    )
    db.add(db_banner)
    db.commit()
    db.refresh(db_banner)
    return db_banner

# add link : str in bracket
def update_banner(db: Session, banner_id: int, title: str, status: str,link: str | None, new_image_path: str | None):
    db_banner = db.query(models.Banner).filter(models.Banner.id == banner_id).first()

    if not db_banner:
        return None

    db_banner.title = title
    db_banner.status = status
    # added code
    db_banner.link = link

    # Only update image if new one uploaded
    if new_image_path:
        db_banner.image = new_image_path

    if new_image_path and db_banner.image != new_image_path:
        delete_static_image(db_banner.image)

    db.commit()
    db.refresh(db_banner)
    return db_banner

def delete_banner(db: Session, banner_id: int):
    db_banner = db.query(models.Banner).filter(models.Banner.id == banner_id).first()
    if not db_banner:
        return None

    delete_static_image(db_banner.image)

    db.delete(db_banner)
    db.commit()
    return True


def get_all_banners(db: Session):
    return db.query(models.Banner).all()
    
def get_all_latestactive_banners(db: Session):
    return (
        db.query(models.Banner)
        .filter(models.Banner.status == 'active')
        .order_by(models.Banner.created_at.desc())
        .all()  
    )

# ----------------------- Cinema News -----------------------

# Create
def create_cinema_news(db: Session, news: schemas.CinemaNewsCreate):
    try:
        # 1️⃣ Create CinemaNews
        db_news = models.CinemaNews(
            title=news.title,
            slug=news.slug,
            content=news.content,
            author=news.author,
            image=news.image,
            date=news.date,
            trending=news.trending,
            tags=news.tags
        )

        db.add(db_news)
        db.flush()  # keep transaction open

        # 2️⃣ If trending → insert into SAME trending_news table
        if news.trending:
            db.add(
                models.Trendingnews(
                    title=news.title,
                    slug=news.slug,
                    content=news.content,
                    author=news.author,
                    image=news.image,
                    date=news.date,
                    tags=news.tags,
                    source_type="cinema_news",
                    source_id=db_news.id
                )
            )

        # 3️⃣ Commit together
        db.commit()
        db.refresh(db_news)
        return db_news

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slug already exists. Please use a unique slug."
        )

def update_cinema_news(
    db: Session,
    news_id: int,
    news: schemas.CinemaNewsBase,
    new_image_path: str | None
):
    db_news = db.query(models.CinemaNews).filter(models.CinemaNews.id == news_id).first()
    if not db_news:
        return None

    old_image = db_news.image

    # 1️⃣ Update CinemaNews fields
    db_news.title = news.title
    db_news.slug = news.slug
    db_news.content = news.content
    db_news.author = news.author
    db_news.date = news.date
    db_news.trending = news.trending
    db_news.tags = news.tags

    # Update image only if new one uploaded
    if new_image_path:
        db_news.image = new_image_path

    try:
        trending_row = (
            db.query(models.Trendingnews)
            .filter(
                models.Trendingnews.source_type == "cinema_news",
                models.Trendingnews.source_id == db_news.id
            )
            .first()
        )

        if news.trending:
            if trending_row:
                # 🔁 Update existing trending entry
                trending_row.title = news.title
                trending_row.slug = news.slug
                trending_row.content = news.content
                trending_row.author = news.author
                trending_row.image = db_news.image
                trending_row.date = news.date
                trending_row.tags = news.tags
            else:
                # ➕ Insert new trending entry
                db.add(
                    models.Trendingnews(
                        title=news.title,
                        slug=news.slug,
                        content=news.content,
                        author=news.author,
                        image=db_news.image,
                        date=news.date,
                        tags=news.tags,
                        source_type="cinema_news",
                        source_id=db_news.id
                    )
                )
        else:
            # ❌ Remove from trending_news
            if trending_row:
                db.delete(trending_row)

        # 3️⃣ Commit everything
        db.commit()
        db.refresh(db_news)

        # 4️⃣ Delete old image AFTER successful commit
        if new_image_path and old_image and old_image != new_image_path:
            delete_static_image(old_image)

        return db_news

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slug already exists. Please use a unique slug."
        )

# Get all
def get_all_cinema_news(db: Session):
    return db.query(models.CinemaNews).all()
    
def get_latest_cinemanews(db: Session, limit: int = 5):
    items= (
        db.query(models.CinemaNews)
        .order_by(
            models.CinemaNews.add_to_home.desc(),
            models.CinemaNews.created_at.desc()
            )
        .limit(limit)
        .all()
    )
    for item in items:
        item.content = get_word_snippet(item.content)

    return items
    
def get_all_cinemanews_paginate(db: Session, page: int = 1, limit: int = 12):
    skip = (page - 1) * limit

    total = db.query(models.CinemaNews).count()

    items = (
        db.query(models.CinemaNews)
        .order_by(models.CinemaNews.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    for item in items:
        item.content = get_word_snippet(item.content)
    return {
        "page": page,
        "limit": limit,
        "total": total,
        "items": items
    }

# Get by id
def get_cinema_news_by_slug(db: Session, slug: str):
    return db.query(models.CinemaNews).filter(models.CinemaNews.slug == slug).first()

def delete_cinema_news(db: Session, news_id: int):
    # Get the main CinemaNews record
    db_item = db.query(models.CinemaNews).filter(models.CinemaNews.id == news_id).first()

    if not db_item:
        return None

    try:
        # 🔹 Delete from CinemaNewsView (child table) if exists
        db.query(models.CinemaNewsView).filter(
            models.CinemaNewsView.news_id == news_id
        ).delete(synchronize_session=False)

        # 🔹 Delete from trending table if exists
        db.query(models.Trendingnews).filter(
            models.Trendingnews.source_type == "cinema_news",
            models.Trendingnews.source_id == news_id
        ).delete(synchronize_session=False)

        # 🔹 Delete image file if exists
        if db_item.image:
            delete_static_image(db_item.image)

        # 🔹 Delete the main CinemaNews record
        db.delete(db_item)
        db.commit()
        return True

    except Exception as e:
        db.rollback()
        print("ERROR deleting cinema news:", e)
        raise

# ----------------------- Meet The Person -----------------------


def create_meet_person(db: Session, data: schemas.MeetThePersonCreate):
    try:
        # 1️⃣ Create MeetThePerson entry
        db_item = models.MeetThePerson(
            title=data.title,
            slug=data.slug,
            content=data.content,
            author=data.author,
            date=data.date,
            image=data.image,
            trending=data.trending,
            tags=data.tags
        )

        db.add(db_item)
        db.flush()  # keep transaction open

        # 2️⃣ If trending → insert into SAME trending_news table
        if data.trending:
            db.add(
                models.Trendingnews(
                    title=data.title,
                    slug=data.slug,
                    content=data.content,
                    author=data.author,
                    image=data.image,
                    date=data.date,
                    tags=data.tags,
                    source_type="meet_the_person",
                    source_id=db_item.id
                )
            )

        # 3️⃣ Commit both together
        db.commit()
        db.refresh(db_item)
        return db_item

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slug already exists. Please use a unique slug."
        )



def update_meet_person(db: Session, item_id: int, data: schemas.MeetThePersonCreate):
    db_item = (
        db.query(models.MeetThePerson)
        .filter(models.MeetThePerson.id == item_id)
        .first()
    )
    if not db_item:
        return None

    old_image = db_item.image

    # 1️⃣ Update MeetThePerson fields
    db_item.title = data.title
    db_item.slug = data.slug
    db_item.content = data.content
    db_item.author = data.author
    db_item.date = data.date
    db_item.trending = data.trending
    db_item.tags = data.tags

    # Update image only if provided
    if data.image is not None:
        db_item.image = data.image

    try:
        trending_row = (
            db.query(models.Trendingnews)
            .filter(
                models.Trendingnews.source_type == "meet_the_person",
                models.Trendingnews.source_id == db_item.id
            )
            .first()
        )

        if data.trending:
            if trending_row:
                # 🔁 Update trending entry
                trending_row.title = data.title
                trending_row.slug = data.slug
                trending_row.content = data.content
                trending_row.author = data.author
                trending_row.image = db_item.image
                trending_row.date = data.date
                trending_row.tags = data.tags
            else:
                # ➕ Insert new trending entry
                db.add(
                    models.Trendingnews(
                        title=data.title,
                        slug=data.slug,
                        content=data.content,
                        author=data.author,
                        image=db_item.image,
                        date=data.date,
                        tags=data.tags,
                        source_type="meet_the_person",
                        source_id=db_item.id
                    )
                )
        else:
            # ❌ Remove from trending_news
            if trending_row:
                db.delete(trending_row)

        # 3️⃣ Commit everything
        db.commit()
        db.refresh(db_item)

        # 4️⃣ Delete old image AFTER successful commit
        if data.image and old_image and old_image != data.image:
            delete_static_image(old_image)

        return db_item

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slug already exists. Please use a unique slug."
        )


def get_all_meet_person(db: Session):
    return db.query(models.MeetThePerson).all()
    
def get_latest_meet_person(db: Session, limit: int = 5):
    items = (
        db.query(models.MeetThePerson)
        .order_by(models.MeetThePerson.created_at.desc())
        .limit(limit)
        .all()
    )
    for item in items:
        item.content = get_word_snippet(item.content)

    return items
    
def get_all_meet_person_paginate(db: Session, page: int = 1, limit: int = 12):
    skip = (page - 1) * limit

    total = db.query(models.MeetThePerson).count()

    items = (
        db.query(models.MeetThePerson)
        .order_by(models.MeetThePerson.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    for item in items:
        item.content = get_word_snippet(item.content)

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "items": items
    }


def get_meet_person_by_id(db: Session, slug: str):
    return db.query(models.MeetThePerson).filter(models.MeetThePerson.slug == slug).first()


def delete_meet_person(db: Session, item_id: int):
    db_item = db.query(models.MeetThePerson).filter(models.MeetThePerson.id == item_id).first()

    if not db_item:
        return None

    try:
        
        # 🔹 Delete from child table if exists (example: MeetThePersonView)
        db.query(models.MeetThePersonView).filter(
            models.MeetThePersonView.news_id == item_id
        ).delete(synchronize_session=False)
        
        
        # 🔹 Delete from trending table if exists
        db.query(models.Trendingnews).filter(
            models.Trendingnews.source_type == "meet_the_person",
            models.Trendingnews.source_id == item_id
        ).delete(synchronize_session=False)

        # 🔹 Delete image
        if db_item.image:
            delete_static_image(db_item.image)

        # 🔹 Delete main record
        db.delete(db_item)
        db.commit()
        return True

    except Exception as e:
        db.rollback()
        print("ERROR deleting meet person:", e)
        raise

# ----------------------- More News -----------------------

def create_more_news(db: Session, data: schemas.MoreNewsCreate):
    try:
        # 1️⃣ Create MoreNews
        db_item = models.MoreNews(
            title=data.title,
            slug=data.slug,
            content=data.content,
            author=data.author,
            date=data.date,
            image=data.image,
            trending=data.trending,
            tags=data.tags
        )

        db.add(db_item)
        db.flush()  # keep transaction open

        # 2️⃣ If trending → insert into SAME trending_news table
        if data.trending:
            db.add(
                models.Trendingnews(
                    title=data.title,
                    slug=data.slug,
                    content=data.content,
                    author=data.author,
                    image=data.image,
                    date=data.date,
                    tags=data.tags,
                    source_type="more_news",
                    source_id=db_item.id
                )
            )

        # 3️⃣ Commit together
        db.commit()
        db.refresh(db_item)
        return db_item

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slug already exists. Please use a unique slug."
        )


def update_more_news(db: Session, item_id: int, data: schemas.MoreNewsCreate):
    db_item = (
        db.query(models.MoreNews)
        .filter(models.MoreNews.id == item_id)
        .first()
    )
    if not db_item:
        return None

    old_image = db_item.image

    # 1️⃣ Update MoreNews fields
    db_item.title = data.title
    db_item.slug = data.slug
    db_item.content = data.content
    db_item.author = data.author
    db_item.date = data.date
    db_item.trending = data.trending
    db_item.tags = data.tags

    # Update image only if new one is provided
    if data.image is not None:
        db_item.image = data.image

    try:
        trending_row = (
            db.query(models.Trendingnews)
            .filter(
                models.Trendingnews.source_type == "more_news",
                models.Trendingnews.source_id == db_item.id
            )
            .first()
        )

        if data.trending:
            if trending_row:
                # 🔁 Update existing trending entry
                trending_row.title = data.title
                trending_row.slug = data.slug
                trending_row.content = data.content
                trending_row.author = data.author
                trending_row.image = db_item.image
                trending_row.date = data.date
                trending_row.tags = data.tags
            else:
                # ➕ Insert new trending entry
                db.add(
                    models.Trendingnews(
                        title=data.title,
                        slug=data.slug,
                        content=data.content,
                        author=data.author,
                        image=db_item.image,
                        date=data.date,
                        tags=data.tags,
                        source_type="more_news",
                        source_id=db_item.id
                    )
                )
        else:
            # ❌ Remove from trending_news if exists
            if trending_row:
                db.delete(trending_row)

        # 3️⃣ Commit everything
        db.commit()
        db.refresh(db_item)

        # 4️⃣ Delete old image AFTER successful commit
        if data.image and old_image and old_image != data.image:
            delete_static_image(old_image)

        return db_item

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slug already exists. Please use a unique slug."
        )

def get_all_more_news(db: Session):
    return db.query(models.MoreNews).all()
    
def get_latest_more_news(db: Session, limit: int = 10):
    items = (
        db.query(models.MoreNews)
        .order_by(models.MoreNews.created_at.desc())
        .limit(limit)
        .all()
    )
    for item in items:
        item.content = get_word_snippet(item.content)

    return items
    
def get_more_news_paginate(db: Session, page: int = 1, limit: int = 12):
    skip = (page - 1) * limit

    total = db.query(models.MoreNews).count()

    items = (
        db.query(models.MoreNews)
        .order_by(models.MoreNews.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    for item in items:
        item.content = get_word_snippet(item.content)
    
    return {
        "page": page,
        "limit": limit,
        "total": total,
        "items": items
    }
    



def get_more_news_by_id(db: Session, slug: str):
    return db.query(models.MoreNews).filter(models.MoreNews.slug == slug).first()

def delete_more_news(db: Session, item_id: int):
    db_item = (
        db.query(models.MoreNews)
        .filter(models.MoreNews.id == item_id)
        .first()
    )

    if not db_item:
        return None

    try:
        
        # 🔹 Delete from child table if exists (example: MoreNewsView)
        db.query(models.MoreNewsView).filter(
            models.MoreNewsView.news_id == item_id
        ).delete(synchronize_session=False)
        
        
        # 🔹 Delete from trending table if exists
        db.query(models.Trendingnews).filter(
            models.Trendingnews.source_type == "more_news",
            models.Trendingnews.source_id == item_id
        ).delete(synchronize_session=False)

        # 🔹 Delete image
        if db_item.image:
            delete_static_image(db_item.image)

        # 🔹 Delete main record
        db.delete(db_item)
        db.commit()
        return True

    except Exception as e:
        db.rollback()
        print("ERROR deleting more news:", e)
        raise


 

def delete_flash_news(db: Session, flash_id: int):
    db_item = db.query(models.FlashNews).filter(models.FlashNews.id == flash_id).first()
    if not db_item:
        return None

    db.delete(db_item)
    db.commit()
    return True

def get_all_flash_news(db: Session):
    return db.query(models.FlashNews).all()

def get_flash_news_by_id(db: Session, flash_id: int):
    return db.query(models.FlashNews).filter(models.FlashNews.id == flash_id).first()


# ----------------------- Teaser and Promo -----------------------

def create_teaser_and_promo(
    db: Session,
    data: schemas.TeaserAndPromoCreate
):
    try:
        item = models.TeaseAndPromo(**data.dict())
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    except Exception as e:
        db.rollback()
        traceback.print_exc()  # shows in passenger stderr
        raise HTTPException(status_code=500, detail=str(e))


def get_all_teaser_and_promo(db: Session):
    return db.query(models.TeaseAndPromo).all()
    
def get_latest_teaser_and_promo(db: Session, limit: int = 10):
    return (
        db.query(models.TeaseAndPromo)
        .order_by(models.TeaseAndPromo.created_at.desc())
        .filter(models.TeaseAndPromo.active_inactive == True)
        .limit(limit)
        .all()
    )
    
# def get_teaser_and_promo_paginate(db: Session, page: int = 1, limit: int = 12):
#     skip = (page - 1) * limit

#     total = db.query(models.TeaseAndPromo).count()

#     items = (
#         db.query(models.TeaseAndPromo)
#         .order_by(models.TeaseAndPromo.created_at.desc())
#         .offset(skip)
#         .limit(limit)
#         .all()
#     )

#     return {
#         "page": page,
#         "limit": limit,
#         "total": total,
#         "items": items
#     }


def get_teaser_and_promo_paginate(db: Session, page: int = 1, limit: int = 12):
    skip = (page - 1) * limit

    total = db.query(models.TeaseAndPromo).filter(models.TeaseAndPromo.active_inactive == True).count()

    items = (
        db.query(models.TeaseAndPromo)
        .filter(models.TeaseAndPromo.active_inactive == True)
        .order_by(models.TeaseAndPromo.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "items": items
    }

    
    


def get_teaser_and_promo_by_id(db: Session, item_id: int):
    return (
        db.query(models.TeaseAndPromo)
        .filter(models.TeaseAndPromo.id == item_id)
        .first()
    )

def update_teaser_and_promo(
    db: Session,
    item_id: int,
    data: schemas.TeaserAndPromoUpdate
):
    item = get_teaser_and_promo_by_id(db, item_id)
    if not item:
        return None

    for key, value in data.dict(exclude_unset=True).items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item

def delete_teaser_and_promo(db: Session, item_id: int):
    item = get_teaser_and_promo_by_id(db, item_id)
    if not item:
        return None

    db.delete(item)
    db.commit()
    return item

# ----------------------- Square Ads -----------------------

def create_square_ad(db: Session, data: schemas.SquareAdCreate):
    ad = models.SquareAd(**data.dict())
    db.add(ad)
    db.commit()
    db.refresh(ad)
    return ad

def get_all_square_ads(db: Session):
    return (
        db.query(models.SquareAd)
        .order_by(models.SquareAd.order)
        .all()
    )


def update_square_ad(
    db: Session,
    ad_id: int,
    data: schemas.SquareAdUpdate,
    new_image_path: str | None
):
    ad = db.query(models.SquareAd).filter(models.SquareAd.id == ad_id).first()
    if not ad:
        return None

    # 🔥 Store old image before change
    old_image = ad.image

    # ✅ Update image ONLY if new image uploaded
    if new_image_path:
        ad.image = new_image_path

    # ✅ Update other fields (exclude image)
    for key, value in data.dict(exclude_unset=True, exclude={"image"}).items():
        setattr(ad, key, value)

    # ✅ Delete old image AFTER successful update
    if new_image_path and old_image and old_image != new_image_path:
        delete_static_image(old_image)

    db.commit()
    db.refresh(ad)
    return ad


def delete_square_ad(db: Session, ad_id: int):
    ad = db.query(models.SquareAd).filter(models.SquareAd.id == ad_id).first()
    if not ad:
        return None

    delete_static_image(ad.image)

    db.delete(ad)
    db.commit()
    return ad


# ----------------------- Banner Ads -----------------------

def create_banner_ad(db: Session, data: schemas.BannerAdCreate):
    ad = models.BannerAd(**data.dict())
    db.add(ad)
    db.commit()
    db.refresh(ad)
    return ad

def get_all_banner_ads(db: Session):
    return (
        db.query(models.BannerAd)
        .order_by(models.BannerAd.order)
        .all()
    )

def update_banner_ad(
    db: Session,
    ad_id: int,
    data: schemas.BannerAdUpdate,
    new_image_path: str | None
):
    ad = db.query(models.BannerAd).filter(models.BannerAd.id == ad_id).first()
    if not ad:
        return None

    old_image = ad.image  # 🔥 save before change

    # ✅ Update image ONLY if new image uploaded
    if new_image_path:
        ad.image = new_image_path

    # ✅ Update other fields (exclude image)
    for key, value in data.dict(exclude_unset=True, exclude={"image"}).items():
        setattr(ad, key, value)

    # ✅ Delete old image safely AFTER update
    if new_image_path and old_image and old_image != new_image_path:
        delete_static_image(old_image)

    db.commit()
    db.refresh(ad)
    return ad


def delete_banner_ad(db: Session, ad_id: int):
    ad = db.query(models.BannerAd).filter(models.BannerAd.id == ad_id).first()
    if not ad:
        return None

    delete_static_image(ad.image)

    db.delete(ad)
    db.commit()
    return ad

# ------------- Bottom Banner Ad -----------------------------------------
def create_bottom_banner_ad(db:Session,data:schemas.BottomBannerCreate):
    ad = models.BottomBannerAd(**data.dict())
    db.add(ad)
    db.commit()
    db.refresh(ad)
    return ad 

def get_all_bottom_banner_ads(db:Session):
    return (
        db.query(models.BottomBannerAd)
        .order_by(models.BottomBannerAd.order)
        .all()
    )
    
def update_bottom_banner_ad(
    db: Session,
    ad_id: int,
    data: schemas.BottomBannerUpdate,
    new_image_path: str | None
):
    ad = db.query(models.BottomBannerAd).filter(models.BottomBannerAd.id == ad_id).first()
    if not ad:
        return None

    old_image = ad.image  # save old image

    # Update image only if new one uploaded
    if new_image_path:
        ad.image = new_image_path

    # Update other fields, skip unset and image
    for key, value in data.dict(exclude_unset=True, exclude={"image"}).items():
        setattr(ad, key, value)

    db.commit()
    db.refresh(ad)

    # Delete old image if replaced
    if new_image_path and old_image and old_image != new_image_path:
        delete_static_image(old_image)

    return ad

    
def delete_bottom_banner_ad(db: Session, ad_id: int):
    ad = db.query(models.BottomBannerAd).filter(models.BottomBannerAd.id == ad_id).first()
    if not ad:
        return None

    delete_static_image(ad.image)

    db.delete(ad)
    db.commit()
    return ad


# ---------------- Full Screen Ad ----------------
def create_full_screen_ad(db: Session, data: schemas.FullScreenAdCreate):
    ad = models.FullScreenAd(**data.dict())
    db.add(ad)
    db.commit()
    db.refresh(ad)
    return ad


def get_all_full_screen_ads(db: Session):
    return db.query(models.FullScreenAd).order_by(models.FullScreenAd.id).all()


def update_full_screen_ad(db: Session, ad_id: int, data: schemas.FullScreenAdUpdate, new_image_path: str | None):
    ad = db.query(models.FullScreenAd).filter(models.FullScreenAd.id == ad_id).first()
    if not ad:
        return None

    old_image = ad.image

    if new_image_path:
        ad.image = new_image_path

    for key, value in data.dict(exclude_unset=True, exclude={"image"}).items():
        setattr(ad, key, value)

    db.commit()
    db.refresh(ad)

    if new_image_path and old_image and old_image != new_image_path:
        delete_static_image(old_image)

    return ad


def delete_full_screen_ad(db: Session, ad_id: int):
    ad = db.query(models.FullScreenAd).filter(models.FullScreenAd.id == ad_id).first()
    if not ad:
        return None

    delete_static_image(ad.image)

    db.delete(ad)
    db.commit()
    return ad


# ---------------- Pop Up Ad ----------------
def create_pop_up_ad(db: Session, data: schemas.PopUpAdCreate):
    ad = models.PopUpAd(**data.dict())
    db.add(ad)
    db.commit()
    db.refresh(ad)
    return ad


# def create_pop_up_ad(db: Session, data: schemas.PopUpAdCreate):
#     # Check if any ad already exists
#     existing_ad = db.query(models.PopUpAd).first()
#     if existing_ad:
#         raise HTTPException(status_code=400, detail="Only one pop-up ad can be added")

#     # Create new ad
#     ad = models.PopUpAd(**data.dict())
#     db.add(ad)
#     db.commit()
#     db.refresh(ad)
#     return ad


def get_all_pop_up_ads(db: Session):
    return db.query(models.PopUpAd).order_by(models.PopUpAd.id).all()


def update_pop_up_ad(db: Session, ad_id: int, data: schemas.PopUpAdUpdate, new_image_path: str | None):
    ad = db.query(models.PopUpAd).filter(models.PopUpAd.id == ad_id).first()
    if not ad:
        return None

    old_image = ad.image

    if new_image_path:
        ad.image = new_image_path

    for key, value in data.dict(exclude_unset=True, exclude={"image"}).items():
        setattr(ad, key, value)

    db.commit()
    db.refresh(ad)

    if new_image_path and old_image and old_image != new_image_path:
        delete_static_image(old_image)

    return ad


def delete_pop_up_ad(db: Session, ad_id: int):
    ad = db.query(models.PopUpAd).filter(models.PopUpAd.id == ad_id).first()
    if not ad:
        return None

    delete_static_image(ad.image)

    db.delete(ad)
    db.commit()
    return ad


# ------------- Trending News -----------------------------------------

def get_all_trending_news(db: Session):
    return db.query(models.Trendingnews).all()
    
def get_latest_trending_news(db: Session, limit: int = 10):
    items =  (
        db.query(models.Trendingnews)
        .order_by(models.Trendingnews.created_at.desc())
        .limit(limit)
        .all()
    )
    for item in items:
        item.content = get_word_snippet(item.content)

    return items


def delete_trending_news(db: Session, trending_id: int) -> bool:
    trending_item = (
        db.query(models.Trendingnews)
        .filter(models.Trendingnews.id == trending_id)
        .first()
    )

    if not trending_item:
        return False

    try:
        # 1️⃣ Update source table (ORM-safe)
        if trending_item.source_type == "news":
            source = db.query(models.News).filter(
                models.News.id == trending_item.source_id
            ).first()

        elif trending_item.source_type == "cinema_news":
            source = db.query(models.CinemaNews).filter(
                models.CinemaNews.id == trending_item.source_id
            ).first()

        elif trending_item.source_type == "meet_the_person":
            source = db.query(models.MeetThePerson).filter(
                models.MeetThePerson.id == trending_item.source_id
            ).first()

        elif trending_item.source_type == "more_news":
            source = db.query(models.MoreNews).filter(
                models.MoreNews.id == trending_item.source_id
            ).first()

        else:
            source = None

        if source:
            source.trending = False  # ✅ ORM tracked update

        # 2️⃣ Delete trending row
        db.delete(trending_item)

        # 3️⃣ Commit everything
        db.commit()
        return True

    except Exception:
        db.rollback()
        raise

def get_trending_news_by_slug(db: Session, slug: str):
    return db.query(models.Trendingnews).filter(models.Trendingnews.slug == slug).first()


# ------------- Track View -----------------------------------------
def track_view(db: Session, view_model, news_id: int, ip: str):
    existing = db.query(view_model).filter(
        view_model.news_id == news_id,
        view_model.ip_address == ip
    ).first()
    

    if not existing:
        db.add(view_model(news_id=news_id, ip_address=ip))
        db.commit()

# updated today 01-07-2026

def create_flash_news(db: Session, data: schemas.FlashNewsCreate):
    db_item = models.FlashNews(title=data.title, status=data.status)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_flash_news(db: Session, flash_id: int, data: schemas.FlashNewsCreate):
    db_item = db.query(models.FlashNews).filter(models.FlashNews.id == flash_id).first()
    if not db_item:
        return None
    db_item.title = data.title
    db_item.status = data.status
    db.commit()
    db.refresh(db_item)
    return db_item


