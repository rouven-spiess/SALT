export const GROUPS = Object.freeze([
  'Employee', 'Technician', 'Manager', 'Administrator', 'Auditor',
]);

// Provisional demo policy: extend with named actions and ownership checks later.
const permissions = Object.freeze({
  'demo:read': GROUPS,
  'admin:read': ['Administrator'],
});

export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function parseGroups(value) {
  if (typeof value === 'string') {
    // REST API Gateway can stringify multi-valued Cognito claims.
    try { value = JSON.parse(value); }
    catch { value = value.replace(/^\[|\]$/g, '').split(',').map(v => v.trim()); }
  }
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(group => GROUPS.includes(group)))];
}

export function authenticate(event, config, now = Date.now()) {
  if (!config.clientId || !config.issuer || !config.requiredScope) throw new HttpError(503, 'Authentication is not configured');
  // Only API Gateway's verified authorizer context is trusted. Never decode a
  // client-supplied JWT, role header, query parameter, or request body here.
  const claims = event.requestContext?.authorizer?.claims;
  if (!claims || typeof claims.sub !== 'string' || !claims.sub ||
      claims.token_use !== 'access' || claims.client_id !== config.clientId ||
      claims.iss !== config.issuer || !Number.isFinite(Number(claims.exp)) ||
      Number(claims.exp) <= now / 1000) {
    throw new HttpError(401, 'Sign in required');
  }
  if (!String(claims.scope ?? '').split(' ').includes(config.requiredScope)) {
    throw new HttpError(403, 'Required API scope is missing');
  }
  return { subject: claims.sub, groups: parseGroups(claims['cognito:groups']) };
}

export function authorize(identity, action) {
  if (!permissions[action]?.some(group => identity.groups.includes(group))) {
    throw new HttpError(403, 'Your group does not have permission');
  }
}
