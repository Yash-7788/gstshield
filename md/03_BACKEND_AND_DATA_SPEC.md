# GST-Shield — backend and data specification

> **Active PC-only scope (2026-10-03):** Run the website backend on the local PC. No Render, cloud server, external database, ORM or cloud-storage service. Phase 1 provides the HTTP/configuration foundation only. Phase 2 will persist data in a local SQLite file under backend/data. The phase plan in [05](05_BUILD_AND_VERIFICATION_PLAN.md) and [backend README](../backend/README.md) overrides the older cloud, managed-auth and temporary-memory proposals below. Local storage does not remove access checks or callback signature requirements.

Baseline 2026-10-03. Planned implementation. [08_CONTRACTS_AND_ALIGNMENT.md](08_CONTRACTS_AND_ALIGNMENT.md) owns wire names/enums; [06_SECURITY_AND_PRIVACY.md](06_SECURITY_AND_PRIVACY.md) owns access rules; [07_RULES_AND_INTEGRATION_TRUTH.md](07_RULES_AND_INTEGRATION_TRUTH.md) owns legal/provider claims.

## Architecture and dependency direction

```text
Existing website ── JWT ──> FastAPI routes ──> application services
Meta webhook ── signature ──> durable inbox ──> linked-user command adapter
                                               │
                             same application services
                                               │
                   PostgreSQL app schema + private file storage
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
  app/db/                     # models, session factory, repositories
  app/adapters/               # storage, Meta, portal format adapters
  app/jobs/                   # durable claim, dispatcher, recovery
  app/security/               # JWT, HMAC, capabilities, limits
  migrations/                # Alembic
  tests/fixtures/             # synthetic data and expected outputs
frontend/                    # supplied website, preserve its framework
docs/                        # this eight-document pack
```

Start with one Uvicorn worker. Parsing/PDF creation use a bounded thread executor; impose input bounds before launching work. Database sessions belong to one operation, never shared across parallel tasks. Do not keep a transaction open during Storage or Meta requests.

## Persistence conventions

All application tables live in the unexposed `app` schema. UUID primary keys are generated server-side. Timestamps are timezone-aware UTC. Monetary values are `numeric(18,2)` INR, represented by Decimal in Python and strings in JSON. Scores are `numeric(5,2)`. Database integer `version` supports optimistic concurrency.

Every tenant-owned row carries `workspace_id`; child references use composite `(workspace_id, id)` foreign keys where appropriate to prevent cross-workspace references. Index each unique pair referenced by those keys. Authentication identity is the verified Auth subject; membership comes from our database, not editable profile metadata.

| Entity | Core fields / constraints |
|---|---|
| `workspaces` | id, name, created_at |
| `memberships` | workspace_id, user_id, role (`OWNER/REVIEWER/VIEWER`), active; unique workspace/user |
| `registrations` | workspace_id, gstin, display_name; unique workspace/GSTIN |
| `files` | workspace_id, registration_id, kind, private object_key, original_name, size_bytes, sha256, provenance, uploaded_by, created_at; no public URL |
| `imports` | file_id, kind, period, adapter_version, mapping_json, state, counters, generated_at, supersedes_import_id, version; unique workspace/registration/kind/period/file_hash/mapping_hash/adapter_version |
| `source_rows` | import_id, row_number, original_json, canonical_json, validation_errors; unique import/row |
| `purchase_documents` | import_id, registration_id, source_row_number, voucher_id, canonical fields below; unique import/voucher_id |
| `portal_documents` | import_id, registration_id, source_row_number, canonical fields; preserve duplicates for explicit detection |
| `runs` | workspace/registration/period, purchase_import_id, portal_import_id, policy_version, state, summary_json, started_at, completed_at, superseded_by_run_id |
| `results` | run_id, purchase_document_id, status, assigned_portal_id nullable, explanations, version; unique run/purchase |
| `candidates` | id, result_id, portal_document_id, score, rank, gates_json; unique result/portal |
| `review_events` | result_id, actor, action, previous/new state, reason, created_at; append-only |
| `cases` | registration_id, purchase_document_id, kind, state, amount, claim_period, reversal_period, supplier_return_period, facts_json, version |
| `case_events` | case_id, actor, event_kind, evidence_file_id nullable, sample flag, facts_json, created_at |
| `proposals` | run_id, state, source_versions_json, allocations_json, total, created_by, approved_by nullable, version |
| `artifacts` | run_id/case_id/proposal_id, kind, file_id, manifest_json, created_at |
| `jobs` | kind, workspace_id, payload_json, state, lease_token, lease_until, attempts, error_code, next_attempt_at, timestamps |
| `job_coordination` | singleton heavy-claim coordination row; lock only during lease inspection/claim, never during computation |
| `wa_links` | user_id, workspace_id, registration_id, active_period, wa_id, active; unique active phone link for this app |
| `link_codes` | user/workspace/context, code_hash, expires_at, consumed_at; unique hash |
| `wa_events` | provider_event_key unique, event_kind, expected_sender_account, minimal_payload, state, received_at |
| `wa_outbox` | logical_key unique, destination link, body/artifact reference, state, provider_message_id nullable, attempts |
| `download_capabilities` | token_hash, artifact_id, originating_link_id, expires_at, revoked_at |
| `idempotency_keys` | workspace, actor, route, key, request_hash, operation_id/response; unique workspace/actor/route/key |
| `audit_events` | workspace, actor, action, target_type/id, request_id, safe metadata, created_at |

For an assigned portal record enforce a partial unique index on `(run_id, assigned_portal_id)` where assigned_portal_id is not null. This prevents two purchase records claiming the same portal row. Candidate suggestions are not assignments. Tenant-scoped referenced rows must be validated even for JSON payloads; JSON is not a foreign-key substitute.

Do not add a global uniqueness constraint that destroys repeated snapshot observations. The same invoice may appear in successive snapshots; imports remain immutable and run selection chooses the relevant snapshot. Duplicates within an import are rejected or categorized, never added twice to monetary totals.

## Canonical document values

Required purchase fields: voucher_id, recipient_gstin, supplier_gstin, invoice_number, invoice_date, document_type, taxable_value, igst, cgst, sgst, cess, other_charges, round_off, gross_total. Optional: supplier_name, irn, msme_classification, acceptance_date, written_terms_days, amount_paid, evidence references. Raw document_number is preserved alongside conservative comparison keys.

The download template provides explicit tax components. A legacy template with only total_tax can be imported into preview, but is marked `COMPONENTS_UNKNOWN` and cannot become `EXACT_MATCH` until mapped accurately. Zero is a supplied known value; null means unknown. Do not invent zero component values from absent columns.

Portal rows carry the same invoice identity/tax components plus portal availability metadata, source table, generated_at and period. The recipient may be inherited from an authenticated source header after confirming it matches the selected registration. Optional unsupported sections remain recorded as unsupported, not empty-success.

Invoice monetary check:

```text
total_tax = igst + cgst + sgst + cess
gross_total = taxable_value + total_tax + other_charges + round_off
```

For invoice/debit-note rows, monetary magnitudes are nonnegative except signed `round_off`. Credit notes also store nonnegative magnitudes and an explicit document type; a signed ledger projection applies the direction later. This prevents negative payouts. Reject non-finite values, ambiguous localized decimals and unexpected precision. The fixed template accepts dot decimals without grouping; mapping preview may explicitly normalize a known export locale.

## Import lifecycle

1. Authorize context and enforce body/row/archive limits. Compute SHA-256 from bytes.
2. Reserve a file/import record in a short transaction with a generated private object key. Upload bytes outside that transaction. If the upload fails, record failure; do not claim durable import success.
3. Persist the object reference and enqueue parse job in the next transaction. A cleanup/recovery sweep handles reservations left incomplete by a crash.
4. Parse into staged source rows. Validate layout, recipient, period and canonical values. Detect duplicate voucher/invoice identities. Store accepted and rejected counts with row errors.
5. Enter `AWAITING_CONFIRMATION`. A confirm action freezes mapping and accepted rows; `allow_rejected_rows=true` explicitly acknowledges partial import. No rejected record enters reconciliation.
6. If superseding an existing portal snapshot, require an explicit matching-context parent ID and retain both files. A changed snapshot never edits completed historical results.

CSV: UTF-8 or UTF-8 BOM first; provide an actionable unsupported-encoding error. XLSX: user-selected sheet; read-only; reject macro formats and formula cells in required fields; check decompressed ZIP size/entry count before parse. JSON: bounded size/nesting/record counts, strict adapter selection. No PDF OCR or arbitrary ZIP import in the first build.

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

Worker claims a queued job using a short `FOR UPDATE SKIP LOCKED` transaction, assigns a random lease token and commits. Serialize heavy-job claims with a shared database coordination row, so a local fallback and deployed server cannot both claim different heavy jobs simultaneously. While holding that row, check for an unexpired RUNNING heavy job before claiming. Renew periodically; all completion writes compare token and lease ownership. Only one global heavy task and one workspace processing task run initially. On restart, expired jobs return to QUEUED up to three attempts; permanent parser/validation errors require user correction.

Long side effects are separated from transactional state. Reconciliation/PDF jobs can safely regenerate derived outputs with deterministic object keys and unique artifact records. A complete output requires successful file storage plus database record; a crash may leave an orphan file that cleanup can find by reservation/job ID.

WhatsApp input is persisted after signature validation before returning HTTP 200. Duplicate event keys are acknowledged without duplicate jobs. Sending has a different risk: after a timeout Meta may already have accepted the message. Set `wa_outbox.state=UNKNOWN` and wait for status/operator review; never blindly resend an ambiguous accepted send. Store returned provider IDs and handle status callbacks independently from inbound commands.

## Reports and essential operational behavior

PDF: workspace/registration/period, source hashes, snapshot timestamps, counts, selected discrepancies, review timeline, case facts, missing evidence, sample markers and factual limitations. A manifest records report hash and source IDs in the database. Escape user text and use a bundled tested font for rupee/Unicode output. The hash detects changes relative to the recorded digest; it is not certification.

Do not cache business truth in process memory. Browser lists paginate; backend queries cap rows; report jobs paginate/stream without unbounded accumulation. Temporary files are removed after processing. Audit logs record action metadata without complete invoices, phone numbers, provider tokens or bank accounts.

Definition of foundation proof: real PostgreSQL constraints reject duplicate assignments; a private file survives process restart; a crash leaves a discoverable job state; both channel adapters call the same services; unauthorized identifiers cannot reach repository queries without workspace scoping.

## Transaction boundaries in detail

### Create a reconciliation run

The service authorizes the member, validates both import IDs within the workspace, and reserves the idempotency key. In one transaction it confirms READY state/context, inserts the run and inserts its processing job. Commit before returning 202.

- If an import is missing/inaccessible: return NOT_FOUND.
- If not confirmed: return IMPORT_NOT_READY.
- If contexts differ: return CONTEXT_MISMATCH.
- If another workspace processing job is RUNNING: accept the next valid request as QUEUED. Only a configured queue-depth ceiling returns WORKSPACE_BUSY; initial ceiling is five pending heavy jobs per workspace.
- If the commit fails: no successful receipt is returned.
- If the response is lost: the same idempotency key retrieves the original run/job.

The worker reads immutable inputs, computes outside the transaction, then writes complete results and summary with a lease-ownership check. It does not publish partial results while the run says COMPLETED.

### Accept a candidate

Lock the result row and verify expected_version. Confirm the candidate belongs to that result and passes immutable hard gates. Check assigned portal availability, update assignment/status/version, insert review event and recompute summary in the same transaction.

- Database unique assignment settles a contested portal claim.
- Two concurrent reviews cannot both succeed against the same result version.
- A constraint conflict rolls back the whole transaction and returns ASSIGNMENT_CONFLICT.
- Do not catch a statement error and continue using an aborted PostgreSQL transaction.
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

Index workspace/context/state for import/run lists, run/source_row_number for results, result/rank for candidates, job state/next_attempt_at for claims, and case workspace/state for review queues. Foreign-key lookup indexes are intentional, not every possible field indexed by default.

Never return all original source rows in every summary response. Load result detail on demand. Paginate audit/case timelines. Keep original JSON behind authorized detail access; redact unneeded supplier contacts from standard list results.

Start with one batch insertion strategy for canonical rows and one bounded read for the 2,000-row ceiling. Measure before adding streaming complexity. Database pool configuration is a total process budget, not a per-router setting.

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

Processing cleanup must use reserved object keys and compare operation state before deleting. A cleanup task cannot delete a successfully referenced file merely because its original reservation timestamp is old. Storage deletion can fail independently from database cleanup; keep the reference and retry state until provider confirmation.

## Implementation simplifications to keep

- One common exception-to-contract mapper.
- One database session factory and consistent transaction ownership.
- One canonical money parser, shared across sources.
- One conservative identity normalization policy.
- One provider adapter per external system.
- One durable queue mechanism rather than several background-task styles.
- One server-derived summary consumed by website, bot and PDF.
- One schema migration path; no opportunistic startup DDL.
- Small orchestration functions with named transaction/side-effect steps.
- Factual error states instead of catch-all empty success.
