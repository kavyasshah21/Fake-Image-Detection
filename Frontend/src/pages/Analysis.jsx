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

if (typeof url !== 'string' || !url.trim()) return null;

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

function formatReadableValue(value) {
if (value == null || value === '') return 'Not available';

if (typeof value === 'string') return value;

if (typeof value === 'number' || typeof value === 'boolean') {
return String(value);
}

if (Array.isArray(value)) {
return value.map(formatReadableValue).join('\n');
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
return ( <section className="analysis-description-block"> <h3>{title}</h3> <div className="analysis-readable-list">
{value.map((item, index) => ( <p key={index}>{formatReadableValue(item)}</p>
))} </div> </section>
);
}

return ( <section className="analysis-description-block"> <h3>{title}</h3> <p>{formatReadableValue(value)}</p> </section>
);
}

function extractImageRecord(response) {
if (!response || typeof response !== 'object') return {};
return response.image || response.data?.image || response;
}

function extractDetectionResult(record) {
if (!record || typeof record !== 'object') return {};

const candidates = [
record.detectionResult,
record.detection,
record.analysis,
record.result,
record.data?.detectionResult,
record.data?.result,
];

for (const candidate of candidates) {
if (candidate && typeof candidate === 'object') {
return candidate;
}
}

return {};
}

function extractHeatmap(detection, record, routeState) {
const savedHeatmap =
detection?.heatmap && typeof detection.heatmap === 'object'
? detection.heatmap
: {};

const recordHeatmap =
record?.heatmap && typeof record.heatmap === 'object'
? record.heatmap
: {};

const routeDetection = routeState?.detectionResult || {};
const routeHeatmap =
routeDetection.heatmap &&
typeof routeDetection.heatmap === 'object'
? routeDetection.heatmap
: {};

return {
originalImage: resolveImageUrl(
savedHeatmap.originalImage ||
recordHeatmap.originalImage ||
detection?.originalImage ||
detection?.image ||
record?.imageUrl ||
record?.originalImage ||
routeHeatmap.originalImage ||
routeState?.originalImage
),


image: resolveImageUrl(
  savedHeatmap.image ||
    savedHeatmap.heatmapImage ||
    detection?.heatmapImage ||
    detection?.heatmapUrl ||
    record?.heatmapImage ||
    record?.heatmapUrl ||
    recordHeatmap.image ||
    routeHeatmap.image
),

overlay: resolveImageUrl(
  savedHeatmap.overlay ||
    savedHeatmap.overlayImage ||
    detection?.overlayImage ||
    detection?.overlayUrl ||
    record?.overlayImage ||
    record?.overlayUrl ||
    recordHeatmap.overlay ||
    routeHeatmap.overlay
),

};
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
  setLoading(true);
  setError('');

  try {
    let record = {};
    let detection = {};

    if (routeState.fromHistory || !routeState.detectionResult) {
      const response = await api.getImageById(routeState.imageId);

      if (cancelled) return;

      record = extractImageRecord(response);
      detection = extractDetectionResult(record);

      if (
        Object.keys(detection).length === 0 &&
        routeState.detectionResult
      ) {
        detection = routeState.detectionResult;
      }
    } else {
      record = routeState.historyDetail || {};
      detection = routeState.detectionResult;

      if (Object.keys(record).length === 0) {
        record = {
          imageUrl: routeState.originalImage,
          fileName: routeState.filename,
          createdAt: routeState.timestamp,
        };
      }
    }

    const visualizations = extractHeatmap(
      detection,
      record,
      routeState
    );

    setAnalysisData({
      imageId: record._id || routeState.imageId,
      originalImage: visualizations.originalImage,
      heatmapImage: visualizations.image,
      overlayImage: visualizations.overlay,
      detectionResult: detection,
      filename:
        record.fileName ||
        record.filename ||
        routeState.filename ||
        'image',
      fileSize: record.fileSize ?? routeState.fileSize ?? null,
      fileType: record.fileType || routeState.fileType || null,
      timestamp:
        record.createdAt ||
        record.uploadedAt ||
        record.timestamp ||
        routeState.timestamp ||
        detection.timestamp ||
        null,
      processingTime:
        detection.processingTime || record.processingTime || null,
    });
  } catch (err) {
    if (cancelled) return;

    if (err.status === 401) {
      setError('Your session has expired. Please log in again.');
    } else {
      setError(
        err.message ||
          'Unable to load analysis details. Please try again.'
      );
    }
  } finally {
    if (!cancelled) setLoading(false);
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
return ( <div className="analysis-page"> <LoadingSpinner label="Loading analysis details..." /> </div>
);
}

if (error && !analysisData) {
return ( <div className="analysis-page"> <ErrorBanner message={error} /> <div className="analysis-back">
<button
onClick={() => navigate('/dashboard')}
className="btn-secondary"
>
Back to Dashboard </button> </div> </div>
);
}

if (!analysisData) {
return ( <div className="analysis-page"> <LoadingSpinner label="Loading analysis..." /> </div>
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
detection.reasoning ||
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

return ( <div className="analysis-page"> <div className="analysis-header"> <h1>Analysis Complete</h1> <p>
Your image has been analyzed. Review the detailed results below. </p> </div>


  {error && <ErrorBanner message={error} />}

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
