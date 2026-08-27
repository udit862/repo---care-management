# The two fixes

Full diff in `care-management-fixes.diff`. Both fixes span API + frontend.

## Fix A — minimum-necessary search + identity from the record

One idea: the search screen gets only what it renders, and the member page trusts
only the record it fetched.

- `api/main.py`: search results now go through an allowlist
  (`SEARCH_FIELDS = member_id, first_name, last_name, programme, coach, status`) in
  both branches, including empty `q`. Allowlist, not blocklist, so any field added to
  `data.py` later stays private by default. `get_member` untouched — the care view
  legitimately needs the full record and that endpoint logs the access.
- Same function: search is now token-based, so `marisol vega` matches (every
  whitespace-separated word must match a field). `vega` still works.
- `web/pages/index.tsx`: member links carry only the id — no name/DOB in URLs.
- `web/pages/member.tsx`: header name and DOB render from the fetched record; the URL
  contributes nothing but the id, so a tampered URL can't put one member's identity
  over another's chart.
- `web/lib/api.ts`: query is `encodeURIComponent`-ed.

Kills findings #1 (response half), #3, #4, #6.

## Fix B — writes that tell the truth

One idea: the UI never claims a write succeeded until the server said so, and never
destroys what the coach typed.

- `web/lib/api.ts`: single `request()` helper, throws on `!res.ok` — all four
  wrappers go through it.
- `web/pages/member.tsx`: status change awaits the POST and reverts the select on
  failure with an inline error. Note save awaits, shows the saved note immediately
  (server returns the updated record), clears the textarea only after confirmed
  success, and on failure keeps the text with "your text is still below". Dropped the
  `alert()`. Empty/whitespace notes no longer fire a request.
- `api/main.py`: notes are stamped `YYYY-MM-DD — Staff Name: body`; both writes are
  logged (`note added by=…`, `status change by=…`); both endpoints return the updated
  record so the UI can render truth without a second round-trip.
- `web/pages/index.tsx`: search errors now show "Couldn't reach the server." instead
  of white-screening.

Kills #5, the write half of #2, and the worst of #10.

## How I verified (ran everything before sending)

- `curl` on `/api/members` (empty and non-empty `q`): exactly the 6 summary fields,
  no mrn/diagnosis/meds/insurance/notes/dob anywhere. `?q=marisol vega` → Marisol,
  `?q=marisol daniel` → nothing.
- Click-through: search `vega`, open Marisol — URL is `/member?id=88301` only.
  Hand-edited to `?id=88215` → Daniel's fetched name and DOB, nothing from the URL.
- Typed `a&b` in the search box → request stays well-formed (`q=a%26b`, 200).
- Killed uvicorn mid-session: status select snaps back with an inline error; a failed
  note save leaves the text in the textarea; after restart the same save succeeds.
- Happy path: saved note appears immediately stamped `2026-08-27 — Akanksha Dessai: …`
  and both writes show in the backend log. Status survives reload.
- `pytest api/test_main.py -v` → 3 passed on fixed code, 2 of 3 fail on the original
  (see [06-test.md](06-test.md)). `npm run typecheck` → clean.

## Deliberately out of scope for these diffs

No RBAC/token redesign/CORS tightening (needs answers to the questions doc — guessing
an auth model here would be security theater), no pagination (3 seed members), no
debounce/abort for the search race (#7), no toast/react-query/retry machinery — the
repo's idiom is plain `useState` and inline styles, and I matched it.
