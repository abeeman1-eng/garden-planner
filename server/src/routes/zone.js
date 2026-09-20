// USDA hardiness zone lookup by ZIP code (spec 3.9 support). Proxies the free
// phzmapi.org service (no API key) so the browser isn't blocked by CORS and we
// can normalize errors. Returns { zip, zone, temperatureRange }.
import { Router } from 'express';
import { asyncHandler } from '../util.js';

const router = Router();

router.get('/:zip', asyncHandler(async (req, res) => {
  const zip = String(req.params.zip || '').trim();
  if (!/^\d{5}$/.test(zip)) {
    return res.status(400).json({ error: 'Enter a 5-digit US ZIP code.' });
  }

  let upstream;
  try {
    upstream = await fetch(`https://phzmapi.org/${zip}.json`, {
      signal: AbortSignal.timeout(10000),
      headers: { accept: 'application/json' }
    });
  } catch {
    return res.status(502).json({ error: 'Could not reach the zone lookup service. Try again in a moment.' });
  }

  if (upstream.status === 404) {
    return res.status(404).json({ error: `No hardiness zone found for ZIP ${zip}.` });
  }
  if (!upstream.ok) {
    return res.status(502).json({ error: 'Zone lookup service returned an error.' });
  }

  const data = await upstream.json();
  res.json({ zip, zone: data.zone, temperatureRange: data.temperature_range ?? null });
}));

export default router;
