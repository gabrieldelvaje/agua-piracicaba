"""Recalcula todos os indicadores derivados do episódio, sem dependências externas."""
import csv,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
D=ROOT/'data/episodio-3'
rows=list(csv.DictReader((D/'producao_eta_2022.csv').open()))
etas=[r for r in rows if r['unidade']!='Total']
total=int(next(r['volume_m3'] for r in rows if r['unidade']=='Total'))
assert sum(int(r['volume_m3']) for r in etas)==total
obs=list(csv.DictReader((D/'observacoes.csv').open()))
def value(ind,period):
 return next(float(r['valor']) for r in obs if r['indicador']==ind and r['periodo']==period)
chuva23=value('chuva_jan_ago','2023'); chuva24=value('chuva_jan_ago','2024')
cap0=value('capacidade_eta_iii','antes da ampliacao de 2026'); cap1=value('capacidade_eta_iii','entrega 2026-08-28')
aducao=list(csv.DictReader((D/'aducao_eta_2022.csv').open()))
metrics={'producao_total_2022_m3':total,'producao_por_eta':[{'unidade':r['unidade'],'volume_m3':int(r['volume_m3']),'participacao_pct':round(int(r['volume_m3'])/total*100,2)} for r in etas], 'chuva_jan_ago_mm':{'2023':chuva23,'2024':chuva24},'chuva_reducao_pct':round((1-chuva24/chuva23)*100,2),'capacidade_ampliacao_pct':round((cap1/cap0-1)*100,2),'capacidade_adicional_milhoes_l_dia':(cap1-cap0)*86400/1e6,'aducao_sobre_capacidade_pct':{r['unidade']:round(float(r['vazao_media_ls'])/float(r['capacidade_maxima_ls'])*100,2) for r in aducao if r['capacidade_maxima_ls']}}
(D/'indicadores.json').write_text(json.dumps(metrics,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(metrics,ensure_ascii=False,indent=2))
