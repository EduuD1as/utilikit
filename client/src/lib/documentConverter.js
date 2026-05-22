import * as PDFJS from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import mammoth from 'mammoth';

PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;

export async function wordToPdf(file) {
  try {
    const buffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
    
    return {
      success: true,
      html: result.html,
      messages: result.messages,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function pdfToWord(file) {
  try {
    const buffer = await file.arrayBuffer();
    const pdf = await PDFJS.getDocument({ data: buffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    // Create Word document from extracted text
    const sections = fullText
      .split('\n\n')
      .filter((s) => s.trim())
      .map(
        (text) =>
          new Paragraph({
            text: text.trim(),
            spacing: { after: 200 },
          })
      );

    const doc = new Document({
      sections: [
        {
          children: sections.length > 0 ? sections : [new Paragraph('Nenhum texto encontrado no PDF.')],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    return {
      success: true,
      blob,
      fileName: 'documento.docx',
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
