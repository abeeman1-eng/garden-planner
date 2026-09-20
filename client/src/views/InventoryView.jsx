// Seed / start inventory (spec 3.7). Two views: what's on hand (editable list)
// and what's been planted historically (derived from planting records).
import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import { useToast } from '../ToastContext.jsx';

const BLANK = { name: '', variety: '', quantity: '', unit: 'packet', acquiredDate: '', expirationDate: '', plantKey: '', notes: '' };

export default function InventoryView() {
  const [view, setView] = useState('onhand');
  return (
    <div className="panel">
      <h2>Inventory</h2>
      <div className="body">
        <div className="subtabs">
          <button className={view === 'onhand' ? 'active' : ''} onClick={() => setView('onhand')}>On hand</button>
          <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>Planted history</button>
        </div>
        {view === 'onhand' ? <OnHand /> : <PlantedHistory />}
      </div>
    </div>
  );
}

function OnHand() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [plants, setPlants] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(async () => setItems(await api.getInventory()), []);
  useEffect(() => { api.getPlants().then(setPlants); load().catch((e) => toast(e.message, 'bad')); }, [load, toast]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  function reset() { setForm(BLANK); setEditingId(null); }

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) { toast('Name is required.', 'bad'); return; }
    try {
      if (editingId) { await api.updateInventory(editingId, form); toast('Updated.', 'good'); }
      else { await api.addInventory(form); toast('Added.', 'good'); }
      reset(); load();
    } catch (err) { toast(err.message, 'bad'); }
  }

  function edit(it) {
    setEditingId(it.id);
    setForm({
      name: it.name || '', variety: it.variety || '', quantity: it.quantity ?? '',
      unit: it.unit || '', acquiredDate: it.acquired_date || '', expirationDate: it.expiration_date || '',
      plantKey: it.plant_key || '', notes: it.notes || ''
    });
  }

  async function del(id) {
    if (!window.confirm('Delete this inventory item?')) return;
    try { await api.deleteInventory(id); toast('Deleted.', 'good'); if (editingId === id) reset(); load(); }
    catch (e) { toast(e.message, 'bad'); }
  }

  return (
    <>
      <form onSubmit={submit} style={{ marginBottom: 20 }}>
        <div className="toolbar-row">
          <div className="field" style={{ minWidth: 160 }}><label>Name *</label><input value={form.name} onChange={set('name')} placeholder="Tomato seeds" /></div>
          <div className="field" style={{ minWidth: 140 }}><label>Variety</label><input value={form.variety} onChange={set('variety')} placeholder="Cherokee Purple" /></div>
          <div className="field" style={{ width: 90 }}><label>Qty</label><input type="number" step="any" value={form.quantity} onChange={set('quantity')} /></div>
          <div className="field" style={{ width: 110 }}><label>Unit</label><input value={form.unit} onChange={set('unit')} placeholder="packet" /></div>
          <div className="field" style={{ minWidth: 150 }}>
            <label>Linked plant</label>
            <select value={form.plantKey} onChange={set('plantKey')}>
              <option value="">— none —</option>
              {plants.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
            </select>
          </div>
          <div className="field" style={{ width: 150 }}><label>Acquired</label><input type="date" value={form.acquiredDate} onChange={set('acquiredDate')} /></div>
          <div className="field" style={{ width: 150 }}><label>Expires / viable to</label><input type="date" value={form.expirationDate} onChange={set('expirationDate')} /></div>
        </div>
        <div className="field"><label>Notes</label><input value={form.notes} onChange={set('notes')} placeholder="Saved from last year; germination ~80%" /></div>
        <div className="inline">
          <button className="primary" type="submit">{editingId ? 'Save changes' : 'Add item'}</button>
          {editingId && <button type="button" onClick={reset}>Cancel</button>}
        </div>
      </form>

      {items.length === 0 ? (
        <div className="empty-state">No inventory yet. Add your seeds and starts above.</div>
      ) : (
        <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Variety</th><th>Qty</th><th>Linked</th><th>Acquired</th><th>Expires</th><th>Notes</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.name}</td>
                <td className="muted">{it.variety}</td>
                <td>{it.quantity != null ? `${it.quantity}${it.unit ? ' ' + it.unit : ''}` : '—'}</td>
                <td>{it.plant_name ? <span className="tag"><span className="swatch" style={{ background: it.color }} />{it.plant_name}</span> : <span className="muted small">—</span>}</td>
                <td className="small muted">{it.acquired_date || '—'}</td>
                <td className="small muted">{it.expiration_date || '—'}</td>
                <td className="small">{it.notes}</td>
                <td><div className="row-actions"><button onClick={() => edit(it)}>Edit</button><button className="danger" onClick={() => del(it.id)}>Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </>
  );
}

function PlantedHistory() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const load = useCallback(async () => setRows(await api.getPlantedHistory()), []);
  useEffect(() => { load().catch((e) => toast(e.message, 'bad')); }, [load, toast]);

  async function del(r) {
    const growing = r.currently_growing > 0
      ? ` ${r.currently_growing} of these are currently growing and will be removed from the grid.`
      : '';
    if (!window.confirm(`Delete all ${r.times_planted} planting record(s) for ${r.plant_name}?${growing} This also deletes their harvest entries and cannot be undone.`)) return;
    try {
      const res = await api.deletePlantingsByPlant(r.plant_key);
      toast(`Deleted ${res.deleted} record(s) for ${r.plant_name}.`, 'good');
      load();
    } catch (e) { toast(e.message, 'bad'); }
  }

  if (rows.length === 0) return <div className="empty-state">Nothing planted yet. Plantings you make in the Garden tab show up here.</div>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Crop</th><th>Times planted</th><th>Currently growing</th><th>First planted</th><th>Last planted</th><th></th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.plant_key}>
              <td><span className="tag"><span className="swatch" style={{ background: r.color }} />{r.plant_name}</span></td>
              <td>{r.times_planted}</td>
              <td>{r.currently_growing}</td>
              <td className="small muted">{r.first_planted}</td>
              <td className="small muted">{r.last_planted}</td>
              <td><button className="danger" onClick={() => del(r)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
