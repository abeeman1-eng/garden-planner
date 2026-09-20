// Curated plant reference data for a zone 7b home garden.
// This is domain knowledge shipped with the app (per spec 3.2 / 5), not user-entered.
// Extend freely: add rows here and re-run `npm run seed`. The `key` is a stable slug
// used to link companion rules, inventory items, and (later) encyclopedia entries.
//
// Fields:
//   key            stable slug (lowercase, hyphenated) — do not change once shipped
//   name           display name
//   family         botanical family slug (drives rotation grouping)
//   familyLabel    human-readable family name (shown in warnings)
//   category       vegetable | herb | fruit | flower
//   color          hex used for the cell badge on the grid
//   rotationYears  min years before the SAME family should reoccupy a cell
//                  (falls back to the family default in frostDates/config if null)
//   sun            light preference (reference only for now)
//   spacingInches  in-row spacing guidance (reference only for now)
//   plantWindow7b  free-text planting window for zone 7b (reference only for now)

export const PLANTS = [
  // --- Solanaceae (nightshades) ---
  { key: 'tomato',   name: 'Tomato',   family: 'solanaceae', familyLabel: 'Nightshades (Solanaceae)', category: 'vegetable', color: '#e2504f', rotationYears: 3, sun: 'full', spacingInches: 24, plantWindow7b: 'Transplant after last frost (~Apr 15); start seed indoors ~6 wks prior.' },
  { key: 'pepper',   name: 'Pepper',   family: 'solanaceae', familyLabel: 'Nightshades (Solanaceae)', category: 'vegetable', color: '#e07b39', rotationYears: 3, sun: 'full', spacingInches: 18, plantWindow7b: 'Transplant 2 wks after last frost when soil is warm.' },
  { key: 'eggplant', name: 'Eggplant', family: 'solanaceae', familyLabel: 'Nightshades (Solanaceae)', category: 'vegetable', color: '#7d5ba6', rotationYears: 3, sun: 'full', spacingInches: 24, plantWindow7b: 'Transplant 2 wks after last frost; loves heat.' },
  { key: 'potato',   name: 'Potato',   family: 'solanaceae', familyLabel: 'Nightshades (Solanaceae)', category: 'vegetable', color: '#c9a66b', rotationYears: 3, sun: 'full', spacingInches: 12, plantWindow7b: 'Plant seed potatoes 2–4 wks before last frost.' },

  // --- Brassicaceae (cole crops) ---
  { key: 'broccoli',      name: 'Broccoli',        family: 'brassicaceae', familyLabel: 'Brassicas (Brassicaceae)', category: 'vegetable', color: '#3f8f5b', rotationYears: 4, sun: 'full', spacingInches: 18, plantWindow7b: 'Spring: transplant 2–4 wks before last frost. Fall: transplant late summer.' },
  { key: 'cabbage',       name: 'Cabbage',         family: 'brassicaceae', familyLabel: 'Brassicas (Brassicaceae)', category: 'vegetable', color: '#6fae7a', rotationYears: 4, sun: 'full', spacingInches: 18, plantWindow7b: 'Spring & fall crop; transplant in cool weather.' },
  { key: 'kale',          name: 'Kale',            family: 'brassicaceae', familyLabel: 'Brassicas (Brassicaceae)', category: 'vegetable', color: '#2f6f4f', rotationYears: 4, sun: 'full', spacingInches: 12, plantWindow7b: 'Very cold-hardy; spring and fall. Sweetens after frost.' },
  { key: 'brussels',      name: 'Brussels Sprouts',family: 'brassicaceae', familyLabel: 'Brassicas (Brassicaceae)', category: 'vegetable', color: '#4f8f66', rotationYears: 4, sun: 'full', spacingInches: 24, plantWindow7b: 'Long season; transplant midsummer for fall harvest.' },
  { key: 'cauliflower',   name: 'Cauliflower',     family: 'brassicaceae', familyLabel: 'Brassicas (Brassicaceae)', category: 'vegetable', color: '#8fbf8f', rotationYears: 4, sun: 'full', spacingInches: 18, plantWindow7b: 'Fussy about heat; best as a fall crop in 7b.' },
  { key: 'radish',        name: 'Radish',          family: 'brassicaceae', familyLabel: 'Brassicas (Brassicaceae)', category: 'vegetable', color: '#d95c7a', rotationYears: 2, sun: 'full', spacingInches: 2,  plantWindow7b: 'Direct sow early spring & fall; fast (~4 wks).' },
  { key: 'turnip',        name: 'Turnip',          family: 'brassicaceae', familyLabel: 'Brassicas (Brassicaceae)', category: 'vegetable', color: '#b98fb0', rotationYears: 3, sun: 'full', spacingInches: 4,  plantWindow7b: 'Direct sow spring & late summer.' },

  // --- Cucurbitaceae ---
  { key: 'cucumber', name: 'Cucumber', family: 'cucurbitaceae', familyLabel: 'Cucurbits (Cucurbitaceae)', category: 'vegetable', color: '#4faf6f', rotationYears: 3, sun: 'full', spacingInches: 12, plantWindow7b: 'Direct sow / transplant after last frost when soil is warm.' },
  { key: 'zucchini', name: 'Zucchini', family: 'cucurbitaceae', familyLabel: 'Cucurbits (Cucurbitaceae)', category: 'vegetable', color: '#5fa050', rotationYears: 3, sun: 'full', spacingInches: 24, plantWindow7b: 'Direct sow after last frost; very productive.' },
  { key: 'squash',   name: 'Winter Squash', family: 'cucurbitaceae', familyLabel: 'Cucurbits (Cucurbitaceae)', category: 'vegetable', color: '#d99a3f', rotationYears: 3, sun: 'full', spacingInches: 36, plantWindow7b: 'Direct sow after last frost; needs room to sprawl.' },
  { key: 'melon',    name: 'Melon',    family: 'cucurbitaceae', familyLabel: 'Cucurbits (Cucurbitaceae)', category: 'fruit', color: '#e0a55f', rotationYears: 3, sun: 'full', spacingInches: 36, plantWindow7b: 'Direct sow / transplant well after last frost; needs heat.' },
  { key: 'pumpkin',  name: 'Pumpkin',  family: 'cucurbitaceae', familyLabel: 'Cucurbits (Cucurbitaceae)', category: 'vegetable', color: '#e08a2f', rotationYears: 3, sun: 'full', spacingInches: 48, plantWindow7b: 'Direct sow early summer for fall harvest.' },

  // --- Fabaceae (legumes) ---
  { key: 'bush-bean', name: 'Bush Bean', family: 'fabaceae', familyLabel: 'Legumes (Fabaceae)', category: 'vegetable', color: '#7fae4f', rotationYears: 3, sun: 'full', spacingInches: 4, plantWindow7b: 'Direct sow after last frost; succession every 2–3 wks.' },
  { key: 'pole-bean', name: 'Pole Bean', family: 'fabaceae', familyLabel: 'Legumes (Fabaceae)', category: 'vegetable', color: '#6f9e3f', rotationYears: 3, sun: 'full', spacingInches: 6, plantWindow7b: 'Direct sow after last frost; needs a trellis.' },
  { key: 'pea',       name: 'Pea',       family: 'fabaceae', familyLabel: 'Legumes (Fabaceae)', category: 'vegetable', color: '#8fbf5f', rotationYears: 3, sun: 'full', spacingInches: 2, plantWindow7b: 'Direct sow very early spring (Feb–Mar); cool-season.' },

  // --- Apiaceae (umbellifers) ---
  { key: 'carrot',   name: 'Carrot',   family: 'apiaceae', familyLabel: 'Umbellifers (Apiaceae)', category: 'vegetable', color: '#e08033', rotationYears: 3, sun: 'full', spacingInches: 2, plantWindow7b: 'Direct sow early spring & late summer; slow to germinate.' },
  { key: 'celery',   name: 'Celery',   family: 'apiaceae', familyLabel: 'Umbellifers (Apiaceae)', category: 'vegetable', color: '#9fbf5f', rotationYears: 3, sun: 'partial', spacingInches: 8, plantWindow7b: 'Transplant after last frost; long season, needs moisture.' },
  { key: 'dill',     name: 'Dill',     family: 'apiaceae', familyLabel: 'Umbellifers (Apiaceae)', category: 'herb', color: '#8fae4f', rotationYears: 2, sun: 'full', spacingInches: 8, plantWindow7b: 'Direct sow after last frost; self-seeds readily.' },
  { key: 'parsley',  name: 'Parsley',  family: 'apiaceae', familyLabel: 'Umbellifers (Apiaceae)', category: 'herb', color: '#5f9f4f', rotationYears: 2, sun: 'partial', spacingInches: 6, plantWindow7b: 'Transplant early spring; slow from seed.' },

  // --- Amaryllidaceae (alliums) ---
  { key: 'onion',   name: 'Onion',   family: 'amaryllidaceae', familyLabel: 'Alliums (Amaryllidaceae)', category: 'vegetable', color: '#c98fb8', rotationYears: 3, sun: 'full', spacingInches: 4, plantWindow7b: 'Plant sets/transplants early spring; choose intermediate-day types.' },
  { key: 'garlic',  name: 'Garlic',  family: 'amaryllidaceae', familyLabel: 'Alliums (Amaryllidaceae)', category: 'vegetable', color: '#bfa8c9', rotationYears: 3, sun: 'full', spacingInches: 6, plantWindow7b: 'Plant cloves in fall (Oct–Nov); harvest early summer.' },
  { key: 'leek',    name: 'Leek',    family: 'amaryllidaceae', familyLabel: 'Alliums (Amaryllidaceae)', category: 'vegetable', color: '#a9bf8f', rotationYears: 3, sun: 'full', spacingInches: 6, plantWindow7b: 'Transplant spring; long season, hill for white shanks.' },

  // --- Asteraceae ---
  { key: 'lettuce',   name: 'Lettuce',   family: 'asteraceae', familyLabel: 'Aster family (Asteraceae)', category: 'vegetable', color: '#7fbf5f', rotationYears: 2, sun: 'partial', spacingInches: 8, plantWindow7b: 'Direct sow / transplant early spring & fall; bolts in heat.' },
  { key: 'marigold',  name: 'Marigold',  family: 'asteraceae', familyLabel: 'Aster family (Asteraceae)', category: 'flower', color: '#f0a83f', rotationYears: 1, sun: 'full', spacingInches: 8, plantWindow7b: 'Transplant after last frost; classic pest-deterrent companion.' },
  { key: 'sunflower', name: 'Sunflower', family: 'asteraceae', familyLabel: 'Aster family (Asteraceae)', category: 'flower', color: '#f0c53f', rotationYears: 1, sun: 'full', spacingInches: 18, plantWindow7b: 'Direct sow after last frost.' },

  // --- Amaranthaceae (chenopods) ---
  { key: 'beet',    name: 'Beet',    family: 'amaranthaceae', familyLabel: 'Chenopods (Amaranthaceae)', category: 'vegetable', color: '#a63f5f', rotationYears: 3, sun: 'full', spacingInches: 3, plantWindow7b: 'Direct sow early spring & late summer.' },
  { key: 'chard',   name: 'Swiss Chard', family: 'amaranthaceae', familyLabel: 'Chenopods (Amaranthaceae)', category: 'vegetable', color: '#c94f6f', rotationYears: 3, sun: 'partial', spacingInches: 8, plantWindow7b: 'Direct sow spring; heat-tolerant, harvest all season.' },
  { key: 'spinach', name: 'Spinach', family: 'amaranthaceae', familyLabel: 'Chenopods (Amaranthaceae)', category: 'vegetable', color: '#3f7f4f', rotationYears: 3, sun: 'partial', spacingInches: 4, plantWindow7b: 'Direct sow very early spring & fall; cool-season.' },

  // --- Poaceae ---
  { key: 'corn', name: 'Sweet Corn', family: 'poaceae', familyLabel: 'Grasses (Poaceae)', category: 'vegetable', color: '#e6c84f', rotationYears: 2, sun: 'full', spacingInches: 10, plantWindow7b: 'Direct sow after last frost; plant in blocks for pollination.' },

  // --- Lamiaceae (mint family herbs) ---
  { key: 'basil',   name: 'Basil',   family: 'lamiaceae', familyLabel: 'Mint family (Lamiaceae)', category: 'herb', color: '#4faf5f', rotationYears: 2, sun: 'full', spacingInches: 10, plantWindow7b: 'Transplant after last frost when nights are warm.' },
  { key: 'oregano', name: 'Oregano', family: 'lamiaceae', familyLabel: 'Mint family (Lamiaceae)', category: 'herb', color: '#5f9f6f', rotationYears: 2, sun: 'full', spacingInches: 12, plantWindow7b: 'Perennial in 7b; transplant spring.' },
  { key: 'thyme',   name: 'Thyme',   family: 'lamiaceae', familyLabel: 'Mint family (Lamiaceae)', category: 'herb', color: '#7f9f5f', rotationYears: 2, sun: 'full', spacingInches: 10, plantWindow7b: 'Perennial in 7b; transplant spring.' },

  // --- Rosaceae ---
  { key: 'strawberry', name: 'Strawberry', family: 'rosaceae', familyLabel: 'Rose family (Rosaceae)', category: 'fruit', color: '#e0506f', rotationYears: 4, sun: 'full', spacingInches: 12, plantWindow7b: 'Plant crowns early spring; perennial bed.' },

  // --- Malvaceae ---
  { key: 'okra', name: 'Okra', family: 'malvaceae', familyLabel: 'Mallow family (Malvaceae)', category: 'vegetable', color: '#9fae4f', rotationYears: 2, sun: 'full', spacingInches: 12, plantWindow7b: 'Direct sow well after last frost; loves heat.' },

  // --- More Brassicas ---
  { key: 'kohlrabi',      name: 'Kohlrabi',       family: 'brassicaceae', familyLabel: 'Brassicas (Brassicaceae)', category: 'vegetable', color: '#7fae8f', rotationYears: 4, sun: 'full', spacingInches: 6,  plantWindow7b: 'Spring & fall; quick cool-season crop.' },
  { key: 'collards',      name: 'Collard Greens', family: 'brassicaceae', familyLabel: 'Brassicas (Brassicaceae)', category: 'vegetable', color: '#357a4f', rotationYears: 4, sun: 'full', spacingInches: 18, plantWindow7b: 'Very heat- and cold-tolerant; spring and fall.' },
  { key: 'mustard-greens',name: 'Mustard Greens', family: 'brassicaceae', familyLabel: 'Brassicas (Brassicaceae)', category: 'vegetable', color: '#8fbf5f', rotationYears: 3, sun: 'full', spacingInches: 6,  plantWindow7b: 'Direct sow spring & fall; fast growing.' },
  { key: 'bok-choy',      name: 'Bok Choy',       family: 'brassicaceae', familyLabel: 'Brassicas (Brassicaceae)', category: 'vegetable', color: '#9fce7f', rotationYears: 3, sun: 'partial', spacingInches: 6, plantWindow7b: 'Cool-season; bolts in heat. Spring & fall.' },
  { key: 'arugula',       name: 'Arugula',        family: 'brassicaceae', familyLabel: 'Brassicas (Brassicaceae)', category: 'vegetable', color: '#6fae4f', rotationYears: 2, sun: 'partial', spacingInches: 4, plantWindow7b: 'Direct sow early spring & fall; fast, peppery.' },
  { key: 'rutabaga',      name: 'Rutabaga',       family: 'brassicaceae', familyLabel: 'Brassicas (Brassicaceae)', category: 'vegetable', color: '#c89fb8', rotationYears: 3, sun: 'full', spacingInches: 6,  plantWindow7b: 'Direct sow midsummer for fall harvest.' },
  { key: 'horseradish',   name: 'Horseradish',    family: 'brassicaceae', familyLabel: 'Brassicas (Brassicaceae)', category: 'vegetable', color: '#b8a890', rotationYears: 4, sun: 'full', spacingInches: 18, plantWindow7b: 'Plant root cuttings spring; perennial, spreads.' },

  // --- More Umbellifers ---
  { key: 'cilantro',  name: 'Cilantro',  family: 'apiaceae', familyLabel: 'Umbellifers (Apiaceae)', category: 'herb', color: '#5fae5f', rotationYears: 2, sun: 'partial', spacingInches: 4, plantWindow7b: 'Cool-season; direct sow spring & fall, bolts in heat.' },
  { key: 'fennel',    name: 'Fennel',    family: 'apiaceae', familyLabel: 'Umbellifers (Apiaceae)', category: 'herb', color: '#a9c96f', rotationYears: 3, sun: 'full', spacingInches: 10, plantWindow7b: 'Direct sow spring; keep away from most vegetables.' },
  { key: 'parsnip',   name: 'Parsnip',   family: 'apiaceae', familyLabel: 'Umbellifers (Apiaceae)', category: 'vegetable', color: '#e6dab0', rotationYears: 3, sun: 'full', spacingInches: 4, plantWindow7b: 'Direct sow spring; long season, sweetens after frost.' },

  // --- More Alliums ---
  { key: 'shallot', name: 'Shallot', family: 'amaryllidaceae', familyLabel: 'Alliums (Amaryllidaceae)', category: 'vegetable', color: '#c99fb0', rotationYears: 3, sun: 'full', spacingInches: 6, plantWindow7b: 'Plant sets early spring or fall.' },
  { key: 'chives',  name: 'Chives',  family: 'amaryllidaceae', familyLabel: 'Alliums (Amaryllidaceae)', category: 'herb', color: '#b8a8d0', rotationYears: 2, sun: 'full', spacingInches: 8, plantWindow7b: 'Perennial in 7b; transplant spring.' },

  // --- More Cucurbits ---
  { key: 'watermelon',   name: 'Watermelon',   family: 'cucurbitaceae', familyLabel: 'Cucurbits (Cucurbitaceae)', category: 'fruit', color: '#4fae5f', rotationYears: 3, sun: 'full', spacingInches: 36, plantWindow7b: 'Direct sow well after last frost; needs heat & room.' },
  { key: 'yellow-squash',name: 'Yellow Squash',family: 'cucurbitaceae', familyLabel: 'Cucurbits (Cucurbitaceae)', category: 'vegetable', color: '#e6c84f', rotationYears: 3, sun: 'full', spacingInches: 24, plantWindow7b: 'Direct sow after last frost; very productive.' },

  // --- More Legumes ---
  { key: 'lima-bean', name: 'Lima Bean',        family: 'fabaceae', familyLabel: 'Legumes (Fabaceae)', category: 'vegetable', color: '#9fbf6f', rotationYears: 3, sun: 'full', spacingInches: 6, plantWindow7b: 'Direct sow after last frost; loves heat.' },
  { key: 'edamame',   name: 'Edamame (Soybean)',family: 'fabaceae', familyLabel: 'Legumes (Fabaceae)', category: 'vegetable', color: '#8fae4f', rotationYears: 3, sun: 'full', spacingInches: 4, plantWindow7b: 'Direct sow after last frost.' },
  { key: 'peanut',    name: 'Peanut',           family: 'fabaceae', familyLabel: 'Legumes (Fabaceae)', category: 'vegetable', color: '#d9c9a0', rotationYears: 3, sun: 'full', spacingInches: 8, plantWindow7b: 'Direct sow after last frost; long warm season.' },

  // --- More Solanaceae ---
  { key: 'tomatillo', name: 'Tomatillo', family: 'solanaceae', familyLabel: 'Nightshades (Solanaceae)', category: 'vegetable', color: '#a9c94f', rotationYears: 3, sun: 'full', spacingInches: 24, plantWindow7b: 'Transplant after last frost; plant 2+ for pollination.' },
  { key: 'ground-cherry', name: 'Ground Cherry', family: 'solanaceae', familyLabel: 'Nightshades (Solanaceae)', category: 'fruit', color: '#e0b84f', rotationYears: 3, sun: 'full', spacingInches: 24, plantWindow7b: 'Transplant after last frost; sweet husk fruit.' },

  // --- More Asteraceae / greens ---
  { key: 'endive',    name: 'Endive',    family: 'asteraceae', familyLabel: 'Aster family (Asteraceae)', category: 'vegetable', color: '#a9cf6f', rotationYears: 2, sun: 'partial', spacingInches: 10, plantWindow7b: 'Cool-season; spring & fall.' },
  { key: 'radicchio', name: 'Radicchio', family: 'asteraceae', familyLabel: 'Aster family (Asteraceae)', category: 'vegetable', color: '#b0405f', rotationYears: 2, sun: 'partial', spacingInches: 8, plantWindow7b: 'Cool-season; best as a fall crop.' },
  { key: 'artichoke', name: 'Artichoke', family: 'asteraceae', familyLabel: 'Aster family (Asteraceae)', category: 'vegetable', color: '#7f9f6f', rotationYears: 4, sun: 'full', spacingInches: 36, plantWindow7b: 'Transplant spring; can be grown as an annual in 7b.' },

  // --- Chenopods ---
  { key: 'kale-ornamental', name: 'Amaranth', family: 'amaranthaceae', familyLabel: 'Chenopods (Amaranthaceae)', category: 'vegetable', color: '#a63f7f', rotationYears: 2, sun: 'full', spacingInches: 10, plantWindow7b: 'Direct sow after last frost; heat-loving grain/green.' },

  // --- Perennial vegetables ---
  { key: 'asparagus', name: 'Asparagus', family: 'asparagaceae', familyLabel: 'Asparagus family (Asparagaceae)', category: 'vegetable', color: '#6fae7f', rotationYears: 8, sun: 'full', spacingInches: 18, plantWindow7b: 'Plant crowns early spring; permanent bed, harvest yr 3.' },
  { key: 'rhubarb',   name: 'Rhubarb',   family: 'polygonaceae', familyLabel: 'Knotweed family (Polygonaceae)', category: 'vegetable', color: '#c94f5f', rotationYears: 8, sun: 'full', spacingInches: 36, plantWindow7b: 'Plant crowns spring; perennial. Stalks only (leaves toxic).' },
  { key: 'sweet-potato', name: 'Sweet Potato', family: 'convolvulaceae', familyLabel: 'Morning-glory family (Convolvulaceae)', category: 'vegetable', color: '#c97f4f', rotationYears: 3, sun: 'full', spacingInches: 12, plantWindow7b: 'Plant slips after soil warms; loves heat.' },

  // --- More herbs ---
  { key: 'mint',     name: 'Mint',     family: 'lamiaceae', familyLabel: 'Mint family (Lamiaceae)', category: 'herb', color: '#4fae6f', rotationYears: 2, sun: 'partial', spacingInches: 12, plantWindow7b: 'Perennial; contain it — spreads aggressively.' },
  { key: 'rosemary', name: 'Rosemary', family: 'lamiaceae', familyLabel: 'Mint family (Lamiaceae)', category: 'herb', color: '#6f9f7f', rotationYears: 2, sun: 'full', spacingInches: 24, plantWindow7b: 'Perennial in 7b; transplant spring.' },
  { key: 'sage',     name: 'Sage',     family: 'lamiaceae', familyLabel: 'Mint family (Lamiaceae)', category: 'herb', color: '#8fae8f', rotationYears: 2, sun: 'full', spacingInches: 18, plantWindow7b: 'Perennial in 7b; transplant spring.' },
  { key: 'lavender', name: 'Lavender', family: 'lamiaceae', familyLabel: 'Mint family (Lamiaceae)', category: 'herb', color: '#9f8fc9', rotationYears: 2, sun: 'full', spacingInches: 18, plantWindow7b: 'Perennial; needs well-drained soil and full sun.' },

  // --- Berries & fruit ---
  { key: 'blueberry',  name: 'Blueberry',  family: 'ericaceae', familyLabel: 'Heath family (Ericaceae)', category: 'fruit', color: '#4f6fae', rotationYears: 8, sun: 'full', spacingInches: 48, plantWindow7b: 'Plant bushes late winter; needs acidic soil.' },
  { key: 'raspberry',  name: 'Raspberry',  family: 'rosaceae', familyLabel: 'Rose family (Rosaceae)', category: 'fruit', color: '#b0405f', rotationYears: 5, sun: 'full', spacingInches: 24, plantWindow7b: 'Plant canes late winter/early spring; perennial.' },
  { key: 'blackberry', name: 'Blackberry', family: 'rosaceae', familyLabel: 'Rose family (Rosaceae)', category: 'fruit', color: '#4f3f5f', rotationYears: 5, sun: 'full', spacingInches: 36, plantWindow7b: 'Plant canes late winter/early spring; perennial.' },
  { key: 'grape',      name: 'Grape',      family: 'vitaceae', familyLabel: 'Grape family (Vitaceae)', category: 'fruit', color: '#7d5ba6', rotationYears: 8, sun: 'full', spacingInches: 72, plantWindow7b: 'Plant dormant vines late winter; needs a trellis.' },
  { key: 'fig',        name: 'Fig',        family: 'moraceae', familyLabel: 'Mulberry family (Moraceae)', category: 'fruit', color: '#7f8f5f', rotationYears: 8, sun: 'full', spacingInches: 96, plantWindow7b: 'Plant spring; hardy in 7b with some protection.' },

  // --- Companion flowers ---
  { key: 'nasturtium', name: 'Nasturtium', family: 'tropaeolaceae', familyLabel: 'Nasturtium family (Tropaeolaceae)', category: 'flower', color: '#e0703f', rotationYears: 1, sun: 'full', spacingInches: 10, plantWindow7b: 'Direct sow after last frost; edible, traps aphids.' },
  { key: 'borage',     name: 'Borage',     family: 'boraginaceae', familyLabel: 'Borage family (Boraginaceae)', category: 'flower', color: '#5f7fc9', rotationYears: 1, sun: 'full', spacingInches: 18, plantWindow7b: 'Direct sow after last frost; bee magnet, self-seeds.' },
  { key: 'calendula',  name: 'Calendula',  family: 'asteraceae', familyLabel: 'Aster family (Asteraceae)', category: 'flower', color: '#f0a53f', rotationYears: 1, sun: 'full', spacingInches: 10, plantWindow7b: 'Direct sow early spring; edible, pest-deterrent.' },
  { key: 'zinnia',     name: 'Zinnia',     family: 'asteraceae', familyLabel: 'Aster family (Asteraceae)', category: 'flower', color: '#e0507f', rotationYears: 1, sun: 'full', spacingInches: 10, plantWindow7b: 'Direct sow after last frost; draws pollinators.' },
  { key: 'cosmos',     name: 'Cosmos',     family: 'asteraceae', familyLabel: 'Aster family (Asteraceae)', category: 'flower', color: '#e07fa0', rotationYears: 1, sun: 'full', spacingInches: 12, plantWindow7b: 'Direct sow after last frost; attracts beneficials.' }
];
