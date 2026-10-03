# GSTShield local backend

## Active scope

Decision: 2026-10-03. Run the hackathon website backend on the local PC. No Render, cloud server, external database, cloud storage, Redis or hosted identity setup. A local backend process is still required for the website to call Python functionality.

Phase 1 implements the HTTP/configuration foundation. Phase 2 will use a local SQLite file and private files under `backend/data/`. SQLite uses Python's standard library and requires no database service or account. No database, schema, uploads or private-data endpoints exist in Phase 1.

The [phase plan](../md/05_BUILD_AND_VERIFICATION_PLAN.md) overrides older cloud and temporary-memory proposals in the planning pack. Work proceeds one phase at a time, with a review gate before the next phase.

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
| GET /health/ready | Configuration validated and application lifespan started; returns status=ready |
| GET /docs | Developer API documentation in local/test mode |
| GET /openapi.json | Schema in local/test mode |

Readiness returns 503 before startup/after shutdown. It does not claim SQLite connectivity, file durability, import readiness, GST correctness or WhatsApp availability. Developer docs/schema are disabled in APP_ENV=demo; this mode still runs locally.

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

Upload/parser/session/rate/linking/download settings are validated reservations for later phases. They are not enforced features yet. WHATSAPP_ENABLED must remain false: even complete provider configuration cannot activate an unfinished integration.

## HTTP safeguards and limits of Phase 1

The launcher binds to loopback. The HTTP boundary rejects non-local Host values and duplicate Host/Origin headers. Requests carrying an unapproved Origin are rejected before routes run. CORS permits exact configured origins, implemented GET operations and explicit headers; credentialed cross-origin cookies are not enabled.

Security/no-store headers and request IDs cover successful and failed HTTP responses. Unexpected errors return a generic message; logging keeps the request ID and exception class rather than the private exception contents. The outer boundary prevents the framework's completed 500 response from causing Uvicorn to log the original exception again. Partially sent responses abort with a sanitized failure.

These controls are not authentication. Before accepting documents, Phase 2 must implement private access and data scoping. DEMO_MODE is a sample-data flag and never an authentication bypass.

There are no upload routes in Phase 1. Streaming-body, parser, disk and processing quotas will be enforced at their actual boundaries in later phases; a configuration field alone does not provide that protection.

## Local storage decision

Phase 2 will keep authoritative data in a local SQLite file, with bounded private artifact/source files on the PC. Browser localStorage may hold harmless UI preferences; it will not own financial records, access authority or reconciliation results.

The local file should survive normal process restarts. Durability, transactions, expiry, backup/restore and denied cross-session access require Phase 2 implementation and tests; they are not proven by a health response. Local data is not encrypted by this foundation.

The database/data directory, dotenv credentials and tooling are ignored by Git. Keep real taxpayer documents out of the public repository and use synthetic fixtures for development.

## Phase plan and status

| Phase | Work | Status |
|---|---|---|
| 1 | Local runtime, configuration and HTTP foundation | Complete |
| 2 | Local SQLite/private files and private access | Not started |
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
| app/api | Future HTTP routes and access dependencies |
| app/contracts | Shared HTTP/input/output contracts |
| app/domain | Future exact-money and reconciliation rules |
| app/services | Future use cases shared by website and WhatsApp |
| app/adapters | Future import/report/provider boundaries |
| app/storage | Future local SQLite/private-file persistence |
| app/jobs | Future bounded local processing |
| app/security | HTTP boundary now; private access/upload/callback checks later |
| tests/unit | Configuration and HTTP-boundary regressions |
| tests/integration | API lifecycle, real process startup and failure behavior |
| tests/fixtures | Reserved for clearly labeled synthetic input/expected results |

No later-phase endpoint or result is represented as working. The next implementation increment is Phase 2 after Phase 1 review.
