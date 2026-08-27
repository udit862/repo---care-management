# Setup

Two things need to be running: the FastAPI backend on port 8000 and the Next.js
frontend on port 3000.

You'll need Python 3.10+ and Node 20.9+ (verified on 3.12 and Node 24).

## Backend

From the repo root — not from inside `api/`, since `main.py` imports
`from api.data import ...`:

```bash
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```

Leave it running. Docs are at http://127.0.0.1:8000/docs.

## Frontend

In a second terminal:

```bash
cd web
npm install
npm run dev
```

Then open http://localhost:3000, search for `vega`, open a member, change their
outreach status and save a note. Both writes should appear in the backend log.

## Auth

Every endpoint needs an `x-staff-token` header. The valid tokens are in
`api/data.py`:

- `tok-coach-akanksha` — Akanksha Dessai, health coach
- `tok-coach-ravi` — Ravi Menon, health coach
- `tok-billing-sam` — Sam Ortiz, billing

There's no login screen; the frontend hardcodes the first one in `web/lib/api.ts`.

To poke the API directly:

```bash
curl -H 'x-staff-token: tok-coach-akanksha' \
  'http://127.0.0.1:8000/api/members?q=vega'
```

## A few things worth knowing

**Nothing is persisted.** `api/data.py` is loaded into memory and mutated in
place, so restarting uvicorn wipes your notes and status changes back to the
three seed members. Handy when you want a clean slate. The records are
synthetic — please don't add real data.

**Pointing at a different backend:** copy `web/.env.local.example` to
`web/.env.local` and set `NEXT_PUBLIC_API`. Next only reads env files at
startup, so restart `npm run dev` afterwards.

**Other frontend commands:** `npm run build`, `npm run start`,
`npm run typecheck`.

## If something breaks

`ModuleNotFoundError: No module named 'api'` — you started uvicorn from inside
`api/`. Go back up to the repo root.

**The table is empty** — the backend probably isn't running, or isn't on 8000.
Check the browser console for a failed request; the fetch wrappers don't show
errors in the UI.

**Port in use** — run uvicorn on `--port 8001` and point the frontend at it with
`NEXT_PUBLIC_API`, or use `npm run dev -- -p 3001`.
