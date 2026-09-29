(() => {
  const KEY="adr-vt-direction";
  const body=document.body;
  const root=document.documentElement;

  const primary=event =>
    event.button===0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey;

  const setDirection=direction => {
    try{sessionStorage.setItem(KEY,direction)}catch(_){}
  };

  const clearDirection=() => {
    try{sessionStorage.removeItem(KEY)}catch(_){}
    root.classList.remove("route-forward","route-back");
  };

  const currentDirection=() => {
    try{return sessionStorage.getItem(KEY)}catch(_){return null}
  };

  /* On return, force the actual Home document to the episodes section before
     the browser paints the new-page snapshot used by the transition. */
  const placeHomeAtEpisodes=() => {
    if(
      currentDirection()==="back" &&
      body.classList.contains("series-home")
    ){
      const target=document.getElementById("episodios");
      if(target){
        target.scrollIntoView({block:"start",inline:"nearest",behavior:"auto"});
      }
    }
  };

  placeHomeAtEpisodes();

  document.addEventListener("click",event => {
    const link=event.target.closest("a");
    if(!link || !primary(event)) return;

    const href=link.getAttribute("href") || "";

    if(
      body.classList.contains("series-home") &&
      link.matches(".home-episode[href^='episodio-']")
    ){
      setDirection("forward");
      return;
    }

    if(
      !body.classList.contains("series-home") &&
      href.startsWith("index.html")
    ){
      setDirection("back");
      return;
    }

    if(link.matches(".next-episode[href^='episodio-']")){
      setDirection("forward");
    }
  },true);

  /* pagereveal is the cross-document View Transition hook in the new page.
     Keep the route class until the transition finishes, then clean state. */
  window.addEventListener("pagereveal",event => {
    placeHomeAtEpisodes();

    if(event.viewTransition){
      event.viewTransition.finished.finally(clearDirection);
    }else{
      window.setTimeout(clearDirection,1100);
    }
  });

  /* Fallback for browsers that do not expose pagereveal. */
  window.addEventListener("pageshow",() => {
    placeHomeAtEpisodes();
    window.setTimeout(() => {
      if(!document.startViewTransition && !("ViewTransition" in window)){
        clearDirection();
      }
    },1200);
  });
})();
