// Static zone-specific config (spec 3.9 / 5). Zone 7b is fixed for this user.
// Frost dates and family rotation defaults live here so later modules
// (planting calendar, reminders) can read them without a live lookup.

export const ZONE = '7b';

// Average frost dates for zone 7b (month is 1-based). Adjust to your local
// microclimate if you track your own dates.
export const FROST_DATES = {
  lastSpringFrost: { month: 4, day: 15 },
  firstFallFrost: { month: 11, day: 15 }
};

// Default minimum years before the SAME plant family should reoccupy a cell
// (spec 3.3). Individual plants can override via `rotationYears` in plants.js;
// this is the fallback keyed by family, and DEFAULT_ROTATION_YEARS is the
// last-resort value for families not listed.
export const DEFAULT_ROTATION_YEARS = 3;

export const FAMILY_ROTATION_YEARS = {
  solanaceae: 3,
  brassicaceae: 4,
  cucurbitaceae: 3,
  fabaceae: 3,
  apiaceae: 3,
  amaryllidaceae: 3,
  asteraceae: 2,
  amaranthaceae: 3,
  poaceae: 2,
  lamiaceae: 2,
  rosaceae: 4,
  malvaceae: 2,
  convolvulaceae: 3,
  tropaeolaceae: 1,
  boraginaceae: 1,
  asparagaceae: 8,
  polygonaceae: 8,
  ericaceae: 8,
  vitaceae: 8,
  moraceae: 8
};

// Default starting grid size (spec 3.1).
export const DEFAULT_GRID = { rows: 10, cols: 20 };
