import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { codebook, stats, tests_run } = req.body;

    // Generate SPSS syntax for all tests that were run
    const syntaxParts: string[] = [];

    syntaxParts.push(`* WriteWise Generated SPSS Syntax.`);
    syntaxParts.push(`* Generated: ${new Date().toISOString()}.`);
    syntaxParts.push(``);

    if (!codebook?.length) {
      return res.status(400).json({ error: 'codebook is required' });
    }

    // Variable labels
    syntaxParts.push(`* === VARIABLE LABELS ===.`);
    syntaxParts.push(`VARIABLE LABELS`);
    codebook.forEach((v: any, i: number) => {
      const comma = i < codebook.length - 1 ? '' : '.';
      syntaxParts.push(`  ${v.column} "${v.label || v.column}"${comma}`);
    });
    syntaxParts.push(``);

    // Value labels for nominal/ordinal
    const withValues = codebook.filter((v: any) => v.values && Object.keys(v.values).length > 0);
    if (withValues.length > 0) {
      syntaxParts.push(`* === VALUE LABELS ===.`);
      syntaxParts.push(`VALUE LABELS`);
      withValues.forEach((v: any, i: number) => {
        const slash = i < withValues.length - 1 ? '  /' : '';
        const vals = Object.entries(v.values).map(([k, lbl]) => `    ${k} "${lbl}"`).join('\n');
        syntaxParts.push(`  ${v.column}\n${vals}${slash}`);
      });
      syntaxParts.push(`.`);
      syntaxParts.push(``);
    }

    const testsRun: string[] = tests_run || [];

    // Descriptives
    const scaleCols = codebook.filter((v: any) => v.type === 'scale' || v.type === 'ordinal').map((v: any) => v.column);
    if (testsRun.includes('descriptive') && scaleCols.length > 0) {
      syntaxParts.push(`* === DESCRIPTIVE STATISTICS ===.`);
      syntaxParts.push(`DESCRIPTIVES VARIABLES=${scaleCols.join(' ')}`);
      syntaxParts.push(`  /STATISTICS=MEAN STDDEV MIN MAX SKEWNESS KURTOSIS VARIANCE.`);
      syntaxParts.push(``);
      const nomCols = codebook.filter((v: any) => v.type === 'nominal').map((v: any) => v.column);
      if (nomCols.length > 0) {
        syntaxParts.push(`FREQUENCIES VARIABLES=${nomCols.join(' ')}`);
        syntaxParts.push(`  /ORDER=ANALYSIS.`);
        syntaxParts.push(``);
      }
    }

    // Normality
    if (testsRun.includes('normality') && scaleCols.length > 0) {
      syntaxParts.push(`* === NORMALITY TESTS ===.`);
      syntaxParts.push(`EXAMINE VARIABLES=${scaleCols.join(' ')}`);
      syntaxParts.push(`  /PLOT NPPLOT`);
      syntaxParts.push(`  /STATISTICS DESCRIPTIVES`);
      syntaxParts.push(`  /CINTERVAL 95`);
      syntaxParts.push(`  /MISSING LISTWISE`);
      syntaxParts.push(`  /NOTOTAL.`);
      syntaxParts.push(``);
    }

    // Reliability
    const ordinalCols = codebook.filter((v: any) => v.type === 'ordinal').map((v: any) => v.column);
    if (testsRun.includes('reliability') && ordinalCols.length >= 2) {
      syntaxParts.push(`* === RELIABILITY ANALYSIS (CRONBACH'S ALPHA) ===.`);
      syntaxParts.push(`RELIABILITY`);
      syntaxParts.push(`  /VARIABLES=${ordinalCols.join(' ')}`);
      syntaxParts.push(`  /SCALE('ALL VARIABLES') ALL`);
      syntaxParts.push(`  /MODEL=ALPHA`);
      syntaxParts.push(`  /STATISTICS=DESCRIPTIVE SCALE`);
      syntaxParts.push(`  /SUMMARY=TOTAL.`);
      syntaxParts.push(``);
    }

    // Correlation
    const ivCols = codebook.filter((v: any) => v.role === 'IV').map((v: any) => v.column);
    const dvCols = codebook.filter((v: any) => v.role === 'DV').map((v: any) => v.column);
    if (testsRun.includes('correlation') && ivCols.length > 0 && dvCols.length > 0) {
      syntaxParts.push(`* === CORRELATION ANALYSIS ===.`);
      syntaxParts.push(`CORRELATIONS`);
      syntaxParts.push(`  /VARIABLES=${[...ivCols, ...dvCols].join(' ')}`);
      syntaxParts.push(`  /PRINT=TWOTAIL NOSIG`);
      syntaxParts.push(`  /MISSING=PAIRWISE.`);
      syntaxParts.push(``);
      syntaxParts.push(`NONPAR CORR`);
      syntaxParts.push(`  /VARIABLES=${[...ivCols, ...dvCols].join(' ')}`);
      syntaxParts.push(`  /PRINT=SPEARMAN TWOTAIL NOSIG`);
      syntaxParts.push(`  /MISSING=PAIRWISE.`);
      syntaxParts.push(``);
    }

    // Regression
    if ((testsRun.includes('regression') || testsRun.includes('logistic_regression')) && ivCols.length > 0 && dvCols.length > 0) {
      const dv = dvCols[0];
      const dvType = codebook.find((v: any) => v.column === dv)?.type;
      if (dvType === 'scale') {
        syntaxParts.push(`* === MULTIPLE REGRESSION ===.`);
        syntaxParts.push(`REGRESSION`);
        syntaxParts.push(`  /MISSING LISTWISE`);
        syntaxParts.push(`  /STATISTICS COEFF OUTS R ANOVA`);
        syntaxParts.push(`  /DEPENDENT ${dv}`);
        syntaxParts.push(`  /METHOD=ENTER ${ivCols.join(' ')}.`);
        syntaxParts.push(``);
      } else {
        syntaxParts.push(`* === LOGISTIC REGRESSION ===.`);
        syntaxParts.push(`LOGISTIC REGRESSION VARIABLES ${dv}`);
        syntaxParts.push(`  /METHOD=ENTER ${ivCols.join(' ')}`);
        syntaxParts.push(`  /PRINT=GOODFIT CI(95)`);
        syntaxParts.push(`  /CRITERIA=PIN(.05) POUT(.10) ITERATE(20) CUT(.5).`);
        syntaxParts.push(``);
      }
    }

    // t-test / ANOVA
    const nomCols2 = codebook.filter((v: any) => v.type === 'nominal').map((v: any) => v.column);
    if (testsRun.includes('ttest') && nomCols2.length > 0 && dvCols.length > 0) {
      syntaxParts.push(`* === INDEPENDENT SAMPLES T-TEST ===.`);
      syntaxParts.push(`T-TEST GROUPS=${nomCols2[0]}(1 2)`);
      syntaxParts.push(`  /MISSING=ANALYSIS`);
      syntaxParts.push(`  /VARIABLES=${dvCols.join(' ')}`);
      syntaxParts.push(`  /CRITERIA=CI(.95).`);
      syntaxParts.push(``);
    }

    if (testsRun.includes('anova') && nomCols2.length > 0 && dvCols.length > 0) {
      syntaxParts.push(`* === ONE-WAY ANOVA ===.`);
      syntaxParts.push(`ONEWAY ${dvCols.join(' ')} BY ${nomCols2[0]}`);
      syntaxParts.push(`  /MISSING ANALYSIS`);
      syntaxParts.push(`  /POSTHOC=TUKEY ALPHA(0.05).`);
      syntaxParts.push(``);
    }

    // Factor Analysis
    if (testsRun.includes('factor_analysis') && ordinalCols.length >= 3) {
      syntaxParts.push(`* === EXPLORATORY FACTOR ANALYSIS ===.`);
      syntaxParts.push(`FACTOR`);
      syntaxParts.push(`  /VARIABLES ${ordinalCols.join(' ')}`);
      syntaxParts.push(`  /MISSING LISTWISE`);
      syntaxParts.push(`  /ANALYSIS ${ordinalCols.join(' ')}`);
      syntaxParts.push(`  /PRINT UNIVARIATE INITIAL EXTRACTION ROTATION`);
      syntaxParts.push(`  /CRITERIA MINEIGEN(1) ITERATE(25)`);
      syntaxParts.push(`  /EXTRACTION PC`);
      syntaxParts.push(`  /CRITERIA ITERATE(25)`);
      syntaxParts.push(`  /ROTATION VARIMAX`);
      syntaxParts.push(`  /SAVE REG(ALL)`);
      syntaxParts.push(`  /METHOD=CORRELATION.`);
      syntaxParts.push(``);
    }

    // Mediation
    const medCols = codebook.filter((v: any) => v.role === 'Mediator').map((v: any) => v.column);
    if (testsRun.includes('mediation') && ivCols.length > 0 && dvCols.length > 0 && medCols.length > 0) {
      syntaxParts.push(`* === MEDIATION ANALYSIS (PROCESS Macro equivalent) ===.`);
      syntaxParts.push(`* Note: Install Hayes PROCESS macro for GUI-based mediation in SPSS.`);
      syntaxParts.push(`* Step 1: Total effect (c path).`);
      syntaxParts.push(`REGRESSION`);
      syntaxParts.push(`  /DEPENDENT ${dvCols[0]}`);
      syntaxParts.push(`  /METHOD=ENTER ${ivCols[0]}.`);
      syntaxParts.push(`* Step 2: IV predicts Mediator (a path).`);
      syntaxParts.push(`REGRESSION`);
      syntaxParts.push(`  /DEPENDENT ${medCols[0]}`);
      syntaxParts.push(`  /METHOD=ENTER ${ivCols[0]}.`);
      syntaxParts.push(`* Step 3: Both predict DV (b path + c' path).`);
      syntaxParts.push(`REGRESSION`);
      syntaxParts.push(`  /DEPENDENT ${dvCols[0]}`);
      syntaxParts.push(`  /METHOD=ENTER ${ivCols[0]} ${medCols[0]}.`);
      syntaxParts.push(``);
    }

    return res.status(200).json({ syntax: syntaxParts.join('\n') });
  } catch (error: any) {
    console.error('Syntax generation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate syntax' });
  }
}
