import { useNavigate } from 'react-router-dom';

export default function LoginLanding() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-content">
        <img src="/deepfake-logo.svg" alt="Deepfake Detection Logo" className="landing-logo" />
        <h1 className="landing-title">AI Deepfake Image Detection</h1>
        <p className="landing-subtitle">
          Advanced AI-powered analysis to identify AI-generated and manipulated images.
        </p>
        <div className="landing-buttons">
          <button
            onClick={() => navigate('/about')}
            className="landing-btn landing-btn-secondary"
          >
            Learn More
          </button>
          <button
            onClick={() => navigate('/login')}
            className="landing-btn landing-btn-primary"
          >
            Get Started
          </button>
        </div>
      </div>
      <div className="landing-footer">
        <p>Protecting visual truth through AI analysis</p>
      </div>
    </div>
  );
}
