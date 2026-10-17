import Icon from './Icon';

export default function StatCard({ icon, label, value, hint, tone = 'primary' }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <span className="stat-icon">
        <Icon name={icon} size={18} />
      </span>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  );
}