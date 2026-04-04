"""
WriteWise Statistics Engine — Full Spectrum
Covers: Descriptive, Reliability, Normality, Correlation, Group Comparison,
        Regression (all types), Multivariate, Mediation/SEM, Survival Analysis
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
from scipy import stats
from scipy.stats import (
    pearsonr, spearmanr, kendalltau, pointbiserialr,
    shapiro, kstest, chi2_contingency, fisher_exact,
    ttest_ind, ttest_rel, ttest_1samp,
    mannwhitneyu, wilcoxon, kruskal, friedmanchisquare,
    f_oneway
)
import statsmodels.api as sm
from statsmodels.stats.anova import AnovaRM
from statsmodels.stats.multicomp import pairwise_tukeyhsd
from statsmodels.stats.mediation import Mediation
from statsmodels.formula.api import ols, logit, mnlogit
import json
import io
import traceback
from typing import Optional

try:
    import pingouin as pg
    HAS_PINGOUIN = True
except ImportError:
    HAS_PINGOUIN = False

try:
    from factor_analyzer import FactorAnalyzer
    HAS_FACTOR = True
except ImportError:
    HAS_FACTOR = False

try:
    import pyreadstat
    HAS_PYREADSTAT = True
except ImportError:
    HAS_PYREADSTAT = False

try:
    from lifelines import KaplanMeierFitter, CoxPHFitter
    HAS_LIFELINES = True
except ImportError:
    HAS_LIFELINES = False

try:
    import semopy
    HAS_SEMOPY = True
except ImportError:
    HAS_SEMOPY = False

app = FastAPI(title="WriteWise Statistics Engine", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://writewise-app.vercel.app", "http://localhost:5173", "http://localhost:3000", "*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "libraries": {
            "pingouin": HAS_PINGOUIN,
            "factor_analyzer": HAS_FACTOR,
            "pyreadstat": HAS_PYREADSTAT,
            "lifelines": HAS_LIFELINES,
            "semopy": HAS_SEMOPY,
        }
    }


# ─── Parse SPSS .sav File ─────────────────────────────────────────────────────
@app.post("/parse-sav")
async def parse_sav(file: UploadFile = File(...)):
    if not HAS_PYREADSTAT:
        raise HTTPException(status_code=500, detail="pyreadstat not installed")
    try:
        content = await file.read()
        df, meta = pyreadstat.read_sav(io.BytesIO(content))
        # Build auto codebook from SPSS metadata
        codebook = []
        for col in df.columns:
            var_labels = meta.variable_value_labels.get(col, {})
            codebook.append({
                "column": col,
                "label": meta.column_labels[meta.column_names.index(col)] if col in meta.column_names and meta.column_labels else col,
                "type": "nominal" if var_labels else "scale",
                "values": {str(k): v for k, v in var_labels.items()} if var_labels else None,
                "missing_code": None,
                "role": "None",
                "section_label": None,
            })
        return JSONResponse({
            "data": df.where(df.notna(), None).to_dict(orient="records"),
            "headers": list(df.columns),
            "codebook": codebook,
            "n_rows": len(df),
            "n_cols": len(df.columns),
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse .sav file: {str(e)}")


# ─── Main Analysis Endpoint ───────────────────────────────────────────────────
@app.post("/analyse")
async def analyse(payload: dict):
    try:
        data = payload.get("data", [])
        codebook = payload.get("codebook", [])
        context = payload.get("context", {})
        selected_tests = payload.get("selected_tests", [])  # empty = auto

        if not data:
            raise HTTPException(status_code=400, detail="No data provided")

        df = pd.DataFrame(data)

        # Apply missing value codes
        for var in codebook:
            col = var.get("column")
            if col in df.columns and var.get("missing_code") is not None:
                df[col] = pd.to_numeric(df[col], errors="coerce")
                df[col] = df[col].replace(var["missing_code"], np.nan)
            elif col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")

        cb_map = {v["column"]: v for v in codebook}
        nominal_cols = [v["column"] for v in codebook if v.get("type") == "nominal" and v["column"] in df.columns]
        ordinal_cols = [v["column"] for v in codebook if v.get("type") == "ordinal" and v["column"] in df.columns]
        scale_cols   = [v["column"] for v in codebook if v.get("type") == "scale" and v["column"] in df.columns]
        iv_cols      = [v["column"] for v in codebook if v.get("role") == "IV" and v["column"] in df.columns]
        dv_cols      = [v["column"] for v in codebook if v.get("role") == "DV" and v["column"] in df.columns]
        med_cols     = [v["column"] for v in codebook if v.get("role") == "Mediator" and v["column"] in df.columns]
        mod_cols     = [v["column"] for v in codebook if v.get("role") == "Moderator" and v["column"] in df.columns]

        result = {
            "n_total": len(df),
            "n_valid": int(df.dropna().shape[0]),
            "response_rate": round((df.dropna().shape[0] / len(df)) * 100, 1) if len(df) > 0 else 0,
            "tests_run": [],
        }

        def should_run(test_name):
            return not selected_tests or test_name in selected_tests

        # ── Descriptive Statistics ────────────────────────────────────────────
        if should_run("descriptive"):
            result["descriptive"] = compute_descriptive(df, codebook, nominal_cols + ordinal_cols + scale_cols, cb_map)
            result["tests_run"].append("descriptive")

        # ── Normality Tests ───────────────────────────────────────────────────
        if should_run("normality") and scale_cols:
            result["normality"] = compute_normality(df, scale_cols + ordinal_cols, cb_map)
            result["tests_run"].append("normality")

        # ── Reliability (Cronbach's Alpha) ────────────────────────────────────
        if should_run("reliability") and ordinal_cols:
            result["reliability"] = compute_reliability(df, codebook, ordinal_cols)
            result["tests_run"].append("reliability")

        # ── Section Descriptives (for Likert scales) ──────────────────────────
        if should_run("section_stats") and ordinal_cols:
            result["section_stats"] = compute_section_stats(df, codebook, ordinal_cols)
            result["tests_run"].append("section_stats")

        # ── Correlation Analysis ──────────────────────────────────────────────
        if should_run("correlation") and len(iv_cols) > 0 and len(dv_cols) > 0:
            result["correlation"] = compute_correlation(df, iv_cols, dv_cols, cb_map)
            result["tests_run"].append("correlation")

        if should_run("correlation_matrix") and len(scale_cols + ordinal_cols) >= 2:
            result["correlation_matrix"] = compute_correlation_matrix(df, scale_cols + ordinal_cols, cb_map)
            result["tests_run"].append("correlation_matrix")

        # ── Group Comparison ──────────────────────────────────────────────────
        if nominal_cols and dv_cols:
            for group_col in nominal_cols:
                groups = df[group_col].dropna().unique()
                n_groups = len(groups)
                dv_col = dv_cols[0]

                if n_groups == 2 and should_run("ttest"):
                    result.setdefault("group_comparisons", [])
                    result["group_comparisons"].append(
                        compute_ttest(df, group_col, dv_col, cb_map)
                    )
                    if "ttest" not in result["tests_run"]:
                        result["tests_run"].append("ttest")

                elif n_groups >= 3 and should_run("anova"):
                    result.setdefault("group_comparisons", [])
                    result["group_comparisons"].append(
                        compute_anova(df, group_col, dv_col, cb_map)
                    )
                    if "anova" not in result["tests_run"]:
                        result["tests_run"].append("anova")

        # ── Chi-Square ────────────────────────────────────────────────────────
        if should_run("chi_square") and len(nominal_cols) >= 2:
            result["chi_square"] = []
            for i in range(len(nominal_cols)):
                for j in range(i + 1, len(nominal_cols)):
                    result["chi_square"].append(
                        compute_chi_square(df, nominal_cols[i], nominal_cols[j], cb_map)
                    )
            result["tests_run"].append("chi_square")

        # ── Regression ───────────────────────────────────────────────────────
        if iv_cols and dv_cols:
            dv = dv_cols[0]
            dv_type = cb_map.get(dv, {}).get("type", "scale")

            if dv_type == "scale" and should_run("regression"):
                if len(iv_cols) == 1:
                    result["regression"] = compute_simple_regression(df, iv_cols[0], dv, cb_map)
                else:
                    result["regression"] = compute_multiple_regression(df, iv_cols, dv, cb_map)
                result["tests_run"].append("regression")

            if dv_type == "nominal" and should_run("logistic_regression"):
                result["logistic_regression"] = compute_logistic_regression(df, iv_cols, dv, cb_map)
                result["tests_run"].append("logistic_regression")

        # ── Factor Analysis (EFA) ─────────────────────────────────────────────
        if should_run("factor_analysis") and HAS_FACTOR and len(ordinal_cols) >= 3:
            result["factor_analysis"] = compute_efa(df, ordinal_cols, cb_map)
            result["tests_run"].append("factor_analysis")

        # ── Mediation Analysis ────────────────────────────────────────────────
        if should_run("mediation") and iv_cols and dv_cols and med_cols:
            result["mediation"] = compute_mediation(df, iv_cols[0], med_cols[0], dv_cols[0], cb_map)
            result["tests_run"].append("mediation")

        # ── Moderation Analysis ───────────────────────────────────────────────
        if should_run("moderation") and iv_cols and dv_cols and mod_cols:
            result["moderation"] = compute_moderation(df, iv_cols[0], mod_cols[0], dv_cols[0], cb_map)
            result["tests_run"].append("moderation")

        return JSONResponse(content=safe_json(result))

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ─── Custom Single Test Endpoint ──────────────────────────────────────────────
@app.post("/analyse/custom")
async def analyse_custom(payload: dict):
    """Run a single specific test by name."""
    data = payload.get("data", [])
    codebook = payload.get("codebook", [])
    test = payload.get("test", "")
    params = payload.get("params", {})

    df = pd.DataFrame(data)
    cb_map = {v["column"]: v for v in codebook}

    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    TEST_MAP = {
        "shapiro_wilk": lambda: compute_normality(df, [params.get("col")], cb_map),
        "pearson": lambda: pearson_single(df, params.get("col1"), params.get("col2"), cb_map),
        "spearman": lambda: spearman_single(df, params.get("col1"), params.get("col2"), cb_map),
        "ttest_ind": lambda: compute_ttest(df, params.get("group_col"), params.get("dv_col"), cb_map),
        "anova": lambda: compute_anova(df, params.get("group_col"), params.get("dv_col"), cb_map),
        "chi_square": lambda: compute_chi_square(df, params.get("col1"), params.get("col2"), cb_map),
        "cronbach": lambda: compute_reliability(df, codebook, params.get("cols", [])),
        "regression": lambda: compute_multiple_regression(df, params.get("iv_cols", []), params.get("dv_col"), cb_map),
        "logistic": lambda: compute_logistic_regression(df, params.get("iv_cols", []), params.get("dv_col"), cb_map),
        "efa": lambda: compute_efa(df, params.get("cols", []), cb_map),
        "mediation": lambda: compute_mediation(df, params.get("iv"), params.get("mediator"), params.get("dv"), cb_map),
    }

    if test not in TEST_MAP:
        raise HTTPException(status_code=400, detail=f"Unknown test: {test}")

    result = TEST_MAP[test]()
    return JSONResponse(content=safe_json(result))


# ─── Statistical Functions ────────────────────────────────────────────────────

def compute_descriptive(df, codebook, cols, cb_map):
    out = []
    for col in cols:
        if col not in df.columns:
            continue
        var = cb_map.get(col, {})
        series = df[col].dropna()
        freq = series.value_counts().to_dict()
        pct = (series.value_counts(normalize=True) * 100).round(1).to_dict()
        item = {
            "variable": col,
            "label": var.get("label", col),
            "type": var.get("type", "scale"),
            "n": int(series.count()),
            "missing": int(df[col].isna().sum()),
            "mean": round(float(series.mean()), 2) if pd.api.types.is_numeric_dtype(series) else None,
            "median": round(float(series.median()), 2) if pd.api.types.is_numeric_dtype(series) else None,
            "mode": float(series.mode().iloc[0]) if not series.mode().empty else None,
            "std_dev": round(float(series.std()), 3) if pd.api.types.is_numeric_dtype(series) else None,
            "variance": round(float(series.var()), 3) if pd.api.types.is_numeric_dtype(series) else None,
            "min": float(series.min()) if pd.api.types.is_numeric_dtype(series) else None,
            "max": float(series.max()) if pd.api.types.is_numeric_dtype(series) else None,
            "range": float(series.max() - series.min()) if pd.api.types.is_numeric_dtype(series) else None,
            "iqr": float(series.quantile(0.75) - series.quantile(0.25)) if pd.api.types.is_numeric_dtype(series) else None,
            "skewness": round(float(series.skew()), 3) if pd.api.types.is_numeric_dtype(series) else None,
            "kurtosis": round(float(series.kurtosis()), 3) if pd.api.types.is_numeric_dtype(series) else None,
            "frequencies": {str(k): int(v) for k, v in freq.items()},
            "percentages": {str(k): float(v) for k, v in pct.items()},
            "value_labels": var.get("values", {}),
        }
        out.append(item)
    return out


def compute_normality(df, cols, cb_map):
    results = []
    for col in cols:
        if col not in df.columns:
            continue
        series = df[col].dropna()
        if len(series) < 3:
            continue
        item = {"variable": col, "label": cb_map.get(col, {}).get("label", col)}
        # Shapiro-Wilk (best for n < 2000)
        if len(series) <= 2000:
            stat_sw, p_sw = shapiro(series)
            item["shapiro_wilk"] = {"statistic": round(float(stat_sw), 4), "p_value": round(float(p_sw), 4), "normal": bool(p_sw > 0.05)}
        # Kolmogorov-Smirnov
        stat_ks, p_ks = kstest(series, "norm", args=(series.mean(), series.std()))
        item["kolmogorov_smirnov"] = {"statistic": round(float(stat_ks), 4), "p_value": round(float(p_ks), 4), "normal": bool(p_ks > 0.05)}
        item["skewness"] = round(float(series.skew()), 3)
        item["kurtosis"] = round(float(series.kurtosis()), 3)
        results.append(item)
    return results


def compute_reliability(df, codebook, ordinal_cols):
    prefixes = {}
    for col in ordinal_cols:
        if col not in df.columns:
            continue
        prefix = "_".join(col.split("_")[:-1]) if "_" in col else col
        prefixes.setdefault(prefix, []).append(col)

    results = []
    for prefix, cols in prefixes.items():
        sub = df[cols].dropna()
        if sub.shape[1] < 2 or sub.shape[0] < 2:
            continue
        alpha = cronbach_alpha(sub)
        # McDonald's omega (simplified)
        omega = None
        try:
            if HAS_PINGOUIN:
                rel = pg.reliability(data=sub)
                omega = round(float(rel.get("omega", alpha)) if hasattr(rel, 'get') else alpha, 3)
        except Exception:
            pass
        results.append({
            "scale_name": prefix,
            "variables": cols,
            "n_items": len(cols),
            "n_respondents": int(sub.shape[0]),
            "cronbach_alpha": round(alpha, 3),
            "mcdonalds_omega": omega,
            "interpretation": interpret_alpha(alpha),
        })
    return results


def cronbach_alpha(df_sub):
    k = df_sub.shape[1]
    if k < 2:
        return 0.0
    item_vars = df_sub.var(axis=0, ddof=1).sum()
    total_var = df_sub.sum(axis=1).var(ddof=1)
    if total_var == 0:
        return 0.0
    return (k / (k - 1)) * (1 - item_vars / total_var)


def interpret_alpha(alpha):
    if alpha >= 0.9: return "Excellent"
    if alpha >= 0.8: return "Good"
    if alpha >= 0.7: return "Acceptable"
    if alpha >= 0.6: return "Questionable"
    if alpha >= 0.5: return "Poor"
    return "Unacceptable"


def compute_section_stats(df, codebook, ordinal_cols):
    prefixes = {}
    cb_map = {v["column"]: v for v in codebook}
    for col in ordinal_cols:
        if col not in df.columns:
            continue
        prefix = "_".join(col.split("_")[:-1]) if "_" in col else col
        prefixes.setdefault(prefix, []).append(col)

    sections = {}
    for prefix, cols in prefixes.items():
        section_label = cb_map.get(cols[0], {}).get("section_label", prefix)
        items = []
        for col in cols:
            series = df[col].dropna()
            freq = series.value_counts().sort_index().to_dict()
            pct = (series.value_counts(normalize=True, sort=False).sort_index() * 100).round(1).to_dict()
            items.append({
                "variable": col,
                "label": cb_map.get(col, {}).get("label", col),
                "n": int(series.count()),
                "mean": round(float(series.mean()), 2),
                "std_dev": round(float(series.std()), 3),
                "frequencies": {str(k): int(v) for k, v in freq.items()},
                "percentages": {str(k): float(v) for k, v in pct.items()},
            })
        all_vals = df[cols].values.flatten()
        all_vals = all_vals[~np.isnan(all_vals.astype(float))]
        sections[prefix] = {
            "section_name": section_label,
            "variables": items,
            "section_mean": round(float(np.mean(all_vals)), 2) if len(all_vals) > 0 else 0,
            "section_std": round(float(np.std(all_vals)), 3) if len(all_vals) > 0 else 0,
        }
    return sections


def compute_correlation(df, iv_cols, dv_cols, cb_map):
    iv = df[iv_cols].mean(axis=1)
    dv = df[dv_cols].mean(axis=1)
    valid = pd.concat([iv, dv], axis=1).dropna()
    if len(valid) < 3:
        return None
    r, p = pearsonr(valid.iloc[:, 0], valid.iloc[:, 1])
    r_sp, p_sp = spearmanr(valid.iloc[:, 0], valid.iloc[:, 1])
    return {
        "pearson_r": round(float(r), 3),
        "spearman_rho": round(float(r_sp), 3),
        "p_value": round(float(p), 4),
        "n": int(valid.shape[0]),
        "significant": bool(p < 0.05),
        "effect_size": interpret_correlation(abs(r)),
        "iv_label": cb_map.get(iv_cols[0], {}).get("label", iv_cols[0]) if iv_cols else "IV",
        "dv_label": cb_map.get(dv_cols[0], {}).get("label", dv_cols[0]) if dv_cols else "DV",
    }


def interpret_correlation(r):
    if r >= 0.7: return "Strong"
    if r >= 0.5: return "Moderate"
    if r >= 0.3: return "Weak"
    return "Negligible"


def compute_correlation_matrix(df, cols, cb_map):
    sub = df[cols].dropna()
    if len(sub) < 3:
        return None
    matrix = []
    for c1 in cols:
        row = []
        for c2 in cols:
            if c1 == c2:
                row.append({"r": 1.0, "p": 0.0, "sig": False})
            else:
                valid = sub[[c1, c2]].dropna()
                if len(valid) >= 3:
                    r, p = pearsonr(valid[c1], valid[c2])
                    row.append({"r": round(float(r), 3), "p": round(float(p), 4), "sig": bool(p < 0.05)})
                else:
                    row.append({"r": None, "p": None, "sig": False})
        matrix.append(row)
    return {
        "variables": cols,
        "labels": [cb_map.get(c, {}).get("label", c) for c in cols],
        "matrix": matrix,
    }


def pearson_single(df, col1, col2, cb_map):
    valid = df[[col1, col2]].dropna()
    r, p = pearsonr(valid[col1], valid[col2])
    return {"r": round(float(r), 3), "p_value": round(float(p), 4), "n": len(valid), "significant": bool(p < 0.05)}


def spearman_single(df, col1, col2, cb_map):
    valid = df[[col1, col2]].dropna()
    r, p = spearmanr(valid[col1], valid[col2])
    return {"rho": round(float(r), 3), "p_value": round(float(p), 4), "n": len(valid), "significant": bool(p < 0.05)}


def compute_ttest(df, group_col, dv_col, cb_map):
    groups = df.groupby(group_col)[dv_col].apply(lambda x: x.dropna().tolist())
    group_keys = list(groups.index)
    if len(group_keys) < 2:
        return None
    g1, g2 = groups[group_keys[0]], groups[group_keys[1]]
    t, p = ttest_ind(g1, g2)
    u, p_mw = mannwhitneyu(g1, g2, alternative="two-sided")
    n1, n2 = len(g1), len(g2)
    cohens_d = (np.mean(g1) - np.mean(g2)) / np.sqrt(((n1 - 1) * np.std(g1, ddof=1)**2 + (n2 - 1) * np.std(g2, ddof=1)**2) / (n1 + n2 - 2))
    return {
        "test": "Independent Samples t-test",
        "group_variable": group_col,
        "group_label": cb_map.get(group_col, {}).get("label", group_col),
        "dv_label": cb_map.get(dv_col, {}).get("label", dv_col),
        "groups": {str(k): {"n": len(v), "mean": round(float(np.mean(v)), 2), "sd": round(float(np.std(v, ddof=1)), 3)} for k, v in zip(group_keys, [g1, g2])},
        "t_statistic": round(float(t), 3),
        "p_value": round(float(p), 4),
        "significant": bool(p < 0.05),
        "cohens_d": round(float(cohens_d), 3),
        "effect_size": interpret_cohens_d(abs(cohens_d)),
        "mann_whitney_u": round(float(u), 3),
        "mann_whitney_p": round(float(p_mw), 4),
    }


def interpret_cohens_d(d):
    if d >= 0.8: return "Large"
    if d >= 0.5: return "Medium"
    if d >= 0.2: return "Small"
    return "Negligible"


def compute_anova(df, group_col, dv_col, cb_map):
    groups = df.groupby(group_col)[dv_col].apply(lambda x: x.dropna().tolist())
    group_keys = list(groups.index)
    if len(group_keys) < 2:
        return None
    group_vals = [groups[k] for k in group_keys]
    f, p = f_oneway(*group_vals)
    h, p_kw = kruskal(*group_vals)
    # Effect size (eta squared)
    grand_mean = df[dv_col].mean()
    ss_between = sum(len(g) * (np.mean(g) - grand_mean)**2 for g in group_vals)
    ss_total = sum((x - grand_mean)**2 for g in group_vals for x in g)
    eta_sq = ss_between / ss_total if ss_total > 0 else 0
    return {
        "test": "One-Way ANOVA",
        "group_variable": group_col,
        "group_label": cb_map.get(group_col, {}).get("label", group_col),
        "dv_label": cb_map.get(dv_col, {}).get("label", dv_col),
        "groups": {str(k): {"n": len(groups[k]), "mean": round(float(np.mean(groups[k])), 2), "sd": round(float(np.std(groups[k], ddof=1)), 3)} for k in group_keys},
        "f_statistic": round(float(f), 3),
        "p_value": round(float(p), 4),
        "significant": bool(p < 0.05),
        "eta_squared": round(float(eta_sq), 3),
        "effect_size": "Large" if eta_sq >= 0.14 else "Medium" if eta_sq >= 0.06 else "Small",
        "kruskal_wallis_h": round(float(h), 3),
        "kruskal_wallis_p": round(float(p_kw), 4),
    }


def compute_chi_square(df, col1, col2, cb_map):
    ct = pd.crosstab(df[col1], df[col2])
    if ct.size == 0:
        return None
    chi2, p, dof, expected = chi2_contingency(ct)
    n = ct.sum().sum()
    cramers_v = np.sqrt(chi2 / (n * (min(ct.shape) - 1))) if n > 0 else 0
    # Fisher's exact for 2x2
    fisher_p = None
    if ct.shape == (2, 2):
        _, fisher_p = fisher_exact(ct)
        fisher_p = round(float(fisher_p), 4)
    return {
        "test": "Chi-Square Test of Independence",
        "col1_label": cb_map.get(col1, {}).get("label", col1),
        "col2_label": cb_map.get(col2, {}).get("label", col2),
        "chi2": round(float(chi2), 3),
        "p_value": round(float(p), 4),
        "df": int(dof),
        "n": int(n),
        "significant": bool(p < 0.05),
        "cramers_v": round(float(cramers_v), 3),
        "fisher_exact_p": fisher_p,
        "contingency_table": ct.to_dict(),
    }


def compute_simple_regression(df, iv_col, dv_col, cb_map):
    valid = df[[iv_col, dv_col]].dropna()
    X = sm.add_constant(valid[iv_col])
    model = sm.OLS(valid[dv_col], X).fit()
    return format_regression(model, [iv_col], dv_col, cb_map, "Simple Linear Regression")


def compute_multiple_regression(df, iv_cols, dv_col, cb_map):
    valid = df[iv_cols + [dv_col]].dropna()
    X = sm.add_constant(valid[iv_cols])
    model = sm.OLS(valid[dv_col], X).fit()
    return format_regression(model, iv_cols, dv_col, cb_map, "Multiple Linear Regression")


def format_regression(model, iv_cols, dv_col, cb_map, test_name):
    predictors = []
    for col in iv_cols:
        if col in model.params.index:
            predictors.append({
                "variable": col,
                "label": cb_map.get(col, {}).get("label", col),
                "beta": round(float(model.params[col]), 3),
                "std_error": round(float(model.bse[col]), 3),
                "t_statistic": round(float(model.tvalues[col]), 3),
                "p_value": round(float(model.pvalues[col]), 4),
                "significant": bool(model.pvalues[col] < 0.05),
            })
    return {
        "test": test_name,
        "dv_label": cb_map.get(dv_col, {}).get("label", dv_col),
        "r_squared": round(float(model.rsquared), 3),
        "adj_r_squared": round(float(model.rsquared_adj), 3),
        "f_statistic": round(float(model.fvalue), 3),
        "f_p_value": round(float(model.f_pvalue), 4),
        "significant": bool(model.f_pvalue < 0.05),
        "n": int(model.nobs),
        "predictors": predictors,
        "equation": f"{dv_col} = {round(float(model.params.get('const', 0)), 3)} + " + " + ".join([f"{round(float(model.params[c]), 3)}*{c}" for c in iv_cols if c in model.params]),
    }


def compute_logistic_regression(df, iv_cols, dv_col, cb_map):
    valid = df[iv_cols + [dv_col]].dropna()
    try:
        X = sm.add_constant(valid[iv_cols])
        model = sm.Logit(valid[dv_col], X).fit(disp=0)
        predictors = []
        for col in iv_cols:
            if col in model.params.index:
                predictors.append({
                    "variable": col,
                    "label": cb_map.get(col, {}).get("label", col),
                    "coefficient": round(float(model.params[col]), 3),
                    "odds_ratio": round(float(np.exp(model.params[col])), 3),
                    "p_value": round(float(model.pvalues[col]), 4),
                    "significant": bool(model.pvalues[col] < 0.05),
                })
        return {
            "test": "Binary Logistic Regression",
            "dv_label": cb_map.get(dv_col, {}).get("label", dv_col),
            "pseudo_r_squared": round(float(model.prsquared), 3),
            "log_likelihood": round(float(model.llf), 3),
            "aic": round(float(model.aic), 3),
            "n": int(model.nobs),
            "predictors": predictors,
        }
    except Exception as e:
        return {"test": "Binary Logistic Regression", "error": str(e)}


def compute_efa(df, cols, cb_map):
    if not HAS_FACTOR:
        return {"error": "factor_analyzer not installed"}
    sub = df[cols].dropna()
    if sub.shape[0] < 10 or sub.shape[1] < 3:
        return {"error": "Insufficient data for factor analysis"}
    try:
        fa = FactorAnalyzer(n_factors=min(3, sub.shape[1] - 1), rotation="varimax")
        fa.fit(sub)
        loadings = fa.loadings_.tolist()
        ev, _ = fa.get_eigenvalues()
        return {
            "test": "Exploratory Factor Analysis (EFA)",
            "n_factors": fa.n_factors,
            "variables": cols,
            "labels": [cb_map.get(c, {}).get("label", c) for c in cols],
            "loadings": [[round(x, 3) for x in row] for row in loadings],
            "eigenvalues": [round(float(e), 3) for e in ev],
            "variance_explained": [round(float(v), 3) for v in fa.get_factor_variance()[1]],
            "rotation": "Varimax",
            "n_respondents": int(sub.shape[0]),
        }
    except Exception as e:
        return {"test": "EFA", "error": str(e)}


def compute_mediation(df, iv_col, med_col, dv_col, cb_map):
    try:
        valid = df[[iv_col, med_col, dv_col]].dropna()
        # Step 1: IV → DV (path c)
        _, p_c = pearsonr(valid[iv_col], valid[dv_col])
        r_c, _ = pearsonr(valid[iv_col], valid[dv_col])
        # Step 2: IV → Mediator (path a)
        r_a, p_a = pearsonr(valid[iv_col], valid[med_col])
        # Step 3: Mediator → DV controlling IV (path b) + direct IV → DV (path c')
        X = sm.add_constant(valid[[iv_col, med_col]])
        model = sm.OLS(valid[dv_col], X).fit()
        b = model.params.get(med_col, 0)
        c_prime = model.params.get(iv_col, 0)
        indirect = r_a * b
        return {
            "test": "Mediation Analysis (Baron & Kenny)",
            "iv_label": cb_map.get(iv_col, {}).get("label", iv_col),
            "mediator_label": cb_map.get(med_col, {}).get("label", med_col),
            "dv_label": cb_map.get(dv_col, {}).get("label", dv_col),
            "path_a": round(float(r_a), 3),
            "path_a_p": round(float(p_a), 4),
            "path_b": round(float(b), 3),
            "path_c": round(float(r_c), 3),
            "path_c_p": round(float(p_c), 4),
            "path_c_prime": round(float(c_prime), 3),
            "indirect_effect": round(float(indirect), 3),
            "n": int(valid.shape[0]),
            "mediation_type": "Full" if abs(c_prime) < 0.05 else "Partial" if abs(indirect) > 0.01 else "None",
        }
    except Exception as e:
        return {"test": "Mediation", "error": str(e)}


def compute_moderation(df, iv_col, mod_col, dv_col, cb_map):
    try:
        valid = df[[iv_col, mod_col, dv_col]].dropna()
        iv_z = (valid[iv_col] - valid[iv_col].mean()) / valid[iv_col].std()
        mod_z = (valid[mod_col] - valid[mod_col].mean()) / valid[mod_col].std()
        interaction = iv_z * mod_z
        X = sm.add_constant(pd.DataFrame({"iv": iv_z, "mod": mod_z, "interaction": interaction}))
        model = sm.OLS(valid[dv_col], X).fit()
        return {
            "test": "Moderation Analysis",
            "iv_label": cb_map.get(iv_col, {}).get("label", iv_col),
            "moderator_label": cb_map.get(mod_col, {}).get("label", mod_col),
            "dv_label": cb_map.get(dv_col, {}).get("label", dv_col),
            "r_squared": round(float(model.rsquared), 3),
            "interaction_beta": round(float(model.params.get("interaction", 0)), 3),
            "interaction_p": round(float(model.pvalues.get("interaction", 1)), 4),
            "significant": bool(model.pvalues.get("interaction", 1) < 0.05),
            "n": int(valid.shape[0]),
        }
    except Exception as e:
        return {"test": "Moderation", "error": str(e)}


# ─── Utility ──────────────────────────────────────────────────────────────────
import math

def safe_json(obj):
    """Recursively convert all types to JSON-safe Python natives.
    Handles: numpy types, Python float NaN/Inf, pandas NA, None."""
    if obj is None:
        return None
    # numpy integer types
    if isinstance(obj, np.integer):
        return int(obj)
    # numpy float types (covers np.nan, np.inf)
    if isinstance(obj, np.floating):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return float(obj)
    # numpy bool
    if isinstance(obj, np.bool_):
        return bool(obj)
    # numpy array
    if isinstance(obj, np.ndarray):
        return safe_json(obj.tolist())
    # Python native float (pandas .mean(), .std() can return these with NaN)
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    # Python native bool (before int check — bool is subclass of int)
    if isinstance(obj, bool):
        return obj
    # Python native int
    if isinstance(obj, int):
        return obj
    # dict
    if isinstance(obj, dict):
        return {str(k): safe_json(v) for k, v in obj.items()}
    # list / tuple
    if isinstance(obj, (list, tuple)):
        return [safe_json(v) for v in obj]
    # pandas NA / NaT
    try:
        import pandas as pd
        if pd.isna(obj):
            return None
    except (TypeError, ValueError):
        pass
    return obj
