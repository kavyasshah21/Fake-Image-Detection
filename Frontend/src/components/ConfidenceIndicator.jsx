export default function ConfidenceIndicator({ value }) {
  if (value == null || isNaN(value)) {
    return (
      <div className="confidence-indicator">
        <div className="confidence-circle">
          <span className="confidence-value confidence-unavailable">N/A</span>
        </div>
        <p className="confidence-label">Confidence not available</p>
      </div>
    );
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const normalized = numValue <= 1 ? numValue * 100 : numValue;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;

  let strokeColor = '#0F4C75';
  if (normalized >= 75) strokeColor = '#e63946';
  else if (normalized >= 50) strokeColor = '#f4a261';
  else strokeColor = '#2a9d8f';

  return (
    <div className="confidence-indicator">
      <div className="confidence-circle-wrapper">
        <svg className="confidence-ring" width="120" height="120" viewBox="0 0 120 120">
          <circle
            className="confidence-ring-bg"
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="8"
          />
          <circle
            className="confidence-ring-fill"
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="confidence-text">
          <span className="confidence-value">{normalized.toFixed(1)}%</span>
        </div>
      </div>
      <p className="confidence-label">Confidence Score</p>
    </div>
  );
}
