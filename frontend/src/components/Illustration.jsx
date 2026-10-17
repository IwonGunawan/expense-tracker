export default function Illustration({ className = '', label }) {
  return (
    <svg
      viewBox="0 0 440 340"
      className={`illustration ${className}`.trim()}
      role="img"
      aria-label={label}
    >
      <circle cx="220" cy="170" r="165" fill="rgba(5, 150, 105, 0.12)" />

      <rect x="62" y="58" width="296" height="212" rx="22" fill="#ffffff" stroke="#DCE6E1" />
      <circle cx="96" cy="92" r="7" fill="#E1ECE8" />
      <rect x="112" y="86" width="92" height="11" rx="5.5" fill="#EDF3F0" />
      <rect x="296" y="80" width="38" height="24" rx="12" fill="#ECFDF5" />
      <rect x="306" y="88" width="18" height="8" rx="4" fill="#059669" />

      <g>
        <rect x="96" y="164" width="20" height="72" rx="7" fill="#059669" opacity="0.32" />
        <rect x="130" y="140" width="20" height="96" rx="7" fill="#059669" opacity="0.48" />
        <rect x="164" y="176" width="20" height="60" rx="7" fill="#059669" opacity="0.28" />
        <rect x="198" y="124" width="20" height="112" rx="7" fill="#059669" />
        <rect x="232" y="152" width="20" height="84" rx="7" fill="#059669" opacity="0.45" />
        <rect x="266" y="136" width="20" height="100" rx="7" fill="#059669" opacity="0.62" />
        <rect x="300" y="168" width="20" height="68" rx="7" fill="#059669" opacity="0.24" />
      </g>
      <rect x="86" y="240" width="248" height="2" rx="1" fill="#DCE6E1" />

      <circle cx="340" cy="94" r="40" fill="#059669" />
      <text
        x="340"
        y="102"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="24"
        fontWeight="700"
        fill="#ffffff"
      >
        Rp
      </text>

      <circle cx="78" cy="252" r="26" fill="#ffffff" stroke="#DCE6E1" />
      <path
        d="M67 252l8 8 15-17"
        fill="none"
        stroke="#059669"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M104 40l5.5 12.5L122 58l-12.5 5.5L104 76l-5.5-12.5L86 58l12.5-5.5z"
        fill="#14B8A6"
        opacity="0.85"
      />
      <circle cx="374" cy="232" r="9" fill="#059669" opacity="0.18" />
      <circle cx="398" cy="198" r="5" fill="#14B8A6" opacity="0.5" />
    </svg>
  );
}