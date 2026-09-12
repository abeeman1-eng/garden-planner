// Companion-planting engine (spec 3.2). Given a plant placed in a cell, it checks
// the 8 surrounding cells' current plantings against the curated rules and returns
// conflicts (bad) and beneficial neighbors (good). Rules are symmetric. It can
// also suggest good companions for an empty cell.

import { all, get } from '../db.js';

const NEIGHBOR_OFFSETS = [
  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],          [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1]
];

function getPlant(key) {
  return get('SELECT * FROM plants WHERE key = ?', [key]);
}

// Current planting (with plant info) at a cell, or null.
function currentPlantingAt(row, col) {
  return get(`
    SELECT p.id, p.row, p.col, p.plant_key,
           pl.name AS plant_name, pl.family, pl.family_label, pl.color
    FROM plantings p
    JOIN plants pl ON pl.key = p.plant_key
    WHERE p.row = ? AND p.col = ? AND p.removed_date IS NULL
    ORDER BY p.id DESC LIMIT 1
  `, [row, col]);
}

function matches(plant, type, value) {
  return type === 'plant' ? plant.key === value : plant.family === value;
}

// Relationship ('good'|'bad') + reason between two plants given preloaded rules,
// or null. A 'bad' rule wins over 'good'.
function relationshipBetween(plantA, plantB, rules) {
  let good = null;
  for (const r of rules) {
    const forward = matches(plantA, r.a_type, r.a_value) && matches(plantB, r.b_type, r.b_value);
    const reverse = matches(plantA, r.b_type, r.b_value) && matches(plantB, r.a_type, r.a_value);
    if (!forward && !reverse) continue;
    if (r.relationship === 'bad') return { relationship: 'bad', reason: r.reason };
    good = { relationship: 'good', reason: r.reason };
  }
  return good;
}

// Evaluate placing `plantKey` at (row, col). Optionally ignore one planting id.
export async function checkPlacement({ row, col, plantKey, excludePlantingId = null }) {
  const plant = await getPlant(plantKey);
  if (!plant) return { conflicts: [], goodNeighbors: [] };
  const rules = await all('SELECT * FROM companion_rules');

  const conflicts = [];
  const goodNeighbors = [];
  for (const [dr, dc] of NEIGHBOR_OFFSETS) {
    const neighbor = await currentPlantingAt(row + dr, col + dc);
    if (!neighbor || neighbor.id === excludePlantingId) continue;
    const rel = relationshipBetween(plant, { key: neighbor.plant_key, family: neighbor.family }, rules);
    if (!rel) continue;
    const entry = { row: neighbor.row, col: neighbor.col, plantKey: neighbor.plant_key, plantName: neighbor.plant_name, reason: rel.reason };
    if (rel.relationship === 'bad') conflicts.push(entry);
    else goodNeighbors.push(entry);
  }
  return { conflicts, goodNeighbors };
}

// For an empty cell, suggest plant keys that would be a GOOD companion to at least
// one current neighbor and conflict with none (spec 3.2 suggestions).
export async function suggestForCell({ row, col }) {
  const neighbors = [];
  for (const [dr, dc] of NEIGHBOR_OFFSETS) {
    const n = await currentPlantingAt(row + dr, col + dc);
    if (n) neighbors.push(n);
  }
  if (neighbors.length === 0) return [];

  const rules = await all('SELECT * FROM companion_rules');
  const plants = await all('SELECT * FROM plants');
  const suggestions = [];
  for (const candidate of plants) {
    let hasGood = false, hasBad = false;
    const reasons = [];
    for (const n of neighbors) {
      const rel = relationshipBetween(candidate, { key: n.plant_key, family: n.family }, rules);
      if (!rel) continue;
      if (rel.relationship === 'bad') { hasBad = true; break; }
      hasGood = true;
      reasons.push({ neighbor: n.plant_name, reason: rel.reason });
    }
    if (hasGood && !hasBad) suggestions.push({ key: candidate.key, name: candidate.name, color: candidate.color, reasons });
  }
  return suggestions;
}
