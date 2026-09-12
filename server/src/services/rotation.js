// Crop-rotation tracking at the individual cell level (spec 3.3). Each cell's
// planting history is scanned for the same plant family; if that family occupied
// the cell more recently than the required interval, a warning is returned.

import { all, get } from '../db.js';
import { FAMILY_ROTATION_YEARS, DEFAULT_ROTATION_YEARS } from '../data/config.js';

function yearOf(isoDate) {
  return isoDate ? Number(String(isoDate).slice(0, 4)) : null;
}

function requiredYearsFor(plant) {
  if (plant.rotation_years != null) return plant.rotation_years;
  if (FAMILY_ROTATION_YEARS[plant.family] != null) return FAMILY_ROTATION_YEARS[plant.family];
  return DEFAULT_ROTATION_YEARS;
}

export async function checkRotation({ row, col, plantKey, plantedYear, excludePlantingId = null }) {
  const plant = await get('SELECT * FROM plants WHERE key = ?', [plantKey]);
  if (!plant) return { conflict: false };

  const seasonYear = plantedYear ?? new Date().getFullYear();
  const requiredYears = requiredYearsFor(plant);

  const history = await all(`
    SELECT p.id, p.plant_key, p.planted_date, p.removed_date, pl.name AS plant_name
    FROM plantings p
    JOIN plants pl ON pl.key = p.plant_key
    WHERE p.row = ? AND p.col = ? AND pl.family = ?
    ORDER BY p.planted_date DESC
  `, [row, col, plant.family]);

  let lastGrownYear = null;
  let lastPlantName = null;
  for (const h of history) {
    if (h.id === excludePlantingId) continue;
    const y = yearOf(h.planted_date);
    if (y != null && (lastGrownYear == null || y > lastGrownYear)) {
      lastGrownYear = y;
      lastPlantName = h.plant_name;
    }
  }

  if (lastGrownYear == null) {
    return { conflict: false, family: plant.family, familyLabel: plant.family_label, requiredYears };
  }

  const gapYears = seasonYear - lastGrownYear;
  const conflict = gapYears < requiredYears;
  return {
    conflict,
    family: plant.family,
    familyLabel: plant.family_label,
    requiredYears,
    lastGrownYear,
    lastPlantName,
    gapYears,
    message: conflict
      ? `${plant.family_label} was grown in this cell in ${lastGrownYear} (${lastPlantName}). Recommended to wait ${requiredYears} years; only ${gapYears} have passed.`
      : null
  };
}
