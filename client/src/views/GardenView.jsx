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
  const [selected, setSelected] = useState(null); // {row, col}

  const loadGarden = useCallback(async () => {
    setGarden(await api.getGarden());
  }, []);

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

  // Merge selected {row,col} with its live cell state (conflicts) from garden.
  const selectedCell = selected
    ? (garden.cells.find((c) => c.row === selected.row && c.col === selected.col) || selected)
    : null;

  const planted = garden.cells.length;
  const conflicts = garden.cells.filter((c) => c.companionConflicts?.length || c.rotationConflict).length;

  return (
    <div>
      <div className="plant-bar panel">
        <PlantPicker plants={plants} armedKey={armedKey} onArm={setArmedKey} />
      </div>

      <GridToolbar garden={garden} onResized={loadGarden} planted={planted} conflicts={conflicts} />
      <GardenGrid
        garden={garden}
        armedKey={armedKey}
        onPlant={plant}
        onMove={move}
        onSelectCell={(row, col) => setSelected({ row, col })}
        selectedCell={selectedCell}
      />

      {selectedCell && (
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

function GridToolbar({ garden, onResized, planted, conflicts }) {
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
      <div className="spacer" />
      <div className="legend">
        <span><span className="dot" style={{ background: 'var(--empty)', border: '1px solid var(--line)' }} /> empty</span>
        <span><span className="dot" style={{ background: 'var(--green)' }} /> planted ({planted})</span>
        <span><span className="dot" style={{ boxShadow: 'inset 0 0 0 3px var(--bad)', background: '#fff' }} /> conflict ({conflicts})</span>
      </div>
    </div>
  );
}
