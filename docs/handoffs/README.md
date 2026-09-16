# Authentication milestone — issue progress

The authentication foundation has passed local tests, browser checks, SAM lint/build, and frontend compilation. Deployment, real authentication integration, and AWS security acceptance remain pending. The records below describe implementation progress and evidence for each issue; they are not synchronized with Jira.

| Issue | Implemented locally | Remaining work |
| --- | --- | --- |
| [AWSASSET-4](AWSASSET-4.md) — Cognito pool | SAM pool, client, and domain definitions; lint/build passed | Deploy and verify the pool and client in the approved account |
| [AWSASSET-5](AWSASSET-5.md) — Groups and test users | Five group definitions and passing local permission tests | Deploy groups, provision test users, and verify token memberships |
| [AWSASSET-7](AWSASSET-7.md) — Protected pages | React page guard and provider interface; local browser checks passed | Integrate AWSASSET-6 and verify the full session lifecycle |
| [AWSASSET-8](AWSASSET-8.md) — API authorizer | SAM authorizer and Lambda permission checks | Verify real token rejection and role restrictions through API Gateway |

## Verification record

- **September 13, 2026:** Automated tests, HTTP and browser checks, SAM lint/build, and frontend compilation passed.
- **September 16, 2026:** All 34 automated tests and the frontend fixture build passed again using existing installed dependencies. A clean dependency installation was not tested. SAM and browser checks were not repeated.
- **AWS checks:** Pending deployment and integration. Local results do not establish cloud security acceptance.

Detailed evidence is recorded in [local verification](../local-verification.md). Deployment dependencies and acceptance steps are described in the [deployment guide](../deployment.md), [AWS checklist](../aws-verification-checklist.md), and proposed [AWSASSET-6 authentication contract](../auth-contract.md).

## Scope and coordination

AWSASSET-6 owns real login, logout, password reset, and session handling. The provider contract still requires team agreement. Bedrock suggestions are [proposed future work](../bedrock-plan.md) and require a separate issue; they are outside the acceptance criteria of this milestone.

Implementation changes should include the relevant issue keys in commit messages and update the corresponding handoff with scope, setup, verification results, and outstanding dependencies. The [project README](../../README.md) contains the roadmap, and the [implementation guide](../../ASSET_TRACKER.md) describes the authentication foundation.
