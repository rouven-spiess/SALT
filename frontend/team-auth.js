// AWSASSET-6 owns the real login, logout, and password-reset implementation.
// This seam intentionally has no Cognito SDK, credentials, fake token, or login UI.
// Replace these functions with the teammate's auth provider; see docs/auth-contract.md.
export async function initialize() {}
export async function getAccessToken() { return null; }
export async function signIn() {
  throw new Error('AWSASSET-6 dependency: connect the team login provider before AWS sign-in testing.');
}
export async function signOut() {
  throw new Error('AWSASSET-6 dependency: connect the team logout provider.');
}
