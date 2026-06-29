import json
import os
from datetime import datetime, timezone
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel

from .auth import create_token, verify_password, verify_token
from .claude_runner import ClaudeRunner

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(title="HPV Wiki Editor API", docs_url=None, redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WIKI_REPO_PATH = Path(os.environ.get("WIKI_REPO_PATH", Path(__file__).parent.parent.parent))
WIKI_DIR = WIKI_REPO_PATH / "wiki"


def _safe_path(rel: str) -> Path:
    """Resolve a relative path and ensure it stays inside WIKI_DIR."""
    base = WIKI_DIR.resolve()
    resolved = (WIKI_DIR / rel).resolve()
    if resolved != base and base not in resolved.parents:
        raise HTTPException(status_code=400, detail="Path traversal not allowed")
    return resolved


def _sanitize_name(name: str) -> str:
    """Keep names safe for use as an identifier: printable, single line,
    length-capped. Falls back to 'anonymous'."""
    cleaned = "".join(c for c in (name or "") if c.isprintable()).strip()
    return cleaned[:60] or "anonymous"


# Append-only audit trail of who edited what through the web editor. Kept out
# of wiki/ so it never mixes with the agent-curated log.md. Override the path
# with EDIT_LOG_PATH; defaults to web/edits.log next to the app.
EDIT_LOG_PATH = Path(
    os.environ.get("EDIT_LOG_PATH", Path(__file__).parent.parent / "edits.log")
)


def _log_edit(action: str, rel_path: str, name: str) -> bool:
    """Append one JSONL record (timestamp, editor, action, path) to the audit
    log. Best-effort: the file is already saved before this runs, so a logging
    failure must never fail the request. Returns True if the line was written.
    """
    record = {
        "ts": datetime.now(tz=timezone.utc).isoformat(timespec="seconds"),
        "name": _sanitize_name(name),
        "action": action,
        "path": "".join(c for c in rel_path if c.isprintable()).strip(),
    }
    try:
        EDIT_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        with EDIT_LOG_PATH.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(record, ensure_ascii=False) + "\n")
        return True
    except OSError:
        return False


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class LoginBody(BaseModel):
    password: str
    name: str = ""


@app.post("/api/auth/login")
def login(body: LoginBody):
    if not verify_password(body.password):
        raise HTTPException(status_code=401, detail="Wrong password")
    name = _sanitize_name(body.name)
    return {"token": create_token(name), "name": name}


# ---------------------------------------------------------------------------
# File tree
# ---------------------------------------------------------------------------

def _build_tree(path: Path, base: Path) -> dict:
    node: dict = {
        "name": path.name,
        "path": str(path.relative_to(base)),
        "type": "dir" if path.is_dir() else "file",
    }
    if path.is_dir():
        children = sorted(path.iterdir(), key=lambda p: (p.is_file(), p.name))
        node["children"] = [_build_tree(c, base) for c in children if not c.name.startswith(".")]
    return node


@app.get("/api/files")
def list_files(_t: str = Depends(verify_token)):
    if not WIKI_DIR.exists():
        return {"name": "wiki", "path": "", "type": "dir", "children": []}
    return _build_tree(WIKI_DIR, WIKI_DIR)


# ---------------------------------------------------------------------------
# File CRUD — changes write straight to the server's wiki files
# ---------------------------------------------------------------------------

@app.get("/api/files/{path:path}")
def get_file(path: str, _t: str = Depends(verify_token)):
    fp = _safe_path(path)
    if not fp.exists() or not fp.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    return {"path": path, "content": fp.read_text(encoding="utf-8")}


class FileSaveBody(BaseModel):
    content: str


@app.put("/api/files/{path:path}")
def update_file(path: str, body: FileSaveBody, editor: str = Depends(verify_token)):
    fp = _safe_path(path)
    existed = fp.exists()
    fp.parent.mkdir(parents=True, exist_ok=True)
    fp.write_text(body.content, encoding="utf-8")
    logged = _log_edit("update" if existed else "create", path, editor)
    return {"status": "saved", "logged": logged}


class FileCreateBody(BaseModel):
    path: str
    content: str = ""


@app.post("/api/files")
def create_file(body: FileCreateBody, editor: str = Depends(verify_token)):
    fp = _safe_path(body.path)
    if fp.exists():
        raise HTTPException(status_code=409, detail="File already exists")
    fp.parent.mkdir(parents=True, exist_ok=True)
    fp.write_text(body.content, encoding="utf-8")
    logged = _log_edit("create", body.path, editor)
    return {"status": "created", "logged": logged}


@app.delete("/api/files/{path:path}")
def delete_file(path: str, editor: str = Depends(verify_token)):
    fp = _safe_path(path)
    if not fp.exists():
        raise HTTPException(status_code=404, detail="File not found")
    fp.unlink()
    logged = _log_edit("delete", path, editor)
    return {"status": "deleted", "logged": logged}


# ---------------------------------------------------------------------------
# Claude streaming endpoint
# ---------------------------------------------------------------------------

class ClaudeBody(BaseModel):
    command: str   # query | ingest | lint | review
    input: str = ""


@app.post("/api/claude/stream")
async def claude_stream(body: ClaudeBody, _t: str = Depends(verify_token)):
    valid_commands = {"query", "ingest", "lint", "review"}
    if body.command not in valid_commands:
        raise HTTPException(status_code=400, detail=f"command must be one of {valid_commands}")

    runner = ClaudeRunner(WIKI_REPO_PATH)

    async def generate():
        try:
            async for chunk in runner.stream(body.command, body.input):
                yield f"data: {json.dumps({'text': chunk})}\n\n"
        except Exception as exc:  # noqa: BLE001
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ---------------------------------------------------------------------------
# Health + frontend
# ---------------------------------------------------------------------------

@app.get("/api/edits")
def edit_log(limit: int = 200, _t: str = Depends(verify_token)):
    """Return the most recent edit-audit records, newest first."""
    if not EDIT_LOG_PATH.exists():
        return {"edits": []}
    entries = []
    for raw in EDIT_LOG_PATH.read_text(encoding="utf-8").splitlines():
        raw = raw.strip()
        if not raw:
            continue
        try:
            entries.append(json.loads(raw))
        except json.JSONDecodeError:
            continue
    return {"edits": list(reversed(entries))[: max(1, min(limit, 1000))]}


@app.get("/api/health")
def health():
    return {"ok": True, "wiki_exists": WIKI_DIR.exists()}


_FRONTEND_DIR = Path(__file__).parent.parent / "frontend"


@app.get("/{full_path:path}")
def spa(full_path: str):
    """Serve frontend assets, and fall back to index.html for any other path so
    deep links like /conditions/warts.md open the app with that file routed."""
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not found")
    if full_path:
        candidate = (_FRONTEND_DIR / full_path).resolve()
        if candidate.is_file() and _FRONTEND_DIR.resolve() in candidate.parents:
            return FileResponse(candidate)
    return FileResponse(_FRONTEND_DIR / "index.html")
