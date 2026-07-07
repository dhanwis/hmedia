from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, Request, Depends,status #2
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials #1
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
# ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 120))

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH")


def verify_password(password: str) -> bool:
    return pwd_context.verify(password, ADMIN_PASSWORD_HASH)


def create_access_token():
    # expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": "admin"}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# def admin_auth(request: Request):
#     token = request.cookies.get("admin_token")

#     if not token:
#         raise HTTPException(status_code=401, detail="Not authenticated")

#     try:
#         payload = jwt.decode(
#             token,
#             SECRET_KEY,
#             algorithms=[ALGORITHM]
#         )
#         if payload.get("sub") != "admin":
#             raise HTTPException(status_code=401)
#     except JWTError:
#         raise HTTPException(status_code=401, detail="Invalid or expired token")

security = HTTPBearer(auto_error=False)

def admin_auth(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = None

    # 1️⃣ Try Authorization header (DEV mode)
    if credentials:
        token = credentials.credentials

    # 2️⃣ Fallback to cookie (PROD / future HTTPS)
    if not token:
        token = request.cookies.get("admin_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        if payload.get("sub") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized",
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    return payload


