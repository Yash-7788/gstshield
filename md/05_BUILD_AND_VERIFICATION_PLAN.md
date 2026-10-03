# GST-Shield — build sequence, verification and hackathon readiness

> **Active local implementation (2026-10-03):** This is a website with a Python backend running on the PC. Authoritative storage is a private SQLite file under `backend/data/`; accounts are provisioned locally and browser access uses revocable sessions. No external database, hosted identity, cloud storage or application hosting is selected. Phases 1–3 are complete and locally verified. Phases 4–13 remain planned. The supplied frontend and real WhatsApp connection are still pending.

## Active implementation phase plan

Read before coding: product scope (01), installed stack/configuration (02), backend/data behavior (03), website/WhatsApp connection (04), this plan (05), security/privacy (06), GST evidence boundaries (07), and API alignment (08). The original report/review and Engineering Headstart remain supporting context.

Latest user decisions: local PC execution and local PC storage; proceed one phase at a time; review each phase before starting the next; expand the full application plan with dedicated frontend improvement/connection/security/smoothness and backend security/performance phases. Do not create hosting infrastructure or external databases. Do not replace the supplied website before receiving it. The phase order is a dependency order, not a ranking of importance.

## Expanded application phase map

The active plan now contains **13 phases**. Phase 1 remains complete; Phase 2 is complete and locally verified; Phases 1–3 are complete and locally verified; Phases 4–13 are not started. Frontend work uses the user's supplied website once it is available. Every phase has its own deliverables and a correctness/security/edge-case review gate.

| Phase | Work | Area | Status |
|---|---|---|---|
| 1 | Local runtime and HTTP foundation | Backend | Complete |
| 2 | Local storage and private access | Backend | Complete |
| 3 | File imports, checking and confirmation | Backend | Complete and locally verified |
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

Completed locally on 2026-10-03: 78 tests passed, including real local process/socket startup; Ruff lint/format, syntax compilation and frozen dependency installation passed. Configuration coercion, malformed dotenv handling, API port alignment and exception-log redaction defects found during review were fixed and covered by regressions. See the [verification record](../backend/README.md#phase-1-verification-record). GitHub workflow results are separate from this local proof. Phase 2 has completed its local review gate; its verification record is maintained in the backend README.

### Phase 2 — Local storage and private access (complete)

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

### Phase 3 — File imports, checking and confirmation (complete and locally verified)

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

## Phase 2 concrete implementation and gate

The local access choice is operator provisioned accounts, scrypt passwords, opaque cookie sessions, Origin/CSRF checks and scoped reads. SQLite is authoritative; browser localStorage is reserved for harmless UI preferences. No upload/reconciliation/report/phone feature has been added by this phase.

Implemented schema v1: metadata, users, workspaces, memberships, registrations, sessions and rate_windows. Future tables are added only with their phase and a backed-up schema upgrade procedure. Financial storage will use integer paise; Phase 2 has no monetary rows or tax calculations.

| Proof | Required observation |
|---|---|
| Phase 1 compatibility | Config/HTTP redaction, health and origin/Host regressions continue to pass |
| Browser access | Login -> session -> workspace -> registration -> logout works with envelopes and credentials |
| Identity isolation | Two local users cannot retrieve the other's registrations by changing UUID |
| Revocation | Expiry, logout, new login, inactive membership and password reset deny old authority |
| Role boundary | A VIEWER cannot pass an OWNER-only membership gate |
| Retention | Actual restarted process retains committed records and unexpired session |
| Backup/restore | Offline commands validate backup; restored sessions fail and accounts require recovery |
| Corruption/schema | Existing empty, corrupt, foreign, future-version or modified-schema DB is refused unchanged |
| SQL atomicity | Duplicate and foreign-key failures roll back the whole operation |
| Resource bounds | Body, account/session/list, disk/database and backup limits fail safely |
| Process ownership | Second runtime or maintenance command cannot acquire the active data lock |
| No leakage | Errors never contain password, session token, private filename or raw SQL |

Phase 2 completed locally on 2026-10-03: 118 tests passed, one Windows symlink-privilege test skipped; the actual Windows junction test and process restart/offline backup/restore proof passed. Frozen dependency installation, lint/format, syntax and diff checks passed. The Windows backup flush defect found during review was fixed, as were same-host browser-cookie alignment and bounded validation/prompt failure paths. Local verification and remote CI remain separate evidence. Phase 3 was explicitly authorized in the following increment; its verification record is maintained below.

## Future regression set to carry through the phases

Keep independently prepared expected counts/totals and deliberate bad cases. Import gates cover corrupt XLSX/JSON, nested/expanded bounds, malformed decimals, missing tax components, ambiguous headers and partial confirmation. Reconciliation gates cover duplicate identities, cross-year invoice numbers, paise tolerance, ties, competing candidates, unique assignment and shuffle invariance.

Review/case/report gates cover stale versions, transaction rollback, superseded snapshots, rejected candidates, missing evidence, report source manifests, safe formulas/markup and truthful proposal labels. No report claims official filing verification or payment execution.

Frontend connection gates cover same-host cookies, session reload, selected-context changes, denied IDs, cancellation, network failure, controlled Retry-After, double-click creates, private cache clearing and real committed responses replacing mocks.

Phone gates cover raw signatures, configured assets, link expiry/single consumption, event replay, media bounds, unlink revocation, ambiguous send UNKNOWN and exact agreement with website summaries. Real phone proof remains required; an adapter emulator is development evidence only.

Every later phase repeats affected earlier checks after edits. Test the enforcing layer with allowed adjacent cases, rather than asserting that a named helper exists. Performance work records measured time/memory and does not weaken exact matching, privacy or validation to achieve a faster number.


## Phase 3 implementation and verification record

Phase 3 uses direct edits to responsibility-named source modules. No phase-named code-edit helper scripts are part of the repository or the workflow. The new modules separate HTTP contracts/routes, exact canonical validation, bounded source adapters, application commands, import schema and the local dispatcher/disposable worker. Existing lifespan/configuration/HTTP boundaries and offline administration were connected rather than replaced.

Verified intermediate evidence: 34 initial parser tests passed; endpoint flows passed for upload/preview, partial acknowledgement, mapping, supersession, scope/role protection and idempotency. The first integration run caught a test-only unclosed SQLite connection; it was corrected with explicit closing. Additional cases cover blank records, reported tax totals and unsafe XML entities.

Resource verification found a Windows virtual-environment launcher spawning a second interpreter. The dispatcher now tracks combined process-tree RSS and stops all observed parser processes on timeout/memory failure. Real child-kill tests assert the observed PIDs no longer exist, not merely that an HTTP timeout was returned. Actual streamed upload counting, duplicate/invalid length headers, receive timeout, authorization-before-body-read, queue bounds and interrupted-job recovery are checked. Source/preview persistence is tested against actual backend process restart and offline backup/restore.

Measured local Windows baseline (Python 3.13.16, complete upload-to-persisted-preview time, includes process startup; not a universal performance guarantee):

| Adapter | Rows | Source bytes | Time (seconds) | Sampled combined child RSS (bytes) |
|---|---:|---:|---:|---:|
| CSV | 100 | 10,935 | 0.602 | 40,366,080 |
| XLSX | 100 | 10,084 | 0.619 | 40,980,480 |
| CSV | 2,000 | 221,935 | 0.877 | 48,648,192 |
| XLSX | 2,000 | 101,303 | 2.697 | 51,294,208 |

Inputs contain distinct synthetic vouchers/invoices and exact component amounts. Health requests are made during the parse and remain available. RSS samples cover the Windows launcher and actual parser; a sampled peak can miss between-sample spikes. Phase 10 will measure broader contention and whole-backend behavior. The full Phase 1–3 regression, frozen dependency, lint/format, syntax and Git checks are recorded after their final run.

Final boundary review also rejects all duplicate purchase copies when one copy has an unrelated validation error. Parser task descriptors use generated private bounded files rather than a blocking stdin pipe, so interpreter startup remains inside the monitored timeout. Both descriptor and result files are cleaned up. Queued-job restart, simultaneous identical command reservations and shipped example parsing are covered by the final tests.


Phase 3 completed locally on 2026-10-03. The full Phase 1–3 regression passed: 169 passed, one Windows symlink-privilege test skipped; the actual Windows junction test passed. A final reviewed retry identity fix was followed by all 77 affected import/parser/HTTP tests passing. Explicit unchanged-mapping recovery from an interrupted import now creates a derived job instead of returning the original failed import; source/context deduplication remains intact. Frozen dependency sync, Ruff lint/format, Python syntax compilation and final diff checks passed. The real-process proof connects Phase 1 health, Phase 2 sessions/scopes and Phase 3 upload/preview/confirmation across restart and offline source-inclusive backup/restore. Local verification does not claim GitHub CI has already run. Phase 4 remains unstarted.
