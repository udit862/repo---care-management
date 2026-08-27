# What I deliberately left alone

**The in-memory store that resets on restart.** On its face it's a data-loss bug -
every note and status change vanishes when uvicorn restarts. But `set-up.md` frames it
as intended: "Handy when you want a clean slate." That's the repo telling me it's demo
scaffolding, not a defect. Wiring in SQLite would spend scarce time "fixing" something
built on purpose, and would signal I couldn't tell the rig from the product. Assumption:
production sits on a real database and the reset is tooling.

Two runners-up, different reasons:

- **The marketing blurb on the member page** (`PROGRAMME_BLURB`). It pushes clinical
  content down, so it looks like a bug - but coaches might read it aloud as a call
  script, or it may be contractual copy. The code can't tell me, so it became a
  question (see [04-questions.md](04-questions.md)) instead of a deletion.
- **Concurrent-edit overwrites** (two coaches, last write wins). Not deliberate - just
  too big to fix responsibly in the time given. Proper conflict handling means
  versioning across API and UI; a half-fix adds complexity without safety. Named and
  deferred; first thing I'd size properly with more time.

One thing that is *not* a valid leave-alone: the hardcoded token. The comment says a
session will replace it, so skipping the token itself is fine - but that comment
doesn't excuse the full-record response or the missing role check, which is why those
stayed in the findings and one of them got fixed.
