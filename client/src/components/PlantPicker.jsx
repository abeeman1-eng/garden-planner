// Sidebar list of plants, grouped by category. Click a plant to "arm" it (then
// click an empty cell to plant), or drag it onto a cell. Both interactions work.

const CATEGORY_LABEL = {
  vegetable: 'Vegetables',
  herb: 'Herbs',
  fruit: 'Fruit',
  flower: 'Flowers'
};

export default function PlantPicker({ plants, armedKey, onArm }) {
  const groups = {};
  for (const p of plants) (groups[p.category] ??= []).push(p);
  const order = ['vegetable', 'herb', 'fruit', 'flower'];

  return (
    <aside className="panel picker">
      <h2>Plants</h2>
      <div className="picker-hint">
        Click to select, then click an empty cell — or drag a plant onto the grid.
      </div>
      <div className="body" style={{ paddingTop: 0 }}>
        {order.filter((c) => groups[c]).map((cat) => (
          <div key={cat}>
            <div className="plant-group-label">{CATEGORY_LABEL[cat] || cat}</div>
            {groups[cat].map((p) => (
              <div
                key={p.key}
                className={`plant-chip ${armedKey === p.key ? 'armed' : ''}`}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plant-key', p.key)}
                onClick={() => onArm(armedKey === p.key ? null : p.key)}
                title={p.plant_window || p.name}
              >
                <span className="swatch" style={{ background: p.color }} />
                <span className="name">{p.name}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
