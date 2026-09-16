# AWSASSET-8 — Configure the API Gateway Cognito authorizer

**Status:** Local implementation and checks are complete for the current demo scope. Deployment, real authentication integration, and AWS acceptance remain pending.

**Implementation:** The new REST API has a default Cognito authorizer and deployment-selected RequiredScope on /demo and /admin; only CORS OPTIONS is unauthenticated. Lambda validates trusted authorizer claims plus configured issuer/client/scope, expiry, access-token type and group permissions. Names, stage, region-derived endpoints and frontend origin are portable. No existing team API is secured by deploying this separate stack.

**Setup:** Use [deployment guide](../deployment.md), [required permissions](../deployment-permissions.md), and the configured AWSASSET-6 access-token provider. Existing-API integration requires a separately reviewed change in the owning team template.

**Acceptance criteria:** Inspect method authorizer/scope bindings; reject missing, forged, expired, wrong-pool, wrong-client and ID tokens; reject missing scopes/no groups; enforce all role restrictions and correct CORS. Verify no untrusted direct Lambda invocation. See [AWS checklist](../aws-verification-checklist.md).

**Verification — September 13, 2026:** SAM lint/build PASS; package inspection excludes local mock code. 34 local tests PASS including configurable scope, missing-scope fail-closed behavior, spoofed roles and all group decisions. HTTP local checks PASS. Synthetic claims do not verify JWT signatures or deployed API Gateway. Cloud authorizer and token checks remain pending.

**Remaining dependencies:** Team account/permissions, AWSASSET-4/5 pool/groups/users, AWSASSET-6 provider, exact frontend origin, and new-vs-existing resource ownership decision.

**Commit key:** AWSASSET-8. Implementation history is recorded in Git. This document is not synchronized with Jira.

## Verification — September 16, 2026

The existing local suite passed 34/34 tests, and the AWS-mode frontend fixture build passed using installed dependencies. A clean dependency installation was not tested. Ignore-rule checks passed, and a pattern-based credential scan found no matches in the import candidate. SAM and browser checks were not repeated. AWS deployment and security verification remain pending. See [the verification record](../local-verification.md) for details.
