# HPV Wiki Editor

A small web app for reading, editing, and querying the wiki. Clean light theme, modeled on Quartz.

---

## Installing & running

### Requirements

- **Python 3.10+** on the server (`start.sh` auto-selects the newest available `python3.x`).
- **Claude Code** installed and authenticated as the user that runs the app — used for the
  `query` / `ingest` / `lint` / `review` commands. Run `claude login` once; credentials live in
  `~/.claude/` and are picked up automatically. **No API key needed.**
- A clone of this repo on the server (the app edits the `wiki/` folder next to it).

### 1. Configure

From the `web/` directory, copy the example env file and fill it in:

```bash
cd web
cp .env.example .env
```

Edit `.env` — at minimum set:

| Variable | What it is |
|----------|------------|
| `WIKI_PASSWORD` | The single shared password everyone signs in with. |
| `JWT_SECRET` | Secret for signing sessions. Generate one: `python3 -c "import secrets; print(secrets.token_hex(32))"` |
| `WIKI_REPO_PATH` | Absolute path to the `wiki-hpv` repo on this server. |

Optional: `CORS_ORIGINS`, `JWT_EXPIRY_HOURS`, `EDIT_LOG_PATH` (see `.env.example`).

### 2. Run

```bash
bash start.sh
```

`start.sh` creates a virtualenv in `web/venv/`, installs `requirements.txt`, loads `.env`, and starts
the server. By default it binds `0.0.0.0:8000` — override with `BIND_HOST` / `BIND_PORT`:

```bash
BIND_PORT=9000 bash start.sh
```

Then open `http://YOUR_HOST:8000`. The backend serves the frontend and the API from the same port, so
there's nothing else to start.

> **Note:** the server does not auto-reload. After changing backend code or `.env`, stop it
> (`Ctrl-C`) and re-run `start.sh` to pick up the changes.

### 3. Put it behind nginx (production)

Run the app on localhost and reverse-proxy to it. The Ask/command endpoints stream via SSE, so
disable proxy buffering.

**At the domain root** (e.g. `https://wiki.example.org/`):

```nginx
location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Required for the streaming (SSE) endpoints
    proxy_buffering    off;
    proxy_read_timeout 300s;
    add_header         X-Accel-Buffering no;
}
```

**Under a sub-path** (e.g. `https://host/chathpv/wiki/`) — two things must line up:

1. The `proxy_pass` URL **ends with `/`** so nginx strips the prefix before the app sees it.
2. **`BASE_PATH` in `.env` matches the location** (`BASE_PATH=/chathpv/wiki`). The app injects this
   into `<base href>` so the browser loads `style.css`, `app.js`, the API, and page links from under
   the sub-path instead of the domain root. Without it, only the bare HTML loads (no styling/JS).

```nginx
location /chathpv/wiki/ {
    proxy_pass http://127.0.0.1:8000/;   # the trailing / strips the prefix
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_buffering    off;
    proxy_read_timeout 300s;
    add_header         X-Accel-Buffering no;
}
```

`start.sh` already passes `--proxy-headers --forwarded-allow-ips "*"`, so the app trusts nginx's
`X-Forwarded-*` headers. Add TLS (e.g. with certbot) and consider setting `CORS_ORIGINS` to your real
origin instead of `*`.

To keep it running across reboots, wrap `start.sh` in a systemd unit or run it under `tmux`/`screen`.

---

## Signing in

Open the editor URL and enter **your name** and the **shared password**. Your name is recorded on
every edit you save (see *How saving works*), so use a real, recognizable one. Your session lasts 24
hours. The same password protects every action, including the API (below).

---

## What you can do in the browser

**Home** — the landing view. A short "how it works" card and a starting point.

**Explorer** — browse the `wiki/` file tree on the left.
- Click a file to open it. Every file has its own shareable URL (e.g. `/conditions/warts.md`).
- **Write / Preview** tabs switch between markdown source and rendered output. Internal
  `[[wikilinks]]` and links between pages are clickable in Preview.
- **Save** writes your change straight to the wiki file on the server.
- **Delete** removes the file.
- **＋** creates a new file, pre-filled with the standard frontmatter and the not-medical-advice banner.

**Ask the wiki** (left nav) — type a question and get an answer grounded in the wiki, with evidence
tiers (T1–T4) cited. This is a synthesis of sources, not medical advice.

---

## How saving works

Saving (and creating or deleting) writes **directly to the wiki files on the server** — there's no
review step or pull request. Changes take effect immediately. Keep the editor behind the shared
password and trust the people you give it to.

**Every edit is recorded** in an append-only audit trail, attributed to the name you signed in with —
so the team can see who changed what. Each save, create, and delete appends one JSON line to
`edits.log` (next to the app, or wherever `EDIT_LOG_PATH` points):

```json
{"ts": "2026-06-29T06:53:41+00:00", "name": "Dr. Alice Smith", "action": "update", "path": "conditions/warts.md"}
```

This file lives outside the wiki content, so it never mixes with the maintainer's `log.md`. View the
recent trail through the API:

```bash
curl -s https://YOUR_HOST/api/edits -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

Logging is best-effort: the file is always saved first, so even if the trail can't be written the
edit still goes through.

---

## Running the maintenance commands (API only)

`query` is the only command in the browser. The heavier maintenance commands — **ingest**, **lint**,
**review** — run through the API so they stay deliberate. They use the same password.

**1. Get a token:**

```bash
TOKEN=$(curl -s -X POST https://YOUR_HOST/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"password":"YOUR_PASSWORD"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])')
```

**2. Run a command** (output streams back as server-sent events):

```bash
# Ingest a source you added under raw/
curl -N -X POST https://YOUR_HOST/api/claude/stream \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"command":"ingest","input":"raw/research-papers/your-source.md"}'

# Lint the whole wiki
curl -N -X POST https://YOUR_HOST/api/claude/stream \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"command":"lint","input":""}'
```

Valid `command` values: `query`, `ingest`, `lint`, `review`. See [../CLAUDE.md](../CLAUDE.md) for what
each one does and the evidence-tier rules they follow.

---

## Evidence tiers (reminder)

Every substantive claim carries a tier marker:

| Marker | Source type |
|--------|-------------|
| `` `[T1]` `` | Clinical guidelines, systematic reviews (CDC, WHO, ACS, ACOG…) |
| `` `[T2]` `` | Primary research (RCTs, cohort studies) |
| `` `[T3]` `` | Expert/editorial, patient education |
| `` `[T4]` `` | Patient-reported, anecdotal (Reddit, forums) |

Patient-reported (T4) claims are never stated as fact. When tiers conflict, add a
`> [!warning] Tier conflict` block and defer to the higher tier.
