# AWSASSET-8 — Configure the API Gateway Cognito authorizer

**Status:** Ready for teammate deployment (local checks passed); deployed authorizer and real AWS security acceptance PENDING.

**Changed:** NEW REST API has a default Cognito authorizer and deployment-selected RequiredScope on /demo and /admin; only CORS OPTIONS is unauthenticated. Lambda validates trusted authorizer claims plus configured issuer/client/scope, expiry, access-token type and group permissions. Names, stage, region-derived endpoints and frontend origin are portable. No existing team API is secured by deploying this separate stack.

**Setup:** Use [teammate deployment handoff](../deployment.md), [required permissions](../deployment-permissions.md), and the configured AWSASSET-6 access-token provider. Existing-API integration requires a separately reviewed change in the owning team template.

**Acceptance:** Inspect method authorizer/scope bindings; reject missing, forged, expired, wrong-pool, wrong-client and ID tokens; reject missing scopes/no groups; enforce all role restrictions and correct CORS. Verify no untrusted direct Lambda invocation. See [AWS checklist](../aws-verification-checklist.md).

**Actual results (2026-09-13):** SAM lint/build PASS; package inspection excludes local mock code. 34 local tests PASS including configurable scope, missing-scope fail-closed behavior, spoofed roles and all group decisions. HTTP local checks PASS. Synthetic claims do not verify JWT signatures or deployed API Gateway. No cloud authorizer/token checks run.

**Dependencies:** Team account/permissions, AWSASSET-4/5 pool/groups/users, AWSASSET-6 provider, exact frontend origin, and new-vs-existing resource ownership decision.

**Commit key:** AWSASSET-8. See Git history for commits; Jira has not been updated.

## SALT import verification — 2026-09-16

Imported for review on feature/import-asset-tracker while preserving SALT history and its project-plan README. Application setup is in ASSET_TRACKER.md. Re-ran the existing local suite (34/34 PASS) and the AWS-mode frontend fixture build (PASS), using the existing installed dependencies. Source implementation is unchanged. Ignore checks cover environment secrets, AWS credentials, dependencies, generated builds, local SAM folders, and browser artifacts. Pattern-based credential scanning found no matches in the candidate import. SAM and browser checks were not repeated; cloud deployment, real authentication, and AWS security acceptance remain pending.
