# Project working instructions

- Use React + Vite for the frontend and AWS SAM for infrastructure.
- Track work against AWSASSET-4, AWSASSET-5, AWSASSET-7, and AWSASSET-8.
- Update the relevant docs/handoffs/AWSASSET-*.md whenever implementation or verification changes. Include changes, setup, acceptance checks, actual results, and remaining dependencies.
- Include applicable Jira issue keys in commit messages. Do not claim commits or Jira updates that have not happened.
- AWSASSET-6 is the teammate-owned login, logout, and password-reset deliverable. Coordinate via docs/auth-contract.md and the frontend/team-auth.js seam. Keep the local demo visibly and technically separate.
- Local tests and fake sessions do not verify Cognito or API Gateway security. Never mark AWS deployment or security acceptance complete without recorded real AWS evidence.
- Keep AWS deployment separate from local setup. Do not deploy as part of npm scripts.
- Bedrock is additional proposed scope pending its own team-agreed Jira issue. Do not implement it under the four existing issues. Any future photo suggestions require backend validation and explicit user review before saving. Do not add face recognition.
- Do not store credentials or tokens in this repository or VITE_ variables.
- On this Windows machine use npm.cmd; npm.ps1 is blocked by the current PowerShell execution policy.

- Deploy only to the teammate-approved account, never the user's personal account. Do not deploy during local preparation. Follow explicit profile/account/region checks in docs/deployment.md.
- Deployment configuration must remain portable. Current template creates new resources; existing team resource integration is a separately reviewed change.
- Label work ready for teammate deployment only after local checks pass; leave cloud deployment/security acceptance pending until verified.
