# Loan Record Service Delivery Checklist

Derived from [CHARTER.md](./CHARTER.md). Work in this order. Check an item only after its acceptance condition is verified. Staff identity lifecycle is external: this project will not build signup, passwords, invitations, MFA enrolment, sessions, or user deactivation.

## 0. Settle the product rules

- [x] Write `PRODUCT_RULES.md` with the mandatory customer fields and acceptable identity references.
- [x] Define the lender and branch model, including whether staff may operate in multiple branches.
- [x] Define loan-product fields and conventions for principal, interest, fees, term, and repayment frequency.
- [x] Define approval authority: one reviewer or multiple levels, amount limits, and reassignment rules.
- [x] Define return, resubmission, rejection, cancellation, and exceptional decision-reversal rules.
- [x] Define allowed attachment types, size limits, retention periods, and who may view them.
- [x] Define the required CSV and PDF exports.
- [x] Record the legal/compliance questions requiring Ghanaian counsel or Data Protection Commission guidance.

**Complete when:** the application fields, workflow, and permissions can be implemented without inventing business policy in code.

## 1. Establish the project

- [x] Initialise the Git repository and add a focused README.
- [x] Scaffold a pnpm TypeScript project using React, Vite, the Cloudflare Vite plugin, Workers, and Hono.
- [x] Establish domain-oriented modules for access, lenders, customers, products, applications, reviews, files, and audit.
- [x] Enable strict TypeScript, formatting, linting, Vitest, and Playwright.
- [x] Configure local D1, R2, and Queue bindings with Wrangler.
- [x] Add environment validation and separate local, staging, and production configuration.
- [x] Add GitHub Actions for type-checking, tests, build verification, dependency review, and secret scanning.
- [x] Deploy a stateless playground Worker to Cloudflare without durable bindings or production data.

**Complete when:** a new developer can install dependencies, start the app locally, run all checks, and deploy a harmless preview Worker from documented commands.

**Verification:** Local installation, checks, browser test, production build, and Wrangler deployment dry-run pass. The playground is live at `https://lenddocket-playground.true-sense-inc.workers.dev`.

## 1A. Deliver the playable workflow

- [x] Add explicit Agent and Reviewer demo personas without implementing identity management.
- [x] Build guided customer and application intake using the restrictive mandatory fields.
- [x] Calculate the fixed product terms and display the repayment breakdown.
- [x] Submit an application snapshot into a reviewer queue.
- [x] Let the separate reviewer approve or reject with a mandatory decision note.
- [x] Mask the Ghana Card PIN and make the no-disbursement boundary prominent.
- [x] Persist fictional records in browser-local demo storage with a reset control.
- [x] Verify the complete journey in Chromium and check desktop and mobile layouts.
- [x] Publish the stateless workflow to a shareable Cloudflare playground.

**Complete when:** Andrew can enter fictional details as an agent, submit them, switch personas, and record an independent decision without any server-side schema or production-data dependency.

**Temporary boundary:** This validates workflow and interaction design only. Durable records, concurrency, idempotency, audit guarantees, server-side authorisation, and real file handling remain in the later milestones.

## 2. Build the stable storage envelope

- [ ] Write an architecture decision explaining the no-routine-migrations strategy and its trade-offs.
- [ ] Provision staging D1, R2, and Queue resources only after the stable envelope is accepted.
- [ ] Define the one-time, idempotent D1 bootstrap for lenders, branches, records, record revisions, attachments, audit events, and idempotency keys.
- [ ] Define stable indexed fields for tenant, record type, workflow state, ownership, common searches, and timestamps.
- [ ] Define versioned Zod payloads for customers, products, applications, revisions, and decisions.
- [ ] Implement prepared, parameter-bound D1 repositories with tenant scope required by their interfaces.
- [ ] Implement atomic state-change-plus-audit batches.
- [ ] Implement optimistic version checks and idempotency-key handling.
- [ ] Implement old-payload readers and current-version writers without blocking background upgrades.
- [ ] Test bootstrap repeatability, payload compatibility, constraints, rollback, and read-after-write behaviour.

**Complete when:** a feature can add an application field without changing the physical database schema, and every authoritative write produces its audit event atomically.

## 3. Integrate external access and enforce authorisation

- [ ] Define the trusted principal contract supplied by Cloudflare Access or the deployment gateway.
- [ ] Validate the Access principal, issuer, audience, and expiry on every application request.
- [ ] Define the externally administered mapping from principal or group claims to lender, branch, and the Agent, Reviewer, Administrator, and Auditor roles.
- [ ] Enforce tenant and role permissions on the server for every endpoint.
- [ ] Enforce that an application creator or submitter cannot decide that application, regardless of their other roles.
- [ ] Add denial tests for missing or invalid principals, cross-lender, cross-branch, wrong-role, and self-review access.

**Complete when:** authentication remains external and application permissions cannot be bypassed by calling the API directly.

## 4. Build lender administration

- [ ] Create and manage lender profiles and branches.
- [ ] Configure loan products and required application fields.
- [ ] Record every administrative change in the audit trail.
- [ ] Prevent administrators from editing or deleting submitted application history.

**Complete when:** a lender administrator can prepare an organisation for agents and reviewers without developer intervention.

## 5. Build customer and application intake

- [ ] Create, view, and update customer records within a lender.
- [ ] Warn about possible duplicates using the approved lender-scoped identifiers; never expose another lender's matches.
- [ ] Create, save, resume, and discard application drafts.
- [ ] Capture proposed principal in GHS, term, rate, fees, repayment frequency, notes, and product-specific fields.
- [ ] Upload attachments privately to R2 with type and size validation, checksums, and metadata in D1.
- [ ] Queue attachment scanning and represent pending, clean, and rejected scan states.
- [ ] Validate completeness on the server before submission.
- [ ] Submit idempotently and store an immutable snapshot of customer details, terms, attachments, actor, and time.
- [ ] Make the intake flow usable on small screens and resilient to slow, interrupted requests.

**Complete when:** an agent can reliably produce a complete, immutable submitted application without being able to decide it.

## 6. Build review and decision workflows

- [ ] Build the reviewer queue with lender, branch, product, status, and date filters.
- [ ] Allow an eligible reviewer to begin review using a version-checked state transition.
- [ ] Show the exact submitted snapshot, attachments, earlier revisions, and relevant audit history.
- [ ] Return an application for correction with a mandatory explanation.
- [ ] Allow an agent to revise and resubmit while preserving every earlier snapshot.
- [ ] Approve with explicit final terms and a mandatory decision note.
- [ ] Reject with a mandatory reason.
- [ ] Prevent duplicate, stale, conflicting, or self-authored decisions.
- [ ] Make it unmistakable that approval records a decision and does not disburse funds.

**Complete when:** every permitted lifecycle transition works, every forbidden transition fails, and the full history remains explainable.

## 7. Build records, search, and exports

- [ ] Build lender-scoped customer and application search with pagination and filters.
- [ ] Build customer and application timelines from immutable revisions and audit events.
- [ ] Build approved-application records showing final terms and status.
- [ ] Build the Auditor read-only experience.
- [ ] Generate CSV exports asynchronously through Queues.
- [ ] Generate accessible PDF application and decision records asynchronously through Queues.
- [ ] Authorise every export, store it privately, expire access, and audit its creation and download.

**Complete when:** authorised staff can find, understand, and export records without gaining mutation rights or crossing lender boundaries.

## 8. Harden security and operations

- [ ] Configure private R2 access, upload restrictions, malware-scanning failure handling, and short-lived downloads.
- [ ] Configure WAF and rate limits; use Turnstile only on flows that benefit from bot protection.
- [ ] Redact personal and identity data from logs, traces, errors, and analytics.
- [ ] Add request correlation IDs and structured audit-safe operational logs.
- [ ] Make Queue consumers idempotent and configure retries and dead-letter handling.
- [ ] Configure D1 Time Travel and scheduled long-retention exports to a restricted R2 bucket.
- [ ] Write and test backup restoration and audit-reconciliation procedures.
- [ ] Configure monitoring and alerts for failed decisions, scan failures, queue backlogs, authentication abuse, and export failures.
- [ ] Verify production data and secrets cannot enter development or test environments.

**Complete when:** the service can detect, withstand, and recover from expected operational failures without losing or leaking authoritative records.

## 9. Verify and release

- [ ] Complete unit, Worker integration, API contract, component, and end-to-end coverage for the principal journeys.
- [ ] Test tenant isolation across API responses, search, files, exports, logs, and queues.
- [ ] Test idempotency and concurrent submissions and decisions under retry conditions.
- [ ] Test old payload compatibility and the idempotent environment bootstrap.
- [ ] Test accessibility, keyboard operation, small screens, slow connections, and interrupted requests.
- [ ] Forecast the first year's lenders, users, applications, revisions, audit events, and file volume.
- [ ] Load-test D1 capacity and concurrent decision writes against that forecast.
- [ ] Obtain legal review of the final fields, consent/notice, retention, processor, residency, lending, and regulatory obligations.
- [ ] Run a security review and resolve all release-blocking findings.
- [ ] Complete lender-user acceptance testing with agents, reviewers, administrators, and auditors.
- [ ] Write production runbooks, support procedures, and incident-response contacts.
- [ ] Restore a production-shaped backup and reconcile its audit history before launch approval.

**Complete when:** all charter success criteria have current evidence and an authorised owner accepts the first production release.

## Later, not first release

Do not start these without revising the charter: customer accounts or applications, automated underwriting, identity or credit-bureau verification, disbursement, repayments or arrears, accounting, customer messaging, and automated regulatory reporting.
