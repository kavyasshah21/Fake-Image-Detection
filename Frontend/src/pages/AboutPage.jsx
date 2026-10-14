import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();

  const pageStyle = {
    minHeight: '100vh',
    color: '#eaf0ff',
    background:
      'radial-gradient(ellipse at top, #18264b 0%, #0b1020 48%, #080c18 100%)',
    fontFamily: 'Arial, sans-serif',
    overflow: 'hidden',
  };

  const containerStyle = {
    width: 'min(1120px, 90%)',
    margin: '0 auto',
  };

  const sectionStyle = {
    padding: '75px 0',
  };

  const headingStyle = {
    fontSize: 'clamp(28px, 4vw, 42px)',
    fontWeight: 800,
    marginBottom: '16px',
    lineHeight: 1.2,
    textAlign: 'center',
  };

  const descriptionStyle = {
    color: '#aab6d3',
    fontSize: '16px',
    lineHeight: 1.8,
    maxWidth: '760px',
    margin: '0 auto',
    textAlign: 'center',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '22px',
    marginTop: '38px',
  };

  const cardStyle = {
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(148,163,184,0.18)',
    borderRadius: '18px',
    padding: '27px',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
  };

  const primaryButtonStyle = {
    padding: '14px 28px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #818cf8, #6366f1)',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 700,
    boxShadow: '0 8px 25px rgba(99,102,241,0.25)',
  };

  const secondaryButtonStyle = {
    padding: '14px 28px',
    borderRadius: '10px',
    border: '1px solid rgba(165,180,252,0.4)',
    background: 'rgba(255,255,255,0.04)',
    color: '#eaf0ff',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 600,
  };

  const features = [
    {
      icon: '🖼️',
      title: 'Image Examination',
      text: 'Start with an image you want to examine. The application provides a structured workflow for submitting an image for analysis.',
    },
    {
      icon: '🧠',
      title: 'AI-Based Analysis',
      text: 'A connected deep learning model analyzes the image and returns a prediction based on the model it has been trained on.',
    },
    {
      icon: '📊',
      title: 'Prediction Insights',
      text: 'Review the returned classification and confidence information to better understand the model’s assessment.',
    },
    {
      icon: '🔎',
      title: 'Visual Explainability',
      text: 'Heatmap and overlay visualizations can help highlight image regions associated with a model’s prediction when supported by the integrated backend.',
    },
    {
      icon: '📄',
      title: 'Detection Reports',
      text: 'Review available detection details in a clear format. Downloadable reports can bring the image, result, confidence, and date together when supported by the application.',
    },
    {
      icon: '🗂️',
      title: 'Detection History',
      text: 'Access previous detection records available to your account, making it easier to revisit earlier analyses.',
    },
  ];

  const workflow = [
    {
      number: '01',
      title: 'Choose an Image',
      text: 'Select the image you want to examine from your device.',
    },
    {
      number: '02',
      title: 'Submit for Analysis',
      text: 'Upload the image through the application so it can be processed by the connected backend.',
    },
    {
      number: '03',
      title: 'Model Evaluation',
      text: 'The trained model evaluates the submitted image and produces the available prediction output.',
    },
    {
      number: '04',
      title: 'Review the Result',
      text: 'Examine the classification and any confidence or visualization information returned by the system.',
    },
    {
      number: '05',
      title: 'Keep a Record',
      text: 'View available history and report options to revisit the analysis later.',
    },
  ];

  const useCases = [
    {
      icon: '📰',
      title: 'Media Verification',
      text: 'Support a more careful review of images encountered in news and online publications.',
    },
    {
      icon: '🎓',
      title: 'Education & Research',
      text: 'Explore how deep learning can be applied to synthetic-media and image-manipulation analysis.',
    },
    {
      icon: '🌐',
      title: 'Digital Awareness',
      text: 'Encourage people to question unusual or suspicious visual content before sharing it.',
    },
    {
      icon: '🛡️',
      title: 'Content Review',
      text: 'Add an AI-assisted image assessment step to a broader digital-content review process.',
    },
  ];

  return (
    <div style={pageStyle}>
      {/* Navigation */}
      <nav
        style={{
          borderBottom: '1px solid rgba(148,163,184,0.15)',
          background: 'rgba(8,12,24,0.75)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(14px)',
        }}
      >
        <div
          style={{
            ...containerStyle,
            minHeight: '76px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/deepfake-logo.svg"
              alt="DeepGuardAI Logo"
              style={{
                width: '44px',
                height: '44px',
                objectFit: 'contain',
              }}
            />

            <span
              style={{
                fontSize: '21px',
                fontWeight: 800,
                letterSpacing: '-0.5px',
              }}
            >
              DeepGuard<span style={{ color: '#818cf8' }}>AI</span>
            </span>
          </div>

          <button
            onClick={() => navigate('/')}
            style={{
              ...secondaryButtonStyle,
              padding: '10px 18px',
            }}
          >
            Home
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header
        style={{
          ...containerStyle,
          padding: '95px 0 80px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '9px 16px',
            borderRadius: '30px',
            border: '1px solid rgba(129,140,248,0.35)',
            background: 'rgba(99,102,241,0.12)',
            color: '#c7d2fe',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.6px',
            marginBottom: '26px',
          }}
        >
          ✦ AI-POWERED IMAGE ANALYSIS
        </div>

        <h1
          style={{
            fontSize: 'clamp(38px, 6vw, 68px)',
            lineHeight: 1.12,
            letterSpacing: '-2px',
            fontWeight: 900,
            margin: '0 auto 24px',
            maxWidth: '900px',
          }}
        >
          Look Beyond the Image.
          <br />
          <span
            style={{
              background: 'linear-gradient(90deg, #a5b4fc, #67e8f9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Understand What You See.
          </span>
        </h1>

        <p
          style={{
            ...descriptionStyle,
            fontSize: '18px',
            maxWidth: '740px',
          }}
        >
          DeepGuardAI is an AI-assisted image analysis platform designed to
          help examine potentially manipulated or AI-generated images through
          model predictions and clear, accessible results.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginTop: '35px',
          }}
        >
          {/* TOP BUTTON: Opens SignupPage */}
          <button
            onClick={() => navigate('/signup')}
            style={primaryButtonStyle}
          >
            Get Started →
          </button>

          <button
            onClick={() =>
              document
                .getElementById('how-it-works')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            style={secondaryButtonStyle}
          >
            Explore the Workflow ↓
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginTop: '35px',
          }}
        >
          {[
            'AI-assisted analysis',
            'Image-focused workflow',
            'Visual insights',
          ].map((label) => (
            <span
              key={label}
              style={{
                color: '#cbd5e1',
                fontSize: '13px',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(148,163,184,0.15)',
                borderRadius: '30px',
              }}
            >
              ✓ {label}
            </span>
          ))}
        </div>
      </header>

      {/* What it does */}
      <section style={sectionStyle}>
        <div style={containerStyle}>
          <h2 style={headingStyle}>
            A Clearer Way to Examine Digital Images
          </h2>

          <p style={descriptionStyle}>
            Images can be altered, generated, or presented without their
            original context. DeepGuardAI provides a workflow for submitting
            an image, reviewing the model's assessment, and examining the
            information available from the analysis.
          </p>

          <div style={gridStyle}>
            <article style={cardStyle}>
              <div style={{ fontSize: '34px', marginBottom: '18px' }}>🎭</div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>
                Synthetic Media
              </h3>
              <p style={{ color: '#aab6d3', lineHeight: 1.8, margin: 0 }}>
                AI tools can generate realistic-looking images. Automated
                analysis can provide one additional signal when examining
                suspicious visual content.
              </p>
            </article>

            <article style={cardStyle}>
              <div style={{ fontSize: '34px', marginBottom: '18px' }}>🧩</div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>
                Image Manipulation
              </h3>
              <p style={{ color: '#aab6d3', lineHeight: 1.8, margin: 0 }}>
                Images can be edited or combined in ways that change their
                meaning. Careful examination helps users ask better questions
                about what they see.
              </p>
            </article>

            <article style={cardStyle}>
              <div style={{ fontSize: '34px', marginBottom: '18px' }}>🔍</div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>
                Evidence-Based Review
              </h3>
              <p style={{ color: '#aab6d3', lineHeight: 1.8, margin: 0 }}>
                A model prediction is a useful starting point, not absolute
                proof. Results should be interpreted alongside context and
                other available evidence.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section
        style={{
          ...sectionStyle,
          background: 'rgba(255,255,255,0.018)',
          borderTop: '1px solid rgba(148,163,184,0.1)',
          borderBottom: '1px solid rgba(148,163,184,0.1)',
        }}
      >
        <div style={containerStyle}>
          <h2 style={headingStyle}>Why Image Authenticity Matters</h2>

          <p style={descriptionStyle}>
            Digital images influence what people believe, discuss, and share.
            Understanding the limitations of visual content is an important
            part of responsible digital participation.
          </p>

          <div style={gridStyle}>
            {useCases.map((item) => (
              <article key={item.title} style={cardStyle}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>
                  {item.icon}
                </div>

                <h3 style={{ fontSize: '19px', marginBottom: '12px' }}>
                  {item.title}
                </h3>

                <p
                  style={{
                    color: '#aab6d3',
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={sectionStyle}>
        <div style={containerStyle}>
          <h2 style={headingStyle}>From Image to Insight</h2>

          <p style={descriptionStyle}>
            The application follows a simple sequence so users can move from
            image submission to reviewing the analysis returned by the
            connected detection system.
          </p>

          <div style={{ maxWidth: '850px', margin: '45px auto 0' }}>
            {workflow.map((step) => (
              <div
                key={step.number}
                style={{
                  display: 'flex',
                  gap: '22px',
                  alignItems: 'flex-start',
                  padding: '25px',
                  marginBottom: '16px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.035)',
                  border: '1px solid rgba(148,163,184,0.15)',
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: '54px',
                    height: '54px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '15px',
                    background: 'rgba(99,102,241,0.16)',
                    border: '1px solid rgba(129,140,248,0.3)',
                    color: '#c7d2fe',
                    fontWeight: 800,
                  }}
                >
                  {step.number}
                </div>

                <div>
                  <h3 style={{ margin: '2px 0 9px', fontSize: '19px' }}>
                    {step.title}
                  </h3>

                  <p
                    style={{
                      color: '#aab6d3',
                      lineHeight: 1.8,
                      margin: 0,
                    }}
                  >
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          ...sectionStyle,
          background: 'rgba(255,255,255,0.018)',
          borderTop: '1px solid rgba(148,163,184,0.1)',
          borderBottom: '1px solid rgba(148,163,184,0.1)',
        }}
      >
        <div style={containerStyle}>
          <h2 style={headingStyle}>Tools Built Around Your Workflow</h2>

          <p style={descriptionStyle}>
            The platform brings image submission and available analysis
            information together in one interface. Specific results and
            visualizations depend on the capabilities of the connected
            backend.
          </p>

          <div style={gridStyle}>
            {features.map((feature) => (
              <article
                key={feature.title}
                style={cardStyle}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform = 'translateY(-5px)';
                  event.currentTarget.style.borderColor =
                    'rgba(129,140,248,0.5)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = 'translateY(0)';
                  event.currentTarget.style.borderColor =
                    'rgba(148,163,184,0.18)';
                }}
              >
                <div style={{ fontSize: '34px', marginBottom: '17px' }}>
                  {feature.icon}
                </div>

                <h3 style={{ fontSize: '19px', marginBottom: '12px' }}>
                  {feature.title}
                </h3>

                <p
                  style={{
                    color: '#aab6d3',
                    lineHeight: 1.8,
                    margin: 0,
                    fontSize: '14px',
                  }}
                >
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Heatmap section */}
      <section style={sectionStyle}>
        <div
          style={{
            ...containerStyle,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '45px',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                color: '#a5b4fc',
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '1px',
                marginBottom: '15px',
              }}
            >
              VISUAL EXPLAINABILITY
            </div>

            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                lineHeight: 1.25,
                margin: '0 0 20px',
              }}
            >
              Go Beyond a Single Prediction
            </h2>

            <p
              style={{
                color: '#aab6d3',
                lineHeight: 1.9,
                marginBottom: '18px',
              }}
            >
              A classification tells you what the model predicted. A heatmap
              or overlay, when available, can provide additional visual
              context about the regions associated with that prediction.
            </p>

            <p style={{ color: '#aab6d3', lineHeight: 1.9, margin: 0 }}>
              These visualizations are supporting information, not definitive
              proof that a particular region has been manipulated. Their
              availability depends on the integrated model and backend.
            </p>
          </div>

          <div
            style={{
              ...cardStyle,
              padding: '35px',
              textAlign: 'center',
              background:
                'linear-gradient(145deg, rgba(99,102,241,0.12), rgba(34,211,238,0.05))',
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🖼️</div>

            <h3 style={{ fontSize: '23px', marginBottom: '12px' }}>
              Image + Heatmap + Overlay
            </h3>

            <p style={{ color: '#aab6d3', lineHeight: 1.8, margin: 0 }}>
              The planned visualization workflow brings the original image,
              model-generated heatmap, and heatmap overlay together for
              easier comparison when the backend provides the required data.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '24px',
              }}
            >
              {['Original Image', 'Heatmap', 'Overlay'].map((label) => (
                <span
                  key={label}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '20px',
                    background: 'rgba(129,140,248,0.12)',
                    border: '1px solid rgba(129,140,248,0.25)',
                    fontSize: '12px',
                    color: '#c7d2fe',
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Important limitation */}
      <section style={{ padding: '0 0 75px' }}>
        <div
          style={{
            ...containerStyle,
            padding: '25px',
            boxSizing: 'border-box',
            borderRadius: '16px',
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <h3 style={{ margin: '0 0 10px', color: '#fcd34d' }}>
            A Responsible Approach to Detection
          </h3>

          <p
            style={{
              color: '#c5cde0',
              lineHeight: 1.8,
              margin: 0,
              fontSize: '14px',
            }}
          >
            AI detection systems can make mistakes. A prediction or confidence
            score should not be treated as a guarantee of authenticity or
            manipulation. For important decisions, consider the image's
            source, context, and other independent evidence.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        style={{
          padding: '75px 0',
          background:
            'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(34,211,238,0.07))',
          borderTop: '1px solid rgba(148,163,184,0.15)',
          textAlign: 'center',
        }}
      >
        <div style={containerStyle}>
          <h2
            style={{
              ...headingStyle,
              maxWidth: '750px',
              margin: '0 auto 18px',
            }}
          >
            Ready to Examine an Image?
          </h2>

          <p style={descriptionStyle}>
            Explore the image-analysis workflow and review the results
            available through your account.
          </p>

          <div
            className="about-cta"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              margin: '35px 0 0',
            }}
          >
            {/* BOTTOM BUTTON: Opens LoginLandingPage */}
            <button
              onClick={() => navigate('/login')}
              style={primaryButtonStyle}
            >
              Already have an account? Log In →
            </button>

            <button
              onClick={() => navigate('/')}
              style={secondaryButtonStyle}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '28px 0',
          borderTop: '1px solid rgba(148,163,184,0.12)',
          textAlign: 'center',
        }}
      >
        <div style={containerStyle}>
          <p style={{ color: '#7f8baa', fontSize: '13px', margin: 0 }}>
            © {new Date().getFullYear()} DeepGuardAI · AI-Assisted Image
            Analysis
          </p>
        </div>
      </footer>
    </div>
  );
}