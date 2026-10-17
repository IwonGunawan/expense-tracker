import { formatIDR, shortMonths } from '../utils';

export default function MonthlyChart({ months, year }) {
  const max = Math.max(...months.map((m) => m.total), 1);
  const labels = shortMonths();

  return (
    <div className="chart">
      <div className="chart-bars">
        {months.map((m, i) => (
          <div key={m.month} className="chart-col" title={`${labels[i]} ${year}: ${formatIDR(m.total)}`}>
            <div className="chart-bar-wrap">
              <div
                className="chart-bar"
                style={{ height: `${Math.max((m.total / max) * 100, m.total > 0 ? 4 : 0)}%` }}
              />
            </div>
            <span className="chart-label">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}