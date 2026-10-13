
import jsPDF from 'jspdf';
import { api } from './api';

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

async function loadImageAsDataUrl(url) {
  if (!url) return null;

  if (typeof url !== 'string') return null;

  if (url.startsWith('data:')) return url;

  try {
    const response = await fetch(url, { mode: 'cors' });

    if (!response.ok) return null;

    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);

      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function normalizeConfidence(value) {
  if (value == null || isNaN(value)) return null;

  const num = typeof value === 'string' ? parseFloat(value) : value;

  return num <= 1 ? num * 100 : num;
}

function formatTimestamp(ts) {
  if (!ts) return null;

  try {
    const date = new Date(ts);

    if (isNaN(date.getTime())) return null;

    return date.toLocaleString();
  } catch {
    return null;
  }
}

function formatFileSize(bytes) {
  if (bytes == null || isNaN(bytes)) return null;

  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function generateReport(analysisData) {
  const {
    originalImage,
    heatmapImage,
    overlayImage,
    detectionResult,
    filename,
    fileSize,
    fileType,
    timestamp,
  } = analysisData;

  const heatmap = detectionResult?.heatmap || {};

  const reportOriginalImage =
    heatmap.originalImage || originalImage;

  const reportHeatmapImage =
    heatmap.image || heatmapImage;

  const reportOverlayImage =
    heatmap.overlay || overlayImage;

  const result =
    detectionResult?.prediction?.class ||
    detectionResult?.result?.prediction?.class ||
    (typeof detectionResult?.result === 'string'
      ? detectionResult.result
      : null) ||
    detectionResult?.classification ||
    detectionResult?.class ||
    null;

  const confidence = normalizeConfidence(
    detectionResult?.prediction?.confidence ??
    detectionResult?.result?.prediction?.confidence ??
    detectionResult?.confidence ??
    detectionResult?.confidenceScore
  );

  const modelAccuracy =
    detectionResult?.modelAccuracy != null
      ? normalizeConfidence(detectionResult.modelAccuracy)
      : null;

const status =
  detectionResult?.reportStatus ||
  detectionResult?.status ||
  detectionResult?.result?.reportStatus ||
  (detectionResult?.success === true ||
   detectionResult?.result?.success === true
    ? 'Completed'
    : 'Not available');


  const description =
    detectionResult?.description ||
    detectionResult?.analysis ||
    detectionResult?.reasoning ||
    detectionResult?.geminiReport?.executiveSummary ||
    null;

  const analysisTs = formatTimestamp(
    timestamp ||
    detectionResult?.timestamp ||
    detectionResult?.analysisTimestamp ||
    detectionResult?.createdAt ||
    detectionResult?.created_at ||
    detectionResult?.detectedAt ||
    detectionResult?.updatedAt
  );

  const doc = new jsPDF('p', 'mm', 'a4');

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let y = margin;

  // === Header ===
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Image Authenticity Analysis Report', margin, y);

  y += 5;

  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);

  y += 8;

  doc.setDrawColor(15, 76, 117);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 10;

  // === Project Logo ===
  try {
    const logoDataUrl = await loadImageAsDataUrl(
      window.location.origin + '/deepfake-logo.svg'
    );

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', margin, y, 15, 15);
    }
  } catch {
    // Skip logo if it fails.
  }

  doc.setFontSize(16);
  doc.setTextColor(15, 76, 117);
  doc.setFont(undefined, 'bold');

  doc.text('AI Deepfake Image Detection', margin + 20, y + 8);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(80);

  doc.text(
    'Image Authenticity Analysis Report',
    margin + 20,
    y + 14
  );

  y += 25;

  // === Section: Detection Result ===
  y = addSectionHeader(
    doc,
    'Detection Result',
    margin,
    y,
    pageWidth
  );

  y = addField(
    doc,
    'Classification',
    result || 'Not available',
    margin,
    y,
    contentWidth
  );

  y = addField(
    doc,
    'Confidence Score',
    confidence != null
      ? `${confidence.toFixed(1)}%`
      : 'Not available',
    margin,
    y,
    contentWidth
  );

  if (modelAccuracy != null) {
    y = addField(
      doc,
      'Model Accuracy',
      `${modelAccuracy.toFixed(1)}%`,
      margin,
      y,
      contentWidth
    );
  }

  y = addField(
    doc,
    'Analysis Status',
    status,
    margin,
    y,
    contentWidth
  );

  y += 5;

  // === Section: Image Information ===
  y = addSectionHeader(
    doc,
    'Image Information',
    margin,
    y,
    pageWidth
  );

  y = addField(
    doc,
    'Filename',
    filename || 'Not available',
    margin,
    y,
    contentWidth
  );

  y = addField(
    doc,
    'Format',
    fileType ||
      (filename
        ? filename.split('.').pop().toUpperCase()
        : 'Not available'),
    margin,
    y,
    contentWidth
  );

  y = addField(
    doc,
    'File Size',
    formatFileSize(fileSize) || 'Not available',
    margin,
    y,
    contentWidth
  );

  y += 5;

  // === Section: Visualizations ===
  y = addSectionHeader(
    doc,
    'Visualizations',
    margin,
    y,
    pageWidth
  );

  const imageWidth = (contentWidth - 10) / 3;
  const imageHeight = imageWidth * 0.75;

  const positions = [
    margin,
    margin + imageWidth + 5,
    margin + 2 * (imageWidth + 5),
  ];

  const labels = [
    'Original Image',
    'Detection Heatmap',
    'Heatmap Overlay',
  ];

  const imageUrls = [
    reportOriginalImage,
    reportHeatmapImage,
    reportOverlayImage,
  ];

  // Load images.
  const loadedImages = await Promise.all(
    imageUrls.map(async (url) => {
      const resolved = resolveImageUrl(url);

      if (!resolved) return null;

      return await loadImageAsDataUrl(resolved);
    })
  );

  // Check if a new page is needed.
  if (y + imageHeight + 15 > pageHeight - margin) {
    doc.addPage();
    y = margin;
  }

  for (let i = 0; i < 3; i++) {
    const xPos = positions[i];
    const label = labels[i];
    const imgData = loadedImages[i];

    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(60);

    doc.text(label, xPos, y);

    doc.setFont(undefined, 'normal');

    if (imgData) {
      try {
        const imageFormat = imgData.startsWith('data:image/png')
          ? 'PNG'
          : 'JPEG';

        doc.addImage(
          imgData,
          imageFormat,
          xPos,
          y + 3,
          imageWidth,
          imageHeight
        );
      } catch {
        doc.setFillColor(240, 240, 240);

        doc.rect(
          xPos,
          y + 3,
          imageWidth,
          imageHeight,
          'F'
        );

        doc.setFontSize(7);
        doc.setTextColor(150);

        doc.text(
          'Image not available',
          xPos + imageWidth / 2 - 15,
          y + 3 + imageHeight / 2
        );
      }
    } else {
      doc.setFillColor(240, 240, 240);

      doc.rect(
        xPos,
        y + 3,
        imageWidth,
        imageHeight,
        'F'
      );

      doc.setFontSize(7);
      doc.setTextColor(150);

      if (i === 0) {
        doc.text(
          'Image not available',
          xPos + imageWidth / 2 - 15,
          y + 3 + imageHeight / 2
        );
      } else {
        doc.text(
          'Not provided for',
          xPos + imageWidth / 2 - 18,
          y + 3 + imageHeight / 2 - 2
        );

        doc.text(
          'this analysis',
          xPos + imageWidth / 2 - 15,
          y + 3 + imageHeight / 2 + 4
        );
      }
    }
  }

  y += imageHeight + 15;

  // === Section: Analysis Description ===
  if (y + 20 > pageHeight - margin) {
    doc.addPage();
    y = margin;
  }

  y = addSectionHeader(
    doc,
    'Analysis Description',
    margin,
    y,
    pageWidth
  );

  const descriptionText =
    description ||
    generateDefaultDescription(result, confidence, filename);

  y = addWrappedText(
    doc,
    descriptionText,
    margin,
    y,
    contentWidth,
    10
  );

  y += 5;

  // === Footer ===
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setFontSize(7);
    doc.setTextColor(150);

    doc.text(
      `AI Deepfake Image Detection - Page ${i} of ${pageCount}`,
      pageWidth / 2 - 20,
      pageHeight - 8
    );
  }

  // === Download ===
  const reportName = `deepfake-report-${
    filename ? filename.replace(/\.[^.]+$/, '') : 'image'
  }-${Date.now()}.pdf`;

  doc.save(reportName);
}

function addSectionHeader(doc, title, margin, y, pageWidth) {
  if (y + 10 > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(15, 76, 117);

  doc.text(title, margin, y);

  doc.setDrawColor(15, 76, 117);
  doc.setLineWidth(0.3);

  doc.line(margin, y + 2, pageWidth - margin, y + 2);

  doc.setFont(undefined, 'normal');

  return y + 8;
}

function addField(doc, label, value, margin, y, contentWidth) {
  if (y + 8 > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(60);

  doc.text(`${label}:`, margin, y);

  doc.setFont(undefined, 'normal');
  doc.setTextColor(40);

  const labelWidth = doc.getTextWidth(`${label}: `);

  doc.text(
    String(value),
    margin + labelWidth,
    y
  );

  return y + 7;
}

function addWrappedText(doc, text, margin, y, contentWidth, fontSize) {
  doc.setFontSize(fontSize);
  doc.setTextColor(40);

  const lines = doc.splitTextToSize(text, contentWidth);

  for (const line of lines) {
    if (y + 6 > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }

    doc.text(line, margin, y);
    y += 5;
  }

  return y;
}

function generateDefaultDescription(result, confidence, filename) {
  const classification = result || 'unknown';

  const confidenceStr =
    confidence != null
      ? `${confidence.toFixed(1)}%`
      : 'not reported';

  return `The submitted image${
    filename ? ` "${filename}"` : ''
  } was analyzed by the image authenticity detection system and classified as ${classification}. The reported confidence score was ${confidenceStr}.`;
}
