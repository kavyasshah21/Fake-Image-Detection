import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ErrorBanner } from '../components/UIComponents';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await api.signup({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      navigate('/login');
    } catch (err) {
      setError(
        err.message || 'Unable to create your account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  const styles = {
    page: {
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: '#f7f8fc',
      color: '#172033',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },

    left: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '48px clamp(24px, 7vw, 100px)',
      background: '#ffffff',
    },

    brand: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '44px',
    },

    logo: {
      width: '43px',
      height: '43px',
      objectFit: 'contain',
    },

    brandName: {
      fontSize: '22px',
      fontWeight: 800,
      letterSpacing: '-0.7px',
      color: '#111827',
    },

    heading: {
      fontSize: 'clamp(29px, 3vw, 38px)',
      fontWeight: 750,
      letterSpacing: '-1.2px',
      lineHeight: 1.2,
      margin: '0 0 12px',
      color: '#111827',
    },

    subtitle: {
      fontSize: '15px',
      color: '#667085',
      lineHeight: 1.7,
      margin: '0 0 30px',
    },

    form: {
      width: '100%',
      maxWidth: '440px',
    },

    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: 650,
      color: '#344054',
      marginBottom: '8px',
    },

    input: {
      width: '100%',
      height: '47px',
      boxSizing: 'border-box',
      padding: '0 14px',
      border: '1px solid #d0d5dd',
      borderRadius: '9px',
      background: '#ffffff',
      color: '#101828',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    },

    field: {
      marginBottom: '19px',
    },

    button: {
      width: '100%',
      height: '49px',
      marginTop: '8px',
      border: 'none',
      borderRadius: '9px',
      background: '#4f46e5',
      color: '#ffffff',
      fontSize: '15px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'background 0.2s',
    },

    footer: {
      fontSize: '13px',
      color: '#667085',
      marginTop: '25px',
      textAlign: 'center',
    },

    link: {
      color: '#4f46e5',
      fontWeight: 650,
      textDecoration: 'none',
    },

    right: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden',
      padding: '55px clamp(28px, 5vw, 72px)',
      color: '#ffffff',
      background:
        'radial-gradient(ellipse at 80% 10%, rgba(99,102,241,0.4), transparent 40%), linear-gradient(145deg, #10172d, #171c3a 55%, #111827)',
    },
  };

  const focusInput = (e) => {
    e.currentTarget.style.borderColor = '#6366f1';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
  };

  const blurInput = (e) => {
    e.currentTarget.style.borderColor = '#d0d5dd';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div style={styles.page}>
      {/* LEFT: Signup form */}
      <main style={styles.left}>
        <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
          <Link
            to="/"
            style={{
              ...styles.brand,
              textDecoration: 'none',
              marginBottom: '48px',
            }}
          >
            <img
              src="/deepfake-logo.svg"
              alt="DeepGuardAI logo"
              style={styles.logo}
            />

            <span style={styles.brandName}>
              DeepGuard<span style={{ color: '#4f46e5' }}>AI</span>
            </span>
          </Link>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 11px',
              marginBottom: '18px',
              borderRadius: '6px',
              background: '#eef2ff',
              color: '#4338ca',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <span>✦</span>
            YOUR IMAGE ANALYSIS WORKSPACE
          </div>

          <h1 style={styles.heading}>Create your account</h1>

          <p style={styles.subtitle}>
            Get started with AI-assisted image analysis. Create your account
            to access the platform.
          </p>

          {error && (
            <div style={{ marginBottom: '20px' }}>
              <ErrorBanner message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label htmlFor="name" style={styles.label}>
                Full name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={focusInput}
                onBlur={blurInput}
                placeholder="Enter your full name"
                autoComplete="name"
                maxLength={100}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="email" style={styles.label}>
                Work or personal email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={focusInput}
                onBlur={blurInput}
                placeholder="you@example.com"
                autoComplete="email"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="password" style={styles.label}>
                Password
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  style={{
                    ...styles.input,
                    paddingRight: '78px',
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    color: '#4f46e5',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <p
                style={{
                  margin: '7px 0 0',
                  fontSize: '12px',
                  color: '#98a2b3',
                }}
              >
                Use at least 6 characters.
              </p>
            </div>

            <div style={styles.field}>
              <label htmlFor="confirmPassword" style={styles.label}>
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={focusInput}
                onBlur={blurInput}
                placeholder="Enter your password again"
                autoComplete="new-password"
                required
                style={styles.input}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = '#4338ca';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#4f46e5';
              }}
            >
              {loading ? 'Creating your account…' : 'Create account'}
            </button>
          </form>

          <div style={styles.footer}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>
              Sign in
            </Link>
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: '35px',
              fontSize: '12px',
              color: '#98a2b3',
            }}
          >
            <Link
              to="/"
              style={{
                color: '#667085',
                textDecoration: 'none',
              }}
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>

      {/* RIGHT: Product introduction panel */}
      <aside style={styles.right}>
        <div
          style={{
            position: 'absolute',
            width: '360px',
            height: '360px',
            border: '1px solid rgba(165,180,252,0.12)',
            borderRadius: '50%',
            right: '-130px',
            top: '100px',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            width: '250px',
            height: '250px',
            border: '1px solid rgba(165,180,252,0.12)',
            borderRadius: '50%',
            right: '-75px',
            top: '155px',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              fontSize: '12px',
              letterSpacing: '2px',
              color: '#a5b4fc',
              fontWeight: 700,
              marginBottom: '24px',
            }}
          >
            INTRODUCING DEEPGUARDAI
          </div>

          <h2
            style={{
              fontSize: 'clamp(30px, 3.7vw, 49px)',
              lineHeight: 1.2,
              letterSpacing: '-1.5px',
              margin: '0 0 22px',
              maxWidth: '510px',
            }}
          >
            A more thoughtful way to examine digital images.
          </h2>

          <p
            style={{
              color: '#bdc5df',
              fontSize: '15px',
              lineHeight: 1.9,
              maxWidth: '470px',
              marginBottom: '42px',
            }}
          >
            Explore an AI-assisted workflow designed to help you review image
            classifications, understand available model outputs, and keep
            track of your analyses.
          </p>

          {/* Illustrative analysis card */}
          <div
            style={{
              maxWidth: '440px',
              padding: '22px',
              borderRadius: '16px',
              border: '1px solid rgba(165,180,252,0.2)',
              background: 'rgba(255,255,255,0.055)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 24px 70px rgba(0,0,0,0.18)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                marginBottom: '22px',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#e5e7eb',
                }}
              >
                Image analysis workflow
              </span>

              <span
                style={{
                  fontSize: '10px',
                  color: '#a5b4fc',
                  padding: '6px 9px',
                  borderRadius: '20px',
                  background: 'rgba(129,140,248,0.13)',
                }}
              >
                OVERVIEW
              </span>
            </div>

            {[
              {
                number: '01',
                title: 'Image submission',
                description: 'Select an image for analysis',
              },
              {
                number: '02',
                title: 'AI model assessment',
                description: 'Process the image with the connected model',
              },
              {
                number: '03',
                title: 'Review available results',
                description: 'Inspect the prediction and supporting details',
              },
            ].map((item, index) => (
              <div
                key={item.number}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '15px 0',
                  borderBottom:
                    index < 2
                      ? '1px solid rgba(255,255,255,0.09)'
                      : 'none',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    flexShrink: 0,
                    borderRadius: '10px',
                    background: 'rgba(129,140,248,0.15)',
                    border: '1px solid rgba(165,180,252,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c7d2fe',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  {item.number}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#f3f4f6',
                      marginBottom: '5px',
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      color: '#aeb8d0',
                      fontSize: '12px',
                      lineHeight: 1.6,
                    }}
                  >
                    {item.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            color: '#929db9',
            fontSize: '12px',
            lineHeight: 1.7,
            marginTop: '50px',
          }}
        >
          AI-assisted analysis can make mistakes. Review results alongside
          other available evidence.
        </div>
      </aside>

      {/* Responsive layout */}
      <style>
        {`
          @media (max-width: 850px) {
            .signup-responsive-placeholder {
              display: none;
            }
          }

          @media (max-width: 760px) {
            body {
              margin: 0;
            }
          }
        `}
      </style>
    </div>
  );
}