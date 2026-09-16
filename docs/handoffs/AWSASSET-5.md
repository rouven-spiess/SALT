# AWSASSET-5 — Create Cognito groups and test users

**Status:** Ready for teammate deployment (local checks passed); deployed groups/test users and AWS acceptance PENDING.

**Changed:** NEW-pool template defines Employee, Technician, Manager, Administrator and Auditor. All may read /demo; only Administrator may read /admin. This is a provisional demo policy. Real users are intentionally not embedded in infrastructure or local handoffs.

**Setup:** Deploy in the confirmed teammate account per [deployment handoff](../deployment.md). An authorized administrator provisions agreed test users and memberships through Cognito, coordinating invite/password/reset handling with AWSASSET-6. Never copy passwords or tokens into Jira/files.

**Acceptance:** Inspect all five deployed groups; provision one test user per group plus a no-group case; verify fresh-token memberships and role restrictions against the real API. Agree business permissions before adding asset operations.

**Actual results (2026-09-13):** SAM lint/build PASS. 34/34 local tests PASS; live local HTTP checks PASS for anonymous 401, all five groups' demo/admin restrictions, and logout. Browser checks PASS for all five groups, admin denial/allow, reload, logout, and session-loss gating; see [local results](../local-verification.md). These use fake identities. No actual groups/users deployed or real token claims verified.

**Dependencies:** AWSASSET-4 deployment, approved test users and admin permissions, AWSASSET-6 login/reset flow, team permission matrix. Real checks remain in [AWS checklist](../aws-verification-checklist.md).

**Commit key:** AWSASSET-5. See Git history for commits; Jira has not been updated.

## SALT import verification — 2026-09-16

Imported for review on feature/import-asset-tracker while preserving SALT history and its project-plan README. Application setup is in ASSET_TRACKER.md. Re-ran the existing local suite (34/34 PASS) and the AWS-mode frontend fixture build (PASS), using the existing installed dependencies. Source implementation is unchanged. Ignore checks cover environment secrets, AWS credentials, dependencies, generated builds, local SAM folders, and browser artifacts. Pattern-based credential scanning found no matches in the candidate import. SAM and browser checks were not repeated; cloud deployment, real authentication, and AWS security acceptance remain pending.
