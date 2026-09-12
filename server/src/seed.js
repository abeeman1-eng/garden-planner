// Seeds curated reference data (plants + companion rules) and ensures the single
// garden record exists. Safe to run repeatedly: reference tables are refreshed to
// match the data files; user data (plantings/inventory/harvests) is untouched.
//
// Exposed as seed() so the server can auto-seed on first startup (important in the
// cloud, where the database starts empty), and also runnable directly: npm run seed.

import { fileURLToPath } from 'node:url';
import { db, get, run, initSchema } from './db.js';
import { PLANTS } from './data/plants.js';
import { COMPANION_RULES } from './data/companionRules.js';
import { DEFAULT_GRID, ZONE } from './data/config.js';

export async function seed() {
  await initSchema();

  const writes = [];
  for (const p of PLANTS) {
    writes.push({
      sql: `INSERT INTO plants (key, name, family, family_label, category, color, rotation_years, sun, spacing_inches, plant_window)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET
              name=excluded.name, family=excluded.family, family_label=excluded.family_label,
              category=excluded.category, color=excluded.color, rotation_years=excluded.rotation_years,
              sun=excluded.sun, spacing_inches=excluded.spacing_inches, plant_window=excluded.plant_window`,
      args: [p.key, p.name, p.family, p.familyLabel, p.category, p.color,
             p.rotationYears ?? null, p.sun ?? null, p.spacingInches ?? null, p.plantWindow7b ?? null]
    });
  }

  writes.push({ sql: 'DELETE FROM companion_rules', args: [] });
  for (const r of COMPANION_RULES) {
    const [aType, aValue] = r.a.plant ? ['plant', r.a.plant] : ['family', r.a.family];
    const [bType, bValue] = r.b.plant ? ['plant', r.b.plant] : ['family', r.b.family];
    writes.push({
      sql: 'INSERT INTO companion_rules (a_type, a_value, b_type, b_value, relationship, reason) VALUES (?, ?, ?, ?, ?, ?)',
      args: [aType, aValue, bType, bValue, r.relationship, r.reason]
    });
  }

  await db.batch(writes, 'write');

  if (!(await get('SELECT id FROM garden WHERE id = 1'))) {
    await run('INSERT INTO garden (id, rows, cols, zone) VALUES (1, ?, ?, ?)', [DEFAULT_GRID.rows, DEFAULT_GRID.cols, ZONE]);
  }

  const plants = (await get('SELECT COUNT(*) AS n FROM plants')).n;
  const rules = (await get('SELECT COUNT(*) AS n FROM companion_rules')).n;
  return { plants, rules };
}

// Run directly via `npm run seed`.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed()
    .then(({ plants, rules }) => { console.log(`Seed complete: ${plants} plants, ${rules} companion rules.`); process.exit(0); })
    .catch((e) => { console.error(e); process.exit(1); });
}
