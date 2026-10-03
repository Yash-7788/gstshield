# GSTShield internal website

The user authorized building the internal application on 2026-10-03. The landing page and final design will be supplied separately later. This directory currently has documentation only; Phase 8 creates the working screen structure and selected frontend stack, and Phase 9 verifies its real backend connection.

The canonical [14-phase plan](../md/05_BUILD_AND_VERIFICATION_PLAN.md) governs completion. Backend Phases 1–7 are complete and locally verified. Phase 8 begins with the authorized internal application.

| Phase | Scope | Gate |
|---|---|---|
| 8 | Internal access/context, imports, preview/mapping, jobs, runs/results, review, cases, actions/follow-up/reminders, proposals and reports | Locked clean build, actual screens, keyboard/mobile behavior and backend contract alignment |
| 9 | Real local backend connection for every available operation | Real sign-in-to-report and all six business scenarios, reload/logout/scope/stale/error/retry checks |
| 10 | Focused browser privacy/security review | Untrusted text, credential/bundle/storage inspection and access denial |
| 12 | Measured browser speed/usability | Bounded requests/tables, preserved state and measured improvements |
| 13 | Conditional real WhatsApp | Actual account/callback/phone proof |
| 14 | Combined rehearsal | Fresh-context/restart/failure scenarios and honest capability ledger |

Basic safe text rendering, in-memory session state, scoped requests, duplicate-submit prevention, bounded lists and accessible labels apply from the first screen. No backend/provider secret belongs in frontend environment settings or browser storage. Financial values remain exact strings. Existing workflows produce review decisions and user-recorded observations; they do not execute government filings, payments or guaranteed recovery.

Phase 7 is pushed first; Phase 8 is built, checked and pushed next; Phase 9 is completed and checked next. Run the full backend regression plus frontend/browser checks after Phase 9, with focused checks after each phase.
