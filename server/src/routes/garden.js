// Garden config + full grid state (spec 3.1). GET returns dimensions plus every
// occupied cell with its current planting and any companion/rotation flags.
import { Router } from 'express';
import { all, get, run } from '../db.js';
import { checkPlacement } from '../services/companion.js';
import { checkRotation } from '../services/rotation.js';
import { asyncHandler } from '../util.js';

const router = Router();

const getGarden = () => get('SELECT rows, cols, zone FROM garden WHERE id = 1');

router.get('/', asyncHandler(async (_req, res) => {
  const garden = await getGarden();

  const current = await all(`
    SELECT p.id, p.row, p.col, p.plant_key, p.planted_date, p.notes,
           pl.name AS plant_name, pl.color, pl.family, pl.family_label, pl.category
    FROM plantings p
    JOIN plants pl ON pl.key = p.plant_key
    WHERE p.removed_date IS NULL
  `);

  const cells = await Promise.all(current.map(async (pl) => {
    const plantedYear = pl.planted_date ? Number(pl.planted_date.slice(0, 4)) : null;
    const [companion, rotation] = await Promise.all([
      checkPlacement({ row: pl.row, col: pl.col, plantKey: pl.plant_key, excludePlantingId: pl.id }),
      checkRotation({ row: pl.row, col: pl.col, plantKey: pl.plant_key, plantedYear, excludePlantingId: pl.id })
    ]);
    return {
      row: pl.row,
      col: pl.col,
      planting: {
        id: pl.id, plantKey: pl.plant_key, plantName: pl.plant_name,
        color: pl.color, family: pl.family, familyLabel: pl.family_label,
        category: pl.category, plantedDate: pl.planted_date, notes: pl.notes
      },
      companionConflicts: companion.conflicts,
      goodNeighbors: companion.goodNeighbors,
      rotationConflict: rotation.conflict ? rotation : null
    };
  }));

  res.json({ ...garden, cells });
}));

router.put('/', asyncHandler(async (req, res) => {
  const rows = Number(req.body.rows);
  const cols = Number(req.body.cols);
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || cols < 1 || rows > 100 || cols > 100) {
    return res.status(400).json({ error: 'rows and cols must be integers between 1 and 100' });
  }

  const orphaned = (await get(
    'SELECT COUNT(*) AS n FROM plantings WHERE removed_date IS NULL AND (row >= ? OR col >= ?)',
    [rows, cols]
  )).n;
  if (orphaned > 0) {
    return res.status(409).json({
      error: `Resize would hide ${orphaned} active planting(s) outside the new ${rows}×${cols} grid. Remove or move them first.`
    });
  }

  await run('UPDATE garden SET rows = ?, cols = ? WHERE id = 1', [rows, cols]);
  res.json(await getGarden());
}));

// Update the hardiness zone (e.g. after a ZIP lookup).
router.put('/zone', asyncHandler(async (req, res) => {
  const zone = String(req.body.zone || '').trim();
  if (!zone || zone.length > 12) return res.status(400).json({ error: 'Invalid zone' });
  await run('UPDATE garden SET zone = ? WHERE id = 1', [zone]);
  res.json(await getGarden());
}));

export default router;
