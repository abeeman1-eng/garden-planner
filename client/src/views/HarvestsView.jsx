// Chronological harvest log across the whole garden, filterable by crop
// (spec 3.5). Entries are read-only here except for deletion; new entries are
// added from a cell's drawer where they attach to a specific planting.
import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import { useToast } from '../ToastContext.jsx';

export default function HarvestsView() {
  const toast = useToast();
  const [plants, setPlants] = useState([]);
  const [filter, setFilter] = useState('');
  const [entries, setEntries] = useState([]);

  const load = useCallback(async () => {
    const f = filter ? { plantKey: filter } : {};
    setEntries(await api.getHarvests(f));
  }, [filter]);

  useEffect(() => { api.getPlants().then(setPlants); }, []);
  useEffect(() => { load().catch((e) => toast(e.message, 'bad')); }, [load, toast]);

  async function del(id) {
    if (!window.confirm('Delete this harvest entry (and its photo)?')) return;
    try { await api.deleteHarvest(id); toast('Deleted.', 'good'); load(); }
    catch (e) { toast(e.message, 'bad'); }
  }

  // Only show plants that actually have harvest history in the filter.
  return (
    <div className="panel">
      <h2>Harvest Log</h2>
      <div className="body">
        <div className="toolbar-row">
          <div className="field">
            <label>Filter by crop</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ minWidth: 220 }}>
              <option value="">All crops</option>
              {plants.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
            </select>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="empty-state">
            No harvest entries yet. Open a planted cell in the Garden tab and use “Log a harvest”.
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Date</th><th>Crop</th><th>Cell</th><th>Note</th><th>Photo</th><th></th></tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="small">{e.date}</td>
                  <td>
                    <span className="tag"><span className="swatch" style={{ background: e.color }} />{e.plant_name}</span>
                  </td>
                  <td className="small muted">R{e.row + 1} · C{e.col + 1}</td>
                  <td>{e.note}</td>
                  <td>{e.photo_path && <a href={e.photo_path} target="_blank" rel="noreferrer"><img src={e.photo_path} alt="harvest" style={{ height: 44, borderRadius: 6 }} /></a>}</td>
                  <td><button className="danger" onClick={() => del(e.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
