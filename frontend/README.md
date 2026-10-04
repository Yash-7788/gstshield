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
pnpm test:preview
```

`generate:api` derives DTOs from actual backend OpenAPI, without starting the backend or reading private data/configuration. Run it after intentional contract changes and commit the generated file. The backend virtual environment must exist. `contracts.ts` is generated and excluded from manual formatting.

Browser tests start an isolated temporary backend on 127.0.0.1:8027 and website on 127.0.0.1:3000. Do not run your real website on that port during these tests. Synthetic alice/bob passwords are test fixtures only; they do not create application defaults or bypass authentication. On Windows installed Chrome is used when available, or set GSTSHIELD_BROWSER_CHANNEL=msedge. Else install Chromium via `pnpm exec playwright install chromium`. Test traces/screenshots are ignored; they may include synthetic business evidence.

## Connected workflow boundary

All six internal sections use the real local API. Saved reports remain discoverable, and registration/month filters execute in SQL before pagination. `journeys.spec.mjs` contains six real journey tests covering the original business workflows, reports, role/context changes, delayed actual replies, server restart, revocation and stale-write recovery. `screens.spec.mjs` separately mocks empty replies to inspect layout/navigation/errors; these fixture tests do not count as connected business operations. The product has no sample-response fallback.

Authentication uses HttpOnly backend cookies, credentials-included requests and in-memory CSRF. Session data is never saved to localStorage. A user-scoped sessionStorage selection stores only workspace/registration IDs and month for refresh; it is cleared on sign-out/expiry and is never access authority. A separate sessionStorage boolean remembers an explicit sign-out even if server sign-out is unavailable; it contains no token or tax data. Lists use bounded pagination, active jobs poll while visible, money remains exact decimal strings, stale sources are labelled, and consequential writes send expected versions plus idempotency keys. An interrupted reply reuses its receipt for an unchanged explicit retry. Downloads validate MIME, enforce the 5 MiB limit and remain within the request deadline/session cancellation boundary.

Payment drafts are not bank transfers, supplier drafts are NOT_SENT, worksheets/reports are not filed returns, and IRN format is not government verification. WhatsApp belongs to Phase 13. Phase 10 completed the frontend security/privacy review for this local scope; performance review remains Phase 12.

`test:preview` builds the real site against the isolated API and verifies login, upload, parsing, confirmation and sign-out under the preview CSP. Dev and preview remain loopback-only. Core browser tests are a sequential shared-fixture rehearsal; run the whole journey file when exercising persistence and later review gates.


## Frontend privacy review

Phase 10 clears cached data on access denial, removes denied action details and refreshes workspace roles every 15 seconds while visible. Role changes reset private forms. Report downloads are cancelled when leaving their context; late error bodies cannot expire replacement sessions. API pathnames and report ID lookup are restricted, with backend authorization still controlling all operations.

Only VITE_API_BASE_URL is exposed. Automatic public-directory copying is disabled; import reviewed assets from source when integrating the later design. Vite dev serving blocks backend paths, tests, helper scripts and test traces/screenshots. Strict CSP is exercised on the built preview; development retains functional hot reload and the framing denial header. This remains local PC software.

`pnpm test` now includes 10 client/configuration checks. The browser suite has 14 passing tests: six original real journeys, two real security journeys, four explicitly simulated privacy faults and two original screen fixtures. `test:preview` has two passing checks for the working built flow, content policies and synthetic secret-canary absence. The real and mocked checks are labelled separately. Fixed browser-test ports 3000 and 8027 must be free; test output is ignored and must not be published. Full records and accepted limits are in md/05 and md/06.
