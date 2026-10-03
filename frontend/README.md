# GSTShield internal website

Phase 8 supplies the six core workspace sections. The separately supplied landing page and final design remain later work. This is a website in your browser; the API and private SQLite data run on your PC.

## Local setup

Use Node 24.19.0 (tested; Vite requires Node >=22.12 on the supported major) and pnpm 11.19.0. From this folder:

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000 with the backend at http://localhost:8000. Provision accounts/registrations through backend's offline administration instructions first. Browser and API must use the same hostname; localhost and 127.0.0.1 cannot be mixed. `.env.example` contains the sole public frontend configuration. Omit it to derive the same loopback hostname on port 8000. No backend keys or tax records belong in frontend environment variables.

## Checks

```powershell
pnpm check:contracts
pnpm test
pnpm build
pnpm check:format
pnpm test:browser
```

`generate:api` derives DTOs from actual backend OpenAPI, without starting the backend or reading private data/configuration. Run it after intentional contract changes and commit the generated file. The backend virtual environment must exist. `contracts.ts` is generated and excluded from manual formatting.

Browser tests start an isolated temporary backend on 127.0.0.1:8027 and website on 127.0.0.1:3000. Do not run your real website on that port during these tests. Synthetic alice/bob passwords are test fixtures only; they do not create application defaults or bypass authentication. On Windows installed Chrome is used when available, or set GSTSHIELD_BROWSER_CHANNEL=msedge. Else install Chromium via `pnpm exec playwright install chromium`. Test traces/screenshots are ignored; they may include synthetic business evidence.

## Current boundary

Phase 8's `screens.spec.mjs` deliberately mocks empty API replies to inspect screen states, read-only actions, navigation, keyboard and mobile layout. This is screen verification only. The product has no mock data fallback. The saved-report list endpoint and server-side month/registration filtering still need Phase 9; reports already support real ID lookup/creation/download contracts. Phase 9 must exercise the six business workflows against the actual API before marking connection complete.

Authentication uses HttpOnly backend cookies, credentials-included requests and in-memory CSRF. Session data is never saved to localStorage. A single sessionStorage boolean remembers an explicit sign-out even if server sign-out is unavailable; it contains no token or tax data. Lists use bounded pagination, active jobs poll while visible, money remains exact decimal strings, stale sources are labelled, and consequential writes send expected versions plus idempotency keys. An interrupted reply reuses its receipt for an unchanged explicit retry. Downloads validate MIME, enforce the 5 MiB limit and remain within the request deadline/session cancellation boundary.

Payment drafts are not bank transfers, supplier drafts are NOT_SENT, worksheets/reports are not filed returns, and IRN format is not government verification. WhatsApp belongs to Phase 13. The fuller frontend security/performance reviews remain Phases 10 and 12.
