# AWSASSET-5 — Create Cognito groups and test users

**Status:** Local implementation and checks are complete for the current demo scope. Deployment, real authentication integration, and AWS acceptance remain pending.

**Implementation:** The template for the new pool defines Employee, Technician, Manager, Administrator and Auditor. All may read /demo; only Administrator may read /admin. This is a provisional demo policy. Real users are intentionally not embedded in infrastructure or local handoffs.

**Setup:** Deploy in the confirmed teammate account per [deployment handoff](../deployment.md). An authorized administrator provisions agreed test users and memberships through Cognito, coordinating invite/password/reset handling with AWSASSET-6. Never copy passwords or tokens into Jira/files.

**Acceptance criteria:** Inspect all five deployed groups; provision one test user per group plus a no-group case; verify fresh-token memberships and role restrictions against the real API. Agree business permissions before adding asset operations.

**Verification — September 13, 2026:** SAM lint/build PASS. 34/34 local tests PASS; live local HTTP checks PASS for anonymous 401, all five groups' demo/admin restrictions, and logout. Browser checks PASS for all five groups, admin denial/allow, reload, logout, and session-loss gating; see [local results](../local-verification.md). These use simulated identities. Groups and test users have not been deployed, and real token claims have not been verified.

**Remaining dependencies:** AWSASSET-4 deployment, approved test users and admin permissions, AWSASSET-6 login/reset flow, team permission matrix. Real checks remain in [AWS checklist](../aws-verification-checklist.md).

**Commit key:** AWSASSET-5. Implementation history is recorded in Git. This document is not synchronized with Jira.

## Verification — September 16, 2026

The existing local suite passed 34/34 tests, and the AWS-mode frontend fixture build passed using installed dependencies. A clean dependency installation was not tested. Ignore-rule checks passed, and a pattern-based credential scan found no matches in the import candidate. SAM and browser checks were not repeated. AWS deployment and security verification remain pending. See [the verification record](../local-verification.md) for details.
