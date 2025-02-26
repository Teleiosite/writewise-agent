
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import { jsPDF } from "jspdf";

export type ExportFormat = 'txt' | 'md' | 'html' | 'pdf' | 'doc';

export async function formatContent(sections: Array<{ title: string; content: string }>, format: ExportFormat): Promise<string | Blob> {
  switch (format) {
    case 'txt':
      return sections
        .map(section => `${section.title}\n${'='.repeat(section.title.length)}\n\n${section.content}\n\n`)
        .join('\n');
    
    case 'md':
      return sections
        .map(section => `# ${section.title}\n\n${section.content}\n\n`)
        .join('\n');
    
    case 'html':
      const htmlSections = sections
        .map(section => `<h1>${section.title}</h1>\n<div>${section.content.split('\n').join('<br>')}</div>`)
        .join('\n');
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    h1 { color: #1a1a1a; margin-top: 2rem; }
  </style>
</head>
<body>
${htmlSections}
</body>
</html>`;

    case 'pdf':
      const pdf = new jsPDF();
      let yOffset = 10;
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      const lineHeight = 7;

      sections.forEach((section) => {
        // Add title
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        
        // Check if we need a new page
        if (yOffset > pdf.internal.pageSize.height - 20) {
          pdf.addPage();
          yOffset = 20;
        }
        
        pdf.text(section.title, margin, yOffset);
        yOffset += lineHeight * 2;

        // Add content
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        const contentLines = pdf.splitTextToSize(section.content, pageWidth - 2 * margin);
        contentLines.forEach((line: string) => {
          if (yOffset > pdf.internal.pageSize.height - 20) {
            pdf.addPage();
            yOffset = 20;
          }
          pdf.text(line, margin, yOffset);
          yOffset += lineHeight;
        });
        
        yOffset += lineHeight * 2;
      });

      return pdf.output('blob');

    case 'doc':
      const doc = new Document({
        sections: [{
          children: sections.flatMap(section => [
            new Paragraph({
              text: section.title,
              heading: HeadingLevel.HEADING_1,
              spacing: {
                after: 200,
              },
            }),
            new Paragraph({
              text: section.content,
              spacing: {
                after: 400,
              },
            }),
          ]),
        }],
      });

      return await Packer.toBlob(doc);

    default:
      return '';
  }
}

export async function downloadDocument(content: string | Blob, filename: string, format: ExportFormat) {
  const extensions = {
    txt: 'txt',
    md: 'md',
    html: 'html',
    pdf: 'pdf',
    doc: 'docx'
  };

  let blob;
  if (content instanceof Blob) {
    blob = content;
  } else {
    blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${extensions[format]}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
