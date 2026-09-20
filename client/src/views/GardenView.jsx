import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import { useToast } from '../ToastContext.jsx';
import PlantPicker from '../components/PlantPicker.jsx';
import GardenGrid from '../components/GardenGrid.jsx';
import CellDrawer from '../components/CellDrawer.jsx';

export default function GardenView() {
  const toast = useToast();
  const [garden, setGarden] = useState(null);
  const [plants, setPlants] = useState([]);
  const [armedKey, setArmedKey] = useState(null);
  const [selected, setSelected] = useState(null); // {row, col} for the detail drawer

  // Multi-select mode for bulk plant/delete.
  const [selectMode, setSelectMode] = useState(false);
  const [selection, setSelection] = useState(() => new Set()); // Set of "row,col"

  const loadGarden = useCallback(async () => { setGarden(await api.getGarden()); }, []);

  useEffect(() => {
    api.getPlants().then(setPlants).catch((e) => toast(e.message, 'bad'));
    loadGarden().catch((e) => toast(e.message, 'bad'));
  }, [loadGarden, toast]);

  const plant = useCallback(async (row, col, plantKey) => {
    try {
      const res = await api.plant({ row, col, plantKey });
      const c = res.companion.conflicts.length;
      const r = res.rotation?.conflict ? 1 : 0;
      if (c || r) toast(`Planted with ${c} companion + ${r} rotation warning(s). Click the cell for details.`, 'bad', 6000);
      else toast('Planted.', 'good', 2000);
      await loadGarden();
    } catch (e) { toast(e.message, 'bad'); }
  }, [loadGarden, toast]);

  const move = useCallback(async (id, row, col) => {
    try { await api.movePlanting(id, row, col); await loadGarden(); }
    catch (e) { toast(e.message, 'bad'); }
  }, [loadGarden, toast]);

  if (!garden) return <div className="empty-state">Loading garden…</div>;

  const selectedCell = selected
    ? (garden.cells.find((c) => c.row === selected.row && c.col === selected.col) || selected)
    : null;

  const planted = garden.cells.length;
  const conflicts = garden.cells.filter((c) => c.companionConflicts?.length || c.rotationConflict).length;

  // ----- selection helpers -----
  const plantedSet = new Set(garden.cells.map((c) => `${c.row},${c.col}`));
  const cellsFromSelection = () =>
    Array.from(selection).map((k) => { const [row, col] = k.split(',').map(Number); return { row, col }; });

  function toggleSelectMode() {
    setSelectMode((on) => {
      const next = !on;
      if (next) setSelected(null);     // close the drawer when entering select mode
      else setSelection(new Set());    // clear selection when leaving
      return next;
    });
  }
  function selectAllEmpty() {
    const s = new Set();
    for (let r = 0; r < garden.rows; r++)
      for (let c = 0; c < garden.cols; c++)
        if (!plantedSet.has(`${r},${c}`)) s.add(`${r},${c}`);
    setSelection(s);
  }
  function selectAll() {
    const s = new Set();
    for (let r = 0; r < garden.rows; r++)
      for (let c = 0; c < garden.cols; c++) s.add(`${r},${c}`);
    setSelection(s);
  }

  async function bulkPlant() {
    if (!armedKey) { toast('Pick a crop first (top dropdown).', 'bad'); return; }
    if (selection.size === 0) return;
    try {
      const res = await api.bulkPlant(cellsFromSelection(), armedKey);
      const skip = res.skipped ? `, ${res.skipped} skipped (already planted)` : '';
      toast(`Planted ${res.planted} cell(s)${skip}.`, res.planted ? 'good' : 'bad');
      setSelection(new Set());
      await loadGarden();
    } catch (e) { toast(e.message, 'bad'); }
  }

  async function bulkDelete() {
    if (selection.size === 0) return;
    if (!window.confirm(`Delete all crops in the ${selection.size} selected cell(s)? This removes their harvest entries too and cannot be undone.`)) return;
    try {
      const res = await api.bulkDelete(cellsFromSelection());
      toast(`Deleted ${res.deleted} planting(s).`, 'good');
      setSelection(new Set());
      await loadGarden();
    } catch (e) { toast(e.message, 'bad'); }
  }

  const armedName = plants.find((p) => p.key === armedKey)?.name;

  return (
    <div>
      <div className="plant-bar panel">
        <PlantPicker plants={plants} armedKey={armedKey} onArm={setArmedKey} />
      </div>

      <div className="grid-toolbar">
        <button className={selectMode ? 'primary' : ''} onClick={toggleSelectMode}>
          {selectMode ? '✓ Done selecting' : '▦ Select multiple'}
        </button>
        <div className="spacer" />
        <div className="legend">
          <span><span className="dot" style={{ background: 'var(--empty)', border: '1px solid var(--line)' }} /> empty</span>
          <span><span className="dot" style={{ background: 'var(--green)' }} /> planted ({planted})</span>
          <span><span className="dot" style={{ boxShadow: 'inset 0 0 0 3px var(--bad)', background: '#fff' }} /> conflict ({conflicts})</span>
        </div>
      </div>

      {selectMode && (
        <div className="select-bar">
          <strong>{selection.size}</strong> selected
          <span className="sep" />
          <button className="primary" disabled={!armedKey || selection.size === 0} onClick={bulkPlant}
            title={armedKey ? '' : 'Pick a crop in the dropdown first'}>
            🌱 Plant {armedName ? `“${armedName}”` : ''} here
          </button>
          <button className="danger" disabled={selection.size === 0} onClick={bulkDelete}>🗑 Delete crops</button>
          <span className="sep" />
          <button onClick={selectAllEmpty}>Select all empty</button>
          <button onClick={selectAll}>Select all</button>
          <button onClick={() => setSelection(new Set())} disabled={selection.size === 0}>Clear</button>
          <span className="hint small muted">Click cells, or drag across them, to select.</span>
        </div>
      )}

      {!selectMode && (
        <GridToolbar garden={garden} onResized={loadGarden} />
      )}

      <GardenGrid
        garden={garden}
        armedKey={armedKey}
        onPlant={plant}
        onMove={move}
        onSelectCell={(row, col) => setSelected({ row, col })}
        selectedCell={selectedCell}
        selectMode={selectMode}
        selection={selection}
        setSelection={setSelection}
      />

      {selectedCell && !selectMode && (
        <CellDrawer
          cell={selectedCell}
          plants={plants}
          onClose={() => setSelected(null)}
          onChanged={loadGarden}
        />
      )}
    </div>
  );
}

function GridToolbar({ garden, onResized }) {
  const toast = useToast();
  const [rows, setRows] = useState(garden.rows);
  const [cols, setCols] = useState(garden.cols);
  useEffect(() => { setRows(garden.rows); setCols(garden.cols); }, [garden.rows, garden.cols]);

  async function apply() {
    try { await api.updateGarden(Number(rows), Number(cols)); toast('Grid resized.', 'good'); onResized(); }
    catch (e) { toast(e.message, 'bad', 6000); }
  }
  const changed = Number(rows) !== garden.rows || Number(cols) !== garden.cols;

  return (
    <div className="grid-toolbar">
      <div className="inline">
        <label style={{ margin: 0 }}>Rows</label>
        <input type="number" min="1" max="100" value={rows} onChange={(e) => setRows(e.target.value)} style={{ width: 70 }} />
        <label style={{ margin: 0 }}>Cols</label>
        <input type="number" min="1" max="100" value={cols} onChange={(e) => setCols(e.target.value)} style={{ width: 70 }} />
        <button onClick={apply} disabled={!changed}>Resize</button>
      </div>
    </div>
  );
}
