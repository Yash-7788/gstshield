# GSTShield

Hackathon website application with WhatsApp integration. This repository contains research, implementation planning and the initial project structure. Phase 1 provides the local foundation; Phase 2 adds private SQLite/account access and is complete and locally verified. Phase 3 adds private imports and is complete and locally verified; Phase 4 adds reconciliation and human review; Phase 5 adds evidence cases, proposal drafts and private reports. Both are complete and locally verified; Phase 6 is complete and locally verified and Phases 7–14 remain pending.

## Start here

Read [Product and Demo](md/01_PRODUCT_AND_DEMO.md) for the scope and document map.

## Implementation planning

1. [Product and Demo](md/01_PRODUCT_AND_DEMO.md)
2. [Tech Stack and Deployment](md/02_TECH_STACK_AND_DEPLOYMENT.md)
3. [Backend and Data Specification](md/03_BACKEND_AND_DATA_SPEC.md)
4. [Website and WhatsApp Integration](md/04_WEBSITE_AND_WHATSAPP_INTEGRATION.md)
5. [Build and Verification Plan](md/05_BUILD_AND_VERIFICATION_PLAN.md)
6. [Security and Privacy](md/06_SECURITY_AND_PRIVACY.md)
7. [Rules and Integration Truth](md/07_RULES_AND_INTEGRATION_TRUTH.md)
8. [Contracts and Alignment](md/08_CONTRACTS_AND_ALIGNMENT.md)

## Foundation documents

- [Original GST report](md/GST_ITC_SHIELD_REPORT.md): original product hypothesis; read together with the review.
- [GST report review](md/GST_ITC_SHIELD_REVIEW.md): corrections, reproduced prototype defects, and evidence boundaries.
- [Engineering headstart](md/ENGINEERING_HEADSTART.md): transferable lessons from Jainune, with verification limits.

The original report is historical context, not the final implementation authority. The planning pack defines the bounded hackathon build. The local Phase 1 dependencies are resolved in backend/uv.lock. Later feature dependencies and any actual WhatsApp account setup are verified in their own phases.

## Collaboration

Use branches and pull requests for implementation changes. Update shared contracts, schema, adapters and verification together. Keep credentials, private taxpayer documents and real financial data out of commits. Collaborator invitations are managed separately through GitHub access settings.

## Full application phases

The expanded plan has **14 phases** with separate backend, frontend, security, connection and performance work. Phases 1–7 are complete and locally verified; Phases 8–14 are not started.

1. Local backend foundation.
2. Local storage and private access.
3. File imports, checking and confirmation.
4. Reconciliation and human review.
5. Backend reports, cases and evidence workflow.
6. Business workflows for all six original problems.
7. Backend security and failure review.
8. Supplied frontend inspection, cleanup and complete screens.
9. Frontend/backend connection.
10. Frontend security and privacy review.
11. Backend performance and resource efficiency.
12. Frontend smoothness, speed and usability.
13. WhatsApp connection and channel review.
14. Whole-application regression and hackathon rehearsal.

The [build plan](md/05_BUILD_AND_VERIFICATION_PLAN.md) contains each phase's detailed tasks and review gates. The frontend starts from the supplied website once received. Basic security and responsiveness apply during feature work; focused review phases do not defer them.

## Active first-demo scope

Run GSTShield on the local PC; no cloud server or external database. Phase 1 provides local HTTP/configuration. Phase 2 stores identities, sessions and workspace context in a local SQLite file. See [backend setup](backend/README.md) and the [phased implementation plan](md/05_BUILD_AND_VERIFICATION_PLAN.md). All eight active specifications now use the local architecture. The three original foundation documents remain historical context.

```text
gstshield/
  md/                         # eight specifications and three foundations
  backend/
    app/                      # API, contracts, domain, services, adapters,
                              # storage, jobs and security packages
    tests/                    # unit, integration and synthetic fixtures
    pyproject.toml            # runtime and development dependencies
    .env.example
  frontend/                   # reserved for the supplied website
```

Run instructions and phase status are in [backend/README.md](backend/README.md). SQLite/private access is implemented in Phase 2. Private GST import/preview/confirmation endpoints are implemented in Phase 3. Reconciliation, saved runs/results and human review are implemented in Phase 4. Phase 5 cases, proposals and private reports are implemented. Phase 6 business automation is complete and locally verified; frontend wiring and WhatsApp remain future phases.


## Business workflow roadmap correction

Phase 6 implements the six local business workflows through retained actions, supplier follow-up drafts/history, snapshot-change review, reversal/reclaim tracking, recorded-date reminders and notice/IRN tasks. Its local completion gate passed; the measured full-suite and final focused verification record is in 05. Frontend screens/connection remain Phases 8–9, real WhatsApp remains Phase 13 and combined acceptance remains Phase 14. Phases 7–14 are not started.
