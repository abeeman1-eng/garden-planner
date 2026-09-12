# Garden Planner (v1)

A personal, single-user garden planner for an in-ground row garden in **USDA zone 7b**.
Self-hosted on your own machine — no accounts, no cloud.

**v1 covers the core planning loop:**

- **Garden grid** — a configurable rows × cells layout (default 10 × 20). Plant crops by
  drag-and-drop or click-to-place; move and remove plantings.
- **Companion planting** — placing a crop checks the 8 surrounding cells against a curated
  dataset and flags bad pairings (and surfaces good ones + suggestions for empty cells).
- **Crop rotation** — tracked per cell. Warns if the same plant family was grown in that
  cell too recently (default 3 years, with per-family overrides).
- **Seed / inventory** — track seeds and starts; link them to plants; see what's on hand vs.
  what you've planted historically.
- **Harvest log** — free-form notes + photos per planting, viewable chronologically and
  filterable by crop.

Later phases (from the spec) will add: photo plant/pest ID, weather, a plant encyclopedia,
a planting calendar, reminders, and a printable plan. The code is structured so these slot in
as new routes/views without reworking the core.

## Tech

- **Frontend:** React + Vite
- **Backend:** Node + Express
- **Database:** SQLite via Node's built-in `node:sqlite` (no native build step)
- **Photos:** stored on local disk under `server/uploads/`

## Prerequisites

- **Node.js 22.5+** (developed on Node 24). Check with `node --version`.

## Setup

From the project root:

```bash
npm install
```

This installs both workspaces and seeds the database with the curated plant + companion data.
(To reseed later after editing the data files: `npm run seed`.)

## Running

**Development** (Vite dev server + API with auto-reload, two processes in one terminal):

```bash
npm run dev
```

Then open the URL Vite prints (default http://localhost:5173). The API runs on
http://localhost:3001 and the dev server proxies to it.

**Production-style** (build the UI once, then serve everything from the Node server):

```bash
npm run build
npm start
```

Then open http://localhost:3001.

## Data & backups

Everything you enter lives in two places, both easy to back up by copying:

- `server/data/garden.db` — your garden, plantings, harvests, and inventory
- `server/uploads/` — your harvest photos

The curated reference data (plants, companion rules, zone 7b config) lives in
`server/src/data/` and is re-applied on every `npm run seed`; your own data is never touched
by seeding.

## Project layout

```
garden-planner/
├─ server/                 Express API + SQLite
│  ├─ src/
│  │  ├─ index.js          app entry (serves API + built client)
│  │  ├─ db.js             schema + connection (bump SCHEMA_VERSION to migrate)
│  │  ├─ seed.js           loads curated data
│  │  ├─ data/             plants, companion rules, zone 7b config  ← edit to extend
│  │  ├─ services/         companion + rotation engines
│  │  └─ routes/           one file per resource
│  └─ uploads/             harvest photos (git-ignored)
└─ client/                 React + Vite UI
   └─ src/
      ├─ views/            Garden, Harvests, Inventory
      └─ components/       grid, plant picker, cell drawer
```

## Adding plants or companion rules

Edit `server/src/data/plants.js` and `server/src/data/companionRules.js`, then run
`npm run seed`. Rules can key on a specific plant or a whole family and are treated as
symmetric.
