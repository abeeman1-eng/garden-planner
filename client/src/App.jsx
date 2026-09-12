import { useState } from 'react';
import { ToastProvider } from './ToastContext.jsx';
import GardenView from './views/GardenView.jsx';
import HarvestsView from './views/HarvestsView.jsx';
import InventoryView from './views/InventoryView.jsx';

const TABS = [
  { id: 'garden', label: '🌱 Garden' },
  { id: 'harvests', label: '🧺 Harvests' },
  { id: 'inventory', label: '📦 Inventory' }
];

export default function App() {
  const [tab, setTab] = useState('garden');

  return (
    <ToastProvider>
      <header className="app-header">
        <h1>Garden Planner</h1>
        <span className="zone">USDA Zone 7b</span>
        <nav className="tabs">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="container">
        {tab === 'garden' && <GardenView />}
        {tab === 'harvests' && <HarvestsView />}
        {tab === 'inventory' && <InventoryView />}
      </main>
    </ToastProvider>
  );
}
