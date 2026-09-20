// Express entry point. Serves the JSON API under /api and (in production) the
// built React client. Data lives in libSQL (local file or cloud Turso).

import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

import { initSchema } from './db.js';
import { seed } from './seed.js';
import plantsRouter from './routes/plants.js';
import gardenRouter from './routes/garden.js';
import cellsRouter from './routes/cells.js';
import plantingsRouter from './routes/plantings.js';
import harvestsRouter from './routes/harvests.js';
import inventoryRouter from './routes/inventory.js';
import checkRouter from './routes/check.js';
import zoneRouter from './routes/zone.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

async function start() {
  await initSchema();

  // Apply curated reference data on every startup. seed() upserts plants and
  // rebuilds companion rules (idempotent) and never touches user data, so new
  // crops/rules ship automatically on deploy while the garden is preserved.
  const { plants, rules } = await seed();
  console.log(`Reference data ready: ${plants} plants, ${rules} companion rules.`);

  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.use('/api/plants', plantsRouter);
  app.use('/api/garden', gardenRouter);
  app.use('/api/cells', cellsRouter);
  app.use('/api/plantings', plantingsRouter);
  app.use('/api/harvests', harvestsRouter);
  app.use('/api/inventory', inventoryRouter);
  app.use('/api/check', checkRouter);
  app.use('/api/zone', zoneRouter);
  app.get('/api/health', (_req, res) => res.json({ ok: true, zone: '7b' }));

  // Serve the built client in production (npm run build -> client/dist).
  const CLIENT_DIST = join(__dirname, '..', '..', 'client', 'dist');
  if (existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST));
    app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(join(CLIENT_DIST, 'index.html')));
  }

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  });

  app.listen(PORT, () => {
    console.log(`Garden Planner API listening on http://localhost:${PORT}`);
    if (!existsSync(CLIENT_DIST)) {
      console.log('(client/dist not found — run `npm run build` for the production UI, or `npm run dev` for the dev server.)');
    }
  });
}

start().catch((e) => { console.error('Failed to start:', e); process.exit(1); });
