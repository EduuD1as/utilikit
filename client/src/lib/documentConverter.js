import { Document, Packer, Paragraph, TextRun } from 'docx';
import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker to use local worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export async function wordToPdf(file) {
  let container = null;
  let style = null;

  try {
    const buffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({
      arrayBuffer: buffer,
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Title'] => h1:fresh",
        "p[style-name='Subtitle'] => h2:fresh",
        "r[style-name='Strong'] => strong",
        "r[style-name='Emphasis'] => em",
        "r[style-name='Hyperlink'] => a",
      ],
      includeDefaultStyleMap: true,
    });
    const html = result.html;

    if (!html || html.trim() === '') {
      throw new Error('Documento Word vazio ou inválido');
    }

    // Create container with visible positioning for proper rendering
    container = document.createElement('div');
    container.id = 'pdf-converter-container-' + Date.now();
    container.innerHTML = html;

    // Set inline styles for proper rendering
    Object.assign(container.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '210mm',
      height: 'auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#000',
      backgroundColor: '#fff',
      zIndex: '99999',
      visibility: 'visible',
      opacity: '1',
      display: 'block',
    });

    // Add styles
    style = document.createElement('style');
    style.innerHTML = `
      #${container.id} * {
        box-sizing: border-box;
      }
      #${container.id} p {
        margin: 0 0 10px 0;
        padding: 0;
      }
      #${container.id} h1, #${container.id} h2, #${container.id} h3, #${container.id} h4, #${container.id} h5, #${container.id} h6 {
        margin: 15px 0 10px 0;
        padding: 0;
        font-weight: bold;
      }
      #${container.id} h1 { font-size: 24px; }
      #${container.id} h2 { font-size: 20px; }
      #${container.id} h3 { font-size: 18px; }
      #${container.id} ul, #${container.id} ol {
        margin: 10px 0;
        padding-left: 30px;
      }
      #${container.id} li {
        margin: 5px 0;
      }
      #${container.id} table {
        border-collapse: collapse;
        width: 100%;
        margin: 10px 0;
      }
      #${container.id} td, #${container.id} th {
        border: 1px solid #999;
        padding: 8px;
        text-align: left;
      }
      #${container.id} th {
        background: #f5f5f5;
        font-weight: bold;
      }
      #${container.id} img {
        max-width: 100%;
        height: auto;
      }
      #${container.id} strong, #${container.id} b {
        font-weight: bold;
      }
      #${container.id} em, #${container.id} i {
        font-style: italic;
      }
      #${container.id} u {
        text-decoration: underline;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(container);

    // Wait for styles to be applied and images to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create PDF using jsPDF with HTML
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Use jsPDF's html method to render the HTML directly
    await pdf.html(container, {
      callback: async (pdf) => {
        // PDF is ready
      },
      x: 10,
      y: 10,
      width: 190,
      windowWidth: 210 * 3.78,
    });

    const pdfBlob = pdf.output('blob');

    if (!pdfBlob || pdfBlob.size === 0) {
      throw new Error('PDF gerado está vazio');
    }

    return {
      success: true,
      blob: pdfBlob,
      fileName: file.name.replace(/\.[^/.]+$/, '') + '.pdf',
    };
  } catch (error) {
    console.error('Erro no conversor:', error);
    return {
      success: false,
      error: error.message || 'Erro ao converter documento Word para PDF',
    };
  } finally {
    // Clean up
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
    if (style && style.parentNode) {
      document.head.removeChild(style);
    }
  }
}

export async function pdfToWord(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    const pdf = await loadingTask.promise;

    const paragraphs = [];

    // Extract text from all pages with formatting
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Group text items by Y position to preserve paragraphs
      const itemsByY = {};
      textContent.items.forEach(item => {
        const y = Math.round(item.transform[5]);
        if (!itemsByY[y]) {
          itemsByY[y] = [];
        }
        itemsByY[y].push(item);
      });

      // Sort by Y position (top to bottom)
      const sortedY = Object.keys(itemsByY).map(Number).sort((a, b) => b - a);

      // Create paragraphs from grouped items
      sortedY.forEach(y => {
        const items = itemsByY[y].sort((a, b) => a.transform[4] - b.transform[4]); // Sort by X position

        const textRuns = items.map(item => {
          const text = item.str.trim();
          if (!text) return null;

          // Check for formatting from PDF
          const isBold = item.fontName && (item.fontName.includes('Bold') || item.fontName.includes('bold'));
          const isItalic = item.fontName && (item.fontName.includes('Italic') || item.fontName.includes('italic'));

          return new TextRun({
            text: text,
            bold: isBold,
            italics: isItalic,
            size: item.height ? Math.round(item.height * 24) : 24, // Approximate font size
          });
        }).filter(Boolean);

        if (textRuns.length > 0) {
          paragraphs.push(
            new Paragraph({
              children: textRuns,
              spacing: { after: 200 },
            })
          );
        }
      });
    }

    if (paragraphs.length === 0) {
      throw new Error('PDF vazio ou não foi possível extrair texto');
    }

    // Create Word document
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: `Arquivo original: ${file.name}`,
              spacing: { after: 200 },
              run: new TextRun({ bold: true, size: 24 }),
            }),
            new Paragraph({
              text: 'Conteúdo extraído do PDF:',
              spacing: { after: 200 },
              run: new TextRun({ bold: true }),
            }),
            ...paragraphs,
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
    console.error('Erro na conversão PDF para Word:', error);
    return {
      success: false,
      error: error.message || 'Erro ao converter PDF para Word',
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