import Icon from './Icon';

export default function EmptyState({ icon = 'wallet', title, hint, action }) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name={icon} size={26} />
      </span>
      <p className="empty-title">{title}</p>
      {hint && <p className="muted">{hint}</p>}
      {action}
    </div>
  );
}