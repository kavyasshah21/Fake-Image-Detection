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
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('data:')) return url;

  try {
    const response = await fetch(url, { mode: 'cors' });

    if (!response.ok) return null;

    const blob = await response.blob();

    return await new Promise((resolve) => {
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
  if (value == null || value === '' || isNaN(Number(value))) {
    return null;
  }

  const num = Number(value);
  return num <= 1 ? num * 100 : num;
}

function formatTimestamp(value) {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString();
}

function formatFileSize(bytes) {
  if (bytes == null || isNaN(Number(bytes))) return null;

  const size = Number(bytes);

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function stringifyValue(value) {
  if (value === null || value === undefined || value === '') {
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
      .map((item) => stringifyValue(item))
      .join('\n');
  }

  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, item]) => item !== undefined && item !== null)
      .map(([key, item]) => {
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/[_-]/g, ' ')
          .replace(/^./, (char) => char.toUpperCase());

        if (typeof item === 'object') {
          return `${label}:\n${stringifyValue(item)}`;
        }

        return `${label}: ${String(item)}`;
      })
      .join('\n');
  }

  return String(value);
}

function addSectionHeader(doc, title, margin, y, pageWidth) {
  const pageHeight = doc.internal.pageSize.getHeight();

  if (y + 12 > pageHeight - 18) {
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

  return y + 9;
}

function addField(doc, label, value, margin, y, contentWidth) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const safeValue = stringifyValue(value);
  const labelText = `${label}:`;

  doc.setFontSize(9);

  const labelWidth = Math.min(
    doc.getTextWidth(labelText) + 3,
    contentWidth * 0.4
  );

  const valueWidth = Math.max(
    contentWidth - labelWidth,
    contentWidth * 0.6
  );

  doc.setFont(undefined, 'bold');
  const labelLines = doc.splitTextToSize(labelText, labelWidth);

  doc.setFont(undefined, 'normal');
  const valueLines = doc.splitTextToSize(safeValue, valueWidth);

  const lineCount = Math.max(labelLines.length, valueLines.length);
  const blockHeight = lineCount * 4.5 + 3;

  if (y + blockHeight > pageHeight - 17) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.setFont(undefined, 'bold');
  doc.text(labelLines, margin, y);

  doc.setFont(undefined, 'normal');
  doc.setTextColor(40);
  doc.text(valueLines, margin + labelWidth, y);

  return y + blockHeight;
}

function addWrappedText(doc, text, margin, y, contentWidth, fontSize = 9) {
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(fontSize);
  doc.setTextColor(40);

  const lines = doc.splitTextToSize(String(text), contentWidth);

  for (const line of lines) {
    if (y + 6 > pageHeight - 17) {
      doc.addPage();
      y = 20;
    }

    doc.text(line, margin, y);
    y += 5;
  }

  return y;
}

function addImagePlaceholder(
  doc,
  label,
  x,
  y,
  width,
  height,
  message
) {
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(60);
  doc.text(label, x, y);

  doc.setFillColor(240, 243, 247);
  doc.rect(x, y + 3, width, height, 'F');

  doc.setFont(undefined, 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120);

  const lines = doc.splitTextToSize(message, width - 4);
  doc.text(lines, x + 2, y + height / 2 + 3);
}

function addDetailSection(
  doc,
  title,
  value,
  margin,
  y,
  contentWidth,
  pageWidth
) {
  if (value === undefined || value === null) return y;

  y = addSectionHeader(doc, title, margin, y, pageWidth);

  y = addWrappedText(
    doc,
    stringifyValue(value),
    margin,
    y,
    contentWidth
  );

  return y + 4;
}

function getImageFormat(dataUrl) {
  if (dataUrl.startsWith('data:image/png')) return 'PNG';
  if (dataUrl.startsWith('data:image/jpeg')) return 'JPEG';
  if (dataUrl.startsWith('data:image/webp')) return 'WEBP';

  return null;
}

function safeFilename(filename) {
  const baseName = (filename || 'image')
    .split(/[\\/]/)
    .pop()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return baseName || 'image';
}

export async function generateReport(analysisData) {
  if (!analysisData) {
    throw new Error('Analysis data is missing.');
  }

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

  const detection = detectionResult || {};

  const heatmap =
    detection.heatmap && typeof detection.heatmap === 'object'
      ? detection.heatmap
      : {};

  const reportOriginalImage =
    heatmap.originalImage ||
    detection.image ||
    originalImage;

  const reportHeatmapImage =
    heatmap.image ||
    detection.heatmapImage ||
    detection.heatmapUrl ||
    heatmapImage;

  const reportOverlayImage =
    heatmap.overlay ||
    detection.overlayImage ||
    detection.overlayUrl ||
    overlayImage;

  const result =
    detection.prediction?.class ||
    detection.result?.prediction?.class ||
    (typeof detection.result === 'string' ? detection.result : null) ||
    detection.classification ||
    detection.class ||
    null;

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
    detection.result?.reportStatus ||
    (detection.success === true
      ? 'Completed'
      : detection.success === false
        ? 'Failed'
        : 'Not available');

  const analysisTimestamp =
    timestamp ||
    detection.createdAt ||
    detection.timestamp ||
    detection.analysisTimestamp ||
    detection.created_at ||
    detection.detectedAt ||
    detection.updatedAt;

  const description =
    detection.reasoning ||
    detection.description ||
    detection.analysis ||
    detection.geminiReport?.executiveSummary ||
    null;

  const doc = new jsPDF('p', 'mm', 'a4');

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let y = margin;

  // Report header
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Image Authenticity Analysis Report', margin, y);

  y += 5;

  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);

  y += 5;

  doc.setDrawColor(15, 76, 117);
  doc.line(margin, y, pageWidth - margin, y);

  y += 9;

  // Logo - optional
  if (typeof window !== 'undefined') {
    const logoDataUrl = await loadImageAsDataUrl(
      `${window.location.origin}/deepfake-logo.png`
    );

    if (logoDataUrl) {
      const logoFormat = getImageFormat(logoDataUrl);

      if (logoFormat) {
        try {
          doc.addImage(logoDataUrl, logoFormat, margin, y, 14, 14);
        } catch {
          // Continue without the logo if it cannot be embedded.
        }
      }
    }
  }

  doc.setFontSize(16);
  doc.setTextColor(15, 76, 117);
  doc.setFont(undefined, 'bold');
  doc.text('AI Deepfake Image Detection', margin + 18, y + 7);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(80);
  doc.text('Comprehensive Analysis Report', margin + 18, y + 13);

  y += 23;

  // Detection result
  y = addSectionHeader(doc, 'Detection Result', margin, y, pageWidth);

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
    confidence != null ? `${confidence.toFixed(1)}%` : 'Not available',
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
    'Success',
    detection.success ?? 'Not provided',
    margin,
    y,
    contentWidth
  );

  y = addField(
    doc,
    'Report Status',
    status,
    margin,
    y,
    contentWidth
  );

  if (description) {
    y = addField(
      doc,
      'Description',
      description,
      margin,
      y,
      contentWidth
    );
  }

  y += 3;

  // Image information
  y = addSectionHeader(doc, 'Image Information', margin, y, pageWidth);

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
      (filename && filename.includes('.')
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

  y = addField(
    doc,
    'Analysis Timestamp',
    formatTimestamp(analysisTimestamp) || 'Not available',
    margin,
    y,
    contentWidth
  );

  y = addField(
    doc,
    'Record Created',
    formatTimestamp(detection.createdAt) ||
      detection.createdAt ||
      'Not provided',
    margin,
    y,
    contentWidth
  );

  y = addField(
    doc,
    'Last Updated',
    formatTimestamp(detection.updatedAt) ||
      detection.updatedAt ||
      'Not provided',
    margin,
    y,
    contentWidth
  );

  y += 3;

  // Visual analysis
  y = addSectionHeader(doc, 'Visual Analysis', margin, y, pageWidth);

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

  const loadedImages = await Promise.all(
    imageUrls.map(async (url) => {
      const resolved = resolveImageUrl(url);
      return resolved ? loadImageAsDataUrl(resolved) : null;
    })
  );

  if (y + imageHeight + 12 > pageHeight - margin) {
    doc.addPage();
    y = margin;
  }

  for (let i = 0; i < 3; i++) {
    const imageData = loadedImages[i];

    if (!imageData) {
      addImagePlaceholder(
        doc,
        labels[i],
        positions[i],
        y,
        imageWidth,
        imageHeight,
        'Image not available'
      );

      continue;
    }

    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(60);
    doc.text(labels[i], positions[i], y);

    try {
      const format = getImageFormat(imageData);

      if (!format) {
        throw new Error('Unsupported image format.');
      }

      doc.addImage(
        imageData,
        format,
        positions[i],
        y + 3,
        imageWidth,
        imageHeight
      );
    } catch {
      addImagePlaceholder(
        doc,
        labels[i],
        positions[i],
        y,
        imageWidth,
        imageHeight,
        'Image format not supported'
      );
    }
  }

  y += imageHeight + 12;

  // Additional analysis information
  y = addDetailSection(
    doc,
    'Key Indicators',
    detection.keyIndicators,
    margin,
    y,
    contentWidth,
    pageWidth
  );

  y = addDetailSection(
    doc,
    'Class Probabilities',
    detection.probabilities,
    margin,
    y,
    contentWidth,
    pageWidth
  );

  y = addDetailSection(
    doc,
    'Model Reasoning',
    detection.reasoning,
    margin,
    y,
    contentWidth,
    pageWidth
  );

  y = addDetailSection(
    doc,
    'Visual Patterns',
    detection.visualPatterns,
    margin,
    y,
    contentWidth,
    pageWidth
  );

 

  // Associated user - exclude sensitive fields
  if (detection.user != null) {
    let safeUser = detection.user;

    if (typeof safeUser === 'object' && !Array.isArray(safeUser)) {
      safeUser = Object.fromEntries(
        Object.entries(safeUser).filter(
          ([key]) => !/password|token|secret|credential/i.test(key)
        )
      );
    }

    y = addDetailSection(
      doc,
      'Associated User',
      safeUser,
      margin,
      y,
      contentWidth,
      pageWidth
    );
  }

  // Footer on every page
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setFontSize(7);
    doc.setTextColor(150);

    doc.text(
      `AI Deepfake Image Detection - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  // Download as PDF, not JSON
  const name = safeFilename(filename);

  doc.save(`deepfake-report-${name}-${Date.now()}.pdf`);
}