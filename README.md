# SALT — Smart Asset Lifecycle Tracker

SALT is an asset management application under development. It is designed to help organizations register assets, track their condition and value, and plan maintenance and replacement.

SALT's planned workflow brings together asset records, secure image uploads, AI-assisted identification, depreciation calculations, and maintenance reminders. The current implementation provides the **authentication and authorization foundation** for that workflow.

> **Project status:** Local authentication demo available; AWS infrastructure defined but not deployed. Real Cognito sign-in, asset storage, image processing, and lifecycle features remain pending.

## Development progress

| Area | Current state |
| --- | --- |
| Frontend | React + Vite interface with a local role picker and protected demo page |
| Permissions | Backend checks for five user groups; administrator-only demo endpoint |
| Authentication | Simulated local sessions; integration interface for the team's real authentication provider |
| Infrastructure | AWS SAM template for Cognito, API Gateway, Lambda, and CloudWatch logging |
| Verification | 34 automated local tests and an AWS-mode frontend fixture build passed on September 16, 2026 |
| Team handoff | Setup instructions, authentication contract, deployment guidance, and AWS verification checklist |

The current milestone establishes protected pages, role-based API access, and the infrastructure needed for authentication. DynamoDB asset storage, image uploads, and AI processing are planned milestones; their resources are not yet included in the SAM template.

## Next milestones

1. Confirm the deployment account, resource ownership, frontend URLs, and required permissions.
2. Deploy the authentication infrastructure and provision test users in all five groups.
3. Integrate Cognito login, logout, password reset, and session handling through AWSASSET-6.
4. Verify protected pages and API access against the deployed environment.
5. Implement the DynamoDB asset model, asset creation, and viewing/search workflow.

## Run the local demo

### Prerequisites

- Git and access to this private repository.
- Node.js **22.12 or later**, with npm.

No AWS account, credentials, Docker, or SAM installation is required for the local demo.

Clone the repository and install the dependencies:

```powershell
git clone https://github.com/mrleom/SALT.git
cd SALT
npm.cmd ci
npm.cmd run dev
```

Open **http://localhost:3000**. The port can be changed through `DEV_PORT`.

The commands use `npm.cmd` for Windows PowerShell. On macOS or Linux, use `npm` instead.

### Local verification walkthrough

1. Open **Protected page** while signed out to see the sign-in prompt.
2. Enter the local demo as **Employee** and call the protected API.
3. Select **Test denied admin request** to confirm that the backend returns `403`.
4. Sign out and enter as **Administrator** to confirm that the admin request succeeds.
5. Repeat with the other roles, then sign out and revisit the protected page.

The local role picker uses **simulated identities** and is intended for example data only. Anyone running the demo can select a role. It does not establish real user identity or verify deployed AWS security.

## Roles and access

The current policy applies only to the two demo endpoints:

| Group | `GET /demo` | `GET /admin` |
| --- | --- | --- |
| Employee | Allowed | Denied |
| Technician | Allowed | Denied |
| Manager | Allowed | Denied |
| Administrator | Allowed | Allowed |
| Auditor | Allowed | Denied |

Requests without a recognized group are denied. Asset creation, editing, ownership, and deletion permissions still need an agreed team policy.

Frontend page guards control the interface. Backend checks enforce access to the API.

## Architecture

**Local development:** React runs through Vite with a development-only session adapter and the backend permission logic.

**AWS deployment design:** The React client will sign users in through Cognito. API Gateway is configured to validate Cognito access tokens and the required API scope; Lambda then checks the trusted identity context and group permissions. CloudWatch stores Lambda logs.

```text
React frontend
    │
    ├── Sign-in through Amazon Cognito
    │   Real frontend authentication integration is pending
    │
    └── API request with access token
            │
       API Gateway
       Cognito authorizer + required scope
            │
       AWS Lambda
       Identity and group permission checks
            │
       CloudWatch Logs
```

These AWS resources are defined in [`template.yaml`](template.yaml); they have not been deployed or verified in AWS. The local mock adapter is excluded from the Lambda package and is not loaded in AWS mode.

## Repository layout

```text
SALT/
├── frontend/           React interface and authentication integration
├── backend/            Lambda handlers and permission checks
├── local/              Development-only mock sessions
├── public/             Static frontend assets
├── tests/              Authorization tests and local HTTP smoke checks
├── scripts/            Build verification and browser checks
├── docs/               Deployment, verification, and team handoffs
├── template.yaml       AWS SAM infrastructure definition
├── .env.example        Public configuration placeholders
├── package.json        Dependencies and local commands
└── ASSET_TRACKER.md     Detailed authentication starter guide
```

## Tests and build checks

```powershell
npm.cmd test
npm.cmd run check:build
```

For HTTP smoke checks, keep the local development server running and use a second terminal:

```powershell
npm.cmd run test:local
```

| Command | Purpose |
| --- | --- |
| `npm.cmd run dev` | Start the local demo with simulated authentication |
| `npm.cmd test` | Run automated authorization and local session tests |
| `npm.cmd run check:build` | Compile an AWS-mode frontend using non-routable test configuration |
| `npm.cmd run test:local` | Check the running local server's role and logout behavior |
| `npm.cmd run dev:aws` | Run the frontend in AWS mode with configured public endpoints |
| `npm.cmd run build` | Build the AWS-mode frontend with required AWS configuration |

**Latest recorded check — September 16, 2026:** 34/34 tests passed and the frontend fixture build passed. These checks reused existing installed dependencies; a clean dependency installation was not tested during the import. SAM and browser results are recorded separately in the [verification notes](docs/local-verification.md).

Local test results do not confirm real Cognito sign-in, token signature validation, or deployed API Gateway behavior. The Cognito authentication provider is pending implementation; its current placeholder denies access.

## AWS deployment and configuration

Deployment is a separate team step, performed in the **AWS account approved by the team and account owner**. Follow the [deployment guide](docs/deployment.md) for account verification, permissions, parameters, review of the proposed infrastructure changes, and deployment commands.

The current template creates new infrastructure. Connecting existing team resources requires a separately reviewed integration change.

After deployment, use `.env.example` to prepare the ignored `.env.aws.local` file with the approved stack outputs. Coordinate real login, logout, password reset, and callback handling through the [authentication contract](docs/auth-contract.md).

- Keep AWS credentials in external profiles or SSO, outside this repository.
- Treat every `VITE_` variable as public browser configuration; never include secrets.
- Keep `.env` files, credential files, dependencies, generated builds, and local SAM folders out of Git. Only the placeholder `.env.example` is included.
- Complete the [AWS verification checklist](docs/aws-verification-checklist.md) to confirm cloud authentication and security acceptance.

## Four-week roadmap

The roadmap defines the intended project scope. Completed local work and pending integrations are recorded in the development progress table and issue handoffs.

| Week | Focus | Planned deliverables |
| --- | --- | --- |
| **1** | Authentication and core asset management | Shared repository, team responsibilities, architecture diagram, DynamoDB data model and table, Cognito pool/groups/test users, login/logout/password reset, protected pages and API, manual asset creation, viewing/search, and at least 10 test assets |
| **2** | Secure image upload and AI identification | Private S3 storage, secure uploads and blocked public access, image-triggered Lambda processing, Bedrock integration and structured suggestions, user accept/edit/reject controls, manual fallback, and saving approved asset data to DynamoDB |
| **3** | Depreciation and maintenance | Purchase/salvage/useful-life fields, straight-line depreciation and current book value, maintenance history and AI recommendations, maintenance/replacement dates, EventBridge checks, SNS notifications, and tests across asset conditions |
| **4** | Security, testing, and presentation | Final group authorization and backend permissions, least-privilege IAM, secure S3 access, CloudWatch logs/alarms, unauthorized-request and error tests, infrastructure deployment, credential review, documentation, and final demo |

Bedrock work is proposed future scope and needs its own team-agreed issue. AI suggestions must be validated and reviewed by a user before being saved. See the [Bedrock proposal](docs/bedrock-plan.md).

## Team workflow and documentation

Use feature branches and pull requests to review changes before merging into `main`. Include the applicable issue keys in commit messages and update the relevant handoff when implementation or verification changes.

The authentication foundation is tracked under **AWSASSET-4, AWSASSET-5, AWSASSET-7, and AWSASSET-8**. Login, logout, password reset, and session integration are assigned to **AWSASSET-6**. The handoffs retain these issue references; mapping them to the revised roadmap remains a project coordination task.

| Document | Purpose |
| --- | --- |
| [Authentication starter](ASSET_TRACKER.md) | Detailed walkthrough of the current implementation |
| [Jira handoffs](docs/handoffs/README.md) | Per-issue scope, evidence, and remaining dependencies |
| [Authentication contract](docs/auth-contract.md) | Frontend/provider integration and team coordination |
| [Deployment guide](docs/deployment.md) | Approved account setup and deployment procedure |
| [Deployment permissions](docs/deployment-permissions.md) | Required access for the deployment owner |
| [Local verification](docs/local-verification.md) | Recorded results and their limits |
| [AWS verification checklist](docs/aws-verification-checklist.md) | Checks to perform against the deployed system |
