from pathlib import Path
import csv

ROOT = Path(__file__).resolve().parents[1]

def read_csv(path):
    with path.open(encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))

def write_csv(path, rows):
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader(); w.writerows(rows)

cons = {int(r["ano"]): r for r in read_csv(ROOT/"data/clean/consumo_agua_por_categoria_1990_2022.csv")}
econ = {int(r["ano"]): r for r in read_csv(ROOT/"data/clean/economias_agua_por_categoria_1997_2022.csv")}
rows=[]
for ano in sorted(set(cons) & set(econ)):
    if ano == 2022:
        continue
    c=float(cons[ano]["residencial_m3"])
    e=float(econ[ano]["residencial"])
    rows.append({"ano":ano,"consumo_residencial_anual_m3":int(c),"economias_residenciais":int(e),"consumo_medio_m3_por_economia_mes":round(c/e/12,4)})
write_csv(ROOT/"data/processed/consumo_residencial_por_economia_1997_2021.csv", rows)
print("OK")
