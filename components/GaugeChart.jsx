'use client';

export default function GaugeChart({ value = 0, max = 100, label = '', showScore = false, score = 0, percentOnly = false }) {
  const percentage = Math.min(Math.max(value, 0), 100);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  let color = '#FF4D9A'; // pink by default
  if (percentage >= 75) {
    color = '#4ade80'; // green
  } else if (percentage >= 50) {
    color = '#ff6535'; // orange
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            {percentOnly ? (
              <div className="text-2xl font-bold">{percentage}%</div>
            ) : (
              <>
                <div className="text-xl font-bold">{score}</div>
                <div className="text-xs text-gray-300">{percentage}%</div>
              </>
            )}
          </div>
        </div>
      </div>

      {label && <div className="text-sm font-semibold text-center">{label}</div>}
    </div>
  );
}
