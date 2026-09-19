# Authentication foundation — implementation guide

SALT's current implementation establishes the frontend and backend access controls needed for the asset management workflow. It includes a React + Vite interface, a local authentication simulator, backend group permissions, and AWS SAM infrastructure definitions.

**Status:** Local implementation and Amplify Auth Hosted UI client are in place. Sandbox Cognito/API are deployed. Test users and cloud login evidence remain pending. Asset persistence and lifecycle features are planned in the [project roadmap](README.md#four-week-roadmap).

## Implementation scope

| Component | Implemented | Remaining work |
| --- | --- | --- |
| Frontend | Protected demo page, signed-out view, permission feedback, and handling for API denials | Integrate the Cognito provider and final team navigation |
| Authentication | Local sessions plus Amplify Auth Hosted UI against the existing Cognito pool | Provision test users and record Cognito login/logout/reset evidence |
| Authorization | Backend identity checks and permissions for five groups | Verify deployed API access and agree asset-level business permissions |
| Infrastructure | Cognito pool/client/groups, API Gateway authorizer, Lambda, and logs defined in SAM | Deploy to the approved account and verify the resources |

Implementation records are maintained in the [issue handoffs](docs/handoffs/README.md). The [authentication contract](docs/auth-contract.md) describes the proposed integration interface and decisions awaiting team agreement.

## Authentication and authorization design

**Authentication:** The planned AWS flow uses Cognito authorization code with PKCE (S256). AWSASSET-6 owns the provider implementation. The current provider is a placeholder that denies access; the frontend has no client secret or AWS access keys.

**Page protection:** React displays protected content only after the backend confirms the session and permissions. Frontend guards control the interface; API authorization independently protects backend operations.

**API authorization:** The SAM template configures API Gateway to validate Cognito access tokens and the required scope. Lambda checks the trusted authorizer context for issuer, app client, expiry, token type, scope, and group permissions. User-supplied roles do not grant access. This design depends on restricting direct Lambda invocation to trusted callers and still requires verification in AWS.

| Group | `GET /demo` | `GET /admin` |
| --- | --- | --- |
| Employee | Allowed | Denied |
| Technician | Allowed | Denied |
| Manager | Allowed | Denied |
| Administrator | Allowed | Allowed |
| Auditor | Allowed | Denied |

This provisional policy covers demo endpoints only. Recognized group permissions combine when a user has multiple groups; no recognized group means access is denied. Asset creation, editing, ownership, and deletion rules remain to be agreed. Cognito group membership does not grant AWS IAM permissions.

## Local development

The [README setup instructions](README.md#run-the-local-demo) cover installation, startup, and the permission walkthrough. Node.js 22.12 or later is required. Windows commands use `npm.cmd` to avoid PowerShell script execution restrictions.

The development-only adapter runs through Vite on localhost and stores simulated sessions in memory for 30 minutes. Restarting the server clears those sessions. The role picker allows any local user to select a group and is intended for example data.

SAM packages only `backend/`. The role picker and session adapter remain outside the Lambda package and are not loaded in AWS mode or production builds. The production build requires the configured public AWS endpoints.

## Code organization

| File | Responsibility |
| --- | --- |
| `frontend/main.jsx` | Sign-in view, protected page, and permission feedback |
| `frontend/auth.js` | Local session requests and calls to the authentication provider |
| `frontend/team-auth.js` | Amplify Auth provider: Hosted UI login, callback, access token, logout |
| `frontend/team-config.js` | Public authentication configuration |
| `backend/auth.mjs` | Identity validation and permissions that deny access unless explicitly allowed |
| `backend/handler.mjs` | Protected Lambda demo endpoints |
| `local/mock-auth.mjs` | Development-only simulated sessions |
| `template.yaml` | Authentication infrastructure, API, Lambda, and logging |
| `tests/auth.test.mjs` | Permission, identity-context, and local session tests |

## Verification progress

- **September 13, 2026:** 34 automated tests, HTTP role/logout checks, SAM lint/build, and the frontend fixture build passed. Browser checks covered all five groups, page protection, reload, logout, session loss, desktop/mobile layout, and the AWS provider placeholder.
- **September 16, 2026:** All 34 automated tests and the frontend fixture build passed again. These checks reused installed dependencies; a clean dependency installation was not tested. SAM and browser checks were not repeated.
- **Pending:** Real Cognito sign-in, deployed API Gateway token validation, and cloud security acceptance. Local sessions and synthetic claims do not verify these behaviors.

Reproduction commands, detailed results, and evidence limits are recorded in [local verification](docs/local-verification.md).

## Deployment and integration dependencies

Deployment is performed by the designated account owner or authorized team member in the approved AWS account. The template creates new resources; integration with existing resources requires a separate review. Account checks, permissions, parameters, and commands are documented in the [deployment guide](docs/deployment.md).

The next integration steps are to deploy the stack, connect the AWSASSET-6 provider, provision test users, and complete the [AWS verification checklist](docs/aws-verification-checklist.md). The proposed interface is defined in the [authentication contract](docs/auth-contract.md).

Environment files, AWS credentials, keys, generated output, and dependencies are excluded through `.gitignore`. Only the placeholder `.env.example` is tracked. All `VITE_` settings are public browser configuration and must not contain secrets.

Image uploads, Bedrock suggestions, and asset persistence are outside this authentication milestone. The [Bedrock proposal](docs/bedrock-plan.md) requires a separate team-agreed issue and explicit user review before saving AI suggestions. Face recognition is outside the proposed scope.
