/** Empty state placeholder.
 * @param {{ icon, title, description, action }} props
 * action: { label: string, onClick: function }
 */
import Button from './Button';

export default function EmptyState({ icon = 'fa-inbox', title, description, action }) {
  return (
    <div className="empty-state">
      <i className={`fas ${icon}`} />
      {title && <h3 className="text-lg font-semibold text-strong">{title}</h3>}
      {description && <p className="text-sm text-dim">{description}</p>}
      {action && (
        <Button variant="primary" onClick={action.onClick} className="mt-sm">
          <i className={`fas ${action.icon || 'fa-plus'}`} />
          {action.label}
        </Button>
      )}
    </div>
  );
}
