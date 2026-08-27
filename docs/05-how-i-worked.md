# How I worked

I used Claude Code throughout, kept a running log as I went, and split the work
deliberately: judgment mine, mechanics delegated.

**What I did myself:** read the code end to end, the severity ordering and its
trade-off calls (#1 vs #2, #4 vs #5), the choice of the two fixes, the exact
`SEARCH_FIELDS` allowlist (that list *is* the security decision), the note-stamp
format (it becomes part of a clinical record), the leave-alone call, the questions,
and this write-up.

**What I delegated:** the mechanical diffs to my specs (allowlist plumbing, the
`request()` helper, the await/revert handlers), scaffolding the test file, and
verification legwork — curl checks, the kill-the-backend and tamper-URL runs,
typecheck, and reproducing findings before I staked the ordering on them (e.g.
proving `marisol vega` actually returns zero results).

**Where it was right:** the diffs to spec were clean and matched the repo's idiom,
and having it execute repros was faster and more reliable than eyeballing — the
full-name-search and empty-query-dump claims in my findings are run, not read.

**Where it was wrong or generic, and how I knew:**

- It flagged the `name` URL param as an XSS risk. Wrong — React escapes text
  children. The real bug there is worse and different: the page vouching for an
  identity the record doesn't back (#4). I knew because I know React's rendering
  model; "user input in the page" pattern-matched to XSS without checking the sink.
- Mid-fix it proposed restructuring notes into a list of objects. Right direction,
  wrong moment — it breaks the existing one-string render and turns a surgical fix
  into a migration. Rejected; noted as future work instead.
- Steady scope-creep pressure: a Pydantic response-model refactor, a role system,
  pagination, toast libraries, react-query. All plausible-sounding, all wrong for a
  dependency-free repo and a 3-hour box. Each diff shipped touching only the files
  the fix needed.
- On tests, the known failure mode is a suite that passes on both the broken and
  fixed code, so I verified red→green by actually running the tests against the
  original: 2 of 3 fail there, all pass after the fix.
