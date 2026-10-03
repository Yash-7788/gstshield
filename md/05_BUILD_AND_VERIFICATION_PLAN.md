# GST-Shield — build sequence, verification and hackathon readiness

> **Active local implementation (2026-10-03):** This is a website with a Python backend running on the PC. Authoritative storage is a private SQLite file under `backend/data/`; accounts are provisioned locally and browser access uses revocable sessions. No external database, hosted identity, cloud storage or application hosting is selected. Phases 1–5 are complete and locally verified; Phase 6 is in final verification. Phases 7–14 are not started. The supplied frontend and real WhatsApp connection are still pending.

## Active implementation phase plan

Read before coding: product scope (01), installed stack/configuration (02), backend/data behavior (03), website/WhatsApp connection (04), this plan (05), security/privacy (06), GST evidence boundaries (07), and API alignment (08). The original report/review and Engineering Headstart remain supporting context.

Latest user decisions: local PC execution and local PC storage; proceed one phase at a time; review each phase before starting the next; expand the full application plan with dedicated frontend improvement/connection/security/smoothness and backend security/performance phases. Do not create hosting infrastructure or external databases. Do not replace the supplied website before receiving it. The phase order is a dependency order, not a ranking of importance.

## Expanded application phase map

The active plan now contains **14 phases**. Phases 1–5 are complete and locally verified; Phase 6 is in progress; Phases 7–14 are not started. Frontend work uses the user's supplied website once it is available. Every phase has its own deliverables and a correctness/security/edge-case review gate.

| Phase | Work | Area | Status |
|---|---|---|---|
| 1 | Local runtime and HTTP foundation | Backend | Complete |
| 2 | Local storage and private access | Backend | Complete |
| 3 | File imports, checking and confirmation | Backend | Complete and locally verified |
| 4 | GST reconciliation and human review | Backend | Complete and locally verified |
| 5 | Backend reports, cases and evidence workflow | Backend | Complete |
| 6 | Business workflows for all six original problems | Backend | In progress; gate not yet passed |
| 7 | Backend security and failure review | Backend | Not started |
| 8 | Frontend inspection, cleanup and complete screens | Frontend | Not started |
| 9 | Frontend and backend connection | Both | Not started |
| 10 | Frontend security and privacy review | Frontend | Not started |
| 11 | Backend performance and resource efficiency | Backend | Not started |
| 12 | Frontend smoothness, speed and usability | Frontend | Not started |
| 13 | WhatsApp connection and channel review | Both | Not started |
| 14 | Whole-application regression and hackathon rehearsal | Both | Not started |

The sequence is a dependency order, not a ranking of importance. Security and responsiveness are part of feature implementation from the start; Phases 7, 10, 11 and 12 are focused reviews of working code. Do not postpone essential safeguards or fixable blocking behavior to those later reviews.

## Capability status and remaining-work ledger

This ledger reconciles the original six business problems with the active eight MDs and the recorded Phase 1–6 backend implementation. IMPLEMENTED means locally verified backend functionality, not a finished website screen. PARTIAL identifies the delivered foundation and the missing operational behavior. PLANNED has no implementation proof yet. CONDITIONAL requires external setup/evidence. EXCLUDED is an intentional scope boundary, not a forgotten future phase. Update this ledger and the affected resource contract when an implementation gate passes.

| Existing planned capability | Current status and what is missing | Completion phase / acceptance owner |
|---|---|---|
| Local runtime, private PC storage, identities and workspace roles | IMPLEMENTED: local HTTP, private SQLite, sessions, ownership, offline backup/restore | 1–2 complete; whole-backend review 7 |
| Purchase CSV/XLSX and supported portal-table imports | IMPLEMENTED: bounded parsing, mapping, errors, explicit confirmation and retained sources | 3 complete; browser use 8–9 |
| Official GSTR-2B JSON/layout support beyond current adapters | CONDITIONAL: canonical JSON is synthetic; official layout/unsupported sections cannot be called supported without an authorized fixture | 6 must inventory actual coverage and validate a needed adapter only with a permitted sample; otherwise record the concrete pending sample, preserve supported demo path |
| Exact comparison, duplicate detection, fuzzy suggestions and human decisions | IMPLEMENTED: persisted explanations/totals, bounded matching and versioned review; fuzzy suggestions are not auto-accepted | 4 complete; browser use 8–9 |
| New snapshot/source supersession | IMPLEMENTED: retained-purchase actions compare later committed snapshots, retain history and require renewed review on meaningful change; unrelated purchases remain separate | 6; website 9 |
| Supplier missing/wrong-invoice investigation | IMPLEMENTED: discrepancy actions retain recorded GST, correction drafts, supplied contacts and operator attempt history | 6; website 9 |
| Work queue/action history for unresolved issues | IMPLEMENTED: scoped paginated actions, state/due filters, owners, dates, audit history and processing status | 6; screens 8, connected 9 |
| Supplier reminder draft and contact-attempt history | IMPLEMENTED: action-specific NOT_SENT drafts and dated unverified operator attempts; sending remains conditional Phase 13 | 6; website 9 |
| MSME/payment facts and reviewed payment proposal | IMPLEMENTED: recorded payment/classification facts, exact remaining balance/unknowns, linked review actions and recorded-date reminders; proposal remains non-executing | 5 complete for foundation; 6 for remaining workflow |
| Reversal/reclaim evidence case | IMPLEMENTED: original claim/reversal and matching supplier evidence drive conservative candidates; reviewed outcome and separately evidenced user filing observation remain distinct | 5 complete for foundation; 6 for remaining workflow |
| Reclaim review worksheet/preparation and filing-outcome tracking | IMPLEMENTED: authenticated JSON review worksheet, compact action-aware PDFs and separate dated user filing observations; no government execution or guarantee | 6: distinguish candidate, reviewed proposal, separately evidenced recorded filing and unresolved/rejected outcome |
| IRN format/evidence review | IMPLEMENTED: linked missing/malformed/unverified IRN actions and evidence history; format never means authenticity | 5 complete for foundation; 6 for action workflow |
| Trusted signed IRN authenticity/current status | CONDITIONAL/STRETCH: no trusted verification adapter/keys/contract proof | 6 records unsupported status; actual verification deferred until the prerequisite is validated, never a false green badge |
| Notice case and private evidence pack | IMPLEMENTED: notice facts/checklist, linked action, recorded-date reminder, preparation PDF, accepted review and documented user submission observation | 5 complete for foundation; 6 for remaining workflow |
| Automatic local due-review reminders and evidence-change alerts | IMPLEMENTED: bounded local monitor, persisted checkpoints/errors, deduplicated date events, startup and authenticated-read catch-up; PC/backend must run | 6: durable deduplicated tasks while backend runs, overdue catch-up after restart; visible in website 9 |
| Private reports and generic proposal/error exports | IMPLEMENTED: bounded PDF/CSV snapshots/private downloads plus compact action/history coverage, stale action-set checks and JSON worksheet | 5 complete; extend for 6, browser 9 |
| Supplied website screens and real operations | WAITING_INPUT/PLANNED: actual website not yet received; backend operations are not a shipped portal | 8 inspect/finish, 9 connect; 10 security, 12 measured usability |
| Whole-backend security/failure and measured performance review | PLANNED: safeguards exist in completed features; dedicated whole-backend gates have not run | 7 security/failure, 11 performance |
| WhatsApp linking, commands, imports, status, private report access and unlink | CONDITIONAL/PLANNED: no physical-phone/backend integration yet | 13: account/assets, permitted reachable callback and budget proof, real-phone gate |
| Owner/reviewer reminders and supplier follow-up through WhatsApp | CONDITIONAL/PLANNED: local alerts/drafts do not mean messages sent | 13: explicit enablement, linked/consented verified recipient, window/template/account entitlement and bounded outbox; pending if setup is unavailable |
| Government filing/IMS write actions, bank execution/escrow | EXCLUDED from corrected hackathon scope; an observation/proposal/export is not execution | No implementation phase; explicit unsupported state throughout 6/9/13/14 |
| Guaranteed recovery, guaranteed eligibility/compliance or notice dismissal | EXCLUDED claims; an outcome controlled by external facts/review cannot be guaranteed by adding a task | No implementation phase; actual recorded outcomes may be tracked in 6 |
| AI explanation/OCR, direct ERP sync, subscriptions and extra official tables | OPTIONAL/DEFERRED in existing pack; no dependency for the six-problem local workflow | Keep disabled/deferred unless scope and evidence are explicitly changed; do not call them completed |
| Combined six-problem demonstration and failure/restart proof | PLANNED: backend milestones are not overall product completion | 14; must expose conditional/unsupported integration status honestly |

No core Phase 6 automation may be dropped under the older general instruction to remove optional automation when time is tight. That instruction applies to the optional/deferred integrations above. This ledger, the Phase 6 acceptance matrix and implemented contract status govern the current build; the three foundation documents remain historical references.

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
5. Measure parsing time and memory for the demo and maximum supported input sizes; record the initial baseline for Phase 11.

### Phase 4 — GST reconciliation and human review (complete and locally verified)

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

### Phase 5 — Backend reports, cases and evidence workflow (complete and locally verified)

Owner: backend. Outcome: Provide the case/evidence, proposal and downloadable-report foundation. Operational follow-up and cross-snapshot business workflows belong to Phase 6.

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
5. Confirm the case/report/proposal foundation is complete; do not count manual case capture as completion of the original business workflows. Complete Phase 6 before the focused backend security review.

### Phase 6 — Business workflow completion for the six original problems (in progress)

Owner: backend, with contract and future screen alignment. Outcome: Turn the existing import/reconciliation/case/report foundation into actionable tracking for every original business problem. This phase is in progress; its review gate has not yet passed. It is not functionality delivered by Phase 5.

The roadmap was corrected on 2026-10-03 because its previous later phases covered security, screens, integration and performance without explicitly assigning the missing operational workflows. Phases 1–5 retain their completed status and verification evidence. The former Phases 6–13 become 7–14. Adding this phase does not authorize starting another phase before its predecessor's review gate passes.

#### Required problem-to-workflow coverage

| Original problem | Existing foundation | Required Phase 6 behavior | Evidence of completion |
|---|---|---|---|
| 1. Missing or wrongly reported supplier invoice | Missing/mismatch results, manual review, source provenance | Automatically create a deduplicated investigation action from a committed qualifying result; record correction requests, responsible reviewer and next review date; compare later confirmed snapshots and propose follow-up when evidence changes | A synthetic invoice with INR 20,000 recorded tax is missing, receives a supplier follow-up draft, then appears in a later snapshot; the system proposes review without declaring the credit claimed or legally eligible |
| 2. MSME/payment timing risk | MSME review case, payment facts, non-executing proposal | Track classification, acceptance/terms evidence, paid/unpaid amounts and explicitly recorded review dates; surface due/overdue review tasks and missing facts | Partial payment updates remaining recorded balance and the pending task; unknown acceptance/classification stays unknown; no universal 45-day deadline, fixed penalty or guaranteed compliant tax hold is invented |
| 3. Forgotten reversal/reclaim review | Separate Rule 37 and Rule 37A cases and observations | Record original claim, reversal amount/reason/period and later observations; automatically create a deduplicated review task when supported facts change; record reviewer outcome and separately evidenced actual filing | A previously reversed amount with later supplier-filing evidence becomes a reclaim-review candidate; first-time missing credit is not mislabeled a reclaim, repeated observations do not produce repeated alerts |
| 4. E-invoice/IRN problems | IRN review case, format-only evidence | Route missing, malformed or unverified IRN evidence to a correction/review task with provenance and applicability uncertainty; request supporting evidence | A fabricated 64-character hexadecimal IRN remains unverified; a missing IRN creates a review action rather than a blanket declaration that the invoice is fake |
| 5. Notice/evidence readiness | Notice case and evidence PDF | Track notice reference, recorded response date, evidence checklist and reviewer action; create due-review reminders and an evidence-backed response preparation pack | Missing supporting facts remain visible; approaching recorded response date raises a task; a downloaded PDF does not mark the notice submitted, accepted or resolved |
| 6. Manual reconciliation and untracked supplier chasing | Bounded matching and human review | Provide a consolidated work queue, supplier reminder drafts, follow-up history, next-action dates and deduplication shared with the other five workflows | Reviewer can see outstanding actions and previous attempts without redoing matching; later evidence updates the same tracked issue without losing its history |

The original report's legal claims remain subject to document 07 and the foundation review. The INR 20,000 fixture is a recorded GST amount awaiting review, not an automatically recoverable amount or an income-tax calculation. No government polling, filing, bank execution or escrow integration is a prerequisite for this bounded local phase.

#### Deliverables and implementation order inside this phase

1. Read 01, 03, 07 and 08, inspect the real Phase 1–5 services, and map each required workflow to existing resources before changing code. Define independent scenario expectations before implementation.
2. Define an explicit business-action contract: affected invoice/result/case, reason, source versions, evidence provenance, owner/reviewer, next review time and reviewed outcome. Keep lifecycle separate from legal eligibility and actual filing/payment facts. Align exact fields/enums/errors in 08 before using them in routes or future screens.
3. Implement a bounded, paginated work queue and auditable action transitions. Automatically derive eligible tasks after a successful run, a reviewed case/evidence change and a due-time check; failed or stale processing must not publish a false alert. Reuse live membership/role checks, expected versions, atomic transactions and existing retry/idempotency rules. A stale run or changed case must require renewed review. Record a resolution reason; allow explicit reopen when new evidence contradicts it.
4. Implement cross-snapshot comparison with explicitly selected compatible registration/period/document context. Preserve earlier snapshots and decisions. Newly appearing, disappearing or changed rows are evidence changes, not automatic proof of supplier compliance. Reject ambiguous identity, duplicate rows and unsupported comparisons rather than automatically closing an issue.
5. Implement supplier follow-up drafts using recorded invoice facts and deliberately provided contacts. Keep drafts, operator-recorded attempts and eventual verified delivery statuses distinct. Never infer a contact from unrelated data or fabricate a successful send. Outbound WhatsApp sending belongs to Phase 13 with its recipient/consent checks.
6. Implement separate reversal/reclaim review tracking and MSME/payment review actions. Represent absent claim/reversal/payment/filing evidence as unknown. Use uploaded or explicitly recorded observations with source labels. A new 2B match alone cannot prove Rule 37A reclaim readiness. Rule 37 buyer payment facts and Rule 37A supplier filing facts must not overwrite one another.
7. Implement IRN evidence tasks and notice readiness/actions. Keep format checking distinct from trusted authenticity verification. Use an explicitly recorded, reviewed notice response date; do not impose a universal response period from the pitch. Keep drafted response, recorded submission and recorded resolution separate.
8. Implement automatic due-review checks while the local backend is running, plus bounded overdue catch-up on startup and fresh authenticated due queries. Use persisted dates, bounded batches and stable deduplication, and document the check interval and testable behavior. No reminder can run while the PC/backend is off. Startup must surface overdue actions without replaying outbound sends. Do not add a cloud scheduler, Redis or an external database.
9. Update reports and summaries to show outstanding actions, dated observations and uncertainty. Include the existing planned reversal/reclaim review worksheet and notice response preparation handoff. Separate a review candidate, a reviewed proposed amount, an operator-recorded actual filing/submission with dated evidence, and its observed outcome; never mark a worksheet download as a filed return. Completed tasks must retain history; stale historical reports must not appear to represent the latest action state.
10. Extend SQLite only with a validated additive upgrade, backup/restore proof and documented finite retention/quota behavior. Add environment settings only when implemented and update the example with validation/defaults. Use normal responsibility-named files and direct edits, following the established phase style.

Any computed statutory deadline or legal recommendation needs a verified, dated policy, sufficient case facts and explicit evidence labeling. Without that policy, expose a user-recorded review date and missing-information action; do not silently ship a guessed statutory engine. Trusted IRN authentication remains unavailable until its verification contract and evidence are established.

#### Tax filing and recovery scope clarification

The user asked to include automatic tax filing or guaranteed recovery in this phase if they are part of the existing plan. Checked against the corrected pack: 07 says the hackathon produces a review worksheet rather than a filed return and labels IMS/government writes simulated/read-only; the foundation review explicitly removes autonomous filing and guaranteed legal/recovery outcomes from the initial demo. Therefore neither is an omitted implementation task. The original pitch's autonomy/guarantee language does not override those corrected boundaries.

Include the supported filing workflow instead: retain original claim and reversal facts, automatically surface evidence-backed review candidates, prepare the review worksheet/evidence handoff, record an explicit reviewer decision, and separately capture actual filing/reclaim observations supplied by an authorized user. Track observed amounts/outcomes without calling proposed amounts recovered. Government submission stays unsupported; no portal credential collection or login automation is added. This implements the existing preparation/tracking plan without inventing a filing provider integration.

#### Review gate

1. Run all six independently prepared scenarios above through real backend APIs, not direct test database edits. Each must identify the affected record, persist the next action, accept new evidence and show an explained review outcome/report.
2. Include missing and contradictory facts, different periods, reused invoice numbers, duplicate/new snapshots, partial payment, original credit never claimed, reversal without amount, repeated filing observations, unverified IRN and missing notice documents. Unknown inputs must not become eligibility, compliance or successful filing.
3. Prove exact recorded amounts agree across result, case, work queue and report without double counting exposure or implying money saved. A proposal or reminder draft never modifies actual payment/return status.
4. Exercise two scopes, VIEWER denial, revoked membership, forged resource IDs, CSRF, concurrent/stale transitions and repeated commands. User text in drafts/reports remains safely rendered/exported.
5. Prove actual process restart and backup/restore preserve tasks, review dates, observations and audit history. Repeated startup/time checks must not duplicate tasks or claim external delivery.
6. Run affected Phase 1–5 regressions and full phase-completion checks once changes are final. Record actual dependency/lint/syntax/test results and bounds. Compare the completed operations against all six problems before marking Phase 6 complete.
7. Produce a screen-to-operation handoff for Phases 8–9 and a channel handoff for Phase 13. All planned routes become implemented authority only after code and tests exist; current OpenAPI remains the source of existing endpoints.

A generic case form or PDF alone does not pass this phase. Passing it demonstrates local evidence and action tracking for the six problems; it does not establish legal entitlement, guarantee recovered tax or complete the website/phone interfaces.

### Phase 7 — Backend security and failure review (not started)

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

### Phase 8 — Frontend inspection, cleanup and complete screens (not started)

Owner: frontend. Outcome: Turn the user's supplied website into a coherent interface ready for real backend connection.

Deliverables:

- Requires the supplied website. Inspect its actual framework, package manager, lockfile, build scripts, routes, assets and current mock data before choosing any frontend dependency.
- Preserve the supplied visual design and record missing screens, dead buttons, broken routes and inconsistent field names.
- Complete the required screens: private access/context selection, imports, mapping/confirmation, job progress, results, review, cases, business work queue, supplier draft/history, due-review actions and reports. Expose every Phase 6 problem workflow with honest evidence/unknown labels.
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

### Phase 9 — Frontend and backend connection (not started)

Owner: both. Outcome: Make each website action use the real local backend and display the same persisted truth.

Deliverables:

- Implement one API client using the actual frontend framework and the access contract settled in Phase 2.
- Align fields, routes, enums, exact monetary strings, date/period formats, pagination and error shapes with document 08 and the implemented backend.
- Replace mock operations incrementally with real private access, upload, preview/confirmation, run, progress, review, cases, business actions, supplier drafts/history, due-review tasks, reports and downloads.
- Keep state scoped to the active identity/workspace/registration/period; clear private state when logging out or switching scope.
- Handle expired access, version conflicts, invalid input, unavailable backend and interrupted requests with actionable recovery.
- Prevent duplicate mutations from double clicks/retries using the backend's operation rules. Do not treat an uncertain request as proof it failed.
- Cancel or ignore obsolete requests after context changes; an old reply must not overwrite newer selected-context data.
- Configure the actual local website/API addresses and browser permissions together. Keep large result lists bounded and poll only relevant active work.

Review gate:

1. Complete a real sign-in-to-import-to-review-to-report journey and each of the six Phase 6 business scenarios through the website without replacing replies with samples.
2. Compare displayed counts, money and report figures with the same backend run after a review change.
3. Exercise browser refresh, backend restart, logout, context switching and a delayed reply from an old context.
4. Check double submissions, failed requests, expired sessions, stale reviews and recovery without duplicate work.
5. Verify the website build and generated/shared types agree with the backend contract.

### Phase 10 — Frontend security and privacy review (not started)

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

### Phase 11 — Backend performance and resource efficiency (not started)

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

### Phase 12 — Frontend smoothness, speed and usability (not started)

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

### Phase 13 — WhatsApp connection and channel review (not started)

Owner: both. Outcome: Make the planned phone interface operate on the same authorized local backend data.

Deliverables:

- Real WhatsApp needs Meta's external API and an internet-reachable HTTPS callback. A loopback-only address cannot receive phone events.
- Record the account/recipient/version constraints and agree on a permitted callback method under the PC-only requirement before setting up one. Do not provision a tunnel or cloud server automatically.
- Implement GET callback verification and bounded raw-byte signature checking before processing POST events.
- Validate configured account/phone identifiers, deduplicate repeated events and distinguish inbound commands from delivery statuses.
- Implement expiring linking codes, context selection, unlink/revocation and the same live ownership checks used by the website.
- Reuse the website's import/run/status/report and business-action services rather than building a second calculation or storage path. Add consented supplier follow-up sending with recorded drafts, recipient checks, delivery/uncertain status and shared audit history; do not treat a provider acknowledgement as invoice correction.
- Connect the existing planned owner/reviewer due-review alerts and supplier follow-up drafts to a bounded outbox only when explicitly enabled for a linked/consented verified recipient and permitted message window/template. Persist queued/attempted/acknowledged/delivered/failed/uncertain states; channel outage keeps local tasks available. Scheduled outreach remains conditional on actual entitlement and budget proof.
- Bound media retrieval and outbound calls, enforce the reviewed send budget and handle uncertain transmission without blind resend.
- Keep the local website working if the channel is unavailable; display the limitation truthfully. An emulator is development evidence, not completed physical-phone integration.

Review gate:

1. Use a real phone to link, query status, upload supported sources, run, request a report and unlink.
2. Compare phone and website run IDs, context and results after actions on either side.
3. Prove wrong signatures/account IDs, repeated callbacks, expired link codes and revoked report access have no unauthorized effects.
4. Test invalid media, timeouts, provider failures, due-alert/supplier-draft recipient isolation and restart/dedup behavior without duplicate mutations or automatic spending. Prove physical-phone alert delivery for any enabled automation; an outbox row is not delivery proof.
5. If callback/account setup remains unavailable, keep this phase pending with the concrete blocker; do not mark it complete based on a mock phone flow.

### Phase 14 — Whole-application regression and hackathon rehearsal (not started)

Owner: both. Outcome: Verify the finished website, backend and planned phone channel together with honest completion evidence.

Deliverables:

- Reinstall/build from the committed frontend/backend locks on the demo PC and document the local launch/stop procedure.
- Rehearse from fresh private access and an empty synthetic workspace through upload, confirmation, run, review, business actions, cases and report. Demonstrate all six original problem scenarios from Phase 6 through the connected website; a matching table alone is insufficient.
- Repeat with retained data after an actual backend restart, checking that files, totals and scope remain correct.
- Check combined browser/backend behavior under maximum supported inputs, duplicate actions and delayed/failed replies.
- Rerun focused security regressions on the final build, including private access, unsafe source text, denied downloads and callback checks.
- Record the real frontend/backend versions, launch configuration, sample datasets and measured demo timings without including secrets.
- Prepare a safe synthetic-data reset and an openly labeled outage recording/report if needed; preserve real user files.
- Maintain a completion ledger: working, failed, pending input or unsupported. Create a later logical-correctness record from actual findings/regressions, following the user's earlier instruction.

Review gate:

1. An unaided presenter can launch and complete the demonstrated flow without editing stored data or swapping mock replies into live screens.
2. Website/backend counts, monetary values, action/reminder history, report contents and enabled phone replies agree. Show the six problem outcomes, including unresolved evidence and review limitations, rather than claiming automatic tax recovery.
3. Relevant restart, expiry, error-recovery, security and performance scenarios pass on the final build.
4. Any missing physical-phone capability remains explicitly pending; fallback materials do not replace acceptance evidence.
5. Only mark the requested overall scope complete when required phases and their gates are actually complete.

## Frontend handoff and measurable performance

Phases 8–10 and 12 require the actual supplied website. Inspect its real manifest/build before proposing frontend dependencies or replacing components. Frontend completion means both a coherent interface and the verified real backend journey; screen appearance alone is insufficient.

Phase 11 measures the backend's contribution to delays; Phase 12 measures browser rendering/interactions and repeated requests. Use the same dataset/context and demo hardware when comparing changes. Define a concrete budget after the baseline and record actual results; a promise of zero lag on every PC is not an acceptance criterion.

Useful primary references for the applicable implementation reviews: [OWASP safe browser rendering](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html), [OWASP request-forgery prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), and [Chrome runtime performance tooling](https://developer.chrome.com/docs/devtools/performance). Apply guidance to the actual framework/session mechanism rather than guessing one now.

## Phase completion ledger

| Phase | Evidence required before completion |
|---|---|
| 1 | Already recorded: 78 local tests, frozen installation, lint/format and syntax |
| 2–5 | Working backend features with persisted truth and independent correctness fixtures |
| 6 | All six problem scenarios reach a recorded next action and evidence-backed review outcome |
| 7 | Backend security/failure findings fixed and relevant regressions passing |
| 8 | Supplied website built, missing screens/actions mapped and interface reviewed |
| 9 | Real local website/backend journey and aligned data/status/errors |
| 10 | Browser data-exposure and request-security checks on the actual connected website |
| 11 | Measured backend improvements with correctness/security regression proof |
| 12 | Measured browser smoothness with preserved state/data correctness |
| 13 | Actual physical-phone proof, or explicitly pending callback/account dependency |
| 14 | Final combined rehearsal, installation/restart/recovery and honest scope record |

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

Inputs contain distinct synthetic vouchers/invoices and exact component amounts. Health requests are made during the parse and remain available. RSS samples cover the Windows launcher and actual parser; a sampled peak can miss between-sample spikes. Phase 11 will measure broader contention and whole-backend behavior. The full Phase 1–3 regression, frozen dependency, lint/format, syntax and Git checks are recorded after their final run.

Final boundary review also rejects all duplicate purchase copies when one copy has an unrelated validation error. Parser task descriptors use generated private bounded files rather than a blocking stdin pipe, so interpreter startup remains inside the monitored timeout. Both descriptor and result files are cleaned up. Queued-job restart, simultaneous identical command reservations and shipped example parsing are covered by the final tests.


Phase 3 completed locally on 2026-10-03. The full Phase 1–3 regression passed: 169 passed, one Windows symlink-privilege test skipped; the actual Windows junction test passed. A final reviewed retry identity fix was followed by all 77 affected import/parser/HTTP tests passing. Explicit unchanged-mapping recovery from an interrupted import now creates a derived job instead of returning the original failed import; source/context deduplication remains intact. Frozen dependency sync, Ruff lint/format, Python syntax compilation and final diff checks passed. The real-process proof connects Phase 1 health, Phase 2 sessions/scopes and Phase 3 upload/preview/confirmation across restart and offline source-inclusive backup/restore. Local verification does not claim GitHub CI has already run. Phase 4 remains unstarted.

## Phase 4 implementation decisions (2026-10-03)

Use the existing single killable child dispatcher for imports and runs, with shared workspace queue admission. Add SQLite schema v3 with an explicit validated, backed-up offline v1/v2 upgrade. Preserve confirmed source IDs, hashes, adapters, provenance and server policy settings in every run. Financial arithmetic stays in integer paise. RapidFuzz ratio on an explicitly normalized comparison key produces suggestions requiring review; exact keys preserve separators, zeroes and year tokens. Compare all eligible candidate edges before classification, quarantine duplicates, bound total comparisons/candidates and fail explicitly rather than truncate ambiguous results. Review transactions recheck role, source freshness, expected version and unique assignment; commit result, summary, idempotency response and audit together. A replacement supersedes older completed runs only after its results commit. Interrupted running jobs fail visibly; queued jobs resume. At Phase 4 completion, Phase 5 had not started; its completed implementation is recorded below.

## Phase 4 initial measured baseline

Actual disposable reconciliation workers on this Windows PC, including run admission, child startup and database publication, with valid confirmed CSV source pairs:

| Accepted purchase rows | Exact results | Run seconds | Sampled combined child-tree RSS bytes |
|---|---|---|---|
| 100 | 100 | 0.635 | 32,739,328 |
| 2,000 | 2,000 | 1.584 | 50,720,768 |

These are initial local observations for exact-match workloads, not universal latency guarantees or worst-case fuzzy workloads. Twenty-millisecond RSS sampling can miss short spikes. Ambiguous candidate workloads are bounded separately; exceeding pair/candidate limits fails instead of silently truncating the graph. Full Phase 1–4 regression is the final completion gate.

## Phase 4 completion and verification record

Local Windows verification on 2026-10-03: the complete Phases 1–4 regression suite passed **198 tests, with one Windows symlink-privilege skip**, in 423.21 seconds. The separate actual Windows junction-denial test passed. Final review then fixed equal top similarity scores when an operator configures the minimum score gap to zero; ties remain ambiguous. All **21 affected reconciliation/golden-run/concurrent-review tests** passed after that final change, including two new zero/default-gap regressions. The repository now contains 19 reconciliation unit cases and 12 run integration cases. This is not a claim that a new complete 200-test suite was rerun after the bounded final fix.

Frozen installation checked the selected runtime; Ruff lint/format, syntax compilation and diff checks passed. Golden expected counts and amounts were prepared independently. Tests cover paise tolerance, component cancellation, unknown values, credit-note separation, rejected duplicate evidence, same-number other-year gates, score threshold/gap rounding, input permutations, exact reservation, candidate/pair exhaustion, actual child processing, shared queue/retention quotas, two-user scope isolation, VIEWER denial, CSRF, malformed reviews, stale versions and request keys.

Concurrent tests prove one winner per contested portal row and per result version; rejected assignments release correctly. Late audit failure rolls result/summary/history/idempotency back together. SQLite tests reject invalid assignments, cross-source candidates, completed runs without summaries and running jobs without leases. Queued work resumes; interruptions fail truthfully; stale lease output is ignored; failed replacements retain earlier output. Source supersession blocks reviews and historical results remain readable.

An actual local HTTP process run was reviewed, stopped, restarted, backed up and restored: result status/assignment/timeline, saved source/policy and job success remained consistent. Restored sessions/accounts stayed revoked until explicit operator recovery. Tests used isolated synthetic storage; no real backend/.env or backend/data was created. GitHub workflow results are separate evidence.

Phase 4 was developed directly in responsibility-named modules: api/runs.py, contracts/runs.py, domain/reconciliation.py, services/runs.py, jobs/run_worker.py and storage/run_schema.py. Existing main/dispatcher/import-job/admission/storage hooks were extended and inspected against their previous versions. No phase/helper editing scripts are retained. All eight active MDs and the environment example now describe the implemented run/review contracts and local schema/queue decisions. At that Phase 4 milestone, Phase 5 had not started; see its completion record below.


### Phase 5 implementation status

Completed: additive schema 4, bounded evidence cases, human-approved payment proposals, private PDF/CSV artifacts, expiry cleanup and integration checks. Reports use immutable committed snapshots; proposals never execute payments. Previous schema definitions remain unchanged for validated offline upgrades.


## Phase 5 completion and verification — 2026-10-03

Implemented directly in responsibility-named files: contracts/workflows.py, domain/workflows.py,
services/workflows.py, services/cases.py, services/proposals.py, services/reports.py,
adapters/reports.py, jobs/report_worker.py, api/workflows.py and storage/workflow_schema.py.
The existing main/dispatcher/import-job/queue-admission/storage code connects these services
with Phases 1–4. No phase-named runtime module or retained patch/helper script was introduced.

Decisions: private report BLOBs and source snapshots in SQLite rather than separate cloud/files;
one existing monitored processing child; additive schema 4 with preserved v1/v2/v3 fingerprints;
server-generated filenames; approved/current proposal CSV only; explicit historical PDF/error
CSV downloads; seven-day artifact expiry and owner-only content cleanup. Financial comparisons
remain integer paise. Cases/proposals preserve uncertainty and require human observation/review.
No bank transfer, statutory computation, government filing, IRN authenticity adapter, frontend
or WhatsApp connection is implemented by this phase.

Complete local Windows Phases 1–5 regression: **234 passed, 1 skipped**, in **508.73 seconds**.
The skip requires Windows symlink privilege; the actual junction-denial check passed. Checks
cover all five case kinds, current-version transitions/reopen, same-scope observations/hash
snapshots, invalid money, missing facts, evidence edits requiring renewed observations,
proposal overdraw/rejection/staleness, generic review-only export, and unchanged amount_paid.

Report checks cover private login/role/scope boundaries, CSRF through the shared middleware,
shared queue limits, active request deduplication/idempotency conflicts, failed/interrupted
jobs, invalid/obsolete leases, invalid base64/hash, unavailable/stale/expired downloads,
explicit historical PDF behavior, stale proposal CSV denial, formula/markup neutralization,
unsupported glyph failure and bounded pages/bytes. An audit fault rolls back the case command.
A real HTTP process restart preserves cases, proposal snapshots and byte-identical reports;
SQLite backup/restore retains them while revoking restored sessions/accounts until offline
password reset. Explicit old schema 2/3 upgrades retain validated original backups; existing
schema 1 checks also passed in the full suite.

Final presentation changes group normal invoice entries, keep headings with following text
and display UTC timestamps readably. All **24 affected report-rule/end-to-end checks passed**
after those changes; the full suite is the earlier 234-test run, not an unclaimed second full
run. The 200-row PDF baseline is **41 pages / 68,286 bytes**, clearly showing 200 of a 2,000-row
run. All page text bounds were inspected programmatically; rendered first/middle/final sample
pages and all actual HTTP-generated evidence PDF pages were visually reviewed for clipping,
rupee rendering, footers, readable facts and page continuation. Temporary synthetic QA files
are outside the repository and are not private user documents.

Frozen uv sync (37 resolved packages), Ruff lint/format, Python compilation and Git whitespace
checks passed. GitHub CI timeout increases from 10 to 15 minutes because the local full suite
already takes 8.5 minutes; remote Windows/Linux CI results are separate from local evidence.
All eight active MDs, both READMEs and .env.example now describe the actual schema/stack/wire
fields and caps. Original foundation documents remain historical context.

Accepted hackathon limits: localhost/single-PC availability; finite histories including expired
artifact history; cleanup is logical deletion and old backups retain bytes; PDF glyph coverage
is limited to the bundled font and unsupported scripts/emoji fail visibly; PDFs may show a
bounded selection with full totals and fail rather than truncate when a snapshot/page cap is
exceeded. One reviewer can approve a non-executing draft; production maker/checker, bank/provider
integrations and legal decision engines are outside this phase. At the Phase 5 milestone, the added Phase 6 had not started; its current implementation record follows below. Phase 7 remains the subsequent focused backend review. Passing tests does not establish zero defects or production security certification.


## Phase 6 implementation and verification record

Responsibility modules: `storage/action_schema.py`, `contracts/actions.py`, `domain/actions.py`, `services/actions.py`, `jobs/automation.py` and `api/actions.py`. Existing main/config/storage/report modules connect the new service to the Phase 1–5 authority; no phase-numbered scripts or patch helper files were added. Schema 5 is additive, with exact old fingerprints and offline backup-first upgrade. No dependency or provider infrastructure was introduced.

The six API scenarios cover missing INR 20,000 GST across later snapshots, unknown/partial payment review, supported reversal/reclaim observations, unverified IRN, notice preparation/submission observations and retained supplier follow-up history. Additional tests cover background processing without queue reads, event deduplication, actual HTTP restart and offline backup/restore, two accounts, forged draft IDs, role/revocation, stale sources, idempotency, competing versions, full history/action quotas and independent progress after a failed source. Pure rule/input checks cover absent/contradictory amounts/periods, credit notes, unclaimed credit, exact paise, future dates, invalid contacts/commands and duplicate references.

Frozen sync, Ruff lint/format and syntax compilation passed. Forty-two new Phase 6 scenario/rule checks plus five targeted storage regressions are included. Repeated full checks exposed transient import/report polling failures; these failed runs are not completion evidence. Initial handling of disappearing scanned entries was insufficient: a three-thread reproduction found Windows final-path resolution could falsely label an ordinary short-lived journal file as linked. Existing lstat/type/reparse checks already reject file links, so final-path resolution is now restricted to directories, preserving intermediate-directory/traversal validation. Scans also tolerate vanished entries without recreating the primary database. The original stress reproduction failed twice before this correction; afterward 200 committed writes and 800 concurrent quota scans completed without errors, followed by SQLite integrity/fingerprint validation. All storage checks passed: 23 passed, 1 Windows-privilege skip, including file disappearance, ordinary-file resolution, missing-database refusal, traversal and actual junction denial. Private diagnostics retain only internal category, failure type and numeric code. The final full suite is running against this fixed code; replace pending status with its actual result before marking the phase complete.

The updated notice/action PDF was rendered and inspected; the compact history retains user/system dates and unverified execution labels while full snapshots remain private. Old source/action versions and added actions invalidate historical reports. Worksheet/PDF generation does not close an action or perform a submission. No official GSTR-2B JSON fixture was supplied: supported CSV/XLSX tables and synthetic canonical JSON remain the explicit adapter inventory; a real unsupported layout is still pending an authorized sample.

Future ownership remains Phase 7 whole-backend security/failure review, 8 supplied website screens, 9 connection, 10 frontend privacy/security, 11 backend measurement, 12 frontend usability, 13 conditional real WhatsApp and 14 combined rehearsal. Automatic authorized fetching, government filing and legal decision integrations are deferred separately; guaranteed recovery is not an implementation promise. Phase 6 completes local business workflow scope when its gate passes, not the entire shipped website/phone product.
