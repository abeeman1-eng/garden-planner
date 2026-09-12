// Slide-in drawer for a selected cell. For a planted cell: shows the current
// planting, live companion/rotation warnings, planting history, and harvest
// entries, with actions to remove/delete and log a harvest. For an empty cell:
// shows companion suggestions from neighbors and lets you plant.
import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useToast } from '../ToastContext.jsx';

export default function CellDrawer({ cell, plants, onClose, onChanged }) {
  const toast = useToast();
  const { row, col } = cell;
  const [detail, setDetail] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [busy, setBusy] = useState(false);

  const current = detail?.current || null;
  const conflicts = cell.companionConflicts || [];
  const good = cell.goodNeighbors || [];
  const rotation = cell.rotationConflict || null;

  async function load() {
    const d = await api.getCell(row, col);
    setDetail(d);
    if (!d.current) setSuggestions(await api.getSuggestions(row, col));
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [row, col]);

  async function plant(plantKey) {
    setBusy(true);
    try {
      const res = await api.plant({ row, col, plantKey });
      const c = res.companion.conflicts, r = res.rotation;
      if (c.length || r?.conflict) {
        toast(`Planted with warnings — ${c.length} companion, ${r?.conflict ? '1 rotation' : '0 rotation'}. See details.`, 'bad', 6000);
      } else {
        toast('Planted.', 'good');
      }
      await load();
      onChanged();
    } catch (e) { toast(e.message, 'bad'); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!current) return;
    setBusy(true);
    try { await api.removePlanting(current.id); toast('Marked as removed (kept in history).', 'good'); await load(); onChanged(); }
    catch (e) { toast(e.message, 'bad'); } finally { setBusy(false); }
  }

  async function hardDelete(id, label) {
    if (!window.confirm(`Permanently delete this planting${label ? ` (${label})` : ''} and its harvest entries? This cannot be undone.`)) return;
    setBusy(true);
    try { await api.deletePlanting(id); toast('Deleted.', 'good'); await load(); onChanged(); }
    catch (e) { toast(e.message, 'bad'); } finally { setBusy(false); }
  }

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          {current && <span className="swatch" style={{ background: current.color, width: 22, height: 22 }} />}
          <h2>{current ? current.plant_name : 'Empty cell'}</h2>
          <span className="muted small">Row {row + 1}, Col {col + 1}</span>
          <button className="close" onClick={onClose}>✕</button>
        </div>

        {/* Warnings for the current planting */}
        {current && (conflicts.length > 0 || rotation) && (
          <div className="section">
            <h3>Warnings</h3>
            {rotation && (
              <div className="alert bad">
                <strong>Crop rotation</strong>{rotation.message}
              </div>
            )}
            {conflicts.map((c, i) => (
              <div key={i} className="alert bad">
                <strong>Bad companion: {c.plantName} (row {c.row + 1}, col {c.col + 1})</strong>
                {c.reason}
              </div>
            ))}
          </div>
        )}
        {current && good.length > 0 && (
          <div className="section">
            <h3>Good neighbors</h3>
            {good.map((g, i) => (
              <div key={i} className="alert good"><strong>{g.plantName}</strong>{g.reason}</div>
            ))}
          </div>
        )}

        {/* Current planting actions + harvest log */}
        {current && (
          <>
            <div className="section">
              <h3>Planting</h3>
              <p className="small muted" style={{ marginTop: 0 }}>
                {current.family_label} · planted {current.planted_date}
              </p>
              {current.notes && <p className="small">{current.notes}</p>}
              <div className="inline">
                <button onClick={remove} disabled={busy}>Remove (harvested / pulled)</button>
                <button className="danger" onClick={() => hardDelete(current.id, current.plant_name)} disabled={busy}>Delete</button>
              </div>
            </div>
            <HarvestForm plantingId={current.id} onAdded={load} />
          </>
        )}

        {/* Empty-cell planting + suggestions */}
        {detail && !current && (
          <div className="section">
            <h3>Plant here</h3>
            {suggestions.length > 0 && (
              <>
                <p className="small muted" style={{ marginTop: 0 }}>Suggested by nearby companions:</p>
                <div className="inline" style={{ marginBottom: 12 }}>
                  {suggestions.map((s) => (
                    <button key={s.key} onClick={() => plant(s.key)} disabled={busy}
                      title={s.reasons.map((r) => `${r.neighbor}: ${r.reason}`).join('\n')}>
                      <span className="swatch" style={{ background: s.color, display: 'inline-block', marginRight: 6, verticalAlign: -2 }} />
                      {s.name}
                    </button>
                  ))}
                </div>
              </>
            )}
            <PlantSelect plants={plants} onPlant={plant} busy={busy} />
          </div>
        )}

        {/* History */}
        {detail && detail.history.length > 0 && (
          <div className="section">
            <h3>Cell history</h3>
            {detail.history.map((h) => (
              <div key={h.id} className={`history-item ${h.removed_date ? '' : 'active'}`}>
                <div className="inline">
                  <span className="swatch" style={{ background: h.color }} />
                  <strong>{h.plant_name}</strong>
                  <span className="when">
                    {h.planted_date} → {h.removed_date || 'present'}
                  </span>
                </div>
                {h.harvests.map((hv) => (
                  <div key={hv.id} className="harvest-note">
                    <div className="small muted">{hv.date}</div>
                    {hv.note}
                    {hv.photo_path && <img src={hv.photo_path} alt="harvest" />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PlantSelect({ plants, onPlant, busy }) {
  const [key, setKey] = useState('');
  return (
    <div className="inline">
      <select value={key} onChange={(e) => setKey(e.target.value)} style={{ maxWidth: 240 }}>
        <option value="">Choose a plant…</option>
        {plants.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
      </select>
      <button className="primary" disabled={!key || busy} onClick={() => onPlant(key)}>Plant</button>
    </div>
  );
}

function HarvestForm({ plantingId, onAdded }) {
  const toast = useToast();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!note.trim() && !file) { toast('Add a note or a photo.', 'bad'); return; }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('plantingId', plantingId);
      fd.append('date', date);
      fd.append('note', note);
      if (file) fd.append('photo', file);
      await api.addHarvest(fd);
      setNote(''); setFile(null);
      e.target.reset?.();
      toast('Harvest logged.', 'good');
      onAdded();
    } catch (err) { toast(err.message, 'bad'); }
    finally { setBusy(false); }
  }

  return (
    <form className="section" onSubmit={submit}>
      <h3>Log a harvest</h3>
      <div className="field">
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="field">
        <label>Note</label>
        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="First tomatoes! A bit small but sweet." />
      </div>
      <div className="field">
        <label>Photo (optional)</label>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} />
      </div>
      <button className="primary" disabled={busy}>Add entry</button>
    </form>
  );
}
