# Local verification record

**Status:** Local validation has passed for the current authentication demo and infrastructure definitions. Application integration, deployment, and real AWS security acceptance remain pending. Test dates and scope are recorded below; no AWS resources or real test users were provisioned during these checks.

## Results — September 13, 2026

| Check | Actual result |
| --- | --- |
| npm.cmd test | PASS: 34/34; group permissions, invalid/missing claims, spoofing, configurable scope, and local origin checks |
| npm.cmd run test:local | PASS: /protected entry, anonymous 401, all five groups' API/admin decisions, and logout |
| npm.cmd run check:build | PASS: React/Vite AWS-mode build using example.invalid fixture endpoints and configurable callback paths |
| SAM CLI 1.166.2 validate --lint | PASS: template.yaml is a valid SAM template; local validation context us-east-2, not a deployment choice |
| SAM CLI build | PASS: Node.js 22 build; no Docker required |
| Lambda package inspection | PASS: auth.mjs, handler.mjs, package.json only; no local mock adapter |
| Browser (isolated Edge via Playwright CLI) | PASS: signed-out direct /protected, all five groups, protected API 200, admin 200 only for Administrator/403 for the others, reload, logout, and session-loss 401 clearing protected content |
| AWS-mode fixture browser | PASS: no role picker, explicit AWSASSET-6 dependency, and no granted access |
| Browser visual/layout check | PASS: desktop 1280x900 and mobile 390x844 inspected; no mobile horizontal overflow |
| Deployment-command syntax | PASS: all three PowerShell code blocks parsed; no deployment commands executed |

SAM CLI 1.166.2 lint and build completed successfully. Validation used isolated AWS configuration paths with instance metadata lookup and telemetry disabled; no personal AWS profile was used.

Browser checks ran in isolated Microsoft Edge sessions. Expected 401/403 responses confirmed negative test cases. No JavaScript page errors occurred in the completed scripted checks.

## Reproduction steps

- npm.cmd test
- npm.cmd run check:build
- npm.cmd run dev, then npm.cmd run test:local in another terminal
- SAM commands and configuration are in [deployment handoff](deployment.md).
- Browser scripts: scripts/browser-local-check.js and scripts/browser-aws-placeholder-check.js run via Playwright CLI run-code --filename (not Node directly).
- Browser: open /protected signed out; enter as Employee; test protected call/admin denial; sign out; enter as Administrator; test admin success; sign out and revisit /protected. Repeat other groups; check session loss and mobile layout.
- Preview the fixture AWS build separately on another local port; verify the role picker is absent and the unimplemented AWSASSET-6 provider fails closed.

Screenshots inspected: output/playwright/local-admin-desktop.png, local-admin-mobile.png, and aws-placeholder.png.

Raw browser artifacts are ignored under .playwright-cli/ and output/playwright/. They use simulated local data only. Do not capture or commit real authentication storage, tokens, or credential-bearing traces.

## Evidence limits

Local sessions are simulated; unit tests synthesize authorizer claims. Neither verifies Cognito JWT signatures, API Gateway's deployed authorizer, real login/logout/reset, or team IAM permissions. The AWS login provider remains an AWSASSET-6 dependency. Use [the AWS checklist](aws-verification-checklist.md) after teammate deployment; every cloud check remains pending.

## Browser reproduction commands

These commands launch only isolated local Edge sessions; install/use a different supported browser if needed. Keep the dev server on its configured origin. For the fixture preview use another terminal with DEV_PORT=4318 and npm.cmd run preview -- --outDir .local/build-check (4318 is a test-only example, not deployment configuration).

```powershell
New-Item -ItemType Directory -Force output/playwright | Out-Null
npx.cmd --yes --package @playwright/cli playwright-cli -s=asset-security open http://localhost:3000/protected --browser msedge
npx.cmd --yes --package @playwright/cli playwright-cli -s=asset-security run-code --filename scripts/browser-local-check.js
npx.cmd --yes --package @playwright/cli playwright-cli -s=asset-aws open http://localhost:4318/protected --browser msedge
npx.cmd --yes --package @playwright/cli playwright-cli -s=asset-aws run-code --filename scripts/browser-aws-placeholder-check.js
```

## Results — September 16, 2026

In an isolated SALT checkout, `npm.cmd test` passed 34/34 tests and `npm.cmd run check:build` passed with example.invalid endpoints. These checks reused existing installed dependencies; a clean dependency installation was not tested. Application source files were unchanged. SAM, HTTP/browser, and real AWS checks were not repeated. Ignore-rule checks passed, and a pattern-based credential scan found no matches in the import candidate.
