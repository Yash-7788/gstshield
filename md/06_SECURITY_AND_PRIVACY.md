# GST-Shield — essential hackathon security and privacy

Baseline 2026-10-03. Planned safeguards, not a completed audit. The project handles financial documents and phone identities even in a demonstration, so these controls are part of making it work correctly. [03](03_BACKEND_AND_DATA_SPEC.md) implements them; [05](05_BUILD_AND_VERIFICATION_PLAN.md) verifies them.

## Threat model and scope

Protect each workspace's documents/results, authentication sessions, linking codes, report capabilities and provider credentials. Likely mistakes/attacks: another logged-in user changes an object ID; an uploaded spreadsheet consumes unbounded memory; a forged callback triggers processing; a repeated event duplicates effects; a forwarded report link exposes private evidence; browser code leaks a privileged key; a bot trusts an unrelated supplier's claims.

Use synthetic documents for public judging. Real company uploads require consent and a separately agreed retention policy. Enterprise SSO, custom anti-tamper systems and a security operations center are not hackathon prerequisites. Tenant checks, bounded files, private storage and signed callbacks are.

## Identity, authorization and permissions

Verify JWT signature using the configured project's asymmetric JWKS and fixed algorithm, issuer, audience, expiry and subject requirements. Do not accept the algorithm or key URL from untrusted token input. JWKS has only asymmetric public keys; an empty set in a legacy symmetric configuration is a setup failure, not permission to skip verification. [Supabase JWT guide](https://supabase.com/docs/guides/auth/jwts)

On every protected operation load the active workspace membership and authorize the requested resource. WhatsApp uses the linked Auth user and the same live membership check. No supplied `user_id`, `role`, phone number or `workspace_id` grants access by itself. Editable Auth user metadata is not a role authority.

| Action | Owner | Reviewer | Viewer |
|---|---|---|---|
| Read permitted workspace results/artifacts | Yes | Yes | Yes |
| Import, run, review and add case evidence | Yes | Yes | No |
| Create/approve proposal and report | Yes | Yes | No |
| Manage membership/registration/demo reset | Yes | No | No |
| Link own WhatsApp / unlink own phone | Yes | Yes | Yes |
| Run/import through linked WhatsApp | Yes | Yes | No |

One reviewer may approve a demonstration proposal; production maker/checker separation is deferred. The proposal has no bank execution authority. Reject users with inactive membership immediately even if their JWT remains unexpired. Deleting an Auth user does not itself invalidate every access token, so strict account shutdown also revokes app membership/links and provider sessions as appropriate.

Return 404 for inaccessible tenant-owned objects to avoid disclosing their existence; use 403 for a known in-scope action forbidden by role. An expired token gets 401, not an empty successful result. Parameterize SQL and validate UUIDs/enums before repository calls.

## Database and Storage exposure

Keep business tables in an unexposed `app` schema; revoke anonymous/authenticated direct grants. Backend role has only necessary CRUD rights, not migration/admin powers. Add composite tenant foreign keys and explicit repository workspace predicates. A privileged backend connection can bypass RLS: do not advertise RLS as protecting a query that never checks ownership.

For any accidentally or intentionally exposed table, enable RLS and add actual ownership/membership policies; being `authenticated` is not sufficient. Keep privileged functions out of exposed schemas and avoid SECURITY DEFINER for convenience. Ordinary clients use supported Auth APIs and our backend for business data.

Private bucket only. Server generates object paths; client cannot submit an arbitrary storage path for reading/deleting. Storage privileged credentials stay backend-only and bypass provider access controls, so the app must check file ownership before using them. [Storage access control](https://supabase.com/docs/guides/storage/security/access-control)

Use supported key types/headers through the Storage adapter; a publishable key is not a user token and a new opaque secret is not a JWT. Never copy the backend key into a public environment variable. [Supabase key guide](https://supabase.com/docs/guides/getting-started/api-keys)

## Upload and output safety

Project bounds: 5 MB transmitted file, 2,000 rows, 50 columns, 10,000 characters per cell, JSON nesting 20, and XLSX decompressed content 50 MB / 1,000 ZIP entries. Reject archives violating bounds before openpyxl processing. Also cap actual parsed records and execution duration; metadata alone is not enough. One workspace import job/global heavy task initially.

Allow CSV/XLSX/JSON only for structured imports. Reject `.xlsm`, `.xls`, arbitrary ZIP, executable formats and external URLs. Validate bytes and layout in addition to extension/MIME. Reject formulas in required spreadsheet cells; do not execute macros or follow external workbook links. A filename never becomes a filesystem path. Raw files are private and cannot be served as inline HTML.

Formula-safe CSV exports neutralize text cells beginning with `=`, `+`, `-`, `@`, tab or carriage return, including after leading whitespace normalization. Apply this to untrusted text, not already validated numeric columns. Preserve original text in the private source record and document export escaping. Quote CSV fields correctly; quoting alone does not disable spreadsheet formulas.

ReportLab paragraph text is escaped, not accepted as arbitrary markup. Do not fetch remote images/fonts from supplied invoice text. Use bundled assets and an attachment content disposition. Uploaded PDFs, if later supported as evidence, are stored/downloaded without server-side rendering or extraction until a bounded parser is deliberately added.

## WhatsApp trust boundaries

GET verification token and POST signature are separate controls. HMAC-SHA256 uses the Meta app secret over original raw request bytes. Check the `sha256=` prefix/hex length and compare with constant-time primitives before JSON parsing. Configured Meta account/phone-number IDs must also match. The archived official SDK documents this behavior; do not install it as a dependency. [Official webhook reference](https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/webhooks/start/)

Uniqueness on provider event keys handles retries, not HMAC alone. Treat sender text/document claims as untrusted evidence. A supplier saying “filed” does not verify a tax return. Never accept payment approval or tenant linking based on a phone number in a file.

Linking code: >=60 bits randomness, ten-minute expiry, hash at rest, single transaction consumption, limited attempts. Rate-limit invalid linking attempts to five per sender per ten minutes and add a global ceiling. Do not log codes. New linking cannot silently replace another user's phone binding; require authenticated unlink/relink.

Media download goes through the verified Graph/media API flow. Validate returned hosts and redirects, block private/loopback/link-local addresses, enforce byte/time bounds, and avoid forwarding access tokens to an unapproved redirected host. Do not implement a general URL fetch endpoint.

## Download capabilities and sessions

Website downloads require JWT and current membership. WhatsApp capability links are a deliberate bearer-access exception: >=128 bits random, hashed storage, ten-minute expiry, limited download count, artifact/link binding, and current link/member check. Forwarding one can expose that one artifact until expiry; limit content and lifetime accordingly.

Capability responses use `Cache-Control: no-store`, `Referrer-Policy: no-referrer`, no analytics/third-party assets, and token-redacted application/proxy logs. Revoke on unlink. Signing a bucket URL alone does not support immediate membership-aware revocation, so the preferred capability endpoint authorizes then streams the private object.

Browser sessions follow the supplied framework's supported Supabase pattern. If SPA storage is JavaScript-accessible, record that tradeoff and prevent XSS through escaped rendering, no raw HTML injection and a compatible CSP. Do not claim native secure storage guarantees on the website. Never send user access tokens through WhatsApp links.

## Limits, secrets and logging

Exact-origin CORS; HTTPS for deployment; no wildcard credentialed access. CORS is a browser policy, not API authorization. Tokens go in authorization headers, never query strings. Validate environment configuration at startup. Missing signatures/secrets deny processing; a demo flag never disables authentication.

Initial limits: 60 read requests/minute/user, 10 mutations/minute/user, three imports/minute/workspace, one active workspace job, five link attempts/ten minutes/sender. Use database-backed contested quotas for linking/import creation; a simple process-local general request limiter is acceptable on the documented one-process demo topology, with reset-on-restart explicitly understood.

Store provider tokens only in deployment/local secret stores. Logs include request/job IDs, error codes, durations and category counts; exclude source file contents, credentials, link codes, capability tokens, bank accounts and full phone identities. Audit events record actor/action/target without confidential payload dumps.

## Retention and acceptance

Use a chosen seven-day default for synthetic raw files/artifacts and an authenticated cleanup job; this is an application policy, not a legal retention rule. Expiry metadata is not deletion evidence. Deletion state tracks storage result and retries; do not lose the object key before confirmation. Permit demo reset only for the designated synthetic workspace after typed confirmation and owner authorization.

Security acceptance must demonstrate both allowed and denied cases: valid login works; another workspace cannot read a run/file; a viewer cannot import; wrong/absent callback signature has no effects; repeated valid events have one effect; used/expired link code fails; old report capability fails after unlink; malformed/oversized imports stop safely; source text cannot inject HTML/PDF markup/formulas; secrets are absent from the built frontend.

These checks establish the required bounded demonstration behavior. They do not certify the application as production-secure.

## Control ownership and proof

| Risk | Enforcing layer | Required observable proof |
|---|---|---|
| Forged/expired user token | Auth dependency | Protected request denied, no repository mutation |
| Different workspace object ID | Service/repository | 404 with no private fields |
| Viewer attempts upload | Permission dependency | 403 before expensive parsing |
| Cross-workspace child reference | Composite DB foreign key | Invalid reference rejected by actual PostgreSQL |
| Public bucket misconfiguration | Setup gate | Unauthenticated object retrieval fails |
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

Review/assignment races rely on constraints and transactions. If a constraint raises, roll back before another query. Do not translate every database exception into successful empty data. A migration account used during setup is never the regular runtime identity.

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

Bad: dumping full multipart contents, authorization headers, Graph request token, JWT, linking code or capability URL. Also avoid printing signed Storage URLs; they carry temporary authority.

For debugging, use synthetic fixtures and redacted structural payloads. Record field names/error counts without supplier banking data. Provider errors may contain URLs or input values; normalize them into safe codes before sending them to the frontend/logs.

## Revocation and deletion transitions

Membership removal immediately invalidates subsequent API/phone actions. An already running job remains associated with its workspace; completion messaging must recheck the recipient link/member before sending. Do not deliver a new private report after the user lost access.

Unlink revokes next-file intents and report capabilities. Re-link creates a new link identity; old capabilities do not reactivate. Demo reset touches only synthetic workspace resources and leaves unrelated workspaces intact.

File deletion marks a pending-delete state, calls Storage outside the transaction, then records confirmed deletion. On partial/failed external deletion preserve path/retry state. A database row disappearing cannot be treated as evidence the provider object disappeared.

## Security regression scenarios

1. Legitimate reviewer imports a valid file successfully.
2. Same reviewer uses another workspace's registration ID and is denied.
3. Viewer uses the legitimate import body and is denied before parse.
4. Missing JWT and malformed JWT both fail without internal error leaks.
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
