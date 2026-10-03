# GSTShield local backend

## Active scope

Decision: 2026-10-03. Run the hackathon website backend on the local PC. No Render, cloud server, external database, cloud storage, Redis or hosted identity setup. A local backend process is still required for the website to call Python functionality.

Phase 1 provides the HTTP/configuration foundation. Phase 2 adds local SQLite storage, operator provisioned accounts, revocable browser sessions and scoped workspace/registration reads. Phase 2 is complete. No uploads, reconciliation, reports or phone routes exist yet.

The [phase plan](../md/05_BUILD_AND_VERIFICATION_PLAN.md) defines the local architecture; the eight MDs now use this decision throughout. Work proceeds one phase at a time, with a review gate before the next phase.

## Start on this PC

From PowerShell:

```powershell
Set-Location 'C:\Users\yashk\Downloads\gstshield\backend'
..\.tooling\Scripts\uv.exe sync --frozen
if (!(Test-Path -LiteralPath '.env')) {
    Copy-Item -LiteralPath '.env.example' -Destination '.env'
}
..\.tooling\Scripts\uv.exe run --frozen python -m app
```

The ignored `.tooling/` directory contains this PC's isolated uv installation. Teammates install [uv](https://docs.astral.sh/uv/getting-started/installation/) and use `uv sync --frozen` / `uv run --frozen python -m app` from `backend/`. Python 3.13.16 is selected by `.python-version`; uv can obtain that runtime. Do not use the PC's unrelated Python 3.14 interpreter for this project.

Open [liveness](http://127.0.0.1:8000/health/live), [readiness](http://127.0.0.1:8000/health/ready) or [local API docs](http://127.0.0.1:8000/docs). Stop the process with Ctrl+C. The supplied frontend is not present yet; the configured website origin defaults to localhost:3000.

Use the supported launcher rather than an independent Uvicorn command that overrides HOST/PORT/workers or enables access logs. It reads the checked configuration and deliberately uses one worker, no reload, no proxy-header trust and no URL access logging.

If port 8000 is occupied, set both `PORT` and `PUBLIC_API_URL` to the same new port in `.env`. Only loopback HOST values 127.0.0.1 and ::1 are accepted. For ::1, use an IPv6 or localhost API origin. There is no configured HTTPS listener, so the local API URL uses HTTP.

## Implemented endpoints

| Route | Behavior |
|---|---|
| GET /health/live | HTTP process can answer; returns status=ok |
| GET /health/ready | Startup complete and local SQLite query succeeds; returns status=ready |
| POST /api/v1/auth/login | Origin-checked local sign-in; sets HttpOnly session cookie |
| GET /api/v1/auth/session | Recover identity, expiry and CSRF token from the cookie |
| POST /api/v1/auth/logout | Origin/CSRF-protected session revocation and cookie deletion |
| GET /api/v1/workspaces | Current account's active memberships only |
| GET /api/v1/workspaces/{workspace_id}/registrations | Registrations within a currently permitted workspace |
| GET /docs | Developer API documentation in local/test mode |
| GET /openapi.json | Schema in local/test mode |

Readiness returns 503 before startup/after shutdown. It checks SQLite availability, but does not claim import readiness, GST correctness or WhatsApp availability. Developer docs/schema are disabled in APP_ENV=demo; this mode still runs locally.

Health successes use `data` and `meta.request_id`. Application errors use `error.code/message/details/retryable` and `meta.request_id`. Each HTTP request receives a server-generated ID also returned in X-Request-ID; client-supplied IDs are not trusted.

Framework documentation, OpenAPI and CORS preflight retain their standard protocol formats. These are not private application JSON endpoints.

## Configuration contract

[.env.example](.env.example) defines every recognized environment variable and provides safe local defaults. Configuration loads backend/.env regardless of the shell's working directory; OS variables take precedence. Unrelated OS variables are ignored. Unknown dotenv names, malformed syntax and duplicate keys are rejected.

Implemented validation includes:

- True/false booleans and integer values without boolean/fractional coercion.
- Port range, a single worker/job executor and positive resource limits.
- Exact finite Decimal amounts/scores and at most two decimal places for money tolerance.
- Exact local website/API origins without credentials, wildcard, path, query or fragments.
- CORS duplicates and website-origin/API port/binding alignment.
- Local-data path containment under backend/data.
- Cross-field upload/buffer/decompression and suggestion-score limits.
- Optional Meta configuration completeness with masked secrets.

Startup configuration failures print a sanitized message and exit with code 2. Never print the settings object/model_dump, raw validation errors or environment values.

Storage, session, private request-rate and small streamed-body limits are enforced in Phase 2. Upload/parser/linking/download/provider limits remain validated reservations until their features are implemented. WHATSAPP_ENABLED must remain false: even complete provider configuration cannot activate an unfinished integration.

## Current HTTP safeguards

The launcher binds to loopback. The HTTP boundary rejects non-local Host values and duplicate Host/Origin headers. Requests carrying an unapproved Origin are rejected before routes run. CORS permits exact configured origins, GET/POST, Content-Type and X-CSRF-Token, with credentials enabled. The website/API must use the same HTTP hostname for SameSite=Strict cookies, such as localhost on ports 3000/8000.

Security/no-store headers and request IDs cover successful and failed HTTP responses. Unexpected errors return a generic message; logging keeps the request ID and exception class rather than the private exception contents. The outer boundary prevents the framework's completed 500 response from causing Uvicorn to log the original exception again. Partially sent responses abort with a sanitized failure.

Host/Origin controls complement the current session and membership checks; they do not grant access on their own. DEMO_MODE is a sample-data flag and never an authentication bypass.

There are no upload routes yet. Small mutation bodies are bounded by actual streamed bytes before JSON parsing. Upload/parser/processing limits will be enforced at their own authenticated boundaries in Phase 3; the small-body bound is not a finished upload implementation.

## Local storage decision

Phase 2 keeps accounts, scopes and sessions in backend/data/gstshield.sqlite3. Source/artifact files are introduced and bounded in their feature phases. Browser localStorage may hold harmless UI preferences; it will not own financial records, access authority or reconciliation results.

Committed records and unexpired sessions survive normal backend restarts. Explicit transactions, parameterized SQL, STRICT tables, foreign keys, schema validation, an OS process lock and storage quotas protect the implemented local flow. Existing incompatible/corrupt files are refused and preserved. Local data/backups are not encrypted; Windows file access follows the local OS account permissions.

The database/data directory, dotenv credentials and tooling are ignored by Git. Keep real taxpayer documents out of the public repository and use synthetic fixtures for development.

## Phase plan and status

| Phase | Work | Status |
|---|---|---|
| 1 | Local runtime, configuration and HTTP foundation | Complete |
| 2 | Local SQLite/private files and private access | Complete |
| 3 | Bounded imports, checking and confirmation | Not started |
| 4 | Reconciliation and versioned human review | Not started |
| 5 | Backend reports, cases and evidence workflow | Not started |
| 6 | Backend security and failure review | Not started |
| 7 | Supplied frontend inspection, cleanup and screens | Not started |
| 8 | Real frontend/backend connection | Not started |
| 9 | Frontend security and privacy review | Not started |
| 10 | Backend performance and resource efficiency | Not started |
| 11 | Frontend smoothness, speed and usability | Not started |
| 12 | WhatsApp connection and channel review | Not started |
| 13 | Whole-application regression and rehearsal | Not started |

The expanded plan has 13 phases covering the whole application. Every phase has correctness, security, edge-case and integration gates in the build plan. Baseline security/resource controls remain part of each feature; Phases 6 and 10 provide focused backend security/failure and measured performance reviews. Frontend phases give the supplied website equal attention. The dependency order does not reduce attention to later work.

Real WhatsApp needs Meta's API and an internet-reachable HTTPS callback. A purely offline/loopback backend cannot receive real phone callbacks. No tunnel or hosted service is provisioned. This decision belongs to the later integration phase.

## Verified runtime and dependencies

The full resolved dependency graph and hashes are in `uv.lock`. Actual Phase 1 versions:

| Item | Version |
|---|---|
| CPython | 3.13.16 |
| uv used locally | 0.12.22 |
| FastAPI / Starlette | 0.142.2 / 1.7.0 |
| Pydantic / Pydantic Settings | 2.13.5 / 2.15.0 |
| python-dotenv / Uvicorn | 1.2.4 / 0.54.0 |
| HTTPX2 test client | 2.13.1 |
| pytest / Ruff | 9.1.1 / 0.16.10 |

HTTPX2 is the installed Starlette version's supported test-client dependency; the deprecated HTTPX dependency was removed. Parser/report/matching libraries are added only when used in their phases. Do not silently upgrade the lock during a presentation.

## Phase 1 verification record

Local Windows checks on 2026-10-03:

- Installed/resolved the project in a fresh Python 3.13 environment; frozen sync subsequently passed.
- 78 tests passed, including a real local process/socket startup and sanitized invalid-startup exit.
- Ruff lint and formatting checks passed.
- Python syntax compilation passed.
- Config/template drift, environment precedence, bounds, malformed/duplicate dotenv entries and redaction checked.
- Lifespan readiness, errors, malformed JSON, CORS, Host/Origin checks, schema behavior and failure-log redaction checked.
- Failures before a response and after a partial response checked without leaking exception contents.

Repeat from backend/:

```powershell
..\.tooling\Scripts\uv.exe sync --frozen
..\.tooling\Scripts\uv.exe run --frozen ruff check .
..\.tooling\Scripts\uv.exe run --frozen ruff format --check .
..\.tooling\Scripts\uv.exe run --frozen python -m compileall -q app
..\.tooling\Scripts\uv.exe run --frozen pytest -q
```

GitHub checks use the same frozen install, lint, format, syntax and tests on Windows/Linux runners. This is automated verification, not application hosting. Local success is not proof that a remote workflow has already passed.

## Folder responsibilities

| Folder | Responsibility |
|---|---|
| app/api | Current access/workspace routes; future feature routes |
| app/contracts | Shared HTTP/input/output contracts |
| app/domain | Future exact-money and reconciliation rules |
| app/services | Local account/session access now; future shared feature use cases |
| app/adapters | Future import/report/provider boundaries |
| app/storage | Current SQLite, data locking, quota, backup/restore foundation |
| app/jobs | Future bounded local processing |
| app/security | Host/Origin/security headers and streamed body boundary; upload/callback checks later |
| tests/unit | Configuration and HTTP-boundary regressions |
| tests/integration | API lifecycle, real process startup and failure behavior |
| tests/fixtures | Reserved for clearly labeled synthetic input/expected results |

No Phase 3–13 endpoint or result is represented as working. Phase 3 remains a separate user-directed increment after the current review gate.

## Create local accounts and context

Stop the backend before operator commands. There are no seeded credentials or public registration route. The new account command creates a private workspace and OWNER membership atomically:

```powershell
..\.tooling\Scripts\uv.exe run --frozen python -m app.manage user-create --username demo-owner --workspace 'Demo Workspace'
```

Choose/confirm a 12–128 character password through the private terminal prompt. The command prints user/workspace IDs. Do not put passwords in terminal command arguments, screenshots or Git. Add a synthetic registration using the printed workspace UUID:

```powershell
..\.tooling\Scripts\uv.exe run --frozen python -m app.manage registration-create --workspace-id '<workspace UUID>' --gstin '27ABCDE1234F1Z5' --name 'Synthetic Demo Registration'
```

The example GSTIN is synthetic, structurally formatted and not government-verified. Phase 2 does not verify taxpayer existence, checksum, filing status or ITC eligibility.

Each additional account gets its own workspace. Grant/revoke a membership through offline administration when sharing a team workspace:

```powershell
..\.tooling\Scripts\uv.exe run --frozen python -m app.manage membership-set --username teammate --workspace-id '<workspace UUID>' --role REVIEWER
..\.tooling\Scripts\uv.exe run --frozen python -m app.manage membership-set --username teammate --workspace-id '<workspace UUID>' --role REVIEWER --revoke
..\.tooling\Scripts\uv.exe run --frozen python -m app.manage password-reset --username demo-owner
```

Offline administration has the local operator's filesystem authority. It is not a public API or a browser role bypass. Every website resource query still checks current active membership and session state. Password reset revokes prior sessions.

## Website access contract

The supplied frontend is pending. The implemented API flow is POST /api/v1/auth/login with JSON username/password and Origin, GET /api/v1/auth/session after reload, then workspace/registration reads. Use credentials:include in the browser client. The HttpOnly cookie is never copied to JavaScript storage.

Session JSON carries user_id, username, expires_at and csrf_token. Hold CSRF in memory and attach X-CSRF-Token plus the configured Origin to logout and later private mutations. A 401 requires sign-in; a 429/503 follows Retry-After with a bounded retry policy. Current lists are finite from provisioned scope limits; future financial lists paginate.

Use localhost consistently on the browser's website/API URLs. CORS alone cannot fix a SameSite cookie blocked by mixing localhost and 127.0.0.1. The configuration loader now checks this alignment. Current HTTP cookies intentionally lack Secure because the backend is a loopback HTTP listener; reachable HTTPS is a later separate integration decision.

There is one active session per account. Sign-in again replaces it; tabs in the same browser share the cookie. Expiry is absolute, normally 30 minutes. Logout deletes the SQLite session, not just the browser cookie. No refresh-token or JWT service is used.

## Offline backup and recovery

With the backend stopped:

```powershell
..\.tooling\Scripts\uv.exe run --frozen python -m app.manage backup
..\.tooling\Scripts\uv.exe run --frozen python -m app.manage restore --backup-id '<printed backup UUID>'
```

Backups live in backend/data/backups and contain private account hashes/data. Only generated UUIDs are accepted for restore. The default budget permits three backup/recovery files; archive an old file safely outside private storage before filling it. Restore needs space/count budget to preserve the current database, including a corrupt file.

Restore validates/stages the backup, preserves the old database, clears sessions/request windows, disables restored accounts, and replaces the live file. Review memberships and reset passwords for intended users before reopening access. An old password/session must not silently regain access from a historical backup.

Existing unresolved journal/WAL/SHM files prevent restore; preserve them for operator recovery. Normal SQLite journaling handles interrupted transactions; do not delete a sidecar to bypass recovery. Unknown schema versions require a reviewed upgrade or supported backup, not deletion/recreation.

This backup covers the Phase 2 database. Phase 3 must extend the backup/restore contract when private source files exist. No report/source-file retention is claimed before those features are implemented.

## Phase 2 verification record

Local Windows verification on 2026-10-03: **118 passed, 1 skipped** in the complete Phase 1 + Phase 2 suite. Frozen sync, Ruff lint/format, syntax compilation and diff checks passed. The skipped test requires Windows symlink privilege; the separate actual Windows junction denial test passed. Focused tests cover two identities, session/CSRF/role boundaries, persistent limits, actual process restart, offline backup/restore, preserved corrupt/foreign/future-schema files, SQL rollback and disk/database quotas. The real restart test exercises the same Phase 1 launcher and HTTP boundary with Phase 2 accounts/scoped reads.

The Windows symlink creation check may skip when Developer Mode/privilege is unavailable; a separate Windows junction check exercises the reparse-point denial without that privilege. Linux CI exercises symlinks when available. Remote workflow results remain separate evidence.
