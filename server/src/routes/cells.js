// Per-cell detail: current planting, full planting history, and companion
// suggestions for empty cells (spec 3.3/3.5).
import { Router } from 'express';
import { all, get } from '../db.js';
import { suggestForCell } from '../services/companion.js';
import { asyncHandler } from '../util.js';

const router = Router();

router.get('/:row/:col/suggestions', asyncHandler(async (req, res) => {
  res.json(await suggestForCell({ row: Number(req.params.row), col: Number(req.params.col) }));
}));

router.get('/:row/:col', asyncHandler(async (req, res) => {
  const row = Number(req.params.row);
  const col = Number(req.params.col);

  const history = await all(`
    SELECT p.id, p.plant_key, p.planted_date, p.removed_date, p.notes,
           pl.name AS plant_name, pl.color, pl.family, pl.family_label
    FROM plantings p
    JOIN plants pl ON pl.key = p.plant_key
    WHERE p.row = ? AND p.col = ?
    ORDER BY p.planted_date DESC, p.id DESC
  `, [row, col]);

  const current = history.find((h) => h.removed_date === null) || null;

  // Attach harvest entries per planting. Photos are served from the DB via URL.
  for (const h of history) {
    const rows = await all(
      'SELECT id, date, note, (photo IS NOT NULL) AS has_photo FROM harvest_entries WHERE planting_id = ? ORDER BY date DESC, id DESC',
      [h.id]
    );
    h.harvests = rows.map((r) => ({
      id: r.id, date: r.date, note: r.note,
      photo_path: r.has_photo ? `/api/harvests/${r.id}/photo` : null
    }));
  }

  res.json({ row, col, current, history });
}));

export default router;
