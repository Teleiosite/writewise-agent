import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table as DocxTable, 
  TableRow as DocxTableRow, 
  TableCell as DocxTableCell, 
  WidthType, 
  BorderStyle,
  AlignmentType 
} from "docx";
import { jsPDF } from "jspdf";

export type ExportFormat = 'txt' | 'md' | 'html' | 'pdf' | 'doc' | 'docx' | 'latex' | 'tex';

/**
 * Strips HTML and decodes common HTML entities to clean plain text
 */
function htmlToPlainText(html: string): string {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  // Replace <br> and block elements with newlines
  doc.querySelectorAll("br").forEach(br => br.replaceWith("\n"));
  doc.querySelectorAll("p, div, h1, h2, h3, h4, h5, h6, li, tr, blockquote").forEach(el => {
    el.prepend(document.createTextNode("\n"));
    el.append(document.createTextNode("\n"));
  });
  return (doc.body.textContent || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Parses an HTML string into docx elements (Paragraphs, Tables)
 */
function htmlToDocxElements(html: string): (Paragraph | DocxTable)[] {
  if (!html) return [new Paragraph({ text: "" })];

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const container = doc.body.firstElementChild || doc.body;

  const elements: (Paragraph | DocxTable)[] = [];

  function processInlineNodes(node: Node, currentStyles: { bold?: boolean; italics?: boolean; underline?: boolean; strike?: boolean; size?: number } = {}): TextRun[] {
    const runs: TextRun[] = [];

    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || "";
        if (text) {
          runs.push(
            new TextRun({
              text,
              bold: currentStyles.bold,
              italics: currentStyles.italics,
              underline: currentStyles.underline ? {} : undefined,
              strike: currentStyles.strike,
              size: currentStyles.size || 24, // 12pt (docx uses half-points: 24 = 12pt)
              font: "Times New Roman"
            })
          );
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const tag = el.tagName.toLowerCase();
        
        const newStyles = { ...currentStyles };
        if (tag === "strong" || tag === "b") newStyles.bold = true;
        if (tag === "em" || tag === "i") newStyles.italics = true;
        if (tag === "u") newStyles.underline = true;
        if (tag === "s" || tag === "strike" || tag === "del") newStyles.strike = true;
        
        // Font size check from style
        if (el.style.fontSize) {
          const ptMatch = el.style.fontSize.match(/(\d+(?:\.\d+)?)pt/);
          if (ptMatch) {
            newStyles.size = Math.round(parseFloat(ptMatch[1]) * 2);
          }
        }

        if (tag === "br") {
          runs.push(new TextRun({ text: "", break: 1 }));
        } else {
          runs.push(...processInlineNodes(el, newStyles));
        }
      }
    });

    return runs;
  }

  function processBlockNode(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        elements.push(
          new Paragraph({
            children: [new TextRun({ text, font: "Times New Roman", size: 24 })],
            spacing: { after: 120, line: 360 } // 1.5 spacing
          })
        );
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (tag === "table") {
      const rows: DocxTableRow[] = [];
      el.querySelectorAll("tr").forEach((tr) => {
        const cells: DocxTableCell[] = [];
        tr.querySelectorAll("th, td").forEach((cell) => {
          const isHeader = cell.tagName.toLowerCase() === "th";
          const cellRuns = processInlineNodes(cell, { bold: isHeader });
          cells.push(
            new DocxTableCell({
              children: [
                new Paragraph({
                  children: cellRuns.length > 0 ? cellRuns : [new TextRun({ text: cell.textContent || "", bold: isHeader, font: "Times New Roman" })],
                  spacing: { before: 60, after: 60 }
                })
              ],
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              }
            })
          );
        });
        if (cells.length > 0) {
          rows.push(new DocxTableRow({ children: cells }));
        }
      });

      if (rows.length > 0) {
        elements.push(
          new DocxTable({
            rows,
            width: { size: 100, type: WidthType.PERCENTAGE }
          })
        );
        elements.push(new Paragraph({ text: "", spacing: { after: 120 } }));
      }
      return;
    }

    if (tag === "h1") {
      elements.push(
        new Paragraph({
          children: processInlineNodes(el, { bold: true, size: 32 }), // 16pt
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 }
        })
      );
      return;
    }

    if (tag === "h2") {
      elements.push(
        new Paragraph({
          children: processInlineNodes(el, { bold: true, size: 28 }), // 14pt
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        })
      );
      return;
    }

    if (tag === "h3") {
      elements.push(
        new Paragraph({
          children: processInlineNodes(el, { bold: true, size: 26 }), // 13pt
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 }
        })
      );
      return;
    }

    if (tag === "blockquote") {
      elements.push(
        new Paragraph({
          children: processInlineNodes(el, { italics: true }),
          indent: { left: 720 }, // 0.5 in
          spacing: { before: 120, after: 120, line: 360 }
        })
      );
      return;
    }

    if (tag === "ul" || tag === "ol") {
      el.querySelectorAll("li").forEach((li, idx) => {
        elements.push(
          new Paragraph({
            children: [
              new TextRun({ text: tag === "ol" ? `${idx + 1}. ` : "• ", bold: true, font: "Times New Roman" }),
              ...processInlineNodes(li)
            ],
            indent: { left: 360 },
            spacing: { after: 60, line: 360 }
          })
        );
      });
      return;
    }

    // Default paragraph / div
    const inlineRuns = processInlineNodes(el);
    if (inlineRuns.length > 0) {
      elements.push(
        new Paragraph({
          children: inlineRuns,
          spacing: { after: 120, line: 480 } // Double spacing (480 / 240 = 2.0)
        })
      );
    } else if (el.children.length > 0) {
      // Container div with block children
      el.childNodes.forEach(child => processBlockNode(child));
    }
  }

  container.childNodes.forEach(child => processBlockNode(child));

  if (elements.length === 0) {
    elements.push(new Paragraph({ text: htmlToPlainText(html) || "No content" }));
  }

  return elements;
}

export async function formatContent(sections: Array<{ title: string; content: string }>, format: ExportFormat): Promise<string | Blob> {
  const normFormat = (format || 'docx').toLowerCase() as ExportFormat;

  switch (normFormat) {
    case 'txt':
      return sections
        .map(section => `${section.title}\n${'='.repeat(section.title.length)}\n\n${htmlToPlainText(section.content)}\n\n`)
        .join('\n');
    
    case 'md':
      return sections
        .map(section => `# ${section.title}\n\n${htmlToPlainText(section.content)}\n\n`)
        .join('\n');
    
    case 'html': {
      const htmlSections = sections
        .map(section => `
          <section style="margin-bottom: 3rem;">
            <h1 style="border-bottom: 2px solid #000; padding-bottom: 0.5rem; font-family: 'Times New Roman', serif;">${section.title}</h1>
            <div style="font-family: 'Times New Roman', serif; line-height: 2.0; font-size: 12pt;">${section.content}</div>
          </section>
        `)
        .join('\n');
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Academic Manuscript</title>
  <style>
    body { font-family: 'Times New Roman', Times, serif; max-width: 850px; margin: 2rem auto; padding: 2rem; line-height: 2.0; color: #111; }
    h1, h2, h3 { font-family: 'Times New Roman', Times, serif; color: #000; }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
    th, td { border: 1px solid #ccc; padding: 8px 12px; }
  </style>
</head>
<body>
${htmlSections}
</body>
</html>`;
    }
    
    case 'pdf': {
      const pdf = new jsPDF();
      let yOffset = 20;
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      const lineHeight = 6.5;
      const maxLineWidth = pageWidth - 2 * margin;

      sections.forEach((section, index) => {
        if (index > 0) {
          pdf.addPage();
          yOffset = 20;
        }

        // Section Chapter Title
        pdf.setFontSize(16);
        pdf.setFont('times', 'bold');
        pdf.text(section.title, margin, yOffset);
        yOffset += lineHeight * 2;

        // Section Content
        pdf.setFontSize(11);
        pdf.setFont('times', 'normal');
        
        const cleanText = htmlToPlainText(section.content);
        const paragraphs = cleanText.split('\n\n');

        paragraphs.forEach((pText) => {
          if (!pText.trim()) return;
          const contentLines = pdf.splitTextToSize(pText.trim(), maxLineWidth);
          
          contentLines.forEach((line: string) => {
            if (yOffset > pdf.internal.pageSize.height - 20) {
              pdf.addPage();
              yOffset = 20;
            }
            pdf.text(line, margin, yOffset);
            yOffset += lineHeight;
          });

          yOffset += lineHeight; // paragraph break
        });
      });

      return pdf.output('blob');
    }

    case 'doc':
    case 'docx': {
      const docChildren: (Paragraph | DocxTable)[] = [];

      sections.forEach((section, index) => {
        // Heading 1 for Section Title
        docChildren.push(
          new Paragraph({
            text: section.title,
            heading: HeadingLevel.HEADING_1,
            spacing: {
              before: index > 0 ? 400 : 100,
              after: 240,
            },
          })
        );

        // Parse section HTML content into formatted docx paragraphs & tables
        const sectionElements = htmlToDocxElements(section.content);
        docChildren.push(...sectionElements);
      });

      const doc = new Document({
        styles: {
          default: {
            document: {
              run: {
                font: "Times New Roman",
                size: 24, // 12pt
              },
              paragraph: {
                spacing: { line: 480 }, // Double line spacing (APA standard)
              }
            }
          }
        },
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440, // 1 inch (1440 dxa = 1 in)
                  bottom: 1440,
                  left: 1440,
                  right: 1440,
                },
              },
            },
            children: docChildren,
          },
        ],
      });

      return await Packer.toBlob(doc);
    }

    default:
      return '';
  }
}

export async function downloadDocument(content: string | Blob, filename: string, format: ExportFormat) {
  const normFormat = (format || 'docx').toLowerCase() as ExportFormat;

  const extensions: Record<string, string> = {
    txt: 'txt',
    md: 'md',
    html: 'html',
    pdf: 'pdf',
    doc: 'docx',
    docx: 'docx',
    latex: 'zip',
    tex: 'zip'
  };

  const mimeTypes: Record<string, string> = {
    txt: 'text/plain;charset=utf-8',
    md: 'text/markdown;charset=utf-8',
    html: 'text/html;charset=utf-8',
    pdf: 'application/pdf',
    doc: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };

  const ext = extensions[normFormat] || 'docx';

  let blob: Blob;
  if (content instanceof Blob) {
    blob = content;
  } else {
    blob = new Blob([content], { type: mimeTypes[normFormat] || 'text/plain;charset=utf-8' });
  }

  const cleanFilename = (filename || 'Manuscript').replace(/[/\\?%*:|"<>]/g, '_');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${cleanFilename}.${ext}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
