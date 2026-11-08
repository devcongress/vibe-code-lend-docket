# Domain modules

Each directory owns its business rules, API routes, payload schemas, and repository interfaces. Modules may depend on shared infrastructure but must not reach into another module's internals.

- `access`: trusted principals and authorisation.
- `lenders`: lenders and branches.
- `customers`: customer records and duplicate warnings.
- `products`: loan product configuration and term calculations.
- `applications`: drafts, submissions, and immutable revisions.
- `reviews`: review claims, returns, approvals, and rejections.
- `files`: private attachments and scan states.
- `audit`: append-only audit events and timelines.
