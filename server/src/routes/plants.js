// Reference plant list (read-only in v1; edited via data/plants.js + reseed).
import { Router } from 'express';
import { all, get } from '../db.js';
import { asyncHandler } from '../util.js';

const router = Router();

router.get('/', asyncHandler(async (_req, res) => {
  res.json(await all('SELECT * FROM plants ORDER BY category, name'));
}));

router.get('/:key', asyncHandler(async (req, res) => {
  const plant = await get('SELECT * FROM plants WHERE key = ?', [req.params.key]);
  if (!plant) return res.status(404).json({ error: 'Plant not found' });
  res.json(plant);
}));

export default router;
