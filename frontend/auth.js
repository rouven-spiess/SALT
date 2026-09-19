import * as teamAuth from './team-auth.js';

export const isLocal = import.meta.env.VITE_AUTH_MODE === 'local';

export async function signIn(group) {
  if (!isLocal) return teamAuth.signIn();
  const response = await fetch('/api/local/login?group=' + encodeURIComponent(group), { method: 'POST' });
  if (!response.ok) throw new Error('Local sign-in failed');
}

export async function completeSignIn() {
  if (!isLocal) await teamAuth.initialize();
}

function allowedPath(path) {
  const route = path.split('?')[0];
  return route === '/demo' || route === '/admin' || route === '/assets' || route.startsWith('/assets/');
}

export async function apiRequest(path, { method = 'GET', body } = {}) {
  if (!allowedPath(path)) throw new Error('Unknown API operation');
  const headers = {};
  let base = '/api';
  if (!isLocal) {
    const api = new URL(import.meta.env.VITE_API_URL);
    if (api.protocol !== 'https:') throw new Error('AWS API endpoint must use HTTPS');
    base = api.href.replace(/\/$/, '');
    const token = await teamAuth.getAccessToken();
    if (!token) throw Object.assign(new Error('Sign in required'), { status: 401 });
    headers.Authorization = 'Bearer ' + token;
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(base + path, {
    method, headers, cache: 'no-store',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) {
    throw Object.assign(new Error(data.error || data.message || 'API request denied'), { status: response.status });
  }
  return data;
}

export async function getProtected(path) {
  return apiRequest(path);
}

export async function signOut() {
  if (!isLocal) return teamAuth.signOut();
  const response = await fetch('/api/local/logout', { method: 'POST' });
  if (!response.ok) throw new Error('Local sign-out failed');
}
