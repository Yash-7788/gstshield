# GST-Shield — authoritative contracts and cross-layer alignment

> **Active first-demo scope (2026-10-03):** The user selected a database-free live demo. Use one process and bounded temporary in-memory state; restart/redeploy may erase state. Database, managed storage, durable jobs and database-backed guarantees below describe a later phase. See [current backend scope](../backend/README.md). Removing persistence does not remove access checks or callback signature requirements.

Contract baseline v1, 2026-10-03. This document owns wire names, enum semantics and endpoint behavior. Planned models must be reflected in generated OpenAPI and the database migration before frontend integration. [03](03_BACKEND_AND_DATA_SPEC.md) owns algorithms/persistence; [04](04_WEBSITE_AND_WHATSAPP_INTEGRATION.md) maps channels.

## General wire rules

Base path `/api/v1`. JSON uses snake_case. UUIDs identify persisted resources; human labels such as R-104 are display-only. Dates are ISO `YYYY-MM-DD`; period is `YYYY-MM`; timestamps are UTC RFC3339 ending Z. Monetary JSON is a fixed two-decimal string, currency INR. Similarity scores are decimal strings in 0–100, not probabilities.

Absent optional fields and null are documented distinctly. Create requests may omit defaultable options; persisted responses include declared nullable fields. For PATCH, omission means unchanged and explicit null means clear only where permitted. Pydantic request models reject unexpected fields. Do not accept client-computed total_tax, scores, match state, owner IDs or verified provenance as authority.

Selected registration belongs to the authorized workspace. If body registration_id conflicts with import metadata, return CONTEXT_MISMATCH; never switch context silently. Read responses include IDs/context needed to prevent stale frontend cross-workspace updates.

Public routes: liveness, bounded readiness, Meta challenge/callback with their own authentication, and opaque artifact capability redemption. Everything else requires JWT, active membership and role authorization.

## Shared enums

| Name | Exact values |
|---|---|
| MemberRole | OWNER, REVIEWER, VIEWER |
| Provenance | SYNTHETIC_DEMO, USER_PROVIDED, VERIFIED_SOURCE |
| ImportKind | PURCHASE, PORTAL_2B |
| ImportState | RECEIVED, UPLOADING, PARSING, AWAITING_CONFIRMATION, READY, FAILED, SUPERSEDED |
| JobState | QUEUED, RUNNING, SUCCEEDED, FAILED |
| RunState | QUEUED, RUNNING, COMPLETED, FAILED, SUPERSEDED |
| ResultStatus | EXACT_MATCH, FUZZY_SUGGESTION, AMOUNT_MISMATCH, MISSING_IN_SNAPSHOT, AMBIGUOUS, EVIDENCE_INCOMPLETE, REVIEW_ACCEPTED, REJECTED |
| DocumentType | INVOICE, DEBIT_NOTE, CREDIT_NOTE |
| CaseKind | MSME_REVIEW, RULE37_REVIEW, RULE37A_REVIEW, IRN_REVIEW, NOTICE_REVIEW |
| CaseState | OPEN, EVIDENCE_REQUIRED, REVIEW_READY, CLOSED |
| ProposalState | DRAFT, APPROVED, EXPORTED, STALE |
| ArtifactKind | RECONCILIATION_PDF, EVIDENCE_PDF, PROPOSAL_CSV, ROW_ERRORS_CSV |
| DeliveryState | QUEUED, SENDING, ACCEPTED, DELIVERED, READ, FAILED, UNKNOWN |
| IrnState | NOT_PROVIDED, FORMAT_INVALID, FORMAT_ONLY, VERIFIED, VERIFICATION_FAILED, UNKNOWN |

Database representation uses these uppercase strings consistently; provider status strings are explicitly mapped at adapters. Unknown provider values become recorded unknown facts, not a default successful enum. New enums require schema/OpenAPI/client changes together.

## Success, errors and pagination

Success has `data` and `meta.request_id`; paginated responses add `meta.next_cursor`. No second raw/envelope format. Multipart upload errors use the same JSON error envelope. Download routes stream bytes on success and JSON error on failure; callers check status/content type before saving.

```json
{
  "data": {"id": "00000000-0000-4000-8000-000000000010", "state": "QUEUED"},
  "meta": {"request_id": "req_104"}
}
```

```json
{
  "error": {
    "code": "CONTEXT_MISMATCH",
    "message": "The uploaded recipient does not match the selected registration.",
    "details": [{"field": "recipient_gstin", "row": null, "reason": "registration_mismatch"}],
    "retryable": false
  },
  "meta": {"request_id": "req_105"}
}
```

| HTTP | Codes / behavior |
|---|---|
| 400 | INVALID_REQUEST, UNSUPPORTED_FORMAT, CONTEXT_MISMATCH |
| 401 | AUTH_REQUIRED, TOKEN_INVALID; Meta SIGNATURE_INVALID on callback |
| 403 | ROLE_FORBIDDEN for in-scope forbidden action |
| 404 | NOT_FOUND for absent/inaccessible tenant object or capability |
| 409 | VERSION_CONFLICT, IDEMPOTENCY_CONFLICT, ASSIGNMENT_CONFLICT, IMPORT_NOT_READY, RUN_SUPERSEDED, WORKSPACE_BUSY |
| 413 | FILE_TOO_LARGE, ARCHIVE_TOO_LARGE, ROW_LIMIT_EXCEEDED |
| 422 | VALIDATION_FAILED, MAPPING_REQUIRED, INCOMPLETE_EVIDENCE |
| 429 | RATE_LIMITED with Retry-After |
| 503 | DEPENDENCY_UNAVAILABLE, FEATURE_UNAVAILABLE |

Stable cursor order is `(created_at, id)` or `(source_row_number, id)` for run results, specified per endpoint. Opaque cursor encodes context/order, is validated and cannot override workspace filters. Page size defaults 50, max 100. List empty data is valid; authorization failures are never empty-success.

## Idempotency and concurrency

Create imports, runs, reviews, cases, proposals and artifact requests accept `Idempotency-Key`, a UUID generated once per intended action. Persist scope `(workspace, actor, route, key)` and canonical request hash. Reuse with identical request returns the original operation; different payload returns 409. Concurrent reservations are protected by uniqueness. Operation references survive response loss.

For upload hashing include bytes, declared context, mapping and adapter choice. A separate import content uniqueness key handles same file with a different request key. Mapping version changes legitimately produce a different operation. Default idempotency retention is seven days for the synthetic demo; artifact/import identities remain beyond it until cleanup.

Mutating existing resources requires `expected_version`. Atomic update compares version and advances it only on success. A network failure does not tell the client whether the update committed; retry the same key or fetch the resource. GET can be retried; ambiguous Meta sends cannot be retried as if they were pure reads.

One workspace job running does not reject the next valid operation: it is QUEUED. Initial pending-heavy-job ceiling is five per workspace; only exceeding that ceiling returns WORKSPACE_BUSY. Database coordination enforces the documented one-global-heavy-job execution limit even if a local fallback is also connected.

## Endpoint catalog

All workspace paths below are prefixed `/api/v1/workspaces/{workspace_id}`. Mutations require OWNER/REVIEWER except membership/demo administration. `202` means a durable operation exists, not processing success.

| Method / suffix | Request | Response / status |
|---|---|---|
| GET /api/v1/workspaces | Cursor/limit | Membership-authorized Workspace[] / 200 |
| GET /registrations | Cursor/limit | Registration[] / 200 |
| POST /imports | Multipart file + fields below | ImportReceipt / 202 |
| GET /imports/{import_id} | None | ImportDetail / 200 |
| GET /imports/{import_id}/rows | state/cursor/limit | PreviewRow[] / 200 |
| PATCH /imports/{import_id}/mapping | MappingPatch | ImportReceipt / 202 |
| POST /imports/{import_id}/confirm | ImportConfirm | ImportDetail / 200 |
| POST /runs | RunCreate | RunReceipt / 202 |
| GET /runs/{run_id} | None | RunDetail / 200 |
| GET /runs/{run_id}/results | status/cursor/limit | Result[] / 200 |
| GET /results/{result_id} | None | ResultDetail with candidates / 200 |
| POST /results/{result_id}/review | ReviewCreate | ResultDetail / 200 |
| GET /jobs/{job_id} | None | JobDetail / 200 |
| GET /cases | kind/state/cursor/limit | Case[] / 200 |
| POST /cases | CaseCreate | CaseDetail / 201 |
| GET /cases/{case_id} | None | CaseDetail / 200 |
| POST /cases/{case_id}/evidence | CaseEvidenceCreate | CaseDetail / 200 |
| POST /cases/{case_id}/transition | CaseTransition | CaseDetail / 200 |
| POST /proposals | ProposalCreate | ProposalDetail / 201 |
| POST /proposals/{proposal_id}/approve | expected_version, reason | ProposalDetail / 200 |
| POST /artifacts | ArtifactCreate | ArtifactReceipt / 202 |
| GET /artifacts/{artifact_id} | None | ArtifactDetail / 200 |
| GET /artifacts/{artifact_id}/download | None | Private attachment stream / 200 |
| POST /whatsapp/link-code | registration_id, period | LinkCodeReceipt / 201 |
| GET /whatsapp/link | None | Current own LinkDetail or null / 200 |
| PATCH /whatsapp/link/context | registration_id, period | LinkDetail / 200 |
| DELETE /whatsapp/link | None | data {revoked:true} / 200 |

Explicitly no bank-submit, GST-file, escrow-release or provider-status-override endpoint. Future features add contracts rather than overloading a review command into execution.

## Import contract

Multipart fields: `file`, `kind`, `registration_id`, `period`, `adapter_version`, optional `sheet_name`, optional JSON `mapping`, optional `supersedes_import_id`. Provenance is server-set: synthetic adapter/fixture has SYNTHETIC_DEMO; ordinary user upload has USER_PROVIDED. User upload is not VERIFIED_SOURCE merely because its filename claims official origin.

`ImportReceipt`: id, workspace_id, registration_id, kind, period, state, job_id, version, file_sha256, adapter_version, provenance. ImportDetail adds accepted_rows, rejected_rows, duplicate_rows, errors, generated_at and selected-sheet/mapping information.

`MappingPatch`: expected_version, sheet_name nullable, mapping dictionary from canonical field to source header. Mandatory fields cannot map to the same source column ambiguously. Patching an already READY import creates a new derived import rather than rewriting immutable data.

`ImportConfirm`: expected_version, allow_rejected_rows default false, confirmed_supersession default false. A rejected-row import requires explicit acknowledgement. A superseding import requires confirmation and same workspace/registration/period/kind.

Canonical demo portal input:

```json
{
  "format": "canonical-demo-v1",
  "provenance": "SYNTHETIC_DEMO",
  "recipient_gstin": "27ABCDE1234F1Z5",
  "period": "2024-05",
  "generated_at": "2024-06-14T00:00:00Z",
  "documents": [
    {
      "supplier_gstin": "27PQRSX5678L1Z2",
      "invoice_number": "INV-001",
      "invoice_date": "2024-05-10",
      "document_type": "INVOICE",
      "taxable_value": "1000.00",
      "igst": "0.00", "cgst": "90.00", "sgst": "90.00", "cess": "0.00",
      "other_charges": "0.00", "round_off": "0.00", "gross_total": "1180.00",
      "irn": null
    }
  ]
}
```

Identifiers here are invented illustrative values, not verified registrations/checksums. Fixture implementation must supply identifiers appropriate to its declared validation mode without pretending government verification. This is our format, not a claimed GSTR-2B schema.

## Run and result contract

```json
{
  "registration_id": "00000000-0000-4000-8000-000000000001",
  "period": "2024-05",
  "purchase_import_id": "00000000-0000-4000-8000-000000000002",
  "portal_import_id": "00000000-0000-4000-8000-000000000003"
}
```

Policy version is selected server-side; response exposes it. RunReceipt includes run_id, job_id, state. RunDetail includes immutable source IDs/hashes, policy_version, provenance, summary nullable, timestamps and superseded_by_run_id nullable.

Summary has `accepted_purchase_rows`, `counts` keyed by every ResultStatus, `tax_exposure_review`, `credit_note_tax_review`, `currency`. Counts include zero values. Pending/failed run has summary=null, never a zero-total success masquerading as an unfinished result.

Result includes id, run_id, purchase_document_id, source_row_number, status, version, invoice identity, component amounts, total_tax, assigned_portal_document_id nullable, provenance and `reason_codes`. Detail adds candidates and review timeline. Candidate fields: portal_document_id, original_invoice_number, invoice_date, score, rank, hard_gates_passed, amount_differences, reason_codes. Amount differences are signed decimal strings, scores fixed decimal strings.

Useful reason codes: DUPLICATE_IDENTITY, SAME_NUMBER_DIFFERENT_YEAR, COMPONENTS_UNKNOWN, TAX_COMPONENT_MISMATCH, GROSS_TOTAL_INVALID, MULTIPLE_CANDIDATES, LOW_SCORE_GAP, SOURCE_SUPERSEDED, IRN_FORMAT_ONLY. Reason labels are UI copy; server codes remain stable.

Review request:

```json
{
  "expected_version": 1,
  "action": "ACCEPT_CANDIDATE",
  "candidate_id": "00000000-0000-4000-8000-000000000020",
  "reason": "Verified against the source voucher."
}
```

Use actual candidate `id` on responses as well as portal_document_id. Actions: ACCEPT_CANDIDATE or REJECT_MATCH. Reject requires reason and candidate_id=null. Accept requires eligible candidate and no conflicting portal assignment. Reviewer does not bypass amount/identity hard gates; insufficient evidence becomes a case for correction/new import.

## Job contract

JobDetail: id, kind, state, attempt, phase, processed_rows nullable, total_rows nullable, output_ref nullable, error nullable, created_at, started_at nullable, finished_at nullable. Phase is human-readable current work, not guaranteed percentage. Failed job has error.code/message/retryable; frontend can present recovery without leaking stack traces.

Completed output_ref identifies the run/import/artifact. Status is authorized by workspace just like the output; a guessed job ID is not public progress information. Restart may move expired RUNNING to QUEUED with increased attempt, preserving the logical operation ID.

## Case and proposal contracts

CaseCreate: registration_id, purchase_document_id, kind, amount, currency, facts, provenance determined from submitted evidence. Facts are a kind-specific validated schema. Rule37A fields include original_claim_period, original_claim_amount, reversal_period, reversal_amount, supplier_return_period and observation_refs. Nullable unknowns remain null; an unverified statement cannot become verified by a boolean.

CaseEvidenceCreate: expected_version, event_kind, file_id nullable, facts, note. Require same-workspace evidence file. CaseTransition: expected_version, target_state, reason. REVIEW_READY requires the kind's required facts/evidence; CLOSED records human resolution, not filing/payment execution. Reopen uses an explicit authorized transition with reason.

ProposalCreate: run_id, selected_result_ids, allocations, expected_result_versions. Allocation values have document_id, amount, purpose (`SUPPLIER_PROPOSED` or `INTERNAL_RESERVE_ILLUSTRATIVE`). No client bank account is trusted. Initial exports omit real account details or use conspicuously synthetic approved fixture beneficiaries. Unknown balance facts block claims of an executable payable amount.

A proposal snapshot records currency, gross/payment observations, allocations and all referenced versions. Total must be nonnegative and within a fully evidenced recorded payable balance. Approval/export never updates amount_paid. A source change makes it STALE and requires a new reviewed proposal.

## Artifact and capability contracts

ArtifactCreate: kind, one of run_id/case_id/proposal_id, expected_source_version where applicable. Backend validates exactly the required source for the chosen kind. Returns job_id/artifact_id; download remains unavailable until file storage and manifest commit succeed.

ArtifactDetail: id, kind, state (`PENDING/READY/FAILED`), source_ref, sha256 nullable, size_bytes nullable, provenance, created_at, expires_at nullable. Filename is sanitized. MIME is fixed by kind. The generated report includes display disclaimers from 07.

Capability route: GET `/downloads/{opaque_token}` outside /api/v1. Token is a secret, not a user ID. Redemption atomically checks expiry, revoked state, download budget and originating link's membership. Stream private bytes with no-store; return generic 404 on failure. Never redirect to a long-lived public object.

## WhatsApp adapter alignment

Web commands use Auth subject; WhatsApp uses wa_link.user_id after current membership verification. Both construct the same application command DTO. `RUN` uses latest READY imports in the selected context; if multiple applicable sources or supersession ambiguity exist, ask the user to select in the website rather than guess.

Provider payload is not our public API contract. Adapter accepts validated known event structures and records unsupported types; a status callback does not look like a command. Sender identity comes from verified callback metadata, never user text. Every logical event maps to at most one operation key.

## Changes and contract proof

Before merging a field change, update Pydantic, generated OpenAPI/types, DB migration/defaults and adapters together. Test a genuine serialized response consumed by the website client, not only parallel handwritten interfaces. Keep a contract fixture for success/error/pagination/money/unknown-state cases.

Backward-compatible optional additions can stay v1. Renames, enum semantics, money units or null/default meaning require an explicit migration and coordinated client change. Never conceal drift with `any`, generic “value or zero,” or a success fallback that turns server failures into empty results.

## Alignment checklist

- [ ] No field has different units in database/API/website/WhatsApp.
- [ ] No client-supplied tenant/user ID grants access.
- [ ] Money remains exact and string-serialized end to end.
- [ ] Each completed run has exactly one result per accepted purchase record.
- [ ] Summary counts and detailed categories agree after review.
- [ ] Candidate IDs and portal IDs have distinct fields.
- [ ] Null unknown values survive import and display.
- [ ] Every enum is represented in UI and database validation.
- [ ] Job success requires committed visible output.
- [ ] New snapshot creates explicit supersession rather than overwriting history.
- [ ] No proposal download is represented as payment execution.
- [ ] Physical WhatsApp results equal the persisted website run.
