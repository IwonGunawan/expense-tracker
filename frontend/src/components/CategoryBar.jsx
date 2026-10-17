import { formatIDR } from '../utils';
import EmptyState from './EmptyState';

export default function CategoryBar({ data }) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon="trend"
        title="Belum ada pengeluaran"
        hint="Tambahkan pengeluaran untuk melihat rekap."
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