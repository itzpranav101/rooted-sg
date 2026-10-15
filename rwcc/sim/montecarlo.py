"""Rooted SG: Monte Carlo forecast of extra plants alive at twelve months, year three.
Run: python3 montecarlo.py   (writes results.json, read by the website)
Every input is a counted unit or a measured proportion from the deck, or a range we state openly as an assumption."""
import json, numpy as np
N = 100_000
rng = np.random.default_rng(2026)
tri = lambda a, c, b: rng.triangular(a, c, b, N)

# --- inputs -------------------------------------------------------------
schools   = tri(20, 60, 120)          # schools running it in year 3: deck sensitivity range 20..120, base 60 (18% of ~330 MOE mainstream schools)
students  = tri(90, 120, 150)         # students per school per year: base 120 (~4 classes). Range is our assumption.
plants    = tri(1.5, 2.1, 3.0)        # plants per household: base 2.1 (assumption, tested in pilot). Range is our assumption.
uplift    = tri(0.0, 0.12, 0.15)      # survival uplift, percentage points / 100: base +12, deck sensitivity up to +15, pessimistic 0 (assumption)
BAR       = 0.05                      # deck falsification test: under +5 pp in the pilot, the base case is wrong
HOUSEHOLDS = 7200 / 0.005             # 7,200 households is 0.5% of all households (deck, SingStat 2024) -> ~1.44 million

# --- model --------------------------------------------------------------
clears = uplift >= BAR                # stage gate: we only scale if the twelve-week pilot clears the bar
s_run  = np.where(clears, schools, 2.0)      # otherwise we stay at the two-school pilot and redesign
hh     = s_run * students
tracked = hh * plants
extra  = tracked * uplift             # extra plants alive at twelve months (uplift is in absolute survival points)
share  = hh / HOUSEHOLDS

def q(x, ps=(5, 25, 50, 75, 95)): return {f"p{p}": float(np.percentile(x, p)) for p in ps}
def spearman(a, b):
    ra, rb = a.argsort().argsort(), b.argsort().argsort()
    return float(np.corrcoef(ra, rb)[0, 1])
ins = {"Schools taking it up": schools, "Survival uplift": uplift, "Students per school": students, "Plants per household": plants}
tornado = sorted(({"name": k, "rho": spearman(v, extra)} for k, v in ins.items()), key=lambda d: -abs(d["rho"]))

edges = np.linspace(0, 6000, 61)
hist, _ = np.histogram(np.clip(extra, 0, 5999.9), bins=edges)
out = {
  "trials": N, "seed": 2026,
  "extra": {**q(extra), "mean": float(extra.mean())},
  "households": {**q(hh), "mean": float(hh.mean())},
  "tracked": q(tracked),
  "share_of_households": q(share, (5, 50, 95)),
  "p_pilot_clears": float(clears.mean()),
  "p_extra_ge_500": float((extra >= 500).mean()),
  "p_extra_ge_1000": float((extra >= 1000).mean()),
  "p_extra_ge_1814": float((extra >= 1814).mean()),
  "p_extra_ge_3000": float((extra >= 3000).mean()),
  "base_case": 1814,
  "tornado": tornado,
  "hist": {"edges": [float(e) for e in edges], "counts": [int(h) for h in hist]},
  "inputs": {"schools": [20, 60, 120], "students": [90, 120, 150], "plants": [1.5, 2.1, 3.0], "uplift_pp": [0, 12, 15]},
}
json.dump(out, open("results.json", "w"), indent=1)
open("../js/simdata.js", "w").write("window.RWSIM=" + json.dumps(out, separators=(",", ":")) + ";\n")
print(json.dumps({k: out[k] for k in ("extra", "households", "p_pilot_clears", "p_extra_ge_500", "p_extra_ge_1000", "p_extra_ge_1814", "p_extra_ge_3000", "tornado", "share_of_households")}, indent=1))
