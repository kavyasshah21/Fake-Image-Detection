// import { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { api } from '../services/api';
// import { generateReport } from '../services/reportGenerator';
// import LoadingSpinner, { ErrorBanner } from '../components/UIComponents';
// import ConfidenceIndicator from '../components/ConfidenceIndicator';

// function resolveImageUrl(url) {
//   if (!url) return null;

//   // Handle cases where the backend returns an object
//   if (typeof url === 'object') {
//     url =
//       url.url ||
//       url.imageUrl ||
//       url.path ||
//       url.data ||
//       null;
//   }

//   // Ignore unsupported values
//   if (typeof url !== 'string' || !url.trim()) {
//     return null;
//   }

//   if (
//     url.startsWith('data:') ||
//     url.startsWith('http://') ||
//     url.startsWith('https://') ||
//     url.startsWith('blob:')
//   ) {
//     return url;
//   }

//   return api.resolveUrl(url);
// }

// function normalizeConfidence(value) {
//   if (value == null || isNaN(value)) return null;
//   const num = typeof value === 'string' ? parseFloat(value) : value;
//   return num <= 1 ? num * 100 : num;
// }

// function formatFileSize(bytes) {
//   if (!bytes) return null;
//   if (bytes < 1024) return `${bytes} B`;
//   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//   return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
// }

// export default function Analysis() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [analysisData, setAnalysisData] = useState(null);
//   const [downloadingReport, setDownloadingReport] = useState(false);

//   const routeState = location.state;

//   useEffect(() => {
//     if (!routeState?.imageId) {
//       navigate('/dashboard');
//       return;
//     }

//     // If we have detection result from the dashboard, use it
//     if (routeState.detectionResult) {
      
//       const detection = routeState.detectionResult;
//   const heatmap = detection.heatmap || {};

// setAnalysisData({
//   imageId: routeState.imageId,

//   originalImage: resolveImageUrl(
//     heatmap.originalImage ||
//     routeState.originalImage
//   ),

//   heatmapImage: resolveImageUrl(
//     heatmap.image ||
//     detection.heatmapImage ||
//     detection.heatmapUrl
//   ),

//   overlayImage: resolveImageUrl(
//     heatmap.overlay ||
//     detection.overlayImage ||
//     detection.overlayUrl
//   ),

//   detectionResult: detection,
//   filename: routeState.filename,
//   fileSize: routeState.fileSize,
//   fileType: routeState.fileType,
//   timestamp: routeState.timestamp || detection.timestamp,
//   processingTime: detection.processingTime,
// });
    
//     }

//     // If coming from history, fetch full details
//     if (routeState.fromHistory || !routeState.detectionResult) {
//       setLoading(true);
//       api
//         .getImageById(routeState.imageId)
//         .then((detail) => {
//           const detection = detail.detection || detail.result || detail.analysis || detail.detectionResult || null;
//           setAnalysisData({
//             imageId: routeState.imageId,
//             originalImage: resolveImageUrl(detail.imageUrl || detail.url || detail.originalImage || routeState.originalImage),
//             heatmapImage: resolveImageUrl(detection?.heatmapImage || detection?.heatmap || detection?.heatmapUrl || detail.heatmapImage),
//             overlayImage: resolveImageUrl(detection?.overlayImage || detection?.overlay || detection?.overlayUrl || detail.overlayImage),
//             detectionResult: detection || routeState.detectionResult || {},
//             filename: detail.filename || routeState.filename,
//             fileSize: detail.fileSize || routeState.fileSize,
//             fileType: detail.fileType || routeState.fileType,
//             timestamp: detail.createdAt || detail.timestamp || routeState.timestamp,
//             processingTime: detection?.processingTime || detail.processingTime,
//           });
//         })
//         .catch((err) => {
//           if (err.status === 401) {
//             setError('Your session has expired. Please log in again.');
//           } else {
//             setError(err.message || 'Unable to load analysis details. Please try again.');
//           }
//         })
//         .finally(() => setLoading(false));
//     }
//   }, [routeState, navigate]);

//   async function handleDownloadReport() {
//     if (!analysisData) return;
//     setDownloadingReport(true);
//     try {
//       await generateReport(analysisData);
//     } catch (err) {
//       setError('Unable to generate the report. Please try again.');
//     } finally {
//       setDownloadingReport(false);
//     }
//   }

//   if (loading) {
//     return (
//       <div className="analysis-page">
//         <LoadingSpinner label="Loading analysis details..." />
//       </div>
//     );
//   }

//   if (error && !analysisData) {
//     return (
//       <div className="analysis-page">
//         <ErrorBanner message={error} />
//         <div className="analysis-back">
//           <button onClick={() => navigate('/dashboard')} className="btn-secondary">
//             Back to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!analysisData) {
//     return (
//       <div className="analysis-page">
//         <LoadingSpinner label="Loading analysis..." />
//       </div>
//     );
//   }

//   const detection = analysisData.detectionResult;

// const result =
//   detection?.prediction?.class ||
//   detection?.result?.prediction?.class ||
//   (typeof detection?.result === 'string' ? detection.result : null) ||
//   detection?.classification ||
//   (typeof detection?.class === 'string' ? detection.class : null);

// const confidence = normalizeConfidence(
//   detection?.prediction?.confidence ??
//   detection?.result?.prediction?.confidence ??
//   detection?.confidence ??
//   detection?.confidenceScore
// );
//   const modelAccuracy = analysisData.detectionResult?.modelAccuracy != null
//     ? normalizeConfidence(analysisData.detectionResult.modelAccuracy)
//     : null;
//   const status = analysisData.detectionResult?.status || 'completed';
//   const description = analysisData.detectionResult?.description || analysisData.detectionResult?.analysis;
//   const processingTime = analysisData.processingTime || analysisData.detectionResult?.processingTime;
//   const timestamp = analysisData.timestamp || analysisData.detectionResult?.timestamp || analysisData.detectionResult?.analysisTimestamp;
//   const originalImage = analysisData.originalImage;
//   const heatmapImage = analysisData.heatmapImage;
//   const overlayImage = analysisData.overlayImage;

//   const isAIGenerated = (result || '').toUpperCase().includes('AI') ||
//     (result || '').toUpperCase().includes('FAKE') ||
//     (result || '').toUpperCase().includes('GENERATED');

//   return (
//     <div className="analysis-page">
//       <div className="analysis-header">
//         <h1>Analysis Complete</h1>
//         <p>Your image has been analyzed. Review the detailed results below.</p>
//       </div>

//       {error && <ErrorBanner message={error} />}

//       {/* Three-part heatmap visualization */}
//       <div className="heatmap-section">
//         <h2>Visual Analysis</h2>
//         <div className="heatmap-grid">
//           <div className="heatmap-card">
//             <h3 className="heatmap-card-title">Original Image</h3>
//             <div className="heatmap-image-container">
//               {originalImage ? (
//                 <img src={originalImage} alt="Original" className="heatmap-image" />
//               ) : (
//                 <div className="heatmap-placeholder">
//                   <p>Original image is not available.</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="heatmap-card">
//             <h3 className="heatmap-card-title">Detection Heatmap</h3>
//             <div className="heatmap-image-container">
//               {heatmapImage ? (
//                 <img src={heatmapImage} alt="Heatmap" className="heatmap-image" />
//               ) : (
//                 <div className="heatmap-placeholder">
//                   <p>Heatmap visualization is not available for this analysis.</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="heatmap-card">
//             <h3 className="heatmap-card-title">Heatmap Overlay</h3>
//             <div className="heatmap-image-container">
//               {overlayImage ? (
//                 <img src={overlayImage} alt="Overlay" className="heatmap-image" />
//               ) : (
//                 <div className="heatmap-placeholder">
//                   <p>Overlay visualization is not available for this analysis.</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Detection result summary */}
//       <div className="analysis-summary-section">
//         <h2>Detection Analysis</h2>
//         <div className="analysis-summary-grid">
//           <div className="analysis-confidence-panel">
//             <ConfidenceIndicator value={confidence} />
//             {modelAccuracy != null && (
//               <div className="model-accuracy-block">
//                 <p className="model-accuracy-label">Model Accuracy</p>
//                 <p className="model-accuracy-value">{modelAccuracy.toFixed(1)}%</p>
//                 <p className="model-accuracy-note">Measured during model evaluation</p>
//               </div>
//             )}
//           </div>

//           <div className="analysis-details-panel">
//             <div className="detail-row">
//               <span className="detail-label">Classification</span>
//               <span className={`detail-value detail-result ${isAIGenerated ? 'result-ai-text' : 'result-real-text'}`}>
//                 {result || 'Not available'}
//               </span>
//             </div>
//             <div className="detail-row">
//               <span className="detail-label">Status</span>
//               <span className="detail-value">{status}</span>
//             </div>
//             <div className="detail-row">
//               <span className="detail-label">Filename</span>
//               <span className="detail-value">{analysisData.filename || 'Not available'}</span>
//             </div>
//             <div className="detail-row">
//               <span className="detail-label">Format</span>
//               <span className="detail-value">
//                 {analysisData.fileType || (analysisData.filename ? analysisData.filename.split('.').pop().toUpperCase() : 'Not available')}
//               </span>
//             </div>
//             <div className="detail-row">
//               <span className="detail-label">File Size</span>
//               <span className="detail-value">{formatFileSize(analysisData.fileSize) || 'Not available'}</span>
//             </div>
//             {processingTime && (
//               <div className="detail-row">
//                 <span className="detail-label">Processing Time</span>
//                 <span className="detail-value">{processingTime}</span>
//               </div>
//             )}
//             {timestamp && (
//               <div className="detail-row">
//                 <span className="detail-label">Analysis Timestamp</span>
//                 <span className="detail-value">{new Date(timestamp).toLocaleString()}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {description && (
//           <div className="analysis-description-block">
//             <h3>Analysis Description</h3>
//             <p>{description}</p>
//           </div>
//         )}
//       </div>

//       {/* Actions */}
//       <div className="analysis-actions">
//         <button
//           onClick={handleDownloadReport}
//           className="btn-primary btn-download-report"
//           disabled={downloadingReport}
//         >
//           {downloadingReport ? 'Generating Report...' : 'Download Report'}
//         </button>
//         <button onClick={() => navigate('/dashboard')} className="btn-secondary">
//           New Analysis
//         </button>
//         <button onClick={() => navigate('/history')} className="btn-secondary">
//           View History
//         </button>
//       </div>
//     </div>
//   );
// }






import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/bmp',
];

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [isKeyboardSelecting, setIsKeyboardSelecting] = useState(false);

  // Generate a preview and release its URL when the file changes.
  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  function selectFile(selectedFile) {
    if (isAnalyzing) return;

    setError('');

    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setFile(null);
      setError(
        'Unsupported file format. Please select a JPG, PNG, WEBP, or BMP image.'
      );
      return;
    }

    if (selectedFile.size === 0) {
      setFile(null);
      setError('The selected image is empty. Please choose another file.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError('Image size must not exceed 10 MB.');
      return;
    }

    setFile(selectedFile);
  }

  function handleFileChange(event) {
    selectFile(event.target.files?.[0]);
    event.target.value = '';
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);

    if (isAnalyzing) return;

    selectFile(event.dataTransfer.files?.[0]);
  }

  function removeImage() {
    if (isAnalyzing) return;

    setFile(null);
    setError('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleAnalyze() {
    if (!file || isAnalyzing) {
      if (!file) setError('Please select an image first.');
      return;
    }

    setError('');
    setIsAnalyzing(true);

    try {
      // Send the image to the Node.js backend.
      const response = await api.detectImage(file);

      // Backend contract: { message, result, imageRecord }.
      const detectionResult = response?.result;
      const imageRecord = response?.imageRecord;

      if (!detectionResult) {
        throw new Error(
          'No prediction was returned by the server. Please try again.'
        );
      }

      if (!imageRecord?._id) {
        throw new Error(
          'The prediction was received, but the saved image ID is missing.'
        );
      }

      // Navigate to your existing Analysis.jsx page.
      navigate('/analysis', {
        state: {
          imageId: imageRecord._id,
          originalImage: imageRecord.imageUrl || previewUrl,
          filename: imageRecord.fileName || file.name,
          fileSize: file.size,
          fileType: file.type,
          timestamp:
            imageRecord.createdAt || new Date().toISOString(),
          detectionResult,
        },
      });
    } catch (err) {
      if (err.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(
          err.message ||
            'Image analysis failed. Check your backend and ML service.'
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="dashboard-page">
      {/* Dashboard heading */}
      <div className="dashboard-header">
        <h1>Fake Image Detection</h1>
        <p>
          Upload an image and use AI-powered analysis to examine whether
          it is real or AI-generated.
        </p>
      </div>

      <div className="dashboard-content">
        {/* Error message */}
        {error && (
          <div className="error-banner" role="alert">
            <span className="error-banner-icon">!</span>
            <span>
              {error}
              {error.includes('session has expired') && (
                <>
                  {' '}
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate('/login')}
                  >
                    Log in
                  </button>
                </>
              )}
            </span>
          </div>
        )}

        {/* Upload area */}
        {!file && (
          <div
            className={`upload-area ${isDragging ? 'dragging' : ''}`}
            role="button"
            tabIndex={isAnalyzing ? -1 : 0}
            aria-label="Choose an image or drop an image here"
            onClick={() => {
              if (!isAnalyzing) {
                setIsKeyboardSelecting(false);
                fileInputRef.current?.click();
              }
            }}
            onKeyDown={(event) => {
              if (
                !isAnalyzing &&
                (event.key === 'Enter' || event.key === ' ')
              ) {
                event.preventDefault();
                setIsKeyboardSelecting(true);
                fileInputRef.current?.click();
              }
            }}
            onDragEnter={(event) => {
              event.preventDefault();
              if (!isAnalyzing) setIsDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (!isAnalyzing) setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();

              if (!event.currentTarget.contains(event.relatedTarget)) {
                setIsDragging(false);
              }
            }}
            onDrop={handleDrop}
            style={{
              opacity: isAnalyzing ? 0.6 : 1,
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
            }}
          >
            <div className="upload-icon">
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 16V4" />
                <path d="m7 9 5-5 5 5" />
                <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
              </svg>
            </div>

            <h2 className="upload-title">
              Drag and drop your image here
            </h2>

            <p className="upload-subtitle">
              Or click anywhere in this area to browse your computer.
            </p>

            <p className="upload-formats">
              Supported formats: JPG, JPEG, PNG, WEBP, BMP · Maximum 10 MB
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/bmp,.jpg,.jpeg,.png,.webp,.bmp"
              onChange={handleFileChange}
              onClick={(event) => event.stopPropagation()}
              hidden
              disabled={isAnalyzing}
              aria-label="Select image file"
            />
          </div>
        )}

        {/* Image preview */}
        {file && (
          <div className="image-preview-section">
            <h2 className="upload-title">Selected Image</h2>

            <p className="upload-subtitle" style={{ marginBottom: '1rem' }}>
              Review your image before starting the analysis.
            </p>

            <div className="image-preview-container">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt={`Preview of ${file.name}`}
                  className="image-preview"
                />
              )}
            </div>

            <div className="image-info">
              <p className="image-info-name">{file.name}</p>
              <p className="image-info-size">
                {formatFileSize(file.size)} · {file.type}
              </p>
            </div>

            <div className="image-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={removeImage}
                disabled={isAnalyzing}
              >
                Remove Image
              </button>

              <button
                type="button"
                className="btn-primary btn-analyze"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
              </button>
            </div>
          </div>
        )}

        {/* Analysis loading animation */}
        {isAnalyzing && (
          <div className="analyzing-container" role="status">
            <div className="analyzing-animation">
              <div className="scan-line" />

              <div className="scan-grid">
                {Array.from({ length: 9 }, (_, index) => (
                  <div
                    className="scan-cell"
                    key={index}
                    style={{ animationDelay: `${index * 0.12}s` }}
                  />
                ))}
              </div>
            </div>

            <div className="analyzing-text">
              <h3>Analyzing Your Image</h3>
              <p>
                Your image is being processed by the detection model.
                Please wait...
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isAnalyzing && (
          <div className="detection-result-panel">
            <h3>How It Works</h3>

            <div className="detection-actions">
              <p>
                <strong>1. Upload:</strong> Choose a supported image file.
              </p>
              <p>
                <strong>2. Detect:</strong> Submit the image to the ML
                detection service.
              </p>
              <p>
                <strong>3. Review:</strong> View the prediction and
                available analysis visualizations.
              </p>
            </div>
          </div>
        )}

        {/* History navigation */}
        <div
          className="image-actions"
          style={{ marginTop: '1.5rem' }}
        >
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/history')}
          >
            View Analysis History
          </button>
        </div>
      </div>
    </div>
  );
}
