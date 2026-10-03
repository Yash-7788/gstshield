# GST-Shield — essential hackathon security and privacy

> **Active local implementation (2026-10-03):** This is a website with a Python backend running on the PC. Authoritative storage is a private SQLite file under `backend/data/`; accounts are provisioned locally and browser access uses revocable sessions. No external database, hosted identity, cloud storage or application hosting is selected. Phases 1–5 are complete and locally verified; Phase 6 is in final verification. Phases 7–14 are not started. The supplied frontend and real WhatsApp connection are still pending.

Baseline 2026-10-03. Planned safeguards, not a completed audit. The project handles financial documents and phone identities even in a demonstration, so these controls are part of making it work correctly. [03](03_BACKEND_AND_DATA_SPEC.md) implements them; [05](05_BUILD_AND_VERIFICATION_PLAN.md) verifies them.

## Active security phase ownership

The [expanded plan](05_BUILD_AND_VERIFICATION_PLAN.md) gives backend security/failure review its own Phase 7 and frontend security/privacy its own Phase 10. Initial access, upload limits, SQL/file boundaries, safe rendering, private state and download authorization must be implemented in their feature phases first. Performance changes in Phases 11/12 repeat affected security checks; Phase 13 adds real callback/link protections and Phase 14 verifies combined regressions. Phase 2 enforces local identity and private storage now. Later feature-specific safeguards remain planned until their routes exist.

## Threat model and scope

Protect each workspace's documents/results, authentication sessions, linking codes, report capabilities and provider credentials. Likely mistakes/attacks: another logged-in user changes an object ID; an uploaded spreadsheet consumes unbounded memory; a forged callback triggers processing; a repeated event duplicates effects; a forwarded report link exposes private evidence; browser code leaks a privileged key; a bot trusts an unrelated supplier's claims.

Use synthetic documents for public judging. Real company uploads require consent and a separately agreed retention policy. Enterprise SSO, custom anti-tamper systems and a security operations center are not hackathon prerequisites. Tenant checks, bounded files, private storage and signed callbacks are.

## Identity, authorization and permissions

Local accounts use salted scrypt (N=32768, r=8, p=3, 32-byte digest; 16-byte random salt), matching one documented OWASP scrypt configuration. Passwords are prompted in an interactive terminal, 12–128 characters, never supplied as command arguments or returned in JSON. One password hash runs at a time; unknown usernames also perform a dummy hash. Persisted login limits apply before hashing. [OWASP password storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

On every protected operation load the active workspace membership and authorize the requested resource. WhatsApp uses the linked local user and the same live membership check. No supplied `user_id`, `role`, phone number or `workspace_id` grants access by itself. Browser-supplied identity/profile fields are not a role authority.

| Action | Owner | Reviewer | Viewer |
|---|---|---|---|
| Read permitted workspace results/artifacts | Yes | Yes | Yes |
| Import, run, review and add case evidence | Yes | Yes | No |
| Create/approve proposal and report | Yes | Yes | No |
| Manage membership/registration/demo reset | Yes | No | No |
| Link own WhatsApp / unlink own phone | Yes | Yes | Yes |
| Run/import through linked WhatsApp | Yes | Yes | No |

One reviewer may approve a demonstration proposal; production maker/checker separation is deferred. The proposal has no bank execution authority. Reject inactive users or memberships on each protected operation even if the cookie has not expired. Password reset revokes sessions. Restored accounts are disabled until the operator resets intended users and reviews their restored memberships.

Return 404 for inaccessible tenant-owned objects to avoid disclosing their existence; use 403 for a known in-scope action forbidden by role. An expired token gets 401, not an empty successful result. Parameterize SQL and validate UUIDs/enums before repository calls.

## Private local storage boundary

The SQLite file is private to the backend, never a static website asset. Every connection enables foreign keys and trusted_schema=OFF. Every resource query uses the authorized workspace; inaccessible IDs return 404. Future tenant-owned child tables need composite workspace foreign keys and uniqueness when their features are implemented.

Generated private paths stay under backend/data. Reject traversal, symlinks, junctions and non-ordinary filesystem entries. A client filename is display metadata, never a file path. No cloud key, bucket permission, database role or row-level security policy is part of this SQLite setup.

One OS process lock prevents two runtimes/maintenance commands against this data directory. Quotas and free-space reserves precede writes; maximum page count limits database growth. Corrupt/foreign/unsupported existing files are preserved and refused, including a missing live file during runtime.

POSIX files are created with restrictive modes; Windows uses inherited local filesystem access controls. The database and backups are not encrypted. Use a private OS account and synthetic demo data; someone with administrative filesystem access is outside the browser authorization boundary. No anti-tamper certification is claimed.

Backups contain password hashes and private business metadata and need the same care as the live file. Restore preserves the previous file, revokes sessions, clears request windows, and disables accounts to prevent resurrecting old access. Offline password reset/review is required before reopening intended accounts.

## Current access and request bounds

Login requires a configured Origin and application/json. The backend refuses duplicate/malformed session cookies and duplicate CSRF headers. Each account has one active session; logging in again replaces it. Default expiry is 30 minutes, absolute and backend enforced. Cookie deletion alone is insufficient: logout deletes its persisted session.

Private reads and logout are rate limited in SQLite. Small POST/PUT/PATCH bodies are bounded to 64 KiB by actual streamed bytes before parsing; malformed/duplicate length headers are refused. Later upload/callback routes must preserve authentication/raw-signature order with their own route-appropriate byte limits.

One bounded hash slot and five login attempts per username/minute plus thirty global/minute limit the costly password operation. This is a small shared-PC demo policy; an attacker on the same machine can still consume the allowed budget. Fixed-window limits are explicit rather than advertised as an Internet-scale abuse system.

Readiness makes a local DB query; liveness remains independent. Failed storage returns a sanitized 503 and Retry-After. Responses never include SQL, filesystem paths, supplied password values, session cookies or private exception text. Unimplemented routes remain absent.

## Upload and output safety

Project bounds: 5 MB transmitted file, 2,000 rows, 50 columns, 10,000 characters per cell, JSON nesting 20, and XLSX decompressed content 50 MB / 1,000 ZIP entries. Reject archives violating bounds before openpyxl processing. Also cap actual parsed records and execution duration; metadata alone is not enough. Five queued/running jobs per workspace, one parser process globally, one upload receiver globally and twenty retained imports per workspace.

Allow CSV/XLSX/JSON only for structured imports. Reject `.xlsm`, `.xls`, arbitrary ZIP, executable formats and external URLs. Validate bytes and layout in addition to extension/MIME. Reject formulas anywhere in the workbook; do not execute macros or follow external workbook links. A filename never becomes a filesystem path. Raw files are private and cannot be served as inline HTML.

Formula-safe CSV exports neutralize text cells beginning with `=`, `+`, `-`, `@`, tab or carriage return, including after leading whitespace normalization. Apply this to untrusted text, not already validated numeric columns. Preserve original text in the private source record and document export escaping. Quote CSV fields correctly; quoting alone does not disable spreadsheet formulas.

ReportLab paragraph text is escaped, not accepted as arbitrary markup. Do not fetch remote images/fonts from supplied invoice text. Use bundled assets and an attachment content disposition. Uploaded PDFs, if later supported as evidence, are stored/downloaded without server-side rendering or extraction until a bounded parser is deliberately added.

## WhatsApp trust boundaries

GET verification token and POST signature are separate controls. HMAC-SHA256 uses the Meta app secret over original raw request bytes. Check the `sha256=` prefix/hex length and compare with constant-time primitives before JSON parsing. Configured Meta account/phone-number IDs must also match. The archived official SDK documents this behavior; do not install it as a dependency. [Official webhook reference](https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/webhooks/start/)

Uniqueness on provider event keys handles retries, not HMAC alone. Treat sender text/document claims as untrusted evidence. A supplier saying “filed” does not verify a tax return. Never accept payment approval or tenant linking based on a phone number in a file.

Linking code: >=60 bits randomness, ten-minute expiry, hash at rest, single transaction consumption, limited attempts. Rate-limit invalid linking attempts to five per sender per ten minutes and add a global ceiling. Do not log codes. New linking cannot silently replace another user's phone binding; require authenticated unlink/relink.

Media download goes through the verified Graph/media API flow. Validate returned hosts and redirects, block private/loopback/link-local addresses, enforce byte/time bounds, and avoid forwarding access tokens to an unapproved redirected host. Do not implement a general URL fetch endpoint.

## Download capabilities and sessions

Future website downloads require the current browser session and current membership. WhatsApp capability links are a deliberate bearer-access exception: >=128 bits random, hashed storage, ten-minute expiry, limited download count, artifact/link binding, and current link/member check. Forwarding one can expose that one artifact until expiry; limit content and lifetime accordingly.

Capability responses use `Cache-Control: no-store`, `Referrer-Policy: no-referrer`, no analytics/third-party assets, and token-redacted application/proxy logs. Revoke on unlink. Signing a bucket URL alone does not support immediate membership-aware revocation, so the preferred capability endpoint authorizes then streams the private object.

Browser sessions use a 256-bit random opaque cookie with HttpOnly, SameSite=Strict, Path=/api/v1 and an absolute expiry. SQLite retains only the token hash. Secure is false for the selected loopback HTTP listener; public HTTPS would require a reviewed secure-cookie configuration. The session endpoint recovers a per-session HMAC CSRF token for in-memory browser use. Private POST/PATCH requires exact Origin and X-CSRF-Token. Neither the cookie nor credentials belong in browser localStorage. [OWASP session guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

## Limits, secrets and logging

Exact-origin CORS; loopback HTTP for current execution; reachable HTTPS and its security review are deferred to the phone connectivity phase; no wildcard credentialed access. CORS is a browser policy, not API authorization. Current sessions use HttpOnly cookies; credentials and CSRF secrets never go in query strings. Validate environment configuration at startup. Missing signatures/secrets deny processing; a demo flag never disables authentication.

Initial limits: 60 read requests/minute/user, 10 mutations/minute/user, three imports/minute/workspace, five queued/running import, run and artifact jobs combined per workspace and one active processing child globally, five planned link attempts/ten minutes/sender. Use database-backed contested quotas for linking/import creation; current read/mutation and login windows are persisted in SQLite and survive restart. They are fixed windows, not a production distributed limiter.

Store provider tokens only in deployment/local secret stores. Logs include request/job IDs, error codes, durations and category counts; exclude source file contents, credentials, link codes, capability tokens, bank accounts and full phone identities. Audit events record actor/action/target without confidential payload dumps.

## Retention and acceptance

Phase 5 chooses seven days for generated artifacts only. Raw imports and case facts have no automatic expiry in this phase. Expired downloads are denied even before cleanup. OWNER-only POST /artifacts/cleanup atomically clears expired artifact BLOBs, retains their snapshot/hash/history and cancels any pending artifact lease. It never deletes imports, cases, proposals or arbitrary PC files. SQLite may retain freed pages and old backups still contain prior bytes; this is logical retention cleanup, not secure physical erasure. Workspace artifact history remains bounded at 40 records by default, including expired history. A demo-reset feature is not implemented.

Security acceptance must demonstrate both allowed and denied cases: valid login works; another workspace cannot read a run/file; a viewer cannot import; wrong/absent callback signature has no effects; repeated valid events have one effect; used/expired link code fails; old report capability fails after unlink; malformed/oversized imports stop safely; source text cannot inject HTML/PDF markup/formulas; secrets are absent from the built frontend.

These checks establish the required bounded demonstration behavior. They do not certify the application as production-secure.

## Control ownership and proof

| Risk | Enforcing layer | Required observable proof |
|---|---|---|
| Forged/expired user token | Auth dependency | Protected request denied, no repository mutation |
| Different workspace object ID | Service/repository | 404 with no private fields |
| Viewer attempts upload | Permission dependency | 403 before expensive parsing |
| Cross-workspace child reference | Composite DB foreign key | Invalid reference rejected by actual SQLite |
| Private local file exposure | Backend/route gate | No static mount of backend/data; unauthorized file retrieval fails |
| Forged Meta callback | Raw-body signature validator | No event/job inserted |
| Valid callback repeated | Inbox unique key | One logical job/effect |
| Link code reused | Atomic consume transaction | Exactly one valid link created |
| Link code guessed | Rate limit + entropy | Bounded attempts with generic errors |
| Revoked member uses phone | Current membership check | No private command response |
| Huge archive | Pre-parser bounded inspection | Rejected without unbounded allocation |
| CSV formula text | Export formatter | Untrusted cell rendered as literal text |
| Malicious report markup | Escaping/rendering | Literal text, no external retrieval |
| Secret in frontend build | Configuration/build scan | Only approved public variables present |
| Capability forwarded | Narrow lifetime/scope | Only one bounded artifact accessible before expiry |
| Meta transmission timeout | Outbox UNKNOWN state | No automatic duplicate resend |

## Authorization evaluation order

Apply cheap authentication and input envelope checks first. For uploads, resolve membership before allocating a large parser buffer. For resource mutations, fetch only within the authorized workspace and then evaluate role/state/version constraints.

```text
Request bounds
  -> verified identity
  -> active membership
  -> permitted action
  -> scoped resource lookup
  -> state/version validation
  -> short transaction
  -> side effect/recovery record
```

Public callback handling has a different order: request bound -> raw signature -> configured asset checks -> parse/event validation -> persistent dedup -> acknowledge. Do not make expensive media downloads before the event is validated and recorded.

## Privacy of derived data

Counts can still reveal a business's situation. Treat summaries, job IDs and report filenames as workspace data. A public health page cannot list jobs or documents. A callback diagnostic cannot disclose the last supplier conversation.

Default phone response omits full document lists, bank information and supplier contact details. Notifications include only the minimum needed for the user's requested action. Deep links carry opaque references/capabilities, not ledger payloads.

PDF manifests include source hashes/IDs but should not embed backend object keys, database credentials or private provider URLs. A report for one case must not accidentally attach unrelated source files from another case or registration.

## Provider status and human input

Authenticated provider transport confirms the source of an event, not the truth of arbitrary user text contained in it. A legitimate WhatsApp sender can still send a fabricated filing claim or invoice.

Server-derived provenance distinguishes:

- Synthetic fixture data used for demonstration.
- User-provided evidence awaiting review.
- A validated adapter observation with documented semantics.

Do not let a frontend or supplier elevate its own evidence to verified status. Audit human review decisions separately from source authenticity.

## SQL and transaction safety

Use parameterized statements for values. Dynamic column/sort choices come from fixed allowlists, not request strings. Tenant filters cannot be omitted by an optional query argument. Avoid raw SQL fragments assembled from uploaded headers.

Review/assignment races rely on constraints and transactions. If a constraint raises, roll back before another query. Do not translate every database exception into successful empty data. The browser never receives direct SQLite access. Local OS administrators can read/edit files; this boundary does not claim protection from the machine owner.

An audit event belongs in the same transaction as the action it describes. A failure should not leave an audit record falsely claiming success. External send/delete attempts have separate attempt/result records because the provider and database do not share an atomic transaction.

## Parser resource budget details

| Dimension | Chosen initial bound |
|---|---|
| Uploaded bytes | 5 MB |
| Canonical rows per source | 2,000 |
| Columns | 50 |
| Text per cell | 10,000 characters |
| JSON depth | 20 |
| XLSX archive entries | 1,000 |
| XLSX uncompressed bytes | 50 MB |
| Heavy processing | One global task initially |
| Preview response | Paginated, max 100 rows |

These values are project choices requiring measurement. Parser jobs have a deadline and failed state. If cancellation of a blocking parser thread cannot actually stop resource use, keep file bounds conservative and consider a dedicated subprocess with termination before expanding inputs. A timeout flag alone is not proof the work stopped.

## Logging review examples

Good: `request_id=req_104 action=import_parse state=failed code=ROW_LIMIT_EXCEEDED`.

Bad: dumping full multipart contents, authorization headers, Graph request token, session cookie, linking code or capability URL. Also avoid printing future capability URLs; they carry temporary authority.

For debugging, use synthetic fixtures and redacted structural payloads. Record field names/error counts without supplier banking data. Provider errors may contain URLs or input values; normalize them into safe codes before sending them to the frontend/logs.

## Revocation and deletion transitions

Membership removal immediately invalidates subsequent API/phone actions. An already running job remains associated with its workspace; completion messaging must recheck the recipient link/member before sending. Do not deliver a new private report after the user lost access.

Unlink revokes next-file intents and report capabilities. Re-link creates a new link identity; old capabilities do not reactivate. Demo reset touches only synthetic workspace resources and leaves unrelated workspaces intact.

File deletion marks a pending-delete state, removes the generated local file outside the transaction, then records confirmed deletion. On partial/failed filesystem deletion preserve path/retry state. A database row disappearing cannot be treated as evidence the private file disappeared.

## Security regression scenarios

1. Legitimate reviewer imports a valid file successfully.
2. Same reviewer uses another workspace's registration ID and is denied.
3. Viewer uses the legitimate import body and is denied before parse.
4. Missing cookie and malformed session token both fail without internal error leaks.
5. Signed callback with wrong WABA/phone asset has no business effect.
6. Valid inbound message replay produces one command.
7. Delivery status replay does not create an inbound command.
8. Simultaneous code consumption yields exactly one link.
9. User revocation denies an otherwise valid old access token.
10. Unlink revokes report capability immediately.
11. Arbitrary URL text never causes the backend to fetch that URL.
12. XLSX formula cell does not become a trusted invoice amount.
13. CSV supplier name beginning `=HYPERLINK` exports as literal text.
14. Report text containing markup remains escaped.
15. An unexpected Meta timeout becomes UNKNOWN rather than “failed, retry now.”

Include valid adjacent cases so safeguards do not simply break all functionality. Database/callback tests must exercise the actual enforcing layer rather than assert a helper function exists.

## Explicitly deferred production controls

After the hackathon, review independent maker/checker payments, stronger session revocation requirements, formal retention/consent obligations, managed secrets rotation, operational alerting, penetration testing and provider/legal contracts. No deferred item permits bypassing the hackathon's mandatory tenant/document/callback protections.

Keep this document updated when implementation changes a trust boundary. Later logical correctness notes record actual root causes and regressions; this security specification remains the intended control baseline.


## Phase 3 enforced boundaries

Upload authentication, CSRF and current workspace write role are checked before the larger multipart body is received. OWNER and REVIEWER can create/map/confirm; VIEWER can inspect authorized previews/jobs. Every resource lookup and write rechecks the current session/membership. Revoked membership, other-workspace IDs and inaccessible registrations return 404. Child foreign keys include workspace scope. Filename is bounded display text with paths/control characters refused; source bytes are stored inside SQLite rather than a static directory or shared temporary upload file.

The body is counted from actual chunks, including when Content-Length is absent. Duplicate/invalid lengths and declared/actual mismatch are refused. The entire multipart envelope has a file limit plus 64 KiB overhead and a wall-clock deadline. One receiver bounds retained buffers; multipart accepts one file and a bounded number of fields. Repeated/unknown fields, ambiguous mapping headers and duplicate JSON mapping keys are refused. Extensions must match a supported explicit adapter; the parser checks actual bytes/layout. MIME labels are not trusted as evidence of safe content.

The parser result is published in one transaction with its row counts, reasons, version and job state. SQL uses bound values, composite references and INTEGER monetary columns. A malformed file becomes a failed private job with a fixed reason code. Raw exceptions, SQL, filesystem paths, source files and session secrets are absent from HTTP errors and worker logs.

The child has no network integration or URL-fetch code. XML/archive bounds, a real process timeout and a sampled combined RSS watchdog limit hostile parser work. This is not a kernel sandbox or a production Internet upload service. Original documents, database and backups remain unencrypted under the local OS account; use synthetic hackathon inputs. Successful backup/restore includes both source BLOB and preview rows and revokes restored access as in Phase 2.

## Implemented Phase 4 protections

Run/result/candidate/job reads enforce current session and workspace membership. Writes require OWNER/REVIEWER plus the existing Origin/CSRF protections and bounded JSON body. Guessed run/result/job IDs cannot expose another workspace's records. Client policy versions, scores, computed totals or states are not accepted as authority. Review reasons are bounded, nonblank and free of control characters; future frontend/report rendering still escapes text.

Review uses one BEGIN IMMEDIATE transaction: reauthorize, check idempotency, verify current run/source versions, check result version, recheck candidate identity/amount evidence and enforce unique portal assignment. Commit the result, recalculated summary, audit event and replay record together. A simulated late audit failure proves the whole transaction rolls back, including the request history. Concurrent tests prove one winner per result version and per contested portal row.

Schema v3 binds results/candidates/events to the same scoped run and source pair. Accepted matches require an assignment, completed runs require a summary, and RUNNING run jobs require a lease. Job completion compares the server lease. Historical/superseded sources block new reviews. A source changed while a run computes prevents successful publication.

Imports and runs use one global disposable child and shared workspace queue admission. Pair/candidate/row/result-size/deadline and sampled process-tree RSS bounds fail explicitly. Private child descriptors/results are server generated and removed by the existing dispatcher. Interrupted jobs fail on restart; no automatic replay pretends they succeeded. Backup/restore retains run/review state while revoking restored access as in Phase 2.

These are implemented-scope checks, not a claim of zero defects or a completed Phase 7/10 audit. The backend remains loopback-only and local files follow OS-account protection. No external storage, cloud worker, public upload URL, callback or frontend credential path was added.

## Phase 5 enforced report/evidence controls

Case/proposal/report mutations require live OWNER/REVIEWER membership, session, Origin and CSRF; reads/downloads require current active membership. Cleanup is OWNER-only. Resource lookup and child references stay within workspace and registration context, with additive composite foreign keys. Expected versions and bound audit/idempotency histories prevent stale edits and unbounded replay storage. An audit failure rolls back the whole command.

Untrusted PDF text is HTML-escaped; no active hyperlink or remote resource is introduced by source markup. Bundled font hash/glyph checks prevent silent character loss. Each text flowable is bounded; normal invoice groups stay together. CSV neutralizes formula prefixes after whitespace/BOM and leading control characters in both headers and source values. Server-generated UUID filenames are the only Content-Disposition filenames.

Downloads recheck state, expiry, source freshness, byte count and SHA-256. An explicit historical option allows old PDF/error snapshots with a response marker; it never permits stale payment-proposal CSV. Restart fails interrupted running report jobs, invalid leases cannot publish, and expired cleanup invalidates pending jobs. Artifacts, jobs and proposals contain no bank execution route or provider verification override. These are bounded local controls; Phase 7 remains the focused backend-wide security/failure review.


## Phase 6 business action safeguards

Introduce authorization and failure protections with the business features, before the focused Phase 7 backend review. Action/task/draft/observation reads and writes need live workspace membership, appropriate role, source/case version checks, bounded inputs, atomic audit and safe retry behavior. Use deliberately supplied supplier contacts; limit invoice detail disclosure to an explicitly approved recipient. A follow-up draft is private and never initiates a provider request by itself.

Bound due-review batches and retained history, deduplicate generated tasks, reject incompatible snapshots and preserve unknown evidence. Restart must not duplicate work or send messages. Reversal/reclaim tasks must not turn an observation into a filed return; action closure needs a recorded reason. Test cross-scope IDs, revoked access, stale writes, malicious text and interrupted processing in Phase 6; repeat applicable paths in Phase 7 and the later browser/channel reviews.


Current scope/status is reconciled in the [capability ledger in 05](05_BUILD_AND_VERIFICATION_PLAN.md#capability-status-and-remaining-work-ledger). Phase 6 now has local business-action APIs, automatic deduplicated evidence-change and due-review tracking, private follow-up drafts/history, a review worksheet and separately evidenced user-recorded filing/submission observations. Browser presentation/connection remains 8–9 and conditional WhatsApp delivery remains 13. Automatic fetching, government filing and legal decision integrations are deferred; guaranteed recovery is not a software promise.


## Phase 6 implemented protections and limits

All action/worksheet reads reauthorize live membership. Human mutations require OWNER/REVIEWER, Origin/CSRF, a current frozen source, expected version and a scoped UUID idempotency receipt. Assignment is limited to an active workspace OWNER/REVIEWER. Forged action/case/draft/evidence IDs cannot cross workspace or action boundaries. Draft contacts/requests are bounded readable text; arbitrary contacts are never inferred. There are no network calls or privileged provider credentials in this service.

Actions, snapshots, human/system events and retry receipts commit together. Source derivation rolls back on action/history exhaustion and exposes a pending failure instead of damaging prior import/run/case success. A failing source rotates so independent work can proceed. Due reminders recheck freshness inside each transaction and cannot duplicate one recorded date. System events have no human actor; human events retain their real actor. Same-case DOCUMENT evidence and accepted review precede a user-recorded submission; no generic note or unrelated reference certifies a filing.

Closed outcomes are invalidated on meaningful evidence changes or removal of their supporting references. Stale records remain privately readable but consequential writes are refused. Report freshness compares the complete matching action identity/version set as well as original sources; new actions and edited actions invalidate older PDFs. Report text remains escaped; compact business timelines do not execute markup or fetch resources. Historical download rules from Phase 5 still apply.

The default five-second monitor rotates workspaces and is bounded by finite source/action/history quotas. Runtime errors expose codes through private automation status, and logs record exception type rather than taxpayer data. Shutdown stops the monitor before the dispatcher/storage; a monitor timeout retains the process lock until the process exits. These feature-level checks do not complete the separate Phase 7 whole-backend audit or later browser/channel reviews. Files/database/backups remain protected by the local OS account rather than encrypted cloud infrastructure.
