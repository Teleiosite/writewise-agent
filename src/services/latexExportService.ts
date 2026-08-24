import JSZip from "jszip";
import { Section } from "@/contexts/editor/types";
import { AcademicCitation, exportToBibTeX } from "./citationEngine";

/**
 * Escapes LaTeX special characters in markdown text
 */
function escapeLatex(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([&%$#_{}])/g, "\\$1")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

/**
 * Converts markdown headings, bold, italics, quotes into clean LaTeX
 */
function markdownToLatex(md: string): string {
  if (!md) return "";

  let latex = md;

  // Code blocks / Math blocks
  latex = latex.replace(/\$\$(.*?)\$\$/gs, (_, math) => `\n\\begin{equation}\n${math.trim()}\n\\end{equation}\n`);
  latex = latex.replace(/\$(.*?)\$/g, (_, math) => `$${math}$`);

  // Headings
  latex = latex.replace(/^### (.*$)/gim, (_, title) => `\\subsection{${title.trim()}}`);
  latex = latex.replace(/^## (.*$)/gim, (_, title) => `\\section{${title.trim()}}`);
  latex = latex.replace(/^# (.*$)/gim, (_, title) => `\\chapter{${title.trim()}}`);

  // Bold & Italic
  latex = latex.replace(/\*\*\*(.*?)\*\*\*/g, '\\textbf{\\textit{$1}}');
  latex = latex.replace(/\*\*(.*?)\*\*/g, '\\textbf{$1}');
  latex = latex.replace(/\*(.*?)\*/g, '\\textit{$1}');

  // Blockquotes
  latex = latex.replace(/^> (.*$)/gim, '\\begin{quote}\n$1\n\\end{quote}');

  // Markdown tables to basic LaTeX tabular
  latex = latex.replace(/\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)+)/g, (match, header, body) => {
    const headers = header.split('|').filter((h: string) => h.trim()).map((h: string) => `\\textbf{${h.trim()}}`);
    const cols = headers.length;
    const colAlign = 'l'.repeat(cols);

    const rows = body.trim().split('\n').map((row: string) => {
      const cells = row.split('|').filter((c: string) => c.trim()).map((c: string) => c.trim());
      return cells.join(' & ') + ' \\\\ \\hline';
    }).join('\n');

    return `\n\\begin{table}[htbp]\n\\centering\n\\begin{tabular}{|${colAlign.split('').join('|')}|}\n\\hline\n${headers.join(' & ')} \\\\ \\hline\\hline\n${rows}\n\\end{tabular}\n\\end{table}\n`;
  });

  return latex;
}

/**
 * Generates an Overleaf-compliant LaTeX package (.zip with main.tex and references.bib)
 */
export async function exportToOverleafLatexZip(
  projectName: string,
  sections: Section[],
  citations: AcademicCitation[] = []
): Promise<void> {
  const zip = new JSZip();

  // 1. Build main.tex
  const safeProjectName = projectName || "Empirical Research Dissertation";
  
  let bodyContent = "";
  sections.forEach((sec) => {
    bodyContent += `\n\n% -----------------------------------------------------\n`;
    bodyContent += `% ${sec.title}\n`;
    bodyContent += `% -----------------------------------------------------\n`;
    bodyContent += `\\chapter{${sec.title}}\n\n`;
    bodyContent += markdownToLatex(sec.content);
    bodyContent += `\n`;
  });

  const mainTexContent = `% =====================================================
% WriteWise Academic Workspace - LaTeX Dissertation Template
% Compatible with Overleaf, TeXLive, and MikTeX
% =====================================================

\\documentclass[12pt,a4paper,oneside]{report}

% --- Packages ---
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{tabularx}
\\usepackage{hyperref}
\\usepackage{setspace}
\\usepackage{titlesec}
\\usepackage{fancyhdr}
\\usepackage{cite}

% --- Hyperlink Setup ---
\\hypersetup{
    colorlinks=true,
    linkcolor=black,
    citecolor=blue,
    urlcolor=blue,
    pdftitle={${safeProjectName}},
    pdfauthor={WriteWise Academic Workspace}
}

% --- Line Spacing (APA 7th standard: 1.5 or double) ---
\\onehalfspacing

% --- Title Information ---
\\title{\\textbf{${safeProjectName}}\\\\
\\large An Empirical Investigation and Methodology Dissertation}
\\author{Doctoral / Postgraduate Candidate\\\\
\\textit{Graduate School of Research}}
\\date{\\today}

\\begin{document}

% --- Title Page ---
\\maketitle

% --- Front Matter ---
\\begin{abstract}
This empirical research thesis presents deterministic statistical modeling, comprehensive literature review synthesis, and methodology formulation conducted under transparent academic integrity standards.
\\end{abstract}

\\tableofcontents
\\listoftables
\\listoffigures
\\newpage

% --- Manuscript Chapters ---
${bodyContent}

% --- Bibliography ---
\\newpage
\\bibliographystyle{apalike}
\\bibliography{references}

\\end{document}
`;

  // 2. Build references.bib
  const bibContent = citations.length > 0
    ? exportToBibTeX(citations)
    : `% WriteWise Academic Workspace BibTeX Database\n@article{writewise2024,\n  title={Transparent Empirical Research and Methodology},\n  author={WriteWise},\n  journal={Academic Research Workspace},\n  year={2024}\n}\n`;

  // 3. Build README.md for Overleaf
  const readmeContent = `# ${safeProjectName} - Overleaf LaTeX Package

## How to Compile on Overleaf:
1. Go to [Overleaf](https://www.overleaf.com) and log in.
2. Click **New Project** ➔ **Upload Project**.
3. Select this downloaded \`.zip\` file.
4. Set compiler to **pdfLaTeX** and click **Recompile**!

## Included Files:
- \`main.tex\`: Main thesis manuscript (Chapters 1–5, tables, equations, and headings).
- \`references.bib\`: Clean BibTeX references for APA/IEEE citation formatting.

Generated by **WriteWise Academic Workspace** (https://writewise.duckdns.org).
`;

  // Add files to ZIP
  zip.file("main.tex", mainTexContent);
  zip.file("references.bib", bibContent);
  zip.file("README.md", readmeContent);

  // Generate ZIP Blob and trigger download
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeProjectName.replace(/[^a-zA-Z0-9_-]/g, "_")}_Overleaf_LaTeX.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
