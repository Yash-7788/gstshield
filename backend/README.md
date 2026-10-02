# Backend structure and active first-demo scope

Decision: 2026-10-03. The user selected a live demo without a database and requested project structure first, then backend implementation. This decision overrides the database-dependent first milestones in the original planning pack.

## What exists now

A Python package skeleton, project metadata, environment example and test locations. There is no server entry point, endpoint, storage implementation, reconciliation engine or WhatsApp integration yet. The package's empty dependency list is intentional. A dependency lockfile will be created after actual backend dependencies are selected, resolved and verified.

## Folder responsibilities

| Folder | Responsibility when implemented |
|---|---|
| `app/api/` | HTTP routes, request validation and access dependencies |
| `app/contracts/` | Shared input/output schemas, enums and errors |
| `app/domain/` | Exact monetary values and deterministic reconciliation rules |
| `app/services/` | Application use cases shared by website and WhatsApp |
| `app/adapters/` | CSV/XLSX/JSON parsing, report and Meta integration boundaries |
| `app/storage/` | Small storage interfaces and initial bounded in-memory implementation |
| `app/jobs/` | Bounded process-local work if needed; not durable |
| `app/security/` | Access checks, callback signatures and upload limits |
| `tests/unit/` | Money, matching and validation regressions |
| `tests/integration/` | Real API/channel behavior once implemented |
| `tests/fixtures/` | Clearly labeled synthetic demo inputs and expected results |

## First demo architecture

Website and WhatsApp adapters call the same application services. Services depend on a small storage interface, initially implemented in memory. Do not scatter raw dictionaries throughout routes or add speculative database abstractions.

One backend process owns temporary state. Restart, redeploy or free-host sleep can erase imports, results, linking state and retry records. The frontend must explain session expiry and allow re-upload. The first demo makes no durable job, restart recovery or cross-replica guarantees.

Bound memory, file sizes and session lifetime before accepting uploads. In-process locks protect contested state within the single process only. They are not distributed coordination. Process-local deduplication cannot prevent replay across restarts.

PostgreSQL, ORM, migrations, Redis and managed Storage are deferred. Authentication is a separate implementation decision: removing the database does not authorize public access to confidential documents or unsigned callbacks. Use synthetic fixtures during initial development, and keep WhatsApp disabled until callback validation and explicit access/linking behavior are implemented.

## Next backend step

1. Resolve and lock only the required initial Python dependencies.
2. Implement the application entry point, validated configuration and health endpoints.
3. Define shared errors and a bounded in-memory storage interface.
4. Add import/reconciliation functionality through services.
5. Connect the supplied website and then real WhatsApp messages.

Do not claim the scaffold can be launched as a web server. Run instructions and CI execution checks will be added with the actual server implementation.
