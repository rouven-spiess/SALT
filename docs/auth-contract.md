# AWSASSET-6 coordination contract — proposed, awaiting teammate agreement

AWSASSET-6 owns real login, logout, password reset, callback handling, and session/token lifecycle. AWSASSET-7 owns page protection and attaching the provider's access token to API calls. AWSASSET-4/5/8 own the infrastructure and API permission checks described in their handoffs.

The React demo is a development harness, not delivery of AWSASSET-6. Its fake role picker and session endpoint live in local/mock-auth.mjs and only load during local Vite development. Real AWS integration is intentionally blocked by the placeholder frontend/team-auth.js. No real login, logout, or password-reset implementation is claimed.

## Integration seam

Have the teammate implement or adapt these functions in frontend/team-auth.js:

| Function | Contract |
| --- | --- |
| initialize() | Restore the provider session / process the callback before protected calls; reject failed authentication |
| getAccessToken() | Return a current Cognito access token, or null when signed out; handle expiry/refresh through the provider |
| signIn() | Start the team login flow |
| signOut() | Clear the provider session and perform the team's Cognito logout flow |

The teammate owns any password-reset UI. Replace the starter sign-in controls with team components during integration. Agree how cross-tab sign-out/session expiry notifies the page guard; the current demo rechecks via the API and clears its protected view on 401. It is not a complete session subscription system.

## Values and decisions to exchange

- SAM outputs and frontend environment mapping are listed in [the deployment handoff](deployment.md). Import public settings from frontend/team-config.js when implementing the provider.
- Agree FrontendOrigin, CallbackPath, and LogoutPath before deployment. Use the exact CallbackUrl and LogoutUrl outputs; no frontend URL is fixed. Hosted origins must be HTTPS.
- Public app client, no client secret. Proposed flow: authorization code with PKCE S256 and state validation, using the team's chosen supported auth library.
- Required access-token scope: the RequiredScope output (the team-selected ResourceServerIdentifier plus /demo.read). The configured client also allows openid and email. Send the access token, not the ID token, as Authorization: Bearer TOKEN.
- Verified Cognito groups are Employee, Technician, Manager, Administrator, Auditor. Group selection is never part of real user sign-in.
- Agree test-user provisioning, invite delivery, MFA enrollment, account recovery, and password-reset acceptance tests with AWSASSET-6.
- Access tokens expire after 15 minutes in the template. API Gateway may accept already issued tokens until expiry after logout or group changes; agree whether immediate revocation is a requirement.

## Joint acceptance session (not run)

Deploy the development stack; connect the real provider; verify login, callback, reload/session expiry, logout, password reset, direct /protected navigation, and API 401/403 results using users from all five groups. Record evidence in each issue handoff. No teammate has been contacted and no Jira issue has been updated by this setup.
