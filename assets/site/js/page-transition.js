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
          const top=target.offsetTop;
          doc.documentElement.style.scrollBehavior="auto";
          doc.body.style.scrollBehavior="auto";
          doc.documentElement.scrollTop=top;
          doc.body.scrollTop=top;
          win.scrollTo(0,top);
        }else{
          doc.documentElement.scrollTop=0;
          doc.body.scrollTop=0;
          win.scrollTo(0,0);
        }
      }else{
        doc.documentElement.style.scrollBehavior="auto";
        doc.body.style.scrollBehavior="auto";
        doc.documentElement.scrollTop=0;
        doc.body.scrollTop=0;
        win.scrollTo(0,0);
      }
    }catch(_){}
  };

  const promoteMobileHome = (stage,frame,destination) => {
    /* The animated Home is already fully rendered and positioned at Episódios.
       Keep that exact document onscreen instead of triggering a second navigation. */
    const clean=new URL(destination.href);
    clean.hash="";
    clean.searchParams.delete("adrReturn");

    history.replaceState(null,"",clean.pathname + (clean.search || ""));
    document.title=frame.contentDocument?.title || document.title;

    stage.classList.add("is-promoted");
    stage.removeAttribute("aria-hidden");
    stage.style.pointerEvents="auto";

    frame.removeAttribute("aria-hidden");
    frame.removeAttribute("tabindex");
    frame.setAttribute("title","Águas do Rio Piracicaba");

    running=false;

    /* page-transition.js intentionally does not run inside preload iframes.
       Bridge only the episode-card clicks back to the top-level transition. */
    try{
      frame.contentDocument.addEventListener("click",event => {
        const link=event.target.closest("a");
        if(!link || !primary(event)) return;

        if(link.matches(".home-episode[href^='episodio-']")){
          event.preventDefault();
          const href=link.getAttribute("href");
          if(href) animateDestination(href,"forward");
        }
      },true);
    }catch(_){}
  };

  const createLoadingOverlay = () => {
    const overlay=document.createElement("div");
    overlay.className="route-loading-overlay";
    overlay.setAttribute("role","status");
    overlay.setAttribute("aria-live","polite");
    overlay.setAttribute("aria-label","Carregando página");
    overlay.innerHTML=
      '<div class="route-loading-indicator">' +
        '<span class="route-loading-spinner" aria-hidden="true"></span>' +
        '<span class="route-loading-label">Carregando</span>' +
      '</div>';

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add("is-visible");
    });

    return overlay;
  };

  const dismissLoadingOverlay = (overlay,callback) => {
    if(!overlay){
      callback?.();
      return;
    }

    overlay.classList.remove("is-visible");
    overlay.classList.add("is-leaving");

    let finished=false;
    const done=() => {
      if(finished) return;
      finished=true;
      overlay.remove();
      callback?.();
    };

    overlay.addEventListener("transitionend",event => {
      if(event.target===overlay && event.propertyName==="opacity") done();
    },{once:true});

    window.setTimeout(done,240);
  };

  const animateDestination=(href,direction) => {
    if(running) return;
    const destination=normalizeDestination(href);
    if(!destination) {
      window.location.href=href;
      return;
    }

    running=true;
    const loadingOverlay=createLoadingOverlay();

    if(!isMobile()){
      body.classList.add("route-transition-lock");
    }

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

      if(direction==="back" && isMobile()){
        promoteMobileHome(stage,frame,destination);
        return;
      }

      window.location.href=destination.href;
    };

    const begin=() => {
      prepareFramePosition(frame,destination,direction);

      dismissLoadingOverlay(loadingOverlay,() => {
        /* Wait two paints so the loaded destination is fully composited before it moves onscreen. */
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
      });
    };

    frame.addEventListener("load",begin,{once:true});

    /* If a browser delays iframe load unusually long, fall back to normal navigation. */
    loadFallback=setTimeout(() => {
      window.location.href=destination.href;
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
