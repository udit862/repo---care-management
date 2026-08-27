"""Care management API — internal use only."""
import logging

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from api.data import MEMBERS, STAFF

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="care-management")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _staff(token: str | None):
    if not token or token not in STAFF:
        raise HTTPException(status_code=401, detail="not authenticated")
    return STAFF[token]


@app.get("/api/members")
async def list_members(q: str = "", x_staff_token: str | None = Header(default=None)):
    """Search members by name or member id."""
    _staff(x_staff_token)
    needle = q.lower().strip()
    if not needle:
        return {"results": MEMBERS}
    out = [
        m for m in MEMBERS
        if needle in m["first_name"].lower()
        or needle in m["last_name"].lower()
        or needle in m["member_id"]
    ]
    return {"results": out}


@app.get("/api/members/{member_id}")
async def get_member(member_id: str, x_staff_token: str | None = Header(default=None)):
    """Full member record for the care view."""
    staff = _staff(x_staff_token)
    logger.info("member lookup by=%s member_id=%s", staff["name"], member_id)

    for m in MEMBERS:
        if m["member_id"] == member_id:
            return m
    raise HTTPException(status_code=404, detail="not found")


class NoteIn(BaseModel):
    member_id: str
    body: str


@app.post("/api/notes")
async def add_note(note: NoteIn, x_staff_token: str | None = Header(default=None)):
    """Append a care note."""
    staff = _staff(x_staff_token)
    for m in MEMBERS:
        if m["member_id"] == note.member_id:
            m["notes"] = m["notes"] + "\n" + note.body
            return {"ok": True}
    raise HTTPException(status_code=404, detail="not found")


class StatusIn(BaseModel):
    member_id: str
    status: str


@app.post("/api/status")
async def set_status(payload: StatusIn, x_staff_token: str | None = Header(default=None)):
    """Update outreach status."""
    _staff(x_staff_token)
    if payload.status not in ("ontrack", "attention", "overdue", "closed"):
        raise HTTPException(status_code=422, detail="bad status")
    for m in MEMBERS:
        if m["member_id"] == payload.member_id:
            m["status"] = payload.status
            return {"ok": True}
    raise HTTPException(status_code=404, detail="not found")
