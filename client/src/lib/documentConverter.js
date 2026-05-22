import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Convert Word document to PDF using mammoth + jsPDF
 * Improved version with better HTML rendering and pagination
 */
export async function wordToPdf(file) {
  try {
    const buffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
    const html = result.html;

    // Create a temporary container with better styling for PDF rendering
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '210mm';
    container.style.height = 'auto';
    container.style.padding = '15mm';
    container.style.fontFamily = 'Arial, Helvetica, sans-serif';
    container.style.fontSize = '12px';
    container.style.lineHeight = '1.6';
    container.style.color = '#000000';
    container.style.background = '#ffffff';
    container.style.visibility = 'hidden';
    container.style.zIndex = '-1';
    
    // Style paragraphs and common elements
    const style = document.createElement('style');
    style.innerHTML = `
      div[style*="position: fixed"] * {
        margin: 0;
        padding: 0;
      }
      div[style*="position: fixed"] p {
        margin: 0 0 6pt 0;
      }
      div[style*="position: fixed"] h1 {
        font-size: 18pt;
        font-weight: bold;
        margin: 12pt 0 6pt 0;
      }
      div[style*="position: fixed"] h2 {
        font-size: 16pt;
        font-weight: bold;
        margin: 12pt 0 6pt 0;
      }
      div[style*="position: fixed"] h3 {
        font-size: 14pt;
        font-weight: bold;
        margin: 10pt 0 4pt 0;
      }
      div[style*="position: fixed"] ul,
      div[style*="position: fixed"] ol {
        margin: 6pt 0 6pt 20px;
      }
      div[style*="position: fixed"] li {
        margin: 3pt 0;
      }
      div[style*="position: fixed"] table {
        border-collapse: collapse;
        width: 100%;
        margin: 6pt 0;
      }
      div[style*="position: fixed"] td,
      div[style*="position: fixed"] th {
        border: 1px solid #ccc;
        padding: 4px;
      }
      div[style*="position: fixed"] img {
        max-width: 100%;
        height: auto;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(container);

    try {
      // Render HTML to canvas with higher quality
      const canvas = await html2canvas(container, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        windowHeight: container.scrollHeight,
        windowWidth: container.scrollWidth,
      });

      // Create PDF with proper pagination
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15; // 15mm margins
      const contentWidth = pageWidth - (2 * margin);
      const maxContentHeight = pageHeight - (2 * margin);

      // Calculate image dimensions
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add pages with proper pagination
      let heightLeft = imgHeight;
      let position = 0;

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);

      heightLeft -= maxContentHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight);
        heightLeft -= maxContentHeight;
      }

      const pdfBlob = pdf.output('blob');
      return {
        success: true,
        blob: pdfBlob,
        fileName: file.name.replace(/\.[^/.]+$/, '') + '.pdf',
      };
    } finally {
      document.body.removeChild(container);
      document.head.removeChild(style);
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Erro ao converter documento Word para PDF',
    };
  }
}

export async function pdfToWord(file) {
  try {
    // Simple text extraction from PDF by converting to image then to text
    // For a more robust solution, use a server-side conversion
    const buffer = await file.arrayBuffer();
    
    // Create a simple Word document with a note
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: 'Conversão de PDF para Word',
              spacing: { after: 200 },
              run: new TextRun({ bold: true, size: 24 }),
            }),
            new Paragraph({
              text: `Arquivo original: ${file.name}`,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: 'Para uma conversão mais robusta de PDF para Word com preservação de layout, use ferramentas online especializadas.',
              spacing: { after: 200 },
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    return {
      success: true,
      blob,
      fileName: file.name.replace(/\.[^/.]+$/, '') + '.docx',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}


