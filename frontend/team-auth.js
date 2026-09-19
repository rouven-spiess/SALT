// AWSASSET-6: Amplify Auth against the existing Cognito pool (SAM), not a second Amplify backend.
import { teamAuthConfig } from './team-config.js';
import { hostedUiHost, oauthScopes } from './oauth-config.js';

let configured;

function oauthErrorMessage() {
  const url = new URL(window.location.href);
  const error = url.searchParams.get('error');
  if (!error) return '';
  return url.searchParams.get('error_description') || error;
}

function isCallbackPath() {
  return window.location.pathname === new URL(teamAuthConfig.callbackUrl).pathname;
}

function stripOAuthParams(pathname) {
  history.replaceState(null, '', pathname);
}

async function loadAmplify() {
  const [{ Amplify }, auth, { Hub }] = await Promise.all([
    import('aws-amplify'),
    import('aws-amplify/auth'),
    import('aws-amplify/utils'),
  ]);
  return { Amplify, Hub, ...auth };
}

async function ensureConfigured() {
  if (!configured) {
    configured = (async () => {
      const { Amplify } = await loadAmplify();
      Amplify.configure({
        Auth: {
          Cognito: {
            userPoolId: teamAuthConfig.userPoolId,
            userPoolClientId: teamAuthConfig.clientId,
            loginWith: {
              email: true,
              oauth: {
                domain: hostedUiHost(teamAuthConfig.domain),
                scopes: oauthScopes(teamAuthConfig.scope),
                redirectSignIn: [teamAuthConfig.callbackUrl],
                redirectSignOut: [teamAuthConfig.logoutUrl],
                responseType: 'code',
              },
            },
          },
        },
      });
    })();
  }
  await configured;
}

async function sessionAfterRedirect() {
  const { Hub, fetchAuthSession } = await loadAmplify();
  const existing = await fetchAuthSession();
  if (existing.tokens?.accessToken || !new URL(window.location.href).searchParams.get('code'))
    return existing;
  return new Promise((resolve, reject) => {
    const finish = session => { cancel(); clearTimeout(timer); resolve(session); };
    const fail = error => { cancel(); clearTimeout(timer); reject(error); };
    const cancel = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signInWithRedirect' || payload.event === 'signedIn') {
        fetchAuthSession().then(finish, fail);
      }
      if (payload.event === 'signInWithRedirect_failure') {
        fail(new Error(payload.message || 'Sign-in could not be completed.'));
      }
    });
    const timer = setTimeout(() => { fetchAuthSession().then(finish, fail); }, 8000);
  });
}

export async function initialize() {
  await ensureConfigured();
  const failed = oauthErrorMessage();
  if (failed) {
    stripOAuthParams('/');
    throw new Error(failed);
  }
  const hadCode = new URL(window.location.href).searchParams.has('code');
  const session = await sessionAfterRedirect();
  if (isCallbackPath()) {
    const signedIn = Boolean(session.tokens?.accessToken);
    stripOAuthParams(signedIn ? '/protected' : '/');
    if (!signedIn && hadCode) throw new Error('Sign-in could not be completed.');
  }
}

export async function getAccessToken() {
  await ensureConfigured();
  const { fetchAuthSession } = await loadAmplify();
  const session = await fetchAuthSession();
  return session.tokens?.accessToken?.toString() ?? null;
}

export async function signIn() {
  await ensureConfigured();
  const { signInWithRedirect } = await loadAmplify();
  try {
    await signInWithRedirect();
  } catch (error) {
    if (error?.name === 'UserAlreadyAuthenticatedException') return;
    throw error;
  }
}

export async function signOut() {
  await ensureConfigured();
  const { signOut } = await loadAmplify();
  await signOut({ oauth: { redirectUrl: teamAuthConfig.logoutUrl } });
}
