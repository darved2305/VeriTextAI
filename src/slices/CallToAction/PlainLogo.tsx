export default function PlainLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 91 82"
      className="w-24"
    >
      <rect width={91} height={82} rx={16} fill="#3B82F6" />
      <path
        d="M20 25h51M20 41h38M20 57h25"
        stroke="#fff"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <circle cx={68} cy={57} r={12} fill="#22C55E" />
      <path
        d="M62 57l4.5 4.5L75 53"
        stroke="#fff"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
