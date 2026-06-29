import os
import hmac
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

_SECRET = os.environ.get("JWT_SECRET", "change-me-in-production")
_PASSWORD = os.environ.get("WIKI_PASSWORD", "changeme")
_ALGORITHM = "HS256"
_EXPIRY_HOURS = int(os.environ.get("JWT_EXPIRY_HOURS", "24"))

_bearer = HTTPBearer(auto_error=True)


def verify_password(password: str) -> bool:
    return hmac.compare_digest(password.encode(), _PASSWORD.encode())


def create_token(name: str) -> str:
    exp = datetime.now(tz=timezone.utc) + timedelta(hours=_EXPIRY_HOURS)
    return jwt.encode({"exp": exp, "name": name}, _SECRET, algorithm=_ALGORITHM)


def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> str:
    """Validate the JWT and return the editor's name carried inside it."""
    try:
        payload = jwt.decode(credentials.credentials, _SECRET, algorithms=[_ALGORITHM])
        return (payload.get("name") or "anonymous").strip() or "anonymous"
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired — please log in again")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
