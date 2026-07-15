from sqlalchemy import Column, Integer, String, DateTime, Boolean,Text, JSON,ForeignKey
from sqlalchemy.sql import func
from .database import Base

class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)      # new
    content = Column(Text, nullable=False)
    author = Column(String(100), nullable=False)                 # new
    image = Column(String(500), nullable=True)
    date = Column(String(50))
    trending = Column(Boolean, nullable=False, default=True)                   # new, store image URL/path
    tags = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # already exists'
    # added code
    add_to_home = Column(Boolean, nullable=False, index=True, default=False)
    is_sponsored = Column(Boolean, nullable=False, index=True, default=False)
    show_view_count = Column(Boolean, default=False)  # DEFAULT FALSE
    

class NewsView(Base):
    __tablename__ = "news_views"
    id = Column(Integer, primary_key=True)
    news_id = Column(Integer, ForeignKey("news.id"))
    ip_address = Column(String(50), nullable=False)
    

class Banner(Base):
    __tablename__ = "banners"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    image = Column(String(500), nullable=True)  # store banner image path
    status = Column(String(100), default="inactive")  # "active" or "inactive"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # added code
    link = Column(String(500), nullable=True)
    

class CinemaNews(Base):
    __tablename__ = "cinema_news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String(100), nullable=False)
    image = Column(String(500), nullable=True)  # image path
    date = Column(String(50))
    trending = Column(Boolean, nullable=False, default=True)
    tags = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
     # added code
    add_to_home = Column(Boolean, nullable=False, index=True, default=False)
    is_sponsored = Column(Boolean, nullable=False, index=True, default=False)
    show_view_count = Column(Boolean, default=False)  # DEFAULT FALSE
    
    
class CinemaNewsView(Base):
    __tablename__ = "cinema_news_views"
    id = Column(Integer, primary_key=True)
    news_id = Column(Integer, ForeignKey("cinema_news.id"), nullable=False)
    ip_address = Column(String(50), nullable=False)
    
    
    

    

class MeetThePerson(Base):
    __tablename__ = "meet_the_person"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String(100), nullable=False)
    image = Column(String(500), nullable=True)
    date = Column(String(50))
    trending = Column(Boolean, nullable=False, default=True)
    tags = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
     # added code
    add_to_home = Column(Boolean, nullable=False, index=True, default=False)
    is_sponsored = Column(Boolean, nullable=False, index=True, default=False)
    show_view_count = Column(Boolean, default=False)  # DEFAULT FALSE
    
    
class MeetThePersonView(Base):
    __tablename__ = "meet_the_person_views"
    id = Column(Integer, primary_key=True)
    news_id = Column(Integer, ForeignKey("meet_the_person.id"), nullable=False)
    ip_address = Column(String(50), nullable=False)
    
# Bussiness Stories
class MoreNews(Base):
    __tablename__ = "more_news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String(100), nullable=False)
    image = Column(String(500), nullable=True)
    date = Column(String(50))
    trending = Column(Boolean, nullable=False, default=True)
    tags = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
     # added code
    add_to_home = Column(Boolean, nullable=False, index=True, default=False)
    is_sponsored = Column(Boolean, nullable=False, index=True, default=False)
    show_view_count = Column(Boolean, default=False)  # DEFAULT FALSE
    
    
class MoreNewsView(Base):
    __tablename__ = "more_news_views"
    id = Column(Integer, primary_key=True)
    news_id = Column(Integer, ForeignKey("more_news.id"), nullable=False)
    ip_address = Column(String(50), nullable=False)
    

class FlashNews(Base):
    __tablename__ = "flash_news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    status = Column(String(100), default="inactive")  # active / inactive
    created_at = Column(DateTime(timezone=True), server_default=func.now())
     # added code
    link = Column(String(500), nullable=True)
    

class TeaseAndPromo(Base): # Trailers and Previews
    __tablename__ = "teaser_and_promo"

    id = Column(Integer, primary_key=True, index=True)
    video_title = Column(String(255), nullable=False)
    video_url = Column(String(500), unique=True, nullable=False)
    active_inactive = Column(Boolean, nullable=False, default=True)
    published_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SquareAd(Base):

    __tablename__ = "square_ad"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    image = Column(String(500), nullable=True)
    page_type = Column(String(255), nullable=False)
    order = Column(Integer, nullable=False)
    link = Column(String(500), nullable=False)
    status = Column(Boolean, nullable=False, default=True)
    show_contact = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class BannerAd(Base):

    __tablename__ = "banner_ad"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    image = Column(String(500), nullable=True)
    page_type = Column(String(255), nullable=False)
    order = Column(Integer, nullable=False)
    link = Column(String(500), nullable=False)
    status = Column(Boolean, nullable=False, default=True)
    show_contact = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
class BottomBannerAd(Base):
    __tablename__ = "bottom_banner_ad"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    image = Column(String(500), nullable=False)
    page_type = Column(String(255), nullable=False)
    order = Column(Integer, nullable=False)
    link = Column(String(500), nullable=True)
    status = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    
class FullScreenAd(Base):
    __tablename__ = "full_screen_ad"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    image = Column(String(500), nullable=False)
    page_type = Column(String(255), nullable=False)
    link = Column(String(500), nullable=True)
    status = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
  
    
    # PopupAd
class PopUpAd(Base):
    __tablename__ = "pop_up_ad"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    image = Column(String(500), nullable=False)
    page_type = Column(String(255), nullable=False)
    link = Column(String(500), nullable=True)
    status = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
class Trendingnews(Base):
    __tablename__ = "trending_news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String(100), nullable=False)
    image = Column(String(500), nullable=True)
    date = Column(String(50))
    tags = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    source_type = Column(String(50), nullable=False)  # news | cinema | meet | more
    source_id = Column(Integer, nullable=False)
    


