(() => {
  const DURATION = 900;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let busy = false;

  const ease = t => t < .5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;

  function animateTo(targetY, done){
    const startY = window.scrollY;
    const distance = targetY - startY;
    let startTime = null;

    function step(time){
      if(startTime === null) startTime = time;
      const p = Math.min((time-startTime)/DURATION,1);
      window.scrollTo(0,startY + distance*ease(p));
      if(p < 1) requestAnimationFrame(step);
      else done();
    }
    requestAnimationFrame(step);
  }

  function primary(event){
    return event.button===0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  }

  function episodeStage(link){
    const stage=document.createElement("section");
    stage.className="page-flow-stage page-flow-stage--episode";
    const img=link.querySelector(".home-episode-image");
    if(img) stage.style.background="url('"+img.src+"') center/cover no-repeat";
    const kicker=link.querySelector(".home-episode-meta")?.textContent?.trim() || "Episódio";
    const title=link.querySelector("h3")?.textContent?.trim() || "";
    stage.innerHTML='<div class="page-flow-stage-inner"><p class="page-flow-stage-kicker">'+kicker+'</p><h2 class="page-flow-stage-title">'+title+'</h2></div>';
    return stage;
  }

  function homeStage(){
    const stage=document.createElement("section");
    stage.className="page-flow-stage";
    stage.innerHTML='<div class="page-flow-stage-inner"><h2>Episódios</h2><div class="page-flow-home-grid"><div>Por que está faltando água em Piracicaba?</div><div>O desvio que mudou o Rio Piracicaba</div><div>Por que Piracicaba foi buscar água no Corumbataí?</div><div>O que acontece nas margens do Piracicaba?</div></div></div>';
    return stage;
  }

  function goDown(link){
    if(busy) return;
    busy=true;
    if(reduce){ location.href=link.href; return; }

    document.body.classList.add("page-flow-active");
    const stage=episodeStage(link);
    document.body.appendChild(stage);
    const target=stage.getBoundingClientRect().top + window.scrollY;

    animateTo(target,()=>{ location.href=link.href; });
  }

  function goUp(url){
    if(busy) return;
    busy=true;
    if(reduce){ location.href=url; return; }

    document.body.classList.add("page-flow-active");
    const oldY=window.scrollY;
    const stage=homeStage();
    document.body.insertBefore(stage,document.body.firstChild);
    window.scrollTo(0,oldY + stage.offsetHeight);

    animateTo(stage.offsetTop,()=>{ location.href=url; });
  }

  document.addEventListener("DOMContentLoaded",()=>{
    document.querySelectorAll(".home-episode[href^='episodio-']").forEach(link=>{
      link.addEventListener("click",event=>{
        if(!primary(event)) return;
        event.preventDefault();
        goDown(link);
      });
    });

    document.querySelectorAll(".next-episode[href^='episodio-']").forEach(link=>{
      link.addEventListener("click",event=>{
        if(!primary(event)) return;
        event.preventDefault();
        goDown(link);
      });
    });

    if(!document.body.classList.contains("series-home")){
      document.querySelectorAll("a[href^='index.html']").forEach(link=>{
        link.href="index.html#episodios";
        link.addEventListener("click",event=>{
          if(!primary(event)) return;
          event.preventDefault();
          goUp(link.href);
        });
      });
    }
  });
})();
