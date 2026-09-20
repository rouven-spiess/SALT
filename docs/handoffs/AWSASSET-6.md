# AWSASSET-6 — Agreed authentication flow

**Status:** Sandbox flow agreed and Amplify Auth client implemented in `frontend/team-auth.js`. Sandbox test users exist (one per group plus no-group). Recorded Cognito sign-in evidence remains pending. This document is not synchronized with Jira.

**Date:** 19 September 2026  
**Depends on:** AWSASSET-4/5/8 infrastructure (sandbox stack `salt-auth-sandbox` is deployed). AWSASSET-7 already attaches the provider token and guards pages.

The previous contract in [auth-contract.md](../auth-contract.md) was proposed. The decisions below are the agreed sandbox flow. Amplify is the Auth **client only**; SAM remains the source of truth for Cognito and the API.

## Agreed decisions

| Topic | Agreement |
| --- | --- |
| Login UX | Amazon Cognito **Hosted UI**. No custom username/password form in React for v1. No group/role picker on real sign-in. |
| OAuth | Authorization code + **PKCE S256** + `state`. Public app client, **no client secret**. |
| Library | **Amplify Auth** (`aws-amplify`) in `frontend/team-auth.js`. Configure against the existing SAM user pool. Do not run `amplify add auth` or Gen 2 `defineAuth`. No Cognito Identity Pool. |
| Config | Read public values from `frontend/team-config.js` (filled by `.env.aws.local` / Vite `VITE_` variables). |
| Scopes | Request `openid`, `email`, and the stack `RequiredScope`. Sandbox scope is `salt-sandbox/demo.read`. |
| API token | Send the Cognito **access token** as `Authorization: Bearer …`. Never send the ID token. |
| Frontend origin | `http://localhost:3000` for sandbox. Callback `/callback`, logout `/`. Hosted origins later must be HTTPS. |
| Session restore | `initialize()` processes `/callback` and restores tokens on reload **before** protected API calls. |
| Token lifetime | Access/ID tokens: 15 minutes. Refresh token: 1 day. Provider refreshes; do not claim immediate API revocation. |
| Logout | Clear local tokens, then redirect to Cognito `/logout` with the exact `LogoutUrl`. |
| Cross-tab / expiry | Keep the current AWSASSET-7 behavior: recheck via API and clear the protected view on 401. No extra session-bus required for v1. |
| Password reset | Cognito Hosted UI forgot-password / account recovery. First sign-in uses the admin temporary password, then Cognito forces a new password. |
| Users | Admin-created only (`AllowAdminCreateUserOnly`). Username is email. One test user per group plus one with no group. Temporary passwords last 3 days and are never committed. |
| MFA | Optional in the pool. Not required for initial sandbox test users. |
| Local demo | Unchanged. `npm run dev` keeps `local/mock-auth.mjs`. AWSASSET-6 runs only in AWS mode (`npm run dev:aws` / `npm run build`). |

## Flow

```text
React (localhost:3000, AWS mode)
    │
    ├── signIn() → Amplify signInWithRedirect()
    │     Cognito Hosted UI /login (PKCE S256)
    │
    ├── initialize() on /callback
    │     Amplify completes the code exchange; strip query; go to /protected
    │
    ├── getAccessToken() → fetchAuthSession() access token (not ID token)
    │
    ├── AWSASSET-7 page guard
    │     GET {ApiBaseUrl}/demo or /admin
    │     Authorization: Bearer <access token>
    │
    └── signOut() → Amplify signOut({ oauth: { redirectUrl } })
          Cognito /logout → http://localhost:3000/
```

Password reset stays on Hosted UI. After it completes, the user signs in through the same `/login` path. Group membership comes only from Cognito token claims, never from the UI.

## Provider interface (unchanged contract)

Implement in `frontend/team-auth.js`:

| Function | Behavior |
| --- | --- |
| `initialize()` | `Amplify.configure` from `team-config.js`; complete Hosted UI callback; restore session. |
| `getAccessToken()` | `fetchAuthSession()` access token, or `null`. |
| `signIn()` | `signInWithRedirect()` (Hosted UI). |
| `signOut()` | `signOut` with the configured logout URL. |

## Acceptance (sandbox)

Run against the deployed pool and API, not the local role picker. Record results in this handoff; do not paste tokens or passwords.

- Signed-out `/protected` shows sign-in and no API data.
- Login, callback, reload, cancelled login, and expiry keep the page protected.
- All five groups: `GET /demo` = 200.
- Only Administrator: `GET /admin` = 200; others 403.
- No-group user: 403.
- Logout clears the local session; `/protected` asks for sign-in again.
- Password reset works and does not bypass group checks.
- API still rejects missing, forged, expired, wrong-pool, and ID tokens (AWSASSET-8).

## Changes since last commit

Last commit on `main`: `306ab67` (16 September 2026) — *Merge pull request #2 from mrleom/feature/import-asset-tracker*.

**Tracked and ignored local changes:** see git working tree. Provider code, docs, and `aws-amplify` are in the repository; `.env.aws.local`, `node_modules/`, and `.aws-sam/` stay ignored.

**Local ignored files (not in Git):**

| Path | Why it exists |
| --- | --- |
| `.env.aws.local` | Public sandbox stack outputs for `npm run dev:aws`. Gitignored. No secrets. |
| `node_modules/` | Installed so the local demo and tests can run. |
| `.aws-sam/` | SAM build artifacts from the sandbox deploy. |

**Cloud (team xlab sandbox example, region `us-east-1`, stack `salt-auth-sandbox`):**

- Cognito user pool, hosted-login domain, public app client, five groups, and resource server from stack outputs (IDs are not recorded here).
- API Gateway stage with Cognito authorizer on protected methods, Lambda, and logs.
- Hosted SPA on CloudFront plus `http://localhost:3000` as a local callback origin.
- Test users are admin-created only. Hosted UI `/login` with client, PKCE, and callback parameters is the sign-in page.
- Existing xlab website auth stacks were not modified.

**Verification since that commit (local only):** `npm test` 37/37 passed and `npm run check:build` passed after the Amplify client was added. `npm run test:local` previously passed against the Vite demo. These do not prove Cognito or API Gateway security.

**Code since that commit:** Amplify Auth client in `frontend/team-auth.js`, oauth helpers, AWS-mode sign-in copy, `aws-amplify` dependency. Local mock auth is unchanged.

**Still not done for AWSASSET-6:** a real Hosted UI login against the sandbox pool (first sign-in must set a new password), password-reset walkthrough, and recorded AWS checklist evidence. Temporary passwords are not stored in this repository.
