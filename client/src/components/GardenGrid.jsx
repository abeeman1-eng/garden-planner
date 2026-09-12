// The garden grid. Renders every cell from garden state; supports click-to-plant
// (when a plant is armed), drag-and-drop planting, dragging a planting to move it,
// and selecting a cell to open its detail drawer. Conflict cells are outlined.
import { useState } from 'react';

const CELL_PX = 54;

export default function GardenGrid({ garden, armedKey, onPlant, onMove, onSelectCell, selectedCell }) {
  const [hover, setHover] = useState(null); // "r,c" being dragged over

  // Map "row,col" -> cell state for O(1) lookup.
  const byPos = new Map();
  for (const c of garden.cells) byPos.set(`${c.row},${c.col}`, c);

  function handleDrop(e, row, col, occupied) {
    e.preventDefault();
    setHover(null);
    const plantKey = e.dataTransfer.getData('text/plant-key');
    const moveId = e.dataTransfer.getData('text/move-id');
    if (occupied) return; // only drop onto empty cells
    if (plantKey) onPlant(row, col, plantKey);
    else if (moveId) onMove(Number(moveId), row, col);
  }

  const rows = [];
  for (let r = 0; r < garden.rows; r++) {
    for (let c = 0; c < garden.cols; c++) {
      const cell = byPos.get(`${r},${c}`);
      const planting = cell?.planting;
      const conflict = cell && (cell.companionConflicts?.length || cell.rotationConflict);
      const isSelected = selectedCell && selectedCell.row === r && selectedCell.col === c;
      const key = `${r},${c}`;

      rows.push(
        <div
          key={key}
          className={[
            'cell',
            planting ? 'planted' : 'empty',
            conflict ? 'conflict' : '',
            hover === key ? 'drop-target' : '',
            isSelected ? 'selected' : ''
          ].join(' ').trim()}
          style={planting ? { background: planting.color } : undefined}
          title={planting ? `${planting.plantName} (row ${r + 1}, col ${c + 1})` : `Empty — row ${r + 1}, col ${c + 1}`}
          draggable={!!planting}
          onDragStart={(e) => planting && e.dataTransfer.setData('text/move-id', String(planting.id))}
          onDragOver={(e) => { if (!planting) { e.preventDefault(); setHover(key); } }}
          onDragLeave={() => setHover((h) => (h === key ? null : h))}
          onDrop={(e) => handleDrop(e, r, c, !!planting)}
          onClick={() => {
            if (!planting && armedKey) onPlant(r, c, armedKey);
            else onSelectCell(r, c);
          }}
        >
          {conflict ? <span className="flag" title="Conflict — open cell for details">⚠️</span> : null}
          {planting ? <span className="label">{planting.plantName}</span> : null}
        </div>
      );
    }
  }

  return (
    <div className="grid-scroll">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${garden.cols}, ${CELL_PX}px)` }}>
        {rows}
      </div>
    </div>
  );
}
