# GSTShield supplied website

This directory is reserved for the website the user will supply. GSTShield is a website application with a WhatsApp companion. The website has not been supplied: no frontend code, package installation or build is present yet.

Preserve the supplied design and package manager. Inspect its actual framework, runtime, lockfile, build command, routes, authentication assumptions, mock data and assets before choosing dependencies or editing components.

## Dedicated frontend phases

The [canonical 13-phase plan](../md/05_BUILD_AND_VERIFICATION_PLAN.md) owns deliverables, order and review gates.

| Phase | Frontend work | Completion evidence |
|---|---|---|
| 7 | Inspect/repair the supplied website and finish coherent screens | Clean build, required screens/actions mapped, responsive/keyboard review |
| 8 | Connect every implemented action to the real local backend | Actual private access/upload/review/report flow with matching data and recovery |
| 9 | Review browser security and private-data handling | Safe imported text, credential checks, expired access/logout isolation and protected actions |
| 11 | Measure/fix browser lag and smoothness | Comparable recordings, usable tables/navigation, bounded requests and preserved correctness |
| 12 | Phone/website state alignment | Both channels use the same authorized context and results |
| 13 | Whole-application rehearsal | Fresh-session and restart/error scenarios on the final local build |

Phases 7–9 and 11 are distinct implementation/review increments. Basic safe rendering, state scoping and responsiveness must be present when each screen is built or connected, rather than deferred until a later review phase.

## Phase 7 handoff checklist

Record the supplied package/runtime versions and commands. Identify missing screens, broken links, non-working buttons and hard-coded sample results. Keep a component-to-backend-operation map against [08](../md/08_CONTRACTS_AND_ALIGNMENT.md).

Review private access/context selection, source upload, mapping/confirmation, job progress, result lists, human review, cases and downloads. Include empty/loading/failure/expired-access states and accessible mobile/desktop controls. Clearly identify any remaining simulation.

Do not initialize a replacement framework before this inspection. If TypeScript is used, share or generate contract types appropriate to the actual project; do not assume the website already uses it.

## Phase 8 connection checklist

Use one backend client and the local private-access mechanism chosen in Phase 2. Align addresses, fields, status enums, money strings, dates, errors and pagination with implemented backend contracts.

Use real replies instead of mock success. Keep data scoped to identity/workspace/registration/period; clear it on logout or scope change. Cancel/ignore obsolete replies, prevent duplicate submissions and provide recovery after backend restart, expiry, conflicts and interruption.

Browser display calculations cannot become the authoritative financial record. Compare screen counts/totals and generated reports against the same committed run after review changes.

## Phase 9 security checklist

Treat imported names, cell text, filenames, errors and links as untrusted. Display text safely and inspect any rich-content rendering.

Keep privileged backend/Meta credentials out of browser bundles and public environment variables. Review browser storage, logs, copied debug output, session expiry and cached private screens. Frontend controls never replace backend access checks.

Match request-forgery protections, browser content policies and download behavior to the actual framework/session setup. Verify denied actions remain denied after logout or a changed resource ID.

## Phase 11 smoothness checklist

Profile the real connected website on the demo hardware. Separate browser rendering delays from backend work. Measure loading, navigation, result scrolling/filtering, review actions and repeated screen visits.

Fix measured repeated rendering/requests, oversized lists/assets and irrelevant polling. Use pagination and apply virtualization, lazy loading or memoization only for an observed need. Keep loading/error feedback useful and preserve exact data, scope and state after changes.

Record before/after results, agreed budgets and remaining limits. Do not promise universal zero lag without measurement.

## Current boundary

The backend provides Phase 1 health/configuration plus Phase 2 local SQLite accounts, session recovery/logout and scoped workspace/registration reads. Use credentials:include, same-host website/API URLs and in-memory CSRF from the session endpoint. Imports, reconciliation and reports remain later phases. No frontend or phone journey is represented as connected today.
