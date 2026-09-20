// Header control that shows the current USDA hardiness zone and lets you look it
// up from a ZIP code. On success it saves the zone to the garden record.
import { useState, useRef, useEffect } from 'react';
import { api } from '../api.js';

export default function ZoneControl() {
  const [zone, setZone] = useState(null);
  const [open, setOpen] = useState(false);
  const [zip, setZip] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);      // { kind: 'ok'|'err', text }
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { api.getGarden().then((g) => setZone(g.zone)).catch(() => {}); }, []);
  useEffect(() => {
    function onDoc(e) { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  async function find(e) {
    e?.preventDefault();
    setMsg(null);
    if (!/^\d{5}$/.test(zip.trim())) { setMsg({ kind: 'err', text: 'Enter a 5-digit ZIP code.' }); return; }
    setBusy(true);
    try {
      const res = await api.lookupZone(zip.trim());
      await api.setZone(res.zone);
      setZone(res.zone);
      setMsg({ kind: 'ok', text: `ZIP ${res.zip} is zone ${res.zone}${res.temperatureRange ? ` (${res.temperatureRange}°F)` : ''}.` });
    } catch (err) {
      setMsg({ kind: 'err', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="zone-control" ref={rootRef}>
      <button type="button" className="zone-badge" onClick={() => setOpen((o) => !o)} title="Set your hardiness zone from a ZIP code">
        USDA Zone {zone || '—'} <span className="zone-edit">✎</span>
      </button>

      {open && (
        <div className="zone-popover">
          <div className="zone-pop-title">Find your hardiness zone</div>
          <form className="zone-pop-form" onSubmit={find}>
            <input
              ref={inputRef}
              className="zone-zip"
              inputMode="numeric"
              maxLength={5}
              placeholder="ZIP code"
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
            />
            <button type="submit" className="primary" disabled={busy}>{busy ? '…' : 'Find'}</button>
          </form>
          {msg && <div className={`zone-msg ${msg.kind}`}>{msg.text}</div>}
          <div className="zone-pop-note small">Looks up your USDA zone and sets it for the garden.</div>
        </div>
      )}
    </div>
  );
}
