# GST-Shield — backend and data specification

> **Active local implementation (2026-10-03):** This is a website with a Python backend running on the PC. Authoritative storage is a private SQLite file under `backend/data/`; accounts are provisioned locally and browser access uses revocable sessions. No external database, hosted identity, cloud storage or application hosting is selected. Phases 1–4 are complete and locally verified. Phases 5–13 remain planned. The supplied frontend and real WhatsApp connection are still pending.

Baseline 2026-10-03. Planned implementation. [08_CONTRACTS_AND_ALIGNMENT.md](08_CONTRACTS_AND_ALIGNMENT.md) owns wire names/enums; [06_SECURITY_AND_PRIVACY.md](06_SECURITY_AND_PRIVACY.md) owns access rules; [07_RULES_AND_INTEGRATION_TRUTH.md](07_RULES_AND_INTEGRATION_TRUTH.md) owns legal/provider claims.

## Architecture and dependency direction

```text
Existing website ── session + CSRF ──> FastAPI routes ──> application services
Meta webhook ── signature ──> durable inbox ──> linked-user command adapter
                                               │
                             same application services
                                               │
                   SQLite database + private PC file storage
                                               │
                         persisted jobs + single-process dispatcher
```

Routes authorize and validate; services own transactions and state changes; repositories execute tenant-scoped SQL; parsers normalize source formats; the reconciler accepts canonical values and returns decisions without network access. Channel adapters cannot implement their own matching or tax arithmetic. Provider adapters return explicit available/failed/unknown states.

Suggested repository structure:

```text
backend/
  app/main.py                 # application, lifespan, health
  app/config.py               # validated configuration
  app/api/                    # routes + auth dependencies
  app/contracts/              # Pydantic models and enums
  app/services/               # import, run, review, case, report
  app/domain/                 # canonical values, matching, policy facts
  app/storage/                # local SQLite, scoped statements, file boundary
  app/adapters/               # storage, Meta, portal format adapters
  app/jobs/                   # durable claim, dispatcher, recovery
  app/security/               # local sessions, HMAC, capabilities, limits
  tests/fixtures/             # synthetic data and expected outputs
frontend/                    # supplied website, preserve its framework
md/                          # this eight-document pack
```

Start with one Uvicorn worker. Phase 3 parsing uses one killable local child process with a monitoring thread; impose input bounds before launching work. PDF processing remains a Phase 5 decision. Database sessions belong to one operation, never shared across parallel tasks. Do not keep a transaction open during file-processing or Meta requests.

## Persistence conventions

Application tables live in the private SQLite file, with STRICT types and foreign keys enabled on every connection. UUIDs are generated server-side. Phase 2 timestamps are integer Unix seconds exposed as UTC RFC3339 Z strings. Phase 3 monetary columns use INTEGER paise, checked for bounds; Python uses Decimal and JSON uses fixed two-decimal strings. Never use SQLite REAL for money. Phase 4 scores use validated fixed decimal text; financial values remain INTEGER paise. Integer version supports optimistic concurrency.

Every tenant-owned row carries `workspace_id`; child references use composite `(workspace_id, id)` foreign keys where appropriate to prevent cross-workspace references. Index each unique pair referenced by those keys. Authentication identity is the active local account resolved from an unexpired opaque session; membership comes from our database, not editable profile metadata.

| Entity | Core fields / constraints |
|---|---|
| `workspaces` | id, name, created_at |
| `memberships` | workspace_id, user_id, role (`OWNER/REVIEWER/VIEWER`), active; unique workspace/user |
| `registrations` | workspace_id, gstin, display_name; unique workspace/GSTIN |
| `import_files` (implemented) | workspace_id, registration_id, private content BLOB, original_name, size_bytes, sha256, uploaded_by, created_at; no public URL |
| `imports` | file_id, kind, period, adapter_version, mapping_json, state, counters, generated_at, supersedes_import_id, version; unique workspace/registration/kind/period/file_hash/mapping_hash/adapter_version |
| `import_rows` (implemented) | workspace_id/import_id/row_number, original_json, canonical_json, errors_json, accepted/duplicate flags and INTEGER monetary columns; unique scoped import/row |
| Purchase documents | Implemented as PURCHASE import_rows; public document UUID derives from import UUID + row position |
| Portal documents | Implemented as PORTAL_2B import_rows; duplicate records are retained for explicit conflict detection |
| `runs` (implemented) | workspace/registration/period, source pair, revision/version, state, policy_json, sources_json, summary_json nullable, superseded_by_run_id, timestamps |
| `run_results` (implemented) | Scoped run/source row, canonical_json, status/version, reasons_json, assigned_portal_row nullable; unique run/purchase and run/assignment |
| `run_candidates` (implemented) | Scoped run/result/portal row, score text, rank, eligible, differences/reasons JSON; unique result/portal |
| `run_events` (implemented) | Scoped run/result, actor, action, reason, selected candidate, committed result version, request ID and timestamp; append-only via service |
| `cases` | registration_id, purchase_document_id, kind, state, amount, claim_period, reversal_period, supplier_return_period, facts_json, version |
| `case_events` | case_id, actor, event_kind, evidence_file_id nullable, sample flag, facts_json, created_at |
| `proposals` | run_id, state, source_versions_json, allocations_json, total, created_by, approved_by nullable, version |
| `artifacts` | run_id/case_id/proposal_id, kind, file_id, manifest_json, created_at |
| `jobs` / `run_jobs` (implemented) | IMPORT/RUN resource reference, workspace, state, safe error code and timestamps; run_jobs also has a private server lease |
| Job coordination | OS data lock + one in-process dispatcher; no separate job_coordination table or lease renewal timer |
| `wa_links` | user_id, workspace_id, registration_id, active_period, wa_id, active; unique active phone link for this app |
| `link_codes` | user/workspace/context, code_hash, expires_at, consumed_at; unique hash |
| `wa_events` | provider_event_key unique, event_kind, expected_sender_account, minimal_payload, state, received_at |
| `wa_outbox` | logical_key unique, destination link, body/artifact reference, state, provider_message_id nullable, attempts |
| `download_capabilities` | token_hash, artifact_id, originating_link_id, expires_at, revoked_at |
| `import_operations` / `run_operations` (implemented) | workspace/actor/route/key uniqueness, request hash and import reference or committed run/review response |
| Audit history | Implemented import_events/run_events; later cases/reports extend this with their own scoped events |

For an assigned portal record enforce a partial unique index on `(run_id, assigned_portal_id)` where assigned_portal_id is not null. This prevents two purchase records claiming the same portal row. Candidate suggestions are not assignments. Tenant-scoped referenced rows must be validated even for JSON payloads; JSON is not a foreign-key substitute.

Do not add a global uniqueness constraint that destroys repeated snapshot observations. The same invoice may appear in successive snapshots; imports remain immutable and run selection chooses the relevant snapshot. Duplicates within an import are rejected or categorized, never added twice to monetary totals.

## Implemented Phase 2 schema and future extension boundary

Current tables: metadata, users, workspaces, memberships, registrations, sessions and rate_windows. The entity catalog above is a future domain design; files/imports/runs/results/jobs/phone/report/audit tables are not present yet. Phase 2 creates no financial columns and performs no tax computation.

Users have a normalized unique username, salt/digest/algorithm, active flag and version. Sessions hold only the SHA-256 digest of a random 256-bit cookie token, user reference and absolute creation/expiry timestamps. Workspaces and registrations include versions. Memberships have a composite workspace/user primary key, checked role and active state.

Registration uniqueness is per workspace/GSTIN, so separate workspaces can hold their own observation of the same taxpayer. Provisioning validates only structural GSTIN format in Phase 2; government status and checksum-based validation remain future domain work. Synthetic identifiers are not official registration evidence.

The OS process lock is held for the runtime or offline administration lifetime. BEGIN IMMEDIATE serializes writes; explicit read transactions keep membership/resource queries consistent. Busy waiting is finite. No transaction spans password hashing, network calls or report computation.

Schema application ID, version, exact schema fingerprint, quick integrity check and foreign-key check are verified at startup and for backups. An unknown version fails visibly and preserves data. Before Phase 3 extends the schema, define a versioned, backed-up upgrade and rollback/recovery procedure; do not delete an old file to make new startup succeed.

Backup/restore currently covers this database. When Phase 3 adds source files, extend the manifest and restore validation so database references cannot claim missing private bytes. Before a write, check retained bytes, free-disk reserve and SQLite maximum pages. The configured budget includes rollback journal and backup overhead.

## Canonical document values

Required purchase fields: voucher_id, recipient_gstin, supplier_gstin, invoice_number, invoice_date, document_type, taxable_value, igst, cgst, sgst, cess, other_charges, round_off, gross_total. Optional: supplier_name, irn, msme_classification, acceptance_date, written_terms_days, amount_paid, evidence references. Raw document_number is preserved alongside conservative comparison keys.

The download template provides explicit tax components. A legacy template with only total_tax can be imported into preview, but is marked `COMPONENTS_UNKNOWN` and cannot become `EXACT_MATCH` until mapped accurately. Zero is a supplied known value; null means unknown. Do not invent zero component values from absent columns.

Portal rows carry the same invoice identity/tax components plus portal availability metadata, source table, generated_at and period. The recipient may be inherited from an authenticated source header after confirming it matches the selected registration. Optional unsupported sections remain recorded as unsupported, not empty-success.

Invoice monetary check:

```text
total_tax = igst + cgst + sgst + cess
gross_total = taxable_value + total_tax + other_charges + round_off
```

For invoice/debit-note rows, monetary magnitudes are nonnegative except signed `round_off`. Credit notes also store nonnegative magnitudes and an explicit document type; a signed ledger projection applies the direction later. This prevents negative payouts. Reject non-finite values, ambiguous localized decimals and unexpected precision. The fixed template accepts dot decimals without grouping; the current mapping preview selects headers only and does not normalize export locales. Add an explicit adapter and tests before accepting localized amounts.

## Import lifecycle

1. Authorize context and enforce body/row/archive limits. Compute SHA-256 from bytes.
2. Receive bounded bytes after authentication and role checks. A failed/incomplete reception creates no durable import.
3. Atomically persist or reuse the private source BLOB, import identity, idempotency operation and QUEUED job. The source bytes are already bounded before this short transaction. A crash before commit cannot leave an orphan source/job reservation.
4. Parse into staged source rows. Validate layout, recipient, period and canonical values. Detect duplicate voucher/invoice identities. Store accepted and rejected counts with row errors.
5. Enter `AWAITING_CONFIRMATION`. A confirm action freezes mapping and accepted rows; `allow_rejected_rows=true` explicitly acknowledges partial import. No rejected record enters reconciliation.
6. If superseding an existing portal snapshot, require an explicit matching-context parent ID and retain both files. A changed snapshot never edits completed historical results.

CSV: UTF-8 or UTF-8 BOM first; provide an actionable unsupported-encoding error. XLSX: user-selected sheet; read-only; reject macro formats and formula cells anywhere in the workbook; check decompressed ZIP size/entry count before parse. JSON: bounded size/nesting/record counts, strict adapter selection. No PDF OCR or arbitrary ZIP import in the first build.

The synthetic canonical JSON adapter is `canonical-demo-v1`. It does not impersonate the official GSTR-2B format. The first official adapter is activated only after testing an authorized anonymized actual file and documenting supported sections in 07.

## Reconciliation algorithm

Create a run bound to two READY imports, their hashes, adapter versions and `match-v1` policy. Refuse recipient/registration/period mismatch. A run stores reproducible output; a rerun creates a new version.

1. Validate incoming identities and amount equations. Invalid staged records do not reach this step.
2. Group portal candidates by recipient, supplier and document type. Compare actual invoice date; a cross-year same-number row cannot match.
3. Detect duplicate exact identities on either side first. Put affected purchase rows into `AMBIGUOUS`; stable sort by IDs is only for display, never a financial tie-break.
4. Exact match requires unique raw-number equality after case/outer-whitespace normalization, equal date, and each monetary component within the configured tolerance. Starting tolerance is INR 0.01 per field. Record every nonzero difference. No match implies ITC legality or payment permission.
5. Remaining candidates with compatible identity/date/amount gates are ranked using RapidFuzz on a separate comparison key. Suggest when score >= 88; require a >= 5 point gap before calling a candidate high confidence. Even high confidence remains `FUZZY_SUGGESTION`, not automatic acceptance.
6. A graph component with two purchase rows competing for one portal row is `AMBIGUOUS`; do not greedily consume whichever input arrived first. Exact assignments happen before fuzzy suggestions. Manual acceptance rechecks the unique-assignment constraint under transaction.
7. If invoice identity matches but tax/amount gates fail, classify `AMOUNT_MISMATCH`. If no plausible candidate exists, classify `MISSING_IN_SNAPSHOT`. Unsupported/insufficient component evidence yields `EVIDENCE_INCOMPLETE`, not fabricated cleanliness.
8. Store one result per accepted purchase row, candidate explanations, assigned exact rows and the summary in one completion transaction. Job output remains invisible as complete until committed.

Comparison keys may remove separators for suggestions, but must preserve raw values. Do not strip fiscal-year tokens, change invoice dates, or drop leading zeros for exact matching. Fuzzy scoring is a search aid, not an authenticity measure.

Summary counts cover mutually exclusive result categories and sum to the accepted purchase count. `tax_exposure_review` sums recorded tax magnitudes once for invoice/debit-note rows in AMOUNT_MISMATCH, MISSING_IN_SNAPSHOT, AMBIGUOUS, EVIDENCE_INCOMPLETE and REJECTED. Credit notes are reported separately. This is a review metric, not legally denied or recovered ITC.

## Review, cases and proposals

Review acceptance checks actor permission, current result version, active run, candidate gates and unique assignment. Rejection records reason and leaves no assignment. An accepted fuzzy row becomes `REVIEW_ACCEPTED`; it remains distinguishable from an exact match. New portal evidence generates a new run; old review events remain historical.

Case kinds: `MSME_REVIEW`, `RULE37_REVIEW`, `RULE37A_REVIEW`, `IRN_REVIEW`, `NOTICE_REVIEW`. Generic lifecycle: OPEN -> EVIDENCE_REQUIRED -> REVIEW_READY -> CLOSED, with explicit reopening event. Filing/payment facts are evidence fields, not inferred from that generic status. A simulated filing observation has `provenance=SYNTHETIC_DEMO`; UI and PDF preserve it.

Proposal creation locks in current run/result versions, requested reviewed allocations and available balance facts. It cannot include negative amounts, unknown gross totals or rejected records. A changed source version makes the proposal STALE. Approval is an accountant's review of a demonstration proposal, not bank authorization. Export labels it `PROPOSAL_ONLY`. No bank submission endpoint exists in v1.

## Durable jobs and message ambiguity

The implemented dispatcher claims import/run work in a short SQLite BEGIN IMMEDIATE transaction. Run jobs receive a random lease token and every completion compares ownership; imports retain their Phase 3 state gate. SQLite has no row-lock or SKIP LOCKED API. The OS data lock permits one backend process, and the single dispatcher permits one global heavy task. Imports and runs share the five-pending-job workspace limit. There is no lease heartbeat or automatic three-attempt retry in the current implementation. On restart, QUEUED jobs resume; interrupted RUNNING jobs become FAILED/PROCESSING_INTERRUPTED. An explicit new run or derived import is required to retry. Do not create a second fallback worker against the same database.

Long side effects are separated from transactional state. Reconciliation/PDF jobs can safely regenerate derived outputs with deterministic object keys and unique artifact records. A complete output requires successful file storage plus database record; a crash may leave an orphan file that cleanup can find by reservation/job ID.

WhatsApp input is persisted after signature validation before returning HTTP 200. Duplicate event keys are acknowledged without duplicate jobs. Sending has a different risk: after a timeout Meta may already have accepted the message. Set `wa_outbox.state=UNKNOWN` and wait for status/operator review; never blindly resend an ambiguous accepted send. Store returned provider IDs and handle status callbacks independently from inbound commands.

## Reports and essential operational behavior

PDF: workspace/registration/period, source hashes, snapshot timestamps, counts, selected discrepancies, review timeline, case facts, missing evidence, sample markers and factual limitations. A manifest records report hash and source IDs in the database. Escape user text and use a bundled tested font for rupee/Unicode output. The hash detects changes relative to the recorded digest; it is not certification.

Do not cache business truth in process memory. Browser lists paginate; backend queries cap rows; report jobs paginate/stream without unbounded accumulation. Temporary files are removed after processing. Audit logs record action metadata without complete invoices, phone numbers, provider tokens or bank accounts.

Definition of foundation proof: real SQLite constraints reject duplicate assignments; a private file survives process restart; a crash leaves a discoverable job state; both channel adapters call the same services; unauthorized identifiers cannot reach repository queries without workspace scoping.

## Transaction boundaries in detail

### Create a reconciliation run

The service authorizes the member, validates both import IDs within the workspace, and reserves the idempotency key. In one transaction it confirms READY state/context, inserts the run and inserts its processing job. Commit before returning 202.

- If an import is missing/inaccessible: return NOT_FOUND.
- If not confirmed or contexts differ: current RunCreate returns SOURCE_CONTEXT_INVALID.
- If contexts differ: return SOURCE_CONTEXT_INVALID.
- If another workspace processing job is RUNNING: accept the next valid request as QUEUED. Only the configured queue-depth ceiling returns QUEUE_FULL; initial ceiling is five queued/running import/run jobs per workspace. Current limit error is QUEUE_FULL with Retry-After.
- If the commit fails: no successful receipt is returned.
- If the response is lost: the same idempotency key retrieves the original run/job.

The worker reads immutable inputs, computes outside the transaction, then writes complete results and summary with a lease-ownership check. It does not publish partial results while the run says COMPLETED.

### Accept a candidate

Use BEGIN IMMEDIATE and a conditional update to verify expected_version; SQLite does not support SELECT FOR UPDATE. Confirm the candidate belongs to that result and passes immutable hard gates. Check assigned portal availability, update assignment/status/version, insert review event and recompute summary in the same transaction.

- Database unique assignment settles a contested portal claim.
- Two concurrent reviews cannot both succeed against the same result version.
- A constraint conflict rolls back the whole transaction and returns ASSIGNMENT_CONFLICT.
- Do not catch a statement error and continue using a failed SQLite operation/transaction.
- Return the freshly committed representation; website and bot display it.

### Supersede a snapshot

Freeze the new confirmed import and record its parent. Retain old source bytes and historical runs. Mark prior applicable runs SUPERSEDED only after a replacement run is complete, or explicitly show a pending replacement; never remove all usable history merely because an upload began.

Proposals whose source versions are no longer current become STALE. Closed cases are not silently rewritten; add an observation/reopen event where relevant. Old reports remain historical artifacts with the old source version displayed.

## Suggested database checks

These are requirements for reviewed migration SQL, not SQL already applied:

| Constraint | Purpose |
|---|---|
| version >= 1 | Prevent meaningless optimistic versions |
| period matches YYYY-MM and valid month | Prevent mixed period encodings |
| monetary components >= 0 | Prevent negative invoice/proposal magnitudes |
| score between 0 and 100 | Bound candidate score |
| size_bytes between 0 and application maximum | Enforce stored metadata bounds |
| unique import/source_row_number | Prevent parser replay duplicate records |
| unique run/purchase_document_id | One result per accepted purchase |
| partial unique assigned portal per run | One portal row cannot settle two purchases |
| composite tenant foreign keys | Prevent cross-workspace references |
| case kind/state allowed values | Keep persisted states aligned with contracts |
| lease owner required for RUNNING job | Make ownership visible |
| outbox logical_key unique | Prevent duplicated intended notification |

Use application validation for rich errors and database constraints for contested guarantees. Neither replaces the other.

## Index and query budget

Current unique indexes cover scoped resources, run/source position, assignments and result/candidate ranks; run_jobs has a state/created_at/id queue index. Future case/report indexing is added with those features; there is no current next_attempt_at column. Foreign-key lookup indexes are intentional, not every possible field indexed by default.

Never return all original source rows in every summary response. Load result detail on demand. Paginate audit/case timelines. Keep original JSON behind authorized detail access; redact unneeded supplier contacts from standard list results.

Start with one batch insertion strategy for canonical rows and one bounded read for the 2,000-row ceiling. Measure before adding streaming complexity. Connections belong to one operation and close in finally; there is no connection pool or shared cross-thread connection.

## Service contracts inside Python

| Service | Inputs | Output / effect |
|---|---|---|
| ImportService | AuthorizedContext, bytes/metadata, adapter choice | ImportReceipt; durable file/parse job |
| MappingService | Context, import, mapping, version | Updated preview job; no hidden source rewrite |
| ReconciliationService | Immutable canonical sources, policy version | Domain results/explanations |
| RunService | Context, import IDs, operation key | Durable run/job |
| ReviewService | Context, result, candidate/action, version/reason | Atomic result + audit + summary |
| CaseService | Context, typed facts/evidence, version | Persisted timeline/state |
| ProposalService | Context, selected versions/allocations | Frozen non-executing proposal |
| ReportService | Context, source refs | Durable artifact job/manifest |
| WhatsAppCommandService | Verified sender link, parsed command | Same application command + outbox intent |

AuthorizedContext contains server-verified actor, workspace and role. It is built at trusted boundaries, not deserialized directly from user JSON. Domain functions can be tested without provider credentials; service tests prove actual transactional behavior.

## Recovery and cleanup visibility

Maintain finite queries for expired reservations, abandoned leases, incomplete artifact writes and queued outbox records. Operator diagnostics show identifiers/counts/error codes, not confidential file payloads. A permanent failure remains visible for user recovery.

Processing cleanup must use reserved object keys and compare operation state before deleting. A cleanup task cannot delete a successfully referenced file merely because its original reservation timestamp is old. Storage deletion can fail independently from database cleanup; keep the reference and retry state until confirmed filesystem deletion.

## Implementation simplifications to keep

- One common exception-to-contract mapper.
- One database session factory and consistent transaction ownership.
- One canonical money parser, shared across sources.
- One conservative identity normalization policy.
- One provider adapter per external system.
- One durable queue mechanism rather than several background-task styles.
- One server-derived summary consumed by website, bot and PDF.
- One reviewed SQLite schema upgrade path; initial startup only initializes an exclusively new file, and rejects unknown existing schemas.
- Small orchestration functions with named transaction/side-effect steps.
- Factual error states instead of catch-all empty success.


## Implemented Phase 3 import behavior

The current adapters are csv-v1 and xlsx-v1 for structured PURCHASE/PORTAL_2B tables and canonical-demo-v1 for explicitly synthetic portal JSON. This is our documented JSON format, not an official GSTR-2B exporter. GSTIN checks are structural only; they do not verify a registration, checksum, filing or legal credit entitlement.

CSV is UTF-8 with optional BOM and an exact header row. XLSX is read-only with explicit sheet selection if more than one worksheet exists. Exact numeric XML text is preserved before openpyxl converts cells, so a monetary value is never accepted by silently rounding a binary float. ISO dates or midnight Excel date cells are supported. Files with formulas anywhere, workbook errors, macros/binary parts, external relationships, XML entities, archive traversal, duplicate archive entries or excessive expansion are refused. Other XLSX layouts need an explicit adapter.

`row_number` is the one-based data-record position after the header. Blank data records remain rejected preview rows; skipping one must not shift later row identities. CSV multiline fields count as one data record. Original cell values remain private alongside validation reasons. Whitespace-only required identifiers are rejected. Exact component sums must agree with gross amounts when all components are known; supplied total_tax must agree with the component sum. Unknown components remain null with COMPONENTS_UNKNOWN. An older invoice date may belong to a later selected accounting period; date/month equality is deliberately not a gate.

Missing mandatory mappings produce AWAITING_CONFIRMATION with global MAPPING_REQUIRED reasons and no accepted records. No import with global mapping errors or zero accepted rows can be confirmed. Duplicate purchase identities/voucher IDs reject all affected rows; duplicated portal identities remain individually visible and flagged for the future reconciler's ambiguity handling.

Every mapping request creates or reuses a separate derived import, including when the original is awaiting confirmation or failed. The original preview stays immutable. A READY source maps to a new superseding preview; confirmation requires explicit supersession acknowledgement and a still-READY parent in exactly the same context. A normal partial import requires allow_rejected_rows=true. Confirmation changes state/version and appends its audit event in one transaction; stale versions conflict, and identical idempotent retries do not repeat the event.

Import identity includes scope, registration, kind, period, byte hash, declared mapping/sheet hash, adapter, supersession parent and derivation parent. Stored display mapping can be auto-detected; the identity retains the declared input hash for repeatable upload deduplication. A repeated file reuses one private BLOB for the same registration/workspace. Filename does not define content identity. Idempotency additionally includes the submitted metadata and display filename, so a reused request key with changed input conflicts.

Job success means the preview was atomically persisted, not that an import was confirmed. QUEUED jobs survive restart and resume. RUNNING jobs interrupted by shutdown/crash become visible FAILED/PROCESSING_INTERRUPTED; no partial preview or READY state is published. Recovery uses a new derived mapping import rather than silently retrying an unfinished parse. No source-download, matching, report or WhatsApp behavior is implemented in this phase.

## Implemented Phase 4 persistence and decisions

Current schema v3 adds runs, run_jobs, run_results, run_candidates, run_events and run_operations to the preserved Phase 3 tables. The earlier broad conceptual table catalog remains a design for later cases/reports; it is not the list of tables already created. Source records remain import_rows, addressed by import ID plus source row number. Public document IDs are deterministic UUIDv5(import UUID, row number); result/candidate UUIDs are derived within each run, preserving distinct purchase, portal, result and candidate identities.

Each run has an immutable context revision and policy/source snapshot, plus a mutable version for result-summary updates. The saved policy includes adapter-independent amount tolerance, threshold/gap, explicit comparison implementation and resource limits. Source snapshots retain exact confirmed versions, hashes, adapters, accepted/rejected counts and provenance. Unknown total tax has separate summary counts; the monetary exposure fields contain only the known subtotal. Credit-note exposure is separate and is not netted against invoice/debit-note exposure.

Database foreign keys bind each result to its run and source pair, each candidate to the same run/result/portal import, and review events to their result/candidate. Unique assigned portal row per run prevents double assignment. CHECK constraints prevent completed runs without summaries, accepted matches without assignments and RUNNING run jobs without a lease. Source rows are immutable after preview; a review rechecks live source state/version, row eligibility, identity/amount gates and assigned availability.

Exact identity reservations precede fuzzy candidate enumeration. Duplicate identity groups include rejected source rows with complete canonical identity, preventing an invalid copy from hiding a conflict. Purchase duplicates rejected by Phase 3 stay excluded from accepted purchase totals. A related rejected snapshot row becomes evidence incomplete when its invalid date prevents matching; it is not silently cleaned into a match. Every eligible shared portal edge makes touching purchase results ambiguous. Limits are explicit failures, never a truncated clean subset.

Summary, results and job success commit atomically. Stale lease output is ignored. A source superseded during computation causes SOURCE_SUPERSEDED and no completed partial output. A failed newer run leaves older completed runs intact; successful replacements supersede lower context revisions. Reviews of a historical run or superseded source fail. Idempotency retries return the original committed representation without replaying the mutation; GET retrieves current state.
