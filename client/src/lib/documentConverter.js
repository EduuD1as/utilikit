import { Document, Packer, Paragraph, TextRun } from 'docx';
import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function wordToPdf(file) {
  const style = document.createElement('style');
  const container = document.createElement('div');

  try {
    const buffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
    const html = result.html;

    // Style paragraphs and common elements
    style.innerHTML = `
      .pdf-converter-temp * {
        margin: 0;
        padding: 0;
      }
      .pdf-converter-temp p {
        margin: 0 0 6pt 0;
        line-height: 1.5;
      }
      .pdf-converter-temp h1 {
        font-size: 18pt;
        font-weight: bold;
        margin: 12pt 0 6pt 0;
      }
      .pdf-converter-temp h2 {
        font-size: 16pt;
        font-weight: bold;
        margin: 12pt 0 6pt 0;
      }
      .pdf-converter-temp h3 {
        font-size: 14pt;
        font-weight: bold;
        margin: 10pt 0 4pt 0;
      }
      .pdf-converter-temp ul,
      .pdf-converter-temp ol {
        margin: 6pt 0 6pt 20px;
      }
      .pdf-converter-temp li {
        margin: 3pt 0;
      }
      .pdf-converter-temp table {
        border-collapse: collapse;
        width: 100%;
        margin: 6pt 0;
      }
      .pdf-converter-temp td,
      .pdf-converter-temp th {
        border: 1px solid #ccc;
        padding: 4px;
      }
      .pdf-converter-temp img {
        max-width: 100%;
        height: auto;
      }
    `;

    // Create a temporary container with proper styling for PDF rendering
    container.className = 'pdf-converter-temp';
    container.innerHTML = html;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm';
    container.style.padding = '15mm';
    container.style.fontFamily = 'Arial, Helvetica, sans-serif';
    container.style.fontSize = '12px';
    container.style.color = '#000000';
    container.style.background = '#ffffff';

    document.head.appendChild(style);
    document.body.appendChild(container);

    // Render HTML to canvas with higher quality
    const canvas = await html2canvas(container, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
    });

    // Create PDF with proper pagination
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;
    const maxContentHeight = pageHeight - 2 * margin;

    // Calculate image dimensions
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add first page
    let heightLeft = imgHeight;
    let position = 0;

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);

    heightLeft -= maxContentHeight;

    // Add additional pages as needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight);
      heightLeft -= maxContentHeight;
    }

    const pdfBlob = pdf.output('blob');

    if (!pdfBlob || pdfBlob.size === 0) {
      throw new Error('Falha ao gerar PDF: blob inválido');
    }

    return {
      success: true,
      blob: pdfBlob,
      fileName: file.name.replace(/\.[^/.]+$/, '') + '.pdf',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Erro ao converter documento Word para PDF',
    };
  } finally {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    if (style.parentNode) {
      document.head.removeChild(style);
    }
  }
}

export async function pdfToWord(file) {
  try {
    const buffer = await file.arrayBuffer();
<<<<<<< HEAD

    // Create a simple Word document with a note
=======
    
>>>>>>> f7e6d7cb6c4f06bbc02616c3c4f9ab529826940e
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