# GST-Shield — technology, dependencies and zero-cost deployment

Researched 2026-10-03. This is a proposed setup; no accounts, deployments or dependency installations were performed during document creation. Related: [product](01_PRODUCT_AND_DEMO.md), [backend](03_BACKEND_AND_DATA_SPEC.md), [security](06_SECURITY_AND_PRIVACY.md), [build gates](05_BUILD_AND_VERIFICATION_PLAN.md).

## Selected small architecture

Use Python/FastAPI for one HTTP backend, managed PostgreSQL for durable data, Supabase Auth for pre-created demonstration accounts, Supabase private Storage for imports/reports, and Meta Cloud API for WhatsApp. Reuse the supplied website. Deploy the backend on Render Free. Prefer Cloudflare Pages for a static frontend; if the supplied website needs server rendering, select its compatible host after inspection rather than rewrite it prematurely.

Run one backend process with a PostgreSQL jobs table and a small embedded dispatcher. Heavy parsing executes outside the event loop with bounded concurrency. This avoids a paid worker and Redis while persisting job state. It does not provide continuous computation while the free service sleeps. Document processing and reminders resume when the server is active; the UI must say that. Deadline reminders are initially manual/on-demand.

The reconciler is deterministic and needs no AI service. Do not add Pandas just to process a 100-row spreadsheet: standard-library CSV/JSON, openpyxl, Decimal and RapidFuzz are sufficient. Generate PDFs with ReportLab to avoid introducing a browser renderer or native HTML rendering libraries.

## Technology selection and version evidence

Current release pages were checked, but a version listing is not a successful combination test. These are **candidate pins for the first clean installation gate**, not a verified lockfile. Resolve all transitive packages together and keep the resulting lock. Re-check releases/security notices if implementation starts later.

| Component | Candidate / selection | Why and validation |
|---|---|---|
| Python | 3.13.16, conventional GIL build | Recently published supported patch; verify availability on Render and binary wheels before locking. [Python release](https://www.python.org/downloads/release/python-31316/) |
| FastAPI | 0.142.2 | Current listed stable release; OpenAPI is the shared contract source. [PyPI](https://pypi.org/project/fastapi/) |
| Pydantic | 2.13.5 | Stable v2; avoid the listed 2.14 beta. [PyPI](https://pypi.org/project/pydantic/) |
| SQLAlchemy | 2.1.2 candidate | Listed stable release; use documented 2.x transaction patterns and test with psycopg. [PyPI](https://pypi.org/project/SQLAlchemy/) |
| psycopg | 3.3.6 with binary extra | PostgreSQL driver; prove Windows and Linux installation. [PyPI](https://pypi.org/project/psycopg/) |
| RapidFuzz | 3.14.6 | Similarity suggestions, never legal/payment authority. [PyPI](https://pypi.org/project/RapidFuzz/) |
| openpyxl | 3.1.5 | XLSX read-only import; release age alone is not incompatibility. Enforce archive bounds and formula rejection. [PyPI](https://pypi.org/project/openpyxl/) |
| ReportLab | 5.0.1 candidate | PDF report generator; verify font and paragraph escaping behavior. [PyPI](https://pypi.org/project/reportlab/) |
| Supporting packages | Uvicorn, HTTPX, Alembic, PyJWT with crypto extra, pydantic-settings, python-multipart, defusedxml | Select current non-prerelease versions using the resolver; exact pins pending the foundation build |
| Quality packages | pytest, Ruff; frontend's existing type checker/test runner | Meaningful money, contract and isolation checks |
| Frontend runtime | Existing framework, Node 22+ where needed | Inspect supplied manifest before selecting exact runtime/package pins |

Use one tool for Python locking, preferably uv, and commit `pyproject.toml`, `uv.lock` and `.python-version`. Export a frozen requirements file if the deployment build needs pip. Do not force dependency overrides to bypass a resolver failure. FastAPI advises pinning a known working version and letting it choose its compatible Starlette dependency. [FastAPI version guidance](https://fastapi.tiangolo.com/deployment/versions/)

The Supabase changelog was checked because old integrations drift: client libraries dropped Node 20 support; public tables are changing their default API exposure; default SMTP customization changed. Our app keeps business tables in an unexposed schema, does not use GraphQL, and avoids email-driven demo onboarding. [Supabase changelog](https://supabase.com/changelog)

## Free hosting facts and project budgets

Render Free supports the Python backend but sleeps after 15 idle minutes, takes approximately a minute to wake, loses local files on restart and provides 750 workspace instance-hours/month. Its free PostgreSQL expires after 30 days, so use the separate managed database. Keep payment methods off where supported if strict spend prevention is required; reaching free limits may disable services. These are provider constraints, not problems solved by a keepalive script. [Render Free](https://render.com/docs/free)

Supabase Free currently lists 500 MB database space, 1 GB file storage, 5 GB ordinary egress and 5 GB cached egress, with inactivity pausing. Treat these as shared project budgets; confirm the actual project dashboard before presenting. [Supabase pricing](https://supabase.com/pricing)

Cloudflare Pages static assets are free/unlimited; functions consume Workers quotas. Prefer static hosting only here and send API traffic directly to FastAPI. A framework that requires server rendering needs a separate compatibility decision. [Pages pricing](https://developers.cloudflare.com/pages/functions/pricing/)

| Project budget | Initial ceiling | Action when reached |
|---|---|---|
| Import | 5 MB, 2,000 rows/source | Reject with useful limit error; do not silently truncate |
| Total stored demo files | 100 MB soft ceiling | Warn and remove expired synthetic artifacts through authenticated cleanup |
| Workspace processing | One job at a time | Queue the next job and expose position/status |
| Global parsing/report work | One task at a time initially | Measure responsiveness before raising |
| Database connections | Pool 3 + overflow 2, one process | Short transactions; no database connection held over network/file operations |
| WhatsApp sends | Explicit low demo budget | Stop at budget; do not switch to paid routes automatically |
| External requests | Finite connect/read/write timeout | Record failure and allow controlled recovery |

₹0 hosting is feasible for bounded demonstration use. **₹0 complete WhatsApp operation remains conditional on the actual Meta test/account entitlements.** Meta's public marketing pricing page and accessible material do not establish every current test scenario. Validate actual delivery/billing in the account before promising unlimited free responses. [WhatsApp pricing](https://whatsappbusiness.com/products/platform-pricing/), [Meta API collection](https://www.postman.com/meta/whatsapp-business-platform/collection/wlk6lh4/whatsapp-cloud-api)

## Database connection choice

Use the Supabase dashboard's session-pooler connection string on IPv4-only networks. Store its secret in `DATABASE_URL`; do not construct it from remembered host patterns. Use TLS and validate connectivity. Run migrations with a compatible direct/session connection. If transaction pooling is later selected, review prepared statements/session features rather than changing only the port. [Supabase connection guide](https://supabase.com/docs/guides/database/connecting-to-postgres)

App transactions use a dedicated backend database role restricted to the `app` schema. Auth and Storage are accessed through their supported APIs. Do not query or alter provider-managed auth tables to build homemade sessions. Backend privilege does not substitute for tenant filtering.

## Required accounts and setup inputs

Git repository; Render account; Supabase project; frontend hosting account if separate; Meta developer account, app, WhatsApp Business Account and provisioned test/registered phone number; physical recipient phone with WhatsApp; recipient registration where test mode requires it. Use provider-generated HTTPS URLs, not a purchased domain, for the demo.

Meta account availability, recipient restrictions, token lifetime, message categories and billing are checked at the first milestone. Meta's official collection supports user/system-user tokens and a test-message request; a dashboard user token expires after 24 hours. Use an appropriately scoped token whose validity spans rehearsal and presentation. [Meta Cloud API collection](https://www.postman.com/meta/whatsapp-business-platform/collection/wlk6lh4/whatsapp-cloud-api)

## Configuration contract

| Variable | Owner / exposure | Meaning |
|---|---|---|
| `APP_ENV` | Backend | `local`, `demo`, `test` |
| `DATABASE_URL` | Backend secret | Session/direct PostgreSQL connection |
| `SUPABASE_URL` | Both, public | Project origin |
| `SUPABASE_PUBLISHABLE_KEY` | Browser public | Auth client key; never privileged key |
| `SUPABASE_SECRET_KEY` | Backend secret | Supported server key for Storage/admin setup; adapter must use documented key headers |
| `SUPABASE_JWT_ISSUER` | Backend | Exact expected token issuer |
| `SUPABASE_JWT_AUDIENCE` | Backend | Expected audience, verified against actual project |
| `SUPABASE_JWT_ALGORITHM` | Backend | Explicit configured asymmetric algorithm |
| `STORAGE_BUCKET` | Backend | Private `gst-shield-private` bucket |
| `CORS_ORIGINS` | Backend | Exact website origins, parsed as a list |
| `PUBLIC_WEB_URL` | Backend public | Website origin for authenticated links |
| `PUBLIC_API_URL` | Both, public | Canonical deployed API origin |
| `WHATSAPP_ENABLED` | Backend | Default false until configured |
| `META_GRAPH_VERSION` | Backend | Supported account/API version selected from current docs |
| `META_PHONE_NUMBER_ID` | Backend | Outbound sender identity |
| `META_WABA_ID` | Backend | Expected subscribed account |
| `META_ACCESS_TOKEN` | Backend secret | Send/media access token |
| `META_APP_SECRET` | Backend secret | Incoming signature verification |
| `META_VERIFY_TOKEN` | Backend secret | GET subscription challenge token, distinct from app secret |
| `DEMO_MODE` | Backend | Enables sample labels/controlled reset, never auth bypass |
| `WHATSAPP_SEND_BUDGET` | Backend | Hard project send ceiling |

Do not commit `.env`. `.env.example` contains names and harmless placeholders. Missing required DB/auth configuration blocks readiness; incomplete enabled WhatsApp configuration blocks that feature visibly. There is no fallback secret or “accept unsigned webhook” demo option.

## Planned setup sequence

1. Resolve candidate dependencies in a new GST repository. Prove FastAPI boot, PostgreSQL transaction, private Storage round-trip, JWT verification and one PDF generation.
2. Create Supabase project. Record region, limits and actual database version. Create a private bucket, unexposed `app` schema, restricted backend role and two pre-created synthetic demo users.
3. Configure asymmetric signing keys and publishable browser key. Select email/password login for pre-created accounts; avoid relying on SMTP delivery at the presentation.
4. Apply reviewed migration once using Alembic and its dedicated migration credential. Seed synthetic data separately. Verify ordinary backend credential cannot perform schema administration.
5. Deploy one Render web service from the dedicated GST repository. Build using the frozen dependency lock. Start with `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1`. The shell expands Render's assigned port.
6. Configure `/health/live` and `/health/ready`; readiness includes a bounded DB check and configuration validation. Do not require a Meta network round-trip for every health request.
7. Deploy the supplied website using its existing build. Set its public API/Auth variables. Configure CORS with its exact origin. Verify login and one protected API request.
8. Set Meta webhook URL to `/webhooks/whatsapp`, verify GET challenge, subscribe the appropriate WABA/messages events, then prove a physical phone inbound/outbound flow.
9. Restart the backend and confirm database/file persistence and queued-job recovery. Record installed versions and working deployment settings back in this document.

These are future commands and setup actions, not a claim they have run. Document 05 owns milestone evidence.

## Demo resilience and upgrade path

Open readiness and process one sample run before presenting to reveal a paused database or cold backend. Keep a local backend against the same database as a rehearsal fallback; only one dispatcher may own a job through its lease. A temporary HTTPS tunnel can support local webhook development, but its changing URL and laptop dependence make it a fallback requiring its own rehearsal.

If internet/Meta fails, demonstrate the website and show a clearly identified recording of the previously verified phone flow. A mocked chat panel is useful for development but does not satisfy the live WhatsApp acceptance gate.

After the hackathon, an always-on backend/worker, monitoring, stronger approval separation and reviewed provider access can be added without replacing the reconciler. Provider adapters isolate storage/messaging. No AWS integration, paid queue, custom domain, credit grant or paid AI subscription is needed for the proposed core.

## Alternatives considered

| Alternative | Decision for this hackathon |
|---|---|
| SQLite on deployed ephemeral disk | Reject for hosted persistence; acceptable only in an explicitly local disposable prototype |
| Render Free PostgreSQL | Avoid its expiry for the main demonstration database |
| AWS multi-service architecture | Unnecessary account/configuration/cost surface for this bounded build |
| Redis + Celery | Defer; durable SQL jobs suffice for the chosen small workload |
| Python running inside an edge worker | Avoid uncertain heavy parsing/runtime compatibility |
| Entirely browser-side reconciliation | Does not provide the shared persisted WhatsApp workflow |
| Paid WhatsApp aggregator | Optional later; direct Meta avoids an additional commercial prerequisite |
| Unofficial WhatsApp Web automation | Avoid as core; unstable session and provider-policy assumptions |
| WeasyPrint/browser PDF renderer | Defer native/runtime dependencies; ReportLab is simpler here |
| Paid OCR/LLM for every upload | Not required for structured files; keep optional |
| Full frontend rewrite | Reject until actual website inspection demonstrates a need |

## Foundation installation recipe

The following is an implementation recipe, not commands already executed. Run it in the future GST repository, never in Jainune.

1. Install the selected Python runtime and uv through their documented platform installers.
2. Create `backend/pyproject.toml` with the candidate direct versions from the table.
3. Resolve once with `uv lock` and inspect resolver output for constraints/security notices.
4. Install with `uv sync --frozen` in a clean environment.
5. Import FastAPI, Pydantic, SQLAlchemy, psycopg, RapidFuzz, openpyxl and ReportLab.
6. Run the minimal health application; test one exact-money JSON round-trip.
7. Prove a PostgreSQL transaction and a PDF page on Linux-compatible deployment runtime.
8. Commit the lock only after these pass.

Example subsequent commands, after the referenced files exist:

```powershell
# From backend/ in the new GST repository
uv sync --frozen
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

```sh
# Render build/start settings; export file generated from the same committed lock
python -m pip install -r requirements.lock.txt
uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --workers 1
```

If uv is installed in the deployment image, use its frozen sync/run path instead of maintaining a second independently selected dependency list. `requirements.lock.txt` must be a lock export, not manually edited floating requirements.

## Supabase setup details to record

- Project reference and region, without database password.
- Actual PostgreSQL version and enabled extensions used by our code.
- Selected connection mode and proven TLS behavior.
- Restricted role grants and migration credential location.
- `app` excluded from Data API exposure.
- Private bucket creation and upload bounds.
- Auth issuer/audience/algorithm and JWKS endpoint.
- Published frontend auth origin/redirect configuration.
- Two demonstration user subjects and workspace membership IDs.
- Current project limits and inactivity state.

Pre-created accounts avoid live SMTP dependency at judging. Do not disable authentication to avoid email setup. Privileged account creation belongs to a controlled setup script/dashboard, not a public signup endpoint with owner-role assignment.

## Runtime validation checklist

| Validation | Fail behavior |
|---|---|
| DATABASE_URL missing/invalid | Startup/readiness failure with secret-redacted error |
| Database connection unavailable | Readiness false; business requests return dependency error |
| JWT issuer/algorithm missing | Refuse protected operation configuration |
| Bucket accidentally public | Setup gate fails before real document use |
| WhatsApp enabled but token/secret missing | Feature configuration failure, never unsigned operation |
| CORS contains wildcard with credentials | Reject configuration |
| Public API URL uses local HTTP in demo deployment | Setup error |
| Unknown schema migration version | Readiness false until reviewed migration applied |

Do not do provider-changing DDL in application startup. Keep migrations deliberate so a restart cannot accidentally rewrite the schema.

## Health and diagnostic endpoints

`/health/live` answers whether the process can handle a request. It returns no secrets/config values. `/health/ready` checks validated configuration and database connectivity under a short timeout. It reports an opaque status/build identifier; internal logs carry redacted details.

Storage and Meta setup are tested separately through authorized diagnostics or setup scripts. Requiring an external message send in each health check would spend quotas and couple the application's availability to an unrelated provider probe.

The deployment dashboard records CPU/memory and restart events during a full 100-row run. Before raising row limits, inspect actual peak memory and callback latency. A long-lived HTTP request should not be the only evidence that a job exists; `202` follows a committed job record.

## Secrets lifecycle

Use separate secrets for local/deployed environments where possible. Rotate an accidentally exposed token immediately and remove it from working files/logs. A copied secret in Git history remains exposed even after deleting the current line.

For Meta, record expiry and required permissions without recording the token itself. Before presentation, send one controlled test reply and verify it reached the phone. For database credentials, test the restricted role rather than relying on a successful migration connection.

No automatic environment fallback may connect the demo to a different writable database. A missing URL is an error, not permission to initialize a local SQLite database and falsely report persistence.

## Cost and outage review before judging

- Confirm selected account plans remain free.
- Confirm no automatic paid upgrade/overage route is enabled unintentionally.
- Check Storage/egress use after PDF and phone tests.
- Check Meta send allowance/billing from the account, not remembered historical rates.
- Confirm database has not paused and backend can wake.
- Confirm browser/API URLs point to the same expected environment.
- Confirm no trial-only feature is critical to the main flow.
- Record a known working commit and deployed build identifier.

## Deployment proof register

| Item | Current status |
|---|---|
| Candidate release pages researched | DONE; candidates listed above |
| Dependency resolver/install | NOT_RUN |
| Python runtime on selected host | NOT_PROVED |
| PostgreSQL role/connection/migration | NOT_RUN |
| Auth/JWKS verification | NOT_RUN |
| Private Storage round-trip | NOT_RUN |
| Supplied frontend build | WAITING_FOR_FRONTEND |
| Physical WhatsApp round-trip | NOT_RUN |
| Account-specific ₹0 messaging proof | NOT_PROVED |
| Deployed restart/recovery | NOT_RUN |

Move entries to proved only with observed outcomes. Keep provider facts date-stamped; free tiers and package releases can change between planning and implementation.
