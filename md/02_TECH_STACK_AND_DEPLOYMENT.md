# GST-Shield — actual technology stack and local setup

> **Active local implementation (2026-10-03):** This is a website with a Python backend running on the PC. Authoritative storage is a private SQLite file under `backend/data/`; accounts are provisioned locally and browser access uses revocable sessions. No external database, hosted identity, cloud storage or application hosting is selected. Phase 2 is complete and locally verified; Phases 3–13 remain planned. The supplied frontend and real WhatsApp connection are still pending.

## Selected architecture

Use one FastAPI backend process on the local PC, Python's standard-library SQLite driver, and private files under backend/data. The website is a browser interface supplied by the user later. It calls the same application services that a future WhatsApp adapter will call. The PC must remain running while the backend is used.

This decision replaces the earlier cloud plan throughout this planning pack. There is no database account, service connection string, hosted authentication project, object-storage bucket or application hosting bill. Internet access remains useful for dependency installation and necessary for real Meta messaging; local website/backend behavior does not need a provider round-trip.

| Earlier proposal | Current choice | Reason / effect |
|---|---|---|
| PostgreSQL / hosted database | Local SQLite file | Durable PC storage without a separate database process |
| Supabase Auth / signed JWTs | Local operator provisioned accounts + opaque sessions | No public signup, auth provider or refresh-token integration |
| Supabase Storage / signed bucket URLs | Private local directory | Paths stay server generated; future file access goes through scoped backend routes |
| Render / static cloud hosting | Backend and supplied website run locally | PC availability determines uptime; no cloud deployment is required |
| SQLAlchemy, psycopg, Alembic | sqlite3 + explicit schema version | Fewer dependencies; later upgrades are reviewed, backed up and tested |
| Redis / external worker | Future SQLite job records + one bounded local dispatcher | Only one backend process may hold the data lock |
| Browser localStorage as business storage | Backend SQLite as authority | Browser reloads and account changes cannot invent or lose financial truth |

## Installed runtime, not release candidates

The committed `backend/uv.lock` records the full resolved graph and hashes. The versions below were installed and exercised on this Windows PC. This establishes compatibility for the tested code, not a claim that every future parser or provider integration is already implemented.

| Component | Installed version / use |
|---|---|
| CPython | 3.13.16, selected by .python-version |
| uv | 0.12.22 used on this PC |
| FastAPI | 0.142.2, HTTP routes and schema |
| Starlette | 1.7.0, resolved framework dependency |
| Pydantic | 2.13.5, input/output validation |
| Pydantic Settings | 2.15.0, validated environment configuration |
| python-dotenv | 1.2.4, dotenv parsing |
| Uvicorn | 0.54.0, supported local launcher |
| HTTPX2 | 2.13.1, test client only |
| pytest | 9.1.1, regression checks |
| Ruff | 0.16.10, lint and formatting |
| SQLite | 3.53.1 in this PC's selected interpreter; stdlib driver |
| Password/session/CSRF primitives | hashlib.scrypt, secrets, hmac from the standard library |

HTTPX2 matches the installed Starlette test client; do not reintroduce the deprecated HTTPX dependency from the early candidate list. Do not silently refresh the lock during the demo. New dependencies belong to the phase that actually uses them.

## Dependencies reserved for future phases

- Phase 3: standard-library CSV/JSON first; evaluate openpyxl and bounded XML handling for XLSX. Commit tested versions when the parser is implemented.
- Phase 4: Decimal for canonical monetary arithmetic; evaluate RapidFuzz for suggestions. Similarity never becomes automatic legal approval.
- Phase 5: evaluate ReportLab for PDF generation with a bundled tested font. Do not install a browser renderer only to generate a small evidence report.
- Phase 7: preserve the supplied website's framework, package manager and lockfile. Node and browser dependencies cannot be selected before inspecting it.
- Phase 12: select and test a supported HTTP client for Meta calls with real timeouts, redirect policy and bounded response bodies. The current HTTPX2 installation is a development dependency, not a provider adapter.

Pandas, an AI service, a messaging aggregator and an external queue are not required for the deterministic core. Optional packages need a concrete implemented use and compatibility proof.

## Local installation and launch

From PowerShell on this PC:

```powershell
Set-Location 'C:\Users\yashk\Downloads\gstshield\backend'
..\.tooling\Scripts\uv.exe sync --frozen
if (!(Test-Path -LiteralPath '.env')) {
    Copy-Item -LiteralPath '.env.example' -Destination '.env'
}
..\.tooling\Scripts\uv.exe run --frozen python -m app.manage user-create --username demo-owner --workspace 'Demo Workspace'
..\.tooling\Scripts\uv.exe run --frozen python -m app
```

The account command prompts privately for a chosen password and confirmation. There is no shipped default account/password. It prints the new user/workspace IDs. Stop the backend before account changes or backup/restore maintenance.

Teammates install [uv](https://docs.astral.sh/uv/getting-started/installation/) and use `uv sync --frozen` and `uv run --frozen ...` from backend/. The ignored .tooling directory is this PC's convenience installation; it is not a requirement to commit a runtime or share a virtual environment.

Use `python -m app` through the locked environment. The launcher honors validated HOST/PORT, uses one worker, disables URL access logs and does not trust proxy headers. A direct alternate Uvicorn command can invalidate these guarantees; do not use the old cloud start command.

Liveness is /health/live. Readiness is /health/ready and includes a local storage query. Developer docs/schema are enabled in local/test and hidden in demo. A healthy response does not certify GST calculations or future phone/report features.

## Browser connectivity

Default website origin: http://localhost:3000. Default API origin: http://localhost:8000. Different ports are allowed; both must use the same HTTP hostname for SameSite=Strict cookies. Do not mix localhost with 127.0.0.1 in the browser's chosen API base URL.

If choosing IPv4 literals, change PUBLIC_WEB_URL and PUBLIC_API_URL together and include the exact website origin in CORS_ORIGINS. If changing API port, change PORT and PUBLIC_API_URL together. IPv6 binding uses ::1 and matching website/API hostname configuration.

The API currently binds only to loopback. A separately hosted website cannot reach a private PC backend from an arbitrary remote browser. LAN access, public HTTPS and a phone callback require a later deliberate connectivity decision; no tunnel is provisioned in Phase 2.

The future API client uses credentials:include, not a JavaScript-held access token. It recovers session/CSRF state through GET /api/v1/auth/session and includes X-CSRF-Token plus Origin on authenticated mutations. Details are authoritative in 08.

## Local persistence and recovery

The database is backend/data/gstshield.sqlite3. Settings allow a nested directory only within backend/data. The process holds an OS lock; a second runtime or maintenance process is refused. Symlinks, junctions, traversal and non-ordinary private storage entries are rejected.

SQLite uses STRICT tables, foreign keys, DELETE journaling, FULL synchronization and short explicit transactions. A new file is created exclusively. Existing empty, corrupt, foreign, changed or unsupported-version databases are refused and preserved; runtime reads never silently recreate a missing live file.

Data persists across backend restarts. Session expiry is absolute, normally 30 minutes, with no sliding refresh. A new login replaces the previous session for that account. Expiry is checked in the backend independently of the cookie lifetime.

Backup commands copy the actual Phase 2 database and validate the result. Generated UUIDs identify backups. Backup count, total retained bytes, database page limits and free-disk reserve are enforced. Archive an old backup outside the private directory before filling the backup budget.

```powershell
..\.tooling\Scripts\uv.exe run --frozen python -m app.manage backup
..\.tooling\Scripts\uv.exe run --frozen python -m app.manage restore --backup-id '<printed UUID>'
..\.tooling\Scripts\uv.exe run --frozen python -m app.manage password-reset --username demo-owner
```

Restore preserves the previous database, validates/stages the chosen backup, removes restored sessions/request windows, disables restored accounts, and replaces the live database. Review memberships and reset the passwords of intended users before launch. This prevents a backup from silently reactivating old revoked credentials.

An unresolved journal/WAL/SHM sidecar blocks restore; retain it for operator recovery rather than deleting evidence. Future imports/artifacts will require extending the backup manifest to include private source files. A Phase 2 database backup does not claim to protect files that are not implemented yet.

## Environment contract

`backend/.env.example` is the complete recognized template. OS settings override dotenv values; unknown OS names are ignored, unknown/malformed/duplicate dotenv settings are refused. No secret values are printed in configuration failures.

The table below is generated from the template for this planning update. Blank Meta values are deliberate: WhatsApp remains disabled. Parser, link and provider limits are reservations until those phases enforce their boundaries; storage, sessions, JSON body bounds and private request limits are enforced now.

| Variable | Example default |
|---|---|
| `APP_ENV` | `local` |
| `DEMO_MODE` | `true` |
| `LOG_LEVEL` | `INFO` |
| `HOST` | `127.0.0.1` |
| `PORT` | `8000` |
| `PUBLIC_WEB_URL` | `http://localhost:3000` |
| `PUBLIC_API_URL` | `http://localhost:8000` |
| `CORS_ORIGINS` | `["http://localhost:3000","http://127.0.0.1:3000"]` |
| `STORAGE_BACKEND` | `sqlite` |
| `LOCAL_DATA_DIR` | `data` |
| `WEB_CONCURRENCY` | `1` |
| `SESSION_TTL_SECONDS` | `1800` |
| `MEMORY_STATE_MAX_BYTES` | `67108864` |
| `MAX_ACTIVE_DEMO_SESSIONS` | `20` |
| `MAX_CONCURRENT_PROCESSING_JOBS` | `1` |
| `MAX_QUEUED_JOBS_PER_SESSION` | `5` |
| `MAX_UPLOAD_BYTES` | `5242880` |
| `MAX_IMPORT_ROWS` | `2000` |
| `MAX_IMPORT_COLUMNS` | `50` |
| `MAX_CELL_CHARACTERS` | `10000` |
| `MAX_JSON_DEPTH` | `20` |
| `MAX_XLSX_UNCOMPRESSED_BYTES` | `52428800` |
| `MAX_XLSX_ARCHIVE_ENTRIES` | `1000` |
| `PROCESSING_TIMEOUT_SECONDS` | `60` |
| `CURRENCY` | `INR` |
| `MATCH_AMOUNT_TOLERANCE` | `0.01` |
| `FUZZY_SUGGESTION_THRESHOLD` | `88.00` |
| `FUZZY_MIN_SCORE_GAP` | `5.00` |
| `MATCH_POLICY_VERSION` | `match-v1` |
| `WHATSAPP_ENABLED` | `false` |
| `META_GRAPH_VERSION` | `` |
| `META_PHONE_NUMBER_ID` | `` |
| `META_WABA_ID` | `` |
| `META_ACCESS_TOKEN` | `` |
| `META_APP_SECRET` | `` |
| `META_VERIFY_TOKEN` | `` |
| `WHATSAPP_SEND_BUDGET` | `0` |
| `HTTP_CONNECT_TIMEOUT_SECONDS` | `5` |
| `HTTP_READ_TIMEOUT_SECONDS` | `20` |
| `HTTP_WRITE_TIMEOUT_SECONDS` | `20` |
| `HTTP_POOL_TIMEOUT_SECONDS` | `5` |
| `LINK_CODE_TTL_SECONDS` | `600` |
| `LINK_ATTEMPTS_PER_WINDOW` | `5` |
| `LINK_ATTEMPT_WINDOW_SECONDS` | `600` |
| `DOWNLOAD_CAPABILITY_TTL_SECONDS` | `600` |
| `DOWNLOAD_CAPABILITY_MAX_DOWNLOADS` | `3` |
| `READ_REQUESTS_PER_MINUTE` | `60` |
| `MUTATION_REQUESTS_PER_MINUTE` | `10` |
| `IMPORT_REQUESTS_PER_MINUTE` | `3` |
| `MAX_DATABASE_BYTES` | `67108864` |
| `MAX_LOCAL_DATA_BYTES` | `268435456` |
| `MIN_FREE_DISK_BYTES` | `16777216` |
| `MAX_LOCAL_BACKUPS` | `3` |
| `MAX_LOCAL_USERS` | `20` |
| `MAX_LOCAL_WORKSPACES` | `20` |
| `MAX_REGISTRATIONS_PER_WORKSPACE` | `20` |
| `MAX_API_BODY_BYTES` | `65536` |

## Enforced current resource policy

- Database: 64 MiB; all private data: 256 MiB; free-disk reserve: 16 MiB.
- Backups: three retained files, including preserved recovery copies counted toward the same directory budget.
- Accounts/workspaces: twenty each; registrations: twenty per workspace; absolute configured upper bounds keep lists finite.
- Active sessions: twenty; one active session per account; session lifetime at most one day even if configured above the demo default.
- Small mutation bodies: 64 KiB actual streamed bytes; malformed duplicate Content-Length is rejected.
- Sign-in: five attempts per username per minute and thirty globally; one scrypt hash computation at a time.
- Private requests: sixty reads and ten mutations per session per minute, stored in SQLite across restart.
- SQL lock waiting: bounded to two seconds; failure is a truthful storage error, never successful empty data.

These bounds are hackathon choices. Phase 10 measures implemented workload behavior before increasing them. Future upload routes need their own authenticated streaming bounds and multipart overhead policy; the current small-body bound must not be increased globally to bypass import checks.

## Checks and evidence

```powershell
..\.tooling\Scripts\uv.exe sync --frozen
..\.tooling\Scripts\uv.exe run --frozen ruff check .
..\.tooling\Scripts\uv.exe run --frozen ruff format --check .
..\.tooling\Scripts\uv.exe run --frozen python -m compileall -q app
..\.tooling\Scripts\uv.exe run --frozen pytest -q
```

The GitHub workflow uses Windows/Linux test runners; Ubuntu in CI is a verification environment, not a deployed server. Local test success and remote workflow results are separate evidence. Record failures and fixes rather than declaring unrun checks green.

The current project is a website, not a native phone app. Real WhatsApp is Phase 12 and needs Meta assets, internet connectivity, an HTTPS callback and account-specific entitlement checks. Do not promise zero messaging cost merely because local backend/storage has no hosting bill.

## Technical references

Python documents SQLite connections, bound SQL and backup APIs in the [Python 3.13 sqlite3 reference](https://docs.python.org/3.13/library/sqlite3.html). STRICT table behavior is defined by [SQLite](https://www.sqlite.org/stricttables.html). Current access choices and their limits are explained in 06 and implemented in the backend; these references do not certify the entire app.
