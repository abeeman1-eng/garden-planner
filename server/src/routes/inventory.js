// Seed / start inventory (spec 3.7). Items optionally link to a Plant so that
// (1) what's on hand and (2) what's been planted historically can both be shown.
import { Router } from 'express';
import { all, get, run } from '../db.js';
import { asyncHandler } from '../util.js';

const router = Router();

// View (2): what's been planted historically, aggregated from planting history.
router.get('/planted-history', asyncHandler(async (_req, res) => {
  res.json(await all(`
    SELECT p.plant_key, pl.name AS plant_name, pl.color,
           COUNT(*) AS times_planted,
           MIN(p.planted_date) AS first_planted,
           MAX(p.planted_date) AS last_planted,
           SUM(CASE WHEN p.removed_date IS NULL THEN 1 ELSE 0 END) AS currently_growing
    FROM plantings p
    JOIN plants pl ON pl.key = p.plant_key
    GROUP BY p.plant_key
    ORDER BY last_planted DESC
  `));
}));

// View (1): what's currently on hand.
router.get('/', asyncHandler(async (_req, res) => {
  res.json(await all(`
    SELECT i.*, pl.name AS plant_name, pl.color
    FROM inventory_items i
    LEFT JOIN plants pl ON pl.key = i.plant_key
    ORDER BY i.name
  `));
}));

router.post('/', asyncHandler(async (req, res) => {
  const { name, variety, quantity, unit, acquiredDate, expirationDate, plantKey, notes } = req.body;
  if (!name || !String(name).trim()) return res.status(400).json({ error: 'name is required' });
  const info = await run(`
    INSERT INTO inventory_items (name, variety, quantity, unit, acquired_date, expiration_date, plant_key, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [String(name).trim(), variety || null, quantity != null ? Number(quantity) : null, unit || null,
      acquiredDate || null, expirationDate || null, plantKey || null, notes || null]);
  res.status(201).json(await get('SELECT * FROM inventory_items WHERE id = ?', [info.lastInsertRowid]));
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await get('SELECT * FROM inventory_items WHERE id = ?', [id]);
  if (!existing) return res.status(404).json({ error: 'Item not found' });
  const { name, variety, quantity, unit, acquiredDate, expirationDate, plantKey, notes } = req.body;
  await run(`
    UPDATE inventory_items SET name = ?, variety = ?, quantity = ?, unit = ?,
      acquired_date = ?, expiration_date = ?, plant_key = ?, notes = ? WHERE id = ?
  `, [
    name != null ? String(name).trim() : existing.name,
    variety ?? existing.variety,
    quantity != null ? Number(quantity) : existing.quantity,
    unit ?? existing.unit,
    acquiredDate ?? existing.acquired_date,
    expirationDate ?? existing.expiration_date,
    plantKey ?? existing.plant_key,
    notes ?? existing.notes,
    id
  ]);
  res.json(await get('SELECT * FROM inventory_items WHERE id = ?', [id]));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const info = await run('DELETE FROM inventory_items WHERE id = ?', [Number(req.params.id)]);
  if (info.rowsAffected === 0) return res.status(404).json({ error: 'Item not found' });
  res.json({ deleted: true });
}));

export default router;
