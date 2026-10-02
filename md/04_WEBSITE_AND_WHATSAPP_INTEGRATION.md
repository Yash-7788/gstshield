# GST-Shield — existing website and WhatsApp integration

> **Active first-demo scope (2026-10-03):** The user selected a database-free live demo. Use one process and bounded temporary in-memory state; restart/redeploy may erase state. Database, managed storage, durable jobs and database-backed guarantees below describe a later phase. See [current backend scope](../backend/README.md). Removing persistence does not remove access checks or callback signature requirements.

Baseline 2026-10-03. Future implementation instructions. [08](08_CONTRACTS_AND_ALIGNMENT.md) owns API contracts; [03](03_BACKEND_AND_DATA_SPEC.md) owns shared behavior; [06](06_SECURITY_AND_PRIVACY.md) owns authentication, signatures and linking safeguards.

## Preserve and connect the supplied website

The website has not yet been supplied. Do not choose a new frontend framework or redesign it based on the original report's Next.js 14 suggestion. On receipt, inspect its manifest, routing, build command, deployment requirements, existing authentication, fixture data and screens. Record actual framework/runtime/package versions in 02.

Build one API client around the actual framework. Generate TypeScript types from the backend OpenAPI document after contracts stabilize. Keep monetary values as strings; use decimal-aware display or server-formatted values. A JavaScript Number must not become the source of financial calculation.

Pre-created Supabase Auth users sign in through the supported client. Website sends `Authorization: Bearer <access_token>` to FastAPI. A 401 allows one controlled token refresh; a second failure returns to sign-in. Clear workspace-bound state on logout or account change. Never ship backend credentials in browser environment variables.

| Website feature | Contract / result |
|---|---|
| Workspace picker | GET /api/v1/workspaces |
| Registration picker | GET /api/v1/workspaces/{workspace_id}/registrations |
| Import upload | POST /api/v1/workspaces/{workspace_id}/imports |
| Mapping preview | PATCH /api/v1/workspaces/{workspace_id}/imports/{import_id}/mapping |
| Import confirmation | POST /api/v1/workspaces/{workspace_id}/imports/{import_id}/confirm |
| Start analysis | POST /api/v1/workspaces/{workspace_id}/runs |
| Progress | GET /api/v1/workspaces/{workspace_id}/jobs/{job_id} |
| Result summary/list | GET run and paginated run results |
| Candidate review | POST result review with expected_version |
| Case timeline | GET/POST cases and POST case evidence |
| Download PDF/proposal | Artifact creation job, then authorized artifact download |
| WhatsApp linking | POST link-code; display expiry and linked status |

## Website state model

Show source import readiness separately from run readiness. A uploaded file may still need parsing, mapping or confirmation. Disable `Run` until both sources are READY and contexts agree. Row validation errors are downloadable and actionable; never disappear behind a generic failure toast.

Poll active jobs approximately every two seconds while the relevant view is visible; back off after repeated network failures. Pause polling when hidden. A cold backend gets a truthful “server waking” message after delayed response; the website must not announce analysis failure solely because the first request is slow. Use idempotency keys when retrying creates, so a network timeout does not create duplicate runs.

Filter results by server enum rather than label text. Counts come from the committed summary. Display fuzzy score as similarity, not probability or legal confidence. Show sample-evidence badges near relevant facts rather than only in a footer.

Review mutation waits for the committed server result before changing financial totals. A 409 VERSION_CONFLICT triggers refetch and asks the user to review changed evidence. Cross-workspace cached data is keyed by user/workspace/registration/period/run. Clear it when scope changes.

## WhatsApp as a second working interface

Use Meta Cloud API directly; avoid introducing a paid messaging aggregator or an unofficial browser-session bridge as the core setup. WhatsApp is not only a `wa.me` link: success requires a deployed callback, real phone input, authorized processing and a real response.

Meta's official collection describes WABA/phone assets, access tokens, message requests and test-message setup. Dashboard user tokens have a short lifetime, so the demonstration must verify token validity beforehand. Exact account/test recipient restrictions and free entitlements must be checked in the actual dashboard. [Meta collection](https://www.postman.com/meta/whatsapp-business-platform/collection/wlk6lh4/whatsapp-cloud-api)

Required assets: developer app, WABA, sender phone-number ID, enabled recipients in test mode, scoped token, app secret, verification token and HTTPS URL. App subscription must target the intended WABA and event fields. Receiving the dashboard's test callback is not proof real recipient messages reach the integration.

## Linking and active context

1. Website authenticates a user and checks their active workspace membership.
2. Backend creates a random 12-character code (>=60 bits entropy), stores only its hash, limits active codes, and sets ten-minute expiry.
3. Website displays `LINK <code>` and the selected registration/period. User sends it to the configured bot.
4. Verified callback supplies sender wa_id. Transaction atomically consumes the unexpired code and creates that user's link. A consumed/expired code cannot be replayed.
5. Website displays linked status and masked phone. The bot echoes the active context and available commands.
6. Every command rechecks current membership. `UNLINK` or website revocation immediately deactivates the link and its download capabilities.

Never link merely because a phone number appears in an uploaded spreadsheet or user profile. An unaffiliated supplier cannot read the buyer workspace. Initial version supports one active workspace/context per linked phone. Change context through authenticated website controls and display the new context before subsequent commands.

## Command contract

| Command | Response / behavior |
|---|---|
| HELP | Available commands, supported file types and sample-mode notice |
| LINK code | Bind current sender to the authorized context or a generic failure |
| STATUS | Latest selected-context run/job state, counts and review exposure |
| UPLOAD PURCHASE | Set next-file intent; echo registration/period and expiry |
| UPLOAD 2B | Set portal intent; explain canonical versus supported official format |
| RUN | Create/reuse same reconciliation operation as website |
| REPORT | Create PDF for current run; reply when an artifact is available |
| UNLINK | Revoke sender link and download capabilities |

Next-file intent expires after ten minutes and is consumed by one document message. On ambiguous unsolicited attachment, ask whether it is purchase or 2B; do not infer correctness from a filename. A JSON attachment is not automatically official portal evidence. Accept only supported file types with bounded bytes and show the import preview/confirmation flow.

Example response:

```text
GST-Shield · SAMPLE DATA
Acme Demo · GSTIN ending 1Z5 · 2024-05
Run R-104 complete: 84 exact, 8 suggestions, 8 missing.
Recorded tax awaiting review: ₹18,000.00.
This is reconciliation of the uploaded snapshot, not confirmed ITC eligibility.
Reply REPORT for the evidence summary or open the website to review suggestions.
```

These numbers are illustrative copy, not the fixture's required output. Derive actual responses from persisted summaries. Do not expose full GSTINs, bank accounts or vendor ledgers unnecessarily in notifications.

## Callback and processing flow

GET `/webhooks/whatsapp`: check subscription mode and verification token; return challenge only on exact match. POST: read bounded raw bytes, validate `X-Hub-Signature-256` using the app secret, then parse JSON. Meta's archived official SDK documents the GET and SHA-256 validation distinction; use current HTTP APIs rather than adopting that archived SDK. [Official SDK reference](https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/webhooks/start/)

Validate account/sender phone-number IDs against configuration. Iterate all entry/change/message elements rather than assume the first element is the sole event. Distinguish inbound commands from message delivery/read/error statuses. Persist a minimal event and enqueue jobs in one transaction before acknowledging. A temporary DB failure returns a retriable error; a duplicate valid event returns success without new effects.

Use inbound message ID as part of the operation's dedup key. Delivery events may repeat/change over time; key them by provider ID, status and event timestamp or stable event hash. Do not create a command for a status event or an outbound echo.

For document messages, fetch media metadata using the configured Graph origin and ID, then retrieve from the validated returned provider location. Never fetch an arbitrary URL from message text or let redirects reach private addresses. Stream with the 5 MB project bound and a timeout, validate type, compute hash, store private bytes, and create the same import lifecycle.

## Sending and download delivery

Persist outbox intent before sending. A response containing provider_message_id marks API acceptance, not delivery. Delivery/read/failure statuses update the record later. A timeout after transmission is UNKNOWN and cannot trigger blind resend. Website can show the uncertainty and offer a deliberate retry with a new audited intent.

For the demo, prefer user-initiated replies within the account's permitted messaging window. Scheduled supplier outreach requires opt-in, template/category compliance and verified account pricing. Keep it disabled until that proof; draft copy is always available. Do not promise the original report's “100 free alerts” as an account fact. [WhatsApp pricing](https://whatsappbusiness.com/products/platform-pricing/)

REPORT returns an opaque expiring capability rather than a permanent public bucket URL. Generate at least 128 random bits, store a hash, bind to artifact/link, expire after ten minutes, limit download count, and check active link/membership on redemption. This intentionally permits the recipient browser without an additional login, so treat it as a bearer secret. Do not put raw phone numbers or user JWTs in the link. Revoke it on unlink; return a generic expired/not-found page without leaking file ownership.

Sending a PDF as a Meta document is optional and must be separately tested; Meta then receives a copy. The link-based flow keeps report delivery simple and controllable for the first demo.

## Verification and failure UX

Test a physical phone: LINK, STATUS, purchase attachment, portal attachment, RUN, REPORT and UNLINK. Refresh website after phone upload; compare imported IDs and counts. After unlink, STATUS and old capability both fail. Repeat a callback and confirm one import/job. Expired token, wrong signature, unsupported file and backend wake-up have useful outcomes.

If account setup is blocked, keep an internal adapter emulator for development and mark it clearly. It is not the final WhatsApp proof. Record the blocker and preserve website functionality; never quietly replace the promised phone workflow with a visual mock.

## Frontend handoff inspection

When the website arrives, record rather than assume:

- Framework/version and package manager/lockfile.
- Client-only versus server-rendered routes.
- Existing auth library/session storage and redirect behavior.
- Mock datasets and fields used by each screen.
- Existing API base URL and error handling.
- File-upload controls and currently accepted formats.
- Charts whose totals are computed locally.
- Buttons that currently do nothing or return fixture results.
- Report/download mechanism and popup behavior.
- Responsive layout for mobile browsers.
- Build environment variables actually exposed publicly.
- Deployment output directory and any server functions.

Create a mapping from existing component to contract operation. Replace mocks incrementally so one whole journey becomes real before expanding. Preserve visible design unless it contradicts actual behavior; change misleading labels such as “paid” to “proposal exported.”

## Screen behavior matrix

| Situation | Website response | WhatsApp response |
|---|---|---|
| No selected registration | Context picker | Link/select context instruction |
| No purchase import | Upload instruction | UPLOAD PURCHASE prompt |
| Parse queued | Job status and source filename | Import received; job reference |
| Mapping missing | Preview mapping controls | Open website to map fields |
| Rejected rows | Error details and explicit partial confirmation | Counts + review link; no automatic partial run |
| Ready sources | Enable Run | RUN available |
| Run queued | Pending operation ID | Analysis queued |
| Run complete | Category cards and drilldown | Concise same-run summary |
| Ambiguous candidate | Display alternatives and reasons | Summarize, direct to review screen |
| Source superseded | Historical badge/new-run selector | State latest applicable run/context |
| Expired auth/link | Sign-in/link recovery | No private data; LINK instruction |
| Provider send unknown | Pending/uncertain delivery status | Avoid duplicate automatic message |

Do not move complex mapping or legal evidence adjudication into a brittle sequence of chat prompts. WhatsApp handles convenient uploads/status/report retrieval; website handles rich review. Both still operate on the same domain services.

## Detailed phone upload exchange

```text
User: UPLOAD PURCHASE
Bot: Next document will be a purchase register for Acme Demo, 2024-05.
     CSV/XLSX only, up to 5 MB. This selection expires in 10 minutes.
User: [purchase_demo.xlsx]
Bot: Received import I-12. Parsing is queued.
Bot: Preview: 98 valid rows, 2 rejected rows.
     Review the errors and confirm the accepted rows on the website.
User: STATUS
Bot: Import I-12 is awaiting confirmation. Analysis has not started.
```

The second bot reply is generated by a persisted outbox intent after parsing, subject to the account's permitted reply window and send budget. If sending then is unavailable, the website retains the state and STATUS can retrieve it. A durable job is not a guarantee that outbound messaging will be permitted indefinitely.

## Context changes during processing

A job captures registration/period/import IDs when created. If the user changes context while it runs, its output stays attached to the original context. Completion messages include the original registration/period and cannot update unrelated current screen state.

An upload intent captures context as well. Changing linked context invalidates an unused next-file intent so a later document cannot land in the old period without notice. Unlink cancels pending user intents and revokes capabilities; existing already-authorized non-messaging processing remains visible to authorized workspace members.

## Button actions and confirmation rules

Every mutation has a distinct intention. `RUN` starts analysis; it does not approve suggestions. `REPORT` creates an artifact; it does not approve payment. `UNLINK` revokes access; it does not delete the entire workspace.

If interactive buttons are implemented, the callback payload references a server-generated operation and current version. Reject arbitrary payload strings that name a tenant/resource without authority. Text commands remain the fallback so the demonstration does not depend on rich interactive message support.

## Setup troubleshooting

| Symptom | Check next |
|---|---|
| GET challenge fails | Public HTTPS URL, mode, verification token and plain challenge response |
| Dashboard callback succeeds but phone input does not | WABA subscription, messages field, correct sender asset and recipient/test restrictions |
| Signature invalid | Correct app secret, raw byte preservation, prefix and constant-time check |
| Outbound 401/permission error | Token expiry, required permissions and phone/WABA ownership |
| Message API accepts but phone sees nothing | Provider delivery/error status; acceptance is not delivery |
| Document retrieval fails | Media ID flow, token permission, expired URL, allowed redirect host |
| Callback duplicated | Event key uniqueness and acknowledgement after persistence |
| Response delayed after inactivity | Render cold start and queued job status |
| Cross-context summary | Link context, job captured context and result lookup scoping |
| REPORT link expired | Generate new capability from current authorized link |
| CSV upload from phone unsupported MIME | Validate content/type mapping, not only filename |

Keep errors observable with request/event/job IDs. Redact tokens, full phone numbers and link codes in troubleshooting output.

## Physical-device acceptance script

1. Sign into the website and create a linking code.
2. Send the code from the intended phone and inspect linked status on the website.
3. Try the same code from another phone; it must fail after consumption.
4. Send HELP and verify the available commands match implemented features.
5. Send STATUS before any run and check the useful empty state.
6. Upload purchase and portal fixtures through the supported flows.
7. Confirm imports and start RUN.
8. Compare phone/website counts and source context.
9. Generate REPORT and open its private capability on the phone browser.
10. Revoke/unlink and prove old commands/downloads cannot retrieve data.
11. Re-link, change period, and confirm old results do not appear as current.
12. Record one successful flow for an honestly labeled outage fallback.

## Safe development emulator

An emulator can inject domain commands into a test adapter without Meta credentials. It uses test identities/fixtures and produces visible SIMULATED_CHANNEL status. Keep it behind local/test configuration and authenticated developer access; never add a public endpoint that accepts arbitrary sender IDs.

Use signed synthetic webhook payloads to test byte/signature behavior locally. Separately perform the physical-device flow. The former verifies our handler; the latter verifies account subscription and actual provider delivery.

## Integration completion record

Record deployed frontend/API origins, frontend build commit, backend build commit, selected Graph API version, callback path, date of physical-device rehearsal and redacted provider message IDs. Never record the access token/app secret.

The integration is complete when an unaided presenter can move between website and phone without editing the database, invoking terminal scripts or replacing messages with fixtures. Any remaining missing provider capability is displayed as unavailable rather than silently synthesized.
