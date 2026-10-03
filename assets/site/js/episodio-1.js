const ep1English = String(document.documentElement.lang||'').toLowerCase().startsWith('en');
const ep1Locale = ep1English ? 'en-US' : 'pt-BR';
const ep1Ui = ep1English ? {
  unit:' m³ / customer unit / month',
  residences:'Residential units',
  network:'Network',
  index:'Index ',
  dataError:'Data could not be loaded',
  tableError:'The table could not be loaded.',
  openMenu:'Open episode menu',
  closeMenu:'Close episode menu'
} : {
  unit:' m³ / economia / mês',
  residences:'Residências',
  network:'Rede',
  index:'Índice ',
  dataError:'Dados não carregados',
  tableError:'Não foi possível carregar a tabela.',
  openMenu:'Abrir menu do episódio',
  closeMenu:'Fechar menu do episódio'
};
const fmt = new Intl.NumberFormat(ep1Locale, { maximumFractionDigits: 1 });
const fmtInt = new Intl.NumberFormat(ep1Locale, { maximumFractionDigits: 0 });

function parseCSV(text){
  const lines=text.trim().split(/\r?\n/); const headers=lines.shift().split(',');
  return lines.map(line=>{ const cells=line.split(','); return Object.fromEntries(headers.map((h,i)=>[h,cells[i]??''])); });
}
async function loadCSV(path){ const r=await fetch(path); if(!r.ok) throw new Error(path); return parseCSV(await r.text()); }
function pct(a,b){return (b/a-1)*100}
function n(v){return Number(String(v).replace(',','.'))}
function etaDisplayName(name){
  const labels={
    'ETA I':'ETA I (Luiz de Queiroz)',
    'ETA II':'ETA II (Luiz de Queiroz)',
    'ETA III':'ETA III (Capim Fino)'
  };
  return labels[name]||name;
}
function svgEl(name,attrs={}){const e=document.createElementNS('http://www.w3.org/2000/svg',name);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e}
function smoothLinePath(values,sx,sy){
  if(!values.length) return '';
  if(values.length===1) return 'M'+sx(values[0].x)+','+sy(values[0].y);
  const pts=values.map(v=>({x:sx(v.x),y:sy(v.y)}));
  let d='M'+pts[0].x+','+pts[0].y;
  for(let i=0;i<pts.length-1;i++){
    const a=pts[i], b=pts[i+1];
    const dx=(b.x-a.x)*0.16;
    d+=' C'+(a.x+dx)+','+a.y+' '+(b.x-dx)+','+b.y+' '+b.x+','+b.y;
  }
  return d;
}
function drawLineChart(svg, series, options={}){
  svg.innerHTML='';
  const W=900,H=options.height||320,p={l:55,r:20,t:20,b:40};
  const all=series.flatMap(s=>s.values);
  const minY=options.minY??Math.min(...all.map(d=>d.y));
  const maxY=options.maxY??Math.max(...all.map(d=>d.y));
  const xs=all.map(d=>d.x);
  const minX=Math.min(...xs),maxX=Math.max(...xs);
  const sx=x=>p.l+(x-minX)/(maxX-minX)*(W-p.l-p.r);
  const sy=y=>H-p.b-(y-minY)/(maxY-minY)*(H-p.t-p.b);

  for(let i=0;i<5;i++){
    const y=p.t+i*(H-p.t-p.b)/4;
    svg.append(svgEl('line',{x1:p.l,y1:y,x2:W-p.r,y2:y,class:'grid'}));
    const value=maxY-i*(maxY-minY)/4;
    const t=svgEl('text',{x:p.l-10,y:y+4,'text-anchor':'end'});
    t.textContent=options.yFormat?options.yFormat(value):fmt.format(value);
    svg.append(t);
  }

  const years=[minX,Math.round(minX+(maxX-minX)/3),Math.round(minX+2*(maxX-minX)/3),maxX];
  years.forEach(x=>{
    const t=svgEl('text',{x:sx(x),y:H-12,'text-anchor':'middle'});
    t.textContent=x;
    svg.append(t);
  });

  series.forEach((s,idx)=>{
    const color=s.color||['#0736fe','#231f20'][idx%2];
    const d=s.values.map((v,i)=>(i?'L':'M')+sx(v.x)+','+sy(v.y)).join(' ');
    const pathAttrs={d,fill:'none',stroke:color,'stroke-width':s.strokeWidth||options.strokeWidth||4,'stroke-linejoin':'round','stroke-linecap':'round'};
    if(s.dasharray) pathAttrs['stroke-dasharray']=s.dasharray;
    svg.append(svgEl('path',pathAttrs));
    if(s.showEndpoints!==false){
      s.values.forEach((v,i)=>{
        if(i===0||i===s.values.length-1){
          const endpointAttrs={cx:sx(v.x),cy:sy(v.y),r:5,fill:color};
          if(s.endpointStroke){endpointAttrs.stroke=s.endpointStroke;endpointAttrs['stroke-width']=s.endpointStrokeWidth||1.5;}
          svg.append(svgEl('circle',endpointAttrs));
        }
      });
    }
  });

  if(options.interactive && series[0]?.values?.length){
    const values=series[0].values;
    const primaryColor=series[0].color||'#0736fe';
    const multi=series.length>1;
    const guide=svgEl('line',{x1:0,y1:p.t,x2:0,y2:H-p.b,stroke:primaryColor,'stroke-width':2,'stroke-dasharray':'5 6',opacity:0});

    const dots=series.map((s,idx)=>{
      const color=s.color||['#0736fe','#231f20'][idx%2];
      const attrs={cx:0,cy:0,r:5,fill:color,opacity:0};
      if(idx>0){attrs.stroke='#fff';attrs['stroke-width']=1.5;}
      return svgEl('circle',attrs);
    });

    const tip=svgEl('g',{opacity:0,'pointer-events':'none'});
    const hasTooltipGap=multi&&options.tooltipGap===true;
    const boxW=multi?224:184;
    const boxH=multi?(hasTooltipGap?102:82):56;
    const tipRect=svgEl('rect',{x:0,y:0,width:boxW,height:boxH,rx:12,fill:'#231F20'});
    const tipYear=svgEl('text',{x:0,y:0,class:'chart-tooltip-text chart-tooltip-year','font-size':14,'font-weight':700});
    tip.append(tipRect,tipYear);

    let tipValue=null;
    let gapText=null;
    const multiRows=[];
    if(multi){
      series.forEach((s,idx)=>{
        const color=s.color||['#0736fe','#231f20'][idx%2];
        const bulletAttrs={cx:0,cy:0,r:4,fill:color};
        if(idx>0){bulletAttrs.stroke='#fff';bulletAttrs['stroke-width']=1.5;}
        const bullet=svgEl('circle',bulletAttrs);
        const label=svgEl('text',{x:0,y:0,class:'chart-tooltip-text chart-tooltip-value','font-size':13});
        tip.append(bullet,label);
        multiRows.push({bullet,label,series:s});
      });
      if(hasTooltipGap){
        gapText=svgEl('text',{x:0,y:0,class:'chart-tooltip-text chart-tooltip-value','font-size':13,'font-weight':700});
        tip.append(gapText);
      }
    }else{
      tipValue=svgEl('text',{x:0,y:0,class:'chart-tooltip-text chart-tooltip-value','font-size':13});
      tip.append(tipValue);
    }

    svg.append(guide,...dots,tip);

    const showAt=event=>{
      const bounds=svg.getBoundingClientRect();
      const localX=(event.clientX-bounds.left)/bounds.width*W;
      const nearest=values.reduce((best,v)=>Math.abs(sx(v.x)-localX)<Math.abs(sx(best.x)-localX)?v:best,values[0]);
      const x=sx(nearest.x);
      const points=series.map(s=>s.values.find(v=>v.x===nearest.x)).filter(Boolean);
      const anchorY=Math.min(...points.map(v=>sy(v.y)));
      let tx=x-boxW/2;
      tx=Math.max(p.l,Math.min(W-p.r-boxW,tx));
      let ty=anchorY-boxH-18;
      if(ty<p.t) ty=anchorY+18;

      guide.setAttribute('x1',x);
      guide.setAttribute('x2',x);
      guide.setAttribute('opacity','1');

      dots.forEach((dot,idx)=>{
        const point=series[idx].values.find(v=>v.x===nearest.x);
        if(!point){dot.setAttribute('opacity','0');return;}
        dot.setAttribute('cx',x);
        dot.setAttribute('cy',sy(point.y));
        dot.setAttribute('opacity','1');
      });

      tip.setAttribute('opacity','1');
      tipRect.setAttribute('x',tx);
      tipRect.setAttribute('y',ty);
      tipYear.setAttribute('x',tx+14);
      tipYear.setAttribute('y',ty+22);
      tipYear.textContent=String(nearest.x);

      if(multi){
        multiRows.forEach((row,idx)=>{
          const point=row.series.values.find(v=>v.x===nearest.x);
          const rowY=ty+45+(idx*20);
          row.bullet.setAttribute('cx',tx+17);
          row.bullet.setAttribute('cy',rowY-4);
          row.label.setAttribute('x',tx+29);
          row.label.setAttribute('y',rowY);
          const label=row.series.label||('Série '+(idx+1));
          const value=point
            ? (row.series.tooltipFormat?row.series.tooltipFormat(point.y):fmt.format(point.y))
            : '—';
          row.label.textContent=label+': '+value;
        });
        if(gapText){
          const first=series[0].values.find(v=>v.x===nearest.x);
          const second=series[1].values.find(v=>v.x===nearest.x);
          const gap=first&&second?first.y-second.y:null;
          gapText.setAttribute('x',tx+14);
          gapText.setAttribute('y',ty+85);
          gapText.textContent=gap===null?'Gap: —':'Gap: '+(gap>0?'+':'')+fmt.format(gap)+' p.p.';
        }
      }else{
        tipValue.setAttribute('x',tx+14);
        tipValue.setAttribute('y',ty+43);
        tipValue.textContent=(options.tooltipFormat?options.tooltipFormat(nearest.y):fmt.format(nearest.y));
      }
    };

    const hide=()=>{
      guide.setAttribute('opacity','0');
      dots.forEach(dot=>dot.setAttribute('opacity','0'));
      tip.setAttribute('opacity','0');
    };

    const hit=svgEl('rect',{
      x:p.l,y:p.t,width:W-p.l-p.r,height:H-p.t-p.b,
      fill:'transparent',class:'chart-hover-hit'
    });
    hit.addEventListener('pointermove',showAt);
    hit.addEventListener('pointerdown',showAt);
    hit.addEventListener('pointerleave',hide);
    svg.append(hit);
  }}

async function initData(){
  try{
    const [cons,econ,network,loss,etas]=await Promise.all([
      loadCSV('data/processed/consumo_residencial_por_economia_1997_2021.csv'),
      loadCSV('data/clean/economias_agua_por_categoria_1997_2022.csv'),
      loadCSV('data/clean/extensao_rede_agua_esgoto_1976_2022.csv'),
      loadCSV('data/clean/pmsb_indices_perdas_2010_2022.csv'),
      loadCSV('data/clean/pmsb_producao_agua_por_eta_2022.csv')
    ]);
    const c=cons.filter(d=>n(d.ano)<=2021).map(d=>({x:n(d.ano),y:n(d.consumo_medio_m3_por_economia_mes)}));
    document.querySelector('#consumption-start').textContent=fmt.format(c[0].y); document.querySelector('#consumption-end').textContent=fmt.format(c.at(-1).y); document.querySelector('#consumption-change').textContent=fmt.format(pct(c[0].y,c.at(-1).y))+'%';
    drawLineChart(document.querySelector('#consumption-chart'),[{values:c,color:'#0736fe'}],{minY:10,maxY:20,interactive:true,tooltipFormat:v=>fmt.format(v)+ep1Ui.unit});

    const e=econ.filter(d=>n(d.ano)>=1997&&n(d.ano)<=2021).map(d=>({x:n(d.ano),y:n(d.residencial)}));
    const r=network.filter(d=>n(d.ano)>=1997&&n(d.ano)<=2021).map(d=>({x:n(d.ano),y:n(d.agua_rede_existente_m)/1000}));
    document.querySelector('#economies-start').textContent=fmtInt.format(e[0].y); document.querySelector('#economies-end').textContent=fmtInt.format(e.at(-1).y); document.querySelector('#economies-growth').textContent='+'+fmt.format(pct(e[0].y,e.at(-1).y))+'%';
    document.querySelector('#network-start').textContent=fmtInt.format(r[0].y)+' km'; document.querySelector('#network-end').textContent=fmtInt.format(r.at(-1).y)+' km'; document.querySelector('#network-growth').textContent='+'+fmt.format(pct(r[0].y,r.at(-1).y))+'%';
    const ei=e.map(d=>({x:d.x,y:d.y/e[0].y*100})); const ri=r.map(d=>({x:d.x,y:d.y/r[0].y*100}));
    drawLineChart(document.querySelector('#growth-chart'),[
      {values:ei,color:'#0736fe',label:ep1Ui.residences,tooltipFormat:v=>ep1Ui.index+fmt.format(v)},
      {values:ri,color:'#231f20',label:ep1Ui.network,tooltipFormat:v=>ep1Ui.index+fmt.format(v),endpointStroke:'#fff',endpointStrokeWidth:1.5}
    ],{height:360,minY:90,maxY:215,yFormat:v=>fmtInt.format(v),interactive:true,tooltipGap:true});

    const lastLoss=loss.find(d=>d.ano==='2022');
    const lossRate=n(lastLoss?.perdas_distribuicao_pct||53.93);
    const nationalLossRate=37.78;
    const aboveNational=(lossRate/nationalLossRate-1)*100;
    window.lossRate=lossRate;
    document.querySelector('#loss-pira').textContent=fmt.format(lossRate)+'%';
    document.querySelector('#loss-pira-bar').style.width=lossRate+'%';
    document.querySelector('#loss-above-national').textContent='+'+fmt.format(aboveNational)+'%';
    updateWater();

    const validEtas=etas.filter(d=>d.unidade!=='Total'); const max=Math.max(...validEtas.map(d=>n(d.volume_m3))); const list=document.querySelector('#eta-list'); list.innerHTML=validEtas.map(d=>'<div class="eta-row"><div class="eta-head"><span>'+etaDisplayName(d.unidade)+'</span><strong>'+fmt.format(n(d.participacao_pct))+'%</strong></div><div class="eta-track"><i style="width:'+(n(d.volume_m3)/max*100)+'%"></i></div></div>').join('');
  }catch(err){console.warn(ep1Ui.dataError,err)}
}

const slider=document.querySelector('#tons-slider'); function updateWater(){const t=n(slider?.value||7),rate=(window.lossRate||53.93)/100, lost=t*rate, remain=t-lost;document.querySelector('#tons-value').textContent=fmtInt.format(t);document.querySelector('#water-loss').textContent=fmt.format(lost)+' t';document.querySelector('#water-remaining').textContent=fmt.format(remain)+' t'} slider?.addEventListener('input',updateWater);
// Consulta do CSV calculado em uma janela sobre a página.
const consumptionTableDialog=document.querySelector('#consumption-table-dialog');
const consumptionTableBody=consumptionTableDialog?.querySelector('[data-consumption-table-body]');
let consumptionTableLoaded=false;

async function fillConsumptionTable(){
  if(consumptionTableLoaded || !consumptionTableBody) return;
  try{
    const rows=await loadCSV('data/processed/consumo_residencial_por_economia_1997_2021.csv');
    consumptionTableBody.innerHTML=rows.map(row=>{
      const annual=n(row.consumo_residencial_anual_m3);
      const economies=n(row.economias_residenciais);
      const monthly=n(row.consumo_medio_m3_por_economia_mes);
      return '<tr>'+
        '<td>'+row.ano+'</td>'+
        '<td>'+fmtInt.format(annual)+' m³</td>'+
        '<td>'+fmtInt.format(economies)+'</td>'+
        '<td><strong>'+fmt.format(monthly)+' m³</strong></td>'+
      '</tr>';
    }).join('');
    consumptionTableLoaded=true;
  }catch(err){
    consumptionTableBody.innerHTML='<tr><td colspan="4">'+ep1Ui.tableError+'</td></tr>';
  }
}

let consumptionDialogScrollY=0;

function lockPageForConsumptionDialog(){
  consumptionDialogScrollY=window.scrollY;
  document.documentElement.classList.add('data-dialog-open');
  document.body.classList.add('data-dialog-open');
  document.body.style.top='-'+consumptionDialogScrollY+'px';
}

function unlockPageForConsumptionDialog(){
  if(!document.body.classList.contains('data-dialog-open')) return;

  const root=document.documentElement;
  const body=document.body;
  const previousRootBehavior=root.style.scrollBehavior;
  const previousBodyBehavior=body.style.scrollBehavior;

  // Restaura a posição no mesmo frame, sem disparar o scroll suave global.
  root.style.scrollBehavior='auto';
  body.style.scrollBehavior='auto';
  root.classList.remove('data-dialog-open');
  body.classList.remove('data-dialog-open');
  body.style.top='';
  window.scrollTo({top:consumptionDialogScrollY,left:0,behavior:'auto'});

  requestAnimationFrame(()=>{
    root.style.scrollBehavior=previousRootBehavior;
    body.style.scrollBehavior=previousBodyBehavior;
  });
}

document.querySelector('[data-open-consumption-table]')?.addEventListener('click',async()=>{
  await fillConsumptionTable();
  if(!consumptionTableDialog) return;
  lockPageForConsumptionDialog();
  consumptionTableDialog.showModal();
});

document.querySelector('[data-close-consumption-table]')?.addEventListener('click',()=>{
  consumptionTableDialog?.close();
});

consumptionTableDialog?.addEventListener('click',event=>{
  if(event.target===consumptionTableDialog) consumptionTableDialog.close();
});

consumptionTableDialog?.addEventListener('close',unlockPageForConsumptionDialog);

// Consulta da comparação entre residências e extensão da rede.
const growthTableDialog=document.querySelector('#growth-table-dialog');
const growthTableBody=growthTableDialog?.querySelector('[data-growth-table-body]');
let growthTableLoaded=false;

async function fillGrowthTable(){
  if(growthTableLoaded || !growthTableBody) return;
  try{
    const [econRows,networkRows]=await Promise.all([
      loadCSV('data/clean/economias_agua_por_categoria_1997_2022.csv'),
      loadCSV('data/clean/extensao_rede_agua_esgoto_1976_2022.csv')
    ]);
    const econMap=new Map(
      econRows
        .filter(row=>n(row.ano)>=1997&&n(row.ano)<=2021)
        .map(row=>[n(row.ano),n(row.residencial)])
    );
    const networkMap=new Map(
      networkRows
        .filter(row=>n(row.ano)>=1997&&n(row.ano)<=2021)
        .map(row=>[n(row.ano),n(row.agua_rede_existente_m)/1000])
    );
    const years=[...econMap.keys()].filter(year=>networkMap.has(year)).sort((a,b)=>a-b);
    const baseE=econMap.get(1997);
    const baseR=networkMap.get(1997);

    growthTableBody.innerHTML=years.map(year=>{
      const residences=econMap.get(year);
      const networkKm=networkMap.get(year);
      const residenceGrowth=(residences/baseE-1)*100;
      const networkGrowth=(networkKm/baseR-1)*100;
      const gap=residenceGrowth-networkGrowth;
      const signed=value=>(value>0?'+':'')+fmt.format(value)+'%';
      const signedGap=value=>(value>0?'+':'')+fmt.format(value)+' p.p.';
      return '<tr>'+
        '<td>'+year+'</td>'+
        '<td>'+fmtInt.format(residences)+'</td>'+
        '<td>'+fmtInt.format(networkKm)+' km</td>'+
        '<td>'+signed(residenceGrowth)+'</td>'+
        '<td>'+signed(networkGrowth)+'</td>'+
        '<td><strong>'+signedGap(gap)+'</strong></td>'+
      '</tr>';
    }).join('');
    growthTableLoaded=true;
  }catch(err){
    growthTableBody.innerHTML='<tr><td colspan="6">'+ep1Ui.tableError+'</td></tr>';
  }
}

document.querySelector('[data-open-growth-table]')?.addEventListener('click',async()=>{
  await fillGrowthTable();
  if(!growthTableDialog) return;
  lockPageForConsumptionDialog();
  growthTableDialog.showModal();
});

document.querySelector('[data-close-growth-table]')?.addEventListener('click',()=>{
  growthTableDialog?.close();
});

growthTableDialog?.addEventListener('click',event=>{
  if(event.target===growthTableDialog) growthTableDialog.close();
});

growthTableDialog?.addEventListener('close',unlockPageForConsumptionDialog);

// Consulta da produção de água por ETA.
const productionTableDialog=document.querySelector('#production-table-dialog');
const productionTableBody=productionTableDialog?.querySelector('[data-production-table-body]');
let productionTableLoaded=false;

async function fillProductionTable(){
  if(productionTableLoaded || !productionTableBody) return;
  try{
    const rows=await loadCSV('data/clean/pmsb_producao_agua_por_eta_2022.csv');
    productionTableBody.innerHTML=rows.map(row=>{
      const volume=n(row.volume_m3);
      const share=n(row.participacao_pct);
      return '<tr>'+
        '<td>'+etaDisplayName(row.unidade)+'</td>'+
        '<td>'+fmtInt.format(volume)+' m³</td>'+
        '<td><strong>'+fmt.format(share)+'%</strong></td>'+
      '</tr>';
    }).join('');
    productionTableLoaded=true;
  }catch(err){
    productionTableBody.innerHTML='<tr><td colspan="3">'+ep1Ui.tableError+'</td></tr>';
  }
}

document.querySelector('[data-open-production-table]')?.addEventListener('click',async()=>{
  await fillProductionTable();
  if(!productionTableDialog) return;
  lockPageForConsumptionDialog();
  productionTableDialog.showModal();
});

document.querySelector('[data-close-production-table]')?.addEventListener('click',()=>{
  productionTableDialog?.close();
});

productionTableDialog?.addEventListener('click',event=>{
  if(event.target===productionTableDialog) productionTableDialog.close();
});

productionTableDialog?.addEventListener('close',unlockPageForConsumptionDialog);

// Consulta da série histórica de perdas.
const lossTableDialog=document.querySelector('#loss-table-dialog');
const lossTableBody=lossTableDialog?.querySelector('[data-loss-table-body]');
let lossTableLoaded=false;

async function fillLossTable(){
  if(lossTableLoaded || !lossTableBody) return;
  try{
    const rows=await loadCSV('data/clean/pmsb_indices_perdas_2010_2022.csv');
    lossTableBody.innerHTML=rows.map(row=>{
      return '<tr>'+
        '<td>'+row.ano+'</td>'+
        '<td><strong>'+fmt.format(n(row.perdas_distribuicao_pct))+'%</strong></td>'+
        '<td>'+fmt.format(n(row.perdas_faturamento_pct))+'%</td>'+
        '<td>'+fmt.format(n(row.perdas_por_ligacao_l_dia))+' L/ligação/dia</td>'+
        '<td>'+fmt.format(n(row.perdas_brutas_lineares_m3_dia_km))+' m³/dia/km</td>'+
      '</tr>';
    }).join('');
    lossTableLoaded=true;
  }catch(err){
    lossTableBody.innerHTML='<tr><td colspan="5">'+ep1Ui.tableError+'</td></tr>';
  }
}

document.querySelector('[data-open-loss-table]')?.addEventListener('click',async()=>{
  await fillLossTable();
  if(!lossTableDialog) return;
  lockPageForConsumptionDialog();
  lossTableDialog.showModal();
});

document.querySelector('[data-close-loss-table]')?.addEventListener('click',()=>{
  lossTableDialog?.close();
});

lossTableDialog?.addEventListener('click',event=>{
  if(event.target===lossTableDialog) lossTableDialog.close();
});

lossTableDialog?.addEventListener('close',unlockPageForConsumptionDialog);

// Janelas de fontes, metodologia e validação.
document.querySelectorAll('[data-open-info-dialog]').forEach(trigger=>{
  trigger.addEventListener('click',()=>{
    const id=trigger.getAttribute('data-open-info-dialog');
    const infoDialog=document.getElementById(id);
    if(!infoDialog) return;
    lockPageForConsumptionDialog();
    infoDialog.showModal();
  });
});

document.querySelectorAll('.info-dialog').forEach(infoDialog=>{
  infoDialog.querySelector('[data-close-info-dialog]')?.addEventListener('click',()=>infoDialog.close());
  infoDialog.addEventListener('click',event=>{
    if(event.target===infoDialog) infoDialog.close();
  });
  infoDialog.addEventListener('close',unlockPageForConsumptionDialog);
});

initData();

// episode-one-smooth-section-navigation
(() => {
  const triggers = [
    ...document.querySelectorAll('.scroll-cue[href^="#"]'),
    ...document.querySelectorAll('.site-header nav a[href^="#"]')
  ];
  if (!triggers.length) return;

  const easeInOutCubic = t =>
    t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

  const animateToTarget = (target, hash) => {
    const root = document.documentElement;
    const body = document.body;
    const previousRootBehavior = root.style.scrollBehavior;
    const previousBodyBehavior = body.style.scrollBehavior;

    root.style.scrollBehavior = 'auto';
    body.style.scrollBehavior = 'auto';

    const header = document.querySelector('.site-header');
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const start = window.scrollY;
    const rawEnd = target.getBoundingClientRect().top + window.scrollY - headerHeight;
    const maxEnd = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const end = Math.max(0, Math.min(rawEnd, maxEnd));
    const distance = end - start;
    const duration = 950;
    let startedAt = null;

    const step = now => {
      if (startedAt === null) startedAt = now;
      const progress = Math.min((now - startedAt) / duration, 1);
      window.scrollTo(0, start + distance * easeInOutCubic(progress));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        window.scrollTo(0, end);
        root.style.scrollBehavior = previousRootBehavior;
        body.style.scrollBehavior = previousBodyBehavior;
        history.replaceState(null, '', hash);
      }
    };

    requestAnimationFrame(step);
  };

  triggers.forEach(trigger => {
    trigger.addEventListener('click', event => {
      const hash = trigger.getAttribute('href');
      if (!hash || hash === '#') return;

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      animateToTarget(target, hash);
    });
  });
})();


// episode-one-back-to-top
(() => {
  const button = document.querySelector('[data-back-to-top]');
  if (!button) return;

  const media = window.matchMedia('(max-width: 1024px)');
  const forceTopKey = 'episode-1-force-top-after-refresh';

  const updateVisibility = () => {
    const visible = media.matches && window.scrollY > Math.max(520, window.innerHeight * 0.7);
    button.classList.toggle('is-visible', visible);
  };

  const keepTopAfterRefresh = () => {
    if (sessionStorage.getItem(forceTopKey) !== '1') return;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    const forceTop = () => window.scrollTo({ top:0, left:0, behavior:'auto' });
    forceTop();
    requestAnimationFrame(forceTop);
    window.setTimeout(forceTop, 80);
    window.setTimeout(() => sessionStorage.removeItem(forceTopKey), 300);
  };

  button.addEventListener('click', () => {
    sessionStorage.setItem(forceTopKey, '1');

    const cleanUrl = window.location.pathname + window.location.search;
    history.replaceState(null, '', cleanUrl);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('pageshow', keepTopAfterRefresh);
  window.addEventListener('load', keepTopAfterRefresh);
  window.addEventListener('scroll', updateVisibility, { passive: true });
  window.addEventListener('resize', updateVisibility);
  media.addEventListener?.('change', updateVisibility);
  updateVisibility();
})();


// episode-one-horizontal-timeline
(() => {
  const viewport = document.querySelector('[data-timeline-viewport]');
  const prev = document.querySelector('[data-timeline-prev]');
  const next = document.querySelector('[data-timeline-next]');
  if (!viewport || !prev || !next) return;

  let activeFrame = null;
  let sliding = false;
  let timelineSeen = false;

  const pulseArrowOnce = button => {
    if (!timelineSeen || button.hidden || button.dataset.introPulsed === 'true') return;
    button.dataset.introPulsed = 'true';
    button.classList.add('is-intro-pulse');
    window.setTimeout(()=>button.classList.remove('is-intro-pulse'),2600);
  };

  const maxScroll = () =>
    Math.max(0, viewport.scrollWidth - viewport.clientWidth);

  const getBaseStep = () => {
    const items = [...viewport.querySelectorAll('.timeline-item')];
    if (items.length > 1) {
      const delta = items[1].offsetLeft - items[0].offsetLeft;
      if (delta > 0) return delta;
    }
    return Math.min(viewport.clientWidth * 0.45, 300);
  };

  const getStep = () => {
    const base = getBaseStep();
    const visualStep = viewport.clientWidth * 0.34;
    return Math.min(Math.max(base * 1.25, visualStep), 430);
  };

  const updateArrows = () => {
    const max = maxScroll();
    const atStart = viewport.scrollLeft <= 5;
    const atEnd = viewport.scrollLeft >= max - 5 || max <= 5;
    prev.hidden = atStart;
    next.hidden = atEnd;
    pulseArrowOnce(prev);
    pulseArrowOnce(next);
  };

  const animateTo = target => {
    if (activeFrame) cancelAnimationFrame(activeFrame);

    const startLeft = viewport.scrollLeft;
    const endLeft = Math.max(0, Math.min(maxScroll(), target));
    const distance = endLeft - startLeft;

    if (Math.abs(distance) < 2) {
      viewport.scrollLeft = endLeft;
      updateArrows();
      return;
    }

    const previousBehavior = viewport.style.scrollBehavior;
    viewport.style.scrollBehavior = 'auto';
    viewport.classList.add('is-sliding');
    sliding = true;

    const duration = 560;
    let startedAt = null;

    const easeInOutCubic = t =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const frame = now => {
      if (startedAt === null) startedAt = now;
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = easeInOutCubic(progress);

      viewport.scrollLeft = startLeft + distance * eased;
      updateArrows();

      if (progress < 1) {
        activeFrame = requestAnimationFrame(frame);
      } else {
        viewport.scrollLeft = endLeft;
        viewport.style.scrollBehavior = previousBehavior;
        viewport.classList.remove('is-sliding');
        sliding = false;
        activeFrame = null;
        updateArrows();
      }
    };

    activeFrame = requestAnimationFrame(frame);
  };

  prev.addEventListener('click', () => {
    if (sliding) return;
    animateTo(viewport.scrollLeft - getStep());
  });

  next.addEventListener('click', () => {
    if (sliding) return;
    animateTo(viewport.scrollLeft + getStep());
  });

  viewport.addEventListener('scroll', updateArrows, { passive:true });
  window.addEventListener('resize', updateArrows);

  const carousel = viewport.closest('.timeline-carousel') || viewport;
  if ('IntersectionObserver' in window) {
    const introObserver = new IntersectionObserver(entries=>{
      if (!entries.some(entry=>entry.isIntersecting)) return;
      timelineSeen = true;
      updateArrows();
      introObserver.disconnect();
    },{threshold:.22});
    introObserver.observe(carousel);
  } else {
    timelineSeen = true;
  }

  updateArrows();
})();


// episode-one-timeline-lightbox
(() => {
  const dialog = document.querySelector('#timeline-lightbox');
  const image = dialog?.querySelector('[data-timeline-lightbox-image]');
  const close = dialog?.querySelector('[data-close-timeline-lightbox]');
  const caption = dialog?.querySelector('[data-timeline-lightbox-caption]');
  const captionText = dialog?.querySelector('[data-timeline-lightbox-caption-text]');
  const credit = dialog?.querySelector('[data-timeline-lightbox-credit]');
  const captionToggle = dialog?.querySelector('[data-timeline-lightbox-caption-toggle]');
  if (!dialog || !image) return;

  document.querySelectorAll('[data-timeline-image]').forEach(button => {
    button.addEventListener('click', () => {
      const src = button.getAttribute('data-timeline-image');
      const thumb = button.querySelector('img');
      const description = button.getAttribute('data-timeline-caption') || '';
      const creditLabel = button.getAttribute('data-timeline-credit') || '';
      const creditUrl = button.getAttribute('data-timeline-credit-url') || '';
      if (!src) return;

      image.src = src;
      image.alt = thumb?.alt || '';

      if (caption && captionText && credit && (description || (creditLabel && creditUrl))) {
        captionText.textContent = description;
        captionText.hidden = !description;

        if (creditLabel && creditUrl) {
          credit.textContent = creditLabel;
          credit.href = creditUrl;
          credit.hidden = false;
        } else {
          credit.textContent = '';
          credit.removeAttribute('href');
          credit.hidden = true;
        }

        caption.classList.remove('is-expanded');
        if (captionToggle) {
          captionToggle.setAttribute('aria-expanded', 'false');
          captionToggle.setAttribute('aria-label', 'Expandir legenda');
        }
        caption.hidden = false;
      } else if (caption) {
        caption.hidden = true;
      }

      dialog.showModal();
    });
  });

  captionToggle?.addEventListener('click', () => {
    if (!caption) return;
    const expanded = caption.classList.toggle('is-expanded');
    captionToggle.setAttribute('aria-expanded', String(expanded));
    captionToggle.setAttribute('aria-label', expanded ? 'Recolher legenda' : 'Expandir legenda');
  });

  close?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    image.removeAttribute('src');
    image.alt = '';
    if (caption) {
      caption.hidden = true;
      caption.classList.remove('is-expanded');
    }
    if (captionToggle) {
      captionToggle.setAttribute('aria-expanded', 'false');
      captionToggle.setAttribute('aria-label', 'Expandir legenda');
    }
    if (captionText) {
      captionText.textContent = '';
      captionText.hidden = false;
    }
    if (credit) {
      credit.textContent = '';
      credit.removeAttribute('href');
      credit.hidden = false;
    }
  });
})();


// episode-one-timeline-image-skeleton
(() => {
  document.querySelectorAll('.timeline-media').forEach(media => {
    const image = media.querySelector('.timeline-image-button img');
    if (!image) {
      media.classList.add('is-loaded');
      return;
    }

    const showImage = () => {
      media.classList.remove('is-error');
      media.classList.add('is-loaded');
    };

    const showFallback = () => {
      media.classList.remove('is-loaded');
      media.classList.add('is-error');
    };

    if (image.complete) {
      if (image.naturalWidth > 0) showImage();
      else showFallback();
      return;
    }

    image.addEventListener('load', showImage, { once:true });
    image.addEventListener('error', showFallback, { once:true });
  });
})();


// episode-one-desktop-pipe-joint-alignment
(() => {
  const diagram = document.querySelector('.pipe-diagram');
  const pipe = diagram?.querySelector('.desktop-pipe-svg');
  const steps = diagram ? [...diagram.querySelectorAll('.process-step')] : [];
  if (!diagram || !pipe || steps.length < 6) return;

  const desktop = window.matchMedia('(min-width:1025px)');
  const jointX = [955, 1255, 1555, 1855, 2155, 2455];
  const viewBoxWidth = 3410;

  const alignSteps = () => {
    if (!desktop.matches) {
      steps.forEach(step => step.style.removeProperty('--pipe-joint-x'));
      return;
    }

    const diagramRect = diagram.getBoundingClientRect();
    const pipeRect = pipe.getBoundingClientRect();
    if (!pipeRect.width) return;

    jointX.forEach((x, index) => {
      const position = (pipeRect.left - diagramRect.left) + (x / viewBoxWidth) * pipeRect.width;
      steps[index]?.style.setProperty('--pipe-joint-x', `${position}px`);
    });
  };

  const scheduleAlignment = () => requestAnimationFrame(alignSteps);

  if (pipe.complete) scheduleAlignment();
  else pipe.addEventListener('load', scheduleAlignment, { once:true });

  window.addEventListener('resize', scheduleAlignment);
  desktop.addEventListener?.('change', scheduleAlignment);

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleAlignment);
    observer.observe(diagram);
    observer.observe(pipe);
  }

  scheduleAlignment();
})();


// episode-one-mobile-header-menu
(() => {
  const header = document.querySelector('.site-header');
  const toggle = header?.querySelector('.mobile-menu-toggle');
  const nav = header?.querySelector('nav');
  if (!header || !toggle || !nav) return;

  const closeMenu = () => {
    header.classList.remove('is-menu-open');
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label',ep1Ui.openMenu);
  };

  toggle.addEventListener('click', () => {
    const open = !header.classList.contains('is-menu-open');
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? ep1Ui.closeMenu : ep1Ui.openMenu);
  });

  nav.querySelectorAll('a[href^="#"]').forEach(link=>{
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', event=>{
    if (!header.classList.contains('is-menu-open')) return;
    if (header.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener('keydown', event=>{
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('scroll', () => {
    if (header.classList.contains('is-menu-open')) closeMenu();
  }, { passive:true });

  window.matchMedia('(min-width:851px)').addEventListener?.('change', event=>{
    if (event.matches) closeMenu();
  });
})();
