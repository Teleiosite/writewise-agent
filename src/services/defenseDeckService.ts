import pptxgenjs from "pptxgenjs";

export interface DefenseSlideContent {
  title: string;
  subtitle?: string;
  bullets: string[];
  tableData?: string[][];
  highlightBox?: string;
}

export interface DefenseDeckConfig {
  projectName: string;
  authorName?: string;
  institution?: string;
  degree?: string;
  date?: string;
  problemStatement?: string;
  objectives?: string[];
  hypotheses?: { name: string; statement: string; decision: "Supported" | "Rejected" | "Partial"; pValue?: string; beta?: string }[];
  methodology?: {
    design: string;
    sampleSize: string;
    instrument: string;
    analysisTechnique: string;
  };
  keyFindings?: string[];
  recommendations?: string[];
  limitations?: string[];
}

/**
 * Builds standard default slide structure from project data
 */
export function buildDefaultDefenseSlides(config: DefenseDeckConfig): DefenseSlideContent[] {
  const author = config.authorName || "Doctoral Candidate";
  const degree = config.degree || "Postgraduate Degree in Academic Research";
  const institution = config.institution || "Graduate School of Research & Studies";
  const dateStr = config.date || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const hypList = config.hypotheses && config.hypotheses.length > 0 ? config.hypotheses : [
    { name: "H1", statement: "Predictor variable has a statistically significant positive effect on outcome (p < 0.05)", decision: "Supported" as const, beta: "β = 0.42", pValue: "p < 0.001" },
    { name: "H2", statement: "Mediating construct significantly transmits the empirical effect on target variable", decision: "Supported" as const, beta: "β = 0.29", pValue: "p = 0.004" },
    { name: "H3", statement: "Demographic moderator dampens the relationship under extreme conditions", decision: "Rejected" as const, beta: "β = -0.06", pValue: "p = 0.342" }
  ];

  return [
    // Slide 1: Title
    {
      title: config.projectName || "Empirical Investigation and Dissertation Defense",
      subtitle: `${degree}\n${author} · ${institution}\n${dateStr}`,
      bullets: [],
      highlightBox: "Doctoral & Master's Examination Committee Presentation"
    },
    // Slide 2: Problem Statement & Objectives
    {
      title: "Research Background & Problem Statement",
      subtitle: "Contextualizing the Empirical Research Gap",
      bullets: [
        `Core Problem: ${config.problemStatement || "Prior studies demonstrate inconsistent empirical findings regarding the causal mechanisms governing the core dependent variable."}`,
        "Empirical Gap: Lack of validated structural modeling accounting for mediating pathways across diverse institutional populations.",
        "Primary Objective: Formulate and empirically test a comprehensive conceptual framework under rigorous reproducibility standards."
      ],
      highlightBox: "Significance: Bridges theoretical ambiguity with deterministic quantitative evidence."
    },
    // Slide 3: Conceptual Framework & Hypotheses
    {
      title: "Conceptual Framework & Hypotheses",
      subtitle: "Formal Formulations for Quantitative Verification",
      bullets: hypList.map(h => `**${h.name}:** ${h.statement}`)
    },
    // Slide 4: Methodology & Sample Demographics
    {
      title: "Research Design & Methodology",
      subtitle: "Quantitative Rigor & Data Integrity Standards",
      bullets: [
        `Research Design: ${config.methodology?.design || "Quantitative Cross-Sectional Empirical Survey Design"}`,
        `Target Population & Sample: ${config.methodology?.sampleSize || "N = 348 Validated Respondents (Response Rate: 78.4%)"}`,
        `Instrumentation: ${config.methodology?.instrument || "Standardized 5-point Likert Scales; Validated Construct Reliability (Cronbach's α > 0.82)"}`,
        `Statistical Compute: ${config.methodology?.analysisTechnique || "Deterministic Python Engine (SciPy/Statsmodels) with SPSS .sps Cross-Verification"}`
      ],
      highlightBox: "Ethical Compliance: Full institutional review approval and zero-knowledge data masking."
    },
    // Slide 5: Statistical Findings & Regression Models
    {
      title: "Empirical Findings & Model Estimations",
      subtitle: "Statistical Testing & Effect Size Analysis",
      bullets: config.keyFindings && config.keyFindings.length > 0 ? config.keyFindings : [
        "Multiple Linear Regression model accounted for substantial empirical variance: R² = 0.442, Adjusted R² = 0.431 (F = 42.18, p < 0.001).",
        "Multicollinearity diagnostics confirmed tolerance values > 0.40 and VIF < 2.50 across all structural predictors.",
        "Durbin-Watson metric (d = 1.94) verified absence of first-order autocorrelation in regression residuals."
      ]
    },
    // Slide 6: Hypotheses Decision Matrix Table
    {
      title: "Hypotheses Testing Decision Matrix",
      subtitle: "Summary of Empirical Verification",
      bullets: [],
      tableData: [
        ["Hypothesis", "Structural Path", "Std. Beta (β)", "p-value", "Empirical Outcome"],
        ...hypList.map(h => [
          h.name,
          h.statement.substring(0, 40) + "...",
          h.beta || "β = 0.35",
          h.pValue || "p < 0.01",
          h.decision === "Supported" ? "ACCEPTED (p < 0.05)" : "REJECTED (p > 0.05)"
        ])
      ]
    },
    // Slide 7: Theoretical & Practical Implications
    {
      title: "Theoretical & Managerial Implications",
      subtitle: "Contributions to Academic Literature & Practice",
      bullets: config.recommendations && config.recommendations.length > 0 ? config.recommendations : [
        "Theoretical Contribution: Extends existing structural models by validating direct and mediating path coefficients under empirical control.",
        "Practical Implication: Provides quantitative benchmarks for organizational leaders and decision-makers.",
        "Policy Implication: Recommends empirical measurement protocols for departmental performance evaluation."
      ]
    },
    // Slide 8: Limitations & Future Research
    {
      title: "Methodological Limitations & Future Scope",
      subtitle: "Boundary Conditions of the Study",
      bullets: config.limitations && config.limitations.length > 0 ? config.limitations : [
        "Sample Boundary: Data collected within a single geographical and industrial context; replication in cross-national cohorts is recommended.",
        "Cross-Sectional Constraint: Causal assertions should be longitudinally verified across multiple time waves (T1–T3).",
        "Future Direction: Exploration of latent non-linear moderating constructs using machine learning econometric techniques."
      ],
      highlightBox: "Conclusion: The study provides a solid, verifiable foundation for subsequent scholarship."
    },
    // Slide 9: Defense Examination Conclusion
    {
      title: "Conclusion & Examination",
      subtitle: "Thank You to the Examination Committee",
      bullets: [
        "All statistical models, syntax scripts, and data hash receipts are permanently archived for supervisor verification.",
        "Open for Questions, Critical Feedback, and Examination Committee Discussion."
      ],
      highlightBox: "Candidate welcomes questions from the Committee Chair and Examiners."
    }
  ];
}

/**
 * Generates and downloads a high-contrast, professional PowerPoint (.pptx) file
 */
export async function exportDefenseDeckToPptx(config: DefenseDeckConfig): Promise<void> {
  const pptx = new pptxgenjs();

  // Configure Presentation Meta
  pptx.layout = "LAYOUT_16x9";
  pptx.title = config.projectName || "Dissertation Defense";
  pptx.author = config.authorName || "WriteWise Academic Workspace";
  pptx.company = config.institution || "Doctoral Research Workspace";

  const slides = buildDefaultDefenseSlides(config);

  // Palette: Clean Academic Editorial
  const COLOR_BG = "FFFFFF";
  const COLOR_PRIMARY = "000000";
  const COLOR_ACCENT = "2563EB";
  const COLOR_MUTED = "4B5563";
  const COLOR_CARD_BG = "F3F4F6";

  slides.forEach((s, idx) => {
    const slide = pptx.addSlide();
    slide.background = { color: idx === 0 ? "0A0A0A" : COLOR_BG };

    if (idx === 0) {
      // Title Slide (Dark Theme)
      slide.addText("DISSERTATION DEFENSE PRESENTATION", {
        x: 1.0,
        y: 1.2,
        w: 11.3,
        h: 0.4,
        fontSize: 12,
        fontFace: "Arial",
        color: "9CA3AF",
        bold: true,
        charSpacing: 2
      });

      slide.addText(s.title, {
        x: 1.0,
        y: 1.8,
        w: 11.3,
        h: 2.2,
        fontSize: 32,
        fontFace: "Georgia",
        color: "FFFFFF",
        bold: true,
        breakLine: true
      });

      if (s.subtitle) {
        slide.addText(s.subtitle, {
          x: 1.0,
          y: 4.3,
          w: 11.3,
          h: 1.4,
          fontSize: 14,
          fontFace: "Arial",
          color: "D1D5DB",
          lineSpacing: 24
        });
      }

      if (s.highlightBox) {
        slide.addShape(pptx.ShapeType.rect, {
          x: 1.0,
          y: 6.0,
          w: 11.3,
          h: 0.6,
          fill: { color: "1F2937" },
          line: { color: "374151", width: 1 }
        });

        slide.addText(s.highlightBox, {
          x: 1.2,
          y: 6.0,
          w: 11.0,
          h: 0.6,
          fontSize: 11,
          fontFace: "Arial",
          color: "E5E7EB",
          bold: true
        });
      }
    } else {
      // Content Slide (Light High-Contrast Editorial Theme)
      // Slide Category Header
      slide.addText(`SECTION 0${idx} · DISSERTATION DEFENSE`, {
        x: 0.8,
        y: 0.5,
        w: 11.5,
        h: 0.3,
        fontSize: 9,
        fontFace: "Arial",
        color: "6B7280",
        bold: true,
        charSpacing: 2
      });

      // Slide Title
      slide.addText(s.title, {
        x: 0.8,
        y: 0.8,
        w: 11.5,
        h: 0.6,
        fontSize: 24,
        fontFace: "Georgia",
        color: COLOR_PRIMARY,
        bold: true
      });

      // Subtitle
      if (s.subtitle) {
        slide.addText(s.subtitle, {
          x: 0.8,
          y: 1.4,
          w: 11.5,
          h: 0.4,
          fontSize: 12,
          fontFace: "Arial",
          color: COLOR_MUTED,
          italic: true
        });
      }

      // Top Border Accent Line
      slide.addShape(pptx.ShapeType.line, {
        x: 0.8,
        y: 1.9,
        w: 11.5,
        h: 0,
        line: { color: "000000", width: 1.5 }
      });

      // Bullets or Content
      if (s.bullets && s.bullets.length > 0) {
        const bulletObjects = s.bullets.map(b => ({
          text: b.replace(/\*\*/g, ""),
          options: {
            fontSize: 13,
            fontFace: "Arial",
            color: "1F2937",
            bullet: { code: "2022" },
            spaceAfter: 12
          }
        }));

        slide.addText(bulletObjects, {
          x: 0.8,
          y: 2.2,
          w: 11.5,
          h: 3.6,
          margin: 0
        });
      }

      // Table (if present)
      if (s.tableData && s.tableData.length > 0) {
        const formattedTable = s.tableData.map((row, rIdx) => 
          row.map(cell => ({
            text: cell,
            options: {
              fontSize: rIdx === 0 ? 10 : 10,
              fontFace: "Arial",
              bold: rIdx === 0,
              color: rIdx === 0 ? "FFFFFF" : "111827",
              fill: { color: rIdx === 0 ? "000000" : (rIdx % 2 === 0 ? "F9FAFB" : "FFFFFF") },
              border: { pt: 1, color: "E5E7EB" }
            }
          }))
        );

        slide.addTable(formattedTable, {
          x: 0.8,
          y: 2.2,
          w: 11.5,
          h: 3.5,
          colW: [1.2, 4.2, 1.8, 1.8, 2.5]
        });
      }

      // Highlight Callout Banner
      if (s.highlightBox) {
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.8,
          y: 6.0,
          w: 11.5,
          h: 0.65,
          fill: { color: COLOR_CARD_BG },
          line: { color: "000000", width: 1 }
        });

        slide.addText(s.highlightBox, {
          x: 1.0,
          y: 6.0,
          w: 11.1,
          h: 0.65,
          fontSize: 10,
          fontFace: "Arial",
          color: "111827",
          bold: true
        });
      }

      // Bottom Footer
      slide.addText(`WriteWise Academic Workspace · Slide ${idx + 1} of ${slides.length}`, {
        x: 0.8,
        y: 7.0,
        w: 11.5,
        h: 0.3,
        fontSize: 8,
        fontFace: "Arial",
        color: "9CA3AF"
      });
    }
  });

  const filename = `${(config.projectName || "Dissertation_Defense").replace(/[^a-zA-Z0-9_-]/g, "_")}_Defense_Deck.pptx`;
  await pptx.writeFile({ fileName: filename });
}
