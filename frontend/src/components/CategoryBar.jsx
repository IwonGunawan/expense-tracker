import { useI18n } from '../i18n';
import { formatIDR } from '../utils';
import EmptyState from './EmptyState';

export default function CategoryBar({ data }) {
  const { t } = useI18n();

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon="trend"
        title={t('chart.empty')}
        hint={t('chart.emptyHint')}
      />
    );
  }
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="bar-wrap">
      {data.map((row) => (
        <div key={row.category} className="bar-row">
          <span className="bar-label" title={row.category}>
            {row.category}
          </span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${Math.max((row.total / max) * 100, 3)}%` }}
            />
          </div>
          <span className="bar-value">{formatIDR(row.total)}</span>
        </div>
      ))}
    </div>
  );
}