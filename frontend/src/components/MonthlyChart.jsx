import { useMemo, useState } from 'react';
import { formatIDR, shortMonths } from '../utils';

export default function MonthlyChart({ months, year }) {
  const [active, setActive] = useState(null);
  const max = Math.max(...months.map((m) => m.total), 1);
  const labels = shortMonths();

  const peak = useMemo(
    () => months.reduce((best, m, i) => (m.total > months[best].total ? i : best), 0),
    [months],
  );

  return (
    <div className="chart">
      <div className="chart-bars" onMouseLeave={() => setActive(null)}>
        {months.map((m, i) => {
          const shown = active ?? peak;
          return (
            <div
              key={m.month}
              className={'chart-col' + (shown === i ? ' active' : '')}
              tabIndex={0}
              role="img"
              aria-label={`${labels[i]} ${year}: ${formatIDR(m.total)}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(i)}
            >
              <span className="chart-tip mono">{formatIDR(m.total)}</span>
              <div className="chart-bar-wrap">
                <div
                  className="chart-bar"
                  style={{ height: `${Math.max((m.total / max) * 100, m.total > 0 ? 4 : 0)}%` }}
                />
              </div>
              <span className="chart-label">{labels[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}