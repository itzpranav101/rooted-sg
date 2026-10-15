"""Rooted SG: checks on the Monte Carlo forecast. Run: python3 validate.py  (writes validation.json and ../js/valdata.js)
1. Convergence   2. Latin Hypercube cross-check   3. Sobol indices (pick-freeze)   4. Bootstrap interval on the median
5. Wilson intervals and a Beta posterior for the measured proportions   6. Deterministic three-scenario check"""
import json, math, numpy as np
RANGES = {"schools": (20, 60, 120), "students": (90, 120, 150), "plants": (1.5, 2.1, 3.0), "uplift": (0.0, 0.12, 0.15)}
BAR = 0.05
def tri_ppf(u, a, c, b):
    F = (c - a) / (b - a)
    return np.where(u < F, a + np.sqrt(u * (b - a) * (c - a)), b - np.sqrt((1 - u) * (b - a) * (b - c)))
def model(U):  # U: (n, 4) uniform [0,1) -> extra plants alive
    s, st, pl, up = (tri_ppf(U[:, i], *RANGES[k]) for i, k in enumerate(("schools", "students", "plants", "uplift")))
    ok = up >= BAR
    return np.where(ok, s, 2.0) * st * pl * up
out = {}

# 1 · convergence: does the answer stop moving as the number of runs grows?
rng = np.random.default_rng(7); Uall = rng.random((100_000, 4)); y = model(Uall)
out["convergence"] = [{"n": n, "median": float(np.median(y[:n])), "p5": float(np.percentile(y[:n], 5)), "p95": float(np.percentile(y[:n], 95))} for n in (1_000, 10_000, 30_000, 100_000)]
out["convergence_shift_pct"] = float(abs(out["convergence"][-1]["median"] - out["convergence"][1]["median"]) / out["convergence"][-1]["median"] * 100)

# 2 · Latin Hypercube: stratified draws should agree with plain random draws
n = 20_000; rng = np.random.default_rng(11)
L = np.column_stack([(rng.permutation(n) + rng.random(n)) / n for _ in range(4)])
yl = model(L); yr = model(rng.random((n, 4)))
out["lhs"] = {"n": n, "lhs_median": float(np.median(yl)), "random_median": float(np.median(yr)), "lhs_p5": float(np.percentile(yl, 5)), "lhs_p95": float(np.percentile(yl, 95)), "diff_pct": float(abs(np.median(yl) - np.median(yr)) / np.median(yl) * 100)}

# 3 · Sobol first-order and total indices (Saltelli pick-freeze estimators)
n = 40_000; rng = np.random.default_rng(3); A, B = rng.random((n, 4)), rng.random((n, 4)); fA, fB = model(A), model(B); V = np.var(np.concatenate([fA, fB]))
names = ["Schools taking it up", "Students per school", "Plants per household", "Survival uplift"]; sob = []
for i, nm in enumerate(names):
    AB = A.copy(); AB[:, i] = B[:, i]; fAB = model(AB)
    sob.append({"name": nm, "first": float(np.mean(fB * (fAB - fA)) / V), "total": float(0.5 * np.mean((fA - fAB) ** 2) / V)})
out["sobol"] = sorted(sob, key=lambda d: -d["total"])

# 4 · bootstrap: how sure are we of the median itself?
rng = np.random.default_rng(5); sample = y[:20_000]
meds = [np.median(rng.choice(sample, sample.size)) for _ in range(500)]
out["bootstrap_median"] = {"lo": float(np.percentile(meds, 2.5)), "hi": float(np.percentile(meds, 97.5)), "resamples": 500}

# 5 · measured proportions
def wilson(k, n, z=1.959964):
    p = k / n; d = 1 + z * z / n; c = p + z * z / (2 * n); h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)); return [100 * (c - h) / d, 100 * (c + h) / d]
out["wilson"] = {"field_test_4_of_4": wilson(4, 4), "survey_84_of_466_baseline": wilson(84, 466), "survey_would_use_85pct": wilson(round(.85 * 466), 466)}
rb = np.random.default_rng(9).beta(84 + 1, 466 - 84 + 1, 100_000)
out["baseline_beta"] = {"mean_pct": float(rb.mean() * 100), "p2_5": float(np.percentile(rb, 2.5) * 100), "p97_5": float(np.percentile(rb, 97.5) * 100), "p_below_30pct_bar": float((rb < .30).mean())}

# 6 · the deterministic arithmetic the simulation brackets
f = lambda s, up: s * 120 * 2.1 * up
out["scenarios"] = {"base_60_schools_12pp": f(60, .12), "low_20_schools": f(20, .12), "high_120_schools": f(120, .12), "uplift_5pp": f(60, .05), "uplift_15pp": f(60, .15)}
json.dump(out, open("validation.json", "w"), indent=1)
open("../js/valdata.js", "w").write("window.RWVAL=" + json.dumps(out, separators=(",", ":")) + ";\n")
print(json.dumps(out, indent=1))
