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
