import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { generateReport } from '../services/reportGenerator';
import LoadingSpinner, { ErrorBanner } from '../components/UIComponents';
import ConfidenceIndicator from '../components/ConfidenceIndicator';

function resolveImageUrl(url) {
  if (!url) return null;

  if (typeof url === 'object') {
    url = url.url || url.imageUrl || url.path || url.data || null;
  }

  if (typeof url !== 'string' || !url.trim()) {
    return null;
  }

  if (
    url.startsWith('data:') ||
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  return api.resolveUrl(url);
}

function normalizeConfidence(value) {
  if (value == null || value === '' || isNaN(Number(value))) {
    return null;
  }

  const num = Number(value);
  return num <= 1 ? num * 100 : num;
}

function formatFileSize(bytes) {
  if (bytes == null || isNaN(Number(bytes))) return null;

  const size = Number(bytes);

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function formatLabel(value) {
  return String(value)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

/*
 * Convert nested objects and arrays into readable text.
 * This prevents JSON braces from appearing on the page.
 */
function formatReadableValue(value) {
  if (value == null || value === '') {
    return 'Not available';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => formatReadableValue(item))
      .join('\n');
  }

  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, item]) => item !== undefined && item !== null)
      .map(([key, item]) => {
        return `${formatLabel(key)}: ${formatReadableValue(item)}`;
      })
      .join('\n');
  }

  return String(value);
}

/*
 * Display a section only when the backend supplies its data.
 * Nested values are converted to readable text.
 */
function AnalysisTextSection({ title, value }) {
  if (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0)
  ) {
    return null;
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value).filter(
      ([, item]) => item !== undefined && item !== null && item !== ''
    );

    if (entries.length === 0) return null;

    return (
      <section className="analysis-description-block">
        <h3>{title}</h3>

        <div className="analysis-readable-list">
          {entries.map(([key, item]) => (
            <div className="analysis-readable-item" key={key}>
              <strong>{formatLabel(key)}</strong>

              <p>{formatReadableValue(item)}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (Array.isArray(value)) {
    return (
      <section className="analysis-description-block">
        <h3>{title}</h3>

        <div className="analysis-readable-list">
          {value.map((item, index) => (
            <p key={index}>{formatReadableValue(item)}</p>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="analysis-description-block">
      <h3>{title}</h3>
      <p>{formatReadableValue(value)}</p>
    </section>
  );
}

export default function Analysis() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [downloadingReport, setDownloadingReport] = useState(false);

  const routeState = location.state;

  useEffect(() => {
    if (!routeState?.imageId) {
      navigate('/dashboard');
      return;
    }

    let cancelled = false;

    async function loadAnalysis() {
      if (routeState.detectionResult && !routeState.fromHistory) {
        const detection = routeState.detectionResult;
        const heatmap =
          detection.heatmap && typeof detection.heatmap === 'object'
            ? detection.heatmap
            : {};

        setAnalysisData({
          imageId: routeState.imageId,

          originalImage: resolveImageUrl(
            heatmap.originalImage || routeState.originalImage
          ),

          heatmapImage: resolveImageUrl(
            heatmap.image ||
              detection.heatmapImage ||
              detection.heatmapUrl
          ),

          overlayImage: resolveImageUrl(
            heatmap.overlay ||
              detection.overlayImage ||
              detection.overlayUrl
          ),

          detectionResult: detection,
          filename: routeState.filename,
          fileSize: routeState.fileSize,
          fileType: routeState.fileType,
          timestamp: routeState.timestamp || detection.timestamp,
          processingTime: detection.processingTime,
        });

        return;
      }

      setLoading(true);
      setError('');

      try {
        const detail = await api.getImageById(routeState.imageId);

        if (cancelled) return;

        const detection =
          detail.detection ||
          detail.result ||
          detail.analysis ||
          detail.detectionResult ||
          null;

        const heatmap =
          detection?.heatmap && typeof detection.heatmap === 'object'
            ? detection.heatmap
            : {};

        setAnalysisData({
          imageId: routeState.imageId,

          originalImage: resolveImageUrl(
            heatmap.originalImage ||
              detail.imageUrl ||
              detail.url ||
              detail.originalImage ||
              routeState.originalImage
          ),

          heatmapImage: resolveImageUrl(
            heatmap.image ||
              detection?.heatmapImage ||
              detection?.heatmapUrl ||
              detail.heatmapImage
          ),

          overlayImage: resolveImageUrl(
            heatmap.overlay ||
              detection?.overlayImage ||
              detection?.overlayUrl ||
              detail.overlayImage
          ),

          detectionResult: detection || {},
          filename: detail.filename || detail.fileName || routeState.filename,
          fileSize: detail.fileSize || routeState.fileSize,
          fileType: detail.fileType || routeState.fileType,
          timestamp:
            detail.createdAt ||
            detail.timestamp ||
            routeState.timestamp,
          processingTime:
            detection?.processingTime || detail.processingTime,
        });
      } catch (err) {
        if (cancelled) return;

        if (err.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(
            err.message || 'Unable to load analysis details. Please try again.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAnalysis();

    return () => {
      cancelled = true;
    };
  }, [routeState, navigate]);

  async function handleDownloadReport() {
    if (!analysisData) return;

    setDownloadingReport(true);
    setError('');

    try {
      await generateReport(analysisData);
    } catch (err) {
      setError(
        err.message || 'Unable to generate the report. Please try again.'
      );
    } finally {
      setDownloadingReport(false);
    }
  }

  if (loading) {
    return (
      <div className="analysis-page">
        <LoadingSpinner label="Loading analysis details..." />
      </div>
    );
  }

  if (error && !analysisData) {
    return (
      <div className="analysis-page">
        <ErrorBanner message={error} />

        <div className="analysis-back">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="analysis-page">
        <LoadingSpinner label="Loading analysis..." />
      </div>
    );
  }

  const detection = analysisData.detectionResult || {};

  const result =
    detection.prediction?.class ||
    detection.result?.prediction?.class ||
    (typeof detection.result === 'string' ? detection.result : null) ||
    detection.classification ||
    (typeof detection.class === 'string' ? detection.class : null);

  const confidence = normalizeConfidence(
    detection.prediction?.confidence ??
      detection.result?.prediction?.confidence ??
      detection.confidence ??
      detection.confidenceScore
  );

  const modelAccuracy =
    detection.modelAccuracy != null
      ? normalizeConfidence(detection.modelAccuracy)
      : null;

  const status =
    detection.reportStatus ||
    detection.status ||
    (detection.success === true ? 'Completed' : 'Not available');

  const description =
    detection.description ||
    detection.analysis ||
    detection.geminiReport?.executiveSummary;

  const processingTime =
    analysisData.processingTime || detection.processingTime;

  const timestamp =
    analysisData.timestamp ||
    detection.timestamp ||
    detection.analysisTimestamp;

  const originalImage = analysisData.originalImage;
  const heatmapImage = analysisData.heatmapImage;
  const overlayImage = analysisData.overlayImage;

  const isAIGenerated =
    /AI|FAKE|GENERATED|MANIPULATED/i.test(result || '');

  /*
   * Only display actual fields returned by the backend.
   * No sample predictions or fabricated explanations are added.
   */
  const keyIndicators =
    detection.keyIndicators ??
    detection.indicators ??
    detection.result?.keyIndicators;

  const classProbabilities =
    detection.probabilities ??
    detection.classProbabilities ??
    detection.result?.probabilities;

  const modelReasoning =
    detection.reasoning ??
    detection.modelReasoning ??
    detection.result?.reasoning;

  const visualPatterns =
    detection.visualPatterns ??
    detection.patterns ??
    detection.result?.visualPatterns;

  return (
    <div className="analysis-page">
      <div className="analysis-header">
        <h1>Analysis Complete</h1>
        <p>
          Your image has been analyzed. Review the detailed results below.
        </p>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Original image, heatmap, and overlay */}
      <div className="heatmap-section">
        <h2>Visual Analysis</h2>

        <div className="heatmap-grid">
          <div className="heatmap-card">
            <h3 className="heatmap-card-title">Original Image</h3>

            <div className="heatmap-image-container">
              {originalImage ? (
                <img
                  src={originalImage}
                  alt="Original uploaded image"
                  className="heatmap-image"
                />
              ) : (
                <div className="heatmap-placeholder">
                  <p>Original image is not available.</p>
                </div>
              )}
            </div>
          </div>

          <div className="heatmap-card">
            <h3 className="heatmap-card-title">Detection Heatmap</h3>

            <div className="heatmap-image-container">
              {heatmapImage ? (
                <img
                  src={heatmapImage}
                  alt="Detection heatmap"
                  className="heatmap-image"
                />
              ) : (
                <div className="heatmap-placeholder">
                  <p>
                    Heatmap visualization is not available for this analysis.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="heatmap-card">
            <h3 className="heatmap-card-title">Heatmap Overlay</h3>

            <div className="heatmap-image-container">
              {overlayImage ? (
                <img
                  src={overlayImage}
                  alt="Heatmap overlay on the image"
                  className="heatmap-image"
                />
              ) : (
                <div className="heatmap-placeholder">
                  <p>
                    Overlay visualization is not available for this analysis.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detection summary */}
      <div className="analysis-summary-section">
        <h2>Detection Analysis</h2>

        <div className="analysis-summary-grid">
          <div className="analysis-confidence-panel">
            <ConfidenceIndicator value={confidence} />

            {modelAccuracy != null && (
              <div className="model-accuracy-block">
                <p className="model-accuracy-label">Model Accuracy</p>

                <p className="model-accuracy-value">
                  {modelAccuracy.toFixed(1)}%
                </p>

                <p className="model-accuracy-note">
                  Reported model evaluation accuracy
                </p>
              </div>
            )}
          </div>

          <div className="analysis-details-panel">
            <div className="detail-row">
              <span className="detail-label">Classification</span>

              <span
                className={`detail-value detail-result ${
                  isAIGenerated ? 'result-ai-text' : 'result-real-text'
                }`}
              >
                {result || 'Not available'}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="detail-value">{status}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Filename</span>

              <span className="detail-value">
                {analysisData.filename || 'Not available'}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Format</span>

              <span className="detail-value">
                {analysisData.fileType ||
                  (analysisData.filename?.includes('.')
                    ? analysisData.filename.split('.').pop().toUpperCase()
                    : 'Not available')}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">File Size</span>

              <span className="detail-value">
                {formatFileSize(analysisData.fileSize) || 'Not available'}
              </span>
            </div>

            {processingTime != null && (
              <div className="detail-row">
                <span className="detail-label">Processing Time</span>
                <span className="detail-value">
                  {formatReadableValue(processingTime)}
                </span>
              </div>
            )}

            {timestamp && (
              <div className="detail-row">
                <span className="detail-label">Analysis Timestamp</span>

                <span className="detail-value">
                  {new Date(timestamp).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Explanations use one heading per section */}
        <AnalysisTextSection
          title="Analysis Description"
          value={description}
        />

        <AnalysisTextSection
          title="Key Indicators"
          value={keyIndicators}
        />

        <AnalysisTextSection
          title="Class Probabilities"
          value={classProbabilities}
        />

        <AnalysisTextSection
          title="Model Reasoning"
          value={modelReasoning}
        />

        <AnalysisTextSection
          title="Visual Patterns"
          value={visualPatterns}
        />
      </div>

      {/* Actions */}
      <div className="analysis-actions">
        <button
          onClick={handleDownloadReport}
          className="btn-primary btn-download-report"
          disabled={downloadingReport}
        >
          {downloadingReport ? 'Generating Report...' : 'Download Report'}
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary"
        >
          New Analysis
        </button>

        <button
          onClick={() => navigate('/history')}
          className="btn-secondary"
        >
          View History
        </button>
      </div>
    </div>
  );
}