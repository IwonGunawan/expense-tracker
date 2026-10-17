export default function Logo({ size = 34, withText = false, subtitle, className = '' }) {
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
        <rect width="64" height="64" rx="16" fill="#059669" />
        <rect x="14" y="18" width="36" height="28" rx="7" fill="#ffffff" opacity="0.14" />
        <path
          d="M20 24h20a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V28a4 4 0 0 1 4-4z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <path d="M16 31h28" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="36.5" cy="38.5" r="2.6" fill="#ffffff" />
        <path d="M24 20.5l4.5 4.5" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" />
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
