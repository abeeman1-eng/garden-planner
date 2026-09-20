// The garden grid. Normal mode: click-to-plant (with a crop armed), drag-and-drop
// planting, drag a planting to move it, click to open a cell's drawer. Select mode:
// click or drag across cells to build a multi-cell selection for bulk actions.
import { useState, useEffect, useRef } from 'react';

const CELL_PX = 54;
const keyOf = (r, c) => `${r},${c}`;

export default function GardenGrid({
  garden, armedKey, onPlant, onMove, onSelectCell, selectedCell,
  selectMode = false, selection = new Set(), setSelection
}) {
  const [hover, setHover] = useState(null);   // drop-target (normal mode)
  const paintRef = useRef(null);              // 'add' | 'remove' while dragging in select mode

  // End a paint-drag whenever the mouse is released anywhere.
  useEffect(() => {
    const up = () => { paintRef.current = null; };
    document.addEventListener('mouseup', up);
    return () => document.removeEventListener('mouseup', up);
  }, []);

  const byPos = new Map();
  for (const c of garden.cells) byPos.set(keyOf(c.row, c.col), c);

  function paint(r, c, mode) {
    const k = keyOf(r, c);
    setSelection((prev) => {
      const next = new Set(prev);
      if (mode === 'add') next.add(k); else next.delete(k);
      return next;
    });
  }
  function onCellMouseDown(r, c) {
    if (!selectMode) return;
    const mode = selection.has(keyOf(r, c)) ? 'remove' : 'add';
    paintRef.current = mode;
    paint(r, c, mode);
  }
  function onCellMouseEnter(r, c) {
    if (selectMode && paintRef.current) paint(r, c, paintRef.current);
  }

  function handleDrop(e, row, col, occupied) {
    e.preventDefault();
    setHover(null);
    const plantKey = e.dataTransfer.getData('text/plant-key');
    const moveId = e.dataTransfer.getData('text/move-id');
    if (occupied) return;
    if (plantKey) onPlant(row, col, plantKey);
    else if (moveId) onMove(Number(moveId), row, col);
  }

  const cells = [];
  for (let r = 0; r < garden.rows; r++) {
    for (let c = 0; c < garden.cols; c++) {
      const cell = byPos.get(keyOf(r, c));
      const planting = cell?.planting;
      const conflict = cell && (cell.companionConflicts?.length || cell.rotationConflict);
      const isSelected = selectedCell && selectedCell.row === r && selectedCell.col === c;
      const k = keyOf(r, c);
      const multiSel = selectMode && selection.has(k);

      cells.push(
        <div
          key={k}
          className={[
            'cell',
            planting ? 'planted' : 'empty',
            conflict ? 'conflict' : '',
            hover === k ? 'drop-target' : '',
            isSelected ? 'selected' : '',
            selectMode ? 'selectable' : '',
            multiSel ? 'multi-selected' : ''
          ].join(' ').trim()}
          style={planting ? { background: planting.color } : undefined}
          title={planting ? `${planting.plantName} (row ${r + 1}, col ${c + 1})` : `Empty — row ${r + 1}, col ${c + 1}`}
          draggable={!!planting && !selectMode}
          onDragStart={(e) => planting && !selectMode && e.dataTransfer.setData('text/move-id', String(planting.id))}
          onDragOver={(e) => { if (!selectMode && !planting) { e.preventDefault(); setHover(k); } }}
          onDragLeave={() => setHover((h) => (h === k ? null : h))}
          onDrop={(e) => !selectMode && handleDrop(e, r, c, !!planting)}
          onMouseDown={() => onCellMouseDown(r, c)}
          onMouseEnter={() => onCellMouseEnter(r, c)}
          onClick={() => {
            if (selectMode) return; // selection handled on mousedown
            if (!planting && armedKey) onPlant(r, c, armedKey);
            else onSelectCell(r, c);
          }}
        >
          {conflict ? <span className="flag" title="Conflict — open cell for details">⚠️</span> : null}
          {multiSel ? <span className="check">✓</span> : null}
          {planting ? <span className="label">{planting.plantName}</span> : null}
        </div>
      );
    }
  }

  return (
    <div className={`grid-scroll ${selectMode ? 'select-mode' : ''}`}>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${garden.cols}, ${CELL_PX}px)` }}>
        {cells}
      </div>
    </div>
  );
}
