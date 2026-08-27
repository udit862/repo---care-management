# What's wrong, ordered by severity

Ordering rule: at the same tier, a screen that shows something false beats one that
shows nothing — coaches act on what they see and can't detect the lie.

## PHI exposure / auditor flags

1. **Search returns the full clinical record for every match.** `list_members` returned
   the whole member dict (MRN, DOB, diagnosis, meds, insurance, notes) when the table
   renders 5 fields — and an empty query dumps the entire member base, which the search
   page requests on mount. Token is hardcoded in the JS bundle, CORS is `*`, and there's
   no role check (billing can read diagnoses). A working breach path today, one curl away.
   *Assumption: the hardcoded token is scaffolding ("comes from the session" comment) —
   but a session replaces the token, it doesn't shrink the payload.*

2. **Audit trail is wrong, not just missing.** Writes were never logged, every action is
   attributed to Akanksha (one hardcoded token), and notes had no author or timestamp.
   Close call with #1 — falsified records vs. bigger exposure surface; picked #1 first on
   blast radius. *Assumption: note authorship is (or will be) a compliance requirement.*

3. **PHI in URLs.** Member links carried name + DOB as query params → browser history,
   proxy logs, screen-shares. Smaller leak than #1, but into places the app can't control.

## A coach making a wrong decision

4. **Member page identity is spoofable.** Header name and DOB rendered from URL params,
   everything else from the fetched record — a stale/mistyped URL shows one member's
   identity over another's chart. DOB is what a coach verifies identity with on a call.
   Repro: `/member?id=88215&name=Marisol+Vega&dob=2013-04-12`.

5. **Writes lie about success and destroy the coach's note.** Status change never checked
   the response; note save fired `alert("Note saved")` before the request resolved and
   cleared the textarea. No `res.ok` checks anywhere. Fires on every backend hiccup —
   close call with #4 (frequency vs. blast radius), kept #4 first.

6. **Full-name search finds nobody** (verified by running it: `vega` → 1, `marisol vega`
   → 0). Coach types a full name mid-call, sees zero rows, concludes the member isn't
   enrolled. Query also wasn't URL-encoded (`&`, `+` corrupt the request).

7. **Stale search results.** Fetch per keystroke, no debounce/abort — out-of-order
   responses can show results for a query the coach is no longer looking at.

8. **Safety data buried.** Allergies/meds behind a toggle, pain score shown without its
   date, a 13-year-old with nothing marking her as a minor, status = colour-only dot
   (red vs. orange, worst pair for colour-blindness). Omission, not falsehood — but at
   30 members/day on the phone it makes the wrong decision the default.

## Data loss / silent no-save

9. Mostly #5's second half (textarea cleared on a false success). Also: restart wipes all
   writes (deliberate — see left-alone doc) and concurrent edits are last-write-wins
   with no warning (real, but versioning work that doesn't fit the time box — listed, not fixed).

## Someone unable to do their job

10. **Any API failure white-screens the search page.** Errors made `searchMembers` return
    `undefined` → `rows.map` throws, no message. Loud rather than misleading, so it sits
    below the quiet failures above.

## Engineering drag

11. `any` types and no shared Member type; zero tests; no error layer in `lib/api.ts`
    (every fix pays for it first); `PROGRAMME_BLURB` keyed on exact strings (new
    programme → silent blank); no pagination (compounds #1 at real volume); `<a href>`
    back link that reloads and loses search state.

---

**Fixes chosen from this ordering:** (A) search returns only what search renders +
member page trusts only the fetched record — kills the worst of #1, all of #3/#4, and
#6. (B) writes tell the truth — await, revert on failure, keep the text, stamp and log
server-side — kills #5, the write half of #2, and builds the error layer #10 needs.
Details in [02-fixes.md](02-fixes.md).
