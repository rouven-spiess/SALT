# SALT — Smart Asset Lifecycle Tracker

SALT is an asset management application under development. It is designed to help organizations register assets, track their condition and value, and plan maintenance and replacement.

SALT's planned workflow brings together asset records, secure image uploads, AI-assisted identification, depreciation calculations, and maintenance reminders. The current implementation provides the **authentication and authorization foundation** for that workflow.

> **Project status:** Local authentication demo and Cognito-protected asset APIs are in place. Sandbox stack `salt-auth-sandbox` has been updated with a DynamoDB Assets table. Week 2 photos/Bedrock and Week 3 maintenance workflows remain pending.

## Development progress

| Area | Current state |
| --- | --- |
| Frontend | React + Vite interface with local role picker, protected demo page, and asset list/create/detail views |
| Permissions | Backend checks for five user groups on demo endpoints and asset create/view/update |
| Authentication | Simulated local sessions; Amplify Auth Hosted UI against the existing Cognito pool |
| Infrastructure | AWS SAM template for Cognito, API Gateway, Lambda, DynamoDB Assets table, and CloudWatch logging |
| Verification | Automated local tests cover auth and the asset permission matrix; sandbox stack update is a separate step |
| Team handoff | Setup instructions, authentication contract, deployment guidance, AWS verification checklist, and [asset data model](docs/assets-data-model.md) |

The current milestone covers sign-in, group-based API access, DynamoDB asset records, and search/create/view. Image uploads and AI processing remain later milestones.

## Next milestones

1. Verify Cognito login and asset APIs against the sandbox stack with real test users.
2. Add private S3 photo storage and Bedrock identification (Week 2).
3. Extend depreciation/maintenance history, EventBridge, and SNS (Week 3).
4. Complete security testing and the approved-account presentation (Week 4).

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
5. Open **Assets**. Employee should see assigned records only; Auditor should see the full seeded list.
6. Sign in as Technician or Administrator to register an asset. Employee, Manager, and Auditor should not see the create form, and `POST /assets` still returns `403`.

The local role picker uses **simulated identities** and is intended for example data only. Anyone running the demo can select a role. It does not establish real user identity or verify deployed AWS security.

## Roles and access

Asset permissions are enforced in Lambda. Hiding a button is not authorization.

| Group | `GET /demo` | `GET /admin` | Create assets | Read assets | Update assets |
| --- | --- | --- | --- | --- | --- |
| Employee | Allowed | Denied | Denied | Assigned to the caller only | Problem report on assigned assets |
| Technician | Allowed | Denied | Allowed | All | Condition, status, maintenance dates |
| Manager | Allowed | Denied | Denied | Caller's department | Denied |
| Administrator | Allowed | Allowed | Allowed | All | All asset fields except identity claims |
| Auditor | Allowed | Denied | Denied | All | Denied |

Requests without a recognized group are denied. See [asset data model](docs/assets-data-model.md) for keys, GSIs, and field rules.

Frontend page guards control the interface. Backend checks enforce access to the API.

## Architecture

**Local development:** React runs through Vite with a development-only session adapter and the backend permission logic.

**AWS deployment design:** The React client signs users in through Cognito. API Gateway validates Cognito access tokens and the required API scope; Lambda checks the trusted identity context and group permissions, then reads and writes DynamoDB. CloudWatch stores Lambda logs.

```text
React frontend
    │
    ├── Sign-in through Amazon Cognito
    │
    └── API request with access token
            │
       API Gateway
       Cognito authorizer + required scope
            │
       AWS Lambda
       Identity and group permission checks
            │
       DynamoDB Assets table
```

These AWS resources are defined in [`template.yaml`](template.yaml). The sandbox stack `salt-auth-sandbox` is the current deployment target. The local mock adapter is excluded from the Lambda package and is not loaded in AWS mode.

## Repository layout

```text
SALT/
├── frontend/           React interface and authentication integration
├── backend/            Lambda handlers and permission checks
├── local/              Development-only mock sessions
├── public/             Static frontend assets
├── tests/              Authorization tests and local HTTP smoke checks
├── scripts/            Build verification and browser checks
├── docs/               Deployment, verification, data model, and team handoffs
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

**Latest recorded local check:** run `npm test` after changing auth or asset code. These checks do not confirm Cognito JWT signatures or API Gateway authorizer behavior. Use `npm run seed:sandbox` and `npm run verify:sandbox` only with the sandbox SSO profile, never with production credentials.

## AWS deployment and configuration

Deployment is a separate team step, performed in the **AWS account approved by the team and account owner**. Follow the [deployment guide](docs/deployment.md) for account verification, permissions, parameters, review of the proposed infrastructure changes, and deployment commands.

The template has no always-on servers. After a stack update it includes Cognito, API Gateway, Lambda, logs, and one on-demand DynamoDB table for asset metadata. Connecting existing team resources still requires a separately reviewed integration change.

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
| [Asset data model](docs/assets-data-model.md) | DynamoDB keys, GSIs, and group permission matrix |
