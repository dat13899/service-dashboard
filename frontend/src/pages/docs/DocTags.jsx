// ── Tag filter for Documents ──
import Badge from '../../components/ui/Badge';

export default function DocTags({ allTags, selectedTags, onToggle }) {
  return (
    <div className="flex gap-xs" style={{ flexWrap: 'wrap', marginBottom: '0.5rem' }}>
      {allTags.map(tag => {
        const active = selectedTags.includes(tag);
        return (
          <button key={tag} onClick={() => onToggle(tag)}
            className={`badge ${active ? 'badge-accent' : ''}`}
            style={{
              cursor: 'pointer', border: '1px solid var(--glass-border)',
              background: active ? 'var(--accent)' : 'var(--surface-2)',
              color: active ? '#fff' : 'var(--text-dim)',
              fontSize: '0.68rem', padding: '0.2rem 0.5rem',
              borderRadius: '999px', transition: 'all .15s',
            }}>
            #{tag}
          </button>
        );
      })}
    </div>
  );
}
