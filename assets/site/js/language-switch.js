(() => {
  const KEY='adr-language-position-v1';
  const root=document.documentElement;

  const basename=pathname => {
    const parts=String(pathname||'').split('/').filter(Boolean);
    return parts.at(-1) || 'index.html';
  };

  const readSaved=() => {
    try{
      const value=JSON.parse(sessionStorage.getItem(KEY)||'null');
      if(!value || typeof value!=='object') return null;
      if(Date.now()-(value.savedAt||0)>30000){
        sessionStorage.removeItem(KEY);
        return null;
      }
      return value;
    }catch(_){
      return null;
    }
  };

  const initial=readSaved();
  if(initial && initial.path===basename(location.pathname)){
    root.classList.add('language-restoring');
  }

  const currentAnchor=() => {
    const y=window.scrollY;
    const probe=y+(document.querySelector('.site-header')?.getBoundingClientRect().height||0)+8;
    const candidates=[
      ...document.querySelectorAll('main[id], main section[id], main article[id]')
    ].filter(el=>el.id);

    let chosen=null;
    for(const el of candidates){
      const top=el.getBoundingClientRect().top+window.scrollY;
      if(top<=probe+1){
        if(!chosen || top>=chosen.top) chosen={el,top};
      }
    }

    if(!chosen){
      return {id:null,offset:y,fallbackY:y};
    }

    return {
      id:chosen.el.id,
      offset:y-chosen.top,
      fallbackY:y
    };
  };

  const restore=() => {
    const saved=readSaved();
    if(!saved || saved.path!==basename(location.pathname)){
      root.classList.remove('language-restoring');
      return;
    }

    const apply=() => {
      let y=Number(saved.fallbackY)||0;
      if(saved.id){
        const target=document.getElementById(saved.id);
        if(target){
          y=target.getBoundingClientRect().top+window.scrollY+(Number(saved.offset)||0);
        }
      }
      const max=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
      window.scrollTo({top:Math.max(0,Math.min(max,y)),left:0,behavior:'auto'});
    };

    apply();
    requestAnimationFrame(() => {
      apply();
      requestAnimationFrame(() => {
        root.classList.remove('language-restoring');
        sessionStorage.removeItem(KEY);
      });
    });
  };

  const setup=() => {
    document.querySelectorAll('[data-language-link]').forEach(link => {
      link.addEventListener('click',event => {
        if(event.defaultPrevented) return;
        if(event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        const destination=new URL(link.href,location.href);
        const position=currentAnchor();

        try{
          sessionStorage.setItem(KEY,JSON.stringify({
            path:basename(destination.pathname),
            id:position.id,
            offset:position.offset,
            fallbackY:position.fallbackY,
            savedAt:Date.now()
          }));
        }catch(_){}

        event.preventDefault();

        // Keep language navigation inside the current browsing context.
        // When the series is embedded in the portfolio, this prevents the
        // language switch from escaping the iframe and replacing the portfolio.
        window.location.href=destination.href;
      });
    });

    restore();
  };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',setup,{once:true});
  }else{
    setup();
  }
})();

/* Fecha o dropdown ao clicar fora ou pressionar Escape. */
(() => {
  const closeAll = except => {
    document.querySelectorAll('details.language-menu[open]').forEach(menu => {
      if(menu!==except) menu.removeAttribute('open');
    });
  };

  document.addEventListener('click', event => {
    const menu=event.target.closest('details.language-menu');
    if(!menu) closeAll(null);
    else closeAll(menu);
  });

  document.addEventListener('keydown', event => {
    if(event.key==='Escape'){
      closeAll(null);
      document.activeElement?.blur?.();
    }
  });
})();


// episode-reading-progress
(() => {
  const setupReadingProgress = () => {
    const header = document.querySelector('.site-header');
    const main = document.querySelector('main');
    if (!header || !main) return;

    let progress = header.querySelector('.episode-reading-progress');
    if (!progress) {
      progress = document.createElement('div');
      progress.className = 'episode-reading-progress';
      progress.setAttribute('aria-hidden', 'true');
      progress.innerHTML = '<span></span>';
      header.appendChild(progress);
    }

    const fill = progress.querySelector('span');
    if (!fill) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
      fill.style.transform = 'scaleX(' + ratio.toFixed(5) + ')';
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestUpdate, { passive:true });
    window.addEventListener('resize', requestUpdate);
    window.addEventListener('load', requestUpdate, { once:true });
    document.fonts?.ready?.then(requestUpdate).catch?.(() => {});
    requestUpdate();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupReadingProgress, { once:true });
  } else {
    setupReadingProgress();
  }
})();
