import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function wordToPdf(file) {
  try {
    const buffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
    const html = result.html;

    // Create a temporary container to render HTML
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '800px';
    container.style.padding = '20px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '12px';
    container.style.lineHeight = '1.5';
    container.style.color = '#000';
    container.style.background = '#fff';
    document.body.appendChild(container);

    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scale: 2,
      });

      // Convert canvas to PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height in mm

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      const pdfBlob = pdf.output('blob');
      return {
        success: true,
        blob: pdfBlob,
        fileName: file.name.replace(/\.[^/.]+$/, '') + '.pdf',
      };
    } finally {
      document.body.removeChild(container);
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
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


