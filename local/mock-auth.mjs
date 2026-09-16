// Development-only adapter. Outside backend/ so SAM never packages it.
import { randomUUID } from 'node:crypto';
import { createHandler } from '../backend/handler.mjs';
import { readLocalSettings } from './settings.mjs';
import { GROUPS } from '../backend/auth.mjs';

export function createMockMiddleware({ origin = readLocalSettings().origin } = {}) {
  const config = { clientId: 'local-demo', issuer: 'local-demo', origin, requiredScope: 'local-demo/demo.read' };
  const sessions = new Map();
  const handler = createHandler(config);
  return async (req, res, next) => {
    const path = new URL(req.url, origin).pathname;
    if (!path.startsWith('/api/')) return next();
    const send = (status, data, extra = {}) => {
      res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra });
      res.end(JSON.stringify(data));
    };
    if (req.headers.host !== new URL(origin).host) return send(403, { error: 'Localhost only' });
    if (req.headers.origin && req.headers.origin !== origin) return send(403, { error: 'Origin not allowed' });
    if (req.method === 'POST' && req.headers.origin !== origin) return send(403, { error: 'Origin required' });
    for (const [key, session] of sessions) {
      if (session.exp <= Date.now() / 1000) sessions.delete(key);
    }
    const cookie = req.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith('demo_session='));
    const sessionId = cookie?.slice('demo_session='.length);
    if (req.method === 'POST' && path === '/api/local/login') {
      // Selecting a role is intentionally NOT authentication. Fake data only.
      const group = new URL(req.url, origin).searchParams.get('group');
      if (!GROUPS.includes(group)) return send(400, { error: 'Choose a demo group' });
      if (sessions.size >= 1000) return send(429, { error: 'Too many demo sessions; restart the dev server' });
      sessions.delete(sessionId);
      const id = randomUUID();
      sessions.set(id, { group, exp: Math.floor(Date.now() / 1000) + 1800 });
      return send(200, { mode: 'local' }, { 'Set-Cookie': `demo_session=${id}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=1800` });
    }
    if (req.method === 'POST' && path === '/api/local/logout') {
      sessions.delete(sessionId);
      return send(200, {}, { 'Set-Cookie': 'demo_session=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0' });
    }
    if (!['/api/demo', '/api/admin'].includes(path) || req.method !== 'GET') {
      return send(404, { error: 'Route not found' });
    }
    const session = sessions.get(sessionId);
    const claims = session ? {
      sub: 'local-example-user', client_id: config.clientId, iss: config.issuer,
      token_use: 'access', scope: config.requiredScope, exp: session.exp,
      'cognito:groups': [session.group],
    } : undefined;
    const result = await handler({
      httpMethod: req.method, resource: path.slice(4),
      requestContext: { authorizer: { claims } },
    });
    res.writeHead(result.statusCode, result.headers);
    res.end(result.body);
  };
}

export function localAuthPlugin(settings) {
  return {
    name: 'local-auth-demonstration',
    apply: 'serve',
    configureServer(server) { server.middlewares.use(createMockMiddleware(settings)); },
  };
}
