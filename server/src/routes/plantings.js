// Planting lifecycle (spec 3.1/3.3): plant into an empty cell, move, remove
// (keeps history), or hard-delete. Placing a crop can decrement a linked
// inventory item (spec 3.7).
import { Router } from 'express';
import { all, get, run, batch } from '../db.js';
import { checkPlacement } from '../services/companion.js';
import { checkRotation } from '../services/rotation.js';
import { asyncHandler } from '../util.js';

const router = Router();
const today = () => new Date().toISOString().slice(0, 10);

const bounds = () => get('SELECT rows, cols FROM garden WHERE id = 1');
async function inBounds(row, col) {
  const g = await bounds();
  return Number.isInteger(row) && Number.isInteger(col) && row >= 0 && col >= 0 && row < g.rows && col < g.cols;
}
const currentAt = (row, col) =>
  get('SELECT * FROM plantings WHERE row = ? AND col = ? AND removed_date IS NULL', [row, col]);

async function plantingDetail(id) {
  const p = await get(`
    SELECT p.*, pl.name AS plant_name, pl.color, pl.family, pl.family_label, pl.category
    FROM plantings p JOIN plants pl ON pl.key = p.plant_key WHERE p.id = ?
  `, [id]);
  if (!p) return null;
  const rows = await all(
    'SELECT id, date, note, (photo IS NOT NULL) AS has_photo FROM harvest_entries WHERE planting_id = ? ORDER BY date DESC, id DESC',
    [id]
  );
  p.harvests = rows.map((r) => ({ id: r.id, date: r.date, note: r.note, photo_path: r.has_photo ? `/api/harvests/${r.id}/photo` : null }));
  return p;
}

router.post('/', asyncHandler(async (req, res) => {
  const row = Number(req.body.row);
  const col = Number(req.body.col);
  const plantKey = String(req.body.plantKey || '');
  const plantedDate = req.body.plantedDate || today();
  const notes = req.body.notes ?? null;
  const inventoryItemId = req.body.inventoryItemId ? Number(req.body.inventoryItemId) : null;

  if (!(await inBounds(row, col))) return res.status(400).json({ error: 'Cell is out of bounds' });
  if (!(await get('SELECT 1 FROM plants WHERE key = ?', [plantKey]))) return res.status(400).json({ error: 'Unknown plant' });
  if (await currentAt(row, col)) return res.status(409).json({ error: 'Cell is already planted. Remove or move the current crop first.' });

  const writes = [{
    sql: 'INSERT INTO plantings (row, col, plant_key, planted_date, notes, inventory_item_id) VALUES (?, ?, ?, ?, ?, ?)',
    args: [row, col, plantKey, plantedDate, notes, inventoryItemId]
  }];
  if (inventoryItemId) {
    writes.push({ sql: 'UPDATE inventory_items SET quantity = MAX(0, COALESCE(quantity, 0) - 1) WHERE id = ?', args: [inventoryItemId] });
  }
  const results = await batch(writes);
  const id = Number(results[0].lastInsertRowid);

  const plantedYear = Number(plantedDate.slice(0, 4));
  res.status(201).json({
    planting: await plantingDetail(id),
    companion: await checkPlacement({ row, col, plantKey, excludePlantingId: id }),
    rotation: await checkRotation({ row, col, plantKey, plantedYear, excludePlantingId: id })
  });
}));

// Bulk-plant one crop into many empty cells at once. Skips out-of-bounds cells,
// cells already planted, and duplicates. Returns how many were planted/skipped.
router.post('/bulk', asyncHandler(async (req, res) => {
  const plantKey = String(req.body.plantKey || '');
  const plantedDate = req.body.plantedDate || today();
  const cells = Array.isArray(req.body.cells) ? req.body.cells : [];
  if (!(await get('SELECT 1 FROM plants WHERE key = ?', [plantKey]))) {
    return res.status(400).json({ error: 'Unknown plant' });
  }
  const g = await bounds();
  const current = await all('SELECT row, col FROM plantings WHERE removed_date IS NULL');
  const occupied = new Set(current.map((c) => `${c.row},${c.col}`));
  const seen = new Set();
  const writes = [];
  let skipped = 0;
  for (const cell of cells) {
    const row = Number(cell.row), col = Number(cell.col);
    const k = `${row},${col}`;
    if (!Number.isInteger(row) || !Number.isInteger(col) || row < 0 || col < 0 || row >= g.rows || col >= g.cols) { skipped++; continue; }
    if (occupied.has(k) || seen.has(k)) { skipped++; continue; }
    seen.add(k);
    writes.push({ sql: 'INSERT INTO plantings (row, col, plant_key, planted_date) VALUES (?, ?, ?, ?)', args: [row, col, plantKey, plantedDate] });
  }
  if (writes.length) await batch(writes);
  res.json({ planted: writes.length, skipped });
}));

// Bulk-delete the current planting in many cells at once (hard delete, incl.
// their harvest entries). Empty cells in the selection are ignored.
router.post('/bulk-delete', asyncHandler(async (req, res) => {
  const cells = Array.isArray(req.body.cells) ? req.body.cells : [];
  if (cells.length === 0) return res.json({ deleted: 0 });
  const wanted = new Set(cells.map((c) => `${Number(c.row)},${Number(c.col)}`));
  const current = await all('SELECT id, row, col FROM plantings WHERE removed_date IS NULL');
  const ids = current.filter((c) => wanted.has(`${c.row},${c.col}`)).map((c) => c.id);
  if (ids.length === 0) return res.json({ deleted: 0 });
  const ph = ids.map(() => '?').join(',');
  await batch([
    { sql: `DELETE FROM harvest_entries WHERE planting_id IN (${ph})`, args: ids },
    { sql: `DELETE FROM plantings WHERE id IN (${ph})`, args: ids }
  ]);
  res.json({ deleted: ids.length });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const p = await plantingDetail(Number(req.params.id));
  if (!p) return res.status(404).json({ error: 'Planting not found' });
  res.json(p);
}));

router.patch('/:id/move', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const row = Number(req.body.row);
  const col = Number(req.body.col);
  const p = await get('SELECT * FROM plantings WHERE id = ?', [id]);
  if (!p) return res.status(404).json({ error: 'Planting not found' });
  if (p.removed_date) return res.status(409).json({ error: 'Cannot move a removed planting' });
  if (!(await inBounds(row, col))) return res.status(400).json({ error: 'Target cell is out of bounds' });
  const occupant = await currentAt(row, col);
  if (occupant && occupant.id !== id) return res.status(409).json({ error: 'Target cell is already planted' });

  await run('UPDATE plantings SET row = ?, col = ? WHERE id = ?', [row, col, id]);
  const plantedYear = p.planted_date ? Number(p.planted_date.slice(0, 4)) : null;
  res.json({
    planting: await plantingDetail(id),
    companion: await checkPlacement({ row, col, plantKey: p.plant_key, excludePlantingId: id }),
    rotation: await checkRotation({ row, col, plantKey: p.plant_key, plantedYear, excludePlantingId: id })
  });
}));

router.post('/:id/remove', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const removedDate = req.body.removedDate || today();
  if (!(await get('SELECT 1 FROM plantings WHERE id = ?', [id]))) return res.status(404).json({ error: 'Planting not found' });
  await run('UPDATE plantings SET removed_date = ? WHERE id = ?', [removedDate, id]);
  res.json(await plantingDetail(id));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!(await get('SELECT 1 FROM plantings WHERE id = ?', [id]))) return res.status(404).json({ error: 'Planting not found' });
  // Explicitly remove harvest entries too (FK cascade isn't guaranteed on libSQL).
  await batch([
    { sql: 'DELETE FROM harvest_entries WHERE planting_id = ?', args: [id] },
    { sql: 'DELETE FROM plantings WHERE id = ?', args: [id] }
  ]);
  res.json({ deleted: true });
}));

export default router;
