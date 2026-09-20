// Searchable plant dropdown (combobox). Click to open, type to filter across all
// crops by name / category / family, pick one to "arm" it, then click an empty
// cell to plant. Replaces the old always-open sidebar list.
import { useState, useRef, useEffect, useMemo } from 'react';

const CATEGORY_LABEL = { vegetable: 'Vegetables', herb: 'Herbs', fruit: 'Fruit', flower: 'Flowers' };
const CATEGORY_ORDER = ['vegetable', 'herb', 'fruit', 'flower'];

export default function PlantPicker({ plants, armedKey, onArm }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const armed = plants.find((p) => p.key === armedKey) || null;

  useEffect(() => {
    function onDoc(e) { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => plants.filter((p) =>
    !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) ||
    (p.family_label || '').toLowerCase().includes(q)
  ), [plants, q]);

  const groups = useMemo(() => {
    const g = {};
    for (const p of filtered) (g[p.category] ??= []).push(p);
    return g;
  }, [filtered]);

  function pick(key) { onArm(key); setOpen(false); setQuery(''); }

  function onKeyDown(e) {
    if (e.key === 'Escape') { setOpen(false); }
    else if (e.key === 'Enter' && filtered.length > 0) { pick(filtered[0].key); }
  }

  return (
    <div className="combo" ref={rootRef}>
      <label className="combo-label">Crop to plant</label>
      <div className="combo-row">
        <button type="button" className="combo-button" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {armed ? (
            <>
              <span className="swatch" style={{ background: armed.color }} />
              <span className="combo-current">{armed.name}</span>
            </>
          ) : (
            <span className="muted">Choose a crop…</span>
          )}
          <span className="combo-caret">▾</span>
        </button>
        {armed && (
          <button type="button" className="combo-clear" title="Clear selection" onClick={() => onArm(null)}>✕</button>
        )}
      </div>
      <div className="combo-hint small muted">
        {armed ? 'Now click an empty cell to plant it.' : 'Pick a crop, then click an empty cell.'}
      </div>

      {open && (
        <div className="combo-panel">
          <input
            ref={inputRef}
            className="combo-search"
            placeholder="Search crops… (e.g. tomato, herb, brassica)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <div className="combo-list">
            {filtered.length === 0 && <div className="combo-empty muted small">No crops match “{query}”.</div>}
            {CATEGORY_ORDER.filter((c) => groups[c]).map((cat) => (
              <div key={cat}>
                <div className="combo-group">{CATEGORY_LABEL[cat] || cat}</div>
                {groups[cat].map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    className={`combo-option ${p.key === armedKey ? 'active' : ''}`}
                    onClick={() => pick(p.key)}
                    title={p.plant_window || p.name}
                  >
                    <span className="swatch" style={{ background: p.color }} />
                    <span className="combo-option-name">{p.name}</span>
                    <span className="combo-option-fam small muted">{p.family_label?.replace(/\s*\(.*\)/, '')}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
