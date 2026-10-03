# GST-Shield — build sequence, verification and hackathon readiness

> **Active PC-only scope (2026-10-03):** Run the website backend on the local PC. No Render, cloud server, external database, ORM or cloud-storage service. Phase 1 provides the HTTP/configuration foundation only. Phase 2 will persist data in a local SQLite file under backend/data. The phase plan in [05](05_BUILD_AND_VERIFICATION_PLAN.md) and [backend README](../backend/README.md) overrides the older cloud, managed-auth and temporary-memory proposals below. Local storage does not remove access checks or callback signature requirements.

## Active implementation phase plan

Read before coding: product scope (01), installed stack/configuration (02), backend/data behavior (03), website/WhatsApp connection (04), this plan (05), security/privacy (06), GST evidence boundaries (07), and API alignment (08). The original report/review and Engineering Headstart remain supporting context.

Latest user decisions: local PC execution and local PC storage; proceed one phase at a time; review each phase before starting the next; expand the full application plan with dedicated frontend improvement/connection/security/smoothness and backend security/performance phases. Do not create hosting infrastructure or external databases. Do not replace the supplied website before receiving it. The phase order is a dependency order, not a ranking of importance.

## Expanded application phase map

The active plan now contains **13 phases**. Phase 1 remains complete; Phases 2–13 are not started. Frontend work uses the user's supplied website once it is available. Every phase has its own deliverables and a correctness/security/edge-case review gate.

| Phase | Work | Area | Status |
|---|---|---|---|
| 1 | Local runtime and HTTP foundation | Backend | Complete |
| 2 | Local storage and private access | Backend | Not started |
| 3 | File imports, checking and confirmation | Backend | Not started |
| 4 | GST reconciliation and human review | Backend | Not started |
| 5 | Backend reports, cases and evidence workflow | Backend | Not started |
| 6 | Backend security and failure review | Backend | Not started |
| 7 | Frontend inspection, cleanup and complete screens | Frontend | Not started |
| 8 | Frontend and backend connection | Both | Not started |
| 9 | Frontend security and privacy review | Frontend | Not started |
| 10 | Backend performance and resource efficiency | Backend | Not started |
| 11 | Frontend smoothness, speed and usability | Frontend | Not started |
| 12 | WhatsApp connection and channel review | Both | Not started |
| 13 | Whole-application regression and hackathon rehearsal | Both | Not started |

The sequence is a dependency order, not a ranking of importance. Security and responsiveness are part of feature implementation from the start; Phases 6, 9, 10 and 11 are focused reviews of working code. Do not postpone essential safeguards or fixable blocking behavior to those later reviews.

### Phase 1 — local runtime and HTTP foundation (complete)

Deliverables:

- Reproducible Python 3.13 environment, minimal required dependencies and a committed lockfile.
- A single local launch command using the actual validated HOST/PORT/logging configuration.
- Complete, checked-in environment example aligned with every setting the loader recognizes.
- Fail-fast validation: strict booleans, positive bounds, finite exact decimals, cross-field constraints, single worker and local origins/paths.
- Public liveness and readiness endpoints with the agreed data/meta envelope.
- Consistent expected HTTP, validation and unexpected-error envelopes without private inputs or traces.
- Local Host/Origin restrictions, request IDs, security/no-store headers and CORS covering server errors.
- No uploads, customer data, authentication bypass, SQLite schema, provider requests or placeholder feature routes.

Review gate:

1. Install from the frozen lock and import/run the application on the local PC.
2. Test invalid config, template/loader drift, secret redaction and environment precedence.
3. Test real ASGI request handling: healthy startup/shutdown, unknown routes, method failures, validation failures and unexpected exceptions.
4. Verify local origin/Host controls, preflight behavior and CORS/security headers on errors.
5. Run lint, formatting, syntax compilation, regression tests and a real loopback HTTP smoke check.
6. Record what is implemented and what remains a future setting or feature. Readiness must not claim a database check before persistence exists.

Completed locally on 2026-10-03: 78 tests passed, including real local process/socket startup; Ruff lint/format, syntax compilation and frozen dependency installation passed. Configuration coercion, malformed dotenv handling, API port alignment and exception-log redaction defects found during review were fixed and covered by regressions. See the [verification record](../backend/README.md#phase-1-verification-record). GitHub workflow results are separate from this local proof. Phase 2 remains unstarted and is deferred until the next user-directed work session.

### Phase 2 — Local storage and private access (not started)

Owner: backend. Outcome: Store data and establish private access on the PC before any document-handling route is opened.

Deliverables:

- Use Python's built-in SQLite driver and one database file under backend/data; no external database service, ORM, Redis or hosted identity dependency.
- Design the initial tables and relationships from the shared resource contracts: sessions/identities, workspaces, registrations, resource ownership and version metadata. Define how later feature tables extend this baseline.
- Choose and document a simple local-demo sign-in/session mechanism, including bootstrap, expiry, logout and recovery. An unapproved browser origin, loopback address or DEMO_MODE flag must never grant private access.
- Use atomic transactions, parameterized SQL and foreign-key checks. Store financial amounts in an exact representation, with ownership checks in every applicable lookup.
- Keep database/source/artifact paths inside the private data directory; do not use uploaded filenames as filesystem paths. Define retained-data and disk-space limits before writes.
- Define backup, restore and corruption handling. Refuse unsafe or incompatible storage rather than silently creating a replacement empty database.
- Make readiness reflect the initialized local storage when this phase is implemented. Keep provider calls out of readiness checks.
- Document what survives restart, what expires, how users recover access, and how future schema versions are handled without losing existing files.

Review gate:

1. Prove retained data with an actual process restart and a backup/restore round-trip.
2. Use two independent identities/scopes and prove that changing IDs cannot expose the other's resources.
3. Exercise rollback, duplicate creates, invalid ownership relationships, expired/revoked sessions and refused unauthorized writes.
4. Check outside-directory paths, unavailable/corrupt storage, exhausted quotas and failed startup without exposing private data.
5. Record the chosen access/storage contracts for the frontend handoff; no private routes before these checks pass.

### Phase 3 — File imports, checking and confirmation (not started)

Owner: backend. Outcome: Turn supported documents into checked, reviewable inputs without treating unsupported or partial data as a successful import.

Deliverables:

- Add only the parser libraries required for CSV/XLSX purchase inputs and explicitly labeled canonical-demo portal JSON.
- Enforce bytes, rows, columns, cell lengths, nesting depth, archive entry count and decompressed size at the actual reading/parsing boundaries.
- Inspect supported content and encoding; reject malformed archives, unsupported layouts and unsafe spreadsheet content according to the import policy.
- Preserve exact monetary values, source context, row numbers and unknown tax components. Do not convert an absent value to an invented zero.
- Implement mapping preview, rejected-row explanations, accepted/rejected counts and explicit confirmation when an import is partial.
- Hash source bytes and define duplicate/retry behavior without confusing identical filenames with identical content.
- Use bounded processing and truthful job states; keep health/status requests responsive during parsing. Handle interrupted jobs on restart explicitly.
- Persist checked imports and their ownership/context. Neither an upload nor a parser exception may leave a silently confirmed partial import.

Review gate:

1. Run independently prepared valid, malformed, ambiguous and unsupported fixtures.
2. Check byte limits including streamed uploads, oversized expansion, excessive rows/cells, unusual encodings and spreadsheet formulas.
3. Prove that a retry does not create duplicate confirmed data and an interrupted operation does not announce success.
4. Compare preview/confirmation counts with persisted rows, including errors and unknown tax components.
5. Measure parsing time and memory for the demo and maximum supported input sizes; record the initial baseline for Phase 10.

### Phase 4 — GST reconciliation and human review (not started)

Owner: backend. Outcome: Produce explainable matching results and exact totals, with an explicit human decision for suggestions and ambiguity.

Deliverables:

- Implement exact matching gates using registration, period, invoice identity, dates and the selected monetary policy.
- Detect duplicates on both sides before assignment. Keep fuzzy candidates separate from accepted exact matches.
- Handle tied/competing candidates and unique assignment so one source row cannot be counted as matching several rows.
- Preserve missing fields and evidence limitations; do not describe a similarity score as a probability or legal approval.
- Keep monetary calculations exact and derive counts/totals from committed classifications rather than scattered route-specific calculations.
- Persist source IDs, matching policy version, run versions and review history so a result can be reproduced and explained.
- Use expected-version checks for review actions; reject stale decisions and make repeated operations safe.
- Expose paginated/filterable results and truthful job progress suitable for the website and later WhatsApp use.

Review gate:

1. Compare against independently calculated golden results rather than accepting the engine's own output as the expected answer.
2. Cover paise boundaries, missing values, duplicate invoices on either side, ties, competing candidates and shuffled input order.
3. Prove no double counting and agreement between the result list, category counts and financial summary.
4. Check concurrent/stale review decisions, retries and restart-visible run state.
5. Record matching timings and candidate counts at demo/maximum sizes without weakening correctness gates to get faster results.

### Phase 5 — Backend reports, cases and evidence workflow (not started)

Owner: backend. Outcome: Finish the website-facing backend feature set for evidence, follow-up and downloadable reports.

Deliverables:

- Implement the bounded case/evidence timeline and proposal workflow already specified in the planning pack; preserve ownership, versions and audit history.
- Generate reports from the committed run and review state, including source context, sample-evidence labels and uncertainty.
- Support safe report/export text and filenames. Treat source/vendor text as untrusted content in report generation and spreadsheet-compatible exports.
- Keep generated files private and downloadable only through the selected authorized download flow.
- Store artifact status, versions and hashes so a failed generation cannot be shown as a ready download.
- Define repeated report requests, expiry, retention and cleanup behavior without deleting unrelated user files.
- Expose the completed backend operations through the shared contract, including errors and job state used by the website.
- Keep payment/proposal exports clearly labeled; producing a report or proposal never executes a payment or establishes legal eligibility.

Review gate:

1. Compare report figures and evidence against the committed result summary after a human review changes it.
2. Test denied cross-scope downloads, stale/expired downloads, unavailable artifacts and safe user-controlled text.
3. Exercise repeated generation, interrupted writes, cleanup and restart behavior.
4. Open generated artifacts and check layout/readability as well as content; empty or corrupted output must not pass.
5. Confirm the required backend feature checklist is complete before focused backend security review begins.

### Phase 6 — Backend security and failure review (not started)

Owner: backend. Outcome: Review the working backend as a whole for access loopholes, malformed inputs and recovery failures.

Deliverables:

- Map every implemented route and file operation to its required identity, ownership, state and limits; review real code paths rather than only checklists.
- Verify sign-in/session expiry/revocation, role or scope restrictions, download controls and changing resource IDs.
- Review SQL parameters, safe file paths, upload parsing bounds, generated exports and every private-data logging path.
- Check allowed website origins and the selected session mechanism together; add request-forgery protections appropriate to that mechanism.
- Exercise repeated requests, concurrent operations, stale versions, duplicate job creation and inconsistent source contexts.
- Verify failures on full/unavailable disk, interrupted processing and restart without silent success, data loss or unintended replay.
- Review actual locked dependencies for known applicable issues; change a dependency only with compatibility and regression evidence.
- Fix causes and add focused regressions. Keep this a bounded hackathon review with a written list of accepted limitations.

Review gate:

1. Demonstrate denied access with two scopes and deliberately altered IDs/session state.
2. Run malicious/malformed file cases and prove limits apply before unsafe allocation or processing.
3. Confirm responses, logs and public diagnostics reveal no credentials, document contents or private ownership details.
4. Rerun affected correctness/import/report regressions after security fixes.
5. Record findings, fixes and remaining restrictions; passing this phase is evidence for the implemented backend scope.

### Phase 7 — Frontend inspection, cleanup and complete screens (not started)

Owner: frontend. Outcome: Turn the user's supplied website into a coherent interface ready for real backend connection.

Deliverables:

- Requires the supplied website. Inspect its actual framework, package manager, lockfile, build scripts, routes, assets and current mock data before choosing any frontend dependency.
- Preserve the supplied visual design and record missing screens, dead buttons, broken routes and inconsistent field names.
- Complete the required screens: private access/context selection, imports, mapping/confirmation, job progress, results, review, cases and reports.
- Make empty, loading, error, expired-session and unavailable-feature states explicit. Label any temporary sample/mock state clearly during this phase.
- Use consistent navigation, spacing, typography, tables, forms, feedback and mobile/desktop layouts.
- Add basic keyboard support, visible focus, usable labels and readable financial text; confirmations must distinguish a run, a review, a report and a reset.
- Keep one source for shared UI types/formatting and prepare a screen-to-operation map against document 08.
- Apply safe text rendering and keep credentials out of frontend code from the start. A later security phase does not authorize insecure placeholders.

Review gate:

1. Run the supplied project's clean install/build using its lockfile and inspect every required screen.
2. Exercise navigation, back/forward behavior, keyboard controls, resizing and mobile layouts.
3. Document every remaining simulated operation; a mock reply cannot count as connected functionality.
4. Check that money/context/status labels align with backend meanings and unavailable actions cannot appear successful.
5. Record the inspected stack and frontend environment example without publishing backend secrets.

### Phase 8 — Frontend and backend connection (not started)

Owner: both. Outcome: Make each website action use the real local backend and display the same persisted truth.

Deliverables:

- Implement one API client using the actual frontend framework and the access contract settled in Phase 2.
- Align fields, routes, enums, exact monetary strings, date/period formats, pagination and error shapes with document 08 and the implemented backend.
- Replace mock operations incrementally with real private access, upload, preview/confirmation, run, progress, review, cases, reports and downloads.
- Keep state scoped to the active identity/workspace/registration/period; clear private state when logging out or switching scope.
- Handle expired access, version conflicts, invalid input, unavailable backend and interrupted requests with actionable recovery.
- Prevent duplicate mutations from double clicks/retries using the backend's operation rules. Do not treat an uncertain request as proof it failed.
- Cancel or ignore obsolete requests after context changes; an old reply must not overwrite newer selected-context data.
- Configure the actual local website/API addresses and browser permissions together. Keep large result lists bounded and poll only relevant active work.

Review gate:

1. Complete a real sign-in-to-import-to-review-to-report journey without replacing replies with samples.
2. Compare displayed counts, money and report figures with the same backend run after a review change.
3. Exercise browser refresh, backend restart, logout, context switching and a delayed reply from an old context.
4. Check double submissions, failed requests, expired sessions, stale reviews and recovery without duplicate work.
5. Verify the website build and generated/shared types agree with the backend contract.

### Phase 9 — Frontend security and privacy review (not started)

Owner: frontend. Outcome: Review the actual browser application and its connection for data exposure and unsafe user-controlled content.

Deliverables:

- Review every place that displays imported text, filenames, supplier names, backend errors and report links; render untrusted values safely.
- Avoid putting untrusted content into executable HTML/script contexts. Inspect any rich-text rendering rather than assuming a framework makes all uses safe.
- Check frontend bundles, public environment variables, logs and storage for privileged backend/provider credentials and private document data.
- Verify logout, expired access and scope changes clear private screen/cache state. UI hiding alone must never authorize or deny a backend operation.
- Review the chosen session storage/cookie mechanism with backend authorization; verify request-forgery protections where applicable.
- Restrict navigation/download URLs and avoid placing secrets or private records in query strings, public telemetry or copied debug output.
- Check browser framing/content policies appropriate to the actual website build; test them against real functionality instead of breaking the supplied site with guessed settings.
- Add focused browser regressions for the concrete exposure paths found, retaining the backend enforcement of all private actions.

Review gate:

1. Put script-like text into representative imported fields and prove it stays harmless display text.
2. Attempt private routes/actions after logout or expiry and after switching identity/workspace.
3. Inspect the built website and browser storage/network output for leaked privileged credentials.
4. Exercise cross-site request attempts appropriate to the selected session mechanism and verify backend rejection.
5. Confirm security changes preserve real uploads, reviews, navigation and authorized downloads.

### Phase 10 — Backend performance and resource efficiency (not started)

Owner: backend. Outcome: Measure and improve the real local workload while preserving exact results and bounded resource use.

Deliverables:

- Use the actual demo PC and fixed synthetic datasets; record input size, backend commit, runtime, database size and test conditions.
- Measure upload/parse, matching, summary queries, review writes and report generation separately; include health/status responsiveness during work.
- Compare the 100-row demo with the supported maximum (currently 2,000 rows per source), repeated runs and competing requests within configured limits.
- Identify actual slow queries, excessive candidate comparisons, repeated work, unbounded result loading and file/disk churn before editing.
- Add targeted indexes/query changes or matching candidate reductions only after proving they preserve ownership and matching correctness.
- Bound returned pages, processing buffers, queues, temporary files and retained state; clean up resources on success and failure.
- Use controlled local processing/offloading where needed so expensive work does not freeze other requests. Do not add cloud workers or Redis for this hackathon.
- Repeat the same measured scenario after each justified change and retain the simplest change that meets an agreed local demo budget.

Review gate:

1. Record comparable before/after time and memory measurements, with first-run and repeated-run behavior distinguished.
2. Prove golden matching results, exact totals and access isolation remain unchanged after optimization.
3. Check health/progress responsiveness, queue backpressure, cancellation/restart recovery and repeated-run resource growth.
4. Exercise the largest supported dataset without uncontrolled memory, disk usage or silently dropped work.
5. State remaining bottlenecks and agreed operating limits; no unmeasured promise of zero lag or an arbitrary completion time.

### Phase 11 — Frontend smoothness, speed and usability (not started)

Owner: frontend. Outcome: Make the connected website responsive and predictable during the real demo flow.

Deliverables:

- Profile the actual connected website on the demo PC/browser and a representative small-screen device; distinguish backend waiting from browser rendering delays.
- Measure initial load, navigation, result-table scrolling/filtering, review clicks, upload feedback and report initiation.
- Fix measured causes such as repeated rendering, overly large tables, duplicate requests, excessive polling, large assets and unnecessary startup code.
- Use bounded/paginated tables; add list virtualization, lazy loading or memoization only when the measurement demonstrates a need.
- Cancel obsolete work, pause irrelevant polling and avoid races when typing filters or switching context.
- Keep charts and financial totals tied to server truth; rendering optimizations must not introduce stale or invented results.
- Improve loading transitions, focus handling, confirmation feedback and error recovery without animations that hide slow or failed work.
- Check keyboard/mobile use, layout movement, readable tables and browser memory growth across repeated screen changes.

Review gate:

1. Save comparable browser performance recordings before/after the relevant fixes.
2. Rehearse the complete real website flow while processing the demo and maximum supported datasets.
3. Check fast filtering/context changes, repeated navigation, multiple tabs and interrupted requests for stale screens or duplicate work.
4. Verify scrolling and interactions remain usable on the chosen hardware; set explicit budgets after the baseline instead of promising universal zero lag.
5. Rerun affected frontend security, state-isolation and contract checks after performance changes.

### Phase 12 — WhatsApp connection and channel review (not started)

Owner: both. Outcome: Make the planned phone interface operate on the same authorized local backend data.

Deliverables:

- Real WhatsApp needs Meta's external API and an internet-reachable HTTPS callback. A loopback-only address cannot receive phone events.
- Record the account/recipient/version constraints and agree on a permitted callback method under the PC-only requirement before setting up one. Do not provision a tunnel or cloud server automatically.
- Implement GET callback verification and bounded raw-byte signature checking before processing POST events.
- Validate configured account/phone identifiers, deduplicate repeated events and distinguish inbound commands from delivery statuses.
- Implement expiring linking codes, context selection, unlink/revocation and the same live ownership checks used by the website.
- Reuse the website's import/run/status/report services rather than building a second calculation or storage path.
- Bound media retrieval and outbound calls, enforce the reviewed send budget and handle uncertain transmission without blind resend.
- Keep the local website working if the channel is unavailable; display the limitation truthfully. An emulator is development evidence, not completed physical-phone integration.

Review gate:

1. Use a real phone to link, query status, upload supported sources, run, request a report and unlink.
2. Compare phone and website run IDs, context and results after actions on either side.
3. Prove wrong signatures/account IDs, repeated callbacks, expired link codes and revoked report access have no unauthorized effects.
4. Test invalid media, timeouts, provider failures and restart/dedup behavior without duplicate mutations or automatic spending.
5. If callback/account setup remains unavailable, keep this phase pending with the concrete blocker; do not mark it complete based on a mock phone flow.

### Phase 13 — Whole-application regression and hackathon rehearsal (not started)

Owner: both. Outcome: Verify the finished website, backend and planned phone channel together with honest completion evidence.

Deliverables:

- Reinstall/build from the committed frontend/backend locks on the demo PC and document the local launch/stop procedure.
- Rehearse from fresh private access and an empty synthetic workspace through upload, confirmation, run, review, cases and report.
- Repeat with retained data after an actual backend restart, checking that files, totals and scope remain correct.
- Check combined browser/backend behavior under maximum supported inputs, duplicate actions and delayed/failed replies.
- Rerun focused security regressions on the final build, including private access, unsafe source text, denied downloads and callback checks.
- Record the real frontend/backend versions, launch configuration, sample datasets and measured demo timings without including secrets.
- Prepare a safe synthetic-data reset and an openly labeled outage recording/report if needed; preserve real user files.
- Maintain a completion ledger: working, failed, pending input or unsupported. Create a later logical-correctness record from actual findings/regressions, following the user's earlier instruction.

Review gate:

1. An unaided presenter can launch and complete the demonstrated flow without editing stored data or swapping mock replies into live screens.
2. Website/backend counts, monetary values, report contents and enabled phone replies agree.
3. Relevant restart, expiry, error-recovery, security and performance scenarios pass on the final build.
4. Any missing physical-phone capability remains explicitly pending; fallback materials do not replace acceptance evidence.
5. Only mark the requested overall scope complete when required phases and their gates are actually complete.

## Frontend handoff and measurable performance

Phases 7–9 and 11 require the actual supplied website. Inspect its real manifest/build before proposing frontend dependencies or replacing components. Frontend completion means both a coherent interface and the verified real backend journey; screen appearance alone is insufficient.

Phase 10 measures the backend's contribution to delays; Phase 11 measures browser rendering/interactions and repeated requests. Use the same dataset/context and demo hardware when comparing changes. Define a concrete budget after the baseline and record actual results; a promise of zero lag on every PC is not an acceptance criterion.

Useful primary references for the applicable implementation reviews: [OWASP safe browser rendering](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html), [OWASP request-forgery prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), and [Chrome runtime performance tooling](https://developer.chrome.com/docs/devtools/performance). Apply guidance to the actual framework/session mechanism rather than guessing one now.

## Phase completion ledger

| Phase | Evidence required before completion |
|---|---|
| 1 | Already recorded: 78 local tests, frozen installation, lint/format and syntax |
| 2–5 | Working backend features with persisted truth and independent correctness fixtures |
| 6 | Backend security/failure findings fixed and relevant regressions passing |
| 7 | Supplied website built, missing screens/actions mapped and interface reviewed |
| 8 | Real local website/backend journey and aligned data/status/errors |
| 9 | Browser data-exposure and request-security checks on the actual connected website |
| 10 | Measured backend improvements with correctness/security regression proof |
| 11 | Measured browser smoothness with preserved state/data correctness |
| 12 | Actual physical-phone proof, or explicitly pending callback/account dependency |
| 13 | Final combined rehearsal, installation/restart/recovery and honest scope record |

An unstarted phase has no new passed checks merely because its plan exists. Update status and evidence in the canonical plan as each implementation increment is completed; retain the Phase 1 history.

## Per-phase review discipline

Give configuration, correctness, security, edge cases and integration checks equal attention within each relevant phase. Read the changed code after tests, follow every real error path and fix failures at their cause. Tests cover behavior and risks, rather than simply mirroring helper functions.

Apply the user-requested [Ponytail rules](https://github.com/DietrichGebert/ponytail/blob/main/skills/ponytail/SKILL.md): understand the flow first, use simple native tools where appropriate, avoid speculative abstractions/dependencies, and preserve validation/security/error handling. This user's explicit phased review requirement remains authoritative.

Record actual commands/results after review. A green foundation is evidence for Phase 1 only; it does not certify future parsers, GST logic, authentication or phone integration as secure or correct.

## Original cloud-oriented sequence — reference only

The material below is retained research/history. Its PostgreSQL/Supabase/Render milestones do not instruct the current local-only build.

## Order of work

Do not implement every feature first and discover deployment/WhatsApp problems at the end. Prove runtime, persistence, auth and a phone round-trip; then grow a vertical import-to-result flow. The supplied website is connected once available, keeping its design intact.

Use the original report for ambition, the review for known defect regressions, and ENGINEERING_HEADSTART.md for cross-layer verification. This is a bounded hackathon workflow, not a production certification program. Tests target meaningful risks; do not write thousands of assertions that simply mirror code.

## Milestone 0 — freeze the foundation inputs

Inputs: this pack, existing website when supplied, current provider docs, permitted samples, Meta developer account.

Deliverables:

- Dedicated GST repository, separate from Jainune.
- Recorded actual frontend manifest/build requirements.
- One selected database/storage/backend setup with clear cost ceilings.
- Candidate Python package resolution and committed lockfile.
- Minimal environment template and startup config validation.
- Meta setup register: app/WABA/phone IDs, recipient status and token lifetime, with secrets kept outside docs.

Completion: a clean Linux/Windows-compatible dependency installation, application imports, and minimal health endpoint work. If a candidate version fails, diagnose the specific compatibility issue and revise the pin rather than bypassing the resolver. Record the working lock and runtime.

## Milestone 1 — deployed skeleton and early WhatsApp proof

Implement JWT verification, workspace membership, private Storage adapter, PostgreSQL connection, health routes, durable inbox/outbox and a minimal linked-user STATUS command.

Deploy the backend and existing frontend skeleton if available. Pre-create two synthetic users in different workspaces. Prove a private file round-trip and a restart. Configure the callback, verify GET challenge, then receive a real message from a physical phone and send a real response.

Completion evidence:

- Deployed URL reaches readiness; missing config fails visibly.
- Authorized user sees their workspace; second workspace cannot retrieve the first's file.
- Stored file survives restart.
- Wrong callback signature has no effects; repeated valid callback has one effect.
- Real phone reply and provider IDs are recorded without logging confidential message contents.
- Actual account entitlements/costs and token expiry are known.

If Meta setup is blocked, deterministic core work can continue using an explicitly labeled emulator. Keep the live phone proof pending and do not describe WhatsApp as complete.

## Milestone 2 — import and canonical data

Implement CSV and XLSX purchase adapters plus canonical-demo-v1 portal JSON. Implement staged rows, mapping preview, row errors, confirmation, file hashing, duplicate-import behavior and context validation.

Expose the upload/preview/confirm routes. Website and WhatsApp upload invoke the same services. Add official portal adapter only after validating an authorized actual layout.

Completion evidence:

- Accepted rows persist exact tax components and dates.
- Rejected records have stable field/row reasons.
- Same file retry does not duplicate records.
- Missing tax components remain unknown.
- Unsupported sections/layouts do not turn into empty successful imports.
- XLSX formulas and archive expansion beyond bounds stop safely.
- Both channels create visible imports in the same selected context.

## Milestone 3 — deterministic reconciliation and review

Implement exact gates, duplicate detection, candidate scoring, competition ambiguity, unique assignment, versioned runs, review events and committed summaries.

Create a small golden fixture first, independently calculating each expected result. Then create the 100-row presentation dataset. Do not tune expectations to whatever the code happens to return.

Completion evidence:

- Counts sum to accepted purchase rows.
- Money equations hold exactly.
- Shuffling input does not change semantic results.
- One portal row cannot satisfy two purchases.
- Same invoice number a year apart does not match.
- Two competing reviews cannot claim the same portal record.
- A fuzzy suggestion remains a suggestion until approved.
- Stale review fails with VERSION_CONFLICT rather than overwriting new evidence.

## Milestone 4 — website experience and usable WhatsApp companion

Connect real UI data, loading/empty/error states, category drilldown and review actions. Generate TypeScript types from OpenAPI. Implement the complete linking, context, upload, run, status, report and unlink command set.

Completion evidence:

- A website run appears in a physical phone STATUS response.
- Phone upload appears in website import history.
- ACCOUNT/workspace switches clear private cached data.
- Viewer role cannot mutate from either channel.
- Expired link code and unlinked phone cannot access results.
- Repeated RUN callback/retry returns one logical run.
- Slow/waking backend is represented honestly without duplicate operation creation.

## Milestone 5 — cases, proposals and evidence artifacts

Implement one real persisted sample case per selected demonstration scenario, with evidence provenance. Generate PDF and generic proposal CSV. Add optional supplier reminder draft; live sending remains conditional on verified recipient/account rules.

Completion evidence:

- Report source IDs/hashes/timestamps correspond to persisted imports.
- Sample filing observation remains sample in UI, WhatsApp and PDF.
- PDF renders rupee/Unicode safely and escapes supplied markup.
- CSV text cannot execute spreadsheet formulas.
- Proposal version/allocations are frozen; stale source invalidates export.
- Download does not mark payment or filing complete.
- Unlink immediately invalidates old phone report capabilities.

## Milestone 6 — demo readiness

Run targeted tests, database integration checks, frontend type/build checks and one deployed end-to-end rehearsal. Record versions, commit, deployed URLs, fixture hashes and results. No fabricated green status for unavailable checks.

Freeze feature additions once rehearsal works. Fix blockers first: login, uploads, exact math, duplicate handling, phone delivery, downloads and deployment restart. Cosmetics and optional natural-language improvements follow.

## Regression matrix from the original engine review

| Trigger | Required outcome | Verification layer |
|---|---|---|
| Two purchases / one portal row | Conflict or ambiguity, never two assignments | Domain + real unique constraint |
| Same number/value across years | No exact match | Domain |
| Empty invoice numbers | Row rejected | Parser |
| Gross 99,000 for base 1,000 + tax 180 | Amount equation rejected | Parser + request model |
| Non-MSME absent from snapshot | No automatic MSME settlement label | Policy/report |
| Fabricated 64-hex IRN | FORMAT_ONLY, not VERIFIED | Domain + serialized output |
| Negative invoice amount | Reject; credit note requires explicit type | Parser + DB |
| Original advertised fuzzy example below threshold | Honest suggestion/missing outcome | Domain; actual RapidFuzz |
| Different CGST/SGST despite same total | Component mismatch | Domain |
| Repeated import/request key | Same operation or explicit conflict | API + database |
| Equal candidates / order shuffled | Stable ambiguity | Domain |
| Latest snapshot supersedes old | Historical run retained, new run explicit | Integration |
| Missing filing evidence | Unknown/EVIDENCE_REQUIRED | Case service |
| Payment partially observed | Proposal bounded by evidenced balance | Service |
| New evidence while reviewing | Stale version fails | Real concurrent DB check |
| Forged provider event | No persistence/effects | HTTP signature test |
| Valid repeated provider event | One logical effect | Inbox uniqueness |
| Meta send timeout after acceptance | UNKNOWN; no blind resend | Adapter fault test |
| Cross-workspace file/run ID | 404, no data | API + real role/membership |
| Revoked member / still valid JWT | Denied | Auth integration |
| Huge XLSX expansion / deeply nested JSON | Bounded rejection | Parser safety |
| Spreadsheet formula in supplier name | Neutralized text on CSV export | Artifact consumer test |

## Test strategy

Fast unit checks: amount conversion/equation/rounding, conservative normalization, exact gates, fuzzy ranking, ambiguity and policy unknown states. Use actual RapidFuzz, not a mocked scorer that guarantees the desired output.

Contract checks: real Pydantic serialization through FastAPI, complete enum/status/error shapes, pagination boundaries and money strings. Consume at least one response with the frontend adapter. Type checking alone cannot prove the API's actual shape.

Database checks: real PostgreSQL transaction rollback, unique assignment, composite tenant references, idempotency races, job lease compare-and-complete and optimistic version updates. SQLite/in-memory mocks cannot establish PostgreSQL locking behavior.

Integration checks: private Storage upload/download/delete outcome; actual Auth project token/issuer configuration; Meta callback and physical phone delivery; restart recovery. Provider mocks cover failure branches but are explicitly separate from actual provider proof.

Artifact checks: open generated PDF, inspect pages visually once for clipping/font/escaping, compare monetary totals; open CSV as plain text and in a spreadsheet-safe test context. An existing PDF filename is not render verification.

## Crash-point rehearsal

| Crash boundary | Recovery expectation |
|---|---|
| File reservation before upload | Reservation discoverable; retry/cleanup possible |
| Storage success before DB reference | Deterministic reserved path permits reconciliation |
| Parse before confirmation | No run uses unconfirmed data |
| Run computation before completion transaction | No partial successful summary |
| Job lease expires during computation | Old owner cannot complete after takeover |
| Report file stored before artifact READY | Recovery links verified file or cleanup removes orphan |
| Inbound callback persisted before processing | Queued command resumes after restart |
| Outbound message transmitted before response | UNKNOWN, requires status/manual recovery |

These are finite targeted cases; do not attempt exhaustive distributed chaos infrastructure for the hackathon.

## Deployment checklist

- [ ] Frozen install and clean frontend build succeed.
- [ ] Backend binds assigned port with one worker.
- [ ] Migrations applied through the dedicated migration credential.
- [ ] Ordinary backend role cannot perform schema administration.
- [ ] Exact production demo origin in CORS.
- [ ] Auth redirect/project configuration matches deployed URL.
- [ ] Private bucket and tenant access denial checked.
- [ ] Backend sleep/wake understood; sample job processed before judging.
- [ ] Callback signature, WABA subscription and phone-number ID verified.
- [ ] Token remains valid through demonstration.
- [ ] Account-level quotas and send budget checked.
- [ ] Restart retains sources/results and resumes eligible jobs.
- [ ] Secrets absent from frontend bundle and repository.
- [ ] Previous working deployment/commit known for rollback.

Rollback for the demo: prefer redeploying the previous working commit when schema is backward compatible. Avoid destructive migrations during rehearsal. If restoring a database snapshot is needed, stop processing first and verify schema/record compatibility; a frontend rollback alone cannot repair incompatible database changes.

## Rehearsal script and fallback

Use a fixed synthetic workspace and documented reset command/route restricted to its owner. Confirm reset deletes only synthetic resources. Practice from a fresh account/session and empty run state, not a browser that secretly retains a prepared result.

Rehearse: sign in -> upload purchase -> upload snapshot -> preview/confirm -> run -> inspect exact/fuzzy/missing -> review -> phone STATUS -> REPORT -> download -> sample case -> proposal export. Record elapsed times rather than promise the original eight-second target without measurement.

Keep the fixtures locally and in the repository; keep a recording of a genuinely verified phone flow and a PDF ready only as openly labeled outage fallback. If internet is unavailable, explain which portions are local and which cannot execute. Do not replace live evidence with a fake webhook event while describing it as a real phone interaction.

## Readiness ledger template

Update this in the implementation repository as work occurs:

| Gate | Status | Evidence | Remaining issue |
|---|---|---|---|
| Dependencies / clean build | NOT_RUN | None yet | Resolve/install candidates |
| Auth / tenant isolation | NOT_RUN | None yet | Provision test project |
| Imports / golden fixtures | NOT_RUN | None yet | Implement parsers |
| Matching / real DB races | NOT_RUN | None yet | Implement engine/schema |
| Supplied website integration | WAITING_INPUT | Website not supplied | Inspect frontend |
| Physical WhatsApp flow | NOT_RUN | None yet | Configure Meta assets |
| Private reports / proposals | NOT_RUN | None yet | Implement artifacts |
| Deployed restart / rehearsal | NOT_RUN | None yet | Deploy and rehearse |

Record PASSED, FAILED, BLOCKED or NOT_RUN honestly; include the exact command/environment when relevant. Later create LOGICAL_CORRECTNESS.md from discovered causes, invariants and regressions rather than claiming these planned safeguards are already implemented.
