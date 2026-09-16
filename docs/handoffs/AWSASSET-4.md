# AWSASSET-4 — Deploy the Cognito User Pool

**Status:** Local implementation and checks are complete for the current demo scope. Deployment, real authentication integration, and AWS acceptance remain pending.

**Implementation:** SAM defines a new retained Cognito pool, public app client, code flow, password/optional MFA settings, and hosted-login domain. Frontend origin, callback/logout paths and scope namespace are configurable; account/region/resource IDs are not embedded. Existing team resources are not imported or modified.

**Setup:** Follow the [deployment guide](../deployment.md): agree new-resource ownership, explicit team profile/confirmed account/region, stack, private artifact bucket, execution role, origin/paths, stage, scope and unique domain prefix. Account verification precedes change-set creation/execution. No personal-account deployment is authorized.

**Acceptance criteria:** Inspect the reviewed team-account change set; deploy successfully; verify pool/client/domain settings, outputs, no app-client secret, redirects and self-sign-up restriction. Pair with AWSASSET-6 for actual login.

**Verification — September 13, 2026:** SAM 1.166.2 lint and Node.js 22 build PASS. React compilation and 34 local tests PASS; these do not establish cloud deployment/security. Deployment, AWS pool inspection, and real user sign-in remain pending. See [local results](../local-verification.md).

**Remaining dependencies:** Team account permissions and resource-ownership approval; domain/region/origin decisions; AWSASSET-6 flow/callback/MFA agreement. [Required permissions](../deployment-permissions.md) and [AWS checklist](../aws-verification-checklist.md) provided.

**Commit key:** AWSASSET-4. Implementation history is recorded in Git. This document is not synchronized with Jira.

## Verification — September 16, 2026

The existing local suite passed 34/34 tests, and the AWS-mode frontend fixture build passed using installed dependencies. A clean dependency installation was not tested. Ignore-rule checks passed, and a pattern-based credential scan found no matches in the import candidate. SAM and browser checks were not repeated. AWS deployment and security verification remain pending. See [the verification record](../local-verification.md) for details.
