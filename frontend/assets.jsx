import React, { useEffect, useMemo, useState } from 'react';
import { apiRequest } from './auth.js';

const STATUSES = ['Available', 'Assigned', 'Checked Out', 'In Maintenance', 'Damaged', 'Lost', 'Stolen', 'Retired'];

export function canCreateAssets(identity) {
  return identity.groups.includes('Technician') || identity.groups.includes('Administrator');
}

function canPatchAssets(identity) {
  return identity.groups.includes('Employee') || identity.groups.includes('Technician') || identity.groups.includes('Administrator');
}

function isAssetsPage(page) {
  return page === '/assets' || page.startsWith('/assets/');
}

export { isAssetsPage };

function emptyCreate() {
  return {
    assetTag: '', category: '', description: '', manufacturer: '', model: '', serialNumber: '',
    purchaseDate: '', purchaseValue: '', salvageValue: '', usefulLifeYears: '4',
    assignedUserId: '', assignedEmail: '', department: '', building: '', room: '',
    condition: 'Good', status: 'Available',
  };
}

function money(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

export function AssetsView({ identity, page, navigate, busy, act }) {
  if (page === '/assets/new') {
    return <AssetCreate identity={identity} navigate={navigate} busy={busy} act={act} />;
  }
  const detail = page.match(/^\/assets\/([^/]+)$/);
  if (detail) {
    return <AssetDetail id={decodeURIComponent(detail[1])} identity={identity} navigate={navigate} busy={busy} act={act} />;
  }
  return <AssetList identity={identity} navigate={navigate} busy={busy} act={act} />;
}

function AssetList({ identity, navigate, busy, act }) {
  const [assets, setAssets] = useState([]);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const creator = canCreateAssets(identity);

  async function load(next = { q, tag, status, category }) {
    const params = new URLSearchParams();
    if (next.q.trim()) params.set('q', next.q.trim());
    if (next.tag.trim()) params.set('tag', next.tag.trim());
    if (next.status) params.set('status', next.status);
    if (next.category.trim()) params.set('category', next.category.trim());
    const query = params.toString();
    const data = await apiRequest('/assets' + (query ? '?' + query : ''));
    setAssets(data.assets || []);
  }

  useEffect(() => { act(() => load()); }, []);

  return <section>
    <span className="eyebrow">03 / ASSETS</span>
    <h2>Asset records</h2>
    <p>The API only returns assets your group is allowed to see. Search uses an exact tag, or filters the visible list.</p>
    <form className="search-grid" onSubmit={event => { event.preventDefault(); act(() => load()); }}>
      <label>Search<input value={q} onChange={e => setQ(e.target.value)} placeholder="Tag, model, serial" /></label>
      <label>Exact tag<input value={tag} onChange={e => setTag(e.target.value)} placeholder="LAP-001" /></label>
      <label>Status<select value={status} onChange={e => setStatus(e.target.value)}>
        <option value="">Any</option>
        {STATUSES.map(name => <option key={name}>{name}</option>)}
      </select></label>
      <label>Category<input value={category} onChange={e => setCategory(e.target.value)} /></label>
      <button className="primary" disabled={busy}>Search</button>
    </form>
    {creator && <p><button className="primary" disabled={busy} onClick={() => navigate('/assets/new')}>Register asset</button></p>}
    {!assets.length && <p className="hint">No assets match this view.</p>}
    {!!assets.length && <div className="table-wrap"><table className="asset-table">
      <thead><tr><th>Tag</th><th>Category</th><th>Status</th><th>Department</th><th>Book value</th></tr></thead>
      <tbody>
        {assets.map(asset => <tr key={asset.assetId}>
          <td><button className="link" onClick={() => navigate('/assets/' + asset.assetId)}>{asset.assetTag}</button></td>
          <td>{asset.category}</td>
          <td>{asset.status}</td>
          <td>{asset.department}</td>
          <td>{money(asset.currentBookValue)}</td>
        </tr>)}
      </tbody>
    </table></div>}
  </section>;
}

function AssetCreate({ identity, navigate, busy, act }) {
  const [form, setForm] = useState(emptyCreate);
  if (!canCreateAssets(identity)) {
    return <section>
      <span className="eyebrow">03 / ASSETS</span>
      <h2>Create is not available</h2>
      <p>Employee, Manager, and Auditor cannot register assets. The API returns 403 for those groups.</p>
      <button onClick={() => navigate('/assets')}>Back to assets</button>
    </section>;
  }
  function set(name, value) { setForm(current => ({ ...current, [name]: value })); }
  async function submit(event) {
    event.preventDefault();
    await act(async () => {
      const created = await apiRequest('/assets', {
        method: 'POST',
        body: {
          ...form,
          purchaseValue: Number(form.purchaseValue),
          salvageValue: Number(form.salvageValue),
          usefulLifeYears: Number(form.usefulLifeYears),
        },
      });
      navigate('/assets/' + created.assetId);
    });
  }
  return <section>
    <span className="eyebrow">03 / ASSETS</span>
    <h2>Register an asset</h2>
    <form className="form-grid" onSubmit={submit}>
      {[['assetTag', 'Asset tag'], ['category', 'Category'], ['manufacturer', 'Manufacturer'], ['model', 'Model'],
        ['serialNumber', 'Serial number'], ['assignedUserId', 'Assigned user id'], ['assignedEmail', 'Assigned email'],
        ['department', 'Department'], ['building', 'Building'], ['room', 'Room']].map(([name, label]) =>
        <label key={name}>{label}<input required value={form[name]} onChange={e => set(name, e.target.value)} /></label>)}
      <label>Purchase date<input required type="date" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} /></label>
      <label>Purchase value<input required type="number" min="0" step="0.01" value={form.purchaseValue} onChange={e => set('purchaseValue', e.target.value)} /></label>
      <label>Salvage value<input required type="number" min="0" step="0.01" value={form.salvageValue} onChange={e => set('salvageValue', e.target.value)} /></label>
      <label>Useful life (years)<input required type="number" min="1" max="80" value={form.usefulLifeYears} onChange={e => set('usefulLifeYears', e.target.value)} /></label>
      <label>Condition<input required value={form.condition} onChange={e => set('condition', e.target.value)} /></label>
      <label>Status<select value={form.status} onChange={e => set('status', e.target.value)}>
        {STATUSES.map(name => <option key={name}>{name}</option>)}
      </select></label>
      <label className="wide">Description<textarea required value={form.description} onChange={e => set('description', e.target.value)} /></label>
      <div className="actions">
        <button className="primary" disabled={busy}>Save asset</button>
        <button type="button" disabled={busy} onClick={() => navigate('/assets')}>Cancel</button>
      </div>
    </form>
  </section>;
}

function AssetDetail({ id, identity, navigate, busy, act }) {
  const [asset, setAsset] = useState(null);
  const [patch, setPatch] = useState({});
  const groups = identity.groups;
  const employeeOnly = groups.includes('Employee') && !groups.includes('Technician') && !groups.includes('Administrator');
  const technician = groups.includes('Technician') && !groups.includes('Administrator');
  const admin = groups.includes('Administrator');

  async function load() {
    const data = await apiRequest('/assets/' + encodeURIComponent(id));
    setAsset(data);
    setPatch(employeeOnly
      ? { status: data.status, condition: data.condition, problemNote: data.problemNote || '' }
      : technician
        ? {
            status: data.status, condition: data.condition,
            lastCleaningDate: data.lastCleaningDate || '', lastMaintenanceDate: data.lastMaintenanceDate || '',
            nextMaintenanceDate: data.nextMaintenanceDate || '', expectedReplacementDate: data.expectedReplacementDate || '',
          }
        : admin
          ? {
              assetTag: data.assetTag, category: data.category, description: data.description,
              manufacturer: data.manufacturer, model: data.model, serialNumber: data.serialNumber,
              purchaseDate: data.purchaseDate, purchaseValue: data.purchaseValue, salvageValue: data.salvageValue,
              usefulLifeYears: data.usefulLifeYears, assignedUserId: data.assignedUserId, assignedEmail: data.assignedEmail,
              department: data.department, building: data.building, room: data.room, condition: data.condition,
              status: data.status, problemNote: data.problemNote || '',
              lastCleaningDate: data.lastCleaningDate || '', lastMaintenanceDate: data.lastMaintenanceDate || '',
              nextMaintenanceDate: data.nextMaintenanceDate || '', expectedReplacementDate: data.expectedReplacementDate || '',
            }
          : {});
  }
  useEffect(() => { act(load); }, [id]);

  const fields = useMemo(() => asset ? [
    ['Tag', asset.assetTag], ['Status', asset.status], ['Condition', asset.condition],
    ['Category', asset.category], ['Manufacturer', asset.manufacturer], ['Model', asset.model],
    ['Serial', asset.serialNumber], ['Department', asset.department],
    ['Assigned', asset.assignedEmail || asset.assignedUserId],
    ['Location', `${asset.building} ${asset.room}`.trim()],
    ['Purchase date', asset.purchaseDate], ['Purchase value', money(asset.purchaseValue)],
    ['Salvage value', money(asset.salvageValue)], ['Useful life', asset.usefulLifeYears + ' years'],
    ['Book value', money(asset.currentBookValue)], ['Annual depreciation', money(asset.annualDepreciation)],
    ['Problem note', asset.problemNote || '—'], ['Photo', asset.photoKey || 'none'],
    ['AI review', asset.aiReviewStatus],
  ] : [], [asset]);

  async function save(event) {
    event.preventDefault();
    const body = { ...patch };
    if (body.purchaseValue !== undefined) body.purchaseValue = Number(body.purchaseValue);
    if (body.salvageValue !== undefined) body.salvageValue = Number(body.salvageValue);
    if (body.usefulLifeYears !== undefined) body.usefulLifeYears = Number(body.usefulLifeYears);
    await act(async () => {
      setAsset(await apiRequest('/assets/' + encodeURIComponent(id), { method: 'PATCH', body }));
    });
  }

  if (!asset) return <section><h2>Asset</h2><p>Loading record…</p></section>;
  return <section>
    <span className="eyebrow">03 / ASSETS</span>
    <h2>{asset.assetTag}</h2>
    <p>{asset.description}</p>
    <dl className="detail-list">{fields.map(([label, value]) => <React.Fragment key={label}><dt>{label}</dt><dd>{String(value)}</dd></React.Fragment>)}</dl>
    {canPatchAssets(identity) && <form className="form-grid" onSubmit={save}>
      <h3>{employeeOnly ? 'Report a problem' : 'Update asset'}</h3>
      {patch.status !== undefined && <label>Status<select value={patch.status} onChange={e => setPatch({ ...patch, status: e.target.value })}>
        {STATUSES.map(name => <option key={name}>{name}</option>)}
      </select></label>}
      {patch.condition !== undefined && <label>Condition<input value={patch.condition} onChange={e => setPatch({ ...patch, condition: e.target.value })} /></label>}
      {patch.problemNote !== undefined && <label className="wide">Problem note<textarea value={patch.problemNote} onChange={e => setPatch({ ...patch, problemNote: e.target.value })} /></label>}
      {patch.lastCleaningDate !== undefined && <label>Last cleaned<input type="date" value={patch.lastCleaningDate} onChange={e => setPatch({ ...patch, lastCleaningDate: e.target.value })} /></label>}
      {patch.lastMaintenanceDate !== undefined && <label>Last maintenance<input type="date" value={patch.lastMaintenanceDate} onChange={e => setPatch({ ...patch, lastMaintenanceDate: e.target.value })} /></label>}
      {patch.nextMaintenanceDate !== undefined && <label>Next maintenance<input type="date" value={patch.nextMaintenanceDate} onChange={e => setPatch({ ...patch, nextMaintenanceDate: e.target.value })} /></label>}
      {patch.expectedReplacementDate !== undefined && <label>Expected replacement<input type="date" value={patch.expectedReplacementDate} onChange={e => setPatch({ ...patch, expectedReplacementDate: e.target.value })} /></label>}
      {admin && <>
        <label>Asset tag<input value={patch.assetTag} onChange={e => setPatch({ ...patch, assetTag: e.target.value })} /></label>
        <label>Category<input value={patch.category} onChange={e => setPatch({ ...patch, category: e.target.value })} /></label>
        <label>Department<input value={patch.department} onChange={e => setPatch({ ...patch, department: e.target.value })} /></label>
        <label>Assigned user id<input value={patch.assignedUserId} onChange={e => setPatch({ ...patch, assignedUserId: e.target.value })} /></label>
        <label>Assigned email<input value={patch.assignedEmail} onChange={e => setPatch({ ...patch, assignedEmail: e.target.value })} /></label>
        <label className="wide">Description<textarea value={patch.description} onChange={e => setPatch({ ...patch, description: e.target.value })} /></label>
      </>}
      <button className="primary" disabled={busy}>Save changes</button>
    </form>}
    <p><button type="button" onClick={() => navigate('/assets')}>Back to assets</button></p>
  </section>;
}
