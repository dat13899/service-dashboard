/* ── ServiceForm: Add/Edit service modal form ── */
export default function ServiceForm({ form, onChange }) {
  const set = (key, val) => onChange(f => ({ ...f, [key]: val }));
  const field = (label, key, type = 'text', required) => (
    <div className="field">
      <label className="text-xs text-dim">{label}{required ? ' *' : ''}</label>
      <input className="input" type={type} value={form[key]} onChange={e => set(key, e.target.value)} />
    </div>
  );
  return (
    <div className="flex flex-col gap-sm">
      {field('Name', 'name', 'text', true)}
      {field('ID', 'id', 'text', true)}
      {field('Port', 'port', 'number')}
      {field('Command', 'command')}
      {field('Directory', 'dir')}
      <label className="flex items-center gap-xs text-xs text-dim">
        <input type="checkbox" checked={form.autoStart} onChange={e => set('autoStart', e.target.checked)} style={{ accentColor: 'var(--accent)' }} /> Auto-start
      </label>
    </div>
  );
}
