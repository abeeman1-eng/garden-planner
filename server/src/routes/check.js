// Preview endpoint: evaluate companion + rotation for a candidate placement
// WITHOUT committing it, so the UI can warn before/at the moment of planting.
import { Router } from 'express';
import { checkPlacement } from '../services/companion.js';
import { checkRotation } from '../services/rotation.js';
import { asyncHandler } from '../util.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const row = Number(req.query.row);
  const col = Number(req.query.col);
  const plantKey = String(req.query.plantKey || '');
  const plantedYear = req.query.plantedYear ? Number(req.query.plantedYear) : null;
  const excludePlantingId = req.query.excludePlantingId ? Number(req.query.excludePlantingId) : null;

  if (!Number.isInteger(row) || !Number.isInteger(col) || !plantKey) {
    return res.status(400).json({ error: 'row, col and plantKey are required' });
  }

  res.json({
    companion: await checkPlacement({ row, col, plantKey, excludePlantingId }),
    rotation: await checkRotation({ row, col, plantKey, plantedYear, excludePlantingId })
  });
}));

export default router;
