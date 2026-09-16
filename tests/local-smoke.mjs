import assert from 'node:assert/strict';
const base = process.env.LOCAL_TEST_ORIGIN || 'http://localhost:3000';
const page = await fetch(base + '/protected');
assert.equal(page.status, 200);
assert.match(await page.text(), /frontend\/main.jsx/);
console.log('PASS /protected serves React entry');
assert.equal((await fetch(base + '/api/demo')).status, 401);
console.log('PASS anonymous API returns 401');
for (const group of ['Employee', 'Technician', 'Manager', 'Administrator', 'Auditor']) {
  const login = await fetch(base + '/api/local/login?group=' + group, { method: 'POST', headers: { Origin: base } });
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  assert.equal((await fetch(base + '/api/demo', { headers: { Cookie: cookie } })).status, 200);
  assert.equal((await fetch(base + '/api/admin', { headers: { Cookie: cookie } })).status, group === 'Administrator' ? 200 : 403);
  const logout = await fetch(base + '/api/local/logout', { method: 'POST', headers: { Origin: base, Cookie: cookie } });
  assert.equal(logout.status, 200);
  assert.equal((await fetch(base + '/api/demo', { headers: { Cookie: cookie } })).status, 401);
  console.log('PASS ' + group + ': demo/admin policy and logout');
}
