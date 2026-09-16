# AWSASSET-4 — Deploy the Cognito User Pool

**Status:** Ready for teammate deployment (local checks passed); teammate deployment and real AWS acceptance PENDING.

**Changed:** SAM defines a NEW retained Cognito pool, public app client, code flow, password/optional MFA settings, and hosted-login domain. Frontend origin, callback/logout paths and scope namespace are configurable; account/region/resource IDs are not embedded. Existing team resources are not imported or modified.

**Setup:** Follow [teammate deployment handoff](../deployment.md): agree new-resource ownership, explicit team profile/confirmed account/region, stack, private artifact bucket, execution role, origin/paths, stage, scope and unique domain prefix. Account verification precedes change-set creation/execution. No personal-account deployment is authorized.

**Acceptance:** Inspect the reviewed team-account change set; deploy successfully; verify pool/client/domain settings, outputs, no app-client secret, redirects and self-sign-up restriction. Pair with AWSASSET-6 for actual login.

**Actual results (2026-09-13):** SAM 1.166.2 lint and Node.js 22 build PASS. React compilation and 34 local tests PASS; these do not establish cloud deployment/security. No deployment, AWS pool inspection, or real user sign-in performed. See [local results](../local-verification.md).

**Dependencies:** Team account permissions and resource-ownership approval; domain/region/origin decisions; AWSASSET-6 flow/callback/MFA agreement. [Required permissions](../deployment-permissions.md) and [AWS checklist](../aws-verification-checklist.md) provided.

**Commit key:** AWSASSET-4. See Git history for commits; Jira has not been updated.

## SALT import verification — 2026-09-16

Imported for review on feature/import-asset-tracker while preserving SALT history and its project-plan README. Application setup is in ASSET_TRACKER.md. Re-ran the existing local suite (34/34 PASS) and the AWS-mode frontend fixture build (PASS), using the existing installed dependencies. Source implementation is unchanged. Ignore checks cover environment secrets, AWS credentials, dependencies, generated builds, local SAM folders, and browser artifacts. Pattern-based credential scanning found no matches in the candidate import. SAM and browser checks were not repeated; cloud deployment, real authentication, and AWS security acceptance remain pending.
