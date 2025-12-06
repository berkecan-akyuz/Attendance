interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 10,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getColor = (percentage: number) => {
    if (percentage >= 90) return "#10b981"; // green
    if (percentage >= 75) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  const color = getColor(value);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-gray-900" style={{ fontSize: size / 4 }}>
          {value.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
