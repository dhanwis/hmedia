from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# ---------------- News ----------------

class NewsBase(BaseModel):
    title: str
    slug: str
    content: str
    author: str
    date: str
    trending: bool
    image: Optional[str] = None
    tags: Optional[List[str]] = []
    
 
class NewsCreate(NewsBase):
    pass




class NewsOut(NewsBase):
    id: int
    created_at: datetime
    add_to_home: bool
    is_sponsored : bool
    view_count: int | None = None
    show_view_count : bool

    class Config:
        from_attributes = True  # Pydantic v2
        
        
# today add schema below newslistout


        
class PaginatedNews(BaseModel):
    page: int
    limit: int
    total: int
    items: List[NewsOut]


# ---------------- Banner ----------------

class BannerBase(BaseModel):
    title: str
    image: Optional[str] = None
    status: str  # "active" or "inactive"
    # added code
    link : Optional[str] = None
    
class BannerCreate(BannerBase):
    pass

class BannerOut(BannerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------- Cinema News ----------------

class CinemaNewsBase(BaseModel):
    title: str
    slug: str
    content: str
    author: str
    date: str
    trending: bool
    image: Optional[str] = None
    tags: Optional[List[str]] = []
   
         
class CinemaNewsCreate(CinemaNewsBase):
    pass

class CinemaNewsOut(CinemaNewsBase):
    id: int
    created_at: datetime
    
    add_to_home : bool
    is_sponsored : bool
    view_count: int | None = None      # Added
    show_view_count: bool               # Added


    class Config:
        from_attributes = True  # <-- FIXED
        
class PaginatedCinemaNews(BaseModel):
    page: int
    limit: int
    total: int
    items: List[CinemaNewsOut]

# ---------------- Meet The Person ----------------

class MeetThePersonBase(BaseModel):
    title: str
    slug: str
    content: str
    author: str
    date: str
    trending: bool
    image: Optional[str] = None
    tags: Optional[List[str]] = []
    
       

class MeetThePersonCreate(MeetThePersonBase):
    pass

class MeetThePersonOut(MeetThePersonBase):
    id: int
    created_at: datetime
    # added code
    add_to_home : bool
    is_sponsored : bool
    view_count: int | None = None      # Added
    show_view_count: bool               # Added

    class Config:
        from_attributes = True
        
class PaginatedMeetThePerson(BaseModel):
    page: int
    limit: int
    total: int
    items: List[MeetThePersonOut]


# ---------------- More News ----------------

class MoreNewsBase(BaseModel):
    title: str
    slug: str
    content: str
    author: str
    date: str
    trending: bool
    image: Optional[str] = None
    tags: Optional[List[str]] = []
    
       
class MoreNewsCreate(MoreNewsBase):
    pass

class MoreNewsOut(MoreNewsBase):
    id: int
    created_at: datetime
    # added code
    add_to_home : bool
    is_sponsored : bool
    view_count: int | None = None      # Added
    show_view_count: bool               # Added

    class Config:
        from_attributes = True
        
class PaginatedMoreNews(BaseModel):
    page: int
    limit: int
    total: int
    items: List[MoreNewsOut]

# --------------- Trending News ----------------

class TrendingnewsBase(BaseModel):
    title: str
    slug: str
    content: str
    author: str
    date: str
    image: Optional[str] = None
    tags: Optional[List[str]] = []
       
class TrendingNewsCreate(TrendingnewsBase):
    pass

class TrendingNewsOut(TrendingnewsBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ---------------- Flash News ----------------

class FlashNewsBase(BaseModel):
    title: str
    status: str  # active / inactive
    link : Optional[str] = None
         
class FlashNewsCreate(FlashNewsBase):
    pass

class FlashNewsOut(FlashNewsBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ---------------- Teaser and Promo -----------------------

class TeaserAndPromoBase(BaseModel):
    video_title: str
    video_url: str
    active_inactive: bool
    published_date: datetime

class TeaserAndPromoCreate(TeaserAndPromoBase):
    pass

class TeaserAndPromoUpdate(BaseModel):
    video_title: Optional[str] = None
    video_url: Optional[str] = None
    active_inactive: Optional[bool] = None
    published_date: Optional[datetime] = None


class TeaserAndPromoOut(TeaserAndPromoBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # REQUIRED for ORM → Pydantic
        
class PaginatedTeaserAndPromo(BaseModel):
    page: int
    limit: int
    total: int
    items: List[TeaserAndPromoOut]

# ---------------- Square Ad -----------------------

class SquareAdBase(BaseModel):
    title: str
    image: Optional[str] = None
    page_type: str
    order: int
    link: Optional[str] = None
    status: bool = True
    show_contact: bool = True

class SquareAdCreate(SquareAdBase):
    pass

class SquareAdUpdate(BaseModel):
    title: Optional[str] = None
    image: Optional[str] = None
    page_type: Optional[str] = None
    order: Optional[int] = None
    link: Optional[str] = None
    status: Optional[bool] = None
    show_contact: Optional[bool] = None

class SquareAdOut(SquareAdBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ---------------- Banner Ad -----------------------

class BannerAdBase(BaseModel):
    title: str
    image: Optional[str] = None
    page_type: str
    order: int
    link: Optional[str] = None
    status: bool = True
    show_contact: bool = True

class BannerAdCreate(SquareAdBase):
    pass

class BannerAdUpdate(BaseModel):
    title: Optional[str] = None
    image: Optional[str] = None
    page_type: Optional[str] = None
    order: Optional[int] = None
    link: Optional[str] = None
    status: Optional[bool] = None
    show_contact: Optional[bool] = None

class BannerAdOut(SquareAdBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
        

class BottomBannerBase(BaseModel):
    title: str
    page_type: str
    order: int
    status: bool = True
    image: str
    link: Optional[str] = None
    
    
class BottomBannerCreate(BottomBannerBase):
    pass


class BottomBannerUpdate(BaseModel):
    title: Optional[str] = None
    page_type: Optional[str] = None
    order: Optional[int] = None
    status: Optional[bool] = None
    image: Optional[str] = None
    link: Optional[str] = None


class BottomBannerOut(BottomBannerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True   # Pydantic v2
        
        
# Base schema shared for create & output
class FullScreenAdBase(BaseModel):
    title: str
    page_type: str
    image: str
    link: Optional[str] = None
    status: bool = True

# Schema for creation
class FullScreenAdCreate(FullScreenAdBase):
    pass

# Schema for update (all fields optional)
class FullScreenAdUpdate(BaseModel):
    title: Optional[str] = None
    page_type: Optional[str] = None
    image: Optional[str] = None
    link: Optional[str] = None
    status: Optional[bool] = None

# Schema for output
class FullScreenAdOut(FullScreenAdBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # for SQLAlchemy compatibility (Pydantic v2)

        
# Base schema shared for create & output
class PopUpAdBase(BaseModel):
    title: str
    page_type: str
    image: str
    link: Optional[str] = None
    status: bool = True

# Schema for creation
class PopUpAdCreate(PopUpAdBase):
    pass

# Schema for update (all fields optional)
class PopUpAdUpdate(BaseModel):
    title: Optional[str] = None
    page_type: Optional[str] = None
    image: Optional[str] = None
    link: Optional[str] = None
    status: Optional[bool] = None

# Schema for output
class PopUpAdOut(PopUpAdBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True



