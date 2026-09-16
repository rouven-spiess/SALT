# AWSASSET-7 — Protect the application's pages

**Status:** Ready for teammate deployment (local checks passed); real provider integration and AWS acceptance PENDING.

**Changed:** React protected demo uses backend identity/group results, signed-out gating and 401/403 handling. Local-only origin/port is configurable. AWS URLs, issuer, client, pool, scope and redirect settings come from public configuration. frontend/team-config.js and team-auth.js define the AWSASSET-6 integration seam; real login/logout/reset remains teammate-owned.

**Setup:** npm.cmd ci; npm.cmd run dev. For AWS use exact stack outputs in ignored .env.aws.local, connect the teammate provider/components, and run dev:aws/build. Team hosting needs HTTPS and SPA rewrites. See [frontend mapping](../deployment.md) and [AWSASSET-6 contract](../auth-contract.md).

**Acceptance:** Signed-out direct navigation, login, reload, callback errors, expiry, cross-tab logout and back navigation preserve page protection. Direct API calls still enforce permissions independently of UI. Verify again with the final team provider/router.

**Actual results (2026-09-13):** 34 local tests, live HTTP role/logout checks, and the React AWS-mode fixture build PASS. Browser checks PASS for all five groups, admin denial/allow, reload, logout, session loss, direct protected-page gating, and desktop/mobile layout. The compiled AWS-mode page has no fake role picker and refuses access through the placeholder. See [local verification](../local-verification.md). The production auth provider is a fail-closed placeholder; no real login/logout/reset or AWS protected-page verification is claimed.

**Dependencies:** AWSASSET-6 provider, components and session-change contract; AWSASSET-4/5/8 teammate deployment; team frontend hosting. [AWS verification](../aws-verification-checklist.md) PENDING.

**Commit key:** AWSASSET-7; AWSASSET-6 is a dependency. See Git history for commits; Jira has not been updated.

## SALT import verification — 2026-09-16

Imported for review on feature/import-asset-tracker while preserving SALT history and its project-plan README. Application setup is in ASSET_TRACKER.md. Re-ran the existing local suite (34/34 PASS) and the AWS-mode frontend fixture build (PASS), using the existing installed dependencies. Source implementation is unchanged. Ignore checks cover environment secrets, AWS credentials, dependencies, generated builds, local SAM folders, and browser artifacts. Pattern-based credential scanning found no matches in the candidate import. SAM and browser checks were not repeated; cloud deployment, real authentication, and AWS security acceptance remain pending.
