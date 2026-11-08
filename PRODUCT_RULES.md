# Product Rules

**Status:** Restrictive v1 baseline
**Date:** 8 November 2026
**Change policy:** Deny by default. Loosen a rule only through an explicit revision to this file.

These rules unblock implementation. They are product decisions, not legal advice. Items under **Launch gates** require qualified Ghanaian review before production use, but do not block local development.

## 1. Lenders, branches, and staff principals

- The architecture is multi-lender; the first rollout onboards one lender.
- An externally authenticated principal belongs to exactly one lender and holds exactly one application role.
- Agents and reviewers belong to exactly one branch. Administrators and auditors are lender-wide.
- A reviewer may review only applications from their branch.
- An administrator configures branches and products but cannot view customer or application content unless assigned a different role externally.
- The service does not create, invite, authenticate, deactivate, or manage staff identities.

## 2. Customer record

The following fields are mandatory:

- Full legal name.
- Date of birth.
- Mobile telephone number.
- Ghana Card personal identification number (PIN).
- Successful external biometric-verification reference and timestamp.
- Residential community, district, region, and GhanaPost GPS/digital address.
- Occupation, primary income source, and declared monthly net income in GHS.
- Preferred spoken language.
- Agent attestation that the information and proposed loan terms were read back or explained in that language and verbally acknowledged by the customer.

Rules:

- Ghana Card is the only accepted identity document for v1.
- This service records the result/reference of biometric verification performed through the lender's approved process; it does not perform identity verification.
- Do not request, upload, scan, photograph, or retain a Ghana Card image.
- The Ghana Card PIN is normalised and encrypted; duplicate matching uses a keyed hash. Interfaces and exports show only the last four characters unless an authorised record view strictly requires more.
- Email, sex, marital status, next of kin, and biometrics are not collected in v1.
- Possible duplicates are warnings within the same lender. They never merge automatically and never reveal another lender's records.

## 3. Loan product and terms

- Each lender has one active loan product in v1.
- Currency is always GHS. Monetary values are stored as integer pesewas.
- The product defines minimum and maximum principal; applications outside that range cannot be submitted.
- Only fixed, flat interest for the full loan term is supported.
- Repayments are equal and either weekly or monthly, as configured on the product. The final instalment absorbs any rounding difference.
- Product configuration supplies the flat rate, lender-approved APR, repayment count, and itemised fixed fees.
- Total repayment is principal plus total interest plus disclosed fees.
- Variable rates, compounding, balloon payments, grace periods, insurance, late penalties, and prepayment fees are not supported in v1.
- No ad hoc fee may be added to an individual application.
- A reviewer may approve only the submitted terms. Any requested change requires return, revision, and resubmission.
- Approval records a decision only. It does not create a credit agreement or prove disbursement.

## 4. Application workflow

- Only the creating agent may edit or discard a draft.
- Submission requires every mandatory field, a successful external identity-verification reference, customer acknowledgement, clean required attachments, and an idempotency key.
- Submission creates an immutable snapshot.
- One reviewer makes the decision. There are no amount thresholds or secondary approvals in v1.
- The creator or submitter can never review or decide that application, regardless of later role changes.
- A reviewer claims an application before review. Claims expire after 30 minutes of inactivity or may be released by that reviewer.
- A reviewer may approve as submitted, reject with a mandatory reason, or return for correction with a mandatory explanation.
- A returned application goes only to its original agent. Resubmission creates a new immutable revision.
- Drafts may be cancelled. Submitted applications cannot be cancelled or deleted.
- Approval and rejection are final and cannot be reversed. A correction after a final decision requires a new application linked to the original.

## 5. Attachments

- Allowed types: PDF, JPEG, and PNG only.
- Maximum: five files per application and 5 MiB per file.
- Ghana Card images and biometric files are prohibited.
- Files remain unavailable until malware scanning reports them clean. A failed or rejected scan blocks submission.
- Submitted attachments are immutable.
- The creating agent, an eligible branch reviewer, and a lender auditor may view attachments. Administrators may not view them by virtue of that role.
- Files have no public URL and are served only through an authorised Worker request.
- Abandoned draft files expire after 30 days of inactivity.
- Submitted files and records are provisionally retained for seven years after the final decision. Automated final deletion remains disabled until the retention period is legally confirmed; legal holds override deletion.

## 6. Search, audit, and exports

- Agents see only customers and applications they created.
- Reviewers see submitted applications and their related customer records within their branch.
- Auditors have read-only lender-wide access. Administrators do not receive customer-record access through the administrator role.
- Every sensitive read, export, attachment access, material change, submission, claim, return, and decision is audited.
- Audit events are append-only and include lender, actor, action, record, timestamp, and request correlation ID.
- Only auditors may create exports.
- CSV export contains an application index and decisions; it excludes attachments and masks Ghana Card PINs.
- PDF export contains one application, its revisions, final decision, and audit summary; it excludes attachments and masks the Ghana Card PIN.
- Exports are generated asynchronously, downloaded through an authorised Worker request, expire after 15 minutes, and are audited.

## 7. Launch gates

Obtain and record qualified answers to these questions before production:

1. Is each lender properly authorised, and which Bank of Ghana or other lending rules apply to it?
2. Does the lender's external biometric process and stored verification reference satisfy current NIA and Bank of Ghana requirements?
3. What customer notice, lawful basis, assisted acknowledgement, and language or witness evidence are required?
4. Which entity is controller or processor, which registrations are required, and what contract must exist between the service and each lender?
5. May Cloudflare process or store this data outside Ghana, and what safeguards and disclosures are required?
6. Are the provisional seven-year retention period and deletion rules correct for applications, decisions, attachments, audit events, and exports?
7. Which pre-agreement disclosure, APR calculation, fee disclosure, repayment schedule, and borrower-statement duties apply even though the service does not disburse funds?
8. What data-subject access, correction, objection, deletion, breach-notification, complaint, and regulator-export procedures are required?

## 8. Regulatory basis consulted

- [Bank of Ghana revised Ghana Card notice](https://www.bog.gov.gh/notice/revised-ghana-card-notice-for-financial-transactions/)
- [NIA mandatory biometric-verification notice](https://nia.gov.gh/government-makes-biometric-verification-mandatory-for-ghana-card-verification-under-new-l-i-2523/)
- [Borrowers and Lenders Act, 2020 (Act 1052)](https://www.bog.gov.gh/wp-content/uploads/2021/04/Gazette-Copy_Borrowers-and-Lenders-ACT-2020-ACT-1052_HQ.pdf)
- [Data Protection Act, 2012 (Act 843)](https://dataprotection.org.gh/wp-content/uploads/2025/05/Data-Protection-Act-2012-Act-843.pdf)

If a rule in this document conflicts with binding law or regulator guidance, the binding requirement wins and this document must be revised.
