import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { completeSignIn, getProtected, isLocal, signIn, signOut } from './auth.js';
import './styles.css';

const groups = ['Employee', 'Technician', 'Manager', 'Administrator', 'Auditor'];
let initialization;
function App() {
  const [identity, setIdentity] = useState(null);
  const [group, setGroup] = useState('Employee');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [page, setPage] = useState(window.location.pathname);

  async function loadIdentity() {
    try { setIdentity(await getProtected('/demo')); }
    catch (err) {
      setIdentity(null);
      if (err.status !== 401) throw err;
    }
  }
  useEffect(() => {
    initialization ??= completeSignIn();
    initialization.then(loadIdentity).catch(err => setError(err.message))
      .finally(() => { setPage(window.location.pathname); setBusy(false); });
    const onPop = () => setPage(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  function navigate(path) { history.pushState(null, '', path); setPage(path); setResult(''); }
  async function act(action) {
    setBusy(true); setError(''); setResult('');
    try { await action(); }
    catch (err) { setError(err.message); if (err.status === 401) setIdentity(null); }
    finally { setBusy(false); }
  }
  async function login() {
    await signIn(group);
    if (isLocal) { await loadIdentity(); navigate('/protected'); }
  }
  async function logout() {
    await signOut();
    setIdentity(null); navigate('/');
  }
  const isAdmin = identity?.groups.includes('Administrator');
  return <main>
    <header><span className="brand">AT / ASSET TRACKER</span><span className="tag">AUTHENTICATION LAB</span></header>
    <aside className={isLocal ? 'banner local' : 'banner'}>
      <strong>{isLocal ? 'LOCAL DEMONSTRATION' : 'AWS INTEGRATION DEMO'}</strong>
      <span>{isLocal
        ? 'Fake sign-in and example data. The role picker is not real authentication.'
        : 'Connect the AWSASSET-6 login provider to use the configured Cognito API.'}</span>
    </aside>
    <h1>Start with who can access what.</h1>
    <p className="intro">A small workspace for testing sign-in, protected pages, and backend group permissions.</p>
    <nav aria-label="Demo navigation">
      <button onClick={() => navigate('/')} aria-current={page === '/' ? 'page' : undefined}>Overview</button>
      <button onClick={() => navigate('/protected')} aria-current={page === '/protected' ? 'page' : undefined}>Protected page</button>
      {identity && <button disabled={busy} onClick={() => act(logout)}>Sign out</button>}
    </nav>
    {error && <p role="alert" className="error">{error}</p>}
    {busy && <p role="status">Working…</p>}
    {!identity && !busy && <section>
      <span className="eyebrow">01 / SIGN IN</span>
      <h2>{page === '/protected' ? 'Sign in to open this page' : 'Choose your starting point'}</h2>
      <p>{isLocal ? 'Try Employee first, then Administrator to compare permissions.' : 'Real login, logout, and password reset belong to AWSASSET-6. The provider integration is pending.'}</p>
      {isLocal && <label>Demo group<select value={group} onChange={e => setGroup(e.target.value)}>
        {groups.map(name => <option key={name}>{name}</option>)}
      </select></label>}
      <button className="primary" disabled={busy} onClick={() => act(login)}>
        {isLocal ? 'Start local demo' : 'Continue to team sign-in'}
      </button>
    </section>}
    {identity && page === '/' && <section><h2>You are signed in</h2>
      <p>Open the protected page to call the API and inspect your permissions.</p>
      <button className="primary" onClick={() => navigate('/protected')}>Open protected page</button>
    </section>}
    {identity && page === '/protected' && <section>
      <span className="eyebrow">02 / PROTECTED PAGE</span><h2>Access granted by the backend</h2>
      <dl><dt>User</dt><dd>{identity.subject}</dd><dt>Groups</dt><dd>{identity.groups.join(', ')}</dd></dl>
      <div className="actions">
        <button className="primary" disabled={busy} onClick={() => act(async () => setResult((await getProtected('/demo')).message))}>Call protected API</button>
        {isAdmin && <button disabled={busy} onClick={() => act(async () => setResult((await getProtected('/admin')).message))}>Open admin demo</button>}
        {!isAdmin && <button disabled={busy} onClick={() => act(async () => setResult((await getProtected('/admin')).message))}>Test denied admin request</button>}
      </div>
      <p className="hint">All five groups can read this demo. Only Administrator can read the admin endpoint.</p>
      {result && <p role="status" className="success">{result}</p>}
    </section>}
    <footer>React controls the page. The backend decides whether the request is allowed.<br />Photo identification is planned for a later step; no photos or asset records are saved here.</footer>
  </main>;
}
createRoot(document.getElementById('root')).render(<App />);
