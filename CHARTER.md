# Loan Record Service Charter

**Status:** Founding charter, v0.2
**Market:** Ghana
**Date:** 8 November 2026

## Mission

Provide lenders with a trustworthy system for staff-assisted customer registration, loan application capture, independent review, and decision record-keeping.

Customers are not application users. A lender's agent records information supplied by the customer; a different authorised staff member reviews the application and approves, rejects, or returns it for correction.

## Product principles

1. **Assisted, not self-service.** The interface is designed for lender staff working with a customer, including on small screens and unreliable connections.
2. **Separation of duties.** A person must never approve or reject an application they entered or submitted.
3. **History is evidence.** Submitted applications, decisions, and audit events are never silently edited or deleted. Corrections create a new revision.
4. **One lender cannot see another.** Every record and permission is scoped to a lender; branches may be scoped within a lender.
5. **Collect only what is needed.** Personal data, identity references, and documents must have a defined business purpose and retention rule.
6. **Humans make the decision.** The service may validate completeness but will not score applicants or make lending decisions in the first release.
7. **Approval is not payment.** An approved application is a record of a decision, not evidence of disbursement.

## Users and authority

| Role                 | Authority                                                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Agent                | Create customers and applications, edit drafts, attach supporting records, and submit applications.                                             |
| Reviewer             | Review submitted applications and approve, reject, or return them with a reason; cannot decide their own submissions.                           |
| Lender administrator | Manage branches, loan products, and required fields; cannot rewrite history. Staff identities and login access are managed outside the service. |
| Auditor              | Read records, audit history, and exports without making changes.                                                                                |

Permissions are server-enforced. A user may hold more than one role, but the separation-of-duties rule always applies.

## Application lifecycle

`Draft -> Submitted -> Under review -> Approved | Rejected | Returned for correction`

- Submission stores an immutable snapshot of the customer details, proposed terms, attachments, submitting user, and time.
- A returned application may be revised and resubmitted; earlier snapshots remain visible.
- A decision records the reviewer, time, outcome, reason, and approved terms. Rejection reasons are mandatory.
- No submitted application is hard-deleted through normal product operation.

## First-release scope

- Lender and branch configuration, plus consumption of externally managed staff identities and role assignments.
- Customer registry with lender-scoped duplicate warnings.
- Configurable loan products and required application fields.
- Drafting and submission of applications, including proposed amount in GHS, term, rate, fees, repayment frequency, notes, and private attachments.
- Reviewer queue, structured review, return-for-correction, approval, and rejection.
- Approved-application record with the final agreed terms and status; no money movement.
- Search, filters, customer/application timelines, and CSV/PDF export.
- Append-only audit trail for access to sensitive records and every material change or decision.

Core records are: lender, branch, external actor reference, customer, customer identity reference, loan product, application, application revision, review decision, attachment, and audit event.

## Explicitly out of scope

Staff signup, passwords, invitations, MFA enrolment, session management, or other identity lifecycle features; customer accounts or online applications; automated underwriting or credit scoring; customer identity or credit-bureau verification; disbursement; repayment collection and arrears management; accounting; customer messaging; and lender licensing or regulatory reporting automation.

These may be added later without weakening the audit history or separation-of-duties rules.

## Engineering charter

Build a **modular monolith** first: one full-stack Cloudflare deployment, one API Worker, and one primary relational store. Keep product modules distinct, but do not introduce multiple Workers or services until scale or team ownership proves the need.

### Technology stack

- **Language:** TypeScript across the browser and server, with strict compiler settings and shared API types.
- **Web:** React, Vite with the Cloudflare plugin, React Router, TanStack Query, React Hook Form, and Zod. Use accessible component primitives and a restrained design system.
- **API:** Cloudflare Workers with Hono and OpenAPI 3.1. Business rules live in domain modules, not in route handlers or the browser.
- **Data:** Cloudflare D1 with prepared SQL and a deliberately small, stable schema. Fixed columns hold record ID, tenancy, workflow state, ownership, timestamps, and common search keys; versioned JSON payloads hold customer, product, and application details. Use database constraints, atomic batches, conditional state transitions, and the Sessions API where read-after-write consistency matters.
- **Files:** Private Cloudflare R2 buckets; metadata and checksums in D1; authenticated Worker access or short-lived presigned access only.
- **Background work:** Cloudflare Queues for retryable tasks such as file scanning and exports. Consumers must be idempotent because delivery may occur more than once.
- **Identity boundary:** Cloudflare Access or another trusted gateway owns staff authentication, MFA, sessions, invitations, and deactivation. The Worker consumes a validated principal and externally administered lender, branch, and role claims; it stores no credentials and provides no identity-management UI.
- **Hosting:** Cloudflare Workers Static Assets for the web application and API, protected by Cloudflare WAF, rate limiting, and Turnstile where bot protection is useful.
- **Delivery:** pnpm, Wrangler, GitHub Actions, Terraform, and separate development/staging/production resources. New environments receive the same idempotent schema bootstrap.
- **Quality:** Vitest unit and Worker integration tests, API contract tests, frontend component tests, and Playwright tests for the submission and decision journeys.
- **Operations:** Workers observability and structured logs with personal data redacted, alerting, D1 Time Travel, scheduled D1 exports to restricted R2 storage, and tested restoration.

### Non-negotiable controls

- Server-side tenant scoping and authorisation on every request.
- The external authentication gateway must require multi-factor authentication for reviewers and administrators.
- Encryption in transit and at rest; no production personal data in development or test.
- Private attachments, malware scanning, size/type limits, and no public file URLs.
- Append-only, timestamped audit events containing actor, action, record, and request correlation ID.
- Each state change and its audit event committed atomically; asynchronous queues never replace the authoritative audit write.
- Idempotency keys and version-checked updates for submissions and decisions to prevent double or conflicting actions on poor connections.
- Stored payloads carry a schema version. Readers remain compatible with older payloads, writers emit the current version, and optional background upgrades are resumable and non-blocking.
- Ordinary product changes must not require database migrations. A physical schema change is an exceptional architectural decision, not a deployment step.
- D1 point-in-time recovery plus scheduled long-retention exports to R2, documented recovery procedures, and periodic restore tests.
- Dependency, static-analysis, payload-compatibility, bootstrap, and secret-scanning checks before deployment.

## Definition of a successful first release

- Staff can trace every submitted application from its captured facts through each revision to its final decision.
- The system prevents an agent from deciding an application they entered or submitted.
- No user can access another lender's data, including through exports, files, search, or logs.
- Reviewers can make and explain decisions without relying on information outside the application record.
- The principal journeys remain usable on a small screen and a slow or interrupted connection.
- D1 capacity, concurrent decision writes, long-term exports, and recovery are validated against the first year's forecast.
- A production backup can be restored and its audit history reconciled.

## Implementation baseline

The restrictive defaults in [PRODUCT_RULES.md](./PRODUCT_RULES.md) settle the initial customer fields, identity evidence, branch model, loan terms, decision authority, lifecycle, attachments, retention, and exports. Loosening a default requires an explicit product-rules revision. Its listed legal and regulatory questions remain production launch gates.

This charter governs scope and architecture. Changes to its mission, decision authority, audit guarantees, tenant isolation, or money-movement boundary require an explicit charter revision.
