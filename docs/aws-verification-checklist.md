# Teammate AWS verification checklist

**All cloud checks below are PENDING.** Run only against the confirmed teammate account after successful deployment and AWSASSET-6 integration. Local role selection and synthetic claim tests are not evidence of Cognito/API Gateway security.

Record the date, build/commit reference, safe test-case label, expected/actual status, and reviewer. Do not copy credentials, tokens, cookies, full decoded JWTs, temporary passwords, or account recovery codes into Jira or this checklist. Do not record real authentication network traces/screenshots containing those values.

## Deployment and identity

- [ ] Confirm explicit team profile, expected account, region, stack, reviewed change set, and completed stack status.
- [ ] Confirm NEW resources are intended; verify outputs match the deployed pool, app client, API, stage, scope, and frontend origin.
- [ ] Verify app client has no secret, code flow is enabled, redirects are exact, and unauthorized self-sign-up is disabled.
- [ ] Verify all five groups exist. Provision approved test users for each and one with no group; do not store their credentials here.
- [ ] Inspect both protected GET methods: Cognito authorizer attached, correct pool ARN and required scope. OPTIONS alone may be unauthenticated.
- [ ] Verify Lambda has no public function URL and untrusted principals cannot invoke it directly.

## AWSASSET-6 + AWSASSET-7: real login and protected pages

- [ ] Direct /protected navigation while signed out shows team sign-in and no protected API data.
- [ ] Sign in through the teammate UI; verify PKCE/state/callback handling through provider tests without recording tokens.
- [ ] Fresh tokens include the agreed scope and assigned groups; the backend confirms identity.
- [ ] All five recognized groups can open the protected demo and receive 200 from GET /demo.
- [ ] Only Administrator receives 200 from GET /admin. Other four groups receive 403, including direct requests that bypass hidden buttons.
- [ ] A signed-in no-group user receives 403. Request body/header role changes cannot upgrade access.
- [ ] Reload, browser back/forward, multiple tabs, session expiry, and callback cancellation/error preserve correct protected-page behavior.
- [ ] The actual hosted origin works, SPA rewrites serve the callback and /protected, and no local demo role picker or /api/local/login backend is deployed.
- [ ] Teammate password-reset flow works and does not bypass group restrictions.

## AWSASSET-8: missing and invalid tokens

| Case | Expected | Actual |
| --- | --- | --- |
| No Authorization token | 401, no protected data | PENDING |
| Malformed token / forged signature | 401, no protected data | PENDING |
| Expired access token | 401, no protected data | PENDING |
| Token from another user pool | 401, no protected data | PENDING |
| ID token used as API access token | Rejected (401/403), no protected data | PENDING |
| Valid same-pool access token for another app client, with required scope | Lambda rejects 401 | PENDING |
| Valid access token missing required scope | Gateway rejects 403 | PENDING |
| Valid correct token with no recognized group | Lambda rejects 403 | PENDING |
| Correct token plus spoofed Administrator header/body | Actual token groups still control access | PENDING |

Use team-approved negative-token fixtures and a secure API client; do not paste raw token strings into shell history or saved handoffs. Gateway failures may have different JSON than Lambda failures; React must show a useful denial without protected data. Inspect request status and safe request IDs, not token contents.

## Logout, revocation, and CORS

- [ ] Logout clears the teammate provider's local session/tokens and exits Cognito hosted login as designed.
- [ ] After logout, /protected shows sign-in and the frontend sends no old token; cross-tab sign-out updates protected views.
- [ ] A saved already-issued access token may still be accepted by API Gateway until its 15-minute expiry. Verify and document this behavior; do NOT claim immediate server revocation. After expiry it must fail.
- [ ] Group removal/change is reflected in newly issued tokens. Document that older tokens may keep old groups until expiry.
- [ ] Valid frontend preflight succeeds; disallowed origins receive no usable allow-origin response. CORS is not an API authorization mechanism.
- [ ] Logs contain no tokens/credentials/photos; inspect the deployed runtime role and invocation permissions.

Close each issue only after its relevant AWS evidence is recorded. AWSASSET-4/5 infrastructure may be verified before AWSASSET-6 integration, but AWSASSET-7/8 end-to-end security acceptance remains pending until the real flows above pass.
