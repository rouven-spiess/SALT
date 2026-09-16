import { authenticate, authorize, HttpError } from './auth.mjs';

export function createHandler(config) {
  return async event => {
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': config.origin,
      'Vary': 'Origin',
    };
    try {
      const identity = authenticate(event, config);
      const route = `${event.httpMethod} ${event.resource}`;
      if (route === 'GET /demo') {
        authorize(identity, 'demo:read');
        return { statusCode: 200, headers, body: JSON.stringify({
          message: 'The backend allowed access to the protected demo.', ...identity,
        }) };
      }
      if (route === 'GET /admin') {
        authorize(identity, 'admin:read');
        return { statusCode: 200, headers, body: JSON.stringify({
          message: 'The backend verified Administrator membership.', ...identity,
        }) };
      }
      throw new HttpError(404, 'Route not found');
    } catch (error) {
      return { statusCode: error instanceof HttpError ? error.statusCode : 500,
        headers, body: JSON.stringify({ error: error instanceof HttpError ? error.message : 'Internal server error' }) };
    }
  };
}

// No mock mode, Lambda URL, public resource policy, or AWS credentials in code.
export const handler = async event => createHandler({
  clientId: process.env.COGNITO_CLIENT_ID,
  issuer: process.env.COGNITO_ISSUER,
  origin: process.env.FRONTEND_ORIGIN,
  requiredScope: process.env.REQUIRED_SCOPE,
})(event);
