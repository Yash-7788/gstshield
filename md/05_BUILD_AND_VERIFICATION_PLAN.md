# GST-Shield — build sequence, verification and hackathon readiness

> **Active PC-only scope (2026-10-03):** Run the website backend on the local PC. No Render, cloud server, external database, ORM or cloud-storage service. Phase 1 provides the HTTP/configuration foundation only. Phase 2 will persist data in a local SQLite file under backend/data. The phase plan in [05](05_BUILD_AND_VERIFICATION_PLAN.md) and [backend README](../backend/README.md) overrides the older cloud, managed-auth and temporary-memory proposals below. Local storage does not remove access checks or callback signature requirements.

## Active implementation phase plan

Read before coding: product scope (01), installed stack/configuration (02), backend/data behavior (03), website/WhatsApp connection (04), this plan (05), security/privacy (06), GST evidence boundaries (07), and API alignment (08). The original report/review and Engineering Headstart remain supporting context.

Latest user decisions: local PC execution and local PC storage; proceed one phase at a time; review each phase before starting the next. Do not create hosting infrastructure or external databases. Do not replace the supplied website before receiving it. The phase order is a dependency order, not a ranking of importance.

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

### Phase 2 — local persistence and private access (not started)

Use Python's standard-library SQLite driver, one database file under backend/data and bounded private files on the same PC. No database service/account, ORM or external migration service. Design the initial schema from the resource contracts before adding routes. A future schema change is possible; do not promise that schemas never evolve.

Settle a simple local-demo access model before accepting documents. CORS and loopback binding alone are not authentication. Do not store an authority-bearing secret in a public frontend build. Implement atomic transactions, parameterized queries, enforced foreign keys, disk/file limits, expiry and access scoping. Define backup/restore behavior and startup failure on corrupt/unavailable storage. Browser localStorage may hold harmless UI preferences; it is not the authoritative document or result store.

Review gate: persistence across an actual process restart, denied cross-session access, duplicate/retry behavior, transaction rollback, disk/path boundaries, and expired access. No private data endpoints before this gate.

### Phase 3 — imports and canonical inputs (not started)

CSV/XLSX purchase inputs and explicitly labeled canonical-demo portal JSON. Implement bounded bytes/rows/cells/decompression, content validation, preview, rejected-row details, mapping and explicit confirmation. Preserve unknown tax components and exact decimal strings. Never turn an unsupported format into a successful empty import.

Review gate: independently prepared valid/invalid fixtures, oversized and malformed files, formula/archive risks, deterministic retry/deduplication, scope consistency and persistence of accepted/rejected rows. Add parser dependencies only here.

### Phase 4 — reconciliation and human review (not started)

Implement exact matching gates, duplicates, fuzzy suggestions, competing candidates, unique assignments, stable run versions and expected-version review mutations. Derive financial totals from committed classifications and preserve audit history. Suggestions do not establish ITC eligibility or authorize payments.

Review gate: independent golden results, paise boundaries, missing fields, duplicates on either side, ties/competition, no double counting, repeated requests and stale review conflicts.

### Phase 5 — reports and supplied website integration (not started)

Add evidence summaries/downloads and connect the user's actual website through one API client and shared types. Keep monetary strings exact and explain errors/recovery in the UI. Preserve the supplied design after inspecting its manifest and build requirements.

Review gate: complete upload-to-review-to-report journey, matching API/UI counts, safe export text, scoped downloads, refresh/restart behavior and browser build compatibility.

### Phase 6 — optional real WhatsApp and rehearsal (not started)

The local website/backend can work without internet. Real WhatsApp uses Meta's external API and needs an internet-reachable HTTPS callback; a purely loopback callback cannot receive phone events. No tunnel or hosted service is set up in this phase plan automatically. Agree on a permitted callback method later if real phone integration remains required.

After that decision, implement raw-byte signature validation, bounded callbacks, event deduplication, link expiry/revocation and explicit send-budget handling through the same domain services. Rehearse the local website even when the phone integration is unavailable.

Review gate: physical-phone proof when enabled, invalid-signature rejection, repeated callbacks, unlink/download revocation, timeout uncertainty, and a truthful presentation fallback. An emulator is not real WhatsApp completion.

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
