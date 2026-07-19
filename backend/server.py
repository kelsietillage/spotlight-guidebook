from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File, Form
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

from seed_data import seed_content, ADMIN_ROLE

# ---------------------------------------------------------------------------
# DB
# ---------------------------------------------------------------------------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ---------------------------------------------------------------------------
# Auth utils
# ---------------------------------------------------------------------------
JWT_ALGORITHM = "HS256"
ACCESS_MINUTES = 60 * 12  # 12h


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_MINUTES),
        "type": "access",
    }
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> Dict[str, Any]:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth[7:]
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def require_admin(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if user.get("role") != ADMIN_ROLE:
        raise HTTPException(status_code=403, detail="Admin only")
    return user


# ---------------------------------------------------------------------------
# App / Router
# ---------------------------------------------------------------------------
app = FastAPI(title="Spotlight Awards Guidebook")
api = APIRouter(prefix="/api")


# --- Models ---------------------------------------------------------------
class PinIn(BaseModel):
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str


class WinnerIn(BaseModel):
    name: str
    year: int
    category: str
    theme: str
    notes: Optional[str] = ""


class ThemeIn(BaseModel):
    year: int
    title: str
    tagline: str
    description: str
    faq: List[Dict[str, str]] = Field(default_factory=list)


class TimelineIn(BaseModel):
    year: int
    month: str
    date_range: str
    items: List[str] = Field(default_factory=list)


class NomQuestionIn(BaseModel):
    section: str
    question: str
    type: str  # short, long, choice
    options: List[str] = Field(default_factory=list)
    order: int = 0


class RubricCriterionIn(BaseModel):
    name: str
    description: str
    max_score: int = 25
    order: int = 0


class TrackingRowIn(BaseModel):
    board: str  # 'selection' or 'production'
    data: Dict[str, Any] = Field(default_factory=dict)


class PhotoIn(BaseModel):
    year: int
    url: str
    caption: Optional[str] = ""


class ContactIn(BaseModel):
    role: str
    name: str
    year: str = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    note: Optional[str] = ""


class EmailTemplateIn(BaseModel):
    order: int = 0
    audience: str
    title: str
    when: Optional[str] = ""
    subject: str
    body: str


# --- Helpers ---------------------------------------------------------------
def clean(doc: Dict[str, Any]) -> Dict[str, Any]:
    doc.pop("_id", None)
    return doc


async def _list(coll: str, sort: Optional[List] = None) -> List[Dict[str, Any]]:
    cur = db[coll].find({}, {"_id": 0})
    if sort:
        cur = cur.sort(sort)
    return await cur.to_list(2000)


async def _create(coll: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    doc = {"id": str(uuid.uuid4()), **payload,
           "created_at": datetime.now(timezone.utc).isoformat()}
    await db[coll].insert_one(doc)
    return clean(doc)


async def _update(coll: str, item_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    payload["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = await db[coll].update_one({"id": item_id}, {"$set": payload})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    doc = await db[coll].find_one({"id": item_id}, {"_id": 0})
    return doc


async def _delete(coll: str, item_id: str) -> Dict[str, str]:
    res = await db[coll].delete_one({"id": item_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"status": "deleted"}


# --- Auth endpoints --------------------------------------------------------
@api.post("/auth/login")
async def login(payload: LoginIn):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    return {
        "access_token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user.get("name", ""), "role": user["role"]},
    }


@api.post("/auth/pin")
async def pin_login(payload: PinIn):
    """Password-only login for the sole co-chair admin account."""
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    user = await db.users.find_one({"email": admin_email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect password")
    token = create_access_token(user["id"], user["email"])
    return {
        "access_token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user.get("name", ""), "role": user["role"]},
    }


@api.get("/auth/me", response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return user


@api.post("/auth/logout")
async def logout(user=Depends(get_current_user)):
    return {"status": "ok"}


# --- Winners ---------------------------------------------------------------
@api.get("/winners")
async def list_winners():
    return await _list("winners", sort=[("year", -1), ("name", 1)])


@api.post("/winners")
async def add_winner(payload: WinnerIn, _=Depends(require_admin)):
    return await _create("winners", payload.model_dump())


@api.put("/winners/{item_id}")
async def edit_winner(item_id: str, payload: WinnerIn, _=Depends(require_admin)):
    return await _update("winners", item_id, payload.model_dump())


@api.delete("/winners/{item_id}")
async def remove_winner(item_id: str, _=Depends(require_admin)):
    return await _delete("winners", item_id)


# --- Themes ---------------------------------------------------------------
@api.get("/themes")
async def list_themes():
    return await _list("themes", sort=[("year", -1)])


@api.post("/themes")
async def add_theme(payload: ThemeIn, _=Depends(require_admin)):
    return await _create("themes", payload.model_dump())


@api.put("/themes/{item_id}")
async def edit_theme(item_id: str, payload: ThemeIn, _=Depends(require_admin)):
    return await _update("themes", item_id, payload.model_dump())


@api.delete("/themes/{item_id}")
async def remove_theme(item_id: str, _=Depends(require_admin)):
    return await _delete("themes", item_id)


# --- Timelines ------------------------------------------------------------
MONTH_ORDER = ["December", "January", "February", "March", "April", "May",
               "June", "July", "August", "September", "October", "November"]


@api.get("/timelines")
async def list_timelines():
    rows = await _list("timelines")
    rows.sort(key=lambda r: (-int(r.get("year", 0)),
                             MONTH_ORDER.index(r["month"]) if r.get("month") in MONTH_ORDER else 99))
    return rows


@api.post("/timelines")
async def add_timeline(payload: TimelineIn, _=Depends(require_admin)):
    return await _create("timelines", payload.model_dump())


@api.put("/timelines/{item_id}")
async def edit_timeline(item_id: str, payload: TimelineIn, _=Depends(require_admin)):
    return await _update("timelines", item_id, payload.model_dump())


@api.delete("/timelines/{item_id}")
async def remove_timeline(item_id: str, _=Depends(require_admin)):
    return await _delete("timelines", item_id)


# --- Nomination Questions -------------------------------------------------
@api.get("/nomination")
async def list_nom():
    rows = await _list("nomination")
    rows.sort(key=lambda r: (r.get("section", ""), r.get("order", 0)))
    return rows


@api.post("/nomination")
async def add_nom(payload: NomQuestionIn, _=Depends(require_admin)):
    return await _create("nomination", payload.model_dump())


@api.put("/nomination/{item_id}")
async def edit_nom(item_id: str, payload: NomQuestionIn, _=Depends(require_admin)):
    return await _update("nomination", item_id, payload.model_dump())


@api.delete("/nomination/{item_id}")
async def remove_nom(item_id: str, _=Depends(require_admin)):
    return await _delete("nomination", item_id)


# --- Rubric ----------------------------------------------------------------
@api.get("/rubric")
async def list_rubric():
    rows = await _list("rubric")
    rows.sort(key=lambda r: r.get("order", 0))
    return rows


@api.post("/rubric")
async def add_rubric(payload: RubricCriterionIn, _=Depends(require_admin)):
    return await _create("rubric", payload.model_dump())


@api.put("/rubric/{item_id}")
async def edit_rubric(item_id: str, payload: RubricCriterionIn, _=Depends(require_admin)):
    return await _update("rubric", item_id, payload.model_dump())


@api.delete("/rubric/{item_id}")
async def remove_rubric(item_id: str, _=Depends(require_admin)):
    return await _delete("rubric", item_id)


# --- Tracking Rows --------------------------------------------------------
@api.get("/tracking")
async def list_tracking(board: Optional[str] = None):
    q = {"board": board} if board else {}
    rows = await db.tracking.find(q, {"_id": 0}).to_list(2000)
    return rows


@api.post("/tracking")
async def add_tracking(payload: TrackingRowIn, _=Depends(require_admin)):
    return await _create("tracking", payload.model_dump())


@api.put("/tracking/{item_id}")
async def edit_tracking(item_id: str, payload: TrackingRowIn, _=Depends(require_admin)):
    return await _update("tracking", item_id, payload.model_dump())


@api.delete("/tracking/{item_id}")
async def remove_tracking(item_id: str, _=Depends(require_admin)):
    return await _delete("tracking", item_id)


# --- Photos ---------------------------------------------------------------
@api.get("/photos")
async def list_photos():
    rows = await _list("photos")
    rows.sort(key=lambda r: (-int(r.get("year", 0)), r.get("created_at", "")))
    return rows


@api.post("/photos")
async def add_photo(payload: PhotoIn, _=Depends(require_admin)):
    return await _create("photos", payload.model_dump())


@api.post("/photos/upload")
async def upload_photo(
    file: UploadFile = File(...),
    year: int = Form(...),
    caption: str = Form(""),
    _=Depends(require_admin),
):
    import base64
    content = await file.read()
    if len(content) > 6 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image too large (max 6 MB)")
    mime = file.content_type or "image/jpeg"
    if not mime.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    data_url = f"data:{mime};base64,{base64.b64encode(content).decode()}"
    payload = {"year": int(year), "url": data_url, "caption": caption or ""}
    return await _create("photos", payload)


@api.put("/photos/{item_id}")
async def edit_photo(item_id: str, payload: PhotoIn, _=Depends(require_admin)):
    return await _update("photos", item_id, payload.model_dump())


@api.delete("/photos/{item_id}")
async def remove_photo(item_id: str, _=Depends(require_admin)):
    return await _delete("photos", item_id)


# --- Contacts -------------------------------------------------------------
@api.get("/contacts")
async def list_contacts():
    return await _list("contacts", sort=[("created_at", 1)])


@api.post("/contacts")
async def add_contact(payload: ContactIn, _=Depends(require_admin)):
    return await _create("contacts", payload.model_dump())


@api.put("/contacts/{item_id}")
async def edit_contact(item_id: str, payload: ContactIn, _=Depends(require_admin)):
    return await _update("contacts", item_id, payload.model_dump())


@api.delete("/contacts/{item_id}")
async def remove_contact(item_id: str, _=Depends(require_admin)):
    return await _delete("contacts", item_id)


# --- Email Templates ------------------------------------------------------
@api.get("/emails")
async def list_emails():
    rows = await _list("emails")
    rows.sort(key=lambda r: r.get("order", 0))
    return rows


@api.post("/emails")
async def add_email(payload: EmailTemplateIn, _=Depends(require_admin)):
    return await _create("emails", payload.model_dump())


@api.put("/emails/{item_id}")
async def edit_email(item_id: str, payload: EmailTemplateIn, _=Depends(require_admin)):
    return await _update("emails", item_id, payload.model_dump())


@api.delete("/emails/{item_id}")
async def remove_email(item_id: str, _=Depends(require_admin)):
    return await _delete("emails", item_id)


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.winners.create_index([("year", -1)])

    # Seed admin
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_pw = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_pw),
            "name": "Co-Chair Admin",
            "role": ADMIN_ROLE,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(admin_pw, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_pw)}},
        )

    await seed_content(db)


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
