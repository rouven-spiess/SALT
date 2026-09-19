# AWSASSET-7 — Protect the application's pages

**Status:** Local implementation and checks are complete for the current demo scope. Deployment, real authentication integration, and AWS acceptance remain pending.

**Implementation:** The React protected demo uses backend identity/group results, signed-out gating and 401/403 handling. Local-only origin/port is configurable. AWS URLs, issuer, client, pool, scope and redirect settings come from public configuration. `frontend/team-auth.js` uses Amplify Auth (`signInWithRedirect` / `fetchAuthSession` / `signOut`) against the existing Cognito pool. Password reset remains on Cognito Hosted UI.

**Setup:** npm.cmd ci; npm.cmd run dev. For AWS use exact stack outputs in ignored .env.aws.local, connect the authentication provider and components, and run dev:aws/build. Frontend hosting requires HTTPS and single-page application (SPA) rewrites. See [frontend mapping](../deployment.md) and [AWSASSET-6 contract](../auth-contract.md).

**Acceptance criteria:** Signed-out direct navigation, login, reload, callback errors, expiry, cross-tab logout and back navigation preserve page protection. Direct API calls still enforce permissions independently of UI. Verify again with the final team provider/router.

**Verification — September 13, 2026:** 34 local tests, live HTTP role/logout checks, and the React AWS-mode fixture build PASS. Browser checks PASS for all five groups, admin denial/allow, reload, logout, session loss, direct protected-page gating, and desktop/mobile layout. The compiled AWS-mode page has no simulated role picker and refuses access through the placeholder. See [local verification](../local-verification.md). The production authentication provider is Amplify Auth Hosted UI. Real login still needs Cognito test users and recorded AWS page-protection verification.

**Remaining dependencies:** AWSASSET-6 provider, components and session-change contract; AWSASSET-4/5/8 deployment; team frontend hosting. [AWS verification](../aws-verification-checklist.md) remains pending.

**Commit key:** AWSASSET-7; AWSASSET-6 is a dependency. Implementation history is recorded in Git. This document is not synchronized with Jira.

## Verification — September 16, 2026

The existing local suite passed 34/34 tests, and the AWS-mode frontend fixture build passed using installed dependencies. A clean dependency installation was not tested. Ignore-rule checks passed, and a pattern-based credential scan found no matches in the import candidate. SAM and browser checks were not repeated. AWS deployment and security verification remain pending. See [the verification record](../local-verification.md) for details.
