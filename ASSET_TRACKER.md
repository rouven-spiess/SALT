# Asset Tracker — authentication starter

Your portion of the team project, beginning with React + Vite, Cognito infrastructure, and backend group permissions. AWS deployment is a separate step. No AWS resources have been deployed by this setup.

**Ready for teammate deployment** of the NEW infrastructure after passing local checks. Use [the teammate-only deployment handoff](docs/deployment.md); it documents account verification, permissions, inputs, commands, and outputs. It does not attach to existing team Cognito/API resources. Real login integration and AWS security acceptance remain pending.

Implementation is tracked in [the four Jira handoffs](docs/handoffs/README.md). Real login/logout/password reset belongs to **AWSASSET-6**; see [the proposed integration contract](docs/auth-contract.md).

## Run locally on Windows

Node.js 22.12+ is required. PowerShell on this machine blocks npm.ps1, so use npm.cmd.

```powershell
npm.cmd install
npm.cmd run dev
```

Open http://localhost:3000 (local default; change DEV_PORT if needed). No AWS account, keys, Docker, or SAM installation is needed for this demo.

1. Open **Protected page** while signed out. You should see a sign-in prompt.
2. Start the local demo as **Employee**. The protected API call succeeds.
3. Select **Test denied admin request**. The backend returns 403.
4. Sign out, then enter as **Administrator**. The admin call succeeds.
5. Try Technician, Manager, and Auditor. Each can read the demo but cannot call the admin endpoint.

The amber banner and role picker mean **simulated authentication**. Anyone using this local demo can select any group. Use example data only. The development adapter listens through Vite on localhost and keeps 30-minute sessions in memory. Restarting the server clears sessions.

## What you are learning

**Authentication** establishes who signed in. The planned AWS flow uses Cognito with authorization code + PKCE (S256), implemented by the AWSASSET-6 teammate. This starter supplies a placeholder provider interface, not the real login/logout/reset flow. The React app has no client secret and never receives AWS access keys.

**Page protection** controls what React renders. Opening /protected while signed out shows the sign-in view. Frontend code is public; a route guard is a user experience feature.

**API authorization** protects data and operations. In AWS, API Gateway validates the Cognito access token and required API scope. Lambda reads only the verified authorizer context, additionally checks issuer, app client, expiry, and token type, then enforces the group policy. It ignores user-supplied role headers and request bodies. Do not grant untrusted callers direct Lambda invocation rights: authorizer context is trusted only because API Gateway supplies it.

| Group | GET /demo | GET /admin |
| --- | --- | --- |
| Employee | Allow | Deny |
| Technician | Allow | Deny |
| Manager | Allow | Deny |
| Administrator | Allow | Allow |
| Auditor | Allow | Deny |

This is a provisional **demo** policy. It does not grant asset create/update/delete rights or decide the team's business rules. Multiple groups combine allowed permissions. No recognized group means deny. Cognito groups do not automatically confer AWS IAM permissions.

## Files to read in order

- `frontend/main.jsx`: React sign-in view and protected page.
- `frontend/auth.js`: local session calls and the AWSASSET-6 provider interface.
- `frontend/team-auth.js`: placeholder for the teammate-owned real authentication provider; team-config.js maps public configuration.
- `backend/auth.mjs`: identity checks and default-deny action permissions.
- `backend/handler.mjs`: protected Lambda endpoints.
- `local/mock-auth.mjs`: development-only fake identity adapter.
- `template.yaml`: SAM infrastructure, five Cognito groups, public app client, API authorizer, Lambda, and logs.
- `tests/auth.test.mjs`: allow/deny, spoofing, token claim, and local session tests.

SAM packages only `backend/`; the role picker server is outside that directory. AWS mode and production builds do not load the local adapter. `npm.cmd run build` requires AWS configuration and produces an AWS-mode frontend.

## Checks

```powershell
npm.cmd test
npm.cmd run check:build
```

For HTTP smoke checks against a running local dev server, use `npm.cmd run test:local`.

Actual results (2026-09-13): 34/34 automated tests, live HTTP role/logout checks, SAM lint/build, and the React fixture build passed. Isolated Edge browser checks passed for all five groups, protected pages, admin restrictions, reload, logout, session loss, mobile layout, and the AWS provider placeholder. See [local evidence and limits](docs/local-verification.md).

These are automated local tests; they do not verify Cognito signatures or exercise a deployed API Gateway. See [AWS deployment and verification](docs/deployment.md) for the separate cloud step.

Initial machine inspection: Git 2.50.1, Node 22.17.1, npm 10.9.2, Python 3.11.2, and AWS CLI 2.27.33 are present. SAM and Docker were not on PATH. SAM CLI 1.166.2 is now installed in the project-local .venv and lint/build passed. The earlier declined installation is resolved. Docker is only needed if you later use SAM's container-based local invocation; the React demo uses neither Docker nor SAM local.

## Credential handling

`.gitignore` excludes .env files (except the placeholder example), local AWS config, keys, credential files, SAM output, and virtual environments. Use AWS profiles/SSO outside the repository. Every VITE_ variable is public browser configuration; never put a password, client secret, or AWS secret there. Gitignore does not detect all secrets or remove already committed secrets. Review files before committing.

## Five-day plan

| Day | Deliverable | Evidence |
| --- | --- | --- |
| 1 | This authentication starter; agree team API contract and group policy | Local tests and protected-page demo |
| 2 | Deploy a development stack separately; connect React to Cognito; provision test users | Real sign-in, 401/403 checks, all five groups |
| 3 | Integrate team asset endpoints; enforce actions and ownership in the backend | Permission matrix tests on each operation |
| 4 | If a separate Bedrock issue is agreed: implement reviewed photo suggestions; otherwise finish auth integration | Agreed issue and validation tests, or completed auth integration checks |
| 5 | End-to-end integration, security regression checks, and team handoff | Test report, setup instructions, recorded demo |

Bedrock is additional proposed scope requiring its own team-agreed Jira issue before implementation. Its proposal is in [Bedrock implementation plan](docs/bedrock-plan.md). It is not implemented in this authentication milestone. No photo upload, Bedrock invocation, asset persistence, or face recognition is included.

## References

- [React's guide to starting with a build tool](https://react.dev/learn/build-a-react-app-from-scratch)
- [SAM Cognito authorizer](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-property-api-cognitoauthorizer.html)
- [API Gateway and Cognito access tokens](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html)
- [Cognito authorization endpoint and PKCE](https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html)
