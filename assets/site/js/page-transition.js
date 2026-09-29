(() => {
  /* Do not install route interception inside the preloaded destination iframe. */
  if(window.self !== window.top) return;

  const body=document.body;
  const root=document.documentElement;
  const isMobile=() => window.matchMedia("(max-width:850px)").matches;
  let running=false;

  const primary=event =>
    event.button===0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey;

  const normalizeDestination=href => {
    try{
      return new URL(href,window.location.href);
    }catch(_){
      return null;
    }
  };

  const prepareFramePosition=(frame,destination,direction) => {
    try{
      const win=frame.contentWindow;
      const doc=frame.contentDocument;
      if(!win || !doc) return;

      if(direction==="back"){
        const hash=destination.hash || "#episodios";
        const target=hash ? doc.querySelector(hash) : null;
        if(target){
          const top=target.getBoundingClientRect().top + win.scrollY;
          win.scrollTo({top,left:0,behavior:"auto"});
        }else{
          win.scrollTo({top:0,left:0,behavior:"auto"});
        }
      }else{
        win.scrollTo({top:0,left:0,behavior:"auto"});
      }
    }catch(_){}
  };

  const animateDestination=(href,direction) => {
    if(running) return;
    const destination=normalizeDestination(href);
    if(!destination) {
      window.location.href=href;
      return;
    }

    running=true;
    body.classList.add("route-transition-lock");

    const stage=document.createElement("div");
    stage.className="route-page-stage" + (direction==="back" ? " from-top" : "");
    stage.setAttribute("aria-hidden","true");

    const frame=document.createElement("iframe");
    frame.setAttribute("title","");
    frame.setAttribute("tabindex","-1");
    frame.setAttribute("aria-hidden","true");
    frame.src=destination.href;

    stage.appendChild(frame);
    document.body.appendChild(stage);

    let navigated=false;
    let loadFallback=null;

    const navigate=() => {
      if(navigated) return;
      navigated=true;
      if(loadFallback) clearTimeout(loadFallback);

      let finalHref=destination.href;

      if(direction==="back" && isMobile()){
        const clean=new URL(destination.href);
        clean.hash="";
        clean.searchParams.set("adrReturn","episodes");
        finalHref=clean.href;
      }

      window.location.href=finalHref;
    };

    const begin=() => {
      prepareFramePosition(frame,destination,direction);

      /* Wait two paints so the destination has actually rendered before moving it onscreen. */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          stage.classList.add("is-active");
        });
      });

      let ended=false;
      const finish=() => {
        if(ended) return;
        ended=true;
        navigate();
      };

      const onEnd=event => {
        if(event.target===stage && event.propertyName==="transform"){
          stage.removeEventListener("transitionend",onEnd);
          finish();
        }
      };
      stage.addEventListener("transitionend",onEnd);
      setTimeout(finish,1100);
    };

    frame.addEventListener("load",begin,{once:true});

    /* If a browser delays iframe load unusually long, fall back to normal navigation. */
    loadFallback=setTimeout(() => {
      let finalHref=destination.href;
      if(direction==="back" && isMobile()){
        const clean=new URL(destination.href);
        clean.hash="";
        clean.searchParams.set("adrReturn","episodes");
        finalHref=clean.href;
      }
      window.location.href=finalHref;
    },5000);
  };

  const settleMobileHome = () => {
    if(!body.classList.contains("series-home") || !isMobile()) return;

    const params=new URLSearchParams(location.search);
    const returning=params.get("adrReturn")==="episodes";

    if("scrollRestoration" in history){
      history.scrollRestoration="manual";
    }

    if(returning){
      const target=document.getElementById("episodios");
      const top=target ? target.offsetTop : 0;

      window.scrollTo({top,left:0,behavior:"auto"});

      requestAnimationFrame(() => {
        window.scrollTo({top,left:0,behavior:"auto"});
      });

      const cleanUrl=new URL(location.href);
      cleanUrl.searchParams.delete("adrReturn");
      cleanUrl.hash="";
      history.replaceState(null,"",cleanUrl.pathname + (cleanUrl.search || ""));
    }else{
      if(location.hash){
        history.replaceState(null,"",location.pathname+location.search);
      }
      window.scrollTo({top:0,left:0,behavior:"auto"});
    }

    requestAnimationFrame(() => {
      if(returning){
        const target=document.getElementById("episodios");
        const top=target ? target.offsetTop : 0;
        window.scrollTo({top,left:0,behavior:"auto"});
      }

      requestAnimationFrame(() => {
        root.classList.remove("mobile-home-return","mobile-home-reset");
      });
    });
  };

  settleMobileHome();

  document.addEventListener("click",event => {
    const link=event.target.closest("a");
    if(!link || !primary(event)) return;

    const href=link.getAttribute("href") || "";

    /* Home cards -> real episode page rises from below. */
    if(
      body.classList.contains("series-home") &&
      link.matches(".home-episode[href^='episodio-']")
    ){
      event.preventDefault();
      animateDestination(href,"forward");
      return;
    }

    /* Episode header/back links -> real Home page descends from above,
       already positioned at the episodes section. */
    if(
      !body.classList.contains("series-home") &&
      href.startsWith("index.html")
    ){
      event.preventDefault();
      const destination=href.includes("#") ? href : "index.html#episodios";
      animateDestination(destination,"back");
    }
  },true);
})();
