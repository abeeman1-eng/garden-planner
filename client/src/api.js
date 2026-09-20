// Thin client for the Garden Planner API. All calls share the same origin
// (dev: Vite proxy -> :3001; prod: served by Express).

async function request(path, options = {}) {
  const res = await fetch(path, options);
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : null;
  if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
  return body;
}

const json = (method, path, data) =>
  request(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

export const api = {
  // Reference
  getPlants: () => request('/api/plants'),

  // Garden + grid
  getGarden: () => request('/api/garden'),
  updateGarden: (rows, cols) => json('PUT', '/api/garden', { rows, cols }),
  setZone: (zone) => json('PUT', '/api/garden/zone', { zone }),

  // Hardiness zone lookup by ZIP
  lookupZone: (zip) => request(`/api/zone/${encodeURIComponent(zip)}`),

  // Cells
  getCell: (row, col) => request(`/api/cells/${row}/${col}`),
  getSuggestions: (row, col) => request(`/api/cells/${row}/${col}/suggestions`),
  check: ({ row, col, plantKey, plantedYear, excludePlantingId }) => {
    const q = new URLSearchParams({ row, col, plantKey });
    if (plantedYear) q.set('plantedYear', plantedYear);
    if (excludePlantingId) q.set('excludePlantingId', excludePlantingId);
    return request(`/api/check?${q}`);
  },

  // Plantings
  plant: (data) => json('POST', '/api/plantings', data),
  movePlanting: (id, row, col) => json('PATCH', `/api/plantings/${id}/move`, { row, col }),
  removePlanting: (id, removedDate) => json('POST', `/api/plantings/${id}/remove`, { removedDate }),
  deletePlanting: (id) => request(`/api/plantings/${id}`, { method: 'DELETE' }),

  // Harvests
  getHarvests: (filters = {}) => {
    const q = new URLSearchParams(filters);
    return request(`/api/harvests?${q}`);
  },
  addHarvest: (formData) => request('/api/harvests', { method: 'POST', body: formData }),
  deleteHarvest: (id) => request(`/api/harvests/${id}`, { method: 'DELETE' }),

  // Inventory
  getInventory: () => request('/api/inventory'),
  getPlantedHistory: () => request('/api/inventory/planted-history'),
  addInventory: (data) => json('POST', '/api/inventory', data),
  updateInventory: (id, data) => json('PUT', `/api/inventory/${id}`, data),
  deleteInventory: (id) => request(`/api/inventory/${id}`, { method: 'DELETE' })
};
