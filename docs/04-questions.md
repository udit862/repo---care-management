# What I'd ask you

Things the code can't tell me, each with what the answer would change:

1. **Where does staff identity really come from, and when?** Is there an SSO/session
   plan with a date, or is the header token the plan? Decides whether #1's credential
   half is a fire to fight now or a known gap with an owner.

2. **Why is there a billing role in `STAFF`?** Who besides coaches uses this tool, and
   what should billing see? Decides whether missing role checks are a tier-1 finding
   or by-design, and what an allowlist per role should look like.

3. **Real volumes — total members, and members per coach?** At 3 seed records the
   empty-query dump is cosmetic; at 50k members it's the whole company's PHI on every
   page load, and pagination jumps several places up the list.

4. **What are the compliance requirements on notes — attribution, immutability,
   retention? Is this deployment in HIPAA scope?** If notes must be immutable, my
   append-with-stamp fix is a stopgap and the real answer is an append-only notes
   table. Also decides whether the audit-trail finding outranks the exposure one.

5. **Is the programme blurb on the care view deliberate?** Do coaches read it aloud on
   calls, or is it inherited from a member-facing page? Decides leave-alone vs. remove.

6. **What does `closed` mean operationally?** Is an accidental close reversible, does
   anything downstream trigger on it, and should the status control confirm before
   applying? Decides whether that dropdown needs friction.

7. **How is this deployed — TLS, network boundary, and how many uvicorn workers?**
   More than one worker means the in-memory store already serves different data per
   request, which would rocket that "scaffolding" straight to the top of the list.
