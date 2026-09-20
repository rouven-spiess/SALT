# SALT — Smart Asset Lifecycle Tracker

SALT is an asset management application under development. It is designed to help organizations register assets, track their condition and value, and plan maintenance and replacement.

This repository **builds on the SALT / asset-tracker starter from [mrleom](https://github.com/mrleom)** ([`mrleom/SALT`](https://github.com/mrleom/SALT)): React + Vite UI, local mock authentication, SAM Cognito/API/Lambda, and the five-group permission model. The work here adds Cognito Hosted UI, a CloudFront-hosted SPA, DynamoDB asset records, and a live sandbox deploy.

The planned product also includes private photos, Bedrock identification, depreciation, and maintenance reminders. Those are later weeks.

> **Project status:** Week 1 (sign-in, groups, DynamoDB assets) runs locally without AWS and can be deployed to **any AWS account** the operator controls. One current team demo lives in an **xlab sandbox**. Week 2 photos/Bedrock and Week 3 reminders are not built.

## Where it can run

| Environment | What it is | AWS required |
| --- | --- | --- |
| Local demo | Vite dev server, fake role picker, in-memory assets | No |
| Any AWS account | Same SAM template: Cognito, API Gateway, Lambda, DynamoDB, CloudFront + S3 | Yes — personal, free tier, xlab, or other team sandbox |
| xlab sandbox (current team demo) | Stack `salt-auth-sandbox` in `us-east-1` | The xlab SSO profile for that account |

The template does not bake in an account ID. Seed, verify, and publish scripts refuse to run unless you set `AWS_PROFILE`, `SALT_STACK`, and `SALT_ACCOUNT` for **your** target. They will not default to xlab.

A teammate on **AWS Free Tier** can deploy the same stack. Pick a **unique** Cognito domain prefix (global). Week 1 uses pay-as-you-go services that usually fit free-tier or low-cost student usage (Cognito, Lambda, API Gateway, on-demand DynamoDB, S3, CloudFront). Free tier is not a cost guarantee; watch the billing console.

## Development progress

| Area | Current state |
| --- | --- |
| Frontend | React UI: protected page, asset list/create/detail. Vite is the toolchain: **dev server** locally, **`vite build`** for CloudFront. Vite does not run in AWS. |
| Permissions | Lambda enforces five groups on demo and asset APIs |
| Authentication | Local: simulated sessions. AWS: Amplify Auth + Cognito Hosted UI (authorization code + PKCE) |
| Infrastructure | SAM: Cognito, API Gateway, Lambda, DynamoDB Assets table, private S3 + CloudFront SPA, logs |
| Verification | Local tests for auth and the asset matrix; cloud seed/verify/publish need an explicit account target |
| Team handoff | [Asset data model](docs/assets-data-model.md), [deployment guide](docs/deployment.md), [auth contract](docs/auth-contract.md) |

## Next milestones

1. Add private S3 photo storage and Bedrock identification (Week 2).
2. Extend depreciation/maintenance history, EventBridge, and SNS (Week 3).
3. Complete security testing and the presentation (Week 4).

## Run the local demo

No AWS account, credentials, Docker, or SAM is required.

- Git and access to this repository.
- Node.js **22.12 or later**, with npm.

```powershell
git clone https://github.com/mrleom/SALT.git
cd SALT
npm.cmd ci
npm.cmd run dev
```

On macOS or Linux, use `npm` instead of `npm.cmd`. Open **http://localhost:3000** (`DEV_PORT` can change the port).

### Local verification walkthrough

1. Open **Protected page** while signed out to see the sign-in prompt.
2. Enter the local demo as **Employee** and call the protected API.
3. Select **Test denied admin request** to confirm that the backend returns `403`.
4. Sign out and enter as **Administrator** to confirm that the admin request succeeds.
5. Open **Assets**. Employee should see assigned records only; Auditor should see the full seeded list.
6. Sign in as Technician or Administrator to register an asset. Employee, Manager, and Auditor should not see the create form, and `POST /assets` still returns `403`.

The local role picker uses **simulated identities**. Anyone can pick a role. It does not prove deployed AWS security.

## Deploy to an AWS account

Use an account you are allowed to deploy to (xlab sandbox, personal/free-tier, or another team account). Follow the [deployment guide](docs/deployment.md) for SAM parameters (region, stack name, unique Cognito domain prefix, artifact bucket, execution role).

Before seed, verify, or frontend publish, export the target (do not commit these values):

```bash
export AWS_PROFILE=your-cli-or-sso-profile
export AWS_REGION=us-east-1
export SALT_STACK=your-stack-name
export SALT_ACCOUNT=123456789012
```

`SALT_ACCOUNT` must match `aws sts get-caller-identity` for that profile. Then:

| Command | Purpose |
| --- | --- |
| `npm run seed:sandbox` | Write sample profiles and 10 assets into that stack’s table |
| `npm run verify:sandbox` | Invoke Lambda with authorizer-shaped events (no passwords) |
| `npm run publish:frontend` | `vite build --mode aws` and upload `dist/` to that stack’s CloudFront origin |

Copy stack outputs into ignored `.env.aws.local` from `.env.example` for `npm run dev:aws` or `npm run build`. Never put passwords, SSO tokens, or keys in Git.

On AWS there is **no role picker**. Sign in through Cognito Hosted UI. Employee cannot create assets; Technician and Administrator can.

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

## Architecture

**Local:** Vite serves React and a development-only session adapter; permission logic is the same backend module.

**AWS:** Vite produces static files. CloudFront + private S3 host the SPA. Cognito issues access tokens. API Gateway checks the token and `demo.read` scope. Lambda checks issuer, client, expiry, token type, scope, and groups, then reads DynamoDB.

```text
React SPA (Vite build → S3 + CloudFront)
    │
    ├── Cognito Hosted UI
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

Resources are defined in [`template.yaml`](template.yaml). The local mock is not packaged into Lambda.

## Repository layout

```text
SALT/
├── frontend/           React interface and authentication integration
├── backend/            Lambda handlers and permission checks
├── local/              Development-only mock sessions
├── public/             Static frontend assets
├── tests/              Authorization tests and local HTTP smoke checks
├── scripts/            Seed, verify, publish, and build checks
├── docs/               Deployment, verification, data model, and team handoffs
├── template.yaml       AWS SAM infrastructure definition
├── .env.example        Public configuration placeholders
├── package.json        Dependencies and commands
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
| `npm run dev` | Local demo with simulated authentication |
| `npm test` | Authorization and local session tests |
| `npm run check:build` | AWS-mode frontend compile with non-routable fixtures |
| `npm run test:local` | Role/logout checks against the running local server |
| `npm run dev:aws` | Frontend against configured public AWS endpoints |
| `npm run build` | Production frontend bundle (Vite); used by publish |

`npm test` does not confirm Cognito JWT signatures or API Gateway authorizer behavior. Use seed/verify/publish only with a profile you intend to change.

## AWS configuration notes

- Keep credentials in CLI/SSO profiles, outside this repository.
- Treat every `VITE_` variable as public browser configuration; never include secrets.
- Keep `.env` files, credentials, `node_modules`, `dist/`, and `.aws-sam/` out of Git. Only `.env.example` is tracked.
- After deploy, complete the [AWS verification checklist](docs/aws-verification-checklist.md) against **that** account.

## Four-week roadmap

| Week | Focus | Planned deliverables |
| --- | --- | --- |
| **1** | Authentication and core asset management | Shared repository, Cognito, protected API, DynamoDB assets, search/create/view, hosted SPA — **in progress / deployed per account** |
| **2** | Secure image upload and AI identification | Private S3 photos, Bedrock suggestions, accept/edit/reject |
| **3** | Depreciation and maintenance | Book value, history, EventBridge, SNS |
| **4** | Security, testing, and presentation | Least privilege, tests, documentation, demo |

Bedrock needs its own team-agreed issue. AI suggestions must be reviewed before they are saved. See the [Bedrock proposal](docs/bedrock-plan.md).

## Team workflow and documentation

Use feature branches and pull requests. Include issue keys in commit messages and update the matching handoff when implementation or verification changes.

Authentication foundation: **AWSASSET-4, AWSASSET-5, AWSASSET-7, AWSASSET-8**. Login lifecycle: **AWSASSET-6**.

| Document | Purpose |
| --- | --- |
| [Authentication starter](ASSET_TRACKER.md) | Detailed walkthrough of the current implementation |
| [Jira handoffs](docs/handoffs/README.md) | Per-issue scope, evidence, and remaining dependencies |
| [Authentication contract](docs/auth-contract.md) | Frontend/provider integration and team coordination |
| [Deployment guide](docs/deployment.md) | Account-agnostic SAM parameters and procedure |
| [Deployment permissions](docs/deployment-permissions.md) | Required access for the deployment owner |
| [Local verification](docs/local-verification.md) | Recorded results and their limits |
| [Asset data model](docs/assets-data-model.md) | DynamoDB keys, GSIs, and group permission matrix |
