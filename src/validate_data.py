from pathlib import Path
import csv, sys
ROOT=Path(__file__).resolve().parents[1]

def rows(path):
    with path.open(encoding="utf-8", newline="") as f: return list(csv.DictReader(f))

errors=[]
# Required files
required=[
 "data/clean/consumo_agua_por_categoria_1990_2022.csv",
 "data/clean/economias_agua_por_categoria_1997_2022.csv",
 "data/clean/pmsb_indices_perdas_2010_2022.csv",
 "data/processed/carousel_metrics.csv",
]
for p in required:
    if not (ROOT/p).exists(): errors.append(f"missing {p}")
# Carousel assets
for i in range(1,8):
    if not any((ROOT/"assets/carousel").glob(f"{i:02d}-*.png")): errors.append(f"missing slide {i}")
# Key metrics
m={r["metrica"]:float(r["valor"]) for r in rows(ROOT/"data/processed/carousel_metrics.csv")}
checks={
 "consumo_medio_residencial_1997":18.4,
 "consumo_medio_residencial_2021":11.6,
 "variacao_consumo_medio_1997_2021":-36.9,
 "economias_residenciais_1997":87183,
 "economias_residenciais_2021":177429,
 "perdas_distribuicao_2022":53.93,
}
for k,v in checks.items():
    if abs(m.get(k,float('nan'))-v)>0.01: errors.append(f"{k}: {m.get(k)} != {v}")
if errors:
    print("VALIDATION FAILED")
    print("\n".join("- "+e for e in errors))
    sys.exit(1)
print("VALIDATION OK")
