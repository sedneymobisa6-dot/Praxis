export function ProgressRing({
  days,
  total,
  color,
}: {
  days: number;
  total: number;
  color: string;
}) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, days / total));
  const offset = circumference * (1 - progress);

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={radius} stroke="#E5E7EB" strokeWidth="10" fill="none" />
      <circle
        cx="70"
        cy="70"
        r={radius}
        stroke={color}
        strokeWidth="10"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="66" textAnchor="middle" fontSize="22" fontWeight="700" fill="#0A3D62">
        {days > 0 ? days : 0}
      </text>
      <text x="70" y="86" textAnchor="middle" fontSize="10" fill="#6B7280" letterSpacing="1">
        DAYS LEFT
      </text>
    </svg>
  );
}