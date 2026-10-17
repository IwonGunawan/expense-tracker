import { useId } from 'react';

export default function Logo({ size = 34, withText = false, subtitle, className = '' }) {
  const id = useId();
  const grad = `logo-grad-${id.replace(/[:]/g, '')}`;

  return (
    <span className={`logo ${className}`.trim()}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role="img"
        aria-label="Expense Tracker"
        className="logo-mark"
      >
        <defs>
          <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="55%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill={`url(#${grad})`} />
        <path
          d="M20 24h20a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V28a4 4 0 0 1 4-4z"
          fill="none"
          stroke="#fff"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <path d="M16 30h28" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="36" cy="38" r="2.6" fill="#fff" />
        <path d="M24 20.5l4.5 4.5" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
      </svg>

      {withText && (
        <span className="logo-text">
          <span className="logo-word">Expense Tracker</span>
          {subtitle && <span className="logo-sub">{subtitle}</span>}
        </span>
      )}
    </span>
  );
}