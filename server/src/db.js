// Data layer using libSQL (@libsql/client). One code path works both:
//   - locally: a file database (file:server/src/data/garden.db)
//   - in the cloud: a managed Turso database, via env vars
//     TURSO_DATABASE_URL (libsql://...) and TURSO_AUTH_TOKEN
//
// libSQL is SQLite-compatible, so the SQL is unchanged from a plain SQLite app;
// the only difference is that queries are async (await).

import { createClient } from '@libsql/client';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function buildClient() {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) {
    // Cloud / managed database.
    return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  }
  // Local file database (developer machine / self-hosted).
  const dataDir = join(__dirname, 'data');
  mkdirSync(dataDir, { recursive: true });
  const file = process.env.GARDEN_DB_PATH || join(dataDir, 'garden.db');
  return createClient({ url: `file:${file}` });
}

export const db = buildClient();

// --- Small async query helpers (keep call sites readable) ---
export async function all(sql, args = []) {
  const rs = await db.execute({ sql, args });
  return rs.rows;
}
export async function get(sql, args = []) {
  const rs = await db.execute({ sql, args });
  return rs.rows[0] ?? null;
}
export async function run(sql, args = []) {
  const rs = await db.execute({ sql, args });
  return { lastInsertRowid: rs.lastInsertRowid != null ? Number(rs.lastInsertRowid) : null, rowsAffected: rs.rowsAffected };
}
// Atomic multi-statement write. `writes` is an array of { sql, args }.
export async function batch(writes) {
  return db.batch(writes, 'write');
}

const SCHEMA_VERSION = 1;

// Tables are ordered so foreign-key targets are created before the tables that
// reference them (plants + inventory_items before plantings; plantings before
// harvest_entries).
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS meta (
    key   TEXT PRIMARY KEY,
    value TEXT
  );
  CREATE TABLE IF NOT EXISTS garden (
    id   INTEGER PRIMARY KEY CHECK (id = 1),
    rows INTEGER NOT NULL,
    cols INTEGER NOT NULL,
    zone TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS plants (
    key            TEXT PRIMARY KEY,
    name           TEXT NOT NULL,
    family         TEXT NOT NULL,
    family_label   TEXT NOT NULL,
    category       TEXT NOT NULL,
    color          TEXT NOT NULL,
    rotation_years INTEGER,
    sun            TEXT,
    spacing_inches INTEGER,
    plant_window   TEXT
  );
  CREATE TABLE IF NOT EXISTS inventory_items (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    variety         TEXT,
    quantity        REAL,
    unit            TEXT,
    acquired_date   TEXT,
    expiration_date TEXT,
    plant_key       TEXT REFERENCES plants(key),
    notes           TEXT
  );
  CREATE TABLE IF NOT EXISTS companion_rules (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    a_type       TEXT NOT NULL,
    a_value      TEXT NOT NULL,
    b_type       TEXT NOT NULL,
    b_value      TEXT NOT NULL,
    relationship TEXT NOT NULL,
    reason       TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS plantings (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    row          INTEGER NOT NULL,
    col          INTEGER NOT NULL,
    plant_key    TEXT NOT NULL REFERENCES plants(key),
    planted_date TEXT NOT NULL,
    removed_date TEXT,
    notes        TEXT,
    inventory_item_id INTEGER REFERENCES inventory_items(id)
  );
  CREATE INDEX IF NOT EXISTS idx_plantings_cell ON plantings(row, col);
  CREATE INDEX IF NOT EXISTS idx_plantings_current ON plantings(row, col, removed_date);
  CREATE TABLE IF NOT EXISTS harvest_entries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    planting_id INTEGER NOT NULL REFERENCES plantings(id) ON DELETE CASCADE,
    date        TEXT NOT NULL,
    note        TEXT,
    photo       BLOB,
    photo_mime  TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_harvest_planting ON harvest_entries(planting_id);
`;

export async function initSchema() {
  await db.executeMultiple(SCHEMA);
  const row = await get('SELECT value FROM meta WHERE key = ?', ['schema_version']);
  const version = row ? Number(row.value) : 0;
  // (Future migrations go here: `if (version < 2) { await db.executeMultiple(...) }`.)
  await run('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', ['schema_version', String(SCHEMA_VERSION)]);
}
