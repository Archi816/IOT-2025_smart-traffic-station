import json
import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, Field

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
USERS_FILE = os.path.join(BASE_DIR, "users.json")

SECRET_KEY = os.getenv("JWT_SECRET", "CHANGE_ME_PLEASE_very_secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Важно: корректный путь для Swagger-кнопки Authorize [web:29]
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterIn(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=4, max_length=128)
    role: Optional[str] = "user"


class User(BaseModel):
    username: str
    role: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


def _load_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        raw = f.read().strip()
        return json.loads(raw) if raw else []


def _save_users(users):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2, ensure_ascii=False)


def _get_user(username: str):
    users = _load_users()
    return next((u for u in users if u["username"] == username), None)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(pw: str) -> str:
    return pwd_context.hash(pw)


def create_access_token(data: dict, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    cred_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str | None = payload.get("sub")
        role: str = payload.get("role", "user")
        if username is None:
            raise cred_exc
    except JWTError:
        raise cred_exc

    user = _get_user(username)
    if not user:
        raise cred_exc
    return User(username=user["username"], role=user.get("role", "user"))


# Быстрый тест: если этого нет в Swagger, значит роутер не подключён
@router.get("/ping")
def ping():
    return {"ok": True}


@router.post("/register")
def register(data: RegisterIn):
    if _get_user(data.username):
        raise HTTPException(status_code=400, detail="User already exists")

    users = _load_users()
    users.append(
        {
            "username": data.username,
            "password_hash": hash_password(data.password),
            "role": "user",
        }
    )
    _save_users(users)
    return {"ok": True}


@router.post("/login", response_model=TokenOut)
def login(form: OAuth2PasswordRequestForm = Depends()):
    # login принимает x-www-form-urlencoded username/password [web:16]
    user = _get_user(form.username)
    if not user or not verify_password(form.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    token = create_access_token({"sub": user["username"], "role": user.get("role", "user")})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return user
