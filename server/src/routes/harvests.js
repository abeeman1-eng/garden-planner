// Harvest log (spec 3.5): free-form notes + optional photo per planting.
// Photos are stored in the database (durable on any host) and served from
// /api/harvests/:id/photo. Chronological, filterable by crop or cell.
import { Router } from 'express';
import multer from 'multer';
import { all, get, run } from '../db.js';
import { asyncHandler } from '../util.js';

// Keep uploads in memory so we can write the bytes straight into the DB.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/'))
});

const router = Router();
const today = () => new Date().toISOString().slice(0, 10);

router.get('/', asyncHandler(async (req, res) => {
  const filters = [];
  const params = [];
  if (req.query.plantingId) { filters.push('h.planting_id = ?'); params.push(Number(req.query.plantingId)); }
  if (req.query.plantKey) { filters.push('p.plant_key = ?'); params.push(String(req.query.plantKey)); }
  if (req.query.row !== undefined && req.query.col !== undefined) {
    filters.push('p.row = ? AND p.col = ?');
    params.push(Number(req.query.row), Number(req.query.col));
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const rows = await all(`
    SELECT h.id, h.planting_id, h.date, h.note, (h.photo IS NOT NULL) AS has_photo,
           p.row, p.col, p.plant_key, p.planted_date,
           pl.name AS plant_name, pl.color
    FROM harvest_entries h
    JOIN plantings p ON p.id = h.planting_id
    JOIN plants pl ON pl.key = p.plant_key
    ${where}
    ORDER BY h.date DESC, h.id DESC
  `, params);

  res.json(rows.map((r) => ({
    ...r,
    photo_path: r.has_photo ? `/api/harvests/${r.id}/photo` : null
  })));
}));

// Serve a harvest photo from the DB.
router.get('/:id/photo', asyncHandler(async (req, res) => {
  const row = await get('SELECT photo, photo_mime FROM harvest_entries WHERE id = ?', [Number(req.params.id)]);
  if (!row || !row.photo) return res.status(404).json({ error: 'No photo' });
  res.set('Content-Type', row.photo_mime || 'application/octet-stream');
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(Buffer.from(row.photo));
}));

router.post('/', upload.single('photo'), asyncHandler(async (req, res) => {
  const plantingId = Number(req.body.plantingId);
  const date = req.body.date || today();
  const note = req.body.note ?? null;
  if (!(await get('SELECT 1 FROM plantings WHERE id = ?', [plantingId]))) {
    return res.status(400).json({ error: 'Unknown planting' });
  }
  const photo = req.file ? req.file.buffer : null;
  const mime = req.file ? req.file.mimetype : null;
  const info = await run(
    'INSERT INTO harvest_entries (planting_id, date, note, photo, photo_mime) VALUES (?, ?, ?, ?, ?)',
    [plantingId, date, note, photo, mime]
  );
  res.status(201).json({ id: info.lastInsertRowid, planting_id: plantingId, date, note, photo_path: photo ? `/api/harvests/${info.lastInsertRowid}/photo` : null });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const info = await run('DELETE FROM harvest_entries WHERE id = ?', [Number(req.params.id)]);
  if (info.rowsAffected === 0) return res.status(404).json({ error: 'Harvest entry not found' });
  res.json({ deleted: true });
}));

export default router;
