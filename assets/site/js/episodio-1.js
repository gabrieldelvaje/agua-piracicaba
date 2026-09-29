const fmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const fmtInt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

function parseCSV(text){
  const lines=text.trim().split(/\r?\n/); const headers=lines.shift().split(',');
  return lines.map(line=>{ const cells=line.split(','); return Object.fromEntries(headers.map((h,i)=>[h,cells[i]??''])); });
}
async function loadCSV(path){ const r=await fetch(path); if(!r.ok) throw new Error(path); return parseCSV(await r.text()); }
function pct(a,b){return (b/a-1)*100}
function n(v){return Number(String(v).replace(',','.'))}
function svgEl(name,attrs={}){const e=document.createElementNS('http://www.w3.org/2000/svg',name);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e}
function drawLineChart(svg, series, options={}){
  svg.innerHTML=''; const W=900,H=options.height||320,p={l:55,r:20,t:20,b:40}; const all=series.flatMap(s=>s.values); const minY=options.minY??Math.min(...all.map(d=>d.y)); const maxY=options.maxY??Math.max(...all.map(d=>d.y)); const xs=all.map(d=>d.x); const minX=Math.min(...xs),maxX=Math.max(...xs); const sx=x=>p.l+(x-minX)/(maxX-minX)*(W-p.l-p.r); const sy=y=>H-p.b-(y-minY)/(maxY-minY)*(H-p.t-p.b);
  for(let i=0;i<5;i++){const y=p.t+i*(H-p.t-p.b)/4;svg.append(svgEl('line',{x1:p.l,y1:y,x2:W-p.r,y2:y,class:'grid'})); const value=maxY-i*(maxY-minY)/4; const t=svgEl('text',{x:p.l-10,y:y+4,'text-anchor':'end'});t.textContent=options.yFormat?options.yFormat(value):fmt.format(value);svg.append(t)}
  const years=[minX,Math.round(minX+(maxX-minX)/3),Math.round(minX+2*(maxX-minX)/3),maxX]; years.forEach(x=>{const t=svgEl('text',{x:sx(x),y:H-12,'text-anchor':'middle'});t.textContent=x;svg.append(t)});
  series.forEach((s,idx)=>{const d=s.values.map((v,i)=>(i?'L':'M')+sx(v.x)+','+sy(v.y)).join(' '); const path=svgEl('path',{d,fill:'none',stroke:s.color||['#0736fe','#231f20'][idx%2],'stroke-width':options.strokeWidth||4,'stroke-linejoin':'round','stroke-linecap':'round'});svg.append(path); s.values.forEach((v,i)=>{if(i===0||i===s.values.length-1){svg.append(svgEl('circle',{cx:sx(v.x),cy:sy(v.y),r:5,fill:s.color||'#0736fe'}))}})})
}

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
    drawLineChart(document.querySelector('#consumption-chart'),[{values:c,color:'#0736fe'}],{minY:10,maxY:20});

    const e=econ.filter(d=>n(d.ano)>=1997&&n(d.ano)<=2021).map(d=>({x:n(d.ano),y:n(d.residencial)}));
    const r=network.filter(d=>n(d.ano)>=1997&&n(d.ano)<=2021).map(d=>({x:n(d.ano),y:n(d.agua_rede_existente_m)/1000}));
    document.querySelector('#economies-start').textContent=fmtInt.format(e[0].y); document.querySelector('#economies-end').textContent=fmtInt.format(e.at(-1).y); document.querySelector('#economies-growth').textContent='+'+fmt.format(pct(e[0].y,e.at(-1).y))+'%';
    document.querySelector('#network-start').textContent=fmtInt.format(r[0].y)+' km'; document.querySelector('#network-end').textContent=fmtInt.format(r.at(-1).y)+' km'; document.querySelector('#network-growth').textContent='+'+fmt.format(pct(r[0].y,r.at(-1).y))+'%';
    const ei=e.map(d=>({x:d.x,y:d.y/e[0].y*100})); const ri=r.map(d=>({x:d.x,y:d.y/r[0].y*100}));
    drawLineChart(document.querySelector('#growth-chart'),[{values:ei,color:'#0736fe'},{values:ri,color:'#231f20'}],{height:360,minY:90,maxY:215,yFormat:v=>fmtInt.format(v)});

    const lastLoss=loss.find(d=>d.ano==='2022'); const lossRate=n(lastLoss?.perdas_distribuicao_pct||53.93); window.lossRate=lossRate; document.querySelector('#loss-rate-title').textContent=fmt.format(lossRate)+'%'; document.querySelector('#loss-pira').textContent=fmt.format(lossRate)+'%'; document.querySelector('#loss-pira-bar').style.width=lossRate+'%'; updateWater();

    const validEtas=etas.filter(d=>d.unidade!=='Total'); const max=Math.max(...validEtas.map(d=>n(d.volume_m3))); const list=document.querySelector('#eta-list'); list.innerHTML=validEtas.map(d=>'<div class="eta-row"><div class="eta-head"><span>'+d.unidade+'</span><strong>'+fmt.format(n(d.participacao_pct))+'%</strong></div><div class="eta-track"><i style="width:'+(n(d.volume_m3)/max*100)+'%"></i></div></div>').join('');
  }catch(err){console.warn('Dados não carregados',err)}
}

const quiz=document.querySelector('[data-quiz]'); const result=document.querySelector('[data-quiz-result]'); quiz?.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;quiz.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');result.hidden=false;setTimeout(()=>result.scrollIntoView({behavior:'smooth',block:'start'}),100)});
const slider=document.querySelector('#tons-slider'); function updateWater(){const t=n(slider?.value||7),rate=(window.lossRate||53.93)/100, lost=t*rate, remain=t-lost;document.querySelector('#tons-value').textContent=fmtInt.format(t);document.querySelector('#water-total').textContent=fmt.format(t)+' t';document.querySelector('#water-loss').textContent=fmt.format(lost)+' t';document.querySelector('#water-remaining').textContent=fmt.format(remain)+' t'} slider?.addEventListener('input',updateWater);
const dialog=document.querySelector('#coverage-dialog'); document.querySelector('[data-open-coverage]')?.addEventListener('click',()=>dialog.showModal()); document.querySelector('[data-close-coverage]')?.addEventListener('click',()=>dialog.close()); dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});

initData();

// episode-one-scroll-cue
(() => {
  const cue = document.querySelector('.scroll-cue[href="#caminho"]');
  const target = document.querySelector('#caminho');
  if (!cue || !target) return;

  const easeInOutCubic = t =>
    t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

  cue.addEventListener('click', event => {
    event.preventDefault();

    const root = document.documentElement;
    const body = document.body;
    const previousRootBehavior = root.style.scrollBehavior;
    const previousBodyBehavior = body.style.scrollBehavior;

    root.style.scrollBehavior = 'auto';
    body.style.scrollBehavior = 'auto';

    const header = document.querySelector('.site-header');
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const start = window.scrollY;
    const end = target.getBoundingClientRect().top + window.scrollY - headerHeight;
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
        history.replaceState(null, '', '#caminho');
      }
    };

    requestAnimationFrame(step);
  });
})();


// episode-one-back-to-top
(() => {
  const button = document.querySelector('[data-back-to-top]');
  if (!button) return;

  const media = window.matchMedia('(max-width: 1024px)');

  const updateVisibility = () => {
    const visible = media.matches && window.scrollY > Math.max(520, window.innerHeight * 0.7);
    button.classList.toggle('is-visible', visible);
  };

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', updateVisibility, { passive: true });
  window.addEventListener('resize', updateVisibility);
  media.addEventListener?.('change', updateVisibility);
  updateVisibility();
})();


// episode-one-horizontal-timeline
(() => {
  const viewport = document.querySelector('[data-timeline-viewport]');
  const slider = document.querySelector('[data-timeline-slider]');
  if (!viewport || !slider) return;

  let syncingFromSlider = false;
  let raf = null;

  const maxScroll = () =>
    Math.max(0, viewport.scrollWidth - viewport.clientWidth);

  const paintSlider = value => {
    const clamped = Math.max(0, Math.min(100, value));
    slider.value = String(clamped);
    slider.style.setProperty('--timeline-progress', clamped + '%');
  };

  const syncFromScroll = () => {
    if (syncingFromSlider) return;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const max = maxScroll();
      const value = max > 0 ? (viewport.scrollLeft / max) * 100 : 0;
      paintSlider(value);
    });
  };

  slider.addEventListener('input', () => {
    syncingFromSlider = true;
    const max = maxScroll();
    const value = Number(slider.value);
    paintSlider(value);
    viewport.scrollLeft = max * (value / 100);
    requestAnimationFrame(() => {
      syncingFromSlider = false;
    });
  });

  viewport.addEventListener('scroll', syncFromScroll, { passive:true });
  window.addEventListener('resize', syncFromScroll);

  paintSlider(0);
  syncFromScroll();
})();
