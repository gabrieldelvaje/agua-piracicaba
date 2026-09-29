(() => {
  const KEY = "adr-route-panel";
  const root = document.documentElement;
  const body = document.body;

  const EPISODES = {
    "episodio-1.html": {
      label: "Episódio 1",
      title: "Por que está faltando água em Piracicaba?",
      image: "assets/site/episodes/episodio-1-museu-da-agua-antigo.jpg"
    },
    "episodio-2.html": {
      label: "Episódio 2",
      title: "O desvio que mudou o Rio Piracicaba",
      image: "assets/site/cards/episodio-2-caixao.jpg"
    },
    "episodio-3.html": {
      label: "Episódio 3",
      title: "Por que Piracicaba foi buscar água no Corumbataí?",
      image: "assets/site/cards/episodio-3-rio-seco.jpg"
    },
    "episodio-4.html": {
      label: "Episódio 4",
      title: "O que acontece nas margens do Piracicaba?",
      image: "assets/site/cards/episodio-4-boia-rio.jpg"
    }
  };

  const cleanHref = href => {
    try{
      return new URL(href, window.location.href).pathname.split("/").pop() || "";
    }catch(_){
      return "";
    }
  };

  const primaryClick = event =>
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey;

  const saveState = state => {
    try{ sessionStorage.setItem(KEY, JSON.stringify(state)); }catch(_){}
  };

  const readState = () => {
    try{
      const raw = sessionStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    }catch(_){
      return null;
    }
  };

  const clearState = () => {
    try{ sessionStorage.removeItem(KEY); }catch(_){}
  };

  const currentEpisodeMeta = () => {
    const file = window.location.pathname.split("/").pop() || "";
    const known = EPISODES[file] || {};
    return {
      label: known.label || "Episódio",
      title: document.querySelector("main h1")?.textContent?.trim() || known.title || "Águas do Rio Piracicaba",
      image: known.image || ""
    };
  };

  const homeCardMeta = link => {
    const file = cleanHref(link.getAttribute("href") || "");
    const known = EPISODES[file] || {};
    return {
      label: link.querySelector(".home-episode-meta span")?.textContent?.trim() || known.label || "Episódio",
      title: link.querySelector("h3")?.textContent?.trim() || known.title || "Águas do Rio Piracicaba",
      image: known.image || link.querySelector("img")?.getAttribute("src") || ""
    };
  };

  const buildPanel = meta => {
    const panel = document.createElement("div");
    panel.className = "route-panel";
    panel.setAttribute("aria-hidden", "true");

    if(meta.image){
      panel.style.setProperty("--route-image", 'url("' + meta.image.replace(/"/g, "%22") + '")');
    }

    panel.innerHTML =
      '<div class="route-panel-media"></div>' +
      '<div class="route-panel-shade"></div>' +
      '<div class="route-panel-topbar">' +
        '<span>Águas do Rio Piracicaba</span>' +
        '<span>' + (meta.label || "Episódio") + '</span>' +
      '</div>' +
      '<div class="route-panel-copy">' +
        '<span class="route-panel-kicker">' + (meta.label || "Episódio") + '</span>' +
        '<h2></h2>' +
      '</div>';

    panel.querySelector("h2").textContent = meta.title || "";
    return panel;
  };

  const finishOnTransition = (panel, callback) => {
    let done = false;
    const finish = () => {
      if(done) return;
      done = true;
      panel.removeEventListener("transitionend", onEnd);
      callback();
    };
    const onEnd = event => {
      if(event.target === panel && event.propertyName === "transform") finish();
    };
    panel.addEventListener("transitionend", onEnd);
    window.setTimeout(finish, 1100);
  };

  const coverAndNavigate = (href, meta) => {
    const panel = buildPanel(meta);
    body.classList.add("route-transition-lock");
    body.appendChild(panel);

    // Store only enough data to survive a slow navigation or browser repaint.
    saveState({ direction: "forward", meta });

    panel.getBoundingClientRect();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => panel.classList.add("is-covering"));
    });

    finishOnTransition(panel, () => {
      window.location.href = href;
    });
  };

  const revealHome = state => {
    const target = document.getElementById("episodios");
    if(target){
      if("scrollRestoration" in history) history.scrollRestoration = "manual";
      const top = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, left:0, behavior:"auto" });
    }

    const panel = buildPanel(state.meta || {});
    panel.classList.add("is-covering");
    body.appendChild(panel);
    root.classList.remove("route-back-pending");
    body.classList.add("route-transition-lock");
    clearState();

    panel.getBoundingClientRect();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => panel.classList.add("is-revealing"));
    });

    finishOnTransition(panel, () => {
      panel.remove();
      body.classList.remove("route-transition-lock");
    });
  };

  const state = readState();

  if(body.classList.contains("series-home")){
    if(state?.direction === "back"){
      revealHome(state);
    }else{
      root.classList.remove("route-back-pending");
      if(state?.direction === "forward") clearState();
    }
  }else if(state?.direction === "forward"){
    // Forward animation already completed on the home page.
    clearState();
  }

  document.addEventListener("click", event => {
    const link = event.target.closest("a");
    if(!link || !primaryClick(event)) return;

    const rawHref = link.getAttribute("href") || "";

    if(
      body.classList.contains("series-home") &&
      link.matches(".home-episode[href^='episodio-']")
    ){
      event.preventDefault();
      coverAndNavigate(rawHref, homeCardMeta(link));
      return;
    }

    if(
      !body.classList.contains("series-home") &&
      rawHref.startsWith("index.html")
    ){
      event.preventDefault();
      saveState({ direction: "back", meta: currentEpisodeMeta() });
      window.location.href = "index.html#episodios";
    }
  }, true);
})();
