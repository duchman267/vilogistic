import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';

/**
 * Generates a clean A4 portrait PDF of the STTB document and triggers direct file download.
 *
 * @param documentElementId The DOM element ID of the STTB document to capture
 * @param filename The desired filename (e.g. STTB-VLG-20261008-0001.pdf)
 * @returns Promise<boolean> indicating whether the download succeeded
 */
export async function downloadSTTBPdf(documentElementId: string, filename: string): Promise<boolean> {
  const element =
    document.getElementById(documentElementId) ||
    document.getElementById('sttb-printable-document') ||
    document.getElementById('sttb-print-only-document');

  if (!element) {
    const errorMsg = `Element with id "${documentElementId}" not found in DOM`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // 1. Capture the DOM element as high-resolution PNG using browser native rendering
    let dataUrl: string;
    try {
      dataUrl = await htmlToImage.toPng(element, {
        quality: 0.98,
        pixelRatio: 2.2,
        backgroundColor: '#ffffff',
        skipFonts: true,
        cacheBust: true,
      });
    } catch (primaryErr) {
      console.warn('html-to-image toPng attempt failed, trying toCanvas fallback:', primaryErr);
      const canvas = await htmlToImage.toCanvas(element, {
        backgroundColor: '#ffffff',
        skipFonts: true,
      });
      dataUrl = canvas.toDataURL('image/png');
    }

    if (!dataUrl || dataUrl.length < 200) {
      throw new Error('Captured image data URL is invalid or empty');
    }

    // 2. Load the image into Image object to measure its natural dimensions
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve, reject) => {
      img.onload = () => resolve(true);
      img.onerror = () => reject(new Error('Failed to load captured image data'));
    });

    // 3. Create A4 portrait PDF (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

    // Professional margins: 12mm on all sides as requested
    const margin = 12;
    const contentWidth = pageWidth - margin * 2; // 186mm
    const maxContentHeight = pageHeight - margin * 2; // 273mm

    // Compute proportional height
    const calculatedHeight = (img.height * contentWidth) / img.width;
    const finalHeight = Math.min(calculatedHeight, maxContentHeight);

    // 4. Add the document image to PDF
    pdf.addImage(dataUrl, 'PNG', margin, margin, contentWidth, finalHeight, undefined, 'FAST');

    // 5. Build proper filename: STTB-${sttbNumber}.pdf
    let safeFilename = filename.trim();
    if (!safeFilename.endsWith('.pdf')) {
      safeFilename = `${safeFilename}.pdf`;
    }

    // 6. Trigger direct browser download via Blob URL
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 2000);

    return true;
  } catch (error) {
    console.error('downloadSTTBPdf failed:', error);
    throw error;
  }
}

/**
 * Reliable native browser print trigger
 */
export function printSTTB(): void {
  try {
    if (typeof window !== 'undefined') {
      window.focus();
      window.print();
    }
  } catch (err) {
    console.error('Failed to trigger window.print():', err);
  }
}
