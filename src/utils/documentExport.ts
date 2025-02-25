
export type ExportFormat = 'txt' | 'md' | 'html';

export function formatContent(sections: Array<{ title: string; content: string }>, format: ExportFormat): string {
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
  }
}

export function downloadDocument(content: string, filename: string, format: ExportFormat) {
  const extensions = {
    txt: 'txt',
    md: 'md',
    html: 'html'
  };

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${extensions[format]}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
