(() => {
  /* Do not install route interception inside the preloaded destination iframe. */
  if(window.self !== window.top) return;

  const body=document.body;
  const root=document.documentElement;
  const english=String(root.lang||"").toLowerCase().startsWith("en");
  const ui=english ? {
    loading:"Loading page",
    series:"Waters of the Piracicaba River",
    openMenu:"Open episode menu",
    closeMenu:"Close episode menu"
  } : {
    loading:"Carregando página",
    series:"Águas do Rio Piracicaba",
    openMenu:"Abrir menu do episódio",
    closeMenu:"Fechar menu do episódio"
  };
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

  const promoteHome = (stage,frame,destination) => {
    /* The animated Home is already fully rendered and positioned at Episódios.
       Keep that exact document onscreen instead of triggering a second navigation. */
    const clean=new URL(destination.href);
    clean.hash="";
    clean.searchParams.delete("adrReturn");

    history.replaceState(null,"",clean.pathname + (clean.search || ""));
    document.title=frame.contentDocument?.title || document.title;

    body.classList.remove("route-transition-lock");
    stage.classList.add("is-promoted");
    stage.removeAttribute("aria-hidden");
    stage.style.pointerEvents="auto";

    frame.removeAttribute("aria-hidden");
    frame.removeAttribute("tabindex");
    const frameEnglish=String(frame.contentDocument?.documentElement?.lang||"").toLowerCase().startsWith("en");
    frame.setAttribute("title",frameEnglish ? "Waters of the Piracicaba River" : "Águas do Rio Piracicaba");

    running=false;

    /* page-transition.js intentionally does not run inside preload iframes.
       Bridge episode-card clicks back to the top-level transition so the
       promoted Home behaves exactly like the normal Home on every viewport. */
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
    overlay.setAttribute("aria-label",ui.loading);
    overlay.innerHTML=
      '<div class="route-loading-indicator">' +
        '<span class="route-loading-spinner" aria-hidden="true"></span>' +
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

      if(direction==="back"){
        promoteHome(stage,frame,destination);
        return;
      }

      window.location.href=destination.href;
    };

    const begin=() => {
      prepareFramePosition(frame,destination,direction);

      /* Force a known background inside the loaded document so the browser
         never exposes its default white canvas between paints. */
      try{
        const doc=frame.contentDocument;
        if(doc){
          doc.documentElement.style.background="#F3F3F1";
          if(doc.body) doc.body.style.backgroundColor="#F3F3F1";
        }
      }catch(_){}

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

      /* Keep the loading cover in place until the destination has been
         positioned and composited. Then start the movement first and only
         afterwards fade the cover, avoiding a blank frame in between. */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          stage.classList.add("is-frame-ready");
          stage.classList.add("is-active");

          requestAnimationFrame(() => {
            dismissLoadingOverlay(loadingOverlay);
          });
        });
      });

      setTimeout(finish,1100);
    };

    frame.addEventListener("load",begin,{once:true});

    /* If a browser delays iframe load unusually long, fall back to normal navigation. */
    loadFallback=setTimeout(() => {
      window.location.href=destination.href;
    },5000);
  };

  const settleHome = () => {
    if(!body.classList.contains("series-home")) return;

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
    }else if(isMobile()){
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
        root.classList.remove("home-episodes-return","mobile-home-reset");
      });
    });
  };

  settleHome();

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
      (href.startsWith("index.html") || href.startsWith("index-en.html"))
    ){
      event.preventDefault();
      const requested=href.includes("#") ? href : "index.html#episodios";
      const returnUrl=new URL(requested,window.location.href);
      returnUrl.searchParams.set("adrReturn","episodes");
      animateDestination(returnUrl.href,"back");
    }
  },true);
})();


// episode-three-four-header-navigation
(() => {
  const body = document.body;
  if (!body.classList.contains('episode-3') && !body.classList.contains('episode-4')) return;

  const header = document.querySelector('.site-header');
  const toggle = header?.querySelector('.mobile-menu-toggle');
  const nav = header?.querySelector('nav');
  if (!header || !toggle || !nav) return;

  const closeMenu = () => {
    header.classList.remove('is-menu-open');
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label',ui.openMenu);
  };

  toggle.addEventListener('click', () => {
    const open = !header.classList.contains('is-menu-open');
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? ui.closeMenu : ui.openMenu);
  });

  document.addEventListener('click', event => {
    if (!header.classList.contains('is-menu-open')) return;
    if (header.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('scroll', () => {
    if (header.classList.contains('is-menu-open')) closeMenu();
  }, { passive:true });

  window.matchMedia('(min-width:851px)').addEventListener?.('change', event => {
    if (event.matches) closeMenu();
  });

  const triggers = [
    ...nav.querySelectorAll('a[href^="#"]'),
    ...document.querySelectorAll('.episode-scroll-cue[href^="#"]')
  ];

  const easeInOutCubic = t =>
    t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

  const animateToTarget = (target, hash) => {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';

    const headerHeight = header.getBoundingClientRect().height;
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
        root.style.scrollBehavior = previousBehavior;
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
      closeMenu();
      animateToTarget(target, hash);
    });
  });
})();
