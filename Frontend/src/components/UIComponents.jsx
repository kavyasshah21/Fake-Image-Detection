import { useNavigate } from 'react-router-dom';

export default function LoadingSpinner({ label }) {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="spinner-ring" />
        <div className="spinner-ring spinner-ring-2" />
        <div className="spinner-ring spinner-ring-3" />
      </div>
      {label && <p className="loading-label">{label}</p>}
    </div>
  );
}

export function AnalyzingAnimation() {
  return (
    <div className="analyzing-container">
      <div className="analyzing-animation">
        <div className="scan-line" />
        <div className="scan-grid">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="scan-cell" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
      <div className="analyzing-text">
        <h3>Analyzing Image</h3>
        <p>Running AI detection model...</p>
      </div>
    </div>
  );
}

export function EmptyState({ icon, heading, description, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h2 className="empty-state-heading">{heading}</h2>
      <p className="empty-state-description">{description}</p>
      {actionLabel && (
        <button onClick={onAction} className="empty-state-action-btn">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorBanner({ message }) {
  return (
    <div className="error-banner">
      <span className="error-banner-icon">!</span>
      <span>{message}</span>
    </div>
  );
}
